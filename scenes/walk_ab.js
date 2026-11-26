// WALK A/B: actors walking side by side (debug), opts.keys list, t from renderFrame
import * as THREE from 'three';
import { stage } from '../engine/act.js';
import { GRADE } from '../engine/look.js';
export async function build({ scene, W, H, opts = {} }) {
  const M = await import(`./${opts.topic}.js`); scene.background = new THREE.Color('#5b616b');
  scene.add(new THREE.HemisphereLight('#dfe8f5', '#4a4640', 1.6)); const sun = new THREE.DirectionalLight('#fff3e2', 2.6); sun.position.set(2.5, 5, 4); scene.add(sun);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#8a8f96' })); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const S = stage(scene, { POSES: M.P }); const L = opts.keys;
  for (const [i, key] of L.entries()) { const A = await S.actor(key, {}); A.show(-9, 99); const x = (i - (L.length - 1) / 2) * 1.6; A.run(0, [[x, -3], [x, 6]], { step: .6, T: .44, arm: .5 }); if (opts.upper) A.key(0, { pose: opts.upper, upper: true, hold: 9 }); }
  const cam = new THREE.PerspectiveCamera(30, W / H, .1, 100);
  const update = t => { S.update(t); cam.position.set(4, 1.5, 9); cam.lookAt(0, 1, 0); return true; };
  update(0); return { camera: cam, sun, post: { ...GRADE.day, sun, aperture: 0, bloom: 0, volume: 0, focus: 9 }, update };
}
