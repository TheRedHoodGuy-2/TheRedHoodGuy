// 07 DO-OVERS ("In This Town, You Get 100 Do-Overs ⏪"). Voice: topics/do_overs/voice/voice.wav (69.6 s) + 4 s shown end.
// Sets: the town (engine/sets/town.js) with House A furnished (kitchen, his bedroom, living, entry) on its real lot, so
// every window sees the neighbourhood. Exteriors on the street in front of lot A.
import * as THREE from 'three';
import { buildTown } from '../engine/sets/town.js';
import { dayLook } from '../engine/look.js';
import { loadRbx } from '../engine/rbxmodel.js';

export const DUR = 73.8;
export async function build({ scene, W: w, H: h, opts = {} }) {
  const { buildSuburb } = await import('../engine/sets/suburb.js'); await buildSuburb(scene);   // exteriors: the dense street from Sunset Tag
  const T = await buildTown(scene, { interiors: true, furnish: ['kitchen', 'his', 'living', 'entry', 'dining'] });
  T.root.position.x += 3000; const lot = T.lots.A, H0 = T.houses.A; scene.updateMatrixWorld(true);   // the town (House A interiors) lives far away
  // plan point (x east, z south, metres; y = floor height) -> world
  const inner = H0.root.parent, P = (x, z, y = 0) => inner.localToWorld(new THREE.Vector3(x, y, z));
  const rc = id => { const r = H0.rooms[id].rect, y = H0.rooms[id].y || 0; return P(r.x + r.w / 2, r.z + r.d / 2, y); };
  globalThis.SETINFO = { lot: [lot.position.x, lot.position.z, lot.rotation.y], kitchen: rc('kitchen').toArray(), his: rc('his').toArray(), living: rc('living').toArray() };
  const k = P(13.3, 2.8, 0);   // kitchen centre
  const prop = async (id, at, o = {}) => { const m = await loadRbx(id, o); m.position.copy(at); if (o.ry) m.rotation.y = o.ry; scene.add(m); return m; };
  const counterY = .92;   // kitchen counter top height (house A)
  const cake = await prop(5002633399, P(12.2, 4.4, counterY + .1), { scale: .45 });
  const camry = await prop(133877355439325, new THREE.Vector3(-20, 0, -5.6), { ry: Math.PI / 2 });
  const bus = await prop(3138879863, new THREE.Vector3(6, 0, 1.9), { ry: -Math.PI / 2 });
  const bike = await prop(91358100215341, new THREE.Vector3(-8, 0, 3.4), { ry: Math.PI / 2 });
  globalThis.PROPS = { cake, camry, bus, bike };
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
