// node tools/qa.mjs <topic> [fps=12] [t0] [t1]
// FRAME-BY-FRAME motion check (SPIN is reliable; limb-through-geometry is experimental, QA_LIMBS=1) (Xavier 2026-11-13: "did you go through the video frame by frame?"). Steps the
// whole film and prints every problem with its time, so nothing hides BETWEEN the stills I picked:
//   SPIN   an actor's body turns faster than 300 deg/s, or more than 200 deg inside one second (the "360s")
//   HAND / FOOT / HEAD THROUGH   the line from the torso centre to a hand / foot / head tip hits scene geometry first
//          (= the limb is inside or behind a wall, shelf, shutter, counter, floor...)
//   SINK   a foot tip is below the surface right under it (shoes in the grass / floor)
// Cast-to-cast contact is ignored (hands on shoulders etc.); transparent / sprite / line objects are ignored.
import { openPage, load } from './lib/browser.mjs';
const [topic, fpsA = '12', t0A, t1A] = process.argv.slice(2), fps = +fpsA;
const { browser, page } = await openPage({ width: 180, height: 320, dsf: 1 }); page.on('pageerror', e => console.log('ERR', e.message));
await load(page, `film.html?render=1&lq=1&topic=${topic}${process.env.QS || ''}`); if (process.env.QA_V) await page.evaluate(() => { window.QA_V = 1; }); if (process.env.QA_LIMBS) await page.evaluate(() => { window.QA_LIMBS = 1; });
const DUR = await page.evaluate(() => window.__dbg.T.DUR || window.__dbg.DUR || 0);
const t0 = t0A ? +t0A : 0, t1 = t1A ? +t1A : (DUR || 40);
const issues = [];
// limb end points measured from the REAL mesh (rest pose boxes -> each bone's local frame), not bone tips
await page.evaluate(async () => {
  const { THREE, T } = window.__dbg, RB = await import(new URL('kit/roblox.js', document.baseURI).href);
  window.__qa = { last: {}, ends: {} };
  for (const [name, a] of Object.entries(T.cast)) {
    if (!window.QA_LIMBS) continue; const A = a.A; A.reset(); A.root.updateMatrixWorld(true); const B = RB.partBoxes(A), E = {};
    for (const part of ['armL', 'armR', 'legL', 'legR', 'head']) { const b = B[part], bone = A.bones[part]; if (!b || !bone) continue;
      const c = b.getCenter(new THREE.Vector3()), end = part === 'head' ? new THREE.Vector3(c.x, b.max.y - .02, c.z) : new THREE.Vector3(c.x, b.min.y + .02, c.z);
      const jt = part === 'head' ? new THREE.Vector3(c.x, b.min.y + .05, c.z) : new THREE.Vector3(c.x, b.max.y - .06, c.z);   // shoulder / hip / neck (bones sit at the origin; the mesh is what moves)
      let under = false; for (let q = bone; q; q = q.parent) if (q === A.root) under = true;
      const M = under ? bone.matrixWorld.clone() : A.root.matrixWorld.clone().multiply(bone.matrixWorld);   // bones may live outside the root
      const inv = M.invert(); E[part] = { end: end.applyMatrix4(inv), joint: jt.applyMatrix4(inv), under }; }
    window.__qa.ends[name] = E; }
});
for (let f = Math.round(t0 * fps); f <= Math.round(t1 * fps); f++) {
  const t = f / fps;
  const out = await page.evaluate(t => {
    window.renderAt(t);
    const { scene, THREE, T, camera } = window.__dbg, Q = window.__qa, res = [], ray = new THREE.Raycaster(); ray.camera = camera;
    const cams = Object.entries(T.cast), roots = new Set(cams.flatMap(([, a]) => [a.A.root, a.A.model, ...Object.values(a.A.bones || {})].filter(Boolean)));
    const isCast = o => { for (let q = o; q; q = q.parent) if (roots.has(q)) return true; return false; };
    const solid = x => x.object.visible && !x.object.isSprite && !x.object.isLine && !x.object.isPoints && x.object.material && !(Array.isArray(x.object.material) ? x.object.material[0].transparent : x.object.material.transparent) && !isCast(x.object) && (() => { for (let q = x.object; q; q = q.parent) if (!q.visible) return false; return true; })();
    const tip = (A, part) => { const b = A.bones[part]; if (!b) return null; const c = b.children.find(k => k.isBone); return (c || b).getWorldPosition(new THREE.Vector3()); };
    for (const [name, a] of cams) {
      const A = a.A; if (!A.root.visible) { delete Q.last[name]; continue; }
      // spin
      const e = new THREE.Euler().setFromQuaternion(A.root.getWorldQuaternion(new THREE.Quaternion()), 'YXZ'), y = e.y, L = Q.last[name];
      if (L) { let d = y - L.y; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; const acc = (L.acc || []).concat([[t, d]]).filter(([tt]) => t - tt < 1);
        const sum = acc.reduce((s, [, dd]) => s + dd, 0), rate = Math.abs(d) / Math.max(1e-3, t - L.t);
        if (rate > 300 * Math.PI / 180 && Math.abs(d) > .2) res.push(`SPIN ${name} ${Math.round(Math.abs(d) * 57)}deg in one frame`);
        else if (Math.abs(sum) > 200 * Math.PI / 180) res.push(`SPIN ${name} ${Math.round(Math.abs(sum) * 57)}deg within 1s`);
        Q.last[name] = { y, t, acc: Math.abs(sum) > 200 * Math.PI / 180 ? [] : acc };
      } else Q.last[name] = { y, t, acc: [] };
      // limbs through geometry: joint -> real limb end (mesh-measured), then feet: the sole vs the surface under it
      const E = window.QA_LIMBS ? (Q.ends[name] || {}) : {};   // limb checks: experimental (bone frames not resolved yet), QA_LIMBS=1 to try
      for (const part of ['armL', 'armR', 'legL', 'legR', 'head']) {
        const bone = A.bones[part]; if (!bone || !E[part]) continue; bone.updateWorldMatrix(true, false); A.root.updateWorldMatrix(true, false); const M = E[part].under ? bone.matrixWorld : A.root.matrixWorld.clone().multiply(bone.matrixWorld); const j = E[part].joint.clone().applyMatrix4(M), p = E[part].end.clone().applyMatrix4(M);
        const dir = p.clone().sub(j), d = dir.length(); if (d < .05) continue;
        ray.set(j, dir.normalize()); ray.far = d; const hit = ray.intersectObjects(scene.children, true).find(solid);
        if (hit) res.push(`${part === "head" ? "HEAD" : part.startsWith("arm") ? "HAND" : "FOOT"} THROUGH ${name}.${part} -> ${hit.object.name || hit.object.parent?.name || hit.object.geometry?.type}` + (window.QA_V ? ` @${hit.distance.toFixed(2)}/${d.toFixed(2)} p=${hit.point.toArray().map(v=>v.toFixed(2))} sz=${hit.object.geometry?.parameters ? JSON.stringify(hit.object.geometry.parameters).slice(0,60) : ""}` : ""));
        if (part.startsWith('leg')) { ray.set(p.clone().add(new THREE.Vector3(0, .5, 0)), new THREE.Vector3(0, -1, 0)); ray.far = 1.0; const g = ray.intersectObjects(scene.children, true).find(solid);
          if (g && g.point.y - (p.y - .02) > .025) res.push(`SINK ${name}.${part} into ${g.object.name || g.object.parent?.name || g.object.geometry?.type}`); }
      }
    }
    return res;
  }, t);
  for (const r of out) issues.push([t, r]);
}
await browser.close();
// collapse runs of the same issue into time ranges
const runs = new Map();
for (const [t, r] of issues) { const k = r.replace(/\(.*\)/, '').replace(/\d+deg/, 'Ndeg').replace(/[\d.]+m into/, 'm into'); const v = runs.get(k) || []; v.push(t); runs.set(k, v); }
const fmt = ts => { const out = []; let s = ts[0], p = ts[0]; for (const t of ts.slice(1)) { if (t - p > 1.5 / fps) { out.push(s === p ? `${s.toFixed(2)}` : `${s.toFixed(2)}-${p.toFixed(2)}`); s = t; } p = t; } out.push(s === p ? `${s.toFixed(2)}` : `${s.toFixed(2)}-${p.toFixed(2)}`); return out.join(', '); };
const rows = [...runs.entries()].sort((a, b) => a[1][0] - b[1][0]);
console.log(rows.length ? rows.map(([k, ts]) => `${fmt(ts)}  ${k}`).join('\n') : (globalThis.process && process.env.QA_LIMBS ? 'QA: clean' : 'QA: no spins (limb checks off: QA_LIMBS=1)'));
