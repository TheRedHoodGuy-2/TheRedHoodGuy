// ACT (2026-11-19): time-keyed acting for a whole video, so a scene file only lists WHO does WHAT WHEN.
//   const S = stage(scene)
//   const boy = await S.actor('boy', { emo: 'neutral' })                    cast key -> actor (hidden outside its spans)
//   boy.show(t0, t1) ...                                                    visible spans (cuts hide people not in the shot)
//   boy.key(t, { pose, at: [x, z], ry, y, glide, dur })                     pose keys (pose = name | object | fn(t, ctx) -> pose)
//   boy.run(t, path, { step, T, style, arm, lead })                         walk / run with planted feet (engine/walk.js + footLock)
//   boy.face(t, emo) / boy.talk(s, e) / boy.blinks([...])                   faces (sprite sets or the AltiWyre set)
//   S.swap(oldActor, newActor, t, fx)                                       gender swap: puff hides the switch
//   S.update(t) every frame (pure function of t, render order)
// Poses are in the avatar frame (engine/rig.js); `at` + ry place the actor on the ground (y from opts.ground(x, z)).
import * as THREE from 'three';
import { makeActor, loadAlti, altiLayers, altiAll, ALTI_PLACE } from './cast.js';
import { walkPlan, footLock } from './walk.js';
import { partChannels, REST } from './poses.js';
import { AI_PLACE, EMOTIONS } from './faceset.js';

const PARTS = ['armL', 'armR', 'legL', 'legR', 'head'], ROOT = ['x', 'y', 'z', 'rx', 'ry', 'rz'];
const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
const back = u => { if (u <= 0) return 0; if (u >= 1) return 1; const c = 1.25; return 1 + (c + 1) * (u - 1) ** 3 + c * (u - 1) ** 2; };   // soft overshoot
export function chans(p) { const o = {}; for (const n of PARTS) o[n] = partChannels(n, p?.[n] ?? REST[n]); o.root = { ...REST.root, ...(p?.root || {}) }; return o; }
export function mixC(a, b, k) { const o = {}; for (const n of PARTS) o[n] = a[n].map((v, i) => v + (b[n][i] - v) * k); o.root = {}; for (const c of ROOT) o.root[c] = (a.root[c] || 0) + ((b.root[c] || 0) - (a.root[c] || 0)) * k; return o; }
const toPose = c => { const o = { root: c.root }; for (const n of PARTS) o[n] = { r: c[n].slice(0, 3), p: c[n].slice(3, 6), o: c[n].slice(6, 9) }; return o; };
const cellOf = e => { const i = Math.max(0, EMOTIONS.indexOf(e)); return (i < 16 ? 'A' : 'B') + String(i + 1).padStart(2, '0'); };
const ROW = { neutral: ['E', 0], bored: ['E', 0], determined: ['E', 0], happy: ['E', 1], laugh: ['E', 1], excited: ['E', 1], proud: ['E', 1], sad: ['E', 2], crying: ['E', 2],
  angry: ['E', 3], furious: ['E', 3], annoyed: ['E', 3], smug: ['F', 0], evil: ['F', 0], suspicious: ['F', 0], scared: ['F', 1], nervous: ['F', 1], terrified: ['F', 1], shocked: ['F', 2], surprised: ['F', 2] };

