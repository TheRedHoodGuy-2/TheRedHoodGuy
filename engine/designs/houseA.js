// HOUSE A "warm modern" (the guy's family): every furniture piece of the design board, built once, used by every room.
// Board: docs/sheets/house_A_board.jpg. Palette: cream #efe6d6, white oak, walnut #5b4636, olive #6f7b4f, terracotta #c16a43,
// black #2c2c2c, dark teal #24474a, brass. Each piece returns an Object3D at studio scale (real size x ~1.4), floor at y 0,
// front facing +z. Store / Poly Haven pieces are re-coloured to the palette; simple-shaped modern pieces are modelled.
import * as THREE from 'three';
import { mat } from '../materials.js';
import { bbox, ph, at } from '../build.js';
import { loadRbx } from '../rbxmodel.js';
export const PAL = { cream: '#efe6d6', oak: '#c8a27a', walnut: '#5b4636', olive: '#6f7b4f', terracotta: '#c16a43', black: '#2c2c2c', teal: '#24474a', brass: '#b68b4c' };
const black = () => new THREE.MeshStandardMaterial({ color: '#1d1d1f', metalness: .6, roughness: .45 });
const walnut = () => { const m = mat('wood_fine', { size: 1.2, clearcoat: .25 }); m.color.set('#ffe6cc'); return m; };
const yawTo = (o, y) => { const g = new THREE.Group(); o.rotation.y = y; g.add(o); return g; };

export const PIECES = {
  // low modern sofa (store 11652583496, the builder's grey) in cream boucle, black legs; 2.9 m wide (studio sofa standard)
  sofa: async () => loadRbx(11652583496, { scale: 2.9 / 4.293, paint: { a3a2a5: mat('boucle', { color: PAL.cream, sheen: .5 }), '1b2a35': black() } }),
  // wood-frame lounge chair (Poly Haven) with olive velvet cushions
  armchair: async () => ph('modern_arm_chair_01', { scale: 1.45, swap: { modern_arm_chair_01_pillow: mat('velvet', { color: PAL.olive, sheen: .8, sheenColor: '#d6dcb4' }) } }),
  // walnut coffee table, modelled: 120 x 60 x 40 cm real -> 1.7 x .85 x .55, 4 cm rounded top, tapered round legs
  coffeeTable: async () => {
    const g = new THREE.Group(), w = walnut(); g.add(at(bbox(1.7, .06, .85, w, .025), 0, .52, 0));
    g.add(at(bbox(1.5, .05, .68, w, .015), 0, .17, 0));   // lower shelf
    for (const [x, z] of [[-.74, -.33], [.74, -.33], [-.74, .33], [.74, .33]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.03, .022, .49, 16), w); l.position.set(x, .245, z); l.castShadow = l.receiveShadow = true; g.add(l); }
    return g;
  },
  // flat-woven jute rug with a bound edge, 3.4 x 2.4 m
  rug: async () => { const g = new THREE.Group(); g.add(at(bbox(3.4, .012, 2.4, mat('jute', { color: '#c9ad84' }), .006), 0, .006, 0));
    g.add(at(bbox(3.46, .01, 2.46, mat('linen', { color: '#8d7558' }), .005), 0, .005, 0)); return g; },
  // black arc floor lamp, modelled (the store SKAFT was a crude 8-sided bend): weighted round base, one smooth steel arc,
  // linen drum shade hanging over the sofa. Real ~2.0 m tall / 1.6 m reach -> 2.75 m / 2.1 m. OFF by default (daylight).
  floorLamp: async () => {
    const g = new THREE.Group(), b = black(), reach = 2.1, top = 2.75;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.24, .26, .05, 40), mat('concrete', { color: '#e9e5de', size: .6, rough: .35 })); base.position.y = .025; g.add(base);
    const curve = new THREE.CubicBezierCurve3(new THREE.Vector3(0, .05, 0), new THREE.Vector3(0, top * .95, 0), new THREE.Vector3(reach * .55, top * 1.08, 0), new THREE.Vector3(reach, top * .82, 0));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, .016, 10), b));
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(.2, .26, .3, 40, 1, true), mat('linen', { color: '#efe6d6' })); shade.material.side = THREE.DoubleSide; shade.position.set(reach, top * .82 - .2, 0); g.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 12), new THREE.MeshStandardMaterial({ color: '#f4efe4', roughness: .3 })); bulb.position.set(reach, top * .82 - .2, 0); bulb.name = 'bulb'; g.add(bulb);
    g.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; }); return g;
  },
  // walnut fluted TV console (Poly Haven)
  tvConsole: async () => ph('modern_wooden_cabinet', { scale: 1.45 }),
  // flat TV, modelled: 65" real (1.45 x .83) x 1.4 -> 2.0 x 1.17 m, thin black frame, glossy dark screen, small stand feet
  tv: async () => { const g = new THREE.Group(); g.add(at(bbox(2.0, 1.17, .045, new THREE.MeshStandardMaterial({ color: '#141416', roughness: .5 }), .008), 0, .585 + .06, 0));
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.97, 1.14), new THREE.MeshPhysicalMaterial({ color: '#07080a', roughness: .08, clearcoat: 1 })); sc.position.set(0, .645, .0235); g.add(sc);
    for (const x of [-.8, .8]) g.add(at(bbox(.05, .07, .28, black(), .01), x, .035, 0)); return g; },
  // indoor tree (Poly Haven)
  plant: async () => ph('potted_plant_01', { scale: 1.45, swap: { potted_plant_01_pot: mat('plaster_fine', { color: PAL.cream, size: .5, rough: .7 }) } }),   // matte cream ceramic pot, not the scanned wicker
  // throw pillows (Poly Haven) in terracotta velvet
  pillows: async () => ph('throw_pillows_01', { scale: 1.45, swap: { throw_pillows_01: mat('velvet', { color: PAL.terracotta, sheen: .8, sheenColor: '#f0c0a0' }) } }),
  // framed art print, modelled: thin black frame + a calm abstract in the palette (canvas texture)
  art: async () => {
    const c = document.createElement('canvas'); c.width = 600; c.height = 800; const x = c.getContext('2d');
    x.fillStyle = '#efe6d6'; x.fillRect(0, 0, 600, 800); x.fillStyle = PAL.terracotta; x.beginPath(); x.arc(300, 330, 170, 0, Math.PI * 2); x.fill();
    x.fillStyle = PAL.olive; x.fillRect(0, 520, 600, 280); x.fillStyle = '#d6c2a8'; x.fillRect(0, 610, 600, 190); x.fillStyle = PAL.walnut; x.fillRect(90, 470, 14, 330);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const g = new THREE.Group(); g.add(at(bbox(1.2, 1.6, .04, black(), .004), 0, .8, 0));
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5), new THREE.MeshStandardMaterial({ map: t, roughness: .9 })); p.position.set(0, .8, .021); g.add(p); return g;
  },
};
