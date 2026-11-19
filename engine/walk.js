// WALK (2026-11-19, research/walk.md). A footprint-solved compass gait for the R6 rig: no foot ever slides.
// walkPlan({ path, t0, step, T, L }) -> { t0, t1, at(t) } where at(t) = { x, z, heading, pose } (pose in the avatar
// frame for engine/rig.js: limbs as { r, o }, root channels). Feet: one is PLANTED every step; the hip sits between
// footprint midpoints; the planted leg's angle follows from the hip; the hip height keeps the planted leg's lowest
// corner on the floor (heel at contact, toe at push-off). The swing leg slides up into the hip (reads as a knee lift).
import * as THREE from 'three';
const ss = u => u * u * (3 - 2 * u), clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// path = [[x, z], ...] polyline; returns length + point / heading at distance s
function polyline(path) {
  const seg = []; let tot = 0;
  for (let i = 1; i < path.length; i++) { const [ax, az] = path[i - 1], [bx, bz] = path[i], l = Math.hypot(bx - ax, bz - az); seg.push({ ax, az, bx, bz, l, s0: tot }); tot += l; }
  const at = s => { s = clamp(s, 0, tot); let g = seg[seg.length - 1]; for (const q of seg) if (s <= q.s0 + q.l) { g = q; break; }
    const k = g.l ? (s - g.s0) / g.l : 0; return { x: g.ax + (g.bx - g.ax) * k, z: g.az + (g.bz - g.az) * k, heading: Math.atan2(g.bx - g.ax, g.bz - g.az) }; };
  return { length: tot, at };
}

export function walkPlan({ path, t0 = 0, step = .6, T = .5, L = .68, footD = .34, lead = 'L', arm = .85, lag = 2 / 24, lift = .075, down = .03, style = {} }) {
  const P = polyline(path), D = P.length;
  // footprints along the path: P0 = P1 = 0 (feet together), interior evenly spaced, last two = D (feet together)
  const n = Math.max(2, Math.ceil(D / step) + 1), F = [0];
  for (let k = 1; k <= n; k++) F.push(D * (k - 1) / (n - 1));
  F.push(D);
  const mid = j => (F[j] + F[j + 1]) / 2, dur = n * T;
  const stanceSide = j => ((j % 2 === 1) === (lead === 'R')) ? 'L' : 'R';   // step 1 plants the non-leading foot
  // leg angles (forward = +) and swing slide at time t (seconds since t0), hip distance along the path, hip height
  function solve(tt) {
    if (tt <= 0) return { s: 0, h: L, phi: { L: 0, R: 0 }, slide: { L: 0, R: 0 }, side: stanceSide(1), u: 0, j: 0 };
    if (tt >= dur) return { s: D, h: L, phi: { L: 0, R: 0 }, slide: { L: 0, R: 0 }, side: stanceSide(n), u: 1, j: n + 1 };
    const j = Math.min(n, 1 + Math.floor(tt / T)), u = (tt - (j - 1) * T) / T;
    const e = (j === 1 || j === n) ? ss(u) : u;                      // start and stop ease from / to rest
    const s = mid(j - 1) + (mid(j) - mid(j - 1)) * e;               // hip between the footprint midpoints
    const st = stanceSide(j), sw = st === 'L' ? 'R' : 'L';
    const xs = clamp(F[j] - s, -L * .95, L * .95), ps = Math.asin(xs / L);
    const dip = down * Math.sin(Math.PI * clamp(u / .35, 0, 1)) * (j === 1 || j === n ? .4 : 1);   // DOWN just after contact
    const h = L * Math.cos(ps) + footD / 2 * Math.abs(Math.sin(ps)) - dip;    // planted corner stays on the floor
    const fw = F[j - 1] + (F[j + 1] - F[j - 1]) * ss(u);           // swing foot travels heel-to-heel, eased
    const xw = clamp(fw - s, -L * .95, L * .95), pw = Math.asin(xw / L);
    const want = lift * Math.sin(Math.PI * u) * (F[j + 1] > F[j - 1] + 1e-4 ? 1 : 0);   // clearance (none on the catch-up if no travel)
    const natural = h - L * Math.cos(pw) - footD / 2 * Math.abs(Math.sin(pw));     // where its lowest corner would be
    const slideW = Math.max(0, (want - natural) / Math.cos(pw));
    const slideS = dip / Math.cos(ps);                               // planted leg takes the dip (knee give)
    return { s, h, phi: { [st]: ps, [sw]: pw }, slide: { [st]: slideS, [sw]: slideW }, side: st, u, j };
  }
  // legs counter the body's sideways shift (rz) and twist (ry) so the planted foot stays exactly where it was put down
  const legPart = (phi, slide, dx, tw, lean) => ({ r: [-phi - lean, -tw, -dx / L], o: [0, slide * Math.cos(phi), -slide * Math.sin(phi)] });
  const at = t => {
    const tt = t - t0, q = solve(tt), qa = solve(tt - lag), p = P.at(q.s);
    const amp = q.j === 0 || q.j === n + 1 ? 0 : 1, sgn = q.side === 'L' ? 1 : -1;   // +x = the character's left
    const swingK = Math.sin(Math.PI * q.u) * amp * ((q.j === 1 || q.j === n) ? .5 : 1);
    const lean = (style.lean ?? .05) * clamp(Math.min(tt, dur - tt) / .3, 0, 1);
    // arms: opposite leg, a little late; back swing a touch bigger; slightly out from the body
    const aL = arm * qa.phi.R, aR = arm * qa.phi.L;
    const armPart = (a, out) => ({ r: [-a * (a < 0 ? 1.15 : 1), 0, out], o: [0, 0, 0] });
    const twist = (style.twist ?? .03) * (q.phi.L - q.phi.R) / .5, dx = sgn * .022 * swingK;   // shoulders turn with the forward arm
    const pose = {
      legL: legPart(q.phi.L, q.slide.L, dx, twist, lean), legR: legPart(q.phi.R, q.slide.R, dx, twist, lean),
      armL: armPart(aL, .06), armR: armPart(aR, -.06),
      head: [-twist * .8, -lean * .6 + .015 * Math.sin(2 * Math.PI * q.u), 0],   // eyes stay on the path
      // the lean pivots at the feet, so the root steps back by L sin(lean) to keep the hip over its spot
      root: { x: dx, y: q.h - L * Math.cos(lean), z: -L * Math.sin(lean), rx: lean, ry: twist, rz: -sgn * .028 * swingK },
    };
    return { x: p.x, z: p.z, heading: p.heading, pose, walking: tt > 0 && tt < dur, step: q.j, u: q.u, side: q.side, foot: F[q.j] };
  };
  return { t0, t1: t0 + dur, dur, length: D, steps: n, footprints: F, at };
}

