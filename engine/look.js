// LOOK RIG (2026-11-19, Xavier: "what happened to everything you said about lighting"). The approved research
// before/after (scenes/research_ab.js) + look study (research/look_study_2026-11-18.md) as engine defaults, so every
// scene gets them without anyone remembering:
//   - one motivated HARD key (sun / window / lamp) with real shadows that follow the subject (crisp shadow map)
//   - a soft KEY on the subject's face from the key-light side of the camera, a RIM from behind that cuts them out
//   - low fill (shape on faces), background darker and softer than the subject (DOF on the subject)
//   - grade: darker than our old videos, true blacks, richer + warmer colour, highlights rolled off white
// dayLook(scene, o) for exteriors, roomLook(scene, o) for interiors. Each returns { sun, post, follow(cam, subjectPos) }:
// call follow every frame AFTER the camera is placed.
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

export const GRADE = {   // look study targets: Gneef brightness .31, saturation .57, true black, warm .04
  day:  { exposure: 1.2, contrast: 1.14, saturation: 1.1, black: 0, shadowTint: '#3f5f8a', highTint: '#ffd6a0', tintAmt: .24, pivot: .4,
          lift: [0, .004, .016], gain: [1.05, 1.0, .95], bloom: .18, bloomRadius: .5, bloomThreshold: 1.5, bloomCap: 2.2, bloomTint: '#ffb391', grain: .02, ca: .003, volume: 0 },
  room: { exposure: 1.15, contrast: 1.12, saturation: 1.1, black: 0, shadowTint: '#4d6f92', highTint: '#ffd9a8', tintAmt: .24, pivot: .42,
          lift: [.004, .008, .02], gain: [1.05, 1.0, .95], bloom: .3, bloomRadius: .6, bloomThreshold: 1.35, bloomCap: 2.4, bloomTint: '#ffb391', grain: .025, ca: .004, volume: 0 },
};

export function paintSky(sky, top, horizon, glow = null, glowDir = null) {   // recolour the dome (time of day); glow = warm patch round the sun
  const p = sky.geometry.attributes.position, c = sky.geometry.attributes.color, a = new THREE.Color(top), b = new THREE.Color(horizon), g = glow ? new THREE.Color(glow) : null, v = new THREE.Vector3(), col = new THREE.Color();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const k = Math.max(0, v.y); col.copy(b).lerp(a, Math.pow(k, .55));
    if (g && glowDir) { const d = Math.max(0, v.dot(glowDir)); col.lerp(g, Math.pow(d, 6) * (1 - k) * .9); } col.multiplyScalar(1.25); c.setXYZ(i, col.r, col.g, col.b); }
  c.needsUpdate = true;
}
function skyDome(top = '#4f8fd6', horizon = '#cfe3f5') {
  const g = new THREE.SphereGeometry(350, 32, 16), c = [], a = new THREE.Color(top), b = new THREE.Color(horizon), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const k = Math.max(0, p.getY(i) / 350); const col = b.clone().lerp(a, Math.pow(k, .55)).multiplyScalar(1.25); c.push(col.r, col.g, col.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3));
  return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false }));
}

// subject lights: soft key beside the camera on the sun side + warm rim behind the subject; both re-aimed every frame
function subjectLights(scene, { key = 5, rim = 30, keyColor = '#fff2e2', rimColor = '#ffe4bf' } = {}) {
  RectAreaLightUniformsLib.init();
  const K = new THREE.RectAreaLight(keyColor, key, 1.1, 1.1), R = new THREE.SpotLight(rimColor, rim, 9, .55, .7, 1.4);
  scene.add(K, R, R.target);
  const v = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  return (cam, subj, keyDir, face = 1.6) => {
    const S = new THREE.Vector3(subj.x, (subj.y || 0) + face, subj.z), toCam = cam.position.clone().sub(S).setY(0).normalize();
    // key: 40 deg off the camera axis toward the motivated light, 1.6 m out, 0.7 m above the face
    const side = new THREE.Vector3().crossVectors(up, toCam).multiplyScalar(Math.sign(v.copy(keyDir).dot(new THREE.Vector3().crossVectors(up, toCam))) || 1);
    K.position.copy(S).addScaledVector(toCam, 1.25).addScaledVector(side, 1.05).add(new THREE.Vector3(0, .7, 0)); K.lookAt(S);
    // rim: behind the subject, opposite the camera, a little to the far side, above
    R.position.copy(S).addScaledVector(toCam, -2.6).addScaledVector(side, -1.1).add(new THREE.Vector3(0, 1.4, 0)); R.target.position.copy(S).add(new THREE.Vector3(0, -.3, 0));
  };
}

