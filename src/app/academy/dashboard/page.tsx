'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/academy-supabase';
import Wheel from '../../../components/Wheel';
import { XPBar, Streak, BadgeGrid, StatusLine } from '../../../components/academy-ui';
import { SECTORS, LESSONS } from '../../../content/curriculum';
import { keyColor, KEYS } from '../../../lib/theory';

type Profile = { username: string; xp: number; streak_count: number; has_full_access: boolean; email: string | null };

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [badges, setBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [code, setCode] = useState('');
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [guestMsg, setGuestMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = supabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return router.replace('/academy/auth');
      const [{ data: p }, { data: prog }, { data: bd }] = await Promise.all([
        sb.from('profiles').select('username,xp,streak_count,has_full_access,email').eq('id', user.id).single(),
        sb.from('lesson_progress').select('lesson_slug').eq('user_id', user.id),
        sb.from('user_badges').select('badge_id').eq('user_id', user.id),
      ]);
      setProfile(p as Profile);
      setDone(new Set((prog ?? []).map((r: { lesson_slug: string }) => r.lesson_slug)));
      setBadges((bd ?? []).map((r: { badge_id: string }) => r.badge_id));
      setLoading(false);

      // Just returned from Stripe? The webhook can lag a few seconds behind
      // the redirect — poll for access instead of showing a locked dashboard
      // ("I paid but it's still locked" is the #1 billing support ticket on
      // every learning platform).
      const justUpgraded = new URLSearchParams(window.location.search).get('upgraded') === '1';
      if (justUpgraded && !(p as Profile)?.has_full_access) {
        setProcessing(true);
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const { data: p2 } = await sb.from('profiles')
            .select('username,xp,streak_count,has_full_access,email').eq('id', user.id).single();
          if (p2?.has_full_access) { setProfile(p2 as Profile); break; }
        }
        setProcessing(false);
      }
    })();
  }, [router]);

  if (loading) return <StatusLine text="registry.sync" />;
  if (!profile) return null;

  // Light wheel segments as sectors complete: sector n lights 2 keys
  const litKeys = SECTORS.filter((s) =>
    LESSONS.filter((l) => l.sector === s.n).every((l) => done.has(l.slug))
  ).flatMap((s) => [KEYS[(s.n - 1) * 2].name, KEYS[(s.n - 1) * 2 + 1].name]);

  const redeemCode = async () => {
    setCodeMsg(null);
    const sb = supabase();
    const { data, error } = await sb.rpc('redeem_access_code', { p_code: code });
    if (error || !data?.ok) {
      const map: Record<string, string> = {
        invalid_code: 'Code not recognized — check the spelling.',
        code_expired: 'That code has expired.',
        code_fully_redeemed: 'That code has hit its redemption limit.',
        already_redeemed: 'You already used this code.',
      };
      return setCodeMsg(map[data?.error as string] ?? error?.message ?? 'Could not redeem.');
    }
    setProfile((p) => p ? { ...p, has_full_access: true } : p);
    setCodeMsg('✦ FULL SPECTRUM UNLOCKED');
  };

  const saveGuestEmail = async () => {
    setGuestMsg(null);
    setGuestBusy(true);
    const email = guestEmail.trim().toLowerCase();
    const res = await fetch('/api/academy/attach-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        ...(needsPassword && guestPassword ? { password: guestPassword } : {}),
      }),
    });
    const payload = await res.json().catch(() => ({}));
    setGuestBusy(false);

    if (!res.ok) {
      if (payload.code === 'already_registered') {
        setNeedsPassword(true);
        return setGuestMsg(payload.error ?? 'That email already has an account — enter your password to merge.');
      }
      if (payload.code === 'invalid_credentials') {
        setNeedsPassword(true);
        return setGuestMsg(payload.error ?? 'Wrong password.');
      }
      return setGuestMsg(payload.error ?? 'Could not save email.');
    }

    if (payload.merged) {
      // Guest session was deleted — sign into the existing account with the password they just used.
      const { error } = await supabase().auth.signInWithPassword({ email, password: guestPassword });
      if (error) {
        setNeedsPassword(true);
        return setGuestMsg('Progress merged, but sign-in failed — log in from /academy/auth with that email.');
      }
      setGuestMsg('✦ Guest progress merged into your account. Reloading…');
      window.location.reload();
      return;
    }

    // Refresh session so auth.email / is_anonymous update client-side.
    await supabase().auth.refreshSession();
    setNeedsPassword(false);
    setGuestPassword('');
    setProfile((p) => (p ? { ...p, email } : p));
    setGuestMsg('✦ Email locked in — welcome note sent. Your progress is permanent now. Stay with the process.');
  };

  const buyFullSpectrum = async () => {
    if (!profile?.email) {
      setGuestMsg('Add an email above first — purchases need an account to attach to.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const res = await fetch('/api/stripe/checkout', { method: 'POST' });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else alert(error ?? 'Checkout unavailable');
  };

  return (
    <main>
      <StatusLine text={`registry.user: ${profile.username ?? 'anonymous'}${profile.email ? '' : ' [GUEST]'} // access: ${profile.has_full_access ? 'FULL_SPECTRUM' : 'FREE_TIER'}`} />

      {!profile.email && (
        <div className="kc-panel" style={{ marginBottom: 14, borderColor: 'var(--kc-dim)' }}>
          <p className="kc-eyebrow">GUEST SESSION — PROGRESS SAVED ON THIS DEVICE ONLY</p>
          <p style={{ fontSize: 12 }}>Add an email to keep your XP, streak and badges permanently (and to unlock purchases).</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input className="kc-field" style={{ marginBottom: 0 }} placeholder="email" type="email"
                value={guestEmail}
                onChange={(e) => {
                  setGuestEmail(e.target.value);
                  setNeedsPassword(false);
                  setGuestPassword('');
                  setGuestMsg(null);
                }} />
              <button
                className="kc-btn ghost"
                onClick={saveGuestEmail}
                disabled={guestBusy || !guestEmail.includes('@') || (needsPassword && guestPassword.length < 6)}
              >
                {guestBusy ? '…' : needsPassword ? 'Merge' : 'Save'}
              </button>
            </div>
            {needsPassword && (
              <input
                className="kc-field"
                style={{ marginBottom: 0 }}
                placeholder="account password"
                type="password"
                autoComplete="current-password"
                value={guestPassword}
                onChange={(e) => setGuestPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void saveGuestEmail(); }}
              />
            )}
          </div>
          {guestMsg && <p style={{ fontSize: 11, marginTop: 8, color: guestMsg.startsWith('✦') ? 'var(--kc-ok)' : 'var(--kc-warn)' }}>{guestMsg}</p>}
        </div>
      )}

      <div className="kc-grid kc-grid-2" style={{ alignItems: 'center' }}>
        <div className="kc-grid" style={{ gap: 18 }}>
          <div className="kc-panel"><XPBar xp={profile.xp} /></div>
          <div className="kc-panel"><Streak days={profile.streak_count} /></div>
          {processing && (
            <div className="kc-panel" style={{ textAlign: 'center' }}>
              <p className="kc-eyebrow">PAYMENT RECEIVED — UNLOCKING…</p>
              <p style={{ fontSize: 12, color: 'var(--kc-dim)' }}>This takes a few seconds. If it doesn&apos;t unlock in a minute, refresh — your purchase is safe.</p>
            </div>
          )}
          {!profile.has_full_access && !processing && (
            <div className="kc-panel" style={{ textAlign: 'center' }}>
              <p className="kc-eyebrow">SECTORS 03–06 LOCKED</p>
              <button className="kc-btn" onClick={buyFullSpectrum}>Unlock Full Spectrum — $49</button>
              <p style={{ fontSize: 11, color: 'var(--kc-dim)', margin: '12px 0 6px' }}>Discount codes apply at checkout · Have an access code?</p>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="kc-field" style={{ marginBottom: 0, textTransform: 'uppercase' }} placeholder="ACCESS CODE"
                  value={code} onChange={(e) => setCode(e.target.value)} />
                <button className="kc-btn ghost" onClick={redeemCode} disabled={!code.trim()}>Redeem</button>
              </div>
              {codeMsg && <p style={{ fontSize: 11, marginTop: 8, color: codeMsg.startsWith('✦') ? 'var(--kc-ok)' : 'var(--kc-warn)' }}>{codeMsg}</p>}
            </div>
          )}
        </div>
        <Wheel size={300} litKeys={litKeys} />
      </div>

      {SECTORS.map((s) => {
        const ls = LESSONS.filter((l) => l.sector === s.n);
        const sectorLocked = !s.free && !profile.has_full_access;
        return (
          <div className="kc-sector" key={s.n}>
            <div className="kc-sector-head">
              <span className="kc-eyebrow">{s.code}</span>
              <h2>{s.title}</h2>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: sectorLocked ? 'var(--kc-warn)' : 'var(--kc-ok)' }}>
                [{sectorLocked ? 'LOCKED' : `${ls.filter((l) => done.has(l.slug)).length}/${ls.length}`}]
              </span>
            </div>
            <p className="kc-thesis">{s.thesis}</p>
            {ls.map((l, i) => {
              const isDone = done.has(l.slug);
              const cls = `kc-lesson ${isDone ? 'is-done' : ''} ${sectorLocked ? 'is-locked' : ''}`;
              const row = (
                <>
                  <span className="dot" style={{ background: isDone ? keyColor(KEYS[(s.n * 4 + i) % 12].hue) : '#232327' }} />
                  <span className="t">{isDone ? '✦ ' : ''}{l.title}</span>
                  <span className="meta">{sectorLocked ? '🔒' : `${l.minutes} MIN · +${l.xp} XP`}</span>
                </>
              );
              return sectorLocked
                ? <div className={cls} key={l.slug}>{row}</div>
                : <Link className={cls} key={l.slug} href={`/academy/lesson/${l.slug}`}>{row}</Link>;
            })}
          </div>
        );
      })}

      <div className="kc-sector">
        <div className="kc-sector-head"><span className="kc-eyebrow">REGISTRY</span><h2>BADGES</h2></div>
        <div style={{ marginTop: 14 }}><BadgeGrid earned={badges} /></div>
      </div>
    </main>
  );
}
