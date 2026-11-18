// SCENE TEST: "Dad reads his son a bedtime story", autumn evening, golden hour (2026-11-18 lighting step).
// Mood: warm, safe, quiet. The low sun comes in through the window behind dad (shafts + dust, a rim on him and the
// book), the bedside lamp is already on (the kid's warm key), the sky side of the room stays cool so the warm reads.
// Colour: dusty teal walls (the cool base) against honey wood, a rust rug and the sun (warm): complementary, so both pop.
// Clothes are picked against the room, never matched to it: dad beige + dark denim, kid red hoodie.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mat } from '../engine/materials.js';
import { bbox, at, ph, cushion, drape, curtain, openBook, tableLamp, shade } from '../engine/build.js';
import { makeR6, STUD } from '../engine/r6.js';
import { SUNLIT_GLSL } from '../engine/post.js';

export async function build({ scene, W, H, opts = {} }) {
  RectAreaLightUniformsLib.init();
  const add = (...o) => { scene.add(...o); return o[0]; };
  // ---------- room: 4.6 x 5 m, 3 m ceiling (R6 people are 1.7 m but blocky: rooms a touch roomier than real) ----------
  const X0 = -2.3, X1 = 2.3, Z0 = -2.3, Z1 = 2.7, CH = 3.0, T = .2;
  const wall = mat('plaster', { color: opts.wall || '#79aeb2', size: 1.4, normal: 3.2 });
  const trim = new THREE.MeshPhysicalMaterial({ color: '#efeae0', roughness: .42, clearcoat: .3, clearcoatRoughness: .4 });   // white painted wood (gloss paint)
  const floor = mat('wood_floor', { size: 2.6, clearcoat: .55, clearcoatRough: .22, rough: .75 });                               // varnished boards
  add(at(bbox(X1 - X0 + 2 * T, .1, Z1 - Z0 + 2 * T, floor, .005), 0, -.05, (Z0 + Z1) / 2));
  const ceil = add(at(bbox(X1 - X0 + 2 * T, T, Z1 - Z0 + 2 * T, mat('plaster_fine', { color: '#ece8e0', size: 1.6 }), .005), 0, CH + T / 2, (Z0 + Z1) / 2)); ceil.visible = !opts.noCeiling;
  // back wall with the window opening (x .35..1.85, y .9..2.4)
  const WX0 = .35, WX1 = 1.85, WY0 = .9, WY1 = 2.4, bz = Z0 - T / 2;
  const seg = (x0, x1, y0, y1) => add(at(bbox(x1 - x0, y1 - y0, T, wall, .004), (x0 + x1) / 2, (y0 + y1) / 2, bz));
  seg(X0 - T, WX0, 0, CH); seg(WX1, X1 + T, 0, CH); seg(WX0, WX1, 0, WY0); seg(WX0, WX1, WY1, CH);
  add(at(bbox(T, CH, Z1 - Z0, wall, .004), X0 - T / 2, CH / 2, (Z0 + Z1) / 2)); add(at(bbox(T, CH, Z1 - Z0, wall, .004), X1 + T / 2, CH / 2, (Z0 + Z1) / 2));
  add(at(bbox(X1 - X0 + 2 * T, CH, T, wall, .004), 0, CH / 2, Z1 + T / 2));
  // skirting boards
  for (const [w, x, z, ry] of [[X1 - X0, 0, Z0 + .009, 0], [Z1 - Z0, X0 + .009, (Z0 + Z1) / 2, Math.PI / 2], [Z1 - Z0, X1 - .009, (Z0 + Z1) / 2, Math.PI / 2]]) add(at(bbox(w, .11, .018, trim, .004), x, .055, z, ry));
  // ---------- window: casing, sill, sash with a cross mullion, glass ----------
  const win = new THREE.Group(); add(win);
  const cw = .075, wcx = (WX0 + WX1) / 2, wcy = (WY0 + WY1) / 2;
  win.add(at(bbox(WX1 - WX0 + 2 * cw, cw, .025, trim, .006), wcx, WY1 + cw / 2, Z0 + .012));                                // head casing
  win.add(at(bbox(cw, WY1 - WY0 + cw, .025, trim, .006), WX0 - cw / 2, wcy + cw / 2, Z0 + .012)); win.add(at(bbox(cw, WY1 - WY0 + cw, .025, trim, .006), WX1 + cw / 2, wcy + cw / 2, Z0 + .012));
  win.add(at(bbox(WX1 - WX0 + 2 * cw + .06, .04, T + .09, trim, .008), wcx, WY0 - .02, Z0 - T / 2 + .045));                 // sill
  const sz = Z0 - T * .55, fb = .055;                                                                                          // the sash sits in the wall
  for (const [w, h, x, y] of [[WX1 - WX0, fb, wcx, WY0 + fb / 2], [WX1 - WX0, fb, wcx, WY1 - fb / 2], [fb, WY1 - WY0, WX0 + fb / 2, wcy], [fb, WY1 - WY0, WX1 - fb / 2, wcy], [.04, WY1 - WY0, wcx, wcy], [WX1 - WX0, .04, wcx, WY0 + (WY1 - WY0) * .58]]) win.add(at(bbox(w, h, .05, trim, .006), x, y, sz));
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .03, transparent: true, opacity: .06, metalness: 0, envMapIntensity: 1.2 }));
  glass.position.set(wcx, wcy, sz - .01); glass.castShadow = false; win.add(glass);
  // curtains: oatmeal linen, pulled open to both sides, on a dark iron rod
  const linen = mat('denim', { color: '#e3d3b8', size: .5, normal: .6, sheen: .6, sheenColor: '#fff1dc' });
  for (const x of [WX0 - .18, WX1 + .18]) { const c = add(curtain(.62, 2.45, linen.clone(), { pleats: 6, depth: .06 })); c.position.set(x, 2.62 - 2.45 / 2, Z0 + .12); }
  const rodM = new THREE.MeshStandardMaterial({ color: '#2b2622', roughness: .45, metalness: .6 });
  const rod = add(new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, WX1 - WX0 + 1.1, 16), rodM)); rod.rotation.z = Math.PI / 2; rod.position.set(wcx, 2.64, Z0 + .12); shade(rod);
  for (const s of [-1, 1]) { const f = add(new THREE.Mesh(new THREE.SphereGeometry(.028, 16, 12), rodM)); f.position.set(wcx + s * (WX1 - WX0 + 1.1) / 2, 2.64, Z0 + .12); }

  // ---------- bed (single, honey wood, bevelled boards) ----------
  const wood = mat('wood_fine', { size: 1.2, clearcoat: .35, clearcoatRough: .3 });
  const bx = -.75, bw = 1.15, bz0 = Z0 + .03, bz1 = -.03, bl = bz1 - bz0, bcz = (bz0 + bz1) / 2, MT = .62;
  add(at(bbox(bw + .1, 1.05, .06, wood, .02), bx, .525, bz0 + .03));
  add(at(bbox(bw + .1 + .03, .05, .09, wood, .018), bx, 1.05 + .02, bz0 + .03));                                               // cap rail on the headboard
  add(at(bbox(bw + .1, .62, .06, wood, .02), bx, .31, bz1 - .03));
  add(at(bbox(bw + .1 + .03, .045, .09, wood, .016), bx, .62 + .02, bz1 - .03));
  for (const s of [-1, 1]) add(at(bbox(.05, .17, bl - .1, wood, .012), bx + s * (bw / 2 + .02), .31, bcz));
  const cotton = mat('denim', { color: '#efebe3', size: .22, normal: .5, sheen: .3 });
  add(at(cushion(bw - .03, .24, bl - .1, cotton, { puff: .4, seam: .75 }), bx, MT - .12, bcz));
  const pillow = add(cushion(.78, .2, .46, mat('denim', { color: '#f3efe8', size: .22, normal: .5, sheen: .4 }), { puff: 1.2, seam: .35 })); pillow.position.set(bx, MT + .26, bz0 + .17); pillow.rotation.x = -1.15;

  // ---------- cast ----------
  const skin = opts.skin || '#a8714f';
  const dad = await makeR6({ skin, res: 1024, face: false, hair: [4875445470], shirt: 'assets/roblox/86139862413430/texture.png', pants: 'assets/roblox/129458426/texture.png' });   // flat clothes for now: 3D sleeves still tear on raised arms (roadmap item 6)
  const kid = await makeR6({ skin, res: 1024, face: false, hair: [7259172148], accessories: [11419556095, 11487304540] });
  // seated: lean the torso about the hip (so the hip stays put), legs out in front
  const sit = (a, { lean = 0, legs = Math.PI / 2 } = {}) => { a.joints.root.rotation.x = lean; a.joints.root.position.set(0, 2 + Math.cos(lean), Math.sin(lean)); a.joints.hipL.rotation.x = a.joints.hipR.rotation.x = legs - lean; };
  // kid in bed: propped on the pillow, turned to dad, hands resting on the blanket
  const KS = .86, hipY = MT + .5 * STUD * KS - .05, kz = bz0 + .56;
  sit(kid, { lean: .38 }); kid.root.scale.setScalar(KS); kid.root.position.set(bx + .02, hipY - 2 * STUD * KS, kz); kid.root.rotation.y = 0;
  kid.joints.neck.rotation.set(-.08, .55, 0); kid.joints.shoulderR.rotation.set(.62, 0, -.1); kid.joints.shoulderL.rotation.set(.55, 0, .14);
  kid.parts.legL.visible = kid.parts.legR.visible = false;   // under the blanket: nothing of the legs may poke through
  add(kid.root);
  // the blanket: knit, over the kid's legs, turned down at his waist
  const lx = .02 * 0, legW = 2 * STUD * KS / 2 + .02, legTop = MT + .13, dz0 = kz - .1, dd = bz1 - .04 - dz0;
  const knit = mat('knit', { color: '#e6dccb', size: .42, normal: 1.1, sheen: .8, sheenColor: '#fff4e2', sheenRough: .5 });
  const blanket = add(drape({ w: bw - .02, d: dd, top: MT, hang: .34, mat: knit, thick: .045, waves: .01,
    under: (x, z) => { const zz = z + dd / 2, ox = Math.max(0, Math.abs(x - .02) - legW), oz = Math.max(0, zz - 2 * STUD * KS) + Math.max(0, -zz), o = Math.hypot(ox, oz);
      const r = Math.min(1, Math.abs(x - .02) / (legW + .22)), round = 1 - r * r;                                   // a rounded mound over both legs, not a slab
      const f = o <= 0 ? 1 : Math.max(0, 1 - o / .32); const fs = f * f * (3 - 2 * f), edge = Math.min(1, Math.max(0, zz) / .12);
      return MT + (legTop - MT) * fs * (.55 + .45 * round) * (.75 + .25 * edge); } }));
  blanket.position.set(bx, 0, dz0 + dd / 2);
  // dad: dining chair at the bedside, facing the kid, reading
  const chair = add(await ph('dining_chair_02', { scale: 1.12 })); chair.position.set(.78, 0, kz + .02); chair.rotation.y = -Math.PI / 2;
  const seatY = .52;
  sit(dad, { lean: -.1 }); dad.root.position.set(.8, seatY + .5 * STUD - 2 * STUD, kz + .02); dad.root.rotation.y = -Math.PI / 2;
  dad.joints.neck.rotation.set(-.38, .1, 0);
  dad.joints.shoulderL.rotation.set(1.42, 0, .5); dad.joints.shoulderR.rotation.set(.5, 0, -.06);   // book up in the left hand, right hand resting on his thigh
  add(dad.root); scene.updateMatrixWorld(true);
  // the book sits in both hands, open, tilted to his eyes
  const hL = dad.parts.armL.localToWorld(new THREE.Vector3(.1, -1.05, -.2)), eye = dad.parts.head.localToWorld(new THREE.Vector3(0, .1, -.4));
  const xA = dad.parts.torso.localToWorld(new THREE.Vector3(-1, 0, 0)).sub(dad.parts.torso.localToWorld(new THREE.Vector3(1, 0, 0))).normalize(), yA = eye.clone().sub(hL).normalize(), mid = hL; yA.sub(xA.clone().multiplyScalar(yA.dot(xA))).normalize(); const zA = new THREE.Vector3().crossVectors(xA, yA);
  const book = add(openBook(.5, .36, { cover: new THREE.MeshPhysicalMaterial({ color: '#7a2f2a', roughness: .5, clearcoat: .2 }), pages: new THREE.MeshStandardMaterial({ color: '#f1e9d6', roughness: .85 }) }));
  book.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA, yA, zA)); book.position.copy(mid).addScaledVector(yA, .05).addScaledVector(xA, -.1);

  // ---------- nightstand + lamp + clock ----------
  const nsx = -1.72, nsz = bz0 + .26, nsW = .5, nsH = .56, nsD = .42;
  add(at(bbox(nsW, nsH - .04, nsD, wood, .015), nsx, (nsH - .04) / 2 + .04, nsz));
  add(at(bbox(nsW + .03, .03, nsD + .02, wood, .01), nsx, nsH + .015, nsz));
  add(at(bbox(nsW - .06, .2, .02, wood, .006), nsx, nsH - .16, nsz + nsD / 2 + .006));                                           // drawer front, proud of the carcass with a shadow gap
  const knob = add(new THREE.Mesh(new THREE.SphereGeometry(.018, 16, 12), new THREE.MeshStandardMaterial({ color: '#b08a4a', metalness: .8, roughness: .3 }))); knob.position.set(nsx, nsH - .16, nsz + nsD / 2 + .03);
  for (const [sx, sz2] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(at(bbox(.04, .05, .04, wood, .008), nsx + sx * (nsW / 2 - .04), .025, nsz + sz2 * (nsD / 2 - .04)));
  const lampOn = (opts.lamp ?? 0) > 0;   // Xavier 2026-11-18: daylight, nobody reading by it -> the lamp is OFF
  const lampLight = new THREE.PointLight('#ffb36b', opts.lamp ?? 0, 7, 2); lampLight.castShadow = lampOn && (opts.lampShadow ?? true); lampLight.visible = lampOn; lampLight.shadow.mapSize.set(1024, 1024); lampLight.shadow.bias = -.002; lampLight.shadow.radius = 4;
  const lamp = add(tableLamp({ baseMat: new THREE.MeshPhysicalMaterial({ color: '#c98f3b', roughness: .25, clearcoat: .8, clearcoatRoughness: .1 }),
    shadeMat: new THREE.MeshStandardMaterial({ color: '#f4e7cf', roughness: .9, side: THREE.DoubleSide, emissive: new THREE.Color('#ffb065'), emissiveIntensity: lampOn ? .9 : 0 }), height: .55, light: lampLight }));
  lamp.children.forEach(c => { if (c.material?.isMeshBasicMaterial) c.visible = lampOn; });
  lamp.position.set(nsx - .03, nsH + .03, nsz - .04);
  const clock = add(await ph('alarm_clock_01', { scale: 1.1 })); clock.position.set(nsx + .15, nsH + .03, nsz + .1); clock.rotation.y = .5;
  // ---------- rug, plant, shelf ----------
  const rug = add(bbox(1.55, .022, 2.2, mat('carpet', { color: '#9a4a33', size: .8, normal: 2.2, sheen: 1, sheenColor: '#ffb48a', sheenRough: .45 }), .011)); rug.position.set(.55, .011, -.95); rug.rotation.y = .06;
  const plant = add(await ph('potted_plant_02', { scale: 1.15 })); plant.position.set(2.0, 0, Z0 + .45);
  const shelf = add(await ph('drawer_cabinet', { scale: 1.1 })); shelf.position.set(X1 - .3, 0, .9); shelf.rotation.y = -Math.PI / 2;
  const books = add(await ph('book_encyclopedia_set_01', { scale: 1 })); books.position.set(X1 - .17, 1.35, 1.15); books.rotation.y = -Math.PI / 2;
  const duck = add(await ph('rubber_duck_toy', { scale: .55 })); duck.position.set(X1 - .3, 1.6, .6); duck.rotation.y = -2.2;

  // ---------- outside: evening sky, a lawn, trees ----------
  const sunDir = new THREE.Vector3(...(opts.sunDir || [.35, .58, -1])).normalize();
  const skyM = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms: { sd: { value: sunDir } },
    vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: `varying vec3 p; uniform vec3 sd; void main(){ float h = clamp(p.y, -.2, 1.), s = max(dot(p, sd), 0.);
      vec3 hor = vec3(1.0, .55, .25) * 2.2, top = vec3(.28, .42, .78) * .9, c = mix(hor, top, pow(clamp(h + .05, 0., 1.), .45));
      c += vec3(1., .62, .3) * (pow(s, 8.) * 3. + pow(s, 400.) * 40.);  gl_FragColor = vec4(c, 1.); }` });
  add(new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), skyM));
  const lawn = add(new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#4f6a34', roughness: 1 }))); lawn.rotation.x = -Math.PI / 2; lawn.position.y = -.4; lawn.receiveShadow = true;
  const tree = (await new GLTFLoader().loadAsync('assets/models/tree_small_02.glb')).scene;
  for (const [x, z, s] of (opts.trees || [])) { const t = shade(tree.clone()); t.position.set(x, -.4, z); t.scale.setScalar(s); add(t); }

  // ---------- light ----------
  const focus = new THREE.Vector3(0, 1, -.6);
  const sun = new THREE.DirectionalLight(opts.sunColor || '#ffb877', opts.sun ?? 6); sun.position.copy(focus).addScaledVector(sunDir, 20); sun.target.position.copy(focus);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 5, far: 40 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
  add(sun, sun.target);
  const skyFill = new THREE.RectAreaLight(opts.skyColor || '#8aa6e8', opts.skyFill ?? 3, WX1 - WX0, WY1 - WY0); skyFill.position.set(wcx, wcy, Z0 - .05); skyFill.lookAt(wcx, wcy, 5); if (!opts.noRect) add(skyFill);
  const bounce = new THREE.PointLight('#ffa66a', opts.bounce ?? 1.8, 7, 1.6); bounce.position.set(.4, .9, .3); add(bounce);   // sunlight bouncing round the room: warm, soft, everywhere
  const beauty = new THREE.RectAreaLight('#dfe3ff', opts.beauty ?? 1.4, 2.4, 2.4); beauty.position.set(.4, 1.8, 2.2); beauty.lookAt(-.2, 1, -1.6); if (!opts.noRect) add(beauty);   // cool soft fill from the camera side (no visible source)
  const kidKey = new THREE.SpotLight('#ffcf9e', opts.kidKey ?? 8, 6, .38, .9, 1.4); kidKey.position.set(-1.25, 2.05, .2); kidKey.target.position.set(-.73, 1.0, -1.72); add(kidKey, kidKey.target);   // soft warm fill on the kid's front (beauty light: reads as sunlight bouncing off the floor and sheets)
  add(new THREE.HemisphereLight('#8b98bb', '#7a4a2e', opts.ambient ?? .8));
  // ---------- dust in the air (bright only where the sun beam is) ----------
  const N = 9000, pos = new Float32Array(N * 3), dsz = new Float32Array(N); let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < N; i++) { pos[3 * i] = -.6 + rnd() * 2.8; pos[3 * i + 1] = .3 + rnd() * 2.4; pos[3 * i + 2] = Z0 + .1 + rnd() * 2.4; dsz[i] = .5 + rnd() ** 3 * 2.5; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); dg.setAttribute('sz', new THREE.BufferAttribute(dsz, 1));
  const dustM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { sunShadow: { value: null }, sunMatrix: { value: new THREE.Matrix4() }, sunBias: { value: .002 }, col: { value: new THREE.Color(opts.sunColor || '#ffb877').multiplyScalar(opts.dust ?? 2.4) }, k: { value: H / 960 } },
    vertexShader: SUNLIT_GLSL + `attribute float sz; uniform float k; varying float lit; void main(){ vec4 wp = modelMatrix * vec4(position, 1.); lit = sunlit(wp.xyz); vec4 mv = viewMatrix * wp; gl_PointSize = sz * k * 4.2 / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 col; varying float lit; void main(){ vec2 d = gl_PointCoord - .5; float a = smoothstep(.5, .1, length(d)); gl_FragColor = vec4(col * a * lit, 1.); }` });
  const dust = add(new THREE.Points(dg, dustM)); dust.frustumCulled = false; dust.userData.noProbe = true;   // dust must never be baked into the room reflection probe (it washed the whole frame)
  const before = () => { dustM.uniforms.sunShadow.value = sun.shadow.map?.texture || null; dustM.uniforms.sunMatrix.value.copy(sun.shadow.matrix); };

  // ---------- camera: from the foot side, diagonal across the bed, dad in front of the window ----------
  const cam = new THREE.PerspectiveCamera(opts.fov || 60, W / H, .05, 200); cam.position.set(...(opts.camP || [-.35, 1.78, 2.6])); cam.lookAt(...(opts.camL || [.05, .6, -1.9]));
  // update(t): set everything for time t from scratch; return true only if something OTHER than the camera moved
  // (then the shadows are redrawn; a camera-only move reuses them). Test move: a slow push-in.
  const c0 = cam.position.clone(), l0 = new THREE.Vector3(...(opts.camL || [.05, .6, -1.9]));
  const update = t => { const k = t / 6, e = k * k * (3 - 2 * k); cam.position.copy(c0).lerp(l0, .12 * e); cam.lookAt(l0); return false; };
  return { camera: cam, sun, before, update, post: { sun, volume: opts.volume ?? 1.6, volumeColor: opts.sunColor || '#ffb877', volumeBox: [[X0, 0, Z0], [X1, CH, Z1]], focus: 3.4, aperture: opts.aperture ?? 3, maxBlur: 5 * W / 540,
    bloom: .5, bloomRadius: .6, bloomThreshold: 1.3, bloomCap: 2.5, exposure: opts.exposure ?? 1.2, contrast: 1.1, saturation: 1.15, black: .02, shadowTint: '#3d6f8c', highTint: '#ffcf8a', tintAmt: .35, pivot: .4 } };
}
