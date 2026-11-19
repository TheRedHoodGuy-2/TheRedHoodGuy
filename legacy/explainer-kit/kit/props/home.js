// HOME props (reusable): living-room furniture in the Roblox-game look. Fabric / wood textures where they read, flat
// paint on legs, frames and trims. Every prop faces +z (its front) with its feet on y = 0, so a set only places and turns it.
//   sofa, armchair, coffeeTable, sideTable, tvConsole, tv (screen on/off), remote, floorLamp, tableLamp, rug, frame,
//   curtain, cushion, vase, books, coatRack
import * as THREE from 'three';
import { M, rb, add, grp, cyl, sph, canvasTex, rng } from '../util.js';
import { pbr } from '../pbr.js';

const once = (() => { const c = new Map(); return (k, f) => (c.has(k) || c.set(k, f()), c.get(k)); })();
const paint = (c, r = .6) => once('p' + c + r, () => M(c, { roughness: r }));
export const fabric = (tint, rep = [2, 2]) => once('fab' + tint + rep, () => pbr('ph/velour_velvet', { map: 'neutral', tint, rep, normal: 1, rough: 1 }));
export const wood = (rep = [1, 1], rot = 0, tint = 0xffffff) => once('wd' + rep + rot + tint, () => pbr('ph/oak_veneer_01', { rep, rot, tint, rough: .9, normal: .6 }));
const legMat = () => paint(0x3a2a20, .5), brass = () => once('brass', () => M(0xd6a64a, { roughness: .3, metalness: .85 }));

// ---------- soft furniture ----------
export function cushion({ w = .45, h = .45, d = .14, color = 0xf4f0e6 } = {}) {
  const g = new THREE.Group(); const c = rb(w, h, d, fabric(color, [1, 1]), 0, 0, 0, g, Math.min(d / 2 - .005, .06)); c.scale.z = 1; return g;
}
export function sofa({ w = 2.1, color = 0xe2683f, seats = 3, pillows = [0xffd24a, 0x2f9e9a] } = {}) {
  const g = new THREE.Group(), F = fabric(color, [3, 1.5]), d = .92, sw = (w - .36) / seats;
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(cyl(.025, .018, .1, 12), legMat(), x * (w / 2 - .1), .05, z * (d / 2 - .1), g);
  rb(w, .22, d, F, 0, .21, 0, g, .04);                                            // base
  rb(w, .55, .2, F, 0, .55, -d / 2 + .1, g, .06);                                 // back frame
  for (const s of [-1, 1]) rb(.18, .52, d, F, s * (w / 2 - .09), .45, 0, g, .07); // arms
  for (let i = 0; i < seats; i++) {
    const x = -w / 2 + .18 + sw * (i + .5);
    rb(sw - .02, .16, d - .2, F, x, .4, .08, g, .06);                              // seat cushion
    const b = rb(sw - .03, .42, .17, F, x, .72, -d / 2 + .25, g, .07); b.rotation.x = -.16;   // back cushion
  }
  pillows.forEach((c, i) => { const p = cushion({ w: .4, h: .4, d: .13, color: c }); const s = i ? 1 : -1; p.position.set(s * (w / 2 - .38), .66, -d / 2 + .38); p.rotation.set(-.25, s * -.35, s * .12); g.add(p); });
  return g;
}
export function armchair({ color = 0xe8b02e } = {}) {
  const g = new THREE.Group(), F = fabric(color, [1.5, 1.5]), w = .86, d = .82;
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = add(cyl(.022, .014, .16, 10), legMat(), x * (w / 2 - .08), .08, z * (d / 2 - .08), g); l.rotation.z = x * .12; l.rotation.x = -z * .12; }
  rb(w, .18, d, F, 0, .24, 0, g, .05);
  rb(w - .3, .14, d - .16, F, 0, .39, .06, g, .05);
  const b = rb(w, .58, .18, F, 0, .62, -d / 2 + .1, g, .07); b.rotation.x = -.12;
  for (const s of [-1, 1]) rb(.15, .32, d - .05, F, s * (w / 2 - .075), .46, .02, g, .06);
  const p = cushion({ w: .34, h: .3, d: .12, color: 0xf6efe0 }); p.position.set(0, .56, -d / 2 + .26); p.rotation.x = -.2; g.add(p);
  return g;
}
export function rug({ w = 2.6, d = 1.8, seed = 1, base = '#f3e6cc', ink = '#25486e', accent = '#e2683f' } = {}) {
  const map = canvasTex(1024, Math.round(1024 * d / w), (x, W, H) => {
    x.fillStyle = base; x.fillRect(0, 0, W, H);
    x.strokeStyle = ink; x.lineWidth = W * .022; x.strokeRect(W * .04, W * .04, W - W * .08, H - W * .08);
    x.lineWidth = W * .006; x.strokeRect(W * .075, W * .075, W - W * .15, H - W * .15);
    const R = rng(seed), n = 7, s = (W - W * .2) / n;   // diamond lattice in the field
    for (let i = 0; i < n; i++) for (let j = 0; j < Math.floor((H - W * .2) / s); j++) {
      const cx = W * .1 + s * (i + .5), cy = W * .1 + s * (j + .5); x.fillStyle = (i + j) % 3 === 0 ? accent : ink; x.globalAlpha = .85;
      x.beginPath(); x.moveTo(cx, cy - s * .32); x.lineTo(cx + s * .32, cy); x.lineTo(cx, cy + s * .32); x.lineTo(cx - s * .32, cy); x.closePath(); x.fill(); x.globalAlpha = 1;
      x.fillStyle = base; x.beginPath(); x.arc(cx, cy, s * .08, 0, 7); x.fill(); void R;
    }
  });
  const m = pbr('ph/knitted_fleece', { noColor: true, rep: [w * 1.5, d * 1.5], normal: 1.2, rough: 1 }); m.map = map;
  const g = new THREE.Group(); const r = add(new THREE.BoxGeometry(w, .012, d), m, 0, .006, 0, g); r.castShadow = false; r.receiveShadow = true; return g;
}
export function curtain({ w = .7, h = 2.3, color = 0x2f9e9a, folds = 4 } = {}) {
  const geo = new THREE.PlaneGeometry(w, h, folds * 8, 1), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin((x / w + .5) * folds * Math.PI * 2) * .035); }
  geo.computeVertexNormals();
  const m = pbr('ph/velour_velvet', { map: 'neutral', tint: color, rep: [w * 1.5, h * 1.5], normal: 1, side: THREE.DoubleSide });
  const g = new THREE.Group(); add(geo, m, 0, -h / 2, 0, g); return g;   // hangs from y = 0
}

