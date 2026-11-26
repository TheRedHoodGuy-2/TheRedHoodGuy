// POSE A/B: one actor per pose object, side by side (opts.list: [[castKey, poseName | pose object], ...], opts.topic for P)
import * as THREE from 'three';
import { stage } from '../engine/act.js';
import { GRADE } from '../engine/look.js';
export async function build({ scene, W, H, opts = {} }) {
  const M = await import(`./${opts.topic}.js`); scene.background = new THREE.Color('#5b616b');
  scene.add(new THREE.HemisphereLight('#dfe8f5', '#4a4640', 1.6)); const sun = new THREE.DirectionalLight('#fff3e2', 2.6); sun.position.set(2.5, 5, 4); scene.add(sun);
  const S = stage(scene, { POSES: M.P }); const L = opts.list;
  for (const [i, [key, pose]] of L.entries()) { const A = await S.actor(key, {}); A.show(-9, 99).key(0, { pose, at: [(i - (L.length - 1) / 2) * 1.5, 0], ry: opts.ry || 0 }); }
  S.update(1.5);
  const cam = new THREE.PerspectiveCamera(30, W / H, .1, 100); cam.position.set(0, 1.4, 9); cam.lookAt(0, 1, 0);
  return { camera: cam, sun, post: { ...GRADE.day, sun, aperture: 0, bloom: 0, volume: 0, focus: 9 } };
}
