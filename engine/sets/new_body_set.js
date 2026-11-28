// NEW BODY sets (2026-11-28): school bus interior, auditorium stage, school hallway with lockers,
// the comic split-screen rig, and the swap-poof FX (white sparkle cloud, NOT the money poof in luckfx).
// All metres at studio scale. Every set: floor y 0, centred on x/z unless noted.
import * as THREE from 'three';
import { mat } from '../materials.js';
import { room } from './roomkit.js';
import { canvasTex } from '../util.js';
import { bbox } from '../build.js';

const B = (w, h, d, m, x = 0, y = 0, z = 0, r = 0) => { const g = r ? bbox(w, h, d, m, r, 2) : new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); g.position.set(x, y, z); g.castShadow = g.receiveShadow = true; return g; };
const grp = (...o) => { const g = new THREE.Group(); g.add(...o); return g; };
const matte = c => new THREE.MeshStandardMaterial({ color: c, roughness: .85 });
const painted = (c, r = .45) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: .15 });

// ============================== SCHOOL BUS INTERIOR ==============================
// A real US school bus inside: ~2.44 m wide body (x 1.4 scale -> 3.4 m so R6 pairs fit a bench), flat floor with a
// ribbed rubber aisle, green vinyl high-back benches both sides, window band with thick pillars (NOT thin far geometry:
// pillars are .09 m), curved cream ceiling with dome lights, driver fence + dash hint at the front.
// Length sized for 5 rows. The set is OPEN glass: park it on a town street so every window sees houses.
export function busInterior({ rows = 5 } = {}) {
  const g = new THREE.Group(); g.name = 'bus interior';
  const W = 5.4, L = rows * 1.55 + 3.2, H = 3.0, sillY = 1.15, winH = 1.15;   // Roblox-bus wide: a bench must hold two R6 kids side by side (R6 is 1.36 m across the arms)
  const cream = painted('#e8e4d8', .5), green = new THREE.MeshStandardMaterial({ color: '#2f5d46', roughness: .55 }),
    greenDark = new THREE.MeshStandardMaterial({ color: '#27493a', roughness: .6 }), steel = new THREE.MeshStandardMaterial({ color: '#8d9298', metalness: .6, roughness: .35 }),
    rubber = mat('concrete', { color: '#3a3a3c', size: 1 }), glassM = new THREE.MeshPhysicalMaterial({ color: '#cfe4f2', transparent: true, opacity: .14, roughness: .05, side: THREE.DoubleSide });
  // floor: dark rubber, ribbed aisle strip
  g.add(B(W, .1, L, rubber, 0, -.05, 0));
  g.add(B(.9, .012, L, matte('#2c2c2e'), 0, .007, 0));
  // walls: below the sill solid, window band above with pillars, then roof cove
  for (const s of [-1, 1]) {
    g.add(B(.08, sillY, L, cream, s * (W / 2 - .04), sillY / 2, 0, .01));                       // lower panel
    g.add(B(.1, .09, L, steel, s * (W / 2 - .05), sillY + .02, 0, .01));                        // sill rail
    const nWin = Math.round(L / 1.35);
    for (let i = 0; i <= nWin; i++) g.add(B(.09, winH, .09, cream, s * (W / 2 - .045), sillY + winH / 2 + .04, -L / 2 + i * (L / nWin), .01));  // pillars (thick, never slivers)
    g.add(B(.02, winH, L, glassM, s * (W / 2 - .045), sillY + winH / 2 + .04, 0));              // one glass band
    g.add(B(.09, H - sillY - winH - .1, L, cream, s * (W / 2 - .045), (H + sillY + winH) / 2, 0, .01)); // above the windows
  }
  // curved ceiling (three angled panels reading as a cove) + dome lights
  g.add(B(W - 1.0, .08, L, cream, 0, H, 0, .01));
  for (const s of [-1, 1]) { const p = B(1.05, .08, L, cream, s * (W / 2 - .62), H - .12, 0, .01); p.rotation.z = s * .38; g.add(p); }
  for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.CylinderGeometry(.14, .17, .05, 20), new THREE.MeshStandardMaterial({ color: '#f4efdc', emissive: '#fff3d0', emissiveIntensity: .25 })); d.position.set(0, H - .04, -L / 2 + (i + .5) * L / 3); g.add(d); }
  // front + rear walls (film-set simple): rear emergency door with a window, front driver fence + dash block
  g.add(B(W, sillY, .1, cream, 0, sillY / 2, -L / 2 + .05, .01));
  g.add(B(W, H - sillY - winH - .1, .1, cream, 0, (H + sillY + winH) / 2, -L / 2 + .05, .01));
  for (const s of [-1, 1]) g.add(B(W / 2 - .55, winH, .1, cream, s * (W / 4 + .27), sillY + winH / 2 + .04, -L / 2 + .05, .01));
  g.add(B(1.0, winH, .02, glassM, 0, sillY + winH / 2 + .04, -L / 2 + .05));
  g.add(B(W, H, .1, cream, 0, H / 2, L / 2 - .05, .01));   // front bulkhead behind the driver (we never shoot forward)
  // benches: green vinyl high backs on steel legs, both sides, aisle in the middle
  const BW = 2.2;
  const seat = (x, z) => { const b = new THREE.Group();
    b.add(B(BW, .14, .62, green, 0, .62, 0, .04));                          // cushion
    b.add(B(BW, .62, .14, green, 0, .96, -.26, .05));                       // back: shoulder height of a seated kid (real school bus), so every row's heads read
    b.add(B(BW, .07, .16, greenDark, 0, 1.29, -.25, .03));                  // top rail
    b.add(B(.07, .55, .07, steel, -BW / 2 + .2, .28, .1)); b.add(B(.07, .55, .07, steel, BW / 2 - .2, .28, .1));
    b.add(B(BW, .09, .55, greenDark, 0, .5, 0, .03));                       // frame under the cushion
    b.position.set(x, 0, z); return b; };
  const seats = [];
  for (let i = 0; i < rows; i++) { const z = -L / 2 + 1.6 + i * 1.55;
    for (const s of [-1, 1]) { const sx = s * (W / 2 - .1 - BW / 2); const b = seat(sx, z); g.add(b); seats.push({ x: sx, z, side: s, row: i, seatY: .69 }); } }   // backs at -z: everyone faces the front (+z)
  g.userData = { W, L, H, seats, sillY };
  return g;
}

