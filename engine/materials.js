// MATERIAL LIBRARY (draft 2026-11-18). One function for every surface in every set:
//   mat('plaster', { color: '#e9dcc8', size: 1.2 })  -> MeshStandardMaterial with real colour detail, roughness and normal maps.
// Every texture is a real scanned surface (Poly Haven, CC0) or a generated one (knit, wallpaper). Two kinds:
//   tint     : the texture is used as grey DETAIL x our chosen colour (walls, paint, fabric, tiles): colour is ours, texture is real
//   natural  : the texture keeps its own colour (wood, brick, leather, carpet), optionally nudged with `color`
// size = metres one texture tile covers (so a floor board or a brick is always its real size, whatever the mesh size).
// Meshes need world-scale UVs: use worldUV(geometry) on boxes / planes (one UV unit = one metre).
import * as THREE from 'three';
const url = p => new URL(p, document.baseURI).href;
const TL = new THREE.TextureLoader(), cache = new Map();
function tex(path, srgb, repeat) {
  const k = path + repeat;
  if (!cache.has(k)) { const t = TL.load(url(path)); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(repeat, repeat); cache.set(k, t); }
  return cache.get(k);
}
export const LIB = {
  // walls
  plaster:        { dir: 'ph/painted_plaster_wall', kind: 'tint', size: 1.2, color: '#ece4d6', rough: 1, normal: 3, note: 'rough painted wall (the bumpy wall in a real room)' },
  plaster_fine:   { dir: 'ph/beige_wall_001', kind: 'tint', size: 1.2, color: '#efe6d8', rough: 1, normal: 2, note: 'smoother painted wall' },
  plaster_brick:  { dir: 'ph/patterned_plaster_wall', kind: 'tint', size: 1.4, color: '#e6d6c0', rough: 1, normal: 1.2, note: 'plastered brick (old houses, basements)' },
  wallpaper:      { dir: 'gen/wallpaper_stripe', kind: 'tint', size: .9, color: '#b9cfe6', rough: 1, normal: 1, note: 'striped wallpaper (Gneef bedrooms)' },
  brick:          { dir: 'ph/brick_wall_001', kind: 'natural', size: 2.2, rough: 1, normal: 1.2, note: 'red brick (houses, school)' },
  brick_painted:  { dir: 'ph/painted_brick', kind: 'tint', size: 2.2, color: '#f1ede4', rough: 1, normal: 1.2, note: 'painted brick' },
  // floors
  wood_floor:     { dir: 'ph/wood_floor', kind: 'natural', size: 2.4, rough: .9, normal: 1, note: 'wood boards' },
  laminate:       { dir: 'ph/laminate_floor_02', kind: 'natural', size: 2.4, rough: .8, normal: .8, note: 'laminate / light oak' },
  parquet:        { dir: 'ph/herringbone_parquet', kind: 'natural', size: 1.6, rough: .8, normal: 1, note: 'herringbone parquet (living rooms)' },
  tiles:          { dir: 'ph/floor_tiles_06', kind: 'tint', size: 1.2, color: '#e8e6e0', rough: .7, normal: 1, note: 'tiles (kitchen, bathroom)' },
  carpet:         { dir: 'ph/dirty_carpet', kind: 'tint', size: 1.2, color: '#9aa0a8', rough: 1, normal: 1.2, note: 'carpet (bedrooms, offices)' },
  concrete:       { dir: 'ph/concrete_floor', kind: 'tint', color: '#a9a8a4', size: 3, rough: 1, normal: 1, note: 'concrete (garage, sidewalk)' },
  // furniture + soft things
  wood_worn:      { dir: 'ph/wood_table_worn', kind: 'natural', size: 1.4, rough: .7, normal: 1.2, note: 'scratched table top' },
  wood_fine:      { dir: 'ph/wood_table_001', kind: 'natural', size: 1.4, rough: .55, normal: .8, note: 'clean varnished furniture' },
  leather:        { dir: 'ph/brown_leather', kind: 'natural', size: .8, rough: .6, normal: 1, note: 'leather (sofa, chair)' },
  fabric_pattern: { dir: 'ph/fabric_pattern_05', kind: 'natural', size: .6, rough: 1, normal: 1, note: 'patterned fabric (curtains, rug)' },
  jacquard:       { dir: 'ph/quatrefoil_jacquard_fabric', kind: 'tint', size: .9, color: '#b85c4a', rough: 1, normal: 1, note: 'woven upholstery' },
  denim:          { dir: 'ph/denim_fabric', kind: 'tint', size: .4, color: '#3e5a86', rough: 1, normal: 1, note: 'denim / heavy cotton' },
  knit:           { dir: 'gen/knit', kind: 'tint', size: .6, color: '#d9d4ea', rough: 1, normal: 1.2, note: 'knit (bedding, sweaters: Gneef look)' },
};
export function mat(name, o = {}) {
  const L = LIB[name]; if (!L) throw new Error('no material ' + name);
  const size = o.size || L.size, rep = 1 / size, base = `assets/${L.dir}/`;
  const phys = o.clearcoat || o.sheen, M = phys ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;   // varnish = clearcoat, wool / velvet = sheen
  const m = new M({
    map: tex(base + (L.kind === 'tint' ? 'detail.jpg' : 'diffuse.jpg'), true, rep),
    normalMap: tex(base + 'nor_gl.jpg', false, rep), roughnessMap: tex(base + 'rough.jpg', false, rep),
    roughness: o.rough ?? L.rough, metalness: 0,
  });
  const n = (o.normal ?? L.normal); m.normalScale.set(n, n);
  if (o.clearcoat) { m.clearcoat = o.clearcoat; m.clearcoatRoughness = o.clearcoatRough ?? .18; }
  if (o.sheen) { m.sheen = o.sheen; m.sheenRoughness = o.sheenRough ?? .6; m.sheenColor = new THREE.Color(o.sheenColor || '#ffffff'); }
  const c = o.color || (L.kind === 'tint' ? L.color : null); if (c) m.color.set(c).multiplyScalar(L.kind === 'tint' ? 1 / .85 : 1);
  return m;
}
// one UV unit = one metre on every face of a box / plane (so textures keep real size on any mesh)
export function worldUV(g) {
  g = g.index ? g.toNonIndexed() : g; const P = g.attributes.position, N = g.attributes.normal, uv = new Float32Array(P.count * 2);
  for (let i = 0; i < P.count; i++) {
    const ax = Math.abs(N.getX(i)), ay = Math.abs(N.getY(i)), az = Math.abs(N.getZ(i)), x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    const [u, v] = ay >= ax && ay >= az ? [x, z] : ax >= az ? [z, y] : [x, y]; uv[2 * i] = u; uv[2 * i + 1] = v;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
// COLOUR RULES (draft): each scene picks one palette; walls take `wall`, trims `trim`, floors keep their wood or take `floor`,
// soft things take `accent`. The palettes sit a little more saturated than real life (the Gneef push) and stay mid-dark so
// characters stand out.
export const PALETTES = {
  cozy_bedroom:  { wall: '#c9d8e6', trim: '#f2efe8', floor: 'wood_floor', accent: '#c0503c', soft: '#d9d4ea', note: 'cool blue wallpaper, warm wood, red accents' },
  warm_family:   { wall: '#e8c9a0', trim: '#f4efe4', floor: 'parquet', accent: '#2f6f73', soft: '#efe0c8', note: 'peach walls, teal accents (living room / kitchen)' },
  green_calm:    { wall: '#a9c3a0', trim: '#f2efe8', floor: 'laminate', accent: '#d9a441', soft: '#efe7d6', note: 'sage walls, mustard accents' },
  night_mystery: { wall: '#5a5f86', trim: '#d8d6e4', floor: 'wood_floor', accent: '#e0b34a', soft: '#8a86b8', note: 'dusky purple-blue, gold lamp accents' },
};
