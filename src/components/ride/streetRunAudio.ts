import { emptyGrid, getCtx, Sequencer, type Grid } from "./audioEngine";

const RIDE_BPM = 108;

const rideGrid: Grid = {
  ...emptyGrid(),
  kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
  hat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
  bass: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
};

let sequencer: Sequencer | null = null;
let muted = false;

export function setStreetRunMusicMuted(nextMuted: boolean) {
  muted = nextMuted;
  if (muted) {
    stopStreetRunMusic();
    return;
  }
  startStreetRunMusic();
}

export function isStreetRunMusicMuted() {
  return muted;
}

export function startStreetRunMusic() {
  if (muted) return;
  const ctx = getCtx();
  if (!ctx) return;
  if (!sequencer) {
    sequencer = new Sequencer(
      () => rideGrid,
      () => RIDE_BPM,
      () => undefined,
    );
  }
  if (!sequencer.playing) sequencer.start();
}

export function stopStreetRunMusic() {
  sequencer?.stop();
}

export function primeStreetRunAudio() {
  getCtx();
}
