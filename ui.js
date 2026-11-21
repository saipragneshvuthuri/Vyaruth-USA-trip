/* ============================================================
   UI — all screens, HUD, menus, shop, settings, dialogue
   ============================================================ */
import { LEVELS, OUTFITS, SHOP_ITEMS, POWERUPS } from './config.js';
import { store } from './storage.js';
import { audio } from './audio.js';

const $ = id => document.getElementById(id);
const hex = n => '#' + n.toString(16).padStart(6, '0');

export class UI {
  constructor() {
    this.game = null;
    this.screens = {
      lock: $('screen-lock'), story: $('screen-story'), menu: $('screen-menu'), levels: $('screen-levels'),
      characters: $('screen-characters'), shop: $('screen-shop'), settings: $('screen-settings'),
      intro: $('screen-intro'), pause: $('screen-pause'), gameover: $('screen-gameover'),
      ending: $('screen-ending'),
    };
    this.hud = $('hud');
    this.toastTimer = null;
    this.comboTimer = null;
    this.puRefs = {};
    this.bind();
  }

  attach(game) { this.game = game; }

  getOutfit(id) { return OUTFITS.find(o => o.id === id) || OUTFITS[0]; }

  /* -------------------------- Navigation ---------------------- */
  bind() {
    document.querySelectorAll('[data-nav]').forEach(b => {
      b.addEventListener('click', () => {
        audio.init(); audio.ui();
        const dest = b.dataset.nav;
        if (dest === 'play') { this.playStory(); return; }
        if (dest === 'endless') { this.playEndless(); return; }
        if (dest === 'story') { if (this.story) this.story.play(); return; }
        if (dest === 'menu') {
          if (this.game) this.game.quit();
          else { this.showScreen('menu'); this.refreshMenu(); }
          return;
        }
        this.showScreen(dest);
        if (dest === 'levels') this.renderLevels();
        if (dest === 'characters') this.renderCharacters();
        if (dest === 'shop') this.renderShop();
        if (dest === 'settings') this.syncSettings();
      });
    });

    $('btn-start-run').addEventListener('click', () => {
      audio.init(); audio.ui();
      this.showScreen(null);
      this.showHUD(true);
      this.game.beginRun();
    });
    $('btn-pause').addEventListener('click', () => this.game.pause());
    $('btn-resume').addEventListener('click', () => { audio.ui(); this.game.resume(); });
    $('btn-restart').addEventListener('click', () => { audio.ui(); this.game.restart(); });
    $('btn-pause-settings').addEventListener('click', () => {
      audio.ui(); this.showScreen('settings'); this.syncSettings();
    });
    $('btn-quit').addEventListener('click', () => { audio.ui(); this.game.quit(); });
    $('btn-again').addEventListener('click', () => { audio.ui(); this.game.restart(); });
    $('btn-next-level').addEventListener('click', () => { audio.ui(); this.game.nextLevel(); });
    $('btn-go-menu').addEventListener('click', () => { audio.ui(); this.game.quit(); });
    $('btn-end-continue').addEventListener('click', () => { audio.ui(); this.game.quit(); });
    $('btn-end-menu').addEventListener('click', () => { audio.ui(); this.game.quit(); });

    // settings
    const keys = ['music', 'sfx', 'pixel', 'shake', 'mute'];
    keys.forEach(k => {
      const el = $('set-' + k);
      el.addEventListener('change', () => {
        const s = store.get('settings');
        s[k] = el.checked;
        store.set('settings', s);
        audio.ui();
        if (k === 'pixel') this.game.setPixelMode();
        if (k === 'mute' && el.checked) audio.stopAll();
      });
    });
    $('btn-reset').addEventListener('click', () => {
      if (!window.confirm('Delete ALL progress, coins and high scores? Vyaruth will be very upset.')) return;
      store.reset();
      this.syncSettings();
      this.refreshMenu();
      this.showScreen('menu');
      this.game.setPixelMode();
    });
  }

  syncSettings() {
    const s = store.get('settings');
    ['music', 'sfx', 'pixel', 'shake', 'mute'].forEach(k => { $('set-' + k).checked = !!s[k]; });
  }

  showScreen(name) {
    Object.entries(this.screens).forEach(([k, el]) => el.classList.toggle('active', k === name));
    if (name) this.hud.classList.add('hidden');
  }

  showPause(on) {
    this.screens.pause.classList.toggle('active', !!on);
    $('mobile-controls').classList.add('hidden');
  }

  playStory() {
    const unlocked = store.get('storyUnlocked');
    const idx = Math.min(unlocked, LEVELS.length) - 1;
    this.game.prepareRun(idx, 'story');
  }

