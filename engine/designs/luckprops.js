// LUCK PROPS (Lucky Me, 2026-11-27): story props modelled after the real objects (proportions from product specs).
// Every prop's local origin is where it touches its support (floor, wall, hand) unless noted.
import * as THREE from 'three';
import { bbox, at, ph } from '../build.js';
import { canvasTex } from '../util.js';
import { M } from './furniture.js';
import { leafMat } from '../sets/town.js';

const shadow = g => { g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g; };
const B = (w, h, d, m, x = 0, y = 0, z = 0, r = .01) => at(bbox(w, h, d, m, r), x, y, z);
const named = (g, n) => { g.name = n; return g; };

// FLOWERPOT: the Poly Haven potted plant (terracotta pot + leaves), ~.45 m tall
export async function flowerpot() { const o = await ph('potted_plant_02', { scale: 1 }); const b = new THREE.Box3().setFromObject(o), s = .5 / (b.max.y - b.min.y); o.scale.multiplyScalar(s); return named(shadow(o), 'flowerpot'); }

// WINDOW AC UNIT (a real 5000 BTU unit: ~.47 w x .31 h x .41 d m; beige case, front louver grille, side fins)
export function windowAC() {
  const g = new THREE.Group(), case_ = M.paint('#d9d3c4'), grey = M.matte('#9a978f');
  g.add(B(.47, .31, .41, case_, 0, .155, 0, .015));
  for (let i = 0; i < 7; i++) g.add(B(.42, .012, .02, grey, 0, .05 + i * .03, .208, .003));              // front louvers
  g.add(B(.14, .07, .01, M.matte('#3a3c40'), .13, .26, .207, .004));                                       // control panel
  for (const sx of [-1, 1]) for (let i = 0; i < 8; i++)   // side intake fins g.add(B(.006, .16, .006, grey, sx * .237, .2, -.15 + i * .04, .001));
  return named(shadow(g), 'window AC');
}

// BANANA PEEL lying open on the pavement: three tapered petals from a stem, yellow with brown tips
export function bananaPeel() {
  const g = new THREE.Group(), y = new THREE.MeshStandardMaterial({ color: '#efd24a', roughness: .55, side: THREE.DoubleSide }), br = new THREE.MeshStandardMaterial({ color: '#5a3d1c', roughness: .8 });
  const petal = a => { const shp = new THREE.Shape(); shp.moveTo(-.022, 0); shp.quadraticCurveTo(-.035, .09, 0, .17); shp.quadraticCurveTo(.035, .09, .022, 0); shp.lineTo(-.022, 0);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shp, 8), y); m.rotation.x = -Math.PI / 2 + .12; m.rotation.z = a; m.position.y = .012; return m; };
  for (const a of [0, 2.2, -2.1]) g.add(petal(a));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.009, .012, .05, 8), br); stem.rotation.z = Math.PI / 2.4; stem.position.set(0, .03, 0); g.add(stem);
  return named(shadow(g), 'banana peel');
}

// POP-UP SPRINKLER HEAD in the lawn (green cap ~.07 m, riser .1 m when up)
export function sprinkler() {
  const g = new THREE.Group(), grn = M.matte('#2f4a2a'), blk = M.matte('#1c1d1f');
  g.add(B(.08, .02, .08, grn, 0, .01, 0, .03)); const riser = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .12, 10), blk); riser.position.y = .06; g.add(riser);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .025, 12), grn); cap.position.y = .125; g.add(cap); g.userData.riser = [riser, cap];
  return named(shadow(g), 'sprinkler');
}

