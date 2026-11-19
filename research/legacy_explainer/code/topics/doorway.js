// WHY YOU FORGET WHY YOU WALKED INTO A ROOM (Format A, living room + hallway kitchen + Brain HQ). Xavier's take, 24.1 s.
// 0-5.7     cold open in the kitchen: blank. Fridge. Drawer. Nothing. (his phone hangs in his hand all along: 1%)
// 5.7-8.15  "the second you walk through a door": him walking from the living room through the doorway into the kitchen
// 8.15-16.9 Brain HQ: NEW ROOM bell, chapter 2, little him files the GET CHARGER note in the LIVING ROOM drawer, slam
// 17.1-18.8 he walks back out into the living room
// 18.85-20.45 Brain HQ: the drawer bursts open, the note flies out
// 20.5-21.9 living room: the charger! (lights up)
// 21.9-24.1 walks back in -> Brain HQ insert: drawer slammed -> kitchen, blank again (same frame as the open = loop),
//           punch-in on the phone: 1%.
import * as THREE from 'three';
export const FORMAT = 'A';
export const SET = 'livingroom';

// poses new to this video. Avatar frame: +x its left, +z forward.
export const LOCAL_POSES = {
  blank:     { armL: [.42, -.72, .55], armR: [-.22, -.95, .1], legL: [.1, -1, .02], legR: [-.12, -1, -.04], head: [-.05, .1, .12], root: { rz: .04, x: .02 } },     // standing, lost, phone dangling in the left hand
  blank2:    { armL: [.2, -.96, .16], armR: [-.55, -.6, .55], legL: [.14, -1, -.06], legR: [-.08, -1, .06], head: [.3, -.12, -.1], root: { rz: -.05, ry: .25 } },  // looks round the room, hand on hip
  phoneDown: { armL: [.3, -.55, .78], armR: [-.22, -.95, .1], legL: [.1, -1, .02], legR: [-.12, -1, -.04], head: [.02, .38, .05], root: { rx: .08 } },              // glances down at the phone
  // ACTION THEN REACTION (Xavier 2026-11-10): reach the handle, THEN pull with it. Nothing opens by itself.
  reachHandle: { armR: [.38, -.18, .9], armL: [.25, -.95, .12], legL: [.1, -1, .1], legR: [-.12, -1, -.06], head: [-.05, .08, .05], root: { rx: .08, rz: -.04 } },   // right hand on the fridge handle (the hand the camera sees)
  pullDoor:  { armR: [.72, -.25, .64], armL: [.3, -.9, -.2], legL: [.16, -1, -.16], legR: [-.1, -1, .14], head: [.12, .12, .05], root: { rx: -.12, ry: .3, z: -.08, rz: .05 } },   // leans back, swings the door out
  peekFridge:{ armL: [.6, -.78, .1], armR: [-.55, -.6, .55], legL: [.12, -1, .05], legR: [-.15, -1, -.12], head: [.12, .22, .1], root: { rx: .16, ry: .55, x: .04 } },
  reachDrawer: { armR: [-.08, -.55, .83], armL: [.4, -.85, .2], legL: [.12, -1, -.14], legR: [-.1, -1, .16], head: [0, .38, .05], root: { rx: .34, y: -.03, rz: .04 } },   // bends, grabs the drawer pull
  pullDrawer:  { armR: [-.08, -.88, .46], armL: [.42, -.8, .3], legL: [.12, -1, -.18], legR: [-.1, -1, .12], head: [0, .42, .08], root: { rx: .14, z: -.1, rz: .04 } },    // drags it out
  lookDrawer:  { armR: [-.25, -.92, .3], armL: [.35, -.85, .35], legL: [.14, -1, -.1], legR: [-.12, -1, .14], head: [.05, .5, .12], root: { rx: .34, rz: -.05 } },        // leans over, looks in
  // kitchen versions: the LEFT hand (camera side) does the drawer, the right one hangs out of the way
  reachDrawerL: { armL: [-.18, -.55, .82], armR: [-.15, -.72, -.68], legL: [.12, -1, .16], legR: [-.1, -1, -.14], head: [0, .38, -.05], root: { rx: .34, y: -.03, rz: -.04 } },
  pullDrawerL:  { armL: [-.16, -.88, .45], armR: [-.15, -.75, -.65], legL: [.12, -1, .12], legR: [-.1, -1, -.18], head: [0, .42, -.08], root: { rx: .14, z: -.1, rz: -.04 } },
  lookDrawerL:  { armL: [-.1, -.92, .35], armR: [-.12, -.8, -.58], legL: [.14, -1, .14], legR: [-.12, -1, -.1], head: [-.05, .5, -.12], root: { rx: .34, rz: .05 } },
  nothing:   { armL: [.85, .25, .45], armR: [-.6, -.7, .4], legL: [.08, -1, .05], legR: [-.16, -1, -.08], head: [.22, -.05, .25], root: { rz: -.07, ry: -.12 } },      // one-arm shrug, head tilted
  // RAISED ARMS (my own poses, built on what Xavier's reference poses teach, 2026-11-10): a raised arm rotates ~pi AND
  // slides out of the shoulder (o up/out) so it never sinks into the head; the whole body commits (other arm flung, legs
  // uneven with offsets, hips shifted, body tilted toward the raised arm); a hop (root y) is a moment, then he lands.
  chargerJump: { armR: { r: [-2.95, 0, 0.05], o: [0.1, 0.42, 0.05] }, armL: { r: [0.35, 0, 0.8], o: [0.06, -0.04, -0.03] }, legL: { r: [-0.4, 0, 0.3], o: [0.06, -0.03, 0.05] }, legR: { r: [0.3, 0, -0.18], o: [-0.03, -0.02, -0.03] }, head: { r: [-.38, .25, .12] }, root: { y: .14, rx: -.12, rz: .22, x: .1 } },   // THE CHARGER!: points straight up, jumps
  charger:   { armR: { r: [-2.9, 0, 0.05], o: [0.1, 0.4, 0.05] }, armL: { r: [0.3, 0, 0.7], o: [0.05, -0.04, -0.03] }, legL: { r: [-0.25, 0, 0.22], o: [0.05, -0.04, 0.04] }, legR: { r: [0.18, 0, -0.12], o: [-0.03, -0.02, -0.02] }, head: { r: [-.32, .22, .1] }, root: { rx: -.1, rz: .18, x: .08 } },   // landed, still pointing up
  cheerJump: { armL: { r: [0, 0, 2.9], o: [0.3, 0.22, 0] }, armR: { r: [-2.2, 0, -0.3], o: [-0.04, 0.12, 0.08] }, legL: { r: [0.2, 0, 0.32], o: [0.07, -0.04, 0] }, legR: { r: [-0.35, 0, -0.15], o: [-0.03, -0.02, 0.05] }, head: { r: [-.32, -.22, -.1] }, root: { y: .13, rz: -.16, x: -.08 } },   // NEW ROOM!: one arm up the side, a fist out front, hop
  cheer:     { armL: { r: [0, 0, 2.8], o: [0.28, 0.2, 0] }, armR: { r: [-2.0, 0, -0.3], o: [-0.04, 0.1, 0.07] }, legL: { r: [0.15, 0, 0.28], o: [0.06, -0.05, 0] }, legR: { r: [-0.2, 0, -0.12], o: [-0.03, -0.03, 0.03] }, head: { r: [-.28, -.2, -.1] }, root: { rz: -.14, x: -.07 } },
  noteUp:    { armR: { r: [-1.95, -0.2, 0], o: [-0.03, 0.09, 0.1] }, armL: { r: [0.01, 0, 0.58], o: [0.046, -0.054, 0] }, legL: { r: [0.088, 0.017, 0.3], o: [0.07, -0.05, 0] }, legR: { r: [0.15, -0.02, -0.2], o: [-0.05, -0.03, 0.02] }, head: { r: [-.12, .25, .1] }, root: { x: .1, rz: .22 } },   // the note held up to us, the body tilted into it
  shocked:   { armL: { r: [0, 0, 2.1], o: [0.2, 0.12, 0] }, armR: { r: [-1.3, 0, -0.4], o: [-0.03, 0.05, 0.06] }, legL: { r: [0.15, 0, 0.3], o: [0.06, -0.04, 0] }, legR: { r: [-0.25, 0, -0.12], o: [-0.03, 0, -0.04] }, head: { r: [-.3, -.15, .12] }, root: { rx: -.22, rz: -.12, z: -.05 } },
  panic:     { armL: { r: [0.3, 0, 2.6], o: [0.28, 0.2, 0] }, armR: { r: [-0.2, 0, -2.35], o: [-0.25, 0.16, 0.02] }, legL: { r: [0.35, 0, 0.25], o: [0.06, -0.03, 0.04] }, legR: { r: [-0.2, 0, -0.1], o: [-0.03, 0, -0.03] }, head: { r: [-.3, .3, .15] }, root: { rx: -.12, rz: .15, x: .06 } },
  windup:    { armR: [-.25, -.2, -.95], armL: [.5, -.8, .3], legL: [.2, -1, -.2], legR: [-.12, -1, .2], head: [0, .25, .1], root: { rx: -.1, ry: -.3, rz: -.05 } },   // arm cocked back before the slam
  stuff:     { armR: [-.05, -.35, .94], armL: [.5, -.6, .55], legL: [.22, -1, -.15], legR: [-.12, -1, .2], head: [.05, .35, .1], root: { rx: .22, rz: -.05 } },
  stuffPush: { armR: [0, -.6, .8], armL: [.6, -.3, .7], legL: [.25, -1, -.2], legR: [-.14, -1, .24], head: [.1, .45, .12], root: { rx: .32, rz: -.08 } },
  slam:      { armR: [-.05, -.45, .9], armL: [.8, .3, -.4], legL: [.28, -1, -.22], legR: [-.12, -1, .28], head: [-.15, .2, -.15], root: { rx: .2, rz: .12, x: .05 } },
  smug:      { armL: [-.85, .05, .5], armR: [.75, -.1, .6], legL: [.3, -1, .1], legR: [-.06, -1, -.08], head: [-.35, -.1, -.2], root: { rz: .1, ry: .35 } },
};

