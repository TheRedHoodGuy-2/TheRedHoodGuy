// GADGETS (2026-11-14, time-crawl video). Hand props modelled from research/props_timecrawl.md and SIZED FOR THE R6
// HANDS (Xavier: "you like making them tiny"): an R6 hand is the .34 m end of the arm block, so real centimetres read
// like toys. Each builder takes a scale `s`; defaults are already hand-sized.
//   gamepad()      two-tone DualSense-style controller (white shell, black core, touchpad + light bar, d-pad, face
//                  buttons, two sticks, PS / create / options / mute, L1 R1 L2 R2). No logos. Local frame: +x across,
//                  +y up (the face), -z = the front edge (bumpers) pointing at the TV, the grips run back toward the player (+z).
//                  Held by someone facing -z: the d-pad is on his left (-x), face buttons on his right (+x).
//                  userData.gripL / gripR = where each hand holds it; .set({ sticks: [lx, ly, rx, ry], press: 0..1 })
//   tallyCounter() Veeder-Root style hand tally: round chrome case, 4-digit window, thumb button on top, finger ring
//                  underneath, reset knob. .set(count, press 0..1). Local: face toward +z, button up (+y).
//   digitalWatch() black resin digital sports watch: strap loop sized to wrap an R6 arm block, square case, grey LCD
//                  with big digits, 4 side buttons. .set(h, m, s). Local: arm runs along y, the face looks toward +z.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, canvasTex } from '../util.js';

