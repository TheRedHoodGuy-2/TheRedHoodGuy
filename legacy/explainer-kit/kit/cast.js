// CAST: ready-to-act characters for Format A videos.
//   const guy = await castMain('guy'), girl = await castMain('girl'), n = await castBlank('m', seed)
// Each returns an actor (kit/actor.js) with .A (the R6 rig). Mains are FINAL as built (Xavier): their painted textures,
// faces (kit/faces.js), hair and 3D details are loaded exactly as approved. Blank NPCs are plain grey placeholders with a
// simple face and no hair, waiting for Xavier's designs (kit/assets/npc_pack/).
import * as THREE from 'three';
import * as RB from './roblox.js';
import { face as mainFace, FACE_SCALE, EYE_K, EYE_C } from './faces.js';
import { faceTex, NPC_FACE } from './facekit.js';
import { actor } from './actor.js';

// blink: same expression with the eyes erased (the skin under the transparent face plane shows through) and closed lids drawn
const blinkCache = new Map();
function blinkOf(tex, ink = '#1d1512') {
  if (tex.userData && tex.userData.noBlink) return tex;   // photo faces: no drawn blink
  if (blinkCache.has(tex)) return blinkCache.get(tex);
  const src = tex.image, c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'), k = c.width / 512, s = FACE_SCALE * EYE_K;
  g.drawImage(src, 0, 0); g.save(); g.scale(k, k); g.globalCompositeOperation = 'destination-out';
  for (const [x, y] of EYE_C) { g.beginPath(); g.ellipse(x, y + 2, 36 * s, 45 * s, 0, 0, 7); g.fill(); }   // eyes only (brows sit higher, kept)
  g.globalCompositeOperation = 'source-over'; g.strokeStyle = ink; g.lineCap = 'round'; g.lineWidth = 8.5 * s;
  for (const [x, y] of EYE_C) { g.beginPath(); g.moveTo(x - 21 * s, y + 2); g.quadraticCurveTo(x, y + 11 * s, x + 21 * s, y + 2); g.stroke(); }
  g.restore(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; blinkCache.set(tex, t); return t;
}

export async function castMain(who, { seed } = {}) {
  const sex = who === 'girl' ? 'f' : 'm';
  const A = sex === 'f' ? await RB.loadFemale({ hairColor: 0x161214 }) : await RB.loadMale();
  await RB.skin(A, `kit/assets/avatar_tex/${sex === 'f' ? 'female' : 'male'}.png`);
  RB.dress(A, {}, { getFace: mainFace, face: 'neutral', sex, skipBody: true });
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f4f1, roughness: .55 }), sole = new THREE.MeshStandardMaterial({ color: 0x3e4046, roughness: .8 });
  if (sex === 'm') {
    const red = RB.photoMat('red', 1.5), rib = RB.photoMat('red', 3, { color: 0xd8d8d8 }), dd = RB.photoMat('denim_dark', 1.5);
    RB.details(A, [{ type: 'hood2', mat: red }, { type: 'ring', part: 'armL', f0: .25, f1: .34, g: .012, mat: rib }, { type: 'ring', part: 'armR', f0: .25, f1: .34, g: .012, mat: rib },
      { type: 'ring', part: 'legL', f0: .2, f1: .265, g: .009, mat: dd }, { type: 'ring', part: 'legR', f0: .2, f1: .265, g: .009, mat: dd },
      { type: 'toe', part: 'legL', f1: .2, mat: white, sole }, { type: 'toe', part: 'legR', f1: .2, mat: white, sole }, { type: 'hair', mesh: await RB.loadSpikyHair(0x18130f), fit: 1.25, lift: .3 }]);
  } else {
    const dl = RB.photoMat('denim_light', 1.5);
    RB.details(A, [{ type: 'ring', part: 'legL', f0: .72, f1: .79, g: .01, mat: dl }, { type: 'ring', part: 'legR', f0: .72, f1: .79, g: .01, mat: dl },
      { type: 'toe', part: 'legL', f1: .14, mat: white, sole }, { type: 'toe', part: 'legR', f1: .14, mat: white, sole }]);
  }
  const getFace = n => mainFace(n, sex);
  return actor(A, { seed: seed ?? (sex === 'f' ? 7 : 3), getFace, blinkFace: n => blinkOf(getFace(n)) });
}

// blank NPC: plain grey (lighter top, darker legs), simple face, no hair
let blankTex = null;
async function blankSkin() {
  if (blankTex) return blankTex;
  const L = await RB.layout(), S = 512, k = S / L.size[0], c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  g.fillStyle = '#cfd3d9'; g.fillRect(0, 0, S, S);
  for (const part of ['legL', 'legR']) for (const f in L.parts[part]) { const [x, y, w, h] = L.parts[part][f].map(v => v * k); g.fillStyle = '#9aa1ab'; g.fillRect(x, y, w, h); }
  for (const f in L.parts.torso) { const [x, y, w, h] = L.parts.torso[f].map(v => v * k); g.fillStyle = '#b9bec6'; g.fillRect(x, y, w, h); }
  blankTex = new THREE.CanvasTexture(c); return blankTex;
}
export async function castBlank(sex = 'm', seed = 1) {
  const A = sex === 'f' ? await RB.loadFemale({ hair: false }) : await RB.loadMale();
  await RB.skin(A, await blankSkin());
  const getFace = n => faceTex(n, { style: 'classic', sex, ...NPC_FACE });
  RB.dress(A, {}, { getFace, face: 'neutral', sex, skipBody: true });
  return actor(A, { seed: 100 + seed, getFace, blinkFace: n => blinkOf(getFace(n), '#1d1512') });
}

