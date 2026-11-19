// FACE KIT: many drawing styles x a big expression set (+ talking mouth shapes for lip sync), for the R6 face plane.
//   faceTex(expr, { style: 'tick', sex: 'm', lips: 'pink' })  -> CanvasTexture 512x512, transparent
//   EXPRESSIONS: every expression name. STYLES: every style name. VISEMES: talkA talkE talkO talkU talkM talkF talkL.
// An expression is a set of semantic parts (eyes / brows / mouth / extras); each style draws those parts in its own hand,
// so one expression list works in every style. Inspired by the "35 expression" sheets Xavier sent; all drawn here.
// (kit/faces.js stays as the approved face set for the two main characters.)
import * as THREE from 'three';
import { enlargeFeatures, EYE_K, MOUTH_K } from './faces.js';

const EX = [199, 313], EY = 214, MX = 256, MY = 338;
let EXv = EX, EYv = EY;   // per-style eye positions (set in drawFace)
const TONGUE = '#e8707a', TEETH = '#ffffff', TEAR = '#79c6ff', RED = '#e2334b', GOLD = '#ffc928';

// ---------------------------------------------------------------------------------------------------------------
// STYLES: how lines are drawn and what an open eye looks like
// ---------------------------------------------------------------------------------------------------------------
export const STYLES = {
  classic:  { es: 1.1, ms: 1.1, ink: '#1d1512', lw: 13, eye: 'oval', mouthFill: '#4a1714', blush: 'pink', brow: 'arc' },        // glossy ovals (our mains' family)
  tick:     { es: 1, ms: .85, ink: '#141414', lw: 8, eye: 'tick', mouthFill: '#1a1a1a', blush: 'none', brow: 'thin' },         // vertical tick eyes, thin pen (sheets 1, 2, 6)
  scribble: { es: 1.1, ms: 1, ink: '#161616', lw: 10, eye: 'hook', mouthFill: '#1a1a1a', blush: 'grey', brow: 'hook', wobble: 2.2, whisker: true },   // pencil sketch, grey cheeks (sheet 3)
  bigeye:   { es: 1.4, ms: 1.2, ex: 6, ey: 6, ink: '#121212', lw: 9, eye: 'ring', mouthFill: '#1a1a1a', blush: 'pink', brow: 'thin', wobble: .8 },  // big round eyes with pupils (sheet 4)
  toon:     { es: 1.3, ms: 1.05, ex: 2, ink: '#141414', lw: 9, eye: 'tall', mouthFill: '#1a1a1a', blush: 'both', brow: 'frame' },        // tall pupils under a lid frame (sheet 5)
  bean:     { es: 1, ms: .8, ex: -18, ey: 20, my: -10, ink: '#201816', lw: 12, eye: 'dot', mouthFill: '#5a1f1c', blush: 'pink', brow: 'none' },          // chibi dots, tiny mouths
  anime:    { es: 1.25, ms: .72, ex: 0, ink: '#1b1420', lw: 9, eye: 'almond', mouthFill: '#5c1f2a', blush: 'pink', brow: 'thin', iris: '#5b7fd6' },   // almond eyes, coloured iris, big glints
  marker:   { es: 1.15, ms: 1.15, ink: '#0d0d0d', lw: 19, eye: 'oval', mouthFill: '#0d0d0d', blush: 'none', brow: 'arc', noGlint: true },  // fat marker, solid black (classic Roblox decal energy)
  sharp:    { es: 1.2, ms: 1, ex: 0, ink: '#141018', lw: 10, eye: 'slit', mouthFill: '#2a0e14', blush: 'none', brow: 'thin' },   // angular, edgy
  pixel:    { base: 'classic', post: 'pixel', px: 44 },                                                                    // 8-bit: any style, pixelated
  neon:     { base: 'tick', post: 'neon', glow: '#38e8ff' },                                                                 // glowing lines for dark scenes
  hose:     { es: 1.35, ms: 1.3, ex: 0, ink: '#111111', lw: 12, eye: 'pie', mouthFill: '#3a1010', blush: 'none', brow: 'arc' },          // 1930s rubber-hose pie-cut eyes
};

// ---------------------------------------------------------------------------------------------------------------
// drawing helpers (wobble = hand-drawn jitter)
// ---------------------------------------------------------------------------------------------------------------
let S = STYLES.classic, NAME = 'classic', SEED = 1, FEM = false, LIPS = 'black', SPEC = null, LIPC = '#f0798a';   // SPEC: a Face Maker design (faceSpec) drawing this face   // female mouths: 'black' (Xavier's pick: plain black, no lips), 'lip' (black line + pink lips), 'pink'
const rnd = () => (SEED = (SEED * 16807) % 2147483647) / 2147483647;
function jit(pts) {
  if (!S.wobble) return pts; const out = [];
  for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 10)); for (let k = 0; k < n; k++) { const t = k / n; out.push([a[0] + (b[0] - a[0]) * t + (rnd() - .5) * S.wobble, a[1] + (b[1] - a[1]) * t + (rnd() - .5) * S.wobble]); } }
  out.push(pts[pts.length - 1]); return out;
}
function stroke(g, pts, lw = S.lw, col = S.ink, lip = false) {
  if (lip && lipsOn()) { lipShape(g, pts); lw = Math.min(lw, 11) * .85; }   // thinner line so the lips show in every style
  const draw = p => { g.beginPath(); p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };
  g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = col; draw(jit(pts));
  if (S.wobble > 2) { g.globalAlpha = .55; g.lineWidth = lw * .6; draw(jit(pts)); g.globalAlpha = 1; }   // pencil double line
}
const bez = (x0, y0, cx, cy, x1, y1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]; });
const arcPts = (x, y, r, a0, a1, ry = r, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [x + r * Math.cos(a), y + ry * Math.sin(a)]; });
function fillPath(g, pts, col) { g.fillStyle = col; g.beginPath(); jit(pts).forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }
function ell(g, x, y, rx, ry, col, rot = 0) { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); }

