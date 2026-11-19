// FACE STYLE PACKS (2026-11-19, Xavier 04:29). For each dynamic-head face he picked, the face is drawn in its own style
// and then every expression is drawn in the SAME style (same eye construction, line weight, lashes, blush, mouth family),
// like Roblox's Woman Face vs Side Eye Woman Face. Our own drawings in each style, not traced copies.
// Everything is drawn in SCREEN space (the canvas is flipped back because the head decal mirrors it).
// Geometry is written in the units measured from the catalogue thumbnails (research/dynfaces/comps.json):
//   x = "linear" units from the head centre (1118 per head width near the middle), y = canvas y before the head fit.
// X() / Y() convert them to decal pixels (calibrated with assets/_calib_face.png on our R6 head).
// faceCanvas4(styleId, emotion | 'own:<i>', sex) -> 1024 canvas.
const CX = 512, INK = '#141110';
const XT = [[0, 0], [100, 100], [200, 202], [300, 315], [350, 380], [400, 450], [450, 530], [480, 588], [500, 640], [560, 760]];
const X = v => { const a = Math.abs(v); for (let i = 1; i < XT.length; i++) if (a <= XT[i][0] || i === XT.length - 1) { const [x0, y0] = XT[i - 1], [x1, y1] = XT[i]; return Math.sign(v) * (y0 + (y1 - y0) * (a - x0) / (x1 - x0)); } };
const Y = v => 192 + .962 * (v - 200);
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function taper(g, pts, w0, w1, col = INK) {
  const n = pts.length; if (n < 2) return; const L = [], R = [];
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = lerp(w0, w1, i / (n - 1)) / 2, nx = -dy / l * w, ny = dx / l * w; L.push([pts[i][0] + nx, pts[i][1] + ny]); R.push([pts[i][0] - nx, pts[i][1] - ny]); }
  g.fillStyle = col; g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fill();
  g.beginPath(); g.arc(pts[0][0], pts[0][1], w0 / 2, 0, 7); g.fill(); g.beginPath(); g.arc(pts[n - 1][0], pts[n - 1][1], w1 / 2, 0, 7); g.fill();
}
const qpts = (x0, y0, cx, cy, x1, y1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]; });
const cpts = (p0, p1, p2, p3, n = 32) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); });
const linep = (a, b, n = 16) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
const at = (pts, t) => pts[clamp(Math.round(t * (pts.length - 1)), 0, pts.length - 1)];
const offset = (pts, d) => pts.map((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [p[0] - dy / l * d, p[1] + dx / l * d]; });
function star(g, x, y, r, rot = -Math.PI / 2) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; i ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
function heart(g, x, y, r) { g.beginPath(); g.moveTo(x, y + r * .9); g.bezierCurveTo(x - r * 1.4, y - r * .1, x - r * .7, y - r * 1.1, x, y - r * .35); g.bezierCurveTo(x + r * .7, y - r * 1.1, x + r * 1.4, y - r * .1, x, y + r * .9); g.closePath(); }
const merge = (a = {}, b = {}) => { const o = { ...a }; for (const k in b) o[k] = (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) ? merge(a[k], b[k]) : b[k]; return o; };

