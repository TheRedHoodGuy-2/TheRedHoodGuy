// FACE KIT v3 (2026-11-19, Xavier 04:16): v2 put the eyes high on the head, far apart and far from the mouth ("one
// massive triangle"). v3 moves the whole face DOWN and pulls it together, measured from the 48 most-favourited Roblox
// dynamic heads (research/dynfaces.md): eyes just below the middle of the head, mouth close under them, eyes about one
// eye-width apart. Three eye styles share the same emotion parameters as v2 (open, tilt, squint, gaze, iris, arc):
//   classic = solid black Roblox "bean" eyes with a catchlight (Devon / Dylan default family)
//   chibi   = big all-iris eyes, two highlights, thick lash line (the cute dynamic-face family, most favourited)
//   toon    = white eye + big iris + lash line (v2 eyes, rounder, bigger iris)
// Canvas: 1024, same decal layout as v2 (head y = .36 + (cy - 365) * .001116, 1118 px per head width).
// faceCanvas(emotion, sex, { style, eyes, mouth }) -> canvas.
const INK = '#1e1714', SCLERA = '#fbfbf8', MOUTH_IN = '#5a1b1c', TONGUE = '#d9606a', TEETH = '#fffdf8';
const BLUSH = 'rgba(236,110,118,', TEAR = 'rgba(120,190,255,.85)', CX = 512;
export const STYLES = {
  classic: { ey: 520, edx: 155, my: 770, ms: 1.55, rx: 46, ry: 72 },
  chibi:   { ey: 540, edx: 250, my: 800, ms: 1.45, w: 124, h: 138, full: true, lash: 22 },
  toon:    { ey: 540, edx: 228, my: 790, ms: 1.45, w: 108, h: 100, full: false, lash: 17 },
};
const lerp = (a, b, t) => a + (b - a) * t;
function taper(g, pts, w0, w1, col = INK) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const w = lerp(w0, w1, i / (n - 1)) / 2, nx = -dy / l * w, ny = dx / l * w; L.push([pts[i][0] + nx, pts[i][1] + ny]); R.push([pts[i][0] - nx, pts[i][1] - ny]); }
  g.fillStyle = col; g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fill();
  g.beginPath(); g.arc(pts[0][0], pts[0][1], w0 / 2, 0, 7); g.fill(); g.beginPath(); g.arc(pts[n - 1][0], pts[n - 1][1], w1 / 2, 0, 7); g.fill();
}
const qpts = (x0, y0, cx, cy, x1, y1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]; });
const cpts = (p0, p1, p2, p3, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); });
const poly = (g, pts) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };

