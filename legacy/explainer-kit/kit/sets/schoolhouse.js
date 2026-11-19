// SCHOOL EXTERIOR (growl video, 2026-10-25): a bright Roblox-style 2-storey school built from blocks, for the town set's
// empty lot. Red-brick-orange walls, white trims, rows of big windows, a glass entrance with a canopy and "SCHOOL" sign,
// front steps, a flagpole, a yellow school bus, a fenced playground strip. Real metres; the front faces +z.
//   const S = buildSchool(); S.group (add + place), S.door (front door point, local), S.roofTop (local y)
import * as THREE from 'three';
import { surface } from '../triplanar.js';
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .6, ...o });
const box = (w, h, d, m, x, y, z, g) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; g.add(b); return b; };
function signTex(text) { const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#1f4fbf'; g.fillRect(0, 0, 1024, 256); g.fillStyle = '#fff'; g.font = 'bold 150px sans-serif'; g.textAlign = 'center'; g.fillText(text, 512, 185); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
export function buildSchool() {
  const g = new THREE.Group(), W = 36, D = 16, H1 = 4.2, FL = 2;
  const wall = surface('brick', 0xffc2a0), trim = surface('plaster', 0xfaf7f0), glass = M(0x8fd3ff, { roughness: .1, metalness: .2, emissive: 0x16324a, emissiveIntensity: .25 }), roof = surface('asphalt', 0x4a4f5c), frame = M(0x2b3140);
  for (let f = 0; f < FL; f++) { box(W, H1, D, wall, 0, H1 / 2 + f * H1, 0, g); box(W + .3, .3, D + .3, trim, 0, (f + 1) * H1, 0, g); }   // floors + white band
  box(W + .8, .5, D + .8, roof, 0, FL * H1 + .25, 0, g); box(W + 1.2, .25, D + 1.2, trim, 0, FL * H1 + .05, 0, g);                       // roof slab + cornice
  // windows on the front and back, both floors (white frame, blue glass, sill)
  for (const side of [1, -1]) for (let f = 0; f < FL; f++) for (let i = -7; i <= 7; i++) { if (side === 1 && f === 0 && Math.abs(i) <= 1) continue;
    const x = i * 2.25, y = f * H1 + 2.3, z = side * (D / 2 + .02);
    box(1.6, 1.9, .12, trim, x, y, z, g); box(1.3, 1.6, .16, glass, x, y, z + side * .02, g); box(1.8, .15, .35, trim, x, y - 1.02, z + side * .1, g); }
  for (const side of [1, -1]) for (let f = 0; f < FL; f++) for (let i = -2; i <= 2; i++) { const z = i * 2.6, y = f * H1 + 2.3, x = side * (W / 2 + .02);
    box(.12, 1.9, 1.6, trim, x, y, z, g); box(.16, 1.6, 1.3, glass, x + side * .02, y, z, g); }
  // entrance: glass doors, canopy, sign, steps
  box(5.4, 3.4, .3, frame, 0, 1.7, D / 2 + .1, g); box(4.6, 3, .32, glass, 0, 1.6, D / 2 + .12, g); box(.12, 3, .36, frame, 0, 1.6, D / 2 + .14, g);
  box(8, .35, 3, trim, 0, 3.75, D / 2 + 1.5, g); box(7.6, 1.9, .2, M(0x1f4fbf), 0, 4.85, D / 2 + 2.88, g); for (const x of [-3.6, 3.6]) box(.3, 3.6, .3, trim, x, 1.8, D / 2 + 2.8, g);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.25), new THREE.MeshStandardMaterial({ map: signTex('SCHOOL'), roughness: .5 })); sign.position.set(0, 4.85, D / 2 + 3.0); sign.scale.setScalar(.8); g.add(sign);   // stands on the canopy
  for (let s = 0; s < 3; s++) box(8 - s * .6, .2, 1.2 - s * .3 + 3.2, M(0xdedad0), 0, .1 + s * .2, D / 2 + 1.9 - s * .15, g);
  // flagpole + flag, bus, playground fence + slide
  box(.15, 9, .15, M(0xd9dde3, { metalness: .6, roughness: .3 }), 9, 4.5, D / 2 + 6, g); box(2.2, 1.3, .05, M(0x1f4fbf), 10.1, 8.2, D / 2 + 6, g);
  const bus = new THREE.Group(); box(9, 2.8, 2.5, M(0xffc21a), 0, 1.9, 0, bus); box(2, 1.8, 2.5, M(0xffc21a), 5.3, 1.4, 0, bus); for (let i = -3; i <= 2; i++) box(1.1, .9, 2.55, M(0x1d2a3a), i * 1.35, 2.5, 0, bus);
  box(9.1, .25, 2.6, M(0x222222), 0, 1.25, 0, bus); for (const [x, z] of [[-3, 1.25], [3, 1.25], [-3, -1.25], [3, -1.25], [5.2, 1.25], [5.2, -1.25]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .4, 18), M(0x1a1a1a)); w.rotation.x = Math.PI / 2; w.position.set(x, .55, z); bus.add(w); }
  bus.position.set(-11, 0, D / 2 + 9); g.add(bus);
  for (let i = 0; i < 14; i++) box(.1, 1.2, .1, trim, 12 + (i % 7) * 1.4, .6, D / 2 + 3 + Math.floor(i / 7) * 8, g);
  box(1.2, 2.4, 1.2, M(0x38c172), 15.5, 1.2, D / 2 + 7, g); const sl = box(1.1, .15, 4, M(0xff5d5d), 15.5, 1.3, D / 2 + 9.2, g); sl.rotation.x = -.5;
  return { group: g, door: new THREE.Vector3(0, 0, D / 2 + 3.5), roofTop: FL * H1 + .5, size: [W, D] };
}