  playEndless() {
    if (!store.get('endlessUnlocked')) {
      this.toast('Finish the story first. Vizag is not a shortcut.', 'GATE OFFICER', 3.6);
      audio.crash();
      return;
    }
    this.game.prepareRun(0, 'endless');
  }

  refreshMenu() {
    $('menu-highscore').textContent = store.get('highScore').toLocaleString();
    $('menu-coins').textContent = store.get('totalCoins').toLocaleString();
    $('endless-lock').textContent = store.get('endlessUnlocked') ? '' : '🔒';
  }

  /* --------------------------- Levels ------------------------- */
  renderLevels() {
    const list = $('level-list');
    list.innerHTML = '';
    const unlocked = store.get('storyUnlocked');
    LEVELS.forEach((lv, i) => {
      const locked = lv.id > unlocked;
      const done = store.get('storyCompleted') || lv.id < unlocked;
      const card = document.createElement('button');
      card.className = 'level-card' + (locked ? ' locked' : '');
      card.innerHTML = `
        <div class="level-num">LEVEL ${lv.id}${done ? ' ✓' : ''}</div>
        <div class="level-name">${lv.name}</div>
        <div class="level-desc">${lv.intro.slice(0, 96)}...</div>
        <div class="level-status">${locked ? '🔒 LOCKED' : done ? '✓ COMPLETED' : '▶ READY TO RUN'}</div>
      `;
      if (!locked) card.addEventListener('click', () => { audio.ui(); this.game.prepareRun(i, 'story'); });
      list.appendChild(card);
    });
  }

  /* ------------------------ Characters ------------------------ */
  avatarHTML(o) {
    return `<div class="avatar">
      <div class="a-head" style="background:${hex(o.skin)}"></div>
      <div class="a-hair" style="background:${hex(o.hair)}"></div>
      <div class="a-eye l"></div><div class="a-eye r"></div>
      <div class="a-body" style="background:${hex(o.shirt)}"></div>
    </div>`;
  }

  renderCharacters() {
    const list = $('character-list');
    list.innerHTML = '';
    const selected = store.get('selectedOutfit');
    OUTFITS.forEach(o => {
      const owned = store.hasOutfit(o.id) || o.cost === 0;
      const locked = o.secret && !owned;
      const card = document.createElement('div');
      card.className = 'card' + (selected === o.id ? ' selected' : '') + (owned ? '' : ' locked');
      card.innerHTML = `
        ${this.avatarHTML(o)}
        <div class="card-name">${o.name}</div>
        <div class="card-desc">${locked ? 'A secret ending hides this outfit.' : o.desc}</div>
      `;
      const btn = document.createElement('button');
      btn.className = 'btn';
      if (selected === o.id) {
        btn.textContent = 'EQUIPPED ✓';
        btn.disabled = true;
      } else if (owned) {
        btn.textContent = 'EQUIP';
        btn.addEventListener('click', () => {
          store.set('selectedOutfit', o.id); audio.power('shield'); this.renderCharacters();
        });
      } else {
        btn.innerHTML = `BUY <span class="price">${o.cost}</span> 💰`;
        btn.addEventListener('click', () => {
          if (store.spend(o.cost)) {
            store.unlockOutfit(o.id);
            store.set('selectedOutfit', o.id);
            audio.levelUp(); this.renderCharacters(); this.refreshMenu();
          } else {
            audio.crash(); this.toast('Not enough coins. Go collect some. Obviously.', 'SHOPKEEPER', 3);
          }
        });
      }
      card.appendChild(btn);
      list.appendChild(card);
    });
  }

  /* --------------------------- Shop --------------------------- */
  renderShop() {
    const list = $('shop-list');
    list.innerHTML = '';
    $('shop-coins').textContent = store.get('totalCoins').toLocaleString();
    SHOP_ITEMS.forEach(it => {
      const owned = store.hasItem(it.id);
      const card = document.createElement('div');
      card.className = 'card' + (owned ? ' selected' : '');
      card.innerHTML = `
        <div style="font-size:30px;margin:8px 0 14px">${it.icon}</div>
        <div class="card-name">${it.name}</div>
        <div class="card-desc">${it.desc}</div>
      `;
      const btn = document.createElement('button');
      btn.className = 'btn';
      if (owned) { btn.textContent = 'OWNED ✓'; btn.disabled = true; }
      else {
        btn.innerHTML = `BUY <span class="price">${it.cost}</span> 💰`;
        btn.addEventListener('click', () => {
          if (store.spend(it.cost)) {
            store.unlockItem(it.id);
            audio.levelUp(); this.renderShop(); this.refreshMenu();
          } else {
            audio.crash(); this.toast('Insufficient funds. The shop accepts coins, not excuses.', 'SHOPKEEPER', 3.4);
          }
        });
      }
      card.appendChild(btn);
      list.appendChild(card);
    });
  }

