// node tools/clipscan.mjs <scene> [fps=12] [t0] [t1]     (Xavier 2026-11-25: "never let anything clip")
// Steps EVERY frame of the film (no screenshots) and reports every body part that goes INSIDE something:
//   WORLD  sample points inside an R6 part (shrunk 1.5 cm) lie inside a visible scene mesh (3-ray parity test)
//   CAST   ... inside another visible actor's body part (people walking through each other)
//   GRIP   a held prop (scene dbg.holds: { t0, t1, who, side, obj }) is more than 7 cm from the hand that holds it
// Old repo lessons built in (explainer-kit REVIEW_NOTES PROPS + CONTACT, qa.mjs): check every frame, not hand-picked stills;
// a little sink at a contact is fine (the 1.5 cm shrink + 3-point threshold), anything deeper is a defect to FIX by
// staging (move the chair back, give clearance, re-angle, resize the prop), never ignore.
import { openPage, load } from './lib/browser.mjs';
const [scene, fps = 12, a0 = 0, a1 = 999] = process.argv.slice(2);
const { browser, page } = await openPage({ width: 90, height: 160 });
await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify({ scene, w: 90, h: 160, lq: 1, probe: false }))}`);
const res = await page.evaluate(async ([fps, a0, a1]) => {
  const THREE = window.__THREE, S = window.__S, out = [], rc = new THREE.Raycaster();
  const BV = await import('http://local/node_modules/three-mesh-bvh/build/index.module.js'); THREE.Mesh.prototype.raycast = BV.acceleratedRaycast; rc.firstHitOnly = false;
  const seen = new Set(), A = {}; for (const [n, a] of Object.entries(S.dbg.A)) if (!seen.has(a)) { seen.add(a); A[n] = a; }
  const vis = o => { for (let x = o; x; x = x.parent) if (!x.visible) return false; return true; };
  const actorMeshes = new Set(); Object.values(A).forEach(a => a.a.root.traverse(m => m.isMesh && actorMeshes.add(m)));
  const world = []; window.__scene ??= null; let root = S.dbg.town; while (root.parent) root = root.parent;
  root.traverse(m => { if (!m.isMesh || actorMeshes.has(m) || m.isSprite) return; const mt = m.material; if (!mt || mt.transparent && mt.opacity < .9) return;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); mt.side = THREE.DoubleSide; world.push({ m, b: new THREE.Box3() }); });
  const PARTS = ['torso', 'head', 'armL', 'armR', 'legL', 'legR'];
  const boxOf = part => { const g = part.geometry ? part : part.children.find(c => c.geometry); if (!g) return null; if (!g.geometry.boundingBox) g.geometry.computeBoundingBox(); return { g, bb: g.geometry.boundingBox }; };
  const D = [new THREE.Vector3(1, .013, .007).normalize(), new THREE.Vector3(.011, .009, 1).normalize(), new THREE.Vector3(.006, 1, .012).normalize()];
  const inside = (pt, L) => D.every(d => { rc.set(pt, d); rc.far = 60; nr++; const h = rc.intersectObjects(L, false); const u = h.filter((x, i) => i === 0 || x.distance - h[i - 1].distance > 1e-4); return u.length % 2 === 1; });
  const dur = S.dur || 47, N = 3; let nr = 0, T0 = performance.now(); console.error('WORLD', world.length); 
  for (let t = +a0; t <= Math.min(+a1, dur); t += 1 / fps) {
    S.update(t); root.updateMatrixWorld(true); const cam = S.camera; cam.updateMatrixWorld(true); const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const live = Object.entries(A).filter(([n, a]) => vis(a.a.root));
    for (const w of world) { if (!w.m.geometry.boundingBox) w.m.geometry.computeBoundingBox(); w.b.copy(w.m.geometry.boundingBox).applyMatrix4(w.m.matrixWorld); w.m.__wb = w.b; }
    const partBoxes = [];
    for (const [n, a] of live) for (const k of PARTS) { const p = a.a.rig.parts[k]; if (!p || !vis(p)) continue; const B = boxOf(p); if (!B) continue;
      const wb = B.bb.clone().applyMatrix4(B.g.matrixWorld); if (!fr.intersectsBox(wb)) continue; partBoxes.push({ n, k, B, wb, inv: B.g.matrixWorld.clone().invert() }); }
    for (const P of partBoxes) {
      const held = new Set(); for (const h of (S.dbg.holds || [])) if (t >= h.t0 - .15 && t <= h.t1 + .15 && h.who === P.n) h.obj.traverse(m => m.isMesh && held.add(m));   // the hand closes on what it holds
      const cand = world.filter(w => vis(w.m) && !held.has(w.m) && w.b.intersectsBox(P.wb) && w.b.max.x - w.b.min.x < 300).map(w => w.m);   // skip the sky dome (a closed sphere around everything)
      const others = partBoxes.filter(Q => Q.n !== P.n && Q.wb.intersectsBox(P.wb));
      if (!cand.length && !others.length) continue;
      const s = P.B.g.matrixWorld.getMaxScaleOnAxis() || 1, bb = P.B.bb.clone().expandByScalar(-.015 / s); let hw = {}, hc = {};
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let l = 0; l < N; l++) {
        const v = new THREE.Vector3(bb.min.x + (bb.max.x - bb.min.x) * i / (N - 1), bb.min.y + (bb.max.y - bb.min.y) * j / (N - 1), bb.min.z + (bb.max.z - bb.min.z) * l / (N - 1)).applyMatrix4(P.B.g.matrixWorld);
        if (cand.length) { const near = cand.filter(m => m.__wb.containsPoint(v)); near.forEach(m => { if (!m.geometry.boundsTree) m.geometry.boundsTree = new BV.MeshBVH(m.geometry); }); if (near.length && inside(v, near)) { const m0 = near[0]; let nm = ''; for (let x = m0; x && !nm; x = x.parent) nm = x.name || x.userData?.id || ''; const c = m0.__wb.getCenter(new THREE.Vector3()); nm = (nm || (Array.isArray(m0.material) ? m0.material[0].name : m0.material.name) || 'mesh').slice(0, 28) + '@' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ',' + c.z.toFixed(1) + '[' + m0.__wb.min.toArray().map(v => v.toFixed(2)).join(',') + '..' + m0.__wb.max.toArray().map(v => v.toFixed(2)).join(',') + ']'; hw[nm] = (hw[nm] || 0) + 1; } }
        for (const Q of others) { const lv = v.clone().applyMatrix4(Q.inv); if (Q.B.bb.containsPoint(lv)) hc[Q.n + '.' + Q.k] = (hc[Q.n + '.' + Q.k] || 0) + 1; } }
      for (const [nm, c] of Object.entries(hw)) if (c >= 3) out.push([+t.toFixed(2), 'WORLD', P.n + '.' + P.k, nm, c]);
      for (const [nm, c] of Object.entries(hc)) if (c >= 3) out.push([+t.toFixed(2), 'CAST', P.n + '.' + P.k, nm, c]);
    }
    // PROP: a prop (chair, purse, suitcase, phone...) inside the set or a wall
    for (const [pn, obj] of Object.entries(S.dbg.props || {})) { if (!vis(obj)) continue; const own = new Set(); obj.traverse(m => m.isMesh && own.add(m));
      obj.traverse(pm => { if (!pm.isMesh || !vis(pm)) return; if (!pm.geometry.boundingBox) pm.geometry.computeBoundingBox(); const wb = pm.geometry.boundingBox.clone().applyMatrix4(pm.matrixWorld); if (!fr.intersectsBox(wb)) return;
        const cand = world.filter(w => !own.has(w.m) && vis(w.m) && w.b.intersectsBox(wb) && w.b.max.x - w.b.min.x < 300).map(w => w.m); if (!cand.length) return;
        const s2 = pm.matrixWorld.getMaxScaleOnAxis() || 1, bb = pm.geometry.boundingBox.clone().expandByScalar(-.015 / s2); let hw = {};
        for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let l = 0; l < N; l++) { const v = new THREE.Vector3(bb.min.x + (bb.max.x - bb.min.x) * i / (N - 1), bb.min.y + (bb.max.y - bb.min.y) * j / (N - 1), bb.min.z + (bb.max.z - bb.min.z) * l / (N - 1)).applyMatrix4(pm.matrixWorld);
          const near = cand.filter(m => m.__wb.containsPoint(v)); near.forEach(m => { if (!m.geometry.boundsTree) m.geometry.boundsTree = new BV.MeshBVH(m.geometry); }); if (near.length && inside(v, near)) { const c = near[0].__wb.getCenter(new THREE.Vector3()); const k = (near[0].name || 'mesh') + '@' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ',' + c.z.toFixed(1) + '[' + near[0].__wb.min.toArray().map(v => v.toFixed(2)).join(',') + '..' + near[0].__wb.max.toArray().map(v => v.toFixed(2)).join(',') + ']'; hw[k] = (hw[k] || 0) + 1; } }
        for (const [nm, c] of Object.entries(hw)) if (c >= 3) out.push([+t.toFixed(2), 'PROP', pn, nm, c]); }); }
    for (const h of (S.dbg.holds || [])) { if (t < h.t0 || t > h.t1 || !vis(h.obj)) continue; const part = A[h.who].a.rig.parts['arm' + h.side], G = boxOf(part); G.g.updateWorldMatrix(true, false); const hb = G.bb;
      const hand = new THREE.Vector3((hb.min.x + hb.max.x) / 2, hb.min.y + (hb.max.y - hb.min.y) * .06, (hb.min.z + hb.max.z) / 2).applyMatrix4(G.g.matrixWorld), b = new THREE.Box3().setFromObject(h.obj), d = b.distanceToPoint(hand);
      if (d > .07) out.push([+t.toFixed(2), 'GRIP', h.who + '.arm' + h.side, h.name, +(d * 100).toFixed(0) + 'cm']); }
  }
  console.error('RAYS', nr, 'ms', (performance.now() - T0).toFixed(0)); return out; }, [fps, a0, a1]);
await browser.close();
// group consecutive frames of the same problem into spans
const key = r => r.slice(1, 4).join(' '), spans = {};
for (const r of res) { const k = key(r); (spans[k] ||= []).push(r); }
const lines = [];
for (const [k, rs] of Object.entries(spans)) { let s = rs[0], prev = rs[0], worst = rs[0][4];
  const flush = () => lines.push([s[0], `${s[0].toFixed(2)}-${prev[0].toFixed(2)}s  ${k}  worst ${worst}`]);
  for (const r of rs.slice(1)) { if (r[0] - prev[0] > 1.5 / fps) { flush(); s = r; worst = r[4]; } else if (typeof r[4] === 'number' ? r[4] > worst : parseFloat(r[4]) > parseFloat(worst)) worst = r[4]; prev = r; }
  flush(); }
lines.sort((a, b) => a[0] - b[0]).forEach(l => console.log(l[1]));
console.log(lines.length ? `CLIPSCAN FAIL: ${lines.length} problem spans` : 'CLIPSCAN PASS');
