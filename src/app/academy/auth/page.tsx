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

  const submit = async () => {
    setBusy(true); setErr(null); setNotice(null);
    const sb = supabase();

    if (mode === 'forgot') {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/academy/auth`,
      });
      setBusy(false);
      if (error) return setErr(error.message);
      return setNotice('Reset link sent. Check your email (and spam), then open the link on this device.');
    }

    if (mode === 'recovery') {
      const { error } = await sb.auth.updateUser({ password });
      setBusy(false);
      if (error) return setErr(error.message);
      return router.push('/academy/dashboard');
    }

    if (mode === 'signup') {
      const { data, error } = await sb.auth.signUp({ email, password, options: { data: { username } } });
      setBusy(false);
      if (error) return setErr(error.message);
      // If email confirmation is ON, there's no session yet — say so clearly
      // instead of silently failing (top signup complaint on learning platforms).
      if (!data.session) {
        return setNotice('Almost in — confirm your email. We sent a link to ' + email + '. Open it, then log in here.');
      }
      return router.push('/academy/dashboard');
    }

    const { error } = await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      return setErr(error.message === 'Email not confirmed'
        ? 'Email not confirmed yet — open the confirmation link we sent you, then try again.'
        : error.message);
    }
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
          Sectors 01–02 are free with an account. One account works on every device — progress, XP, badges and streaks sync automatically.
        </p>
      )}

      {mode === 'signup' && (
        <input className="kc-field" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      )}
      {mode !== 'recovery' && (
        <input className="kc-field" placeholder="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      )}
      {mode !== 'forgot' && (
        <input className="kc-field" placeholder={mode === 'recovery' ? 'new password' : 'password'} type="password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
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
        {mode !== 'signup' && <button className="kc-btn ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { setMode('signup'); setErr(null); setNotice(null); }}>Create account</button>}
        {mode !== 'login' && <button className="kc-btn ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { setMode('login'); setErr(null); setNotice(null); }}>Log in</button>}
        {mode === 'login' && <button className="kc-btn ghost" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => { setMode('forgot'); setErr(null); setNotice(null); }}>Forgot password?</button>}
      </div>
    </main>
  );
}
