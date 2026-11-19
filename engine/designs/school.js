// SCHOOL PROP LIBRARY (2026-11-19): everything a US high-school classroom holds, built from real models (Poly Haven, CC0,
// real-world size x 1.4 studio scale) or modelled after the real object where the object IS simple (a whiteboard is an
// aluminium frame round a white panel, a bulletin board is cork in a frame, a flag is cloth on a pole).
// Convention like furniture.js: floor y 0, centred x / z, FRONT toward +z (backs against a wall at -z).
// Research: research/classroom.md.
import * as THREE from 'three';
import { mat } from '../materials.js';
import { bbox, at, ph } from '../build.js';
import { M } from './furniture.js';

export const S = 1.4;   // studio scale
const named = (o, n) => { o.name = n; return o; };
const grp = (...a) => { const g = new THREE.Group(); a.forEach(o => g.add(o)); return g; };
const B = (w, h, d, m, x = 0, y = 0, z = 0, r = .008) => at(bbox(w, h, d, m, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), x, y, z);
const shadow = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = !m.material.transparent; m.receiveShadow = true; } }); return o; };
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
// a model turned so its front faces +z and its feet are on y 0, centred (Poly Haven fronts vary per model)
const fit = (o, yaw = 0) => { const w = new THREE.Group(); o.rotation.y = yaw; w.add(o); w.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()); o.position.set(-c.x, -b.min.y, -c.z); return w; };

export const deskScan = async () => named(fit(await ph('SchoolDesk_01', { scale: S }), PH_YAW.desk), 'student desk scan');   // book box sits where R6 thighs go: not used
// STUDENT DESK, modelled (2026-11-19): a US classroom desk = laminate top with a dark T-mould edge on a steel tube frame
// (4 legs, side stretchers, plastic glides). Sized for R6 bodies, not real ones: R6 shoulders are 4 studs wide and their
// rigid arms pivot 1.33 m up when seated, so the top is 1.45 wide at 1.08 m (arms rest ON it) and there is no book box
// under it (seated R6 thighs reach .99 m). Front (+z) is the side the student sits at.
export function desk({ w = 1.45, d = .78, h = 1.08, top = '#d9b98c', frame = '#5b5f65' } = {}) {
  const g = new THREE.Group(), lam = mat('laminate', { size: 1.2, clearcoat: .35, clearcoatRough: .25 }); lam.color.set(top);
  const fr = M.metal(frame), edge = M.matte('#3a3530'), t = .035;
  g.add(B(w, t, d, lam, 0, h - t / 2, 0, .02), B(w + .01, t - .006, d + .01, edge, 0, h - t / 2 - .002, 0, .022));
  const lx = w / 2 - .07, lz = d / 2 - .06, legH = h - t;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, legH, 14), fr); l.position.set(sx * lx, legH / 2, sz * lz); g.add(l);
    const gl = new THREE.Mesh(new THREE.CylinderGeometry(.024, .026, .025, 14), M.matte('#222')); gl.position.set(sx * lx, .0125, sz * lz); g.add(gl); }
  for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, 2 * lz, 10), fr); r.rotation.x = Math.PI / 2; r.position.set(sx * lx, .22, 0); g.add(r);
    const a = B(.04, .03, 2 * lz, fr, sx * lx, h - t - .015, 0, .006); g.add(a); }                      // side rails tight under the top (seated thighs pass .99 m)
  g.add(B(2 * lx, .03, .04, fr, 0, h - t - .015, -lz, .006));                                            // back apron (the far side)
  return named(shadow(g), 'student desk');
}
export async function chair() { const o = await ph('SchoolChair_01', { scale: S }); o.scale.set(S * 1.3, S * .92, S * 1.1); return named(fit(o, PH_YAW.chair), 'student chair'); }   // widened for R6 hips, seat lowered to .65 so seated thighs clear the desk
export const teacherDesk = async () => named(fit(await ph('metal_office_desk', { scale: S }), PH_YAW.tdesk), 'teacher desk');
export const bookcase = async () => named(fit(await ph('wooden_bookshelf_worn', { scale: S }), PH_YAW.bookcase), 'bookcase');
export const cabinet = async () => named(fit(await ph('painted_wooden_cabinet', { scale: S }), PH_YAW.cabinet), 'cabinet');
export const laptop = async () => named(fit(await ph('classic_laptop', { scale: S }), PH_YAW.laptop), 'laptop');
export const binder = async () => named(fit(await ph('binder_notebook', { scale: S })), 'binder');
export const supplies = async () => named(fit(await ph('stationery_supplies', { scale: S })), 'supplies');
export const notepads = async () => named(fit(await ph('office_notepads', { scale: S })), 'notepads');
export const stapler = async () => named(fit(await ph('vintage_stapler', { scale: S })), 'stapler');
export const plant = async () => named(fit(await ph('potted_plant_02', { scale: S })), 'plant');
export async function clock() { const o = await ph('wall_clock', { scale: S }); const w = fit(o, PH_YAW.clock); return named(w, 'clock'); }
// model fronts measured on inspect sheets (radians to turn the scan so its front faces +z)
export const PH_YAW = { desk: 0, chair: 0, tdesk: 0, bookcase: 0, cabinet: 0, laptop: 0, clock: 0 };

