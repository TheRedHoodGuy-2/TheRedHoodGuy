// ACTOR: springy, overlapping, always-alive motion for R6 rigs (kit/roblox.js). Pure function of t.
//
//   const act = actor(A, { seed, skin })
//   act.keys = [ { t: 0, pose: 'sit', expr: 'bored', at: [x, y, z], face: angle },
//                { t: 1.4, pose: 'tickleRibs', expr: 'neutral', snap: 1.3, bounce: .4 }, ... ]
//   act.update(t)
//
// (v2) How it moves: see the MOVING HOLD / MAIN MOVE notes in update(). Old notes: every channel (each limb direction, head, root offset) is the sum of spring STEP RESPONSES, one per key:
// value(t) = rest + sum_k delta_k * step(t - t_k - delay_part). An underdamped spring step overshoots ~15% and settles in
// ~0.25 s, so poses snap in fast and bounce. Different parts get different delays (hips first, head and arms lag), which
// gives overlapping action. A small opposite step just before each key gives anticipation. A breathing / sway layer runs
// underneath so nothing is ever frozen. Keys may set `walk: true` (legs + arms swing until the next key).
// Faces: expression changes pop (quick squash) and every expression change and a random 3-4 s cadence trigger a blink.
import * as THREE from 'three';
import { REST, poseOf, partChannels, mirrorPose } from './poses.js';

// RUN CYCLE key poses (R6 run-cycle tut): +z = forward, legs/arms are directions. Frame 0 contact (front arm reaching
// out, back arm exaggerated back, right leg forward, back leg already in the air), 5 down (lowest, angled down, front arm
// in to the torso, back arm swung down + forward), 10 passing (back leg raised high), 15 up (highest). 20-35 = X-flip.
const RUN_KEYS = [
  { armL: [.12, -.25, .96], armR: [-.1, -.35, -.93], legL: [.04, -.55, -.83], legR: [-.04, -.72, .69], root: { y: -.02, rx: .32, ry: -.08, rz: 0 } },
  { armL: [.08, -.72, .69], armR: [-.06, -.82, -.57], legL: [.04, -.32, -.95], legR: [-.04, -.97, .25], root: { y: -.08, rx: .4, ry: -.05, rz: .02 } },
  { armL: [.06, -.98, .18], armR: [-.06, -.98, -.18], legL: [.04, -.62, -.6], legR: [-.04, -1, -.08], root: { y: -.02, rx: .32, ry: 0, rz: .02 } },
  { armL: [.08, -.55, -.83], armR: [-.08, -.55, .83], legL: [.04, -.52, .85], legR: [-.04, -.78, -.62], root: { y: .06, rx: .27, ry: .06, rz: 0 } },
];
let RUN_C = null;
function runCycle() {
  if (RUN_C) return RUN_C;
  const ch = p => { const o = { root: { x: 0, z: 0, y: 0, rx: 0, ry: 0, rz: 0, ...p.root } }; for (const k of ['armL', 'armR', 'legL', 'legR']) o[k] = partChannels(k, p[k]); return o; };
  return (RUN_C = [...RUN_KEYS, ...RUN_KEYS.map(mirrorPose)].map(ch));
}

