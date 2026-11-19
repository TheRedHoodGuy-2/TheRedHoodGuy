// CLASSROOM review scene (2026-11-19): the new classroom set with a class picked from the character bank.
// opts.view: 'back' | 'front' | 'side' | 'desk' | 'teacher' | 'empty' ; opts.noCast for the bare set.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { classroom, W, D, H } from '../engine/sets/classroom.js';
import { makeR6 } from '../engine/r6.js';
import { poseRig } from '../engine/rig.js';
import { faceSpec, loadClassic } from '../engine/faceset.js';

// the class: 22 students from the bank (teens), 3 desks left empty, and the teacher (a bank adult)
export const CLASS = ['m000', 'f001', 'm002', 'f002', 'm003', 'f005', 'm004', 'f006', 'm005', 'f007', 'm013', 'f013', 'm014', 'f015', 'm015', 'f016', 'm016', 'f017', 'm019', 'f019', 'm020', 'f020'];
export const TEACHER = 'f010';
const EMPTY = new Set([4, 18, 22]);   // seat indices with nobody (a real class is never full)
// seated poses (asymmetric, each a different person; R6 limbs are rigid so arms rest ON the desk, not into it)
const SIT = [
  { legL: [.08, 0, 1], legR: [-.1, 0, 1], armL: [.05, -.12, .99], armR: [-.12, -.1, .99], head: [0, -.06, 0] },                       // listening, forearms on the desk
  { legL: [.15, 0, 1], legR: [-.04, 0, 1], armL: [.08, -.12, .99], armR: [-.1, .35, .94], head: [-.12, .08, -.2], root: { rz: -.05 } },      // chin on the right hand, bored
  { legL: [.04, 0, 1], legR: [-.14, 0, 1], armL: [.2, -.9, .1], armR: [-.05, -.12, .99], head: [.1, -.18, .04], root: { rz: .03 } },        // writing, left arm hanging
  { legL: [.1, 0, 1], legR: [-.18, 0, 1], armL: [.1, -.95, .05], armR: [-.1, -.95, .05], head: [.18, .05, .05], root: { rx: -.06 } },  // leaning back, arms down, looking aside
  { legL: [.06, 0, 1], legR: [-.06, 0, 1], armL: [.1, -.12, .99], armR: [-.1, -.12, .99], head: [-.25, 0, -.05], root: { ry: -.12 } },   // turned to the neighbour
];
export async function build({ scene, W: w, H: h, opts = {} }) {
  RectAreaLightUniformsLib.init();
  const view = opts.view || 'back';
  const C = await classroom(scene, { hide: opts.hide || hideFor(view) }); globalThis.CLASS_DBG = { C, people: [] };
  const bank = Object.fromEntries((await (await fetch(new URL('library/characters.json', document.baseURI))).json()).map(c => [c.id, c]));
  await loadClassic();
  const spec = c => ({ res: 1024, skin: c.skin, ...(c.faceSet ? faceSpec(c.faceSet, (opts.emo || {})[c.id] || 'neutral', null, c.sex) : { face: false }), sex: c.sex, hair: c.hair, accessories: c.accessories, ...(c.hairTint ? { hairTint: c.hairTint } : {}),
    shirt: c.shirtTex || `assets/roblox/${c.shirt}/texture.png`, pants: c.pantsTex || `assets/roblox/${c.pants}/texture.png` });
  if (!opts.noCast) {
    let k = 0;
    for (const [i, s] of C.seats.entries()) {
      if (EMPTY.has(i) || k >= CLASS.length) continue; const c = bank[CLASS[k++]];
      const a = await makeR6(spec(c)), A = poseRig(a), p = SIT[(i * 7 + 3) % SIT.length];
      A.pose({ ...p, root: { ...(p.root || {}), y: s.seatTop + .17 - .68 + .025 } });   // thighs rest ON the seat (clip check: points sank 1-2 cm)
      const holder = new THREE.Group(); holder.add(a.root); holder.position.set(s.x, 0, s.z - .02); holder.rotation.y = Math.PI; scene.add(holder); globalThis.CLASS_DBG.people.push({ seat: i, a });
    }
    const t = bank[TEACHER], ta = await makeR6(spec(t)), TA = poseRig(ta);
    TA.pose({ armL: [.25, -.6, .75], armR: [-.1, -1, .05], head: [.1, -.04, .03], root: { rz: .02 } });   // teaching: left hand out toward the board, the other relaxed
    ta.root.position.copy(C.teacherSpot); ta.root.rotation.y = .25; scene.add(ta.root);
  }
  const V = {   // [camera, look, fov]: long lens from high over the heads (studio rule)
    back: [[-2.6, 2.75, D / 2 - .6], [.6, 1.3, -D / 2 + 1.5], 44], front: [[2.0, 2.6, -D / 2 + .5], [-.8, 1.0, 3], 46],
    side: [[W / 2 - .6, 2.6, 4.8], [-2.5, 1.1, -2.5], 42], desk: [[-.9, 2.1, 2.6], [.4, 1.3, -1.6], 38],
    teacher: [[-4.6, 2.5, -4.4], [2.6, 1.3, -5.6], 44], calib: [[-W / 2 + .4, 1.3, 1.2], [0, 1.0, 1.2], 30], empty: [[-2.6, 2.75, D / 2 - .6], [.6, 1.3, -D / 2 + 1.5], 44], window: [[3.6, 2.4, 2.0], [-5.5, 1.6, 0], 44] }[view];
  const cam = new THREE.PerspectiveCamera(opts.fov || V[2], w / h, .05, 400); cam.position.set(...(opts.camP || V[0])); cam.lookAt(...(opts.camL || V[1]));
  const focusD = cam.position.distanceTo(new THREE.Vector3(...(opts.camL || V[1])));
  return { camera: cam, sun: C.sun, post: { sun: C.sun, volume: 0, focus: focusD * .8, aperture: .8, maxBlur: 2 * w / 540, bloom: .2, bloomRadius: .5, bloomThreshold: 1.8, bloomCap: 2.5,
    exposure: 1.25, contrast: 1.06, saturation: 1.08, black: .02, shadowTint: '#5a7894', highTint: '#ffe0b0', tintAmt: .15, pivot: .42 } };
}
// film-set walls: the wall behind the camera is see-through to the camera (light still uses it)
function hideFor(v) { return { back: ['s'], empty: ['s'], front: ['n'], side: ['e'], desk: ['s'], teacher: [], window: ['e'], calib: ['w'] }[v] || []; }