// BASKETBALL: size 7 (.24 m), orange pebbled leather with black channel lines (UV-mapped stripes)
export function basketball() {
  const tex = canvasTex(512, 256, (x, W, H) => { x.fillStyle = '#d4682a'; x.fillRect(0, 0, W, H); for (let i = 0; i < 2600; i++) { x.fillStyle = Math.random() < .5 ? 'rgba(0,0,0,.06)' : 'rgba(255,200,150,.06)'; x.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
    x.strokeStyle = '#1a1210'; x.lineWidth = 5; for (const u of [0, .25, .5, .75]) { x.beginPath(); x.moveTo(u * W, 0); x.lineTo(u * W, H); x.stroke(); } x.beginPath(); x.moveTo(0, H / 2); x.lineTo(W, H / 2); x.stroke(); });
  const m = new THREE.Mesh(new THREE.SphereGeometry(.12, 28, 18), new THREE.MeshStandardMaterial({ map: tex, roughness: .7 })); m.castShadow = true; return named(m, 'basketball');
}

// SODA CAN (12 oz: .066 dia x .122 m), aluminium with a red label; origin at its centre
export function sodaCan(col = '#c8202a') {
  const lab = canvasTex(256, 128, (x, W, H) => { x.fillStyle = col; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.font = '900 46px Arial Black, sans-serif'; x.textAlign = 'center'; x.fillText('FIZZ', W / 2, H * .62); x.fillRect(0, H * .8, W, 6); });
  const g = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(.033, .033, .11, 20), [new THREE.MeshStandardMaterial({ map: lab, roughness: .3, metalness: .4 }), M.metal('#c9ccd0'), M.metal('#c9ccd0')]);
  g.add(body); for (const s of [1, -1]) { const lip = new THREE.Mesh(new THREE.CylinderGeometry(s > 0 ? .027 : .029, .033, .008, 20), M.metal('#c9ccd0')); lip.position.y = s * .059; if (s < 0) lip.rotation.x = Math.PI; g.add(lip); }
  return named(shadow(g), 'soda can');
}

