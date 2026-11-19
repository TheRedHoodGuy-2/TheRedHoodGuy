// HAIR LIBRARY: Xavier's Roblox hair meshes (kit/assets/roblox_src/*hair*), fitted to our R6 heads and recoloured.
//   const g = await hairMesh('longStraight', 0x4a2f1c)  ->  Group in "head units" (head width 1, head centre at origin)
//   await putHair(A, 'fluffy', color)               ->  fitted onto an R6 avatar's head bone
// Their painted textures are bright dyed colours; we turn them into grey strand detail and multiply by a natural colour.
// naturalHair(R) picks a natural colour (dyed colours only ~4% of the time).
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const SRC = 'kit/assets/roblox_src/';
const P1 = '3a73d212-kpop-demon-hunter-roblox-hair/', P2 = '59a53f02-roblox-hair_1/', P3 = '2d327b30-roblox-hair/', PB = '3b18c93f-roblox-bacon-hair/';
// file, object names (all pieces of one style), strand texture, head anchor in the file's units, fine-tuning
// head: [cx, cy, cz, width] of the head the hair was made for (when the file has one), else derived from the hair box
export const STYLES = {
  // kpop pack (has heads: width 1.2, centres at x -2 / 0 / 2, y 4.36)
  bunBraid:     { f: P1 + 'source/New Project2.obj', o: ['handle1', 'handle1 1'], t: P1 + 'textures/بدون_اسم55_20251112101407.png', head: [0, 4.36, 0, 1.2], sex: 'f' },
  spaceBuns:    { f: P1 + 'source/New Project2.obj', o: ['handle1 2'], t: P1 + 'textures/بدون_اسم55_20251112101407.png', head: [-2, 4.36, 0, 1.2], sex: 'f' },
  longLocks:    { f: P1 + 'source/New Project2.obj', o: ['handle 1', 'handle 3', 'handle 2', 'handle'], t: P1 + 'textures/بدون_اسم55_20251112101407.png', head: [2, 4.36, 0, 1.2], sex: 'f' },
  // pack 2 (no heads: anchor from the hair's own box)
  topKnot:      { f: P2 + 'source/roblox hair.obj', o: ['handle2'], t: P2 + 'textures/15512.png', sex: 'f' },
  longStraight: { f: P2 + 'source/roblox hair.obj', o: ['handle1'], t: P2 + 'textures/15512.png', sex: 'f' },
  braidBand:    { f: P2 + 'source/roblox hair.obj', o: ['handle1 1'], t: P2 + 'textures/15512.png', sex: 'f' },
  swept:        { f: P2 + 'source/roblox hair.obj', o: ['handle1 2'], t: P2 + 'textures/15512.png', sex: 'm' },
  lowPony:      { f: P2 + 'source/roblox hair.obj', o: ['handle2 1'], t: P2 + 'textures/15512.png', sex: 'f' },
  layered:      { f: P2 + 'source/roblox hair.obj', o: ['handle2 2'], t: P2 + 'textures/15512.png', sex: 'm' },
  fluffy:       { f: P2 + 'source/roblox hair.obj', o: ['handle1 3'], t: P2 + 'textures/15512.png', sex: 'm' },
  // pack 3
  // messyShort removed 2026-10-21: the mesh has an inside-out panel and a hole at the back no fit can hide
  halfUp:       { f: P3 + 'source/roblox hair 3.obj', o: ['handle1 1'], t: P3 + 'textures/9743.png', sex: 'f' },
  longBob:      { f: P3 + 'source/roblox hair 3.obj', o: ['handle1 2'], t: P3 + 'textures/9743.png', sex: 'f' },
  roundFluffy:  { f: P3 + 'source/roblox hair 3.obj', o: ['handle1 3'], t: P3 + 'textures/9743.png', sex: 'm' },
  longStraight2:{ f: P3 + 'source/roblox hair 3.obj', o: ['handle1 4'], t: P3 + 'textures/9743.png', sex: 'f' },
  // the classic (CC-BY 4.0, Trina.McCoy on Sketchfab)
  bacon:        { f: PB + 'source/scene.gltf', o: ['Object_7'], t: PB + 'source/textures/Scene_-_Root_diffuse.png', sex: 'm', keepUV: true },
};
// per-style tuning: lift = how far the hair top sits above the head top (head widths), dz = front/back shift, fit = scale
export const TUNE = {
  bunBraid: { s: 1.05, oy: -0.06, oz: -0.02 },
  spaceBuns: { s: 0.95, oy: 0.04, oz: -0.02 },
  longLocks: { oy: -0.02 },
  topKnot: { lift: 0.45, s: 1.05, oy: 0.1, oz: -0.16 },
  longStraight: { s: 1.15, oy: 0.02, oz: -0.14 },
  braidBand: { s: 1.05, oz: -0.1 },
  swept: { lift: 0.27, oy: 0.06, oz: 0.08 },
  lowPony: { s: 1.15, oy: -0.06, oz: -0.08 },
  layered: { s: 1.2, oz: 0.12 },
  fluffy: { oy: 0.12, oz: 0.02 },
  halfUp: { oy: 0.12, oz: -0.14 },
  longBob: { oy: 0.14, oz: -0.14 },
  roundFluffy: { lift: 0.26, s: 1.05, oy: 0.02, oz: -0.14 },
  longStraight2: { s: 1.1, oz: -0.1 },
  bacon: { s: 1.2, oy: 0.02, oz: 0.14 },
};   // s / oy / oz solved by tools/hairtune.html (scalp covered, eyes clear)

