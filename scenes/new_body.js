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
P.busSingL = { ...sit, armL: { r: [-0.5, 0, 0.38], o: [0, 0, 0.06] }, armR: { r: [-0.25, 0, -0.08] }, head: { r: [-0.18, 0.28, 0.3] }, root: { ...sit.root, rz: 0.08 } };       // leans RIGHT toward his seatmate, one arm half up vibing
P.busSingR = { ...sit, armR: { r: [-0.72, 0, -0.45], o: [0, 0.03, 0.08] }, armL: { r: [0.1, 0, 0.08] }, head: { r: [-0.12, -0.3, -0.26] }, root: { ...sit.root, rz: -0.1 } };  // leans LEFT, arm higher (never mirrored)
P.busHandsL = { ...sit, legL: { r: [-1.35, 0, .08], o: [0, 0, -.06] }, legR: { r: [-1.3, 0, -.08], o: [0, 0, -.05] }, armL: fa('armL', [0.26, 0.74, 0.5], [0.42, 0.85, 0.3], sit.root), armR: fa('armR', [-0.24, 0.66, 0.48], [-0.42, 0.8, 0.3], sit.root), head: { r: [0.38, -0.1, -0.05] }, root: { ...sit.root, rx: 0.08 } };   // hands low over the lap, palms up, staring down at them (face stays visible)   // both hands up in front, staring DOWN at them
P.busHandsR = { ...sit, legL: { r: [-1.35, 0, .08], o: [0, 0, -.06] }, legR: { r: [-1.3, 0, -.08], o: [0, 0, -.05] }, armL: fa('armL', [0.22, 0.66, 0.52], [0.42, 0.78, 0.3], sit.root), armR: fa('armR', [-0.28, 0.8, 0.46], [-0.42, 0.85, 0.3], sit.root), head: { r: [0.36, 0.15, 0.08] }, root: { ...sit.root, rx: 0.06, rz: 0.06 } };
// --- bedroom: kid frozen under the duvet, grandma leaning over the bed for the forehead kiss
P.bedSitUp = { legL: { r: [-1.5708, 0, .08] }, legR: { r: [-1.52, 0, -.1], o: [0, .02, .03] }, armL: { r: [.25, 0, .12], o: [0, 0, -.04] }, armR: { r: [.3, 0, -.3], o: [0, 0, -.04] }, head: { r: [-.1, .25, 0] }, root: { y: -.51, rx: -.05 } };   // bolt upright in the wrong bed, legs under the duvet, hands on it
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
P.povHandL = { ...P.povIdle, armL: fa('armL', [0.22, 1.02, 0.6], [0.4, 0.85, 0.28]), head: { r: [0.12, 0.12, 0] } };   // hand raised CLOSE to the eyes: fills the lower POV frame (research: big hands + wide lens = the illusion)
P.povHandLR = { ...P.povIdle, armL: fa('armL', [0.28, 0.98, 0.64], [0.42, 0.82, 0.3]), armR: fa('armR', [-0.18, 1.06, 0.6], [-0.4, 0.88, 0.28]), head: { r: [0.1, -0.12, 0] } };   // left settles, right rises close: both big in frame, palms turning
P.smugNew = { legL: { r: [-0.08, 0, 0.14], o: [0.02, 0, 0.04] }, legR: { r: [0.06, 0, -0.06] }, armL: fa('armL', [0.36, 0.9, -0.04], [0.62, 1.08, -0.12]), armR: { r: [0.1, 0, -0.12] }, head: { r: [-0.15, -0.2, -0.08] }, root: { rz: 0.05 } };   // hand on hip, chin up (his smug, now in her body)
P.talkToLens = { ...P.smugNew, armR: { r: [-0.35, 0, -0.2], o: [0, 0.02, 0.04] }, head: { r: [-0.1, 0.05, -0.05] } };
// Xavier 04:44 ending: his selfie pose (pose-editor screenshot): right arm up at the lens, left fist at the mouth; then the AIR KISS:
// the left hand leaves the lips and opens out toward the lens. Built on P.selfie (the selfie_wave_v1 body), facing ry 0 = the lens.
P.selfieKissIdle = { armL: { r: [-1.596, -0.38, -1.234], o: [0.129, -0.065, 0.136] }, armR: { r: [-2.315, -0.59, -0.426], o: [-0.422, 0.804, 0.559] }, legL: { r: [0.345, 0.019, 0.253], o: [0.092, 0.028, -0.05] }, legR: { r: [0.262, 0.056, -0.1], o: [-0.027, -0.046, -0.055] }, head: { r: [-0.307, -0.57, -0.078] }, root: { x: -0.204, y: 0.071, z: 0.178, rx: -0.268, ry: 0.014, rz: -0.212 } };
P.selfieKissLips = { ...P.selfieKissIdle, armL: fa('armL', [-0.02, 1.47, 0.26], [0.3, 1.12, 0.32], P.selfieKissIdle.root), head: { r: [-0.25, -0.5, -0.1] } };
P.selfieKissOut = { ...P.selfieKissIdle, armL: fa('armL', [0.22, 1.62, 0.78], [0.36, 1.3, 0.42], P.selfieKissIdle.root), head: { r: [-0.36, -0.55, -0.16] } };
// Xavier 04:50 'myPose': after the kiss she swings the phone arm out so the selfie camera finds the crying boy behind her
P.myPose = { armL: { r: [-1.571, -0.689, -1.502], o: [0.063, -0.065, 0.057] }, armR: { r: [-1.885, -0.346, -0.052], o: [-0.285, 0.334, 1.477] }, legL: { r: [0.363, -0.015, 0.261], o: [0.094, 0.008, -0.031] }, legR: { r: [0.238, 0.167, 0.325], o: [-0.025, -0.083, -0.038] }, head: { r: [-0.064, -0.264, -0.016] }, root: { x: -0.198, y: 0.092, z: 0.119, rx: -0.203, ry: 0.054, rz: -0.22 } };
// Xavier 06:24: the crier = HIS two pose codes. Kneeling (hands over the face) -> collapses to a lying toddler-tantrum flail.
P.kneelCry = { armL: { r: [2.965, 0.391, 0.676], o: [0, 0, 0.33] }, armR: { r: [2.8, -0.473, -0.693], o: [0, 0, 0.353] }, legL: { r: [2.157, -0.001, -0.052], o: [-0.03, 0.057, -0.237] }, legR: { r: [2.184, -0.04, -0.115], o: [-0.029, 0.073, -0.219] }, head: { r: [-0.213, 0, 0] }, root: { x: 0.044, y: 0.14, z: 0.495, rx: -0.545, ry: -0.061, rz: 0.078 } };
P.lieCry = { armL: { r: [2.074, 0.036, 0.623], o: [0, 0, -0.3] }, armR: { r: [-2.844, -0.568, 0.195], o: [-0.116, 0, 0.094] }, legL: { r: [0.18, 0.17, 0.121], o: [0.037, -0.044, -0.035] }, legR: { r: [0.697, 0.068, -0.091], o: [-0.005, -0.051, -0.134] }, head: { r: [-0.213, 0, 0] }, root: { x: 0.006, y: 0.442, z: -0.466, rx: 1.372, ry: -0.909, rz: -0.869 } };
P.kneelCryAnim = t => { const sob = Math.pow(Math.abs(Math.sin(t * 5.3)), 3), rock = Math.sin(t * 3.1), no = Math.sin(t * 4.4); return { ...P.kneelCry, armL: { r: [2.965 - .14 * sob, 0.391 + .06 * no, 0.676], o: [0, .02 * sob, 0.33] }, armR: { r: [2.8 - .14 * sob, -0.473 + .06 * no, -0.693], o: [0, .02 * sob, 0.353] }, head: { r: [-0.213 - .12 * sob, .28 * no, .06 * no] }, root: { ...P.kneelCry.root, y: 0.14 + .035 * sob, rx: -0.545 + .12 * rock - .08 * sob, rz: 0.078 + .05 * no } }; };   // heaving sobs: shoulders jerk up on every sob, head shakes no-no-no, the whole body rocks
P.lieCryAnim = t => { const a = Math.sin(t * 7.2), b = Math.sin(t * 7.2 + Math.PI), c = Math.sin(t * 5.6 + .8), d = Math.sin(t * 5.6 + 2.4); return { ...P.lieCry, armL: { r: [2.074 + .75 * Math.max(0, a), 0.036, 0.623], o: [0, 0, -0.3] }, armR: { r: [-2.844 - .6 * Math.max(0, b), -0.568, 0.195], o: [-0.116, 0, 0.094] }, legL: { r: [0.18 + .65 * Math.max(0, c), 0.17, 0.121], o: [0.037, -0.044, -0.035] }, legR: { r: [0.697 + .65 * Math.max(0, d), 0.068, -0.091], o: [-0.005, -0.051, -0.134] }, head: { r: [-0.213 + .1 * a, .3 * Math.sin(t * 3.3), 0] }, root: { ...P.lieCry.root, rz: -0.869 + .07 * Math.sin(t * 3.3) } }; };   // full tantrum: both fists bang the floor in turn, both legs kick, head rolls
P.thinkChin = { ...sit, armR: fa('armR', [-0.08, 1.22, 0.34], [-0.42, 0.92, 0.14], sit.root), armL: { r: [-0.6, 0, 0.12], o: [0, -0.02, 0.06] }, head: { r: [-0.16, -0.08, 0.04] }, root: { ...sit.root, rx: 0.03 } };   // chin on the fist, filtering her words
P.patChest = { legL: { r: [-0.05, 0, 0.12] }, legR: { r: [0.07, 0, -0.06] }, armL: fa('armL', [0.12, 1.05, 0.28], [0.42, 0.9, 0.08]), armR: fa('armR', [-0.1, 0.92, 0.3], [-0.42, 0.85, 0.08]), head: { r: [0.45, -0.1, 0] }, root: { rx: 0.1 } };   // hands patting the (new) chest, head down at it
P.pointYell = t => { const k = Math.sin(t * 7); return { legL: { r: [-0.14, 0, 0.22] }, legR: { r: [0.18, 0, -0.1] }, armR: fa('armR', [-0.2, 1.3, 0.85], [-0.42, 1.05, 0.3]), armL: { r: [0.35, 0, 0.3], o: [0, 0, 0.04] }, head: { r: [-0.15 + .04 * k, -0.05, 0.05] }, root: { rx: -0.14, rz: 0.03 * k } }; };   // one arm JABBING at her: "YOU did this" (reads muted; no flail spam)
P.laughBounce = t => { const k = Math.sin(t * 7.5); return { legL: { r: [0.04, 0, 0.1] }, legR: { r: [-0.06, 0, -0.05] }, armL: fa('armL', [0.2, 0.78, 0.35], [0.42, 0.8, 0.1]), armR: { r: [0.2, 0, -0.15] }, head: { r: [0.3 + .07 * k, 0.15, 0.06] }, root: { rx: 0.12 + .04 * k, y: -.02 + .02 * k } }; };   // doubled over giggling, shoulders bouncing
P.crierCurl = t => { const s = Math.sin(t * 5.2), b = Math.max(0, Math.sin(t * 5.2 + .6)); return { legL: { r: [-1.35, 0.2, 0.15], o: [0.03, 0.08, 0.1] }, legR: { r: [-1.1, -0.15, -0.2], o: [-0.05, 0.06, 0.12] }, armL: fa('armL', [0.2, 1.3, 0.35], [0.42, 1.0, 0.1], { y: -0.5, rx: 0.5 }), armR: fa('armR', [-0.18, 1.26, 0.38], [-0.42, 1.0, 0.1], { y: -0.5, rx: 0.5 }), head: { r: [0.6 + 0.04 * s, 0.1, 0.06] }, root: { y: -0.5, rx: 0.5, rz: 0.03 * s, x: 0.01 * b } }; };   // on the floor, knees up, hands over his face, shoulders SHAKING (never frozen)
export { P };

