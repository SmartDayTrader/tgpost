import { getChannel, getPost, type DbPost } from '@/lib/supabase';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const revalidate = 60;

type Props = { params: Promise<{ username: string; id: string }> };

function postTitle(p: DbPost): string {
  if (p.ai_title) return p.ai_title;
  const clean = (p.raw_text || '').replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();
  const first = clean.split(/[.\n!?]/)[0].trim();
  if (first.length >= 10 && first.length <= 80) return first;
  return clean.substring(0, 70).trim() + (clean.length > 70 ? '…' : '');
}
function postDescription(p: DbPost): string {
  if (p.ai_description) return p.ai_description;
  const clean = (p.raw_text || '').replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/https?:\/\/\S+/g, '').trim();
  return clean.substring(0, 155).trim() + (clean.length > 155 ? '…' : '');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, id } = await params;
  const channel = await getChannel(username);
  if (!channel) return { title: 'Post not found' };
  const post = await getPost(channel.id, id);
  if (!post) return { title: 'Post not found' };
  return {
    title: `${postTitle(post)} — ${channel.title || channel.username}`,
    description: postDescription(post),
    openGraph: { title: postTitle(post), description: postDescription(post), type: 'article' },
  };
}

export default async function PostPage({ params }: Props) {
  const { username, id } = await params;
  const channel = await getChannel(username);
  if (!channel) notFound();
  const post = await getPost(channel.id, id);
  if (!post) notFound();

  const title = postTitle(post);
  const tags = Array.isArray(post.ai_tags) ? post.ai_tags : [];
  const bodyText = post.ai_enriched_text || post.raw_text || '';
  const paragraphs = bodyText.split('\n').filter(p => p.trim());
  const imgs = Array.isArray(post.images) ? post.images : [];
  const lp = Array.isArray(post.link_previews) ? post.link_previews : [];
  const links = Array.isArray(post.links) ? post.links : [];
  const dateStr = post.date ? new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', padding: '1rem 2.5rem' }}>
        <Link href={`/channel/${channel.username}`} style={{ fontSize: '0.82rem', color: 'var(--muted)', textDecoration: 'none' }}>
          ← {channel.title || channel.username}
        </Link>
      </div>

      <article style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {tags.map(t => (
            <span key={t} style={{ fontSize: '0.72rem', background: 'rgba(0,229,192,0.08)', color: 'var(--accent2)', border: '1px solid rgba(0,229,192,0.2)', borderRadius: 4, padding: '3px 10px' }}>{t}</span>
          ))}
        </div>

        <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, lineHeight: 1.25, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
          {title}
        </h1>

        {dateStr && (
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            {dateStr} · <a href={`https://t.me/${channel.username}/${id}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>View in Telegram ↗</a>
          </div>
        )}

        <div style={{ fontSize: '1rem', lineHeight: 1.8, color: '#c8cad4' }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{ marginBottom: '1rem' }}>{p}</p>
          ))}
        </div>

        {imgs.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {imgs.map((img, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={img} alt="" style={{ width: '100%', borderRadius: 10, border: '1px solid var(--border)' }} />
            ))}
          </div>
        )}

        {lp.length > 0 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lp.map(preview => (
              <a key={preview.url} href={preview.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', display: 'block', background: 'var(--surface)' }}>
                {preview.image && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={preview.image} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} />
                )}
                <div style={{ padding: '0.85rem 1rem' }}>
                  {preview.siteName && <div style={{ fontSize: '0.68rem', color: 'var(--accent2)', marginBottom: 4 }}>{preview.siteName}</div>}
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{preview.title}</div>
                  {preview.description && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.5 }}>{preview.description}</div>}
                </div>
              </a>
            ))}
          </div>
        )}

        {links.length > 0 && (
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>Links</div>
            {links.filter(l => !lp.some(p => p.url === l)).map(link => (
              <a key={link} href={link} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', fontSize: '0.82rem', color: 'var(--accent2)', textDecoration: 'none', padding: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {link}
              </a>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <a href={`https://t.me/${channel.username}`} target="_blank" rel="noopener noreferrer"
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
