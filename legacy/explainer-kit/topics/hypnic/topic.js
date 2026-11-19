// WHY YOUR BODY JOLTS WHEN YOU FALL ASLEEP (hypnic jerk). Format A, classroom + Brain HQ. Xavier's take, 24.2 s.
// 0-6.3     cold open: dozing in class, head bobbing... JOLT (like he fell off a building), wide-eyed, gripping the desk.
// 6.3-16.7  Brain HQ: little him half asleep at the console, MUSCLES gauge drains (relax so fast), the alarm goes
//           (brain panics), screen: FALLING!!, he jumps up, winds up and SLAMS the big red ALL MUSCLES button, proud.
// 16.7-24.2 back in class, wider (a replay of the jolt): the teacher is beside his desk, her... his coffee on the corner.
//           Under the desk: his foot. JOLT: the knee hits the desk, the desk jumps, the mug hops, lands on the edge,
//           teeters... falls: SPLASH under the desk. Class turns, teacher stares at the coffee then at him, he slowly
//           puts his head back down and pretends to sleep.
// Cast: guy + girl (mains), the 8 tickle classmates + the tickle teacher (Xavier's NPC Creator designs), op (little him).
import * as THREE from 'three';
import { limbTo } from '../../kit/r6pose.js';
export const FORMAT = 'A';
export const SET = 'classroom';