// closed happy / relaxed eye (arc = 1 up-arch, -1 down-curve), shared by every style
function arcEye(g, side, f, x, y, w, arc) {
  const p = arc > 0 ? qpts(x - w, y + 10, x, y - w * .5, x + w, y + 10) : qpts(x - w, y - 4, x, y + w * .35, x + w, y - 4);
  taper(g, side < 0 ? p.reverse() : p, 15, 12);
  if (f && arc > 0) for (let i = 0; i < 2; i++) taper(g, [[x + side * (w - 4 - i * 14), y + 2 - i * 10], [x + side * (w + 12 - i * 10), y - 14 - i * 12]], 7, 3);
}
// ---------- classic Roblox bean eye ----------
function classicEye(g, side, f, S, { open = 1, tilt = 0, squint = 0, gaze = [0, 0], iris = 1, arc = 0 }) {
  const x = CX + side * S.edx, y = S.ey;
  if (arc) return arcEye(g, side, f, x, y, S.rx * 1.3, arc);
  const rx = S.rx * (f ? 1.05 : 1), ry = S.ry * Math.min(open, 1.15);
  g.save();
  // lids cut the bean: top lid slanted by tilt (outer corner up = +), lower lid raised by squint
  const top = y - S.ry * 1.2 + (1 - Math.min(open, 1)) * S.ry, slant = tilt * 22;
  poly(g, [[x - side * rx * 1.6, top + slant], [x + side * rx * 1.6, top - slant], [x + side * rx * 1.6, y + S.ry * 1.3 - squint * S.ry], [x - side * rx * 1.6, y + S.ry * 1.3 - squint * S.ry]]); g.clip();
  if (iris < .8) {   // shock: white eye, small pupil
    g.fillStyle = SCLERA; g.beginPath(); g.ellipse(x, y, rx * 1.25, ry * 1.05, 0, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + gaze[0] * rx * .4, y + gaze[1] * ry * .3, rx * .42 * iris / .6, ry * .4 * iris / .6, 0, 0, 7); g.fill();
  } else {
    const ox = gaze[0] * rx * .35, oy = gaze[1] * ry * .2;
    g.fillStyle = INK; g.beginPath(); g.ellipse(x + ox, y + oy, rx, ry, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x + ox + rx * .3, y + oy - ry * .42, rx * .32, ry * .22, -.3, 0, 7); g.fill();
  }
  g.restore();
  if (tilt || squint > .2) taper(g, [[x - side * rx * 1.25, top + slant + 4], [x + side * rx * 1.25, top - slant + 4]], 9, 9);   // the lid line shows when it cuts in
  if (f) for (let i = 0; i < 2; i++) taper(g, [[x + side * rx * .8, y - ry * (.62 - i * .3)], [x + side * (rx * 1.45 + i * 4), y - ry * (.9 - i * .3)]], 7, 2);
}
// ---------- chibi / toon eye: shape from two lid curves ----------
function shapedEye(g, side, f, S, { open = 1, tilt = 0, squint = 0, gaze = [0, 0], iris = 1, arc = 0 }) {
  const x = CX + side * S.edx, y = S.ey, w = S.w * (f ? 1.06 : 1), h = S.h * (f ? 1.08 : 1);
  if (arc) return arcEye(g, side, f, x, y, w, arc);
  const ot = tilt * 16;                                       // outer corner lift, same on both eyes
  const inner = [x - side * w, y + 6], outer = [x + side * w, y - ot];
  const topY = y - h * open, botY = y + h * .72 - squint * h;
  const top = cpts(inner, [inner[0] + side * w * .2, topY - 8], [outer[0] - side * w * .3, topY - 6], outer);
  const bot = cpts(outer, [outer[0] - side * w * .25, botY + 6], [inner[0] + side * w * .25, botY + 4], inner);
  g.save(); poly(g, [...top, ...bot]); g.fillStyle = SCLERA; g.fill(); g.clip();
  const ix = x + gaze[0] * w * .38, iy = y + 4 + gaze[1] * h * .3;
  if (S.full) {   // chibi: the iris fills the eye, dark at the top, warm brown at the bottom
    const r = h * 1.02 * Math.max(iris, .55), gr = g.createLinearGradient(0, iy - r, 0, iy + r);
    gr.addColorStop(0, '#0e0a09'); gr.addColorStop(.55, '#2a1a14'); gr.addColorStop(1, '#6b4532');
    g.fillStyle = gr; g.beginPath(); g.ellipse(ix, iy, r * .86 * (iris < .8 ? .7 : 1), r * (iris < .8 ? .7 : 1), 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ix - side * 0 + r * .28, iy - r * .38, r * .3, r * .24, -.4, 0, 7); g.fill();
    g.beginPath(); g.arc(ix - r * .3, iy + r * .35, r * .11, 0, 7); g.fill();
  } else {         // toon: white eye, big round iris
    const r = h * .72 * iris; g.fillStyle = '#3d2a20'; g.beginPath(); g.arc(ix, iy, r, 0, 7); g.fill();
    g.fillStyle = '#140e0c'; g.beginPath(); g.arc(ix, iy, r * .62, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ix + r * .34, iy - r * .4, r * .3, r * .24, -.4, 0, 7); g.fill(); g.beginPath(); g.arc(ix - r * .36, iy + r * .34, r * .11, 0, 7); g.fill();
  }
  g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(x - w - 10, topY - 24, 2 * w + 20, 28);   // lid shadow
  g.restore();
  taper(g, side < 0 ? top.slice().reverse() : top, S.lash * .75, S.lash);   // lash line, heavier at the outer corner
  const o = top[top.length - 1];
  taper(g, [o, [o[0] + side * (f ? 20 : 8), o[1] - (f ? 12 : 4) - tilt * 6]], S.lash * .8, 3);   // little flick / wing
  if (f) for (let i = 0; i < 2; i++) { const p = top[Math.round(top.length * (.62 + i * .16))]; taper(g, [p, [p[0] + side * (7 + i * 6), p[1] - 15 - i * 2]], 6, 2); }
  taper(g, bot.slice(3, Math.round(bot.length * .55)), 3, 4, 'rgba(30,23,20,.6)');
}
// ---------- brow: short, thin, close above the eye ----------
function brow(g, side, f, S, { h = 0, tilt = 0, arch = 0 } = {}) {
  const cl = !!S.rx, x = CX + side * S.edx, eh = cl ? S.ry : S.h, w = cl ? S.rx * 1.35 : S.w * .82;
  const y = S.ey - eh * (cl ? 1.05 : 1.1) - (f ? 30 : 26) - h * 20;
  const inner = [x - side * w * .9, y + tilt * 20], outer = [x + side * w, y - tilt * 9 + (f ? 8 : 5)], mid = [x + side * w * .1, y - 8 - arch * 13 - (f ? 5 : 0)];
  taper(g, qpts(inner[0], inner[1], mid[0], mid[1], outer[0], outer[1]), f ? 16 : 24, f ? 4 : 9);
}
// ---------- mouths (v2 shapes, drawn smaller and placed by the style) ----------
const MY = 690;
function closed(g, f, pts, w = 12) { if (f) { const c = pts[Math.floor(pts.length / 2)]; g.fillStyle = 'rgba(201,96,107,.4)'; g.beginPath(); g.ellipse(c[0], c[1] + 10, 30, 10, 0, 0, 7); g.fill(); } taper(g, pts, w * .55, w * .55, INK); taper(g, pts.slice(3, -3), w, w); }
function bounds(g, path) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; path(); const m = g.getTransform();
  for (let y = MY - 160; y < MY + 200; y += 3) for (let x = CX - 220; x < CX + 220; x += 3) if (g.isPointInPath(m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return { x0, x1, y0, y1, cx: (x0 + x1) / 2 }; }
function open(g, f, path, { teeth = .3, tongue = true } = {}) {
  g.save(); path(); g.fillStyle = MOUTH_IN; g.fill(); g.clip(); const b = bounds(g, path);
  if (tongue) { g.fillStyle = TONGUE; g.beginPath(); g.ellipse(b.cx, b.y1 + 6, (b.x1 - b.x0) * .32, (b.y1 - b.y0) * .32, 0, 0, 7); g.fill(); }
  if (teeth) { g.fillStyle = TEETH; g.fillRect(b.x0, b.y0 - 4, b.x1 - b.x0, (b.y1 - b.y0) * teeth + 4); }
  g.restore(); path(); g.lineWidth = 10; g.lineJoin = 'round'; g.strokeStyle = INK; g.stroke();
}
const MOUTHS = {
  rest: (g, f) => closed(g, f, qpts(CX - 40, MY, CX, MY + 8, CX + 40, MY)),
  smile: (g, f) => closed(g, f, qpts(CX - 62, MY - 14, CX, MY + 36, CX + 62, MY - 14), 13),
  smirk: (g, f) => closed(g, f, qpts(CX - 36, MY + 6, CX + 18, MY + 16, CX + 62, MY - 16), 12),
  flat: (g, f) => closed(g, f, qpts(CX - 38, MY + 4, CX, MY + 6, CX + 38, MY + 4), 11),
  frown: (g, f) => closed(g, f, qpts(CX - 50, MY + 20, CX, MY - 16, CX + 50, MY + 20), 12),
  squiggle: (g, f) => closed(g, f, Array.from({ length: 25 }, (_, i) => [CX - 30 + i * 3.6, MY + 6 + Math.sin(i * .7) * 6 - i * .6]), 10),
  grin: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 76, MY - 20); g.quadraticCurveTo(CX, MY - 6, CX + 76, MY - 20); g.quadraticCurveTo(CX + 62, MY + 60, CX, MY + 62); g.quadraticCurveTo(CX - 62, MY + 60, CX - 76, MY - 20); g.closePath(); }, { teeth: .34 }),
  laugh: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 78, MY - 26); g.quadraticCurveTo(CX, MY - 16, CX + 78, MY - 26); g.quadraticCurveTo(CX + 66, MY + 84, CX, MY + 88); g.quadraticCurveTo(CX - 66, MY + 84, CX - 78, MY - 26); g.closePath(); }, { teeth: .24 }),
  o: (g, f) => open(g, f, () => { g.beginPath(); g.ellipse(CX, MY + 12, 22, 30, 0, 0, 7); }, { teeth: 0, tongue: false }),
  gasp: (g, f) => open(g, f, () => { g.beginPath(); g.ellipse(CX, MY + 22, 36, 50, 0, 0, 7); }, { teeth: .12 }),
  scared: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 56, MY + 4); for (let i = 0; i <= 14; i++) g.lineTo(CX - 56 + i * 8, MY + 4 + (i % 2 ? -6 : 5)); g.quadraticCurveTo(CX + 44, MY + 54, CX, MY + 56); g.quadraticCurveTo(CX - 44, MY + 54, CX - 56, MY + 4); g.closePath(); }, { teeth: .22, tongue: false }),
  grimace: (g, f) => { const path = () => { g.beginPath(); g.moveTo(CX - 68, MY - 8); g.quadraticCurveTo(CX, MY - 26, CX + 68, MY - 8); g.lineTo(CX + 60, MY + 26); g.quadraticCurveTo(CX, MY + 12, CX - 60, MY + 26); g.closePath(); };
    open(g, f, path, { teeth: 1, tongue: false }); g.save(); path(); g.clip(); g.strokeStyle = 'rgba(30,23,20,.55)'; g.lineWidth = 4; g.beginPath(); g.moveTo(CX - 68, MY + 9); g.quadraticCurveTo(CX, MY - 4, CX + 68, MY + 9); g.stroke();
    for (const x of [-42, -14, 14, 42]) { g.beginPath(); g.moveTo(CX + x, MY - 28); g.lineTo(CX + x, MY + 30); g.stroke(); } g.restore(); },
  cry: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 58, MY + 36); g.quadraticCurveTo(CX - 36, MY - 20, CX, MY - 18); g.quadraticCurveTo(CX + 36, MY - 20, CX + 58, MY + 36); g.quadraticCurveTo(CX, MY + 26, CX - 58, MY + 36); g.closePath(); }, { teeth: .18 }),
  disgust: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 52, MY + 12); g.quadraticCurveTo(CX - 8, MY - 6, CX + 50, MY - 16); g.quadraticCurveTo(CX + 36, MY + 26, CX - 52, MY + 12); g.closePath(); }, { teeth: .7, tongue: false }),
};
// ---------- extras, placed from the eyes ----------
const eyeH = S => S.rx ? S.ry : S.h;
const blush = (g, S, a) => { const bx = S.edx + (S.rx ? 70 : 40), by = S.ey + eyeH(S) * 1.15 + 10;
  for (const s of [-1, 1]) { const gr = g.createRadialGradient(CX + s * bx, by, 4, CX + s * bx, by, 62); gr.addColorStop(0, BLUSH + a + ')'); gr.addColorStop(1, BLUSH + '0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(CX + s * bx, by, 70, 40, 0, 0, 7); g.fill(); } };
const tears = (g, S, stream) => { for (const s of [-1, 1]) { const x = CX + s * (S.edx + 10), y = S.ey + eyeH(S) * .7; g.fillStyle = TEAR;
  if (stream) { g.beginPath(); g.moveTo(x - 11, y); g.quadraticCurveTo(x - 16, y + 90, x - 7, y + 170); g.lineTo(x + 9, y + 170); g.quadraticCurveTo(x + 16, y + 90, x + 11, y); g.closePath(); g.fill(); }
  else { g.beginPath(); g.moveTo(x, y + 8); g.quadraticCurveTo(x + 16, y + 40, x, y + 50); g.quadraticCurveTo(x - 16, y + 40, x, y + 8); g.fill(); } } };
const sweat = (g, S) => { g.fillStyle = TEAR; const x = CX + S.edx + 120, y = S.ey - 170; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 24, y + 46, x, y + 58); g.quadraticCurveTo(x - 24, y + 46, x, y); g.fill(); };
const scrunch = (g, S) => { for (const s of [-1, 1]) taper(g, qpts(CX + s * 24, S.ey + 20, CX + s * 36, S.ey + 44, CX + s * 28, S.ey + 66), 6, 3, 'rgba(30,23,20,.6)'); };

export const EMOTIONS = {
  neutral:   { eyes: {}, brows: {}, mouth: 'rest' },
  happy:     { eyes: { open: .85, squint: .35 }, brows: { h: .3, arch: .4 }, mouth: 'smile', blush: .25 },
  laugh:     { eyes: { arc: 1 }, brows: { h: .6, arch: .6 }, mouth: 'laugh', blush: .4 },
  sad:       { eyes: { open: .7, tilt: -.7, gaze: [0, .5] }, brows: { h: .2, tilt: -1 }, mouth: 'frown' },
  angry:     { eyes: { open: .7, tilt: .5, squint: .3 }, brows: { h: -.6, tilt: 1.3 }, mouth: 'grimace' },
  scared:    { eyes: { open: 1.12, iris: .62 }, brows: { h: .7, tilt: -1.1 }, mouth: 'scared', sweat: 1 },
  shocked:   { eyes: { open: 1.15, iris: .58 }, brows: { h: 1.3, arch: .8 }, mouth: 'gasp' },
  smug:      { eyes: { open: .52, tilt: .3, gaze: [.45, 0] }, brows: { h: .1, tilt: .3 }, browR: { h: .9, arch: .7 }, mouth: 'smirk' },
  bored:     { eyes: { open: .45, gaze: [0, .3] }, brows: { h: -.2 }, mouth: 'flat' },
  confused:  { eyes: { open: .95, gaze: [-.4, -.4] }, browL: { h: -.3, tilt: .6 }, browR: { h: .9, arch: .6 }, mouth: 'squiggle' },
  disgusted: { eyes: { open: .55, squint: .6 }, brows: { h: -.4, tilt: .7 }, mouth: 'disgust', scrunch: 1 },
  crying:    { eyes: { open: .62, tilt: -.6, squint: .3, gaze: [0, .3] }, brows: { h: .3, tilt: -1.2 }, mouth: 'cry', tears: 2 },
  blink:     { eyes: { open: .06 }, brows: {}, mouth: 'rest' },
};
export function drawFace(g, emo, sex = 'm', o = {}) {
  const e = typeof emo === 'string' ? EMOTIONS[emo] : emo, f = sex === 'f' || sex === 'female', S = STYLES[o.style || 'chibi'];
  const E = { ...(e.eyes || {}), ...(o.eyes || {}) }, drawEye = S.rx ? classicEye : shapedEye;
  if (f || e.blush) blush(g, S, (e.blush || 0) + (f ? .16 : 0));
  for (const s of [-1, 1]) drawEye(g, s, f, S, E);
  brow(g, -1, f, S, { ...(e.brows || {}), ...(e.browR || {}) }); brow(g, 1, f, S, { ...(e.brows || {}), ...(e.browL || {}) });
  if (e.scrunch) scrunch(g, S);
  g.save(); g.translate(CX, S.my); g.scale(S.ms, S.ms); g.translate(-CX, -MY); MOUTHS[o.mouth || e.mouth](g, f); g.restore();
  if (e.tears) tears(g, S, e.tears > 1); if (e.sweat) sweat(g, S);
}
export function faceCanvas(emo, sex = 'm', o = {}) { const c = document.createElement('canvas'); c.width = c.height = 1024; drawFace(c.getContext('2d'), emo, sex, o); return c; }
