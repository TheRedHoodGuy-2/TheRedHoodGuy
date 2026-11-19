// LIVING ROOM set (reusable): a bright, saturated Roblox-game living room in a small house on a town street.
// 6 x 7 m room: TV wall (-z) painted teal with a wall-mounted TV over an oak-topped console; coral sofa facing it on a
// patterned rug, coffee table, mustard armchair + floor lamp by the windows (-x, two windows with curtains), side table +
// table lamp, bookshelf + clock + art on the right wall (+x) and a doorway (+x, near +z) into a hallway with a coat rack,
// runner and front door. Outside: front yard bushes under the windows, then surround() (street, houses, hills).
// refs: tv { set(k), on(), off(), group }, sofa, armchair, coffeeTable, lamps[{ light }], doorway{ x, z }, hall, room{ w, d, h },
//       spots { tvFront, sofaFront, standTV (where someone stands to aim at the TV), filmer (phone POV spot) }, bake(renderer)
import * as THREE from 'three';
import { M, rb, add, grp } from '../util.js';
import * as P from '../props/school.js';
import * as H from '../props/home.js';
import * as N from '../props/nature.js';
import { pbr, aoStrip, contactShadow } from '../pbr.js';
import { surround } from './surround.js';
import { pending } from '../detail.js';
import { phModel } from '../phmodel.js';

export const ROOM = { w: 6, d: 7, h: 2.8 }, FLOOR = 0;
const TEAL = 0x2f9e9a, CORAL = 0xe2683f, MUSTARD = 0xe8b02e, NAVY = 0x25486e, CREAM = 0xf6efe0;