// WHITEBOARD: real ones are a white melamine / porcelain panel in a satin aluminium frame with a marker tray along the
// bottom (typical 4 x 8 ft or 4 x 12 ft). Writing is drawn with measured text (never touching the edge).
export function whiteboard({ w = 3.66 * S, h = 1.22 * S, write = null } = {}) {
  const al = M.metal('#c7cbd0'), frame = .035, g = new THREE.Group();
  const tex = canvasTex(2048, Math.round(2048 * h / w), (x, W, H) => { x.fillStyle = '#f7f8f8'; x.fillRect(0, 0, W, H);
    const grd = x.createLinearGradient(0, 0, W, H); grd.addColorStop(0, 'rgba(255,255,255,.35)'); grd.addColorStop(.5, 'rgba(255,255,255,0)'); grd.addColorStop(1, 'rgba(210,214,220,.25)'); x.fillStyle = grd; x.fillRect(0, 0, W, H);
    x.globalAlpha = .025; x.fillStyle = '#6a7380'; for (let i = 0; i < 14; i++) { x.beginPath(); x.ellipse(Math.random() * W, Math.random() * H, 80 + Math.random() * 160, 18 + Math.random() * 30, Math.random() * 3, 0, 7); x.fill(); } x.globalAlpha = 1;   // faint ghosting of erased marker
    if (write) write(x, W, H); });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(w - frame * 2, h - frame * 2), new THREE.MeshPhysicalMaterial({ map: tex, roughness: .18, clearcoat: .9, clearcoatRoughness: .08 }));
  panel.position.set(0, h / 2, .012); g.add(panel); g.add(B(w - frame, h - frame, .01, M.matte('#e9eaea'), 0, h / 2, .004));
  for (const [x, y, ww, hh] of [[0, h - frame / 2, w, frame], [0, frame / 2, w, frame], [-w / 2 + frame / 2, h / 2, frame, h], [w / 2 - frame / 2, h / 2, frame, h]]) g.add(B(ww, hh, .03, al, x, y, .015, .006));
  const tray = B(w * .92, .025, .09, al, 0, -.0, .05, .006); g.add(tray);   // marker tray
  const mk = [['#1d4fb8', -.4], ['#1a1a1a', -.3], ['#c22a2a', -.22], ['#1e8a46', .55]]; for (const [c, x] of mk) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .17, 10), M.paint(c)); m.rotation.z = Math.PI / 2; m.position.set(x * w / 2, .035, .06); g.add(m); }
  const er = B(.17, .04, .06, M.matte('#2b2b2e'), w * .3, .045, .06, .008); g.add(er); g.add(B(.17, .012, .06, M.matte('#c9c3b6'), w * .3, .02, .06, .004));   // felt eraser
  g.userData.panel = panel; g.userData.size = [w, h]; return named(shadow(g), 'whiteboard');
}
// CORK BULLETIN BOARD in a wood / aluminium frame, with pinned paper notices
export function corkboard({ w = 1.22 * S, h = .91 * S, seed = 1 } = {}) {
  const g = new THREE.Group(), r = mulberry(seed);
  const cork = canvasTex(1024, Math.round(1024 * h / w), (x, W, H) => { x.fillStyle = '#b98a5a'; x.fillRect(0, 0, W, H); for (let i = 0; i < 9000; i++) { x.fillStyle = r() < .5 ? 'rgba(120,80,45,.35)' : 'rgba(225,185,140,.3)'; x.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3); }
    const papers = ['#ffffff', '#fff3a8', '#cfe8ff', '#ffd6d6', '#d9f5d0'];
    for (let i = 0; i < 9; i++) { const pw = W * (.14 + r() * .1), ph = pw * (1.1 + r() * .3), px = W * (.04 + (i % 5) * .19) + r() * 12, py = H * (.06 + Math.floor(i / 5) * .48) + r() * 18;
      x.save(); x.translate(px + pw / 2, py + ph / 2); x.rotate((r() - .5) * .12); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(-pw / 2 + 4, -ph / 2 + 5, pw, ph); x.fillStyle = papers[i % papers.length]; x.fillRect(-pw / 2, -ph / 2, pw, ph);
      x.fillStyle = 'rgba(40,40,50,.55)'; for (let l = 0; l < 7; l++) x.fillRect(-pw * .38, -ph * .32 + l * ph * .09, pw * (.5 + r() * .26), 3);
      x.fillStyle = ['#d23', '#26c', '#2a4', '#eb2'][i % 4]; x.beginPath(); x.arc(0, -ph * .44, 7, 0, 7); x.fill(); x.restore(); } });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w - .06, h - .06), new THREE.MeshStandardMaterial({ map: cork, roughness: .95 })); p.position.set(0, h / 2, .016); g.add(p);
  g.add(B(w - .04, h - .04, .014, M.matte('#9c7448'), 0, h / 2, .007));
  const fr = M.metal('#c4c8cc'); for (const [x, y, ww, hh] of [[0, h - .015, w, .03], [0, .015, w, .03], [-w / 2 + .015, h / 2, .03, h], [w / 2 - .015, h / 2, .03, h]]) g.add(B(ww, hh, .028, fr, x, y, .014, .005));
  return named(shadow(g), 'bulletin board');
}
// US FLAG on a short wall-bracket pole (classrooms mount one in a front corner): 3 x 5 ft nylon, hanging in folds
export function flag() {
  const fw = 1.52 * .62 * S, fh = .91 * .62 * S, g = new THREE.Group();   // a 3 x 5 classroom flag (smaller than outdoor)
  const tex = canvasTex(1140, 600, (x, W, H) => { const sh = H / 13; for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#b22234'; x.fillRect(0, i * sh, W, sh + 1); }
    const cw = W * .4, ch = sh * 7; x.fillStyle = '#3c3b6e'; x.fillRect(0, 0, cw, ch); x.fillStyle = '#fff';
    for (let r = 0; r < 9; r++) for (let c = 0; c < (r % 2 ? 5 : 6); c++) { const cx = cw * ((c + (r % 2 ? 1 : .5)) / 6), cy = ch * ((r + .5) / 9); star(x, cx, cy, ch * .035); } });
  const geo = new THREE.PlaneGeometry(fw, fh, 40, 20), P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) { const u = (P.getX(i) + fw / 2) / fw, v = (P.getY(i) + fh / 2) / fh; P.setZ(i, Math.sin(u * 13) * .035 * u + Math.sin(u * 5 + v * 2) * .02 * u); P.setY(i, P.getY(i) - u * u * fh * .45); }   // hangs from the pole: folds grow away from it, the fly end droops
  geo.computeVertexNormals(); const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: .7, side: THREE.DoubleSide })); cloth.position.set(fw / 2 + .02, -fh / 2 - .01, 0);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, fw * 1.25, 12), M.metal('#d9c07a')); pole.rotation.z = Math.PI / 2; pole.position.x = fw * .6;
  const tip = new THREE.Mesh(new THREE.SphereGeometry(.032, 14, 10), M.brass()); tip.position.x = fw * 1.24;
  const fl = new THREE.Group(); fl.add(cloth, pole, tip); fl.rotation.z = -.62; fl.position.set(.04, 0, 0);   // pole sticks out of the wall at ~35 deg down
  g.add(B(.08, .14, .05, M.metal('#c9ccd0'), 0, 0, .025, .006), fl); fl.rotation.y = -Math.PI / 2;            // bracket on the wall, pole toward the room (+z)
  return named(shadow(g), 'flag');
}
// PROJECTOR mounted on the ceiling (a box with a lens, on a drop pole)
export function projector(drop = .55) {
  const g = new THREE.Group(), body = M.paint('#e9e9ea');
  g.add(B(.42, .14, .34, body, 0, -drop - .07, 0, .03), B(.06, .06, .06, M.black(), 0, -drop, 0, .01));
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, drop, 10), M.black()); pole.position.y = -drop / 2; g.add(pole); g.add(B(.16, .02, .16, M.black(), 0, -.01, 0, .004));
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(.05, .055, .04, 24), M.black()); lens.rotation.x = Math.PI / 2; lens.position.set(.1, -drop - .07, .18); g.add(lens);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(.04, 24), M.screen()); glass.position.set(.1, -drop - .07, .201); g.add(glass);
  return named(shadow(g), 'projector');
}
// pull-down projector SCREEN rolled up in its case above the board (rolled up = how it usually sits)
export function screenCase(w = 3.0) { return named(shadow(grp(B(w, .12, .12, M.paint('#f1f1f1'), 0, 0, 0, .04), B(.04, .1, .02, M.matte('#333'), 0, -.07, .03, .005))), 'screen case'); }
// LED panel lights: 2 x 4 ft troffers set into the ceiling grid
export function troffer(on = true) { const g = grp(B(.61 * S, .03, 1.22 * S, M.paint('#eeeeee'), 0, -.015, 0, .004)); const p = new THREE.Mesh(new THREE.PlaneGeometry(.61 * S - .08, 1.22 * S - .08), on ? M.glow('#fff8ee') : M.matte('#f4f4f4')); p.rotation.x = Math.PI / 2; p.position.y = -.032; g.add(p); return named(g, 'ceiling light'); }
// a classroom TRASH CAN (grey plastic, slightly tapered) and RECYCLING bin (blue)
export function bin(c = '#5b6068') { const m = M.paint(c), g = new THREE.Group(); const cyl = new THREE.Mesh(new THREE.CylinderGeometry(.22, .18, .62, 28, 1, true), new THREE.MeshPhysicalMaterial({ color: c, roughness: .55, side: THREE.DoubleSide })); cyl.position.y = .31; g.add(cyl);
  const base = new THREE.Mesh(new THREE.CircleGeometry(.18, 28), m); base.rotation.x = -Math.PI / 2; base.position.y = .005; g.add(base); const rim = new THREE.Mesh(new THREE.TorusGeometry(.22, .012, 8, 32), m); rim.rotation.x = Math.PI / 2; rim.position.y = .62; g.add(rim); return named(shadow(g), 'bin'); }
