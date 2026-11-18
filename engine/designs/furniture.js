// FURNITURE LIBRARY (2026-11-18): every piece the two houses use, built once, coloured by the house palette.
// Convention: floor at y 0, centred on x / z, FRONT toward +z (back against a wall at -z). Studio scale (real x ~1.4).
// Pulled models were all looked at from 4 sides first (inspect.html); simple-shaped modern pieces are modelled.
import * as THREE from 'three';
import { mat } from '../materials.js';
import { bbox, at, ph, cushion, drape, tableLamp } from '../build.js';
import { loadRbx } from '../rbxmodel.js';

// ---------- materials ----------
const C = new Map(), once = (k, f) => { if (!C.has(k)) C.set(k, f()); return C.get(k); };
export const M = {
  oak: () => once('oak', () => mat('laminate', { size: 1.6, clearcoat: .25 })),
  paleOak: () => once('poak', () => { const m = mat('laminate', { size: 1.6, clearcoat: .25 }); m.color.set('#fff3e6'); return m; }),
  walnut: () => once('walnut', () => { const m = mat('laminate', { size: 1.6, clearcoat: .3 }); m.color.set('#8d6247'); return m; }),
  paint: c => once('p' + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: .5, clearcoat: .15, clearcoatRoughness: .5 })),
  matte: c => once('m' + c, () => new THREE.MeshStandardMaterial({ color: c, roughness: .8 })),
  metal: c => once('mt' + c, () => new THREE.MeshStandardMaterial({ color: c, metalness: .7, roughness: .35 })),
  black: () => once('blk', () => new THREE.MeshStandardMaterial({ color: '#1d1d1f', metalness: .55, roughness: .45 })),
  brass: () => once('brass', () => new THREE.MeshStandardMaterial({ color: '#c9a25e', metalness: .85, roughness: .3 })),
  steel: () => once('steel', () => new THREE.MeshStandardMaterial({ color: '#c9ccd0', metalness: .75, roughness: .32 })),
  ceramic: () => once('cer', () => new THREE.MeshPhysicalMaterial({ color: '#f6f5f2', roughness: .2, clearcoat: .8, clearcoatRoughness: .1 })),
  quartz: c => once('q' + c, () => new THREE.MeshPhysicalMaterial({ color: c, roughness: .25, clearcoat: .6, clearcoatRoughness: .15 })),
  glass: () => once('glass', () => new THREE.MeshPhysicalMaterial({ color: '#e8f0f2', roughness: .04, transparent: true, opacity: .18, depthWrite: false })),
  mirror: () => once('mirror', () => new THREE.MeshStandardMaterial({ color: '#dfe6ea', metalness: 1, roughness: .04 })),
  screen: () => once('scr', () => new THREE.MeshPhysicalMaterial({ color: '#07080a', roughness: .08, clearcoat: 1 })),
  boucle: c => once('bo' + c, () => mat('boucle', { color: c, sheen: .5 })),
  linen: c => once('li' + c, () => mat('linen', { color: c, sheen: .3 })),
  velvet: c => once('ve' + c, () => mat('velvet', { color: c, sheen: .8, sheenColor: '#ffffff' })),
  knit: c => once('kn' + c, () => mat('knit', { color: c, size: .42, normal: 1.1, sheen: .8, sheenColor: '#fff4e2', sheenRough: .5 })),
  cotton: c => once('co' + c, () => mat('linen', { color: c, size: .3, normal: .6, sheen: .3 })),   // fine-weave cotton (the denim scan read as checks on bedding)
  jute: c => once('ju' + c, () => mat('jute', { color: c })),
  glow: c => once('gl' + c, () => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(2.2), toneMapped: false })),
};
const grp = (...a) => { const g = new THREE.Group(); a.forEach(o => g.add(o)); return g; };
const B = (w, h, d, m, x = 0, y = 0, z = 0, r = .012) => at(bbox(w, h, d, m, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), x, y, z);
const cyl = (r0, r1, h, m, x = 0, y = 0, z = 0, seg = 20) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); c.position.set(x, y, z); return c; };
const tube = (pts, r, m) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 60, r, 10), m);
const shadow = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = !m.material.transparent; m.receiveShadow = true; } }); return o; };
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };

// ---------- living ----------
export const sofa = async ({ seat, frame, pillow, len = 2.9 }) => loadRbx(17203147978, { yaw: -Math.PI / 2, scale: len / 3.931,
  paint: { '635f62': seat, '474446': frame, '111111': pillow, a3a2a5: M.black() } });   // clean modern sofa (inspected: cushions / frame / pillows / tag are separate)
export const loungeChair = async (cushionMat) => ph('modern_arm_chair_01', { scale: 1.45, swap: { modern_arm_chair_01_pillow: cushionMat } });
export function coffeeTable({ wood, w = 1.7, d = .85, round = false }) {
  if (round) { const t = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, .06, 48), wood); t.position.y = .52; return shadow(grp(t, cyl(w / 2 - .12, w / 2 - .06, .46, wood, 0, .23, 0, 40))); }
  const g = grp(B(w, .06, d, wood, 0, .52, 0, .025), B(w - .2, .05, d - .17, wood, 0, .17, 0));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(cyl(.03, .022, .49, wood, x * (w / 2 - .06), .245, z * (d / 2 - .09), 16));
  return shadow(g);
}
export const rug = (m, w, d, edge = '#8d7558', round = false) => round ? shadow(grp(cyl(w / 2, w / 2, .012, m, 0, .006, 0, 64), cyl(w / 2 + .03, w / 2 + .03, .01, M.matte(edge), 0, .005, 0, 64)))
  : shadow(grp(B(w, .012, d, m, 0, .006, 0, .006), B(w + .06, .01, d + .06, M.matte(edge), 0, .005, 0, .005)));
