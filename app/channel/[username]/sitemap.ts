import type { MetadataRoute } from 'next';
import { parseChannel } from '@/lib/parser';

const BASE_URL = 'https://www.tgpost.pro';

type Props = { params: Promise<{ username: string }> };

// Per-channel sitemap. Next.js serves this at:
//   /channel/<username>/sitemap.xml
// It lists the channel page itself plus every post page, so Google can
// discover and index all of them.
export default async function sitemap({ params }: Props): Promise<MetadataRoute.Sitemap> {
  const { username } = await params;

  let channel;
  try {
    channel = await parseChannel(username);
  } catch {
    // Channel not found / private — return just the channel URL so the route
    // still responds with valid XML instead of erroring.
    return [
      {
        url: `${BASE_URL}/channel/${username}`,
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ];
  }

  const channelEntry = {
    url: `${BASE_URL}/channel/${username}`,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  };

  const postEntries = channel.posts.map((post) => ({
    url: `${BASE_URL}/channel/${username}/post/${post.id}`,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [channelEntry, ...postEntries];
}
