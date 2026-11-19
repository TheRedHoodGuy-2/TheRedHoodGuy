// SHADOW STEPS (scripts/04, first content-engine test, LOW QUALITY review). opts.loc = 'street' | 'class' | 'room': each
// location is its own scene (rendered for its own time ranges, then cut together). Time t = the voice track's time.
// Cast is fixed (library/cast.json). Shadows: flat posed copies (engine/cast.js shadowOf). The boy's shadow is MIA's
// shape (ponytail) and Mia's is HIS (hood): the twist is in the picture from the first family shot.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { makeActor, shadowOf } from '../engine/cast.js';
import { flapTrack, blinkTrack, blinkTimes } from '../engine/lipsync.js';
import { AI_PLACE, EMOTIONS } from '../engine/faceset.js';

const J = async p => (await fetch(new URL(p, document.baseURI))).json();
const ease = k => k * k * (3 - 2 * k), lerp = (a, b, k) => a + (b - a) * k;
// ---------- poses (avatar frame: +x = its left, head [yaw, pitch(+down), roll], root { y drop, rx lean, ry turn, rz tilt })
const P = {
  stand:   { armL: [.1, -1, .04], armR: [-.12, -1, -.02], legL: [.05, -1, 0], legR: [-.04, -1, .02], head: [.05, .02, .03], root: { rz: .015 } },
  hip:     { armL: [.75, -.55, -.2], armR: [-.1, -1, .05], legL: [.18, -1, .05], legR: [-.03, -1, -.03], head: [-.15, -.05, .12], root: { rz: .05, ry: .15 } },
  smirk:   { armL: [.2, -.95, -.25], armR: [-.75, -.45, .35], legL: [.22, -1, .08], legR: [-.04, -1, -.05], head: [-.2, -.08, .16], root: { rz: -.06, ry: -.2 } },
  worried: { armL: [-.05, -.6, .78], armR: [.1, -.55, .8], legL: [.04, -1, .05], legR: [-.12, -1, -.06], head: [.25, .2, .12], root: { rx: .06, rz: .04 } },
  lookDown:{ armL: [.25, -.9, .2], armR: [-.2, -.9, .25], legL: [.06, -1, .04], legR: [-.08, -1, -.04], head: [.1, .5, .05], root: { rx: .12 } },
  lookBack:{ armL: [.15, -.95, -.2], armR: [-.3, -.85, .3], legL: [.12, -1, -.1], legR: [-.06, -1, .12], head: [1.05, .15, .05], root: { ry: .5, rz: .03 } },
  point:   { armR: [-.3, .1, 1], armL: [.35, -.85, -.35], legL: [.16, -1, .25], legR: [-.22, -1, -.22], head: [-.12, -.02, .08], root: { rx: .1, ry: -.25, rz: .04 } },
  yell:    { armL: [.85, .05, .45], armR: [-.8, -.1, .5], legL: [.3, -1, .1], legR: [-.1, -1, -.25], head: [0, -.2, .1], root: { rx: -.12, rz: -.05 } },
  turnAway:{ armL: [-.35, -.6, .7], armR: [.2, -.95, .1], legL: [.08, -1, .05], legR: [-.05, -1, -.05], head: [-.5, -.15, -.1], root: { ry: -.9 } },
  hugMia:  { armL: [.15, -.25, .97], armR: [-.4, -.1, .9], legL: [.1, -1, .1], legR: [-.06, -1, -.04], head: [-.3, .2, -.1], root: { rx: .1, ry: -.4 } },
  whisper: { armR: [-.15, .55, .82], armL: [.3, -.85, .35], legL: [.25, -1, -.1], legR: [-.04, -1, .2], head: [-.35, .1, -.18], root: { rx: .22, ry: -.5, rz: -.08 } },
  whisper2:{ armL: [.18, -.9, -.38], armR: [-.18, -.9, -.4], legL: [.12, -1, -.08], legR: [-.06, -1, .14], head: [-.15, .08, -.2], root: { rx: .16, rz: -.05 } },   // sneaky: hands behind her back, leaning in
  flick:   { armR: { r: [2.6, .2, -.35], o: [-.03, .14, 0] }, armL: [.2, -.95, .2], legL: [.2, -1, .05], legR: [-.05, -1, -.05], head: [.45, -.2, -.25], root: { ry: .3, rz: -.08 } },
  hood:    { armL: { r: [2.65, -.15, .3], o: [.03, .15, 0] }, armR: { r: [2.6, .25, -.35], o: [-.03, .15, 0] }, legL: [.06, -1, .04], legR: [-.08, -1, -.02], head: [0, .12, 0], root: { rx: .05 } },
  grab:    { armR: [-.2, -.25, .97], armL: [.6, -.5, .62], legL: [.35, -1, .3], legR: [-.15, -1, -.3], head: [-.3, -.2, .1], root: { rx: .28, ry: -.55, rz: .06 } },
  shocked: { armL: [.45, -.35, .82], armR: [-.3, -.15, .94], legL: [.22, -1, -.18], legR: [-.12, -1, .3], head: [.12, -.22, .12], root: { rx: -.16, rz: -.07 } },   // recoil: arms come up in front, never a T
  wave:    { armR: { r: [3.05, .42, 0], o: [-.057, .252, -.013] }, armL: [.25, -.95, .15], legL: [.18, -1, 0], legR: [-.05, -1, .05], head: [-.12, -.05, -.16], root: { rz: .14, x: .05 } },
  sit:     { legL: [.08, 0, 1], legR: [-.1, 0, 1], armL: [.1, -.35, .93], armR: [-.15, -.4, .9], head: [.15, .05, .06], root: { y: -.62 } },
  walkA:   { armL: [.06, -.95, .3], armR: [-.06, -.95, -.3], legL: [.03, -.95, -.32], legR: [-.03, -.95, .32], head: [0, 0, 0], root: { rz: .02 } },
  walkB:   { armL: [.06, -.95, -.3], armR: [-.06, -.95, .3], legL: [.03, -.95, .32], legR: [-.03, -.95, -.32], head: [0, 0, 0], root: { rz: -.02 } },
  footUp:  { armL: [.15, -.92, -.35], armR: [-.15, -.9, .35], legL: [.03, -.4, .9], legR: [-.03, -1, -.08], head: [0, .05, 0], root: { rx: .08 } },
};
// blend two poses (array or { r, o } parts; root channels)
function blend(a, b, k) {
  if (k <= 0) return a; if (k >= 1) return b; const o = {};
  for (const n of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[n], y = b[n];
    if (n === 'root') { o.root = {}; for (const c of new Set([...Object.keys(x || {}), ...Object.keys(y || {})])) o.root[c] = lerp((x || {})[c] || 0, (y || {})[c] || 0, k); continue; }
    if (x === undefined || y === undefined) { o[n] = k < .5 ? (x ?? P.stand[n]) : (y ?? P.stand[n]); continue; }
    if (Array.isArray(x) && Array.isArray(y)) o[n] = x.map((v, i) => lerp(v, y[i], k));
    else if (!Array.isArray(x) && !Array.isArray(y)) o[n] = { r: x.r.map((v, i) => lerp(v, y.r[i], k)), o: (x.o || [0, 0, 0]).map((v, i) => lerp(v, (y.o || [0, 0, 0])[i], k)) };
    else o[n] = k < .5 ? x : y;
  }
  return o;
}
// keyed track: keys [{ t, ...state }] -> state at t; poses ease over .28 s into the next key (anticipation-free v1)
function track(keys) {
  keys = keys.slice().sort((a, b) => a.t - b.t); let last = null, lr = null; for (const k of keys) { if (k.at) { k.from = last; last = k.at; } else k.at = last; if (k.ry !== undefined) { k.ryFrom = lr ?? k.ry; lr = k.ry; } else k.ry = lr; }
  return t => { let i = 0; while (i + 1 < keys.length && keys[i + 1].t <= t) i++; const cur = keys[i], prev = keys[Math.max(0, i - 1)], k = ease(Math.min(1, (t - cur.t) / .28));
    return { ...cur, ry: cur.ry == null ? null : lerp(cur.ryFrom ?? cur.ry, cur.ry, ease(Math.min(1, (t - cur.t) / .35))), pose: blend(P[prev.pose] || P.stand, P[cur.pose] || P.stand, i ? k : 1), at: cur.from && cur.glide ? cur.at.map((v, j) => lerp(cur.from[j], v, ease(Math.min(1, (t - cur.t) / cur.glide)))) : cur.at }; };
}
// a live sprite face: emotion cell, talk mouths from the 05 E / F rows of that emotion, blinks from sheet D
const ROW = { neutral: ['E', 0], bored: ['E', 0], sleepy: ['E', 0], determined: ['E', 0], happy: ['E', 1], laugh: ['E', 1], excited: ['E', 1], proud: ['E', 1], love: ['E', 1],
  sad: ['E', 2], crying: ['E', 2], nervous: ['F', 1], angry: ['E', 3], furious: ['E', 3], annoyed: ['E', 3], smug: ['F', 0], evil: ['F', 0], suspicious: ['F', 0], scared: ['F', 1], terrified: ['F', 1], shocked: ['F', 2], surprised: ['F', 2] };
