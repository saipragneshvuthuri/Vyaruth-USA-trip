/* ============================================================
   EFFECTS — lightweight pooled voxel particles & sparkles
   ============================================================ */
import * as THREE from 'three';
import { material } from './voxel.js';

export class Effects {
  constructor(scene) {
    this.scene = scene;
    this.geo = new THREE.BoxGeometry(1, 1, 1);
    this.pool = [];
    this.active = [];
    for (let i = 0; i < 140; i++) {
      const mesh = new THREE.Mesh(this.geo, material(0xffffff, { emissive: 0x000000 }));
      mesh.visible = false;
      scene.add(mesh);
      this.pool.push({ mesh, vel: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0, max: 1, gravity: 6, size: 0.16 });
    }
  }

  take(color, emissive) {
    const p = this.pool.pop() || this.active.shift();
    p.mesh.material = material(color, { emissive: emissive ?? 0x000000 });
    p.mesh.visible = true;
    this.active.push(p);
    return p;
  }

  emit(pos, color, count, opts = {}) {
    const spread = opts.spread ?? 1;
    const speed = opts.speed ?? 3;
    const gravity = opts.gravity ?? 8;
    const size = opts.size ?? 0.16;
    const life = opts.life ?? 0.55;
    for (let i = 0; i < count; i++) {
      const p = this.take(color, opts.emissive ?? color);
      p.mesh.position.set(
        pos.x + (Math.random() - 0.5) * spread,
        pos.y + (Math.random() - 0.5) * spread,
        pos.z + (Math.random() - 0.5) * spread,
      );
      p.vel.set(
        (Math.random() - 0.5) * speed,
        (opts.up ?? 0.4) + Math.random() * speed * 0.8,
        (Math.random() - 0.5) * speed + (opts.back ?? 0),
      );
      p.spin.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
      p.life = p.max = life * (0.7 + Math.random() * 0.6);
      p.gravity = gravity;
      p.size = size * (0.6 + Math.random() * 0.8);
      p.mesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      p.mesh.scale.setScalar(p.size);
    }
  }

  coin(pos) { this.emit(pos, 0xffcf4a, 7, { speed: 3.2, size: 0.12, life: 0.5, emissive: 0x806000 }); }
  pass(pos) { this.emit(pos, 0xffcf4a, 18, { speed: 5, size: 0.14, life: 0.9, up: 2.5, emissive: 0x806000 }); }
  power(pos, color) { this.emit(pos, color, 20, { speed: 5.5, size: 0.16, life: 0.85, up: 2, emissive: color }); }
  crash(pos) { this.emit(pos, 0xff5c6c, 24, { speed: 7, size: 0.22, life: 1.1, up: 2.5, emissive: 0x500010 }); }
  shield(pos) { this.emit(pos, 0x5fe6ff, 20, { speed: 5, size: 0.14, life: 0.7, up: 1, emissive: 0x104050 }); }
  dust(pos) { this.emit(pos, 0xd8dfef, 2, { speed: 1.1, size: 0.14, life: 0.35, up: 0.8, gravity: 3 }); }
  jet(pos) { this.emit(pos, 0x5fe6ff, 3, { speed: 1.5, size: 0.13, life: 0.4, up: -2, gravity: -1, back: 5, emissive: 0x105070 }); }
  sparkle(pos) { this.emit(pos, 0xffffff, 4, { speed: 2, size: 0.09, life: 0.5, gravity: 1, emissive: 0x606060 }); }

  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.life -= dt;
      if (p.life <= 0) {
        p.mesh.visible = false;
        this.active.splice(i, 1);
        this.pool.push(p);
        continue;
      }
      p.vel.y -= p.gravity * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += p.spin.x * dt;
      p.mesh.rotation.y += p.spin.y * dt;
      p.mesh.rotation.z += p.spin.z * dt;
      const s = p.size * Math.min(1, p.life / (p.max * 0.4));
      p.mesh.scale.setScalar(Math.max(0.001, s));
    }
  }

  clear() {
    while (this.active.length) {
      const p = this.active.pop();
      p.mesh.visible = false;
      this.pool.push(p);
    }
  }
}