// NPC from Xavier's NPC Creator design (kit/assets/npc_pack/<id>/spec.json, pulled from the creator's `npcs` store).
// Built exactly as npc_creator.html rebuildOnce() does it. Uploaded images (spec.img.*) live next to the spec as <key>.png.
export async function castNpc(id, { seed = 1, mainFaces = false } = {}) {
  const dir = `kit/assets/npc_pack/${id}/`, d = await (await fetch(new URL(dir + 'spec.json', document.baseURI))).json();
  return castSpec(d, { seed, dir, mainFaces });
}
// any NPC Creator-shaped spec object (from the pack, or generated: kit/students.js). faceScale shrinks the drawn face
// (classic NPC faces drawn at the mains' size read huge on the R6 head; students use ~.8).
// mainFaces: draw the face with the mains' own approved face set (kit/faces.js) instead of the face kit (Xavier 2026-11-12:
// NPC faces must look as right on the head as the mains').
export async function castSpec(d, { seed = 1, dir = '', faceScale = 1, mainFaces = false } = {}) {
  const CL = await import('./clothing.js'), HR = await import('./hair.js');
  const img = k => d.img && d.img[k] ? new URL(dir + k + '.png', document.baseURI).href : null;
  const loadImg = src => new Promise((ok, no) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = no; i.src = src; });
  const keyed = async k => { const u = img(k); if (!u) return null; const im = await loadImg(u); return d.key && d.key.on ? CL.keyOut(im, d.key.color) : im; };
  const A = d.sex === 'f' ? await RB.loadFemale({ hair: false }) : await RB.loadMale();
  const faceImg = img('faceImg') ? new THREE.CanvasTexture(await loadImg(img('faceImg'))) : null; if (faceImg) faceImg.colorSpace = THREE.SRGBColorSpace;
  const getFace = n => faceImg || (mainFaces ? mainFace(n, d.sex) : faceTex(n, { style: d.face, sex: d.sex, ...NPC_FACE, ...(faceScale !== 1 ? { scale: 1.4 * faceScale } : {}) }));
  RB.dress(A, {}, { getFace, face: d.expr || 'neutral', sex: d.sex, skipBody: true });
  let shirt = null;
  if (d.shirt.mode === 'build') shirt = await CL.buildShirt({ color: d.shirt.color, fabric: d.shirt.fabric || null, sleeves: d.shirt.sleeves, neck: d.shirt.neck, cuffs: d.shirt.cuffs, hem: d.shirt.cuffs, print: await keyed('print'), back: await keyed('backPrint') });
  else if (d.shirt.mode === 'upload') shirt = await keyed('shirt');
  let pants = await keyed('pants');
  if (d.pants.mode !== 'upload') { const c = document.createElement('canvas'); c.width = 585; c.height = 559; const g = c.getContext('2d'); g.fillStyle = d.pants.color; g.fillRect(0, 0, 585, 559);
    if (d.pants.fabric) { const f = await loadImg(new URL(`kit/assets/fabric/${d.pants.fabric}.jpg`, document.baseURI).href); g.save(); g.filter = 'grayscale(1) contrast(1.6)'; g.globalCompositeOperation = 'overlay'; g.globalAlpha = .55; const t = document.createElement('canvas'); t.width = t.height = 200; t.getContext('2d').drawImage(f, 0, 0, 200, 200); g.fillStyle = g.createPattern(t, 'repeat'); g.fillRect(0, 0, 585, 559); g.restore(); }
    pants = c; }
  const shading = d.shading.mode === 'auto' ? 'auto' : d.shading.mode === 'upload' && img('shading') ? img('shading') : null;
  await RB.skin(A, await CL.dressTexture({ base: img('skinTex'), skin: d.skin, shirt, pants, shading }));
  if (d.hair !== 'none' && HR.STYLES[d.hair]) await HR.putHair(A, d.hair, new THREE.Color(d.hairColor).getHex(), { partBoxes: RB.partBoxes });
  A.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  A.spec = d;
  return actor(A, { seed: 200 + seed, getFace, blinkFace: n => mainFaces ? blinkOf(getFace(n)) : blinkOf(getFace(n), '#1d1512') });
}

// GHOST: turn an actor see-through and glowing (pale cyan), keeping its face readable. Returns set(opacity 0..1).
export function ghostify(act, { color = 0xcff2ff, glow = 0x5fc8f0, opacity = .82, haloOp = .5 } = {}) {
  const mats = [];
  act.A.root.traverse(o => { if (!o.isMesh) return; const face = o.renderOrder === 2;
    o.material = [].concat(o.material).map(m => { const g = m.clone(); g.transparent = true; g.depthWrite = false;
      // keeps its own Roblox texture (it should still read as the same blocky avatar), washed pale cyan with a soft glow
      if (!face) { g.color = new THREE.Color(color); if ('emissive' in g) { g.emissive = new THREE.Color(glow); g.emissiveIntensity = .35; } g.roughness = 1; g.metalness = 0; }
      g.userData.base = face ? 1 : opacity; mats.push(g); return g; });
    if (Array.isArray(o.material) && o.material.length === 1) o.material = o.material[0];
    o.castShadow = false; o.renderOrder = face ? 6 : 5; });
  // soft halo behind him
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64);
  gr.addColorStop(0, 'rgba(170,235,255,.55)'); gr.addColorStop(1, 'rgba(170,235,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(1.6, 2.4, 1); halo.position.set(0, .95, -.1); halo.renderOrder = 4; act.A.root.add(halo); mats.push(halo.material); halo.material.userData.base = haloOp;
  return op => { for (const m of mats) m.opacity = m.userData.base * op; };
}