const roundRectShape = (w, d, r) => { const s = new THREE.Shape(), x = -w / 2, y = -d / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
// extrude a top-view shape (x, z) into a slab of thickness h lying in the xz plane, bottom at y0
const slab = (shape, h, mat, y0 = 0, bevel = .006) => { const g = new THREE.ExtrudeGeometry(shape, { depth: h - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24 });
  g.rotateX(Math.PI / 2); g.translate(0, y0 + h - bevel, 0); const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; return m; };

// =====================================================================================================================
// DUALSENSE-STYLE CONTROLLER. Built in real millimetres-ish units (body 160 mm wide) then scaled by s (default 3.3 = about
// .53 m across, so each grip fills an R6 hand block).
// =====================================================================================================================
export function gamepad({ s = 3.3 } = {}) {
  const G = new THREE.Group(), I = grp(0, 0, 0, G); I.scale.setScalar(s);
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf3f4f6, roughness: .38, clearcoat: .3, clearcoatRoughness: .5 });
  const black = new THREE.MeshStandardMaterial({ color: 0x1b1c20, roughness: .55 }), gloss = new THREE.MeshPhysicalMaterial({ color: 0x15161a, roughness: .2, clearcoat: .8 });
  const grey = new THREE.MeshStandardMaterial({ color: 0x3a3c42, roughness: .5 });
  // ---- top-view outline (x across, y in the shape = -z in the world after rotateX): wide body, two horns angling back ----
  const outline = () => { const p = new THREE.Shape();
    p.moveTo(-.052, -.03); p.bezierCurveTo(-.03, -.036, .03, -.036, .052, -.03);   // front edge (toward the TV), between the bumpers
    p.bezierCurveTo(.07, -.032, .08, -.026, .08, -.012);                           // right shoulder
    p.bezierCurveTo(.082, .01, .078, .04, .072, .062);                             // right outer side runs back
    p.bezierCurveTo(.066, .086, .05, .092, .04, .078);                             // right horn tip
    p.bezierCurveTo(.03, .062, .024, .038, .012, .032);                            // inner edge of the right horn
    p.bezierCurveTo(.004, .03, -.004, .03, -.012, .032);                           // the back edge between the horns
    p.bezierCurveTo(-.024, .038, -.03, .062, -.04, .078);
    p.bezierCurveTo(-.05, .092, -.066, .086, -.072, .062);
    p.bezierCurveTo(-.078, .04, -.082, .01, -.08, -.012);
    p.bezierCurveTo(-.08, -.026, -.07, -.032, -.052, -.03); return p; };
  // black core underneath (slightly smaller), white shell on top: the classic two-tone look
  const core = slab(outline(), .03, black, -.018); core.scale.set(.985, 1, .985); I.add(core);
  const shell = slab(outline(), .016, white, .004, .005); I.add(shell);
  // the black centre band on the face (where the sticks + PS button live), set just above the shell
  { const c = new THREE.Shape(); c.moveTo(-.034, .004); c.lineTo(.034, .004); c.bezierCurveTo(.036, .02, .03, .034, .014, .036); c.lineTo(-.014, .036); c.bezierCurveTo(-.03, .034, -.036, .02, -.034, .004);
    const band = slab(c, .002, black, .0195, .0008); I.add(band); }
  // touchpad: big flat white pad at the top centre with the light bar strips glowing blue down both sides
  { const tp = slab(roundRectShape(.05, .03, .006), .003, white, .0195, .001); tp.position.z = -.012; I.add(tp);
    const lbM = new THREE.MeshStandardMaterial({ color: 0x6fb6ff, emissive: 0x2f7dff, emissiveIntensity: 1.6, roughness: .3 });
    for (const sx of [-1, 1]) { const lb = rb(.0022, .002, .03, lbM, sx * .0272, .0215, -.012, I, .0008); lb.castShadow = false; }
    // create (left) + options (right) pill buttons beside the pad
    for (const sx of [-1, 1]) { const b = rb(.004, .003, .008, gloss, sx * .036, .0215, -.018, I, .0012); b.rotation.y = sx * .35; } }
  // PS button + mute bar under the pad, between the sticks
  { const ps = add(cyl(.0045, .0045, .003, 24), gloss, 0, .0225, .016, I); add(cyl(.0012, .0012, .0006, 12), grey, 0, .0241, .016, I);   // tiny centre dot, no logo
    const mute = rb(.009, .002, .003, new THREE.MeshStandardMaterial({ color: 0xff8a3d, emissive: 0xff5a00, emissiveIntensity: .25, roughness: .4 }), 0, .0218, .024, I, .001); }
  // ---- d-pad (left wing): four separate wedge pads, translucent dark ----
  const D = { x: -.052, z: -.004 }, padM = new THREE.MeshPhysicalMaterial({ color: 0x2a2c33, roughness: .25, clearcoat: .6 });
  for (let i = 0; i < 4; i++) { const g = grp(D.x, .0215, D.z, I); g.rotation.y = i * Math.PI / 2; const sh = new THREE.Shape(); sh.moveTo(-.0035, -.004); sh.lineTo(.0035, -.004); sh.lineTo(.0035, -.0115); sh.lineTo(0, -.0135); sh.lineTo(-.0035, -.0115); sh.lineTo(-.0035, -.004);
    const m = slab(sh, .003, padM, -.001, .0007); g.add(m); }
  // ---- face buttons (right wing): four round caps with the grey line symbols (triangle top, circle right, cross bottom, square left) ----
  const sym = n => canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#23252b'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8bcc6'; g.lineWidth = 9; g.lineJoin = 'round'; g.beginPath();
    if (n === 0) { g.moveTo(64, 34); g.lineTo(94, 88); g.lineTo(34, 88); g.closePath(); } else if (n === 1) g.arc(64, 64, 28, 0, 7); else if (n === 2) { g.moveTo(40, 40); g.lineTo(88, 88); g.moveTo(88, 40); g.lineTo(40, 88); } else g.rect(38, 38, 52, 52); g.stroke(); }, [1, 1]);
  const FB = { x: .052, z: -.004 }, fbPos = [[0, -.0105], [.0105, 0], [0, .0105], [-.0105, 0]];
  fbPos.forEach(([dx, dz], i) => { const cap = new THREE.Mesh(new THREE.CylinderGeometry(.0048, .005, .0035, 28), [new THREE.MeshPhysicalMaterial({ color: 0x23252b, roughness: .25, clearcoat: .7 }), new THREE.MeshPhysicalMaterial({ map: sym(i), roughness: .25, clearcoat: .7 }), padM]);
    cap.position.set(FB.x + dx, .0215, FB.z + dz); cap.rotation.y = Math.PI; cap.castShadow = true; I.add(cap); });
  // ---- analog sticks: a socket ring in the black band, a shaft, a concave cap with a grip ring ----
  const sticks = [];
  for (const sx of [-1, 1]) { const base = grp(sx * .022, .0205, .022, I);
    add(new THREE.TorusGeometry(.0085, .0016, 10, 32), black, 0, .0004, 0, base).rotation.x = Math.PI / 2;
    const st = grp(0, 0, 0, base); add(cyl(.0035, .0045, .007, 16), black, 0, .0035, 0, st);
    const cap = add(cyl(.0075, .0072, .004, 32), black, 0, .0085, 0, st); add(new THREE.TorusGeometry(.0068, .0012, 10, 32), grey, 0, .0106, 0, st).rotation.x = Math.PI / 2;
    add(cyl(.0055, .0055, .0006, 32), new THREE.MeshStandardMaterial({ color: 0x101114, roughness: .8 }), 0, .0107, 0, st);
    sticks.push(st); }
  // ---- shoulder buttons on the front edge: flat L1 / R1 bumpers, big curved L2 / R2 triggers above + behind them ----
  for (const sx of [-1, 1]) {
    const b1 = rb(.03, .006, .01, black, sx * .055, .014, -.034, I, .0025); b1.rotation.y = -sx * .18;
    const tg = grp(sx * .055, .02, -.028, I); tg.rotation.set(-.5, -sx * .18, 0);
    const trig = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .028, 24, 1, false, Math.PI * .5, Math.PI * .75), black); trig.rotation.z = Math.PI / 2; trig.position.set(0, -.004, .006); trig.castShadow = true; tg.add(trig); }
  // headset jack + speaker grille at the back edge, USB-C at the front
  rb(.012, .003, .002, grey, 0, -.006, .0315, I, .0008); rb(.006, .0025, .002, grey, 0, .002, -.0362, I, .0008);
  G.traverse(o => { if (o.isMesh) o.castShadow = true; });
  G.userData.gripL = new THREE.Vector3(-.058 * s, -.002 * s, .07 * s); G.userData.gripR = new THREE.Vector3(.058 * s, -.002 * s, .07 * s);
  G.userData.set = ({ sticks: sv = [0, 0, 0, 0] } = {}) => { sticks[0].rotation.set(sv[1] * .35, 0, -sv[0] * .35); sticks[1].rotation.set(sv[3] * .35, 0, -sv[2] * .35); };
  return G;
}

