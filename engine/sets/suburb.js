// SUBURB (2026-11-16): the channel's reusable town street. Two rows of houses facing a road, lawns, sidewalks, real trees
// and shrubs (Poly Haven, CC0, cut down in Blender: tools/blender/decimate_gltf.py), a park lawn at the +x end.
// Units: metres. The road runs along x at z = 0. North row faces +z from z = -13, south row faces -z from z = +13.
//   const refs = await buildSuburb(scene)   refs.spots { street, sidewalk, lawn, porch, park, doorOf(i) }
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { M, rb, add, grp, cyl, canvasTex, rng } from '../util.js';

const url = p => new URL(p, document.baseURI).href;
const TL = new THREE.TextureLoader();
function pbr(name, repeat, { color = 0xffffff, rough = 1, normal = 1 } = {}) {
  const t = k => { const x = TL.load(url(`assets/ph/${name}/${k}.jpg`)); x.wrapS = x.wrapT = THREE.RepeatWrapping; x.repeat.set(...repeat); x.anisotropy = 8; return x; };
  const map = t('diffuse'); map.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshStandardMaterial({ map, normalMap: t('nor_gl'), roughnessMap: t('rough'), roughness: rough, color, normalScale: new THREE.Vector2(normal, normal) });
}
const HOUSES = [   // body, trim, roof tint, door: typical US suburb paint (white / cream / beige / blue-grey), never loud
  { body: 0xf1ece0, door: 0x2f5f86, roof: 0x6b6e75 }, { body: 0xdfe6ea, door: 0x8f3b2f, roof: 0x8c5a48 }, { body: 0xeadfc6, door: 0x2e5a3c, roof: 0x5d6068 },
  { body: 0xc9d6de, door: 0xf4f1ea, roof: 0x6b6e75 }, { body: 0xf3efe6, door: 0x26303c, roof: 0x8c5a48 }, { body: 0xe5d8c3, door: 0x7a2f3a, roof: 0x5d6068 },
];
export const FLOOR = .3, WALL_H = 3.0, DOOR_W = .95, DOOR_H = 2.05;