export function arcLamp() {
  const g = new THREE.Group(), reach = 2.1, top = 2.75;
  g.add(cyl(.24, .26, .05, mat('concrete', { color: '#e9e5de', size: .6, rough: .35 }), 0, .025, 0, 40));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CubicBezierCurve3(new THREE.Vector3(0, .05, 0), new THREE.Vector3(0, top * .95, 0), new THREE.Vector3(reach * .55, top * 1.08, 0), new THREE.Vector3(reach, top * .82, 0)), 80, .016, 10), M.black()));
  const sh = cyl(.2, .26, .3, M.linen('#efe6d6'), reach, top * .82 - .2, 0, 40); sh.geometry = new THREE.CylinderGeometry(.2, .26, .3, 40, 1, true); sh.material = sh.material.clone(); sh.material.side = THREE.DoubleSide; g.add(sh);
  return shadow(g);
}
export const tvConsole = async () => ph('modern_wooden_cabinet', { scale: .98 });   // 2.4 m wide (at 1.45 it was 3.5 m)
export function tv(w = 2.0) {
  const h = w * .585, g = grp(B(w, h, .045, M.matte('#141416'), 0, h / 2 + .06, 0, .008));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(w - .03, h - .03), M.screen()); s.position.set(0, h / 2 + .06, .0235); g.add(s);
  for (const x of [-w * .4, w * .4]) g.add(B(.05, .07, .28, M.black(), x, .035, 0, .01));
  return shadow(g);
}
export const plant = async (pot, which = 'potted_plant_01') => ph(which, { scale: 1.45, swap: pot ? { [which + '_pot']: pot } : null });
export const pillows = async (m) => ph('throw_pillows_01', { scale: 1.45, swap: { throw_pillows_01: m } });
export function art(colors, w = 1.2, h = 1.6, seed = 0) {
  const t = canvasTex(600, Math.round(600 * h / w), (x, W, H) => {
    x.fillStyle = colors[0]; x.fillRect(0, 0, W, H);
    if (seed % 3 === 0) { x.fillStyle = colors[1]; x.beginPath(); x.arc(W / 2, H * .42, W * .28, 0, 7); x.fill(); x.fillStyle = colors[2]; x.fillRect(0, H * .65, W, H * .35); x.fillStyle = colors[3] || colors[1]; x.fillRect(0, H * .76, W, H * .24); }
    else if (seed % 3 === 1) { for (let i = 0; i < 4; i++) { x.fillStyle = colors[1 + (i % 3)] || colors[1]; x.beginPath(); x.ellipse(W * (.25 + .17 * i), H * (.3 + .13 * i), W * .2, H * .12, i, 0, 7); x.fill(); } }
    else { x.fillStyle = colors[1]; x.fillRect(W * .12, H * .1, W * .76, H * .5); x.fillStyle = colors[2]; x.fillRect(W * .12, H * .62, W * .34, H * .28); x.fillStyle = colors[3] || colors[1]; x.fillRect(W * .5, H * .62, W * .38, H * .28); } });
  const g = grp(B(w, h, .04, M.black(), 0, h / 2, 0, .004)), p = new THREE.Mesh(new THREE.PlaneGeometry(w - .1, h - .1), new THREE.MeshStandardMaterial({ map: t, roughness: .9 })); p.position.set(0, h / 2, .021); g.add(p);
  return shadow(g);
}
export const pendant = async (scale = 1.2) => { const o = await ph('modern_ceiling_lamp_01', { scale }); return o; };   // globe pendant (Poly Haven), OFF in daylight