// SCRATCH CARD (.1 x .15 m). Redesigned 2026-11-27 (Xavier: the blue/brown card "looks bad, not exciting"): built like a
// real premium instant ticket (state-lottery "$1,000,000" games): red-to-gold sunburst, gold foil border with marquee
// lights, chunky 3D gold "LUCKY 7s" logo, a ribbon prize line, three silver scratch coins with sheen + SCRATCH text,
// gold "7" coins underneath; when all three are off a starburst JACKPOT + $1,000,000 lands.
export function scratchCard() {
  const W = 512, H = 768, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const gold = (y0, y1) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#fff6b0'); g.addColorStop(.35, '#ffd23a'); g.addColorStop(.6, '#e8a10c'); g.addColorStop(1, '#fff0a0'); return g; };
  const star = (cx, cy, R, r, n) => { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, q = i % 2 ? r : R; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.closePath(); };
  const txt = (s, cx, cy, size, fill, stroke, sw) => { x.font = `900 ${size}px Arial Black, Impact, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
    x.fillStyle = '#5a1200'; x.fillText(s, cx + size * .06, cy + size * .07); if (stroke) { x.strokeStyle = stroke; x.lineWidth = sw; x.strokeText(s, cx, cy); } x.fillStyle = fill; x.fillText(s, cx, cy); };
  const draw = k => {
    // sunburst background
    const bg = x.createRadialGradient(W / 2, 250, 20, W / 2, 300, 560); bg.addColorStop(0, '#ffcf3a'); bg.addColorStop(.35, '#f2631c'); bg.addColorStop(1, '#a3081c'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
    x.save(); x.translate(W / 2, 250); for (let i = 0; i < 28; i++) { x.rotate(Math.PI * 2 / 28); x.fillStyle = i % 2 ? 'rgba(255,240,160,.18)' : 'rgba(255,255,255,.05)'; x.beginPath(); x.moveTo(0, 0); x.lineTo(-40, -700); x.lineTo(40, -700); x.closePath(); x.fill(); } x.restore();
    // gold foil border + marquee lights
    x.lineWidth = 26; x.strokeStyle = gold(0, H); x.strokeRect(13, 13, W - 26, H - 26); x.lineWidth = 4; x.strokeStyle = '#7a3d00'; x.strokeRect(28, 28, W - 56, H - 56);
    for (let i = 0; i < 46; i++) { const p = i / 46, per = 2 * (W + H) - 104; let d = p * per, cx, cy; if (d < W - 26) { cx = 13 + d; cy = 13; } else if ((d -= W - 26) < H - 26) { cx = W - 13; cy = 13 + d; } else if ((d -= H - 26) < W - 26) { cx = W - 13 - d; cy = H - 13; } else { d -= W - 26; cx = 13; cy = H - 13 - d; }
      x.fillStyle = i % 2 ? '#fffbe0' : '#ff3b3b'; x.beginPath(); x.arc(cx, cy, 5.5, 0, 7); x.fill(); }
    // logo
    txt('MEGA', W / 2, 78, 46, '#ffffff', '#b3001b', 10);
    txt('LUCKY 7s', W / 2, 160, 104, gold(110, 210), '#8a0f00', 16);
    for (const [sx, sy, s] of [[66, 118, 20], [450, 112, 16], [432, 214, 13], [84, 222, 12]]) { x.fillStyle = '#fffbd8'; star(sx, sy, s, s * .35, 4); x.fill(); }
    // ribbon prize line
    x.fillStyle = '#1a2f9e'; x.beginPath(); x.moveTo(40, 248); x.lineTo(W - 40, 248); x.lineTo(W - 62, 280); x.lineTo(W - 40, 312); x.lineTo(40, 312); x.lineTo(62, 280); x.closePath(); x.fill();
    x.lineWidth = 4; x.strokeStyle = '#ffd23a'; x.stroke(); txt('WIN UP TO $1,000,000!', W / 2, 281, 34, '#ffffff', null, 0);
    // play panel
    x.fillStyle = 'rgba(70,0,10,.55)'; x.beginPath(); x.roundRect(44, 336, W - 88, 214, 22); x.fill(); x.lineWidth = 5; x.strokeStyle = '#ffd23a'; x.stroke();
    for (let i = 0; i < 3; i++) { const cx = 118 + i * 138, cy = 443, R = 58, left = Math.max(0, Math.min(1, k * 3 - i));
      // the prize under the foil: a gold coin with a red 7
      x.fillStyle = gold(cy - R, cy + R); x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill(); x.lineWidth = 5; x.strokeStyle = '#a86400'; x.stroke(); txt('7', cx, cy + 3, 78, '#e0101e', '#fff1a0', 6);
      // the silver latex, scratched off top-down with a ragged edge
      if (left < 1) { x.save(); x.beginPath(); x.arc(cx, cy, R + 3, 0, 7); x.clip(); const sv = x.createLinearGradient(cx - R, cy - R, cx + R, cy + R); sv.addColorStop(0, '#f4f6f9'); sv.addColorStop(.45, '#a9afb8'); sv.addColorStop(.55, '#e9ecf0'); sv.addColorStop(1, '#8e949e'); x.fillStyle = sv;
        const top = cy - R - 3 + (2 * R + 6) * left; x.beginPath(); x.moveTo(cx - R - 4, cy + R + 4); x.lineTo(cx - R - 4, top); for (let j = 0; j <= 12; j++) x.lineTo(cx - R - 4 + (2 * R + 8) * j / 12, top + (j % 2 ? 7 : -5) * (left > 0 ? 1 : 0)); x.lineTo(cx + R + 4, cy + R + 4); x.closePath(); x.fill();
        if (left === 0) { x.fillStyle = 'rgba(70,74,84,.85)'; x.font = '900 19px Arial Black'; x.textAlign = 'center'; x.fillText('SCRATCH', cx, cy + 2); } x.restore(); } }
    // footer: the jackpot burst once all three are off
    if (k >= 1) { x.fillStyle = '#ffe23a'; star(W / 2, 642, 120, 92, 18); x.fill(); x.lineWidth = 6; x.strokeStyle = '#c4001a'; x.stroke(); txt('JACKPOT!', W / 2, 622, 58, '#e0101e', '#fff6c0', 8); txt('$1,000,000', W / 2, 676, 36, '#1a2f9e', '#ffffff', 6); }
    else { txt('MATCH 3 SEVENS', W / 2, 612, 40, '#ffffff', '#8a0f00', 8); txt('$5 · INSTANT WIN', W / 2, 668, 30, '#ffe066', null, 0); }
    tex.needsUpdate = true; };
  draw(0); const m = new THREE.Mesh(new THREE.PlaneGeometry(.1, .15), new THREE.MeshStandardMaterial({ map: tex, roughness: .35, metalness: .05, side: THREE.DoubleSide }));
  m.userData.scratch = k => { if (m.userData.k !== k) { m.userData.k = k; draw(k); } }; return named(m, 'scratch card');
}

// DIGITAL WALL CLOCK (Xavier 2026-11-27: the analog clock read as "a grey circle on a brown thing", twice). A real LED
// calendar wall clock (the common ~16" x 8" type): black gloss panel, big red 7-segment time, amber day + date line.
// setTime(h, m, s) redraws; the colon blinks each second. Origin = wall contact, face toward +z.
export function digitalClock() {
  const W = 1024, H = 512, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  const digit = (n, ox, oy, w, h, t, on, off) => { const s = SEG[n] || '', P = { a: [ox + t, oy, w - 2 * t, t], d: [ox + t, oy + h - t, w - 2 * t, t], g: [ox + t, oy + h / 2 - t / 2, w - 2 * t, t], f: [ox, oy + t, t, h / 2 - t], b: [ox + w - t, oy + t, t, h / 2 - t], e: [ox, oy + h / 2, t, h / 2 - t], c: [ox + w - t, oy + h / 2, t, h / 2 - t] };
    for (const k of 'abcdefg') { x.fillStyle = s.includes(k) ? on : off; const [a, b, c, d] = P[k]; x.beginPath(); x.roundRect(a + 2, b + 2, c - 4, d - 4, t / 2); x.fill(); } };
  let last = '';
  const draw = (h, m, s) => { const key = `${h}${m}${Math.floor(s) % 2}`; if (key === last) return; last = key;
    x.fillStyle = '#0b0b0d'; x.fillRect(0, 0, W, H); const sh = x.createLinearGradient(0, 0, 0, H); sh.addColorStop(0, 'rgba(255,255,255,.07)'); sh.addColorStop(.4, 'rgba(255,255,255,0)'); x.fillStyle = sh; x.fillRect(0, 0, W, H);
    const on = '#ff2a1a', off = 'rgba(255,40,20,.07)';
    x.shadowColor = '#ff2a1a'; x.shadowBlur = 24;
    const hs = String(h), DW = 150, DH = 270, T = 30, y0 = 50; let ox = 120;
    if (hs.length > 1) digit(+hs[0], ox, y0, DW, DH, T, on, off); ox += DW + 28; digit(+hs[hs.length - 1], ox, y0, DW, DH, T, on, off); ox += DW + 34;
    x.fillStyle = Math.floor(s) % 2 ? off : on; x.beginPath(); x.arc(ox + 18, y0 + 80, 17, 0, 7); x.arc(ox + 18, y0 + 190, 17, 0, 7); x.fill(); ox += 70;
    digit(Math.floor(m / 10), ox, y0, DW, DH, T, on, off); ox += DW + 28; digit(m % 10, ox, y0, DW, DH, T, on, off);
    x.shadowColor = '#ffb020'; x.shadowBlur = 16; x.fillStyle = '#ffb020'; x.font = '900 120px Arial Black, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FRIDAY', 360, 418); x.font = '700 64px Arial'; x.fillText('PM', 800, 420);
    x.shadowBlur = 0; tex.needsUpdate = true; };
  const g = new THREE.Group();
  const bez = B(.45, .24, .028, M.metal('#c9ccd1'), 0, 0, .014, .012); g.add(bez); const body = B(.42, .21, .03, M.matte('#0d0d0f'), 0, 0, .017, .008); g.add(body);   // brushed-aluminium bezel round the black glass
  const face = new THREE.Mesh(new THREE.PlaneGeometry(.4, .2), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); face.position.z = .036; g.add(face);   // in front of the body's glass (the bezel pushed the body forward)
  g.userData.setTime = (h, m, s) => draw(h, m, s); draw(4, 58, 0); shadow(g); face.castShadow = false; return named(g, 'digital clock');
}

// GOLD BULLION (a real 400 oz London Good Delivery bar: ~25 x 7 x 4 cm trapezoid, top narrower), and a stack of them
export function goldBars(rows = [4, 3, 2]) {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: '#ffcf40', metalness: .55, roughness: .28, emissive: '#7a5200', emissiveIntensity: .45 });
  const shp = new THREE.Shape(); shp.moveTo(-.125, 0); shp.lineTo(.125, 0); shp.lineTo(.105, .07); shp.lineTo(-.105, .07); shp.closePath();
  const geo = new THREE.ExtrudeGeometry(shp, { depth: .08, bevelEnabled: true, bevelSize: .006, bevelThickness: .006, bevelSegments: 2 }); geo.translate(0, 0, -.04);
  rows.forEach((n, r) => { for (let i = 0; i < n; i++) { const m = new THREE.Mesh(geo, mat); m.position.set(0, r * .074, (i - (n - 1) / 2) * .097); g.add(m); } });
  return named(shadow(g), 'gold bars');
}

// RENT LETTER: a real landlord's "NOTICE TO PAY RENT OR QUIT" on US letter (.216 x .279 m), redrawn 2026-11-27 (Xavier: "could
// look more realistic"): property-management letterhead, date + tenant block, an itemised amount-due box, the body in real
// small print, a red FINAL NOTICE rubber stamp at an angle, the deadline line in bold red, a signature.
export function rentLetter() {
  const tex = canvasTex(1224, 1584, (x, W, H) => {
    x.fillStyle = '#fbfaf5'; x.fillRect(0, 0, W, H);
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(120,110,90,${Math.random() * .035})`; x.fillRect(Math.random() * W, Math.random() * H, 2, 2); }   // paper tooth
    x.fillStyle = '#1d3557'; x.fillRect(90, 80, 92, 92); x.fillStyle = '#fbfaf5'; x.font = '900 58px Georgia, serif'; x.textAlign = 'center'; x.fillText('M', 136, 148);
    x.textAlign = 'left'; x.fillStyle = '#1d3557'; x.font = '700 44px Georgia, serif'; x.fillText('MAPLE RIDGE PROPERTY MANAGEMENT', 205, 122);
    x.font = '400 26px Arial'; x.fillStyle = '#555'; x.fillText('1180 Harbor Ave, Suite 4  ·  (555) 014-2290  ·  rent@mapleridgepm.com', 205, 160);
    x.fillStyle = '#1d3557'; x.fillRect(90, 200, W - 180, 5);
    x.fillStyle = '#222'; x.font = '400 30px Arial'; x.fillText('November 24', 90, 270); x.fillText('TO: Resident(s), 14 Birch Lane', 90, 320);
    x.textAlign = 'center'; x.font = '900 60px Arial Black, Arial'; x.fillStyle = '#111'; x.fillText('NOTICE TO PAY RENT', W / 2, 430); x.fillText('OR QUIT', W / 2, 500);
    x.textAlign = 'left'; x.font = '400 27px Georgia, serif'; x.fillStyle = '#2a2a2a';
    const body = ['You are hereby notified that rent for the above premises is now past due.', 'Your balance must be paid IN FULL by the date and time below. If payment', 'is not received, your lease will be terminated and you must vacate.'];
    body.forEach((l, i) => x.fillText(l, 90, 580 + i * 42));
    // amount due box
    x.strokeStyle = '#222'; x.lineWidth = 3; x.strokeRect(90, 730, W - 180, 230);
    const rows = [['Rent (October)', '$1,450.00'], ['Rent (November)', '$1,450.00'], ['Late fees', '$190.00']];
    x.font = '400 30px Arial'; rows.forEach(([a, b], i) => { x.fillStyle = '#222'; x.fillText(a, 120, 785 + i * 46); x.textAlign = 'right'; x.fillText(b, W - 120, 785 + i * 46); x.textAlign = 'left'; });
    x.fillRect(120, 912, W - 240, 2); x.font = '900 36px Arial Black, Arial'; x.fillText('TOTAL DUE', 120, 948); x.textAlign = 'right'; x.fillStyle = '#c4161c'; x.fillText('$3,090.00', W - 120, 948); x.textAlign = 'left';
    // the deadline
    x.fillStyle = '#c4161c'; x.font = '900 52px Arial Black, Arial'; x.textAlign = 'center'; x.fillText('DUE: FRIDAY, 5:00 PM', W / 2, 1060);
    x.textAlign = 'left'; x.font = '400 25px Georgia, serif'; x.fillStyle = '#444';
    ['Payment may be made at the management office or by certified check.', 'No partial payments will be accepted after this notice.'].forEach((l, i) => x.fillText(l, 90, 1140 + i * 38));
    x.font = 'italic 54px "Brush Script MT", cursive'; x.fillStyle = '#1d3557'; x.fillText('R. Halvorsen', 90, 1320); x.font = '400 24px Arial'; x.fillStyle = '#555'; x.fillText('Property Manager', 90, 1356);
    // FINAL NOTICE rubber stamp
    x.save(); x.translate(860, 1300); x.rotate(-.22); x.strokeStyle = 'rgba(196,22,28,.85)'; x.lineWidth = 9; x.strokeRect(-210, -70, 420, 140); x.lineWidth = 3; x.strokeRect(-196, -56, 392, 112);
    x.fillStyle = 'rgba(196,22,28,.85)'; x.font = '900 62px Arial Black, Arial'; x.textAlign = 'center'; x.fillText('FINAL NOTICE', 0, 22); x.restore();
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(.216, .279), new THREE.MeshStandardMaterial({ map: tex, roughness: .9, side: THREE.DoubleSide })); m.castShadow = true; return named(m, 'rent letter');
}

