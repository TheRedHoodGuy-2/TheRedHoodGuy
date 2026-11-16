// Stylised drawn faces for the blocky avatars: thick ink lines, glossy oval eyes, minimal shapes (our own designs).
// face(name, 'm' | 'f') -> CanvasTexture (512x512, transparent). FACES lists every expression name.
// Female variants add lashes, rounder eyes, tinted lips and a little blush; male variants get heavier brows.
import * as THREE from 'three';

const INK = '#1d1512', MOUTH = '#4a1714', TONGUE = '#e2626a', TEETH = '#ffffff', LIP = '#d9576b', BLUSH = 'rgba(240,96,110,', TEAR = '#7cc8ff';
const EX = [186, 326], EY = 214, MX = 256, MY = 336;

// ---------- eyes ----------
function ovalEye(g, x, y, { w = 26, h = 38, lookX = 0, lookY = 0, glint = true, f = false, lid = 0, squint = 0 } = {}) {
  if (f) { w *= 1.08; h *= 1.05; }
  const top = y - h + 2 * h * lid;
  g.save(); if (lid || squint) { g.beginPath(); g.rect(x - 70, top + squint * h * .6, 140, 260); g.clip(); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(x + lookX, y + lookY, w, h, 0, 0, 7); g.fill();
  if (glint) { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x + lookX + w * .32, y + lookY - h * .4, w * .3, h * .24, 0, 0, 7); g.fill(); g.beginPath(); g.arc(x + lookX - w * .3, y + lookY + h * .38, w * .12, 0, 7); g.fill(); }
  g.restore();
  if (lid) line(g, [[x - w - 8, top + 3], [x + w + 8, top + 3]], 12);
  if (f) lashes(g, x, y - h + 2 * h * lid, w, x > 256 ? 1 : -1);
}
function lashes(g, x, top, w, side) {
  g.lineWidth = 7; g.lineCap = 'round'; g.strokeStyle = INK;
  for (let i = 0; i < 3; i++) { const a = -.2 - i * .38; const sx = x + side * (w * .55 + i * 6), sy = top + 6 + i * 6; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + side * 16 * Math.cos(a), sy - 16 + i * 2); g.stroke(); }
}
function arcEye(g, x, y, up = true, w = 30, lw = 15) { g.lineWidth = lw; g.lineCap = 'round'; g.strokeStyle = INK; g.beginPath(); if (up) g.arc(x, y + 16, w, Math.PI * 1.15, Math.PI * 1.85); else g.arc(x, y - 10, w, Math.PI * .15, Math.PI * .85); g.stroke(); }
function lineEye(g, x, y, w = 30, tilt = 0) { line(g, [[x - w, y - tilt], [x + w, y + tilt]], 14); }
function xEye(g, x, y, s = 22) { line(g, [[x - s, y - s], [x + s, y + s]], 13); line(g, [[x - s, y + s], [x + s, y - s]], 13); }
function chevron(g, x, y, dir, s = 24) { line(g, [[x - dir * s, y - s], [x + dir * s * .8, y], [x - dir * s, y + s]], 14); }
function heartEye(g, x, y, s = 30) { g.fillStyle = '#e83b55'; g.beginPath(); g.moveTo(x, y + s * .9); g.bezierCurveTo(x - s * 1.5, y - s * .1, x - s * .7, y - s * 1.2, x, y - s * .35); g.bezierCurveTo(x + s * .7, y - s * 1.2, x + s * 1.5, y - s * .1, x, y + s * .9); g.fill(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(x - s * .45, y - s * .35, s * .18, s * .12, -.5, 0, 7); g.fill(); }
function starEye(g, x, y, s = 30) { g.fillStyle = '#ffc928'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? s * .45 : s, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } g.closePath(); g.fill(); g.stroke(); }
function spiralEye(g, x, y, s = 34) { g.lineWidth = 8; g.strokeStyle = INK; g.lineCap = 'round'; g.beginPath(); for (let t = 0; t < 1; t += .01) { const r = s * t, a = t * Math.PI * 5; g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } g.stroke(); }
function shades(g) { g.fillStyle = INK; for (const x of EX) { g.beginPath(); g.roundRect(x - 52, EY - 26, 104, 52, [8, 8, 30, 30]); g.fill(); } g.fillRect(EX[0] + 40, EY - 22, EX[1] - EX[0] - 80, 12); g.fillStyle = 'rgba(255,255,255,.55)'; for (const x of EX) { g.beginPath(); g.moveTo(x - 30, EY - 18); g.lineTo(x - 12, EY - 18); g.lineTo(x - 30, EY + 6); g.fill(); } }

