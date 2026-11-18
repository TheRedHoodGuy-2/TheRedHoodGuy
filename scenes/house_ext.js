// HOUSE EXTERIOR: one house (shell + interiors behind the windows) on its lot, from the street. opts: { house, camP, camL, fov }
import * as THREE from 'three';
import { buildHouse } from '../engine/sets/house.js';
import { houseShell, GRADE } from '../engine/sets/shell.js';
import { mat } from '../engine/materials.js';
import { bbox, at } from '../engine/build.js';
export async function build({ scene, W, H, opts = {} }) {
  const k = opts.house || 'A'; await buildHouse(scene, k, { floors: ['ground', 'up'] }); await houseShell(scene, k);
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.6), side: THREE.BackSide })));
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat('grass', { size: 3 })); lawn.geometry.rotateX(-Math.PI / 2); lawn.position.y = GRADE; lawn.receiveShadow = true; scene.add(lawn);
  const pave = mat('pavement', {}), road = mat('asphalt', {});
  scene.add(at(bbox(80, .1, 2.4, pave, .01), 8, GRADE + .05, -10.4), at(bbox(80, .06, 9, road, .01), 8, GRADE + .0, -16.4));
  const c = new THREE.Vector3(9, 0, 5), sunDir = new THREE.Vector3(-.5, .75, -.65).normalize();
  const sun = new THREE.DirectionalLight('#fff1dc', 2.8); sun.position.copy(c).addScaledVector(sunDir, 40); sun.target.position.copy(c); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 5, far: 90 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#e4ecf8', '#6a7a50', 1.2));
  const cam = new THREE.PerspectiveCamera(opts.fov || 40, W / H, .1, 500); cam.position.set(...(opts.camP || [-6, 3.2, -24])); cam.lookAt(...(opts.camL || [9, 4, 3]));
  return { camera: cam, sun, post: { sun, volume: 0, focus: 25, aperture: 0, maxBlur: 0, bloom: .15, bloomRadius: .5, bloomThreshold: 2, bloomCap: 2, exposure: 1.2, contrast: 1.06, saturation: 1.08, black: .02, shadowTint: '#5a7894', highTint: '#ffe0b0', tintAmt: .15, pivot: .42 } };
}
