/* ============================================================
   AUDIO — fully synthesised retro sounds & music (no assets)
   ============================================================ */
import { store } from './storage.js';

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.engine = null;
    this.wind = null;
    this.musicTimer = null;
    this.step = 0;
    this.tempo = 150;
    this.scale = [0, 3, 5, 7, 10, 12];
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.30;
      this.musicGain.connect(this.master);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.master);
    } catch (e) {
      console.warn('[Vyaruth] Audio init failed:', e);
    }
  }

  get settings() { return store.get('settings'); }
  get muted() { return this.settings.mute; }

  tone(freq, dur, type = 'square', vol = 0.2, when = 0, target = null, slideTo = null) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(target || this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noise(dur, vol = 0.2, filterFreq = 1200, when = 0) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.value = vol;
    src.connect(filter); filter.connect(gain); gain.connect(this.sfxGain);
    src.start(t);
  }

  /* ------------- SFX ------------- */
  coin() {
    if (!this.settings.sfx) return;
    this.tone(880, 0.08, 'square', 0.18);
    this.tone(1320, 0.10, 'square', 0.14, 0.06);
  }
  jump() {
    if (!this.settings.sfx) return;
    this.tone(220, 0.20, 'square', 0.18, 0, null, 620);
  }
  slide() {
    if (!this.settings.sfx) return;
    this.noise(0.28, 0.16, 2600);
  }
  crash() {
    if (!this.settings.sfx) return;
    this.noise(0.45, 0.35, 700);
    this.tone(160, 0.4, 'sawtooth', 0.25, 0, null, 60);
  }
  pass() {
    if (!this.settings.sfx) return;
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.16, 'square', 0.16, i * 0.09));
  }
  power(kind = 'generic') {
    if (!this.settings.sfx) return;
    const base = kind === 'shield' ? 400 : kind === 'boost' ? 600 : 500;
    [0, 1, 2, 3].forEach(i => this.tone(base + i * 130, 0.12, 'triangle', 0.2, i * 0.07));
  }
  shieldBreak() {
    if (!this.settings.sfx) return;
    this.tone(900, 0.25, 'sine', 0.25, 0, null, 180);
    this.noise(0.25, 0.15, 4000);
  }
  ui() {
    if (!this.settings.sfx) return;
    this.tone(660, 0.05, 'square', 0.12);
  }
  levelUp() {
    if (!this.settings.sfx) return;
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.22, 'square', 0.18, i * 0.12));
  }
  thunder() {
    if (!this.settings.sfx) return;
    this.noise(0.9, 0.3, 300);
  }

  /* ------------- Ambience ------------- */
  startEngine() {
    if (!this.ctx || this.muted || this.engine) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 58;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 240;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.055;
    osc.connect(filter); filter.connect(gain); gain.connect(this.master);
    osc.start();
    this.engine = { osc, gain };
  }
  stopEngine() {
    if (!this.engine) return;
    try { this.engine.osc.stop(); } catch (e) { /* already stopped */ }
    this.engine = null;
  }
  startWind(level = 1) {
    if (!this.ctx || this.muted || this.wind) return;
    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.value = 500 + level * 90; filter.Q.value = 0.6;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.018 + level * 0.004;
    src.connect(filter); filter.connect(gain); gain.connect(this.master);
    src.start();
    this.wind = { src, gain, filter };
  }
  stopWind() {
    if (!this.wind) return;
    try { this.wind.src.stop(); } catch (e) { /* already stopped */ }
    this.wind = null;
  }

  /* ------------- Music ------------- */
  startMusic(level = 1) {
    if (!this.ctx || this.musicTimer) return;
    this.step = 0;
    this.tempo = 148 + level * 6;
    const bass = [0, 0, 5, 5, 3, 3, 7, 7];
    const melody = [12, 15, 19, 15, 12, 17, 19, 22, 19, 17, 15, 12, 10, 12, 15, 19];
    this.musicTimer = setInterval(() => {
      if (!this.settings.music || this.muted || !this.ctx) return;
      const s = this.step++;
      const root = 220;
      const semi = n => root * Math.pow(2, n / 12);
      // bass pulse
      if (s % 2 === 0) {
        this.tone(semi(bass[(s / 2) % bass.length] - 24), 0.16, 'triangle', 0.16, 0, this.musicGain);
      }
      // melody
      const m = melody[s % melody.length];
      this.tone(semi(m - 12), 0.11, 'square', 0.075, 0, this.musicGain);
      // hi-hat
      if (s % 2 === 1) this.noiseMusic(0.04, 0.035);
    }, 60000 / this.tempo / 2);
  }

  noiseMusic(dur, vol) {
    if (!this.ctx || this.muted) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource(); src.buffer = buf;
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000;
    const g = this.ctx.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(this.musicGain);
    src.start();
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }

  stopAll() {
    this.stopMusic();
    this.stopEngine();
    this.stopWind();
  }
}

export const audio = new AudioEngine();