// =====================================================================================================================
// HAND TALLY COUNTER (about .19 m across at the default scale: fills the palm of an R6 hand)
// =====================================================================================================================
export function tallyCounter({ s = 1 } = {}) {
  const G = new THREE.Group(), I = grp(0, 0, 0, G); I.scale.setScalar(s);
  const chrome = new THREE.MeshStandardMaterial({ color: 0xdfe4ea, metalness: 1, roughness: .16 }), dark = new THREE.MeshStandardMaterial({ color: 0x24262b, metalness: .5, roughness: .35 });
  const R = .095, T = .07;
  // case: a fat chrome disc standing up (face toward +z), with a rolled rim
  const body = add(new THREE.CylinderGeometry(R, R, T, 48), chrome, 0, 0, 0, I); body.rotation.x = Math.PI / 2;
  for (const z of [-T / 2, T / 2]) add(new THREE.TorusGeometry(R - .002, .006, 10, 48), chrome, 0, 0, z, I);
  // the digit window: a black slot across the face with four white-on-black number wheels (canvas, updated by set())
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 160; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const draw = n => { const g = cv.getContext('2d'); g.fillStyle = '#0c0c0e'; g.fillRect(0, 0, 512, 160); const str = String(Math.max(0, Math.floor(n)) % 10000).padStart(4, '0');
    for (let i = 0; i < 4; i++) { const x = 18 + i * 122; const gr = g.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, '#2a2a2e'); gr.addColorStop(.5, '#141416'); gr.addColorStop(1, '#2a2a2e'); g.fillStyle = gr; g.fillRect(x, 8, 106, 144);
      g.fillStyle = '#f4f4f0'; g.font = '800 118px Inter, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str[i], x + 53, 84); }
    tex.needsUpdate = true; };
  draw(0);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(.12, .0375), new THREE.MeshStandardMaterial({ map: tex, roughness: .3 })); win.position.set(0, .008, T / 2 + .0062); I.add(win);
  rb(.13, .046, .006, dark, 0, .008, T / 2 + .002, I, .004);                                        // the bezel round the window
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(.122, .039), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .02, transmission: 0, transparent: true, opacity: .12 })); glass.position.set(0, .008, T / 2 + .0068); I.add(glass);
  // thumb button on top: a chrome stem + a black pad that sinks when pressed
  const btn = grp(0, R, 0, I); add(cyl(.012, .012, .03, 20), chrome, 0, .012, 0, btn); const pad = add(cyl(.022, .02, .012, 28), dark, 0, .032, 0, btn);
  // finger ring underneath (a steel loop the middle finger goes through) + the reset knob on the right side
  const ring = add(new THREE.TorusGeometry(.03, .007, 12, 32), dark, 0, -R - .026, 0, I); ring.rotation.y = Math.PI / 2;
  add(cyl(.012, .012, .02, 6), dark, 0, -R - .002, 0, I);
  const knob = add(cyl(.016, .016, .018, 24), chrome, R + .006, -.02, 0, I); knob.rotation.z = Math.PI / 2;
  G.traverse(o => { if (o.isMesh && o !== glass) o.castShadow = true; });
  let last = -1;
  G.userData.set = (count, press = 0) => { const n = Math.floor(count); if (n !== last) { draw(n); last = n; } btn.position.y = R - .012 * press; };
  return G;
}