// woven kilim rug (kit/assets/gen/rug_kilim.jpg from tools/make_rug.py, real wool scan inside) with tasselled fringes on the short ends
export function rugKilim({ w = 3.0, d = 2.2 } = {}) {
  const g = new THREE.Group(), m = pbr('gen/rug_kilim', { normal: 1.3, rough: 1 });
  const r = add(new THREE.BoxGeometry(w, .012, d), m, 0, .006, 0, g); r.castShadow = false; r.receiveShadow = true;
  const fr = once('fringe', () => pbr('ph/velour_velvet', { map: 'neutral', tint: 0xeee2cb, rep: [.2, .2] }));
  for (const s of [-1, 1]) for (let i = 0; i < Math.round(d / .035); i++) { const t = add(cyl(.004, .004, .07, 5), fr, s * (w / 2 + .03), .004, -d / 2 + .02 + i * .035, g, { shadow: false }); t.rotation.z = Math.PI / 2; t.rotation.y = (i % 3 - 1) * .15; }
  return g;
}
export function runner({ w = .9, d = 4, color = 0x9a3b2a } = {}) {
  const g = new THREE.Group(), m = pbr('ph/poly_wool_herringbone', { map: 'neutral', tint: color, rep: [w * 2, d * 2], normal: 1.2 });
  const b = pbr('ph/poly_wool_herringbone', { map: 'neutral', tint: 0xe9dcc2, rep: [w * 2, d * 2], normal: 1.2 });
  add(new THREE.BoxGeometry(w, .01, d), b, 0, .005, 0, g).receiveShadow = true; add(new THREE.BoxGeometry(w - .12, .012, d - .12), m, 0, .006, 0, g).receiveShadow = true;
  return g;
}

