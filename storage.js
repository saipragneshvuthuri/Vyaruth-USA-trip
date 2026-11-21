/* ============================================================
   STORAGE — persistent progress, settings, high scores
   ============================================================ */

const KEY = 'vyaruth_usa_trip_v1';

const DEFAULTS = {
  highScore: 0,
  bestDistance: 0,
  totalCoins: 0,
  storyUnlocked: 1,      // highest unlocked level id
  storyCompleted: false,
  endlessUnlocked: false,
  outfits: ['desi'],
  selectedOutfit: 'desi',
  items: [],
  settings: { music: true, sfx: true, pixel: false, shake: true, mute: false },
  endingSeen: [],
  runs: 0,
};

function clone(o) { return JSON.parse(JSON.stringify(o)); }

export class Store {
  constructor() {
    this.data = clone(DEFAULTS);
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = { ...clone(DEFAULTS), ...parsed };
        this.data.settings = { ...clone(DEFAULTS.settings), ...(parsed.settings || {}) };
      }
    } catch (e) {
      console.warn('[Vyaruth] Could not load save:', e);
    }
  }

  save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[Vyaruth] Could not save:', e);
    }
  }

  reset() {
    this.data = clone(DEFAULTS);
    this.save();
  }

  get(k) { return this.data[k]; }
  set(k, v) { this.data[k] = v; this.save(); }

  addCoins(n) {
    this.data.totalCoins = Math.max(0, this.data.totalCoins + n);
    this.save();
  }

  spend(n) {
    if (this.data.totalCoins < n) return false;
    this.data.totalCoins -= n;
    this.save();
    return true;
  }

  hasItem(id) { return this.data.items.includes(id); }
  hasOutfit(id) { return this.data.outfits.includes(id); }

  unlockOutfit(id) {
    if (!this.hasOutfit(id)) { this.data.outfits.push(id); this.save(); }
  }

  unlockItem(id) {
    if (!this.hasItem(id)) { this.data.items.push(id); this.save(); }
  }

  unlockLevel(id) {
    if (id > this.data.storyUnlocked) { this.data.storyUnlocked = id; this.save(); }
  }

  completeStory() {
    this.data.storyCompleted = true;
    this.data.endlessUnlocked = true;
    this.data.storyUnlocked = 6;
    this.save();
  }

  recordRun(score, distance, coins) {
    this.data.runs++;
    if (score > this.data.highScore) this.data.highScore = score;
    if (distance > this.data.bestDistance) this.data.bestDistance = distance;
    this.addCoins(coins);
  }

  seeEnding(id) {
    if (!this.data.endingSeen.includes(id)) { this.data.endingSeen.push(id); this.save(); }
  }
}

export const store = new Store();