export const POSE_SHEET = [
  ['01 Bus kid L: singing, leaning in', 'swapA', 'busSingL', 'happy', 'seat'], ['02 Bus kid R: singing, leaning in', 'swapB', 'busSingR', 'happy', 'seat'],
  ['03 Bus kid L: stares at his new hands', 'swapA', 'busHandsL', 'shocked', 'seat'], ['04 Bus kid R: stares at her new hands', 'swapB', 'busHandsR', 'shocked', 'seat'],
  ['05 Kid bolt upright in the wrong bed', 'swapA', 'bedSitUp', 'shocked', 'bed'], ['06 Wrong grandma: forehead kiss lean', 'f025', 'grandmaLean', 'happy', ''],
  ['07 Party kid: solo verse', 'm026', 'soloSing', 'nervous', ''], ['08 Party kid: waiting his turn', 'm001', 'awkwardStand', 'bored', ''], ['09 Birthday kid over the cake', 'f007', 'cakeLean', 'sad', ''],
  ['10 Choir kid mid-anthem', 'f001', 'choirSing', 'happy', 'riser'], ['11 Principal: watching proud', 'principal', 'principalWatch', 'happy', ''], ['12 Principal: facepalm', 'principal', 'facepalm', 'annoyed', ''],
  ['13 Teacher points at twin A', 'teacher', 'teachPoint', 'annoyed', ''], ['14 Teacher points at twin B', 'teacher', 'teachPointB', 'angry', ''], ['15 Teacher gives up, sits', 'teacher', 'teachGiveUp', 'bored', 'seat'],
  ['16 Twin standing', 'twinA', 'twinStand', 'happy', ''],
  ['17 Dana at her locker, arms crossed', 'dana', 'danaLocker', 'smug', ''], ['18 Dana proud ("not once")', 'dana', 'danaProud', 'smug', ''],
  ['19 Class shouting A (standing)', 'm026', 'shoutA', 'excited', ''], ['20 Class shouting B (standing)', 'f001', 'shoutB', 'excited', ''], ['21 Class shouting C (seated)', 'm001', 'shoutC', 'excited', 'seat'],
  ['22 Dana: taped, perfectly still', 'dana', 'danaStill', 'neutral', 'seat'],
  ['23 Dana at breakfast, content', 'dana', 'danaBreakfast', 'happy', 'seat'], ['24 Dad doing the dishes', 'dana_dad', 'dadDishes', 'happy', ''],
  ['25 Dana: the tension (eyes slide)', 'dana', 'danaTense', 'nervous', ''],
  ['26 Dana answers the time (autopilot)', 'dana', 'danaAnswer', 'bored', ''], ['40 Mr. Bacon Man taps his wrist (the ask)', 'bacon', 'wristTap', 'happy', ''], ['27 Dana: resigned shrug', 'dana', 'danaShrug', 'sad', ''],
  ['28 Boy writing the list', 'boy', 'writeList', 'determined', 'seat'], ['29 Boy: list, look up (idea)', 'boy', 'writeLook', 'smug', 'seat'],
  ['30 Boy taps his bare wrist (the ask)', 'boy', 'wristTap', 'happy', ''], ['31 Boy: mock innocent', 'boy', 'mockInnocent', 'smug', ''],
  ['32 Mid-swap: boy flails', 'trigPost1', 'midSwapBoy', 'angry', ''], ['33 Mid-swap: Dana flails', 'danaPost1', 'midSwapDana', 'shocked', ''],
  ['34 His body (Dana inside): yelling', 'trigPost1', 'yellFlail', 'angry', ''],
  ['35 POV: left hand up', 'danaPost1', 'povHandL', 'neutral', ''], ['36 POV: both hands up', 'danaPost1', 'povHandLR', 'neutral', ''],
  ['37 Her body (him inside): smug', 'danaPost1', 'smugNew', 'smug', ''], ['41 Ending: your myPose', 'dana', 'myPose', 'smug', ''], ['42 Ending: kiss at the lips', 'dana', 'selfieKissLips', 'smug', ''], ['43 Ending: the air kiss out', 'dana', 'selfieKissOut', 'happy', ''], ['44 Ending: your myPose (phone swings to him)', 'dana', 'myPose', 'neutral', ''],
  ['39 The crier: kneeling, hands over the face', 'boy', 'kneelCry', 'crying', 'floor'], ['39b The crier: toddler tantrum flail', 'boy', 'lieCry', 'crying', 'floor'],
  ['43 Dana thinking (chin on fist)', 'dana', 'thinkChin', 'neutral', 'seat'], ['44 Boy-body pats the strange chest', 'trigPost1', 'patChest', 'angry', ''],
  ['45 Boy-body jabs at her', 'trigPost1', 'pointYell', 'angry', ''],
];

