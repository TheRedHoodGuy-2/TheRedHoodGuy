// WHY TIME CRAWLS IN CLASS BUT FLIES WHEN YOU'RE GAMING. Format A (he-in-class cold open, Xavier 2026-11-14).
// Classroom (lecture) + Brain HQ + the living room at night (kit/sets/livingroom.js, built at x = 600). His take, 30.1 s.
// 0-5.1     cold open: slumped at his desk, head on his fist, glaring up at the wall clock while the teacher drones; the
//           clock: 1:03, the second hand crawling.
// 5.1-11.5  he stares it down (leans in, squints), looks away out of the window for ages (drumming), whips back; shakes
//           his watch at his ear, checks it (1:03); the clock: the minute hand clicks to 1:04. Forehead to the desk, cheek
//           down, dead eyes.
// 11.5-18.7 dive into his face. Brain HQ: little him (navy ME polo) on the stool, clicking a hand tally counter on EVERY
//           second, cheek on his fist; the counter close: 3714, 3715...; he yawns huge, still clicking.
// 18.7-30.1 that night, living room, TV on: he's gaming on the sofa (controller, Blood-Strike-style FPS on screen). HQ:
//           the counter lies forgotten on the console, little him glued to the eye windows (the game). Back out: he
//           blinks... the wall clock whizzes round to 3:00, his face drops, the controller sinks... then he looks back at
//           the TV and keeps playing.
import * as THREE from 'three';
import { limbTo } from '../../kit/r6pose.js';
export const FORMAT = 'A';
export const SET = 'classroom';

const A = (part, root, end, mid, o) => limbTo(part, root, end, mid, o);
const pose = (root, limbs, head, extra = {}) => { const p = { root, head, ...extra }; for (const [k, [e, m, o]] of Object.entries(limbs)) p[k] = A(k, root, e, m, o); return p; };
const BACK_Z = -.12, CHAIR_BACK = { chair: { p: [0, 0, BACK_Z] } }, DESK_Y = .975;
// SITTING (Xavier's technique): torso base = butt on the seat, legs near vertical slid forward ~.31 (top of leg = knee)
const seatLegs = (a = 0, b = 0, c = 0) => ({ legL: { r: [-.093 - a * .3, .057, .063 + a * .2], o: [.028 + a * .1, .02, .309] }, legR: { r: [-.023 - c * .3, .092, -.169 + b * .3], o: [-.056 + b * .1, .02, .336] } });
const standLegs = (a = 0, b = 0) => ({ legL: [.06 + a, -1, .03], legR: [-.08 - b, -1, -.03] });
const R0 = { y: -.02, z: BACK_Z }, rootOf = o => ({ ...R0, ...o });
// the controller grip: both forearms up from the elbows at the ribs, hands in front of the belly ~.38 apart
const padArms = (y = .95, z = .44, dx = 0) => ({ armL: [[.19 + dx, y, z], [.37, y - .14, .1], { local: true }], armR: [[-.19 + dx, y, z], [-.37, y - .14, .1], { local: true }] });

