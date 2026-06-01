import type { MetadataRoute } from 'next';
import { parseChannel } from '@/lib/parser';

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

    // --- DIAGNOSTIC: outcome of parsing is encoded into a visible URL ---
    let diag = 'unknown';
    try {
      const channel = await parseChannel(username);
      diag = `posts-${channel.posts.length}`;
      for (const post of channel.posts) {
        entries.push({
          url: `${BASE_URL}/channel/${username}/post/${post.id}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      diag = 'error-' + encodeURIComponent(msg).slice(0, 80);
    }
    // This entry is only for debugging; we will remove it once it works.
    entries.push({
      url: `${BASE_URL}/__sitemap_debug/${username}/${diag}`,
      changeFrequency: 'always',
      priority: 0.1,
    });
  }

  return entries;
}
