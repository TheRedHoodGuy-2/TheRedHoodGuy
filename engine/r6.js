// R6 character v2 (2026-11-16). Built natively: six beveled blocks + a lathe head, exact Roblox proportions, in studs.
// Inside `rbx` everything is in ROBLOX space (character faces -Z, its right is +X), so catalog accessories and
// attachment points drop in unchanged. `root` is in metres, feet on y = 0, facing +Z.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { face as drawFace } from './faces.js';

export const STUD = 0.34;                       // 5 studs tall = 1.7 m
export const HEAD_R = 0.6, HEAD_H = 1.2;        // measured from the male model Xavier supplied (explainer-kit 6910cb06): 1.2 wide, 1.2 tall
const url = p => new URL(p, document.baseURI).href;

// atlas layout (2048 x 2048), [x, y, w, h] per part face. Same layout as the mains' painted textures.
export const ATLAS = 2048;
const strip = (x, y, w, d, h) => ({ right: [x, y + d, d, h], front: [x + d, y + d, w, h], top: [x + d, y, w, d], bottom: [x + d, y + d + h, w, d], left: [x + d + w, y + d, d, h], back: [x + d + w + d, y + d, w, h] });
export const LAYOUT = { torso: strip(24, 60, 320, 160, 320), armR: strip(24, 740, 160, 160, 320), armL: strip(700, 740, 160, 160, 320), legR: strip(24, 1400, 160, 160, 320), legL: strip(700, 1400, 160, 160, 320) };
// Roblox classic template (585 x 559) rects, by the character's own left / right
export const TEMPLATE = {
  torso: { front: [231, 74, 128, 128], back: [427, 74, 128, 128], right: [165, 74, 64, 128], left: [361, 74, 64, 128], top: [231, 8, 128, 64], bottom: [231, 204, 128, 64] },
  armR: { left: [19, 355, 64, 128], back: [85, 355, 64, 128], right: [151, 355, 64, 128], front: [217, 355, 64, 128], top: [217, 289, 64, 64], bottom: [217, 485, 64, 64] },
  armL: { front: [308, 355, 64, 128], left: [374, 355, 64, 128], back: [440, 355, 64, 128], right: [506, 355, 64, 128], top: [308, 289, 64, 64], bottom: [308, 485, 64, 64] },
};
TEMPLATE.legR = TEMPLATE.armR; TEMPLATE.legL = TEMPLATE.armL;

// Roblox attachment points, relative to the part centre (studs)
export const ATTACH = {
  head: { HairAttachment: [0, .6, 0], HatAttachment: [0, .6, 0], FaceFrontAttachment: [0, 0, -.6], FaceCenterAttachment: [0, 0, 0] },
  torso: { NeckAttachment: [0, 1, 0], BodyFrontAttachment: [0, 0, -.5], BodyBackAttachment: [0, 0, .5], LeftCollarAttachment: [-1, 1, 0], RightCollarAttachment: [1, 1, 0], WaistFrontAttachment: [0, -1, -.5], WaistCenterAttachment: [0, -1, 0], WaistBackAttachment: [0, -1, .5] },
  armL: { LeftShoulderAttachment: [0, 1, 0], LeftGripAttachment: [0, -1, 0] }, armR: { RightShoulderAttachment: [0, 1, 0], RightGripAttachment: [0, -1, 0] },
  legL: { LeftFootAttachment: [0, -1, 0] }, legR: { RightFootAttachment: [0, -1, 0] },
};

