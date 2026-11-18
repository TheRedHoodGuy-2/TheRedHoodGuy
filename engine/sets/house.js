// HOUSE BUILDER (2026-11-18): builds the floors of a house from engine/designs/plans.js with the room kit. Every room is a
// real room() (doors, windows, skirting, switches); rooms that share an edge share ONE partition (each side .1 m thick, its
// own paint), and a door between them sits in the same place in both. Stairs are real flights that line up with the
// floor holes above / below, with railings on the open sides. The attic is a gable roof with rafters.
//   const H = await buildHouse(scene, 'A', { floors: ['ground', 'up'] })   -> { rooms: { id: { refs, rect, y, plan } }, root }
import * as THREE from 'three';
import { mat } from '../materials.js';
import { bbox, at as place } from '../build.js';
import { room, SIZE } from './roomkit.js';
import { PLANS, FLOOR_H } from '../designs/plans.js';
import { STYLE } from '../designs/styles.js';

const T = .1, EPS = 1e-3;
const near = (a, b) => Math.abs(a - b) < EPS;
// which wall of room a touches room b, and the overlap along it
function shared(a, b) {
  if (near(a.x + a.w, b.x)) return ['e', 'w', 'z', Math.max(a.z, b.z), Math.min(a.z + a.d, b.z + b.d)];
  if (near(b.x + b.w, a.x)) return ['w', 'e', 'z', Math.max(a.z, b.z), Math.min(a.z + a.d, b.z + b.d)];
  if (near(a.z + a.d, b.z)) return ['s', 'n', 'x', Math.max(a.x, b.x), Math.min(a.x + a.w, b.x + b.w)];
  if (near(b.z + b.d, a.z)) return ['n', 's', 'x', Math.max(a.x, b.x), Math.min(a.x + a.w, b.x + b.w)];
  return null;
}
// world coordinate along a wall -> the room kit's `at` (from the wall middle, left to right seen from inside)
const localAt = (r, wall, c) => { const cx = r.x + r.w / 2, cz = r.z + r.d / 2; return wall === 'n' ? c - cx : wall === 's' ? -(c - cx) : wall === 'e' ? c - cz : -(c - cz); };
const toRoom = (r, [x0, z0, x1, z1]) => { const cx = r.x + r.w / 2, cz = r.z + r.d / 2; return [x0 - cx, z0 - cz, x1 - cx, z1 - cz]; };

// a straight flight, modelled: oak treads with a nosing, white risers, a closed white stringer on each side, climbing toward -z.
// local: x across [0, w], bottom step at z = run, top at z = 0, y 0 -> rise. Returns { obj, g } (g = going of one step).
export function flight({ w, run, rise, rail = 'e', solidUnder = null, M }) {
  const n = Math.round(rise / .27), r = rise / n, g = run / n, o = new THREE.Group();
  for (let i = 1; i < n; i++) {
    const z1 = run - (i - 1) * g, z0 = run - i * g;
    o.add(place(bbox(w, .05, g + .03, M.tread, .008), w / 2, i * r - .025, (z0 + z1) / 2 - .015));
    o.add(place(bbox(w - .02, r - .05, .02, M.riser, .002), w / 2, i * r - r / 2 - .025, z1 - .01));
  }
  // closed stringers: saw-tooth top following the steps, straight sloped bottom
  const sh = new THREE.Shape(); sh.moveTo(run, 0);
  for (let i = 1; i < n; i++) { sh.lineTo(run - (i - 1) * g, i * r + .02); sh.lineTo(run - i * g, i * r + .02); }
  sh.lineTo(0, rise); sh.lineTo(0, rise - .45); sh.lineTo(run - g * .5, -.0); sh.closePath();
  for (const x of [0, w]) { const e = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .04, bevelEnabled: false }), M.riser); e.rotation.y = -Math.PI / 2; e.position.set(x + (x ? .04 : 0), 0, 0); o.add(e); }
  // the space under the flight closed by a full-height wall on one side (a cupboard under the stairs)
  if (solidUnder != null) { const s2 = new THREE.Shape(); s2.moveTo(run, 0); s2.lineTo(0, rise - .45); s2.lineTo(0, 0); s2.closePath();
    const e = new THREE.Mesh(new THREE.ExtrudeGeometry(s2, { depth: .08, bevelEnabled: false }), M.wall); e.rotation.y = -Math.PI / 2; e.position.set(solidUnder + .08, 0, 0); o.add(e); }
  // handrail on the open side: black steel posts at every other step + a rail .9 m above the nosings
  if (rail) { const x = rail === 'e' ? w - .04 : .04, posts = [];
    for (let i = 1; i < n; i += 2) posts.push(i);
    for (const i of posts) { const z = run - (i - .5) * g, y = i * r; o.add(place(new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .95, 10), M.metal), x, y + .475, z)); }
    const a = new THREE.Vector3(x, r + .95, run - .5 * g), b = new THREE.Vector3(x, (n - 1) * r + .95, run - (n - 1.5) * g);
    o.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 8, .025, 10), M.metal)); }
  o.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; });
  return { obj: o, g, n, r };
}
// a straight guard railing between two floor points (black steel, .95 m)
function railing(p0, p1, M) {
  const o = new THREE.Group(), L = p0.distanceTo(p1), n = Math.max(2, Math.ceil(L / .9) + 1);
  for (let i = 0; i < n; i++) { const p = p0.clone().lerp(p1, i / (n - 1)); o.add(place(new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .95, 10), M.metal), p.x, p.y + .475, p.z)); }
  const top = new THREE.Vector3(0, .95, 0); o.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(p0.clone().add(top), p1.clone().add(top)), 4, .025, 10), M.metal));
  const mid = new THREE.Vector3(0, .45, 0); o.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(p0.clone().add(mid), p1.clone().add(mid)), 4, .012, 8), M.metal));
  o.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; }); return o;
}

