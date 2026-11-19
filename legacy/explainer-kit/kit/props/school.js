// SCHOOL PROPS (reusable, Roblox-game look): textures only where they read (oak tops, cork, whiteboard), flat
// paint everywhere else (desk frames, walls, trims). Units = metres; a 1.7 m avatar sits at a 0.74 m desk.
// Every builder returns a THREE.Group with its origin on the floor at the object's centre, front facing -z
// (towards the board) unless noted, plus handles for anything that animates.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, canvasTex, rng } from '../util.js';
import { pbr, contactShadow } from '../pbr.js';

// ---------- shared materials ----------
const TL = new THREE.TextureLoader(), texCache = new Map();
export function tex(rel, rep = [1, 1], { srgb = true, rot = 0 } = {}) {
  const key = rel + rep + rot; if (texCache.has(key)) return texCache.get(key);
  const t = TL.load(new URL(rel, import.meta.url).href); if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.rotation = rot; t.anisotropy = 8; texCache.set(key, t); return t;
}
export const PAINT = { frame: 0xd3d8de, frameDark: 0x9aa2ab, alu: 0xb9c0c8, white: 0xf3f4f5, black: 0x2a2c30, trim: 0xe4e8ec };
const oakCache = new Map();
const oak = (rep = [1, 1], rot = 0) => { const k = rep + '|' + rot; if (!oakCache.has(k)) oakCache.set(k, pbr('ph/oak_veneer_01', { rep, rot, rough: .75, normal: .7, physical: true, clearcoat: .35, clearcoatRough: .25 })); return oakCache.get(k); };   // varnished oak
const paint = (c, r = .6) => M(c, { roughness: r });
const metal = (c = PAINT.frame) => M(c, { roughness: .32, metalness: .45 });   // powder-coated steel: picks up reflections