const SIT = { legL: [.07, -.05, 1], legR: [-.06, -.05, 1] };
// POSES (rebuilt 2026-11-12 after Xavier's posing notes). Every limb is placed by WHERE ITS HAND / FOOT GOES (kit/r6pose.js):
// forearm actions (writing, chin on hand, scratching, crossed arms, covering a laugh) slide the block down so its top sits
// at the elbow; whole-arm actions (reach, wind-up) keep it at the shoulder. Sheet frame: avatar at 0 facing +z, chair at 0
// (seat .45), desk at z .5 (top .742, z .25-.75, x ±.34). His chair is pulled back .12 so he never sinks into the desk.
// Every motion is an arc: pre-action -> action -> reaction -> post-action (no frozen hands-up holds).
const A = (part, root, end, mid, o) => limbTo(part, root, end, mid, o);
const pose = (root, limbs, head, extra = {}) => { const p = { root, head, ...extra }; for (const [k, [e, m, o]] of Object.entries(limbs)) p[k] = A(k, root, e, m, o); return p; };
const BACK_Z = -.12, CHAIR_BACK = { chair: { p: [0, 0, BACK_Z] } }, DESK_Y = .975;   // desk top after the R6 refit (props scaled to the cast, see setup)
// SITTING (Xavier's technique, 2026-11-12): the base of the torso IS the butt, sitting on the seat; the legs stay nearly
// vertical and slide forward ~.31 so the top of each leg reads as the knee at the front edge of the seat (no horizontal
// legs poking through the desk). Seats are refitted to R6 height (~.66) so the feet land on the floor.
const seatLegs = (a = 0, b = 0, c = 0) => ({ legL: { r: [-.093 - a * .3, .057, .063 + a * .2], o: [.028 + a * .1, .02, .309] }, legR: { r: [-.023 - c * .3, .092, -.169 + b * .3], o: [-.056 + b * .1, .02, .336] } });
const kickLegs = { legL: { r: [-.12, .05, .08], o: [.03, .03, .31] }, legR: { r: [-.62, .08, -.12], o: [-.06, .12, .33] } };   // right knee rams up
const R0 = { y: -.02, z: BACK_Z };
const rootOf = o => ({ ...R0, ...o });
export const LOCAL_POSES = {
  // ---- the guy, at his desk. [hand, elbow|null, opts]: null = REACH from the shoulder, a point = FOREARM from that elbow ----
  // head propped on the right hand at the cheek (forearm up from the elbow planted on the desk), left forearm on the desk
  doze: { ...pose(rootOf({ rx: .1, rz: -.08, x: -.02 }), {
      armR: [[-.24, 1.4, .16], [-.3, .86, .34], { local: true }],
      armL: [[.1, DESK_Y, .55], null] }, [-.12, .2, -.28]), ...seatLegs(.1, -.04, -.1), props: CHAIR_BACK },
  // the head slides off the hand: chin drops, body sags (the hand stays, the head leaves it)
  doze2: { ...pose(rootOf({ rx: .15, rz: -.1, x: -.02 }), {
      armR: [[-.28, 1.34, .2], [-.3, .86, .36], { local: true }],
      armL: [[.12, DESK_Y, .56], null] }, [-.06, .55, -.14]), ...seatLegs(.12, -.04, -.12), props: CHAIR_BACK },
  // PRE-ACTION: sinks deepest just before the jolt (the "fall"), propping arm gives way
  sink: { ...pose(rootOf({ rx: .2, rz: -.06, y: -.04 }), {
      armR: [[-.24, DESK_Y + .02, .45], null],
      armL: [[.14, DESK_Y, .58], null] }, [-.04, .7, -.08]), ...seatLegs(.12, -.04, -.12), props: CHAIR_BACK },
  // ACTION (fast, ~3 frames): everything fires at once from the sockets. Torso thrown back, right arm flies up and out
  // to his side (from the shoulder), left hand slaps forward on the desk, right knee rams up under the desk
  jolt: { ...pose(rootOf({ rx: -.15, rz: .07, y: .03, x: .02 }), {
      armR: [[-.95, 1.45, .3], null, { local: true }],
      armL: [[.02, DESK_Y + .02, .6], null, { lift: .05 }] }, [.1, -.3, .12]), ...kickLegs, props: CHAIR_BACK },
  // REACTION: lands back down, both hands clamp the desk, shoulders hunched up, eyes wide
  grip: { ...pose(rootOf({ rx: .08, rz: -.02 }), {
      armR: [[-.26, DESK_Y, .42], null, { lift: .04 }],
      armL: [[.26, DESK_Y, .42], null, { lift: .04 }] }, [.05, .02, .04]), ...seatLegs(.16, -.08, -.08), props: CHAIR_BACK },
  gripL: { ...pose(rootOf({ rx: .06, ry: .14, rz: -.02 }), {
      armR: [[-.26, DESK_Y, .42], null, { lift: .03 }],
      armL: [[.26, DESK_Y, .42], null, { lift: .03 }] }, [.65, -.04, .06]), ...seatLegs(.16, -.08, -.08), props: CHAIR_BACK },   // looks left...
  gripR: { ...pose(rootOf({ rx: .06, ry: -.14, rz: .02 }), {
      armR: [[-.26, DESK_Y, .42], null, { lift: .03 }],
      armL: [[.26, DESK_Y, .42], null, { lift: .03 }] }, [-.62, -.06, -.06]), ...seatLegs(.16, -.08, -.08), props: CHAIR_BACK },   // ...looks right
  // POST-ACTION: confused, scratches the side of his head (forearm up from the elbow), head tilted the other way
  scratch: { ...pose(rootOf({ rx: .04, rz: .08 }), {
      armR: [[-.24, 1.76, .04], [-.55, 1.22, .18], { local: true }],
      armL: [[.24, DESK_Y, .44], null] }, [.12, -.08, .22]), ...seatLegs(.14, -.06, -.1), props: CHAIR_BACK },
  // replay: after the bang his eyes follow the mug; left arm reaches for it on the desk corner (his left, front)
  reachMug: { ...pose(rootOf({ rx: .16, ry: .22, rz: .04 }), {
      armL: [[.18, 1.12, .52], null],
      armR: [[-.24, DESK_Y, .42], null] }, [.35, .32, .08]), ...seatLegs(.16, -.08, -.08), props: CHAIR_BACK },
  // the mug hits the floor: wince, shoulders right up, head pulled down into them, hands still on the desk
  wince: { ...pose(rootOf({ rx: .1, ry: .15, y: -.04 }), {
      armL: [[.3, DESK_Y, .44], null, { lift: .1 }],
      armR: [[-.22, DESK_Y, .42], null, { lift: .1 }] }, [.5, .25, .1]), ...seatLegs(.14, -.06, -.1), props: CHAIR_BACK },
  // slowly turns his head to the teacher (his left), body frozen, hands flat on the desk
  caught: { ...pose(rootOf({ rx: .06, ry: .12 }), {
      armL: [[.26, DESK_Y, .46], null],
      armR: [[-.22, DESK_Y, .44], null] }, [.78, -.12, .05]), ...seatLegs(.14, -.06, -.1), props: CHAIR_BACK },
  // pretends to sleep: forearms folded on the desk (left over right), face down into them
  playDead: { ...pose(rootOf({ rx: .3, y: -.04 }), {
      armL: [[-.16, DESK_Y + .06, .5], [.4, DESK_Y + .05, .34]],
      armR: [[.16, DESK_Y + .02, .46], [-.4, DESK_Y + .02, .32]] }, [.1, .62, .12]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  // ---- the girl ----
  // writing: pencil hand on the paper, left hand flat holding the paper (both from the shoulder), head down
  writeGirl: { ...pose({ y: -.02, rx: .14, rz: -.03 }, {
      armR: [[-.08, DESK_Y, .5], null],
      armL: [[.18, DESK_Y, .54], null] }, [-.08, .45, -.08]), ...seatLegs(.08, -.07, -.04) },
  writeGirl2: { ...pose({ y: -.02, rx: .16, rz: .02 }, {
      armR: [[-.04, DESK_Y, .47], null],
      armL: [[.22, DESK_Y, .56], null] }, [.06, .5, .05]), ...seatLegs(.1, -.05, -.04) },
  // flinch AWAY from the bang (he is on her left): torso turns + tilts to her right, left shoulder hunched with the left
  // forearm swung across her chest as a guard, right arm out to her right to catch herself; head snaps back toward it
  flinch: { ...pose({ y: 0, rx: -.04, ry: -.38, rz: .14, x: -.05, z: .07 }, {
      armL: [[-.12, 1.15, .36], [.42, .95, .22], { local: true }],
      armR: [[-.85, .72, .2], null, { local: true }] }, [.55, -.08, -.1]), ...seatLegs(.3, -.2, .1) },
  // laughing into her hand: right hand over the mouth (forearm up from the elbow), left arm across the stomach
  laughCover: { ...pose({ y: -.02, rx: .06, ry: .15, rz: .1 }, {
      armR: [[-.15, 1.36, .3], [-.42, .9, .24], { local: true }],
      armL: [[-.08, .92, .32], [.46, .86, .14], { local: true }] }, [.3, .12, .18]), ...seatLegs(.12, -.08, -.02) },
  // ---- the teacher (standing) ----
  // arms crossed (both forearms level across the chest from the elbows), weight on one leg, looking down at the sleeper
  tWatch: { ...pose({ x: .03, rz: .03 }, {
      armL: [[-.16, 1.02, .3], [.48, .96, .18], { local: true }],
      armR: [[.17, .98, .26], [-.48, .92, .16], { local: true }] }, [.05, .32, .06]), legL: [.04, -1, .02], legR: [-.12, -1, -.05] },
  // the bang: a small start, not a jump: shoulders up, arms come uncrossed and drop a little, head turns to the desk
  tStart: { ...pose({ x: .01, rx: -.05 }, {
      armL: [[.3, .66, .34], null, { local: true, lift: .05 }],
      armR: [[-.3, .64, .32], null, { local: true, lift: .05 }] }, [-.15, .25, -.05]), legL: [.08, -1, .03], legR: [-.12, -1, -.04] },
  // leans in toward the teetering mug, right arm reaching for it from the shoulder
  tReach: { ...pose({ rx: .22, rz: -.05 }, {
      armR: [[-.25, .78, .7], null],
      armL: [[.6, .55, .05], null] }, [-.1, .45, -.05]), legL: [.06, -1, -.12], legR: [-.14, -1, .16] },
  // the coffee hits the floor: steps back out of the splash, weight thrown back, arms out low for balance, looks down at it
  tDodge: { ...pose({ rx: -.1, rz: .04, z: -.05 }, {
      armL: [[.85, .7, .1], null],
      armR: [[-.82, .74, .22], null] }, [-.12, .6, .05]), legL: [.08, -.96, .25], legR: [-.12, -.95, -.32] },
  // turns to him: arms crossed again, head cocked, leaning in a touch (the classic teacher stare)
  tGlare: { ...pose({ rx: .07, rz: -.04 }, {
      armL: [[-.16, 1.02, .3], [.48, .96, .18], { local: true }],
      armR: [[.17, .98, .26], [-.48, .92, .16], { local: true }] }, [.08, .28, -.16]), legL: [.06, -1, .02], legR: [-.14, -1, -.03] },
  // ---- Brain HQ operator (on the stool, console .45 m in front, panel top ~.88) ----
  // slumped asleep: head hanging, left arm dangling between the knees, right hand on the thigh
  hqSleep: { ...pose({ y: -.06, rx: .2, rz: .08 }, {
      armL: [[.1, .55, .42], null],
      armR: [[-.3, .72, .42], null] }, [.15, .62, .22]), ...seatLegs(.2, -.1, .1) },
  hqNod: { ...pose({ y: -.08, rx: .26, rz: .06 }, {
      armL: [[.08, .52, .44], null],
      armR: [[-.3, .7, .44], null] }, [-.08, .82, .12]), ...seatLegs(.2, -.1, .1) },
  // the alarm: jerks bolt upright, forearms snap up into a guard in front of the chest (from the elbows), knees jump
  hqStartle: { ...pose({ y: .02, rx: -.14, rz: -.05 }, {
      armL: [[.18, 1.06, .5], [.5, .82, .24], { local: true }],
      armR: [[-.48, 1.02, .55], [-.52, .8, .16], { local: true }] }, [.05, -.22, .08]), ...seatLegs(.2, -.1, .1) },
  hqLookL: { ...pose({ y: -.04, rx: -.04, ry: .2 }, {
      armL: [[.32, .85, .5], null],
      armR: [[-.34, .85, .48], null] }, [.7, -.05, .05]), ...seatLegs(.2, -.1, .1) },
  hqLookR: { ...pose({ y: -.04, rx: -.04, ry: -.2 }, {
      armL: [[.32, .85, .5], null],
      armR: [[-.34, .85, .48], null] }, [-.7, -.08, -.05]), ...seatLegs(.2, -.1, .1) },
  // leans in to the screen, both hands on the console edge, nose to the glass
  hqStare: { ...pose({ y: -.04, rx: .28 }, {
      armL: [[.26, .86, .5], null],
      armR: [[-.28, .86, .5], null] }, [-.04, -.25, 0]), ...seatLegs(.2, -.1, .1) },
  // standing at the big button. PRE: wind-up: body turns away, weight back, right arm cocked up and back from the
  // shoulder (slid up out of the socket so it clears the head), left arm forward for balance
  windUp: { ...pose({ rx: -.1, ry: .32, rz: .08, x: .04 }, {
      armR: [[-.62, 1.85, -.42], null, { local: true, lift: .14 }],
      armL: [[.45, .75, .55], null] }, [-.35, .12, -.06]), legL: [.1, -.95, .3], legR: [-.14, -.95, -.3] },
  // ACTION: SLAM: turns into it, drops the hips, right fist straight down onto the button, left arm flung back
  slam: { ...pose({ y: -.08, rx: .3, ry: -.12, rz: -.06 }, {
      armR: [[-.36, .93, .58], null],
      armL: [[.7, .7, -.35], null] }, [.1, .42, .04]), legL: [.12, -.95, .28], legR: [-.16, -.95, -.26] },
  // REACTION: holds it down, looks up at the screen to check (hand still on the button)
  slamHold: { ...pose({ y: -.04, rx: .16, ry: -.05 }, {
      armR: [[-.36, .92, .58], null],
      armL: [[.6, .6, -.12], null] }, [.3, -.22, .06]), legL: [.12, -.98, .24], legR: [-.14, -.98, -.2] },
  // POST: proud: a small fist pump at chest height (forearm up from the elbow at the ribs), other arm relaxed, chest out
  proud: { ...pose({ rx: -.1, rz: .06 }, {
      armR: [[-.36, 1.45, .34], [-.52, .9, .12], { local: true }],
      armL: [[.6, .5, .05], null, { local: true }] }, [-.25, -.15, -.12]), legL: [.08, -1, .05], legR: [-.18, -.98, -.06] },
};
// classmates write the test the same (correct) way as the girl
LOCAL_POSES.writeTest = LOCAL_POSES.writeGirl2; LOCAL_POSES.writeTest2 = LOCAL_POSES.writeGirl;

// props refitted to R6 proportions (the cast is 1.7 m of blocks: a .74 m desk and .45 m chair are child-sized for it)
export const DESK_S = [1.35, 1.3, 1.15], CHAIR_S = [1.4, 1.42, 1.15], STOOL_K = 1.35;
export const SHEET_PROPS = { desk: DESK_S, chair: CHAIR_S, stool: STOOL_K };
export const POSE_SHEET = [
  ['doze', 'guy', 'doze', 'sleepy', 'chair desk'], ['doze2 (head slides off)', 'guy', 'doze2', 'sleepy', 'chair desk'], ['sink (pre)', 'guy', 'sink', 'sleepy', 'chair desk'],
  ['JOLT (1 frame)', 'guy', 'jolt', 'shocked', 'chair desk'], ['grip (land)', 'guy', 'grip', 'shocked', 'chair desk'], ['gripL (look)', 'guy', 'gripL', 'nervous', 'chair desk'],
  ['gripR (look)', 'guy', 'gripR', 'nervous', 'chair desk'], ['scratch (post)', 'guy', 'scratch', 'confused', 'chair desk'],
  ['reachMug', 'guy', 'reachMug', 'nervous', 'chair desk'], ['wince', 'guy', 'wince', 'cringe', 'chair desk'], ['caught', 'guy', 'caught', 'nervous', 'chair desk'], ['playDead', 'guy', 'playDead', 'sleepy', 'chair desk'],
  ['girl writeGirl', 'girl', 'writeGirl', 'neutral', 'chair desk'], ['girl writeGirl2', 'girl', 'writeGirl2', 'neutral', 'chair desk'], ['girl flinch', 'girl', 'flinch', 'surprised', 'chair desk'], ['girl laughCover', 'girl', 'laughCover', 'laugh', 'chair desk'],
  ['teacher tWatch', 'teacher', 'tWatch', 'skeptical', ''], ['teacher tStart', 'teacher', 'tStart', 'surprised', ''], ['teacher tReach', 'teacher', 'tReach', 'surprised', ''], ['teacher tDodge', 'teacher', 'tDodge', 'annoyed', ''], ['teacher tGlare', 'teacher', 'tGlare', 'angry', ''],
  ['HQ hqSleep', 'guy', 'hqSleep', 'sleepy', 'stool'], ['HQ hqNod', 'guy', 'hqNod', 'sleepy', 'stool'], ['HQ hqStartle', 'guy', 'hqStartle', 'scream', 'stool'], ['HQ hqLookL', 'guy', 'hqLookL', 'shocked', 'stool'],
  ['HQ hqLookR', 'guy', 'hqLookR', 'shocked', 'stool'], ['HQ hqStare', 'guy', 'hqStare', 'shocked', 'stool'], ['HQ windUp (pre)', 'guy', 'windUp', 'determined', ''], ['HQ SLAM', 'guy', 'slam', 'furious', ''],
  ['HQ slamHold', 'guy', 'slamHold', 'determined', ''], ['HQ proud', 'guy', 'proud', 'cool', ''],
  ['classmate writeTest', 'n0', 'writeTest', 'neutral', 'chair desk'],
];
// the sheet uses the designed teacher + a designed classmate, not blank NPCs
export async function SHEET_CAST(CAST) { return { teacher: await CAST.castNpc('tickle_teacher', { seed: 9, mainFaces: true }), n0: (await (await import(new URL('kit/students.js', document.baseURI).href)).castStudents(CAST, 1, { seed: 4 }))[0] }; }

// timings (s, on the take incl. the 0.24 s lead)
const J1 = 3.64, J2 = 20.92, HQ = 6.3, BACK = 16.7, SLAM = 13.66, TIP = 22.27, LAND = 22.88;

export async function setup({ CAST, world, scene }) {
  const P = await import(new URL('kit/props/school.js', document.baseURI).href), { buildBrainRoom } = await import(new URL('kit/sets/brainroom.js', document.baseURI).href);
  const { canvasTex } = await import(new URL('kit/util.js', document.baseURI).href);
  const F = Math.PI, L = LOCAL_POSES, seat = (x, z) => [x, 0, z + .5], ss = THREE.MathUtils.smoothstep;
  // ---------- the room, mid-test ----------
  world.board.write((x, w, h) => { x.fillStyle = '#c62828'; x.font = `800 ${h * .16}px Fredoka, Comic Sans MS, sans-serif`; x.fillText('HISTORY TEST', w * .05, h * .22); x.fillStyle = '#333'; x.font = `600 ${h * .085}px Comic Sans MS, sans-serif`; x.fillText('Eyes on your own paper.', w * .06, h * .42); x.fillText('Time left: 35 min', w * .06, h * .58); });
  const SEATS = [[-2.7, -2.3], [.9, -2.3], [-.9, -.6], [.9, -.6], [2.7, -.6], [-2.7, 1.1], [-.9, 1.1], [2.7, 1.1]];
  const used = new Set([...SEATS, [-.9, 2.8], [.9, 2.8]].map(([x, z]) => `${x},${z}`));
  for (const d of world.desks) { const k = `${d.desk.position.x},${d.desk.position.z}`; if (!used.has(k)) continue; const p = P.testPaper({ seed: d.row * 5 + d.col, answered: k === '-0.9,2.8' ? .1 : .35 + ((d.row + d.col) % 3) * .2 }); p.position.set(.02, .742, .02); p.rotation.y = (d.col - 1.5) * .05; d.desk.add(p);
    const pc = P.pencil(); pc.position.set(.17, .748, .06); pc.rotation.y = .6; d.desk.add(pc); }
  // refit the student desks + chairs to the R6 cast (the papers / pencils on them scale along)
  for (const d of world.desks) { d.desk.scale.set(...DESK_S); d.chair.scale.set(...CHAIR_S); }
  const deskOf = (x, z) => world.desks.find(d => d.desk.position.x === x && d.desk.position.z === z);
  const my = deskOf(-.9, 2.8), myDesk = my.desk, myChair = my.chair, deskBase = myDesk.position.clone(), chairBase = myChair.position.clone();

  // ---------- the teacher's coffee: a proper mug, R6 scale (12 cm). White glazed stoneware with a red printed band and
  // lettering, a rolled lip, a hollow inside with coffee near the top, a foot ring, and a D-shaped handle (a tube, not a ring)
  const mug = new THREE.Group(); scene.add(mug);
  const MR = .048, MH = .12, ceramic = { roughness: .18, clearcoat: 1, clearcoatRoughness: .08 };
  const mugWrap = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = '#f7f5f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#c62f2a'; g.fillRect(0, h * .26, w, h * .5);
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 90; g.font = `800 ${fs}px Fredoka, Arial Black, sans-serif`; const txt = "WORLD'S BEST TEACHER";
    while (g.measureText(txt).width > w * .44 && fs > 20) { fs -= 4; g.font = `800 ${fs}px Fredoka, Arial Black, sans-serif`; } g.fillText(txt, w * .25, h * .52); }, [1, 1]);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(MR, MR * .93, MH - .006, 40, 1, true), new THREE.MeshPhysicalMaterial({ map: mugWrap, ...ceramic })); wall.position.y = MH / 2 + .003; wall.rotation.y = 1.2; mug.add(wall);
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf7f5f0, ...ceramic }), insideM = new THREE.MeshStandardMaterial({ color: 0xeeeae2, roughness: .3, side: THREE.BackSide });
  const lip = new THREE.Mesh(new THREE.TorusGeometry(MR - .003, .0035, 8, 40), white); lip.rotation.x = F / 2; lip.position.y = MH; mug.add(lip);
  const innerW = new THREE.Mesh(new THREE.CylinderGeometry(MR - .006, MR * .93 - .006, MH - .01, 36, 1, true), insideM); innerW.position.y = MH / 2 + .006; mug.add(innerW);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(MR * .93, MR * .86, .006, 36), white); foot.position.y = .003; mug.add(foot);
  const hc = new THREE.CatmullRomCurve3([[MR - .004, .098], [MR + .028, .1], [MR + .045, .075], [MR + .042, .04], [MR + .024, .022], [MR - .004, .026]].map(p => new THREE.Vector3(p[0], p[1], 0)));
  const handle = new THREE.Mesh(new THREE.TubeGeometry(hc, 24, .0075, 10), white); mug.add(handle);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(MR - .006, 32), new THREE.MeshPhysicalMaterial({ color: 0x3a2213, roughness: .05, clearcoat: 1 })); coffee.rotation.x = -F / 2; coffee.position.y = MH - .018; mug.add(coffee);
  mug.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // the puddle + flying drops (coffee: dark glossy brown)
  const pudTex = canvasTex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#fff'; const R = (() => { let s = 3; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    g.beginPath(); g.ellipse(w / 2, h / 2, w * .3, h * .24, .3, 0, 7); g.fill(); for (let i = 0; i < 14; i++) { const a = R() * 6.28, r = .2 + R() * .2; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * w * r, h / 2 + Math.sin(a) * h * r * .8, 8 + R() * 22, 6 + R() * 14, a, 0, 7); g.fill(); } }, [1, 1]);
  const coffeeM = new THREE.MeshPhysicalMaterial({ color: 0x3a2213, roughness: .06, clearcoat: 1, alphaMap: pudTex, transparent: true, depthWrite: false });
  const puddle = new THREE.Mesh(new THREE.PlaneGeometry(.8, .8), coffeeM); puddle.rotation.x = -F / 2; puddle.position.set(-1.42, .004, 2.66); puddle.renderOrder = 2; scene.add(puddle);
  const dropM = new THREE.MeshPhysicalMaterial({ color: 0x3a2213, roughness: .05, clearcoat: 1 });
  const drops = Array.from({ length: 16 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.008 + (i % 3) * .004, 8, 6), dropM); scene.add(m); return m; });
  // desk geometry after the refit (his desk at -.9, 2.8): top .962, left (window-side) edge x -1.359
  const TOPY = .962, EDGE_X = -.9 - .34 * DESK_S[0], MUG0 = new THREE.Vector3(-1.25, TOPY, 2.64), XL = EDGE_X + .03, FLOOR = new THREE.Vector3(-1.56, 0, 2.7);
  // ---------- cast ----------
  const guy = await CAST.castMain('guy'), girl = await CAST.castMain('girl'), op = await CAST.castMain('guy', { seed: 11 });
  // classmates: random students in the school uniform (kit/students.js); only the mains wear their own clothes
  const { castStudents } = await import(new URL('kit/students.js', document.baseURI).href);
  const npc = await castStudents(CAST, 8, { seed: 4 });
  const teacher = await CAST.castNpc('tickle_teacher', { seed: 9, mainFaces: true });

  // every beat is an arc: pre-action -> action -> reaction -> post-action
  guy.keys = [
    { t: 0, pose: L.doze, expr: 'sleepy', at: seat(-.9, 2.8), face: F },
    { t: .85, pose: L.doze2, expr: 'sleepy', dur: .55, ease: 'in' },               // head slides off the hand...
    { t: 1.45, pose: L.doze, expr: 'sleepy', dur: .3, ease: 'out' },                // ...catches it, back up
    { t: 2.25, pose: L.doze2, expr: 'sleepy', dur: .7, ease: 'in' },
    { t: J1 - .32, pose: L.sink, expr: 'sleepy', dur: .3, ease: 'in' },              // PRE: the prop arm gives, he sinks (the fall)
    { t: J1, pose: L.jolt, expr: 'shocked', style: 'snap', dur: .1 },                 // ACTION: everything fires
    { t: J1 + .28, pose: L.grip, expr: 'shocked', dur: .25, ease: 'out' },            // REACTION: lands, clamps the desk
    { t: 4.45, pose: L.gripL, expr: 'nervous', dur: .3 },                            // looks round: did anyone see?
    { t: 4.95, pose: L.gripR, expr: 'nervous', dur: .3 },
    { t: 5.45, pose: L.scratch, expr: 'confused', dur: .4 },                         // POST: confused, scratches his head
    // replay, wider: same doze, same jolt, this time we see what it did
    { t: BACK - .05, pose: L.doze2, expr: 'sleepy', steps: 0, dur: .01 },
    { t: 18.5, pose: L.doze, expr: 'sleepy', dur: .5 },
    { t: 19.8, pose: L.doze2, expr: 'sleepy', dur: .7, ease: 'in' },
    { t: J2 - .32, pose: L.sink, expr: 'sleepy', dur: .3, ease: 'in' },
    { t: J2, pose: L.jolt, expr: 'shocked', style: 'snap', dur: .1 },
    { t: J2 + .28, pose: L.grip, expr: 'shocked', dur: .25, ease: 'out' },
    { t: 21.6, pose: L.reachMug, expr: 'nervous', dur: .35 },                        // eyes on the teetering mug, reaches for it
    { t: LAND - .02, pose: L.wince, expr: 'cringe', dur: .15, ease: 'out' },          // it hits the floor: wince
    { t: 23.05, pose: L.caught, expr: 'nervous', dur: .4, ease: 'io' },               // slowly turns to the teacher
    { t: 23.6, pose: L.playDead, expr: 'sleepy', dur: .45, ease: 'io' },              // ...and puts his head back down
  ];
  girl.keys = [
    { t: 0, pose: L.writeGirl, expr: 'neutral', at: seat(.9, 2.8), face: F },
    { t: 2.4, pose: L.writeGirl2, expr: 'neutral' }, { t: 9, pose: L.writeGirl, expr: 'neutral' },
    { t: BACK - .05, pose: L.writeGirl2, expr: 'neutral', steps: 0, dur: .01 },
    { t: J2 + .05, pose: L.flinch, expr: 'surprised', style: 'snap', dur: .12 },        // flinches away from the bang
    { t: J2 + .7, pose: L.writeGirl2, expr: 'skeptical', dur: .4 },                     // settles, side-eyes him
    { t: 23.0, pose: L.laughCover, expr: 'laugh', dur: .3 },                            // the coffee: laughs into her hand
  ];
  // classmates: writing; on the bang (J2) everyone whips round to look at him, each their own way
  const GUY_HEAD = new THREE.Vector3(-.9, 1.25, 3.3), wrap = a => Math.atan2(Math.sin(a), Math.cos(a)), clamp = (v, a) => Math.max(-a, Math.min(a, v));
  npc.forEach((n, i) => {
    const [x, z] = SEATS[i], sx = x, sz = z + .5, d = J2 + .12 + [3, 1, 2, 4, 0, 5, 1, 2][i] * .07;
    const need = wrap(Math.atan2(GUY_HEAD.x - sx, GUY_HEAD.z - sz) - F), tw = clamp(need * .45, .85);
    const look = (bodyYaw, k = 1) => { const p = JSON.parse(JSON.stringify(i % 2 ? L.writeTest2 : L.writeTest)); p.root = { ...p.root, ry: bodyYaw * k, rx: -.04 };
      p.head = { r: [-.06 + (i % 3) * .04, clamp(need - bodyYaw * k, 1.6), i % 2 ? .08 : -.06] }; p.armL = [.35, -.4, .85]; return p; };
    n.keys = [{ t: 0, pose: i % 2 ? L.writeTest2 : L.writeTest, expr: 'neutral', at: seat(x, z), face: F }, { t: 8 + i * .6, pose: i % 2 ? L.writeTest : L.writeTest2 },
      { t: d, pose: look(tw), expr: 'surprised', snap: 1.2 }, { t: d + 1.3, pose: look(tw, 1.12), expr: i % 2 ? 'laugh' : 'surprised' }];
  });
  // the teacher stands in the window-side aisle beside his desk, facing him (+x)
  const TA = [-1.62, 0, 2.15], TF = Math.atan2(-.9 - TA[0], 3.25 - TA[2]);
  teacher.keys = [
    { t: 0, pose: L.tWatch, expr: 'skeptical', at: TA, face: TF },
    { t: J2 + .08, pose: L.tStart, expr: 'surprised', dur: .18, ease: 'out' },          // a small start at the bang
    { t: 21.75, pose: L.tReach, expr: 'surprised', dur: .4 },                           // leans in, reaches for the teetering mug
    { t: TIP + .1, pose: L.tDodge, expr: 'annoyed', at: [TA[0] - .22, 0, TA[2] - .12], dur: .3, ease: 'out' },   // too late: steps back out of the splash
    { t: 23.25, pose: L.tGlare, expr: 'angry', at: [TA[0] - .15, 0, TA[2] - .08], dur: .45, ease: 'io' },           // arms crossed, stares at him
  ];

  // ---------- Brain HQ ----------
  const B = buildBrainRoom(scene, { at: [300, 0, 0], leverLabel: 'MUSCLES' }), O = [300, 0, 0], zF = -3.6 * .62 + .12, CZ = zF + .95;
  // the big red ALL MUSCLES button: yellow/black hazard collar, chrome ring, glossy red dome, label plate, on the right of the panel
  const BTN = new THREE.Vector3(300 + .66, .87, CZ + .2), btn = new THREE.Group(); btn.position.copy(BTN); btn.rotation.x = .32; scene.add(btn);
  const hz = canvasTex(512, 64, (g, w, h) => { for (let i = -2; i < 34; i++) { g.fillStyle = i % 2 ? '#1b1b1b' : '#f6c21a'; g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16 + 16, 0); g.lineTo(i * 16 + 4, h); g.lineTo(i * 16 - 12, h); g.fill(); } }, [1, 1]);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.13, .14, .04, 40), [new THREE.MeshStandardMaterial({ map: hz, roughness: .5 }), new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: .6 }), new THREE.MeshStandardMaterial({ color: 0x1b1b1b })]); collar.position.y = .02; btn.add(collar);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.098, .012, 12, 40), new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: .9, roughness: .2 })); ring.rotation.x = F / 2; ring.position.y = .042; btn.add(ring);
  const domeM = new THREE.MeshPhysicalMaterial({ color: 0xe0161b, emissive: 0x7a0000, emissiveIntensity: .3, roughness: .15, clearcoat: 1 });
  const cap = new THREE.Group(); cap.position.y = .04; btn.add(cap);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.09, 32, 16, 0, F * 2, 0, F / 2), domeM); dome.scale.y = .6; dome.castShadow = true; cap.add(dome);
  const plateT = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#e8ecf1'; g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 10); g.fill(); g.fillStyle = '#c0121f'; g.font = '800 36px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ALL MUSCLES', w / 2, h / 2 + 2); }, [1, 1]);
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(.24, .06), new THREE.MeshBasicMaterial({ map: plateT, toneMapped: false })); plate.rotation.x = -F / 2; plate.position.set(0, .002, .19); btn.add(plate);

  const STAND = [300 + .3, 0, CZ + .8];   // stands well back from the console (his legs shove the stool back as he gets up)
  B.stool.scale.y = STOOL_K; const stoolZ = B.stool.position.z;
  op.keys = [
    { t: 0, pose: L.hqSleep, expr: 'sleepy', at: [300, .03, zF + 1.75], face: F },
    { t: 7.6, pose: L.hqNod, expr: 'sleepy', dur: .8, ease: 'in' },
    { t: 8.7, pose: L.hqSleep, expr: 'sleepy', dur: .3 },
    { t: 9.3, pose: L.hqNod, expr: 'sleepy', dur: .8, ease: 'in' },
    { t: 10.45, pose: L.hqStartle, expr: 'scream', style: 'snap', dur: .1 },            // the alarm: bolts upright, guard up
    { t: 10.95, pose: L.hqLookL, expr: 'shocked', dur: .25 },                          // what? where?
    { t: 11.4, pose: L.hqLookR, expr: 'shocked', dur: .25 },
    { t: 11.9, pose: L.hqStare, expr: 'shocked', dur: .35 },                           // FALLING?!
    { t: 12.95, pose: L.windUp, expr: 'determined', at: STAND, face: F, dur: .5 },      // PRE: up off the stool, winds up
    { t: SLAM, pose: L.slam, expr: 'furious', style: 'snap', dur: .1 },                 // ACTION: SLAM
    { t: SLAM + .5, pose: L.slamHold, expr: 'determined', dur: .4 },                   // REACTION: holds it, checks the screen
    { t: 15.25, pose: L.proud, expr: 'cool', dur: .35 },                               // POST: little fist pump, saved you
  ];
  // the screen: muscle bars full -> draining (relax so fast) -> red FALLING!! with the altitude dropping -> ALL MUSCLES ON
  const screen = (g, w, h, t) => {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const relax = 1 - ss(t, 8.55, 9.9), bars = (lv, col) => { for (let i = 0; i < 6; i++) { const x = 70 + i * 86, hh = 150 * Math.max(.04, lv * (0.85 + .15 * Math.sin(i * 2.1 + t * 3))); g.fillStyle = '#1d4a3a'; g.fillRect(x, 120, 60, 150); g.fillStyle = col; g.fillRect(x, 270 - hh, 60, hh); } };
    if (t < 10.4) { g.fillStyle = '#0c2a22'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '800 44px Fredoka, Arial Black, sans-serif'; g.fillText(t < 8.55 ? 'MUSCLES  zzz' : 'MUSCLES: RELAXING', w / 2, 60);
      bars(relax, relax > .5 ? '#4dff9a' : relax > .2 ? '#ffd14f' : '#ff5a5a'); g.font = '800 54px Fredoka, Arial Black, sans-serif'; g.fillStyle = relax > .2 ? '#4dff9a' : '#ff5a5a'; g.fillText(Math.round(relax * 100) + '%' + (t > 8.55 ? '  ▼' : ''), w / 2, 330); }
    else if (t < SLAM) { const fl = Math.floor(t * 6) % 2; g.fillStyle = fl ? '#7a0a12' : '#c0121f'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '700 40px Fredoka, Arial, sans-serif'; g.fillText('!! WARNING !!', w / 2, 70);
      g.font = '800 92px Fredoka, Arial Black, sans-serif'; g.fillText('FALLING!!', w / 2, 185); g.font = '800 46px Fredoka, Arial Black, sans-serif'; g.fillText('ALTITUDE: ' + Math.max(0, Math.round(300 - (t - 10.4) * 95)) + ' m ▼', w / 2, 300); }
    else { const u = t - SLAM, k = Math.max(1, 1.7 - u * 4); g.fillStyle = '#0c2a22'; g.fillRect(0, 0, w, h); bars(1, '#4dff9a'); g.save(); g.translate(w / 2, 200); g.scale(k, k); g.rotate(-.06); g.fillStyle = '#ffd14f'; g.strokeStyle = '#0c2a22'; g.lineWidth = 10;
      g.font = '800 70px Fredoka, Arial Black, sans-serif'; g.strokeText('ALL MUSCLES: ON', 0, 0); g.fillText('ALL MUSCLES: ON', 0, 0); g.restore(); if (u > .9) { g.fillStyle = '#4dff9a'; g.font = '800 46px Fredoka, Arial Black, sans-serif'; g.fillText('SAVED ✓', w / 2, 330); } }
  };

  // ---------- camera ----------
  const R = (x, y, z) => [O[0] + x, O[1] + y, O[2] + z], D2R = F / 180, GH = [-.9, 1.2, 3.25];
  const shot = (tg, yaw, dist, y, frameH, o = {}) => { const a = yaw * D2R, p = [tg[0] - Math.sin(a) * dist, y, tg[2] - Math.cos(a) * dist], d = Math.hypot(p[0] - tg[0], p[1] - tg[1], p[2] - tg[2]);
    return { p, l: [tg[0], tg[1] + (o.ly ?? 0), tg[2]], fov: 2 * Math.atan(frameH / 2 / d) / D2R, ...o }; };
  // LONG LENS (Xavier 2026-11-12: "not enough camera room", everything looked too big): classroom shots are taken from
  // 3-5 m away, high over the classmates' heads, at fov 18-34, so the R6 bodies sit IN the frame instead of filling it.
  const camera = [
    // EVERY CUT FRAMES ITS POINT (Xavier 2026-11-12). Long lens, high over the heads, never still.
    // cold open (teacher not here yet) - point: him dozing off, head bobbing
    { t: 0, p: [-1.85, 2.5, -.45], l: [-.92, 1.25, 3.3], fov: 31 },
    { t: 2.15, p: [-1.82, 2.45, -.25], l: [-.92, 1.25, 3.3], fov: 28 },
    // point: the whole body jolts (full figure + desk)
    { t: 2.2, p: [-2.1, 2.7, -.5], l: [-.92, 1.0, 3.2], fov: 41, cut: true },
    { t: 4.3, p: [-2.05, 2.65, -.3], l: [-.92, 1.03, 3.2], fov: 38 },
    // point: his face + hands: looks round, scratches his head
    { t: 4.35, p: [-1.75, 2.05, .45], l: [-.92, 1.35, 3.3], fov: 33, cut: true },
    { t: 6.0, p: [-1.72, 2.0, .7], l: [-.92, 1.38, 3.3], fov: 29 },
    { t: 6.05, p: [-.9, 1.56, 2.4], l: [-.9, 1.53, 3.3], fov: 30, cut: true, ease: 'in', zoom: true },    // push into his forehead...
    { t: 6.28, p: [-.9, 1.55, 2.96], l: [-.9, 1.53, 3.3], fov: 30, ease: 'in', zoom: true },
    // Brain HQ - point: little him asleep at the controls, screen "MUSCLES zzz"
    { t: HQ, p: R(1.75, 1.8, 1.35), l: R(-.05, 1.1, -.75), fov: 46, cut: true },
    { t: 8.5, p: R(1.6, 1.75, 1.15), l: R(-.05, 1.1, -.75), fov: 42 },
    // point: THE MUSCLES DRAINING (gauge needle + bars), over his shoulder, high
    { t: 8.55, p: R(0, 1.38, -.12), l: R(0, 1.38, -1.36), fov: 72, cut: true },   // straight on, the whole screen: the bars draining
    { t: 10.35, p: R(0, 1.38, -.28), l: R(0, 1.38, -1.36), fov: 72 },
    // point: his face as the alarm hits
    { t: 10.4, p: R(-1.25, 2.0, -1.9), l: R(0, 1.25, -.38), fov: 48, cut: true },
    { t: 10.5, p: R(-1.2, 1.98, -1.85), l: R(0, 1.3, -.38), fov: 40, zoom: true, ease: 'out' },
    { t: 11.85, p: R(-1.15, 1.96, -1.82), l: R(0, 1.3, -.38), fov: 37, zoom: true },
    // point: the screen FALLING!! (big), his head in the corner
    { t: 11.9, p: R(0, 1.38, -.16), l: R(0, 1.38, -1.36), fov: 72, cut: true },
    { t: 12.95, p: R(0, 1.38, -.3), l: R(0, 1.38, -1.36), fov: 72 },
    // point: he gets up (stool shoves back) and winds up - whole body, from the side wall
    { t: 12.98, p: R(-2.2, 1.75, .25), l: R(.3, 1.25, -.55), fov: 42, cut: true },
    { t: 13.6, p: R(-2.15, 1.72, .15), l: R(.32, 1.2, -.58), fov: 39 },
    // point: THE BUTTON: low over the panel, the fist comes down into frame and hits it
    { t: 13.62, p: R(1.0, 1.72, -1.95), l: R(.58, 1.08, -.8), fov: 60, cut: true },   // from the front, high: fist + button + his face
    { t: 14.15, p: R(.98, 1.7, -1.92), l: R(.58, 1.06, -.8), fov: 55 },
    // point: the screen goes ALL MUSCLES: ON while he holds the button
    { t: 14.2, p: R(-.65, 1.95, .35), l: R(.15, 1.3, -1.3), fov: 44, cut: true },
    { t: 15.2, p: R(-.6, 1.9, .2), l: R(.15, 1.3, -1.3), fov: 40 },
    // point: proud little fist pump
    { t: 15.25, p: R(-1.35, 1.95, -1.85), l: R(.3, 1.3, -.38), fov: 46, cut: true },
    { t: 16.65, p: R(-1.3, 1.92, -1.8), l: R(.3, 1.32, -.38), fov: 42 },
    // back in class - point: now we see the teacher beside him and her coffee on the corner (wide, high, front-right)
    { t: BACK, p: [1.75, 2.8, .55], l: [-1.25, 1.05, 2.75], fov: 40, cut: true },
    { t: 17.8, p: [1.7, 2.75, .7], l: [-1.25, 1.05, 2.75], fov: 37 },
    // point: his legs right under the desk (low, from the aisle)
    { t: 17.85, p: [.35, .6, 1.75], l: [-.9, .42, 3.05], fov: 66, cut: true },
    { t: 20.8, p: [.3, .58, 1.9], l: [-.9, .42, 3.05], fov: 58 },
    // point: the jolt hits the desk, the mug hops (wide)
    { t: 20.85, p: [1.7, 2.8, .6], l: [-1.25, 1.05, 2.75], fov: 40, cut: true },
    { t: 21.3, p: [1.62, 2.72, .78], l: [-1.25, 1.0, 2.7], fov: 36 },
    // point: THE MUG wobbling on the edge... going over... the splash (follows it down)
    { t: 21.35, p: [.25, 1.15, 1.85], l: [-1.32, .95, 2.64], fov: 30, cut: true },
    { t: TIP, p: [.22, 1.12, 1.9], l: [-1.34, .95, 2.64], fov: 28 },
    { t: LAND, p: [.15, .95, 1.95], l: [-1.5, .25, 2.68], fov: 38, ease: 'io' },
    { t: 23.05, p: [.12, .9, 1.98], l: [-1.55, .15, 2.7], fov: 39 },
    // point: the teacher's glare (reverse over his shoulder)
    { t: 23.1, p: [-.3, 2.15, 4.65], l: [-1.55, 1.35, 2.3], fov: 42, cut: true },
    { t: 24.3, p: [-.36, 2.1, 4.5], l: [-1.55, 1.35, 2.3], fov: 38 },
  ];
  // the camera is never still (Xavier 2026-11-12): any shot whose keys barely move gets a slow push in (or ease out)
  for (let i = 0, n = 0; i < camera.length; i++) { const k = camera[i], nx = camera[i + 1]; if (!nx || nx.cut) continue;
    const d = Math.hypot(nx.p[0] - k.p[0], nx.p[1] - k.p[1], nx.p[2] - k.p[2]), df = Math.abs((nx.fov || k.fov) - k.fov);
    if (d < .05 && df < 1) { const dir = (n++ % 2 ? -1 : 1) * .05; nx.p = nx.p.map((v, j) => v + (k.l[j] - v) * dir); nx.fov = (nx.fov || k.fov) * (1 - dir * .5); } }
  const shakes = [{ t: J1, amp: .05, dur: .45 }, { t: SLAM, amp: .06, dur: .5 }, { t: J2, amp: .05, dur: .45 }, { t: LAND, amp: .02, dur: .3 }];

  async function bake(renderer) {   // his POV of the classroom for the Brain HQ eye windows
    for (const a of [guy, girl, teacher, ...npc]) a.update(8);
    guy.A.root.visible = false; teacher.A.root.visible = false; mug.visible = false; puddle.visible = false; guy.A.root.updateMatrixWorld(true);
    const cam = new THREE.PerspectiveCamera(78, 2, .05, 200); cam.position.set(-.9, 1.3, 3.18); cam.lookAt(-.9, .95, 1.4);
    const rt = new THREE.WebGLRenderTarget(1024, 512, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); guy.A.root.visible = true;
    B.setView(rt.texture);
  }

  // desk jolt: his knee/foot rams the desk up from below: it hops ~9 cm, tips toward the front, lands shifted 5 cm
  function deskAt(t) {
    let y = 0, rx = 0, dz = 0, rz = 0;
    for (const j of [J1, J2]) { const u = t - j - .03; if (u < 0) continue; const hop = u < .3 ? Math.sin(F * u / .3) : u < .45 ? .18 * Math.sin(F * (u - .3) / .15) : 0;
      y = .09 * hop; rx = -.12 * hop; rz = .03 * hop; dz = -.05 * ss(u, 0, .3) * (j === J2 || t < BACK ? 1 : 0); }
    if (t >= BACK && t < J2 + .03) { y = 0; rx = 0; rz = 0; dz = 0; }   // the replay starts clean
    myDesk.position.set(deskBase.x, deskBase.y + y, deskBase.z + dz); myDesk.rotation.set(rx, 0, rz);
    // the chair kicks back a little with the jolt
    let cz = 0; for (const j of [J1, J2]) { const u = t - j; if (u >= 0 && (j === J2 || t < BACK)) cz = .1 * (1 - Math.exp(-u * 9)); }
    myChair.position.set(chairBase.x, chairBase.y, chairBase.z + .12 + cz);
    return { y, dz };
  }
  // the mug, frame by frame like it would really go (pure in t):
  //  rest on the corner -> the desk hop throws it up a few cm -> it comes down half over the left edge -> wobbles on the edge,
  //  pivoting on the rim where it touches (each rock a bit bigger) -> tips over that edge -> falls, turning -> hits the floor,
  //  coffee splashes out under the desk -> the mug rolls a little on its side and stops.
  const QZ = new THREE.Quaternion(), QY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), 2.3), ZA = new THREE.Vector3(0, 0, 1), XA = new THREE.Vector3(1, 0, 0);
  const tilt = (th, roll = 0) => { QZ.setFromAxisAngle(ZA, th); mug.quaternion.copy(QZ).multiply(new THREE.Quaternion().setFromAxisAngle(XA, roll)).multiply(QY); };
  const LANDED = J2 + .06 + .3, TIPPED = TIP + .18, TH1 = 1.0, c0 = XL - EDGE_X;
  const atEdge = (th, y) => { mug.position.set(EDGE_X + c0 * Math.cos(th), y + c0 * Math.sin(th), MUG0.z); };   // bottom centre, rotated about the rim on the edge
  function mugAt(t, dk) {
    mug.visible = t >= BACK; puddle.visible = t >= LAND; drops.forEach(d => d.visible = false); coffee.visible = t < TIPPED;
    if (!mug.visible) return;
    const u = t - J2 - .06, Y = TOPY + dk.y;
    if (u < 0) { mug.position.set(MUG0.x, Y, MUG0.z + dk.dz); tilt(0); return; }
    if (t < LANDED) { const k = u / .3; mug.position.set(THREE.MathUtils.lerp(MUG0.x, XL, ss(k, 0, 1)), TOPY + Math.max(0, 1.3 * u - 4.9 * u * u * 1.9), MUG0.z); tilt(.25 * Math.sin(k * F), .1 * Math.sin(k * F)); return; }
    if (t < TIP) {   // wobbling on the edge: rocks out over the drop and settles back, each rock bigger
      const w = t - LANDED, A = .06 + .32 * ss(t, LANDED, TIP), th = A * Math.max(0, Math.sin(w * 11)); atEdge(th, TOPY); tilt(th); return; }
    if (t < TIPPED) { const k = (t - TIP) / (TIPPED - TIP), th = THREE.MathUtils.lerp(.38, TH1, k * k); atEdge(th, TOPY); tilt(th); return; }   // goes over
    if (t < LAND) {  // falling: off the edge, turning over, the coffee pouring out behind it
      const d = t - TIPPED, p1x = EDGE_X + c0 * Math.cos(TH1); mug.position.set(p1x - .45 * d, TOPY + c0 * Math.sin(TH1) - 4.9 * d * d, MUG0.z + .1 * d); tilt(TH1 + 3.6 * d);
      drops.forEach((m, i) => { const lag = .03 + i * .018, dd = d - lag; if (dd <= 0) return; m.visible = true; m.position.set(p1x - .45 * dd - .02 * (i % 3), TOPY + .05 - 4.9 * dd * dd, MUG0.z + .1 * dd + .01 * (i % 2)); });
      return; }
    // on the floor, on its side, a short roll; the coffee splashes out and spreads into a puddle under the desk edge
    const w = t - LAND, roll = 1 - Math.exp(-w * 5); mug.position.set(FLOOR.x + .1 * roll, MR, FLOOR.z + .04 * roll); tilt(F / 2, 1.8 * roll);
    puddle.scale.setScalar(.2 + .8 * ss(w, 0, .4));
    drops.forEach((m, i) => { const a = i / drops.length * F * 2 + .4, sp = .5 + (i % 4) * .22, vy = .9 + (i % 3) * .45, y = .02 + vy * w - 4.9 * w * w; m.visible = w < .45 && y > 0;
      m.position.set(FLOOR.x + Math.cos(a) * sp * w, y, FLOOR.z + Math.sin(a) * sp * w * .8); });
  }

  function update(t) {
    const dk = deskAt(t); coffee.visible = true; mugAt(t, dk);
    teacher.A.root.visible = t >= BACK;
    op.A.root.visible = !((t >= 8.55 && t < 10.4) || (t >= 11.9 && t < 12.98));   // screen inserts: the camera sits where he is
    const press = t < SLAM ? 0 : Math.exp(-(t - SLAM) * 5); cap.position.y = .04 - .025 * (t >= SLAM && t < SLAM + .5 ? Math.min(1, (t - SLAM) * 30) * (1 - ss(t, SLAM + .2, SLAM + .5)) : 0);
    domeM.emissiveIntensity = .3 + 2.5 * press;
    const gauge = t < 8.55 ? .55 : t < SLAM ? .55 - .53 * ss(t, 8.55, 9.9) : .98;
    B.stool.position.z = stoolZ + .32 * ss(t, 12.98, 13.3); B.stool.rotation.y = .4 * ss(t, 12.98, 13.4);
    B.set({ screen, lever: 1, gauge, alarm: t >= 10.4 && t < SLAM ? 1 : 0, hideCables: t >= 13 && t < 15.25 ? [1, 3] : [], pulse: t > SLAM && t < 16.7 ? ((t - SLAM) * 2.2) % 1 : -1, t });
  }
  return { shakes, cast: { guy, girl, op, teacher, ...Object.fromEntries(npc.map((n, i) => ['n' + i, n])) }, camera, update, bake, keep: [B.group, btn] };
}
