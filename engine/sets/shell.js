// HOUSE SHELL (2026-11-18): the outside of a house, built from the SAME plan as the interiors (engine/designs/plans.js),
// so every window and door seen from the street is the one seen from inside. Siding / render skins on every exterior
// edge (openings punched where the plan has them), window trims + sills, foundation band, gable roof over the attic
// (it sits just above the attic's own roof boards), garage roof, porch, steps, path, driveway.
//   await houseShell(scene, 'A', { origin: [x, 0, z] })  -> { root }   (pair with buildHouse(...) for the interiors)
import * as THREE from 'three';
import { mat } from '../materials.js';
import { bbox, at } from '../build.js';
import { PLANS, FLOOR_H } from '../designs/plans.js';
import { SIZE } from './roomkit.js';

export const GRADE = -.45;
const EPS = 1e-3, SK = .12;
const LOOK = {
  warm: { skin: () => mat('siding', { color: '#f2efe8' }), trim: '#1f2326', roof: () => mat('shingles', { color: '#3f4247' }), fascia: '#f4f2ee', porchPost: '#1f2326' },
  soft: { skin: () => mat('stucco', { color: '#efe4d2', size: 1.8 }), trim: '#f4efe6', roof: () => mat('roofTiles', { size: 1.4 }), fascia: '#f4efe6', porchPost: '#d9c3a4' },
};
// exterior edge segments of one floor: every room edge not touching another room of that floor
function outerEdges(rooms) {
  const segs = [];
  for (const r of rooms) {
    const E = { n: ['x', r.z, r.x, r.x + r.w], s: ['x', r.z + r.d, r.x, r.x + r.w], w: ['z', r.x, r.z, r.z + r.d], e: ['z', r.x + r.w, r.z, r.z + r.d] };
    for (const [k, [ax, c, a, b]] of Object.entries(E)) {
      let free = [[a, b]];
      for (const q of rooms) { if (q === r) continue;
        const qE = ax === 'x' ? [[q.z, q.x, q.x + q.w], [q.z + q.d, q.x, q.x + q.w]] : [[q.x, q.z, q.z + q.d], [q.x + q.w, q.z, q.z + q.d]];
        for (const [qc, qa, qb] of qE) if (Math.abs(qc - c) < EPS) free = free.flatMap(([u, v]) => { const o = []; if (qa > u) o.push([u, Math.min(v, qa)]); if (qb < v) o.push([Math.max(u, qb), v]); return o.filter(([x, y]) => y - x > EPS); }); }
      for (const [u, v] of free) segs.push({ room: r, wall: k, ax, c, a: u, b: v });
    }
  }
  return segs;
}
function skinWall(g, s, y0, y1, ops, M, ext = [0, 0]) {
  // a skin piece along the segment, outside the plan edge, with holes for the openings (world coords along the segment)
  const out = { n: -1, s: 1, w: -1, e: 1 }[s.wall], a = s.a - ext[0], b = s.b + ext[1];
  const piece = (u0, u1, v0, v1) => { if (u1 - u0 < .005 || v1 - v0 < .005) return; const L = u1 - u0, H = v1 - v0, m = bbox(s.ax === 'x' ? L : SK, H, s.ax === 'x' ? SK : L, M.skin, .002, 1);
    m.position.set(s.ax === 'x' ? (u0 + u1) / 2 : s.c + out * SK / 2, (v0 + v1) / 2, s.ax === 'x' ? s.c + out * SK / 2 : (u0 + u1) / 2); g.add(m); };
  let u = a; const sorted = ops.filter(o => o.u1 > a && o.u0 < b).sort((p, q) => p.u0 - q.u0);
  for (const o of sorted) { piece(u, o.u0, y0, y1); piece(o.u0, o.u1, y0, Math.max(y0, o.v0)); piece(o.u0, o.u1, Math.min(y1, o.v1), y1); u = o.u1;
    // trim round the opening + a sill under windows
    const T = M.trimM, tw = .09, cx = (o.u0 + o.u1) / 2, ow = o.u1 - o.u0, oh = o.v1 - o.v0, pos = (along, y, dx, dy, dz) => { const m = bbox(s.ax === 'x' ? dx : dz, dy, s.ax === 'x' ? dz : dx, T, .01); m.position.set(s.ax === 'x' ? along : s.c + out * (SK + dz / 2 - .02), y, s.ax === 'x' ? s.c + out * (SK + dz / 2 - .02) : along); g.add(m); };
    pos(cx, o.v1 + tw / 2, ow + 2 * tw, tw, .05); pos(o.u0 - tw / 2, (o.v0 + o.v1) / 2, tw, oh, .05); pos(o.u1 + tw / 2, (o.v0 + o.v1) / 2, tw, oh, .05);
    if (o.type === 'window') pos(cx, o.v0 - .03, ow + 2 * tw + .06, .06, .12); }
  piece(u, b, y0, y1);
  // glass in the openings when the house is a shell only (no interiors behind it): dark reflective panes + a mullion
  if (M.glass) for (const o of sorted) { if (o.type === 'garage') continue; const ow = o.u1 - o.u0, oh = o.v1 - o.v0, cx = (o.u0 + o.u1) / 2, z = s.c + out * .03;
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(ow, oh), o.type === 'door' ? M.doorM : M.glass); gl.position.set(s.ax === 'x' ? cx : z, (o.v0 + o.v1) / 2, s.ax === 'x' ? z : cx); gl.rotation.y = s.ax === 'x' ? (out > 0 ? 0 : Math.PI) : (out > 0 ? Math.PI / 2 : -Math.PI / 2); g.add(gl);
    if (o.type === 'window') { const mu = bbox(s.ax === 'x' ? .05 : .04, oh, s.ax === 'x' ? .04 : .05, M.trimM, .005); mu.position.set(s.ax === 'x' ? cx : z + out * .02, (o.v0 + o.v1) / 2, s.ax === 'x' ? z + out * .02 : cx); g.add(mu); } }
}

