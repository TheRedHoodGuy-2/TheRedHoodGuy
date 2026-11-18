// HOUSE VIEW: a dollhouse cut-away of one floor of a house (no ceilings), from above at an angle, afternoon sun.
// opts: { house: 'A'|'B', floor: 'ground'|'up'|'basement'|'attic', camP, camL, fov, furnish }
import * as THREE from 'three';
import { buildHouse } from '../engine/sets/house.js';
import { FLOOR_H } from '../engine/designs/plans.js';
export async function build({ scene, W, H, opts = {} }) {
  const fk = opts.floor || 'ground', H0 = await buildHouse(scene, opts.house || 'A', { floors: [fk], ceilings: opts.ceilings ?? false });
  if (opts.furnish) { const { furnishHouse } = await import('../engine/designs/furnish.js'); const rep = await furnishHouse(scene, H0, opts.only); console.error('FURNISH', JSON.stringify(rep)); }
  const y = H0.plan.floors[fk].y;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.5), side: THREE.BackSide })); scene.add(sky);
  if (fk !== 'basement') { const lawn = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: '#5d7a3c', roughness: 1 })); lawn.rotation.x = -Math.PI / 2; lawn.position.y = y - .12; lawn.receiveShadow = true; scene.add(lawn); }
  const c = new THREE.Vector3(9, y, 5.5), sunDir = new THREE.Vector3(.45, .85, -.6).normalize();
  const sun = new THREE.DirectionalLight('#fff1dc', 2.6); sun.position.copy(c).addScaledVector(sunDir, 30); sun.target.position.copy(c); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 5, far: 70 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#e4ecf8', '#8a7560', 1.5));
  const cam = new THREE.PerspectiveCamera(opts.fov || 38, W / H, .1, 300); cam.position.set(...(opts.camP || [9, y + 26, 27])); cam.lookAt(...(opts.camL || [9, y, 5.2]));
  return { camera: cam, sun, post: { sun, volume: 0, focus: 30, aperture: 0, maxBlur: 0, bloom: .15, bloomRadius: .5, bloomThreshold: 2, bloomCap: 2, exposure: 1.25, contrast: 1.06, saturation: 1.08, black: .02, shadowTint: '#5a7894', highTint: '#ffe0b0', tintAmt: .15, pivot: .42 } };
}
