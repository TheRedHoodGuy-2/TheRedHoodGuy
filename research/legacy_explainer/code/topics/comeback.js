// WHY YOU THINK OF THE PERFECT COMEBACK TOO LATE. Format A. Courtyard at recess (classroom set's campus) + Brain HQ +
// a small bathroom at night. Xavier's take, 36.4 s. Shot plan: topics/comeback/STORYBOARD.md (v2, his notes applied).
// 0-4.6     HOOK (question said + big on screen): you chill on a bench with a juice box; the roaster behind you, hand on
//           your shoulder, points down; kids walk over. Whip down to your JADANS (knockoff Jordans), they wiggle. Crane up
//           to his grin.
// 4.8-9.9   the roast line, the crowd OOOHs, drone pull-back (everyone turns), the crowd laughs, your frozen face.
// 10-17     mouth opens, nothing (bruh); you stand, turn and point... BUFFER (lag + spinner + XP error); walk away stiff.
// 17-24.4   Brain HQ: EMBARRASSMENT 100%, little you slams PANIC (alarm), the WORDS booth shutter slams down on the
//           worker writing comebacks; little you bangs on it.
// 24.4-36.4 night, bathroom: steam, your silhouette behind the curtain; HQ: shutter rolls up, the worker hands over the
//           glowing comeback; you rip the curtain half open and yell it at the tiles... BANG BANG on the door, mom yells;
//           your frozen face, eyes slide to the door.
import * as THREE from 'three';
import { limbTo } from '../../kit/r6pose.js';
export const FORMAT = 'A';
export const SET = 'classroom';

