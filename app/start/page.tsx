'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function StartForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [username, setUsername] = useState(params.get('channel') ?? '');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    const u = username.replace('@', '').trim();
    if (!u) { setError('Enter your channel username'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/parse?channel=${u}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStep(2);
    } catch (e: any) {
      setError(e.message ?? 'Channel not found or private');
    } finally { setLoading(false); }
  };

  const handleDone = () => {
    const u = username.replace('@', '').trim();
    router.push(`/channel/${u}`);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <a href="/" style={{ fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>← Back</a>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '2.5rem' }}>
          {['Enter channel', 'Add bot', 'Site ready'].map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 2, background: i < step ? 'var(--accent)' : 'var(--border)', marginBottom: 6 }}></div>
              <div style={{ fontSize: '0.68rem', color: i < step ? 'var(--text)' : 'var(--muted)' }}>{s}</div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Enter your channel</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>The channel must be public</p>
            <div style={{ border: '1px solid rgba(91,95,255,0.5)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="@smart_day_trader"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheck()}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '1rem', fontSize: '1rem', color: 'var(--text)' }}
              />
            </div>
            {error && <p style={{ color: '#ff6b6b', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>}
            <button onClick={handleCheck} disabled={loading} style={{ width: '100%', background: 'var(--accent)', border: 'none', borderRadius: 8, padding: '0.9rem', fontSize: '0.95rem', fontWeight: 600, color: '#fff', cursor: loading ? 'wait' : 'pointer' }}>
              {loading ? 'Checking channel...' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Add bot as admin</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>This verifies you own the channel</p>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>Step 1</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 4 }}>Open your channel settings in Telegram</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Channel → Edit → Administrators → Add administrator</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 8 }}>Step 2</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 8 }}>Search for and add this bot:</div>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--accent2)', background: 'rgba(0,229,192,0.08)', border: '1px solid rgba(0,229,192,0.2)', borderRadius: 6, padding: '0.6rem 1rem', letterSpacing: 1 }}>
                @tgpost_verify_bot
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 8 }}>Only needs "Post messages" permission</div>
            </div>

            <button onClick={handleDone} style={{ width: '100%', background: 'var(--accent)', border: 'none', borderRadius: 8, padding: '0.9rem', fontSize: '0.95rem', fontWeight: 600, color: '#fff', cursor: 'pointer', marginBottom: '0.75rem' }}>
              I added the bot → Show my site
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
              Bot added for security only. It cannot post or delete anything.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function StartPage() {
  return <Suspense><StartForm /></Suspense>;
}
