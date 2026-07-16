// Tiny Web Audio synth: plays a key's triad when a wheel segment is tapped.
let ctx: AudioContext | null = null;
export function playTriad(freqs: number[], dur = 0.9) {
  if (typeof window === 'undefined') return;
  ctx = ctx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume(); // iOS: contexts start suspended until a user gesture
  const t = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, t);
  master.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
  master.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  master.connect(ctx.destination);
  freqs.forEach((f, i) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = i === 0 ? 'triangle' : 'sine';
    o.frequency.value = f;
    g.gain.value = i === 0 ? 0.5 : 0.33;
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur);
  });
}
