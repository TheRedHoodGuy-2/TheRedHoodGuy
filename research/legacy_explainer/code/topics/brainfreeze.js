// WHY YOU GET BRAIN FREEZE. Format A (he-in-class cold open). Classroom + Brain HQ. His take A + 1.6 s tail, 24.8 s.
// 0-5.3    he peeks over his textbook, a SLURPZ slushie hidden behind it, waiting; the teacher turns to the board.
// 5.3-10.7 he chugs it (straw at his mouth), his head explodes (hands to his head), he SCREAMS.
// 10.7-16.3 Brain HQ: a block of ice smashes through the ceiling, little him (in a parka) shivers in the snow, then
//           slams every button: alarms + red light everywhere.
// 16.3-24.8 the pain fades... dead silence: the whole class + the teacher turned round staring at him. He slowly slides
//           the cup back behind his book.
import * as THREE from 'three';
import { limbTo } from '../../kit/r6pose.js';
import { LOCAL_POSES as HP } from '../hypnic/topic.js';
export const FORMAT = 'A';
export const SET = 'classroom';

const A = (part, root, end, mid, o) => limbTo(part, root, end, mid, o);
const pose = (root, limbs, head, extra = {}) => { const p = { root, head, ...extra }; for (const [k, [e, m, o]] of Object.entries(limbs)) p[k] = A(k, root, e, m, o); return p; };
const BACK_Z = -.12, CHAIR_BACK = { chair: { p: [0, 0, BACK_Z] } }, DESK_Y = .975;
const seatLegs = (a = 0, b = 0, c = 0) => ({ legL: { r: [-.093 - a * .3, .057, .063 + a * .2], o: [.028 + a * .1, .02, .309] }, legR: { r: [-.023 - c * .3, .092, -.169 + b * .3], o: [-.056 + b * .1, .02, .336] } });
const R0 = { y: -.02, z: BACK_Z }, rootOf = o => ({ ...R0, ...o });
// the cup spots on his desk, in his own frame (x = his left, z = forward from the chair): hidden behind the book, and
// where it gets slammed down beside it
const CUP_HIDE = [.04, .33], CUP_SLAM = [-.32, .38], BOOK_Z = .78;   // cup centre / book spine, in his frame

