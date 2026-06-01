import type { MetadataRoute } from 'next';
import { parseChannel } from '@/lib/parser';

const BASE_URL = 'https://www.tgpost.pro';

// Channels to include in the sitemap.
// TODO: once Supabase is in place, load this list from the database
// instead of hardcoding it.
const CHANNELS = ['Smart-Day-Trader'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  for (const username of CHANNELS) {
    // Channel page itself
    entries.push({
      url: `${BASE_URL}/channel/${username}`,
      changeFrequency: 'daily',
      priority: 0.8,
    });

    // All posts of the channel
    try {
      const channel = await parseChannel(username);
      for (const post of channel.posts) {
        entries.push({
          url: `${BASE_URL}/channel/${username}/post/${post.id}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    } catch {
      // If a channel can't be parsed, skip its posts but keep the channel URL.
    }
  }

  return entries;
}
