/* ============================================================
   WORLD — recycled track segments, obstacles, collectibles,
           themed decor, and continuous forward illusion
   ============================================================ */
import * as THREE from 'three';
import { LANES, SEGMENT_LENGTH, SEGMENT_COUNT, PLAYER_Z, LEVELS, POWERUPS, ENDLESS_THEMES } from './config.js';
import { box, model, clearGroup, label, rng } from './voxel.js';

const rand = rng(Math.floor(Math.random() * 1e9));

/* ------------------------------------------------------------
   Obstacle definitions: kind = low (jump), high (slide), full (dodge)
   ------------------------------------------------------------ */
function buildObstacle(type, pal, moving = false) {
  const g = new THREE.Group();
  let kind = 'low', halfW = 0.6, halfH = 0.6, halfD = 0.5, yc = 0.6;
  const c = pal.accent;
  const P = (parts) => model(parts, g);

  switch (type) {
    case 'suitcase':
      P([{ w: 1.0, h: 1.1, d: 0.8, y: 0.55, color: 0x9b5128 },
         { w: 1.02, h: 0.12, d: 0.82, y: 0.9, color: 0xc46c35 },
         { w: 0.5, h: 0.14, d: 0.1, y: 1.18, color: 0x333333 },
         { w: 0.16, h: 0.12, d: 0.16, x: -0.35, y: 0.06, color: 0x111111 },
         { w: 0.16, h: 0.12, d: 0.16, x: 0.35, y: 0.06, color: 0x111111 }]);
      halfW = 0.55; halfH = 0.6; halfD = 0.45; break;

    case 'cart': case 'airportcart':
      P([{ w: 1.5, h: 0.18, d: 1.0, y: 0.28, color: 0xb8c0cc },
         { w: 0.12, h: 0.9, d: 0.12, x: -0.7, y: 0.72, color: 0x8892a2 },
         { w: 0.12, h: 0.9, d: 0.12, x: 0.7, y: 0.72, color: 0x8892a2 },
         { w: 1.2, h: 0.14, d: 0.12, y: 1.15, color: 0x8892a2 },
         { w: 0.7, h: 0.6, d: 0.6, x: -0.3, y: 0.65, z: 0.05, color: 0xd07a3c },
         { w: 0.6, h: 0.5, d: 0.55, x: 0.4, y: 0.6, z: -0.05, color: 0x4a8fc0 },
         { w: 0.18, h: 0.18, d: 0.18, x: -0.6, y: 0.1, color: 0x222222 },
         { w: 0.18, h: 0.18, d: 0.18, x: 0.6, y: 0.1, color: 0x222222 }]);
      halfW = 0.82; halfH = 0.65; halfD = 0.6; break;

    case 'barrier':
      P([{ w: 2.2, h: 0.14, d: 0.35, y: 0.65, color: 0xffcf4a },
         { w: 2.2, h: 0.14, d: 0.35, y: 0.25, color: 0xffcf4a },
         { w: 0.16, h: 0.9, d: 0.2, x: -0.95, y: 0.45, color: 0xdddddd },
         { w: 0.16, h: 0.9, d: 0.2, x: 0.95, y: 0.45, color: 0xdddddd }]);
      kind = 'low'; halfW = 1.1; halfH = 0.55; halfD = 0.3; break;

    case 'passenger':
      P([{ w: 0.32, h: 0.8, d: 0.34, x: -0.18, y: 0.4, color: 0x2b2f5a },
         { w: 0.32, h: 0.8, d: 0.34, x: 0.18, y: 0.4, color: 0x2b2f5a },
         { w: 0.78, h: 0.9, d: 0.46, y: 1.25, color: 0x7a5fc0 },
         { w: 0.66, h: 0.6, d: 0.62, y: 2.0, color: 0xe0a878 },
         { w: 0.72, h: 0.16, d: 0.66, y: 2.32, color: 0x231811 },
         { w: 0.2, h: 0.7, d: 0.24, x: -0.5, y: 1.3, color: 0x7a5fc0 },
         { w: 0.2, h: 0.7, d: 0.24, x: 0.5, y: 1.3, color: 0x7a5fc0 }]);
      kind = 'full'; halfW = 0.5; halfH = 1.2; halfD = 0.38; yc = 1.2; break;

    case 'lowbar': case 'overhead':
      P([{ w: 2.6, h: 0.55, d: 0.45, y: 2.2, color: 0xe8eaf5 },
         { w: 0.16, h: 2.2, d: 0.2, x: -1.35, y: 1.1, color: 0x98a0b5 },
         { w: 0.16, h: 2.2, d: 0.2, x: 1.35, y: 1.1, color: 0x98a0b5 },
         { w: 2.6, h: 0.12, d: 0.5, y: 1.9, color: 0xff5c6c }]);
      kind = 'high'; halfW = 1.3; halfH = 0.5; halfD = 0.35; yc = 2.15; break;

    case 'floatingluggage':
      P([{ w: 1.0, h: 0.9, d: 0.8, y: 1.0, color: 0x3aa6a0 },
         { w: 1.04, h: 0.1, d: 0.84, y: 1.3, color: 0x6ee0d8 },
         { w: 0.4, h: 0.1, d: 0.1, y: 1.5, color: 0x333333 }]);
      halfW = 0.55; halfH = 0.55; halfD = 0.45; yc = 1.0; break;

    case 'wing':
      P([{ w: 2.7, h: 0.32, d: 1.5, y: 0.35, color: 0xd8dee8 },
         { w: 2.4, h: 0.1, d: 0.3, y: 0.55, z: -0.5, color: 0x9aa6bd },
         { w: 0.5, h: 0.5, d: 0.8, x: -1.0, y: 0.55, color: 0x8894ad }]);
      halfW = 1.35; halfH = 0.35; halfD = 0.8; break;

    case 'bird': {
      const bp = P([{ w: 0.6, h: 0.42, d: 0.5, y: 0.95, color: 0x444a66 },
         { w: 0.5, h: 0.08, d: 0.3, x: -0.55, y: 1.12, color: 0x6b7296, rotZ: 0.4 },
         { w: 0.5, h: 0.08, d: 0.3, x: 0.55, y: 1.12, color: 0x6b7296, rotZ: -0.4 },
         { w: 0.16, h: 0.14, d: 0.16, z: -0.3, y: 0.98, color: 0xffcf4a }]);
      g.userData.wings = [bp.children[1], bp.children[2]];
      halfW = 0.4; halfH = 0.5; halfD = 0.35; yc = 0.95; break;
    }

    case 'cloudblock':
      P([{ w: 1.5, h: 0.7, d: 1.0, y: 0.5, color: 0xf4f8ff },
         { w: 0.9, h: 0.7, d: 0.8, x: -0.45, y: 0.82, color: 0xffffff },
         { w: 0.8, h: 0.6, d: 0.8, x: 0.5, y: 0.8, color: 0xe6efff }]);
      halfW = 0.8; halfH = 0.6; halfD = 0.55; break;

    case 'turbulence':
      P([{ w: 1.8, h: 0.16, d: 0.25, y: 0.4, color: 0xffffff, rotZ: 0.5 },
         { w: 1.6, h: 0.16, d: 0.25, y: 0.9, color: 0x9fe8ff, rotZ: -0.5 },
         { w: 1.4, h: 0.16, d: 0.25, y: 1.4, color: 0xffffff, rotZ: 0.4 }]);
      halfW = 0.9; halfH = 0.7; halfD = 0.3; break;

    case 'island':
      P([{ w: 1.9, h: 0.7, d: 1.6, y: 0.4, color: 0x6ba05a },
         { w: 1.7, h: 0.7, d: 1.4, y: 0.95, color: 0x8b6a45 },
         { w: 0.24, h: 0.9, d: 0.24, x: -0.5, y: 1.65, color: 0x3d7a3a },
         { w: 0.3, h: 0.5, d: 0.3, x: 0.5, y: 1.55, color: 0x4d8a42 }]);
      halfW = 0.95; halfH = 0.8; halfD = 0.8; break;

    case 'rainbow':
      P([{ w: 1.9, h: 0.22, d: 0.6, y: 0.15, color: 0xff5c6c },
         { w: 1.9, h: 0.22, d: 0.6, y: 0.38, color: 0xffcf4a },
         { w: 1.9, h: 0.22, d: 0.6, y: 0.61, color: 0x6cf08b },
         { w: 1.9, h: 0.22, d: 0.6, y: 0.84, color: 0x5fe6ff }]);
      halfW = 0.95; halfH = 0.5; halfD = 0.35; break;

    case 'wreckage':
      P([{ w: 1.2, h: 2.2, d: 0.28, y: 1.1, color: 0xa8b0c0, rotZ: 0.18 },
         { w: 0.5, h: 0.5, d: 0.3, x: -0.55, y: 1.7, color: 0x6a7288 },
         { w: 0.4, h: 1.0, d: 0.25, x: 0.6, y: 0.7, color: 0x8890a5 }]);
      kind = 'full'; halfW = 0.7; halfH = 1.2; halfD = 0.3; yc = 1.2; break;

    case 'wind': {
      const m = new THREE.MeshLambertMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.38 });
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.5), m);
      col.position.y = 1.3; g.add(col);
      P([{ w: 1.2, h: 0.12, d: 0.2, y: 0.9, color: 0xffffff },
         { w: 1.0, h: 0.12, d: 0.2, y: 1.5, color: 0xffffff },
         { w: 1.3, h: 0.12, d: 0.2, y: 2.1, color: 0xffffff }]);
      kind = 'full'; halfW = 0.9; halfH = 1.3; halfD = 0.4; yc = 1.3; break;
    }

    case 'ufo':
      P([{ w: 2.0, h: 0.35, d: 1.7, y: 1.7, color: 0x8892b5 },
         { w: 1.1, h: 0.45, d: 1.0, y: 1.98, color: 0x5fe6ff, transparent: true, opacity: 0.8 },
         { w: 0.22, h: 0.12, d: 0.22, x: -0.7, y: 1.45, color: 0xffcf4a },
         { w: 0.22, h: 0.12, d: 0.22, x: 0, y: 1.45, color: 0xff5fa8 },
         { w: 0.22, h: 0.12, d: 0.22, x: 0.7, y: 1.45, color: 0x6cf08b }]);
      kind = 'high'; halfW = 1.0; halfH = 0.45; halfD = 0.85; yc = 1.75; break;

    case 'ship':
      P([{ w: 2.4, h: 0.9, d: 1.8, y: 0.5, color: 0x7a4a2a },
         { w: 2.0, h: 0.5, d: 1.6, y: 1.15, color: 0xc46c35 },
         { w: 0.16, h: 1.7, d: 0.16, y: 1.8, color: 0xe8e8e8 },
         { w: 1.0, h: 0.6, d: 0.1, y: 2.1, color: 0xffffff },
         { w: 0.8, h: 0.3, d: 0.1, y: 2.7, color: 0xff5c6c }]);
      kind = 'full'; halfW = 1.2; halfH = 1.2; halfD = 0.9; yc = 1.2; break;

    case 'stormcloud':
      P([{ w: 1.8, h: 0.6, d: 1.1, y: 2.2, color: 0x39406b },
         { w: 1.0, h: 0.6, d: 0.9, x: -0.5, y: 2.5, color: 0x4b5384 },
         { w: 0.9, h: 0.5, d: 0.9, x: 0.55, y: 2.45, color: 0x2e3560 },
         { w: 0.16, h: 0.5, d: 0.16, y: 1.65, x: 0.2, color: 0xffe36e }]);
      kind = 'high'; halfW = 0.9; halfH = 0.45; halfD = 0.6; yc = 2.2; break;

    case 'wave':
      P([{ w: 2.8, h: 0.85, d: 1.2, y: 0.45, color: 0x2b6fbd },
         { w: 2.4, h: 0.22, d: 0.3, y: 0.95, z: -0.4, color: 0x8fd8ff },
         { w: 1.6, h: 0.18, d: 0.25, y: 1.1, z: 0.3, color: 0xffffff }]);
      halfW = 1.4; halfH = 0.5; halfD = 0.65; break;

    case 'movingblock':
      P([{ w: 1.5, h: 2.2, d: 1.0, y: 1.1, color: 0x6c72b5 },
         { w: 1.6, h: 0.2, d: 1.1, y: 2.25, color: 0xffcf4a },
         { w: 0.3, h: 0.3, d: 0.1, y: 1.3, z: -0.55, color: 0xffffff }]);
      kind = 'full'; halfW = 0.75; halfH = 1.2; halfD = 0.55; yc = 1.2; break;

    case 'truthgate':
      P([{ w: 2.6, h: 0.4, d: 0.5, y: 2.4, color: 0xffcf4a, emissive: 0x704f00 },
         { w: 0.2, h: 2.4, d: 0.3, x: -1.3, y: 1.2, color: 0xffcf4a },
         { w: 0.2, h: 2.4, d: 0.3, x: 1.3, y: 1.2, color: 0xffcf4a },
         { w: 2.2, h: 0.16, d: 0.3, y: 1.6, color: 0xff5fa8 }]);
      kind = 'high'; halfW = 1.3; halfH = 0.5; halfD = 0.4; yc = 2.35; break;

    default:
      P([{ w: 1.2, h: 1.2, d: 1.0, y: 0.6, color: c }]);
      halfW = 0.6; halfH = 0.6; halfD = 0.5;
  }

  if (moving) g.userData.moving = true;
  return { group: g, kind, halfW, halfH, halfD, yc };
}