export const LOCAL_POSES = {
  // ---- the guy ----
  // HIDING: low behind his book, right hand round the hidden cup, left forearm on the desk, eyes over the book on the teacher
  hide: { ...pose(rootOf({ rx: .1, y: -.02 }), { armR: [[CUP_HIDE[0] - .14, DESK_Y + .16, CUP_HIDE[1] - .03], null], armL: [[CUP_HIDE[0] + .14, DESK_Y + .16, CUP_HIDE[1] - .03], null] }, [-.12, -.18, 0]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  hideB: { ...pose(rootOf({ rx: .14, y: -.03, x: .02 }), { armR: [[CUP_HIDE[0] - .14, DESK_Y + .16, CUP_HIDE[1] - .03], null], armL: [[CUP_HIDE[0] + .14, DESK_Y + .16, CUP_HIDE[1] - .03], null] }, [-.2, -.22, .04]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  // the coast is clear: sits up, lifts the cup (PRE: up from behind the book)
  lift: { ...pose(rootOf({ rx: .02 }), { armR: [[-.12, 1.25, .45], [-.38, .86, .14], { local: true }], armL: [[-.1, DESK_Y + .17, .5], [.4, DESK_Y + .17, .32]] }, [.05, .05, 0]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  // CHUG: straw at his mouth, head tipped back a touch, elbow up, the other hand grips the desk
  // CHUG: hunched down over the cup behind the book, both hands round it, lips on the straw
  chug: { ...pose(rootOf({ rx: .06, y: -.01 }), { armR: [[CUP_HIDE[0] - .14, DESK_Y + .16, CUP_HIDE[1] - .03], null], armL: [[CUP_HIDE[0] + .14, DESK_Y + .16, CUP_HIDE[1] - .03], null] }, [0, .1, 0]), ...seatLegs(.12, -.06, -.1), props: CHAIR_BACK },
  chugB: { ...pose(rootOf({ rx: .07, y: -.01 }), { armR: [[CUP_HIDE[0] - .14, DESK_Y + .16, CUP_HIDE[1] - .03], null], armL: [[CUP_HIDE[0] + .14, DESK_Y + .16, CUP_HIDE[1] - .03], null] }, [0, .12, 0]), ...seatLegs(.12, -.06, -.1), props: CHAIR_BACK },
  // HEAD EXPLODES: cup slammed down, both hands clamp his head (forearms up from the elbows, elbows flared), hunched
  grab: { ...pose(rootOf({ rx: .08, rz: -.05 }), { armL: [[.14, 2.0, .02], [.5, 1.45, .12], { local: true }], armR: [[-.14, 2.0, .02], [-.5, 1.45, .12], { local: true }] }, [.05, -.12, -.12]), ...seatLegs(.18, -.1, -.04), props: CHAIR_BACK },
  grabB: { ...pose(rootOf({ rx: .12, rz: .06 }), { armL: [[.16, 1.98, .06], [.52, 1.42, .14], { local: true }], armR: [[-.16, 1.98, .06], [-.52, 1.42, .14], { local: true }] }, [-.08, -.08, .12]), ...seatLegs(.12, -.04, -.14), props: CHAIR_BACK },
  // THE SCREAM: arched right back in the chair, head thrown back, hands still on his head, one leg kicked out
  scream: { ...pose(rootOf({ rx: -.3, rz: -.05, y: -.01 }), { armL: [[.24, 1.78, -.02], [.52, 1.3, .1], { local: true }], armR: [[-.24, 1.78, -.02], [-.52, 1.3, .1], { local: true }] }, [.05, -.38, -.08]), ...seatLegs(.3, -.2, .1), props: CHAIR_BACK },
  // after: the pain drains out, slumped back, arms flopped on the desk, eyes shut, then opens them
  relief: { ...pose(rootOf({ rx: -.12, rz: .04 }), { armL: [[.3, DESK_Y + .02, .45], null], armR: [[-.3, DESK_Y + .02, .45], null] }, [.05, -.1, .1]), ...seatLegs(.14, -.08, -.06), props: CHAIR_BACK },
  // sees everyone staring: freezes upright, then slowly slides the cup back behind the book
  caught: { ...pose(rootOf({ rx: .04 }), { armL: [[.3, DESK_Y + .02, .45], null], armR: [[-.3, DESK_Y + .02, .45], null] }, [.25, .02, 0]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  // ...then slowly sinks down behind the book until only his eyes show over it
  hideBack: { ...pose(rootOf({ rx: .12, y: -.04, z: BACK_Z + .04 }), { armL: [[-.22, DESK_Y + .27, .34], [.44, DESK_Y + .27, .28]], armR: [[.22, DESK_Y + .17, .24], [-.44, DESK_Y + .17, .2]] }, [0, -.25, 0]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  // ---- the teacher ----
  tTalk: { ...pose({ rx: -.02, rz: -.03 }, { armR: [[-.5, .9, .4], null], armL: [[.3, 1.2, .38], [.4, .85, .1], { local: true }] }, [-.05, .05, -.04]), legL: [.06, -1, .03], legR: [-.08, -1, -.03] },
  tScan: { ...pose({ rx: -.02, ry: .2 }, { armR: [[-.5, .9, .4], null], armL: [[.3, 1.2, .38], [.4, .85, .1], { local: true }] }, [.4, .02, .03]), legL: [.06, -1, .03], legR: [-.08, -1, -.03] },
  // writing on the board (her back to the class): marker hand up at the board, the other hand on her hip
  tWrite: { ...pose({ rx: .04, rz: .03 }, { armR: [[-.1, 1.7, .5], null, { lift: .06 }], armL: [[.45, .8, -.05], null] }, [-.05, -.1, .03]), legL: [.08, -1, .05], legR: [-.1, -1, -.04] },
  tGlare: HP.tGlare,
  // ---- little him in Brain HQ (the parka) ----
  hqStartle: HP.hqStartle,
  // the ice crashes down beside him: he flinches back, forearms snap up close in front of his face (elbows tucked, nothing reaches out)
  hqFlinch: { ...pose({ y: .02, rx: -.2, rz: .06 }, {
      armL: [[.68, 1.42, .22], [.42, .96, .06], { local: true }],
      armR: [[-.68, 1.45, .22], [-.42, .98, .06], { local: true }] }, [-.18, -.2, .1]), ...seatLegs(.2, -.1, .1) },
  // shivering: arms wrapped round himself (forearms across the chest), hunched, knees together (A/B = the shiver)
  hqShiver: { ...pose({ y: -.05, rx: .25 }, { armL: [[-.18, 1.12, .3], [.42, .95, .14], { local: true }], armR: [[.18, 1.08, .28], [-.42, .92, .14], { local: true }] }, [.05, .1, .05]), ...seatLegs(.25, -.15, .15) },
  hqShiverB: { ...pose({ y: -.05, rx: .27, rz: .03, x: .015 }, { armL: [[-.18, 1.12, .3], [.42, .95, .14], { local: true }], armR: [[.18, 1.08, .28], [-.42, .92, .14], { local: true }] }, [-.05, .12, -.05]), ...seatLegs(.25, -.15, .15) },
  // slamming buttons: one fist raised (PRE), the other down on the console (ACTION), swapping
  hqSlamR: { ...pose({ y: -.06, rx: .22, rz: -.06 }, { armR: [[-.2, .9, .55], null], armL: [[.4, 1.28, .38], [.44, .95, .1], { local: true }] }, [.15, -.15, -.08]), ...seatLegs(.22, -.12, .12) },
  hqSlamL: { ...pose({ y: -.06, rx: .22, rz: .06 }, { armL: [[.2, .9, .55], null], armR: [[-.4, 1.28, .38], [-.44, .95, .1], { local: true }] }, [-.15, -.15, .08]), ...seatLegs(.22, -.12, .12) },
  // ---- classmates ----
  writeTest: HP.writeTest, writeTest2: HP.writeTest2, writeGirl: HP.writeGirl, writeGirl2: HP.writeGirl2,
};

export const DESK_S = [1.35, 1.3, 1.15], CHAIR_S = [1.4, 1.42, 1.15], STOOL_K = 1.35;
export const SHEET_PROPS = { desk: DESK_S, chair: CHAIR_S, stool: STOOL_K };
export const POSE_SHEET = [
  ['hiding behind the book', 'guy', 'hide', 'nervous', 'chair desk'], ['hiding B', 'guy', 'hideB', 'sideeyeR', 'chair desk'], 
  ['CHUG', 'guy', 'chug', 'kiss', 'chair desk'], ['chug B', 'guy', 'chugB', 'kiss', 'chair desk'],
  ['head explodes', 'guy', 'grab', 'painBite', 'chair desk'], ['head explodes B', 'guy', 'grabB', 'shocked', 'chair desk'], ['SCREAM', 'guy', 'scream', 'scream', 'chair desk'],
  ['relief', 'guy', 'relief', 'sleepy', 'chair desk'], ['caught (everyone staring)', 'guy', 'caught', 'awkward', 'chair desk'], ['sinks behind the book', 'guy', 'hideBack', 'awkward', 'chair desk'],
  ['teacher talks', 'teacher', 'tTalk', 'neutral', ''], ['teacher scans', 'teacher', 'tScan', 'skeptical', ''], ['teacher writes', 'teacher', 'tWrite', 'neutral', ''], ['teacher glare', 'teacher', 'tGlare', 'angry', ''],
  ['HQ flinch (ice crashes)', 'guy', 'hqFlinch', 'shocked', 'stool'], ['HQ shiver', 'guy', 'hqShiver', 'nervous', 'stool'], ['HQ shiver B', 'guy', 'hqShiverB', 'nervous', 'stool'],
  ['HQ slam R', 'guy', 'hqSlamR', 'scream', 'stool'], ['HQ slam L', 'guy', 'hqSlamL', 'scream', 'stool'],
  ['classmate writes', 'n0', 'writeTest', 'neutral', 'chair desk'],
];
export async function SHEET_CAST(CAST) { return { teacher: await CAST.castNpc('tickle_teacher', { seed: 9, mainFaces: true }), n0: (await (await import(new URL('kit/students.js', document.baseURI).href)).castStudents(CAST, 1, { seed: 6 }))[0] }; }

// ---------- timings (s, on the take) ----------
const MOUTH = [0, .1, .17];   // lips, from the head bone, in the head's frame
const T_TURN = 3.6, T_LIFT = 4.5, T_CHUG = 5.3, T_EXPL = 7.45, T_SCREAM = 9.3, T_DIVE = 10.55, T_HQ = 11.0, T_ICE = 11.7, T_SHIV = 12.85, T_SLAM = 14.0;
const T_BACK = 16.3, T_OPEN = 17.7, T_STARE = 18.35, T_SLIDE = 21.6, END = 24.8;

export async function setup({ CAST, world, scene }) {
  const P = await import(new URL('kit/props/school.js', document.baseURI).href), { buildBrainRoom } = await import(new URL('kit/sets/brainroom.js', document.baseURI).href);
  const GD = await import(new URL('kit/props/gadgets.js', document.baseURI).href), RB = await import(new URL('kit/roblox.js', document.baseURI).href);
  const { mirrorPose } = await import(new URL('kit/poses.js', document.baseURI).href);
  const F = Math.PI, L = LOCAL_POSES, seat = (x, z) => [x, 0, z + .5], ss = THREE.MathUtils.smoothstep;
  // ---------- the room ----------
  world.board.write((x, w, h) => { x.fillStyle = '#1f5fa8'; x.font = `800 ${h * .15}px Fredoka, Comic Sans MS, sans-serif`; x.fillText('THE WATER CYCLE', w * .05, h * .2); x.fillStyle = '#333'; x.font = `600 ${h * .09}px Comic Sans MS, sans-serif`;
    x.fillText('1. Evaporation', w * .06, h * .45); x.fillText('2. Condensation', w * .06, h * .63); x.fillText('3. Precipita', w * .06, h * .81); });
  const SEATS = [[-2.7, -2.3], [.9, -2.3], [-.9, -.6], [.9, -.6], [2.7, -.6], [-2.7, 1.1], [2.7, 1.1]];   // the desk right in front of him stays empty (clear sightline for the front shots)
  const used = new Set([...SEATS, [-.9, 2.8], [.9, 2.8]].map(([x, z]) => `${x},${z}`));
  for (const d of world.desks) { const k = `${d.desk.position.x},${d.desk.position.z}`; if (!used.has(k)) continue; const nb = P.testPaper({ seed: d.row * 5 + d.col, answered: .3 + ((d.row + d.col) % 3) * .2 }); nb.position.set(.02, .742, .02); nb.rotation.y = (d.col - 1.5) * .05; d.desk.add(nb); }
  for (const d of world.desks) { d.desk.scale.set(...DESK_S); d.chair.scale.set(...CHAIR_S); }
  const deskOf = (x, z) => world.desks.find(d => d.desk.position.x === x && d.desk.position.z === z);
  const my = deskOf(-.9, 2.8); my.chair.position.z += .12;
  // his props: the textbook stood up half open at the front of his desk (cover to the teacher), the slushie behind it
  const ME = seat(-.9, 2.8), toW = ([lx, lz]) => [ME[0] - lx, ME[2] - lz];   // his pose frame -> world (he faces -z)
  const book = GD.textbook({ open: 1.95, s: 1.1, title: 'SCIENCE', sub: 'Grade 7' }); book.name = 'textbook'; { const [x, z] = toW([0, BOOK_Z]); book.position.set(x, DESK_Y + .002, z); book.rotation.y = 0; } scene.add(book);   // stood up open: cover + spine to the teacher, the V of pages opening toward him   // spine to the teacher, the V of pages opening toward him
  const cup = GD.slushieCup({ s: .78 }); scene.add(cup);

  // ---------- cast ----------
  const guy = await CAST.castMain('guy'), girl = await CAST.castMain('girl');
  const { castStudents } = await import(new URL('kit/students.js', document.baseURI).href);
  const npc = await castStudents(CAST, 7, { seed: 6 });
  const teacher = await CAST.castNpc('tickle_teacher', { seed: 9, mainFaces: true });
  guy.keys = [
    { t: 0, pose: L.hide, expr: 'nervous', at: ME, face: F },
    { t: 1.3, pose: L.hideB, expr: 'sideeyeR', dur: .5, ease: 'io' },        // eyes flick, waiting
    { t: 2.5, pose: L.hide, expr: 'nervous', dur: .5, ease: 'io' },
    { t: T_TURN + .35, pose: L.hideB, expr: 'smirk', dur: .3 },               // she's turned: the grin
    { t: T_LIFT + .3, pose: L.chug, expr: 'kiss', dur: .45, ease: 'io' },     // ducks down to the straw behind the book: CHUG
    { t: 6.3, pose: L.chugB, expr: 'kiss', dur: .6, ease: 'io' },
    { t: T_EXPL - .12, pose: L.chug, expr: 'surprised', dur: .1 },            // ...wait
    { t: T_EXPL, pose: L.grab, expr: 'painBite', dur: .14, style: 'snap' },   // BOOM: shoots up, both hands to his head
    { t: 8.2, pose: L.grabB, expr: 'shocked', dur: .25, steps: 2 }, { t: 8.7, pose: L.grab, expr: 'painBite', dur: .2, steps: 2 },
    { t: T_SCREAM, pose: L.scream, expr: 'scream', dur: .2, style: 'snap' },  // THE SCREAM
    { t: T_SCREAM + .7, pose: L.scream, expr: 'scream', dur: .3 },
    { t: T_BACK - .2, pose: L.relief, expr: 'sleepy', dur: .01 },  // the pain drains out
    { t: T_OPEN, pose: L.relief, expr: 'neutral', dur: .3 },
    { t: T_STARE + .3, pose: L.caught, expr: 'awkward', dur: .5, ease: 'io' },  // ...everyone is staring
    { t: T_SLIDE, pose: L.hideBack, expr: 'awkward', dur: 1.6, ease: 'io' },   // slowly sinks down behind the book
  ];
  guy.holdBlinks = [[T_BACK + .3, 1.2]];   // eyes shut while the pain fades
  girl.keys = [
    { t: 0, pose: L.writeGirl, expr: 'neutral', at: seat(.9, 2.8), face: F },
    { t: 2.4, pose: L.writeGirl2 }, { t: 6.0, pose: L.writeGirl },
  ];
  // the scream: the whole class turns round to stare at him (off screen while we're in his head), each their own way,
  // the head always looking AT him; they hold it, dead still apart from breathing
  const GUY_HEAD = new THREE.Vector3(-.9, 1.3, 3.3), wrap = a => Math.atan2(Math.sin(a), Math.cos(a)), clamp = (v, a) => Math.max(-a, Math.min(a, v));
  const stareExpr = ['shocked', 'skeptical', 'blank', 'shocked', 'skeptical', 'blank', 'awkward'];
  npc.forEach((n, i) => {
    const [x, z] = SEATS[i], sx = x, sz = z + .5, d = T_SCREAM + .15 + [3, 1, 2, 4, 0, 5, 1, 2][i] * .06;
    const need = wrap(Math.atan2(GUY_HEAD.x - sx, GUY_HEAD.z - sz) - F), tw = clamp(need * .45, .85);
    const look = (bodyYaw, k = 1) => { const p = JSON.parse(JSON.stringify(i % 2 ? L.writeTest2 : L.writeTest)); p.root = { ...p.root, ry: bodyYaw * k, rx: -.04 };
      p.head = { r: [-.06 + (i % 3) * .04, clamp(need - bodyYaw * k, 1.6), i % 2 ? .06 : -.05] }; return p; };
    n.keys = [{ t: 0, pose: i % 2 ? L.writeTest2 : L.writeTest, expr: 'neutral', at: seat(x, z), face: F }, { t: 3 + i * .6, pose: i % 2 ? L.writeTest : L.writeTest2 },
      { t: d, pose: look(tw), expr: 'surprised', snap: 1.2 }, { t: T_STARE - .4, pose: look(tw, 1.08), expr: stareExpr[i], dur: .5 }];
  });
  { const sx = .9, sz = 3.3, need = wrap(Math.atan2(GUY_HEAD.x - sx, GUY_HEAD.z - sz) - F);   // the girl turns too (he's at her left)
    const p = JSON.parse(JSON.stringify(L.writeGirl)); p.root = { ...p.root, ry: clamp(need * .4, .8), rx: -.04 }; p.head = { r: [-.04, clamp(need * .6, 1.5), .04] };
    girl.keys.push({ t: T_SCREAM + .2, pose: p, expr: 'surprised', snap: 1.2 }, { t: T_STARE - .4, pose: p, expr: 'skeptical', dur: .5 }); }
  // the teacher: talking to the class (looks round, he freezes), turns to write on the board; at the scream she spins
  // round and glares
  const TA = [.85, 0, -4.2];
  teacher.keys = [
    { t: 0, pose: L.tTalk, expr: 'neutral', at: TA, face: 0 },
    { t: 1.6, pose: L.tScan, expr: 'skeptical', dur: .5, ease: 'io' },          // scans the room (he ducks lower)
    { t: T_TURN - .6, pose: L.tWrite, expr: 'neutral', at: [TA[0] - .1, 0, TA[2] - .25], face: F - .02, dur: 1.5, ease: 'io' },   // turns her back: writes
    { t: T_SCREAM + .25, pose: L.tTalk, expr: 'surprised', at: TA, face: 2 * F + Math.atan2(-.9 - TA[0], 3.3 - TA[2]), dur: 1.4, ease: 'io' },   // keeps turning the same way round (no wrap spin)
    { t: T_STARE - .4, pose: L.tGlare, expr: 'angry', dur: .5 },
  ];
  { const W = 'so when the water heats up it turns into vapour and rises up into the sky where it cools down'.split(' '); let t = .1; teacher.talk = [];
    for (const w of W) { const d = .14 + w.length * .045; teacher.talk.push({ s: t, e: t + d, w }); t += d + .06; if (t > T_TURN - .1) break; } }

  // =====================================================================================================================
  // BRAIN HQ: frozen. Little him in a parka (light blue, white fur collar) on the stool.
  // =====================================================================================================================
  const B = buildBrainRoom(scene, { at: [300, 0, 0], leverLabel: 'TEMP' }), O = [300, 0, 0], zF = -3.6 * .62 + .12, CZ = zF + .95;
  const R = (x, y, z) => [O[0] + x, O[1] + y, O[2] + z];
  B.stool.scale.y = STOOL_K; const SBACK = .3; B.stool.position.z += SBACK;
  const castMe = async ({ shirt, sleeve = shirt, pants, collar = null }) => {
    const { actor } = await import(new URL('kit/actor.js', document.baseURI).href), FC = await import(new URL('kit/faces.js', document.baseURI).href);
    const A_ = await RB.loadMale(), Lay = await RB.layout(), img = new Image(); img.src = new URL('kit/assets/avatar_tex/male.png', document.baseURI).href; await img.decode();
    const S = img.width, k = S / Lay.size[0], c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const SKIN = '#e9b996', paint = (part, fill) => { for (const f in Lay.parts[part]) { const [x, y, w, h] = Lay.parts[part][f].map(v => v * k); fill(x, y, w, h, f); } };
    // the parka: puffy horizontal quilting lines, sleeves down to the wrists, white fur round the collar
    for (const part of ['armL', 'armR']) paint(part, (x, y, w, h, f) => { g.fillStyle = SKIN; g.fillRect(x, y, w, h); if (f !== 'bottom') { g.fillStyle = sleeve; g.fillRect(x, y, w, f === 'top' ? h : h * .9); g.fillStyle = 'rgba(0,0,0,.12)'; for (let q = 1; q < 5; q++) g.fillRect(x, y + h * .9 * q / 5, w, h * .025); g.fillStyle = '#f4f6fa'; g.fillRect(x, y + h * .84, w, h * .07); } });
    paint('torso', (x, y, w, h, f) => { g.fillStyle = shirt; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(0,0,0,.12)'; for (let q = 1; q < 5; q++) g.fillRect(x, y + h * q / 5, w, h * .02);
      if (f === 'front') { g.fillStyle = '#d9dee6'; g.fillRect(x + w * .48, y, w * .04, h); g.fillStyle = collar; g.fillRect(x, y, w, h * .12); g.fillStyle = 'rgba(255,255,255,.5)'; for (let q = 0; q < 14; q++) g.fillRect(x + w * q / 14, y + h * .1, w * .04, h * .04); }
      if (f === 'top' || f === 'back') { g.fillStyle = collar; g.fillRect(x, y, w, f === 'top' ? h : h * .12); } });
    for (const part of ['legL', 'legR']) paint(part, (x, y, w, h, f) => { g.fillStyle = pants; g.fillRect(x, y, w, h); if (f !== 'top' && f !== 'bottom') { g.fillStyle = '#2b2b30'; g.fillRect(x, y + h * .85, w, h * .15); } });
    await RB.skin(A_, new THREE.CanvasTexture(c)); RB.dress(A_, {}, { getFace: FC.face, face: 'neutral', sex: 'm', skipBody: true });
    RB.details(A_, [{ type: 'hair', mesh: await RB.loadSpikyHair(0x18130f), fit: 1.25, lift: .3 }]);
    return actor(A_, { seed: 3, getFace: n => FC.face(n, 'm') });
  };
  const op = await castMe({ shirt: '#6fb8f2', pants: '#4b5563', collar: '#f6f7fb' });
  const STOOL_AT = R(0, .03, zF + 1.75 + SBACK);
  op.keys = [
    { t: 0, pose: L.hqShiver, expr: 'neutral', at: STOOL_AT, face: F },
    { t: T_ICE + .05, pose: L.hqFlinch, expr: 'shocked', dur: .12, style: 'snap' },   // the ice crashes in
    { t: T_ICE + .6, pose: L.hqFlinch, expr: 'shocked', dur: .2 },
    { t: T_SHIV, pose: L.hqShiver, expr: 'nervous', dur: .3 },
  ];
  for (let i = 0, t = T_SHIV + .3; t < T_SLAM - .1; i++, t += .11) op.keys.push({ t, pose: i % 2 ? L.hqShiver : L.hqShiverB, dur: .06, steps: 2 });   // teeth-chattering shiver
  const slams = []; for (let i = 0, t = T_SLAM + .1; t < T_BACK - .15; i++, t += .36) { slams.push(t); op.keys.push({ t, pose: i % 2 ? L.hqSlamL : L.hqSlamR, expr: 'scream', dur: .09, style: 'snap' }); }
  // the HQ screen: TEMP readout dropping into the blue, then every warning at once
  const screen = (g, w, h, t) => { g.textAlign = 'center'; g.textBaseline = 'middle';
    if (t < T_SLAM) { const temp = Math.round(37 - ss(t, T_ICE, T_SHIV + .5) * 41); g.fillStyle = '#0d2a4a'; g.fillRect(0, 0, w, h); g.fillStyle = '#9fd8ff'; g.font = '700 40px Fredoka, Arial, sans-serif'; g.fillText('MOUTH TEMP', w / 2, 70);
      g.fillStyle = temp < 10 ? '#7fe3ff' : '#fff'; g.font = '800 130px Fredoka, Arial Black, sans-serif'; g.fillText(`${temp}°`, w / 2, 220); if (temp < 10) { g.fillStyle = '#7fe3ff'; g.font = '800 44px Fredoka, Arial Black, sans-serif'; g.fillText('FREEZING!!', w / 2, 340); } return; }
    const on = Math.floor(t * 6) % 2 === 0; g.fillStyle = on ? '#b3121b' : '#4a070b'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 64px Fredoka, Arial Black, sans-serif'; g.fillText('!! ALERT !!', w / 2, 90);
    g.font = '800 46px Fredoka, Arial Black, sans-serif'; g.fillText('HEAD: PAIN', w / 2, 200); g.fillText('ALL ALARMS ON', w / 2, 290); };
  // the ice: a big cracked block smashes down through the ceiling, chunks + shards, a hole of daylight-blue in the
  // ceiling, frost creeping over the room, snow drifting down
  const iceM = new THREE.MeshPhysicalMaterial({ color: 0x9fdcff, roughness: .08, transmission: .35, thickness: .3, ior: 1.31, clearcoat: 1, transparent: true, opacity: .92 });
  const ICE_AT = R(.2, 0, -1.0), ICE_Y = 1.18, ice = new THREE.Group(); scene.add(ice);   // it lands ON the console, right by his hands
  { const geo = new THREE.BoxGeometry(.75, .55, .6, 3, 3, 3), pa = geo.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), n = Math.sin(x * 13 + y * 7) * Math.cos(z * 11 + x * 3) * .035; pa.setXYZ(i, x + n, y + n * .6, z - n); } geo.computeVertexNormals();
    const blk = new THREE.Mesh(geo, iceM); blk.castShadow = true; ice.add(blk); }
  const chunks = []; for (let i = 0; i < 12; i++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(.07 + (i % 4) * .035, 0), iceM); c.castShadow = true; scene.add(c); chunks.push({ m: c, a: F + .2 + ((i * 7) % 12) / 11 * (F - .4), sp: .7 + (i % 4) * .3, up: 1.2 + (i % 3) * .6 }); }
  const hole = new THREE.Mesh(new THREE.CircleGeometry(.55, 9), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, toneMapped: false })); hole.rotation.x = F / 2; hole.position.set(ICE_AT[0], 3.06, ICE_AT[2]); scene.add(hole);
  const snow = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.018, 0), new THREE.MeshBasicMaterial({ color: 0xffffff }), 140); scene.add(snow);
  const SN = Array.from({ length: 140 }, (_, i) => ({ x: ((i * 37) % 100) / 100 * 3.6 - 1.8, z: ((i * 61) % 100) / 100 * 3.2 - 2.4, sp: .35 + (i % 7) * .07, ph: (i * .37) % 3 }));
  const mtx = new THREE.Matrix4();
  // HQ chill: the room's lights go icy blue (the alarm's red wash takes over when he slams)
  const chill = new THREE.PointLight(0x9fd8ff, 0, 7, 1.2); chill.position.set(300, 2.6, -.6); scene.add(chill);

  // ---------- camera ----------
  const GH = [-.9, 1.3, 3.25];
  const camera = [
    // COLD OPEN (point: him peeking over the book, the cup hidden behind it): front-left, high over the heads
    { t: 0, p: [-2.0, 2.55, -.6], l: [-.92, 1.2, 3.1], fov: 36 },
    { t: 2.15, p: [-1.95, 2.5, -.35], l: [-.92, 1.2, 3.1], fov: 33 },
    // point: what he's waiting on: from behind his shoulder, the teacher at the front looks round... and turns to the board
    { t: 2.2, p: [-1.3, 2.75, 4.7], l: [.6, 1.6, -4.1], fov: 24, cut: true },
    { t: T_LIFT - .05, p: [-1.25, 2.72, 4.5], l: [.6, 1.6, -4.1], fov: 22 },
    // point: the coast is clear: his grin as the cup comes up over the book
    { t: T_LIFT, p: [-1.6, 2.4, -.1], l: [-.92, 1.3, 3.2], fov: 36, cut: true },
    { t: T_CHUG - .05, p: [-1.55, 2.36, .15], l: [-.92, 1.32, 3.2], fov: 33 },
    // point: THE CHUG (face + cup + straw, close, front-right high)
    { t: T_CHUG, p: [-1.75, 2.3, .95], l: [-.9, 1.35, 3.0], fov: 34, cut: true },
    { t: T_EXPL - .05, p: [-1.7, 2.27, 1.2], l: [-.9, 1.35, 3.0], fov: 31 },
    // point: HEAD EXPLODES: cup slammed down, hands on his head (wider, shake)
    { t: T_EXPL, p: [-1.45, 2.15, .35], l: [-.9, 1.5, 3.2], fov: 40, cut: true },
    { t: T_SCREAM - .05, p: [-1.42, 2.12, .55], l: [-.9, 1.5, 3.2], fov: 37 },
    // point: THE SCREAM: low and close from the front, his face up to the ceiling
    { t: T_SCREAM, p: [-1.3, 1.95, 1.05], l: [-.9, 1.6, 3.25], fov: 40, cut: true },
    { t: T_DIVE - .02, p: [-1.26, 1.92, 1.3], l: [-.9, 1.6, 3.25], fov: 36 },
    // ...into his head through the open mouth
    { t: T_DIVE, p: 'DIVE0', fov: 30, cut: true, ease: 'in', zoom: true },
    { t: T_HQ - .02, p: 'DIVE1', fov: 30, ease: 'in', zoom: true },
    // ===== Brain HQ =====
    // point: the ice smashes through the ceiling next to little him (wide, both in frame)
    { t: T_HQ, p: R(-1.6, 2.1, -2.0), l: R(-.15, 1.25, -.35), fov: 60, cut: true },
    { t: T_SHIV - .05, p: R(-1.52, 2.07, -1.9), l: R(-.15, 1.25, -.35), fov: 57 },
    // point: little him shivering in his parka, snow falling (closer, his face)
    { t: T_SHIV, p: R(1.25, 1.3, -1.95), l: R(0, 1.45, -.3), fov: 40, cut: true },
    { t: T_SLAM - .05, p: R(1.2, 1.3, -1.85), l: R(0, 1.45, -.3), fov: 37 },
    // point: EVERY ALARM: slamming buttons, red light flashing (front-left wide: him + console + the screen)
    { t: T_SLAM, p: R(1.6, 1.8, -1.95), l: R(0, 1.3, -.2), fov: 46, cut: true },
    { t: T_BACK - .05, p: R(1.54, 1.78, -1.85), l: R(0, 1.3, -.2), fov: 42 },
    // ===== back in class =====
    // point: the pain drains out of him (front, close)
    { t: T_BACK, p: [-1.5, 1.85, .6], l: [-.9, 1.4, 3.25], fov: 36, cut: true },
    { t: T_STARE - .05, p: [-1.47, 1.83, .85], l: [-.9, 1.4, 3.25], fov: 32 },
    // point: THE WHOLE CLASS STARING: from behind him at the back, every face turned to us, the teacher glaring
    { t: T_STARE, p: [-2.0, 2.75, 4.8], l: [.3, 1.1, -1.4], fov: 46, cut: true },
    { t: T_SLIDE - .05, p: [-1.95, 2.7, 4.6], l: [.3, 1.1, -1.4], fov: 42 },
    // point: him, caught, slowly sliding the cup back behind the book (slow push in, hold)
    { t: T_SLIDE, p: [-1.5, 1.5, .4], l: [-.9, 1.25, 3.1], fov: 38, cut: true },
    { t: END, p: [-1.4, 1.45, .95], l: [-.9, 1.22, 3.1], fov: 32, ease: 'io' },
  ];
  { const hd = t => { guy.update(t); guy.A.root.updateMatrixWorld(true); return guy.A.bones.head.getWorldPosition(new THREE.Vector3()); };
    for (const k of camera) if (k.p === 'DIVE0' || k.p === 'DIVE1') { const h = hd(k.t), face = new THREE.Vector3(h.x, h.y + .12, h.z - .25), from = new THREE.Vector3(-1.26, 1.92, 1.3); k.l = face.toArray(); k.p = (k.p === 'DIVE0' ? from : from.clone().lerp(face, .92)).toArray(); } }
  for (let i = 0, n = 0; i < camera.length; i++) { const k = camera[i], nx = camera[i + 1]; if (!nx || nx.cut) continue;
    const d = Math.hypot(nx.p[0] - k.p[0], nx.p[1] - k.p[1], nx.p[2] - k.p[2]), df = Math.abs((nx.fov || k.fov) - k.fov);
    if (d < .05 && df < 1) { const dir = (n++ % 2 ? -1 : 1) * .05; nx.p = nx.p.map((v, j) => v + (k.l[j] - v) * dir); nx.fov = (nx.fov || k.fov) * (1 - dir * .5); } }
  const shakes = [{ t: T_EXPL, amp: .025, dur: .4 }, { t: T_SCREAM, amp: .035, dur: 1.0 }, { t: T_ICE + .05, amp: .05, dur: .5 }, ...slams.map(t => ({ t, amp: .012, dur: .15 }))];

  // ---------- the cup: on the desk / in his hand / straw at his mouth ----------
  const tipOf = (A_, part) => { const b = A_.bones[part], c = b.children.find(x => x.isBone) || b; return c.getWorldPosition(new THREE.Vector3()); };
  const deskAt = ([lx, lz]) => { const [x, z] = toW([lx, lz]); return new THREE.Vector3(x, DESK_Y + .005, z); };
  const HIDE_W = deskAt(CUP_HIDE), SLAM_W = deskAt(CUP_SLAM), up = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), hq = new THREE.Quaternion();
  cup.position.copy(HIDE_W);
  const mouthAt = t => { guy.update(t); guy.A.root.updateMatrixWorld(true); const hb = guy.A.bones.head, q2 = hb.getWorldQuaternion(new THREE.Quaternion()); return new THREE.Vector3(0, MOUTH[1], MOUTH[2]).applyQuaternion(q2).add(hb.getWorldPosition(new THREE.Vector3())); };
  const LIPS = mouthAt(6.0); guy.update(0);
  const REST = new THREE.Vector3(HIDE_W.x, HIDE_W.y + .3, HIDE_W.z + .05);   // straw at rest: up out of the dome, leaning toward him, tip below his chin
  let strawMode = '';
  const strawAt = t => { const m = t >= T_LIFT + .55 && t < T_EXPL ? 'lips' : 'rest'; if (m !== strawMode) { cup.userData.aimStraw(m === 'lips' ? LIPS : REST); strawMode = m; } };
  const cupAt = () => {};   // it stays hidden on the desk behind the book; he goes to it

  let bakedView = null;
  function update(t) {
    cupAt(t); strawAt(t);
    // ---- Brain HQ ----
    const alarm = t >= slams[0] ? 1 : 0;
    B.set({ screen, lever: 1 - ss(t, T_ICE, T_SHIV + .5) * .9, gauge: alarm ? .95 : .4 - ss(t, T_ICE, T_SHIV) * .35, alarm, t, hideCables: [0, 1, 2, 3, 4, 5, 6, 7] });
    { const u = t - T_ICE, fallY = 3.4 - Math.min(1, Math.max(0, u) / .28) ** 2 * 3.12, bounce = u > .28 ? Math.abs(Math.sin((u - .28) * 14)) * Math.exp(-(u - .28) * 7) * .12 : 0;
      ice.visible = t >= T_ICE - .05 && u < .34; ice.position.set(ICE_AT[0], Math.max(ICE_Y, fallY) + bounce, ICE_AT[2]); ice.rotation.set(.18, .5 + Math.max(0, u) * .3 * Math.exp(-Math.max(0, u)), -.1);
      hole.visible = t >= T_ICE && t < T_BACK;
      for (const c of chunks) { const v = Math.max(0, u - .28), fly = Math.min(v, .75); c.m.visible = u > .28 && t < T_BACK; const r = Math.min(1, fly * c.sp * 2) * .55; c.m.position.set(ICE_AT[0] + Math.cos(c.a) * r * 1.6, Math.max(.06, ICE_Y + c.up * fly - 4.9 * fly * fly), ICE_AT[2] + Math.sin(c.a) * r * 1.6); c.m.rotation.set(fly * 6 + c.a, fly * 5, 0); } }
    { const on = t >= T_ICE && t < T_BACK; snow.visible = on; if (on) { SN.forEach((s, i) => { const y = 3 - ((t * s.sp + s.ph) % 3); mtx.makeTranslation(300 + s.x + Math.sin(t * 1.3 + i) * .05, y, s.z); snow.setMatrixAt(i, mtx); }); snow.instanceMatrix.needsUpdate = true; } }
    chill.intensity = t >= T_ICE && t < T_SLAM ? 6 * ss(t, T_ICE, T_ICE + .4) : t >= T_SLAM && t < T_BACK ? 2 : 0;
    if (bakedView && update.view !== 1) { B.setView(bakedView); update.view = 1; }
  }
  async function bake(renderer) {   // his POV: the teacher at the board (for the HQ eye windows)
    for (const a of [guy, girl, teacher, ...npc]) a.update(5);
    guy.A.root.visible = false; cup.visible = false; guy.A.root.updateMatrixWorld(true);
    const cam = new THREE.PerspectiveCamera(46, 2, .05, 200); cam.position.set(-.9, 1.32, 3.1); cam.lookAt(-.1, 1.6, -4.9);
    const rt = new THREE.WebGLRenderTarget(1024, 512, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); guy.A.root.visible = true; cup.visible = true; bakedView = rt.texture; B.setView(rt.texture); update.view = 1;
  }
  return { shakes, cast: { guy, girl, teacher, op, ...Object.fromEntries(npc.map((n, i) => ['n' + i, n])) }, camera, update, bake, keep: [B.group, ice, ...chunks.map(c => c.m), hole, snow, chill, op.A.root, cup] };
}
