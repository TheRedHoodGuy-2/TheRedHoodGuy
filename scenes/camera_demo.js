// CAMERA DEMO (2026-11-19): House A ground floor, 8 s, 9:16. One continuous glide from the hall into the living room,
// a 0.25 s dissolve to a push-in on the kitchen, a hard cut to a low close shot on the coffee table with a shake when
// something hits it. Shows the camera system (engine/camera.js); nobody acts yet.
import * as THREE from 'three';
import { buildHouse } from '../engine/sets/house.js';
import { furnishHouse } from '../engine/designs/furnish.js';
import { cameraRig } from '../engine/camera.js';
export async function build({ scene, W, H, opts = {} }) {
  const HS = await buildHouse(scene, 'A', { floors: ['ground', 'up', 'basement'] });
  const mine = Object.entries(HS.rooms).filter(([, r]) => r.floor === 'ground').map(([id]) => id); await furnishHouse(scene, HS, mine);
  const ct = HS.rooms.living.refs.root.children.find(o => o.name === 'coffee table'), tp = ct ? new THREE.Box3().setFromObject(ct).getCenter(new THREE.Vector3()) : new THREE.Vector3(7.5, .5, 4.4);
  window.demoInfo = { table: tp.toArray() };
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.6), side: THREE.BackSide })));
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: '#5d7a3c', roughness: 1 })); lawn.rotation.x = -Math.PI / 2; lawn.position.y = -.12; scene.add(lawn);
  const c = new THREE.Vector3(9, 0, 5.5), sun = new THREE.DirectionalLight('#fff1dc', 2.8); sun.position.copy(c).addScaledVector(new THREE.Vector3(.45, .8, -.7).normalize(), 30); sun.target.position.copy(c); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -17, right: 17, top: 17, bottom: -17, near: 5, far: 70 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#e4ecf8', '#8a7560', 1.1)); const b1 = new THREE.PointLight('#ffe6cc', 4, 9, 1.3); b1.position.set(7.5, 2.4, 3.2); const b2 = b1.clone(); b2.position.set(13.3, 2.4, 2.8); scene.add(b1, b2);
  const T = tp;
  const rig = cameraRig([
    // 1. one continuous glide: entry -> through the open passage -> round to face the sofa
    { t: 0, keys: [{ t: 0, p: [2.2, 2.6, 4.6], l: [7.6, 1.1, 2.4], fov: 60 }, { t: 1.7, p: [5.0, 2.3, 2.2], l: [7.9, 1.0, 4.8], fov: 60 }, { t: 3.5, p: [T.x + .3, 2.05, T.z - 3.0], l: [T.x, .9, T.z + 1.1], fov: 58 }] },
    // 2. dissolve to the kitchen: slow push-in on the run
    { t: 3.5, in: 'dissolve', keys: [{ t: 3.5, p: [11.3, 2.5, 5.0], l: [13.8, 1.2, .5], fov: 60 }, { t: 6, p: [11.6, 2.25, 3.6], l: [13.8, 1.15, .5], fov: 56, ease: 'out' }] },
    // 3. hard cut: low on the coffee table, creeping in; it shakes when something hits the table
    { t: 6, keys: [{ t: 6, p: [T.x + 2.2, 1.75, T.z - 2.3], l: [T.x - .2, .7, T.z + .6], fov: 50 }, { t: 8, p: [T.x + 1.9, 1.6, T.z - 2.0], l: [T.x - .2, .7, T.z + .6], fov: 48, ease: 'out' }] },
  ], { shakes: [{ t: 6.9, amp: 1, dur: .45 }] });
  const cam = new THREE.PerspectiveCamera(52, W / H, .05, 300); rig.apply(cam, 0);
  return { camera: cam, rig, update: t => false, post: { sun, volume: 0, focus: 3, aperture: .5, maxBlur: 2 * W / 540, bloom: .2, bloomRadius: .5, bloomThreshold: 1.8, bloomCap: 2.5, exposure: 1.35, contrast: 1.07, saturation: 1.1, black: .02, shadowTint: '#5a7894', highTint: '#ffe0b0', tintAmt: .18, pivot: .42 } };
}
