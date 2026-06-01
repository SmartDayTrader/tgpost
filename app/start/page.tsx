'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

declare global {
  interface Window {
    onTelegramAuth: (user: Record<string, string>) => void;
  }
}

function StartForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState(params.get('channel') ?? '');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const BOT_NAME = 'tgpost_verify_bot';

  useEffect(() => {
    if (step !== 2) return;
    window.onTelegramAuth = (user) => handleVerify(user);
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', BOT_NAME);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    const container = document.getElementById('tg-widget');
    if (container) { container.innerHTML = ''; container.appendChild(script); }
    return () => { if (container) container.innerHTML = ''; };
  }, [step]);

  const handleCheckChannel = async () => {
    const u = username.replace('@', '').trim();
    if (!u) { setError('Enter your channel username'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/parse?channel=${u}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Channel not found or private');
    } finally { setLoading(false); }
  };

  const handleVerify = async (tgData: Record<string, string>) => {
    setVerifying(true); setError('');
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramData: tgData, channelUsername: username }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error ?? 'Verification failed');
      router.push(`/channel/${username.replace('@', '')}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
      setVerifying(false);
    }
  };

  const goBack = () => {
    if (step === 2) { setStep(1); setError(''); }
    else router.push('/');
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <button onClick={goBack} style={{ fontSize: '0.8rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '2rem', padding: 0 }}>← Back</button>

        <div style={{ display: 'flex', gap: 8, marginBottom: '2.5rem' }}>
          {['Enter channel', 'Verify ownership', 'Site ready'].map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 2, background: i < step ? 'var(--accent)' : 'var(--border)', marginBottom: 6, transition: 'background 0.3s' }}></div>
              <div style={{ fontSize: '0.68rem', color: i < step ? 'var(--text)' : 'var(--muted)' }}>{s}</div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>Enter your channel</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>Must be a public channel</p>
            <div style={{ border: '1px solid rgba(91,95,255,0.4)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)', marginBottom: '1rem' }}>
              <input type="text" placeholder="@smart_day_trader" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckChannel()} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '1rem', fontSize: '1rem', color: 'var(--text)' }} />
            </div>
            {error && <p style={{ color: '#ff6b6b', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>}
            <button onClick={handleCheckChannel} disabled={loading} style={{ width: '100%', background: 'var(--accent)', border: 'none', borderRadius: 8, padding: '0.9rem', fontSize: '0.95rem', fontWeight: 600, color: '#fff', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Checking...' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>Verify you own the channel</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '2rem' }}>Log in with Telegram to confirm you own <span style={{ color: 'var(--accent2)' }}>@{username.replace('@', '')}</span></p>
            {verifying ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>⏳ Creating your site...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div id="tg-widget"></div>
                {error && <p style={{ color: '#ff6b6b', fontSize: '0.82rem', textAlign: 'center' }}>{error}</p>}
              </div>
            )}
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center', marginTop: '1.25rem' }}>Telegram will send you a login notification — this is normal.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function StartPage() {
  return <Suspense><StartForm /></Suspense>;
}