// ---------- tables, storage ----------
export function coffeeTable({ w = 1.1, d = .6, h = .42 } = {}) {
  const g = new THREE.Group();
  rb(w, .045, d, wood([1, .6]), 0, h - .022, 0, g, .015);
  rb(w - .1, .025, d - .1, wood([1, .6]), 0, .14, 0, g, .01);                    // lower shelf
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) rb(.04, h - .045, .04, legMat(), x * (w / 2 - .06), (h - .045) / 2, z * (d / 2 - .06), g, .008);
  const b = books({ n: 3, seed: 4 }); b.position.set(-.25, .155, 0); b.rotation.y = .3; g.add(b);
  const v = vase({ color: 0x2f9e9a, h: .16 }); v.position.set(.3, h, -.05); g.add(v);
  const tray = rb(.3, .02, .2, paint(0x25486e, .5), -.12, h + .01, .08, g, .008); void tray;
  return g;
}
export function sideTable({ r = .24, h = .55 } = {}) {
  const g = new THREE.Group();
  add(cyl(r, r, .035, 32), wood([.5, .5]), 0, h - .017, 0, g);
  add(cyl(.02, .02, h - .04, 10), brass(), 0, (h - .04) / 2, 0, g); add(cyl(r * .7, r * .75, .02, 32), brass(), 0, .01, 0, g);
  return g;
}
export function tvConsole({ w = 1.9, h = .5, d = .42 } = {}) {
  const g = new THREE.Group(), body = paint(0xf4efe6, .55);
  rb(w, h - .08, d, body, 0, .08 + (h - .08) / 2, 0, g, .02);
  rb(w + .02, .035, d + .02, wood([1.6, .4]), 0, h + .017, 0, g, .01);            // oak top
  for (let i = 0; i < 3; i++) { const x = -w / 2 + w * (i + .5) / 3; rb(w / 3 - .03, h - .16, .015, i === 1 ? wood([.6, .4]) : body, x, .08 + (h - .08) / 2, d / 2 + .004, g, .006); rb(.12, .015, .02, brass(), x, h - .12, d / 2 + .02, g, .004); }
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(cyl(.02, .014, .08, 10), legMat(), x * (w / 2 - .08), .04, z * (d / 2 - .07), g);
  rb(.9, .06, .09, paint(0x23252a, .4), 0, h + .065, .06, g, .02);                // soundbar
  return g;
}
export function bookshelfHome({ w = .9, h = 1.7, d = .32, seed = 5 } = {}) {
  const g = new THREE.Group(), body = wood([.6, 1.2], Math.PI / 2), R = rng(seed), n = 4;
  rb(w, .03, d, body, 0, h, 0, g, .01); rb(w, .06, d, body, 0, .03, 0, g, .01);
  for (const s of [-1, 1]) rb(.025, h, d, body, s * (w / 2 - .012), h / 2, 0, g, .006);
  rb(w, h, .015, once('shelfBack', () => pbr('ph/beige_wall_001', { map: 'neutral', tint: 0x2f9e9a, rep: [.6, 1] })), 0, h / 2, -d / 2 + .008, g, .004);
  for (let i = 1; i < n; i++) rb(w - .05, .025, d - .02, body, 0, h * i / n, 0, g, .005);
  return g;
}
export function books({ n = 5, seed = 1, lean = false } = {}) {
  const g = new THREE.Group(), R = rng(seed), C = [0xe2683f, 0x25486e, 0xffd24a, 0x2f9e9a, 0xf6efe0, 0x8e3b5c, 0x3a8a4a];
  let x = 0; for (let i = 0; i < n; i++) { const t = .025 + R() * .025, hh = .17 + R() * .08; const b = rb(t, hh, .16 + R() * .04, paint(C[Math.floor(R() * C.length)], .7), x + t / 2, hh / 2, 0, g, .004); if (lean && i === n - 1) { b.rotation.z = -.3; b.position.x += .03; } x += t + .002; }
  return g;
}
export function vase({ color = 0x2f9e9a, h = .22 } = {}) {
  const pts = [[0, 0], [.05, 0], [.07, h * .3], [.06, h * .7], [.035, h * .9], [.04, h]].map(([x, y]) => new THREE.Vector2(x * h / .22, y));
  const g = new THREE.Group(); add(new THREE.LatheGeometry(pts, 24), once('vase' + color, () => M(color, { roughness: .25 })), 0, 0, 0, g); return g;
}
export function coatRack() {
  const g = new THREE.Group(); rb(.7, .1, .03, wood([.6, .2]), 0, 1.65, 0, g, .01);
  [-.25, 0, .25].forEach((x, i) => { add(cyl(.012, .012, .08, 8), brass(), x, 1.65, .05, g).rotation.x = Math.PI / 2;
    if (i < 2) { const c = rb(.34, .62, .1, fabric([0x25486e, 0xe8b02e][i], [1, 1]), x, 1.3, .1, g, .04); c.rotation.z = i ? .05 : -.04; } });
  return g;
}

