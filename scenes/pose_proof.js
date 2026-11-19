// POSE PROOF (2026-11-19): the animation + posing research shown on the R6 rig. Each action twice: STIFF (how I posed
// before: symmetric, straight spine, head dead centre, arms hanging or mirrored) and DYNAMIC (research/animation.md:
// line of action through the whole body, power centre, weight on one leg + contrapposto, no twinning, head goes with the
// body, raised arms slide out of the shoulder, faces match). opts.sil = silhouettes (the readability test).
import * as THREE from 'three';
import { makeR6 } from '../engine/r6.js';
import { poseRig } from '../engine/rig.js';
import { faceSpec, loadClassic } from '../engine/faceset.js';

const UP = (side, k = 1) => ({ r: [side * .02, side * .42, side * 3.05 * 0 + 0], o: [0, 0, 0] });
export const ACTIONS = [
  { name: 'Waving hi', emo: 'happy',
    stiff: { armR: [-.05, 1, 0] },
    dyn: { armR: { r: [3.053, .421, .002], o: [-.057, .252, -.013] }, armL: { r: [.01, 0, .576], o: [.046, -.054, 0] }, legL: { r: [0, 0, .35], o: [.07, -.06, 0] }, legR: { r: [0, 0, -.2], o: [-.04, -.03, 0] }, head: [-.15, -.08, -.18], root: { x: .144, y: .1, rz: .3 } } },
  { name: 'Shocked', emo: 'shocked',
    stiff: { armL: [.5, .8, .2], armR: [-.5, .8, .2] },
    dyn: { armL: { r: [0, .1, 2.6], o: [.25, .2, -.05] }, armR: [-.85, .2, .45], legL: [.12, -1, .3], legR: [-.25, -.95, -.35], head: [.2, -.3, .18], root: { rx: -.26, rz: -.08, ry: .15 } } },
  { name: 'Laughing', emo: 'laugh',
    stiff: { },
    dyn: { armR: [.45, -.55, .7], armL: [.85, -.5, -.15], legL: [.3, -1, .12], legR: [-.06, -1, -.18], head: [-.25, -.42, -.25], root: { rx: -.22, rz: .14, ry: -.1, x: .05 } } },
  { name: 'Angry pointing', emo: 'angry',
    stiff: { armR: [0, 0, 1] },
    dyn: { armL: [.88, .2, .45], armR: [-.35, -.85, -.35], legL: [.3, -1, .35], legR: [-.2, -1, -.3], head: [.35, .12, .08], root: { rx: .16, ry: -.15, rz: .08 } } },
  { name: 'Sad', emo: 'sad',
    stiff: { head: [0, .25, 0] },
    dyn: { armL: [-.05, -1, .15], armR: [.6, -.7, .4], legL: [.03, -1, .02], legR: [-.14, -.92, .32], head: [.25, .45, .25], root: { rx: .15, rz: -.1, ry: -.35, y: -.04 } } },
  { name: 'Scared', emo: 'scared',
    stiff: { armL: [.2, .5, .8], armR: [-.2, .5, .8] },
    dyn: { armL: [-.1, .75, .65], armR: [-.75, .35, .55], legL: [.3, -.85, .5], legR: [-.15, -1, -.3], head: [.45, .1, .25], root: { rx: -.18, rz: .15, ry: .5, x: -.1 } } },
  { name: 'Cheering', emo: 'excited',
    stiff: { armL: [.45, 1, .15], armR: [-.45, 1, .15], legL: [.25, -1, 0], legR: [-.25, -1, 0] },
    dyn: { armR: { r: [3.0, .38, .1], o: [-.06, .24, -.01] }, armL: [.75, -.45, .35], legL: { r: [-.55, 0, .15], o: [.05, .08, 0] }, legR: { r: [.2, 0, -.15], o: [-.02, -.02, 0] }, head: [-.25, -.35, -.22], root: { y: .18, rx: -.1, rz: .22, x: .1 } } },
  { name: 'Thinking (head scratch)', emo: 'thinking',
    stiff: { armR: [-.1, .55, .85] },
    dyn: { armR: { r: [2.75, .1, -.55], o: [-.02, .16, 0] }, armL: [.3, -.95, .05], legL: [.02, -1, 0], legR: [-.3, -1, .25], head: [-.2, -.25, .3], root: { rz: -.1, ry: .1, x: .06 } } },
];
export async function build({ scene, W: w, H: h, opts = {} }) {
  await loadClassic();
  scene.background = new THREE.Color(opts.sil ? '#ffffff' : '#dfe3e8');
  const bank = Object.fromEntries((await (await fetch(new URL('library/characters.json', document.baseURI))).json()).map(c => [c.id, c]));
  const c = bank[opts.who || 'm005'];
  const spec = (face) => ({ res: 1024, skin: c.skin, sex: c.sex, hair: c.hair, accessories: c.accessories.filter(i => ![11884330, 4197739997, 301820310].includes(i)), ...(c.hairTint ? { hairTint: c.hairTint } : {}),
    shirt: c.shirtTex || `assets/roblox/${c.shirt}/texture.png`, pants: c.pantsTex || `assets/roblox/${c.pants}/texture.png`, ...face });
  const cells = []; ACTIONS.forEach(A => { cells.push([A, 'stiff']); cells.push([A, 'dyn']); });
  const [A, kind] = cells[opts.k || 0];
  const fs = faceSpec('ai:05_intimidating', kind === 'stiff' ? 'neutral' : A.emo, null, 'm'); delete fs._classicIdx;
  const a = await makeR6(spec(fs)); poseRig(a).pose(opts.pose || A[kind]); a.root.rotation.y += opts.ry ?? .5; scene.add(a.root);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.MeshStandardMaterial({ color: opts.sil ? '#ffffff' : '#c9ced6', roughness: .9 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  if (opts.sil) scene.traverse(o => { if (o.isMesh && o !== floor) o.material = new THREE.MeshBasicMaterial({ color: '#111' }); });
  const cam = new THREE.PerspectiveCamera(30, w / h, .05, 100); cam.position.set(0, 1.45, 7.2); cam.lookAt(0, 1.25, 0);
  const sun = new THREE.DirectionalLight('#fff4e6', opts.sil ? 0 : 3.2); sun.position.set(3, 6, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 4, bottom: -1, near: .1, far: 20 }); scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight('#eef4ff', '#9a8f80', opts.sil ? 3 : 1.4));
  globalThis.POSE_LAYOUT = { n: cells.length, names: cells.map(([A, k]) => `${A.name}: ${k}`) };
  return { camera: cam, sun, post: { sun, volume: 0, aperture: 0, bloom: 0, exposure: 1.1, contrast: 1.04, saturation: 1.0, grain: 0, ca: 0 } };
}