const A_ = (part, root, end, mid, o) => limbTo(part, root, end, mid, o);
const pose = (root, limbs, head, extra = {}) => { const p = { root, head, ...extra }; for (const [k, [e, m, o]] of Object.entries(limbs)) p[k] = A_(k, root, e, m, o); return p; };
// SITTING (Xavier's technique): torso base = butt on the seat, legs near vertical slid forward ~.31 (top of leg = knee)
const seatLegs = (a = 0, b = 0, c = 0) => ({ legL: { r: [-.093 - a * .3, .057, .063 + a * .2], o: [.028 + a * .1, .02, .309] }, legR: { r: [-.023 - c * .3, .092, -.169 + b * .3], o: [-.056 + b * .1, .02, .336] } });
const tapLegs = k => ({ legL: { r: [-.12 + k * .08, .06, .14 + k * .1], o: [.03, .02 + Math.max(0, k) * .03, .31] }, legR: { r: [-.05 - k * .08, .09, -.2 - k * .1], o: [-.056, .02 + Math.max(0, -k) * .03, .336] } });   // knees knock in / out
const standLegs = (a = 0, b = 0) => ({ legL: [.06 + a, -1, .03], legR: [-.08 - b, -1, -.03] });
const BENCH_Y = .63;   // bench refit to R6 (seat .45 x 1.4)
export const LOCAL_POSES = {
  // ---- you, on the bench (avatar frame: facing +z, bench seat at the origin) ----
  // chilling: juice box held at the chest (right forearm up from the elbow), left hand flat on the bench, leaning back
  chill: { ...pose({ y: -.02, rx: -.08, rz: .05, x: .02 }, {
      armR: [[-.16, .98, .34], [-.38, .8, .1], { local: true }],
      armL: [[.42, BENCH_Y + .04, -.05], null] }, [-.18, -.12, -.1]), ...seatLegs(.06, .1, -.06) },
  // sip: straw to the mouth
  sip: { ...pose({ y: -.02, rx: -.04, rz: .04, x: .02 }, {
      armR: [[-.06, 1.42, .24], [-.34, .95, .14], { local: true }],
      armL: [[.42, BENCH_Y + .04, -.05], null] }, [-.05, -.18, -.06]), ...seatLegs(.06, .1, -.06) },
  // looks down at his shoes (box lowered, shoulders up), knees knocking in / out = the shoes wiggling
  shoesIn: { ...pose({ y: -.03, rx: .22, rz: 0 }, {
      armR: [[-.12, 1.0, .34], [-.36, .8, .12], { local: true }],
      armL: [[.4, BENCH_Y + .04, .02], null] }, [.04, .62, .05]), ...tapLegs(1) },
  shoesOut: { ...pose({ y: -.03, rx: .22, rz: 0 }, {
      armR: [[-.12, 1.0, .34], [-.36, .8, .12], { local: true }],
      armL: [[.4, BENCH_Y + .04, .02], null] }, [-.04, .6, -.04]), ...tapLegs(-1) },
  // frozen: box stuck half way, body locked, head a touch forward
  frozen: { ...pose({ y: -.02, rx: .04 }, {
      armR: [[-.14, 1.0, .32], [-.36, .8, .1], { local: true }],
      armL: [[.42, BENCH_Y + .04, -.02], null] }, [.0, .06, 0]), ...seatLegs(.04, .04, -.04) },
  // mouth opens: leans in to answer, free hand lifts a little off the bench
  mouth: { ...pose({ y: -.02, rx: .14 }, {
      armR: [[-.14, 1.0, .34], [-.36, .8, .12], { local: true }],
      armL: [[.38, .82, .3], null] }, [0, -.06, 0]), ...seatLegs(.08, .06, -.04) },
  // OOOH lands: he shrinks into himself, shoulders up, chin tucked, box pulled in
  flinch: { ...pose({ y: -.05, rx: .18, rz: -.04 }, {
      armR: [[-.12, .98, .3], [-.32, .8, .08], { local: true }],
      armL: [[.36, BENCH_Y + .1, .12], null] }, [.08, .35, -.08]), ...seatLegs(.12, .12, -.08) },
  // the laughter: sinks lower, head down and to the side, free hand rubs the back of his neck (forearm from the elbow)
  shrink: { ...pose({ y: -.07, rx: .24, rz: .06 }, {
      armR: [[-.14, .96, .3], [-.34, .78, .08], { local: true }],
      armL: [[.1, 1.4, -.12], [.42, 1.16, .05], { local: true }] }, [-.25, .12, .08]), ...seatLegs(.1, .14, -.1) },
  // rising, half way: weight over the feet, still bent, arms swing forward for balance
  riseMid: { ...pose({ y: -.16, rx: .34 }, { armR: [[-.3, .78, .42], null], armL: [[.3, .78, .42], null] }, [0, -.22, 0]), legL: [.07, -.72, .66], legR: [-.08, -.75, .62] },
  // PRE point: the arm cocks back at the shoulder, chest turns
  pointPre: { ...pose({ rx: .04, ry: .2 }, { armR: [[-.42, 1.15, -.3], null], armL: [[.45, .62, .1], null] }, [-.1, .05, 0]), ...standLegs(.06, .02) },
  // PRE stand: lean forward, hands push on the knees
  rise: { ...pose({ y: -.02, rx: .42 }, {
      armR: [[-.2, .66, .42], null], armL: [[.2, .66, .42], null] }, [0, -.2, 0]), ...seatLegs(.1, .1, -.1) },
  // standing, turned to the roaster (he is behind the bench): point at him, chest out, other arm back
  point: { ...pose({ rx: -.06, rz: .05, x: .02 }, {
      armR: [[-.12, 1.42, .85], null, { lift: .04 }],
      armL: [[.5, .62, -.25], null] }, [-.12, -.05, .06]), ...standLegs(.06, .02) },
  // the lag: same point, small offsets snapped between them on twos (the buffer stutter)
  lagA: { ...pose({ rx: -.06, rz: .07, x: .03 }, {
      armR: [[-.14, 1.46, .84], null, { lift: .05 }],
      armL: [[.5, .62, -.24], null] }, [-.18, -.08, .1]), ...standLegs(.06, .02) },
  lagB: { ...pose({ rx: -.05, rz: .03, x: .01 }, {
      armR: [[-.1, 1.38, .86], null, { lift: .03 }],
      armL: [[.5, .62, -.26], null] }, [-.06, -.02, .02]), ...standLegs(.06, .02) },
  // gives up: arm drops, shoulders sag, head down
  giveUp: { ...pose({ rx: .1, rz: -.03 }, {
      armR: [[-.42, .62, .12], null], armL: [[.44, .62, .02], null] }, [.1, .35, -.06]), ...standLegs(0, 0) },
  // ---- the roaster (standing behind the bench, facing the same way as you) ----
  // one hand on your shoulder, the other points down over the backrest at your shoes, grinning
  rPoint: { ...pose({ rx: .22, rz: -.04 }, {
      armR: [[-.2, 1.18, .5], null],
      armL: [[.14, .74, .62], null] }, [.1, .42, .06]), ...standLegs(.02, .06) },
  // the roast line: turns to the crowd (his left), still pointing at the shoes, free hand on the hip (forearm from the elbow)
  rRoast: { ...pose({ rx: .1, ry: .35, rz: .04 }, {
      armR: [[-.08, .72, .6], null],
      armL: [[.2, .95, -.02], [.42, 1.02, .04], { local: true }] }, [.45, .05, .1]), ...standLegs(.06, .04) },
  // laughs: bends over, both forearms clutch the stomach, head back up
  rLaugh: { ...pose({ rx: .3, rz: .1, y: -.04 }, {
      armR: [[.06, .9, .3], [-.36, 1.0, .12], { local: true }],
      armL: [[-.06, .86, .32], [.38, .98, .14], { local: true }] }, [-.15, -.35, .15]), ...standLegs(.1, .08) },
  // watches you point at him: arms crossed, head cocked
  rCross: { ...pose({ rx: -.04, rz: .04 }, {
      armL: [[-.16, 1.02, .3], [.48, .96, .18], { local: true }],
      armR: [[.17, .98, .26], [-.48, .92, .16], { local: true }] }, [.05, .1, -.16]), ...standLegs(.04, .06) },
  // ---- the crowd (standing) ----
  cWatch: { ...pose({ rx: .05 }, { armR: [[-.42, .6, .1], null], armL: [[.42, .6, .06], null] }, [0, .12, 0]), ...standLegs(.02, .04) },
  cWatch2: { ...pose({ rx: .02, rz: .05 }, { armR: [[-.4, .62, .14], null], armL: [[.2, .95, -.02], [.42, 1.02, .04], { local: true }] }, [.08, .15, .08]), ...standLegs(.06, 0) },
  // OOOH: hand flies to the mouth (forearm from the elbow), body rocks back
  cOoh: { ...pose({ rx: -.12, rz: -.04 }, { armR: [[-.06, 1.46, .24], [-.32, 1.02, .14], { local: true }], armL: [[.46, .66, -.1], null] }, [-.08, -.2, .05]), ...standLegs(.04, .08) },
  cOoh2: { ...pose({ rx: -.1, rz: .05 }, { armL: [[.06, 1.46, .24], [.32, 1.02, .14], { local: true }], armR: [[-.36, 1.05, .45], null] }, [.08, -.18, -.06]), ...standLegs(.08, .02) },
  // laughing: doubled over clutching the stomach / pointing at you and laughing / hand over the mouth
  cLaugh: { ...pose({ rx: .32, rz: -.06, y: -.03 }, { armR: [[.06, .9, .3], [-.36, 1.0, .12], { local: true }], armL: [[-.06, .86, .32], [.38, .98, .14], { local: true }] }, [.1, -.3, -.12]), ...standLegs(.08, .1) },
  cLaughPt: { ...pose({ rx: -.14, rz: .1 }, { armR: [[-.1, 1.3, .8], null], armL: [[.06, .9, .3], [.38, 1.0, .12], { local: true }] }, [-.1, -.35, .15]), ...standLegs(.1, .04) },
  cLaughHand: { ...pose({ rx: .12, rz: -.1 }, { armR: [[-.06, 1.44, .25], [-.32, 1.0, .14], { local: true }], armL: [[.08, .88, .32], [.4, .98, .12], { local: true }] }, [-.2, .2, -.14]), ...standLegs(.04, .08) },
  // ---- WORDS worker: asleep at the counter, jolts awake at the alarm, looks up at it, reaches up to the shutter bar, pulls it
  // down (the shutter follows his hand); later pushes it back up from inside and holds the comeback out ----
  wSleep: { ...pose({ rx: .42, y: -.04 }, { armR: [[.06, 1.08, .4], [-.3, 1.06, .26], { local: true }], armL: [[-.06, 1.08, .42], [.3, 1.06, .26], { local: true }] }, [.25, .4, .3]), ...seatLegs(.05, .05, 0) },
  wJolt: { ...pose({ rx: -.14, rz: .05 }, { armR: [[-.46, 1.0, .3], null], armL: [[.46, .98, .26], null] }, [0, -.18, 0]), ...seatLegs(.05, .05, 0) },
  wLookUp: { ...pose({ rx: -.1, ry: .45 }, { armR: [[-.4, .78, .2], null], armL: [[.44, .8, .1], null] }, [.9, -.35, 0]), ...seatLegs(.05, .05, 0) },
  wReachBar: { ...pose({ rx: .04 }, { armR: [[-.05, 1.98, .56], null, { lift: .12 }], armL: [[.42, .72, .12], null] }, [0, -.35, 0]), legL: [.06, -1, 0], legR: [-.08, -1, 0] },
  wPullDown: { ...pose({ rx: .14, y: -.04 }, { armR: [[-.05, 1.14, .55], null], armL: [[.4, .7, .14], null] }, [0, .2, 0]), legL: [.1, -.98, .1], legR: [-.1, -.98, -.06] },
  wGive: { ...pose({ rx: .22 }, { armR: [[-.06, 1.2, .7], null], armL: [[.36, 1.06, .32], null] }, [0, .05, 0]), legL: [.06, -1, 0], legR: [-.08, -1, 0] },
  wWave: { ...pose({ rx: -.04, rz: .05 }, { armR: [[-.4, 1.62, .25], null, { lift: .08 }], armL: [[.36, 1.06, .32], null] }, [-.1, -.05, .08]), legL: [.06, -1, 0], legR: [-.08, -1, 0] },
  // ---- little you at the closed shutter: wind-up then fist hits (left hand flat on it), later forehead on it, slumped ----
  bangUp: { ...pose({ rx: -.05, rz: .06 }, { armR: [[-.4, 1.75, .05], null, { lift: .1 }], armL: [[.18, 1.25, .5], null] }, [-.1, -.05, .05]), legL: [.12, -.98, .12], legR: [-.12, -.98, -.1] },
  bangHit: { ...pose({ rx: .2, rz: -.04 }, { armR: [[-.12, 1.38, .62], null], armL: [[.22, 1.12, .48], null] }, [.05, .2, -.05]), legL: [.12, -.98, .12], legR: [-.12, -.98, -.1] },
  slump: { ...pose({ rx: .32, rz: .05 }, { armR: [[-.38, .62, .2], null], armL: [[-.05, 1.1, .36], [.3, 1.06, .2], { local: true }] }, [.15, .5, .1]), legL: [.12, -.98, .1], legR: [-.1, -.98, -.06] },
  stepBack: { ...pose({ rx: -.15 }, { armR: [[-.45, .9, .3], null], armL: [[.45, .88, .28], null] }, [0, -.15, 0]), legL: [.1, -1, -.1], legR: [-.1, -1, .12] },
  hqRead2: { ...pose({ rx: .1 }, { armR: [[-.07, 1.12, .4], [-.36, .95, .14], { local: true }], armL: [[.07, 1.12, .4], [.36, .95, .14], { local: true }] }, [0, .3, 0]), legL: [.1, -.98, .1], legR: [-.12, -.98, -.08] },
  // ---- you in the shower (shirtless, facing the tile wall): one hand on the wall, head down; then the hand on the face ----
  wallLean: { ...pose({ rx: .2, rz: .05, ry: .6 }, { armR: [[-.22, 1.55, .5], null], armL: [[.4, .62, .1], null] }, [.8, .1, 0]), legL: [.08, -1, .05], legR: [-.1, -1, -.05] },
  wallShakeL: { ...pose({ rx: .2, rz: .05, ry: .6 }, { armR: [[-.22, 1.55, .5], null], armL: [[.4, .62, .1], null] }, [.55, .1, 0]), legL: [.08, -1, .05], legR: [-.1, -1, -.05] },
  wallShakeR: { ...pose({ rx: .2, rz: .05, ry: .6 }, { armR: [[-.22, 1.55, .5], null], armL: [[.4, .62, .1], null] }, [1.0, .1, 0]), legL: [.08, -1, .05], legR: [-.1, -1, -.05] },
  facepalm: { ...pose({ rx: .22, rz: .03, ry: .6 }, { armR: [[-.22, 1.55, .5], null], armL: [[.05, 1.5, .2], [.32, 1.12, .16], { local: true }] }, [.75, .12, 0]), legL: [.08, -1, .05], legR: [-.1, -1, -.05] },
  // PRE: the hand comes off the face, he straightens up (he just thought of it)
  itHits: { ...pose({ rx: -.06 }, { armR: [[-.22, 1.5, .5], null], armL: [[.3, 1.15, .32], [.36, .95, .12], { local: true }] }, [.4, -.12, 0]), legL: [.08, -1, .05], legR: [-.1, -1, -.05] },
  // ACTION: screams it at the wall: leans in, chest out, both fists pulled back
  wallScream: { ...pose({ rx: .1, y: -.02 }, { armR: [[-.45, .78, -.25], null], armL: [[.45, .78, -.25], null] }, [.35, -.28, 0]), legL: [.12, -.98, .12], legR: [-.12, -.98, -.1] },
  // REACTION: both hands slap over his mouth (forearms from the elbows), shoulders up
  handsMouth: { ...pose({ rx: -.06, y: -.02 }, { armR: [[-.07, 1.36, .3], [-.36, .96, .14], { local: true }], armL: [[.07, 1.36, .3], [.36, .96, .14], { local: true }] }, [.45, -.1, 0]), legL: [.08, -1, .05], legR: [-.1, -1, -.05] },
  handsMouthL: { ...pose({ rx: -.04, y: -.02 }, { armR: [[-.07, 1.36, .3], [-.36, .96, .14], { local: true }], armL: [[.07, 1.36, .3], [.36, .96, .14], { local: true }] }, [.25, -.1, 0]), legL: [.08, -1, .05], legR: [-.1, -1, -.05] },
  // ---- little you in Brain HQ (stool .45 x 1.35, console .45 m in front, panel top ~.88) ----
  hqWatch: { ...pose({ y: -.04, rx: .2 }, { armL: [[.26, .86, .5], null], armR: [[-.28, .86, .5], null] }, [-.02, -.18, 0]), ...seatLegs(.2, -.1, .1) },
  hqCringe: { ...pose({ y: -.06, rx: .05, rz: .06 }, { armL: [[.08, 1.42, .2], [.36, .98, .2], { local: true }], armR: [[-.3, .86, .48], null] }, [.15, .05, .1]), ...seatLegs(.2, -.1, .1) },   // hand over the eyes
  windUp: { ...pose({ rx: -.1, ry: .32, rz: .08, x: .04 }, { armR: [[-.62, 1.85, -.42], null, { local: true, lift: .14 }], armL: [[.45, .75, .55], null] }, [-.35, .12, -.06]), legL: [.1, -.95, .3], legR: [-.14, -.95, -.3] },
  slam: { ...pose({ y: -.08, rx: .3, ry: -.12, rz: -.06 }, { armR: [[-.36, .93, .58], null], armL: [[.7, .7, -.35], null] }, [.1, .42, .04]), legL: [.12, -.95, .28], legR: [-.16, -.95, -.26] },
  slamHold: { ...pose({ y: -.04, rx: .16, ry: -.05 }, { armR: [[-.36, .92, .58], null], armL: [[.6, .6, -.12], null] }, [.3, -.22, .06]), legL: [.12, -.98, .24], legR: [-.14, -.98, -.2] },
  // banging on the shutter: both fists, alternating, from the shoulder (it is right in front of him)
  bangA: { ...pose({ rx: .08, rz: .04 }, { armR: [[-.14, 1.42, .5], null, { lift: .04 }], armL: [[.22, 1.12, .42], null] }, [.05, .1, .05]), legL: [.1, -.98, .1], legR: [-.12, -.98, -.08] },
  bangB: { ...pose({ rx: .1, rz: -.04 }, { armL: [[.14, 1.42, .5], null, { lift: .04 }], armR: [[-.22, 1.12, .42], null] }, [-.05, .12, -.05]), legL: [.1, -.98, .1], legR: [-.12, -.98, -.08] },
  // the comeback arrives: reaches for the card, then holds it up in both hands, reading
  hqReach: { ...pose({ rx: .12 }, { armR: [[-.08, 1.2, .62], null], armL: [[.42, .66, .1], null] }, [0, .05, 0]), legL: [.1, -.98, .1], legR: [-.12, -.98, -.08] },
  hqRead: { ...pose({ rx: -.08, rz: .04 }, { armR: [[-.08, 1.32, .4], [-.36, .98, .18], { local: true }], armL: [[.08, 1.32, .4], [.36, .98, .18], { local: true }] }, [0, .22, 0]), legL: [.1, -.98, .1], legR: [-.12, -.98, -.08] },
  // the WORDS worker behind the counter: writing a comeback card (forearm from the elbow), then holding one out
  wWrite: { ...pose({ rx: .25 }, { armR: [[-.08, .96, .42], [-.36, 1.0, .16], { local: true }], armL: [[.2, .96, .44], null] }, [0, .5, 0]), legL: [.06, -1, 0], legR: [-.08, -1, 0] },
  wDuck: { ...pose({ rx: -.18, y: -.04 }, { armR: [[-.12, 1.4, .28], [-.4, 1.05, .14], { local: true }], armL: [[.12, 1.4, .28], [.4, 1.05, .14], { local: true }] }, [0, -.25, 0]), legL: [.1, -.98, .12], legR: [-.12, -.98, -.1] },
  wGive: { ...pose({ rx: .18 }, { armR: [[-.06, 1.16, .66], null], armL: [[.42, .66, .02], null] }, [0, .1, 0]), legL: [.06, -1, 0], legR: [-.08, -1, 0] },
  // ---- you in the shower (standing in the tub) ----
  scrub: { ...pose({ rx: .05 }, { armR: [[-.12, 1.72, .08], [-.5, 1.4, .1], { local: true }], armL: [[.12, 1.7, .06], [.5, 1.36, .12], { local: true }] }, [0, .2, 0]), legL: [.06, -1, 0], legR: [-.08, -1, 0] },
  scrub2: { ...pose({ rx: .08, rz: .05 }, { armR: [[-.1, 1.66, .14], [-.5, 1.34, .14], { local: true }], armL: [[.14, 1.74, 0], [.5, 1.4, .06], { local: true }] }, [.1, .28, .06]), legL: [.06, -1, 0], legR: [-.08, -1, 0] },
  // PRE: the idea hits, he freezes mid-scrub, eyes wide; then grabs the curtain edge (his left, from the shoulder)
  idea: { ...pose({ rx: -.05 }, { armR: [[-.12, 1.6, .1], [-.5, 1.32, .12], { local: true }], armL: [[.44, 1.1, .55], null] }, [0, -.1, 0]), legL: [.06, -1, 0], legR: [-.08, -1, 0] },
  yank: { ...pose({ rx: -.04, ry: .2 }, { armL: [[.85, 1.15, .3], null], armR: [[-.42, .7, .1], null] }, [.3, -.05, .04]), legL: [.1, -1, .05], legR: [-.1, -1, -.05] },
  // ACTION: points hard at the tile wall and yells it, leaning in, chest out
  yell: { ...pose({ rx: -.12, ry: -.1, rz: .06 }, { armR: [[-.38, 1.5, .8], null, { lift: .06 }], armL: [[.5, .62, -.2], null] }, [-.35, -.18, .08]), legL: [.12, -1, .12], legR: [-.12, -1, -.12] },
  yell2: { ...pose({ rx: -.16, ry: -.12, rz: .09 }, { armR: [[-.36, 1.58, .78], null, { lift: .08 }], armL: [[.52, .7, -.24], null] }, [-.38, -.28, .1]), legL: [.12, -1, .12], legR: [-.12, -1, -.12] },
  // the bang on the door: freezes mid-point, only the head turns to the door
  caught: { ...pose({ rx: -.1, ry: -.1, rz: .06 }, { armR: [[-.38, 1.5, .8], null, { lift: .06 }], armL: [[.5, .62, -.2], null] }, [.55, -.05, .02]), legL: [.12, -1, .12], legR: [-.12, -1, -.12] },
};