// ---------- bedroom ----------
export function bed({ w = 1.9, l = 3.1, top = .82, frame, head, duvet, sheet, pillow, accent, headH = 1.4 }) {
  const g = new THREE.Group(), baseH = top - .28;
  g.add(B(w + .1, baseH - .1, l + .04, frame, 0, .1 + (baseH - .1) / 2, .02, .03));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(B(.08, .1, .08, M.black(), x * (w / 2 - .05), .05, z * (l / 2 - .05) + .02, .01));
  g.add(at(cushion(w, .28, l, sheet, { puff: .3, seam: .8 }), 0, baseH + .14, 0));
  const hb = cushion(w + .18, .16, headH, head, { puff: .5, seam: .6 }); hb.rotation.x = Math.PI / 2; hb.position.set(0, headH / 2 + .05, -l / 2 - .08); g.add(hb);
  const dd = l * .7, dv = drape({ w: w - .02, d: dd, top, hang: .3, mat: duvet, thick: .05, waves: .012 }); dv.position.set(0, 0, l / 2 - dd / 2 - .02); g.add(dv);
  g.add(at(cushion(w + .02, .07, .32, sheet, { puff: .6, seam: .5 }), 0, top + .06, l / 2 - dd - .02 + .16));   // the turned-down sheet
  const n = w > 1.5 ? 2 : 1;
  for (let i = 0; i < n; i++) { const p = cushion(.74, .2, .46, pillow, { puff: 1.2, seam: .35 }); p.rotation.x = -1.15; p.position.set(n === 1 ? 0 : (i - .5) * (w / 2), top + .25, -l / 2 + .2); g.add(p); }
  if (accent) { const a = cushion(.5, .14, .4, accent, { puff: 1.1, seam: .4 }); a.rotation.x = -1.2; a.position.set(0, top + .2, -l / 2 + .45); g.add(a); }
  return shadow(g);
}
export function nightstand(wood, handle = M.brass()) { const h = .78; return shadow(grp(B(.75, h - .06, .6, wood, 0, .06 + (h - .06) / 2, 0, .015), B(.69, .01, .01, M.black(), 0, h * .55, .301, .002), B(.16, .02, .03, handle, 0, h * .72, .31, .005), ...[-1, 1].map(s => B(.04, .06, .04, M.black(), s * .32, .03, 0, .005)))); }
export function wardrobe({ w = 2.2, h = 2.9, d = .75, body, handle = M.black() }) {
  const g = grp(B(w, h - .08, d, body, 0, .08 + (h - .08) / 2, 0, .01), B(w - .04, .08, d - .06, M.black(), 0, .04, -.02)), n = Math.max(2, Math.round(w / .75));
  for (let i = 1; i < n; i++) g.add(B(.008, h - .2, .004, M.matte('#1a1a1a'), -w / 2 + i * w / n, h / 2 + .04, d / 2 + .002, .001));
  for (let i = 0; i < n; i++) { const x = -w / 2 + (i + .5) * w / n + (i % 2 ? -1 : 1) * (w / n / 2 - .09); g.add(B(.025, .55, .03, handle, x, 1.5, d / 2 + .02, .008)); }
  return shadow(g);
}
export function dresser({ w = 1.6, h = 1.1, d = .65, body, handle = M.brass() }) {
  const g = grp(B(w, h - .12, d, body, 0, .12 + (h - .12) / 2, 0, .012)); for (const s of [-1, 1]) g.add(B(.05, .12, .05, M.black(), s * (w / 2 - .08), .06, 0, .008));
  for (let i = 1; i < 3; i++) g.add(B(w - .04, .008, .004, M.matte('#2a2a2a'), 0, .12 + i * (h - .12) / 3, d / 2 + .002, .001));
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) g.add(B(.18, .022, .03, handle, s * w / 4, .12 + (i + .5) * (h - .12) / 3, d / 2 + .02, .006));
  return shadow(g);
}
export function desk({ w = 1.9, d = .85, top, legs = M.black(), drawer = true }) {
  const h = 1.02, g = grp(B(w, .05, d, top, 0, h - .025, 0, .01));
  for (const s of [-1, 1]) g.add(B(.05, h - .05, d - .08, legs, s * (w / 2 - .06), (h - .05) / 2, 0, .006));
  if (drawer) g.add(B(.6, .14, d - .1, top, w / 2 - .4, h - .12, 0, .006));
  return shadow(g);
}
export function monitor(w = 1.0) { const h = w * .58, g = grp(B(w, h, .03, M.matte('#141416'), 0, .28 + h / 2, 0, .006), B(.06, .3, .04, M.black(), 0, .15, -.04), B(.3, .02, .22, M.black(), 0, .01, -.02));
  const s = new THREE.Mesh(new THREE.PlaneGeometry(w - .03, h - .03), new THREE.MeshBasicMaterial({ map: canvasTex(320, 186, (x, W, H) => { const gr = x.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#1d2b4a'); gr.addColorStop(1, '#3d1d4a'); x.fillStyle = gr; x.fillRect(0, 0, W, H); x.fillStyle = '#7fc2ff'; x.fillRect(W * .08, H * .7, W * .5, H * .06); }) }));
  s.position.set(0, .28 + h / 2, .016); g.add(s); return shadow(g); }
export function ledStrip(w, c) { return grp(B(w, .012, .012, M.glow(c), 0, 0, 0, .004)); }
export function shelf({ w = 1.4, body, books = true }) { const g = grp(B(w, .05, .32, body, 0, 0, 0, .008));
  if (books) { let x = -w / 2 + .08; const cols = ['#7a4a3a', '#c9b48a', '#3d4f5c', '#e8e0d0', '#6f7b4f', '#b9785a']; let i = 0; while (x < w / 2 - .3) { const bw = .04 + (i * 7 % 5) * .008, bh = .26 + (i * 13 % 7) * .02; g.add(B(bw, bh, .24, M.matte(cols[i % cols.length]), x + bw / 2, .025 + bh / 2, 0, .003)); x += bw + .004; i++; } }
  return shadow(g); }
export function bookcase({ w = 1.3, h = 2.6, d = .45, body }) { const g = grp(), n = 5;
  for (const s of [-1, 1]) g.add(B(.04, h, d, body, s * (w / 2 - .02), h / 2, 0, .004)); g.add(B(w, .04, d, body, 0, h - .02, 0, .004)); g.add(B(w - .04, h, .02, body, 0, h / 2, -d / 2 + .01, .002));
  for (let i = 0; i < n; i++) { const sh = shelf({ w: w - .08, body, books: i % 2 === 0 || i === 3 }); sh.position.y = .06 + i * (h - .1) / n; g.add(sh); } return shadow(g); }
export const officeChair = async () => loadRbx(131726966724793, { yaw: 0, scale: 1.0, paint: { '*': { color: '#3a3b3f', kind: 'Fabric' } } });
export const gamingChair = async (c = '#22324a') => loadRbx(9435226454, { yaw: -Math.PI / 2, scale: .85, paint: { f8f8f8: { color: c, kind: 'Fabric' } } });
// hanging egg chair, modelled (the store ones were faceted low-poly): woven rattan shell (a lathe, open at the front), a round
// cushion inside, hung by a chain from a curved black stand
export function eggChair(shellMat, cushionMat) {
  const g = new THREE.Group(), pts = []; for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI; pts.push(new THREE.Vector2(Math.sin(a) * .55 * (1 - .15 * Math.cos(a)), -Math.cos(a) * .7)); }
  const shell = new THREE.Mesh(new THREE.LatheGeometry(pts, 40, Math.PI * .35, Math.PI * 1.3), shellMat); shell.material = shellMat; shell.material.side = THREE.DoubleSide; shell.position.y = 1.15;   // the lathe's open side faces +z (into the room) g.add(shell);
  g.add(at(cushion(.8, .14, .7, cushionMat, { puff: 1, seam: .5 }), 0, .62, .05));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CubicBezierCurve3(new THREE.Vector3(0, .02, -.75), new THREE.Vector3(0, 2.5, -1.1), new THREE.Vector3(0, 2.9, -.2), new THREE.Vector3(0, 2.4, 0)), 60, .03, 10), M.black()));
  g.add(cyl(.45, .45, .04, M.black(), 0, .02, -.75, 32), cyl(.008, .008, .5, M.black(), 0, 2.13, 0, 6));
  return shadow(g); }
export function poster(colors, title = '', w = .9, h = 1.25, seed = 1) { const t = canvasTex(360, 500, (x, W, H) => { const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1]); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = colors[2]; x.beginPath(); if (seed % 2) { x.moveTo(W * .5, H * .18); x.lineTo(W * .85, H * .7); x.lineTo(W * .15, H * .7); } else x.arc(W * .5, H * .42, W * .26, 0, 7); x.fill();
    if (title) { x.fillStyle = '#ffffff'; let fs = 46; x.font = `bold ${fs}px sans-serif`; while (x.measureText(title).width > W * .8) { fs -= 2; x.font = `bold ${fs}px sans-serif`; } x.textAlign = 'center'; x.fillText(title, W / 2, H * .88); } });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: .7 })); p.position.y = h / 2; return grp(p); }
