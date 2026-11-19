// CLASSROOM set (reusable): bright Roblox-game classroom like the reference. Pale-blue painted walls over a light grey
// dado, white veined marble floor, grey tiled ceiling with round lights, a wall of aluminium windows (left, -x),
// whiteboard + clock + teacher desk at the front (-z), door / noticeboard / bookshelf on the right, lockers + AC at the back.
// Lighting: "game" look = everything evenly and fully lit, soft light shadows, nothing dark.
// refs: desks[{ desk, chair, seat }], teacher{ desk, chair }, board, clock, door, windows[], hemi, sun, room{ w, d, h }
import * as THREE from 'three';
import { M, rb, add, grp, canvasTex } from '../util.js';
import * as P from '../props/school.js';
import * as N from '../props/nature.js';
import { pbr, aoStrip } from '../pbr.js';
import { surround } from './surround.js';
import * as F from '../foliage.js';
import { pending } from '../detail.js';

export const ROOM = { w: 9, d: 10, h: 3.2 }, FLOOR = 0;

export function buildWorld(scene) {
  const { w: W, d: D, h: H } = ROOM, G = grp(0, 0, 0, scene), refs = { desks: [], scene };
  scene.fog = new THREE.Fog(0xcfe2f0, 60, 220);
  // ---------- materials (texture-mapped: paint has an orange-peel normal, floor is polished veined marble) ----------
  // Xavier 2026-10-28 'what would it typically be': school walls are PAINTED CONCRETE BLOCK (8x16" running bond), floors are
  // waxed VCT tile (speckled 12" squares). Same colours as before, real surfaces.
  const wallPaint = pbr('gen/cmu_block', { tint: 0xaad6f2, noColor: true, noRough: true, rough: .8, normal: .4, rep: [1 / 1.62, 1 / 1.62] });
  const dado = pbr('gen/cmu_block', { tint: 0xe1e7ec, noColor: true, noRough: true, rough: .6, normal: .4, rep: [6.2, .59] }), rail = M(0xf5f7f9, { roughness: .35 });
  const floorMat = pbr('gen/vct_floor', { rep: [W / 1.22, D / 1.22], physical: true, clearcoat: .45, clearcoatRough: .12, rough: 1, normal: .6 });
  add(new THREE.BoxGeometry(W, .1, D), floorMat, 0, -.05, 0, G).receiveShadow = true; refs.floorMat = floorMat;
  const ceil = add(new THREE.PlaneGeometry(W, D), pbr('gen/ceiling_tile', { rep: [W / .6, D / .6], tint: 0xc4c8ce, normal: .8, rough: .95, noRough: true }), 0, H, 0, G, { shadow: false }); ceil.rotation.x = Math.PI / 2;
  const brick = pbr('ph/red_brick_03', { rep: [.45, .45], normal: 1.2, tint: 0xf0e2d6 });
  // walls (window / door openings), brick skin outside, dado + chair rail + skirting inside
  const wall = (len, x, z, ry, holes) => {
    const g = grp(x, 0, z, G); g.rotation.y = ry;
    const mk = () => { const shape = new THREE.Shape(); shape.moveTo(-len / 2 - .2, -.3); shape.lineTo(len / 2 + .2, -.3); shape.lineTo(len / 2 + .2, H + .35); shape.lineTo(-len / 2 - .2, H + .35); shape.lineTo(-len / 2 - .2, -.3);
      for (const [hx, hy, hw, hh] of holes || []) { const p = new THREE.Path(); p.moveTo(hx - hw / 2, hy - hh / 2); p.lineTo(hx - hw / 2, hy + hh / 2); p.lineTo(hx + hw / 2, hy + hh / 2); p.lineTo(hx + hw / 2, hy - hh / 2); p.lineTo(hx - hw / 2, hy - hh / 2); shape.holes.push(p); } return shape; };
    const geo = new THREE.ExtrudeGeometry(mk(), { depth: .2, bevelEnabled: false }); geo.translate(0, 0, -.2);
    const m = new THREE.Mesh(geo, [wallPaint, M(0xe9edf1, { roughness: .7 })]); m.receiveShadow = true; m.castShadow = true; g.add(m);
    const skin = new THREE.Mesh(new THREE.ExtrudeGeometry(mk(), { depth: .02, bevelEnabled: false }), brick); skin.position.z = -.22; skin.castShadow = skin.receiveShadow = true; g.add(skin);
    const low = holes && holes.some(h => h[1] - h[3] / 2 < 1.0);
    if (!low) { rb(len, .95, .015, dado, 0, .475, .008, g, .003); rb(len, .05, .03, rail, 0, .96, .015, g, .008); }
    rb(len, .1, .025, M(0xc9d1d9, { roughness: .45 }), 0, .05, .013, g, .006);
    // ambient occlusion where wall meets floor and ceiling
    const f = aoStrip(len, .4, { opacity: .22 }); f.rotation.x = -Math.PI / 2; f.position.set(0, .003, .2); f.rotation.z = Math.PI; g.add(f);
    const w1 = aoStrip(len, .35, { opacity: .18 }); w1.position.set(0, .17, .03); w1.rotation.z = Math.PI; g.add(w1);
    const c1 = aoStrip(len, .3, { opacity: .14 }); c1.position.set(0, H - .15, .03); g.add(c1);
    return g;
  };
  const winY = 1.75, winH = 1.6, winW = 2.2, winXs = [-2.8, 0, 2.8];
  wall(D, -W / 2, 0, Math.PI / 2, winXs.map(z => [z, winY, winW, winH]));
  wall(D, W / 2, 0, -Math.PI / 2, [[-D / 2 + 1.3, 1.05, 1.0, 2.1]]);
  wall(W, 0, -D / 2, 0); wall(W, 0, D / 2, Math.PI);
  { const g = grp(-W / 2, 0, 0, G); g.rotation.y = Math.PI / 2; rb(D, .95, .015, dado, 0, .475, .008, g, .003); rb(D, .05, .03, rail, 0, .96, .015, g, .008); }
  refs.windows = winXs.map(z => { const u = P.windowUnit({ w: winW, h: winH }); u.position.set(-W / 2 - .1, winY, z); u.rotation.y = Math.PI / 2; G.add(u); return u; });
  // ---------- the campus outside: the rest of the school, a courtyard, trees, the far wing, the town beyond ----------
  campus(G, W, D, H, brick, refs);
  // front: whiteboard, clock, teacher desk + chair, flag of posters
  const board = P.whiteboard({ w: 3.4, h: 1.25 }); board.group.position.set(0, 1.55, -D / 2 + .02); G.add(board.group); refs.board = board;
  board.write((x, w, h) => { x.fillStyle = '#2756c9'; x.font = `700 ${h * .12}px Comic Sans MS, Chalkboard, sans-serif`; x.fillText('Today: How Roblox works', w * .05, h * .18); x.fillStyle = '#333'; x.font = `500 ${h * .07}px Comic Sans MS, sans-serif`; ['1. Servers', '2. Packets', '3. Lag'].forEach((s, i) => x.fillText(s, w * .07, h * (.36 + i * .12))); });
  const clock = P.wallClock(); clock.group.position.set(0, 2.72, -D / 2 + .02); clock.set(10, 9, 30); G.add(clock.group); refs.clock = clock;
  const td = P.teacherDesk(); td.position.set(2.2, 0, -D / 2 + 1.6); G.add(td);
  const tc = P.officeChair(); tc.position.set(2.2, 0, -D / 2 + .95); tc.rotation.y = Math.PI; G.add(tc); refs.teacher = { desk: td, chair: tc };
  const books = P.bookshelf({ w: .9, h: 1.2, shelves: 3, seed: 9 }); books.position.set(-W / 2 + .7, 0, -D / 2 + .2); G.add(books);
  const pA = P.poster({ w: .55, h: .75, draw: posterAlphabet }); pA.position.set(-2.6, 1.8, -D / 2 + .01); G.add(pA);
  const pB = P.poster({ w: .55, h: .75, draw: posterPlanets }); pB.position.set(2.6, 1.8, -D / 2 + .01); G.add(pB);
  // right wall: door, noticeboard, bookshelf, bin, plant
  const door = P.door(); door.group.position.set(W / 2 - .05, 0, -D / 2 + 1.3); door.group.rotation.y = -Math.PI / 2; G.add(door.group); refs.door = door;
  const nb = P.noticeBoard(); nb.position.set(W / 2 - .02, 1.6, .4); nb.rotation.y = -Math.PI / 2; G.add(nb);
  const shelf = P.bookshelf({ seed: 4 }); shelf.position.set(W / 2 - .2, 0, 2.6); shelf.rotation.y = -Math.PI / 2; G.add(shelf);
  const bin = P.trashBin(); bin.position.set(W / 2 - .35, 0, -D / 2 + 2.3); G.add(bin);
  const pl = P.plant({ seed: 2 }); pl.position.set(W / 2 - .45, 0, D / 2 - .45); G.add(pl);
  const pl2 = P.plant({ seed: 7, h: .8 }); pl2.position.set(-W / 2 + .45, 0, D / 2 - .45); G.add(pl2);
  // back wall: lockers, AC unit, posters, backpacks on the floor
  const lk = P.lockers({ n: 6 }); lk.position.set(0, 0, D / 2 - .25); lk.rotation.y = Math.PI; G.add(lk);
  const ac = P.acUnit(); ac.position.set(0, 2.65, D / 2 - .12); ac.rotation.y = Math.PI; G.add(ac);
  // ceiling lights (3 x 3)
  for (const x of [-2.4, 2.4]) for (const z of [-3, 0, 3]) { const l = P.ceilingLight(); l.position.set(x, H, z); G.add(l); }
  // student desks: 4 columns x 4 rows, each with a chair; a couple of backpacks
  const cols = [-2.7, -.9, .9, 2.7], rows = [-2.3, -.6, 1.1, 2.8];
  rows.forEach((z, r) => cols.forEach((x, c) => {
    const dk = P.desk(), ch = P.chair(); dk.position.set(x, 0, z); ch.position.set(x, 0, z + .5); G.add(dk, ch);
    refs.desks.push({ desk: dk, chair: ch, seat: new THREE.Vector3(x, .45, z + .5), row: r, col: c });
  }));
  for (const [x, z, c] of [[-2.35, -1.95, 0xd94b4b], [1.25, 1.45, 0x3b7dd8], [-.55, 3.15, 0x2fa36b]]) { const b = P.backpack({ color: c }); b.position.set(x, 0, z); b.rotation.y = .4; G.add(b); }
  // ---------- lighting: bright game look, but with direction: sun through the windows, glowing ceiling lights,
  // sky fill from the HDRI (also gives every glossy surface something to reflect) ----------
  const hemi = new THREE.HemisphereLight(0xeef5ff, 0xd9d2c7, .9); scene.add(hemi); refs.hemi = hemi;
  const amb = new THREE.AmbientLight(0xffffff, .18); scene.add(amb); refs.amb = amb;
  const sun = new THREE.DirectionalLight(0xfff0d6, 3.4); sun.position.set(-14, 11, 5); sun.target.position.set(-1, 0, 0); scene.add(sun.target); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 70 }); sun.shadow.bias = -.0008; sun.shadow.normalBias = .08; sun.shadow.radius = 4;
  scene.add(sun); refs.sun = sun;
  refs.ceilingLights = [];
  for (const x of [-2.4, 2.4]) for (const z of [-3, 0, 3]) { const l = new THREE.PointLight(0xfff2e0, 3.2, 7.5, 1.6); l.position.set(x, H - .35, z); scene.add(l); refs.ceilingLights.push(l); }
  sky(scene, refs);
  // reflections: capture the finished room once into a cube map for the polished floor and glossy bits
  refs.bake = renderer => {
    const rt = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType }); const cc = new THREE.CubeCamera(.05, 80, rt); cc.position.set(0, 1.3, 0);
    const vis = []; scene.traverse(o => { if (o.isMesh && o.material === floorMat) { vis.push(o); o.visible = false; } });
    cc.update(renderer, scene); vis.forEach(o => o.visible = true); floorMat.envMap = rt.texture; floorMat.envMapIntensity = .9; floorMat.needsUpdate = true;
  };
  refs.room = ROOM; refs.W = G;
  return refs;
}