// =================================================================== EYES
// P = resolved eye geometry for one side: x, y (centre), w (half width), h (top half height), plus the style options.
function eyeShape(P, s, E) {
  const o = E.open, t = E.tilt, sq = E.squint, { x, y, w, h } = P, b = P.b ?? .72;
  const inner = [x - s * w, y + (P.innerDy ?? .08) * h], outer = [x + s * w, y - t * h * .32 + (P.outerDy ?? 0) * h];
  const topY = y - h * o, botY = y + h * b * (1 - sq * .85);
  let top, bot;
  if (P.shape === 'blob') {   // flat lid on top, round bottom (calm chibi, annoyed, intimidating)
    const it = [inner[0], topY + t * h * .22 + (P.slant ?? 0) * h + (P.innerDy ?? 0) * h * .3], ot = [outer[0], topY - t * h * .22 - (P.slant ?? 0) * h];
    top = cpts(it, [lerp(it[0], ot[0], .33), lerp(it[1], ot[1], .33) - (P.peak ?? .03) * h], [lerp(it[0], ot[0], .66), lerp(it[1], ot[1], .66) - (P.peak ?? .03) * h], ot);
    const cy = (8 * botY - it[1] - ot[1]) / 6, r = P.round ?? 1;
    bot = cpts(ot, [ot[0] + s * w * .02 * r, cy], [it[0] - s * w * .02 * r, cy], it);
  } else {
    const pk = (P.peak ?? .12) * h, c1 = P.c1 ?? .22, c2 = P.c2 ?? .3;
    top = cpts(inner, [inner[0] + s * w * c1, topY - pk], [outer[0] - s * w * c2, topY - pk * .7], outer);
    bot = cpts(outer, [outer[0] - s * w * (P.b1 ?? .28), botY + (P.bpk ?? .1) * h], [inner[0] + s * w * (P.b2 ?? .3), botY + (P.bpk ?? .1) * h * .8], inner);
  }
  return { top, bot, inner, outer, topY, botY };
}
function paintIris(g, P, s, E, sh) {
  const { x, y, w, h } = P, gz = E.gaze, small = E.iris < .8;
  const ix = x + gz[0] * w * (P.gazeK ?? .34), iy = y + (P.irisDy ?? 0) * h + gz[1] * h * .3;
  const rH = (P.ir ?? 1) * h * (small ? E.iris * 1.1 : 1), rW = P.irw ? P.irw * w * (small ? E.iris * 1.1 : 1) : rH * (P.irx ?? .86);
  if (small && !P.sclera) { g.fillStyle = '#fbfbf8'; poly(g, [...sh.top, ...sh.bot]); g.fill(); }
  const ic = P.ic || ['#0e0b0a', '#211714', '#4f392d'], gr = g.createLinearGradient(0, iy - rH, 0, iy + rH);
  gr.addColorStop(0, ic[0]); gr.addColorStop(.55, ic[1]); gr.addColorStop(1, ic[2]);
  g.fillStyle = gr; g.beginPath(); g.ellipse(ix, iy, rW, rH, 0, 0, 7); g.fill();
  if (P.ring) { g.lineWidth = P.ringW ?? 5; g.strokeStyle = P.ring; g.stroke(); }
  const pu = E.pupil || P.pupil;
  if (pu === 'dot') { g.fillStyle = P.pupilC || '#050404'; g.beginPath(); g.ellipse(ix, iy + rH * .05, rW * .46, rH * .46, 0, 0, 7); g.fill(); }
  if (pu === 'star') { g.fillStyle = P.pupilC || 'rgba(20,18,18,.75)'; star(g, ix, iy + rH * .05, rH * (P.pupilR ?? .42)); g.fill(); }
  if (pu === 'starW') { g.fillStyle = '#fff'; star(g, ix - rW * .1, iy - rH * .25, rH * (P.pupilR ?? .36)); g.fill(); }
  if (pu === 'heart') { g.fillStyle = P.pupilC || '#f3a6c0'; heart(g, ix, iy + rH * .05, rH * (P.pupilR ?? .5)); g.fill(); }
  for (const [dx, dy, rx, ry, rot = 0, col = '#fff'] of (P.hl || [])) { g.fillStyle = col; g.beginPath(); g.ellipse(ix + dx * rW, iy + dy * rH, rx * rW, ry * rH, rot, 0, 7); g.fill(); }
}
function animeEye(g, s, P, E) {
  if (E.glyph) return glyphEye(g, s, P, E);
  const sh = eyeShape(P, s, E), { top, bot } = sh;
  g.save(); poly(g, [...top, ...bot]); g.clip();
  g.fillStyle = P.sclera || (P.ic ? P.ic[0] : '#0e0b0a'); g.fillRect(P.x - P.w * 1.5, P.y - P.h * 3, P.w * 3, P.h * 6);
  paintIris(g, P, s, E, sh);
  if (P.shade) taper(g, offset(top, s * P.h * .18), P.h * .45, P.h * .45, P.shade);
  if (P.white) for (const [t0, t1, d] of P.white) { g.fillStyle = '#fbfbf8'; poly(g, [...bot.slice(Math.round(t0 * bot.length), Math.round(t1 * bot.length)), ...offset(bot.slice(Math.round(t0 * bot.length), Math.round(t1 * bot.length)), -s * d * P.h).reverse()]); g.fill(); }
  g.restore();
  if (P.outline) { poly(g, [...top, ...bot]); g.lineWidth = P.outline; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); }
  const lw = P.lw || [8, 12];
  taper(g, top, lw[0], lw[1]);
  const o = top[top.length - 1];
  if (P.flick) taper(g, [o, [o[0] + s * P.flick[0] * P.w, o[1] + P.flick[1] * P.h - E.tilt * P.h * .1]], lw[1] * .9, 2);
  if (P.innerFlick) { const i0 = top[0]; taper(g, [i0, [i0[0] - s * P.innerFlick[0] * P.w, i0[1] + P.innerFlick[1] * P.h]], lw[0], 2); }
  for (const [t, len, ang, wd = 6] of (P.spikes || [])) { const p = at(top, t), a = ang * Math.PI / 180; taper(g, [p, [p[0] + s * Math.sin(a) * len * P.h, p[1] - Math.cos(a) * len * P.h]], wd, 1.5); }
  for (const [t, len, ang, wd = 4] of (P.bspikes || [])) { const p = at(bot, 1 - t), a = ang * Math.PI / 180; taper(g, [p, [p[0] + s * Math.sin(a) * len * P.h, p[1] + Math.cos(a) * len * P.h]], wd, 1.2); }
  if (P.lower) { const [a, b] = P.lowerSpan || [.05, .7]; taper(g, bot.slice(Math.round(a * bot.length), Math.round(b * bot.length)), P.lower, P.lower * (P.lowerTip ?? 1.4), P.lowerC || INK); }
  if (P.crease) { const c = P.crease, ct = offset(top, -s * c.dy * P.h); taper(g, ct.slice(Math.round(c.span[0] * ct.length), Math.round(c.span[1] * ct.length)), c.w, c.w * .6, c.col || INK); }
  if (P.outerTick) { const o0 = sh.outer; taper(g, qpts(o0[0] - s * P.w * .04, o0[1] - P.h * .55, o0[0] + s * P.w * .02, o0[1] - P.h * .1, o0[0] - s * P.w * .08, o0[1] + P.h * .4), 5, 3); }
  if (P.innerTick) { const i0 = sh.inner; taper(g, qpts(i0[0] + s * P.w * .08, i0[1] - P.h * .6, i0[0] - s * P.w * .06, i0[1] - P.h * .05, i0[0] + s * P.w * .07, i0[1] + P.h * .5), 6, 4); }
}
// closed / special eyes, drawn with the style's own line
function glyphEye(g, s, P, E) {
  const { x, y, w, h } = P, lw = P.glw || (P.lw ? P.lw[1] * 1.05 : 12), gl = E.glyph;
  if (gl === 'arc' || gl === 'arcdown' || gl === 'dash') {
    const k = gl === 'arc' ? -.85 : gl === 'arcdown' ? .6 : .08, yy = y + (gl === 'arc' ? h * .25 : 0) + (P.closedDy ?? 0) * h;
    const p = qpts(x - s * w * .92, yy + (gl === 'arc' ? h * .1 : 0), x, yy + k * h, x + s * w * .92, yy + (gl === 'arc' ? h * .05 : -h * .05));
    taper(g, p, lw * .75, lw);
    if (P.flick && gl !== 'arc') taper(g, [p[p.length - 1], [p[p.length - 1][0] + s * P.flick[0] * w * .9, p[p.length - 1][1] + P.flick[1] * h * .6]], lw * .85, 2);
    if (P.closedLash) for (let i = 0; i < P.closedLash; i++) { const q = at(p, .6 + i * .16); taper(g, [q, [q[0] + s * w * (.05 + i * .06), q[1] + (gl === 'arc' ? -1 : 1) * h * (.3 + i * .05)]], 5, 1.5); }
    return; }
  if (gl === 'squeeze') {   // >< : apex toward the nose
    const ap = [x - s * w * .55, y], a = [x + s * w * .75, y - h * .72], b = [x + s * w * .75, y + h * .62];
    taper(g, linep(a, ap), lw * .9, lw); taper(g, linep(ap, b), lw, lw * .9); return; }
  if (gl === 'spiral') {
    const pts = []; for (let i = 0; i <= 180; i++) { const t = i / 180, a = t * Math.PI * 2 * 2.6, r = lerp(w * .08, w * .88, t); pts.push([x + Math.cos(a) * r * s, y + Math.sin(a) * r * .9]); }
    taper(g, pts, lw * .5, lw * .85); return; }
  if (gl === 'dot') { g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, w * .22, h * .3, 0, 0, 7); g.fill(); return; }
  if (gl === 'heart') { g.fillStyle = '#ef6f93'; heart(g, x, y, Math.min(w, h) * .95); g.fill(); g.lineWidth = lw * .45; g.strokeStyle = INK; g.stroke(); return; }
  if (gl === 'ring') { g.fillStyle = '#fbfbf8'; g.beginPath(); g.ellipse(x, y, w * .72, h * .95, 0, 0, 7); g.fill(); g.lineWidth = lw * .7; g.strokeStyle = INK; g.stroke(); g.fillStyle = INK; g.beginPath(); g.ellipse(x + E.gaze[0] * w * .2, y + E.gaze[1] * h * .2, w * .16, h * .2, 0, 0, 7); g.fill(); return; }
}
// solid "bean" eyes (Dylan default, silly ink faces): lids cut the bean for emotion
function beanEye(g, s, P, E) {
  if (E.glyph) return glyphEye(g, s, P, E);
  const { x, y, w, h } = P, o = Math.min(E.open, 1.2), t = E.tilt, sq = E.squint;
  if (E.iris < .8) { g.fillStyle = '#fbfbf8'; g.beginPath(); g.ellipse(x, y, w * 1.35, h * 1.08 * o, 0, 0, 7); g.fill(); g.lineWidth = P.ringW || 9; g.strokeStyle = INK; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + E.gaze[0] * w * .4, y + E.gaze[1] * h * .3, w * .5, h * .42, 0, 0, 7); g.fill(); return; }
  g.save();
  const top = y - h * 1.25 + (1 - Math.min(o, 1)) * h * 1.9, sl = t * h * .45, bt = y + h * 1.3 - sq * h * 1.1;
  poly(g, [[x - s * w * 2, top + sl], [x + s * w * 2, top - sl], [x + s * w * 2, bt], [x - s * w * 2, bt]]); g.clip();
  const ox = E.gaze[0] * w * .3, oy = E.gaze[1] * h * .15;
  g.fillStyle = INK; g.beginPath(); g.ellipse(x + ox, y + oy, w, h * (o > 1 ? o : 1), 0, 0, 7); g.fill();
  if (P.hl) for (const [dx, dy, rx, ry] of P.hl) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x + ox + dx * w, y + oy + dy * h, rx * w, ry * h, -.3, 0, 7); g.fill(); }
  g.restore();
  if (Math.abs(t) > .2 || sq > .25 || o < .7) taper(g, [[x - s * w * 1.35, top + sl + 3], [x + s * w * 1.35, top - sl + 3]], P.lidW || 9, P.lidW || 9);
}
// flat pill eyes (Hum face) and black blocks (annoyed) use animeEye with shape blob + no sclera
const EYES = { anime: animeEye, bean: beanEye };