// ---------- TV: glossy black when off; on() lights the picture (emissive) + a soft glow light in front ----------
export function tv({ w = 1.3, h = .75 } = {}) {
  const g = new THREE.Group();
  rb(w, h, .05, M(0x15161a, { roughness: .35 }), 0, 0, 0, g, .012);
  rb(w * .5, h * .5, .06, M(0x1c1d22, { roughness: .6 }), 0, 0, -.045, g, .01);   // wall-mount box
  const pic = canvasTex(1024, Math.round(1024 * h / w), drawShow);
  const scr = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: .12, metalness: .1, emissive: 0xffffff, emissiveMap: pic, emissiveIntensity: 0 });
  const s = add(new THREE.PlaneGeometry(w - .03, h - .03), scr, 0, 0, .0255, g, { shadow: false });
  const led = add(sph(.005), new THREE.MeshBasicMaterial({ color: 0xff2a2a }), w * .42, -h / 2 + .006, .027, g, { shadow: false });
  const glow = new THREE.PointLight(0x9fc8ff, 0, 3.5, 2); glow.position.set(0, 0, .6); g.add(glow);
  const set = k => { k = Math.max(0, Math.min(1, k)); scr.emissiveIntensity = 1.25 * k; scr.roughness = k > .02 ? .45 : .12; scr.color.setHex(k > .02 ? 0x111214 : 0x050608); glow.intensity = 1.4 * k; led.visible = k < .02; };
  set(0);
  return { group: g, screen: s, set, on: () => set(1), off: () => set(0) };
}
function drawShow(x, W, H) {   // a bright cartoon on screen: sky, sun, hills, a little red car, our own design
  const sk = x.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#3d8ff0'); sk.addColorStop(1, '#bfe4ff'); x.fillStyle = sk; x.fillRect(0, 0, W, H);
  x.fillStyle = '#ffd84a'; x.beginPath(); x.arc(W * .82, H * .2, H * .11, 0, 7); x.fill();
  x.fillStyle = '#fff'; for (const [cx, cy, s] of [[.2, .18, 1], [.5, .12, .8]]) for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(W * cx + i * H * .06 * s, H * cy + (i % 2) * H * .02, H * .05 * s, 0, 7); x.fill(); }
  x.fillStyle = '#5cbf4a'; x.beginPath(); x.ellipse(W * .25, H * .95, W * .45, H * .42, 0, 0, 7); x.fill();
  x.fillStyle = '#3fa63a'; x.beginPath(); x.ellipse(W * .8, H * 1.0, W * .5, H * .45, 0, 0, 7); x.fill();
  x.fillStyle = '#7a7f88'; x.fillRect(0, H * .8, W, H * .08); x.fillStyle = '#fff'; for (let i = 0; i < 8; i++) x.fillRect(W * (i / 8 + .02), H * .835, W * .05, H * .01);
  const cx = W * .42, cy = H * .78; x.fillStyle = '#e8352f'; x.beginPath(); x.roundRect(cx - W * .1, cy - H * .07, W * .2, H * .07, H * .02); x.fill(); x.beginPath(); x.roundRect(cx - W * .055, cy - H * .12, W * .1, H * .06, H * .02); x.fill();
  x.fillStyle = '#bfe4ff'; x.fillRect(cx - W * .045, cy - H * .11, W * .035, H * .04); x.fillRect(cx + W * .0, cy - H * .11, W * .035, H * .04);
  x.fillStyle = '#222'; for (const s of [-1, 1]) { x.beginPath(); x.arc(cx + s * W * .06, cy, H * .03, 0, 7); x.fill(); }
}

// ---------- the remote: dark body, rubber buttons, red power key, IR window at the front tip (+z) ----------
export function remote() {
  const g = new THREE.Group(), L = .17;
  rb(.048, .018, L, M(0x2a2c31, { roughness: .45 }), 0, 0, 0, g, .008);
  rb(.03, .006, .012, M(0x5a1010, { roughness: .2 }), 0, .001, L / 2 - .002, g, .002);   // IR window
  add(cyl(.007, .007, .006, 12), M(0xe8352f, { roughness: .4 }), .012, .011, L / 2 - .025, g);   // power
  const key = M(0x8a8f98, { roughness: .6 });
  for (let r = 0; r < 4; r++) for (let c = -1; c <= 1; c++) add(cyl(.0045, .0045, .005, 10), key, c * .012, .011, L / 2 - .06 - r * .016, g);
  add(new THREE.TorusGeometry(.009, .003, 8, 20), key, 0, .011, -.02, g).rotation.x = Math.PI / 2;
  g.userData.tip = new THREE.Vector3(0, 0, L / 2);
  return g;
}