// WALL CLOCK (a plain 12" office clock: .3 m face, black rim); setTime(h, m, s) drives the hands. Origin = wall contact, face toward +z
export function wallClock() {
  const g = new THREE.Group(), face = canvasTex(512, 512, (x, W) => { x.fillStyle = '#fbfbf8'; x.beginPath(); x.arc(W / 2, W / 2, W / 2, 0, 7); x.fill(); x.fillStyle = '#111'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 54px Arial';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; x.fillText(String(i), W / 2 + Math.sin(a) * 196, W / 2 - Math.cos(a) * 196); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r0 = i % 5 ? 236 : 226; x.lineWidth = i % 5 ? 3 : 7; x.beginPath(); x.moveTo(W / 2 + Math.sin(a) * r0, W / 2 - Math.cos(a) * r0); x.lineTo(W / 2 + Math.sin(a) * 248, W / 2 - Math.cos(a) * 248); x.stroke(); } });
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .045, 48).rotateX(Math.PI / 2), M.matte('#1b1b1d')); rim.position.z = .0225; g.add(rim);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(.145, 48), new THREE.MeshStandardMaterial({ map: face, roughness: .6 })); dial.position.z = .046; g.add(dial);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(.147, 48), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .05, metalness: .1, transparent: true, opacity: .06, depthWrite: false })); glass.position.z = .056; g.add(glass);
  const hand = (len, w, col, z) => { const p = new THREE.Group(); p.position.z = z; const m = B(w, len, .004, M.matte(col), 0, len / 2 - .02, 0, .001); p.add(m); g.add(p); return p; };
  const H = hand(.08, .012, '#111', .049), Mi = hand(.12, .008, '#111', .051), S = hand(.13, .003, '#c41a1a', .053);
  g.userData.setTime = (h, m, s) => { S.rotation.z = -s / 60 * Math.PI * 2; Mi.rotation.z = -(m + s / 60) / 60 * Math.PI * 2; H.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; };
  shadow(g); glass.castShadow = false; return named(g, 'wall clock');
}

