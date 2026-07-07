/**
 * Motore audio di SanUp. Tutti i suoni sono *sintetizzati* con la Web Audio API
 * (nessun file da scaricare): click, esito corretto/sbagliato e una musica
 * ambientale soft in loop.
 *
 * I browser bloccano l'audio finche' non c'e' un gesto dell'utente: chiamare
 * `unlockAudio()` sul primo pointerdown/keydown riattiva il contesto.
 *
 * Le impostazioni (effetti/musica) vivono in localStorage e sono rispettate da
 * ogni funzione, cosi' l'utente puo' silenziare tutto.
 */

export interface SoundSettings {
  sfx: boolean;
  music: boolean;
}

const KEY = "sanup:sound";
const DEFAULTS: SoundSettings = { sfx: true, music: true };

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
    /* storage non disponibile: si usano i default */
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
  // Applica subito l'effetto sulla musica.
  if (settings.music) startMusic();
  else stopMusic();
  return { ...settings };
}

// ---- Contesto audio -----------------------------------------------------

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(master);
  return ctx;
}

/** Da chiamare al primo gesto utente per sbloccare l'audio. */
export function unlockAudio(): void {
  const c = ensureCtx();
  if (c && c.state === "suspended") void c.resume();
}

// ---- Effetti (SFX) ------------------------------------------------------

function tone(
  freq: number,
  start: number,
  dur: number,
  peak: number,
  type: OscillatorType = "sine",
  bus: AudioNode | null = master
) {
  if (!ctx || !bus) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(bus);
  o.start(start);
  o.stop(start + dur + 0.02);
}

export function playClick(): void {
  if (!load().sfx) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const t = c.currentTime;
  tone(540, t, 0.09, 0.12, "triangle");
}

export function playCorrect(): void {
  if (!load().sfx) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const t = c.currentTime;
  // Arpeggio ascendente piacevole (C - E - G - C).
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
  // Due note discendenti soft, non stridenti.
  tone(233.08, t, 0.18, 0.12, "sine");
  tone(174.61, t + 0.12, 0.28, 0.12, "sine");
}

// ---- Musica ambientale --------------------------------------------------

// Pentatonica dolce (Do maggiore): note lunghe che si sovrappongono.
const PAD = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];
let musicOn = false;
let musicTimer: ReturnType<typeof setTimeout> | null = null;

function padNote() {
  if (!ctx || !musicBus) return;
  const now = ctx.currentTime;
  const base = PAD[Math.floor(Math.random() * PAD.length)];
  // due voci: fondamentale + quinta, molto morbide
  [base, base * 1.5].forEach((f, i) => {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = i === 0 ? "sine" : "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(i === 0 ? 0.5 : 0.28, now + 1.1);
    g.gain.linearRampToValueAtTime(0, now + 3.2);
    o.connect(g);
    g.connect(musicBus!);
    o.start(now);
    o.stop(now + 3.4);
  });
}

function scheduleMusic() {
  if (!musicOn) return;
  padNote();
  const next = 1400 + Math.random() * 900;
  musicTimer = setTimeout(scheduleMusic, next);
}

export function startMusic(): void {
  if (!load().music) return;
  const c = ensureCtx();
  if (!c || !musicBus) return;
  if (c.state === "suspended") void c.resume();
  if (musicOn) return;
  musicOn = true;
  // fade-in dolce del bus musica
  musicBus.gain.cancelScheduledValues(c.currentTime);
  musicBus.gain.setValueAtTime(musicBus.gain.value, c.currentTime);
  musicBus.gain.linearRampToValueAtTime(0.05, c.currentTime + 2.5);
  scheduleMusic();
}

export function stopMusic(): void {
  musicOn = false;
  if (musicTimer) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
  if (ctx && musicBus) {
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
  }
}

export function isMusicPlaying(): boolean {
  return musicOn;
}
