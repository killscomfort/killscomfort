'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/academy-supabase';
import Wheel from '../../../../components/Wheel';
import { GeometryFigure } from '../../../../components/Geometry';
import { StatusLine } from '../../../../components/academy-ui';
import { lessonBySlug, nextLesson, SECTORS } from '../../../../content/curriculum';
import { badgeById } from '../../../../lib/theory';

const WHEEL_OVERLAYS = new Set(['dodecagram', 'triangle', 'square', 'hexagon', 'diameter']);

// Minimal **bold** renderer — no HTML injection.
function Rich({ text }: { text: string }) {
  const parts = text.split('**');
  return <p>{parts.map((p, i) => (i % 2 ? <strong key={i}>{p}</strong> : p))}</p>;
}

export default function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const lesson = lessonBySlug(slug);
  const [authed, setAuthed] = useState(false);
  const [access, setAccess] = useState(false);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [reward, setReward] = useState<{ xp: number; streak: number; newBadges: string[]; already: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const sb = supabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return router.replace('/academy/auth');
      setAuthed(true);
      const { data: p } = await sb.from('profiles').select('has_full_access').eq('id', user.id).single();
      setAccess(Boolean(p?.has_full_access));
    })();
  }, [router]);

  if (!lesson) return <StatusLine text={`lesson.${slug}`} ok={false} />;
  const sector = SECTORS.find((s) => s.n === lesson.sector)!;
  if (!authed) return <StatusLine text="registry.sync" />;
  if (!lesson.free && !access) {
    const buyFullSpectrum = async () => {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else alert(error ?? 'Checkout unavailable');
    };
    return (
      <main>
        <StatusLine text={`${sector.code} // ${lesson.tag}`} ok={false} />
        <div className="kc-panel" style={{ textAlign: 'center' }}>
          <p className="kc-eyebrow">YOU&apos;VE REACHED THE EDGE OF THE FREE SPECTRUM</p>
          <p>Sectors 01–02 were the foundations. <strong>{lesson.title}</strong> and everything past it — chords, progressions, harmonic DJ mixing, spectrum mixing — lives in Full Spectrum.</p>
          <p style={{ fontSize: 12, color: 'var(--kc-dim)' }}>One payment. Yours permanently. All 27 lessons, every badge, future lessons included.</p>
          <button className="kc-btn" onClick={buyFullSpectrum}>Continue — Unlock Full Spectrum $49</button>
          <p style={{ marginTop: 10 }}><Link href="/academy/dashboard" style={{ fontSize: 12, color: 'var(--kc-dim)' }}>Back to dashboard</Link></p>
        </div>
      </main>
    );
  }

  const qs = lesson.task.questions;
  const allPicked = qs.every((_, i) => picks[i] != null);
  const score = qs.reduce((s, q, i) => s + (picks[i] === q.answer ? 1 : 0), 0);
  const passed = score === qs.length;
  const next = nextLesson(lesson.slug);

  const submit = async () => {
    setSubmitted(true);
    if (!qs.every((q, i) => picks[i] === q.answer)) return; // show corrections; allow retry
    const sb = supabase();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
    const { data, error } = await sb.rpc('complete_lesson', { p_slug: lesson.slug, p_score: score, p_tz: tz });
    if (error || !data?.ok) return setErr(error?.message ?? data?.error ?? 'sync failed');
    setReward({ xp: data.xp, streak: data.streak, newBadges: data.new_badges ?? [], already: Boolean(data.already) });
  };

  return (
    <main>
      <StatusLine text={`${sector.code} // ${lesson.tag} // +${lesson.xp} XP`} />
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>{lesson.title}</h1>
      <p className="kc-eyebrow" style={{ marginBottom: 20 }}>{sector.title} · {lesson.minutes} MIN READ</p>

      {(lesson.focusKeys.length > 0 || WHEEL_OVERLAYS.has(lesson.geometry ?? '')) && (
        <div style={{ maxWidth: 300, margin: '0 auto 8px' }}>
          <Wheel size={300} focusKeys={lesson.focusKeys}
            overlay={WHEEL_OVERLAYS.has(lesson.geometry ?? '') ? (lesson.geometry as 'dodecagram' | 'triangle' | 'square' | 'hexagon' | 'diameter') : null} />
        </div>
      )}

      <div className="kc-lesson-body">
        {lesson.content.map((p, i) => <Rich key={i} text={p} />)}
      </div>

      <GeometryFigure kind={lesson.geometry} />

      <section className="kc-quiz">
        <p className="kc-eyebrow">TASK // {lesson.task.intro}</p>
        {qs.map((q, qi) => (
          <div className="kc-q" key={qi}>
            <p className="qq">{String(qi + 1).padStart(2, '0')} · {q.q}</p>
            {q.options.map((opt, oi) => {
              const sel = picks[qi] === oi;
              let cls = 'kc-opt';
              if (sel) cls += ' sel';
              if (submitted && oi === q.answer) cls += ' right';
              if (submitted && sel && oi !== q.answer) cls += ' wrong';
              return (
                <button key={oi} className={cls} disabled={!!reward}
                  onClick={() => { const p = [...picks]; p[qi] = oi; setPicks(p); setSubmitted(false); }}>
                  {opt}
                </button>
              );
            })}
            {submitted && <p className="kc-why">&gt; {q.why}</p>}
          </div>
        ))}

        {!reward && (
          <button className="kc-btn" disabled={!allPicked} onClick={submit}>
            {submitted && !passed ? 'Adjust & re-run check' : 'Run check'}
          </button>
        )}
        {err && <p className="kc-err">&gt; error: {err}</p>}

        {reward && (
          <div className="kc-reward">
            <p className="kc-eyebrow">CHECK PASSED</p>
            <p className="xp">{reward.already ? 'ALREADY LOGGED' : `+${lesson.xp} XP`}</p>
            <p style={{ fontSize: 12, color: 'var(--kc-dim)' }}>
              TOTAL {reward.xp} XP · STREAK {reward.streak} DAY{reward.streak === 1 ? '' : 'S'}
            </p>
            {reward.newBadges.map((id) => {
              const b = badgeById(id);
              return b ? <p key={id} style={{ color: 'var(--kc-ok)', fontSize: 13 }}>✦ BADGE EARNED — {b.name}</p> : null;
            })}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 12 }}>
              {next && <Link href={`/academy/lesson/${next.slug}`} className="kc-btn">Next: {next.title} →</Link>}
              <Link href="/academy/dashboard" className="kc-btn ghost">Dashboard</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