// ---------- brows ----------
function brow(g, x, y, ang, { len = 46, lw = 12 } = {}) { g.save(); g.translate(x, y); g.rotate(ang); g.lineWidth = lw; g.lineCap = 'round'; g.strokeStyle = INK; g.beginPath(); g.moveTo(-len / 2, 0); g.quadraticCurveTo(0, -5, len / 2, 0); g.stroke(); g.restore(); }
const brows = (g, f, a = 0, dy = 0, o = {}) => { const lw = f ? 8 : 13, len = f ? 40 : 48; brow(g, EX[0], EY - 64 + dy + (o.l || 0), -a, { len, lw }); brow(g, EX[1], EY - 64 + dy + (o.r || 0), a, { len, lw }); };

// ---------- mouths ----------
// female mouth style: 'pink' (pink line), 'black' (ink, like the guy), 'lip' (ink line over a small pink lip shape)
let LIPMODE = 'pink'; const LIPPINK = '#f0798a';
function lipShape(g, pts) {   // plump lips along the mouth line: cupid's-bow upper lip, fuller lower lip, a little shine
  if (LIPMODE !== 'lip' || pts.length < 2) return;
  const n = pts.length, up = [], lo = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const th = Math.pow(Math.sin(Math.PI * t), .5), bow = 1 - .35 * Math.exp(-Math.pow((t - .5) / .09, 2));
    up.push([pts[i][0], pts[i][1] - 24 * th * bow]); lo.push([pts[i][0], pts[i][1] + 30 * th]);
  }
  g.save(); g.fillStyle = LIPPINK; g.beginPath(); up.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); lo.reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fill();
  const m = pts[Math.floor(n / 2)]; g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(m[0] + 10, m[1] + 12, 9, 4, -.1, 0, 7); g.fill(); g.restore();
}
function lipUnder(g, draw, lw, pts) { lipShape(g, pts || []); }
const lipCol = col => col === LIP ? (LIPMODE === 'pink' ? LIP : INK) : col;
function line(g, pts, lw = 13, col = INK) { if (col === LIP) lipUnder(g, null, lw, pts); col = lipCol(col); g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
function curve(g, x0, y0, cx, cy, x1, y1, lw = 13, col = INK) { if (col === LIP) lipUnder(g, null, lw, Array.from({ length: 25 }, (_, i) => { const t = i / 24, u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]; })); col = lipCol(col); g.lineWidth = lw; g.lineCap = 'round'; g.strokeStyle = col; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); }
function openMouth(g, path, { teeth = 0, tongue = true, lip = false } = {}) {
  if (lip && LIPMODE === 'lip') {   // upper + lower lip peeking out from behind the black outline (like A, plus lips)
    path(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let y = MY - 70; y < MY + 120; y += 2) for (let x = MX - 100; x < MX + 100; x += 2) if (g.isPointInPath(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const w = x1 - x0, cx = (x0 + x1) / 2; g.save(); g.fillStyle = LIPPINK;
    g.beginPath(); g.moveTo(x0 + w * .06, y0 + 4); g.quadraticCurveTo(cx - w * .25, y0 - 20, cx - w * .04, y0 - 12); g.quadraticCurveTo(cx, y0 - 7, cx + w * .04, y0 - 12); g.quadraticCurveTo(cx + w * .25, y0 - 20, x1 - w * .06, y0 + 4); g.closePath(); g.fill();   // upper lip, cupid's bow
    g.beginPath(); g.ellipse(cx, y1 + 2, w * .3, 15, 0, 0, Math.PI * 2); g.fill();                                     // lower lip
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(cx + w * .1, y1 + 7, 9, 4, -.1, 0, 7); g.fill(); g.restore();
  }
  g.save(); path(); g.fillStyle = MOUTH; g.fill(); g.clip();
  if (tongue) { g.fillStyle = TONGUE; g.beginPath(); g.ellipse(MX, MY + 58, 46, 30, 0, 0, 7); g.fill(); }
  if (teeth) { g.fillStyle = TEETH; g.fillRect(MX - 80, MY - 30, 160, teeth); }
  g.restore(); path(); g.lineWidth = 11; g.strokeStyle = lip && LIPMODE === 'pink' ? LIP : INK; g.stroke();
}
const M = {
  smile: (g, f) => curve(g, MX - 50, MY - 6, MX, MY + 38, MX + 50, MY - 6, 13, f ? LIP : INK),
  bigSmile: (g, f) => curve(g, MX - 64, MY - 14, MX, MY + 52, MX + 64, MY - 14, 14, f ? LIP : INK),
  smirk: (g, f) => curve(g, MX - 20, MY + 10, MX + 18, MY + 20, MX + 54, MY - 8, 12, f ? LIP : INK),
  flat: g => line(g, [[MX - 34, MY + 8], [MX + 34, MY + 8]], 12),
  small: (g, f) => curve(g, MX - 22, MY + 4, MX, MY + 16, MX + 22, MY + 4, 11, f ? LIP : INK),
  frown: g => curve(g, MX - 44, MY + 24, MX, MY - 14, MX + 44, MY + 24),
  pout: (g, f) => { g.fillStyle = f ? LIP : '#b9545c'; g.beginPath(); g.ellipse(MX, MY + 12, 18, 13, 0, 0, 7); g.fill(); },
  wavy: g => { const p = []; for (let i = 0; i <= 8; i++) p.push([MX - 44 + i * 11, MY + 8 + (i % 2 ? -8 : 8)]); line(g, p, 11); },
  o: (g, f) => openMouth(g, () => { g.beginPath(); g.ellipse(MX, MY + 14, 20, 28, 0, 0, 7); }, { tongue: false, lip: f }),
  bigO: (g, f) => openMouth(g, () => { g.beginPath(); g.ellipse(MX, MY + 22, 36, 48, 0, 0, 7); }, { lip: f }),
  grin: (g, f) => openMouth(g, () => { g.beginPath(); g.moveTo(MX - 62, MY - 12); g.quadraticCurveTo(MX, MY - 22, MX + 62, MY - 12); g.quadraticCurveTo(MX + 54, MY + 62, MX, MY + 64); g.quadraticCurveTo(MX - 54, MY + 62, MX - 62, MY - 12); g.closePath(); }, { teeth: 26, lip: f }),
  laugh: (g, f) => openMouth(g, () => { g.beginPath(); g.moveTo(MX - 70, MY - 18); g.lineTo(MX + 70, MY - 18); g.quadraticCurveTo(MX + 60, MY + 80, MX, MY + 82); g.quadraticCurveTo(MX - 60, MY + 80, MX - 70, MY - 18); g.closePath(); }, { teeth: 22, lip: f }),
  dGrin: (g, f) => openMouth(g, () => { g.beginPath(); g.moveTo(MX - 40, MY - 20); g.lineTo(MX + 40, MY - 20); g.quadraticCurveTo(MX + 40, MY + 50, MX, MY + 52); g.quadraticCurveTo(MX - 40, MY + 50, MX - 40, MY - 20); g.closePath(); }, { teeth: 18, lip: f }),
  scream: (g, f) => openMouth(g, () => { g.beginPath(); g.moveTo(MX - 38, MY - 6); g.quadraticCurveTo(MX, MY - 26, MX + 38, MY - 6); g.lineTo(MX + 30, MY + 70); g.quadraticCurveTo(MX, MY + 84, MX - 30, MY + 70); g.closePath(); }, { lip: f }),
  sadOpen: g => openMouth(g, () => { g.beginPath(); g.moveTo(MX - 46, MY + 40); g.quadraticCurveTo(MX, MY - 34, MX + 46, MY + 40); g.closePath(); }, {}),
  teeth: g => { g.fillStyle = TEETH; g.beginPath(); g.roundRect(MX - 56, MY - 8, 112, 40, 14); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke(); line(g, [[MX - 56, MY + 12], [MX + 56, MY + 12]], 6); for (const x of [-28, 0, 28]) line(g, [[MX + x, MY - 8], [MX + x, MY + 32]], 6); },
  zigzag: g => { const p = []; for (let i = 0; i <= 6; i++) p.push([MX - 42 + i * 14, MY + 10 + (i % 2 ? -10 : 10)]); line(g, p, 11); },
  tongue: (g, f) => { curve(g, MX - 44, MY - 4, MX, MY + 30, MX + 44, MY - 4, 12, f ? LIP : INK); g.fillStyle = TONGUE; g.beginPath(); g.ellipse(MX + 14, MY + 24, 18, 22, .2, 0, Math.PI); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); },
  cat: (g, f) => { const c = f ? LIP : INK; curve(g, MX - 40, MY + 2, MX - 20, MY + 24, MX, MY + 4, 11, c); curve(g, MX, MY + 4, MX + 20, MY + 24, MX + 40, MY + 2, 11, c); },
  evil: g => openMouth(g, () => { g.beginPath(); g.moveTo(MX - 70, MY - 22); g.quadraticCurveTo(MX, MY + 30, MX + 70, MY - 22); g.quadraticCurveTo(MX, MY + 76, MX - 70, MY - 22); g.closePath(); }, { teeth: 70, tongue: false }),
  side: g => curve(g, MX - 6, MY + 14, MX + 26, MY + 20, MX + 50, MY + 2, 12),
  kiss: (g, f) => { const c = f ? LIP : INK; curve(g, MX - 8, MY - 8, MX + 16, MY + 2, MX - 4, MY + 12, 10, c); curve(g, MX - 4, MY + 12, MX + 16, MY + 22, MX - 8, MY + 32, 10, c); },
};
const blush = (g, a = .35, n = 0) => { g.fillStyle = BLUSH + a + ')'; for (const x of [EX[0] - 36, EX[1] + 36]) { g.beginPath(); g.ellipse(x, EY + 74, 34, 17, 0, 0, 7); g.fill(); if (n) { g.lineWidth = 5; g.strokeStyle = 'rgba(220,60,80,.7)'; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(x + i * 14 - 6, EY + 64); g.lineTo(x + i * 14 + 4, EY + 84); g.stroke(); } } } };
const tear = (g, x, y, s = 1) => { g.fillStyle = TEAR; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 16 * s, y + 30 * s, x, y + 38 * s); g.quadraticCurveTo(x - 16 * s, y + 30 * s, x, y); g.fill(); };
const sweat = g => { g.fillStyle = TEAR; g.beginPath(); g.moveTo(420, 110); g.quadraticCurveTo(446, 156, 424, 170); g.quadraticCurveTo(400, 160, 420, 110); g.fill(); };
const vein = g => { g.strokeStyle = '#d23a3a'; g.lineWidth = 8; g.lineCap = 'round'; const cx = 398, cy = 92; for (const [a, b] of [[[-16, -4], [-4, -4]], [[4, -16], [4, -4]], [[16, 4], [4, 4]], [[-4, 16], [-4, 4]]]) { g.beginPath(); g.moveTo(cx + a[0], cy + a[1]); g.quadraticCurveTo(cx, cy, cx + b[0], cy + b[1]); g.stroke(); } };

