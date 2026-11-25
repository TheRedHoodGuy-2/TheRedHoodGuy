// 07 DO-OVERS ("In This Town, You Get 100 Do-Overs ⏪"). Voice: topics/do_overs/voice/voice.wav (69.6 s) + 4.2 s shown end.
// Sets: the dense suburb street at the origin (exteriors, from Sunset Tag) + the town moved to x + 3000 with House A
// furnished (kitchen, his bedroom, entry) on its real lot, so every window sees houses. Shot plan: topics/do_overs/SHOTPLAN.md.
// The rule's prop: a lit number plate on everyone's left wrist (Mom's is hidden under her big watch until the last shot).
import * as THREE from 'three';
import { stage } from '../engine/act.js';
import { buildTown } from '../engine/sets/town.js';
import { dayLook, paintSky } from '../engine/look.js';
import { loadRbx } from '../engine/rbxmodel.js';
import { ph } from '../engine/build.js';
import { planShots, validate } from '../engine/shots.js';
import { cameraRig } from '../engine/camera.js';
import { limbTo } from '../engine/r6pose.js';
import { flapTrack } from '../engine/lipsync.js';

const J = async p => (await fetch(new URL(p, document.baseURI))).json();
export const DUR = 73.8;
const lerp = (a, b, k) => a + (b - a) * k, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = u => { u = cl(u); return u * u * (3 - 2 * u); };
const STUD = .34;

// ---------- poses (avatar frame) ----------
const P = {
  stand: { armL: [.1, -1, .03], armR: [-.1, -1, -.02], legL: [.05, -1, .02], legR: [-.05, -1, -.02], head: [.05, .02, .03], root: { rz: .02 } },
  relaxed: { armL: [.14, -1, .06], armR: [-.08, -1, -.05], legL: [.09, -1, .05], legR: [-.04, -1, -.03], head: [.12, .03, .06], root: { rz: .03, x: .02 } },
  sad: { armL: [.05, -1, .14], armR: [-.06, -1, .12], legL: [.04, -1, .02], legR: [-.07, -1, .03], head: [.06, .17, .08], root: { rx: .07 } },
  proud: { armL: [.3, -.9, -.1], armR: [-.26, -.92, -.12], legL: [.16, -1, .03], legR: [-.14, -1, -.03], head: [-.08, -.12, .06], root: { rx: -.06 } },
  shrug: { armL: [.55, -.6, .35], armR: [-.6, -.55, .3], legL: [.1, -1, .04], legR: [-.05, -1, -.02], head: [.2, -.05, .15], root: { rz: .04 } },
  sitGround: { legL: { r: [-1.5708, 0, .08] }, legR: { r: [-1.5708, 0, -.12] }, armL: [.35, -.85, -.45], armR: [-.4, -.82, -.45], head: [.1, .05, .05], root: { y: -.51, rx: -.12 } },
  lieBack: { armL: [.12, -1, .02], armR: [-.12, -1, .02], legL: [.05, -1, 0], legR: [-.05, -1, 0], head: [0, -.1, 0], root: { rx: -1.53, y: .35 } },
  kneel: { legL: { r: [-1.45, 0, .05], o: [0, -.05, .1] }, legR: [-.06, -1, .35], armL: [.2, -.4, .9], armR: [-.25, -.35, .9], head: [0, -.35, 0], root: { y: -.38, rx: .12 } },
  fallSide: { armL: [.9, .2, .3], armR: [-.6, -.7, .2], legL: [.3, -.95, .1], legR: [-.1, -1, -.2], head: [.3, 0, .3], root: { rz: 1.2, y: .1 } },
  bike: { legL: { r: [-1.2, 0, .1] }, legR: { r: [-.6, 0, -.1] }, armL: [.2, -.45, .9], armR: [-.2, -.45, .9], head: [0, -.1, 0], root: { y: .28, rx: .25 } },
};
const fa = (part, hand, elbow, root = {}) => limbTo(part, root, hand, elbow);
P.wristLook = { ...P.stand, armL: fa('armL', [-.05, 1.25, .42], [.42, 1.0, .1]), head: [0, .45, -.15], root: { rx: .05 } };
P.watchFix = { ...P.relaxed, armL: fa('armL', [-.02, .8, .38], [.4, .88, .02]), armR: fa('armR', [.06, .83, .4], [-.4, .9, .06]), head: [0, .5, .05] };
P.fistPump = { ...P.proud, armR: fa('armR', [-.28, 1.12, .28], [-.45, .92, -.05]), head: [-.1, -.25, .12], root: { rx: -.08, rz: -.05 } };
P.handHead = { ...P.relaxed, armR: limbTo('armR', {}, [-.35, 1.62, .55]), head: [-.15, .1, .08] };
P.hug = { ...P.stand, armL: fa('armL', [-.2, 1.0, .45], [.4, 1.05, .2]), armR: fa('armR', [.2, 1.0, .45], [-.4, 1.05, .2]), head: [.2, .1, .1], root: { rx: .12 } };
P.crack = { ...P.relaxed, armL: fa('armL', [.05, 1.05, .45], [.4, .98, .12]), armR: fa('armR', [-.05, 1.12, .48], [-.4, .98, .12]), head: [0, .4, 0], root: { rx: .1 } };
P.sinkWash = { ...P.relaxed, armL: fa('armL', [.1, .98, .45], [.42, .98, .14]), armR: fa('armR', [-.12, .98, .45], [-.42, .98, .14]), head: [0, .3, 0], root: { rx: .08 } };
P.shh = { ...P.relaxed, armR: fa('armR', [-.02, 1.55, .32], [-.38, 1.05, .14]), armL: fa('armL', [.1, .98, .45], [.42, .98, .14]), head: [.15, -.05, .1] };
P.cry = { ...P.sad, armL: fa('armL', [-.05, 1.5, .3], [.38, 1.05, .12]), armR: fa('armR', [.05, 1.5, .3], [-.38, 1.05, .12]), head: [0, .25, 0], root: { rx: .12 } };
P.lock = { ...P.relaxed, armR: limbTo('armR', {}, [-.05, 1.15, .55]), head: [0, .2, 0], root: { rx: .05 } };
P.cough = { ...P.sad, armR: fa('armR', [-.02, 1.5, .3], [-.38, 1.05, .12]), head: [0, .2, 0], root: { rx: .15 } };
P.reach = { ...P.relaxed, armR: limbTo('armR', { rx: .1 }, [-.1, 1.05, .55]), head: [.3, .3, .1], root: { rx: .1 } };
P.wave = { ...P.relaxed, armR: { r: [3.05, .42, 0], o: [-.057, .252, -.013] }, armL: [.25, -.95, .05] };
P.carry = { ...P.relaxed, armL: limbTo('armL', {}, [.16, 1.0, .42]), armR: limbTo('armR', {}, [-.16, 1.0, .42]), head: [.15, -.05, .1] };
P.lookAround = { ...P.carry, head: [-.5, .05, -.1] };
P.sitBed = { ...P.sitGround, armL: [.3, -.9, -.3], armR: [-.32, -.9, -.3], root: { y: -.51, rx: -.05 } };
P.bedLook = { ...P.sitBed, armL: fa('armL', [-.05, .75, .42], [.42, .55, .1], P.sitBed.root), head: [0, .4, -.1] };
P.bedWrist = P.bedLook;

