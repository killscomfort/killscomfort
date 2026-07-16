'use client';
import { BADGES, keyColor, levelFromXp, levelTitle } from '../lib/theory';

export function StatusLine({ text, ok = true }: { text: string; ok?: boolean }) {
  return <div className="kc-status">&gt; {text}{' // '}status: <span className={ok ? 'kc-ok' : 'kc-warn'}>[{ok ? 'OK' : 'LOCKED'}]</span></div>;
}

export function XPBar({ xp }: { xp: number }) {
  const { level, pct, nextXp } = levelFromXp(xp);
  return (
    <div className="kc-xp">
      <div className="kc-xp-head">
        <span>LVL {String(level).padStart(2, '0')} — {levelTitle(level)}</span>
        <span>{xp} / {nextXp} XP</span>
      </div>
      <div className="kc-xp-track">
        <div className="kc-xp-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Streak({ days }: { days: number }) {
  return (
    <div className="kc-streak" title="Daily practice streak">
      <span className="kc-streak-n">{days}</span>
      <span className="kc-streak-label">DAY STREAK {days >= 5 ? '✦' : ''}</span>
      <div className="kc-streak-dots">
        {Array.from({ length: 12 }, (_, i) => (
          <i key={i} style={{ background: i < Math.min(days, 12) ? keyColor(i * 30) : '#232327' }} />
        ))}
      </div>
    </div>
  );
}

export function BadgeGrid({ earned }: { earned: string[] }) {
  const have = new Set(earned);
  return (
    <div className="kc-badges">
      {BADGES.map((b) => {
        const on = have.has(b.id);
        return (
          <div key={b.id} className={`kc-badge ${on ? 'is-on' : ''}`}>
            <span className="kc-badge-gem" style={{
              background: on ? keyColor(b.hue) : '#141416',
              boxShadow: on ? `0 0 14px ${keyColor(b.hue, 82, 40)}` : 'none',
            }}>✦</span>
            <div>
              <strong>{b.name}</strong>
              <small>{on ? b.desc : '???'}</small>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AsciiHeader() {
  return (
    <pre className="kc-ascii" aria-hidden>{String.raw`
 ▄▄▄▄▄ ▄   ▄ ▄▄▄▄▄   ▄     ▄ ▄   ▄ ▄▄▄▄▄ ▄▄▄▄▄ ▄
   █   █▄▄▄█ █▄▄     █  █  █ █▄▄▄█ █▄▄▄  █▄▄▄  █
   █   █   █ █▄▄▄▄   █▄▄█▄▄█ █   █ █▄▄▄▄ █▄▄▄▄ █▄▄▄▄
        T H E   C H R O M A T I C   W H E E L`}</pre>
  );
}