// the attic: a gable roof (ridge along x), exposed pine rafters, knee walls, a window in each gable end
async function attic(parent, r, y, M) {
  const g = new THREE.Group(); g.position.set(r.x, y, r.z); parent.add(g);
  const W = r.w, D = r.d, knee = .7, ridge = 3.7, slope = Math.atan2(ridge - knee, D / 2), L = Math.hypot(ridge - knee, D / 2) + .25;
  g.add(place(bbox(W, .1, D, M.atticFloor, .004), W / 2, -.05, D / 2));
  for (const s of [-1, 1]) {   // roof boards (inside face) + rafters every 1.1 m
    const roof = bbox(W + .2, .06, L, M.boards, .004); roof.rotation.x = -s * slope; roof.position.set(W / 2, (knee + ridge) / 2 + .1, D / 2 - s * D / 4); g.add(roof);
    for (let x = .3; x < W; x += 1.1) { const rf = bbox(.09, .18, L, M.rafter, .01); rf.rotation.x = -s * slope; rf.position.set(x, (knee + ridge) / 2 - .03, D / 2 - s * D / 4); g.add(rf); }
    g.add(place(bbox(W, knee + .35, .1, M.boards, .004), W / 2, (knee + .35) / 2, s < 0 ? D - .05 : .05));   // knee wall taller than the roof's foot: no daylight gap along the eaves
  }
  g.add(place(bbox(W, .2, .14, M.rafter, .01), W / 2, ridge - .05, D / 2));   // ridge beam
  for (const x of [.05, W - .05]) {   // gable end walls with a window (the round-window look comes from its frame)
    const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(D / 2, knee); sh.lineTo(0, ridge); sh.lineTo(-D / 2, knee); sh.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 1.9, .55, 0, Math.PI * 2, false); sh.holes.push(hole);
    const e = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .1, bevelEnabled: false }), M.boards); e.rotation.y = Math.PI / 2; e.position.set(x - .05, 0, D / 2); g.add(e);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.56, .05, 10, 40), M.trim); ring.rotation.y = Math.PI / 2; ring.position.set(x, 1.9, D / 2); g.add(ring);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(.55, 40), new THREE.MeshPhysicalMaterial({ color: '#dfe9f2', roughness: .05, transparent: true, opacity: .2, depthWrite: false })); glass.rotation.y = Math.PI / 2; glass.position.set(x, 1.9, D / 2); g.add(glass);
    for (const a of [0, Math.PI / 2]) { const bar = bbox(.04, 1.1, .04, M.trim, .005); bar.rotation.x = a; bar.position.set(x, 1.9, D / 2); g.add(bar); }
  }
  g.traverse(m => { if (m.isMesh) { m.castShadow = !m.material.transparent; m.receiveShadow = true; } });
  return { root: g, W, D, H: ridge, openings: [], walls: {} };
}

