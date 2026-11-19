// HOUSE (Xavier's Roblox map, 2026-10-23: kit/assets/maps/house/p.obj + p.mtl + textures). A two-storey suburban house:
// kitchen, living room with an L sofa + TV, dining room, entry hall + stairs, garage, front porch, back yard + trampoline.
// The map is in Roblox studs; 1 stud = 0.34 m, so a 5-stud R6 avatar is exactly our 1.7 m cast. World origin = the middle
// of the living room floor (map stud x -27, y 12, z 30). The OBJ's ~4800 parts are merged per material (~130 draw calls).
//   refs.spots { sofaSeat, sofaFront, tvFront, coffeeTable, frontDoor, hall, kitchen, dining }, refs.toWorld(sx, sy, sz)
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { surround } from './surround.js';
import { pending } from '../detail.js';
import { surface } from '../triplanar.js';

// fun, bright interior (Xavier 2026-10-23: "thats NOT a fun looking house"): light walls, green sofa, light varnished floor
const RECOLOR = { Part85Mtl: 0xf3ecdc, Part2051Mtl: 0xf3ecdc, Part558Mtl: 0xf3ecdc, Part710Mtl: 0x4f9a63, Wedge15Mtl: 0xe2c49a };   // walls warm white, sofa green, coffee table light oak
export const S = .34, O = new THREE.Vector3(-27, 12, 30);
const DIR = 'kit/assets/maps/house/';
export const toWorld = (x, y, z) => new THREE.Vector3((x - O.x) * S, (y - O.y) * S, (z - O.z) * S);