// ---------- natural colours (dyed ones are rare) ----------
export const NATURAL = [0x0f0c0b, 0x1a1411, 0x2b1d14, 0x3d2a1c, 0x4a2f1c, 0x6b4426, 0x8a5a32, 0xa8783e, 0xc9a06a, 0xdcc08a, 0x7a3418, 0x9c4a22, 0x8c8a86, 0xc8c6c2];
const NAT_W = [10, 12, 12, 10, 10, 8, 6, 4, 4, 3, 2, 2, 1, 1];
export const DYED = [0xd94f9a, 0x4f7bd9, 0x8e5bd9, 0x3fb8a4, 0xd9443f];
export function naturalHair(R = Math.random, dyedChance = .04) {
  if (R() < dyedChance) return DYED[Math.floor(R() * DYED.length)];
  let t = R() * NAT_W.reduce((a, b) => a + b, 0); for (let i = 0; i < NATURAL.length; i++) if ((t -= NAT_W[i]) < 0) return NATURAL[i]; return NATURAL[0];
}
export const stylesFor = sex => Object.keys(STYLES).filter(k => STYLES[k].sex === sex);

// ---------- loading ----------
const fileCache = {}, texCache = {};
const loadFile = f => fileCache[f] || (fileCache[f] = (f.endsWith('.gltf') ? new GLTFLoader().loadAsync(new URL(SRC + f, document.baseURI).href).then(g => g.scene) : new OBJLoader().loadAsync(new URL(SRC + f, document.baseURI).href)).then(r => { r.updateMatrixWorld(true); return r; }));
// strand texture -> grey detail, normalised so every source texture gives the same brightness under the tint
function greyTex(f) {
  return texCache[f] || (texCache[f] = new Promise((res, rej) => { const im = new Image(); im.onload = () => {
    const c = document.createElement('canvas'), n = 512; c.width = c.height = n; const x = c.getContext('2d'); x.drawImage(im, 0, 0, n, n);
    const d = x.getImageData(0, 0, n, n), a = d.data; let m = 0, m2 = 0, k = 0;
    for (let i = 0; i < a.length; i += 4) { const l = (a[i] * .3 + a[i + 1] * .59 + a[i + 2] * .11) / 255; m += l; m2 += l * l; k++; }
    m /= k; const sd = Math.sqrt(Math.max(1e-6, m2 / k - m * m));
    for (let i = 0; i < a.length; i += 4) { const l = (a[i] * .3 + a[i + 1] * .59 + a[i + 2] * .11) / 255, v = Math.max(.18, Math.min(1, .72 + (l - m) / sd * .17)) * 255; a[i] = a[i + 1] = a[i + 2] = v; a[i + 3] = 255; }
    x.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; res(t);
  }; im.onerror = rej; im.src = new URL(SRC + f, document.baseURI).href; }));
}
// a group in head units: head width = 1, head centre at the origin, face toward +z
export async function hairMesh(style, color = 0x2b1d14) {
  const S = STYLES[style]; if (!S) throw new Error('unknown hair ' + style);
  const root = await loadFile(S.f), parts = []; root.traverse(o => { if (o.isMesh && S.o.includes(o.name)) parts.push(o); });
  const box = new THREE.Box3(); parts.forEach(p => box.expandByObject(p));
  const T = TUNE[style] || {};
  let cx, cy, cz, w;
  if (S.head) [cx, cy, cz, w] = S.head;
  else { const s = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3()); w = Math.min(s.x, s.z) / 1.3; cx = c.x; cz = c.z + (T.dz ?? 0) * w; cy = box.max.y - w * (.5 + (T.lift ?? .16)); }
  const tex = await greyTex(S.t), mat = new THREE.MeshStandardMaterial({ map: tex, color: new THREE.Color(color).lerp(new THREE.Color(0xffffff), .08), roughness: .5, side: THREE.DoubleSide });
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  for (const p of parts) { const m = new THREE.Mesh(p.geometry.clone().applyMatrix4(p.matrixWorld), mat); m.castShadow = true; m.receiveShadow = true; inner.add(m); }
  inner.position.set(-cx, -cy, -cz); const k = (T.fit ?? 1) / w; g.scale.setScalar(k); g.rotation.y = Math.PI + (T.yaw ?? 0);   // Roblox meshes face -z, our rigs face +z
  // FIT (tools/hairtune.html solves these per style so the hair covers the whole scalp and never the eyes):
  // s = scale about the head centre, oy = move up, oz = move toward the face, all in head widths
  const adj = new THREE.Group(); adj.add(g); adj.scale.setScalar(T.s ?? 1); adj.position.set(0, T.oy ?? 0, T.oz ?? 0);
  const out = new THREE.Group(); out.add(adj); out.userData.style = style; return out;
}
// fit onto an R6 avatar (roblox.js rig): scale to the head box, follow the head bone
export async function putHair(A, style, color, { partBoxes } = {}) {
  const B = partBoxes(A), hb = B.head, hs = hb.getSize(new THREE.Vector3()), hc = hb.getCenter(new THREE.Vector3());
  const h = await hairMesh(style, color); h.scale.setScalar(hs.x); h.position.copy(hc);
  A.root.add(h); A.root.updateMatrixWorld(true);
  A.bones.head.attach(h); A.hair = h; return h;
}