// props refitted to R6 proportions
export const SHEET_PROPS = { stool: 1.35 };
export const POSE_SHEET = [
  ['you chill', 'guy', 'chill', 'smile', ''], ['you sip', 'guy', 'sip', 'happy', ''], ['shoes wiggle A', 'guy', 'shoesIn', 'nervous', ''], ['shoes wiggle B', 'guy', 'shoesOut', 'nervous', ''],
  ['roast lands (frozen)', 'guy', 'frozen', 'embarrassed', ''], ['OOOH flinch', 'guy', 'flinch', 'cringe', ''], ['laughed at (shrink)', 'guy', 'shrink', 'embarrassed', ''],
  ['leans in to answer', 'guy', 'mouth', 'determined', ''], ['nothing comes out', 'guy', 'frozen', 'embarrassed', ''], ['PRE stand: push off', 'guy', 'rise', 'determined', ''], ['rising', 'guy', 'riseMid', 'determined', ''],
  ['PRE point', 'guy', 'pointPre', 'determined', ''], ['POINT', 'guy', 'point', 'determined', ''], ['buffer A', 'guy', 'lagA', 'blank', ''], ['buffer B', 'guy', 'lagB', 'blank', ''], ['arm drops', 'guy', 'giveUp', 'embarrassed', ''],
  ['roaster points', 'n0', 'rPoint', 'grin', ''], ['roaster roasts', 'n0', 'rRoast', 'smirk', ''], ['roaster laughs', 'n0', 'rLaugh', 'laugh', ''], ['roaster arms crossed', 'n0', 'rCross', 'skeptical', ''],
  ['crowd watch', 'n1', 'cWatch', 'neutral', ''], ['crowd OOOH', 'n1', 'cOoh', 'shocked', ''], ['crowd OOOH 2', 'girl', 'cOoh2', 'surprised', ''], ['crowd laugh', 'n1', 'cLaugh', 'laugh', ''], ['crowd point-laugh', 'n1', 'cLaughPt', 'laugh', ''], ['girl laughs (hand)', 'girl', 'cLaughHand', 'laugh', ''],
  ['HQ watch', 'guy', 'hqWatch', 'nervous', 'stool'], ['HQ meter climbs', 'guy', 'hqCringe', 'embarrassed', 'stool'], ['HQ wind-up', 'guy', 'windUp', 'determined', ''], ['HQ SLAM', 'guy', 'slam', 'furious', ''], ['HQ after slam', 'guy', 'slamHold', 'scream', ''],
  ['worker asleep', 'n1', 'wSleep', 'sleepy', ''], ['worker jolts awake', 'n1', 'wJolt', 'shocked', ''], ['worker looks at alarm', 'n1', 'wLookUp', 'nervous', ''], ['worker reaches bar', 'n1', 'wReachBar', 'determined', ''], ['worker pulls it down', 'n1', 'wPullDown', 'determined', ''],
  ['little you wind-up', 'guy', 'bangUp', 'frustrated', ''], ['little you hits shutter', 'guy', 'bangHit', 'furious', ''], ['slumped on shutter', 'guy', 'slump', 'sad', ''], ['steps back (it moves)', 'guy', 'stepBack', 'surprised', ''],
  ['worker gives comeback', 'n1', 'wGive', 'happy', ''], ['reaches for it', 'guy', 'hqReach', 'surprised', ''], ['reads it', 'guy', 'hqRead2', 'starstruck', ''],
  ['shower: hand on wall', 'guy', 'wallLean', 'sad', ''], ['shakes head L', 'guy', 'wallShakeL', 'sad', ''], ['shakes head R', 'guy', 'wallShakeR', 'sad', ''], ['hand on face', 'guy', 'facepalm', 'sad', ''],
  ['PRE: it hits him', 'guy', 'itHits', 'surprised', ''], ['SCREAM at wall', 'guy', 'wallScream', 'scream', ''], ['hands over mouth', 'guy', 'handsMouth', 'shocked', ''], ['eyes to the door', 'guy', 'handsMouthL', 'sideeyeR', ''],
];
export async function SHEET_CAST(CAST) { const S = await import(new URL('kit/students.js', document.baseURI).href); const [n0, n1] = await S.castStudents(CAST, 2, { seed: 21 }); return { n0, n1 }; }

// ---------- timings (s, on the take) ----------
const T_ROAST = 4.78, T_OOH = 5.9, T_LAUGH = 8.72, T_MOUTH = 10.46, T_NOTHING = 12.0, T_POINT = 14.16, T_BUF = 15.28, T_WALK = 16.2, T_HQ = 17.0;