export function neonHeart(c = '#ff7fb6', s = .5) { const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60 * Math.PI * 2; pts.push([s * .5 * 16 * Math.sin(t) ** 3 / 16, s * .5 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16 + s * .5, 0]); }
  return grp(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), true), 120, .016, 8, true), M.glow(c)), B(s * 1.1, s * 1.1, .01, M.glass(), 0, s * .45, -.02, .01)); }
export function fairyLights(w, sag = .25, n = 22, c = '#ffd9a0') { const g = new THREE.Group(), m = M.glow(c), wire = M.matte('#2a2a2a'), pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n, x = -w / 2 + u * w, y = -sag * 4 * u * (1 - u); pts.push([x, y, 0]); if (i > 0 && i < n) g.add(at(new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), m), x, y - .025, 0)); }
  g.add(tube(pts, .004, wire)); return g; }
export function ringLight() { return shadow(grp(new THREE.Mesh(new THREE.TorusGeometry(.22, .022, 10, 48), M.glow('#fff6ea')), cyl(.012, .012, 1.4, M.black(), 0, -.75, 0, 8), cyl(.16, .18, .03, M.black(), 0, -1.46, 0, 24))).translateY(1.48); }
export const tableLampW = (base, shade) => tableLamp({ baseMat: base, shadeMat: shade });
export function toyBox(c) { return shadow(grp(B(.9, .5, .55, M.paint(c), 0, .25, 0, .04), B(.94, .06, .58, M.paint('#f2efe8'), 0, .53, 0, .03))); }
export function beanBag(m) { return shadow(at(cushion(1.0, .6, 1.0, m, { puff: 1.6, seam: .3, seg: 20 }), 0, .3, 0)); }

