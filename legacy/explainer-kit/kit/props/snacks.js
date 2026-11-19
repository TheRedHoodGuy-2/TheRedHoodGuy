// SNACKS + PHONE (headrush / low-iron video, 2026-10-23). Modelled shapes, not boxes: a puffy crimped chip bag (full or
// crushed empty), a soda can (lathe), a phone with a live screen, an open pizza box with grease stains + crumbs and a
// handwritten card, a pizza slice. Real-world metres. Fonts: kit/fonts/brand.woff2 (Bungee), hand.woff2 (Caveat), OFL.
import * as THREE from 'three';
import { M, add, grp, canvasTex, rng, rboxGeo } from '../util.js';
import { pending } from '../detail.js';

export const fontsReady = (async () => {
  for (const [fam, f] of [['Brand', 'brand.woff2'], ['Hand', 'hand.woff2']]) { const ff = new FontFace(fam, `url(${new URL('kit/fonts/' + f, document.baseURI).href})`); await ff.load(); document.fonts.add(ff); }
})(); pending.push(fontsReady);

// ---------- chip bag: a pillow of foil, crimped top + bottom seals, crinkles; empty = crushed + twisted ----------
const BAGS = [
  { name: 'CRUNCHOS', sub: 'FLAMIN HOT', bg: '#e8251f', bg2: '#ff8a1c', ink: '#ffe14a' },
  { name: 'SNAKZ', sub: 'SOUR CREAM', bg: '#1f6fe8', bg2: '#5fd1ff', ink: '#ffffff' },
  { name: 'CRUNCHOS', sub: 'CHEDDAR', bg: '#ffb21c', bg2: '#ffe14a', ink: '#c0161a' },
  { name: 'PUFFZ', sub: 'BBQ', bg: '#7a2ad6', bg2: '#e04fd8', ink: '#ffe14a' },
];
function bagLabel(k) {
  const B = BAGS[k % BAGS.length];
  return canvasTex(512, 768, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, B.bg2); gr.addColorStop(.5, B.bg); gr.addColorStop(1, B.bg2); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(-50 + i * 80, h); g.lineTo(60 + i * 80, 0); g.lineTo(90 + i * 80, 0); g.lineTo(-20 + i * 80, h); g.fill(); }   // foil shine bands
    g.textAlign = 'center'; g.save(); g.translate(w / 2, h * .42); g.rotate(-.12);
    g.font = '118px Brand'; g.lineWidth = 18; g.strokeStyle = '#1a1a1a'; g.strokeText(B.name, 0, 0); g.fillStyle = B.ink; g.fillText(B.name, 0, 0); g.restore();
    g.font = '58px Brand'; g.fillStyle = '#fff'; g.strokeStyle = '#1a1a1a'; g.lineWidth = 10; g.strokeText(B.sub, w / 2, h * .58); g.fillText(B.sub, w / 2, h * .58);
    // chips pile drawing
    for (let i = 0; i < 7; i++) { const x = w / 2 - 150 + i * 50, y = h * .76 + (i % 2) * 18; g.fillStyle = '#f2b33a'; g.strokeStyle = '#a8681a'; g.lineWidth = 5; g.beginPath(); g.ellipse(x, y, 52, 34, (i - 3) * .3, 0, 7); g.fill(); g.stroke(); g.fillStyle = 'rgba(214,60,20,.55)'; for (let j = 0; j < 5; j++) { g.beginPath(); g.arc(x - 25 + j * 12, y - 6 + (j % 2) * 10, 4, 0, 7); g.fill(); } }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 0, w, 50); g.fillRect(0, h - 50, w, 50);   // seal bands
  });
}
export function chipBag({ kind = 0, empty = false, seed = 1, w = .2, h = .28 } = {}) {
  const R = rng(seed), nu = 28, nv = 40, geo = new THREE.PlaneGeometry(w, h, nu, nv), P = geo.attributes.position, back = geo.clone();
  const shape = (geoX, front) => { const p = geoX.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), u = x / w + .5, v = y / h + .5;
      const seal = Math.min(1, Math.min(v, 1 - v) / .09), puff = (empty ? .012 : .045) * Math.pow(Math.max(0, Math.sin(Math.PI * u)), .7) * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (v - .07) / .86)))), .6);
      let z = puff * seal, yy = y, xx = x;
      if (seal < 1) { xx += (Math.floor(u * 22) % 2 ? .002 : -.002) * (1 - seal); }                                   // crimp zigzag
      xx *= 1 - .08 * Math.sin(Math.PI * v) * (empty ? 2 : 1); yy *= empty ? .82 : 1;                                       // waist pulled in when puffed
      z += (R() - .5) * (empty ? .003 : .0008) + Math.sin(u * 19 + v * 13) * (empty ? .006 : .0012);                          // crinkles
      if (empty) { const tw = (v - .5) * .5; const c = Math.cos(tw), s = Math.sin(tw); const x2 = xx * c, z2 = xx * s; xx = x2; z = z + z2 * .3; }
      p.setXYZ(i, xx, yy, front ? z : -z); } p.needsUpdate = true; geoX.computeVertexNormals(); };
  shape(geo, true); shape(back, false); { const idx = back.index.array; for (let i = 0; i < idx.length; i += 3) { const t = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = t; } back.computeVertexNormals(); }
  const lab = bagLabel(kind), foil = { roughness: .38, metalness: .15, side: THREE.DoubleSide };
  const g = new THREE.Group(); add(geo, M(0xffffff, { map: lab, ...foil, unique: true }), 0, 0, 0, g); add(back, M(0xffffff, { map: lab, ...foil, unique: true }), 0, 0, 0, g);
  g.userData.kind = 'chipBag'; return g;
}

