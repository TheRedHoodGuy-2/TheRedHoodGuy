// Stage: renderer + the channel light rig (sun + sky), one place so every shot is lit the same way.
import * as THREE from 'three';

export const LOOK = { toneMapping: 'ACESFilmicToneMapping', exposure: 1.0, sunColor: '#fff3df', sunIntensity: 3.0, skyTop: '#2f7fe6', skyHorizon: '#bfe3ff', ground: '#6f8f5a', fill: .95 };

export function makeRenderer(canvas, w, h, { shadows = true } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setSize(w, h, false); r.setPixelRatio(1); r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE[LOOK.toneMapping]; r.toneMappingExposure = LOOK.exposure;
  r.shadowMap.enabled = shadows; r.shadowMap.type = THREE.PCFSoftShadowMap; return r;
}

// sky dome with a vertical gradient (clear blue day, like the reference)
export function sky(scene, { top = LOOK.skyTop, horizon = LOOK.skyHorizon } = {}) {
  const geo = new THREE.SphereGeometry(900, 32, 16);
  const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color(top) }, hor: { value: new THREE.Color(horizon) } },
    vertexShader: 'varying vec3 p; void main(){ p = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying vec3 p; void main(){ float h = clamp(normalize(p).y, 0., 1.); vec3 c = mix(hor, top, pow(h, .55)); gl_FragColor = vec4(c, 1.);\n#include <colorspace_fragment>\n}' });
  const m = new THREE.Mesh(geo, mat); m.name = 'sky'; scene.add(m); scene.background = null; return m;
}

// hard sun + sky fill. `focus` = point the shadow box follows, `size` = half-width of the shadow box in metres.
export function daylight(scene, { az = 35, el = 52, focus = new THREE.Vector3(0, 1, 0), size = 9, mapSize = 2048 } = {}) {
  const dir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - el), THREE.MathUtils.degToRad(az));
  const sun = new THREE.DirectionalLight(LOOK.sunColor, LOOK.sunIntensity); sun.position.copy(focus).addScaledVector(dir, 40); sun.target.position.copy(focus);
  sun.castShadow = true; sun.shadow.mapSize.set(mapSize, mapSize); const c = sun.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 1; c.far = 90; sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 1.5;
  const hemi = new THREE.HemisphereLight(LOOK.skyHorizon, LOOK.ground, LOOK.fill);
  scene.add(sun, sun.target, hemi); return { sun, hemi, dir };
}
