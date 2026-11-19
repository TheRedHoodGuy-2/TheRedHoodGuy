// BREAKFAST props (growl video, 2026-10-26): the breakfast he skipped. Plain bright colours, real shapes (no textures).
//   plate(), omelette(), bacon({ seed }), juice(), fork(), toast(), steam(n) -> { group, update(t) }
//   breakfastPlate() = plate + folded omelette + 3 bacon strips + toast, ready to drop on a table (origin = plate bottom)
import * as THREE from 'three';
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .55, ...o });
const mesh = (geo, mat, x = 0, y = 0, z = 0, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (p) p.add(m); return m; };

export function plate({ r = .15 } = {}) {   // white plate: flat base, raised rim (lathe), a thin blue line round the rim
  const g = new THREE.Group(), pts = [[0, 0], [r * .62, 0], [r * .7, .006], [r * .78, .012], [r * .97, .024], [r, .028], [r * .985, .031], [r * .78, .017], [r * .62, .009], [0, .009]].map(([x, y]) => new THREE.Vector2(x, y));
  mesh(new THREE.LatheGeometry(pts, 48), M(0xfbfbf7, { roughness: .25 }), 0, 0, 0, g);
  const ring = mesh(new THREE.TorusGeometry(r * .9, .0022, 6, 64), M(0x4f86d9), 0, .022, 0, g); ring.rotation.x = Math.PI / 2; ring.scale.z = .3;
  return g;
}
export function omelette() {   // half-moon folded omelette: a squashed half cylinder, golden, browned top, chive flecks
  const g = new THREE.Group(), egg = M(0xffd34a, { roughness: .6 }), brown = M(0xf2b233, { roughness: .6 });
  const half = mesh(new THREE.CylinderGeometry(.085, .085, .13, 32, 1, false, 0, Math.PI), egg, 0, .02, 0, g); half.rotation.z = Math.PI / 2; half.scale.set(.42, 1, 1);
  const top = mesh(new THREE.SphereGeometry(.084, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), brown, 0, .021, 0, g); top.scale.set(.75, .3, 1); top.rotation.y = Math.PI / 2;
  const chive = M(0x3f9b3f); for (let i = 0; i < 9; i++) { const a = i * 2.4, r = .02 + (i % 4) * .012; const c = mesh(new THREE.BoxGeometry(.012, .004, .004), chive, Math.cos(a) * r * .6, .046, Math.sin(a) * r, g); c.rotation.y = a; }
  return g;
}
export function bacon({ seed = 1 } = {}) {   // one wavy strip: red meat with two pale fat stripes, built from segments
  const g = new THREE.Group(), meat = M(0xb8432c, { roughness: .45 }), fat = M(0xf4cfa6, { roughness: .45 }), L = .15, n = 10;
  for (let i = 0; i < n; i++) { const x = -L / 2 + (i + .5) * L / n, y = .006 + Math.sin(i * 1.3 + seed) * .006, a = Math.cos(i * 1.3 + seed) * .5;
    const s = mesh(new THREE.BoxGeometry(L / n * 1.08, .005, .032), meat, x, y, 0, g); s.rotation.z = a * .35;
    for (const z of [-.009, .008]) { const f = mesh(new THREE.BoxGeometry(L / n * 1.08, .0055, .006), fat, x, y + .0004, z, g); f.rotation.z = a * .35; } }
  return g;
}
export function toast() {
  const g = new THREE.Group(); mesh(new THREE.BoxGeometry(.1, .014, .1), M(0xe6a95c), 0, .007, 0, g); mesh(new THREE.BoxGeometry(.084, .015, .084), M(0xf6d7a0), 0, .0075, 0, g);
  const butter = mesh(new THREE.BoxGeometry(.03, .008, .022), M(0xfff1a0, { roughness: .3 }), .01, .018, -.01, g); butter.rotation.y = .4; return g;
}
export function juice() {   // tall glass of orange juice: clear glass shell, juice body, a meniscus
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(.036, .031, .14, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, transparent: true, opacity: .12, side: THREE.DoubleSide, clearcoat: 1 }), 0, .07, 0, g).castShadow = false;
  mesh(new THREE.CylinderGeometry(.031, .031, .008, 32), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, transparent: true, opacity: .4 }), 0, .004, 0, g);
  mesh(new THREE.CylinderGeometry(.033, .029, .1, 32), M(0xff7a00, { roughness: .25, emissive: 0x552200 }), 0, .058, 0, g);
  return g;
}
export function fork() {
  const g = new THREE.Group(), s = M(0xd9dde3, { roughness: .2, metalness: .9 });
  mesh(new THREE.BoxGeometry(.012, .003, .12), s, 0, .002, .03, g); mesh(new THREE.BoxGeometry(.026, .003, .02), s, 0, .002, -.035, g);
  for (const x of [-.009, -.003, .003, .009]) mesh(new THREE.BoxGeometry(.003, .003, .035), s, x, .002, -.062, g);
  return g;
}
// steam wisps: soft white sprites drifting up and fading on a loop (pure function of t)
export function steam(n = 4, { h = .22, spread = .05 } = {}) {
  const g = new THREE.Group(), c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c), sp = [];
  for (let i = 0; i < n * 3; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 })); g.add(s); sp.push(s); }
  return { group: g, update(t) { sp.forEach((s, i) => { const u = ((t * .55 + i / sp.length) % 1), k = i % n; s.position.set(Math.sin(u * 5 + k * 2) * spread * (.4 + u), u * h, Math.cos(u * 4 + k) * spread * .5); s.scale.setScalar(.03 + u * .07); s.material.opacity = .32 * Math.sin(Math.PI * u); }); } };
}
export function breakfastPlate() {
  const g = new THREE.Group(); g.add(plate());
  const o = omelette(); o.position.set(-.025, .01, .015); o.rotation.y = .3; g.add(o);
  [0, 1, 2].forEach(i => { const b = bacon({ seed: i * 2 + 1 }); b.position.set(.055 + i * .004, .012 + i * .006, -.03 + i * .028); b.rotation.y = 1.25 + i * .12; g.add(b); });
  const t = toast(); t.position.set(-.02, .012, -.075); t.rotation.set(.12, .5, 0); g.add(t);
  return g;
}
