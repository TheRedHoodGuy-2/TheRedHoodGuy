// 05 SUNSET TAG ("In This Town, Tag Swaps You 🌅"). Voice: topics/sunset_tag/voice/voice.wav (Xavier's Fish Audio take).
// One set (the suburb in its neighbourhood + far hills), four times of day: sunset rule demo, bright day gags + backstory
// (Xavier 16:24: not everything warm; bright sunny is the default), a clean sunset for the Friday game, dusk for the twist.
// Every shot is a picture of its sentence (topics/sunset_tag/RULES_CHECK.md). Poses follow docs/POSE_LESSONS.md.
import * as THREE from 'three';
import { stage } from '../engine/act.js';
import { addSkates } from '../engine/props/skates.js';
import { dayLook, paintSky } from '../engine/look.js';
import { planShots, validate } from '../engine/shots.js';
import { cameraRig } from '../engine/camera.js';
import { limbTo } from '../engine/r6pose.js';
import { flapTrack } from '../engine/lipsync.js';

const J = async p => (await fetch(new URL(p, document.baseURI))).json();
export const DUR = 61.7;
const ground = (x, z) => { const a = Math.abs(z); return a < 3.6 ? .012 : a < 3.88 ? .16 : a < 5.78 ? .14 : 0; };
const lerp = (a, b, k) => a + (b - a) * k, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = u => { u = cl(u); return u * u * (3 - 2 * u); };
// world point -> an actor's avatar frame (feet origin, +z forward) at stage position (x, z, ry)
const local = (w, x, z, ry, gy = 0) => { const dx = w[0] - x, dz = w[2] - z, c = Math.cos(ry), s = Math.sin(ry); return [dx * c - dz * s, w[1] - gy, dx * s + dz * c]; };

// ---------- poses (avatar frame). Thought behind each is written next to it ----------
const P = {
  stand: { armL: [.1, -1, .03], armR: [-.1, -1, -.02], legL: [.05, -1, .02], legR: [-.05, -1, -.02], head: [.05, .02, .03], root: { rz: .02 } },
  relaxed: { armL: [.14, -1, .06], armR: [-.08, -1, -.05], legL: [.09, -1, .05], legR: [-.04, -1, -.03], head: [.12, .03, .06], root: { rz: .03, x: .02 } },   // weight on one leg
  sad: { armL: [.05, -1, .14], armR: [-.06, -1, .12], legL: [.04, -1, .02], legR: [-.07, -1, .03], head: [.06, .42, .08], root: { rx: .1 } },                      // "but I had a problem": slumps, head drops
  determined: { armL: [.22, -.95, .08], armR: [-.24, -.95, .1], legL: [.2, -1, .02], legR: [-.18, -1, -.04], head: [0, -.04, 0], root: { rx: .06 } },            // squares up
  hips: { armL: [.66, -.72, -.14], armR: [-.62, -.76, -.12], legL: [.12, -1, .04], legR: [-.04, -1, -.02], head: [-.14, -.03, .12], root: { rz: .045, x: .03 } },   // Aunt Linda: unimpressed
  lookSun: { armL: [.12, -1, .05], armR: [-.14, -1, .02], legL: [.06, -1, .02], legR: [-.06, -1, -.02], head: [0, -.42, .04], root: { rx: -.07 } },               // commuter clocks the low sun
  panic: { armL: [.35, -.85, .35], armR: [-.4, -.82, .3], legL: [.1, -1, .25], legR: [-.06, -1, -.2], head: [.25, -.1, .1], root: { rx: .12, ry: .35 } },       // ...and panics, turning to run
  stumble: { armL: [.55, -.55, .55], armR: [-.6, -.5, .55], legL: [.06, -.9, .4], legR: [-.04, -.95, -.35], head: [0, -.2, 0], root: { rx: .28 } },
  fallMid: { armL: [.12, -.2, .97], armR: [-.14, -.18, .97], legL: [.05, -.95, -.25], legR: [-.05, -.9, -.4], head: [0, -.25, 0], root: { rx: .8, y: .02 } },
  prone: { armL: { r: [-2.8, 0, -.1], o: [0, .1, 0] }, armR: { r: [-2.75, 0, .12], o: [0, .1, 0] }, legL: [.06, -1, -.04], legR: [-.06, -1, .02], head: [.25, -.35, 0], root: { rx: 1.53, y: .19 } },
  skid: { armL: [.3, -.35, .88], armR: [-.32, -.3, .9], legL: [.05, -.85, .5], legR: [-.06, -.95, -.3], head: [0, -.15, 0], root: { rx: -.22 } },                 // Jayden brakes hard
  yell: { armL: [.55, -.65, -.35], armR: [-.5, -.7, -.32], legL: [.14, -1, .12], legR: [-.06, -1, -.12], head: [0, -.22, 0], root: { rx: .16 } },                 // "Bro!" leaning in
  point: { armR: [-.18, .08, 1], armL: [.45, -.6, -.5], legL: [.16, -1, .1], legR: [-.06, -1, -.1], head: [-.1, .06, .2], root: { rz: -.06, rx: -.05 } },        // laughing at Kayla
  wave: { armR: { r: [3.05, .42, 0], o: [-.057, .252, -.013] }, armL: [.25, -.95, .15], legL: [.18, -1, 0], legR: [-.05, -1, .05], head: [-.12, -.05, -.16], root: { rz: .14, x: .05 } },
  sitGround: { legL: { r: [-1.5708, 0, .08] }, legR: { r: [-1.5708, 0, -.12] }, armL: [.35, -.85, -.45], armR: [-.4, -.82, -.45], head: [.1, .05, .05], root: { y: -.51, rx: -.12 } },
};
// forearm ("shoulder becomes the elbow") and reach poses built from where the hands go
const fa = (part, hand, elbow, root = {}) => limbTo(part, root, hand, elbow);
P.crossArms = { ...P.relaxed, armL: fa('armL', [-.2, 1.0, .24], [.43, 1.0, .06]), armR: fa('armR', [.2, .95, .26], [-.43, .97, .05]), head: [-.1, -.08, .1], root: { rx: -.04, rz: .03 } };
P.pocket = { ...P.relaxed, armL: fa('armL', [.07, .9, .24], [.42, 1.02, .03], { rx: -.07 }), armR: fa('armR', [-.07, .9, .24], [-.42, 1.02, .03], { rx: -.07 }), head: [-.18, -.14, .12], root: { rx: -.07, rz: .04 } };
P.lookHands = { ...P.stand, armL: fa('armL', [.14, .93, .42], [.42, .92, .08]), armR: fa('armR', [-.16, .91, .43], [-.42, .92, .08]), head: [.05, .5, .04], root: { rx: .08 } };   // palms up at waist height: the face stays clear
P.touchHair = { ...P.stand, armR: fa('armR', [-.44, 1.62, .06], [-.56, 1.22, .12]), armL: fa('armL', [.14, 1.1, .42], [.42, .95, .1]), head: [.32, .12, .16], root: { rz: -.04 } };
P.whatGesture = { ...P.yell, armR: limbTo('armR', { rx: .12 }, [-.62, .92, .55]), armL: fa('armL', [.3, 1.64, .12], [.56, 1.22, .12], { rx: .12 }), root: { rx: .12, rz: .05 } };
P.tagArm = { armR: limbTo('armR', {}, [-.12, 1.15, .72]), head: [0, -.05, 0] };
// throat slash "cut it" (research/gestures.md): flat hand swept across the throat twice, eyes in the lens
const SL0 = 17.5;
P.slash = t => { const u = t - SL0, sweep = u < .2 ? 0 : u < .55 ? sm((u - .2) / .35) : u < .72 ? 1 - sm((u - .55) / .17) : u < 1.07 ? sm((u - .72) / .35) : 1;
  // forearm across the front of the neck, flat and level, just under the mouth (block centre 1.22 m), swept sideways twice
  const lift = sm(u / .22), ex = lerp(-.16, -.6, sweep), el = [lerp(-.42, ex, lift), lerp(.98, 1.11, lift), lerp(.12, .32, lift)], hand = [el[0] + lerp(.05, .62, lift), lerp(.6, 1.13, lift), el[2] + .05];
  return { ...P.stand, armR: fa('armR', hand, el), head: [-.06, -.12, .12], root: { rz: -.03, rx: -.03 } }; };
