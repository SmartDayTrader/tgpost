import { getChannel, getPosts, type DbPost } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 60; // refresh from DB at most once a minute

// Title/tags helpers — prefer AI-generated, fall back to simple derivation.
function postTitle(p: DbPost): string {
  if (p.ai_title) return p.ai_title;
  const clean = (p.raw_text || '').replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();
  const first = clean.split(/[.\n!?]/)[0].trim();
  if (first.length >= 10 && first.length <= 80) return first;
  return clean.substring(0, 70).trim() + (clean.length > 70 ? '…' : '');
}
function postTags(p: DbPost): string[] {
  return Array.isArray(p.ai_tags) ? p.ai_tags.slice(0, 3) : [];
}

export default async function ChannelPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const channel = await getChannel(username);
  if (!channel) notFound();

  const posts = await getPosts(channel.id);

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0a0a0f', fontSize: '0.9rem' }}>
            {channel.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{channel.title || channel.username}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>@{channel.username}</div>
          </div>
        </div>
        <a href={`https://t.me/${channel.username}`} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.8rem', padding: '0.5rem 1.1rem', border: '1px solid rgba(0,229,192,0.3)', borderRadius: 6, color: 'var(--accent2)', textDecoration: 'none' }}>
          Open in Telegram ↗
        </a>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 2rem' }}>
        {channel.description && (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.6 }}>{channel.description}</p>
        )}

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No posts found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {posts.map(post => {
              const title = postTitle(post);
              const tags = postTags(post);
              const preview = post.ai_enriched_text || post.raw_text || '';
              const lp = Array.isArray(post.link_previews) ? post.link_previews : [];
              const imgs = Array.isArray(post.images) ? post.images : [];
              return (
                <Link key={post.id} href={`/channel/${channel.username}/post/${post.tg_post_id}`}
                  style={{ background: 'var(--bg)', padding: '1.25rem 1.5rem', textDecoration: 'none', color: 'inherit', display: 'block', borderLeft: '3px solid transparent', transition: 'border-color 0.15s' }}
                  className="post-row">
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--muted)' }}>#{post.tg_post_id}</span>
                    {tags.map(t => (
                      <span key={t} style={{ fontSize: '0.62rem', background: 'rgba(0,229,192,0.08)', color: 'var(--accent2)', border: '1px solid rgba(0,229,192,0.2)', borderRadius: 4, padding: '2px 7px' }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {preview}
                  </div>
                  {imgs.length > 0 && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={imgs[0]} alt="" style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, marginTop: 10 }} />
                  )}
                  {lp.length > 0 && imgs.length === 0 && (
                    <div style={{ marginTop: 10, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', display: 'flex', background: 'var(--surface)' }}>
                      {lp[0].image && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={lp[0].image} alt="" style={{ width: 88, height: 88, objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{ padding: '0.6rem 0.85rem', overflow: 'hidden' }}>
                        {lp[0].siteName && <div style={{ fontSize: '0.62rem', color: 'var(--accent2)', marginBottom: 2 }}>{lp[0].siteName}</div>}
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lp[0].title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lp[0].description}</div>
                      </div>
                    </div>
                  )}
                  {post.date && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 8 }}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>}
                </Link>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
          Powered by <a href="/" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>TGPost.pro</a> · Turn your Telegram into an SEO website
        </div>
      </div>
    </main>
  );
}
