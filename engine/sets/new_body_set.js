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
    b.add(B(BW, .95, .14, green, 0, 1.12, -.26, .05));                      // high back
    b.add(B(BW, .07, .16, greenDark, 0, 1.62, -.25, .03));                  // top rail
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
  const g = new THREE.Group(); g.name = 'comic split'; g.position.set(x, 0, z);
  const PW = 4.6, PH = 3.6;                                                 // one panel's visible size at the camera
  const half = (c, c2) => canvasTex(512, 512, (ctx, w, h) => { ctx.fillStyle = c; ctx.fillRect(0, 0, w, h); ctx.fillStyle = c2;
    for (let yy = 0; yy < 20; yy++) for (let xx = 0; xx < 20; xx++) { const r = 4 + 4 * ((xx + yy) % 2); ctx.beginPath(); ctx.arc(xx * 26 + (yy % 2) * 13, yy * 26, r * .55, 0, 7); ctx.fill(); } }, [2.2, 2.2]);
  const mkPanel = c => { const p = new THREE.Group();
    const back = new THREE.Mesh(new THREE.PlaneGeometry(PW * 1.9, PH * 1.35), new THREE.MeshBasicMaterial({ map: half(c[0], c[1]) })); back.position.z = -2.2; p.add(back);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(PW * 2, .08, 5), new THREE.MeshStandardMaterial({ color: c[0], roughness: .9 })); fl.position.set(0, -.04, -.4); fl.receiveShadow = true; p.add(fl);
    return p; };
  const top = mkPanel([topColor, '#e8a93c']), bot = mkPanel([botColor, '#3c7fd0']);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(PW * 2.4, .34, .25), new THREE.MeshStandardMaterial({ color: '#0c0c0e', roughness: .5 }));
  const crackTex = canvasTex(512, 64, (ctx, w, h) => { ctx.fillStyle = '#0c0c0e'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#f6f1e4'; ctx.lineWidth = 5; ctx.beginPath(); let yy = h / 2; ctx.moveTo(0, yy); for (let xx = 0; xx <= w; xx += 24) { yy = h / 2 + (Math.sin(xx * .7) * 14 + ((xx * 13) % 17) - 8); ctx.lineTo(xx, yy); } ctx.stroke(); });
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(PW * 2.4, .34), new THREE.MeshBasicMaterial({ map: crackTex, transparent: true })); crack.position.z = .14; crack.visible = false; bar.add(crack);
  g.add(top, bot, bar);
  // layout: the camera is at zc looking at the bar; panels sit above/below. Actor spots returned in world space.
  const GAP = 2.05;                                                          // panel centre offset from the bar
  const camD = 6.2;
  const api = {
    g, PW, PH,
    topSpot: () => new THREE.Vector3(x, GAP - PH / 2 + .35, z - .5),        // feet y for the top panel's floor
    botSpot: () => new THREE.Vector3(x, -GAP - PH / 2 + .35, z - .5),
    cam: u => ({ p: [x, g.position.y, z + camD - u * .15], l: [x, g.position.y, z], fov: 58 }),   // straight on, the slightest drift in
    // t-driven layout: slam (panels fly in from above/below), hold with dot drift, crack, swap (panels trade places)
    set: (t, { slamT = 0, crackT = 1e9, swapT = 1e9 } = {}) => {
      const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
      const sl = cl((t - slamT) / .28); const ov = 1 + .18 * Math.sin(Math.min(1, sl) * Math.PI);  // overshoot
      let ty = (1 - sl) * 7 + GAP * ov, by = -(1 - sl) * 7 - GAP * ov;
      const sw = cl((t - swapT) / .5), e = sw * sw * (3 - 2 * sw);
      if (sw > 0) { ty = lerp2(GAP, -GAP, e); by = lerp2(-GAP, GAP, e); }   // the panels trade places (Dana's slides down, his up)
      top.position.y = ty; bot.position.y = by;
      top.children[0].material.map.offset.x = t * .015; bot.children[0].material.map.offset.x = -t * .015;  // dots drift
      crack.visible = t >= crackT; bar.position.y = 0;
      const shk = t >= crackT && t < crackT + .25 ? Math.sin(t * 70) * .05 * (1 - (t - crackT) / .25) : 0; bar.position.x = shk;
    },
  };
  const lerp2 = (a, b, k) => a + (b - a) * k;
  return api;
}

// ============================== SWAP POOF (white sparkle cloud) ==============================
// The town's swap effect: a burst of soft white puffs + tiny glitter sprites that spins up and fades over ~.8 s.
// Pure function of t (safe for out-of-order frames). spiral: puffs orbit while they rise (the mid-swap big one).
export function swapFX(scene) {
  const puffTex = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.55, 'rgba(255,255,255,.85)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const sparkTex = canvasTex(64, 64, (g, w, h) => { g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(32, 6); g.lineTo(32, 58); g.moveTo(6, 32); g.lineTo(58, 32); g.stroke(); });
  const root = new THREE.Group(); scene.add(root); const bursts = [];
  const poof = (t0, at, { size = 1, dur = .85, spiral = 0, n = 18 } = {}) => {
    const G = new THREE.Group(); G.visible = false; root.add(G); const parts = [];
    for (let i = 0; i < n; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false })); G.add(m);
      const a = i / n * Math.PI * 2 + Math.sin(i * 7.1), h = .15 + (i * .618 % 1) * 1.5 * size; parts.push({ m, a, d: .4 + (i * .37 % 1) * .8, h, s: (.3 + (i * .53 % 1) * .35) * size, k: 'p' }); }
    for (let i = 0; i < Math.round(n * .7); i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, color: '#fff6d8' })); G.add(m);
      const a = i * 2.39996, h = .3 + (i * .71 % 1) * 1.7 * size; parts.push({ m, a, d: .5 + (i * .29 % 1) * 1.1, h, s: .07 + (i * .41 % 1) * .06, k: 's' }); }
    bursts.push({ G, parts, t0, at, dur, spiral, size });
  };
  const update = t => { for (const b of bursts) { const u = (t - b.t0) / b.dur;
    if (u < 0 || u > 1) { b.G.visible = false; continue; }
    b.G.visible = true; const at = typeof b.at === 'function' ? b.at(t) : b.at; b.G.position.set(at[0], at[1], at[2]);
    const e = 1 - (1 - u) ** 3;
    for (const p of b.parts) { const ang = p.a + b.spiral * u * 6;
      p.m.position.set(Math.cos(ang) * p.d * e * b.size, p.h * e - .2 * u * u, Math.sin(ang) * p.d * e * b.size);
      const sc = p.k === 'p' ? p.s * (0.6 + .9 * e) : p.s * (1 - .3 * u); p.m.scale.set(sc, sc, 1);
      p.m.material.opacity = p.k === 'p' ? (u < .12 ? u / .12 : 1 - (u - .12) / .88) : Math.max(0, 1 - u * 1.3) * (.6 + .4 * Math.sin(t * 40 + p.a * 9));
      if (p.k === 's') p.m.material.rotation = ang * 2; } } };
  return { poof, update, root };
}
