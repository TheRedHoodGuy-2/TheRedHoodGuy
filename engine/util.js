import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeIO = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
export const spring = (t, k = 10, z = .5) => { if (t <= 0) return 0; const wd = k * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * k * t) * (Math.cos(wd * t) + (z * k / wd) * Math.sin(wd * t)); };
export const lerp = (a, b, x) => a + (b - a) * x;

const matCache = new Map();
export function M(color, o = {}) {
  const key = color + JSON.stringify(o, (k, v) => (v && v.isTexture) ? v.uuid : v);
  if (!o.unique && matCache.has(key)) return matCache.get(key);
  const { unique, physical, ...rest } = o;
  const m = physical ? new THREE.MeshPhysicalMaterial({ color, roughness: .7, ...rest }) : new THREE.MeshStandardMaterial({ color, roughness: .75, ...rest });
  if (!unique) matCache.set(key, m); return m;
}
const geoCache = new Map();
export function rboxGeo(w, h, d, r = .02) { r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4); const k = [w, h, d, r].join(); if (!geoCache.has(k)) geoCache.set(k, new RoundedBoxGeometry(w, h, d, 3, Math.max(r, 1e-4))); return geoCache.get(k); }
export function add(geo, mat, x = 0, y = 0, z = 0, parent, { shadow = true } = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
}
export const rb = (w, h, d, mat, x, y, z, parent, r = .02, o) => add(rboxGeo(w, h, d, r), mat, x, y, z, parent, o);
export const grp = (x = 0, y = 0, z = 0, parent) => { const g = new THREE.Group(); g.position.set(x, y, z); parent && parent.add(g); return g; };
export const cyl = (rt, rb_, h, seg = 32) => new THREE.CylinderGeometry(rt, rb_, h, seg);
export const sph = (r, ...a) => new THREE.SphereGeometry(r, 32, 20, ...a);

export function canvasTex(w, h, draw, repeat, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  return t;
}
export function textSprite(text, { size = 120, color = '#fff', bg = null, font = '800 100px Fredoka, Inter, sans-serif', pad = 30, scale = 1 } = {}) {
  const c = document.createElement('canvas'); const g = c.getContext('2d'); g.font = font;
  const w = Math.ceil(g.measureText(text).width) + pad * 2, h = size + pad; c.width = w; c.height = h;
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, h, h / 2); g.fill(); }
  g.fillStyle = color; g.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(w / h * scale, scale, 1); s.renderOrder = 10; return s;
}
