// FURNISH (2026-11-18): puts every room of a built house in order, by room type and house style. Pieces go against
// walls by SLOT: a free stretch of wall that keeps doors clear (and windows, for tall pieces), so one layout works in any
// room size. Problems found while placing (no free wall, something in a doorway) go to window.furnishReport.
import * as THREE from 'three';
import { onFloor, againstWall, onTop, box } from '../place.js';
import * as F from './furniture.js';
import { mat } from '../materials.js';
const { M } = F;

const PAL = {
  warm: { wood: () => M.walnut(), light: () => M.oak(), sofa: () => M.boucle('#efe6d6'), sofaFrame: () => M.walnut(), chair: () => M.velvet('#6f7b4f'), pillow: () => M.velvet('#c16a43'),
    cab: () => M.paint('#24474a'), counter: () => M.quartz('#efece6'), handle: () => M.brass(), rug: () => M.jute('#c9ad84'), art: ['#efe6d6', '#c16a43', '#6f7b4f', '#d6c2a8'],
    duvet: () => M.linen('#d8c3a5'), sheet: () => M.cotton('#f3efe8'), headboard: () => M.linen('#c9b79c'), towel: '#efe6d6', bath: () => M.oak(), metal: () => M.black() },
  soft: { wood: () => M.paleOak(), light: () => M.paleOak(), sofa: () => M.boucle('#c98a6a'), sofaFrame: () => M.paleOak(), chair: () => M.velvet('#9db49a'), pillow: () => M.linen('#efe6d6'),
    cab: () => M.paint('#9db49a'), counter: () => M.quartz('#ece4d6'), handle: () => M.brass(), rug: () => M.jute('#e2d3bb'), art: ['#f3ece1', '#b9785a', '#9db49a', '#e8d8c0'],
    duvet: () => M.linen('#b9785a'), sheet: () => M.cotton('#f6f1ea'), headboard: () => M.linen('#d9c3a4'), towel: '#f2ebe2', bath: () => M.paleOak(), metal: () => M.brass() },
};

