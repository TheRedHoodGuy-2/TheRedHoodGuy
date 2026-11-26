// GARMENT CHECK: candidate shirts / pants on bank bodies, front + back (opts.list: [[base, shirtId, pantsId], ...]).
import * as THREE from 'three';
import { makeActor, loadCast } from '../engine/cast.js';
import { roomLook } from '../engine/look.js';
export async function build({ scene, W: w, H: h, opts = {} }) {
  const { CAST } = await loadCast(); scene.background = new THREE.Color('#30343a');
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshStandardMaterial({ color: '#8d6a48', roughness: .7 })); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const L = opts.list, gap = 1.6, acts = [];
  for (const [i, [base, sh, pa, extra]] of L.entries()) { const k = 'gc' + i; CAST[k] = { base, ...(sh ? { shirtTex: `assets/roblox/${sh}/texture.png` } : {}), ...(pa ? { pants: pa } : {}), ...(extra || {}) };
    const a = await makeActor(k, { emo: 'neutral' }); a.root.position.set((i - (L.length - 1) / 2) * gap, 0, 0); scene.add(a.root); acts.push(a); }
  const cam = new THREE.PerspectiveCamera(26, w / h, .15, 200); const R = roomLook(scene, {});
  const update = t => { const v = Math.round(t) % 2; for (const a of acts) a.root.rotation.y = v ? Math.PI + .4 : .35; cam.position.set(0, 1.5, 14); cam.lookAt(0, 1.05, 0); cam.updateMatrixWorld(true); return true; };
  update(0); return { camera: cam, sun: R.sun, post: R.post, update };
}