const lampShade = c => { const m = pbr('ph/quatrefoil_jacquard_fabric', { map: 'neutral', tint: c, rep: [3, 1], normal: .8, side: THREE.DoubleSide }); m.emissive.setHex(0xffd9a0); m.emissiveIntensity = .3; return m; };   // linen-like weave
// ---------- lamps: return { group, light } so the set can zero / dim each one ----------
export function floorLamp({ h = 1.55, shade = 0xf6efe0 } = {}) {
  const g = new THREE.Group();
  add(cyl(.16, .17, .025, 32), legMat(), 0, .012, 0, g); add(cyl(.012, .012, h, 10), brass(), 0, h / 2, 0, g);
  const sm = lampShade(shade);
  add(new THREE.CylinderGeometry(.17, .23, .3, 32, 1, true), sm, 0, h + .05, 0, g);
  const light = new THREE.PointLight(0xffd6a0, 1.6, 4.5, 1.8); light.position.set(0, h - .02, 0); g.add(light);
  return { group: g, light };
}
export function tableLamp({ base = 0x2f9e9a, shade = 0xf6efe0 } = {}) {
  const g = new THREE.Group();
  add(new THREE.LatheGeometry([[0, 0], [.07, 0], [.1, .08], [.085, .2], [.03, .26], [.03, .3]].map(([x, y]) => new THREE.Vector2(x, y)), 24), M(base, { roughness: .25 }), 0, 0, 0, g);
  const sm = lampShade(shade);
  add(new THREE.CylinderGeometry(.11, .16, .2, 28, 1, true), sm, 0, .38, 0, g);
  const light = new THREE.PointLight(0xffd6a0, 1.0, 3.2, 1.8); light.position.set(0, .34, 0); g.add(light);
  return { group: g, light };
}

// ---------- framed art: thin frame, mat, canvas picture drawn by draw(ctx, W, H) ----------
export function frame({ w = .6, h = .8, color = 0x2a2c30, draw } = {}) {
  const g = new THREE.Group(), fm = paint(color, .4);
  rb(w, h, .03, fm, 0, 0, 0, g, .006);
  add(new THREE.PlaneGeometry(w - .05, h - .05), M(0xfbf8f2, { roughness: .9 }), 0, 0, .0155, g, { shadow: false });
  const art = canvasTex(512, Math.round(512 * h / w), draw || artAbstract);
  add(new THREE.PlaneGeometry(w - .14, h - .14), new THREE.MeshStandardMaterial({ map: art, roughness: .85 }), 0, 0, .016, g, { shadow: false });
  return g;
}
export function artAbstract(x, W, H) { x.fillStyle = '#f6efe0'; x.fillRect(0, 0, W, H); x.fillStyle = '#e2683f'; x.beginPath(); x.arc(W * .38, H * .4, W * .26, 0, 7); x.fill(); x.fillStyle = '#25486e'; x.fillRect(W * .45, H * .48, W * .4, H * .36); x.fillStyle = '#ffd24a'; x.beginPath(); x.moveTo(W * .1, H * .9); x.lineTo(W * .45, H * .55); x.lineTo(W * .7, H * .9); x.fill(); }
export function artSunset(x, W, H) { const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ff9a5a'); gr.addColorStop(.6, '#ffd27a'); gr.addColorStop(.6, '#2f9e9a'); gr.addColorStop(1, '#1f6f74'); x.fillStyle = gr; x.fillRect(0, 0, W, H); x.fillStyle = '#fff3c4'; x.beginPath(); x.arc(W / 2, H * .6, W * .18, Math.PI, 0); x.fill(); }
export function artLines(x, W, H) { x.fillStyle = '#fbf8f2'; x.fillRect(0, 0, W, H); x.lineWidth = W * .035; ['#25486e', '#e2683f', '#2f9e9a', '#ffd24a'].forEach((c, i) => { x.strokeStyle = c; x.beginPath(); x.arc(W * .5, H * .95, W * (.15 + i * .12), Math.PI, 0); x.stroke(); }); }