// ---------- student desk: oak top, painted steel sides, cubby shelf (open towards the student at +z), foot bar ----------
export function desk({ w = .68, d = .5, h = .74 } = {}) {
  const g = new THREE.Group(), fr = metal();
  rb(w, .035, d, oak([1, .75]), 0, h - .018, 0, g, .008);
  for (const s of [-1, 1]) {
    rb(.03, h - .04, .03, fr, s * (w / 2 - .04), (h - .04) / 2, -(d / 2 - .05), g, .006);
    rb(.03, h - .04, .03, fr, s * (w / 2 - .04), (h - .04) / 2, d / 2 - .05, g, .006);
    rb(.018, .2, d - .1, fr, s * (w / 2 - .04), h - .15, 0, g, .004);                              // side panel
    rb(.03, .03, d - .08, fr, s * (w / 2 - .04), .08, 0, g, .006);                                 // floor runner
  }
  rb(w - .1, .015, d - .1, fr, 0, h - .2, .0, g, .004);                                           // cubby shelf
  rb(w - .1, .18, .015, fr, 0, h - .12, -(d / 2 - .055), g, .004);                                // modesty panel (board side)
  rb(w - .1, .025, .025, fr, 0, .18, -(d / 2 - .05), g, .006);                                    // foot bar
  g.add(contactShadow(w * 1.25, d * 1.3));
  return g;
}
// ---------- student chair: oak seat + back, painted steel frame ----------
export function chair({ seatH = .45 } = {}) {
  const g = new THREE.Group(), fr = metal();
  rb(.42, .025, .4, oak([.7, .7]), 0, seatH, 0, g, .01);
  const back = rb(.4, .2, .022, oak([.7, .35]), 0, seatH + .32, .2, g, .01); back.rotation.x = -.1;
  for (const [x, z] of [[-.18, -.17], [.18, -.17], [-.18, .17], [.18, .17]]) rb(.025, seatH - .01, .025, fr, x, (seatH - .01) / 2, z, g, .006);
  for (const x of [-.18, .18]) { const p = rb(.022, .36, .022, fr, x, seatH + .17, .19, g, .006); p.rotation.x = -.1; }
  for (const z of [-.17, .17]) rb(.36, .02, .02, fr, 0, .12, z, g, .005);
  g.add(contactShadow(.6, .58, { opacity: .26 }));
  return g;
}
// ---------- teacher desk: oak top, painted pedestal with 3 drawers (handles), modesty panel ----------
export function teacherDesk({ w = 1.5, d = .72, h = .76 } = {}) {
  const g = new THREE.Group(), body = paint(PAINT.trim, .5), hd = metal(PAINT.frameDark);
  rb(w, .04, d, oak([2, 1]), 0, h - .02, 0, g, .01);
  rb(.45, h - .04, d - .04, body, w / 2 - .25, (h - .04) / 2, 0, g, .01);                         // pedestal (right)
  for (let i = 0; i < 3; i++) { const y = .14 + i * .22; rb(.41, .19, .01, paint(0xedf0f3, .45), w / 2 - .25, y, -(d / 2 - .015), g, .008); rb(.12, .018, .02, hd, w / 2 - .25, y + .05, -(d / 2 - .025), g, .008); }
  rb(.03, h - .04, d - .04, body, -(w / 2 - .03), (h - .04) / 2, 0, g, .008);                    // left leg panel
  g.add(contactShadow(w * 1.2, d * 1.4));
  rb(w - .1, .45, .02, body, 0, h - .27, d / 2 - .03, g, .006);                                   // modesty panel (faces the class, +z)
  return g;
}
export function officeChair() {
  const g = new THREE.Group(), blk = paint(0x33363c, .6), chrome = M(0xcfd4da, { roughness: .25, metalness: .8 });
  rb(.48, .07, .46, blk, 0, .5, 0, g, .03); const b = rb(.46, .5, .06, blk, 0, .82, .24, g, .03); b.rotation.x = -.12;
  add(cyl(.025, .025, .38), chrome, 0, .29, 0, g);
  for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5, leg = rb(.3, .03, .04, chrome, Math.cos(a) * .15, .07, Math.sin(a) * .15, g, .01); leg.rotation.y = -a; add(new THREE.SphereGeometry(.03, 12, 8), blk, Math.cos(a) * .3, .03, Math.sin(a) * .3, g); }
  return g;
}
// ---------- whiteboard: aluminium frame, glossy board, marker tray with markers + eraser; content(drawFn) writes on it ----------
export function whiteboard({ w = 3.2, h = 1.2 } = {}) {
  const g = new THREE.Group(), alu = metal(PAINT.alu);
  const c = document.createElement('canvas'); c.width = 2048; c.height = Math.round(2048 * h / w); const ctx = c.getContext('2d');
  const boardTex = new THREE.CanvasTexture(c); boardTex.colorSpace = THREE.SRGBColorSpace; boardTex.anisotropy = 8;
  const base = new Image(); base.src = new URL('../assets/gen/whiteboard.jpg', import.meta.url).href;
  let drawFn = null; const redraw = () => { ctx.fillStyle = '#f7f7f7'; ctx.fillRect(0, 0, c.width, c.height); if (base.complete && base.naturalWidth) ctx.drawImage(base, 0, 0, c.width, c.height); if (drawFn) drawFn(ctx, c.width, c.height); boardTex.needsUpdate = true; };
  base.onload = redraw; redraw();
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: boardTex, roughness: .22, metalness: 0 })); board.position.set(0, 0, .021); g.add(board);
  rb(w + .08, h + .08, .03, alu, 0, 0, 0, g, .012);
  rb(w * .7, .025, .07, alu, 0, -h / 2 - .05, .04, g, .008);                                      // tray
  const cols = [0x2756c9, 0xd23b3b, 0x1f9d55, 0x222222];
  cols.forEach((cc, i) => { const mk = add(cyl(.011, .011, .13, 12), paint(cc, .4), -w * .2 + i * .06, -h / 2 - .028, .045, g); mk.rotation.z = Math.PI / 2; });
  rb(.13, .035, .05, paint(0x2b2d33), w * .15, -h / 2 - .02, .045, g, .006); rb(.13, .012, .05, paint(0xd8d0bf, .9), w * .15, -h / 2 - .043, .045, g, .004);
  return { group: g, write(fn) { drawFn = fn; redraw(); }, canvas: c };
}
// ---------- window unit: aluminium frame + mullions, glass, deep sill. Mount in a wall opening of the same size ----------
export function windowUnit({ w = 2.2, h = 1.6, cols = 3, rows = 2, depth = .14 } = {}) {
  const g = new THREE.Group(), alu = metal(PAINT.alu), t = .05;
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xdfefff, roughness: .05, transmission: .9, transparent: true, opacity: .25, thickness: .01, ior: 1.3 });
  for (const s of [-1, 1]) { rb(w, t, depth, alu, 0, s * (h / 2 - t / 2), 0, g, .008); rb(t, h, depth, alu, s * (w / 2 - t / 2), 0, 0, g, .008); }
  for (let i = 1; i < cols; i++) rb(.035, h - t, .06, alu, -w / 2 + w * i / cols, 0, 0, g, .006);
  for (let j = 1; j < rows; j++) rb(w - t, .035, .06, alu, 0, -h / 2 + h * j / rows, 0, g, .006);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w - t, h - t), glass); g.add(p);
  rb(w + .1, .04, .26, paint(PAINT.white, .4), 0, -h / 2 - .02, .08, g, .01);                     // sill (room side, +z)
  return g;
}
// ---------- door: painted frame, oak slab with a vision panel, lever handle. Hinge at x = -w/2; open(a) swings it ----------
export function door({ w = .95, h = 2.1 } = {}) {
  const g = new THREE.Group(), fr = paint(PAINT.trim, .5), chrome = M(0xcfd4da, { roughness: .25, metalness: .8 });
  for (const s of [-1, 1]) rb(.07, h + .07, .12, fr, s * (w / 2 + .035), (h + .07) / 2, 0, g, .01);
  rb(w + .14, .07, .12, fr, 0, h + .035, 0, g, .01);
  const pivot = grp(-w / 2, 0, 0, g), slab = grp(w / 2, 0, 0, pivot);
  rb(w - .01, h - .01, .045, oak([1, 2.2], Math.PI / 2), 0, h / 2, 0, slab, .01);
  rb(.2, .55, .05, M(0xcfe6f7, { roughness: .1, metalness: 0 }), w * .22, h * .68, 0, slab, .01);   // vision panel
  for (const s of [-1, 1]) { rb(.035, .1, .02, chrome, w / 2 - .08, h * .48, s * .035, slab, .008); const lv = rb(.13, .022, .022, chrome, w / 2 - .13, h * .5, s * .055, slab, .008); }
  return { group: g, open(a) { pivot.rotation.y = a; } };
}
// ---------- wall clock: set(hours, minutes) ----------
export function wallClock({ r = .2 } = {}) {
  const g = new THREE.Group();
  const face = canvasTex(512, 512, (x, w) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(256, 256, 250, 0, 7); x.fill(); x.fillStyle = '#222';
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, l = i % 5 ? 14 : 34; x.save(); x.translate(256, 256); x.rotate(a); x.fillRect(-(i % 5 ? 2 : 5), -236, i % 5 ? 4 : 10, l); x.restore(); }
    x.font = '700 54px Inter, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; x.fillText(i, 256 + Math.sin(a) * 168, 256 - Math.cos(a) * 168); } });
  const f = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshStandardMaterial({ map: face, roughness: .4 })); f.position.z = .021; g.add(f);
  const rim = add(new THREE.TorusGeometry(r, .022, 12, 48), paint(PAINT.black, .4), 0, 0, .02, g);
  add(cyl(r, r, .04, 48), paint(0xffffff), 0, 0, 0, g).rotation.x = Math.PI / 2;
  const hand = (len, wd, c, z) => { const p = grp(0, 0, z, g); rb(wd, len, .006, paint(c, .4), 0, len / 2 - .02, 0, p, .002); return p; };
  const hh = hand(r * .55, .016, 0x222222, .028), mh = hand(r * .8, .011, 0x222222, .032), sh = hand(r * .85, .005, 0xd23b3b, .036);
  return { group: g, set(h, m, s = 0) { hh.rotation.z = -((h % 12) + m / 60) / 12 * Math.PI * 2; mh.rotation.z = -(m + s / 60) / 60 * Math.PI * 2; sh.rotation.z = -s / 60 * Math.PI * 2; } };
}
// ---------- round ceiling light (like the reference): white housing, glowing diffuser ----------
export function ceilingLight({ r = .32 } = {}) {
  const g = new THREE.Group();
  add(cyl(r + .03, r + .03, .03, 40), paint(PAINT.white, .5), 0, -.015, 0, g);
  add(cyl(r, r, .012, 40), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6ea, emissiveIntensity: 1.6 }), 0, -.034, 0, g, { shadow: false });
  return g;
}
// ---------- bookshelf with books (random sizes / colours, a few leaning) ----------
export function bookshelf({ w = 1.2, h = 1.8, d = .32, shelves = 4, seed = 3 } = {}) {
  const g = new THREE.Group(), wood = oak([1, 1]), R = rng(seed);
  for (const s of [-1, 1]) rb(.03, h, d, wood, s * (w / 2 - .015), h / 2, 0, g, .006);
  rb(w, .02, d, wood, 0, h - .01, 0, g, .006); rb(w - .04, h - .02, .01, paint(0xe8e2d6), 0, h / 2, -d / 2 + .005, g, .002);
  const cols = [0xc0392b, 0x2e86c1, 0x27ae60, 0xf1c40f, 0x8e44ad, 0xe67e22, 0x34495e, 0x16a085, 0xecf0f1];
  for (let i = 0; i < shelves; i++) {
    const y = .04 + i * (h - .06) / shelves; rb(w - .06, .025, d - .02, wood, 0, y, 0, g, .005);
    let x = -w / 2 + .05; const top = (h - .06) / shelves - .06;
    while (x < w / 2 - .12) {
      const bw = .025 + R() * .03, bh = top * (.6 + R() * .38), bd = d * (.6 + R() * .25);
      const b = rb(bw, bh, bd, paint(cols[Math.floor(R() * cols.length)], .7), x + bw / 2, y + .012 + bh / 2, 0, g, .004);
      if (R() < .08) { b.rotation.z = -.25; b.position.x += .03; x += .05; }
      x += bw + .003;
    }
  }
  return g;
}
// ---------- bin, plant (bush built from leaf clusters, not a ball), cork noticeboard, framed poster, AC unit ----------
export function trashBin() {
  const g = new THREE.Group(); add(cyl(.17, .14, .42, 28), paint(0x5b6f86, .5), 0, .21, 0, g); add(new THREE.TorusGeometry(.17, .012, 8, 28), paint(0x4a5c70, .5), 0, .42, 0, g).rotation.x = Math.PI / 2; return g;
}
export function plant({ seed = 1, h = .9 } = {}) {
  const g = new THREE.Group(), R = rng(seed);
  add(cyl(.17, .13, .3, 24), paint(0xc56a3b, .8), 0, .15, 0, g); add(cyl(.16, .16, .02, 24), paint(0x4b3524, 1), 0, .29, 0, g);
  const leaf = [0x3f8f3a, 0x4fa244, 0x357a31].map(c => paint(c, .75));
  for (let i = 0; i < 9; i++) {   // stems fanning out, each ending in a leafy clump of flattened blobs
    const a = R() * Math.PI * 2, tilt = .2 + R() * .45, len = h * (.45 + R() * .45), tip = new THREE.Vector3(Math.sin(a) * Math.sin(tilt) * len, .3 + Math.cos(tilt) * len, Math.cos(a) * Math.sin(tilt) * len);
    const st = add(cyl(.008, .012, len, 6), paint(0x4e6b2c), tip.x / 2, .3 + (tip.y - .3) / 2, tip.z / 2, g); st.lookAt(tip.x, tip.y + 10, tip.z); st.rotation.x += 0;
    st.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tip.clone().sub(new THREE.Vector3(0, .3, 0)).normalize());
    for (let k = 0; k < 4; k++) { const b = add(new THREE.IcosahedronGeometry(.07 + R() * .05, 1), leaf[Math.floor(R() * 3)], tip.x + (R() - .5) * .12, tip.y + (R() - .5) * .1, tip.z + (R() - .5) * .12, g); b.scale.set(1, .55, 1); b.rotation.set(R(), R(), R()); }
  }
  return g;
}
export function noticeBoard({ w = 1.4, h = .9, seed = 2 } = {}) {
  const g = new THREE.Group(), R = rng(seed);
  rb(w + .06, h + .06, .03, oak([1, 1]), 0, 0, 0, g, .008);
  rb(w, h, .02, pbr('gen/cork', { rep: [w, h], normal: 1.4, rough: .95, noRough: true }), 0, 0, .012, g, .004);
  const pc = [0xffffff, 0xfff3a6, 0xbfe3ff, 0xffc9d6, 0xc9f5c9], pin = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f];
  for (let i = 0; i < 7; i++) {
    const pw = .16 + R() * .14, ph = pw * (1 + R() * .4), x = -w / 2 + .15 + R() * (w - .3), y = -h / 2 + .15 + R() * (h - .3);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), paint(pc[i % pc.length], .9)); p.position.set(x, y, .024 + i * .0004); p.rotation.z = (R() - .5) * .2; g.add(p);
    for (let k = 0; k < 4; k++) add(new THREE.BoxGeometry(pw * (.5 + R() * .4), .008, .001), paint(0x9aa0a8), x - pw * .05, y + ph * .3 - k * .04, .025 + i * .0004, g, { shadow: false }).rotation.z = p.rotation.z;
    add(new THREE.SphereGeometry(.012, 10, 8), paint(pin[i % 4], .35), x, y + ph / 2 - .02, .03, g);
  }
  return g;
}
export function poster({ w = .6, h = .8, draw } = {}) {
  const g = new THREE.Group(); rb(w + .04, h + .04, .02, paint(0x2f3237, .4), 0, 0, 0, g, .006);
  const t = canvasTex(512, Math.round(512 * h / w), draw || ((x, W, H) => { x.fillStyle = '#fdfdfb'; x.fillRect(0, 0, W, H); }));
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: .6 })); p.position.z = .011; g.add(p); return g;
}
export function acUnit({ w = 1.0 } = {}) {
  const g = new THREE.Group(), wht = paint(0xf6f7f8, .35);
  rb(w, .3, .22, wht, 0, 0, 0, g, .05); rb(w * .9, .04, .02, paint(0xdfe3e7, .4), 0, -.11, .1, g, .01);
  for (let i = 0; i < 6; i++) rb(w * .86, .006, .01, paint(0xb8bfc6), 0, -.13 - i * .0, .11 - i * .0, g, .002).position.y = -.06 - i * .012;
  add(new THREE.SphereGeometry(.008, 8, 6), new THREE.MeshStandardMaterial({ color: 0x33ff88, emissive: 0x33ff88, emissiveIntensity: 2 }), w * .4, .08, .111, g, { shadow: false });
  return g;
}
export function lockers({ n = 5, h = 1.8 } = {}) {   // a row of school lockers, each with vents + a handle
  const g = new THREE.Group(), body = metal(0x5c8fc4), dark = metal(0x4a77a6), chrome = M(0xcfd4da, { roughness: .25, metalness: .8 }), w = .4;
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * (w + .01); rb(w, h, .45, body, x, h / 2, 0, g, .01);
    for (let k = 0; k < 4; k++) rb(w * .6, .012, .01, dark, x, h - .12 - k * .03, .226, g, .003);
    rb(.03, .14, .03, chrome, x + w * .32, h * .55, .235, g, .008);
  }
  return g;
}
export function backpack({ color = 0xd94b4b } = {}) {
  const g = new THREE.Group(), c = paint(color, .8), d = paint(new THREE.Color(color).multiplyScalar(.7).getHex(), .8);
  rb(.3, .38, .16, c, 0, .19, 0, g, .06); rb(.24, .16, .06, d, 0, .14, .1, g, .03); rb(.26, .015, .01, paint(0x222222), 0, .25, .135, g, .004);
  return g;
}

