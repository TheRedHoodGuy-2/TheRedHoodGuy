// R6 POSE SOLVER (2026-11-12, from Xavier's posing notes): build limb poses from WHERE THE HAND / FOOT GOES, not from
// joint angles. R6 limbs are single cuboids with no elbow / knee, so a Roblox animator fakes the bend:
//  - when the whole arm acts from the shoulder (reaching out, arm straight up) the top of the block stays at the shoulder;
//  - when the forearm is what acts (writing, chin on hand, scratching the head, clapping, arms crossed) the block slides
//    off the shoulder so its TOP sits where the elbow would be ("the shoulder becomes the elbow"), and the block runs
//    from that elbow point to the hand. Slight clipping into the torso is fine, a lot is not.
// Coordinates: the avatar frame (+x its left, +y up, +z forward), feet at the origin, i.e. the pose sheet's world frame
// when the avatar stands at 0 facing +z. Targets are given in that frame BEFORE the root moves; pass the pose's root so a
// lean / turn / drop is undone and the hand still lands on the target (the desk does not lean with him).
// Rig numbers (kit/roblox.js): H 1.7, U .34, arm 2U long x 1U wide, shoulder pivot (±.333, 1.19, 0) at the torso edge,
// the arm block's centre line is U/2 further out; hip pivot (±.167, .51, 0), leg 2U.
import * as THREE from 'three';
const U = .34, LEN = 2 * U;
const PIV = { armL: [.333, 1.19, 0], armR: [-.333, 1.19, 0], legL: [.167, .51, 0], legR: [-.167, .51, 0] };
// where the TOP centre of each block sits relative to its pivot, hanging straight down
const TOP = { armL: [U / 2, U / 2, 0], armR: [-U / 2, U / 2, 0], legL: [0, U / 2, 0], legR: [0, U / 2, 0] };
const v3 = a => new THREE.Vector3(...a);

// sheet/world point -> the avatar's root-local frame (inverse of root position + YXZ rotation)
export function toLocal(root = {}, w) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(root.rx || 0, root.ry || 0, root.rz || 0, 'YXZ'));
  return v3(w).sub(v3([root.x || 0, root.y || 0, root.z || 0])).applyQuaternion(q.invert());
}

// part = 'armL' | 'armR' | 'legL' | 'legR'; end = where the hand / foot goes.
// TWO WAYS, like a Roblox animator:
//  elbow = null  -> REACH: the whole limb swings from its socket and points at `end` (top stays in the shoulder / hip).
//                   Use it whenever the hand is below / out from the shoulder: writing, gripping a desk, reaching,
//                   arms out for balance, a wind-up. The hand may sink a little into what it touches: that's fine.
//  elbow = point -> FOREARM: the block's top is moved to that point (where the real elbow is: beside the ribs, ~.3 m
//                   under the shoulder) and the block runs from there toward `end`. Use it when the hand comes UP to the
//                   body or head: chin on hand, scratching the head, hand over the mouth, crossed arms, a fist pump.
// opts: { local: true } targets already in the root-local frame; { twist } radians about the limb axis; { lift } m to
// hunch the socket up (shrug) in REACH mode.
export function limbTo(part, root, end, elbow, opts = {}) {
  const L = p => opts.local ? v3(p) : toLocal(root, p), E = L(end);
  const socket = v3(PIV[part]).add(new THREE.Vector3(TOP[part][0], 0, 0));               // centre line of the limb at the pivot
  const from = elbow ? L(elbow) : socket, dir = E.clone().sub(from).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  if (opts.twist) q.premultiply(new THREE.Quaternion().setFromAxisAngle(dir, opts.twist));
  let o;
  if (elbow) o = from.clone().sub(v3(PIV[part])).sub(v3(TOP[part]).applyQuaternion(q));
  else {   // REACH: the hand LANDS on the target (Xavier 2026-11-12: a fist that overshoots goes through the console). A target
    // closer than the limb is long slides the block back into the socket; a farther one slides it out (stretch), capped
    const dist = E.distanceTo(socket), slideBy = Math.max(-.16, Math.min(.16, dist - (LEN - TOP[part][1] - U / 2 + U / 2)));
    o = dir.clone().multiplyScalar(slideBy).add(new THREE.Vector3(0, opts.lift || 0, 0));
  }
  if (q.w < 0) q.set(-q.x, -q.y, -q.z, -q.w);
  const ang = 2 * Math.acos(Math.min(1, q.w)), s = Math.sqrt(Math.max(1e-9, 1 - q.w * q.w));
  const r = ang < 1e-6 ? [0, 0, 0] : [q.x / s * ang, q.y / s * ang, q.z / s * ang];
  const rd = x => Math.round(x * 1000) / 1000;
  return { r: r.map(rd), o: [o.x, o.y, o.z].map(rd) };
}
// how far a limb's top slid off its socket (m): > ~.25 reads detached, check it in the sheet
export function slide(part, pose) { const o = pose[part]?.o || [0, 0, 0]; return Math.hypot(...o); }