// deadpan side-eye: pupils pushed to the look side, a heavy lid SLANTED down toward that side (the cartoon side-eye cue,
// since our eyes have no whites), low flat brows, mouth pressed flat and shifted toward the look side.
// Drawn from Xavier's sketch (2026-10-22): one eye under a flat lid line with the pupil hanging off its look-side end,
// the other eye plain under a high arched brow, mouth a flat line with a hook at the look side plus a short lip line.
// Drawn looking right (s = 1); s = -1 mirrors it.
function sideEye(g, f, s) {
  g.save(); if (s < 0) { g.translate(512, 0); g.scale(-1, 1); }
  const [L, R] = EX;
  // everything stays below EY-60: higher than that sits under the hair cap
  line(g, [[L - 58, EY - 30], [L + 20, EY - 22]], 14);                                     // flat lid / brow
  g.fillStyle = INK; g.beginPath(); g.ellipse(L + 6, EY, 17, 24, 0, 0, 7); g.fill();      // pupil hanging under its end
  g.beginPath(); g.ellipse(R + 36, EY + 4, 18, 28, 0, 0, 7); g.fill();                     // plain eye, at the brow's OUTER end (Xavier)
  g.fillStyle = '#fff'; for (const [x, y] of [[L + 11, EY - 8], [R + 42, EY - 6]]) { g.beginPath(); g.ellipse(x, y, 5, 6, 0, 0, 7); g.fill(); }
  curve(g, R - 24, EY - 26, R + 16, EY - 86, R + 54, EY - 40, 12);                        // high arched brow
  line(g, [[MX - 48, MY + 4], [MX + 46, MY - 8], [MX + 34, MY - 24]], 12);                // mouth + hook
  line(g, [[MX - 4, MY + 20], [MX + 26, MY + 16]], 10);                                    // short lip line
  g.restore();
}

