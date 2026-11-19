// BRAIN ROOM (reusable micro-world, cartoon): the control room inside a character's head, Inside-Out style.
// Pink brain-fold walls, two big oval EYE WINDOWS in the front wall (-z) looking out at the world (a baked view),
// a rounded console under them with a status MONITOR, a big FEELING LEVER (right), a FEELING GAUGE (left), a button
// grid, glowing NERVE CABLES running from the walls into the console (signal pulses travel along them), a red ALARM
// beacon with its own light (off unless alarmed), a swivel stool for the operator, a mug, and a "BRAIN HQ" sign.
// Built far from the set (default x = 300). Every animated part is a pure function of the state you pass to set():
//   const R = buildBrainRoom(scene, { at: [300, 0, 0] })
//   R.set({ screen: 'idle'|'predict'|'muted'|'unknown', lever: 0..1 (1 = up / full feeling), gauge: 0..1,
//           alarm: 0..1, pulse: 0..1 (signal along the cables, -1 = none), t })
//   R.setView(texture)   // what the eye windows show
//   R.seat               // world position for the operator (sitting on the stool, facing -z)
// Room: 4.4 wide, 2.8 high, 3.6 deep. Camera spots that work: R.spots.
import * as THREE from 'three';
import { M, rb, add, grp, cyl, sph, canvasTex } from '../util.js';