const LOGH = new URLSearchParams(location.search).get('classlog') ? [] : null;
// per merged part: area (m2), share facing up / down / sideways, typical face width (area-weighted shortest edge, m), height span
function geoStats(geo) {
  const P = geo.attributes.position, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(); let A = 0, up = 0, dn = 0, side = 0, w = 0, y0 = 1e9, y1 = -1e9;
  for (let i = 0; i < P.count; i += 3) { a.fromBufferAttribute(P, i).multiplyScalar(S); b.fromBufferAttribute(P, i + 1).multiplyScalar(S); c.fromBufferAttribute(P, i + 2).multiplyScalar(S);
    n.subVectors(b, a).cross(c.clone().sub(a)); const ar = n.length() / 2; if (!ar) continue; const ny = n.y / (2 * ar); A += ar; if (ny > .9) up += ar; else if (ny < -.9) dn += ar; else if (Math.abs(ny) < .3) side += ar;
    w += ar * Math.min(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a)); y0 = Math.min(y0, a.y, b.y, c.y); y1 = Math.max(y1, a.y, b.y, c.y); }
  return { A, up: up / A, dn: dn / A, side: side / A, w: w / A, h: y1 - y0 };
}
// Xavier 2026-10-28: give each part what it IS. Typical US home (Houzz 2026 kitchens etc.): warm-white painted walls +
// ceilings, white painted wood doors / trims, wood furniture (varnished, grain showing), white ceramic plates, fabric on
// upholstery. The floor is already varnished planks.
function dress(m, st, name) {
  if (m.transparent) return m;
  const h = {}; m.color.getHSL(h); let kind, col = m.color.clone();
  const wood = h.h > .02 && h.h < .13 && h.s > .18 && h.l < .6;
  if (name === 'Part1910Mtl') { kind = 'ceramic'; col = new THREE.Color(0xf7f6f2); }                       // the dinner plates
  else if (name === 'Part24Mtl') { kind = 'paintedWood'; col = new THREE.Color(0xf4f1ea); }                       // ceilings + skirting + doors + trims (one material in the map): white paint
  else if (st.dn > .7) { kind = 'plaster'; col = new THREE.Color(0xf6f3ec); }                                    // ceilings
  else if (st.side > .6 && st.w > .9 && h.l > .55) kind = 'plaster';                                          // painted walls
  else if (name === 'Part710Mtl') kind = 'fabric';                                                            // the green sofa
  else if (st.A > 150 && !wood && h.l < .8) {                                                                 // big outside surfaces: keep their colour
    kind = st.up > .55 ? 'concrete' : st.side > .55 ? 'lapSiding' : 'shingles'; }                               // ground / driveway, exterior walls, roofs
  else if (wood) { kind = 'wood'; col = new THREE.Color(h.l < .35 ? 0x5a3820 : h.l < .55 ? 0x8a5a34 : 0xc0905c); }   // varnished stains: dark walnut / medium walnut / honey oak   // tables, chairs, cabinets in wood: varnished
  else if (h.s < .08 && h.l > .3 && h.l < .75 && st.w < .9 && st.A < 3) { kind = 'ceramic'; col = new THREE.Color(0xf7f6f2); }  // small grey parts: plates, cups -> white ceramic
  else if (h.s < .12 && h.l > .2) { kind = 'paintedWood'; if (h.l < .7) col = new THREE.Color(0xf2efe8); }   // doors, trims, skirting, shelves: white painted wood
  else kind = 'paintedWood';
  if (LOGH) LOGH.push([name, '#' + m.color.getHexString(), +st.A.toFixed(1), kind, +st.w.toFixed(2)]);
  if (kind === 'ceramic') return new THREE.MeshPhysicalMaterial({ color: col, roughness: .18, clearcoat: .8, clearcoatRoughness: .1 });
  if (kind === 'fabric') return surface('fabric', col);
  return surface(kind, col);
}
export function buildWorld(scene) {
  const G = new THREE.Group(); G.name = 'house'; scene.add(G);
  const map = new THREE.Group(); map.scale.setScalar(S); map.position.set(-O.x * S, -O.y * S, -O.z * S); G.add(map);
  const refs = { G, map, toWorld, ready: null };
  refs.ready = (async () => {
    const base = new URL(DIR, document.baseURI).href;
    // Xavier 2026-10-23: plain colours on the house (each part = its texture's average colour x its tint), and every
    // indoor floor becomes varnished wooden planks. Textures are only read for their average, never put on the mesh.
    const mtl = await new MTLLoader().setPath(base).loadAsync('p.mtl'), info = mtl.materialsInfo;
    const obj = await new OBJLoader().parse(await (await fetch(base + 'p.obj')).text());
    const avg = new Map(), cv = document.createElement('canvas'); cv.width = cv.height = 16; const g2 = cv.getContext('2d', { willReadFrequently: true });
    const avgOf = f => avg.get(f) || avg.set(f, new Promise(ok => { const im = new Image(); im.onload = () => { g2.clearRect(0, 0, 16, 16); g2.drawImage(im, 0, 0, 16, 16); const d = g2.getImageData(0, 0, 16, 16).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 100) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; } ok(n ? new THREE.Color().setRGB(r / n / 255, g / n / 255, b / n / 255, THREE.SRGBColorSpace) : null); }; im.onerror = () => ok(null); im.src = base + f; })).get(f);
    const plain = new Map();
    const matFor = async name => { if (plain.has(name)) return plain.get(name); const i = info[name] || {}, kd = new THREE.Color().fromArray(i.kd || [1, 1, 1]);
      const c = i.map_kd ? await avgOf(i.map_kd) : null; if (c) kd.multiply(c); if (RECOLOR[name] != null) kd.set(RECOLOR[name]); const d = i.d != null ? +i.d : 1, glass = d < .99;
      const m = new THREE.MeshStandardMaterial({ color: kd, roughness: glass ? .08 : .62, metalness: 0, transparent: glass, opacity: glass ? Math.max(.25, d) : 1, side: glass ? THREE.DoubleSide : THREE.FrontSide, depthWrite: !glass });
      plain.set(name, m); return m; };
    // floor: varnished planks (Poly Haven wood_floor scan, glossy clear coat), UVs projected from above in metres
    const tl = new THREE.TextureLoader(), FA = 'kit/assets/ph/wood_floor/', ld = f => tl.loadAsync(new URL(FA + f, document.baseURI).href).then(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; });
    const [fd, fn, fr] = await Promise.all([ld('diffuse.jpg'), ld('nor_gl.jpg'), ld('rough.jpg')]); fd.colorSpace = THREE.SRGBColorSpace;
    const floorMat = new THREE.MeshPhysicalMaterial({ map: fd, normalMap: fn, normalScale: new THREE.Vector2(.5, .5), roughnessMap: fr, roughness: .55, color: new THREE.Color(1.75, 1.6, 1.4), clearcoat: 1, clearcoatRoughness: .07, envMapIntensity: 1.1 });
    refs.floorMat = floorMat;
    const isFloorY = y => (y > 11.75 && y < 12.6) || (y > 20.6 && y < 21.9);
    const groups = new Map(), floorTris = [], P = 2.2 / S;   // planks: one texture tile per 2.2 m
    obj.traverse(o => { if (!o.isMesh) return; const geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry, name = [].concat(o.material)[0].name;
      const pos = geo.attributes.position, nor = geo.attributes.normal, uv = geo.attributes.uv, keep = [];
      for (let t = 0; t < pos.count; t += 3) {
        const ay = pos.getY(t), by = pos.getY(t + 1), cy = pos.getY(t + 2), cx = (pos.getX(t) + pos.getX(t + 1) + pos.getX(t + 2)) / 3;
        const ny = nor ? (nor.getY(t) + nor.getY(t + 1) + nor.getY(t + 2)) / 3 : 0;
        if (ny > .95 && Math.abs(ay - by) < .05 && Math.abs(ay - cy) < .05 && isFloorY(ay) && cx < -15) { for (let k = 0; k < 3; k++) floorTris.push(pos.getX(t + k), pos.getY(t + k) + .02, pos.getZ(t + k)); }
        else keep.push(t);
      }
      if (!keep.length) return; const L = groups.get(name) || groups.set(name, []).get(name);
      const pa = new Float32Array(keep.length * 9), na = new Float32Array(keep.length * 9);
      keep.forEach((t, j) => { for (let k = 0; k < 3; k++) { pa[j * 9 + k * 3] = pos.getX(t + k); pa[j * 9 + k * 3 + 1] = pos.getY(t + k); pa[j * 9 + k * 3 + 2] = pos.getZ(t + k); if (nor) { na[j * 9 + k * 3] = nor.getX(t + k); na[j * 9 + k * 3 + 1] = nor.getY(t + k); na[j * 9 + k * 3 + 2] = nor.getZ(t + k); } } });
      const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.BufferAttribute(pa, 3)); ng.setAttribute('normal', new THREE.BufferAttribute(na, 3)); L.push(ng); });
    for (const [name, geos] of groups) { const geo = mergeGeometries(geos, false); if (!geo) continue; const m = await matFor(name);
      const st = geoStats(geo), mat = dress(m, st, name);
      const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = !mat.transparent; mesh.receiveShadow = true; mesh.name = name; map.add(mesh); }
    if (LOGH) console.error('HCLS ' + JSON.stringify(LOGH.sort((a, b) => b[2] - a[2])));
    { const geo = new THREE.BufferGeometry(), fp = new Float32Array(floorTris), u = new Float32Array(fp.length / 3 * 2);
      for (let i = 0; i < fp.length / 3; i++) { u[i * 2] = fp[i * 3] / P; u[i * 2 + 1] = fp[i * 3 + 2] / P; }
      geo.setAttribute('position', new THREE.BufferAttribute(fp, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(u, 2)); geo.computeVertexNormals();
      const f = new THREE.Mesh(geo, floorMat); f.receiveShadow = true; f.name = 'floor'; map.add(f); refs.floor = f; }
  })();
  pending.push(refs.ready);

  // ---------- outside: a town + hills round the yard, so no window looks onto nothing ----------
  const GY = (10.9 - O.y) * S, a = toWorld(-88, 0, -57), b = toWorld(16.6, 0, 81.8);
  surround(G, scene, { box: [a.x - 2, b.x + 2, a.z - 2, b.z + 2], GY, seed: 11 });

  // ---------- light: bright Roblox day, sun through the windows, room fill ----------
  const hemi = new THREE.HemisphereLight(0xeef5ff, 0xe8dcc8, 1.1); scene.add(hemi); refs.hemi = hemi;
  const amb = new THREE.AmbientLight(0xffffff, .35); scene.add(amb); refs.amb = amb;
  const sun = new THREE.DirectionalLight(0xfff0d6, 3.2); sun.position.set(-9, 14, 12); sun.target.position.set(0, 0, 0); scene.add(sun.target); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 70 }); sun.shadow.bias = -.0008; sun.shadow.normalBias = .05; sun.shadow.radius = 4; scene.add(sun); refs.sun = sun;
  for (const [x, z, i] of [[-27, 32, 2.4], [-40, 16, 1.8], [-55, 0, 1.8], [-25, 6, 1.8]]) { const p = new THREE.PointLight(0xfff2e0, i, 9, 1.6); p.position.copy(toWorld(x, 19.5, z)); scene.add(p); }
  { const url = new URL('kit/assets/ph/kloofendal_48d_partly_cloudy_puresky/kloofendal_48d_partly_cloudy_puresky.hdr', document.baseURI).href; scene.background = new THREE.Color(0xa8d0f2);
    pending.push(import('three/addons/loaders/RGBELoader.js').then(({ RGBELoader }) => new RGBELoader().loadAsync(url)).then(t => { t.mapping = THREE.EquirectangularReflectionMapping; scene.background = t; scene.environment = t; scene.environmentIntensity = .6; }).catch(() => {})); }

  // ---------- spots (world metres, feet on the floor) ----------
  refs.spots = {
    sofaSeat: toWorld(-38.3, 12, 29.5), sofaFront: toWorld(-34.5, 12, 29.5), coffeeTable: toWorld(-27.5, 12, 29.5), tvFront: toWorld(-17.5, 12, 28.5),
    frontDoor: toWorld(-59, 12, 37), hall: toWorld(-52, 12, 28), kitchen: toWorld(-60, 12, -2), dining: toWorld(-30, 12, 6),
  };
  refs.floorY = 0;
  return refs;
}
