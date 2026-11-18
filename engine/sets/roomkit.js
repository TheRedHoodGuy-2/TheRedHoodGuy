// ROOM KIT (2026-11-18): one call builds a whole room the right size (scale v2, research/scale.md), with real doors and
// windows in real openings, skirting boards, light switches, sockets, floor and ceiling. Walls the camera needs gone
// become FILM-SET walls: invisible to the camera but they still block the sun and cast shadows, so the light stays real.
//   const R = await room(scene, { w: 5.4, d: 6, walls: { n: [{ type: 'window', at: 0 }], e: [{ type: 'door', at: -1 }] }, hide: ['s'] })
// Room space: floor at y = 0, centred on x / z. Walls: n = back (-z), s = front (+z), e = right (+x), w = left (-x).
// `at` = centre of the opening along the wall (m, from the wall's middle, left to right seen from inside the room).
import * as THREE from 'three';
import { mat } from '../materials.js';
import { bbox, at as place } from '../build.js';
import { loadRbx } from '../rbxmodel.js';
import { STUD } from '../r6.js';

export const SIZE = { ceiling: 12 * STUD, door: [4.5 * STUD, 8.4 * STUD], window: [4.4 * STUD, 6 * STUD], sill: 2.6 * STUD, wall: .2, skirting: .11,
  switchH: 4 * STUD, socketH: 1 * STUD };
const DOOR = { id: 2179041650, size: [2.38, 3.485] }, WINDOW = { id: 5654418916, size: [2.04, 5.168] };   // pulled from the Creator Store (models_v1 / door sheet)

// a wall switch / socket: a real plate (rounded, slightly proud), not a box stuck on
function plate(kind, white) {
  const g = new THREE.Group(), dark = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: .6 });
  g.add(bbox(.085, .085, .012, white, .006));
  if (kind === 'switch') { const r = bbox(.03, .05, .012, white, .004); r.position.z = .008; r.rotation.x = .12; g.add(r); }
  else for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(.005, .005, .004, 12), dark); h.rotation.x = Math.PI / 2; h.position.set(s * .012, .004, .007); g.add(h); }
  return g;
}

// sectional garage door, modelled: 4 horizontal panels with grooves, painted white, a black handle
function garageDoor(w, h, trimMat) {
  const g = new THREE.Group(), m = new THREE.MeshPhysicalMaterial({ color: '#f1efea', roughness: .45, clearcoat: .2 }), n = 4;
  for (let i = 0; i < n; i++) { const p = bbox(w - .02, h / n - .025, .05, m, .01); p.position.set(0, h / n * (i + .5), 0); g.add(p); }
  const hd = bbox(.3, .04, .04, new THREE.MeshStandardMaterial({ color: '#222', roughness: .5 }), .01); hd.position.set(0, h / n * .7, .045); g.add(hd);
  return g;
}

