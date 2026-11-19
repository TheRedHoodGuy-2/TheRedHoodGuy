// INLINE SKATES (2026-11-19, research: Inline Warehouse "Anatomy of a Fitness / Urban Inline Skate", Rollerblade Maxxum
// specs): a molded, vented plastic SHELL (lower boot) with a padded LINER showing at the collar and tongue; a hinged CUFF
// round the ankle with a CUFF BUCKLE strap; a 45-DEGREE BUCKLE strap over the instep that locks the heel; LACES over the
// toe; an extruded ALUMINIUM FRAME bolted under the shell holding FOUR urethane WHEELS (80-90 mm) on axle bolts; a rubber
// HEEL BRAKE on a bracket behind the back wheel of the right skate. Sized for the R6 foot block (1 x 1 stud = .34 m):
// the boot wraps the bottom of the leg and runs ahead of it like a real foot.
//   const lift = addSkates(actor, { shell: '#1d2430', accent: '#2f6fd6', wheel: '#d9dde2' })  -> metres to raise the actor
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { STUD } from '../r6.js';

const W = .37, SOLE = .018, WHEEL = .125, FRAMEH = .03;   // boot width, sole, wheel diameter, frame drop (m)
function shellGeo() {   // side profile (z forward, y up), extruded across the width with rounded edges
  const s = new THREE.Shape(); s.moveTo(-.19, 0); s.lineTo(.2, 0); s.quadraticCurveTo(.27, 0, .27, .05); s.quadraticCurveTo(.26, .1, .2, .115);
  s.lineTo(.08, .135); s.quadraticCurveTo(.0, .16, -.06, .17); s.lineTo(-.19, .17); s.quadraticCurveTo(-.21, .09, -.19, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: W - .05, bevelEnabled: true, bevelThickness: .025, bevelSize: .02, bevelSegments: 4, curveSegments: 14 });
  g.rotateY(-Math.PI / 2); g.translate((W - .05) / 2, 0, 0); return g;   // extruded along x, centred
}
function cuffGeo() {   // the hinged cuff: a rounded U round the ankle, open at the front, taller at the back
  const g = new THREE.CylinderGeometry(.205, .215, .16, 28, 1, true, Math.PI * .22, Math.PI * 1.56); g.scale(1, 1, .95);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const z = p.getZ(i), y = p.getY(i); if (y > 0) p.setY(i, y + Math.max(0, -z) * .25); }   // the back rises higher
  g.computeVertexNormals(); return g;
}
function wheelGeo() { const pts = []; const r = WHEEL / 2, w = .034; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI; pts.push(new THREE.Vector2(r - w / 2 + Math.cos(a) * w / 2 * .9, Math.sin(a) * w / 2)); }
  pts.unshift(new THREE.Vector2(.012, -w / 2)); pts.push(new THREE.Vector2(.012, w / 2)); const g = new THREE.LatheGeometry(pts, 32); g.rotateZ(Math.PI / 2); return g; }