export async function build({ scene, W: w, H: h, opts = {} }) {
  const { buildSuburb } = await import('../engine/sets/suburb.js'); await buildSuburb(scene);
  const T = await buildTown(scene, { interiors: true, furnish: ['kitchen', 'his', 'parents', 'living', 'entry', 'dining'] });
  T.root.position.x += 3000; scene.updateMatrixWorld(true);
  if (opts.dbg) { const H0 = T.houses.A, inner = H0.root.parent; for (const [id, r] of Object.entries(H0.rooms)) { const a = inner.localToWorld(new THREE.Vector3(r.rect.x, r.y || 0, r.rect.z)), b = inner.localToWorld(new THREE.Vector3(r.rect.x + r.rect.w, r.y || 0, r.rect.z + r.rect.d)); console.error('ROOM', id, [a.x, a.z, b.x, b.z, a.y].map(v => +v.toFixed(2)).join(' '), JSON.stringify(r.windows || r.win || '').slice(0, 200)); } }
  const ROOMS = []; { const H0 = T.houses.A, inner = H0.root.parent; for (const [id, r] of Object.entries(H0.rooms)) { const a = inner.localToWorld(new THREE.Vector3(r.rect.x, r.y || 0, r.rect.z)), b = inner.localToWorld(new THREE.Vector3(r.rect.x + r.rect.w, r.y || 0, r.rect.z + r.rect.d)); if (id === 'dining') continue; ROOMS.push({ id, x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), z0: Math.min(a.z, b.z), z1: Math.max(a.z, b.z), y: a.y }); } }
  { const k = ROOMS.find(r => r.id === 'kitchen'); k.z1 = -219.99 + 0; }   // open plan into the dining room
  if (opts.dbg) { const out = []; scene.traverse(o => { if (['bed', 'island', 'desk', 'gaming chair', 'nightstand', 'dresser'].includes(o.name) && o.getWorldPosition(new THREE.Vector3()).x > 3000) { const b = new THREE.Box3().setFromObject(o); out.push([o.name, b.min.toArray().map(v => +v.toFixed(2)), b.max.toArray().map(v => +v.toFixed(2)), +o.rotation.y.toFixed(2)]); } }); console.error('FURN', JSON.stringify(out)); const dd = []; scene.traverse(o => { if (/door/i.test(o.name) && !o.children.some(c => /door/i.test(c.name))) { const v = o.getWorldPosition(new THREE.Vector3()); if (v.x > 3215 && v.x < 3241 && v.y < 3) dd.push(o.name + '@' + [v.x, v.y, v.z].map(q => q.toFixed(2)).join(',')); } }); console.error('DOORS', dd.slice(0, 40).join(' | ')); }
  const sub = (x, z) => { const a = Math.abs(z); return a < 3.6 ? .012 : a < 3.88 ? .16 : a < 5.78 ? .14 : 0; };
  const ground = (x, z) => x > 2000 ? 0 : sub(x, z);
  const F = await J('topics/do_overs/voice/flap.json'), flap = flapTrack(F, 0);
  const S = stage(scene, { POSES: P, ground, flap });
  // ---------- places (world, from the furnish pass: island x 3229.2-3231.84 z -228.57..-227.29, run on the north wall, bed x 3229.06-3232.33 upstairs) ----------
  const K = { sink: [3231.3, -229.35], island: [3230.52, -227.93], top: 1.02, counter: .93 }, BED = { x0: 3229.06, x1: 3232.33, z: -230.05, y: 4.38, top: 4.85 }, PBED = { x0: 3221.82, z: -229.06 };
  const DOOR = [3220.73, -231.58];   // front door: plans.js House A, entry north wall at plan x 3.5
  // ---------- light ----------
  const LOOK = dayLook(scene, { sunAz: 160, sunEl: 45, sun: 3.3, fill: .9 }), post = LOOK.post;
  const TIMES = {
    morning: { az: 150, el: 35, col: '#fff1dc', int: 3.2, fill: .95, hs: '#b5cff0', hg: '#62704a', top: '#3d7bd8', hor: '#d6e9fb', exp: 1.2 },
    day: { az: 200, el: 55, col: '#fffaf0', int: 3.4, fill: .9, hs: '#a9cbf2', hg: '#5f6e40', top: '#2f74d6', hor: '#cfe6fb', exp: 1.2 },
    sunset: { az: 100, el: 8, col: '#ffc79a', int: 2.8, fill: .9, hs: '#a7b9de', hg: '#5a5040', top: '#4a6fc0', hor: '#f4c294', exp: 1.2 },
    night: { az: 120, el: 30, col: '#9fb6ff', int: .55, fill: 1.1, hs: '#4a5a8a', hg: '#2a2c36', top: '#0e1630', hor: '#2b3a66', exp: 1.35 },
  };
  const tod = t => t < 7 ? 'morning' : t < 25 ? 'day' : t < 27.5 ? 'sunset' : t < 28.6 ? 'night' : t < 31.8 ? 'morning' : t < 42.7 ? 'day' : t < 45 ? 'sunset' : t < 49.8 ? 'day' : t < 66.6 ? 'night' : 'morning';
  let skyKey = '';
  const light = t => { const L = TIMES[tod(t)]; LOOK.setSun(L.az, L.el, { color: L.col, intensity: L.int, fill: L.fill }); LOOK.hemi.color.set(L.hs); LOOK.hemi.groundColor.set(L.hg); post.exposure = L.exp;
    if (skyKey !== tod(t)) { skyKey = tod(t); const a = L.az * Math.PI / 180; paintSky(LOOK.sky, L.top, L.hor, null, new THREE.Vector3(Math.sin(a), .05, Math.cos(a)).normalize()); } };
  const lamp = new THREE.PointLight('#ffd8a8', 0, 9, 1.6); lamp.position.set(K.island[0], 2.6, K.island[1]); scene.add(lamp);

  // ---------- cast ----------
  const A = {}, mk = async (n, key, o) => (A[n] = await S.actor(key, o));
  await mk('boy', 'boy', { emo: 'neutral' }); await mk('mom', 'mom', { emo: 'happy' });
  await mk('biker', 'swapA', { emo: 'excited' }); await mk('nb', 'm002', { emo: 'sad' }); await mk('pizza', 'm061', { emo: 'nervous' });
  await mk('lg', 'f027', { emo: 'annoyed' }); await mk('suitor', 'm026', { emo: 'happy' }); await mk('old', 'm087', { emo: 'neutral' });

  // ---------- the wrist number: a lit plate on the front of the left wrist (canvas digits) ----------
  const plate = (actor, n0) => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, transparent: true });
    for (let k = 0; k < 4; k++) { const q = new THREE.Mesh(new THREE.PlaneGeometry(.92, .46), mat), a = k * Math.PI / 2; q.position.set(Math.sin(a) * .51, 0, Math.cos(a) * .51); q.rotation.y = a; m.add(q); }
    m.position.set(0, -.8, 0); m.scale.y = .85; actor.a.rig.parts.armL.add(m);
    const o = { m, n: null, set(n) { if (n === this.n) return; this.n = n; const g = cv.getContext('2d'); g.clearRect(0, 0, 256, 128); g.fillStyle = '#0d1420'; g.beginPath(); g.roundRect(4, 4, 248, 120, 26); g.fill();
      g.strokeStyle = '#3df2ff'; g.lineWidth = 6; g.stroke(); g.fillStyle = n <= 3 ? '#ff4d4d' : '#7ff7ff'; g.font = `bold ${n < 10 ? 112 : 92}px Poppins, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 128, 70); tex.needsUpdate = true; } };
    o.set(n0); return o; };
  const W = { boy: plate(A.boy, 100), biker: plate(A.biker, 37), nb: plate(A.nb, 60), pizza: plate(A.pizza, 10), suitor: plate(A.suitor, 3), old: plate(A.old, 0), mom: plate(A.mom, 1) };
  // Mom's big watch over her plate: leather band round the wrist block + round steel face (in arm part units, studs)
  const mkWatch = () => { const g = new THREE.Group(), band = new THREE.MeshStandardMaterial({ color: '#4a2e1c', roughness: .7 }), steel = new THREE.MeshStandardMaterial({ color: '#c9ccd2', metalness: .9, roughness: .25 });
    for (const [x, z, sx, sz] of [[0, .53, 1.12, .1], [0, -.53, 1.12, .1], [.53, 0, .1, 1.12], [-.53, 0, .1, 1.12]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(sx, .42, sz), band); b.position.set(x, 0, z); g.add(b); }
    const face = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .12, 40), steel); face.rotation.x = Math.PI / 2; face.position.z = .62; g.add(face);
    const dial = new THREE.Mesh(new THREE.CircleGeometry(.33, 40), new THREE.MeshStandardMaterial({ color: '#f4efe6', roughness: .4 })); dial.position.z = .69; g.add(dial); return g; };
  const watch = mkWatch(); watch.position.set(0, -.8, 0); A.mom.a.rig.parts.armL.add(watch);
  const watchOff = mkWatch(); watchOff.scale.setScalar(STUD); watchOff.rotation.x = -Math.PI / 2; watchOff.position.set(3231.35, K.top + .02, -228.3); scene.add(watchOff);

  // ---------- props ----------
  const rbx = async (id, at, o = {}) => { const m = await loadRbx(id, o); m.position.set(...at); m.rotation.y = o.ry || 0; scene.add(m); return m; };
  const camry = await rbx(133877355439325, [-22, 0, -5.4], { ry: Math.PI / 2 });
  const bus = await rbx(3138879863, [30, 0, 1.9], { ry: -Math.PI / 2 });
  const bike = await rbx(91358100215341, [0, 0, 1.6], { ry: Math.PI / 2 });
  const pizzaBox = await rbx(3028085134, [0, 0, 0], { scale: .45 }); A.pizza.a.root.add(pizzaBox); pizzaBox.position.set(0, .9, .62);
  const phone = await rbx(9403575706, [K.island[0] - .55, K.top + .01, K.island[1] + .15], { scale: .28 });
  // car keys: ring + two keys + fob (metres)
  const mkKeys = () => { const g = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: '#c8ccd2', metalness: .9, roughness: .3 }), blk = new THREE.MeshStandardMaterial({ color: '#16171a', roughness: .5 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.02, .003, 8, 24), steel); ring.rotation.x = Math.PI / 2; g.add(ring);
    for (const a of [.4, -.5]) { const k = new THREE.Mesh(new THREE.BoxGeometry(.016, .003, .055), steel); k.position.set(Math.sin(a) * .045, 0, Math.cos(a) * .045); k.rotation.y = a; g.add(k); }
    const fob = new THREE.Mesh(new THREE.BoxGeometry(.03, .013, .055), blk); fob.position.set(0, .002, -.05); g.add(fob); return g; };
  const keysIsland = mkKeys(); keysIsland.position.set(3231.1, 1.03, -228.35); scene.add(keysIsland);
  const keysBoy = mkKeys(); keysBoy.scale.setScalar(1 / STUD * 1.4); keysBoy.position.set(0, -1.08, .1); A.boy.a.rig.parts.armR.add(keysBoy);
  const keysMom = mkKeys(); keysMom.scale.setScalar(1 / STUD * 1.4); keysMom.position.set(0, -1.08, .1); A.mom.a.rig.parts.armR.add(keysMom);
  const egg = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshStandardMaterial({ color: '#f3ead8', roughness: .5 })); egg.scale.set(.065, .085, .065).multiplyScalar(1 / STUD); egg.position.set(0, -1.12, .05); A.boy.a.rig.parts.armR.add(egg);
  // phone: lying flat, with a screen that lights up when it rings
  { phone.updateMatrixWorld(true); const b0 = new THREE.Box3().setFromObject(phone).getSize(new THREE.Vector3()); if (b0.z <= b0.x && b0.z <= b0.y) phone.rotation.x = -Math.PI / 2; else if (b0.x <= b0.y) phone.rotation.set(-Math.PI / 2, 0, 0), phone.rotation.order = 'YXZ', phone.rotation.y = Math.PI / 2, phone.rotation.x = -Math.PI / 2; if (opts.dbg) console.error('PHONE', b0.toArray()); } phone.updateMatrixWorld(true); const pb = new THREE.Box3().setFromObject(phone), psz = pb.getSize(new THREE.Vector3());
  const scv = document.createElement('canvas'); scv.width = 256; scv.height = 512; { const g = scv.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#1d3b2a'); gr.addColorStop(1, '#0b1410'); g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = 'bold 30px Poppins, sans-serif'; g.fillText('Incoming call', 128, 120); g.font = 'bold 40px Poppins, sans-serif'; g.fillText('UNKNOWN', 128, 180);
    g.fillStyle = '#e03b3b'; g.beginPath(); g.arc(70, 430, 34, 0, 7); g.fill(); g.fillStyle = '#2fbf5b'; g.beginPath(); g.arc(186, 430, 34, 0, 7); g.fill(); }
  const scTex = new THREE.CanvasTexture(scv); scTex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(psz.x, psz.z * .5) * .9, Math.min(psz.z, psz.x * 2) * .9), new THREE.MeshBasicMaterial({ map: scTex, toneMapped: false }));
  screen.rotation.x = -Math.PI / 2; screen.position.set((pb.min.x + pb.max.x) / 2, pb.max.y + .002, (pb.min.z + pb.max.z) / 2); scene.add(screen);
  const phoneBase = phone.position.clone(), screenBase = screen.position.clone();
  // the empty cake box: a white bakery box, lid open (folded card)
  const box = new THREE.Group(); { const card = new THREE.MeshStandardMaterial({ color: '#f5f1ea', roughness: .8 }); const b = new THREE.Mesh(new THREE.BoxGeometry(.36, .14, .36), card); b.position.y = .07; box.add(b);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(.36, .006, .36), card); lid.position.set(0, .3, -.24); lid.rotation.x = -1.2; box.add(lid); box.position.set(K.island[0] - .2, K.top, K.island[1]); scene.add(box); }
  // mixing bowl (lathe) + flour cloud
  const bowl = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.08, 0], [.13, .03], [.16, .09], [.17, .12], [.165, .12], [.155, .09], [.125, .035], [.075, .008], [0, .008]].map(([x, y]) => new THREE.Vector2(x, y)), 40), new THREE.MeshStandardMaterial({ color: '#e9e4dc', roughness: .35, side: THREE.DoubleSide }));
  bowl.position.set(K.island[0] + .2, K.top, K.island[1] + .25); scene.add(bowl);
  const flour = (() => { const n = 260, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), V = []; let r = 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < n; i++) V.push([(rnd() - .5) * 1.1, .5 + rnd() * 1.1, (rnd() - .5) * 1.1, rnd()]); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'), gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,253,248,.9)'); gr.addColorStop(1, 'rgba(255,253,248,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
    const m = new THREE.Points(g, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(cv), size: .16, transparent: true, depthWrite: false, opacity: .9 })); m.position.copy(bowl.position); m.position.y += .1; m.frustumCulled = false; scene.add(m);
    return { m, set(t) { const u = cl(t - 55.9, 0, 2.3); V.forEach((v, i) => { const k = u * (.6 + v[3] * .6); pos[i * 3] = v[0] * k; pos[i * 3 + 1] = v[1] * k - .5 * k * k; pos[i * 3 + 2] = v[2] * k; }); g.attributes.position.needsUpdate = true; m.material.opacity = .9 * (1 - u / 2.3); m.material.size = .12 + u * .08; } }; })();
  const lopsided = await rbx(5002633399, [K.island[0] + .25, K.top, K.island[1] - .1], { scale: .38 }); lopsided.rotation.z = .12;
  // calendar on the kitchen's west wall by the fridge (paper, red header, big day name)
  const cal = (() => { const cv = document.createElement('canvas'); cv.width = 384; cv.height = 512; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.42, .56), new THREE.MeshStandardMaterial({ map: tex, roughness: .9 })); m.position.set(3227.98, 1.6, -228.6); m.rotation.y = Math.PI / 2; scene.add(m);
    let cur = ''; return { m, set(day) { if (day === cur) return; cur = day; const g = cv.getContext('2d'); g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, 384, 512); g.fillStyle = '#d23a3a'; g.fillRect(0, 0, 384, 110); g.fillStyle = '#fff'; g.font = 'bold 54px Poppins, sans-serif'; g.textAlign = 'center'; g.fillText('MARCH', 192, 75);
      g.fillStyle = '#222'; g.font = 'bold 60px Poppins, sans-serif'; g.fillText(day, 192, 250); g.font = 'bold 150px Poppins, sans-serif'; g.fillText(day === 'TUESDAY' ? '14' : '15', 192, 440); tex.needsUpdate = true; } }; })();
  const clock = await ph('wall_clock', { scale: 1 }).catch(e => { console.error('NOCLOCK', String(e).slice(0, 80)); return null; }); if (clock) { clock.position.set(3233.15, 2.1, -228.4); clock.rotation.y = -Math.PI / 2; scene.add(clock); }
  const alarm = await ph('alarm_clock_01', { scale: 1 }).catch(() => null); if (alarm) { alarm.position.set(BED.x0 + .15, BED.y + .55, BED.z - .75); scene.add(alarm); }

  // ======================= STAGING (times from voice/words.json) =======================
  const N = Math.PI;   // ry: 0 faces +z (south), PI faces -z (north), N/2 faces +x
  // 0-4.0 the rule: a kid bikes down the street, clips the kerb, falls; the street rewinds; he rides through clean
  const bikeX = t => t < 2.3 ? lerp(-9, 1, t / 2.3) : t < 2.9 ? 1 : t < 3.5 ? lerp(1, -3, sm((t - 2.9) / .6)) : lerp(-3, 1.5, (t - 3.5) / .5);
  const pedal = t => ({ ...P.bike, legL: { r: [-1.2 + .35 * Math.sin(t * 9), 0, .1] }, legR: { r: [-1.2 - .35 * Math.sin(t * 9), 0, -.1] } });
  A.biker.show(-1, 7.0).key(-1, { pose: pedal, at: [-9, 1.6], ry: N / 2 });
  A.biker.extra = (t, a) => { const x = bikeX(Math.min(t, 4)); a.a.root.position.x = x; a.a.root.position.z = 1.6; bike.position.x = x; bike.rotation.z = t >= 2.3 && t < 2.9 ? lerp(0, 1.4, sm((t - 2.3) / .25)) : 0; };
  A.biker.key(3.95, { pose: 'wristLook', dur: .4 }).key(2.3, { pose: 'fallSide', dur: .2 }).key(2.9, { pose: pedal, dur: .05 }).face(2.3, 'shocked').face(3.2, 'happy');
  // 7.0-8.9 neighbour on his walk with an F test, 60 left
  A.nb.show(7.0, 8.9).key(7.0, { pose: 'sad', at: [-4, -6.4], ry: 0 }).key(7.4, { pose: { ...P.wristLook, head: [.1, .5, -.1] }, dur: .5 }).face(7, 'sad');
  // 8.9-10.7 pizza guy lost, turning round with the box, 10 left
  A.pizza.show(8.9, 10.7).key(8.9, { pose: 'carry', at: [4, 4.6], ry: .4 }).key(9.4, { pose: 'lookAround', ry: -.5, dur: .5 }).key(10.1, { pose: 'carry', ry: .7, dur: .5 }).face(8.9, 'nervous');
  // 10.7-12.9 the guy asking out the girl: she walks off, 3 left
  A.lg.show(10.7, 12.9).key(10.7, { pose: 'relaxed', at: [12, -6.2], ry: N / 2 }).face(10.7, 'annoyed'); A.lg.run(11.6, [[12, -6.2], [8, -6.7]], { step: .6, T: .5 });
  A.suitor.show(10.7, 12.9).key(10.7, { pose: 'kneel', at: [13.6, -6.2], ry: -N / 2 }).key(11.9, { pose: 'sad', dur: .4 }).face(10.7, 'happy').face(11.8, 'sad');
  // 12.9-15.1 zero: an old man lying in his bed (parents' room), alarm ringing, he does not move
  A.old.show(12.9, 15.1).key(12.9, { pose: 'lieBack', at: [PBED.x0 + 2.15, PBED.z], ry: N / 2, y: BED.top }).face(12.9, 'sleepy');
  // 15.1-17.5 the boy sitting up in his bed, proud of his 100
  A.boy.show(15.1, 17.5).key(15.1, { pose: 'sitBed', at: [BED.x0 + .45, BED.z], ry: N / 2, y: BED.top }).key(15.8, { pose: 'bedLook', dur: .4 }).face(15.1, 'happy');
  // 17.5-23.5 kitchen: Mom straps her watch at the island, turns to him, says the line, hand on his head
  const MOM_K = [3230.2, -229.1], BOY_K = [3229.35, -229.05];
  A.mom.show(17.5, 23.5).key(17.5, { pose: 'watchFix', at: MOM_K, ry: 0 }).key(19.7, { pose: 'relaxed', ry: -1.51, dur: .6 })
    .key(20.6, { pose: { ...P.relaxed, armR: limbTo('armR', {}, [-.05, 1.86, .8]), head: [-.15, .2, .08] }, dur: .5 }).face(17.5, 'neutral').face(20.0, 'happy').talk(20.06, 22.9);
  A.boy.show(17.5, 23.5).key(17.5, { pose: 'relaxed', at: BOY_K, ry: 1.63 }).key(20.7, { pose: { ...P.relaxed, head: [0, .25, 0] }, dur: .4 }).face(17.5, 'happy').face(21.5, 'proud');
  // 23.5-25.0 Tuesday: calendar insert, then the boy's face as he reads it
  A.boy.show(23.5, 25.0).key(23.5, { pose: 'relaxed', at: [3229.6, -226.6], ry: -2.42 }).face(23.5, 'neutral').face(24.4, 'smug');
  // 25.0-27.5 Mom drives off at sunset; the boy waves from the walk
  A.boy.show(25.0, 27.5).key(25.0, { pose: 'relaxed', at: [-17, -6.4], ry: N / 2 }).key(25.4, { pose: 'wave', dur: .3 }).face(25, 'happy');
  // 27.5-28.5 night: he waits at the kitchen window (back to us, the empty street outside)
  A.boy.show(27.5, 29.0).key(27.5, { pose: 'sad', at: [3231.3, -229.35], ry: N }).key(28.45, { pose: 'relaxed', ry: .3, turn: .35, dur: .35 }).face(27.5, 'sad').face(28.5, 'determined');
  // 29.0-30.7 7 a.m.: he jolts up in bed
  A.boy.show(29.0, 30.7).key(29.0, { pose: 'lieBack', at: [BED.x0 + 2.5, BED.z], ry: N / 2, y: BED.top }).key(29.6, { pose: 'sitBed', at: [BED.x0 + .45, BED.z], y: BED.top, dur: .3, style: 'snap' }).face(29.0, 'sleepy').face(29.6, 'shocked');
  // 30.7-31.8 he hides her car keys (reaching across the island, eyes on the hall)
  A.boy.show(30.7, 31.8).key(30.7, { dur: .01, pose: 'reach', at: [3230.9, -229.1], ry: 0 }).face(30.7, 'smug');
  // 31.8-33.8 Mom at the bus stop, the bus pulls in
  A.mom.show(31.8, 33.8).key(31.8, { pose: 'relaxed', at: [8, 4.5], ry: -N / 2 }).face(31.8, 'happy');
  // 34.3-35.5 he fakes sick in bed, Mom at the bedside
  A.boy.show(33.8, 35.5).key(33.8, { pose: 'lieBack', at: [BED.x0 + 2.5, BED.z], ry: N / 2, y: BED.top }).face(33.8, 'determined').key(34.3, { pose: { ...P.sitBed, armR: fa('armR', [.0, .5, .3], [-.4, .6, .05], P.sitBed.root), head: [.35, .15, .1] }, at: [BED.x0 + .45, BED.z], ry: N / 2, y: BED.top }).face(34.3, 'sad');
  A.mom.show(34.3, 35.5).key(34.3, { pose: 'relaxed', at: [3230.6, -228.4], ry: -2.4, y: BED.y }).face(34.3, 'nervous');
  // 35.5-36.8 lunch: Mom heads out through the kitchen toward the front door
  A.mom.show(35.5, 36.8).face(35.5, 'happy'); A.mom.run(35.5, [[3231.5, -226.2], [3228.4, -226.4]], { step: .6, T: .45 });
  // 37.3-38.1 begging, 38.1-38.8 crying, 38.8-40.2 he stands in her way, arm out
  const MOM_B = [3229.3, -226.2], BOY_B = [3230.0, -226.4];
  A.mom.show(36.8, 40.2).key(37.3, { pose: 'relaxed', at: MOM_B, ry: 1.85 }).key(38.9, { pose: 'shrug', dur: .4 }).face(37.3, 'nervous').face(38.9, 'sad');
  A.boy.show(36.8, 40.2).key(36.8, { pose: 'relaxed', at: BOY_B, ry: -1.3 }).face(36.8, 'determined').key(37.3, { pose: 'kneel', dur: .35 }).face(37.3, 'scared');
  A.boy.key(38.1, { pose: { ...P.kneel, head: [0, .15, .05] }, dur: .25 }).face(38.1, 'crying');
  A.boy.key(38.8, { pose: 'lock', at: [DOOR[0] + .35, DOOR[1] + .62], ry: N, dur: .05 }).key(39.45, { pose: { ...P.stand, armL: { r: [.01, 0, .9], o: [.05, -.03, 0] }, armR: { r: [.01, 0, -.9], o: [-.05, -.03, 0] }, head: [0, -.12, 0], root: { rx: -.06 } }, at: [DOOR[0] + .35, DOOR[1] + .3], ry: 0, turn: .35, dur: .35 }).face(38.8, 'angry');
  // 40.2-42.7 rewind x3
  A.boy.show(40.2, 42.7).key(40.2, { pose: 'relaxed', at: BOY_B, ry: -1.3 }).key(41.5, { pose: 'proud', dur: .25, style: 'snap' }).face(40.2, 'scared').face(41.5, 'furious');
  // 45.0-49.8 wrist check: 100; he grins, fist pump (back to the island, facing the dining room)
  A.boy.show(45.0, 49.8).key(44.6, { pose: 'wristLook', at: [3230.52, -226.75], ry: 0 }).key(47.8, { pose: 'fistPump', dur: .3 }).face(45.0, 'confused').face(47.6, 'excited');
  // 49.8-52.6 sixty Tuesdays later: night, he stares at the empty cake box
  A.boy.show(49.8, 52.6).key(49.8, { dur: .01, pose: 'sad', at: [K.island[0] - .2, -226.75], ry: N }).face(49.8, 'sad');
  // 52.6-54.3 Mom picking up her keys, eyes on the box
  A.mom.show(52.6, 54.3).key(52.6, { pose: 'reach', at: [K.island[0] - .3, -229.05], ry: 0 }).face(52.6, 'thinking');
  // 54.3-62.6 he bakes: cracks eggs, flour everywhere
  A.boy.show(54.3, 62.6).key(54.3, { pose: 'crack', at: [K.island[0] + .2, -226.75], ry: N }).face(54.3, 'determined').face(55.9, 'shocked').face(58.2, 'happy');
  // 58.2-66.6 Mom stays, laughs at the lopsided cake
  A.mom.show(58.2, 66.6).key(58.2, { pose: 'relaxed', at: [K.island[0] + .3, -229.05], ry: 0 }).face(58.2, 'happy').face(60.0, 'laugh');
  // 64.6-66.6 the hug (south of the island)
  A.boy.show(64.6, 66.6).key(64.6, { pose: 'hug', at: [3229.95, -226.3], ry: N / 2 }).face(64.6, 'happy');
  A.mom.key(64.6, { pose: 'hug', at: [3230.45, -226.3], ry: -N / 2, dur: .3 });
  // 66.6-69.6 Wednesday morning: he wakes up
  A.boy.show(66.6, 69.6).key(66.6, { pose: 'lieBack', at: [BED.x0 + 2.5, BED.z], ry: N / 2, y: BED.top }).key(67.6, { pose: 'sitBed', at: [BED.x0 + .45, BED.z], y: BED.top, dur: .15, ease: 'io' }).face(66.6, 'sleepy').face(68.0, 'happy');
  // 69.6-73.8 the end: Mom at the sink, watch off on the counter, her wrist says 1, finger to lips
  A.mom.show(69.6, 73.9).key(69.6, { pose: 'sinkWash', at: [3230.55, -229.0], ry: 0 }).key(72.3, { pose: 'shh', dur: .6 }).face(69.6, 'neutral').face(72.4, 'smug');
  A.boy.blinks([16.0, 21.0, 30.0, 46.0, 51.0, 56.0, 61.0, 68.5]); A.mom.blinks([18.5, 22.0, 60.5, 71.0]);

  // per-frame props (pure function of t)
  const props = t => { cal.set(t < 66.6 ? 'TUESDAY' : 'WEDNESDAY');
    camry.visible = t >= 25 && t < 27.5; camry.position.x = lerp(-22, -2, sm((t - 25.6) / 1.9));
    bus.visible = t >= 31.8 && t < 33.8; bus.position.x = lerp(30, 9.5, sm((t - 31.8) / 1.2));
    bike.visible = t < 4.0; pizzaBox.visible = t >= 8.9 && t < 10.7;
    box.visible = t >= 49.8 && t < 54.3; bowl.visible = t >= 54.3 && t < 60; lopsided.visible = t >= 60 && t < 66.6; phone.visible = (t >= 42.7 && t < 45) || (t >= 62.6 && t < 64.6);
    const ring = t >= 42.7 && t < 45 && Math.sin(t * 9) > -.3, jz = ring ? Math.sin(t * 95) * .05 : 0; phone.rotation.z = jz; phone.position.copy(phoneBase); screen.position.copy(screenBase); screen.rotation.z = jz; screen.visible = phone.visible && t < 45;
    keysIsland.visible = t < 30.95 || (t >= 49.8 && t < 52.95); keysBoy.visible = t >= 30.95 && t < 31.8; keysMom.visible = t >= 52.95 && t < 54.3; egg.visible = t >= 54.3 && t < 55.9;
    flour.m.visible = t >= 55.9 && t < 58.2; flour.set(t);
    watch.visible = t < 69.6; watchOff.visible = t >= 69.6;
    W.biker.set(t < 2.9 ? 37 : 36);
    lamp.intensity = tod(t) === 'night' && t > 27 ? 6 : 0; };

  // ---------- shots ----------
  const SH = [
    { t: 0, dur: 2.3, who: 'biker', size: 'full', angle: 'eye', az: 60, move: 'track', speed: 1.2 },
    { t: 2.3, dur: 0.6, who: 'biker', size: 'full', angle: 'low', az: 30, move: 'punch', speed: 2.2, cam: { p0: [3.7, 1.0, 4.5], p1: [3.2, .85, 4.1], l0: [1, .45, 1.6], fov: 38 } },
    { t: 2.9, dur: 1.1, who: 'biker', size: 'wide', angle: 'high', az: 40, move: 'pull', speed: 3, rewind: true },
    { t: 4.0, dur: 3.0, who: 'biker', size: 'xclose', angle: 'eye', az: 20, move: 'push', speed: .6, wrist: true, hold: 3.95 },
    { t: 7.0, dur: 1.9, who: 'nb', size: 'medium', angle: 'eye', az: 15, move: 'truckL', speed: 1.4 },
    { t: 8.9, dur: 1.8, who: 'pizza', size: 'full', angle: 'low', az: 30, move: 'orbitR', speed: .7 },
    { t: 10.7, dur: 2.2, who: 'suitor', size: 'wide', angle: 'eye', az: 35, move: 'pull', speed: 1.8, cam: { p0: [12.4, 1.3, -2.9], p1: [13.0, 1.25, -3.3], l0: [12.9, .9, -6.2], fov: 40 } },
    { t: 12.9, dur: 2.2, who: 'old', size: 'medium', angle: 'high', az: 120, move: 'push', speed: .5, cam: { p0: [3224.9, 6.5, -227.0], p1: [3224.5, 6.35, -227.3], l0: [3222.6, 5.0, -229.06], fov: 44 } },
    { t: 15.1, dur: 1.1, who: 'boy', size: 'full', angle: 'eye', az: 10, move: 'truckR', speed: 1.1, cam: { p0: [3232.7, 5.75, -228.7], p1: [3232.6, 5.75, -229.4], l0: [3229.6, 5.45, -230.05], fov: 38 } },
    { t: 16.2, dur: 1.3, who: 'boy', size: 'xclose', angle: 'eye', az: 15, move: 'push', speed: 1.6, wrist: true },
    { t: 17.5, dur: 2.5, who: 'mom', size: 'medium', angle: 'eye', az: 20, move: 'orbitL', speed: .8, cam: { p0: [3231.6, 1.6, -226.4], p1: [3231.0, 1.6, -226.2], l0: [3230.2, 1.45, -229.1], fov: 32 } },
    { t: 20.0, dur: 3.5, who: 'mom', size: 'close', angle: 'low', az: 35, move: 'push', speed: .45, cam: { p0: [3229.0, 1.5, -226.3], p1: [3229.2, 1.5, -226.8], l0: [3229.95, 1.6, -229.1], fov: 30 } },
    { t: 23.5, dur: 1.5, who: 'boy', size: 'close', angle: 'eye', az: -20, move: 'punch', speed: 1.8, cal: true },
    { t: 25.0, dur: 2.5, who: 'boy', size: 'wide', angle: 'eye', az: 40, move: 'pull', speed: 1.2 },
    { t: 27.5, dur: 1.0, who: 'boy', size: 'medium', angle: 'eye', az: 160, move: 'push', speed: .4 },
    { t: 28.5, dur: 0.5, who: 'boy', size: 'close', angle: 'high', az: 20, move: 'punch', speed: 2.6, rewind: true, cam: { p0: [3231.7, 1.8, -227.4], p1: [3231.55, 1.72, -228.0], l0: [3231.3, 1.6, -229.35], fov: 34 } },
    { t: 29.0, dur: 1.7, who: 'boy', size: 'medium', angle: 'high', az: 30, move: 'pull', speed: 2.0, cam: { p0: [3230.6, 6.7, -227.7], p1: [3230.3, 6.45, -228.1], l0: [3229.7, 5.1, -230.0], fov: 40 } },
    { t: 30.7, dur: 1.1, who: 'boy', size: 'medium', angle: 'low', az: -30, move: 'orbitR', speed: 1.2, cam: { p0: [3232.0, 1.5, -226.3], p1: [3231.3, 1.45, -226.45], l0: [3231.0, 1.2, -228.5], fov: 34 } },
    { t: 31.8, dur: 2.0, who: 'mom', size: 'wide', angle: 'eye', az: -50, move: 'truckL', speed: .8 },
    { t: 33.8, dur: 0.5, who: 'boy', size: 'close', angle: 'eye', az: 0, move: 'punch', speed: 2.6, rewind: true, cam: { p0: [3231.0, 6.3, -228.6], p1: [3230.7, 6.15, -228.9], l0: [3229.7, 5.05, -230.05], fov: 40 } },
    { t: 34.3, dur: 1.2, who: 'boy', size: 'medium', angle: 'high', az: 40, move: 'push', speed: 1.0, cam: { p0: [3232.0, 6.0, -227.8], p1: [3231.7, 5.9, -228.2], l0: [3229.7, 5.45, -230.0], fov: 36 } },
    { t: 35.5, dur: 1.3, who: 'mom', size: 'full', angle: 'eye', az: 30, move: 'track', speed: .6 },
    { t: 36.8, dur: 0.5, who: 'boy', size: 'close', angle: 'low', az: 20, move: 'punch', speed: 2.6, rewind: true, cam: { p0: [3228.6, 1.55, -225.6], p1: [3228.85, 1.55, -225.85], l0: [3230.0, 1.55, -226.4], fov: 32 } },
    { t: 37.3, dur: 0.8, who: 'boy', size: 'medium', angle: 'high', az: -40, move: 'pull', speed: 1.4, cam: { p0: [3229.2, 2.1, -224.9], p1: [3228.9, 2.25, -224.4], l0: [3229.7, .95, -226.3], fov: 36 } },
    { t: 38.1, dur: 0.7, who: 'boy', size: 'xclose', angle: 'eye', az: 10, move: 'push', speed: .8, cam: { p0: [3228.8, 1.15, -225.8], p1: [3229.05, 1.17, -226.0], l0: [3230.0, 1.15, -226.4], fov: 32 } },
    { t: 38.8, dur: 1.4, who: 'boy', size: 'close', angle: 'eye', az: 30, move: 'orbitL', speed: 1.6, cam: { p0: [3221.0, 1.55, -229.0], p1: [3221.05, 1.5, -229.5], l0: [3221.05, 1.35, -231.1], fov: 40 } },
    { t: 40.2, dur: 0.6, who: 'boy', size: 'close', angle: 'low', az: -10, move: 'punch', speed: 2.2, rewind: true, cam: { p0: [3228.4, 1.35, -225.6], p1: [3228.9, 1.4, -225.9], l0: [3230.0, 1.6, -226.4], fov: 32 } },
    { t: 40.8, dur: 0.7, who: 'boy', size: 'xclose', angle: 'eye', az: 25, move: 'pull', speed: 3.0, rewind: true, cam: { p0: [3229.0, 1.5, -227.0], p1: [3228.7, 1.55, -227.2], l0: [3230.0, 1.45, -226.4], fov: 36 } },
    { t: 41.5, dur: 1.2, who: 'boy', size: 'wide', angle: 'top', az: 0, move: 'craneUp', speed: 1.5, rewind: true },
    { t: 42.7, dur: 2.3, who: 'boy', size: 'feet', angle: 'eye', az: 0, move: 'push', speed: .5, phoneShot: true },
    { t: 45.0, dur: 2.8, who: 'boy', size: 'xclose', angle: 'eye', az: 10, move: 'truckR', speed: 1.0, wrist: true },
    { t: 47.8, dur: 2.0, who: 'boy', size: 'medium', angle: 'low', az: 20, move: 'push', speed: 1.4 },
    { t: 49.8, dur: 2.8, who: 'boy', size: 'close', angle: 'high', az: -30, move: 'pull', speed: .7, cam: { p0: [3231.5, 1.5, -229.45], p1: [3231.25, 1.45, -229.2], l0: [3230.35, 1.25, -227.3], fov: 36 } },
    { t: 52.6, dur: 1.7, who: 'mom', size: 'medium', angle: 'eye', az: 30, move: 'orbitR', speed: 1.1 },
    { t: 54.3, dur: 1.6, who: 'boy', size: 'close', angle: 'high', az: 20, move: 'push', speed: 1.6, cam: { p0: [3231.6, 1.7, -229.4], p1: [3231.35, 1.6, -229.15], l0: [3230.6, 1.15, -227.3], fov: 36 } },
    { t: 55.9, dur: 2.3, who: 'boy', size: 'wide', angle: 'low', az: -20, move: 'craneUp', speed: .9, cam: { p0: [3232.4, 1.7, -229.7], p1: [3232.1, 2.05, -229.5], l0: [3230.7, 1.35, -227.1], fov: 36 } },
    { t: 58.2, dur: 1.8, who: 'mom', size: 'medium', angle: 'eye', az: 20, move: 'truckL', speed: .5, cam: { p0: [3231.6, 1.6, -226.4], p1: [3231.0, 1.6, -226.3], l0: [3230.8, 1.45, -229.05], fov: 32 } },
    { t: 60.0, dur: 2.6, who: 'mom', size: 'close', angle: 'low', az: -50, move: 'push', speed: 1.2, cam: { p0: [3229.3, 1.65, -226.0], p1: [3229.55, 1.65, -226.5], l0: [3230.6, 1.35, -228.6], fov: 34 } },
    { t: 62.6, dur: 2.0, who: 'boy', size: 'feet', angle: 'high', az: 0, move: 'pull', speed: .6, phoneShot: true },
    { t: 64.6, dur: 2.0, who: 'boy', size: 'medium', angle: 'eye', az: 60, move: 'orbitL', speed: 1.0, cam: { p0: [3229.9, 1.6, -223.7], p1: [3230.3, 1.55, -224.2], l0: [3230.2, 1.5, -226.3], fov: 32 } },
    { t: 66.6, dur: 3.0, who: 'boy', size: 'full', angle: 'high', az: 20, move: 'push', speed: 1.5, cam: { p0: [3232.4, 6.3, -228.6], p1: [3231.6, 6.0, -229.1], l0: [3229.7, 5.15, -230.05], l1: [3229.55, 5.7, -230.05], fov: 40 } },
    { t: 69.6, dur: 4.2, who: 'mom', size: 'medium', angle: 'eye', az: -40, move: 'craneDown', speed: .6, finale: true },
  ];
  const bad = validate(SH); if (bad.length) console.error('SHOTS', bad.join('; '));
  const subjectAt = (t, s) => { const a = A[s.who].a.root; return { x: a.position.x, y: a.position.y > 3 ? a.position.y : ground(a.position.x, a.position.z), z: a.position.z, heading: a.rotation.y }; };
  const samples = new Map(); for (let t = -.6; t <= DUR + .1; t += .05) { S.update(t); for (const s of SH) if (t >= s.t - .001 && t < s.t + s.dur - .02 && A[s.who].a.root.visible) { const k = s.t + s.who + '@' + Math.round(t * 20); if (!samples.has(k)) samples.set(k, subjectAt(t, s)); } }
  const subjAtCached = (t, s) => { for (let d = 0; d < 40; d++) for (const q of [t + d * .05, t - d * .05]) { const qq = Math.min(s.t + s.dur - .05, Math.max(s.t, q)), v = samples.get(s.t + s.who + '@' + Math.round(qq * 20)); if (v) return v; } return subjectAt(t, s); };
  const rig = cameraRig(planShots(SH, subjAtCached), { drift: 1 });
  const cam = new THREE.PerspectiveCamera(32, w / h, .15, 400);
  const wp = new THREE.Vector3(), wq = new THREE.Quaternion(), nz = new THREE.Vector3();
  const update = t => {
    light(t); S.update(t); props(t);
    const o = globalThis.VIEW || opts;
    const s = SH.slice().reverse().find(q => t >= q.t) || SH[0];
    if (o.camP) { cam.position.set(...o.camP); cam.lookAt(...o.camL); cam.fov = o.fov || 34; cam.updateProjectionMatrix(); }
    else {
      rig.apply(cam, t);
      const u = (t - s.t) / s.dur;
      if (s.wrist) { const pl = W[s.who].m, r = A[s.who].a.root; pl.getWorldPosition(wp); nz.set(Math.sin(r.rotation.y), 0, Math.cos(r.rotation.y));
        const lf = new THREE.Vector3(Math.cos(r.rotation.y), 0, -Math.sin(r.rotation.y)), k = sm(u);
        cam.position.copy(wp).addScaledVector(nz, lerp(1.8, 1.3, k)).addScaledVector(lf, .25); cam.position.y += lerp(.3, .2, k); cam.up.set(0, 1, 0).applyQuaternion(pl.getWorldQuaternion(wq)); if (s.flip || o.flip) cam.up.negate(); cam.up.add(new THREE.Vector3(0, 1.2, 0)).normalize(); cam.fov = 38; cam.updateProjectionMatrix(); cam.lookAt(wp); }
      if (s.cam) { const C = s.cam, k = u, hh = (f, q) => Math.sin(t * f + q) * .012 + Math.sin(t * f * 2.7 + q * 3) * .006;
        cam.position.set(...C.p0.map((v, n) => lerp(v, C.p1[n], k))); cam.position.x += hh(1.3, 1); cam.position.y += hh(1.1, 2); cam.position.z += hh(1.2, 3);
        const L = C.l1 ? C.l0.map((v, n) => lerp(v, C.l1[n], k)) : C.l0; cam.fov = C.fov || 34; cam.updateProjectionMatrix(); cam.lookAt(L[0] + hh(1.5, 4), L[1] + hh(1.4, 5), L[2]); }
      if (s.cal && u < .45) { cam.position.set(3227.98 + lerp(1.3, .95, u / .45), 1.62, -228.55); cam.fov = 30; cam.updateProjectionMatrix(); cam.lookAt(3227.98, 1.6, -228.6); }
      if (s.phoneShot) { const p0 = screenBase; cam.position.set(p0.x + lerp(.6, .3, u), p0.y + lerp(.45, .3, u), p0.z + lerp(.4, .25, u)); cam.fov = 32; cam.updateProjectionMatrix(); cam.lookAt(p0.x, p0.y + .02, p0.z); }
      if (s.finale) { const pl = W.mom.m; pl.getWorldPosition(wp); const hd = A.mom.a.root.position;
        let fv = 32; if (u < .6) { const k = sm(u / .6); cam.position.set(lerp(3230.85, wp.x + .1, k), lerp(1.75, wp.y + .38, k), lerp(-226.0, wp.z + .75, k)); cam.lookAt(lerp(hd.x, wp.x, k), lerp(1.35, wp.y, k), lerp(hd.z, wp.z, k)); }
        else { const k = sm((u - .6) / .4); cam.position.set(lerp(wp.x + .1, 3230.95, k), lerp(wp.y + .38, 1.95, k), lerp(wp.z + .75, -227.05, k)); cam.lookAt(lerp(wp.x, hd.x, k), lerp(wp.y, hd.y + 1.55, k), lerp(wp.z, hd.z, k)); }
        cam.fov = fv; cam.updateProjectionMatrix(); }
    }
    if (!s.wrist) cam.up.set(0, 1, 0);
    // indoors: the camera never leaves the room its subject stands in (walls, not the void)
    if (!o.camP && !s.cam && !s.wrist && !s.phoneShot && !s.finale && !(s.cal && (t - s.t) / s.dur < .45)) { const sp0 = A[s.who]?.a.root.position;
      const rm = sp0 && sp0.x > 3000 && ROOMS.find(r => sp0.x > r.x0 && sp0.x < r.x1 && sp0.z > r.z0 && sp0.z < r.z1 && Math.abs(sp0.y - r.y) < 2);
      if (rm) { const f = new THREE.Vector3(); cam.getWorldDirection(f); const tgt = cam.position.clone().addScaledVector(f, cam.position.distanceTo(sp0) || 2);
        cam.position.x = cl(cam.position.x, rm.x0 + .2, rm.x1 - .2); cam.position.z = cl(cam.position.z, rm.z0 + .2, rm.z1 - .2); cam.position.y = cl(cam.position.y, rm.y + 1.1, rm.y + 2.4); cam.lookAt(tgt); } }
    // rewinds: drained colour + brighter + a shake, the cue that time is running backwards
    post.saturation = s.rewind ? .25 : 1.1; if (s.rewind && !o.camP) { cam.rotateZ(Math.sin((t - s.t) * 30) * .03); post.exposure *= 1.15; }
    const sp = A[s.who]?.a.root.position; if (sp && o.look !== false) LOOK.follow(cam, { x: sp.x, y: sp.y, z: sp.z });
    cam.updateMatrixWorld(true); return true;
  };
  update(opts.t ?? 0);
  return { camera: cam, sun: LOOK.sun, post, update };
}