export function dayLook(scene, { sunAz = 215, sunEl = 38, sun = 3.3, fill = .55, keyK = 4, rimK = 34, sunColor = '#ffe3bd', skyTop, skyHorizon, hemiSky = '#a9c8ee', hemiGround = '#5d6b3c', disc = false } = {}) {
  const L = new THREE.DirectionalLight(sunColor, sun), az = sunAz * Math.PI / 180, el = sunEl * Math.PI / 180;
  const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el));
  L.castShadow = true; L.shadow.mapSize.set(2048, 2048); Object.assign(L.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 70 });
  L.shadow.bias = -.0004; L.shadow.normalBias = .02; scene.add(L, L.target);
  const hemi = new THREE.HemisphereLight(hemiSky, hemiGround, fill), sky = skyDome(skyTop, skyHorizon); scene.add(hemi, sky);
  let sunDisc = null; if (disc) { sunDisc = new THREE.Mesh(new THREE.CircleGeometry(9, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd08a').multiplyScalar(2.2), fog: false })); scene.add(sunDisc); }
  const lights = subjectLights(scene, { key: keyK, rim: rimK });
  const post = { ...GRADE.day, sun: L, aperture: 2.0, maxBlur: 9 };
  // setSun: move / recolour the sun over time (a sunset): az / el in degrees; the disc sits on the sky at that direction
  const setSun = (az, el, o = {}) => { const a = az * Math.PI / 180, e = el * Math.PI / 180; dir.set(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
    if (o.color) L.color.set(o.color); if (o.intensity != null) L.intensity = o.intensity; if (o.fill != null) hemi.intensity = o.fill;
    if (sunDisc) { sunDisc.position.copy(dir).multiplyScalar(300); sunDisc.lookAt(0, 0, 0); sunDisc.visible = el > -6; } };
  setSun(sunAz, sunEl);
  return { sun: L, hemi, sky, sunDisc, setSun, post, follow(cam, subj) {
    if (sunDisc) { const c = cam.position; sunDisc.position.copy(dir).multiplyScalar(300).add(c); sunDisc.lookAt(c); }
    L.target.position.set(subj.x, 0, subj.z); L.position.copy(L.target.position).addScaledVector(dir, 30);   // crisp shadows where we look
    lights(cam, subj, dir.clone().setY(0).normalize());
    post.focus = cam.position.distanceTo(new THREE.Vector3(subj.x, (subj.y || 0) + (subj.focusY ?? 1.5), subj.z));
  } };
}

export function roomLook(scene, { window: win = [-6, 4, 2], sun = 2.6, fill = .5, keyK = 6, rimK = 40 } = {}) {
  const L = new THREE.DirectionalLight('#fff0dc', sun); L.position.set(...win); L.castShadow = true; L.shadow.mapSize.set(2048, 2048);
  Object.assign(L.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: .5, far: 30 }); L.shadow.bias = -.0005; scene.add(L, L.target);
  scene.add(new THREE.HemisphereLight('#e9e0d4', '#6e5b48', fill));
  const dir = new THREE.Vector3(...win).normalize(), lights = subjectLights(scene, { key: keyK, rim: rimK });
  const post = { ...GRADE.room, sun: L, aperture: 2.4, maxBlur: 12 };
  return { sun: L, post, follow(cam, subj) { lights(cam, subj, dir.clone().setY(0).normalize()); post.focus = cam.position.distanceTo(new THREE.Vector3(subj.x, (subj.y || 0) + (subj.focusY ?? 1.5), subj.z)); } };
}
