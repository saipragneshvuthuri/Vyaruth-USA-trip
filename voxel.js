/* ============================================================
   VOXEL — shared geometry/material cache and box-model builders
   ============================================================ */
import * as THREE from 'three';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const matCache = new Map();

export function material(color, opts = {}) {
  const key = `${color}|${opts.transparent ? 1 : 0}|${opts.opacity ?? 1}|${opts.emissive ?? 0}|${opts.flatShading ? 1 : 0}`;
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color,
    transparent: !!opts.transparent,
    opacity: opts.opacity ?? 1,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    roughness: opts.roughness ?? 0.72,
    metalness: opts.metalness ?? 0.04,
    flatShading: opts.flatShading !== false,
  });
  matCache.set(key, m);
  return m;
}

/** Create a single box mesh. `p` = {x,y,z,w,h,d,color,rotX,rotY,rotZ,opacity,emissive} */
export function box(p, parent = null) {
  const m = new THREE.Mesh(BOX, material(p.color ?? 0xffffff, p));
  m.scale.set(p.w ?? 1, p.h ?? 1, p.d ?? 1);
  m.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
  if (p.rotX) m.rotation.x = p.rotX;
  if (p.rotY) m.rotation.y = p.rotY;
  if (p.rotZ) m.rotation.z = p.rotZ;
  m.castShadow = p.castShadow !== false;
  m.receiveShadow = p.receiveShadow !== false;
  if (parent) parent.add(m);
  return m;
}

/** Build a group from an array of box descriptions. */
export function model(parts, parent = null) {
  const g = new THREE.Group();
  parts.forEach(p => box(p, g));
  if (parent) parent.add(g);
  return g;
}

export function clearGroup(group) {
  while (group.children.length) group.remove(group.children[0]);
}

/* ---------- Pixel text labels via canvas texture ---------- */
const labelCache = new Map();
const labelGeoCache = new Map();
const labelMatCache = new Map();
export function label(text, color = '#ffffff', bg = '#1a1a3a', scale = 1) {
  const key = `${text}|${color}|${bg}`;
  let tex = labelCache.get(key);
  if (!tex) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = color; ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, c.width - 4, c.height - 4);
    ctx.fillStyle = color;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, 18), c.width / 2, c.height / 2 + 2);
    tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    labelCache.set(key, tex);
  }
  const geoKey = scale;
  if (!labelGeoCache.has(geoKey)) labelGeoCache.set(geoKey, new THREE.PlaneGeometry(4 * scale, 1 * scale));
  const matKey = key;
  if (!labelMatCache.has(matKey)) {
    labelMatCache.set(matKey, new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
  }
  return new THREE.Mesh(labelGeoCache.get(geoKey), labelMatCache.get(matKey));
}

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6D2B79F5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
