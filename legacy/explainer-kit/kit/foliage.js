// FOLIAGE CORE: painted leaf-cluster atlases (canvas, no downloads), leaf "cards" merged into one mesh per plant,
// grass tufts, flower heads. Used by kit/props/nature.js and kit/props/town.js.
//
// How a canopy is built: a dark lumpy core (fills holes, reads as the shaded inside) + dozens of alpha-cut leaf cards on
// its surface. Card normals point away from the clump centre (the standard foliage trick) so the whole clump shades like a
// soft volume, and vertex colours add per-clump / top-lit variation. Plants wrap this in THREE.LOD so the cards only exist
// near the camera; far away only the cores render.
import * as THREE from 'three';
import { pbr } from './pbr.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const V3 = THREE.Vector3, UP = new V3(0, 1, 0);
const hsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;

// ---------- atlases: 512px, 2x2 different clusters (cards pick a quadrant so neighbours never repeat) ----------
function leafShape(x, kind, len, wid) {
  x.beginPath(); x.moveTo(0, 0);
  if (kind === 'needle') { x.moveTo(0, -wid / 2); x.lineTo(len, 0); x.lineTo(0, wid / 2); x.closePath(); return; }
  x.bezierCurveTo(len * .2, -wid * 1.05, len * .72, -wid * .85, len, 0); x.bezierCurveTo(len * .72, wid * .85, len * .2, wid * 1.05, 0, 0);
}
function drawLeaf(x, px, py, ang, len, wid, h, s, l, kind) {
  x.save(); x.translate(px, py); x.rotate(ang);
  if (kind === 'maple') {   // three-lobed
    for (const a of [-.62, 0, .62]) { x.save(); x.rotate(a); const L = a ? len * .72 : len; leafShape(x, 'broad', L, wid * .75); const g = x.createLinearGradient(0, 0, L, 0); g.addColorStop(0, hsl(h, s, l - 9)); g.addColorStop(1, hsl(h + 4, s, l + 4)); x.fillStyle = g; x.fill(); x.restore(); }
  } else {
    leafShape(x, kind, len, wid); const g = x.createLinearGradient(0, -wid, 0, wid); g.addColorStop(0, hsl(h + 3, s, l + 5)); g.addColorStop(.5, hsl(h, s, l)); g.addColorStop(1, hsl(h - 3, s, l - 8)); x.fillStyle = g; x.fill();
  }
  if (kind !== 'needle' && len > 16) { x.strokeStyle = hsl(h + 10, s - 10, l + 14); x.globalAlpha = .55; x.lineWidth = Math.max(1, len / 30); x.beginPath(); x.moveTo(len * .05, 0); x.lineTo(len * .85, 0); x.stroke(); x.globalAlpha = 1; }
  x.restore();
}
const KINDS = {
  //       hue range   sat  light      leaf len  width  count  twigs
  broad:  { h: [92, 112], s: 48, l: [24, 46], len: [30, 48], w: .42, n: 60, twig: 1 },
  maple:  { h: [84, 104], s: 52, l: [26, 46], len: [30, 42], w: .5, n: 46, twig: 1, kind: 'maple' },
  small:  { h: [72, 92], s: 55, l: [30, 52], len: [15, 23], w: .55, n: 120, twig: 1 },
  needle: { h: [118, 140], s: 40, l: [16, 32], len: [13, 19], w: .18, n: 0, sprig: 9 },
  box:    { h: [100, 122], s: 45, l: [18, 38], len: [11, 16], w: .6, n: 170, twig: 0, fill: 1 },
  blossom:{ h: [92, 110], s: 45, l: [24, 42], len: [26, 40], w: .42, n: 46, twig: 1, flowers: 1 },
  grassy: { h: [88, 108], s: 50, l: [24, 44], len: [24, 34], w: .3, n: 70, twig: 0 },
};
const atlasCache = new Map();
export function leafAtlas(name) {
  if (atlasCache.has(name)) return atlasCache.get(name);
  const K = KINDS[name], c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  let seed = name.length * 977; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let q = 0; q < 4; q++) {
    const cx = (q % 2) * 256 + 128, cy = Math.floor(q / 2) * 256 + 128, rad = K.fill ? 122 : 112;
    if (K.twig) { x.strokeStyle = '#5b4632'; x.lineCap = 'round'; for (let i = 0; i < 6; i++) { const a = R() * 6.28, L = 50 + R() * 50; x.lineWidth = 3.5 - i * .3; x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(cx + Math.cos(a + .3) * L * .5, cy + Math.sin(a + .3) * L * .5, cx + Math.cos(a) * L, cy + Math.sin(a) * L); x.stroke(); } }
    if (K.sprig) for (let i = 0; i < K.sprig; i++) {   // pine sprigs: a twig with needles fanning forward on both sides
      const a = i / K.sprig * 6.28 + R() * .4, L = 70 + R() * 40; x.strokeStyle = '#4a3a2a'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); x.stroke();
      for (let t = .12; t < 1; t += .045) for (const sd of [-1, 1]) { const px = cx + Math.cos(a) * L * t, py = cy + Math.sin(a) * L * t; drawLeaf(x, px, py, a + sd * (.55 + R() * .25), K.len[0] + R() * (K.len[1] - K.len[0]), 3.2, K.h[0] + R() * (K.h[1] - K.h[0]), K.s, K.l[0] + R() * (K.l[1] - K.l[0]) * (.5 + t * .5), 'needle'); }
    }
    const leaves = [];
    for (let i = 0; i < K.n; i++) { const r = rad * Math.sqrt(R()) * .86, a = R() * 6.28; leaves.push({ r, a, z: R() }); }
    leaves.sort((p, q2) => p.z - q2.z);   // back to front: back leaves darker
    for (const L of leaves) {
      const len = K.len[0] + R() * (K.len[1] - K.len[0]), px = cx + Math.cos(L.a) * L.r - Math.cos(L.a) * len * .3, py = cy + Math.sin(L.a) * L.r - Math.sin(L.a) * len * .3;
      const lit = K.l[0] + (K.l[1] - K.l[0]) * (.25 + .75 * L.z) * (.8 + R() * .2);
      drawLeaf(x, px, py, L.a + (R() - .5) * .9, len, len * K.w, K.h[0] + R() * (K.h[1] - K.h[0]), K.s + (R() - .5) * 10, lit, K.kind || 'broad');
    }
    if (K.flowers) for (let i = 0; i < 26; i++) {   // small 5-petal blossoms on top
      const r = 100 * Math.sqrt(R()), a = R() * 6.28, px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r, s = 6 + R() * 4;
      x.fillStyle = R() < .5 ? '#fbe3ee' : '#f39ac0'; for (let k = 0; k < 5; k++) { x.beginPath(); x.arc(px + Math.cos(k * 1.256) * s * .6, py + Math.sin(k * 1.256) * s * .6, s * .55, 0, 7); x.fill(); }
      x.fillStyle = '#f6d34a'; x.beginPath(); x.arc(px, py, s * .3, 0, 7); x.fill();
    }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; atlasCache.set(name, t); return t;
}

