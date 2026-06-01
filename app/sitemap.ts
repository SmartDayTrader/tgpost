import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.tgpost.pro';
const CHANNELS = ['Smart-Day-Trader'];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function probe(label: string, url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, cache: 'no-store' });
    const text = await res.text();
    return `${label}-s${res.status}-len${text.length}-post${text.includes('data-post=') ? 1 : 0}`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `${label}-FAIL-${encodeURIComponent(msg).slice(0, 50)}`;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const username = CHANNELS[0];
  const direct = `https://t.me/s/${username}`;

  const r1 = await probe('direct', direct);
  const r2 = await probe('allorigins', `https://api.allorigins.win/raw?url=${encodeURIComponent(direct)}`);
  const r3 = await probe('corsproxy', `https://corsproxy.io/?url=${encodeURIComponent(direct)}`);
  const r4 = await probe('jina', `https://r.jina.ai/${direct}`);

  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/__p/${r1}`, changeFrequency: 'always', priority: 0.1 },
    { url: `${BASE_URL}/__p/${r2}`, changeFrequency: 'always', priority: 0.1 },
    { url: `${BASE_URL}/__p/${r3}`, changeFrequency: 'always', priority: 0.1 },
    { url: `${BASE_URL}/__p/${r4}`, changeFrequency: 'always', priority: 0.1 },
  ];
}