function frameGeo(len) {   // one wall of the extruded aluminium frame, with lightening holes between the axles
  const s = new THREE.Shape(), top = SOLE * 0 + .0, bot = -FRAMEH - WHEEL * .55;
  s.moveTo(-len / 2 - .02, top); s.lineTo(len / 2 + .02, top); s.quadraticCurveTo(len / 2 + .04, bot * .5, len / 2, bot); s.lineTo(-len / 2, bot); s.quadraticCurveTo(-len / 2 - .04, bot * .5, -len / 2 - .02, top);
  for (let i = 0; i < 3; i++) { const z = -len / 2 + len / 3 * (i + .5), h = new THREE.Path(); h.absellipse(z, (top + bot) / 2 + .006, .022, .012, 0, Math.PI * 2, true); s.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(s, { depth: .006, bevelEnabled: true, bevelThickness: .002, bevelSize: .002, bevelSegments: 1 }); g.rotateY(Math.PI / 2); return g;
}
export function buildSkate({ shell = '#1d2430', accent = '#2f6fd6', wheel = '#eaf3ff', liner = '#2a2c31', brake = false } = {}) {
  const G = new THREE.Group();
  const mShell = new THREE.MeshPhysicalMaterial({ color: shell, roughness: .35, clearcoat: .7, clearcoatRoughness: .25 }), mAcc = new THREE.MeshPhysicalMaterial({ color: accent, roughness: .4, clearcoat: .5 });
  const mLiner = new THREE.MeshStandardMaterial({ color: liner, roughness: .95 }), mMetal = new THREE.MeshStandardMaterial({ color: '#c9ccd1', metalness: .9, roughness: .32 });
  const mWheel = new THREE.MeshPhysicalMaterial({ color: wheel, roughness: .55, transmission: .1, thickness: .02 }), mHub = new THREE.MeshStandardMaterial({ color: '#30343b', roughness: .5 }), mStrap = new THREE.MeshStandardMaterial({ color: '#15171b', roughness: .7 });
  const add = (g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; G.add(o); return o; };
  // lower boot (shell) + a vent stripe in the accent colour + the sole
  add(shellGeo(), mShell, 0, SOLE, 0);
  add(new THREE.BoxGeometry(W + .004, .012, .3), mAcc, 0, SOLE + .075, .02).rotation.x = .12;
  add(new THREE.BoxGeometry(W - .02, SOLE, .46), mStrap, 0, SOLE / 2, .04);
  // cuff round the ankle (accent), padded liner collar on top, tongue in front
  add(cuffGeo(), mAcc, 0, SOLE + .205, -.035);
  const col = add(new THREE.TorusGeometry(.2, .028, 10, 28), mLiner, 0, SOLE + .3, -.04); col.rotation.x = Math.PI / 2; col.scale.set(1, .95, 1);
  add(new THREE.BoxGeometry(.24, .2, .05), mLiner, 0, SOLE + .2, .17).rotation.x = -.35;
  // cuff buckle strap round the top of the cuff + a buckle lever; 45-degree strap over the instep; laces over the toe
  const cs = add(new THREE.TorusGeometry(.212, .012, 6, 32, Math.PI * 1.1), mStrap, 0, SOLE + .262, -.03); cs.rotation.set(Math.PI / 2, 0, Math.PI * .95);
  add(new THREE.BoxGeometry(.05, .03, .022), mMetal, .14, SOLE + .262, .13);
  const s45 = add(new THREE.BoxGeometry(W + .03, .032, .018), mStrap, 0, SOLE + .16, .09); s45.rotation.x = -.75;
  for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(.18, .008, .012), mStrap, 0, SOLE + .118 - i * .006, .15 + i * .03).rotation.x = -.2;
  // frame (two walls) + four wheels with hubs and axle bolts
  const len = .34, wallX = .028;
  for (const sx of [-1, 1]) add(frameGeo(len), mMetal, sx * wallX, 0, .04);
  for (let i = 0; i < 4; i++) { const z = .04 - len / 2 + len / 3 * i, y = -FRAMEH - WHEEL / 2 + .012;
    add(wheelGeo(), mWheel, 0, y, z); const hub = add(new THREE.CylinderGeometry(.02, .02, .03, 16), mHub, 0, y, z); hub.rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) { const b = add(new THREE.CylinderGeometry(.008, .008, .006, 10), mMetal, sx * (wallX + .007), y, z); b.rotation.z = Math.PI / 2; } }
  if (brake) { add(new THREE.BoxGeometry(.05, .025, .06), mMetal, 0, -FRAMEH + .005, -len / 2 - .02);
    const pad = add(new THREE.BoxGeometry(.045, .05, .06), new THREE.MeshStandardMaterial({ color: '#202124', roughness: .9 }), 0, -FRAMEH - .035, -len / 2 - .045); pad.rotation.x = -.35; }
  return G;
}
// put a pair on an actor: each skate rides its own leg block (Roblox space inside the rig: studs, rotated 180 deg)
export function addSkates(actor, o = {}) {
  const lift = FRAMEH + WHEEL - .012 + SOLE + .01;
  for (const [leg, right] of [['legL', false], ['legR', true]]) {
    const sk = buildSkate({ ...o, brake: right }), wrap = new THREE.Group(); wrap.add(sk);
    wrap.scale.setScalar(1 / STUD); wrap.rotation.y = Math.PI;            // avatar metres -> Roblox studs (+z forward becomes -z)
    wrap.position.set(0, -1 - (SOLE + .012) / STUD, -.12 / STUD * 0);     // the leg's bottom sits on the insole
    sk.position.z = .03;                                                  // boot runs ahead of the leg like a foot
    actor.rig.parts[leg].add(wrap);
  }
  return lift;
}