// ---------- materials ----------
// foliage normals are authored to point away from the plant, on both sides of a card. Three.js flips the normal on back
// faces of double-sided materials, which lights half the leaves as if they faced the ground; this turns that flip off.
export function keepNormals(m) {
  m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>', THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', '')); };
  m.customProgramCacheKey = () => 'keepNormals'; return m;
}
const matCache = new Map();
export function cardMat(name) {
  if (matCache.has(name)) return matCache.get(name);
  const map = leafAtlas(name), m = keepNormals(new THREE.MeshStandardMaterial({ map, alphaTest: .5, side: THREE.DoubleSide, vertexColors: true, roughness: .78, envMapIntensity: .5 }));
  m.userData.depth = new THREE.MeshDepthMaterial({ map, alphaTest: .5, side: THREE.DoubleSide, depthPacking: THREE.RGBADepthPacking });
  matCache.set(name, m); return m;
}
// leafy core: the forest_leaves scan normal map on a dark tint so the inside of the canopy reads as shaded leaves
export function coreMat(tint = 0x3c7a25) {
  const k = 'core' + tint; if (!matCache.has(k)) matCache.set(k, pbr('ph/forest_leaves_03', { rep: [1.5, 1.5], tint, normal: 1.4, noColor: true, rough: .85, envI: .35 }));
  return matCache.get(k);
}
export function withCardShadow(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; if (mesh.material.userData.depth) mesh.customDepthMaterial = mesh.material.userData.depth; return mesh; }