// a BACKPACK on the floor by a desk (rounded body, front pocket, two straps over the top)
export function backpack(c = '#2f5d9b', seed = 1) {
  const r = mulberry(seed), m = mat('linen', { color: c, sheen: .3 }), dark = M.matte(shade(c, .6)), g = new THREE.Group();
  const body = bbox(.36, .48, .2, m, .08); body.position.y = .24; g.add(body); const pk = bbox(.28, .22, .07, m, .05); pk.position.set(0, .15, .12); g.add(pk);
  const zip = B(.26, .01, .01, dark, 0, .27, .155, .003); g.add(zip);
  for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.TorusGeometry(.13, .018, 8, 20, Math.PI), dark); st.position.set(s * .1, .3, -.11); st.rotation.y = Math.PI / 2; st.scale.set(1, 1.3, 1); g.add(st); }
  const hand = new THREE.Mesh(new THREE.TorusGeometry(.04, .01, 6, 12, Math.PI), dark); hand.position.set(0, .48, 0); g.add(hand);
  g.rotation.z = (r() - .5) * .08; return named(shadow(g), 'backpack');
}
// a stack of textbooks (hardbacks of slightly different sizes)
export function books(n = 3, seed = 1) { const r = mulberry(seed), g = new THREE.Group(), cols = ['#244a7a', '#7a2430', '#2f6b4f', '#c9902e', '#4b3a6b', '#2a2a2e']; let y = 0;
  for (let i = 0; i < n; i++) { const w = .26 + r() * .06, d = .2 + r() * .04, h = .03 + r() * .02, b = new THREE.Group();
    b.add(B(w, h, d, M.paint(cols[Math.floor(r() * cols.length)]), 0, h / 2, 0, .004), B(w - .012, h - .008, d - .006, M.matte('#f3efe4'), .006, h / 2, 0, .002));
    b.position.y = y; b.rotation.y = (r() - .5) * .3; g.add(b); y += h; } return named(shadow(g), 'books'); }
