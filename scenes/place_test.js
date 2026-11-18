// PLACEMENT TEST: a modern living-room corner put together only with engine/place.js (no hand-typed positions), a body
// sat on the armchair by its seat anchor, and the clipping check's numbers.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { room } from '../engine/sets/roomkit.js';
import { loadRbx } from '../engine/rbxmodel.js';
import { makeR6 } from '../engine/r6.js';
import { onFloor, againstWall, onTop, anchors, sitOn, clipCheck, unclip, autoSit, faceTo } from '../engine/place.js';

export async function build({ scene, W, H, opts = {} }) {
  RectAreaLightUniformsLib.init();
  const R = await room(scene, { w: 5.4, d: 6.2, walls: { n: [{ type: 'window', at: -1.2 }], e: [{ type: 'door', at: -1.4 }] }, sockets: { n: [1.4] }, hide: ['s'] });
  const add = async (id, f) => { const o = await loadRbx(id); scene.add(o); f(o); return o; };
  const sofa = await add(11652583496, o => againstWall(o, R, 'n', .9));
  const chair = await add(12266124617, o => onFloor(o, -1.6, .3, .9));
  const table = await add(2908982722, o => onFloor(o, .7, .2, 0));
  const lamp = await add(15239800700, o => onTop(o, table, .55, 0));
  faceTo(chair, new THREE.Vector3(.7, 0, .2));   // the armchair turns to face the coffee table
  const guy = await makeR6({ face: false, res: 1024, skin: '#c68a62', shirt: 'assets/tex/shirt_m.png', pants: 'assets/tex/pants_m.png' }); scene.add(guy.root);
  const A = anchors(chair); sitOn(guy, A.seat); guy.joints.shoulderR.rotation.x = .35; guy.joints.shoulderL.rotation.x = .3; guy.joints.neck.rotation.y = -.3; const before = clipCheck(guy, [chair, sofa, table]);
  window.placeReport = { boxes: Object.fromEntries(Object.entries({ sofa, chair, table, lamp }).map(([k, o]) => { const b = new THREE.Box3().setFromObject(o); return [k, [b.min.toArray().map(v => +v.toFixed(2)), b.max.toArray().map(v => +v.toFixed(2))]]; })), chairSeat: A.seat && { y: +A.seat.p.y.toFixed(2), facing: A.seat.facing.toArray().map(v => +v.toFixed(2)) }, tableTop: anchors(table).top?.y.toFixed(2), clipBefore: before, clip: autoSit(guy, A.seat, [chair, sofa, table]) };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.6), side: THREE.BackSide })); scene.add(sky);
  const sunDir = new THREE.Vector3(-.4, .75, -1).normalize(), focus = new THREE.Vector3(0, 1, 0);
  const sun = new THREE.DirectionalLight('#fff1dc', 2.6); sun.position.copy(focus).addScaledVector(sunDir, 20); sun.target.position.copy(focus); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 5, far: 40 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; scene.add(sun, sun.target);
  const win = R.openings.find(o => o.type === 'window'); const fill = new THREE.RectAreaLight('#cfe0ff', 4, win.ow, win.oh); fill.position.set(win.at, win.y0 + win.oh / 2, -R.D / 2 - .05); fill.lookAt(win.at, win.y0 + win.oh / 2, 5); scene.add(fill);
  const bounce = new THREE.PointLight('#ffe2c2', 3, 10, 1.4); bounce.position.set(0, 1.2, 0); scene.add(bounce); scene.add(new THREE.HemisphereLight('#dfe7f5', '#8a7560', 1.1));
  const cam = new THREE.PerspectiveCamera(opts.fov || 62, W / H, .05, 200); cam.position.set(...(opts.camP || [.6, 1.9, 2.9])); cam.lookAt(...(opts.camL || [-1.5, .85, -.1]));
  return { camera: cam, sun, post: { sun, volume: 0, focus: 4, aperture: 1.2, maxBlur: 3 * W / 540, bloom: .25, bloomRadius: .5, bloomThreshold: 1.8, bloomCap: 2.5, exposure: 1.3, contrast: 1.08, saturation: 1.1, black: .02, shadowTint: '#5a7894', highTint: '#ffe0b0', tintAmt: .2, pivot: .42 } };
}
