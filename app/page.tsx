'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleStart = () => {
    const u = username.replace('@', '').trim();
    if (u) router.push(`/start?channel=${u}`);
    else router.push('/start');
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent2)' }}>TGPost.pro</div>
        <a href="/start" style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem', border: '1px solid var(--accent)', borderRadius: '6px', color: 'var(--accent)', textDecoration: 'none' }}>
          Get started free
        </a>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem 4rem', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent2)', border: '1px solid rgba(0,229,192,0.25)', borderRadius: '100px', padding: '0.3rem 0.85rem', marginBottom: '1.75rem' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent2)', display: 'inline-block' }}></span>
          Beta · Free for first 100 channels
        </div>

        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
          Your Telegram channel,<br />
          <span style={{ color: 'var(--accent)' }}>discovered by Google</span>
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--muted)', maxWidth: '520px', margin: '0 auto 2.5rem' }}>
          Every post becomes an SEO page with its own URL. People search a topic — find you — subscribe. No ads.
        </p>

        <div style={{ display: 'flex', maxWidth: '480px', margin: '0 auto 1rem', border: '1px solid rgba(91,95,255,0.5)', borderRadius: '10px', overflow: 'hidden', background: 'var(--surface)' }}>
          <input
            type="text"
            placeholder="@yourchannel"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStart()}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.85rem 1rem', fontSize: '0.95rem', color: 'var(--text)' }}
          />
          <button onClick={handleStart} style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer', padding: '0.85rem 1.4rem', fontSize: '0.875rem', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>
            Create site →
          </button>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Free · No credit card · 2 minutes</p>
      </section>

      {/* Demo preview */}
      <section style={{ maxWidth: '680px', margin: '0 auto 5rem', padding: '0 2rem' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'var(--surface)' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F57' }}></span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FEBC2E' }}></span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28C840' }}></span>
            <span style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', color: 'var(--muted)' }}>smart-day-trader.tgpost.pro</span>
          </div>
          {[
            { id: '1139', title: 'A Confession from a Trader with 20 Years of Experience', preview: 'Most people come to the market searching for a Magic Tool. Such a tool doesn\'t exist. The technical part is 20% of success. The other 80% — is you.', tags: ['psychology', 'trading'] },
            { id: '1142', title: 'Smart Levels indicator — Failed Breakout Detection update', preview: 'The indicator now automatically identifies levels with failed breakouts. FB levels are highlighted with a separate color and marked with "FB".', tags: ['TradingView', 'indicator'] },
            { id: '1143', title: 'The market doesn\'t care if you\'re ready', preview: 'It just moves. With you or without you. You don\'t find your path. You build it.', tags: ['psychology'] },
          ].map(post => (
            <div key={post.id} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {post.tags.map(t => <span key={t} style={{ fontSize: '0.62rem', background: 'rgba(0,229,192,0.08)', color: 'var(--accent2)', border: '1px solid rgba(0,229,192,0.2)', borderRadius: '4px', padding: '2px 7px' }}>{t}</span>)}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>{post.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>{post.preview}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section style={{ maxWidth: '920px', margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.75rem' }}>How it works</div>
        <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, marginBottom: '2.5rem' }}>From channel to website in 2 minutes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            { n: '01', icon: '📲', title: 'Enter @username', desc: 'Paste your public Telegram channel link' },
            { n: '02', icon: '🤖', title: 'Add bot as admin', desc: 'Verifies you\'re the channel owner' },
            { n: '03', icon: '✨', title: 'Get your site', desc: 'username.tgpost.pro is live. AI adds titles and meta tags automatically' },
            { n: '04', icon: '🔄', title: 'Auto-sync', desc: 'New post in Telegram → live on your site in 5 minutes' },
          ].map(s => (
            <div key={s.n} style={{ background: 'var(--bg)', padding: '1.75rem 1.5rem' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--accent)', marginBottom: 8 }}>{s.n}</div>
              <div style={{ fontSize: '1.4rem', margin: '0.25rem 0' }}>{s.icon}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 4 }}>{s.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: '760px', margin: '0 auto', padding: '0 2rem 5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 700, marginBottom: '2.5rem' }}>Start free</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {[
            { name: 'Free', price: '$0', desc: 'Forever free', features: ['username.tgpost.pro', 'Auto-sync', 'Sitemap + IndexNow', 'AI titles'], popular: false },
            { name: 'Pro', price: '$9', desc: '/month', features: ['Custom domain', 'No branding', 'Priority sync', 'Analytics'], popular: true },
            { name: 'Business', price: '$19', desc: '/month', features: ['Up to 5 channels', 'Custom design', 'API access', 'Priority support'], popular: false },
          ].map(plan => (
            <div key={plan.name} style={{ border: `1px solid ${plan.popular ? 'rgba(91,95,255,0.5)' : 'var(--border)'}`, borderRadius: 12, padding: '1.75rem 1.25rem', textAlign: 'left', position: 'relative' }}>
              {plan.popular && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', background: 'var(--accent)', color: '#fff', padding: '0.2rem 0.75rem', borderRadius: '100px' }}>Popular</div>}
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{plan.name}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: 4 }}>{plan.price} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--muted)' }}>{plan.desc}</span></div>
              <ul style={{ listStyle: 'none', marginTop: 12 }}>
                {plan.features.map(f => <li key={f} style={{ fontSize: '0.78rem', color: 'var(--muted)', padding: '0.3rem 0', display: 'flex', gap: 6 }}><span style={{ color: 'var(--accent2)' }}>✓</span>{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, marginBottom: '0.75rem' }}>Make your channel visible</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Your channel already has content people search for. Make it findable.</p>
        <a href="/start" style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', fontSize: '0.9rem', fontWeight: 500, padding: '0.85rem 2rem', borderRadius: '8px', textDecoration: 'none' }}>
          Create site for free
        </a>
      </section>

      <footer style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
        <span>© 2026 TGPost.pro</span>
        <span>For content creators</span>
      </footer>
    </main>
  );
}