export function buildBrainRoom(scene, { at = [300, 0, 0], leverLabel = 'TICKLE', chairBack = false } = {}) {
  const G = grp(...at, scene), W = 4.4, H = 2.8, D = 3.6, refs = { group: G };
  // ---------- walls: soft pink with darker brain folds (painted squiggles), rounded corners via a big curved shell ----------
  const folds = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#f2a7b8'; g.fillRect(0, 0, w, h);
    const R = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < 90; i++) { let x = R() * w, y = R() * h, a = R() * 6.28; g.strokeStyle = R() < .5 ? '#d9798f' : '#e48ea3'; g.lineWidth = 9 + R() * 8; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 9; k++) { a += (R() - .5) * 2.4; const nx = x + Math.cos(a) * 55, ny = y + Math.sin(a) * 55; g.quadraticCurveTo(x + Math.cos(a + 1.2) * 40, y + Math.sin(a + 1.2) * 40, nx, ny); x = nx; y = ny; } g.stroke(); }
    g.globalAlpha = .25; g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(R() * w, R() * h, 30 + R() * 50, 12 + R() * 20, R() * 3, 0, 7); g.fill(); }
  }, [2, 1.3]);
  const wallM = M(0xffffff, { map: folds, roughness: .55 }), floorM = M(0x6d3e55, { roughness: .45, metalness: .05 });
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(W * .62, W * .62, H + .4, 48, 1, true, 0, Math.PI * 2), wallM); shell.material.side = THREE.BackSide;
  shell.scale.set(1, 1, D / W); shell.position.set(0, (H + .4) / 2 - .2, 0); shell.receiveShadow = true; G.add(shell);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(W * .62, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), wallM); dome.material.side = THREE.BackSide; dome.scale.set(1, .32, D / W); dome.position.y = H + .2; G.add(dome);
  const floor = add(new THREE.CircleGeometry(W * .62, 48), floorM, 0, 0, 0, G); floor.rotation.x = -Math.PI / 2; floor.scale.set(1, D / W, 1);
  // rubbery floor mat with a ring
  const mat = add(new THREE.RingGeometry(.9, 1.05, 48), M(0x8a4f6c, { roughness: .6 }), 0, .005, .45, G); mat.rotation.x = -Math.PI / 2;
  // ---------- eye windows (front wall, -z): oval glass showing the outside, thick pink lids around them ----------
  const zF = -D * .62 + .12, eyeY = 1.75, viewMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  refs.eyes = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.CircleGeometry(.62, 48), viewMat); e.scale.set(1, .78, 1); e.position.set(s * .78, eyeY, zF + .02); G.add(e);
    const lid = add(new THREE.TorusGeometry(.64, .09, 16, 64), M(0xd9798f, { roughness: .5 }), s * .78, eyeY, zF + .05, G); lid.scale.set(1, .78, 1);
    // half-closed bored lid that can drop (eyelid plane above the glass)
    refs.eyes.push(e);
  }
  // window uvs: the two eyes share one wide view, left eye shows the left half
  refs.eyes.forEach((e, i) => { const uv = e.geometry.attributes.uv.clone(); for (let k = 0; k < uv.count; k++) uv.setX(k, uv.getX(k) * .5 + (i ? .5 : 0)); e.geometry = e.geometry.clone(); e.geometry.setAttribute('uv', uv); });
  refs.setView = tex => { viewMat.map = tex; viewMat.needsUpdate = true; };
  // ---------- console: rounded body, angled top panel, button grid, monitor, gauge (left), lever (right) ----------
  const C = grp(0, 0, zF + .95, G), body = M(0x3a4a66, { roughness: .4, metalness: .3 }), trim = M(0xc9d3e2, { roughness: .3, metalness: .5 });
  rb(2.6, .78, .7, body, 0, .39, 0, C, .12);
  const panel = rb(2.5, .06, .55, M(0x27334a, { roughness: .35 }), 0, .84, .02, C, .03); panel.rotation.x = .32;
  rb(2.64, .05, .74, trim, 0, .79, 0, C, .02);
  // buttons: rows of glowing caps
  refs.buttons = [];
  const cols = [0xff5a5a, 0x4fd18b, 0x4fa6ff, 0xffd14f, 0xc77dff];
  for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) {
    const m = new THREE.MeshStandardMaterial({ color: cols[(i + r) % 5], emissive: cols[(i + r) % 5], emissiveIntensity: .6, roughness: .3 });
    const b = add(cyl(.045, .05, .04, 20), m, -.55 + i * .14 - (r ? .07 : 0), .9 + r * .03, .12 - r * .14, C); b.rotation.x = .32; refs.buttons.push(b);
  }
  // monitor (status screen): stand + bezel + canvas screen
  rb(.12, .32, .1, trim, 0, 1.0, -.18, C, .03);
  rb(1.0, .62, .07, M(0x1d2433, { roughness: .4 }), 0, 1.38, -.2, C, .05);
  const scr = document.createElement('canvas'); scr.width = 640; scr.height = 384; const sg = scr.getContext('2d'), scrTex = new THREE.CanvasTexture(scr); scrTex.colorSpace = THREE.SRGBColorSpace;
  add(new THREE.PlaneGeometry(.92, .54), new THREE.MeshBasicMaterial({ map: scrTex, toneMapped: false }), 0, 1.38, -.163, C, { shadow: false });
  let scrState = '';
  function drawScreen(state, t, level = 1) {
    // a topic can draw its own screen: pass a function (g, w, h, t) as `screen` (redrawn 12x a second)
    if (typeof state === 'function') { const k = 'fn' + Math.floor(t * 12); if (k === scrState) return; scrState = k; state(sg, 640, 384, t); scrTex.needsUpdate = true; return; }
    const key = state + (state === 'unknown' ? Math.floor(t * 6) % 2 : state === 'idle' ? Math.floor(t * 8) : state === 'muted' ? Math.round(level * 40) : state === 'predict' ? Math.floor(t * 10) : ''); if (key === scrState) return; scrState = key;
    const w = 640, h = 384; sg.fillStyle = state === 'unknown' ? (Math.floor(t * 6) % 2 ? '#7a0a12' : '#c0121f') : '#0c2a22'; sg.fillRect(0, 0, w, h);
    sg.textAlign = 'center'; sg.textBaseline = 'middle'; const big = t => { sg.font = '800 64px Fredoka, Arial Black, sans-serif'; sg.fillText(t, w / 2, h * .62); }, small = t => { sg.font = '700 40px Fredoka, Arial, sans-serif'; sg.fillText(t, w / 2, h * .25); };
    if (state === 'idle') { sg.strokeStyle = '#4dff9a'; sg.lineWidth = 6; sg.beginPath(); for (let x = 0; x <= w; x += 8) { const p = ((x / w) * 3 + t * .8) % 1, y = h * .55 - (p > .45 && p < .5 ? 90 : p > .5 && p < .55 ? -50 : 0); x ? sg.lineTo(x, y) : sg.moveTo(x, y); } sg.stroke(); sg.fillStyle = '#4dff9a'; small('ALL CALM'); }
    else if (state === 'predict') {   // scanning the incoming touch, then the PREDICTED stamp slams in
      const u = t - (refs.predictT ?? t); sg.fillStyle = '#ffd14f'; small('YOUR OWN HAND');
      if (u < .9) { sg.fillStyle = '#1d4a3a'; sg.fillRect(60, h * .52, w - 120, 44); sg.fillStyle = '#4dff9a'; sg.fillRect(60, h * .52, (w - 120) * Math.min(1, u / .9), 44); sg.font = '700 34px Fredoka, Arial, sans-serif'; sg.fillText('SCANNING' + '.'.repeat(1 + Math.floor(u * 6) % 3), w / 2, h * .82); }
      else { const k = Math.max(1, 1.6 - (u - .9) * 4); sg.save(); sg.translate(w / 2, h * .62); sg.scale(k, k); sg.rotate(-.06); sg.fillStyle = '#4dff9a'; sg.font = '800 64px Fredoka, Arial Black, sans-serif'; sg.fillText('PREDICTED ✓', 0, 0); sg.restore(); } }
    else if (state === 'muted') {   // a big TICKLE volume bar draining as the lever comes down
      const pct = Math.round(level * 100); sg.fillStyle = '#fff'; sg.font = '800 46px Fredoka, Arial Black, sans-serif'; sg.fillText('TICKLE FEELING', w / 2, h * .17);
      sg.fillStyle = '#1d4a3a'; sg.fillRect(60, h * .32, w - 120, h * .3); const col = level > .5 ? '#ff5a5a' : level > .2 ? '#ffd14f' : '#4dff9a';
      sg.fillStyle = col; sg.fillRect(68, h * .32 + 8, (w - 136) * Math.max(.03, level), h * .3 - 16);
      sg.fillStyle = col; sg.font = '800 72px Fredoka, Arial Black, sans-serif'; sg.fillText(pct + '%' + (level < .2 ? '  ▼' : ''), w / 2, h * .82); }
    else if (state === 'unknown') { sg.fillStyle = '#fff'; small('!! WARNING !!'); big('UNKNOWN FINGER'); }
    scrTex.needsUpdate = true;
  }
  // gauge (left): dial face + needle
  const gauge = grp(-1.0, 1.08, -.05, C);
  add(cyl(.2, .2, .05, 40), M(0x1d2433), 0, 0, 0, gauge).rotation.x = Math.PI / 2;
  const gf = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f4f1e8'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill();
    for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.15 - i * .13); g.strokeStyle = i > 7 ? '#d23' : '#333'; g.lineWidth = i % 5 ? 4 : 8; g.beginPath(); g.moveTo(128 + Math.cos(a) * 100, 128 - Math.sin(a) * 100); g.lineTo(128 + Math.cos(a) * 82, 128 - Math.sin(a) * 82); g.stroke(); }
    g.fillStyle = '#333'; g.font = '800 30px Fredoka, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('FEELING', 128, 190); });
  add(new THREE.CircleGeometry(.185, 40), new THREE.MeshBasicMaterial({ map: gf, toneMapped: false }), 0, 0, .027, gauge, { shadow: false });
  const needle = grp(0, 0, .035, gauge); rb(.012, .15, .01, M(0xd22222, { emissive: 0x550000 }), 0, .065, 0, needle, .004); add(cyl(.02, .02, .02, 16), trim, 0, 0, 0, needle).rotation.x = Math.PI / 2;
  // lever (right): slot plate with scale, handle on an arm that tilts from down (0) to up (1)
  const lv = grp(1.0, .86, .05, C); lv.rotation.x = .32;
  rb(.18, .03, .5, M(0x1d2433), 0, 0, 0, lv, .02);
  const lvLabel = canvasTex(256, 96, (g, w, h) => { g.fillStyle = '#ffd14f'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = '800 54px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(leverLabel, w / 2, h / 2 + 3); });
  const lbl = add(new THREE.PlaneGeometry(.36, .135), new THREE.MeshBasicMaterial({ map: lvLabel, toneMapped: false }), 0, .02, .34, lv, { shadow: false }); lbl.rotation.x = -Math.PI / 2;
  const arm = grp(0, .02, 0, lv); rb(.035, .4, .035, trim, 0, .2, 0, arm, .012); const knob = add(sph(.075), M(0xe23b3b, { roughness: .3 }), 0, .42, 0, arm);
  // world position of the lever knob for a lever value (1 = up, 0 = down): lets a hand sit ON the knob
  refs.knobAt = l => { const keep = arm.rotation.x; arm.rotation.x = THREE.MathUtils.lerp(.75, -.75, l); G.updateMatrixWorld(true); const p = knob.getWorldPosition(new THREE.Vector3()); arm.rotation.x = keep; return p; };
  // alarm beacon on top of the monitor + its light (zero unless alarmed)
  const bea = grp(0, 1.72, -.2, C); add(cyl(.09, .1, .05), trim, 0, 0, 0, bea);
  const beaM = new THREE.MeshStandardMaterial({ color: 0xff2a2a, emissive: 0xff0000, emissiveIntensity: 0, transparent: true, opacity: .9, roughness: .2 }); add(sph(.09, 0, Math.PI * 2, 0, Math.PI / 2), beaM, 0, .025, 0, bea);
  const alarmLight = new THREE.PointLight(0xff2020, 0, 6, 1.5); alarmLight.position.set(0, 1.9, zF + .8); G.add(alarmLight);
  const redWash = new THREE.SpotLight(0xff2020, 0, 9, .7, .6, 1); redWash.position.set(0, H, zF + .8); redWash.target.position.set(0, 0, 0); G.add(redWash, redWash.target);
  // ---------- nerve cables: glowing tubes from the walls into the back of the console; pulses travel along them ----------
  refs.cables = [];
  const cableM = new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffc23d, emissiveIntensity: .35, roughness: .4 });
  for (const [sx, h0] of [[-1, 1.5], [1, 1.3], [-1, .6], [1, .7]]) {
    const pts = [new THREE.Vector3(sx * W * .58, h0 + .9, .6), new THREE.Vector3(sx * 1.6, h0 + .5, .2), new THREE.Vector3(sx * 1.25, .5, zF + .7), new THREE.Vector3(sx * .6, .35, zF + 1.25)];
    const curve = new THREE.CatmullRomCurve3(pts), tube = add(new THREE.TubeGeometry(curve, 40, .035, 10), cableM, 0, 0, 0, G);
    const blob = add(sph(.07), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 0, 0, 0, G, { shadow: false }); refs.cables.push({ curve, blob, tube });
  }
  // ---------- stool, mug, sign ----------
  const stool = grp(0, 0, zF + 1.75, G); add(cyl(.05, .05, .42), trim, 0, .21, 0, stool); add(cyl(.25, .25, .07), M(0xe23b3b, { roughness: .45 }), 0, .45, 0, stool);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; rb(.3, .03, .05, trim, Math.cos(a) * .13, .03, Math.sin(a) * .13, stool, .01).rotation.y = -a; }
  if (chairBack) {   // swivel chair version: a padded backrest behind her (+z) so lean-back poses rest on something
    const back = grp(0, .47, .2, stool); back.rotation.x = .38;
    add(new THREE.BoxGeometry(.05, .5, .04), trim, 0, .18, .02, back);
    rb(.5, .46, .08, M(0xe23b3b, { roughness: .45 }), 0, .55, 0, back, .03);
  }
  refs.seat = new THREE.Vector3(at[0], at[1] + .48, at[2] + zF + 1.75); refs.stool = stool;   // topics may raise / push it
  const mug = grp(-.45, .8, .2, C); add(cyl(.05, .045, .1), M(0xffffff, { roughness: .35 }), 0, .05, 0, mug); add(new THREE.TorusGeometry(.03, .01, 8, 16), M(0xffffff), .055, .05, 0, mug);
  const signT = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#2c3e66'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 30); g.fill(); g.fillStyle = '#ffd14f'; g.font = '800 76px Fredoka, Arial Black, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BRAIN HQ', w / 2, h / 2 + 4); });
  add(new THREE.PlaneGeometry(1.1, .275), new THREE.MeshBasicMaterial({ map: signT, toneMapped: false, transparent: true }), 0, 2.62, zF + .1, G, { shadow: false });
  // ---------- lighting: warm overhead lamp (shadows) + soft fill; nothing dark ----------
  const lamp = new THREE.SpotLight(0xfff0dd, 30, 8, .9, .5, 1.2); lamp.position.set(.6, H + .3, 1.2); lamp.target.position.set(0, .6, zF + 1.2); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); G.add(lamp, lamp.target);
  const fill = new THREE.PointLight(0xffd6e2, 6, 7, 1.2); fill.position.set(0, 1.8, 1.4); G.add(fill);
  refs.lights = [lamp, fill];
  // ---------- state ----------
  refs.set = ({ screen = 'idle', lever = 1, gauge: gv = .6, alarm = 0, pulse = -1, t = 0, hideCables = [] } = {}) => {
    drawScreen(screen, t, lever); refs.cables.forEach((c, i) => { c.tube.visible = !hideCables.includes(i); });
    arm.rotation.x = THREE.MathUtils.lerp(.75, -.75, lever);                                    // 1 = handle forward/up
    needle.rotation.z = THREE.MathUtils.lerp(1.2, -1.2, gv) + (alarm ? Math.sin(t * 40) * .08 * alarm : 0);
    const on = alarm > 0 && Math.floor(t * 6) % 2 === 0 ? alarm : alarm * .25;
    beaM.emissiveIntensity = on * 3; alarmLight.intensity = on * 14; redWash.intensity = on * 40;
    refs.buttons.forEach((b, i) => { b.material.emissiveIntensity = .35 + .45 * (Math.sin(t * 3 + i * 1.7) > .3 ? 1 : 0) + (alarm ? on : 0); });
    cableM.emissiveIntensity = .35 + (pulse >= 0 ? .25 : 0);
    refs.cables.forEach((c, i) => { c.blob.visible = pulse >= 0; if (pulse >= 0) { c.blob.position.copy(c.curve.getPoint(Math.min(1, Math.max(0, (pulse * 1.1 - i * .03) % 1)))); c.blob.scale.setScalar(.6 + lever * .8); } });
  };
  refs.spots = {   // camera keys (world) that frame the room well in 9:16
    wide: { p: [at[0] + 1.3, at[1] + 1.5, at[2] + 1.75], l: [at[0] - .1, at[1] + 1.15, at[2] + zF + .9], fov: 52 },
    operator: { p: [at[0] + .05, at[1] + 1.25, at[2] + zF + .55], l: [at[0], at[1] + .85, at[2] + zF + 1.75], fov: 40 },
    lever: { p: [at[0] + 1.55, at[1] + 1.35, at[2] + zF + 1.5], l: [at[0] + 1.0, at[1] + .9, at[2] + zF + .95], fov: 34 },
    screen: { p: [at[0] + .35, at[1] + 1.4, at[2] + zF + 1.75], l: [at[0], at[1] + 1.38, at[2] + zF + .75], fov: 34 },
  };
  refs.set({});
  return refs;
}
