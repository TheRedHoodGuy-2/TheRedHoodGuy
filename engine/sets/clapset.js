// CLAP COPS set pieces (2026-11-25): the clap-police van with its ear, a hinged front door + en-suite door made from the
// house's own door models, a dining chair, suitcase, cake, the football field (painted pitch + real bleachers + lights).
import * as THREE from 'three';
import { loadRbx } from '../rbxmodel.js';
import { mat } from '../materials.js';

const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
// text fitted with measureText so it never touches the edges
const fitText = (g, txt, w, h, font, pad = .1) => { let s = h; g.font = `900 ${s}px ${font}`; while (g.measureText(txt).width > w * (1 - 2 * pad) && s > 8) { s -= 2; g.font = `900 ${s}px ${font}`; } return s; };

// ---- the clap-police van: the pulled Chevrolet van (black), white CLAP POLICE livery, a roof light bar, the giant ear ----
export async function clapVan() {
  const g = new THREE.Group(), van = await loadRbx(6048783847); g.add(van);
  const b = new THREE.Box3().setFromObject(van), sz = b.getSize(new THREE.Vector3());   // long along z, front = +z
  const livery = canvasTex(1024, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#f4f4f0'; const s = fitText(c, 'CLAP POLICE', w, h * .62, 'Poppins, Arial Black, sans-serif'); c.font = `900 ${s}px Poppins, Arial Black, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CLAP POLICE', w / 2, h * .42);
    c.fillStyle = '#e8c547'; c.fillRect(w * .08, h * .8, w * .84, h * .08); });
  for (const sd of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(sz.z * .62, sz.z * .155), new THREE.MeshStandardMaterial({ map: livery, transparent: true, roughness: .5, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.position.set(sd * (sz.x / 2 + .012), sz.y * .5, -sz.z * .05); m.rotation.y = sd * Math.PI / 2; g.add(m); }
  // light bar on the cab roof: red + blue lenses that pulse (emissive), two point lights for the wash
  const top = b.max.y, bar = new THREE.Group(); bar.position.set(0, top + .07, sz.z * .22); g.add(bar);
  bar.add(new THREE.Mesh(new THREE.BoxGeometry(sz.x * .7, .08, .32), new THREE.MeshStandardMaterial({ color: '#16171a', roughness: .4, metalness: .5 })));
  const lens = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .4, roughness: .2, transparent: true, opacity: .92 });
  const red = new THREE.Mesh(new THREE.BoxGeometry(sz.x * .32, .12, .28), lens('#ff2a2a')), blue = new THREE.Mesh(new THREE.BoxGeometry(sz.x * .32, .12, .28), lens('#2a5cff'));
  red.position.set(-sz.x * .17, .09, 0); blue.position.set(sz.x * .17, .09, 0); bar.add(red, blue);
  const PR = new THREE.PointLight('#ff3030', 0, 22, 1.6), PB = new THREE.PointLight('#3060ff', 0, 22, 1.6); PR.position.set(-.6, .5, 0); PB.position.set(.6, .5, 0); bar.add(PR, PB);
  // the ear (modelled: the pulled ear lost its body to unread unions): an extruded ear outline with a raised helix rim,
  // the antihelix ridge, a dark concha bowl and the lobe, skin-coloured, ~1.15 m tall on a short mast, swivels
  const earP = new THREE.Group(); earP.position.set(0, top + .12, -sz.z * .2); g.add(earP); const ear = makeEar(); ear.position.y = .22; earP.add(ear);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, .26, 16), new THREE.MeshStandardMaterial({ color: '#2b2c30', metalness: .8, roughness: .3 })); mast.position.y = .13; earP.add(mast);
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return { g, size: sz, earP, siren(t, on) { const k = on ? (Math.sin(t * 13) > 0 ? 1 : 0) : 0; red.material.emissiveIntensity = on ? .4 + 3 * k : .3; blue.material.emissiveIntensity = on ? .4 + 3 * (1 - k) : .3; PR.intensity = on ? 30 * k : 0; PB.intensity = on ? 30 * (1 - k) : 0; } };
}

