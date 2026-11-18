// ROOM KIT TEST: an empty modern room made by engine/sets/roomkit.js at scale v2, one R6 for size, afternoon daylight.
// The front wall (s) is a film-set wall: the camera sees through it, the light does not.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { room } from '../engine/sets/roomkit.js';
import { makeR6 } from '../engine/r6.js';

export async function build({ scene, W, H, opts = {} }) {
  RectAreaLightUniformsLib.init();
  const R = await room(scene, { w: 5.4, d: 6.2, walls: { n: [{ type: 'window', at: .6 }], e: [{ type: 'door', at: -1.0 }] }, sockets: { n: [-1.8], w: [-1.5] }, hide: ['s'] });
  const guy = await makeR6({ face: false, res: 1024, skin: '#c68a62', shirt: 'assets/tex/shirt_m.png', pants: 'assets/tex/pants_m.png' }); guy.root.position.set(-.5, 0, .2); guy.root.rotation.y = 2.6; scene.add(guy.root);
  // outside: plain sky so the window reads (the backdrop is its own foundation step)
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.6), side: THREE.BackSide })); scene.add(sky);
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#5d7a3c', roughness: 1 })); lawn.rotation.x = -Math.PI / 2; lawn.position.y = -.3; scene.add(lawn);
  const sunDir = new THREE.Vector3(.5, .8, -1).normalize(), focus = new THREE.Vector3(0, 1, 0);
  const sun = new THREE.DirectionalLight('#fff1dc', 2.6); sun.position.copy(focus).addScaledVector(sunDir, 20); sun.target.position.copy(focus); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 5, far: 40 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; scene.add(sun, sun.target);
  const win = R.openings.find(o => o.type === 'window');
  const fill = new THREE.RectAreaLight('#cfe0ff', 4, win.ow, win.oh); fill.position.set(win.at, win.y0 + win.oh / 2, -R.D / 2 - .05); fill.lookAt(win.at, win.y0 + win.oh / 2, 5); scene.add(fill);
  const bounce = new THREE.PointLight('#ffe2c2', 3, 10, 1.4); bounce.position.set(.5, 1.2, 0); scene.add(bounce);
  scene.add(new THREE.HemisphereLight('#dfe7f5', '#8a7560', 1.1));
  const cam = new THREE.PerspectiveCamera(opts.fov || 55, W / H, .05, 200); cam.position.set(...(opts.camP || [.4, 2.0, 4.6])); cam.lookAt(...(opts.camL || [-.1, 1.4, -2]));
  return { camera: cam, sun, post: { sun, volume: 0, focus: 4.5, aperture: 1.5, maxBlur: 3 * W / 540, bloom: .25, bloomRadius: .5, bloomThreshold: 1.8, bloomCap: 2.5,
    exposure: 1.3, contrast: 1.08, saturation: 1.1, black: .02, shadowTint: '#5a7894', highTint: '#ffe0b0', tintAmt: .2, pivot: .42 } };
}