// an open NOTEBOOK (spiral, ruled) with a pencil
export function notebook(seed = 1) { const r = mulberry(seed), g = new THREE.Group(), w = .21 * S, d = .28 * S;
  const tex = canvasTex(512, 340, (x, W, H) => { x.fillStyle = '#fbfaf6'; x.fillRect(0, 0, W, H); x.strokeStyle = '#9cc0e6'; x.lineWidth = 2; for (let y = 50; y < H; y += 18) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
    x.strokeStyle = '#e8a0a0'; x.beginPath(); x.moveTo(40, 0); x.lineTo(40, H); x.moveTo(W / 2 + 40, 0); x.lineTo(W / 2 + 40, H); x.stroke(); x.fillStyle = 'rgba(40,50,90,.7)'; for (let l = 0; l < 9; l++) x.fillRect(48, 56 + l * 18, 60 + r() * 140, 3); x.fillStyle = '#888'; for (let y = 10; y < H; y += 16) { x.beginPath(); x.arc(W / 2, y, 4, 0, 7); x.fill(); } });
  const page = new THREE.Mesh(new THREE.BoxGeometry(w * 2, .008, d), [M.matte('#ddd'), M.matte('#ddd'), new THREE.MeshStandardMaterial({ map: tex, roughness: .9 }), M.matte('#ddd'), M.matte('#ddd'), M.matte('#ddd')]); page.position.y = .004; g.add(page);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .2, 6), M.paint('#f2c230')); pen.rotation.z = Math.PI / 2; pen.rotation.y = .5; pen.position.set(w * .5, .014, .02); g.add(pen); return named(shadow(g), 'notebook'); }