export async function room(scene, o = {}) {
  const W = o.w || 5.4, D = o.d || 6, H = o.h || SIZE.ceiling, T = o.T ?? SIZE.wall, root = new THREE.Group(); scene.add(root);
  const M = { wall: o.wallMat || mat('plaster_fine', { color: o.wallColor || '#e9e3da', size: 1.4, normal: 1.2 }),
    floor: o.floorMat || mat('laminate', { size: 2.4, clearcoat: .4, clearcoatRough: .3 }),
    ceil: o.ceilMat || mat('plaster_fine', { color: '#f2efea', size: 1.6, normal: .6 }),
    trim: o.trimMat || new THREE.MeshPhysicalMaterial({ color: '#f3f1ec', roughness: .4, clearcoat: .3, clearcoatRoughness: .4 }) };
  const refs = { root, walls: {}, openings: [], W, D, H };
  // floor + ceiling (oversized under the walls so no gaps at the corners)
  // slabs: one hole (stairwell) allowed, given in room space [x0, z0, x1, z1]
  const slab = (m, y, th, hole) => { const g = new THREE.Group(), X0 = -W / 2 - T, X1 = W / 2 + T, Z0 = -D / 2 - T, Z1 = D / 2 + T;
    const r = (a, b, c, d) => { if (b - a > .01 && d - c > .01) g.add(place(bbox(b - a, th, d - c, m, .004), (a + b) / 2, y, (c + d) / 2)); };
    if (!hole) r(X0, X1, Z0, Z1); else { const [hx0, hz0, hx1, hz1] = hole; r(X0, X1, Z0, hz0); r(X0, X1, hz1, Z1); r(X0, hx0, hz0, hz1); r(hx1, X1, hz0, hz1); } return g; };
  if (!o.noFloor) root.add(slab(M.floor, -.05, .1, o.floorHole));
  const ceil = o.noCeiling ? new THREE.Group() : slab(M.ceil, H + .06, .12, o.ceilHole); root.add(ceil); refs.ceiling = ceil;
  // walls: [name, length, centre position, rotation y] ; along-wall axis runs left -> right seen from inside
  const defs = { n: [W, [0, -D / 2 - T / 2], 0], s: [W, [0, D / 2 + T / 2], Math.PI], e: [D, [W / 2 + T / 2, 0], -Math.PI / 2], w: [D, [-W / 2 - T / 2, 0], Math.PI / 2] };
  for (const [k, [L, [cx, cz], ry]] of Object.entries(defs)) {
    const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = ry; root.add(g); refs.walls[k] = g;
    const ops = (o.walls?.[k] || []).map(op => { const [ow, oh] = op.size || (op.type === 'garage' ? [5, 3.2] : op.type === 'door' ? SIZE.door : SIZE.window);
      const y0 = op.type === 'window' ? (op.sill ?? SIZE.sill) : 0; return { ...op, x0: op.at - ow / 2, x1: op.at + ow / 2, y0, y1: Math.min(H - .1, y0 + oh), ow, oh }; }).sort((a, b) => a.x0 - b.x0);
    const Lx = L + 2 * T; let x = -Lx / 2;   // wall pieces between / above / below openings (inner face at local z = +T/2)
    const seg = (x0, x1, y0, y1) => { if (x1 - x0 < .002 || y1 - y0 < .002) return; g.add(place(bbox(x1 - x0, y1 - y0, T, M.wall, 0.0001, 1), (x0 + x1) / 2, (y0 + y1) / 2, 0)); /* square edges: pieces of one wall meet without a groove */ };
    for (const op of ops) { seg(x, op.x0, 0, H); seg(op.x0, op.x1, 0, op.y0); seg(op.x0, op.x1, op.y1, H); x = op.x1; }
    seg(x, Lx / 2, 0, H);
    // skirting along the inner face, broken at doors
    let sx = -L / 2;
    for (const op of [...ops.filter(p => p.type !== 'window'), { x0: L / 2, x1: L / 2 }]) { if (op.x0 - sx > .02) g.add(place(bbox(op.x0 - sx, SIZE.skirting, .018, M.trim, .004), (sx + op.x0) / 2, SIZE.skirting / 2, T / 2 + .009)); sx = op.x1; }
    // the real door / window models, scaled into each opening
    for (const op of ops) {
      if (op.open || op.model === false) { refs.openings.push({ wall: k, ...op }); continue; }   // open passage (open-plan) or the door model sits in the neighbour's half
      if (op.type === 'garage') { const gd = garageDoor(op.ow, op.oh, M.trim); gd.position.set(op.at, 0, 0); g.add(gd); refs.openings.push({ wall: k, ...op, object: gd }); continue; }
      const spec = op.type === 'door' ? DOOR : WINDOW, m = await loadRbx(op.model || spec.id, { paint: op.paint || null });
      m.scale.set(op.ow / spec.size[0], op.oh / spec.size[1], T / SIZE.wall); m.position.set(op.at, op.y0, 0); g.add(m);
      if (op.type === 'window') { const sill = place(bbox(op.ow + .12, .04, T + .1, M.trim, .008), op.at, op.y0 - .02, .05); g.add(sill); }
      else { const sw = plate('switch', M.trim); sw.position.set(op.x1 + .22, SIZE.switchH, T / 2 + .006); g.add(sw); }
      refs.openings.push({ wall: k, ...op, object: m });
    }
    for (const sx2 of (o.sockets?.[k] || [])) { const p = plate('socket', M.trim); p.position.set(sx2, SIZE.socketH, T / 2 + .006); g.add(p); }
  }
  root.traverse(m => { if (m.isMesh) { m.castShadow = !m.material.transparent; m.receiveShadow = true; } });
  // film-set walls: the camera sees through them, the light does not
  const ghost = obj => obj.traverse(m => { if (!m.isMesh) return; m.material = m.material.clone(); m.material.colorWrite = false; m.material.depthWrite = false; m.receiveShadow = false; });
  for (const k of o.hide || []) { if (k === 'ceiling') ghost(ceil); else ghost(refs.walls[k]); }
  return refs;
}