/* ------------------------------------------------------------
   Collectible builders
   ------------------------------------------------------------ */
function buildCoin() {
  const g = new THREE.Group();
  box({ w: 0.5, h: 0.5, d: 0.12, color: 0xffcf4a, emissive: 0x5a3a00 }, g);
  box({ w: 0.3, h: 0.3, d: 0.14, color: 0xffec9a }, g);
  box({ w: 0.12, h: 0.12, d: 0.16, color: 0xb87500 }, g);
  g.position.y = 1.05;
  return g;
}

function buildPass() {
  const g = new THREE.Group();
  box({ w: 0.9, h: 0.55, d: 0.1, color: 0xffcf4a, emissive: 0x664400 }, g);
  box({ w: 0.9, h: 0.12, d: 0.12, y: 0.2, color: 0xff5fa8 }, g);
  box({ w: 0.35, h: 0.12, d: 0.12, x: -0.2, y: -0.12, color: 0x2b2b55 }, g);
  box({ w: 0.22, h: 0.12, d: 0.12, x: 0.25, y: -0.12, color: 0x2b2b55 }, g);
  const lbl = label('BP', '#fff4b0', '#6a4200', 0.45);
  lbl.position.set(0, 0, 0.07);
  g.add(lbl);
  g.position.y = 1.25;
  return g;
}

