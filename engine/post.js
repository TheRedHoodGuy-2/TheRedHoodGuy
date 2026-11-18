// POST (the "shader pack"), 2026-11-18. One pipeline for every shot:
//   scene (HDR, half float, with depth) -> volumetric light (real shafts: ray-marched through the sun's shadow map, so
//   window frames, curtains and people cut the beams) -> bloom (only what is brighter than white: lamps, the sun in a
//   window) -> depth of field (from the real depth) -> tone map (Khronos Neutral: keeps hue and saturation) + grade
//   (contrast, saturation, split tone, black point) -> SMAA.  Every setting is per SHOT, not a preset: the scene file
//   passes what its mood needs.
import * as THREE from 'three';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

const FS_QUAD = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), QS = new THREE.Scene(), QC = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); QS.add(FS_QUAD);
const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
function quad(r, mat, target) { FS_QUAD.material = mat; r.setRenderTarget(target); r.render(QS, QC); }

const UNPACK = `
const float UnpackDownscale = 255. / 256.;
const vec4 PackFactors = vec4(1., 256., 256. * 256., 256. * 256. * 256.);
const vec4 UnpackFactors = UnpackDownscale / PackFactors;
float unpackRGBAToDepth(const in vec4 v){ return dot(v, UnpackFactors); }`;

// shared by the volume pass and the dust: is world point p lit by the sun?
export const SUNLIT_GLSL = UNPACK + `
uniform sampler2D sunShadow; uniform mat4 sunMatrix; uniform float sunBias;
float sunlit(vec3 p){
  vec4 sc = sunMatrix * vec4(p, 1.); sc.xyz /= sc.w;
  if (sc.x < 0. || sc.x > 1. || sc.y < 0. || sc.y > 1. || sc.z > 1.) return 1.;
  return step(sc.z + sunBias, unpackRGBAToDepth(texture2D(sunShadow, sc.xy)));
}`;

