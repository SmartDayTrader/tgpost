'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const POSTS = [
  { id: '1139', title: 'A Confession from a Trader with 20 Years of Experience', preview: 'The technical part is 20% of success. The other 80% — is you.', tags: ['psychology', 'trading'] },
  { id: '1142', title: 'Smart Levels — Failed Breakout Detection update', preview: 'The indicator now automatically identifies levels with failed breakouts.', tags: ['TradingView', 'indicator'] },
  { id: '1143', title: "The market doesn't care if you're ready", preview: "It just moves. With you or without you. You don't find your path. You build it.", tags: ['psychology'] },
  { id: '1147', title: 'Welcome to all new subscribers', preview: "I've been in the markets for over 20 years. Intraday trading, institutional concepts — this is my life, not a hobby.", tags: ['trading'] },
];

function TypewriterText({ texts }: { texts: string[] }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = texts[idx];
    let timeout: ReturnType<typeof setTimeout>;
    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((idx + 1) % texts.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx, texts]);

  return (
    <span style={{ color: 'var(--accent)' }}>
      {displayed}<span style={{ borderRight: '2px solid var(--accent)', marginLeft: 1, animation: 'blink 1s step-end infinite' }}></span>
    </span>
  );
}

function FloatingPost({ post, style }: { post: typeof POSTS[0], style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute', background: 'rgba(19,19,26,0.95)',
      border: '1px solid rgba(91,95,255,0.2)', borderRadius: 10,
      padding: '0.85rem 1rem', width: 260,
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      ...style
    }}>
      <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
        {post.tags.map(t => <span key={t} style={{ fontSize: '0.58rem', background: 'rgba(0,229,192,0.1)', color: '#00E5C0', border: '1px solid rgba(0,229,192,0.2)', borderRadius: 4, padding: '1px 6px' }}>{t}</span>)}
      </div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 4, lineHeight: 1.35 }}>{post.title}</div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(240,240,245,0.45)', lineHeight: 1.5 }}>{post.preview}</div>
    </div>
  );
}

