// POSE LIBRARY (R6, classic Roblox-animator style): rigid limbs swing freely and overlap the body, bodies drop onto
// props, nothing symmetrical, heads tilt. Directions are in the avatar's own frame: +x = its left, +y up, +z forward.
// A pose sets any of: armL armR legL legR (direction the limb points), head [yaw, pitch(+ = down), roll],
// root { y (drop), rx (lean fwd +), ry (turn), rz (tilt) }. Missing parts fall back to REST.
// New poses get approved at the pose gate, then live here.
// v2 (pose editor): any part may instead be { r: [x, y, z], p: [x, y, z], o: [x, y, z] }: r = rotation vector (axis * angle,
// radians, avatar frame) about the part's pivot, p = pivot shift (m), o = move the whole part off its pivot (m).
// Parts: armL armR legL legR head. partChannels() turns either form into 9 numbers [r, p, o] for blending.
import * as THREE from 'three';
export const REST = {
  armL: [.06, -1, .02], armR: [-.06, -1, .02], legL: [.03, -1, 0], legR: [-.03, -1, 0],
  head: [0, 0, 0], root: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
};
export const POSES = {
  stand:        {},
  relaxed:      { armL: [.12, -1, .05], armR: [-.1, -1, -.04], head: [.06, .02, .03], root: { rz: .015 } },
  // sitting on a chair / ledge (drop the root so the hips sit on the seat; legs forward)
  sit:          { legL: [.06, 0, 1], legR: [-.06, 0, 1], armL: [.1, -.7, .7], armR: [-.1, -.7, .7], root: { y: -.22 } },
  slumpSit:     { legL: [.2, -.25, 1], legR: [-.12, -.15, 1], armL: [-.15, -.55, .85], armR: [-.05, -.95, .3], head: [.15, .22, .14], root: { y: -.26, rx: -.12, rz: .06 } },
  boredChin:    { legL: [.12, -.1, 1], legR: [-.1, -.1, 1], armR: [-.1, .25, .97], armL: [.15, -.55, .8], head: [-.1, .12, -.18], root: { y: -.23, rx: .16, rz: -.05 } },
  // tickling himself
  tickleArmpit: { armR: [.6, -.1, .8], armL: [.85, .55, .15], head: [.35, .1, .2], legL: [.12, -.1, 1], legR: [-.06, -.1, 1], root: { y: -.22, rz: .08, ry: .1 } },
  tickleRibs:   { armL: [-.55, -.45, .7], armR: [.55, -.45, .7], head: [0, .3, 0], legL: [.1, -.1, 1], legR: [-.1, -.1, 1], root: { y: -.22, rx: .12 } },
  tickleNeck:   { armR: [.35, .75, .55], armL: [.2, -.8, .5], head: [-.25, -.1, -.25], legL: [.15, -.1, 1], legR: [-.08, -.1, 1], root: { y: -.22, rz: -.06 } },
  tickleFoot:   { legL: [-.35, .45, .85], legR: [-.05, -.1, 1], armR: [-.3, -.3, .9], armL: [-.1, -.45, .9], head: [.1, .45, .05], root: { y: -.22, rx: .3, ry: .25 } },
  deadpan:      { armL: [.05, -.85, .5], armR: [-.05, -.85, .5], legL: [.08, -.05, 1], legR: [-.08, -.05, 1], head: [0, 0, 0], root: { y: -.22 } },
  // poking / surprise
  pokeSide:     { armL: [.95, -.15, .3], armR: [-.1, -.8, .6], legL: [.06, 0, 1], legR: [-.06, 0, 1], head: [.45, .15, .1], root: { y: -.22, rz: .1, ry: .15 } },
  jumpScream:   { armL: [.85, .75, .1], armR: [-.85, .75, .1], legL: [.35, -.6, .7], legR: [-.3, -.9, .3], head: [0, -.25, .08], root: { y: .18, rx: -.2, rz: -.05 } },
  turnAround:   { head: [2.2, 0, .05], armL: [.1, -.85, -.5], armR: [-.15, -.6, .78], legL: [.06, 0, 1], legR: [-.06, 0, 1], root: { y: -.22, ry: .6 } },
  pointAt:      { armR: [-.15, .2, 1], armL: [.2, -.95, -.1], head: [-.15, -.05, .1], root: { rz: .04, ry: -.15 } },
  // standing classics
  crossedArms:  { armL: [-.85, .05, .5], armR: [.75, -.1, .6], legL: [.25, -1, .05], legR: [-.05, -1, -.05], head: [-.2, .05, -.1], root: { rz: .06, ry: .3 } },
  cheer:        { armL: [.45, 1, .15], armR: [-.45, 1, .15], legL: [.25, -1, 0], legR: [-.25, -1, 0], head: [0, -.2, 0], root: { rx: -.08 } },
  shocked:      { armL: [.95, .55, .35], armR: [-.4, .3, .9], legL: [.35, -1, -.2], legR: [-.25, -1, .4], head: [0, -.2, .12], root: { rx: -.22, rz: -.08 } },
  facepalm:     { armR: [-.15, .75, .65], armL: [.15, -1, .1], head: [0, .25, .1], root: { rx: .1 } },
  shrug:        { armL: [.9, .2, .5], armR: [-.9, .2, .5], head: [.12, 0, .2], root: { rz: -.04 } },
  think:        { armR: [-.1, .55, .85], armL: [-.6, -.45, .65], head: [.25, -.12, .12], root: { rz: .03 } },
  wave:         { armR: [-.35, .95, .1], armL: [.1, -1, 0], head: [-.1, -.05, -.08], root: { rz: -.04 } },
};

