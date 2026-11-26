// 08 CLAP COPS ("Clapping Is Illegal, I Called The Cops 👏"). Voice: topics/clap_cops/voice/voice.wav (v3, 44.75 s, approved)
// + the shown ending (Mrs. Pam sneaking out, Xavier 12:16). Sets: House A furnished inside the town (moved to x + 3000),
// its street at night; the dense suburb street at the origin for the day gag; the dining room for the birthday; the town
// pitch with a painted football field + real bleachers for the snapping crowd. Plan: topics/clap_cops/SHOTPLAN.md.
import * as THREE from 'three';
import { stage } from '../engine/act.js';
import { buildTown } from '../engine/sets/town.js';
import { dayLook, paintSky } from '../engine/look.js';
import { loadRbx } from '../engine/rbxmodel.js';
import { validate } from '../engine/shots.js';
import { limbTo } from '../engine/r6pose.js';
import { flapTrack } from '../engine/lipsync.js';
import { clapVan, hingeDoor, diningChairProp, cakeWithCandles, suitcase, footballField } from '../engine/sets/clapset.js';

const J = async p => (await fetch(new URL(p, document.baseURI))).json();
export const DUR = 47.0;
const lerp = (a, b, k) => a + (b - a) * k, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = u => { u = cl(u); return u * u * (3 - 2 * u); };
const fa = (part, hand, elbow, root = {}) => limbTo(part, root, hand, elbow);

