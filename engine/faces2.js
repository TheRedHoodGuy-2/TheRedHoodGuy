// FACE KIT v2 (2026-11-19): our own drawn faces for R6, made like a 2D animation model sheet, not clip-art.
// One consistent design per sex, built from PARTS so every emotion (and later blinks, eye darts, visemes) is the same
// face changing, never a new drawing:
//   eyes  = almond white + big dark iris + 2 catchlights, cut by an upper lid (thick lash line) and a lower lid;
//           openness, lid tilt, squint (lower lid up) and gaze are parameters
//   brows = tapered brush shapes (thick at the inside, thin at the tail) with height, tilt and arch
//   mouth = tapered ink line when closed; when open a real shape with a dark interior, upper teeth and tongue
//   extras = blush, tears, sweat drop, scrunch lines
// Male: heavier straight brows, narrower eyes, no lashes. Female: wing at the outer corner + 3 lashes, slightly larger
// eyes, finer arched brows, a soft lip tint and a little blush. Same proportions, same line weight family.
// faceCanvas(emotion, sex, o) -> 1024 canvas (transparent) in the R6 head decal layout (eyes ~y 430, mouth ~y 690).
const INK = '#1e1714', IRIS = '#2a1d17', IRIS2 = '#4a3427', SCLERA = '#fbfbf8', MOUTH_IN = '#5a1b1c', TONGUE = '#d9606a', TEETH = '#fffdf8';
const LIP_F = '#c9606b', BLUSH = 'rgba(236,110,118,', TEAR = 'rgba(120,190,255,.85)';
const CX = 512, EY = 430, MY = 690, EDX = 152;   // eye centres at CX -/+ EDX

const lerp = (a, b, t) => a + (b - a) * t;
function taper(g, pts, w0, w1, col = INK) {   // a brush stroke along pts, width w0 -> w1 (round ends)
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const t = i / (n - 1), w = lerp(w0, w1, t) / 2, nx = -dy / l * w, ny = dx / l * w; L.push([pts[i][0] + nx, pts[i][1] + ny]); R.push([pts[i][0] - nx, pts[i][1] - ny]); }
  g.fillStyle = col; g.beginPath(); L.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fill();
  g.beginPath(); g.arc(pts[0][0], pts[0][1], w0 / 2, 0, 7); g.fill(); g.beginPath(); g.arc(pts[n - 1][0], pts[n - 1][1], w1 / 2, 0, 7); g.fill();
}
const qpts = (x0, y0, cx, cy, x1, y1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]; });
const cpts = (p0, p1, p2, p3, n = 30) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]); });