// fine plastic grain shared by every character (tiling normal map made once)
let GRAIN = null;
function grain() {
  if (GRAIN) return GRAIN;
  const n = 256, c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d'), h = new Float32Array(n * n);
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n * n; i++) h[i] = rnd();
  const b = new Float32Array(n * n);   // one soft blur so the grain reads as moulded plastic, not sand
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { let a = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) a += h[((y + dy + n) % n) * n + (x + dx + n) % n]; b[y * n + x] = a / 9; }
  const d = g.createImageData(n, n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = b[y * n + (x + 1) % n] - b[y * n + (x - 1 + n) % n], dy = b[((y + 1) % n) * n + x] - b[((y - 1 + n) % n) * n + x], i = (y * n + x) * 4;
    d.data[i] = 128 + dx * 420; d.data[i + 1] = 128 + dy * 420; d.data[i + 2] = 255; d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0); GRAIN = new THREE.CanvasTexture(c); GRAIN.wrapS = GRAIN.wrapT = THREE.RepeatWrapping; GRAIN.colorSpace = THREE.NoColorSpace; return GRAIN;
}

const FACE_OF_GROUP = ['right', 'left', 'top', 'bottom', 'back', 'front'];   // BoxGeometry groups: +x -x +y -y +z -z, in Roblox space
// a rounded box with rows of vertices down the flat sides too (RoundedBoxGeometry has none there, so it cannot be bent)
function gridRoundedBox(w, h, d, r, rows) {
  const k = 4, n = 2 * k + 1, ny = 2 * k + rows, g = new THREE.BoxGeometry(1, 1, 1, n, ny, n), P = g.attributes.position;
  const map = (t, half, cnt) => {   // grid index -> position: k rows inside each bevel band, the rest spread over the flat
    const i = Math.round((t + .5) * cnt), j = Math.min(i, cnt - i), side = i * 2 < cnt ? -1 : 1;
    if (j <= k) return side * (half - r + r * (k - j) / k);
    return -(half - r) + (i - k) / (cnt - 2 * k) * 2 * (half - r);
  };
  // UVs must follow the real positions (the box spaces them by grid index, which squashed the flat middle into 1/9 of the texture)
  const UV = g.attributes.uv, AX = [[2, 1], [2, 1], [0, 2], [0, 2], [0, 1], [0, 1]], dims = [w, h, d];
  g.groups.forEach((gr, gi) => { for (let q = gr.start; q < gr.start + gr.count; q++) {
    const i = g.index.getX(q), t = [P.getX(i), P.getY(i), P.getZ(i)], m = [map(t[0], w / 2, n), map(t[1], h / 2, ny), map(t[2], d / 2, n)];
    const fix = (val, a) => Math.abs(val - (t[a] + .5)) < 1e-5 ? m[a] / dims[a] + .5 : .5 - m[a] / dims[a];
    UV.setXY(i, fix(UV.getX(i), AX[gi][0]), fix(UV.getY(i), AX[gi][1]));
  } });
  for (let i = 0; i < P.count; i++) {
    const v = new THREE.Vector3(map(P.getX(i), w / 2, n), map(P.getY(i), h / 2, ny), map(P.getZ(i), d / 2, n));
    const inner = new THREE.Vector3(THREE.MathUtils.clamp(v.x, -w / 2 + r, w / 2 - r), THREE.MathUtils.clamp(v.y, -h / 2 + r, h / 2 - r), THREE.MathUtils.clamp(v.z, -d / 2 + r, d / 2 - r));
    const dir = v.clone().sub(inner); if (dir.lengthSq() > 1e-12) v.copy(inner.add(dir.normalize().multiplyScalar(r)));
    P.setXYZ(i, v.x, v.y, v.z);
  }
  return g;
}
// smooth normals across the duplicated face-border vertices (same position = same normal), so bevels have no crease
function smoothNormals(g) {
  g.computeVertexNormals(); const P = g.attributes.position, N = g.attributes.normal, acc = new Map(), key = i => `${P.getX(i).toFixed(4)},${P.getY(i).toFixed(4)},${P.getZ(i).toFixed(4)}`;
  for (let i = 0; i < P.count; i++) { const kk = key(i), a = acc.get(kk) || [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); acc.set(kk, a); }
  for (let i = 0; i < P.count; i++) { const a = acc.get(key(i)), l = Math.hypot(...a) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  return g;
}
function block(part, w, h, d, bevel, rows = 0) {
  const geo = rows ? gridRoundedBox(w, h, d, bevel, rows) : new RoundedBoxGeometry(w, h, d, 4, bevel), uv = geo.attributes.uv, idx = geo.index, seen = new Set();
  geo.groups.forEach((gr, gi) => {
    const f = FACE_OF_GROUP[gi], [x, y, rw, rh] = LAYOUT[part][f], flip = f === 'top' || f === 'bottom';
    for (let k = gr.start; k < gr.start + gr.count; k++) {
      const v = idx ? idx.getX(k) : k; if (seen.has(v)) continue; seen.add(v);
      let u = uv.getX(v), t = uv.getY(v); if (flip) { u = 1 - u; t = 1 - t; }
      uv.setXY(v, (x + u * rw) / ATLAS, 1 - (y + (1 - t) * rh) / ATLAS);
    }
  });
  geo.clearGroups(); return geo;
}
// female torso: the supplied female model (explainer-kit df1cc521), measured 2026-11-17. Full 2 x 1 at the hips (bottom .064)
// and from .492 above the middle to the top; pinched to a waist .754 up from the bottom: 70% as wide, 68% as deep.
function femaleTorso(g) {
  const P = g.attributes.position, f = y => y <= -.936 ? 1 : y <= -.246 ? 1 - .3 * (y + .936) / .69 : y <= .492 ? .7 + .3 * (y + .246) / .738 : 1;
  const fz = y => 1 - (1 - f(y)) * 32 / 30;   // depth pinches to .68 when width is at .70
  for (let i = 0; i < P.count; i++) { const y = P.getY(i); P.setX(i, P.getX(i) * f(y)); P.setZ(i, P.getZ(i) * fz(y)); }
  return smoothNormals(g);
}
// 3D clothing made for R6 sits on the body's surface; any of its vertices that end up inside the torso, an arm or a leg
// (stud boxes in torso space) are pushed out to just over the nearest face, so the body never shows through.
const BODY_BOXES = [[[-1, -1, -.5], [1, 1, .5]], [[1, -1, -.5], [2, 1, .5]], [[-2, -1, -.5], [-1, 1, .5]], [[0, -3, -.5], [1, -1, .5]], [[-1, -3, -.5], [0, -1, .5]]];
function pushOut(handle, torso) {
  handle.updateMatrixWorld(true); torso.updateMatrixWorld(true); const v = new THREE.Vector3(), m = new THREE.Matrix4(), mi = new THREE.Matrix4(), PAD = .025;
  handle.traverse(o => { if (!o.isMesh) return;
    m.copy(torso.matrixWorld).invert().multiply(o.matrixWorld); mi.copy(m).invert(); const P = o.geometry.attributes.position; let moved = 0;
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(m);
      for (const [lo, hi] of BODY_BOXES) { if (v.x <= lo[0] - PAD || v.x >= hi[0] + PAD || v.y <= lo[1] - PAD || v.y >= hi[1] + PAD || v.z <= lo[2] - PAD || v.z >= hi[2] + PAD) continue;
        const d = [[v.x - lo[0] + PAD, 0, -1], [hi[0] + PAD - v.x, 0, 1], [v.y - lo[1] + PAD, 1, -1], [hi[1] + PAD - v.y, 1, 1], [v.z - lo[2] + PAD, 2, -1], [hi[2] + PAD - v.z, 2, 1]];
        if (lo[0] === -1 && hi[0] === 1) d.splice(2, 2);   // the torso's top and bottom are covered by the head and legs: never push up or down out of it
        const [, ax, sg] = d.reduce((a, b) => b[0] < a[0] ? b : a); v.setComponent(ax, sg < 0 ? lo[ax] - PAD : hi[ax] + PAD); moved++; }
      v.applyMatrix4(mi); P.setXYZ(i, v.x, v.y, v.z); }
    if (moved) { P.needsUpdate = true; o.geometry.computeVertexNormals(); o.geometry.computeBoundingBox(); o.geometry.computeBoundingSphere(); } });
}
// 3D clothing is one rigid mesh; split its triangles by where they sit (torso space, studs) and hand each piece to the
// body part under it, so sleeves follow the arms and trouser legs follow the legs when the character is posed.
function rigToLimbs(handle, parts, top = true) {
  handle.updateMatrixWorld(true); const torso = parts.torso, m = new THREE.Matrix4(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const meshes = []; handle.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) {
    m.copy(torso.matrixWorld).invert().multiply(o.matrixWorld); const g = o.geometry, P = g.attributes.position;
    const idx = g.index ? g.index.array : Array.from({ length: P.count }, (_, i) => i), buckets = { torso: [], armL: [], armR: [], legL: [], legR: [] };
    for (let t = 0; t < idx.length; t += 3) {
      a.fromBufferAttribute(P, idx[t]).applyMatrix4(m); b.fromBufferAttribute(P, idx[t + 1]).applyMatrix4(m); c.fromBufferAttribute(P, idx[t + 2]).applyMatrix4(m);
      const x = (a.x + b.x + c.x) / 3, y = (a.y + b.y + c.y) / 3;
      const k = y < -1.02 ? (top ? 'torso' : x >= 0 ? 'legR' : 'legL') : x > 1.02 ? 'armR' : x < -1.02 ? 'armL' : 'torso';   // a top's hem below the waist stays on the torso (it must not tear off with the legs)
      buckets[k].push(idx[t], idx[t + 1], idx[t + 2]);
    }
    for (const [k, list] of Object.entries(buckets)) {
      if (!list.length || k === 'torso') continue;
      const gg = new THREE.BufferGeometry(); for (const [n, at] of Object.entries(g.attributes)) gg.setAttribute(n, at.clone()); gg.setIndex(list);
      const piece = new THREE.Mesh(gg, o.material); piece.castShadow = piece.receiveShadow = true; o.parent.add(piece); piece.matrix.copy(o.matrix); piece.matrix.decompose(piece.position, piece.quaternion, piece.scale);
      parts[k].attach(piece);
      if (k.startsWith('arm')) snapSleeve(piece);
    }
    g.setIndex(buckets.torso);
  }
}
// SLEEVE SNAP (2026-11-18): a sleeve rides exactly on its arm block. Centre the sleeve on the arm (x / z) when it was
// modelled off-centre, then push any sleeve vertex that sits inside the arm out to just over the arm's surface.
function snapSleeve(piece) {
  piece.updateMatrix(); const m = piece.matrix.clone(), mi = m.clone().invert(), P = piece.geometry.attributes.position, v = new THREE.Vector3(), b = new THREE.Box3();
  for (let i = 0; i < P.count; i++) b.expandByPoint(v.fromBufferAttribute(P, i).applyMatrix4(m));
  const sz = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
  if (sz.x < 1.7 && sz.z < 1.7) { const dx = Math.abs(c.x) < .35 ? -c.x : 0, dz = Math.abs(c.z) < .35 ? -c.z : 0; piece.position.x += dx; piece.position.z += dz; piece.updateMatrix(); m.copy(piece.matrix); mi.copy(m).invert(); }
  const PAD = .02; let moved = 0;
  for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(m);
    if (Math.abs(v.x) < .5 + PAD && Math.abs(v.z) < .5 + PAD && v.y > -1 && v.y < 1) {
      const dxp = .5 + PAD - Math.abs(v.x), dzp = .5 + PAD - Math.abs(v.z);
      if (dxp < dzp) v.x = Math.sign(v.x || 1) * (.5 + PAD); else v.z = Math.sign(v.z || 1) * (.5 + PAD);
      v.applyMatrix4(mi); P.setXYZ(i, v.x, v.y, v.z); moved++; } }
  if (moved) { P.needsUpdate = true; piece.geometry.computeVertexNormals(); piece.geometry.computeBoundingSphere(); }
}
function headGeo(fx = .3, fy = .3) {   // the supplied model's head, measured exactly: radius .6, height 1.2, a round .3 fillet top and bottom (flat cap radius .3)
  const pts = [], R = HEAD_R, H = HEAD_H / 2, n = 16;
  pts.push(new THREE.Vector2(0.0001, -H));
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(R - fx + Math.cos(a) * fx, -H + fy + Math.sin(a) * fy)); }
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI / 2; pts.push(new THREE.Vector2(R - fx + Math.cos(a) * fx, H - fy + Math.sin(a) * fy)); }
  pts.push(new THREE.Vector2(0.0001, H));
  const g = new THREE.LatheGeometry(pts, 40); g.computeVertexNormals();
  // v by distance along the profile (the lathe spaces v by point count, which stretched the grain down the straight side)
  const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + pts[i].distanceTo(pts[i - 1]));
  const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setY(k, len[k % pts.length] / len[len.length - 1]);
  return g;
}