export default function Home() {
  const [username, setUsername] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleStart = () => {
    const u = username.replace('@', '').trim();
    if (u) router.push(`/start?channel=${u}`);
    else router.push('/start');
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
        @keyframes pulse-ring { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(2);opacity:0} }
        .post-row:hover { background: var(--surface) !important; border-left-color: var(--accent) !important; }
        .btn-main:hover { background: #484cee !important; transform: translateY(-1px); }
        @media (max-width: 768px) {
          .hero-h1 { font-size: 2.2rem !important; }
          .floating-posts { display: none !important; }
          .plans-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .nav-inner { padding: 1rem 1.25rem !important; }
          .section-inner { padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)', backdropFilter: 'blur(16px)', background: 'rgba(10,10,15,0.8)' }}>
        <div className="nav-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent2)', letterSpacing: '-0.02em' }}>TGPost.pro</div>
          <a href="/start" style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem', border: '1px solid var(--accent)', borderRadius: '6px', color: 'var(--accent)', textDecoration: 'none', transition: 'all 0.2s' }}>
            Get started free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Animated background glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,95,255,0.15) 0%, transparent 60%)', pointerEvents: 'none' }}></div>

        {/* Floating posts — desktop only */}
        <div className="floating-posts">
          <div style={{ animation: 'float1 6s ease-in-out infinite' }}>
            <FloatingPost post={POSTS[0]} style={{ top: '18%', left: '3%' }} />
          </div>
          <div style={{ animation: 'float2 8s ease-in-out infinite 1s' }}>
            <FloatingPost post={POSTS[1]} style={{ top: '55%', left: '1%' }} />
          </div>
          <div style={{ animation: 'float3 7s ease-in-out infinite 0.5s' }}>
            <FloatingPost post={POSTS[2]} style={{ top: '22%', right: '3%' }} />
          </div>
          <div style={{ animation: 'float1 9s ease-in-out infinite 2s' }}>
            <FloatingPost post={POSTS[3]} style={{ top: '58%', right: '1%' }} />
          </div>
        </div>

        {/* Center content */}
        <div style={{ textAlign: 'center', padding: '2rem 1.5rem', maxWidth: 640, animation: 'fadeUp 0.8s ease both', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent2)', border: '1px solid rgba(0,229,192,0.25)', borderRadius: '100px', padding: '0.3rem 0.85rem', marginBottom: '1.75rem', position: 'relative' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', display: 'inline-block', position: 'relative' }}>
              <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent2)', animation: 'pulse-ring 1.5s ease-out infinite' }}></span>
            </span>
            Beta · Free for first 100 channels
          </div>

          <h1 className="hero-h1" style={{ fontSize: 'clamp(2.4rem,5vw,3.6rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Your Telegram channel,<br />
            <TypewriterText texts={['found by Google', 'visible everywhere', 'growing organically']} />
          </h1>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--muted)', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            Every post becomes an SEO page with its own URL. People search a topic — find you — subscribe. No ads.
          </p>

          <div style={{ display: 'flex', maxWidth: '460px', margin: '0 auto 0.75rem', border: '1px solid rgba(91,95,255,0.5)', borderRadius: '10px', overflow: 'hidden', background: 'var(--surface)', transition: 'border-color 0.2s' }}>
            <input
              type="text"
              placeholder="@yourchannel"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.9rem 1rem', fontSize: '1rem', color: 'var(--text)' }}
            />
            <button className="btn-main" onClick={handleStart} style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer', padding: '0.9rem 1.4rem', fontSize: '0.9rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              Create site →
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Free · No credit card · 2 minutes</p>
        </div>
      </section>

      {/* Scrolling ticker */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden', padding: '0.75rem 0', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', gap: '3rem', animation: 'scroll 20s linear infinite', width: 'max-content' }}>
          {[...Array(3)].flatMap(() => ['SEO-optimized pages', 'Auto-sync every 5 min', 'Sitemap.xml', 'IndexNow', 'AI-generated titles', 'Custom domain', 'Google Search Console', 'Internal linking'].map((item, i) => (
            <span key={`${item}-${i}`} style={{ fontSize: '0.8rem', color: 'var(--muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--accent2)' }}>✦</span> {item}
            </span>
          )))}
        </div>
        <style>{`@keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }`}</style>
      </div>

      {/* Steps */}
      <section style={{ padding: '5rem 0' }}>
        <div className="section-inner" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.5rem' }}>How it works</div>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, marginBottom: '3rem', letterSpacing: '-0.02em' }}>Channel → website in 2 minutes</h2>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { n: '01', icon: '📲', title: 'Enter @username', desc: 'Paste your public Telegram channel handle' },
              { n: '02', icon: '🤖', title: 'Add bot as admin', desc: 'Verifies you own the channel. One-time setup.' },
              { n: '03', icon: '✨', title: 'Get your site', desc: 'username.tgpost.pro is live instantly' },
              { n: '04', icon: '🔄', title: 'Auto-sync', desc: 'New post → live on your site in 5 minutes' },
            ].map((s, i) => (
              <div key={s.n} style={{ background: 'var(--bg)', padding: '2rem 1.5rem', animation: `fadeUp 0.6s ease both ${i * 0.1}s` }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--accent)', marginBottom: 10, fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: '1.5rem', margin: '0 0 0.75rem' }}>{s.icon}</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '3rem 0 6rem' }}>
        <div className="section-inner" style={{ maxWidth: 820, margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Start free</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2.5rem' }}>No credit card required</p>
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {[
              { name: 'Free', price: '$0', desc: 'Forever', features: ['username.tgpost.pro', 'Auto-sync', 'Sitemap + IndexNow', 'AI titles'], popular: false },
              { name: 'Pro', price: '$9', desc: '/month', features: ['Custom domain', 'No TGPost branding', 'Priority sync (5 min)', 'Analytics dashboard'], popular: true },
              { name: 'Business', price: '$19', desc: '/month', features: ['Up to 5 channels', 'Custom design', 'API access', 'Priority support'], popular: false },
            ].map(plan => (
              <div key={plan.name} style={{ border: `1px solid ${plan.popular ? 'rgba(91,95,255,0.5)' : 'var(--border)'}`, borderRadius: 14, padding: '1.75rem 1.25rem', textAlign: 'left', position: 'relative', background: plan.popular ? 'rgba(91,95,255,0.04)' : 'transparent' }}>
                {plan.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', background: 'var(--accent)', color: '#fff', padding: '0.25rem 0.85rem', borderRadius: '100px', whiteSpace: 'nowrap' }}>Most popular</div>}
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{plan.name}</div>
                <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em' }}>{plan.price} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--muted)' }}>{plan.desc}</span></div>
                <ul style={{ listStyle: 'none', marginTop: 16 }}>
                  {plan.features.map(f => <li key={f} style={{ fontSize: '0.82rem', color: 'var(--muted)', padding: '0.35rem 0', display: 'flex', gap: 8 }}><span style={{ color: 'var(--accent2)' }}>✓</span>{f}</li>)}
                </ul>
                <a href="/start" style={{ display: 'block', marginTop: '1.25rem', textAlign: 'center', padding: '0.65rem', borderRadius: 8, border: `1px solid ${plan.popular ? 'var(--accent)' : 'var(--border)'}`, color: plan.popular ? 'var(--accent)' : 'var(--muted)', fontSize: '0.82rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                  Get started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(91,95,255,0.1) 0%, transparent 70%)' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Make your channel visible</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', maxWidth: 420, margin: '0 auto 2rem' }}>Your channel already has content people search for. Make it findable.</p>
        <a href="/start" className="btn-main" style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', fontSize: '1rem', fontWeight: 600, padding: '1rem 2.5rem', borderRadius: '10px', textDecoration: 'none', transition: 'all 0.2s' }}>
          Create site for free →
        </a>
      </section>

      <footer style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontFamily: 'monospace', color: 'var(--accent2)' }}>TGPost.pro</span>
        <span>© 2026 · For content creators</span>
      </footer>
    </main>
  );
}
