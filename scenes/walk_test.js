// WALK TEST (2026-11-19): the boy stands, walks 5 m down the sidewalk, stops. engine/walk.js footprint gait.
// opts.check = true: steps through the walk and logs the real mesh's planted-foot drift and swing-foot floor clearance.
import * as THREE from 'three';
import { makeActor } from '../engine/cast.js';
import { walkPlan, footLock } from '../engine/walk.js';

const Y = .14, Z = -4.85, X0 = -2.6, X1 = 2.6, T0 = .12;
export const DUR = 6.2;

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
  const sun = new THREE.DirectionalLight('#fff1dc', 2.8); sun.position.set(-12, 22, 26); sun.target.position.set(0, 0, -5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, near: 1, far: 80 }); sun.shadow.bias = -.0005; scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#e4ecf8', '#6a7a50', 1.25), new THREE.Mesh(new THREE.SphereGeometry(300, 24, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.5), side: THREE.BackSide })));
  const boy = await makeActor('boy', { emo: 'neutral' }); scene.add(boy.root);
  boy.root.traverse(m => { if (m.isMesh) m.castShadow = true; });
  const L = boy.rig.pivot('legL').y;
  const W = walkPlan({ path: [[X0, Z], [X1, Z]], t0: T0, step: .6, T: .5, L, style: opts.style || {} });
  const cam = new THREE.PerspectiveCamera(30, w / h, .05, 600);
  const post = { volume: 0, aperture: 1.6, maxBlur: 6 * w / 540, bloom: .2, bloomRadius: .6, bloomThreshold: 1.4, bloomCap: 2.4, bloomTint: '#ffb391', exposure: 1.15, contrast: 1.08, saturation: 1.05,
    black: .02, shadowTint: '#4d6f92', highTint: '#ffd9a8', tintAmt: .2, pivot: .42, lift: [.012, .016, .03], gain: [1.03, 1, .97], grain: .02, ca: .003, sun };
  const lockMemo = {};
  const update = t => {
    const s = W.at(t), idle = Math.sin(t * 1.3) * .01;
    const pose = s.walking ? s.pose : { ...s.pose, root: { ...s.pose.root, rz: idle } };
    boy.rig.pose(pose);
    const r = pose.root; boy.root.position.set(s.x + Math.cos(s.heading) * r.x + Math.sin(s.heading) * r.z, Y + r.y, s.z - Math.sin(s.heading) * r.x + Math.cos(s.heading) * r.z);
    boy.root.rotation.y = s.heading;
    if (!opts.nolock) footLock(boy, s, Y, lockMemo);
    // cameras: side tracking (feet in frame, footprints read), then 3/4 front as he walks toward the lens and stops
    const hx = boy.root.position.x;
    if (opts.camP) { cam.position.set(...opts.camP); cam.lookAt(...opts.camL); }
    else if (t < 3.0) { cam.position.set(hx - .25, 1.15, Z + 5.2); cam.lookAt(hx, 1.0, Z); }
    else { const k = Math.min(1, (t - 3.0) / 3.2); cam.position.set(X1 + 3.4 - k * .3, 1.35, Z + 2.6 - k * .2); cam.lookAt(hx, .85, Z); }
    cam.fov = opts.fov || 36; cam.updateProjectionMatrix(); cam.updateMatrixWorld(); post.focus = cam.position.distanceTo(boy.root.position) ;
    return true;
  };
  if (opts.dbg) { update(1.0); const b = new THREE.Box3().setFromObject(boy.root); console.error('DBG', JSON.stringify(b.min), JSON.stringify(b.max), JSON.stringify(lowest(boy.rig.parts.legL)), Object.keys(boy.rig.parts).join(','), boy.rig.parts.legL.type, boy.rig.parts.legL.children.length); }
  if (opts.check) {   // gate: planted foot drift + swing clearance on the real mesh
    let drift = 0, sink = 0, minSwing = 9, last = null;
    for (let t = W.t0; t <= W.t1; t += 1 / 48) {
      update(t); boy.root.updateMatrixWorld(true); const s = W.at(t); if (!s.walking) continue;
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
