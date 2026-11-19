// Imported R6 avatars (Xavier's supplied rigs, see kit/assets/roblox_src/*/license.txt for credits).
// loadMale() / loadFemale({ hair }) -> { root, bones, tPose(), pose(name, w) }   root is 1.7 m tall, feet on y = 0, facing +z.
// Bone axes differ per rig, so poses are applied in WORLD space ("point this limb that way"), not as raw local angles.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const SRC = 'kit/assets/roblox_src/';
const url = p => new URL(SRC + p, document.baseURI).href;
const tex = async p => { const t = await new THREE.TextureLoader().loadAsync(url(p)); t.colorSpace = THREE.SRGBColorSpace; t.flipY = true; return t; };
const norm = s => s.toLowerCase().replace(/[^a-z]/g, '');

// wrap a loaded model: scale to 1.7 m, feet on the floor, centred; find the six limb bones + their tips
function wrap(model, faceYaw = 0) {
  const root = new THREE.Group(), inner = new THREE.Group(); root.add(inner); inner.add(model); inner.rotation.y = faceYaw;
  root.updateMatrixWorld(true); let b = new THREE.Box3().setFromObject(model); const s = 1.7 / (b.max.y - b.min.y); model.scale.multiplyScalar(s);
  root.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(model);
  model.position.y -= b.min.y; const c = new THREE.Vector3(); b.getCenter(c); model.position.x -= c.x; model.position.z -= c.z;
  // the model's local transform folded with scale: position is in parent units, so redo after scaling
  root.updateMatrixWorld(true);
  const find = (...keys) => { let hit = null; model.traverse(n => { if (!hit && n.isBone && keys.some(k => norm(n.name).startsWith(k)) && !norm(n.name).includes('end')) hit = n; }); return hit; };
  const bones = { torso: find('torso'), head: find('head'), armL: find('leftarm'), armR: find('rightarm'), legL: find('leftleg'), legR: find('rightleg') };
  const tip = b => b && (b.children.find(c => c.isBone) || null);
  const rest = new Map(); model.traverse(n => { if (n.isBone) rest.set(n, n.quaternion.clone()); });
  model.traverse(n => { if (n.isMesh) { n.castShadow = n.receiveShadow = true; n.frustumCulled = false; } });
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), qW = new THREE.Quaternion(), qP = new THREE.Quaternion();
  // rotate bone so the direction (bone -> its tip) points along `dir` (world space)
  function aim(bone, dir, w = 1) {
    const t = tip(bone); if (!bone || !t) return;
    root.updateMatrixWorld(true); bone.getWorldPosition(tmp); t.getWorldPosition(tmp2);
    const cur = tmp2.sub(tmp).normalize(), want = dir.clone().normalize(), q = new THREE.Quaternion().setFromUnitVectors(cur, want);
    if (w < 1) q.slerp(new THREE.Quaternion(), 1 - w);
    bone.getWorldQuaternion(qW); bone.parent.getWorldQuaternion(qP);
    bone.quaternion.copy(qP.invert().multiply(q.multiply(qW)));
  }
  // rotate a limb by the rotation that takes `from` to `to` (world directions), pivoting about world point `pivot`
  // (R6 rigs put bones in odd places, so we pivot about the real shoulder / hip instead of the bone origin)
  function swing(bone, from, to, pivot, w = 1) {
    if (!bone) return; root.updateMatrixWorld(true);
    const q = new THREE.Quaternion().setFromUnitVectors(from.clone().normalize(), to.clone().normalize()); if (w < 1) q.slerp(new THREE.Quaternion(), 1 - w);
    bone.getWorldQuaternion(qW); bone.parent.getWorldQuaternion(qP);
    const bw = bone.getWorldPosition(new THREE.Vector3()), nw = bw.clone().sub(pivot).applyQuaternion(q).add(pivot);
    bone.quaternion.copy(qP.clone().invert().multiply(q.clone().multiply(qW)));
    bone.position.copy(bone.parent.worldToLocal(nw));
  }
  const restPos = new Map(); model.traverse(n => { if (n.isBone) restPos.set(n, n.position.clone()); });
  // R6 proportions (height 5 units: legs 2, torso 2, head 1); shoulder pivot sits half an arm-width below the torso top
  const H = 1.7, U = H / 5, SHOULDER_Y = 4 * U - U / 2, HIP_Y = 2 * U - U / 2;
  const toWorldDir = v => v.applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));
  const limbPivot = (bone, y) => { root.updateMatrixWorld(true); const lp = root.worldToLocal(bone.getWorldPosition(new THREE.Vector3())); return root.localToWorld(new THREE.Vector3(lp.x, y, lp.z)); };
  const api = {
    root, model, bones,
    reset() { for (const [b, q] of rest) b.quaternion.copy(q); for (const [b, p] of restPos) b.position.copy(p); },
    // swing a limb from hanging straight down to point along `dir` (in the avatar's own frame: +x = its left, +y up, +z forward)
    limb(name, dir, w = 1) {
      const b = bones[name]; if (!b) return; const arm = name.startsWith('arm');
      swing(b, toWorldDir(new THREE.Vector3(0, -1, 0)), toWorldDir(dir.clone()), limbPivot(b, arm ? SHOULDER_Y : HIP_Y), w);
    },
    tPose() { api.reset(); api.limb('armL', new THREE.Vector3(1, 0, 0)); api.limb('armR', new THREE.Vector3(-1, 0, 0)); },
    // turn the head about the neck (radians, avatar frame): yaw = look left/right, pitch = nod (+ = down), roll = tilt
    head(yaw = 0, pitch = 0, roll = 0) {
      const b = bones.head; if (!b) return; root.updateMatrixWorld(true);
      const qr = root.getWorldQuaternion(new THREE.Quaternion()), ql = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, 'YXZ'));
      const q = qr.clone().multiply(ql).multiply(qr.clone().invert()), pivot = root.localToWorld(new THREE.Vector3(0, 4 * U, 0));
      b.getWorldQuaternion(qW); b.parent.getWorldQuaternion(qP);
      const bw = b.getWorldPosition(new THREE.Vector3()), nw = bw.clone().sub(pivot).applyQuaternion(q).add(pivot);
      b.quaternion.copy(qP.clone().invert().multiply(q.clone().multiply(qW))); b.position.copy(b.parent.worldToLocal(nw));
    },
    // FREE PART TRANSFORM (pose editor v2): rotate a part by rotation vector r (axis * angle, radians, avatar frame) about
    // its pivot (default shoulder / hip / neck, shifted by p metres), then move it by o metres (detached from the pivot).
    part(name, { r = [0, 0, 0], p = [0, 0, 0], o = [0, 0, 0] } = {}) {
      const b = bones[name]; if (!b) return; root.updateMatrixWorld(true);
      const ang = Math.hypot(r[0], r[1], r[2]), ql = ang > 1e-7 ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(r[0] / ang, r[1] / ang, r[2] / ang), ang) : new THREE.Quaternion();
      const qr = root.getWorldQuaternion(new THREE.Quaternion()), q = qr.clone().multiply(ql).multiply(qr.clone().invert());
      const pivot = root.localToWorld(api.pivot(name).add(new THREE.Vector3(p[0], p[1], p[2])));
      b.getWorldQuaternion(qW); b.parent.getWorldQuaternion(qP);
      const nw = b.getWorldPosition(new THREE.Vector3()).sub(pivot).applyQuaternion(q).add(pivot);
      if (o[0] || o[1] || o[2]) nw.add(new THREE.Vector3(o[0], o[1], o[2]).applyQuaternion(qr));
      b.quaternion.copy(qP.clone().invert().multiply(q.clone().multiply(qW))); b.position.copy(b.parent.worldToLocal(nw));
    },
    // default pivot of a part in the avatar's own frame (a fresh copy)
    pivot(name) { return (PIV[name] || new THREE.Vector3(0, 4 * U, 0)).clone(); },
    aim, tip,
  };
  const PIV = {};
  // these rigs rest in a T-pose: drop both arms to hang at the sides and make THAT the rest pose (UVs, details and
  // limb() all assume hanging arms). Pivot = the arm's lower-inner edge, then lift by the arm's thickness so its top
  // stays level with the shoulder.
  {
    const bx = n => { const b = new THREE.Box3(); root.updateMatrixWorld(true); model.traverse(m => { if (!m.isSkinnedMesh) return; const P = m.geometry.attributes.position, SI = m.geometry.attributes.skinIndex, SW = m.geometry.attributes.skinWeight, map = m.skeleton.bones.map(x => partOfName(x.name)), v = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) { let bi = SI.getX(i), bw = SW.getX(i); for (const k of [1, 2, 3]) { const w = SW.getComponent(i, k); if (w > bw) { bw = w; bi = SI.getComponent(i, k); } } if (map[bi] !== n) continue; v.fromBufferAttribute(P, i); m.applyBoneTransform(i, v); b.expandByPoint(root.worldToLocal(m.localToWorld(v))); } }); return b; };
    const tb = bx(0);
    for (const [name, idx] of [['armL', 2], ['armR', 3]]) {
      const bone = bones[name]; if (!bone) continue; const b = bx(idx), sz = b.getSize(new THREE.Vector3());
      if (sz.y > sz.x) continue;                                     // already hanging
      const side = (b.min.x + b.max.x) / 2 > (tb.min.x + tb.max.x) / 2 ? 1 : -1, t = sz.y;
      const pivot = root.localToWorld(new THREE.Vector3(side > 0 ? b.min.x : b.max.x, b.min.y, (b.min.z + b.max.z) / 2));
      swing(bone, new THREE.Vector3(side, 0, 0), new THREE.Vector3(0, -1, 0), pivot);
      root.updateMatrixWorld(true); const wp = bone.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(side * 0, t, 0)); bone.position.copy(bone.parent.worldToLocal(wp));
    }
    root.updateMatrixWorld(true);
    model.traverse(n => { if (n.isBone) { rest.set(n, n.quaternion.clone()); restPos.set(n, n.position.clone()); } });
  }
  // rest pivots (root-local): shoulders / hips where limb() swings them, neck for the head
  root.updateMatrixWorld(true);
  for (const [n, y] of [['armL', SHOULDER_Y], ['armR', SHOULDER_Y], ['legL', HIP_Y], ['legR', HIP_Y]]) if (bones[n]) { const lp = root.worldToLocal(bones[n].getWorldPosition(new THREE.Vector3())); PIV[n] = new THREE.Vector3(lp.x, y, lp.z); }
  PIV.head = new THREE.Vector3(0, 4 * U, 0);
  return api;
}