  /* --------------------------- Intro -------------------------- */
  showIntro(level, mode) {
    $('intro-tag').textContent = mode === 'endless' ? 'ENDLESS MODE' : `LEVEL ${level.id} / ${LEVELS.length}`;
    $('intro-title').textContent = level.name;
    $('intro-story').textContent = level.intro;
    $('intro-quote').textContent = level.quote;
    this.showScreen('intro');
  }

  /* ---------------------------- HUD --------------------------- */
  showHUD(on) {
    this.hud.classList.toggle('hidden', !on);
    if (on) {
      const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
      $('mobile-controls').classList.toggle('hidden', !isTouch);
    } else {
      $('mobile-controls').classList.add('hidden');
    }
  }

  updateHUD(d) {
    $('hud-distance').textContent = d.distance.toLocaleString();
    $('hud-score').textContent = d.score.toLocaleString();
    $('hud-coins').textContent = d.coins;
    $('hud-level').textContent = d.mode === 'endless' ? 'ENDLESS SKY ∞' : `L${this.game.level.id}: ${d.level.short}`;

    const passEl = $('pass-progress');
    if (d.mode === 'endless' || d.required === 0) {
      passEl.classList.add('hidden');
    } else {
      passEl.classList.remove('hidden');
      $('pass-text').textContent = `BOARDING PASSES ${d.passes}/${d.required}`;
      $('pass-fill').style.width = `${Math.min(100, (d.passes / d.required) * 100)}%`;
    }

    this.updatePowerups(d.powerups);
  }

  updatePowerups(pu) {
    const bar = $('powerup-bar');
    const active = Object.keys(pu).filter(k => pu[k] > 0);
    const key = active.join(',');
    if (key !== this.puKey) {
      bar.innerHTML = '';
      this.puRefs = {};
      active.forEach(k => {
        const c = POWERUPS[k];
        const el = document.createElement('div');
        el.className = 'pu-icon';
        el.style.borderColor = hex(c.color);
        el.innerHTML = `<span>${c.icon}</span><span class="pu-time"></span><div class="pu-fill"></div>`;
        bar.appendChild(el);
        this.puRefs[k] = { el, time: el.querySelector('.pu-time'), fill: el.querySelector('.pu-fill') };
      });
      this.puKey = key;
    }
    active.forEach(k => {
      const r = this.puRefs[k];
      if (!r) return;
      const cfg = POWERUPS[k];
      r.time.textContent = cfg.duration ? `${pu[k].toFixed(1)}s` : 'READY';
      r.fill.style.width = cfg.duration ? `${(pu[k] / cfg.duration) * 100}%` : '100%';
      r.fill.style.background = hex(cfg.color);
    });
  }

  toast(text, who = 'VYARUTH', dur = 3) {
    const el = $('toast');
    el.innerHTML = `<span class="who">${who}</span>${text}`;
    el.classList.remove('hidden');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.add('hidden'), dur * 1000);
  }

  combo(text) {
    const el = $('combo');
    el.textContent = text;
    el.classList.remove('hidden');
    clearTimeout(this.comboTimer);
    this.comboTimer = setTimeout(() => el.classList.add('hidden'), 1100);
  }

  /* ------------------------ Game Over ------------------------- */
  showGameOver(d) {
    $('go-title').textContent = d.title;
    $('go-message').textContent = d.message;
    $('go-score').textContent = d.score.toLocaleString();
    $('go-distance').textContent = d.distance.toLocaleString() + 'm';
    $('go-coins').textContent = d.coins;
    $('go-best').textContent = d.best.toLocaleString();
    const next = $('btn-next-level');
    next.classList.toggle('hidden', !d.showNext);
    next.textContent = `LEVEL ${d.nextLevel + 1} ▶`;
    this.showScreen('gameover');
    this.refreshMenu();
  }

  /* ------------------------- Ending --------------------------- */
  showEnding(ending, stats) {
    $('ending-badge').textContent = ending.badge;
    $('ending-title').textContent = ending.title;
    $('ending-text').textContent = ending.text;
    $('end-score').textContent = stats.score.toLocaleString();
    $('end-coins').textContent = stats.coins;
    $('end-passes').textContent = stats.passes;
    this.showScreen('ending');
    this.refreshMenu();
    audio.levelUp();
  }
}
