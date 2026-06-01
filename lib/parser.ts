export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
}

export interface Post {
  id: string;
  text: string;
  date: string | null;
  links: string[];
  images: string[];
  linkPreviews?: LinkPreview[];
}

export interface Channel {
  username: string;
  title: string;
  description: string;
  posts: Post[];
}

export async function parseChannel(username: string): Promise<Channel> {
  const url = `https://t.me/s/${username}`;
  const res = await fetch(url, {
    headers: {
      // Use a realistic browser UA. Telegram sometimes serves a stripped-down
      // page to non-browser user agents, which made the parser see no posts.
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Failed to fetch channel: ${res.status}`);
  const html = await res.text();

  // Decide "channel exists" by whether the page actually contains posts,
  // not by a single marker class (which Telegram may omit depending on UA).
  const hasPosts = html.includes('data-post=');
  const hasChannelInfo = html.includes('tgme_channel_info');
  if (!hasPosts && !hasChannelInfo) {
    throw new Error('Channel not found or private');
  }

  const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? username;
  const description = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ?? '';

  const posts: Post[] = [];
  const postRegex = /data-post="[^/]+\/(\d+)"[\s\S]*?(?=data-post="|<\/section>)/g;
  const textRegex = /class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/;
  const dateRegex = /datetime="([^"]+)"/;
  const linkRegex = /href="(https?:\/\/[^"]+)"/g;
  // Telegram serves photos both as <img src> and as background-image:url('...')
  const imgSrcRegex = /src="(https:\/\/cdn[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/g;
  const imgBgRegex = /background-image:\s*url\(['"]?(https:\/\/cdn[^'")]+)['"]?\)/g;

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
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    }

    if (!text || text.length < 5) continue;

    const dateMatch = block.match(dateRegex);
    let date: string | null = null;
    if (dateMatch) {
      try {
        date = new Date(dateMatch[1]).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
      } catch {}
    }

    const links: string[] = [];
    let lm;
    while ((lm = linkRegex.exec(block)) !== null) {
      if (!lm[1].includes('t.me') && !links.includes(lm[1])) links.push(lm[1]);
    }

    const images: string[] = [];
    let im;
    while ((im = imgSrcRegex.exec(block)) !== null) {
      if (!images.includes(im[1])) images.push(im[1]);
    }
    while ((im = imgBgRegex.exec(block)) !== null) {
      if (!images.includes(im[1])) images.push(im[1]);
    }

    // Filter out the channel avatar / user pictures.
    // On t.me/s/ a real post photo sits inside an element whose class
    // contains "message_photo" / "media_photo" / "grouped_media" / "video_thumb".
    // Avatars use "user_photo" / "page_photo" / "userpic" / "tgme_header".
    // We look at the HTML right before each image URL to decide.
    const realImages = images.filter(src => {
      const idx = block.indexOf(src);
      if (idx === -1) return false;
      const ctx = block.slice(Math.max(0, idx - 500), idx);
      // hard reject: anything that looks like an avatar
      if (/user_photo|page_photo|userpic|tgme_header|bot_photo/.test(ctx)) return false;
      // accept: clearly a post media element
      if (/message_photo|media_photo|grouped_media|video_thumb|message_video/.test(ctx)) return true;
      // otherwise reject to be safe (covers the channel logo case)
      return false;
    });

    posts.push({ id, text, date, links, images: realImages });
  }

  return { username, title, description, posts: posts.slice(-20) };
}

// Fetch Open Graph preview for a single URL (like Telegram does)
export async function fetchLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TGPostBot/1.0)' },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const og = (prop: string) =>
      html.match(new RegExp(`<meta[^>]+property="og:${prop}"[^>]+content="([^"]*)"`, 'i'))?.[1]
      ?? html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+property="og:${prop}"`, 'i'))?.[1]
      ?? null;

    const title = og('title') ?? html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? url;
    const description = og('description')
      ?? html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] ?? '';
    const image = og('image');
    const siteName = og('site_name');

    const decode = (s: string) => s
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");

    return {
      url,
      title: decode(title).trim(),
      description: decode(description).trim().slice(0, 200),
      image,
      siteName: siteName ? decode(siteName).trim() : null,
    };
  } catch {
    return null;
  }
}

// Enrich a channel's posts with link previews (run in parallel, capped)
export async function enrichWithLinkPreviews(channel: Channel): Promise<Channel> {
  const postsWithLinks = channel.posts.filter(p => p.links.length > 0);
  await Promise.all(
    postsWithLinks.map(async (post) => {
      const previews = await Promise.all(
        post.links.slice(0, 2).map(link => fetchLinkPreview(link))
      );
      post.linkPreviews = previews.filter((p): p is LinkPreview => p !== null);
    })
  );
  return channel;
}

export function generateTitle(text: string): string {
  const clean = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();
  const first = clean.split(/[.\n!?]/)[0].trim();
  if (first.length >= 10 && first.length <= 80) return first;
  return clean.substring(0, 70).trim() + (clean.length > 70 ? '…' : '');
}

export function generateDescription(text: string): string {
  const clean = text
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();
  return clean.substring(0, 155).trim() + (clean.length > 155 ? '…' : '');
}

export function generateTags(post: Post): string[] {
  const tags: string[] = [];
  const t = post.text.toLowerCase();
  if (post.links.some(l => l.includes('tradingview'))) tags.push('TradingView');
  if (t.includes('indicator') || t.includes('oscillator')) tags.push('indicator');
  if (t.includes('psychology') || t.includes('mindset') || t.includes('emotion')) tags.push('psychology');
  if (t.includes('strategy') || t.includes('methodology')) tags.push('strategy');
  if (t.includes('bitcoin') || t.includes('btc') || t.includes('crypto')) tags.push('crypto');
  if (t.includes('market') || t.includes('price') || t.includes('trade')) tags.push('trading');
  if (post.links.some(l => l.includes('bloomberg') || l.includes('reuters'))) tags.push('macro');
  return tags.slice(0, 3);
}
