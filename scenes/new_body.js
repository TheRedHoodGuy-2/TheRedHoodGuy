// 10 NEW BODY ("In this town, say the same words at the same time, and you swap lives for 24 hours").
// Voice: topics/new_body/voice/take.mp3 (48.66 s, Xavier's take, "for mommy" cut). SHOTS.md v2 approved 2026-11-28 01:27.
// Subscribe = NEW version rackfocus_crier_v1 (in-story ending; selfie stays the library default).
// Locations: bus on the town street (frame-0 POOF), House A up (wrong bedroom + the boy's room), classroom (party /
// twins / taped-Dana), auditorium (choir chain poof), school hallway (Dana's locker, the ask, the swap, the ending),
// House B ground (Dana's perfect life), comic split rig (the watch gag + the trigger).
import * as THREE from 'three';
import { stage } from '../engine/act.js';
import { buildTown } from '../engine/sets/town.js';
import { buildHouse } from '../engine/sets/house.js';
import { furnishHouse } from '../engine/designs/furnish.js';
import { classroom } from '../engine/sets/classroom.js';
import { busInterior, auditorium, schoolHallway, comicSplit, swapFX } from '../engine/sets/new_body_set.js';
import { dayLook, paintSky } from '../engine/look.js';
import { validate } from '../engine/shots.js';
import { limbTo } from '../engine/r6pose.js';
import { flapTrack } from '../engine/lipsync.js';
import { canvasTex } from '../engine/util.js';

const J = async p => (await fetch(new URL(p, document.baseURI))).json();
export const DUR = 50.9;   // voice ends 48.42; rack focus + ~2 s silence, cut mid-sob (loops into the bus POOF)
const lerp = (a, b, k) => a + (b - a) * k, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = u => { u = cl(u); return u * u * (3 - 2 * u); };
const fa = (part, hand, elbow, root = {}) => limbTo(part, root, hand, elbow);
const N = Math.PI;

