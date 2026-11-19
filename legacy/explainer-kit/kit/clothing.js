// CLOTHING: shirts and pants painted into our avatar texture layout (kit/assets/avatar_template/layout.json, 2048²).
//
// Two ways in:
//  1. ROBLOX CLASSIC TEMPLATES (585x559 shirt / pants png, the format every Roblox clothing site uses). Each face is cut out
//     of the template and dropped onto the matching face of our layout, so sleeves, cuffs and necklines line up the way
//     the designer drew them.  `key` makes one flat colour transparent, for images that can't carry alpha (Google Flow):
//     paint everything that should be skin in that colour (pure green #00ff00 by default).
//  2. BUILDER: buildShirt({ color, fabric, print, sleeves, neck, cuffs, hem }) draws a garment from parts: a body colour or
//     fabric photo, a print image on the chest, short / long / no sleeves, a crew / v / hood / collar neckline, ribbed cuffs
//     and hem. No template drawing needed: Flow only has to make the print (on a flat background, keyed out).
//
// SHADING: a greyscale image (white = no change, darker = shadow), in Roblox template layout or ours. It is MULTIPLIED over
// the result, so black-and-white works and no transparency is needed. Roblox shading packs with alpha also work.
//
//   const tex = await dressTexture({ base: 'kit/assets/avatar_tex/male.png' or null (blank skin), skin: '#c99a7a',
//                                    shirt: 'x.png' | buildShirt(...), pants: 'y.png', shading: 's.png', key: '#00ff00' })
//   await RB.skin(A, tex)
import * as THREE from 'three';
import { layout } from './roblox.js';

// Roblox classic template rects [x, y, w, h], keyed by OUR part / face names (Roblox L/R are the character's own left/right)
export const ROBLOX = {
  size: [585, 559],
  torso: { front: [231, 74, 128, 128], back: [427, 74, 128, 128], right: [165, 74, 64, 128], left: [361, 74, 64, 128], top: [231, 8, 128, 64], bottom: [231, 204, 128, 64] },
  armR: { left: [19, 355, 64, 128], back: [85, 355, 64, 128], right: [151, 355, 64, 128], front: [217, 355, 64, 128], top: [217, 289, 64, 64], bottom: [217, 485, 64, 64] },
  armL: { front: [308, 355, 64, 128], left: [374, 355, 64, 128], back: [440, 355, 64, 128], right: [506, 355, 64, 128], top: [308, 289, 64, 64], bottom: [308, 485, 64, 64] },
};
// pants use the same rects: right leg in the right-arm slot, left leg in the left-arm slot
ROBLOX.legR = ROBLOX.armR; ROBLOX.legL = ROBLOX.armL;
const SHIRT_PARTS = ['torso', 'armL', 'armR'], PANTS_PARTS = ['torso', 'legL', 'legR'];