// ============================== AUDITORIUM STAGE ==============================
// A school auditorium seen from the house: raised wooden stage, deep-red main curtain backdrop, side legs, two choir
// risers across the stage, a lectern, warm stage wash from a visible light bar. The house floor in front is dark.
// Enclosed set (place far from the town, e.g. x 9300): no windows needed; the light is the stage's own (motivated).
export function auditorium() {
  const g = new THREE.Group(); g.name = 'auditorium';
  const SW = 12, SD = 6.4, SH = .9;                                        // stage width, depth, height over the house floor
  const wood = mat('wood_floor', { size: 2.2 }), curtain = new THREE.MeshStandardMaterial({ color: '#7c1d24', roughness: .95 }),
    curtain2 = new THREE.MeshStandardMaterial({ color: '#641219', roughness: .95 }), black = matte('#141414'), houseFloor = mat('carpet', { color: '#3c3f4a', size: 1.4 });
  g.add(B(SW, SH, SD, matte('#20150f'), 0, SH / 2 - .01, 0, .01));  // stage box
  const deck = B(SW, .06, SD, wood, 0, SH + .03, 0, .01); g.add(deck);
  g.add(B(SW + 14, .1, 10, houseFloor, 0, -.05, SD / 2 + 5));              // house floor in front
  // back curtain: panels with folds (alternating two reds, slight z offsets: real fullness, no cloth sim)
  for (let i = 0; i < 22; i++) { const w = SW / 22 + .06, p = B(w, 5.2, .1, i % 2 ? curtain : curtain2, -SW / 2 + (i + .5) * SW / 22, SH + 2.6, -SD / 2 + .2 + (i % 2) * .07, .02); p.rotation.y = (i % 2 ? 1 : -1) * .05; g.add(p); }
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { const p = B(.5, 5.2, .1, i % 2 ? curtain : curtain2, s * (SW / 2 - .2), SH + 2.6, -SD / 2 + .6 + i * .5, .02); p.rotation.y = s * Math.PI / 2; g.add(p); }
  g.add(B(SW + 2, 1.1, .3, black, 0, SH + 5.4, 0, .02));                   // proscenium header
  for (const s of [-1, 1]) g.add(B(.5, SH + 6, .4, black, s * (SW / 2 + .8), (SH + 6) / 2, SD / 2 - .3, .02));  // proscenium legs
  // risers: two platforms across the back half
  g.add(B(SW - 3.6, .35, 1.3, matte('#2a2d33'), 0, SH + .175, -1.6, .02));
  g.add(B(SW - 3.6, .7, 1.3, matte('#2a2d33'), 0, SH + .35, -2.9, .02));
  g.add(B(SW - 3.6, .04, 1.3, wood, 0, SH + .37, -1.6, .01)); g.add(B(SW - 3.6, .04, 1.3, wood, 0, SH + .72, -2.9, .01));
  // light bar with cans (visible source for the wash)
  const bar = B(SW - 1, .09, .09, black, 0, SH + 5.9, SD / 2 + 2.2); g.add(bar);
  for (let i = 0; i < 5; i++) { const can = new THREE.Mesh(new THREE.CylinderGeometry(.11, .14, .3, 14), black); can.position.set(-SW / 2 + 1.5 + i * (SW - 3) / 4, SH + 5.72, SD / 2 + 2.2); can.rotation.x = 1.0; g.add(can);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(.1, 14), new THREE.MeshStandardMaterial({ color: '#fff2cc', emissive: '#ffe9b0', emissiveIntensity: 2.2 })); lens.position.set(can.position.x, can.position.y - .13, can.position.z + .1); lens.rotation.x = -.6; g.add(lens); }
  // lectern at stage right
  g.add(grp(B(.58, 1.15, .42, matte('#4a3321'), 0, .575, 0, .02), B(.62, .06, .5, matte('#5d4128'), 0, 1.18, -.03, .01)).translateX(SW / 2 - 2.2).translateY(SH).translateZ(1.9));
  g.userData = { SW, SD, SH, riser1: { y: SH + .39, z: -1.6 }, riser2: { y: SH + .74, z: -2.9 }, deckY: SH + .06 };
  return g;
}

