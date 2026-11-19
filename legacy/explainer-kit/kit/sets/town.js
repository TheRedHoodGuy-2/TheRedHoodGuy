// TOWN (Xavier 2026-10-25): the suburban Roblox map he sent (kit/assets/maps/suburban/map.glb, converted from his FBX
// with Blender), repainted in the bright Jujutsu-Shenanigans look: green grass instead of the white ground, dark road,
// every other part a clean saturated colour (greys get a bright house palette), wood-coloured parts get a bright
// varnished-wood texture. No other textures. 1 stud = 0.34 m (same as the R6 cast). World origin = map centre.
//   refs.spots { school, houseDoor }, refs.toWorld(x, y, z) (map studs -> metres), refs.ready (await before use)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { pending } from '../detail.js';
import { buildSchool } from './schoolhouse.js';
import { surround } from './surround.js';
import { surface } from '../triplanar.js';

export const S = .34;
const PALETTE = [0xff6b6b, 0x4dabf7, 0xffd43b, 0x69db7c, 0xb197fc, 0xff922b, 0x38d9a9, 0xf783ac, 0x74c0fc, 0xffa94d];

function repaint(m, i, wood, f = 0) {
  const c = m.color.clone(), hsl = {}; c.getHSL(hsl);
  const name = m.name || '';
  // the ground plane (biggest light-grey material) -> grass; asphalt stays dark
  if (hsl.l < .07) return new THREE.MeshStandardMaterial({ color: 0x2b2e36, roughness: .85 });                  // roads, tyres, black trims
  if (hsl.h > .04 && hsl.h < .12 && hsl.s > .25 && hsl.l < .55 && f > .45) {                                       // brown FLOORS / decks = wood: bright varnish
    const w = new THREE.MeshPhysicalMaterial({ map: wood, color: new THREE.Color().setHSL(.08, .55, .62), roughness: .45, clearcoat: .6, clearcoatRoughness: .2 }); return w; }
  let out;
  if (hsl.s < .12 || (hsl.h > .04 && hsl.h < .12 && hsl.l < .55)) {                                               // greys / whites / brown siding -> bright paint
    if (hsl.l > .85) out = new THREE.Color(0xf8f6f0);                                                               // keep whites white (trims, lines)
    else if (hsl.l < .3) out = new THREE.Color().setHSL(.6, .25, .35);                                              // dark greys -> slate
    else out = new THREE.Color(PALETTE[i % PALETTE.length]).lerp(new THREE.Color(0xffffff), .15);                  // mid greys -> bright house colours
  } else out = new THREE.Color().setHSL(hsl.h, Math.min(1, Math.max(.55, hsl.s * 1.5)), Math.min(.68, Math.max(.45, hsl.l * 1.25)));
  return new THREE.MeshStandardMaterial({ color: out, roughness: .65, transparent: m.transparent, opacity: m.opacity });
}