// ---------------- the shot list (times = voice/words.json; labels for validate()) ----------------
const SH = [
  { t: 0.00, dur: 1.90, id: 'busPoof', who: 'swapA', size: 'wide', angle: 'eye', move: 'push', speed: 1.8 },
  { t: 1.90, dur: 1.35, id: 'busA', who: 'swapA2', size: 'close', angle: 'high', move: 'truckL', speed: 1.2 },
  { t: 3.25, dur: 1.35, id: 'busB', who: 'swapB2', size: 'medium', angle: 'eye', move: 'pull', speed: 2.4 },
  { t: 4.60, dur: 3.20, id: 'bedroom', who: 'swapA', size: 'full', angle: 'high', move: 'craneDown', speed: 1.0 },
  { t: 7.80, dur: 2.18, id: 'party', who: 'kidSolo', size: 'wide', angle: 'eye', move: 'truckL', speed: 1.4 },
  { t: 9.98, dur: 1.98, id: 'choir', who: 'principal', size: 'wide', angle: 'low', move: 'truckR', speed: 2.2 },
  { t: 11.96, dur: 3.66, id: 'twins', who: 'teacher', size: 'medium', angle: 'eye', move: 'push', speed: 0.8 },
  { t: 15.62, dur: 3.44, id: 'danaLocker', who: 'dana', size: 'full', angle: 'eye', move: 'orbitL', speed: 1.3 },
  { t: 19.06, dur: 1.90, id: 'taped', who: 'dana', size: 'wide', angle: 'high', move: 'punch', speed: 2.4 },
  { t: 20.96, dur: 1.50, id: 'danaTable', who: 'dana', size: 'medium', angle: 'eye', move: 'push', speed: 1.5 },
  { t: 22.46, dur: 0.82, id: 'dishes', who: 'dana_dad', size: 'full', angle: 'eye', move: 'truckL', speed: 2.6 },
  { t: 23.28, dur: 1.02, id: 'quietHall', who: 'miniA', size: 'wide', angle: 'eye', move: 'push', speed: 1.1 },
  { t: 24.30, dur: 1.52, id: 'pancakes', who: 'dana', size: 'xclose', angle: 'high', move: 'punch', speed: 2.2 },
  { t: 25.82, dur: 1.72, id: 'danaTense', who: 'dana', size: 'close', angle: 'eye', move: 'push', speed: 0.7 },
  { t: 27.54, dur: 2.85, id: 'askTime', who: 'dana', size: 'medium', angle: 'eye', move: 'push', speed: 1.2 },
  { t: 30.39, dur: 2.31, id: 'danaReply', who: 'dana', size: 'close', angle: 'low', move: 'push', speed: 0.7 },
  { t: 32.70, dur: 0.98, id: 'ask2', who: 'dana', size: 'medium', angle: 'eye', move: 'truckR', speed: 1.6 },
  { t: 33.68, dur: 0.90, id: 'ask3', who: 'dana', size: 'close', angle: 'low', move: 'punch', speed: 2.3 },
  { t: 34.58, dur: 2.34, id: 'deskList', who: 'boy', size: 'xclose', angle: 'high', move: 'push', speed: 1.2 },
  { t: 36.92, dur: 2.20, id: 'hallAsk', who: 'boy', size: 'full', angle: 'eye', move: 'track', speed: 1.8 },
  { t: 39.12, dur: 1.72, id: 'comic2', who: 'dana', size: 'wide', angle: 'eye', move: 'hold', speed: 0.5 },
  { t: 40.84, dur: 2.46, id: 'midSwap', who: 'trigPost1', size: 'medium', angle: 'low', move: 'orbitR', speed: 1.5 },
  { t: 43.30, dur: 2.70, id: 'povHands', who: 'danaPost1', size: 'close', angle: 'eye', move: 'hold', speed: 0.3 },
  { t: 46.00, dur: 1.12, id: 'pullOut', who: 'danaPost1', size: 'medium', angle: 'eye', move: 'pull', speed: 2.8 },
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
  // the bus ceiling / walls were taking the GREEN grass bounce (hemi ground colour) and read as a green slab (Xavier 10:31): a warm interior glow
  { const seen = new Set(); bus.traverse(o => { if (!o.isMesh || !o.material || seen.has(o.material) || !o.material.color || o.material.map) return; seen.add(o.material);
    const c = o.material.color, l = .299 * c.r + .587 * c.g + .114 * c.b; if (l > .6 && o.material.emissive) { o.material.emissive.set('#d9cdb4'); o.material.emissiveIntensity = .32; } }); }

  const HA = await buildHouse(scene, 'A', { floors: ['up'], origin: [HUP[0], -4.38, HUP[2]] });   // 'his' room floor lands at y 0
  await furnishHouse(scene, HA, ['his', 'parents']);
  const HB = await buildHouse(scene, 'B', { floors: ['ground'], origin: HBG });
  await furnishHouse(scene, HB, ['kitchen', 'hallG', 'dining']);
  const roomW = (H, id, lx, lz) => { const r = H.rooms[id].rect, o = H.root.position; return [o.x + r.x + lx, o.z + r.z + lz]; };   // room-local (from its NW corner) -> world x,z
  const roomY = (H, id) => H.root.position.y + H.rooms[id].y;

  const C = await classroom(scene); C.root.position.set(CLS[0], 0, CLS[2]); scene.updateMatrixWorld(true);
  const clsW = (lx, lz) => [CLS[0] + lx, CLS[2] + lz];
  { const ch = await (await import('../engine/designs/school.js')).chair(); ch.position.set(CLS[0] + 1.45, 0, CLS[2] - 3.55); ch.rotation.y = -.3; scene.add(ch); }   // the chair the teacher drops onto (shot 5): already there, behind her

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
  // pancakes rebuilt against reference (Xavier 06:24: "proper 3D circular pancakes layered, top one drooping over the side"):
  // each one a lathe with a rounded edge, stacked with slight offsets/rotations, the TOP one half off the stack; syrup cap
  // with drips down the sides; butter pat; wide plate.
  const pan = new THREE.Group(); {
    const pk = (r, hgt) => { const pts = []; const R = r, H2 = hgt; for (let i = 0; i <= 8; i++) { const a2 = i / 8 * N; pts.push(new THREE.Vector2(R * (0.015 + .985 * Math.sin(a2 / 2 + .18)) * (i === 0 ? 0 : 1), H2 * (0.5 - 0.5 * Math.cos(a2)))); }
      return new THREE.LatheGeometry([new THREE.Vector2(0, 0), ...pts.map(q => new THREE.Vector2(Math.min(q.x, R), q.y)), new THREE.Vector2(0, H2)], 28); };
    const pmat = new THREE.MeshStandardMaterial({ color: '#d8964a', roughness: .75 }), pmat2 = new THREE.MeshStandardMaterial({ color: '#e3a85e', roughness: .75 });
    const RS = [.17, .163, .168, .158]; let y = .02;
    for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(pk(RS[i], .042), i % 2 ? pmat2 : pmat); m.position.set((i % 2 ? -.008 : .01) * (i + 1) * .5, y, (i % 3 - 1) * .008);
      const top = new THREE.Mesh(new THREE.CircleGeometry(RS[i] * .82, 24), new THREE.MeshStandardMaterial({ color: '#edbd7b', roughness: .8 })); top.rotation.x = -N / 2; top.position.y = .0425; m.add(top);
      if (i === 3) { m.position.x = .085; m.rotation.z = -.14; m.position.y = y - .004; }   // the top one half off the stack, drooping
      pan.add(m); y += .041; }
    const syrTop = new THREE.Mesh(pk(.126, .022), new THREE.MeshPhysicalMaterial({ color: '#53280a', roughness: .18, clearcoat: .8 })); syrTop.position.set(.02, y - .028, 0); pan.add(syrTop);
    const butter = new THREE.Mesh(new THREE.BoxGeometry(.055, .022, .055), new THREE.MeshStandardMaterial({ color: '#f6dc7e', roughness: .5 })); butter.position.set(.0, y + .004, .01); butter.rotation.y = .4; pan.add(butter);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(.26, .21, .028, 28), new THREE.MeshStandardMaterial({ color: '#f2efe6', roughness: .4 })); plate.position.y = .012; pan.add(plate); }
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
  // NO PURE WHITES in set dressing (lookmeter high3 blowouts 2026-11-28): clamp untextured near-white set materials once
  { const seen = new Set(); scene.traverse(o => { if (!o.isMesh || !o.material || !o.material.color || o.material.map || seen.has(o.material)) return;
    seen.add(o.material); const c = o.material.color, l = .299 * c.r + .587 * c.g + .114 * c.b; if (l > .86) c.multiplyScalar(.84); }); }
  await mk('boy', 'boy'); await mk('dana', 'dana', { emo: 'smug' });
  await mk('swapA', 'swapA', { emo: 'happy' }); await mk('swapB', 'swapB', { emo: 'happy' });
  // THE SWAP RULE (Xavier 08:37): position + FIT stay; hair + face + body trade. Hybrid actors appear at the poof.
  await mk('swapA2', 'swapA2', { emo: 'shocked' }); await mk('swapB2', 'swapB2', { emo: 'shocked' });
  await mk('kid0P', 'kid0P', { emo: 'shocked' }); await mk('kid1P', 'kid1P', { emo: 'shocked' });
  await mk('kid3L', 'kid3L'); await mk('kid4L', 'kid4L');
  // mains (the twist): at the WTF only hair+body trade, faces stay; faces complete at the sub part; 2D red hoodie post-swap
  await mk('trigPost1', 'trigPost1');
  await mk('danaPost1', 'danaPost1', { emo: 'shocked' });
  await mk('grandma', 'f025', { emo: 'happy' });
  await mk('teacher', 'teacher', { emo: 'annoyed' }); await mk('principal', 'principal', { emo: 'happy' });
  await mk('twinA', 'twinA'); await mk('twinB', 'twinB');
  await mk('dana_dad', 'dana_dad', { emo: 'happy' });
  await mk('bacon', 'bacon');   // subscriber cameo (Xavier 05:27)
  const BANK = ['m026', 'm001', 'f001', 'f007', 'f002', 'm002', 'f003', 'm027', 'f004', 'm003', 'f013', 'm028'];   // 0-5 = classroom kids too; 6-11 only fill the choir
  const kids = []; for (let i = 0; i < 12; i++) kids.push(await mk('kid' + i, BANK[i]));
  for (let i = 0; i < 12; i++) await mk('kid' + i + '2', 'kid' + i + '2', { emo: 'shocked' });   // choir post-swap hybrids
  A.kidSolo = A.kid0;

  // ======================= STAGING =======================
  // --- 1: THE BUS (Xavier 10:31 rev: camera must SEE them + a FULL bus). The pair sit in the FRONT row so the camera has the
  // clear 3 m to the bulkhead to pull back into; every row behind them is full of kids who turn at the poof.
  // Shots: 0-1.9 the two-shot (duet -> poof -> trade), 1.9-3.25 close on the aisle kid, 3.25-4.6 close on the window kid.
  const BZ = -bus.userData.L / 2 + 1.6 + 4 * 1.55;   // FRONT row (row 4)
  const seatL = busLocal(-2.08, .69, BZ + .08), seatR = busLocal(-.82, .69, BZ + .08);   // window kid / aisle kid on the -x bench (spans -2.6..-.4)
  A.swapA.show(0, 1.03); A.swapB.show(0, 1.03); A.swapA2.show(1.03, 4.60); A.swapB2.show(1.03, 4.60);
  const yS = seatL.y - ground(seatL.x, seatL.z);
  A.swapA.key(-1, { pose: 'busSingL', at: [seatR.x, seatR.z], ry: BUS.ry, y: yS });
  A.swapB.key(-1, { pose: 'busSingR', at: [seatL.x, seatL.z], ry: BUS.ry, y: yS });
  // THE SWAP (Xavier 08:37): seats + fits stay; in the poofs each kid's hair/face/body becomes the OTHER's (hybrid actors)
  A.swapA2.key(1.03, { pose: 'busHandsR', at: [seatR.x, seatR.z], ry: BUS.ry, y: yS, dur: .01 })
    .key(2.3, { pose: { ...P.busHandsR, head: { r: [0.3, -0.45, -0.1] } }, dur: .35 }).key(2.95, { pose: { ...P.busHandsR, head: { r: [-0.05, -0.55, -0.05] } }, dur: .3 })   // looks at his hands, then over at his seatmate
    .key(3.6, { pose: 'busHandsR', dur: .3 });
  A.swapB2.key(1.03, { pose: 'busHandsL', at: [seatL.x, seatL.z], ry: BUS.ry, y: yS, dur: .01 })
    .key(2.0, { pose: { ...P.busHandsL, head: { r: [0.15, 0.4, 0.1] } }, dur: .35 }).key(3.6, { pose: { ...P.busHandsL, head: { r: [0.42, 0.05, 0.05] } }, dur: .35 })   // stares at the new hands, then at the hair falling past them
    .key(4.2, { pose: { ...P.busHandsL, head: { r: [0.0, 0.5, 0.1] } }, dur: .3 });
  A.swapA.face(-1, 'happy'); A.swapB.face(-1, 'happy');
  A.swapA2.face(1.0, 'shocked').face(3.0, 'scared'); A.swapB2.face(1.0, 'shocked').face(3.7, 'scared');
  A.swapA.noClamp = A.swapB.noClamp = A.swapA2.noClamp = A.swapB2.noClamp = true;   // seated above the road: the clamp would yank them to the asphalt
  fx.poof(1.0, [seatL.x, seatL.y + .6, seatL.z], { size: 1.1, dur: 1.1, n: 18 }); fx.poof(1.0, [seatR.x, seatR.y + .6, seatR.z], { size: 1.1, dur: 1.1, n: 18 });
  // the FULL bus: 11 kids in the rows behind + across the aisle. Chatting / looking out before; all turn to the poof after.
  const PASS = [['m004', -2.0, 3, -.15], ['f014', -.95, 3, .2], ['m006', 1.0, 3, .25], ['f016', 2.05, 3, -.1],
    ['m014', -2.0, 2, .3], ['f017', 1.55, 2, -.2], ['m029', -.95, 1, 0], ['f018', 2.0, 1, .15], ['m017', 1.0, 1, -.3], ['m031', -1.6, 0, .1], ['f008x', 1.4, 4, -.25]];
  for (let k = 0; k < PASS.length; k++) { const [id, lx, row, h0] = PASS[k], nm = 'bus' + k, base = id === 'f008x' ? 'f011' : id;
    await mk(nm, base, { emo: k % 3 ? 'happy' : 'neutral' }); const a = A[nm], sp = busLocal(lx, .69, -bus.userData.L / 2 + 1.6 + row * 1.55 + .08);
    a.show(0, 4.6); a.noClamp = true; const ph = k * 1.7, lean = lx < 0 ? -1 : 1;
    const look = t => t < 1.0 ? h0 + .25 * Math.sin(t * 2.2 + ph) : (row === 4 ? -0.9 : -.35 * lean) + .05 * Math.sin(t * 3 + ph);   // after the poof: everyone looks at the front-row pair
    a.key(-1, { pose: t => ({ ...sit, head: { r: [t < 1.0 ? .05 : -.08, look(t), 0] }, root: { ...sit.root, rz: t < 1.0 ? .03 * Math.sin(t * 1.6 + ph) : .08 * lean, z: t < 1.0 ? 0 : .06 } }), at: [sp.x, sp.z], ry: BUS.ry, y: yS });
    a.face(-1, k % 3 ? 'happy' : 'neutral').face(1.05 + (k % 4) * .06, k % 2 ? 'shocked' : 'surprised'); }
  // mailman on skates glides past outside the window (lore cameo, through the glass behind them)
  await mk('mailman', 'mailman_skates', { emo: 'happy' }); A.mailman.noClamp = true; A.mailman.show(1.2, 4.1);
  A.mailman.extra = (t, a) => { const u = cl((t - 1.2) / 2.6); const R = a.a.root; const x0 = BUS.x - 6, x1 = BUS.x + 7;   // passes along the sidewalk beyond the far window
    R.position.set(lerp(x0, x1, u), ground(lerp(x0, x1, u), BUS.z - 4.1) + .95, BUS.z - 4.1); R.rotation.y = N / 2; R.rotation.z = Math.sin(t * 5) * .04; };
  A.mailman.key(1.1, { pose: t => ({ legL: { r: [.05 + Math.max(0, Math.sin(t * 5)) * .35, 0, -.1] }, legR: { r: [-.05 - Math.max(0, -Math.sin(t * 5)) * .35, 0, .1] }, armL: { r: [.3, 0, .25] }, armR: { r: [-1.2, 0, -.3] }, head: { r: [0, -.3, 0] }, root: { rx: .16 } }), at: [BUS.x - 6, BUS.z - 4.1] });

  // --- 2: BEDROOM (House A guest room = the "wrong" room): kid under the duvet frozen, wrong grandma leans in for the kiss ---
  const BED2 = [8556.25, 2.3]   /* parents' bed centre (probed: x 8554.6-8557.9, headboard -x; z 1.26-3.34) */;
  const bed2 = BED2, bedY = 0;
  A.swapA.show(4.6, 7.8);
  A.swapA.key(4.60, { pose: 'bedSitUp', at: [bed2[0] + .95, bed2[1] - .15], ry: -N / 2, y: .86 });   // sat bolt upright in the wrong bed (mattress top .86, probed)   // on the bed (furnish puts the guest bed along the wall; verified in stills)
  A.swapA.face(4.55, 'shocked');
  A.grandma.show(4.6, 7.8);
  // she SITS on the bed edge beside him (standing she is shorter than the seated kid: the kiss landed on his chest, probed 6.1)
  A.grandma.noClamp = true;
  const gSit = { legL: { r: [-0.32, 0.05, 0.1], o: [0.02, 0.0, 0.16] }, legR: { r: [-0.24, -0.05, -0.12], o: [-0.04, 0.0, 0.34] }, armL: { r: [0.15, 0, 0.2] }, armR: fa('armR', [-0.3, 0.72, 0.42], [-0.42, 0.75, 0.15]), head: { r: [0.18, -0.25, 0] }, root: { y: -0.06 } };
  A.grandma.key(4.5, { pose: gSit, at: [bed2[0] + .95, bed2[1] + 1.3], ry: N - .35, y: .86 })
    .key(5.3, { pose: { ...gSit, root: { rx: 0.4, z: 0.3, y: -0.06 }, head: { r: [0.42, -0.3, 0] }, armR: fa('armR', [-0.35, 0.6, 0.55], [-0.45, 0.7, 0.2], { rx: 0.4 }) }, dur: .5, ease: 'io' })   // hand to his shoulder, starts the lean
    .key(6.0, { pose: { ...gSit, root: { rx: 0.5, z: 0.42, y: -0.08 }, head: { r: [0.66, -0.35, 0], o: [0, -0.03, 0.1] }, armR: fa('armR', [-0.38, 0.5, 0.5], [-0.45, 0.65, 0.2], { rx: 0.5 }) }, dur: .35, ease: 'io' })   // the KISS: face down onto his forehead
    .key(7.0, { pose: gSit, dur: .45, ease: 'io' });
  A.swapA.key(5.15, { pose: { ...P.bedSitUp, armL: { r: [0.2, 0, 0.5], o: [-0.1, 0, 0] } }, dur: .3, ease: 'io' })
    .key(6.0, { pose: { ...P.bedSitUp, armL: { r: [0.25, 0, 0.55], o: [-0.12, 0, 0] }, head: { r: [-0.3, 0.02, 0.04] }, root: { y: -.51, rx: -.18, z: -.1 } }, dur: .3, ease: 'io' })
    .key(6.6, { pose: { ...P.bedSitUp, armL: { r: [0.25, 0, 0.55], o: [-0.12, 0, 0] }, root: { y: -.51, rx: -.2, z: -.22 } }, dur: .3, ease: 'io' })
    .key(7.3, { pose: 'bedSitUp', dur: .4 });   // scoots back out of it, then settles
  A.grandma.face(4.5, 'happy');

  // --- 3: CLASS PARTY: cake on a front desk, kids sing ONE AT A TIME (awkward), birthday kid deflates ---
  // Xavier 06:24 mute test: we must SEE the cake and SEE the swap. Cake on a front desk in the foreground; kid0 sings solo
  // (music note), kid1 eagerly joins (second note), POOF: the two trade places; both stare at themselves; the birthday kid deflates.
  const PCAKE = clsW(0, -2.95);
  const PK = [[clsW(-.6, -4.35), .15], [clsW(.7, -4.55), -.12], [clsW(.05, -3.62), 0]];   // kid0 left, kid1 right, birthday kid at the cake
  A.kid0.show(7.8, 9.06); A.kid1.show(7.8, 9.06); A.kid2.show(7.8, 9.98); A.kid0P.show(9.06, 9.98); A.kid1P.show(9.06, 9.98);
  A.kid0.key(7.7, { pose: 'soloSing', at: PK[0][0], ry: PK[0][1] });
  A.kid0P.key(9.06, { pose: 'soloSing', at: PK[0][0], ry: PK[0][1], dur: .01 }).key(9.15, { pose: { ...P.awkwardStand, armL: { r: [0.1, 0, 0.1] } }, dur: .25 }).key(9.5, { pose: { ...P.awkwardStand, armL: { r: [0.1, 0, 0.1] }, head: { r: [0.5, 0.1, 0] } }, dur: .3 });
  A.kid1.key(7.7, { pose: 'awkwardStand', at: PK[1][0], ry: PK[1][1] }).key(8.5, { pose: 'soloSing', dur: .25 });
  A.kid1P.key(9.06, { pose: 'soloSing', at: PK[1][0], ry: PK[1][1], dur: .01 }).key(9.15, { pose: { ...P.awkwardStand, armR: { r: [0.1, 0, -0.1] } }, dur: .25 }).key(9.55, { pose: { ...P.awkwardStand, head: { r: [0.5, -0.15, 0] } }, dur: .3 });
  A.kid2.key(7.7, { pose: 'cakeLean', at: PK[2][0], ry: PK[2][1] }).key(9.2, { pose: { ...P.cakeLean, head: { r: [0.45, 0, 0.05] } }, dur: .4 });
  fx.poof(9.05, [PK[0][0][0], 1.35, PK[0][0][1]], { size: .7, n: 12 }); fx.poof(9.05, [PK[1][0][0], 1.35, PK[1][0][1]], { size: .7, n: 12 });
  A.kid0.face(7.7, 'nervous'); A.kid1.face(7.7, 'excited'); A.kid0P.face(9.0, 'shocked'); A.kid1P.face(9.0, 'shocked'); A.kid2.face(7.7, 'sad');

  // --- 4: THE CHOIR: chain poof left -> right on the risers, last one takes the principal; facepalm on "anthem" ---
  // 12 singers, two risers, staggered; the swap chain sweeps left -> right along the front row then the back row, one poof per kid
  const CH = []; for (let i = 0; i < 12; i++) { const back = i >= 6, r = back ? audU.riser2 : audU.riser1, j = i % 6; CH.push({ x: AUD[0] - 3.9 + j * 1.5 + (back ? .75 : 0), z: AUD[2] + r.z + (back ? .32 : 0), y: r.y }); }   // 1.5 apart (an R6 is 1.36 wide) so arms never meet; back row clear of the curtain
  // pair trades, left -> right, faster and faster: pair k = kids (2k, 2k+1) trade at TT[k]; the whole line scrambles
  const TT6 = [10.12, 10.40, 10.66, 10.90, 11.12, 11.34];
  for (let i = 0; i < 12; i++) { const a = A['kid' + i], a2 = A['kid' + i + '2'];
    const pr = Math.floor((i < 6 ? i : i - 6) / 2) + (i < 6 ? 0 : 3), TTk = TT6[pr], j = (i % 2 === 0) ? i + 1 : i - 1;   // partner
    a.show(9.98, TTk); a2.show(TTk, 11.96); a.noClamp = a2.noClamp = true;
    a.key(9.98, { pose: P.choirSing(i), at: [CH[i].x, CH[i].z], ry: 0, y: CH[i].y }); a.face(9.9, 'happy');
    a2.key(TTk, { pose: P.choirSing(i), at: [CH[i].x, CH[i].z], ry: 0, y: CH[i].y, dur: .01 });
    a2.key(TTk + .1, { pose: { ...P.choirSing(i), armL: { r: [-0.5, 0, 0.18], o: [0, .03, .06] }, armR: { r: [-0.45, 0, -0.18], o: [0, .03, .06] }, head: { r: [0.45, (i % 2 ? .3 : -.3), 0] } }, dur: .18, style: 'snap' });
    a2.face(TTk, 'shocked'); }
  for (const k of [0, 1, 2, 3, 4, 5]) { const i = k < 3 ? k * 2 : 6 + (k - 3) * 2; fx.poof(TT6[k], [CH[i].x, CH[i].y + 1.15, CH[i].z], { size: .6, n: 11 }); fx.poof(TT6[k], [CH[i + 1].x, CH[i + 1].y + 1.15, CH[i + 1].z], { size: .6, n: 11 }); }
  A.principal.show(9.98, 11.96); A.principal.noClamp = true;
  A.principal.key(9.98, { pose: 'principalWatch', at: [AUD[0] + 3.4, AUD[2] + 2.4], ry: -.4, y: audU.deckY })
    .key(11.34, { pose: 'facepalm', dur: .18, style: 'snap' });
  A.principal.face(9.9, 'happy').face(11.34, 'annoyed');
  fx.poof(11.46, [AUD[0] + 3.4, audU.deckY + 1.5, AUD[2] + 2.4], { size: .9, n: 16 });   // the last swap takes HIM

  // --- 5: TWINS: teacher points A, then B; the twins poof-swap mid-point; marker drops; she sits, done ---
  const TA = clsW(-.35, -4.55), TB = clsW(-1.55, -5.75), TT = clsW(.6, -4.1);   // A up front being yelled at; B behind-left; teacher near right
  const TRY = Math.atan2(TA[0] - TT[0], TA[1] - TT[1]);
  A.twinA.show(11.96, 15.62); A.twinB.show(11.96, 15.62); A.teacher.show(11.96, 15.62);
  A.twinA.key(11.9, { pose: { ...P.twinStand(1), head: { r: [0.35, 0.2, 0.05] } }, at: TA, ry: TRY + N })   /* faces the teacher */   // sheepish, head down, facing the teacher
    .key(13.15, { pose: { ...P.twinStand(1), armL: { r: [-0.3, 0, 0.55] }, armR: { r: [-0.28, 0, -0.5] }, head: { r: [0.1, 0.2, 0] } }, dur: .3 });   // innocent palms after the poof
  A.twinB.key(11.9, { pose: P.twinStand(-1), at: TB, ry: .55 })
    .key(13.3, { pose: t => P.laughBounce(t), dur: .3 });   // the OTHER one cracks up
  A.teacher.key(11.9, { pose: 'teachPoint', at: TT, ry: TRY })
    .key(12.6, { pose: { ...P.teachPoint, root: { rx: -0.16 }, head: { r: [-0.02, -0.1, 0] } }, dur: .3, ease: 'io' })   // leaning INTO the yell
    .key(13.0, { pose: 'teachPoint', dur: .25, ease: 'io' })
    .key(14.2, { pose: 'facepalm', dur: .3 })
    .key(14.7, { pose: 'teachGiveUp', at: [TT[0] + .85, TT[1] + .55], y: 0, dur: .5, ease: 'io', glide: .5 });   // drops onto the chair
  fx.poof(13.0, [TA[0], 1.4, TA[1]], { size: .55, n: 10 }); fx.poof(13.0, [TB[0], 1.4, TB[1]], { size: .55, n: 10 });   // the trade (identical twins = nothing changes = the joke)
  A.teacher.face(11.9, 'furious').face(14.2, 'bored');
  A.twinA.face(11.9, 'nervous').face(13.2, 'happy'); A.twinB.face(11.9, 'happy').face(13.3, 'laugh');
  A.teacher.talk(12.0, 12.9);   // she IS yelling (flap): reads muted

  // --- 6: DANA at her locker (hallway), arms crossed, proud ---
  const DL = [HALL.x + .55, HALL.z + 1.0], DRY = -N / 2 - 1.0;   // Dana's locker spot; she stands angled down the corridor (so a camera inside the 3.6 m hall sees her face)
  A.dana.show(15.62, 20.96);
  A.dana.key(15.55, { pose: 'danaLocker', at: DL, ry: DRY }).key(17.4, { pose: 'danaProud', dur: .4 });
  A.dana.face(15.55, 'smug');
  // two background kids chat behind her, then poof-TRADE mid-sentence: the whole town swaps daily, Dana never (the contrast)
  const BG1 = [HALL.x - .62, HALL.z - 3.3], BG2 = [HALL.x - .62, HALL.z - 4.45];
  A.kid3.show(15.62, 17.09); A.kid4.show(15.62, 17.09);
  A.kid3L.show(17.09, 19.06); A.kid4L.show(17.09, 19.06);
  A.kid3L.key(17.09, { pose: { ...P.relaxed, head: { r: [0.4, 0.15, 0] } }, at: BG1, ry: N + .15, dur: .01 });
  A.kid4L.key(17.09, { pose: { ...P.relaxed, head: { r: [0.45, 0, 0] } }, at: BG2, ry: .15, dur: .01 });
  A.kid3L.face(17.0, 'shocked'); A.kid4L.face(17.0, 'confused');
  A.kid3.key(15.6, { pose: { ...P.relaxed, armR: fa('armR', [-0.2, 0.9, 0.4], [-0.42, 0.85, 0.1]) }, at: BG1, ry: N + .15 })
  A.kid4.key(15.6, { pose: { ...P.relaxed, head: { r: [0.08, -0.1, 0] } }, at: BG2, ry: .15 })
  fx.poof(17.08, [BG1[0], 1.4, BG1[1]], { size: .5, n: 9 }); fx.poof(17.08, [BG2[0], 1.4, BG2[1]], { size: .5, n: 9 });
  A.kid3.face(15.6, 'happy').face(17.2, 'shocked'); A.kid4.face(15.6, 'happy').face(17.2, 'shocked');
  // --- 7: classroom screaming answers; Dana sits dead still, tape on her mouth ---
  const DS = C.seats[7];   // Dana's desk (2nd row); class seats FACE THE BOARD (-z) = ry N (she sat backwards in rev1)
  A.dana.key(19.06, { pose: 'thinkChin', at: clsW(DS.x, DS.z), ry: N, y: 0, dur: .01 })
    .key(20.2, { pose: { ...P.thinkChin, head: { r: [0.06, 0.18, 0.04] } }, dur: .4, ease: 'io' });   // mulling it over (the roulette spins above)
  A.kid0.show(19.06, 20.96); A.kid1.show(19.06, 20.96); A.kid5.show(19.06, 20.96);
  A.kid0.key(19.06, { pose: 'shoutA', at: clsW(DS.x - 2.3, DS.z + .4), ry: N - .3 }).key(19.9, { pose: { ...P.shoutA, armR: { r: [2.7, -0.5, 0.4], o: [-0.06, 0.22, 0] } }, dur: .3, ease: 'io' });
  A.kid1.key(19.06, { pose: 'shoutB', at: clsW(DS.x + 2.2, DS.z - .7), ry: N + .3 }).key(20.1, { pose: { ...P.shoutB, head: { r: [-0.5, 0, -0.1] } }, dur: .3, ease: 'io' });
  A.kid5.key(19.06, { pose: 'shoutC', at: clsW(DS.x - 1.35, DS.z - 1.5), ry: N - .1, y: 0 });
  A.kid0.face(19.0, 'excited'); A.kid1.face(19.0, 'excited'); A.kid5.face(19.0, 'excited'); A.dana.face(19.0, 'neutral');
  // --- 8: DANA'S LIFE (House B): breakfast table / dad at the sink / the empty quiet hall / pancakes insert ---
  const KT = [8652.8, 124.52];   // the middle island stool (probed): she faces the island (-z)
  const SINK = [8653.6, 121.75];  // in front of the kitchen run (north wall), facing it
  A.dana.show(20.96, 22.46).show(24.3, 25.82);
  A.dana.key(20.96, { pose: 'danaBreakfast', at: KT, ry: N, y: .28 });   // stool seat .92 vs chair .68
  A.dana_dad.show(22.46, 23.28);
  A.dana_dad.key(22.4, { pose: 'dadDishes', at: [SINK[0], SINK[1] + .16], ry: N });
  A.dana.key(24.25, { pose: { ...P.danaBreakfast, armR: fa('armR', [-0.42, 1.0, 0.18], [-0.46, 0.85, 0.05], sit.root), armL: { r: [-0.35, 0, 0.08], o: [0, 0, 0] } }, at: KT, ry: N, y: .28 });
  A.dana.face(20.9, 'happy');
  A.dana_dad.face(22.4, 'neutral');

  // the two mini "little brothers" (shrunken base bodies) chasing each other in Dana's hall: FROZEN + X + grayscale at 23.85
  await mk('miniA', 'm005'); await mk('miniB', 'm010');
  const HWx = roomW(HB, 'dining', 1.1, 0.48);   // lane in front of the table (table z 127.95.., lane ~127.1-127.7)   // the dining room floor: renders clean, unlike the deep back hall
  for (const [n, off, ph] of [['miniA', 0, 0], ['miniB', .95, 2.1]]) { const a2 = A[n]; a2.a.root.scale.setScalar(.72); a2.noClamp = true; a2.show(23.28, 24.3);
    a2.extra = (t, aa) => { const u = (t - 23.28) / 1.0, x = HWx[0] + .3 + ((u * 1.08 + off) % 2.1), R = aa.a.root; R.position.set(x, .06 + Math.abs(Math.sin(t * 9 + ph)) * .1, HWx[1] + Math.sin(x * 1.7 + ph) * .22); R.rotation.y = N / 2 + Math.sin(t * 3 + ph) * .2; };
    a2.key(23.2, { pose: t2 => ({ legL: { r: [.6 * Math.sin(t2 * 11 + ph), 0, .06] }, legR: { r: [-.6 * Math.sin(t2 * 11 + ph), 0, -.06] }, armL: { r: [-.5 * Math.sin(t2 * 11 + ph) - .3, 0, .2] }, armR: { r: [.5 * Math.sin(t2 * 11 + ph) - .3, 0, -.2] }, head: { r: [0, Math.sin(t2 * 2) * .2, 0] }, root: { rx: .18 } }), at: [HWx[0] + .4, HWx[1]] }); a2.face(23.2, ph ? 'furious' : 'laugh'); }
  // the tense beat: somewhere behind her a phone plays HER SONG: a kid bops to it (note above his head); Dana freezes
  A.kid8.show(25.82, 27.54);
  A.kid8.key(25.8, { pose: t => ({ legL: { r: [.04, 0, .08] }, legR: { r: [-.05, 0, -.05] }, armL: fa('armL', [0.18, 0.95, 0.3], [0.42, 0.85, 0.1]), armR: { r: [.1, 0, -.1] }, head: { r: [.25 + Math.sin(t * 5.4) * .07, -.15, Math.sin(t * 5.4) * .06] }, root: { rz: Math.sin(t * 2.7) * .04 } }), at: [HALL.x - .7, HALL.z - 2.9], ry: .4 });
  A.kid8.face(25.8, 'happy');

  // --- 9: the tension: Dana close-up at the locker, eyes slide ---
  A.dana.show(25.82, 27.54);
  A.dana.key(25.82, { pose: 'danaProud', at: DL, ry: DRY, dur: .01 }).key(26.3, { pose: 'danaTense', dur: .5, ease: 'io' });
  A.dana.face(25.78, 'smug').face(26.4, 'nervous');

  // --- 10 (Xavier 04:44): NOT a comic. Just how it goes every day: a classmate taps his wrist, "time?", Dana answers on autopilot.
  // The comic split is saved for the ONE special moment (39.12). ---
  // Xavier 05:27: the classmate who asks Dana the time = MR. BACON MAN, a subscriber, in his REAL avatar (cast 'bacon'); no printed tee any more
  // his gaming chair is furnished facing AWAY from the desk (clipscan: he sat inside its back): turn it round to face the desk
  scene.traverse(o => { if (o.name === 'gaming chair') { const p = new THREE.Vector3(); o.getWorldPosition(p); if (Math.abs(p.x - 8565.05) < .3 && Math.abs(p.z - 2.97) < .3) o.rotation.y += Math.PI; } });
  const BOYC = [HALL.x - .55, HALL.z - 3.2];   // where the boy stands for the 39.12 comic panel
  const ASK = [DL[0] - .7, DL[1] - 1.12];   // in front of her, along her facing
  A.dana.show(27.54, 32.7); A.bacon.show(27.54, 32.7);
  A.dana.key(27.5, { pose: 'danaAnswer', at: DL, ry: DRY, y: 0 });
  A.bacon.key(27.5, { pose: 'relaxed', at: [ASK[0] - .3, ASK[1] - .9], ry: Math.atan2(DL[0] - ASK[0], DL[1] - ASK[1]) });
  A.bacon.run(27.55, [[ASK[0] - .3, ASK[1] - .9], ASK], { step: .62, T: .36, arm: .5 });
  A.bacon.key(28.3, { pose: 'wristTap', dur: .25 }).key(28.65, { pose: 'wristTapB', dur: .18, ease: 'io' }).key(28.95, { pose: 'wristTap', dur: .18, ease: 'io' }).key(29.3, { pose: 'relaxed', dur: .3 });   // taps, then drops the arm so MR. BACON on his tee reads
  A.dana.talk(30.42, 31.94);
  A.dana.face(27.5, 'bored').face(32.0, 'nervous'); A.bacon.face(27.5, 'happy').face(30.6, 'shocked');

  // --- 11: "Every time. She can't help it.": two LIGHTNING asks (different kids, same wrist-tap, same answer) ---
  A.dana.show(32.7, 34.58);
  A.dana.key(32.65, { pose: 'danaAnswer', at: DL, ry: DRY, y: 0, dur: .01 })
    .key(33.0, { pose: { ...P.danaAnswer, armR: fa('armR', [-0.25, 1.1, 0.5], [-0.42, 0.95, 0.15]) }, dur: .25, ease: 'io' })   // the little wrist-flick sass
    .key(33.68, { pose: 'danaAnswer', dur: .15 })
    .key(34.0, { pose: { ...P.danaAnswer, head: { r: [0.3, -0.3, -0.05] } }, dur: .3, ease: 'io' });   // eye-roll sigh on the second one
  A.kid5.show(32.7, 33.68); A.kid7.show(33.68, 34.58);
  A.kid5.key(32.65, { pose: 'wristTap', at: [DL[0] - .95, DL[1] - .85], ry: Math.atan2(.95, .85) * 0 + Math.atan2(DL[0] - (DL[0] - .95), DL[1] - (DL[1] - .85)) });
  A.kid7.key(33.6, { pose: 'wristTapB', at: [DL[0] - 1.05, DL[1] - .7], ry: Math.atan2(1.05, .7) });
  A.kid5.face(32.65, 'happy'); A.kid7.face(33.6, 'happy');
  // --- 12: THURSDAY NIGHT: the boy at his desk writing the list; insert of the paper ---
  const DESK = [8565.05, 3.05], deskY2 = 0, LISTP = [8565.0, 1.07, 3.62];   // his gaming chair (probed: chair 8565.05/2.97 facing +z, desk at z 4.02)
  A.boy.show(34.58, 36.92); A.boy.noClamp = false;
  A.boy.key(34.5, { pose: 'writeList', at: DESK, ry: 0, y: .16 })
    .key(35.3, { pose: { ...P.writeList, armR: fa('armR', [-0.22, 0.6, 0.5], [-0.42, 0.7, 0.2], sit.root) }, dur: .25, ease: 'io' })
    .key(35.9, { pose: 'writeList', dur: .25, ease: 'io' }).key(36.4, { pose: 'writeLook', dur: .3 });
  A.boy.face(34.5, 'determined').face(36.4, 'smug');

  // --- 13: FRIDAY: he walks up to Dana in the hallway and asks (wrist tap) ---
  A.boy.show(36.92, 39.12); A.dana.show(36.92, 39.12);
  A.dana.key(36.88, { pose: 'danaLocker', at: DL, ry: DRY, y: 0, dur: .01 });
  A.boy.run(36.92, [[HALL.x - .7, HALL.z - 3.6], [DL[0] - 1.35, DL[1] - .35]], { step: .72, T: .36, arm: .6 });
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
  A.trigPost1.show(40.84, 47.12); A.boy.show(47.12, 50.9); A.danaPost1.show(40.84, 47.12); A.dana.show(47.12, 50.9);
  A.trigPost1.key(40.8, { pose: 'midSwapBoy', at: [SWP[0] - .62, SWP[1]], ry: N / 2 - .25, y: 0, dur: .01 })
    .key(41.15, { pose: 'patChest', dur: .3, ease: 'io' })   // Dana (inside his body) pats the strange chest, horrified
    .key(41.55, { pose: { ...P.patChest, armL: fa('armL', [0.14, 1.45, 0.25], [0.42, 1.1, 0.08]), head: { r: [0.15, -0.05, 0] } }, dur: .25, ease: 'io' })   // hands to the face
    .key(41.95, { pose: t => P.pointYell(t), dur: .3 });   // then JABS at her: "YOU did this"
  A.danaPost1.key(40.8, { pose: 'midSwapDana', at: [DL[0], DL[1]], ry: -N / 2 - .3, y: 0, dur: .01 })
    .key(41.4, { pose: { ...P.patChest, head: { r: [0.5, 0.1, 0] } }, dur: .3, ease: 'io' })   // he (inside hers) looks DOWN at the new body
    .key(42.5, { pose: 'smugNew', dur: .4 });   // ... and likes it
  A.trigPost1.talk(40.84, 42.74);   // "No. What the fuck did you do?" = Dana's voice from HIS body
  A.trigPost1.face(40.8, 'angry').face(43.25, 'angry'); A.danaPost1.face(40.8, 'shocked').face(42.4, 'smug');
  fx.poof(40.84, [SWP[0] - .62, 1.3, SWP[1]], { size: 1.4, dur: 1.4, spiral: 1, n: 24 }); fx.poof(40.84, [DL[0], 1.3, DL[1]], { size: 1.4, dur: 1.4, spiral: 1, n: 24 });

  // --- 16: POV from Dana's body: left hand up, look; right hand joins; back to the yelling boy-body; pull OUT on "my new body" ---
  A.danaPost1.key(43.25, { pose: 'povIdle', ry: -2.15, turn: .3, dur: .2 })   // facing the yelling boy-body across the corridor
    .key(44.55, { pose: 'povHandL', dur: .4, ease: 'io' })
    .key(45.05, { pose: 'povHandLR', dur: .35, ease: 'io' })
    .key(45.55, { pose: { ...P.povHandLR, armR: fa('armR', [-0.16, 1.14, 0.56], [-0.38, 0.92, 0.27]) }, dur: .3, ease: 'io' })   // the right palm TURNS in front of the eyes
    .key(45.95, { pose: 'smugNew', dur: .35 });
  A.trigPost1.key(43.3, { pose: t => P.yellFlail(t * .7), at: [HALL.x - .9, SWP[1] - 1.5], dur: .4, glide: .4 }).key(45.9, { pose: { ...P.yellFlail(0), armL: { r: [-0.6, 0, 0.4] }, armR: { r: [-0.5, 0, -0.45] }, head: { r: [0.2, 0.2, 0.1] } }, dur: .4 });
  A.danaPost1.face(46.0, 'smug'); A.trigPost1.talk(43.3, 46.26);

  // --- 17: THE ENDING (rackfocus_crier_v1): her body talks to the lens; his body curled CRYING on the floor behind; rack focus; silence ---
  // Xavier 04:44: HIS selfie pose (screenshot), the selfie camera, then the air kiss; the crier sunk on the floor at his X:
  // behind her, screen-right, a few metres down the corridor. ERY turns the whole selfie set-up so that 'behind her' = down the corridor (-z).
  const ERY = 0, EP = [HALL.x - .65, SWP[1] + 1.2], loc = (x, z) => [EP[0] + x * Math.cos(ERY) + z * Math.sin(ERY), EP[1] - x * Math.sin(ERY) + z * Math.cos(ERY)];
  const CRY = loc(1.55, -3.4);   // out in the corridor (clear of the lockers), screen-right of her head (his arrow)   // his arrow (10:31): behind her, screen-right, out in the corridor   // his X: screen-right of her, a couple of metres back, fully in frame
  const kissLips = { ...P.myPose, armL: fa('armL', [-0.02, 1.47, 0.26], [0.3, 1.12, 0.32], P.myPose.root), head: { r: [-0.2, -0.4, -0.05] } };
  const kissOut = { ...P.myPose, armL: fa('armL', [0.22, 1.62, 0.78], [0.36, 1.3, 0.42], P.myPose.root), head: { r: [-0.3, -0.45, -0.1] } };
  const myPoseIdle = t => ({ ...P.myPose, root: { ...P.myPose.root, rz: P.myPose.root.rz + Math.sin(t * 1.8) * .013 }, head: { r: [-0.064 + Math.sin(t * 1.3) * .02, -0.264, -0.016] } });
  A.dana.key(47.12, { pose: 'smugNew', at: EP, ry: ERY, dur: .01 }).key(47.16, { pose: t => myPoseIdle(t), dur: .25 })   // HIS myPose for the whole line (Xavier 06:24), breathing
    .key(48.5, { pose: kissLips, dur: .22, ease: 'io' })
    .key(48.88, { pose: kissOut, dur: .18, style: 'snap' })   // mwah, out to the lens
    .key(49.35, { pose: t => myPoseIdle(t), dur: .4 });
  A.dana.talk(47.12, 48.42);
  A.boy.key(47.12, { pose: t => P.kneelCryAnim(t), at: CRY, ry: ERY - .5, dur: .01 })
    .key(49.0, { pose: 'lieCry', dur: .45, ease: 'io' })
    .key(49.5, { pose: t => P.lieCryAnim(t), dur: .2 });   // full toddler tantrum: banging the fist, kicking
  A.dana.face(47.12, 'smug').face(48.9, 'happy').face(49.4, 'smug');
  A.trigPost1.face(46.8, 'crying'); A.boy.face(47.0, 'crying');

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
    if (partyOn) cake.position.set(PCAKE[0], 1.12, PCAKE[1]);
    hats.forEach((hh, i) => { const a = A['kid' + i]; hh.visible = partyOn && a.a.root.visible; if (hh.visible) { const hd = headW(a); hh.position.copy(hd).add(new THREE.Vector3(0, .42, 0)); hh.rotation.y = t * .2 + i; } });
    // tape on Dana's mouth (shot 7 only)
    tape.visible = false;   // replaced by the thought-roulette (Xavier 06:24)
    if (tape.visible) { const hd = A.dana.a.rig.parts.head; hd.updateMatrixWorld(true); tape.position.copy(new THREE.Vector3(0, -.09, -.3).applyMatrix4(hd.matrixWorld)); /* head front = local -Z */ tape.quaternion.copy(hd.getWorldQuaternion(new THREE.Quaternion())); }
    // the list + marker on the desk (shot 12)
    const listOn = t >= 34.58 && t < 36.92; list.visible = marker.visible = listOn;
    if (listOn) { list.position.set(LISTP[0], LISTP[1], LISTP[2]); list.rotation.z = Math.PI - .12;
      const H = handW(A.boy, 'R'); marker.position.copy(H.p).add(new THREE.Vector3(0, .05, 0)); marker.quaternion.copy(H.q); }
    // pancakes + syrup pour (shot 8d)
    const panOn = t >= 24.3 && t < 25.82; pan.visible = panOn; syr.visible = jug.visible = false;   // the pour stream/jug read as a rod (sub-pixel-thin, SS depth junk)
    if (panOn) pan.position.set(KT[0] + .1, 1.03, KT[1] - .85);
    // comic rig
    comic.g.visible = false;
    // the comic actors ride their panels: y per frame

    // POV: hide HER head while the camera is inside it (restored on the pull-out), pure function of t
    A.danaPost1.a.rig.parts.head.visible = !(t >= 43.3 && t < 46.2);
    fx.update(t);
  };

  // "no chores / no little brothers": the scene FREEZES and drains to grayscale while a red X stamps over it (Xavier 06:24)
  const XW = [[22.85, 23.28], [23.85, 24.3]];
  const inX = t => XW.some(([a2, b2]) => t >= a2 && t < b2);
  const frz = t => { for (const [a2, b2] of XW) if (t >= a2 && t < b2) return a2; return t; };

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
    const EXPO = { bedroom: 1.02, hallway: 1.05, class: 1.12, stage: 1.14, houseB: 1.1, kitchen: 1.1, desk: 1.14 };
    post.gain = want ? [1.0, .96, .9] : [1.06, 1.02, .96];   // interiors: roll the whites (lookmeter high3)
    post.exposure = s.id.startsWith('bus') ? 1.2 : night ? 1.18 : want ? (EXPO[want] ?? 1.18) : 1.36;   // whites were blowing high3 .97 vs .76 (lookmeter 2026-11-28)
    post.saturation = inX(t) ? .07 : 1.34; post.contrast = 1.1;
  };

  // ---------- 2D STORY LAYER (film.html paint2d: drawn over the graded frame; sizes relative to W so 1080 matches) ----------
  const PV = new THREE.Vector3();
  const scr = (x, y, z) => { PV.set(x, y, z).project(cam); return [PV.x * .5 + .5, 1 - (PV.y * .5 + .5), PV.z < 1]; };
  const overHead = (a, up = .5) => { const h2 = headW(a); return scr(h2.x, h2.y + up, h2.z); };
  const ROUL = ['HI', 'YO', 'SUP', 'HEY', 'NAH', 'BRO'];
  const drawNote = (ctx, W, H, x, y, ph) => { const sN = W / 540; ctx.save(); ctx.translate(x * W, y * H + Math.sin(ph * 2.4) * 8 * sN); ctx.rotate(Math.sin(ph * 1.7) * .18);
    ctx.font = `${Math.round(58 * sN)}px Arial`; ctx.textAlign = 'center'; ctx.lineWidth = 7 * sN; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1c1f26'; ctx.strokeText('\u266a', 0, 0); ctx.fillStyle = '#ffffff'; ctx.fillText('\u266a', 0, 0); ctx.restore(); };
  const drawBubble = (ctx, W, H, x, y, txt, k) => { const sN = W / 540, e = k < .6 ? 1.15 * sm(k / .6) : 1.15 - .15 * sm((k - .6) / .4);   // pop in with overshoot
    ctx.save(); ctx.translate(x * W, y * H); ctx.scale(e, e);
    ctx.font = `900 ${Math.round(34 * sN)}px Montserrat, Arial Black, sans-serif`; const tw = ctx.measureText(txt).width, bw = tw + 36 * sN, bh = 56 * sN, r = 16 * sN;
    ctx.beginPath(); ctx.roundRect(-bw / 2, -bh, bw, bh, r); ctx.moveTo(-8 * sN, 0); ctx.lineTo(10 * sN, 0); ctx.lineTo(0, 16 * sN); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#14161c'; ctx.lineWidth = 5 * sN; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#14161c'; ctx.textAlign = 'center'; ctx.fillText(txt, 0, -bh / 2 + 12 * sN); ctx.restore(); };
  const drawThought = (ctx, W, H, x, y, t, k) => { const sN = W / 540, e = Math.min(1, k * 3); ctx.save(); ctx.translate(x * W, y * H); ctx.scale(e, e);
    const bw = 300 * sN, bh = 120 * sN;
    for (const [cx2, cy2, r2] of [[bw * .32, bh * .75, 14], [bw * .42, bh * .96, 9], [bw * .5, bh * 1.14, 5]]) { ctx.beginPath(); ctx.arc(-bw / 2 + cx2, -bh + cy2, r2 * sN, 0, 7); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#14161c'; ctx.lineWidth = 4 * sN; ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.roundRect(-bw / 2, -bh - 30 * sN, bw, bh, 34 * sN); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#14161c'; ctx.lineWidth = 5 * sN; ctx.fill(); ctx.stroke();
    // the slot machine: gold frame, three word reels blur-rolling, a red ? that bounces
    const fw = 196 * sN, fh = 62 * sN, fx0 = -bw / 2 + 22 * sN, fy0 = -bh - 1 * sN;
    ctx.beginPath(); ctx.roundRect(fx0, fy0, fw, fh, 10 * sN); ctx.fillStyle = '#f4c445'; ctx.fill(); ctx.strokeStyle = '#9a7515'; ctx.lineWidth = 4 * sN; ctx.stroke();
    for (let i = 0; i < 3; i++) { const rx = fx0 + 8 * sN + i * (fw - 16 * sN) / 3, rw = (fw - 16 * sN) / 3 - 6 * sN, ry0 = fy0 + 8 * sN, rh = fh - 16 * sN;
      ctx.save(); ctx.beginPath(); ctx.rect(rx, ry0, rw, rh); ctx.fillStyle = '#fdfcf7'; ctx.fill(); ctx.clip();
      const spd = 6 + i * 1.7, idx = Math.floor(t * spd + i * 2.3), off = (t * spd + i * 2.3) % 1;
      ctx.font = `900 ${Math.round(21 * sN)}px Arial Black, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#1c1f26';
      ctx.fillText(ROUL[idx % 6], rx + rw / 2, ry0 + rh * (0.72 - off)); ctx.fillText(ROUL[(idx + 1) % 6], rx + rw / 2, ry0 + rh * (1.72 - off));
      ctx.restore(); ctx.strokeStyle = '#9a7515'; ctx.lineWidth = 2.5 * sN; ctx.strokeRect(rx, ry0, rw, rh); }
    ctx.font = `900 ${Math.round(46 * sN)}px Arial Black, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = '#e2362c'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 6 * sN;
    const qb = Math.abs(Math.sin(t * 4.2)) * 10 * sN; ctx.strokeText('?', bw / 2 - 34 * sN, fy0 + 48 * sN - qb); ctx.fillText('?', bw / 2 - 34 * sN, fy0 + 48 * sN - qb);
    ctx.restore(); };
  const drawX = (ctx, W, H, k) => { const e = k < .22 ? lerp(2.1, .92, sm(k / .22)) : k < .34 ? lerp(.92, 1.05, sm((k - .22) / .12)) : 1;   // slams in with a bounce
    ctx.save(); ctx.translate(W / 2, H * .46); ctx.rotate(.06 * Math.sin(k * 20) * Math.max(0, 1 - k * 3)); ctx.scale(e, e);
    const L2 = W * .30, w2 = W * .085; ctx.lineCap = 'round'; ctx.lineWidth = w2 + W * .022; ctx.strokeStyle = '#ffffff';
    for (const sgn of [1, -1]) { ctx.beginPath(); ctx.moveTo(-L2, -L2 * sgn); ctx.lineTo(L2, L2 * sgn); ctx.stroke(); }
    ctx.lineWidth = w2; ctx.strokeStyle = '#e2362c';
    for (const sgn of [1, -1]) { ctx.beginPath(); ctx.moveTo(-L2, -L2 * sgn); ctx.lineTo(L2, L2 * sgn); ctx.stroke(); }
    ctx.restore(); };
  // CHOIR SWAP COUNTER (Xavier 10:31): every kid that swaps ticks the tally up, 1 -> 12, popping bigger and hotter each time
  const CNT = []; for (const t0 of [10.12, 10.40, 10.66, 10.90, 11.12, 11.34]) CNT.push(t0, t0 + .07);
  const drawCounter = (ctx, W, H, t) => { const n = CNT.filter(q => t >= q).length; if (!n) return; const last = CNT[n - 1], k = (t - last) / .22, sN = W / 540;
    const e = k < 1 ? 1 + .55 * Math.sin(Math.min(1, k) * Math.PI) * (1 - k * .3) : 1, base = 1 + n * .035, sc = base * e;
    const heat = (n - 1) / 11, col = heat < .5 ? `rgb(255,${Math.round(255 - 60 * heat * 2)},${Math.round(255 - 255 * heat * 2)})` : `rgb(255,${Math.round(195 - 150 * (heat - .5) * 2)},0)`;
    ctx.save(); ctx.translate(W * .5, H * .17); ctx.rotate((n % 2 ? -1 : 1) * .06 * Math.max(0, 1 - k)); ctx.scale(sc, sc);
    ctx.font = `900 ${Math.round(118 * sN)}px Montserrat, Arial Black, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 16 * sN; ctx.strokeStyle = '#14161c'; ctx.strokeText(String(n), 0, 0); ctx.fillStyle = col; ctx.fillText(String(n), 0, 0);
    ctx.font = `900 ${Math.round(30 * sN)}px Montserrat, Arial Black, sans-serif`; ctx.lineWidth = 8 * sN; ctx.strokeText('SWAPPED', 0, 70 * sN); ctx.fillStyle = '#ffffff'; ctx.fillText('SWAPPED', 0, 70 * sN);
    ctx.restore(); };
  const paint2d = t => {
    const items = [];
    if (t >= .15 && t < 1.02) { const q1 = overHead(A.swapA, .42), q2 = overHead(A.swapB, .5); if (q1[2]) items.push(c => drawNote(c.ctx, c.W, c.H, q1[0], q1[1], t * 2)); if (q2[2]) items.push(c => drawNote(c.ctx, c.W, c.H, q2[0], q2[1], t * 2 + 2.2)); }
    if (t >= 7.95 && t < 9.02) { const q1 = overHead(A.kid0, .72); if (q1[2]) items.push(c => drawNote(c.ctx, c.W, c.H, q1[0], q1[1], t * 2 + 1));
      if (t >= 8.55) { const q2 = overHead(A.kid1, .72); if (q2[2]) items.push(c => drawNote(c.ctx, c.W, c.H, q2[0], q2[1], t * 2 + 3.1)); } }
    if (t >= 19.25 && t < 20.92) { const q = overHead(A.dana, .62); if (q[2]) items.push(c => drawThought(c.ctx, c.W, c.H, cl(q[0], .3, .7), Math.max(.17, q[1]), t, cl((t - 19.25) / .3))); }
    if (t >= 25.95 && t < 27.3) { const q = overHead(A.kid8, .5); if (q[2]) items.push(c => drawNote(c.ctx, c.W, c.H, q[0], q[1], t * 2.2)); }
    const bubbleWins = [[28.5, 30.3, 'bacon', 'TIME?'], [38.35, 39.08, 'boy', 'TIME?'], [32.78, 33.56, 'kid5', 'TIME?'], [33.7, 34.5, 'kid7', 'TIME?']];
    for (const [a2, b2, who, txt] of bubbleWins) if (t >= a2 && t < b2 && A[who].a.root.visible) { const q = overHead(A[who], .55); if (q[2]) items.push(c => drawBubble(c.ctx, c.W, c.H, cl(q[0], .18, .82), Math.max(.14, q[1]), txt, (t - a2) / (b2 - a2))); }
    for (const [a2, b2] of XW) if (t >= a2 && t < b2) items.push(c => drawX(c.ctx, c.W, c.H, (t - a2) / (b2 - a2)));
    if (t >= 10.1 && t < 11.96) items.push(c => drawCounter(c.ctx, c.W, c.H, t));
    if (!items.length) return null;
    return (ctx, W, H) => { const c = { ctx, W, H }; for (const f of items) f(c); };
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
    // bus (Xavier 10:31): camera at the front bulkhead looking back down the bus: both kids whole in frame, the full bus behind them
    busPoof: u => { const zk = (-bus.userData.L / 2 + 1.6 + 4 * 1.55 + .08), m = midHead(A.swapA2.a.root.visible ? A.swapA2 : A.swapA, A.swapB2.a.root.visible ? A.swapB2 : A.swapB), k = sm(u), p = busLocal(lerp(-1.1, -1.3, k), lerp(2.62, 2.5, k), zk + lerp(3.05, 2.55, k)); return { p: p.toArray(), l: [m.x, m.y - .32, m.z], fov: 50 }; },   // high from the bulkhead: both kids chest-up, every row of the bus above their heads
    busA: u => { const zk = (-bus.userData.L / 2 + 1.6 + 4 * 1.55 + .08), hd = headW(A.swapA2), p = busLocal(lerp(-.35, -.62, u), 2.12, zk + 2.25); return { p: p.toArray(), l: [hd.x, hd.y - .26, hd.z], fov: 42 }; },   // close: the boy with HER hair, staring at his hands
    busB: u => { const zk = (-bus.userData.L / 2 + 1.6 + 4 * 1.55 + .08), hd = headW(A.swapB2), e = sm(u), p = busLocal(lerp(-1.85, -1.55, e), lerp(1.95, 2.25, e), zk + lerp(1.75, 2.75, e)); return { p: p.toArray(), l: [hd.x + lerp(0, .35, e), hd.y - .35, hd.z - lerp(0, .6, e)], fov: 46 }; },   // the girl with HIS hair; pulls out to reveal the whole bus staring
    // 2: crane down from over the bed: grandma leaning in, the kid rigid
    bedroom: u => { const k = sm(u); return { p: [8554.75 + .3 * k, 2.0 - .12 * k, 1.5], l: [8557.3, 1.68, 2.45], fov: 43 }; },   // two-shot from the foot corner: his face frontal left, grandma seated on the edge leaning down onto his forehead right
    // 3: truck across the party: cake front-left, the solo singer mid, the rest awkward
    party: u => { const k = sm(u); return { p: [PCAKE[0] + lerp(-.25, .2, k), 1.62, PCAKE[1] + 1.95], l: [clsW(0, -4.3)[0], 1.3, clsW(0, -4.3)[1]], fov: 46 }; },   // over the CAKE (foreground, candles lit) onto the singers; the join + the trade both read
    // 4: low truck along the risers as the poofs chain L -> R, ending on the principal's facepalm
    choir: u => { const k = sm(u), x = lerp(AUD[0] - 1.7, AUD[0] + 2.3, k), e = cl((u - .78) / .22); return { p: [x, audU.riser1.y + 1.35, AUD[2] + 5.0], l: [lerp(x + .4, AUD[0] + 3.3, e), audU.riser1.y + 1.05, AUD[2] - lerp(1.2, -1.6, e)], fov: 38 }; },   // tight truck along the risers with the pair-trades; drifts onto the principal for the facepalm
    // 5: slow push over the teacher's shoulder: both twins in frame, the two poofs, the marker drop, the sit
    twins: u => { const hA = headW(A.twinA), dx = TA[0] - TT[0], dz = TA[1] - TT[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, e = cl((u - .62) / .33); const lp = [lerp(hA.x, clsW(-.2, 0)[0], e), lerp(hA.y - .08, 1.25, e), lerp(hA.z, clsW(0, -4.6)[1], e)]; return { p: [TT[0] - ux * lerp(1.2, 2.7, e) - uz * lerp(.8, 1.3, e), lerp(2.0, 1.9, e), TT[1] - uz * lerp(1.2, 2.7, e) + ux * lerp(.8, 1.3, e)], l: lp, fov: lerp(38, 47, e) }; },   // OTS past the teacher onto twin A's face; widens out for the laugh + facepalm + slump (all three in frame)
    // 6: slow orbit round Dana at the locker (kids pass behind)
    danaLocker: u => { const k = sm(u); return front(A.dana, { d: lerp(2.5, 2.0, k), side: lerp(-.45, -.15, k), h: .02, lh: -.32, fov: 40 }); },
    // 7: high punch-in on silent Dana in the shouting class
    taped: u => { const dd = clsW(DS.x, DS.z), k = sm(u); return { p: [dd[0] - .1, lerp(1.5, 1.46, k), dd[1] - lerp(2.6, 2.15, k)], l: [dd[0] + .02, 1.38, dd[1] + .1], fov: 42 }; },   // level, her centered under the roulette bubble
    // 8: her life, three pushes + the syrup insert
    danaTable: u => front(A.dana, { d: lerp(2.0, 1.6, u), side: .3, h: .12, lh: -.2, fov: 38 }),
    dishes: u => { const dp = A.dana_dad.a.root.position; return { p: [dp.x + lerp(.45, .2, u), 1.72, dp.z - 1.4], l: [dp.x, 1.12, dp.z - .1], fov: 62 }; },   // from the window over the sink: dad's happy face, his hands + the plates in the foreground (old camera sat OUTSIDE the wall = the blank 'blue screen', Xavier 10:31)
    quietHall: u => { const mA = A.miniA.a.root.position, mB = A.miniB.a.root.position, fx = (mA.x + mB.x) / 2, fz = (mA.z + mB.z) / 2, cc = roomW(HB, 'dining', 5.0, 1.3); return { p: [cc[0] - lerp(0, .2, u), 1.2, cc[1] - lerp(.1, .25, u)], l: [fx, .55, fz], fov: 48 }; },   // low across the open dining floor onto the two minis scrapping; freezes under the X
    pancakes: u => { const P0 = pan.position, a = lerp(-.55, .02, u), k = sm(cl((u - .58) / .3)); const F = front(A.dana, { d: 1.0, side: -.12, h: .0, lh: -.05, fov: 38 }); const p0 = [P0.x + Math.sin(a) * .62, P0.y + .34, P0.z - Math.cos(a) * .62], l0 = [P0.x, P0.y + .13, P0.z]; return { p: [lerp(p0[0], F.p[0], k), lerp(p0[1], F.p[1], k), lerp(p0[2], F.p[2], k)], l: [lerp(l0[0], F.l[0], k), lerp(l0[1], F.l[1], k), lerp(l0[2], F.l[2], k)], fov: lerp(30, 38, k) }; },   // the hero stack, rising over it to her happy face
    // 9: tight push on her face, eyes slide
    danaTense: u => front(A.dana, { d: lerp(1.3, 1.05, u), side: .25, h: .0, lh: -.05, fov: 30 }),
    // 10 + 14: the comic rig's own camera
    askTime: u => { const k = sm(u); return front(A.bacon, { d: lerp(1.6, 1.4, k), side: lerp(-.7, -.6, k), h: .1, lh: -.5, fov: 56 }); },   // over Dana's shoulder onto MR. BACON tapping his wrist (his tee reads)   // her + the classmate tapping his wrist, from her front-left
    danaReply: u => front(A.dana, { d: lerp(1.25, 1.05, u), side: -.18, h: -.12, lh: -.02, fov: 34 }),   // on her answer, slightly low, push
    comic2: u => comic.cam(u),
    // 11: pull back from her shrug
    ask2: u => { const k = sm(u); return front(A.dana, { d: lerp(1.8, 1.55, k), side: lerp(-.55, -.45, k), h: .08, lh: -.25, fov: 40 }); },   // past the asker onto Dana answering on autopilot
    ask3: u => { const k = sm(u), hD = headW(A.dana); return { p: [hD.x + lerp(1.5, 1.15, k) * Math.sin(DRY - .6), hD.y - .15, hD.z + lerp(1.5, 1.15, k) * Math.cos(DRY - .6)], l: [hD.x, hD.y - .05, hD.z], fov: 36 }; },   // low punch onto her eye-roll, the asker's shoulder in frame
    // 12: over his shoulder down onto the list, push
    deskList: u => { const k = sm(u); return { p: [8565.05 + lerp(.35, .2, k), lerp(1.7, 1.6, k), 4.22], l: [8565.02, lerp(1.2, 1.38, k), lerp(3.5, 3.0, k)], fov: lerp(52, 44, k) }; },   // across the desk: the list in the foreground, him hunched over it writing, then up to his face (smug)
    // 13: track with him up the hallway to Dana
    hallAsk: u => { const b = pos('boy'); return { p: [HALL.x - 1.0, 1.5, b.z + 2.5], l: [b.x + .35, 1.32, b.z], fov: 42 }; },   // leads him up the corridor; Dana enters frame right at her locker
    // 15: low orbit round the yelling boy-body, the cloud behind
    midSwap: u => { const a = sm(u); return front(A.trigPost1, { d: lerp(1.4, 1.7, a), side: lerp(1.2, .9, a), h: -.3, lh: -.1, fov: 42 }); },   // from down the corridor: his face, Dana's body edge of frame
    // 16: TRUE POV: camera at her eyes, head bob, hands come up into frame
    povHands: u => { const t = 43.3 + u * 2.7, hd = headW(A.danaPost1), R = A.danaPost1.a.root, ry0 = R.rotation.y, dir = new THREE.Vector3(Math.sin(ry0), 0, Math.cos(ry0));
      const bob = Math.sin(t * 1.9) * .013 + Math.sin(t * 3.3) * .005, yaw = Math.sin(t * .8) * .05 + Math.sin(t * 2.2) * .02;
      const dn = sm(cl((t - 43.85) / .35)) * (1 - sm(cl((t - 44.5) / .3)));   // phase 2: tilt DOWN at the new body (torso + legs from above)
      const hands = sm(cl((t - 44.6) / .3)) * (1 - sm(cl((t - 45.6) / .3)));  // phase 3: eyes on the raised hands
      let up = Math.max(0, 1 - dn - hands); const wT = up + dn + hands;       // otherwise: on the yeller (weights normalized)
      const lBoy = headW(A.trigPost1), lBody = [hd.x + dir.x * 1.3, hd.y - 1.6, hd.z + dir.z * 1.3], lHand = [hd.x + dir.x * 1.0, hd.y - .5, hd.z + dir.z * 1.0];
      const lx = (lBoy.x * up + lBody[0] * dn + lHand[0] * hands) / wT, ly = ((lBoy.y - .15) * up + lBody[1] * dn + lHand[1] * hands) / wT, lz = (lBoy.z * up + lBody[2] * dn + lHand[2] * hands) / wT;
      return { p: [hd.x + dir.x * .1 + yaw * dir.z, hd.y + .02 + bob, hd.z + dir.z * .1 - yaw * dir.x], l: [lx, ly + bob, lz], fov: 62 }; },
    // 16b: fast pull OUT of the POV to a 3/4 medium on her smug body
    pullOut: u => { const k = sm(u); return front(A.danaPost1, { d: lerp(.3, 2.1, k), side: lerp(0, .3, k), h: lerp(.02, .05, k), lh: lerp(-.05, -.3, k), fov: lerp(58, 40, k) }); },   // fast OUT of her eyes, back along her look, to a 3/4 medium on her smug new body
    // 17: the rack-focus ending: medium-close on her, the crier visible over her shoulder; camera drifts in the silence
    ending: u => { const t = 47.12 + u * 3.78, P0 = A.dana.a.root.position, L = (x, y, z) => { const q = loc(x, z); return [q[0] + (P0.x - EP[0]), y, q[1] + (P0.z - EP[1])]; }, w2 = Math.sin(t * 1.3) * .012, b = Math.sin(t * 1.9) * .008, k = sm(u) * .12; const EC = opts.endc || [-.03, 2.25, 1.62, .02, 1.55, -.3, 74], f = sm(cl((t - 49.3) / .7)), P1 = L(EC[0] + w2 + .45 * f, EC[1] + b - k * .2 - .15 * f, EC[2] - k), L1 = L(EC[3], EC[4] + b, EC[5]), CT = [CRY[0], .55, CRY[1]]; return { p: P1, l: [lerp(L1[0], CT[0], .62 * f), lerp(L1[1], CT[1], .62 * f), lerp(L1[2], CT[2], .62 * f)], fov: EC[6] - 8 * f }; },   // after the kiss she swings the phone round so the lens FINDS him (Xavier 04:50)   // HIS screenshot (10:31) solved: lens just inside the raised phone arm (it runs down screen-left), looking back down at her; the crier screen-right. (was: the lens = her phone, just past the raised right hand (it fills screen-left), looking back down at her face; the corridor + the crier behind her, screen-right
  };
  const shakeAt = t => { for (const [a, b, k] of [[0.0, .35, .02], [11.34, 11.6, .02], [40.3, 40.6, .035], [40.84, 41.2, .03]]) if (t >= a && t < b) return k * (1 - (t - a) / (b - a)); return 0; };

  // rack focus (shot 17): focus on Dana's face for the line, then over ~.6 s onto the crier; aperture stays on
  let update = t => {
    const s = SH.slice().reverse().find(q => t >= q.t) || SH[0], u = cl((t - s.t) / s.dur);
    const tw = frz(t);   // inside an X window the WORLD freezes (the camera + the 2D layer keep moving)
    S.update(tw); props(tw); light(t, s);
    post.volume = (RIGBY[s.id] === 'houseB') ? 0 : VOL0;   // the houseB window shaft washes the dining/hall shots milky
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
    cam.updateProjectionMatrix(); LOOK.sky.position.copy(cam.position); globalThis.DBGF = post.focus;
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
  const AP0 = post.aperture, VOL0 = post.volume;
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
  // opts.only = 'actorKey': hide every other actor (close-up checks of a costume / print, Xavier 05:12 'make sure it looks proper')
  if (opts.only) { const u0 = update; update = t => { u0(t); for (const [k, a] of Object.entries(A)) if (k !== opts.only) a.a.root.visible = false; }; }
  update(opts.t ?? 0);
  return { camera: cam, sun: LOOK.sun, post, update, split, paint2d, dbg: { A, comic, CAM, cam, bus, C, HAq: HA, HBq: HB, town: A.boy.a.root } };
}
