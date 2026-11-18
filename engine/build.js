// BUILD: properly modelled pieces for sets (2026-11-18). Each one is shaped like the real thing (bevels, soft fills,
// pleats, curved pages), takes a library material, and has world-scale UVs so textures keep their real size.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { worldUV } from './materials.js';

export const shade = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
// a bevelled box (real furniture edges are rounded, never knife sharp)
export function bbox(w, h, d, mat, r = .012, seg = 3) { const m = new THREE.Mesh(worldUV(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4))), mat); m.castShadow = m.receiveShadow = true; return m; }
export const at = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return o; };

// a Poly Haven model, scaled; materials keep their scanned maps
const gl = new GLTFLoader();
// swap: { '<gltf material name>': THREE.Material } replaces a scanned material with one of ours (e.g. cushions -> olive velvet)
export async function ph(id, { scale = 1, tint = null, rough = null, swap = null } = {}) {
  const g = await gl.loadAsync(`assets/ph/${id}/${id}.gltf`); const o = g.scene; o.scale.setScalar(scale);
  o.traverse(m => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; if (swap && swap[m.material.name]) { m.geometry = worldUV(m.geometry.clone()); m.material = swap[m.material.name]; return; } if (tint) m.material.color.multiply(new THREE.Color(tint)); if (rough != null) m.material.roughness = rough; } });
  return o;
}

// a soft cushion / pillow / mattress: a subdivided box whose faces bulge out and whose edges pinch to a seam
export function cushion(w, h, d, mat, { puff = 1, seam = .5, seg = 24 } = {}) {
  const g = new THREE.BoxGeometry(w, h, d, seg, Math.max(4, seg / 3 | 0), seg), P = g.attributes.position;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i) / (w / 2), y = P.getY(i) / (h / 2), z = P.getZ(i) / (d / 2);
    const fx = Math.max(0, 1 - Math.pow(Math.abs(x), 4)), fz = Math.max(0, 1 - Math.pow(Math.abs(z), 4));
    P.setY(i, P.getY(i) * (seam + (1 - seam) * Math.pow(fx * fz, .5)) * (1 + .12 * puff * fx * fz));     // thick middle, thin seamed edge
    P.setX(i, P.getX(i) * (1 - .04 * puff * (1 - Math.abs(y)) * fz)); P.setZ(i, P.getZ(i) * (1 - .04 * puff * (1 - Math.abs(y)) * fx));
  }
  g.computeVertexNormals(); const m = new THREE.Mesh(worldUV(g), mat); m.castShadow = m.receiveShadow = true; return m;
}