// ---------------------------------------------------------------------------------------------------------------
// EYES. P: { eyes, look:[x,y], lid, slant, size, wink:'L'|'R', l:{...}, r:{...} } (per-side overrides)
// ---------------------------------------------------------------------------------------------------------------
function openEye(g, x, y, side, P) {
  const k = P.size ?? 1, [lx0, ly] = P.look || [0, 0], lx = lx0 - side * 3,   // pupils converge a touch so the eyes read focused, never lazy
    lid = P.lid || 0, dy = (P.slant || 0) * 24;   // slant > 0 = angry: inner corner (towards the nose) down
  const ends = top => side > 0 ? [top + dy, top - dy] : [top - dy, top + dy];                           // [left end y, right end y]
  const lidLine = (x0, x1, top) => { if (!lid && !dy) return; const [a, b] = ends(top); stroke(g, [[x0, a], [x1, b]], S.lw * 1.05); };
  g.save();
  const clipLid = (top, w) => { if (!lid && !dy) return; const [a, b] = ends(top); g.beginPath(); g.moveTo(x - w - 20, a); g.lineTo(x + w + 20, b); g.lineTo(x + w + 20, y + 200); g.lineTo(x - w - 20, y + 200); g.closePath(); g.clip(); };
  switch (S.eye) {
    case 'oval': { const w = 25 * k, h = 37 * k, top = y - h + 2 * h * lid; clipLid(top, w); ell(g, x + lx, y + ly, w, h, S.ink); if (!P.noGlint && !S.noGlint) { ell(g, x + lx + w * .32, y + ly - h * .4, w * .3, h * .24, '#fff'); ell(g, x + lx - w * .3, y + ly + h * .38, w * .12, w * .12, '#fff'); } g.restore(); lidLine(x - w - 8, x + w + 8, top + 3); break; }
    case 'tick': { const h = 30 * k, top = y - h + 2 * h * lid; clipLid(top, 12); stroke(g, [[x + lx, y - h + ly], [x + lx, y + h + ly]], S.lw * 1.15); g.restore(); lidLine(x - 22, x + 22, top); break; }
    case 'hook': { const h = 30 * k, top = y - h + 2 * h * lid; clipLid(top, 12); stroke(g, [[x + lx - 3, y - h + ly], [x + lx, y + h * .8 + ly], [x + lx + side * 9, y + h + ly - 2]], S.lw * 1.2); g.restore(); lidLine(x - 24, x + 24, top); break; }
    case 'iris': {   // Face Maker: coloured iris + dark pupil + glints, inked rim
      const w = 24 * k, h = 31 * k, top = y - h + 2 * h * lid; clipLid(top, w); ell(g, x + lx, y + ly, w + 4, h + 4, S.ink); ell(g, x + lx, y + ly, w, h, S.iris || '#4a3426');
      ell(g, x + lx, y + ly + h * .08, w * .5, h * .5, S.ink); if (!P.noGlint && !S.noGlint) { ell(g, x + lx + w * .34, y + ly - h * .38, w * .32, h * .25, '#fff'); ell(g, x + lx - w * .3, y + ly + h * .42, w * .13, w * .13, '#fff'); }
      g.restore(); lidLine(x - w - 10, x + w + 10, top + 3); break; }
    case 'lash': {   // Face Maker: the closed, lashed eye (popular Roblox girl face): a thick soft u-curve, lashes flicking out from the outer half
      const w = 30 * k, cy = y - 12 * k + lid * 8, ry = w * .55; g.restore();
      stroke(g, arcPts(x, cy, w, Math.PI * .08, Math.PI * .92, ry), S.lw * 1.35);
      const n = Math.max(2, SPEC ? SPEC.eye.lashes : 3), L = 16 * k * (SPEC ? SPEC.eye.lashLen : 1);
      for (let i = 0; i < n; i++) {   // from the outer corner along the curve, each lash flicks outward, the first ones upward
        const t = .08 + i * .11, a = side > 0 ? Math.PI * t : Math.PI * (1 - t), px = x + Math.cos(a) * w, py = cy + Math.sin(a) * ry, d = -.75 + i * .42;
        stroke(g, [[px, py], [px + side * Math.cos(d) * L, py + Math.sin(d) * L]], Math.max(5, S.lw * .62)); }
      return; }
    case 'ring': { const r = 40 * k, top = y - r + 2 * r * lid; clipLid(top, r); ell(g, x, y, r, r, '#fff'); g.lineWidth = S.lw; g.strokeStyle = S.ink; g.beginPath(); g.ellipse(x, y, r, r, 0, 0, 7); g.stroke(); if (!P.blank) { ell(g, x + lx * 1.4, y + ly * 1.4, r * .42 * (P.pupil ?? 1), r * .42 * (P.pupil ?? 1), S.ink); ell(g, x + lx * 1.4 + r * .14, y + ly * 1.4 - r * .16, r * .12, r * .12, '#fff'); } g.restore(); lidLine(x - r - 6, x + r + 6, top); break; }
    case 'tall': { const w = 16 * k, h = 34 * k, top = y - h - 8 + 2 * h * lid; clipLid(top, 30); ell(g, x + lx, y + ly + 4, w, h, S.ink); if (!P.noGlint) ell(g, x + lx + 5, y + ly - h * .45, w * .35, h * .2, '#fff'); g.restore();
      { const [a, b] = ends(top - 4); stroke(g, [[x - 34, a], [x + 34, b]], S.lw); } stroke(g, [[x + side * 34, top - 4], [x + side * 38, top + 30]], S.lw * .9); break; }   // lid frame + outer corner
    case 'dot': { const r = 15 * k, top = y - r + 2 * r * lid; clipLid(top, r); ell(g, x + lx * .6, y + ly * .6 + 6, r, r * 1.1, S.ink); ell(g, x + lx * .6 + 4, y + ly * .6, 4.5, 4.5, '#fff'); g.restore(); lidLine(x - 22, x + 22, top + 6); break; }
    case 'almond': { const w = 40 * k, h = 30 * k, top = y - h + 2 * h * lid; g.beginPath(); g.moveTo(x - w, y + 4); g.quadraticCurveTo(x - w * .2, y - h * 1.5, x + w, y - 4 * side); g.quadraticCurveTo(x + w * .1, y + h * 1.3, x - w, y + 4); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.save(); g.clip(); clipLid(top, w);
      ell(g, x + lx, y + ly, h * .82, h * 1.02, S.iris); ell(g, x + lx, y + ly, h * .42, h * .58, S.ink); ell(g, x + lx + h * .3, y + ly - h * .35, h * .25, h * .2, '#fff'); g.restore(); g.restore();
      stroke(g, bez(x - w - 4, y + 2, x - w * .2, y - h * 1.55, x + w + 6, y - 6 * side), S.lw * 1.4); lidLine(x - w, x + w, top); break; }
    case 'slit': { const w = 34 * k, h = 20 * k, top = y - h + 2 * h * lid; clipLid(top - 6, w); fillPath(g, [[x - w, y + side * 6], [x - w * .2, y - h - side * 4], [x + w, y - side * 8], [x + w * .3, y + h * .8]], S.ink); if (!P.noGlint) ell(g, x + lx + 6, y + ly - 6, 6, 5, '#fff'); g.restore(); lidLine(x - w, x + w, top - 6); break; }
    case 'pie': { const w = 22 * k, h = 40 * k, top = y - h + 2 * h * lid; clipLid(top, w); ell(g, x + lx, y + ly, w, h, S.ink); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(x + lx + w * .1, y + ly - h * .1); g.arc(x + lx + w * .1, y + ly - h * .1, w * .95, -Math.PI * .95, -Math.PI * .62); g.closePath(); g.fill(); g.restore(); lidLine(x - w - 8, x + w + 8, top); break; }
  }
  if (SPEC ? SPEC.eye.lashes > 0 : FEM && !['bean', 'tick', 'scribble', 'hose'].includes(NAME)) lashes(g, x, y, side, k, lid);
  if (SPEC && SPEC.eye.liner > 0 && ['oval', 'iris', 'ring', 'almond', 'tall'].includes(S.eye)) {   // eyeliner along the upper lid + a wing
    const w = (S.eye === 'ring' ? 42 : S.eye === 'almond' ? 40 : 28) * k, h = (S.eye === 'ring' ? 42 : 35) * k, top = y - h * (1 - 2 * lid), t = S.lw * (.45 + SPEC.eye.liner * .7);
    stroke(g, bez(x - w, y - h * .2 + lid * h, x, top - 6, x + w, y - h * .2 + lid * h), t); stroke(g, [[x + side * w * .9, y - h * .25 + lid * h], [x + side * (w + 16 * SPEC.eye.liner + 4), y - h * .55 + lid * h]], t);
  }
}
function lashes(g, x, y, side, k, lid) {
  const w = (S.eye === 'ring' ? 40 : S.eye === 'almond' ? 40 : 26) * k, top = y - (S.eye === 'ring' ? 40 : 36) * k * (1 - 2 * lid), n = SPEC ? SPEC.eye.lashes : 3, L = 14 * (SPEC ? SPEC.eye.lashLen : 1);
  for (let i = 0; i < n; i++) { const sx = x + side * (w * .6 + i * 5), sy = top + 6 + i * 7; stroke(g, [[sx, sy], [sx + side * L, sy - L * .86 + i * 3]], Math.max(5, S.lw * .55)); }
}
function eye(g, side, P) {
  const x0 = EXv[side > 0 ? 1 : 0]; g.save(); g.translate(x0, EYv); g.scale(S.es || 1, S.es || 1); if (SPEC && SPEC.eye.tilt) g.rotate(-SPEC.eye.tilt * side); g.translate(-x0, -EYv); try { eyeIn(g, side, P); } finally { g.restore(); }
}
function eyeIn(g, side, P) {
  const x = EXv[side > 0 ? 1 : 0], y = EYv, Q = { ...P, ...(side > 0 ? P.r : P.l) }, st = (P.wink === (side > 0 ? 'R' : 'L')) ? 'closedUp' : Q.eyes || 'open', lw = S.lw * 1.1;
  switch (st) {
    case 'open': return openEye(g, x, y, side, Q);
    case 'wide': return openEye(g, x, y, side, { ...Q, size: (Q.size ?? 1) * 1.3 });
    case 'tiny': return openEye(g, x, y, side, { ...Q, size: (Q.size ?? 1) * .62 });
    case 'blank': return S.eye === 'ring' ? openEye(g, x, y, side, { ...Q, blank: true, size: 1.2 }) : (stroke(g, arcPts(x, y, 30, 0, 6.3, 34), S.lw * .8), null);
    case 'shrink': return S.eye === 'ring' ? openEye(g, x, y, side, { ...Q, pupil: .35, size: 1.25 }) : (stroke(g, arcPts(x, y, 30, 0, 6.3, 34), S.lw * .8), ell(g, x, y, 5, 5, S.ink));
    case 'closedUp': return stroke(g, arcPts(x, y + 18, 30, Math.PI * 1.15, Math.PI * 1.85), lw);         // ^ happy
    case 'closedDown': return stroke(g, arcPts(x, y - 8, 28, Math.PI * .15, Math.PI * .85), lw);          // u peaceful
    case 'line': return stroke(g, [[x - 28, y + (Q.tilt || 0) * side], [x + 28, y - (Q.tilt || 0) * side]], lw);
    case 'squeeze': return stroke(g, [[x - side * 24, y - 22], [x + side * 18, y], [x - side * 24, y + 22]], lw);   // > <
    case 'x': return (stroke(g, [[x - 20, y - 20], [x + 20, y + 20]], lw), stroke(g, [[x - 20, y + 20], [x + 20, y - 20]], lw));
    case 'spiral': return stroke(g, Array.from({ length: 90 }, (_, i) => { const t = i / 89, r = 32 * t, a = t * Math.PI * 5 * side; return [x + r * Math.cos(a), y + r * Math.sin(a)]; }), S.lw * .65);
    case 'star': { g.fillStyle = GOLD; g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 14 : 34, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } g.closePath(); g.fill(); g.lineWidth = 5; g.strokeStyle = S.ink; g.stroke(); return; }
    case 'heart': { const s = 30; g.fillStyle = RED; g.beginPath(); g.moveTo(x, y + s * .9); g.bezierCurveTo(x - s * 1.5, y - s * .1, x - s * .7, y - s * 1.2, x, y - s * .35); g.bezierCurveTo(x + s * .7, y - s * 1.2, x + s * 1.5, y - s * .1, x, y + s * .9); g.fill(); return; }
    case 'sparkle': { openEye(g, x, y, side, { ...Q, size: 1.15 }); g.fillStyle = '#fff'; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 13, a = i * Math.PI / 4; g.lineTo(x - 6 + r * Math.cos(a), y - 8 + r * Math.sin(a)); } g.fill(); return; }
    case 'teary': { openEye(g, x, y, side, { ...Q, size: 1.12 }); g.fillStyle = 'rgba(121,198,255,.75)'; g.beginPath(); g.ellipse(x, y + 26, 30, 12, 0, 0, Math.PI); g.fill(); return; }
    case 'dot': return ell(g, x, y, 8, 8, S.ink);
    case 'glasses': { g.lineWidth = 7; g.strokeStyle = S.ink; g.beginPath(); g.ellipse(x, y, 42, 36, 0, 0, 7); g.stroke(); ell(g, x - 16, y - 14, 10, 6, 'rgba(255,255,255,.7)'); return openEye(g, x, y, side, { ...Q, size: .7 }); }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// BROWS. P.brows: { ang (+ = angry), dy, l, r (extra raise per side), off:true }