// ---------- the expressions ----------
const eyes = (g, f, o = {}) => EX.forEach(x => ovalEye(g, x, EY, { f, ...o }));
export const FACE_DEFS = {
  neutral:    (g, f) => { eyes(g, f); brows(g, f, 0); M.small(g, f); },
  smile:      (g, f) => { eyes(g, f); brows(g, f, -.05); M.smile(g, f); if (f) blush(g, .25); },
  happy:      (g, f) => { EX.forEach(x => arcEye(g, x, EY)); brows(g, f, -.1, -6); M.grin(g, f); blush(g, .35); },
  laugh:      (g, f) => { EX.forEach((x, i) => chevron(g, x, EY, i ? -1 : 1)); brows(g, f, -.12, -8); M.laugh(g, f); blush(g, .4); },
  grin:       (g, f) => { eyes(g, f); brows(g, f, -.08, -4); M.dGrin(g, f); },
  wink:       (g, f) => { ovalEye(g, EX[0], EY, { f }); arcEye(g, EX[1], EY); brows(g, f, -.1, -2, { r: -6 }); M.tongue(g, f); if (f) blush(g, .3); },
  smirk:      (g, f) => { ovalEye(g, EX[0], EY, { f, lid: .35 }); ovalEye(g, EX[1], EY, { f, lid: .2 }); brows(g, f, 0, 0, { l: 6, r: -10 }); M.smirk(g, f); },
  cool:       (g, f) => { shades(g); M.smirk(g, f); },
  surprised:  (g, f) => { eyes(g, f, { w: 22, h: 40 }); brows(g, f, -.15, -18); M.o(g, f); },
  shocked:    (g, f) => { eyes(g, f, { w: 18, h: 30, glint: true }); brows(g, f, -.25, -24); M.bigO(g, f); },
  scream:     (g, f) => { EX.forEach(x => { g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.ellipse(x, EY, 34, 40, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(x, EY + 4, 9, 0, 7); g.fill(); }); brows(g, f, -.3, -28); M.scream(g, f); },
  sad:        (g, f) => { eyes(g, f, { h: 32 }); brows(g, f, .32, -2); M.frown(g, f); },
  cry:        (g, f) => { EX.forEach(x => arcEye(g, x, EY, false)); brows(g, f, .35, -2); M.sadOpen(g, f); tear(g, EX[0] - 6, EY + 22, 1.1); tear(g, EX[1] + 6, EY + 22, 1.1); },
  angry:      (g, f) => { eyes(g, f, { h: 30, lid: .18 }); brows(g, f, -.42, 6); M.frown(g, f); vein(g); },
  furious:    (g, f) => { eyes(g, f, { h: 26, lid: .25, glint: false }); brows(g, f, -.55, 10); M.teeth(g, f); vein(g); },
  annoyed:    (g, f) => { eyes(g, f, { lid: .45, h: 32 }); brows(g, f, -.3, 10); curve(g, MX - 36, MY + 18, MX, MY + 6, MX + 36, MY + 18, 12); },   // brows pulled down, half lids, mouth pressed down
  frustrated: (g, f) => { eyes(g, f, { lid: .3, h: 30 }); brows(g, f, -.45, 12); curve(g, MX - 38, MY + 22, MX, MY + 2, MX + 38, MY + 22, 13); },   // angry brows, mouth CLOSED and pressed down (Xavier)
  squint:     (g, f) => { EX.forEach(x => { line(g, [[x - 34, EY + 2], [x + 34, EY - 2]], 13); g.fillStyle = INK; g.beginPath(); g.ellipse(x - 2, EY + 12, 11, 12, 0, 0, 7); g.fill(); }); brows(g, f, -.3, 16); M.o(g, f); },   // Xavier's sketch: slit lids with the pupil peeking under, small open mouth
  bored:      (g, f) => { eyes(g, f, { lid: .62, lookY: 6 }); brows(g, f, .12, 10); line(g, [[MX - 26, MY + 14], [MX + 26, MY + 18]], 11); },   // droopy lids, brows sagging outward, slack flat mouth (no smile)
  yawn:       (g, f) => { EX.forEach(x => line(g, [[x - 28, EY + 4], [x + 28, EY + 4]], 13)); brows(g, f, -.15, -10); openMouth(g, () => { g.beginPath(); g.ellipse(MX, MY + 26, 34, 50, 0, 0, 7); }, { tongue: true }); tear(g, EX[0] - 34, EY + 10, .55); tear(g, EX[1] + 34, EY + 10, .55); },   // huge yawn: eyes squeezed shut, tall open mouth, little tears
  sleepy:     (g, f) => { EX.forEach(x => lineEye(g, x, EY + 10, 28)); brows(g, f, .05, 10); M.o(g, f); },
  nervous:    (g, f) => { eyes(g, f, { w: 20, h: 30 }); brows(g, f, .3, -10); M.wavy(g, f); sweat(g); },
  awkward:    (g, f) => { eyes(g, f, { lookX: 10 }); brows(g, f, .22, -6); M.teeth(g, f); sweat(g); },
  thinking:   (g, f) => { eyes(g, f, { lookX: 10, lookY: -10 }); brows(g, f, 0, 0, { l: 8, r: -14 }); M.side(g, f); },
  confused:   (g, f) => { ovalEye(g, EX[0], EY, { f, w: 20, h: 30 }); ovalEye(g, EX[1], EY, { f, w: 30, h: 44 }); brows(g, f, .1, 0, { l: 10, r: -22 }); M.zigzag(g, f); g.fillStyle = INK; g.font = '800 70px sans-serif'; g.fillText('?', EX[1] + 48, EY - 50); },
  skeptical:  (g, f) => { ovalEye(g, EX[0], EY, { f, lid: .45 }); ovalEye(g, EX[1], EY, { f }); brows(g, f, 0, 0, { l: 14, r: -18 }); M.flat(g, f); },
  love:       (g, f) => { EX.forEach(x => heartEye(g, x, EY)); M.bigSmile(g, f); blush(g, .4); },
  starstruck: (g, f) => { EX.forEach(x => starEye(g, x, EY, 34)); brows(g, f, -.1, -10); M.dGrin(g, f); },
  dizzy:      (g, f) => { EX.forEach(x => spiralEye(g, x, EY)); M.wavy(g, f); },
  dead:       (g, f) => { EX.forEach(x => xEye(g, x, EY)); M.tongue(g, f); },
  evil:       (g, f) => { eyes(g, f, { lid: .3, glint: false }); brows(g, f, -.5, 6); M.evil(g, f); },
  shy:        (g, f) => { EX.forEach(x => arcEye(g, x, EY + 6, true, 24, 12)); brows(g, f, .12, -4); M.cat(g, f); blush(g, .5, 1); },
  pout:       (g, f) => { eyes(g, f, { lookX: -8 }); brows(g, f, -.2, 2); M.pout(g, f); blush(g, .3); },
  determined: (g, f) => { eyes(g, f, { h: 32, lid: .12 }); brows(g, f, -.3, 2); M.flat(g, f); },
  // innocent whistle (added for the tickle video): eyes slid to the side and up, brows lifted, small round pursed mouth
  whistle:    (g, f) => { eyes(g, f, { lookX: 12, lookY: -8 }); brows(g, f, .1, -10); g.fillStyle = f ? LIP : INK; g.beginPath(); g.ellipse(MX + 14, MY + 10, 13, 15, 0, 0, 7); g.fill(); g.fillStyle = MOUTH; g.beginPath(); g.ellipse(MX + 14, MY + 10, 6, 8, 0, 0, 7); g.fill(); },
  // deadpan side-eye (remote video): heavy half lids, pupils slid hard to one side, brows low and flat, mouth pressed flat
  sideeyeL:   (g, f) => sideEye(g, f, -1),
  sideeyeR:   (g, f) => sideEye(g, f, 1),
  kiss:       (g, f) => { ovalEye(g, EX[0], EY, { f }); arcEye(g, EX[1], EY); brows(g, f, -.06, -4); M.kiss(g, f); blush(g, .4); },
  silly:      (g, f) => { ovalEye(g, EX[0], EY, { f, lookX: 8 }); ovalEye(g, EX[1], EY, { f, w: 32, h: 44, lookX: -8 }); M.tongue(g, f); },
  // about to fire back: confident eyes + brows, mouth OPEN (Xavier 2026-11-13: "opened your mouth" = it opens, confident)
  confidentOpen: (g, f) => { eyes(g, f, { h: 34, lid: .08 }); brows(g, f, -.28, 0); M.o(g, f); },
  // blank (Xavier 2026-11-13: buffering / frozen = blank, never smiling): wide still eyes, flat brows, flat mouth
  blank:      (g, f) => { eyes(g, f, { h: 40 }); brows(g, f, 0, -4); M.flat(g, f); },
  // embarrassed: eyes drop away, worried brows, wobbly mouth, deep blush with lines, a sweat drop
  embarrassed: (g, f) => { eyes(g, f, { lookX: -8, lookY: 12, h: 30 }); brows(g, f, .32, -4); M.wavy(g, f); blush(g, .6, 1); sweat(g); },
  cringe:     (g, f) => { EX.forEach((x, i) => chevron(g, x, EY, i ? -1 : 1, 20)); brows(g, f, .25, -2); M.teeth(g, f); },
  // Xavier's sketches (growl video, 2026-10-25)
  // pain, biting the lower lip: both eyes squeezed shut into converging strokes, brows pinched, top teeth biting down
  painBite:   (g, f) => { EX.forEach((x, i) => { const d = i ? -1 : 1; line(g, [[x - d * 40, EY - 22], [x + d * 22, EY + 6]], 12); line(g, [[x - d * 44, EY + 2], [x + d * 22, EY + 6]], 12); });
    brows(g, f, .38, 4); g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 9; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(MX - 62, MY + 4); g.quadraticCurveTo(MX, MY - 6, MX + 62, MY + 2); g.lineTo(MX + 60, MY + 26);
    for (let i = 0; i <= 6; i++) { const x = MX + 60 - i * 20; g.quadraticCurveTo(x - 5, MY + 38, x - 10, MY + 26 + (i % 2) * 6); } g.lineTo(MX - 62, MY + 24); g.closePath(); g.fill(); g.stroke(); },
  // sudden shock / "it's coming": one big round eye, one small one, short flat mouth off to the side
  shockOdd:   (g, f) => { g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 9; g.beginPath(); g.ellipse(EX[0] - 6, EY + 4, 50, 52, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(EX[0] - 2, EY + 6, 7, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(EX[1] + 14, EY - 6, 22, 26, .2, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(EX[1] + 14, EY - 4, 5, 0, 7); g.fill();
    line(g, [[MX + 20, MY + 30], [MX + 74, MY + 30]], 11); },
  // holding his breath: face flushed red, cheeks puffed out round, lips pressed into a tight bump, eyes darting (L / R)
  puffL:      (g, f) => FACE_DEFS.puffR(g, f, -1),
  puffR:      (g, f, s = 1) => { g.fillStyle = 'rgba(232,70,70,.28)'; g.beginPath(); g.ellipse(256, 300, 200, 150, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(235,60,70,.55)'; for (const x of [EX[0] - 46, EX[1] + 46]) { g.beginPath(); g.ellipse(x, MY - 10, 52, 40, 0, 0, 7); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 9; for (const x of [EX[0] - 46, EX[1] + 46]) { const d = x < 256 ? -1 : 1; g.beginPath(); g.arc(x, MY - 10, 50, d < 0 ? Math.PI * .55 : -Math.PI * .45, d < 0 ? Math.PI * 1.45 : Math.PI * .45); g.stroke(); }
    EX.forEach(x => ovalEye(g, x, EY, { f, w: 24, h: 36, lookX: s * 13 })); brows(g, f, -.12, -8);
    g.fillStyle = INK; g.beginPath(); g.ellipse(MX, MY + 14, 20, 11, 0, 0, 7); g.fill(); },
};
export const FACES = Object.keys(FACE_DEFS);
// PHOTO FACES (Xavier 2026-10-28): a real photo face, colour-matched to the R6 skin and feathered into the head
// (made with the photoface script: kit/assets/faces/*.png, 512x512 in this decal layout). Load once in setup(), then use
// the name as an expression. No cartoon blink is drawn over it.
export const PHOTO = {};
export async function loadPhotoFace(name, src) { const img = new Image(); img.src = src; await img.decode(); FACE_DEFS[name] = g => g.drawImage(img, 0, 0, 512, 512);
  let normal = null; try { normal = await new THREE.TextureLoader().loadAsync(src.replace(/\.png$/, '_n.png')); } catch (e) { }   // <name>_n.png = its normal map (depth)
  PHOTO[name] = { normal }; }
const cache = {};
export function face(name = 'neutral', sex = 'm', lips = 'lip') {
  const key = name + sex + lips + LAYOUT; LIPMODE = lips; if (cache[key]) return cache[key];
  const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  if (LAYOUT !== 1) { g.translate(256, 268); g.scale(LAYOUT, LAYOUT); g.translate(-256, -268); }
  (FACE_DEFS[name] || FACE_DEFS.neutral)(g, sex === 'f');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (PHOTO[name]) Object.assign(t.userData, { noBlink: true, photo: true, normal: PHOTO[name].normal }); return (cache[key] = t);
}

// ---- Xavier 2026-10-21: "go back to the first variants of faces" (the sitting pose-test look, commit 106becd): drawn
// at 1:1, eyes at EX. Later experiments (eyes moved closer, 1.4x layout, 1.3x eyes) are reverted. Kept for other modules:
let LAYOUT = 1;   // whole-face scale about (256, 268); 1 = the first variants
export let FACE_SCALE = 1; export const EYE_K = 1, MOUTH_K = 1;
export let EYE_C = EX.map(x => [x, EY]);   // eye centres on the 512 canvas (cast.js blink)
export const enlargeFeatures = src => src;  // identity now (faces are drawn at their final size)
export const setFaceScale = k => { LAYOUT = FACE_SCALE = k; EYE_C = EX.map(x => [256 + (x - 256) * k, 268 + (EY - 268) * k]); };   // look-dev