// a blanket / duvet laid over a bed: a cloth sheet over a heightfield. `under(x, z)` returns the height of whatever is
// under the cloth (mattress top, legs...), the cloth hangs over the sides by `hang` and droops in a soft curve.
export function drape({ w, d, top, hang = .3, mat, under = () => top, seg = 90, thick = .05, waves = .012, hem = null }) {
  const W = w + hang * 2, D = d + hang, g = new THREE.PlaneGeometry(W, D, seg, seg); g.rotateX(-Math.PI / 2); const P = g.attributes.position;
  for (let i = 0; i < P.count; i++) {
    let x = P.getX(i), z = P.getZ(i) + hang / 2;            // z: -d/2 = the turned-down edge, +d/2 = the foot of the bed, past it the cloth hangs down
    const ox = Math.max(0, Math.abs(x) - w / 2), oz = Math.max(0, z - d / 2), out = Math.hypot(ox, oz);
    let y;
    if (out <= 0) y = Math.max(top, under(x, z)) + thick;
    else {   // past the mattress edge the cloth rolls over the edge (radius .06) and falls
      const r = .06, a = Math.min(out / r, Math.PI / 2); const fall = out < r * Math.PI / 2 ? r - r * Math.cos(a) : r + (out - r * Math.PI / 2);
      y = top + thick - fall * 1.0; const k = out < r * Math.PI / 2 ? Math.sin(a) * r : r;
      if (ox > 0) x = Math.sign(x) * (w / 2 + Math.min(k, ox) + .004 * (out)); if (oz > 0) z = d / 2 + Math.min(k, oz);
      y += Math.sin(P.getZ(i) * 9 + x * 3) * waves * Math.min(1, out * 4);          // soft hanging ripples
    }
    y += Math.sin(x * 7.3 + z * 4.1) * waves * .4 + Math.sin(x * 2.1 - z * 6.7) * waves * .3;
    P.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals(); const m = new THREE.Mesh(worldUV(g), mat); m.material.side = THREE.DoubleSide; m.castShadow = m.receiveShadow = true; return m;
}

// a curtain panel: a hanging cloth with real pleats (deep at the top where it is gathered, softer at the floor)
export function curtain(w, h, mat, { pleats = 7, depth = .07, seg = 80, flare = 1.15 } = {}) {
  const g = new THREE.PlaneGeometry(w, h, seg, 24), P = g.attributes.position;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), t = (h / 2 - y) / h;   // t: 0 at the rod, 1 at the hem
    const ph = x / w * pleats * Math.PI * 2;
    P.setX(i, x * (1 + (flare - 1) * t)); P.setZ(i, Math.sin(ph) * depth * (1 - .35 * t) + Math.sin(ph * .5 + 1.3) * .015 * t);
  }
  g.computeVertexNormals(); const m = new THREE.Mesh(worldUV(g), mat); m.material.side = THREE.DoubleSide; m.castShadow = m.receiveShadow = true; return m;
}

// an open book: two page blocks that curve up from the gutter, inside a hard cover
export function openBook(w, h, { cover, pages, thick = .025 } = {}) {
  const grp = new THREE.Group(), half = w / 2;
  for (const s of [-1, 1]) {
    const g = new THREE.BoxGeometry(half - .006, thick, h - .012, 16, 1, 1), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { const x = P.getX(i) + (half - .006) / 2, u = x / (half - .006);
      const lift = Math.sin(Math.min(1, u * 1.6) * Math.PI / 2) * .028 - u * .01;             // pages rise out of the gutter, then flatten
      P.setX(i, s * x); P.setY(i, P.getY(i) * (1 - .55 * u) + lift + thick / 2); }
    g.computeVertexNormals(); const m = new THREE.Mesh(g, pages); m.castShadow = m.receiveShadow = true; grp.add(m);
    const c = new THREE.Mesh(new RoundedBoxGeometry(half, .006, h, 2, .002), cover); c.position.set(s * half / 2, -.002, 0); c.rotation.z = s * .05; c.castShadow = true; grp.add(c);
  }
  return grp;
}

// a table lamp: turned ceramic base (lathe) + linen drum shade, a real bulb light inside
export function tableLamp({ baseMat, shadeMat, height = .55, light = null }) {
  const grp = new THREE.Group(), pts = [];
  const prof = [[.0001, 0], [.07, 0], [.075, .012], [.06, .02], [.075, .06], [.095, .13], [.09, .2], [.06, .26], [.025, .3], [.02, .34], [.012, .345], [.0001, .345]];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r * height / .55, y * height / .55));
  const base = new THREE.Mesh(new THREE.LatheGeometry(pts, 40), baseMat); base.castShadow = base.receiveShadow = true; grp.add(base);
  const sh = height * .5, rTop = .12 * height / .55, rBot = .17 * height / .55, sg = new THREE.CylinderGeometry(rTop, rBot, sh * .62, 48, 1, true);
  const shadeM = new THREE.Mesh(sg, shadeMat); shadeM.position.y = height * .84; shadeM.castShadow = false; shadeM.receiveShadow = true; grp.add(shadeM);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.03, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd9a3').multiplyScalar(6), toneMapped: false })); bulb.position.y = height * .78; grp.add(bulb);
  if (light) { light.position.y = height * .8; grp.add(light); }
  return grp;
}
