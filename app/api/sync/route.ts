import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // allow up to 60s (parsing + AI)

const MODEL = 'claude-sonnet-4-6';
const SHORT_POST_THRESHOLD = 280;

// Channels to keep in sync. (Under-себя: own channels only for now.)
const CHANNELS = ['smart_day_trader'];

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ---- parsing (same logic that works server-side) -----------
async function parseChannel(username: string) {
  const res = await fetch(`https://t.me/s/${username}`, { headers: BROWSER_HEADERS, cache: 'no-store' });
  if (!res.ok) throw new Error(`fetch failed ${res.status}`);
  const html = await res.text();
  if (!html.includes('data-post=')) throw new Error('no posts (private/empty/redirect)');

  const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? username;
  const description = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ?? '';

  const textRegex = /class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/;
  const dateRegex = /datetime="([^"]+)"/;
  const linkRegex = /href="(https?:\/\/[^"]+)"/g;
  const imgSrcRegex = /src="(https:\/\/cdn[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/g;
  const imgBgRegex = /background-image:\s*url\(['"]?(https:\/\/cdn[^'")]+)['"]?\)/g;

  const posts: { id: string; text: string; date: string | null; links: string[]; images: string[] }[] = [];
  const blocks = html.split('data-post=');
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const idMatch = block.match(/^"[^/]+\/(\d+)"/);
    if (!idMatch) continue;
    const id = idMatch[1];

    const textMatch = block.match(textRegex);
    let text = '';
    if (textMatch) {
      text = textMatch[1]
        .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
    }
    if (!text || text.length < 5) continue;

    let date: string | null = null;
    const dateMatch = block.match(dateRegex);
    if (dateMatch) { try { date = new Date(dateMatch[1]).toISOString(); } catch {} }

    const links: string[] = [];
    let lm;
    while ((lm = linkRegex.exec(block)) !== null) {
      if (!lm[1].includes('t.me') && !links.includes(lm[1])) links.push(lm[1]);
    }

    const allImages: string[] = [];
    let im;
    while ((im = imgSrcRegex.exec(block)) !== null) if (!allImages.includes(im[1])) allImages.push(im[1]);
    while ((im = imgBgRegex.exec(block)) !== null) if (!allImages.includes(im[1])) allImages.push(im[1]);
    const images = allImages.filter((src) => {
      const idx = block.indexOf(src);
      if (idx === -1) return false;
      const ctx = block.slice(Math.max(0, idx - 500), idx);
      if (/user_photo|page_photo|userpic|tgme_header|bot_photo/.test(ctx)) return false;
      if (/message_photo|media_photo|grouped_media|video_thumb|message_video/.test(ctx)) return true;
      return false;
    });

    posts.push({ id, text, date, links, images });
  }
  return { username, title, description, posts };
}

// ---- link previews -----------------------------------------
async function fetchLinkPreview(url: string) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(url, { headers: BROWSER_HEADERS, signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const html = await res.text();
    const og = (p: string) =>
      html.match(new RegExp(`<meta[^>]+property="og:${p}"[^>]+content="([^"]*)"`, 'i'))?.[1]
      ?? html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="og:${p}"`, 'i'))?.[1] ?? null;
    const dec = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
    const title = og('title') ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? url;
    const description = og('description') ?? html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] ?? '';
    return { url, title: dec(title).trim(), description: dec(description).trim().slice(0, 200), image: og('image') ? dec(og('image')!).trim() : null, siteName: og('site_name') ? dec(og('site_name')!).trim() : null };
  } catch { return null; }
}

// ---- AI enrichment -----------------------------------------
function buildPrompt(text: string, isShort: boolean) {
  return `You are an SEO editor for a website that republishes Telegram channel posts as searchable web pages. The channel is about trading, markets, and financial indicators.

Given the raw post text below, produce JSON metadata that will help the page rank in Google and read well to a human who found it via search.

RAW POST:
"""
${text}
"""

Return ONLY a JSON object (no markdown, no backticks, no commentary) with these fields:
- "title": a clear, specific SEO title (40-70 chars). Capture the real topic, not just the first sentence. No clickbait, no emojis.
- "description": a meta description (120-155 chars) summarizing the post for search results. Natural language, includes the key topic.
- "tags": an array of 3-5 lowercase topical tags relevant to trading/markets/finance.
${isShort
  ? `- "enriched_text": the post is very short and would make a weak SEO page. Rewrite and EXPAND it into 2-4 short paragraphs of genuinely useful, accurate context, preserving the original meaning and any specific facts/tickers. Do NOT invent fake data, prices, or quotes. Write in clear English.`
  : `- "enriched_text": null (the post is long enough as-is).`}

Output JSON only.`;
}

async function enrich(text: string) {
  const isShort = text.length < SHORT_POST_THRESHOLD;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 1200, messages: [{ role: 'user', content: buildPrompt(text, isShort) }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`AI ${res.status}`);
  const raw = (data.content || []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('');
  const parsed = JSON.parse(raw.replace(/```json/gi, '').replace(/```/g, '').trim());
  return {
    ai_title: typeof parsed.title === 'string' ? parsed.title.slice(0, 120) : null,
    ai_description: typeof parsed.description === 'string' ? parsed.description.slice(0, 200) : null,
    ai_tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    ai_enriched_text: typeof parsed.enriched_text === 'string' && parsed.enriched_text.trim() ? parsed.enriched_text.trim() : null,
  };
}

// ---- the cron handler --------------------------------------
export async function GET(req: NextRequest) {
  // Protect: only allow calls with the correct secret.
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const db = getAdminClient();
  const report: Record<string, unknown>[] = [];

  for (const username of CHANNELS) {
    try {
      const channel = await parseChannel(username);

      // upsert channel
      const { data: ch, error: chErr } = await db
        .from('channels')
        .upsert({ username, title: channel.title, description: channel.description, is_own: true }, { onConflict: 'username' })
        .select().single();
      if (chErr) throw chErr;

      // existing post ids
      const { data: existing } = await db.from('posts').select('tg_post_id').eq('channel_id', ch.id);
      const known = new Set((existing ?? []).map((r: { tg_post_id: string }) => r.tg_post_id));

      const newPosts = channel.posts.filter((p) => !known.has(p.id));
      let added = 0;

      for (const p of newPosts) {
        // link previews
        let previews: unknown[] = [];
        if (p.links.length) previews = (await Promise.all(p.links.slice(0, 2).map(fetchLinkPreview))).filter(Boolean);

        // AI enrichment
        let ai = { ai_title: null as string | null, ai_description: null as string | null, ai_tags: [] as string[], ai_enriched_text: null as string | null };
        try { ai = await enrich(p.text); } catch (e) { console.error(`[sync] AI failed for #${p.id}`, e); }

        const { error: insErr } = await db.from('posts').insert({
          channel_id: ch.id,
          tg_post_id: p.id,
          raw_text: p.text,
          date: p.date,
          images: p.images,
          links: p.links,
          link_previews: previews,
          ...ai,
          ai_processed: ai.ai_title !== null,
        });
        if (!insErr) added++;
      }

      report.push({ channel: username, total: channel.posts.length, new: newPosts.length, added });
    } catch (e) {
      report.push({ channel: username, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return NextResponse.json({ ok: true, report });
}
