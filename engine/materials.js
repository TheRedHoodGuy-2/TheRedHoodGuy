// MATERIAL LIBRARY (draft 2026-11-18). One function for every surface in every set:
//   mat('plaster', { color: '#e9dcc8', size: 1.2 })  -> MeshStandardMaterial with real colour detail, roughness and normal maps.
// Every texture is a real scanned surface (Poly Haven, CC0) or a generated one (knit, wallpaper). Two kinds:
//   tint     : the texture is used as grey DETAIL x our chosen colour (walls, paint, fabric, tiles): colour is ours, texture is real
//   natural  : the texture keeps its own colour (wood, brick, leather, carpet), optionally nudged with `color`
// size = metres one texture tile covers (so a floor board or a brick is always its real size, whatever the mesh size).
// Meshes need world-scale UVs: use worldUV(geometry) on boxes / planes (one UV unit = one metre).
import * as THREE from 'three';
const url = p => new URL(p, document.baseURI).href;
const TL = new THREE.TextureLoader(), cache = new Map(), pending = [];
export const texReady = () => Promise.all(pending);   // await before a still: unloaded maps render black
function tex(path, srgb, repeat) {
  const k = path + repeat;
  if (!cache.has(k)) { let done; pending.push(new Promise(r => done = r)); const t = TL.load(url(path), done, undefined, done); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(repeat, repeat); cache.set(k, t); }
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
  cmu:            { dir: 'gen/cmu_block', kind: 'tint', size: 1.62 * 1.4, color: '#dfe6ea', rough: .85, normal: .5, note: 'painted concrete block 8x16 in, running bond (US school walls)' },
  // floors
  vct:            { dir: 'gen/vct_floor', kind: 'natural', size: 1.22 * 1.4, rough: 1, normal: .6, note: 'waxed VCT tile, 12 in squares, speckled (US school floors)' },
  ceilingTile:    { dir: 'gen/ceiling_tile', kind: 'tint', size: .6 * 1.4, color: '#eceeef', rough: 1, normal: .8, note: 'suspended acoustic ceiling tile 2x2 ft' },
  wood_floor:     { dir: 'ph/wood_floor', kind: 'natural', size: 2.4, rough: .9, normal: 1, note: 'wood boards' },
  laminate:       { dir: 'ph/laminate_floor_02', kind: 'natural', size: 2.4, rough: .8, normal: .8, note: 'laminate / light oak' },
  parquet:        { dir: 'ph/herringbone_parquet', kind: 'natural', size: 1.6, rough: .8, normal: 1, note: 'herringbone parquet (living rooms)' },
  tiles:          { dir: 'gen/tile_large', kind: 'tint', size: 1.2, color: '#e8e6e0', rough: .7, normal: 1, note: 'large-format modern tiles, 60 cm, thin grout (kitchen, bathroom); the old checker scan read dated' },
  carpet:         { dir: 'ph/dirty_carpet', kind: 'tint', size: 1.2, color: '#9aa0a8', rough: 1, normal: 1.2, note: 'carpet (bedrooms, offices)' },
  concrete:       { dir: 'ph/concrete_floor', kind: 'tint', color: '#a9a8a4', size: 3, rough: 1, normal: 1, note: 'concrete (garage, sidewalk)' },
  // furniture + soft things
  wood_worn:      { dir: 'ph/wood_table_worn', kind: 'natural', size: 1.4, rough: .7, normal: 1.2, note: 'scratched table top' },
  wood_fine:      { dir: 'ph/wood_table_001', kind: 'natural', size: 1.4, rough: .55, normal: .8, note: 'clean varnished furniture' },
  leather:        { dir: 'ph/brown_leather', kind: 'natural', size: .8, rough: .6, normal: 1, note: 'leather (sofa, chair)' },
  fabric_pattern: { dir: 'ph/fabric_pattern_05', kind: 'natural', size: .6, rough: 1, normal: 1, note: 'patterned fabric (curtains, rug)' },
  jacquard:       { dir: 'ph/quatrefoil_jacquard_fabric', kind: 'tint', size: .9, color: '#b85c4a', rough: 1, normal: 1, note: 'woven upholstery' },
  denim:          { dir: 'ph/denim_fabric', kind: 'tint', size: .4, color: '#3e5a86', rough: 1, normal: 1, note: 'denim / heavy cotton' },
  boucle:         { dir: 'ph/curly_teddy_natural', kind: 'tint', size: .3, color: '#efe6d6', rough: 1, normal: 1.4, note: 'wool boucle (modern sofas, chairs)' },
  linen:          { dir: 'ph/rough_linen', kind: 'tint', size: .5, color: '#d8c3a5', rough: 1, normal: 1, note: 'rough linen (bedding, curtains, lamp shades)' },
  jute:           { dir: 'ph/hessian_380', kind: 'tint', size: .5, color: '#c9ad84', rough: 1, normal: 1.6, note: 'jute / hessian weave (rugs, baskets)' },
  velvet:         { dir: 'ph/velour_velvet', kind: 'tint', size: .5, color: '#6f7b4f', rough: 1, normal: .6, note: 'velvet (armchairs, cushions; use sheen)' },
  siding:         { dir: 'gen/lap_siding', kind: 'tint', size: 1, color: '#f2efe8', rough: .6, normal: 1.4, note: 'painted lap siding, .25 m boards (US houses)' },
  shingles:       { dir: 'gen/shingles', kind: 'tint', size: 1.6, color: '#4a4c50', rough: .9, normal: 1.2, note: 'asphalt shingles (roofs)' },
  roofTiles:      { dir: 'ph/clay_roof_tiles', kind: 'natural', size: 1.6, rough: .8, normal: 1, note: 'clay roof tiles' },
  stucco:         { dir: 'ph/painted_plaster_wall', kind: 'tint', size: 1.6, color: '#efe6d6', rough: 1, normal: 2, note: 'stucco / render (houses, shops)' },
  asphalt:        { dir: 'ph/asphalt_02', kind: 'tint', size: 4, color: '#56585c', rough: .95, normal: 1, note: 'road asphalt' },
  pavement:       { dir: 'ph/concrete_pavement_02', kind: 'tint', size: 2.5, color: '#c9c6c0', rough: .9, normal: 1, note: 'sidewalk / driveway concrete' },
  grass:          { dir: 'ph/leafy_grass', kind: 'tint', size: 2.5, color: '#5f8a3a', rough: 1, normal: 1, note: 'lawn (the scan tinted green: natural it read brown-orange)' },
  facadeSiding:   { dir: 'gen/facade_siding', kind: 'tint', size: 4.38, color: '#f2efe8', rough: .7, normal: 1.2, note: 'town house wall: siding with one window per storey tile' },
  facadeBrick:    { dir: 'gen/facade_brick', kind: 'tint', size: 4.38, color: '#a5573f', rough: .9, normal: 1.2, note: 'town brick wall with windows' },
  facadeStucco:   { dir: 'gen/facade_stucco', kind: 'tint', size: 4.38, color: '#e9dfcc', rough: .9, normal: 1, note: 'town render wall with windows' },
  facadeShop:     { dir: 'gen/facade_shopfront', kind: 'tint', size: 4.38, color: '#e9dfcc', rough: .9, normal: 1, note: 'shop ground floor: display window' },
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