const cellOf = e => { const i = Math.max(0, EMOTIONS.indexOf(e)); return (i < 16 ? 'A' : 'B') + String(i + 1).padStart(2, '0'); };
function liveFace(actor, emoAt, talkAt, blinkAt) {
  const st = actor.char.faceSet.split(':')[1], D = `assets/faces/sprites/${st}`, M = 'assets/faces/sprites/05_intimidating', place = AI_PLACE[st] || {};
  const mdy = st === '05_intimidating' ? 0 : -18;   // the 05 mouths sit a little lower than the girls' own mouths
  const urls = []; for (const e of EMOTIONS) urls.push(`${D}/${cellOf(e)}.png`, `${D}/${cellOf(e)}e.png`); urls.push(`${D}/D02.png`, `${D}/D03.png`); for (let i = 1; i <= 16; i++) urls.push(`${M}/E${String(i).padStart(2, '0')}.png`, `${M}/F${String(i).padStart(2, '0')}.png`);
  return { ready: () => actor.preloadFace(urls), at: t => {
    const e = emoAt(t) || 'neutral', s = talkAt(t), b = blinkAt(t), [sh, row] = ROW[e] || ['E', 0], E = cellOf(e);
    const eyes = b === 2 ? `${D}/D03.png` : b === 1 ? `${D}/D02.png` : `${D}/${E}e.png`;
    const layers = s ? [eyes, { u: `${M}/${sh}${String(row * 4 + 1 + s).padStart(2, '0')}.png`, dy: mdy }] : b ? [eyes, { u: `${M}/${sh}${String(row * 4 + 1).padStart(2, '0')}.png`, dy: mdy }] : [`${D}/${E}.png`];
    actor.faceNow(layers, place); } };
}
// seat height of a chair: cast a ray straight down through its centre (hits the seat, not the back)
const seatY = (obj, x, z) => { obj.updateMatrixWorld(true); const rc = new THREE.Raycaster(new THREE.Vector3(x, 3, z), new THREE.Vector3(0, -1, 0)); const h = rc.intersectObject(obj, true)[0]; return h ? h.point.y : .45; };
const HIP = .68;   // R6 hip joint height standing (m); seated: hips sit ~.1 above the seat
const findSun = sc => { let s = null; sc.traverse(o => { if (!s && o.isDirectionalLight) s = o; }); return s; };
const fade = (actor, alpha, only) => actor.root.traverse(o => { if (!o.isMesh || (only && !only(o))) return; if (!o.userData.mat0) o.userData.mat0 = o.material; if (alpha >= .999) { o.material = o.userData.mat0; return; }
  if (!o.userData.matF) { o.userData.matF = o.userData.mat0.clone(); o.userData.matF.transparent = true; o.userData.matF.depthWrite = false; } o.userData.matF.opacity = alpha; o.material = o.userData.matF; });

