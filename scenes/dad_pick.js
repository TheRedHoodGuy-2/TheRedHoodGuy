// DAD PICK (Clap Cops, 2026-11-25): bank dads lined up between Mom and the boy so Xavier picks the permanent Dad.
// opts.ids = bank ids to show (default the 4 picks). Each stands in a relaxed, uneven pose, 3/4 to camera, labelled by order.
import * as THREE from 'three';
import { makeActor } from '../engine/cast.js';
import { roomLook } from '../engine/look.js';
export async function build({ scene, W: w, H: h, opts = {} }) {
  const ids = opts.ids || ['m060', 'm073', 'm099', 'm008'];
  scene.background = new THREE.Color('#2b2f36');
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), new THREE.MeshStandardMaterial({ color: '#e9e1d3', roughness: .9 })); wall.position.set(0, 3, -1.5); wall.receiveShadow = true; scene.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshStandardMaterial({ color: '#8d6a48', roughness: .7 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const line = ['mom', ...ids, 'boy'], gap = 1.45;
  const relaxed = { legL: { r: [0.04, 0, 0.05], o: [0.01, 0, 0.02] }, legR: { r: [-0.07, 0, -0.04], o: [-0.02, 0.01, -0.03] }, armL: { r: [-0.12, 0, 0.04] }, armR: { r: [0.1, 0, -0.03] }, head: { r: [0.03, 0.1, 0.02] }, root: { x: 0.03, rz: 0.03 } };
  for (const [i, k] of line.entries()) {
    const a = await makeActor(k, { emo: k === 'boy' ? 'neutral' : 'happy' });
    a.rig.pose(relaxed); a.root.position.set((i - (line.length - 1) / 2) * gap, 0, 0); a.root.rotation.y = -0.35 + i * 0.12;
    a.root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(a.root);
  }
  const cam = new THREE.PerspectiveCamera(24, w / h, .15, 200); cam.position.set(0, 1.55, 21); cam.lookAt(0, 1.05, 0);
  const L = roomLook(scene, { key: [4, 6, 7], keyInt: 2.6 });
  return { camera: cam, sun: L.sun, post: L.post, update: () => L.follow && L.follow(cam, { x: 0, y: 0, z: 0 }) };
}