export const POSE_SHEET = [   // POSE REVIEW: every acted pose, in story order
  ['phoneDown', 'guy', 'phoneDown', 'neutral', ''],
  ['reachHandle', 'guy', 'reachHandle', 'neutral', ''],
  ['pullDoor', 'guy', 'pullDoor', 'neutral', ''],
  ['peekFridge', 'guy', 'peekFridge', 'neutral', ''],
  ['reachDrawer', 'guy', 'reachDrawer', 'neutral', ''],
  ['pullDrawer', 'guy', 'pullDrawer', 'neutral', ''],
  ['lookDrawer', 'guy', 'lookDrawer', 'neutral', ''],
  ['nothing', 'guy', 'nothing', 'confused', ''],
  ['cheerJump', 'guy', 'cheerJump', 'happy', ''],
  ['noteUp', 'guy', 'noteUp', 'smirk', ''],
  ['stuffPush', 'guy', 'stuffPush', 'neutral', ''],
  ['windup', 'guy', 'windup', 'neutral', ''],
  ['slam', 'guy', 'slam', 'stern', ''],
  ['smug', 'guy', 'smug', 'smirk', ''],
  ['shocked', 'guy', 'shocked', 'shocked', ''],
  ['panic', 'guy', 'panic', 'scream', ''],
  ['chargerJump', 'guy', 'chargerJump', 'happy', ''],
  ['charger', 'guy', 'charger', 'happy', '']
];
export async function setup({ CAST, world, scene, camera: CAM }) {
  const U = await import(new URL('kit/util.js', document.baseURI).href), { pbr } = await import(new URL('kit/pbr.js', document.baseURI).href);
  const { buildBrainRoom } = await import(new URL('kit/sets/brainroom.js', document.baseURI).href), RB = await import(new URL('kit/roblox.js', document.baseURI).href);
  const { M, rb, add, grp } = U, L = LOCAL_POSES, PI = Math.PI, V3 = (x, y, z) => new THREE.Vector3(x, y, z), sm = THREE.MathUtils.smoothstep;
  const G = world.W, X1 = world.hall.x1;   // the hallway's far wall becomes a kitchen run

  // ---------- kitchen in the hallway: fridge + base cabinets with drawers on the far wall (x1) ----------
  // hide the hallway's wall picture (it sits where the backsplash goes)
  G.updateMatrixWorld(true);
  G.traverse(o => { if (o.isGroup && o.parent === G && Math.abs(o.position.x - (X1 - .02)) < .05 && Math.abs(o.position.y - 1.5) < .05) o.visible = false; });
  const cabM = pbr('ph/kitchen_wood', { rep: [1, 1], rough: .7, normal: .6 }), topM = pbr('ph/marble_01', { rep: [2, .5], rough: .25, normal: .3 });
  const tileM = pbr('ph/long_white_tiles', { rep: [3, .7], rough: .3, normal: .6 }), steel = M(0xd9dde0, { roughness: .3, metalness: .6 }), pullM = M(0x2b2b2b, { roughness: .35, metalness: .7 });
  const K = grp(0, 0, 0, G), Z0 = 1.35, Z1 = 3.75, DEP = .62, CH = .88, cx = X1 - DEP / 2;
  rb(DEP - .02, .1, Z1 - Z0, M(0x2a2420), cx + .03, .05, (Z0 + Z1) / 2, K, .005);                 // toe kick
  rb(DEP - .04, CH - .1, Z1 - Z0, cabM, cx, .1 + (CH - .1) / 2, (Z0 + Z1) / 2, K, .01);             // carcass
  rb(DEP + .03, .04, Z1 - Z0 + .03, topM, cx - .015, CH + .02, (Z0 + Z1) / 2, K, .008);              // quartz top
  rb(.012, .55, Z1 - Z0, tileM, X1 - .006, CH + .04 + .275, (Z0 + Z1) / 2, K, .002);                  // backsplash
  const NB = 4, bw = (Z1 - Z0) / NB, FX = cx - DEP / 2 + .01, drawers = [];
  for (let i = 0; i < NB; i++) {
    const zc = Z0 + bw * (i + .5);
    const d = grp(FX, 0, zc, K); rb(.025, .17, bw - .02, cabM, -.012, .76, 0, d, .006); rb(.025, .015, .2, pullM, -.04, .76, 0, d, .004);   // drawer front + bar pull
    { const bm = M(0xe9e2d6, { roughness: .8 }), L0 = DEP - .1, W0 = bw - .08;   // the drawer box behind the front: hollow (bottom + 3 sides), so an open drawer reads EMPTY
      rb(L0, .012, W0, bm, .27, .685, 0, d, .003); rb(.012, .12, W0, bm, .27 + L0 / 2, .74, 0, d, .003);
      for (const sz of [-1, 1]) rb(L0, .12, .012, bm, .27, .74, sz * W0 / 2, d, .003); }
    drawers.push(d);
    for (const s of [-1, 1]) if (i % 2 === (s > 0 ? 1 : 0)) {} // (doors are single per bay)
    rb(.025, .55, bw - .02, cabM, FX - .012, .1 + .55 / 2 + .02, zc, K, .006); rb(.025, .16, .015, pullM, FX - .04, .55, zc + (i % 2 ? -1 : 1) * (bw / 2 - .07), K, .004);   // door + pull
  }
  const yankD = drawers[1], yankZ = Z0 + bw * 1.5;
  // a few things on the counter
  { const toaster = grp(cx - .02, CH + .04, Z0 + .35, K); rb(.2, .2, .32, steel, 0, .1, 0, toaster, .05); rb(.16, .01, .02, M(0x111111), 0, .2, -.06, toaster, .003); rb(.16, .01, .02, M(0x111111), 0, .2, .06, toaster, .003);
    const bowl = add(new THREE.SphereGeometry(.15, 24, 12, 0, PI * 2, PI / 2, PI / 2), M(0xf4f1ea, { roughness: .4 }), cx - .05, CH + .19, Z1 - .45, K); bowl.material.side = THREE.DoubleSide;
    for (const [dx, dz, c] of [[-.04, 0, 0xf28c1e], [.05, .04, 0xf28c1e], [0, -.06, 0xd8352a], [.02, .07, 0xf2c94c]]) add(new THREE.SphereGeometry(.05, 16, 12), M(c, { roughness: .5 }), cx - .05 + dx, CH + .1, Z1 - .45 + dz, K);
    const board = rb(.02, .32, .24, pbr('ph/fine_grained_wood', { rough: .6 }), X1 - .03, CH + .2, Z0 + 1.0, K, .01); board.rotation.z = -.12; }
  // fridge (stainless, freezer drawer at the bottom), door hinged on its -z edge, swings out toward -x / -z
  const FZ = .78, FW = .8, FD = .7, FH = 1.85, ffx = X1 - FD / 2 - .02;
  const fr = grp(ffx, 0, FZ, K);
  rb(FD, FH, FW, steel, 0, FH / 2, 0, fr, .03);
  const inner = M(0xffffff, { emissive: 0xfff8ee, emissiveIntensity: .55, roughness: .6 });
  rb(.02, FH - .7, FW - .1, inner, -FD / 2 + .12, .62 + (FH - .7) / 2, 0, fr, .004);                    // lit back of the cavity (seen when open)
  for (const y of [.95, 1.3, 1.62]) rb(FD - .2, .015, FW - .1, M(0xdfe8ee, { roughness: .1, transparent: true, opacity: .7 }), -FD / 2 + .3, y, 0, fr, .003);
  for (const [y, dz, c, h] of [[.96, -.2, 0xffffff, .22], [.96, .15, 0x3aa35b, .12], [1.31, -.05, 0xe2683f, .1], [1.31, .22, 0xf2c94c, .14], [1.63, -.15, 0x7fb3e0, .16]]) rb(.12, h, .1, M(c, { roughness: .6 }), -FD / 2 + .3, y + h / 2 + .01, dz, fr, .02);
  const fdoor = grp(-FD / 2 - .01, 0, -FW / 2, fr);                                                      // hinge line
  rb(.05, FH - .62, FW, steel, -.025, .6 + (FH - .62) / 2, FW / 2, fdoor, .02); rb(.04, .7, .03, pullM, -.07, 1.25, FW - .08, fdoor, .012);
  rb(.05, .55, FW, steel, -FD / 2 - .035, .3, 0, fr, .02); rb(.04, .03, .4, pullM, -FD / 2 - .08, .52, 0, fr, .012);   // freezer drawer
  const fLight = new THREE.PointLight(0xfff3e0, 0, 1.6, 2); fLight.position.set(ffx - FD / 2 - .25, 1.25, FZ); K.add(fLight);
  { const cs = U.canvasTex ? null : null; }

  // ---------- cast ----------
  const guy = await CAST.castMain('guy'), op = await CAST.castMain('guy', { seed: 11 });
  // his phone, dangling in his left hand all video, screen to the front: red battery, 1%
  const scr = document.createElement('canvas'); scr.width = 256; scr.height = 512; const sg = scr.getContext('2d'), scrT = new THREE.CanvasTexture(scr); scrT.colorSpace = THREE.SRGBColorSpace;
  const drawPhone = blink => { sg.fillStyle = '#0d0d10'; sg.fillRect(0, 0, 256, 512); sg.strokeStyle = blink ? '#ff3b30' : '#e6e6e6'; sg.lineWidth = 12; sg.strokeRect(58, 150, 120, 220); sg.fillStyle = sg.strokeStyle; sg.fillRect(94, 128, 48, 22);
    sg.fillStyle = '#ff3b30'; sg.fillRect(70, 340, 96, 18); sg.fillStyle = '#ffffff'; sg.font = '800 84px Fredoka, Arial Black, sans-serif'; sg.textAlign = 'center'; sg.fillText('1%', 118, 460); scrT.needsUpdate = true; };
  drawPhone(false);
  const phone = new THREE.Group(); rb(.075, .155, .01, M(0x1b1b1f, { roughness: .3, metalness: .4 }), 0, 0, 0, phone, .008);
  add(new THREE.PlaneGeometry(.067, .145), new THREE.MeshBasicMaterial({ map: scrT, toneMapped: false }), 0, 0, .0052, phone, { shadow: false });
  phone.scale.setScalar(1.9);
  { const A = guy.A; A.reset(); A.root.updateMatrixWorld(true); const b = RB.partBoxes(A).armL, c = b.getCenter(V3());
    var phoneMark = new THREE.Object3D(); phoneMark.position.set(c.x, b.min.y - .08, c.z + .08); A.root.add(phoneMark); A.root.updateMatrixWorld(true); A.bones.armL.attach(phoneMark); scene.add(phone); }

  // ---------- staging (walls: doorway at x = 3, z = 2.4; kitchen side is +x) ----------
  const KS = [3.8, 0, 2.15];                       // where he stands blank in the kitchen (open + end: same spot = loop)
  const CAM1 = [4.1, 1.75, 6.25], faceCam1 = Math.atan2(CAM1[0] - KS[0], CAM1[2] - KS[2]);
  const LR = [2.1, 0, 2.45];                        // living room spot just out of the doorway
  const CAM_LR = [-.6, 1.75, .3], faceLR = Math.atan2(CAM_LR[0] - LR[0], CAM_LR[2] - LR[2]);
  guy.keys = [
    { t: 0, pose: L.blank, expr: 'confused', at: KS, face: faceCam1 },
    { t: .5, pose: L.blank2, expr: 'thinking', face: faceCam1 + .5 },
    { t: 1.25, pose: L.blank, expr: 'confused', face: faceCam1 - .45 },
    { t: 2.1, pose: 'stand', walk: true, cadence: 1.4, at: [3.65, 0, 1.05], face: PI / 2, dur: .4, ease: 'linear', hold: 0, expr: 'determined' },
    { t: 2.5, pose: L.reachHandle, dur: .28, ease: 'io' },                     // reach...
    { t: 2.8, pose: L.pullDoor, expr: 'annoyed', dur: .35, ease: 'io' },       // ...then pull (the door follows his hand)
    { t: 3.2, pose: L.peekFridge, expr: 'annoyed', dur: .3 },
    { t: 3.62, pose: 'stand', walk: true, cadence: 1.5, at: [4.0, 0, yankZ - .42], face: PI / 2, dur: .25, ease: 'linear', hold: 0 },
    { t: 3.87, pose: { ...L.reachDrawer, armR: [-.2, -.58, .79] }, expr: 'frustrated', dur: .2, ease: 'io' }, // reach...
    { t: 4.07, pose: { ...L.pullDrawer, armR: [-.25, -.86, .44] }, dur: .28, ease: 'io' },                        // ...then pull
    { t: 4.4, pose: { ...L.lookDrawer, armR: [-.3, -.9, .3], head: [-.25, .48, .1] }, expr: 'annoyed', dur: .25 },
    { t: 4.75, pose: L.nothing, expr: 'annoyed', face: Math.atan2(3.45 - 4.0, 4.3 - yankZ + .42) },
    // flashback: from the living room, through the doorway (crosses x = 3 on "door", 7.6 s)
    { t: 5.68, pose: 'stand', expr: 'neutral', at: [1.55, 0, 2.45], face: PI / 2, dur: .01, hold: 0 },
    { t: 5.75, pose: 'stand', walk: true, cadence: 1.15, at: [3.95, 0, 2.35], face: PI / 2, dur: 2.35, ease: 'linear', hold: 0 },
    { t: 8.1, pose: L.blank, expr: 'confused' },
    // (unseen) back to the kitchen spot, ready to walk out
    { t: 8.4, pose: L.blank, expr: 'thinking', at: [4.0, 0, 2.35], face: -PI / 2, dur: .01, hold: 0 },
    { t: 17.1, pose: 'stand', walk: true, cadence: 1.25, at: LR, face: -PI / 2, dur: 1.45, ease: 'linear', hold: 0, expr: 'bored' },
    { t: 18.55, pose: L.blank, expr: 'bored', face: faceLR - .6 },
    { t: 20.55, pose: L.chargerJump, expr: 'starstruck', face: faceLR, style: 'snap', snap: 1.3 },
    { t: 20.85, pose: L.charger, expr: 'starstruck', dur: .2 },
    { t: 21.9, pose: 'stand', walk: true, cadence: 1.4, at: [3.95, 0, 2.3], face: PI / 2, dur: .95, ease: 'linear', hold: 0, expr: 'happy' },
    { t: 22.85, pose: L.blank, expr: 'confused', at: KS, face: faceCam1, dur: .2 },
    { t: 23.55, pose: L.phoneDown, expr: 'confused' },
  ];

  { const q = new URLSearchParams(location.search).get('dbgpose'); if (q) guy.keys = [{ t: 0, pose: L[q] || q, expr: 'neutral', at: KS, face: faceCam1 }]; }
  // ---------- Brain HQ (x = 300) + a filing cabinet with the LIVING ROOM drawer ----------
  const B = buildBrainRoom(scene, { at: [300, 0, 0] }), O = [300, 0, 0], zF = -3.6 * .62 + .12, R = (x, y, z) => [O[0] + x, O[1] + y, O[2] + z];
  const label = (txt, w, h, bg, fg, font) => U.canvasTex(512, Math.round(512 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H / 2 + 4); });
  const cab = grp(-1.3, 0, -.75, B.group);                                                // front faces +z (toward the room / camera)
  const cabBody = M(0x7d8794, { roughness: .45, metalness: .45 });
  rb(.6, 1.02, .62, cabBody, 0, .51, 0, cab, .02);
  rb(.52, .44, .01, M(0x2e3440), 0, .74, .305, cab, .004); rb(.52, .44, .01, M(0x2e3440), 0, .27, .305, cab, .004);   // dark slots behind the drawers
  const mkDrawer = (y, txt) => { const d = grp(0, 0, 0, cab); rb(.54, .44, .035, cabBody, 0, y, .32, d, .012); rb(.16, .03, .03, pullM, 0, y + .1, .35, d, .01);
    const lab = add(new THREE.PlaneGeometry(.3, .09), new THREE.MeshBasicMaterial({ map: label(txt, .3, .09, '#fffbe8', '#1d2433', '800 64px Fredoka, Arial Black, sans-serif') }), 0, y - .04, .339, d, { shadow: false });
    rb(.5, .3, .55, M(0x6b7480, { roughness: .5, metalness: .3 }), 0, y - .03, .04, d, .01);   // the drawer box
    return d; };
  const roomDrawer = mkDrawer(.74, 'LIVING ROOM'); mkDrawer(.27, 'SCHOOL');
  // papers sticking out of the open drawer
  for (let i = 0; i < 5; i++) rb(.42, .005, .3, M(0xfdfcf7), 0, .78 + i * .008, .02 + i * .01, roomDrawer, .002).rotation.x = -.1 + i * .05;
  // the sticky note: GET CHARGER (in his hand, then filed, then flying out)
  const noteTex = U.canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#ffe24a'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, W, 34); g.fillStyle = '#20202a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const fit = (txt, y, max) => { let f = 70; do { g.font = `800 ${f}px Fredoka, Arial Black, sans-serif`; f -= 2; } while (g.measureText(txt).width > max); g.fillText(txt, W / 2, y); };   // text always inside the note
    fit('GET', 100, 150); fit('CHARGER', 165, 196); g.lineWidth = 6; g.strokeStyle = '#d33'; g.beginPath(); g.moveTo(52, 205); g.lineTo(204, 201); g.stroke(); });
  const noteMat = new THREE.MeshStandardMaterial({ map: noteTex, roughness: .8, side: THREE.DoubleSide });
  const handNote = new THREE.Mesh(new THREE.PlaneGeometry(.34, .34), noteMat);
  { const A = op.A; A.reset(); A.root.updateMatrixWorld(true); const b = RB.partBoxes(A).armR, c = b.getCenter(V3());
    var noteMark = new THREE.Object3D(); noteMark.position.set(c.x, b.min.y - .14, c.z); A.root.add(noteMark); A.root.updateMatrixWorld(true); A.bones.armR.attach(noteMark); B.group.add(handNote); }
  const flyNote = new THREE.Mesh(new THREE.PlaneGeometry(.26, .26), noteMat); flyNote.visible = false; roomDrawer.add(flyNote);   // springs up out of the papers when the drawer bursts
  const STAND = R(-1.22, 0, .38);               // right in front of the cabinet (front at z = -0.44), facing it
  op.keys = [
    { t: 0, pose: 'leanBack', expr: 'cool', at: R(0, .03, zF + 1.75), face: PI },
    { t: 8.15, pose: 'leanBack', expr: 'cool' },
    { t: 9.5, pose: 'pressButtons', expr: 'surprised', style: 'snap', snap: 1.3 },
    { t: 10.55, pose: L.cheerJump, expr: 'happy', style: 'snap' },
    { t: 10.85, pose: L.cheer, expr: 'happy', dur: .2 },
    { t: 11.75, pose: L.noteUp, expr: 'smirk', at: R(.1, 0, -.15), face: .25, dur: .3 },
    { t: 12.95, pose: 'stand', walk: true, cadence: 1.4, at: STAND, face: PI, dur: .45, ease: 'linear', hold: 0 },
    { t: 13.4, pose: L.reachDrawer, expr: 'determined', dur: .25, ease: 'io' },  // reach the drawer pull...
    { t: 13.65, pose: L.pullDrawer, dur: .3, ease: 'io' },                       // ...pull it open
    { t: 14.0, pose: L.stuff, expr: 'determined' },
    { t: 14.3, pose: L.stuffPush, expr: 'determined', style: 'snap' },
    { t: 15.05, pose: L.windup, expr: 'smirk', dur: .3 },                         // cock the arm...
    { t: 15.42, pose: L.slam, expr: 'smirk', style: 'snap', snap: 1.4 },         // ...SLAM
    { t: 16.0, pose: L.smug, expr: 'smirk', face: PI - 1.0 },
    { t: 18.9, pose: L.shocked, expr: 'shocked', style: 'snap', snap: 1.4, face: PI - .3 },
    { t: 19.7, pose: L.panic, expr: 'scream', steps: 2 },
    { t: 22.2, pose: L.windup, expr: 'angry', dur: .25, face: PI },
    { t: 22.5, pose: L.slam, expr: 'angry', style: 'snap', snap: 1.5 },
    { t: 22.95, pose: L.smug, expr: 'smirk', face: PI - 1.0 },
  ];
  // the console's status screen
  const screen = (g, w, h, t) => {
    const flash = Math.floor(t * 6) % 2, C = (bg, fg, a, b) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '700 42px Fredoka, Arial, sans-serif'; if (a) g.fillText(a, w / 2, h * .26); g.font = '800 70px Fredoka, Arial Black, sans-serif'; g.fillText(b, w / 2, h * .62); };
    if (t < 9.5) C('#0c2a22', '#4dff9a', 'LOCATION', 'LIVING ROOM');
    else if (t < 10.55) C(flash ? '#ffd23a' : '#ff9f1c', '#1d1d1d', 'DING DING', 'NEW ROOM!');
    else if (t < 11.75) C('#0c2a22', '#4dff9a', 'NOW PLAYING', 'CHAPTER 2');
    else if (t < 17) { C('#0c2a22', '#4dff9a', 'FILING OLD ROOM', ''); const k = Math.min(1, Math.max(0, (t - 12) / 3.4)); g.strokeStyle = '#4dff9a'; g.lineWidth = 6; g.strokeRect(80, 210, 480, 60); g.fillRect(88, 218, 464 * k, 44); }
    else if (t < 18.85) C('#0c2a22', '#4dff9a', 'LOCATION', 'LIVING ROOM');
    else if (t < 20.5) C(flash ? '#c0121f' : '#7a0a12', '#ffffff', 'WARNING', 'OLD FILE!');
    else if (t < 22.45) C('#0c2a22', '#4dff9a', 'REMEMBERED', 'CHARGER!');
    else C(flash ? '#ffd23a' : '#ff9f1c', '#1d1d1d', 'DING DING', 'NEW ROOM!');
  };
  // drawer: closed / opened by him / slammed / bursts open / slammed again
  const drawerOpen = t => {
    if (t < 13.65) return 0; if (t < 15.42) return .42 * sm(t, 13.65, 13.95);
    if (t < 19.0) return .42 * (1 - sm(t, 15.42, 15.5));
    if (t < 22.58) { const u = t - 19.0; return .45 + .07 * Math.exp(-u * 5) * Math.sin(u * 22); }
    return .45 * (1 - sm(t, 22.58, 22.65));
  };

  // ---------- camera ----------
  const D2R = PI / 180, shot = (tg, from, frameH, o = {}) => { const d = Math.hypot(from[0] - tg[0], from[1] - tg[1], from[2] - tg[2]); return { p: from, l: tg, fov: 2 * Math.atan(frameH / 2 / d) / D2R, ...o }; };
  const HEADK = [KS[0], 1.15, KS[2]];
  const camera = [
    // kitchen: blank
    { t: 0, ...shot(HEADK, [4.05, 1.7, 5.4], 2.6) },                                           // hook: fast push in on the blank face
    { t: .9, ...shot([KS[0], 1.3, KS[2]], CAM1, 1.45, { ease: 'out' }) },
    { t: .95, ...shot([KS[0], 1.35, KS[2]], [3.4, 1.55, 4.5], 1.25, { cut: true }) },        // side angle, head turning
    { t: 2.05, ...shot([KS[0], 1.3, KS[2]], [3.42, 1.58, 4.4], 1.1) },
    { t: 2.1, ...shot([4.1, 1.1, 1.0], [3.45, 1.75, 3.35], 2.0, { cut: true }) },          // fridge from his right: hand on the handle, door swinging out          // fridge, high from behind his left: door + inside visible
    { t: 3.3, ...shot([4.1, 1.1, 1.0], [3.48, 1.73, 3.2], 1.85) },
    { t: 3.35, ...shot([3.65, 1.45, 1.05], [4.56, 1.12, .8], 1.05, { cut: true }) },   // from inside the fridge: his face as the door opens
    { t: 3.6, ...shot([3.65, 1.45, 1.05], [4.56, 1.14, .82], .95) },
    { t: 3.65, ...shot([4.3, .9, yankZ - .1], [3.85, 1.3, 3.75], 1.7, { cut: true }) },      // from down the aisle: the drawer between us and him, his hand on the pull, it slides out
    { t: 4.35, ...shot([4.3, .9, yankZ - .1], [3.85, 1.29, 3.67], 1.62) },
    { t: 4.38, p: [4.08, 1.72, yankZ - .12], l: [4.4, .72, yankZ], fov: 50, cut: true, zoom: true },   // his POV down into the open drawer: empty
    { t: 4.7, p: [4.1, 1.66, yankZ - .1], l: [4.4, .72, yankZ], fov: 46, zoom: true },
    { t: 4.75, ...shot([3.95, 1.4, yankZ], [3.45, 1.55, 4.3], .85, { cut: true }) },        // "nothing": his face
    { t: 5.65, ...shot([3.95, 1.42, yankZ], [3.47, 1.55, 4.15], .72) },
    // flashback: walks through the doorway, seen from the living room
    { t: 5.7, p: [-.6, 1.75, .3], l: [3.0, 1.1, 2.4], fov: 34, cut: true },
    { t: 8.1, p: [-.45, 1.75, .35], l: [3.3, 1.15, 2.4], fov: 31 },
    // Brain HQ
    { t: 8.15, ...B.spots.wide, cut: true },
    { t: 9.45, p: R(1.15, 1.45, 1.55), l: R(-.1, 1.12, zF + .95), fov: 48 },
    { t: 9.5, p: R(1.7, 1.45, -.55), l: R(-.1, 1.2, -.95), fov: 48, cut: true },          // NEW ROOM! screen + him slamming the button
    { t: 10.5, p: R(1.65, 1.44, -.6), l: R(-.1, 1.2, -.95), fov: 44 },
    { t: 10.55, p: R(1.3, 1.5, 1.7), l: R(0, 1.1, -.4), fov: 50, cut: true },             // chapter 2: cheering
    { t: 11.7, p: R(1.25, 1.48, 1.6), l: R(0, 1.1, -.4), fov: 46 },
    { t: 11.75, ...shot(R(-.5, 1.24, -.15), R(-.1, 1.4, 2.05), 2.0, { cut: true }) },      // the note, to us
    { t: 12.9, ...shot(R(-.5, 1.25, -.15), R(-.1, 1.4, 1.95), 1.7) },   // slow push that keeps the whole note in frame
    { t: 12.95, ...shot(R(-1.2, .9, .05), R(-1.9, 1.25, -.6), 1.9, { cut: true }) },        // reverse angle from beside the cabinet: walks up, reaches, pulls it open, files the note        // to the cabinet: opens it, files the note           // to the cabinet, files it
    { t: 15.35, ...shot(R(-1.2, .9, .05), R(-1.88, 1.22, -.62), 1.7) },
    { t: 15.4, ...shot(R(-1.25, .85, -.1), R(-1.85, 1.0, -.62), 1.35, { cut: true }) },           // SLAM, close
    { t: 16.95, ...shot(R(-1.22, .95, 0), R(-1.88, 1.15, -.62), 1.6) },
    // living room: walks back out
    { t: 17.0, p: CAM_LR, l: [3.0, 1.15, 2.4], fov: 36, cut: true },
    { t: 18.8, p: [-.45, 1.75, .4], l: [2.4, 1.2, 2.45], fov: 34 },
    // Brain HQ: drawer bursts open, note flies at us
    { t: 18.85, ...shot(R(-1.25, .9, -.1), R(-1.85, 1.05, -.62), 1.4, { cut: true }) },
    { t: 20.45, ...shot(R(-1.22, .95, -.05), R(-1.9, 1.15, -.6), 1.75, { ease: 'out' }) },
    // living room: the charger!
    { t: 20.5, ...shot([LR[0] + .15, 1.6, LR[2] - .1], [.3, 1.6, 1.3], 3.4, { cut: true, zoom: true }) },
    { t: 21.85, ...shot([LR[0] + .15, 1.6, LR[2] - .1], [.45, 1.6, 1.4], 3.0, { zoom: true }) },
    // walks back in (same angle as the flashback)
    { t: 21.9, p: [-.6, 1.75, .3], l: [3.0, 1.1, 2.4], fov: 34, cut: true },
    { t: 22.45, p: [-.5, 1.75, .35], l: [3.3, 1.1, 2.4], fov: 32 },
    // Brain HQ insert: SLAM
    { t: 22.5, ...shot(R(-1.25, .85, -.1), R(-1.85, 1.0, -.62), 1.35, { cut: true }) },
    { t: 22.85, ...shot(R(-1.25, .85, -.1), R(-1.83, .98, -.62), 1.25) },
    // kitchen: blank again (= the opening frame), then punch in on the phone: 1%
    { t: 22.9, ...shot(HEADK, CAM1, 1.95, { cut: true }) },
    { t: 23.5, ...shot(HEADK, CAM1, 1.85) },
    { t: 23.55, ...shot([4.5, .9, 2.65], [4.35, 1.15, 4.4], .85, { cut: true, zoom: true }) },
    { t: 24.1, ...shot([4.5, .9, 2.65], [4.36, 1.12, 4.25], .72, { zoom: true }) },
  ];

  { const q = new URLSearchParams(location.search).get('dbgcam'); if (q) { const v = q.split(',').map(Number); camera.splice(0, camera.length, { t: 0, p: v.slice(0, 3), l: v.slice(3, 6), fov: v[6], zoom: true }); } }
  // R6 bodies are ~1.5 m wide: open every non-zoom shot up 1.7x (frame height), except the room-sized Brain HQ wide
  for (const k of camera) if (!k.zoom && k !== camera.find(c => c.t === 8.15)) k.fov = 2 * Math.atan(Math.tan(k.fov * D2R / 2) * 1.7) / D2R;
  // eye windows: bake what he sees in the kitchen
  async function bake(renderer) {
    guy.update(1.0); guy.A.root.visible = false; scene.updateMatrixWorld(true);
    const cam = new THREE.PerspectiveCamera(70, 2, .05, 200); cam.position.set(KS[0] - .05, 1.5, KS[2] - .1); cam.lookAt(5.2, 1.1, 1.6);
    const rt = new THREE.WebGLRenderTarget(1024, 512, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); guy.A.root.visible = true; B.setView(rt.texture);
  }

  // where the lens is at time t (from the shot list; the engine moves the real camera after update runs)
  const camPos = t => { let i = 0; while (i < camera.length - 1 && camera[i + 1].t <= t) i++; const a = camera[i], b = camera[i + 1];
    const pa = V3(...a.p); if (!b || b.cut) return pa; return pa.lerp(V3(...b.p), (t - a.t) / (b.t - a.t)); };
  function update(t) {
    const CP = camPos(t);
    { const pov = t >= 4.38 && t < 4.75; guy.visible = !pov; guy.A.root.visible = !pov; }   // POV into the drawer: the lens is where his head is
    // kitchen: fridge door + drawer open during the search, shut otherwise (the flashback and the ending see them closed)
    const search = t < 5.7;
    const door = search ? (.32 * sm(t, 2.8, 3.15) + .68 * sm(t, 3.05, 3.55)) * (1 - sm(t, 4.6, 5.0)) : 0; fdoor.rotation.y = -door * 1.75; fLight.intensity = door * 3;
    const dr = search ? sm(t, 4.07, 4.35) : 0; drawers.forEach(d => { d.position.x = FX - (d === yankD ? dr * .36 : 0); });
    drawPhone(t > 23.55 && Math.floor(t * 4) % 2 === 0);
    // phone + note ride their hand markers but always turn their face to the lens (cartoon cheat, so they read)
    const _v = new THREE.Vector3();
    phone.position.copy(phoneMark.getWorldPosition(_v)); phone.lookAt(CP);
    { const w = noteMark.getWorldPosition(_v).lerp(CP, .14); w.y -= .02; handNote.position.copy(B.group.worldToLocal(w)); handNote.lookAt(CP); handNote.rotateZ(.08); }
    // Brain HQ
    roomDrawer.position.z = drawerOpen(t);
    handNote.visible = t >= 11.7 && t < 14.55;
    const u = t - 19.0; flyNote.visible = u > 0 && t < 22.6;
    if (flyNote.visible) { const up = sm(u, 0, .12), wob = Math.exp(-u * 4) * Math.sin(u * 26); flyNote.position.set(.02, .8 + up * .2 + wob * .015, .06); flyNote.lookAt(CP); flyNote.rotateX(-.15 + wob * .12); flyNote.rotateZ(.1 + wob * .25); }
    B.set({ screen, lever: 1, gauge: t > 18.9 && t < 22.5 ? .9 : .5, alarm: t > 18.95 && t < 20.45 ? .7 : 0, pulse: -1, t, hideCables: [0, 1, 2, 3, 4, 5, 6, 7] });
  }
  return { cast: { guy, op }, camera, update, bake, keep: [B.group] };
}