// UMBRELLA (a stick umbrella, 1.0 m canopy, 8 ribs) held by the shaft; origin = hand grip, canopy up
export function umbrella(col = '#24324d') {
  const g = new THREE.Group(), cloth = new THREE.MeshStandardMaterial({ color: col, roughness: .7, side: THREE.DoubleSide }), metal = M.metal('#8d9096');
  const can = new THREE.Mesh(new THREE.ConeGeometry(.52, .28, 8, 1, true), cloth); can.position.y = .78; g.add(can);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .9, 8), metal); shaft.position.y = .45; g.add(shaft);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(.006, .01, .06, 8), metal); tip.position.y = .95; g.add(tip);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(.045, .012, 8, 16, Math.PI), M.matte('#3a2618')); hook.rotation.z = Math.PI; hook.position.set(.045, 0, 0); g.add(hook);
  return named(shadow(g), 'umbrella');
}

// STORM CLOUD DECK: a low, lumpy dark layer of overlapping flattened spheres over a radius; hole(k) opens a gap over the centre
export function stormClouds({ r = 22, y = 16, seed = 3 } = {}) {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: '#4a4f58', roughness: 1 }), lumps = [];
  const rnd = s => { const v = Math.sin(s * 91.7 + seed) * 43758.5; return v - Math.floor(v); };
  for (let i = 0; i < 70; i++) { const a = rnd(i) * 6.283, rr = Math.sqrt(rnd(i + 50)) * r, s = 3 + rnd(i + 99) * 4; const q = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), m); q.scale.set(s, s * .4, s); q.position.set(Math.cos(a) * rr, y + rnd(i + 7) * 1.5, Math.sin(a) * rr); q.userData.rr = rr; g.add(q); lumps.push(q); }
  g.userData.hole = (k, R = 6) => lumps.forEach(q => { q.visible = q.userData.rr > R * k; });
  return named(g, 'storm clouds');
}

