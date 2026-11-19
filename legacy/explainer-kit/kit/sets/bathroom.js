// The house-cutaway bathroom set (reusable). Same house, soil, yard and lights as the kitchen; bathroom interior.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, sph, canvasTex, rng, rboxGeo } from '../util.js';
import { grooves, scan, HI } from '../detail.js';

export const FLOOR = 0.26, BACK = -3.5, LEFT = -3.3, CEIL = 3.6;

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
  const lawn = add(new THREE.PlaneGeometry(80, 70), new THREE.MeshStandardMaterial({ map: lawnTex, roughness: .95 }), 0, 0, 1.6 - 35, W); lawn.rotation.x = -Math.PI / 2; refs.lawn = lawn;
  const far = add(new THREE.PlaneGeometry(500, 250), M(0x82b65c), 0, -.05, -170, W, { shadow: false }); far.rotation.x = -Math.PI / 2;

  // ---------- house shell ----------
  const wallPaint = M(0xf3eee6, { roughness: .9 }), siding = scan(M(0xd9c29a, { roughness: .85 }), 'painted_plaster_wall', { repeat: [3, 3], colour: .35 }), trimW = M(0xffffff, { roughness: .5 });
  rb(7.4, 1.3, 5.62, M(0x9e9a91), 0, -.52, -1.2, W, .02);   // 1cm proud of the soil face (coplanar = z-fighting grid)                    // foundation in soil
  rb(7.4, .25, 5.6, M(0xbab6ad), 0, .125, -1.2, W, .02);                     // slab
  const floorTex = canvasTex(512, 512, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#d6d2c8' : '#f1ede4'; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, [4, 3.4]);
  const floorM = new THREE.MeshStandardMaterial({ map: floorTex, roughness: .55 });
  grooves(floorM, 512, 512, (g, w, h, col) => { g.strokeStyle = col; g.lineWidth = 6; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, { strength: 5, rough: [.3, .85] });
  const fl = add(new THREE.PlaneGeometry(6.9, 5.2), floorM, 0, FLOOR, -1.0, W, { shadow: false }); fl.rotation.x = -Math.PI / 2;
  rb(7.0, CEIL - FLOOR, .3, wallPaint, 0, (CEIL + FLOOR) / 2, BACK - .15, W, .01);
  rb(.3, CEIL - FLOOR, 5.3, wallPaint, LEFT - .15, (CEIL + FLOOR) / 2, -1.0, W, .01);
  rb(.06, CEIL + .02, 5.32, siding, LEFT - .33, CEIL / 2, -1.0, W, .01);
  for (let y = .6; y < CEIL; y += .32) rb(.03, .03, 5.32, M(0xc2a97f), LEFT - .37, y, -1.0, W, .01, { shadow: false });
  rb(7.0, .14, 5.3, M(0xf7f5f0), 0, CEIL + .07, -1.0, W, .01);                 // ceiling slab (cut)
  rb(7.0, .06, .06, trimW, 0, FLOOR + .06, BACK + .03, W, .01, { shadow: false });   // baseboard
  // roof
  const roofTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#a5472b'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, y, w, 4); for (let x = (y / 32 % 2) * 24; x < w; x += 48) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, y, 3, 32); } } }, [3, 5]);
  const roofM = HI ? scan(new THREE.MeshStandardMaterial({ color: 0xb4522f }), 'clay_roof_tiles', { repeat: [3, 4], colour: .55, normal: 1.4 }) : new THREE.MeshStandardMaterial({ map: roofTex, roughness: .8 });
  for (const s of [-1, 1]) { const r = rb(4.7, .2, 6.3, roofM, s * 1.85, CEIL + 1.15, -.8, W, .03); r.rotation.z = -s * .55; }
  rb(.7, 2.0, .7, M(0x8a3f2c), -2.3, CEIL + 1.6, -2.4, W, .03); rb(.8, .12, .8, M(0x6c3324), -2.3, CEIL + 2.62, -2.4, W, .02);
  // gable infill inside roof (attic cut)
  const gab = new THREE.Shape(); gab.moveTo(-3.6, 0); gab.lineTo(3.6, 0); gab.lineTo(0, 2.1); gab.lineTo(-3.6, 0);
  add(new THREE.ShapeGeometry(gab), M(0x5a3c2c, { side: THREE.DoubleSide }), 0, CEIL + .14, BACK - .1, W);

  // ---------- bathroom: wall tiles, trim, window ----------
  const wallTile = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#f4f7f8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9d6db'; g.lineWidth = 4; for (let y = 0; y <= 8; y++) { g.beginPath(); g.moveTo(0, y * 32); g.lineTo(w, y * 32); g.stroke(); for (let x = (y % 2) * 32; x <= w; x += 64) { g.beginPath(); g.moveTo(x, y * 32); g.lineTo(x, y * 32 + 32); g.stroke(); } } }, [6, 1.6]);
  const tileM = new THREE.MeshStandardMaterial({ map: wallTile, roughness: .25 });
  grooves(tileM, 512, 256, (g, w, h, col) => { g.strokeStyle = col; g.lineWidth = 5; for (let y = 0; y <= 8; y++) { g.beginPath(); g.moveTo(0, y * 32); g.lineTo(w, y * 32); g.stroke(); for (let x = (y % 2) * 32; x <= w; x += 64) { g.beginPath(); g.moveTo(x, y * 32); g.lineTo(x, y * 32 + 32); g.stroke(); } } }, { strength: 5, rough: [.12, .75] });
  add(new THREE.PlaneGeometry(6.6, 1.5), tileM, 0, FLOOR + .75, BACK + .005, W, { shadow: false });
  const lt = add(new THREE.PlaneGeometry(5.1, 1.5), tileM, LEFT + .005, FLOOR + .75, -1.0, W, { shadow: false }); lt.rotation.y = Math.PI / 2;
  const trimB = M(0x2f6fa8, { roughness: .4 });
  rb(6.6, .07, .03, trimB, 0, FLOOR + 1.52, BACK + .02, W, .01, { shadow: false });
  rb(.03, .07, 5.1, trimB, LEFT + .02, FLOOR + 1.52, -1.0, W, .01, { shadow: false });
  const paint = M(0xd8ece6, { roughness: .9 });
  add(new THREE.PlaneGeometry(6.6, CEIL - FLOOR - 1.55), paint, 0, (CEIL + FLOOR + 1.55) / 2, BACK + .004, W, { shadow: false });
  const lp = add(new THREE.PlaneGeometry(5.1, CEIL - FLOOR - 1.55), paint, LEFT + .004, (CEIL + FLOOR + 1.55) / 2, -1.0, W, { shadow: false }); lp.rotation.y = Math.PI / 2;
  // window above the tub
  const view = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fc0ea'); gr.addColorStop(.62, '#d6ebf8'); gr.addColorStop(.62, '#7db75a'); gr.addColorStop(1, '#5e9a40'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(9); for (let i = 0; i < 7; i++) { const x = r() * w, y = h * .58; g.fillStyle = ['#4f8a35', '#5d9b3e', '#3f7a2f'][i % 3]; g.beginPath(); g.arc(x, y - 30, 26 + r() * 20, 0, 7); g.fill(); } });
  add(new THREE.PlaneGeometry(1.0, .8), new THREE.MeshStandardMaterial({ map: view, emissive: 0xffffff, emissiveMap: view, emissiveIntensity: .55, roughness: .2 }), 2.0, 2.45, BACK + .01, W, { shadow: false });
  for (const [w, h, x, y] of [[1.16, .07, 2.0, 2.88], [1.16, .07, 2.0, 2.02], [.07, .86, 1.43, 2.45], [.07, .86, 2.57, 2.45], [.04, .8, 2.0, 2.45]]) rb(w, h, .07, trimW, x, y, BACK + .04, W, .015);
  // ---------- bathtub + shower curtain ----------
  const tub = grp(2.0, FLOOR, BACK + .45, W);
  const enamel = M(0xfbfbfa, { roughness: .2, physical: true, clearcoat: 1 });
  rb(2.3, .62, .9, enamel, 0, .31, 0, tub, .09);
  rb(2.1, .1, .72, M(0xcfe6ef, { roughness: .1, transparent: true, opacity: .85 }), 0, .55, 0, tub, .04);
  rb(.04, .12, .04, M(0xdfe5ea, { metalness: 1, roughness: .15 }), -.9, .9, -.38, tub, .01);
  add(cyl(.012, .012, 2.4, 8), M(0xdfe5ea, { metalness: 1, roughness: .15 }), 0, 2.15, .47, tub).rotation.z = Math.PI / 2;
  const curtainM = M(0x7cc4c0, { roughness: .9, side: THREE.DoubleSide });
  for (let i = 0; i < 8; i++) { const c = add(new THREE.CylinderGeometry(.09, .09, 1.55, 12, 1, true, 0, Math.PI), curtainM, -1.1 + i * .16, 1.37, .47, tub); c.rotation.y = Math.PI / 2 * (i % 2 ? 1 : -1); c.scale.z = .5; }
  // ---------- sink vanity + mirror ----------
  const van = grp(-2.55, FLOOR, BACK + .3, W);
  const wood = scan(M(0x9a6b43, { roughness: .6 }), 'fine_grained_wood', { repeat: [1, 1], colour: .5 });
  rb(1.1, .8, .55, wood, 0, .4, 0, van, .02);
  for (const x of [-.27, .27]) { rb(.5, .66, .02, scan(M(0xb07c50, { roughness: .6 }), 'fine_grained_wood', { repeat: [.6, .6], colour: .5, rot: Math.PI / 2 }), x, .4, .285, van, .015); rb(.02, .12, .03, M(0xc9a15a, { metalness: .85, roughness: .3 }), x + (x < 0 ? .19 : -.19), .5, .3, van, .006); }
  rb(1.2, .05, .6, M(0xeeeeec, { roughness: .3, physical: true, clearcoat: .5 }), 0, .825, 0, van, .012);
  const basin = add(new THREE.SphereGeometry(.2, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xffffff, { roughness: .2, side: THREE.DoubleSide }), 0, .85, .02, van); basin.scale.set(1.3, .5, .9);
  add(cyl(.02, .025, .2), M(0xdfe5ea, { metalness: 1, roughness: .15 }), 0, .95, -.2, van);
  rb(.03, .03, .14, M(0xdfe5ea, { metalness: 1, roughness: .15 }), 0, 1.05, -.13, van, .01);
  rb(.8, .9, .03, M(0xd7ecf5, { roughness: .08, emissive: 0xbcd9e8, emissiveIntensity: .35 }), 0, 1.75, -.27, van, .02);
  rb(.86, .96, .02, M(0x2f6fa8), 0, 1.75, -.285, van, .02);
  for (let i = 0; i < 3; i++) add(cyl(.035, .035, .12 + i * .03, 12), M([0xf2c14e, 0x7cc4c0, 0xe8865a][i], { roughness: .4 }), .35 + i * .08, .9 + i * .015, -.15, van);
  // ---------- small things ----------
  const tp = grp(-1.55, FLOOR + .7, LEFT, W);   // toilet paper by the toilet (on the back wall)
  add(cyl(.06, .06, .12, 20), M(0xffffff, { roughness: .9 }), LEFT + .1, FLOOR + .72, .75, W);
  rb(.1, .02, .18, M(0xdfe5ea, { metalness: 1, roughness: .15 }), LEFT + .08, FLOOR + .8, .75, W, .008);
  rb(.03, .5, .03, M(0xdfe5ea, { metalness: 1, roughness: .2 }), LEFT + .05, FLOOR + 1.25, -1.6, W, .01);
  const towel = rb(.06, .55, .5, M(0xe8865a, { roughness: 1 }), LEFT + .08, FLOOR + 1.0, -1.6, W, .03);
  rb(.25, .03, .7, M(0x8a5a3c), LEFT + .12, 2.1, -.6, W, .01);
  pot(W, LEFT + .12, 2.12, -.75, .07, 0x3f8a3a);
  for (let i = 0; i < 3; i++) add(cyl(.04, .04, .14, 12), M([0xf5f1e8, 0x90b8d8, 0xd96c6c][i], { roughness: .4 }), LEFT + .12, 2.19, -.5 + i * .1, W);
  const mat = rb(1.0, .02, .6, M(0x7cc4c0, { roughness: 1 }), 2.0, FLOOR + .01, -2.6, W, .01, { shadow: false });
  const mat2 = rb(.6, .02, .5, M(0xf2c14e, { roughness: 1 }), -2.35, FLOOR + .01, 1.1, W, .01, { shadow: false });
  add(cyl(.2, .17, .45, 24, 1, true), M(0xd8c3a0, { roughness: 1, side: THREE.DoubleSide }), -2.95, FLOOR + .23, -1.2, W);
  // ceiling light
  add(new THREE.SphereGeometry(.25, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xffffff, { emissive: 0xfff3dc, emissiveIntensity: 1.2 }), -.6, CEIL - .02, -1.4, W, { shadow: false });
  refs.toilet = new THREE.Vector3(LEFT + .5, FLOOR, 1.58);   // toilet against the left wall, right on the front cut, facing +x
  refs.cutZ = 1.6;                                           // soil + foundation cut face

  // ---------- outdoors: trees, bushes, fence, neighbours ----------
  for (const [x, z, s] of [[-7.5, -6, 1.3], [7, -8, 1.5], [-12, -16, 1.6], [12.5, -19, 1.7], [2, -24, 1.8], [-5, -30, 1.6], [16, -9, 1.4], [-16, -8, 1.4]]) tree(W, x, z, s, R);
  for (let i = 0; i < 14; i++) { const b = add(new THREE.IcosahedronGeometry(.45 + R() * .35, 2), M([0x4e8b3a, 0x5c9a42, 0x467f33][i % 3], { flatShading: false, roughness: .9 }), -10 + R() * 20, .25, -4.8 - R() * 5, W); if (Math.abs(b.position.x) < 4.3) b.position.x += Math.sign(b.position.x || 1) * 4.6; b.scale.y = .8; }
  for (let x = -20; x <= 20; x += .5) rb(.12, 1.1, .06, scan(M(0x8a6a4c, { roughness: .9 }), 'fine_grained_wood', { repeat: [.3, 1], colour: .6, rot: Math.PI / 2 }), x, .55, -14, W, .02);
  for (const y of [.35, .85]) rb(40, .08, .05, M(0x7a5c40), 0, y, -14.05, W, .01);
  for (const [x, z, c] of [[-10, -26, 0xf0e6d6], [9, -30, 0xe9dcc8], [-22, -34, 0xf3efe7]]) { rb(6, 4, 5, M(c), x, 2, z, W, .05); for (const s of [-1, 1]) { const r = rb(3.6, .2, 5.4, M(0xa5472b), x + s * 1.45, 4.85, z, W, .03); r.rotation.z = -s * .62; } for (let i = 0; i < 3; i++) rb(.8, .9, .05, M(0x6fa3c8, { emissive: 0x3a6a8a, emissiveIntensity: .3 }), x - 1.8 + i * 1.8, 2.3, z + 2.52, W, .02); }

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x7a6448, .9); scene.add(hemi); refs.hemi = hemi;
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.6); sun.position.set(-8, 14, 10); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -5, near: 1, far: 50 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 5;
  scene.add(sun);
  const inside = new THREE.PointLight(0xfff1dc, 9, 8, 1.4); inside.position.set(-.6, CEIL - .4, -1.2); scene.add(inside);
  const inside2 = new THREE.PointLight(0xffe9c8, 4, 5, 1.6); inside2.position.set(2.35, CEIL - 1.0, .25); scene.add(inside2);
  const counterFill = new THREE.RectAreaLight ? null : null;
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