export function makePost(renderer, scene, camera, W, H, o = {}) {
  const P = Object.assign({
    volume: 0, volumeColor: '#ffb070', volumeG: .45, volumeSteps: 48, volumeMax: 7,          // shafts (0 = off)
    bloom: .35, bloomRadius: .55, bloomThreshold: 1.0,                                           // glow on real lights only
    focus: 3, aperture: 0, maxBlur: 6,                                                           // DOF (aperture 0 = off)
    exposure: 1, contrast: 1.12, saturation: 1.12, black: 0., shadowTint: '#000000', highTint: '#000000', tintAmt: 0, pivot: .42,
  }, o);
  const hf = { type: THREE.HalfFloatType, depthBuffer: true };
  const rtScene = new THREE.WebGLRenderTarget(W, H, hf); rtScene.depthTexture = new THREE.DepthTexture(W, H); rtScene.depthTexture.type = THREE.FloatType;
  const rtA = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType }), rtB = rtA.clone(), rtLDR = new THREE.WebGLRenderTarget(W, H);
  const hw = Math.ceil(W / 2), hh = Math.ceil(H / 2), rtFog = new THREE.WebGLRenderTarget(hw, hh, { type: THREE.HalfFloatType }), rtFog2 = rtFog.clone();
  const sun = o.sun || null;

  const fogMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: {
      depth: { value: rtScene.depthTexture }, projInv: { value: new THREE.Matrix4() }, camWorld: { value: new THREE.Matrix4() }, camPos: { value: new THREE.Vector3() },
      sunShadow: { value: null }, sunMatrix: { value: new THREE.Matrix4() }, sunBias: { value: .0015 }, sunDir: { value: new THREE.Vector3() }, g: { value: P.volumeG }, steps: { value: P.volumeSteps }, maxD: { value: P.volumeMax }, res: { value: new THREE.Vector2(hw, hh) },
      box0: { value: new THREE.Vector3(...(o.volumeBox?.[0] || [-1e3, -1e3, -1e3])) }, box1: { value: new THREE.Vector3(...(o.volumeBox?.[1] || [1e3, 1e3, 1e3])) } },
    fragmentShader: SUNLIT_GLSL + `
      varying vec2 vUv; uniform sampler2D depth; uniform mat4 projInv, camWorld; uniform vec3 camPos, sunDir, box0, box1; uniform float g, steps, maxD; uniform vec2 res;
      float ign(vec2 p){ return fract(52.9829189 * fract(dot(p, vec2(.06711056, .00583715)))); }
      void main(){
        float d = texture2D(depth, vUv).x; vec4 v = projInv * vec4(vUv * 2. - 1., d * 2. - 1., 1.); v /= v.w; vec3 wp = (camWorld * v).xyz;
        vec3 rd = wp - camPos; float L = length(rd); rd /= L; L = min(L, maxD);
        float cs = dot(rd, sunDir), ph = (1. - g * g) / (4. * 3.14159 * pow(1. + g * g - 2. * g * cs, 1.5));   // Henyey-Greenstein: brighter looking into the sun
        float st = L / steps, t = st * ign(gl_FragCoord.xy), acc = 0.;
        for (int i = 0; i < 96; i++) { if (float(i) >= steps) break; vec3 p = camPos + rd * t;
          if (all(greaterThan(p, box0)) && all(lessThan(p, box1))) acc += sunlit(p);
          t += st; }
        gl_FragColor = vec4(vec3(acc * st * ph), 1.);
      }` });
  const blurMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { src: { value: null }, dir: { value: new THREE.Vector2() } },
    fragmentShader: `varying vec2 vUv; uniform sampler2D src; uniform vec2 dir;
      void main(){ vec3 c = vec3(0.); float w[5]; w[0]=.227; w[1]=.1945; w[2]=.1216; w[3]=.054; w[4]=.0162;
        c += texture2D(src, vUv).rgb * w[0]; for (int i = 1; i < 5; i++){ c += texture2D(src, vUv + dir * float(i)).rgb * w[i]; c += texture2D(src, vUv - dir * float(i)).rgb * w[i]; }
        gl_FragColor = vec4(c, 1.); }` });
  const compMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { scene: { value: rtScene.texture }, fog: { value: rtFog.texture }, fogCol: { value: new THREE.Color(P.volumeColor) }, amt: { value: P.volume } },
    fragmentShader: `varying vec2 vUv; uniform sampler2D scene, fog; uniform vec3 fogCol; uniform float amt;
      void main(){ gl_FragColor = vec4(texture2D(scene, vUv).rgb + texture2D(fog, vUv).rgb * fogCol * amt, 1.); }` });
  // depth of field: a 36-tap disc gather, radius from the circle of confusion of the real depth
  const dofMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { src: { value: null }, depth: { value: rtScene.depthTexture }, near: { value: camera.near }, far: { value: camera.far }, focus: { value: P.focus }, ap: { value: P.aperture }, maxB: { value: P.maxBlur }, px: { value: new THREE.Vector2(1 / W, 1 / H) } },
    fragmentShader: `varying vec2 vUv; uniform sampler2D src, depth; uniform float near, far, focus, ap, maxB; uniform vec2 px;
      float lin(float d){ float z = d * 2. - 1.; return 2. * near * far / (far + near - z * (far - near)); }
      float coc(vec2 uv){ float z = lin(texture2D(depth, uv).x); return clamp(ap * abs(z - focus) / z, 0., maxB); }
      void main(){ float c0 = coc(vUv); vec3 acc = texture2D(src, vUv).rgb; float wsum = 1.;
        for (int i = 0; i < 36; i++){ float a = float(i) * 2.39996, r = sqrt(float(i) + .5) / 6.; vec2 o = vec2(cos(a), sin(a)) * r * maxB * px;
          float c = coc(vUv + o); float w = step(r * maxB, max(c, c0) + .5);   // a sample counts if its own blur (or ours) reaches this far
          acc += texture2D(src, vUv + o).rgb * w; wsum += w; }
        gl_FragColor = vec4(acc / wsum, 1.); }` });
  // tone map (Khronos PBR Neutral) + grade, out in sRGB
  const gradeMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { src: { value: null }, exposure: { value: P.exposure }, contrast: { value: P.contrast }, sat: { value: P.saturation }, black: { value: P.black },
      sT: { value: new THREE.Color(P.shadowTint) }, hT: { value: new THREE.Color(P.highTint) }, tint: { value: P.tintAmt }, pivot: { value: P.pivot } },
    fragmentShader: `varying vec2 vUv; uniform sampler2D src; uniform float exposure, contrast, sat, black, tint, pivot; uniform vec3 sT, hT;
      vec3 neutral(vec3 c){ const float S = .8 - .04, D = .15; float x = min(c.r, min(c.g, c.b)); float off = x < .08 ? x - 6.25 * x * x : .04; c -= off;
        float pk = max(c.r, max(c.g, c.b)); if (pk < S) return c; float d = 1. - S, np = 1. - d * d / (pk + d - S); c *= np / pk; float gg = 1. - 1. / (D * (pk - np) + 1.); return mix(c, np * vec3(1.), gg); }
      vec3 toSRGB(vec3 c){ return mix(c * 12.92, 1.055 * pow(c, vec3(1. / 2.4)) - .055, step(.0031308, c)); }
      void main(){ vec3 c = neutral(texture2D(src, vUv).rgb * exposure); c = clamp(c, 0., 1.);
        vec3 s = toSRGB(c); float l = dot(s, vec3(.2126, .7152, .0722));
        s = mix(vec3(l), s, sat);                                                  // saturation
        s = (s - pivot) * contrast + pivot;                                        // contrast around the mid grey
        float lw = smoothstep(.0, .55, l), hw = smoothstep(.45, 1., l);
        s += tint * ((1. - lw) * (sT - .5) + hw * (hT - .5)) * .5;                 // split tone: shadows one way, highlights the other
        s = (s - black) / (1. - black);                                            // black point
        gl_FragColor = vec4(clamp(s, 0., 1.), 1.); }` });

  // bloom: only what is brighter than the threshold, capped (the sun in a window must not fog the whole frame), 3 small levels
  const lv = [2, 4, 8].map(d => [new THREE.WebGLRenderTarget(Math.ceil(W / d), Math.ceil(H / d), { type: THREE.HalfFloatType }), new THREE.WebGLRenderTarget(Math.ceil(W / d), Math.ceil(H / d), { type: THREE.HalfFloatType })]);
  const brightMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { src: { value: null }, thr: { value: P.bloomThreshold }, cap: { value: P.bloomCap ?? 3 } },
    fragmentShader: `varying vec2 vUv; uniform sampler2D src; uniform float thr, cap; void main(){ vec3 c = texture2D(src, vUv).rgb; float l = max(c.r, max(c.g, c.b)); vec3 b = c * (max(l - thr, 0.) / max(l, 1e-4)); float bl = max(b.r, max(b.g, b.b)); gl_FragColor = vec4(b * min(1., cap / max(bl, 1e-4)), 1.); }` });
  const copyMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { src: { value: null } }, fragmentShader: 'varying vec2 vUv; uniform sampler2D src; void main(){ gl_FragColor = texture2D(src, vUv); }' });
  const addMat = new THREE.ShaderMaterial({ vertexShader: VS, uniforms: { src: { value: null }, b0: { value: lv[0][0].texture }, b1: { value: lv[1][0].texture }, b2: { value: lv[2][0].texture }, k: { value: P.bloom }, r: { value: P.bloomRadius } },
    fragmentShader: 'varying vec2 vUv; uniform sampler2D src, b0, b1, b2; uniform float k, r; void main(){ vec3 b = texture2D(b0, vUv).rgb + texture2D(b1, vUv).rgb * r + texture2D(b2, vUv).rgb * r * r; gl_FragColor = vec4(texture2D(src, vUv).rgb + b * k, 1.); }' });
  const bloom = { render(r, src, dst) {
    brightMat.uniforms.src.value = src.texture; quad(r, brightMat, lv[0][0]);
    for (let i = 0; i < 3; i++) { const [a, b] = lv[i]; if (i) { copyMat.uniforms.src.value = lv[i - 1][0].texture; quad(r, copyMat, a); }
      for (let k = 0; k < 2; k++) { blurMat.uniforms.src.value = a.texture; blurMat.uniforms.dir.value.set(1.2 * W / 540 / a.width, 0); quad(r, blurMat, b); blurMat.uniforms.src.value = b.texture; blurMat.uniforms.dir.value.set(0, 1.2 * W / 540 / a.height); quad(r, blurMat, a); } }
    addMat.uniforms.src.value = src.texture; quad(r, addMat, dst); } };
  const smaa = new SMAAPass(W, H); smaa.renderToScreen = true;
  const api = { P, rtScene, sun, fogMat, gradeMat, dofMat };
  api.render = () => {
    const r = renderer; r.toneMapping = THREE.NoToneMapping;
    r.setRenderTarget(rtScene); r.render(scene, camera);
    camera.updateMatrixWorld();
    let src = rtScene;
    if (P.volume > 0 && sun) {
      const u = fogMat.uniforms; u.projInv.value.copy(camera.projectionMatrixInverse); u.camWorld.value.copy(camera.matrixWorld); u.camPos.value.setFromMatrixPosition(camera.matrixWorld);
      u.sunShadow.value = sun.shadow.map.texture; u.sunMatrix.value.copy(sun.shadow.matrix); u.sunDir.value.copy(sun.position).sub(sun.target.position).normalize();
      quad(r, fogMat, rtFog);
      for (let k = 0; k < 2; k++) { blurMat.uniforms.src.value = rtFog.texture; blurMat.uniforms.dir.value.set(1.5 * W / 540 / hw, 0); quad(r, blurMat, rtFog2); blurMat.uniforms.src.value = rtFog2.texture; blurMat.uniforms.dir.value.set(0, 1.5 * W / 540 / hh); quad(r, blurMat, rtFog); }
      quad(r, compMat, rtA); src = rtA;
    } else { compMat.uniforms.amt.value = 0; quad(r, compMat, rtA); src = rtA; }
    if (P.bloom > 0) { const dst = src === rtA ? rtB : rtA; bloom.render(r, src, dst); src = dst; }
    if (P.aperture > 0) { const dst = src === rtA ? rtB : rtA; dofMat.uniforms.src.value = src.texture; quad(r, dofMat, dst); src = dst; }
    gradeMat.uniforms.src.value = src.texture; quad(r, gradeMat, rtLDR);
    smaa.render(r, null, rtLDR);
  };
  return api;
}
