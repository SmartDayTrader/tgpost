export interface Post {
  id: string;
  text: string;
  date: string | null;
  links: string[];
  images: string[];
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
      'User-Agent': 'Mozilla/5.0 (compatible; TGPostBot/1.0)',
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Failed to fetch channel: ${res.status}`);
  const html = await res.text();

  if (!html.includes('tgme_channel_info')) {
    throw new Error('Channel not found or private');
  }

  const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? username;
  const description = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] ?? '';

  const posts: Post[] = [];
  const postRegex = /data-post="[^/]+\/(\d+)"[\s\S]*?(?=data-post="|<\/section>)/g;
  const textRegex = /class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/;
  const dateRegex = /datetime="([^"]+)"/;
  const linkRegex = /href="(https?:\/\/[^"]+)"/g;
  const imgRegex = /src="(https:\/\/cdn[^"]+\.(?:jpg|jpeg|png|webp))"/g;

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
    while ((im = imgRegex.exec(block)) !== null) {
      if (!images.includes(im[1])) images.push(im[1]);
    }

    posts.push({ id, text, date, links, images });
  }

  return { username, title, description, posts: posts.slice(-20) };
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