// ---------- kitchen / dining ----------
// a run of base cabinets with a counter (len along x, back at -z). opts.sink = x of the sink, opts.range = x of the range slot
export async function kitchenRun({ len, cab, counter, handle = M.black(), sink = null, range = null, uppers = null, shelves = null, wallH = 4.08 }) {
  const g = new THREE.Group(), d = .9, h = 1.02, ct = .05, plinth = .12, sw = 1.0, rw = 1.05;
  const gaps = []; if (sink != null) gaps.push([sink - sw / 2, sink + sw / 2, 'sink']); if (range != null) gaps.push([range - rw / 2, range + rw / 2, 'range']);
  // cabinet bodies + doors in 0.6-ish modules, skipping the range slot
  const segs = []; let x = -len / 2; for (const [a, b, k] of gaps.sort((p, q) => p[0] - q[0])) { if (a > x) segs.push([x, a]); if (k === 'sink') segs.push([a, b]); x = b; } if (x < len / 2) segs.push([x, len / 2]);
  for (const [a, b] of segs) { const w = b - a; g.add(B(w, h - ct - plinth, d - .05, cab, (a + b) / 2, plinth + (h - ct - plinth) / 2, -.025, .006)); g.add(B(w, plinth, d - .12, M.matte('#222'), (a + b) / 2, plinth / 2, -.08, .004));
    const n = Math.max(1, Math.round(w / .62)); for (let i = 1; i < n; i++) g.add(B(.006, h - ct - plinth - .02, .004, M.matte('#1a1a1a'), a + i * w / n, plinth + (h - ct - plinth) / 2, d / 2 - .049, .001));
    g.add(B(w - .02, .006, .004, M.matte('#1a1a1a'), (a + b) / 2, h - ct - .2, d / 2 - .049, .001));
    for (let i = 0; i < n; i++) g.add(B(.32, .02, .03, handle, a + (i + .5) * w / n, h - ct - .1, d / 2 - .03, .006)); }
  // counter, in pieces round the sink hole
  const cs = []; x = -len / 2; for (const [a, b, k] of gaps) { if (k !== 'sink') continue; cs.push([x, a]); x = b; } cs.push([x, len / 2]);
  for (const [a, b] of cs) { const segsR = range == null ? [[a, b]] : [[a, Math.min(b, range - rw / 2)], [Math.max(a, range + rw / 2), b]]; for (const [p, q] of segsR) if (q - p > .01) g.add(B(q - p, ct, d + .03, counter, (p + q) / 2, h - ct / 2, -.01, .006)); }
  if (sink != null) { const s0 = sink - sw / 2 + .06, s1 = sink + sw / 2 - .06, bz0 = -d / 2 + .12, bz1 = d / 2 - .1;
    g.add(B(sw, ct, .12, counter, sink, h - ct / 2, -d / 2 + .05, .004), B(sw, ct, .1, counter, sink, h - ct / 2, d / 2 - .04, .004), B(.06, ct, d - .22, counter, s0 - .03, h - ct / 2, .01, .003), B(.06, ct, d - .22, counter, s1 + .03, h - ct / 2, .01, .003));
    const st = M.steel(); g.add(B(s1 - s0, .02, bz1 - bz0, st, sink, h - .26, (bz0 + bz1) / 2, .004)); for (const [w2, d2, xx, zz] of [[s1 - s0, .02, sink, bz0], [s1 - s0, .02, sink, bz1], [.02, bz1 - bz0, s0, (bz0 + bz1) / 2], [.02, bz1 - bz0, s1, (bz0 + bz1) / 2]]) g.add(B(w2, .25, d2, st, xx, h - .135, zz, .003));
    g.add(faucet(handle === M.brass() ? M.brass() : M.black(), sink, h, -d / 2 + .08)); }
  if (range != null) { const r = await loadRbx(132650402034566, { yaw: -Math.PI / 2, scale: .885 }); const b = new THREE.Box3().setFromObject(r); r.position.set(range - (b.min.x + b.max.x) / 2, -b.min.y, -d / 2 - b.min.z + .02); g.add(r); }
  if (uppers) { const uh = 1.05, y0 = 2.1; for (const [a, b] of [[-len / 2, range != null ? range - rw / 2 - .05 : len / 2], ...(range != null ? [[range + rw / 2 + .05, len / 2]] : [])]) { if (b - a < .3) continue; g.add(B(b - a, uh, .45, uppers, (a + b) / 2, y0 + uh / 2, -d / 2 + .225, .006)); const n = Math.max(1, Math.round((b - a) / .62)); for (let i = 1; i < n; i++) g.add(B(.006, uh - .02, .004, M.matte('#1a1a1a'), a + i * (b - a) / n, y0 + uh / 2, -d / 2 + .451, .001)); for (let i = 0; i < n; i++) g.add(B(.02, .2, .03, handle, a + (i + .5) * (b - a) / n + .18, y0 + .14, -d / 2 + .47, .006)); } }
  if (shelves) for (const y of [2.05, 2.75]) for (const [a, b] of [[-len / 2 + .1, range != null ? range - rw / 2 - .15 : len / 2 - .1], ...(range != null ? [[range + rw / 2 + .15, len / 2 - .1]] : [])]) { if (b - a < .4) continue; const s = shelf({ w: b - a, body: shelves, books: false }); s.position.set((a + b) / 2, y, -d / 2 + .17); g.add(s);
    for (let i = 0; i < Math.floor((b - a) / .3); i++) g.add(i % 3 === 2 ? cyl(.09, .07, .22, M.ceramic(), a + .2 + i * .3, y + .135, -d / 2 + .17) : B(.22, .03 + (i % 2) * .05, .22, M.ceramic(), a + .2 + i * .3, y + .04 + (i % 2) * .025, -d / 2 + .17, .01)); }
  if (range != null) g.add(hood(range, -d / 2, wallH));
  return shadow(g);
}
function faucet(m, x, y, z) { return shadow(grp(cyl(.025, .03, .05, m, x, y + .025, z), tube([[0, 0, 0], [0, .42, 0], [0, .55, .08], [0, .5, .22], [0, .38, .25]].map(([a, b, c]) => [x + a, y + b, z + c]), .016, m))); }
function hood(x, z, H) { const g = new THREE.Group(), m = M.black(); const geo = new THREE.CylinderGeometry(.22, .62, .45, 4, 1); geo.rotateY(Math.PI / 4); geo.scale(1, 1, .75); const h = new THREE.Mesh(geo, m); h.position.set(x, 2.35, z + .4); g.add(h); g.add(B(.36, H - 2.58, .3, m, x, 2.58 + (H - 2.58) / 2, z + .2, .004)); return g; }
export function island({ len = 2.6, d = 1.15, cab, counter, handle = M.black() }) { const h = 1.02, g = grp(B(len - .2, h - .05 - .12, d - .35, cab, 0, .12 + (h - .17) / 2, -.17, .006), B(len - .3, .12, d - .45, M.matte('#222'), 0, .06, -.17), B(len, .05, d, counter, 0, h - .025, 0, .008));
  for (const s of [-1, 1]) g.add(B(.05, h - .05, d, counter, s * (len / 2 - .025), (h - .05) / 2, 0, .004));   // waterfall ends
  const n = Math.round((len - .2) / .62); for (let i = 0; i < n; i++) g.add(B(.32, .02, .03, handle, -len / 2 + .1 + (i + .5) * (len - .2) / n, h - .15, -.17 - (d - .35) / 2 - .03, .006));
  return shadow(g); }   // seating side = +z (overhang)