const loadImg = src => typeof src !== 'string' ? Promise.resolve(src) : new Promise((ok, no) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => ok(i); i.onerror = no; i.src = new URL(src, document.baseURI).href; });
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const hexRGB = h => { const n = parseInt(h.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };

// make one flat colour transparent (soft edge so anti-aliased borders don't leave a fringe)
export function keyOut(img, key = '#00ff00', tol = 90) {
  const c = canvas(img.width, img.height), g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data, [kr, kg, kb] = hexRGB(key);
  for (let i = 0; i < p.length; i += 4) { const dist = Math.hypot(p[i] - kr, p[i + 1] - kg, p[i + 2] - kb); if (dist < tol) p[i + 3] = Math.min(p[i + 3], Math.max(0, (dist - tol * .6) / (tol * .4)) * 255); }
  g.putImageData(d, 0, 0); return c;
}

// is this image a Roblox classic template (by aspect), or already in our layout (square)?
const isRoblox = img => Math.abs(img.width / img.height - 585 / 559) < .03;

// draw the faces of `img` (Roblox template) for `parts` into our layout canvas g
function blitRoblox(g, L, img, parts, mode = 'source-over') {
  const kx = img.width / 585, ky = img.height / 559, S = g.canvas.width / L.size[0];
  g.save(); g.globalCompositeOperation = mode; g.imageSmoothingQuality = 'high';
  for (const part of parts) for (const [face, [x, y, w, h]] of Object.entries(ROBLOX[part])) {
    const [dx, dy, dw, dh] = L.parts[part][face].map(v => v * S);
    // our top/bottom squares are stored flipped against Roblox's unwrap (their front edge sits on the other side)
    if (face === 'top' || face === 'bottom') { g.save(); g.translate(dx, dy + dh); g.scale(1, -1); g.drawImage(img, x * kx, y * ky, w * kx, h * ky, 0, 0, dw, dh); g.restore(); }
    else g.drawImage(img, x * kx, y * ky, w * kx, h * ky, dx, dy, dw, dh);
  }
  g.restore();
}
function blitLayer(g, L, img, parts, mode) {
  if (isRoblox(img)) return blitRoblox(g, L, img, parts, mode);
  // already in our layout: copy just the parts' rects
  const S = g.canvas.width / L.size[0], k = img.width / L.size[0];
  g.save(); g.globalCompositeOperation = mode || 'source-over';
  for (const part of parts) for (const r of Object.values(L.parts[part])) g.drawImage(img, r[0] * k, r[1] * k, r[2] * k, r[3] * k, r[0] * S, r[1] * S, r[2] * S, r[3] * S);
  g.restore();
}

// ---------- builder: a shirt from parts, painted straight into a Roblox template so it goes through the same path ----------
const fabricCache = {};
export async function buildShirt({ color = '#e88aa8', fabric = null, fabricTint = true, print = null, printKey = null, printScale = .78, printY = .52,
  sleeves = 'long', neck = 'crew', cuffs = true, hem = true, rib = null, back = null } = {}) {
  const c = canvas(585 * 2, 559 * 2), g = c.getContext('2d'); g.scale(2, 2);
  const R = ROBLOX, rib2 = rib || shade(color, -.14);
  // body fill: flat colour, or a fabric photo tinted to the colour
  let pat = null;
  if (fabric) { const f = fabricCache[fabric] || (fabricCache[fabric] = await loadImg(`kit/assets/fabric/${fabric}.jpg`)), t = canvas(256, 256), tg = t.getContext('2d');
    // keep only the fabric's weave (its light/dark detail), not its colour: flat colour, then the greyscale fabric on top in overlay
    if (fabricTint) { tg.fillStyle = color; tg.fillRect(0, 0, 256, 256); tg.filter = 'grayscale(1) contrast(1.6)'; tg.globalCompositeOperation = 'overlay'; tg.globalAlpha = .55; tg.drawImage(f, 0, 0, 256, 256); tg.filter = 'none'; tg.globalAlpha = 1; tg.globalCompositeOperation = 'source-over'; }
    else tg.drawImage(f, 0, 0, 256, 256);
    pat = g.createPattern(t, 'repeat'); }
  const fill = (x, y, w, h, col = null) => { g.fillStyle = col || pat || color; g.fillRect(x, y, w, h); };
  for (const r of Object.values(R.torso)) fill(...r);
  const armLen = sleeves === 'long' ? 1 : sleeves === 'short' ? .38 : 0;
  for (const arm of ['armL', 'armR']) for (const [face, r] of Object.entries(R[arm])) {
    if (!armLen) continue;
    if (face === 'top') { fill(...r); continue; } if (face === 'bottom') { if (armLen === 1) fill(...r, rib2); continue; }
    const [x, y, w, h] = r; fill(x, y, w, h * armLen);
    if (cuffs) { g.fillStyle = rib2; g.fillRect(x, y + h * armLen - (armLen === 1 ? 12 : 7), w, armLen === 1 ? 12 : 7); ribLines(g, x, y + h * armLen - (armLen === 1 ? 12 : 7), w, armLen === 1 ? 12 : 7); }
  }
  // hem band round the torso bottom edge
  if (hem) for (const f of ['front', 'back', 'left', 'right']) { const [x, y, w, h] = R.torso[f]; g.fillStyle = rib2; g.fillRect(x, y + h - 11, w, 11); ribLines(g, x, y + h - 11, w, 11); }
  // neckline on the front (and a matching band on the top face)
  { const [x, y, w] = R.torso.front, cx = x + w / 2, [tx, ty, tw, th] = R.torso.top;
    g.fillStyle = rib2; g.strokeStyle = rib2; g.lineWidth = 7;
    if (neck === 'crew') { g.beginPath(); g.ellipse(cx, y, 22, 11, 0, 0, Math.PI); g.stroke(); }
    else if (neck === 'v') { g.beginPath(); g.moveTo(cx - 22, y); g.lineTo(cx, y + 28); g.lineTo(cx + 22, y); g.stroke(); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(cx - 18, y); g.lineTo(cx, y + 22); g.lineTo(cx + 18, y); g.fill(); }
    else if (neck === 'collar') { g.fillStyle = shade(color, .25); for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx, y + 2); g.lineTo(cx + s * 30, y); g.lineTo(cx + s * 22, y + 20); g.closePath(); g.fill(); } }
    else if (neck === 'hood') { g.fillStyle = shade(color, -.1); g.fillRect(tx + 8, ty + th - 26, tw - 16, 26); g.beginPath(); g.ellipse(cx, y, 30, 12, 0, 0, Math.PI); g.fill(); g.strokeStyle = '#f4f4f1'; g.lineWidth = 2.5; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(cx + s * 10, y + 8); g.lineTo(cx + s * 11, y + 46); g.stroke(); } }
    if (neck !== 'hood') { g.beginPath(); g.ellipse(tx + tw / 2, ty + th - 2, 26, 14, 0, Math.PI, 0); g.lineWidth = 7; g.strokeStyle = rib2; g.stroke(); } }
  // chest print (and an optional back print)
  for (const [img, face] of [[print, 'front'], [back, 'back']]) if (img) {
    let im = await loadImg(img); if (printKey) im = keyOut(im, printKey);
    const [x, y, w, h] = R.torso[face], s = Math.min(w * printScale / im.width, h * printScale / im.height), pw = im.width * s, ph = im.height * s;
    g.drawImage(im, x + (w - pw) / 2, y + h * printY - ph / 2, pw, ph);
  }
  return c;
}
function ribLines(g, x, y, w, h) { g.save(); g.strokeStyle = 'rgba(0,0,0,.13)'; g.lineWidth = 1.2; for (let i = x + 3; i < x + w; i += 4.5) { g.beginPath(); g.moveTo(i, y + 1); g.lineTo(i, y + h - 1); g.stroke(); } g.restore(); }
function shade(hex, k) { const [r, gg, b] = hexRGB(hex), f = v => Math.round(Math.max(0, Math.min(255, k < 0 ? v * (1 + k) : v + (255 - v) * k))); return `rgb(${f(r)},${f(gg)},${f(b)})`; }

