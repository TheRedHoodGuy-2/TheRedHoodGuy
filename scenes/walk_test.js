// WALK TEST (2026-11-19): the boy stands, walks 5 m down the sidewalk, stops. engine/walk.js footprint gait.
// opts.check = true: steps through the walk and logs the real mesh's planted-foot drift and swing-foot floor clearance.
import * as THREE from 'three';
import { makeActor } from '../engine/cast.js';
import { walkPlan, footLock } from '../engine/walk.js';
import { dayLook } from '../engine/look.js';
import { planShots, validate } from '../engine/shots.js';
import { cameraRig } from '../engine/camera.js';

const Y = .14, Z = -4.85, X0 = -4.2, X1 = 4.0, T0 = -.25;
export const DUR = 8.0;

function lowest(part) {   // world points of the part's bottom face: [x, y, z] averaged, and the min y
  part.updateMatrixWorld(true); const v = new THREE.Vector3(), pts = [];
  part.traverse(m => { if (!m.isMesh) return; const a = m.geometry.attributes.position; for (let i = 0; i < a.count; i++) pts.push(v.fromBufferAttribute(a, i).applyMatrix4(m.matrixWorld).clone()); });
  const my = Math.min(...pts.map(p => p.y));
  // planted point = the centre of the block's bottom face (local bbox), in world space: heel / toe roll does not move it
  const g = part.isMesh ? part : part.children.find(m => m.isMesh); g.geometry.computeBoundingBox(); const bb = g.geometry.boundingBox;
  const c = new THREE.Vector3((bb.min.x + bb.max.x) / 2, bb.min.y, (bb.min.z + bb.max.z) / 2).applyMatrix4(g.matrixWorld);
  return { y: my, x: c.x, z: c.z, cy: c.y };
}

export async function build({ scene, W: w, H: h, opts = {} }) {
  const { buildSuburb } = await import('../engine/sets/suburb.js'); await buildSuburb(scene);
  const LOOK = dayLook(scene, { sunAz: 150, sunEl: 42, fill: .9 }); const sun = LOOK.sun, post = LOOK.post; post.maxBlur = 9 * w / 540;
  const boy = await makeActor('boy', { emo: 'neutral' }); scene.add(boy.root);
  boy.root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  const L = boy.rig.pivot('legL').y;
  const W = walkPlan({ path: [[X0, Z], [X1, Z]], t0: T0, step: .6, T: .5, L, style: opts.style || {} });
  const cam = new THREE.PerspectiveCamera(30, w / h, .05, 800);
  const lockMemo = {};
  const place = t => {   // body at time t (walk, then a stop and a look round)
    const s = W.at(t), idle = Math.sin(t * 1.3) * .01, after = t - W.t1;
    let pose = s.walking ? s.pose : { ...s.pose, root: { ...s.pose.root, rz: idle } };
    if (after > .25) { const k = Math.min(1, (after - .25) / .35), k2 = Math.min(1, Math.max(0, (after - .95) / .35)); pose = { ...pose, head: [ .75 * k - 1.25 * k2, .04, .05 * k - .08 * k2 ], armR: [-.1, -1, .05 + .1 * k] }; }
    boy.rig.pose(pose);
    const r = pose.root; boy.root.position.set(s.x + Math.cos(s.heading) * r.x + Math.sin(s.heading) * r.z, Y + r.y, s.z - Math.sin(s.heading) * r.x + Math.cos(s.heading) * r.z);
    boy.root.rotation.y = s.heading;
    if (!opts.nolock) footLock(boy, s, Y, lockMemo);
    return s;
  };
  const subjectAt = t => { const s = W.at(Math.min(t, W.t1)); return { x: s.x, y: Y, z: s.z, heading: s.heading }; };
  // Gneef grammar: every cut a different move, size, angle and speed (research/gneef_camera.md)
  const SHOTS = [
    { t: 0,   dur: 1.3, size: 'wide',   angle: 'eye',  az: 30,   move: 'push',  speed: 2.4 },
    { t: 1.3, dur: 1.1, size: 'feet',   angle: 'eye',  az: 88,   move: 'track', speed: .6 },
    { t: 2.4, dur: 1.4, size: 'medium', angle: 'high', az: 40,   move: 'orbitL', speed: 1.8 },
    { t: 3.8, dur: 1.2, size: 'full',   angle: 'eye',  az: -70,  move: 'pan',   speed: 1.0, follow: false },
    { t: 5.0, dur: 1.35, size: 'wide', angle: 'eye',   az: 12,   move: 'pull',  speed: 3.0 },
    { t: 6.35, dur: 1.65, size: 'close', angle: 'eye', az: 28,   move: 'punch', speed: 1.5 },
  ];
  const bad = validate(SHOTS); if (bad.length) console.error('SHOTS', bad.join('; '));
  const rig = cameraRig(planShots(SHOTS, subjectAt), { drift: 1 });
  const update = t => {
    const s = place(t);
    if (opts.camP) { cam.position.set(...opts.camP); cam.lookAt(...opts.camL); cam.fov = opts.fov || 36; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); }
    else rig.apply(cam, t);
    const sh = SHOTS.find((q, i) => t >= q.t && t < (SHOTS[i + 1]?.t ?? 99)) || SHOTS[0];
    LOOK.follow(cam, { x: boy.root.position.x, y: Y, z: boy.root.position.z, focusY: sh.size === 'feet' ? .3 : sh.size === 'close' ? 1.7 : 1.45 });
    return true;
  };
  if (opts.dbg) { update(1.0); const b = new THREE.Box3().setFromObject(boy.root); console.error('DBG', JSON.stringify(b.min), JSON.stringify(b.max), JSON.stringify(lowest(boy.rig.parts.legL)), Object.keys(boy.rig.parts).join(','), boy.rig.parts.legL.type, boy.rig.parts.legL.children.length); }
  if (opts.check) {   // gate: planted foot drift + swing clearance on the real mesh
    let drift = 0, sink = 0, minSwing = 9, last = null;
    for (let t = W.t0; t <= W.t1; t += 1 / 48) {
      place(t); boy.root.updateMatrixWorld(true); const s = W.at(t); if (!s.walking) continue;
      const st = lowest(boy.rig.parts[s.side === 'L' ? 'legL' : 'legR']), sw = lowest(boy.rig.parts[s.side === 'L' ? 'legR' : 'legL']);
      if (last && last.j === s.step) drift = Math.max(drift, Math.hypot(st.x - last.x, st.z - last.z));
      last = { j: s.step, x: st.x, z: st.z }; sink = Math.max(sink, Math.abs(st.y - Y));
      if (opts.dbg2 && Math.round(t * 48) % 6 === 0) console.error('S', t.toFixed(2), s.step, s.side, s.u.toFixed(2), st.y.toFixed(3), st.x.toFixed(3), sw.y.toFixed(3), boy.root.position.y.toFixed(3));
      if (s.u > .15 && s.u < .85) minSwing = Math.min(minSwing, sw.y - Y);
    }
    console.error('WALKCHECK', JSON.stringify({ L: +L.toFixed(3), steps: W.steps, dur: W.dur, driftPerFrame_mm: +(drift * 1000).toFixed(1), plantedOffFloor_mm: +(sink * 1000).toFixed(1), swingClearance_mm: +(minSwing * 1000).toFixed(1) }));
  }
  update(opts.t ?? 2);
  return { camera: cam, sun, post, update };
}
