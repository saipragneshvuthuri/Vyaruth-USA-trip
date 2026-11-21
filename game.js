/* ============================================================
   GAME — engine, states, movement, collisions, scoring, flow
   ============================================================ */
import * as THREE from 'three';
import { LEVELS, LANES, PLAYER_Z, POWERUPS, DIALOGUE, CRASH_MESSAGES, getEnding } from './config.js';
import { store } from './storage.js';
import { audio } from './audio.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { World } from './world.js';
import { Effects } from './effects.js';

export class Game {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ui = ui;
    this.state = 'menu';
    this.mode = 'story';
    this.levelIndex = 0;
    this.level = LEVELS[0];

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x10122b);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(LEVELS[0].palette.sky);
    this.scene.fog = new THREE.Fog(LEVELS[0].palette.fog, 42, 150);

    this.camera = new THREE.PerspectiveCamera(62, 1, 0.1, 400);
    this.camera.position.set(0, 6.4, 12);
    this.camera.lookAt(0, 1.6, -8);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x4a5580, 1.15);
    this.scene.add(hemi);
    const fill = new THREE.DirectionalLight(0x9fd4ff, 0.45);
    fill.position.set(-8, 6, -10);
    this.scene.add(fill);
    this.sun = new THREE.DirectionalLight(0xfff2d8, 1.6);
    this.sun.position.set(8, 18, 10);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 80;
    this.sun.shadow.camera.left = -22;
    this.sun.shadow.camera.right = 22;
    this.sun.shadow.camera.top = 22;
    this.sun.shadow.camera.bottom = -22;
    this.sun.shadow.bias = -0.0008;
    this.sun.target.position.set(0, 0, -10);
    this.scene.add(this.sun);
    this.scene.add(this.sun.target);

    this.world = new World(this.scene);
    this.player = new Player();
    this.scene.add(this.player.root);
    this.effects = new Effects(this.scene);

    this.input = new Input(canvas);
    this.input.setEnabled(false);

    // runtime state
    this.targetLane = 1;
    this.playerY = 0;
    this.vy = 0;
    this.sliding = false;
    this.slideTimer = 0;
    this.invuln = 0;
    this.speed = 14;
    this.distance = 0;
    this.coins = 0;
    this.passes = 0;
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.comboBonus = 0;
    this.powerups = { jetpack: 0, magnet: 0, shield: 0, boost: 0 };
    this.runStats = { crashes: 0, passes: 0, coins: 0 };
    this.storyStats = { coins: 0, passes: 0, crashes: 0, allPasses: true };
    this.dialogueTimer = 9;
    this.passWarned = false;
    this.shake = 0;
    this.lastTime = 0;
    this.endingShown = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'running') this.pause();
    });
    window.addEventListener('vyaruth:pause', () => {
      if (this.state === 'running') this.pause();
      else if (this.state === 'paused') this.resume();
    });

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const retro = store.get('settings').pixel;
    this.canvas.classList.toggle('pixelated', !!retro);
    this.renderer.setPixelRatio(retro ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setPixelMode() { this.resize(); }

  /* --------------------------- Flow --------------------------- */
  prepareRun(levelIndex = 0, mode = 'story') {
    this.mode = mode;
    this.levelIndex = levelIndex;
    this.level = mode === 'endless' ? LEVELS[0] : LEVELS[levelIndex];
    this.world.configure(this.level, mode === 'endless');
    this.world._endlessTheme = mode === 'endless' ? 0 : -1;
    this.scene.background = new THREE.Color(this.level.palette.sky);
    this.scene.fog = new THREE.Fog(this.level.palette.fog, this.level.palette.near, this.level.palette.far);
    this.player.setOutfit(this.outfit());
    this.player.reset();
    this.player.root.position.set(LANES[1], 0, PLAYER_Z);
    this.targetLane = 1;
    this.camera.position.set(0, 6.4, 12);
    this.state = 'intro';
    this.input.setEnabled(false);
    this.ui.showIntro(this.level, mode);
  }

  outfit() {
    const id = store.get('selectedOutfit');
    return this.ui.getOutfit(id);
  }

  beginRun() {
    this.ui.showScreen(null);
    this.state = 'running';
    this.input.setEnabled(true);
    this.input.clear();

    this.playerY = 0; this.vy = 0;
    this.sliding = false; this.slideTimer = 0; this.invuln = 0;
    this.distance = 0; this.coins = 0; this.passes = 0; this.score = 0;
    this.combo = 0; this.comboTimer = 0; this.comboBonus = 0;
    this.powerups = { jetpack: 0, magnet: 0, shield: 0, boost: 0 };
    this.runStats = { crashes: 0, passes: 0, coins: 0 };
    this.secondChanceUsed = false;
    this.dialogueTimer = 8;
    this.eventTimer = 14 + Math.random() * 8;
    this.dustTimer = 0;
    this.jetTimer = 0;
    this.effects.clear();
    this.passWarned = false;
    this.endingShown = false;
    this.speed = this.level.baseSpeed;

    // Shop perks
    if (store.hasItem('start-shield')) this.powerups.shield = 1;
    if (store.hasItem('start-jetpack')) this.powerups.jetpack = 5;
    if (store.hasItem('start-magnet')) this.powerups.magnet = 6;

    audio.init();
    audio.startMusic(this.level.id);
    audio.startEngine();
    audio.startWind(this.level.id);
    this.ui.showHUD(true);
    this.ui.toast('MISSION: Prove the haters wrong.', 'VYARUTH', 3.2);
  }

  pause() {
    if (this.state !== 'running') return;
    this.state = 'paused';
    this.input.setEnabled(false);
    audio.stopMusic(); audio.stopEngine(); audio.stopWind();
    this.ui.showPause(true);
  }

  resume() {
    if (this.state !== 'paused') return;
    this.state = 'running';
    this.input.setEnabled(true);
    audio.startMusic(this.level.id); audio.startEngine(); audio.startWind(this.level.id);
    this.ui.showPause(false);
    this.ui.showHUD(true);
  }

  quit() {
    this.state = 'menu';
    this.input.setEnabled(false);
    audio.stopAll();
    this.ui.showHUD(false);
    this.ui.showPause(false);
    this.ui.showScreen('menu');
    this.ui.refreshMenu();
    this.player.reset();
    this.player.root.position.set(LANES[1], 0, PLAYER_Z);
  }

  restart() {
    this.ui.showHUD(false);
    this.ui.showPause(false);
    this.ui.showScreen(null);
    this.prepareRun(this.levelIndex, this.mode);
  }

  /* --------------------------- Loop --------------------------- */
  loop(now) {
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, (now - this.lastTime) / 1000 || 0);
    this.lastTime = now;
    if (this.state === 'running') this.update(dt);
    else if (this.state === 'menu' || this.state === 'intro') {
      // idle animation on menus
      this.player.update(dt, { mode: 'run', speed: 6, y: 0, lean: 0 });
      this.effects.update(dt);
      this.world.time += dt;
    }
    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);
  }

  update(dt) {
    const actions = this.input.consume();
    for (const a of actions) this.handleAction(a);

    // timers
    for (const k of Object.keys(this.powerups)) {
      if (this.powerups[k] > 0) {
        this.powerups[k] = Math.max(0, this.powerups[k] - dt);
        if (this.powerups[k] === 0 && k === 'shield') this.ui.toast('Shield expired. Good luck.', 'GAME', 2);
      }
    }
    if (this.invuln > 0) this.invuln -= dt;
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // speed ramps
    const progress = this.mode === 'endless'
      ? Math.min(1, this.distance / 3500)
      : Math.min(1, this.distance / this.level.goal);
    let sp = this.level.baseSpeed + (this.level.maxSpeed - this.level.baseSpeed) * progress;
    if (this.mode === 'endless') sp += Math.min(8, this.distance / 600);
    if (this.powerups.boost > 0) sp *= 1.5;
    this.speed = sp;

    // lateral movement
    const px = this.player.root.position.x;
    const target = LANES[this.targetLane];
    const k = 1 - Math.exp(-dt * 14);
    this.player.root.position.x += (target - px) * k;
    this.player.root.rotation.z += ((px - target) * 0.05) * k;

    // vertical physics
    const prevY = this.playerY;
    if (this.powerups.jetpack > 0) {
      this.playerY += (3.6 - this.playerY) * (1 - Math.exp(-dt * 5));
      this.vy = 0;
    } else {
      if (this.playerY > 0 || this.vy > 0) {
        this.vy -= 30 * dt;
        this.playerY += this.vy * dt;
        if (this.playerY <= 0) {
          this.playerY = 0;
          this.vy = 0;
          if (prevY > 0.2) this.player.land();
        }
      }
    }
    this.player.root.position.y = this.playerY;

    if (this.slideTimer > 0) {
      this.slideTimer -= dt;
      if (this.slideTimer <= 0) this.sliding = false;
    }

    // animation mode
    let mode = 'run';
    if (this.powerups.jetpack > 0) mode = 'fly';
    else if (this.playerY > 0.05) mode = 'jump';
    else if (this.sliding) mode = 'slide';
    if (this.invuln > 0 && Math.floor(this.invuln * 12) % 2 === 0) mode = 'jump';
    this.player.update(dt, { mode, speed: this.speed, y: this.playerY, lean: (target - this.player.root.position.x) * 0.12 });

    // particle trails
    this.effects.update(dt);
    const ppos = this.player.root.position;
    if (mode === 'run' && this.playerY <= 0.05) {
      this.dustTimer -= dt;
      if (this.dustTimer <= 0) {
        this.effects.dust({ x: ppos.x, y: 0.12, z: 0.25 });
        this.dustTimer = 0.09;
      }
    }
    if (mode === 'fly') {
      this.jetTimer -= dt;
      if (this.jetTimer <= 0) {
        this.effects.jet({ x: ppos.x, y: ppos.y + 1.1, z: 0.7 });
        this.jetTimer = 0.045;
      }
    }
    if (this.powerups.boost > 0 && Math.random() < dt * 8) {
      this.effects.sparkle({ x: ppos.x + (Math.random() - 0.5) * 4, y: 0.5 + Math.random() * 2, z: 2 });
    }

    // world
    this.world.setDifficulty(this.mode === 'endless'
      ? Math.min(1, this.distance / 2600)
      : Math.min(1, this.distance / this.level.goal));
    this.world.update(dt, this);

    // distance & scoring
    this.distance += this.speed * dt;
    const coinValue = store.hasItem('double-coins') ? 10 : 5;
    this.score = Math.floor(this.distance * 10 + this.coins * coinValue * 15 + this.passes * 250 + this.comboBonus);

    this.checkCollisions();

    // random endless events
    if (this.mode === 'endless') {
      this.eventTimer -= dt;
      if (this.eventTimer <= 0) {
        this.world.coinRain();
        this.ui.toast('RANDOM EVENT: COIN RAIN! Try not to look suspicious.', 'SKY', 3);
        this.eventTimer = 18 + Math.random() * 12;
      }
    }

    // dialogue
    this.dialogueTimer -= dt;
    if (this.dialogueTimer <= 0) {
      const pool = [...(this.level.taunts || []), ...DIALOGUE];
      const msg = pool[Math.floor(Math.random() * pool.length)];
      this.ui.toast(msg.text, msg.who, 3.4);
      this.dialogueTimer = 11 + Math.random() * 7;
    }

    // level completion
    if (this.mode === 'story' && this.distance >= this.level.goal) {
      if (this.passes >= this.level.passes) this.completeLevel();
      else if (!this.passWarned) {
        this.passWarned = true;
        this.ui.toast(`Need ${this.level.passes - this.passes} more boarding pass(es)! Keep running!`, 'GATE OFFICER', 4);
      }
    }

    this.ui.updateHUD({
      distance: Math.floor(this.distance),
      score: this.score,
      coins: this.coins,
      level: this.level,
      powerups: this.powerups,
      passes: this.passes,
      required: this.mode === 'endless' ? 0 : this.level.passes,
      combo: this.combo,
      mode: this.mode,
    });
  }

  handleAction(a) {
    if (a === 'left' && this.targetLane > 0) {
      this.targetLane--;
      audio.ui();
    } else if (a === 'right' && this.targetLane < 2) {
      this.targetLane++;
      audio.ui();
    } else if (a === 'jump') {
      if (this.sliding && this.slideTimer > 0.2) return;
      if (this.powerups.jetpack > 0) {
        this.powerups.jetpack = Math.max(0, this.powerups.jetpack - 0.2);
        return;
      }
      if (this.playerY <= 0.01) {
        this.vy = 11.4;
        this.playerY = 0.01;
        audio.jump();
        this.player.setExpression('happy');
      }
    } else if (a === 'slide') {
      if (this.powerups.jetpack > 0) {
        this.powerups.jetpack = Math.max(0, this.powerups.jetpack - 0.2);
        return;
      }
      if (!this.sliding && this.playerY <= 0.1) {
        this.sliding = true;
        this.slideTimer = 0.72;
        audio.slide();
        this.player.setExpression('panic');
      }
    }
  }

  /* ------------------------ Collisions ------------------------ */
  checkCollisions() {
    const px = this.player.root.position.x;
    const py = this.playerY;
    const top = py + (this.sliding ? 1.25 : 2.75);
    const bottom = py + 0.08;
    const flying = this.powerups.jetpack > 0;

    for (const e of this.world.entities) {
      if (!e.active || e.collected) continue;
      const dz = Math.abs(e.worldZ - PLAYER_Z);
      if (dz > (e.halfD || 0.5) + 0.5) continue;
      const dx = Math.abs((e.x ?? 0) - px);
      if (dx > (e.halfW || 0.5) + 0.4) continue;

      if (e.type === 'coin') {
        if (flying || (e.yc + 0.4 >= bottom && e.yc - 0.4 <= top)) this.collectCoin(e);
      } else if (e.type === 'pass') {
        if (flying || (e.yc + 0.4 >= bottom && e.yc - 0.4 <= top)) this.collectPass(e);
      } else if (e.type === 'power') {
        if (flying || (e.yc + 0.5 >= bottom && e.yc - 0.5 <= top)) this.collectPower(e);
      } else if (e.type === 'obstacle') {
        if (flying) continue;
        const oBottom = e.yc - e.halfH;
        const oTop = e.yc + e.halfH;
        if (top >= oBottom && bottom <= oTop) this.hitObstacle(e);
      }
    }
  }

  collectCoin(e) {
    this.world.collect(e);
    const value = store.hasItem('double-coins') ? 10 : 5;
    this.coins += value;
    this.combo++;
    this.comboTimer = 2.6;
    this.comboBonus += Math.min(10, this.combo) * 2;
    this.effects.coin({ x: e.x, y: e.yc, z: e.worldZ });
    audio.coin();
    if (this.combo > 0 && this.combo % 10 === 0) this.ui.combo(`${this.combo}x COMBO!`);
  }

  collectPass(e) {
    this.world.collect(e);
    this.passes++;
    this.runStats.passes++;
    this.effects.pass({ x: e.x, y: e.yc, z: e.worldZ });
    audio.pass();
    this.player.setExpression('happy');
    this.ui.toast('BOARDING PASS ACQUIRED. One step closer to "maybe".', 'VYARUTH', 3);
  }

  collectPower(e) {
    this.world.collect(e);
    const kind = e.power;
    const cfg = POWERUPS[kind];
    this.powerups[kind] = cfg.duration || 1;
    this.effects.power({ x: e.x, y: e.yc, z: e.worldZ }, cfg.color);
    audio.power(kind);
    this.player.setExpression('happy');
    const msgs = {
      jetpack: 'JETPACK! Physics has resigned.',
      magnet: 'MAGNET! Coins, assemble!',
      shield: 'SHIELD! One free oops.',
      boost: 'SPEED BOOST! Vizag, we\'re coming!',
    };
    this.ui.toast(msgs[kind], 'POWER-UP', 2.6);
  }

  hitObstacle(e) {
    if (this.invuln > 0) return;
    if (e.hit) return;
    e.hit = true;

    if (this.powerups.shield > 0) {
      this.powerups.shield = 0;
      this.invuln = 0.9;
      this.shake = 0.35;
      this.effects.shield({ x: this.player.root.position.x, y: 1.4, z: 0 });
      audio.shieldBreak();
      this.player.setExpression('panic');
      this.ui.toast('SHIELD SAVED YOU! That was close.', 'GAME', 2.4);
      return;
    }
    if (store.hasItem('second-chance') && !this.secondChanceUsed) {
      this.secondChanceUsed = true;
      this.invuln = 0.9;
      this.shake = 0.35;
      this.effects.shield({ x: this.player.root.position.x, y: 1.4, z: 0 });
      audio.shieldBreak();
      this.player.setExpression('panic');
      this.ui.toast('SECOND CHANCE! The universe is feeling generous.', 'GAME', 2.4);
      return;
    }

    this.crash();
  }

  crash() {
    this.state = 'over';
    this.input.setEnabled(false);
    this.runStats.crashes++;
    this.player.setExpression('panic');
    this.shake = 0.9;
    this.effects.crash({ x: this.player.root.position.x, y: 1.4, z: 0 });
    audio.crash();
    audio.stopAll();
    this.ui.showHUD(false);

    store.recordRun(this.score, this.distance, this.coins);
    const msg = CRASH_MESSAGES[Math.floor(Math.random() * CRASH_MESSAGES.length)];
    this.ui.showGameOver({
      title: 'RUN OVER',
      message: msg,
      score: this.score,
      distance: Math.floor(this.distance),
      coins: this.coins,
      best: store.get('highScore'),
      showNext: false,
    });
  }

  completeLevel() {
    this.state = 'over';
    this.input.setEnabled(false);
    audio.levelUp();
    audio.stopAll();
    this.ui.showHUD(false);

    this.storyStats.coins += this.coins;
    this.storyStats.passes += this.passes;
    this.storyStats.crashes += this.runStats.crashes;
    if (this.passes < this.level.passes) this.storyStats.allPasses = false;
    store.recordRun(this.score, this.distance, this.coins);

    if (this.levelIndex === LEVELS.length - 1) {
      store.completeStory();
      const ending = getEnding(this.storyStats);
      store.seeEnding(ending.id);
      if (ending.id === 'mascot') store.unlockOutfit('ghost');
      this.state = 'ending';
      this.ui.showEnding(ending, {
        score: this.score, coins: this.storyStats.coins, passes: this.storyStats.passes,
      });
      return;
    }

    store.unlockLevel(this.levelIndex + 2);
    this.ui.showGameOver({
      title: 'LEVEL CLEAR!',
      message: ['Boarding pass stamped. Vyaruth is ONE step closer.', 'Gate cleared. Vizag remains suspiciously unavailable.', 'Level complete. The haters remain unconvinced.'][this.levelIndex % 3],
      score: this.score,
      distance: Math.floor(this.distance),
      coins: this.coins,
      best: store.get('highScore'),
      showNext: true,
      nextLevel: this.levelIndex + 1,
    });
  }

  onLightning() {
    audio.thunder();
    this.shake = 0.45;
    this.effects.emit({ x: (Math.random() - 0.5) * 20, y: 8, z: -18 }, 0xffe36e, 14,
      { speed: 8, size: 0.16, life: 0.7, gravity: 12, emissive: 0x806000 });
    if (Math.random() < 0.4) this.player.setExpression('panic');
  }

  /* --------------------------- Camera ------------------------- */
  updateCamera(dt) {
    const px = this.player.root.position.x;
    const shake = this.shake > 0 ? this.shake : 0;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 1.8);
    const sx = (Math.random() - 0.5) * shake;
    const sy = (Math.random() - 0.5) * shake;
    const k = 1 - Math.exp(-dt * 6);
    this.camera.position.x += (px * 0.35 + sx - this.camera.position.x) * k;
    this.camera.position.y += (6.4 + this.playerY * 0.22 + sy - this.camera.position.y) * k;
    this.camera.position.z += (12 + sx * 0.4 - this.camera.position.z) * k;
    this.camera.lookAt(px * 0.28, 1.5 + this.playerY * 0.1, -7);
    // subtle roll into lane changes and a speed-sensitive field of view
    const lean = (LANES[this.targetLane] - px) * 0.012;
    this.camera.rotation.z += (lean - this.camera.rotation.z) * (1 - Math.exp(-dt * 5));
    const targetFov = 60 + this.speed * 0.24 + (this.powerups.boost > 0 ? 5 : 0);
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov += (targetFov - this.camera.fov) * (1 - Math.exp(-dt * 3));
      this.camera.updateProjectionMatrix();
    }
  }

  nextLevel() {
    this.prepareRun(this.levelIndex + 1, 'story');
  }
}
