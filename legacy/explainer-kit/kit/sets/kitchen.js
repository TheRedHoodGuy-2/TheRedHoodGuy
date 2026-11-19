// The house-cutaway kitchen set. Static; every microwave beat happens in here.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, sph, canvasTex, rng, rboxGeo } from '../util.js';
import { grooves, scan, HI, BRICK_GROUT, GRID_GROUT } from '../detail.js';

export const FLOOR = 0.26, COUNTER = 1.17, BACK = -3.5, LEFT = -3.3, CEIL = 3.6;

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
  soil.position.set(0, -7.02, 2.6 - 35); soil.receiveShadow = true; W.add(soil);
  const lawnTex = canvasTex(512, 512, (g, w, h) => { const r = rng(5); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#5d9c3a' : '#6aab44'; g.fillRect(i * w / 8, 0, w / 8, h); } for (let i = 0; i < 12000; i++) { g.fillStyle = r() < .5 ? 'rgba(35,75,20,.25)' : 'rgba(160,210,95,.22)'; g.fillRect(r() * w, r() * h, 1.5, 3.5); } }, [26, 22]);
  const lawn = add(new THREE.PlaneGeometry(80, 70), new THREE.MeshStandardMaterial({ map: lawnTex, roughness: .95 }), 0, 0, 2.6 - 35, W); lawn.rotation.x = -Math.PI / 2; refs.lawn = lawn;
  const far = add(new THREE.PlaneGeometry(500, 250), M(0x82b65c), 0, -.05, -170, W, { shadow: false }); far.rotation.x = -Math.PI / 2;

  // ---------- house shell ----------
  const wallPaint = M(0xf3eee6, { roughness: .9 }), siding = scan(M(0xd9c29a, { roughness: .85 }), 'painted_plaster_wall', { repeat: [3, 3], colour: .35 }), trimW = M(0xffffff, { roughness: .5 });
  rb(7.4, 1.3, 6.0, M(0x9e9a91), 0, -.52, -1.0, W, .02);                    // foundation in soil
  rb(7.4, .25, 6.0, M(0xbab6ad), 0, .125, -1.0, W, .02);                     // slab
  const floorTex = canvasTex(512, 512, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#d6d2c8' : '#f1ede4'; g.fillRect(x * 64, y * 64, 64, 64); } g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } }, [4, 3.4]);
  const fl = add(new THREE.PlaneGeometry(6.9, 5.6), grooves(new THREE.MeshStandardMaterial({ map: floorTex, roughness: .55 }), 512, 512, GRID_GROUT, { strength: 5, rough: [.3, .85] }), 0, FLOOR, -.8, W, { shadow: false }); fl.rotation.x = -Math.PI / 2;
  rb(7.0, CEIL - FLOOR, .3, wallPaint, 0, (CEIL + FLOOR) / 2, BACK - .15, W, .01);
  rb(.3, CEIL - FLOOR, 5.7, wallPaint, LEFT - .15, (CEIL + FLOOR) / 2, -.8, W, .01);
  rb(.06, CEIL + .02, 5.72, siding, LEFT - .33, CEIL / 2, -.8, W, .01);
  for (let y = .6; y < CEIL; y += .32) rb(.03, .03, 5.72, M(0xc2a97f), LEFT - .37, y, -.8, W, .01, { shadow: false });
  rb(7.0, .14, 5.7, M(0xf7f5f0), 0, CEIL + .07, -.8, W, .01);                 // ceiling slab (cut)
  rb(7.0, .06, .06, trimW, 0, FLOOR + .06, BACK + .03, W, .01, { shadow: false });   // baseboard
  // roof
  const roofTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#a5472b'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, y, w, 4); for (let x = (y / 32 % 2) * 24; x < w; x += 48) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x, y, 3, 32); } } }, [3, 5]);
  const roofM = HI ? scan(new THREE.MeshStandardMaterial({ color: 0xb4522f }), 'clay_roof_tiles', { repeat: [3, 4], colour: .55, normal: 1.4 }) : new THREE.MeshStandardMaterial({ map: roofTex, roughness: .8 });
  for (const s of [-1, 1]) { const r = rb(4.7, .2, 6.3, roofM, s * 1.85, CEIL + 1.15, -.8, W, .03); r.rotation.z = -s * .55; }
  rb(.7, 2.0, .7, M(0x8a3f2c), -2.3, CEIL + 1.6, -2.4, W, .03); rb(.8, .12, .8, M(0x6c3324), -2.3, CEIL + 2.62, -2.4, W, .02);
  // gable infill inside roof (attic cut)
  const gab = new THREE.Shape(); gab.moveTo(-3.6, 0); gab.lineTo(3.6, 0); gab.lineTo(0, 2.1); gab.lineTo(-3.6, 0);
  add(new THREE.ShapeGeometry(gab), M(0x5a3c2c, { side: THREE.DoubleSide }), 0, CEIL + .14, BACK - .1, W);

  // ---------- backsplash + window ----------
  const tileTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#d5e8ef'; g.fillRect(0, 0, w, h); g.strokeStyle = '#a9c6d1'; g.lineWidth = 4; for (let y = 0; y <= 8; y++) { g.beginPath(); g.moveTo(0, y * 32); g.lineTo(w, y * 32); g.stroke(); for (let x = (y % 2) * 32; x <= w; x += 64) { g.beginPath(); g.moveTo(x, y * 32); g.lineTo(x, y * 32 + 32); g.stroke(); } } }, [5, 1]);
  add(new THREE.PlaneGeometry(6.6, .68), grooves(new THREE.MeshStandardMaterial({ map: tileTex, roughness: .3 }), 512, 256, BRICK_GROUT, { strength: 5, rough: [.12, .75] }), 0, COUNTER + .34, BACK + .005, W, { shadow: false });
  const view = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fc0ea'); gr.addColorStop(.62, '#d6ebf8'); gr.addColorStop(.62, '#7db75a'); gr.addColorStop(1, '#5e9a40'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(9); for (let i = 0; i < 7; i++) { const x = r() * w, y = h * .58; g.fillStyle = ['#4f8a35', '#5d9b3e', '#3f7a2f'][i % 3]; g.beginPath(); g.arc(x, y - 30, 26 + r() * 20, 0, 7); g.fill(); g.fillStyle = '#5b4130'; g.fillRect(x - 3, y - 10, 6, 20); } g.fillStyle = '#f3f0e8'; g.fillRect(150, 120, 70, 40); g.fillStyle = '#b4583a'; g.beginPath(); g.moveTo(145, 122); g.lineTo(185, 95); g.lineTo(225, 122); g.fill(); });
  add(new THREE.PlaneGeometry(1.0, .85), new THREE.MeshStandardMaterial({ map: view, emissive: 0xffffff, emissiveMap: view, emissiveIntensity: .55, roughness: .2 }), 1.3, 2.1, BACK + .01, W, { shadow: false });
  for (const [w, h, x, y] of [[1.16, .07, 1.3, 2.555], [1.16, .07, 1.3, 1.645], [.07, .9, .73, 2.1], [.07, .9, 1.87, 2.1], [1.0, .04, 1.3, 2.1], [.04, .85, 1.3, 2.1]]) rb(w, h, .07, trimW, x, y, BACK + .04, W, .015);
  rb(1.3, .05, .2, trimW, 1.3, 1.62, BACK + .1, W, .015);
  const curtain = M(0xe9a05a, { roughness: .95 });
  for (const s of [-1, 1]) { const c = add(new THREE.CylinderGeometry(.11, .16, .95, 16, 1, false, 0, Math.PI), curtain, 1.3 + s * .66, 2.1, BACK + .12, W); c.rotation.y = Math.PI / 2; c.scale.set(1, 1, .5); }
  rb(1.5, .03, .03, M(0x6b4a2c), 1.3, 2.62, BACK + .12, W, .01);
  pot(W, 1.58, 1.64, BACK + .1, .07, 0x4e9a46);

  // ---------- fridge ----------
  const fr = grp(-2.88, FLOOR, -3.13, W);
  const fridgeM = M(0xe4e8eb, { roughness: .35, metalness: .25 });
  rb(.84, 1.95, .72, fridgeM, 0, .975, 0, fr, .06);
  rb(.8, .01, .02, M(0x9aa3aa), 0, 1.3, .362, fr, .004, { shadow: false });
  for (const [y, h] of [[1.62, .45], [.75, .6]]) rb(.035, h, .05, M(0xb8c0c6, { metalness: .8, roughness: .25 }), .33, y, .39, fr, .015);
  for (let i = 0; i < 5; i++) add(cyl(.028, .028, .015, 16), M([0xe94f4f, 0x3a8ee6, 0xf2c14e, 0x5fbf6a, 0xb57bd6][i]), -.25 + R() * .4, 1.45 + R() * .35, .367, fr).rotation.x = Math.PI / 2;
  rb(.2, .26, .005, M(0xffffff), -.08, 1.62, .366, fr, .004, { shadow: false });

  // ---------- lower cabinets + counters ----------
  const cab = scan(M(0xf1e8d6, { roughness: .6 }), 'kitchen_wood', { repeat: [1, 1], colour: .18, normal: .6, rot: Math.PI / 2 }), cabEdge = M(0xe3d7bf, { roughness: .6 }), brass = M(0xc9a15a, { metalness: .85, roughness: .3 });
  const top = scan(M(0xe9e4dc, { roughness: .35, physical: true, clearcoat: .4 }), 'marble_01', { repeat: [2, 1], colour: .35, normal: .4, roughMul: .5 });
  const runs = [[-2.45, -1.0], [-.2, .7], [.7, 1.9], [1.9, 3.3]];
  for (const [a, b] of runs) {
    const w = b - a, cx = (a + b) / 2;
    rb(w, .78, .58, cabEdge, cx, FLOOR + .08 + .39, BACK + .29, W, .01);
    rb(w, .08, .52, M(0x3a3632), cx, FLOOR + .04, BACK + .27, W, .005, { shadow: false });
    const nd = Math.max(1, Math.round(w / .5)), dw = w / nd;
    for (let i = 0; i < nd; i++) {
      const x = a + dw * (i + .5);
      if (a === .7) { rb(dw - .03, .72, .03, cab, x, FLOOR + .08 + .39, BACK + .59, W, .02); }
      else { rb(dw - .03, .16, .03, cab, x, COUNTER - .14, BACK + .59, W, .02); rb(dw - .03, .52, .03, cab, x, FLOOR + .38, BACK + .59, W, .02); rb(.12, .02, .03, brass, x, COUNTER - .14, BACK + .615, W, .008); }
      rb(.02, .1, .03, brass, x + (i % 2 ? -1 : 1) * (dw / 2 - .07), FLOOR + .5, BACK + .615, W, .008);
    }
    rb(w + .02, .05, .66, top, cx, COUNTER - .025, BACK + .32, W, .012);
  }
  // sink
  const basin = grp(1.3, COUNTER, BACK + .33, W);
  rb(.7, .2, .42, M(0xb9c1c7, { metalness: .7, roughness: .3 }), 0, -.08, 0, basin, .03);
  rb(.64, .17, .36, M(0x6b747b, { metalness: .6, roughness: .35 }), 0, -.07, 0, basin, .03);
  const tap = grp(1.3, COUNTER, BACK + .1, W);
  const chrome = M(0xdfe5ea, { metalness: 1, roughness: .15 });
  add(cyl(.03, .035, .05), chrome, 0, .025, 0, tap);
  const tc = new THREE.CatmullRomCurve3([new THREE.Vector3(0, .02, 0), new THREE.Vector3(0, .32, 0), new THREE.Vector3(0, .4, .06), new THREE.Vector3(0, .36, .17), new THREE.Vector3(0, .3, .2)]);
  add(new THREE.TubeGeometry(tc, 30, .018, 12), chrome, 0, 0, 0, tap);
  add(cyl(.012, .012, .1), chrome, .09, .06, 0, tap).rotation.z = 1.2;
  refs.tapTip = new THREE.Vector3(1.3, COUNTER + .29, BACK + .3);
  refs.basinY = COUNTER - .15;

  // ---------- stove ----------
  const st = grp(-.6, FLOOR, BACK + .3, W);
  rb(.8, .86, .6, M(0xd9dde0, { metalness: .4, roughness: .3 }), 0, .43, 0, st, .02);
  rb(.66, .38, .02, M(0x1c1f23, { roughness: .1, physical: true, clearcoat: 1 }), 0, .4, .305, st, .02);
  rb(.5, .025, .04, chrome, 0, .66, .33, st, .01);
  rb(.8, .03, .6, M(0x141518, { roughness: .2, physical: true, clearcoat: 1 }), 0, .875, 0, st, .01);
  for (const [x, z, r] of [[-.2, -.12, .1], [.2, -.12, .08], [-.2, .14, .08], [.2, .14, .1]]) { const b = add(new THREE.TorusGeometry(r, .012, 6, 28), M(0x3a3a3a, { metalness: .6 }), x, .895, z, st); b.rotation.x = Math.PI / 2; }
  for (let i = 0; i < 4; i++) add(cyl(.025, .025, .03), M(0x2a2d31), -.27 + i * .18, .76, .31, st).rotation.x = Math.PI / 2;
  // pot on stove
  const potM = M(0xc84b3b, { roughness: .4, physical: true, clearcoat: .6 });
  add(cyl(.16, .15, .18, 32), potM, -.2, 1.0, -.12, st); add(cyl(.165, .165, .02, 32), potM, -.2, 1.1, -.12, st); add(sph(.025), M(0x2a2d31), -.2, 1.12, -.12, st);
  // range hood
  const hood = grp(-.6, 2.35, BACK + .25, W);
  add(new THREE.CylinderGeometry(.22, .45, .35, 4, 1), M(0xd2d7db, { metalness: .6, roughness: .3 }), 0, 0, 0, hood).rotation.y = Math.PI / 4;
  rb(.3, .9, .3, M(0xd2d7db, { metalness: .6, roughness: .3 }), 0, .6, -.05, hood, .02);

  // ---------- upper cabinets ----------
  for (const [a, b] of [[-2.45, -1.0], [-.2, .7], [1.9, 3.3]]) {
    const w = b - a, cx = (a + b) / 2;
    rb(w, .78, .36, cabEdge, cx, 2.45, BACK + .18, W, .01);
    const nd = Math.max(1, Math.round(w / .5)), dw = w / nd;
    for (let i = 0; i < nd; i++) { const x = a + dw * (i + .5); rb(dw - .03, .74, .03, cab, x, 2.45, BACK + .37, W, .02); rb(.02, .12, .03, brass, x + (i % 2 ? -1 : 1) * (dw / 2 - .07), 2.16, BACK + .395, W, .008); }
  }
  // under-cabinet light strip
  const lightStrip = M(0xfff4d6, { emissive: 0xfff0c8, emissiveIntensity: 1.5 });
  for (const [a, b] of [[-2.45, -1.0], [-.2, .7], [1.9, 3.3]]) rb(b - a - .1, .015, .04, lightStrip, (a + b) / 2, 2.055, BACK + .3, W, .006, { shadow: false });

  // ---------- counter clutter ----------
  // counter B: cutting board, bread, fruit bowl
  rb(.42, .025, .28, M(0xb7834f, { roughness: .6 }), .05, COUNTER + .012, BACK + .3, W, .012);
  const bread = add(sph(.11), M(0xd9a05b, { roughness: .8 }), .05, COUNTER + .07, BACK + .3, W); bread.scale.set(1.5, .7, .9);
  const bowl = add(new THREE.SphereGeometry(.16, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0x3e7cc4, { roughness: .4, side: THREE.DoubleSide }), .5, COUNTER + .14, BACK + .32, W);
  for (let i = 0; i < 5; i++) add(sph(.055), M([0xf28c28, 0xe23d3d, 0xf28c28, 0x8bc34a, 0xe23d3d][i], { roughness: .45 }), .5 + (R() - .5) * .14, COUNTER + .1 + R() * .05, BACK + .32 + (R() - .5) * .12, W);
  // counter C: kettle, toaster, canisters, plant
  const kettle = grp(2.15, COUNTER, BACK + .3, W);
  add(cyl(.1, .13, .22, 28), M(0x2f8f86, { roughness: .35, physical: true, clearcoat: .7 }), 0, .11, 0, kettle);
  add(new THREE.TorusGeometry(.08, .015, 8, 20, Math.PI), M(0x222222), 0, .23, 0, kettle);
  add(cyl(.02, .03, .12), M(0x2f8f86), .13, .14, 0, kettle).rotation.z = -1;
  rb(.32, .2, .2, M(0xd8dde1, { metalness: .5, roughness: .3 }), 2.6, COUNTER + .1, BACK + .28, W, .05);
  for (const x of [2.53, 2.67]) rb(.1, .01, .14, M(0x222222), x, COUNTER + .201, BACK + .28, W, .004, { shadow: false });
  for (let i = 0; i < 3; i++) { const h = .2 - i * .03; add(cyl(.065, .065, h, 24), M(0xf5f1e8, { roughness: .4 }), 3.0 - i * .02, COUNTER + h / 2, BACK + .18 + i * .14, W); add(cyl(.068, .068, .03, 24), M(0x7a5236), 3.0 - i * .02, COUNTER + h + .015, BACK + .18 + i * .14, W); }
  // counter A gets cleared for the build; small spice rack on wall above
  rb(.5, .03, .1, M(0x8a5a3c), -1.72, 1.82, BACK + .05, W, .01);
  for (let i = 0; i < 5; i++) add(cyl(.025, .025, .09, 12), M([0xc0392b, 0xe67e22, 0x7f8c3a, 0x8e5a2b, 0xd4ac0d][i]), -1.9 + i * .09, 1.88, BACK + .05, W);

  // ---------- left wall: shelves, clock, picture ----------
  const shelf = scan(M(0x8a5a3c, { roughness: .6 }), 'fine_grained_wood', { repeat: [1, .3], colour: .5 });
  for (const y of [1.65, 2.15]) rb(.25, .04, 1.2, shelf, LEFT + .125, y, -1.35, W, .01);
  for (let i = 0; i < 6; i++) { const h = .14 + R() * .08; add(cyl(.05, .05, h, 16), M([0xf2d06b, 0xe8865a, 0xa8d08d, 0xf5f1e8, 0xd96c6c, 0x90b8d8][i], { roughness: .4 }), LEFT + .13, 1.67 + h / 2, -1.85 + i * .19, W); }
  for (let i = 0; i < 7; i++) { const h = .2 + R() * .1; rb(.16, h, .045, M([0x2f5d8a, 0xc0392b, 0xe8b04a, 0x3c8d5a, 0x7a4a8a, 0xd35400, 0x34495e][i], { roughness: .7 }), LEFT + .13, 2.17 + h / 2, -1.85 + i * .055, W, .006); }
  pot(W, LEFT + .13, 2.17, -.95, .08, 0x3f8a3a);
  const clock = grp(LEFT + .02, 2.9, -2.3, W); clock.rotation.y = Math.PI / 2;
  add(cyl(.2, .2, .04, 40), M(0xffffff, { roughness: .3 }), 0, 0, 0, clock).rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(.2, .025, 8, 40), M(0x333333), 0, 0, .0, clock);
  rb(.015, .13, .01, M(0x222222), 0, .05, .03, clock, .004).rotation.z = -.5; rb(.012, .17, .01, M(0x222222), 0, .07, .035, clock, .004).rotation.z = 1.2;
  const pic = grp(LEFT + .02, 2.75, -.45, W); pic.rotation.y = Math.PI / 2;
  rb(.7, .5, .03, M(0x5a3c2c), 0, 0, 0, pic, .01);
  add(new THREE.PlaneGeometry(.6, .4), new THREE.MeshStandardMaterial({ map: canvasTex(256, 170, (g, w, h) => { g.fillStyle = '#f4e3c3'; g.fillRect(0, 0, w, h); g.fillStyle = '#e07b4f'; g.beginPath(); g.arc(80, 90, 45, 0, 7); g.fill(); g.fillStyle = '#3b7d8c'; g.fillRect(130, 40, 90, 90); g.fillStyle = '#f2c14e'; g.beginPath(); g.moveTo(40, 160); g.lineTo(130, 60); g.lineTo(220, 160); g.fill(); }) }), 0, 0, .02, pic, { shadow: false });
  rb(.08, .12, .02, M(0xffffff), LEFT + .01, 1.5, .2, W, .01, { shadow: false });

  // ---------- dining nook ----------
  const tbl = grp(2.35, FLOOR, .25, W); const woodT = scan(M(0xa8743f, { roughness: .55 }), 'fine_grained_wood', { repeat: [1, 1], colour: .5 });
  add(cyl(.55, .55, .05, 48), woodT, 0, .76, 0, tbl); add(cyl(.05, .07, .72, 16), M(0x3a2a20), 0, .38, 0, tbl); add(cyl(.28, .3, .04, 32), M(0x3a2a20), 0, .02, 0, tbl);
  for (const a of [2.2, -.9]) chair(tbl, Math.cos(a) * .78, Math.sin(a) * .78, -a + Math.PI / 2);
  add(cyl(.09, .07, .12, 20), M(0xffffff), .1, .84, .05, tbl); pot(tbl, .1, .9, .05, .07, 0xe25d7a, true);
  const rug = add(new THREE.CircleGeometry(1.15, 48), M(0xc96d4d, { roughness: 1 }), 2.35, FLOOR + .005, .25, W, { shadow: false }); rug.rotation.x = -Math.PI / 2; rug.receiveShadow = true;
  const rug2 = add(new THREE.RingGeometry(.85, .95, 48), M(0xf2d06b, { roughness: 1 }), 2.35, FLOOR + .008, .25, W, { shadow: false }); rug2.rotation.x = -Math.PI / 2;
  // pendant lamp
  add(cyl(.006, .006, .8, 6), M(0x222222), 2.35, CEIL - .4, .25, W, { shadow: false });
  add(new THREE.SphereGeometry(.2, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(0x2f8f86, { side: THREE.DoubleSide, roughness: .4 }), 2.35, CEIL - .85, .25, W);
  add(sph(.07), M(0xfff6e0, { emissive: 0xfff0d0, emissiveIntensity: 3 }), 2.35, CEIL - .87, .25, W, { shadow: false });
  // ceiling light
  add(new THREE.SphereGeometry(.25, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xffffff, { emissive: 0xfff3dc, emissiveIntensity: 1.2 }), -.6, CEIL - .02, -1.4, W, { shadow: false });

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