// classroom RULES / motivational POSTER (paper in a thin frame), text fitted with measureText
export function poster({ w = .6 * S, h = .9 * S, title = 'CLASS RULES', lines = [], bg = '#1d3f73', fg = '#ffffff' } = {}) {
  const tex = canvasTex(600, 900, (x, W, H) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); x.fillStyle = fg; x.textAlign = 'center';
    let fs = 90; x.font = `800 ${fs}px Arial`; while (x.measureText(title).width > W * .86) { fs -= 4; x.font = `800 ${fs}px Arial`; } x.fillText(title, W / 2, H * .15);
    x.textAlign = 'left'; lines.forEach((l, i) => { let f = 40; x.font = `600 ${f}px Arial`; while (x.measureText(l).width > W * .8) { f -= 2; x.font = `600 ${f}px Arial`; } x.fillText(l, W * .1, H * (.3 + i * .11)); }); });
  const g = grp(B(w, h, .01, M.matte('#222'), 0, h / 2, .005, .003)); const p = new THREE.Mesh(new THREE.PlaneGeometry(w - .03, h - .03), new THREE.MeshStandardMaterial({ map: tex, roughness: .7 })); p.position.set(0, h / 2, .011); g.add(p); return named(g, 'poster'); }
// pencil SHARPENER (electric, on the counter) and tissue box: the small things a real teacher desk holds
export function tissues() { const g = grp(B(.25, .1, .13, M.paint('#7fb3d8'), 0, .05, 0, .01)); const t = new THREE.Mesh(new THREE.ConeGeometry(.04, .07, 8, 1, true), new THREE.MeshStandardMaterial({ color: '#fff', roughness: 1, side: THREE.DoubleSide })); t.position.y = .13; g.add(t); return named(shadow(g), 'tissues'); }
// FLOOR: waxed VCT (vinyl composition tile) in 12" squares, the US school standard
export const vct = () => mat('tiles', { color: '#e9e5dc', size: .305 * S });

function star(x, cx, cy, r) { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .42 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.closePath(); x.fill(); }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shade(hex, k) { const c = new THREE.Color(hex).multiplyScalar(k); return '#' + c.getHexString(); }

export const PIECES = { desk: () => desk(), chair, teacherDesk, bookcase, cabinet, laptop, binder, supplies, notepads, stapler, plant, clock,
  whiteboard: () => whiteboard(), corkboard: () => corkboard(), flag: () => flag(), projector: () => projector(), backpack: () => backpack(), books: () => books(), notebook: () => notebook(), bin: () => bin(), poster: () => poster({ lines: ['1. Be on time', '2. Be respectful', '3. Phones away'] }) };
