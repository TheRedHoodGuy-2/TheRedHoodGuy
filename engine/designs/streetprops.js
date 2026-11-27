// STREET + STORE PROPS for Lucky Me (2026-11-27): pulled Roblox models wrapped for re-skinning, plus one modelled
// prop (real vending machines researched: ~1.83 m H x .9 m W x .76 m D, glass front over product coils, header sign,
// coin slot + buttons, drop tray) since every pulled vending-machine candidate failed inspection (exploded unions,
// flat glass box with no detail, or a wrong model entirely — see RULES_CHECK.md for the reject list).
import * as THREE from 'three';
import { bbox, at } from '../build.js';
import { loadRbx } from '../rbxmodel.js';

const grp = (...a) => { const g = new THREE.Group(); a.forEach(o => g.add(o)); return g; };
const B = (w, h, d, m, x = 0, y = 0, z = 0, r = .012) => at(bbox(w, h, d, m, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), x, y, z);
const cyl = (r0, r1, h, m, x = 0, y = 0, z = 0, seg = 20) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); c.position.set(x, y, z); return c; };
const shadow = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = !m.material.transparent; m.receiveShadow = true; } }); return o; };
const named = (o, n) => { o.name = n; return o; };

// ---------- pulled + inspected (out/pull/<id>.jpg, verdicts in topics/lucky_me/RULES_CHECK.md) ----------
export const privateJet = async () => named(await loadRbx(2424091690), 'private jet');                       // PASS, Dassault-shaped, no textures carried
// FIX (Xavier: tires render flat light grey): the model's tire mesh is tagged "Pebble" material at a3a2a5 -- Pebble
// isn't in reskin()'s KIND map, so it fell through to plain gloss plastic in the builder's own (wrong) light-grey
// colour instead of rubber. Repainted straight to a dark matte plastic until there's a real tire texture to give it.
export const sportsCar = async () => named(await loadRbx(8573316692, { paint: { a3a2a5: { color: '#1c1c1e', kind: 'SmoothPlastic' } } }), 'sports car');   // PASS; rear badge is raised geometry (not a decal) - camera never holds tight on the badge (see SHOTS.md 35-37)
export const slushieMachine = async () => named(await loadRbx(2037619935), 'slushie machine');               // PASS, reads clearly: cabinet + lit panel + 2 drum nozzles
export const miniMart = async () => named(await loadRbx(104560670058776), 'corner store front');             // PASS, generic "MART" sign (not a real brand), awning + door + windows
export const storeDisplay = async () => {   // PASS, striped awning shelf unit, same style as miniMart. 17/34 parts were CSG unions the
  const o = await loadRbx(93471449866653);  // converter couldn't read, but per-mesh inspection found nothing stray (tallest mesh 1.62m, all in-proportion) -
  o.updateMatrixWorld(true);                // keep a defensive filter anyway in case a future re-pull introduces an orphan sliver part
  o.traverse(m => { if (m.isMesh) { const b = new THREE.Box3().setFromObject(m), s = b.getSize(new THREE.Vector3()); if (s.y > 2 * Math.max(s.x, s.z) && s.y > .5) m.visible = false; } });
  return named(o, 'store shelf display');
};
export const poolFloaty = async (scale = .42) => { const o = await loadRbx(9851465121); o.scale.setScalar(scale); return named(o, 'pool floaty'); }; // PASS at native scale ~3.7m across (multi-person raft); scaled down for one person
export const retailCounter = async () => named(await loadRbx(134989489039266), 'retail counter');   // PASS, clean per-mesh inspection (all parts in-proportion, nothing floating detached)

// ---------- modelled (researched: real vending machine proportions, glass + coil rows, header, coin slot, tray) ----------
export function vendingMachine({ body = '#8a1620', trim = '#1b1b1d' } = {}) {
  const W = .9, H = 1.83, D = .76;
  const cabinet = new THREE.MeshStandardMaterial({ color: body, roughness: .55, metalness: .25 });
  const bezel = new THREE.MeshStandardMaterial({ color: trim, roughness: .4, metalness: .5 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#cfe3e8', roughness: .08, transparent: true, opacity: .22, depthWrite: false });
  const coil = new THREE.MeshStandardMaterial({ color: '#c7c7c7', roughness: .3, metalness: .6 });
  const can = i => new THREE.MeshStandardMaterial({ color: ['#e3e3e3', '#d84a4a', '#3aa6d8', '#e8c23a', '#4aa85a'][i % 5], roughness: .35, metalness: .5 });
  const g = grp();
  g.add(B(W, H, D, cabinet, 0, H / 2, 0, .03));                                        // cabinet body
  g.add(B(W - .06, .18, .02, bezel, 0, H - .14, D / 2 + .005));                        // header band (our own gag sign gets taped over this in-scene)
  g.add(B(W - .1, 1.05, .04, glass, 0, .98, D / 2 + .02));                              // glass front
  for (let row = 0; row < 4; row++) {                                                  // product cans behind the glass, visible through it (coil rods dropped: at the right length they poked through the cabinet sides)
    for (let col = 0; col < 4; col++) {
      const x = -W / 2 + .16 + col * .19, y = 1.5 - row * .25;
      g.add(cyl(.055, .055, .1, can(row * 4 + col), x, y, D / 2 - .1, 12).rotateX(Math.PI / 2));
    }
  }
  g.add(B(.18, .05, .02, bezel, W / 2 - .18, 1.0, D / 2 + .01, .01));                   // coin slot plate
  g.add(B(.03, .03, .01, new THREE.MeshStandardMaterial({ color: '#111' }), W / 2 - .2, 1.0, D / 2 + .02));
  for (let i = 0; i < 2; i++) g.add(B(.05, .05, .015, bezel, W / 2 - .18, .9 - i * .07, D / 2 + .01, .01)); // buttons
  g.add(B(W - .04, .3, D - .04, cabinet, 0, .15, 0, .02));                              // drop tray recess
  g.add(B(W - .12, .04, D - .2, new THREE.MeshStandardMaterial({ color: '#0c0c0c' }), 0, .28, .05, .01)); // tray slot (dark)
  g.add(B(W - .22, .24, .012, new THREE.MeshStandardMaterial({ color: '#0b0b0c', roughness: .9 }), 0, .19, D / 2 + .007, .004));   // the push-flap opening (dark) at the front bottom
  g.add(B(W - .2, .05, .16, bezel, 0, .055, D / 2 + .08, .01));                         // the pickup lip the cans roll onto
  return named(shadow(g), 'vending machine (built)');
}