export async function loadMale() {
  const g = await new GLTFLoader().loadAsync(url('6910cb06-roblox_r6_rigged/scene.gltf'));
  return wrap(g.scene);
}

// female body (rigged FBX) + its face from the texture atlas; optional hair lifted off the static female model
export async function loadFemale({ hair = true, hairColor = 0x161214 } = {}) {
  const fbx = await new FBXLoader().loadAsync(url('df1cc521-roblox-women-rigged/source/Roblox Women Rigged.fbx'));
  fbx.traverse(n => { if (n.isMesh) n.material = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: .6 }); });
  const A = wrap(fbx);
  if (hair) {
    // the static model is an OBJ with named groups: Handle1 = hair, RobloxR6Female6 = head, ...5 = torso
    const obj = await new OBJLoader().loadAsync(url('8e445034-roblox-r6-female-rig/source/roblox R6 female rig.obj'));
    const hm = obj.children.find(c => c.name === 'Handle1');
    // map OBJ space -> rig space using the body (everything but the hair): both are 1.7 m tall once scaled, centred in x/z,
    // and the hair keeps its offset from the top-centre of the head
    const body = new THREE.Box3(); obj.children.forEach(c => { if (c !== hm) body.expandByObject(c); });
    const s = 1.7 / (body.max.y - body.min.y), top = new THREE.Vector3((body.min.x + body.max.x) / 2, body.max.y, (body.min.z + body.max.z) / 2);
    hm.material = new THREE.MeshStandardMaterial({ color: hairColor, roughness: .5 });
    const hairObj = new THREE.Group(); hairObj.add(hm); hm.position.sub(top);
    hairObj.scale.setScalar(s); hairObj.position.set(0, 1.7, 0); hairObj.rotation.y = Math.PI;   // the OBJ faces the other way A.root.add(hairObj); A.root.updateMatrixWorld(true);
    A.bones.head.attach(hairObj);   // keep world placement, follow the head from now on
    A.hair = hairObj;
  }
  return A;
}