// ---------------- poses (avatar frame; Xavier's { r, o } form: arm r.x < 0 = forward, armL r.z > 0 = out, head r.x > 0 = down) ----------------
const legsEasy = { legL: { r: [0.04, 0, 0.03], o: [0.01, 0, 0.02] }, legR: { r: [-0.06, 0, -0.05], o: [-0.02, 0.01, -0.03] } };
const P = {
  relaxed: { ...legsEasy, armL: { r: [-0.14, 0, 0.0] }, armR: { r: [0.1, 0, 0.01] }, head: { r: [0.04, 0.12, 0.02] }, root: { x: 0.03, rz: 0.03 } },
  // his sitting code ("hip as butt"), arms resting on the thighs, one hand with the remote
  sofa: { armL: { r: [-0.62, 0, 0.14], o: [0, -0.02, 0.06] }, armR: { r: [-0.7, 0, -0.1], o: [0, -0.02, 0.07] }, legL: { r: [-0.093, 0.057, 0.063], o: [0.028, 0.061, 0.55] }, legR: { r: [-0.023, 0.092, -0.169], o: [-0.056, 0.044, 0.57] }, head: { r: [0.02, 0.05, 0] }, root: { x: 0.017, y: -0.06, z: -0.033, rx: -0.12 } },
};
P.sofaUp = { ...P.sofa, head: { r: [-0.5, 0.2, 0.08] }, root: { ...P.sofa.root, rx: -0.2 } };          // looks up at the ceiling (toward Dad's room)
P.sofaUp2 = { ...P.sofa, head: { r: [-0.55, -0.25, -0.1] }, root: { ...P.sofa.root, rx: -0.22, rz: .04 } };
P.sofaLean = { ...P.sofa, armL: { r: [-0.6, 0, 0.35], o: [0, 0, 0.12] }, armR: { r: [-0.55, 0, -0.35], o: [0, 0, 0.12] }, head: { r: [0.15, 0, 0] }, root: { ...P.sofa.root, rx: 0.32 } };   // leans forward, hands on the seat: pushing off
P.rise = { ...legsEasy, armL: { r: [-0.5, 0, 0.25] }, armR: { r: [-0.45, 0, -0.3] }, head: { r: [0.1, 0, 0] }, root: { rx: 0.35, y: -0.18 } };
P.determined = { legL: { r: [-0.1, 0, 0.1], o: [0.03, 0, 0.04] }, legR: { r: [0.12, 0, -0.06] }, armL: { r: [0.1, 0, 0.18] }, armR: { r: [0.08, 0, -0.15] }, head: { r: [0.12, -0.15, 0] }, root: { rx: 0.04, rz: -0.03 } };
// phone at the right ear (forearm action: the shoulder becomes the elbow), the other arm hanging, weight on one leg
P.phoneEar = { ...legsEasy, armR: fa('armR', [-0.3, 1.58, 0.08], [-0.42, 1.08, 0.12]), armL: { r: [0.12, 0, 0.1] }, head: { r: [0.08, 0.15, -0.12] }, root: { x: 0.03, rz: 0.04 } };
P.phoneDial = { ...legsEasy, armR: fa('armR', [-0.05, 1.12, 0.4], [-0.4, 1.02, 0.12]), armL: fa('armL', [0.08, 1.1, 0.38], [0.42, 1.0, 0.1]), head: { r: [0.5, 0, 0] }, root: { rx: 0.06 } };
P.phoneYell = { legL: { r: [-0.12, 0, 0.08], o: [0.02, 0, 0.05] }, legR: { r: [0.15, 0, -0.05] }, armR: fa('armR', [-0.2, 1.5, 0.28], [-0.42, 1.08, 0.16]), armL: { r: [-0.6, 0, 0.55], o: [0, 0.05, 0.08] }, head: { r: [-0.1, 0, 0.06] }, root: { rx: 0.18, rz: -0.04 } };
P.scared = { legL: { r: [0.06, 0, 0.06] }, legR: { r: [-0.12, 0, -0.04], o: [0, 0, -0.05] }, armR: fa('armR', [-0.25, 1.5, 0.12], [-0.42, 1.06, 0.1]), armL: { r: [-0.3, 0, 0.2] }, head: { r: [0.05, -0.1, 0.1] }, root: { rx: -0.06 } };
// one clap: the forearms swing in, hands meet in front of the chest (never arms straight out, never clipping the torso)
P.clapOpen = { ...legsEasy, armL: fa('armL', [0.34, 1.02, 0.36], [0.42, .98, 0.06]), armR: fa('armR', [-0.34, 1.04, 0.34], [-0.42, .98, 0.06]), head: { r: [0.1, 0.1, 0] }, root: { rz: 0.02 } };
P.clapShut = { ...legsEasy, armL: fa('armL', [0.06, 1.03, 0.44], [0.42, .98, 0.08]), armR: fa('armR', [-0.06, 1.05, 0.44], [-0.42, .98, 0.08]), head: { r: [0.12, 0.05, 0] }, root: { rx: 0.03 } };
P.freeze = { legL: { r: [0.06, 0, 0.05] }, legR: { r: [-0.08, 0, -0.06] }, armL: fa('armL', [0.06, 1.03, 0.44], [0.42, .98, 0.08]), armR: fa('armR', [-0.06, 1.05, 0.44], [-0.42, .98, 0.08]), head: { r: [0.05, -0.55, 0] }, root: { rz: -0.02 } };   // hands still together, head turns slowly
P.point = { legL: { r: [-0.1, 0, 0.08] }, legR: { r: [0.1, 0, -0.05] }, armR: fa('armR', [-0.3, 1.58, 0.08], [-0.42, 1.08, 0.12]), armL: { r: [-1.45, 0.1, 0.25], o: [0, 0.05, 0.14] }, head: { r: [0.02, 0.2, 0.05] }, root: { rx: 0.06, rz: 0.03 } };
// jazz hands: both arms up and out IN FRONT (not mirrored: one higher, one wider), palms to the cake, the hands shimmer
P.jazz = { legL: { r: [-0.08, 0, 0.12], o: [0.03, 0, 0.04] }, legR: { r: [0.1, 0, -0.08] }, armL: fa('armL', [0.5, 1.6, 0.1], [0.42, 1.08, 0.04]), armR: fa('armR', [-0.48, 1.52, 0.12], [-0.42, 1.06, 0.04]), head: { r: [-0.12, 0.12, 0.1] }, root: { rx: -0.05, rz: 0.05, x: 0.03 } };
P.jazzB = { legL: { r: [0.1, 0, 0.06] }, legR: { r: [-0.08, 0, -0.12], o: [-0.03, 0, 0.03] }, armL: fa('armL', [0.48, 1.52, 0.12], [0.42, 1.06, 0.04]), armR: fa('armR', [-0.5, 1.6, 0.1], [-0.42, 1.08, 0.04]), head: { r: [-0.08, -0.15, -0.1] }, root: { rx: -0.04, rz: -0.05, x: -0.03 } };
P.blow = { ...legsEasy, armL: { r: [-0.35, 0, 0.22] }, armR: { r: [-0.3, 0, -0.25] }, head: { r: [0.05, 0, 0] }, root: { rx: 0.22 } };
// snapping in the stands (seated): the right forearm up by the shoulder flicks, the left hand on the knee
const SIT = { legL: { r: [-0.093, 0.057, 0.063], o: [0.028, 0.061, 0.55] }, legR: { r: [-0.023, 0.092, -0.169], o: [-0.056, 0.044, 0.57] }, root: { x: 0.017, y: -0.06, z: -0.033 } };
P.sitSnap = { ...SIT, armR: fa('armR', [-0.32, 1.45, 0.28], [-0.42, 1.04, 0.1]), armL: { r: [-0.9, 0, 0.12], o: [0, 0, 0.05] }, head: { r: [-0.05, 0.1, 0.03] } };
P.sitSnapB = { ...SIT, armL: fa('armL', [0.3, 1.42, 0.3], [0.42, 1.04, 0.1]), armR: { r: [-0.95, 0, -0.1], o: [0, 0, 0.05] }, head: { r: [-0.08, -0.1, -0.03] } };
P.sitWatch = { ...SIT, armL: { r: [-0.85, 0, 0.12], o: [0, 0, 0.05] }, armR: { r: [-0.9, 0, -0.1], o: [0, 0, 0.05] }, head: { r: [0.05, 0.05, 0] } };
// Dad: the bye-wave from the door (his simple hi), the stretch ("I'll just work out": one arm pulled across the chest)
P.wave = { ...legsEasy, armR: { r: [3.05, 0.42, 0], o: [-0.057, 0.252, -0.013] }, armL: { r: [0.12, 0, 0.06] }, head: { r: [0, 0.1, 0.06] }, root: { rz: 0.04 } };
P.stretch = { legL: { r: [-0.08, 0, 0.1], o: [0.02, 0, 0.04] }, legR: { r: [0.06, 0, -0.06] }, armL: fa('armL', [-0.32, 1.12, 0.32], [0.1, 1.12, 0.3]), armR: fa('armR', [-0.08, 1.1, 0.38], [-0.4, .98, 0.1]), head: { r: [0.05, 0.3, 0.08] }, root: { rz: -0.05, x: 0.02 } };
// Dad in the bedroom: kneel + shove (his kneel code), then up, half turned to the door
const KN = { legL: { r: [1.642, 0.025, 0.023], o: [0, 0.013, 0.165] }, legR: { r: [1.56, -0.023, -0.024], o: [-0.011, -0.006, 0.209] }, root: { x: 0.006, y: -0.374, rz: 0.015 } };
P.kneelShove = { ...KN, armR: { r: [-1.35, 0, 0.12], o: [0, -0.05, 0.22] }, armL: { r: [-0.6, 0, 0.3], o: [0, 0, 0.05] }, head: { r: [0.45, -0.2, 0] }, root: { ...KN.root, rx: 0.42 } };
P.grabPurse = { ...legsEasy, armR: fa('armR', [-0.12, 0.97, 0.55], null, { rx: 0.32 }), armL: { r: [-0.35, 0, 0.18] }, head: { r: [0.4, 0, 0] }, root: { rx: 0.32 } };
P.hideBack = { ...legsEasy, armR: { r: [0.38, 0, -0.08], o: [0, 0, -0.02] }, armL: { r: [-0.2, 0, 0.12] }, head: { r: [0.02, 0.55, 0.04] }, root: { rx: 0.04, rz: -0.03 } };
P.kneelLook = { ...KN, armR: { r: [-0.5, 0, 0.1] }, armL: { r: [-0.4, 0, 0.25] }, head: { r: [0, 0.6, 0] }, root: { ...KN.root, rx: 0.12 } };
P.robeHold = { legL: { r: [0.05, 0, 0.06] }, legR: { r: [-0.1, 0, -0.05], o: [0, 0, 0.04] }, armL: fa('armL', [0.06, 0.92, 0.22], [0.36, 0.86, 0.06]), armR: fa('armR', [-0.05, 0.95, 0.23], [-0.36, 0.86, 0.06]), head: { r: [0.05, 0.35, 0.05] }, root: { rx: 0.03, rz: 0.03 } };
P.shoutDoor = { legL: { r: [-0.08, 0, 0.08] }, legR: { r: [0.1, 0, -0.06] }, armL: fa('armL', [0.05, 1.05, 0.36], [0.42, 1.0, 0.1]), armR: { r: [0.04, 0, -0.1] }, head: { r: [-0.08, -0.25, 0.05] }, root: { rx: -0.04 } };
P.caught = { legL: { r: [0.05, 0, 0.05] }, legR: { r: [-0.14, 0, -0.06], o: [0, 0.02, 0.06] }, armL: fa('armL', [0.08, 0.9, 0.2], [0.36, 0.84, 0.04]), armR: { r: [0.05, 0, -0.1] }, head: { r: [0.3, 0.05, 0.08] }, root: { rx: 0.05 } };
P.calmDown = { legL: { r: [0.05, 0, 0.05] }, legR: { r: [-0.14, 0, -0.06], o: [0, 0.02, 0.06] }, armL: fa('armL', [0.05, 1.05, 0.36], [0.42, 1.0, 0.1]), armR: { r: [-1.05, 0, -0.45], o: [0, 0.02, 0.1] }, head: { r: [0.25, -0.12, -0.1] }, root: { rx: 0.08, rz: -0.03 } };
// the boy at the bedroom door: pounding (fist to the door) and the ear to the door
P.pound = { legL: { r: [-0.15, 0, 0.08], o: [0.02, 0, 0.06] }, legR: { r: [0.12, 0, -0.06] }, armL: { r: [-1.75, 0, -0.12], o: [0, 0.08, 0.14] }, armR: { r: [-0.4, 0, -0.3] }, head: { r: [-0.05, 0, 0] }, root: { rx: 0.1 } };
P.poundB = { ...P.pound, armL: { r: [-1.25, 0, -0.12], o: [0, 0.0, 0.26] }, head: { r: [0.1, 0, 0] }, root: { rx: 0.2 } };
P.earDoor = { legL: { r: [0.1, 0, 0.06] }, legR: { r: [-0.08, 0, -0.06], o: [0, 0, 0.04] }, armL: { r: [0, 0, 1.2], o: [0.06, 0.04, 0] }, armR: { r: [0.1, 0, -0.06] }, head: { r: [0.05, 0.2, 0.42] }, root: { rz: 0.1, x: -0.04 } };
// carrying the chair (both hands on the top rail, held in front) and wedging it
P.carryChair = { ...legsEasy, armL: fa('armL', [0.21, 1.02, 0.5], [0.38, 1.1, 0.12]), armR: fa('armR', [-0.21, 1.02, 0.5], [-0.38, 1.1, 0.12]), head: { r: [0.15, 0, 0] }, root: { rx: -0.05 } };
P.wedgeYell = { ...legsEasy, legR: { r: [0.22, 0, -0.05], o: [0, 0, -0.1] }, armL: fa('armL', [0.21, 0.92, 0.6], [0.38, 1.08, 0.2], { rx: 0.14 }), armR: fa('armR', [-0.21, 0.92, 0.6], [-0.38, 1.08, 0.2], { rx: 0.14 }), head: { r: [-0.22, -0.3, 0.06] }, root: { rx: 0.14 } };   // braced on the chair, head up, yelling at the door
P.wedge = { ...legsEasy, armL: fa('armL', [0.21, 0.9, 0.62], [0.38, 1.05, 0.2], { rx: 0.4, y: -0.05 }), armR: fa('armR', [-0.21, 0.9, 0.62], [-0.38, 1.05, 0.2], { rx: 0.4, y: -0.05 }), head: { r: [0.4, 0, 0] }, root: { rx: 0.4, y: -0.05 } };
// back flat against the door, palms on it, yelling over his shoulder (the door is behind him)
P.backDoor = { legL: { r: [-0.18, 0, 0.12], o: [0.02, 0, 0.08] }, legR: { r: [-0.1, 0, -0.1], o: [0, 0, 0.06] }, armL: { r: [0.35, 0, 0.32], o: [0.02, 0, -0.05] }, armR: { r: [0.3, 0, -0.42], o: [-0.02, 0, -0.05] }, head: { r: [-0.15, -0.6, 0] }, root: { rx: -0.14 } };
// his fall code (the door hits him: the body rolls, limbs splayed)
P.fall = { armL: { r: [-0.86, -1.088, -1.44], o: [0.021, -0.035, 0.133] }, armR: { r: [-0.822, 0.818, -0.714], o: [-0.076, 0.102, 0.208] }, legL: { r: [1.228, 0.669, -0.34], o: [0.185, -0.052, -0.004] }, legR: { r: [-0.021, -0.206, 0.308], o: [-0.085, 0.153, 0.055] }, head: { r: [0.362, 0.283, -0.21], o: [0, 0.081, 0] }, root: { x: 0.6, y: 0.156, z: 1.212, rx: -0.363, ry: 0.035, rz: 1.259 } };
// the cop: front kick (leg straight from the hip, arms out for balance, leaning back), then standing, looking up
P.kickPrep = { legL: { r: [0.05, 0, 0.06] }, legR: { r: [0.6, 0, -0.06], o: [0, 0.05, -0.05] }, armL: { r: [-0.4, 0, 0.5] }, armR: { r: [0.3, 0, -0.4] }, head: { r: [0.15, 0, 0] }, root: { rx: 0.15 } };
P.kick = { legL: { r: [0.1, 0, 0.06] }, legR: { r: [-1.45, 0, -0.04], o: [0, 0.12, 0.18] }, armL: { r: [-0.6, 0, 0.9] }, armR: { r: [0.2, 0, -0.8] }, head: { r: [0.12, 0, 0] }, root: { rx: -0.25 } };
P.copLook = { legL: { r: [-0.08, 0, 0.08] }, legR: { r: [0.1, 0, -0.06], o: [0, 0, -0.04] }, armL: fa('armL', [0.4, 1.0, 0.0], [0.45, 1.1, -0.05]), armR: { r: [0.1, 0, -0.08] }, head: { r: [-0.5, 0.25, 0] }, root: { rx: -0.04 } };   // hand on the belt, head up at Dad
// Mom: suitcase in the right hand (handle up), then hand on hip, suspicious
P.momRoll = { ...legsEasy, armR: { r: [0.35, 0, -0.05], o: [0, 0, -0.04] }, armL: { r: [-0.15, 0, 0.08] }, head: { r: [0.05, 0, 0] } };
P.momHip = { legL: { r: [-0.1, 0, 0.12], o: [0.03, 0, 0.04] }, legR: { r: [0.06, 0, -0.06] }, armL: fa('armL', [0.36, 0.9, -0.04], [0.62, 1.08, -0.12]), armR: { r: [0.3, 0, -0.06], o: [0, 0, -0.03] }, head: { r: [-0.25, 0.3, 0.15] }, root: { rz: 0.06, x: 0.04 } };
P.momLine = { ...P.momHip, head: { r: [-0.35, 0.05, 0.12] } };
// Mrs. Pam tiptoe (walk style adds the rise), freezing mid-step
P.pamFreeze = { legL: { r: [-0.35, 0, 0.05], o: [0, 0.04, 0.05] }, legR: { r: [0.25, 0, -0.05] }, armL: fa('armL', [0.2, 0.98, 0.32], [0.42, 1.0, 0.04]), armR: fa('armR', [-0.18, 0.95, 0.34], [-0.42, 1.0, 0.04]), head: { r: [0.05, -0.75, 0] }, root: { rx: 0.12, y: 0.0 } };
P.lady = { ...legsEasy, armR: fa('armR', [-0.3, 1.58, 0.08], [-0.42, 1.08, 0.12]), armL: { r: [-1.45, -0.05, 0.3], o: [0, 0.05, 0.15] }, head: { r: [0.02, -0.15, 0] }, root: { rx: -0.05 } };
P.sitDaze = { legL: { r: [-1.5708, 0, .08] }, legR: { r: [-1.45, 0, -.15], o: [0, .02, .04] }, armL: { r: [.55, 0, .3], o: [0, 0, -.05] }, armR: fa('armR', [-.12, .72, .2], [-.4, .55, .02], { y: -.51 }), head: { r: [.3, .2, .25] }, root: { y: -.51, rx: -.15 } };
P.sitLook = { ...P.sitDaze, armR: { r: [.5, 0, -.28], o: [0, 0, -.05] }, head: { r: [-.45, -.15, .05] }, root: { y: -.51, rx: -.22 } };
P.sneak = { armL: fa('armL', [0.11, 1.17, 0.27], [0.4, 0.93, 0.06]), armR: fa('armR', [-0.11, 1.17, 0.27], [-0.4, 0.93, 0.06]),   /* Xavier liked this one (23:49) */ head: { r: [0.18, -0.35, 0] } };   // fingertips together at the chest (Xavier 2026-11-25)
P.sneakB = { ...P.sneak, head: { r: [0.12, 0.4, 0.05] } };   // glance the other way
P.shrugSmall = { legL: { r: [0.05, 0, 0.05] }, legR: { r: [-0.14, 0, -0.06], o: [0, 0.02, 0.06] }, armL: fa('armL', [0.42, 0.98, 0.32], [0.42, 1.0, 0.0]), armR: fa('armR', [-0.44, 1.0, 0.3], [-0.42, 1.0, 0.0]), head: { r: [0.22, 0.15, 0.12] }, root: { rx: 0.06, rz: 0.03 } };
P.ladyB = { ...P.lady, armL: { r: [-1.75, -0.05, 0.25], o: [0, 0.08, 0.15] }, head: { r: [-0.04, -0.2, 0.05] }, root: { rx: -0.09 } };
export { P };