function room(r, report) {
  const R = r.refs, W = R.W, D = R.D, items = [];
  const ops = k => R.openings.filter(o => o.wall === k), len = k => (k === 'n' || k === 's') ? W : D;
  const size = o => { const y = o.rotation.y; o.rotation.y = 0; const s = box(o).getSize(new THREE.Vector3()); o.rotation.y = y; return s; };
  const occ = { n: [], s: [], e: [], w: [] };
  const slot = (k, w, pref = 0, tall = true, margin = .12, floorPiece = true) => { const L = len(k); for (let i = 0; i < 160; i++) for (const sg of [1, -1]) { const a = pref + sg * i * .05; if (Math.abs(a) + w / 2 > L / 2 - .02) continue;
    if (ops(k).every(o => (!tall && o.type === 'window') || a + w / 2 < o.x0 - margin || a - w / 2 > o.x1 + margin) && (!floorPiece || occ[k].every(([p, q]) => a + w / 2 < p - .03 || a - w / 2 > q + .03))) return a; } return null; };
  const a_W = () => W, a_D = () => D;
  const api = {
    W, D, R,
    // against wall k, centred near `pref` along it; y lifts wall-hung things; returns null when no free stretch
    wall(o, k, pref = 0, { gap = .02, tall = true, y = null, margin } = {}) { if (!o) return null; const s = size(o), a = slot(k, s.x, pref, tall, margin, y == null);
      if (a == null) { report.push(`${r.rect.id}: no free ${k} wall for ${o.name || 'piece'} (${s.x.toFixed(2)} m)`); return null; }
      againstWall(o, R, k, a, gap); o.userData.along = a; api.used.add(k); if (y == null) { const iv = [a - s.x / 2, a + s.x / 2]; iv.o = o; occ[k].push(iv); } if (!api.focus && y == null) api.focus = k; if (y != null) o.position.y = y; items.push(o); return o; },
    floor(o, x, z, yaw = 0) { if (!o) return null; onFloor(o, x, z, yaw); items.push(o); return o; },
    // is this piece clear of every other standing piece and inside the room?
    clear(o) { const b = box(o).expandByScalar(-.03); return b.min.x > -W / 2 && b.max.x < W / 2 && b.min.z > -D / 2 && b.max.z < D / 2 && !items.some(q => q !== o && !q.userData.rug && !q.userData.wallHung && !q.userData.onTop && box(q).expandByScalar(-.03).intersectsBox(b)); },
    add(o) { items.push(o); return o; },
    note(t) { report.push(`${r.rect.id}: ${t}`); },
    remove(o) { const i = items.indexOf(o); if (i >= 0) items.splice(i, 1); for (const k in occ) occ[k] = occ[k].filter(iv => iv.o !== o); },
    // a loose piece in the first free room corner (turned to face the room)
    corner(o, inset = .75, face = true) { if (!o) return null; const cs = [inset, inset + .3, inset + .6].flatMap(ins => [[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sz]) => [sx * (a_W() / 2 - ins), sz * (a_D() / 2 - ins)]));
      for (const [x, z] of cs) { onFloor(o, x, z, face ? (z > 0 ? Math.PI : 0) : 0); if (api.clear(o) && !R.openings.some(d => d.type !== 'window' && Math.hypot(({ n: d.at, s: -d.at, e: W / 2, w: -W / 2 })[d.wall] - x, ({ n: -D / 2, s: D / 2, e: d.at, w: -d.at })[d.wall] - z) < 1.3)) { items.push(o); return o; } }
      report.push(`${r.rect.id}: no free corner for the ${o.name}`); return null; },
    // turn a seat so its front (+z) looks at a point (a chair faces its table, never a blank door)
    faceTo(o, p) { if (!o) return o; const yaw = Math.atan2(p.x - o.position.x, p.z - o.position.z), c = box(o).getCenter(new THREE.Vector3()); o.rotation.y = yaw; onFloor(o, c.x, c.z, yaw); return o; },
    // on top of a piece at (lx, lz) in ITS OWN frame (-1..1 across its width / depth, -1 = its back): a monitor sits at the back
    // of the desk whichever wall the desk is on
    topL(o, s, lx = 0, lz = 0) { if (!o || !s) return null; const yaw = s.rotation.y; s.rotation.y = 0; const sz = box(s).getSize(new THREE.Vector3()); s.rotation.y = yaw; const c = box(s).getCenter(new THREE.Vector3()), off = new THREE.Vector3(lx * sz.x / 2, 0, lz * sz.z / 2).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw), b = box(s), p = c.add(off);
      return api.top(o, s, (p.x - b.min.x) / (b.max.x - b.min.x) * 2 - 1, (p.z - b.min.z) / (b.max.z - b.min.z) * 2 - 1, yaw); },
    top(o, s, u = 0, v = 0, yaw = null) { if (!o || !s) return null; onTop(o, s, u, v, yaw); o.userData.onTop = true; items.push(o); return o; },
    ceiling(o, x, z) { if (!o) return null; o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); o.position.set(x, R.H - b.max.y, z); items.push(o); return o; },
    hasWindow: k => ops(k).some(o => o.type === 'window'), doors: k => ops(k).filter(o => o.type !== 'window'),
    // a wall with no openings at all, else the one with the fewest
    used: new Set(),
    quiet(pref = ['n', 'e', 's', 'w']) { return [...pref].sort((a, b) => (ops(a).length + (api.used.has(a) ? 1.5 : 0)) - (ops(b).length + (api.used.has(b) ? 1.5 : 0)))[0]; },
    done() {
      // AUTO-FIX: loose pieces (chairs, plants, lamps, boxes...) that stand in another piece, a wall or a doorway get
      // nudged to the nearest clear spot (rings out to 1.5 m)
      const MOV = new Set(['armchair', 'plant', 'arc lamp', 'desk chair', 'gaming chair', 'egg chair', 'beanbag', 'box', 'toy box', 'basket', 'stool', 'dust sheet']);
      const doorZones = R.openings.filter(o => o.type !== 'window').map(d => { const c = { n: [d.at, -D / 2], s: [-d.at, D / 2], e: [W / 2, d.at], w: [-W / 2, -d.at] }[d.wall], n = { n: [0, 1], s: [0, -1], e: [-1, 0], w: [1, 0] }[d.wall], hw = d.open ? .6 : d.ow / 2, dp = d.open ? .6 : .9;
        return new THREE.Box3(new THREE.Vector3(Math.min(c[0], c[0] + n[0] * dp) - (n[0] ? 0 : hw), 0, Math.min(c[1], c[1] + n[1] * dp) - (n[1] ? 0 : hw)), new THREE.Vector3(Math.max(c[0], c[0] + n[0] * dp) + (n[0] ? 0 : hw), 2, Math.max(c[1], c[1] + n[1] * dp) + (n[1] ? 0 : hw))); });
      const solidAll = () => items.filter(o => !o.userData.wallHung && !o.userData.onTop && !o.userData.rug);
      const bad = (o, others) => { const b = box(o).expandByScalar(-.03); if (b.min.x < -W / 2 || b.max.x > W / 2 || b.min.z < -D / 2 || b.max.z > D / 2) return true; if (doorZones.some(z => z.intersectsBox(b))) return true; return others.some(q => q !== o && box(q).expandByScalar(-.03).intersectsBox(b)); };
      for (let pass = 0; pass < 2; pass++) for (const o of solidAll()) { if (!MOV.has(o.name)) continue; const others = solidAll(); if (!bad(o, others)) continue; const p0 = o.position.clone(); let ok = false;
        for (let rr = .15; rr <= 1.5 && !ok; rr += .15) for (let k = 0; k < 12 && !ok; k++) { o.position.set(p0.x + Math.cos(k / 12 * 6.283) * rr, p0.y, p0.z + Math.sin(k / 12 * 6.283) * rr); if (!bad(o, others)) ok = true; }
        if (!ok) { o.position.copy(p0); report.push(`${r.rect.id}: could not clear the ${o.name}`); } }
      // self-check before anything is added: pieces standing in each other, pieces through the walls
      const solid = items.filter(o => !o.userData.wallHung && !o.userData.onTop && !o.userData.rug), bx = solid.map(o => box(o));
      for (let i = 0; i < solid.length; i++) { const b = bx[i]; if (b.min.x < -W / 2 - .03 || b.max.x > W / 2 + .03 || b.min.z < -D / 2 - .03 || b.max.z > D / 2 + .03) report.push(`${r.rect.id}: ${solid[i].name || 'piece ' + i} goes through a wall`);
        for (let j = i + 1; j < solid.length; j++) { const q = b.clone().intersect(bx[j]); if (q.isEmpty()) continue; const sz = q.getSize(new THREE.Vector3()); if (sz.x > .06 && sz.z > .06 && sz.y > .06) report.push(`${r.rect.id}: ${solid[i].name || 'piece ' + i} clips ${solid[j].name || 'piece ' + j} (${sz.x.toFixed(2)} x ${sz.z.toFixed(2)})`); } }
      for (const o of items) R.root.add(o); r.focus = api.focus || 'n'; r.camStrict = !!api.camStrict;
      // doorway check: nothing standing within .9 m in front of a door
      for (const d of R.openings.filter(o => o.type !== 'window')) { const c = { n: [d.at, -D / 2], s: [-d.at, D / 2], e: [W / 2, d.at], w: [-W / 2, -d.at] }[d.wall], nrm = { n: [0, 1], s: [0, -1], e: [-1, 0], w: [1, 0] }[d.wall];
        const zone = new THREE.Box2(new THREE.Vector2(Math.min(c[0], c[0] + nrm[0] * .9) - (nrm[0] ? 0 : d.ow / 2), Math.min(c[1], c[1] + nrm[1] * .9) - (nrm[1] ? 0 : d.ow / 2)), new THREE.Vector2(Math.max(c[0], c[0] + nrm[0] * .9) + (nrm[0] ? 0 : d.ow / 2), Math.max(c[1], c[1] + nrm[1] * .9) + (nrm[1] ? 0 : d.ow / 2)));
        for (const o of items) { if (o.userData.wallHung) continue; const b = new THREE.Box3().setFromObject(o); if (b.min.y > 2.2) continue; R.root.updateMatrixWorld(true); const inv = R.root.matrixWorld.clone().invert(); b.applyMatrix4(inv);
          if (b.max.y < .05) continue; if (zone.intersectsBox(new THREE.Box2(new THREE.Vector2(b.min.x + .02, b.min.z + .02), new THREE.Vector2(b.max.x - .02, b.max.z - .02)))) report.push(`${r.rect.id}: something in front of the ${d.wall} door`); } } },
  };
  return api;
}
const hung = o => { if (o) o.userData.wallHung = true; return o; };
const name = (o, n) => { if (o) o.name = n; return o; };

