// CLASSROOM SET (2026-11-19, replaces the explainer-kit classroom Xavier called a placeholder). A real US high-school
// classroom (research/classroom.md): ~30 x 30 ft (here x 1.4 studio scale), 10 ft ceiling with 2 x 2 ft acoustic tiles and
// 2 x 4 LED troffers, painted concrete-block walls, waxed VCT floor, a 12 ft whiteboard on the front (teaching) wall with
// the clock centred above it and the pull-down screen rolled up over it, a ceiling projector, the teacher's steel desk in
// the front corner by the door, a 3 x 5 US flag on a wall bracket in that corner, a bank of windows down one side,
// bulletin boards, bookcases and the rules poster. 25 student desks (5 x 5, rows facing the board, 75-90 cm aisles).
// Every model was looked at from 4 sides first (inspect.html). Room space: floor y 0, the board wall is n (-z).
//   const C = await classroom(scene)  ->  { room, seats: [{ x, z, hipY, desk, chair, row, col }], teacherSpot, board, door, ... }
import * as THREE from 'three';
import { room } from './roomkit.js';
import { mat } from '../materials.js';
import * as P from '../designs/school.js';
import { M } from '../designs/furniture.js';
import { treeParts, leafMat, barkMat } from './town.js';

export const W = 13.6, D = 14.0, H = 3.05 * 1.4;   // x across the board wall, z front to back, ceiling 10 ft
export async function classroom(scene, o = {}) {
  const wallMat = mat('cmu', { color: o.wall || '#dfe7ea' }), floorMat = mat('vct', { clearcoat: .5, clearcoatRough: .15 }), ceilMat = mat('ceilingTile');
  const R = await room(scene, { w: W, d: D, h: H, T: .3, wallMat, floorMat, ceilMat,
    walls: { w: [-4.5, 0, 4.5].map(at => ({ type: 'window', at, size: [3.6, 2.3], sill: 1.25 })),   // window bank on the left as you face the board
             e: [{ type: 'door', at: -D / 2 + 1.6, paint: { '373737': { color: '#c79a66', kind: 'SmoothPlastic' }, '111111': { color: '#8f959c', kind: 'Metal' }, a3a2a5: { color: '#d0d3d6', kind: 'Metal' } } }] },   // school door: light oak leaf, grey steel frame, satin handle                                                 // door at the front of the right wall (by the teacher)
    sockets: { n: [-5.2, 5.2], e: [1.5], s: [-3, 3] }, hide: o.hide || [] });
  const root = R.root, refs = { room: R, seats: [], root };
  const add = (obj, x, y, z, ry = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; root.add(obj); return obj; };
  // chair rail at desk height round the room (school corridors and rooms have one: chairs hit the wall there)
  for (const [k, L] of [['n', W], ['s', W], ['e', D], ['w', D]]) { const g = R.walls[k]; const b = new THREE.Mesh(new THREE.BoxGeometry(L, .06, .03), M.paint('#cfd6da')); b.position.set(0, 1.25, .165); g.add(b); }

  // ---------- front (teaching) wall ----------
  const board = P.whiteboard({ write: o.boardWrite || defaultBoard }); add(board, 0, 1.15, -D / 2 + .01); refs.board = board;
  add(P.screenCase(4.6), 0, H - .09, -D / 2 + .09);   // pull-down screen case tight under the ceiling, like the real ones
  const clk = await P.clock(); add(clk, 0, 3.22, -D / 2 + .01); refs.clock = clk;
  add(P.poster({ title: 'CLASS RULES', lines: ['1. Be on time', '2. Be respectful', '3. Phones away', '4. Raise your hand', '5. Do your best'] }), -4.4, 1.55, -D / 2 + .01);
  add(P.poster({ title: 'NEVER STOP LEARNING', bg: '#f2c94c', fg: '#1d2b44', lines: [] }), 4.25, 1.75, -D / 2 + .01);
  const flag = P.flag(); add(flag, W / 2 - .01, 2.9, -D / 2 + .55, -Math.PI / 2); refs.flag = flag;       // bracket on the right wall by the front corner
  const proj = P.projector(.5); add(proj, 0, H, -1.0, Math.PI); refs.projector = proj;
  // teacher's station: steel desk in the front-right corner facing the class, chair behind it, things on top
  const td = await P.teacherDesk(); add(td, 3.4, 0, -D / 2 + 1.75, Math.PI);   // drawers on the teacher's side, plain modesty panel toward the class refs.teacherDesk = td;
  const tb = new THREE.Box3().setFromObject(td), top = tb.max.y;
  const oc = await (await import('../designs/furniture.js')).officeChair(); add(oc, 3.4, 0, -D / 2 + .85, 0); refs.teacherChair = oc;
  add((await import('../designs/furniture.js')).monitor(.7), 3.0, top, -D / 2 + 1.55, Math.PI);   // screen faces the teacher's chair
  add(P.books(3, 4), 4.3, top, -D / 2 + 1.7, .2); add(P.tissues(), 2.3, top, -D / 2 + 1.95, -.1); add(await P.stapler(), 4.0, top, -D / 2 + 2.05, .5);
  add(await P.supplies(), 2.6, top, -D / 2 + 1.55, .3);
  add(P.bin('#4f5560'), 4.85, 0, -D / 2 + .55); add(P.bin('#2f62b0'), 1.95, 0, -D / 2 + .55);
  refs.teacherSpot = new THREE.Vector3(-1.4, 0, -D / 2 + 1.5);   // where the teacher stands to teach (in front of the board, not blocking it)

  // ---------- student desks: 5 x 5, rows face the board ----------
  const desk0 = P.desk(), chair0 = await P.chair();
  const db = new THREE.Box3().setFromObject(desk0), cb = new THREE.Box3().setFromObject(chair0);
  const deskTop = db.max.y, seatTop = seatHeight(chair0);
  const cols = [-4.9, -2.45, 0, 2.45, 4.9].map(x => x + .25), rows = [-3.6, -1.5, .6, 2.7, 4.8];
  rows.forEach((z, r) => cols.forEach((x, c) => {
    const dk = desk0.clone(true), ch = chair0.clone(true);
    add(dk, x, 0, z, Math.PI);                    // desk front (+z in the library) turned to face the board
    add(ch, x, 0, z + .74, Math.PI);              // chair behind it, also facing the board
    refs.seats.push({ x, z: z + .74, seatTop, deskTop, desk: dk, chair: ch, row: r, col: c, deskZ: z });
  }));
  // ---------- side and back walls ----------
  const cb1 = P.corkboard({ seed: 2 }); add(cb1, W / 2 - .01, 1.35, .6, -Math.PI / 2);
  const cb2 = P.corkboard({ seed: 5, w: 1.83 * 1.4 }); add(cb2, -2.0, 1.4, D / 2 - .01, Math.PI);
  add(P.poster({ title: 'READ EVERY DAY', bg: '#2f7d5b', lines: [] }), 2.4, 1.75, D / 2 - .01, Math.PI);
  { const bk = bookcase(); add(bk, W / 2 - .27, 0, 5.4, -Math.PI / 2); } { const bk = bookcase(); add(bk, W / 2 - .27, 0, 3.9, -Math.PI / 2); }
  add(await P.plant(), -W / 2 + .55, 0, D / 2 - .6);
  // ceiling: 2 x 4 troffers in three runs
  for (const x of [-4, 0, 4]) for (const z of [-4, 0, 4]) add(P.troffer(), x, H, z);

  // ---------- outside the windows: the school lawn, trees, the other wing across the courtyard ----------
  outside(scene, o);
  // ---------- light: sun through the windows, even ceiling light, sky fill ----------
  const L = lights(scene, R); Object.assign(refs, L);
  refs.deskTop = deskTop; refs.seatTop = seatTop;
  return refs;
}
// the seat surface height: highest mesh point near the middle of the chair (the backrest sits behind it)
function seatHeight(chair) {
  chair.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(chair), rc = new THREE.Raycaster(), hits = [];
  const c = b.getCenter(new THREE.Vector3()); rc.set(new THREE.Vector3(c.x, b.max.y + 1, c.z + (b.max.z - b.min.z) * .12), new THREE.Vector3(0, -1, 0));
  const meshes = []; chair.traverse(m => { if (m.isMesh) meshes.push(m); }); const h = rc.intersectObjects(meshes, true); return h.length ? h[0].point.y : b.max.y * .45;
}
// a classroom bookcase: maple laminate case, adjustable shelves, filled with textbooks and binders
function bookcase(w = .91 * 1.4, h = 1.22 * 1.4, d = .36 * 1.4) {
  const g = new THREE.Group(), lam = mat('laminate', { size: 1.6, clearcoat: .2 }), t = .025, n = 4;
  const box = (bw, bh, bd, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), lam); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); };
  box(t, h, d, -w / 2 + t / 2, h / 2, 0); box(t, h, d, w / 2 - t / 2, h / 2, 0); box(w, t, d, 0, h - t / 2, 0); box(w, .08, d, 0, .04, 0); box(w, h, .012, 0, h / 2, -d / 2 + .006);
  for (let i = 1; i < n; i++) box(w - 2 * t, t, d - .02, 0, .08 + i * (h - .08) / n, .01);
  const cols = ['#244a7a', '#7a2430', '#2f6b4f', '#c9902e', '#4b3a6b', '#2a2a2e', '#d8d2c4', '#3a6ea8'];
  for (let s = 0; s < n; s++) { let x = -w / 2 + t + .02; const y0 = .08 + s * (h - .08) / n + t / 2, sh = (h - .08) / n - t;
    while (x < w / 2 - t - .08) { const bw = .035 + ((x * 97) % 1 + 1) % 1 * .04, bh = sh * (.62 + (((x * 53) % 1 + 1) % 1) * .3), lean = ((x * 31) % 1 + 1) % 1 > .93;
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, d * .78), M.paint(cols[Math.floor((((x * 71) % 1 + 1) % 1) * cols.length)])); b.position.set(x + bw / 2, y0 + bh / 2, .02); if (lean) b.rotation.z = -.18; b.castShadow = b.receiveShadow = true; g.add(b); x += bw + .004; } }
  g.name = 'bookcase'; return g;
}
function defaultBoard(x, W, H) {
  x.fillStyle = '#1d4fb8'; let f = H * .13; x.font = `700 ${f}px Arial`; const t = 'Unit 4: The Water Cycle';
  while (x.measureText(t).width > W * .6) { f -= 4; x.font = `700 ${f}px Arial`; } x.fillText(t, W * .05, H * .2);
  x.fillStyle = '#222'; x.font = `500 ${H * .075}px Arial`; ['1. Evaporation', '2. Condensation', '3. Precipitation', '4. Collection'].forEach((s, i) => x.fillText(s, W * .07, H * (.38 + i * .13)));
  x.fillStyle = '#c22a2a'; x.font = `700 ${H * .07}px Arial`; x.fillText('HW: p. 112 #1-10', W * .66, H * .85);
  x.strokeStyle = '#1e8a46'; x.lineWidth = 8; x.beginPath(); x.arc(W * .74, H * .42, H * .16, 0, Math.PI * 2); x.stroke();   // a quick diagram circle
}
function outside(scene, o) {
  const sky = new THREE.Mesh(new THREE.SphereGeometry(160, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color('#bcd8f2').multiplyScalar(1.5), side: THREE.BackSide })); sky.userData.noProbe = true; scene.add(sky);
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), mat('grass', { size: 3 })); lawn.rotation.x = -Math.PI / 2; lawn.position.y = -.35; lawn.receiveShadow = true; scene.add(lawn);
  const walk = new THREE.Mesh(new THREE.BoxGeometry(3.2, .1, 70), mat('pavement')); walk.position.set(-W / 2 - 3.2, -.32, 0); walk.receiveShadow = true; scene.add(walk);
  // the school around this room: brick outer skin on the window wall, the opposite wing across the courtyard
  const wing = new THREE.Mesh(new THREE.BoxGeometry(14, 2 * 4.38, 90), mat('facadeBrick', { color: '#b5674c' })); wing.position.set(-W / 2 - 62, 2 * 4.38 / 2 - .35, 0);   // the far wing across the courtyard, 2 storeys wing.castShadow = wing.receiveShadow = true; scene.add(wing);
  const lm = leafMat(), bm = barkMat();
  [[-17, -8, 1], [-15, 7, 2], [-26, 14, 3], [-24, -16, 4], [-33, 1, 5], [-19, 24, 6], [-16, -25, 7], [-40, -10, 8], [-42, 12, 9]].forEach(([x, z, s]) => {
    const t = treeParts(s), g = new THREE.Group(); g.add(new THREE.Mesh(t.wood, bm), new THREE.Mesh(t.leaves, lm)); g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    g.position.set(x, -.35, z); g.scale.setScalar(1.1 + (s % 3) * .1); g.rotation.y = s; scene.add(g); });
}
function lights(scene, R) {
  scene.add(new THREE.HemisphereLight('#e6eef8', '#9a8c7a', .9));
  const sunDir = new THREE.Vector3(-1, .75, .35).normalize(), focus = new THREE.Vector3(-2, 1, 0);
  const sun = new THREE.DirectionalLight('#fff0d8', 3.2); sun.position.copy(focus).addScaledVector(sunDir, 30); sun.target.position.copy(focus); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 5, far: 70 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .03; scene.add(sun, sun.target);
  const ceil = []; for (const x of [-4, 0, 4]) for (const z of [-4, 0, 4]) { const l = new THREE.PointLight('#fff4e4', 4.2, 9, 1.5); l.position.set(x, R.H - .3, z); scene.add(l); ceil.push(l); }
  return { sun, ceilingLights: ceil };
}