function buildPower(kind) {
  const g = new THREE.Group();
  const p = POWERUPS[kind];
  box({ w: 0.7, h: 0.7, d: 0.7, color: p.color, transparent: true, opacity: 0.85, emissive: p.color }, g);
  if (kind === 'jetpack') {
    box({ w: 0.14, h: 0.45, d: 0.14, x: -0.18, y: -0.1, color: 0xffffff }, g);
    box({ w: 0.14, h: 0.45, d: 0.14, x: 0.18, y: -0.1, color: 0xffffff }, g);
  } else if (kind === 'magnet') {
    box({ w: 0.12, h: 0.4, d: 0.12, x: -0.18, y: -0.05, color: 0xffffff }, g);
    box({ w: 0.12, h: 0.4, d: 0.12, x: 0.18, y: -0.05, color: 0xffffff }, g);
    box({ w: 0.48, h: 0.12, d: 0.12, y: 0.16, color: 0xffffff }, g);
  } else if (kind === 'shield') {
    box({ w: 0.45, h: 0.5, d: 0.12, color: 0xffffff }, g);
    box({ w: 0.3, h: 0.12, d: 0.14, y: -0.28, color: 0xffffff }, g);
  } else {
    box({ w: 0.12, h: 0.45, d: 0.12, y: 0.05, color: 0xffffff, rotZ: 0.3 }, g);
    box({ w: 0.12, h: 0.3, d: 0.12, x: 0.12, y: -0.15, color: 0xffffff, rotZ: -0.3 }, g);
  }
  g.position.y = 1.3;
  return g;
}