// =================================================================== BROWS
function brow(g, s, S, B, E) {
  const Q = S.brow; if (!Q || Q.type === 'none') return;
  if (Q.type === 'auto' && Math.abs(B.tilt) < .3 && B.h < .55 && B.h > -.3) return;
  const bx = CX + s * X(Q.x), bw = X(Q.x + Q.w) - X(Q.x), by = Y(Q.y) - B.h * (Q.hk ?? 22) - (Q.followEye ? (1 - E.open) * 0 : 0);
  const inner = [bx - s * bw, by + B.tilt * (Q.tk ?? 34) + (Q.innerDy ?? 0)], outer = [bx + s * bw, by - B.tilt * (Q.tk ?? 34) * .35 + (Q.outerDy ?? 6)];
  const mid = [bx + s * bw * (Q.midX ?? .1), by - (Q.arch ?? .3) * (Q.ak ?? 28) - B.arch * 16 - B.tilt * 4];
  let p = qpts(inner[0], inner[1], mid[0], mid[1], outer[0], outer[1]);
  if (Q.hook) { const e = p[p.length - 1]; p = [...p, ...qpts(e[0], e[1], e[0] + s * Q.hook * .5, e[1] + Q.hook * .2, e[0] + s * Q.hook * .55, e[1] + Q.hook).slice(1)]; }
  taper(g, p, Q.t0, Q.t1, Q.col || INK);
  if (Q.double) taper(g, offset(p, s * (Q.double)), Q.t0 * .6, Q.t1 * .6, Q.col || INK);
  if (Q.hairs) for (let i = 0; i < Q.hairs; i++) { const q = at(p, .15 + i * .7 / Q.hairs); taper(g, [q, [q[0] + s * 8, q[1] - Q.t0 * .7]], 4, 1.5); }
}

