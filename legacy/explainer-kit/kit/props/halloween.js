// HALLOWEEN PROPS (spider prank video): the pipe-cleaner spider that builds itself step by step, a hot glue gun,
// a pumpkin candy bucket full of wrapped sweets. Real-world scale (metres); `scale` options blow them up for readability.
import * as THREE from 'three';
import { M, add, grp, cyl, sph, canvasTex, rng, rboxGeo, clamp, smooth, lerp } from '../util.js';

// fuzzy chenille texture: dark fibres with lighter tips, wound around the wire
const fuzzTex = (base = '#151515', tip = '#4a4a4a') => canvasTex(256, 64, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); const r = rng(5);
  for (let i = 0; i < 2600; i++) { const x = r() * w, y = r() * h, l = 2 + r() * 6, a = -.9 + r() * .5; g.strokeStyle = r() < .55 ? tip : '#060606'; g.globalAlpha = .35 + r() * .5; g.lineWidth = .8 + r() * .8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
}, [8, 1]);

// ---------- the spider ----------
// state: { lay: 0..1 cleaners dropped onto the table, twist: 0..1, bend: 0..1, glue: 0..1, pom: 0..1, eyeL, eyeR: 0..1, legT: seconds (leg twitch) }
export function spider({ scale = 1, len = .3, r = .0055 } = {}) {
  const g = new THREE.Group(), inner = grp(0, 0, 0, g); inner.scale.setScalar(scale);
  const fur = M(0xffffff, { map: fuzzTex(), roughness: 1, unique: true });
  const cleaners = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), fur); m.castShadow = true; m.receiveShadow = true; inner.add(m); return m; });
  // the knot where they twist together
  const knot = add(new THREE.TorusGeometry(.012, .007, 8, 20), fur, 0, 0, 0, inner); knot.rotation.x = Math.PI / 2;
  const glue = add(sph(.022, 0, Math.PI * 2, 0, Math.PI / 2), M(0xf3f6f2, { physical: true, transmission: .3, roughness: .15, transparent: true, opacity: .85 }), 0, 0, 0, inner);
  // pom-pom: lumpy sphere with long fur
  const pg = new THREE.SphereGeometry(.036, 40, 28), P = pg.attributes.position, v = new THREE.Vector3(), R = rng(9);
  for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); v.multiplyScalar(1 + (R() - .5) * .14); P.setXYZ(i, v.x, v.y, v.z); } pg.computeVertexNormals();
  const pom = add(pg, M(0xffffff, { map: fuzzTex('#121212', '#3a3a3a'), roughness: 1, unique: true }), 0, 0, 0, inner); pom.scale.set(1, .85, 1.1);
  const bead = M(0xd8141c, { physical: true, roughness: .08, clearcoat: 1, metalness: 0 });
  const eyes = [-1, 1].map(s => { const e = add(sph(.0085), bead, 0, 0, 0, inner); e.userData.s = s; const glint = add(sph(.0025), M(0xffffff, { emissive: 0xffffff, emissiveIntensity: .6 }), .003, .004, .007, e, { shadow: false }); return e; });
  let lastKey = '';
  // centreline of cleaner i (angle a) at state; 64 points from one leg tip to the other
  function curve(i, S) {
    const N = 64, pts = [], fan = smooth(S.twist), bend = smooth(S.bend);
    const a0 = 0, a1 = i / 4 * Math.PI + Math.PI / 8, a = lerp(a0, a1, fan), off = lerp((i - 1.5) * .03, 0, fan);
    const lift = bend * .042, half = len / 2;
    for (let k = 0; k < N; k++) {
      const s = -half + len * k / (N - 1), u = Math.abs(s) / half, sg = Math.sign(s) || 1;
      // flat: lying on the table. bent: up to a knee then down to the floor tip, legs sweep forward / back a little
      const fr = s, fy = r;
      const kneeU = .42, kr = .072, ky = .07;
      let br, by; if (u < kneeU) { const q = u / kneeU; br = q * kr; by = lift + Math.sin(q * Math.PI / 2) * (ky - lift + .012); }
      else { const q = (u - kneeU) / (1 - kneeU); br = kr + q * .06; by = (ky + .012) * (1 - q) ** 1.6 + r; }
      const sweep = bend * (i - 1.5) * .12 * u;   // front legs reach forward, back legs back
      // twitch: legs flex at the tips
      const tw = S.legT ? Math.sin(S.legT * 22 + i * 1.7 + (sg > 0 ? 0 : 2)) * .012 * u * u : 0;
      const rr = lerp(Math.abs(fr), br, bend) * sg, yy = lerp(fy, by, bend) + tw;
      const aa = a + sweep * sg;
      pts.push(new THREE.Vector3(Math.cos(aa) * rr, yy, Math.sin(aa) * rr + off * (1 - bend)));
      // twist: in the middle the wires wrap round each other
      if (u < .08 && fan > 0) { const w = (1 - u / .08) * fan * .006; const p = pts[pts.length - 1]; p.x += Math.cos(i * 1.6) * w; p.z += Math.sin(i * 1.6) * w; }
    }
    return new THREE.CatmullRomCurve3(pts);
  }
  g.set = S => {
    S = { lay: 1, twist: 0, bend: 0, glue: 0, pom: 0, eyeL: 0, eyeR: 0, legT: 0, ...S };
    const key = [S.twist, S.bend, S.legT].map(x => (+x).toFixed(3)).join();
    if (key !== lastKey) { lastKey = key; cleaners.forEach((m, i) => { m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(curve(i, S), 96, r, 8, false); }); }
    // dropping in: cleaners fall from above, staggered
    cleaners.forEach((m, i) => { const k = clamp((S.lay - i * .12) / .64), b = 1 - k; m.position.set(0, b * b * .25, 0); m.rotation.z = b * (i % 2 ? .3 : -.3); m.visible = S.lay > i * .12; });
    const bodyY = smooth(S.bend) * .042 + r;
    knot.visible = S.twist > .05; knot.scale.setScalar(smooth(S.twist)); knot.position.y = bodyY + .002;
    glue.visible = S.glue > 0 && S.pom < 1; glue.scale.setScalar(smooth(S.glue)); glue.position.y = bodyY + .006;
    const pk = clamp(S.pom), drop = 1 - smooth(pk); pom.visible = pk > 0; pom.position.set(0, bodyY + .03 + drop * .18, -.005); pom.rotation.y = drop * 2;
    const squash = pk > .8 ? 1 - Math.sin((pk - .8) / .2 * Math.PI) * .12 : 1; pom.scale.set(1 / Math.sqrt(squash), .85 * squash, 1.1 / Math.sqrt(squash));
    eyes.forEach(e => { const k = clamp(e.userData.s < 0 ? S.eyeL : S.eyeR), pop = k <= 0 ? 0 : 1 + Math.sin(Math.min(1, k) * Math.PI) * .35 * (1 - k);
      e.visible = k > 0; e.scale.setScalar(Math.max(.001, pop)); e.position.set(e.userData.s * .012, bodyY + .045, .033); });
  };
  g.set({});
  return g;
}

