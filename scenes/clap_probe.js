// PROBE for Clap Cops: town + House A furnished; dumps rooms / furniture / doors / stairs / stadium; free camera via opts.camP.
import * as THREE from 'three';
import { buildTown } from '../engine/sets/town.js';
import { dayLook } from '../engine/look.js';
export async function build({ scene, W: w, H: h, opts = {} }) {
  const T = await buildTown(scene, { interiors: true, furnish: ['entry', 'living', 'parents', 'dining', 'kitchen'] });
  T.root.position.x += 3000; scene.updateMatrixWorld(true);
  const H0 = T.houses.A, inner = H0.root.parent, v = new THREE.Vector3(), f2 = a => a.map(q => +q.toFixed(2));
  if (opts.dbg) {
    for (const l of T.data.lots) console.error('LOT', l.house, f2([l.c[0] + 3000, l.c[1]]), l.yaw.toFixed(3), JSON.stringify(l.planCentre));
    for (const [id, r] of Object.entries(H0.rooms)) { const a = inner.localToWorld(new THREE.Vector3(r.rect.x, r.y || 0, r.rect.z)), b = inner.localToWorld(new THREE.Vector3(r.rect.x + r.rect.w, r.y || 0, r.rect.z + r.rect.d)); console.error('ROOM', id, f2([a.x, a.z, b.x, b.z, a.y]).join(' ')); }
    const out = []; scene.traverse(o => { if (o.name && /sofa|bed|wardrobe|table|chair|console|stair|door|island|rug|lamp|shelf|dresser|night/i.test(o.name) && o.getWorldPosition(v).x > 3000 && !/door/i.test(o.parent?.name || '')) { const b = new THREE.Box3().setFromObject(o); if (b.isEmpty()) return; out.push(o.name + ' ' + f2(b.min.toArray()).join(',') + ' / ' + f2(b.max.toArray()).join(',') + ' ry' + o.rotation.y.toFixed(2)); } });
    console.error('FURN\n' + [...new Set(out)].slice(0, 160).join('\n'));
    for (const a of T.data.areas) if (['stadium', 'track', 'pitch'].includes(a.kind)) { const xs = a.pts.map(p => p[0] + 3000), zs = a.pts.map(p => p[1]); console.error('AREA', a.kind, f2([Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)]).join(' ')); }
    console.error('ROADS near A', JSON.stringify(T.data.roads.filter(r => r.pts.some(p => Math.hypot(p[0] + 3000 - (T.data.lots[0].c[0] + 3000), p[1] - T.data.lots[0].c[1]) < 40)).map(r => [r.kind, r.w, r.pts.map(p => f2([p[0] + 3000, p[1]]))])).slice(0, 1500));
  }
  if (opts.dbg2) { const bb = new THREE.Box3(), c = new THREE.Vector3(), z = new THREE.Vector3(); const hit = (name, test) => { const out = []; scene.traverse(o => { if (!o.isMesh) return; bb.setFromObject(o); if (bb.isEmpty()) return; bb.getCenter(c); bb.getSize(z); if (test(c, z, o)) out.push((o.name || o.parent?.name || '?').slice(0, 30) + ' c' + f2(c.toArray()).join(',') + ' s' + f2(z.toArray()).join(',')); }); console.error(name + '\n' + out.slice(0, 40).join('\n')); };
    hit('FRONTDOOR', (c, z) => Math.abs(c.x - 3220.84) < 1.2 && Math.abs(c.z + 231.58) < .4 && c.y < 3);
    hit('PARENTS TALL', (c, z) => c.x > 3221.7 && c.x < 3226.4 && c.z > -231.5 && c.z < -226.6 && c.y > 4.4 && c.y < 8 && z.y > 1.6 && z.x < 4.5 && z.z < 4.5);
    hit('ENSUITE DOOR', (c, z) => Math.abs(c.x - 3226.45) < .4 && c.y > 4.4 && c.y < 7.5 && z.y > 1.5);
    hit('TV', (c, z, o) => /tv|screen/i.test(o.name + (o.parent?.name || '')));
    hit('DINING', (c, z) => c.x > 3227.7 && c.x < 3233 && c.z > -225.6 && c.z < -220 && c.y < 1.2 && z.y > .3);
    hit('ENTRY', (c, z) => c.x > 3217.3 && c.x < 3221.5 && c.z > -231.6 && c.z < -225 && c.y < 2.5 && z.y > .3 && z.x < 3 && z.z < 3); }
  const LOOK = dayLook(scene, { sunAz: opts.az ?? 160, sunEl: opts.el ?? 45, sun: 3.3, fill: .9 });
  const cam = new THREE.PerspectiveCamera(opts.fov || 40, w / h, .15, 400);
  const update = t => { const o = opts.views ? opts.views[Math.round(t)] || opts.views[0] : (globalThis.VIEW || opts); if (o.camP) { cam.position.set(...o.camP); cam.lookAt(...o.camL); cam.fov = o.fov || 40; cam.updateProjectionMatrix(); } cam.updateMatrixWorld(true); return true; };
  update(0);
  return { camera: cam, sun: LOOK.sun, post: LOOK.post, update };
}
