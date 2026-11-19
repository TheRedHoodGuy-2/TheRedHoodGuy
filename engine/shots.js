// SHOT GRAMMAR (2026-11-19, research/gneef_camera.md + cinematography.md). Shots are described relative to a subject
// and turned into engine/camera.js cameraRig shots, sampled so the camera can follow a moving subject.
//   planShots([{ t, dur, size, angle, az, move, speed, side, follow, aimY }], subjectAt) -> cameraRig shots
//   size:  'wide' | 'full' | 'medium' | 'close' | 'xclose' | 'feet'      angle: 'eye' | 'low' | 'high' | 'top'
//   az:    degrees around the subject from its facing (0 = in front, 90 = its left, 180 = behind, -90 = its right)
//   move:  'push' | 'pull' | 'truckL' | 'truckR' | 'orbitL' | 'orbitR' | 'craneUp' | 'craneDown' | 'pan' (camera stays,
//          turns to follow) | 'track' (camera travels with the subject) | 'hold' (drift only) | 'punch' (fast push, then holds)
//   speed: 1 = Gneef median (push 7 %/s); his range is ~0.5 to 2.7 for pushes, pulls often 3+. VARY IT EVERY SHOT.
// subjectAt(t) -> { x, y, z, heading } (feet position + facing). validate() flags repeats (same move or size twice).
import * as THREE from 'three';

// frame heights are for OUR R6 (1.9 m with the hood up): full = head to toe with room, medium = waist up, close = chest up
const SIZE = { wide: { h: 5.2, fov: 46, y: 1.0 }, full: { h: 2.9, fov: 38, y: 1.0 }, medium: { h: 1.7, fov: 32, y: 1.35 },
  close: { h: 1.15, fov: 28, y: 1.58 }, xclose: { h: .6, fov: 26, y: 1.7 }, feet: { h: 1.35, fov: 36, y: .5 } };
const ANGLE = { eye: 0, low: -.55, high: .75, top: 2.2 };   // camera height offset (m, scaled by shot size)
const E = { out: u => 1 - (1 - u) ** 3, io: u => u < .5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2, lin: u => u };

export function planShots(list, subjectAt) {
  return list.map((s, i) => {
    const Z = SIZE[s.size || 'medium'], fov = s.fov || Z.fov, d0 = Z.h / (2 * Math.tan(fov * Math.PI / 360)), sp = s.speed ?? 1;
    const mv = s.move || 'push', T = s.dur, keys = [], N = Math.max(2, Math.ceil(T / .2));
    const ease = mv === 'punch' ? (u => E.out(Math.min(1, u / .3))) : mv.startsWith('orbit') || mv.startsWith('truck') ? E.io : E.out;
    const start = subjectAt(s.t, s);
    for (let k = 0; k <= N; k++) {
      const u = k / N, tt = s.t + u * T, e = ease(u), sub = (s.follow ?? (mv === 'track' || mv === 'push' || mv === 'pull' || mv === 'punch' || mv.startsWith('orbit') || mv.startsWith('truck'))) ? subjectAt(tt, s) : start;
      const look = subjectAt(tt, s);
      let dist = d0, az = (s.az ?? 30) * Math.PI / 180, lat = 0, hy = (ANGLE[s.angle || 'eye'] ?? 0) * Math.min(1.6, Z.h / 1.35);
      const rate = .07 * sp * T;                                   // fraction of the distance covered over the shot
      if (mv === 'push') dist *= 1 + Math.min(.45, rate) * (.5 - e);
      if (mv === 'punch') dist *= 1 + Math.min(.6, .45 * sp) * (1 - e) - .05 * u;
      if (mv === 'pull') dist *= 1 + Math.min(.7, rate * 1.2) * (e - .5);
      if (mv === 'truckL' || mv === 'truckR') lat = (mv === 'truckL' ? 1 : -1) * .16 * sp * T * dist * (e - .5);
      if (mv === 'orbitL' || mv === 'orbitR') az += (mv === 'orbitL' ? 1 : -1) * .35 * sp * (e - .5);
      if (mv === 'craneUp' || mv === 'craneDown') hy += (mv === 'craneUp' ? 1 : -1) * .9 * sp * (e - .5);
      const a = sub.heading + az, fx = Math.sin(a), fz = Math.cos(a);
      const p = [sub.x + fx * dist + fz * lat, (sub.y ?? 0) + Z.y + hy, sub.z + fz * dist - fx * lat];
      const l = [look.x + (s.aimX || 0), (look.y ?? 0) + (s.aimY ?? Z.y) + hy * .15, look.z + (s.aimZ || 0)];
      keys.push({ t: tt, p, l, fov });
    }
    return { t: s.t, keys, ease: 'linear', drift: s.drift ?? .6, focus: s.focus, spec: s };
  });
}

export function validate(list) {
  const bad = [];
  for (let i = 1; i < list.length; i++) {
    if (list[i].move === list[i - 1].move) bad.push(`shot ${i}: same move as before (${list[i].move})`);
    if ((list[i].size || 'medium') === (list[i - 1].size || 'medium') && (list[i].angle || 'eye') === (list[i - 1].angle || 'eye')) bad.push(`shot ${i}: same size + angle as before`);
    if (Math.abs((list[i].speed ?? 1) - (list[i - 1].speed ?? 1)) < .3) bad.push(`shot ${i}: same speed as before`);
  }
  return bad;
}
