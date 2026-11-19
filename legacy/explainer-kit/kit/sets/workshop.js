// The house-cutaway workshop set (reusable). Same house, soil, yard and lights as the bathroom; workbench interior.
// refs.bench = bench-top centre, refs.yard = open lawn spot beside the house.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, sph, canvasTex, rng, rboxGeo } from '../util.js';

export const FLOOR = 0.26, BACK = -3.5, LEFT = -3.3, CEIL = 3.6, BENCH = FLOOR + .9;

export function buildWorld(scene) {
  const R = rng(21);
  const W = grp(0, 0, 0, scene);
  const refs = {};

  // ---------- sky ----------
  scene.background = canvasTex(512, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5b93cc'); gr.addColorStop(.6, '#a8cbe9'); gr.addColorStop(1, '#e6f0f8');
    g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(3);
    for (let c = 0; c < 10; c++) { const cx = r() * w, cy = 60 + r() * h * .45, s = 40 + r() * 70; for (let i = 0; i < 16; i++) { const x = cx + (r() - .5) * s * 2.6, y = cy + (r() - .5) * s * .5, rad = s * (.35 + r() * .45); const rg = g.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, 'rgba(255,255,255,.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); } }
  });
  scene.fog = new THREE.Fog(0xd8e7f3, 40, 130);

  // ---------- ground + soil cutaway ----------
  const soilTex = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#8c5b36'; g.fillRect(0, 0, w, h); const r = rng(11);
    for (let i = 0; i < 5000; i++) { g.fillStyle = r() < .5 ? `rgba(60,35,18,${.08 + r() * .14})` : `rgba(196,138,86,${.06 + r() * .12})`; g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 9, 2 + r() * 6, r() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 90; i++) { let x = r() * w, y = r() * h * .25; g.strokeStyle = `rgba(55,30,14,${.35 + r() * .35})`; g.lineWidth = 1 + r() * 2.5; g.beginPath(); g.moveTo(x, y); const L = 60 + r() * 300; for (let s = 0; s < L; s += 8) { x += (r() - .5) * 8; y += 8; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 40; i++) { const x = r() * w, y = h * .2 + r() * h * .8, s = 5 + r() * 14; g.fillStyle = `rgba(120,110,100,${.5 + r() * .3})`; g.beginPath(); g.ellipse(x, y, s, s * .7, r() * 3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.ellipse(x - s * .25, y - s * .25, s * .4, s * .25, 0, 0, 7); g.fill(); }
    const tg = g.createLinearGradient(0, 0, 0, 50); tg.addColorStop(0, 'rgba(45,28,14,.9)'); tg.addColorStop(1, 'rgba(45,28,14,0)'); g.fillStyle = tg; g.fillRect(0, 0, w, 50);
  }, [5, 1.3]);
  const soilFace = new THREE.MeshStandardMaterial({ map: soilTex, roughness: 1 });
  const soil = new THREE.Mesh(new THREE.BoxGeometry(80, 14, 70), [soilFace, soilFace, M(0x6b4a2c), M(0x6b4a2c), soilFace, soilFace]);
  soil.position.set(0, -7.02, 1.6 - 35); soil.receiveShadow = true; W.add(soil);
  const lawnTex = canvasTex(512, 512, (g, w, h) => { const r = rng(5); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#5d9c3a' : '#6aab44'; g.fillRect(i * w / 8, 0, w / 8, h); } for (let i = 0; i < 12000; i++) { g.fillStyle = r() < .5 ? 'rgba(35,75,20,.25)' : 'rgba(160,210,95,.22)'; g.fillRect(r() * w, r() * h, 1.5, 3.5); } }, [26, 22]);
  const lawn = add(new THREE.PlaneGeometry(80, 70), new THREE.MeshStandardMaterial({ map: lawnTex, roughness: .95 }), 0, 0, 1.6 - 35, W); lawn.rotation.x = -Math.PI / 2;
  const far = add(new THREE.PlaneGeometry(500, 250), M(0x82b65c), 0, -.05, -170, W, { shadow: false }); far.rotation.x = -Math.PI / 2;

  // ---------- house shell ----------
  const wallPaint = M(0xf3eee6, { roughness: .9 }), siding = M(0xd9c29a, { roughness: .85 }), trimW = M(0xffffff, { roughness: .5 });
  rb(7.4, 1.3, 5.62, M(0x9e9a91), 0, -.52, -1.2, W, .02);   // 1cm proud of the soil face (coplanar = z-fighting grid)                    // foundation in soil
  rb(7.4, .25, 5.6, M(0xbab6ad), 0, .125, -1.2, W, .02);                     // slab
  const floorTex = canvasTex(512, 512, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#b9b6b0' : '#c4c1bb'; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, [4, 3.4]);
  const fl = add(new THREE.PlaneGeometry(6.9, 5.2), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .55 }), 0, FLOOR, -1.0, W, { shadow: false }); fl.rotation.x = -Math.PI / 2;
  rb(7.0, CEIL - FLOOR, .3, wallPaint, 0, (CEIL + FLOOR) / 2, BACK - .15, W, .01);
  rb(.3, CEIL - FLOOR, 5.3, wallPaint, LEFT - .15, (CEIL + FLOOR) / 2, -1.0, W, .01);
  rb(.06, CEIL + .02, 5.32, siding, LEFT - .33, CEIL / 2, -1.0, W, .01);
  for (let y = .6; y < CEIL; y += .32) rb(.03, .03, 5.32, M(0xc2a97f), LEFT - .37, y, -1.0, W, .01, { shadow: false });
  rb(7.0, .14, 5.3, M(0xf7f5f0), 0, CEIL + .07, -1.0, W, .01);                 // ceiling slab (cut)
  rb(7.0, .06, .06, trimW, 0, FLOOR + .06, BACK + .03, W, .01, { shadow: false });   // baseboard
  // roof
  const roofTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#a5472b'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, y, w, 4); for (let x = (y / 32 % 2) * 24; x < w; x += 48) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, y, 3, 32); } } }, [3, 5]);
  const roofM = new THREE.MeshStandardMaterial({ map: roofTex, roughness: .8 });
  for (const s of [-1, 1]) { const r = rb(4.7, .2, 6.3, roofM, s * 1.85, CEIL + 1.15, -.8, W, .03); r.rotation.z = -s * .55; }
  rb(.7, 2.0, .7, M(0x8a3f2c), -2.3, CEIL + 1.6, -2.4, W, .03); rb(.8, .12, .8, M(0x6c3324), -2.3, CEIL + 2.62, -2.4, W, .02);
  // gable infill inside roof (attic cut)
  const gab = new THREE.Shape(); gab.moveTo(-3.6, 0); gab.lineTo(3.6, 0); gab.lineTo(0, 2.1); gab.lineTo(-3.6, 0);
  add(new THREE.ShapeGeometry(gab), M(0x5a3c2c, { side: THREE.DoubleSide }), 0, CEIL + .14, BACK - .1, W);

  // ---------- workshop: walls, pegboard, window ----------
  const lowerWall = M(0x9fb7c4, { roughness: .85 }), upperWall = M(0xeee6d6, { roughness: .9 });
  add(new THREE.PlaneGeometry(6.6, 1.1), lowerWall, 0, FLOOR + .55, BACK + .005, W, { shadow: false });
  const lw = add(new THREE.PlaneGeometry(5.1, 1.1), lowerWall, LEFT + .005, FLOOR + .55, -1.0, W, { shadow: false }); lw.rotation.y = Math.PI / 2;
  add(new THREE.PlaneGeometry(6.6, CEIL - FLOOR - 1.1), upperWall, 0, (CEIL + FLOOR + 1.1) / 2, BACK + .004, W, { shadow: false });
  const uw = add(new THREE.PlaneGeometry(5.1, CEIL - FLOOR - 1.1), upperWall, LEFT + .004, (CEIL + FLOOR + 1.1) / 2, -1.0, W, { shadow: false }); uw.rotation.y = Math.PI / 2;
  rb(6.6, .05, .03, M(0x7a5a3c), 0, FLOOR + 1.11, BACK + .02, W, .01, { shadow: false });
  rb(.03, .05, 5.1, M(0x7a5a3c), LEFT + .02, FLOOR + 1.11, -1.0, W, .01, { shadow: false });
  // pegboard with tools
  const pegTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#c99a62'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(70,45,20,.55)'; for (let y = 10; y < h; y += 18) for (let x = 10; x < w; x += 18) { g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); } });
  add(new THREE.PlaneGeometry(2.4, 1.1), new THREE.MeshStandardMaterial({ map: pegTex, roughness: .8 }), -.1, 2.15, BACK + .02, W, { shadow: false });
  rb(2.48, 1.18, .02, M(0x8a6340), -.1, 2.15, BACK + .01, W, .01, { shadow: false });
  const steel = M(0xb9c1c8, { metalness: .85, roughness: .3 }), handleR = M(0xd8453c, { roughness: .4 }), handleY = M(0xf2c14e, { roughness: .4 }), handleB = M(0x3a8ee6, { roughness: .4 });
  for (let i = 0; i < 4; i++) { const x = -1.0 + i * .14; rb(.035, .16, .035, [handleR, handleY, handleB, handleR][i], x, 2.3, BACK + .06, W, .012); add(cyl(.008, .008, .16, 8), steel, x, 2.14, BACK + .06, W); }
  { const h = grp(-.25, 2.2, BACK + .06, W); rb(.04, .32, .04, M(0x8a5a3c), 0, 0, 0, h, .015); rb(.2, .06, .06, steel, 0, .17, 0, h, .015); }
  { const s = grp(.15, 2.2, BACK + .06, W); s.rotation.z = .4; rb(.03, .34, .015, steel, 0, 0, 0, s, .006); add(cyl(.04, .04, .015, 20), steel, 0, .17, 0, s).rotation.x = Math.PI / 2; add(cyl(.04, .04, .015, 20), steel, 0, -.17, 0, s).rotation.x = Math.PI / 2; }
  for (let i = 0; i < 3; i++) add(new THREE.TorusGeometry(.07 + i * .02, .012, 8, 30), M([0xe8865a, 0x3fbf6a, 0x2f6fa8][i], { roughness: .5 }), .65, 2.45 - i * .02, BACK + .05, W);
  rb(.32, .22, .1, M(0xd8453c, { roughness: .45 }), .65, 1.9, BACK + .08, W, .02);
  // window right of the pegboard
  const view = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fc0ea'); gr.addColorStop(.62, '#d6ebf8'); gr.addColorStop(.62, '#7db75a'); gr.addColorStop(1, '#5e9a40'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(9); for (let i = 0; i < 7; i++) { const x = r() * w, y = h * .58; g.fillStyle = ['#4f8a35', '#5d9b3e', '#3f7a2f'][i % 3]; g.beginPath(); g.arc(x, y - 30, 26 + r() * 20, 0, 7); g.fill(); } });
  add(new THREE.PlaneGeometry(1.0, .85), new THREE.MeshStandardMaterial({ map: view, emissive: 0xffffff, emissiveMap: view, emissiveIntensity: .55, roughness: .2 }), 2.15, 2.2, BACK + .01, W, { shadow: false });
  for (const [w, h, x, y] of [[1.16, .07, 2.15, 2.655], [1.16, .07, 2.15, 1.745], [.07, .9, 1.58, 2.2], [.07, .9, 2.72, 2.2], [.04, .85, 2.15, 2.2]]) rb(w, h, .07, trimW, x, y, BACK + .04, W, .015);
  // ---------- the workbench ----------
  const woodTop = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#c08a54'; g.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(${120 + r() * 40},${70 + r() * 30},30,.35)`; g.fillRect(0, i * h / 9, w, 2 + r() * 3); } for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(90,50,20,${r() * .12})`; g.fillRect(r() * w, r() * h, 6 + r() * 30, 1); } });
  const topM = new THREE.MeshStandardMaterial({ map: woodTop, roughness: .55 });
  const BX = .6, BZ = BACK + .45;
  rb(4.0, .08, .9, topM, BX, BENCH - .04, BZ, W, .015);
  const legM = M(0x7a5434, { roughness: .7 });
  for (const x of [-1.92, 1.92]) for (const z of [-.36, .36]) rb(.08, BENCH - FLOOR - .08, .08, legM, BX + x, (BENCH + FLOOR) / 2 - .04, BZ + z, W, .01);
  rb(3.9, .04, .8, legM, BX, FLOOR + .25, BZ, W, .01);
  for (const [x, w, h, c] of [[-.9, .5, .3, 0xd8453c], [-.3, .4, .22, 0x2f6fa8], [1.1, .6, .26, 0xf2c14e], [1.9, .45, .32, 0x3fbf6a]]) rb(w, h, .5, M(c, { roughness: .5 }), BX + x, FLOOR + .27 + h / 2, BZ, W, .02);
  // cutting mat
  const matTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#2f7d5a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  add(new THREE.PlaneGeometry(1.5, .7), new THREE.MeshStandardMaterial({ map: matTex, roughness: .9 }), BX, BENCH + .002, BZ + .02, W, { shadow: false }).rotation.x = -Math.PI / 2;
  // desk lamp (left end of the bench)
  const lamp = grp(BX - 1.3, BENCH, BZ - .15, W);
  add(cyl(.11, .12, .03, 28), M(0x2b2f36, { roughness: .4 }), 0, .015, 0, lamp);
  const armM = M(0xf2c14e, { roughness: .35 });
  const a1 = add(cyl(.014, .014, .5, 10), armM, .08, .26, 0, lamp); a1.rotation.z = -.35;
  const a2 = add(cyl(.014, .014, .45, 10), armM, .3, .52, 0, lamp); a2.rotation.z = -1.3;
  const shade = add(new THREE.ConeGeometry(.12, .16, 28, 1, true), M(0xf2c14e, { roughness: .35, side: THREE.DoubleSide }), .52, .5, 0, lamp); shade.rotation.z = .5;
  add(sph(.045), M(0xffffff, { emissive: 0xfff2c8, emissiveIntensity: 1.5 }), .52, .46, 0, lamp, { shadow: false });
  // stool + tool cabinet + shelf
  const stool = grp(BX + .2, FLOOR, BZ + 1.1, W);
  add(cyl(.2, .2, .05, 28), M(0xd8453c, { roughness: .45 }), 0, .66, 0, stool);
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const l = add(cyl(.016, .016, .66, 8), M(0x2b2f36), Math.cos(a) * .13, .33, Math.sin(a) * .13, stool); l.rotation.set(Math.sin(a) * .15, 0, -Math.cos(a) * .15); }
  const cab = grp(LEFT + .35, FLOOR, -1.6, W);
  rb(.6, 1.0, .9, M(0xc94a3c, { roughness: .4, metalness: .2 }), 0, .5, 0, cab, .03);
  for (let i = 0; i < 4; i++) { rb(.02, .2, .82, M(0xb33f33, { roughness: .4 }), .31, .15 + i * .23, 0, cab, .01); rb(.03, .03, .3, steel, .33, .18 + i * .23, 0, cab, .01); }
  rb(.25, .03, .9, M(0x8a5a3c), LEFT + .12, 2.2, -1.2, W, .01);
  for (let i = 0; i < 4; i++) add(cyl(.05, .05, .14, 14), M([0xf5f1e8, 0x90b8d8, 0xd96c6c, 0xf2c14e][i], { roughness: .4 }), LEFT + .12, 2.29, -1.5 + i * .2, W);
  // ceiling light
  add(new THREE.SphereGeometry(.25, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xffffff, { emissive: 0xfff3dc, emissiveIntensity: 1.2 }), .3, CEIL - .02, -1.6, W, { shadow: false });
  refs.bench = new THREE.Vector3(BX, BENCH, BZ);     // centre of the bench top
  refs.yard = new THREE.Vector3(5.6, 0, .4);          // open lawn right of the house
  refs.cutZ = 1.6;

  // ---------- outdoors: trees, bushes, fence, neighbours ----------
  for (const [x, z, s] of [[-7.5, -6, 1.3], [7, -8, 1.5], [-12, -16, 1.6], [12.5, -19, 1.7], [2, -24, 1.8], [-5, -30, 1.6], [16, -9, 1.4], [-16, -8, 1.4]]) tree(W, x, z, s, R);
  for (let i = 0; i < 14; i++) { const b = add(new THREE.IcosahedronGeometry(.45 + R() * .35, 2), M([0x4e8b3a, 0x5c9a42, 0x467f33][i % 3], { flatShading: false, roughness: .9 }), -10 + R() * 20, .25, -4.8 - R() * 5, W); if (Math.abs(b.position.x) < 4.3) b.position.x += Math.sign(b.position.x || 1) * 4.6; b.scale.y = .8; }
  for (let x = -20; x <= 20; x += .5) rb(.12, 1.1, .06, M(0x8a6a4c, { roughness: .9 }), x, .55, -14, W, .02);
  for (const y of [.35, .85]) rb(40, .08, .05, M(0x7a5c40), 0, y, -14.05, W, .01);
  for (const [x, z, c] of [[-10, -26, 0xf0e6d6], [9, -30, 0xe9dcc8], [-22, -34, 0xf3efe7]]) { rb(6, 4, 5, M(c), x, 2, z, W, .05); for (const s of [-1, 1]) { const r = rb(3.6, .2, 5.4, M(0xa5472b), x + s * 1.45, 4.85, z, W, .03); r.rotation.z = -s * .62; } for (let i = 0; i < 3; i++) rb(.8, .9, .05, M(0x6fa3c8, { emissive: 0x3a6a8a, emissiveIntensity: .3 }), x - 1.8 + i * 1.8, 2.3, z + 2.52, W, .02); }

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xd6e8ff, 0x7a6448, .9));
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.6); sun.position.set(-8, 14, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -5, near: 1, far: 50 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 5;
  scene.add(sun);
  const inside = new THREE.PointLight(0xfff1dc, 9, 8, 1.4); inside.position.set(.3, CEIL - .4, -1.4); scene.add(inside);
  const inside2 = new THREE.PointLight(0xffe9c8, 4, 5, 1.6); inside2.position.set(.6, CEIL - 1.3, -1.6); scene.add(inside2);
  refs.sun = sun; refs.W = W;
  return refs;
}