// a single loose pipe cleaner (for the "grab four" handful)
export function pipeCleaner({ len = .3, r = .0055, bend = 0 } = {}) {
  const pts = []; for (let k = 0; k < 24; k++) { const s = -len / 2 + len * k / 23; pts.push(new THREE.Vector3(s, Math.sin(k / 23 * Math.PI) * bend, 0)); }
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, r, 8, false), M(0xffffff, { map: fuzzTex(), roughness: 1, unique: true })); m.castShadow = true; return m;
}

// ---------- hot glue gun (pointing +x, ~0.2 m long). Returns group with .trigger (0..1) setter ----------
export function glueGun({ scale = 1 } = {}) {
  const g = new THREE.Group(), s = grp(0, 0, 0, g); s.scale.setScalar(scale);
  const body = M(0x4fb3e8, { roughness: .45 }), dark = M(0x2b2f36, { roughness: .5 }), metal = M(0xc9ccd1, { metalness: .9, roughness: .3 });
  add(rboxGeo(.15, .05, .04, .018), body, 0, .1, 0, s);
  const hd = add(rboxGeo(.04, .1, .035, .012), body, -.035, .045, 0, s); hd.rotation.z = -.25;
  add(rboxGeo(.03, .012, .036, .005), dark, -.045, .0, 0, s);
  const trig = add(rboxGeo(.012, .04, .014, .004), dark, .0, .06, 0, s); trig.rotation.z = -.2;
  const noz = add(cyl(.004, .011, .04, 16), metal, .095, .1, 0, s); noz.rotation.z = -Math.PI / 2;
  add(cyl(.0025, .0025, .012, 10).rotateZ(-Math.PI / 2), metal, .118, .1, 0, s);
  const stick = add(cyl(.0055, .0055, .09, 16), M(0xf4f6f0, { physical: true, transmission: .4, roughness: .2, transparent: true, opacity: .9 }), -.11, .1, 0, s); stick.rotation.z = Math.PI / 2;
  add(cyl(.0015, .0015, .03, 6), dark, -.055, -.02, 0, s).rotation.z = .3;   // cord stub
  // glue string coming out of the nozzle
  const bead = add(sph(.006), M(0xf3f6f2, { physical: true, transmission: .3, roughness: .15, transparent: true, opacity: .85 }), .125, .097, 0, s);
  g.trigger = k => { trig.position.x = -.008 * k; bead.scale.set(1, 1 + k * 1.5, 1); bead.visible = k > .1; };
  g.trigger(0); return g;
}

