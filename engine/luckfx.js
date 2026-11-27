// LUCK FX (Lucky Me, 2026-11-27). Every effect is a pure function of t (frames render out of order) and is built once.
//   const fx = luckFX(scene)
//   fx.poof(t0, [x, y, z], size)      the payout: green puff + bills popping up and fluttering down (size 1 = big gag, .45 = Jaden's small one)
//   fx.bolt(t0, [x, y, z], { seed })  lightning: jagged thick bolt from the cloud base, visible 2 frames on, 1 off, 2 on; returns flash(t) 0..1
//   fx.rain({ x, z, r, t0, t1, hole: [tHole, holeR] })  rain streaks in a column (a dry circle opens over the target at tHole)
//   fx.splash(t0, [x, y, z])          pool splash: white column + ring + drops
//   fx.spray(t0, t1, from, dir)       sprinkler / slushie jet: a stream of droplets
//   fx.update(t)                      call every frame; returns { flash } for the look to brighten on bolts
// Rules kept: no bloom wash, no freeze frames, no sub-pixel geometry (bolts are .1 m thick boxes, rain streaks .025 m wide).
import * as THREE from 'three';

const _vel = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const sm = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };

export function billTex() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 112; const g = c.getContext('2d');
  g.fillStyle = '#8fcf7e'; g.fillRect(0, 0, 256, 112); g.strokeStyle = '#2f6b2c'; g.lineWidth = 7; g.strokeRect(7, 7, 242, 98);
  g.fillStyle = '#d8f0c8'; g.beginPath(); g.ellipse(128, 56, 30, 36, 0, 0, 7); g.fill();
  g.fillStyle = '#2f6b2c'; g.font = '900 44px Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 128, 58);
  g.font = '900 26px Arial Black, sans-serif'; g.fillText('100', 40, 30); g.fillText('100', 216, 84);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function puffTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 8, 64, 64, 62); gr.addColorStop(0, 'rgba(225,255,215,1)'); gr.addColorStop(.55, 'rgba(120,220,110,.9)'); gr.addColorStop(1, 'rgba(70,170,70,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function luckFX(scene, groundAt = () => 0) {   // groundAt(x, z): the real surface height (the town grade is -.45, not 0)
  const root = new THREE.Group(); root.name = 'luckFX'; scene.add(root);
  const items = [];
  const BILL = new THREE.MeshStandardMaterial({ map: billTex(), side: THREE.DoubleSide, roughness: .8 }), billGeo = new THREE.PlaneGeometry(.16, .07);
  const PUFF = puffTex();

  // ---------- the payout poof ----------
  function poof(t0, at, size = 1) {
    const g = new THREE.Group(); g.position.set(...at); root.add(g);
    const nP = size > .7 ? 9 : 5, nB = size > .7 ? 26 : 9, puffs = [], bills = [];
    for (let i = 0; i < nP; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: PUFF, transparent: true, depthWrite: false })); g.add(m); puffs.push(m); }
    for (let i = 0; i < nB; i++) { const m = new THREE.Mesh(billGeo, BILL); m.castShadow = true; g.add(m); bills.push(m); }
    const seed = at[0] * 3.1 + at[2] * 7.7 + t0;
    items.push(t => {
      const u = t - t0; g.visible = u >= 0 && u < 2.6; if (!g.visible) return;
      puffs.forEach((m, i) => { const a = i / nP * 6.283 + rnd(seed + i), k = sm(u / .35), out = (.15 + .5 * k) * size;
        m.position.set(Math.cos(a) * out, (.1 + .35 * k + .15 * rnd(seed + i * 2)) * size, Math.sin(a) * out);
        const s = (.25 + .4 * k) * size * (.8 + .4 * rnd(seed + i * 3)); m.scale.set(s, s, s); m.material.opacity = (u < .25 ? .75 : Math.max(0, .75 - (u - .25) / .45)); });
      bills.forEach((m, i) => { const r1 = rnd(seed + i * 5), r2 = rnd(seed + i * 7), r3 = rnd(seed + i * 11), a = r1 * 6.283;
        const fl0 = groundAt(at[0], at[2]) - at[1], vUp = (2.2 + 1.6 * r2) * Math.sqrt(size), vOut = (.5 + .9 * r3) * size, tt = Math.max(0, u - .04 * (i % 4));
        const up = Math.min(tt, vUp / 9.8 * .7), fall = Math.max(0, tt - up);                         // rise ballistic, then flutter down slowly (paper)
        const y = .3 * size + vUp * up - 4.9 * up * up - .9 * fall + Math.sin(tt * 7 + i) * .05;
        m.position.set(Math.cos(a) * vOut * Math.min(tt, 1.2) + Math.sin(tt * 4 + i) * .08, Math.max(fl0 + .02, y), Math.sin(a) * vOut * Math.min(tt, 1.2));
        m.rotation.set(tt * (3 + 4 * r2) + i, tt * (2 + 3 * r3), Math.sin(tt * 5 + i) * .8); });
    });
    return g;
  }

  // ---------- lightning (rebuilt 2026-11-27, Xavier: "the thunder needs a lot of work", invisible at the Jaden strike) ----------
  // A real cloud-to-ground strike: a fat white-hot core with two layers of blue glow, a jagged main channel + forked branches,
  // ON long enough to read (.32 s with a re-strike flicker, then the glow dies over .2 s), a blinding ground-contact burst
  // (sprite + a real point light that lights the people) and the scene flash through post.exposure.
  const BOLT = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
  const GLOW1 = new THREE.MeshBasicMaterial({ color: '#b9ccff', transparent: true, opacity: .55, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const GLOW2 = new THREE.MeshBasicMaterial({ color: '#7f9cff', transparent: true, opacity: .12, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const BURST = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 2, 64, 64, 62);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(210,225,255,.9)'); g.addColorStop(.6, 'rgba(120,150,255,.35)'); g.addColorStop(1, 'rgba(80,110,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const flashes = [];
  function bolt(t0, at, { top = 22, seed = 1, branches = 3, light = 18, spread = 3 } = {}) {
    const g = new THREE.Group(); root.add(g); const glows = [];
    const seg = (a, b, w) => { const d = new THREE.Vector3().subVectors(b, a), L = d.length(); for (const [mat, k] of [[BOLT, 1], [GLOW1, 3.2], [GLOW2, 8]]) {
      const q = new THREE.Mesh(new THREE.BoxGeometry(w * k, L + w * k * .5, w * k), mat); q.position.copy(a).addScaledVector(d, .5); q.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()); g.add(q); } };
    const path = (from, to, n, w, s, taper = 1) => { let p = from.clone(); for (let i = 1; i <= n; i++) { const k = i / n, q = from.clone().lerp(to, k); if (i < n) { const amp = 1.6 * (1 - k * .5); q.x += (rnd(s + i) - .5) * amp; q.z += (rnd(s + i * 3) - .5) * amp; } seg(p, q, w * (1 - (1 - taper) * k)); p = q; } };
    const A = new THREE.Vector3(at[0] + (rnd(seed) - .5) * spread, at[1] + top, at[2] + (rnd(seed * 2) - .5) * spread), B = new THREE.Vector3(...at);
    path(A, B, 22, .11, seed, .7);
    for (let b = 0; b < branches; b++) { const k = .15 + .45 * rnd(seed + b * 9), s0 = A.clone().lerp(B, k); path(s0, s0.clone().add(new THREE.Vector3((rnd(seed + b) - .5) * 6, -3 - 4 * rnd(seed + b * 4), (rnd(seed + b * 6) - .5) * 6)), 7, .06, seed + b * 13, .3); }
    const burst = new THREE.Sprite(new THREE.SpriteMaterial({ map: BURST, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); burst.position.copy(B); g.add(burst);
    const pl = new THREE.PointLight('#cfdcff', 0, 14, 1.5); pl.position.copy(B).add(new THREE.Vector3(0, .6, 0)); root.add(pl);
    const env = t => { const u = t - t0; if (u < 0) return 0; if (u < .09) return 1; if (u < .13) return .15; if (u < .32) return 1 - .3 * Math.max(0, (u - .2) / .12); if (u < .52) return .7 * (1 - (u - .32) / .2); return 0; };
    items.push(t => { const e = env(t); g.visible = e > .02; pl.intensity = e * light; if (!g.visible) return;
      BOLT.opacity = 1; g.children.forEach(c => { if (c.material === BOLT) c.visible = e > .5; });
      burst.scale.setScalar(1.2 + 3.2 * e); burst.material.opacity = e; });
    flashes.push(t => env(t));
    return g;
  }

  // ---------- rain (instanced streaks in a column; a dry circle can open over the target) ----------
  function rain({ x, z, r = 9, h = 14, t0, t1, hole = null, stopFade = null, n = 1400 }) {
    // stopFade: [tStart, tEnd] -- an increasing FRACTION of every drop in the whole field (not just the sunbeam hole)
    // goes dry as t runs tStart->tEnd, so the rain visibly thins out and is gone everywhere by tEnd (Xavier: "it says
    // the rain stopped but it's still raining" -- the hole alone only ever cleared one small patch under the beam).
    const geo = new THREE.BoxGeometry(.025, .55, .025), mat = new THREE.MeshBasicMaterial({ color: '#c8d6e6', transparent: true, opacity: .55, depthWrite: false });
    const im = new THREE.InstancedMesh(geo, mat, n); im.frustumCulled = false; root.add(im); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(.12, 0, .05)), s1 = new THREE.Vector3(1, 1, 1), s0 = new THREE.Vector3(0, 0, 0), p = new THREE.Vector3();
    items.push(t => { im.visible = t >= t0 - .01 && t < t1; if (!im.visible) return;
      const hr = hole && t > hole[0] ? hole[1] * sm((t - hole[0]) / .6) : 0;
      const fadeFrac = stopFade ? sm((t - stopFade[0]) / (stopFade[1] - stopFade[0])) : 0;
      for (let i = 0; i < n; i++) { const a = rnd(i) * 6.283, rr = Math.sqrt(rnd(i * 3)) * r, px = x + Math.cos(a) * rr, pz = z + Math.sin(a) * rr, y = h - ((t * 11 + rnd(i * 7) * h) % h);
        const dry = rr < hr || rnd(i * 13) < fadeFrac; p.set(px, y, pz); m4.compose(p, q, dry ? s0 : s1); im.setMatrixAt(i, m4); }
      im.instanceMatrix.needsUpdate = true; });
    return im;
  }

  // ---------- splash (pool) ----------
  function splash(t0, at) {
    const g = new THREE.Group(); g.position.set(...at); root.add(g);
    const W = new THREE.MeshStandardMaterial({ color: '#eaf6ff', roughness: .2, transparent: true, opacity: .9 }), drops = [];
    const col = new THREE.Group();   // no solid column (read as a white bucket): the spray is all drops
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, .18, 8, 32).rotateX(Math.PI / 2), W); g.add(ring);
    for (let i = 0; i < 160; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.07 + .16 * rnd(i), 7, 5), W); g.add(m); drops.push(m); }
    items.push(t => { const u = t - t0; g.visible = u >= 0 && u < 2.2; if (!g.visible) return;
      const hgt = 4.5 * Math.sin(Math.min(1, u / .8) * Math.PI) + .01; 
      ring.scale.setScalar(1 + u * 3.2); ring.position.y = .05;
      drops.forEach((m, i) => { const a = rnd(i * 3) * 6.283, v = .6 + 2.6 * rnd(i * 5) ** 2, vu = 4 + 7 * rnd(i * 7); m.position.set(Math.cos(a) * v * u, Math.max(0, vu * u - 4.9 * u * u), Math.sin(a) * v * u); m.visible = vu * u - 4.9 * u * u > -.1; }); });
    return g;
  }

  // ---------- spray (sprinkler / slushie jet): droplets along a ballistic stream ----------
  function spray(t0, t1, from, dir, { color = '#d8ecff', n = 60, v = 4, size = .05, streak = false } = {}) {
    // streak: real water reads as thin glinting STREAKS stretched along their motion, not beads (Xavier: "just circles")
    const g = new THREE.Group(); root.add(g); const M = streak ? new THREE.MeshStandardMaterial({ color, roughness: .04, metalness: .1, transparent: true, opacity: .7, depthWrite: false, emissive: '#5a7a96', emissiveIntensity: .35 }) : new THREE.MeshStandardMaterial({ color, roughness: .15, transparent: true, opacity: .85 }), D = new THREE.Vector3(...dir).normalize(), P0 = new THREE.Vector3(...from), ds = [];
    const sg = new THREE.CylinderGeometry(size * .35, size * .2, 1, 5);
    for (let i = 0; i < n; i++) { const m = new THREE.Mesh(streak ? sg : new THREE.SphereGeometry(size * (.6 + .8 * rnd(i)), 6, 5), M); m.userData.streak = streak; g.add(m); ds.push(m); }
    items.push(t => { g.visible = t >= t0 && t < t1 + .6; if (!g.visible) return;
      ds.forEach((m, i) => { const life = .55, born = t0 + (i / n) * (t1 - t0 + life) - life + ((t * 0) % 1), age = ((t - t0 + i / n * life) % life); const k = age, sp = v * (.85 + .3 * rnd(i * 3));
        if (t - k > t1) { m.visible = false; return; } m.visible = true;
        m.position.set(P0.x + D.x * sp * k + (rnd(i * 5) - .5) * .15 * k, P0.y + D.y * sp * k - 4.9 * k * k, P0.z + D.z * sp * k + (rnd(i * 7) - .5) * .15 * k);
        if (m.userData.streak) { _vel.set(D.x * sp, D.y * sp - 9.8 * k, D.z * sp); const L = _vel.length(); m.quaternion.setFromUnitVectors(_up, _vel.normalize()); m.scale.set(1, Math.max(.04, L * .045), 1); } }); });
    return g;
  }

  // ---------- smoke (continuous small wisps off a moving point, e.g. Jaden's singed hair after the bolt) ----------
  const SMOKE = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    for (let i = 0; i < 14; i++) { const x = 64 + (rnd(i * 3) - .5) * 50, y = 64 + (rnd(i * 5) - .5) * 50, r = 18 + rnd(i * 7) * 26, gr = g.createRadialGradient(x, y, 1, x, y, r);
      gr.addColorStop(0, 'rgba(235,233,230,.42)'); gr.addColorStop(1, 'rgba(200,198,195,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }   // a cluster of soft puffs = a real wisp, not one round ball
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  function smoke(t0, t1, getAt, { n = 4, per = 1.2, size = .16, color = '#ffffff', alpha = .55 } = {}) {
    const g = new THREE.Group(); root.add(g); g.visible = false;
    const sprites = []; for (let i = 0; i < n; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: SMOKE, transparent: true, depthWrite: false, color })); g.add(m); sprites.push(m); }
    items.push(t => { g.visible = t >= t0 && t < t1; if (!g.visible) return;
      g.position.set(...getAt(t));
      sprites.forEach((m, i) => { const ph = ((t - t0 + i / n * per) % per) / per, k = sm(ph), drift = (rnd(i * 9) - .5) * .5;
        m.position.set((rnd(i * 3 + 1) - .5) * .1 + k * (.2 + drift), .05 + ph * 1.5 * size / .6, (rnd(i * 5 + 2) - .5) * .1 + k * drift * .5);   // rises, leans with a breeze, spreads
        m.scale.setScalar(size * (.35 + 1.3 * k)); m.material.rotation = i * 1.7 + ph * (rnd(i) - .5) * 2;
        m.material.opacity = alpha * Math.min(1, ph * 6) * Math.pow(1 - ph, 1.4); }); });
    return g;
  }

  // ---------- shatter (Xavier 2026-11-27: the hook pot must visibly BREAK on his head): terracotta shards + soil + leaves ----------
  // Shards are irregular flattened chips (a real broken clay pot: curved wall pieces ~4-9 cm), ballistic, bounce once and settle.
  function shatter(t0, at, { n = 26, color = '#b4552e', inner = '#7e3a1f', soil = '#3b2a1c', leaf = '#3f7a2e', v = 3.2 } = {}) {
    const g = new THREE.Group(); g.position.set(...at); root.add(g);
    const outM = new THREE.MeshStandardMaterial({ color, roughness: .85 }), inM = new THREE.MeshStandardMaterial({ color: inner, roughness: .9 }), soilM = new THREE.MeshStandardMaterial({ color: soil, roughness: 1 }), leafM = new THREE.MeshStandardMaterial({ color: leaf, roughness: .7, side: THREE.DoubleSide });
    const ps = [];
    for (let i = 0; i < n; i++) { const s = .035 + .06 * rnd(i * 3 + 1), geo = new THREE.DodecahedronGeometry(s, 0); geo.scale(1, .28 + .2 * rnd(i), .8 + .4 * rnd(i * 2)); const m = new THREE.Mesh(geo, i % 3 ? outM : inM); m.castShadow = true; g.add(m); ps.push({ m, kind: 0, s }); }
    for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.012 + .02 * rnd(i * 9), 5, 4), soilM); g.add(m); ps.push({ m, kind: 1 }); }
    for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.09, .045), leafM); g.add(m); ps.push({ m, kind: 2 }); }
    items.push(t => { const u = t - t0; g.visible = u >= 0 && u < 3; if (!g.visible) return;
      ps.forEach((p, i) => { const a = rnd(i * 7 + 3) * 6.283, sp = v * (.35 + .8 * rnd(i * 11)) * (p.kind === 2 ? .5 : 1), vu = (1.2 + 2.6 * rnd(i * 13)) * (p.kind === 2 ? .6 : 1);
        const floorY = groundAt(at[0], at[2]) - at[1] + (p.kind === 0 ? p.s * .25 : .01), drag = p.kind === 2 ? 2.2 : p.kind === 1 ? .4 : 0;
        let tt = u, x = Math.cos(a) * sp * tt / (1 + drag * tt), z = Math.sin(a) * sp * tt / (1 + drag * tt), y = vu * tt - 4.9 * tt * tt * (p.kind === 2 ? .35 : 1);
        if (y < floorY) { y = floorY; }   // lands and stays (no rubber bounce: clay chips skid and stop)
        p.m.position.set(x, y, z); const spin = y <= floorY ? 0 : tt; p.m.rotation.set(i + spin * (6 + 8 * rnd(i)), i * 2 + spin * 5, spin * 4); }); });
    return g;
  }

  // ---------- cash rain (a payout that FILLS the frame: bills tumbling down around a person for a while) ----------
  function cashRain(t0, t1, at, { r = 1.1, n = 70, top = 3.2 } = {}) {
    const g = new THREE.Group(); g.position.set(...at); root.add(g); const bs = [];
    for (let i = 0; i < n; i++) { const m = new THREE.Mesh(billGeo, BILL); m.castShadow = true; g.add(m); bs.push(m); }
    items.push(t => { const u = t - t0; g.visible = u >= 0 && t < t1 + 1.6; if (!g.visible) return;
      bs.forEach((m, i) => { const born = (i / n) * Math.max(.2, t1 - t0), age = u - born; if (age < 0) { m.visible = false; return; } m.visible = true;
        const a = rnd(i * 3 + 5) * 6.283, rr = Math.sqrt(rnd(i * 7 + 1)) * r, y = top - age * (1.1 + .5 * rnd(i)) + Math.sin(age * 6 + i) * .04;
        m.position.set(Math.cos(a) * rr + Math.sin(age * 3.1 + i) * .12, Math.max(groundAt(at[0], at[2]) - at[1] + .01, y), Math.sin(a) * rr + Math.cos(age * 2.7 + i) * .12);
        m.rotation.set(age * (2.5 + 3 * rnd(i)) + i, age * 2 + i * .5, Math.sin(age * 4 + i) * .9); }); });
    return g;
  }

  // ---------- fire (a car / object ablaze after the strike): flickering orange flame sprites + a dark smoke column ----------
  // FLAME (redone 2026-11-27, Xavier: "glowing balls"): a real flame TONGUE -- narrow teardrop, white-yellow core, orange body,
  // red ragged tip -- drawn as a tall sprite and stretched further upward per particle, so a blaze reads as licking flames.
  const FLAME = (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 256; const x = c.getContext('2d');
    const tongue = (w, h, col) => { x.beginPath(); x.moveTo(64, 250); x.bezierCurveTo(64 - w, 240, 64 - w * 1.1, 150, 64 - w * .35, 90); x.bezierCurveTo(64 - w * .15, 60, 58, 30, 64, 256 - h);
      x.bezierCurveTo(70, 30, 64 + w * .2, 60, 64 + w * .35, 90); x.bezierCurveTo(64 + w * 1.1, 150, 64 + w, 240, 64, 250); x.closePath(); x.fillStyle = col; x.fill(); };
    x.filter = 'blur(6px)'; tongue(58, 250, 'rgba(200,40,8,.55)'); x.filter = 'blur(4px)'; tongue(46, 220, 'rgba(255,110,20,.85)'); x.filter = 'blur(3px)'; tongue(30, 170, 'rgba(255,190,60,.95)'); x.filter = 'blur(4px)'; tongue(16, 110, 'rgba(255,248,210,1)');
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  function fire(t0, t1, at, { w = 1.6, d = .8, n = 70, h = 1.4, burst = 1 } = {}) {
    const g = new THREE.Group(); g.position.set(...at); root.add(g); const fl = [], sm_ = [];
    for (let i = 0; i < n; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: FLAME, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); g.add(m); fl.push(m); }
    for (let i = 0; i < 12; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: SMOKE, transparent: true, depthWrite: false, color: '#3a3836' })); g.add(m); sm_.push(m); }
    items.push(t => { const u = t - t0; g.visible = u >= 0 && t < t1; if (!g.visible) return;
      const b = burst * Math.max(0, 1 - u / .35);   // the first .35 s: a big fireball that collapses into a steady blaze
      fl.forEach((m, i) => { const per = .35 + .25 * rnd(i), ph = ((u + rnd(i * 3) * per) % per) / per, sz = (.22 + .28 * rnd(i * 13)) * (1 + b * 1.6);
        m.position.set((rnd(i * 5) - .5) * w * (1 + b * .6) + Math.sin(u * 9 + i) * .04, .05 + ph * h * (.35 + .4 * rnd(i * 7)) + b * .8 * rnd(i * 9), (rnd(i * 11) - .5) * d * (1 + b * .6));
        m.scale.set(sz * (1 - ph * .5), sz * (2.1 + .8 * rnd(i * 17)) * (1 - ph * .35), 1); m.material.rotation = Math.sin(u * 7 + i * 2) * .12; m.material.opacity = Math.min(1, u * 12) * Math.sin(Math.PI * Math.min(1, ph * 1.4 + .05)) * .95; });
      sm_.forEach((m, i) => { const per = 1.6, ph = ((u + i / 12 * per) % per) / per; m.position.set((rnd(i * 3) - .5) * w * .5 + ph * .4, .9 + ph * 3.2, (rnd(i * 4) - .5) * d * .5);
        m.scale.setScalar(.6 + ph * 1.8); m.material.opacity = Math.min(1, u * 3) * .55 * (1 - ph); }); });
    return g;
  }

  return { root, poof, bolt, rain, splash, spray, smoke, shatter, cashRain, fire,
    update: t => { for (const f of items) f(t); let fl = 0; for (const f of flashes) fl = Math.max(fl, f(t)); return { flash: fl }; } };
}

// CASH FAN: five bills fanned out from a grip point (held in a hand); origin = the grip
export function cashFan() {
  const g = new THREE.Group(), M = new THREE.MeshStandardMaterial({ map: billTex(), side: THREE.DoubleSide, roughness: .8 }), geo = new THREE.PlaneGeometry(.16, .07).translate(.07, 0, 0);
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(geo, M); m.rotation.z = -.5 + i * .25; m.position.z = i * .002; m.castShadow = true; g.add(m); }
  g.name = 'cash fan'; return g;
}
