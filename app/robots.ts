import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.tgpost.pro';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    host: BASE_URL,
    // We don't list a single sitemap here because each channel has its own
    // sitemap at /channel/<username>/sitemap.xml. Google discovers those
    // through the links on each channel page and via Search Console.
  };
}
