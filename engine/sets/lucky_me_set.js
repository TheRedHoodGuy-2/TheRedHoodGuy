// LUCKY ME sets (2026-11-27): the mansion (front + pool, exterior only - no interior shot needed) and the corner
// store (exterior front + a small interior). Built lightweight/scene-specific (clapset.js pattern), not the full
// plans.js multi-room system - these are single-purpose backgrounds, not houses we live inside.
import * as THREE from 'three';
import { mat } from '../materials.js';
import { bbox, at } from '../build.js';
import { loadRbx } from '../rbxmodel.js';
import { room } from './roomkit.js';
import { privateJet, sportsCar, slushieMachine, miniMart, storeDisplay, poolFloaty, retailCounter, vendingMachine } from '../designs/streetprops.js';

const grp = (...a) => { const g = new THREE.Group(); a.forEach(o => g.add(o)); return g; };
const B = (w, h, d, m, x = 0, y = 0, z = 0, r = .02) => at(bbox(w, h, d, m, Math.min(r, w / 2.1, h / 2.1, d / 2.1)), x, y, z);
const cyl = (r0, r1, h, m, x = 0, y = 0, z = 0, seg = 20) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), m); c.position.set(x, y, z); return c; };
const shadow = o => { o.traverse(m => { if (m.isMesh) { m.castShadow = !m.material.transparent; m.receiveShadow = true; } }); return o; };
const named = (o, n) => { o.name = n; return o; };
const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };

// ---------- MANSION (shots 6-9: balcony front, then the pool) ----------
// Researched real modern-mansion proportions: 2.5-storey cream stucco facade, 4 round columns on a portico, a
// second-floor balcony with a stone balustrade over the entry, big arched windows either side.
export function mansionFront({ x = 0, z = 0 } = {}) {
  const stone = mat('stucco', { color: '#f3ecd9', size: 2.2 }), trim = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .3, clearcoat: .3 });
  const col = new THREE.MeshPhysicalMaterial({ color: '#f7f2e6', roughness: .25, clearcoat: .4 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#8fb0c2', roughness: .06, transparent: true, opacity: .35, depthWrite: false });
  const W = 14, H = 8.5, D = 9, g = grp(); g.position.set(x, 0, z);
  g.add(B(W, H, D, stone, 0, H / 2, 0, .04));                                           // main block
  g.add(B(W + .3, .35, D + .3, trim, 0, H - .1, 0, .02));                               // cornice band
  // portico over the entry: 4 columns + a flat canopy + the balcony slab standing on it
  const portW = 5.2, portD = 2.6, portY = 3.6;
  for (const sx of [-1.9, -.65, .65, 1.9]) g.add(cyl(.22, .24, portY, col, sx, portY / 2, D / 2 + portD - .3));
  g.add(B(portW, .3, portD, trim, 0, portY + .15, D / 2 + portD / 2 - .3));             // canopy / balcony floor slab
  // balcony above the canopy: French doors + a stone balustrade
  g.add(B(2.4, 2.6, .15, glass, 0, portY + 1.5, D / 2 + .02));                          // balcony doors (glass)
  for (let i = -3; i <= 3; i++) g.add(cyl(.045, .045, .9, trim, i * (portW / 2.4) / 3.2, portY + .45, D / 2 + portD - .36));
  g.add(B(portW - .1, .08, .22, trim, 0, portY + .9, D / 2 + portD - .36));             // balustrade rail
  // entry door + big arched-look windows either side of the portico
  g.add(B(1.6, 2.9, .1, new THREE.MeshStandardMaterial({ color: '#5a3b22', roughness: .5 }), 0, 1.45, D / 2 + .05));
  for (const sx of [-4.2, 4.2]) g.add(B(2.2, 3.4, .1, glass, sx, 2.2, D / 2 + .02));
  g.add(B(2.2, 3.4, .1, glass, 0, 6.0, D / 2 + .02));                                    // upper-floor window centred above the door
  return named(shadow(g), 'mansion front');
}

// a lightning-rod hat the singed neighbour wears (strapped to the head, reads from the balcony + robe shots)
export function lightningRodHat() {
  const metal = new THREE.MeshStandardMaterial({ color: '#8d8f93', metalness: .8, roughness: .25 });
  const g = grp(cyl(.11, .13, .08, metal, 0, .04, 0), cyl(.012, .012, .5, metal, 0, .33, 0), cyl(0, .03, .07, metal, 0, .6, 0));
  return named(shadow(g), 'lightning rod hat');
}

export function mansionPool({ x = 0, z = 0 } = {}) {
  const deckMat = mat('tiles', { color: '#e9e3d4', size: 1.4 }), coping = new THREE.MeshPhysicalMaterial({ color: '#f4efe2', roughness: .3, clearcoat: .3 });
  const water = new THREE.MeshPhysicalMaterial({ color: '#1f7fa8', roughness: .08, metalness: .1, clearcoat: .7 });
  const poolW = 10, poolD = 4.4, g = grp(); g.position.set(x, 0, z);
  // deck, coping and water are each a real hole cut with 4 rectangles around the next one in - a solid box "ring"
  // would just bury whatever sits under it (caught in the stills check: the water was invisible under a solid coping slab)
  const ring = (y, h, mat_, X0, X1, Z0, Z1, x0, x1, z0, z1) => { const r = (a, b, c, d) => { if (b - a > .01 && d - c > .01) g.add(B(b - a, h, d - c, mat_, (a + b) / 2, y, (c + d) / 2, 0)); };
    r(X0, X1, Z0, z0); r(X0, X1, z1, Z1); r(X0, x0, z0, z1); r(x1, X1, z0, z1); };
  const dx0 = -poolW / 2 - .5, dx1 = poolW / 2 + .5, dz0 = -poolD / 2 - .5, dz1 = poolD / 2 + .5;   // coping footprint = the hole in the deck
  ring(.0, .05, deckMat, -13, 13, -8.2, 8.2, dx0, dx1, dz0, dz1);                        // deck (top y = .025), hole = coping's footprint
  const wx0 = -poolW / 2, wx1 = poolW / 2, wz0 = -poolD / 2, wz1 = poolD / 2;             // water footprint = the hole in the coping
  ring(-.125, .3, coping, dx0, dx1, dz0, dz1, wx0, wx1, wz0, wz1);                        // coping (top y = .025, flush with the deck), hole = the water
  g.add(B(poolW, .4, poolD, water, 0, -.4, 0, .02));                                     // water fills the coping's hole, top y = -.2 (a clear .225 m step down from the coping)
  // a few chaise loungers along one long edge: flat seat + an upright stepped backrest (reads from above, unlike a thin tilted plane)
  const frameMat = new THREE.MeshStandardMaterial({ color: '#2a2e33', roughness: .6 }), padMat = new THREE.MeshStandardMaterial({ color: '#eceae4', roughness: .7 });
  for (const lx of [-poolW / 2 - 1.6, poolW / 2 + 1.6]) {
    const lg = grp(); lg.position.set(lx, 0, -poolD / 2 - 1.3);
    lg.add(B(.7, .3, 1.7, frameMat, 0, .32, 0), B(.66, .04, 1.6, padMat, 0, .47, 0));     // seat block + cushion top
    lg.add(B(.7, .9, .12, frameMat, 0, .77, -.79), B(.62, .82, .04, padMat, 0, .77, -.73)); // upright backrest
    g.add(lg);
  }
  return named(shadow(g), 'mansion pool');
}

// ---------- CORNER STORE (shots 23-30: outside = vending machine, inside = counter/shelf/slushie/lottery) ----------
export async function cornerStoreFront({ x = 0, z = 0 } = {}) {
  const g = grp(); g.position.set(x, 0, z);
  const front = await miniMart(); g.add(front);
  const vend = vendingMachine(); vend.position.set(-2.6, 0, 1.55); vend.rotation.y = Math.PI * .08; g.add(vend);
  // our own gag sign taped to the header (a prop, not baked into the model, so it can be re-worded without a re-pull)
  const signTex = canvasTex(512, 160, c => { c.fillStyle = '#f6e58a'; c.fillRect(0, 0, 512, 160); c.strokeStyle = '#333'; c.lineWidth = 6; c.strokeRect(10, 10, 492, 140);
    c.fillStyle = '#b02020'; c.font = '900 46px Arial Black, sans-serif'; c.textAlign = 'center'; c.fillText('EATS MONEY', 256, 62); c.font = '900 30px Arial Black, sans-serif'; c.fillText('DO NOT USE', 256, 108); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(.7, .22), new THREE.MeshStandardMaterial({ map: signTex, roughness: .8 }));
  sign.position.set(vend.position.x, 1.75, vend.position.z + .4); sign.rotation.y = vend.rotation.y; g.add(sign);
  g.userData.vend = vend;
  return named(g, 'corner store front');
}

export async function cornerStoreInterior(scene, { x = 0, z = 0 } = {}) {
  const R = await room(scene, { w: 5.2, d: 4.6, h: 2.9,
    wallColor: '#e7e0cf', floorMat: mat('tiles', { color: '#d8d3c6', size: 1.1 }),
    walls: { s: [{ type: 'door', at: -1.8 }] }, hide: ['s'] });   // front wall hidden (camera side); door opening still there for blocking
  R.root.position.set(x, 0, z);
  const counter = await retailCounter(); counter.position.set(1.25, 0, -.45); counter.rotation.y = -Math.PI / 2; R.root.add(counter);   // side-on to the open wall: boy and clerk face each other in profile
  const slushie = await slushieMachine(); slushie.position.set(-1.7, 0, -1.6); R.root.add(slushie);
  for (const [sx, sz, ry] of [[-1.9, .2, Math.PI / 2], [.15, -1.85, 0]]) { const disp = await storeDisplay(); disp.position.set(sx, 0, sz); disp.rotation.y = ry; R.root.add(disp); }
  // the lottery scratch-card roll + a MUST BE 18 TO CLAIM sign on the counter
  const rollMat = new THREE.MeshStandardMaterial({ color: '#c9a63a', metalness: .3, roughness: .5 });
  // FIX (Xavier: "the table has floating stuff on it"): counter top is y=1.02 (checked its mesh bounds) -- both props
  // were floating ~.3m above it with open air visible underneath. Dropped to rest on the real surface.
  const roll = cyl(.09, .09, .22, rollMat, 1.3, 1.11, -1.05); roll.rotation.x = Math.PI / 2; R.root.add(roll);
  const claimTex = canvasTex(400, 140, c => { c.fillStyle = '#fff'; c.fillRect(0, 0, 400, 140); c.strokeStyle = '#c00'; c.lineWidth = 8; c.strokeRect(8, 8, 384, 124);
    c.fillStyle = '#c00'; c.font = '900 30px Arial Black, sans-serif'; c.textAlign = 'center'; c.fillText('MUST BE 18', 200, 58); c.fillText('TO CLAIM', 200, 96); });
  const claim = new THREE.Mesh(new THREE.PlaneGeometry(.4, .14), new THREE.MeshStandardMaterial({ map: claimTex })); claim.position.set(1.3, 1.09, .15); claim.rotation.y = -Math.PI / 4; R.root.add(claim);   // stands on the counter, facing the customer side and the open wall
  R.root.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return R;
}