// ---------------- poses ({ r, o } avatar frame: arm r.x < 0 = forward, armL r.z > 0 = out, head r.x > 0 = down) ----------------
const legsEasy = { legL: { r: [0.04, 0, 0.03], o: [0.01, 0, 0.02] }, legR: { r: [-0.06, 0, -0.05], o: [-0.02, 0.01, -0.03] } };
const P = {
  relaxed: { ...legsEasy, armL: { r: [-0.14, 0, 0.0] }, armR: { r: [0.1, 0, 0.01] }, head: { r: [0.04, 0.12, 0.02] }, root: { x: 0.03, rz: 0.03 } },
};
// --- bus pair: sitting side by side sharing earbuds, singing (heads tilted toward each other), then staring at their own hands
const sit = { legL: { r: [-0.093, 0.057, 0.063], o: [0.028, 0.061, 0.309] }, legR: { r: [-0.023, 0.092, -0.169], o: [-0.056, 0.044, 0.336] }, root: { x: 0.017, y: -0.06, z: -0.033 } };   // Xavier's hip-as-butt sit
P.busSingL = { ...sit, armL: { r: [-0.5, 0, 0.38], o: [0, 0, 0.06] }, armR: { r: [-0.25, 0, -0.1] }, head: { r: [-0.18, 0.28, 0.3] }, root: { ...sit.root, rz: 0.12 } };       // leans RIGHT toward his seatmate, one arm half up vibing
P.busSingR = { ...sit, armR: { r: [-0.72, 0, -0.45], o: [0, 0.03, 0.08] }, armL: { r: [0.1, 0, 0.08] }, head: { r: [-0.12, -0.3, -0.26] }, root: { ...sit.root, rz: -0.1 } };  // leans LEFT, arm higher (never mirrored)
P.busHandsL = { ...sit, armL: fa('armL', [0.26, 0.74, 0.5], [0.42, 0.85, 0.3], sit.root), armR: fa('armR', [-0.24, 0.66, 0.48], [-0.42, 0.8, 0.3], sit.root), head: { r: [0.38, 0.1, 0.05] }, root: { ...sit.root, rx: 0.08 } };   // hands low over the lap, palms up, staring down at them (face stays visible)   // both hands up in front, staring DOWN at them
P.busHandsR = { ...sit, armL: fa('armL', [0.22, 0.66, 0.52], [0.42, 0.78, 0.3], sit.root), armR: fa('armR', [-0.28, 0.8, 0.46], [-0.42, 0.85, 0.3], sit.root), head: { r: [0.36, -0.15, -0.08] }, root: { ...sit.root, rx: 0.06, rz: -0.06 } };
// --- bedroom: kid frozen under the duvet, grandma leaning over the bed for the forehead kiss
P.bedSitUp = { legL: { r: [-1.5708, 0, .08] }, legR: { r: [-1.52, 0, -.1], o: [0, .02, .03] }, armL: { r: [.25, 0, .35], o: [0, 0, -.04] }, armR: { r: [.3, 0, -.3], o: [0, 0, -.04] }, head: { r: [-.1, .25, 0] }, root: { y: -.51, rx: -.05 } };   // bolt upright in the wrong bed, legs under the duvet, hands on it
P.bedFrozen = { legL: { r: [-1.52, 0, 0.06] }, legR: { r: [-1.45, 0, -0.1], o: [0, 0.02, 0.04] }, armL: { r: [-0.2, 0, 0.3], o: [0, 0, 0.05] }, armR: { r: [-0.15, 0, -0.28], o: [0, 0, 0.05] }, head: { r: [-0.25, 0.1, 0] }, root: { y: -0.45, rx: -1.35 } };   // on his back, stiff, arms pinned at his sides over the duvet
P.grandmaLean = { legL: { r: [0.12, 0, 0.08] }, legR: { r: [-0.3, 0, -0.06], o: [0, 0.05, -0.1] }, armL: fa('armL', [0.35, 0.78, 0.5], [0.45, 0.9, 0.2], { rx: 0.55 }), armR: fa('armR', [-0.4, 0.72, 0.55], [-0.45, 0.88, 0.2], { rx: 0.55 }), head: { r: [0.5, 0, 0.06] }, root: { rx: 0.55, y: -0.12, z: 0.18 } };   // bent over the bed, hands on the duvet edge, face down to his forehead
// --- class party: kids singing ONE AT A TIME (each a small solo pose), the rest dead still with side eyes
P.soloSing = { legL: { r: [0.05, 0, 0.1] }, legR: { r: [-0.08, 0, -0.06] }, armL: { r: [-0.45, 0, 0.3], o: [0, 0, 0.04] }, armR: { r: [0.1, 0, -0.06] }, head: { r: [-0.2, 0.1, 0.08] }, root: { rz: 0.05 } };
P.awkwardStand = { legL: { r: [0.02, 0, 0.05] }, legR: { r: [-0.04, 0, -0.03] }, armL: { r: [0.06, 0, 0.1] }, armR: { r: [0.04, 0, -0.08] }, head: { r: [0.1, 0.22, 0] }, root: {} };
P.cakeLean = { ...P.awkwardStand, armR: fa('armR', [-0.2, 0.95, 0.4], [-0.42, 0.9, 0.1]), head: { r: [0.28, -0.1, 0] }, root: { rx: 0.1 } };
// --- choir: mouths open mid-anthem, arms at folders (one forearm block as the folder hold); principal facepalm
P.choirSing = i => ({ legL: { r: [0.03, 0, 0.05 + (i % 3) * 0.02] }, legR: { r: [-0.05, 0, -0.04] }, armL: fa('armL', [0.2, 0.95, 0.42], [0.42, 0.9, 0.12]), armR: fa('armR', [-0.2, 0.95, 0.42], [-0.42, 0.9, 0.12]), head: { r: [-0.22 - (i % 2) * 0.06, (i % 3 - 1) * 0.08, 0] }, root: { rz: (i % 2 ? 1 : -1) * 0.02 } });
P.facepalm = { legL: { r: [0.04, 0, 0.08] }, legR: { r: [-0.06, 0, -0.04] }, armR: fa('armR', [-0.12, 1.42, 0.28], [-0.42, 1.05, 0.06]), armL: { r: [0.1, 0, 0.12] }, head: { r: [0.5, 0.08, 0.05] }, root: { rx: 0.1 } };
P.principalWatch = { legL: { r: [0.02, 0, 0.06] }, legR: { r: [-0.05, 0, -0.04] }, armL: { r: [0.1, 0, 0.15] }, armR: fa('armR', [-0.25, 0.9, 0.35], [-0.42, 0.85, 0.08]), head: { r: [-0.15, 0.1, 0] }, root: {} };
// --- twins + teacher
P.teachPoint = { legL: { r: [-0.06, 0, 0.1] }, legR: { r: [0.05, 0, -0.05] }, armR: fa('armR', [-0.5, 1.25, 0.6], [-0.42, 1.05, 0.15]), armL: { r: [0.12, 0, 0.14] }, head: { r: [-0.06, -0.15, 0] }, root: { rx: -0.04 } };
P.teachPointB = { ...P.teachPoint, armR: fa('armR', [0.5, 1.25, 0.6], [0.42, 1.05, 0.15]), head: { r: [-0.06, 0.2, 0] } };
P.teachGiveUp = { ...sit, armL: { r: [-0.75, 0, 0.2], o: [0, -0.02, 0.08] }, armR: { r: [-0.7, 0, -0.18], o: [0, -0.02, 0.08] }, head: { r: [0.45, 0.1, 0.1] }, root: { ...sit.root, rx: 0.2 } };   // slumped on her chair, head down
P.twinStand = s => ({ legL: { r: [0.03, 0, 0.08] }, legR: { r: [-0.05, 0, -0.05] }, armL: { r: [0.08, 0, 0.1] }, armR: { r: [0.05, 0, -0.1] }, head: { r: [0.05, s * 0.2, 0] }, root: { rz: s * 0.03 } });
// --- Dana at her locker: arms crossed (forearms slid to the chest), weight on one hip, chin up
P.danaLocker = { legL: { r: [-0.08, 0, 0.16], o: [0.03, 0, 0.02] }, legR: { r: [0.1, 0, -0.04] }, armL: fa('armL', [0.16, 1.02, 0.3], [0.42, 0.95, 0.05]), armR: fa('armR', [-0.1, 0.96, 0.32], [-0.42, 0.9, 0.05]), head: { r: [-0.12, -0.15, -0.06] }, root: { x: 0.05, rz: -0.05 } };
P.danaProud = { ...P.danaLocker, head: { r: [-0.2, 0.1, -0.1] } };
P.danaTense = { ...P.danaLocker, head: { r: [0.05, 0.45, 0.04] }, root: { x: 0.05, rz: -0.05, rx: 0.04 } };   // eyes slide away, chin drops a touch
P.danaShrug = { legL: { r: [-0.05, 0, 0.14] }, legR: { r: [0.08, 0, -0.05] }, armL: { r: [-0.4, 0, 0.9], o: [0.05, 0.08, 0.02] }, armR: { r: [-0.35, 0, -0.85], o: [-0.05, 0.08, 0.02] }, head: { r: [0.12, 0.2, 0.14] }, root: { rz: 0.04 } };   // resigned shrug, palms out, head tilted
P.danaAnswer = { ...P.danaLocker, head: { r: [0.02, -0.3, -0.04] } };
// --- classroom shouting (shot 7): every kid different, arms up { r, o } raised-arm form, Dana dead still
P.shoutA = { legL: { r: [0.1, 0, 0.3] }, legR: { r: [-0.1, 0, -0.12] }, armR: { r: [3.0, -0.4, 0.35], o: [-0.057, 0.252, -0.013] }, armL: { r: [-0.3, 0, 0.5] }, head: { r: [-0.3, 0.1, 0.1] }, root: { rz: -0.06, rx: -0.08 } };
P.shoutB = { legL: { r: [-0.08, 0, 0.2] }, legR: { r: [0.1, 0, -0.2] }, armL: { r: [2.85, 0.3, -0.25], o: [0.057, 0.252, -0.013] }, armR: { r: [-0.6, 0, -0.4] }, head: { r: [-0.35, -0.15, -0.1] }, root: { rz: 0.07 } };
P.shoutC = { ...sit, armR: { r: [3.05, -0.3, 0.2], o: [-0.05, 0.25, 0] }, armL: fa('armL', [0.3, 0.85, 0.4], [0.42, 0.8, 0.2], sit.root), head: { r: [-0.25, 0.2, 0.08] } };   // seated, one arm straight up
P.danaStill = { ...sit, armL: { r: [-0.72, 0, 0.1], o: [0, -0.02, 0.06] }, armR: { r: [-0.72, 0, -0.1], o: [0, -0.02, 0.06] }, head: { r: [0.02, 0, 0] }, root: sit.root };   // hands folded on the desk, PERFECTLY still (the joke)
// --- Dana's house: dad at the sink, Dana at breakfast
P.dadDishes = { legL: { r: [0.02, 0, 0.08] }, legR: { r: [-0.04, 0, -0.05] }, armL: fa('armL', [0.3, 0.95, 0.42], [0.42, 0.9, 0.15]), armR: fa('armR', [-0.25, 0.88, 0.45], [-0.42, 0.85, 0.15]), head: { r: [0.35, 0, 0.02] }, root: { rx: 0.14 } };   // bent a touch over the sink, both hands in it (different heights)
P.danaBreakfast = { ...sit, armR: fa('armR', [-0.22, 0.82, 0.4], [-0.42, 0.8, 0.1], sit.root), armL: { r: [-0.6, 0, 0.14], o: [0, -0.02, 0.06] }, head: { r: [0.22, -0.1, 0] } };   // fork hand up, content
// --- boy's room: writing the list at the desk (shoulder-as-elbow writing)
P.writeList = { ...sit, armR: fa('armR', [-0.28, 0.62, 0.46], [-0.42, 0.7, 0.2], sit.root), armL: fa('armL', [0.3, 0.6, 0.42], [0.42, 0.68, 0.2], sit.root), head: { r: [0.52, -0.06, 0.04] }, root: { ...sit.root, rx: 0.3 } };
P.writeLook = { ...P.writeList, head: { r: [0.3, 0.15, 0.02] } };
// --- the hallway ask: boy taps his bare wrist (the "what time is it" mime), mock innocent
P.wristTap = { legL: { r: [-0.05, 0, 0.1] }, legR: { r: [0.06, 0, -0.06] }, armL: fa('armL', [0.12, 1.0, 0.38], [0.42, 0.95, 0.1]), armR: fa('armR', [-0.05, 1.02, 0.34], [-0.42, 0.95, 0.08]), head: { r: [-0.08, 0.2, 0.06] }, root: { rz: -0.03 } };   // left forearm up flat, right fingertip tapping it
P.wristTapB = { ...P.wristTap, armR: fa('armR', [-0.02, 1.08, 0.3], [-0.42, 0.95, 0.08]), head: { r: [-0.12, 0.24, 0.1] } };
P.mockInnocent = { legL: { r: [-0.06, 0, 0.12] }, legR: { r: [0.08, 0, -0.04] }, armL: { r: [-0.15, 0, 0.2] }, armR: { r: [0.1, 0, -0.1] }, head: { r: [-0.15, 0.3, 0.12] }, root: { rz: 0.05 } };
// --- the swap + ending
P.midSwapBoy = { legL: { r: [-0.2, 0, 0.45] }, legR: { r: [0.25, 0, -0.3] }, armL: { r: [2.9, 0.4, -0.3], o: [0.06, 0.25, -0.01] }, armR: { r: [-1.2, 0, -0.9], o: [0, 0.05, 0.1] }, head: { r: [-0.4, 0.2, 0.15] }, root: { rx: -0.1, rz: 0.08 } };
P.midSwapDana = { legL: { r: [0.3, 0, 0.35] }, legR: { r: [-0.2, 0, -0.4] }, armL: { r: [-0.9, 0, 0.8], o: [0, 0.04, 0.08] }, armR: { r: [2.95, -0.35, 0.3], o: [-0.06, 0.25, -0.01] }, head: { r: [-0.3, -0.25, -0.12] }, root: { rx: -0.08, rz: -0.07 } };
P.yellFlail = t => { const k = Math.sin(t * 9), k2 = Math.sin(t * 9 + 1.2); return { legL: { r: [-0.1, 0, 0.25] }, legR: { r: [0.12, 0, -0.18] }, armL: { r: [-1.5 - 0.3 * k, 0, 0.75 + 0.2 * k2], o: [0, 0.06, 0.1] }, armR: { r: [-1.4 + 0.3 * k2, 0, -0.8 - 0.2 * k], o: [0, 0.06, 0.1] }, head: { r: [-0.28 + 0.06 * k, 0.1, 0.08] }, root: { rx: -0.08, rz: 0.03 * k } }; };   // Dana (in his body) yelling, arms flailing
P.povIdle = { legL: { r: [0.02, 0, 0.06] }, legR: { r: [-0.04, 0, -0.04] }, armL: { r: [0.08, 0, 0.1] }, armR: { r: [0.05, 0, -0.08] }, head: { r: [0, 0, 0] }, root: {} };
P.povHandL = { ...P.povIdle, armL: fa('armL', [0.2, 1.28, 0.66], [0.42, 1.1, 0.25]), head: { r: [0.12, 0.12, 0] } };   // hand out low-left in the POV frame                      // left hand up into the POV frame, eyes on it
P.povHandLR = { ...P.povIdle, armL: fa('armL', [0.26, 1.16, 0.6], [0.42, 1.1, 0.25]), armR: fa('armR', [-0.16, 1.3, 0.66], [-0.42, 1.1, 0.25]), head: { r: [0.1, -0.12, 0] } };   // left drops a little, right comes up low-right   // both hands up, eyes to the right one
P.smugNew = { legL: { r: [-0.08, 0, 0.14], o: [0.02, 0, 0.04] }, legR: { r: [0.06, 0, -0.06] }, armL: fa('armL', [0.36, 0.9, -0.04], [0.62, 1.08, -0.12]), armR: { r: [0.1, 0, -0.12] }, head: { r: [-0.15, -0.2, -0.08] }, root: { rz: 0.05 } };   // hand on hip, chin up (his smug, now in her body)
P.talkToLens = { ...P.smugNew, armR: { r: [-0.35, 0, -0.2], o: [0, 0.02, 0.04] }, head: { r: [-0.1, 0.05, -0.05] } };
// Xavier 04:44 ending: his selfie pose (pose-editor screenshot): right arm up at the lens, left fist at the mouth; then the AIR KISS:
// the left hand leaves the lips and opens out toward the lens. Built on P.selfie (the selfie_wave_v1 body), facing ry 0 = the lens.
P.selfieKissIdle = { armL: { r: [-1.596, -0.38, -1.234], o: [0.129, -0.065, 0.136] }, armR: { r: [-2.315, -0.59, -0.426], o: [-0.422, 0.804, 0.559] }, legL: { r: [0.345, 0.019, 0.253], o: [0.092, 0.028, -0.05] }, legR: { r: [0.262, 0.056, -0.1], o: [-0.027, -0.046, -0.055] }, head: { r: [-0.307, -0.57, -0.078] }, root: { x: -0.204, y: 0.071, z: 0.178, rx: -0.268, ry: 0.014, rz: -0.212 } };
P.selfieKissLips = { ...P.selfieKissIdle, armL: fa('armL', [-0.02, 1.47, 0.26], [0.3, 1.12, 0.32], P.selfieKissIdle.root), head: { r: [-0.25, -0.5, -0.1] } };
P.selfieKissOut = { ...P.selfieKissIdle, armL: fa('armL', [0.22, 1.62, 0.78], [0.36, 1.3, 0.42], P.selfieKissIdle.root), head: { r: [-0.36, -0.55, -0.16] } };
// Xavier 04:50 'myPose': after the kiss she swings the phone arm out so the selfie camera finds the crying boy behind her
P.myPose = { armL: { r: [-1.571, -0.689, -1.502], o: [0.063, -0.065, 0.057] }, armR: { r: [-1.885, -0.346, -0.052], o: [-0.285, 0.334, 1.477] }, legL: { r: [0.363, -0.015, 0.261], o: [0.094, 0.008, -0.031] }, legR: { r: [0.238, 0.167, 0.325], o: [-0.025, -0.083, -0.038] }, head: { r: [-0.064, -0.264, -0.016] }, root: { x: -0.198, y: 0.092, z: 0.119, rx: -0.203, ry: 0.054, rz: -0.22 } };
P.crierCurl = t => { const s = Math.sin(t * 5.2), b = Math.max(0, Math.sin(t * 5.2 + .6)); return { legL: { r: [-1.35, 0.2, 0.15], o: [0.03, 0.08, 0.1] }, legR: { r: [-1.1, -0.15, -0.2], o: [-0.05, 0.06, 0.12] }, armL: fa('armL', [0.2, 1.3, 0.35], [0.42, 1.0, 0.1], { y: -0.5, rx: 0.5 }), armR: fa('armR', [-0.18, 1.26, 0.38], [-0.42, 1.0, 0.1], { y: -0.5, rx: 0.5 }), head: { r: [0.6 + 0.04 * s, 0.1, 0.06] }, root: { y: -0.5, rx: 0.5, rz: 0.03 * s, x: 0.01 * b } }; };   // on the floor, knees up, hands over his face, shoulders SHAKING (never frozen)
export { P };

