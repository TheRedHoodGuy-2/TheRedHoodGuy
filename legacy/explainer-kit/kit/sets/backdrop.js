// STUDIO BACKDROP: an endless light-blue cyclorama (floor fades into the sky colour, no horizon), like the plain blue
// "how to" shorts. Bright soft key + fill + rim, contact shadows. A craft table (left) and a round stool (right) are the
// only furniture; topics hide them with refs.table.visible / refs.stool.visible if they don't need them.
import * as THREE from 'three';
import { M, rb, add, grp, cyl } from '../util.js';

export const BLUE = 0xa9d6f5;
export const TABLE = { x: -1.2, z: 0, top: .78 }, STOOL = { x: 1.25, z: .1, top: .62 };

export function buildWorld(scene) {
  const W = grp(0, 0, 0, scene), refs = { group: W };
  scene.background = new THREE.Color(BLUE);
  scene.fog = new THREE.Fog(BLUE, 6, 15);
  // floor: same blue, a touch darker so contact shadows read; fog melts it into the background
  const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 64), new THREE.MeshStandardMaterial({ color: 0x86c4ef, roughness: .95 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; W.add(floor); refs.floor = floor;
  // lights: sky fill, warm key with soft shadows, cool rim from behind, low bounce
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8fbfe3, 1.35));
  const key = new THREE.DirectionalLight(0xfff1e0, 2.4); key.position.set(3.5, 7, 5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -5; key.shadow.camera.right = 5; key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 1; key.shadow.camera.far = 20; key.shadow.bias = -.0004; key.shadow.normalBias = .02; key.shadow.radius = 4; scene.add(key); refs.key = key;
  const rim = new THREE.DirectionalLight(0xd8ecff, 1.2); rim.position.set(-4, 4, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xe6f2ff, .5); fill.position.set(-5, 2, 4); scene.add(fill);
  // craft table: warm wood top with a rounded edge, white legs, a cutting mat on top
  { const t = grp(TABLE.x, 0, TABLE.z, W), wood = M(0xc8925a, { roughness: .55 }), leg = M(0xf2f2ef, { roughness: .5 });
    rb(1.1, .05, .62, wood, 0, TABLE.top - .025, 0, t, .015);
    rb(1.0, .07, .52, M(0xb07d4a, { roughness: .6 }), 0, TABLE.top - .085, 0, t, .01);
    for (const [x, z] of [[-.5, -.26], [.5, -.26], [-.5, .26], [.5, .26]]) rb(.05, TABLE.top - .05, .05, leg, x, (TABLE.top - .05) / 2, z, t, .01);
    const mat = rb(.62, .004, .42, M(0x2f8f6a, { roughness: .8 }), .05, TABLE.top + .002, .02, t, .002); mat.receiveShadow = true;
    // grid lines on the cutting mat
    const lines = new THREE.Group(); t.add(lines); const lm = M(0x7fd0ae, { roughness: .8 });
    for (let i = 1; i < 12; i++) add(new THREE.BoxGeometry(.0015, .0006, .41), lm, -.26 + i * .05 + .05 - .05, TABLE.top + .0045, .02, lines, { shadow: false });
    for (let i = 1; i < 8; i++) add(new THREE.BoxGeometry(.61, .0006, .0015), lm, .05, TABLE.top + .0045, -.18 + i * .05, lines, { shadow: false });
    refs.table = t; }
  // round stool for the candy bucket
  { const s = grp(STOOL.x, 0, STOOL.z, W), wood = M(0xb9844f, { roughness: .55 }), legM = M(0x3a3f47, { roughness: .4, metalness: .5 });
    add(cyl(.2, .2, .04, 40), wood, 0, STOOL.top - .02, 0, s); add(new THREE.TorusGeometry(.2, .012, 8, 40).rotateX(Math.PI / 2), wood, 0, STOOL.top - .02, 0, s);
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + .4, l = add(cyl(.013, .016, STOOL.top - .04, 10), legM, Math.cos(a) * .14, (STOOL.top - .04) / 2, Math.sin(a) * .14, s); l.rotation.set(Math.sin(a) * .12, 0, -Math.cos(a) * .12); }
    add(new THREE.TorusGeometry(.13, .008, 8, 32).rotateX(Math.PI / 2), legM, 0, .22, 0, s);
    refs.stool = s; }
  return refs;
}
