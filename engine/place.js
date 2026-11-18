// PLACEMENT HELPERS (2026-11-18): put things where they belong with one call, find where a body can sit / lie / put
// something down on a piece of furniture, and check that nobody goes through the furniture.
import * as THREE from 'three';
import { STUD } from './r6.js';

// placement box: OPAQUE meshes only (store models carry invisible / see-through parts, e.g. a toilet's water block, that
// pushed pieces off the wall into the middle of the room)
export const box = o => { o.updateMatrixWorld(true); const b = new THREE.Box3(), t = new THREE.Box3(); o.traverse(m => { if (m.isMesh && m.visible && !(m.material?.transparent && m.material.opacity < .9)) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); if (m.isInstancedMesh) return; t.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld); b.union(t); } }); return b.isEmpty() ? new THREE.Box3().setFromObject(o) : b; };
// on the floor at (x, z), turned by yaw (radians). The lowest point of the object touches y = 0.
export function onFloor(o, x = 0, z = 0, yaw = 0) { o.rotation.y = yaw; o.position.set(x, 0, z); const b = box(o); o.position.y -= b.min.y; o.position.x += x - (b.min.x + b.max.x) / 2; o.position.z += z - (b.min.z + b.max.z) / 2; return o; }
// against a wall of a room from engine/sets/roomkit.js: its BACK to the wall, its front (+z of the model) into the room.
// `along` = metres from the wall's middle (left to right seen from inside), gap = space to the wall.
export function againstWall(o, R, wall, along = 0, gap = .02) {
  const yaw = { n: 0, s: Math.PI, e: -Math.PI / 2, w: Math.PI / 2 }[wall];
  onFloor(o, 0, 0, yaw); const b = box(o), dx = (b.max.x - b.min.x) / 2, dz = (b.max.z - b.min.z) / 2;
  const P = { n: [along, -R.D / 2 + gap + dz], s: [-along, R.D / 2 - gap - dz], e: [R.W / 2 - gap - dx, along], w: [-R.W / 2 + gap + dx, -along] }[wall];
  return onFloor(o, P[0], P[1], yaw);
}
// on top of another object: (u, v) from -1..1 across its top, sitting on the real top surface under that spot
export function onTop(o, support, u = 0, v = 0, yaw = null) {
  const b = box(support), x = THREE.MathUtils.lerp(b.min.x, b.max.x, (u + 1) / 2), z = THREE.MathUtils.lerp(b.min.z, b.max.z, (v + 1) / 2);
  const y = topAt(support, x, z) ?? b.max.y; if (yaw != null) o.rotation.y = yaw; onFloor(o, x, z, o.rotation.y); o.position.y += y; return o;
}
const ray = new THREE.Raycaster();
function topAt(o, x, z) { ray.set(new THREE.Vector3(x, 50, z), new THREE.Vector3(0, -1, 0)); const h = ray.intersectObject(o, true).find(i => i.object.material && !i.object.material.transparent); return h ? h.point.y : null; }
// ANCHORS: read the furniture's shape from above (a grid of heights) and find
//   seat: the big flat level between 0.3 and 1.1 m with a taller part (the backrest) behind it -> where a body sits, facing away from the back
//   lie:  the big flat level of a bed -> mattress top, the head end at the taller side (headboard)
//   top:  the highest big flat level (table, desk, nightstand, counter) -> where things are put down
export function anchors(o, n = 24) {
  const b = box(o), H = [], P = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = THREE.MathUtils.lerp(b.min.x, b.max.x, (i + .5) / n), z = THREE.MathUtils.lerp(b.min.z, b.max.z, (j + .5) / n); const y = topAt(o, x, z); if (y != null) { H.push(y); P.push([x, z, y]); } }
  if (!H.length) return {};
  const levels = new Map(); for (const y of H) { const k = Math.round(y * 25) / 25; levels.set(k, (levels.get(k) || 0) + 1); }
  const flat = [...levels].filter(([, c]) => c >= H.length * .08).sort((a, b2) => b2[1] - a[1]);
  const out = {}, centre = lv => { const pts = P.filter(p => Math.abs(p[2] - lv) < .03); return new THREE.Vector3(pts.reduce((s, p) => s + p[0], 0) / pts.length, lv, pts.reduce((s, p) => s + p[1], 0) / pts.length); };
  const top = flat.reduce((a, l) => (l[0] > (a?.[0] ?? -1) ? l : a), null); if (top) out.top = centre(top[0]);
  const seatL = flat.find(([y]) => y > .3 && y < 1.1);
  if (seatL) {   // which way does it face? test the four sides of the object: the back is the side with the most tall
    // parts (backrest / headboard) and the front the side with the fewest (armrests sit on BOTH sides, so they cancel)
    const c = centre(seatL[0]), tall = P.filter(p => p[2] > seatL[0] + .25), q = new THREE.Quaternion(); o.getWorldQuaternion(q);
    let facing = new THREE.Vector3(0, 0, 1).applyQuaternion(q).setY(0).normalize(), best = -1e9;
    for (const ax of [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0]]) { const d = new THREE.Vector3(...ax).applyQuaternion(q).setY(0).normalize(), half = Math.max(b.max.x - b.min.x, b.max.z - b.min.z) / 2;
      let back = 0, front = 0; for (const p of tall) { const s = (p[0] - c.x) * d.x + (p[1] - c.z) * d.z; if (s < -half * .35) back++; else if (s > half * .35) front++; }
      if (back - front * 2 > best) { best = back - front * 2; facing = d; } }
    // sit in the middle of the seat between back and front
    out.seat = { p: c, facing }; out.lie = { p: c, head: facing.clone().negate() }; }
  return out;
}
// sit an R6 (engine/r6.js api) on a seat anchor: hips on the seat, legs out in front, facing the anchor's way
export function sitOn(a, seat, { lean = -.05, depth = .34 } = {}) {   // depth: hips this far behind the seat centre (back against the backrest)
  a.joints.root.rotation.x = lean; a.joints.root.position.set(0, 2 + Math.cos(lean), Math.sin(lean)); a.joints.hipL.rotation.x = a.joints.hipR.rotation.x = Math.PI / 2 - lean;
  const yaw = Math.atan2(seat.facing.x, seat.facing.z), s = a.root.scale.x;
  a.root.rotation.y = yaw; a.root.position.set(seat.p.x - seat.facing.x * depth, seat.p.y + (.5 - 2) * STUD * s, seat.p.z - seat.facing.z * depth); return a;
}
// CLIPPING CHECK: sample points over every body part's surface and count how many end up inside a piece of furniture
// (a point is inside when the first surface a ray from it meets faces AWAY from it: it is leaving a solid).
export function clipCheck(a, things, { step = .5 } = {}) {
  a.root.updateMatrixWorld(true); const res = {}, v = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), meshes = [];
  for (const t of things) t.traverse(m => { if (m.isMesh && !m.material.transparent) meshes.push(m); });
  const sides = meshes.map(m => m.material.side); meshes.forEach(m => m.material.side = THREE.DoubleSide);
  const dims = { torso: [2, 2, 1], head: [1.2, 1.2, 1.2], armL: [1, 2, 1], armR: [1, 2, 1], legL: [1, 2, 1], legR: [1, 2, 1] };
  for (const [k, [sx, sy, sz]] of Object.entries(dims)) { let inside = 0, total = 0; const p = a.parts[k];
    for (let x = -.5; x <= .5001; x += step / sx) for (let y = -.5; y <= .5001; y += step / sy) for (let z = -.5; z <= .5001; z += step / sz) {
      if (Math.abs(x) < .49 && Math.abs(y) < .49 && Math.abs(z) < .49) continue;   // surface points only
      v.set(x * sx * .96, y * sy * .96, z * sz * .96); p.localToWorld(v); total++;
      ray.set(v, up); const h = ray.intersectObjects(meshes, false)[0];
      if (h && h.face && h.face.normal.clone().transformDirection(h.object.matrixWorld).y > 0) inside++; }
    res[k] = +(inside / total).toFixed(3); }
  meshes.forEach((m, i) => m.material.side = sides[i]);
  res.worst = Math.max(...Object.values(res)); return res;
}