// =====================================================================================================================
// DIGITAL SPORTS WATCH: the strap is a loop sized to sit round an R6 arm block (.34 x .34), the case sits on one face.
// =====================================================================================================================
export function digitalWatch({ arm = .34, s = 1 } = {}) {
  const G = new THREE.Group(), I = grp(0, 0, 0, G); I.scale.setScalar(s);
  const resin = new THREE.MeshStandardMaterial({ color: 0x1d1e22, roughness: .6 }), steel = new THREE.MeshStandardMaterial({ color: 0xc9ced4, metalness: .9, roughness: .25 });
  const a = arm / 2 + .008, band = .1, th = .018;
  // strap: four slabs round the arm block (the arm runs along y)
  rb(arm + .05, band, th, resin, 0, 0, a, I, .006); rb(arm + .05, band, th, resin, 0, 0, -a, I, .006);
  rb(th, band, arm + .05, resin, a, 0, 0, I, .006); rb(th, band, arm + .05, resin, -a, 0, 0, I, .006);
  rb(.03, band * .7, .006, steel, -a - .01, 0, 0, I, .002);   // buckle on the far side
  // case: a chunky rounded square on the +z face, with a stepped bezel and four side buttons
  const caseG = grp(0, 0, a + th / 2, I); caseG.rotation.z = Math.PI / 2;   // text runs along the arm (12 o'clock across the wrist), like a real watch
  rb(.2, .19, .05, resin, 0, 0, .02, caseG, .03); rb(.17, .16, .012, new THREE.MeshStandardMaterial({ color: 0x2b2d33, roughness: .4 }), 0, 0, .05, caseG, .01);
  for (const [x, y] of [[-.105, .05], [-.105, -.05], [.105, .05], [.105, -.05]]) { const b = rb(.02, .03, .024, steel, x, y, .02, caseG, .006); }
  // the LCD: grey-green panel, big black digits, a small seconds readout (canvas, updated by set())
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 192; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const draw = (h, m, sec) => { const g = cv.getContext('2d'); g.fillStyle = '#b9c3ae'; g.fillRect(0, 0, 256, 192); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, 256, 34);
    g.fillStyle = '#16180f'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 26px Inter, Arial, sans-serif'; g.fillText('PM', 46, 22); g.fillText('SAT', 208, 22);
    g.font = '800 92px "DS-Digital", Inter, Arial Black, monospace'; g.fillText(`${h}:${String(m).padStart(2, '0')}`, 116, 108); g.font = '800 38px Inter, Arial, sans-serif'; g.fillText(String(sec).padStart(2, '0'), 222, 132);
    tex.needsUpdate = true; };
  draw(1, 3, 0);
  const lcd = new THREE.Mesh(new THREE.PlaneGeometry(.15, .113), new THREE.MeshStandardMaterial({ map: tex, roughness: .35 })); lcd.position.set(0, 0, .0575); caseG.add(lcd);
  G.traverse(o => { if (o.isMesh) o.castShadow = true; });
  let last = '';
  G.userData.set = (h, m, sec) => { const k = `${h}:${m}:${sec}`; if (k !== last) { draw(h, m, sec); last = k; } };
  return G;
}