// ---------------------------------------------------------------------------------------------------------------
// OUTFITS: colour the blocky body per part with crisp bands (a sleeve that stops 3/4 of the way down, shoes on the
// bottom of the legs...). Done in the shader from the bind-pose position + the dominant bone, so the boxes split cleanly
// even though each limb is only a handful of vertices. Their face texture is dropped; our drawn face goes on instead.
// spec = { torso: [c0, t1, c1, t2, c2], head: ..., armL, armR, legL, legR } : colour c0 below fraction t1, c1 up to t2, c2 above
// (fractions run 0 = bottom of the part, 1 = top).
const PARTS = ['torso', 'head', 'armL', 'armR', 'legL', 'legR'];
const partOfName = n => { const k = norm(n); if (k.includes('end')) return -1; if (k.startsWith('torso')) return 0; if (k.startsWith('head')) return 1; if (k.startsWith('leftarm')) return 2; if (k.startsWith('rightarm')) return 3; if (k.startsWith('leftleg')) return 4; if (k.startsWith('rightleg')) return 5; return 0; };
// a band colour is a hex or { c: hex, fab: 'knit' | 'denim' | 'jersey' | 'leather', s: detail strength }
const FAB = ['none', 'knit', 'denim', 'jersey', 'leather'], FAB_SCAN = { knit: 'knitted_fleece', denim: 'denim_fabric_03', jersey: 'cotton_jersey', leather: 'leather_white' }, FAB_REP = { knit: 9, denim: 7, jersey: 10, leather: 5 };
const fabTex = {}; const fabMap = n => fabTex[n] || (fabTex[n] = (() => { const t = new THREE.TextureLoader().load(new URL(`kit/assets/ph/${FAB_SCAN[n]}/diffuse.jpg`, document.baseURI).href); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })());
const band = v => (v != null && typeof v === 'object') ? v : { c: v };
export function dress(A, spec, { face = 'neutral', getFace, sex = 'm', skipBody = false } = {}) {
  const C = c => new THREE.Color(c);
  A.model.traverse(m => {
    if (!m.isSkinnedMesh || skipBody) return;
    const g = m.geometry, P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, bones = m.skeleton.bones;
    g.computeBoundingBox(); const sz = new THREE.Vector3(); g.boundingBox.getSize(sz); const ax = sz.x > sz.y && sz.x > sz.z ? 0 : sz.y > sz.z ? 1 : 2;
    const boneMap = bones.map(b => partOfName(b.name)); const lo = Array(6).fill(1e9), hi = Array(6).fill(-1e9);
    for (let i = 0; i < P.count; i++) { let bi = SI.getX(i), bw = SW.getX(i); for (const k of [1, 2, 3]) { const w = SW.getComponent(i, k); if (w > bw) { bw = w; bi = SI.getComponent(i, k); } }
      let p = boneMap[bi]; if (p < 0) p = 0; const v = P.getComponent(i, ax); lo[p] = Math.min(lo[p], v); hi[p] = Math.max(hi[p], v); }
    const sgn = lo[1] < 1e8 && lo[4] < 1e8 && (lo[1] + hi[1]) / 2 < (lo[4] + hi[4]) / 2 ? -1 : 1;
    const bindH = Math.max(sz.x, sz.y, sz.z);   // this mesh's tallest extent in bind units (for the fabric tiling)
    const unitsPerM = (A.bindH || (A.bindH = bindH)) / 1.7;
    const uMap = new Array(32).fill(0); boneMap.forEach((p, i) => uMap[i] = p < 0 ? 0 : p);
    const rng = PARTS.map((n, i) => new THREE.Vector2(lo[i] < 1e8 ? lo[i] : 0, hi[i] > -1e8 ? hi[i] : 1));
    const cut = [], cols = [[], [], []], fabs = [[], [], []], strs = [[], [], []];
    for (const n of PARTS) { const s = spec[n] || [spec.skin]; const bs = [band(s[0]), band(s[2] ?? s[0]), band(s[4] ?? s[2] ?? s[0])];
      cut.push(new THREE.Vector2(s[1] ?? 2, s[3] ?? 2)); bs.forEach((b, k) => { cols[k].push(C(b.c)); fabs[k].push(FAB.indexOf(b.fab || 'none')); strs[k].push(b.s ?? .55); }); }
    const tile = FAB.map(f => f === 'none' ? 1 : FAB_REP[f] / unitsPerM);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .72 });
    mat.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, { uMap: { value: uMap }, uRng: { value: rng }, uCut: { value: cut }, uC0: { value: cols[0] }, uC1: { value: cols[1] }, uC2: { value: cols[2] },
        uF0: { value: fabs[0] }, uF1: { value: fabs[1] }, uF2: { value: fabs[2] }, uS0: { value: strs[0] }, uS1: { value: strs[1] }, uS2: { value: strs[2] }, uTile: { value: tile },
        tKnit: { value: fabMap('knit') }, tDenim: { value: fabMap('denim') }, tJersey: { value: fabMap('jersey') }, tLeather: { value: fabMap('leather') } });
      sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\nuniform float uMap[32];\nvarying vec3 vRest; varying vec3 vRestN;\nflat varying int vPart;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\nvRest = position; vRestN = normal;\nfloat bi = skinIndex.x, bw = skinWeight.x;\nif (skinWeight.y > bw) { bi = skinIndex.y; bw = skinWeight.y; }\nif (skinWeight.z > bw) { bi = skinIndex.z; bw = skinWeight.z; }\nif (skinWeight.w > bw) { bi = skinIndex.w; }\nvPart = int(uMap[int(bi + .5)] + .5);`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
uniform vec2 uRng[6]; uniform vec2 uCut[6]; uniform vec3 uC0[6]; uniform vec3 uC1[6]; uniform vec3 uC2[6];
uniform int uF0[6]; uniform int uF1[6]; uniform int uF2[6]; uniform float uS0[6]; uniform float uS1[6]; uniform float uS2[6]; uniform float uTile[5];
uniform sampler2D tKnit, tDenim, tJersey, tLeather;
varying vec3 vRest; varying vec3 vRestN; flat varying int vPart;
vec3 tri(sampler2D t, vec3 p, vec3 n) { vec3 w = pow(abs(normalize(n)), vec3(4.)); w /= (w.x + w.y + w.z); return texture2D(t, p.yz).rgb * w.x + texture2D(t, p.xz).rgb * w.y + texture2D(t, p.xy).rgb * w.z; }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
{ vec2 r = uRng[vPart]; float y = vRest[${ax}]; float f = (y - r.x) / max(r.y - r.x, 1e-5); ${sgn < 0 ? 'f = 1. - f;' : ''}
  int b = f < uCut[vPart].x ? 0 : (f < uCut[vPart].y ? 1 : 2);
  vec3 col = b == 0 ? uC0[vPart] : (b == 1 ? uC1[vPart] : uC2[vPart]);
  int fb = b == 0 ? uF0[vPart] : (b == 1 ? uF1[vPart] : uF2[vPart]); float st = b == 0 ? uS0[vPart] : (b == 1 ? uS1[vPart] : uS2[vPart]);
  if (fb > 0) { vec3 p = vRest * uTile[fb], d = fb == 1 ? tri(tKnit, p, vRestN) : fb == 2 ? tri(tDenim, p, vRestN) : fb == 3 ? tri(tJersey, p, vRestN) : tri(tLeather, p, vRestN);
    float l = dot(d, vec3(.299, .587, .114)); col *= mix(1., clamp(l * 2.1, .35, 1.6), st); }
  diffuseColor.rgb = col; }`);
    };
    mat.customProgramCacheKey = () => `dress2-${ax}-${sgn}`;
    m.material = mat;
  });
  // our drawn face: a plane on the front of the head, following the head bone (expressions swap its texture)
  if (getFace) {
    A.root.updateMatrixWorld(true);
    const hb = new THREE.Box3(); A.model.traverse(m => { if (!m.isSkinnedMesh) return; const P = m.geometry.attributes.position, SI = m.geometry.attributes.skinIndex, SW = m.geometry.attributes.skinWeight, map = m.skeleton.bones.map(b => partOfName(b.name)), v = new THREE.Vector3();
      for (let i = 0; i < P.count; i++) { let bi = SI.getX(i), bw = SW.getX(i); for (const k of [1, 2, 3]) { const w = SW.getComponent(i, k); if (w > bw) { bw = w; bi = SI.getComponent(i, k); } } if (map[bi] !== 1) continue; v.fromBufferAttribute(P, i); m.applyBoneTransform(i, v); hb.expandByPoint(m.localToWorld(v)); } });
    const loc = A.root.worldToLocal(hb.max.clone()), loc0 = A.root.worldToLocal(hb.min.clone());
    const w = Math.abs(loc.x - loc0.x), h = Math.abs(loc.y - loc0.y);
    const faceMat = new THREE.MeshBasicMaterial({ map: getFace(face, sex), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    // the face is a DECAL ON THE HEAD ITSELF (Xavier: "it must lie on the face, not float"): a copy of the head's own
    // front triangles, pushed 2 mm out along their normals, with the drawn face projected straight on from the front.
    // (A flat plane floated off the rounded sides; falls back to one only if the head can't be read.)
    const FW = w * .92, FH = h * 1.15, cx = (loc.x + loc0.x) / 2, cy = (loc.y + loc0.y) / 2 - h * .02, zf = Math.max(loc.z, loc0.z);
    const pos = [], uv = [], tri = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
    A.model.traverse(m => { if (!m.isSkinnedMesh) return; const P = m.geometry.attributes.position, SI = m.geometry.attributes.skinIndex, SW = m.geometry.attributes.skinWeight, I = m.geometry.index, map = m.skeleton.bones.map(bb => partOfName(bb.name));
      const part = i => { let bi = SI.getX(i), bw = SW.getX(i); for (const k of [1, 2, 3]) { const ww = SW.getComponent(i, k); if (ww > bw) { bw = ww; bi = SI.getComponent(i, k); } } return map[bi]; };
      const at = (i, v) => { v.fromBufferAttribute(P, i); m.applyBoneTransform(i, v); return A.root.worldToLocal(m.localToWorld(v)); };
      const nT = I ? I.count : P.count;
      for (let t = 0; t < nT; t += 3) { const i0 = I ? I.getX(t) : t, i1 = I ? I.getX(t + 1) : t + 1, i2 = I ? I.getX(t + 2) : t + 2;
        if (part(i0) !== 1 || part(i1) !== 1 || part(i2) !== 1) continue;
        at(i0, a); at(i1, b); at(i2, c); n.subVectors(c, b).cross(new THREE.Vector3().subVectors(a, b)).normalize(); if (n.z < -.25) continue;   // front + sides
        for (const v of [a, b, c]) { pos.push(v.x, v.y, v.z); uv.push((v.x - cx) / FW + .5, (v.y - cy) / FH + .5); tri.push(n.clone()); } } });
    // push out along SMOOTHED normals (shared by every triangle at a corner) so neighbouring facets stay joined: no seams
    { const key = i => `${pos[i * 3].toFixed(4)},${pos[i * 3 + 1].toFixed(4)},${pos[i * 3 + 2].toFixed(4)}`, acc = new Map();
      for (let i = 0; i < tri.length; i++) { const k = key(i); acc.set(k, (acc.get(k) || new THREE.Vector3()).add(tri[i])); }
      for (let i = 0; i < tri.length; i++) { const nn = acc.get(key(i)).clone().normalize(); pos[i * 3] += nn.x * .0025; pos[i * 3 + 1] += nn.y * .0025; pos[i * 3 + 2] += nn.z * .0025; } }
    let plane;
    if (pos.length > 18) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.computeVertexNormals(); geo.translate(-cx, -cy, -zf);
      faceMat.map.wrapS = faceMat.map.wrapT = THREE.ClampToEdgeWrapping; plane = new THREE.Mesh(geo, faceMat); plane.position.set(cx, cy, zf); }
    else { plane = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), faceMat); plane.position.set(cx, cy, zf + .004); }
    plane.renderOrder = 2; A.root.add(plane); A.root.updateMatrixWorld(true); A.bones.head.attach(plane);
    A.face = plane; A.setExpression = n => { faceMat.map = getFace(n, sex); faceMat.needsUpdate = true; };
  }
  return A;
}