export const POSE_SHEET = [
  ['01 Bus kid L: singing, leaning in', 'swapA', 'busSingL', 'happy', 'seat'], ['02 Bus kid R: singing, leaning in', 'swapB', 'busSingR', 'happy', 'seat'],
  ['03 Bus kid L: stares at his new hands', 'swapA', 'busHandsL', 'shocked', 'seat'], ['04 Bus kid R: stares at her new hands', 'swapB', 'busHandsR', 'shocked', 'seat'],
  ['05 Kid frozen under the duvet', 'swapA', 'bedFrozen', 'shocked', 'bed'], ['06 Wrong grandma: forehead kiss lean', 'f025', 'grandmaLean', 'happy', ''],
  ['07 Party kid: solo verse', 'm026', 'soloSing', 'nervous', ''], ['08 Party kid: waiting his turn', 'm001', 'awkwardStand', 'bored', ''], ['09 Birthday kid over the cake', 'f007', 'cakeLean', 'sad', ''],
  ['10 Choir kid mid-anthem', 'f001', 'choirSing', 'happy', 'riser'], ['11 Principal: watching proud', 'principal', 'principalWatch', 'happy', ''], ['12 Principal: facepalm', 'principal', 'facepalm', 'annoyed', ''],
  ['13 Teacher points at twin A', 'teacher', 'teachPoint', 'annoyed', ''], ['14 Teacher points at twin B', 'teacher', 'teachPointB', 'angry', ''], ['15 Teacher gives up, sits', 'teacher', 'teachGiveUp', 'bored', 'seat'],
  ['16 Twin standing', 'twinA', 'twinStand', 'happy', ''],
  ['17 Dana at her locker, arms crossed', 'dana', 'danaLocker', 'smug', ''], ['18 Dana proud ("not once")', 'dana', 'danaProud', 'smug', ''],
  ['19 Class shouting A (standing)', 'm026', 'shoutA', 'excited', ''], ['20 Class shouting B (standing)', 'f001', 'shoutB', 'excited', ''], ['21 Class shouting C (seated)', 'm001', 'shoutC', 'excited', 'seat'],
  ['22 Dana: taped, perfectly still', 'dana', 'danaStill', 'neutral', 'seat'],
  ['23 Dana at breakfast, content', 'dana', 'danaBreakfast', 'happy', 'seat'], ['24 Dad doing the dishes', 'dana_dad', 'dadDishes', 'happy', ''],
  ['25 Dana: the tension (eyes slide)', 'dana', 'danaTense', 'nervous', ''],
  ['26 Dana answers (comic panel)', 'dana', 'danaAnswer', 'bored', ''], ['27 Dana: resigned shrug', 'dana', 'danaShrug', 'sad', ''],
  ['28 Boy writing the list', 'boy', 'writeList', 'determined', 'seat'], ['29 Boy: list, look up (idea)', 'boy', 'writeLook', 'smug', 'seat'],
  ['30 Boy taps his bare wrist (the ask)', 'boy', 'wristTap', 'happy', ''], ['31 Boy: mock innocent', 'boy', 'mockInnocent', 'smug', ''],
  ['32 Mid-swap: boy flails', 'boy', 'midSwapBoy', 'shocked', ''], ['33 Mid-swap: Dana flails', 'dana', 'midSwapDana', 'shocked', ''],
  ['34 His body (Dana inside): yelling', 'boy', 'yellFlail', 'angry', ''],
  ['35 POV: left hand up', 'dana', 'povHandL', 'neutral', ''], ['36 POV: both hands up', 'dana', 'povHandLR', 'neutral', ''],
  ['37 Her body (him inside): smug', 'dana', 'smugNew', 'smug', ''], ['38 Her body: talks to the lens', 'dana', 'talkToLens', 'smug', ''],
  ['39 The crier (his body, Dana inside)', 'boy', 'crierCurl', 'crying', 'floor'],
];

// ---------------- the shot list (times = voice/words.json; labels for validate()) ----------------
const SH = [
  { t: 0.00, dur: 4.60, id: 'busPoof', who: 'swapA', size: 'medium', angle: 'eye', move: 'push', speed: 1.8 },
  { t: 4.60, dur: 3.20, id: 'bedroom', who: 'swapA', size: 'full', angle: 'high', move: 'craneDown', speed: 1.0 },
  { t: 7.80, dur: 2.18, id: 'party', who: 'kidSolo', size: 'wide', angle: 'eye', move: 'truckL', speed: 1.4 },
  { t: 9.98, dur: 1.98, id: 'choir', who: 'principal', size: 'wide', angle: 'low', move: 'truckR', speed: 2.2 },
  { t: 11.96, dur: 3.66, id: 'twins', who: 'teacher', size: 'medium', angle: 'eye', move: 'push', speed: 0.8 },
  { t: 15.62, dur: 3.44, id: 'danaLocker', who: 'dana', size: 'full', angle: 'eye', move: 'orbitL', speed: 1.3 },
  { t: 19.06, dur: 1.90, id: 'taped', who: 'dana', size: 'wide', angle: 'high', move: 'punch', speed: 2.4 },
  { t: 20.96, dur: 1.50, id: 'danaTable', who: 'dana', size: 'medium', angle: 'eye', move: 'push', speed: 1.5 },
  { t: 22.46, dur: 0.82, id: 'dishes', who: 'dana_dad', size: 'full', angle: 'eye', move: 'truckL', speed: 2.6 },
  { t: 23.28, dur: 1.02, id: 'quietHall', who: 'dana', size: 'wide', angle: 'eye', move: 'push', speed: 1.1 },
  { t: 24.30, dur: 1.52, id: 'pancakes', who: 'dana', size: 'xclose', angle: 'high', move: 'punch', speed: 2.2 },
  { t: 25.82, dur: 1.72, id: 'danaTense', who: 'dana', size: 'close', angle: 'eye', move: 'push', speed: 0.7 },
  { t: 27.54, dur: 2.85, id: 'askTime', who: 'dana', size: 'medium', angle: 'eye', move: 'push', speed: 1.2 },
  { t: 30.39, dur: 2.31, id: 'danaReply', who: 'dana', size: 'close', angle: 'low', move: 'push', speed: 0.7 },
  { t: 32.70, dur: 1.88, id: 'danaShrug', who: 'dana', size: 'medium', angle: 'eye', move: 'pull', speed: 1.6 },
  { t: 34.58, dur: 2.34, id: 'deskList', who: 'boy', size: 'close', angle: 'high', move: 'push', speed: 1.2 },
  { t: 36.92, dur: 2.20, id: 'hallAsk', who: 'boy', size: 'full', angle: 'eye', move: 'track', speed: 1.8 },
  { t: 39.12, dur: 1.72, id: 'comic2', who: 'dana', size: 'wide', angle: 'eye', move: 'hold', speed: 0.5 },
  { t: 40.84, dur: 2.46, id: 'midSwap', who: 'boy', size: 'medium', angle: 'low', move: 'orbitR', speed: 1.5 },
  { t: 43.30, dur: 2.70, id: 'povHands', who: 'dana', size: 'close', angle: 'eye', move: 'hold', speed: 0.3 },
  { t: 46.00, dur: 1.12, id: 'pullOut', who: 'dana', size: 'medium', angle: 'eye', move: 'pull', speed: 2.8 },
  { t: 47.12, dur: 3.78, id: 'ending', who: 'dana', size: 'close', angle: 'eye', move: 'push', speed: 0.5 },
];
export const SHOTS = SH;

// ---------------- world coordinates ----------------
const BUS = { x: 3221, z: -243.2, ry: N / 2 };       // parked at House A's kerb, nose -x: windows see the houses + lawns
const HUP = [8550, 0, 0];                             // House A up floor, origin dropped so the room floors sit at y 0
const HBG = [8650, 0, 120];                           // House B ground floor (Dana's)
const CLS = [9000, 0, 300];                           // classroom (party / twins / taped)
const AUD = [9300, 0, 0];                             // auditorium
const HALL = { x: 9150, z: -300 };                    // school hallway
const CSPL = { x: 9500, z: 0 };                       // comic rig