export function buildWorld(scene) {
  const { w: W, d: D, h: HH } = ROOM, G = grp(0, 0, 0, scene), refs = { scene, lamps: [] };
  scene.fog = new THREE.Fog(0xcfe2f0, 60, 220);
  // real plaster scan (neutral = greyscale, so the tint is the true paint colour), teal accent from the same plaster
  const plaster = pbr('ph/beige_wall_001', { map: 'neutral', tint: 0xf6efe4, rep: [.5, .5], normal: 2.2, rough: .95 });
  const accent = pbr('ph/beige_wall_001', { map: 'neutral', tint: TEAL, rep: [.5, .5], normal: 2.2, rough: .9 });
  const siding = pbr('ph/painted_plaster_wall', { tint: 0xf3dcb8, rep: [.5, .5], normal: .8 });
  const trim = M(0xffffff, { roughness: .35 });
  const wains = pbr('ph/beige_wall_001', { map: 'neutral', tint: 0xf8f4ec, rep: [.8, .8], normal: .6, rough: .45 });
  const floorMat = pbr('ph/herringbone_parquet', { rep: [(W + .4) / 1.3, (D + .4) / 1.3], physical: true, clearcoat: .35, clearcoatRough: .25, rough: .9, normal: 1 });
  add(new THREE.BoxGeometry(W + .4, .1, D + .4), floorMat, 0, -.05, 0, G).receiveShadow = true; refs.floorMat = floorMat;
  const ceil = add(new THREE.PlaneGeometry(W, D), pbr('ph/beige_wall_001', { map: 'neutral', tint: 0xfdfaf5, rep: [W * .5, D * .5], normal: .8 }), 0, HH, 0, G, { shadow: false }); ceil.rotation.x = Math.PI / 2;
  rb(W + .8, .25, D + .8, M(0xe9e2d6, { roughness: .8 }), 0, HH + .14, 0, G, .02);   // roof slab + eave

  // walls: inner paint (or teal accent), siding outside, skirting, crown, AO at the joins
  const wall = (len, x, z, ry, holes, inner = plaster) => {
    const g = grp(x, 0, z, G); g.rotation.y = ry;
    const mk = () => { const s = new THREE.Shape(); s.moveTo(-len / 2 - .2, -.3); s.lineTo(len / 2 + .2, -.3); s.lineTo(len / 2 + .2, HH + .02); s.lineTo(-len / 2 - .2, HH + .02); s.lineTo(-len / 2 - .2, -.3);
      for (const [hx, hy, hw, hh] of holes || []) { const p = new THREE.Path(); p.moveTo(hx - hw / 2, hy - hh / 2); p.lineTo(hx - hw / 2, hy + hh / 2); p.lineTo(hx + hw / 2, hy + hh / 2); p.lineTo(hx + hw / 2, hy - hh / 2); p.lineTo(hx - hw / 2, hy - hh / 2); s.holes.push(p); } return s; };
    const geo = new THREE.ExtrudeGeometry(mk(), { depth: .18, bevelEnabled: false }); geo.translate(0, 0, -.18);
    const m = new THREE.Mesh(geo, [inner, M(0xeee8de, { roughness: .7 })]); m.receiveShadow = m.castShadow = true; g.add(m);
    const skin = new THREE.Mesh(new THREE.ExtrudeGeometry(mk(), { depth: .02, bevelEnabled: false }), siding); skin.position.z = -.2; skin.castShadow = skin.receiveShadow = true; g.add(skin);
    const segs = [[-len / 2, len / 2]]; for (const [hx, hy, hw, hh] of holes || []) if (hy - hh / 2 < .1) { const s = segs.pop(); segs.push([s[0], hx - hw / 2], [hx + hw / 2, s[1]]); }
    for (const [a, b] of segs) if (b - a > .02) rb(b - a, .1, .02, trim, (a + b) / 2, .05, .01, g, .005);   // skirting
    rb(len, .06, .05, trim, 0, HH - .03, .025, g, .01);                                                    // crown
    // wainscoting: semi-gloss panelled dado with box mouldings and a chair rail (skips door openings, stays under windows)
    const wh = Math.min(.9, ...(holes || []).map(([, hy, , hh]) => hy - hh / 2 > .1 ? hy - hh / 2 - .08 : 9));
    for (const [a, b] of segs) { const L2 = b - a; if (L2 < .3) continue; const cx = (a + b) / 2;
      rb(L2, wh, .012, wains, cx, wh / 2, .006, g, .003); rb(L2 + .02, .045, .035, trim, cx, wh, .017, g, .01);
      const n = Math.max(1, Math.round(L2 / .85)), pw = L2 / n;
      for (let i = 0; i < n; i++) { const px = a + pw * (i + .5), iw = pw - .16, ih = wh - .3; if (iw < .15) continue;
        for (const sy of [-1, 1]) rb(iw, .022, .014, trim, px, wh / 2 + .02 + sy * ih / 2, .019, g, .004);
        for (const sx of [-1, 1]) rb(.022, ih, .014, trim, px + sx * iw / 2, wh / 2 + .02, .019, g, .004); } }
    const f = aoStrip(len, .35, { opacity: .2 }); f.rotation.x = -Math.PI / 2; f.position.set(0, .003, .18); f.rotation.z = Math.PI; g.add(f);
    const w1 = aoStrip(len, .3, { opacity: .16 }); w1.position.set(0, .15, .025); w1.rotation.z = Math.PI; g.add(w1);
    const c1 = aoStrip(len, .3, { opacity: .12 }); c1.position.set(0, HH - .15, .025); g.add(c1);
    return g;
  };
  const winY = 1.45, winH = 1.4, winW = 1.5, winZ = [-1.3, 1.5], DOOR = { z: 2.4, w: 1.0, h: 2.15 };
  wall(D, -W / 2, 0, Math.PI / 2, winZ.map(z => [-z, winY, winW, winH]));          // window wall (-x); local x = -z here
  wall(D, W / 2, 0, -Math.PI / 2, [[DOOR.z, DOOR.h / 2, DOOR.w, DOOR.h]]);       // right wall (+x), doorway; local x = +z
  wall(W, 0, -D / 2, 0, null, accent);                                             // TV wall, teal
  wall(W, 0, D / 2, Math.PI);
  refs.doorway = { x: W / 2, z: DOOR.z };
  // doorway casing
  { const g = grp(W / 2 - .005, 0, DOOR.z, G); g.rotation.y = -Math.PI / 2; for (const s of [-1, 1]) rb(.08, DOOR.h + .08, .03, trim, s * (DOOR.w / 2 + .04), (DOOR.h + .08) / 2, .015, g, .008); rb(DOOR.w + .24, .08, .03, trim, 0, DOOR.h + .04, .015, g, .008);
    rb(DOOR.w, .02, .2, M(0xd9cbb5, { roughness: .6 }), 0, .01, -.09, g, .005); }
  // windows + curtains + rods
  for (const z of winZ) {
    const u = P.windowUnit({ w: winW, h: winH, cols: 2, rows: 1 }); u.position.set(-W / 2 - .09, winY, z); u.rotation.y = Math.PI / 2; G.add(u);
    rb(.03, .03, winW + 1.0, M(0x2a2c30, { roughness: .4, metalness: .6 }), -W / 2 + .12, winY + winH / 2 + .28, z, G, .012);
    for (const s of [-1, 1]) { const c = H.curtain({ w: .55, h: 2.3, color: NAVY }); c.position.set(-W / 2 + .14, winY + winH / 2 + .27, z + s * (winW / 2 + .2)); c.rotation.y = Math.PI / 2; G.add(c); }
  }

  // ---------- TV wall (real Poly Haven models: cabinet, plants, vases, frames) ----------
  const ph = (name, x, y, z, ry = 0, o = {}) => { const m = phModel(name, o); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  ph('modern_wooden_cabinet', 0, 0, -D / 2 + .25, 0, { s: .8 }); shadowAt(G, contactShadow(2.3, .7, { opacity: .25 }), 0, .004, -D / 2 + .27);
  const tv = H.tv({ w: 1.4, h: .8 }); tv.group.position.set(0, 1.36, -D / 2 + .06); G.add(tv.group); refs.tv = tv;
  ph('potted_plant_04', -.82, .545, -D / 2 + .26, .4, { s: 1.4 }); ph('ceramic_vase_01', .8, .545, -D / 2 + .26, 0, { s: .7 });
  ph('book_encyclopedia_set_01', .36, .545, -D / 2 + .25, 0, { s: .9 });
  for (const x of [-2.05, 2.05]) ph('fancy_picture_frame_01', x, 1.45, -D / 2, 0, { s: 1.1 });
  ph('potted_plant_01', -W / 2 + .45, 0, -D / 2 + .45, .5);
  ph('potted_plant_02', W / 2 - .5, 0, -D / 2 + .5, 1.2);

  // ---------- seating ----------
  const rug = H.rugKilim({ w: 3.0, d: 2.2 }); rug.position.set(0, 0, -.25); G.add(rug);
  refs.sofa = ph('sofa_02', 0, 0, 1.2, Math.PI, { s: 1.15 }); shadowAt(G, contactShadow(2.4, 1.1, { opacity: .3 }), 0, .004, 1.2);
  ph('throw_pillows_01', .05, .4, 1.25, Math.PI, { s: 1.0 });
  refs.coffeeTable = ph('coffee_table_round_01', 0, 0, -.4, 0, { s: .82 }); shadowAt(G, contactShadow(1.2, 1.2, { opacity: .25 }), 0, .004, -.4);
  refs.armchair = ph('mid_century_lounge_chair', -2.05, 0, -.55, Math.PI / 2 + .6); shadowAt(G, contactShadow(1.1, 1.1, { opacity: .3 }), -2.05, .004, -.55);
  const fl = H.floorLamp(); fl.group.position.set(-2.55, 0, .55); G.add(fl.group); refs.lamps.push(fl);
  const st = H.sideTable(); st.position.set(1.4, 0, 1.2); G.add(st);
  const tl = H.tableLamp({ base: TEAL }); tl.group.position.set(1.4, .55, 1.2); G.add(tl.group); refs.lamps.push(tl);

  // ---------- right wall: shelves, clock, art; back wall: console table + big frame ----------
  for (const [z, seed] of [[-1.2, 6], [-.15, 11]]) { const b = H.bookshelfHome({ seed }); b.position.set(W / 2 - .18, 0, z); b.rotation.y = -Math.PI / 2; G.add(b);
    const L = (o, y, dx, ry = 0) => { o.position.set(W / 2 - .18, y, z + dx); o.rotation.y = -Math.PI / 2 + ry; G.add(o); };   // dressing on the shelves (real models)
    const sh = [.06, .485, .91, 1.335], bk = () => phModel('book_encyclopedia_set_01', { s: .75 });
    L(bk(), sh[0], -.38); L(bk(), sh[0], .02);
    L(bk(), sh[1], -.38); L(phModel('potted_plant_04', { s: 1.3 }), sh[1], .25);
    L(phModel(seed > 8 ? 'ceramic_vase_03' : 'ceramic_vase_01', { s: .6 }), sh[2], -.25); L(bk(), sh[2], -.05, Math.PI);
    L(bk(), sh[3], -.1); L(phModel('ceramic_vase_03', { s: .5 }), sh[3], -.3); }
  const clock = P.wallClock({ r: .17 }); clock.group.position.set(W / 2 - .02, 2.35, -.65); clock.group.rotation.y = -Math.PI / 2; clock.set(8, 40, 0); G.add(clock.group); refs.clock = clock;
  ph('fancy_picture_frame_01', W / 2 - .02, 1.6, 1.15, -Math.PI / 2, { s: 1.3 });
  { const g = grp(0, 0, D / 2 - .22, G); g.rotation.y = Math.PI;
    rb(1.4, .04, .34, H.wood([1.2, .3]), 0, .8, 0, g, .01); for (const s of [-1, 1]) rb(.04, .8, .3, M(0x2a2c30, { roughness: .4 }), s * .66, .4, 0, g, .008);
    const f = phModel('fancy_picture_frame_01', { s: 2.0 }); f.position.set(0, 1.75, .17); g.add(f);
    const v = phModel('ceramic_vase_03'); v.position.set(-.45, .82, 0); g.add(v); const b = phModel('book_encyclopedia_set_01', { s: .8 }); b.position.set(.1, .82, 0); g.add(b); }
  ph('potted_plant_01', -W / 2 + .45, 0, D / 2 - .45, 2.2, { s: .9 });
  ph('modern_ceiling_lamp_01', 0, HH - 1.17 * .65, 0, 0, { s: .65 });

  // ---------- hallway behind the doorway (+x): runner, coat rack, front door at the end, a framed photo ----------
  hallway(G, W, D, HH, DOOR, plaster, siding, trim, floorMat, refs);

  // ---------- outside: front yard under the windows, then the town ----------
  const GY = -.25;
  for (const z of [-2.6, -1.3, 0, 1.5, 2.8]) { const b = N.bush({ w: 1.0, h: .75, seed: 40 + Math.round(z * 10), kind: z === 0 ? 'flower' : 'round' }); b.position.set(-W / 2 - .8, GY, z); G.add(b); }
  rb(W + 3.6, .2, D + .8, M(0xbdb6aa, { roughness: .9 }), .9, -.13, 0, G, .02);   // foundation plinth
  surround(G, scene, { box: [-W / 2 - 2.5, W / 2 + 3.5, -D / 2 - 2, D / 2 + 4], GY, seed: 7 });

  // ---------- lighting: sun through the windows, lamps, HDRI sky fill ----------
  const hemi = new THREE.HemisphereLight(0xeef5ff, 0xe3d6c4, .9); scene.add(hemi); refs.hemi = hemi;
  const amb = new THREE.AmbientLight(0xffffff, .2); scene.add(amb); refs.amb = amb;
  const sun = new THREE.DirectionalLight(0xfff0d6, 3.3); sun.position.set(-13, 9, 3); sun.target.position.set(-1, 0, 0); scene.add(sun.target); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 60 }); sun.shadow.bias = -.0008; sun.shadow.normalBias = .06; sun.shadow.radius = 4;
  scene.add(sun); refs.sun = sun;
  const ceilL = new THREE.PointLight(0xfff2e0, 2.6, 7, 1.6); ceilL.position.set(0, HH - .3, 0); scene.add(ceilL); refs.ceilingLight = ceilL;
  sky(scene);
  refs.bake = renderer => {
    const rt = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType }); const cc = new THREE.CubeCamera(.05, 80, rt); cc.position.set(0, 1.2, 0);
    const vis = []; scene.traverse(o => { if (o.isMesh && o.material === floorMat) { vis.push(o); o.visible = false; } });
    cc.update(renderer, scene); vis.forEach(o => o.visible = true); floorMat.envMap = rt.texture; floorMat.envMapIntensity = .7; floorMat.needsUpdate = true;
  };
  refs.spots = { tvFront: new THREE.Vector3(0, 0, -2.2), sofaFront: new THREE.Vector3(0, 0, .45), standTV: new THREE.Vector3(.35, 0, .15), filmer: new THREE.Vector3(1.6, 1.5, 1.6) };
  refs.room = ROOM; refs.W = G;
  return refs;
}