// ---------- test paper (A4 sheet, header + name line + questions, a few answers scribbled) and a pencil ----------
const paperTexCache = new Map();
export function testPaper({ seed = 1, answered = .5 } = {}) {
  const key = seed + '|' + answered;
  if (!paperTexCache.has(key)) paperTexCache.set(key, canvasTex(256, 362, (g, w, h) => {
    const R = rng(seed); g.fillStyle = '#fbfbf7'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#222'; g.font = '800 30px Fredoka, Arial Black, sans-serif'; g.fillText('TEST', 16, 40);
    g.strokeStyle = '#999'; g.lineWidth = 2; g.beginPath(); g.moveTo(110, 38); g.lineTo(240, 38); g.stroke();
    for (let i = 0; i < 7; i++) { const y = 80 + i * 38; g.fillStyle = '#555'; g.font = '600 15px Arial, sans-serif'; g.fillText((i + 1) + '.', 14, y);
      g.fillStyle = '#bbb'; g.fillRect(36, y - 9, 150 + R() * 50, 6);
      g.strokeStyle = '#ccd'; g.beginPath(); g.moveTo(36, y + 14); g.lineTo(236, y + 14); g.stroke();
      if (i / 7 < answered) { g.strokeStyle = '#2a4fbf'; g.lineWidth = 2.2; g.beginPath(); let x = 40; g.moveTo(x, y + 10); while (x < 100 + R() * 120) { x += 6; g.lineTo(x, y + 6 + R() * 6); } g.stroke(); g.lineWidth = 2; } }
  }));
  const g = new THREE.Group(); add(new THREE.BoxGeometry(.21, .002, .297), new THREE.MeshStandardMaterial({ map: paperTexCache.get(key), roughness: .85 }), 0, .001, 0, g, { shadow: false });
  return g;
}
export function pencil() {
  const g = new THREE.Group(), body = add(new THREE.CylinderGeometry(.0045, .0045, .15, 6), paint(0xf2c230, .5), 0, 0, 0, g);
  const tip = add(new THREE.ConeGeometry(.0045, .018, 6), paint(0xe8c9a0, .7), 0, -.084, 0, g); tip.rotation.x = Math.PI;
  add(new THREE.CylinderGeometry(.0047, .0047, .012, 8), metal(0xb8b8b8), 0, .081, 0, g); add(new THREE.CylinderGeometry(.0047, .0047, .012, 8), paint(0xf08aa0, .8), 0, .093, 0, g);
  body.castShadow = false; g.rotation.z = Math.PI / 2; return g;
}