export async function build({ scene, W: w, H: h, opts = {} }) {
  const t00 = performance.now();
  // ---------- sets ----------
  const T = await buildTown(scene, { interiors: false });
  T.root.position.x += 3000; T.root.position.y += .45; scene.updateMatrixWorld(true);
  const rcg = new THREE.Raycaster(), gmem = new Map(), DOWN = new THREE.Vector3(0, -1, 0);
  const ground = (x, z) => { if (x > 5000) return 0; const k = Math.round(x * 10) + ',' + Math.round(z * 10); if (gmem.has(k)) return gmem.get(k);
    rcg.set(new THREE.Vector3(x, 2.4, z), DOWN); rcg.far = 3.4; const hit = rcg.intersectObject(T.root, true).find(q => q.object.isMesh && q.object.visible && !q.object.isInstancedMesh && q.face && q.face.normal.y > .7 && q.point.y < .62);
    const y = hit ? hit.point.y : 0; gmem.set(k, y); return y; };

  const bus = busInterior({ rows: 5 }); bus.position.set(BUS.x, ground(BUS.x, BUS.z) + .55, BUS.z); bus.rotation.y = BUS.ry; scene.add(bus);  // bus floor ~.55 over the road (real school bus floor height)
  scene.updateMatrixWorld(true);
  const busLocal = (lx, ly, lz) => bus.localToWorld(new THREE.Vector3(lx, ly, lz));

  const HA = await buildHouse(scene, 'A', { floors: ['up'], origin: [HUP[0], -4.38, HUP[2]] });   // 'his' room floor lands at y 0
  await furnishHouse(scene, HA, ['his', 'parents']);
  const HB = await buildHouse(scene, 'B', { floors: ['ground'], origin: HBG });
  await furnishHouse(scene, HB, ['kitchen', 'hallG', 'dining']);
  const roomW = (H, id, lx, lz) => { const r = H.rooms[id].rect, o = H.root.position; return [o.x + r.x + lx, o.z + r.z + lz]; };   // room-local (from its NW corner) -> world x,z
  const roomY = (H, id) => H.root.position.y + H.rooms[id].y;

  const C = await classroom(scene); C.root.position.set(CLS[0], 0, CLS[2]); scene.updateMatrixWorld(true);
  const clsW = (lx, lz) => [CLS[0] + lx, CLS[2] + lz];
  { const ch = await (await import('../engine/designs/school.js')).chair(); ch.position.set(CLS[0] + 1.5, 0, CLS[2] - 4.55); ch.rotation.y = -.4; scene.add(ch); }   // the chair the teacher drops onto (shot 5): already there, behind her

  const aud = auditorium(); aud.position.set(AUD[0], 0, AUD[2]); scene.add(aud);
  const audU = aud.userData;
  const hall = await schoolHallway({ len: 16 }); hall.position.set(HALL.x, 0, HALL.z); scene.add(hall);
  const comic = comicSplit({ x: CSPL.x, z: CSPL.z });
  comic.g.position.y = 20; scene.add(comic.g);   // floats in its own space; nothing else in frame
  const fx = swapFX(scene);
  console.error('SETS ms', (performance.now() - t00).toFixed(0));

  // ---------- props ----------
  const matte = c => new THREE.MeshStandardMaterial({ color: c, roughness: .8 });
  // earbud wire between the bus pair (thick enough to read: .018 tube), buds on each head
  const wireMat = new THREE.MeshStandardMaterial({ color: '#f4f4f6', roughness: .4 });
  const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(0, -0.2, 0), new THREE.Vector3(0, 0, 0)]), 16, .018, 6), wireMat); scene.add(wire);
  const budL = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8), wireMat), budR = budL.clone(); scene.add(budL, budR);
  // birthday cake on a classroom desk: two tiers + candles
  const cake = new THREE.Group(); { const t1 = new THREE.Mesh(new THREE.CylinderGeometry(.26, .26, .14, 24), matte('#f3e3f2')), t2 = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .12, 24), matte('#f8f0e2'));
    t1.position.y = .07; t2.position.y = .20; cake.add(t1, t2);
    for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .09, 8), matte('#e8655a')); const a = i / 5 * N * 2; c.position.set(Math.cos(a) * .1, .3, Math.sin(a) * .1); cake.add(c);
      const f = new THREE.Mesh(new THREE.SphereGeometry(.016, 8, 6), new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#ffb53c', emissiveIntensity: 2.4 })); f.position.set(c.position.x, .36, c.position.z); cake.add(f); } }
  cake.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(cake);
  // party hats (cones) for the party kids, placed per-frame on heads
  const hats = [0, 1, 2].map(i => { const hmesh = new THREE.Mesh(new THREE.ConeGeometry(.14, .3, 16), matte(['#e8655a', '#4f9ad6', '#f2c94c'][i])); hmesh.castShadow = true; scene.add(hmesh); return hmesh; });
  // tape over Dana's mouth: a small cross of two pale strips stuck to the head front
  const tape = new THREE.Group(); for (const r of [.5, -.5]) { const s = new THREE.Mesh(new THREE.BoxGeometry(.3, .07, .012), matte('#d8d2c2')); s.rotation.z = r; tape.add(s); } scene.add(tape);
  // the to-do list: paper + marker; the text reads in the insert
  const listTex = canvasTex(512, 640, (g, W2, H2) => { g.fillStyle = '#f7f4ea'; g.fillRect(0, 0, W2, H2); g.strokeStyle = '#d8d2c0'; for (let y = 90; y < H2; y += 58) { g.beginPath(); g.moveTo(30, y); g.lineTo(W2 - 30, y); g.stroke(); }
    g.fillStyle = '#20242c'; g.font = 'bold 44px sans-serif'; g.fillText('THINGS TO DO:', 36, 64);
    g.font = '36px sans-serif'; const L = ['1. drive the car', '2. the pool. all day', '3. eat MY snacks', '4. skip chores', '5. pancakes x10']; L.forEach((s, i) => g.fillText(s, 44, 140 + i * 58)); });
  const list = new THREE.Mesh(new THREE.PlaneGeometry(.42, .52), new THREE.MeshStandardMaterial({ map: listTex, roughness: .9 })); list.rotation.x = -N / 2; scene.add(list);
  const marker = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .14, 10), matte('#20242c')); scene.add(marker);
  // pancakes + syrup pour (Dana's kitchen table)
  const pan = new THREE.Group(); { for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.16 - i * .008, .17 - i * .008, .035, 20), matte(i % 2 ? '#d9a65a' : '#c9924a')); p.position.y = .04 + i * .036; pan.add(p); }
    const butter = new THREE.Mesh(new THREE.BoxGeometry(.06, .025, .06), matte('#f2d879')); butter.position.y = .24; pan.add(butter);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(.24, .2, .03, 24), matte('#f2efe6')); plate.position.y = .015; pan.add(plate); }
  pan.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(pan);
  const syr = new THREE.Mesh(new THREE.CylinderGeometry(.008, .011, 1, 8), new THREE.MeshPhysicalMaterial({ color: '#8a4a12', roughness: .25, transmission: .25 })); scene.add(syr);
  const jug = new THREE.Mesh(new THREE.CylinderGeometry(.045, .055, .17, 14), new THREE.MeshPhysicalMaterial({ color: '#9a5a1c', roughness: .3, transmission: .4 })); scene.add(jug);

  // ---------- cast ----------
  const F = await J('topics/new_body/voice/flap.json'), flap = flapTrack(F, 0);
  // opts.nocast: set/camera checks without the cast (grey stand-in blocks where people stand, so framing still reads)
  const S = opts.nocast ? (() => { const list = []; return { update: t => { for (const d of list) d.upd(t); },
    actor: async () => { const root = new THREE.Group(), parts = {}; const gm = new THREE.MeshStandardMaterial({ color: '#9aa3ad', roughness: .8 });
      const mkp = (n, w, hh, d, y, x = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), gm); m.position.set(x, y, 0); m.castShadow = true; root.add(m); parts[n] = m; };
      mkp('legL', .33, .68, .33, .34, -.17); mkp('legR', .33, .68, .33, .34, .17); mkp('torso', .68, .68, .34, 1.02); mkp('armL', .33, .68, .33, 1.02, -.51); mkp('armR', .33, .68, .33, 1.02, .51); mkp('head', .4, .4, .4, 1.6);
      scene.add(root); const D = { a: { root, rig: { parts }, skinMat: gm, bodyMat: gm }, keys: [], spans: [], key(t, k) { this.keys.push({ t, ...k }); this.keys.sort((x, y) => x.t - y.t); return this; }, show(a, b) { this.spans.push([a, b]); return this; },
        run(t, path) { this.keys.push({ t, at: path[0] }, { t: t + .8, at: path[path.length - 1] }); this.keys.sort((x, y) => x.t - y.t); return {}; }, face() { return this; }, talk() { return this; }, lift: 0,
        upd(t) { root.visible = !this.spans.length || this.spans.some(([a, b]) => t >= a && t < b); let at = null, ry = 0, y = 0; for (const k of this.keys) if (k.t <= t) { if (k.at) { at = k.at; y = k.y ?? 0; } if (k.ry != null) ry = k.ry; }
          if (at) { root.position.set(at[0], ground(at[0], at[1]) + (y > 50 ? 0 : y), at[1]); root.rotation.y = ry; } if (this.extra) this.extra(t, this); } };
      list.push(D); return D; } }; })() : stage(scene, { POSES: P, ground, flap });
  const A = {}, mk = async (n, key, o = {}) => (A[n] = await S.actor(key, o));
  await mk('boy', 'boy'); await mk('dana', 'dana', { emo: 'smug' });
  await mk('swapA', 'swapA', { emo: 'happy' }); await mk('swapB', 'swapB', { emo: 'happy' });
  await mk('grandma', 'f025', { emo: 'happy' });
  await mk('teacher', 'teacher', { emo: 'annoyed' }); await mk('principal', 'principal', { emo: 'happy' });
  await mk('twinA', 'twinA'); await mk('twinB', 'twinB');
  await mk('dana_dad', 'dana_dad', { emo: 'happy' });
  const BANK = ['m026', 'm001', 'f001', 'f007', 'f002', 'm002', 'f003', 'm027', 'f004', 'm003', 'f013', 'm028'];   // 0-5 = classroom kids too; 6-11 only fill the choir
  const kids = []; for (let i = 0; i < 12; i++) kids.push(await mk('kid' + i, BANK[i]));
  A.kidSolo = A.kid0;

  // ======================= STAGING =======================
  // --- 1: THE BUS. Frame 0 = inside the POOF; it clears by ~.8 s; both kids stare at their new hands; mailman cameo passes the window ---
  const BZ = -bus.userData.L / 2 + 1.6 + 2 * 1.55;   // 3rd row
  const seatL = busLocal(-2.15, .69, BZ + .08), seatR = busLocal(-.95, .69, BZ + .08);   // same bench, window kid + aisle kid, 1.2 m apart (inner arms posed up/forward so they don't meet)
  A.swapA.show(0, 4.60); A.swapB.show(0, 4.60);
  A.swapA.key(-1, { pose: 'busSingL', at: [seatL.x, seatL.z], ry: BUS.ry + N, y: seatL.y - ground(seatL.x, seatL.z) });
  A.swapA.key(0.55, { pose: 'busHandsL', dur: .4 }).key(2.6, { pose: { ...P.busHandsL, head: { r: [0.25, 0.55, 0.1] } }, dur: .35 }).key(3.3, { pose: 'busHandsL', dur: .3 });   // look at the other kid, back to the hands
  A.swapB.key(-1, { pose: 'busSingR', at: [seatR.x, seatR.z], ry: BUS.ry + N, y: seatR.y - ground(seatR.x, seatR.z) });
  A.swapB.key(0.62, { pose: 'busHandsR', dur: .4 }).key(2.75, { pose: { ...P.busHandsR, head: { r: [0.22, -0.5, -0.1] } }, dur: .35 }).key(3.45, { pose: 'busHandsR', dur: .3 });
  A.swapA.face(-1, 'happy').face(0.55, 'shocked').face(3.6, 'scared');
  A.swapB.face(-1, 'happy').face(0.62, 'shocked').face(3.7, 'scared');
  A.swapA.noClamp = true; A.swapB.noClamp = true;   // seated above the road: the clamp would yank them to the asphalt
  const mid = busLocal(-1.55, 1.3, BZ + .1);
  fx.poof(-0.06, [mid.x, mid.y, mid.z], { size: 1.5, dur: 1.15, n: 26 });
  // mailman on skates glides past outside the window (lore cameo, through the glass behind them)
  await mk('mailman', 'mailman_skates', { emo: 'happy' }); A.mailman.noClamp = true; A.mailman.show(1.2, 4.1);
  A.mailman.extra = (t, a) => { const u = cl((t - 1.2) / 2.6); const R = a.a.root; const x0 = BUS.x - 6, x1 = BUS.x + 7;   // passes along the sidewalk beyond the far window
    R.position.set(lerp(x0, x1, u), ground(lerp(x0, x1, u), BUS.z - 4.1) + .95, BUS.z - 4.1); R.rotation.y = N / 2; R.rotation.z = Math.sin(t * 5) * .04; };
  A.mailman.key(1.1, { pose: t => ({ legL: { r: [.05 + Math.max(0, Math.sin(t * 5)) * .35, 0, -.1] }, legR: { r: [-.05 - Math.max(0, -Math.sin(t * 5)) * .35, 0, .1] }, armL: { r: [.3, 0, .25] }, armR: { r: [-1.2, 0, -.3] }, head: { r: [0, -.3, 0] }, root: { rx: .16 } }), at: [BUS.x - 6, BUS.z - 4.1] });

  // --- 2: BEDROOM (House A guest room = the "wrong" room): kid under the duvet frozen, wrong grandma leans in for the kiss ---
  const BED2 = [8556.25, 2.3]   /* parents' bed centre (probed: x 8554.6-8557.9, headboard -x; z 1.26-3.34) */;
  const bed2 = BED2, bedY = 0;
  A.swapA.show(4.6, 7.8);
  A.swapA.key(4.55, { pose: 'bedSitUp', at: [bed2[0] + .95, bed2[1] - .15], ry: -N / 2, y: .86 });   // sat bolt upright in the wrong bed (mattress top .86, probed)   // on the bed (furnish puts the guest bed along the wall; verified in stills)
  A.swapA.face(4.55, 'shocked');
  A.grandma.show(4.6, 7.8);
  A.grandma.key(4.5, { pose: 'relaxed', at: [bed2[0] + .85, bed2[1] + 1.5], ry: N, y: bedY })
    .key(5.4, { pose: 'grandmaLean', dur: .6, ease: 'io' }).key(6.9, { pose: { ...P.grandmaLean, head: { r: [0.35, 0.05, 0.08] } }, dur: .4 });
  A.grandma.face(4.5, 'happy');

  // --- 3: CLASS PARTY: cake on a front desk, kids sing ONE AT A TIME (awkward), birthday kid deflates ---
  const dsk = C.seats[2];   // front row middle desk holds the cake
  const PK = [[clsW(-.75, -3.75), .3], [clsW(-.15, -5.0), .15], [clsW(.75, -4.25), -.25]];   // a tight group behind the cake desk, staggered in depth so all three read in the portrait frame   // in front of the board, the cake on the front desk between us and them
  A.kid0.show(7.8, 9.98); A.kid1.show(7.8, 9.98); A.kid2.show(7.8, 9.98);
  A.kid0.key(7.7, { pose: 'soloSing', at: PK[0][0], ry: PK[0][1] }).key(8.55, { pose: 'awkwardStand', dur: .25 });
  A.kid1.key(7.7, { pose: 'awkwardStand', at: PK[1][0], ry: PK[1][1] }).key(8.6, { pose: 'soloSing', dur: .25 }).key(9.35, { pose: 'awkwardStand', dur: .25 });
  A.kid2.key(7.7, { pose: 'cakeLean', at: PK[2][0], ry: PK[2][1] }).key(9.4, { pose: 'soloSing', dur: .25 });
  A.kid0.face(7.7, 'nervous'); A.kid1.face(7.7, 'bored').face(8.6, 'nervous'); A.kid2.face(7.7, 'sad');

  // --- 4: THE CHOIR: chain poof left -> right on the risers, last one takes the principal; facepalm on "anthem" ---
  // 12 singers, two risers, staggered; the swap chain sweeps left -> right along the front row then the back row, one poof per kid
  const CH = []; for (let i = 0; i < 12; i++) { const back = i >= 6, r = back ? audU.riser2 : audU.riser1, j = i % 6; CH.push({ x: AUD[0] - 3.1 + j * 1.15 + (back ? .55 : 0), z: AUD[2] + r.z, y: r.y }); }
  const POOFT = [10.12, 10.24, 10.36, 10.48, 10.62, 10.74, 10.86, 10.98, 11.10, 11.22, 11.34, 11.46];   // on the syllables of "found out during the anthem", faster and faster
  for (let i = 0; i < 12; i++) { const a = A['kid' + i]; a.show(9.98, 11.96); a.noClamp = true;
    a.key(9.9, { pose: P.choirSing(i), at: [CH[i].x, CH[i].z], ry: 0, y: CH[i].y }); a.face(9.9, 'happy');
    // after its poof the kid is someone else: stops singing, looks down at itself, then at the neighbour (the swap reads on every body)
    a.key(POOFT[i] + .12, { pose: { ...P.choirSing(i), armL: { r: [-0.5, 0, 0.5], o: [0, .03, .06] }, armR: { r: [-0.45, 0, -0.5], o: [0, .03, .06] }, head: { r: [0.45, (i % 2 ? .3 : -.3), 0] } }, dur: .18, style: 'snap' });
    a.face(POOFT[i] + .1, 'shocked');
    fx.poof(POOFT[i], [CH[i].x, CH[i].y + 1.15, CH[i].z], { size: .62, n: 12, dur: .9 }); }
  A.principal.show(9.98, 11.96); A.principal.noClamp = true;
  A.principal.key(9.9, { pose: 'principalWatch', at: [AUD[0] + 3.4, AUD[2] + 2.4], ry: -.4, y: audU.deckY })
    .key(11.34, { pose: 'facepalm', dur: .18, style: 'snap' });
  A.principal.face(9.9, 'happy').face(11.34, 'annoyed');
  fx.poof(11.46, [AUD[0] + 3.4, audU.deckY + 1.5, AUD[2] + 2.4], { size: .9, n: 16 });   // the last swap takes HIM

  // --- 5: TWINS: teacher points A, then B; the twins poof-swap mid-point; marker drops; she sits, done ---
  const TA = clsW(-.35, -4.7), TB = clsW(.5, -5.9), TT = clsW(1.15, -3.95);   // in front of the board, staggered in depth (portrait frame: never two side by side), the teacher in the near right   // twins side by side facing the class, the teacher at their side
  A.twinA.show(11.96, 15.62); A.twinB.show(11.96, 15.62); A.teacher.show(11.96, 15.62);
  A.twinA.key(11.9, { pose: P.twinStand(1), at: TA, ry: .12 }); A.twinB.key(11.9, { pose: P.twinStand(-1), at: TB, ry: -.12 });   // grinning at the class
  A.teacher.key(11.9, { pose: 'teachPoint', at: TT, ry: -N / 2 + .35 }).key(12.8, { pose: 'teachPointB', dur: .3 })
    .key(13.56, { pose: 'teachPoint', dur: .25 }).key(14.1, { pose: { ...P.teachPoint, armR: { r: [0.1, 0, -0.12] }, head: { r: [0.35, 0, 0.05] } }, dur: .3 })
    .key(14.54, { pose: 'teachGiveUp', at: [TT[0] + .35, TT[1] - .6], y: 0, dur: .45, ease: 'io', glide: .45 });   // drops onto the student chair behind her (placed below)
  fx.poof(13.56, [TA[0], 1.4, TA[1]], { size: .55, n: 10 }); fx.poof(13.62, [TB[0], 1.4, TB[1]], { size: .55, n: 10 });   // the mid-shot twin swap
  A.teacher.face(11.9, 'annoyed').face(14.1, 'bored');
  A.twinA.face(11.9, 'happy'); A.twinB.face(11.9, 'happy');

  // --- 6: DANA at her locker (hallway), arms crossed, proud ---
  const DL = [HALL.x + .9, HALL.z + 1.0], DRY = -N / 2 - 1.0;   // Dana's locker spot; she stands angled down the corridor (so a camera inside the 3.6 m hall sees her face)
  A.dana.show(15.62, 20.96);
  A.dana.key(15.55, { pose: 'danaLocker', at: DL, ry: DRY }).key(17.4, { pose: 'danaProud', dur: .4 });
  A.dana.face(15.55, 'smug');
  // two background kids drift past (crowds never freeze)
  A.kid3.show(15.62, 19.06); A.kid3.run(15.7, [[HALL.x - .8, HALL.z - .5], [HALL.x - .8, HALL.z - 6.8]], { step: .7, T: .42, arm: .6 });   // walks away down the corridor, behind her
  A.kid4.show(15.62, 19.06); A.kid4.run(16.2, [[HALL.x - .2, HALL.z - 7.2], [HALL.x - .4, HALL.z - 2.2]], { step: .68, T: .44, arm: .6 });   // walks toward us, far side

  // --- 7: classroom screaming answers; Dana sits dead still, tape on her mouth ---
  const DS = C.seats[7];   // Dana's desk (2nd row)
  A.dana.key(19.0, { pose: 'danaStill', at: clsW(DS.x, DS.z), ry: 0, y: 0, dur: .01 });
  A.kid0.show(19.06, 20.96); A.kid1.show(19.06, 20.96); A.kid5.show(19.06, 20.96);
  A.kid0.key(19.0, { pose: 'shoutA', at: clsW(DS.x - 2.6, DS.z + .3), ry: .2 }).key(19.9, { pose: { ...P.shoutA, armR: { r: [2.7, -0.5, 0.4], o: [-0.06, 0.22, 0] } }, dur: .3, ease: 'io' });
  A.kid1.key(19.0, { pose: 'shoutB', at: clsW(DS.x + 2.4, DS.z - .9), ry: -.3 }).key(20.1, { pose: { ...P.shoutB, head: { r: [-0.5, 0, -0.1] } }, dur: .3, ease: 'io' });
  A.kid5.key(19.0, { pose: 'shoutC', at: clsW(DS.x - 1.3, DS.z - 1.6), ry: .1, y: 0 });
  A.kid0.face(19.0, 'excited'); A.kid1.face(19.0, 'excited'); A.kid5.face(19.0, 'excited'); A.dana.face(19.0, 'neutral');

  // --- 8: DANA'S LIFE (House B): breakfast table / dad at the sink / the empty quiet hall / pancakes insert ---
  const KT = [8652.8, 124.52];   // the middle island stool (probed): she faces the island (-z)
  const SINK = [8653.6, 121.75];  // in front of the kitchen run (north wall), facing it
  A.dana.show(20.96, 22.46).show(24.3, 25.82);
  A.dana.key(20.9, { pose: 'danaBreakfast', at: KT, ry: N, y: .25 });   // stool seat .92 vs chair .68
  A.dana_dad.show(22.46, 23.28);
  A.dana_dad.key(22.4, { pose: 'dadDishes', at: SINK, ry: N });
  A.dana.key(24.25, { pose: 'danaBreakfast', at: KT, ry: N, y: .25 });   // back at the table for the pancake insert (her fork hand)
  A.dana.face(20.9, 'happy');
  A.dana_dad.face(22.4, 'happy');

  // --- 9: the tension: Dana close-up at the locker, eyes slide ---
  A.dana.show(25.82, 27.54);
  A.dana.key(25.78, { pose: 'danaProud', at: DL, ry: DRY, dur: .01 }).key(26.3, { pose: 'danaTense', dur: .5, ease: 'io' });
  A.dana.face(25.78, 'smug').face(26.4, 'nervous');

  // --- 10 (Xavier 04:44): NOT a comic. Just how it goes every day: a classmate taps his wrist, "time?", Dana answers on autopilot.
  // The comic split is saved for the ONE special moment (39.12). ---
  // Xavier 05:04: the classmate who asks Dana the time = MR. BACON (a subscriber's cameo): printed on his tee, front
  { const tex = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
      g.clearRect(0, 0, 512, 256);
      // a strip of bacon: wavy rashers, dark red meat + cream fat
      g.save(); g.translate(256, 70); for (const [col, w, dy] of [['#7a1f14', 26, -14], ['#f3d9b5', 12, 0], ['#a3301e', 22, 12]]) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath();
        for (let x = -150; x <= 150; x += 6) { const y = dy + Math.sin(x / 22) * 12; x === -150 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } g.restore();
      g.font = '900 92px Montserrat, Arial Black, sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round';
      g.strokeStyle = '#2a120c'; g.lineWidth = 14; g.strokeText('MR. BACON', 256, 205); g.fillStyle = '#ffd04a'; g.fillText('MR. BACON', 256, 205);
      return c; })());
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const tee = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .75), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .85, polygonOffset: true, polygonOffsetFactor: -2 }));
    tee.position.set(0, .05, -1.0); tee.rotation.y = Math.PI; A.kid9.a.rig.parts.torso.add(tee); }
  const BOYC = [HALL.x - .55, HALL.z - 3.2];   // where the boy stands for the 39.12 comic panel
  const ASK = [DL[0] - .62, DL[1] - .98];   // in front of her, along her facing
  A.dana.show(27.54, 32.7); A.kid9.show(27.54, 32.7);
  A.dana.key(27.5, { pose: 'danaAnswer', at: DL, ry: DRY, y: 0 });
  A.kid9.key(27.5, { pose: 'relaxed', at: [ASK[0] - .3, ASK[1] - .9], ry: Math.atan2(DL[0] - ASK[0], DL[1] - ASK[1]) });
  A.kid9.run(27.55, [[ASK[0] - .3, ASK[1] - .9], ASK], { step: .62, T: .36, arm: .5 });
  A.kid9.key(28.3, { pose: 'wristTap', dur: .25 }).key(28.65, { pose: 'wristTapB', dur: .18, ease: 'io' }).key(28.95, { pose: 'wristTap', dur: .18, ease: 'io' }).key(29.3, { pose: 'relaxed', dur: .3 });   // taps, then drops the arm so MR. BACON on his tee reads
  A.dana.talk(30.42, 31.94);
  A.dana.face(27.5, 'bored').face(32.0, 'nervous'); A.kid9.face(27.5, 'happy').face(30.6, 'shocked');

  // --- 11: Dana resigned shrug (hallway) ---
  A.dana.show(32.7, 34.58);
  A.dana.key(32.65, { pose: 'danaShrug', at: DL, ry: DRY, y: 0, dur: .01 }).key(33.6, { pose: { ...P.danaShrug, head: { r: [0.3, 0.1, 0.1] }, armL: { r: [-0.2, 0, 0.3] }, armR: { r: [-0.18, 0, -0.25] } }, dur: .4, ease: 'io' });   // the shrug falls, she deflates
  A.dana.face(32.65, 'sad');

  // --- 12: THURSDAY NIGHT: the boy at his desk writing the list; insert of the paper ---
  const DESK = [8565.05, 2.97], deskY2 = 0, LISTP = [8565.0, 1.07, 3.62];   // his gaming chair (probed: chair 8565.05/2.97 facing +z, desk at z 4.02)
  A.boy.show(34.58, 36.92); A.boy.noClamp = false;
  A.boy.key(34.5, { pose: 'writeList', at: DESK, ry: 0, y: .06 })
    .key(35.3, { pose: { ...P.writeList, armR: fa('armR', [-0.22, 0.6, 0.5], [-0.42, 0.7, 0.2], sit.root) }, dur: .25, ease: 'io' })
    .key(35.9, { pose: 'writeList', dur: .25, ease: 'io' }).key(36.4, { pose: 'writeLook', dur: .3 });
  A.boy.face(34.5, 'determined').face(36.4, 'smug');

  // --- 13: FRIDAY: he walks up to Dana in the hallway and asks (wrist tap) ---
  A.boy.show(36.92, 39.12); A.dana.show(36.92, 39.12);
  A.dana.key(36.88, { pose: 'danaLocker', at: DL, ry: DRY, y: 0, dur: .01 });
  A.boy.run(36.95, [[HALL.x - .7, HALL.z - 3.6], [DL[0] - 1.35, DL[1] - .35]], { step: .72, T: .36, arm: .6 });
  A.boy.key(38.35, { pose: 'wristTap', ry: N / 2 - .5, turn: .3, dur: .3 });
  A.boy.face(36.9, 'happy'); A.dana.face(36.9, 'smug').face(38.4, 'bored');

  // --- 14: COMIC SPLIT 2 (39.12): both say it TOGETHER; the bar CRACKS on "watch?" (40.3), panels swap, POOF ---
  A.dana.show(39.12, 40.84); A.boy.show(39.12, 40.84);
  A.dana.key(39.05, { pose: 'danaAnswer', at: DL, ry: DRY, y: 0 });
  A.boy.key(39.05, { pose: 'mockInnocent', at: BOYC, ry: 0, y: 0 });
  A.dana.talk(39.12, 40.28); A.boy.talk(39.12, 40.28);
  A.dana.face(39.05, 'bored').face(40.3, 'shocked'); A.boy.face(39.05, 'smug');
  const crackMid = new THREE.Vector3(CSPL.x, 20, CSPL.z);
  fx.poof(40.3, [crackMid.x, crackMid.y, crackMid.z + .4], { size: 1.2, n: 20 });

  // --- 15: MID-SWAP (hallway): both in the swirl cloud; cut to his body yelling with Dana's voice ---
  const SWP = [HALL.x - .15, DL[1] - .3];   // the middle of the corridor, a step from her locker
  A.boy.show(40.84, 50.9); A.dana.show(40.84, 50.9); A.boy.noClamp = false; A.dana.noClamp = false;
  A.boy.key(40.8, { pose: 'midSwapBoy', at: [SWP[0] - .45, SWP[1]], ry: N / 2 - .25, y: 0, dur: .01 })
    .key(41.9, { pose: t => P.yellFlail(t), dur: .3 });
  A.dana.key(40.8, { pose: 'midSwapDana', at: [DL[0], DL[1]], ry: -N / 2 - .3, y: 0, dur: .01 })
    .key(41.9, { pose: 'povIdle', dur: .35 });
  A.boy.talk(40.84, 42.74);   // "No. What the fuck did you do?" = Dana's voice from HIS body
  A.boy.face(40.8, 'shocked').face(41.6, 'angry'); A.dana.face(40.8, 'shocked').face(42.0, 'neutral');
  fx.poof(40.84, [SWP[0] + .3, 1.3, SWP[1]], { size: 1.6, dur: 1.4, spiral: 1, n: 30 });

  // --- 16: POV from Dana's body: left hand up, look; right hand joins; back to the yelling boy-body; pull OUT on "my new body" ---
  A.dana.key(43.25, { pose: 'povIdle', ry: -2.1, turn: .3, dur: .2 })   /* faces the boy-body across the corridor (atan2 of the gap) */              // she (he) faces the boy-body across the corridor
    .key(43.7, { pose: 'povHandL', dur: .35, ease: 'io' })
    .key(44.7, { pose: 'povHandLR', dur: .35, ease: 'io' })
    .key(45.5, { pose: 'povIdle', dur: .3 })
    .key(46.0, { pose: 'smugNew', dur: .35 });
  A.boy.key(43.3, { pose: t => P.yellFlail(t * .7), at: [HALL.x - 1.15, SWP[1] - .9], dur: .4, glide: .4 }).key(45.9, { pose: { ...P.yellFlail(0), armL: { r: [-0.6, 0, 0.4] }, armR: { r: [-0.5, 0, -0.45] }, head: { r: [0.2, 0.2, 0.1] } }, dur: .4 });
  A.dana.face(46.0, 'smug');

  // --- 17: THE ENDING (rackfocus_crier_v1): her body talks to the lens; his body curled CRYING on the floor behind; rack focus; silence ---
  // Xavier 04:44: HIS selfie pose (screenshot), the selfie camera, then the air kiss; the crier sunk on the floor at his X:
  // behind her, screen-right, a few metres down the corridor. ERY turns the whole selfie set-up so that 'behind her' = down the corridor (-z).
  const ERY = 1.27, EP = [HALL.x + .15, SWP[1] + 1.2], loc = (x, z) => [EP[0] + x * Math.cos(ERY) + z * Math.sin(ERY), EP[1] - x * Math.sin(ERY) + z * Math.cos(ERY)];
  const CRY = loc(2.16, -.84);   // his X: screen-right of her, a couple of metres back, fully in frame
  A.dana.key(47.05, { pose: 'selfieKissIdle', at: EP, ry: ERY, turn: .3, dur: .3 })
    .key(48.0, { pose: 'selfieKissIdle', dur: .3 })
    .key(48.6, { pose: 'selfieKissLips', dur: .22 })
    .key(48.98, { pose: 'selfieKissOut', dur: .2, style: 'snap' })
    .key(49.3, { pose: 'myPose', dur: .45 });   // swings the phone round to show him
    A.dana.talk(47.12, 48.42);
  A.boy.key(46.9, { pose: t => P.crierCurl(t), at: CRY, ry: ERY - .35, dur: .5, glide: .5 });   // curled on the floor, crying toward us
  A.dana.face(48.6, 'smug').face(48.95, 'happy').face(49.3, 'neutral');
  A.boy.face(46.9, 'crying');

  // ---------- per-frame props ----------
  const headW = a => a.a.rig.parts.head.getWorldPosition(new THREE.Vector3());
  const handW = (a, side, off = -.75) => { const p = a.a.rig.parts['arm' + side]; p.updateMatrixWorld(true); return { p: new THREE.Vector3(0, off, 0).applyMatrix4(p.matrixWorld), q: p.getWorldQuaternion(new THREE.Quaternion()) }; };
  const comicT = t => (t >= 27.54 && t < 32.7) ? { slamT: 27.56 } : (t >= 39.12 && t < 40.84) ? { slamT: 39.14, crackT: 40.3, swapT: 40.34 } : null;
  const props = t => {
    // earbuds between the bus pair (only while they share them; gone once the poof clears and they stare at hands... the wire DROPS at .55)
    const busOn = t < 4.6;
    wire.visible = budL.visible = budR.visible = busOn;
    if (busOn) { const hA = headW(A.swapA), hB = headW(A.swapB);
      const drop = cl((t - .55) / .5), sag = .25 + drop * .8;
      budL.position.copy(hA).add(new THREE.Vector3(0, -.05 - drop * .6, 0)); budR.position.copy(hB).add(new THREE.Vector3(0, -.05 - drop * .6, 0));
      const midp = budL.position.clone().lerp(budR.position, .5).add(new THREE.Vector3(0, -sag, 0));
      wire.geometry.dispose(); wire.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([budL.position, midp, budR.position]), 16, .018, 6); }
    // cake on the party desk; hats on the three party kids
    const partyOn = t >= 7.8 && t < 9.98; cake.visible = partyOn;
    if (partyOn) { const d = C.seats[2]; cake.position.set(CLS[0] + d.x, 1.12, CLS[2] + d.z); }
    hats.forEach((hh, i) => { const a = A['kid' + i]; hh.visible = partyOn && a.a.root.visible; if (hh.visible) { const hd = headW(a); hh.position.copy(hd).add(new THREE.Vector3(0, .42, 0)); hh.rotation.y = t * .2 + i; } });
    // tape on Dana's mouth (shot 7 only)
    tape.visible = t >= 19.06 && t < 20.96;
    if (tape.visible) { const hd = A.dana.a.rig.parts.head; hd.updateMatrixWorld(true); tape.position.copy(new THREE.Vector3(0, -.09, -.3).applyMatrix4(hd.matrixWorld)); /* head front = local -Z */ tape.quaternion.copy(hd.getWorldQuaternion(new THREE.Quaternion())); }
    // the list + marker on the desk (shot 12)
    const listOn = t >= 34.58 && t < 36.92; list.visible = marker.visible = listOn;
    if (listOn) { list.position.set(LISTP[0], LISTP[1], LISTP[2]); list.rotation.z = Math.PI - .12;
      const H = handW(A.boy, 'R'); marker.position.copy(H.p).add(new THREE.Vector3(0, .05, 0)); marker.quaternion.copy(H.q); }
    // pancakes + syrup pour (shot 8d)
    const panOn = t >= 24.3 && t < 25.82; pan.visible = syr.visible = jug.visible = panOn;
    if (panOn) { pan.position.set(KT[0] + .1, 1.03, KT[1] - .85);
      // the jug comes in from the left, tips, a thin amber ribbon lands on the butter (pure function of t)
      const pour = cl((t - 24.45) / .25) * (1 - cl((t - 25.55) / .2)), tip = sm(cl((t - 24.3) / .25));
      const spout = new THREE.Vector3(pan.position.x - .2, pan.position.y + .5, pan.position.z - .02), land = new THREE.Vector3(pan.position.x - .01, pan.position.y + .23, pan.position.z);
      jug.position.set(spout.x - .07, spout.y + .05, spout.z); jug.rotation.set(0, 0, -.4 - 1.3 * tip);
      const L = spout.distanceTo(land) * Math.max(.001, pour); syr.visible = pour > .02; syr.scale.set(1, L, 1);
      syr.position.copy(spout).lerp(land, .5 * Math.max(.001, pour)); syr.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), spout.clone().sub(land).normalize()); }
    // comic rig
    comic.g.visible = false;
    // the comic actors ride their panels: y per frame

    // POV: hide HER head while the camera is inside it (restored on the pull-out), pure function of t
    A.dana.a.rig.parts.head.visible = !(t >= 43.3 && t < 46.2);
    fx.update(t);
  };

  // ---------- light ----------
  const LOOK = dayLook(scene, { sunAz: 150, sunEl: 52, sun: 4.0, fill: 1.25 }), post = LOOK.post;
  paintSky(LOOK.sky, '#2a7ae8', '#d8eeff', null, new THREE.Vector3(.5, .3, .8).normalize());
  // interior rigs (toggled per shot): one key spot + warm bounce + cool rim per set
  const rig = (kx, ky, kz, tx, ty, tz, { c = '#ffe8cc', i = 10 } = {}) => { const k = new THREE.SpotLight(c, 0, 14, .8, .55, 1.3); k.position.set(kx, ky, kz); k.target.position.set(tx, ty, tz); k.castShadow = true; k.shadow.mapSize.set(1024, 1024); k.shadow.bias = -.0006; scene.add(k, k.target); return { k, i }; };
  const RIGS = {
    bedroom: rig(bed2[0] + 2.4, bedY + 2.8, bed2[1] - 2.6, bed2[0], bedY + 1, bed2[1], { c: '#ffeedd', i: 9 }),
    class: rig(CLS[0] - 4.5, 3.6, CLS[2] - 2, CLS[0], 1.2, CLS[2] - 2.5, { c: '#fff2e0', i: 12 }),
    stage: rig(AUD[0], audU.deckY + 6.2, AUD[2] + 7.5, AUD[0], audU.deckY + 1.2, AUD[2] - 2, { c: '#ffe2b0', i: 26 }),
    hallway: rig(HALL.x - 1.2, 2.9, HALL.z - 4, HALL.x + .6, 1.2, HALL.z + .6, { c: '#fff4e2', i: 9 }),
    houseB: rig(KT[0] - 2.6, 3.0, KT[1] - 2.4, KT[0], 1.0, KT[1], { c: '#ffe8c8', i: 10 }),
    kitchen: rig(SINK[0] + 2.2, 3.0, SINK[1] + 2.2, SINK[0], 1.2, SINK[1], { c: '#ffe8c8', i: 10 }),
    desk: rig(DESK[0] - .7, 2.1, DESK[1] + 1.1, DESK[0], 1.2, DESK[1] + .3, { c: '#ffd39a', i: 16 }),   // the desk lamp: warm, low, from the desk side onto the paper + his face
    comic: rig(CSPL.x, 23.5, CSPL.z + 4, CSPL.x, 20, CSPL.z, { c: '#ffffff', i: 16 }),
  };
  const fill2 = new THREE.PointLight('#cfe0ff', 0, 18, 1.4); scene.add(fill2);   // soft cool fill that rides with the active rig
  const RIGBY = { bedroom: 'bedroom', party: 'class', twins: 'class', taped: 'class', choir: 'stage', danaLocker: 'hallway', danaTense: 'hallway', danaShrug: 'hallway', hallAsk: 'hallway', midSwap: 'hallway', povHands: 'hallway', pullOut: 'hallway', ending: 'hallway', danaTable: 'houseB', pancakes: 'houseB', quietHall: 'houseB', dishes: 'kitchen', deskList: 'desk', askTime: 'hallway', danaReply: 'hallway', comic2: 'hallway' };
  const light = (t, s) => {
    const want = RIGBY[s.id];
    for (const [k, r] of Object.entries(RIGS)) r.k.intensity = (k === want) ? r.i : 0;
    if (want) { const r = RIGS[want]; fill2.intensity = .7; fill2.position.copy(r.k.target.position).add(new THREE.Vector3(-2, 1.8, 2)); } else fill2.intensity = 0;
    const night = s.id === 'deskList';   // Thursday NIGHT at the desk
    LOOK.setSun(150, 52, night ? { color: '#2a3a5c', intensity: .25, fill: .25 } : { color: '#fff4dc', intensity: 4.0, fill: 1.25 });
    post.exposure = s.id === 'busPoof' ? 1.3 : night ? 1.18 : want ? 1.22 : 1.36;
    post.saturation = 1.34; post.contrast = 1.1;
  };

  // ---------- camera ----------
  const bad = validate(SH); if (bad.length) console.error('SHOTS', bad.join('; '));
  const cam = new THREE.PerspectiveCamera(32, w / h, .15, 400);
  const pos = n => A[n].a.root.position;
  // FRONT: a camera in front of an actor (their facing), d metres out, side = sideways offset as a fraction of d, h = height
  // over the head, lh = look offset under the head. Every face shot uses it, so nobody is framed from behind again.
  const fwdOf = a => { const tq = a.a.rig.parts.torso; tq.updateMatrixWorld(true); const v = new THREE.Vector3(0, 0, -1).applyQuaternion(tq.getWorldQuaternion(new THREE.Quaternion())); v.y = 0; return v.normalize(); };   // the TORSO's real facing (Roblox front = -Z), whatever ry / pose did
  const front = (a, { d = 2, side = .35, h = .05, lh = -.12, fov = 38, at = null } = {}) => { const hd = at || headW(a), f = fwdOf(a), r = new THREE.Vector3(f.z, 0, -f.x);
    const p = hd.clone().addScaledVector(f, d).addScaledVector(r, side * d); p.y += h; return { p: p.toArray(), l: [hd.x, hd.y + lh, hd.z], fov }; };
  const midHead = (a, b) => headW(a).lerp(headW(b), .5);
  const CAM = {
    // 1: open INSIDE the poof (tight, bright white), clear to a two-shot down the aisle; fast push ends on the two faces
    // from the aisle a row ahead, above the seat backs: starts INSIDE the cloud (close), pulls back as it clears, then pushes in on their faces
    // from the aisle, level with their row: the two kids line up along the lens (aisle kid near, window kid behind him),
    // the window + the street beyond them. Starts INSIDE the cloud, pulls back as it clears, then pushes in.
    busPoof: u => { const tt = u * 4.6, k = sm(cl((tt - .05) / .9)), d = sm(cl((tt - 1.6) / 3.0)), m = midHead(A.swapA, A.swapB); return { p: [m.x - lerp(.9, 2.3, k) + .35 * d, m.y - lerp(.1, .3, k), m.z - lerp(.8, 1.9, k) + .3 * d], l: [m.x, m.y - .25, m.z + .15], fov: lerp(52, 42, k) }; },   // a row ahead, from the aisle, a touch under their eyes: both faces 3/4, hands in their laps
    // 2: crane down from over the bed: grandma leaning in, the kid rigid
    bedroom: u => { const k = sm(u), a = headW(A.swapA); return { p: [a.x - lerp(2.9, 2.3, k), a.y + lerp(.55, .25, k), a.z - lerp(1.1, .8, k)], l: [a.x - .1, a.y - .2, a.z + .3], fov: 40 }; },   // from the foot of the bed: him sat bolt upright against the pillows facing us, grandma leaning in
    // 3: truck across the party: cake front-left, the solo singer mid, the rest awkward
    party: u => { const k = sm(u), c = clsW(lerp(-1.25, -.75, k), -1.2); return { p: [c[0], 2.0, c[1]], l: [clsW(0, -4.4)[0], 1.25, clsW(0, -4.4)[1]], fov: 48 }; },   // over the cake: all three singers in one frame
    // 4: low truck along the risers as the poofs chain L -> R, ending on the principal's facepalm
    choir: u => { const k = sm(u), x = lerp(AUD[0] - 2.2, AUD[0] + 2.6, k); return { p: [x, audU.deckY + 1.6, AUD[2] + 8.2 - 1.2 * k], l: [x + .4, audU.riser1.y + 1.25, AUD[2] - .6], fov: 40 }; },   // wide on the risers, trucking with the chain; ends on the principal
    // 5: slow push over the teacher's shoulder: both twins in frame, the two poofs, the marker drop, the sit
    twins: u => { const m = midHead(A.twinA, A.twinB), k = sm(u); return { p: [m.x - lerp(1.0, .7, k), 1.95, m.z + lerp(4.5, 3.9, k)], l: [m.x + .6, 1.3, m.z + .3], fov: 44 }; },   // front-left: both twins + the teacher pointing from the right
    // 6: slow orbit round Dana at the locker (kids pass behind)
    danaLocker: u => { const k = sm(u); return front(A.dana, { d: lerp(2.5, 2.0, k), side: lerp(-.45, -.15, k), h: .02, lh: -.32, fov: 40 }); },
    // 7: high punch-in on silent Dana in the shouting class
    taped: u => { const dd = clsW(DS.x, DS.z), k = Math.min(1, u / .3); return { p: [dd[0] + 1.1, lerp(2.9, 2.3, k), dd[1] + lerp(3.6, 2.4, k)], l: [dd[0], 1.05, dd[1]], fov: lerp(46, 36, k) }; },
    // 8: her life, three pushes + the syrup insert
    danaTable: u => front(A.dana, { d: lerp(2.0, 1.6, u), side: .3, h: .12, lh: -.2, fov: 38 }),
    dishes: u => front(A.dana_dad, { d: lerp(2.2, 1.8, u), side: lerp(.75, .55, u), h: .05, lh: -.3, fov: 42 }),
    quietHall: u => { const hw = roomW(HB, 'hallG', 1.2, .7); return { p: [hw[0] + lerp(0, 2.2, u) , 1.45, hw[1]], l: [hw[0] + 8, 1.2, hw[1]], fov: 46 }; },
    pancakes: u => { const k = Math.min(1, u / .3); return { p: [pan.position.x - .55, pan.position.y + lerp(.95, .7, k), pan.position.z + lerp(1.0, .75, k)], l: [pan.position.x + .02, pan.position.y + .15, pan.position.z], fov: 36 }; },   // from her left: the stack + the syrup, her fork hand out of the way
    // 9: tight push on her face, eyes slide
    danaTense: u => front(A.dana, { d: lerp(1.3, 1.05, u), side: .25, h: .0, lh: -.05, fov: 30 }),
    // 10 + 14: the comic rig's own camera
    askTime: u => { const k = sm(u); return front(A.kid9, { d: lerp(1.6, 1.4, k), side: lerp(-.7, -.6, k), h: .1, lh: -.5, fov: 56 }); },   // over Dana's shoulder onto MR. BACON tapping his wrist (his tee reads)   // her + the classmate tapping his wrist, from her front-left
    danaReply: u => front(A.dana, { d: lerp(1.25, 1.05, u), side: -.18, h: -.12, lh: -.02, fov: 34 }),   // on her answer, slightly low, push
    comic2: u => comic.cam(u),
    // 11: pull back from her shrug
    danaShrug: u => front(A.dana, { d: lerp(1.6, 2.4, u), side: -.3, h: .02, lh: -.3, fov: 38 }),
    // 12: over his shoulder down onto the list, push
    deskList: u => { const k = sm(u); return { p: [8565.05 + lerp(.35, .2, k), lerp(1.7, 1.6, k), 4.22], l: [8565.02, lerp(1.2, 1.38, k), lerp(3.5, 3.0, k)], fov: lerp(52, 44, k) }; },   // across the desk: the list in the foreground, him hunched over it writing, then up to his face (smug)
    // 13: track with him up the hallway to Dana
    hallAsk: u => { const b = pos('boy'); return { p: [HALL.x - 1.0, 1.5, b.z + 2.5], l: [b.x + .35, 1.32, b.z], fov: 42 }; },   // leads him up the corridor; Dana enters frame right at her locker
    // 15: low orbit round the yelling boy-body, the cloud behind
    midSwap: u => { const a = sm(u); return front(A.boy, { d: lerp(1.4, 1.7, a), side: lerp(1.2, .9, a), h: -.3, lh: -.1, fov: 42 }); },   // from down the corridor: his face, Dana's body edge of frame
    // 16: TRUE POV: camera at her eyes, head bob, hands come up into frame
    povHands: u => { const t = 43.3 + u * 2.7; const hd = headW(A.dana); const bob = Math.sin(t * 2.1) * .015;
      const ry = A.dana.a.root.rotation.y + A.dana.a.rig.parts.head.rotation.y * 0;   // face direction
      const dir = new THREE.Vector3(Math.sin(A.dana.a.root.rotation.y), 0, Math.cos(A.dana.a.root.rotation.y));
      const down = (t > 43.75 && t < 45.45) ? 1.05 * sm(cl((t - 43.75) / .25)) * (1 - sm(cl((t - 45.2) / .25))) : .1;   // eyes drop to the hands, then back up to him   // looks DOWN at the hands, then back up at him
      return { p: [hd.x + dir.x * .12, hd.y + .02 + bob, hd.z + dir.z * .12], l: [hd.x + dir.x * 2, hd.y - down + bob, hd.z + dir.z * 2], fov: 58 }; },
    // 16b: fast pull OUT of the POV to a 3/4 medium on her smug body
    pullOut: u => { const k = sm(u); return front(A.dana, { d: lerp(.3, 2.1, k), side: lerp(0, .3, k), h: lerp(.02, .05, k), lh: lerp(-.05, -.3, k), fov: lerp(58, 40, k) }); },   // fast OUT of her eyes, back along her look, to a 3/4 medium on her smug new body
    // 17: the rack-focus ending: medium-close on her, the crier visible over her shoulder; camera drifts in the silence
    ending: u => { const t = 47.12 + u * 3.78, P0 = A.dana.a.root.position, L = (x, y, z) => { const q = loc(x, z); return [q[0] + (P0.x - EP[0]), y, q[1] + (P0.z - EP[1])]; }, w = Math.sin(t * 1.3) * .02, k = sm(cl((t - 49.3) / .5)), b = headW(A.boy);
      const p0 = L(-.72 + w, 2.87, .5), l0 = L(.3, 1.45 + w, -.33), p1 = L(-.35, 2.35, 1.15);   // the phone swings out with her arm: the lens pulls back + turns onto him
      return { p: [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), lerp(p0[2], p1[2], k)], l: [lerp(l0[0], b.x, k * .75), lerp(l0[1], b.y - .2, k * .75), lerp(l0[2], b.z, k * .75)], fov: lerp(60, 50, k) }; },   // selfie_wave_v1 camera, then her myPose swing reveals the crier
  };
  const shakeAt = t => { for (const [a, b, k] of [[0.0, .35, .02], [11.34, 11.6, .02], [40.3, 40.6, .035], [40.84, 41.2, .03]]) if (t >= a && t < b) return k * (1 - (t - a) / (b - a)); return 0; };

  // rack focus (shot 17): focus on Dana's face for the line, then over ~.6 s onto the crier; aperture stays on
  const update = t => {
    const s = SH.slice().reverse().find(q => t >= q.t) || SH[0], u = cl((t - s.t) / s.dur);
    S.update(t); props(t); light(t, s);
    const o = globalThis.VIEW || opts;
    if (o.camP) { cam.position.set(...o.camP); cam.lookAt(...o.camL); cam.fov = o.fov || 34; }
    else { const C2 = CAM[s.id](sm(u) * .3 + u * .7), hh = (f, q) => Math.sin(t * f + q) * .012 + Math.sin(t * f * 2.7 + q * 3) * .006;
      cam.position.set(C2.p[0] + hh(1.3, 1), C2.p[1] + hh(1.1, 2), C2.p[2] + hh(1.2, 3)); cam.fov = C2.fov; cam.lookAt(C2.l[0] + hh(1.5, 4), C2.l[1] + hh(1.4, 5), C2.l[2]);
      const sk = shakeAt(t); if (sk) { cam.rotateX(Math.sin(t * 61) * sk); cam.rotateZ(Math.sin(t * 47) * sk); }
      // focus: at the look point; shot 17 racks from her face to the crier after the line ends (48.42 -> 49.0)
      if (s.id === 'ending') { const rk = sm(cl((t - 49.45) / .55));   /* the focus racks to him as the phone finds him */ const a = headW(A.dana), b = headW(A.boy);
        post.focus = cam.position.distanceTo(a.clone().lerp(b, rk)); }
      else post.focus = cam.position.distanceTo(new THREE.Vector3(...C2.l));
    }
    cam.updateProjectionMatrix(); LOOK.sky.position.copy(cam.position);
    const sp = A[s.who] ? A[s.who].a.root.position : null; if (sp && o.look !== false) LOOK.follow(cam, { x: sp.x, y: sp.y, z: sp.z });
    cam.updateMatrixWorld(true); return true;
  };
  // ---------- COMIC SPLIT (Xavier 02:39 + his sketch): two separate camera shots, stacked VERTICALLY, a slanted ink gutter
  // (low-left to high-right). TOP = her face on the right, looking left, speed lines on the left; BOTTOM = his face on the
  // left, looking right, speed lines on the right. Masked: never in each other's frame. Top slams in from the right, bottom
  // from the left. comic2: both say it; the gutter CRACKS (40.3), white flash, the panels trade places.
  const GL = .60, GR = .40, gutY = x => GL + (GR - GL) * x;
  const COMIC = t => (t >= 39.12 && t < 40.84) ? { t0: 39.12, crack: 40.3, swap: 40.36 } : null;   // ONE comic only: the special moment (Xavier 04:44)
  const panelCam = (a, side, sx, sy, d, fov) => () => { for (const o of [A.dana, A.boy]) o.a.root.visible = o === a;   /* masked: the other one is never in this panel */ const C2 = front(a, { d, side, h: .02, lh: -.06, fov }); cam.position.set(...C2.p); cam.fov = fov; cam.lookAt(...C2.l);
    cam.setViewOffset(w, h, -(sx - .5) * w, -(sy - .5) * h, w, h); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true); post.focus = cam.position.distanceTo(headW(a)); post.aperture = .012; };
  const streaks = (ctx, W, H, t, x0, x1, y0, y1, col, seed) => { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.lineCap = 'butt';
    // JJK-style energy: tall vertical light streaks in bundles on the empty side, flickering each frame (t-seeded), fading toward the face
    const fr = Math.floor(t * 15);
    for (let i = 0; i < 46; i++) { const r = (Math.sin(i * 91.7 + seed + fr * .37) * 43758.5 % 1 + 1) % 1, r2 = (Math.sin(i * 12.3 + seed * 3 + fr) * 9127.1 % 1 + 1) % 1;
      const x = (x0 + (x1 - x0) * r) * W, ya = (y0 + (y1 - y0) * r2 * .5) * H, yb = ya + (.12 + .35 * r) * (y1 - y0) * H;
      const g = ctx.createLinearGradient(0, ya, 0, yb); g.addColorStop(0, col.replace('A', '0')); g.addColorStop(.5, col.replace('A', (.35 + .55 * r2).toFixed(2))); g.addColorStop(1, col.replace('A', '0'));
      ctx.strokeStyle = g; ctx.lineWidth = (1.5 + 6 * r * r) * W / 540; ctx.beginPath(); ctx.moveTo(x, ya); ctx.lineTo(x, yb); ctx.stroke(); }
    ctx.restore(); };
  // colour energy: a saturated wash that is strongest on the EMPTY side of the panel and fades out before the face
  const tint = (ctx, W, H, x0, y0, x1, y1, a, b) => { ctx.save(); ctx.globalCompositeOperation = 'overlay'; const g = ctx.createLinearGradient(x0 * W, y0 * H, x1 * W, y1 * H);
    g.addColorStop(0, a); g.addColorStop(.55, b); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'screen'; const g2 = ctx.createLinearGradient(x0 * W, y0 * H, x1 * W, y1 * H); g2.addColorStop(0, a.replace(/[\d.]+\)$/, '.45)')); g2.addColorStop(.45, 'rgba(0,0,0,0)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H); ctx.restore(); };
  const AP0 = post.aperture;
  const split = t => { const c = COMIC(t); if (!c) { cam.clearViewOffset(); post.aperture = AP0; return null; }
    const e = k => 1 - (1 - cl(k)) ** 3, sIn = e((t - c.t0) / .24), sw = c.swap && t >= c.swap, sk = c.swap ? e((t - c.swap) / .22) : 1;
    const topA = sw ? A.boy : A.dana, botA = sw ? A.dana : A.boy;
    const topDx = sw ? (1 - sk) * -1 : (1 - sIn), botDx = sw ? (1 - sk) : -(1 - sIn);   // top in from the right, bottom from the left (after the swap: the other way)
    const poly = (pts, dx) => pts.map(([x, y]) => [x + dx, y]);
    return { views: [
      { setup: panelCam(topA, sw ? .6 : -.6, sw ? .36 : .64, .25, 1.9, 36), clip: poly([[0, 0], [1, 0], [1, GR], [0, GL]], topDx), dx: topDx,
        paint: (ctx, W, H) => { tint(ctx, W, H, sw ? 1 : 0, .1, sw ? 0 : 1, .3, 'rgba(255,40,160,.95)', 'rgba(255,120,200,.35)'); streaks(ctx, W, H, t, sw ? .62 : .02, sw ? .98 : .36, .0, .52, 'rgba(255,214,250,A)', 1); } },
      { setup: panelCam(botA, sw ? -.6 : .6, sw ? .64 : .36, .76, 1.9, 36), clip: poly([[0, GL], [1, GR], [1, 1], [0, 1]], botDx), dx: botDx,
        paint: (ctx, W, H) => { tint(ctx, W, H, sw ? 0 : 1, .8, sw ? 1 : 0, .7, 'rgba(20,140,255,.95)', 'rgba(40,230,255,.35)'); streaks(ctx, W, H, t, sw ? .02 : .64, sw ? .38 : .98, .45, 1, 'rgba(190,235,255,A)', 7); } } ],
      overlay: (ctx, W, H) => { cam.clearViewOffset(); cam.updateProjectionMatrix(); post.aperture = AP0; A.dana.a.root.visible = A.boy.a.root.visible = true;
        // the ink gutter: a few rough strokes (his sketch), white hairlines either side
        const cr = c.crack && t >= c.crack, bump = cr ? Math.max(0, 1 - (t - c.crack) / .3) : 0;
        ctx.save(); ctx.lineCap = 'round';
        for (const [off, wdt, col] of [[-.012, 2.2, '#f6f3ea'], [.012, 2.2, '#f6f3ea']]) { ctx.strokeStyle = col; ctx.lineWidth = wdt * W / 540; ctx.beginPath(); ctx.moveTo(-.02 * W, (GL + off + .01) * H); ctx.lineTo(1.02 * W, (GR + off - .01) * H); ctx.stroke(); }
        for (let k = 0; k < 6; k++) { ctx.strokeStyle = '#0b0b0d'; ctx.lineWidth = (5 + k * 2.2) * W / 540; ctx.beginPath(); const j = (k - 3) * .0016;
          ctx.moveTo(-.02 * W, (GL + j + Math.sin(k * 3.1) * .002) * H); ctx.bezierCurveTo(.35 * W, (gutY(.35) + j + .004) * H, .65 * W, (gutY(.65) + j - .003) * H, 1.02 * W, (GR + j) * H); ctx.stroke(); }
        if (cr) { ctx.strokeStyle = '#fffbe8'; ctx.lineWidth = 5 * W / 540; ctx.shadowColor = '#fff'; ctx.shadowBlur = 18 * W / 540; ctx.beginPath();
          for (let i = 0; i <= 12; i++) { const x = i / 12, y = gutY(x) + (i % 2 ? -.018 : .018) * (1 + bump); i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H); } ctx.stroke();
          if (bump > 0) { ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = `rgba(255,255,255,${(bump * .85).toFixed(2)})`; ctx.fillRect(0, 0, W, H); } }
        ctx.restore(); } };
  };
  update(opts.t ?? 0);
  return { camera: cam, sun: LOOK.sun, post, update, split, dbg: { A, comic, CAM, cam, bus, C, HAq: HA, HBq: HB } };
}