// ---------- soda can (lathe), crushed option ----------
export function sodaCan({ color = '#d81f26', label = 'COLA', crushed = 0 } = {}) {
  const pts = [[0, 0], [.026, 0], [.031, .006], [.033, .014], [.033, .108], [.029, .118], [.027, .122], [.0265, .124], [0, .124]].map(([r, y]) => new THREE.Vector2(r, y));
  const geo = new THREE.LatheGeometry(pts, 40), tex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = '92px Brand'; g.textAlign = 'center'; g.fillText(label, w / 2, h * .62); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, h * .78, w, 10); });
  if (crushed) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), x = p.getX(i), z = p.getZ(i), k = 1 - crushed * .45 * Math.sin(Math.PI * y / .124) * (.6 + .4 * Math.sin(Math.atan2(z, x) * 5)); p.setXYZ(i, x * k, y * (1 - crushed * .25), z * k); } geo.computeVertexNormals(); }
  const g = new THREE.Group(); add(geo, M(0xffffff, { map: tex, roughness: .25, metalness: .6, unique: true }), 0, 0, 0, g); return g;
}

// ---------- phone: rounded slab, glass, live canvas screen (draw(g, w, h) each frame you call phone.screen(fn)) ----------
export function phone() {
  const g = new THREE.Group(), body = add(rboxGeo(.074, .156, .009, .009), M(0x1c1d22, { roughness: .35, metalness: .4 }), 0, 0, 0, g);
  const cam = add(rboxGeo(.03, .03, .003, .006), M(0x2a2b30, { roughness: .3 }), -.017, .055, -.006, g); for (const [x, y] of [[-.024, .062], [-.012, .062], [-.024, .05]]) { const l = add(new THREE.CylinderGeometry(.0045, .0045, .003, 20), M(0x0a0a0c, { roughness: .1, metalness: .5 }), x + .007, y - .007, -.008, g); l.rotation.x = Math.PI / 2; }
  const c = document.createElement('canvas'); c.width = 360; c.height = 760; const ctx = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const scr = add(new THREE.PlaneGeometry(.068, .148), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), 0, 0, .0047, g, { shadow: false });
  const glow = new THREE.PointLight(0x9fc4ff, 0, .8, 2); glow.position.set(0, 0, .12); g.add(glow);
  let last = null;
  return { group: g, screenMesh: scr, glow, screen(draw, key) { if (key != null && key === last) return; last = key; draw(ctx, c.width, c.height); tex.needsUpdate = true; } };
}
// a doomscroll feed: posts sliding up at `scroll` px, optional DoorDash banner sliding down (bannerT 0..1)
// the feed he is "doomscrolling": CORNHUB (Xavier 2026-10-23: the comedic corn parody of a certain orange-and-black site).
// Black page, "Corn" + orange "hub" logo, corn-on-the-cob video thumbnails with durations and corny titles. `scroll` px,
// optional DoorDash banner sliding down (bannerT 0..1).
const CORN_TITLES = ['Fresh corn gets SHUCKED', 'Hot buttered cob (4K)', 'Farmer catches corn in the field', 'Popcorn POV: the pop', 'Sweet corn, extra kernels', 'Corn on the cob, no butter', 'Step-corn stuck in the husk', 'Grilled corn compilation', 'Baby corn first time', 'Creamed corn ASMR'];
function cornThumb(g, x, y, w, h, k) {
  const sky = g.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, ['#3a6b2f', '#5a8f3a', '#2f5a28', '#6a9a3c'][k % 4]); sky.addColorStop(1, '#1d3318'); g.fillStyle = sky; g.fillRect(x, y, w, h);
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(-.5 + (k % 3) * .4);
  g.fillStyle = '#6cae3a'; g.beginPath(); g.ellipse(-w * .05, 0, w * .36, h * .22, .25, 0, 7); g.fill(); g.beginPath(); g.ellipse(w * .05, 0, w * .36, h * .22, -.25, 0, 7); g.fill();   // husk
  g.fillStyle = '#f2c230'; g.beginPath(); g.ellipse(0, 0, w * .3, h * .15, 0, 0, 7); g.fill();
  g.fillStyle = '#ffd95a'; for (let i = -6; i <= 6; i++) for (let j = -2; j <= 2; j++) { g.beginPath(); g.ellipse(i * w * .042, j * h * .052, w * .017, h * .022, 0, 0, 7); g.fill(); }   // kernels
  if (k % 2) { g.fillStyle = 'rgba(255,240,170,.85)'; g.beginPath(); g.ellipse(-w * .05, -h * .06, w * .1, h * .03, .2, 0, 7); g.fill(); }   // butter
  g.restore();
  g.fillStyle = 'rgba(0,0,0,.75)'; g.fillRect(x + w - 62, y + h - 30, 54, 22); g.fillStyle = '#fff'; g.font = 'bold 16px sans-serif'; g.fillText(`${8 + k % 13}:${String(10 + (k * 17) % 50)}`, x + w - 56, y + h - 13);
  g.fillStyle = '#ff9000'; g.fillRect(x, y + h - 5, w * (.2 + (k % 5) * .15), 5);   // watched bar
}
export function drawFeed(g, w, h, scroll = 0, bannerT = 0) {
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  const post = 286, off = scroll % post, first = Math.floor(scroll / post), top = 104;
  for (let i = -1; i < 4; i++) { const y = top + i * post - off, k = Math.abs(first + i);
    cornThumb(g, 10, y, w - 20, 190, k);
    g.fillStyle = '#fff'; g.font = 'bold 21px sans-serif'; g.fillText(CORN_TITLES[k % CORN_TITLES.length], 12, y + 222);
    g.fillStyle = '#9a9a9a'; g.font = '17px sans-serif'; g.fillText(`${(k * 37) % 900 + 100}K views · ${70 + k % 29}% 👍  🌽 CornStar${k % 9}`, 12, y + 248); }
  // header: Corn[hub]
  g.fillStyle = '#000'; g.fillRect(0, 0, w, top - 8); g.fillStyle = '#fff'; g.font = 'bold 20px sans-serif'; g.fillText('3:47', 18, 26); g.fillText('🔋 4%', w - 82, 26);
  g.font = 'bold 44px sans-serif'; const cw = g.measureText('Corn').width, x0 = (w - cw - 98) / 2;
  g.fillStyle = '#fff'; g.fillText('Corn', x0, 82); g.fillStyle = '#ff9000'; roundRect(g, x0 + cw + 6, 46, 92, 48, 8); g.fill(); g.fillStyle = '#000'; g.fillText('hub', x0 + cw + 12, 83);
  if (bannerT > 0) { const y = -150 + 170 * Math.min(1, bannerT);
    g.fillStyle = 'rgba(245,246,250,.97)'; roundRect(g, 12, y, w - 24, 130, 22); g.fill();
    g.fillStyle = '#ff3008'; roundRect(g, 26, y + 22, 54, 54, 12); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 34px sans-serif'; g.fillText('D', 42, y + 61);
    g.fillStyle = '#1a1a1a'; g.font = 'bold 26px sans-serif'; g.fillText('DoorDash', 94, y + 46); g.fillStyle = '#333'; g.font = '23px sans-serif'; g.fillText('Your order has arrived 🍕', 94, y + 80); g.fillStyle = '#777'; g.font = '19px sans-serif'; g.fillText('Left at your door · now', 94, y + 108); }
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// ---------- pizza box: open lid, grease stains, crumbs inside (empty), handwritten card on top ----------
export function pizzaBox({ open = 1.9, empty = true, card = 'I.O.U ♥\nSis' } = {}) {
  const W = .4, H = .045, g = new THREE.Group();
  const card1 = M(0xc79a63, { roughness: .9 }), inside = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#d6ad74'; c.fillRect(0, 0, w, h); const R = rng(3);
    for (let i = 0; i < 14; i++) { const x = 80 + R() * 350, y = 80 + R() * 350, r = 20 + R() * 55; const gr = c.createRadialGradient(x, y, 2, x, y, r); gr.addColorStop(0, 'rgba(150,90,20,.55)'); gr.addColorStop(.7, 'rgba(160,100,30,.3)'); gr.addColorStop(1, 'rgba(160,100,30,0)'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }   // oil
    c.strokeStyle = 'rgba(120,70,20,.35)'; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, h / 2, 210, 0, 7); c.stroke();            // ring where the pizza sat
  });
  const base = new THREE.Group(); g.add(base);
  add(new THREE.BoxGeometry(W, .004, W), M(0xffffff, { map: inside, roughness: .9, unique: true }), 0, .002, 0, base);
  for (const [x, z, sx, sz] of [[0, -W / 2, W, .004], [0, W / 2, W, .004], [-W / 2, 0, .004, W], [W / 2, 0, .004, W]]) add(new THREE.BoxGeometry(sx, H, sz), card1, x, H / 2, z, base);
  const lidPivot = grp(0, H, -W / 2, g), lidTex = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#d9b27a'; c.fillRect(0, 0, w, h); c.fillStyle = '#c0161a'; c.font = '74px Brand'; c.textAlign = 'center'; c.fillText('PIZZA', w / 2, h * .48); c.font = '40px Brand'; c.fillText('HOT & FRESH', w / 2, h * .62); c.strokeStyle = '#c0161a'; c.lineWidth = 10; c.strokeRect(40, 40, w - 80, h - 80); });
  const lid = add(new THREE.BoxGeometry(W, .004, W), [card1, card1, M(0xffffff, { map: lidTex, roughness: .9, unique: true }), M(0xffffff, { map: inside, roughness: .9, unique: true }), card1, card1], 0, 0, W / 2, lidPivot); lidPivot.rotation.x = -open;
  if (empty) { const R = rng(9), cm = [M(0xd9a24e, { roughness: .9 }), M(0xb3742c, { roughness: .9 }), M(0xe8c27a, { roughness: .9 })];
    for (let i = 0; i < 46; i++) { const s = .004 + R() * .009, m = add(new THREE.DodecahedronGeometry(s, 0), cm[i % 3], (R() - .5) * W * .8, .006 + s * .4, (R() - .5) * W * .8, base); m.rotation.set(R() * 3, R() * 3, R() * 3); m.scale.y = .6; }
    const crust = add(new THREE.TorusGeometry(.05, .012, 10, 18, 2.1), M(0xd49a4e, { roughness: .85 }), .06, .016, .05, base); crust.rotation.x = Math.PI / 2; }
  // the card: folded tent on the box, handwritten
  if (card) { const ct = canvasTex(512, 320, (c, w, h) => { c.fillStyle = '#fbf7ee'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(80,120,200,.35)'; c.lineWidth = 3; for (let y = 70; y < h; y += 52) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      c.fillStyle = '#1f2a6b'; c.font = '120px Hand'; c.textAlign = 'center'; const L = card.split('\n'); L.forEach((l, i) => c.fillText(l, w / 2 + (i ? 30 : 0), 130 + i * 120)); c.strokeStyle = '#d0183c'; });
    const cardG = grp(-.02, H + .002, .05, g); const cm = add(new THREE.BoxGeometry(.16, .002, .1), [M(0xfbf7ee), M(0xfbf7ee), M(0xffffff, { map: ct, roughness: .95, unique: true }), M(0xfbf7ee), M(0xfbf7ee), M(0xfbf7ee)], 0, .001, 0, cardG); cardG.rotation.y = .35; g.userData.card = cardG; }
  g.userData.lid = lidPivot; return g;
}

// ---------- pizza slice (held): wedge with crust, cheese + pepperoni ----------
export function pizzaSlice({ bite = .3 } = {}) {
  const g = new THREE.Group(), L = .17, A = .55, sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(Math.sin(A / 2) * L, Math.cos(A / 2) * L); sh.absarc(0, 0, L, Math.PI / 2 - A / 2, Math.PI / 2 + A / 2, false); sh.lineTo(0, 0);
  if (bite) { const hole = new THREE.Path(); hole.absarc(0, -.005, .04 + bite * .03, 0, Math.PI * 2, false); sh.holes.push(hole); }
  const top = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#f5c242'; c.fillRect(0, 0, w, h); const R = rng(2); for (let i = 0; i < 8; i++) { c.fillStyle = '#b8261d'; c.beginPath(); c.arc(R() * w, R() * h, 14 + R() * 6, 0, 7); c.fill(); } c.fillStyle = 'rgba(255,240,180,.5)'; for (let i = 0; i < 40; i++) c.fillRect(R() * w, R() * h, 6, 3); });
  const geo = new THREE.ExtrudeGeometry(sh, { depth: .008, bevelEnabled: true, bevelSize: .002, bevelThickness: .002, bevelSegments: 2 }); geo.rotateX(-Math.PI / 2);
  { const p = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / .2 + .5, p.getZ(i) / .2 + .5); }
  add(geo, [M(0xffffff, { map: top, roughness: .55, unique: true }), M(0xd49a4e, { roughness: .8 })], 0, 0, 0, g);
  const crust = add(new THREE.TorusGeometry(L, .011, 10, 24, A), M(0xd49a4e, { roughness: .8 }), 0, .006, 0, g); crust.rotation.set(Math.PI / 2, 0, Math.PI / 2 - A / 2); crust.rotation.order = 'XYZ';
  return g;
}