// =================================================================== MOUTHS (local units: half width 100)
const MP = {
  rest: () => qpts(-60, 0, 0, 10, 60, 0), smile: () => qpts(-90, -22, 0, 52, 90, -22), flat: () => qpts(-58, 2, 0, 4, 58, 2),
  frown: () => qpts(-72, 26, 0, -26, 72, 26), smirk: () => qpts(-60, 8, 25, 22, 92, -28), tick: () => qpts(-28, 12, 0, -14, 28, 12),
  smallfrown: () => qpts(-40, 10, 0, -10, 40, 10), wobble: () => Array.from({ length: 29 }, (_, i) => [-56 + i * 4, Math.sin(i * .95) * 9]),
  cat: () => [...qpts(-74, -14, -40, 34, -2, -6), ...qpts(-2, -6, 38, 34, 74, -14).slice(1)],
};
const OPEN = {   // closed paths for open mouths
  o: g => { g.beginPath(); g.ellipse(0, 10, 26, 32, 0, 0, 7); },
  gasp: g => { g.beginPath(); g.ellipse(0, 26, 44, 62, 0, 0, 7); },
  laugh: g => { g.beginPath(); g.moveTo(-92, -24); g.quadraticCurveTo(0, -10, 92, -24); g.quadraticCurveTo(80, 100, 0, 104); g.quadraticCurveTo(-80, 100, -92, -24); g.closePath(); },
  grin: g => { g.beginPath(); g.moveTo(-84, -18); g.quadraticCurveTo(0, -4, 84, -18); g.quadraticCurveTo(68, 62, 0, 64); g.quadraticCurveTo(-68, 62, -84, -18); g.closePath(); },
  scared: g => { g.beginPath(); g.moveTo(-66, 4); for (let i = 0; i <= 16; i++) g.lineTo(-66 + i * 8.25, 4 + (i % 2 ? -8 : 6)); g.quadraticCurveTo(54, 64, 0, 66); g.quadraticCurveTo(-54, 64, -66, 4); g.closePath(); },
  grimace: g => { g.beginPath(); g.moveTo(-80, -10); g.quadraticCurveTo(0, -30, 80, -10); g.lineTo(70, 30); g.quadraticCurveTo(0, 14, -70, 30); g.closePath(); },
  cry: g => { g.beginPath(); g.moveTo(-70, 42); g.quadraticCurveTo(-44, -26, 0, -24); g.quadraticCurveTo(44, -26, 70, 42); g.quadraticCurveTo(0, 30, -70, 42); g.closePath(); },
  pill: g => { g.beginPath(); g.roundRect(-92, -30, 184, 60, 30); },
  teeth: g => { g.beginPath(); g.moveTo(-58, -18); g.quadraticCurveTo(0, -28, 58, -18); g.lineTo(52, 26); g.quadraticCurveTo(0, 16, -52, 26); g.closePath(); },
};
function drawMouth(g, S, key, E) {
  const M = merge(S.mouth, E.mouthGeo || {}), fam = M.fam || 'ink';
  if (key === 'none' || (fam === 'none' && !OPEN[key])) return;
  const mx = X(M.x || 0), my = Y(M.y), k = (X((M.x || 0) + (M.w || 100)) - mx) / 100 * (E.mouthK || 1);
  g.save(); g.translate(CX + mx, my); g.scale(k * (M.flip ? -1 : 1), k * (M.ys || 1));
  const lw = (M.lw || 10) / k, inner = M.inner || (fam === 'bold' ? '#9c2329' : '#5a1b1c'), tongue = M.tongue || (fam === 'bold' ? '#e8757d' : '#d9606a');
  if (fam === 'lips' && !OPEN[key]) { lips(g, key, lw); g.restore(); return; }
  if (fam === 'man' && !OPEN[key]) { manMouth(g, key, lw, M); g.restore(); return; }
  if (key === 'tongue') { const p = qpts(-60, -6, 0, 14, 60, -6); g.beginPath(); g.moveTo(-34, 2); g.quadraticCurveTo(-36, 78, 0, 80); g.quadraticCurveTo(36, 78, 34, 2); g.closePath(); g.fillStyle = tongue; g.fill(); g.lineWidth = lw * .8; g.strokeStyle = INK; g.stroke(); taper(g, p, lw, lw); g.fillStyle = 'rgba(120,20,30,.35)'; g.fillRect(-1.5, 12, 3, 40); g.restore(); return; }
  if (key === 'lick') { const p = qpts(-70, -4, 0, 18, 70, -4); taper(g, p, lw, lw, M.lickC || INK); g.beginPath(); g.moveTo(20, 6); g.quadraticCurveTo(26, 46, 50, 40); g.quadraticCurveTo(66, 30, 54, -2); g.closePath(); g.fillStyle = tongue; g.fill(); g.restore(); return; }
  if (MP[key]) { taper(g, MP[key](), lw, lw, M.col || INK); if (M.tint) { g.fillStyle = M.tint; g.beginPath(); g.ellipse(0, 12, 36, 11, 0, 0, 7); g.fill(); } g.restore(); return; }
  const ok = M.openK ?? .8; g.scale(ok, ok); const path = () => OPEN[key](g);
  g.save(); path(); g.fillStyle = inner; g.fill(); g.clip();
  if (['laugh', 'grin', 'gasp', 'cry', 'scared'].includes(key) && !M.noTongue) { g.fillStyle = tongue; g.beginPath(); g.ellipse(0, key === 'laugh' ? 96 : key === 'gasp' ? 80 : 60, 52, 34, 0, 0, 7); g.fill(); }
  if (['grin', 'laugh', 'grimace', 'scared', 'teeth', 'cry'].includes(key) && M.teeth !== false) { g.fillStyle = '#fffdf8'; g.fillRect(-100, -40, 200, key === 'grimace' || key === 'teeth' ? 120 : key === 'laugh' ? 34 : 30);
    if (key === 'grimace' || key === 'teeth') { g.strokeStyle = 'rgba(20,17,16,.5)'; g.lineWidth = 3 / k * 1.5; g.beginPath(); g.moveTo(-90, 9); g.quadraticCurveTo(0, -4, 90, 9); g.stroke(); } }
  if (M.fang && (key === 'laugh' || key === 'grin')) { g.fillStyle = '#fffdf8'; g.beginPath(); g.moveTo(-64, -22); g.lineTo(-48, 14); g.lineTo(-34, -18); g.closePath(); g.fill(); }
  g.restore(); path(); g.lineWidth = lw * (fam === 'bold' ? 1 : .85); g.lineJoin = 'round'; g.strokeStyle = INK; g.stroke();
  if (fam === 'lips') { path(); g.lineWidth = lw * 3.2; g.strokeStyle = 'rgba(224,128,136,.85)'; g.stroke(); path(); g.lineWidth = lw * .6; g.strokeStyle = INK; g.stroke(); }
  g.restore();
}
function lips(g, key, lw) {   // Woman-face lips: pink lips, a dark line through with little upturned corners
  const curve = { rest: 6, smile: 34, smirk: 18, flat: 0, frown: -24, tick: -10, smallfrown: -16, wobble: 0, cat: 8 }[key] ?? 6, sk = key === 'smirk' ? 1 : 0;
  const L = qpts(-96, -8 - sk * 4, 0, curve, 96, -8 - sk * 26);
  g.fillStyle = '#e48a8f'; g.beginPath(); g.moveTo(-82, -4); g.quadraticCurveTo(-40, -30 + curve * .3, 0, -16 + curve * .4); g.quadraticCurveTo(40, -30 + curve * .3, 82, -4 - sk * 18); g.quadraticCurveTo(40, 34 + curve * .6, 0, 36 + curve * .6); g.quadraticCurveTo(-40, 34 + curve * .6, -82, -4); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(0, 18 + curve * .5, 26, 7, 0, 0, 7); g.fill();
  taper(g, L, lw * .7, lw * .7);
  for (const s of [-1, 1]) { const e = L[s < 0 ? 0 : L.length - 1]; taper(g, [e, [e[0] + s * 16, e[1] - 10]], lw * .7, 2); }
}
function manMouth(g, key, lw, M) {   // Man-face mouth: one long thin line, a tick on the left end, a smile line on the cheek
  const c = { rest: [-14, -40], smile: [26, -56], smirk: [-14, -46], flat: [0, -6], frown: [-34, 18], tick: [-10, -10], smallfrown: [-20, 10], wobble: [0, 0], cat: [10, -30] }[key] || [-14, -40];
  const L = qpts(-100, 2, 20, 6 + c[0] * .4, 100, c[1]); taper(g, L, lw, lw * 1.05);
  taper(g, [[-100, -10], [-102, 14]], lw, lw);
  if (key !== 'frown' && key !== 'flat' && key !== 'smallfrown') taper(g, qpts(142, -64, 130, -12, 108, 40), lw * .9, lw * .8);
  if (key === 'smile') taper(g, qpts(-142, -64, -130, -12, -108, 40), lw * .9, lw * .8);
}

