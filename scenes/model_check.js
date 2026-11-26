// MODEL CHECK: Creator Store models in a row on a floor, 2 views (opts.view 0 front-3/4, 1 back-3/4). opts.ids, opts.gap.
import * as THREE from 'three';
import { loadRbx } from '../engine/rbxmodel.js';
import { dayLook } from '../engine/look.js';
export async function build({ scene, W: w, H: h, opts = {} }) {
  const ids = opts.ids, gap = opts.gap || 8, sc = opts.scale || {}; const L = dayLook(scene, { sunAz: 150, sunEl: 45, sun: 3.2, fill: 1 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: '#8a8f86', roughness: .9 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  let x = 0; const xs = [];
  for (const id of ids) { const m = await loadRbx(id, { scale: sc[id] || 1 }); const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3()); m.position.set(x + s.x / 2, 0, 0); m.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } }); scene.add(m); xs.push([x + s.x / 2, s]); console.error('SIZE', id, s.toArray().map(v => v.toFixed(2)).join(' ')); x += s.x + gap; }
  const cam = new THREE.PerspectiveCamera(30, w / h, .15, 400); const cx = x / 2, D = Math.max(x * 1.1, 12);
  const update = t => { const v = Math.round(t) % 2; cam.position.set(cx + (v ? -1 : 1) * D * .35, D * .3, (v ? -1 : 1) * D * .9); cam.lookAt(cx, 1, 0); cam.updateMatrixWorld(true); return true; };
  update(0); return { camera: cam, sun: L.sun, post: L.post, update };
}
