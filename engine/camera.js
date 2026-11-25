// CAMERA SYSTEM (2026-11-19). Xavier's camera rules: the eye always has something to follow; the camera is NEVER still;
// one clear focus per shot; buttery-smooth moves (motion curves, no linear starts / stops); one continuous path where it
// can be; scene changes = a 0.25 s dissolve (or a hard cut, Gneef-style, inside a scene); the camera reacts to the story
// (a hit on a table shakes it).
//
//   const C = cameraRig([
//     { t: 0,   keys: [{ t: 0, p: [x,y,z], l: [x,y,z], fov: 50 }, { t: 3, p, l, ease: 'io' }] },
//     { t: 3,   in: 'dissolve', keys: [...] },            // in: 'cut' (default) | 'dissolve' (0.25 s, or dissolve: secs)
//   ], { shakes: [{ t: 6.2, amp: 1, dur: .5 }], drift: 1 })
//   C.apply(camera, t) -> { shot, mix: null | { from: shotIndex, k } }   (mix = draw the previous shot too and blend)
//   C.applyShot(camera, i, t)  (one shot's camera at time t, used for the outgoing half of a dissolve)
//
// Inside a shot the camera position and look point travel along centripetal Catmull-Rom splines through the keys (no
// corners), timed by ONE ease curve per shot ('glide' default = short ease in, steady cruise, short ease out; 'io' = slow start and stop, 'in', 'out', 'linear', or [x1,y1,x2,y2]
// cubic-bezier handles like a graph editor). On top: a slow organic drift (a few cm, so a held frame still breathes)
// and shakes (trauma that decays; rotation only, so the framing survives).
import * as THREE from 'three';

const EASE = {
  linear: t => t,
  in: t => t * t * t,
  out: t => 1 - (1 - t) ** 3,
  io: t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2,
  soft: t => t * t * (3 - 2 * t),   // gentle smoothstep
  glide: t => { const a = .22, v = 1 / (1 - a); return t < a ? v * t * t / (2 * a) : t > 1 - a ? 1 - v * (1 - t) ** 2 / (2 * a) : v * (t - a / 2); },   // quick ease in, constant cruise, ease out: the default for camera moves
};
// cubic-bezier timing (CSS / graph-editor handles), solved by Newton steps
function bezier([x1, y1, x2, y2]) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const X = s => ((ax * s + bx) * s + cx) * s, Y = s => ((ay * s + by) * s + cy) * s, dX = s => (3 * ax * s + 2 * bx) * s + cx;
  return t => { let s = t; for (let i = 0; i < 6; i++) { const d = dX(s); if (Math.abs(d) < 1e-6) break; s -= (X(s) - t) / d; } return Y(Math.min(1, Math.max(0, s))); };
}
const easeFn = e => Array.isArray(e) ? bezier(e) : (EASE[e] || EASE.io);
// smooth value noise for drift / shake
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const noise = t => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return (hash(i) * (1 - u) + hash(i + 1) * u) * 2 - 1; };

export function cameraRig(shots, o = {}) {
  const S = shots.map((s, i) => {
    const keys = s.keys.map(k => ({ ...k, P: new THREE.Vector3(...k.p), L: new THREE.Vector3(...k.l) }));
    const P = keys.length > 1 ? new THREE.CatmullRomCurve3(keys.map(k => k.P), false, 'centripetal') : null, L = keys.length > 1 ? new THREE.CatmullRomCurve3(keys.map(k => k.L), false, 'centripetal') : null;
    // spline parameter at each key (by arc length so speed follows the ease curve, not the key spacing)
    const u = []; if (P) { const lens = P.getLengths(keys.length * 40), tot = lens[lens.length - 1] || 1; for (let k = 0; k < keys.length; k++) u.push(k / (keys.length - 1)); u.tot = tot; }
    return { ...s, i, keys, P, L, u, t0: s.t, t1: shots[i + 1]?.t ?? Infinity, dissolve: s.in === 'dissolve' ? (s.dissolve || .25) : 0 };
  });
  const shakes = o.shakes || [], drift = o.drift ?? 1;
  const at = t => { let i = 0; while (i + 1 < S.length && t >= S[i + 1].t0) i++; return i; };
  function applyShot(cam, i, t) {
    const s = S[i], K = s.keys; let p, l, fov = K[0].fov ?? 45, roll = K[0].roll ?? 0;
    const lt = t - s.t0;   // keys are in shot time if s.local, else absolute
    const tt = s.local ? lt : t;
    if (!s.P || tt <= K[0].t) { p = K[0].P.clone(); l = K[0].L.clone(); }
    else if (tt >= K[K.length - 1].t) { const k = K[K.length - 1]; p = k.P.clone(); l = k.L.clone(); fov = k.fov ?? fov; roll = k.roll ?? roll; }
    else {
      // ONE ease over the whole shot (a glide only slows at its very start and end, never at a middle key), then the
      // eased time is spread over the keys by their times
      const T0 = K[0].t, T1 = K[K.length - 1].t, g = T0 + (T1 - T0) * easeFn(s.ease || K[K.length - 1].ease || 'glide')((tt - T0) / (T1 - T0));
      let j = 0; while (j < K.length - 2 && g > K[j + 1].t) j++; const a = K[j], b = K[j + 1], f = Math.min(1, Math.max(0, (g - a.t) / (b.t - a.t))), uu = s.u[j] + (s.u[j + 1] - s.u[j]) * f;
      p = s.P.getPoint(uu); l = s.L.getPoint(uu); fov = (a.fov ?? fov) + ((b.fov ?? a.fov ?? fov) - (a.fov ?? fov)) * f; roll = (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * f; }
    // never still: a slow drift (position ~2-3 cm, look ~1.5 cm), different per shot
    if (drift) { const d = drift * (s.drift ?? 1), q = i * 13.7, n2 = (f, o) => noise(t * f + q + o) + .45 * noise(t * f * 3.1 + q + o + 50);   // handheld: slow sway + ~1 Hz wobble (2026-11-25 ref: 2.5x our old drift)
      p.x += .06 * d * n2(.35, 0); p.y += .045 * d * n2(.3, 5); p.z += .06 * d * n2(.33, 9); l.x += .04 * d * n2(.4, 2); l.y += .03 * d * n2(.37, 7); }
    cam.position.copy(p); cam.up.set(0, 1, 0); cam.lookAt(l); if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
    // reactive shake: trauma decays, rotation jitter scales with trauma squared (game-feel standard)
    let tr = 0; for (const sk of shakes) { const dt = t - sk.t; if (dt >= 0 && dt < sk.dur) tr = Math.max(tr, (sk.amp ?? 1) * (1 - dt / sk.dur)); }
    if (tr > 0) { const k = tr * tr, f = 22; cam.rotateX(.035 * k * noise(t * f + 1)); cam.rotateY(.035 * k * noise(t * f + 31)); cam.rotateZ(.05 * k * noise(t * f + 61)); }
    if (roll) cam.rotateZ(roll);
    cam.updateMatrixWorld(true);
    return s;
  }
  function apply(cam, t) { const i = at(t), s = applyShot(cam, i, t); const mix = s.dissolve && i > 0 && t < s.t0 + s.dissolve ? { from: i - 1, k: EASE.soft((t - s.t0) / s.dissolve) } : null; return { shot: i, mix }; }
  return { apply, applyShot, shots: S, focusAt: t => { const i = at(t); const s = S[i]; const cam = new THREE.PerspectiveCamera(); applyShot(cam, i, t); return s; } };
}
