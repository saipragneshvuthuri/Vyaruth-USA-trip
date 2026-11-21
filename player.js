/* ============================================================
   PLAYER — Vyaruth: articulated voxel model, outfits, poses
   ============================================================ */
import * as THREE from 'three';
import { box, material } from './voxel.js';
import { OUTFITS } from './config.js';

export class Player {
  constructor() {
    this.root = new THREE.Group();
    this.body = new THREE.Group();
    this.root.add(this.body);

    this.roles = { shirt: [], pants: [], skin: [], hair: [], bag: [], accent: [] };
    this.legs = [];      // { hip, knee }
    this.arms = [];      // { shoulder, elbow }
    this.eyes = [];
    this.brows = [];
    this.hatParts = [];

    this.t = 0;
    this.phase = 0;
    this.squash = 0;
    this.lastMode = 'run';
    this.expression = 'neutral';
    this.outfit = null;

    this.build();
    this.setOutfit(OUTFITS[0]);
  }

  add(p, parent, role = null) {
    const m = box(p, parent);
    m.material = m.material.clone();
    if (role && this.roles[role]) this.roles[role].push(m.material);
    return m;
  }

  build() {
    const b = this.body;

    // Contact shadow (stays on the ground while Vyaruth jumps)
    this.shadowMat = material(0x000000, { transparent: true, opacity: 0.26 }).clone();
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.15), this.shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.03;
    this.root.add(this.shadow);

    // Legs with hip + knee joints
    for (const side of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(side * 0.25, 1.02, 0);
      this.add({ w: 0.36, h: 0.52, d: 0.38, y: -0.26, color: 0x2a5bd7 }, hip, 'pants');
      const knee = new THREE.Group();
      knee.position.y = -0.52;
      this.add({ w: 0.33, h: 0.46, d: 0.35, y: -0.23, color: 0x2a5bd7 }, knee, 'pants');
      this.add({ w: 0.4, h: 0.18, d: 0.62, y: -0.48, z: -0.09, color: 0x20202f }, knee);
      hip.add(knee);
      b.add(hip);
      this.legs.push({ hip, knee });
    }

    // Torso, backpack and straps
    this.torso = this.add({ w: 0.98, h: 1.14, d: 0.6, y: 1.58, color: 0xff9f1c }, b, 'shirt');
    this.add({ w: 0.86, h: 0.12, d: 0.64, y: 2.1, color: 0xffffff }, b, 'accent');
    this.bag = this.add({ w: 0.78, h: 0.86, d: 0.36, y: 1.62, z: 0.48, color: 0x1f7a8c }, b, 'bag');
    this.bagPocket = this.add({ w: 0.52, h: 0.3, d: 0.08, y: 1.4, z: 0.68, color: 0xffcf4a }, b, 'accent');
    this.add({ w: 0.18, h: 0.92, d: 0.1, x: -0.32, y: 1.6, z: 0.32, color: 0x14485a }, b);
    this.add({ w: 0.18, h: 0.92, d: 0.1, x: 0.32, y: 1.6, z: 0.32, color: 0x14485a }, b);
    // travel essentials poking out of the bag
    this.add({ w: 0.14, h: 0.42, d: 0.12, x: -0.18, y: 2.2, z: 0.5, color: 0xf7f7ff }, b);
    this.add({ w: 0.2, h: 0.3, d: 0.12, x: 0.16, y: 2.15, z: 0.5, color: 0xffcf4a }, b);

