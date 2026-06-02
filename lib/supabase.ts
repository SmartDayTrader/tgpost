import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — used for READING data (channel pages, posts, sitemap).
export const supabase = createClient(url, anonKey);

// Admin client — used ONLY on the server for WRITING (import, bot webhook).
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---- Data shapes used by the pages -------------------------
export interface DbPost {
  id: number;
  tg_post_id: string;
  raw_text: string;
  date: string | null;
  images: string[];
  links: string[];
  link_previews: { url: string; title: string; description: string; image: string | null; siteName: string | null }[];
  ai_title: string | null;
  ai_description: string | null;
  ai_tags: string[];
  ai_enriched_text: string | null;
}

export interface DbChannel {
  id: number;
  username: string;
  title: string | null;
  description: string | null;
  avatar_url: string | null;
}

// ---- Read helpers ------------------------------------------

// Get a channel by username (case-insensitive).
export async function getChannel(username: string): Promise<DbChannel | null> {
  const { data, error } = await supabase
    .from('channels')
    .select('id, username, title, description, avatar_url')
    .ilike('username', username)
    .maybeSingle();
  if (error) {
    console.error('[getChannel]', error.message);
    return null;
  }
  return data as DbChannel | null;
}

// Get all posts of a channel, newest first.
export async function getPosts(channelId: number): Promise<DbPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, tg_post_id, raw_text, date, images, links, link_previews, ai_title, ai_description, ai_tags, ai_enriched_text')
    .eq('channel_id', channelId)
    .order('date', { ascending: false });
  if (error) {
    console.error('[getPosts]', error.message);
    return [];
  }
  return (data ?? []) as DbPost[];
}

// Get a single post by its Telegram post id within a channel.
export async function getPost(channelId: number, tgPostId: string): Promise<DbPost | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, tg_post_id, raw_text, date, images, links, link_previews, ai_title, ai_description, ai_tags, ai_enriched_text')
    .eq('channel_id', channelId)
    .eq('tg_post_id', tgPostId)
    .maybeSingle();
  if (error) {
    console.error('[getPost]', error.message);
    return null;
  }
  return data as DbPost | null;
}

// List all channels (for sitemap).
export async function getAllChannels(): Promise<DbChannel[]> {
  const { data, error } = await supabase
    .from('channels')
    .select('id, username, title, description, avatar_url');
  if (error) {
    console.error('[getAllChannels]', error.message);
    return [];
  }
  return (data ?? []) as DbChannel[];
}
