// audioEngine.ts
// Web Audio synthesis + a tight step sequencer. Browser-only, framework-agnostic.
// No audio files — every sound is synthesized, so nothing to host.

let ctx: AudioContext | null = null;

/** Lazily create/resume the AudioContext. Must be called from a user gesture the first time. */
export function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function env(g: GainNode, t: number, attack: number, decay: number, peak: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

export function kick(t: number) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(46, t + 0.12);
  env(g, t, 0.002, 0.3, 0.9);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.34);
}

export function snare(t: number) {
  const c = getCtx();
  if (!c) return;
  const len = Math.floor(c.sampleRate * 0.2);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const n = c.createBufferSource();
  n.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 1500;
  const g = c.createGain();
  env(g, t, 0.001, 0.16, 0.45);
  n.connect(f).connect(g).connect(c.destination);
  n.start(t);
  const o = c.createOscillator();
  const g2 = c.createGain();
  o.type = "triangle";
  o.frequency.setValueAtTime(185, t);
  env(g2, t, 0.001, 0.09, 0.22);
  o.connect(g2).connect(c.destination);
  o.start(t);
  o.stop(t + 0.12);
}

export function hat(t: number, open = false) {
  const c = getCtx();
  if (!c) return;
  const dur = open ? 0.16 : 0.04;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const n = c.createBufferSource();
  n.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = 8000;
  const g = c.createGain();
  env(g, t, 0.001, dur, 0.2);
  n.connect(f).connect(g).connect(c.destination);
  n.start(t);
}

export function bass(t: number, freq = 55) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = "sawtooth";
  o.frequency.value = freq;
  f.type = "lowpass";
  f.frequency.setValueAtTime(440, t);
  f.frequency.exponentialRampToValueAtTime(130, t + 0.2);
  env(g, t, 0.004, 0.24, 0.5);
  o.connect(f).connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.3);
}

export function blip(t: number, freq: number) {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "square";
  o.frequency.value = freq;
  env(g, t, 0.001, 0.12, 0.16);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.14);
}

/** Quick confirmation arpeggio for unlocks. */
export function chime() {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  [392, 523, 659, 784].forEach((f, i) => blip(t + i * 0.07, f));
}

/** Short melodic motif used by the "secret mixes" preview players. */
export function playMotif(steps: number[], root = 220) {
  const c = getCtx();
  if (!c) return;
  steps.forEach((semi, i) => {
    const f = root * Math.pow(2, semi / 12);
    const t = c.currentTime + i * 0.16;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    env(g, t, 0.004, 0.18, 0.22);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + 0.2);
    if (i % 2 === 0) kick(t);
  });
}

// ---------- Sequencer ----------

export const LANES = ["kick", "snare", "hat", "bass"] as const;
export type Lane = (typeof LANES)[number];
export const STEPS = 16;
export const LANE_LABELS: Record<Lane, string> = { kick: "KICK", snare: "SNARE", hat: "HAT", bass: "BASS" };

// Simple bassline movement across the bar.
export const BASSNOTES = [55, 55, 73, 55, 55, 55, 82, 55, 49, 49, 65, 49, 55, 55, 73, 82];

export type Grid = Record<Lane, boolean[]>;

export function emptyGrid(): Grid {
  return {
    kick: new Array(STEPS).fill(false),
    snare: new Array(STEPS).fill(false),
    hat: new Array(STEPS).fill(false),
    bass: new Array(STEPS).fill(false),
  };
}

export function starterGrid(): Grid {
  return {
    kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, true, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
    bass: [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false],
  };
}

export function trigger(lane: Lane, t: number, step: number) {
  if (lane === "kick") kick(t);
  else if (lane === "snare") snare(t);
  else if (lane === "hat") hat(t, false);
  else if (lane === "bass") bass(t, BASSNOTES[step]);
}

/** Lookahead scheduler driven by the AudioContext clock for tight timing. */
export class Sequencer {
  playing = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextTime = 0;

  constructor(
    private getGrid: () => Grid,
    private getBpm: () => number,
    private onStep: (i: number) => void
  ) {}

  start() {
    const c = getCtx();
    if (!c || this.playing) return;
    this.playing = true;
    this.step = 0;
    this.nextTime = c.currentTime + 0.06;
    this.timer = setInterval(this.tick, 25);
  }

  stop() {
    this.playing = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private tick = () => {
    const c = getCtx();
    if (!c) return;
    const ahead = 0.1;
    const stepDur = 60 / this.getBpm() / 4; // 16th notes
    const grid = this.getGrid();
    while (this.nextTime < c.currentTime + ahead) {
      const s = this.step;
      (Object.keys(grid) as Lane[]).forEach((lane) => {
        if (grid[lane][s]) trigger(lane, this.nextTime, s);
      });
      const when = Math.max(0, (this.nextTime - c.currentTime) * 1000);
      const fire = s;
      setTimeout(() => {
        if (this.playing) this.onStep(fire);
      }, when);
      this.nextTime += stepDur;
      this.step = (this.step + 1) % STEPS;
    }
  };
}