// =================================================================== EXTRAS
function blush(g, S, amt) {
  const B = S.blush; if (!B || amt <= 0) return;
  for (const s of (B.type === 'nose' ? [0] : [-1, 1])) {
    const x = CX + s * X(B.x), y = Y(B.y), rx = X(B.x + B.rx) - X(B.x) || B.rx, ry = B.ry, col = B.col || '236,110,118';
    const gr = g.createRadialGradient(x, y, 2, x, y, Math.max(rx, ry)); gr.addColorStop(0, `rgba(${col},${amt})`); gr.addColorStop(.6, `rgba(${col},${amt * .55})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.save(); g.translate(x, y); g.scale(1, ry / Math.max(rx, ry)); g.translate(-x, -y); g.fillStyle = gr; g.beginPath(); g.arc(x, y, Math.max(rx, ry), 0, 7); g.fill(); g.restore();
    if (B.hatch) for (let i = 0; i < B.hatch; i++) { const hx = x + (i - (B.hatch - 1) / 2) * rx * .32; taper(g, [[hx + 8, y - ry * .42], [hx - 8, y + ry * .42]], 5, 3, `rgba(${B.hatchC || '222,88,104'},.85)`); }
  }
}
function extras(g, S, e, P) {
  const ex = P.x, ey = P.y, h = P.h, w = P.w;
  if (e.tears) for (const s of [-1, 1]) { const x = CX + s * (ex + (e.tears > 1 ? w * .1 : w * .35)), y = ey + h * .55; g.fillStyle = 'rgba(122,192,255,.88)';
    if (e.tears > 1) { g.beginPath(); g.moveTo(x - 12, y); g.quadraticCurveTo(x - 18, y + 110, x - 8, y + 200); g.lineTo(x + 10, y + 200); g.quadraticCurveTo(x + 18, y + 110, x + 12, y); g.closePath(); g.fill(); }
    else { g.beginPath(); g.moveTo(x, y + 6); g.quadraticCurveTo(x + 18, y + 44, x, y + 56); g.quadraticCurveTo(x - 18, y + 44, x, y + 6); g.fill(); } }
  if (e.sweat) { const x = CX + ex + w * 1.05, y = ey - h * 1.9; g.fillStyle = 'rgba(122,192,255,.9)'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 26, y + 52, x, y + 64); g.quadraticCurveTo(x - 26, y + 52, x, y); g.fill(); g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(x - 7, y + 46, 5, 9, 0, 0, 7); g.fill(); }
  if (e.gloom) { for (let i = 0; i < 5; i++) { const x = CX - 150 + i * 75; taper(g, [[x, 150], [x, 150 + 90 + (i % 2) * 30]], 7, 5, 'rgba(70,90,170,.45)'); } }
  if (e.vein) { const x = CX + ex + w * .7, y = ey - h * 2.2; g.strokeStyle = '#d23a3a'; g.lineWidth = 9; g.lineCap = 'round'; for (const [a, b] of [[[-1, -1], [-.3, -.3]], [[1, -1], [.3, -.3]], [[-1, 1], [-.3, .3]], [[1, 1], [.3, .3]]]) { g.beginPath(); g.moveTo(x + a[0] * 30, y + a[1] * 30); g.quadraticCurveTo(x + (a[0] + b[0]) * 8, y + (a[1] + b[1]) * 22, x + b[0] * 30, y + b[1] * 30); g.stroke(); } }
  if (e.noseHatch || S.noseHatch) { for (let i = 0; i < 7; i++) taper(g, [[CX - 36 + i * 12, ey - h * .55], [CX - 36 + i * 12, ey + h * .5]], 5, 4, 'rgba(20,17,16,.75)'); }
  if (e.under || S.under) { for (const s of [-1, 1]) { const p = qpts(CX + s * (ex - w * .9), ey + h * .85, CX + s * ex, ey + h * 1.25, CX + s * (ex + w * .9), ey + h * .75); taper(g, p, 18, 10, 'rgba(60,60,60,.35)'); taper(g, offset(p, 14), 6, 3, 'rgba(40,40,40,.4)'); } }
  if (S.nose) { const N = S.nose, nx = CX, ny = Y(N.y); if (N.type === 'dot') { g.fillStyle = N.col || 'rgba(20,17,16,.7)'; g.beginPath(); g.ellipse(nx, ny, N.r || 5, (N.r || 5) * .8, 0, 0, 7); g.fill(); }
    if (N.type === 'tick') taper(g, qpts(nx - 9, ny + 6, nx, ny - 6, nx + 9, ny + 6), 4, 4, N.col || 'rgba(20,17,16,.6)'); }
}

// =================================================================== EMOTIONS (shared by every style)
export const EMOTIONS = {
  neutral: {},
  happy:   { eyes: { open: .82, squint: .35 }, brows: { h: .35, arch: .3 }, mouth: 'smile', blush: .18 },
  laugh:   { eyes: { glyph: 'arc' }, brows: { h: .6, arch: .4 }, mouth: 'laugh', blush: .3 },
  sad:     { eyes: { open: .78, tilt: -.65, gaze: [0, .45] }, brows: { h: .3, tilt: -1 }, mouth: 'frown' },
  angry:   { eyes: { open: .72, tilt: .7, squint: .25 }, brows: { h: -.55, tilt: 1.25 }, mouth: 'grimace', vein: 1 },
  shocked: { eyes: { open: 1.15, iris: .55 }, brows: { h: 1.15, arch: .6 }, mouth: 'gasp' },
  smug:    { eyes: { open: .5, tilt: .28, gaze: [.45, 0] }, browL: { h: .85, arch: .5 }, browR: { h: -.05, tilt: .35 }, mouth: 'smirk', blush: .08 },
  scared:  { eyes: { open: 1.08, iris: .62, tilt: -.35 }, brows: { h: .8, tilt: -1.05 }, mouth: 'scared', sweat: 1, gloom: 1 },
  sleepy:  { eyes: { open: .32, gaze: [0, .35] }, brows: { h: -.15 }, mouth: 'flat' },
  crying:  { eyes: { open: .62, tilt: -.65, squint: .3, gaze: [0, .35] }, brows: { h: .4, tilt: -1.2 }, mouth: 'cry', tears: 2 },
};
export const EMO_ORDER = Object.keys(EMOTIONS);

// =================================================================== STYLES
// eye: { p: painter, x, y, w (half width, linear units), h (top half height), ...painter options }
// own: the face as sold (array: some styles have several catalogue faces). sex: m / f / n.
export const STYLES = {
  s1: { name: 'Woman Face', sex: 'f', ref: [1],
    eye: { p: 'anime', x: 248, y: 470, w: 112, h: 100, b: .74, sclera: '#fbfbf8', ir: .92, irw: .56, irisDy: .12, ic: ['#262626', '#4a4a4a', '#9a9a9a'], ring: '#0a0a0a', ringW: 6, pupil: 'dot',
      hl: [[.32, -.36, .3, .25, -.4], [-.3, .3, .12, .1]], lw: [12, 22], peak: .2, flick: [.36, -.34], lower: 5, lowerSpan: [.02, .8], lowerTip: 1, outline: 6, crease: { dy: .36, span: [.22, .9], w: 4 } },
    brow: { type: 'arc', x: 250, y: 338, w: 145, t0: 17, t1: 5, arch: 1.1, ak: 40, midX: .15, outerDy: 26 },
    mouth: { fam: 'lips', y: 846, w: 210, lw: 9 }, blush: null, own: [{}] },
  s2: { name: 'Man Face', sex: 'm', ref: [2],
    eye: { p: 'anime', x: 262, y: 452, w: 132, h: 52, b: .95, sclera: '#fbfbf8', ir: 1.12, irw: .42, irisDy: .18, ic: ['#0a0a0a', '#111', '#262626'], hl: [[.34, -.12, .2, .16, -.4]],
      lw: [14, 15], peak: .02, c1: .15, c2: .2, lower: 5, lowerSpan: [0, .82], lowerTip: 1, crease: { dy: .62, span: [.12, .78], w: 5 }, innerTick: 1, outerTick: 1, outerDy: .05 },
    brow: { type: 'arc', x: 240, y: 362, w: 150, t0: 64, t1: 34, arch: 1, ak: 110, midX: .05, outerDy: 18, hook: 44, hairs: 0 },
    mouth: { fam: 'man', y: 880, x: 0, w: 290, lw: 16 }, own: [{}] },
  s3: { name: 'Dylan Default', sex: 'n', ref: [3],
    eye: { p: 'bean', x: 116, y: 348, w: 45, h: 90, lidW: 10 },
    brow: { type: 'auto', x: 125, y: 230, w: 70, t0: 14, t1: 10, arch: .1 },
    mouth: { fam: 'ink', y: 792, w: 175, lw: 27 }, own: [{ mouth: 'rest' }],
    emo: { neutral: { mouth: 'rest' } } },
  s4: { name: 'Silly ink (Silly Smile, Happy :3, Cute Excited)', sex: 'n', ref: [4, 18, 22],
    eye: { p: 'bean', x: 255, y: 585, w: 50, h: 70, glw: 36, lidW: 16 },
    brow: { type: 'line', x: 175, y: 488, w: 66, t0: 13, t1: 13, arch: 0, tk: 20 },
    mouth: { fam: 'bold', y: 836, w: 280, lw: 30, fang: true }, blush: { type: 'nose', x: 0, y: 585, rx: 90, ry: 26, col: '196,120,120', hatch: 4, hatchC: '170,96,96' },
    own: [
      { eyes: { glyph: 'squeeze' }, eyeGeo: { w: 200, h: 110 }, brows: { tilt: .7 }, mouth: 'cat', blush: .55 },
      { eyes: { glyph: 'arc' }, eyeGeo: { x: 112, y: 306, w: 92, h: 52 }, brow: 'none', mouth: 'cat', mouthGeo: { y: 780, w: 255, lw: 34 }, blush: 0 },
      { eyes: { glyph: 'squeeze' }, eyeGeo: { x: 274, y: 486, w: 183, h: 130 }, brow: 'none', mouth: 'laugh', mouthGeo: { x: 18, y: 790, w: 225, lw: 22 }, blush: 0 },
    ],
    emo: { neutral: { mouth: 'cat', blush: .4 }, happy: { eyes: { glyph: 'arc' }, mouth: 'cat', blush: .5 }, laugh: { eyes: { glyph: 'squeeze' }, mouth: 'laugh', blush: .5 }, smug: { mouth: 'cat' } } },
  s5: { name: 'Intimidating Face', sex: 'n', ref: [5],
    eye: { p: 'anime', x: 300, y: 585, w: 150, h: 84, b: .9, peak: .04, c1: .1, c2: .12, b1: .15, b2: .2, bpk: .2, sclera: '#f6f3f8', ir: 1.02, irw: .5, irisDy: .18, ic: ['#050505', '#090909', '#141414'],
      shade: 'rgba(170,150,205,.6)', lw: [22, 24], flick: [.1, .3], outerDy: .15, lower: 5, lowerSpan: [.05, .95], lowerTip: 1 },
    brow: { type: 'arc', x: 300, y: 492, w: 180, t0: 24, t1: 10, arch: .25, ak: 20, outerDy: 10 },
    mouth: { fam: 'ink', y: 936, x: 0, w: 110, lw: 13 }, own: [{ mouth: 'smallfrown' }],
    emo: { neutral: { mouth: 'smallfrown' } } },
  s6: { name: 'Cute Kawaii Star Anime Eyes', sex: 'f', ref: [6],
    eye: { p: 'anime', x: 329, y: 732, w: 151, h: 146, b: .8, sclera: '#fbfbf8', ir: 1.08, irw: .8, irisDy: .14, gazeK: .2, ic: ['#0b0a0a', '#2a2626', '#837b7b'], ring: '#0b0a0a', ringW: 6, pupil: 'star', pupilR: .42, pupilC: 'rgba(10,9,9,.8)',
      hl: [[-.5, -.42, .2, .26, -.2], [.42, .45, .1, .08]], lw: [34, 46], peak: .26, c1: .1, c2: .16, flick: [.2, -.05], spikes: [[.15, .22, -10, 7], [.4, .26, 10, 8], [.6, .32, 30, 9], [.76, .36, 50, 9], [.88, .32, 68, 8], [.97, .24, 88, 7]],
      bspikes: [[.62, .16, 15, 4], [.76, .18, 30, 4], [.88, .14, 50, 3]], lower: 4, lowerSpan: [.05, .55], b1: .2, b2: .25 },
    brow: { type: 'arc', x: 170, y: 495, w: 52, t0: 5, t1: 3, arch: .1, ak: 10, outerDy: 2, col: '#2a2626' },
    mouth: { fam: 'ink', y: 950, x: 0, w: 30, lw: 6 }, nose: null,
    blush: { type: 'soft', x: 270, y: 805, rx: 120, ry: 62 }, baseBlush: .42, own: [{ mouth: 'cat' }],
    emo: { neutral: { mouth: 'cat' } } },
};

// =================================================================== DRAW
const DEF_EYE = { open: 1, tilt: 0, squint: 0, gaze: [0, 0], iris: 1, glyph: null };
export function resolve(styleId, emo) {
  const S = STYLES[styleId]; let e;
  if (typeof emo === 'string' && emo.startsWith('own')) e = S.own[+(emo.split(':')[1] || 0)] || {};
  else e = merge(EMOTIONS[emo] || emo, (S.emo || {})[emo] || {});
  return { S, e: merge(S.base || {}, e) };
}
export function drawFace4(g, styleId, emo, sex) {
  const { S, e } = resolve(styleId, emo);
  const EG = merge(S.eye, e.eyeGeo || {}), ex = X(EG.x), P = { ...EG, x: ex, y: Y(EG.y), w: X(EG.x + EG.w) - ex, h: EG.h * .962 };
  const E = { ...DEF_EYE, ...(e.eyes || {}) };
  g.save(); g.translate(1024, 0); g.scale(-1, 1);   // draw in screen space (the decal mirrors the canvas)
  blush(g, S, (S.baseBlush || 0) + (e.blush || 0));
  for (const s of [-1, 1]) EYES[EG.p](g, s, { ...P, x: CX + s * ex }, E);
  if (e.brow !== 'none') { const b0 = { h: 0, tilt: 0, arch: 0 }; brow(g, -1, S, { ...b0, ...(e.brows || {}), ...(e.browR || {}) }, E); brow(g, 1, S, { ...b0, ...(e.brows || {}), ...(e.browL || {}) }, E); }
  drawMouth(g, S, e.mouth || 'rest', e);
  extras(g, S, e, P);
  g.restore();
}
export function faceCanvas4(styleId, emo, sex) { const c = document.createElement('canvas'); c.width = c.height = 1024; drawFace4(c.getContext('2d'), styleId, emo, sex); return c; }
