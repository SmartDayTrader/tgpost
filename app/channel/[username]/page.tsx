import { parseChannel, generateTitle, generateTags } from '@/lib/parser';
import Link from 'next/link';

export default async function ChannelPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let channel;
  try {
    channel = await parseChannel(username);
  } catch {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Channel not found</h1>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>@{username} doesn&apos;t exist or is private</p>
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>← Go home</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0a0a0f', fontSize: '0.9rem' }}>
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{channel.title}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontFamily: 'monospace' }}>@{username}</div>
          </div>
        </div>
        <a href={`https://t.me/${username}`} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: '0.8rem', padding: '0.5rem 1.1rem', border: '1px solid rgba(0,229,192,0.3)', borderRadius: 6, color: 'var(--accent2)', textDecoration: 'none' }}>
          Open in Telegram ↗
        </a>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2.5rem 2rem' }}>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: 1.6 }}>{channel.description}</p>

        {channel.posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>No posts found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {[...channel.posts].reverse().map(post => {
              const title = generateTitle(post.text);
              const tags = generateTags(post);
              return (
                <Link key={post.id} href={`/channel/${username}/post/${post.id}`}
                  style={{ background: 'var(--bg)', padding: '1.25rem 1.5rem', textDecoration: 'none', color: 'inherit', display: 'block', borderLeft: '3px solid transparent', transition: 'border-color 0.15s' }}
                  className="post-row">
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--muted)' }}>#{post.id}</span>
                    {tags.map(t => (
                      <span key={t} style={{ fontSize: '0.62rem', background: 'rgba(0,229,192,0.08)', color: 'var(--accent2)', border: '1px solid rgba(0,229,192,0.2)', borderRadius: 4, padding: '2px 7px' }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.text}
                  </div>
                  {post.date && <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 8 }}>{post.date}</div>}
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