export async function buildHouse(scene, key, o = {}) {
  const P = PLANS[key], S = STYLE[P.style], root = new THREE.Group(); scene.add(root); if (o.origin) root.position.set(...o.origin);
  const out = { rooms: {}, root, plan: P, style: S };
  const M = { tread: S.tread(), riser: mat('plaster_fine', { color: '#f4f1ec', size: 1, normal: .4, rough: .6 }), metal: new THREE.MeshStandardMaterial({ color: '#1c1c1e', metalness: .6, roughness: .4 }),
    wall: mat('plaster_fine', { color: S.wall, size: 1.4, normal: 1.2 }), trim: new THREE.MeshPhysicalMaterial({ color: '#f3f1ec', roughness: .4, clearcoat: .3 }),
    atticFloor: (() => { const m = mat('laminate', { size: 2.6 }); m.color.set('#efe2cf'); return m; })(), boards: (() => { const m = mat('laminate', { size: 2.2 }); m.color.set('#f6e8d2'); return m; })(), rafter: (() => { const m = mat('laminate', { size: 1.4 }); m.color.set('#e8cfae'); return m; })() };   // raw pine: pale, not the dark red scans
  const st = P.stairs, mainRun = flight({ w: st.main.w, run: st.main.run, rise: FLOOR_H, M, solidUnder: st.main.w - .08 }), cellRun = flight({ w: st.cellar.w, run: st.cellar.run, rise: FLOOR_H, rail: 'w', M });
  const mainHole = [st.main.x - .02, st.main.z + mainRun.g, st.main.x + st.main.w + .02, st.main.z + st.main.run];
  const cellHole = [st.cellar.x - .02, st.cellar.z, st.cellar.x + st.cellar.w + .02, st.cellar.z + st.cellar.run - cellRun.g];
  for (const fk of o.floors || ['ground']) {
    const F = P.floors[fk]; if (!F) continue; const fg = new THREE.Group(); fg.position.y = F.y; root.add(fg);
    if (fk === 'attic') { const r = F.rooms[0]; out.rooms[r.id] = { refs: await attic(root, r, F.y, M), rect: r, y: F.y, plan: P, floor: fk }; continue; }
    const ops = Object.fromEntries(F.rooms.map(r => [r.id, { n: [], s: [], e: [], w: [] }]));
    for (const [a, b, at, opt = {}] of F.doors) {
      const ra = F.rooms.find(r => r.id === a), rb = F.rooms.find(r => r.id === b), sh = shared(ra, rb); if (!sh) { console.warn('rooms do not touch', a, b); continue; }
      const [wa, wb, , lo, hi] = sh, c = at ?? (lo + hi) / 2, size = [opt.w || SIZE.door[0], opt.open ? 3.2 : SIZE.door[1]];
      ops[a][wa].push({ type: 'door', at: localAt(ra, wa, c), size, open: !!opt.open, paint: S.innerDoor });
      ops[b][wb].push({ type: 'door', at: localAt(rb, wb, c), size, open: !!opt.open, model: false });
    }
    for (const [id, wall, c, opt = {}] of F.windows) {
      const r = F.rooms.find(q => q.id === id), type = opt.type || 'window';
      const size = type === 'window' ? [opt.w || 1.5, opt.h || SIZE.window[1]] : type === 'garage' ? [5, 3.2] : [opt.w || SIZE.door[0], SIZE.door[1]];
      ops[id][wall].push({ type, at: localAt(r, wall, c), size, sill: opt.sill, paint: type === 'door' ? S.frontDoor : null });
    }
    for (const r of F.rooms) {
      const look = S.room(r.type), hide = o.hide?.[r.id] || [];
      const floorHole = fk === 'up' && r.type === 'hallUp' ? toRoom(r, mainHole) : fk === 'ground' && r.type === 'entry' ? toRoom(r, cellHole) : null;
      const ceilHole = fk === 'ground' && r.type === 'entry' ? toRoom(r, mainHole) : fk === 'basement' && (r.x <= st.cellar.x && r.x + r.w >= st.cellar.x + st.cellar.w) ? toRoom(r, cellHole) : null;
      const refs = await room(fg, { w: r.w - 2 * T, d: r.d - 2 * T, T, walls: ops[r.id], wallMat: look.wall, floorMat: look.floor, ceilMat: look.ceil, trimMat: M.trim, floorHole, ceilHole,
        noCeiling: o.ceilings === false || look.noCeiling, hide, sockets: look.sockets === false ? {} : { n: [-(r.w / 2 - .6)], s: [r.w / 2 - .8] } });
      refs.root.position.set(r.x + r.w / 2, 0, r.z + r.d / 2);
      for (const [k, m] of Object.entries(look.accent || {})) refs.walls[k]?.traverse(q => { if (q.isMesh && q.material === look.wall) q.material = m; });
      if (look.joists) for (let x = -r.w / 2 + .4; x < r.w / 2; x += .6) refs.root.add(place(bbox(.07, .26, r.d - .2, look.joists, .005), x, SIZE.ceiling - .13, 0));
      out.rooms[r.id] = { refs, rect: r, y: F.y, plan: P, floor: fk, look };
    }
    // stairs + railings that belong to this floor
    if (fk === 'ground') {
      const m = mainRun.obj.clone(); m.position.set(st.main.x, 0, st.main.z); fg.add(m);
      fg.add(railing(new THREE.Vector3(cellHole[2] + .03, 0, cellHole[1] + .05), new THREE.Vector3(cellHole[2] + .03, 0, cellHole[3] - .05), M));
      fg.add(railing(new THREE.Vector3(cellHole[0] + .03, 0, cellHole[1] + .05), new THREE.Vector3(cellHole[2] + .03, 0, cellHole[1] + .05), M));
    }
    if (fk === 'basement') { const c = cellRun.obj.clone(); c.rotation.y = Math.PI; c.position.set(st.cellar.x + st.cellar.w, 0, st.cellar.z + st.cellar.run); fg.add(c); }
    if (fk === 'up') {   // guard rails round the stairwell, open at the top step so you can walk off it
      const [x0, z0, x1, z1] = mainHole, open = 1.1;
      fg.add(railing(new THREE.Vector3(x1 + .03, 0, z0 + open), new THREE.Vector3(x1 + .03, 0, z1 - .03), M));
      fg.add(railing(new THREE.Vector3(x0 + .03, 0, z1 - .03), new THREE.Vector3(x1 + .03, 0, z1 - .03), M));
    }
  }
  return out;
}
