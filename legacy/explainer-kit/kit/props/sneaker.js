// SNEAKER for R6 legs (research/sneakers.md). A real high-top built around the bottom of a leg block, Roblox-style:
// the block is the foot + shin, the shoe wraps its bottom ~.2 m, the lace front sits on the block's front face and the
// toe box pushes forward past it. Parts: midsole (white, toe spring) + outsole (rubber, colour break), upper (quarter /
// vamp, white leather), overlays proud of the upper (toe cap + mudguard, heel counter, eyestay strips), padded collar,
// tongue poking up out of the collar, crossing flat laces with eyelets, heel pull tab, side logo + wordmark decals.
//   sneaker({ w, d, brand, colors })  -> Group, origin = centre of the leg's bottom face, +z = toe, +y = up
//   wearSneakers(A, opts)             -> fits a pair to an R6 avatar's legs (attached to the leg bones)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTex } from '../util.js';

const DEF = { base: '#f4f2ee', over: '#c8202b', collar: '#17171a', mid: '#f7f6f2', out: '#c8202b', lace: '#f4f2ee', stitch: '#2a2a2e', text: '#c8202b' };

// the knockoff side logo: a lopsided wing-star + misspelt wordmark (made up, no real brand marks)
function logoTex(brand, C, flip) {
  return canvasTex(512, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.save(); if (flip) { g.translate(w, 0); g.scale(-1, 1); }
    // wing: three uneven feathers, slightly crooked (the knockoff tell)
    g.save(); g.translate(w * .22, h * .42); g.rotate(-.18); g.fillStyle = C.text; g.strokeStyle = '#111'; g.lineWidth = 7;
    for (const [len, a] of [[150, -.5], [125, -.15], [90, .2]]) { g.save(); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * .55, -34, len, -6); g.quadraticCurveTo(len * .5, 14, 0, 0); g.fill(); g.stroke(); g.restore(); }
    // a star stuck on the wing, a bit off-centre
    g.translate(-8, 10); g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 17 : 38, a = i / 10 * Math.PI * 2 - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath();
    g.fillStyle = '#111'; g.fill(); g.restore();
    // wordmark, measured so it never touches the edge
    let fs = 96; g.font = `900 italic ${fs}px "Arial Black", Fredoka, sans-serif`;
    while (g.measureText(brand).width > w * .9 && fs > 30) { fs -= 4; g.font = `900 italic ${fs}px "Arial Black", Fredoka, sans-serif`; }
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#111'; g.fillStyle = C.text;
    g.save(); g.translate(w * .5, h * .78); g.rotate(.03); g.strokeText(brand, 0, 0); g.fillText(brand, 0, 0); g.restore();
    g.restore();
  }, [1, 1]);
}
// leather: subtle grain + stitch lines along the panel edges (drawn per panel)
function leather(color, stitch, { rough = .55, stitches = true } = {}) {
  const t = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    const R = (() => { let s = 11; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    g.globalAlpha = .06; for (let i = 0; i < 900; i++) { g.fillStyle = R() < .5 ? '#000' : '#fff'; g.fillRect(R() * w, R() * h, 2, 2); }
    g.globalAlpha = 1;
    if (stitches) { g.strokeStyle = stitch; g.globalAlpha = .55; g.lineWidth = 3; g.setLineDash([10, 8]); g.strokeRect(10, 10, w - 20, h - 20); }
  }, [1, 1]);
  return new THREE.MeshStandardMaterial({ color: 0xffffff, map: t, roughness: rough });
}
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: .6, ...o });
const rbox = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));

// extrude a side profile (points in (z, y)) across the width, centred on x, with rounded edges
function slab(pts, width, m, bevel = .012, warp = null) {
  let v2 = pts.map(([z, y]) => new THREE.Vector2(z, y)); if (THREE.ShapeUtils.area(v2) < 0) v2 = v2.reverse();   // counter-clockwise, or the caps face inward
  const s = new THREE.Shape(v2);
  const geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(.001, width - 2 * bevel), bevelEnabled: true, bevelThickness: bevel, bevelSize: 0, bevelSegments: 3, curveSegments: 10 });
  geo.translate(0, 0, -(width - 2 * bevel) / 2); geo.rotateY(-Math.PI / 2);   // shape x -> world +z (toe), extrude -> world x
  if (warp) { const P = geo.attributes.position; for (let i = 0; i < P.count; i++) P.setX(i, P.getX(i) * warp(P.getZ(i), P.getY(i))); }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, m); mesh.castShadow = mesh.receiveShadow = true; return mesh;
}
// smooth closed outline from a few control points
// smooth closed outline from a few control points (corner-cut subdivision: never overshoots, so the cap never self-intersects)
const curve = (pts, n = 3) => { let P = pts; for (let k = 0; k < n; k++) { const Q = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; Q.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); } P = Q; } return P; };