// ---------------------------------------------------------------------------------------------------------------
function brows(g, P) {
  const B = P.brows || {}; if (B.off || S.brow === 'none' && !B.force) return;
  for (const side of [-1, 1]) {
    const x = EXv[side > 0 ? 1 : 0], y = EYv - (S.eye === 'ring' ? 70 : 62) * (S.es || 1) + (B.dy || 0) + (side > 0 ? (B.r || 0) : (B.l || 0)), a = -(B.ang || 0) * side, len = SPEC ? 44 * SPEC.brow.len : FEM ? 40 : 48, lw = (S.brow === 'thin' ? S.lw * .85 : S.brow === 'frame' ? S.lw * .9 : S.lw * (FEM && !SPEC ? .7 : 1)) * (SPEC ? SPEC.brow.size * (S.thick ? 1.7 : 1) : 1), bc = SPEC ? SPEC.brow.color : S.ink, y2 = y + (SPEC ? SPEC.brow.y : 0);
    // (sign fixed 2026-10-22: with a = ang * side the INNER ends went up for +ang, so every 'angry' NPC face read as worried)
    const c = Math.cos(a), s = Math.sin(a), P0 = [x - len / 2 * c, y2 - len / 2 * s], P1 = [x + len / 2 * c, y2 + len / 2 * s];
    if (S.brow === 'hook') stroke(g, [[P0[0], P0[1] + 6], P0, P1, [P1[0] + side * 3, P1[1] + 9]], lw * .9, bc);
    else stroke(g, bez(P0[0], P0[1], x, y2 - (S.straight ? 0 : 8) + (B.curve || 0), P1[0], P1[1]), lw, bc);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// MOUTHS. P.mouth + P.mx (x shift), P.mw (width scale), P.teeth, P.tongue
// ---------------------------------------------------------------------------------------------------------------
function inkCol() { return pinkOn() ? (SPEC ? LIPC : '#d9576b') : S.ink; }
// option B lips (ported from kit/faces.js, approved by Xavier): along a closed mouth line, a cupid's-bow upper lip and a fuller
// lower lip in pink, the black line on top, a little shine on the lower lip
const lipsOn = () => (SPEC || FEM) && LIPS === 'lip', pinkOn = () => (SPEC || FEM) && LIPS === 'pink';
function lipShape(g, pts) {
  if (pts.length < 2) return;
  if (pts.length < 8) { const r = []; for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 10; k++) { const t = k / 10; r.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]); } r.push(pts[pts.length - 1]); pts = r; }   // straight mouths: resample so the lips get their shape
  const n = pts.length, up = [], lo = [];
  for (let i = 0; i < n; i++) { const t = i / (n - 1), th = Math.pow(Math.sin(Math.PI * t), .5), bow = 1 - .35 * Math.exp(-Math.pow((t - .5) / .09, 2)); up.push([pts[i][0], pts[i][1] - 24 * th * bow]); lo.push([pts[i][0], pts[i][1] + 30 * th]); }
  g.save(); g.fillStyle = LIPC; g.beginPath(); up.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); lo.reverse().forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.fill();
  const m = pts[Math.floor(n / 2)]; g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(m[0] + 10, m[1] + 12, 9, 4, -.1, 0, 7); g.fill(); g.restore();
}
// open mouth: upper lip (cupid's bow) and lower lip peeking out from behind the black outline
function openLips(g, pts) {
  if (!lipsOn()) return;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = x1 - x0, cx = (x0 + x1) / 2;
  g.save(); g.fillStyle = LIPC;
  g.beginPath(); g.moveTo(x0 + w * .06, y0 + 4); g.quadraticCurveTo(cx - w * .25, y0 - 20, cx - w * .04, y0 - 12); g.quadraticCurveTo(cx, y0 - 7, cx + w * .04, y0 - 12); g.quadraticCurveTo(cx + w * .25, y0 - 20, x1 - w * .06, y0 + 4); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(cx, y1 + 2, w * .3, 15, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(cx + w * .1, y1 + 7, 9, 4, -.1, 0, 7); g.fill(); g.restore();
}
function openShape(g, pts, { teeth = 0, tongue = true, teethBottom = 0 } = {}) {
  openLips(g, pts); const fillC = S.mouthFill;
  g.save(); fillPath(g, pts, fillC); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
  const ys = pts.map(p => p[1]), y0 = Math.min(...ys), y1 = Math.max(...ys), xs = pts.map(p => p[0]), xc = (Math.min(...xs) + Math.max(...xs)) / 2;
  if (tongue) ell(g, xc, y1 + 2, (Math.max(...xs) - Math.min(...xs)) * .32, (y1 - y0) * .38, TONGUE);
  if (teeth) { g.fillStyle = TEETH; g.fillRect(xc - 120, y0 - 2, 240, teeth); }
  if (teethBottom) { g.fillStyle = TEETH; g.fillRect(xc - 120, y1 - teethBottom, 240, teethBottom + 4); }
  g.restore(); stroke(g, [...pts, pts[0]], S.lw * .9, pinkOn() ? inkCol() : S.ink);
}
function mouth(g, P, top = true) {
  if (top) { const cy = MY + (S.my || 0); g.save(); g.translate(MX, cy); g.scale(S.ms || 1, S.ms || 1); g.translate(-MX, -MY); try { mouth(g, P, false); } finally { g.restore(); } return; }
  const m = P.mouth || 'small', x = MX + (P.mx || 0), y = MY + (P.my || 0), w = (P.mw || 1), lw = S.lw, c = inkCol();
  const W = v => v * w;
  switch (m) {
    case 'none': return;
    case 'smile': return stroke(g, bez(x - W(48), y - 6, x, y + 40, x + W(48), y - 6), lw, c, true);
    case 'small': return stroke(g, bez(x - W(22), y + 4, x, y + 14, x + W(22), y + 4), lw, c, true);
    case 'flat': return stroke(g, [[x - W(32), y + 8], [x + W(32), y + 8]], lw, c, true);
    case 'tinyFlat': return stroke(g, [[x - W(12), y + 8], [x + W(12), y + 8]], lw, c, true);
    case 'frown': return stroke(g, bez(x - W(42), y + 26, x, y - 12, x + W(42), y + 26), lw, c, true);
    case 'smallFrown': return stroke(g, bez(x - W(22), y + 16, x, y, x + W(22), y + 16), lw, c, true);
    case 'smirk': return stroke(g, bez(x - W(20), y + 10, x + W(18), y + 22, x + W(52), y - 8), lw, c, true);
    case 'side': return stroke(g, bez(x + W(2), y + 14, x + W(26), y + 20, x + W(48), y + 2), lw, c, true);
    case 'wavy': return stroke(g, Array.from({ length: 9 }, (_, i) => [x - W(44) + i * W(11), y + 8 + (i % 2 ? -7 : 7)]), lw * .85, c, true);
    case 'zigzag': return stroke(g, Array.from({ length: 7 }, (_, i) => [x - W(42) + i * W(14), y + 10 + (i % 2 ? -10 : 10)]), lw * .85, c, true);
    case 'cat': return (stroke(g, bez(x - W(40), y + 2, x - W(20), y + 26, x, y + 4), lw * .85, c, true), stroke(g, bez(x, y + 4, x + W(20), y + 26, x + W(40), y + 2), lw * .85, c, true));
    case 'o': return openShape(g, arcPts(x, y + 14, W(18), 0, Math.PI * 2, 24), { tongue: false });
    case 'O': return openShape(g, arcPts(x, y + 22, W(30), 0, Math.PI * 2, 42), { tongue: true });
    case 'gasp': return openShape(g, arcPts(x, y + 16, W(26), 0, Math.PI * 2, 20), { tongue: false });
    case 'D': return openShape(g, [[x - W(52), y - 6], ...bez(x - W(52), y - 6, x, y + 90, x + W(52), y - 6).slice(1)], { teeth: 16 });
    case 'grin': return openShape(g, [[x - W(62), y - 10], ...bez(x - W(62), y - 10, x, y + 84, x + W(62), y - 10).slice(1)], { teeth: 22, tongue: false });
    case 'laugh': return openShape(g, [[x - W(66), y - 16], [x + W(66), y - 16], ...bez(x + W(66), y - 16, x, y + 120, x - W(66), y - 16).slice(1)], { teeth: 18 });
    case 'scream': return openShape(g, [[x - W(36), y - 10], ...bez(x - W(36), y - 10, x, y - 26, x + W(36), y - 10).slice(1), [x + W(30), y + 72], ...bez(x + W(30), y + 72, x, y + 92, x - W(30), y + 72).slice(1)], {});
    case 'sad': return openShape(g, [[x - W(44), y + 40], ...bez(x - W(44), y + 40, x, y - 18, x + W(44), y + 40).slice(1), ...bez(x + W(44), y + 40, x, y + 30, x - W(44), y + 40).slice(1)], { tongue: true });
    case 'teeth': return openShape(g, [...arcPts(x - W(42), y + 14, 20, Math.PI / 2, Math.PI * 1.5, 22, 8), ...arcPts(x + W(42), y + 14, 20, -Math.PI / 2, Math.PI / 2, 22, 8)], { teeth: 60, tongue: false });
    case 'clench': { openShape(g, [...arcPts(x - W(46), y + 14, 18, Math.PI / 2, Math.PI * 1.5, 20, 8), ...arcPts(x + W(46), y + 14, 18, -Math.PI / 2, Math.PI / 2, 20, 8)], { teeth: 60, tongue: false }); stroke(g, [[x - W(56), y + 14], [x + W(56), y + 14]], lw * .45); for (const k of [-.5, 0, .5]) stroke(g, [[x + W(46) * k, y - 4], [x + W(46) * k, y + 32]], lw * .4); return; }
    case 'evil': return openShape(g, [[x - W(70), y - 22], ...bez(x - W(70), y - 22, x, y + 34, x + W(70), y - 22).slice(1), ...bez(x + W(70), y - 22, x, y + 84, x - W(70), y - 22).slice(1)], { teeth: 70, tongue: false });
    case 'fangs': { mouth(g, { ...P, mouth: 'smile' }, false); for (const s of [-1, 1]) fillPath(g, [[x + s * W(22), y + 14], [x + s * W(32), y + 12], [x + s * W(27), y + 30]], '#fff'); return; }
    case 'tongue': { stroke(g, bez(x - W(44), y - 4, x, y + 28, x + W(44), y - 4), lw, c, true); g.save(); ell(g, x + W(14), y + 26, 16, 20, TONGUE); g.restore(); stroke(g, arcPts(x + W(14), y + 22, 16, 0, Math.PI, 22), lw * .6); return; }
    case 'pout': return ell(g, x, y + 12, W(16), 12, FEM ? '#e0697c' : '#b9545c');
    case 'kiss': return (stroke(g, bez(x - 6, y - 8, x + 18, y + 2, x - 4, y + 12), lw * .8, c, true), stroke(g, bez(x - 4, y + 12, x + 18, y + 22, x - 6, y + 32), lw * .8, c, true));
    case 'whistle': return (ell(g, x + 6, y + 14, 11, 11, S.ink), ell(g, x + 6, y + 14, 5, 5, S.mouthFill));
    case 'drool': { stroke(g, bez(x - W(40), y, x, y + 24, x + W(40), y), lw, c, true); fillPath(g, [[x + W(22), y + 12], [x + W(30), y + 12], [x + W(28), y + 54], [x + W(24), y + 54]], TEAR); return; }
    case 'chew': return stroke(g, [[x - W(30), y + 10], [x - W(10), y + 2], [x + W(10), y + 14], [x + W(30), y + 6]], lw, c, true);
    case 'triangle': return openShape(g, [[x - W(30), y + 34], [x, y - 6], [x + W(30), y + 34]], { tongue: false });
    case 'wobbleO': return openShape(g, Array.from({ length: 30 }, (_, i) => { const a = i / 30 * 6.283; return [x + Math.cos(a) * W(24) * (1 + .12 * Math.sin(a * 5)), y + 18 + Math.sin(a) * 30 * (1 + .1 * Math.cos(a * 4))]; }), {});
    case 'yawn': return openShape(g, arcPts(x, y + 6, W(22), 0, Math.PI * 2, 24, 40), { tongue: true });   // was ry 44: with the NPC 1.25 mouth scale it ran off the chin (Xavier 2026-10-22)
    // visemes (talking): A open, E wide, O round, U small round, M closed pressed, F teeth on lip, L tongue up
    case 'vA': return openShape(g, [[x - W(40), y], ...bez(x - W(40), y, x, y - 10, x + W(40), y).slice(1), ...bez(x + W(40), y, x, y + 70, x - W(40), y).slice(1)], { teeth: 10 });
    case 'vE': return openShape(g, [[x - W(54), y + 6], ...bez(x - W(54), y + 6, x, y - 4, x + W(54), y + 6).slice(1), ...bez(x + W(54), y + 6, x, y + 40, x - W(54), y + 6).slice(1)], { teeth: 12, tongue: false });
    case 'vO': return openShape(g, arcPts(x, y + 18, W(24), 0, Math.PI * 2, 32), { tongue: true });
    case 'vU': return openShape(g, arcPts(x, y + 14, W(14), 0, Math.PI * 2, 18), { tongue: false });
    case 'vM': return stroke(g, [[x - W(34), y + 10], [x + W(34), y + 10]], lw * 1.25, c, true);
    case 'vF': { openShape(g, [[x - W(38), y + 4], [x + W(38), y + 4], ...bez(x + W(38), y + 4, x, y + 36, x - W(38), y + 4).slice(1)], { teeth: 14, tongue: false }); return; }
    case 'vL': return openShape(g, [[x - W(40), y], ...bez(x - W(40), y, x, y - 8, x + W(40), y).slice(1), ...bez(x + W(40), y, x, y + 60, x - W(40), y).slice(1)], { teeth: 8, tongue: true });
  }
}

// ---------------------------------------------------------------------------------------------------------------
// EXTRAS (stickers around the face)
// ---------------------------------------------------------------------------------------------------------------
function blush(g, a = .45, lines = 0) {
  const kind = S.blush === 'none' ? 'pink' : S.blush;
  for (const x of EXv) {
    if (kind === 'grey' || kind === 'both') ell(g, x + (x < 256 ? -18 : 18), EYv + 64, 46, 22, `rgba(150,150,150,${a * .9})`);
    if (kind === 'pink' || kind === 'both') ell(g, x + (x < 256 ? -14 : 14), EYv + 62, 40, 18, `rgba(240,96,110,${a})`);
    for (let i = 0; i < lines; i++) stroke(g, [[x - 18 + i * 14, EYv + 72], [x - 8 + i * 14, EYv + 52]], 5, `rgba(200,60,80,${Math.min(1, a + .3)})`);
  }
}
const sweat = (g, x = 400, y = 120, s = 1) => { g.fillStyle = TEAR; g.beginPath(); g.moveTo(x, y - 26 * s); g.quadraticCurveTo(x + 18 * s, y + 4 * s, x, y + 14 * s); g.quadraticCurveTo(x - 18 * s, y + 4 * s, x, y - 26 * s); g.fill(); ell(g, x - 4 * s, y + 2 * s, 4 * s, 6 * s, 'rgba(255,255,255,.7)'); };
const tears = (g, stream = false) => { for (const x of EXv) { if (stream) fillPath(g, [[x - 14, EYv + 30], [x + 14, EYv + 30], [x + 18, 512], [x - 18, 512]], 'rgba(121,198,255,.85)'); else sweat(g, x + (x < 256 ? -10 : 10), EYv + 64, .8); } };
const vein = (g, x = 392, y = 104) => { for (let k = 0; k < 4; k++) { g.save(); g.translate(x, y); g.rotate(k * Math.PI / 2); stroke(g, [[6, -22], [6, -6], [22, -6]], 8, RED); g.restore(); } };
const sparkle = (g, x = 420, y = 96, s = 26, col = GOLD) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .25 : s, a = i * Math.PI / 4; g.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)); } g.fill(); };
const mark = (g, ch, x = 410, y = 120, col = S.ink, size = 96) => { g.fillStyle = col; g.font = `900 ${size}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, x, y); };
const softBand = (g, rgb, a, y0 = 30, y1 = 230) => { const gr = g.createRadialGradient(256, y0, 20, 256, y0, (y1 - y0) * 1.25); gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(.55, `rgba(${rgb},${a * .55})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); };
const gloom = g => { softBand(g, '90,90,115', .6); for (let i = 0; i < 9; i++) { const x = 120 + i * 34, h = 52 + (i % 3) * 16 - Math.abs(i - 4) * 6; stroke(g, [[x, 46], [x, 46 + h]], 4, `rgba(40,40,60,${.75 - Math.abs(i - 4) * .08})`); } };
const zzz = g => { mark(g, 'z', 380, 120, S.ink, 54); mark(g, 'z', 420, 80, S.ink, 70); mark(g, 'Z', 465, 34, S.ink, 86); };
const steam = g => { for (const x of [120, 392]) for (let i = 0; i < 3; i++) ell(g, x + (x < 256 ? -i * 16 : i * 16), 90 - i * 22, 24 - i * 4, 18 - i * 3, `rgba(255,255,255,${.9 - i * .2})`); };
const hearts = g => { for (const [x, y, s] of [[420, 90, 22], [462, 140, 14], [90, 110, 16]]) { g.fillStyle = RED; g.beginPath(); g.moveTo(x, y + s * .9); g.bezierCurveTo(x - s * 1.5, y - s * .1, x - s * .7, y - s * 1.2, x, y - s * .35); g.bezierCurveTo(x + s * .7, y - s * 1.2, x + s * 1.5, y - s * .1, x, y + s * .9); g.fill(); } };
const dizzyStars = g => { for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; sparkle(g, 256 + Math.cos(a) * 150, 70 + Math.sin(a) * 26, 18); } };
const sick = g => softBand(g, '110,190,90', .62, 50, 250);
const snot = g => { g.lineWidth = 4; g.strokeStyle = 'rgba(121,198,255,.9)'; g.fillStyle = 'rgba(190,230,255,.55)'; g.beginPath(); g.arc(300, 300, 26, 0, 7); g.fill(); g.stroke(); };
const whiskers = g => { if (!S.whisker) return; for (const x of [70, 442]) { stroke(g, [[x - 22, EYv + 50], [x + 22, EYv + 46]], 5, 'rgba(60,60,60,.6)'); stroke(g, [[x - 22, EYv + 64], [x + 22, EYv + 60]], 5, 'rgba(60,60,60,.6)'); } };
const shadowEyes = g => { for (const x of EXv) ell(g, x, EYv + 2, 54, 44, 'rgba(80,80,100,.28)'); };
const EXTRA = { blush: g => blush(g), blushHard: g => blush(g, .6, 3), sweat: g => sweat(g), sweats: g => (sweat(g, 410, 110), sweat(g, 104, 150, .7)), tears: g => tears(g), stream: g => tears(g, true), vein: g => vein(g), veins: g => (vein(g), vein(g, 120, 90)), sparkle: g => sparkle(g), sparkles: g => (sparkle(g), sparkle(g, 92, 140, 18, '#ff8ac2'), sparkle(g, 448, 170, 12, '#7ad7ff')),
  q: g => mark(g, '?', 420, 110), qq: g => (mark(g, '?', 400, 100), mark(g, '?', 450, 150, S.ink, 60)), ex: g => mark(g, '!', 420, 110, RED), exq: g => mark(g, '?!', 410, 100, RED, 80), gloom, zzz, steam, hearts, dizzy: dizzyStars, sick, snot, shadow: shadowEyes, dots: g => mark(g, '...', 410, 120, S.ink, 60) };