export async function buildSuburb(scene, { seed = 7, length = 110 } = {}) {
  const R = rng(seed), W = grp(0, 0, 0, scene), refs = { W, doors: [] };
  // ---------- ground ----------
  const grass = pbr('leafy_grass', [70, 50], { color: 0xb9d68a, normal: 1.4 });
  const lawn = add(new THREE.PlaneGeometry(length + 80, 140), grass, 0, 0, 0, W, { shadow: false }); lawn.rotation.x = -Math.PI / 2; lawn.receiveShadow = true;
  const asphalt = pbr('asphalt_02', [length / 4, 2], { color: 0xb8bcc2 }), walk = pbr('concrete_pavement_02', [length / 2, 1], { color: 0xf2efe8 });
  const road = add(new THREE.PlaneGeometry(length + 80, 7.2), asphalt, 0, .012, 0, W, { shadow: false }); road.rotation.x = -Math.PI / 2; road.receiveShadow = true;
  for (let x = -length / 2 - 30; x < length / 2 + 30; x += 5) rb(2.2, .012, .14, M(0xe9d98a, { roughness: .8 }), x, .02, 0, W, .004, { shadow: false });   // centre dashes
  for (const s of [-1, 1]) {
    rb(length + 80, .16, .28, M(0xcfcbc2, { roughness: .9 }), 0, .08, s * 3.74, W, .02);                                   // kerb
    const sw = add(new THREE.BoxGeometry(length + 80, .14, 1.9), walk, 0, .07, s * 4.83, W, { shadow: false }); sw.receiveShadow = true;   // sidewalk
    for (let x = -length / 2 - 30; x < length / 2 + 30; x += 1.9) rb(.025, .145, 1.9, M(0xa9a59c), x, .07, s * 4.83, W, .002, { shadow: false });
  }
  // ---------- materials shared by the houses ----------
  const SIDING = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { const gr = g.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.8, 'rgba(0,0,0,.05)'); gr.addColorStop(.93, 'rgba(0,0,0,.24)'); gr.addColorStop(1, 'rgba(0,0,0,.06)'); g.fillStyle = gr; g.fillRect(0, y, w, 32); } }, [3, 6]);
  const SIDING_N = canvasTex(64, 256, (g, w, h) => { for (let y = 0; y < h; y += 32) for (let j = 0; j < 32; j++) { const up = j > 26 ? 60 : j < 3 ? 190 : 128; g.fillStyle = `rgb(128,${up},255)`; g.fillRect(0, y + j, w, 1); } }, [3, 6], false);
  const roofMat = c => pbr('clay_roof_tiles', [3, 3], { color: c, normal: 1.2 });
  const glass = M(0x9fc6e6, { roughness: .08, metalness: .1, emissive: 0x3d6c94, emissiveIntensity: .22 });
  const concrete = M(0xd6d1c7, { roughness: .9 });
  function house(x0, z0, ry, o, wide = 9, deep = 8) {
    const H = grp(x0, 0, z0, W); H.rotation.y = ry;
    const wall = new THREE.MeshStandardMaterial({ map: SIDING, normalMap: SIDING_N, color: o.body, roughness: .82 }), tr = M(0xf7f5ef, { roughness: .55 });
    const dw = DOOR_W + .16, dh = DOOR_H + .08, side = (wide - dw) / 2;
    rb(side, WALL_H, .25, wall, -(dw + side) / 2, FLOOR + WALL_H / 2, -.125, H, .01); rb(side, WALL_H, .25, wall, (dw + side) / 2, FLOOR + WALL_H / 2, -.125, H, .01);
    rb(dw, WALL_H - dh, .25, wall, 0, FLOOR + dh + (WALL_H - dh) / 2, -.125, H, .01);
    for (const s of [-1, 1]) rb(.25, WALL_H, deep, wall, s * (wide / 2 - .125), FLOOR + WALL_H / 2, -deep / 2, H, .01);            // side walls
    rb(wide, WALL_H, .25, wall, 0, FLOOR + WALL_H / 2, -deep + .125, H, .01);                                                // back wall
    rb(wide + .3, FLOOR, deep + .3, M(0xb9b4aa, { roughness: .9 }), 0, FLOOR / 2, -deep / 2, H, .02);                            // slab
    rb(wide - .5, .1, deep - .5, M(0x8a6a4a, { roughness: .7 }), 0, FLOOR + .05, -deep / 2, H, .01, { shadow: false });           // floor seen through the door
    // porch, steps, path, porch roof on posts
    rb(3.0, FLOOR, 1.9, M(0xdcd7cc, { roughness: .85 }), 0, FLOOR / 2, .95, H, .02); rb(1.9, FLOOR / 2, .4, M(0xdcd7cc, { roughness: .85 }), 0, FLOOR / 4, 2.1, H, .02);
    const path = add(new THREE.BoxGeometry(1.2, .03, 5.4), concrete, 0, .015, 4.9, H, { shadow: false }); path.receiveShadow = true;
    rb(3.3, .14, 2.1, tr, 0, FLOOR + 2.62, .95, H, .03); for (const sx of [-1.45, 1.45]) rb(.13, 2.55, .13, tr, sx, FLOOR + 1.28, 1.8, H, .025);
    for (const sx of [-1.45, 1.45]) for (let k = 0; k < 2; k++) rb(.05, .05, 1.7, tr, sx, FLOOR + .45 + k * .4, .95, H, .01);        // porch rails
    // windows with frames, sill, shutters
    for (const sx of [-2.75, 2.75]) {
      rb(1.4, 1.35, .06, glass, sx, FLOOR + 1.6, .0, H, .01);
      for (const [w, h, x, y] of [[1.58, .1, 0, .72], [1.58, .1, 0, -.72], [.1, 1.5, -.74, 0], [.1, 1.5, .74, 0], [.05, 1.35, 0, 0], [1.4, .05, 0, 0]]) rb(w, h, .1, tr, sx + x, FLOOR + 1.6 + y, .03, H, .012);
      rb(1.7, .08, .24, tr, sx, FLOOR + .86, .1, H, .015);
      for (const so of [-1, 1]) { const sh = rb(.4, 1.5, .05, M(o.door === 0xf4f1ea ? 0x3c4a58 : o.door, { roughness: .65 }), sx + so * 1.0, FLOOR + 1.6, .04, H, .012); for (let k = -5; k <= 5; k++) rb(.32, .02, .02, M(0x000000, { transparent: true, opacity: .18 }), 0, k * .12, .03, sh, .002, { shadow: false }); }
    }
    // roof: two tiled slopes with an overhang + gable ends + chimney
    const rm = roofMat(o.roof), rise = 2.3, half = wide / 2 + .5, slope = Math.hypot(half, rise), ang = Math.atan2(rise, half);
    for (const s of [-1, 1]) { const r = add(new THREE.BoxGeometry(slope + .15, .16, deep + 1.3), rm, s * half / 2, FLOOR + WALL_H + rise / 2 + .05, -deep / 2 + .1, H); r.rotation.z = -s * ang; }
    for (const z of [0, -deep]) { const gab = new THREE.Shape(); gab.moveTo(-wide / 2, 0); gab.lineTo(wide / 2, 0); gab.lineTo(0, rise * (wide / 2) / half); gab.lineTo(-wide / 2, 0); const m = add(new THREE.ShapeGeometry(gab), wall, 0, FLOOR + WALL_H, z, H); if (z) m.rotation.y = Math.PI; }
    rb(.8, 1.6, .8, M(0x9a5a48, { roughness: .9 }), wide / 4, FLOOR + WALL_H + rise * .75, -deep * .6, H, .02);
    // door: frame + panelled slab + knob (hinge group so it can swing)
    for (const sx of [-1, 1]) rb(.08, dh, .3, tr, sx * (DOOR_W / 2 + .04), FLOOR + dh / 2, -.1, H, .01); rb(dw, .08, .3, tr, 0, FLOOR + dh - .04, -.1, H, .01);
    const hinge = grp(-DOOR_W / 2, FLOOR, -.08, H), dm = M(o.door, { roughness: .5, unique: true }), slab = rb(DOOR_W, DOOR_H, .06, dm, DOOR_W / 2, DOOR_H / 2, 0, hinge, .012);
    for (const [px, py, pw, ph] of [[-.2, .55, .3, .7], [.2, .55, .3, .7], [-.2, -.35, .3, .85], [.2, -.35, .3, .85]]) rb(pw, ph, .02, M(0x000000, { transparent: true, opacity: .13 }), px, py, .035, slab, .01, { shadow: false });
    add(new THREE.SphereGeometry(.045, 16, 12), M(0xc9a24a, { roughness: .3, metalness: .8 }), DOOR_W / 2 - .09, -.02, .07, slab);
    // house number plate + porch lamp
    add(cyl(.07, .05, .2, 14), M(0xfff1c9, { emissive: 0xffe0a0, emissiveIntensity: .5 }), .85, FLOOR + 2.35, .1, H);
    const door = { hinge, slab, world: new THREE.Vector3(0, FLOOR, 1.2).applyMatrix4(H.updateMatrixWorld(true) && H.matrixWorld) }; refs.doors.push(door);
    return { group: H, door, bushAt: [-2.75, 2.75].map(sx => new THREE.Vector3(sx, 0, .75).applyMatrix4(H.matrixWorld)) };
  }
  // ---------- two rows of houses ----------
  refs.houses = []; const bushSpots = [], treeSpots = [];
  let k = 0;
  for (let x = -length / 2 + 8; x <= length / 2 - 22; x += 15) {
    for (const s of [-1, 1]) { const h = house(x + (s > 0 ? 6 : 0), s * 13.2, s > 0 ? Math.PI : 0, HOUSES[(k++ * 5 + 1) % HOUSES.length]); refs.houses.push(h); bushSpots.push(...h.bushAt); }
    for (const s of [-1, 1]) { treeSpots.push([x + 7.5 + (s > 0 ? 6 : 0), s * (8.2 + R() * 2)]); for (let z = 6.2; z < 12.6; z += .5) rb(.07, .95, .07, M(0xfbfaf6, { roughness: .6 }), x + 7.5 + (s > 0 ? 6 : 0), .48, s * z, W, .012); for (const y of [.38, .8]) rb(.045, .07, 6.6, M(0xfbfaf6), x + 7.5 + (s > 0 ? 6 : 0), y, s * 9.4, W, .01); }
  }
  // mailboxes by the kerb
  for (const h of refs.houses) { const p = new THREE.Vector3(1.5, 0, 7.6).applyMatrix4(h.group.matrixWorld); rb(.09, 1.05, .09, M(0x5a5048), p.x, .53, p.z, W, .012); const mb = rb(.24, .26, .46, M(0x2f4f6f, { roughness: .5 }), p.x, 1.14, p.z, W, .09); rb(.02, .12, .02, M(0xc23b2b), p.x + .13, 1.2, p.z + .1, W, .004); }
  // ---------- park at the +x end: open lawn, a low hill, benches ----------
  const px = length / 2 - 2;
  const hill = add(new THREE.SphereGeometry(16, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), pbr('leafy_grass', [14, 14], { color: 0xb9d68a, normal: 1.4 }), px + 8, -12.2, -24, W, { shadow: false }); hill.receiveShadow = true;
  for (const [bx, bz, br] of [[px - 6, -7.2, 0], [px + 6, -7.2, 0]]) { const B = grp(bx, 0, bz, W); B.rotation.y = br; for (let i = 0; i < 4; i++) rb(1.7, .05, .11, M(0x8a5a36, { roughness: .6 }), 0, .47, -.2 + i * .13, B, .015); for (let i = 0; i < 3; i++) rb(1.7, .11, .05, M(0x8a5a36, { roughness: .6 }), 0, .62 + i * .14, -.3, B, .015); for (const sx of [-.75, .75]) { rb(.07, .47, .5, M(0x2c2f33, { roughness: .5 }), sx, .235, -.05, B, .015); rb(.07, .55, .06, M(0x2c2f33), sx, .7, -.31, B, .015); } }
  // ---------- real trees + shrubs ----------
  const L = new GLTFLoader(), [treeG, shrubG] = await Promise.all([L.loadAsync(url('assets/models/tree_small_02.glb')), L.loadAsync(url('assets/models/shrub_02.glb'))]);
  const prep = (g, leafTint) => g.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.material.side = THREE.DoubleSide; o.material.alphaTest = .4; if (leafTint && /lea|shrub/i.test(o.material.name)) o.material.color.multiply(new THREE.Color(leafTint)); } });
  prep(treeG, 0xdfffc0); prep(shrubG, 0xe6ffc8);
  const tb = new THREE.Box3().setFromObject(treeG.scene), th = tb.max.y - tb.min.y, sb = new THREE.Box3().setFromObject(shrubG.scene), sh = sb.max.y - sb.min.y, sc = sb.getCenter(new THREE.Vector3());
  for (let i = 0; i < 9; i++) treeSpots.push([px - 12 + R() * 34, -9 - R() * 22]);                               // park trees
  for (let x = -length / 2 - 20; x < length / 2 + 30; x += 9) for (const s of [-1, 1]) treeSpots.push([x + R() * 4, s * (24 + R() * 10)]);   // behind the houses
  refs.trees = [];
  for (const [x, z] of treeSpots) { const t = treeG.scene.clone(true), s = (5.5 + R() * 3.2) / th; t.scale.setScalar(s); t.rotation.y = R() * 6.28; t.position.set(x, -tb.min.y * s, z); W.add(t); refs.trees.push(t); }
  for (const p of bushSpots) for (let i = -1; i <= 1; i++) { const b = shrubG.scene.clone(true), s = (.75 + R() * .3) / sh; b.scale.setScalar(s); b.rotation.y = R() * 6.28; b.position.set(p.x + i * .62 - sc.x * s, -sb.min.y * s, p.z - sc.z * s); W.add(b); }
  scene.fog = new THREE.Fog(0xcfe6fb, 70, 260);
  refs.spots = { street: new THREE.Vector3(0, .02, 0), sidewalk: new THREE.Vector3(0, .14, -4.8), lawn: new THREE.Vector3(-7, 0, -8.5), porch: refs.houses[6]?.door.world || new THREE.Vector3(), park: new THREE.Vector3(px, 0, -9), hill: new THREE.Vector3(px + 8, 3.8, -24) };
  return refs;
}
