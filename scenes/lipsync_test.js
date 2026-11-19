// LIP SYNC TEST (2026-11-19). Ava turns round and tells Ethan the town rule; he answers. Two over-the-shoulder shots,
// cut on the reply. Mouths come from the audio (Rhubarb phonemes + transcript, engine/lipsync.js rules: 1-frame lead,
// 2-frame minimum, M B P closures always shown), blinks on each new line and every 2-5 s, eyes keep the expression.
// Audio: topics/lipsync_test/{ava,ethan}.wav (placed at A0 and E0 below). opts.t = still time for checks.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { classroom } from '../engine/sets/classroom.js';
import { makeR6 } from '../engine/r6.js';
import { poseRig } from '../engine/rig.js';
import { CLASS } from './classroom.js';
import { faceSpec, loadClassic, AI_PLACE, VISEMES, EMOTIONS } from '../engine/faceset.js';
import { talkTrack, blinkTrack, blinkTimes, flapTrack } from '../engine/lipsync.js';

export const A0 = .35, E0 = 4.88, DUR = 12.2;   // Ava's line starts at A0, Ethan's at E0 (seconds in the clip)
const SIT = [
  { legL: [.08, 0, 1], legR: [-.1, 0, 1], armL: [.05, -.12, .99], armR: [-.12, -.1, .99], head: [0, -.06, 0] },
  { legL: [.15, 0, 1], legR: [-.04, 0, 1], armL: [.08, -.12, .99], armR: [-.1, .35, .94], head: [-.12, .08, -.2], root: { rz: -.05 } },
  { legL: [.04, 0, 1], legR: [-.14, 0, 1], armL: [.2, -.9, .1], armR: [-.05, -.12, .99], head: [.1, -.18, .04], root: { rz: .03 } },
  { legL: [.06, 0, 1], legR: [-.06, 0, 1], armL: [.1, -.12, .99], armR: [-.1, -.12, .99], head: [.2, .1, 0] },
];
const cellOf = e => { const i = Math.max(0, EMOTIONS.indexOf(e)); return (i < 16 ? 'A' : 'B') + String(i + 1).padStart(2, '0'); };
const mouthCell = v => 'C' + String(VISEMES.indexOf(v) + 1).padStart(2, '0');
// one talking face: style folder, the expression held while talking / silent, the lip track and blink track
function liveFace(actor, style, emo, talk, blink) {
  const D = `assets/faces/sprites/${style}`, E = cellOf(emo), P = AI_PLACE[style] || {};
  const urls = [`${D}/${E}.png`, `${D}/${E}e.png`, `${D}/D02.png`, `${D}/D03.png`, ...VISEMES.map(v => `${D}/${mouthCell(v)}.png`)];
  return { ready: () => actor.preloadFace(urls), at: t => {
    const b = blink(t), eyes = b === 2 ? `${D}/D03.png` : b === 1 ? `${D}/D02.png` : null;
    let v = talk(t); if (typeof v === 'number') v = v === 2 ? 'AI' : v === 1 ? 'talkSmile' : 'SHUT';   // flap: open / half / own closed mouth
    const own = `${D}/${E}.png`;
    const layers = v && v !== 'SHUT' ? [eyes || `${D}/${E}e.png`, `${D}/${mouthCell(v)}.png`] : eyes ? [eyes, `${D}/C01.png`] : [own];
    actor.faceNow(layers, P); return { v, b }; } };
}
export async function build({ scene, W: w, H: h, opts = {} }) {
  RectAreaLightUniformsLib.init(); await loadClassic();
  const HER = 6, HIM = 11, EMPTY = new Set([4, 18, 22]);
  const C = await classroom(scene, { hide: ['s', 'e'] });
  const bank = Object.fromEntries((await (await fetch(new URL('library/characters.json', document.baseURI))).json()).map(c => [c.id, c]));
  const spec = (c, face) => ({ res: 1024, skin: c.skin, sex: c.sex, hair: c.hair, accessories: c.accessories.filter(i => ![11884330, 4197739997, 301820310].includes(i)), ...(c.hairTint ? { hairTint: c.hairTint } : {}),
    shirt: c.shirtTex || `assets/roblox/${c.shirt}/texture.png`, pants: c.pantsTex || `assets/roblox/${c.pants}/texture.png`, ...face });
  const seatY = s => s.seatTop + .17 - .68 + .025, place = (a, s, ry = Math.PI, dz = -.02) => { const g = new THREE.Group(); g.add(a.root); g.position.set(s.x, 0, s.z + dz); g.rotation.y = ry; scene.add(g); return g; };
  const others = CLASS.filter(id => id !== 'f002' && id !== 'm005'); let k = 0;
  for (const [i, s] of C.seats.entries()) {
    if (EMPTY.has(i) || i === HER || i === HIM || k >= others.length) continue; const c = bank[others[k++]];
    const fs = faceSpec(c.faceSet, ['neutral', 'bored', 'neutral', 'happy'][(i * 3) % 4], null, c.sex); delete fs._classicIdx;
    const a = await makeR6(spec(c, fs)), p = SIT[(i * 7 + 3) % SIT.length]; poseRig(a).pose({ ...p, root: { ...(p.root || {}), y: seatY(s) } }); place(a, s);
  }
  const t = bank.f010, tf = faceSpec(t.faceSet, 'neutral', null, t.sex); delete tf._classicIdx;
  const ta = await makeR6(spec(t, tf)); poseRig(ta).pose({ armL: [.25, -.6, .75], armR: [-.1, -1, .05], head: [.1, -.04, .03] }); ta.root.position.copy(C.teacherSpot); ta.root.rotation.y = .25; scene.add(ta.root);
  // the two actors (same staging as the research before/after)
  const sHer = C.seats[HER], sHim = C.seats[HIM];
  const her = await makeR6(spec(bank.f002, { face: false })), him = await makeR6(spec(bank.m005, { face: false }));
  poseRig(her).pose({ legL: [.28, -.04, 1], legR: [.02, -.16, 1], armR: [-.78, -.55, -.12], armL: [.22, -.92, .32], head: [-.42, .06, .14], root: { y: seatY(sHer), rx: .1, rz: -.14 } }); place(her, sHer, 1.15, .04);   // head turned less than the research frame: a SPEAKER's face must read
  poseRig(him).pose({ legL: [.12, 0, 1], legR: [-.16, -.04, 1], armL: [.1, -.1, .99], armR: [-.22, -.12, .97], head: [.12, -.1, .1], root: { y: seatY(sHim), rx: .16, rz: .05 } }); place(him, sHim);
  // lip + blink tracks from the audio analysis
  const cues = async n => (await (await fetch(new URL(`topics/lipsync_test/${n}.json`, document.baseURI))).json()).mouthCues;
  const fps = opts.fps || 30;
  const flap = async n => (await (await fetch(new URL(`topics/lipsync_test/${n}_flap.json`, document.baseURI))).json());
  const FL = opts.lip !== 'phoneme';
  const herF = liveFace(her, opts.herStyle || '13_sleepy_chibi_doll', 'smug', FL ? flapTrack(await flap('ava'), A0) : talkTrack(await cues('ava'), { fps, offset: A0 }), blinkTrack(blinkTimes(DUR, [A0 - .1, E0 + 1.6], 3), fps));
  const himF = liveFace(him, opts.himStyle || '05_intimidating', 'neutral', FL ? flapTrack(await flap('ethan'), E0) : talkTrack(await cues('ethan'), { fps, offset: E0 }), blinkTrack(blinkTimes(DUR, [E0 - .15], 7), fps));
  await herF.ready(); await himF.ready();
  // light design (as in the research after)
  C.ceilingLights.forEach(l => l.intensity *= .55);
  const key = new THREE.RectAreaLight('#fff1e0', 9, .9, .9); key.position.set(-1.1, 2.3, .3); key.lookAt(-2.2, 1.7, -.75); scene.add(key);
  const key2 = new THREE.RectAreaLight('#fff1e0', 6, .9, .9); key2.position.set(-1.2, 2.3, -.4); key2.lookAt(-2.1, 1.7, 1.1); scene.add(key2);
  const rim = new THREE.SpotLight('#ffe9c8', 40, 9, .5, .6, 1.2); rim.position.set(-5.6, 3.1, -2.8); rim.target.position.set(-2.2, 1.7, -.75); scene.add(rim, rim.target);
  C.sun.intensity = 3.6;
  // two shots: over Ethan's shoulder onto Ava, then (cut on the reply) over Ava's shoulder onto Ethan; both push in slowly
  const CUT = E0 - .3, SH = [
    { p: new THREE.Vector3(-1.7, 1.98, 2.1), l: new THREE.Vector3(-2.0, 1.52, -.83), f: new THREE.Vector3(-1.99, 1.72, -.83) },
    { p: new THREE.Vector3(...(opts.cp2 || [-2.5, 2.1, -1.9])), l: new THREE.Vector3(...(opts.cl2 || [-2.1, 1.6, 1.09])), f: new THREE.Vector3(-2.1, 1.7, 1.09) },
  ];
  const cam = new THREE.PerspectiveCamera(30, w / h, .05, 400);
  const post = { sun: C.sun, volume: 0, focus: 3, aperture: 2.4, maxBlur: 12 * w / 540, bloom: .32, bloomRadius: .6, bloomThreshold: 1.35, bloomCap: 2.4, bloomTint: '#ffb391',
    exposure: 1.18, contrast: 1.1, saturation: 1.04, black: .025, shadowTint: '#4d6f92', highTint: '#ffd9a8', tintAmt: .22, pivot: .42,
    lift: [.012, .018, .034], gamma: [1, 1, 1.01], gain: [1.03, 1, .965], grain: .03, ca: .006 };
  const update = t => {
    const s = t < CUT ? 0 : 1, S0 = SH[s], u = s ? (t - CUT) / (DUR - CUT) : t / CUT, e = u * u * (3 - 2 * u);
    cam.position.copy(S0.p).lerp(S0.l, .07 * e); cam.lookAt(S0.l); cam.updateMatrixWorld(); post.focus = cam.position.distanceTo(S0.f);
    globalThis.LIP = { t, ava: herF.at(t), ethan: himF.at(t) }; return false;
  };
  update(opts.t || 0);
  return { camera: cam, sun: C.sun, post, update };
}
