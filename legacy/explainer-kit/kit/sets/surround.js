// SURROUND: wraps any set in a believable town so no window, doorway or wide shot ever shows empty ground.
//   surround(G, scene, { box: [x0, x1, z0, z1], GY })   box = the set's own footprint (it stays untouched)
// Rings, from the box outward:
//   0.5-3 m sidewalk | 3-10 m road (markings, corners) | 10-12.5 m sidewalk, street lamps, parked cars
//   12.5-35 m houses facing the road (yards, fences, trees) | 40-100 m apartment blocks + park trees
//   100 m+ hills rising to ~25 m covered in instanced forest, a water tower; light haze (fog) melts it into the sky
import * as THREE from 'three';
import { add, rng, M } from '../util.js';
import { pbr } from '../pbr.js';
import * as T from '../props/town.js';
import * as N from '../props/nature.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const sstep = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const fbm = (x, z) => .5 + .25 * Math.sin(x * .021 + 1.3) * Math.sin(z * .017 + .4) + .15 * Math.sin(x * .047 + z * .031) + .1 * Math.sin(x * .09 - z * .07 + 2);

export function surround(G, scene, { box: [x0, x1, z0, z1], GY = 0, seed = 1, flat = 100, fog = true, houses = true } = {}) {
  const R = rng(seed * 997 + 1), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const off = (x, z) => Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1));   // distance outside the box
  const height = (x, z) => sstep((off(x, z) - flat) / 60) * (9 + 20 * fbm(x, z));
  // ---------- terrain: flat town floor, hills beyond; vertex colours break up the grass tiling ----------
  { const S = 560, seg = 140, geo = new THREE.PlaneGeometry(S, S, seg, seg); geo.rotateX(-Math.PI / 2); geo.translate(cx, 0, cz);
    const p = geo.attributes.position, col = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), h = height(x, z); p.setY(i, GY + h); const n = fbm(x * 2.7, z * 2.3), k = .86 + n * .26; col[i * 3] = k * (1 + h * .004); col[i * 3 + 1] = k; col[i * 3 + 2] = k * .9; }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const grass = pbr('gen/grass_green', { rep: [S / 4.2, S / 4.2], normal: .8, noRough: true, rough: .95 }); grass.vertexColors = true;
    const ground = new THREE.Mesh(geo, grass); ground.receiveShadow = true; G.add(ground); }
  // ---------- roads + sidewalks ----------
  const rx0 = x0 - 6.5, rx1 = x1 + 6.5, rz0 = z0 - 6.5, rz1 = z1 + 6.5, Y = GY + .02;
  const strip = (len, along, x, z) => { const g = new THREE.PlaneGeometry(7, len); g.rotateX(-Math.PI / 2); if (along === 'x') g.rotateY(Math.PI / 2); const m = new THREE.Mesh(g, T.roadMat(len)); m.position.set(x, Y, z); m.receiveShadow = true; G.add(m); };
  strip(rx1 - rx0 - 7, 'x', cx, rz0); strip(rx1 - rx0 - 7, 'x', cx, rz1); strip(rz1 - rz0 - 7, 'z', rx0, cz); strip(rz1 - rz0 - 7, 'z', rx1, cz);
  for (const x of [rx0, rx1]) for (const z of [rz0, rz1]) { const g = new THREE.PlaneGeometry(7, 7); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, T.plainAsphalt()); m.position.set(x, Y, z); m.receiveShadow = true; G.add(m); }
  const walk = (w, l, x, z, alongX) => { const geo = new THREE.BoxGeometry(alongX ? l : w, .15, alongX ? w : l); const m = new THREE.Mesh(geo, T.sidewalkMat(alongX ? l : w, alongX ? w : l)); m.position.set(x, GY + .075, z); m.receiveShadow = true; G.add(m); };
  walk(2.5, x1 - x0 + 6, cx, z0 - 1.75, true); walk(2.5, x1 - x0 + 6, cx, z1 + 1.75, true); walk(2.5, z1 - z0 + 1, x0 - 1.75, cz, false); walk(2.5, z1 - z0 + 1, x1 + 1.75, cz, false);
  walk(2.5, x1 - x0 + 25, cx, z0 - 11.25, true); walk(2.5, x1 - x0 + 25, cx, z1 + 11.25, true); walk(2.5, z1 - z0 + 20, x0 - 11.25, cz, false); walk(2.5, z1 - z0 + 20, x1 + 11.25, cz, false);
  // ---------- sides: houses facing the road, lamps and parked cars on the outer kerb ----------
  // each side: start/end along the side, how to map (s, depth) -> world, and the rotation that turns a house's front to the road
  const sides = [
    { a: x0 - 11, b: x1 + 11, at: (s, d) => [s, z1 + d], rot: Math.PI, kerb: (s) => [s, rz1 + 2.2, 0] },
    { a: x0 - 11, b: x1 + 11, at: (s, d) => [s, z0 - d], rot: 0, kerb: (s) => [s, rz0 - 2.2, 0] },
    { a: z0 - 11, b: z1 + 11, at: (s, d) => [x0 - d, s], rot: Math.PI / 2, kerb: (s) => [rx0 - 2.2, s, 1] },
    { a: z0 - 11, b: z1 + 11, at: (s, d) => [x1 + d, s], rot: -Math.PI / 2, kerb: (s) => [rx1 + 2.2, s, 1] },
  ];
  let hs = seed * 50;
  for (const S of sides) {
    if (houses) for (let s = S.a; ;) {
      const h = T.house({ seed: ++hs }), { w } = h.userData.size; if (s + w + 2 > S.b) break;
      const [hx, hz] = S.at(s + w / 2 + 1.5, 12.8 + h.userData.front);   // front fence sits on the outer sidewalk edge
      h.position.set(hx, GY, hz); h.rotation.y = S.rot; G.add(h); s += w + 3;
    }
    for (let s = S.a + 6; s < S.b - 4; s += 22) { const [x, z, axis] = S.kerb(s), l = N.lampPost(); const [lx, lz] = axis ? [x + (x < cx ? -1.6 : 1.6), z] : [x, z + (z < cz ? -1.6 : 1.6)]; l.position.set(lx, GY + .15, lz); G.add(l); }
    for (let s = S.a + 4; s < S.b - 4; s += 6.5 + R() * 6) { if (R() < .45) continue; const [x, z, axis] = S.kerb(s), c = T.car({ seed: Math.floor(R() * 1e5) }); c.position.set(x, GY, z); c.rotation.y = axis ? Math.PI / 2 : 0; if (R() < .5) c.rotation.y += Math.PI; G.add(c); }
  }
  // corners: a clump of trees on each outside corner lot
  for (const [sx, sz] of [[x0, z0], [x0, z1], [x1, z0], [x1, z1]]) for (let k = 0; k < 3; k++) { const t = N.tree({ type: ['oak', 'maple', 'pine'][k], h: 7 + R() * 3, seed: Math.floor(R() * 1e5) }); t.position.set(sx + Math.sign(sx - cx) * (17 + R() * 12), GY, sz + Math.sign(sz - cz) * (17 + R() * 12)); G.add(t); }
  // ---------- ring 2: apartment blocks and park trees ----------
  const taken = []; const free = (x, z, r) => off(x, z) > 40 + r * .3 && taken.every(t => Math.hypot(t[0] - x, t[1] - z) > t[2] + r);
  let as = seed * 70;
  for (let i = 0; i < 220 && taken.length < 18; i++) {
    const a = R() * 6.2832, dist = 55 + R() * 45, x = cx + Math.cos(a) * (dist + (x1 - x0) / 2), z = cz + Math.sin(a) * (dist + (z1 - z0) / 2);
    if (off(x, z) < 42 || off(x, z) > 95 || !free(x, z, 16)) continue;
    const b = T.apartment({ seed: ++as }); b.position.set(x, GY, z); b.rotation.y = Math.round(Math.atan2(cx - x, cz - z) / (Math.PI / 2)) * Math.PI / 2; G.add(b); taken.push([x, z, 16]);
  }
  let ts = seed * 300;
  for (let i = 0; i < 600 && ts < seed * 300 + 60; i++) {
    const x = cx + (R() - .5) * 2 * ((x1 - x0) / 2 + 95), z = cz + (R() - .5) * 2 * ((z1 - z0) / 2 + 95), o = off(x, z);
    if (o < 37 || o > 98 || !free(x, z, 3)) continue;
    const t = N.tree({ type: N.TREE_TYPES[Math.floor(R() * N.TREE_TYPES.length)], h: 6 + R() * 5, seed: ++ts }); t.position.set(x, GY, z); t.rotation.y = R() * 6; G.add(t); taken.push([x, z, 3]);
  }
  // ---------- hills: instanced forest + a water tower ----------
  G.add(forest(R, x => x, (x, z) => GY + height(x, z), off, cx, cz, x0, x1, z0, z1, taken));
  { const a = R() * 6.28, x = cx + Math.cos(a) * ((x1 - x0) / 2 + 135), z = cz + Math.sin(a) * ((z1 - z0) / 2 + 135); G.add(waterTower(x, GY + height(x, z), z)); }
  if (fog) scene.fog = new THREE.Fog(0xd3e0ea, 140, 520);
  return { height: (x, z) => GY + height(x, z) };
}
function forest(R, _, hAt, off, cx, cz, x0, x1, z0, z1, taken) {
  const g = new THREE.Group(), Vc = (geo, c) => { const n = geo.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) new THREE.Color(c).toArray(a, i * 3); geo.setAttribute('color', new THREE.BufferAttribute(a, 3)); return geo.index ? geo.toNonIndexed() : geo; };
  const trunk = () => Vc(new THREE.CylinderGeometry(.12, .2, 2.2, 6).translate(0, 1.1, 0), 0x6b5240);
  const broad = mergeGeometries([trunk(), Vc(new THREE.IcosahedronGeometry(1.6, 1).translate(0, 3.3, 0), 0x5f9a3a), Vc(new THREE.IcosahedronGeometry(1.2, 1).translate(.9, 2.7, .3), 0x6aa640), Vc(new THREE.IcosahedronGeometry(1.15, 1).translate(-.8, 2.8, -.4), 0x568f35)]);
  const coni = mergeGeometries([trunk(), Vc(new THREE.ConeGeometry(1.7, 2.8, 8).translate(0, 2.6, 0), 0x3f7a35), Vc(new THREE.ConeGeometry(1.3, 2.4, 8).translate(0, 3.8, 0), 0x46843a), Vc(new THREE.ConeGeometry(.85, 2, 8).translate(0, 4.9, 0), 0x4f8f40)]);
  const mat = M(0xffffff, { vertexColors: true, roughness: .9 }), pts = [[], []];
  for (let i = 0; i < 9000 && pts[0].length + pts[1].length < 1400; i++) {
    const x = cx + (R() - .5) * 2 * ((x1 - x0) / 2 + 240), z = cz + (R() - .5) * 2 * ((z1 - z0) / 2 + 240), o = off(x, z);
    if (o < 96 || o > 250) continue; if (Math.abs(x - cx) > 275 || Math.abs(z - cz) > 275) continue;
    const dense = .35 + .65 * Math.min(1, (o - 96) / 50); if (R() > dense) continue;
    pts[R() < .45 ? 1 : 0].push([x, hAt(x, z) - .2, z, 1.3 + R() * 1.6]);
  }
  for (let k = 0; k < 2; k++) {
    const im = new THREE.InstancedMesh(k ? coni : broad, mat, pts[k].length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
    pts[k].forEach(([x, y, z, s], i) => { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), R() * 6.28); m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s * (.85 + R() * .4), s)); im.setMatrixAt(i, m4); const v = .82 + R() * .3; im.setColorAt(i, c.setRGB(v * (.95 + R() * .1), v, v * .95)); });
    im.castShadow = false; im.receiveShadow = false; im.computeBoundingSphere(); g.add(im);
  }
  return g;
}
function waterTower(x, y, z) {
  const g = new THREE.Group(), steel = M(0xd9dde2, { roughness: .45, metalness: .5 }), leg = M(0x9aa3ab, { roughness: .6, metalness: .4 });
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + .78, m = add(new THREE.CylinderGeometry(.35, .45, 16, 8), leg, Math.cos(a) * 3.2, 8, Math.sin(a) * 3.2, g); m.rotation.z = Math.cos(a) * .08; m.rotation.x = -Math.sin(a) * .08; }
  add(new THREE.CylinderGeometry(5, 5, 6, 24), steel, 0, 19, 0, g); add(new THREE.SphereGeometry(5, 24, 10, 0, 6.29, 0, 1.2), steel, 0, 20.5, 0, g); add(new THREE.SphereGeometry(5, 24, 8, 0, 6.29, 1.9, 1.24), steel, 0, 17.4, 0, g);
  g.position.set(x, y, z); g.traverse(o => { if (o.isMesh) o.castShadow = false; }); return g;
}