// =====================================================================================================================
// SLUSHIE CUP (2026-11-14, brain freeze video; research/props_brainfreeze.md). Convenience-store frozen drink, fake brand
// "SLURPZ": tapered cup printed with bright bubbles + swirls, CLEAR DOME LID with the slush heaped up inside it (blue
// raspberry), a fat spoon straw through the X slot. Hand-sized: ~.42 m tall. Local: base at y 0, straw tip userData.tip.
// =====================================================================================================================
export function slushieCup({ s = 1, flavour = 0x2f7dff } = {}) {
  const G = new THREE.Group(), I = grp(0, 0, 0, G); I.scale.setScalar(s);
  const H = .34, R0 = .085, R1 = .125;
  const wrap = canvasTex(1024, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff3d7f'); gr.addColorStop(1, '#ff8a2a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const C = ['#ffe14a', '#3ee0ff', '#ffffff', '#7a3cff', '#3dff8a'];
    for (let i = 0; i < 60; i++) { const x = (i * 173) % w, y = (i * 97) % h, r = 10 + (i * 37) % 38; g.globalAlpha = .55; g.fillStyle = C[i % 5]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.globalAlpha = .9; g.strokeStyle = '#fff'; g.lineWidth = 4; g.beginPath(); g.arc(x - r * .25, y - r * .25, r * .45, 3.4, 4.6); g.stroke(); }
    g.globalAlpha = 1; g.strokeStyle = '#ffffff'; g.lineWidth = 26; for (let k = 0; k < 2; k++) { g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * (.32 + k * .38) + Math.sin(x / w * Math.PI * 4 + k) * 30); g.stroke(); }
    for (const x0 of [w * .25, w * .75]) { g.save(); g.translate(x0, h * .52); g.rotate(-.08); g.fillStyle = '#ffffff'; g.font = '900 128px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 18; g.strokeStyle = '#1b2a6b'; g.strokeText('SLURPZ', 0, 0); g.fillText('SLURPZ', 0, 0); g.restore(); } }, [1, 1]);
  const cupM = new THREE.MeshPhysicalMaterial({ map: wrap, roughness: .45, clearcoat: .4 });
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(R1, R0, H, 48, 1, true), cupM); cup.position.y = H / 2; cup.rotation.y = Math.PI / 2; I.add(cup);   // a SLURPZ label faces +z
  add(new THREE.CircleGeometry(R0, 40), new THREE.MeshStandardMaterial({ color: 0xe9e9ee, roughness: .6 }), 0, .001, 0, I).rotation.x = -Math.PI / 2;
  add(new THREE.TorusGeometry(R1, .007, 10, 48), new THREE.MeshStandardMaterial({ color: 0xf4f4f6, roughness: .4 }), 0, H, 0, I).rotation.x = Math.PI / 2;   // rolled rim
  // the slush: heaped above the rim, icy and glossy, filling the dome
  const slushM = new THREE.MeshPhysicalMaterial({ color: flavour, roughness: .35, clearcoat: .6, sheen: .5 });
  const heap = new THREE.Mesh(new THREE.SphereGeometry(R1 * .97, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), slushM); heap.scale.y = .62; heap.position.y = H; I.add(heap);
  for (let i = 0; i < 9; i++) { const a = i * 2.4, r = R1 * (.25 + (i % 3) * .22), b = add(new THREE.SphereGeometry(.022 + (i % 3) * .006, 12, 8), slushM, Math.cos(a) * r, H + .035 + (2 - i % 3) * .015, Math.sin(a) * r, I); }
  // clear dome lid with a flat top + the X slot
  const domeM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, transmission: .9, thickness: .01, transparent: true, opacity: .35, ior: 1.45 });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R1 + .006, 40, 16, 0, Math.PI * 2, 0, Math.PI * .42), domeM); dome.scale.y = .78; dome.position.y = H; I.add(dome);
  add(new THREE.TorusGeometry(R1 + .008, .006, 10, 48), domeM, 0, H + .004, 0, I).rotation.x = Math.PI / 2;
  // spoon straw: fat striped straw out of the dome's X slot. userData.aimStraw(worldPoint) swings it and sets its length
  // so the tip lands exactly ON that point (his lips); the bottom end stays buried in the slush
  const straw = grp(0, H + .03, 0, I), PIV = new THREE.Vector3(0, H + .03, 0), BUR = .1;
  const stripe = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#ff2e63'; for (let y = -h; y < h * 2; y += 48) { g.save(); g.translate(0, y); g.rotate(-.5); g.fillRect(-20, 0, 120, 18); g.restore(); } }, [1, 3]);
  const tube = add(new THREE.CylinderGeometry(.013, .013, 1, 20, 1, true), new THREE.MeshStandardMaterial({ map: stripe, roughness: .4, side: THREE.DoubleSide }), 0, 0, 0, straw);
  const lip = add(new THREE.TorusGeometry(.013, .002, 8, 20), new THREE.MeshStandardMaterial({ color: 0xffffff }), 0, 0, 0, straw); lip.rotation.x = Math.PI / 2;
  const setStraw = (dirLocal, len) => { straw.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirLocal.clone().normalize()); tube.scale.y = len + BUR; tube.position.y = (len - BUR) / 2; lip.position.y = len; };
  setStraw(new THREE.Vector3(-.2, 1, .25), .2);
  G.userData.aimStraw = (world) => { G.updateMatrixWorld(true); const p = I.worldToLocal(world.clone()), d = p.sub(PIV); setStraw(d, d.length()); };
  G.traverse(o => { if (o.isMesh && o.material !== domeM) o.castShadow = true; });
  return G;
}

