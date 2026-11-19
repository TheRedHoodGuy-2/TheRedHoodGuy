// THE CAST (library/cast.json): one makeActor(key) for every video, so a character is always the same person.
// shadowOf(actor or spec, { kind: 'floor' | 'wall' }) -> a flat black copy that can be posed / walked on its own
// (the shadow is a real posed R6 squashed flat, so its silhouette is exact: hood, ponytail, pose).
import * as THREE from 'three';
import { makeR6 } from './r6.js';
import { poseRig } from './rig.js';
import { faceSpec, loadClassic } from './faceset.js';
let BANK = null, CAST = null;
const getJ = async p => (await fetch(new URL(p, document.baseURI))).json();
export async function loadCast() { if (!BANK) { BANK = Object.fromEntries((await getJ('library/characters.json')).map(c => [c.id, c])); CAST = await getJ('library/cast.json'); await loadClassic(); } return { BANK, CAST }; }
export async function specOf(key, { emo = 'neutral', face = true } = {}) {
  await loadCast(); const K = CAST[key] || { base: key }, c = { ...BANK[K.base], ...K };
  let fs; if (face && String(c.faceSet).startsWith('alti')) { await loadAlti(); fs = { faceSprite: { layers: altiLayers(emo), place: ALTI_PLACE } }; }
  else fs = face ? faceSpec(c.faceSet, emo, null, c.sex) : { face: false }; delete fs._classicIdx;
  return { res: 1024, skin: c.skin, sex: c.sex, hair: c.hair, accessories: (c.accessories || []).filter(i => ![11884330, 4197739997, 301820310].includes(i)), ...(c.hairTint ? { hairTint: c.hairTint } : {}),
    shirt: c.shirtTex || `assets/roblox/${c.shirt}/texture.png`, pants: (K.pants ? `assets/roblox/${K.pants}/texture.png` : (c.pantsTex || `assets/roblox/${c.pants}/texture.png`)), ...fs, _wear: K.wear || [], _c: c };
}
export async function makeActor(key, o = {}) {
  const sp = await specOf(key, o), a = await makeR6(sp);
  for (const [id, tint] of sp._wear) await a.wear(id, { tint }).catch(e => console.error('BADWEAR', id, String(e).slice(0, 80)));
  a.key = key; a.char = sp._c; a.rig = poseRig(a); return a;
}
const INK = new THREE.MeshBasicMaterial({ color: '#2b2724' });   // opaque: overlapping parts never stack darker
// a shadow actor: same body + clothes + hair, every material flat dark, squashed onto a floor or a wall
export async function shadowOf(key, { kind = 'floor' } = {}) {
  const a = await makeActor(key, { face: false });
  a.root.traverse(o => { if (o.isMesh) { o.material = INK; o.castShadow = o.receiveShadow = false; o.renderOrder = 2; } });
  const g = new THREE.Group(), flat = new THREE.Group(); flat.add(a.root); g.add(flat);
  if (kind === 'floor') { flat.rotation.x = -Math.PI / 2; flat.scale.set(1, 1, .02); flat.position.y = .012; }   // lying behind the feet, head away from the light
  else { flat.scale.set(1, 1, .02); }                                                                              // flat against a wall (place g on the wall)
  a.shadowGroup = g; a.flat = flat; return a;
}

// FOOTWEAR SPLIT (2026-11-19): a catalog skate / shoe pair made for layered feet is split down the middle and each half
// rides on its own R6 leg block, so it swings with the leg (the layered fit stretched it over the whole legs).
// Returns the height the wheels add (lift the actor's root by it so the wheels sit on the ground).
export async function wearFeet(actor, id, { sink = .12 } = {}) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const base = new URL(`assets/roblox/${id}/`, document.baseURI).href, meta = await (await fetch(base + 'meta.json')).json(), p = meta.parts[0];
  const g = await new GLTFLoader().loadAsync(base + p.file); let mesh = null; g.scene.traverse(o => { if (o.isMesh && !mesh) mesh = o; });
  const tex = await new THREE.TextureLoader().loadAsync(base + (p.texture || 'texture.png')); tex.colorSpace = THREE.SRGBColorSpace; tex.flipY = false;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: .55, side: THREE.DoubleSide }), geo = mesh.geometry.toNonIndexed(); geo.computeVertexNormals();
  const [lo, hi] = p.bounds, cy = (lo[1] + hi[1]) / 2, h = (hi[1] - lo[1]) * 1.3;
  for (const [leg, side] of [['legL', 1], ['legR', -1]]) {
    const src = geo.attributes, keep = [];
    for (let t = 0; t < src.position.count; t += 3) { const x = (src.position.getX(t) + src.position.getX(t + 1) + src.position.getX(t + 2)) / 3; if (Math.sign(x) === side) keep.push(t); }
    const half = new THREE.BufferGeometry();
    for (const k of Object.keys(src)) { const a = src[k], arr = new Float32Array(keep.length * 3 * a.itemSize); keep.forEach((t, i) => { for (let j = 0; j < 3 * a.itemSize; j++) arr[i * 3 * a.itemSize + j] = a.array[t * a.itemSize + j]; }); half.setAttribute(k, new THREE.BufferAttribute(arr, a.itemSize)); }
    half.translate(-side * .5, -cy, 0); half.scale(1.5, 1.3, 1.5);   // each skate centred under its own leg, sized to the R6 foot block (they are made for slim R15 feet)
    const m = new THREE.Mesh(half, mat); m.castShadow = true; m.position.set(0, -1 - h / 2 + sink, 0);   // studs, leg-part local: boot round the foot, wheels below
    actor.rig.parts[leg].add(m);
  }
  return (h - sink) * .34 - .02;
}

// ALTIWYRE FACE (Xavier 2026-11-19: the boy wears an AltiWyre-pack face, not our AI faces). library/alti_face.json maps
// names -> decal files (assets/faces/packs/alti, 1000 px full-face layers: eyes pair, brows pair, mouth).
// EXPR: emotion -> [eyes, brows, mouth]. altiLayers(emo, { talk: 0|1|2, blink }) -> layer urls for api.faceNow.
let ALTI = null;
export const ALTI_PLACE = { k: 1.06, dy: .085 };
export async function loadAlti() { if (!ALTI) ALTI = await (await fetch(new URL('library/alti_face.json', document.baseURI))).json(); return ALTI; }
export function altiLayers(emo = 'neutral', { talk = 0, blink = 0 } = {}) {   // goofy round-eye set: [eyes, brows?, mouth]
  const P = 'assets/faces/', L = (ALTI.expr[emo] || ALTI.expr.neutral).slice(), whole = L.length === 1;
  if (talk && !whole) L[L.length - 1] = ALTI.talk[talk];
  if (blink && !whole) L[0] = ALTI.blink;
  return L.map(f => P + f);
}
export async function altiAll() { await loadAlti(); const s = new Set([...Object.values(ALTI.expr).flat(), ...Object.values(ALTI.talk), ALTI.blink]); return [...s].map(f => 'assets/faces/' + f); }
