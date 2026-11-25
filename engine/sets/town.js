// TOWN (2026-11-18): the reusable neighbourhood map, copied from a real US suburb (downtown Naperville, Illinois, from
// OpenStreetMap: (c) OpenStreetMap contributors, ODbL) at studio scale. assets/town/town.json comes from
// tools/town_build.py. Real street layout, real building footprints, real parks; buildings are OUTER SHELLS (walls with
// windows, hip roofs on houses, flat roofs with parapets on the rest) until a story needs an inside. House A and House B
// stand on two real lots (full shells; interiors on request). Civic buildings (school, police, fire, hospital, library,
// town hall) get generic signs and their own colours. Everything of one material is merged into one mesh (fast).
//   const T = await buildTown(scene, { interiors: false })  -> { root, data, lots: { A: group, B: group } }
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { mat, worldUV } from '../materials.js';
import { bbox, at } from '../build.js';
import { houseShell, GRADE } from './shell.js';
import { buildHouse } from './house.js';

const Y = GRADE;
const HOUSE_COLS = ['#f2efe8', '#efe3c8', '#f3e6b8', '#e3d6c2', '#c9d1d6', '#cfdde6', '#e8e4dc', '#d9cfc0'];   // US suburb siding: white, cream, butter, beige, blue-grey, light blue
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function strip(pts, w, y) {   // a flat ribbon along a polyline (roads, paths), mitred at the joints
  const P = [], I = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, nx = -dz / L * w / 2, nz = dx / L * w / 2;
    P.push(pts[i][0] + nx, y, pts[i][1] + nz, pts[i][0] - nx, y, pts[i][1] - nz);
    if (i) { const k = (i - 1) * 2; I.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals();
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); return g;
}
function poly(pts, y) { const s = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], -p[1]))); const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); return g; }
function prism(pts, y0, h) {   // walls only: the extrusion's caps are dropped (the roof is its own mesh; a cap under it z-fought from the air)
  const s = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], -p[1]))), e = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: false }), side = e.groups.find(q => q.materialIndex === 1);
  const src = e.index ? e.toNonIndexed() : e, P = src.attributes.position.array.slice(side.start * 3, (side.start + side.count) * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals(); g.rotateX(-Math.PI / 2); g.translate(0, y0, 0); return g; }
function hipRoof(pts, y0, rise, over = .5) {   // roof faces from each (pushed out) wall edge up to a ridge (the footprint shrunk to its long axis)
  const c = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);
  let best = 0, ang = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L > best) { best = L; ang = Math.atan2(b[1] - a[1], b[0] - a[0]); } }
  const ux = Math.cos(ang), uz = Math.sin(ang); let lo = 1e9, hi = -1e9, wlo = 1e9, whi = -1e9;
  for (const p of pts) { const u = (p[0] - c[0]) * ux + (p[1] - c[1]) * uz, v = -(p[0] - c[0]) * uz + (p[1] - c[1]) * ux; lo = Math.min(lo, u); hi = Math.max(hi, u); wlo = Math.min(wlo, v); whi = Math.max(whi, v); }
  const half = (whi - wlo) / 2, rl = Math.max(0, (hi - lo) / 2 - half) * .9, mid = (lo + hi) / 2;
  const r0 = [c[0] + ux * (mid - rl), c[1] + uz * (mid - rl)], r1 = [c[0] + ux * (mid + rl), c[1] + uz * (mid + rl)];
  const P = [], push = (x, y, z) => P.push(x, y, z), top = y0 + Math.min(rise, half * .75);
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], out = q => { const dx = q[0] - c[0], dz = q[1] - c[1], L = Math.hypot(dx, dz) || 1; return [q[0] + dx / L * over, q[1] + dz / L * over]; };
    const A = out(a), Bq = out(b), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], t = ((m[0] - c[0]) * ux + (m[1] - c[1]) * uz) > mid ? r1 : r0;
    const e = y0 - over * .5; push(A[0], e, A[1]); push(Bq[0], e, Bq[1]); push(t[0], top, t[1]);
    if (rl > .01) { const o = t === r0 ? r1 : r0, side = ((m[0] - c[0]) * -uz + (m[1] - c[1]) * ux); if (Math.abs(side) > half * .5) { push(Bq[0], e, Bq[1]); push(o[0], top, o[1]); push(t[0], top, t[1]); } }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  // wind every triangle so it faces up
  const pa = g.attributes.position; for (let i = 0; i < pa.count; i += 3) { const v0 = new THREE.Vector3().fromBufferAttribute(pa, i), v1 = new THREE.Vector3().fromBufferAttribute(pa, i + 1), v2 = new THREE.Vector3().fromBufferAttribute(pa, i + 2); if (v1.clone().sub(v0).cross(v2.clone().sub(v0)).y < 0) { pa.setXYZ(i + 1, v2.x, v2.y, v2.z); pa.setXYZ(i + 2, v1.x, v1.y, v1.z); } }
  g.computeVertexNormals(); return g;
}
function sign(text, bg, fg = '#ffffff', w = 4.2) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 512, 128);
  let fs = 74; x.font = `bold ${fs}px sans-serif`; while (x.measureText(text).width > 460) { fs -= 2; x.font = `bold ${fs}px sans-serif`; } x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, 256, 66);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const g = new THREE.Group();
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshStandardMaterial({ map: t, roughness: .6 })); p.position.set(0, 1.6, .06); g.add(p, at(bbox(w + .2, w / 4 + .2, .1, new THREE.MeshStandardMaterial({ color: '#2a2a2c' }), .02), 0, 1.6, 0));
  for (const s of [-1, 1]) g.add(at(bbox(.12, 1.2, .12, new THREE.MeshStandardMaterial({ color: '#2a2a2c' }), .02), s * w * .4, .6, 0)); return g;
}
const ROLE = { school: ['SCHOOL', '#1f4f8a', 'facadeBrick', '#a5573f'], police: ['POLICE', '#1d3b6e', 'facadeStucco', '#c9d1d6'], fire: ['FIRE STATION 1', '#a8261f', 'facadeBrick', '#9b3b2c'],
  hospital: ['HOSPITAL', '#b3202a', 'facadeStucco', '#f2f2ee'], library: ['LIBRARY', '#3d5a3a', 'facadeStucco', '#d9cdb8'], townhall: ['TOWN HALL', '#4a3b2a', 'facadeStucco', '#efe6d6'] };