export function stool(seat, legs = M.black()) { const sh = .92, g = grp(at(cushion(.46, .07, .46, seat, { puff: .6, seam: .6 }), 0, sh, 0), B(.36, .3, .04, seat, 0, sh + .2, -.2, .02));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = cyl(.016, .016, sh, legs, x * .16, sh / 2, z * .16, 8); l.rotation.set(z * .06, 0, -x * .06); g.add(l); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.19, .01, 6, 24), legs); ring.rotation.x = Math.PI / 2; ring.position.y = .32; g.add(ring); return shadow(g); }
export const fridge = async () => { const o = await loadRbx(995603100, { yaw: -Math.PI / 2, scale: 2.55 / 3.961, paint: { f5cd30: M.steel(), f8f8f8: M.steel(), f2f3f3: M.steel() } }); return o; };
export const microwave = async () => loadRbx(9587284235, { scale: .7 });
export function diningTable({ w = 2.5, d = 1.25, wood, round = false }) { const h = .88;
  if (round) return shadow(grp(cyl(w / 2, w / 2, .05, wood, 0, h - .025, 0, 48), cyl(.12, .14, h - .1, wood, 0, (h - .05) / 2, 0, 24), cyl(.45, .5, .05, wood, 0, .025, 0, 32)));
  const g = grp(B(w, .05, d, wood, 0, h - .025, 0, .015)); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(cyl(.035, .025, h - .05, wood, x * (w / 2 - .12), (h - .05) / 2, z * (d / 2 - .12), 16)); return shadow(g); }
export function diningChair({ wood, seat }) { const sh = .68, g = grp(at(cushion(.6, .07, .58, seat, { puff: .5, seam: .6 }), 0, sh, 0));
  for (const [x, z] of [[-1, 1], [1, 1]]) g.add(cyl(.02, .016, sh, wood, x * .25, sh / 2, z * .24, 10));
  for (const x of [-1, 1]) { const l = cyl(.02, .016, sh + .62, wood, x * .25, (sh + .62) / 2, -.26, 10); l.rotation.x = -.06; g.add(l); }
  const back = B(.56, .14, .03, wood, 0, sh + .55, -.28, .012); back.rotation.x = -.1; g.add(back); return shadow(g); }   // modern wishbone-style chair
export function bench({ w = 1.8, seat, wood }) { return shadow(grp(at(cushion(w, .1, .5, seat, { puff: .5, seam: .6 }), 0, .56, 0), B(w, .46, .48, wood, 0, .23, 0, .01))); }

// ---------- bathroom / laundry ----------
export const toilet = async () => loadRbx(2091145711, { scale: .75, paint: { f8f8f8: M.ceramic(), e7e7ec: M.ceramic(), '90929c': M.ceramic() } });
export function vanity({ w = 1.3, body, top, sinkMat = M.ceramic(), tap = M.black() }) { const h = 1.12, g = grp(B(w, .55, .6, body, 0, h - .05 - .275, 0, .01), B(w + .02, .05, .62, top, 0, h - .025, 0, .006));
  g.add(B(w - .1, .006, .004, M.matte('#1a1a1a'), 0, h - .3, .301, .001)); for (const s of [-1, 1]) g.add(B(.2, .02, .03, tap, s * w / 4, h - .2, .32, .006));
  const bowl = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.2, 0], [.23, .04], [.25, .14], [.24, .15], [.21, .03], [0, .03]].map(([x, y]) => new THREE.Vector2(x, y)), 40), sinkMat); bowl.position.set(0, h, .02); g.add(bowl);
  g.add(tube([[0, 0, 0], [0, .36, 0], [0, .4, .12], [0, .34, .18]].map(([a, b, c]) => [a, h + b, -.22 + c]), .014, tap)); return shadow(g); }
