// TOWN PROPS (reusable): suburban houses (siding, gable roofs, windows with shutters, porch, chimney, garage, fenced yard),
// apartment blocks (facade texture, parapet, roof units), cars, road + sidewalk materials, picket fence.
// Static parts are merged per material (mergeStatic) so a whole house is a handful of draw calls.
import * as THREE from 'three';
import { M, rb, add, rng } from '../util.js';
import { pbr, contactShadow } from '../pbr.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as N from './nature.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
// ---------- merge every plain mesh under root into one mesh per material (LODs, instanced and multi-material meshes are kept) ----------
export function mergeStatic(root) {
  root.updateMatrixWorld(true); const inv = root.matrixWorld.clone().invert(), groups = new Map(), drop = [];
  root.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || Array.isArray(o.material) || o.userData.keep) return;
    for (let p = o.parent; p && p !== root; p = p.parent) if (p.isLOD || p.userData.keep) return;
    let g = o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); if (g.index) g = g.toNonIndexed();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    if (!g.attributes.normal) g.computeVertexNormals();
    const key = o.material.uuid + (o.castShadow ? 's' : ''); if (!groups.has(key)) groups.set(key, { m: o.material, cast: o.castShadow, gs: [] });
    groups.get(key).gs.push(g); drop.push(o);
  });
  drop.forEach(o => o.parent.remove(o));
  for (const { m, cast, gs } of groups.values()) { const mesh = new THREE.Mesh(mergeGeometries(gs), m); mesh.castShadow = cast; mesh.receiveShadow = true; root.add(mesh); }
  return root;
}
// metre-scale UVs for a box geometry
export function boxUV(geo, w, h, d) {
  const uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]); }
  return geo;
}
const box = (w, h, d, mat, x, y, z, parent, uv = false) => add(uv ? boxUV(new THREE.BoxGeometry(w, h, d), w, h, d) : new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);