// a cartoon human ear (front = +z): outline extruded + bevelled, helix rim tube, antihelix, concha, tragus
export function makeEar(H = 1.15) {
  const k = H / 1.6, sh = new THREE.Shape(); sh.moveTo(.1, 0); sh.bezierCurveTo(.45, -.05, .55, .3, .5, .55); sh.bezierCurveTo(.62, .85, .7, 1.25, .5, 1.5); sh.bezierCurveTo(.3, 1.68, -.1, 1.62, -.25, 1.4);
  sh.bezierCurveTo(-.38, 1.2, -.3, .95, -.22, .8); sh.bezierCurveTo(-.15, .62, -.3, .45, -.25, .25); sh.bezierCurveTo(-.2, .05, -.05, -.02, .1, 0);
  const skin = new THREE.MeshStandardMaterial({ color: '#e7b48f', roughness: .55 }), deep = new THREE.MeshStandardMaterial({ color: '#b97e5f', roughness: .7 });
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .16, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 4, curveSegments: 24 }), skin);
  const g = new THREE.Group(); g.add(body);
  const tube = (pts, r, m = skin) => { const c = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, .26))); return new THREE.Mesh(new THREE.TubeGeometry(c, 40, r, 10, false), m); };
  g.add(tube([[.44, .6], [.56, .95], [.55, 1.3], [.38, 1.5], [.1, 1.57], [-.15, 1.47], [-.26, 1.3]], .065));                     // helix rim
  g.add(tube([[.12, .48], [.3, .75], [.33, 1.05], [.22, 1.3], [.02, 1.36]], .05));                                                  // antihelix
  const co = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 14), deep); co.scale.set(1, 1.25, .35); co.position.set(.08, .72, .21); g.add(co);   // concha bowl
  const tr = new THREE.Mesh(new THREE.SphereGeometry(.08, 14, 10), skin); tr.scale.set(1, 1.2, .8); tr.position.set(-.16, .62, .25); g.add(tr);   // tragus
  g.scale.setScalar(k); g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g;
}

// ---- a door model's leaf (+ handle) re-hung on a hinge so it can swing. Finds the meshes by world position. ----
// leafC: world centre of the leaf, along: 'x' | 'z' (the wall direction), hinge: +1 / -1 (which end), open: sign of the swing
export function hingeDoor(scene, leafC, { along = 'x', hinge = 1, r = .75 } = {}) {
  const parts = [], bb = new THREE.Box3(), c = new THREE.Vector3(), s = new THREE.Vector3();
  scene.traverse(o => { if (!o.isMesh || !/mat~(Wood~373737|Plastic~a3a2a5)/.test(o.name)) return; bb.setFromObject(o); bb.getCenter(c); bb.getSize(s);
    if (Math.abs(c.x - leafC[0]) < r && Math.abs(c.y - leafC[1]) < 1.2 && Math.abs(c.z - leafC[2]) < r && s.y > 1.2) parts.push(o); });
  // the leaf's own bars / panels / handle (any size) inside the leaf's box swing with it too (Xavier 2026-11-25: the door's
  // horizontal bars stayed in the doorway while the leaf opened)
  if (parts.length) { const lb = new THREE.Box3(); parts.forEach(p => lb.expandByObject(p)); lb.expandByScalar(.03);
    scene.traverse(o => { if (!o.isMesh || parts.includes(o)) return; bb.setFromObject(o); const z = bb.getSize(s); if (z.x > 1.6 || z.y > 2.8 || z.z > 1.6) return; if (lb.containsBox(bb)) parts.push(o); }); }
  // the door's glazing bars can be baked into the FRAME mesh (one merged mesh: jambs + head + bars). Split the horizontal
  // bar triangles (flat in y, between sill and head, across the leaf) into their own mesh so they swing with the leaf.
  if (parts.length) { const lb = new THREE.Box3(); parts.forEach(p => lb.expandByObject(p)); scene.updateMatrixWorld(true);
    scene.traverse(o => { if (!o.isMesh || parts.includes(o) || o.userData.barsSplit) return; bb.setFromObject(o); if (!bb.intersectsBox(lb)) return; const z = bb.getSize(s); if (z.x > 2.2 || z.z > 2.2 || z.y > 3.2) return;
      const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry, P = g.attributes.position, keep = [], bars = [], v = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
      for (let t = 0; t < P.count; t += 3) { for (let k = 0; k < 3; k++) v[k].fromBufferAttribute(P, t + k).applyMatrix4(o.matrixWorld);
        const ys = v.map(q => q.y), cy = (ys[0] + ys[1] + ys[2]) / 3, cx = (v[0].x + v[1].x + v[2].x) / 3, cz = (v[0].z + v[1].z + v[2].z) / 3;
        const inside = cy > lb.min.y + .12 && cy < lb.max.y - .05 && (along === 'x' ? cx > lb.min.x - .02 && cx < lb.max.x + .02 : cz > lb.min.z - .02 && cz < lb.max.z + .02);
        (inside && Math.max(...ys) - Math.min(...ys) < .12 ? bars : keep).push(t); }
      if (!bars.length) return;
      const pick = (list) => { const ng = new THREE.BufferGeometry(); for (const name of Object.keys(g.attributes)) { const A = g.attributes[name], arr = new A.array.constructor(list.length * 3 * A.itemSize); list.forEach((t, n) => { for (let k = 0; k < 3 * A.itemSize; k++) arr[n * 3 * A.itemSize + k] = A.array[t * A.itemSize + k]; }); ng.setAttribute(name, new THREE.BufferAttribute(arr, A.itemSize)); } ng.computeBoundingBox(); ng.computeBoundingSphere(); return ng; };
      const barMesh = new THREE.Mesh(pick(bars), o.material); barMesh.name = o.name + '_bars'; barMesh.castShadow = o.castShadow; barMesh.receiveShadow = o.receiveShadow; barMesh.userData.barsSplit = true;
      o.parent.add(barMesh); barMesh.position.copy(o.position); barMesh.quaternion.copy(o.quaternion); barMesh.scale.copy(o.scale); o.geometry = pick(keep); o.userData.barsSplit = true; parts.push(barMesh); }); }
  const w = 1.2, piv = new THREE.Group(); piv.position.set(leafC[0] + (along === 'x' ? hinge * w / 2 : 0), 0, leafC[2] + (along === 'z' ? hinge * w / 2 : 0)); scene.add(piv); scene.updateMatrixWorld(true);
  for (const p of parts) piv.attach(p);
  return { piv, parts, set(a) { piv.rotation.y = a; } };
}

