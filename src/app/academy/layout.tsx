import '../../styles/academy.css';
import Link from 'next/link';

export const metadata = {
  title: 'The Chromatic Wheel — KillsComfort Academy',
  description: 'Music theory fluency through the color wheel and sacred geometry — for producers, DJs and engineers.',
};

export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kc-academy">
      <div className="kc-wrap">
        <nav style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, letterSpacing: '.1em', marginBottom: 18 }}>
          <Link href="/">← KILLSCOMFORT</Link>
          <span style={{ display: 'flex', gap: 16 }}>
            <Link href="/academy">ACADEMY</Link>
            <Link href="/academy/dashboard">DASHBOARD</Link>
          </span>
        </nav>
        {children}
        <footer style={{ marginTop: 64, borderTop: '1px solid var(--kc-line)', paddingTop: 16, color: 'var(--kc-dim)', fontSize: 11 }}>
          &gt; geo.lock: MIAMI_AREA // tz: EST — growth lives on the otherside of killing your comforts ✦✦✦
        </footer>
      </div>
    </div>
  );
}