// ---------- canvas materials ----------
const cache = new Map(), once = (k, f) => cache.has(k) ? cache.get(k) : (cache.set(k, f()), cache.get(k));
function canvas(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; }
function tex(c, srgb = true, rep = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; }
// lap siding: 5 boards per metre, colour map (subtle grain) + normal map (each board tilts out, shadow line under it)
function sidingMaps() {
  return once('sidingMaps', () => {
    let s = 9; const R = () => (s = (s * 16807) % 2147483647) / 2147483647, B = 5, H = 512;
    const col = canvas(256, H, (x) => { x.fillStyle = '#f2f2f2'; x.fillRect(0, 0, 256, H); for (let b = 0; b < B; b++) { const y0 = b * H / B; const g = x.createLinearGradient(0, y0, 0, y0 + H / B); g.addColorStop(0, '#ffffff'); g.addColorStop(.9, '#e9e9e9'); g.addColorStop(1, '#bdbdbd'); x.fillStyle = g; x.fillRect(0, y0, 256, H / B); for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(0,0,0,${R() * .04})`; x.fillRect(R() * 256, y0 + R() * H / B, 20 + R() * 60, 1); } } });
    const nor = canvas(4, H, (x) => { const im = x.createImageData(4, H); for (let y = 0; y < H; y++) { const f = (y % (H / B)) / (H / B), ny = f > .93 ? -.75 : .12; const n = new THREE.Vector3(0, ny, 1).normalize(); for (let k = 0; k < 4; k++) { const i = (y * 4 + k) * 4; im.data[i] = (n.x * .5 + .5) * 255; im.data[i + 1] = (n.y * .5 + .5) * 255; im.data[i + 2] = (n.z * .5 + .5) * 255; im.data[i + 3] = 255; } } x.putImageData(im, 0, 0); });
    return { map: tex(col), normal: tex(nor, false) };
  });
}
export function siding(color) { return once('siding' + color, () => { const { map, normal } = sidingMaps(); return new THREE.MeshStandardMaterial({ color, map, normalMap: normal, normalScale: new THREE.Vector2(1, 1), roughness: .7 }); }); }
const roofMat = tint => once('roof' + tint, () => pbr('ph/clay_roof_tiles', { rep: [.5, .5], tint, normal: 1.3 }));
const paint = (c, r = .55) => M(c, { roughness: r });
const glassMat = () => once('glass', () => new THREE.MeshPhysicalMaterial({ color: 0x2a3d52, roughness: .06, metalness: .1, envMapIntensity: 1.5 }));
const brickMat = () => once('brick', () => pbr('ph/red_brick_03', { rep: [1, 1], normal: 1.2, tint: 0xf0e2d6 }));
const concrete = () => once('conc', () => pbr('ph/concrete_pavement_02', { rep: [1, 1], normal: 1, tint: 0xe6e2da }));
const smooth = () => once('smooth', () => pbr('ph/brushed_concrete', { rep: [1, 1], normal: .6, tint: 0xd9d6d0 }));
// garage door with horizontal panels
const garageMat = () => once('garage', () => new THREE.MeshStandardMaterial({ roughness: .5, map: tex(canvas(256, 256, x => { x.fillStyle = '#f4f4f2'; x.fillRect(0, 0, 256, 256); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { x.fillStyle = '#e1e1de'; x.fillRect(c * 64 + 6, r * 64 + 8, 52, 48); x.strokeStyle = '#c9c9c5'; x.lineWidth = 2; x.strokeRect(c * 64 + 6, r * 64 + 8, 52, 48); } x.fillStyle = '#b5b5b0'; for (let r = 1; r < 4; r++) x.fillRect(0, r * 64 - 1, 256, 2); }), true, false) }));
// white picket fence cut-out (posts + rails + pointed pickets), one tile = 2 m
const picketMat = () => once('picket', () => { const t = tex(canvas(256, 128, x => { x.fillStyle = '#f7f7f4'; x.fillRect(0, 70, 256, 10); x.fillRect(0, 30, 256, 10); for (let i = 0; i < 256; i += 21) { x.fillRect(i + 4, 14, 12, 114); x.beginPath(); x.moveTo(i + 4, 14); x.lineTo(i + 10, 2); x.lineTo(i + 16, 14); x.fill(); } })); t.wrapT = THREE.ClampToEdgeWrapping; const m = new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, side: THREE.DoubleSide, roughness: .6 }); m.userData.depth = new THREE.MeshDepthMaterial({ map: t, alphaTest: .5, depthPacking: THREE.RGBADepthPacking }); return m; });
export function picketFence(len, h = .95) {
  const m = picketMat(), t = m.map.clone(); t.repeat.set(len / 2, 1); t.needsUpdate = true; const mat = m.clone(); mat.map = t; mat.userData.depth = m.userData.depth;
  const p = new THREE.Mesh(new THREE.PlaneGeometry(len, h), mat); p.position.y = h / 2; p.castShadow = true; p.customDepthMaterial = new THREE.MeshDepthMaterial({ map: t, alphaTest: .5, depthPacking: THREE.RGBADepthPacking }); p.userData.keep = true; return p;
}

// ---------- house window: white frame, cross muntins, glass, sill, optional shutters ----------
function houseWindow(g, x, y, z, w, h, rotY, shutter) {
  const q = new THREE.Group(); q.position.set(x, y, z); q.rotation.y = rotY; g.add(q); const wh = paint(0xfbfbf8, .45), t = .09;
  box(w + t * 2, t, .1, wh, 0, h / 2 + t / 2, .03, q); box(w + t * 2, t, .1, wh, 0, -h / 2 - t / 2, .03, q); box(t, h, .1, wh, -w / 2 - t / 2, 0, .03, q); box(t, h, .1, wh, w / 2 + t / 2, 0, .03, q);
  box(w, .04, .05, wh, 0, 0, .03, q); box(.04, h, .05, wh, 0, 0, .03, q); box(w + .3, .06, .16, wh, 0, -h / 2 - .1, .07, q);
  add(new THREE.PlaneGeometry(w, h), glassMat(), 0, 0, .005, q, { shadow: false });
  if (shutter) for (const s of [-1, 1]) { box(w * .48, h + .1, .05, shutter, s * (w / 2 + t + w * .26), 0, .03, q); for (let k = 0; k < 6; k++) box(w * .4, .02, .02, shutter, s * (w / 2 + t + w * .26), -h / 2 + (k + .5) * h / 6, .065, q); }
}

// ---------- suburban house. Front faces +z. Returns a Group; footprint w x d centred on the origin, ground y = 0 ----------
const WALLS = [0xf3ead8, 0xdfe9df, 0xd9e6f2, 0xf2dccf, 0xffffff, 0xf5e6b8, 0xe4dbe9, 0xcfd8dc];
const SHUT = [0x2f4a6b, 0x3e5e3a, 0x6b2f2f, 0x333333, 0x5a6e80];
const ROOFS = [0xffffff, 0x8a8f99, 0x7a5a48, 0x9aa0aa];
const DOORS = [0xb33a3a, 0x2f4a6b, 0x2f5d3a, 0x2b2b2b, 0xc8913a, 0xffffff];
export function house({ seed = 1, w, d, floors, yard = 7, garage, tree = true } = {}) {
  const R = rng(seed * 101 + 13), pick = a => a[Math.floor(R() * a.length)], g = new THREE.Group();
  w = w ?? 8 + Math.floor(R() * 4); d = d ?? 7 + Math.floor(R() * 2); floors = floors ?? (R() < .55 ? 2 : 1); garage = garage ?? R() < .55;
  const H = floors * 2.8, wall = R() < .2 ? brickMat() : siding(pick(WALLS)), trim = paint(0xfbfbf8, .45), shutter = R() < .75 ? paint(pick(SHUT), .5) : null;
  box(w + .2, .45, d + .2, smooth(), 0, .225, 0, g);
  box(w, H, d, wall, 0, .45 + H / 2, 0, g, true);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(.14, H, .14, trim, sx * (w / 2), .45 + H / 2, sz * (d / 2), g);
  if (floors > 1) box(w + .06, .14, d + .06, trim, 0, .45 + 2.8, 0, g);
  // gable roof, ridge along x
  const top = .45 + H, rh = d * .36, ov = .45, slope = Math.atan2(rh, d / 2), sl = Math.hypot(d / 2 + ov, (d / 2 + ov) * Math.tan(slope)), rm = roofMat(pick(ROOFS));
  for (const s of [-1, 1]) { const r = box(w + ov * 2, .14, sl, rm, 0, 0, 0, g, true); r.rotation.x = s * slope; r.position.set(0, top + rh - Math.sin(slope) * sl / 2 + .07, s * Math.cos(slope) * sl / 2); }
  box(w + ov * 2 + .02, .12, .22, paint(0x6d6d6d, .7), 0, top + rh + .06, 0, g);
  const tri = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, rh)]);
  for (const s of [-1, 1]) { const ge = new THREE.ExtrudeGeometry(tri, { depth: .12, bevelEnabled: false }); ge.rotateY(Math.PI / 2); ge.translate(s > 0 ? w / 2 - .12 : -w / 2, top, 0); add(ge, wall, 0, 0, 0, g); }   // gable ends
  for (const s of [-1, 1]) { const f = box(.08, .2, sl, trim, 0, 0, 0, g); f.rotation.x = s * slope; f.position.set(-(w / 2 + ov), top + rh - Math.sin(slope) * sl / 2 - .02, s * Math.cos(slope) * sl / 2); const f2 = f.clone(); f2.position.x *= -1; g.add(f2); }
  if (R() < .8) { const cx = (R() < .5 ? -1 : 1) * w * .3; box(.7, rh + 1.4, .7, brickMat(), cx, top + rh * .55 + .4, -d * .15, g, true); box(.82, .12, .82, paint(0x8a8a8a, .7), cx, top + rh * 1.05 + 1.12, -d * .15, g); }
  // front: door + porch at one third, windows elsewhere on every floor; side and back windows too
  const doorX = (R() < .5 ? -1 : 1) * w * .18, fz = d / 2 + .02;
  const door = paint(pick(DOORS), .4); box(1.05, 2.15, .08, trim, doorX, .45 + 1.1, fz, g); box(.9, 2.05, .06, door, doorX, .45 + 1.05, fz + .03, g);
  for (const yy of [.6, 1.5]) box(.6, .55, .02, door, doorX, .45 + yy, fz + .07, g);
  add(new THREE.SphereGeometry(.04, 8, 6), M(0xd4af37, { roughness: .3, metalness: .8 }), doorX + .32, .45 + 1.02, fz + .1, g);
  box(2.4, .2, 1.6, smooth(), doorX, .35, d / 2 + .8, g); box(1.4, .17, .35, smooth(), doorX, .12, d / 2 + 1.75, g);
  box(2.6, .12, 1.7, trim, doorX, .45 + 2.75, d / 2 + .85, g); for (const s of [-1, 1]) add(new THREE.CylinderGeometry(.07, .07, 2.3, 10), trim, doorX + s * 1.1, .45 + 1.6, d / 2 + 1.55, g);
  add(new THREE.BoxGeometry(.16, .24, .12), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xffe2a0, emissiveIntensity: .25 }), doorX + .7, .45 + 1.9, fz + .08, g);
  for (let f = 0; f < floors; f++) {
    const y = .45 + f * 2.8 + 1.55;
    for (const x of [-w * .36, -w * .12, w * .12, w * .36]) if (f > 0 || Math.abs(x - doorX) > 1.2) houseWindow(g, x, y, fz, 1.1, 1.35, 0, shutter);
    for (const z of [-d * .22, d * .22]) { houseWindow(g, w / 2 + .02, y, z, 1, 1.25, Math.PI / 2, null); houseWindow(g, -w / 2 - .02, y, z, 1, 1.25, -Math.PI / 2, null); }
    for (const x of [-w * .28, w * .28]) houseWindow(g, x, y, -d / 2 - .02, 1.1, 1.3, Math.PI, null);
  }
  if (garage) {   // attached garage on the side away from the door, driveway to the street
    const gx = (doorX > 0 ? -1 : 1) * (w / 2 + 2), gw = 4, gd = d * .85, gh = 2.7, gz = d / 2 - gd / 2;
    box(gw, gh, gd, wall, gx, gh / 2 + .1, gz, g, true); box(gw + .4, .2, gd + .4, trim, gx, gh + .2, gz, g);
    const rr = box(gw + .5, .12, gd + .5, rm, gx, gh + .35, gz, g, true); rr.rotation.z = (doorX > 0 ? 1 : -1) * .05;
    const gd2 = add(new THREE.PlaneGeometry(3, 2.2), garageMat(), gx, 1.2, d / 2 + .02, g); gd2.receiveShadow = true; box(3.2, .1, .08, trim, gx, 2.35, d / 2 + .03, g);
    box(3.4, .06, yard + .6, concrete(), gx, .03, d / 2 + yard / 2 + .3, g, true);
  }
  // yard: walkway, picket fence along the front with a gap for the path and driveway, mailbox, bushes, a tree
  box(1.2, .05, yard - 1.4, concrete(), doorX, .025, d / 2 + 1.9 + (yard - 1.9) / 2 - .3, g, true);
  const fz2 = d / 2 + yard, half = w / 2 + (garage ? 4.2 : 1.5) + 1, gapA = [doorX - .8, doorX + .8], gapB = garage ? [(doorX > 0 ? -1 : 1) * (w / 2 + 2) - 1.9, (doorX > 0 ? -1 : 1) * (w / 2 + 2) + 1.9] : null;
  const cuts = [-half, ...[gapA, gapB].filter(Boolean).sort((a, b) => a[0] - b[0]).flat(), half];
  for (let i = 0; i < cuts.length; i += 2) { const a = cuts[i], b = cuts[i + 1]; if (b - a > .4) { const f = picketFence(b - a); f.position.set((a + b) / 2, 0, fz2); g.add(f); } }
  { const mb = new THREE.Group(); mb.position.set(doorX + 1.3, 0, fz2 - .3); g.add(mb); box(.08, 1.05, .08, paint(0x5a4632, .8), 0, .52, 0, mb); box(.22, .24, .46, paint(pick([0x2b2b2b, 0x2f4a6b, 0xb33a3a]), .4), 0, 1.15, 0, mb); }
  for (const s of [-1, 1]) { const b = N.bush({ w: 1.1, h: .75, seed: seed * 7 + s, kind: R() < .3 ? 'flower' : 'round' }); b.position.set(doorX + s * 1.9, 0, d / 2 + .7); g.add(b); }
  if (R() < .5) { const b = N.hedge({ len: Math.max(2, w * .35), h: .7, d: .6, seed }); b.position.set(-doorX * 1.4, 0, d / 2 + .6); g.add(b); }
  if (tree) { const t = N.tree({ type: pick(['oak', 'maple', 'birch', 'sapling', 'maple']), h: 5 + R() * 3, seed: seed * 3 + 1 }); t.position.set((doorX > 0 ? -1 : 1) * w * .32, 0, d / 2 + yard * .55); g.add(t); }
  g.add(contactShadow(w + 1.5, d + 1.5, { opacity: .25 }));
  mergeStatic(g); g.userData.size = { w: w + (garage ? 8.4 : 0), d: d + yard }; g.userData.front = d / 2 + yard; return g;
}

// ---------- apartment block with a painted facade (one 3 x 3 m bay per tile) ----------
const FAC = [['#e8dccb', '#c8b8a2'], ['#d9e1e8', '#b5c2cc'], ['#f0e6d2', '#d4c3a3'], ['#e2d4d0', '#c4ada6'], ['#dfe6da', '#bcc8b4']];
function facadeMat(i) {
  return once('fac' + i, () => {
    const [wall, band] = FAC[i % FAC.length]; let s = 11 + i; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const c = canvas(256, 256, x => {
      x.fillStyle = wall; x.fillRect(0, 0, 256, 256); for (let k = 0; k < 300; k++) { x.fillStyle = `rgba(0,0,0,${R() * .03})`; x.fillRect(R() * 256, R() * 256, 3, 3); }
      x.fillStyle = band; x.fillRect(0, 236, 256, 20);
      x.fillStyle = '#f8f8f6'; x.fillRect(58, 58, 140, 146);
      const g = x.createLinearGradient(0, 64, 0, 196); g.addColorStop(0, '#5e7c99'); g.addColorStop(.5, '#2c3e52'); g.addColorStop(1, '#3d546b'); x.fillStyle = g; x.fillRect(66, 66, 124, 130);
      x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.moveTo(66, 66); x.lineTo(120, 66); x.lineTo(66, 140); x.fill();
      if (R() < .7) { x.fillStyle = ['#e8d9b5', '#c9d8e8', '#e8c4b5', '#f2efe6'][Math.floor(R() * 4)]; x.fillRect(66, 66, 28, 130); x.fillRect(162, 66, 28, 130); }
      x.fillStyle = '#f8f8f6'; x.fillRect(126, 66, 4, 130); x.fillRect(50, 200, 156, 8);
      x.fillStyle = '#6b737b'; x.fillRect(46, 160, 164, 5); for (let k = 0; k < 15; k++) x.fillRect(48 + k * 11, 160, 3, 44); x.fillRect(46, 202, 164, 4);   // balcony rail
    });
    const t = tex(c); t.repeat.set(1 / 3, 1 / 3); return new THREE.MeshStandardMaterial({ map: t, roughness: .8 });
  });
}
export function apartment({ seed = 1, w, d, floors } = {}) {
  const R = rng(seed * 59 + 5), g = new THREE.Group(); floors = floors ?? 4 + Math.floor(R() * 4); w = w ?? 18 + Math.floor(R() * 4) * 3; d = d ?? 12 + Math.floor(R() * 2) * 3;
  const H = floors * 3, fm = facadeMat(Math.floor(R() * 5));
  const body = box(w, H, d, fm, 0, H / 2, 0, g, true); body.material = fm;
  box(w + .4, .8, d + .4, paint(0xd0ccc4, .8), 0, H + .4, 0, g); box(w + .1, .4, d + .1, smooth(), 0, .2, 0, g);
  for (let i = 0; i < 3; i++) box(2 + R() * 2, 1.4, 1.6 + R(), M(0xcfd3d8, { roughness: .5, metalness: .3 }), (R() - .5) * w * .6, H + 1.1, (R() - .5) * d * .5, g);
  box(4, .2, 2.2, paint(0xf0f0ee, .5), 0, 3.2, d / 2 + 1.1, g); box(2.4, 2.6, .1, glassMat(), 0, 1.3, d / 2 + .02, g);
  mergeStatic(g); g.userData.size = { w, d }; return g;
}

// ---------- car ----------
const CARS = [0xc0392b, 0x2e86de, 0xf5f6fa, 0x2d3436, 0x95a5a6, 0x27ae60, 0xf39c12, 0x34495e, 0x8e44ad];
export function car({ seed = 1, color } = {}) {
  const R = rng(seed * 37 + 1), g = new THREE.Group(), body = M(color ?? CARS[Math.floor(R() * CARS.length)], { roughness: .25, metalness: .45, unique: false, physical: true, clearcoat: 1 });
  const glass = glassMat(), dark = paint(0x1d1f22, .6), chrome = M(0xd9dde2, { roughness: .2, metalness: .9 });
  rb(4.2, .62, 1.8, body, 0, .6, 0, g, .18); rb(2.3, .58, 1.62, glass, -.2, 1.18, 0, g, .16); rb(2.0, .07, 1.5, body, -.25, 1.48, 0, g, .03);
  for (const s of [-1, 1]) { rb(.08, .56, .08, body, .9, 1.17, s * .74, g, .02); rb(.08, .56, .08, body, -1.3, 1.17, s * .74, g, .02); }
  for (const x of [-1.35, 1.35]) for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(.36, .36, .26, 20), dark, x, .36, s * .8, g); w.rotation.x = Math.PI / 2; const h = add(new THREE.CylinderGeometry(.2, .2, .27, 12), chrome, x, .36, s * .8, g); h.rotation.x = Math.PI / 2; }
  for (const s of [-1, 1]) { rb(.06, .14, .36, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6d8, emissiveIntensity: .3 }), 2.1, .72, s * .6, g, .03); rb(.06, .14, .34, new THREE.MeshStandardMaterial({ color: 0xc0392b, emissive: 0x801010, emissiveIntensity: .3 }), -2.1, .72, s * .6, g, .03); rb(.16, .12, .22, body, .75, 1.0, s * .95, g, .03); }
  rb(.12, .22, 1.7, dark, 2.12, .4, 0, g, .05); rb(.12, .22, 1.7, dark, -2.12, .4, 0, g, .05); rb(.04, .14, .5, paint(0xf2f2f2, .4), -2.16, .5, 0, g, .01);
  g.add(contactShadow(4.6, 2.2, { opacity: .45 })); mergeStatic(g); return g;
}

// ---------- road surface: asphalt with white edge lines and a dashed centre line; u across (7 m), v along (one tile = 6 m) ----------
export function roadMat(len) {
  const base = once('road', () => { let s = 21; const R = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return canvas(512, 512, x => { x.fillStyle = '#55585c'; x.fillRect(0, 0, 512, 512); for (let i = 0; i < 9000; i++) { const v = 60 + R() * 60; x.fillStyle = `rgba(${v},${v},${v + 4},.5)`; x.fillRect(R() * 512, R() * 512, 2, 2); } for (let i = 0; i < 12; i++) { x.fillStyle = 'rgba(30,30,32,.07)'; x.beginPath(); x.ellipse(R() * 512, R() * 512, 30 + R() * 60, 20 + R() * 30, R() * 3, 0, 7); x.fill(); }
      x.fillStyle = '#ecebe6'; x.fillRect(14, 0, 8, 512); x.fillRect(490, 0, 8, 512); x.fillRect(252, 0, 8, 256); }); });
  const t = tex(base); t.repeat.set(1, len / 6); return new THREE.MeshStandardMaterial({ map: t, roughness: .92 });
}
export const plainAsphalt = () => once('asph', () => { const t = tex(canvas(256, 256, x => { let s = 5; const R = () => (s = (s * 16807) % 2147483647) / 2147483647; x.fillStyle = '#55585c'; x.fillRect(0, 0, 256, 256); for (let i = 0; i < 3000; i++) { const v = 60 + R() * 60; x.fillStyle = `rgba(${v},${v},${v + 4},.5)`; x.fillRect(R() * 256, R() * 256, 2, 2); } })); t.repeat.set(2, 2); return new THREE.MeshStandardMaterial({ map: t, roughness: .92 }); });
export const sidewalkMat = (w, l) => { const m = pbr('ph/concrete_pavement_02', { rep: [w / 1.5, l / 1.5], normal: 1, tint: 0xe6e2da }); return m; };
export const curbMat = () => once('curb', () => pbr('ph/brushed_concrete', { rep: [4, .3], normal: .6, tint: 0xd9d6d0 }));