function pot(parent, x, y, z, r, leaf, flowers = false) {
  add(cyl(r, r * .75, r * 1.6, 20), M(0xb4583a, { roughness: .8 }), x, y + r * .8, z, parent);
  const R = rng(Math.floor(x * 100 + z * 10));
  for (let i = 0; i < 7; i++) { const l = add(new THREE.SphereGeometry(r * .8, 12, 8), M(flowers && i % 2 ? leaf : 0x3f8a3a, { roughness: .8 }), x + (R() - .5) * r * 1.6, y + r * 1.8 + R() * r * 1.4, z + (R() - .5) * r * 1.2, parent); l.scale.set(1, .7, 1); }
}
function chair(parent, x, z, ry) {
  const c = grp(x, 0, z, parent); c.rotation.y = ry; const w = M(0x2f8f86, { roughness: .5 }), dk = M(0x3a2a20);
  rb(.42, .05, .42, w, 0, .46, 0, c, .02);
  rb(.42, .45, .04, w, 0, .72, -.2, c, .02);
  for (const [a, b] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) add(cyl(.018, .018, .46, 8), dk, a, .23, b, c);
}
function tree(parent, x, z, s, R) {
  const g = grp(x, 0, z, parent); g.scale.setScalar(s);
  add(cyl(.16, .28, 3, 10), M(0x5b4130, { roughness: .9 }), 0, 1.5, 0, g);
  for (let i = 0; i < 3; i++) { const b = add(cyl(.05, .09, 1.2, 6), M(0x5b4130), (R() - .5) * .6, 2.6 + i * .3, (R() - .5) * .4, g); b.rotation.z = (R() - .5) * 1.4; }
  for (let i = 0; i < 11; i++) add(new THREE.IcosahedronGeometry(.75 + R() * .6, 2), M([0x4f8a35, 0x5d9b3e, 0x447a2f, 0x67a548][i % 4], { roughness: .9 }), (R() - .5) * 2.4, 3.2 + R() * 1.8, (R() - .5) * 2.0, g);
}
