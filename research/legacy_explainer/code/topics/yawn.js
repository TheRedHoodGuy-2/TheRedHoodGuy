// WHY YAWNS ARE CONTAGIOUS (Format A, classroom + Brain HQ). Xavier's script + his recorded voice (38.5 s).
// Beat 1 (0-8.3)    a boring lecture, dead-silent class; the kid at the back (our guy) lets out the biggest yawn ever.
// Beat 2 (8.9-15.9) the girl next to him yawns, then the back row, then the row in front, rippling forward to the teacher,
//                   who fights it (watery eyes, hand over mouth).
// Beat 3 (16.6-30.5) "You see": push into HER forehead -> Brain HQ, little her at the console: YAWN DETECTED, COPYING,
//                   a CLOSENESS meter (desk buddy = x3), then the YAWN lever pulls itself down and she yawns.
// Beat 4 (31.1-38.5) the teacher, mid "pay attention", lets out a massive yawn; a few kids catch it again.
// Classmates + teacher: blank white NPCs (Xavier liked them white in the tickle video).
import * as THREE from 'three';
export const FORMAT = 'A';
export const SET = 'classroom';

const SIT = { legL: [.07, -.05, 1], legR: [-.06, -.05, 1] };
const { stretch: S, reachOut: RO, mirrorPose: M } = await import(new URL('kit/poses.js', document.baseURI).href);   // stretched (not crumpled) raised arms
export const LOCAL_POSES = {
  // students
  // Xavier's own yawn from the pose editor (2026-10-22): arms STRETCHED up out of the shoulders, head back, leaning back
  yawnStretch: { armL: { r: [2.869, -0.214, 0.008], o: [0.01, 0.159, -0.033] }, armR: { r: [2.99, 0.558, -0.232], o: [-0.048, 0.2, 0.001] }, legL: { r: [-1.32, -0.011, 0.091], o: [0, 0.013, -0.061] }, legR: { r: [-1.32, 0.011, -0.091], o: [0, 0.013, -0.061] }, head: { r: [-0.44, 0, 0], o: [-0.008, 0.041, -0.008] }, root: { y: -0.202, z: 0.188, rx: -0.248 } },
  // variants built the same way so the class doesn't yawn in unison
  yawnStretchB: { armL: { r: [-1.53, 0.709, 2.258], o: [0.161, 0.191, 0.078] }, armR: { r: [-2.947, -0.367, -0.76], o: [-0.011, 0.235, -0.072] }, legL: { r: [-1.116, -0.02, 0.087], o: [0.011, -0.039, -0.013] }, legR: { r: [-1.116, 0.02, -0.087], o: [0.011, -0.039, -0.013] }, head: { r: [-0.454, 0, 0] }, root: { x: -0.011, y: -0.128, z: 0.218, rx: -0.452 } },
  yawnStretchW: { armL: { r: [-1.291, 1.148, 1.899], o: [0.161, 0.191, 0.078] }, armR: { r: [-3.013, 0.012, -0.792], o: [-0.022, 0.298, -0.09] }, legL: { r: [-1.107, -0.183, 0.347], o: [0.058, -0.033, -0.013] }, legR: { r: [-1.108, -0.142, 0.173], o: [0.072, -0.129, -0.013] }, head: { r: [-0.24, -0.105, -0.303], o: [0.002, 0.055, 0] }, root: { x: -0.185, y: -0.057, z: 0.183, rx: -0.452, rz: -0.291 } },   // stretch to one side
  yawnCover:   { ...SIT, armR: [.7, .66, .3], armL: [.2, -.55, .8], head: [.05, -.25, .08], root: { y: -.22, rx: -.08 } },     // polite: hand over the mouth
  // Xavier's refs from the pose editor (2026-10-22)
  yawnLean: { armL: { r: [-1.283, 0.564, 1.455], o: [0.144, 0.092, 0.163] }, armR: { r: [-0.163, -0.324, -1.254], o: [-0.137, -0.264, 0] }, legL: { r: [-1.087, 0.139, 0.184], o: [0.012, -0.048, 0.07] }, legR: { r: [-1.103, 0.181, 0.012], o: [0.017, -0.048, 0.13] }, head: { r: [-0.313, -0.435, -0.07], o: [0.004, 0.044, -0.007] }, root: { x: 0.003, y: -0.167, z: 0.119, rx: -0.462, ry: -0.2, rz: 0.09 } },
  lookLeft:    { ...SIT, armR: [-.12, -.55, .83], armL: [.22, -.62, .76], head: [.75, 0, .05], root: { y: -.22, rx: .06, ry: .12 } }, // glances at the kid on her left
  crossSit:    { ...SIT, armL: [-.85, .05, .5], armR: [.75, -.1, .6], head: [-.15, .05, -.1], root: { y: -.22, rx: -.05, rz: .05 } },
  laughHold:   { legL: [.15, -.05, 1], legR: [-.1, -.05, 1], armL: [-.5, -.45, .7], armR: [.5, -.45, .7], head: [-.3, -.25, .25], root: { y: -.22, rx: -.12, rz: .1 } },
  // teacher (standing at the board, facing the class)
  lecture:     { armL: [.65, .35, -.6], armR: [-.15, -.85, .45], legL: [.08, -1, .03], legR: [-.1, -1, -.04], head: [.25, .02, .05], root: { ry: .2, rz: .02 } },   // points back at the board
  lectureTalk: { armR: [-.3, -.1, .95], armL: [.15, -.95, .2], legL: [.1, -1, -.05], legR: [-.08, -1, .06], head: [-.08, .03, -.05], root: { rx: .03, rz: -.02 } },
  holdYawnStand: { armR: [.7, .66, .3], armL: [.12, -.98, .05], legL: [.06, -1, .02], legR: [-.08, -1, -.02], head: [0, .08, .06], root: { rx: .05 } },          // hand clamped over his mouth
  payAttention: { armR: [-.08, .12, 1], armL: [.3, -.85, .4], legL: [.12, -1, -.08], legR: [-.08, -1, .1], head: [0, .05, 0], root: { rx: .08 } },                // stern point at the class
  // massive wake-up stretch (pandiculation): BOTH arms up and out in a wide V, inner sides turned to face out, stretched
  // out of the shoulders; chest pushed forward + back arched, head thrown back and a little rolled, rising onto his toes
  teacherYawn: { armL: RO('L', [.8, .6, -.18]), armR: RO('R', [-.74, .66, -.2]), legL: [.13, -1, -.12], legR: [-.11, -1, -.2],
    head: [-.08, -.5, -.12], root: { y: .03, rx: -.16, rz: .04 } },
  // little her in Brain HQ
  // Xavier's own chill from the pose editor (2026-10-22): leaning right back, hands behind her head, one leg kicked out
  chill: { armL: { r: [2.162, 0.91, -0.441], o: [-0.049, 0.159, -0.089] }, armR: { r: [2.268, -1.026, -0.062], o: [0.057, 0.14, -0.126] }, legL: { r: [-1.174, -0.537, -0.591], o: [0, 0.033, -0.006] }, legR: { r: [-1.129, 0.019, -0.087], o: [0, 0.033, -0.006] }, head: { r: [-0.44, 0, 0], o: [-0.008, 0.041, -0.008] }, root: { y: -0.199, z: 0.236, rx: -0.439 } },
  watchScreen: { legL: [.12, -.1, 1], legR: [-.1, -.1, 1], armL: [.3, -.45, .85], armR: [-.3, -.45, .85], head: [0, -.12, 0], root: { y: -.2, rx: .28 } },
  pressButtons:{ ...SIT, armR: [-.08, -.4, .9], armL: [.12, -.42, .9], head: [0, .32, 0], root: { y: -.22, rx: .14 } },
  pointScreen: { ...SIT, armR: [-.1, .25, .97], armL: [.15, -.8, .5], head: [.25, -.05, .05], root: { y: -.22, rx: .05, ry: -.15 } },
  grabLever:   { ...SIT, armR: [-.6, -.1, .8], armL: [-.35, -.05, .93], head: [-.4, .2, -.05], root: { y: -.22, rx: .15, ry: -.4 } },    // both hands on the lever trying to stop it
};
// how far each lean-back yawn rocks the chair (radians); the pose sheet shows it as pose-editor props (chair behind = -z)
const LEAN = { yawnLean: .12, yawnStretchB: .14, yawnStretchW: .12, yawnStretch: .09 };
for (const [n, a] of Object.entries(LEAN)) LOCAL_POSES[n].props = { chair: { p: [0, .22 * Math.sin(a), -(.22 * (1 - Math.cos(a)) + .1)], r: [-a, 0, 0] } };
export const POSE_SHEET = [
  ['boredChin', 'guy', 'boredChin', 'bored', 'chair desk'], ['yawnStretch', 'guy', 'yawnStretch', 'yawn', 'chair desk'],
  ['crossSit', 'guy', 'crossSit', 'smirk', 'chair desk'],
  ['lookLeft', 'girl', 'lookLeft', 'surprised', 'chair desk'], ['yawnCover', 'girl', 'yawnCover', 'yawn', 'chair desk'], ['laughHold', 'girl', 'laughHold', 'laugh', 'chair'],
  ['classmate slumpSit', 'npc', 'slumpSit', 'tired', 'chair desk'], ['classmate yawnLean', 'npc', 'yawnLean', 'yawn', 'chair desk'], ['classmate stretchB', 'npc', 'yawnStretchB', 'yawn', 'chair desk'], ['classmate stretchW', 'npc', 'yawnStretchW', 'yawn', 'chair desk'],
  ['teacher lecture', 'npc', 'lecture', 'bored', ''], ['teacher lectureTalk', 'npc', 'lectureTalk', 'neutral', ''], ['teacher holdYawn', 'npc', 'holdYawnStand', 'holdYawn', ''],
  ['teacher payAttention', 'npc', 'payAttention', 'angry', ''], ['teacher yawn', 'npc', 'teacherYawn', 'yawn', ''],
  ['her: chill', 'girl', 'chill', 'smile', 'stool back'], ['her: watchScreen', 'girl', 'watchScreen', 'surprised', 'stool back'], ['her: pointScreen', 'girl', 'pointScreen', 'thinking', 'stool back'],
  ['her: grabLever', 'girl', 'grabLever', 'shocked', 'stool back'], ['her: yawnStretch', 'girl', 'yawnStretch', 'yawn', 'stool back'],
];

