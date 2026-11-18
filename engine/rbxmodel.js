// Roblox Creator Store models converted by tools/roblox/models.py -> our materials (2026-11-18).
// Each mesh is named 'mat~<RobloxMaterial>~<hex>'. We keep the builder's COLOUR choice but replace the look with our
// library material of the same kind (wood -> real wood, fabric -> woven fabric with sheen, metal -> metal...).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mat, worldUV } from './materials.js';
const KIND = { Wood: 'wood', WoodPlanks: 'wood', Fabric: 'fabric', Metal: 'metal', DiamondPlate: 'metal', CorrodedMetal: 'metal', Foil: 'metal',
  Glass: 'glass', Ice: 'glass', Brick: 'brick', Concrete: 'stone', Pavement: 'stone', Slate: 'stone', Marble: 'stone', Granite: 'stone', Limestone: 'stone',
  Neon: 'neon', Grass: 'grass', LeafyGrass: 'grass', Plastic: 'plastic', SmoothPlastic: 'plastic' };
const cache = new Map();
export function reskin(name, size = 1) {
  const [, rm, hex, tt] = name.split('~'), c = new THREE.Color('#' + hex), kind = KIND[rm] || 'plastic', hsl = c.getHSL({}), alpha = tt ? 1 - +tt.slice(1) / 10 : 1;   // ~t5 = the builder's 50% transparency
  const k = kind + hex + (tt || ''); if (cache.has(k)) return cache.get(k);
  let m;
  if (kind === 'wood') m = hsl.s < .12 && hsl.l > .7 ? mat('plaster_fine', { color: '#' + hex, size: 1, normal: .6, rough: .5 })        // white / grey "wood" = painted
    : (m = mat('wood_fine', { size: 1.2, clearcoat: .3 }), m.color.copy(c).lerp(new THREE.Color(1, 1, 1), .35).multiplyScalar(1.4), m);   // real wood, tinted toward the builder's colour
  else if (kind === 'fabric') m = mat('denim', { color: '#' + hex, size: .16, normal: .45, sheen: .7, sheenColor: '#ffffff' });   // upholstery: a fine weave, not a big pattern
  else if (kind === 'metal') m = new THREE.MeshStandardMaterial({ color: c, metalness: .85, roughness: .32 });
  else if (kind === 'glass') m = new THREE.MeshPhysicalMaterial({ color: c, roughness: .05, transparent: true, opacity: .25 });
  else if (kind === 'brick') m = mat('brick', { size: 2.2 });
  else if (kind === 'stone') m = mat('concrete', { color: '#' + hex, size: 2, normal: .6, rough: .7 });
  else if (kind === 'neon') m = new THREE.MeshBasicMaterial({ color: c.clone().multiplyScalar(3), toneMapped: false });
  else m = new THREE.MeshPhysicalMaterial({ color: c, roughness: .42, clearcoat: .15 });   // plastic: smooth, slight sheen
  if (alpha < 1 || kind === 'glass') { m.transparent = true; m.opacity = Math.min(m.opacity ?? 1, kind === 'glass' ? Math.min(.25, alpha) : alpha); m.depthWrite = false; }
  cache.set(k, m); return m;
}
// paint: { '<builder hex>' | '*': THREE.Material | { color, kind } } re-colours a pulled model to OUR design palette
export async function loadRbx(id, { yaw = 0, scale = 1, paint = null } = {}) {
  const g = await new GLTFLoader().loadAsync(new URL(`assets/rbxmodels/${id}/model.glb`, document.baseURI).href), o = new THREE.Group(); o.add(g.scene);
  g.scene.traverse(m => { if (!m.isMesh) return; const n = m.name.startsWith('mat~') ? m.name : (m.parent?.name || '');
    let geo = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry; geo.computeVertexNormals(); { const N = geo.attributes.normal.array; for (let i = 0; i < N.length; i++) if (!Number.isFinite(N[i])) N[i] = i % 3 === 1 ? 1 : 0; } m.geometry = worldUV(geo); /* flat normals: Roblox parts are hard-edged */ m.material = n.startsWith('mat~') ? reskin(n) : m.material; if (paint) { const hx = n.split('~')[2], p = paint[hx] ?? paint['*']; if (p) m.material = p.isMaterial ? p : reskin(`mat~${p.kind || n.split('~')[1]}~${p.color.replace('#', '')}`); } m.castShadow = !m.material.transparent; m.receiveShadow = true; });   /* glass and see-through parts never block the sun */
  o.rotation.y = yaw; o.scale.setScalar(scale); return o;
}