export function stage(scene, { POSES = {}, ground = () => 0, flap = null } = {}) {
  const actors = [], fxs = [];
  const S = { actors, POSES };
  S.actor = async (key, o = {}) => {
    const a = await makeActor(key, o); a.root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); scene.add(a.root);
    const A = { a, key, keys: [], runs: [], spans: [], faceK: [[-99, o.emo || 'neutral']], talks: [], blinkT: [], memo: {}, lift: o.lift || 0, extra: o.extra || null };
    const fs = String(a.char.faceSet || '');
    A.kind = fs.startsWith('alti') ? 'alti' : fs.startsWith('ai:') ? 'ai' : 'static';
    if (A.kind === 'alti') { await loadAlti(); await a.preloadFace(await altiAll()); }
    if (A.kind === 'ai') { const st = fs.split(':')[1], D = `assets/faces/sprites/${st}`, M = 'assets/faces/sprites/05_intimidating', u = [];
      for (const e of EMOTIONS) u.push(`${D}/${cellOf(e)}.png`, `${D}/${cellOf(e)}e.png`); u.push(`${D}/D02.png`, `${D}/D03.png`);
      for (let i = 1; i <= 16; i++) u.push(`${M}/E${String(i).padStart(2, '0')}.png`, `${M}/F${String(i).padStart(2, '0')}.png`); A.st = st; await a.preloadFace(u); }
    A.show = (t0, t1) => { A.spans.push([t0, t1]); return A; };
    A.key = (t, k) => { A.keys.push({ t, ...k }); A.keys.sort((x, y) => x.t - y.t); return A; };
    A.run = (t, path, r = {}) => { const L = a.rig.pivot('legL').y; const plan = walkPlan({ path, t0: t, step: r.step ?? .6, T: r.T ?? .5, L, arm: r.arm ?? .85, style: r.style || {}, lead: r.lead || 'L' });
      A.runs.push({ plan, hold: r.hold ?? 99, after: r.after }); return plan; };
    A.face = (t, emo) => { A.faceK.push([t, emo]); A.faceK.sort((x, y) => x[0] - y[0]); return A; };
    A.talk = (s, e) => { A.talks.push([s, e]); return A; };
    A.blinks = ts => { A.blinkT.push(...ts); return A; };
    actors.push(A); return A;
  };
  // gender-swap puff: soft white clouds burst out round the body and fade; the old body hides at t, the new one appears
  const puffTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.55, 'rgba(255,255,255,.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  S.swap = (A, B, t, { dur = .55 } = {}) => {
    A.spans = A.spans.map(([s, e]) => [s, Math.min(e, t)]); B.spans = B.spans.map(([s, e]) => [Math.max(s, t), e]);
    const G = new THREE.Group(), N = 22, parts = []; for (let i = 0; i < N; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false })); G.add(m);
      const a = i / N * Math.PI * 2 + Math.sin(i * 7.1), h = .2 + (i * .618 % 1) * 1.6; parts.push({ m, d: new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), h, s: .3 + (i * .37 % 1) * .3 }); }
    scene.add(G); G.visible = false; fxs.push({ G, parts, t, dur, who: B });
  };
  const visible = (A, t) => A.spans.length === 0 || A.spans.some(([s, e]) => t >= s && t < e);
  function poseAt(A, t) {
    const K = A.keys; if (!K.length) return { c: chans({}), at: [0, 0], ry: 0 };
    let i = 0; while (i + 1 < K.length && K[i + 1].t <= t) i++;
    const cur = K[i], prev = K[Math.max(0, i - 1)], get = k => chans(typeof k.pose === 'function' ? k.pose(t, A) : (typeof k.pose === 'string' ? POSES[k.pose] : k.pose) || {});
    const dur = cur.dur ?? .32, u = Math.min(1, Math.max(0, (t - cur.t) / dur)), k = i === 0 ? 1 : (cur.ease === 'io' ? ease(u) : back(u));
    const c = i === 0 ? get(cur) : mixC(get(prev), get(cur), k);
    let at = cur.at, ry = cur.ry, yy = cur.y; for (let j = i; j >= 0 && (at == null || ry == null); j--) { if (at == null && K[j].at) yy ??= K[j].y ?? 0; at ??= K[j].at; ry ??= K[j].ry; }   // y comes with the key that placed the actor (2026-11-25: a bed key without y dropped him to the floor)
    if (cur.glide && cur.at && i > 0) { let pa = null; for (let j = i - 1; j >= 0 && !pa; j--) pa = K[j].at; if (pa) { const g = ease(Math.min(1, (t - cur.t) / cur.glide)); at = pa.map((v, n) => v + (cur.at[n] - v) * g); } }
    if (cur.turn != null && i > 0) { let pr = null; for (let j = i - 1; j >= 0 && pr == null; j--) pr = K[j].ry; if (pr != null) ry = pr + (ry - pr) * ease(Math.min(1, (t - cur.t) / cur.turn)); }
    return { c, at: at || [0, 0], ry: ry || 0, y: yy ?? 0 };
  }
  S.update = t => {
    for (const A of actors) {
      const on = visible(A, t); A.a.root.visible = on; if (!on) continue;
      const R = A.runs.filter(r => t >= r.plan.t0 && t <= r.plan.t1 + .02).pop(), P = poseAt(A, t);
      // keys that come after a run start where the run ended (a key without `at` inherits it)
      let at = P.at, ry = P.ry, c = P.c, walking = null;
      if (R) { const s = R.plan.at(t); walking = s; const wc = chans(s.pose);
        // upper body may be overridden by the key track while running (e.g. the tagging arm): keys with `upper`
        const kk = A.keys.filter(k => k.t <= t && k.upper).pop(); if (kk && t - kk.t < (kk.hold ?? .6)) { const uc = chans(typeof kk.pose === 'function' ? kk.pose(t, A) : POSES[kk.pose] || kk.pose); for (const n of ['armL', 'armR', 'head']) wc[n] = uc[n]; }
        c = wc; at = [s.x, s.z]; ry = s.heading; }
      else { const last = A.runs.filter(r => t > r.plan.t1).pop(); if (last && (!A.keys.some(k => k.t > last.plan.t1 - .01 && k.t <= t && k.at))) { const e = last.plan.at(last.plan.t1); at = [e.x, e.z]; if (!A.keys.some(k => k.t > last.plan.t1 - .01 && k.t <= t && k.ry != null)) ry = e.heading; } }
      // breathing / sway on holds (never frozen)
      if (!walking) { c = { ...c, root: { ...c.root, rz: c.root.rz + Math.sin(t * 1.3 + actors.indexOf(A) * 1.7) * .012, y: c.root.y + Math.sin(t * 2.1 + actors.indexOf(A)) * .004 }, head: c.head.map((v, i) => i === 0 ? v + Math.sin(t * .7 + 1) * .03 : v) }; }
      const pose = toPose(c); A.a.rig.pose(pose);
      const r = pose.root, gy = ground(at[0], at[1]) + A.lift + (P.y || 0), cs = Math.cos(ry), sn = Math.sin(ry);
      A.a.root.position.set(at[0] + cs * r.x + sn * r.z, gy + r.y, at[1] - sn * r.x + cs * r.z); A.a.root.rotation.y = ry + (r.ry || 0);
      if (walking) footLock(A.a, walking, gy, A.memo); else A.memo.key = null;
      if (A.extra) A.extra(t, A);
      faceUpdate(A, t);
    }
    for (const f of fxs) { const u = (t - f.t + .18) / f.dur; f.G.visible = u > 0 && u < 1; if (!f.G.visible) continue;
      const p = f.who.a.root.position; f.G.position.set(p.x, p.y, p.z);
      for (const q of f.parts) { const r = .3 + .45 * Math.sqrt(u); q.m.position.set(q.d.x * r, q.h + u * .3, q.d.z * r); q.m.scale.setScalar(q.s * .62 * (.6 + u * .9)); q.m.material.opacity = .85 * (u < .25 ? u / .25 : Math.max(0, 1 - (u - .25) / .75)); } }
  };
  function faceUpdate(A, t) {
    if (A.kind === 'static') return;
    let emo = 'neutral'; for (const [tt, e] of A.faceK) if (t >= tt) emo = e;
    const speaking = A.talks.some(([s, e]) => t >= s - .03 && t <= e + .03), st = speaking && flap ? (flap(t) || 0) : 0;
    const blink = A.blinkT.some(b => t >= b && t < b + .14) || A.faceK.some(([tt]) => tt > 0 && t >= tt && t < tt + .07);
    if (A.kind === 'alti') { A.a.faceNow(altiLayers(emo, { talk: st, blink: blink && !speaking }), ALTI_PLACE); return; }
    const D = `assets/faces/sprites/${A.st}`, M = 'assets/faces/sprites/05_intimidating', E = cellOf(emo), [sh, row] = ROW[emo] || ['E', 0], mdy = A.st === '05_intimidating' ? 0 : -18;
    const eyes = blink ? `${D}/D03.png` : `${D}/${E}e.png`;
    const layers = st ? [eyes, { u: `${M}/${sh}${String(row * 4 + 1 + st).padStart(2, '0')}.png`, dy: mdy }] : blink ? [eyes, { u: `${M}/${sh}${String(row * 4 + 1).padStart(2, '0')}.png`, dy: mdy }] : [`${D}/${E}.png`];
    A.a.faceNow(layers, AI_PLACE[A.st] || {});
  }
  return S;
}