// ============================== SCHOOL HALLWAY + LOCKERS ==============================
// A US high-school corridor: CMU walls, VCT floor, a full run of lockers both sides, acoustic ceiling with troffers,
// double doors at one end, a window pair at the other (shows a courtyard backdrop card: trees + lawn, never void).
export async function schoolHallway({ len = 16 } = {}) {
  const Wd = 3.6, H = 3.2;
  const g = new THREE.Group(); g.name = 'school hallway';
  const wall = mat('cmu', { color: '#e3e9ec' }), floor = mat('vct', { clearcoat: .5, clearcoatRough: .15 }), ceil = mat('ceilingTile');
  g.add(B(Wd, .1, len, floor, 0, -.05, 0));
  for (const s of [-1, 1]) g.add(B(.12, H, len, wall, s * (Wd / 2 + .06), H / 2, 0));
  g.add(B(Wd + .4, .1, len, ceil, 0, H + .05, 0));
  for (let i = 0; i < Math.floor(len / 2.6); i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(.62 * 1.4, .04, 1.24 * 1.4), new THREE.MeshStandardMaterial({ color: '#f2f4f5', emissive: '#ffffff', emissiveIntensity: .55 })); t.position.set(0, H + .02, -len / 2 + 1.6 + i * 2.6); g.add(t); }
  // locker run: units of 6 doors; recessed vents, number plates, one accent colour per school (steel blue)
  const lockerBody = painted('#3e5f80', .4), lockerDark = painted('#34506c', .45), steel = new THREE.MeshStandardMaterial({ color: '#b9bec4', metalness: .7, roughness: .3 });
  const lockers = (side, z0, n) => { const u = new THREE.Group();
    for (let i = 0; i < n; i++) { const x = side * (Wd / 2 - .22), z = z0 + i * .52;
      u.add(B(.42, 1.9, .5, lockerBody, x, 1.05, z, .01));
      u.add(B(.02, 1.82, .46, lockerDark, x - side * .215, 1.05, z, .005));                          // door face proud of the body
      for (const vy of [1.7, .55]) for (let v = 0; v < 3; v++) u.add(B(.012, .022, .3, lockerDark, x - side * .225, vy - v * .06, z));  // vents
      u.add(B(.015, .05, .025, steel, x - side * .227, 1.12, z + .17));                               // latch
    }
    u.children.forEach(c => c.castShadow = c.receiveShadow = true); return u; };
  const n = Math.floor((len - 3.5) / .52);
  g.add(lockers(1, -len / 2 + 1.8, n)); g.add(lockers(-1, -len / 2 + 1.8, n));
  // end A: double doors (film-set simple)
  g.add(B(Wd, H, .12, wall, 0, H / 2, len / 2 + .06));
  for (const s of [-1, 1]) { g.add(B(1.15, 2.5, .08, painted('#9ba3ab', .4), s * .62, 1.25, len / 2, .01)); g.add(B(.5, .6, .02, new THREE.MeshPhysicalMaterial({ color: '#cfe4f2', roughness: .1 }), s * .62, 1.7, len / 2 - .05)); }
  // end B: window pair + courtyard backdrop (a lit card 3 m beyond: lawn, two treeParts-style billboards would be heavy; a painted card reads right through glass)
  g.add(B(Wd, 1.0, .12, wall, 0, .5, -len / 2 - .06)); g.add(B(Wd, H - 2.4, .12, wall, 0, H - (H - 2.4) / 2, -len / 2 - .06));
  g.add(B(.14, 1.4, .12, wall, 0, 1.7, -len / 2 - .06));
  g.add(B(Wd, 1.4, .03, new THREE.MeshPhysicalMaterial({ color: '#dcedf8', transparent: true, opacity: .12, roughness: .05 }), 0, 1.7, -len / 2 - .02));
  const sky = canvasTex(512, 256, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9ec7ef'); gr.addColorStop(.55, '#cfe6f6'); gr.addColorStop(.58, '#79a24e'); gr.addColorStop(1, '#5d8540'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = '#3f6b33'; for (let i = 0; i < 6; i++) { const tx = 40 + i * 85, ty = h * .56; x.beginPath(); x.arc(tx, ty - 26, 22, 0, 7); x.fill(); x.fillRect(tx - 3, ty - 10, 6, 16); } });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(Wd * 3.4, 4.4), new THREE.MeshBasicMaterial({ map: sky })); card.position.set(0, 1.6, -len / 2 - 3); g.add(card);
  g.userData = { W: Wd, len, H };
  return g;
}

