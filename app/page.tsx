'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    } else {
      setDeleting(false);
      setIdx((idx + 1) % texts.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx, texts]);

  return (
    <span style={{ color: 'var(--accent)' }}>
      {displayed}
      <span style={{ borderRight: '3px solid var(--accent)', marginLeft: 2, animation: 'blink 1s step-end infinite' }}></span>
    </span>
  );
}

export default function Home() {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleStart = () => {
    const u = username.replace('@', '').trim();
    if (u) router.push(`/start?channel=${u}`);
    else router.push('/start');
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', overflowX: 'hidden' }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes float2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        .input-wrap:focus-within { border-color: var(--accent) !important; }
        .cta-btn:hover { background: #484cee !important; transform: translateY(-1px); }
        .get-btn:hover { background: var(--accent) !important; color: #fff !important; }
        @media (max-width: 900px) {
          .side-cards { display: none !important; }
          .hero-inner { padding: 4rem 1.5rem 3rem !important; }
          .hero-h1 { font-size: 2.4rem !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .plans-grid { grid-template-columns: 1fr !important; max-width: 360px !important; margin: 0 auto !important; }
          .footer-inner { flex-direction: column !important; text-align: center !important; }
        }
        @media (max-width: 500px) {
          .hero-h1 { font-size: 1.9rem !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .input-row { flex-direction: column !important; border-radius: 10px !important; }
          .input-row input { border-radius: 10px 10px 0 0 !important; }
          .input-row button { border-radius: 0 0 10px 10px !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)', background: 'rgba(10,10,15,0.85)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent2)' }}>TGPost.pro</div>
          <a className="get-btn" href="/start" style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem', border: '1px solid var(--accent)', borderRadius: 6, color: 'var(--accent)', textDecoration: 'none', transition: 'all 0.2s' }}>
            Get started free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(91,95,255,0.12) 0%, transparent 65%)', pointerEvents: 'none' }}></div>

        {/* Left floating card */}
        <div className="side-cards" style={{ position: 'absolute', left: '2%', top: '50%', transform: 'translateY(-50%)', width: 220, animation: 'float1 7s ease-in-out infinite', zIndex: 0 }}>
          <div style={{ background: 'rgba(19,19,26,0.92)', border: '1px solid rgba(91,95,255,0.2)', borderRadius: 10, padding: '1rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: '0.58rem', background: 'rgba(0,229,192,0.1)', color: '#00E5C0', border: '1px solid rgba(0,229,192,0.2)', borderRadius: 4, padding: '1px 6px' }}>psychology</span>
            </div>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, lineHeight: 1.35, marginBottom: 4 }}>A Confession from a Trader with 20 Years</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(240,240,245,0.45)', lineHeight: 1.5 }}>80% of success is psychology, not strategy.</div>
          </div>
        </div>

        {/* Right floating card */}
        <div className="side-cards" style={{ position: 'absolute', right: '2%', top: '50%', transform: 'translateY(-50%)', width: 220, animation: 'float2 8s ease-in-out infinite 1s', zIndex: 0 }}>
          <div style={{ background: 'rgba(19,19,26,0.92)', border: '1px solid rgba(91,95,255,0.2)', borderRadius: 10, padding: '1rem', backdropFilter: 'blur(8px)' }}>
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: '0.58rem', background: 'rgba(0,229,192,0.1)', color: '#00E5C0', border: '1px solid rgba(0,229,192,0.2)', borderRadius: 4, padding: '1px 6px' }}>TradingView</span>
              <span style={{ fontSize: '0.58rem', background: 'rgba(0,229,192,0.1)', color: '#00E5C0', border: '1px solid rgba(0,229,192,0.2)', borderRadius: 4, padding: '1px 6px' }}>indicator</span>
            </div>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, lineHeight: 1.35, marginBottom: 4 }}>Smart Levels — Failed Breakout Detection</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(240,240,245,0.45)', lineHeight: 1.5 }}>Now detects diminishing pivot amplitudes.</div>
          </div>
        </div>

        {/* Center hero content — always on top */}
        <div className="hero-inner" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '5rem 2rem 4rem', maxWidth: 600, margin: '0 auto', animation: 'fadeUp 0.7s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent2)', border: '1px solid rgba(0,229,192,0.25)', borderRadius: 100, padding: '0.3rem 0.9rem', marginBottom: '1.75rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', animation: 'pulse-dot 2s ease infinite', display: 'inline-block' }}></span>
            Beta · Free for first 100 channels
          </div>

          <h1 className="hero-h1" style={{ fontSize: 'clamp(2.2rem,4.5vw,3.4rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>
            Your Telegram channel,<br />
            <TypewriterText texts={['found by Google', 'visible everywhere', 'growing organically']} />
          </h1>

          <p style={{ fontSize: '1rem', lineHeight: 1.7, color: 'var(--muted)', maxWidth: 440, margin: '0 auto 2.5rem' }}>
            Every post becomes an SEO page with its own URL. People search a topic — find you — subscribe. No ads.
          </p>

          <div className="input-wrap input-row" style={{ display: 'flex', maxWidth: 440, margin: '0 auto 0.75rem', border: '1px solid rgba(91,95,255,0.4)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)', transition: 'border-color 0.2s' }}>
            <input
              type="text"
              placeholder="@yourchannel"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.9rem 1rem', fontSize: '1rem', color: 'var(--text)' }}
            />
            <button className="cta-btn" onClick={handleStart} style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer', padding: '0.9rem 1.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              Create site →
            </button>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Free · No credit card · 2 minutes</p>
        </div>
      </section>

      {/* Ticker */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.7rem 0', background: 'var(--surface)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '2.5rem', animation: 'ticker 18s linear infinite', width: 'max-content', whiteSpace: 'nowrap' }}>
          {[...Array(4)].flatMap((_, ri) =>
            ['SEO-optimized pages', 'Auto-sync every 5 min', 'Sitemap.xml', 'IndexNow', 'AI-generated titles', 'Custom domain', 'Google Search Console', 'Internal linking'].map((item, i) => (
              <span key={`${ri}-${i}`} style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--accent2)', fontSize: '0.6rem' }}>✦</span>{item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Steps */}
      <section style={{ padding: '5rem 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.5rem' }}>How it works</div>
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>Channel → website in 2 minutes</h2>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {[
              { n: '01', icon: '📲', title: 'Enter @username', desc: 'Paste your public Telegram channel handle' },
              { n: '02', icon: '🤖', title: 'Add bot as admin', desc: 'Verifies you own the channel. One-time setup.' },
              { n: '03', icon: '✨', title: 'Get your site', desc: 'username.tgpost.pro is live instantly with AI titles' },
              { n: '04', icon: '🔄', title: 'Auto-sync', desc: 'New post in Telegram → on your site in 5 min' },
            ].map(s => (
              <div key={s.n} style={{ background: 'var(--bg)', padding: '1.75rem 1.5rem' }}>
                <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--accent)', marginBottom: 10, fontWeight: 700 }}>{s.n}</div>
                <div style={{ fontSize: '1.4rem', margin: '0 0 0.6rem' }}>{s.icon}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 5 }}>{s.title}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '2rem 0 6rem' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Start free</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>No credit card required</p>
          <div className="plans-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
            {[
              { name: 'Free', price: '$0', desc: 'Forever', features: ['username.tgpost.pro', 'Auto-sync', 'Sitemap + IndexNow', 'AI titles'], popular: false },
              { name: 'Pro', price: '$9', desc: '/month', features: ['Custom domain', 'No TGPost branding', 'Priority sync (5 min)', 'Analytics'], popular: true },
              { name: 'Business', price: '$19', desc: '/month', features: ['Up to 5 channels', 'Custom design', 'API access', 'Priority support'], popular: false },
            ].map(plan => (
              <div key={plan.name} style={{ border: `1px solid ${plan.popular ? 'rgba(91,95,255,0.45)' : 'var(--border)'}`, borderRadius: 12, padding: '1.75rem 1.25rem', textAlign: 'left', position: 'relative', background: plan.popular ? 'rgba(91,95,255,0.04)' : 'transparent' }}>
                {plan.popular && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', fontSize: '0.62rem', background: 'var(--accent)', color: '#fff', padding: '0.2rem 0.8rem', borderRadius: 100, whiteSpace: 'nowrap' }}>Most popular</div>}
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{plan.name}</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: 2 }}>{plan.price} <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--muted)' }}>{plan.desc}</span></div>
                <ul style={{ listStyle: 'none', marginTop: 14 }}>
                  {plan.features.map(f => <li key={f} style={{ fontSize: '0.8rem', color: 'var(--muted)', padding: '0.3rem 0', display: 'flex', gap: 8 }}><span style={{ color: 'var(--accent2)', flexShrink: 0 }}>✓</span>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'radial-gradient(ellipse 50% 40% at 50% 100%, rgba(91,95,255,0.08) 0%, transparent 70%)' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Make your channel visible</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem', maxWidth: 400, margin: '0 auto 2rem', fontSize: '0.95rem' }}>Your channel already has content people search for. Make it findable.</p>
        <a href="/start" className="cta-btn" style={{ display: 'inline-block', background: 'var(--accent)', color: '#fff', fontSize: '1rem', fontWeight: 600, padding: '1rem 2.5rem', borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s' }}>
          Create site for free →
        </a>
      </section>

      <footer style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)' }}>
        <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
          <span style={{ fontFamily: 'monospace', color: 'var(--accent2)' }}>TGPost.pro</span>
          <span>© 2026 · For content creators</span>
        </div>
      </footer>
    </main>
  );
}
