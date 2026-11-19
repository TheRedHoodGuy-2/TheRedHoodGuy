// in-page clipping check (2026-11-19): sample points INSIDE every R6 body part (shrunk 1.5 cm) and test whether they are
// inside a furniture mesh by ray parity (+x and +z rays both odd = inside). Returns the worst offenders.
(() => { const { THREE } = window.__dbg; const { C, people } = globalThis.CLASS_DBG; const rc = new THREE.Raycaster(); const out = [];
 const meshes = o => { const L = []; o.traverse(m => { if (m.isMesh) { m.material.side = THREE.DoubleSide; L.push(m); } }); return L; };
 const inside = (pt, L) => [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0)].every(d => { rc.set(pt, d); rc.far = 50; const h = rc.intersectObjects(L, false);
   const uniq = h.filter((x, i) => i === 0 || x.distance - h[i - 1].distance > 1e-4); return uniq.length % 2 === 1; });
 for (const p of people) { const s = C.seats[p.seat], F = { desk: meshes(s.desk), chair: meshes(s.chair) };
   for (const [k, part] of Object.entries(p.a.parts)) { if (k === 'root') continue; part.updateMatrixWorld(true);
     const g = part.geometry || part.children.find(c => c.geometry)?.geometry; if (!g) continue; g.computeBoundingBox(); const bb = g.boundingBox.clone().expandByScalar(-.015 / 0.34);
     let hits = {}; const N = 5;
     for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let l = 0; l < N; l++) { const v = new THREE.Vector3(bb.min.x + (bb.max.x - bb.min.x) * i / (N - 1), bb.min.y + (bb.max.y - bb.min.y) * j / (N - 1), bb.min.z + (bb.max.z - bb.min.z) * l / (N - 1)).applyMatrix4((part.geometry ? part : part.children.find(c => c.geometry)).matrixWorld);
       for (const [n, L] of Object.entries(F)) if (inside(v, L)) hits[n] = (hits[n] || 0) + 1; }
     for (const [n, c] of Object.entries(hits)) out.push([p.seat, k, n, c]); } }
 return { n: people.length, clipped: out }; })()
