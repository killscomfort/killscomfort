'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/academy-supabase';
import { StatusLine } from '../../../components/academy-ui';

type Mode = 'signup' | 'login' | 'forgot' | 'recovery';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // If the user arrived from a password-reset email, Supabase puts a
  // recovery session in the URL — show the "set new password" form.
  useEffect(() => {
    const sb = supabase();
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('recovery');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setShowPassword(false);
    setPassword('');
    setErr(null);
    setNotice(null);
  }, [mode]);

  const submit = async () => {
    setBusy(true); setErr(null); setNotice(null);
    const sb = supabase();

    if (mode === 'forgot') {
      if (!email.trim()) {
        setBusy(false);
        return setErr('Enter the email on your registry entry.');
      }
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/academy/auth`,
      });
      setBusy(false);
      if (error) return setErr(error.message);
      return setNotice(
        'Reset link sent to ' + email.trim().toLowerCase() +
          '. Check inbox + spam, open it on this device, then set a new password.'
      );
    }

    if (mode === 'recovery') {
      if (password.length < 6) {
        setBusy(false);
        return setErr('New password must be at least 6 characters.');
      }
      const { error } = await sb.auth.updateUser({ password });
      setBusy(false);
      if (error) return setErr(error.message);
      setNotice('Password updated — taking you to the dashboard.');
      return router.push('/academy/dashboard');
    }

    if (mode === 'signup') {
      if (!username.trim()) {
        setBusy(false);
        return setErr('Pick a username so we can put you on the board.');
      }

      const res = await fetch('/api/academy/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: username.trim() }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBusy(false);
        if (payload.code === 'already_registered') {
          setMode('login');
          return setErr(payload.error ?? 'That email is already registered — log in instead.');
        }
        return setErr(payload.error ?? 'Could not create your registry entry.');
      }

      const { error } = await sb.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setErr(error.message);
      return router.push('/academy/dashboard');
    }

    const { error } = await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return setErr(error.message);
    router.push('/academy/dashboard');
  };

  const titles: Record<Mode, string> = {
    signup: 'Create your registry entry',
    login: 'Log back in',
    forgot: 'Reset your password',
    recovery: 'Set a new password',
  };

  return (
    <main style={{ maxWidth: 420, margin: '0 auto' }}>
      <StatusLine text={`registry.${mode}`} />
      <h1 style={{ fontSize: 20 }}>{titles[mode]}</h1>
      {mode === 'signup' && (
        <p style={{ fontSize: 13, color: 'var(--kc-dim)' }}>
          Sectors 01–02 are free with an account. First 20 registry seats unlock Full Spectrum free.
          No email confirmation — you&apos;re in immediately, and we&apos;ll send a welcome note to keep you locked into the process.
        </p>
      )}
      {mode === 'forgot' && (
        <p style={{ fontSize: 13, color: 'var(--kc-dim)' }}>
          Enter your registry email. We&apos;ll send a one-time reset link — open it here, then choose a new password (you can show it while typing).
        </p>
      )}
      {mode === 'recovery' && (
        <p style={{ fontSize: 13, color: 'var(--kc-dim)' }}>
          Choose a new password for your academy account. Use show password if you want to verify it before saving.
        </p>
      )}

      {mode === 'signup' && (
        <input className="kc-field" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      )}
      {mode !== 'recovery' && (
        <input className="kc-field" placeholder="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      )}
      {mode !== 'forgot' && (
        <div className="kc-field-wrap">
          <input
            className="kc-field"
            placeholder={mode === 'recovery' ? 'new password' : 'password'}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            className="kc-field-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      )}

      {err && <p className="kc-err">&gt; error: {err}</p>}
      {notice && <p style={{ color: 'var(--kc-ok)', fontSize: 12 }}>&gt; {notice}</p>}

      <button className="kc-btn" style={{ width: '100%' }} disabled={busy} onClick={submit}>
        {busy ? '…' : mode === 'signup' ? 'Sign up' : mode === 'login' ? 'Log in' : mode === 'forgot' ? 'Send reset link' : 'Save new password'}
      </button>

      {mode === 'signup' && (
        <>
          <button className="kc-btn ghost" style={{ width: '100%', marginTop: 8 }} disabled={busy} onClick={async () => {
            setBusy(true); setErr(null);
            const { error } = await supabase().auth.signInAnonymously();
            setBusy(false);
            if (error) return setErr(error.message);
            router.push('/academy/dashboard');
          }}>
            Continue as guest →
          </button>
          <p style={{ fontSize: 10.5, color: 'var(--kc-dim)', marginTop: 6 }}>
            Guest progress lives on this device only — add an email later to keep your XP, streak and badges forever.
          </p>
        </>
      )}

      <div style={{ fontSize: 12, color: 'var(--kc-dim)', marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {mode !== 'signup' && <button className="kc-btn ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { setMode('signup'); }}>Create account</button>}
        {mode !== 'login' && mode !== 'recovery' && <button className="kc-btn ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { setMode('login'); }}>Log in</button>}
        {(mode === 'login' || mode === 'forgot') && (
          <button
            className="kc-btn ghost"
            style={{ padding: '4px 10px', fontSize: 11 }}
            onClick={() => { setMode(mode === 'forgot' ? 'login' : 'forgot'); }}
          >
            {mode === 'forgot' ? 'Back to log in' : 'Forgot password?'}
          </button>
        )}
      </div>
    </main>
  );
}