export function mirror({ w = .9, h = 1.1, frame = M.black(), round = false, arch = false }) { const g = new THREE.Group();
  if (round) { const m = new THREE.Mesh(new THREE.CircleGeometry(w / 2, 48), M.mirror()); m.position.set(0, w / 2, .012); const f = new THREE.Mesh(new THREE.TorusGeometry(w / 2, .025, 10, 48), frame); f.position.y = w / 2; g.add(m, f); }
  else if (arch) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h - w / 2); s.absarc(0, h - w / 2, w / 2, 0, Math.PI, false); s.closePath(); const f = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .03, bevelEnabled: false }), frame); f.scale.set(1.06, 1.04, 1); f.position.x = 0; const m = new THREE.Mesh(new THREE.ShapeGeometry(s), M.mirror()); m.position.z = .035; g.add(f, m); }
  else { g.add(B(w, h, .03, frame, 0, h / 2, 0, .004)); const m = new THREE.Mesh(new THREE.PlaneGeometry(w - .06, h - .06), M.mirror()); m.position.set(0, h / 2, .016); g.add(m); }
  return shadow(g); }
// walk-in shower in a corner: tiled tray, one fixed glass panel with a black frame, rain head + mixer on the back wall
export function shower({ w = 1.5, d = 1.5, tile, metal = M.black() }) { const H = 2.9, g = grp(B(w, .06, d, tile, 0, .03, 0, .01));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(d * .8, H - .1), M.glass()); glass.rotation.y = Math.PI / 2; glass.position.set(w / 2, H / 2 + .05, d * .1); g.add(glass);
  g.add(B(.03, H, .03, metal, w / 2, H / 2, d * .1 - d * .4, .004), B(.03, .03, d * .8, metal, w / 2, H, d * .1, .004));
  g.add(cyl(.18, .18, .02, metal, 0, H - .1, -d / 2 + .35, 32), B(.02, .02, .35, metal, 0, H - .05, -d / 2 + .175, .004), cyl(.06, .06, .03, metal, 0, 1.4, -d / 2 + .015, 24));
  g.children.at(-1).rotation.x = Math.PI / 2; return shadow(g); }
export function towelBar(towel, w = .7) { const g = grp(B(w, .02, .02, M.black(), 0, 0, .06, .008), B(.02, .04, .06, M.black(), -w / 2, 0, .03, .005), B(.02, .04, .06, M.black(), w / 2, 0, .03, .005)); g.add(at(cushion(w * .7, .05, .6, towel, { puff: .4, seam: .7 }), 0, -.28, .08)); g.children.at(-1).rotation.x = Math.PI / 2; return shadow(g); }
export const washer = async () => loadRbx(2106113027, { scale: .62, paint: { f8f8f8: M.ceramic(), f9f9f9: M.ceramic(), f4f3f3: M.ceramic(), edeaea: M.ceramic(), d5d3d3: M.ceramic(), cdcdcd: M.ceramic(), '3f3c3e': M.matte('#444') } });
export function basket(m) { return shadow(grp(cyl(.26, .22, .45, m, 0, .225, 0, 24))); }

// ---------- garage / basement / attic ----------
// drop the flat ground quad some scans include (triangles lying at the model's floor, wider than the model's footprint)
function stripGround(o) { o.traverse(m => { if (!m.isMesh) return; const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry, P = g.attributes.position, keep = [];
  let y0 = Infinity; for (let i = 0; i < P.count; i++) y0 = Math.min(y0, P.getY(i));
  for (let t = 0; t < P.count; t += 3) { let flat = true, far = false; for (let k = 0; k < 3; k++) { if (Math.abs(P.getY(t + k) - y0) > .003) flat = false; if (Math.hypot(P.getX(t + k), P.getZ(t + k)) > .8) far = true; } if (!(flat && far)) keep.push(t); }
  const ng = new THREE.BufferGeometry(); for (const [k, a] of Object.entries(g.attributes)) { const arr = new a.array.constructor(keep.length * 3 * a.itemSize); keep.forEach((t, i) => { for (let v = 0; v < 3; v++) for (let c = 0; c < a.itemSize; c++) arr[(i * 3 + v) * a.itemSize + c] = a.array[(t + v) * a.itemSize + c]; }); ng.setAttribute(k, new THREE.BufferAttribute(arr, a.itemSize)); }
  m.geometry = ng; }); return o; }
