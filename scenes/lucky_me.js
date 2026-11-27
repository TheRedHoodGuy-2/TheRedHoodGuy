// 09 LUCKY ME ("In this town, the unluckier you are, the richer you get"). Voice: topics/lucky_me/voice/take.mp3 (49.19 s, approved).
// Shot list: topics/lucky_me/SHOTS.md (38 shots, APPROVED 2026-11-27 00:59). Twist (never said, only shown): Jaden is always next to
// the boy, every bad thing meant for the boy hits Jaden, and every hit pays Jaden (small cash poof he pockets).
// World (all exteriors inside the town, rule 7): House A (living + entry) and its front walk / lawn / kerb = the boy's block;
// lot B (x~3274) = the unlucky neighbor; the mansion on an open lot at (3153, -350) facing its road, pool beside it;
// the corner store on a shop road at (3443, -250). The store interior is an enclosed room at x 9000 (no outside visible).
import * as THREE from 'three';
import { stage } from '../engine/act.js';
import { addSkates } from '../engine/props/skates.js';
import { wearFeet, wearLimb } from '../engine/cast.js';
import { buildTown } from '../engine/sets/town.js';
import { dayLook, paintSky } from '../engine/look.js';
import { validate } from '../engine/shots.js';
import { limbTo } from '../engine/r6pose.js';
import { flapTrack } from '../engine/lipsync.js';
import { ph } from '../engine/build.js';
import { hingeDoor } from '../engine/sets/clapset.js';
import { mansionFront, mansionPool, lightningRodHat, cornerStoreFront, cornerStoreInterior } from '../engine/sets/lucky_me_set.js';
import { sportsCar, poolFloaty, privateJet } from '../engine/designs/streetprops.js';
import * as LP from '../engine/designs/luckprops.js';
import * as FU from '../engine/designs/furniture.js';
import { luckFX, cashFan, billTex as fxBillTex } from '../engine/luckfx.js';

const J = async p => (await fetch(new URL(p, document.baseURI))).json();
export const DUR = 52.9;   // +1.4 s after the last line (Xavier 2026-11-27): the bolt must LAND on the car and we see what it did before the cut
const lerp = (a, b, k) => a + (b - a) * k, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = u => { u = cl(u); return u * u * (3 - 2 * u); };
const fa = (part, hand, elbow, root = {}) => limbTo(part, root, hand, elbow);
const N = Math.PI;   // ry 0 faces +z, N faces -z, N/2 faces +x

// ---------------- poses (avatar frame, Xavier's { r, o } form: arm r.x < 0 = forward, armL r.z > 0 = out, head r.x > 0 = down) ----------------
const legsEasy = { legL: { r: [0.04, 0, 0.03], o: [0.01, 0, 0.02] }, legR: { r: [-0.06, 0, -0.05], o: [-0.02, 0.01, -0.03] } };
const P = {
  relaxed: { ...legsEasy, armL: { r: [-0.14, 0, 0.0] }, armR: { r: [0.1, 0, 0.01] }, head: { r: [0.04, 0.12, 0.02] }, root: { x: 0.03, rz: 0.03 } },
};
// the neighbor: pot lands (head driven down, knees give), dazed grin grabbing at the falling bills
P.potHit = { legL: { r: [0.25, 0, 0.12], o: [0, 0, 0.05] }, legR: { r: [-0.22, 0, -0.1] }, armL: { r: [-0.35, 0, 0.45] }, armR: { r: [-0.2, 0, -0.38] }, head: { r: [0.5, 0, 0.12] }, root: { rx: 0.12, y: -0.06, rz: .05 } };
P.dazedGrin = { legL: { r: [0.1, 0, 0.1] }, legR: { r: [-0.15, 0, -0.05] }, armL: { r: [2.85, 0.3, -0.25], o: [0.057, 0.252, -0.013] }, armR: { r: [3.0, -0.4, 0.35], o: [-0.057, 0.252, -0.013] }, head: { r: [-0.3, 0.1, 0.12] }, root: { rx: -0.1, rz: -.04 } };   // both arms up grabbing at the bills (Xavier's raised-arm { r, o } from the wave)
P.charred = { legL: { r: [0.08, 0, 0.12] }, legR: { r: [-0.1, 0, -0.1] }, armL: { r: [0.15, 0, 0.55], o: [0, 0, 0.04] }, armR: { r: [0.12, 0, -0.5], o: [0, 0, 0.04] }, head: { r: [0.15, 0, -0.08] }, root: { rx: 0.06 } };
P.zapped = { legL: { r: [-0.1, 0, 0.35] }, legR: { r: [0.1, 0, -0.35] }, armL: { r: [0.1, 0, 1.25], o: [0, 0.05, 0] }, armR: { r: [0.05, 0, -1.3], o: [0, 0.05, 0] }, head: { r: [-0.35, 0, 0] }, root: { rx: -0.1 } };
P.balconyLean = { legL: { r: [0.05, 0, 0.05] }, legR: { r: [-0.08, 0, -0.05] }, armL: fa('armL', [0.32, 1.0, 0.36], [0.42, 1.08, 0.08]), armR: fa('armR', [-0.32, 1.0, 0.36], [-0.42, 1.08, 0.08]), head: { r: [-0.08, 0.15, 0.05] }, root: { rx: 0.1 } };
// the richest man on the floaty (lying back, one hand up with the drink), then soaked and unbothered
P.floaty = { legL: { r: [-1.5708, 0, .12] }, legR: { r: [-1.42, 0, -.15], o: [0, .02, .04] }, armL: { r: [.6, 0, .45], o: [0, 0, -.05] }, armR: fa('armR', [-.22, .72, .36], [-.4, .55, .04], { y: -.51 }), head: { r: [-.1, .15, 0] }, root: { y: -.51, rx: -.28 } };   // sitting back on the ring (his sit code), drink at the chest
P.soaked = { ...P.floaty, armR: fa('armR', [-.1, 1.05, .22], [-.4, .55, .04], { y: -.51 }), head: { r: [.05, -.05, 0] } };   // sips
// the mailman: clips the kerb (pitched forward, arms flung), then only a fist full of bills out of the hedge
P.skateClip = { legL: { r: [-0.6, 0, 0.1], o: [0, 0.08, 0.08] }, legR: { r: [0.55, 0, -0.1] }, armL: { r: [-1.9, 0, 0.6], o: [0, 0.08, 0.1] }, armR: { r: [-1.7, 0, -0.7], o: [0, 0.08, 0.1] }, head: { r: [-0.3, 0.2, 0] }, root: { rx: 0.9, y: -0.2 } };
P.skate = { legL: { r: [-0.25, 0, 0.12], o: [0, 0, 0.04] }, legR: { r: [0.3, 0, -0.1] }, armL: { r: [0.35, 0, 0.3] }, armR: { r: [-0.4, 0, -0.25] }, head: { r: [0.05, 0, 0] }, root: { rx: 0.18 } };
P.hedgeLegs = { legL: { r: [0.3, 0, 0.18] }, legR: { r: [-0.25, 0, -0.22] }, armL: { r: [-2.6, 0, 0.5], o: [0, .15, .05] }, armR: { r: [-2.4, 0, -0.6], o: [0, .15, .05] }, head: { r: [0.4, 0, 0] }, root: {} };
P.hedgeFist = { legL: { r: [0, 0, 0] }, legR: { r: [0, 0, 0] }, armL: { r: [0, 0, 0] }, armR: { r: [-3.0, 0, -0.1], o: [0, 0.2, 0.05] }, head: { r: [0, 0, 0] }, root: { rx: 0.15 } };
// the boy: walking, never noticing; then the couch, the window, the storm, the store, the hall, the ending
P.bendShoe = { legL: { r: [-0.15, 0, 0.12], o: [0, -.05, 0.12] }, legR: { r: [1.2, 0, -0.08], o: [0, 0.08, 0.12] }, armL: fa('armL', [0.08, 0.32, 0.42], [0.42, 0.85, 0.3], { rx: .75, y: -.35 }), armR: fa('armR', [-0.12, 0.3, 0.4], [-0.42, 0.85, 0.3], { rx: .75, y: -.35 }), head: { r: [0.35, 0, 0] }, root: { rx: 0.75, y: -0.35 } };
P.couchSit = { armL: { r: [-0.62, 0, 0.14], o: [0, -0.02, 0.06] }, armR: { r: [-0.65, 0, -0.14], o: [0, -0.02, 0.06] }, legL: { r: [-0.093, 0.057, 0.063], o: [0.028, 0.061, 0.55] }, legR: { r: [-0.023, 0.092, -0.169], o: [-0.056, 0.044, 0.57] }, head: { r: [0.05, -0.3, 0] }, root: { x: 0.017, y: -0.06, z: -0.033 } };
// Xavier 2026-11-27 18:19: the "I need one bad thing" beat = the classic THINKER on the couch: back arched forward, elbows on
// the knees, hands together under the chin, head resting on them.
P.thinkerOld = { ...P.couchSit, armL: fa('armL', [0.07, 1.22, 0.46], [0.2, 0.7, 0.5], { rx: .38, y: -.06 }), armR: fa('armR', [-0.07, 1.22, 0.46], [-0.2, 0.7, 0.5], { rx: .38, y: -.06 }), head: { r: [0.28, 0.05, 0.04] }, root: { x: 0.017, y: -0.06, z: -0.033, rx: .38 } };
// Xavier's pose code (2026-11-27 19:02) for the thinker, exactly as given
P.thinker = { armL: { r: [-2.261, -0.477, -0.875], o: [-0.079, -0.102, 0.234] }, armR: { r: [-2.246, 0.227, 0.794], o: [0.114, -0.127, 0.159] }, legL: { r: [-0.386, 0.006, 0.03], o: [0.053, 0.154, 0.383] }, legR: { r: [-0.386, -0.006, -0.03], o: [-0.012, 0.165, 0.392] }, head: { r: [-0.266, 0, 0], o: [0, 0, 0.059] }, root: { x: 0.012, y: 0.286, z: -0.221, rx: 0.386 } };
P.thinkSmirk = { ...P.thinker, head: { r: [-0.2, -0.12, 0.06], o: [0, 0, 0.059] } };
// soaked by the sprinkler: sitting on the ground, right hand slapped over his face ("bro...")
P.facepalm = t => ({ ...P.sitHit, armR: { r: [-2.55, 0.2, 0.55], o: [0.08, -0.05, 0.12] }, armL: { r: [-2.5, -0.2, -0.5], o: [-0.08, -0.05, 0.12] }, head: { r: [0.3, 0.05, 0.08 + Math.sin(t * 9) * .04] } });   // both hands up over his face
// getting up off the ground: lean forward over the feet, hands pushing off the knees
P.pushUp = { legL: { r: [-0.9, 0, 0.12], o: [0, 0.05, 0.1] }, legR: { r: [-0.7, 0, -0.1], o: [0, 0.05, 0.08] }, armL: { r: [-0.7, 0, 0.2] }, armR: { r: [-0.75, 0, -0.2] }, head: { r: [0.2, 0, 0] }, root: { y: -.28, rx: .55 } };
// SUBSCRIBE PROMPT selfie: right arm straight out + up at the lens (the phone is the camera), head tilted in, smug
P.selfieOld = { legL: { r: [-0.06, 0, 0.1] }, legR: { r: [0.05, 0, -0.08] }, armR: fa('armR', [-0.4, 1.66, 0.55], [-0.32, 1.42, 0.22]), armL: fa('armL', [0.3, 1.62, 0.22], [0.36, 1.25, 0.14]), head: { r: [-0.12, -0.15, -0.18] }, root: { rz: -0.04 } };
// Xavier's pose code (19:02) for the subscribe selfie, exactly as given (reads right from the high front-right angle)
P.selfie = { armL: { r: [-1.596, -0.38, -1.234], o: [0.129, -0.065, 0.136] }, armR: { r: [-2.315, -0.59, -0.426], o: [-0.422, 0.804, 0.559] }, legL: { r: [0.345, 0.019, 0.253], o: [0.092, 0.028, -0.05] }, legR: { r: [0.262, 0.056, -0.1], o: [-0.027, -0.046, -0.055] }, head: { r: [-0.307, -0.57, -0.078] }, root: { x: -0.204, y: 0.071, z: 0.178, rx: -0.268, ry: 0.014, rz: -0.212 } };
// his free hand throws a loose 'yo / sup' wave while he talks to the phone
P.selfieWave = t => { const k = Math.sin(t * 7.5), k2 = Math.sin(t * 7.5 + .7); return { ...P.selfie, armL: { r: [-1.596 - .25 * k2, -0.38 + .15 * k, -1.234 + .42 * k], o: [0.129, -0.065, 0.136] } }; };
P.mailSkate = t => { const ph = Math.sin(t * Math.PI * 1.6), L = Math.max(0, ph), R = Math.max(0, -ph);   // the approved Sunset Tag stroke
  return { legL: [.05 + L * .35, -1, -L * .3], legR: [-.05 - R * .35, -1, -R * .3], armL: [.2, -.9, -ph * .45], armR: { r: [-1.2, 0, -.3], o: [0, 0, 0] }, head: [0, -.05, 0], root: { rx: .16, rz: ph * .05 } }; };