export async function setup({ CAST, world, scene }) {
  const { buildBrainRoom } = await import(new URL('kit/sets/brainroom.js', document.baseURI).href);
  const F = Math.PI, seat = (x, z) => [x, 0, z + .5], L = LOCAL_POSES;
  // ---------- the most boring lecture ever ----------
  world.board.write((x, w, h) => { x.fillStyle = '#2756c9'; x.font = `800 ${h * .13}px Fredoka, Comic Sans MS, sans-serif`; x.fillText('Chapter 12:', w * .05, h * .2); x.fillStyle = '#333';
    x.font = `700 ${h * .11}px Comic Sans MS, sans-serif`; x.fillText('The History of brainrot', w * .05, h * .38); x.font = `500 ${h * .08}px Comic Sans MS, sans-serif`;
    ['TheRedHoodGuy', 'Skibidi toilet', 'TungTung Sahur'].forEach((s, i) => x.fillText(s, w * .07, h * (.55 + i * .12))); });
  // ---------- cast ----------
  const guy = await CAST.castMain('guy'), girl = await CAST.castMain('girl'), op = await CAST.castMain('girl', { seed: 12 }), teacher = await CAST.castBlank('m', 9);
  // classmates: [x, z of desk, yawn time, yawn style] -- the yawn ripples back row -> row in front -> front rows
  const SEATS = [[-2.7, 2.8, 11.0, 'yawnLean'], [2.7, 2.8, 11.95, 'yawnStretchB'],
    [-.9, 1.1, 12.7, 'yawnCover'], [.9, 1.1, 12.95, 'yawnStretchW'], [-2.7, 1.1, 13.2, 'yawnLean'], [2.7, 1.1, 13.45, 'yawnCover'],
    [-.9, -.6, 14.3, 'yawnStretchB'], [.9, -.6, 14.5, 'yawnCover'], [-2.7, -.6, 14.7, 'yawnLean'], [2.7, -.6, 14.9, 'yawnStretchW'],
    [-2.7, -2.3, 15.0, 'yawnCover'], [.9, -2.3, 15.15, 'yawnLean']];
  const npc = [];
  for (const [i, [x, z, ty, style]] of SEATS.entries()) {
    const n = await CAST.castBlank(i % 2 ? 'f' : 'm', i + 1), idle = ['slumpSit', 'boredChin', 'deadpan'][i % 3];
    n.keys = [{ t: 0, pose: idle, expr: i % 2 ? 'tired' : 'bored', at: seat(x, z), face: F },
      { t: ty - .15, pose: L[style], expr: 'yawn', dur: .6, ease: 'out' },
      { t: ty + 1.7, pose: idle, expr: 'tired', dur: .6 }];
    // the teacher's yawn sets a few of them off again
    if (i % 3 === 1) n.keys.push({ t: 36.1 + i * .08, pose: L[style], expr: 'yawn', dur: .6, ease: 'out' });
    else if (i % 3 === 2) n.keys.push({ t: 35.9 + i * .05, pose: idle, expr: 'surprised' });
    npc.push(n);
  }
  // leaning back into a yawn rocks the chair back onto its rear legs (it pivots on them) and skids it back a touch, so the
  // backrest makes room instead of cutting through the body (Xavier: move furniture physically)
  const rocks = [];
  const chairAt = (x, z) => world.desks.find(d => Math.abs(d.desk.position.x - x) < .01 && Math.abs(d.desk.position.z - z) < .01)?.chair;
  const rock = (x, z, wins) => { const ch = chairAt(x, z); if (ch) rocks.push({ ch, c0: ch.position.clone(), rx: ch.rotation.x, wins }); };
  for (const [i, [x, z, ty, style]] of SEATS.entries()) if (LEAN[style]) rock(x, z, [[ty - .15, ty + 2.3, LEAN[style]], ...(i % 3 === 1 ? [[36.1 + i * .08, 99, LEAN[style]]] : [])]);
  rock(-.9, 2.8, [[5.95, 9.0, LEAN.yawnStretch]]); rock(.9, 2.8, [[9.85, 12.0, LEAN.yawnLean]]);
  const rockAt = t => { for (const { ch, c0, rx, wins } of rocks) {
    let a = 0, sl = 0; for (const [t0, t1, amp] of wins) { const k = THREE.MathUtils.smoothstep(t, t0, t0 + .45) * (1 - THREE.MathUtils.smoothstep(t, t1 - .1, t1 + .45)); a = Math.max(a, amp * k); sl = Math.max(sl, .1 * k); }
    const zr = .22; ch.rotation.x = rx + a; ch.position.set(c0.x, c0.y + zr * Math.sin(a), c0.z + zr * (1 - Math.cos(a)) + sl); } };
  const TA = [-.9, 0, -4.25];
  // the teacher is always mid-sentence: lip sync over a droning lecture, then the real "pay at-" (cut off by his yawn)
  const chatter = (s0, e0, text) => { const out = [], ws = text.split(' '); let t = s0, i = 0; while (t < e0 - .15) { const w = ws[i++ % ws.length], d = .12 + w.length * .045; out.push({ s: t, e: Math.min(e0, t + d), w }); t += d + (i % 5 === 0 ? .32 : .07); } return out; };
  const LECT = 'so in eighteen ninety nine someone bent a wire and that my friends changed office supplies forever now turn to page four hundred';
  teacher.talk = [...chatter(.15, 15.1, LECT), ...chatter(30.6, 32.45, 'and that is why the wire matters'), ...chatter(32.55, 33.7, 'hey you in the back'),
    { s: 33.78, e: 34.22, w: 'pay' }, { s: 34.22, e: 34.55, w: 'atten' }];
  teacher.keys = [
    { t: 0, pose: L.lecture, expr: 'bored', at: TA, face: 0 },                       // (talking: the mouth is lip-synced, eyes stay bored)
    { t: .45, pose: L.lectureTalk, expr: 'neutral' },                               // droning, hands going
    { t: 1.3, pose: L.lecture, expr: 'bored' },
    { t: 2.6, pose: L.lectureTalk, expr: 'neutral' },
    { t: 5.4, pose: L.lecture, expr: 'bored' },
    { t: 9.6, pose: L.lectureTalk, expr: 'neutral' },
    { t: 15.25, pose: L.holdYawnStand, expr: 'holdYawn', dur: .4 },               // "till it got to the teacher": he fights it
    { t: 31.0, pose: L.lecture, expr: 'neutral' },                                 // "which is why": back to teaching
    { t: 32.5, pose: L.payAttention, expr: 'stern', style: 'snap', snap: 1.2 },     // "pay attention"
    { t: 34.55, pose: L.teacherYawn, expr: 'yawn', dur: .7, ease: 'out' },           // ...and it gets him
    { t: 37.4, pose: L.teacherYawn, expr: 'yawn' },
  ];
  guy.keys = [
    { t: 0, pose: 'boredChin', expr: 'bored', at: seat(-.9, 2.8), face: F },
    { t: 3.0, pose: 'slumpSit', expr: 'sleepy' },
    { t: 5.95, pose: L.yawnStretch, expr: 'yawn', dur: .7, ease: 'out' },          // "the biggest yawn ever"
    { t: 8.4, pose: 'slumpSit', expr: 'sleepy' },
    { t: 9.95, pose: M(L.lookLeft), expr: 'smirk' },                               // sees her catch it
    { t: 11.3, pose: 'slumpSit', expr: 'sleepy' },
    { t: 31.0, pose: 'boredChin', expr: 'bored' },
    { t: 35.5, pose: L.crossSit, expr: 'smirk' },                                   // told you so
  ];
  girl.keys = [
    { t: 0, pose: 'slumpSit', expr: 'bored', at: seat(.9, 2.8), face: F },
    { t: 6.3, pose: L.lookLeft, expr: 'surprised' },                               // turns to see him yawn
    { t: 9.85, pose: { ...M(L.yawnLean), props: undefined }, expr: 'yawn', dur: .55, ease: 'out' },   // ...and catches it: Xavier's lean, mirrored so she leans toward him (the hand-over-mouth hid her whole face)            // ...and catches it
    { t: 11.7, pose: 'slumpSit', expr: 'sleepy' },
    { t: 35.5, pose: L.laughHold, expr: 'laugh' },
  ];
  // ---------- Brain HQ (inside HER head) ----------
  const B = buildBrainRoom(scene, { at: [300, 0, 0], leverLabel: 'YAWN', chairBack: true }), O = [300, 0, 0], zF = -3.6 * .62 + .12, R = (x, y, z) => [O[0] + x, O[1] + y, O[2] + z];
  const OP = [300, .03, zF + 1.75];
  op.keys = [
    { t: 0, pose: L.chill, expr: 'smile', at: OP, face: F },
    { t: 16.8, pose: L.watchScreen, expr: 'surprised', style: 'snap', snap: 1.1 },   // YAWN DETECTED
    { t: 19.4, pose: L.pressButtons, expr: 'thinking' },                           // copying...
    { t: 22.9, pose: L.pointScreen, expr: 'smirk' },                               // the closeness meter
    { t: 26.35, pose: L.grabLever, expr: 'shocked', at: [300 + .45, .03, zF + 1.5], face: F - .45, dur: .35 },   // the lever goes by itself
    { t: 27.9, pose: L.yawnStretch, expr: 'yawn', at: OP, face: F, dur: .7, ease: 'out' },                       // she yawns
  ];
  // custom Brain HQ screens
  const txt = (g, s, x, y, px, col, wt = 800) => { g.fillStyle = col; g.font = `${wt} ${px}px Fredoka, Arial Black, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y); };
  // screens are filmed straight-on in portrait, so everything sits in the middle ~300 px of the 640 px screen
  const SCR = {
    calm: (g, w, h, t) => { g.fillStyle = '#0c2a22'; g.fillRect(0, 0, w, h); txt(g, 'ALL', w / 2, h * .38, 64, '#4dff9a'); txt(g, 'CALM', w / 2, h * .62, 64, '#4dff9a'); },
    detect: (g, w, h, t) => { const on = Math.floor(t * 5) % 2; g.fillStyle = on ? '#ffd14f' : '#2a2a12'; g.fillRect(0, 0, w, h);
      txt(g, 'YAWN', w / 2, h * .27, 76, on ? '#222' : '#ffd14f'); txt(g, 'DETECTED', w / 2, h * .53, 56, on ? '#222' : '#ffd14f'); txt(g, 'DESK BUDDY', w / 2, h * .8, 34, on ? '#333' : '#fff6c0', 700); },
    copy: (g, w, h, t) => { const u = Math.min(1, (t - 19.3) / 2.6); g.fillStyle = '#0c2a22'; g.fillRect(0, 0, w, h);
      if (u < 1) { txt(g, 'COPYING', w / 2, h * .22, 50, '#fff'); txt(g, 'YAWN' + '.'.repeat(1 + Math.floor(t * 4) % 3), w / 2, h * .4, 44, '#fff'); g.fillStyle = '#1d4a3a'; g.fillRect(170, h * .55, 300, 46); g.fillStyle = '#4dff9a'; g.fillRect(170, h * .55, 300 * u, 46); txt(g, Math.round(u * 100) + '%', w / 2, h * .84, 48, '#4dff9a'); }
      else { const k = Math.max(1, 1.5 - (t - 21.9) * 4); g.save(); g.translate(w / 2, h * .5); g.scale(k, k); g.rotate(-.05); txt(g, 'COPY', 0, -48, 70, '#4dff9a'); txt(g, 'READY ✓', 0, 34, 62, '#4dff9a'); g.restore(); } },
    close: (g, w, h, t) => { g.fillStyle = '#0c2a22'; g.fillRect(0, 0, w, h); txt(g, 'CLOSENESS', w / 2, h * .09, 36, '#fff');
      const rows = [['STRANGER', 1, '#9fb3c8'], ['FRIEND', 3, '#ffd14f'], ['DESK BUDDY', 5, '#ff7a9a']], hi = Math.min(2, Math.floor((t - 22.9) / .8));
      rows.forEach(([lab, n, col], i) => { const y = h * (.24 + i * .23), lit = i <= hi; txt(g, lab, w / 2, y, 28, lit ? col : '#3b5a50', 700);
        for (let b = 0; b < 5; b++) { g.fillStyle = b < n && lit ? col : '#1d4a3a'; g.fillRect(w / 2 - 125 + b * 52, y + 18, 44, 30); } });
      if (t > 25.0) { g.fillStyle = 'rgba(12,42,34,.85)'; g.fillRect(150, h * .82, 340, 60); txt(g, 'YAWN x3', w / 2, h * .9, 50, '#ff7a9a'); } },
    play: (g, w, h, t) => { g.fillStyle = '#3a0d1a'; g.fillRect(0, 0, w, h); txt(g, '▶ PLAYING', w / 2, h * .2, 48, '#ff7a9a'); txt(g, 'YAWN', w / 2, h * .4, 60, '#ff7a9a');
      g.strokeStyle = '#ff7a9a'; g.lineWidth = 6; g.beginPath(); for (let x = 170; x <= 470; x += 5) { const y = h * .66 + Math.sin(x * .07 + t * 9) * 36 * Math.sin((x - 170) / 300 * Math.PI); x === 170 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
      txt(g, 'AUTOPLAY ON', w / 2, h * .9, 30, '#fff', 700); },
  };
  // ---------- camera ----------
  const D2R = Math.PI / 180, GH = [-.9, 1.2, 3.2], HH = [.9, 1.2, 3.2], MID = [0, 1.15, 3.2], TH = [-.9, 1.6, -4.25];
  const shot = (tg, yaw, dist, y, frameH, o = {}) => { const a = yaw * D2R, p = [tg[0] - Math.sin(a) * dist, y, tg[2] - Math.cos(a) * dist], d = Math.hypot(p[0] - tg[0], p[1] - tg[1], p[2] - tg[2]);
    return { p, l: [tg[0], tg[1] + (o.ly ?? 0), tg[2]], fov: 2 * Math.atan(frameH / 2 / d) / D2R, ...o }; };
  const camera = [
    // B1: boring lecture
    { t: 0, p: [-.7, 1.6, -3.1], l: [-.9, 1.5, -4.6], fov: 36 },                    // HOOK: start on the teacher's face and pull back fast (the frame moves from frame 1)                    // the teacher droning, board behind
    { t: 1.95, p: [.2, 1.75, -1.3], l: [-.9, 1.4, -4.6], fov: 36, ease: 'out' },
    { t: 2.0, p: [2.7, 2.7, -3.9], l: [-.3, .8, 1.6], fov: 52, cut: true },            // dead-silent class, wide
    { t: 4.45, p: [1.6, 2.4, -2.3], l: [-.5, .9, 2.1], fov: 46, ease: 'io' },          // creep in over the silent class
    { t: 4.5, ...shot(GH, 12, 5.0, 2.0, 1.9, { cut: true }) },                          // "a kid at the back"
    { t: 5.95, ...shot(GH, 12, 4.6, 1.95, 1.45) },
    { t: 6.0, ...shot(GH, 20, 3.4, 1.75, 1.3, { ly: .15, cut: true, zoom: true }) },     // THE yawn: punch in
    { t: 8.3, ...shot(GH, 20, 3.4, 1.75, 1.0, { ly: .2, zoom: true, ease: 'out' }) },
    // B2: it spreads
    { t: 8.85, p: [-.35, 2.5, .2], l: [.6, 1.2, 3.3], fov: 36, cut: true },                // from his side, high over the row in front: she's turned to him, so her face + yawn read; him at the edge                        // the girl next to him
    { t: 10.85, p: [-.3, 2.45, .5], l: [.55, 1.2, 3.3], fov: 34 },
    { t: 10.9, p: [-1.9, 2.65, .9], l: [-2.7, 1.1, 3.3], fov: 46, cut: true },          // hold on the left kid's yawn...
    { t: 11.55, p: [-1.85, 2.65, .95], l: [-2.6, 1.1, 3.3], fov: 46 },          // pan along the back row          // the whole back row
    { t: 12.5, p: [1.9, 2.65, .9], l: [2.7, 1.1, 3.3], fov: 46, ease: 'io' },              // ...whip along the row to the right one
    { t: 12.55, p: [-1.6, 2.6, -.75], l: [-1.6, 1.1, 1.6], fov: 50, cut: true },          // pan along the row in front, over the next row's heads             // the row in front
    { t: 14.25, p: [1.6, 2.6, -.75], l: [1.6, 1.1, 1.6], fov: 50, ease: 'io' },
    { t: 14.3, p: [0, 2.5, 2.4], l: [-.5, 1.1, -2.5], fov: 52, cut: true },             // fly forward over the class...
    { t: 15.2, p: [-.5, 1.85, -1.8], l: [-.9, 1.5, -4.25], fov: 36, ease: 'io' },        // ...to the teacher, fighting it
    { t: 15.9, p: [-.55, 1.82, -2.0], l: [-.9, 1.52, -4.25], fov: 32 },
    { t: 15.95, ...shot(HH, 0, 1.2, 1.45, .7, { ly: .1, cut: true }) },                  // push into HER forehead
    { t: 16.5, p: [.9, 1.35, 2.98], l: [.9, 1.33, 3.3], fov: 32, ease: 'in' },
    // B3: Brain HQ
    { t: 16.55, p: R(1.3, 1.5, 1.75), l: R(-.1, 1.15, zF + .9), fov: 52, cut: true },      // Brain HQ wide (the room's own 'wide' spot): her at the console, screens ahead
    { t: 17.95, p: R(1.15, 1.45, 1.45), l: R(-.1, 1.15, zF + .9), fov: 50 },
    { t: 18.0, p: R(0, 1.42, -.5), l: R(0, 1.38, -1.36), fov: 52, cut: true },        // YAWN DETECTED
    { t: 19.25, p: R(0, 1.41, -.6), l: R(0, 1.38, -1.36), fov: 50 },
    { t: 19.3, p: R(-1.3, 1.5, 1.5), l: R(.1, 1.1, zF + .9), fov: 50, cut: true },          // over her other shoulder: she runs the copy on the screen          // she runs the copy
    { t: 20.9, p: R(-1.1, 1.45, 1.25), l: R(.1, 1.1, zF + .9), fov: 48 },
    { t: 20.95, p: R(0, 1.42, -.5), l: R(0, 1.38, -1.36), fov: 52, cut: true },      // COPY READY
    { t: 22.85, p: R(0, 1.41, -.6), l: R(0, 1.38, -1.36), fov: 50 },
    { t: 22.9, p: R(0, 1.42, -.45), l: R(0, 1.38, -1.36), fov: 54, cut: true },         // closeness meter
    { t: 26.3, p: R(0, 1.41, -.58), l: R(0, 1.38, -1.36), fov: 50 },
    { t: 26.35, p: R(1.6, 1.45, zF + 1.6), l: R(.5, 1.0, zF + 1.15), fov: 56, cut: true },   // the room's 'lever' spot: the lever drops, she grabs it       // the YAWN lever goes down by itself
    { t: 27.85, p: R(1.55, 1.45, zF + 1.55), l: R(.5, 1.0, zF + 1.15), fov: 53 },
    { t: 27.9, p: R(-.8, 1.4, -1.6), l: R(0, 1.27, -.4), fov: 42, cut: true, zoom: true },   // ...and she yawns
    { t: 30.5, p: R(-.7, 1.38, -1.45), l: R(0, 1.29, -.4), fov: 36, zoom: true, ease: 'out' },
    // B4: "pay attention"
    { t: 30.55, p: [-.3, 1.75, -1.6], l: [-.9, 1.45, -4.25], fov: 40, cut: true },
    { t: 32.4, p: [-.35, 1.72, -1.9], l: [-.9, 1.45, -4.25], fov: 36 },
    { t: 32.45, p: [-.85, 1.6, -2.5], l: [-.9, 1.55, -4.25], fov: 38, cut: true, zoom: true },   // pointing right at us
    { t: 34.5, p: [-.85, 1.6, -2.6], l: [-.9, 1.6, -4.25], fov: 32, zoom: true },
    { t: 34.55, p: [-.8, 1.55, -1.3], l: [-.9, 1.65, -4.25], fov: 52, cut: true, roll: .04 },   // THE TEACHER YAWNS: back far enough for the whole V   // THE TEACHER YAWNS
    { t: 36.4, p: [-.8, 1.55, -1.5], l: [-.9, 1.65, -4.25], fov: 48, roll: .04 },
    { t: 36.45, p: [0, 3.0, -1.2], l: [0, 1.15, 3.3], fov: 50, cut: true },           // the back row over everyone's heads: she laughs, he smirks, kids catch it again             // the back row: he smirks, she laughs, the kids catch it again              // the class: some catch it again, he smirks
    { t: 38.6, p: [0, 2.95, -.9], l: [0, 1.15, 3.3], fov: 47 },
  ];
  for (const k of camera) if (k.fov < 44 && !k.zoom && !k.scr) k.fov = Math.min(44, k.fov * 1.25);
  // Xavier 2026-10-22: 'the camera seems too close to them' -> every non-punch-in shot frames ~20% looser
  for (const k of camera) if (!k.zoom && !k.scr) k.fov = Math.min(64, k.fov * 1.2);
  // her eye windows: her POV at the moment he yawns (he's on her left)
  async function bake(renderer) {
    for (const a of [guy, teacher, ...npc]) a.update(7.3); rockAt(7.3);
    girl.A.root.visible = false; girl.A.root.updateMatrixWorld(true);
    const cam = new THREE.PerspectiveCamera(78, 2, .05, 200); cam.position.set(.9, 1.32, 3.18); cam.lookAt(-.6, 1.15, 3.1);
    const rt = new THREE.WebGLRenderTarget(1024, 512, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); girl.A.root.visible = true;
    B.setView(rt.texture);
  }
  function update(t) {
    rockAt(t);
    // straight-on screen inserts: she is between the camera and the screen, so she steps out of those frames
    op.A.root.visible = !((t >= 18 && t < 19.3) || (t >= 20.95 && t < 26.35));
    const scr = t < 16.8 ? SCR.calm : t < 19.3 ? SCR.detect : t < 22.9 ? SCR.copy : t < 26.35 ? SCR.close : SCR.play;
    const lever = t < 26.4 ? 1 : 1 - THREE.MathUtils.smoothstep(t, 26.4, 27.3);
    B.set({ screen: scr, lever, gauge: t < 26.4 ? .3 + .1 * Math.sin(t) : .95, alarm: 0, pulse: t > 16.6 && t < 30.5 ? (t * .9) % 1 : -1, t, hideCables: t >= 18 && t < 26.35 ? [0, 1, 2, 3] : [] });
  }
  return { cast: { guy, girl, op, teacher, ...Object.fromEntries(npc.map((n, i) => ['n' + i, n])) }, camera, update, bake, keep: [B.group] };
}