// ---------------------------------------------------------------------------------------------------------------
// EXPRESSIONS (semantic). brows.ang: + angry / - worried (inner up); look: pupils; extras: stickers
// ---------------------------------------------------------------------------------------------------------------
const E = (eyes, mouth, o = {}) => ({ eyes, mouth, ...o });
export const EXPR = {
  // calm / happy
  neutral:     E('open', 'small'),
  calm:        E('open', 'tinyFlat', { brows: { dy: 2 } }),
  smile:       E('open', 'smile', { brows: { ang: -.05 } }),
  pleased:     E('closedUp', 'smile', { brows: { ang: -.1, dy: -4 }, extras: ['blush'] }),
  happy:       E('closedUp', 'D', { brows: { ang: -.12, dy: -8 }, extras: ['blush'] }),
  grin:        E('open', 'grin', { brows: { ang: -.08, dy: -4 } }),
  laugh:       E('squeeze', 'laugh', { brows: { ang: -.14, dy: -8 }, extras: ['blush'] }),
  cryLaugh:    E('squeeze', 'laugh', { brows: { ang: -.2, dy: -6 }, extras: ['tears', 'blush'] }),
  excited:     E('sparkle', 'D', { brows: { ang: -.15, dy: -14 }, extras: ['sparkles', 'blush'] }),
  starstruck:  E('star', 'D', { brows: { dy: -12 }, extras: ['sparkles'] }),
  triumph:     E('closedUp', 'grin', { brows: { ang: .1, dy: -6 }, extras: ['sparkle'] }),
  confident:   E('closedDown', 'smirk', { brows: { ang: .06, dy: -2, l: -6 } }),
  smug:        E('open', 'smirk', { lid: .45, brows: { ang: .1, r: -10 } }),
  wink:        E('open', 'tongue', { wink: 'R', brows: { ang: -.08, r: 6 }, extras: ['sparkle'] }),
  flirty:      E('open', 'smirk', { lid: .38, look: [6, 0], brows: { ang: -.1, l: -8 }, extras: ['blush'] }),
  love:        E('heart', 'smile', { extras: ['hearts', 'blush'] }),
  kiss:        E('closedUp', 'kiss', { wink: 'L', extras: ['hearts', 'blush'] }),
  shy:         E('closedUp', 'cat', { brows: { ang: -.15, dy: -2 }, extras: ['blushHard'] }),
  embarrassed: E('squeeze', 'wavy', { brows: { ang: -.25 }, extras: ['blushHard', 'sweat'] }),
  dreamy:      E('closedDown', 'smile', { brows: { ang: -.12, dy: -8 }, extras: ['sparkles'] }),
  silly:       E('open', 'tongue', { l: { size: .8, look: [8, 0] }, r: { size: 1.25, look: [-8, 4] } }),
  derp:        E('open', 'wobbleO', { l: { look: [-12, -6] }, r: { look: [14, 8], size: 1.2 }, brows: { l: -10, r: 6 } }),
  whistle:     E('closedDown', 'whistle', { brows: { dy: -10, ang: -.1 }, look: [10, -8] }),
  hungry:      E('sparkle', 'drool', { brows: { ang: -.1, dy: -6 } }),
  chewing:     E('closedUp', 'chew', { extras: ['blush'] }),
  // sad
  sad:         E('open', 'frown', { brows: { ang: -.32, dy: -2 } }),
  pouty:       E('open', 'pout', { brows: { ang: .22 }, look: [-8, 0], extras: ['blush'] }),
  disappointed:E('open', 'smallFrown', { lid: .35, brows: { ang: -.2 } }),
  concerned:   E('open', 'smallFrown', { brows: { ang: -.28, r: -6 } }),
  crying:      E('squeeze', 'sad', { brows: { ang: -.4 }, extras: ['stream'] }),
  sob:         E('closedDown', 'wavy', { brows: { ang: -.38 }, extras: ['tears', 'snot'] }),
  puppy:       E('teary', 'smallFrown', { brows: { ang: -.36, dy: -6 } }),
  pensive:     E('closedDown', 'tinyFlat', { brows: { ang: -.15, dy: 4 }, look: [0, 8] }),
  gloomy:      E('open', 'smallFrown', { lid: .5, brows: { ang: -.2 }, extras: ['gloom'] }),
  // scared / surprised
  nervous:     E('open', 'wavy', { size: .85, brows: { ang: -.3, dy: -8 }, extras: ['sweat'] }),
  awkward:     E('open', 'teeth', { look: [12, 0], brows: { ang: -.22, dy: -6 }, extras: ['sweat'] }),
  gulp:        E('tiny', 'small', { brows: { ang: -.28, dy: -12 }, extras: ['sweats'] }),
  scared:      E('tiny', 'wavy', { brows: { ang: -.38, dy: -12 }, extras: ['sweats', 'shadow'] }),
  terrified:   E('shrink', 'scream', { brows: { ang: -.45, dy: -20 }, extras: ['sweats', 'gloom'] }),
  surprised:   E('wide', 'o', { brows: { dy: -18 } }),
  shocked:     E('shrink', 'O', { brows: { ang: -.2, dy: -26 }, extras: ['ex'] }),
  wtf:         E('blank', 'gasp', { l: { size: .7 }, r: { size: 1.3 }, brows: { l: -24, r: 8, ang: .1 }, extras: ['exq'] }),
  horrified:   E('shrink', 'sad', { brows: { ang: -.4, dy: -20 }, extras: ['gloom', 'sweat'] }),
  // angry
  irritated:   E('open', 'flat', { lid: .3, slant: .6, brows: { ang: .35 }, extras: ['vein'] }),
  annoyed:     E('open', 'side', { lid: .5, look: [10, 0], brows: { ang: .1, l: 4 } }),
  stern:       E('open', 'frown', { brows: { ang: .38, dy: 8 } }),   // cross teacher: brows down, no slanted lids (angry's lid slant + brows read as two pairs of brows)
  angry:       E('open', 'frown', { slant: .7, brows: { ang: .42, dy: 6 }, extras: ['vein'] }),
  furious:     E('open', 'clench', { slant: 1, size: .85, brows: { ang: .55, dy: 10 }, extras: ['veins', 'steam'] }),
  rage:        E('shrink', 'evil', { slant: 1, brows: { ang: .6, dy: 8 }, extras: ['veins', 'steam', 'shadow'] }),
  grumpy:      E('open', 'smallFrown', { lid: .45, slant: .4, brows: { ang: .25 } }),
  disgusted:   E('open', 'zigzag', { lid: .4, brows: { ang: .2, l: -6, r: 8 }, look: [0, 6], extras: ['sick'] }),
  // thinking / meh
  confused:    E('open', 'zigzag', { l: { size: .8 }, brows: { l: 10, r: -16, ang: .08 }, extras: ['q'] }),
  curious:     E('open', 'o', { look: [8, -4], brows: { r: -14 }, extras: ['q'] }),
  thinking:    E('open', 'side', { look: [12, -12], brows: { l: 6, r: -14 }, extras: ['dots'] }),
  skeptical:   E('open', 'flat', { l: { lid: .45 }, brows: { l: 12, r: -18 } }),
  incredulous: E('open', 'smallFrown', { l: { lid: .5 }, r: { size: 1.15 }, brows: { l: 10, r: -20, ang: .12 } }),
  sus:         E('open', 'flat', { lid: .55, look: [16, 2], brows: { ang: .18 } }),
  unamused:    E('open', 'tinyFlat', { lid: .55 }),
  deadpan:     E('line', 'flat', { brows: { off: true } }),
  bored:       E('open', 'side', { lid: .62, look: [-8, 6], brows: { dy: 6 } }),
  snooty:      E('closedDown', 'smirk', { brows: { ang: -.1, dy: -10, l: -10 }, look: [0, -6] }),
  cold:        E('open', 'tinyFlat', { lid: .4, slant: .2, size: .8, extras: ['shadow'] }),
  serious:     E('open', 'flat', { slant: .25, brows: { ang: .2, dy: 6 } }),
  determined:  E('open', 'smirk', { slant: .45, brows: { ang: .35, dy: 4 }, extras: ['sparkle'] }),
  devious:     E('open', 'evil', { lid: .35, slant: .4, brows: { ang: .45 }, look: [8, 0] }),
  evil:        E('open', 'fangs', { lid: .3, slant: .7, brows: { ang: .55 }, extras: ['shadow'] }),
  mischief:    E('closedUp', 'cat', { brows: { ang: .25, l: -6 }, extras: ['sparkle'] }),
  // tired / unwell / out of it
  tired:       E('open', 'tinyFlat', { lid: .58, brows: { ang: -.12, dy: 6 }, extras: ['shadow'] }),
  sleepy:      E('line', 'small', { brows: { ang: -.08, dy: 8 }, extras: ['zzz'] }),
  asleep:      E('closedDown', 'o', { extras: ['zzz', 'snot'] }),
  holdYawn:    E('teary', 'wavy', { brows: { ang: -.22, dy: -6 }, extras: ['sweat'] }),   // fighting a yawn: watery eyes, lips pressed
  yawn:        E('squeeze', 'yawn', { brows: { ang: -.15, dy: -6 }, extras: ['tears'] }),
  sick:        E('open', 'wavy', { lid: .45, brows: { ang: -.25 }, extras: ['sick', 'sweat'] }),
  nauseous:    E('spiral', 'zigzag', { extras: ['sick'] }),
  pain:        E('squeeze', 'clench', { brows: { ang: -.3, dy: 4 }, extras: ['sweats'] }),
  dizzy:       E('spiral', 'wavy', { extras: ['dizzy'] }),
  drunk:       E('open', 'wavy', { lid: .5, l: { look: [-8, 6] }, r: { look: [10, -4] }, extras: ['blushHard', 'dizzy'] }),
  dead:        E('x', 'tongue'),
  // talking (lip sync visemes; eyes neutral)
  talkA: E('open', 'vA'), talkE: E('open', 'vE'), talkO: E('open', 'vO'), talkU: E('open', 'vU'), talkM: E('open', 'vM'), talkF: E('open', 'vF'), talkL: E('open', 'vL'),
};
export const EXPRESSIONS = Object.keys(EXPR);
export const STYLE_NAMES = () => Object.keys(STYLES).filter(k => !k.startsWith('__'));
export const VISEMES = ['talkA', 'talkE', 'talkO', 'talkU', 'talkM', 'talkF', 'talkL'];