/* ------------------------------------------------------------
   Themed decor
   ------------------------------------------------------------ */
function buildDecor(seg, level, r, idx) {
  const g = seg.decor;
  const pal = level.palette;
  const theme = level.decor;
  const L = SEGMENT_LENGTH;

  // Base runway / platform (always)
  box({ w: 9.4, h: 0.5, d: L, y: -0.3, color: pal.ground }, g);
  box({ w: 0.14, h: 0.06, d: L, x: -1.35, y: -0.02, color: pal.lane }, g);
  box({ w: 0.14, h: 0.06, d: L, x: 1.35, y: -0.02, color: pal.lane }, g);
  box({ w: 0.3, h: 0.55, d: L, x: -4.8, y: 0.05, color: pal.accent }, g);
  box({ w: 0.3, h: 0.55, d: L, x: 4.8, y: 0.05, color: pal.accent }, g);

  // Edge dashes and glowing lane guides for speed sensation
  for (let i = 0; i < 5; i++) {
    box({ w: 0.16, h: 0.04, d: 1.6, x: -4.8, y: 0.34, z: -i * 4 - 1, color: 0xffffff }, g);
    box({ w: 0.16, h: 0.04, d: 1.6, x: 4.8, y: 0.34, z: -i * 4 - 1, color: 0xffffff }, g);
    box({ w: 0.08, h: 0.03, d: 2.2, x: -1.35, y: 0.01, z: -i * 4 - 1, color: pal.accent, emissive: pal.accent }, g);
    box({ w: 0.08, h: 0.03, d: 2.2, x: 1.35, y: 0.01, z: -i * 4 - 1, color: pal.accent, emissive: pal.accent }, g);
  }

  // Distant cloud banks add depth on every theme
  const cloudColor = theme === 'ocean' ? 0x5a628f : theme === 'final' ? 0xffd7f2 : 0xf7fbff;
  for (let i = 0; i < 3; i++) {
    const x = (i % 2 ? 1 : -1) * (12 + r() * 12);
    const y = 7 + r() * 8;
    const z = -r() * L;
    const w = 4 + r() * 4;
    box({ w, h: 1.3, d: 3 + r() * 2, x, y, z, color: cloudColor }, g);
    box({ w: w * 0.55, h: 1.1, d: 2.5, x: x - 1, y: y + 0.9, z, color: cloudColor }, g);
    box({ w: w * 0.45, h: 0.9, d: 2.2, x: x + 1.3, y: y + 0.7, z, color: cloudColor }, g);
  }

  const side = (x,Parts) => Parts.forEach(p => box({ ...p, x: (p.x || 0) + x }, g));

  if (theme === 'airport') {
    side(-7.5, [
      { w: 3.5, h: 5, d: L - 2, y: 2.2, color: 0xe2e6ee },
      { w: 3.7, h: 0.4, d: L - 2, y: 4.8, color: 0x4a74b8 },
      { w: 0.4, h: 5, d: 1.2, x: 1.6, y: 2.2, color: 0xb8c2d4 },
    ]);
    side(7.5, [
      { w: 3.5, h: 4, d: L - 4, y: 1.7, color: 0xd2d9e5 },
      { w: 3.7, h: 0.4, d: L - 4, y: 3.9, color: 0x4a74b8 },
    ]);
    if (idx % 3 === 0) {
      const s = label('GATE 3', '#fff', '#2b4d8a', 1.1);
      s.position.set(-5.2, 5.6, -8); s.rotation.y = Math.PI / 2; g.add(s);
    }
    if (idx % 4 === 1) {
      const s = label('DELHI → USA', '#ffe9a0', '#8a2b3a', 1.3);
      s.position.set(5.4, 4.6, -10); s.rotation.y = -Math.PI / 2; g.add(s);
    }
  } else if (theme === 'plane') {
    for (let i = 0; i < 4; i++) {
      const x = (i % 2 ? 1 : -1) * (6 + r() * 4);
      const z = -r() * L;
      box({ w: 2 + r() * 2, h: 0.8, d: 2 + r(), y: -2 - r() * 3, x, z, color: 0xf2f8ff }, g);
      box({ w: 1.2, h: 0.6, d: 1.2, x: x - 0.3, y: -1.4, z, color: 0xffffff }, g);
    }
    if (idx % 3 === 0) {
      box({ w: 6, h: 1.2, d: 3, x: 8, y: 2.5, z: -8, color: 0xdde4f0, rotZ: 0.15 }, g);
      box({ w: 0.5, h: 1, d: 0.5, x: 9, y: 3.2, z: -8, color: 0xff5c6c }, g);
    }
  } else if (theme === 'sky') {
    for (let i = 0; i < 3; i++) {
      const x = (i % 2 ? 1 : -1) * (6 + r() * 8);
      box({ w: 3 + r() * 3, h: 1.2, d: 3 + r() * 2, x, y: -3 - r() * 4, z: -r() * L, color: 0x6ba05a }, g);
      box({ w: 2.5, h: 0.8, d: 2.5, x, y: -2, z: -8, color: 0x8b6a45 }, g);
    }
    for (let i = 0; i < 3; i++) {
      box({ w: 5, h: 0.2, d: 0.6, x: (r() - 0.5) * 14, y: 5 + r() * 4, z: -r() * L,
            color: [0xff5c6c, 0xffcf4a, 0x6cf08b, 0x5fe6ff][i % 4] }, g);
    }
    for (let i = 0; i < 12; i++) {
      box({ w: 0.28, h: 0.28, d: 0.28, x: (r() - 0.5) * 40, y: 9 + r() * 15, z: -r() * L,
            color: 0xffffff, emissive: 0x808080 }, g);
    }
  } else if (theme === 'ocean') {
    box({ w: 120, h: 1, d: L + 1, y: -9, color: 0x16295c }, g);
    for (let i = 0; i < 4; i++) {
      box({ w: 3 + r() * 4, h: 0.4, d: 2 + r() * 2,
            x: (r() - 0.5) * 30, y: -8 + r() * 1.5, z: -r() * L, color: 0x2c5a9e }, g);
    }
    for (let i = 0; i < 3; i++) {
      box({ w: 4 + r() * 3, h: 1.4, d: 3, x: (i % 2 ? 1 : -1) * (7 + r() * 5), y: 5 + r() * 3, z: -r() * L, color: 0x2a315e }, g);
    }
    for (let i = 0; i < 14; i++) {
      box({ w: 0.06, h: 1.4, d: 0.06, x: (r() - 0.5) * 34, y: 3 + r() * 6, z: -r() * L,
            color: 0x9fd4ff, transparent: true, opacity: 0.55 }, g);
    }
  } else if (theme === 'america') {
    for (let i = 0; i < 3; i++) {
      const x = (i % 2 ? 1 : -1) * (7 + r() * 3);
      box({ w: 0.4, h: 5, d: 0.4, x, y: 2.2, z: -r() * L, color: 0x8b5a2b }, g);
      box({ w: 2.4, h: 0.25, d: 0.5, x: x - 0.6, y: 4.7, z: -8, color: 0x3da35a, rotZ: 0.2 }, g);
      box({ w: 2.4, h: 0.25, d: 0.5, x: x + 0.6, y: 4.7, z: -8, color: 0x3da35a, rotZ: -0.2 }, g);
    }
    if (idx % 3 === 0) {
      const s = label(idx % 2 ? 'USA?' : 'AMERICA?', '#fff', '#c93050', 1.4);
      s.position.set(0, 6.5, -14); g.add(s);
      seg.sign = s;
    }
  } else if (theme === 'final') {
    for (let i = 0; i < 4; i++) {
      box({ w: 0.3, h: 0.3, d: 0.3, x: (r() - 0.5) * 16, y: 2 + r() * 6, z: -r() * L,
            color: 0xffcf4a, emissive: 0x806000 }, g);
    }
    box({ w: 5, h: 0.3, d: 0.6, x: 0, y: 6 + r() * 2, z: -10, color: 0x6cf0ff, emissive: 0x206060 }, g);
    if (idx % 3 === 0) {
      const s = label('VIZAG?', '#fff7c0', '#b52f8c', 1.5);
      s.position.set(0, 4.6, -12); g.add(s); seg.sign = s;
    }
  }
}

