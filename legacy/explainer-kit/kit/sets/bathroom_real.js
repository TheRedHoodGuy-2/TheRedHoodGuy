// REALISTIC variant of the bathroom set: same layout as bathroom.js, but every surface is a scanned PBR material,
// the sky + lighting come from a real HDRI, and bushes are real shrub models. Cheap: maps, not geometry.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, sph, canvasTex, rng, rboxGeo } from '../util.js';
import { pbr, hdriSky, bush } from '../real.js';

export const FLOOR = 0.26, BACK = -3.5, LEFT = -3.3, CEIL = 3.6;

export function buildWorld(scene) {
  const R = rng(21);
  const W = grp(0, 0, 0, scene);
  const refs = {};

  // ---------- sky ----------
  hdriSky(scene, 'kloofendal_48d_partly_cloudy_puresky', { rot: 2.2, env: 1 });
  scene.fog = new THREE.Fog(0xc8d5df, 30, 140);

  // ---------- ground + soil cutaway ----------
  const soilFace = pbr('excavated_soil_wall', { repeat: [14, 2.5], normal: 1.5 });
  const soil = new THREE.Mesh(new THREE.BoxGeometry(80, 14, 70), [soilFace, soilFace, M(0x5a4430), M(0x5a4430), soilFace, soilFace]);
  soil.position.set(0, -7.02, 1.6 - 35); soil.receiveShadow = true; W.add(soil);
  const lawn = add(new THREE.PlaneGeometry(80, 70), pbr('sparse_grass', { repeat: [40, 35], tint: 0xd2f08a, normal: 1.2 }), 0, 0, 1.6 - 35, W); lawn.rotation.x = -Math.PI / 2; refs.lawn = lawn;
  const far = add(new THREE.PlaneGeometry(500, 250), M(0x6f8f4c), 0, -.05, -170, W, { shadow: false }); far.rotation.x = -Math.PI / 2;

  // ---------- house shell ----------
  const wallPaint = pbr('plastered_wall', { repeat: [2, 1.5], tint: 0xf2eee8 }), siding = pbr('plastered_wall', { repeat: [3, 2], tint: 0xe6d6b8 }), trimW = M(0xffffff, { roughness: .5 });
  rb(7.4, 1.3, 5.62, pbr('plastered_wall', { repeat: [4, 1], tint: 0x9a968e, normal: 2 }), 0, -.52, -1.2, W, .02);   // 1cm proud of the soil face (coplanar = z-fighting grid)                    // foundation in soil
  rb(7.4, .25, 5.6, pbr('plastered_wall', { repeat: [4, .3], tint: 0xb5b1a8 }), 0, .125, -1.2, W, .02);                     // slab
  const floorM = pbr('floor_tiles_06', { repeat: [5.75, 4.3], rough: .7, tint: 0xf4f1ec });
  const fl = add(new THREE.PlaneGeometry(6.9, 5.2), floorM, 0, FLOOR, -1.0, W, { shadow: false }); fl.rotation.x = -Math.PI / 2;
  rb(7.0, CEIL - FLOOR, .3, wallPaint, 0, (CEIL + FLOOR) / 2, BACK - .15, W, .01);
  rb(.3, CEIL - FLOOR, 5.3, wallPaint, LEFT - .15, (CEIL + FLOOR) / 2, -1.0, W, .01);
  rb(.06, CEIL + .02, 5.32, siding, LEFT - .33, CEIL / 2, -1.0, W, .01);
    rb(7.0, .14, 5.3, M(0xf7f5f0), 0, CEIL + .07, -1.0, W, .01);                 // ceiling slab (cut)
  rb(7.0, .06, .06, trimW, 0, FLOOR + .06, BACK + .03, W, .01, { shadow: false });   // baseboard
  // roof
  const roofM = pbr('clay_roof_tiles', { repeat: [3, 4], normal: 1.3 });
  for (const s of [-1, 1]) { const r = rb(4.7, .2, 6.3, roofM, s * 1.85, CEIL + 1.15, -.8, W, .03); r.rotation.z = -s * .55; }
  rb(.7, 2.0, .7, pbr('plastered_wall', { repeat: [.5, 1.2], tint: 0x9a4a35 }), -2.3, CEIL + 1.6, -2.4, W, .03); rb(.8, .12, .8, M(0x6c3324), -2.3, CEIL + 2.62, -2.4, W, .02);
  // gable infill inside roof (attic cut)
  const gab = new THREE.Shape(); gab.moveTo(-3.6, 0); gab.lineTo(3.6, 0); gab.lineTo(0, 2.1); gab.lineTo(-3.6, 0);
  add(new THREE.ShapeGeometry(gab), M(0x5a3c2c, { side: THREE.DoubleSide }), 0, CEIL + .14, BACK - .1, W);

  // ---------- bathroom: wall tiles, trim, window ----------
  const tileM = pbr('interior_tiles', { repeat: [8.2, 1.9], tint: 0xfdfdff, rough: .35, normal: 1.2, envI: 1.2 });
  const tileL = pbr('interior_tiles', { repeat: [6.4, 1.9], tint: 0xfdfdff, rough: .35, normal: 1.2, envI: 1.2 });
  add(new THREE.PlaneGeometry(6.6, 1.5), tileM, 0, FLOOR + .75, BACK + .005, W, { shadow: false });
  const lt = add(new THREE.PlaneGeometry(5.1, 1.5), tileL, LEFT + .005, FLOOR + .75, -1.0, W, { shadow: false }); lt.rotation.y = Math.PI / 2;
  const trimB = M(0x2f6fa8, { roughness: .4 });
  rb(6.6, .07, .03, trimB, 0, FLOOR + 1.52, BACK + .02, W, .01, { shadow: false });
  rb(.03, .07, 5.1, trimB, LEFT + .02, FLOOR + 1.52, -1.0, W, .01, { shadow: false });
  const paint = pbr('plastered_wall', { repeat: [3, 1.2], tint: 0xdcefe9 });
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
  const wood = pbr('fine_grained_wood', { repeat: [1, 1], rough: .8 });
  rb(1.1, .8, .55, wood, 0, .4, 0, van, .02);
  for (const x of [-.27, .27]) { rb(.5, .66, .02, pbr('fine_grained_wood', { repeat: [.6, .6], rot: Math.PI / 2, rough: .8 }), x, .4, .285, van, .015); rb(.02, .12, .03, M(0xc9a15a, { metalness: .85, roughness: .3 }), x + (x < 0 ? .19 : -.19), .5, .3, van, .006); }
  rb(1.2, .05, .6, pbr('marble_01', { repeat: [1, .5], rough: .4, physical: true, clearcoat: .6 }), 0, .825, 0, van, .012);
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
  for (let i = 0; i < 16; i++) { let x = -11 + R() * 22; if (Math.abs(x) < 4.4) x += Math.sign(x || 1) * 4.8; const sz = .55 + R() * .5; bush(W, x, -4.6 - R() * 6, { w: sz * (1 + R() * .4), h: sz * .85, d: sz, seed: i, rot: R() * 6 }); }
  for (let i = 0; i < 9; i++) bush(W, -18 + i * 4.5, -13.4, { w: 2.6, h: .9, d: .7, seed: i + 3, rot: (R() - .5) * .2 });   // hedge along the fence
  const fenceM = pbr('fine_grained_wood', { repeat: [.3, 1], rot: Math.PI / 2, tint: 0xc9b49a });
  for (let x = -20; x <= 20; x += .5) rb(.12, 1.1, .06, fenceM, x, .55, -14, W, .02);
  for (const y of [.35, .85]) rb(40, .08, .05, fenceM, 0, y, -14.05, W, .01);
  for (const [x, z, c] of [[-10, -26, 0xf0e6d6], [9, -30, 0xe9dcc8], [-22, -34, 0xf3efe7]]) { rb(6, 4, 5, pbr('plastered_wall', { repeat: [3, 2], tint: c }), x, 2, z, W, .05); for (const s of [-1, 1]) { const r = rb(3.6, .2, 5.4, roofM, x + s * 1.45, 4.85, z, W, .03); r.rotation.z = -s * .62; } for (let i = 0; i < 3; i++) rb(.8, .9, .05, M(0x6fa3c8, { emissive: 0x3a6a8a, emissiveIntensity: .3 }), x - 1.8 + i * 1.8, 2.3, z + 2.52, W, .02); }

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x7a6448, .15); scene.add(hemi); refs.hemi = hemi;
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.4); sun.position.set(-8, 14, 10); sun.castShadow = true;
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
