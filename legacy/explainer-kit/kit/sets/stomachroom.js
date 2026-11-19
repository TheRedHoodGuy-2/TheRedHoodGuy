// STOMACH ROOM (reusable micro-world, cartoon, growl video 2026-10-26): the inside of an EMPTY stomach run by a hard-hat
// crew. Coral-pink wet walls with stomach folds, a glossy floor with puddles, the GUT TUBE running wall to wall (the crew
// squeezes it, a wave travels along it), an empty wooden FOOD crate, traffic cones + a CREW AT WORK sign, a hanging
// STOMACH 0% FULL sign, a giant red DRUM (gold hoops, tension rods) that gets whacked, a floating GAS BUBBLE.
// Built far from every set (default x = 600). Every moving part is a pure function of what you pass to set():
//   const R = buildStomachRoom(scene, { at: [600, 0, 0] })
//   R.set({ t, squeeze: 0..1, pinch: [x, ...] (where hands squeeze, local x), bubble: [x, y, z] | null, squash: 0..1,
//           boom: seconds since the drum hit (-1 = none) })
//   R.spots { tubeFront, drum, crate, wide }, R.drumTop (local), R.tubeAt(x) -> local point on the tube axis
// Room: 9.2 wide (x), 7.2 deep (z), 3.4 high. Camera looks in from +z.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, sph, canvasTex } from '../util.js';