export async function houseShell(scene, key, o = {}) {
  const P = PLANS[key], L = LOOK[P.style], g = new THREE.Group(); scene.add(g); if (o.origin) g.position.set(...o.origin);
  const M = { skin: L.skin(), trimM: new THREE.MeshPhysicalMaterial({ color: L.trim, roughness: .45, clearcoat: .2 }), fascia: new THREE.MeshPhysicalMaterial({ color: L.fascia, roughness: .5 }),
    glass: o.glass ? new THREE.MeshPhysicalMaterial({ color: '#7f97ab', roughness: .12, metalness: .1, clearcoat: 1, emissive: '#2a3a48', emissiveIntensity: .35 }) : null, doorM: new THREE.MeshPhysicalMaterial({ color: P.style === 'warm' ? '#1f2326' : '#7f9a7c', roughness: .45, clearcoat: .2 }),
    roof: L.roof(), found: mat('concrete', { color: '#b8b5ae', size: 2 }), pave: mat('pavement', {}), post: new THREE.MeshPhysicalMaterial({ color: L.porchPost, roughness: .5 }) };
  for (const fk of ['ground', 'up']) {
    const F = P.floors[fk], y = F.y, segs = outerEdges(F.rooms);
    for (const s of segs) {
      const ops = F.windows.filter(([id, w]) => id === s.room.id && w === s.wall).map(([, , c, op = {}]) => { const type = op.type || 'window', w = type === 'window' ? (op.w || 1.5) : type === 'garage' ? 5 : (op.w || SIZE.door[0]), h = type === 'window' ? (op.h || SIZE.window[1]) : type === 'garage' ? 3.2 : SIZE.door[1], v0 = y + (type === 'window' ? (op.sill ?? SIZE.sill) : 0);
        return { u0: c - w / 2, u1: c + w / 2, v0, v1: v0 + h, type }; });
      const top = fk === 'up' || s.room.type === 'garage' || !P.floors.up.rooms.some(r => s.ax === 'x' ? (r.x < s.b - EPS && r.x + r.w > s.a + EPS && Math.abs((s.wall === 'n' ? r.z : r.z + r.d) - s.c) < EPS) : (r.z < s.b - EPS && r.z + r.d > s.a + EPS && Math.abs((s.wall === 'w' ? r.x : r.x + r.w) - s.c) < EPS)) ? y + FLOOR_H : y + FLOOR_H;
      skinWall(g, s, fk === 'ground' ? -.15 : y, top, ops, M, [SK, SK]);
      if (fk === 'ground') skinWall(g, s, GRADE, -.15, [], { ...M, skin: M.found }, [SK, SK]);
    }
  }
  // main gable roof over the house footprint (ridge along x), just above the attic's own boards
  const W = 16, D = 11, y0 = FLOOR_H * 2, knee = .7, ridge = 3.7, over = .45, slope = (ridge - knee) / (D / 2), lift = .26;
  for (const sgn of [-1, 1]) {
    const run = D / 2 + over, len = Math.hypot(run, run * slope), ang = Math.atan(slope), r = bbox(W + 2 * over, .14, len, M.roof, .01);
    r.rotation.x = sgn * ang; r.position.set(W / 2, y0 + knee + lift + (ridge - knee) / 2 - over * slope / 2, D / 2 + sgn * (D / 4 + over / 2)); g.add(r);
    const fa = bbox(W + 2 * over + .04, .22, .05, M.fascia, .005); fa.position.set(W / 2, y0 + knee + lift - over * slope - .06, sgn < 0 ? -over : D + over); g.add(fa);
  }
  g.add(at(bbox(W + 2 * over, .12, .3, M.roof, .01), W / 2, y0 + ridge + lift + .06, D / 2));   // ridge cap
  // knee band + gable ends (with the round attic window)
  for (const z of [-SK / 2, D + SK / 2]) g.add(at(bbox(W + 2 * SK, knee + lift, SK, M.skin, .002), W / 2, y0 + (knee + lift) / 2, z));
  for (const x of [-SK / 2, W + SK / 2]) {
    const sh = new THREE.Shape(); sh.moveTo(-D / 2 - SK, 0); sh.lineTo(D / 2 + SK, 0); sh.lineTo(D / 2 + SK, knee + lift); sh.lineTo(0, ridge + lift); sh.lineTo(-D / 2 - SK, knee + lift); sh.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 1.9, .55, 0, Math.PI * 2, true); sh.holes.push(hole);
    const e = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: SK, bevelEnabled: false }), M.skin); e.rotation.y = Math.PI / 2; e.position.set(x - SK / 2, y0, D / 2); g.add(e);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.6, .07, 10, 40), M.trimM); ring.rotation.y = Math.PI / 2; ring.position.set(x < 0 ? -SK - .02 : W + SK + .02, y0 + 1.9, D / 2); g.add(ring);
  }
  // garage: single storey, its own gable roof (ridge along x), the garage door's driveway to the street
  const gar = P.floors.ground.rooms.find(r => r.type === 'garage');
  if (gar) { const gy = FLOOR_H, gr = 1.6, gs = gr / (gar.d / 2);
    for (const sgn of [-1, 1]) { const run = gar.d / 2 + over, len = Math.hypot(run, run * gs), r = bbox(gar.w + over + SK, .14, len, M.roof, .01); r.rotation.x = sgn * Math.atan(gs); r.position.set(gar.x + (gar.w + over) / 2, gy + .12 + gr / 2 - over * gs / 2, gar.z + gar.d / 2 + sgn * (gar.d / 4 + over / 2)); g.add(r); }
    const sh = new THREE.Shape(); sh.moveTo(-gar.d / 2 - SK, 0); sh.lineTo(gar.d / 2 + SK, 0); sh.lineTo(0, gr + .12); sh.closePath(); const e = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: SK, bevelEnabled: false }), M.skin); e.rotation.y = Math.PI / 2; e.position.set(gar.x + gar.w, gy, gar.z + gar.d / 2); g.add(e);
    g.add(at(bbox(5.6, .1, 9, M.pave, .01), gar.x + 3.5, GRADE + .05, -4.5)); }
  else g.add(at(bbox(3.4, .1, 9, M.pave, .01), W + 2.2, GRADE + .05, -4.5 + 5));   // House B: driveway beside the house
  // front porch + steps + path to the sidewalk
  const fd = P.floors.ground.windows.find(w => w[3]?.type === 'door' && w[1] === 'n'), fx = fd[2];
  for (let i = 0; i < 2; i++) g.add(at(bbox(2.6 - i * .2, .15, .4, M.found, .01), fx, GRADE + .075 + i * .15, -.4 - (1 - i) * .4 + .2));
  const pw = key === 'A' ? 2.6 : 6.5, px = key === 'A' ? fx : W - pw / 2 - .2;
  g.add(at(bbox(pw, .12, 1.8, M.fascia, .01), px, 3.2, -.9));   // porch roof slab
  for (const s of [-1, 1]) g.add(at(bbox(.14, 3.2 - GRADE, .14, M.post, .01), px + s * (pw / 2 - .1), (3.2 + GRADE) / 2, -1.7));
  if (key === 'B') g.add(at(bbox(.14, 3.2 - GRADE, .14, M.post, .01), px, (3.2 + GRADE) / 2, -1.7));
  g.add(at(bbox(1.3, .08, 7, M.pave, .01), fx, GRADE + .04, -1.0 - 3.5 - .2));
  g.traverse(m => { if (m.isMesh) { m.castShadow = !m.material.transparent; m.receiveShadow = true; } });
  return { root: g };
}