// ---------------------------------------------------------------------------------------------------------------
// DETAILS: extruded pieces that give the blocky avatars style (hood, rolled cuffs, drawstrings, zip, pocket, straps,
// rolled short hems, sneakers with toe caps + soles, hair). Built from each part's rest-pose box, attached to its bone.
export function partBoxes(A) {
  A.root.updateMatrixWorld(true); const boxes = PARTS.map(() => new THREE.Box3()), v = new THREE.Vector3();
  A.model.traverse(m => { if (!m.isSkinnedMesh) return; const P = m.geometry.attributes.position, SI = m.geometry.attributes.skinIndex, SW = m.geometry.attributes.skinWeight, map = m.skeleton.bones.map(b => partOfName(b.name));
    for (let i = 0; i < P.count; i++) { let bi = SI.getX(i), bw = SW.getX(i); for (const k of [1, 2, 3]) { const w = SW.getComponent(i, k); if (w > bw) { bw = w; bi = SI.getComponent(i, k); } } const p = Math.max(0, map[bi]);
      v.fromBufferAttribute(P, i); m.applyBoneTransform(i, v); boxes[p].expandByPoint(A.root.worldToLocal(m.localToWorld(v.clone()))); } });
  return Object.fromEntries(PARTS.map((n, i) => [n, boxes[i]]));
}
const mstd = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .7, ...o });
function fabricMat(c, fab, rep = 2) { const m = mstd(c); if (fab) { const t = fabMap(fab).clone(); t.needsUpdate = true; t.repeat.set(rep, rep); m.map = t; } return m; }
export function details(A, items) {
  const B = partBoxes(A), add = (part, mesh, bone) => { A.root.add(mesh); A.root.updateMatrixWorld(true); A.bones[bone || part].attach(mesh); mesh.castShadow = true; return mesh; };
  const sizeOf = b => b.getSize(new THREE.Vector3()), ctr = b => b.getCenter(new THREE.Vector3());
  const yAt = (b, f) => b.min.y + (b.max.y - b.min.y) * f;
  const rbox = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  for (const it of items) {
    const b = B[it.part || (it.type === 'hair' ? 'head' : 'torso')], S = sizeOf(b), c = ctr(b);
    if (it.type === 'ring') {          // a band slightly proud of the part (rolled cuff / hem): f0..f1 of its height, grows by `g`
      const g = it.g ?? .012, h = (it.f1 - it.f0) * S.y, m = new THREE.Mesh(rbox(S.x + 2 * g, h, S.z + 2 * g, h * .45), it.mat);
      m.position.set(c.x, yAt(b, (it.f0 + it.f1) / 2), c.z); add(it.part, m);
    }
    if (it.type === 'shoe') {          // sneaker: upper slightly proud, toe cap pushing forward, darker sole
      const h = it.f1 * S.y, up = new THREE.Mesh(rbox(S.x + .016, h, S.z + .03, .03), it.mat); up.position.set(c.x, b.min.y + h / 2, c.z + .012); add(it.part, up);
      const sole = new THREE.Mesh(rbox(S.x + .03, .03, S.z + .05, .012), it.sole); sole.position.set(c.x, b.min.y + .015, c.z + .016); add(it.part, sole);
      const toe = new THREE.Mesh(rbox(S.x + .012, h * .55, .05, .02), it.mat); toe.position.set(c.x, b.min.y + h * .3, b.max.z + .03); add(it.part, toe);
      for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(S.x * .55, .007, .01), it.lace); l.position.set(c.x, b.min.y + h * (.45 + k * .17), b.max.z + .021); add(it.part, l); }
    }
    if (it.type === 'hood2') {         // hood lying down: soft roll behind the neck + a panel draping over the upper back
      const roll = new THREE.Mesh(rbox(S.x * .74, .075, S.z * .5, .036), it.mat); roll.position.set(c.x, b.max.y + .028, b.min.z + S.z * .22); add('torso', roll);
      const drape = new THREE.Mesh(rbox(S.x * .6, S.y * .34, .03, .014), it.mat); drape.position.set(c.x, b.max.y - S.y * .15, b.min.z - .012); drape.rotation.x = .08; add('torso', drape);
    }
    if (it.type === 'toe') {           // sneaker toe cap + proud sole (laces etc. are painted on the leg texture)
      const h = it.f1 * S.y, toe = new THREE.Mesh(rbox(S.x + .006, h * .5, .045, .02), it.mat); toe.position.set(c.x, b.min.y + h * .27, b.max.z + .018); add(it.part, toe);
      const sole = new THREE.Mesh(rbox(S.x + .026, .028, S.z + .07, .01), it.sole); sole.position.set(c.x, b.min.y + .012, c.z + .018); add(it.part, sole);
    }
    if (it.type === 'hood') {          // bunched hood sitting on the shoulders behind the neck
      const t = new THREE.Mesh(new THREE.TorusGeometry(S.x * .3, S.x * .11, 12, 28, Math.PI * 1.25), it.mat); t.rotation.set(Math.PI / 2, 0, -Math.PI * .125 + Math.PI);
      t.scale.set(1, 1.15, .9); t.position.set(c.x, b.max.y + .005, c.z - S.z * .12); add('torso', t);
    }
    if (it.type === 'strings') {       // drawstrings hanging down the chest, with metal aglets
      for (const sx of [-1, 1]) { const len = S.y * .3, cy = cy0(b, len), st = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, len, 8), it.mat); st.position.set(c.x + sx * S.x * .1, cy, b.max.z + .008); add('torso', st);
        const ag = new THREE.Mesh(new THREE.CylinderGeometry(.008, .007, .022, 8), it.tip); ag.position.set(st.position.x, cy - len / 2 - .01, st.position.z); add('torso', ag); }
    }
    if (it.type === 'zip') {           // zipper line + pull tab down the front
      const z = new THREE.Mesh(new THREE.BoxGeometry(.012, S.y * .78, .006), it.mat); z.position.set(c.x, b.min.y + S.y * .5, b.max.z + .004); add('torso', z);
      const tab = new THREE.Mesh(rbox(.02, .035, .008, .004), it.mat); tab.position.set(c.x + .002, b.max.y - S.y * .2, b.max.z + .009); add('torso', tab);
    }
    if (it.type === 'pocket') {        // kangaroo pocket on the lower front
      const p = new THREE.Mesh(rbox(S.x * .62, S.y * .26, .014, .01), it.mat); p.position.set(c.x, b.min.y + S.y * .2, b.max.z + .006); add('torso', p);
    }
    if (it.type === 'straps') {        // tank-top straps over the shoulders
      for (const sx of [-1, 1]) { const st = new THREE.Mesh(rbox(S.x * .1, .03, S.z + .02, .008), it.mat); st.position.set(c.x + sx * S.x * .28, b.max.y + .006, c.z); add('torso', st); }
    }
    if (it.type === 'cap') {           // hair base under a hair mesh: covers the top + back of the head (never the face)
      const hb = B.head, hs = sizeOf(hb), hc = ctr(hb), g = it.g ?? .008, top = new THREE.Mesh(rbox(hs.x + 2 * g, hs.y * (it.h ?? .5), hs.z * .62 + g, .03), it.mat);
      top.position.set(hc.x, hb.max.y - hs.y * (it.h ?? .5) / 2 + g, hb.min.z + (hs.z * .62 + g) / 2 - g); add('head', top);
      const crown = new THREE.Mesh(rbox(hs.x + 2 * g, .03, hs.z * .8, .012), it.mat); crown.position.set(hc.x, hb.max.y + g, hb.min.z + hs.z * .4 - g); add('head', crown);
    }
    if (it.type === 'hair') {          // a hair mesh fitted to the head box (scale by width, sits over the crown)
      const hb = B.head, hs = sizeOf(hb), hc = ctr(hb), o = it.mesh; const ob = new THREE.Box3().setFromObject(o), os = sizeOf(ob), oc = ctr(ob);
      const k = hs.x * (it.fit ?? 1.22) / os.x, g = new THREE.Group(); g.add(o); o.position.sub(oc); g.scale.setScalar(k); g.rotation.y = it.yaw ?? 0;
      g.position.set(hc.x, hb.max.y - os.y * k / 2 + hs.y * (it.lift ?? .32), hc.z + (it.dz ?? 0) * hs.z); add('head', g); A.hair = g;
    }
  }
  function cy0(b, len) { return b.max.y - S0(b) * .12 - len / 2; }
  function S0(b) { return b.max.y - b.min.y; }
  return A;
}
// the spiky hair Xavier supplied (OBJ), recoloured
export async function loadSpikyHair(color = 0x15110f) {
  const o = await new OBJLoader().loadAsync(url('bbc9254e-blue-hair-for-blue-individuals/source/X8hH14VXqxWIwW1MRS642SpLUuzVrrhnbktzQBjPoPnE6zHqdC.obj'));
  o.traverse(n => { if (n.isMesh) { n.material = mstd(color, { roughness: .5 }); n.castShadow = true; } }); return o;
}
export { fabricMat };