function shadowAt(G, m, x, y, z) { m.position.set(x, y, z); G.add(m); return m; }

function hallway(G, W, D, HH, DOOR, plaster, siding, trim, floorMat, refs) {
  const x0 = W / 2 + .22, x1 = W / 2 + 2.2, z0 = DOOR.z - 2.2, z1 = D / 2 + 3.0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, L = z1 - z0, Wd = x1 - x0;
  add(new THREE.BoxGeometry(Wd + .2, .1, L), floorMat, cx, -.05, cz, G).receiveShadow = true;
  const c = add(new THREE.PlaneGeometry(Wd, L), M(0xfbf9f5, { roughness: .95 }), cx, HH, cz, G, { shadow: false }); c.rotation.x = Math.PI / 2;
  const side = (len, x, z, ry, hole) => { const g = grp(x, 0, z, G); g.rotation.y = ry; const s = new THREE.Shape(); s.moveTo(-len / 2, 0); s.lineTo(len / 2, 0); s.lineTo(len / 2, HH); s.lineTo(-len / 2, HH); s.lineTo(-len / 2, 0);
    if (hole) { const p = new THREE.Path(); const [hx, hw, hh] = hole; p.moveTo(hx - hw / 2, 0.001); p.lineTo(hx - hw / 2, hh); p.lineTo(hx + hw / 2, hh); p.lineTo(hx + hw / 2, 0.001); p.lineTo(hx - hw / 2, 0.001); s.holes.push(p); }
    const geo = new THREE.ExtrudeGeometry(s, { depth: .16, bevelEnabled: false }); geo.translate(0, 0, -.16); const m = new THREE.Mesh(geo, [plaster, M(0xeee8de)]); m.receiveShadow = m.castShadow = true; g.add(m);
    rb(len, .1, .02, trim, 0, .05, .01, g, .005); const f = aoStrip(len, .3, { opacity: .18 }); f.rotation.x = -Math.PI / 2; f.rotation.z = Math.PI; f.position.set(0, .003, .15); g.add(f); return g; };
  side(L, x1, cz, -Math.PI / 2);                 // far side wall
  side(Wd, cx, z1, Math.PI, [0, 1.0, 2.15]);     // end wall with the front door
  side(Wd, cx, z0, 0);                            // near end
  // the shared wall (x0) is the living room's right wall; its +z run past the room continues as hallway wall
  { const zA = D / 2 + .2; rb(.16, HH, z1 - zA, plaster, x0 - .08, HH / 2, (zA + z1) / 2, G, .005);
    // hallway face of the living-room wall (its outer skin is siding): plaster panel with the doorway cut out
    const len = zA - z0, s = new THREE.Shape(); s.moveTo(-len / 2, 0); s.lineTo(len / 2, 0); s.lineTo(len / 2, HH); s.lineTo(-len / 2, HH); s.lineTo(-len / 2, 0);
    const hz = (z0 + zA) / 2 - DOOR.z, p = new THREE.Path(); p.moveTo(hz - DOOR.w / 2, .001); p.lineTo(hz - DOOR.w / 2, DOOR.h); p.lineTo(hz + DOOR.w / 2, DOOR.h); p.lineTo(hz + DOOR.w / 2, .001); p.lineTo(hz - DOOR.w / 2, .001); s.holes.push(p);
    const m = add(new THREE.ShapeGeometry(s), plaster, x0 + .002, 0, (z0 + zA) / 2, G); m.rotation.y = Math.PI / 2;
    for (const k of [-1, 1]) rb(.03, DOOR.h + .08, .08, trim, x0 + .015, (DOOR.h + .08) / 2, DOOR.z + k * (DOOR.w / 2 + .04), G, .008);
    rb(.03, .08, DOOR.w + .24, trim, x0 + .015, DOOR.h + .04, DOOR.z, G, .008); }
  const door = P.door({ w: .95, h: 2.1 }); door.group.position.set(cx, 0, z1 - .02); door.group.rotation.y = Math.PI; G.add(door.group); refs.frontDoor = door;
  const runner = H.runner({ w: .9, d: L - .8, color: 0x7e3f33 }); runner.position.set(cx, 0, cz + .2); G.add(runner);
  const cr = H.coatRack(); cr.position.set(x1 - .02, 0, cz + 1.4); cr.rotation.y = -Math.PI / 2; G.add(cr);
  const ph = H.frame({ w: .45, h: .6, draw: H.artSunset, color: 0x2a2c30 }); ph.position.set(x1 - .02, 1.5, cz - .8); ph.rotation.y = -Math.PI / 2; G.add(ph);
  const pl = phModel('potted_plant_02', { s: .9 }); pl.position.set(x1 - .45, 0, z1 - .55); G.add(pl);
  add(new THREE.CylinderGeometry(.18, .2, .04, 24), M(0xffffff, { emissive: 0xfff3dc, emissiveIntensity: .9 }), cx, HH - .02, cz, G, { shadow: false });
  const hl = new THREE.PointLight(0xfff2e0, 1.6, 5, 1.6); hl.position.set(cx, HH - .3, cz); G.add(hl); refs.hallLight = hl;
  refs.hall = { x0, x1, z0, z1 };
}

function sky(scene) {
  const url = new URL('../assets/ph/kloofendal_48d_partly_cloudy_puresky/kloofendal_48d_partly_cloudy_puresky.hdr', import.meta.url).href;
  scene.background = new THREE.Color(0xa8d0f2);
  const ldr = !!globalThis.SKY_LDR, load = ldr ? new THREE.TextureLoader().loadAsync(new URL('sky_ldr.jpg', url).href).then(t => (t.colorSpace = THREE.SRGBColorSpace, t))
    : import('three/addons/loaders/RGBELoader.js').then(({ RGBELoader }) => new RGBELoader().loadAsync(url));
  pending.push(load.then(t => { t.mapping = THREE.EquirectangularReflectionMapping; scene.background = t; scene.environment = t; scene.environmentIntensity = ldr ? .75 : .55; scene.backgroundRotation = new THREE.Euler(0, 1.2, 0); scene.environmentRotation = new THREE.Euler(0, 1.2, 0); }).catch(() => {}));
}