export function sneaker({ w = .3, d = .3, brand = 'JADANS', colors = {}, side = 1 } = {}) {
  const C = { ...DEF, ...colors }, G = new THREE.Group(); G.name = 'sneaker';
  const W = w + .014, zH = -d / 2 - .03, zF = d / 2 + .012, zT = d / 2 + .11, Hc = .23, ys = .046;
  // plan-view shape: the toe box narrows and rounds off toward the tip, the heel rounds a little (a real last, not a brick)
  const ss = (x, a, b) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const warp = (z, y) => { const k = ss(z, zF, zT + .02), h = ss(z, -d / 2, zH - .01);   // only past the leg block (it must stay covered)
    return (1 - .26 * k * k) * (1 - .12 * h * h) * (1 - .04 * ss(y, .1, Hc) * k); };
  const sl = (pts, wd, m, bev) => slab(pts, wd, m, bev, warp);
  const white = leather(C.base, C.stitch, { stitches: false }), red = leather(C.over, '#f4f2ee', { stitches: false }), black = leather(C.collar, '#555', { rough: .75, stitches: false });
  // ---- midsole + outsole: toe spring (the tip lifts ~1.5 cm), slightly wider than the upper ----
  const sole = (y0, y1, grow, m, bev) => sl(curve([[zH - grow, y0 + .004], [zH - grow - .004, (y0 + y1) / 2], [zH - grow, y1], [(zH + zT) / 2, y1], [zT + grow - .01, y1 + .012], [zT + grow + .004, y0 + .02], [zT + grow - .02, y0 + .014], [(zH + zT) / 2, y0]], 5), W + 2 * grow, m, bev);
  G.add(sole(.012, ys, .014, mat(C.mid, { roughness: .45 }), .01));
  G.add(sole(0, .016, .016, mat(C.out, { roughness: .8 }), .006));
  // ---- upper: heel up to the collar, collar line, tongue front, lace face, toe box down to the sole ----
  const upper = [[zH, ys], [zH - .006, Hc * .55], [zH + .004, Hc - .012], [zH + .03, Hc], [zF - .06, Hc - .008], [zF - .01, Hc - .004], [zF + .012, Hc - .03],
    [zF + .03, .118], [zF + .05, .092], [zT - .035, .08], [zT - .006, .062], [zT, ys + .006]];
  G.add(sl(curve(upper, 6), W, white, .016));
  // ---- overlays (proud of the upper by a few mm): toe cap + mudguard band, heel counter ----
  const toeCap = [[zF + .0, ys], [zF - .005, .07], [zF + .035, .098], [zF + .06, .092], [zT - .03, .084], [zT + .004, .064], [zT + .006, ys + .004]];
  G.add(sl(curve(toeCap, 6), W + .008, red, .016));
  const mud = [[zH + .04, ys - .002], [zH + .04, ys + .028], [zF, ys + .028], [zF, ys - .002]];
  const heel = [[zH - .004, ys], [zH - .008, Hc * .6], [zH + .02, Hc * .66], [zH + .07, Hc * .45], [zH + .075, ys + .02], [zH + .05, ys]];
  G.add(sl(curve(heel, 6), W + .008, red, .016));
  // ---- padded collar: a black roll around the top opening ----
  const coll = new THREE.Mesh(rbox(W + .012, .036, zF - zH + .004, .016), black); coll.position.set(0, Hc - .012, (zH + zF) / 2 - .004); G.add(coll);
  // ---- tongue: pokes up out of the collar at the front, label on it ----
  const tongue = new THREE.Mesh(rbox(w * .62, .07, .028, .012), white); tongue.position.set(0, Hc + .012, zF - .006); tongue.rotation.x = -.18; G.add(tongue);
  const tl = new THREE.Mesh(new THREE.PlaneGeometry(w * .34, .028), new THREE.MeshStandardMaterial({ map: canvasTex(256, 96, (g, cw, ch) => { g.fillStyle = C.over; g.fillRect(0, 0, cw, ch); g.fillStyle = '#fff'; let fs = 60; g.font = `900 italic ${fs}px "Arial Black", sans-serif`; while (g.measureText(brand).width > cw * .86) { fs -= 3; g.font = `900 italic ${fs}px "Arial Black", sans-serif`; } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(brand, cw / 2, ch / 2 + 2); }, [1, 1]), roughness: .6 }));
  tl.position.set(0, .016, .0145); tongue.add(tl);
  // ---- lace face: eyestay strips both sides (red), eyelets, crossing flat laces, a bow on top ----
  const faceZ = y => { const k = (y - .118) / (Hc - .03 - .118); return zF + .03 + (zF + .012 - (zF + .03)) * k; };   // the slanted front, z at height y
  const tilt = Math.atan2(.018, Hc - .03 - .118);
  for (const s of [-1, 1]) { const st = new THREE.Mesh(rbox(.032, Hc - .02 - .1, .012, .005), red); st.position.set(s * (w * .36), (Hc - .02 + .1) / 2, faceZ((Hc - .02 + .1) / 2) + .006); st.rotation.x = -tilt; G.add(st); }
  const laceM = mat(C.lace, { roughness: .8 }), eyeM = mat('#c9ccd2', { metalness: .8, roughness: .3 });
  const rows = 4;
  for (let i = 0; i < rows; i++) {
    const y = .112 + i * (Hc - .03 - .112) / (rows - .4), z = faceZ(y) + .016;
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.TorusGeometry(.0065, .0022, 6, 12), eyeM); e.position.set(s * w * .36, y, z - .002); e.rotation.x = -tilt; G.add(e); }
    for (const s of [-1, 1]) {   // two laces crossing between this row and the next (an X per gap)
      if (i === rows - 1) break; const y2 = .112 + (i + 1) * (Hc - .03 - .112) / (rows - .4), len = Math.hypot(w * .72, y2 - y);
      const l = new THREE.Mesh(rbox(len, .011, .006, .0025), laceM); l.position.set(0, (y + y2) / 2, (z + faceZ(y2) + .016) / 2 + (s > 0 ? .003 : 0)); l.rotation.set(-tilt, 0, s * Math.atan2(y2 - y, w * .72)); G.add(l);
    }
  }
  // bow at the top
  for (const s of [-1, 1]) { const lp = new THREE.Mesh(new THREE.TorusGeometry(.016, .004, 6, 14), laceM); lp.position.set(s * .02, Hc - .018, faceZ(Hc - .03) + .022); lp.rotation.set(-tilt, s * .5, 0); lp.scale.set(1.2, .7, 1); G.add(lp); }
  // ---- heel pull tab ----
  const tab = new THREE.Mesh(rbox(.04, .045, .01, .004), black); tab.position.set(0, Hc + .005, zH + .006); tab.rotation.x = .2; G.add(tab);
  // ---- side logo + wordmark on both quarters (decals just proud of the white panel) ----
  for (const s of [-1, 1]) {
    const lg = new THREE.Mesh(new THREE.PlaneGeometry(.17, .085), new THREE.MeshStandardMaterial({ map: logoTex(brand, C, s < 0), transparent: true, roughness: .5, polygonOffset: true, polygonOffsetFactor: -2 }));
    lg.position.set(s * (W / 2 + .0035), .118, (zH + zF) / 2 + .012); lg.rotation.y = s * Math.PI / 2; G.add(lg);
  }
  G.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (!o.material.transparent) o.material.side = THREE.DoubleSide; } });
  return G;
}

// fit a pair onto an R6 avatar (loadMale / castMain result `A`): measured from the leg boxes, attached to the leg bones so
// they follow every pose. Old shoe details on the legs (toe caps / soles from dress()) are hidden under the new pair.
export async function wearSneakers(A, opts = {}) {
  const { partBoxes } = await import(new URL('kit/roblox.js', document.baseURI).href);
  const B = partBoxes(A), pair = [];
  for (const part of ['legL', 'legR']) {
    const b = B[part], S = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const bone = A.bones[part]; bone.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && o.name !== 'sneaker') o.visible = false; });
    const sh = sneaker({ w: S.x, d: S.z, ...opts }); const out = Math.sign(c.x - (B.torso.min.x + B.torso.max.x) / 2) * .009; sh.position.set(c.x + out, b.min.y - .004, c.z); A.root.add(sh); A.root.updateMatrixWorld(true); bone.attach(sh); pair.push(sh);
  }
  return pair;
}
