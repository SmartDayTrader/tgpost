import type { MetadataRoute } from 'next';
import { parseChannel } from '@/lib/parser';

const BASE_URL = 'https://www.tgpost.pro';

// Channels to include in the sitemap.
// TODO: once Supabase is in place, load this list from the database.
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

    try {
      const channel = await parseChannel(username);
      for (const post of channel.posts) {
        entries.push({
          url: `${BASE_URL}/channel/${username}/post/${post.id}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    } catch (err) {
      console.error(`[sitemap] failed to parse ${username}:`, err);
    }
  }

  return entries;
}
