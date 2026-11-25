// POSE SHEET (2026-11-25, Xavier: "before you render, show me every pose used in the video so I can repose the bad ones").
// One pose per still: opts { topic, k } -> POSE_SHEET[k] of scenes/<topic>.js ([label, cast key, pose, face, seat]).
// Neutral studio: grey floor, soft key + fill, 3/4 front camera, full body. Tiled by tools/posesheet.py.
import * as THREE from 'three';
import { stage } from '../engine/act.js';
import { GRADE } from '../engine/look.js';

export async function build({ scene, W, H, opts = {} }) {
  const M = await import(`./${opts.topic || 'do_overs'}.js`), [label, key, pose, emo, seat] = M.POSE_SHEET[opts.k || 0];
  scene.background = new THREE.Color('#5b616b');
  const hemi = new THREE.HemisphereLight('#dfe8f5', '#4a4640', 1.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff3e2', 2.6); sun.position.set(2.5, 5, 4); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 }); scene.add(sun);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: '#8a8f96', roughness: .9 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const top = seat === 'bed' ? .55 : seat === 'seat' ? .5 : 0;
  if (seat) { const b = new THREE.Mesh(new THREE.BoxGeometry(seat === 'bed' ? 2.2 : .6, top, seat === 'bed' ? 1.4 : .5), new THREE.MeshStandardMaterial({ color: seat === 'bed' ? '#d9dbe0' : '#6b5a48', roughness: .8 }));
    b.position.set(seat === 'bed' ? .5 : 0, top / 2, 0); b.receiveShadow = true; scene.add(b); }
  const S = stage(scene, { POSES: M.P });
  const A = await S.actor(key, { emo });
  // lying / bed poses face +x along the bed; everything else faces the camera side
  const ry = pose === 'lieBack' ? Math.PI / 2 : 0;
  A.show(-9, 99).key(0, { pose, at: [pose === 'lieBack' ? 1.4 : 0, 0], ry, y: top }).face(0, emo);
  S.update(1.5);
  const cam = new THREE.PerspectiveCamera(30, W / H, .1, 100);
  if (pose === 'lieBack') { cam.position.set(1.0, 2.6, 3.6); cam.lookAt(.5, .55, 0); }
  else { cam.position.set(1.6, 1.25 + top * .5, 4.6); cam.lookAt(0, .9 + top * .4, 0); }
  const post = { ...GRADE.day, sun, aperture: 0, bloom: 0, volume: 0, focus: 5 };
  return { camera: cam, sun, post, label };
}