// ---------- card builder: many quads -> one BufferGeometry (position, normal, uv, color) ----------
export class Cards {
  constructor() { this.P = []; this.n = []; this.uv = []; this.c = []; }
  // centre pos, facing dir, size, roll, colour, clump centre (for normals), q = atlas quadrant 0-3 or a rect [u0,v0,u1,v1] (canvas coords, v down)
  add(pos, dir, size, roll, col, cc, q = 0, flip = false, stretch = 1) {
    const f = dir.clone().normalize(), ref = Math.abs(f.y) > .9 ? new V3(1, 0, 0) : UP, u = new V3().crossVectors(ref, f).normalize(), v = new V3().crossVectors(f, u);
    const cu = u.clone().multiplyScalar(Math.cos(roll)).addScaledVector(v, Math.sin(roll)), cv = v.clone().multiplyScalar(Math.cos(roll)).addScaledVector(u, -Math.sin(roll));
    const h = size / 2, rc = Array.isArray(q) ? q : [(q % 2) * .5, Math.floor(q / 2) * .5, (q % 2) * .5 + .5, Math.floor(q / 2) * .5 + .5];
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const p = pos.clone().addScaledVector(cu, a * h).addScaledVector(cv, b * h * stretch); this.P.push(p);
      const nn = p.clone().sub(cc); if (nn.lengthSq() < 1e-6) nn.copy(f); nn.normalize().multiplyScalar(.8).addScaledVector(UP, .3).normalize();
      this.n.push(nn.x, nn.y, nn.z); this.c.push(col.r, col.g, col.b);
      const fu = (flip ? -a : a) * .5 + .5, fv = b * .5 + .5;
      this.uv.push(rc[0] + fu * (rc[2] - rc[0]), 1 - (rc[1] + (1 - fv) * (rc[3] - rc[1])));
    }
    this._quads = (this._quads || 0) + 1;
  }
  geo() {
    const g = new THREE.BufferGeometry(), pos = new Float32Array(this.P.length * 3); this.P.forEach((p, i) => p.toArray(pos, i * 3));
    const idx = []; for (let q = 0; q < this._quads; q++) for (const i of [0, 1, 2, 0, 2, 3]) idx.push(q * 4 + i);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.setIndex(idx);
    g.computeBoundingSphere(); return g;
  }
  get empty() { return !this._quads; }
}

// random unit vector, biased upward by `up`
export function randDir(R, up = 0) { const z = R() * 2 - 1, a = R() * 6.2832, s = Math.sqrt(1 - z * z); return new V3(Math.cos(a) * s, z + up, Math.sin(a) * s).normalize(); }

// the atlas already carries leaf colour, so vertex colours are a brightness factor nudged toward the plant's hue
export function shade(tint, lit = 1) { const c = new THREE.Color(tint), m = Math.max(c.r, c.g, c.b, 1e-3); c.multiplyScalar(1 / m); return new THREE.Color(1, 1, 1).lerp(c, .3).multiplyScalar(lit); }
// one leafy clump: cards over a sphere of radius r at c (they sit on and just outside the core). density 1 = normal
export function clumpCards(cards, c, r, R, tint, { density = 1, size = 1.0, up = .25, flat = 1 } = {}) {
  const n = Math.round(Math.min(60, Math.max(8, 22 * r * r + 10)) * density);
  for (let i = 0; i < n; i++) {
    const d = randDir(R, up); d.y *= flat; d.normalize();
    const p = c.clone().addScaledVector(d, r * (.68 + R() * .38)), face = d.clone().add(randDir(R).multiplyScalar(.5)).normalize();
    const lit = .78 + .42 * (d.y * .5 + .5) + (R() - .5) * .14, col = shade(tint, lit);
    cards.add(p, face, r * size * (.8 + R() * .45), R() * 6.28, col, c, Math.floor(R() * 4), R() < .5);
  }
}

// lumpy core sphere (noise-pushed icosphere) with spherical-ish UVs
export function blob(r, R, detail = 2) {
  let g = new THREE.IcosahedronGeometry(r, detail); g.deleteAttribute('normal'); g.deleteAttribute('uv'); g = mergeVertices(g); const p = g.attributes.position, v = new V3(), o = R() * 10;
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x / r * 3.1 + o) * Math.sin(v.y / r * 2.7 + o * 2) * Math.sin(v.z / r * 3.4 + o * 3); v.multiplyScalar(1 + n * .2 + (R() - .5) * .07); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); const uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { uv[i * 2] = (p.getX(i) + p.getZ(i)) / r * .5; uv[i * 2 + 1] = p.getY(i) / r * .5; }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}

