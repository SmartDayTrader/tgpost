import { parseChannel, generateTitle, generateDescription, generateTags } from '@/lib/parser';
import Link from 'next/link';
import type { Metadata } from 'next';

type Props = { params: Promise<{ username: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, id } = await params;
  try {
    const channel = await parseChannel(username);
    const post = channel.posts.find(p => p.id === id);
    if (!post) return { title: 'Post not found' };
    return {
      title: `${generateTitle(post.text)} — ${channel.title}`,
      description: generateDescription(post.text),
      openGraph: {
        title: generateTitle(post.text),
        description: generateDescription(post.text),
        type: 'article',
      },
    };
  } catch {
    return { title: 'Post not found' };
  }
}

export default async function PostPage({ params }: Props) {
  const { username, id } = await params;
  let channel, post;

  try {
    channel = await parseChannel(username);
    post = channel.posts.find(p => p.id === id);
  } catch {
    return <div style={{ color: 'var(--text)', padding: '2rem' }}>Error loading post</div>;
  }

  if (!post) {
    return (
      <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ marginBottom: '1rem' }}>Post not found</h1>
          <Link href={`/channel/${username}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>← Back to channel</Link>
        </div>
      </main>
    );
  }

  const title = generateTitle(post.text);
  const tags = generateTags(post);
  const paragraphs = post.text.split('\n').filter(p => p.trim());

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '1rem 2.5rem' }}>
        <Link href={`/channel/${username}`} style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>
          ← {channel!.title}
        </Link>
      </div>

      <article style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {tags.map(t => (
            <span key={t} style={{ fontSize: '0.72rem', background: 'rgba(0,229,192,0.08)', color: 'var(--accent2)', border: '1px solid rgba(0,229,192,0.2)', borderRadius: 4, padding: '3px 10px' }}>{t}</span>
          ))}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          {title}
        </h1>

        {post.date && (
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            {post.date} · <a href={`https://t.me/${username}/${id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>View in Telegram ↗</a>
          </div>
        )}

        {/* Body */}
        <div style={{ fontSize: '1rem', lineHeight: 1.8, color: '#c8cad4' }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ marginBottom: '1rem' }}>{p}</p>
          ))}
        </div>

        {/* Links */}
        {post.links.length > 0 && (
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>Links</div>
            {post.links.map(link => (
              <a key={link} href={link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', fontSize: '0.82rem', color: 'var(--accent2)', textDecoration: 'none', padding: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {link}
              </a>
            ))}
          </div>
        )}

        {/* SEO footer */}
        <div style={{ marginTop: '3rem', padding: '1.25rem', background: 'rgba(91,95,255,0.05)', border: '1px solid rgba(91,95,255,0.15)', borderRadius: 8 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 6 }}>Meta description (SEO)</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>
            {generateDescription(post.text)}
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <a href={`https://t.me/${username}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', textDecoration: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600 }}>
            Subscribe on Telegram ↗
          </a>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--muted)' }}>
            Powered by <a href="/" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>TGPost.pro</a>
          </div>
        </div>
      </article>
    </main>
  );
}
