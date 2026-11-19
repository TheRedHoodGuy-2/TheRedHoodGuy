// FIT TEST: one cast member, a pose, camera at az degrees around them (front = 0). Checks 3D clothing fit.
import * as THREE from 'three';
import { makeActor, wearFeet } from '../engine/cast.js';
const POSES = { stand: {}, walk: { armL: [.06, -.95, .32], armR: [-.06, -.95, -.32], legL: [.03, -.95, -.32], legR: [-.03, -.95, .32] },
  raise: { armR: { r: [3.05, .42, 0], o: [-.057, .252, -.013] }, armL: [.4, -.9, .1] }, armfwd: { armR: [-.05, .05, 1], armL: [.1, -1, .05] }, slash: { armR: { r: [-1.45, 0, -1.2], o: [.05, .3, .1] } } };
export async function build({ scene, W: w, H: h, opts = {} }) { if (opts.nocuff) globalThis.NOCUFF = 1;
  scene.add(new THREE.HemisphereLight('#eef2ff', '#776655', 1.6)); const L = new THREE.DirectionalLight('#fff', 2.2); L.position.set(3, 5, 4); scene.add(L);
  scene.background = new THREE.Color('#9aa7b4');
  const a = await makeActor(opts.who || 'boy', { emo: 'neutral' }); scene.add(a.root); a.rig.pose(POSES[opts.pose || 'stand'] || {});
  if (opts.skates) { const { addSkates } = await import('../engine/props/skates.js'); const lift = addSkates(a, {}); a.root.position.y = lift; }
  if (opts.feet) { const lift = await wearFeet(a, opts.feet); a.root.position.y = lift; console.error('LIFT', lift.toFixed(3)); }
  const cam = new THREE.PerspectiveCamera(30, w / h, .2, 100), az = (opts.az || 0) * Math.PI / 180;
  const D = opts.d || 4.6, ly = opts.ly ?? 1.0; cam.position.set(Math.sin(az) * D + (opts.lx || 0), ly + .15, Math.cos(az) * D); cam.lookAt(opts.lx || 0, ly, 0);
  return { camera: cam, post: { exposure: 1, volume: 0, bloom: 0, aperture: 0 } };
}
