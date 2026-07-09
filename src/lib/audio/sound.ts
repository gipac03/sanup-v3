/**
 * Motore audio di SanUp. Tutti i suoni sono sintetizzati con la Web Audio API.
 * La musica di sottofondo è stata rimossa — rimangono solo i feedback sonori
 * (click, risposta corretta, risposta sbagliata).
 */

export interface SoundSettings {
  sfx: boolean;
}

const KEY = "sanup:sound";
const DEFAULTS: SoundSettings = { sfx: true };

let settings: SoundSettings = DEFAULTS;
let loaded = false;

function load(): SoundSettings {
  if (loaded) return settings;
  loaded = true;
  if (typeof window === "undefined") return settings;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) settings = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SoundSettings>) };
  } catch {
    /* storage non disponibile */
  }
  return settings;
}

export function getSoundSettings(): SoundSettings {
  return { ...load() };
}

export function setSoundSettings(patch: Partial<SoundSettings>): SoundSettings {
  settings = { ...load(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignora */
  }
  return { ...settings };
}

// ---- Contesto audio --------------------------------------------------------

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  return ctx;
}

export function unlockAudio(): void {
  const c = ensureCtx();
  if (c && c.state === "suspended") void c.resume();
}

// ---- Effetti (SFX) ---------------------------------------------------------

function tone(
  freq: number,
  start: number,
  dur: number,
  peak: number,
  type: OscillatorType = "sine"
) {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(master);
  o.start(start);
  o.stop(start + dur + 0.02);
}

export function playClick(): void {
  if (!load().sfx) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  tone(540, c.currentTime, 0.09, 0.12, "triangle");
}

export function playCorrect(): void {
  if (!load().sfx) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const t = c.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
    tone(f, t + i * 0.075, 0.22, 0.14, "sine");
  });
}

export function playWrong(): void {
  if (!load().sfx) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const t = c.currentTime;
  tone(233.08, t, 0.18, 0.12, "sine");
  tone(174.61, t + 0.12, 0.28, 0.12, "sine");
}
