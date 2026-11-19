// FORMAT A ENGINE (story explainers). A topic opts in with `export const FORMAT = 'A'` and exports:
//   SET            set name (kit/sets/<name>.js)
//   setup(ctx)  -> { cast: {name: actor}, camera: [keys], update?(t), overlays? }
// Camera keys: { t, p: [x,y,z], l: [x,y,z], fov?, cut?: true, ease?: 'io' | 'in' | 'out' | 'lin', roll? }
//   Between keys the camera FLIES (Catmull-Rom through the key positions, eased in time); `cut: true` on a key makes a
//   hard cut onto it. A gentle handheld drift is always on, so a hold is never frozen (matches the reference shorts:
//   picture changes about every second, mostly by travelling, rarely by cutting).
// Captions: 2 to 3 words at a time from voice/words.json, breaking on punctuation, bottom centre, with a pop.
// Every frame is a pure function of t.
import * as THREE from 'three';
import * as U from './util.js';
import { LOOK } from './look.js';
import * as CAST from './cast.js';

const SETS = { classroom: () => import('./sets/classroom.js'), plane: () => import('./sets/plane.js'), street: () => import('./sets/street.js'), kitchen: () => import('./sets/kitchen.js'), livingroom: () => import('./sets/livingroom.js'), backdrop: () => import('./sets/backdrop.js'), house: () => import('./sets/house.js'), town: () => import('./sets/town.js') };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const EASE = { io: U.easeIO, in: x => x * x * x, out: U.easeOut, lin: x => x };