// =====================================================================================================================
// HARDCOVER TEXTBOOK v2 (2026-11-15, rebuilt after Xavier: "how is that a book, clips into itself"). Stood up OPEN on its
// bottom edge as a shield: two rigid leaves (cover board + page block) hinged at the spine, the V opening toward the
// reader (+z), outer covers facing away, a rounded spine joining them, a gutter gap so the page blocks never touch.
// Proportions: school hardcover ~21 x 28 cm, ~3 cm thick, boards overhang the pages by a few mm (scaled x1.6 for R6).
// open = angle between the leaves (rad). Local: spine at the origin, standing on y = 0.
// =====================================================================================================================
export function textbook({ s = 1, open = 1.95, title = 'SCIENCE', sub = 'Grade 7', colour = '#1f6fd1' } = {}) {
  const G = new THREE.Group(), I = grp(0, 0, 0, G); I.scale.setScalar(s);
  const W = .34, H = .45, T = .01, P = .028, SQ = .007, GUT = .05;
  const cover = canvasTex(512, 680, (g, w, h) => { g.fillStyle = colour; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.arc(w * .82, h * .8, 210, 0, 7); g.fill();
    g.fillStyle = '#ffd14f'; g.fillRect(0, h * .1, w, 120); g.fillStyle = '#1b2440'; g.font = '900 88px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, w / 2, h * .1 + 62);
    g.fillStyle = '#fff'; g.font = '700 44px Fredoka, Arial, sans-serif'; g.fillText(sub, w / 2, h * .33); g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.arc(w / 2, h * .62, 80, 0, 7); g.stroke(); g.beginPath(); g.ellipse(w / 2, h * .62, 140, 42, .4, 0, 7); g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(w / 2, h * .62, 18, 0, 7); g.fill(); }, [1, 1]);
  const boardM = new THREE.MeshStandardMaterial({ color: colour, roughness: .55 }), coverM = new THREE.MeshStandardMaterial({ map: cover, roughness: .5 });
  const pageEdge = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#f7f2e6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,100,70,.18)'; g.lineWidth = 1; for (let y = 2; y < h; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }, [1, 1]);
  const pageM = new THREE.MeshStandardMaterial({ color: 0xf7f2e6, roughness: .85 }), edgeM = new THREE.MeshStandardMaterial({ map: pageEdge, roughness: .85 });
  const printed = canvasTex(256, 340, (g, w, h) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a2a'; g.font = '700 20px Arial'; g.fillText('Chapter 4', 24, 36); g.fillStyle = 'rgba(40,40,40,.55)';
    for (let y = 60; y < h - 20; y += 13) g.fillRect(24, y, w - 48 - ((y * 7) % 40), 5); g.fillStyle = '#7fb3e6'; g.fillRect(24, 150, 110, 70); }, [1, 1]);
  const pageFaceM = new THREE.MeshStandardMaterial({ map: printed, roughness: .85 });
  const h2 = open / 2;
  // a leaf: local x runs from the hinge out to the fore-edge, local -z (side) = the outer cover, the pages on the inner side
  const leaf = side => {   // side +1 = the right leaf (+x), -1 = the left
    const L = grp(0, 0, 0, I); L.rotation.y = side > 0 ? -(Math.PI / 2 - h2) : -(Math.PI / 2 + h2);
    const inz = side > 0 ? 1 : -1;   // which local z is "inside" (toward the reader)
    const board = rb(W, H, T, boardM, W / 2, H / 2, -inz * T / 2, L, .003);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(W - .004, H - .004), side > 0 ? coverM : boardM); face.position.set(W / 2, H / 2, -inz * (T + .0008)); face.rotation.y = inz > 0 ? Math.PI : 0; L.add(face);
    const pw = W - GUT - SQ, ph = H - 2 * SQ;
    const pages = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, P), [edgeM, pageM, edgeM, edgeM, pageM, pageM]); pages.position.set(GUT + pw / 2, H / 2, inz * P / 2); L.add(pages);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(pw - .01, ph - .01), pageFaceM); top.position.set(GUT + pw / 2, H / 2, inz * (P + .0006)); top.rotation.y = inz > 0 ? 0 : Math.PI; L.add(top);
    return L; };
  leaf(1); leaf(-1);
  // the spine: a rounded strip round the outside of the hinge joining the two outer boards
  const a0 = Math.PI / 2 + h2, len = Math.PI - open;
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(T * 1.6, T * 1.6, H, 16, 1, true, a0, Math.max(.05, len)), new THREE.MeshStandardMaterial({ color: colour, roughness: .55, side: THREE.DoubleSide })); spine.position.y = H / 2; I.add(spine);
  G.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  G.userData.depth = W * Math.cos(h2) * s; G.userData.width = 2 * W * Math.sin(h2) * s;
  return G;
}
