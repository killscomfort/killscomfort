'use client';
import Link from 'next/link';
import Wheel from '../../components/Wheel';
import { AsciiHeader, StatusLine } from '../../components/academy-ui';
import { SECTORS, LESSONS, TOTAL_XP } from '../../content/curriculum';
import { keyColor, KEYS } from '../../lib/theory';

export default function AcademyLanding() {
  return (
    <main>
      <AsciiHeader />
      <StatusLine text="academy.init // 6 sectors / 26 lessons / one wheel" />

      <section className="kc-grid kc-grid-2" style={{ alignItems: 'center' }}>
        <div>
          <p className="kc-eyebrow">MUSIC THEORY // COLOR // SACRED GEOMETRY</p>
          <h1 style={{ fontSize: 26, margin: '10px 0 14px' }}>See harmony. Then produce with it.</h1>
          <p>
            Twelve keys mapped onto the twelve hues of the color wheel — the circle of fifths
            as your eyes already understand it. Learn theory, chords, progressions,
            harmonic DJ mixing, and spectrum-level mixing through one visual system,
            with the geometry the ancients found inside it.
          </p>
          <p style={{ color: 'var(--kc-dim)', fontSize: 12 }}>
            Earn XP · unlock sectors · collect badges · keep the streak alive.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Link href="/academy/auth" className="kc-btn">Start free — Sector 01</Link>
            <a href="#curriculum" className="kc-btn ghost">Curriculum ↓</a>
          </div>
        </div>
        <div>
          <Wheel size={360} />
          <p style={{ textAlign: 'center', color: 'var(--kc-dim)', fontSize: 10, letterSpacing: '.1em' }}>
            TAP TO HEAR — OUTER = MAJOR, INNER = MINOR ✦ NO SOUND ON IPHONE? FLIP THE RING/SILENT SWITCH
          </p>
        </div>
      </section>

      <section id="curriculum">
        {SECTORS.map((s) => (
          <div className="kc-sector" key={s.n}>
            <div className="kc-sector-head">
              <span className="kc-eyebrow">{s.code}</span>
              <h2>{s.title}</h2>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: s.free ? 'var(--kc-ok)' : 'var(--kc-dim)' }}>
                {s.free ? '[FREE]' : '[FULL SPECTRUM]'}
              </span>
            </div>
            <p className="kc-thesis">{s.thesis}</p>
            {LESSONS.filter((l) => l.sector === s.n).map((l, i) => (
              <div className="kc-lesson" key={l.slug}>
                <span className="dot" style={{ background: keyColor(KEYS[(s.n * 4 + i) % 12].hue) }} />
                <span className="t">{l.title}</span>
                <span className="meta">{l.minutes} MIN · +{l.xp} XP</span>
              </div>
            ))}
          </div>
        ))}
      </section>


      <section className="kc-sector">
        <div className="kc-sector-head"><span className="kc-eyebrow">SUPPORT</span><h2>FAQ</h2></div>
        {[
          ['Do I need to read sheet music or play an instrument?', 'No. The course teaches from zero using the wheel, your ears, and your DAW. Notation is explained where useful, never required.'],
          ["I'm a DJ, not a producer — is this for me?", 'Especially you. The Camelot wheel you already mix with IS this wheel — Sector 05 makes the whole system transparent, and every earlier sector explains why your mixes work.'],
          ['How do streaks work? What if I miss a day?', "Complete any lesson to keep the day alive — counted in YOUR timezone, not server time. Miss one day and your streak is automatically shielded; it only resets after two missed days. Your longest streak is recorded forever either way."],
          ['No sound when I tap the wheel?', 'On iPhone, flip the ring/silent switch and raise the volume — iOS mutes web audio in silent mode. On desktop, click the wheel once to wake the audio engine.'],
          ['I paid but sectors are still locked.', "Give it a few seconds after checkout — unlock is automatic. If it's still locked after a minute, refresh the dashboard while logged into the SAME email you paid with. Your purchase is tied to your account, never lost."],
          ['Does my progress work across devices?', 'Yes — one account, everything syncs: XP, streaks, badges, lesson history. Log in anywhere.'],
          ['Is Full Spectrum a subscription?', 'No. One payment, $49, yours permanently — including future lessons added to the wheel.'],
          ['Can I try it without signing up?', 'Yes — Continue as guest starts the free sectors instantly, no email. Guest progress lives on that device only; add an email anytime from your dashboard to keep it forever and enable purchases. No confirmation link — we email a welcome note instead.'],
          ['I have a discount or access code — where does it go?', 'Discount codes: tap Unlock Full Spectrum and enter the code on the checkout page. Access codes (free unlocks): enter them in the Access Code box on your dashboard.'],
          ['Forgot your password?', "Use 'Forgot password?' on the login screen — a reset link lands in your email within a minute (check spam)."],
        ].map(([q, a]) => (
          <details key={q} className="kc-panel" style={{ marginBottom: 8 }}>
            <summary style={{ cursor: 'pointer', fontSize: 13 }}>{q}</summary>
            <p style={{ fontSize: 12.5, marginTop: 10, marginBottom: 0 }}>{a}</p>
          </details>
        ))}
      </section>

      <section className="kc-panel" style={{ marginTop: 40, textAlign: 'center' }}>
        <p className="kc-eyebrow">FULL SPECTRUM ACCESS</p>
        <p className="kc-price">$49 <span style={{ fontSize: 13, color: 'var(--kc-dim)' }}>one-time</span></p>
        <p className="kc-li">
          Sectors 01–02 <b>free forever</b> with signup · <b>first 20 registry seats</b> unlock Full Spectrum free ·
          after that, $49 unlocks all 26 lessons,{' '}{TOTAL_XP} total XP, every badge, and everything the wheel can teach.
        </p>
        <Link href="/academy/auth" className="kc-btn">Enter the Academy</Link>
      </section>
    </main>
  );
}