// approved at the tickle pose gate (2026-10-21); classTurn is Xavier's own from the pose editor
const SIT_ = { legL: [.07, -.05, 1], legR: [-.06, -.05, 1] };
Object.assign(POSES, {
  writeTest:   { ...SIT_, armR: [-.12, -.55, .83], armL: [.22, -.62, .76], head: [.08, .42, .05], root: { y: -.22, rx: .16, rz: .02 } },
  writeTest2:  { ...SIT_, armR: [-.05, -.5, .86], armL: [.28, -.66, .7], head: [-.1, .38, -.06], root: { y: -.22, rx: .2, rz: -.03 } },
  tickleRibs2: { armL: { r: [-0.873, -0.061, -0.813], o: [0.015, -0.012, -0.01] }, armR: { r: [-1.152, 0.558, 0.791], o: [-0.082, -0.008, 0.026] }, legL: { r: [-0.934, -0.036, 0.134], o: [0, 0.005, 0.01] }, legR: { r: [-0.934, 0.036, -0.134], o: [0, 0.005, 0.01] }, head: { r: [0.607, 0.263, 0.091], o: [0, 0.065, 0] }, root: { y: -0.19, z: 0.258, rx: -0.411 } },   // Xavier's ribs, 2026-10-21
  classTurn:   { armL: { r: [-0.776, -0.062, 0.154] }, armR: { r: [-1.236, -0.557, -0.245] }, legL: { r: [-1.18, 0.883, 0.532], o: [-0.052, 0.058, -0.113] }, legR: { r: [-1.07, 0.485, 0.877], o: [0.058, 0.066, 0.134] }, head: { r: [-0.124, -1.886, -0.051] }, root: { x: 0.014, y: -0.22, z: -0.023, rx: 0.027, ry: -0.834, rz: -0.008 } },   // Xavier's v2, from the pose editor (looks right round)
  tickleFeet:  { armL: { r: [-1.103, 0, -0.123], o: [0, 0, 0.246] }, armR: { r: [-0.931, 0.694, 0.358], o: [0, 0, 0.196] }, legL: { r: [-1.579, 0.223, -0.701], o: [0, 0.315, 0.14] }, legR: { r: [-1.006, 0.016, -0.068], o: [0, -0.065, 0.14] }, head: { r: [0.452, 0.087, 0.027] }, root: { x: 0.021, y: -0.195, z: 0.082, rx: -0.163, ry: 0.25 } },   // Xavier's, chair pushed back to reach his foot
  standGrade:  { armL: [.3, -.15, .95], armR: [-.28, -.1, .95], legL: [.06, -1, .02], legR: [-.1, -1, -.05], head: [.05, .32, .04], root: { rx: .06, rz: .02 } },
  standLook:   { armL: [.35, -.75, .55], armR: [-.3, -.55, .8], legL: [.12, -1, -.1], legR: [-.08, -1, .12], head: [-.12, -.12, .08], root: { rx: -.1, ry: -.15, rz: -.03 } },
  gradePaper:  { legL: [.1, -.05, 1], legR: [-.04, -.05, 1], armR: [-.2, -.25, .95], armL: [.2, -.25, .95], head: [.05, .3, .04], root: { y: -.22, rx: .08 } },
  teacherLook: { legL: [.1, -.05, 1], legR: [-.04, -.05, 1], armR: [-.15, -.6, .8], armL: [.25, -.7, .65], head: [-.25, -.1, .1], root: { y: -.22, rx: -.05, ry: -.2 } },
  leanBack:    { legL: [.25, .1, 1], legR: [-.05, -.2, 1], armR: [-.3, -.2, .75], armL: [.5, .45, -.3], head: [.1, -.2, .12], root: { y: -.22, rx: -.22, rz: .05 } },
  pullLever:   { ...SIT_, armR: [-.25, -.3, .92], armL: [.15, -.85, .45], head: [-.25, .3, -.05], root: { y: -.22, rx: .18, ry: -.25 } },
  pressButtons:{ ...SIT_, armR: [-.08, -.4, .9], armL: [.12, -.42, .9], head: [0, .32, 0], root: { y: -.22, rx: .14 } },
  panic:       { legL: [.3, -.4, .85], legR: [-.35, -.2, .9], armL: [.8, .55, .25], armR: [-.75, .6, .3], head: [.15, -.25, .15], root: { y: -.12, rx: -.18, rz: .08 } },
  smirkLean:   { ...SIT_, armR: [-.1, -.6, .78], armL: [.35, -.55, .75], head: [-.55, .1, -.12], root: { y: -.22, rx: .1, ry: -.3, rz: -.04 } },
  laughHold:   { legL: [.15, -.05, 1], legR: [-.1, -.05, 1], armL: [-.5, -.45, .7], armR: [.5, -.45, .7], head: [-.3, -.25, .25], root: { y: -.22, rx: -.12, rz: .1 } },
  embarrassed: { ...SIT_, armR: [-.25, .55, .8], armL: [.2, -.9, .3], head: [.2, .35, .15], root: { y: -.24, rx: .2, rz: .06 } },
});
export function poseOf(p) { if (!p) return {}; return typeof p === 'string' ? (POSES[p] || (console.warn('unknown pose', p), {})) : p; }

