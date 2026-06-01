import type { MetadataRoute } from 'next';
import { parseChannel } from '@/lib/parser';

const BASE_URL = 'https://www.tgpost.pro';

// Channels to include in the sitemap.
// TODO: once Supabase is in place, load this list from the database.
const CHANNELS = ['Smart-Day-Trader'];

// Regenerate the sitemap at most once an hour.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  for (const username of CHANNELS) {
    entries.push({
      url: `${BASE_URL}/channel/${username}`,
      changeFrequency: 'daily',
      priority: 0.8,
    });

    try {
      const channel = await parseChannel(username);
      console.log(`[sitemap] ${username}: parsed ${channel.posts.length} posts`);
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