// ============================== COMIC SPLIT RIG ==============================
// Two stacked comic panels facing +z, filling a 9:16 frame from a fixed camera. Each panel: halftone-dot backdrop card
// (its own colour), a thick black divider bar between them, white gutter frame. The actors stand INSIDE their panel
// volume (in front of the backdrop). API: place at [x, z]; cam() gives the straight-on camera; set(t) runs
// slam-in / drift / crack / swap, driven by times passed in.
export function comicSplit({ x = 9500, z = 0, topColor = '#ffd36b', botColor = '#6bb9ff' } = {}) {
  // v2 (2026-11-28, Xavier: "Dana at the top and him at the bottom, like a comic, fast pace, black line in the centre, comic
  // dots"): a REAL split screen built in depth so each half holds one face chest-up. Camera straight on at D 2.0, fov 58.
  // Layers front to back: black bar (depth 1.4) > BOTTOM actor (depth 1.55) > bottom backdrop (1.85, covers the lower half
  // only, so it hides the top actor's legs) > TOP actor (2.0) > top backdrop (3.2). Backdrops are unlit halftone panels.
  const g = new THREE.Group(); g.name = 'comic split'; g.position.set(x, 0, z);
  const D = 2.0, FOV = 58, tn = Math.tan(FOV * Math.PI / 360);
  const dots = (c, c2, seed) => canvasTex(512, 512, (ctx, w, h) => { ctx.fillStyle = c; ctx.fillRect(0, 0, w, h); ctx.fillStyle = c2;
    for (let yy = 0; yy < 22; yy++) for (let xx = 0; xx < 22; xx++) { const r = 5 + 5 * Math.abs(Math.sin((xx * .7 + yy * .4) + seed)); ctx.beginPath(); ctx.arc(xx * 24 + (yy % 2) * 12, yy * 24, r * .5, 0, 7); ctx.fill(); }
    // speed lines from the corners (comic energy)
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 6; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2 + seed; ctx.beginPath(); ctx.moveTo(w / 2 + Math.cos(a) * 170, h / 2 + Math.sin(a) * 170); ctx.lineTo(w / 2 + Math.cos(a) * 420, h / 2 + Math.sin(a) * 420); ctx.stroke(); } }, [1.6, 1.6]);
  const texA = dots(topColor, '#f0a83a', 0), texB = dots(botColor, '#3f86d8', 1.7);
  const back = (depth, up) => { const hh = depth * tn, ww = hh * 2 * 9 / 16 * 1.25; const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh * 1.3), new THREE.MeshBasicMaterial({ map: texA }));
    m.position.set(0, up ? hh * .65 : -hh * .65, D - depth); g.add(m); return m; };
  const topBack = back(3.2, true), botBack = back(1.85, false), TB0 = topBack.position.y, BB0 = botBack.position.y; botBack.material = new THREE.MeshBasicMaterial({ map: texB });
  const ink = new THREE.MeshBasicMaterial({ color: '#0b0b0d' });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.6, .05, .02), ink); bar.position.set(0, 0, D - 1.4); g.add(bar);
  const crackTex = canvasTex(512, 64, (ctx, w, h) => { ctx.fillStyle = '#0b0b0d'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#fff6dc'; ctx.lineWidth = 7; ctx.beginPath(); let yy = h / 2; ctx.moveTo(0, yy); for (let xx = 0; xx <= w; xx += 32) { yy = h / 2 + (xx / 32 % 2 ? -18 : 18); ctx.lineTo(xx, yy); } ctx.stroke(); });
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(1.6, .05), new THREE.MeshBasicMaterial({ map: crackTex })); crack.position.set(0, 0, .011); crack.visible = false; bar.add(crack);
  // a thin white comic border round each half (reads as panels)
  const border = new THREE.MeshBasicMaterial({ color: '#fbfaf4' });
  for (const sy of [1, -1]) { const ed = new THREE.Mesh(new THREE.BoxGeometry(1.6, .012, .01), border); ed.position.set(0, sy * .028, D - 1.41); g.add(ed); }
  const lerp2 = (a, b, k) => a + (b - a) * k, cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  let st = { top: 0, bot: 0, swapped: false };
  const api = {
    g, D,
    // feet position for whoever is in the TOP / BOTTOM slot (world space, before the slam offset)
    slot: which => which === 'top' ? new THREE.Vector3(x, g.position.y + .64 - 1.56 + st.top, z) : new THREE.Vector3(x, g.position.y - .36 - 1.56 + st.bot * .78, z + (D - 1.55)),
    cam: u => ({ p: [x, g.position.y, z + D], l: [x, g.position.y, z], fov: FOV }),
    swapped: () => st.swapped,
    set: (t, { slamT = 0, crackT = 1e9, swapT = 1e9 } = {}) => {
      const sl = cl((t - slamT) / .26), ov = Math.sin(sl * Math.PI) * .08;
      st.top = (1 - sl) * 2.2 + ov; st.bot = -(1 - sl) * 2.2 - ov;   // slam in: top from above, bottom from below, overshoot
      st.swapped = t >= swapT;
      if (st.swapped) { const k = cl((t - swapT) / .3), b = Math.sin(k * Math.PI) * .1 * (1 - k); st.top += (1 - k) * -.5 + b; st.bot += (1 - k) * .5 - b; }   // after the swap: each slides in from the other side
      topBack.material.map = st.swapped ? texB : texA; botBack.material.map = st.swapped ? texA : texB;
      texA.offset.set(t * .02, t * .01); texB.offset.set(-t * .02, t * .012);
      topBack.position.y = TB0 + st.top * 1.6; botBack.position.y = BB0 + st.bot * .925;
      crack.visible = t >= crackT;
      bar.position.x = t >= crackT && t < crackT + .25 ? Math.sin(t * 70) * .012 * (1 - (t - crackT) / .25) : 0;
    },
  };
  return api;
}