// ---------- grass: blade texture + a crossed-quad tuft, scattered with InstancedMesh in LOD chunks ----------
let bladeTex = null;
function blades() {
  if (bladeTex) return bladeTex;
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); let s = 7; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 46; i++) {
    const bx = 8 + R() * 240, h = 60 + R() * 64, lean = (R() - .5) * 40, w = 3 + R() * 3.5, l = 38 + R() * 16, hue = 86 + R() * 16;
    const g = x.createLinearGradient(0, 128, 0, 128 - h); g.addColorStop(0, hsl(hue, 50, l * .78)); g.addColorStop(1, hsl(hue - 4, 60, l + 10)); x.fillStyle = g;
    x.beginPath(); x.moveTo(bx - w, 128); x.quadraticCurveTo(bx - w * .5 + lean * .4, 128 - h * .55, bx + lean, 128 - h); x.quadraticCurveTo(bx + w * .5 + lean * .4, 128 - h * .55, bx + w, 128); x.fill();
  }
  bladeTex = new THREE.CanvasTexture(c); bladeTex.colorSpace = THREE.SRGBColorSpace; return bladeTex;
}
let tuftGeo = null, tuftMat = null;
function tuft() {
  if (tuftGeo) return [tuftGeo, tuftMat];
  const cards = new Cards(), w = .34, h = .13, cc = new V3(0, -.6, 0);
  for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3, d = new V3(Math.cos(a), 0, Math.sin(a)); cards.add(new V3(0, h / 2, 0), d, w, 0, new THREE.Color(1, 1, 1), cc, [0, 0, 1, 1], false, h / w); }
  const g = cards.geo(), col = g.attributes.color, p = g.attributes.position;
  for (let i = 0; i < col.count; i++) { const k = p.getY(i) > h / 2 ? 1.05 : .8; col.setXYZ(i, k, k, k); }
  tuftGeo = g; tuftMat = keepNormals(new THREE.MeshStandardMaterial({ map: blades(), alphaTest: .45, side: THREE.DoubleSide, vertexColors: true, roughness: .9, envMapIntensity: .4 }));
  return [tuftGeo, tuftMat];
}
// lawn grass near the camera. mask(x,z) -> true where grass may grow. Returns a group of LOD chunks.
export function grassField({ x0, x1, z0, z1, y = 0, density = 4, chunk = 8, near = 26, seed = 1, mask = () => true } = {}) {
  const G = new THREE.Group(), [geo, mat] = tuft(); let s = seed * 7919 + 1; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
  for (let cx = x0; cx < x1; cx += chunk) for (let cz = z0; cz < z1; cz += chunk) {
    const pts = [], n = Math.round(chunk * chunk * density);
    for (let i = 0; i < n; i++) { const x = cx + R() * chunk, z = cz + R() * chunk; if (x < x1 && z < z1 && mask(x, z)) pts.push([x, z]); }
    if (!pts.length) continue;
    const im = new THREE.InstancedMesh(geo, mat, pts.length); im.receiveShadow = true; im.castShadow = false;
    pts.forEach(([x, z], i) => { const sc = .7 + R() * .7; q.setFromAxisAngle(UP, R() * 6.28); m4.compose(new V3(x - cx - chunk / 2, 0, z - cz - chunk / 2), q, new V3(sc, sc * (.8 + R() * .5), sc)); im.setMatrixAt(i, m4); const v = .88 + R() * .24; col.setRGB(v * (.97 + R() * .06), v, v * .92); im.setColorAt(i, col); });
    im.computeBoundingSphere();
    const lod = new THREE.LOD(); lod.position.set(cx + chunk / 2, y, cz + chunk / 2); lod.addLevel(im, 0); lod.addLevel(new THREE.Object3D(), near); G.add(lod);
  }
  return G;
}

// ---------- flower heads: petal atlas (daisy / round five-petal), tinted by vertex colour ----------
let petalTex = null;
export function petalMat() {
  if (petalTex) return petalTex;
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  // left: daisy (12 long petals), right: five round petals with a dark eye
  for (let k = 0; k < 12; k++) { x.save(); x.translate(64, 64); x.rotate(k * Math.PI / 6); const g = x.createLinearGradient(0, 0, 58, 0); g.addColorStop(0, '#d9d9d9'); g.addColorStop(1, '#ffffff'); x.fillStyle = g; x.beginPath(); x.ellipse(32, 0, 26, 8, 0, 0, 7); x.fill(); x.restore(); }
  x.fillStyle = '#e8b21c'; x.beginPath(); x.arc(64, 64, 14, 0, 7); x.fill(); x.fillStyle = '#b8800c'; for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(64 + Math.cos(i) * 8 * Math.sqrt(i / 18), 64 + Math.sin(i * 2.4) * 8 * Math.sqrt(i / 18), 1.6, 0, 7); x.fill(); }
  for (let k = 0; k < 5; k++) { x.save(); x.translate(192, 64); x.rotate(k * 1.2566); const g = x.createRadialGradient(28, 0, 2, 28, 0, 34); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#dcdcdc'); x.fillStyle = g; x.beginPath(); x.arc(30, 0, 30, 0, 7); x.fill(); x.restore(); }
  x.fillStyle = '#3a2340'; x.beginPath(); x.arc(192, 64, 13, 0, 7); x.fill(); x.fillStyle = '#f2d045'; x.beginPath(); x.arc(192, 64, 6, 0, 7); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  petalTex = keepNormals(new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, side: THREE.DoubleSide, vertexColors: true, roughness: .55 })); return petalTex;
}
// add one flat flower head (kind 0 daisy, 1 round) to a Cards builder
export function flowerHead(cards, pos, size, col, kind, R) {
  const f = new V3((R() - .5) * .7, 1, (R() - .5) * .7).normalize();
  cards.add(pos, f, size, R() * 6.28, col, pos.clone().addScaledVector(f, -1), kind ? [.5, 0, 1, 1] : [0, 0, .5, 1]);
}