export const POSE_SHEET = [
  ['01 Cop: kick wind-up', 'clapcop', 'kickPrep', 'angry', ''], ['02 Cop: front kick', 'clapcop', 'kick', 'angry', ''], ['03 Boy: hit by the door', 'boy', 'fall', 'shocked', ''],
  ['04 Dad on the stairs (robe)', 'dad_robe', 'caught', 'scared', ''], ['05 Man claps once (open)', 'm047', 'clapOpen', 'happy', ''], ['06 Man claps (hands meet)', 'm047', 'clapShut', 'happy', ''],
  ['07 Man freezes', 'm047', 'freeze', 'scared', ''], ['08 Lady calls it in', 'f012', 'lady', 'angry', ''], ['09 Mia blows the candles', 'mia', 'blow', 'happy', ''],
  ['10 Jazz hands (Dad)', 'dad', 'jazz', 'excited', ''], ['11 Jazz hands (Mom)', 'mom', 'jazzB', 'laugh', ''],
  ['13 Mia: jazz hands', 'mia', 'jazzB', 'excited', ''], ['14 Fan snaps (R)', 'm011', 'sitSnap', 'excited', 'seat'], ['15 Fan snaps (L)', 'f047', 'sitSnapB', 'happy', 'seat'],
  ['16 Mom rolls her suitcase', 'mom', 'momRoll', 'happy', ''], ['17 Dad waves bye', 'dad', 'wave', 'happy', ''], ['18 Dad: I will just work out', 'dad', 'stretch', 'smug', ''],
  ['19 Boy on the sofa', 'boy', 'sofa', 'neutral', 'seat'], ['20 Boy looks up (clap 1)', 'boy', 'sofaUp', 'confused', 'seat'], ['21 Boy looks up (clap 3)', 'boy', 'sofaUp2', 'shocked', 'seat'],
  ['22 Boy pushes off the sofa', 'boy', 'sofaLean', 'determined', 'seat'], ['23 Boy dials', 'boy', 'phoneDial', 'determined', ''], ['24 Boy: phone at ear', 'boy', 'phoneEar', 'proud', ''],
  ['25 Boy: one year in jail', 'boy', 'scared', 'scared', ''], ['26 Boy: Wait, cancel!', 'boy', 'phoneYell', 'terrified', ''], ['27 Boy pounds the door', 'boy', 'pound', 'scared', ''],
  ['28 Dad grabs the purse', 'dad_robe', 'grabPurse', 'nervous', ''], ['29 Dad hides it behind his back', 'dad_robe', 'hideBack', 'scared', ''], ['30 Dad: Go to your room', 'dad_robe', 'shoutDoor', 'angry', ''],
  ['31 Boy: ear to the door', 'boy', 'earDoor', 'confused', ''], ['32 Boy carries the chair', 'boy', 'carryChair', 'determined', ''], ['33 Boy wedges the chair', 'boy', 'wedge', 'determined', ''],
  ['34 Boy: My dads asleep', 'boy', 'wedgeYell', 'scared', ''], ['35 Cop looks up at Dad', 'clapcop', 'copLook', 'suspicious', ''], ['36 Dad: Officer its just me', 'dad_robe', 'shrugSmall', 'nervous', ''],
  ['35 Boy dazed on the floor', 'boy', 'sitDaze', 'confused', ''], ['35 Boy looks up the stairs', 'boy', 'sitLook', 'scared', ''],
  ['37 Mom: hand on hip', 'mom', 'momHip', 'suspicious', ''], ['38 Mom: Mrs Pams car', 'mom', 'momLine', 'angry', ''], ['39 Mrs. Pam freezes', 'mrs_pam', 'pamFreeze', 'scared', ''],
];

// shot list (times from voice/words.json v3). cam: { p0, p1, l0, l1?, fov } world metres; move / size / speed label what the camera does (validate()).
const SH = [
  { t: 0.00, dur: .95, id: 'coldKick', who: 'cop', size: 'wide', angle: 'low', move: 'punch', speed: 2.4, night: 1, shake: [.2, .5] },
  { t: .95, dur: 1.01, id: 'coldDad', who: 'dadR', size: 'full', angle: 'low', move: 'pull', speed: 1.2, night: 1 },
  { t: 1.96, dur: 1.24, id: 'clapMan', who: 'man', size: 'medium', angle: 'eye', move: 'truckL', speed: .7 },
  { t: 3.20, dur: 1.14, id: 'lady', who: 'lady', size: 'close', angle: 'eye', move: 'push', speed: 1.8 },
  { t: 4.34, dur: .86, id: 'vanIn', who: 'man', size: 'wide', angle: 'low', move: 'pan', speed: 1.1 },
  { t: 5.20, dur: .84, id: 'ear', who: 'man', size: 'xclose', angle: 'low', move: 'orbitL', speed: 2.0 },
  { t: 6.04, dur: .91, id: 'blow', who: 'mia', size: 'medium', angle: 'high', move: 'push', speed: 2.6 },
  { t: 6.95, dur: 1.37, id: 'jazz', who: 'mia', size: 'full', angle: 'eye', move: 'pull', speed: 1.4 },
  { t: 8.32, dur: .78, id: 'stands', who: 'fan', size: 'wide', angle: 'low', move: 'craneUp', speed: .8 },
  { t: 9.10, dur: 1.32, id: 'fan', who: 'fan', size: 'close', angle: 'eye', move: 'truckR', speed: 1.5 },
  { t: 10.42, dur: 2.30, id: 'momOut', who: 'mom', size: 'full', angle: 'eye', move: 'track', speed: .9, night: 1 },
  { t: 12.72, dur: 1.20, id: 'dadDoor', who: 'dad', size: 'medium', angle: 'low', move: 'hold', speed: .4, night: 1 },
  { t: 13.92, dur: 1.18, id: 'workout', who: 'dad', size: 'medium', angle: 'eye', move: 'push', speed: 1.3, night: 1 },
  { t: 15.10, dur: 1.28, id: 'sofa', who: 'boy', size: 'full', angle: 'high', move: 'orbitL', speed: .7, night: 1 },
  { t: 16.38, dur: 1.72, id: 'faceUp', who: 'boy', size: 'close', angle: 'low', move: 'push', speed: 1.6, night: 1 },
  { t: 18.10, dur: 1.74, id: 'standUp', who: 'boy', size: 'medium', angle: 'eye', move: 'craneUp', speed: 1.0, night: 1 },
  { t: 19.84, dur: 1.74, id: 'dial', who: 'boy', size: 'close', angle: 'high', move: 'truckL', speed: .6, night: 1 },
  { t: 21.58, dur: 2.06, id: 'jail', who: 'boy', size: 'xclose', angle: 'eye', move: 'punch', speed: 1.5, night: 1 },
  { t: 23.64, dur: 2.12, id: 'cancel', who: 'boy', size: 'medium', angle: 'low', move: 'pull', speed: 2.2, night: 1 },
  { t: 25.76, dur: .54, id: 'runHall', who: 'boy', size: 'full', angle: 'eye', move: 'track', speed: 1.5, night: 1 },
  { t: 26.30, dur: .75, id: 'run', who: 'boy', size: 'full', angle: 'high', move: 'craneDown', speed: 1.0, night: 1 },
  { t: 27.05, dur: .85, id: 'pound', who: 'boyUp', size: 'medium', angle: 'high', move: 'truckR', speed: .7, night: 1 },
  { t: 27.90, dur: .76, id: 'shove', who: 'dadR', size: 'full', angle: 'top', move: 'craneDown', speed: 1.6, night: 1 },
  { t: 28.66, dur: 1.82, id: 'gotoroom', who: 'dadR', size: 'medium', angle: 'eye', move: 'orbitR', speed: .5, night: 1 },
  { t: 30.48, dur: 1.08, id: 'weird', who: 'boyUp', size: 'close', angle: 'eye', move: 'push', speed: 1.2, night: 1 },
  { t: 31.56, dur: 1.14, id: 'sirens', who: 'van', size: 'wide', angle: 'low', move: 'pan', speed: 2.0, night: 1 },
  { t: 32.70, dur: 2.38, id: 'chair', who: 'boy', size: 'full', angle: 'eye', move: 'truckL', speed: .5, night: 1 },
  { t: 35.08, dur: 1.54, id: 'asleep', who: 'boy', size: 'medium', angle: 'low', move: 'push', speed: 1.8, night: 1 },
  { t: 36.62, dur: 1.12, id: 'kick', who: 'boy', size: 'wide', angle: 'high', move: 'punch', speed: 2.6, night: 1, shake: [36.75, 37.1] },
  { t: 37.74, dur: 2.10, id: 'stairs', who: 'dadR', size: 'full', angle: 'low', move: 'craneUp', speed: .6, night: 1 },
  { t: 39.84, dur: 1.24, id: 'justme', who: 'dadR', size: 'medium', angle: 'low', move: 'push', speed: 1.4, night: 1 },
  { t: 41.08, dur: 1.88, id: 'momIn', who: 'mom', size: 'full', angle: 'eye', move: 'truckR', speed: .8, night: 1 },
  { t: 42.96, dur: 1.54, id: 'momLine', who: 'mom', size: 'close', angle: 'eye', move: 'push', speed: 2.4, night: 1 },
  { t: 44.50, dur: 2.50, id: 'pam', who: 'pam', size: 'full', angle: 'low', move: 'pull', speed: 1.0, night: 1 },
];
export const SHOTS = SH;

