// Suburban street set (reusable): our house front with a real front door, a hallway behind it, the front yard,
// sidewalk + road, and neighbours' houses down the street, each with its own door. Stylised, same look as the house sets.
// Our facade is at z = 0 facing the street (+z). The hallway is behind it (z < 0). The road runs along x at z ≈ 9.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, canvasTex, rng } from '../util.js';
import { createDoor, addKnob, addLatch } from '../models/lock.js';

export const FLOOR = 0.3, DOOR_W = .9, DOOR_H = 2.04, WALL_H = 3.0;

export function buildWorld(scene) {
  const R = rng(31), W = grp(0, 0, 0, scene), refs = {};
  // ---------- sky ----------
  scene.background = canvasTex(512, 1024, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5b93cc'); gr.addColorStop(.6, '#a8cbe9'); gr.addColorStop(1, '#e6f0f8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const r = rng(3);
    for (let c = 0; c < 10; c++) { const cx = r() * w, cy = 60 + r() * h * .45, s = 40 + r() * 70; for (let i = 0; i < 16; i++) { const x = cx + (r() - .5) * s * 2.6, y = cy + (r() - .5) * s * .5, rad = s * (.35 + r() * .45); const rg = g.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, 'rgba(255,255,255,.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); } }
  });
  scene.fog = new THREE.Fog(0xd8e7f3, 30, 110);

  // ---------- ground: lawn, path, sidewalk, road ----------
  const lawnTex = canvasTex(512, 512, (g, w, h) => { const r = rng(5); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#5d9c3a' : '#6aab44'; g.fillRect(i * w / 8, 0, w / 8, h); } for (let i = 0; i < 12000; i++) { g.fillStyle = r() < .5 ? 'rgba(35,75,20,.25)' : 'rgba(160,210,95,.22)'; g.fillRect(r() * w, r() * h, 1.5, 3.5); } }, [30, 16]);
  const lawn = add(new THREE.PlaneGeometry(120, 60), new THREE.MeshStandardMaterial({ map: lawnTex, roughness: .95 }), 0, 0, -10, W); lawn.rotation.x = -Math.PI / 2; refs.lawn = lawn;
  const concrete = M(0xc9c4ba, { roughness: .9 }), asphalt = M(0x4a4d52, { roughness: .95 });
  rb(120, .04, 2.0, concrete, 0, .02, 7.4, W, .01, { shadow: false });                                        // sidewalk
  for (let x = -60; x < 60; x += 1.5) rb(.03, .045, 2.0, M(0xa9a59c), x, .021, 7.4, W, .005, { shadow: false });   // sidewalk joints
  rb(120, .02, 7, asphalt, 0, .005, 11.9, W, .005, { shadow: false });                                        // road
  for (let x = -60; x < 60; x += 4) rb(2, .025, .15, M(0xf2f0e6), x, .016, 11.9, W, .005, { shadow: false });
  rb(120, .14, .25, concrete, 0, .07, 8.45, W, .01);                                                          // kerb

  // lap siding: horizontal boards with a shadow line under each (tinted per house by material.color)
  const SIDING = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); const r = rng(13); for (let y = 0; y < h; y += 32) { const gr = g.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.8, 'rgba(0,0,0,.04)'); gr.addColorStop(.93, 'rgba(0,0,0,.2)'); gr.addColorStop(1, 'rgba(0,0,0,.05)'); g.fillStyle = gr; g.fillRect(0, y, w, 32); } for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(0,0,0,${r() * .03})`; g.fillRect(r() * w, r() * h, 8 + r() * 30, 1); } }, [3, 3.4]);
  // ---------- a house front with a door opening (reused for us and the neighbours) ----------
  function house(x0, z0, ry, { body = 0xf0e6d6, trim = 0xffffff, roof = 0xa5472b, door = 0x2f6f8f, wide = 8, ours = false } = {}) {
    const H = grp(x0, 0, z0, W); H.rotation.y = ry;
    const wall = new THREE.MeshStandardMaterial({ map: SIDING, color: body, roughness: .85 }), tr = M(trim, { roughness: .5 }), dw = DOOR_W + .14, dh = DOOR_H + .07;
    // facade around the door opening
    rb((wide - dw) / 2, WALL_H, .25, wall, -(dw + (wide - dw) / 2) / 2, FLOOR + WALL_H / 2, -.125, H, .01);
    rb((wide - dw) / 2, WALL_H, .25, wall, (dw + (wide - dw) / 2) / 2, FLOOR + WALL_H / 2, -.125, H, .01);
    rb(dw, WALL_H - dh, .25, wall, 0, FLOOR + dh + (WALL_H - dh) / 2, -.125, H, .01);
    rb(wide + .3, .3, 6, M(0xb5b0a6), 0, .15, -3, H, .01);                                                     // plinth / floor slab
    // porch, steps, path
    rb(2.4, FLOOR, 1.6, M(0xd8d2c6, { roughness: .8 }), 0, FLOOR / 2, .8, H, .02);
    rb(1.6, FLOOR / 2, .35, M(0xd8d2c6, { roughness: .8 }), 0, FLOOR / 4, 1.78, H, .02);
    rb(1.1, .02, 5.1, concrete, 0, .012, 4.4, H, .005, { shadow: false });
    // porch roof on two posts + light
    rb(2.6, .12, 1.7, tr, 0, FLOOR + 2.55, .75, H, .02);
    for (const sx of [-1.15, 1.15]) rb(.1, 2.5, .1, tr, sx, FLOOR + 1.25, 1.5, H, .02);
    add(cyl(.07, .05, .2, 16), M(0xfff1c9, { emissive: 0xffe0a0, emissiveIntensity: .6 }), .7, FLOOR + 2.3, .08, H);
    // windows either side
    for (const sx of [-2.6, 2.6]) {
      rb(1.3, 1.25, .06, M(0x9ec7e8, { roughness: .1, emissive: 0x5a8ab0, emissiveIntensity: .25 }), sx, FLOOR + 1.55, .01, H, .01);
      for (const [w, h, x, y] of [[1.45, .09, 0, .67], [1.45, .09, 0, -.67], [.09, 1.4, -.68, 0], [.09, 1.4, .68, 0], [.05, 1.25, 0, 0]]) rb(w, h, .09, tr, sx + x, FLOOR + 1.55 + y, .03, H, .01);
      rb(1.5, .07, .2, tr, sx, FLOOR + .86, .08, H, .01);
      for (const so of [-1, 1]) rb(.36, 1.4, .05, M(door, { roughness: .6 }), sx + so * .9, FLOOR + 1.55, .04, H, .01);   // shutters in the door colour
      for (let i = 0; i < 4; i++) add(new THREE.IcosahedronGeometry(.28, 1), M([0x4e8b3a, 0x5c9a42, 0x467f33][i % 3], { roughness: .9 }), sx - .5 + i * .33, .25, .45, H);
    }
    // roof
    for (const s of [-1, 1]) { const r = rb(wide / 2 + .6, .18, 6.6, M(roof, { roughness: .8 }), s * (wide / 4 + .1), FLOOR + WALL_H + 1.1, -3, H, .03); r.rotation.z = -s * .5; }
    const gab = new THREE.Shape(); gab.moveTo(-wide / 2, 0); gab.lineTo(wide / 2, 0); gab.lineTo(0, 2.2); gab.lineTo(-wide / 2, 0);
    add(new THREE.ShapeGeometry(gab), wall, 0, FLOOR + WALL_H, 0, H);
    // the door, in its frame, flush with the facade
    const d = createDoor({ w: DOOR_W, h: DOOR_H }); d.group.position.set(0, FLOOR, -.05); H.add(d.group);
    d.slab.children[0].material = d.slab.children[0].material.clone(); d.slab.children[0].material.color.set(door);
    d.slab.children.forEach(c => { if (c.isMesh && c.material.name !== 'brass') c.material = d.slab.children[0].material; });
    const knob = addKnob(d), latch = addLatch(d);
    return { group: H, door: d, knob, latch };
  }

  // ---------- our house + hallway behind the door ----------
  const ours = house(0, 0, 0, { ours: true });
  refs.house = ours; refs.door = ours.door; refs.knob = ours.knob; refs.latch = ours.latch;
  const hall = grp(0, 0, 0, W), hw = 2.4, hd = 4.2;
  const plank = canvasTex(512, 512, (g, w, h) => { const r = rng(7); for (let i = 0; i < 8; i++) { g.fillStyle = ['#b98a5a', '#a87b4d', '#c49567', '#b08254'][i % 4]; g.fillRect(i * w / 8, 0, w / 8, h); g.fillStyle = 'rgba(60,35,15,.5)'; g.fillRect(i * w / 8, 0, 2, h); g.fillRect(i * w / 8, (r() * h) | 0, w / 8, 2); } for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(80,50,25,${r() * .08})`; g.fillRect(r() * w, r() * h, 1, 10 + r() * 30); } }, [2, 3]);
  const hf = add(new THREE.PlaneGeometry(hw, hd), new THREE.MeshStandardMaterial({ map: plank, roughness: .55 }), 0, FLOOR + .001, -hd / 2 - .25, hall, { shadow: false }); hf.rotation.x = -Math.PI / 2; hf.receiveShadow = true;
  const paint = M(0xe9e1d2, { roughness: .9 });
  for (const s of [-1, 1]) rb(.1, WALL_H, hd, paint, s * (hw / 2 + .05), FLOOR + WALL_H / 2, -hd / 2 - .25, hall, .01);
  rb(hw + .2, .1, hd, M(0xf7f5f0), 0, FLOOR + WALL_H + .05, -hd / 2 - .25, hall, .01);
  rb(hw + .2, WALL_H, .1, paint, 0, FLOOR + WALL_H / 2, -hd - .3, hall, .01);
  for (const s of [-1, 1]) rb(.02, .1, hd, M(0xffffff), s * hw / 2, FLOOR + .05, -hd / 2 - .25, hall, .005, { shadow: false });   // skirting
  // hallway dressing: coat hooks + coat, a small table with a bowl for keys, a picture, a runner rug
  rb(.6, .05, .08, M(0x7a5232), -hw / 2 + .04, FLOOR + 1.7, -.9, hall, .01);
  const coat = rb(.08, .7, .38, M(0x3f6b4a, { roughness: 1 }), -hw / 2 + .1, FLOOR + 1.3, -.9, hall, .04);
  rb(.35, .05, .7, M(0x8a5a3c), hw / 2 - .2, FLOOR + .8, -1.6, hall, .01); for (const [x, z] of [[-.12, -.3], [-.12, .3], [.12, -.3], [.12, .3]]) rb(.03, .78, .03, M(0x6a4428), hw / 2 - .2 + x, FLOOR + .39, -1.6 + z, hall, .005);
  add(new THREE.SphereGeometry(.09, 24, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xe8865a, { side: THREE.DoubleSide }), hw / 2 - .2, FLOOR + .9, -1.6, hall);
  rb(.04, .5, .7, M(0x2f6fa8), hw / 2 - .03, FLOOR + 1.6, -1.6, hall, .01); rb(.02, .42, .62, M(0xf2c14e, { emissive: 0x403010, emissiveIntensity: .2 }), hw / 2 - .05, FLOOR + 1.6, -1.6, hall, .005);
  rb(.9, .012, 2.6, M(0xc96d4d, { roughness: 1 }), 0, FLOOR + .006, -1.9, hall, .005, { shadow: false });
  add(new THREE.SphereGeometry(.22, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(0xffffff, { emissive: 0xfff3dc, emissiveIntensity: 1.1 }), 0, FLOOR + WALL_H - .02, -1.6, hall, { shadow: false });
  const hallLight = new THREE.PointLight(0xfff1dc, 5, 6, 1.4); hallLight.position.set(0, FLOOR + WALL_H - .3, -1.6); scene.add(hallLight); refs.hallLight = hallLight;
  refs.hall = { w: hw, d: hd };
  // mailbox at the end of the path
  rb(.08, 1.0, .08, M(0x5a5048), 1.2, .5, 6.1, W, .01); rb(.45, .3, .25, M(0x2f4f6f), 1.2, 1.12, 6.1, W, .05);

  // ---------- neighbours down the street ----------
  const nb = [];
  for (const [x, z, ry, o] of [[-10, 0, 0, { body: 0xe9dcc8, door: 0x8f3b2f, roof: 0x5a5a62 }], [10, 0, 0, { body: 0xdfe8ea, door: 0x3f7a4a, roof: 0x8a3f2c }], [20, 0, 0, { body: 0xf3e2c6, door: 0x2c2f38, roof: 0x5a5a62 }], [-20, 0, 0, { body: 0xe3e9f0, door: 0xc28a2a, roof: 0x8a3f2c }],
    [-5, 24, Math.PI, { body: 0xf0e0d0, door: 0x4a3f8f }], [6, 24, Math.PI, { body: 0xe6efe0, door: 0x8f2f5a, roof: 0x5a5a62 }]]) nb.push(house(x, z, ry, o));
  refs.neighbours = nb;
  // trees + hedges + fences between yards
  const tree = (x, z, s) => { const g = grp(x, 0, z, W); g.scale.setScalar(s); add(cyl(.16, .28, 3, 10), M(0x5b4130, { roughness: .9 }), 0, 1.5, 0, g); for (let i = 0; i < 11; i++) add(new THREE.IcosahedronGeometry(.75 + R() * .6, 2), M([0x4f8a35, 0x5d9b3e, 0x447a2f, 0x67a548][i % 4], { roughness: .9 }), (R() - .5) * 2.4, 3.2 + R() * 1.8, (R() - .5) * 2.0, g); };
  for (const [x, z, s] of [[-5.2, 4.5, 1.1], [5.4, 3.8, 1.2], [-15, 4.2, 1.3], [15, 4.6, 1.1], [-25, 4, 1.2], [25, 4, 1.3], [0, 17, 1.2], [-12, 17, 1.4], [12, 17, 1.3]]) tree(x, z, s);
  for (const x of [-5, 5, -15, 15]) for (let z = .3; z < 6.3; z += .45) rb(.06, .9, .06, M(0xffffff, { roughness: .6 }), x, .45, z, W, .01);
  for (const x of [-5, 5, -15, 15]) for (const y of [.35, .75]) rb(.04, .06, 6, M(0xffffff), x, y, 3.3, W, .01);
  for (const x of [-60, 60]) rb(.1, .1, .1, M(0xffffff), x, 0, 0, W);

  // ---------- lights ----------
  const hemi = new THREE.HemisphereLight(0xd6e8ff, 0x7a6448, .9); scene.add(hemi); refs.hemi = hemi;
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.6); sun.position.set(-6, 14, 12); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -8, near: 1, far: 60 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 5;
  scene.add(sun); refs.sun = sun; refs.W = W;
  return refs;
}