    // Arms with shoulder + elbow joints
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.7, 2.04, 0);
      this.add({ w: 0.28, h: 0.44, d: 0.3, y: -0.22, color: 0xff9f1c }, shoulder, 'shirt');
      const elbow = new THREE.Group();
      elbow.position.y = -0.44;
      this.add({ w: 0.25, h: 0.42, d: 0.27, y: -0.21, color: 0xff9f1c }, elbow, 'shirt');
      this.add({ w: 0.29, h: 0.22, d: 0.31, y: -0.46, color: 0xe0a878 }, elbow, 'skin');
      shoulder.add(elbow);
      b.add(shoulder);
      this.arms.push({ shoulder, elbow });
    }

    // Head with expressions on both faces
    this.head = new THREE.Group();
    this.head.position.set(0, 2.52, 0);
    b.add(this.head);
    this.facePlate = this.add({ w: 0.86, h: 0.78, d: 0.76, color: 0xe0a878 }, this.head, 'skin');
    this.hair = this.add({ w: 0.92, h: 0.22, d: 0.82, y: 0.41, color: 0x231811 }, this.head, 'hair');
    this.add({ w: 0.96, h: 0.08, d: 0.86, y: 0.5, color: 0x231811 }, this.head, 'hair');

    for (const zdir of [-1, 1]) {
      for (const side of [-1, 1]) {
        this.add({ w: 0.19, h: 0.21, d: 0.06, x: side * 0.19, y: 0.08, z: zdir * 0.4, color: 0xffffff }, this.head);
        const pupil = this.add({ w: 0.09, h: 0.11, d: 0.05, x: side * 0.19, y: 0.07, z: zdir * 0.435, color: 0x141428 }, this.head);
        this.eyes.push({ pupil, side, zdir });
        const brow = this.add({ w: 0.25, h: 0.07, d: 0.06, x: side * 0.19, y: 0.27, z: zdir * 0.41, color: 0x231811 }, this.head, 'hair');
        this.brows.push({ brow, side, zdir });
      }
    }
    this.mouth = this.add({ w: 0.3, h: 0.08, d: 0.06, y: -0.21, z: -0.41, color: 0x5a2323 }, this.head);
    this.mouthBack = this.add({ w: 0.3, h: 0.08, d: 0.06, y: -0.21, z: 0.41, color: 0x5a2323 }, this.head);

    this.hatAnchor = new THREE.Group();
    this.hatAnchor.position.y = 0.48;
    this.head.add(this.hatAnchor);

    // Twin jet flames
    this.jetFlame = new THREE.Group();
    this.flames = [];
    for (const side of [-1, 1]) {
      const f = new THREE.Group();
      f.position.set(side * 0.22, 1.0, 0.62);
      this.add({ w: 0.16, h: 0.42, d: 0.16, y: -0.22, color: 0x5fe6ff, emissive: 0x2080a0 }, f, 'accent');
      this.add({ w: 0.09, h: 0.28, d: 0.09, y: -0.55, color: 0xffffff, emissive: 0xffaa00 }, f);
      this.jetFlame.add(f);
      this.flames.push(f);
    }
    this.jetFlame.visible = false;
    b.add(this.jetFlame);

    this.setExpression('neutral');
  }

  setOutfit(outfit) {
    this.outfit = outfit;
    const colors = {
      shirt: outfit.shirt, pants: outfit.pants, skin: outfit.skin,
      hair: outfit.hair, bag: outfit.bag, accent: outfit.accent,
    };
    Object.entries(colors).forEach(([role, c]) => {
      this.roles[role].forEach(m => m.color.setHex(c));
    });
    this.eyes.forEach(e => e.pupil.material.color.setHex(outfit.id === 'ghost' ? 0x6a4bff : 0x141428));

    // rebuild hat
    while (this.hatAnchor.children.length) this.hatAnchor.remove(this.hatAnchor.children[0]);
    if (outfit.hat === 'cap') {
      this.add({ w: 0.92, h: 0.24, d: 0.82, y: 0.06, color: 0x444a5a }, this.hatAnchor);
      this.add({ w: 0.55, h: 0.1, d: 0.55, y: -0.02, z: -0.5, color: 0x2f3444 }, this.hatAnchor);
    } else if (outfit.hat === 'pilot') {
      this.add({ w: 0.94, h: 0.26, d: 0.82, y: 0.06, color: 0x15205a }, this.hatAnchor);
      this.add({ w: 0.72, h: 0.1, d: 0.64, y: -0.05, z: -0.44, color: 0x0e1640 }, this.hatAnchor);
      this.add({ w: 0.22, h: 0.12, d: 0.12, y: 0.16, z: -0.42, color: 0xffcf4a }, this.hatAnchor);
    } else if (outfit.hat === 'helmet') {
      this.add({ w: 1.02, h: 0.72, d: 0.94, y: 0.3, color: 0xd8dde8, transparent: true, opacity: 0.7 }, this.hatAnchor);
      this.add({ w: 0.92, h: 0.12, d: 0.88, y: 0.03, color: 0x5fe6ff, emissive: 0x103050 }, this.hatAnchor);
    } else if (outfit.hat === 'hearts') {
      for (const side of [-1, 1]) {
        this.add({ w: 0.27, h: 0.24, d: 0.09, x: side * 0.21, y: 0.11, z: -0.42, color: 0xff5fa8 }, this.hatAnchor);
        this.add({ w: 0.11, h: 0.11, d: 0.07, x: side * 0.21, y: 0.18, z: -0.48, color: 0xffffff }, this.hatAnchor);
      }
    } else if (outfit.hat === 'halo') {
      this.add({ w: 0.74, h: 0.07, d: 0.74, y: 0.44, color: 0xffcf4a, emissive: 0x806000 }, this.hatAnchor);
    }
    this.setExpression(this.expression);
  }

  setExpression(name) {
    this.expression = name;
    const setMouth = (w, h, y, x = 0) => {
      [this.mouth, this.mouthBack].forEach(m => { m.scale.set(w, h, 1); m.position.y = y; m.position.x = x; });
    };
    if (name === 'happy') setMouth(0.44, 0.15, -0.2);
    else if (name === 'panic') setMouth(0.2, 0.36, -0.24);
    else if (name === 'confused') setMouth(0.18, 0.08, -0.23, 0.1);
    else if (name === 'cool') setMouth(0.38, 0.07, -0.19);
    else setMouth(0.28, 0.08, -0.21);

    this.brows.forEach(x => {
      x.brow.rotation.z = name === 'confused' ? x.side * 0.55 : name === 'panic' ? -x.side * 0.4 : 0;
      x.brow.position.y = name === 'panic' ? 0.31 : 0.27;
    });
    this.eyes.forEach(x => {
      const s = name === 'panic' ? 1.45 : name === 'confused' ? 0.7 : 1;
      x.pupil.scale.set(s, s, 1);
    });
  }

  land() { this.squash = 1; }

  /** state: { mode, speed, lean, y } */
  update(dt, state) {
    this.t += dt;
    const mode = state.mode || 'run';
    const y = state.y ?? this.root.position.y;
    const speed = state.speed || 14;
    const k = 1 - Math.exp(-dt * 17);

    // Detect landing from a jump/fly for a squash-and-stretch pop
    if ((this.lastMode === 'jump' || this.lastMode === 'fly') && mode === 'run' && y <= 0.06) this.squash = 1;
    this.lastMode = mode;

    let hipA = 0, hipB = 0, kneeA = 0.12, kneeB = 0.12;
    let armA = 0, armB = 0, elbowA = 0.4, elbowB = 0.4, armZA = 0, armZB = 0;
    let bodyY = 0, bodyRot = 0, bodyRotZ = 0, bodyScaleY = 1;
    let headZ = 0, bagY = 1.62;

    if (mode === 'run') {
      this.phase += dt * (11 + speed * 0.32);
      const s = Math.sin(this.phase);
      hipA = s * 0.88; hipB = -s * 0.88;
      kneeA = 0.14 + Math.max(0, -s) * 1.05;
      kneeB = 0.14 + Math.max(0, s) * 1.05;
      armA = -s * 0.72; armB = s * 0.72;
      elbowA = 0.45 + Math.max(0, s) * 0.55;
      elbowB = 0.45 + Math.max(0, -s) * 0.55;
      bodyY = Math.abs(Math.sin(this.phase * 2)) * 0.07;
      bodyRot = 0.07;
      bodyRotZ = s * 0.045;
      headZ = Math.sin(this.phase * 0.5) * 0.05;
      bagY = 1.62 - Math.abs(s) * 0.05;
    } else if (mode === 'jump') {
      hipA = -0.72; hipB = 0.38;
      kneeA = 1.15; kneeB = 0.55;
      armA = -1.85; armB = -1.55;
      elbowA = 0.3; elbowB = 0.35;
      bodyRot = -0.15; headZ = -0.07;
      bagY = 1.7;
    } else if (mode === 'slide') {
      bodyRot = -1.18; bodyY = -0.18; bodyScaleY = 0.52;
      hipA = 0.12; hipB = -0.12; kneeA = 0.16; kneeB = 0.16;
      armA = -0.55; armB = -0.45; elbowA = 0.95; elbowB = 0.9;
      headZ = 0.3; bagY = 1.5;
    } else if (mode === 'fly') {
      hipA = -0.28; hipB = 0.22; kneeA = 0.38; kneeB = 0.3;
      armA = -0.3; armB = -0.3; elbowA = 0.25; elbowB = 0.25;
      armZA = -1.35; armZB = 1.35;
      bodyRot = -0.42; bodyY = Math.sin(this.t * 3) * 0.1;
      headZ = Math.sin(this.t * 1.6) * 0.1;
      bagY = 1.66;
    } else if (mode === 'crash') {
      hipA = 1.1; hipB = -0.75; kneeA = 0.6; kneeB = 0.4;
      armA = 1.7; armB = -1.4; elbowA = 0.2; elbowB = 1.2;
      bodyRot = -1.5 + Math.sin(this.t * 7) * 0.12;
      bodyY = -0.35; headZ = 0.4;
    }

    const apply = (holder, key, target) => { holder[key] += (target - holder[key]) * k; };
    apply(this.legs[0].hip.rotation, 'x', hipA);
    apply(this.legs[1].hip.rotation, 'x', hipB);
    apply(this.legs[0].knee.rotation, 'x', kneeA);
    apply(this.legs[1].knee.rotation, 'x', kneeB);
    apply(this.arms[0].shoulder.rotation, 'x', armA);
    apply(this.arms[1].shoulder.rotation, 'x', armB);
    apply(this.arms[0].shoulder.rotation, 'z', armZA);
    apply(this.arms[1].shoulder.rotation, 'z', armZB);
    apply(this.arms[0].elbow.rotation, 'x', elbowA);
    apply(this.arms[1].elbow.rotation, 'x', elbowB);
    apply(this.body.position, 'y', bodyY);
    apply(this.body.rotation, 'x', bodyRot);
    apply(this.body.rotation, 'z', bodyRotZ);
    apply(this.head.rotation, 'z', headZ);
    apply(this.bag.position, 'y', bagY);

    // squash & stretch on landing
    const sq = this.squash;
    this.squash = Math.max(0, sq - dt * 3.6);
    const targetSY = bodyScaleY * (1 - sq * 0.26);
    const targetSXZ = 1 + sq * 0.16;
    this.body.scale.y += (targetSY - this.body.scale.y) * k;
    this.body.scale.x += (targetSXZ - this.body.scale.x) * k;
    this.body.scale.z += (targetSXZ - this.body.scale.z) * k;

    // lean into lane changes
    apply(this.root.rotation, 'z', state.lean || 0);

    // jetpack flames + ground shadow
    this.jetFlame.visible = mode === 'fly';
    if (mode === 'fly') {
      this.flames.forEach((f, i) => {
        f.scale.y = 0.8 + Math.sin(this.t * 26 + i) * 0.28;
        f.rotation.z = Math.sin(this.t * 12 + i) * 0.16;
      });
    }
    this.shadow.position.y = -y + 0.03;
    const shrink = Math.max(0.35, 1 - y * 0.14);
    this.shadow.scale.set(shrink, shrink, shrink);
    this.shadowMat.opacity = 0.26 * shrink;
  }

  reset() {
    this.t = 0; this.phase = 0; this.squash = 0; this.lastMode = 'run';
    this.body.rotation.set(0, 0, 0);
    this.body.position.set(0, 0, 0);
    this.body.scale.set(1, 1, 1);
    this.root.rotation.set(0, 0, 0);
    this.setExpression('happy');
  }
}