const LOGC = new URLSearchParams(location.search).get('classlog') ? [] : null;   // look-dev: &classlog=1 prints what each part was classified as
export function buildWorld(scene) {
  const G = new THREE.Group(); G.name = 'town'; scene.add(G);
  const refs = { G, toWorld: (x, y, z) => new THREE.Vector3(x * S, y * S, z * S) };
  refs.ready = (async () => {
    const tl = new THREE.TextureLoader(), wood = await tl.loadAsync(new URL('kit/assets/ph/laminate_floor_02/diffuse.jpg', document.baseURI).href);
    wood.colorSpace = THREE.SRGBColorSpace; wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.anisotropy = 8;
    const gl = await new GLTFLoader().loadAsync(new URL('kit/assets/maps/suburban/map.glb', document.baseURI).href);
    const root = gl.scene; root.scale.setScalar(S); G.add(root);
    // which materials are GROUND (flat, upward, at street level): the biggest one is grass, the rest pavement
    root.updateMatrixWorld(true); const flat = new Map(), all = new Map(), vert = new Map(), slope = new Map(), topY = new Map(), thin = new Map(); let gy = 1e9;
    root.traverse(o => { if (o.isMesh) { const b = new THREE.Box3().setFromObject(o); gy = Math.min(gy, b.min.y); } });
    const a = new THREE.Vector3(), b2 = new THREE.Vector3(), c2 = new THREE.Vector3(), n = new THREE.Vector3();
    root.traverse(o => { if (!o.isMesh) return; const g = o.geometry, P = g.attributes.position, I = g.index, mats = [].concat(o.material), groups = g.groups.length ? g.groups : [{ start: 0, count: I ? I.count : P.count, materialIndex: 0 }];
      for (const gr of groups) { const m = mats[gr.materialIndex]; for (let t = gr.start; t < gr.start + gr.count; t += 3) {
        const ia = I ? I.getX(t) : t, ib = I ? I.getX(t + 1) : t + 1, ic = I ? I.getX(t + 2) : t + 2;
        a.fromBufferAttribute(P, ia).applyMatrix4(o.matrixWorld); b2.fromBufferAttribute(P, ib).applyMatrix4(o.matrixWorld); c2.fromBufferAttribute(P, ic).applyMatrix4(o.matrixWorld);
        n.subVectors(b2, a).cross(c2.clone().sub(a)); const ar = n.length() / 2; all.set(m, (all.get(m) || 0) + ar);
        const ny = Math.abs(n.y) / (2 * ar + 1e-9), cy = (a.y + b2.y + c2.y) / 3;
        if (ny > .9 && cy < gy + 2.5) flat.set(m, (flat.get(m) || 0) + ar);
        if (ny < .3) vert.set(m, (vert.get(m) || 0) + ar); else if (ny < .9) slope.set(m, (slope.get(m) || 0) + ar);
        topY.set(m, Math.max(topY.get(m) ?? -1e9, cy)); thin.set(m, (thin.get(m) || 0) + ar * Math.min(a.distanceTo(b2), b2.distanceTo(c2), c2.distanceTo(a))); } } });
    let grass = null, best = 0; for (const [m, ar] of flat) { const h = {}; m.color.getHSL(h); if (ar > best && h.l > .2) { best = ar; grass = m; } }   // the lots (biggest light flat material); the black base under it is road
    const cache = new Map(); let i = 0;
    root.traverse(o => { if (!o.isMesh) return; o.castShadow = o.receiveShadow = true;
      o.material = [].concat(o.material).map(m => { if (!cache.has(m)) { const ar = all.get(m) || 1, f = (flat.get(m) || 0) / ar, hsl = {}; m.color.getHSL(hsl);
        // Xavier 2026-10-28: think what each part IS, then give it that material (paint stays the colour, the surface adds
        // what the stuff looks like): ground -> concrete / asphalt, sloped + high -> roof tiles, brick-red walls -> brick,
        // big vertical walls -> painted plaster, brown -> varnished wood, everything else (trims, posts, rails, doors,
        // fences, steps) -> painted wood with the grain showing through
        const v = (vert.get(m) || 0) / ar, w = (thin.get(m) || 0) / ar, wall = v > .6 && w > 1.2,   // w = typical face width (area-weighted shortest edge): walls are big faces, posts / beams / rails are thin
          sl = (slope.get(m) || 0) / ar, top = (topY.get(m) ?? gy) - gy, glass = m.transparent && m.opacity < .95;
        const isBrick = (hsl.h < .05 || hsl.h > .95) && hsl.s > .3 && hsl.l > .15 && hsl.l < .55 && v > .5;
        const isWood = hsl.h > .04 && hsl.h < .12 && hsl.s > .25 && hsl.l < .55;
        // Xavier 2026-10-28: "green looks so ass ... do more research into the typicals". The map's own colours ARE the
        // typical US suburb (white, cream, butter yellow, beige / tan, blue-grey, light blue, sage, peach siding; white
        // trims; dark roofs), so keep them, only lifted a touch, and give each part its real surface.
        const oc = m.color.clone(), o = {}; oc.getHSL(o); const keep = new THREE.Color().setHSL(o.h, Math.min(1, o.s * 1.08), Math.min(.97, o.l * 1.05 + .02));
        let out;
        if (m === grass) out = surface('concrete', 0xe8e2d4);
        else if (glass) out = repaint(m, i++, wood, f);
        else if (hsl.l < .07) out = f > .5 ? surface('asphalt', 0x34373f) : surface('paintedWood', 0x2b2e36);
        else if (f > .6 && hsl.s < .15) out = surface('concrete', keep.clone().lerp(new THREE.Color(0xece6da), .5));
        else if (sl > .45 && top > 3) out = surface('shingles', keep);                      // roofs: asphalt shingles in the map's colour
        else if (isBrick) out = surface('brick', 0xffd9c8);
        else if (wall) out = surface('lapSiding', o.h > .18 && o.h < .48 && o.s > .08 ? new THREE.Color(o.l > .62 ? 0xf1e9d2 : 0xb7c6d6) : keep);   // house walls: painted clapboard siding (Xavier: no green houses -> cream / blue-grey)
        else if (isWood && f > .3) out = surface('wood', keep.clone().lerp(new THREE.Color().setHSL(.075, .6, .5), .5));   // decks + steps: varnished
        else out = surface('paintedWood', keep);                                            // trims, posts, rails, doors, fences: painted wood
        out.userData.kindArea = ar; if (LOGC) LOGC.push([out.userData.kind = (wall ? 'WALL' : sl > .45 && top > 3 ? 'ROOF' : 'other'), '#' + m.color.getHexString(), Math.round(ar), +w.toFixed(2)]); cache.set(m, out); } return cache.get(m); });
      if (o.material.length === 1) o.material = o.material[0]; });
    if (LOGC) console.error('CLS ' + JSON.stringify(LOGC.filter(r => r[0] !== 'other' || r[2] > 30).sort((a, b) => b[2] - a[2])));
    root.updateMatrixWorld(true); refs.box = new THREE.Box3().setFromObject(root);
    // the map has NO ground under the lots (holes to the sky): lay grass under everything, roads sit on top
    const bx = refs.box, gw = (bx.max.x - bx.min.x) + 2, gd = (bx.max.z - bx.min.z) + 2;   // grass only under the map itself; surround() is the ground beyond
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(gw, gd), surface('grass', 0x5fd068));
    ground.rotation.x = -Math.PI / 2; ground.position.set((bx.min.x + bx.max.x) / 2, gy - .03, (bx.min.z + bx.max.z) / 2); ground.receiveShadow = true; G.add(ground); refs.ground = ground; refs.groundY = gy;
    // Xavier 2026-10-28 ("horizon looking hella empty"): the map stops at its edge, so wrap it in the town ring (streets,
    // houses, apartment blocks, park trees, then forested hills) like every other set
    surround(G, scene, { box: [bx.min.x, bx.max.x, bx.min.z, bx.max.z], GY: gy - .05, seed: 7, fog: false });
    // the SCHOOL on the empty block (map NE, x 79..133, z -55..-1), front facing the street to the south (+z)
    const sc = buildSchool(); sc.group.position.set(104, gy, -34); G.add(sc.group); refs.school = sc;
    sc.group.updateMatrixWorld(true); refs.spots.school = sc.group.localToWorld(new THREE.Vector3(0, 0, 0)); refs.spots.schoolDoor = sc.group.localToWorld(sc.door.clone());
  })();
  pending.push(refs.ready);
  // bright day: sky, sun, fill
  scene.background = new THREE.Color(0x8ecdf5);
  const hemi = new THREE.HemisphereLight(0xeaf6ff, 0x9fd69a, 1.3); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff2d8, 3.2); sun.position.set(60, 120, 40); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
  Object.assign(sun.shadow.camera, { left: -160, right: 160, top: 160, bottom: -160, near: 1, far: 400 }); sun.shadow.bias = -.0005; scene.add(sun);
  scene.fog = new THREE.Fog(0x8ecdf5, 250, 700);
  refs.spots = {};
  return refs;
}