P.couchListen = { ...P.couchSit, head: { r: [0.12, -0.42, -0.05] }, armL: { r: [-0.9, 0, 0.1], o: [0, -0.02, 0.1] } };
P.windowLean = { legL: { r: [-0.15, 0, 0.06], o: [0, 0, 0.06] }, legR: { r: [0.12, 0, -0.05] }, armL: fa('armL', [0.32, 1.12, 0.5], [0.42, 1.02, 0.1], { rx: .18 }), armR: fa('armR', [-0.3, 1.1, 0.5], [-0.42, 1.02, 0.1], { rx: .18 }), head: { r: [-0.15, 0.08, 0] }, root: { rx: 0.18 } };
P.smirk = { ...P.windowLean, head: { r: [-0.08, 0.35, 0.1] } };
P.stormArms = { legL: { r: [-0.05, 0, 0.2] }, legR: { r: [0.05, 0, -0.2] }, armL: { r: [0.35, 0, 1.25], o: [0, 0.05, 0.02] }, armR: { r: [0.4, 0, -1.15], o: [0, 0.05, 0.02] }, head: { r: [-0.6, 0, 0.05] }, root: { rx: -0.12 } };
P.rainbowAnnoyed = { legL: { r: [0.06, 0, 0.1] }, legR: { r: [-0.1, 0, -0.06] }, armL: { r: [0.05, 0, 0.18] }, armR: { r: [0.06, 0, -0.16] }, head: { r: [-0.35, 0.1, 0.15] }, root: { rx: 0.03 } };
P.kickWind = { legL: { r: [0.1, 0, 0.1] }, legR: { r: [0.75, 0, -0.08], o: [0, 0.06, -0.05] }, armL: { r: [-0.45, 0, 0.5] }, armR: { r: [0.4, 0, -0.45] }, head: { r: [0.15, 0, 0] }, root: { rx: 0.08 } };
P.kick = { legL: { r: [0.12, 0, 0.1] }, legR: { r: [-1.35, 0, -0.05], o: [0, 0.1, 0.16] }, armL: { r: [-0.6, 0, 0.85] }, armR: { r: [0.3, 0, -0.8] }, head: { r: [0.1, 0, 0] }, root: { rx: -0.22 } };
P.standBack = { legL: { r: [0.06, 0, 0.08] }, legR: { r: [-0.1, 0, -0.06], o: [0, 0, 0.04] }, armL: { r: [-0.08, 0, 0.12] }, armR: { r: [0.1, 0, -0.1] }, head: { r: [0.05, 0.2, 0.05] }, root: { rx: -0.03, rz: .03 } };
P.slapCoins = { ...legsEasy, armR: fa('armR', [-0.15, 1.02, 0.45], [-0.42, 1.05, 0.08], { rx: .12 }), armL: { r: [0.1, 0, 0.12] }, head: { r: [0.3, 0, 0] }, root: { rx: 0.12 } };
P.scratchHard = { ...legsEasy, armL: fa('armL', [0.06, 1.05, 0.36], [0.42, 0.98, 0.06]), armR: fa('armR', [-0.04, 1.08, 0.38], [-0.42, 0.98, 0.06]), head: { r: [0.42, 0, 0] }, root: { rx: 0.1 } };
P.scratchB = { ...P.scratchHard, armR: fa('armR', [-0.1, 1.06, 0.36], [-0.42, 0.98, 0.06]) };
P.jackpotFace = { ...P.scratchHard, head: { r: [0.3, 0, 0] }, root: { rx: -0.05, y: .02 } };
P.deadpanBruh = { legL: { r: [0.05, 0, 0.06] }, legR: { r: [-0.08, 0, -0.04] }, armL: fa('armL', [0.06, 1.0, 0.3], [0.42, 0.95, 0.04]), armR: { r: [0.05, 0, -0.05] }, head: { r: [0.0, 0.0, 0.0] }, root: {} };
P.snapTo = { legL: { r: [-0.12, 0, 0.08] }, legR: { r: [0.12, 0, -0.06] }, armL: { r: [-0.25, 0, 0.25] }, armR: { r: [-0.2, 0, -0.22] }, head: { r: [-0.08, 0.45, 0.05] }, root: { rx: -0.06 } };
P.smug = { legL: { r: [-0.08, 0, 0.12], o: [0.02, 0, 0.04] }, legR: { r: [0.06, 0, -0.06] }, armL: fa('armL', [0.36, 0.9, -0.04], [0.62, 1.08, -0.12]), armR: { r: [0.1, 0, -0.12] }, head: { r: [-0.15, -0.2, -0.08] }, root: { rz: 0.05 } };
P.boltFlash = { legL: { r: [0.1, 0, 0.15] }, legR: { r: [-0.1, 0, -0.15] }, armL: { r: [-0.6, 0, 0.7] }, armR: { r: [-0.5, 0, -0.75] }, head: { r: [-0.25, -0.3, 0] }, root: { rx: -0.12 } };
// Jaden: the hits
P.slipFall = { armL: { r: [-0.86, -1.088, -1.44], o: [0.021, -0.035, 0.133] }, armR: { r: [-0.822, 0.818, -0.714], o: [-0.076, 0.102, 0.208] }, legL: { r: [1.228, 0.669, -0.34], o: [0.185, -0.052, -0.004] }, legR: { r: [-0.021, -0.206, 0.308], o: [-0.085, 0.153, 0.055] }, head: { r: [0.362, 0.283, -0.21], o: [0, 0.081, 0] }, root: { x: 0.6, y: 0.156, z: 1.212, rx: -0.363, ry: 0.035, rz: 1.259 } };   // Xavier's fall code (clap_cops)
P.sitHit = { legL: { r: [-1.5708, 0, .1] }, legR: { r: [-1.4, 0, -.12], o: [0, .02, .04] }, armL: { r: [.5, 0, .35], o: [0, 0, -.05] }, armR: { r: [.55, 0, -.3], o: [0, 0, -.05] }, head: { r: [-.55, 0, 0] }, root: { y: -.51, rx: -.25 } };
P.pocketQuiet = { legL: { r: [-1.5708, 0, .1] }, legR: { r: [-1.4, 0, -.12], o: [0, .02, .04] }, armL: { r: [.45, 0, .3], o: [0, 0, -.05] }, armR: fa('armR', [-0.32, 0.45, 0.02], [-0.42, 0.55, 0.02], { y: -.51 }), head: { r: [.25, -.35, 0] }, root: { y: -.51, rx: -.1 } };
P.ballHitHead = { legL: { r: [-0.15, 0, 0.12] }, legR: { r: [0.15, 0, -0.1] }, armL: { r: [-0.4, 0, 0.45] }, armR: { r: [-0.3, 0, -0.45] }, head: { r: [-0.25, 0.35, 0.35] }, root: { rx: -0.12, rz: 0.12, x: .05 } };
P.umbrella = { legL: { r: [0.05, 0, 0.05] }, legR: { r: [-0.08, 0, -0.05] }, armR: fa('armR', [-0.12, 1.12, 0.32], [-0.42, 1.0, 0.06]), armL: { r: [0.1, 0, 0.1] }, head: { r: [0.05, 0.25, 0] }, root: {} };
P.umbrellaSmoke = { ...P.umbrella, armL: { r: [0.1, 0, 0.6] }, head: { r: [0.1, -0.2, 0.15] }, root: { rx: 0.08, y: -.04 } };
P.canHit = { legL: { r: [-0.1, 0, 0.1] }, legR: { r: [0.15, 0, -0.1], o: [0, 0, -.06] }, armL: { r: [-0.35, 0, 0.4] }, armR: { r: [-0.3, 0, -0.4] }, head: { r: [-0.45, 0, -0.1] }, root: { rx: -0.18, z: -.05 } };
P.slushie = { legL: { r: [0.15, 0, 0.12] }, legR: { r: [-0.12, 0, -0.1] }, armL: { r: [-0.9, 0, 0.6], o: [0, .05, .1] }, armR: { r: [-1.0, 0, -0.55], o: [0, .05, .1] }, head: { r: [-0.25, 0, 0] }, root: { rx: -0.1 } };
P.carStep = { legL: { r: [-0.25, 0, 0.1], o: [0, 0, 0.06] }, legR: { r: [0.2, 0, -0.08] }, armL: { r: [-0.2, 0, 0.2] }, armR: { r: [0.15, 0, -0.15] }, head: { r: [-0.1, -0.25, 0] }, root: { rx: -0.03 } };
P.fanCash = { legL: { r: [-0.1, 0, 0.12] }, legR: { r: [0.1, 0, -0.08] }, armR: fa('armR', [-0.32, 1.22, 0.38], [-0.42, 1.02, 0.1]), armL: fa('armL', [0.36, 0.9, -0.04], [0.62, 1.08, -0.12]), head: { r: [-0.15, -0.15, -0.1] }, root: { rx: -0.06, rz: .04 } };
// Mom, the clerk, the landlord
P.momPat = { legL: { r: [-0.093, 0.057, 0.063], o: [0.028, 0.061, 0.55] }, legR: { r: [-0.023, 0.092, -0.169], o: [-0.056, 0.044, 0.57] }, armL: { r: [-0.4, 0, 0.75], o: [0, -.04, 0.12] }, armR: { r: [-0.65, 0, -0.14], o: [0, -0.02, 0.06] }, head: { r: [0.05, 0.4, 0.05] }, root: { x: 0.017, y: -0.06, z: -0.033 } };
P.momLetter = { legL: P.momPat.legL, legR: P.momPat.legR, armR: fa('armR', [-0.12, 0.92, 0.42], [-0.42, 0.9, 0.12], { x: 0.017, y: -0.06, z: -0.033 }), armL: { r: [-0.65, 0, 0.14], o: [0, -0.02, 0.06] }, head: { r: [0.18, 0.35, 0.05] }, root: { x: 0.017, y: -0.06, z: -0.033 } };
P.momSad = { ...P.momLetter, head: { r: [0.3, 0.45, 0.12] } };
P.clerkTear = { ...legsEasy, armL: fa('armL', [0.12, 1.08, 0.36], [0.42, 0.98, 0.06]), armR: fa('armR', [-0.06, 1.18, 0.38], [-0.42, 1.0, 0.08]), head: { r: [0.3, 0.1, 0] } };
P.clerkPoint = { ...legsEasy, armR: fa('armR', [-0.25, 1.02, 0.55], [-0.42, 1.0, 0.12]), armL: { r: [0.1, 0, 0.15] }, head: { r: [0.15, -0.15, 0] }, root: { rx: .04 } };
P.knockA = { legL: { r: [-0.1, 0, 0.1] }, legR: { r: [0.1, 0, -0.08] }, armR: fa('armR', [-0.1, 1.45, 0.42], [-0.42, 1.06, 0.12]), armL: fa('armL', [0.2, 1.0, 0.25], [0.42, 1.0, 0.04]), head: { r: [-0.05, 0, 0] }, root: {} };
P.knockB = { ...P.knockA, armR: fa('armR', [-0.1, 1.42, 0.55], [-0.42, 1.06, 0.14]) };
export { P };

export const POSE_SHEET = [
  ['01 Neighbor: pot lands on head', 'm021', 'potHit', 'shocked', ''], ['02 Neighbor: dazed grin, grabs cash', 'm021', 'dazedGrin', 'happy', ''],
  ['03 Mailman skating', 'mailman_skates', 'skate', 'happy', ''], ['04 Mailman clips the kerb', 'mailman_skates', 'skateClip', 'scared', ''],
  ['05 Neighbor: zapped', 'm021', 'zapped', 'shocked', ''], ['06 Neighbor: charred, smoking', 'm021', 'charred', 'shocked', ''],
  ['07 Neighbor: balcony, lightning-rod hat', 'm021', 'balconyLean', 'smug', ''], ['08 Richest man on the floaty', 'm038', 'floaty', 'smug', 'seat'],
  ['09 Richest man soaked, sips', 'm038', 'soaked', 'bored', 'seat'], ['10 Boy bends to tie his shoe', 'boy', 'bendShoe', 'neutral', ''],
  ['11 Jaden slips on the peel', 'jayden', 'slipFall', 'shocked', ''], ['12 Jaden: sprinkler in the face', 'jayden', 'sitHit', 'shocked', ''],
  ['13 Jaden pockets the cash', 'jayden', 'pocketQuiet', 'smug', ''], ['14 Jaden: ball to the head', 'jayden', 'ballHitHead', 'shocked', ''],
  ['15 Mom pats the couch', 'mom', 'momPat', 'happy', 'seat'], ['16 Boy on the couch, listening', 'boy', 'couchListen', 'neutral', 'seat'],
  ['17 Mom: the letter', 'mom', 'momLetter', 'sad', 'seat'], ['18 Boy leans to the window', 'boy', 'windowLean', 'determined', ''], ['19 Boy: small smirk', 'boy', 'smirk', 'smug', ''],
  ['20 Boy: arms out in the storm', 'boy', 'stormArms', 'determined', ''], ['21 Boy: rainbow, annoyed', 'boy', 'rainbowAnnoyed', 'annoyed', ''],
  ['22 Jaden under the umbrella', 'jayden', 'umbrella', 'neutral', ''], ['23 Jaden: umbrella zapped', 'jayden', 'umbrellaSmoke', 'shocked', ''],
  ['24 Boy: kick wind-up', 'boy', 'kickWind', 'determined', ''], ['25 Boy: kick', 'boy', 'kick', 'angry', ''], ['26 Jaden: can to the forehead', 'jayden', 'canHit', 'shocked', ''],
  ['27 Boy slaps coins down', 'boy', 'slapCoins', 'determined', ''], ['28 Clerk tears a card', 'm036', 'clerkTear', 'bored', ''], ['29 Boy scratches hard', 'boy', 'scratchHard', 'determined', ''],
  ['30 Jaden: slushie blast', 'jayden', 'slushie', 'shocked', ''], ['31 Clerk taps the sign', 'm036', 'clerkPoint', 'bored', ''], ['32 Boy: bruh', 'boy', 'deadpanBruh', 'bored', ''],
  ['33 Mom snaps to the door', 'mom', 'snapTo', 'scared', ''], ['34 Landlord knocks', 'm025', 'knockA', 'angry', ''],
  ['35 Jaden steps out of the car', 'jayden', 'carStep', 'smug', ''], ['36 Jaden fans the cash', 'jayden', 'fanCash', 'smug', ''], ['37 Boy beside Jaden', 'boy', 'smug', 'smug', ''],
];