// RAINBOW: a 7-band arc (half torus) whose foot lands on the target; grow(k) sweeps it in
export function rainbow({ R = 9, w = 1.1 } = {}) {
  const tex = canvasTex(8, 256, (x, W, H) => { const c = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#3949ab', '#8e24aa']; c.forEach((col, i) => { x.fillStyle = col; x.fillRect(0, i * H / 7, W, H / 7 + 1); }); });
  const geo = new THREE.RingGeometry(R - w / 2, R + w / 2, 64, 1, 0, Math.PI), uv = geo.attributes.uv, pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const rr = Math.hypot(pos.getX(i), pos.getY(i)); uv.setXY(i, .5, (rr - (R - w / 2)) / w); }
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .7, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(geo, mat); m.userData.grow = k => { m.material.opacity = .7 * k; m.scale.setScalar(.6 + .4 * k); };
  return named(m, 'rainbow');
}

// FRONT-DOOR STYLE "EATS MONEY" tape sign already lives on the vending machine (lucky_me_set.js)

// BOXWOOD HEDGE (a clipped garden hedge: dense, boxy, ~1.1 m tall): a dark green core + ~2000 leaf cards scattered over its surface
export function hedge({ w = 6, h = 1.15, d = .95, seed = 5 } = {}) {
  const g = new THREE.Group(), core = new THREE.Mesh(new THREE.BoxGeometry(w - .12, h - .1, d - .12), new THREE.MeshStandardMaterial({ color: '#2c4a22', roughness: 1 }));
  core.position.y = (h - .1) / 2; g.add(core);
  const rnd = s => { const v = Math.sin(s * 77.3 + seed) * 43758.5; return v - Math.floor(v); }, n = Math.round(w * 340), card = new THREE.PlaneGeometry(.16, .16);
  const im = new THREE.InstancedMesh(card, leafMat(), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(1, 1, 1);
  for (let i = 0; i < n; i++) { const f = rnd(i), x = (rnd(i + 1) - .5) * w, z = (rnd(i + 2) - .5) * d, y = rnd(i + 3) * h, top = f < .3;
    const p = top ? new THREE.Vector3(x, h - .03 + rnd(i + 4) * .06, z) : f < .65 ? new THREE.Vector3(x, y, (rnd(i + 5) < .5 ? -1 : 1) * (d / 2 + (rnd(i + 6) - .5) * .06)) : new THREE.Vector3((rnd(i + 7) < .5 ? -1 : 1) * (w / 2 + (rnd(i + 8) - .5) * .06), y, z * .95);
    e.set(rnd(i + 9) * 6.28, rnd(i + 10) * 6.28, rnd(i + 11) * 6.28); q.setFromEuler(e); sc.setScalar(.8 + rnd(i + 12) * .6); m4.compose(p, q, sc); im.setMatrixAt(i, m4); }
  im.castShadow = im.receiveShadow = true; g.add(im); core.castShadow = core.receiveShadow = true; return named(g, 'hedge');
}

// POOL DRINK: a tall highball glass (.07 dia x .15 m) of orange juice, ice, a striped straw and a lemon slice; origin = grip (mid-glass)
export function poolDrink() {
  const g = new THREE.Group(), glass = new THREE.Mesh(new THREE.CylinderGeometry(.036, .032, .15, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#e8f2f6', roughness: .05, transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false }));
  const juice = new THREE.Mesh(new THREE.CylinderGeometry(.033, .03, .12, 16), new THREE.MeshStandardMaterial({ color: '#f39a1e', roughness: .3 })); juice.position.y = -.012;
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(.005, .005, .2, 8), new THREE.MeshStandardMaterial({ color: '#e8344a', roughness: .5 })); straw.position.set(.012, .06, 0); straw.rotation.z = -.25;
  const lemon = new THREE.Mesh(new THREE.CylinderGeometry(.028, .028, .008, 16), new THREE.MeshStandardMaterial({ color: '#f3df3a', roughness: .5 })); lemon.position.set(-.03, .07, 0); lemon.rotation.x = N2;
  g.add(glass, juice, straw, lemon); juice.castShadow = straw.castShadow = true; return named(g, 'pool drink');
}
const N2 = Math.PI / 2;