function chunks(words) {   // group words into 2-3 word caption chunks, never across a sentence or comma break
  const out = []; let cur = [];
  const flush = () => { if (cur.length) out.push({ text: cur.map(w => w.w).join(' '), s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; };
  words.forEach((w, i) => { cur.push(w); const nx = words[i + 1], gap = nx ? nx.s - w.e : 9; if (cur.length >= (LOOK.captionWords ?? 1)) flush(); });   // Xavier 2026-10-22: ONE word per caption
  flush(); return out;
}

export async function createFilmA(stage, { topic, mod, base }) {
  let words = []; try { words = await (await fetch(base + 'voice/words.json')).json(); } catch (e) { }
  let DUR = 10; try { DUR = (await (await fetch(base + 'voice/beats.json')).json()).duration; } catch (e) { }
  const LQ = new URLSearchParams(location.search).get('lq') === '1';   // REVIEW renders (Xavier 2026-11-11): no AA, shadows, AO, grade; all Lambert. Only for checking staging fast.
  const renderer = new THREE.WebGLRenderer({ antialias: !LQ, preserveDrawingBuffer: true });
  renderer.shadowMap.enabled = !LQ; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = mod.EXPOSURE ?? 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene(), world = (await SETS[mod.SET]()).buildWorld(scene);
  const camera = new THREE.PerspectiveCamera(40, 9 / 16, .03, 900);
  const ctx = { THREE, scene, world, camera, U, V, DUR, words, CAST, stage, renderer };
  { const fq = new URLSearchParams(location.search).get('face'); if (fq) (await import('./faces.js')).setFaceScale(+fq); }   // look-dev: &face=1.4
  const T = await mod.setup(ctx);
  for (const a of Object.values(T.cast || {})) scene.add(a.A.root);
  { const D = await import('./detail.js'); await Promise.all(D.pending); if (world.bake) world.bake(renderer); }
  if (T.bake) await T.bake(renderer);   // topic one-off renders (e.g. a view baked into a texture)
  // (instanced grass + forest are always culled indoors: thousands of alpha cards, ~70% of the cost)
  // far culling: the town / hills around a set cost ~70% of render time and can't be seen from indoor shots. Everything
  // farther than T.farCull (default 40 m) from the set centre is hidden unless the active camera key says `far: true`.
  const keepSet = new Set(T.keep || []), farList = new Set(), lim = T.farCull ?? 40, castRoots = new Set(Object.values(T.cast || {}).map(a => a.A.root));
  { const p = new THREE.Vector3();
    scene.traverse(o => {
      if (!o.isMesh || castRoots.has(o)) return;
      for (let q = o; q; q = q.parent) if (keepSet.has(q)) return;   // micro worlds (T.keep) are far away on purpose
      o.getWorldPosition(p);
      let far = Math.hypot(p.x, p.z) > lim || o.isInstancedMesh, lod = null;
      for (let q = o.parent; q; q = q.parent) if (q.isLOD) lod = q;
      if (lod && !o.isInstancedMesh) { lod.getWorldPosition(p); far = Math.hypot(p.x, p.z) > lim; }
      if (far) farList.add(lod || o);   // LODs re-show their levels every frame, so hide the LOD itself
    }); }
  let farShown = true; const showFar = on => { if (on === farShown) return; farShown = on; farList.forEach(o => { o.visible = on; }); };
  // VISIBILITY CULLING: render only what the camera can actually see. three.js already skips meshes outside the view
  // cone, but not ones hidden behind walls / desks, and the shadow pass draws every caster anyway. So per 0.25 s of
  // film we draw a small ID image (each mesh a flat colour) from the camera at a few moments, read which meshes show
  // up, and hide the rest for both passes. Kept always: the cast, transparent / alpha-cut meshes (they don't occlude
  // in the ID image, so they can't be judged), instanced / LOD / far-culled things (handled above), and big meshes
  // (walls, floor, ceiling: their shadows land in shot even when they are off screen). Off with &vis=0.
  // (measured on the classroom: only ~2% faster, because hidden geometry is cheap here; pixel shading is the real cost,
  // see SHADING LOD below. So it is opt-in: T.visCull = true or &vis=1, for sets with heavy hidden geometry.)
  const visOn = new URLSearchParams(location.search).get('vis') === '1' || T.visCull === true;
  const cullable = [], idMat = new Map(), farSet = new Set(farList);
  { const sph = new THREE.Sphere();
    scene.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return;
      for (let q = o; q; q = q.parent) if (castRoots.has(q) || farSet.has(q) || q.isLOD) return;
      const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || m.transparent || m.alphaTest > 0 || m.opacity < 1) return;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); sph.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); if (sph.radius > 1.6) return;
      cullable.push(o); const id = cullable.length, mt = new THREE.MeshBasicMaterial({ fog: false, side: m.side });
      mt.color.setRGB((id & 255) / 255, ((id >> 8) & 255) / 255, ((id >> 16) & 255) / 255, THREE.LinearSRGBColorSpace); idMat.set(o, mt);
    }); }
  const idRT = new THREE.WebGLRenderTarget(216, 384, { depthBuffer: true }), idPix = new Uint8Array(216 * 384 * 4), visCache = new Map(), BUCKET = .25;
  function idPass(t) {
    const c = cameraAt(t); camera.position.copy(c.p); camera.up.set(Math.sin(c.roll), Math.cos(c.roll), 0); camera.lookAt(c.l); camera.fov = c.fov * 1.12; camera.updateProjectionMatrix();   // 12% wider: handheld drift + edge safety
    const seen = new Set(), saveMat = new Map(), hidden = [];
    scene.traverse(o => { if (!o.visible) return; if (idMat.has(o)) { saveMat.set(o, o.material); o.material = idMat.get(o); } else if (o.isMesh || o.isPoints || o.isLine || o.isSprite) { o.visible = false; hidden.push(o); } });
    const bg = scene.background, fog = scene.fog, sh = renderer.shadowMap.enabled; scene.background = null; scene.fog = null; renderer.shadowMap.enabled = false;
    renderer.setRenderTarget(idRT); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); renderer.readRenderTargetPixels(idRT, 0, 0, 216, 384, idPix); renderer.setRenderTarget(null);
    scene.background = bg; scene.fog = fog; renderer.shadowMap.enabled = sh; for (const [o, m] of saveMat) o.material = m; for (const o of hidden) o.visible = true;
    for (let i = 0; i < idPix.length; i += 4) { const id = idPix[i] | (idPix[i + 1] << 8) | (idPix[i + 2] << 16); if (id) seen.add(id); }
    return seen;
  }
  function visibleAt(t) {
    const b = Math.floor(t / BUCKET);
    const get = k => { if (!visCache.has(k)) { const s = new Set(); for (const f of [0, .5, 1]) for (const id of idPass(Math.max(0, (k + f) * BUCKET))) s.add(id); visCache.set(k, s); } return visCache.get(k); };
    const s = new Set(get(b)); for (const id of get(b + 1)) s.add(id); if (b > 0) for (const id of get(b - 1)) s.add(id);   // neighbours too: nothing pops in late
    return s;
  }
  window.__vis = { cullable, visibleAt };
  // SHADING LOD: physically based shading of every pixel is ~80% of render time (SwiftShader, measured: flat materials
  // 1.3 s vs 6.6 s a frame). Far from the camera, PBR and simple Lambert shading look the same, so set meshes farther
  // than T.shadeNear (default 6 m) switch to a Lambert twin (same colour, texture, normal map, emission). Kept PBR:
  // the cast (skin, hair), anything with an env map (shiny floor reflections), and everything near the camera.
  const shadeNear = LQ ? 0 : (T.shadeNear ?? 6), shadeOn = new URLSearchParams(location.search).get('shade') !== '0' && T.shadeLOD !== false, shadeList = [];
  if (shadeOn) { const sph = new THREE.Sphere(), twins = new Map();
    const twin = m => { if (!twins.has(m)) { const l = new THREE.MeshLambertMaterial({ color: m.color, map: m.map, normalMap: m.normalMap, normalScale: m.normalScale, emissive: m.emissive, emissiveMap: m.emissiveMap, emissiveIntensity: m.emissiveIntensity, transparent: m.transparent, opacity: m.opacity, alphaTest: m.alphaTest, alphaMap: m.alphaMap, side: m.side, vertexColors: m.vertexColors, fog: m.fog }); twins.set(m, l); } return twins.get(m); };
    scene.traverse(o => {
      if (!o.isMesh || o.isSkinnedMesh) return; for (let q = o; q; q = q.parent) if (castRoots.has(q)) return;
      const ms = [].concat(o.material); if (!ms.every(m => m.isMeshStandardMaterial && !m.envMap && !m.userData.keepPBR)) return;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); sph.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld);
      shadeList.push({ o, pbr: o.material, lam: Array.isArray(o.material) ? ms.map(twin) : twin(o.material), c: sph.center.clone(), r: sph.radius, far: false });
    }); }
  function shadeLOD() { const cp = camera.position; for (const e of shadeList) { const far = e.c.distanceTo(cp) - e.r > shadeNear; if (far !== e.far) { e.far = far; e.o.material = far ? e.lam : e.pbr; } } }
  const CAM = T.camera.map(k => ({ ...k, p: V(...k.p), l: V(...k.l) }));
  const CH = chunks(words.map(w => ({ w: w.w, s: w.s, e: w.e })));
  const cap = stage.querySelector('#cap');

  function cameraAt(t) {
    let i = 0; while (i < CAM.length - 1 && t >= CAM[i + 1].t) i++;
    const a = CAM[i], b = CAM[i + 1];
    if (!b || b.cut) { const hold = Math.max(0, t - a.t); return { p: a.p.clone().add(V(0, 0, -hold * (a.drift ?? .05))), l: a.l.clone(), fov: a.fov ?? 40, roll: a.roll || 0 }; }
    const u = U.clamp((t - a.t) / (b.t - a.t)), e = (EASE[b.ease || 'io'])(u);
    const P0 = (CAM[i - 1] && !a.cut) ? CAM[i - 1] : a, P3 = (CAM[i + 2] && !CAM[i + 2].cut) ? CAM[i + 2] : b;
    const cr = (k0, k1, k2, k3) => { const t2 = e * e, t3 = t2 * e; return k1.clone().multiplyScalar(2).add(k2.clone().sub(k0).multiplyScalar(e)).add(k0.clone().multiplyScalar(2).sub(k1.clone().multiplyScalar(5)).add(k2.clone().multiplyScalar(4)).sub(k3).multiplyScalar(t2)).add(k0.clone().negate().add(k1.clone().multiplyScalar(3)).sub(k2.clone().multiplyScalar(3)).add(k3).multiplyScalar(t3)).multiplyScalar(.5); };
    return { p: cr(P0.p, a.p, b.p, P3.p), l: a.l.clone().lerp(b.l, e), fov: U.lerp(a.fov ?? 40, b.fov ?? 40, e), roll: U.lerp(a.roll || 0, b.roll || 0, e) };
  }
  const setCap = (text, since) => {
    if (!cap) return; if (cap.dataset.text !== text) { cap.dataset.text = text; cap.textContent = ''; if (text) for (let i = LOOK.captionExtrude; i >= 0; i--) { const s = document.createElement('span'); s.textContent = text; s.className = i ? 'x' : 'face'; if (i) s.style.transform = `translate(calc(var(--w) * ${(i * .0012).toFixed(4)}), calc(var(--w) * ${(i * .0015).toFixed(4)}))`; cap.appendChild(s); }
      cap.style.fontSize = ''; const f = cap.lastChild; if (f) { const r = document.createRange(); r.selectNodeContents(f); const w = r.getBoundingClientRect().width, max = stage.clientWidth * .88; if (w > max) cap.style.fontSize = (parseFloat(getComputedStyle(cap).fontSize) * max / w) + 'px'; } }
    const a = Math.min(1, since / .12), pop = text ? .7 + .3 * (1 + 2.70158 * (a - 1) ** 3 + 1.70158 * (a - 1) ** 2) : 1; cap.style.transform = `translateY(-50%) scale(${pop.toFixed(3)})`;
  };
  // AMBIENT OCCLUSION (Xavier 2026-10-22: "add a lil ambient occlusion"): GTAO post pass, soft contact darkening where
  // things meet (under desks, between bodies and chairs, room corners). Channel look: LOOK.ao { radius, intensity, scale };
  // a topic can override with T.ao (false = off), look-dev &ao=0. The AO buffer runs at half resolution to keep it cheap.
  const cine = { aperture: .004, maxblur: .012, bloom: 0, vignette: .45, grain: .045, ca: .012, contrast: .35, fill: .55, ...(LOOK.cine || {}), ...(T.cine || {}) };
  for (const [k, v] of new URLSearchParams(location.search)) if (k.startsWith('c_')) cine[k.slice(2)] = +v;   // look-dev: &c_bloom=0&c_vignette=.3 ...
  const cineQ = new URLSearchParams(location.search).get('cine'), cineOn = !LQ && (cineQ ? cineQ === '1' : !!(T.cine || LOOK.cine));
  let bokeh = null, grade = null;
  if (cineOn && cine.fill !== 1) scene.traverse(o => { if (o.isHemisphereLight || o.isAmbientLight) o.intensity *= cine.fill; });   // less flat fill: let shadows be shadows
  const aoCfg = LQ || new URLSearchParams(location.search).get('ao') === '0' || T.ao === false ? null : { ...(LOOK.ao || {}), ...(T.ao || {}) };
  let composer = null, aoPass = null;
  if (aoCfg && aoCfg.intensity !== 0) {
    const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js'), { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
    const { GTAOPass } = await import('three/addons/postprocessing/GTAOPass.js'), { OutputPass } = await import('three/addons/postprocessing/OutputPass.js');
    // the composer renders into its own target, so the canvas' antialias flag no longer applies: give it 4x MSAA
    const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: Math.min(4, renderer.capabilities.maxSamples || 4) });
    composer = new EffectComposer(renderer, rt); composer.addPass(new RenderPass(scene, camera));
    aoPass = new GTAOPass(scene, camera, 2, 2); aoPass.output = GTAOPass.OUTPUT.Default; aoPass.blendIntensity = aoCfg.intensity ?? .8;
    aoPass.updateGtaoMaterial({ radius: aoCfg.radius ?? .3, distanceExponent: 1, thickness: aoCfg.thickness ?? .25, distanceFallOff: 1, scale: aoCfg.scale ?? 1, samples: 16 });   // small thickness: no dark halo on walls / boards behind people
    aoPass.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 12, rings: 3, samples: 24 });
    { const ov = aoPass.overrideVisibility.bind(aoPass);   // GTAO only hides points / lines: sprites (steam, notes) and see-through effects drew as dark squares
      aoPass.overrideVisibility = function () { ov(); this.scene.traverse(o => { if (o.isSprite || (o.isMesh && o.material && !Array.isArray(o.material) && o.material.transparent && o.material.depthWrite === false)) o.visible = false; }); }; }
    composer.addPass(aoPass);
    // CINE (Xavier 2026-10-28, Ink Game study, reference/inkgame/NOTES.md): the lens + grade that stop it looking flat.
    // Depth of field focused on the shot's look-at point, bloom on bright lights / screens, then (after tone mapping) a
    // grade: contrast curve, vignette, seeded film grain, a hair of chromatic fringe. On with T.cine / LOOK.cine / &cine=1.
    if (cineOn) {
      const { BokehPass } = await import('three/addons/postprocessing/BokehPass.js'), { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js');
      bokeh = new BokehPass(scene, camera, { focus: 2, aperture: cine.aperture, maxblur: cine.maxblur }); composer.addPass(bokeh);
      if (cine.bloom > 0) composer.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), cine.bloom, .4, cine.bloomAt ?? 1.8));
    }
    if (cineOn) {
      const { ShaderPass } = await import('three/addons/postprocessing/ShaderPass.js');
      grade = new ShaderPass({ uniforms: { tDiffuse: { value: null }, seed: { value: 0 }, vig: { value: cine.vignette }, grain: { value: cine.grain }, ca: { value: cine.ca }, con: { value: cine.contrast }, tint: { value: new THREE.Color(1, 1, 1) } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform sampler2D tDiffuse; uniform float seed, vig, grain, ca, con; uniform vec3 tint; varying vec2 vUv;
          float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + seed) * 43758.5453); }
          void main(){ vec2 d = vUv - .5; float r2 = dot(d, d);
            vec3 c = vec3(texture2D(tDiffuse, vUv - d * ca * r2).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv + d * ca * r2).b);
            vec3 cs = clamp(c / (1. + c), 0., 1.); c *= mix(vec3(1.), smoothstep(0., 1., cs) / max(cs, vec3(1e-4)), con) * tint;   // S-curve on the compressed value (linear HDR in)
            c *= 1. - vig * smoothstep(.12, .62, r2 * 1.6);                      // vignette
            c *= 1. + (h(vUv * 1000.) - .5) * grain * 2.;                                  // grain (seeded per frame: pure function of t)
            gl_FragColor = vec4(c, 1.); }` });
      composer.addPass(grade);
    }
    composer.addPass(new OutputPass());
  }
  // CAMERA SHAKE on impacts (Ink Game study): T.shakes = [{ t, amp, dur, freq? }] shakes position + aim, decaying.
  // (Xavier 2026-10-28: no impact freezes / hit-stops, ever.)
  function shakeAt(t) { const o = V(0, 0, 0); for (const s of T.shakes || []) { const u = t - s.t; if (u < 0 || u > s.dur) continue; const k = s.amp * Math.pow(1 - u / s.dur, 2), f = s.freq || 22;
    o.x += Math.sin(u * f * 6.283 + 1.3) * k; o.y += Math.sin(u * f * 5.1 + 4.2) * k * .8; o.z += Math.sin(u * f * 4.3 + 2.1) * k * .5; } return o; }
  function renderAt(t) {
    for (const a of Object.values(T.cast || {})) a.update(t);
    if (T.update) T.update(t);
    const c = cameraAt(t), hh = LOOK.handheld ?? 1;
    if (T.phone) {   // opt-in PHONE POV (T.phone = strength, ~1): a hand-held phone wobbles in position AND aim, several frequencies
      const s = T.phone, n = (a, b, c2) => Math.sin(t * a + b) * .6 + Math.sin(t * a * 2.37 + c2) * .3 + Math.sin(t * a * 5.1 + b * 3) * .1;
      c.p.add(V(n(1.1, 0, 1) * .018 * s, n(1.5, 2, .5) * .014 * s, n(.8, 4, 2) * .012 * s)); c.l.add(V(n(.9, 1, 3) * .035 * s, n(1.3, 5, 1) * .03 * s, 0)); c.roll += n(.7, 3, 4) * .012 * s;
    }
    { let k = CAM[0]; for (const x of CAM) if (t >= x.t) k = x; showFar(!!k.far); }
    if (visOn && cullable.length) { cullable.forEach(o => { o.visible = true; }); const s = visibleAt(t); cullable.forEach((o, i) => { o.visible = s.has(i + 1); }); }
    c.p.add(V(Math.sin(t * 1.3) * .012 * hh, Math.sin(t * 1.7 + 1) * .01 * hh, Math.sin(t * .9 + 2) * .012 * hh));
    { const sh = shakeAt(t); c.p.add(sh); c.l.add(sh.multiplyScalar(1.6)); }
    { const q = new URLSearchParams(location.search).get('cam'); if (q) { const n = q.split(',').map(Number); c.p = V(n[0], n[1], n[2]); c.l = V(n[3], n[4], n[5]); if (n[6]) c.fov = n[6]; } }   // debug: &cam=px,py,pz,lx,ly,lz[,fov]
    camera.position.copy(c.p); camera.up.set(Math.sin(c.roll), Math.cos(c.roll), 0); camera.lookAt(c.l); camera.fov = c.fov; camera.updateProjectionMatrix();
    let ch = null; for (const x of CH) if (t >= x.s - .05) ch = x; if (ch && t > ch.e + .5) ch = null;
    setCap(ch ? (LOOK.captionCase === 'lower' ? ch.text.toLowerCase() : ch.text) : '', ch ? t - ch.s : 0);
    if (bokeh) { const k = CAM.reduce((m, x) => t >= x.t ? x : m, CAM[0]); bokeh.uniforms.focus.value = k.focus ?? camera.position.distanceTo(c.l); bokeh.uniforms.aperture.value = k.aperture ?? cine.aperture; }
    if (grade) grade.uniforms.seed.value = (Math.round(t * 24) % 97) * 1.37;
    shadeLOD(); if (composer) composer.render(); else renderer.render(scene, camera);
  }
  function size() { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); stage.style.setProperty('--w', w + 'px');
    if (composer) { const pr = renderer.getPixelRatio(); composer.setSize(w, h); aoPass.setSize(Math.round(w * pr), Math.round(h * pr)); /* full res: half-res AO left speckled fringes on edges */ } }
  size(); new ResizeObserver(size).observe(stage);
  window.__dbg = { scene, camera, THREE, T, renderer };
  return { renderAt, DUR, beats: [] };
}