// ============================== SWAP POOF (white sparkle cloud) ==============================
// The town's swap effect: a burst of soft white puffs + tiny glitter sprites that spins up and fades over ~.8 s.
// Pure function of t (safe for out-of-order frames). spiral: puffs orbit while they rise (the mid-swap big one).
export function swapFX(scene) {
  // v2 (Xavier 2026-11-28 02:39: "slightly realistic, not rubbish balls of tiny particles"): a real smoke burst.
  // Volumetric-looking puffs from fractal noise (6 variants, each a lit cloud: bright top-left, cool shaded underside,
  // wispy torn edges), billowing out + up with drag, each puff rotating slowly and thinning as it grows; a short hot
  // core flash at the start; a few tiny real glints (soft star + bloom halo), not cartoon crosses.
  const noise = (() => { const P = new Uint8Array(512); for (let i = 0; i < 256; i++) P[i] = i; for (let i = 255; i > 0; i--) { const j = Math.floor((Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * (i + 1)); [P[i], P[j]] = [P[j], P[i]]; } for (let i = 0; i < 256; i++) P[i + 256] = P[i];
    const f = t => t * t * (3 - 2 * t), gr = (h, x, y) => ((h & 1) ? x : -x) + ((h & 2) ? y : -y);
    return (x, y) => { const X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y); const u = f(x), v = f(y);
      const a = P[X] + Y, b = P[X + 1] + Y; const l = (q, w, k) => q + (w - q) * k;
      return l(l(gr(P[a], x, y), gr(P[b], x - 1, y), u), l(gr(P[a + 1], x, y - 1), gr(P[b + 1], x - 1, y - 1), u), v); }; })();
  const smokeTex = seed => canvasTex(160, 160, (g, w, h) => { const im = g.createImageData(w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const nx = x / w - .5, ny = y / h - .5, r = Math.hypot(nx, ny) * 2;
      let n = 0, a = 1, fq = 3; for (let o = 0; o < 5; o++) { n += noise(nx * fq + seed * 7.3, ny * fq + seed * 3.1) * a; a *= .5; fq *= 2.1; }
      const dens = Math.max(0, Math.min(1, (1 - r * (1.05 - .35 * n)) * 1.6 + n * .55));
      const light = .78 + .22 * Math.max(-1, Math.min(1, (-nx - ny) * 1.6 + n * .8));   // lit from the top-left, shaded underside
      const k = (y * w + x) * 4; d[k] = 250 * light; d[k + 1] = 248 * light; d[k + 2] = 252 * light * (1.02 - .04 * ny); d[k + 3] = 255 * Math.pow(dens, 1.4); }
    g.putImageData(im, 0, 0); });
  const SM = [0, 1, 2, 3, 4, 5].map(smokeTex);
  const glintTex = canvasTex(64, 64, (g, w, h) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.15, 'rgba(255,250,230,.7)'); r.addColorStop(1, 'rgba(255,240,210,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'lighter'; for (const [dx, dy] of [[1, 0], [0, 1]]) { const l = g.createLinearGradient(32 - dx * 30, 32 - dy * 30, 32 + dx * 30, 32 + dy * 30); l.addColorStop(0, 'rgba(255,255,255,0)'); l.addColorStop(.5, 'rgba(255,255,255,.9)'); l.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = l; if (dx) g.fillRect(2, 31, 60, 2); else g.fillRect(31, 2, 2, 60); } });
  const coreTex = canvasTex(64, 64, (g, w, h) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.4, 'rgba(255,248,235,.55)'); r.addColorStop(1, 'rgba(255,240,220,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const root = new THREE.Group(); scene.add(root); const bursts = [];
  const rnd = i => (Math.sin(i * 127.1 + 311.7) * 43758.5453 % 1 + 1) % 1;
  const poof = (t0, at, { size = 1, dur = 1.1, spiral = 0, n = 18 } = {}) => {
    const G = new THREE.Group(); G.visible = false; root.add(G); const parts = []; const N = Math.round(n * 1.4);
    const ro = m => { m.renderOrder = 5; return m; };   // after the face decals (renderOrder 2, no depth write): smoke in front of a face must cover it
    for (let i = 0; i < N; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: SM[i % 6], transparent: true, depthWrite: false, rotation: rnd(i) * 6.28 })); G.add(ro(m));
      const th = rnd(i + 3) * 6.283, ph = Math.acos(1 - 2 * rnd(i + 7)) * .85;   // directions over a sphere, biased up
      parts.push({ m, k: 'p', dir: new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph) * .7 + .15, Math.sin(ph) * Math.sin(th)), sp: (.55 + rnd(i + 11) * .7) * size, s0: (.25 + rnd(i + 13) * .2) * size, s1: (.8 + rnd(i + 17) * .7) * size, rot: (rnd(i + 19) - .5) * 1.4, lag: rnd(i + 23) * .08, sh: .82 + rnd(i + 29) * .18 }); }
    const core = ro(new THREE.Sprite(new THREE.SpriteMaterial({ map: coreTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); G.add(core); parts.push({ m: core, k: 'c' });
    for (let i = 0; i < 7; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glintTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#fff3d6' })); G.add(ro(m));
      parts.push({ m, k: 'g', dir: new THREE.Vector3(rnd(i + 41) - .5, rnd(i + 43) * .8 + .2, rnd(i + 47) - .5).normalize(), sp: (.9 + rnd(i + 53) * .8) * size, s: (.06 + rnd(i + 59) * .06) * size, ph: rnd(i + 61) }); }
    bursts.push({ G, parts, t0, at, dur, spiral, size });
  };
  const update = t => { for (const b of bursts) { const u = (t - b.t0) / b.dur;
    if (u < 0 || u > 1) { b.G.visible = false; continue; }
    b.G.visible = true; const at = typeof b.at === 'function' ? b.at(t) : b.at; b.G.position.set(at[0], at[1], at[2]);
    for (const p of b.parts) {
      if (p.k === 'c') { const k = Math.max(0, 1 - u / .18); p.m.scale.setScalar((.3 + 1.6 * (1 - k)) * b.size); p.m.material.opacity = k * .9; continue; }
      if (p.k === 'g') { const e = 1 - Math.exp(-u * 4); p.m.position.copy(p.dir).multiplyScalar(p.sp * e); p.m.position.y -= .25 * u * u;
        p.m.scale.setScalar(p.s * (1 + .5 * Math.sin(t * 30 + p.ph * 20))); p.m.material.opacity = Math.max(0, 1 - u * 1.4) * (.55 + .45 * Math.sin(t * 23 + p.ph * 40)); continue; }
      const uu = Math.max(0, u - p.lag) / (1 - p.lag), e = 1 - Math.exp(-uu * 5);   // fast burst, strong drag (real smoke slows hard)
      const sw = b.spiral * uu * 5, c = Math.cos(sw), s = Math.sin(sw);
      p.m.position.set((p.dir.x * c - p.dir.z * s) * p.sp * e, p.dir.y * p.sp * e + .35 * uu * uu * b.size, (p.dir.x * s + p.dir.z * c) * p.sp * e);   // billow, then rise
      const sc = p.s0 + (p.s1 - p.s0) * (1 - Math.exp(-uu * 3)); p.m.scale.setScalar(sc);
      p.m.material.rotation += 0; p.m.material.rotation = p.rot * uu + p.dir.x * 3;
      p.m.material.color.setScalar(p.sh);
      p.m.material.opacity = (uu < .08 ? uu / .08 : 1) * Math.pow(1 - uu, 1.6) * .95; } } };
  return { poof, update, root };
}