const DOWN = new THREE.Vector3(0, -1, 0);
function rotvec(q) { if (q.w < 0) q.set(-q.x, -q.y, -q.z, -q.w); const a = 2 * Math.acos(Math.min(1, q.w)), s = Math.sqrt(Math.max(0, 1 - q.w * q.w)); return s < 1e-7 ? [0, 0, 0] : [q.x / s * a, q.y / s * a, q.z / s * a]; }
export function partChannels(name, v) {
  if (v == null) v = REST[name];
  if (!Array.isArray(v)) return [...(v.r || [0, 0, 0]), ...(v.p || [0, 0, 0]), ...(v.o || [0, 0, 0])];
  const q = name === 'head' ? new THREE.Quaternion().setFromEuler(new THREE.Euler(v[1], v[0], v[2], 'YXZ'))
    : new THREE.Quaternion().setFromUnitVectors(DOWN, new THREE.Vector3(...v).normalize());
  return [...rotvec(q), 0, 0, 0, 0, 0, 0];
}
export const PARTS = ['armL', 'armR', 'legL', 'legR', 'head'];

// STRETCHED ARM (Xavier, 2026-10-22): an arm reaching up is STRETCHED, not crumpled into the shoulder. Point it along
// `dir` and slide it out of the shoulder AS FAR AS THE GEOMETRY NEEDS: the R6 arm pivots half an arm-width (U/2) below
// its top, so a raised arm's near end sinks into the torso by up to a full arm-width (U = 0.34 m). The offset puts that
// near end back on the shoulder line: o = U/2 * (up + dir) * max(0, dir.y) -> 0 hanging or sideways, 0.34 m straight up.
// `k` scales it (1 = flush, >1 = extra reach). Use for yawns, cheers, big reaches; not for hands near the face.
// REACH OUT (Xavier, 2026-10-22, yawn stretch): an arm raised up AND out with its INNER side (the face that touches the
// torso at rest) turned to face outward, away from the body, like a real wake-up stretch (shoulders open, palms out).
// side 'L' | 'R'. Twists the arm about its own length after the swing, then applies the stretch() offset.
export function reachOut(side, dir, k = 1, out = .06) {
  const d = new THREE.Vector3(...dir).normalize(), qs = new THREE.Quaternion().setFromUnitVectors(DOWN, d), sx = side === 'L' ? 1 : -1;
  const n = new THREE.Vector3(-sx, 0, 0).applyQuaternion(qs), want = new THREE.Vector3(sx, 0, 0);
  const proj = v => v.clone().sub(d.clone().multiplyScalar(v.dot(d))).normalize(); const a = proj(n), b = proj(want);
  const ang = Math.atan2(a.clone().cross(b).dot(d), a.dot(b)), q = new THREE.Quaternion().setFromAxisAngle(d, ang).multiply(qs);
  const s = stretch(dir, k); s.r = rotvec(q); s.o = [s.o[0] + sx * out, s.o[1], s.o[2]]; return s;
}
export function stretch(dir, k = 1) {
  const d = new THREE.Vector3(...dir).normalize(), s = .17 * k * Math.max(0, d.y);
  return { r: rotvec(new THREE.Quaternion().setFromUnitVectors(DOWN, d)), o: [d.x * s, (1 + d.y) * s, d.z * s] };
}

// left <-> right mirror of a pose (either part form): swap arm/leg sides, flip x, negate turn / tilt
export function mirrorPose(p) {
  const P = poseOf(p), out = {}, sw = { armL: 'armR', armR: 'armL', legL: 'legR', legR: 'legL', head: 'head' };
  const m3 = (v, rot) => rot ? [v[0], -v[1], -v[2]] : [-v[0], v[1], v[2]];
  for (const [k, v] of Object.entries(P)) {
    if (k === 'root') { out.root = { ...v }; for (const c of ['x', 'ry', 'rz']) if (out.root[c] != null) out.root[c] = -out.root[c]; continue; }
    const d = sw[k]; if (!d) continue;
    if (Array.isArray(v)) out[d] = k === 'head' ? [-v[0], v[1], -v[2]] : [-v[0], v[1], v[2]];
    else out[d] = { ...(v.r && { r: m3(v.r, true) }), ...(v.p && { p: m3(v.p) }), ...(v.o && { o: m3(v.o) }) };
  }
  return out;
}