function posterAlphabet(x, W, H) { x.fillStyle = '#fff7e0'; x.fillRect(0, 0, W, H); const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', c = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
  x.font = `800 ${W * .13}px Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; for (let i = 0; i < 26; i++) { x.fillStyle = c[i % 5]; x.fillText(L[i], W * (.14 + (i % 5) * .18), H * (.1 + Math.floor(i / 5) * .16)); } }
function posterPlanets(x, W, H) { x.fillStyle = '#0d1b3d'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; for (let i = 0; i < 120; i++) x.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  const p = [['#f4c430', .18], ['#c1440e', .05], ['#3a7bd5', .07], ['#e0b46c', .13], ['#d9c27e', .1]]; p.forEach(([c, r], i) => { x.fillStyle = c; x.beginPath(); x.arc(W * (.25 + (i % 2) * .45), H * (.15 + i * .17), W * r, 0, 7); x.fill(); });
  x.fillStyle = '#fff'; x.font = `800 ${W * .1}px Arial`; x.textAlign = 'center'; x.fillText('PLANETS', W / 2, H * .96); }

// HDRI sky: background + image-based light (soft sky fill and reflections everywhere)
function sky(scene, refs) {
  const url = new URL('../assets/ph/kloofendal_48d_partly_cloudy_puresky/kloofendal_48d_partly_cloudy_puresky.hdr', import.meta.url).href;
  scene.background = new THREE.Color(0xa8d0f2);
  // web viewers can't serve .hdr, so they set globalThis.SKY_LDR and get the tone-mapped JPG of the same sky
  const ldr = !!globalThis.SKY_LDR, load = ldr ? new THREE.TextureLoader().loadAsync(new URL('sky_ldr.jpg', url).href).then(t => (t.colorSpace = THREE.SRGBColorSpace, t))
    : import('three/addons/loaders/RGBELoader.js').then(({ RGBELoader }) => new RGBELoader().loadAsync(url));
  pending.push(load.then(t => {
    t.mapping = THREE.EquirectangularReflectionMapping; scene.background = t; scene.environment = t; scene.environmentIntensity = ldr ? .75 : .55; scene.backgroundIntensity = 1.0; scene.backgroundRotation = new THREE.Euler(0, 1.2, 0); scene.environmentRotation = new THREE.Euler(0, 1.2, 0);
  }).catch(() => {}));
}

// the rest of the school around the classroom, so every window and doorway looks onto a real place
function campus(G, W, D, H, brick, refs) {
  const GY = -.3, X0 = -W / 2 - .22;   // outside ground level, outer face of our window wall
  const concrete = pbr('ph/concrete_pavement_02', { rep: [1, 1], normal: 1, tint: 0xe6e2da });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x23384f, roughness: .05, metalness: .2, envMapIntensity: 1.4 });
  const trim = M(0xe9e4dc, { roughness: .6 }), roof = M(0x8e9399, { roughness: .9 });
  surround(G, refs.scene, { box: [-37, 8.5, -32, 32], GY, seed: 3 });   // town, roads, hills: nothing empty past the fence
  // building block: brick box with rows of windows on its long -x / +x faces, a parapet and roof clutter
  const block = (x0, x1, z0, z1, floors, winSide) => {
    const w = x1 - x0, d = z1 - z0, h = floors * 3.6 + .5, g = grp((x0 + x1) / 2, GY, (z0 + z1) / 2, G);
    const bx = add(boxUV(new THREE.BoxGeometry(w, h, d), w, h, d), brick, 0, h / 2, 0, g); bx.castShadow = bx.receiveShadow = true;
    rb(w + .3, .35, d + .3, trim, 0, h + .17, 0, g, .03); rb(w + .1, .5, d + .1, concrete, 0, .25, 0, g, .02);
    for (let f = 0; f < floors; f++) rb(w + .12, .18, d + .12, trim, 0, 3.6 * (f + 1) + .2, 0, g, .02);   // floor bands
    for (const side of winSide) {
      const n = Math.floor(d / 3.3);
      for (let f = 0; f < floors; f++) for (let i = 0; i < n; i++) {
        const z = -d / 2 + (i + .5) * d / n, y = 3.6 * f + 1.95, sx = side * (w / 2 + .02);
        const u = P.windowUnit({ w: 2.2, h: 1.6 }); u.position.set(sx, y, z); u.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(u);
        const gl = add(new THREE.PlaneGeometry(2.15, 1.55), glass, sx + side * .005, y, z, g, { shadow: false }); gl.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    }
    for (let i = 0; i < 3; i++) rb(1.2, .8, .9, M(0xcfd3d8, { roughness: .5, metalness: .3 }), (i - 1) * w * .25, h + .75, (i % 2 ? 1 : -1) * d * .2, g, .05);
    return g;
  };
  // our wing: the classroom sits on the ground floor; floor above + classrooms either side, corridor behind (+x)
  block(X0, W / 2 + 3.4, D / 2 + .22, D / 2 + 26, 2, [-1]);
  block(X0, W / 2 + 3.4, -D / 2 - 26, -D / 2 - .22, 2, [-1]);
  { const g = grp(0, 0, 0, G), up = add(boxUV(new THREE.BoxGeometry(W + .44, 3.95, D + .44), W + .44, 3.95, D + .44), brick, 0, H + .3 + 3.95 / 2, 0, g); up.castShadow = true;   // storey above us
    for (const z of [-2.8, 0, 2.8]) { const u = P.windowUnit({ w: 2.2, h: 1.6 }); u.position.set(X0 + .02, H + 2.2, z); u.rotation.y = Math.PI / 2; g.add(u); const gl = add(new THREE.PlaneGeometry(2.15, 1.55), glass, X0 - .005, H + 2.2, z, g, { shadow: false }); gl.rotation.y = -Math.PI / 2; }
    rb(W + .6, .18, D + .6, trim, 0, H + .3, 0, g, .02); rb(W + .7, .35, D + .7, trim, 0, H + .3 + 3.95 + .17, 0, g, .03); }
  block(W / 2 + .22, W / 2 + 3.4, -D / 2 - .22, D / 2 + .22, 2, []);                                  // corridor behind the door
  // a wide path along the building, planters under our windows
  const path = add(new THREE.BoxGeometry(3, .06, 62), concrete, X0 - 1.7, GY + .03, 0, G); path.receiveShadow = true;
  path.material = pbr('ph/concrete_pavement_02', { rep: [2, 40], normal: 1, tint: 0xe6e2da });
  for (const z of [-4.2, -1.4, 1.4, 4.2, -7, 7, -10, 10]) { const b = N.bush({ w: 1.1, h: .7, seed: Math.round(z * 10) + 50, kind: Math.abs(z) > 5 ? 'box' : (z > 0 ? 'flower' : 'round') }); b.position.set(X0 - .5, GY, z); G.add(b); }
  // courtyard: cross path, trees, benches, flower beds, lamps, flagpole
  const cross = add(new THREE.BoxGeometry(24, .06, 2.6), pbr('ph/concrete_pavement_02', { rep: [16, 2], normal: 1, tint: 0xe6e2da }), X0 - 15, GY + .03, 0, G); cross.receiveShadow = true;
  const treeSpots = [[-11, -9, 6.5], [-12, 8, 7], [-19, -4, 6], [-21, 11, 7.5], [-8, 15, 5.5], [-9, -16, 6], [-24, -13, 7]];
  const kinds = ['oak', 'maple', 'birch', 'maple', 'oak', 'birch', 'pine'];
  treeSpots.forEach(([x, z, h], i) => { const t = N.tree({ h, seed: i + 3, type: kinds[i] }); t.position.set(x, GY, z); t.rotation.y = i; G.add(t); });
  for (const [x, z, r] of [[-9.5, -3.2, 0], [-14, 3.2, Math.PI], [-18.5, -3.2, 0]]) { const b = N.bench(); b.position.set(x, GY, z); b.rotation.y = r; G.add(b); }
  for (const [x, z] of [[-11.5, 3.6], [-16.5, -3.6]]) { const f = N.flowerBed({ w: 2.6, d: 1.1, seed: x }); f.position.set(x, GY, z); G.add(f); }
  for (const z of [-8, 8]) { const l = N.lampPost(); l.position.set(X0 - 3.6, GY, z); G.add(l); }
  for (const x of [-12, -18]) { const l = N.lampPost(); l.position.set(x, GY, 1.6); G.add(l); }
  const fp = N.flagpole(); fp.group.position.set(-15, GY, 0); G.add(fp.group); refs.flag = fp.flag;
  for (const z of [-11, 11]) { const h = N.hedge({ len: 5, h: .9 }); h.position.set(-15, GY, z); G.add(h); }
  // far wing across the courtyard (3 storeys) and a railing + town beyond the open side
  block(-34, -27, -31.2, 31.2, 3, [1]);
  for (const s of [-1, 1]) { const r = N.railing({ len: 22.2 }); r.position.set(-15.86, GY, s * 31); G.add(r); }   // courtyard fence between the wings
  // trees along the fence, poplars by the far wing
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const t = N.tree({ type: i % 2 ? 'maple' : 'oak', h: 6 + (i % 3), seed: 70 + i * 2 + (s > 0 ? 1 : 0) }); t.position.set(-8 - i * 4.4, GY, s * (28 + (i % 2) * .8)); t.rotation.y = i; G.add(t); }
  for (let i = 0; i < 6; i++) { const t = N.tree({ type: 'poplar', h: 9 + (i % 2), seed: 90 + i }); t.position.set(-25, GY, -22 + i * 8.8); G.add(t); }
  // lawn grass blades everywhere the courtyard is lawn
  const isPath = (x, z) => (x > X0 - 3.3 && x < X0 - .1) || (Math.abs(z) < 1.45 && x > X0 - 27 && x < X0 - 3) || (Math.abs(x + 15) < .5 && Math.abs(z) < .5);
  const isBed = (x, z) => [[-11.5, 3.6], [-16.5, -3.6]].some(([bx, bz]) => Math.abs(x - bx) < 1.45 && Math.abs(z - bz) < .7) || [-11, 11].some(hz => Math.abs(x + 15) < 2.7 && Math.abs(z - hz) < .55);
  G.add(F.grassField({ x0: -27, x1: X0, z0: -31, z1: 31, y: GY, seed: 4, mask: (x, z) => !isPath(x, z) && !isBed(x, z) }));
}

// box UVs in metres (so a tiling texture keeps its real-world size on any box): faces +x,-x,+y,-y,+z,-z
export function boxUV(geo, w, h, d) {
  const uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]); }
  uv.needsUpdate = true; return geo;
}