const img = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('image ' + src)); i.src = url(src); });
const css = c => typeof c === 'string' ? c : '#' + new THREE.Color(c).getHexString();

// paint a Roblox classic template (image / canvas, 585 x 559 aspect) into the atlas for the given parts
export function blitTemplate(g, tpl, parts) {
  const k = tpl.width / 585;
  for (const p of parts) for (const f of Object.keys(LAYOUT[p])) {
    const [sx, sy, sw, sh] = TEMPLATE[p][f], [dx, dy, dw, dh] = LAYOUT[p][f];
    g.drawImage(tpl, sx * k, sy * k, sw * k, sh * k, dx, dy, dw, dh);
  }
}

// spec: { skin, sex, face, body (atlas image path, e.g. the mains), shirt, pants (template image paths or canvases),
//         paint(g, LAYOUT) (free painter on the atlas), hair: [assetId], accessories: [assetId], hairTint, bevel }
let FIT = null;
export async function makeR6(spec = {}) {
  let { skin = '#e6b48c', sex = 'm', bevel = .12, grain: gk = 2, shine = 1.2 } = spec;   // bevel .12 (C) and grain x2 (between B and C): Xavier's picks 2026-11-17; shine 1.2 (between B and C, nearer B)
  const root = new THREE.Group(), rbx = new THREE.Group(); root.add(rbx); rbx.scale.setScalar(STUD); rbx.rotation.y = Math.PI;
  // atlas
  const res = spec.res || ATLAS, c = document.createElement('canvas'); c.width = c.height = res; const g = c.getContext('2d'); g.scale(res / ATLAS, res / ATLAS);
  g.fillStyle = css(skin); g.fillRect(0, 0, ATLAS, ATLAS);
  if (spec.body) { g.drawImage(await img(spec.body), 0, 0, ATLAS, ATLAS); if (!spec.skin) { const d = g.getImageData(Math.floor(1900 * res / ATLAS), Math.floor(1900 * res / ATLAS), 1, 1).data; skin = `rgb(${d[0]},${d[1]},${d[2]})`; } }
  if (spec.pants) blitTemplate(g, typeof spec.pants === 'string' ? await img(spec.pants) : spec.pants, ['torso', 'legL', 'legR']);
  if (spec.shirt) blitTemplate(g, typeof spec.shirt === 'string' ? await img(spec.shirt) : spec.shirt, ['torso', 'armL', 'armR']);
  if (spec.tshirt) {   // classic T-shirt: a square decal on the torso front, over the shirt (Roblox draws it at the template's torso-front square)
    const t = typeof spec.tshirt === 'string' ? await img(spec.tshirt) : spec.tshirt, c = document.createElement('canvas'); c.width = 585; c.height = 559;
    c.getContext('2d').drawImage(t, 231, 74, 128, 128); blitTemplate(g, c, ['torso']);
  }
  if (spec.paint) spec.paint(g, LAYOUT);
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  const nrm = grain().clone(); nrm.needsUpdate = true; nrm.repeat.set(26, 26);
  const bodyMat = new THREE.MeshStandardMaterial({ map, roughness: Math.min(1, .62 / shine), metalness: 0, normalMap: nrm, normalScale: new THREE.Vector2(.22 * gk, .22 * gk) });
  const hn = grain().clone(); hn.needsUpdate = true; hn.repeat.set(10, 5);
  const skinMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(css(skin)), roughness: Math.min(1, .55 / shine), metalness: 0, normalMap: hn, normalScale: new THREE.Vector2(.2 * gk, .2 * gk) });
  const mesh = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; return m; };
  // joints (pivots) in Roblox space; each part mesh hangs off its joint
  const J = n => { const o = new THREE.Group(); o.name = n; return o; };
  const joints = { root: J('root'), neck: J('neck'), shoulderR: J('shoulderR'), shoulderL: J('shoulderL'), hipR: J('hipR'), hipL: J('hipL') };
  joints.root.position.set(0, 3, 0); rbx.add(joints.root);
  const parts = {};
  const tg = sex === 'f' ? femaleTorso(block('torso', 2, 2, 1, bevel, 20)) : block('torso', 2, 2, 1, bevel);
  parts.torso = mesh(tg, bodyMat); joints.root.add(parts.torso);
  const hang = (joint, pivot, part, key, w, off) => { joint.position.set(...pivot); joints.root.add(joint); parts[key] = mesh(block(part, w, 2, 1, bevel), bodyMat); parts[key].position.set(...off); joint.add(parts[key]); };
  hang(joints.shoulderR, [1, .5, 0], 'armR', 'armR', 1, [.5, -.5, 0]); hang(joints.shoulderL, [-1, .5, 0], 'armL', 'armL', 1, [-.5, -.5, 0]);
  hang(joints.hipR, [.5, -1, 0], 'legR', 'legR', 1, [0, -1, 0]); hang(joints.hipL, [-.5, -1, 0], 'legL', 'legL', 1, [0, -1, 0]);
  joints.neck.position.set(0, 1, 0); joints.root.add(joints.neck);
  parts.head = mesh(headGeo(), skinMat); parts.head.position.set(0, .5, 0); joints.neck.add(parts.head);
  // face: a curved patch just off the front of the head (front = -Z in Roblox space)
  const arc = 2.0, fh = 1.18, fg = new THREE.CylinderGeometry(HEAD_R + .006, HEAD_R + .006, fh, 24, 1, true, Math.PI - arc / 2, arc);
  const faceMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false });
  const facePatch = new THREE.Mesh(fg, faceMat); facePatch.renderOrder = 2; parts.head.add(facePatch);
  const api = { root, rbx, joints, parts, spec, bodyMat, skinMat, atlas: c, accessories: [] };
  api.setFace = (name = 'neutral') => { const t = drawFace(name, sex, 'ink'); t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; faceMat.map = t; faceMat.needsUpdate = true; api.faceName = name; };
  if (spec.face === false) facePatch.visible = false; else api.setFace(spec.face || 'neutral');   // face: false = bare head (faces are their own checklist item)
  // catalog accessories (converted by tools/roblox/fetch.py into assets/roblox/<id>/)
  // under a 3D top, the body blocks it covers are painted in the garment's main colour, so any sliver between the cloth
  // and the body reads as cloth, never as skin
  async function underlay(p, handle) {
    let col = null; handle.traverse(o => { if (!col && o.isMesh && o.material.map?.image) { const im = o.material.map.image, cc = document.createElement('canvas'); cc.width = cc.height = 32;
      const x = cc.getContext('2d'); x.drawImage(im, 0, 0, 32, 32); const d = x.getImageData(0, 0, 32, 32).data, px = [];
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) px.push([d[i], d[i + 1], d[i + 2]]);
      px.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2])); const m = px[Math.floor(px.length / 2)]; if (m) col = `rgb(${m[0]},${m[1]},${m[2]})`; } });
    if (!col) col = `rgb(${(p.color || [163, 162, 165]).join(',')})`;
    const t = document.createElement('canvas'); t.width = 585; t.height = 559; const tx = t.getContext('2d'); tx.fillStyle = col; tx.fillRect(0, 0, 585, 559);
    const bottom = (p.attachments || []).some(a => a.name.startsWith('Waist'));   // pants and skirts hang from the waist
    blitTemplate(g, t, bottom ? ['legL', 'legR'] : ['torso', 'armL', 'armR']); map.needsUpdate = true;
  }
  api.wear = async (id, { tint = null, part = null, dy = null } = {}) => {
    if (dy == null) { FIT ??= await fetch(url('library/fit.json')).then(r => r.ok ? r.json() : {}).catch(() => ({})); dy = FIT[id]?.dy || 0; }   // per-garment height fix found by tools/fitcheck.mjs
    const meta = await (await fetch(url(`assets/roblox/${id}/meta.json`))).json(); const out = [];
    for (const p of meta.parts) {
      const gltf = await new GLTFLoader().loadAsync(url(`assets/roblox/${id}/${p.file}`)); const handle = new THREE.Group(); handle.add(gltf.scene);
      gltf.scene.traverse(o => { if (o.isMesh && String(p.meshVersion || '').startsWith('7')) o.geometry.computeVertexNormals(); });   // v7 meshes come out with broken normals (rendered black)
      gltf.scene.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; const m = o.material; o.material = new THREE.MeshStandardMaterial({ map: m.map || null, color: tint ? new THREE.Color(tint) : (m.map ? 0xffffff : new THREE.Color(...(p.color || [163, 162, 165]).map(v => v / 255))), roughness: .7, metalness: 0, side: THREE.DoubleSide }); if (o.material.map) o.material.map.colorSpace = THREE.SRGBColorSpace; } });
      // line the handle's attachment up with the same-named attachment on the body
      let done = false;
      for (const a of p.attachments) for (const [pk, list] of Object.entries(ATTACH)) if (!done && list[a.name] && (!part || part === pk)) {
        const r = a.rot || [1, 0, 0, 0, 1, 0, 0, 0, 1], A = new THREE.Matrix4().set(r[0], r[1], r[2], a.pos[0], r[3], r[4], r[5], a.pos[1], r[6], r[7], r[8], a.pos[2], 0, 0, 0, 1);
        const B = new THREE.Matrix4().makeTranslation(...(p.layered && pk !== 'head' ? (a.name.startsWith('Waist') ? [0, -2 + dy, 0] : [0, dy, 0]) : list[a.name]))   /* 3D clothing is fitted by its cage, not its attachment: tops centre on the torso, bottoms on the legs */; if (p.layered && pk === 'head') B.multiply(new THREE.Matrix4().makeScale(1.2, 1.12, 1.2));   // layered hair is cut for the smaller new heads
        handle.applyMatrix4(B.multiply(A.invert())); parts[pk].add(handle); done = true;
        if (p.layered && pk === 'torso') { pushOut(handle, parts.torso); await underlay(p, handle); rigToLimbs(handle, parts, !a.name.startsWith('Waist')); }   // 3D clothing: nothing of the body may poke through it
      }
      if (!done) { handle.position.set(0, .6, 0); parts.head.add(handle); }
      out.push(handle); api.accessories.push({ id, handle, meta: p });
    }
    return out;
  };
  for (const h of spec.hair || []) await api.wear(h, { tint: spec.hairTint || null });
  for (const a of spec.accessories || []) await api.wear(a);
  return api;
}