// ---------------------------------------------------------------------------------------------------------------
// SKIN: wrap a painted 2048x2048 avatar texture (kit/assets/avatar_template/layout.json) onto the body. Each triangle
// is assigned to one face of its part's box (front/back/left/right/top/bottom) and gets UVs inside that face's square,
// so whatever is painted on the template lands exactly there. Replaces the colour-band outfit on those meshes.
const layouts = {};
export const layout = (u = 'kit/assets/avatar_template/layout.json') => layouts[u] || (layouts[u] = fetch(new URL(u, document.baseURI)).then(r => r.json()));
export async function skin(A, texUrl, { layoutUrl = 'kit/assets/avatar_template/layout.json' } = {}) {
  const L = await layout(layoutUrl), [TW, TH] = L.size;
  const tex = typeof texUrl === 'string' ? await new THREE.TextureLoader().loadAsync(new URL(texUrl, document.baseURI).href) : texUrl;   // a URL or a ready texture (NPC painter)
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.flipY = true; tex.needsUpdate = true;
  const B = partBoxes(A), v = new THREE.Vector3();
  A.model.traverse(m => {
    if (!m.isSkinnedMesh) return;
    if (m.geometry.index) m.geometry = m.geometry.toNonIndexed();
    const g = m.geometry, P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, map = m.skeleton.bones.map(b => partOfName(b.name));
    const uv = new Float32Array(P.count * 2), pts = [];
    A.root.updateMatrixWorld(true);
    for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); m.applyBoneTransform(i, v); pts.push(A.root.worldToLocal(m.localToWorld(v.clone()))); }
    for (let t = 0; t < P.count; t += 3) {
      let bi = SI.getX(t), bw = SW.getX(t); for (const k of [1, 2, 3]) { const w = SW.getComponent(t, k); if (w > bw) { bw = w; bi = SI.getComponent(t, k); } }
      const pn = PARTS[Math.max(0, map[bi])], box = B[pn], c = box.getCenter(new THREE.Vector3()), hs = box.getSize(new THREE.Vector3()).multiplyScalar(.5);
      const cen = pts[t].clone().add(pts[t + 1]).add(pts[t + 2]).divideScalar(3).sub(c);
      const r = [cen.x / hs.x, cen.y / hs.y, cen.z / hs.z], ax = [0, 1, 2].reduce((a, b) => Math.abs(r[b]) > Math.abs(r[a]) ? b : a, 0);
      const face = ax === 2 ? (r[2] > 0 ? 'front' : 'back') : ax === 1 ? (r[1] > 0 ? 'top' : 'bottom') : (r[0] > 0 ? 'left' : 'right');
      const [rx, ry, rw, rh] = L.parts[pn][face], mn = box.min, sz = box.getSize(new THREE.Vector3());
      for (let k = 0; k < 3; k++) {
        const p = pts[t + k]; let uu, vv;   // uu: 0 = left edge of the square, 1 = right; vv: 0 = bottom, 1 = top (as painted)
        const fx = (p.x - mn.x) / sz.x, fy = (p.y - mn.y) / sz.y, fz = (p.z - mn.z) / sz.z;
        if (face === 'front') { uu = fx; vv = fy; } else if (face === 'back') { uu = 1 - fx; vv = fy; }
        else if (face === 'left') { uu = 1 - fz; vv = fy; } else if (face === 'right') { uu = fz; vv = fy; }
        else if (face === 'top') { uu = fx; vv = fz; } else { uu = fx; vv = 1 - fz; }
        uu = Math.min(1, Math.max(0, uu)); vv = Math.min(1, Math.max(0, vv));
        uv[(t + k) * 2] = (rx + uu * rw) / TW; uv[(t + k) * 2 + 1] = 1 - (ry + (1 - vv) * rh) / TH;
      }
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    m.material = new THREE.MeshStandardMaterial({ map: tex, roughness: .75 });
  });
  return A;
}

// material from one of the cropped swatch photos (kit/assets/fabric/<name>.jpg)
const photoTex = {};
export function photoMat(name, rep = 2, o = {}) {
  const t = (photoTex[name] = photoTex[name] || new THREE.TextureLoader().load(new URL(`kit/assets/fabric/${name}.jpg`, document.baseURI).href)).clone();
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: t, roughness: .85, ...o });
}
