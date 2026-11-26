// CAST TEST: the family lined up, each with a wall shadow and a floor shadow (shadows swapped: the boy's is Mia's shape).
import * as THREE from 'three';
import { makeActor, shadowOf } from '../engine/cast.js';
export async function build({ scene, W: w, H: h, opts = {} }) {
  scene.background = new THREE.Color('#e8e2d8');
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 5), new THREE.MeshStandardMaterial({ color: '#efe6d6', roughness: .9 })); wall.position.set(0, 2.5, -1.2); scene.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), new THREE.MeshStandardMaterial({ color: '#9b7a55', roughness: .8 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const keys = ['grandma', 'mom', 'boy', 'mia'], swap = { boy: 'mia', mia: 'boy' };
  for (const [i, k] of keys.entries()) {
    const a = await makeActor(k, { emo: k === 'mia' ? 'smug' : 'neutral' }); a.root.position.set((i - 1.5) * 1.6, 0, 0); a.root.traverse(o => { if (o.isMesh) o.castShadow = false; }); scene.add(a.root);
    const s = await shadowOf(swap[k] || k, { kind: 'wall' }); s.shadowGroup.position.set((i - 1.5) * 1.6 + .35, .25, -1.18); s.shadowGroup.scale.setScalar(1.08); scene.add(s.shadowGroup);
  }
  const cam = new THREE.PerspectiveCamera(30, w / h, .05, 100); cam.position.set(0, 1.6, 9.5); cam.lookAt(0, 1.3, 0);
  const sun = new THREE.DirectionalLight('#fff3e0', 2.6); sun.position.set(3, 6, 6); scene.add(sun, sun.target); scene.add(new THREE.HemisphereLight('#eef2ff', '#806a50', 1.3));
  return { camera: cam, sun, post: { sun, volume: 0, aperture: 0, bloom: 0, exposure: 1.1 } };
}