export const car = async () => loadRbx(133877355439325, { scale: 1.0 });
export const steelShelves = async () => ph('steel_frame_shelves_01', { scale: .13 });   // this scan is in decimetres: .13 -> 1.43 m wide, 2.8 m tall
export const box = async (s = 1.45) => ph('cardboard_box_01', { scale: s });
export const toolChest = async () => ph('metal_tool_chest', { scale: 1.45 });
export const rockingChair = async () => ph('Rockingchair_01', { scale: 1.45 });
export const oldCabinet = async () => ph('vintage_cabinet_01', { scale: 1.3 });
export const oldTable = async () => ph('round_wooden_table_01', { scale: 1.3 });
export function workbench(wood) { const g = grp(B(2.4, .07, .9, wood, 0, 1.0, 0, .01), B(2.3, .04, .8, wood, 0, .3, 0, .006)); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(B(.08, 1.0, .08, wood, x * 1.12, .5, z * .38, .006));
  g.add(B(2.4, 1.2, .03, M.matte('#c9b48a'), 0, 1.65, -.44, .004)); for (let i = 0; i < 8; i++) g.add(B(.03, .3 + (i % 3) * .08, .03, M.metal('#888'), -1 + i * .28, 1.7, -.41, .004)); return shadow(g); }
export function waterHeater() { return shadow(grp(cyl(.36, .36, 1.9, M.paint('#e9e7e2'), 0, .95, 0, 32), cyl(.37, .37, .05, M.metal('#999'), 0, 1.92, 0, 32), cyl(.04, .04, 2.2, M.metal('#b87333'), .2, 3.0, 0, 10), cyl(.04, .04, 2.2, M.metal('#b87333'), -.2, 3.0, 0, 10))); }
export function furnaceUnit() { return shadow(grp(B(.9, 1.9, 1.0, M.paint('#d8d6d0'), 0, .95, 0, .01), B(.5, .6, .5, M.metal('#aaa'), 0, 2.2, 0, .01), B(.3, 1.6, .3, M.metal('#aaa'), 0, 3.2, -.2, .01), B(.6, .3, .01, M.matte('#555'), 0, .5, .505, .003))); }
export function bulb() { const g = grp(cyl(.004, .004, 1.0, M.matte('#222'), 0, -.5, 0, 6), cyl(.025, .025, .06, M.metal('#777'), 0, -1.03, 0, 12)); g.add(at(new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), new THREE.MeshStandardMaterial({ color: '#f4efe4', roughness: .2 })), 0, -1.09, 0)); return g; }
export function trunk(wood) { const g = grp(B(1.3, .6, .7, wood, 0, .3, 0, .02), B(1.32, .18, .72, wood, 0, .69, 0, .05)); for (const x of [-.45, .45]) g.add(B(.06, .8, .74, M.brass(), x, .4, 0, .01)); g.add(B(.16, .12, .03, M.brass(), 0, .6, .37, .01)); return shadow(g); }
export function dressForm() { const g = grp(cyl(.02, .02, 1.3, M.walnut(), 0, .65, 0, 10), cyl(.25, .28, .04, M.walnut(), 0, .02, 0, 24));
  const t = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.2, 0], [.24, .2], [.18, .45], [.22, .7], [.2, .82], [.08, .9], [.05, .98], [0, 1]].map(([x, y]) => new THREE.Vector2(x, y)), 32), M.linen('#d8c8b0')); t.scale.z = .7; t.position.y = 1.25; g.add(t); return shadow(g); }
// a dust sheet thrown over an old armchair: cloth over a chair-shaped mound
export function sheetCovered(m) { const g = new THREE.Group(); const d = drape({ w: 1.0, d: 1.0, top: .5, hang: .55, mat: m, thick: .02, waves: .03, under: (x, z) => { const back = z < -.25 ? 1.15 : 0, arm = Math.abs(x) > .38 ? .75 : 0; return Math.max(.5, back, arm); } }); d.position.set(0, 0, -.28); g.add(d); return shadow(g); }
export function poolTable(wood) { const g = grp(B(2.9, .25, 1.6, wood, 0, .95, 0, .04), B(2.6, .05, 1.3, mat('velvet', { color: '#2f6b4f' }), 0, 1.08, 0, .005)); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(B(.16, .85, .16, wood, x * 1.25, .42, z * .65, .02));
  for (const [x, z] of [[-1.3, -.65], [0, -.66], [1.3, -.65], [-1.3, .65], [0, .66], [1.3, .65]]) g.add(cyl(.05, .05, .02, M.matte('#111'), x, 1.1, z, 12)); return shadow(g); }
export function barFridge() { return shadow(grp(B(.8, 1.15, .8, M.matte('#2a2a2c'), 0, .575, 0, .02), (() => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.66, .95), new THREE.MeshPhysicalMaterial({ color: '#30383c', roughness: .1, clearcoat: 1 })); p.position.set(0, .6, .401); return p; })(), B(.03, .5, .03, M.steel(), .3, .7, .42, .008))); }
export function coatHooks(m, n = 4) { const g = grp(B(n * .3 + .1, .12, .03, m, 0, 0, 0, .01)); for (let i = 0; i < n; i++) g.add(B(.03, .03, .1, M.black(), -n * .15 + .15 + i * .3, -.02, .06, .008)); return g; }
export function consoleTable(wood, w = 1.5) { const g = grp(B(w, .05, .45, wood, 0, 1.0, 0, .01)); for (const s of [-1, 1]) g.add(B(.05, .98, .4, wood, s * (w / 2 - .03), .49, 0, .006)); g.add(B(w - .1, .04, .4, wood, 0, .25, 0, .006)); return shadow(g); }
export function towelStack(c, n = 3) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(at(cushion(.5, .08, .4, M.cotton(c), { puff: .6, seam: .6 }), 0, .04 + i * .085, 0)); return g; }