// FOOT LOCK (the last 1 cm): after posing, measure the real planted leg mesh and nudge the root so its bottom-face
// centre stays exactly where it was put down and its lowest corner sits on the floor. The analytic gait above gets
// within ~1 cm; this removes the rest (body tilt / twist / lean pivots). memo = {} kept per actor across frames;
// call with frames in time order (render order). Returns the correction applied.
const _v = new THREE.Vector3();
export function legBottom(part) {
  part.updateMatrixWorld(true); const g = part.isMesh ? part : part.children.find(m => m.isMesh), a = g.geometry.attributes.position;
  let my = 1e9; for (let i = 0; i < a.count; i++) { _v.fromBufferAttribute(a, i).applyMatrix4(g.matrixWorld); if (_v.y < my) my = _v.y; }
  if (!g.geometry.boundingBox) g.geometry.computeBoundingBox(); const bb = g.geometry.boundingBox;
  const c = new THREE.Vector3((bb.min.x + bb.max.x) / 2, bb.min.y, (bb.min.z + bb.max.z) / 2).applyMatrix4(g.matrixWorld);
  return { y: my, x: c.x, z: c.z };
}
export function footLock(actor, s, floorY, memo) {
  if (!s.walking) { memo.key = null; return [0, 0, 0]; }
  const root = actor.root; root.updateMatrixWorld(true);
  const part = actor.rig.parts[s.side === 'L' ? 'legL' : 'legR'], b = legBottom(part), key = s.step + s.side;
  if (memo.key !== key) { memo.key = key; memo.x = b.x; memo.z = b.z; }   // first frame of this step: the foot lands here
  const d = [memo.x - b.x, floorY - b.y, memo.z - b.z]; root.position.x += d[0]; root.position.y += d[1]; root.position.z += d[2];
  return d;
}
