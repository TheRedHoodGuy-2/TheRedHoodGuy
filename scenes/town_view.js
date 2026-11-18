// TOWN VIEW: the whole map from the air, or a street-level shot. opts: { camP, camL, fov, shadowR, interiors }
import * as THREE from 'three';
import { buildTown } from '../engine/sets/town.js';
export async function build({ scene, W, H, opts = {} }) {
  const T = await buildTown(scene, { interiors: !!opts.interiors }); window.townInfo = { trees: T.trees, buildings: T.data.buildings.length, lots: T.data.lots };
  const lotA = T.data.lots.find(l => l.house === 'A'), L = opts.at === 'A' ? lotA : null;
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.6), side: THREE.BackSide, fog: false })));
  scene.fog = new THREE.Fog('#d8e6f2', opts.fogNear ?? 400, opts.fogFar ?? 2600);
  const cl = new THREE.Vector3(...(opts.camL || [0, 0, 0])), sunDir = new THREE.Vector3(-.5, .8, -.55).normalize(), R = opts.shadowR || 300;
  const sun = new THREE.DirectionalLight('#fff1dc', 2.8); sun.position.copy(cl).addScaledVector(sunDir, R * 2); sun.target.position.copy(cl); sun.castShadow = R <= 400;   // shadow maps can't cover the whole town crisply: aerials go without sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -R, right: R, top: R, bottom: -R, near: 1, far: R * 4 }); sun.shadow.bias = R > 200 ? -.003 : -.0006; sun.shadow.normalBias = R > 200 ? .6 : .05; scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#e4ecf8', '#6a7a50', 1.25));
  const cam = new THREE.PerspectiveCamera(opts.fov || 40, W / H, R > 400 ? 3 : .3, 6000); cam.position.set(...(opts.camP || [0, 900, 1100])); cam.lookAt(cl);
  return { camera: cam, sun, post: { sun, volume: 0, focus: 100, aperture: 0, maxBlur: 0, bloom: .12, bloomRadius: .5, bloomThreshold: 2, bloomCap: 2, exposure: 1.2, contrast: 1.06, saturation: 1.08, black: .02, shadowTint: '#5a7894', highTint: '#ffe0b0', tintAmt: .15, pivot: .42 } };
}
