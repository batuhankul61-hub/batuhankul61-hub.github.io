// Küçük WebAudio efektleri: dosya yok, her şey osilatörle üretiliyor.
let ctx: AudioContext | null = null;
let muted = false;

const muteSubs = new Set<(m: boolean) => void>();

export function setMuted(m: boolean) {
  muted = m;
  muteSubs.forEach((f) => f(m));
}
export function isMuted() {
  return muted;
}
/** Sessize alma değişince haber ver (müzik çalar kullanıyor). */
export function onMuteChange(f: (m: boolean) => void) {
  muteSubs.add(f);
  return () => {
    muteSubs.delete(f);
  };
}

/** Ortak AudioContext (müzik de aynı bağlamı kullanır). */
export function audio() {
  return ac();
}

function ac() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "square", vol = 0.05, delay = 0) {
  if (muted) return;
  try {
    const a = ac();
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch {
    /* ses yoksa sessizce geç */
  }
}

export const sfx = {
  unlock: () => {
    try {
      ac();
    } catch {
      /* yok say */
    }
  },
  click: () => tone(1800, 0.03, "square", 0.025),
  beep: () => tone(880, 0.12, "square", 0.04),
  error: () => {
    tone(220, 0.18, "sawtooth", 0.05);
    tone(180, 0.25, "sawtooth", 0.05, 0.12);
  },
  open: () => {
    tone(523, 0.06, "triangle", 0.05);
    tone(784, 0.08, "triangle", 0.05, 0.05);
  },
  close: () => {
    tone(784, 0.06, "triangle", 0.05);
    tone(523, 0.08, "triangle", 0.05, 0.05);
  },
  tap: () => tone(1200, 0.04, "sine", 0.04),
  pop: () => {
    tone(660, 0.07, "sine", 0.05);
    tone(990, 0.09, "sine", 0.04, 0.04);
  },
  soft: () => {
    [392, 523, 659, 784].forEach((f, i) => tone(f, 0.9, "sine", 0.035, i * 0.09));
  },
  /** Kaba mama dökülme sesi: kısa, rastgele tıkırtılar */
  kibble: () => {
    for (let i = 0; i < 7; i++) tone(1400 + Math.random() * 1600, 0.025, "square", 0.018, i * 0.035 + Math.random() * 0.02);
  },
  /** Kedi mırıltısı */
  purr: () => {
    if (muted) return;
    try {
      const a = ac();
      const t = a.currentTime;
      const o = a.createOscillator();
      const lfo = a.createOscillator();
      const lg = a.createGain();
      const am = a.createGain(); // titreşim (genlik modülasyonu)
      const g = a.createGain(); // zarf
      o.type = "sawtooth";
      o.frequency.value = 52;
      lfo.frequency.value = 24;
      am.gain.value = 0.5;
      lg.gain.value = 0.5;
      lfo.connect(lg).connect(am.gain);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.15);
      g.gain.linearRampToValueAtTime(0.0001, t + 1.1);
      const f = a.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 300;
      o.connect(f).connect(am).connect(g).connect(a.destination);
      o.start(t);
      lfo.start(t);
      o.stop(t + 1.2);
      lfo.stop(t + 1.2);
    } catch {
      /* yok say */
    }
  },
  chime: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.5, "triangle", 0.05, i * 0.12));
  },
  meow: () => {
    if (muted) return;
    try {
      const a = ac();
      const t = a.currentTime;
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(500, t);
      o.frequency.linearRampToValueAtTime(900, t + 0.12);
      o.frequency.linearRampToValueAtTime(420, t + 0.4);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.05, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      const f = a.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = 1400;
      o.connect(f).connect(g).connect(a.destination);
      o.start(t);
      o.stop(t + 0.5);
    } catch {
      /* yok say */
    }
  },
};