// shot list (times = voice/words.json). Labels for validate(); the camera itself comes from the solver / CAM below.
const SH = [
  { t: 0.00, dur: 1.90, id: 'potHit', who: 'neighbor', size: 'wide', angle: 'low', move: 'punch', speed: 2.2 },
  { t: 1.90, dur: 1.06, id: 'cashGrin', who: 'neighbor', size: 'medium', angle: 'eye', move: 'pull', speed: 1.0 },
  { t: 2.96, dur: 1.24, id: 'mailman', who: 'mailman', size: 'wide', angle: 'eye', move: 'truckL', speed: 1.5 },
  { t: 4.20, dur: 0.82, id: 'hedgeFist', who: 'mailman', size: 'close', angle: 'eye', move: 'push', speed: 1.9 },
  { t: 5.02, dur: 1.90, id: 'lightning', who: 'neighbor', size: 'full', angle: 'low', move: 'orbitL', speed: 1.0 },
  { t: 6.92, dur: 1.36, id: 'balcony', who: 'neighbor2', size: 'wide', angle: 'low', move: 'craneUp', speed: 1.4 },
  { t: 8.28, dur: 1.12, id: 'poolTop', who: 'richman', size: 'wide', angle: 'top', move: 'craneDown', speed: .7 },
  { t: 9.40, dur: 1.26, id: 'jetCrash', who: 'richman', size: 'full', angle: 'low', move: 'pan', speed: 2.3 },
  { t: 10.66, dur: 1.74, id: 'soaked', who: 'richman', size: 'medium', angle: 'eye', move: 'push', speed: 1.1 },
  { t: 12.40, dur: 1.18, id: 'boyWalk', who: 'boy', size: 'full', angle: 'eye', move: 'track', speed: 2.0 },
  { t: 13.58, dur: 1.00, id: 'footIns', who: 'boy', size: 'feet', angle: 'low', move: 'hold', speed: .5 },
  { t: 14.58, dur: 1.16, id: 'jadenFall', who: 'jayden', size: 'medium', angle: 'eye', move: 'pan', speed: 2.1 },
  { t: 15.74, dur: 1.34, id: 'sprinkler', who: 'jayden', size: 'close', angle: 'low', move: 'push', speed: 1.6 },
  { t: 17.08, dur: 1.78, id: 'basketball', who: 'boy', size: 'medium', angle: 'eye', move: 'truckL', speed: .8 },
  { t: 18.86, dur: 1.36, id: 'momPat', who: 'mom', size: 'wide', angle: 'eye', move: 'hold', speed: .4 },
  { t: 20.22, dur: 1.52, id: 'momSad', who: 'mom', size: 'close', angle: 'eye', move: 'pull', speed: 1.9 },
  { t: 21.74, dur: 1.20, id: 'letter', who: 'mom', size: 'xclose', angle: 'high', move: 'punch', speed: 2.5 },
  { t: 22.94, dur: 1.88, id: 'window', who: 'boy', size: 'medium', angle: 'eye', move: 'truckR', speed: .6 },
  { t: 24.82, dur: .92, id: 'smirk', who: 'boy', size: 'close', angle: 'eye', move: 'pan', speed: 2.8 },
  { t: 25.74, dur: 2.30, id: 'storm', who: 'boy', size: 'wide', angle: 'top', move: 'craneDown', speed: .7 },
  { t: 28.04, dur: 2.32, id: 'rainStop', who: 'boy', size: 'medium', angle: 'high', move: 'craneUp', speed: 1.2 },
  { t: 30.36, dur: 1.34, id: 'rainbow', who: 'boy', size: 'wide', angle: 'eye', move: 'pull', speed: 2.0 },
  { t: 31.70, dur: .88, id: 'storeKick0', who: 'boy', size: 'full', angle: 'eye', move: 'push', speed: 2.4 },
  { t: 32.58, dur: 1.92, id: 'storeKick1', who: 'boy', size: 'wide', angle: 'low', move: 'hold', speed: .5 },
  { t: 34.50, dur: .60, id: 'cansIns', who: 'boy', size: 'xclose', angle: 'high', move: 'pull', speed: 1.7 },
  { t: 35.10, dur: 1.00, id: 'canHit', who: 'jayden', size: 'full', angle: 'eye', move: 'push', speed: 2.6 },
  { t: 36.10, dur: 1.84, id: 'ticket', who: 'boy', size: 'medium', angle: 'high', move: 'truckR', speed: .9 },
  { t: 37.94, dur: 1.14, id: 'loseFace', who: 'boy', size: 'close', angle: 'eye', move: 'hold', speed: .3 },
  { t: 39.08, dur: 1.68, id: 'jackpot', who: 'boy', size: 'xclose', angle: 'eye', move: 'punch', speed: 2.6 },
  { t: 40.76, dur: 1.96, id: 'cantCash', who: 'clerk', size: 'medium', angle: 'eye', move: 'hold', speed: .4 },
  { t: 42.72, dur: .74, id: 'landlordWalk', who: 'landlord', size: 'full', angle: 'low', move: 'pull', speed: 1.0 },
  { t: 43.46, dur: .88, id: 'clockPunch', who: 'boy', size: 'xclose', angle: 'high', move: 'push', speed: 2.1 },
  { t: 44.34, dur: .66, id: 'knockHall', who: 'mom', size: 'medium', angle: 'eye', move: 'hold', speed: .6 },
  { t: 45.00, dur: .72, id: 'landlord', who: 'landlord', size: 'medium', angle: 'low', move: 'punch', speed: 2.0 },
  { t: 45.72, dur: 1.48, id: 'carSlide', who: 'jayden', size: 'wide', angle: 'low', move: 'truckL', speed: 1.5 },
  { t: 47.20, dur: .74, id: 'carStep', who: 'jayden', size: 'medium', angle: 'eye', move: 'pull', speed: 1.8 },
  { t: 47.94, dur: .68, id: 'needMoney', who: 'jayden', size: 'close', angle: 'eye', move: 'push', speed: 1.1 },
  { t: 48.62, dur: 1.00, id: 'boltEnd', who: 'boy', size: 'wide', angle: 'eye', move: 'pan', speed: 2.4 },
  { t: 49.62, dur: 1.00, id: 'aftermath', who: 'jayden', size: 'medium', angle: 'low', move: 'push', speed: 1.2 },
  { t: 50.62, dur: 2.28, id: 'subscribe', who: 'jayden', size: 'close', angle: 'high', move: 'hold', speed: .4 },   // SUBSCRIBE PROMPT (Xavier 18:19): the lore character's selfie
];
export const SHOTS = SH;

// ---------------- world coordinates ----------------
const HA = { door: [3220.84, -231.39], walkZ: -233.1, lawn: [3226.5, -237.2], kerbZ: -241.4 };   // House A: front door leaf, front-walk line, lawn, road edge
const HB = { x: 3274, front: -232.4, kerbZ: -241.3 };                                          // lot B (the neighbor)
const MAN = { x: 3153, z: -350, ry: N / 2 }, POOL = { x: 3151, z: -327 };                       // mansion faces +x (its road at x 3167.7)
const STORE = { x: 3443, z: -250, ry: 0 }, SIN = { x: 9000, z: 30 };                           // store front faces +z (its road at z -239)
const mwl = (lx, lz) => [MAN.x + lz, MAN.z - lx];                                               // mansion local (x, z) -> world (ry = PI/2)
const pwl = (lx, lz) => [POOL.x + lz, POOL.z - lx];

