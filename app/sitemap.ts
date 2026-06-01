import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.tgpost.pro';
const CHANNELS = ['Smart-Day-Trader'];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
  ];

  for (const username of CHANNELS) {
    entries.push({
      url: `${BASE_URL}/channel/${username}`,
      changeFrequency: 'daily',
      priority: 0.8,
    });

    // RAW DIAGNOSTIC: fetch t.me directly here and report what Telegram returns
    // to Vercel's servers. Encoded into a visible URL.
    let diag = 'unknown';
    try {
      const res = await fetch(`https://t.me/s/${username}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cache: 'no-store',
      });
      const html = await res.text();
      const status = res.status;
      const len = html.length;
      const hasPost = html.includes('data-post=');
      const hasInfo = html.includes('tgme_channel_info');
      diag = `s${status}-len${len}-post${hasPost ? 1 : 0}-info${hasInfo ? 1 : 0}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      diag = 'fetchfail-' + encodeURIComponent(msg).slice(0, 60);
    }
    entries.push({
      url: `${BASE_URL}/__diag/${username}/${diag}`,
      changeFrequency: 'always',
      priority: 0.1,
    });
  }

  return entries;
}