export async function build({ scene, W: w, H: h, opts = {} }) {
  // ---------- sets ----------
  const { buildSuburb } = await import('../engine/sets/suburb.js'); await buildSuburb(scene);
  const T = await buildTown(scene, { interiors: true, furnish: ['entry', 'living', 'parents', 'dining', 'kitchen', 'his'] });
  T.root.position.x += 3000; scene.updateMatrixWorld(true);
  const H0 = T.houses.A, inner = H0.root.parent;
  const ROOMS = []; for (const [id, r] of Object.entries(H0.rooms)) { const a = inner.localToWorld(new THREE.Vector3(r.rect.x, r.y || 0, r.rect.z)), b = inner.localToWorld(new THREE.Vector3(r.rect.x + r.rect.w, r.y || 0, r.rect.z + r.rect.d)); ROOMS.push({ id, x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), z0: Math.min(a.z, b.z), z1: Math.max(a.z, b.z), y: a.y }); }
  scene.updateMatrixWorld(true); { const hide = []; scene.traverse(o => { if (o.isMesh && /^Cube007/.test(o.name)) { const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); if (Math.abs(c.x - 3223.1) < .8 && Math.abs(c.z + 227.4) < .8) hide.push(o); } }); hide.forEach(o => o.visible = false); console.error('ARMCHAIR hidden', hide.length); }
  scene.updateMatrixWorld(true); { const mv = new Set(); scene.traverse(o => { if (!o.isMesh) return; const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()); if (c.x > 3221.7 && c.x < 3225.5 && c.z > -230.4 && c.z < -227.1 && c.y > 4.38 && c.y < 6.7 && b.max.x - b.min.x < 4 && b.max.y - b.min.y < 2.2) mv.add(o); });
    mv.forEach(o => { const wp = o.getWorldPosition(new THREE.Vector3()); wp.z -= .4; o.parent.updateMatrixWorld(true); o.parent.worldToLocal(wp); o.position.copy(wp); o.updateMatrixWorld(true); }); console.error('BEDMOVE', mv.size); }
  { const mv = new Set(); scene.traverse(o => { if (!o.isMesh) return; const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()); if (c.x > 3220.95 && c.x < 3221.7 && c.z > -231.0 && c.z < -229.6 && c.y > 0 && c.y < 1.6 && b.max.y - b.min.y < 1.6 && b.max.z - b.min.z < 1.5) mv.add(o); });
    mv.forEach(o => { const wp = o.getWorldPosition(new THREE.Vector3()); wp.z += .6; o.parent.updateMatrixWorld(true); o.parent.worldToLocal(wp); o.position.copy(wp); o.updateMatrixWorld(true); }); console.error('CONSOLEMOVE', mv.size); }
  const BEDTOP = (() => { const r = new THREE.Raycaster(new THREE.Vector3(3223.45, 6.5, -228.65), new THREE.Vector3(0, -1, 0)); const h = r.intersectObjects([T.root], true)[0]; return h ? h.point.y - 4.38 : .6; })(); console.error('BEDTOP', BEDTOP.toFixed(3));
  const DADY = (() => { const r = new THREE.Raycaster(new THREE.Vector3(3218.15, 4.2, -229.75), new THREE.Vector3(0, -1, 0)); const h = r.intersectObjects([T.root], true)[0]; return h ? h.point.y : 3.3; })(); console.error('DADY', DADY.toFixed(3));
  const FF = await footballField(scene, { cx: 3232.7, cz: -505.4 });
  // floor under a point (stairs, kerbs, bleachers): raycast down from above
  const ray = new THREE.Raycaster(), DN = new THREE.Vector3(0, -1, 0);
  const floorAt = (x, z, yTop = 50, list = [scene]) => { ray.set(new THREE.Vector3(x, yTop, z), DN); ray.far = yTop + 5; const hit = ray.intersectObjects(list, true).find(i => i.object.visible && i.object.isMesh && !i.object.isSprite && i.object.material?.colorWrite !== false); return hit ? hit.point.y : 0; };
  const sub = (x, z) => { const a = Math.abs(z); return a < 3.6 ? .012 : a < 3.88 ? .16 : a < 5.78 ? .14 : 0; };
  const ground = (x, z) => x > 2000 ? 0 : sub(x, z);
  const roadZ = x => -247.41 + (x - 3222) * .0373;   // street in front of House A (town.json): 12 m wide, house side = +z
  // ---------- set pieces ----------
  const door = hingeDoor(scene, [3220.84, 1.32, -231.39], { along: 'x', hinge: 1 });     // front door: hinge on the east side, opens inward (+z)
  const ens = hingeDoor(scene, [3226.36, 5.7, -227.84], { along: 'z', hinge: -1 });      // en-suite door (Mrs. Pam's hiding place), hinge north
  const van = await clapVan(); van.g.scale.setScalar(.88); scene.add(van.g);
  const pink = await loadRbx(133877355439325, { scale: .76, paint: { f8f8f8: { color: '#e889b4', kind: 'SmoothPlastic' } } }); scene.add(pink);
  { const b = new THREE.Box3().setFromObject(pink), z = b.max.z - .12, y = b.min.y + (b.max.y - b.min.y) * .42, hl = new THREE.MeshStandardMaterial({ color: '#fffbe8', emissive: '#fff4d0', emissiveIntensity: 4 });
    for (const x of [-.62, .62]) { const m = new THREE.Mesh(new THREE.SphereGeometry(.09, 14, 10), hl); m.scale.z = .4; m.position.set(x, y, z); pink.add(m); }
    const beam = new THREE.SpotLight('#fff2d6', 18, 18, .5, .6, 1.5); beam.position.set(0, y, z); beam.target.position.set(0, 0, z + 8); pink.add(beam, beam.target); }
  const momCar = await loadRbx(15233606123, { yaw: -Math.PI / 2, scale: .7 }); scene.add(momCar);
  const chair = await diningChairProp(); scene.add(chair);
  const CHB = new THREE.Box3().setFromObject(chair), CHTOP = (() => { let best = null; chair.updateMatrixWorld(true); chair.traverse(m => { if (!m.isMesh) return; const b = new THREE.Box3().setFromObject(m); if (!best || b.max.y > best.max.y) best = b; }); const c = best.getCenter(new THREE.Vector3()); return new THREE.Vector3(c.x - chair.position.x, best.max.y - .03 - chair.position.y, c.z - chair.position.z); })();   // backrest top rail = where the hands hold it
  const cake = await cakeWithCandles(7); scene.add(cake.g);
  const SC = await suitcase(); scene.add(SC.g);
  const purse = await loadRbx(5508770029).catch(() => null);
  const purseG = new THREE.Group(); scene.add(purseG); { const pm = new THREE.MeshStandardMaterial({ color: '#e16aa0', roughness: .45 }); const body = new THREE.Mesh(new THREE.BoxGeometry(.3, .2, .12), pm); body.position.y = .1; purseG.add(body);
    const strap = new THREE.Mesh(new THREE.TorusGeometry(.1, .012, 8, 24, Math.PI), pm); strap.position.y = .2; purseG.add(strap); }
  const phoneG = new THREE.Group(); { const { RoundedBoxGeometry } = await import('three/addons/geometries/RoundedBoxGeometry.js'); const body = new THREE.Mesh(new RoundedBoxGeometry(.078, .162, .009, 4, .008), new THREE.MeshStandardMaterial({ color: '#1b1c20', metalness: .6, roughness: .35 })); phoneG.add(body);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 512; const g = cv.getContext('2d'); g.fillStyle = '#0d1b2e'; g.fillRect(0, 0, 256, 512); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = 'bold 30px Poppins, sans-serif'; g.fillText('Calling...', 128, 120); g.font = 'bold 40px Poppins, sans-serif'; g.fillText('CLAP COPS', 128, 190); g.fillStyle = '#e03b3b'; g.beginPath(); g.arc(128, 430, 38, 0, 7); g.fill();
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const scr = new THREE.Mesh(new THREE.PlaneGeometry(.07, .148), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false })); scr.position.z = .0051; phoneG.add(scr); }
  // ---------- light ----------
  const LOOK = dayLook(scene, { sunAz: 160, sunEl: 45, sun: 3.3, fill: .9 }), post = LOOK.post;
  const TIMES = { day: { az: 200, el: 55, col: '#fffaf0', int: 3.4, fill: .9, hs: '#a9cbf2', hg: '#5f6e40', top: '#2f74d6', hor: '#cfe6fb', exp: 1.2 },
    night: { az: 200, el: 35, col: '#a9bdff', int: 1.15, fill: .85, hs: '#4a5d94', hg: '#2a2c36', top: '#0d1838', hor: '#2f4170', exp: 1.45 } };
  const P0 = (c, i, d, x, y, z) => { const L = new THREE.PointLight(c, 0, d, 1.6); L.position.set(x, y, z); L.userData.on = i; scene.add(L); return L; };
  const PRACT = [P0('#ffd2a0', 9, 9, 3225.4, 2.3, -225.9), P0('#9fb8ff', 3, 6, 3224.8, 1.3, -230.0), P0('#ffd8b0', 8, 8, 3219.8, 3.6, -228.6), P0('#ffd8b0', 7, 8, 3225.0, 7.7, -225.8), P0('#ffcf99', 7, 7, 3222.4, 6.2, -228.8), P0('#ffe2b8', 16, 10, 3220.84, 3.0, -232.9), P0('#ffd9a8', 14, 11, 3224.6, 3.4, -240.6)];
  const sirenWash = [P0('#ff3030', 0, 16, 3218, 2.2, -236), P0('#3060ff', 0, 16, 3224, 2.2, -236)];
  let skyKey = '';
  const light = (t, s) => { const L = TIMES[s.night ? 'night' : 'day']; const flip = ['lady', 'stands', 'fan'].includes(s.id) ? 180 : 0; LOOK.setSun(L.az + flip, L.el, { color: L.col, intensity: L.int, fill: L.fill }); LOOK.hemi.color.set(L.hs); LOOK.hemi.groundColor.set(L.hg); post.exposure = L.exp;
    if (skyKey !== (s.night ? 'n' : 'd')) { skyKey = s.night ? 'n' : 'd'; const a = L.az * Math.PI / 180; paintSky(LOOK.sky, L.top, L.hor, null, new THREE.Vector3(Math.sin(a), .05, Math.cos(a)).normalize()); }
    for (const p of PRACT) p.intensity = s.night ? p.userData.on : 0;
    const siren = s.night && (t > 31.4 || t < 2); van.siren(t, siren); const k = Math.sin(t * 13) > 0 ? 1 : 0; sirenWash[0].intensity = siren && t > 32.6 ? 14 * k : siren && t < 2 ? 14 * k : 0; sirenWash[1].intensity = siren && (t > 32.6 || t < 2) ? 14 * (1 - k) : 0; };

  // ---------- cast ----------
  const F = await J('topics/clap_cops/voice/flap.json'), flap = flapTrack(F, 0);
  const S = stage(scene, { POSES: P, ground, flap });
  const A = {}, mk = async (n, key, o) => (A[n] = await S.actor(key, o));
  await mk('boy', 'boy', { emo: 'neutral' }); await mk('boyUp', 'boy', { emo: 'scared' }); await mk('dad', 'dad', { emo: 'happy' }); await mk('dadR', 'dad_robe', { emo: 'scared' });
  await mk('mom', 'mom', { emo: 'happy' }); await mk('mia', 'mia', { emo: 'happy' }); await mk('dadB', 'dad', { emo: 'excited' }); await mk('momB', 'mom', { emo: 'laugh' });
  await mk('cop', 'clapcop', { emo: 'angry' }); await mk('pam', 'mrs_pam', { emo: 'scared' }); await mk('man', 'm047', { emo: 'happy' }); await mk('lady', 'f012', { emo: 'angry' });
  const CROWD = ['m011', 'f047', 'm024', 'f008', 'm037', 'f060', 'm048', 'f061', 'm062', 'f073', 'm063', 'f086', 'm035', 'f022', 'm050', 'f048', 'm073', 'f088'].filter(i => i !== 'f021');
  for (const [i, id] of CROWD.entries()) await mk('c' + i, id, { emo: ['happy', 'excited', 'laugh', 'happy'][i % 4] });
  A.fan = A.c0;

  // ======================= STAGING =======================
  const N = Math.PI;   // ry 0 faces +z (south), PI faces -z (north), PI/2 faces +x (east)
  const NIGHT_T = [[0, 1.96], [10.42, 44.5], [44.5, 99]];
  // --- the kick (cold open copy at t0 = .15 and the real one at 36.75): cop outside the door, kick, door flies, chair + boy go
  const KICKS = [0.15, 36.75];
  // door angle: shut, then (after the kick) swung in ~100 deg with a bounce
  const doorA = t => { for (const k of KICKS) if (t >= k - .02 && t < k + 2.6 + (k > 30 ? 99 : 0)) { const u = (t - k) / .32; return u < 0 ? 0 : -(u < 1 ? 1.75 * (1 - (1 - u) ** 3) : 1.75 - .12 * Math.sin((u - 1) * 6) * Math.exp(-(u - 1) * 2.5)); } return 0; };
  // ensuite door: ajar (open into the en-suite) until 29.55, then pulled shut from inside (fast, a click)
  const ensA = t => t < 29.55 ? -1.05 : t < 29.85 ? -1.05 * (1 - sm((t - 29.55) / .3)) : 0;
  // the cop
  A.cop.show(-1, 1.96).show(31.4, 44.5);
  for (const k of KICKS) { A.cop.key(k - .45, { pose: 'kickPrep', at: [3220.84, -233.2], ry: 0, dur: .25 }).key(k - .02, { pose: 'kick', dur: .12, ease: 'io' }).key(k + .35, { pose: 'copLook', at: [3220.9, -231.9], glide: .5, dur: .4 }); }
  A.cop.key(37.4, { pose: 'copLook', at: [3220.65, -230.6], ry: 0, glide: .5, dur: .4 }).key(39.95, { pose: 'copLook', ry: -.9, turn: .6, dur: .4 }).key(40.4, { pose: 'copLook', at: [3220.8, -232.0], ry: 0, glide: .4, turn: .3, dur: .4 }).key(40.8, { pose: 'copLook', at: [3219.45, -232.75], ry: N / 2, glide: .4, turn: .4, dur: .4 });
  // Dad in the robe on the stairs (cold open + 37.7-41.1): 4 steps below the top so he is under the stair opening, facing the door
  const DADST = [3218.27, -231.18]; const dadStY = () => 4.38;
  A.dadR.show(-1, 1.96).show(27.9, 30.48).show(37.74, 44.5);
  // the bedroom (27.9-30.48): kneel by the bed, shove the purse under it, look at the door, stand, shout at the door
  A.dadR.key(27.6, { pose: 'grabPurse', at: [3223.35, -227.48], ry: N, y: 4.38 }).key(28.0, { pose: 'hideBack', ry: -.86, turn: .45, dur: .4 }).key(29.05, { pose: 'shoutDoor', dur: .3 });
  // stairs: keys get y from the raycast in an extra hook
  A.dadR.key(-1, { pose: 'robeHold', at: DADST, ry: 0 }).key(0.3, { pose: 'caught', dur: .25, style: 'snap' });
  A.dadR.key(37.6, { pose: 'robeHold', at: DADST, ry: 0 }).key(37.9, { pose: 'caught', dur: .25 }).key(39.2, { pose: 'robeHold', dur: .5 }).key(39.84, { pose: 'shrugSmall', dur: .4 }).key(41.2, { pose: 'caught', dur: .5 }).key(43.2, { pose: 'robeHold', dur: .6 });
  A.dadR.extra = (t, a) => { if (t < 2 || t > 37) a.a.root.position.y += 4.38; };
  // the boy at the door (cold open + 32.7-38): carry chair in, wedge, back to the door, hit by the door, falls
  A.boy.show(-1, 1.96).show(15.1, 27.05).show(32.7, 47);
  A.boy.key(-1, { pose: 'wedge', at: [3220.42, -229.85], ry: N }).key(KICKS[0] + .08, { pose: 'fall', ry: -.35, dur: .35, style: 'snap' });
  // living room: on the sofa (seat front at z -225.7 facing north)
  const SOFA = [3224.0, -225.95];
  A.boy.key(15.0, { pose: 'sofa', at: SOFA, ry: N, y: .22 }).key(15.45, { pose: { ...P.sofa, head: { r: [0.15, -0.35, 0] }, armR: { r: [-0.95, 0, -0.1], o: [0, 0, 0.1] } }, dur: .3, ease: 'io' }).key(15.85, { pose: { ...P.sofa, head: { r: [0.2, 0.1, 0.05] } }, dur: .25, ease: 'io' }).key(16.12, { pose: 'sofaUp', dur: .14, ease: 'io' }).key(16.4, { pose: 'sofaUp2', dur: .14, ease: 'io' }).key(16.9, { pose: 'sofaUp', dur: .14, ease: 'io' })
    .key(17.36, { pose: 'sofaUp2', dur: .14, ease: 'io' }).key(17.62, { pose: 'sofaUp', dur: .12, ease: 'io' }).key(18.9, { pose: 'sofaLean', at: [SOFA[0], SOFA[1] - .14], y: .16, glide: .3, dur: .35 }).key(19.25, { pose: 'rise', at: [SOFA[0], SOFA[1] - .65], glide: .22, dur: .35 })
    .key(19.65, { pose: 'determined', dur: .3 }).key(20.0, { pose: 'phoneDial', dur: .3 }).key(20.9, { pose: 'phoneEar', dur: .35 }).key(22.45, { pose: 'scared', dur: .25 }).key(23.6, { pose: 'phoneYell', dur: .2, style: 'snap' }).key(24.9, { pose: 'scared', dur: .3 });
  A.boy.run(24.55, [[SOFA[0], SOFA[1] - .65], [3222.6, -227.3], [3221.3, -227.75], [3220.45, -227.0], [3220.15, -226.35]], { step: 1.15, T: .25, arm: .7 });
  A.boy.key(24.55, { pose: 'phoneEar', upper: true, hold: 2.1 });
  // up the stairs (Xavier's climb pose, POSE_LESSONS 11): two treads a stride, his pose and its mirror alternate, root follows the treads
  const CL = { armL: { r: [0.399, 0, -0.039], o: [0.051, 0, 0] }, armR: { r: [-0.247, 0, 0.038], o: [0, 0, 0.037] }, legL: { r: [-0.319, 0, -0.075], o: [-0.009, 0.6, 0.22] }, legR: { r: [0.14, 0, 0.064], o: [-0.028, -0.041, -0.191] }, head: { r: [-0.15, 0, 0] } };
  const mir = q => ({ r: [q.r[0], -q.r[1], -q.r[2]], o: [-q.o[0], q.o[1], q.o[2]] }), CLB = { armL: mir(CL.armR), armR: mir(CL.armL), legL: mir(CL.legR), legR: mir(CL.legL), head: CL.head };
  const mixP = (a, b, k) => { const o = {}; for (const n of ['armL', 'armR', 'legL', 'legR', 'head']) o[n] = { r: a[n].r.map((v, i) => v + (b[n].r[i] - v) * k), o: (a[n].o || [0, 0, 0]).map((v, i) => v + ((b[n].o || [0, 0, 0])[i] - v) * k) }; return o; };
  const T0C = 26.06, STR = .24, climb = t => { const k = Math.max(0, (t - T0C) / STR), i = Math.floor(k), u = sm(k - i), a = i % 2 ? CLB : CL, b = i % 2 ? CL : CLB, p = mixP(a, b, u);
    p.root = { x: 0, y: .085 + (i + u) * .55, z: .035 + (i + u) * .62, rx: .1 }; return p; };
  A.boy.key(26.3, { pose: climb, at: [3218.2, -225.93], ry: -N, dur: .01 });   // cut on action: the hall shot ends, the stair-top shot opens with him already two treads up
  // entry: carry the chair from the living passage to the door, wedge it, step aside, back to the door
  A.boy.run(32.6, [[3221.3, -227.6], [3220.6, -229.3], [3220.42, -229.85]], { step: .7, T: .3, arm: 0 });
  A.boy.key(32.6, { pose: 'carryChair', upper: true, hold: 1.6 }).key(34.15, { pose: 'wedge', at: [3220.42, -229.85], ry: N, dur: .35 }).key(34.6, { pose: 'wedge', dur: .3 }).key(34.95, { pose: 'wedgeYell', dur: .3 })
    .key(KICKS[1] + .08, { pose: 'fall', ry: -.35, dur: .35, style: 'snap' });
  A.boy.key(39.0, { pose: 'sitDaze', at: [3220.35, -229.15], ry: -.4, dur: .6 }).key(41.4, { pose: 'sitLook', dur: .5 });
  A.boy.extra = (t, a) => {  if (t > 35.5 && t < 36.72) a.a.root.position.z += .025 * Math.abs(Math.sin(t * 26)); for (const k of KICKS) if (t > k + .05 && t < k + 2.25) { const u = sm((t - k - .05) / .5); a.a.root.position.z += u * .9; a.a.root.position.x -= u * .15; } };
  // upstairs: pounding on the parents' door, then the ear to it
  A.boyUp.show(27.05, 27.9).show(30.48, 31.56);
  A.boyUp.key(27.0, { pose: 'pound', at: [3222.75, -225.95], ry: 2.6, y: 4.38 }).key(27.15, { pose: 'poundB', dur: .08, ease: 'io' }).key(27.3, { pose: 'pound', dur: .08, ease: 'io' }).key(27.45, { pose: 'poundB', dur: .08, ease: 'io' }).key(27.6, { pose: 'pound', dur: .08, ease: 'io' }).key(27.75, { pose: 'poundB', dur: .08, ease: 'io' })
    .key(30.3, { pose: 'earDoor', at: [3222.75, -226.2], ry: N / 2, y: 4.38, dur: .3 }).key(30.75, { pose: { ...P.earDoor, head: { r: [0.1, 0.3, 0.22] }, root: { ...(P.earDoor.root || {}), x: 0.05, rz: 0.06 } }, dur: .3, ease: 'io' }).key(31.2, { pose: { ...P.earDoor, head: { r: [-0.05, -0.2, -0.12] } }, dur: .25, ease: 'io' });
  // the clap man + the lady (suburb, day). Man on the north sidewalk facing south; lady across the road
  A.man.show(1.96, 6.04); A.lady.show(3.2, 4.34);
  A.man.key(1.9, { pose: 'relaxed', at: [-1.2, 4.75], ry: N / 2 + .25 }).key(2.45, { pose: 'clapOpen', dur: .28 }).key(2.78, { pose: 'clapShut', dur: .1, ease: 'io' }).key(3.05, { pose: 'clapShut', dur: .2 }).key(4.35, { pose: 'freeze', ry: N / 2 - .5, turn: .8, dur: .6 });
  A.lady.key(3.1, { pose: 'lady', at: [2.4, -4.8], ry: -.35 }).key(3.45, { pose: 'ladyB', dur: .18 }).key(3.7, { pose: 'lady', dur: .18 }).key(3.95, { pose: 'ladyB', dur: .18 }).key(4.2, { pose: 'lady', dur: .18 });
  // the van: drives in along the road from the west, stops behind the man (4.34-5.2); at night it races down House A's street (31.56-32.7) and parks
  const vanX = t => t < 4.34 ? -40 : t < 5.0 ? lerp(-26, -2.5, 1 - (1 - (t - 4.34) / .66) ** 2) : -2.5;
  // --- birthday (dining room, day): family round the table, Mia blows (6.25), jazz hands from 6.75
  const TBL = [3230.32, -222.78];
  A.mia.show(6.04, 8.32); A.dadB.show(6.04, 8.32); A.momB.show(6.04, 8.32);
  A.mia.key(5.9, { pose: 'relaxed', at: [3230.35, -221.35], ry: N }).key(6.1, { pose: 'blow', dur: .3 }).key(6.75, { pose: 'jazzB', dur: .35 });
  A.dadB.key(5.9, { pose: 'relaxed', at: [3228.75, -221.25], ry: N + .25 }).key(6.7, { pose: 'jazz', dur: .3 });
  A.momB.key(5.9, { pose: 'relaxed', at: [3231.95, -221.25], ry: N - .25 }).key(6.78, { pose: 'jazzB', dur: .3 });
  // jazz shimmer: the hands twist fast about the arm (r.y) once the pose is up
  for (const n of ['mia', 'dadB', 'momB']) { const a = A[n], ph = n.length; a.shimmer = t => t > 6.95 ? Math.sin(t * 34 + ph) * .45 : 0; a.extra = (t, A2) => { if (t > 6.8 && t < 8.4) A2.a.root.position.y += Math.abs(Math.sin(t * 9 + ph)) * .06; }; }
  // --- the stands (the town pitch): fans seated on the bleacher rows, snapping on beat (8.32-10.42)
  // --- Friday night: Mom rolls her suitcase down the path to her car at the kerb; Dad waves from the door
  const KERB = x => roadZ(x) + 4.7;
  A.mom.show(10.42, 12.72).show(41.08, 47);
  A.mom.run(10.3, [[3221.4, -238.6], [3221.75, -239.6], [3222.3, KERB(3222.3) + 1.25]], { step: .6, T: .38, arm: .35 });
  A.dad.show(12.72, 15.1);
  A.dad.key(12.6, { pose: 'wave', at: [3220.84, -232.25], ry: N }).key(13.05, { pose: { ...P.wave, armR: { r: [3.05, 0.1, 0.25], o: [-0.057, 0.252, -0.013] } }, dur: .25, ease: 'io' }).key(13.4, { pose: 'wave', dur: .25, ease: 'io' }).key(13.62, { pose: { ...P.wave, armR: { r: [3.05, 0.1, 0.25], o: [-0.057, 0.252, -0.013] } }, dur: .2, ease: 'io' });
  // living room (13.92): Dad in front of the east window (x 3226.9) facing the sofa, stretching
  A.dad.key(13.921, { pose: 'relaxed', at: [3226.55, -230.55], ry: .25 }).key(14.0, { pose: 'stretch', dur: .4 }).key(14.55, { pose: { ...P.stretch, head: { r: [-0.25, 0.3, 0.2] }, root: { ...(P.stretch.root || {}), rz: -0.1 } }, dur: .35, ease: 'io' });
  // Mrs. Pam: only in the last shot, tiptoeing from the west side of the house to her car, freezing in the siren light
  A.pam.show(44.5, 99);
  // Mrs. Pam crosses the side yard, which sits below the street level (y 0): drop her onto the real grass (Xavier 2026-11-25: she floated)
  // Pam's side yard sits 0.45 m below the street datum: her keys carry y so footLock plants her feet ON the lawn (an extra-hook
  // offset left the leg blocks at the old height: she floated, Xavier 2026-11-25)
  { const rcg = new THREE.Raycaster(), gm = new Map(); A.pam.ground = (x, z) => { const k = Math.round(x * 20) + ',' + Math.round(z * 20); if (!gm.has(k)) { rcg.set(new THREE.Vector3(x, 2.5, z), new THREE.Vector3(0, -1, 0)); rcg.far = 4; const h = rcg.intersectObjects([T.root], true).find(q => q.object.visible); gm.set(k, h ? h.point.y : 0); } return gm.get(k); }; }   // her own ground: walkway, lawn and porch are at different heights
  A.pam.key(44.4, { pose: 'relaxed', at: [3217.4, -236.55], ry: N * .8 });
  A.pam.run(44.5, [[3217.4, -236.55], [3218.6, -238.6]], { step: .9, T: .38, arm: 0, down: .055, lift: .09, style: { twist: .19, tilt: .09, lean: .12 } });   // the ref walk (youtube.com/shorts/1Ebe8EHIHE4) with her hands kept together
  A.pam.key(44.5, { pose: 'sneak', upper: true, hold: .55 }).key(45.05, { pose: 'sneakB', upper: true, hold: .5 }).key(45.55, { pose: 'sneak', upper: true, hold: .55 });
  A.pam.key(46.05, { pose: 'pamFreeze', at: [3218.6, -238.6], ry: 2.61, dur: .2, style: 'snap' });
  // Mom inside (41.08-): steps in behind the cop, suitcase behind her, looks up at Dad, hand to hip, the line
  A.mom.extra = (t, a) => { if (t > 41.6 && t < 42.7) { const P2 = a.a.rig.parts; P2.armL.position.x += .1; P2.armR.position.x -= .1; } };   // 1.30 m doorway vs a 1.36 m R6: arms in while she steps through
  A.mom.run(41.0, [[3220.73, -233.0], [3220.73, -231.0], [3220.5, -230.35]], { step: .65, T: .34, arm: 0 });
  A.mom.key(42.75, { pose: 'momHip', at: [3220.5, -230.35], ry: -1.15, turn: .5, dur: .5 }).key(43.0, { pose: 'momLine', dur: .3 });

  // ---------- faces (thought first: brows/eyes, then the mouth) + talk spans (only the speaker's mouth moves) ----------
  A.boy.face(-1, 'terrified').face(15.0, 'bored').face(16.1, 'confused').face(16.9, 'shocked').face(18.4, 'suspicious').face(19.5, 'determined').face(20.9, 'proud').face(22.4, 'scared').face(23.6, 'terrified').face(32.7, 'determined').face(35.0, 'scared').face(36.75, 'shocked');
  A.boy.talk(23.64, 24.3).talk(35.08, 35.95);
  A.boyUp.face(26.6, 'scared').face(30.3, 'confused'); A.boyUp.talk(27.04, 27.85);
  A.dad.face(12.6, 'happy').face(13.85, 'smug'); A.dad.talk(13.92, 14.48);
  // ---------- THUMBNAIL (opts.thumb = 'foil' | 'purse'; render t = 48.5 with opts.camP): Dad in the bedroom, hiding something behind his back ----------
  const TH = opts.thumb; let foil = null;
  if (TH) {
    P.susHide = { legL: { r: [0.06, 0, 0.07] }, legR: { r: [-0.12, 0, -0.06], o: [0, 0, 0.05] }, armR: { r: [0.42, 0, -0.2], o: [0, 0, -0.02] },
      armL: { r: [-0.15, 0, 0.12] }, head: { r: [0.06, -0.45, -0.06] }, root: { rx: 0.08, rz: 0.05, ry: -0.35 } };
    A.dadR.show(48, 49); A.dadR.key(48, { pose: 'susHide', at: [3223.7, -227.15], ry: N }); A.dadR.face(48, opts.thumbFace || 'nervous');
    if (TH === 'foil') {   // pink foil packet, crimped (jagged) edges, the wrapper stretched tight over a ring inside
      const cv = document.createElement('canvas'); cv.width = cv.height = 512; const g = cv.getContext('2d');
      const n = 30, a = 30, b = 482, zz = (x0, y0, x1, y1, o) => { for (let i = 0; i <= n; i++) { const k = i / n, d = i % 2 ? 0 : 16; g.lineTo(x0 + (x1 - x0) * k + o[0] * d, y0 + (y1 - y0) * k + o[1] * d); } };
      g.beginPath(); g.moveTo(a, a); zz(a, a, b, a, [0, -1]); zz(b, a, b, b, [1, 0]); zz(b, b, a, b, [0, 1]); zz(a, b, a, a, [-1, 0]); g.closePath();
      const gr = g.createLinearGradient(0, 0, 512, 512); gr.addColorStop(0, '#ffb3d6'); gr.addColorStop(.4, '#e8559a'); gr.addColorStop(.52, '#ffd6ea'); gr.addColorStop(.62, '#e04a92'); gr.addColorStop(1, '#b8286e'); g.fillStyle = gr; g.fill();
      g.save(); g.clip();
      g.strokeStyle = 'rgba(120,10,60,.35)'; g.lineWidth = 3; for (let k = 0; k < 4; k++) { g.beginPath(); g.rect(a + 18 + k * 7, a + 18 + k * 7, b - a - 36 - k * 14, b - a - 36 - k * 14); g.stroke(); }   // crimp seal band
      for (let k = 0; k < 26; k++) { const ang = k / 26 * Math.PI * 2 + (k % 3) * .05, r0 = 150, r1 = 190 + (k % 4) * 18; g.beginPath(); g.moveTo(256 + Math.cos(ang) * r0, 256 + Math.sin(ang) * r0); g.lineTo(256 + Math.cos(ang + .06) * r1, 256 + Math.sin(ang + .06) * r1); g.strokeStyle = k % 2 ? 'rgba(255,230,245,.7)' : 'rgba(110,8,55,.45)'; g.lineWidth = 3; g.stroke(); }   // stretch wrinkles off the ring
      const rg = g.createRadialGradient(236, 236, 60, 256, 256, 150); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(.75, 'rgba(120,10,60,.0)'); rg.addColorStop(.86, 'rgba(255,235,245,.95)'); rg.addColorStop(.93, 'rgba(110,8,55,.6)'); rg.addColorStop(1, 'rgba(110,8,55,0)'); g.fillStyle = rg; g.fillRect(0, 0, 512, 512);   // the ring pushing up under the foil
      g.restore();
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      foil = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ map: tx, alphaTest: .5, metalness: .35, roughness: .28, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: .22, side: THREE.DoubleSide });
      foil.add(new THREE.Mesh(new THREE.PlaneGeometry(.3, .3), mat));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.088, .012, 12, 48), new THREE.MeshStandardMaterial({ color: '#ff8cc4', metalness: .4, roughness: .25, emissive: '#e04a92', emissiveIntensity: .15 })); ring.position.z = .004; ring.scale.z = .6; foil.add(ring);   // the raised rim
      const dome = new THREE.Mesh(new THREE.SphereGeometry(.088, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#f070ad', metalness: .35, roughness: .3, transparent: true, opacity: .55 })); dome.rotation.x = Math.PI / 2; dome.scale.y = .08; dome.position.z = .002; foil.add(dome);
      scene.add(foil); }
  }
  A.dadR.face(-1, 'scared').face(27.6, 'nervous').face(28.2, 'scared').face(28.6, 'angry').face(37.7, 'scared').face(39.7, 'nervous').face(43.2, 'terrified'); A.dadR.talk(28.66, 29.4).talk(39.84, 40.75);
  A.mom.face(10.3, 'happy').face(41.0, 'neutral').face(42.0, 'suspicious').face(42.9, 'angry'); A.mom.talk(42.96, 44.35);
  A.cop.face(-1, 'angry').face(37.6, 'suspicious'); A.pam.face(44.5, 'scared').face(46.05, 'terrified');
  A.man.face(1.9, 'happy').face(3.3, 'neutral').face(4.4, 'scared'); A.lady.face(3.1, 'angry');
  A.mia.face(5.9, 'happy').face(6.1, 'neutral').face(6.7, 'excited');
  Object.values(A).forEach((a, ai) => a.blinks([1.2, 3.9, 7.4, 9.5, 12.1, 14.9, 17.9, 20.4, 23.1, 26.0, 29.9, 33.4, 36.3, 39.1, 42.1, 45.2].map(b => b + (ai % 5) * .07)));

  // ---------- hand props follow the hands ----------
  const hp = new THREE.Vector3(), hq = new THREE.Quaternion();
  // a phone held at the right ear: beside the head on the character's right, upright, screen out
  const atEar = (ph, actor) => { const H = handOf(actor, 'R'), dn = new THREE.Vector3(0, -1, 0).applyQuaternion(H.q); ph.position.copy(H.p).addScaledVector(dn, .1); ph.quaternion.copy(H.q); };   // gripped in the fist, sticking out past it along the forearm   // out past the end of the hand block so it reads (it was buried inside the fist)   // in the palm, always (2026-11-25 grip check: the phone floated 50 cm from the hand)   // in front of the hand block, against the cheek, so it reads
  const handOf = (actor, side = 'R') => { const part = actor.a.rig.parts['arm' + side], g = part.geometry ? part : part.children.find(c => c.geometry); g.updateWorldMatrix(true, false); if (!g.geometry.boundingBox) g.geometry.computeBoundingBox(); const b = g.geometry.boundingBox;   // palm = the bottom face of the arm block (measured from the mesh, 2026-11-25)
    const p = new THREE.Vector3((b.min.x + b.max.x) / 2, b.min.y + (b.max.y - b.min.y) * .06, (b.min.z + b.max.z) / 2).applyMatrix4(g.matrixWorld); g.getWorldQuaternion(hq); return { p, q: hq.clone() }; };
  // ---------- per-frame props ----------
  const props = (t, s) => {
    const rattle = t > 35.5 && t < 36.72 ? -.035 * Math.abs(Math.sin(t * 26)) : 0; door.set(t > 39 ? Math.min(doorA(t), -1.75 - .25 * sm((t - 39) / 1.5)) : doorA(t) + rattle);   // after the kick the cop pushes it fully open (room for Mom) ens.set(ensA(t));
    // van
    if (t < 7) { van.g.visible = t >= 4.34 && t < 6.04; van.g.position.set(vanX(t), .012, 1.6); van.g.rotation.y = -N / 2;   /* nose first (Xavier 2026-11-25: it drove backwards) */ van.earP.rotation.y = t < 5.2 ? 0 : Math.sin((t - 5.2) * 3.2) * .9; }
    else { van.g.visible = t >= 31.5; const u = cl((t - 31.56) / 1.6), x = lerp(3190, 3214.5, 1 - (1 - u) ** 2); van.g.position.set(x, .03, roadZ(x) + 2.6); van.g.rotation.y = -N / 2; van.earP.rotation.y = Math.sin(t * 1.4) * .4; }
    // cars on House A's street: Mom's car at the kerb, leaves at 12.9 (east); the pink car arrives from the west at 13.95 and parks
    const mx = t > 40 ? 3236.8 : t < 12.95 ? 3223.6 : 3223.6 + 3.2 * (t - 12.95) ** 2; momCar.visible = t < 14.5 || t > 40; momCar.position.set(mx, .03, KERB(mx) - 1.2); momCar.rotation.y = N;   /* nose first */
    const pu = cl((t - 13.95) / 1.1), px = t < 13.95 ? 3150 : lerp(3203, 3229.8, 1 - (1 - pu) ** 2.2); pink.visible = t > 13.9; pink.position.set(px, .03, KERB(px) - 1.2); pink.rotation.y = -N / 2;   /* nose first */
    // chair: carried (32.7-33.95) -> wedged under the handle -> knocked across the hall by the door
    chair.visible = (t > 32.69 && t < 40) || t < 2;
    if (t > 32.59 && t < 34.25) { const H = handOf(A.boy, 'R'), Lh = handOf(A.boy, 'L'); const m = H.p.clone().add(Lh.p).multiplyScalar(.5); chair.rotation.set(0, A.boy.a.root.rotation.y + N, 0); const off = CHTOP.clone().applyEuler(chair.rotation); chair.position.set(m.x - off.x, Math.max(.01, m.y - off.y), m.z - off.z); }
    else { const k = t < 2 ? KICKS[0] : KICKS[1], u = cl((t - k) / .55); const base = [3220.38, -230.62];
      chair.position.set(base[0] + u * .05, u > 0 ? .25 * Math.sin(u * N) : 0, base[1] + u * 2.45); chair.rotation.set(-.42 * (1 - u) + u * 1.4, N + u * 1.2, u * .6); chair.updateMatrixWorld(true); const lo = new THREE.Box3().setFromObject(chair).min.y; if (lo < .005) chair.position.y += .005 - lo; }
    // suitcase: in Mom's right hand (10.4-12.7 path, 41-42.5 in the door), standing on its wheels after she lets go
    SC.g.visible = (t > 10.3 && t < 12.72) || t > 41.0;
    if ((t > 10.3 && t < 12.65) || (t > 41.0 && t < 41.95)) { const H = handOf(A.mom, 'R'), r = A.mom.a.root.rotation.y, gy = H.p.y - .03, Lg = SC.gripY, d = Math.sqrt(Math.max(.01, Lg * Lg - gy * gy)), a = Math.atan2(d, gy);
      SC.g.position.set(H.p.x - Math.sin(r) * d, 0, H.p.z - Math.cos(r) * d); SC.g.rotation.set(0, r, 0); SC.g.rotateX(a); SC.g.translateZ(-SC.gripZ * Math.cos(a)); }
    else if (t >= 41.95) { SC.g.position.set(3219.75, 0, -232.1); SC.g.rotation.set(0, 0, 0); }
    else if (t > 12.65 && t < 12.72) SC.g.visible = false;
    // cake + candles (out when Mia blows at 6.32), purse (on the floor by the bed, then shoved under it)
    cake.g.visible = t > 5.5 && t < 8.4; cake.g.position.set(TBL[0], .88, TBL[1]); cake.set(t, 6.32);
    purseG.visible = t > 27.5 && t < 31; { const u = sm((t - 28.0) / .25); if (t < 27.98) { purseG.position.set(3223.45, 4.38 + BEDTOP + .03, -228.65); purseG.rotation.set(0, .4, 0); } else { const H = handOf(A.dadR, 'R'); purseG.position.set(H.p.x, H.p.y - .12, H.p.z); purseG.rotation.set(0, A.dadR.a.root.rotation.y, 0); } }
    // phone in the boy's right hand (19.9-25.3), dropped on the sofa after
    phone2.visible = t > 3.1 && t < 4.4; if (phone2.visible) atEar(phone2, A.lady);
    phoneG.visible = t > 19.9 && t < 26.3;
    if (phoneG.visible) atEar(phoneG, A.boy);
  };
  phoneG.scale.setScalar(2.3); scene.add(phoneG); const phone2 = phoneG.clone(); scene.add(phone2);

  // ---------- the stands: seat each fan on a bleacher row by raycasting the planks ----------
  scene.updateMatrixWorld(true);
  const BL = FF.bleachers, blBox = new THREE.Box3().setFromObject(BL); console.error('BLEACH', blBox.min.toArray().map(v => v.toFixed(1)).join(','), blBox.max.toArray().map(v => v.toFixed(1)).join(','));
  const zc = -505.4, rows = []; for (let x = blBox.min.x + .2; x < blBox.max.x - .2; x += .12) { const y = floorAt(x, zc + .3, blBox.max.y + 2, [BL]); if (y > .3 && (!rows.length || Math.abs(y - rows[rows.length - 1][1]) > .2)) rows.push([x, y]); }
  console.error('ROWS', rows.map(r => r.map(v => v.toFixed(2)).join('/')).join(' '));
  const seats = rows.slice(-12, -1).filter((r, i) => i % 2 === 0).reverse();   // front row first
  CROWD.forEach((id, i) => { const a = A['c' + i], r = seats[i % seats.length] || [3200, 1], col = Math.floor(i / Math.max(1, seats.length)), z = zc - 2.6 + col * 1.5 + (i % 2) * .15;
    a.show(8.32, 10.42); a.key(8.0, { pose: i % 3 ? 'sitSnap' : 'sitSnapB', at: [r[0] - .2, z], y: r[1] + .07, ry: N / 2 + (i % 3 - 1) * .12 });
    a.snap = t => (t > 8.4 ? Math.max(0, Math.sin((t + i * .13) * 8.5)) ** 6 : 0); });

  // ---------- camera ----------
  const bad = validate(SH); if (bad.length) console.error('SHOTS', bad.join('; '));
  const cam = new THREE.PerspectiveCamera(32, w / h, .15, 400);
  const pos = n => A[n].a.root.position;
  // ---------- camera solver (2026-11-25): every shot is placed relative to its subject (size -> distance, az from the
  // subject's facing, height by angle, move on top), then CHECKED by raycasts at 5 times: the line camera -> eyes and
  // camera -> chest must be clear both ways (no wall / prop / person between, camera not inside geometry), the camera must
  // stay inside the subject's room (or the room named in spec.room) under its ceiling. The first clear az nearest the
  // preferred one wins; blocked shots are printed (CAMBLOCK) so nothing goes out unchecked.
  const DIST = { wide: 6.6, full: 4.4, medium: 3.4, close: 2.6, xclose: 1.9 }, FOV = { wide: 46, full: 38, medium: 34, close: 30, xclose: 28 };
  const UP = { eye: 0, low: -.55, high: .65, top: 1.6 };
  const SPEC = {
    coldDad: { size: 'full', az: 10, angle: 'low', room: 'entry', aim: 'face', y: 1.2 }, clapMan: { size: 'full', az: 30 }, lady: { size: 'close', az: -10 },
    vanIn: { size: 'wide', az: -40, angle: 'low', aim: 'body' }, blow: { size: 'medium', az: 0, angle: 'high' }, jazz: { size: 'full', az: 12, aim: 'body' },
    fan: { size: 'close', az: -35 }, momOut: { size: 'full', az: -35, aim: 'body' }, dadDoor: { size: 'full', az: 5, angle: 'low' }, workout: { size: 'medium', az: 35 },
    sofa: { size: 'full', az: 35, angle: 'high', aim: 'body' }, faceUp: { size: 'close', az: -12, angle: 'low' }, standUp: { size: 'medium', az: 30 }, dial: { size: 'medium', az: 30, angle: 'high' },
    jail: { size: 'close', az: 45, minAz: 30 }, cancel: { size: 'medium', az: 45, angle: 'low', minAz: 10, until: 24.6 }, run: { size: 'full', az: -60, aim: 'body', room: ['entry', 'living'] }, pound: { size: 'medium', az: -80, angle: 'high', room: 'corr' },
    shove: { size: 'full', az: 35, angle: 'high', room: 'parents', aim: 'body' }, gotoroom: { size: 'medium', az: 10, room: 'parents' }, weird: { size: 'close', az: -70, room: 'corr' },
    chair: { size: 'full', az: 60, aim: 'body', room: ['entry', 'living'] }, asleep: { size: 'medium', az: 5, angle: 'low', room: ['entry', 'living'] }, kick: { size: 'wide', az: 25, angle: 'high', aim: 'body', room: ['entry', 'living'] },
    stairs: { size: 'full', az: -5, angle: 'low', room: 'entry', aim: 'face', y: 1.5 }, justme: { size: 'medium', az: 15, angle: 'low', room: 'entry', y: 2.1 }, momIn: { size: 'full', az: 12, room: ['entry', 'living'], aim: 'body' },
    momLine: { size: 'close', az: 14, room: ['entry', 'living'] }, pam: { size: 'full', az: 40, angle: 'low', aim: 'body' },
  };
  const ACT = Object.values(A);
  const STATIC = [T.root, FF.G, van.g, pink, momCar, chair, cake.g, SC.g, door.piv, ens.piv, ...scene.children.filter(o => o.isGroup && !ACT.some(a => a.a.root === o) && o !== T.root)];
  const rc = new THREE.Raycaster(); const vis = o => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
  const blocked = (from, to, self) => { const d = to.clone().sub(from), L = d.length(); d.normalize(); rc.set(from, d); rc.far = L - .2; rc.near = .05;
    const tg = [...STATIC, ...ACT.filter(a => a !== self && a.a.root.visible).map(a => a.a.root)];
    return rc.intersectObjects(tg, true).some(i => i.object.isMesh && vis(i.object) && i.object.material?.colorWrite !== false && !i.object.material?.transparent); };
  const roomOf = (p, name) => name ? ROOMS.find(r => r.id === name) : ROOMS.find(r => p.x > r.x0 && p.x < r.x1 && p.z > r.z0 && p.z < r.z1 && p.y > r.y - .5 && p.y < r.y + 3.9);
  const headOf = a => a.a.rig.parts.head.getWorldPosition(new THREE.Vector3());
  const camAt = (sp, s, u, az0, sub) => {   // sub = { foot, head, heading }
    const mv = s.move, d0 = DIST[sp.size] * (sp.dmul || 1), k = sm(u) * .3 + u * .7; let d = d0, az = az0 * Math.PI / 180, lat = 0, up = UP[sp.angle || s.angle] ?? 0;
    if (mv === 'push') d *= 1.18 - .3 * k; if (mv === 'pull') d *= .9 + .32 * k; if (mv === 'punch') d *= 1.35 - .5 * Math.min(1, u / .3);
    if (mv === 'orbitL' || mv === 'orbitR') az += (mv === 'orbitL' ? 1 : -1) * (.35 * s.speed) * (k - .5); if (mv === 'truckL' || mv === 'truckR') lat = (mv === 'truckL' ? 1 : -1) * .3 * s.speed * (k - .5);
    if (mv === 'craneUp' || mv === 'craneDown') up += (mv === 'craneUp' ? 1 : -1) * .5 * s.speed * (k - .5);
    const aim = sp.aim === 'body' ? sub.foot.clone().setY(sub.foot.y + (sub.head.y - sub.foot.y) * .62) : sub.head.clone().setY(sub.head.y - .06);
    const a = sub.heading + az, fx = Math.sin(a), fz = Math.cos(a);
    const p = new THREE.Vector3(aim.x + fx * d + fz * lat, sp.y != null ? sp.y + (up - (UP[sp.angle || s.angle] ?? 0)) : aim.y + up, aim.z + fz * d - fx * lat);
    return { p, l: aim, fov: Math.min(62, 2 * Math.atan(Math.tan(FOV[sp.size] * Math.PI / 360) / (sp.dmul || 1)) * 180 / Math.PI) };
  };
  const subOf = (s, t) => { const a = A[s.who]; const sp0 = SPEC[s.id]; if (sp0?._frz && t > sp0.until) return sp0._frz; return { foot: a.a.root.position.clone(), head: headOf(a), heading: a.a.root.rotation.y, act: a }; };
  const okCam = (c, sub, sp) => { const RS = sp.room ? [].concat(sp.room).map(n => ROOMS.find(r => r.id === n)) : [roomOf(sub.foot.clone().setY(sub.foot.y + .1))].filter(Boolean);
    if (RS.length) { if (!RS.some(R0 => c.p.x > R0.x0 + .2 && c.p.x < R0.x1 - .2 && c.p.z > R0.z0 + .2 && c.p.z < R0.z1 - .2 && c.p.y > R0.y + .35 && c.p.y < R0.y + 4.0)) return 99; }
    else if (c.p.y < .35) return 99;
    let n = 0; const chest = sub.foot.clone().setY(sub.foot.y + (sub.head.y - sub.foot.y) * .55);
    if (blocked(c.p, c.l, sub.act)) n++; if (blocked(c.l, c.p, sub.act)) n++; if (blocked(c.p, chest, sub.act)) n += .5; return n; };
  const CHOICE = {};
  const solve = (s, propsFn) => { const sp = SPEC[s.id]; if (!sp) return; const samples = [];
    for (const u of [0, .25, .5, .75, 1]) { const t = Math.min(s.t + u * s.dur * .98 + .01, sp.until ?? 1e9); S.update(t); propsFn(t, s); scene.updateMatrixWorld(true); samples.push([u, subOf(s, t)]); }
    let best = null; for (const dm of [1, .78, .6, .46]) { if (best && best.sc === 0) break; for (const dz of [0, 15, -15, 30, -30, 45, -45, 60, -60, 75, -75, 90, -90].filter(q => Math.abs(sp.az + q) <= (sp.maxAz ?? 100) && (sp.minAz == null || sp.az + q >= sp.minAz))) { const az = sp.az + dz; sp.dmul = dm;
      for (const [u, sub] of [samples[0], samples[2], samples[4]]) { /* geometry only for the cheap pass */ }
      let sc = 0; for (const [u, sub] of samples) { const tq = Math.min(s.t + u * s.dur * .98 + .01, sp.until ?? 1e9); S.update(tq); propsFn(tq, s); scene.updateMatrixWorld(true); sc += okCam(camAt(sp, s, u, az, sub), sub, sp); if (sc >= (best?.sc ?? 1e9)) break; }
      if (!best || sc < best.sc - .01) best = { az, sc, dm }; if (sc === 0) break; } }
    CHOICE[s.id] = best.az; sp.dmul = best.dm;
    if (sp.until) { S.update(sp.until); propsFn(sp.until, s); scene.updateMatrixWorld(true); const a = A[s.who]; sp._frz = { foot: a.a.root.position.clone(), head: headOf(a), heading: a.a.root.rotation.y, act: a }; } if (best.sc) console.error('CAMBLOCK', s.id, 'score', best.sc, 'az', best.az, 'dm', best.dm); else console.error('CAM', s.id, 'az', best.az, 'dm', best.dm); };
  const shakeAt = t => { for (const s of SH) if (s.shake && t >= s.shake[0] && t < s.shake[1]) { const k = 1 - (t - s.shake[0]) / (s.shake[1] - s.shake[0]); return k * .03; } return 0; };
  const CAM = {
    coldKick: u => ({ p: [3220.62 + u * .05, 1.45, lerp(-227.15, -227.6, u)], l: [3220.85, 1.15, -231.0], fov: 46 }),
    ear: u => { const e = van.earP.getWorldPosition(new THREE.Vector3()), f = van.earP.getWorldDirection(new THREE.Vector3()), a = Math.atan2(f.x, f.z) + (u - .5) * .5; return { p: [e.x + Math.sin(a) * 2.8, e.y + .5, e.z + Math.cos(a) * 2.8], l: [e.x, e.y + .7, e.z], fov: 34 }; },
    stands: u => ({ p: [lerp(3206.5, 3206.2, u), lerp(1.9, 2.5, u), zc + 3.2], l: [seats[1] ? seats[1][0] : 3195, seats[1] ? seats[1][1] + .9 : 3.5, zc - .8], fov: 40 }),
    sirens: u => { const v = van.g.position; return { p: [3203.5, 1.0, roadZ(3203.5) + 8.6], l: [v.x, 1.2, v.z], fov: 48 }; },
    coldDad: u => ({ p: [3218.45, lerp(1.25, 1.35, u), lerp(-225.35, -225.6, u)], l: [3218.15, 6.1, -231.18], fov: lerp(40, 36, u) }),
    stairs: u => ({ p: [3218.4, lerp(1.45, 1.85, u), lerp(-225.3, -225.5, u)], l: [3218.15, 5.75, -231.18], fov: lerp(31, 29, u) }),
    justme: u => ({ p: [3217.78, lerp(3.35, 3.5, u), lerp(-228.3, -228.6, u)], l: [3218.15, 6.05, -231.18], fov: 36 }),
    kick: u => ({ p: [3221.1, 2.4, -225.6], l: [3220.85, .9, -230.4], fov: lerp(50, 44, Math.min(1, u * 3)) }),
    chair: u => { const b = A.boy.a.root.position; if (u > .6) return { p: [lerp(3221.0, 3221.1, u), 1.65, lerp(-227.7, -227.85, u)], l: [3220.8, 0.95, -231.1], fov: 46 }; return { p: [3221.05, lerp(2.05, 2.15, u), -230.75], l: [b.x, 0.95, b.z], fov: 60 }; },
    asleep: u => ({ p: [lerp(3221.3, 3221.25, u), lerp(1.55, 1.5, u), lerp(-230.95, -230.85, u)], l: [3220.62, 1.35, -230.15], fov: lerp(62, 56, u) }),   // from the door corner: his face yelling at the door, the chair under his hands
    momIn: u => ({ p: [lerp(3221.25, 3221.3, u), 1.5, lerp(-227.3, -227.7, u)], l: [3220.8, 1.2, -231.2], fov: 40 }),
    momLine: u => ({ p: [lerp(3219.15, 3219.3, u), 1.75, lerp(-229.85, -229.95, u)], l: [3220.42, 1.6, -230.3], fov: lerp(46, 40, u) }),   // she faces west, up at Dad on the stairs
    momOut: u => { const m = A.mom.a.root.position; return { p: [lerp(3225.4, 3225.1, u), 1.6, lerp(-243.4, -243.2, u)], l: [m.x, 1.15, m.z], fov: 36 }; },
    pound: u => ({ p: [lerp(3225.6, 3225.4, u), 6.0, -225.2], l: [3222.85, 5.75, -226.1], fov: 40 }),
    weird: u => ({ p: [lerp(3225.2, 3225.0, u), 5.95, -225.5], l: [3222.75, 5.85, -226.1], fov: 34 }),
    shove: u => ({ p: [lerp(3225.9, 3225.8, u), lerp(5.95, 5.85, u), -226.95], l: [3223.4, 5.15, -227.8], fov: 60 }),
    gotoroom: u => ({ p: [lerp(3221.98, 3222.08, u), 6.0, -226.86], l: [3223.75, 5.7, -227.55], fov: 50 }),
    blow: u => ({ p: [3230.35, 1.38, lerp(-223.9, -223.6, u)], l: [3230.35, 1.36, -221.3], fov: 34 }),
    jazz: u => ({ p: [3230.3, lerp(1.4, 1.5, u), lerp(-225.6, -226.5, u)], l: [3230.35, 1.5, -221.3], fov: lerp(50, 46, u) }),
    pam: u => { const b = A.pam.a.root.position; return { p: [lerp(3219.85, 3220.25, u), lerp(.5, .6, u), lerp(-240.75, -241.45, u)], l: [b.x, b.y + 1.0, b.z], fov: lerp(40, 44, u) }; },   // in front of her path: she sneaks toward us, freezes facing us
    runHall: u => { const b = A.boy.a.root.position; return { p: [lerp(3223.3, 3223.0, u), 1.45, -229.6], l: [b.x, 1.0, b.z], fov: 44 }; },
    run: u => { const b = A.boy.a.root.position; return { p: [3218.15, 6.25, -231.05], l: [3218.15 + (b.x - 3218.15) * .3, Math.max(.9, b.y + 1.1), Math.max(-229.5, Math.min(-225.6, b.z))], fov: 46 }; },
    cancel: u => { const b = (t => { const q = A.boy.a.root.position; return q; })(); return { p: [3223.3, 1.3, -229.95], l: [Math.min(b.x, 3224.2), 1.45, Math.max(b.z, -227.6)], fov: 42 }; },
  };
  for (const s of SH) if (!CAM[s.id]) solve(s, props);
  const update = t => {
    const s = SH.slice().reverse().find(q => t >= q.t) || SH[0], u = cl((t - s.t) / s.dur);
    light(t, s); S.update(t);
    // extra channels: jazz shimmer and crowd snaps applied on top of the posed arms
    for (const n of ['mia', 'dadB', 'momB']) if (A[n].a.root.visible && A[n].shimmer) { const k = A[n].shimmer(t); A[n].a.rig.parts.armL.rotateY(k); A[n].a.rig.parts.armR.rotateY(-k); }
    CROWD.forEach((id, i) => { const a = A['c' + i]; if (a.a.root.visible) a.a.rig.parts[i % 3 ? 'armR' : 'armL'].rotateX(-a.snap(t) * .55); });
    props(t, s); if (TH && t > 47.5) { const H = handOf(A.dadR, 'R'), dn = new THREE.Vector3(0, -1, 0).applyQuaternion(H.q); if (foil) { purseG.visible = false; foil.visible = true; const side = new THREE.Vector3(Math.cos(A.dadR.a.root.rotation.y), 0, -Math.sin(A.dadR.a.root.rotation.y)); foil.position.copy(H.p).add(new THREE.Vector3(opts.fx ?? .2, opts.fy ?? -.06, opts.fz ?? -.08)); foil.lookAt(cam.position); foil.rotateZ(.35); } else { purseG.visible = true; purseG.position.set(H.p.x, H.p.y - .14, H.p.z); purseG.rotation.set(0, N * .3, 0); } }
    const o = globalThis.VIEW || opts;
    if (o.camP) { cam.position.set(...o.camP); cam.lookAt(...o.camL); cam.fov = o.fov || 34; }
    else { const C = CAM[s.id] ? CAM[s.id](sm(u) * .3 + u * .7) : (() => { const c = camAt(SPEC[s.id], s, u, CHOICE[s.id], subOf(s, t)); return { p: c.p.toArray(), l: c.l.toArray(), fov: c.fov }; })(), hh = (f, q) => Math.sin(t * f + q) * .012 + Math.sin(t * f * 2.7 + q * 3) * .006;   // constant-speed travel + handheld
      cam.position.set(C.p[0] + hh(1.3, 1), C.p[1] + hh(1.1, 2), C.p[2] + hh(1.2, 3)); cam.fov = C.fov; cam.lookAt(C.l[0] + hh(1.5, 4), C.l[1] + hh(1.4, 5), C.l[2]); const sk = shakeAt(t); if (sk) { cam.rotateX(Math.sin(t * 61) * sk); cam.rotateZ(Math.sin(t * 47) * sk); } }
    cam.updateProjectionMatrix(); LOOK.sky.position.copy(cam.position);
    const sp = A[s.who] ? A[s.who].a.root.position : van.g.position; if (o.look !== false) LOOK.follow(cam, { x: sp.x, y: sp.y, z: sp.z });
    cam.updateMatrixWorld(true); return true;
  };
  update(opts.t ?? 0);
  return { camera: cam, sun: LOOK.sun, post, update, dbg: { A, town: T.root, props: { chair, purse: purseG, suitcase: SC.g, phone: phoneG, phone2 },
    holds: [{ t0: 19.95, t1: 26.25, who: 'boy', side: 'R', obj: phoneG, name: 'phone' }, { t0: 3.15, t1: 4.35, who: 'lady', side: 'R', obj: phone2, name: 'phone2' },
      { t0: 32.75, t1: 34.2, who: 'boy', side: 'R', obj: chair, name: 'chair' }, { t0: 32.75, t1: 34.2, who: 'boy', side: 'L', obj: chair, name: 'chair' },
      { t0: 28.0, t1: 30.4, who: 'dadR', side: 'R', obj: purseG, name: 'purse' }, { t0: 10.45, t1: 12.6, who: 'mom', side: 'R', obj: SC.g, name: 'suitcase' }, { t0: 41.05, t1: 41.9, who: 'mom', side: 'R', obj: SC.g, name: 'suitcase' }] } };
}
