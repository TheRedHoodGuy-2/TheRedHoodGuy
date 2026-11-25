// 07 DO-OVERS ("In This Town, You Get 100 Do-Overs ⏪"). Voice: topics/do_overs/voice/voice.wav (69.6 s) + 4 s shown end.
// Sets: the town (engine/sets/town.js) with House A furnished (kitchen, his bedroom, living, entry) on its real lot, so
// every window sees the neighbourhood. Exteriors on the street in front of lot A.
import * as THREE from 'three';
import { buildTown } from '../engine/sets/town.js';
import { dayLook } from '../engine/look.js';

export const DUR = 73.8;
export async function build({ scene, W: w, H: h, opts = {} }) {
  const T = await buildTown(scene, { interiors: true, furnish: ['kitchen', 'his', 'living', 'entry', 'dining'] });
  const lot = T.lots.A, H0 = T.houses.A; scene.updateMatrixWorld(true);
  // plan point (x east, z south, metres; y = floor height) -> world
  const inner = H0.root.parent, P = (x, z, y = 0) => inner.localToWorld(new THREE.Vector3(x, y, z));
  const rc = id => { const r = H0.rooms[id].rect, y = H0.rooms[id].y || 0; return P(r.x + r.w / 2, r.z + r.d / 2, y); };
  globalThis.SETINFO = { lot: [lot.position.x, lot.position.z, lot.rotation.y], kitchen: rc('kitchen').toArray(), his: rc('his').toArray(), living: rc('living').toArray() };
  const LOOK = dayLook(scene, { sunAz: 215, sunEl: 40, sun: 3.4, fill: .9 }), post = LOOK.post;
  const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.5), side: THREE.BackSide, fog: false })); scene.add(sky);
  const cam = new THREE.PerspectiveCamera(opts.fov || 34, w / h, .2, 1500);
  const update = t => { const o = globalThis.VIEW || opts;   // tools/views.mjs sets VIEW per still
    if (o.camP) { cam.position.set(...o.camP); cam.lookAt(...o.camL); cam.fov = o.fov || 34; cam.updateProjectionMatrix(); }
    if (o.look) LOOK.follow(cam, { x: o.look[0], y: o.look[1] - 1.35, z: o.look[2], focusY: 1.35 }); cam.updateMatrixWorld(true); return true; };
  if (opts.dbg) console.error('SETINFO', JSON.stringify(globalThis.SETINFO));
  update(0);
  return { camera: cam, sun: LOOK.sun, post, update };
}