// a leafy street tree: trunk + a crown of noisy leaf clumps (one geometry, drawn instanced)
// a street tree built like a game tree: a curved trunk, 6 branches, and ~850 leaf-sprig CARDS (alpha-cut from the Poly
// Haven tree scan) clustered round the branch tips. Card normals point out of the crown so it shades as one soft mass.
export function treeParts(seed = 1) {
  const R = k => rnd(seed * 31 + k), trunkPts = [], branches = [], cards = [];
  for (let i = 0; i <= 6; i++) trunkPts.push(new THREE.Vector3((R(i) - .5) * .4 * i / 6, i / 6 * 5.2, (R(i + 7) - .5) * .4 * i / 6));
  const trunk = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(trunkPts), 12, .24, 10); const tp = trunk.attributes.position;   // taper
  for (let k = 0; k < tp.count; k++) { const y = tp.getY(k), f = 1 - y / 5.2 * .55, c = new THREE.CatmullRomCurve3(trunkPts).getPoint(Math.max(0, Math.min(1, y / 5.2))); tp.setX(k, c.x + (tp.getX(k) - c.x) * f); tp.setZ(k, c.z + (tp.getZ(k) - c.z) * f); }
  branches.push(trunk); const crown = new THREE.Vector3(0, 6.6, 0), tips = [];
  for (let b = 0; b < 6; b++) { const a = b / 6 * Math.PI * 2 + R(b + 20), y0 = 3.4 + R(b + 30) * 1.6, L = 2.2 + R(b + 40) * 1.2;
    const p0 = new THREE.Vector3(0, y0, 0), p2 = new THREE.Vector3(Math.cos(a) * L, y0 + 1.6 + R(b + 50) * 1.4, Math.sin(a) * L), p1 = p0.clone().lerp(p2, .5).add(new THREE.Vector3(0, .4, 0));
    branches.push(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(p0, p1, p2), 8, .09, 6)); tips.push(p2); }
  tips.push(new THREE.Vector3(0, 7.3, 0), new THREE.Vector3(.6, 6.4, -.5));
  for (let i = 0; i < 850; i++) {   // leaf cards round the tips, filling an ellipsoid crown
    const t = tips[i % tips.length], d = new THREE.Vector3(R(i * 3 + 100) - .5, R(i * 3 + 101) - .5, R(i * 3 + 102) - .5).normalize().multiplyScalar(.2 + Math.cbrt(R(i + 500)) * 1.9), c = t.clone().add(d);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(R(i + 600) * 6.28, R(i + 700) * 6.28, R(i + 800) * 6.28)), w = 1.3 + R(i + 900) * .7;
    const g = new THREE.PlaneGeometry(w * .5, w); g.applyQuaternion(q); g.translate(c.x, c.y, c.z);
    const n = g.attributes.normal, out = c.clone().sub(crown).normalize(); for (let k = 0; k < n.count; k++) n.setXYZ(k, out.x, out.y * .7 + .3, out.z);
    cards.push(g); }
  return { wood: mergeGeometries(branches.map(g => g.index ? g.toNonIndexed() : g)), leaves: mergeGeometries(cards.map(g => g.toNonIndexed())) };
}
export function leafMat() { const t = new THREE.TextureLoader().load(new URL('assets/gen/leafcard.png', document.baseURI).href); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return new THREE.MeshStandardMaterial({ map: t, alphaTest: .45, side: THREE.DoubleSide, roughness: .8, color: '#c8dcb0' }); }
export function barkMat() { const t = new THREE.TextureLoader().load(new URL('assets/ph/tree_small_02/textures/tree_small_02_diff_1k.jpg', document.baseURI).href); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 4); return new THREE.MeshStandardMaterial({ map: t, roughness: .9 }); }
export async function buildTown(scene, o = {}) {
  const data = await (await fetch(new URL('assets/town/town.json', document.baseURI))).json(), root = new THREE.Group(); scene.add(root);
  const [x0, z0, x1, z1] = data.bounds, add = (geos, m, shadow = true) => { if (!geos.length) return; const me = new THREE.Mesh(worldUV(mergeGeometries(geos.map(g => g.index ? g.toNonIndexed() : g))), m); me.receiveShadow = true; me.castShadow = shadow; root.add(me); return me; };
  const lawn = new THREE.Mesh(worldUV(new THREE.PlaneGeometry(x1 - x0 + 400, z1 - z0 + 400).rotateX(-Math.PI / 2)), mat('grass', {})); lawn.position.set((x0 + x1) / 2, Y, (z0 + z1) / 2); lawn.receiveShadow = true; root.add(lawn);
  // ground surfaces: parks, pitches, pools, parking; then roads and paths on top
  const A = {}; for (const a of data.areas) (A[a.kind] ||= []).push(poly(a.pts, Y + .01 + (a.kind === 'parking' ? .01 : 0)));
  add([...(A.park || []), ...(A.grass || []), ...(A.garden || [])], mat('grass', { color: '#6a9844' }), false);
  add([...(A.pitch || []), ...(A.stadium || []), ...(A.track || [])], mat('grass', { color: '#4f8f3a' }), false);
  add(A.parking || [], mat('asphalt', { color: '#606266' }), false);
  add(A.swimming_pool || [], new THREE.MeshPhysicalMaterial({ color: '#4fb3d9', roughness: .05, clearcoat: 1 }), false);
  add(A.playground || [], mat('jute', { color: '#c9764a' }), false);
  add(data.roads.map(r => strip(r.pts, r.w, Y + .03 + (r.kind === 'service' ? 0 : .005))), mat('asphalt', {}), false);
  add(data.foot.map(p => strip(p, 2.2, Y + .06)), mat('pavement', {}), false);
  add(data.roads.filter(r => ['secondary', 'tertiary', 'primary'].includes(r.kind)).map(r => strip(r.pts, .18, Y + .045)), new THREE.MeshStandardMaterial({ color: '#e8c547', roughness: .6 }), false);   // centre line
  // buildings: walls by kind (and colour by house), roofs
  const walls = {}, roofs = { shingle: [], flat: [], tile: [] }, signs = [];
  for (const [i, b] of data.buildings.entries()) {
    const role = b.role && ROLE[b.role], key = role ? `${role[2]}|${role[3]}` : b.kind === 'house' || b.kind === 'shed' ? `facadeSiding|${HOUSE_COLS[i % HOUSE_COLS.length]}` : b.kind === 'shop' ? (i % 3 ? 'facadeBrick|#a5573f' : 'facadeStucco|#e9dfcc') : b.kind === 'church' ? 'facadeBrick|#8e4a36' : b.kind === 'school' ? 'facadeBrick|#a5573f' : 'facadeStucco|#e6dccb';
    (walls[key] ||= []).push(prism(b.pts, Y, b.h - Y * 0));
    if (b.kind === 'house' || b.kind === 'shed' || b.kind === 'church') (i % 5 === 0 ? roofs.tile : roofs.shingle).push(hipRoof(b.pts, Y + b.h, b.kind === 'church' ? 8 : 3.4, .5));
    else { roofs.flat.push(poly(b.pts, Y + b.h)); }
    if (role) { const c = b.pts.reduce((a, p) => [a[0] + p[0] / b.pts.length, a[1] + p[1] / b.pts.length], [0, 0]); const s = sign(role[0], role[1]); s.position.set(c[0], Y, c[1]); signs.push([s, b]); }
  }
  for (const [k, geos] of Object.entries(walls)) { const [m, c] = k.split('|'); add(geos, mat(m, { color: c })); }
  add(roofs.shingle, mat('shingles', { color: '#4a4c50' })); add(roofs.tile, mat('roofTiles', {})); add(roofs.flat, mat('concrete', { color: '#77767a', size: 3 }));
  // signs: stood on the street side of their building (toward the nearest road point)
  const near = (c) => { let best = [1e9]; for (const r of data.roads) for (const p of r.pts) { const d = Math.hypot(p[0] - c[0], p[1] - c[1]); if (d < best[0]) best = [d, p]; } return best[1]; };
  for (const [s, b] of signs) { const c = [s.position.x, s.position.z], p = near(c), dx = p[0] - c[0], dz = p[1] - c[1], L = Math.hypot(dx, dz) || 1; let r = 0; for (const q of b.pts) r = Math.max(r, ((q[0] - c[0]) * dx + (q[1] - c[1]) * dz) / L);
    s.position.set(c[0] + dx / L * (r + 3), Y, c[1] + dz / L * (r + 3)); s.rotation.y = Math.atan2(dx, dz); root.add(s); }
  // street trees: along residential streets every ~16 m both sides, kept clear of buildings and driveways' lots
  const spots = [], bc = data.buildings.map(b => b.pts.reduce((a, p) => [a[0] + p[0] / b.pts.length, a[1] + p[1] / b.pts.length], [0, 0]));
  const lotC = data.lots.map(l => l.c), free = (x, z) => bc.every(c => Math.hypot(c[0] - x, c[1] - z) > 11) && lotC.every(c => Math.hypot(c[0] - x, c[1] - z) > 17);
  for (const r of data.roads) { if (r.kind !== 'residential') continue; for (let i = 1; i < r.pts.length; i++) { const a = r.pts[i - 1], b = r.pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); for (let s = 8; s < L; s += 16) { const u = s / L, x = a[0] + (b[0] - a[0]) * u, z = a[1] + (b[1] - a[1]) * u, nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L; for (const sd of [-1, 1]) { const px = x + nx * sd * (r.w / 2 + 3.6), pz = z + nz * sd * (r.w / 2 + 3.6); if (free(px, pz)) spots.push([px, pz]); } } } }
  for (const a of data.areas) if (a.kind === 'park') { const c = a.pts.reduce((q, p) => [q[0] + p[0] / a.pts.length, q[1] + p[1] / a.pts.length], [0, 0]); for (let k = 0; k < 6; k++) spots.push([c[0] + (rnd(k + c[0]) - .5) * 30, c[1] + (rnd(k + c[1]) - .5) * 30]); }
  const kinds = [1, 2, 3].map(treeParts), leafM = leafMat(), barkM = barkMat(), IL = [], IT = [], m4 = new THREE.Matrix4();
  for (const k of kinds) { IL.push(new THREE.InstancedMesh(k.leaves, leafM, spots.length)); IT.push(new THREE.InstancedMesh(k.wood, barkM, spots.length)); }
  const cnt = [0, 0, 0];
  spots.forEach(([x, z], i) => { const v = i % 3, s = .85 + rnd(i) * .4; m4.compose(new THREE.Vector3(x, Y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd(i + 3) * 6.28), new THREE.Vector3(s, s, s)); IL[v].setMatrixAt(cnt[v], m4); IT[v].setMatrixAt(cnt[v], m4); cnt[v]++; });
  IL.forEach((m, v) => { m.count = cnt[v]; IT[v].count = cnt[v]; m.castShadow = IT[v].castShadow = true; m.receiveShadow = true; root.add(m, IT[v]); });
  // the hero houses on their real lots
  const lots = {}, houses = {};
  for (const l of data.lots) { const g = new THREE.Group(); g.position.set(l.c[0], 0, l.c[1]); g.rotation.y = l.yaw; root.add(g); const inner = new THREE.Group(); inner.position.set(-l.planCentre[0], 0, -l.planCentre[1]); g.add(inner);
    await houseShell(inner, l.house, { glass: !o.interiors }); if (o.interiors) { const H = await buildHouse(inner, l.house, { floors: ['ground', 'up'] }); houses[l.house] = H;
      if (o.furnish) { const { furnishHouse } = await import('../designs/furnish.js'); await furnishHouse(inner, H, o.furnish); } }   // o.furnish: room ids to dress (e.g. ['kitchen', 'his'])
    lots[l.house] = g; }
  return { root, data, lots, houses, trees: spots.length };
}