export function buildStomachRoom(scene, { at = [600, 0, 0] } = {}) {
  const G = grp(...at, scene), RX = 4.6, RZ = 3.6, H = 3.4, refs = { group: G };
  // ---------- walls: coral with stomach folds (wavy ridges running round the room), wet sheen ----------
  const folds = canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#ff9484'; g.fillRect(0, 0, w, h);
    const R = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    for (let row = 0; row < 9; row++) { const y0 = 30 + row * 56 + R() * 10; g.lineCap = 'round';
      for (const [col, lw, dy] of [['#e5646c', 22, 0], ['#ffb6a6', 7, -9]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
        for (let x = 0; x <= w; x += 16) { const y = y0 + dy + Math.sin(x * .018 + row * 1.7) * 14 + Math.sin(x * .051 + row) * 5; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } }
    g.globalAlpha = .22; g.fillStyle = '#fff'; for (let i = 0; i < 60; i++) { g.beginPath(); g.ellipse(R() * w, R() * h, 6 + R() * 14, 3 + R() * 6, 0, 0, 7); g.fill(); }
  }, [3, 1.2]);
  const wallM = M(0xffffff, { map: folds, roughness: .32 });
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(RX, RX, H + .4, 64, 1, true), wallM); wallM.side = THREE.BackSide;
  shell.scale.set(1, 1, RZ / RX); shell.position.y = (H + .4) / 2 - .2; shell.receiveShadow = true; G.add(shell);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(RX, 64, 16, 0, Math.PI * 2, 0, Math.PI / 2), wallM); dome.scale.set(1, .35, RZ / RX); dome.position.y = H + .2; G.add(dome);
  const floor = add(new THREE.CircleGeometry(RX, 64), new THREE.MeshPhysicalMaterial({ color: 0xe0707c, roughness: .35, clearcoat: .8, clearcoatRoughness: .15 }), 0, 0, 0, G); floor.rotation.x = -Math.PI / 2; floor.scale.set(1, RZ / RX, 1);
  for (const [x, z, r] of [[-1.2, 1.6, .5], [1.0, 2.2, .35], [-3, -.4, .45], [2.9, -1.8, .4], [.2, .1, .3]]) { const p = add(new THREE.CircleGeometry(r, 32), new THREE.MeshPhysicalMaterial({ color: 0xff9aa6, roughness: .05, clearcoat: 1 }), x, .004, z, G, { shadow: false }); p.rotation.x = -Math.PI / 2; p.scale.set(1, .6, 1); }
  // ---------- the gut tube: segments along a sagging curve, wall to wall, collars where it enters the walls ----------
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-RX - .3, .95, -1.3), new THREE.Vector3(-2, .78, -1.0), new THREE.Vector3(0, .72, -.9), new THREE.Vector3(2, .78, -1.0), new THREE.Vector3(RX + .3, .95, -1.3)]);
  const tubeR = .34, N = 34, segs = [], tubeA = M(0xff7f9b, { roughness: .3 }), tubeB = M(0xf06d8c, { roughness: .3 });
  for (let i = 0; i < N; i++) { const u = (i + .5) / N, p = curve.getPointAt(u), tg = curve.getTangentAt(u), len = curve.getLength() / N * 1.04;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(tubeR, tubeR, len, 24, 1, true), i % 2 ? tubeA : tubeB); m.castShadow = m.receiveShadow = true;
    m.position.copy(p); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg); G.add(m); segs.push({ m, x: p.x }); }
  for (const s of [-1, 1]) { const p = curve.getPointAt(s < 0 ? .015 : .985), c = add(new THREE.TorusGeometry(tubeR + .08, .09, 12, 32), M(0xd9566e, { roughness: .35 }), p.x, p.y, p.z, G); c.rotation.y = Math.PI / 2; }
  refs.tubeAt = x => { let best = segs[0]; for (const s of segs) if (Math.abs(s.x - x) < Math.abs(best.x - x)) best = s; return best.m.position.clone(); };
  // ---------- empty FOOD crate (wood, the only texture), tipped open, a few crumbs ----------
  const wood = new THREE.TextureLoader().load(new URL('kit/assets/ph/laminate_floor_02/diffuse.jpg', document.baseURI).href); wood.colorSpace = THREE.SRGBColorSpace; wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(.6, .6);
  const crateM = new THREE.MeshPhysicalMaterial({ map: wood, color: 0xffd9a8, roughness: .5, clearcoat: .4 }), crate = grp(-2.5, 0, .7, G); crate.rotation.y = .5;
  rb(.9, .06, .7, crateM, 0, .03, 0, crate, .01);
  for (const [w, d, x, z] of [[.9, .05, 0, .33], [.9, .05, 0, -.33], [.05, .7, .43, 0], [.05, .7, -.43, 0]]) for (let k = 0; k < 3; k++) rb(w, .14, d, crateM, x, .12 + k * .17, z, crate, .01);
  const lab = canvasTex(256, 96, (g, w, h) => { g.fillStyle = '#ffd14f'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = '800 64px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FOOD', w / 2, h / 2 + 3); });
  add(new THREE.PlaneGeometry(.42, .16), new THREE.MeshBasicMaterial({ map: lab, toneMapped: false }), 0, .32, .36, crate, { shadow: false });
  for (let i = 0; i < 4; i++) add(sph(.025), M(0xe6a95c), -.2 + i * .13, .08, -.1 + (i % 2) * .15, crate);
  // ---------- crew stuff: cones, CREW AT WORK A-frame, hanging work lamps ----------
  const coneM = M(0xff7a1a, { roughness: .45 }), white = M(0xfafafa, { roughness: .4 });
  for (const [x, z] of [[-3.4, 1.4], [-1.4, 2.4], [3.3, 1.6]]) { const c = grp(x, 0, z, G); rb(.36, .04, .36, coneM, 0, .02, 0, c, .01); add(cyl(.03, .14, .5, 24), coneM, 0, .29, 0, c); add(cyl(.075, .1, .08, 24), white, 0, .28, 0, c); }
  { const s = grp(-3.6, 0, -.2, G); s.rotation.y = .7; const sign = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#ffd14f'; g.fillRect(0, 0, w, h); g.strokeStyle = '#222'; g.lineWidth = 14; g.strokeRect(10, 10, w - 20, h - 20); g.fillStyle = '#222'; g.font = '800 54px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; ['CREW', 'AT', 'WORK'].forEach((t, i) => g.fillText(t, w / 2, 78 + i * 62)); });
    for (const k of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.6, .7, .03), [M(0x333333), M(0x333333), M(0x333333), M(0x333333), new THREE.MeshStandardMaterial({ map: sign, roughness: .5 }), new THREE.MeshStandardMaterial({ map: sign, roughness: .5 })]); p.position.set(0, .38, k * .12); p.rotation.x = k * .18; p.castShadow = true; s.add(p); } }
  const bulbs = [];
  for (const x of [-1.8, 1.8]) { const l = grp(x, H - .1, .3, G); add(cyl(.008, .008, .8, 6), M(0x333333), 0, -.4, 0, l); add(cyl(.06, .22, .2, 24, 1, true), M(0xffd14f, { roughness: .4, side: THREE.DoubleSide }), 0, -.85, 0, l);
    bulbs.push(add(sph(.06), new THREE.MeshBasicMaterial({ color: 0xfff2c8 }), 0, -.92, 0, l, { shadow: false })); }
  // ---------- hanging STOMACH sign ----------
  { const st = canvasTex(768, 192, (g, w, h) => { g.fillStyle = '#2c3e66'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 34); g.fill(); g.fillStyle = '#ffd14f'; g.font = '800 92px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STOMACH', w * .36, h / 2 + 4); g.fillStyle = '#ff6b6b'; g.font = '800 56px Fredoka, Arial Black, sans-serif'; g.fillText('0% FULL', w * .8, h / 2 + 4); });
    const s = grp(0, 2.55, -RZ + .55, G); add(new THREE.PlaneGeometry(2.0, .5), new THREE.MeshBasicMaterial({ map: st, toneMapped: false, transparent: true }), 0, 0, 0, s, { shadow: false });
    for (const x of [-.8, .8]) add(cyl(.01, .01, .6, 6), M(0x555555), x, .55, 0, s); }
  // ---------- the giant drum: red shell, white heads, gold hoops, tension rods, three short legs ----------
  const D = grp(2.2, 0, .5, G), DR = .8, DH = .8, DY = .22, gold = M(0xffc83a, { roughness: .25, metalness: .6 });
  add(cyl(DR, DR, DH, 48), M(0xe23b3b, { roughness: .35, physical: true, clearcoat: 1 }), 0, DY + DH / 2, 0, D);
  for (const y of [DY, DY + DH]) { const h = add(new THREE.TorusGeometry(DR + .02, .045, 12, 48), gold, 0, y, 0, D); h.rotation.x = Math.PI / 2; }
  const head = add(new THREE.CircleGeometry(DR - .01, 48), M(0xfaf6ee, { roughness: .5 }), 0, DY + DH + .006, 0, D); head.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; add(cyl(.018, .018, DH - .1, 8), gold, Math.cos(a) * (DR + .03), DY + DH / 2, Math.sin(a) * (DR + .03), D); }
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + .3, l = add(cyl(.03, .03, DY + .1, 8), M(0x333a44, { metalness: .5, roughness: .4 }), Math.cos(a) * DR * .8, (DY + .1) / 2 - .05, Math.sin(a) * DR * .8, D); l.rotation.z = Math.cos(a) * .15; }
  refs.drum = D; refs.drumTop = new THREE.Vector3(2.2, DY + DH, .5);
  const rings = [0, 1].map(() => { const r = add(new THREE.TorusGeometry(1, .03, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, toneMapped: false }), 2.2, DY + DH + .05, .5, G, { shadow: false }); r.rotation.x = Math.PI / 2; return r; });
  // ---------- the gas bubble ----------
  const bub = grp(0, 1.5, 0, G);
  add(sph(.5), new THREE.MeshPhysicalMaterial({ color: 0xa8f0b8, roughness: .05, transparent: true, opacity: .72, clearcoat: 1, depthWrite: false }), 0, 0, 0, bub, { shadow: false });
  add(sph(.1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9 }), -.19, .22, .36, bub, { shadow: false });
  refs.bubble = bub;
  // ---------- light: warm key from above (shadows), pink fill, nothing dark ----------
  const key = new THREE.SpotLight(0xfff0dd, 60, 14, 1.0, .6, 1.2); key.position.set(.8, H + .2, 2.2); key.target.position.set(0, .4, -.3); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); G.add(key, key.target);
  const fill = new THREE.PointLight(0xffd6e2, 10, 12, 1.1); fill.position.set(0, 2.2, 2.4); G.add(fill);
  const back = new THREE.PointLight(0xffe2b8, 6, 9, 1.2); back.position.set(0, 2.4, -2.2); G.add(back);
  refs.lights = [key, fill, back];
  // ---------- state ----------
  refs.set = ({ t = 0, squeeze = 0, pinch = [], bubble = null, squash = 0, boom = -1 } = {}) => {
    const wave = -RX + ((t * 2.6) % (2 * RX + 1));
    for (const s of segs) { let k = 1 - .3 * squeeze * Math.exp(-((s.x - wave) ** 2) / .5) + .12 * squeeze * Math.exp(-((s.x - wave - .9) ** 2) / .4);
      for (const [i, px] of pinch.entries()) k -= .32 * squeeze * Math.exp(-((s.x - px) ** 2) / .08) * (.6 + .4 * Math.sin(t * 7 + i * 2));
      s.m.scale.set(k, 1, k); }
    bub.visible = !!bubble; if (bubble) { bub.position.set(...bubble); bub.scale.set(1 + squash * .35, 1 - squash * .4, 1 + squash * .35); }
    const b = boom; head.scale.set(1, 1, 1); head.position.y = DY + DH + .006 - (b >= 0 ? .05 * Math.exp(-b * 9) : 0);
    D.scale.setScalar(b >= 0 ? 1 + .06 * Math.exp(-b * 7) * Math.cos(b * 40) : 1);
    rings.forEach((r, i) => { const u = b - i * .12; r.visible = b >= 0 && u > 0 && u < .9; if (r.visible) { const s = DR + u * 6; r.scale.set(s, s, 1); r.material.opacity = .8 * (1 - u / .9); } });
    bulbs.forEach((l, i) => { l.parent.rotation.z = b >= 0 ? .25 * Math.exp(-b * 2) * Math.sin(b * 9 + i) : .03 * Math.sin(t * 1.3 + i); });
  };
  refs.spots = {
    wide: { p: [at[0], 2.2, at[2] + 3.4], l: [at[0], .9, at[2] - .9], fov: 58 },
    tubeFront: { p: [at[0] - .4, 1.35, at[2] + 2.0], l: [at[0], .85, at[2] - 1.0], fov: 46 },
    drum: { p: [at[0] + 1.3, 1.5, at[2] + 2.6], l: [at[0] + 2.2, 1.1, at[2] + .3], fov: 44 },
  };
  refs.set({});
  return refs;
}