// draw one face onto a 2D context (512 x 512 space). Post styles (pixel, neon) draw a base style then process it.
export function drawFace(g, expr = 'neutral', o = {}) {
  const st = STYLES[o.style] || STYLES.classic;
  if (st.post) {
    const c = document.createElement('canvas'); c.width = c.height = 512; const cx = c.getContext('2d');
    if (st.post === 'neon') { STYLES.__n = { ...STYLES[st.base], ink: '#ffffff', mouthFill: '#10202a' }; drawRaw(cx, expr, { ...o, style: '__n' }); g.save(); g.shadowColor = st.glow; g.shadowBlur = 26; g.drawImage(c, 0, 0); g.shadowBlur = 12; g.drawImage(c, 0, 0); g.restore(); return; }
    drawRaw(cx, expr, { ...o, style: st.base }); const n = st.px, sm = document.createElement('canvas'); sm.width = sm.height = n; const sx = sm.getContext('2d'); sx.drawImage(c, 0, 0, n, n);
    const d = sx.getImageData(0, 0, n, n); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 90 ? 255 : 0; sx.putImageData(d, 0, 0);   // hard pixel edges
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(sm, 0, 0, 512, 512); g.restore(); return;
  }
  drawRaw(g, expr, o);
}
function drawRaw(g, expr = 'neutral', { style = 'classic', sex = 'm', lips = 'black', seed = 7, scale = 1.4, shift = 0, es = 1, ms = 1, ey = 0, spec = null } = {}) {
  g.save(); g.translate(256, 268 + shift); g.scale(scale, scale); g.translate(-256, -268); try { drawRawIn(g, expr, { style, sex, lips, seed, es, ms, ey, spec }); } finally { g.restore(); SPEC = null; }
}
function drawRawIn(g, expr, { style, sex, lips, seed, es = 1, ms = 1, ey = 0, spec = null }) {
  SPEC = spec ? faceSpec(spec) : null;
  if (SPEC) { S = specStyle(SPEC); style = '__spec'; lips = { none: 'black', tint: 'pink' }[SPEC.mouth.lips] || 'lip'; LIPC = SPEC.mouth.color; }
  else { S = STYLES[style] || STYLES.classic; LIPC = '#f0798a'; } if (es !== 1 || ms !== 1 || ey) S = { ...S, es: (S.es || 1) * es, ms: (S.ms || 1) * ms, ey: (S.ey || 0) + ey }; NAME = style; EXv = [EX[0] - (S.ex || 0), EX[1] + (S.ex || 0)]; EYv = EY + (S.ey || 0); FEM = sex === 'f'; LIPS = lips; SEED = seed + expr.length * 31;
  const [eb, em] = expr.split('+'), P = em ? { ...(EXPR[eb] || EXPR.neutral), mouth: em } : (EXPR[expr] || EXPR.neutral), X = P.extras || [];   // 'stern+vA' = stern face talking (lip sync keeps the eyes / brows)
  if (X.includes('gloom') || X.includes('sick')) for (const k of ['gloom', 'sick']) if (X.includes(k)) EXTRA[k](g);   // backgrounds first
  if (X.includes('shadow')) EXTRA.shadow(g);
  whiskers(g);
  if (X.includes('blush') || X.includes('blushHard') || (S.blush === 'grey' && !X.length)) (X.includes('blushHard') ? EXTRA.blushHard : EXTRA.blush)(g);
  if (SPEC && SPEC.cheeks.blush > 0 && !X.includes('blushHard')) specBlush(g, SPEC.cheeks.blush);
  if (SPEC) specUnder(g, P);
  brows(g, P); eye(g, -1, P); eye(g, 1, P); if (SPEC) specMid(g, P); mouth(g, P); if (SPEC) specOver(g, P);
  for (const k of X) if (!['gloom', 'sick', 'shadow', 'blush', 'blushHard'].includes(k)) EXTRA[k]?.(g);
}
const cache = {};
// NPC face size (Xavier's sketch 2026-10-21): small eyes, a wider smile, sitting in the middle of the face
export const NPC_FACE = { es: .45, ms: 1.25, ey: 14 };
export function faceTex(expr = 'neutral', o = {}) {
  if (o.spec) o = { raw: true, shift: -24, ...o, scale: 1.4 * (faceSpec(o.spec).scale || 1) };   // shifted up: open mouths were clipping at the chin   // a Face Maker design: drawn at its own sizes, no auto-enlarging
  const key = [expr, o.style, o.sex, o.lips || 'black', o.scale, o.shift, o.raw, o.es, o.ms, o.ey, EYE_K, MOUTH_K, o.spec ? JSON.stringify(o.spec) : ''].join('|'); if (cache[key]) return cache[key];
  const c = document.createElement('canvas'); c.width = c.height = 512; drawFace(c.getContext('2d'), expr, o);   // then the same bigger eyes / mouth as the mains
  const t = new THREE.CanvasTexture(o.raw ? c : enlargeFeatures(c)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return (cache[key] = t);
}

// ---------------------------------------------------------------------------------------------------------------
// FACE MAKER designs. A spec is a face identity (eye shape, size, spacing, lashes, liner, brows, nose, lips, cheeks,
// facial hair, marks, glasses). Every expression above is drawn THROUGH it, so one design works for all ~75 faces.
//   faceTex('shocked', { spec })   (spec as saved by face_maker.html; missing fields fall back to FACE_DEFAULT)
// ---------------------------------------------------------------------------------------------------------------
export const FACE_DEFAULT = {
  name: 'Face', scale: 1, ink: '#1d1512', weight: 1,
  eye: { shape: 'iris', size: .62, gap: 6, y: 14, tilt: 0, iris: '#4a3426', glint: true, lashes: 0, lashLen: 1, liner: 0, shadow: '' },
  brow: { style: 'arc', size: .8, len: 1, y: 0, color: '#2b1d14' },
  mouth: { size: 1.1, y: 0, lips: 'none', color: '#e8707f', fill: '#4a1714' },
  nose: { style: 'none', size: 1, y: 0 },
  cheeks: { blush: .25, color: '#f0606e', freckles: 0 },
  beard: { style: 'none', color: '#2b1d14' },
  marks: { mole: false, under: 'none' },
  glasses: { style: 'none', color: '#1d1512', lens: '' },
};
export const FACE_PRESETS = {
  'Classic boy':   {},
  'Lash girl':     { eye: { shape: 'lash', size: .95, gap: 12, y: 18, lashes: 4, lashLen: 1.1 }, brow: { style: 'thin', size: .6, len: .9, y: 6 }, mouth: { size: .8, lips: 'pink', color: '#e86b80' }, cheeks: { blush: .55, color: '#ff7f8e' } },
  'Glam':          { eye: { shape: 'iris', size: .66, gap: 8, y: 16, tilt: .12, iris: '#6b4a2e', lashes: 3, lashLen: 1.1, liner: .8, shadow: '#b77ec9' }, brow: { style: 'arc', size: .7, len: .95, y: -2 }, mouth: { size: .95, lips: 'gloss', color: '#d9536c' }, cheeks: { blush: .4 } },
  'Big eyes':      { eye: { shape: 'round', size: .55, gap: 8, y: 10 }, brow: { style: 'thin', size: .7 }, mouth: { size: 1 }, cheeks: { blush: .35 } },
  'Anime':         { eye: { shape: 'almond', size: .6, gap: 6, y: 12, iris: '#4f7bd9', lashes: 2 }, brow: { style: 'thin', size: .6 }, mouth: { size: .8 }, cheeks: { blush: .45 } },
  'Chill guy':     { eye: { shape: 'oval', size: .55, gap: 4, y: 16 }, brow: { style: 'straight', size: 1.1, y: 4 }, mouth: { size: 1.05 }, nose: { style: 'line' }, beard: { style: 'stubble' }, cheeks: { blush: 0 } },
  'Nerd':          { eye: { shape: 'dot', size: .9, gap: 6, y: 14 }, brow: { style: 'arc', size: .8 }, glasses: { style: 'round' }, cheeks: { blush: .2, freckles: .6 }, nose: { style: 'button' } },
  'Tough':         { eye: { shape: 'slit', size: .62, gap: 4, y: 16 }, brow: { style: 'thick', size: 1.25, y: 4 }, mouth: { size: 1 }, beard: { style: 'goatee' }, marks: { under: 'scar' }, cheeks: { blush: 0 } },
};
const merge = (a, b) => { const o = { ...a }; for (const k in b || {}) o[k] = b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) ? merge(a[k] || {}, b[k]) : b[k]; return o; };
export const faceSpec = sp => merge(FACE_DEFAULT, sp);
function specStyle(sp) {
  const shape = { round: 'ring' }[sp.eye.shape] || sp.eye.shape, brow = { thick: 'arc', straight: 'arc' }[sp.brow.style] || sp.brow.style;
  return { es: sp.eye.size * (shape === 'ring' ? .8 : 1), ms: sp.mouth.size, ex: sp.eye.gap, ey: sp.eye.y, my: sp.mouth.y, ink: sp.ink, lw: 12 * sp.weight, eye: shape, mouthFill: sp.mouth.fill,
    blush: 'none', brow, straight: sp.brow.style === 'straight', thick: sp.brow.style === 'thick', iris: sp.eye.iris, noGlint: !sp.eye.glint };
}
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
function specBlush(g, a) { for (const x of EXv) ell(g, x + (x < 256 ? -16 : 16), EYv + 50 + 30 * (S.es || 1), 38, 17, rgba(SPEC.cheeks.color, .2 + .45 * a)); }
// under the features: eyeshadow, freckles, beard shading, under-eye marks
function specUnder(g) {
  const sp = SPEC, es = S.es || 1;
  if (sp.eye.shadow) for (const x of EXv) { const gr = g.createRadialGradient(x, EYv - 22 * es, 4, x, EYv - 22 * es, 46 * es + 14); gr.addColorStop(0, rgba(sp.eye.shadow, .55)); gr.addColorStop(1, rgba(sp.eye.shadow, 0)); g.fillStyle = gr; g.beginPath(); g.ellipse(x, EYv - 18 * es, 50 * es + 12, 34 * es + 8, 0, 0, 7); g.fill(); }
  if (sp.cheeks.freckles > 0) { const n = Math.round(4 + sp.cheeks.freckles * 10); let sd = 11; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (const x of EXv) for (let i = 0; i < n; i++) ell(g, x + (x < 256 ? -10 : 10) + (r() - .5) * 64, EYv + 40 * es + 24 + (r() - .5) * 26, 3.2, 3, 'rgba(140,80,50,.6)'); }
  const bc = sp.beard.color, my = MY + (S.my || 0);
  if (sp.beard.style === 'stubble') {   // five o'clock shadow: a soft jaw band under the mouth + fine dots
    const jaw = new Path2D(); jaw.moveTo(150, my - 40); jaw.quadraticCurveTo(160, my + 110, 256, my + 118); jaw.quadraticCurveTo(352, my + 110, 362, my - 40); jaw.quadraticCurveTo(330, my + 50, 256, my + 56); jaw.quadraticCurveTo(182, my + 50, 150, my - 40);
    g.fillStyle = rgba(bc, .18); g.fill(jaw); g.save(); g.clip(jaw); let sd = 5; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 260; i++) ell(g, 150 + r() * 212, my - 40 + r() * 160, 1.5, 1.5, rgba(bc, .4)); g.restore();
    g.fillStyle = rgba(bc, .2); g.beginPath(); g.ellipse(256, my - 16, 54, 13, 0, 0, 7); g.fill(); }
  if (sp.beard.style === 'full') { g.fillStyle = rgba(bc, .92); g.beginPath(); g.moveTo(96, my - 60); g.quadraticCurveTo(110, my + 150, 256, my + 168); g.quadraticCurveTo(402, my + 150, 416, my - 60); g.quadraticCurveTo(390, my + 40, 256, my + 70); g.quadraticCurveTo(122, my + 40, 96, my - 60); g.fill(); }
  if (sp.marks.under === 'heart' || sp.marks.under === 'star' || sp.marks.under === 'tear') { const x = EXv[1] + 30, y = EYv + 44 * es + 18;
    if (sp.marks.under === 'heart') { const k = 9; g.fillStyle = RED; g.beginPath(); g.moveTo(x, y + k * .9); g.bezierCurveTo(x - k * 1.5, y - k * .1, x - k * .7, y - k * 1.2, x, y - k * .35); g.bezierCurveTo(x + k * .7, y - k * 1.2, x + k * 1.5, y - k * .1, x, y + k * .9); g.fill(); }
    else if (sp.marks.under === 'star') sparkle(g, x, y, 12, GOLD); else { g.fillStyle = sp.ink; g.beginPath(); g.moveTo(x, y - 10); g.quadraticCurveTo(x + 7, y + 3, x, y + 8); g.quadraticCurveTo(x - 7, y + 3, x, y - 10); g.fill(); } }
}
// between eyes and mouth: nose, mustache / goatee, scar, mole
function specMid(g) {
  const sp = SPEC, ny = (EYv + MY + (S.my || 0)) / 2 + 14 + sp.nose.y, k = sp.nose.size, bc = sp.beard.color, my = MY + (S.my || 0);
  switch (sp.nose.style) {
    case 'dot': ell(g, 256, ny, 5 * k, 4 * k, rgba(sp.ink, .75)); break;
    case 'line': stroke(g, [[258, ny - 18 * k], [250, ny + 6 * k], [262, ny + 8 * k]], S.lw * .5, rgba(sp.ink, .8)); break;
    case 'hook': stroke(g, bez(262, ny - 22 * k, 238 - 6 * k, ny + 12 * k, 266, ny + 8 * k), S.lw * .55, rgba(sp.ink, .8)); break;
    case 'button': stroke(g, arcPts(256, ny, 12 * k, Math.PI * .15, Math.PI * .85, 8 * k), S.lw * .5, rgba(sp.ink, .8)); break;
    case 'nostrils': ell(g, 248, ny + 2, 3.5 * k, 2.6 * k, rgba(sp.ink, .8)); ell(g, 264, ny + 2, 3.5 * k, 2.6 * k, rgba(sp.ink, .8)); break;
  }
  if (sp.beard.style === 'mustache' || sp.beard.style === 'goatee') { g.fillStyle = bc; g.beginPath(); g.moveTo(256, my - 14); g.quadraticCurveTo(206, my - 30, 196, my - 2); g.quadraticCurveTo(226, my - 14, 256, my - 6); g.quadraticCurveTo(286, my - 14, 316, my - 2); g.quadraticCurveTo(306, my - 30, 256, my - 14); g.fill(); }
  if (sp.marks.under === 'scar') { stroke(g, [[EXv[1] - 6, EYv - 56], [EXv[1] + 18, EYv + 46]], 6, '#a8474a'); for (let i = 0; i < 3; i++) { const y = EYv - 30 + i * 28, x = EXv[1] + 1 + i * 6.5; stroke(g, [[x - 10, y + 3], [x + 10, y - 3]], 4, '#a8474a'); } }
  if (sp.marks.mole) ell(g, MX + 62, my + 30, 5, 5, rgba(sp.ink, .8));
}
// on top: goatee chin patch, glasses
function specOver(g) {
  const sp = SPEC, my = MY + (S.my || 0);
  if (sp.beard.style === 'goatee') { g.fillStyle = sp.beard.color; g.beginPath(); g.moveTo(232, my + 46); g.quadraticCurveTo(256, my + 104, 280, my + 46); g.quadraticCurveTo(256, my + 58, 232, my + 46); g.fill(); }
  const gl = sp.glasses.style; if (gl === 'none') return;
  const es = S.es || 1, rx = (gl === 'square' ? 46 : 44) * Math.max(.75, es) + 8, ry = (gl === 'cat' ? 30 : 38) * Math.max(.75, es) + 6;
  for (const x of EXv) {
    if (gl === 'shades' || sp.glasses.lens) { g.fillStyle = gl === 'shades' ? 'rgba(15,15,20,.92)' : rgba(sp.glasses.lens, .35); g.beginPath(); if (gl === 'square') g.roundRect(x - rx, EYv - ry, rx * 2, ry * 2, 10); else g.ellipse(x, EYv, rx, ry, 0, 0, 7); g.fill(); }
    g.lineWidth = 7; g.strokeStyle = sp.glasses.color; g.beginPath();
    if (gl === 'square') g.roundRect(x - rx, EYv - ry, rx * 2, ry * 2, 10);
    else if (gl === 'cat') { const s2 = x < 256 ? -1 : 1; g.moveTo(x - rx, EYv + 4); g.quadraticCurveTo(x - rx * .2, EYv + ry * 1.3, x + rx, EYv + 2); g.lineTo(x + s2 * rx * 1.12, EYv - ry * 1.1); g.quadraticCurveTo(x, EYv - ry * 1.2, x - s2 * rx, EYv - ry * .6); g.closePath(); }
    else g.ellipse(x, EYv, rx, ry, 0, 0, 7);
    g.stroke();
    if (gl === 'shades') ell(g, x - rx * .35, EYv - ry * .4, rx * .25, ry * .14, 'rgba(255,255,255,.55)');
  }
  g.lineWidth = 7; g.beginPath(); g.moveTo(EXv[0] + rx, EYv - 4); g.quadraticCurveTo(256, EYv - 16, EXv[1] - rx, EYv - 4); g.stroke();
}
// one Face Maker face drawn exactly as faceTex draws it (the editor uses this to repaint one canvas live)
export function drawSpecFace(g, expr, spec, sex = 'm') { g.clearRect(0, 0, 512, 512); drawFace(g, expr, { spec, sex, raw: true, shift: -24, scale: 1.4 * (faceSpec(spec).scale || 1) }); }
export const SPEC_OPTIONS = {
  eyeShape: [['iris', 'Iris'], ['oval', 'Oval'], ['round', 'Round'], ['almond', 'Almond'], ['lash', 'Closed lashes'], ['dot', 'Dot'], ['tall', 'Tall'], ['tick', 'Tick'], ['slit', 'Slit'], ['pie', 'Pie']],
  brow: [['none', 'None'], ['thin', 'Thin'], ['arc', 'Arc'], ['straight', 'Straight'], ['thick', 'Thick'], ['hook', 'Hook']],
  lips: [['none', 'None'], ['pink', 'Lips'], ['gloss', 'Gloss'], ['tint', 'Tinted line']],
  nose: [['none', 'None'], ['dot', 'Dot'], ['line', 'Line'], ['button', 'Button'], ['hook', 'Hook'], ['nostrils', 'Nostrils']],
  beard: [['none', 'None'], ['stubble', 'Stubble'], ['mustache', 'Mustache'], ['goatee', 'Goatee'], ['full', 'Full beard']],
  under: [['none', 'None'], ['heart', 'Heart'], ['star', 'Star'], ['tear', 'Tear'], ['scar', 'Scar']],
  glasses: [['none', 'None'], ['round', 'Round'], ['square', 'Square'], ['cat', 'Cat-eye'], ['shades', 'Shades']],
};