export async function build({ scene, W: w, H: h, opts = {} }) {
  // ---------- sets ----------
  const t00 = performance.now();
  const T = await buildTown(scene, { interiors: true, furnish: ['entry', 'living'] });
  T.root.position.x += 3000; T.root.position.y += .45; scene.updateMatrixWorld(true);   // (Xavier 19:02 'everyone floats') the town is built at grade -.45: lift it so lawns/roads sit at 0 where every exterior shot stands; house floors become .45
  const H0 = T.houses.A, inner = H0.root.parent;
  const ROOMS = []; for (const [id, r] of Object.entries(H0.rooms)) { const a = inner.localToWorld(new THREE.Vector3(r.rect.x, r.y || 0, r.rect.z)), b = inner.localToWorld(new THREE.Vector3(r.rect.x + r.rect.w, r.y || 0, r.rect.z + r.rect.d)); ROOMS.push({ id, x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), z0: Math.min(a.z, b.z), z1: Math.max(a.z, b.z), y: a.y }); }
  console.error('ROOMS', ROOMS.map(r => `${r.id}:${r.x0.toFixed(1)}..${r.x1.toFixed(1)},${r.z0.toFixed(1)}..${r.z1.toFixed(1)}`).join(' '));
  // GROUND (Xavier 19:02: "everyone is floating"): the town is built at grade -.45 (lawns), roads -.415, footpaths -.39;
  // only house floors / porches / the mansion + store lots are at 0. Every actor and prop stands on the real surface under
  // it: a cached downward raycast into the town (horizontal hits only), 0 off the town map (mansion lot, store interior).
  const rcg = new THREE.Raycaster(), gmem = new Map(), DOWN = new THREE.Vector3(0, -1, 0);
  const ground = (x, z) => { if (x > 5000) return 0; if (x < 3171 && z < -309) return .45;   /* the lifted mansion lot */ const k = Math.round(x * 10) + ',' + Math.round(z * 10); if (gmem.has(k)) return gmem.get(k);
    rcg.set(new THREE.Vector3(x, 2.4, z), DOWN); rcg.far = 3.4; const h = rcg.intersectObject(T.root, true).find(q => q.object.isMesh && q.object.visible && !q.object.isInstancedMesh && q.face && q.face.normal.y > .7 && q.point.y < .62);
    const y = h ? h.point.y : 0; gmem.set(k, y); return y; };

  const LOT = .45;   // the mansion + pool lot rides up with the lifted town (at 0 the town lawn covered the pool)
  const man = mansionFront({ x: 0, z: 0 }); man.position.set(MAN.x, LOT, MAN.z); man.rotation.y = MAN.ry; scene.add(man);
  const pool = mansionPool({ x: 0, z: 0 }); pool.position.set(POOL.x, LOT, POOL.z); pool.rotation.y = MAN.ry; scene.add(pool);
  const store = await cornerStoreFront({ x: 0, z: 0 }); store.position.set(STORE.x, 0, STORE.z); store.rotation.y = STORE.ry; scene.add(store); scene.updateMatrixWorld(true); const VM = store.userData.vend;
  const storeIn = await cornerStoreInterior(scene, { x: SIN.x, z: SIN.z });
  const jet = await privateJet(); jet.scale.multiplyScalar(.4); scene.add(jet);
  const floaty = await poolFloaty(.42); floaty.position.set(POOL.x, LOT - .18, POOL.z + 1.2); scene.add(floaty);
  const car = await sportsCar(); scene.add(car);
  const rodHat = lightningRodHat(); scene.add(rodHat);
  const door = hingeDoor(scene, [HA.door[0], 1.77, HA.door[1]], { along: 'x', hinge: 1 });
  // lot B: a real hedge (Poly Haven shrub) along the verge, a window box with the pot under the upstairs window
  const hedge = LP.hedge({ w: 9 }); hedge.position.set(HB.x - 1.4, ground(HB.x - 1.4, HB.kerbZ + 1.3), HB.kerbZ + 1.3); scene.add(hedge);
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.1, .22, .28), new THREE.MeshStandardMaterial({ color: '#f1ece2', roughness: .6 })); box.position.set(HB.x - 1.5, 5.0, HB.front - .16); box.castShadow = true; scene.add(box);
  const pot = await LP.flowerpot(); pot.scale.multiplyScalar(1.3); scene.add(pot);   // a bigger pot: the hook object must read at frame 0
  // the boy's walk props
  const ac = LP.windowAC(); scene.add(ac); const peel = LP.bananaPeel(); peel.scale.setScalar(2.0); peel.position.set(3226.1, ground(3226.1, HA.walkZ - .15), HA.walkZ - .15); scene.add(peel);   // 2x: a real peel is tiny at our framing; it has to read in the feet insert
  const spr = LP.sprinkler(); spr.position.set(3224.35, ground(3224.35, HA.walkZ - .9), HA.walkZ - .9); scene.add(spr); const ball = LP.basketball(); scene.add(ball);
  // living room / hall
  const letter = LP.rentLetter(); scene.add(letter); const clock = LP.digitalClock(); scene.add(clock); const hallFill = new THREE.PointLight('#ffe2b8', 0, 5, 1.6); hallFill.position.set(HA.door[0] + .6, 2.65, -229.6); scene.add(hallFill);   // LED clock: 'FRI 4:58 -> 4:59' reads at any size (the analog one read as a grey circle)
  // storm
  const clouds = LP.stormClouds({ r: 22, y: 16 }); clouds.position.set(HA.lawn[0], 0, HA.lawn[1] - 2); scene.add(clouds);
  const smallCloud = LP.stormClouds({ r: 4, y: 14, seed: 9 }); smallCloud.position.set(HB.x - 3, 0, -236.5); scene.add(smallCloud);
  const rbow = LP.rainbow({ R: 9 }); scene.add(rbow); const umb = LP.umbrella(); scene.add(umb);
  // store props
  const cans = [0, 1, 2, 3, 4].map(() => { const c = LP.sodaCan(); c.scale.setScalar(1.4); scene.add(c); return c; });   // 1.4x: reads at the two-shot distance
  const card = LP.scratchCard(); scene.add(card);
  const drink = LP.poolDrink(); scene.add(drink);
  // RICH (Xavier: "the richest man in town" has to SELL rich, not just a man in a pool): gold floaty, a gold supercar on the
  // pool deck, gold bullion stacked on the edge, $100 bills floating all over the water.
  floaty.traverse(o => { if (o.isMesh && o.material) { o.material = o.material.clone(); const c = o.material.color; if (c && c.r > c.g * 1.4) { c.set('#f3b81c'); o.material.metalness = .7; o.material.roughness = .25; } } });
  const goldCar = await sportsCar(); goldCar.traverse(o => { if (o.isMesh && o.material) { o.material = o.material.clone(); const c = o.material.color; if (c && c.r > c.g * 1.4) { c.set('#e8ad1e'); o.material.metalness = .85; o.material.roughness = .22; } } }); scene.add(goldCar);
  const bars = [LP.goldBars([4, 3, 2]), LP.goldBars([3, 2, 1]), LP.goldBars([4, 3, 2, 1])]; bars.forEach(b => { b.scale.setScalar(1.6); scene.add(b); });
  const poolBills = new THREE.Group(); { const bm = new THREE.MeshStandardMaterial({ map: fxBillTex(), side: THREE.DoubleSide, roughness: .7 }), bg = new THREE.PlaneGeometry(.16, .07).rotateX(-Math.PI / 2);
    for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(bg, bm), a = (Math.sin(i * 12.9898) * 43758.5 % 1 + 1) % 1 * 6.283, r = .9 + ((Math.sin(i * 78.233) * 43758.5 % 1 + 1) % 1) * 3.2; m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r * 1.4); m.rotation.y = i * 1.7; m.scale.setScalar(1.6); poolBills.add(m); } }
  poolBills.position.set(POOL.x, LOT - .13, POOL.z); scene.add(poolBills);
  const fx = luckFX(scene, ground); const fan = cashFan(); scene.add(fan); console.error('SETS ms', (performance.now() - t00).toFixed(0));
  // Jaden's hair starts smoking after the bolt hits his umbrella (30.75) and never stops: carries through the rest of the video
  fx.smoke(30.9, 52.9, t => headOf(A.jayden).add(new THREE.Vector3(0, .13, -.04)).toArray());

  // ---------- light ----------
  const LOOK = dayLook(scene, { sunAz: 150, sunEl: 50, sun: 3.3, fill: .9 }), post = LOOK.post;
  // SUNNY (Xavier 2026-11-27 19:56: 'desaturated, depressing, not energetic' -> bright sunny day): richer colour, lighter
  // shadows (less blue tint), more sun + fill; storm shots keep their own darker exposure below.
  Object.assign(post, { saturation: 1.34, contrast: 1.1, tintAmt: .12, gain: [1.06, 1.02, .96] });
  const SKY = { day: ['#2a7ae8', '#d8eeff'], storm: ['#3a4250', '#6b7584'] }; let skyKey = '';
  const STORMT = [25.6, 30.36];
  const light = (t, s) => {
    const storm = t >= STORMT[0] && t < STORMT[1] && ['storm', 'rainStop'].includes(s.id), night = false;
    const k = storm ? 'storm' : 'day'; if (k !== skyKey) { skyKey = k; paintSky(LOOK.sky, ...SKY[k], null, new THREE.Vector3(.5, .3, .8).normalize()); }
    const indoor = ['momPat', 'momSad', 'letter', 'window', 'smirk', 'ticket', 'loseFace', 'jackpot', 'cantCash', 'clockIns', 'clockPunch', 'knockHall'].includes(s.id);
    const sub = A[s.who]?.a.root, faceAz = sub ? sub.rotation.y * 180 / Math.PI + 35 : 150;   // rule 8: a 3/4-front key on every face (exteriors follow the subject's facing)
    LOOK.setSun(storm ? faceAz + 60 : indoor ? 120 : faceAz, storm ? 40 : 52, { color: storm ? '#b8c4d8' : '#fff4dc', intensity: storm ? 1.2 : 4.0, fill: storm ? .7 : 1.25 });
    // the hole in the clouds: a warm shaft lands on the boy (28.4+)
    if (storm && t > 28.4) LOOK.setSun(faceAz, 72, { color: '#ffe6b8', intensity: 3.0, fill: .8 });
    const fl = fxState.flash; post.exposure = (storm ? 1.05 : indoor ? 1.3 : 1.36) + fl * .22;
    if (typeof couchShot === 'function') { const on = couchShot(t); roomKey.intensity = on ? 11 : 0; roomBounce.intensity = on ? .6 : 0; roomRim.intensity = on ? 3 : 0; if (on) { post.exposure = 1.05; post.contrast = 1.14; } else post.contrast = 1.1; }
    if (t > 30.72 && t < 31.1) post.exposure *= .5 + .5 * sm((t - 30.95) / .15);   // the daylight dims for the strike on Jaden so the bolt + his zap read against the bright wall
  };
  let fxState = { flash: 0 };

  // ---------- cast ----------
  const F = await J('topics/lucky_me/voice/flap.json'), flap = flapTrack(F, 0);
  const S = stage(scene, { POSES: P, ground, flap });
  const A = {}, mk = async (n, key, o) => (A[n] = await S.actor(key, o));
  await mk('boy', 'boy', { emo: 'neutral' }); await mk('jayden', 'jayden', { emo: 'neutral' }); await mk('mom', 'mom', { emo: 'happy' });
  await mk('neighbor', 'm021', { emo: 'shocked' }); await mk('richman', 'm038', { emo: 'smug' });
  await mk('mailman', 'mailman', { emo: 'happy' }); A.mailman.lift = addSkates(A.mailman.a, { shell: '#1d2430', accent: '#2f6fd6' });   /* the SAME inline skates as Sunset Tag (Xavier liked them there; the catalog pair looked wrong) */ await mk('clerk', 'm036', { emo: 'bored' }); await mk('landlord', 'm025', { emo: 'angry' });

  // Jaden gets richer + more beat up every day (SHOTS.md clue list). Each item worn once, hidden until its day,
  // never hidden again once shown: Tue sneakers, Wed chain+shades+bandage (covers Tue's bump), Fri arm cast.
  // FIX: the "Shoes" catalog category is modern layered clothing (WaistCenterAttachment, no foot attach in our ATTACH
  // map) -- generic .wear() parked it invisibly at the hip. wearFeet() (same split-mesh technique as the mailman's
  // skates) mounts it on the leg blocks where it's actually seen; tinted gold after load (plain sneaker texture).
  const jSneak = []; await wearFeet(A.jayden.a, 13553586060, { sink: .08, meshesOut: jSneak });
  for (const m of jSneak) m.material.color.set('#d9b24a');
  const jChain = await A.jayden.a.wear(72077516621155);
  const jShades = await A.jayden.a.wear(16704315434);
  const jBandage = await A.jayden.a.wear(123999376495769);
  // FIX: every "arm cast" catalog item is a modern layered accessory nominally on BodyFrontAttachment; our cage welder
  // dumped it on his belly (checked in a still, read as an illegible scribble). Mounted directly on his left forearm
  // instead (armL -- his right stays free for the cash fan), low on the limb like a real cast, elbow to wrist.
  const jCast = [await wearLimb(A.jayden.a, 14000502219, 'armL', { pos: [0, -.35, .12], rot: [0, 0, 0], scale: 1.9 })];
  for (const h of [...jSneak, ...jChain, ...jShades, ...jBandage, ...jCast]) h.visible = false;
  // (Xavier 18:41) his base outfit's NECK HEADPHONES (catalog 130568043270999, a rigid NeckAttachment accessory) sat on his
  // upper chest: the R15 neck point lands low on our R6 torso. Lift them up onto the neck, a touch back, so the cups ring it.
  { A.jayden.a.root.updateMatrixWorld(true); const tt = new THREE.Box3().setFromObject(A.jayden.a.rig.parts.torso).max.y, mine = new Set([...jChain, ...jShades, ...jBandage, ...jCast, ...jSneak]);
    A.jayden.a.root.traverse(o => { if (!o.isMesh || mine.has(o) || mine.has(o.parent)) return; const b = new THREE.Box3().setFromObject(o), cy = (b.min.y + b.max.y) / 2;
      if (o.name === 'geometry_0' && b.max.y < tt + .06 && cy > tt - .2) { const wp = o.getWorldPosition(new THREE.Vector3()); wp.y += .11; wp.z -= .03; o.position.copy(o.parent.worldToLocal(wp)); console.error('HEADPHONES moved'); } }); }
  const DAY = { tue: 31.7, wed: 36.1, fri: 45.7 };
  // WET (sprinkler 15.98 -> end of the walk): his clothes go darker + glossier, a pure function of t
  const jWet = []; { const hd = A.jayden.a.rig.parts.head; A.jayden.a.root.traverse(o => { if (!o.isMesh || !o.material || Array.isArray(o.material) || o.material === A.jayden.a.skinMat) return; for (let q = o; q; q = q.parent) if (q === hd) return; o.material = o.material.clone(); jWet.push([o.material, o.material.color.clone(), o.material.roughness]); }); }
  const wetT = t => { const w = t >= 15.98 && t < 18.86; for (const [m, c0, r0] of jWet) { m.color.copy(c0).multiplyScalar(w ? .58 : 1); m.roughness = w ? Math.min(r0, .35) : r0; } };
  const jadenLook = t => {
    for (const h of jSneak) h.visible = t >= DAY.tue;
    for (const h of [...jChain, ...jShades, ...jBandage]) h.visible = t >= DAY.wed;
    for (const h of jCast) h.visible = t >= DAY.fri && t < 50.6;   // off for the selfie (Xavier: 'what is that thing in his hand')
  };

  // ======================= STAGING =======================
  // --- 1-2: lot B front walk. The pot is already falling at frame 0; it lands at .45, the neighbor buckles, the poof at 1.95 ---
  const NB = [HB.x - 1.5, HB.front - .9];
  A.neighbor.show(-1, 2.96).show(5.02, 6.92);
  A.neighbor.key(-1, { pose: 'relaxed', at: NB, ry: N - .35 }).key(.42, { pose: 'potHit', dur: .12, style: 'snap' }).key(1.0, { pose: { ...P.potHit, head: { r: [0.3, 0.2, 0.2] } }, dur: .5 })
    .key(1.95, { pose: 'dazedGrin', ry: N - .1, turn: .4, dur: .3 }).key(2.4, { pose: { ...P.dazedGrin, head: { r: [-0.4, -0.1, 0.05] } }, dur: .4, ease: 'io' });
  // --- 3-4: the mailman skates east along the road edge in front of lot B, clips the kerb at 3.7, dives into the hedge ---
  // REDONE (Xavier: "frozen, frozen, then in a bush"): he SKATES (real travel, pushing strides) diagonally at the kerb,
  // the front wheels catch it at 3.72, he's launched head-first in an arc and lands upside down IN the hedge: only his
  // legs + skates stick out of the top, kicking. Everything below runs in extra() (after the key pose), pure function of t.
  A.mailman.show(2.96, 5.02); A.mailman.noClamp = true;
  const MP0 = [HB.x - 7.4, HB.kerbZ - 2.4], MP1 = [HB.x - 2.7, HB.kerbZ - .25], MH = [HB.x - 1.7, HB.kerbZ + 1.3], MRY = Math.atan2(MP1[0] - MP0[0], MP1[1] - MP0[1]), MCH = .95;
  A.mailman.key(2.9, { pose: t => P.mailSkate(t), at: MP0, ry: MRY }).key(3.72, { pose: 'skateClip', dur: .1, style: 'snap' }).key(4.0, { pose: 'hedgeLegs', dur: .12 });
  A.mailman.extra = (t, a) => {
    const R = a.a.root, L = a.a.rig.parts; R.rotation.order = 'YXZ';
    let cx, cz, cy, pitch;
    if (t < 3.72) { const u = cl((t - 2.9) / .82); cx = lerp(MP0[0], MP1[0], u); cz = lerp(MP0[1], MP1[1], u); const ph = (t - 2.9) * 2 * Math.PI * 1.7;
      cy = MCH + a.lift; pitch = 0; R.rotation.z = Math.sin(ph) * .05; }   // the stroke itself is the pose (P.mailSkate), wheels ON the road
    else if (t < 4.06) { const u = (t - 3.72) / .34; cx = lerp(MP1[0], MH[0], u); cz = lerp(MP1[1], MH[1], u); cy = lerp(MCH + a.lift, 1.1, u) + 1.0 * Math.sin(Math.PI * u); pitch = .3 + 2.8 * sm(u); R.rotation.z = u * .04; }
    else { const k = t - 4.06; cx = MH[0]; cz = MH[1]; cy = 1.1 - .1 * Math.exp(-k * 9) * Math.cos(k * 30); pitch = 3.1; R.rotation.z = .04 + Math.sin(t * 3) * .03;
      const kick = Math.sin(t * 13); L.legL.rotation.x += .45 * kick; L.legR.rotation.x -= .45 * kick; }   // stuck, legs kicking
    for (const k of ['torso', 'head', 'armL', 'armR']) if (L[k]) L[k].visible = t < 4.06;   // inside the hedge: only legs + skates stick out of the top
    cy += ground(cx, cz);   // on the road, not on y = 0
    R.rotation.y = MRY; R.rotation.x = pitch;
    const off = new THREE.Vector3(0, MCH, 0).applyEuler(R.rotation); R.position.set(cx - off.x, cy - off.y, cz - off.z); };
  // --- 5: lot B lawn, one dark cloud: three bolts on the neighbor (5.2, 5.75, 6.3), he ends charred ---
  const NL = [HB.x - 3, -236.5];
  A.neighbor.key(5.0, { pose: 'relaxed', at: NL, ry: -.4 }).key(5.2, { pose: 'zapped', dur: .05, style: 'snap' }).key(5.45, { pose: 'charred', dur: .2 }).key(5.75, { pose: 'zapped', dur: .05, style: 'snap' })
    .key(6.0, { pose: 'charred', dur: .2 }).key(6.3, { pose: 'zapped', dur: .05, style: 'snap' }).key(6.55, { pose: 'charred', dur: .25 });
  A.neighbor2 = await S.actor('m021', { emo: 'smug' });   // the same man, now rich, on his balcony (a second actor so his body stays on the lawn spans)
  A.neighbor2.show(6.92, 8.28);
  const BAL = mwl(0, 5.8);
  A.neighbor2.key(6.8, { pose: 'balconyLean', at: BAL, ry: MAN.ry, y: 3.9 });
  // charred + still smoking after the 3rd bolt (6.3): skin + clothes darkened (pure function of t, safe for out-of-order frames),
  // same man still singed on the balcony (shot 6). Hair smoke on both bodies.
  const sootK = .42, nbSkin0 = A.neighbor.a.skinMat.color.clone(), nbBody0 = A.neighbor.a.bodyMat.color.clone();
  const nb2Skin0 = A.neighbor2.a.skinMat.color.clone(), nb2Body0 = A.neighbor2.a.bodyMat.color.clone();
  const sootT = t => { const k = t >= 6.3 ? sootK : 1; A.neighbor.a.skinMat.color.copy(nbSkin0).multiplyScalar(k); A.neighbor.a.bodyMat.color.copy(nbBody0).multiplyScalar(k);
    A.neighbor2.a.skinMat.color.copy(nb2Skin0).multiplyScalar(sootK); A.neighbor2.a.bodyMat.color.copy(nb2Body0).multiplyScalar(sootK); };
  fx.smoke(6.3, 6.92, t => headOf(A.neighbor).add(new THREE.Vector3(0, .13, 0)).toArray());
  fx.smoke(6.92, 8.28, t => headOf(A.neighbor2).add(new THREE.Vector3(0, .13, 0)).toArray());
  // --- 7-9: the richest man on the floaty; the jet nose-dives into the pool behind him at 9.85; soaked, sips, the poof ---
  A.richman.show(8.28, 12.4);
  await A.richman.a.wear(72077516621155); await A.richman.a.wear(16704315434);   // gold chain + shades on the richest man
  goldCar.position.set(3151.6, LOT, -336.4); goldCar.rotation.y = .08;   // gold supercar parked on the far deck: behind him in the jet + soaked shots
  bars[0].position.set(3154.35, LOT, POOL.z + 2.4); bars[1].position.set(3154.4, LOT, POOL.z - .2); bars[2].position.set(3154.4, LOT, POOL.z - 2.9); bars.forEach((b, i) => { b.rotation.y = .2 * i; b.scale.setScalar(2.6); });
  A.richman.key(8.2, { pose: 'floaty', at: [POOL.x, POOL.z + 1.2], ry: 0, y: .12 }).key(10.7, { pose: 'soaked', dur: .4 }).key(11.4, { pose: { ...P.soaked, head: { r: [0.05, -0.05, 0] } }, dur: .35, ease: 'io' });
  // --- 10-14: the boy walks west along House A's front walk; the AC lands where he just stepped (12.95); he steps over the peel;
  //     Jaden right behind slips (14.75), lands by the sprinkler (15.95 it pops up), pockets the small poof; the basketball (17.5) ---
  A.boy.show(12.4, 42.72).show(44.34, 45.0).show(48.62, 50.62);
  A.boy.run(12.2, [[3229.9, HA.walkZ - .15], [3227.2, HA.walkZ - .15], [3223.0, HA.walkZ - .15]], { step: .82, T: .3, arm: .6 });   // brisk: past the peel ~13.8, stopped 1.4 m ahead before Jaden slips (they overlapped side-on)
  A.boy.key(14.5, { pose: 'relaxed', at: [3223.0, HA.walkZ - .15], ry: -N / 2, dur: .3 }).key(15.9, { pose: { ...P.relaxed, head: { r: [0.05, -0.5, 0] } }, dur: .4 })
    .key(17.25, { pose: 'bendShoe', ry: -N / 2 + .4, turn: .3, dur: .25 }).key(18.2, { pose: 'relaxed', dur: .4 });
  A.jayden.show(13.58, 18.86);
  // FIX (Xavier: he "froze" before the fall): this walk plan used to run to t1~14.90, which ATE the 14.72 slipFall key's
  // whole blend window -- the walk pose overrides keyed poses for as long as it's active, so the fall never eased in,
  // it just popped the instant the walk ended. Longer stride, same path/arrival: he finishes walking ~.3s before he slips.
  A.jayden.run(13.2, [[3228.6, HA.walkZ - .15], [3227.2, HA.walkZ - .15], [3226.4, HA.walkZ - .15]], { step: .85, T: .3, arm: .6 });
  // the slipFall key was the FIRST key() this actor ever got (the walk before it was a .run(), which doesn't add one) --
  // poseAt() skips all blending for an actor's first key (i===0 special case), so without a key to blend FROM, the fall
  // popped in fully formed the instant it started instead of easing in over its own .18s dur. This holding key gives it
  // a real prev pose, and glide carries his position smoothly into the stumble instead of teleporting the last .7 studs.
  A.jayden.key(14.42, { pose: 'relaxed', at: [3226.4, HA.walkZ - .15], ry: -N / 2 });
  A.jayden.key(14.72, { pose: 'slipFall', at: [3225.7, HA.walkZ - .2], ry: -N / 2, dur: .18, glide: .18, style: 'snap' }).key(15.2, { pose: 'sitHit', at: [3224.45, HA.walkZ - .3], ry: -2.0, turn: .35, dur: .3 })   /* lands where slipFall threw him (its root offset carries him ~1.1 m): no pop */
    // (Xavier 18:19) the sprinkler soaks him -> hand over his face ("bro...") -> he gets up -> THEN the money
    .key(15.95, { pose: { ...P.sitHit, head: { r: [-.75, 0, .1] } }, dur: .08, style: 'snap' }).key(16.15, { pose: t => P.facepalm(t), dur: .22 })
    .key(16.5, { pose: 'pushUp', at: [3224.5, HA.walkZ - .4], dur: .25, ease: 'io' }).key(16.78, { pose: 'relaxed', at: [3224.6, HA.walkZ - .5], ry: -1.9, dur: .25 }).key(16.95, { pose: 'smug', dur: .2 }).key(17.5, { pose: 'ballHitHead', dur: .1, style: 'snap' }).key(18.1, { pose: 'relaxed', dur: .5 });
  // --- 15-19: living room. Mom pats the couch, the boy sits; her talk with the letter; he goes to the window, smirks ---
  const SOFA = [3224.0, -225.95];
  A.mom.show(18.86, 22.94);
  A.mom.key(18.7, { pose: 'momPat', at: [SOFA[0] + .9, SOFA[1]], ry: N, y: .22 }).key(19.8, { pose: 'momLetter', dur: .4 }).key(20.6, { pose: 'momSad', dur: .5 });
  A.mom.talk(20.22, 22.8);
  /* Xavier 20:37: living-room light was flat + grey. A warm afternoon window key from the front window (3/4 front, camera-left of the faces) with
     real shadows, a soft warm bounce from the floor side, and a cool sky rim from behind so they cut out of the wall. Only in the couch shots. */
  const roomKey = new THREE.SpotLight('#ffe8cc', 0, 9, .75, .55, 1.4); roomKey.position.set(SOFA[0] + 2.2, 2.75, SOFA[1] - 3.2); roomKey.target.position.set(SOFA[0] + .35, 1.2, SOFA[1]);
  roomKey.castShadow = true; roomKey.shadow.mapSize.set(1024, 1024); roomKey.shadow.bias = -.0006; roomKey.shadow.camera.near = .3; scene.add(roomKey, roomKey.target);
  const roomBounce = new THREE.PointLight('#ffcf9a', 0, 5, 1.6); roomBounce.position.set(SOFA[0] + .4, .9, SOFA[1] - 1.6); scene.add(roomBounce);
  const roomRim = new THREE.PointLight('#bcd4ff', 0, 4, 1.6); roomRim.position.set(SOFA[0] - .6, 2.4, SOFA[1] + 1.1); scene.add(roomRim);
  const couchShot = t => t >= 18.86 && t < 22.94;
  A.boy.key(18.85, { pose: 'couchSit', at: [SOFA[0] - .2, SOFA[1]], ry: N, y: .22, dur: .01 }).key(19.4, { pose: 'couchListen', dur: .4 });
  const WIN = [3226.9, -230.6];   // the living room's east front window (clap_cops: Dad stretched in front of it)
  // "I needed one bad thing" (Xavier 18:19): alone on a chair at the front window, the THINKER (back arched, elbows on knees,
  // chin on his hands). The back pan has the whole room to travel in; the front pan sits between him and the glass.
  const CH = [WIN[0] - .3, WIN[1] + 1.25]; const chair = FU.diningChair({ wood: new THREE.MeshStandardMaterial({ color: '#6b4a32', roughness: .55 }), seat: new THREE.MeshStandardMaterial({ color: '#3f5a7a', roughness: .85 }) }); chair.position.set(CH[0], ground(CH[0], CH[1] - .3), CH[1] - .3); chair.rotation.y = N; scene.add(chair);   // seat centre under his hips (measured)
  A.boy.key(22.94, { pose: 'thinker', at: CH, ry: N, y: .0, dur: .01 }).key(24.75, { pose: 'thinkSmirk', dur: .3 });
  // --- 20-22: House A lawn, storm. Arms out; the hole opens over him at 28.4, the rain stops in a circle; rainbow lands 30.4.
  //     BG: Jaden on the sidewalk under an umbrella; bolt hits the umbrella at 30.75, small poof ---
  A.boy.key(25.74, { pose: 'stormArms', at: HA.lawn, ry: N, dur: .01 }).key(26.6, { pose: { ...P.stormArms, head: { r: [-0.75, 0.1, 0.05] } }, dur: .8, ease: 'io' })
    .key(30.4, { pose: 'rainbowAnnoyed', dur: .3 });
  A.jayden.show(25.74, 31.7);
  const JU = [3228.6, HA.kerbZ + .6];   // in the rainbow shot's frame, not on its edge
  A.jayden.key(25.6, { pose: 'umbrella', at: JU, ry: -.9 }).key(30.75, { pose: 'zapped', dur: .05, style: 'snap' }).key(31.05, { pose: 'charred', dur: .25 });   // (Xavier 18:19) the rainbow lands on the boy, the BOLT lands on Jaden
  // --- 23-26: store front. Wind-up, kick (32.6), the machine rocks; cans drop 1-5 (34.5-35.2); can 5 shoots out and hits Jaden (35.45) ---
  const vend = (() => { const v = new THREE.Vector3(-2.6, 0, 1.55).applyAxisAngle(new THREE.Vector3(0, 1, 0), STORE.ry); return [STORE.x + v.x, STORE.z + v.z]; })();
  const KICK = [vend[0] + .1, vend[1] + 1.15];
  A.boy.key(31.7, { pose: 'kickWind', at: KICK, ry: N - .55, dur: .01 }).key(32.55, { pose: 'kick', dur: .12, ease: 'io' }).key(33.0, { pose: 'standBack', dur: .4 });
  // he steps back to the side (real steps) so the tray -> Jaden line is clear for the 5th can
  const SIDE = [vend[0] + 1.05, vend[1] + .65]; A.boy.run(33.05, [KICK, SIDE], { step: .5, T: .32, arm: .4 }); A.boy.key(33.95, { pose: 'standBack', ry: -1.41, turn: .35 });
  A.jayden.show(31.7, 36.1); A.jayden.key(31.7, { pose: 'standBack', at: [vend[0] - 1.1, vend[1] + 1.4], ry: 2.22, dur: .01 });   // there from the first store frame (he popped in at 32.58)
  A.jayden.key(32.5, { pose: 'standBack', at: [vend[0] - 1.1, vend[1] + 1.4], ry: 2.22 }).key(35.45, { pose: 'canHit', dur: .08, style: 'snap' }).key(35.8, { pose: { ...P.canHit, head: { r: [-.2, .1, -.15] } }, dur: .3 });
  // --- 27-30: inside the store. Coins down, the clerk tears a card; scratching; JACKPOT (39.1); the sign; bruh. BG: Jaden at the slushie ---
  const sin = (lx, lz) => [SIN.x + lx, SIN.z + lz];
  A.boy.key(36.1, { pose: 'slapCoins', at: sin(.55, -.35), ry: N / 2 - .45, dur: .01 }).key(37.7, { pose: 'relaxed', ry: N / 2 - .95, turn: .3, dur: .3 }).key(36.7, { pose: 'relaxed', dur: .3 }).key(37.9, { pose: 'scratchHard', dur: .2 })
    .key(38.15, { pose: 'scratchB', dur: .08, ease: 'io' }).key(38.3, { pose: 'scratchHard', dur: .08, ease: 'io' }).key(38.45, { pose: 'scratchB', dur: .08, ease: 'io' }).key(38.6, { pose: 'scratchHard', dur: .08, ease: 'io' })
    .key(38.75, { pose: 'scratchB', dur: .08, ease: 'io' }).key(39.08, { pose: 'jackpotFace', dur: .1, style: 'snap' }).key(40.76, { pose: 'deadpanBruh', dur: .3 });
  A.clerk.show(36.1, 42.72);
  A.clerk.key(36.0, { pose: 'relaxed', at: sin(1.95, -.45), ry: -N / 2 + .45 }).key(36.4, { pose: 'clerkTear', dur: .3 }).key(37.6, { pose: 'relaxed', dur: .4 }).key(40.9, { pose: 'clerkPoint', dur: .3 });
  A.jayden.show(36.1, 42.72);
  A.jayden.key(36.1, { pose: 'relaxed', at: sin(-1.6, -.85), ry: N + .3, dur: .01 })   /* was 36.0: he vanished from the exterior can shot for a frame + the key light swung (the 'blue house') */.key(39.1, { pose: 'slushie', dur: .08, style: 'snap' }).key(39.6, { pose: { ...P.slushie, head: { r: [.1, .3, 0] } }, dur: .4 });
  // --- 31-34: Friday. The entry clock 4:58 -> 4:59; three knocks (44.45, 44.7, 44.95) shake the door; Mom and the boy snap to it; the landlord ---
  A.mom.show(44.34, 45.0); A.boy.show(44.34, 45.0); A.landlord.show(42.6, 43.46); A.landlord.show(45.0, 45.72);
  /* Xavier 20:24: 'Friday' = the landlord marching up the path to the door; '4:59' = the clock zoom; 'the landlord' = mom + son shocked; then the knock */
  A.landlord.key(42.5, { pose: 'relaxed', at: [HA.door[0] - .1, HA.door[1] - 5.4], ry: 0 });
  A.landlord.run(42.55, [[HA.door[0] - .1, HA.door[1] - 5.4], [HA.door[0] - .1, HA.door[1] - 3.7]], { step: .72, T: .34, arm: .5 });
  A.mom.key(44.2, { pose: 'relaxed', at: [3219.7, -228.7], ry: N + .6 }).key(44.5, { pose: 'snapTo', ry: N + .15, turn: .2, dur: .15, style: 'snap' });
  A.boy.key(44.2, { pose: 'relaxed', at: [3220.65, -228.3], ry: N + .7 }).key(44.55, { pose: 'snapTo', ry: N + .1, turn: .2, dur: .15, style: 'snap' });
  A.landlord.key(44.9, { pose: 'knockA', at: [HA.door[0] - .1, HA.door[1] - 1.25], ry: 0 }).key(45.15, { pose: 'knockB', dur: .07, ease: 'io' }).key(45.3, { pose: 'knockA', dur: .07, ease: 'io' }).key(45.45, { pose: 'knockB', dur: .07, ease: 'io' });
  // --- 35-38: the kerb in front of House A. The car slides in (45.8-46.9); Jaden steps out (47.2); fans the cash; the boy steps up beside him; the bolt (49.0) ---
  const CARP = [3223.5, HA.kerbZ - 1.25];
  A.landlord.show(45.72, 47.2);
  A.landlord.key(45.72, { pose: 'relaxed', at: [3222.3, -236.4], ry: N, dur: .01 }).key(46.5, { pose: { ...P.relaxed, head: { r: [0.05, .4, 0] } }, ry: N - .6, turn: .4, dur: .4 });
  A.jayden.show(47.2, 52.9);
  A.jayden.key(47.1, { pose: 'carStep', at: [CARP[0] - .4, CARP[1] + 1.15], ry: 0 }).key(47.6, { pose: 'smug', dur: .3 }).key(47.94, { pose: 'fanCash', dur: .25 });
  A.jayden.talk(47.94, 48.62);
  A.boy.show(48.62, 50.62);
  A.boy.key(48.5, { pose: 'relaxed', at: [CARP[0] + .55, CARP[1] + 1.2], ry: -.2 }).key(48.75, { pose: 'smug', dur: .2 })
    .key(49.03, { pose: 'zapped', dur: .06, style: 'snap' }).key(49.4, { pose: 'charred', dur: .35 });
  // THE STRIKE LANDS (Xavier: it cut before the lightning finished): bolt on the car 49.0 -> blast + fire + both boys jolted and
  // singed; then the payout pours out of the burning car (49.62): the unluckiest kid just got richer again. Cut mid-rain.
  A.jayden.key(49.03, { pose: 'zapped', dur: .06, style: 'snap' }).key(49.5, { pose: 'fanCash', dur: .35 }).key(50.62, { pose: t => P.selfieWave(t), at: [CARP[0] - .4, CARP[1] + 2.5], ry: 0, dur: .01 });
  A.jayden.talk(50.62, 52.6);   // his own line: 'subscribe for more, you guys' (Xavier's recording)   // a step clear of the burning car (he clipped into it)
  A.boy.key(50.62, { pose: { ...P.charred, head: { r: [0.05, -0.35, 0] } }, dur: .01 });   // the singed boy deadpans in the back of Jaden's selfie
  fx.fire(49.03, 53.0, [CARP[0], .8, CARP[1] - .2], { w: 3.4, d: 1.2, h: 1.8, n: 90, burst: 1 });
  fx.poof(49.62, [CARP[0] + .2, 1.5, CARP[1] + .9], 1.1); fx.cashRain(49.62, 50.2, [CARP[0] + .35, 0, CARP[1] + 1.2], { r: 1.3, n: 110, top: 3.4 });
  fx.smoke(49.1, 52.62, t => headOf(A.boy).add(new THREE.Vector3(0, .13, -.02)).toArray());
  const boySkin0 = A.boy.a.skinMat.color.clone(), jSkin0 = A.jayden.a.skinMat.color.clone();
  const carMats = []; car.traverse(o => { if (o.isMesh && o.material && !Array.isArray(o.material)) { o.material = o.material.clone(); carMats.push([o.material, o.material.color.clone()]); } });
  const endT = t => { const k = t >= 49.03 ? .45 : 1; A.boy.a.skinMat.color.copy(boySkin0).multiplyScalar(k); A.jayden.a.skinMat.color.copy(jSkin0).multiplyScalar(t >= 49.03 ? .6 : (t >= 30.78 && t < 31.7) ? .5 : 1);
    for (const [m, c0] of carMats) m.color.copy(c0).multiplyScalar(t >= 49.03 ? .28 : 1); };
  // faces on the beats (brows first: act.js face keys)
  A.boy.face(12.3, 'happy').face(17.2, 'neutral').face(19.3, 'neutral').face(21.0, 'sad').face(22.9, 'nervous').face(24.82, 'thinking').face(25.7, 'determined')
    .face(30.36, 'annoyed').face(31.6, 'determined').face(32.55, 'angry').face(36.0, 'determined').face(39.08, 'shocked').face(40.76, 'bored').face(44.5, 'scared').face(48.5, 'smug').face(49.0, 'shocked');
  A.jayden.face(13.5, 'happy').face(14.72, 'shocked').face(15.95, 'shocked').face(16.9, 'happy').face(17.5, 'shocked').face(17.9, 'smug').face(25.6, 'neutral').face(30.75, 'shocked').face(32.5, 'happy')
    .face(35.45, 'shocked').face(35.9, 'smug').face(36.0, 'happy').face(39.1, 'shocked').face(39.7, 'smug').face(47.1, 'smug').face(49.03, 'shocked').face(49.5, 'smug').face(50.6, 'happy');
  A.mom.face(18.7, 'happy').face(20.0, 'sad').face(44.5, 'scared');
  A.neighbor.face(-1, 'happy').face(.42, 'shocked').face(1.95, 'happy').face(5.0, 'happy').face(5.2, 'shocked');

  // ---------- props + FX timeline (pure functions of t) ----------
  const POTF = [NB[0] + .05, NB[1] - .05], POTY0 = 5.05;
  // HOOK (Xavier: first 2 s = an action that LANDS): the pot shatters on his head at .42 -- shards, soil, leaves
  fx.shatter(.42, [POTF[0], 1.92, POTF[1]]);
  // "...the RICHER you get" (2.06): cash erupts right in front of him and keeps raining through the shot
  fx.poof(1.95, [NB[0], 1.5, NB[1] - .35], .9); fx.cashRain(1.95, 2.9, [NB[0], 0, NB[1] - .2], { r: 1.0, n: 90, top: 3.1 });
  fx.poof(4.32, [HB.x - 1.7, 1.5, HB.kerbZ + 1.1], .85);
  fx.shatter(12.95, [3229.3, .1, HA.walkZ + .5], { n: 18, color: '#cfc9ba', inner: '#8d8a82', soil: '#5c5a55', leaf: '#8d8a82', v: 2.4 });   // the AC smashes: casing chips + grille bits   // cash bursts out of the hedge around his kicking skates
  fx.bolt(5.2, [NL[0], 0, NL[1]], { seed: 1, top: 14 }); fx.bolt(5.75, [NL[0], 0, NL[1]], { seed: 2, top: 14 }); fx.bolt(6.3, [NL[0], 0, NL[1]], { seed: 3, top: 14 });
  fx.splash(9.85, [POOL.x, LOT - .1, POOL.z - 3.4]); fx.poof(11.36, [POOL.x, LOT + 1.3, POOL.z + 1.9], 1.1); fx.cashRain(11.3, 12.35, [POOL.x + .3, LOT, POOL.z + 2.0], { r: 1.6, n: 170, top: 3.6 });   // "FIFTY MILLION": the poof lands ON the word, cash pours down on him
  fx.poof(16.92, [3224.6, 1.25, HA.walkZ - .9], .55); fx.poof(17.55, [3224.6, 1.7, HA.walkZ - .5], .5);
  fx.spray(15.95, 16.45, [3224.35, .15, HA.walkZ - .9], [0, 1, .42], { n: 380, v: 4.1, size: .06, color: '#f2f9ff', streak: true });   // a real jet arcing onto him (streaks, not beads)   // a full jet, right in his face
  fx.rain({ x: HA.lawn[0], z: HA.lawn[1] - 1, r: 13, h: 8, t0: 25.6, t1: 30.36, hole: [28.4, 4.2], stopFade: [28.3, 30.2] });   // whole field thins to nothing by the cut, not just the sunbeam patch
  fx.bolt(30.75, [JU[0], 1.95, JU[1]], { seed: 7, top: 9, spread: .8 }); /* straight down onto him, inside the frame */ fx.smoke(30.8, 31.7, t => headOf(A.jayden).add(new THREE.Vector3(0, .13, 0)).toArray(), { n: 16, per: 1.3, size: .85, color: '#6b6762', alpha: .9 }); fx.smoke(30.8, 31.7, t => headOf(A.jayden).add(new THREE.Vector3(0, -.45, 0)).toArray(), { n: 10, per: 1.5, size: .7, color: '#77726d', alpha: .8 });   // he SMOKES after the bolt: hair + body
  fx.poof(35.5, [vend[0] - 1.1, 1.8, vend[1] + 1.4], .6);
  fx.spray(39.1, 39.45, [sin(-1.7, -1.35)[0], 1.35, sin(-1.7, -1.35)[1]], [0, .2, 1], { color: '#2f7fe0', n: 70, v: 3.0, size: .07 });
  fx.poof(39.4, [sin(-1.7, -.75)[0], 1.5, sin(-1.7, -.75)[1]], .45);
  fx.bolt(49.0, [CARP[0], 1.1, CARP[1]], { seed: 11, top: 18 });
  const JET0 = new THREE.Vector3(POOL.x - 1, 26, POOL.z - 42), JET1 = new THREE.Vector3(POOL.x, LOT - .6, POOL.z - 3.4);
  const props = (t, s) => {
    // pot: falling from the window box (already mid-fall at frame 0), smashed on his head at .42, shards drop away
    pot.visible = t < .43; { const u = cl((t + .25) / .67); pot.position.set(POTF[0], lerp(POTY0 - .25, 1.95, u * u), POTF[1]); pot.rotation.set(u * 1.2, 0, u * .4); if (t > .42) { const k = t - .42; pot.position.y = Math.max(0, 1.95 - 4.9 * k * k); pot.position.x = POTF[0] + k * .8; pot.rotation.x = 1.2 + k * 6; } }
    // the AC: drops from House A's upstairs window just behind the boy, lands at 12.95
    ac.visible = t > 12.3 && t < 18.86; { const u = cl((t - 12.62) / .33); ac.position.set(3229.3, lerp(5.0, 0, u * u), HA.walkZ + .5); ac.rotation.set(0, .3, u * .25); }   // lands just behind him, house side, in his own shot
    // the peel shoots out from under Jaden's foot (14.66) and skids away
    { const k = cl((t - 14.66) / .35); peel.position.set(3226.1 - k * 1.1, Math.sin(k * Math.PI) * .18, HA.walkZ - .15 - k * .25); peel.rotation.y = k * 5; }
    // sprinkler riser pops at 15.95
    { const up = cl((t - 15.95) / .08); spr.userData.riser.forEach(m => m.scale.y = .25 + .75 * up); }
    // basketball: from the street, past the boy's head (he bends at 17.25), into Jaden's head at 17.5, bounce off
    ball.visible = t > 16.9 && t < 18.86; { const B0 = new THREE.Vector3(3220.6, 2.9, HA.walkZ - 3.2), B1 = new THREE.Vector3(3224.6, 1.75, HA.walkZ - .5), u = (t - 16.95) / .55;
      if (u < 1) { ball.position.lerpVectors(B0, B1, u); ball.position.y += Math.sin(u * Math.PI) * .5; } else { const k = t - 17.5; ball.position.set(B1.x - k * 1.6, Math.max(.12, 1.75 + 3 * k - 4.9 * k * k), B1.z - k * 2.2); } ball.rotation.x = t * 9; }
    // the letter in Mom's right hand (attached each frame below), the clock in the entry
    { const hh = 4, mm = t < 43.42 ? 58 : 59, ss = t < 43.42 ? 57 + (t - 42.72) * 4 : (t - 43.42) * 1.5; clock.userData.setTime(hh, mm, ss); clock.position.set(HA.door[0] + .05, 2.85, -231.22); clock.rotation.y = 0;   /* on the entry's front wall, facing in */ clock.visible = t > 42.5 && t < 45.1; hallFill.intensity = clock.visible ? 2.2 : 0; }
    // door rattles on the knocks
    { let a = 0; for (const k of [44.45, 44.7, 44.95, 45.2, 45.45]) if (t > k && t < k + .12) a = -.025 * Math.sin((t - k) / .12 * Math.PI); door.set(a); }
    // storm: clouds visible during the storm shots; the hole opens at 28.4; rainbow from 30.4
    clouds.visible = t >= 25.6 && t < 31.7; clouds.userData.hole(cl((t - 28.4) / .8), 6);
    smallCloud.visible = t >= 5.02 && t < 6.92;
    rbow.visible = t > 30.36 && t < 31.7; rbow.userData.grow(cl((t - 30.36) / .5)); rbow.position.set(HA.lawn[0] + 9, 0, HA.lawn[1] + .2); rbow.rotation.y = 0;
    umb.visible = t >= 25.74 && t < 31.7;
    // jet: comes down nose-first behind the man (9.4 -> 9.85), stays stuck tail-up
    jet.visible = t > 9.3 && t < 12.4; { const u = cl((t - 9.4) / .45); jet.position.lerpVectors(JET0, JET1, u * u); jet.rotation.set(-1.05, MAN.ry + N, 0); }
    // floaty under the rich man, bobbing
    floaty.position.y = LOT - .18 + Math.sin(t * 2.2) * .02 + (t > 9.85 && t < 10.6 ? Math.sin((t - 9.85) * 14) * .12 * (1 - (t - 9.85) / .75) : 0);
    // the machine: rocks hard after the kick (32.6), rumbles as the cans drop, and SHAKES before it fires can 5 (35.25)
    { let r = 0; if (t > 32.6) r += .06 * Math.exp(-(t - 32.6) * 3.5) * Math.sin((t - 32.6) * 34); if (t > 34.4 && t < 35.3) r += .014 * Math.sin(t * 61) * (1 + 3 * cl((t - 34.95) / .3)); VM.rotation.z = r; VM.rotation.x = r * .35; }
    // the cans: 1..5 drop into the tray (34.5 + .14 each), can 5 shoots out at 35.25 to Jaden's forehead (35.45)
    const tray = VM.localToWorld(new THREE.Vector3(0, .12, .47));
    cans.forEach((c, i) => { const td = 34.4 + i * .14; c.visible = t > td - .08 && t < 36.1; const u = cl((t - td) / .12); { const q = VM.localToWorld(new THREE.Vector3(-.16 + i * .08, lerp(.25, .12, u), lerp(.3, .47, u))); c.position.copy(q); } c.rotation.set(N / 2, 0, i * .7);
      if (i === 4 && t > 35.25) { const k = cl((t - 35.25) / .2), J = new THREE.Vector3(vend[0] - 1.1, 1.78, vend[1] + 1.4); c.position.lerpVectors(tray, J, k); c.rotation.set(t * 20, 0, t * 9); if (t > 35.45) { const q = t - 35.45; c.position.set(J.x - q, Math.max(.04, 1.78 + 1.5 * q - 4.9 * q * q), J.z + q * .5); } } });
    // the scratch card: torn off the roll (36.6), in the boy's hands from 36.8, scratched 37.9 -> 39.05
    card.userData.scratch(cl((t - 37.9) / 1.15)); card.visible = t > 36.5 && t < 42.72;
    // the car slides in to the kerb (45.8 -> 46.9), nose = travel direction (-x), then parked
    car.visible = t > 45.72; { const u = cl((t - 45.8) / 1.1), e = 1 - (1 - u) ** 3; car.position.set(lerp(3238, CARP[0], e), t > 49.03 ? Math.max(0, .35 * Math.sin((t - 49.03) * 9) * Math.exp(-(t - 49.03) * 4)) : 0, CARP[1]); car.rotation.y = -N / 2 + (1 - e) * .25 * Math.sin(u * N); }
    // the lightning-rod hat on the balcony neighbor's head
    rodHat.visible = t >= 6.92 && t < 8.28;
    jadenLook(t); sootT(t); endT(t); wetT(t);
  };

  // hands holding props (each frame, after the pose): letter in Mom's right hand, the card between the boy's hands, umbrella in Jaden's right hand
  const handOf = (a, side) => { const p = a.a.rig.parts['arm' + side]; p.updateMatrixWorld(true); const q = p.getWorldQuaternion(new THREE.Quaternion()), pos = new THREE.Vector3(0, -.75, 0).applyMatrix4(p.matrixWorld); return { p: pos, q }; };
  const holds = t => {
    if (t > 19.8 && t < 22.94) { const H = handOf(A.mom, 'R'); letter.visible = true; letter.position.copy(H.p).add(new THREE.Vector3(0, .24, 0)); letter.quaternion.copy(H.q); letter.rotateX(-N / 2 + .2); } else letter.visible = false;
    if (t > 36.8 && t < 42.72) { const L = handOf(A.boy, 'L'), R = handOf(A.boy, 'R'); card.position.copy(L.p).lerp(R.p, .5).add(new THREE.Vector3(0, .12, 0)); card.quaternion.copy(L.q); card.rotateX(-N / 2 + .5); }
    else if (t > 36.5) { const H = handOf(A.clerk, 'R'); card.position.copy(H.p); card.quaternion.copy(H.q); card.rotateX(-N / 2); }
    drink.visible = t >= 8.28 && t < 12.4; if (drink.visible) { const H = handOf(A.richman, 'R'); drink.position.copy(H.p).add(new THREE.Vector3(0, .04, 0)); drink.quaternion.copy(H.q); drink.rotateX(N); }
    fan.visible = t >= 47.9 && t < 50.6; if (fan.visible) { const H = handOf(A.jayden, 'R'); fan.position.copy(H.p).add(new THREE.Vector3(0, .08, 0)); fan.quaternion.copy(H.q); fan.rotateX(N / 2); }
    if (umb.visible) { const H = handOf(A.jayden, 'R'); umb.position.copy(H.p); umb.quaternion.copy(H.q); umb.rotateX(N); }
    if (rodHat.visible) { const hd = A.neighbor2.a.rig.parts.head; hd.updateMatrixWorld(true); rodHat.position.copy(hd.getWorldPosition(new THREE.Vector3())).add(new THREE.Vector3(0, .32, 0)); rodHat.quaternion.copy(hd.getWorldQuaternion(new THREE.Quaternion())); }
  };

  // ---------- camera ----------
  const bad = validate(SH); if (bad.length) console.error('SHOTS', bad.join('; '));
  const cam = new THREE.PerspectiveCamera(32, w / h, .15, 400);
  // CAMERA SOLVER (ported from clap_cops, 2026-11-25 version): each shot placed relative to its subject (size -> distance,
  // az from the subject's facing, height by angle, move on top), CHECKED by raycasts at 5 times (camera <-> eyes and chest clear,
  // camera inside the subject's room for interiors). Blocked shots print CAMBLOCK. Hard shots (inserts, top-downs, the jet,
  // the store interior whose open side is fixed) get explicit CAM functions instead.
  const DIST = { wide: 6.6, full: 4.4, medium: 3.4, close: 2.6, xclose: 1.9, feet: 2.2 }, FOV = { wide: 46, full: 38, medium: 34, close: 30, xclose: 28, feet: 36 };
  const UP = { eye: 0, low: -.55, high: .65, top: 1.6 };
  const SPEC = {
    potHit: { size: 'wide', az: 25, angle: 'low', aim: 'body' }, cashGrin: { size: 'medium', az: -20 }, hedgeFist: { size: 'close', az: -30, aim: 'body' },
    lightning: { size: 'full', az: 30, angle: 'low', aim: 'body' }, soaked: { size: 'medium', az: 15 },
    boyWalk: { size: 'full', az: 0, aim: 'body' }, 
    momPat: { size: 'wide', az: 35, room: 'living', aim: 'body' }, momSad: { size: 'close', az: -15, room: 'living' },
    rainStop: { size: 'medium', az: -10, angle: 'high' },
    canHit: { size: 'medium', az: 20 },
    carStep: { size: 'medium', az: 25, aim: 'body' },
  };
  const ACT = Object.values(A);
  const STATIC = [T.root, man, pool, store, storeIn.root, hedge, door.piv, jet];
  const rc = new THREE.Raycaster(); const vis = o => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
  const blocked = (from, to, self) => { const d = to.clone().sub(from), L = d.length(); d.normalize(); rc.set(from, d); rc.far = L - .2; rc.near = .05;
    const tg = [...STATIC, ...ACT.filter(a => a !== self && a.a.root.visible).map(a => a.a.root)];
    return rc.intersectObjects(tg, true).some(i => i.object.isMesh && vis(i.object) && i.object.material?.colorWrite !== false && !i.object.material?.transparent); };
  const roomOf = (p, name) => name ? ROOMS.find(r => r.id === name) : null;
  const headOf = a => a.a.rig.parts.head.getWorldPosition(new THREE.Vector3());
  const camAt = (sp, s, u, az0, sub) => {
    const mv = s.move, d0 = DIST[sp.size] * (sp.dmul || 1), k = sm(u) * .3 + u * .7; let d = d0, az = az0 * Math.PI / 180, lat = 0, up = UP[sp.angle || s.angle] ?? 0;
    if (mv === 'push') d *= 1.18 - .3 * k; if (mv === 'pull') d *= .9 + .32 * k; if (mv === 'punch') d *= 1.35 - .5 * Math.min(1, u / .3);
    if (mv === 'orbitL' || mv === 'orbitR') az += (mv === 'orbitL' ? 1 : -1) * (.35 * s.speed) * (k - .5); if (mv === 'truckL' || mv === 'truckR') lat = (mv === 'truckL' ? 1 : -1) * .3 * s.speed * (k - .5);
    if (mv === 'craneUp' || mv === 'craneDown') up += (mv === 'craneUp' ? 1 : -1) * .5 * s.speed * (k - .5);
    const aim = sp.aim === 'body' ? sub.foot.clone().setY(sub.foot.y + (sub.head.y - sub.foot.y) * .62) : sub.head.clone().setY(sub.head.y - .06);
    const a = sub.heading + az, fx_ = Math.sin(a), fz = Math.cos(a);
    const p = new THREE.Vector3(aim.x + fx_ * d + fz * lat, aim.y + up, aim.z + fz * d - fx_ * lat);
    return { p, l: aim, fov: Math.min(62, 2 * Math.atan(Math.tan(FOV[sp.size] * Math.PI / 360) / (sp.dmul || 1)) * 180 / Math.PI) };
  };
  const subOf = (s, t) => { const a = A[s.who]; return { foot: a.a.root.position.clone(), head: headOf(a), heading: a.a.root.rotation.y, act: a }; };
  const okCam = (c, sub, sp) => { const R0 = roomOf(null, sp.room);
    if (R0) { if (!(c.p.x > R0.x0 + .2 && c.p.x < R0.x1 - .2 && c.p.z > R0.z0 + .2 && c.p.z < R0.z1 - .2 && c.p.y > R0.y + .35 && c.p.y < R0.y + 2.8)) return 99; } else if (c.p.y < .35) return 99;
    let n = 0; const chest = sub.foot.clone().setY(sub.foot.y + (sub.head.y - sub.foot.y) * .55);
    if (blocked(c.p, c.l, sub.act)) n++; if (blocked(c.l, c.p, sub.act)) n++; if (blocked(c.p, chest, sub.act)) n += .5; return n; };
  const CHOICE = {};
  const stepAll = t => { S.update(t); props(t, SH[0]); holds(t); scene.updateMatrixWorld(true); };
  const solve = s => { const sp = SPEC[s.id]; if (!sp) return; const samples = [];
    for (const u of [0, .25, .5, .75, 1]) { const t = s.t + u * s.dur * .98 + .01; stepAll(t); samples.push([u, subOf(s, t)]); }
    let best = null; for (const dm of [1, .78, .6, .46]) { if (best && best.sc === 0) break; for (const dz of [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90]) { const az = sp.az + dz; sp.dmul = dm;
      let sc = 0; for (const [u, sub] of samples) { const tq = s.t + u * s.dur * .98 + .01; stepAll(tq); sc += okCam(camAt(sp, s, u, az, sub), sub, sp); if (sc >= (best?.sc ?? 1e9)) break; }
      if (!best || sc < best.sc - .01) best = { az, sc, dm }; if (sc === 0) break; } }
    CHOICE[s.id] = best.az; sp.dmul = best.dm; console.error(best.sc ? 'CAMBLOCK' : 'CAM', s.id, 'score', best.sc, 'az', best.az, 'dm', best.dm); };
  const shakeAt = t => { for (const [a, b, k] of [[.42, .7, .03], [9.85, 10.3, .035], [12.95, 13.2, .025], [32.6, 32.85, .025], [49.0, 49.45, .06]]) if (t >= a && t < b) return k * (1 - (t - a) / (b - a)); return 0; };
  const pos = n => A[n].a.root.position;
  const CAM = {
    potHit: u => ({ p: [NB[0] + 1.1, .55, NB[1] - lerp(4.6, 3.4, Math.min(1, u / .3))], l: [NB[0], lerp(2.6, 1.6, sm(u * 1.5)), NB[1] + .2], fov: 48 }),   // low giant angle from the street side: him + the pot coming down
    cashGrin: u => { const h = headOf(A.neighbor); return { p: [h.x + 1.4, h.y - .25, h.z - lerp(2.8, 3.6, u)], l: [h.x, h.y - .35, h.z], fov: 36 }; },
    hedgeFist: u => ({ p: [HB.x - .6, 1.5, HB.kerbZ - lerp(3.6, 2.9, u)], l: [HB.x - 1.4, 1.2, HB.kerbZ + 1.3], fov: 34 }),
    // 1 already handled by the solver (low wide punch on the neighbor)
    mailman: u => { const m = pos('mailman'); return { p: [m.x + 3.2, .8, HB.kerbZ - 4.6], l: [m.x + .3, 1.0, m.z], fov: 44 }; },        // ahead of him, across the road: he skates toward us and clips        // across the road, low, the skater moves through
    balcony: u => { const [bx, bz] = BAL, k = sm(u); return { p: [bx + lerp(10, 3.0, k), LOT + lerp(1.4, 4.9, k), bz + lerp(3.2, .9, k)], l: [bx, LOT + lerp(4.2, 5.55, k), bz], fov: lerp(46, 34, k) }; },   // crane from the mansion up to HIS face: the same singed guy, rod hat, cash in hand
    poolTop: u => ({ p: [POOL.x + 2.4, lerp(14.5, 11.5, u), POOL.z + 2.6], l: [POOL.x + 2.0, 0, POOL.z + .4], fov: 46 }),   // high + east: the man on his gold floaty in a pool of bills, the gold bars and gold car on the deck
    jetCrash: u => { const r = pos('richman'); return { p: [POOL.x + 2.4, LOT + .9, POOL.z + 7.4], l: [lerp(r.x, POOL.x, u), LOT + lerp(1.0, 2.8, sm(u * 1.4)), lerp(r.z, POOL.z - 3.4, sm(u * 1.6))], fov: 50 }; },   // low from the near end: the man in front, the jet comes down behind him   // low from the far pool corner: the man in front, the jet coming down behind him
    footIns: u => ({ p: [3226.1 + .9 - u * .2, 1.05, HA.walkZ - 1.35], l: [3226.0, .02, HA.walkZ - .12], fov: 36 }),   // looking DOWN on the peel (edge-on it vanished): his sneaker comes down right past it   // low, street side: the big yellow peel fills the bottom, his sneaker steps right over it
    sprinkler: u => { const h = headOf(A.jayden), k = sm(cl(u / .4)); return { p: [lerp(3222.7, h.x - 1.9, k), lerp(1.0, h.y + .1, k), lerp(HA.walkZ - 2.95, h.z - 1.1, k)], l: [lerp(3224.4, h.x, k), lerp(.6, h.y - .18, k), lerp(HA.walkZ - .6, h.z, k)], fov: lerp(42, 40, k) }; },   // the jet hits him, push onto his face (hand over it), rise with him as he stands, the cash pops   // low front 3/4: Jaden on the ground AND the sprinkler head that pops up in his face
    jadenFall: u => { const x = lerp(3225.7, 3224.65, sm(cl((u - .05) / .3))); return { p: [x, .95, HA.walkZ - 6.6], l: [x, .72, HA.walkZ - .2], fov: 36 }; },   // side-on, whole body: foot on the peel, legs fly up, flat on his back
    basketball: u => ({ p: [3223.7 + u * .3, 1.45, HA.walkZ - 6.0], l: [3223.8, 1.1, HA.walkZ - .4], fov: 44 }),   // both side by side, the ball arcs in from the street (top left)
    boyWalk: u => { const b = pos('boy'); return { p: [b.x - 3.5, 1.15, HA.walkZ - 1.6], l: [b.x + .55, .95, HA.walkZ + .1], fov: 44 }; },   // ahead of him, tracking back: the AC smashes down right behind him
    window: u => ({ p: [WIN[0] - .3 + lerp(1.2, -1.1, u), 2.0, WIN[1] + 3.75], l: [WIN[0] - .3 + lerp(.3, -.25, u), 1.45, WIN[1] - .3], fov: 44 }),   // trucking across his BACK, the street through the window ahead of him   // trucking across his BACK: hunched forward, thinking, the room ahead of him
    smirk: u => { const h = headOf(A.boy), k = sm(cl(u * 1.6)); return { p: [h.x + lerp(.75, -.35, k), h.y - .12, Math.max(-231.2, h.z - 1.15)], l: [h.x + lerp(.15, -.04, k), h.y - .22, h.z], fov: 46 }; },   // a fast pan across his FRONT (between him and the glass): chin on his hands, then the smirk
    letter: u => { const L = letter.position; return { p: [L.x + .05, L.y + .08, L.z - lerp(.85, .5, Math.min(1, u / .3))], l: [L.x, L.y, L.z], fov: 32 }; },
    rainbow: u => ({ p: [3227.55, 1.5, lerp(-248.6, -249.6, u)], l: [3227.55, 1.7, -238.9], fov: 48 }),   // both in frame: rainbow onto the boy (right), the bolt onto Jaden (left)
    storm: u => ({ p: [HA.lawn[0] + 1.5, lerp(13, 9, u), HA.lawn[1] - 2.5], l: [HA.lawn[0], .9, HA.lawn[1]], fov: 50 }),
    cansIns: u => { const P0 = VM.localToWorld(new THREE.Vector3(lerp(.5, .58, u), .62, lerp(1.05, 1.15, u))), L0 = VM.localToWorld(new THREE.Vector3(0, .2, .46)); return { p: P0.toArray(), l: L0.toArray(), fov: 34 }; },   // square-on into the tray: four cans clatter down   // low from the side: the boy is standing in front of the tray
    storeKick0: u => { const b = pos('boy'); return { p: [b.x + lerp(3.4, 2.7, Math.min(1, u * 1.3)), 1.4, b.z + .35], l: [b.x - .3, 1.1, b.z - .5], fov: 44 }; },   // side-on at his depth: the wind-up in profile, the machine's front + taped sign   // the machine's front + taped sign, the boy in profile
    storeKick1: u => { const b = pos('boy'); return { p: [b.x + 3.0, .42, b.z - lerp(.1, .3, u)], l: [b.x - .1, 1.15, b.z - .45], fov: 50 }; },   // low from the right at his depth: the kick, the machine, Jaden waiting on the left   // low from the other side: kick, machine rocks, Jaden waiting behind
    canHit: u => { const d = lerp(4.9, 4.45, u); return { p: [3439.7 + .61 * d, 1.25, -247.3 + .79 * d], l: [3439.55, 1.05, -247.25], fov: 46 }; },   // side-on to the flight line: the shaking machine on the right, Jaden on the left, the can between
    ticket: u => ({ p: [SIN.x + lerp(.55, .95, u), 1.7, SIN.z + 1.85], l: [SIN.x + 1.15, 1.15, SIN.z - .45], fov: 48 }),   // inside the room (it trucked through the open wall's end before)
    soaked: u => { const h = headOf(A.richman); return { p: [h.x + 1.5, h.y + .55, h.z + lerp(3.9, 3.2, u)], l: [h.x - .1, h.y - .25, h.z - 1.2], fov: 42 }; },   // his face, the jet tail sticking out behind him
    loseFace: u => { const h = headOf(A.boy); return { p: [h.x + .35, h.y - .05, h.z + 1.9], l: [h.x, h.y - .1, h.z], fov: 30 }; },   // his face; Jaden soft at the slushie behind-left
    jackpot: u => { const c = card.position, ry = A.boy.a.root.rotation.y, d = lerp(.75, .5, Math.min(1, u / .3)); return { p: [c.x + Math.sin(ry) * d, c.y + .1, c.z + Math.cos(ry) * d], l: [c.x, c.y, c.z], fov: 30 }; },   // in front of the card at chest height; the card turns to the lens, his hands behind it
    cantCash: u => ({ p: [SIN.x + lerp(.95, 1.05, u), 1.55, SIN.z + 1.85], l: [SIN.x + 1.25, 1.25, SIN.z - .4], fov: 48 }),
    clockIns: u => { const c = clock.position; return { p: [c.x + .35, c.y - .25, c.z + lerp(2.3, 2.6, u)], l: [c.x + .05, c.y - .12, c.z], fov: 34 }; },   // the clock ON the entry wall (context), FRIDAY 4:58
    landlordWalk: u => { const Lx = HA.door[0] - .1, Lz = HA.door[1] - 1.25; const gy = ground(Lx, Lz); return { p: [Lx + .6, gy + .7, Lz - lerp(.25, .6, u)], l: [Lx, gy + 1.15, Lz - lerp(3.9, 2.6, u)], fov: 54 }; },
    clockPunch: u => { const c = clock.position; return { p: [c.x - .04, c.y + .04, c.z + lerp(1.75, 1.42, u)], l: [c.x + .02, c.y + .02, c.z], fov: 30 }; },   // punch in as it flips to 4:59
    knockHall: u => ({ p: [3219.75, 2.05, lerp(-230.95, -231.05, u)], l: [3220.2, 1.8, -228.5], fov: 50 }),   // between them and the door, looking back as they snap to it   // just inside the door, looking back at Mom and the boy as they snap to it
    // FIX (Xavier: landlord shot was from behind -- he knocks facing the door at ry 0, +z, so the old camera sat further
    // out on his BACK side). Now placed almost at the door itself, just off-axis, so we're in his forward 90 deg: face-on,
    // low, knocking fist near camera.
    landlord: u => { const Lx = HA.door[0] - .1, Lz = HA.door[1] - 1.25; const gy = ground(Lx, Lz); return { p: [HA.door[0] + .35, gy + 1.05, HA.door[1] - lerp(.5, .15, u)], l: [Lx, gy + 1.55, Lz + .15], fov: lerp(46, 40, u) }; },
    carSlide: u => ({ p: [lerp(3218.5, 3219.5, u), .7, HA.kerbZ - 6.5], l: [car.position.x, .9, car.position.z], fov: 46 }),
    needMoney: u => { const h = headOf(A.jayden); return { p: [h.x + .3, h.y - .02, h.z + lerp(2.2, 1.9, u)], l: [h.x - .12, h.y - .22, h.z], fov: 36 }; },   // his smug face + the fan of bills by his cheek
    subscribe: u => { const j = pos('jayden'), w = (f, q) => Math.sin(u * 2 * f + q) * .01; return { p: [j.x - .72 + w(5, 1), 2.87 + w(4, 2), j.z + .5], l: [j.x + .3 + w(3, 3), 1.45, j.z - .33], fov: 60 }; },   // just past his raised right hand (the phone), looking down at him: Xavier's screenshot angle   // Xavier's angle: high, in front, off his right shoulder, right where his raised hand holds the phone   // the phone's view: his arm reaches to the lens, the burning car + the boy behind
    boltEnd: u => ({ p: [CARP[0] + .4, 1.5, CARP[1] + lerp(7.0, 7.9, u)], l: [CARP[0] + .3, 1.3, CARP[1]], fov: 48 }),   // from the lawn: both boys in front of the car, the bolt comes down ON it, it goes up in flames
    aftermath: u => ({ p: [CARP[0] + .7, 1.4, CARP[1] + lerp(6.4, 5.3, u)], l: [CARP[0] + .35, 1.2, CARP[1] + .5], fov: 42 }),   // low, both charred, the car burning behind, cash pouring out of it: Jaden grins, the boy doesn't
  };
  const tS = performance.now(); for (const s of SH) if (!CAM[s.id]) solve(s); console.error('SOLVE ms', (performance.now() - tS).toFixed(0));
  let apStash = 0;
  const update = t => {
    const s = SH.slice().reverse().find(q => t >= q.t) || SH[0], u = cl((t - s.t) / s.dur);
    S.update(t); props(t, s); holds(t); fxState = fx.update(t); light(t, s);
    const o = globalThis.VIEW || opts;
    if (o.camP) { cam.position.set(...o.camP); cam.lookAt(...o.camL); cam.fov = o.fov || 34; }
    else { const C = CAM[s.id] ? CAM[s.id](sm(u) * .3 + u * .7) : (() => { const c = camAt(SPEC[s.id], s, u, CHOICE[s.id], subOf(s, t)); return { p: c.p.toArray(), l: c.l.toArray(), fov: c.fov }; })(), hh = (f, q) => Math.sin(t * f + q) * .012 + Math.sin(t * f * 2.7 + q * 3) * .006;   // constant travel + handheld
      cam.position.set(C.p[0] + hh(1.3, 1), C.p[1] + hh(1.1, 2), C.p[2] + hh(1.2, 3)); cam.fov = C.fov; cam.lookAt(C.l[0] + hh(1.5, 4), C.l[1] + hh(1.4, 5), C.l[2]); const sk = shakeAt(t); if (sk) { cam.rotateX(Math.sin(t * 61) * sk); cam.rotateZ(Math.sin(t * 47) * sk); } }
    if (['letter', 'momSad'].includes(s.id) && letter.visible) { letter.lookAt(cam.position); letter.position.lerp(cam.position, .08); }
    if (fan.visible) { const H = handOf(A.jayden, 'R'); fan.position.copy(H.p).add(new THREE.Vector3(0, .2, 0)).lerp(cam.position, .14); fan.lookAt(cam.position); fan.rotateZ(.4); }
    if (['jackpot', 'loseFace'].includes(s.id) && card.visible) { card.position.lerp(cam.position, s.id === 'jackpot' ? .3 : .05); card.lookAt(cam.position); }
    const cardFocus = s.id === 'jackpot' && card.visible;   // focus on the card where it actually is (it's pulled toward the lens above)
    if (cardFocus && post.aperture > 0) { apStash = post.aperture; post.aperture = 0; } else if (!cardFocus && apStash) { post.aperture = apStash; apStash = 0; }   // the ticket is THE shot: DOF off (post.js reads aperture only as on/off live; at .4 m it blurred the card to mush)   // the ticket is THE shot: tack sharp (2.0 at .4 m blurred it to mush)
    cam.updateProjectionMatrix(); LOOK.sky.position.copy(cam.position);
    const sp = A[s.who] ? A[s.who].a.root.position : null; if (sp && o.look !== false) LOOK.follow(cam, { x: sp.x, y: sp.y, z: sp.z });
    if (CAM[s.id] && !o.camP) { const C2 = CAM[s.id](sm(u) * .3 + u * .7); post.focus = cardFocus ? cam.position.distanceTo(card.position) : cam.position.distanceTo(new THREE.Vector3(...C2.l)); }   // inserts and hand-placed shots: focus on what the lens looks at
    cam.updateMatrixWorld(true); return true;
  };
  update(opts.t ?? 0);
  return { camera: cam, sun: LOOK.sun, post, update, dbg: { A, town: T.root, CHOICE, VM, card, cans, cam } };
}
