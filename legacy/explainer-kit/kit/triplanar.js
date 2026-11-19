// TRIPLANAR SURFACE MATERIALS (Xavier 2026-10-28: "before applying sumn think, what would this typically be ... wall? needs
// paint? wood? varnished? brick? ... but not overly detailed"). Maps a texture set from WORLD position (no UVs needed,
// same scale on every surface), so a map built of thousands of Roblox parts gets real-world material detail:
//   surface(kind, color) -> MeshStandardMaterial
// The paint colour stays the colour; the texture only adds what that stuff looks like up close: plaster's trowel marks,
// wood grain under paint, brick + mortar, roof tiles, concrete pores. Low strengths on purpose (YT-shorts clean, not gritty).
import * as THREE from 'three';

const tl = new THREE.TextureLoader(), cache = new Map();
const tex = (set, file, srgb) => { const k = set + file; if (!cache.has(k)) { const t = tl.load(new URL(`kit/assets/ph/${set}/${file}`, document.baseURI).href); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; cache.set(k, t); } return cache.get(k); };

// kind: texture set, world size of one tile (m), how much of the texture's own light/dark shows (detail), whether its own
// colour is used (full: stained / varnished wood, brick), normal strength, roughness
export const KINDS = {
  lapSiding:   { set: 'oak_veneer_01', tile: 1.2, detail: .12, normal: .4, rough: .6, lap: .2 },   // US suburban house walls: horizontal clapboards (painted), a shadow line under each board
  shingles:    { set: 'smooth_concrete_floor', tile: 1.5, detail: .35, normal: .6, rough: .85, lap: .24, lapAll: true },   // asphalt-shingle roofs: rows of tabs
  fabric:      { set: 'cotton_jersey', tile: .5, detail: .35, normal: 1.0, rough: .95 },   // upholstery
  plaster:     { set: 'painted_plaster_wall', tile: 1.6, detail: .5, normal: 2.2, rough: .85 },        // painted house walls
  siding:      { set: 'painted_plaster_wall', tile: 1.2, detail: .4, normal: 2.0, rough: .7 },
  paintedWood: { set: 'oak_veneer_01', tile: 1.0, detail: .3, normal: 1.6, rough: .5 },        // trims, posts, rails, doors, fences: grain under paint
  wood:        { set: 'oak_veneer_01', tile: 1.4, detail: .55, normal: .8, rough: .35, coat: .6 },   // grain light/dark only: the colour is the stain we chose (not the texture's orange) // stained / varnished wood (decks, steps, benches)
  brick:       { set: 'red_brick_03', tile: 1.6, full: true, detail: 1, normal: 1.0, rough: .85 },
  roofTiles:   { set: 'clay_roof_tiles', tile: 1.6, detail: .45, normal: 1.0, rough: .7 },
  concrete:    { set: 'concrete_pavement_02', tile: 2.2, detail: .45, normal: 1.0, rough: .9 },          // pavements, driveways, kerbs
  asphalt:     { set: 'smooth_concrete_floor', tile: 3, detail: .35, normal: .5, rough: .92 },
  grass:       { set: 'sparse_grass', tile: 1.6, detail: .7, normal: 1.2, rough: .95 },
  metal:       { set: 'smooth_concrete_floor', tile: 4, detail: .05, normal: .1, rough: .35, metal: .5 },
};

export function surface(kind, color, o = {}) {
  const K = { ...KINDS[kind], ...o }, m = new (K.coat ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial)({ color, roughness: K.rough, metalness: K.metal || 0, transparent: !!o.transparent, opacity: o.opacity ?? 1, ...(K.coat ? { clearcoat: K.coat, clearcoatRoughness: .15 } : {}) });   // varnish = clear coat
  const dif = tex(K.set, 'diffuse.jpg', true), nor = tex(K.set, 'nor_gl.jpg', false);
  m.userData.keepPBR = true;   // filmA shading LOD would swap it for a plain Lambert twin and lose the detail
  m.customProgramCacheKey = () => 'tri:' + kind + (K.full ? 'f' : '') + (K.lap ? (K.lapAll ? 'L' : 'l') : '');
  m.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, { tDif: { value: dif }, tNor: { value: nor }, uScale: { value: 1 / K.tile }, uDetail: { value: K.detail }, uNorm: { value: K.normal }, uLap: { value: K.lap || 0 } });
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vTriP; varying vec3 vTriN;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvTriP = (modelMatrix * vec4(transformed, 1.0)).xyz; vTriN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `#include <common>
      varying vec3 vTriP; varying vec3 vTriN; uniform sampler2D tDif, tNor; uniform float uScale, uDetail, uNorm, uLap;
      vec3 triW() { vec3 b = pow(abs(normalize(vTriN)), vec3(4.)); return b / (b.x + b.y + b.z); }`)
      .replace('#include <map_fragment>', `{ vec3 w = triW(), p = vTriP * uScale;
        vec3 c = texture2D(tDif, p.zy).rgb * w.x + texture2D(tDif, p.xz).rgb * w.y + texture2D(tDif, p.xy).rgb * w.z;
        ${K.full ? 'diffuseColor.rgb *= mix(vec3(1.), c / max(dot(c, vec3(.333)), .05) * (.75 + .5 * dot(c, vec3(.333)) / .45), uDetail);' : 'float l = dot(c, vec3(.299, .587, .114)); vec3 cm = texture2D(tDif, vec2(.5), 10.).rgb; float lm = max(dot(cm, vec3(.299, .587, .114)), .05); diffuseColor.rgb *= mix(1., clamp(l / lm, .6, 1.4), uDetail);'}
        ${K.lap ? 'if (abs(vTriN.y) < ' + (K.lapAll ? '.95' : '.5') + ') { float f = fract(vTriP.y / uLap); diffuseColor.rgb *= mix(.72, 1., smoothstep(0., .12, f)); }' : ''} }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
      { vec3 w = triW(), p = vTriP * uScale, n0 = normalize(vTriN);
        vec3 tx = texture2D(tNor, p.zy).xyz * 2. - 1., ty = texture2D(tNor, p.xz).xyz * 2. - 1., tz = texture2D(tNor, p.xy).xyz * 2. - 1.;
        vec3 d = vec3(0., tx.y, tx.x) * w.x + vec3(ty.x, 0., ty.y) * w.y + vec3(tz.x, tz.y, 0.) * w.z;   // UDN blend in world space
        ${K.lap ? 'if (abs(n0.y) < ' + (K.lapAll ? '.95' : '.5') + ') { float f = fract(vTriP.y / uLap); d.y -= (f < .1 ? -1.2 : .28) / max(uNorm, .01); }   // each board leans out at its bottom edge, lip catches light' : ''}
        normal = normalize((viewMatrix * vec4(normalize(n0 + d * uNorm), 0.)).xyz) * (gl_FrontFacing ? 1. : -1.); }`);
  };
  return m;
}