const LAYOUT = {
  async living(a, P, st) {
    const sw = a.quiet(['s', 'w', 'e', 'n']), sofa = a.wall(name(await F.sofa({ seat: P.sofa(), frame: P.sofaFrame(), pillow: P.pillow() }), 'sofa'), sw, 0, { gap: .15, tall: false });
    const tvWall = { n: 's', s: 'n', e: 'w', w: 'e' }[sw];
    const con = a.wall(name(await F.tvConsole(), 'tv console'), tvWall, sofa ? -sofa.userData.along : 0, { tall: true, margin: .05 });
    if (con) { const t = F.tv(2.0); a.top(t, con, 0, 0, con.rotation.y); }
    // the seating group hangs off the sofa: rug + coffee table in front of it, chair at the table's side facing in, lamp arcing over the sofa end
    const yaw = sofa ? sofa.rotation.y : 0, fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), side = new THREE.Vector3(fwd.z, 0, -fwd.x), S0 = sofa ? box(sofa).getCenter(new THREE.Vector3()).setY(0) : new THREE.Vector3();
    const P0 = (f, s) => S0.clone().addScaledVector(fwd, f).addScaledVector(side, s);
    const sd = sofa ? box(sofa).getSize(new THREE.Vector3()) : new THREE.Vector3(1, 1, 1), sofaHalf = Math.min(sd.x, sd.z) / 2, tableAt = sofaHalf + .45 + .43;
    let q = P0(tableAt + .2, 0); a.floor(F.rug(P.rug(), 3.4, 2.6), q.x, q.z, yaw);
    q = P0(tableAt, 0); const ct = a.floor(name(F.coffeeTable({ wood: P.wood(), round: st === 'soft' }), 'coffee table'), q.x, q.z, yaw);
    q = P0(tableAt + .2, 2.1); a.faceTo(a.floor(name(await F.loungeChair(P.chair()), 'armchair'), q.x, q.z, 0), ct.position);
    q = P0(-.15, -1.85); { const lamp = name(F.arcLamp(), 'arc lamp'), tgt = P0(.35, -.6), d = new THREE.Vector3(tgt.x - q.x, 0, tgt.z - q.z); lamp.position.set(q.x, 0, q.z); lamp.rotation.y = Math.atan2(-d.z, d.x); lamp.userData.onTop = true; a.add(lamp); }   // an arc lamp overhangs the sofa ON PURPOSE: only its base stands on the floor
    q = P0(.1, 2.05); a.floor(name(await F.plant(M.matte('#efe6d6')), 'plant'), q.x, q.z);
    if (sofa) a.wall(hung(F.art(P.art, 1.2, 1.5, 0)), sw, sofa.userData.along, { y: 1.9, gap: .02 });
  },
  async kitchen(a, P, st) {
    const k = a.quiet(['e', 'w', 'n', 's']) === 'n' ? 'n' : a.hasWindow('n') ? 'n' : a.quiet();
    const Lw = k === 'n' || k === 's' ? a.W : a.D, L = Lw - 1.45;
    const run = await F.kitchenRun({ len: L, cab: P.cab(), counter: P.counter(), handle: P.handle(), sink: 0, range: L / 2 - .9, shelves: st === 'warm' ? P.light() : null, uppers: st === 'soft' ? P.cab() : null });
    const fr = await F.fridge(); a.wall(name(fr, 'fridge'), k, -Lw / 2 + .6, { tall: true, margin: .02 });
    a.wall(name(run, 'kitchen run'), k, -Lw / 2 + 1.25 + L / 2, { tall: false, margin: .02 });
    const iy = { n: 0, s: Math.PI, e: -Math.PI / 2, w: Math.PI / 2 }[k], isl = a.floor(name(F.island({ len: Math.min(2.6, a.W - 2.4), cab: P.cab(), counter: P.counter(), handle: P.handle() }), 'island'), 0, .35, iy);
    const f = new THREE.Vector3(Math.sin(iy), 0, Math.cos(iy)), sd = new THREE.Vector3(f.z, 0, -f.x);
    for (let i = -1; i <= 1; i++) { const p = isl.position.clone().addScaledVector(f, .95).addScaledVector(sd, i * .7); a.faceTo(a.floor(name(F.stool(M.linen(st === 'warm' ? '#c9b79c' : '#d9c3a4'), st === 'warm' ? M.black() : M.brass()), 'stool'), p.x, p.z, 0), isl.position.clone().addScaledVector(sd, i * .7)); }
    if (run) { const mw = await F.microwave(); mw.rotation.y = run.rotation.y; const off = new THREE.Vector3(-L / 2 + .7, 1.02, -.12).applyAxisAngle(new THREE.Vector3(0, 1, 0), run.rotation.y); mw.updateMatrixWorld(true); const mb = new THREE.Box3().setFromObject(mw); mw.position.set(run.position.x + off.x, 1.02 - mb.min.y, run.position.z + off.z); a.floor(mw, mw.position.x, mw.position.z, run.rotation.y); mw.position.y = 1.02; mw.userData.onTop = true; }
    for (const x of [-.7, .7]) a.ceiling(await F.pendant(1.0), x, .35);
  },
  async dining(a, P, st) {
    const round = st === 'soft', t = F.diningTable({ wood: P.wood(), round, w: round ? 1.5 : 2.5 });
    a.floor(t, 0, 0); const seats = round ? [[0, -1.1, 0], [1.1, 0, -Math.PI / 2], [0, 1.1, Math.PI], [-1.1, 0, Math.PI / 2]] : [[-.7, -.95, 0], [.7, -.95, 0], [-.7, .95, Math.PI], [.7, .95, Math.PI], [-1.65, 0, Math.PI / 2], [1.65, 0, -Math.PI / 2]];
    for (const [x, z, y] of seats) a.floor(F.diningChair({ wood: P.wood(), seat: P.chair() }), x, z, y);
    a.ceiling(await F.pendant(1.3), 0, 0);
    a.wall(hung(F.art(P.art, 1.6, 1.1, 2)), a.quiet(['w', 'n', 'e', 's']), 0, { y: 1.7 });
    a.wall(F.consoleTable(P.wood(), 1.6), a.quiet(['w', 'n', 'e', 's']), 0, { tall: false });
  },
  async entry(a, P, st) {
    const k = st === 'warm' ? 'e' : 'w';
    const c = a.wall(F.consoleTable(P.wood(), 1.3), k, -2, { tall: false });
    if (c) { a.wall(hung(F.mirror({ w: .9, h: 1.2, round: st === 'warm', arch: st === 'soft' })), k, -2, { y: 1.35, gap: .03 }); a.top(await F.plant(null, 'potted_plant_04'), c, .6, 0); }
    a.wall(hung(F.coatHooks(P.wood(), 4)), k, 2, { y: 2.2 });
    a.floor(F.rug(P.rug(), 1.2, 3.2), st === 'warm' ? 1.3 : -1.3, .2);
  },
  async hall(a, P) { a.floor(F.rug(P.rug(), Math.min(6, a.W - 1), .8), 0, 0); a.wall(hung(F.art(P.art, .9, 1.2, 1)), 'n', -1.8, { y: 1.7 }); a.wall(hung(F.art(P.art, .9, 1.2, 2)), 'n', 1.8, { y: 1.7 }); },
  async corridor(a, P) { a.floor(F.rug(P.rug(), Math.min(7, a.W - 2), .8), 0, 0); for (const x of [-3.5, 0, 3.5]) a.wall(hung(F.art(P.art, .8, 1.0, Math.round(x + 4))), 's', x, { y: 1.7 }); },
  async hallUp(a, P, st) { a.wall(F.consoleTable(P.wood(), 1.2), st === 'warm' ? 'e' : 'w', 0, { tall: false }); a.wall(hung(F.art(P.art, 1.0, 1.3, 0)), st === 'warm' ? 'e' : 'w', 0, { y: 1.8 }); },
  async toilet(a, P) {
    const t = await F.toilet(); a.wall(name(t, 'toilet'), a.quiet(['n', 's', 'e', 'w']), 0, { tall: false });
    const k = a.quiet(['e', 'w', 's', 'n']); const v = a.wall(F.vanity({ w: 1.0, body: P.bath(), top: P.counter(), tap: P.metal() }), k, 0, { tall: false });
    if (v) a.wall(hung(F.mirror({ w: .7, round: true, frame: P.metal() })), k, 0, { y: 1.55, gap: .02 });
    a.wall(hung(F.towelBar(M.cotton(P.towel), .5)), a.quiet(['w', 'e', 's', 'n']), .3, { y: 1.5 });
  },
  async bathroom(a, P, st) {
    const sk = a.doors('n').length ? 's' : 'n', sz = sk === 'n' ? -1 : 1;
    const sh = a.floor(F.shower({ w: a.W - .04, d: 1.45, tile: mat('tiles', { color: st === 'warm' ? '#e2d6c6' : '#e9e0d4', size: .5 }), metal: P.metal(), front: true }), 0, sz * (a.D / 2 - .73), sk === 'n' ? 0 : Math.PI);
    a.focus = sk; a.camStrict = true; const t = await F.toilet(); a.wall(t, 'e', sz * -(a.D / 2 - 2.0), { tall: false });
    const v = a.wall(name(F.vanity({ w: 1.2, body: P.bath(), top: P.counter(), tap: P.metal() }), 'vanity'), 'w', sz * (a.D / 2 - 2.2), { tall: false });
    if (v) a.wall(hung(F.mirror({ w: .9, h: 1.2, arch: st === 'soft', round: st === 'warm', frame: P.metal() })), 'w', v.position.z * -1, { y: 1.5, gap: .02 });
    a.wall(hung(F.towelBar(M.cotton(P.towel))), 'e', 1.0, { y: 1.6 });
    a.floor(F.rug(M.cotton(P.towel), .9, .6), 0, a.D / 2 - 1.2);
  },
  async ensuite(a, P, st) {
    a.focus = 's'; a.camStrict = true;
    const v = a.wall(F.vanity({ w: 1.2, body: P.bath(), top: P.counter(), tap: P.metal() }), a.hasWindow('n') ? 'e' : 'n', 0, { tall: false });
    if (v) a.wall(hung(F.mirror({ w: .8, round: true, frame: P.metal() })), a.hasWindow('n') ? 'e' : 'n', 0, { y: 1.55 });
    a.floor(F.shower({ w: a.W - .04, d: 1.45, tile: mat('tiles', { color: '#e2d6c6', size: .5 }), metal: P.metal(), front: true }), 0, a.D / 2 - .73, Math.PI);
    const t = await F.toilet(); a.wall(t, a.hasWindow('n') ? 'w' : 's', 0, { tall: false });
  },
  async laundry(a, P) {
    const k = a.quiet(['w', 'e', 'n', 's']);
    a.wall(await F.washer(), k, -.5, { tall: false }); a.wall(await F.washer(), k, .5, { tall: false });
    a.wall(F.shelf({ w: 2.0, body: P.light(), books: false }), k, 0, { y: 1.9 });
    a.floor(F.basket(M.jute('#c9ad84')), .6, .6);
  },
  async mudroom(a, P) { const k = a.quiet(['w', 'e', 'n']); a.wall(F.bench({ w: 1.6, seat: P.chair(), wood: P.wood() }), k, 0, { tall: false }); a.wall(hung(F.coatHooks(P.wood(), 5)), k, 0, { y: 1.9 }); a.floor(F.basket(M.jute('#c9ad84')), .8, .7); },
  async study(a, P, st) { await LAYOUT.office(a, P, st); },
  async office(a, P) {
    const k = a.hasWindow('s') ? 's' : a.quiet(); const d = a.wall(F.desk({ w: 1.9, top: P.wood() }), k, 0, { tall: false, gap: .05 });
    if (d) { a.topL(F.monitor(.9), d, 0, -.45); a.topL(await import('../build.js').then(b => b.ph('desk_lamp_arm_01', { scale: 1.45 })), d, .8, -.6); const fw = new THREE.Vector3(Math.sin(d.rotation.y), 0, Math.cos(d.rotation.y)), cp = d.position.clone().addScaledVector(fw, .85); a.faceTo(a.floor(name(await F.officeChair(), 'desk chair'), cp.x, cp.z, 0), d.position); }
    const kb = { s: 'n', n: 's', e: 'w', w: 'e' }[k]; a.wall(name(F.bookcase({ body: P.light() }), 'bookcase'), kb, 0); a.wall(await F.plant(M.matte('#efe6d6')), kb, 1.8, { tall: false });
    a.floor(F.rug(P.rug(), 2.2, 1.6), 0, 0);
  },
  async parents(a, P, st) {
    const k = a.quiet(['n', 'w', 'e', 's']) === 'n' && !a.hasWindow('n') ? 'n' : a.quiet(['w', 'e', 'n', 's']);
    const b = a.wall(name(F.bed({ w: 1.9, l: 3.1, frame: P.wood(), head: P.headboard(), duvet: P.duvet(), sheet: P.sheet(), pillow: P.sheet(), accent: P.pillow() }), 'bed'), k, 0, { tall: false, gap: .1 });
    if (b) { for (const s of [-1, 1]) { const n = a.wall(F.nightstand(P.wood()), k, (b.userData.along ?? 0) + s * 1.45, { tall: false }); if (n) a.top(F.tableLampW(M.ceramic(), M.linen('#efe6d6')), n, 0, 0); } }
    a.wall(F.wardrobe({ w: 2.2, body: M.paint(st === 'warm' ? '#e7ddd0' : '#f2ebe2') }), { n: 's', s: 'n', e: 'w', w: 'e' }[k], 0, { gap: .03 });
    a.floor(F.rug(P.rug(), 2.8, 2.0), 0, .6);
    a.wall(hung(F.art(P.art, 1.4, 1.0, 1)), k, 0, { y: 2.1, margin: .05 });
  },
  async guest(a, P) {
    const k = a.quiet(['w', 'e', 'n', 's']);
    const b = a.wall(F.bed({ w: 1.6, l: 3.0, frame: P.light(), head: P.headboard(), duvet: M.cotton('#e9e3d8'), sheet: P.sheet(), pillow: P.sheet() }), k, 0, { tall: false, gap: .1 });
    a.wall(name(F.nightstand(P.light()), 'nightstand'), k, 1.4, { tall: false }); const deep = (k === 'n' || k === 's') ? a.D : a.W; if (deep > 3.1 + .65 + 1.0) a.wall(name(F.dresser({ w: 1.4, body: P.light() }), 'dresser'), { n: 's', s: 'n', e: 'w', w: 'e' }[k], 0, { tall: false });
    a.wall(await F.plant(M.matte('#efe6d6')), k, -1.45, { tall: false });
  },
  async teenBoy(a, P) {   // bed on the quiet wall, desk + gaming chair on a wall WITHOUT a window, low dresser under the window
    const bw = a.quiet(['w', 'e', 's', 'n']);
    a.wall(name(F.bed({ w: 1.6, l: 3.0, frame: M.matte('#2a2d33'), head: M.linen('#3b4250'), duvet: M.cotton('#22324a'), sheet: M.cotton('#d9dbe0'), pillow: M.cotton('#d9dbe0'), accent: M.velvet('#6fa0ff') }), 'bed'), bw, ((bw === 'n' || bw === 's') ? a.W : a.D) / 2 - .95, { tall: false, gap: .1 });   // pushed into a corner: a teen room needs its floor
    // desk + chair: try each window-less wall (desk at the end away from the bed) until the chair stands clear
    let dw = null, d = null;
    for (const k of ['s', 'n', 'e', 'w'].filter(k => k !== bw && !a.hasWindow(k))) {
      const away = { n: { e: -1, w: 1 }, s: { e: 1, w: -1 }, e: { n: 1, s: -1 }, w: { n: -1, s: 1 } }[k]?.[bw] ?? 0, Ld = k === 'n' || k === 's' ? a.W : a.D;
      const dk = a.wall(name(F.desk({ w: 1.5, top: M.oak(), drawer: false }), 'desk'), k, away * (Ld / 2 - .85), { tall: false, gap: .05 }); if (!dk) continue;
      const gc = name(await F.gamingChair(), 'gaming chair'), cs = (() => { const y = gc.rotation.y; gc.rotation.y = 0; const z = box(gc).getSize(new THREE.Vector3()).z; gc.rotation.y = y; return z; })();
      const fw = new THREE.Vector3(Math.sin(dk.rotation.y), 0, Math.cos(dk.rotation.y)), cp = box(dk).getCenter(new THREE.Vector3()).addScaledVector(fw, .425 + cs / 2 + .02); a.faceTo(a.floor(gc, cp.x, cp.z, 0), dk.position);
      if (a.clear(gc) && a.clear(dk)) { dw = k; d = dk; break; } a.why = (a.why || '') + `${k} `; a.remove(gc); a.remove(dk); }
    if (!d) a.note(`desk would not fit: ${a.why}`);
    if (d) { a.focus = dw; a.camStrict = true; a.topL(F.monitor(1.0), d, 0, -.45); const led = F.ledStrip(1.4, '#6fa0ff'); a.topL(led, d, 0, -.92);
      a.wall(hung(F.poster(['#22324a', '#6fa0ff', '#ff7a45'], 'LEVEL UP', .9, 1.25, 1)), dw, d.userData.along, { y: 2.2 }); }
    for (const k of ['e', 'n', 's', 'w'].filter(k => a.hasWindow(k) && k !== bw && k !== dw)) { const dr = a.wall(name(F.dresser({ w: 1.2, h: .85, body: M.paint('#3b4250') }), 'dresser'), k, 0, { tall: false }); if (dr && a.clear(dr)) break; if (dr) a.remove(dr); }
    a.floor(F.rug(M.cotton('#3b4250'), 2.0, 1.5), 0, 0);
  },
  async teenGirl(a, P) {
    const k = a.quiet(['e', 's', 'n', 'w']);
    const b = a.wall(F.bed({ w: 1.6, l: 3.0, frame: M.paleOak(), head: M.boucle('#f7f1ea'), duvet: M.knit('#c9b8e0'), sheet: M.cotton('#f7f1ea'), pillow: M.cotton('#f7f1ea'), accent: M.velvet('#f2b8c6') }), k, 0, { tall: false, gap: .1 });
    a.wall(hung(F.fairyLights(2.0, .25)), k, 0, { y: 2.6, gap: .04 });
    const d = a.wall(F.desk({ w: 1.5, top: M.paleOak(), legs: M.paint('#f7f1ea'), drawer: false }), a.quiet(['w', 's', 'n', 'e']), 0, { tall: false, gap: .05 });
    if (d) { a.topL(F.mirror({ w: .5, round: true, frame: M.brass() }), d, -.3, -.7); }
    a.wall(hung(F.neonHeart('#ff7fb6', .55)), 'n', -1.3, { y: 2.0, gap: .04 });
    const eg = name(F.eggChair(M.jute('#e8d6b8'), M.cotton('#f7f1ea')), 'egg chair'); if (a.corner(eg, .85)) { const p = eg.position; a.focus = Math.abs(p.x) / a.W > Math.abs(p.z) / a.D ? (p.x > 0 ? 'e' : 'w') : (p.z > 0 ? 's' : 'n'); a.camStrict = true; }
    a.floor(F.rug(M.cotton('#f7f1ea'), 2.0, 2.0, '#e9c9c6', true), 0, .4);
    a.corner(await F.plant(M.matte('#f2d8d6')), .45, false);
    a.floor(F.ringLight(), -a.W / 2 + .4, -a.D / 2 + .45);
  },
  async kid(a, P) {
    a.wall(F.bed({ w: 1.3, l: 2.8, frame: M.paint('#f2efe8'), head: M.cotton('#9fb6cf'), duvet: M.cotton('#4f7fb5'), sheet: M.cotton('#f2efe8'), pillow: M.cotton('#f2efe8'), headH: 1.1 }), a.quiet(['e', 'n', 'w', 's']), 0, { tall: false, gap: .1 });
    a.wall(F.toyBox('#f2c14e'), a.quiet(['n', 'e', 's']), 1.0, { tall: false }); a.floor(F.beanBag(M.cotton('#e45b4b')), -a.W / 2 + .8, a.D / 2 - .9);
    a.wall(hung(F.poster(['#9fd0ff', '#4f7fb5', '#ffd34e'], 'SPACE', .8, 1.1, 0)), 'n', 0, { y: 1.7 }); a.floor(F.rug(M.cotton('#ffd34e'), 1.8, 1.8, '#4f7fb5', true), 0, .2);
    const sh = a.wall(F.shelf({ w: 1.2, body: M.paint('#f2efe8') }), a.quiet(['w', 's', 'e']), 0, { y: 1.5 }); if (sh) hung(sh);
  },
  async den(a, P) { const sf = a.wall(await F.sofa({ seat: M.boucle('#e8ecdf'), frame: M.paleOak(), pillow: M.velvet('#b9785a'), len: 2.4 }), a.quiet(['n', 'e', 'w']), 0, { tall: false, gap: .1 });
    const yaw = sf ? sf.rotation.y : 0, fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), S0 = sf ? sf.position.clone() : new THREE.Vector3(); let q = S0.clone().addScaledVector(fwd, 1.45); a.floor(F.rug(M.cotton('#e8d8c0'), 2.2, 1.4), q.x, q.z, yaw);
    a.wall(F.toyBox('#d98a6a'), a.quiet(['e', 'w', 's']), 0, { tall: false }); q = S0.clone().addScaledVector(fwd, 1.5).addScaledVector(new THREE.Vector3(fwd.z, 0, -fwd.x), 1.1); a.floor(F.beanBag(M.cotton('#9db49a')), q.x, q.z); },
  async linen(a, P) { const k = a.quiet(['w', 'e', 'n', 's']); const s = a.wall(await F.steelShelves(), k, 0); for (const y of [.75, 1.3, 1.85]) if (s) { const t = F.towelStack(['#efe6d6', '#d8c3a5', '#9db49a'][Math.round(y * 2) % 3]); a.top(t, s, 0, 0); t.position.y = y; } a.floor(F.basket(M.jute('#c9ad84')), .6, .6); },
  async garage(a, P) {
    a.floor(await F.car(), .1, -.2, 0); a.wall(await F.steelShelves(), 'w', 1.2); a.wall(await F.steelShelves(), 'w', -.4);
    a.wall(name(F.workbench(M.oak()), 'workbench'), 'e', 1.0, { tall: false }); a.wall(await F.toolChest(), 'e', -1.8, { tall: false });
    for (let i = 0; i < 3; i++) a.floor(await F.box(1.45), -a.W / 2 + .5, -a.D / 2 + 3.6 + i * .75, i);
  },
  async rec(a, P) {
    // TV corner: sofa on the south wall facing a TV on the north wall, rug + table between, all on one line
    const sf = a.wall(name(await F.sofa({ seat: M.boucle('#d9d2c6'), frame: M.matte('#3d3a36'), pillow: M.velvet('#6f7b4f'), len: 3.2 }), 'sofa'), 's', -2.0, { tall: false, gap: .15 });
    const sx = sf ? box(sf).getCenter(new THREE.Vector3()).x : 2, sz = sf ? box(sf).min.z : 2;
    const con = a.wall(name(await F.tvConsole(), 'tv console'), 'n', sx, { tall: true, margin: .05 }); if (con) a.top(F.tv(2.4), con, 0, 0, con.rotation.y);
    a.floor(F.rug(M.jute('#a59a8c'), 4.0, 2.8), sx, sz - 1.6); a.floor(name(F.coffeeTable({ wood: M.walnut() }), 'coffee table'), sx, sz - .9);
    a.floor(name(F.poolTable(M.walnut()), 'pool table'), -2.2, 1.0, Math.PI / 2);
    a.wall(F.barFridge(), 'e', -3.5, { tall: false }); a.wall(hung(await import('../build.js').then(b => b.ph('dartboard', { scale: 1.45 }))), 'e', -1.5, { y: 1.9 });
  },
  async storage(a, P) { for (const x of [-3.6, -1.9, -.2, 1.5]) a.wall(await F.steelShelves(), 'e', x); a.wall(name(F.furnaceUnit(), 'furnace'), 'n', -1.2, { tall: false }); a.wall(name(F.waterHeater(), 'water heater'), 'n', .4, { tall: false });
    for (let i = 0; i < 5; i++) a.floor(await F.box(1.45 + (i % 2) * .3), -1.6 + (i % 3) * .9, 2.6 + Math.floor(i / 3) * .9, i * .7); a.ceiling(F.bulb(), 0, 0); },
  async basementRaw(a, P) { for (const [k, x] of [['w', -3], ['w', 0], ['n', 3], ['s', -2]]) a.wall(await F.steelShelves(), k, x); for (let i = 0; i < 9; i++) a.floor(await F.box(1.45 + (i % 3) * .25), -3 + (i % 4) * 1.1, 2.6 + Math.floor(i / 4) * .9, i * .5); a.ceiling(F.bulb(), 0, 0); a.ceiling(F.bulb(), -3.5, -2.5); },
  async furnace(a, P) { a.wall(name(F.furnaceUnit(), 'furnace'), 'w', 3.6, { tall: false }); a.wall(name(F.waterHeater(), 'water heater'), 'w', 2.4, { tall: false }); a.wall(await F.washer(), 'e', 2.6, { tall: false }); a.wall(await F.washer(), 'e', 3.6, { tall: false }); a.floor(F.basket(M.jute('#c9ad84')), -.8, 3.2); a.ceiling(F.bulb(), 0, 1); },
};
async function atticLayout(r, P, report, st) {
  const g = r.refs.root, add = (o, x, z, yaw = 0) => { onFloor(o, x, z, yaw); g.add(o); return o; };
  if (st === 'warm') {   // House A: old furniture under dust sheets, stacks of boxes
    add(await import('../build.js').then(b => b.ph('ArmChair_01', { scale: 1.45 })), 4.5, 5.6, .5); add(await import('../build.js').then(b => b.ph('ClassicNightstand_01', { scale: 1.45 })), 6.2, 6.6, -.4);   // old furniture stored up here (the dust-sheet cloth read as plastic chairs: dropped) add(await F.oldCabinet(), 12.4, 5.5, -Math.PI / 2); add(await F.oldTable(), 9.8, 4.6);
    for (let i = 0; i < 10; i++) add(await F.box(1.3 + (i % 3) * .3), 1.6 + (i % 5) * 1.3, i > 4 ? 7.6 : 3.4, i * .6);
  } else {   // House B: trunk, rocking chair, dress form (the design board)
    add(await F.rockingChair(), 3, 5.5, .6); add(F.trunk(M.walnut()), 5.2, 4.4, -.2); add(F.dressForm(), 6.6, 6.2); add(await F.oldTable(), 10.6, 4.4);
    for (let i = 0; i < 6; i++) add(await F.box(1.3 + (i % 3) * .3), 9 + (i % 3) * 1.3, i > 2 ? 7.4 : 3.6, i * .6);
  }
}

export async function furnishHouse(scene, H, only = null) {
  const report = []; window.furnishReport = report; const st = H.style === undefined ? H.plan.style : H.plan.style, P = PAL[st];
  for (const [id, r] of Object.entries(H.rooms)) {
    if (only && !only.includes(id)) continue;
    try {
      if (r.rect.type === 'attic') { await atticLayout(r, P, report, st); continue; }
      const f = LAYOUT[r.rect.type]; if (!f) continue; const a = room(r, report); await f(a, P, st); a.done();
    } catch (e) { report.push(`${id}: ERROR ${e.message}`); console.error(id, e); }
  }
  return report;
}