// UNCLIP: if an arm ends up inside furniture (an armrest, a table edge), try nearby natural arm positions and keep the
// one with the least clipping. Arms only; legs and torso come from the seat anchor.
export function unclip(a, things) {
  const tries = [[0, 0], [.35, 0], [.6, 0], [.9, 0], [.2, .18], [.35, .3], [0, .25], [.5, -.1], [.15, .45], [.6, .2], [.9, .15], [1.2, .1], [.3, -.15]];
  for (const [side, j] of [['armL', a.joints.shoulderL], ['armR', a.joints.shoulderR]]) {
    const base = j.rotation.clone(), sg = side === 'armL' ? -1 : 1; let best = null;
    for (const [rx, rz] of tries) { j.rotation.set(base.x + rx, base.y, base.z + sg * rz); const c = clipCheck(a, things)[side]; if (!best || c < best[0] - 1e-3) best = [c, rx, rz]; if (c === 0) break; }
    j.rotation.set(base.x + best[1], base.y, base.z + sg * best[2]);
  }
  return clipCheck(a, things);
}
// AUTO SIT: try how deep into the seat and how far back to lean, keep the one where the body clips least
// (torso and legs), then free the arms with unclip(). Returns the final clip report.
export function autoSit(a, seat, things) {
  let best = null;
  for (const depth of [0, .05, .1, .15, .2, .25, .3, .35, .4]) for (const lean of [-.05, .1, .22]) {
    sitOn(a, seat, { depth, lean }); const c = clipCheck(a, things), score = c.torso * 2 + c.legL + c.legR + depth * .02 - (depth > .1 ? .01 : 0);
    if (!best || score < best[0] - 1e-4) best = [score, depth, lean]; }
  sitOn(a, seat, { depth: best[1], lean: best[2] }); return { depth: best[1], lean: best[2], ...unclip(a, things) };
}
// turn a seat (chair, sofa) on the spot so it faces a point (people sit facing the table / the TV / each other)
export function faceTo(o, target) {
  const a = anchors(o); if (!a.seat) return o; const b = box(o), c = new THREE.Vector3((b.min.x + b.max.x) / 2, 0, (b.min.z + b.max.z) / 2);
  const want = Math.atan2(target.x - c.x, target.z - c.z), have = Math.atan2(a.seat.facing.x, a.seat.facing.z);
  return onFloor(o, c.x, c.z, o.rotation.y + want - have);
}