export const LOCAL_POSES = {
  // ---------------- the guy, at his desk (sheet frame: chair at 0, desk at z .5) ----------------
  // bored: head propped on his right fist (forearm up from the elbow on the desk), eyes up at the clock; left hand flat on
  // the desk, drumming (B lifts the hand)
  bored: { ...pose(rootOf({ rx: .1, rz: -.1, x: -.03 }), { armR: [[-.36, 1.26, .04], [-.36, .86, .3], { local: true }], armL: [[.14, DESK_Y, .56], null] }, [-.05, -.14, -.3]), ...seatLegs(.1, -.04, -.1), props: CHAIR_BACK },
  boredB: { ...pose(rootOf({ rx: .1, rz: -.1, x: -.03 }), { armR: [[-.36, 1.26, .04], [-.36, .86, .3], { local: true }], armL: [[.14, DESK_Y + .07, .56], null, { lift: .02 }] }, [-.07, -.16, -.32]), ...seatLegs(.1, -.04, -.1), props: CHAIR_BACK },
  // STARE IT DOWN: leans right in over the desk, both forearms flat on it, chin forward, glaring up (squint)
  stare: { ...pose(rootOf({ rx: .3, y: -.03 }), { armL: [[-.1, DESK_Y + .17, .5], [.4, DESK_Y + .17, .3]], armR: [[.1, DESK_Y + .17, .46], [-.4, DESK_Y + .17, .28]] }, [.02, -.42, 0]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  stareB: { ...pose(rootOf({ rx: .36, y: -.04 }), { armL: [[-.1, DESK_Y + .17, .52], [.4, DESK_Y + .17, .32]], armR: [[.1, DESK_Y + .17, .48], [-.4, DESK_Y + .17, .3]] }, [-.02, -.5, .04]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  // LOOK AWAY: turns to the window (his left), right forearm across the desk, left hand drumming, whistling
  away: { ...pose(rootOf({ rx: .02, ry: .28, rz: .04 }), { armR: [[.05, DESK_Y + .17, .45], [-.36, DESK_Y + .17, .3]], armL: [[.24, DESK_Y, .5], null] }, [.85, .02, .08]), ...seatLegs(.14, -.08, -.04), props: CHAIR_BACK },
  awayB: { ...pose(rootOf({ rx: .02, ry: .3, rz: .05 }), { armR: [[.05, DESK_Y + .17, .45], [-.36, DESK_Y + .17, .3]], armL: [[.24, DESK_Y + .07, .5], null, { lift: .02 }] }, [.9, -.02, .1]), ...seatLegs(.14, -.08, -.04), props: CHAIR_BACK },
  // ...and WHIPS back to the clock (sneaky check): body still half turned, head snapped to the front
  whip: { ...pose(rootOf({ rx: .08, ry: .16 }), { armR: [[.05, DESK_Y + .17, .45], [-.36, DESK_Y + .17, .3]], armL: [[.22, DESK_Y, .5], null] }, [-.12, -.2, 0]), ...seatLegs(.14, -.08, -.04), props: CHAIR_BACK },
  // SHAKES HIS WATCH next to his ear (left forearm up from the elbow, A/B = the shake), head tilted into it, right hand on the desk
  shakeA: { ...pose(rootOf({ rx: .02, rz: .1 }), { armL: [[.3, 1.6, .12], [.46, 1.12, .12], { local: true }], armR: [[-.22, DESK_Y, .44], null] }, [.18, .02, .28]), ...seatLegs(.12, -.06, -.08), props: CHAIR_BACK },
  shakeB: { ...pose(rootOf({ rx: .02, rz: .1 }), { armL: [[.36, 1.66, .2], [.46, 1.12, .12], { local: true }], armR: [[-.22, DESK_Y, .44], null] }, [.18, .02, .3]), ...seatLegs(.12, -.06, -.08), props: CHAIR_BACK },
  // checks it: wrist brought across in front of his face (forearm level), head down at it
  checkW: { ...pose(rootOf({ rx: .12 }), { armL: [[-.02, 1.28, .44], [.4, 1.1, .2], { local: true }], armR: [[-.22, DESK_Y, .44], null] }, [-.05, .32, 0]), ...seatLegs(.12, -.06, -.08), props: CHAIR_BACK },
  // 1:04: forehead goes down (PRE: sinks forward), then lies cheek down on his forearms, face turned to his right, dead eyes
  sinkFwd: { ...pose(rootOf({ rx: .3, y: -.03 }), { armL: [[-.14, DESK_Y + .17, .5], [.4, DESK_Y + .17, .34]], armR: [[.14, DESK_Y + .17, .46], [-.4, DESK_Y + .17, .32]] }, [0, .35, 0]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  cheekDown: { ...pose(rootOf({ rx: .3, y: -.02, rz: -.04 }), { armL: [[-.14, DESK_Y + .17, .5], [.4, DESK_Y + .17, .34]], armR: [[.14, DESK_Y + .17, .46], [-.4, DESK_Y + .17, .32]] }, [-.95, -.05, -.75]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  // ---------------- the girl: taking notes ----------------
  noteA: { ...pose({ y: -.02, rx: .14, rz: -.03 }, { armR: [[-.08, DESK_Y, .5], null], armL: [[.18, DESK_Y, .54], null] }, [-.08, .45, -.08]), ...seatLegs(.08, -.07, -.04) },
  noteB: { ...pose({ y: -.02, rx: .16, rz: .02 }, { armR: [[-.04, DESK_Y, .47], null], armL: [[.22, DESK_Y, .56], null] }, [.06, .5, .05]), ...seatLegs(.1, -.05, -.04) },
  noteLook: { ...pose({ y: -.02, rx: .08, ry: .1 }, { armR: [[-.04, DESK_Y, .47], null], armL: [[.22, DESK_Y, .56], null] }, [.7, .1, .05]), ...seatLegs(.1, -.05, -.04) },   // glances at him (her left)
  // classmates: chin on hand / listening, arms folded on the desk
  chin: { ...pose({ y: -.02, rx: .1, rz: .08 }, { armL: [[.3, 1.28, .06], [.34, .86, .32], { local: true }], armR: [[-.16, DESK_Y, .55], null] }, [.08, .05, .2]), ...seatLegs(.08, -.06, -.06) },
  folded: { ...pose({ y: -.02, rx: .2 }, { armL: [[-.14, DESK_Y + .17, .5], [.4, DESK_Y + .17, .34]], armR: [[.14, DESK_Y + .17, .46], [-.4, DESK_Y + .17, .32]] }, [0, .05, 0]), ...seatLegs(.1, -.06, -.06) },
  // ---------------- the teacher at the board: points at it (reach), the other forearm holds the marker up, lecturing ----------------
  tPoint: { ...pose({ ry: -.45, rz: .02 }, { armR: [[-.8, 1.55, -.2], null, { lift: .03 }], armL: [[.18, 1.12, .32], [.4, .95, .1], { local: true }] }, [.55, .02, .04]), ...standLegs(.04, .06) },
  tTalk: { ...pose({ rx: -.02, rz: -.03 }, { armR: [[-.5, .9, .4], null], armL: [[.3, 1.2, .38], [.4, .85, .1], { local: true }] }, [-.05, .05, -.04]), ...standLegs(.06, .02) },
  // ---------------- little him in Brain HQ (stool, console .45 m in front, panel top ~.88) ----------------
  // clicking the counter in his right hand at his chest (forearm up from the elbow), left elbow on the console, cheek on fist
  hqClick: { ...pose({ y: -.05, rx: .2, rz: .06 }, { armR: [[-.2, 1.22, .45], [-.38, .76, .1], { local: true }], armL: [[.32, .9, .5], null] }, [.12, .1, .22]), ...seatLegs(.2, -.1, .1) },
  hqPress: { ...pose({ y: -.06, rx: .22, rz: .06 }, { armR: [[-.2, 1.17, .47], [-.38, .74, .1], { local: true }], armL: [[.32, .9, .5], null] }, [.12, .12, .23]), ...seatLegs(.2, -.1, .1) },
  // the YAWN: free arm flung up and back (from the shoulder, slid up + out so it reads stretched), head thrown back,
  // torso arched back, still holding the counter
  hqYawn: { ...pose({ y: -.03, rx: -.22, rz: -.12 }, { armL: [[.62, 1.92, -.3], null, { lift: .16 }], armR: [[-.2, 1.24, .42], [-.38, .78, .1], { local: true }] }, [-.15, -.42, -.12]), ...seatLegs(.26, -.16, .14) },
  // night: up off the stool, leaning over the console toward the eye windows, both hands on the edge, nose to the glass
  hqGlued: { ...pose({ rx: .32, rz: .03 }, { armL: [[.3, .9, .52], null], armR: [[-.3, .9, .5], null] }, [-.04, -.42, 0]), legL: [.1, -.97, .2], legR: [-.12, -.97, -.12] },
  hqGluedB: { ...pose({ rx: .36, rz: -.04, x: -.03 }, { armL: [[.3, .9, .55], null], armR: [[-.3, .9, .52], null] }, [.1, -.45, -.05]), legL: [.1, -.97, .2], legR: [-.12, -.97, -.12] },
  // ---------------- the guy on the sofa at night ----------------
  gameA: { root: { y: .02, rx: .3, rz: .06 }, ...padArms(1.1, .5, -.02), head: [.06, -.1, .1], ...seatLegs(.24, -.1, .06) },
  gameB: { root: { y: .02, rx: .34, rz: -.07 }, ...padArms(1.1, .52, .02), head: [-.08, -.12, -.1], ...seatLegs(.18, -.04, .16) },
  // 3am: sits back, the controller sinks to his lap, head pushed forward (staring at the clock, his right)
  horror: { root: { y: .02, rx: -.08 }, ...padArms(.92, .46), head: [-.55, -.08, 0], ...seatLegs(.12, -.06, .04) },
};
// expand the shorthand padArms / [yaw, pitch, roll] heads of the sofa poses into solved limbs
for (const k of ['gameA', 'gameB', 'horror']) { const p = LOCAL_POSES[k], o = pose(p.root, { armL: p.armL, armR: p.armR }, p.head); LOCAL_POSES[k] = { ...p, ...o }; }

// props refitted to R6 proportions (same refit as tickle / hypnic)
export const DESK_S = [1.35, 1.3, 1.15], CHAIR_S = [1.4, 1.42, 1.15], STOOL_K = 1.35;
export const SHEET_PROPS = { desk: DESK_S, chair: CHAIR_S, stool: STOOL_K };
export const POSE_SHEET = [
  ['bored (head on fist, eyes on clock)', 'guy', 'bored', 'bored', 'chair desk'], ['bored B (drum)', 'guy', 'boredB', 'bored', 'chair desk'],
  ['STARE IT DOWN', 'guy', 'stare', 'annoyed', 'chair desk'], ['stare B', 'guy', 'stareB', 'annoyed', 'chair desk'],
  ['looks away (whistle)', 'guy', 'away', 'whistle', 'chair desk'], ['looks away B', 'guy', 'awayB', 'whistle', 'chair desk'], ['WHIPS back', 'guy', 'whip', 'squint', 'chair desk'],
  ['shakes watch A', 'guy', 'shakeA', 'skeptical', 'chair desk'], ['shakes watch B', 'guy', 'shakeB', 'skeptical', 'chair desk'], ['checks watch', 'guy', 'checkW', 'squint', 'chair desk'],
  ['1:04 sinks', 'guy', 'sinkFwd', 'blank', 'chair desk'], ['cheek on desk', 'guy', 'cheekDown', 'blank', 'chair desk'],
  ['girl notes A', 'girl', 'noteA', 'neutral', 'chair desk'], ['girl notes B', 'girl', 'noteB', 'neutral', 'chair desk'], ['girl glances', 'girl', 'noteLook', 'skeptical', 'chair desk'],
  ['classmate chin', 'n0', 'chin', 'bored', 'chair desk'], ['classmate folded', 'n0', 'folded', 'neutral', 'chair desk'],
  ['teacher points', 'teacher', 'tPoint', 'neutral', ''], ['teacher talks', 'teacher', 'tTalk', 'neutral', ''],
  ['HQ click', 'guy', 'hqClick', 'bored', 'stool'], ['HQ press', 'guy', 'hqPress', 'bored', 'stool'], ['HQ YAWN', 'guy', 'hqYawn', 'yawn', 'stool'],
  ['HQ glued to the eyes', 'guy', 'hqGlued', 'starstruck', ''], ['HQ glued B', 'guy', 'hqGluedB', 'starstruck', ''],
  ['sofa gaming A', 'guy', 'gameA', 'grin', ''], ['sofa gaming B', 'guy', 'gameB', 'determined', ''], ['3AM horror', 'guy', 'horror', 'shocked', ''],
];
export async function SHEET_CAST(CAST) { return { teacher: await CAST.castNpc('tickle_teacher', { seed: 9, mainFaces: true }), n0: (await (await import(new URL('kit/students.js', document.baseURI).href)).castStudents(CAST, 1, { seed: 4 }))[0] }; }

// ---------- timings (s, on the take) ----------
const T_CLOCK = 3.3, T_STARE = 5.1, T_AWAY = 6.9, T_WHIP = 8.3, T_WATCH = 8.7, T_WINS = 9.75, T_CLK2 = 10.3, T_MIN = 11.0, T_DOWN = 11.3, T_DIVE = 11.7, T_HQ = 12.15;
const T_CTR = 14.35, T_YAWN = 16.4, T_NIGHT = 18.75, T_FRONT = 20.3, T_HQ2 = 21.25, T_GLUE = 22.3, T_BACK = 23.75, T_BLINK = 24.25, T_3AM = 24.75, T_FACE = 26.6, T_REGAME = 28.85;
const CLICK0 = 12.35;   // little him clicks on every second from here (12.35, 13.35, ...) until the night

export async function setup({ CAST, world, scene }) {
  const P = await import(new URL('kit/props/school.js', document.baseURI).href), { buildBrainRoom } = await import(new URL('kit/sets/brainroom.js', document.baseURI).href);
  const GD = await import(new URL('kit/props/gadgets.js', document.baseURI).href), RB = await import(new URL('kit/roblox.js', document.baseURI).href);
  const LRM = await import(new URL('kit/sets/livingroom.js', document.baseURI).href);
  const F = Math.PI, L = LOCAL_POSES, seat = (x, z) => [x, 0, z + .5], ss = THREE.MathUtils.smoothstep;
  // ---------- the room, mid-lecture ----------
  world.board.write((x, w, h) => { x.fillStyle = '#1f5fa8'; x.font = `800 ${h * .15}px Fredoka, Comic Sans MS, sans-serif`; x.fillText('LONG DIVISION', w * .05, h * .2); x.fillStyle = '#333'; x.font = `600 ${h * .09}px Comic Sans MS, sans-serif`;
    x.fillText('  1 2 3 4  ÷  7  = ?', w * .06, h * .42); x.fillText('Step 1: divide', w * .06, h * .6); x.fillText('Step 2: multiply', w * .06, h * .76); x.fillText('Step 3: subtract...', w * .06, h * .92); });
  const SEATS = [[-2.7, -2.3], [.9, -2.3], [-.9, -.6], [.9, -.6], [2.7, -.6], [-2.7, 1.1], [-.9, 1.1], [2.7, 1.1]];
  const used = new Set([...SEATS, [-.9, 2.8], [.9, 2.8]].map(([x, z]) => `${x},${z}`));
  for (const d of world.desks) { const k = `${d.desk.position.x},${d.desk.position.z}`; if (!used.has(k)) continue; const nb = P.testPaper({ seed: d.row * 5 + d.col, answered: .3 + ((d.row + d.col) % 3) * .2 }); nb.position.set(.02, .742, .02); nb.rotation.y = (d.col - 1.5) * .05; d.desk.add(nb);
    const pc = P.pencil(); pc.position.set(.17, .748, .06); pc.rotation.y = .6; d.desk.add(pc); }
  for (const d of world.desks) { d.desk.scale.set(...DESK_S); d.chair.scale.set(...CHAIR_S); }
  const deskOf = (x, z) => world.desks.find(d => d.desk.position.x === x && d.desk.position.z === z);
  const my = deskOf(-.9, 2.8); my.chair.position.z += .12;   // pulled back so he never sinks into the desk
  // the wall clock: 1:03 and crawling. Each second the second hand TICKS (a quick step with a tiny bounce), the minute
  // hand clicks over to 1:04 at T_MIN
  const tickS = t => { const n = Math.floor(t), f = t - n; return n + Math.min(1, f / .08) + (f > .08 && f < .25 ? Math.sin((f - .08) / .17 * F) * .12 : 0); };

  // ---------- cast ----------
  const guy = await CAST.castMain('guy'), girl = await CAST.castMain('girl');
  const { castStudents } = await import(new URL('kit/students.js', document.baseURI).href);
  const npc = await castStudents(CAST, 8, { seed: 4 });
  const teacher = await CAST.castNpc('tickle_teacher', { seed: 9, mainFaces: true });
  // his wristwatch: on the left wrist, the face on the outside of the arm (shows 1:03 + seconds)
  const watch = GD.digitalWatch({ s: .85 });
  { const A_ = guy.A; A_.reset(); A_.root.updateMatrixWorld(true); const b = RB.partBoxes(A_).armL, c = b.getCenter(new THREE.Vector3());
    watch.position.set(c.x, b.min.y + .1, c.z); A_.root.add(watch); A_.root.updateMatrixWorld(true); A_.bones.armL.attach(watch); }
  // his controller (rides both hands every frame, see padAt)
  const pad = GD.gamepad(); scene.add(pad);

  const ME = seat(-.9, 2.8);
  guy.keys = [
    { t: 0, pose: L.bored, expr: 'bored', at: ME, face: F },
    { t: .45, pose: L.boredB, expr: 'bored', dur: .12 }, { t: .7, pose: L.bored, dur: .12 }, { t: .95, pose: L.boredB, dur: .12 }, { t: 1.2, pose: L.bored, dur: .12 },   // drumming
    { t: 2.1, pose: L.boredB, dur: .12 }, { t: 2.35, pose: L.bored, dur: .12 }, { t: 2.6, pose: L.boredB, dur: .12 }, { t: 2.85, pose: L.bored, dur: .12 },
    { t: 4.6, pose: L.boredB, dur: .12 }, { t: 4.85, pose: L.bored, dur: .12 },
    { t: T_STARE, pose: L.stare, expr: 'annoyed', dur: .4, ease: 'io' },         // STARES IT DOWN: leans in slowly
    { t: 6.1, pose: L.stareB, expr: 'annoyed', dur: .55, ease: 'io' },            // ...closer, harder
    { t: T_AWAY, pose: L.away, expr: 'whistle', dur: .45, ease: 'io' },          // looks away, casual, whistling
    { t: 7.4, pose: L.awayB, dur: .12 }, { t: 7.62, pose: L.away, dur: .12 }, { t: 7.84, pose: L.awayB, dur: .12 }, { t: 8.06, pose: L.away, dur: .12 },
    { t: T_WHIP, pose: L.whip, expr: 'squint', dur: .12, style: 'snap' },        // WHIPS back to catch it moving
    { t: T_WATCH, pose: L.shakeA, expr: 'skeptical', dur: .3 },                  // watch up to his ear...
    { t: 9.05, pose: L.shakeB, dur: .07, steps: 2 }, { t: 9.17, pose: L.shakeA, dur: .07 }, { t: 9.29, pose: L.shakeB, dur: .07 }, { t: 9.41, pose: L.shakeA, dur: .07 }, { t: 9.53, pose: L.shakeB, dur: .07 },
    { t: T_WINS - .1, pose: L.checkW, expr: 'squint', dur: .25, steps: 0 },      // ...checks it
    { t: T_CLK2 + .2, pose: L.checkW, expr: 'skeptical', dur: .2 },
    { t: T_MIN + .05, pose: L.checkW, expr: 'blank', dur: .15 },
    { t: T_DOWN - .25, pose: L.sinkFwd, expr: 'blank', dur: .25, ease: 'in' },   // 1:04. PRE: sinks forward
    { t: T_DOWN, pose: L.cheekDown, expr: 'blank', dur: .14, style: 'snap' },      // ACTION: face down on his arms (thud)
    { t: T_DOWN + .4, pose: L.cheekDown, expr: 'blank', dur: .3 },
    // night, on the sofa
    { t: T_NIGHT - .02, pose: L.gameA, expr: 'determined', at: [600, .02, 1.02], face: F, dur: .01 },
    ...Array.from({ length: 10 }, (_, i) => ({ t: T_NIGHT + .35 + i * .5, pose: i % 2 ? L.gameA : L.gameB, expr: i % 3 === 1 ? 'determined' : 'grin', dur: .32, ease: 'io' })),
    { t: T_BACK, pose: L.gameA, expr: 'grin', dur: .3 },
    { t: T_3AM + .45, pose: L.horror, expr: 'shocked', dur: .5, ease: 'io' },     // 3am: the controller sinks, he sits back
    { t: T_FACE + .2, pose: L.horror, expr: 'shocked', dur: .3 },
    { t: T_REGAME, pose: L.gameB, expr: 'determined', dur: .45, ease: 'io' },     // ...looks back at the TV. one more game.
    { t: T_REGAME + .6, pose: L.gameA, expr: 'grin', dur: .3 },
  ];
  guy.holdBlinks = [[T_BLINK, .32]];
  girl.keys = [
    { t: 0, pose: L.noteA, expr: 'neutral', at: seat(.9, 2.8), face: F },
    { t: 2.2, pose: L.noteB }, { t: 4.4, pose: L.noteA }, { t: 6.8, pose: L.noteB }, { t: 9.0, pose: L.noteA },
    { t: T_DOWN + .05, pose: L.noteLook, expr: 'skeptical', dur: .3 },   // the thud: glances over at him
  ];
  // classmates: half take notes, half listen chin-on-hand / arms folded; small drifts so nobody is frozen
  npc.forEach((n, i) => { const [x, z] = SEATS[i], base = [L.noteA, L.noteB, L.noteB, L.folded, L.noteA, L.noteA, L.folded, L.noteB][i];
    n.keys = [{ t: 0, pose: base, expr: ['neutral', 'bored', 'neutral', 'sleepy', 'bored', 'neutral', 'neutral', 'thinking'][i], at: seat(x, z), face: F },
      { t: 3 + i * .7, pose: base === L.noteA ? L.noteB : base === L.noteB ? L.noteA : base, dur: .5 }, { t: 7 + i * .5, pose: base, dur: .5 }]; });
  // the teacher at the board, lecturing the whole time (mouth moving), pointing at the steps
  const TA = [.95, 0, -4.15];
  teacher.keys = [
    { t: 0, pose: L.tPoint, expr: 'neutral', at: TA, face: 0 },
    { t: 2.6, pose: L.tTalk, expr: 'neutral', dur: .5 }, { t: 5.6, pose: L.tPoint, dur: .5 }, { t: 8.4, pose: L.tTalk, dur: .5 },
  ];
  { const W = 'and then you carry the remainder over to the next column and you bring down the next digit and divide again and remember to check your work'.split(' '); let t = .1; teacher.talk = [];
    for (const w of W) { const d = .14 + w.length * .045; teacher.talk.push({ s: t, e: t + d, w }); t += d + .06; if (t > 11.5) break; } }

  // =====================================================================================================================
  // BRAIN HQ (x = 300): little him (navy ME polo) on the stool with the tally counter; the eye windows show the clock
  // (baked) in class, the game at night.
  // =====================================================================================================================
  const B = buildBrainRoom(scene, { at: [300, 0, 0], leverLabel: 'BOREDOM' }), O = [300, 0, 0], zF = -3.6 * .62 + .12, CZ = zF + .95;
  const R = (x, y, z) => [O[0] + x, O[1] + y, O[2] + z];
  B.stool.scale.y = STOOL_K;
  const castMe = async ({ shirt, sleeve = shirt, pants, collar = null, badge = null }) => {
    const { actor } = await import(new URL('kit/actor.js', document.baseURI).href), FC = await import(new URL('kit/faces.js', document.baseURI).href);
    const A_ = await RB.loadMale(), Lay = await RB.layout(), img = new Image(); img.src = new URL('kit/assets/avatar_tex/male.png', document.baseURI).href; await img.decode();
    const S = img.width, k = S / Lay.size[0], c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const SKIN = '#e9b996', paint = (part, fill) => { for (const f in Lay.parts[part]) { const [x, y, w, h] = Lay.parts[part][f].map(v => v * k); fill(x, y, w, h, f); } };
    for (const part of ['armL', 'armR']) paint(part, (x, y, w, h, f) => { g.fillStyle = SKIN; g.fillRect(x, y, w, h); if (f !== 'bottom') { g.fillStyle = sleeve; g.fillRect(x, y, w, f === 'top' ? h : h * .82); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, y + h * .78, w, h * .04); } });
    paint('torso', (x, y, w, h, f) => { g.fillStyle = shirt; g.fillRect(x, y, w, h);
      if (f === 'front') { if (collar) { g.fillStyle = collar; g.beginPath(); g.moveTo(x + w * .3, y); g.lineTo(x + w * .5, y + h * .2); g.lineTo(x + w * .7, y); g.fill(); }
        if (badge) { g.fillStyle = '#fff'; g.fillRect(x + w * .14, y + h * .22, w * .24, h * .12); g.fillStyle = badge; g.font = `800 ${Math.round(h * .08)}px Fredoka, Arial Black, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ME', x + w * .26, y + h * .28); }
        g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(x, y + h * .9, w, h * .1); } });
    for (const part of ['legL', 'legR']) paint(part, (x, y, w, h, f) => { g.fillStyle = pants; g.fillRect(x, y, w, h); if (f !== 'top' && f !== 'bottom') { g.fillStyle = '#2b2b30'; g.fillRect(x, y + h * .88, w, h * .12); } });
    await RB.skin(A_, new THREE.CanvasTexture(c)); RB.dress(A_, {}, { getFace: FC.face, face: 'neutral', sex: 'm', skipBody: true });
    RB.details(A_, [{ type: 'hair', mesh: await RB.loadSpikyHair(0x18130f), fit: 1.25, lift: .3 }]);
    return actor(A_, { seed: 3, getFace: n => FC.face(n, 'm') });
  };
  const op = await castMe({ shirt: '#2f4f86', pants: '#5c6470', collar: '#e9eef5', badge: '#2f4f86' });
  // the tally counter: in his right hand, face out (toward the lens in front of him), thumb button up when the forearm
  // is raised. At night it lies forgotten on the console.
  const ctr = GD.tallyCounter();
  { const A_ = op.A; A_.reset(); A_.root.updateMatrixWorld(true); const b = RB.partBoxes(A_).armR, c = b.getCenter(new THREE.Vector3());
    ctr.rotation.set(F / 2, 0, -F / 2); ctr.position.set(c.x, b.min.y - .06, c.z + .02); A_.root.add(ctr); A_.root.updateMatrixWorld(true); A_.bones.armR.attach(ctr); }
  const ctrDesk = GD.tallyCounter(); ctrDesk.position.set(300 - .32, .99, CZ + .42); ctrDesk.rotation.order = 'YXZ'; ctrDesk.rotation.set(-1.25, .4, 0); scene.add(ctrDesk);   // night: forgotten on the console
  const SBACK = .3; B.stool.position.z += SBACK; const STOOL_AT = R(0, .03, zF + 1.75 + SBACK), STAND_EYES = R(0, 0, CZ + .55);
  const clicks = []; for (let t = CLICK0; t < T_NIGHT - .3; t += 1) if (!(t > T_YAWN - .2 && t < T_YAWN + 1.1)) clicks.push(t);   // no click during the yawn
  const count = t => 3712 + clicks.filter(c => t >= c).length;
  op.keys = [{ t: 0, pose: L.hqClick, expr: 'bored', at: STOOL_AT, face: F }];
  for (const c of clicks) { op.keys.push({ t: c - .02, pose: L.hqPress, dur: .06, style: 'snap' }, { t: c + .14, pose: L.hqClick, dur: .18 }); }
  op.keys.push({ t: T_YAWN, pose: L.hqYawn, expr: 'yawn', dur: .55, ease: 'io' }, { t: T_YAWN + 1.15, pose: L.hqClick, expr: 'bored', dur: .5, ease: 'io' });
  op.keys.sort((a, b) => a.t - b.t);
  op.keys.push({ t: T_HQ2 - .02, pose: L.hqGlued, expr: 'starstruck', at: STAND_EYES, face: F, dur: .01 },
    { t: T_HQ2 + .8, pose: L.hqGluedB, dur: .5, ease: 'io' }, { t: T_HQ2 + 1.6, pose: L.hqGlued, dur: .5, ease: 'io' }, { t: T_HQ2 + 2.3, pose: L.hqGluedB, expr: 'grin', dur: .4, ease: 'io' });
  // HQ screen: class = SECONDS COUNTED (each click), night = the counter has gone quiet
  const screen = (g, w, h, t) => {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (t < T_NIGHT) { g.fillStyle = '#10203a'; g.fillRect(0, 0, w, h); g.fillStyle = '#9fb6d8'; g.font = '700 38px Fredoka, Arial, sans-serif'; g.fillText('CLASS: NOTHING HAPPENING', w / 2, 56);
      g.fillStyle = '#fff'; g.font = '800 46px Fredoka, Arial Black, sans-serif'; g.fillText('SECONDS COUNTED', w / 2, 140);
      const n = count(t), pop = Math.max(0, 1 - (t - (clicks.filter(c => t >= c).pop() ?? -9)) * 5); g.save(); g.translate(w / 2, 245); g.scale(1 + pop * .15, 1 + pop * .15); g.fillStyle = '#ffd14f'; g.font = '800 110px Fredoka, Arial Black, sans-serif'; g.fillText(n.toLocaleString('en-US'), 0, 0); g.restore();
      g.fillStyle = '#9fb6d8'; g.font = '700 34px Fredoka, Arial, sans-serif'; g.fillText('...and counting', w / 2, 340); return; }
    g.fillStyle = '#0c2a22'; g.fillRect(0, 0, w, h); g.fillStyle = '#4dff9a'; g.font = '800 50px Fredoka, Arial Black, sans-serif'; g.fillText('GAME MODE', w / 2, 80);
    g.fillStyle = '#fff'; g.font = '700 40px Fredoka, Arial, sans-serif'; g.fillText('seconds counted:', w / 2, 175); g.fillStyle = '#ff6b6b'; g.font = '800 96px Fredoka, Arial Black, sans-serif'; g.fillText('???', w / 2, 270); };

  // =====================================================================================================================
  // THE LIVING ROOM AT NIGHT (kit/sets/livingroom.js, built in its own scene and moved to x = 600). Only the room +
  // hallway come along (the town round it is dropped: it's night outside and it would be culled anyway).
  // =====================================================================================================================
  const tmp = new THREE.Scene(), LR = LRM.buildWorld(tmp), LRX = 600; LR.W.position.x = LRX; scene.add(LR.W);
  { const p = new THREE.Vector3(); LR.W.updateMatrixWorld(true); LR.W.traverse(o => { if (!o.isMesh && !o.isLOD) return; o.getWorldPosition(p); if (Math.hypot(p.x - LRX, p.z) > 6.5) o.visible = false; }); }
  LR.sofa.scale.y *= 1.25;   // seat refit to the R6 butt height (~.6)
  // the TV shows the game: a Blood-Strike-style FPS (fake brand, no logo), drawn each frame
  const gcv = document.createElement('canvas'); gcv.width = 1024; gcv.height = 585; const gameTex = new THREE.CanvasTexture(gcv); gameTex.colorSpace = THREE.SRGBColorSpace;
  LR.tv.screen.material.emissiveMap = gameTex; LR.tv.screen.material.needsUpdate = true;
  const drawGame = t => {
    const g = gcv.getContext('2d'), W = 1024, H = 585, aim = Math.sin(t * .9) * 40 + Math.sin(t * 2.3) * 12, fire = (t % 1.1) < .45, fl = fire && Math.floor(t * 18) % 2 === 0;
    const sk = g.createLinearGradient(0, 0, 0, H * .55); sk.addColorStop(0, '#5fa6e8'); sk.addColorStop(1, '#cfe6f7'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
    // far city blocks + a water tower (parallax with the aim)
    g.fillStyle = '#8fa4b8'; for (let i = -1; i < 9; i++) { const x = i * 140 - aim * .3, h2 = 90 + ((i * 53) % 70); g.fillRect(x, H * .55 - h2, 120, h2); }
    g.fillStyle = '#6f8396'; for (let i = -1; i < 7; i++) { const x = i * 190 + 60 - aim * .5, h2 = 130 + ((i * 37) % 90); g.fillRect(x, H * .58 - h2, 150, h2); g.fillStyle = '#9db3c6'; for (let r = 0; r < 4; r++) for (let c2 = 0; c2 < 3; c2++) g.fillRect(x + 20 + c2 * 44, H * .58 - h2 + 18 + r * 30, 22, 14); g.fillStyle = '#6f8396'; }
    // street, sandbag wall, shipping containers
    g.fillStyle = '#a49a86'; g.fillRect(0, H * .58, W, H * .42); g.fillStyle = '#8c8270'; for (let i = 0; i < 12; i++) g.fillRect(i * 100 - (aim % 100), H * .7 + (i % 2) * 6, 60, 4);
    g.fillStyle = '#b5482f'; g.fillRect(620 - aim * .8, H * .42, 260, 130); g.fillStyle = '#9a3b26'; for (let i = 0; i < 10; i++) g.fillRect(630 - aim * .8 + i * 26, H * .44, 8, 120);
    g.fillStyle = '#2f6c8e'; g.fillRect(40 - aim * .8, H * .46, 220, 110); g.fillStyle = '#265a77'; for (let i = 0; i < 8; i++) g.fillRect(50 - aim * .8 + i * 27, H * .48, 8, 100);
    g.fillStyle = '#c2b28c'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(330 + i * 46 - aim * .9, H * .63, 30, 16, 0, 0, 7); g.fill(); } g.fillStyle = '#b09f78'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(352 + i * 46 - aim * .9, H * .6, 28, 15, 0, 0, 7); g.fill(); }
    // enemy (blocky soldier) strafing behind the sandbags; drops at each "kill"
    const ki = Math.floor(t / 2.2), kt = t - ki * 2.2, ex = 470 + Math.sin(t * 1.7 + ki) * 90 - aim * .9, down = kt > 1.7, ey = H * .47 + (down ? Math.min(1, (kt - 1.7) * 6) * 50 : 0);
    g.save(); g.translate(ex, ey); if (down) g.rotate(Math.min(1, (kt - 1.7) * 6) * 1.2);
    g.fillStyle = '#3b4a2f'; g.fillRect(-16, 20, 32, 46); g.fillStyle = '#2a3320'; g.fillRect(-15, 66, 13, 34); g.fillRect(2, 66, 13, 34); g.fillStyle = '#e1b48c'; g.fillRect(-11, -2, 22, 22); g.fillStyle = '#2a3320'; g.fillRect(-13, -8, 26, 10);
    g.fillStyle = '#222'; g.fillRect(10, 32, 34, 7); g.restore();
    // crosshair + hit marker
    const cx = W / 2, cy = H * .48; g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); for (const [a, b, c2, d] of [[-26, 0, -9, 0], [9, 0, 26, 0], [0, -26, 0, -9], [0, 9, 0, 26]]) { g.moveTo(cx + a, cy + b); g.lineTo(cx + c2, cy + d); } g.stroke();
    if (fire && (t * 9) % 1 < .5) { g.strokeStyle = '#ff3b30'; g.lineWidth = 4; g.beginPath(); for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.moveTo(cx + s[0] * 12, cy + s[1] * 12); g.lineTo(cx + s[0] * 24, cy + s[1] * 24); } g.stroke(); }
    // the gun (bottom right): rifle body, mag, sight, gloved hands; recoil + muzzle flash while firing
    const rc = fire ? Math.abs(Math.sin(t * 56)) * 12 : 0; g.save(); g.translate(690 + rc * .6, 350 + rc);
    g.fillStyle = '#2b2e33'; g.beginPath(); g.moveTo(0, 120); g.lineTo(120, 40); g.lineTo(250, 40); g.lineTo(330, 140); g.lineTo(330, 260); g.lineTo(60, 260); g.closePath(); g.fill();
    g.fillStyle = '#3a3e45'; g.beginPath(); g.moveTo(40, 110); g.lineTo(140, 52); g.lineTo(230, 52); g.lineTo(200, 90); g.lineTo(70, 140); g.closePath(); g.fill();
    g.fillStyle = '#1b1d21'; g.fillRect(150, 18, 60, 26); g.fillRect(160, 120, 40, 110); g.fillStyle = '#4a3b2a'; g.beginPath(); g.ellipse(110, 170, 60, 34, -.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(270, 200, 70, 40, -.3, 0, 7); g.fill();
    if (fl) { g.fillStyle = '#ffe27a'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * F * 2, r = i % 2 ? 22 : 55; g.lineTo(-10 + Math.cos(a) * r, 108 + Math.sin(a) * r); } g.fill(); g.fillStyle = '#fff6d0'; g.beginPath(); g.arc(-10, 108, 16, 0, 7); g.fill(); }
    g.restore();
    // HUD: minimap, health + armour, ammo, kill feed, match bar
    g.fillStyle = 'rgba(10,20,30,.55)'; g.beginPath(); g.arc(90, 90, 70, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#ffd14f'; g.beginPath(); g.moveTo(90, 74); g.lineTo(100, 100); g.lineTo(80, 100); g.closePath(); g.fill();
    g.fillStyle = '#ff4d4d'; for (const [a, r] of [[.6, 40], [2.4, 52], [4.0, 30]]) { g.beginPath(); g.arc(90 + Math.cos(a + t * .2) * r, 90 + Math.sin(a + t * .2) * r, 6, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(10,20,30,.6)'; g.fillRect(30, H - 78, 300, 52); g.fillStyle = '#5cd65c'; g.fillRect(40, H - 70, 230 * (.55 + .45 * Math.abs(Math.cos(t * .3))), 16); g.fillStyle = '#4aa8ff'; g.fillRect(40, H - 48, 200, 12);
    g.fillStyle = '#fff'; g.font = '800 26px Inter, Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(String(Math.round(55 + 45 * Math.abs(Math.cos(t * .3)))), 284, H - 61);
    g.textAlign = 'right'; g.font = '800 56px Inter, Arial Black, sans-serif'; g.fillText(String(30 - Math.floor((t * 9) % 30)).padStart(2, '0'), W - 120, H - 52); g.font = '700 28px Inter, Arial, sans-serif'; g.fillStyle = '#c8d2dc'; g.fillText('/ 120', W - 30, H - 44);
    g.fillStyle = 'rgba(10,20,30,.55)'; g.fillRect(W / 2 - 120, 16, 240, 46); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 28px Inter, Arial, sans-serif'; g.fillText(`ALIVE ${Math.max(2, 41 - ki)}   KILLS ${ki + 3}`, W / 2, 40);
    g.textAlign = 'right'; g.font = '700 22px Inter, Arial, sans-serif'; for (let i = 0; i < 3; i++) { const k = ki - i; if (k < 0) continue; g.fillStyle = 'rgba(10,20,30,.55)'; g.fillRect(W - 330, 86 + i * 36, 310, 30); g.fillStyle = i === 0 ? '#ffd14f' : '#fff'; g.fillText(`RedHood  ▸  Striker_${(k * 37) % 90 + 10}`, W - 30, 101 + i * 36); }
    gameTex.needsUpdate = true; };
  // night light: TV glow on him (cool, flickering with the muzzle flashes), a dim warm lamp, moonlight through the windows
  const tvKey = new THREE.SpotLight(0x9cc4ff, 0, 7, .75, .6, 1.2); tvKey.position.set(LRX, 1.3, -2.9); tvKey.target.position.set(LRX, 1.0, 1.1); scene.add(tvKey, tvKey.target);
  const moon = new THREE.PointLight(0x7d93c8, 0, 9, 1.2); moon.position.set(LRX - 2.4, 2.2, 0); scene.add(moon);
  const faceFill = new THREE.PointLight(0xffe1c0, 0, 3, 1.5); faceFill.position.set(LRX + .9, 1.6, .1); scene.add(faceFill);
  const clockL = new THREE.PointLight(0xa9bce6, 0, 2.5, 1.5); clockL.position.set(LRX + 2.3, 2.4, -.65); scene.add(clockL);   // moonlight catching the clock face
  LR.clock.set(9, 12, 0);

  // ---------- camera ----------
  const D2R = F / 180, GH = [-.9, 1.3, 3.25];
  const C0 = [0, 2.72, -4.98];   // the classroom clock
  const ctrCam = (() => { op.update(14.8); op.A.root.updateMatrixWorld(true); const p = ctr.getWorldPosition(new THREE.Vector3()); return { p: [p.x + .2, p.y + .5, p.z - .42], l: [p.x, p.y, p.z] }; })();
  const camera = [
    // COLD OPEN (point: him, slumped on his fist, glaring at the clock, mid-lecture) high over the heads from the front-left
    { t: 0, p: [-2.05, 2.6, -.75], l: [-.92, 1.2, 3.25], fov: 40 },
    { t: 1.55, p: [-2.0, 2.55, -.5], l: [-.92, 1.2, 3.25], fov: 37 },
    // point: what he is staring at: from behind his right shoulder, the class + the clock far up front
    { t: 1.6, p: [-1.3, 2.75, 4.75], l: [-.05, 2.3, -4.98], fov: 24, cut: true },
    { t: T_CLOCK - .05, p: [-1.25, 2.75, 4.55], l: [0, 2.4, -4.98], fov: 21 },
    // point: THE CLOCK, whole face straight on: 1:03, the second hand crawling
    { t: T_CLOCK, p: [0, 2.68, -2.9], l: C0, fov: 30, cut: true },
    { t: T_STARE - .05, p: [0, 2.69, -3.1], l: C0, fov: 29 },
    // point: he stares it down (front, high over the row in front, slow push in on his squint)
    { t: T_STARE, p: [-1.6, 2.5, -.1], l: [-.9, 1.2, 3.2], fov: 36, cut: true },
    { t: T_AWAY - .05, p: [-1.5, 2.42, .35], l: [-.9, 1.22, 3.2], fov: 30, ease: 'io' },
    // point: looks away for ages (from the window side: his face turned to us, drumming), then whips back
    { t: T_AWAY, p: [-3.6, 2.1, 1.6], l: [-.95, 1.15, 3.2], fov: 40, cut: true },
    { t: T_WATCH - .05, p: [-3.5, 2.05, 1.8], l: [-.95, 1.15, 3.2], fov: 37 },
    // point: the watch at his ear, the shake (front-right, mid shot)
    { t: T_WATCH, p: [.7, 2.35, .35], l: [-.85, 1.35, 3.25], fov: 38, cut: true },
    { t: T_WINS - .05, p: [.62, 2.3, .6], l: [-.85, 1.38, 3.25], fov: 34 },
    // point: the watch face, close: 1:03
    { t: T_WINS, p: 'WATCH', fov: 30, cut: true },
    { t: T_CLK2 - .05, p: 'WATCH2', fov: 28 },
    // point: THE CLOCK: the minute hand clicks to 1:04
    { t: T_CLK2, p: [0, 2.7, -3.25], l: C0, fov: 30, cut: true },
    { t: T_DOWN - .05, p: [0, 2.7, -3.4], l: C0, fov: 29 },
    // point: face down on the desk, dead eyes (from his right, low over the desk; the girl is behind the lens)
    { t: T_DOWN, p: 'DOWN0', fov: 40, cut: true },
    { t: T_DIVE - .02, p: 'DOWN1', fov: 37 },
    // ...dive into his face
    { t: T_DIVE, p: 'DIVE0', fov: 32, cut: true, ease: 'in', zoom: true },
    { t: T_HQ - .02, p: 'DIVE1', fov: 32, ease: 'in', zoom: true },
    // ===== Brain HQ =====
    // point: little him on the stool clicking the counter, the eye windows full of the clock
    { t: T_HQ, p: R(-1.3, 1.7, -1.75), l: R(.1, 1.2, -.3), fov: 54, cut: true },
    { t: T_CTR - .05, p: R(-1.22, 1.67, -1.65), l: R(.1, 1.2, -.3), fov: 50 },
    // point: THE COUNTER, close: thumb clicks, 3714... 3715
    { t: T_CTR, p: ctrCam.p, l: ctrCam.l, fov: 32, cut: true },
    { t: T_YAWN - .05, p: [ctrCam.p[0] - .02, ctrCam.p[1] - .03, ctrCam.p[2] + .06], l: ctrCam.l, fov: 30 },
    // point: the huge yawn, still clicking (from over the console, his face + the counter)
    { t: T_YAWN, p: R(1.4, 1.95, -1.5), l: R(.05, 1.4, -.05), fov: 50, cut: true },
    { t: T_YAWN + 1.6, p: R(1.36, 1.93, -1.43), l: R(.05, 1.4, -.05), fov: 48 },
    // back to clicking, slumped: wide from the front-left (his face, the counter, the console)
    { t: T_YAWN + 1.65, p: R(-1.3, 1.7, -1.75), l: R(.1, 1.2, -.3), fov: 54, cut: true },
    { t: T_NIGHT - .05, p: R(-1.22, 1.67, -1.65), l: R(.1, 1.2, -.3), fov: 50 },
    // ===== that night: the living room =====
    // point: gaming in the dark, the TV the only light (from behind the sofa, high: his head + controller + the game)
    { t: T_NIGHT, p: [LRX + .45, 2.1, 2.95], l: [LRX - .05, 1.1, -2.0], fov: 44, cut: true },
    { t: T_FRONT - .05, p: [LRX + .42, 2.05, 2.75], l: [LRX - .05, 1.1, -2.0], fov: 41 },
    // point: his face lit by the TV, thumbs going (from beside the TV)
    { t: T_FRONT, p: [LRX + .75, 1.6, -2.0], l: [LRX, 1.0, 1.05], fov: 40, cut: true },
    { t: T_HQ2 - .05, p: [LRX + .7, 1.58, -1.75], l: [LRX, 1.0, 1.05], fov: 37 },
    // HQ at night - point: the counter lying forgotten on the console (stuck on its number)
    { t: T_HQ2, p: R(-.15, 1.32, CZ + 1.05), l: R(-.32, .99, CZ + .42), fov: 34, cut: true },
    { t: T_GLUE - .05, p: R(-.1, 1.36, CZ + 1.2), l: R(-.32, .99, CZ + .42), fov: 36 },
    // point: little him glued to the eye windows (the game on them), from the side
    { t: T_GLUE, p: R(.55, 2.15, .55), l: R(0, 1.55, -2.0), fov: 46, cut: true },
    { t: T_BACK - .05, p: R(.5, 2.1, .35), l: R(0, 1.55, -2.0), fov: 42 },
    // back out - point: his face, the BLINK
    { t: T_BACK, p: [LRX + .4, 1.6, -1.2], l: [LRX, 1.3, 1.05], fov: 28, cut: true },
    { t: T_3AM - .05, p: [LRX + .38, 1.58, -1.0], l: [LRX, 1.3, 1.05], fov: 26 },
    // point: THE WALL CLOCK whizzes round to 3:00 (whole face straight on)
    { t: T_3AM, p: [LRX + 1.55, 2.35, -.65], l: [LRX + 2.98, 2.35, -.65], fov: 30, cut: true },
    { t: T_FACE - .05, p: [LRX + 1.65, 2.35, -.65], l: [LRX + 2.98, 2.35, -.65], fov: 28 },
    // point: his face drops, the controller sinks... then back to the game (front, slow push)
    { t: T_FACE, p: [LRX + .6, 1.7, -1.9], l: [LRX, 1.1, 1.05], fov: 38, cut: true },
    { t: 30.1, p: [LRX + .5, 1.62, -1.45], l: [LRX, 1.15, 1.05], fov: 33, ease: 'io' },
  ];
  // resolve the shots that follow a moving part (the watch on his wrist, the dive into his face) from the poses themselves
  { const at = (t, fn) => { guy.update(t); guy.A.root.updateMatrixWorld(true); return fn(); };
    const wp = t => at(t, () => { const p = watch.localToWorld(new THREE.Vector3(0, 0, .5)), q = watch.localToWorld(new THREE.Vector3(0, 0, .2)); return { p, q }; });
    const hd = t => at(t, () => guy.A.bones.head.getWorldPosition(new THREE.Vector3()));
    for (const k of camera) {
      if (k.p === 'WATCH' || k.p === 'WATCH2') { const { p, q } = wp(k.t), l = watch.getWorldPosition(new THREE.Vector3()); const d = p.clone().sub(l).normalize(); const cam = l.clone().add(d.multiplyScalar(k.p === 'WATCH' ? 1.45 : 1.3)); k.p = cam.toArray(); k.l = l.toArray(); }
      else if (k.p === 'DOWN0' || k.p === 'DOWN1') { const h = hd(k.t); k.l = [h.x, h.y - .05, h.z - .25]; k.p = [h.x + (k.p === 'DOWN0' ? 2.3 : 2.1), h.y + .75, h.z - .7]; }
      else if (k.p === 'DIVE0' || k.p === 'DIVE1') { const h = hd(k.t), face = new THREE.Vector3(h.x + .12, h.y - .02, h.z - .25), from = new THREE.Vector3(h.x + 2.1, h.y + .75, h.z - .7); k.l = face.toArray(); k.p = (k.p === 'DIVE0' ? from : from.clone().lerp(face, .9)).toArray(); }
    } }
  // the camera is never still: any shot whose keys barely move gets a slow push in
  for (let i = 0, n = 0; i < camera.length; i++) { const k = camera[i], nx = camera[i + 1]; if (!nx || nx.cut) continue;
    const d = Math.hypot(nx.p[0] - k.p[0], nx.p[1] - k.p[1], nx.p[2] - k.p[2]), df = Math.abs((nx.fov || k.fov) - k.fov);
    if (d < .05 && df < 1) { const dir = (n++ % 2 ? -1 : 1) * .05; nx.p = nx.p.map((v, j) => v + (k.l[j] - v) * dir); nx.fov = (nx.fov || k.fov) * (1 - dir * .5); } }
  const shakes = [{ t: T_WHIP, amp: .01, dur: .2 }, { t: T_DOWN, amp: .03, dur: .35 }, { t: T_3AM + .63, amp: .03, dur: .4 }];

  // the controller rides his hands: midpoint of the two hand ends, across = left hand -> right hand, front edge away from
  // him, tilted so the face looks up at him
  const tip = (A_, part) => { const b = A_.bones[part], c = b.children.find(x => x.isBone) || b; return c.getWorldPosition(new THREE.Vector3()); };
  const mX = new THREE.Vector3(), mY = new THREE.Vector3(), mZ = new THREE.Vector3(), MM = new THREE.Matrix4(), fwd = new THREE.Vector3();
  const padAt = () => { const hl = tip(guy.A, 'armL'), hr = tip(guy.A, 'armR'); mX.subVectors(hr, hl).normalize();
    guy.A.bones.torso.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();   // the torso's +z = his front
    mZ.copy(fwd).negate().addScaledVector(mX, mX.dot(fwd)).normalize();      // pad +z points back at him
    mY.crossVectors(mZ, mX).normalize(); MM.makeBasis(mX, mY, mZ); pad.quaternion.setFromRotationMatrix(MM); pad.rotateX(-.55);
    const mid = hl.add(hr).multiplyScalar(.5), g = pad.userData.gripL.clone(); g.x = 0; pad.position.copy(mid).sub(g.applyQuaternion(pad.quaternion)); };

  let viewMode = null, bakedView = null;
  function update(t) {
    const night = t >= T_NIGHT, inLR = night && !((t >= T_HQ2 && t < T_BACK));
    // ---- the classroom clock: 1:03 crawling, the minute hand clicks to 1:04 ----
    { const s = 49 + tickS(t), m = t < T_MIN ? 3 : 4 + (t < T_MIN + .15 ? -.15 * Math.sin((t - T_MIN) / .15 * F) : 0); world.clock.set(1, m - s / 60, s % 60); }
    watch.userData.set(1, 3, Math.floor(49 + tickS(t)) % 60);
    // ---- night lighting while we're in the living room ----
    if (!update.day) update.day = { sun: world.sun.intensity, hemi: world.hemi.intensity, amb: world.amb.intensity, env: scene.environmentIntensity, bg: scene.background };
    const D0 = update.day; if (D0.env == null || D0.env < .2) D0.env = scene.environmentIntensity > .2 ? scene.environmentIntensity : .55;
    world.sun.intensity = inLR ? 0 : D0.sun; world.hemi.intensity = inLR ? .06 : D0.hemi; world.amb.intensity = inLR ? .04 : D0.amb; scene.environmentIntensity = inLR ? .06 : D0.env;
    if (inLR) { if (!update.nightBg) update.nightBg = new THREE.Color(0x0b1226); if (scene.background !== update.nightBg) { update.dayBg = scene.background; scene.background = update.nightBg; } }
    else if (update.dayBg && scene.background === update.nightBg) scene.background = update.dayBg;
    const flash = (t % 1.1) < .45 && Math.floor(t * 18) % 2 === 0 ? 1 : 0;
    LR.tv.set(night ? 1 : 0); tvKey.intensity = inLR ? 16 + flash * 6 : 0; moon.intensity = inLR ? 2.2 : 0; faceFill.intensity = inLR ? .8 : 0; clockL.intensity = inLR && t >= T_3AM && t < T_FACE ? 2.5 : 0;
    for (const l of LR.lamps) l.light.intensity = 0;
    if (night) drawGame(t);
    // living-room clock: 9:12 PM ... whizzes round to 3:00 at T_3AM
    { const u = ss(t, T_3AM + .05, T_3AM + .6), mins = 9 * 60 + 12 + u * (5 * 60 + 48); LR.clock.set(Math.floor(mins / 60), mins % 60, (t * 60) % 60); }
    // ---- Brain HQ ----
    B.stool.position.z = (update.stoolZ ??= B.stool.position.z) + (night ? .45 : 0);
    B.set({ screen, lever: night ? .1 : .95, gauge: night ? .1 : .92, t, hideCables: (t >= T_HQ && t < T_CTR) || (t >= T_GLUE && t < T_BACK) ? [0, 1, 2, 3, 4, 5, 6, 7] : [] });
    if (!night && viewMode !== 'clock' && bakedView) { B.setView(bakedView); viewMode = 'clock'; }
    if (night && viewMode !== 'game') { B.setView(gameTex); viewMode = 'game'; }
    { const lc = clicks.filter(c => t >= c).pop() ?? -9, press = t - lc < .14 ? 1 : 0; ctr.userData.set(count(t), press); ctr.visible = !night; }
    ctrDesk.visible = night; ctrDesk.userData.set(count(T_NIGHT), 0);
    // ---- the controller ----
    pad.visible = night; if (night) { padAt(); pad.userData.set({ sticks: [Math.sin(t * 7) * .8, Math.cos(t * 5) * .5, Math.sin(t * 9 + 1) * .9, Math.cos(t * 6.5) * .6] }); }
    guy.A.root.visible = true;
  }
  async function bake(renderer) {   // his POV of the class + the clock for the Brain HQ eye windows
    for (const a of [guy, girl, teacher, ...npc]) a.update(4);
    guy.A.root.visible = false; guy.A.root.updateMatrixWorld(true); world.clock.set(1, 3, 40);
    const cam = new THREE.PerspectiveCamera(46, 2, .05, 200); cam.position.set(-.9, 1.32, 3.1); cam.lookAt(-.3, 2.0, -4.98);
    const rt = new THREE.WebGLRenderTarget(1024, 512, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); guy.A.root.visible = true; bakedView = rt.texture; B.setView(rt.texture); viewMode = 'clock';
  }
  return { shakes, cast: { guy, girl, teacher, op, ...Object.fromEntries(npc.map((n, i) => ['n' + i, n])) }, camera, update, bake, keep: [B.group, LR.W, ctrDesk, pad, tvKey, moon, faceFill, clockL, op.A.root, guy.A.root] };
}
