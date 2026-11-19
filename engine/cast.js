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
  const fs = face ? faceSpec(c.faceSet, emo, null, c.sex) : { face: false }; delete fs._classicIdx;
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