// automatic soft shading (fold lines, side darkening) in Roblox template form, for garments that come without any
export function autoShading() {
  const c = canvas(585, 559), g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 585, 559);
  const grad = (x, y, w, h, horiz, a0, a1) => { const l = horiz ? g.createLinearGradient(x, 0, x + w, 0) : g.createLinearGradient(0, y, 0, y + h); l.addColorStop(0, `rgba(0,0,0,${a0})`); l.addColorStop(1, `rgba(0,0,0,${a1})`); g.fillStyle = l; g.fillRect(x, y, w, h); };
  const R = ROBLOX; for (const p of ['torso', 'armL', 'armR']) for (const f of ['front', 'back', 'left', 'right']) { const [x, y, w, h] = R[p][f]; grad(x, y, w, h * .25, false, .12, 0); grad(x, y + h * .75, w, h * .25, false, 0, .14); grad(x, y, w * .2, h, true, .1, 0); grad(x + w * .8, y, w * .2, h, true, 0, .1); }
  g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = 3; for (const f of ['front', 'back']) { const [x, y, w, h] = R.torso[f]; for (const s of [.3, .7]) { g.beginPath(); g.moveTo(x + w * s, y + h * .55); g.quadraticCurveTo(x + w * (s + .04), y + h * .8, x + w * s, y + h); g.stroke(); } }
  return c;
}

// compose a full avatar texture: base skin (or flat skin colour) + pants + shirt + shading (multiplied)
export async function dressTexture({ base = null, skin = '#c99a7a', shirt = null, pants = null, shading = 'auto', key = null, size = 1024 } = {}) {
  const L = await layout(), c = canvas(size, size), g = c.getContext('2d');
  if (base) g.drawImage(await loadImg(base), 0, 0, size, size); else { g.fillStyle = skin; g.fillRect(0, 0, size, size); }
  const prep = async src => { if (!src) return null; let im = await loadImg(src); if (key) im = keyOut(im, key); return im; };
  const pa = await prep(pants), sh = await prep(shirt);
  if (pa) blitLayer(g, L, pa, PANTS_PARTS);
  if (sh) blitLayer(g, L, sh, SHIRT_PARTS);
  if (shading) { const sd = shading === 'auto' ? autoShading() : await loadImg(shading); blitLayer(g, L, sd, [...(sh ? SHIRT_PARTS : []), ...(pa ? ['legL', 'legR'] : [])], 'multiply'); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