const DELAY = { root: 0, legL: .02, legR: .03, head: .05, armL: .07, armR: .085 };
export function springStep(tau, w = 19, z = .45) {
  if (tau <= 0) return 0; const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
const VEC = ['armL', 'armR', 'legL', 'legR', 'head'], ROOTK = ['x', 'y', 'z', 'rx', 'ry', 'rz'];
function full(p) {   // a pose resolved against REST into flat channels
  const P = poseOf(p), o = {};
  for (const k of VEC) o[k] = partChannels(k, P[k] || REST[k]);   // 9 channels: rotation vector, pivot shift, offset
  o.root = { ...REST.root, ...(P.root || {}) };
  return o;
}
// MAIN-MOVE CURVES (the graph editor, in code). A key's `ease` picks the F-curve of its move:
//   'back' (default: fast start, soft overshoot), 'io' (slow in, slow out), 'out' (snap then glide), 'in' (wind up then hit),
//   'linear', or [x1, y1, x2, y2] = a cubic bezier with handles like a graph editor (y outside 0..1 = overshoot).
function bezier(x1, y1, x2, y2) {
  const c = (a, b, u) => 3 * a * u * (1 - u) ** 2 + 3 * b * u * u * (1 - u) + u ** 3;
  return x => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, u = x; for (let i = 0; i < 24; i++) { u = (lo + hi) / 2; if (c(x1, x2, u) < x) lo = u; else hi = u; } return c(y1, y2, u); };
}
const CURVES = { io: bezier(.42, 0, .58, 1), out: bezier(.16, 1, .3, 1), in: bezier(.6, 0, .9, .4), linear: x => x };
const curveOf = e => Array.isArray(e) ? (e._f || (e._f = bezier(...e))) : CURVES[e];
export const FPS = 24;
function rngOf(seed) { let s = (Math.imul(seed | 0, 2654435761) ^ 0x9e3779b9) >>> 0 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

export function actor(A, { seed = 1, getFace, blinkFace } = {}) {
  const R = rngOf(seed), blinkTimes = []; for (let t = .8 + R() * 2; t < 600; t += 2.6 + R() * 2.2) blinkTimes.push(t);
  const api = { A, keys: [], base: { pos: new THREE.Vector3(), face: 0 }, visible: true, idle: 1 };
  let curFace = null;
  api.update = function (tIn) {
    const K = api.keys; A.reset();
    if (!K.length) return;
    // STEPPED (Spider-Verse / stop-motion feel): hold each pose for `steps` frames at 24 fps, from a key that sets it
    let steps = api.steps || 0; for (const k of K) if (k.steps != null && tIn >= k.t) steps = k.steps;
    const t = steps > 1 ? Math.floor(tIn * FPS / steps) * steps / FPS : tIn;
    // ----- resolve every key into absolute channel targets (pose + placement), then sum spring steps -----
    // a pose's root x / z are in the AVATAR's frame (as posed in the editor: +z = forward): turn them by the facing
    // before adding the placement, so "slide toward the desk" means the same thing whichever way the actor faces
    const tg = K.map(k => full(k.pose));
    let px = 0, py = 0, pz = 0, pf = 0;
    // facing turns take the SHORT way round (Xavier 2026-11-13: angles were lerped raw, so a 30-degree turn written as
    // pi -> -2.8 spun the body ~330 degrees: every character "did 360s"). Each new facing is unwrapped next to the last one.
    let hasF = false;
    K.forEach((k, i) => { if (k.at) { px = k.at[0]; py = k.at[1]; pz = k.at[2]; }
      if (k.face != null) { let f = k.face; if (hasF) { while (f - pf > Math.PI) f -= 2 * Math.PI; while (f - pf < -Math.PI) f += 2 * Math.PI; } pf = f; hasF = true; }
      const r = tg[i].root, lx = r.x, lz = r.z, c = Math.cos(pf), sn = Math.sin(pf);
      r.x = px + lx * c + lz * sn; r.z = pz - lx * sn + lz * c; r.y += py; r.ry += pf; });
    const v = full(K[0].pose); Object.assign(v, JSON.parse(JSON.stringify(tg[0])));
    // Each change of pose is a curve g(t) going 0 -> 1. It is made of two parts so nothing ever sits still:
    //  * a MOVING HOLD: while the previous pose is held, the body already drifts ~15% of the way toward the next pose
    //    (and keeps the idle layer on top), so a hold is a slow push, not a freeze;
    //  * the MAIN MOVE: an eased swing with a small anticipation dip and a soft overshoot (style 'ease', default), or a
    //    hard spring snap (style 'snap': only for impacts, jumps, scares). Parts start at different times (overlap).
    for (let i = 1; i < K.length; i++) {
      const k = K[i]; if (t < (K[i - 1].t) - .2) break;
      const a = tg[i - 1], b = tg[i], prev = K[i - 1], dur = k.dur ?? .42, holdFrac = k.hold ?? .15;
      const holdStart = prev.t + (prev.dur ?? .42), holdEnd = k.t, snap = k.style === 'snap';
      const g = part => {
        const tau = t - k.t - DELAY[part] * (dur / .42);
        const hl = holdEnd - holdStart > .05 ? Math.min(1, Math.max(0, (t - holdStart) / (holdEnd - holdStart))) : (t >= holdEnd ? 1 : 0), hold = holdFrac * (hl * hl * (3 - 2 * hl));
        let mv;
        if (snap) mv = springStep(tau, 19 * (k.snap ?? 1.2), k.bounce ?? .4);
        else { const u = Math.min(1, Math.max(0, tau / dur)), os = k.overshoot ?? .08, cf = k.ease && k.ease !== 'back' ? curveOf(k.ease) : null;
          mv = u <= 0 ? 0 : cf ? cf(u) : 1 + (os ? (1 + os * 9) * Math.pow(u - 1, 3) + os * 9 * Math.pow(u - 1, 2) : Math.pow(u - 1, 3));   // default ease-out-back: fast start, soft overshoot, glide to rest
          const an = k.antic ?? .06, ua = Math.min(1, Math.max(0, (tau + .12) / .12)); if (tau < 0) mv -= an * Math.sin(Math.PI * ua) * .5; }
        return hold + (1 - holdFrac) * mv;
      };
      const S = (part, d) => d * g(part);
      for (const p of VEC) for (let c = 0; c < 9; c++) v[p][c] += S(p, b[p][c] - a[p][c]);
      for (const c of ROOTK) v.root[c] += S('root', b.root[c] - a.root[c]) * (k.glide && ['x', 'z'].includes(c) ? 0 : 1);
      if (k.glide) for (const c of ['x', 'z']) { const u = Math.min(1, Math.max(0, (t - k.t) / k.glide)); v.root[c] += (b.root[c] - a.root[c]) * (u * u * (3 - 2 * u)); }
    }
    // ----- active walk cycle (from the most recent key with walk) -----
    let walkAmp = 0, walkPh = 0;
    for (let i = 0; i < K.length; i++) if (K[i].walk && t >= K[i].t) { const end = K[i + 1] ? K[i + 1].t : 1e9; walkAmp = Math.min(1, (t - K[i].t) / .15) * Math.min(1, Math.max(0, (end - t) / .15)); walkPh = (t - K[i].t) * 2 * Math.PI * (K[i].cadence || 1.1); }
    // walk = contact -> down -> pass -> up, twice per cycle (one step each foot). Legs swing hardest through the pass and
    // hang at full stride on contact; the body is lowest just after contact (down) and highest after the pass (up); arms
    // swing against the legs, a couple of frames late; hips twist and the body leans into the walk.
    if (walkAmp > 0) { const ph = walkPh / (2 * Math.PI), sw = Math.cos(2 * Math.PI * ph), lag = Math.cos(2 * Math.PI * (ph - .06)), st = .62 * walkAmp;
      v.legL[0] -= sw * st; v.legR[0] += sw * st; v.armL[0] += lag * st * .85; v.armR[0] -= lag * st * .85;
      const bob = -Math.cos(4 * Math.PI * (ph - .1)); v.root.y += (bob * .022 - .012) * walkAmp; v.root.rx += .06 * walkAmp;
      v.root.ry += sw * .07 * walkAmp; v.root.rz += Math.sin(2 * Math.PI * ph) * .025 * walkAmp; v.head[1] -= sw * .05 * walkAmp; }
    // ----- RUN CYCLE (Xavier's run-cycle tut, 2026-10-28): a key with `run: true` runs until the next key -----
    // Built like the Blender R6 tut: 4 hand-made poses (contact 0, down 5, passing 10, up 15 of a 40-frame loop), the
    // other half is the same 4 X-flipped (20-35), and the loop is cyclic (no pause at the seam). `cycle` = seconds per
    // full loop (two steps). The run replaces arms + legs and adds the body lean / bob; the key's own pose keeps head,
    // facing and placement.
    let runAmp = 0, runPh = 0;
    for (let i = 0; i < K.length; i++) if (K[i].run && t >= K[i].t) { const end = K[i + 1] && !K[i + 1].run ? K[i + 1].t : 1e9; runAmp = Math.min(1, (t - K[i].t) / .08) * Math.min(1, Math.max(0, (end - t) / .1)); runPh = ((t - (K[i].runFrom ?? K[i].t)) / (K[i].cycle || .62)) % 1; }
    if (runAmp > 0) { const C = runCycle(), n8 = C.length, x = runPh * n8, i1 = Math.floor(x) % n8, u = x - Math.floor(x), i0 = (i1 + n8 - 1) % n8, i2 = (i1 + 1) % n8, i3 = (i1 + 2) % n8;
      const cr = (a, b, c, d) => .5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u);   // cyclic Catmull-Rom = Blender 'make cyclic' smooth loop
      for (const p of ['armL', 'armR', 'legL', 'legR']) for (let c = 0; c < 9; c++) v[p][c] += (cr(C[i0][p][c], C[i1][p][c], C[i2][p][c], C[i3][p][c]) - v[p][c]) * runAmp;
      for (const c of ['y', 'rx', 'ry', 'rz']) v.root[c] += cr(C[i0].root[c], C[i1].root[c], C[i2].root[c], C[i3].root[c]) * runAmp;
      v.head[0] -= cr(C[i0].root.rx, C[i1].root.rx, C[i2].root.rx, C[i3].root.rx) * .6 * runAmp; }   // head stays level, eyes ahead
    // ----- living idle: breathing, sway, little weight shifts -----
    const I = api.idle, ph = seed * 1.7, n = (f, o) => Math.sin(t * f + ph * o) * .6 + Math.sin(t * f * 2.31 + ph * o * 1.7) * .3 + Math.sin(t * f * 4.7 + o) * .1;
    v.root.y += n(2.0, 1) * .008 * I; v.root.rz += n(.8, 2) * .02 * I; v.root.rx += n(1.1, 3) * .018 * I; v.root.ry += n(.6, 4) * .03 * I;
    // (channels are rotation vectors: [0] = about x (swing fwd is negative), [1] = about y (turn), [2] = about z (spread / tilt))
    v.head[1] += n(.65, 5) * .1 * I; v.head[0] += n(.9, 6) * .05 * I; v.head[2] += n(.75, 7) * .05 * I;
    for (const [p, o] of [['armL', 8], ['armR', 9]]) { v[p][2] += n(1.2, o) * .05 * I; v[p][0] -= n(1.5, o + 1) * .07 * I; }
    for (const [p, o] of [['legL', 11], ['legR', 12]]) v[p][0] -= n(.9, o) * .03 * I;
    // ----- apply: root first (limb() works in world space), then limbs, then head -----
    const r = v.root; A.root.position.set(r.x, r.y, r.z); A.root.rotation.set(r.rx, r.ry, r.rz, 'YXZ'); A.root.visible = api.visible;
    for (const p of VEC) A.part(p, { r: v[p].slice(0, 3), p: v[p].slice(3, 6), o: v[p].slice(6, 9) });
    // ----- face: expression at t, pop on change, blinks -----
    if (A.setExpression && getFace) {
      let ex = K[0].expr || 'neutral', exT = K[0].t; for (const k of K) if (k.expr && t >= k.t) { ex = k.expr; exT = k.t; }
      const sinceEx = t - exT, blink = (sinceEx >= 0 && sinceEx < .1) || blinkTimes.some(b => t >= b && t < b + .11) || (api.holdBlinks || []).some(([b, d]) => t >= b && t < b + d);   // holdBlinks: [[t, dur]] story blinks (2026-11-14)
      // LIP SYNC: api.talk = [{ s, e, w }] word spans; inside a word the mouth steps through visemes from its letters
      // (the face keeps the current expression's eyes: getFace('stern+vA')). Viseme changes never pop or blink.
      let exF = ex; if (api.talk && !blink) { const wd = api.talk.find(x => t >= x.s && t < x.e); if (wd) { const vs = visemesOf(wd.w), i = Math.min(vs.length - 1, Math.floor((t - wd.s) / (wd.e - wd.s) * vs.length)); exF = ex + '+' + vs[i]; } }
      const want = blink && blinkFace ? blinkFace(ex) : getFace(exF); if (want !== curFace) { { const fu = A.face.userData; fu.basic = fu.basic || A.face.material;   // photo faces get a LIT material (shading + normal map = depth); drawn faces stay unlit ink
          if (want.userData && want.userData.photo) { fu.lit = fu.lit || new THREE.MeshStandardMaterial({ transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, roughness: .55, metalness: 0 });
            A.face.material = fu.lit; fu.lit.map = want; fu.lit.normalMap = want.userData.normal || null; fu.lit.normalScale.set(1, 1); }
          else A.face.material = fu.basic;
          A.face.material.map = want; A.face.material.needsUpdate = true; } curFace = want; }
      const pop = sinceEx >= 0 && sinceEx < .35 ? 1 + .07 * Math.exp(-sinceEx * 14) * Math.cos(sinceEx * 30) : 1; const s0 = A.face.userData.s0 || (A.face.userData.s0 = A.face.scale.clone()); A.face.scale.set(s0.x * pop, s0.y * (2 - pop), s0.z);   // relative to the face's own scale (the head bone is scaled 1/3: setting 1 shrank every face to a third)
    }
  };
  return api;
}
// letters -> mouth shapes for lip sync (vowels open, m/b/p closed, f/v teeth, l tongue), repeats collapsed
const VIS = { a: 'vA', e: 'vE', i: 'vE', y: 'vE', o: 'vO', u: 'vU', w: 'vU', m: 'vM', b: 'vM', p: 'vM', f: 'vF', v: 'vF', l: 'vL' };
function visemesOf(w) { const out = []; for (const ch of w.toLowerCase()) { const v = VIS[ch]; if (v && v !== out[out.length - 1]) out.push(v); } return out.length ? out : ['vA']; }
