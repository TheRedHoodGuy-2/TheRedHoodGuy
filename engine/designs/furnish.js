// FURNISH (2026-11-18): puts every room of a built house in order, by room type and house style. Pieces go against
// walls by SLOT: a free stretch of wall that keeps doors clear (and windows, for tall pieces), so one layout works in any
// room size. Problems found while placing (no free wall, something in a doorway) go to window.furnishReport.
import * as THREE from 'three';
import { onFloor, againstWall, onTop } from '../place.js';
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
  const size = o => { const y = o.rotation.y; o.rotation.y = 0; o.updateMatrixWorld(true); const s = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()); o.rotation.y = y; return s; };
  const slot = (k, w, pref = 0, tall = true, margin = .12) => { const L = len(k); for (let i = 0; i < 160; i++) for (const sg of [1, -1]) { const a = pref + sg * i * .05; if (Math.abs(a) + w / 2 > L / 2 - .02) continue;
    if (ops(k).every(o => (!tall && o.type === 'window') || a + w / 2 < o.x0 - margin || a - w / 2 > o.x1 + margin)) return a; } return null; };
  const api = {
    W, D, R,
    // against wall k, centred near `pref` along it; y lifts wall-hung things; returns null when no free stretch
    wall(o, k, pref = 0, { gap = .02, tall = true, y = null, margin } = {}) { if (!o) return null; const s = size(o), a = slot(k, s.x, pref, tall, margin);
      if (a == null) { report.push(`${r.rect.id}: no free ${k} wall for ${o.name || 'piece'} (${s.x.toFixed(2)} m)`); return null; }
      againstWall(o, R, k, a, gap); o.userData.along = a; api.used.add(k); if (!api.focus && y == null) api.focus = k; if (y != null) o.position.y = y; items.push(o); return o; },
    floor(o, x, z, yaw = 0) { if (!o) return null; onFloor(o, x, z, yaw); items.push(o); return o; },
    top(o, s, u = 0, v = 0, yaw = null) { if (!o || !s) return null; onTop(o, s, u, v, yaw); items.push(o); return o; },
    ceiling(o, x, z) { if (!o) return null; o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o); o.position.set(x, R.H - b.max.y, z); items.push(o); return o; },
    hasWindow: k => ops(k).some(o => o.type === 'window'), doors: k => ops(k).filter(o => o.type !== 'window'),
    // a wall with no openings at all, else the one with the fewest
    used: new Set(),
    quiet(pref = ['n', 'e', 's', 'w']) { return [...pref].sort((a, b) => (ops(a).length + (api.used.has(a) ? 1.5 : 0)) - (ops(b).length + (api.used.has(b) ? 1.5 : 0)))[0]; },
    done() { for (const o of items) R.root.add(o); r.focus = api.focus || 'n';
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
    const yaw = sofa ? sofa.rotation.y : 0, fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), side = new THREE.Vector3(fwd.z, 0, -fwd.x), S0 = sofa ? sofa.position.clone() : new THREE.Vector3();
    const P0 = (f, s) => S0.clone().addScaledVector(fwd, f).addScaledVector(side, s);
    let q = P0(1.6, 0); a.floor(F.rug(P.rug(), 3.4, 2.6), q.x, q.z, yaw);
    q = P0(1.35, 0); a.floor(F.coffeeTable({ wood: P.wood(), round: st === 'soft' }), q.x, q.z, yaw);
    q = P0(1.6, 2.0); a.floor(await F.loungeChair(P.chair()), q.x, q.z, yaw + Math.PI / 2 + .35);
    q = P0(.1, -1.85); a.floor(F.arcLamp(), q.x, q.z, yaw - Math.PI / 2 + .25);
    q = P0(.05, 1.9); a.floor(await F.plant(M.matte('#efe6d6')), q.x, q.z);
    if (sofa) a.wall(hung(F.art(P.art, 1.2, 1.5, 0)), sw, sofa.userData.along, { y: 1.9, gap: .02 });
  },
  async kitchen(a, P, st) {
    const k = a.quiet(['e', 'w', 'n', 's']) === 'n' ? 'n' : a.hasWindow('n') ? 'n' : a.quiet();
    const L = (k === 'n' || k === 's' ? a.W : a.D) - .9;
    const run = await F.kitchenRun({ len: L, cab: P.cab(), counter: P.counter(), handle: P.handle(), sink: 0, range: L / 2 - .9, shelves: st === 'warm' ? P.light() : null, uppers: st === 'soft' ? P.cab() : null });
    a.wall(name(run, 'kitchen run'), k, -.45, { tall: false });
    const fr = await F.fridge(); a.wall(name(fr, 'fridge'), k, -L / 2 - .1, { tall: true, margin: .05 });
    const isl = F.island({ len: Math.min(2.6, a.W - 2.4), cab: P.cab(), counter: P.counter(), handle: P.handle() }); a.floor(isl, 0, .35, { n: 0, s: Math.PI, e: -Math.PI / 2, w: Math.PI / 2 }[k]);
    for (let i = -1; i <= 1; i++) { const s = F.stool(M.linen(st === 'warm' ? '#c9b79c' : '#d9c3a4'), st === 'warm' ? M.black() : M.brass()); a.floor(s, i * .7, 1.25, Math.PI); }
    if (run) { const mw = await F.microwave(); mw.rotation.y = run.rotation.y; const off = new THREE.Vector3(-L / 2 + .7, 1.02, -.12).applyAxisAngle(new THREE.Vector3(0, 1, 0), run.rotation.y); mw.updateMatrixWorld(true); const mb = new THREE.Box3().setFromObject(mw); mw.position.set(run.position.x + off.x, 1.02 - mb.min.y, run.position.z + off.z); a.floor(mw, mw.position.x, mw.position.z, run.rotation.y); mw.position.y = 1.02; }
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
    a.floor(F.shower({ w: 1.6, d: Math.min(1.8, a.D * .4), tile: mat('tiles', { color: st === 'warm' ? '#e2d6c6' : '#e9e0d4', size: .5 }), metal: P.metal() }), -a.W / 2 + .8, -a.D / 2 + .92);
    const t = await F.toilet(); a.wall(t, 'e', -.6, { tall: false });
    const v = a.wall(F.vanity({ w: 1.2, body: P.bath(), top: P.counter(), tap: P.metal() }), 'w', -a.D / 2 + 2.4, { tall: false });
    if (v) a.wall(hung(F.mirror({ w: .9, h: 1.2, arch: st === 'soft', round: st === 'warm', frame: P.metal() })), 'w', v.position.z * -1, { y: 1.5, gap: .02 });
    a.wall(hung(F.towelBar(M.cotton(P.towel))), 'e', 1.0, { y: 1.6 });
    a.floor(F.rug(M.cotton(P.towel), .9, .6), 0, a.D / 2 - 1.2);
  },
  async ensuite(a, P, st) {
    const v = a.wall(F.vanity({ w: 1.2, body: P.bath(), top: P.counter(), tap: P.metal() }), a.hasWindow('n') ? 'e' : 'n', 0, { tall: false });
    if (v) a.wall(hung(F.mirror({ w: .8, round: true, frame: P.metal() })), a.hasWindow('n') ? 'e' : 'n', 0, { y: 1.55 });
    a.floor(F.shower({ w: Math.min(1.6, a.W - .2), d: 1.5, tile: mat('tiles', { color: '#e2d6c6', size: .5 }), metal: P.metal() }), 0, a.D / 2 - .8, Math.PI);
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
    if (d) { a.top(F.monitor(.9), d, 0, -.4, d.rotation.y); a.top(await import('../build.js').then(b => b.ph('desk_lamp_arm_01', { scale: 1.45 })), d, .8, -.6, d.rotation.y); const c = await F.officeChair(); a.floor(c, d.position.x + ({ s: 0, n: 0, e: -1, w: 1 }[k] * .9), d.position.z + ({ s: -1, n: 1, e: 0, w: 0 }[k] * .9), d.rotation.y + Math.PI); }
    const kb = { s: 'n', n: 's', e: 'w', w: 'e' }[k]; a.wall(F.bookcase({ body: P.light() }), kb, 0); a.floor(await F.plant(M.matte('#efe6d6')), a.W / 2 - .5, -a.D / 2 + .5);
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
    a.wall(F.nightstand(P.light()), k, 1.4, { tall: false }); a.wall(F.dresser({ w: 1.4, body: P.light() }), { n: 's', s: 'n', e: 'w', w: 'e' }[k], 0, { tall: false });
    a.floor(await F.plant(M.matte('#efe6d6')), a.W / 2 - .5, a.D / 2 - .6);
  },
  async teenBoy(a, P) {
    const b = a.wall(F.bed({ w: 1.6, l: 3.0, frame: M.matte('#2a2d33'), head: M.linen('#3b4250'), duvet: M.cotton('#22324a'), sheet: M.cotton('#d9dbe0'), pillow: M.cotton('#d9dbe0'), accent: M.velvet('#6fa0ff') }), a.quiet(['w', 'e', 's', 'n']), 0, { tall: false, gap: .1 });
    const k = a.hasWindow('n') ? 'e' : 'n'; const d = a.wall(F.desk({ w: 2.0, top: M.oak(), drawer: false }), a.hasWindow('e') ? 's' : 'e', 0, { tall: false, gap: .05 });
    if (d) { a.top(F.monitor(1.1), d, 0, -.35, d.rotation.y); const led = F.ledStrip(1.9, '#6fa0ff'); a.top(led, d, 0, -.9, d.rotation.y); const gc = await F.gamingChair(); const dir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), d.rotation.y); a.floor(gc, d.position.x + dir.x * .95, d.position.z + dir.z * .95, d.rotation.y + Math.PI); }
    a.wall(hung(F.poster(['#22324a', '#6fa0ff', '#ff7a45'], 'LEVEL UP', .9, 1.25, 1)), 'n', -1, { y: 1.9 });
    a.wall(F.wardrobe({ w: 1.6, body: M.paint('#3b4250') }), a.quiet(['s', 'w', 'e']), 1, { gap: .03 });
    a.floor(F.rug(M.cotton('#3b4250'), 2.2, 1.6), 0, .5);
  },
  async teenGirl(a, P) {
    const k = a.quiet(['e', 's', 'n', 'w']);
    const b = a.wall(F.bed({ w: 1.6, l: 3.0, frame: M.paleOak(), head: M.boucle('#f7f1ea'), duvet: M.knit('#c9b8e0'), sheet: M.cotton('#f7f1ea'), pillow: M.cotton('#f7f1ea'), accent: M.velvet('#f2b8c6') }), k, 0, { tall: false, gap: .1 });
    a.wall(hung(F.fairyLights(2.0, .25)), k, 0, { y: 2.6, gap: .04 });
    const d = a.wall(F.desk({ w: 1.5, top: M.paleOak(), legs: M.paint('#f7f1ea'), drawer: false }), a.quiet(['w', 's', 'n', 'e']), 0, { tall: false, gap: .05 });
    if (d) { a.top(F.mirror({ w: .5, round: true, frame: M.brass() }), d, -.3, -.6, d.rotation.y); }
    a.wall(hung(F.neonHeart('#ff7fb6', .55)), 'n', -1.3, { y: 2.0, gap: .04 });
    const eg = F.eggChair(M.jute('#e8d6b8'), M.cotton('#f7f1ea')); a.floor(eg, a.W / 2 - .9, a.D / 2 - 1.0, -2.4);
    a.floor(F.rug(M.cotton('#f7f1ea'), 2.0, 2.0, '#e9c9c6', true), 0, .4);
    a.floor(await F.plant(M.matte('#f2d8d6')), -a.W / 2 + .45, a.D / 2 - .45);
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
    a.floor(await F.car(), .3, .2, 0); const sh = a.wall(await F.steelShelves(), 'w', -1.5); a.wall(await F.steelShelves(), 'w', .6);
    a.wall(F.workbench(M.oak()), 'e', 0, { tall: false }); a.wall(await F.toolChest(), 's', 2.2, { tall: false });
    for (let i = 0; i < 3; i++) a.floor(await F.box(1.45), -a.W / 2 + .6, a.D / 2 - .6 - i * .7, i);
  },
  async rec(a, P) {
    a.wall(await F.sofa({ seat: M.boucle('#d9d2c6'), frame: M.matte('#3d3a36'), pillow: M.velvet('#6f7b4f'), len: 3.2 }), 's', 1.5, { tall: false, gap: .15 });
    const con = a.wall(await F.tvConsole(), 'n', 1.5, { tall: false }); if (con) a.top(F.tv(2.4), con, 0, 0, con.rotation.y);
    a.floor(F.rug(M.jute('#a59a8c'), 4.0, 2.8), 1.5, .3); a.floor(F.coffeeTable({ wood: M.walnut() }), 1.5, .5);
    a.floor(F.poolTable(M.walnut()), 1.6, -3.2, Math.PI / 2);
    a.wall(F.barFridge(), 'e', -3.5, { tall: false }); a.wall(hung(await import('../build.js').then(b => b.ph('dartboard', { scale: 1.45 }))), 'e', -1.5, { y: 1.9 });
  },
  async storage(a, P) { for (const [k, x] of [['e', -3], ['e', -.8], ['e', 1.4], ['s', 1]]) a.wall(await F.steelShelves(), k, x); a.floor(F.furnaceUnit(), -1.2, -4.2); a.floor(F.waterHeater(), .2, -4.4); for (let i = 0; i < 5; i++) a.floor(await F.box(1.45 + (i % 2) * .3), -1.8 + (i % 3) * .8, 2.5 + Math.floor(i / 3) * .8, i * .7); a.ceiling(F.bulb(), 0, 0); },
  async basementRaw(a, P) { for (const [k, x] of [['w', -3], ['w', 0], ['n', 3], ['s', -2]]) a.wall(await F.steelShelves(), k, x); for (let i = 0; i < 9; i++) a.floor(await F.box(1.45 + (i % 3) * .25), -3 + (i % 4) * 1.1, 2.6 + Math.floor(i / 4) * .9, i * .5); a.ceiling(F.bulb(), 0, 0); a.ceiling(F.bulb(), -3.5, -2.5); },
  async furnace(a, P) { a.floor(F.furnaceUnit(), 0, -3.6); a.floor(F.waterHeater(), .9, -2.4); a.wall(await F.washer(), 'e', 2.6, { tall: false }); a.wall(await F.washer(), 'e', 3.6, { tall: false }); a.floor(F.basket(M.jute('#c9ad84')), -.8, 3.2); a.ceiling(F.bulb(), 0, 1); },
};
async function atticLayout(r, P, report, st) {
  const g = r.refs.root, add = (o, x, z, yaw = 0) => { onFloor(o, x, z, yaw); g.add(o); return o; };
  if (st === 'warm') {   // House A: old furniture under dust sheets, stacks of boxes
    add(F.sheetCovered(M.linen('#efe9df')), 4.5, 5.6, .5); add(F.sheetCovered(M.linen('#e9e2d6')), 6.2, 6.4, -.4); add(await F.oldCabinet(), 12.4, 5.5, -Math.PI / 2); add(await F.oldTable(), 9.8, 4.6);
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