// the last shot: he lifts his head into the lens, the smile spreads, his shoulders start to shake (silent laugh)
P.sinister = t => { const u = t - 58.7, up = sm(u / 1.1), sh = t > 60.2 ? Math.sin((t - 60.2) * 44) * .012 * sm((t - 60.2) / .4) : 0;
  return { ...P.sitGround, head: [.02, lerp(.35, -.06, up), .04 + sh * 2], root: { y: -.51 + sh, rx: -.12 + up * .08 } }; };
// skating stroke for the mailman: legs push out to the side and back in turn, arms swing, lean in (wheels may glide)
P.skate = t => { const ph = Math.sin(t * Math.PI * 1.6), L = Math.max(0, ph), R = Math.max(0, -ph);
  return { legL: [.05 + L * .35, -1, -L * .3], legR: [-.05 - R * .35, -1, -R * .3], armL: [.2, -.9, -ph * .45], armR: { r: [-1.2, 0, -.3], o: [0, 0, 0] }, head: [0, -.05, 0], root: { rx: .16, rz: ph * .05 } }; };

export async function build({ scene, W: w, H: h, opts = {} }) {
  const { buildSuburb } = await import('../engine/sets/suburb.js'); await buildSuburb(scene);
  const F = await J('topics/sunset_tag/voice/flap.json'), flap = flapTrack(F, 0);
  const S = stage(scene, { POSES: P, ground, flap });
  // ---------- light: one look, the sun moves with the story ----------
  const LOOK = dayLook(scene, { sunAz: 200, sunEl: 50, sun: 3.4, fill: .85, disc: true, keyK: 4, rimK: 30 }), post = LOOK.post; post.maxBlur = 9 * w / 1080 * 2;
  // horizon height toward the park end (+x): the sunset sun is placed relative to the real hill line
  const rc = new THREE.Raycaster(), hillEl = (() => { scene.updateMatrixWorld(true); let best = 0; for (let e = 0; e < 18; e += .25) { const d = new THREE.Vector3(Math.cos(e * Math.PI / 180), Math.sin(e * Math.PI / 180), 0); rc.set(new THREE.Vector3(48, 1.6, -4), d); rc.far = 400; if (rc.intersectObjects(scene.children, true).some(h => h.object !== LOOK.sky && h.object !== LOOK.sunDisc && !h.object.isSprite)) best = e; } return best; })();
  const TIMES = {   // sun az / el, colour, strength, sky fill, sky dome, exposure
    day:    { az: 200, el: 52, col: '#fffaf0', int: 3.5, fill: .9, hs: '#a9cbf2', hg: '#5f6e40', top: '#2f74d6', hor: '#cfe6fb', glow: null, exp: 1.12 },
    sunset: { az: 92, el: null, col: '#ffe8c8', int: 3.0, fill: .95, hs: '#a7c3ea', hg: '#5f6a48', top: '#4f7fcc', hor: '#f3e2cf', glow: '#ffd2a0', exp: 1.15 },
    dusk:   { az: 92, el: -5, col: '#ff9a70', int: .35, fill: .95, hs: '#6c84c8', hg: '#2c3042', top: '#1d2b57', hor: '#d48a7a', glow: '#e7907a', exp: 1.32 },
  };
  const sunOff = t => t < 19.4 ? 9 : t < 38.1 ? lerp(4.6, 1.7, (t - 35.5) / 2.6) : t < 48.3 ? lerp(1.7, 0, (t - 38.1) / 10.2) : lerp(0, -2.2, (t - 48.3) / 4.4);   // degrees above the hill line
  let skyKey = '';
  const light = t => {
    const seg = t < 8.2 ? 'sunset' : t < 13.0 ? 'day' : t < 14.6 ? 'sunset' : t < 35.5 ? 'day' : t < 52.2 ? 'sunset' : 'dusk';
    let L = TIMES[seg]; if (seg === 'dusk' && t < 53.4) { const k = sm((t - 52.2) / 1.2), A = TIMES.sunset, B = TIMES.dusk; L = {}; for (const n of Object.keys(B)) L[n] = typeof B[n] === 'number' ? lerp(A[n] ?? B[n], B[n], k) : (k < .5 ? A[n] : B[n]); L.el = lerp(hillEl + sunOff(t), -5, k); L.mix = k; }
    const el = L.el ?? (seg === 'sunset' ? hillEl + sunOff(t) : 50);
    LOOK.setSun(L.az, el, { color: L.col, intensity: L.int, fill: L.fill }); LOOK.hemi.color.set(L.hs); LOOK.hemi.groundColor.set(L.hg); post.exposure = L.exp;
    const sk = seg + (L.mix != null ? Math.round(L.mix * 10) : ''); if (sk !== skyKey) { skyKey = sk; const a = L.az * Math.PI / 180; paintSky(LOOK.sky, L.top, L.hor, L.glow, new THREE.Vector3(Math.sin(a), .05, Math.cos(a)).normalize()); }
    scene.fog.color.set(L.hor); if (LOOK.sunDisc) LOOK.sunDisc.material.color.set(seg === 'day' ? '#fffbe8' : '#ffd9a0').multiplyScalar(seg === 'day' ? 2.5 : 2);
  };
  // ---------- cast ----------
  const A = {}, mk = async (n, key, o) => (A[n] = await S.actor(key, o));
  await mk('boy', 'boy'); await mk('kayla', 'kayla', { emo: 'annoyed' });
  await mk('jay', 'jayden', { emo: 'smug' }); await mk('jayG', 'jayden_girl', { emo: 'shocked' });
  await mk('kidA', 'swapA'); await mk('kidAf', 'swapA_f', { emo: 'shocked' }); await mk('kidB', 'swapB'); await mk('kidBm', 'swapB_m', { emo: 'shocked' });
  await mk('tagA', 'f027', { emo: 'laugh' }); await mk('tagB', 'm026', { emo: 'happy' });
  await mk('c1', 'm048', { emo: 'scared' }); await mk('c2', 'm061', { emo: 'scared' }); await mk('c3', 'm087', { emo: 'scared' });
  await mk('mail', 'mailman', { emo: 'happy' }); A.mail.lift = addSkates(A.mail.a, { shell: '#1d2430', accent: '#2f6fd6' });
  await mk('uncle', 'uncle', { emo: 'neutral' }); await mk('aunt', 'aunt_linda', { emo: 'annoyed' }); await mk('tagU', 'f053', { emo: 'laugh' });
  await mk('k1', 'm002', { emo: 'happy' }); await mk('k2', 'f040', { emo: 'happy' }); await mk('k3', 'm013', { emo: 'excited' });
  // envelope in the mailman's hand (a real letter: flat white paper, a stamp corner)
  { const env = new THREE.Group(), cv = document.createElement('canvas'); cv.width = 256; cv.height = 160; const g = cv.getContext('2d'); g.fillStyle = '#f6f3ea'; g.fillRect(0, 0, 256, 160); g.fillStyle = '#c0392b'; g.fillRect(200, 14, 40, 46); g.fillStyle = '#8a8a8a'; for (let i = 0; i < 3; i++) g.fillRect(70, 80 + i * 18, 110, 6);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.BoxGeometry(.26, .16, .006), new THREE.MeshStandardMaterial({ map: tex, roughness: .8 })); m.castShadow = true; env.add(m);
    const STUD = .34; env.scale.setScalar(1 / STUD); env.position.set(0, -1.05, -.12 / STUD); env.rotation.set(Math.PI / 2, 0, 0); A.mail.a.rig.parts.armR.add(env); }

  // ======================= 0-8.2 s  THE RULE (sunset, street x 22-34, sun at +x) =======================
  A.kidA.show(-1, 2.45).run(-.6, [[21.2, .6], [30.2, .6]], { step: .95, T: .3, arm: 1.15, style: { lean: .14, twist: .05 } }); A.kidA.face(-1, 'excited');
  A.tagA.show(-1, 4.9).run(-.6, [[19.5, .35], [28.9, .45]], { step: 1.0, T: .3, arm: 1.15, style: { lean: .16 } });
  A.tagA.key(2.15, { pose: 'tagArm', upper: true, hold: .45 }); A.tagA.key(2.65, { pose: 'point', ry: Math.PI / 2 }).face(2.6, 'laugh');
  A.kidAf.show(2.45, 4.9).key(2.45, { pose: 'stumble', at: [30.2, .6], ry: Math.PI / 2 }).key(2.75, { pose: 'stand', turn: .5, ry: .5 }).key(3.2, { pose: 'lookHands', dur: .35 }).face(2.45, 'shocked').face(3.3, 'scared');
  S.swap(A.kidA, A.kidAf, 2.45);
  A.kidB.show(4.4, 5.62).key(4.4, { pose: 'relaxed', at: [26.5, -1.4], ry: -.3 }).face(4.4, 'happy');
  A.tagB.show(4.4, 8.3).run(4.35, [[24.8, -3.0], [26.0, -1.95]], { step: .9, T: .3, arm: 1.1, style: { lean: .14 } }); A.tagB.key(5.3, { pose: 'tagArm', upper: true, hold: .35 }); A.tagB.key(5.62, { pose: 'point', ry: .7 });
  A.kidBm.show(5.62, 8.3).key(5.62, { pose: 'stumble', at: [26.5, -1.4], ry: -.3 }).key(5.9, { pose: 'touchHair', dur: .35 }).face(5.62, 'shocked');
  S.swap(A.kidB, A.kidBm, 5.62);
  // ======================= 8.2-13 s  5:59, COMMUTERS + MAILMAN (bright late afternoon) =======================
  A.c1.show(8.2, 11.4).key(8.2, { pose: 'stand', at: [6, -4.85], ry: Math.PI / 2 }).key(8.55, { pose: 'lookSun' }).key(9.25, { pose: 'panic', dur: .25 }).face(8.2, 'neutral').face(9.2, 'scared');
  // three men sprint home in a staggered line: the leader nearest the lens, the others behind and to the sides (nobody blocks him)
  A.c1.run(9.71, [[10.4, -4.25], [2.6, -4.25]], { step: 1.0, T: .3, arm: 1.2, style: { lean: .18 } });
  A.c2.show(9.6, 11.4).run(9.6, [[8.0, -5.1], [-0.6, -5.1]], { step: .95, T: .29, arm: 1.2, style: { lean: .18 } });
  A.c3.show(9.6, 11.4).run(9.55, [[12.2, -5.45], [4.4, -5.45]], { step: 1.0, T: .31, arm: 1.2, style: { lean: .17 } });
  A.mail.show(11.3, 13.0).face(11.3, 'happy');
  A.mail.key(11.3, { pose: t => P.skate(t), at: [-3, 4.85], ry: Math.PI / 2 }).key(11.31, { pose: t => P.skate(t), at: [4.6, 4.85], glide: 1.7, ease: 'io' });
  // ======================= 13-19.4 s  UNCLE -> AUNT LINDA (sunset flash, then day) + THE GESTURE =======================
  A.uncle.show(13.0, 14.25).key(13.0, { pose: 'relaxed', at: [-14, -8.4], ry: .2 }).face(13, 'happy');
  A.tagU.show(13.0, 14.6).run(13.0, [[-15.6, -10.6], [-14.4, -9.15]], { step: .8, T: .3, arm: 1.1, style: { lean: .12 } }); A.tagU.key(13.95, { pose: 'tagArm', upper: true, hold: .4 });
  A.tagU.key(14.3, { pose: 'point', ry: .5 }).face(14.2, 'laugh');
  A.aunt.show(14.25, 17.2).key(14.25, { pose: 'stumble', at: [-14, -8.4], ry: .2 }).key(14.6, { pose: 'stand' }).key(15.3, { pose: 'hips', dur: .4 }).face(14.25, 'shocked').face(15.2, 'annoyed');
  S.swap(A.uncle, A.aunt, 14.25);
  A.boy.show(17.2, 19.4).key(17.2, { pose: 'relaxed', at: [-6, -4.85], ry: 0 }).key(SL0, { pose: P.slash, dur: .18 }).key(19.0, { pose: 'relaxed', dur: .3 }).face(17.2, 'deadpan');
  // ======================= 19.4-35.5 s  BACKSTORY (bright summer day, the boy's yard x -30) =======================
  A.boy.show(19.4, 20.7).key(19.4, { pose: 'stand', at: [-38.5, -9.2], ry: .15 }).key(19.65, { pose: 'sad', dur: .5, ease: 'io' }).face(19.4, 'neutral').face(19.7, 'sad');
  A.jay.show(20.7, 21.9).key(20.7, { pose: 'crossArms', at: [-36.5, -8.6], ry: -.25 }).face(20.7, 'smug');
  A.boy.show(21.9, 23.0).key(21.9, { pose: 'relaxed', at: [-39.55, -8.5], ry: .12 }).face(21.9, 'happy');
  A.jay.show(21.9, 23.0).key(21.9, { pose: (t, X) => ({ ...P.relaxed, armR: limbTo('armR', {}, local([-39.78, 1.38, -8.55], -38.8, -8.5, -.12)), head: [-.25, .04, -.1] }), at: [-38.8, -8.5], ry: -.12 }).face(21.9, 'happy');
  A.jay.show(23.0, 24.2).run(22.85, [[-41, .4], [-29, .4]], { step: 1.05, T: .27, arm: 1.25, style: { lean: .2 } });   // fastest kid on the block
  A.jay.show(24.2, 26.4).run(24.0, [[-26, -.6], [-14, -.6]], { step: 1.0, T: .28, arm: 1.2, style: { lean: .18 } });
  A.jay.key(25.0, { pose: { head: [.9, 0, .1] }, upper: true, hold: .7 }); A.jay.face(24.2, 'smug');                                     // glances back, smug
  A.k1.show(24.2, 26.4).run(24.1, [[-27.6, -.2], [-16.4, -.2]], { step: .95, T: .3, arm: 1.2, style: { lean: .2 } }); A.k1.key(25.3, { pose: 'tagArm', upper: true, hold: .8 }).face(24.2, 'determined');
  A.boy.show(26.4, 28.1).key(26.4, { pose: 'sad', at: [-39.6, -9.0], ry: Math.PI / 2 }).face(26.4, 'neutral').face(27.6, 'shocked');
  A.boy.key(27.62, { pose: 'stumble', dur: .2 }).key(27.95, { pose: 'stand', dur: .3 });
  A.jay.show(26.4, 28.1).run(26.5, [[-42.8, -9.2], [-40.2, -9.1]], { step: .85, T: .3, arm: 1.1, style: { lean: .12 } }); A.jay.key(27.35, { pose: 'tagArm', upper: true, hold: .5 }).key(27.75, { pose: 'point', ry: Math.PI / 2 }).face(27.7, 'laugh');
  A.kayla.show(28.1, 30.8).key(28.1, { pose: 'crossArms', at: [-38.5, -9.2], ry: .05 }).face(28.1, 'annoyed');
  A.jay.show(28.1, 30.8).key(28.1, { pose: 'point', at: [-36.2, -11.2], ry: -.6 }).face(28.1, 'laugh');
  A.boy.show(30.8, 35.5).key(30.8, { pose: 'stand', at: [-38.5, -9.8], ry: .4 }).key(31.15, { pose: 'determined', dur: .45 }).face(30.8, 'determined');
  // FALLING, over and over: trip (anticipation) -> fall -> flat on the grass; up again; again
  for (const f of [33.3, 34.55]) A.boy.key(f - .2, { pose: 'stand', at: [-38.5, -9.8], ry: .4, dur: .15 }).key(f, { pose: 'stumble', dur: .12 }).key(f + .14, { pose: 'fallMid', dur: .14 }).key(f + .3, { pose: 'prone', dur: .14 });
  // ======================= 35.5-52.2 s  FRIDAY: THE GAME (clean sunset, street + park x 36-56) =======================
  for (const [n, from, to, t0, st] of [['k1', [40, 1.5], [36, 7], 36.7, .9], ['k2', [41.5, -1], [37.5, -9], 36.75, .85], ['k3', [39, .2], [33, -2], 36.8, .9], ['tagA', [42, 1], [45.5, 6.5], 36.75, .9]]) {
    A[n].show(35.5, 38.0).key(35.5, { pose: 'relaxed', at: from, ry: Math.atan2(to[0] - from[0], to[1] - from[1]) }).run(t0, [from, to], { step: st, T: .3, arm: 1.15, style: { lean: .16 } }); A[n].face(35.5, 'excited'); }
  A.boy.show(35.5, 38.0).key(35.5, { pose: 'determined', at: [40.5, -1.2], ry: Math.PI / 2 }).face(35.5, 'determined');
  A.jay.show(35.5, 38.0).key(35.5, { pose: 'crossArms', at: [41.8, -.6], ry: -Math.PI / 2 }).face(35.5, 'smug');
  // the chase on the park lawn toward +x (the low sun in their faces), Jayden closing in
  const chase = A.boy.run(39.45, [[42, -7.2], [52.6, -7.2]], { step: .95, T: .29, arm: 1.2, style: { lean: .18 } });
  A.boy.show(39.6, 52.1); A.boy.face(39.6, 'scared').face(42.3, 'sly');
  A.boy.key(42.5, { pose: { head: [-1.0, -.05, -.1] }, upper: true, hold: .5 });                                                               // glance back at Jayden
  A.boy.key(43.2, { pose: 'stumble', at: [52.6, -7.2], ry: Math.PI / 2, dur: .1 }).key(43.36, { pose: 'fallMid', dur: .12 }).key(43.52, { pose: 'prone', dur: .12 });   // the fall (on purpose)
  A.boy.key(45.45, { pose: 'sitGround', at: [52.9, -7.2], ry: -Math.PI / 2, dur: .01 }).face(45.45, 'nervous');                                    // (cut) sitting up, facing Jayden
  const HAND = [52.4, .88, -7.15];
  A.boy.key(47.0, { pose: () => ({ ...P.sitGround, armR: limbTo('armR', P.sitGround.root, local(HAND, 52.9, -7.2, -Math.PI / 2)), head: [0, -.25, 0] }), dur: .45 }).face(48.3, 'sly');
  A.boy.key(50.4, { pose: () => ({ ...P.sitGround, armR: limbTo('armR', P.sitGround.root, local(HAND, 52.9, -7.2, -Math.PI / 2)), head: [.08, -.22, .14], root: { ...P.sitGround.root, rx: -.18 } }), dur: .25 }).face(50.4, 'smug').talk(50.55, 50.9);
  A.jay.show(39.6, 52.75).run(39.55, [[40.1, -7.25], [51.6, -7.25]], { step: 1.0, T: .36, arm: 1.2, style: { lean: .2 } });
  A.jay.key(44.3, { pose: 'skid', at: [51.6, -7.25], ry: Math.PI / 2, dur: .12 }).key(44.75, { pose: 'stand', dur: .35 }).face(44.3, 'surprised').face(45.4, 'nervous').talk(45.5, 46.45);
  A.jay.key(46.7, { pose: () => ({ ...P.stand, armR: limbTo('armR', { rx: .42 }, local(HAND, 51.6, -7.25, Math.PI / 2)), head: [0, .25, 0], root: { rx: .42 } }), dur: .6, ease: 'io' });
  A.jay.face(50.75, 'shocked');
  // ======================= 52.2-61.7 s  DUSK: THE SWAP + THE SMILE =======================
  A.jayG.show(52.75, 61.7).key(52.75, { pose: 'stumble', at: [51.6, -7.25], ry: Math.PI / 2 }).key(53.1, { pose: 'stand', dur: .3 }).key(53.65, { pose: 'lookHands', dur: .35 }).key(55.0, { pose: 'touchHair', dur: .3 })
    .key(56.0, { pose: 'yell', dur: .2 }).key(56.9, { pose: 'whatGesture', dur: .3 });
  A.jayG.face(52.75, 'shocked').face(53.65, 'scared').face(55.0, 'terrified').face(56.0, 'angry').talk(56.02, 56.5).talk(57.0, 58.62);
  S.swap(A.jay, A.jayG, 52.75);
  A.boy.show(52.1, 61.8).key(52.2, { pose: () => ({ ...P.sitGround, head: [0, -.2, .08] }), dur: .4 }).face(52.2, 'sly').key(58.7, { pose: P.sinister, dur: .01 }).face(58.7, 'neutral').face(59.55, 'sly').face(60.15, 'evil');
  A.boy.blinks([20.3, 29.0, 31.8, 41.0, 46.0, 49.6, 54.1, 59.2]); A.jay.blinks([21.3, 24.6, 29.6, 41.4, 46.2]); A.jayG.blinks([54.5, 57.8]);

  // ---------- shots (engine/shots.js grammar; every cut changes move + size + speed) ----------
  const subj = (n, dy = 0) => t => { const a = A[n].a.root.position; return { x: a.x, y: a.y + dy, z: a.z, heading: A[n].a.root.rotation.y }; };
  const fixed = (x, y, z, hd = 0) => () => ({ x, y, z, heading: hd });
  const SH = [
    // the rule
    { t: 0,    dur: 1.3, who: 'kidA', size: 'wide',   angle: 'low',  az: 25,  move: 'push',   speed: 2.4 },
    { t: 1.3,  dur: 1.6, who: 'tagA', size: 'full',   angle: 'eye',  az: 55,  move: 'track',  speed: .8 },
    { t: 2.9,  dur: 2.0, who: 'kidAf', size: 'medium', angle: 'eye',  az: 28,  move: 'orbitL', speed: 1.6 },
    { t: 4.9,  dur: 1.5, who: 'kidBm', size: 'full',   angle: 'eye',  az: -35, move: 'truckR', speed: 1.1, at: [26.5, -1.4] },
    { t: 6.4,  dur: 1.8, who: 'kidBm', size: 'wide',   angle: 'low',  az: 25,  move: 'pull',   speed: 3.0 },
    // 5:59, sprinting men, the mailman
    { t: 8.2,  dur: 1.5, who: 'c1',   size: 'medium', angle: 'low',  az: 10,  move: 'punch',  speed: 1.4 },
    { t: 9.7,  dur: 1.6, who: 'c2',   size: 'full',   angle: 'eye',  az: -8,  move: 'pull',   speed: 1.9 },
    { t: 11.3, dur: 1.7, who: 'mail', size: 'full',   angle: 'low',  az: 70,  move: 'pan',    speed: 1.0, follow: false },
    // uncle -> Aunt Linda -> the gesture
    { t: 13.0, dur: 1.6, who: 'uncle', size: 'full',  angle: 'high', az: 15,  move: 'craneDown', speed: 1.5 },
    { t: 14.6, dur: 2.6, who: 'aunt', size: 'medium', angle: 'low',  az: 5,   move: 'push',   speed: .7 },
    { t: 17.2, dur: 2.2, who: 'boy',  size: 'medium', angle: 'eye',  az: 18,  move: 'punch',  speed: 1.6 },
    // backstory (day)
    { t: 19.4, dur: 1.3, who: 'boy',  size: 'full',   angle: 'high', az: 20,  move: 'craneDown', speed: .9 },
    { t: 20.7, dur: 1.2, who: 'jay',  size: 'medium', angle: 'low',  az: -10, move: 'push',   speed: 2.6 },
    { t: 21.9, dur: 1.1, who: 'boy',  size: 'full',   angle: 'eye',  az: 0,   move: 'truckL', speed: 1.0, aimX: .38 },
    { t: 23.0, dur: 1.2, who: 'jay',  size: 'full',   angle: 'eye',  az: -82, move: 'track',  speed: 1.8 },
    { t: 24.2, dur: 2.2, who: 'jay',  size: 'wide',   angle: 'low',  az: 20,  move: 'pull',   speed: .6 },
    { t: 26.4, dur: 1.7, who: 'boy',  size: 'full',   angle: 'eye',  az: -60, move: 'orbitR', speed: 1.4 },
    { t: 28.1, dur: 2.7, who: 'kayla', size: 'medium', angle: 'eye', az: 10,  move: 'push',   speed: .55 },
    { t: 30.8, dur: 2.2, who: 'boy',  size: 'medium', angle: 'low',  az: 25,  move: 'orbitL', speed: 1.2 },
    { t: 33.0, dur: 1.2, who: 'boy',  size: 'wide',   angle: 'eye',  az: 95,  move: 'hold',   speed: .4, follow: false, aimX: .25, aimZ: .65 },
    { t: 34.2, dur: 1.3, who: 'boy',  size: 'wide',   angle: 'low',  az: 50,  move: 'push',   speed: 2.2, follow: false },
    // Friday
    { t: 35.5, dur: 1.2, who: 'boy',  size: 'wide',   angle: 'high', az: -40, move: 'truckL', speed: 1.6 },
    { t: 36.7, dur: 1.3, who: 'boy',  size: 'wide',   angle: 'low',  az: 160, move: 'pull',   speed: 3.2 },
    { t: 38.0, dur: 1.6, who: 'sun',  size: 'wide',   angle: 'eye',  az: 180, move: 'craneDown', speed: .5 },
    { t: 39.6, dur: 1.1, who: 'boy',  size: 'full',   angle: 'low',  az: 8,   move: 'track',  speed: 1.0 },
    { t: 40.7, dur: 1.5, who: 'jay',  size: 'full',   angle: 'eye',  az: 4,   move: 'pull',   speed: 2.0 },
    { t: 42.2, dur: 0.9, who: 'boy',  size: 'close',  angle: 'eye',  az: 30,  move: 'track',  speed: .5 },
    { t: 43.1, dur: 1.1, who: 'boy',  size: 'wide',   angle: 'low',  az: 85,  move: 'push',   speed: 2.6, follow: false },
    { t: 44.2, dur: 1.3, who: 'jay',  size: 'full',   angle: 'low',  az: -30, move: 'orbitL', speed: 1.5 },
    { t: 45.5, dur: 1.1, who: 'jay',  size: 'close',  angle: 'low',  az: -20, move: 'push',   speed: .9 },
    { t: 46.6, dur: 1.6, who: 'jay',  size: 'full',   angle: 'eye',  az: 85,  move: 'truckR', speed: .45 },
    { t: 48.2, dur: 1.0, who: 'sun',  size: 'wide',   angle: 'low',  az: 180, move: 'push',   speed: 1.6 },
    { t: 49.2, dur: 1.2, who: 'hand', size: 'feet',   angle: 'eye',  az: 0,   move: 'punch',  speed: 1.2 },
    { t: 50.4, dur: 0.6, who: 'boy',  size: 'close',  angle: 'low',  az: -15, move: 'push',   speed: 2.6 },
    { t: 51.0, dur: 1.1, who: 'jay',  size: 'close',  angle: 'eye',  az: -25, move: 'orbitR', speed: 1.0 },
    // dusk
    { t: 52.1, dur: 1.5, who: 'jayG', size: 'wide',   angle: 'eye',  az: -100, move: 'pull',  speed: 2.4 },
    { t: 53.6, dur: 1.4, who: 'jayG', size: 'close',  angle: 'high', az: -15, move: 'push',   speed: 1.2 },
    { t: 55.0, dur: 0.9, who: 'jayG', size: 'medium', angle: 'eye',  az: -45, move: 'truckL', speed: 1.5 },
    { t: 55.9, dur: 0.8, who: 'jayG', size: 'medium', angle: 'low',  az: -5,  move: 'punch',  speed: 2.0 },
    { t: 56.7, dur: 2.0, who: 'jayG', size: 'full',   angle: 'eye',  az: -25, move: 'orbitL', speed: .8 },
    { t: 58.7, dur: 3.0, who: 'boy',  size: 'close',  angle: 'eye',  az: 0,   move: 'push',   speed: .5 },
  ];
  // shot subjects: actors, the setting sun on the hills, the two hands meeting
  const SUBJ = { sun: t => { const p = new THREE.Vector3(48, 1.6, -4); return { x: p.x, y: 0, z: p.z, heading: -Math.PI / 2 }; }, hand: () => ({ x: HAND[0], y: HAND[1] - .5, z: HAND[2], heading: Math.PI }) };
  const subjectAt = (t, s) => { if (SUBJ[s.who]) return SUBJ[s.who](t); const a = A[s.who].a.root, at = s.at; return { x: at ? at[0] : a.position.x, y: ground(a.position.x, a.position.z) + (s.who === 'boy' && t > 45.4 ? -.55 : 0), z: at ? at[1] : a.position.z, heading: a.rotation.y }; };
  // the sun shots look along +x at the real sun: fov long so the disc sits big on the hill line
  for (const s of SH) if (s.who === 'sun') { s.fov = 16; s.aimY = 1.6 + Math.tan((hillEl + 1) * Math.PI / 180) * 160; }
  const bad = validate(SH); if (bad.length) console.error('SHOTS', bad.join('; '));
  // pre-sample actor positions for the camera: actors must be updated before shots are planned (plans read positions)
  const samples = new Map(); for (let t = -.6; t <= DUR + .1; t += .05) { S.update(t); for (const s of SH) if (t >= s.t - .001 && t <= s.t + s.dur + .001 && !SUBJ[s.who] && A[s.who].a.root.visible) { const k = s.who + '@' + Math.round(t * 20); if (!samples.has(k)) samples.set(k, subjectAt(t, s)); } }
  // camera keys only read the subject while it is on screen in that shot (clamped into the shot)
  const subjAtCached = (t, s) => { if (SUBJ[s.who]) return SUBJ[s.who](t); for (let d = 0; d < 40; d++) for (const q of [t + d * .05, t - d * .05]) { const qq = Math.min(s.t + s.dur, Math.max(s.t, q)), v = samples.get(s.who + '@' + Math.round(qq * 20)); if (v) return v; } return subjectAt(t, s); };
  const rig = cameraRig(planShots(SH, subjAtCached), { drift: 1 });
  const cam = new THREE.PerspectiveCamera(32, w / h, .2, 380);
  globalThis.SHOTS = SH.map(s => [s.t, s.who, s.size, s.move]);
  const update = t => {
    light(t); S.update(t);
    if (opts.camP) { cam.position.set(...opts.camP); cam.lookAt(...opts.camL); cam.fov = opts.fov || 35; cam.updateProjectionMatrix(); }
    else rig.apply(cam, t);
    { const sh = SH.slice().reverse().find(q => t >= q.t); if (sh && sh.who === 'sun') {   // the sun on the hills: from the park lawn along +x, long lens
      const u = (t - sh.t) / sh.dur, first = sh.t < 45, y = first ? lerp(2.2, 1.5, sm(u)) : 1.1, a = LOOK.sun.position.clone().sub(LOOK.sun.target.position).normalize();
      cam.position.set(first ? 45 : 47.5 + u * .6, y, first ? -3.2 : -5.2); cam.fov = first ? 15 : 19; cam.updateProjectionMatrix();
      cam.lookAt(cam.position.x + a.x * 100, y + Math.max(1.2, a.y * 100) - (first ? 0 : .5), cam.position.z + a.z * 100); } }
    const s = SH.slice().reverse().find(q => t >= q.t) || SH[0], sub = SUBJ[s.who] ? null : A[s.who].a.root.position;
    if (sub) LOOK.follow(cam, { x: sub.x, y: sub.y, z: sub.z, focusY: s.size === 'feet' ? .5 : s.size === 'close' ? (s.who === 'boy' && t > 45.4 ? 1.05 : 1.6) : 1.35 });
    else if (s.who === 'hand') LOOK.follow(cam, { x: HAND[0], y: 0, z: HAND[2], focusY: HAND[1] }); else { post.focus = 150; }
    cam.updateMatrixWorld(true);
    return true;
  };
  update(opts.t ?? 0);
  if (opts.dbg) { const s = SH.slice().reverse().find(q => (opts.t ?? 0) >= q.t); const b = A[s.who]?.a.root; console.error('DBG', s.who, JSON.stringify(cam.position.toArray().map(v => +v.toFixed(2))), b && JSON.stringify(b.position.toArray().map(v => +v.toFixed(2))), b && b.rotation.y.toFixed(2), b && b.visible, 'hill', hillEl); }
  return { camera: cam, sun: LOOK.sun, post, update };
}