export async function setup({ CAST, world, scene, words, stage }) {
  const F = Math.PI, L = LOCAL_POSES, ss = THREE.MathUtils.smoothstep;
  const N = await import(new URL('kit/props/nature.js', document.baseURI).href), { canvasTex } = await import(new URL('kit/util.js', document.baseURI).href);
  const { wearSneakers } = await import(new URL('kit/props/sneaker.js', document.baseURI).href), RB = await import(new URL('kit/roblox.js', document.baseURI).href);
  // ---------- HOOK TITLE (Xavier 2026-11-12): the question is said AND big on screen while the roast is already happening;
  // the one-word captions start after it so the words aren't doubled ----------
  const TITLE_END = 4.55;
  for (let i = words.length - 1; i >= 0; i--) if (words[i].s < TITLE_END) words.splice(i, 1);
  const title = document.createElement('div'); title.id = 'hooktitle';
  title.style.cssText = 'position:absolute;left:6%;right:6%;top:9%;text-align:center;font-family:Caption,sans-serif;font-weight:800;line-height:1.08;font-size:calc(var(--w)*.083);color:#fff;-webkit-text-stroke:calc(var(--w)*.016) #111;paint-order:stroke fill;text-shadow:calc(var(--w)*.006) calc(var(--w)*.008) 0 #111,calc(var(--w)*.012) calc(var(--w)*.016) 0 #111;pointer-events:none;opacity:0';
  title.textContent = 'Why do you think of the perfect comeback too late?'; stage.appendChild(title);

  // ---------- the courtyard: our bench on the lawn beside the cross path ----------
  const GY = -.3, BX = -12.5, BZ = -3.0;
  const bench = N.bench(); bench.scale.set(1.1, 1.4, 1.25); bench.position.set(BX, GY, BZ); scene.add(bench);   // backrest at +z = BEHIND the sitter, who faces -z (checked in stills)
  // grass blades poke through the shoes in close-ups (Xavier 2026-11-13: "the shoes are clipping into the grass"): the
  // lawn where everyone stands is mown short, i.e. no blade instances within ~4.5 m of the bench or along your exit
  { const m4 = new THREE.Matrix4(), P = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const clear = (x, z) => Math.hypot(x - BX, (z - BZ) * .9) < 4.6 || (x < BX && x > BX - 4.6 && Math.abs(z - (BZ - .5)) < 1.2);
    scene.traverse(o => { if (!o.isInstancedMesh || !(o.parent && o.parent.isLOD)) return; let n = 0;
      for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); P.setFromMatrixPosition(m4).add(o.parent.position); if (clear(P.x, P.z)) { o.setMatrixAt(i, zero); n++; } }
      if (n) { o.instanceMatrix.needsUpdate = true; o.computeBoundingSphere(); } }); }
  // ---------- cast ----------
  const guy = await CAST.castMain('guy'), girl = await CAST.castMain('girl');
  await wearSneakers(guy.A);
  const { castStudents } = await import(new URL('kit/students.js', document.baseURI).href);
  const kids = await castStudents(CAST, 10, { seed: 21 }), roaster = kids[0], crowd = kids.slice(1);
  // juice box in his right hand (a real carton: printed wrap, folded top seam, bent straw), rides the arm bone
  const box = new THREE.Group(); box.scale.setScalar(1.6);
  { const wrap = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#ffd23f'; g.fillRect(0, 0, w, h); g.fillStyle = '#3fae49'; g.fillRect(0, h * .72, w, h * .28);
      g.fillStyle = '#e8402a'; g.beginPath(); g.arc(w * .3, h * .42, h * .2, 0, 7); g.fill(); g.fillStyle = '#3fae49'; g.beginPath(); g.ellipse(w * .32, h * .2, h * .06, h * .03, .6, 0, 7); g.fill();
      g.fillStyle = '#7a3b12'; g.font = '800 60px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; g.fillText('APPLE', w * .7, h * .38); g.font = '700 40px Fredoka, Arial, sans-serif'; g.fillText('JUICE', w * .7, h * .56); }, [1, 1]);
    const bw = .075, bh = .12, bd = .048, card = new THREE.MeshStandardMaterial({ map: wrap, roughness: .5 }), plain = new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: .5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), [plain, plain, plain, plain, card, card]); body.position.y = bh / 2; box.add(body);
    const seam = new THREE.Mesh(new THREE.BoxGeometry(bw + .004, .01, .006), plain); seam.position.y = bh + .004; box.add(seam);
    const strawM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3 }), s1 = new THREE.Mesh(new THREE.CylinderGeometry(.003, .003, .06, 8), strawM); s1.position.set(.018, bh + .03, 0); box.add(s1);
    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(.003, .003, .03, 8), strawM); s2.position.set(.025, bh + .066, -.008); s2.rotation.x = -.9; box.add(s2);
    box.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const A = guy.A; A.reset(); A.root.updateMatrixWorld(true); const b = RB.partBoxes(A).armR, c = b.getCenter(new THREE.Vector3());
    box.position.set(c.x, b.min.y - .09, c.z + .03); A.root.add(box); A.root.updateMatrixWorld(true); A.bones.armR.attach(box); }

  // seat on the bench: avatar root at the seat, facing -z (face: F); standing spots
  // THINK (Xavier 2026-11-13): what does he feel at each beat, and how does a real person move?
  //  chilling (content) -> the finger points at his shoes (nervous, looks down, feet shuffle) -> the roast line (embarrassed)
  //  -> OOOH (embarrassed, flinch) -> laughter (embarrassed, blush, sweat) -> tries to answer (determined) -> nothing comes out
  //  (embarrassed) -> stands up the real way (lean forward, push off the knees, rise) -> points at the roaster, who has walked
  //  round to laugh in his face (so no turn is needed) -> BUFFERS (blank, never smiling) -> arm drops (embarrassed) ->
  //  step-turns away over a beat and walks off (sad).
  const SEAT = [BX, GY, BZ - .02], STANDUP = [BX, GY, BZ - .55], WALK_TO = [BX - 3.9, GY, BZ - .45];   // walks off to his right, through the gap
  const R_AT = [BX - .3, GY, BZ + .62];   // the roaster, behind the backrest, slightly to one side
  const R_FRONT = [BX - .08, GY, BZ - 1.55], R_WP1 = [BX - 1.2, GY, BZ + .55], R_WP2 = [BX - 1.2, GY, BZ - 1.05];   // walks round the bench end to the front
  const facing = (from, to) => Math.atan2(to[0] - from[0], to[2] - from[2]);
  const T_RISE = 12.95, T_UPR = 13.4;
  guy.keys = [
    { t: 0, pose: L.chill, expr: 'smile', at: SEAT, face: F },
    { t: .3, pose: L.sip, expr: 'happy', dur: .3 },
    { t: .95, pose: L.chill, expr: 'smile', dur: .3 },
    { t: 1.45, pose: L.shoesIn, expr: 'nervous', dur: .25 },              // the finger points down: he looks at his shoes
    { t: 1.8, pose: L.shoesOut, expr: 'nervous', dur: .18 }, { t: 2.1, pose: L.shoesIn, expr: 'nervous', dur: .18 }, { t: 2.4, pose: L.shoesOut, expr: 'nervous', dur: .18 },
    { t: 2.75, pose: L.frozen, expr: 'awkward', dur: .35 },
    { t: T_ROAST + .2, pose: L.frozen, expr: 'embarrassed', dur: .3 },    // the roast line lands
    { t: T_OOH + .05, pose: L.flinch, expr: 'cringe', dur: .15 },          // OOOH: he shrinks
    { t: T_OOH + .6, pose: L.frozen, expr: 'embarrassed', dur: .35 },
    { t: T_LAUGH + .2, pose: L.shrink, expr: 'embarrassed', dur: .4 },     // everyone laughs: shoulders up, head sinks
    { t: T_MOUTH - .1, pose: L.mouth, expr: 'confidentOpen', dur: .45, ease: 'io' },   // leans in, CONFIDENT, mouth opens to fire back...
    { t: T_NOTHING, pose: L.mouth, expr: 'surprised', dur: .12 },          // ...nothing comes out (bruh): mouth still hanging open
    { t: T_NOTHING + .45, pose: L.frozen, expr: 'embarrassed', dur: .4 },  // confidence drains: embarrassed
    { t: T_RISE, pose: L.rise, expr: 'determined', dur: .35, ease: 'io' }, // PRE: leans forward over his knees, hands push on them
    { t: T_UPR - .1, pose: L.riseMid, expr: 'determined', at: [BX, GY, BZ - .28], dur: .32, ease: 'io' },   // ACTION: hips lift off, legs swing down under him
    { t: T_UPR + .28, pose: 'stand', expr: 'determined', at: STANDUP, dur: .38, ease: 'io' },   // straightens up over his feet
    { t: 13.85, pose: L.pointPre, expr: 'determined', dur: .25 },         // PRE: the arm draws back
    { t: T_POINT, pose: L.point, expr: 'determined', dur: .18, style: 'snap' },          // ACTION: points at him
    { t: T_BUF, pose: L.lagA, expr: 'blank', dur: .01, steps: 2 },        // BUFFER: blank, stutter on twos
    { t: T_BUF + .12, pose: L.lagB, expr: 'blank', dur: .01 }, { t: T_BUF + .2, pose: L.lagA, expr: 'blank', dur: .01 }, { t: T_BUF + .36, pose: L.lagB, expr: 'blank', dur: .01 },
    { t: T_BUF + .44, pose: L.lagA, expr: 'blank', dur: .01 }, { t: T_BUF + .56, pose: L.point, expr: 'blank', dur: .01 },
    { t: 15.85, pose: L.giveUp, expr: 'embarrassed', dur: .35 },          // REACTION: the arm drops, head down
    { t: 16.0, pose: 'stand', expr: 'sad', face: F + F / 4, walk: true, dur: .35, ease: 'io' },   // step-turns away over ~.8 s, feet stepping
    { t: 16.35, pose: 'stand', expr: 'sad', face: F + F / 2 - .05, walk: true, dur: .4, ease: 'io' },
    { t: 16.75, pose: 'stand', expr: 'sad', face: facing(STANDUP, WALK_TO), at: WALK_TO, walk: true, dur: 3.2, ease: 'linear', cadence: .9 },   // walks off
  ];
  // roaster: hand on your shoulder + points down at the shoes, says the roast line to the crowd, then walks round the bench
  // end to stand in front of you and laugh in your face; arms crossed when you point at him; confused at the buffer; laughs
  roaster.keys = [
    { t: 0, pose: L.rPoint, expr: 'grin', at: R_AT, face: F },
    { t: 3.1, pose: L.rPoint, expr: 'smirk', dur: .3 },
    { t: T_ROAST - .1, pose: L.rRoast, expr: 'smirk', dur: .35 },
    { t: 6.75, pose: 'stand', expr: 'grin', at: R_WP1, face: facing(R_AT, R_WP1), walk: true, dur: .55, ease: 'linear' },
    { t: 7.3, pose: 'stand', expr: 'grin', at: R_WP2, face: facing(R_WP1, R_WP2), walk: true, dur: .6, ease: 'linear' },
    { t: 7.75, pose: 'stand', expr: 'grin', at: R_FRONT, face: facing(R_WP2, R_FRONT), walk: true, dur: .45, ease: 'io' },   // arrives in front
    { t: 8.3, pose: 'stand', expr: 'grin', face: 0, walk: true, dur: 1.0, ease: 'io' },  // step-turns round to face you over a full second
    { t: T_LAUGH + .05, pose: L.rLaugh, expr: 'laugh', dur: .3 },
    { t: T_RISE + .3, pose: L.rCross, expr: 'smirk', dur: .4 },                   // you stand up: arms crossed, "go on then"
    { t: T_POINT + .1, pose: L.rCross, expr: 'skeptical', dur: .2 },
    { t: T_BUF + .3, pose: L.rCross, expr: 'confused', dur: .3 },
    { t: 15.95, pose: L.rLaugh, expr: 'laugh', dur: .35 },
  ];
  roaster.talk = [{ s: T_ROAST, e: 5.2, w: 'bro' }, { s: 5.2, e: 5.6, w: 'your' }, { s: 5.6, e: 6.1, w: 'shoes' }, { s: 6.1, e: 6.5, w: 'say' }, { s: 6.5, e: 7.0, w: 'jadans' }];
  // the crowd: walk in from all round to an arc in front of the bench, leaving gaps for the lens (front), for the roaster's
  // path round the bench (his right end) and for your exit (world -x side), then react
  const ARC = [[-48, 2.5], [-128, 2.3], [-145, 2.6], [115, 2.4], [128, 2.2], [145, 2.5], [-24, 3.5], [30, 3.4], [44, 2.9], [-38, 3.0]];   // the last one is the girl
  const spot = ([a, r]) => [BX + Math.sin(a * F / 180) * r, GY, BZ - Math.cos(a * F / 180) * r];
  const GUY_HEAD = [BX, GY + 1.3, BZ];
  const reacts = [L.cOoh, L.cOoh2, L.cOoh, L.cOoh2, L.cOoh, L.cOoh2, L.cOoh, L.cOoh2, L.cOoh, L.cOoh2], laughs = [L.cLaugh, L.cLaughPt, L.cLaughHand, L.cLaugh, L.cLaughPt, L.cLaugh, L.cLaughHand, L.cLaughPt, L.cLaugh, L.cLaughHand];
  const all = [...crowd, girl];
  all.forEach((n, i) => {
    const s = spot(ARC[i]), f = facing(s, GUY_HEAD), far = [s[0] + Math.sin(f + F) * 2.6 + (i % 2 ? .8 : -.8), GY, s[2] + Math.cos(f + F) * 2.6], d = (i % 4) * .07;
    n.keys = [
      { t: 0, pose: 'stand', expr: 'surprised', at: far, face: f },
      { t: .25 + i * .12, pose: 'stand', expr: 'surprised', at: s, face: f, walk: true, dur: 1.4 + (i % 3) * .25, ease: 'linear' },
      { t: 2.2 + i * .12, pose: i % 2 ? L.cWatch2 : L.cWatch, expr: i % 3 ? 'smirk' : 'surprised', dur: .3 },
      { t: T_OOH - .05 + d, pose: reacts[i], expr: i % 2 ? 'shocked' : 'surprised', dur: .14, style: 'snap' },
      { t: T_OOH + .7 + d, pose: i % 2 ? L.cWatch2 : L.cWatch, expr: 'smirk', dur: .4 },
      { t: T_LAUGH - .05 + d, pose: laughs[i], expr: 'laugh', dur: .22 },
      { t: T_RISE + d, pose: i % 2 ? L.cWatch2 : L.cWatch, expr: 'surprised', dur: .4 },     // he's standing up: "ooh, here we go"
      { t: T_BUF + .35 + d, pose: i % 2 ? L.cWatch : L.cWatch2, expr: 'confused', dur: .3 },
      { t: 16.0 + d, pose: laughs[(i + 3) % 10], expr: 'laugh', dur: .3 },
    ];
  });

  // =====================================================================================================================
  // BRAIN HQ (x = 300): little you at the console, EMBARRASSMENT meter, the big red PANIC button, and the WORDS booth on
  // the left wall: a kiosk with a counter, shelves of comeback cards, a worker writing them, and a steel roller shutter.
  // =====================================================================================================================
  const { buildBrainRoom } = await import(new URL('kit/sets/brainroom.js', document.baseURI).href);
  const B = buildBrainRoom(scene, { at: [300, 0, 0], leverLabel: 'CHILL' }), O = [300, 0, 0], zF = -3.6 * .62 + .12, CZ = zF + .95;
  const R = (x, y, z) => [O[0] + x, O[1] + y, O[2] + z];
  // ---------- "you" in other clothes (Xavier 2026-11-13: everyone inside his brain is HIM, same face + hair, different
  // clothes and clearly different jobs / places). paints his own skin texture with a new outfit, keeps his face + hair ----------
  const castMe = async ({ shirt, sleeve = shirt, pants, collar = null, tie = null, badge = null, bare = false, boxers = '#23345a' }) => {
    const { actor } = await import(new URL('kit/actor.js', document.baseURI).href), FC = await import(new URL('kit/faces.js', document.baseURI).href);
    const A = await RB.loadMale(), Lay = await RB.layout(), img = new Image(); img.src = new URL('kit/assets/avatar_tex/male.png', document.baseURI).href; await img.decode();
    const S = img.width, k = S / Lay.size[0], c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const SKIN = '#e9b996';
    const paint = (part, fill) => { for (const f in Lay.parts[part]) { const [x, y, w, h] = Lay.parts[part][f].map(v => v * k); fill(x, y, w, h, f); } };
    for (const part of ['armL', 'armR']) paint(part, (x, y, w, h, f) => { g.fillStyle = SKIN; g.fillRect(x, y, w, h); if (!bare && f !== 'bottom') { g.fillStyle = sleeve; g.fillRect(x, y, w, f === 'top' ? h : h * .82); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, y + h * .78, w, h * .04); } });
    paint('torso', (x, y, w, h, f) => { g.fillStyle = bare ? SKIN : shirt; g.fillRect(x, y, w, h);
      if (bare) { if (f !== 'top') { g.fillStyle = boxers; g.fillRect(x, y + h * .86, w, h * .14); g.fillStyle = '#e8ecf2'; g.fillRect(x, y + h * .86, w, h * .025); } return; }
      if (f === 'front') { if (collar) { g.fillStyle = collar; g.beginPath(); g.moveTo(x + w * .3, y); g.lineTo(x + w * .5, y + h * .2); g.lineTo(x + w * .7, y); g.fill(); }
        if (tie) { g.fillStyle = tie; g.beginPath(); g.moveTo(x + w * .46, y + h * .08); g.lineTo(x + w * .54, y + h * .08); g.lineTo(x + w * .57, y + h * .6); g.lineTo(x + w * .5, y + h * .68); g.lineTo(x + w * .43, y + h * .6); g.fill(); }
        if (badge) { g.fillStyle = '#fff'; g.fillRect(x + w * .14, y + h * .22, w * .24, h * .12); g.fillStyle = badge; g.font = `800 ${Math.round(h * .08)}px Fredoka, Arial Black, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ME', x + w * .26, y + h * .28); }
        g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(x, y + h * .9, w, h * .1); } });
    for (const part of ['legL', 'legR']) paint(part, (x, y, w, h, f) => { if (bare) { g.fillStyle = SKIN; g.fillRect(x, y, w, h); if (f !== 'bottom') { g.fillStyle = boxers; g.fillRect(x, y, w, f === 'top' ? h : h * .34); } return; }
      g.fillStyle = pants; g.fillRect(x, y, w, h); if (f !== 'top' && f !== 'bottom') { g.fillStyle = '#2b2b30'; g.fillRect(x, y + h * .88, w, h * .12); } });
    await RB.skin(A, new THREE.CanvasTexture(c));
    RB.dress(A, {}, { getFace: FC.face, face: 'neutral', sex: 'm', skipBody: true });
    RB.details(A, [{ type: 'hair', mesh: await RB.loadSpikyHair(0x18130f), fit: 1.25, lift: .3 }]);
    const getFace = n => FC.face(n, 'm'); return actor(A, { seed: 3, getFace });
  };
  const op = await castMe({ shirt: '#2f4f86', pants: '#5c6470', collar: '#e9eef5', badge: '#2f4f86' });              // the operator at the console: navy work polo, ME badge
  const worker = await castMe({ shirt: '#f4f1e8', sleeve: '#c8932c', pants: '#6b4a2e', tie: '#7a1f2b' });           // the WORDS clerk: mustard cardigan sleeves, shirt + tie
  { // the cardigan front panels on the clerk (over the white shirt): two mustard boxes riding the torso
    const cm = new THREE.MeshStandardMaterial({ color: 0xc8932c, roughness: .9 }), A = worker.A; A.reset(); A.root.updateMatrixWorld(true); const tb = RB.partBoxes(A).torso, s = tb.getSize(new THREE.Vector3()), c = tb.getCenter(new THREE.Vector3());
    for (const sd of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(s.x * .3, s.y * .98, .012), cm); p.position.set(c.x + sd * s.x * .35, c.y, tb.max.z + .004); A.root.add(p); A.root.updateMatrixWorld(true); A.bones.torso.attach(p); } }
  // PANIC button (yellow/black hazard collar, chrome ring, glossy red dome, label plate)
  const BTN = new THREE.Vector3(300 + .66, .87, CZ + .2), btn = new THREE.Group(); btn.position.copy(BTN); btn.rotation.x = .32; scene.add(btn);
  { const hz = canvasTex(512, 64, (g, w, h) => { for (let i = -2; i < 34; i++) { g.fillStyle = i % 2 ? '#1b1b1b' : '#f6c21a'; g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16 + 16, 0); g.lineTo(i * 16 + 4, h); g.lineTo(i * 16 - 12, h); g.fill(); } }, [1, 1]);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(.13, .14, .04, 40), [new THREE.MeshStandardMaterial({ map: hz, roughness: .5 }), new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: .6 }), new THREE.MeshStandardMaterial({ color: 0x1b1b1b })]); collar.position.y = .02; btn.add(collar);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.098, .012, 12, 40), new THREE.MeshStandardMaterial({ color: 0xd8dde4, metalness: .9, roughness: .2 })); ring.rotation.x = F / 2; ring.position.y = .042; btn.add(ring);
    const plateT = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#e8ecf1'; g.beginPath(); g.roundRect(2, 2, w - 4, h - 4, 10); g.fill(); g.fillStyle = '#c0121f'; g.font = '800 40px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('PANIC', w / 2, h / 2 + 2); }, [1, 1]);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(.24, .06), new THREE.MeshBasicMaterial({ map: plateT, toneMapped: false })); plate.rotation.x = -F / 2; plate.position.set(0, .002, .19); btn.add(plate); }
  const domeM = new THREE.MeshPhysicalMaterial({ color: 0xe0161b, emissive: 0x7a0000, emissiveIntensity: .3, roughness: .15, clearcoat: 1 });
  const cap = new THREE.Group(); cap.position.y = .04; btn.add(cap);
  { const dome = new THREE.Mesh(new THREE.SphereGeometry(.09, 32, 16, 0, F * 2, 0, F / 2), domeM); dome.scale.y = .6; dome.castShadow = true; cap.add(dome); }
  // =====================================================================================================================
  // THE WORDS DEPARTMENT (x = 400): its own set (Xavier 2026-11-13: the booth was small, shabby and everything clipped).
  // A clerk's office with a service window onto a brain corridor. Inside: wood floor, cream walls, a wall of card
  // cabinets + shelves of comeback cards, a ceiling lamp, a red alarm beacon. The window: deep wood counter with a pass-
  // through ledge, a real steel roller shutter (housing drum box, C-channel guide rails, ribbed slats, bottom bar + pull
  // handle) mounted on the INSIDE, so the clerk pulls it down in front of himself. Outside: a pink corridor (little you).
  // Room: x 400 +- 2.2, z -1.6 .. 1.0 (front wall at z = 1.0); corridor z 1.0 .. 3.6.
  // =====================================================================================================================
  const WD = new THREE.Group(); WD.position.set(400, 0, 0); scene.add(WD);
  const WIN_W = 1.6, SH_BOT = 1.0, SH_TOP = 1.98, FZ = 1.0;   // window opening + front wall plane
  { const cream = new THREE.MeshStandardMaterial({ color: 0xf1e7d2, roughness: .85 }), woodF = new THREE.MeshStandardMaterial({ color: 0xa8774a, roughness: .6 }), wood = new THREE.MeshStandardMaterial({ color: 0x8b5e3a, roughness: .55 });
    const pinkW = new THREE.MeshStandardMaterial({ color: 0xe9a3b4, roughness: .7 }), pinkF = new THREE.MeshStandardMaterial({ color: 0xc97890, roughness: .6 });
    const steel = new THREE.MeshStandardMaterial({ color: 0xa9b1ba, metalness: .75, roughness: .32 }), dark = new THREE.MeshStandardMaterial({ color: 0x3c4148, metalness: .6, roughness: .4 });
    const bx = (w, h, d, m, x, y, z, par = WD) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; par.add(o); return o; };
    // wood plank floor texture
    const plankT = canvasTex(512, 512, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#a8774a', '#9c6d43', '#b07f51', '#a37248'][i % 4]; g.fillRect(0, i * 64, w, 64); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, i * 64, w, 2); g.fillRect(((i * 197) % 400) + 40, i * 64, 2, 64); } }, [1, 1]);
    plankT.wrapS = plankT.wrapT = THREE.RepeatWrapping; plankT.repeat.set(2, 1.5);
    bx(4.4, .05, 2.6, new THREE.MeshStandardMaterial({ map: plankT, roughness: .55 }), 0, -.025, -.3);   // office floor
    bx(4.4, .05, 2.6, pinkF, 0, -.025, 2.3);                                                          // corridor floor
    bx(4.4, .05, 5.4, new THREE.MeshStandardMaterial({ color: 0xf6f2ea, roughness: .9 }), 0, 2.85, .9);   // ceilings
    bx(4.4, 2.9, .1, cream, 0, 1.45, -1.65);                                                           // back wall
    for (const s of [-1, 1]) { bx(.1, 2.9, 2.6, cream, s * 2.2, 1.45, -.3); bx(.1, 2.9, 2.6, pinkW, s * 2.2, 1.45, 2.3); }
    bx(4.4, 2.9, .1, pinkW, 0, 1.45, 3.6);                                                             // corridor far wall
    // front wall with the window opening (inside face cream, outside face pink)
    const wallPiece = (w, h, x, y) => { bx(w, h, .14, cream, x, y, FZ - .07); bx(w, h, .02, pinkW, x, y, FZ + .01); };
    wallPiece((4.4 - WIN_W) / 2, 2.9, -(WIN_W / 2 + (4.4 - WIN_W) / 4), 1.45); wallPiece((4.4 - WIN_W) / 2, 2.9, (WIN_W / 2 + (4.4 - WIN_W) / 4), 1.45);
    wallPiece(WIN_W, SH_BOT, 0, SH_BOT / 2); wallPiece(WIN_W, 2.9 - SH_TOP - .12, 0, (2.9 + SH_TOP + .12) / 2);
    // counter inside + pass-through ledge outside, wood with a dark edge band
    bx(WIN_W + .5, .06, .62, wood, 0, SH_BOT + .03, FZ - .31); bx(WIN_W + .5, SH_BOT, .5, new THREE.MeshStandardMaterial({ color: 0x6e4a2e, roughness: .6 }), 0, SH_BOT / 2, FZ - .39);
    bx(WIN_W, .05, .26, wood, 0, SH_BOT + .025, FZ + .13);
    // the clerk's stool + a card tray, pen, a stack of blank cards on the counter
    const stool = new THREE.Group(); stool.position.set(-.05, 0, -.05); WD.add(stool); bx(.42, .05, .42, new THREE.MeshStandardMaterial({ color: 0x2f3b4c, roughness: .5 }), 0, .74, 0, stool); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bx(.04, .72, .04, dark, a * .16, .36, b * .16, stool);
    bx(.3, .04, .2, new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: .6 }), .5, SH_BOT + .08, FZ - .35); for (let i = 0; i < 6; i++) bx(.14, .004, .1, new THREE.MeshStandardMaterial({ color: 0xfffbe8 }), -.55 + (i % 2) * .005, SH_BOT + .065 + i * .005, FZ - .32);
    // back wall: card cabinets (many small drawers with brass pulls + labels) and open shelves of cards
    const lab = ['LOL', 'NO U', 'SAYS WHO', 'OK AND', 'RATIO', 'COPE', 'SKILL ISSUE', 'BRUH'];
    for (let cx = -1; cx <= 1; cx += 2) { const cab = new THREE.Group(); cab.position.set(cx * 1.3, 0, -1.4); WD.add(cab); bx(1.2, 1.5, .4, wood, 0, .75, 0, cab);
      for (let r = 0; r < 5; r++) for (let q = 0; q < 4; q++) { const dr = bx(.27, .26, .02, new THREE.MeshStandardMaterial({ color: 0x9a6a40, roughness: .5 }), -.44 + q * .29, .2 + r * .28, .205, cab); bx(.06, .02, .02, new THREE.MeshStandardMaterial({ color: 0xd4a84a, metalness: .8, roughness: .3 }), -.44 + q * .29, .14 + r * .28, .22, cab); } }
    for (let r = 0; r < 3; r++) { bx(1.2, .03, .3, wood, 0, 1.0 + r * .5, -1.45); for (let i = 0; i < 9; i++) { const cd = bx(.1, .2, .015, new THREE.MeshStandardMaterial({ color: [0xffffff, 0xffe08a, 0xbfe3ff, 0xffc2d1][(i + r) % 4], roughness: .7 }), -.48 + i * .12, 1.12 + r * .5, -1.42); cd.rotation.z = (i % 3 - 1) * .1; } }
    // the sign over the window, both sides, measured text
    const signT = canvasTex(1024, 192, (g, w, h) => { g.fillStyle = '#f2d24b'; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 26); g.fill(); g.strokeStyle = '#1d2a44'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#1d2a44'; let fs = 120; g.font = `800 ${fs}px Fredoka, Arial Black, sans-serif`;
      while (g.measureText('WORDS DEPARTMENT').width > w * .86) { fs -= 4; g.font = `800 ${fs}px Fredoka, Arial Black, sans-serif`; } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WORDS DEPARTMENT', w / 2, h / 2 + 6); }, [1, 1]);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .36), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false })); sign.position.set(0, 2.42, FZ + .03); WD.add(sign);
    // the roller shutter hardware (inside face): housing box with end caps, two C-channel guide rails
    bx(WIN_W + .16, .26, .26, steel, 0, SH_TOP + .13, FZ - .2); for (const s of [-1, 1]) bx(.02, .28, .28, dark, s * (WIN_W / 2 + .08), SH_TOP + .13, FZ - .2);
    for (const s of [-1, 1]) { const rx = s * (WIN_W / 2 + .03); bx(.06, SH_TOP - SH_BOT, .015, steel, rx, (SH_TOP + SH_BOT) / 2, FZ - .155); bx(.06, SH_TOP - SH_BOT, .015, steel, rx, (SH_TOP + SH_BOT) / 2, FZ - .1); bx(.015, SH_TOP - SH_BOT, .07, steel, rx + s * .03, (SH_TOP + SH_BOT) / 2, FZ - .128); }
    // lights: warm ceiling lamp in the office, soft pink fill in the corridor; red beacon on the back wall
    const lampM = new THREE.Mesh(new THREE.CylinderGeometry(.25, .3, .12, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0d0, emissiveIntensity: 1.4 })); lampM.position.set(0, 2.78, -.4); WD.add(lampM);
    const lamp = new THREE.PointLight(0xfff0d8, 9, 6, 1.4); lamp.position.set(0, 2.6, -.4); WD.add(lamp); const cor = new THREE.PointLight(0xffd9e3, 7, 6, 1.4); cor.position.set(0, 2.5, 2.4); WD.add(cor); }
  const beaconM = new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff0000, emissiveIntensity: 0, transparent: true, opacity: .9 });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(.12, 20, 12, 0, F * 2, 0, F / 2), beaconM); beacon.position.set(0, 2.2, -1.58); beacon.rotation.x = F / 2; WD.add(beacon);
  const beaconL = new THREE.PointLight(0xff2020, 0, 6, 1.2); beaconL.position.set(0, 2.1, -1.3); WD.add(beaconL);
  // slats: 15 ribbed steel slats + a bottom bar with a pull handle; extension k (0 open .. 1 shut) shows the lowest slats
  const slatT = canvasTex(64, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e1e6eb'); gr.addColorStop(.35, '#b8c0c8'); gr.addColorStop(.7, '#8d969f'); gr.addColorStop(1, '#6c757e'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, [1, 1]);
  const slatM = new THREE.MeshStandardMaterial({ map: slatT, metalness: .6, roughness: .35 }), SL_H = .07, N_SL = Math.ceil((SH_TOP - SH_BOT) / SL_H) + 1;
  const slats = Array.from({ length: N_SL }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(WIN_W + .02, SL_H - .004, .022), slatM); m.castShadow = true; WD.add(m); return m; });
  const barG = new THREE.Group(); WD.add(barG);
  { const b = new THREE.Mesh(new THREE.BoxGeometry(WIN_W + .03, .05, .04), new THREE.MeshStandardMaterial({ color: 0x4a5058, metalness: .7, roughness: .35 })); barG.add(b);
    const h = new THREE.Mesh(new THREE.BoxGeometry(.16, .02, .03), new THREE.MeshStandardMaterial({ color: 0x222428, metalness: .5, roughness: .4 })); h.position.set(0, -.005, -.04); barG.add(h);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.02, .04, .03), h.material); p.position.set(s * .07, .01, -.03); barG.add(p); } }
  const SHUT_Z = FZ - .128;
  const shutterAt = k => { const bottom = SH_TOP - (SH_TOP - SH_BOT) * k; barG.position.set(0, bottom + .025, SHUT_Z); barG.visible = true;
    slats.forEach((s, i) => { const y = bottom + .05 + i * SL_H + SL_H / 2; s.visible = y < SH_TOP; s.position.set(0, y, SHUT_Z); }); };
  // the glowing comeback card
  const card = new THREE.Group(); scene.add(card);
  { const ct = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#fffbe8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2a2a'; g.lineWidth = 6; g.lineCap = 'round';
      for (let i = 0; i < 4; i++) { g.beginPath(); let x = 24; g.moveTo(x, 36 + i * 30); while (x < w - 30 - (i === 3 ? 80 : 0)) { x += 14; g.lineTo(x, 36 + i * 30 + (x % 28 ? -5 : 5)); } g.stroke(); } }, [1, 1]);
    const cm = new THREE.Mesh(new THREE.PlaneGeometry(.22, .14), new THREE.MeshStandardMaterial({ map: ct, emissive: 0xffe38a, emissiveIntensity: .9, side: THREE.DoubleSide })); card.add(cm);
    const glowT = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(255,230,140,.9)'); gr.addColorStop(1, 'rgba(255,230,140,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, [1, 1]);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false })); glow.scale.set(.6, .6, 1); card.add(glow); card.userData.glow = glow; }
  const handPos = (A, part) => { const b = A.bones[part]; const tip = b.children.find(c => c.isBone) || b; return tip.getWorldPosition(new THREE.Vector3()); };

  // little you: watches the meter climb, cringes, winds up, SLAMS PANIC; runs to the booth and bangs on the shutter;
  // later (27.6) the shutter rolls up and the worker hands over the glowing comeback
  const T_SLAM = 20.27, T_SHUT = 21.76, T_UP = 27.75, T_GRAB = 28.34;
  const STOOL_AT = R(0, .03, zF + 1.75), STAND_BTN = R(.3, 0, CZ + .8), AT_WIN = [400, 0, 1.5];   // AT_WIN: little you in the corridor, at the window
  op.keys = [
    { t: 0, pose: L.hqWatch, expr: 'nervous', at: STOOL_AT, face: F },
    { t: 17.95, pose: L.hqCringe, expr: 'embarrassed', dur: .3 },            // the meter climbs: FACEPALM (hand flat over his eyes)
    { t: 18.9, pose: L.hqWatch, expr: 'scream', dur: .25 },                  // 100%
    { t: 19.55, pose: L.windUp, expr: 'determined', at: STAND_BTN, face: F, dur: .5 },     // PRE: up off the stool, winds up
    { t: T_SLAM, pose: L.slam, expr: 'furious', style: 'snap', dur: .1 },                  // ACTION
    { t: T_SLAM + .45, pose: L.slamHold, expr: 'scream', dur: .3 },                        // REACTION
    { t: 22.2, pose: 'stand', expr: 'frustrated', at: AT_WIN, face: F, dur: .01 },          // (off screen: ran down the corridor)
    { t: 22.35, pose: L.bangUp, expr: 'frustrated', dur: .18 }, { t: 22.6, pose: L.bangHit, expr: 'furious', dur: .07, style: 'snap' },
    { t: 22.85, pose: L.bangUp, expr: 'frustrated', dur: .18 }, { t: 23.1, pose: L.bangHit, expr: 'furious', dur: .07, style: 'snap' },
    { t: 23.35, pose: L.bangUp, expr: 'frustrated', dur: .18 }, { t: 23.6, pose: L.bangHit, expr: 'furious', dur: .07, style: 'snap' },
    { t: 23.95, pose: L.slump, expr: 'sad', dur: .35 },                       // gives up: forearm on the ledge, head down on it
    { t: T_UP + .12, pose: L.stepBack, expr: 'surprised', at: [400, 0, 1.68], dur: .3 },   // it moves: he straightens, steps back
    { t: T_GRAB - .3, pose: L.hqReach, expr: 'surprised', at: [400, 0, 1.55], dur: .3 },   // reaches over the ledge for the card
    { t: T_GRAB + .15, pose: L.hqRead2, expr: 'starstruck', dur: .35 },      // reads it: THE comeback
  ];
  const W_SEAT = [400 - .05, .15, -.05], W_UP = [400 - .05, 0, .1], W_FWD = [400 - .05, 0, .42];   // W_UP far enough back that his head stays behind the shutter
  const T_WAKE = 20.62, T_LOOK = 20.85, T_REACH = 21.12, T_BAR = 21.4, T_PUSH0 = 27.35;
  worker.keys = [
    { t: 0, pose: L.wSleep, expr: 'sleepy', at: W_SEAT, face: 0 },           // asleep on his arms at the counter
    { t: T_WAKE, pose: L.wJolt, expr: 'shocked', dur: .12, style: 'snap' },    // the alarm: jolts upright on the stool
    { t: T_LOOK, pose: L.wLookUp, expr: 'nervous', dur: .25 },                 // whips round to the red beacon behind him
    { t: T_REACH, pose: L.wReachBar, expr: 'determined', at: W_UP, dur: .25 },  // stands, reaches up: hand stops ON the bar
    { t: T_BAR + .02, pose: L.wPullDown, expr: 'determined', dur: .34, ease: 'in' },   // pulls it down (the shutter follows the hand)
    { t: 24.5, pose: L.wPullDown, expr: 'determined', dur: .01 },
    { t: T_PUSH0, pose: L.wPullDown, expr: 'happy', dur: .01 },               // that night: hand on the bar...
    { t: T_UP - .05, pose: L.wReachBar, expr: 'happy', dur: .42, ease: 'io' },  // ...pushes it back up
    { t: T_GRAB - .5, pose: L.wGive, expr: 'happy', at: W_FWD, dur: .32 },     // steps in, holds the comeback out over the ledge
    { t: T_GRAB + .35, pose: 'stand', expr: 'happy', dur: .35 },
  ];
  const screen = (g, w, h, t) => {
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const lv = ss(t, 17.2, 18.9), full = t >= 18.9 && t < 24.4, calm = t >= 24.4;
    if (calm) { g.fillStyle = '#0c2a22'; g.fillRect(0, 0, w, h); g.fillStyle = '#4dff9a'; g.font = '800 46px Fredoka, Arial Black, sans-serif'; g.fillText('EMBARRASSMENT', w / 2, 70); g.font = '800 90px Fredoka, Arial Black, sans-serif'; g.fillText('2%', w / 2, 200); g.font = '700 40px Fredoka, Arial, sans-serif'; g.fillText('calm. finally.', w / 2, 310); return; }
    const fl = full && Math.floor(t * 6) % 2; g.fillStyle = full ? (fl ? '#7a0a12' : '#c0121f') : '#1a1030'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.font = '800 46px Fredoka, Arial Black, sans-serif'; g.fillText('EMBARRASSMENT', w / 2, 60);
    g.fillStyle = '#2b2346'; g.fillRect(60, 120, w - 120, 80); const pct = full ? 1 : .35 + .65 * lv; g.fillStyle = pct > .8 ? '#ff4d5a' : pct > .55 ? '#ffd14f' : '#4dff9a'; g.fillRect(64, 124, (w - 128) * pct, 72);
    g.fillStyle = '#fff'; g.font = '800 80px Fredoka, Arial Black, sans-serif'; g.fillText(Math.round(pct * 100) + '%', w / 2, 290);
    if (full) { g.font = '800 40px Fredoka, Arial Black, sans-serif'; g.fillText('!! PRESS PANIC !!', w / 2, 345); }
  };

  // =====================================================================================================================
  // THE BATHROOM AT NIGHT (x = 600): white subway tile round the tub, pale grey-blue painted walls, small hex floor tiles,
  // a white tub with a chrome shower head and a patterned curtain on a rod, a white panel door, a frosted window with the
  // night outside, sink + mirror, towel. Warm ceiling light, steam. (research/materials_real_world.md: US bathrooms)
  // =====================================================================================================================
  const BA = new THREE.Group(); BA.position.set(600, 0, 0); scene.add(BA);
  const RW = 3.2, RD = 3.0, RH = 2.9;
  const tileT = (cols, rows, base, grout, brick) => canvasTex(512, 512, (g, w, h) => { g.fillStyle = grout; g.fillRect(0, 0, w, h); const tw = w / cols, th = h / rows;
    for (let r = 0; r < rows; r++) for (let c = -1; c < cols + 1; c++) { const x = c * tw + (brick && r % 2 ? tw / 2 : 0); const gr = g.createLinearGradient(0, r * th, 0, r * th + th); gr.addColorStop(0, base); gr.addColorStop(1, '#e9ecee'); g.fillStyle = gr; g.beginPath(); g.roundRect(x + 3, r * th + 3, tw - 6, th - 6, 4); g.fill(); } }, [1, 1]);
  const subway = new THREE.MeshPhysicalMaterial({ map: tileT(4, 8, '#ffffff', '#c9ced3', true), roughness: .12, clearcoat: .8 });
  subway.map.wrapS = subway.map.wrapT = THREE.RepeatWrapping; subway.map.repeat.set(3, 4);
  const hexT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#b9bec4'; g.fillRect(0, 0, w, h); const r = 22, dx = r * 1.732;
    for (let y = -1; y < 14; y++) for (let x = -1; x < 10; x++) { const cx = x * dx + (y % 2 ? dx / 2 : 0), cy = y * r * 1.5; g.fillStyle = (x * 7 + y * 3) % 11 === 0 ? '#9aa1a8' : '#f1f2f0'; g.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * F * 2 + F / 6; g.lineTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2)); } g.fill(); } }, [1, 1]);
  hexT.wrapS = hexT.wrapT = THREE.RepeatWrapping; hexT.repeat.set(4, 4);
  const paintW = new THREE.MeshStandardMaterial({ color: 0xc9d6dc, roughness: .8 }), whiteM = new THREE.MeshPhysicalMaterial({ color: 0xfbfbf8, roughness: .15, clearcoat: 1 }), chrome = new THREE.MeshStandardMaterial({ color: 0xe6eaee, metalness: 1, roughness: .12 });
  const pl = (w, h, m, x, y, z, ry = 0, rx = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.set(rx, ry, 0); o.receiveShadow = true; BA.add(o); return o; };
  const bxB = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; BA.add(o); return o; };
  pl(RW, RD, new THREE.MeshStandardMaterial({ map: hexT, roughness: .35 }), 0, 0, 0, 0, -F / 2);                       // floor
  pl(RW, RD, new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: .9 }), 0, RH, 0, 0, F / 2);                  // ceiling
  pl(RW, RH, paintW, 0, RH / 2, -RD / 2); pl(RW, RH, paintW, 0, RH / 2, RD / 2, F);                                  // back / front walls
  pl(RD, RH, paintW, -RW / 2, RH / 2, 0, F / 2); pl(RD, RH, paintW, RW / 2, RH / 2, 0, -F / 2);                      // side walls
  // tub along the back wall + subway tile surround up to the ceiling
  // WALK-IN SHOWER (Xavier 2026-11-13: the tub was too small, he clipped into the wall): a tiled corner stall 2.1 x 1.3,
  // white subway tile on the back + end wall up to the ceiling, a low white tray, a frosted glass panel in front (his
  // silhouette reads through it), chrome rain head + mixer. He stands .62 m off the back wall so a hand on the tiles
  // TOUCHES them, and there is room on the open end for the lens.
  const TUB = { x: -.53, z: -RD / 2 + .42, w: 2.1, d: 1.3, h: .06 };
  const SD = 1.3, SFZ = -RD / 2 + SD;   // stall depth, front z
  pl(TUB.w + .1, RH, subway, TUB.x, RH / 2, -RD / 2 + .005);
  { const sm = subway.clone(); sm.map = subway.map.clone(); sm.map.repeat.set(1.8, 4); sm.map.needsUpdate = true; pl(SD + .02, RH, sm, TUB.x - TUB.w / 2 + .005, RH / 2, -RD / 2 + SD / 2, F / 2); }
  bxB(TUB.w, .06, SD, whiteM, TUB.x, .03, -RD / 2 + SD / 2);                                                   // tray
  { const drain = new THREE.Mesh(new THREE.CircleGeometry(.05, 16), chrome); drain.rotation.x = -F / 2; drain.position.set(TUB.x + .2, .062, -RD / 2 + SD / 2); BA.add(drain); }
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xeef4f6, roughness: .55, transmission: 0, transparent: true, opacity: .62, side: THREE.DoubleSide });
  const glass = new THREE.Mesh(new THREE.BoxGeometry(TUB.w * .62, 1.95, .012), glassM); glass.position.set(TUB.x - TUB.w * .19, .06 + .975, SFZ); BA.add(glass);
  bxB(TUB.w * .62 + .02, .03, .03, chrome, TUB.x - TUB.w * .19, 2.03, SFZ); bxB(.03, 1.97, .03, chrome, TUB.x - TUB.w / 2 + TUB.w * .62, 1.04, SFZ);   // glass frame + post
  { const arm = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .28, 12), chrome); arm.rotation.x = F / 2 - .4; arm.position.set(TUB.x + .55, 2.15, -RD / 2 + .13); BA.add(arm);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(.12, .08, .05, 24), chrome); head.position.set(TUB.x + .55, 2.08, -RD / 2 + .28); head.rotation.x = .3; BA.add(head);
    const mix = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .03, 24), chrome); mix.rotation.x = F / 2; mix.position.set(TUB.x + .85, 1.15, -RD / 2 + .015); BA.add(mix); }
  // door (right wall, near the front): white panel door on its hinge, chrome knob
  const door = new THREE.Group(); door.position.set(RW / 2 - .02, 0, .55); BA.add(door);
  { const leaf = new THREE.Mesh(new THREE.BoxGeometry(.04, 2.05, .86), new THREE.MeshStandardMaterial({ color: 0xf7f7f4, roughness: .45 })); leaf.position.set(0, 1.025, .43); leaf.castShadow = true; door.add(leaf);
    for (const y of [.55, 1.45]) { const pn = new THREE.Mesh(new THREE.BoxGeometry(.01, .7, .62), new THREE.MeshStandardMaterial({ color: 0xebebe7, roughness: .5 })); pn.position.set(-.025, y, .43); door.add(pn); }
    const knob = new THREE.Mesh(new THREE.SphereGeometry(.035, 16, 12), chrome); knob.position.set(-.06, 1.0, .78); door.add(knob);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(.06, 2.12, .98), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .5 })); frame.position.set(RW / 2 + .005, 1.06, .98); BA.add(frame); }
  // frosted window on the left wall: night outside (deep blue, a moon)
  { const nightT = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1633'); gr.addColorStop(1, '#1d2f5c'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#fff6d8'; g.beginPath(); g.arc(w * .66, h * .32, 30, 0, 7); g.fill(); g.fillStyle = '#0b1633'; g.beginPath(); g.arc(w * .66 + 14, h * .32 - 8, 26, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 25; i++) g.fillRect((i * 97) % w, (i * 53) % (h * .7), 2, 2); }, [1, 1]);
    pl(.72, .82, new THREE.MeshBasicMaterial({ map: nightT, toneMapped: false }), -RW / 2 + .01, 1.75, .35, F / 2);
    for (const [w, h, y, z] of [[.84, .06, 2.19, .35], [.84, .06, 1.31, .35], [.06, .9, 1.75, -.05], [.06, .9, 1.75, .75], [.84, .03, 1.75, .35]]) bxB(.05, h, w > .5 ? w : .06, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .5 }), -RW / 2 + .03, y, z);
    const moon = new THREE.PointLight(0x9db8ff, 1.2, 4, 1.5); moon.position.set(-RW / 2 + .4, 1.8, .35); BA.add(moon); }
  // sink + mirror on the front-left, towel on a bar by the door
  { const vanity = bxB(.9, .82, .5, new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: .5 }), -.6, .41, RD / 2 - .26); const top = bxB(.94, .04, .54, whiteM, -.6, .84, RD / 2 - .26);
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(.18, .14, .08, 24), whiteM); basin.position.set(-.6, .9, RD / 2 - .28); BA.add(basin);
    const mir = pl(.7, .8, new THREE.MeshStandardMaterial({ color: 0xbfd0d8, metalness: .9, roughness: .05 }), -.6, 1.55, RD / 2 - .01, F);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, .6, 8), chrome); bar.rotation.z = F / 2; bar.position.set(.6, 1.25, RD / 2 - .05); BA.add(bar);
    const towel = bxB(.5, .6, .03, new THREE.MeshStandardMaterial({ color: 0xe8a87c, roughness: .95 }), .6, .98, RD / 2 - .06); }
  // light: warm ceiling fixture + a warm light inside the shower behind the curtain (so he reads as a silhouette)
  const bathLight = new THREE.PointLight(0xffe7c4, 0, 7, 1.3); bathLight.position.set(.2, RH - .25, .3); BA.add(bathLight);
  const faceFill = new THREE.PointLight(0xfff0dc, 0, 3, 1.4); faceFill.position.set(TUB.x - .6, 1.85, TUB.z - .1); BA.add(faceFill);   // soft key on his face from the tub end (the lens side)
  const showerLight = new THREE.PointLight(0xffdcb0, 0, 3, 1.6); showerLight.position.set(TUB.x + .1, 1.95, TUB.z - .35); BA.add(showerLight);
  { const fx = new THREE.Mesh(new THREE.CylinderGeometry(.22, .25, .06, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0d0, emissiveIntensity: 1.2 })); fx.position.set(.2, RH - .03, .3); BA.add(fx); }
  // steam: soft sprites drifting up out of the shower and across the ceiling (pure function of t)
  const steamT = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, [1, 1]);
  const steam = Array.from({ length: 26 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamT, transparent: true, depthWrite: false, opacity: .5 })); BA.add(s); return s; });
  const steamAt = t => steam.forEach((s, i) => { const ph = ((t * .12 + i / steam.length) % 1), x = TUB.x - .9 + (i * .37 % 1.8), z = TUB.z + .1 + (i * .23 % .5) + ph * .9; s.position.set(x + Math.sin(t * .5 + i) * .1, 1.2 + ph * 1.6, z); s.scale.setScalar(.5 + ph * 1.1); s.material.opacity = .38 * Math.sin(ph * F); });
  // you in the tub (standing on the tub floor), facing the room; turns to the tile wall at his left end to yell at it
  // ---------- you in the shower: SHIRTLESS + no jeans (Xavier 2026-11-13): your own skin tone, navy boxers, same face +
  // hair. A separate rig (the main stays exactly as built). Stands deep in the tub so nothing clips the curtain. ----------
  const sg = await (async () => {
    const { actor } = await import(new URL('kit/actor.js', document.baseURI).href), FC = await import(new URL('kit/faces.js', document.baseURI).href);
    const A = await RB.loadMale(), Lay = await RB.layout(), img = new Image(); img.src = new URL('kit/assets/avatar_tex/male.png', document.baseURI).href; await img.decode();
    const S = img.width, k = S / Lay.size[0], c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const SKIN = '#e9b996', SH = '#d9a681';
    const paint = (part, fill) => { for (const f in Lay.parts[part]) { const [x, y, w, h] = Lay.parts[part][f].map(v => v * k); fill(x, y, w, h, f); } };
    for (const part of ['armL', 'armR']) paint(part, (x, y, w, h) => { g.fillStyle = SKIN; g.fillRect(x, y, w, h); });
    paint('torso', (x, y, w, h, f) => { g.fillStyle = SKIN; g.fillRect(x, y, w, h); if (f === 'front') { g.fillStyle = SH; g.globalAlpha = .35; g.fillRect(x + w * .49, y + h * .15, w * .02, h * .6); g.globalAlpha = 1; }
      if (f !== 'top') { g.fillStyle = '#23345a'; g.fillRect(x, y + h * .86, w, h * .14); g.fillStyle = '#e8ecf2'; g.fillRect(x, y + h * .86, w, h * .025); } });
    for (const part of ['legL', 'legR']) paint(part, (x, y, w, h, f) => { g.fillStyle = SKIN; g.fillRect(x, y, w, h); if (f !== 'bottom') { g.fillStyle = '#23345a'; g.fillRect(x, y, w, f === 'top' ? h : h * .34);
      if (f !== 'top') { g.strokeStyle = 'rgba(232,236,242,.5)'; g.lineWidth = w * .03; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + w * i / 4, y); g.lineTo(x + w * i / 4, y + h * .34); g.stroke(); } } } });
    const tex = new THREE.CanvasTexture(c); await RB.skin(A, tex);
    RB.dress(A, {}, { getFace: FC.face, face: 'neutral', sex: 'm', skipBody: true });
    RB.details(A, [{ type: 'hair', mesh: await RB.loadSpikyHair(0x18130f), fit: 1.25, lift: .3 }]);
    const getFace = n => FC.face(n, 'm'); return actor(A, { seed: 3, getFace });
  })();
  // THINK: he's replaying it in his head, sad, hand on the wall, head down, shaking his head; hand to his face. (dive in: the
  // comeback arrives.) Back out: PRE the hand comes off his face, ACTION screams it at the wall, REACTION both hands over
  // his mouth (too loud!); the BANG makes him flinch; his eyes slide to the door.
  const IN_TUB = [600 + TUB.x + .4, .06, -RD / 2 + .62], T_BANG = 33.3, T_OUT = 29.58, SG_TURN = 0;
  sg.keys = [
    { t: 0, pose: L.wallLean, expr: 'sad', at: IN_TUB, face: F + SG_TURN },
    { t: 25.95, pose: L.wallShakeL, expr: 'sad', dur: .25, ease: 'io' }, { t: 26.2, pose: L.wallShakeR, expr: 'sad', dur: .25, ease: 'io' }, { t: 26.45, pose: L.wallShakeL, expr: 'sad', dur: .22, ease: 'io' },
    { t: 26.65, pose: L.facepalm, expr: 'sad', dur: .3 },
    { t: T_OUT + .1, pose: L.itHits, expr: 'surprised', dur: .3 },                // PRE: the hand comes off his face
    { t: 30.3, pose: L.itHits, expr: 'determined', dur: .2 },
    { t: 30.62, pose: L.wallScream, expr: 'scream', dur: .18, style: 'snap' },    // ACTION: screams it at the wall
    { t: 32.0, pose: L.handsMouth, expr: 'shocked', dur: .14, style: 'snap' },    // REACTION: hands over his mouth
    { t: T_BANG + .02, pose: L.handsMouth, expr: 'shocked', dur: .1, style: 'snap' },
    { t: 34.35, pose: L.handsMouthL, expr: 'sideeyeR', dur: .5, ease: 'io' },    // eyes + head slide to the door
  ];

  // ---------- spinner over his head for the buffer (a Roblox-style loading ring) ----------
  const spinCv = document.createElement('canvas'); spinCv.width = spinCv.height = 256; const spinTex = new THREE.CanvasTexture(spinCv); spinTex.colorSpace = THREE.SRGBColorSpace;
  const spinner = new THREE.Sprite(new THREE.SpriteMaterial({ map: spinTex, depthTest: false, transparent: true })); spinner.scale.set(.32, .32, 1); spinner.renderOrder = 10; scene.add(spinner);
  const drawSpin = t => { const g = spinCv.getContext('2d'); g.clearRect(0, 0, 256, 256); const k = Math.floor(t * 12) % 8;
    for (let i = 0; i < 8; i++) { const a = i / 8 * F * 2, a2 = ((i - k + 8) % 8) / 8; g.fillStyle = `rgba(255,255,255,${.25 + .75 * (1 - a2)})`; g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 6; g.beginPath(); g.arc(128 + Math.cos(a) * 80, 128 + Math.sin(a) * 80, 22, 0, 7); g.fill(); g.stroke(); }
    spinTex.needsUpdate = true; };

  // ---------- camera ----------
  const V = (x, y, z) => [BX + x, GY + y, BZ + z];   // bench-relative (you face -z)
  const camera = [
    // LONG LENS, high over the heads, room around the subject (Xavier 2026-11-12). Every cut frames its point.
    // S1 hook: you sipping on the bench, the roaster leaning in behind (hand on your shoulder, pointing down), kids walking in
    { t: 0, p: V(1.25, 1.95, -4.3), l: V(0, 1.15, .15), fov: 31 },
    { t: 1.35, p: V(1.1, 1.9, -4.0), l: V(0, 1.12, .12), fov: 28 },
    // S2 down the finger to the shoes (JADANS on the side), they wiggle
    { t: 1.4, p: V(1.05, .95, -2.75), l: V(0, .13, -.45), fov: 22, cut: true },
    { t: 2.75, p: V(.95, .88, -2.55), l: V(0, .12, -.45), fov: 21 },
    // S3 crane up from the shoes to the roaster's grin, kids behind already covering their mouths
    { t: 2.8, p: V(-.7, .6, -3.0), l: V(0, .25, -.4), fov: 26, cut: true },
    { t: 4.6, p: V(-1.35, 2.05, -3.7), l: V(.1, 1.45, .5), fov: 30, ease: 'io' },
    // S4 the roast line: the roaster talking to the crowd, you frozen in front of him; OOOH (high over the heads)
    { t: 4.65, p: V(-2.9, 3.3, -3.4), l: V(-.15, 1.25, .3), fov: 31, cut: true },
    { t: 6.6, p: V(-2.7, 3.2, -3.1), l: V(-.15, 1.25, .3), fov: 29 },
    // S5 drone pull-back: the whole courtyard turns to look
    { t: 6.65, p: V(1.4, 2.9, -4.0), l: V(0, 1.0, 0), fov: 40, cut: true },
    { t: 8.2, p: V(5.4, 6.2, 1.6), l: V(0, .6, -.6), fov: 46, ease: 'out' },   // up and back over the cross path (no trees in the way)
    // S6 from your eyeline: the roaster laughing in your face, the crowd behind him
    { t: 8.25, p: V(.0, 1.5, -.15), l: V(-.45, 1.38, -2.2), fov: 54, cut: true },
    { t: 9.3, p: V(-.02, 1.49, -.25), l: V(-.4, 1.36, -2.2), fov: 50 },
    // S7 your frozen face (from the front-right, clear of the roaster), slow push as your mouth opens
    { t: 9.35, p: V(1.5, 1.95, -3.3), l: V(0, 1.38, 0), fov: 19, cut: true },
    { t: 11.9, p: V(1.4, 1.92, -3.1), l: V(0, 1.4, 0), fov: 16.5, ease: 'io' },
    // S8 snap zoom on the open mouth: nothing comes out, the blush
    { t: 11.95, p: V(1.1, 1.85, -2.5), l: V(0, 1.44, 0), fov: 14, cut: true, zoom: true },
    { t: 12.9, p: V(1.08, 1.84, -2.45), l: V(0, 1.44, 0), fov: 13 },
    // S9 side on (the gap on your right): you lean, push off, stand, and point at the roaster in front of you
    { t: 12.95, p: V(5.6, 1.25, -.9), l: V(0, 1.15, -.95), fov: 31, cut: true },
    { t: 15.2, p: V(5.2, 1.2, -.95), l: V(0, 1.25, -1.0), fov: 29 },
    // S10 the BUFFER: over the roaster's shoulder, straight at you, the spinner over your head
    { t: 15.25, p: V(.65, 2.3, -3.9), l: V(0, 1.6, -.55), fov: 24, cut: true },
    { t: 16.15, p: V(.62, 2.27, -3.7), l: V(0, 1.6, -.55), fov: 22 },
    // S11 wide: you step-turn away and walk off, the crowd laughing
    { t: 16.2, p: V(-5.0, 1.8, -.9), l: V(-.6, 1.25, -.5), fov: 30, cut: true },
    { t: 16.78, p: V(-4.8, 1.78, -.88), l: V(-.7, 1.25, -.5), fov: 29 },
    // ...and into the back of your head
    { t: 16.8, p: V(-1.45, 1.6, -.58), l: V(-.1, 1.52, -.56), fov: 32, cut: true, ease: 'in', zoom: true },   // into his FACE (front): readable as "into his head"
    { t: T_HQ - .02, p: V(-.32, 1.53, -.56), l: V(-.1, 1.52, -.56), fov: 32, ease: 'in', zoom: true },
    // ===== Brain HQ =====
    // little you at the console, the EMBARRASSMENT meter climbing, the eye windows full of laughing kids
    { t: T_HQ, p: R(1.75, 1.85, 1.4), l: R(-.05, 1.1, -.75), fov: 46, cut: true },   // establish Brain HQ: little you (navy ME polo) at the console
    { t: 17.9, p: R(1.6, 1.8, 1.25), l: R(-.05, 1.1, -.75), fov: 43 },
    { t: 17.92, p: R(.75, 1.62, -1.55), l: R(0, 1.3, -.36), fov: 54, cut: true },     // from over the console: his face as the meter climbs, the FACEPALM
    { t: 18.55, p: R(.7, 1.6, -1.5), l: R(0, 1.3, -.36), fov: 50 },
    // the screen: 100%, PRESS PANIC (whole screen straight on)
    { t: 18.6, p: R(0, 1.38, -.12), l: R(0, 1.38, -1.36), fov: 72, cut: true },
    { t: 19.5, p: R(0, 1.38, -.26), l: R(0, 1.38, -1.36), fov: 72 },
    // up off the stool, wind-up, SLAM (from the front, high: fist + button + his face)
    { t: 19.55, p: R(-2.2, 1.75, .25), l: R(.3, 1.25, -.55), fov: 42, cut: true },          // up off the stool, winds up (from the side wall)
    { t: 20.2, p: R(-2.15, 1.72, .15), l: R(.32, 1.2, -.58), fov: 39 },
    { t: 20.22, p: R(1.0, 1.72, -1.95), l: R(.58, 1.08, -.8), fov: 60, cut: true },          // the fist comes down on PANIC
    { t: 20.48, p: R(.98, 1.7, -1.92), l: R(.58, 1.06, -.8), fov: 56 },
    // the alarm hits the WORDS booth: the worker writing comebacks, the shutter slams down on him
    { t: 20.5, p: [400 + .85, 1.7, 3.3], l: [400 - .05, 1.38, .55], fov: 38, cut: true },   // the WORDS DEPARTMENT from the corridor: the clerk asleep...
    { t: 22.3, p: [400 + .75, 1.68, 3.15], l: [400 - .05, 1.4, .6], fov: 36 },
    // little you bangs on the shutter (from behind his shoulder)
    { t: 22.35, p: [400 - 1.25, 1.75, 3.1], l: [400 + .05, 1.35, 1.1], fov: 40, cut: true },   // little you bangs on the shut window
    { t: 24.38, p: [400 - 1.15, 1.72, 2.95], l: [400 + .05, 1.35, 1.1], fov: 38 },
    // ===== the bathroom, that night =====
    // wide from the doorway corner: the dark window + moon, steam, the curtain closed, your silhouette behind it
    { t: 24.42, p: [600 + 1.25, 1.95, 1.3], l: [600 - .45, 1.2, -0.88], fov: 52, cut: true },
    { t: 25.8, p: [600 + 1.08, 1.88, 1.05], l: [600 - .45, 1.2, -0.88], fov: 48 },
    // inside the shower, side on from the tub end: hand on the tiles, head down, shaking it; hand to his face
    { t: 25.85, p: [600 - 1.44, 1.66, -1.08], l: [600 - .1, 1.48, -1.03], fov: 52, cut: true },
    { t: 26.88, p: [600 - 1.38, 1.65, -1.06], l: [600 - .1, 1.5, -1.03], fov: 49 },
    // dive into his head
    { t: 26.92, p: [600 - 1.05, 1.62, -1.2], l: [600 - .13, 1.6, -1.1], fov: 40, cut: true, ease: 'in', zoom: true },
    { t: 27.13, p: [600 - .6, 1.61, -1.13], l: [600 - .13, 1.6, -1.1], fov: 40, ease: 'in', zoom: true },
    // HQ, that night: little you slumped on the shutter; it rattles up (the worker pushing it from inside), he steps back,
    // the worker holds out the glowing comeback, little you takes it and reads it
    { t: 27.15, p: [400 - 1.6, 1.72, -.45], l: [400 + .05, 1.4, 1.4], fov: 40, cut: true },   // from inside the office: the clerk pushes it up, little you outside   // that night, side on across the ledge: the shutter rolls up, the comeback is handed over
    { t: 29.5, p: [400 - 1.5, 1.7, -.38], l: [400 + .05, 1.42, 1.4], fov: 37 },
    // back out of his head (pull back from his temple): the hand comes off his face
    { t: T_OUT, p: [600 - 1.0, 1.68, -1.1], l: [600 - .13, 1.62, -0.88], fov: 40, cut: true, ease: 'out' },
    { t: 30.3, p: [600 - 1.42, 1.64, -1.08], l: [600 - .13, 1.55, -0.88], fov: 52, ease: 'out' },
    // he screams it at the wall (side on: the wall on the left of frame), then both hands over his mouth
    { t: 30.35, p: [600 - 1.44, 1.45, -1.10], l: [600 - .2, 1.6, -0.93], fov: 52, cut: true },
    { t: 31.98, p: [600 - 1.4, 1.45, -1.09], l: [600 - .2, 1.61, -0.93], fov: 50 },
    // hands slap over his mouth: from the other end, above (over the tub end), so the face reads past the forearms
    { t: 32.0, p: [600 - 1.42, 1.62, -1.10], l: [600 - .15, 1.6, -0.88], fov: 50, cut: true },
    { t: 33.2, p: [600 - 1.38, 1.62, -1.09], l: [600 - .15, 1.6, -0.88], fov: 48 },
    // BANG BANG: the door shakes (from outside the curtain)
    { t: 33.25, p: [600 - .6, 1.5, -0.08], l: [600 + 1.58, 1.15, .98], fov: 50, cut: true },
    { t: 34.15, p: [600 - .55, 1.48, -0.03], l: [600 + 1.58, 1.15, .98], fov: 47 },
    // his face, hands on his mouth, eyes slide to the door (3/4 front, from the wall corner), slow push
    { t: 34.2, p: [600 - 1.42, 1.64, -1.10], l: [600 - .15, 1.6, -0.88], fov: 48, cut: true },   // he turns toward the door = toward us
    { t: 36.4, p: [600 - 1.34, 1.63, -1.09], l: [600 - .15, 1.6, -0.88], fov: 42, ease: 'io' },
  ];
  const shakes = [{ t: T_OOH, amp: .015, dur: .3 }, { t: T_POINT, amp: .02, dur: .25 }, { t: T_SLAM, amp: .06, dur: .5 }, { t: T_SHUT, amp: .04, dur: .35 }, { t: T_BANG, amp: .03, dur: .9 }];

  function update(t) {
    guy.A.root.visible = !(t >= 8.25 && t < 9.35); box.visible = t < T_HQ;   // his POV of the laughing crowd: the camera sits in his head
    title.style.opacity = t < TITLE_END ? String(Math.min(1, t / .08) * (1 - ss(t, TITLE_END - .15, TITLE_END))) : '0';
    const sc = 1 + .25 * Math.max(0, 1 - t / .18); title.style.transform = `scale(${sc.toFixed(3)})`;
    // ---- night in the bathroom: the sun / sky fill go down while we're there ----
    if (!update.day) update.day = { sun: world.sun.intensity, hemi: world.hemi.intensity, amb: world.amb.intensity, env: scene.environmentIntensity };
    const D0 = update.day, inBath = (t >= 24.4 && t < 27.15) || t >= T_OUT;
    world.sun.intensity = inBath ? 0 : D0.sun; world.hemi.intensity = inBath ? .05 : D0.hemi; world.amb.intensity = inBath ? .05 : D0.amb; scene.environmentIntensity = inBath ? .08 : (scene.environmentIntensity > .2 ? scene.environmentIntensity : (D0.env || .55));
    bathLight.intensity = inBath ? 5 : 0; showerLight.intensity = inBath ? 7 : 0; faceFill.intensity = inBath ? 3.5 : 0;
    steamAt(t);
    // the door shakes with each bang (four hits), handle rattling
    { const u = t - T_BANG; let a = 0; if (u > 0 && u < 1.3) for (let k = 0; k < 4; k++) { const v = u - k * .3; if (v > 0 && v < .25) a += Math.sin(v * 60) * Math.exp(-v * 14) * .025; } door.rotation.y = a; }
    // ---- Brain HQ state ----
    op.A.root.visible = !(t >= 18.6 && t < 19.5);   // screen insert: the camera sits where he is
    const press = t < T_SLAM ? 0 : Math.exp(-(t - T_SLAM) * 5); cap.position.y = .04 - .025 * (t >= T_SLAM && t < T_SLAM + .5 ? Math.min(1, (t - T_SLAM) * 30) * (1 - ss(t, T_SLAM + .2, T_SLAM + .5)) : 0);
    domeM.emissiveIntensity = .3 + 2.5 * press;
    B.stool.position.z = (update.stoolZ ??= B.stool.position.z) + .32 * ss(t, 19.55, 19.85); B.stool.rotation.y = .4 * ss(t, 19.55, 19.95);
    const alarm = t >= T_SLAM + .1 && t < 24.4 ? 1 : 0;
    B.set({ hideCables: (t >= 20.5 && t < 24.4) || (t >= 27.15 && t < T_OUT) ? [0, 1, 2, 3, 4, 5, 6, 7] : [], screen, lever: t >= 24.4 ? 1 : .2, gauge: t >= 24.4 ? .15 : .55 + .43 * ss(t, 17.2, 18.9), alarm, pulse: alarm ? ((t - T_SLAM) * 2.2) % 1 : -1, t });
    // shutter: open -> SLAMS down (fast, a little bounce) -> rolls back up at T_UP
    // the shutter follows the worker's hand while he holds the bar (pull down / push up); otherwise it stays put
    const hy = handPos(worker.A, 'armR').y, byHand = THREE.MathUtils.clamp((SH_TOP - hy) / (SH_TOP - SH_BOT), 0, 1);
    const down = t < T_BAR ? 0 : t < T_SHUT ? Math.max(.02, byHand) : t < T_PUSH0 + .3 ? 1 : t < T_UP + .4 ? byHand : 0;
    shutterAt(down);
    { const on = alarm && Math.floor(t * 6) % 2 === 0; beaconM.emissiveIntensity = alarm ? (on ? 4 : 1) : 0; beaconL.intensity = alarm ? (on ? 18 : 5) : 0; beacon.rotation.z = t * 8; }
    // the card: in the worker's hand, then yours
    card.visible = t >= T_GRAB - .5; if (card.visible) { const hw = handPos(worker.A, 'armR'), hy = handPos(op.A, 'armR'), k = ss(t, T_GRAB - .05, T_GRAB + .25);
      card.position.copy(hw.lerp(hy, k)); card.position.y += .02; card.rotation.set(0, k < .5 ? F / 2 : 0, 0); card.userData.glow.material.opacity = .6 + .4 * Math.sin(t * 9); }
    // buffer spinner rides above his head
    const on = t >= T_BUF && t < 15.95; spinner.visible = on;
    if (on) { const h = guy.A.bones.head.getWorldPosition(new THREE.Vector3()); spinner.position.set(h.x, h.y + .55, h.z); drawSpin(t); }
  }
  async function bake(renderer) {   // your POV of the laughing crowd for the Brain HQ eye windows
    for (const a of [guy, girl, roaster, ...crowd]) a.update(9.2);
    guy.A.root.visible = false; guy.A.root.updateMatrixWorld(true);
    const cam = new THREE.PerspectiveCamera(80, 2, .05, 200); cam.position.set(BX, GY + 1.5, BZ - .1); cam.lookAt(BX - .3, GY + 1.3, BZ - 3);
    const rt = new THREE.WebGLRenderTarget(1024, 512, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); guy.A.root.visible = true; B.setView(rt.texture);
  }
  return { shakes, cast: { guy, girl, roaster, op, worker, sg, ...Object.fromEntries(crowd.map((n, i) => ['c' + i, n])) }, camera, update, bake, keep: [B.group, btn, WD, BA, card] };
}