// ---- dining chair (same family as the house's: walnut frame, olive velvet seat) built from furniture.js ----
export async function diningChairProp() { const F = await import('../designs/furniture.js'); const ch = F.diningChair({ wood: F.M.walnut(), seat: mat('velvet', { color: '#6f7b4f' }) }); ch.traverse(m => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } }); return ch; }

// ---- birthday cake with lit candles (flames = emissive cones + a small warm light) ----
export async function cakeWithCandles(n = 7) {
  const g = new THREE.Group(), cake = await loadRbx(5002633399, { scale: .42 }); g.add(cake); const b = new THREE.Box3().setFromObject(cake), top = b.max.y - .015, rr = Math.min(b.max.x - b.min.x, b.max.z - b.min.z) * .3;
  const wax = new THREE.MeshStandardMaterial({ color: '#f4d4e4', roughness: .5 }), fl = new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: '#ffb347', emissiveIntensity: 3, transparent: true });
  const flames = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, x = Math.cos(a) * rr, z = Math.sin(a) * rr; const cn = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .09, 8), wax); cn.position.set(x, top + .045, z); g.add(cn);
    const f = new THREE.Mesh(new THREE.ConeGeometry(.011, .035, 10), fl); f.position.set(x, top + .11, z); g.add(f); flames.push(f); }
  const L = new THREE.PointLight('#ffb35a', 1.2, 2.5, 1.8); L.position.set(0, top + .2, 0); g.add(L);
  const smoke = []; for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), new THREE.MeshStandardMaterial({ color: '#d9d9d9', transparent: true, opacity: 0, depthWrite: false })); s.position.copy(flames[i].position); g.add(s); smoke.push(s); }
  return { g, set(t, tOut) { const on = t < tOut; flames.forEach((f, i) => { f.visible = on; f.scale.y = 1 + Math.sin(t * 23 + i) * .12; }); L.intensity = on ? 1.2 : 0;
    smoke.forEach((s, i) => { const u = (t - tOut) / 1.2; s.visible = false; if (s.visible) { s.position.y = flames[i].position.y + u * .25; s.scale.setScalar(1 + u * 2); s.material.opacity = .45 * (1 - u); } }); } };
}