// ---------- pumpkin candy bucket (orange plastic jack-o-lantern) with wrapped candies ----------
const CANDY = [0xe53935, 0xfdd835, 0x43a047, 0x8e24aa, 0x1e88e5, 0xfb8c00, 0xf06292, 0xffffff];
export function candy(color, R) {
  const g = new THREE.Group(), m = M(color, { physical: true, roughness: .25, clearcoat: .8 });
  add(cyl(.011, .011, .03, 16).rotateZ(Math.PI / 2), m, 0, 0, 0, g);
  for (const s of [-1, 1]) { const c = add(new THREE.ConeGeometry(.012, .016, 10).rotateZ(s * Math.PI / 2), m, s * .022, 0, 0, g); c.scale.set(1, 1, .5); }
  add(cyl(.0113, .0113, .006, 16).rotateZ(Math.PI / 2), M(0xffffff, { roughness: .4 }), 0, 0, 0, g);   // label band
  g.rotation.set(R() * 3, R() * 3, R() * 3); return g;
}
export function candyBucket({ scale = 1, count = 46 } = {}) {
  const g = new THREE.Group(), s = grp(0, 0, 0, g); s.scale.setScalar(scale);
  const H = .24, Rr = .15, pts = [];
  for (let k = 0; k <= 24; k++) { const u = k / 24, y = u * H; let rr = Rr * Math.sin(.35 + u * 2.3) / Math.sin(.35 + .5 * 2.3) * .98; if (u < .05) rr *= u / .05 * .2 + .8; if (u > .92) rr = Math.max(rr, Rr * .78); pts.push(new THREE.Vector2(Math.max(.001, rr), y)); }
  const geo = new THREE.LatheGeometry(pts, 64), P = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const a = Math.atan2(v.z, v.x), rib = 1 - .045 * Math.pow(Math.abs(Math.cos(a * 5)), 6); P.setXYZ(i, v.x * rib, v.y, v.z * rib); }
  geo.computeVertexNormals();
  // face painted on the canvas (u runs round, v up). Front (+z) is u = 0.25 on a three.js lathe
  const face = canvasTex(1024, 512, (c, w, h) => {
    c.fillStyle = '#ff7a12'; c.fillRect(0, 0, w, h);
    const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(120,40,0,.25)'); gr.addColorStop(.5, 'rgba(255,170,60,.08)'); gr.addColorStop(1, 'rgba(120,40,0,.3)'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const cx = w * .75, cy = h * .45; c.fillStyle = '#1b0f08';
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(cx + sx * 60, cy - 120); c.lineTo(cx + sx * 115, cy - 30); c.lineTo(cx + sx * 15, cy - 30); c.closePath(); c.fill(); }
    c.beginPath(); c.moveTo(cx - 130, cy + 40); c.quadraticCurveTo(cx, cy + 170, cx + 130, cy + 40);
    for (let i = 0; i <= 6; i++) { const x = cx + 130 - i * 43, y = cy + 40 + (i % 2 ? 55 : 0) + Math.sin(i / 6 * Math.PI) * 20; c.lineTo(x, y); } c.closePath(); c.fill();
  });
  face.wrapS = THREE.RepeatWrapping;
  const plastic = new THREE.MeshPhysicalMaterial({ map: face, roughness: .35, clearcoat: .6, side: THREE.DoubleSide });
  const body = add(geo, plastic, 0, 0, 0, s); body.rotation.y = -Math.PI / 2;   // put the painted front (u = .75) toward +z
  add(new THREE.TorusGeometry(Rr * .8, .008, 10, 48).rotateX(Math.PI / 2), M(0xff8a24, { roughness: .35 }), 0, H, 0, s);   // rim
  const handle = add(new THREE.TorusGeometry(Rr * .82, .006, 8, 40, Math.PI), M(0x1d1d1f, { roughness: .4 }), 0, H, 0, s);
  const hingeR = add(sph(.012), M(0x1d1d1f), Rr * .82, H, 0, s), hingeL = add(sph(.012), M(0x1d1d1f), -Rr * .82, H, 0, s);
  // candy heap: a mound inside, poking over the rim
  const R = rng(3), heap = grp(0, 0, 0, s); g.candies = [];
  for (let i = 0; i < count; i++) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * Rr * .68, y = H - .03 + (1 - rr / (Rr * .7)) * .05 + R() * .02; const c = candy(CANDY[i % CANDY.length], R); c.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr); heap.add(c); g.candies.push(c); }
  g.handle = handle; g.H = H * scale; g.R = Rr * scale; g.heap = heap;
  return g;
}
