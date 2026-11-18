// POSE RIG (2026-11-18): the pose-editor / pose-library interface on top of engine/r6.js.
// Poses are written in the AVATAR frame (metres, +x = the character's LEFT, +y up, +z forward), exactly like the
// explainer-kit pose library, so Xavier's old pose code still drops in:
//   part = { r: rotation vector about the pivot (radians), p: pivot shift (m), o: move the part off its pivot (m) }
//   root = { x, y, z, rx, ry, rz } on the whole body (Euler YXZ).
// Inside r6.js everything lives in Roblox space (rotated 180 deg about y, in studs); this file does the conversion.
import * as THREE from 'three';
import { STUD } from './r6.js';
import { partChannels, poseOf, REST, PARTS } from './poses.js';

const JOINT = { armL: 'shoulderL', armR: 'shoulderR', legL: 'hipL', legR: 'hipR', head: 'neck' };
const toRbx = v => new THREE.Vector3(-v[0], v[1], -v[2]).divideScalar(STUD);         // avatar metres -> Roblox studs
const rvToRbx = v => [-v[0], v[1], -v[2]];                                              // an axis turns the same way

export function poseRig(api) {
  const J = api.joints, P = api.parts, def = {};
  for (const n of PARTS) def[n] = { j: J[JOINT[n]].position.clone(), m: P[n].position.clone() };
  const A = { root: api.root, api, sex: api.spec.sex || 'm', parts: P };
  // default pivot of a part in the avatar frame (metres)
  A.pivot = n => { const j = def[n].j.clone().add(J.root.position); return new THREE.Vector3(-j.x, j.y, -j.z).multiplyScalar(STUD); };
  A.reset = () => { for (const n of PARTS) { J[JOINT[n]].position.copy(def[n].j); J[JOINT[n]].quaternion.identity(); P[n].position.copy(def[n].m); }
    J.root.position.set(0, 3, 0); J.root.rotation.set(0, 0, 0); api.root.position.set(0, 0, 0); api.root.rotation.set(0, 0, 0); };
  A.part = (n, { r = [0, 0, 0], p = [0, 0, 0], o = [0, 0, 0] } = {}) => {
    const j = J[JOINT[n]], rv = rvToRbx(r), a = Math.hypot(...rv), pr = toRbx(p), or = toRbx(o);
    j.quaternion.copy(a > 1e-7 ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(...rv).divideScalar(a), a) : new THREE.Quaternion());
    j.position.copy(def[n].j).add(pr).add(or); P[n].position.copy(def[n].m).sub(pr);
  };
  // apply a whole pose (library name or object); root moves the outer group (feet at y = 0 when standing)
  A.pose = pose => { const ps = poseOf(pose); A.reset();
    const rt = { ...REST.root, ...(ps.root || {}) }; api.root.position.set(rt.x, rt.y, rt.z); api.root.rotation.set(rt.rx, rt.ry, rt.rz, 'YXZ');
    for (const n of PARTS) { const c = partChannels(n, ps[n] ?? REST[n]); A.part(n, { r: c.slice(0, 3), p: c.slice(3, 6), o: c.slice(6, 9) }); } };
  A.setExpression = () => {};   // faces are their own step (not built yet)
  return A;
}
