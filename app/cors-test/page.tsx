'use client';

import { useEffect, useState } from 'react';

// TEMPORARY diagnostic page. Open /cors-test in the browser.
// It tries to fetch t.me/s/<channel> directly from YOUR browser.
// If CORS allows it, we can parse client-side (best case).
// If blocked, the browser throws and we'll see the error here.
export default function CorsTest() {
  const [status, setStatus] = useState('running…');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    const channel = 'Smart-Day-Trader';
    (async () => {
      try {
        const res = await fetch(`https://t.me/s/${channel}`, {
          // default mode is 'cors'; we want to actually READ the body
          method: 'GET',
        });
        const text = await res.text();
        setStatus(`SUCCESS — status ${res.status}, length ${text.length}`);
        setDetail(
          'hasPosts=' + text.includes('data-post=') +
          ' hasInfo=' + text.includes('tgme_channel_info')
        );
      } catch (err) {
        setStatus('BLOCKED (CORS or network error)');
        setDetail(err instanceof Error ? err.message : String(err));
      }
    })();
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: '#fff', padding: '3rem', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>CORS test for t.me/s/</h1>
      <div style={{ fontSize: '1rem', marginBottom: '1rem' }}>Result: {status}</div>
      <div style={{ fontSize: '0.85rem', color: '#9aa', wordBreak: 'break-all' }}>{detail}</div>
      <p style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#667' }}>
        Open the browser console (F12) too — CORS errors are logged there in detail.
      </p>
    </main>
  );
}
