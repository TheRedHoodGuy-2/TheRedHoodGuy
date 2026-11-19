// NATURE + YARD PROPS (reusable): six tree species with real branch structure and leaf-card canopies, bushes, clipped hedges,
// flower beds, benches, lamp posts, railings, a flagpole. Plants are THREE.LOD: leaf cards near the camera, cores far away.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, rng } from '../util.js';
import { pbr, contactShadow } from '../pbr.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { Cards, cardMat, coreMat, clumpCards, blob, shade, withCardShadow, flowerHead, petalMat } from '../foliage.js';

let _mats = null;
const mats = () => _mats || (_mats = {
  bark: pbr('ph/pine_bark', { rep: [1, 2], normal: 1.5, tint: 0xd4bca6 }),
  barkDark: pbr('ph/pine_bark', { rep: [1, 2], normal: 1.6, tint: 0xb39a84 }),
  birch: birchMat(),
  soil: pbr('ph/excavated_soil_wall', { rep: [2, 2], tint: 0x7a5a42, normal: .8 }),
  oak: pbr('ph/oak_veneer_01', { rep: [3, .5], rough: .8, normal: .6 }),
  iron: M(0x2f4a3a, { roughness: .45, metalness: .5 }),
  stone: pbr('ph/brushed_concrete', { rep: [1, 1], tint: 0xd8d4cc, normal: .8 }),
  stem: M(0x4f7d2e, { roughness: .8 }),
  stake: pbr('ph/oak_veneer_01', { rep: [.3, 2], tint: 0xb89a74, rough: .9 }),
});
function birchMat() {   // white bark with dark horizontal lenticels and knots
  const c = document.createElement('canvas'); c.width = 256; c.height = 512; const x = c.getContext('2d'); let s = 3; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
  x.fillStyle = '#ece8e0'; x.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${40 + R() * 30},${36 + R() * 25},${32 + R() * 20},${.35 + R() * .5})`; x.fillRect(R() * 256, R() * 512, 6 + R() * 40, 1.5 + R() * 3.5); }
  for (let i = 0; i < 9; i++) { x.fillStyle = '#2e2924'; x.beginPath(); x.ellipse(R() * 256, R() * 512, 6 + R() * 10, 3 + R() * 5, 0, 0, 7); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 3);
  return new THREE.MeshStandardMaterial({ map: t, roughness: .7 });
}

// ---------- trees ----------
// species: oak (wide, gnarly), maple (round, dense), birch (white, slender, drooping), poplar (tall column),
// pine (conical tiers of needles), sapling (young tree on a stake). h = height in metres.
const SPECIES = {
  oak:     { trunk: .34, tr: .045, nb: [5, 7], ang: [.95, 1.3], len: .3, depth: 2, kids: 3, clump: .13, crown: 3, leaf: 'broad', tint: [0x7dbb48, 0x6aa83a, 0x8cc456], bark: 'barkDark', bend: .25 },
  maple:   { trunk: .36, tr: .045, nb: [6, 8], ang: [.6, .95], len: .26, depth: 2, kids: 2, clump: .13, crown: 4, leaf: 'maple', tint: [0x8cc44e, 0x9ccc52, 0x7fb848], leader: .72, bark: 'bark', bend: .3 },
  birch:   { trunk: .45, tr: .022, nb: [8, 11], ang: [.5, .8], len: .2, depth: 1, kids: 2, clump: .075, crown: 3, leaf: 'small', tint: [0xa8d060, 0x9cc85a, 0xb5d86a], leader: .9, bark: 'birch', droop: .35, bend: .2 },
  poplar:  { trunk: .2, tr: .03, nb: [12, 16], ang: [.22, .38], len: .14, depth: 1, kids: 2, clump: .07, crown: 3, leaf: 'small', tint: [0x7fb84a, 0x8cc052, 0x74ad44], leader: .96, bark: 'bark', column: true, bend: .1 },
  sapling: { trunk: .45, tr: .022, nb: [3, 5], ang: [.6, .9], len: .26, depth: 1, kids: 2, clump: .13, crown: 2, leaf: 'broad', tint: [0x8cc456, 0x7dbb48], leader: .8, bark: 'bark', stake: true, bend: .2 },
  pine:    { pine: true, tint: [0x4f8a3e, 0x5a9446, 0x467f38] },
};
export const TREE_TYPES = Object.keys(SPECIES);
const LOD_TREE = 50;   // beyond this distance only trunk + leafy cores render

export function tree({ h = 6, seed = 1, spread = 1, type = 'oak' } = {}) {
  const S = SPECIES[type] || SPECIES.oak, R = rng(seed * 131 + type.length), Mt = mats();
  const wood = [], clumps = [], tint = new THREE.Color(S.tint[Math.floor(R() * S.tint.length)]);
  const limb = (a, b, r0, r1, seg = 7) => {
    const d = b.clone().sub(a), L = d.length(); if (L < 1e-3) return;
    const g = new THREE.CylinderGeometry(r1, r0, L, seg, 1, true); g.translate(0, L / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); g.translate(a.x, a.y, a.z); wood.push(g);
    const j = new THREE.SphereGeometry(r1 * 1.02, seg, 4); j.translate(b.x, b.y, b.z); wood.push(j);
  };
  if (S.pine) return pine(h, R, tint, wood, limb, Mt);
  const th = h * S.trunk, tr = S.tr * h, lead = (S.leader || S.trunk) * h, V = (x, y, z) => new THREE.Vector3(x, y, z);
  // trunk: root flare, then a gently bending column up to the leader height
  for (let k = 0; k < 4; k++) { const a = k * 1.57 + R() * .6; const root = V(Math.cos(a) * tr * 1.9, -.12, Math.sin(a) * tr * 1.9); limb(root, V(Math.cos(a) * tr * .4, tr * 1.3, Math.sin(a) * tr * .4), tr * .32, tr * .3, 6); }   // root flare
  const spine = [V(0, 0, 0)]; let lean = V((R() - .5) * .06, 1, (R() - .5) * .06).normalize();
  const segs = 4; for (let i = 1; i <= segs; i++) { lean.add(V((R() - .5) * S.bend * .3, 0, (R() - .5) * S.bend * .3)).normalize(); spine.push(spine[i - 1].clone().addScaledVector(lean, lead / segs)); }
  const rAt = t => tr * (1.12 - t * .85);
  for (let i = 0; i < segs; i++) limb(spine[i], spine[i + 1], rAt(i / segs), rAt((i + 1) / segs), 9);
  const onSpine = y => { const t = Math.min(.999, y / lead) * segs, i = Math.floor(t); return spine[i].clone().lerp(spine[i + 1], t - i); };
  const grow = (from, dir, len, rad, depth) => {
    const mid = from.clone().addScaledVector(dir, len * .5), d2 = dir.clone().add(V((R() - .5) * S.bend, (S.droop ? -S.droop * .5 : .15), (R() - .5) * S.bend)).normalize(), to = mid.clone().addScaledVector(d2, len * .5);
    limb(from, mid, rad, rad * .8, 6); limb(mid, to, rad * .8, rad * .62, 6);
    if (depth > 0) for (let k = 0; k < S.kids; k++) {
      const yaw = (k - (S.kids - 1) / 2) * (.75 + R() * .5), cd = d2.clone().applyAxisAngle(V(0, 1, 0), yaw); cd.y += S.droop ? -S.droop * .4 : .25 + R() * .25; cd.normalize();
      grow(k === 0 && R() < .5 ? mid : to, cd, len * (.58 + R() * .17), rad * .62, depth - 1);
    } else { clumps.push({ c: to.clone().addScaledVector(d2, h * S.clump * .35), r: h * S.clump * spread * (.85 + R() * .4) }); if (R() < .6) clumps.push({ c: mid.clone().add(V(0, h * S.clump * .3, 0)), r: h * S.clump * spread * (.6 + R() * .3) }); }
  };
  const nb = S.nb[0] + Math.floor(R() * (S.nb[1] - S.nb[0] + 1)), y0 = S.column ? h * .18 : th, y1 = S.leader ? lead * .92 : th * 1.05;
  for (let i = 0; i < nb; i++) {
    const y = y0 + (y1 - y0) * (S.column ? i / nb : R()), a = i / nb * 6.2832 * 2.4 + R() * .7, el = S.ang[0] + R() * (S.ang[1] - S.ang[0]);
    const dir = V(Math.cos(a) * Math.sin(el), Math.cos(el), Math.sin(a) * Math.sin(el)).normalize(), base = onSpine(Math.min(y, lead));
    const L = h * S.len * (S.column ? 1 - .6 * (y - y0) / (y1 - y0 + 1e-3) : (.8 + R() * .35)) * spread;
    grow(base, dir, L, rAt(Math.min(1, y / lead)) * .55, S.depth);
  }
  const top = spine[segs];
  for (let k = 0; k < S.crown; k++) clumps.push({ c: top.clone().add(V((R() - .5) * h * .1, h * (S.column ? .02 : .05) + R() * h * .04, (R() - .5) * h * .1)), r: h * S.clump * spread * (1 + R() * .3) });
  if (S.column) for (let y = h * .25; y < h * .95; y += h * .07) { const t = (y - h * .2) / (h * .8), rr = h * S.clump * 1.55 * Math.pow(Math.sin(Math.PI * Math.min(1, t * .95 + .05)), .7); clumps.push({ c: onSpine(Math.min(y, lead)).add(V((R() - .5) * rr * .5, 0, (R() - .5) * rr * .5)), r: rr }); }
  if (S.stake) { const st = new THREE.BoxGeometry(.05, h * .55, .05); st.translate(tr * 4, h * .27 - .1, 0); wood.push(st); }
  return assemble(h, wood, clumps, tint, S.leaf, Mt[S.bark] || Mt.bark, R, S.stake ? Mt.stake : null, { density: S.column ? .75 : 1 });
}
function pine(h, R, tint, wood, limb, Mt) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z), tr = h * .028;
  limb(V(0, -.05, 0), V(0, h * .96, 0), tr * 1.3, tr * .2, 9);
  const tiers = 6 + Math.floor(R() * 3), cores = [], cards = new Cards(), cMat = cardMat('needle');
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1), y = h * (.22 + .72 * t), rr = Math.max(.35, h * .27 * Math.pow(1 - t, .85) + .2), tH = h * .72 / tiers * 1.6;
    const cone = new THREE.ConeGeometry(rr * .7, tH, 10, 3, true); cone.translate(0, y, 0); jitter(cone, R, rr * .12); cores.push(cone);
    for (let k = 0; k < 3; k++) { const a = R() * 6.28; limb(V(0, y - tH * .3, 0), V(Math.cos(a) * rr * .7, y - tH * .45, Math.sin(a) * rr * .7), tr * .3, tr * .12, 5); }
    const n = Math.round(16 + rr * 14);
    for (let k = 0; k < n; k++) {
      const a = k / n * 6.28 + R() * .3, out = .45 + R() * .5, p = V(Math.cos(a) * rr * out, y - tH * .5 * out + tH * .15, Math.sin(a) * rr * out);
      const face = V(Math.cos(a) * .6, .75 + R() * .3, Math.sin(a) * .6).normalize(), col = shade(tint, .8 + .35 * t + (R() - .5) * .14);
      cards.add(p, face, rr * (.75 + R() * .35), a + R(), col, V(0, y - tH * .2, 0), Math.floor(R() * 4), R() < .5);
    }
  }
  const tip = V(0, h * .99, 0); for (let k = 0; k < 4; k++) cards.add(tip.clone().add(V(0, -.2, 0)), V(Math.cos(k * 1.57), .4, Math.sin(k * 1.57)), .7, R(), shade(tint, 1.1), V(0, h * .9, 0), k);
  const coreGeo = mergeGeometries(cores.map(g => g.toNonIndexed()));
  return finish(h, wood, coreGeo, cards, tint, Mt.barkDark, null, coreMat(tint.clone().multiplyScalar(.4).getHex()), cMat);
}
function jitter(g, R, amt) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + (R() - .5) * amt, p.getY(i) + (R() - .5) * amt * .5, p.getZ(i) + (R() - .5) * amt); g.computeVertexNormals(); }
function assemble(h, wood, clumps, tint, leaf, barkMat, R, extraMat, { density = 1 } = {}) {
  const cores = [], cards = new Cards();
  for (const k of clumps) {
    const g = blob(k.r * (k.r < .7 ? .44 : .62), R, 1); g.translate(k.c.x, k.c.y, k.c.z); cores.push(g);
    const t = tint.clone().offsetHSL((R() - .5) * .03, 0, (R() - .5) * .06).multiplyScalar(.85 + .3 * Math.min(1, k.c.y / h));
    clumpCards(cards, k.c, k.r, R, t, { density: density * (k.r < .7 ? 1.4 : 1), size: k.r < .7 ? 1.15 : 1 });
  }
  return finish(h, wood, mergeGeometries(cores), cards, tint, barkMat, extraMat, coreMat(tint.clone().multiplyScalar(.42).getHex()), cardMat(leaf));
}
function finish(h, wood, coreGeo, cards, tint, barkMat, extraMat, cMatCore, cMat) {
  const g = new THREE.Group(), lod = new THREE.LOD();
  const woodGeo = mergeGeometries(wood.map(w => w.index ? w.toNonIndexed() : w)), near = new THREE.Group(), far = new THREE.Group();
  const mk = (geo, mat, parent) => { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  mk(woodGeo, barkMat, near); mk(coreGeo, cMatCore, near); withCardShadow(mk(cards.geo(), cMat, near));
  mk(woodGeo, barkMat, far); mk(coreGeo, cMatCore, far);
  lod.addLevel(near, 0); lod.addLevel(far, LOD_TREE); g.add(lod);
  g.add(contactShadow(h * .6, h * .6, { opacity: .28 }));
  return g;
}

// ---------- bushes: leafy clumps with woody stems at the base. kind: round | flower | box ----------
export function bush({ w = 1.2, h = .8, seed = 2, kind = 'round' } = {}) {
  const R = rng(seed * 17 + 3), leaf = kind === 'flower' ? 'blossom' : kind === 'box' ? 'box' : 'broad';
  const tint = new THREE.Color(kind === 'box' ? 0x6aa040 : [0x7dbb48, 0x6fae3e, 0x86c050][Math.floor(R() * 3)]);
  const n = Math.max(3, Math.round(w * 3.2)), clumps = [], wood = [];
  for (let i = 0; i < n; i++) { const r = h * (.33 + R() * .2); clumps.push({ c: new THREE.Vector3((R() - .5) * (w - r), r * .85 + R() * h * .25, (R() - .5) * (w * .65 - r * .5)), r }); }
  for (let i = 0; i < 5; i++) { const a = R() * 6.28, g = new THREE.CylinderGeometry(.012, .02, h * .5, 5, 1, true); g.rotateZ((R() - .5) * .6); g.translate(Math.cos(a) * w * .2, h * .2, Math.sin(a) * w * .15); wood.push(g); }
  const cores = [], cards = new Cards();
  for (const k of clumps) { const g = blob(k.r * .68, R, 1); g.translate(k.c.x, k.c.y, k.c.z); cores.push(g); clumpCards(cards, k.c, k.r, R, tint.clone().offsetHSL(0, 0, (R() - .5) * .06), { density: 1.3, size: 1.05, flat: .8 }); }
  const g = new THREE.Group(), lod = new THREE.LOD(), near = new THREE.Group(), far = new THREE.Group(), coreGeo = mergeGeometries(cores), cm = coreMat(tint.clone().multiplyScalar(.42).getHex());
  const mk = (geo, mat, parent) => { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  mk(mergeGeometries(wood.map(x => x.toNonIndexed())), mats().bark, near); mk(coreGeo, cm, near); withCardShadow(mk(cards.geo(), cardMat(leaf), near));
  mk(coreGeo, cm, far); lod.addLevel(near, 0); lod.addLevel(far, 30); g.add(lod);
  g.add(contactShadow(w * 1.2, w * .9, { opacity: .3 })); return g;
}

// ---------- clipped hedge: an organic (noise-displaced) box covered in small-leaf cards ----------
export function hedge({ len = 4, h = .9, d = .7, seed = 5 } = {}) {
  const R = rng(seed + Math.round(len * 13)), g = new THREE.Group(), tint = new THREE.Color(0x6aa040);
  let core = new THREE.BoxGeometry(len, h * .92, d * .9, Math.ceil(len * 5), Math.ceil(h * 5), Math.ceil(d * 5)); core.deleteAttribute('normal'); core.deleteAttribute('uv'); core = mergeVertices(core);
  const p = core.attributes.position; for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const top = (y + h * .46) / (h * .92), round = Math.max(0, top - .8) * 5;   // round off the top edges
    z *= 1 - round * .18; x = Math.sign(x) * Math.min(Math.abs(x), len / 2 - round * .06);
    const n = Math.sin(x * 4.1 + seed) * Math.sin(y * 5.3) * Math.sin(z * 4.7 + 1) * .05 + (R() - .5) * .03; p.setXYZ(i, x * (1 + n * .2), y + n, z * (1 + n * 1.4));
  }
  core.computeVertexNormals(); { const uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { uv[i * 2] = p.getX(i) + p.getZ(i); uv[i * 2 + 1] = p.getY(i); } core.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
  core.translate(0, h * .46, 0);
  const cards = new Cards(), V = (x, y, z) => new THREE.Vector3(x, y, z), step = .2, cc = (x, y, z) => V(x * .6, h * .45, z * .3);
  const col = y => shade(tint, .78 + .4 * (y / h) + (R() - .5) * .12);
  for (let x = -len / 2 + step / 2; x < len / 2; x += step) {
    for (let z = -d / 2 + step / 2; z < d / 2; z += step) { const pp = V(x + (R() - .5) * .08, h * .93 + (R() - .3) * .05, z + (R() - .5) * .08); cards.add(pp, V((R() - .5) * .9, 1, (R() - .5) * .9), .34 + R() * .1, R() * 6.28, col(h), cc(pp.x, 0, pp.z), Math.floor(R() * 4), R() < .5); }
    for (let y = step / 2; y < h * .95; y += step) for (const sd of [-1, 1]) { const pp = V(x + (R() - .5) * .08, y + (R() - .5) * .06, sd * (d * .45 + .015) + (R() - .5) * .04); cards.add(pp, V((R() - .5) * .7, (R() - .4) * .6, sd), .32 + R() * .1, R() * 6.28, col(y), cc(pp.x, 0, pp.z), Math.floor(R() * 4), R() < .5); }
  }
  for (let z = -d / 2 + step / 2; z < d / 2; z += step) for (let y = step / 2; y < h * .95; y += step) for (const sd of [-1, 1]) { const pp = V(sd * (len / 2 + .01), y, z); cards.add(pp, V(sd, (R() - .4) * .6, (R() - .5) * .7), .32, R() * 6.28, col(y), V(0, h * .45, 0), Math.floor(R() * 4)); }
  const lod = new THREE.LOD(), near = new THREE.Group(), far = new THREE.Group(), cm = coreMat(0x2c5219);
  const mk = (geo, mat, parent) => { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  mk(core, cm, near); withCardShadow(mk(cards.geo(), cardMat('box'), near)); mk(core, cm, far);
  lod.addLevel(near, 0); lod.addLevel(far, 30); g.add(lod); g.add(contactShadow(len + .6, d + .8, { opacity: .3 })); return g;
}

// ---------- flower bed: stone edging, mulch, leafy clumps, daisies / round blooms / tulips in colour drifts ----------
const BLOOMS = [0xe94b6a, 0xf5c542, 0xffffff, 0xb36ae0, 0xff8a3d, 0xff6fa8, 0x6f8cff];
export function flowerBed({ w = 2.4, d = 1, seed = 4 } = {}) {
  const g = new THREE.Group(), R = rng(seed * 31 + 7), Mt = mats(), V = (x, y, z) => new THREE.Vector3(x, y, z);
  // edging: individual rough stones, merged into one mesh
  const stones = []; const per = 2 * (w + d), ns = Math.round(per / .26);
  for (let i = 0; i < ns; i++) {
    let t = i / ns * per, x, z, rot = 0; if (t < w) { x = -w / 2 + t; z = -d / 2; } else if ((t -= w) < d) { x = w / 2; z = -d / 2 + t; rot = 1.57; } else if ((t -= d) < w) { x = w / 2 - t; z = d / 2; } else { t -= w; x = -w / 2; z = d / 2 - t; rot = 1.57; }
    const s = new THREE.BoxGeometry(.24, .12 + R() * .05, .13); s.rotateY(rot + (R() - .5) * .15); s.translate(x, .07, z); stones.push(s.toNonIndexed());
  }
  add(mergeGeometries(stones), Mt.stone, 0, 0, 0, g);
  rb(w - .12, .16, d - .12, Mt.soil, 0, .08, 0, g, .02);
  const near = new THREE.Group(), far = new THREE.Group(), leaves = new Cards(), heads = new Cards(), stems = [], tulips = [], cores = [];
  const drift = [BLOOMS[Math.floor(R() * BLOOMS.length)], BLOOMS[Math.floor(R() * BLOOMS.length)], BLOOMS[Math.floor(R() * BLOOMS.length)]];
  const nPl = Math.round(w * d * 9);
  for (let i = 0; i < nPl; i++) {
    const x = (R() - .5) * (w - .35), z = (R() - .5) * (d - .3), u = (x / w + .5), col = new THREE.Color(drift[Math.min(2, Math.floor(u * 3 + (R() - .5) * .6))] ?? drift[0]), kind = Math.floor(R() * 3);
    const base = V(x, .16, z), lt = new THREE.Color(0x5e9a38).multiplyScalar(.8 + R() * .3);
    clumpCards(leaves, base.clone().add(V(0, .07, 0)), .11, R, lt, { density: .5, size: 1.4, up: .6 });
    const cb = blob(.07, R, 1); cb.scale(1, .7, 1); cb.translate(x, .2, z); cores.push(cb);
    for (let f = 0; f < 3; f++) {
      const fx = x + (R() - .5) * .12, fz = z + (R() - .5) * .12, fh = .14 + R() * .14, top = V(fx, .16 + fh, fz);
      const st = new THREE.CylinderGeometry(.005, .007, fh, 4, 1, true); st.translate(fx, .16 + fh / 2, fz); stems.push(st);
      if (kind === 2) { const cup = new THREE.LatheGeometry([[0, 0], [.02, .005], [.032, .03], [.03, .06], [.022, .07]].map(([a, b]) => new THREE.Vector2(a, b)), 7); cup.translate(top.x, top.y - .01, top.z); paint(cup, col); tulips.push(cup.toNonIndexed()); }
      else flowerHead(heads, top, kind ? .1 : .11, col.clone().multiplyScalar(.95 + R() * .1), kind, R);
    }
  }
  const mk = (geo, mat, parent, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; parent.add(m); return m; };
  const cm = coreMat(0x3d6e25), coreGeo = mergeGeometries(cores);
  mk(coreGeo, cm, near); withCardShadow(mk(leaves.geo(), cardMat('broad'), near)); mk(mergeGeometries(stems.map(s => s.toNonIndexed())), Mt.stem, near, false);
  if (!heads.empty) mk(heads.geo(), petalMat(), near); if (tulips.length) mk(mergeGeometries(tulips), tulipMat(), near);
  mk(coreGeo, cm, far);
  const lod = new THREE.LOD(); lod.addLevel(near, 0); lod.addLevel(far, 22); g.add(lod);
  return g;
}
function paint(geo, col) { const n = geo.attributes.position.count, c = new Float32Array(n * 3); for (let i = 0; i < n; i++) col.toArray(c, i * 3); geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); }
let _tulip = null; const tulipMat = () => _tulip || (_tulip = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5, side: THREE.DoubleSide }));

export function bench({ w = 1.6 } = {}) {
  const g = new THREE.Group(), Mt = mats();
  for (let i = 0; i < 4; i++) rb(w, .03, .085, Mt.oak, 0, .45, -.16 + i * .1, g, .01);
  for (let i = 0; i < 2; i++) { const b = rb(w, .085, .03, Mt.oak, 0, .62 + i * .11, .24, g, .01); b.rotation.x = -.15; }
  for (const s of [-1, 1]) { rb(.05, .45, .45, Mt.iron, s * (w / 2 - .12), .225, 0, g, .015); const back = rb(.05, .4, .04, Mt.iron, s * (w / 2 - .12), .66, .24, g, .01); back.rotation.x = -.15; }
  g.add(contactShadow(w * 1.15, .8)); return g;
}
export function lampPost({ h = 3.6 } = {}) {
  const g = new THREE.Group(), Mt = mats();
  add(cyl(.1, .13, .3, 12), Mt.iron, 0, .15, 0, g); add(cyl(.045, .06, h, 10), Mt.iron, 0, h / 2, 0, g);
  add(cyl(.18, .12, .32, 6), new THREE.MeshStandardMaterial({ color: 0xfff6d8, emissive: 0xfff1c0, emissiveIntensity: .6, roughness: .3 }), 0, h + .1, 0, g);
  add(new THREE.ConeGeometry(.26, .2, 6), Mt.iron, 0, h + .35, 0, g); return g;
}
export function railing({ len = 6, h = 1.1 } = {}) {   // painted iron fence: chunky posts + one cut-out panel for rails and pickets
  // (real sub-pixel pickets get garbage depth in the CPU renderer and bleed through walls from far away, so the infill is a texture)
  const g = new THREE.Group(), Mt = mats();
  for (let x = -len / 2; x <= len / 2 + 1e-3; x += 2) { rb(.08, h + .1, .08, Mt.iron, x, (h + .1) / 2, 0, g, .01); add(new THREE.ConeGeometry(.07, .12, 4), Mt.iron, x, h + .16, 0, g); }
  if (!railTex) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128; const x = c.getContext('2d'), col = '#' + Mt.iron.color.getHexString();
    x.fillStyle = col; x.fillRect(0, 12, 128, 7); x.fillRect(0, 112, 128, 7);
    for (let i = 0; i < 128; i += 16) { x.fillRect(i + 6, 6, 4, 116); x.beginPath(); x.moveTo(i + 3, 8); x.lineTo(i + 8, 0); x.lineTo(i + 13, 8); x.fill(); }
    railTex = new THREE.CanvasTexture(c); railTex.colorSpace = THREE.SRGBColorSpace; railTex.wrapS = THREE.RepeatWrapping; railTex.anisotropy = 8;
  }
  const t = railTex.clone(); t.repeat.set(len / (h * 1.0), 1); t.needsUpdate = true;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(len, h), new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, side: THREE.DoubleSide, roughness: .45, metalness: .5 }));
  panel.position.y = h / 2 + .02; panel.castShadow = true; panel.customDepthMaterial = new THREE.MeshDepthMaterial({ map: t, alphaTest: .5 }); g.add(panel);
  return g;
}
let railTex = null;
export function flagpole({ h = 8 } = {}) {
  const g = new THREE.Group(), steel = M(0xd5d9de, { roughness: .25, metalness: .8 });
  add(cyl(.05, .07, h, 12), steel, 0, h / 2, 0, g); add(new THREE.SphereGeometry(.09, 12, 10), M(0xe8c35a, { roughness: .3, metalness: .7 }), 0, h + .05, 0, g);
  const c = document.createElement('canvas'); c.width = 300; c.height = 200; const x = c.getContext('2d');
  x.fillStyle = '#1f5fbf'; x.fillRect(0, 0, 300, 200); x.fillStyle = '#ffd34d'; x.beginPath(); x.arc(150, 100, 55, 0, 7); x.fill(); x.fillStyle = '#1f5fbf'; x.font = '800 70px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('S', 150, 104);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(1.5, 1, 12, 4), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const u = (p.getX(i) + .75) / 1.5; p.setZ(i, Math.sin(u * 5) * .08 * u); } geo.computeVertexNormals();
  const flag = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: .8 })); flag.position.set(.78, h - .6, 0); g.add(flag);
  g.add(contactShadow(.6, .6)); return { group: g, flag };
}