export async function build({ scene, W: w, H: h, opts = {} }) {
  RectAreaLightUniformsLib.init();
  const loc = opts.loc || 'room', lines = await J('topics/shadow_steps/lines.json'), F = await J('topics/shadow_steps/voice/flap.json'), flap = flapTrack(F, 0);
  const L = i => lines[i], speaking = ranges => t => ranges.some(i => t >= L(i).s - .05 && t <= L(i).e + .05) ? flap(t) : 0;
  const cam = new THREE.PerspectiveCamera(32, w / h, .05, 600), live = [], acts = [];
  const add = (a, tr, o = {}) => { a.root.traverse(m => { if (m.isMesh) m.castShadow = false; }); scene.add(a.root); acts.push({ a, tr, ...o }); return a; };
  let shots = [], sun, post, upd = () => {};
  const base = { volume: 0, aperture: 1.6, maxBlur: 8 * w / 540, bloom: .25, bloomRadius: .6, bloomThreshold: 1.4, bloomCap: 2.4, bloomTint: '#ffb391', exposure: 1.15, contrast: 1.08, saturation: 1.05, black: .02,
    shadowTint: '#4d6f92', highTint: '#ffd9a8', tintAmt: .2, pivot: .42, lift: [.012, .016, .03], gain: [1.03, 1, .97], grain: .025, ca: .004 };
  // ======================================================== STREET
  if (loc === 'street') {
    const { buildSuburb } = await import('../engine/sets/suburb.js'); const S = await buildSuburb(scene); const Y = .14, Z = -4.85;
    sun = S.sun || findSun(scene);
    if (!sun) { sun = new THREE.DirectionalLight('#fff1dc', 2.8); sun.position.set(-12, 22, 26); sun.target.position.set(10, 0, -5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 120 }); sun.shadow.bias = -.0005; scene.add(sun, sun.target);
      scene.add(new THREE.HemisphereLight('#e4ecf8', '#6a7a50', 1.25)); scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 24, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.5), side: THREE.BackSide }))); }
    const kid = add(await makeActor('m013', { emo: 'neutral' }), track([{ t: 0, pose: 'stand', at: [0, Z] }, { t: 2.7, pose: 'lookBack' }, { t: 5.2, pose: 'stand' }]));
    const kidS = await shadowOf('m013'); scene.add(kidS.shadowGroup);
    const ghost = add(await makeActor('f019', { emo: 'happy' }), track([{ t: 0, pose: 'walkA', at: [-4.2, Z + .2], ry: Math.PI / 2 }, { t: 5.1, pose: 'walkA', at: [-4.2, Z + .2] }, { t: 5.3, pose: 'walkA', at: [-1.7, Z + .25], glide: 1.0, walk: true }, { t: 6.5, pose: 'wave', ry: .5 }]));
    fade(ghost, .28);
    const boy = add(await makeActor('boy', { emo: 'smug' }), track([{ t: 0, pose: 'smirk', at: [30, Z] }]));
    const boyS = await shadowOf('mia'); scene.add(boyS.shadowGroup);
    const mail = add(await makeActor('mailman', { emo: 'happy' }), track([{ t: 0, pose: 'wave', at: [60, Z] }]));
    const mailS = await shadowOf('mailman', { kind: 'wall' }); scene.add(mailS.shadowGroup);
    acts.forEach(x => x.a.root.position.y = Y);
    upd = t => {
      // kid: one step per lie, counted (0-5 s); the shadow walks off behind him (away from the camera)
      const steps = t < 1.3 ? 0 : t < 2.6 ? 1 : Math.min(4, 1 + Math.floor((t - 2.6) / .7));
      const walkK = Math.min(1, ((t < 2.6 ? t - 1.3 : (t - 2.6) % .7)) / .45), stepping = t > 1.3 && walkK < 1;
      kidS.rig.pose(stepping ? (Math.floor(t * 4) % 2 ? P.walkA : P.walkB) : P.stand);
      kidS.shadowGroup.position.set(.35 + (steps - (stepping ? 1 - walkK : 0)) * .55, Y, Z - .25); kidS.shadowGroup.rotation.y = 0;
      boyS.rig.pose(P.smirk); boyS.shadowGroup.position.set(30, Y, Z - .15); boyS.shadowGroup.rotation.y = .35;
      mailS.rig.pose(P.stand); mailS.shadowGroup.position.set(84, Y, Z); mailS.shadowGroup.rotation.y = -Math.PI / 2;   // his shadow lives at the end of the street
    };
    const porch = [60, 1.55, Z];
    shots = [
      { t: 0, p: [1.3, 2.9, Z + 5.4], l: [.8, .75, Z - .4], fov: 52, f: [.8, .5, Z - .2] },
      { t: 5.15, p: [.0, 1.7, Z + 5.2], l: [-.85, 1.1, Z + .1], fov: 42, f: [-.85, 1.1, Z + .1] },
      { t: 6.95, p: [31.2, 1.35, Z + 3.4], l: [30, 1.45, Z], fov: 28, f: [30, 1.5, Z] },
      { t: 10.2, p: [62.6, 1.9, Z + 4.8], l: [60.2, 1.25, Z], fov: 40, f: porch },
      { t: 12.25, p: [79.2, 1.5, Z + 2.2], l: [84, 1.0, Z], fov: 30, f: [84, 1.0, Z] },
    ];
    post = { ...base, sun };
  }
  // ======================================================== CLASSROOM
  if (loc === 'class') {
    const { classroom } = await import('../engine/sets/classroom.js'); const C = await classroom(scene, { hide: [] }); sun = C.sun || findSun(scene);
    const te = add(await makeActor('teacher', { emo: 'happy' }), track([{ t: 0, pose: 'hip', at: [C.teacherSpot.x, C.teacherSpot.z] }]), { ry: 2.9 });   // half turned to the board she teaches at, face to camera
    const ts = await shadowOf('teacher', { kind: 'wall' }); ts.flat.scale.set(.02, 1, 1); scene.add(ts.shadowGroup); const TS = C.teacherSpot;
    const rows = [...new Set(C.seats.map(q => q.row))].sort((a, b) => a - b), rowsN = rows.sort((a, b) => Math.abs(C.seats.find(q => q.row === a).z - TS.z) - Math.abs(C.seats.find(q => q.row === b).z - TS.z)), seat = C.seats.filter(q => q.row === rowsN[1]).sort((a, b) => Math.abs(a.x - TS.x) - Math.abs(b.x - TS.x))[0];
    upd = () => { ts.rig.pose({ ...P.sit, root: { y: (seat.seatTop || .6) + .1 - HIP } }); ts.shadowGroup.position.set(seat.x, 0, seat.z); ts.shadowGroup.rotation.y = th + Math.PI; };   // her shadow sits at a desk two rows back, a flat side-on silhouette
    const ux = TS.x - seat.x, uz = TS.z - seat.z, un = Math.hypot(ux, uz), cp = [TS.x + ux / un * 1.3 - uz / un * .5, 1.95, TS.z + uz / un * 1.3 + ux / un * .5], th = Math.atan2(-(cp[2] - seat.z), cp[0] - seat.x);   // camera by the board: teacher near, her seated shadow far, on one line
    shots = [{ t: 8.3, p: cp, l: [TS.x - ux * .35, 1.15, TS.z - uz * .35], fov: 55, f: [seat.x, 1.0, seat.z] }];
    post = { ...base, sun };
  }
  // ======================================================== HOUSE (living / dining room). Plan (m): back wall z = -3.2,
  // door in it at x = 3.0; dining table left; the family stands in a loose line in front of a clear stretch of wall so
  // the wall shadows read. Camera sits out past the hidden front wall (long lens, 3-4.5 m), studio rule.
  if (loc === 'room') {
    const { room } = await import('../engine/sets/roomkit.js'); const { ph } = await import('../engine/build.js');
    const R = await room(scene, { w: 7.4, d: 6.4, walls: { n: [{ type: 'door', at: 3.05 }], w: [{ type: 'window', at: -.4 }] }, hide: ['s', 'e'], wallColor: '#ece4d6' });
    const BZ = -R.D / 2;
    const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 24, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.5), side: THREE.BackSide })); scene.add(sky);
    const TB = [-2.55, -1.7];
    const table = await ph('round_wooden_table_01', { scale: 1.4 }); table.position.set(TB[0], 0, TB[1]); scene.add(table);
    const chairs = [[TB[0] - .78, TB[1], Math.PI / 2], [TB[0] + .78, TB[1], -Math.PI / 2]];
    const chairObj = []; for (const [x, z, ry] of chairs) { const ch = await ph('dining_chair_02', { scale: 1.4 }); ch.position.set(x, 0, z); ch.rotation.y = ry; scene.add(ch); chairObj.push(ch); }
    const gSeat = seatY(chairObj[0], chairs[0][0] + .05, chairs[0][1]); P.sitG = { ...P.sit, root: { y: gSeat + .1 - HIP } };
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(.13, .09, .02, 40), new THREE.MeshPhysicalMaterial({ color: '#fbfaf6', roughness: .25, clearcoat: .6 })); scene.add(plate);
    const stand = await ph('side_table_01', { scale: 1.4 }); stand.position.set(-.9, 0, BZ + .4); scene.add(stand);
    const vase = await ph('ceramic_vase_01', { scale: 1.4 }); scene.add(vase);
    const plant = await ph('potted_plant_02', { scale: 1.4 }); plant.position.set(-3.2, 0, BZ + .5); scene.add(plant);
    const tableTop = (() => { const b = new THREE.Box3().setFromObject(table); return b.max.y; })(), standTop = new THREE.Box3().setFromObject(stand).max.y;
    const POS = { boy: [.9, .5], mia: [-.4, -.35], mom: [-1.7, .25] };
    const gma = add(await makeActor('grandma', { emo: 'happy' }), track([{ t: 0, pose: 'sitG', at: [chairs[0][0] + .05, TB[1]] }]), { ry: Math.PI / 2 }); 
    const boy = add(await makeActor('boy'), track([
      { t: 0, pose: 'stand', at: POS.boy }, { t: 17.5, pose: 'hip' }, { t: 26.2, pose: 'hood' }, { t: 27.75, pose: 'stand' },
      { t: 31.1, pose: 'worried' }, { t: 34.5, pose: 'yell' }, { t: 35.5, pose: 'worried' }, { t: 42.3, pose: 'worried' }, { t: 43.5, pose: 'lookDown' }, { t: 45.6, pose: 'lookBack' }, { t: 47.5, pose: 'shocked' },
      { t: 53.3, pose: 'grab', at: [-.9, .9], glide: .9, walk: true, ry: -1.69 }]), { ry: -.45, hideBefore: 17.5 });
    const mia = add(await makeActor('mia'), track([
      { t: 0, pose: 'stand', at: POS.mia, ry: .45 }, { t: 18.7, pose: 'smirk' }, { t: 20.2, pose: 'hip', ry: -.7 }, { t: 26.2, pose: 'hip', ry: .45 }, { t: 27.8, pose: 'flick' }, { t: 28.75, pose: 'hip' },
      { t: 31.1, pose: 'point' }, { t: 33.1, pose: 'smirk' }, { t: 36.7, pose: 'hip' }, { t: 39.2, pose: 'point' }, { t: 40.6, pose: 'smirk' }, { t: 55.7, pose: 'walkA', at: [-1.3, -.6], glide: .5, walk: true, ry: -1.57 }, { t: 56.2, pose: 'walkA', at: [-2.3, -.5], glide: .5, walk: true }, { t: 56.7, pose: 'walkA', at: [-2.5, .1], glide: .3, walk: true, ry: .6 }, { t: 57.0, pose: 'whisper2' }]), { ry: .25, hideBefore: 17.5 });
    const mom = add(await makeActor('mom'), track([
      { t: 0, pose: 'stand', at: POS.mom }, { t: 24.8, pose: 'hugMia', at: [-1.15, .05], glide: .4 }, { t: 26.2, pose: 'stand', at: POS.mom, glide: .4 }, { t: 29.7, pose: 'shocked' }, { t: 31.1, pose: 'hip' },
      { t: 35.5, pose: 'turnAway' }, { t: 53.3, pose: 'stand' }, { t: 55.7, pose: 'stand', ry: 0 }]), { ry: .45, hideBefore: 17.5 });
    // wall shadows, swapped: next to the boy, Mia's shape (ponytail); next to Mia, his (hood)
    const boyS = await shadowOf('mia', { kind: 'wall' }), miaS = await shadowOf('boy', { kind: 'wall' }), momS = await shadowOf('mom', { kind: 'wall' });
    for (const s of [boyS, miaS, momS]) scene.add(s.shadowGroup);
    sun = new THREE.DirectionalLight('#fff0dc', 2.2); sun.position.set(-6, 6, 4); sun.target.position.set(0, 1, -1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 }); sun.shadow.bias = -.0005; scene.add(sun, sun.target);
    scene.add(new THREE.HemisphereLight('#e6ecf6', '#8a7560', 1.3)); const key = new THREE.RectAreaLight('#fff1e0', 4, 2, 2); key.position.set(.5, 2.6, 3); key.lookAt(0, 1.4, -1); scene.add(key);
    const STEP = [[33.3, 1], [38.95, 2], [40.75, 3], [41.35, 7], [41.8, 8], [52.7, 9]], STRIDE = .17;
    const at = (a, t) => acts.find(x => x.a === a).tr(t), poseAt = (a, t) => at(a, t).pose;
    upd = t => {
      const wall = (S, xy, pose, dx, side) => { S.rig.pose(pose); S.shadowGroup.position.set(xy[0] - .55 + dx, .3, BZ + .012); S.shadowGroup.scale.setScalar(1.1);
        S.flat.scale.set(side ? .02 : 1, 1, side ? 1 : .02); S.shadowGroup.rotation.y = side ? Math.PI / 2 : 0; };   // side = profile, walking toward the door
      const done = STEP.filter(s => t >= s[0]), [t1, n1] = done.pop() || [0, 0], n0 = (done.pop() || [0, 0])[1], k = ease(Math.min(1, (t - t1) / .45));
      const n = n1 ? lerp(n0, n1, k) : 0, moving = n1 && k < 1;
      const pose = t >= 59.0 ? blend(P.stand, P.footUp, ease(Math.min(1, (t - 59.0) / 1.4))) : moving ? (Math.floor((t - t1) * 8) % 2 ? P.walkA : P.walkB) : n1 ? P.stand : poseAt(boy, t);
      wall(boyS, POS.boy, pose, n * STRIDE, t >= 33.25);
      wall(miaS, at(mia, t).at, poseAt(mia, t), 0); wall(momS, at(mom, t).at, poseAt(mom, t), 0);
      // the vase: on the side table, knocked off at 29.8 (Mia's hip; nobody sees it but her), lies on the floor
      const vt = Math.max(0, Math.min(1, (t - 29.8) / .32)); vase.position.set(-.9 + vt * .35, lerp(standTop, .08, vt * vt), BZ + .4 + vt * .45); vase.rotation.set(0, 0, -vt * 1.5);
      plate.position.set(TB[0] + .45, tableTop + .01, TB[1]);   // Grandpa's plate, set at the empty chair
      fade(boy, t >= 54.4 ? .35 : t >= 42.3 ? .62 : 1);   // he starts going see-through at 'my hands were going see-through'
    };
    const H = 1.45, FX = { boy: [POS.boy[0], H, POS.boy[1]], mia: [POS.mia[0], H, POS.mia[1]], mom: [POS.mom[0], H, POS.mom[1]] }, WL = x => [x, 1.25, BZ];
    const sh = (t, p, l, fov, f) => ({ t, p, l, fov, f: f || l });
    const SX = n => POS.boy[0] - .55 + n * STRIDE, WS = (t, n, fov = 58) => sh(t, [SX(n) + .5, 1.3, -.8], [SX(n) - .1, 1.25, BZ], fov);   // on his shadow, from between the family and the wall
    shots = [
      sh(13.6, [-1.0, 1.5, -.6], [-3.2, 1.25, -1.75], 36),             // grandma at the table, facing the empty chair
      sh(15.8, [-.4, 1.9, 1.6], [-1.95, .8, -1.7], 26),               // the plate at the empty chair
      sh(17.5, [2.4, 1.7, 4.2], FX.boy, 30),                          // boy, to camera
      sh(18.75, [1.2, 1.7, 3.6], FX.mia, 28),                         // my sister Mia
      sh(20.2, [1.6, 2.0, 4.6], [-1.0, 1.2, -.1], 34),                // Mia lying to Mom
      sh(22.8, [.7, 1.5, 3.4], [-.2, 1.1, -1.6], 40),                          // insert: her shadow on the wall, still
      sh(24.8, [.4, 1.8, 4.2], [-1.1, 1.2, -.1], 32),                 // Mom hugs perfect Mia
      sh(26.2, [2.6, 1.7, 3.6], FX.boy, 24),                          // boy pulls up his hood
      sh(27.8, [.9, 1.7, 3.1], FX.mia, 24),                           // Mia flicks her ponytail
      sh(28.75, [.6, 1.1, -.9], [-.7, .45, BZ + .65], 44),               // until Tuesday: the vase falls
      sh(31.1, [2.6, 1.8, 2.8], FX.mia, 30),                          // over the boy's shoulder: Mia points
      WS(33.1, .5),                         // his shadow steps away (wall)
      sh(34.5, [2.4, 1.6, 3.8], FX.boy, 28),                          // "I didn't!"
      sh(35.5, [-.6, 1.8, 3.2], FX.mom, 28),                          // Mom doesn't look
      sh(36.7, [.6, 1.7, 3.0], FX.mia, 28),                           // Mia: the cookie
      WS(38.9, 1.5),                         // step
      sh(39.2, [.5, 1.7, 2.9], FX.mia, 26),                           // "you look old"
      WS(40.65, 5, 60),                       // step, seven, eight
      sh(42.3, [2.0, 1.3, 3.0], [.9, 1.0, .5], 30),                   // his hands going see-through
      sh(43.5, [2.0, 2.4, 3.0], [.9, .9, .3], 32),                    // he looks down
      WS(44.65, 8),                        // HIS shadow: a ponytail
      sh(45.65, [2.4, 1.7, 3.4], FX.boy, 26),                         // he looks at Mia
      sh(46.8, [.9, 1.3, -1.0], WL(.05), 56),                          // MIA's shadow: a hood
      sh(47.6, [2.2, 1.6, 3.4], FX.boy, 22),                          // that was never her shadow
      sh(49.6, [.6, 2.2, 4.6], [1.0, 1.1, -1.2], 36),                 // walking my shadow out the door
      WS(52.6, 8.6),                          // nine steps: at the door
      sh(53.3, [-.2, 1.7, 3.8], [-1.35, 1.2, .5], 32),                 // he grabs Mom's arm
      sh(54.45, [-2.5, 1.6, 3.0], FX.mom, 26),                         // she looks right through him
      sh(55.7, [-2.0, 1.6, 3.6], [-2.0, 1.35, 0], 38),                 // Mia leans in
      sh(57.05, [-2.1, 1.6, 3.0], [-2.1, 1.45, .15], 30, [-2.5, 1.5, .1]),   // both faces: Mia leans to Mom's ear, smiling at us            // "Mom, I love you"
      sh(58.95, [SX(9) + .35, 1.25, BZ + 2.2], [SX(9) + .3, 1.2, BZ], 60),                   // the shadow lifts its foot. CUT.
    ];
    const ek = keys => t => { let e = keys[0][1]; for (const [tt, v] of keys) if (t >= tt) e = v; return e; };
    live.push(liveFace(boy, ek([[0, 'neutral'], [17.5, 'annoyed'], [26.2, 'smug'], [31.1, 'shocked'], [34.5, 'angry'], [35.5, 'sad'], [42.3, 'scared'], [44.6, 'shocked'], [47.6, 'terrified'], [53.3, 'scared']]),
      speaking([24]), blinkTrack(blinkTimes(62, [17.5, 31.1, 43.5, 45.6], 3), 30)));
    live.push(liveFace(mia, ek([[0, 'smug'], [20.2, 'happy'], [22.8, 'smug'], [24.8, 'happy'], [27.8, 'smug'], [31.1, 'angry'], [33.1, 'smug'], [36.7, 'happy'], [38.9, 'smug'], [39.2, 'happy'], [40.6, 'smug'], [55.7, 'evil'], [57.0, 'happy']]),
      speaking([22, 26, 28, 43]), blinkTrack(blinkTimes(62, [20.2, 31.1, 55.7], 5), 30)));
    live.push(liveFace(mom, ek([[0, 'happy'], [29.7, 'shocked'], [31.1, 'angry'], [35.5, 'annoyed'], [53.3, 'neutral']]), () => 0, blinkTrack(blinkTimes(62, [29.7, 35.5], 9), 30)));
    live.push(liveFace(gma, ek([[0, 'happy']]), () => 0, blinkTrack(blinkTimes(62, [14], 11), 30)));
    for (const f of live) await f.ready();
    post = { ...base, sun, exposure: 1.2 };
  }
  // ======================================================== shared update
  const ry0 = new Map(acts.map(x => [x.a, x.ry || 0]));
  const update = t => {
    for (const x of acts) { const s = x.tr(t); if (s.walk && s.glide && t - s.t < s.glide) s.pose = Math.floor(t * 4) % 2 ? P.walkA : P.walkB;   // walking, never sliding
      const sway = { ...s.pose, root: { ...(s.pose.root || {}), rz: ((s.pose.root || {}).rz || 0) + Math.sin(t * 1.4 + (s.at ? s.at[0] : 0)) * .012 } }, r = sway.root;
      x.a.rig.pose(sway);   // the rig resets the outer group, so the stage position goes on after it
      x.a.root.position.set((s.at ? s.at[0] : 0) + (r.x || 0), (loc === 'street' ? .14 : 0) + (r.y || 0), (s.at ? s.at[1] : 0) + (r.z || 0)); x.a.root.rotation.y = (s.ry ?? ry0.get(x.a)) + (r.ry || 0); if (x.hideBefore !== undefined) x.a.root.visible = t >= x.hideBefore; }
    upd(t); for (const f of live) f.at(t);
    let i = 0; while (i + 1 < shots.length && shots[i + 1].t <= t) i++; const S = shots[i], nx = shots[i + 1], d = (nx ? nx.t : S.t + 3) - S.t, k = ease(Math.min(1, (t - S.t) / d));
    const p = new THREE.Vector3(...S.p), l = new THREE.Vector3(...S.l); p.lerp(l, .07 * k);   // every shot pushes in slowly (~7%)
    if (opts.camP) { p.set(...opts.camP); l.set(...opts.camL); }
    cam.position.copy(p); cam.fov = opts.fov || S.fov; cam.updateProjectionMatrix(); cam.lookAt(l); cam.updateMatrixWorld();
    post.focus = cam.position.distanceTo(new THREE.Vector3(...(S.f || S.l)));
    return true;
  };
  update(opts.t ?? shots[0]?.t ?? 0); globalThis.SS = { shots, acts: acts.length };
  return { camera: cam, sun, post, update };
}
