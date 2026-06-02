import type { MetadataRoute } from 'next';
import { getAllChannels, getPosts } from '@/lib/supabase';

const BASE_URL = 'https://www.tgpost.pro';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
  ];

  const channels = await getAllChannels();
  for (const channel of channels) {
    entries.push({
      url: `${BASE_URL}/channel/${channel.username}`,
      changeFrequency: 'daily',
      priority: 0.8,
    });
    const posts = await getPosts(channel.id);
    for (const post of posts) {
      entries.push({
        url: `${BASE_URL}/channel/${channel.username}/post/${post.tg_post_id}`,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