/* ============================================================
   World class
   ============================================================ */
export class World {
  constructor(scene) {
    this.scene = scene;
    this.root = new THREE.Group();
    scene.add(this.root);
    this.segments = [];
    this.entities = [];
    this.level = LEVELS[0];
    this.palette = this.level.palette;
    this.difficulty = 0;
    this.generated = 0;
    this.time = 0;
    this.lightning = 0;
    this.stormLight = new THREE.PointLight(0xffffff, 0, 60);
    this.stormLight.position.set(0, 12, -20);
    scene.add(this.stormLight);

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const group = new THREE.Group();
      group.position.z = -i * SEGMENT_LENGTH;
      const decor = new THREE.Group();
      const dynamic = new THREE.Group();
      group.add(decor); group.add(dynamic);
      this.root.add(group);
      const seg = { group, decor, dynamic, index: i, entities: [], sign: null };
      this.segments.push(seg);
    }
    this.configure(LEVELS[0], false);
  }

  applyPalette(scene, level) {
    this.palette = level.palette;
    scene.background = new THREE.Color(level.palette.sky);
    scene.fog = new THREE.Fog(level.palette.fog, level.palette.near, level.palette.far);
  }

  configure(level, endless = false) {
    this.level = level;
    this.endless = endless;
    this.applyPalette(this.scene, level);
    this.difficulty = 0;
    this.generated = 0;
    this.entities.length = 0;
    this.initialFill = true;
    this.segments.forEach((seg, i) => {
      seg.group.position.z = -i * SEGMENT_LENGTH;
      clearGroup(seg.decor);
      clearGroup(seg.dynamic);
      seg.entities = [];
      buildDecor(seg, level, rand, i);
      this.populate(seg);
    });
    this.initialFill = false;
  }

  setDifficulty(d) { this.difficulty = Math.max(0, Math.min(1, d)); }

  populate(seg) {
    clearGroup(seg.dynamic);
    this.entities = this.entities.filter(e => e.seg !== seg);
    seg.entities = [];
    const level = this.level;
    const pal = this.palette;
    const diff = this.difficulty;
    const r = rand;
    const rows = [-4.5, -11.5, -17];
    const pattern = r();

    for (let ri = 0; ri < rows.length; ri++) {
      const z = rows[ri];
      if (ri === 2 && pattern < 0.45 && diff < 0.7) continue; // vary density

      // Decide blocked lanes (always leave at least one open)
      let blockCount = 0;
      const density = 0.34 + diff * 0.34 + (ri === 1 ? 0.08 : 0);
      if (!(this.initialFill && seg.index < 2)) {
        for (let l = 0; l < 3; l++) if (r() < density) blockCount++;
      }
      blockCount = Math.min(blockCount, 2);
      if (blockCount === 0 && r() < 0.35 + diff * 0.3) blockCount = 1;

      const lanes = [0, 1, 2].sort(() => r() - 0.5);
      const blocked = new Set(lanes.slice(0, blockCount));
      const free = lanes.slice(blockCount);

      // Full obstacles only single
      let fullUsed = false;
      for (const li of blocked) {
        let type = level.obstacles[Math.floor(r() * level.obstacles.length)];
        const defProbe = { full: ['passenger', 'wreckage', 'wind', 'ship', 'movingblock'] };
        if (fullUsed && defProbe.full.includes(type)) type = 'suitcase';
        if (defProbe.full.includes(type)) fullUsed = true;
        const moving = (type === 'movingblock' || type === 'bird' || (diff > 0.55 && r() < 0.18));
        const built = buildObstacle(type, pal, moving);
        this.addEntity(seg, {
          ...built, type: 'obstacle', obstacleType: type,
          lane: li, x: LANES[li], z, moving,
          phase: r() * Math.PI * 2, baseX: LANES[li],
        }, z, 0);
      }

      // Coins on free lanes
      for (const li of free) {
        if (r() < 0.72) {
          const n = 2 + Math.floor(r() * 3);
          for (let c = 0; c < n; c++) {
            const cz = z + c * 1.15;
            if (cz > -1) continue;
            this.addEntity(seg, {
              type: 'coin', kind: 'collect', lane: li, x: LANES[li], z: cz,
              halfW: 0.4, halfH: 0.4, halfD: 0.4, yc: 1.05,
            }, cz, 1.05, buildCoin());
          }
        }
      }
    }

    // Boarding pass roughly every 3 segments
    this.generated++;
    if (this.generated % 3 === 0) {
      const li = Math.floor(r() * 3);
      const z = -8;
      const nearby = seg.entities.some(e => e.type === 'obstacle' && e.lane === li && Math.abs(e.z - z) < 2.5);
      if (!nearby) {
        this.addEntity(seg, { type: 'pass', kind: 'collect', lane: li, x: LANES[li], z,
          halfW: 0.55, halfH: 0.45, halfD: 0.3, yc: 1.25 }, z, 1.25, buildPass());
      }
    }

    // Powerup roughly every 6 segments
    if (this.generated % 6 === 2) {
      const li = Math.floor(r() * 3);
      const z = -14;
      const nearby = seg.entities.some(e => e.type === 'obstacle' && e.lane === li && Math.abs(e.z - z) < 2.5);
      if (!nearby) {
        const kinds = ['jetpack', 'magnet', 'shield', 'boost'];
        const kind = kinds[Math.floor(r() * kinds.length)];
        this.addEntity(seg, { type: 'power', power: kind, kind: 'collect', lane: li, x: LANES[li], z,
          halfW: 0.5, halfH: 0.5, halfD: 0.5, yc: 1.3 }, z, 1.3, buildPower(kind));
      }
    }
  }

  addEntity(seg, data, localZ, yCenter, prebuiltGroup = null) {
    const group = prebuiltGroup || data.group;
    if (!group) return;
    group.position.set(data.x ?? 0, yCenter ?? data.yc ?? 0, localZ);
    seg.dynamic.add(group);
    const ent = {
      ...data, group, seg, localZ,
      worldZ: seg.group.position.z + localZ,
      active: true, collected: false,
    };
    seg.entities.push(ent);
    this.entities.push(ent);
  }

  update(dt, game) {
    this.time += dt;
    if (this.endless) {
      const idx = Math.floor(game.distance / 420) % ENDLESS_THEMES.length;
      if (idx !== this._endlessTheme) {
        this._endlessTheme = idx;
        const next = LEVELS.find(l => l.key === ENDLESS_THEMES[idx]) || LEVELS[2];
        this.configure(next, true);
        game.ui?.toast(`ENTERING: ${next.name}`, 'ENDLESS SKY', 3);
      }
    }
    const speed = game.speed;
    const move = speed * dt;

    for (const seg of this.segments) {
      seg.group.position.z += move;
      if (seg.group.position.z > SEGMENT_LENGTH) {
        seg.group.position.z -= SEGMENT_COUNT * SEGMENT_LENGTH;
        // Retire entities belonging to this segment before reusing it.
        seg.entities.forEach(e => { e.active = false; e.group.visible = false; });
        seg.entities = [];
        this.entities = this.entities.filter(e => e.active);
        clearGroup(seg.decor);
        buildDecor(seg, this.level, rand, seg.index++);
        this.populate(seg);
      }
      for (const e of seg.entities) {
        e.worldZ = seg.group.position.z + e.localZ;
        if (!e.active || e.collected) continue;

        if (e.type === 'coin') {
          e.group.rotation.y += dt * 5;
          e.group.position.y = e.yc + Math.sin(this.time * 4 + e.z) * 0.08;
          if (game.powerups.magnet > 0 && Math.abs(e.worldZ - PLAYER_Z) < 16) {
            const targetX = game.player.root.position.x;
            const targetL = PLAYER_Z - seg.group.position.z;
            const k = 1 - Math.exp(-dt * 7);
            e.group.position.x += (targetX - e.group.position.x) * k;
            e.group.position.z += (targetL - e.group.position.z) * k;
            e.x = e.group.position.x;
            e.worldZ = seg.group.position.z + e.group.position.z;
            e.localZ = e.group.position.z;
          }
        } else if (e.type === 'pass') {
          e.group.rotation.y = Math.sin(this.time * 3 + e.z) * 0.4;
          e.group.position.y = e.yc + Math.sin(this.time * 3 + e.z) * 0.14;
        } else if (e.type === 'power') {
          e.group.rotation.y += dt * 2.2;
          e.group.position.y = e.yc + Math.sin(this.time * 4 + e.z) * 0.16;
        } else if (e.moving) {
          e.group.position.x = e.baseX + Math.sin(this.time * 2.3 + e.phase) * 1.35;
          e.x = e.group.position.x;
          e.group.rotation.y += dt * (e.obstacleType === 'ufo' ? 1.5 : 0.4);
        } else if (e.obstacleType === 'turbulence') {
          e.group.rotation.z = Math.sin(this.time * 6 + e.phase) * 0.25;
        }

        if (e.type === 'obstacle') {
          const t = this.time + e.phase;
          const floaters = ['floatingluggage', 'cloudblock', 'ufo', 'bird', 'stormcloud', 'wind', 'ship', 'wave', 'island', 'rainbow', 'wreckage'];
          if (floaters.includes(e.obstacleType)) {
            const amp = e.obstacleType === 'ship' || e.obstacleType === 'ufo' ? 0.24 : 0.1;
            e.group.position.y = Math.sin(t * 2.2) * amp;
          }
          if (e.obstacleType === 'bird' && e.group.userData.wings) {
            const flap = 0.4 + Math.sin(t * 13) * 0.55;
            e.group.userData.wings[0].rotation.z = flap;
            e.group.userData.wings[1].rotation.z = -flap;
          }
          if (e.obstacleType === 'ship') e.group.rotation.z = Math.sin(t * 1.4) * 0.06;
          if (e.obstacleType === 'wind') e.group.rotation.y += dt * 1.6;
          if (e.obstacleType === 'rainbow') e.group.rotation.y = Math.sin(t * 2) * 0.22;
        }
      }
    }

    // Prune collected / passed entities
    if (this.entities.length > 260) {
      this.entities = this.entities.filter(e => e.active && e.worldZ > -30 && e.worldZ < 30);
      this.segments.forEach(s => { s.entities = s.entities.filter(e => e.active && e.worldZ > -30); });
    }

    // Storm lightning in ocean levels
    if (this.level.decor === 'ocean') {
      if (this.lightning > 0) {
        this.lightning -= dt;
        this.stormLight.intensity = 3.5 * Math.max(0, this.lightning / 0.18);
      } else {
        this.stormLight.intensity = 0;
        if (Math.random() < dt * 0.35) { this.lightning = 0.22; game.onLightning?.(); }
      }
    } else {
      this.stormLight.intensity = 0;
    }
  }

  /** Endless-mode random event: a shower of coins in the distance. */
  coinRain() {
    const seg = this.segments[this.segments.length - 2];
    for (let i = 0; i < 12; i++) {
      const lane = i % 3;
      const z = -2 - Math.floor(i / 3) * 2.6;
      this.addEntity(seg, {
        type: 'coin', kind: 'collect', lane, x: LANES[lane], z,
        halfW: 0.4, halfH: 0.4, halfD: 0.4, yc: 1.05,
      }, z, 1.05, buildCoin());
    }
  }

  collect(e) {
    e.active = false;
    e.collected = true;
    e.group.visible = false;
  }

  clear() {
    this.entities.length = 0;
    this.segments.forEach(s => { clearGroup(s.dynamic); s.entities = []; });
  }
}