// ---- suitcase: pulled model, extended handle (two aluminium rods + grip) so a hand can hold it ----
export async function suitcase() {
  const g = new THREE.Group(), s = await loadRbx(9392387817, { scale: .78 }); const b = new THREE.Box3().setFromObject(s), sz = b.getSize(new THREE.Vector3()); s.position.y = -b.min.y; g.add(s);
  const al = new THREE.MeshStandardMaterial({ color: '#b9bcc2', metalness: .9, roughness: .3 }), h = sz.y;
  for (const x of [-.09, .09]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .42, 10), al); r.position.set(x, h + .21, -sz.z * .3); g.add(r); }
  const grip = new THREE.Mesh(new THREE.BoxGeometry(.24, .035, .04), new THREE.MeshStandardMaterial({ color: '#202124', roughness: .6 })); grip.position.set(0, h + .43, -sz.z * .3); g.add(grip);
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return { g, gripY: h + .43, gripZ: -sz.z * .3 };
}

// ---- the football field: a painted turf plane (stripes, yard lines, numbers, end zones) + bleachers + light towers ----
export async function footballField(scene, { cx, cz, ry = 0 } = {}) {
  const G = new THREE.Group(); G.position.set(cx, 0, cz); G.rotation.y = ry; scene.add(G);
  const Lf = 110, Wf = 49;   // 100 yd + end zones, 53 yd wide (metres)
  const tex = canvasTex(1024, 2304, (c, w, h) => { const ys = h / 120;
    for (let i = 0; i < 24; i++) { c.fillStyle = i % 2 ? '#3f7d33' : '#4a8a3b'; c.fillRect(0, i * h / 24, w, h / 24 + 1); }
    c.fillStyle = '#7a1f24'; c.fillRect(0, 0, w, 10 * ys); c.fillRect(0, h - 10 * ys, w, 10 * ys);
    c.fillStyle = '#f5f5f0'; for (let yd = 0; yd <= 100; yd += 5) { const y = (10 + yd) * ys; c.fillRect(0, y - 3, w, yd % 10 ? 4 : 6); }
    c.strokeStyle = '#f5f5f0'; c.lineWidth = 10; c.strokeRect(5, 5, w - 10, h - 10);
    c.font = '900 64px Poppins, Arial Black, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let yd = 10; yd <= 90; yd += 10) { const y = (10 + yd) * ys, n = String(yd <= 50 ? yd : 100 - yd); for (const x of [w * .15, w * .85]) { c.save(); c.translate(x, y); c.rotate(x < w / 2 ? Math.PI / 2 : -Math.PI / 2); c.fillText(n, 0, 0); c.restore(); } }
    c.font = '900 150px Poppins, Arial Black, sans-serif'; c.fillStyle = '#f5f5f0'; for (const [y, r] of [[5 * ys, Math.PI], [h - 5 * ys, 0]]) { c.save(); c.translate(w / 2, y); c.rotate(r); c.fillText('EAGLES', 0, 0); c.restore(); } });
  const turf = new THREE.Mesh(new THREE.PlaneGeometry(Wf, Lf), new THREE.MeshStandardMaterial({ map: tex, roughness: .95 })); turf.rotation.x = -Math.PI / 2; turf.position.y = .05; turf.receiveShadow = true; G.add(turf);
  // running track ring round it (rubber), so the edge of the field is a real thing, not grass ending
  const track = new THREE.Mesh(new THREE.RingGeometry(1, 1.25, 64), mat('jute', { color: '#a6473a' })); track.scale.set(Wf * .62, Lf * .5, 1); track.rotation.x = -Math.PI / 2; track.position.y = .04; G.add(track);
  // home bleachers on the west side, facing the field (+x)
  const bl = await loadRbx(3365565933); const bb = new THREE.Box3().setFromObject(bl), bs = bb.getSize(new THREE.Vector3());
  const blG = new THREE.Group(); blG.add(bl); blG.rotation.y = Math.PI / 2; blG.position.set(-Wf / 2 - 6 - bs.z / 2, 0, 0); G.add(blG);
  // light towers at the four corners (off in daylight)
  for (const [x, z] of [[-Wf / 2 - 5, -Lf / 2 + 8], [-Wf / 2 - 5, Lf / 2 - 8], [Wf / 2 + 5, -Lf / 2 + 8], [Wf / 2 + 5, Lf / 2 - 8]]) { const t = await loadRbx(2392872297); t.position.set(x, 0, z); t.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; G.add(t); }
  G.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  scene.updateMatrixWorld(true); return { G, bleachers: blG, Wf, Lf };
}