// ---------- eye ----------
// side: -1 = character's right eye (screen left), +1 = left eye. open 0..1.15, tilt = outer corner up (+) / down (-),
// squint = lower lid raised 0..1, gaze [x, y] in -1..1, iris scale (small = fear / shock).
function eye(g, side, f, { open = 1, tilt = 0, squint = 0, gaze = [0, 0], iris = 1, arc = 0 } = {}) {
  const x = CX + side * EDX, w = f ? 64 : 60, h = (f ? 46 : 40);
  if (arc) {   // happy / laughing closed eye: an upward arch (arc = 1) or a relaxed down-curve (arc = -1)
    const p = arc > 0 ? qpts(x - w, EY + 10, x, EY - 34, x + w, EY + 10) : qpts(x - w, EY - 4, x, EY + 26, x + w, EY - 4);
    taper(g, side < 0 ? p.reverse() : p, 15, f ? 13 : 12);
    if (f && arc > 0) for (let i = 0; i < 2; i++) taper(g, [[x + side * (w - 4 - i * 14), EY + 2 - i * 10], [x + side * (w + 12 - i * 10), EY - 14 - i * 12]], 7, 3);
    return; }
  const ot = side * tilt * 14;                               // outer corner lift
  const inner = [x - side * w, EY + 4], outer = [x + side * w, EY - ot];
  const topY = EY - h * open, botY = EY + h * .62 - squint * h * .9;
  const top = cpts(inner, [inner[0] + side * w * .25, topY - 6], [outer[0] - side * w * .35, topY - 4], outer);
  const bot = cpts(outer, [outer[0] - side * w * .3, botY + 4], [inner[0] + side * w * .3, botY + 2], inner);
  g.save(); g.beginPath(); top.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); bot.forEach(([a, b]) => g.lineTo(a, b)); g.closePath();
  g.fillStyle = SCLERA; g.fill(); g.clip();
  const ir = 36 * iris * (f ? 1.06 : 1), ix = x + gaze[0] * w * .42, iy = EY - 4 + gaze[1] * h * .35;
  g.fillStyle = IRIS2; g.beginPath(); g.arc(ix, iy, ir, 0, 7); g.fill();
  g.fillStyle = IRIS; g.beginPath(); g.arc(ix, iy, ir * .78, 0, 7); g.fill();
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x - w - 10, topY - 20, 2 * w + 20, 22 + 8);   // lid shadow on the eyeball
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ix + ir * .32, iy - ir * .38, ir * .26, ir * .22, -.4, 0, 7); g.fill();
  g.beginPath(); g.arc(ix - ir * .34, iy + ir * .34, ir * .1, 0, 7); g.fill();
  g.restore();
  // lash line (upper lid): thick, heavier toward the outer corner; female gets a wing and three lashes
  taper(g, side < 0 ? top.slice().reverse() : top, f ? 12 : 10, f ? 15 : 13);
  if (f) { const o = top[top.length - 1]; taper(g, [o, [o[0] + side * 22, o[1] - 14 - tilt * 6]], 12, 3);
    for (let i = 0; i < 3; i++) { const p = top[Math.round(top.length * (.55 + i * .15))] || o; taper(g, [p, [p[0] + side * (6 + i * 5), p[1] - 16 - i * 2]], 6, 2); } }
  // lower lid: a short thin line on the outer two thirds
  const lb = bot.slice(2, Math.round(bot.length * .7)); taper(g, lb, 3, 5, 'rgba(30,23,20,.75)');
}
// ---------- brow ----------
// h = raise (+ up), tilt = inner end down (+ angry) / up (- sad), arch = curve
function brow(g, side, f, { h = 0, tilt = 0, arch = 0 } = {}) {
  const x = CX + side * EDX, y = EY - (f ? 80 : 74) - h * 22, w = f ? 62 : 66;   // brows sit low enough to clear most hairlines
  const inner = [x - side * w * .9, y + tilt * 22], outer = [x + side * w * 1.05, y - tilt * 10 + (f ? 10 : 6)];
  const mid = [x + side * w * .1, y - 12 - arch * 16 - (f ? 8 : 0)];
  taper(g, qpts(inner[0], inner[1], mid[0], mid[1], outer[0], outer[1]), f ? 15 : 24, f ? 4 : 9);
}
// ---------- mouth ----------
function closed(g, f, pts, w = 12) { if (f) { const c = pts[Math.floor(pts.length / 2)]; g.fillStyle = 'rgba(201,96,107,.45)'; g.beginPath(); g.ellipse(c[0], c[1] + 10, 34, 11, 0, 0, 7); g.fill(); } taper(g, pts, w * .55, w * .55, INK); taper(g, pts.slice(3, -3), w, w); }
function open(g, f, path, { teeth = .3, tongue = true, inner = MOUTH_IN } = {}) {
  g.save(); path(); g.fillStyle = inner; g.fill(); g.clip();
  const b = bounds(g, path);
  if (tongue) { g.fillStyle = TONGUE; g.beginPath(); g.ellipse(b.cx, b.y1 + 6, (b.x1 - b.x0) * .32, (b.y1 - b.y0) * .32, 0, 0, 7); g.fill(); }
  if (teeth) { g.fillStyle = TEETH; g.fillRect(b.x0, b.y0 - 4, b.x1 - b.x0, (b.y1 - b.y0) * teeth + 4); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(b.x0, b.y0 + (b.y1 - b.y0) * teeth - 3, b.x1 - b.x0, 3); }
  g.restore(); path(); g.lineWidth = 10; g.lineJoin = 'round'; g.strokeStyle = INK; g.stroke();
  if (f) { g.fillStyle = 'rgba(201,96,107,.55)'; g.beginPath(); g.ellipse(b.cx, b.y1 + 14, (b.x1 - b.x0) * .26, 9, 0, 0, 7); g.fill(); }
}
function bounds(g, path) { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; path(); const m = g.getTransform();   // isPointInPath takes canvas pixels: map path-space points through the current transform
  for (let y = MY - 160; y < MY + 200; y += 3) for (let x = CX - 220; x < CX + 220; x += 3) if (g.isPointInPath(m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return { x0, x1, y0, y1, cx: (x0 + x1) / 2 }; }
const MOUTHS = {
  rest: (g, f) => closed(g, f, qpts(CX - 46, MY, CX, MY + 8, CX + 46, MY)),
  smile: (g, f) => closed(g, f, qpts(CX - 70, MY - 16, CX, MY + 40, CX + 70, MY - 16), 13),
  smirk: (g, f) => closed(g, f, qpts(CX - 40, MY + 6, CX + 20, MY + 18, CX + 70, MY - 18), 12),
  flat: (g, f) => closed(g, f, qpts(CX - 44, MY + 4, CX, MY + 6, CX + 44, MY + 4), 11),
  frown: (g, f) => closed(g, f, qpts(CX - 56, MY + 22, CX, MY - 18, CX + 56, MY + 22), 12),
  wobble: (g, f) => closed(g, f, Array.from({ length: 25 }, (_, i) => [CX - 48 + i * 4, MY + 8 + Math.sin(i * .9) * 7]), 10),
  squiggle: (g, f) => closed(g, f, Array.from({ length: 25 }, (_, i) => [CX - 30 + i * 3.6, MY + 6 + Math.sin(i * .7) * 6 - i * .6]), 10),
  grin: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 84, MY - 22); g.quadraticCurveTo(CX, MY - 6, CX + 84, MY - 22); g.quadraticCurveTo(CX + 70, MY + 66, CX, MY + 70); g.quadraticCurveTo(CX - 70, MY + 66, CX - 84, MY - 22); g.closePath(); }, { teeth: .34 }),
  laugh: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 88, MY - 30); g.quadraticCurveTo(CX, MY - 18, CX + 88, MY - 30); g.quadraticCurveTo(CX + 76, MY + 96, CX, MY + 100); g.quadraticCurveTo(CX - 76, MY + 96, CX - 88, MY - 30); g.closePath(); }, { teeth: .24 }),
  o: (g, f) => open(g, f, () => { g.beginPath(); g.ellipse(CX, MY + 14, 26, 34, 0, 0, 7); }, { teeth: 0, tongue: false }),
  gasp: (g, f) => open(g, f, () => { g.beginPath(); g.ellipse(CX, MY + 26, 42, 60, 0, 0, 7); }, { teeth: .12 }),
  scared: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 64, MY + 4); for (let i = 0; i <= 16; i++) g.lineTo(CX - 64 + i * 8, MY + 4 + (i % 2 ? -7 : 5)); g.quadraticCurveTo(CX + 50, MY + 62, CX, MY + 64); g.quadraticCurveTo(CX - 50, MY + 62, CX - 64, MY + 4); g.closePath(); }, { teeth: .22, tongue: false }),
  grimace: (g, f) => { const path = () => { g.beginPath(); g.moveTo(CX - 78, MY - 8); g.quadraticCurveTo(CX, MY - 30, CX + 78, MY - 8); g.lineTo(CX + 70, MY + 30); g.quadraticCurveTo(CX, MY + 14, CX - 70, MY + 30); g.closePath(); };
    open(g, f, path, { teeth: 1, tongue: false }); g.save(); path(); g.clip(); g.strokeStyle = 'rgba(30,23,20,.55)'; g.lineWidth = 4; g.beginPath(); g.moveTo(CX - 78, MY + 10); g.quadraticCurveTo(CX, MY - 4, CX + 78, MY + 10); g.stroke();
    for (const x of [-48, -16, 16, 48]) { g.beginPath(); g.moveTo(CX + x, MY - 30); g.lineTo(CX + x * 1.02, MY + 34); g.stroke(); } g.restore(); },   // clenched teeth: upper and lower rows
  cry: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 66, MY + 40); g.quadraticCurveTo(CX - 40, MY - 22, CX, MY - 20); g.quadraticCurveTo(CX + 40, MY - 22, CX + 66, MY + 40); g.quadraticCurveTo(CX, MY + 30, CX - 66, MY + 40); g.closePath(); }, { teeth: .18 }),
  disgust: (g, f) => open(g, f, () => { g.beginPath(); g.moveTo(CX - 60, MY + 14); g.quadraticCurveTo(CX - 10, MY - 6, CX + 56, MY - 18); g.quadraticCurveTo(CX + 40, MY + 30, CX - 60, MY + 14); g.closePath(); }, { teeth: .7, tongue: false }),
};
// ---------- extras ----------
const blush = (g, a) => { for (const s of [-1, 1]) { const gr = g.createRadialGradient(CX + s * 220, EY + 120, 4, CX + s * 220, EY + 120, 70); gr.addColorStop(0, BLUSH + a + ')'); gr.addColorStop(1, BLUSH + '0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(CX + s * 220, EY + 120, 80, 46, 0, 0, 7); g.fill(); } };
const tears = (g, stream) => { for (const s of [-1, 1]) { const x = CX + s * (EDX + 10), y = EY + 30; g.fillStyle = TEAR;
  if (stream) { g.beginPath(); g.moveTo(x - 12, y); g.quadraticCurveTo(x - 18, y + 120, x - 8, y + 210); g.lineTo(x + 10, y + 210); g.quadraticCurveTo(x + 18, y + 120, x + 12, y); g.closePath(); g.fill(); }
  else { g.beginPath(); g.moveTo(x, y + 10); g.quadraticCurveTo(x + 18, y + 44, x, y + 54); g.quadraticCurveTo(x - 18, y + 44, x, y + 10); g.fill(); } } };
const sweat = g => { g.fillStyle = TEAR; const x = CX + 300, y = EY - 150; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 26, y + 50, x, y + 64); g.quadraticCurveTo(x - 26, y + 50, x, y); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(x - 6, y + 44, 5, 9, 0, 0, 7); g.fill(); };
const scrunch = g => { for (const s of [-1, 1]) taper(g, qpts(CX + s * 26, EY + 30, CX + s * 40, EY + 58, CX + s * 30, EY + 84), 6, 3, 'rgba(30,23,20,.6)'); };
const shade = g => { g.fillStyle = 'rgba(70,90,160,.18)'; g.fillRect(CX - 300, EY - 120, 600, 110); };   // the "gloom" band of a scared cartoon face

// ---------- emotions: every one is the SAME face, only the parameters change ----------
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
  // talking / blink frames used by the animation (same face): visemes later go in this table
  blink:     { eyes: { open: .06 }, brows: {}, mouth: 'rest' },
};
export function drawFace(g, emo, sex = 'm', o = {}) {
  const e = typeof emo === 'string' ? EMOTIONS[emo] : emo, f = sex === 'f';
  g.save(); g.translate(CX, 640); g.scale(1.62, 1.62); g.translate(-CX, -600);   // features sized to read on a phone (Roblox faces fill the head front)
  if (f || e.blush) blush(g, (e.blush || 0) + (f ? .18 : 0));
  for (const s of [-1, 1]) eye(g, s, f, { ...(e.eyes || {}), ...(o.eyes || {}) });
  brow(g, -1, f, { ...(e.brows || {}), ...(e.browR || {}) }); brow(g, 1, f, { ...(e.brows || {}), ...(e.browL || {}) });
  if (e.scrunch) scrunch(g);
  MOUTHS[o.mouth || e.mouth](g, f);
  if (e.tears) tears(g, e.tears > 1); if (e.sweat) sweat(g);
  g.restore();
}
export function faceCanvas(emo, sex = 'm', o = {}) { const c = document.createElement('canvas'); c.width = c.height = 1024; drawFace(c.getContext('2d'), emo, sex, o); return c; }
