// 3D ANIMATED HEAD example (2026-11-19): real Roblox dynamic heads (Man Face, Silly Fun bundles, their R6 head mesh)
// on our R6 bodies. The eyes, brows and mouth are separate mesh pieces (split by tools: assets/dynheads/*/model.glb), so
// they are animated directly: blink (eyes squash), brow raise / frown, mouth widen / open, plus a head turn.
// (Roblox's own FACS rig is not in the R6 head mesh; this is the test of the LOOK of a 3D face in motion.)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { makeR6 } from '../engine/r6.js';
import { poseRig } from '../engine/rig.js';

const BANK = async () => Object.fromEntries((await (await fetch(new URL('library/characters.json', document.baseURI))).json()).map(c => [c.id, c]));
async function head3d(a, name, skin) {
  const g = (await new GLTFLoader().loadAsync(new URL(`assets/dynheads/${name}/model.glb`, document.baseURI).href)).scene, parts = {};
  const im = await new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = new URL(`assets/dynheads/${name}/texture.png`, document.baseURI).href; });
  const cv = document.createElement('canvas'); cv.width = cv.height = im.width; const x = cv.getContext('2d'); x.fillStyle = skin; x.fillRect(0, 0, cv.width, cv.height); x.drawImage(im, 0, 0);   // the head texture is drawn over the skin colour (its empty areas are skin)
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = 8;
  const mat = new THREE.MeshStandardMaterial({ map: t, roughness: .55 });
  g.traverse(o => { if (o.isMesh) { o.geometry.computeVertexNormals(); o.material = mat; o.castShadow = o.receiveShadow = true;   // the Draco mesh carries no normals (zeros -> NaN light, black, and it poisoned the room probe)
    const k = o.name.replace(/_\d+$/, ''); parts[k] = o; o.geometry.computeBoundingBox(); o.userData.c = o.geometry.boundingBox.getCenter(new THREE.Vector3()); } });
  a.parts.head.visible = false; a.parts.head.children.forEach(c => { if (!c.isMesh) return; });   // hide the plain head and its face patch
  const holder = new THREE.Group(); holder.add(g); a.parts.head.parent.add(holder); holder.position.copy(a.parts.head.position);
  for (const acc of a.accessories) acc.handle.parent === a.parts.head && holder.add(acc.handle);   // hair rides on the new head
  return { root: holder, parts };
}
export async function build({ scene, W, H, opts = {} }) {
  const B = await BANK(), spec = c => ({ res: 1024, skin: c.skin, sex: c.sex, hair: c.hair, accessories: c.accessories.filter(i => ![11884330, 4197739997, 301820310].includes(i)), face: false,
    shirt: c.shirtTex || `assets/roblox/${c.shirt}/texture.png`, pants: c.pantsTex || `assets/roblox/${c.pants}/texture.png` });
  const guy = await makeR6(spec(B.m005)), girl = await makeR6(spec(B.f002));
  const Hg = await head3d(guy, 'man_face', B.m005.skin), Hf = await head3d(girl, 'silly_fun', B.f002.skin);
  poseRig(guy).pose({ armL: [.12, -1, .05], armR: [-.1, -1, -.04] }); poseRig(girl).pose({ armL: [.1, -1, .02], armR: [-.12, -1, .05] });
  guy.root.position.set(-.82, 0, 0); guy.root.rotation.y = .3; girl.root.position.set(.82, 0, 0); girl.root.rotation.y = -.3; scene.add(guy.root, girl.root);
  scene.background = new THREE.Color('#dfe6ee'); scene.add(new THREE.HemisphereLight('#f4f6fa', '#8a7f72', 1.2));
  const key = new THREE.DirectionalLight('#fff3e4', 2.4); key.position.set(-2, 3, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1, near: .5, far: 20 }); key.shadow.bias = -.0005; key.shadow.normalBias = .02; key.target.position.set(0, 1.2, 0); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight('#cfe0ff', 1.6); rim.position.set(3, 3, -3); scene.add(rim);
  const cam = new THREE.PerspectiveCamera(24, W / H, .05, 100); cam.position.set(0, 1.62, 3.9); cam.lookAt(0, 1.5, 0);
  const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x), pulse = (t, a, b, s = .08) => ease((t - a) / s) * (1 - ease((t - b) / s));
  // expression timeline (seconds): both heads blink at different times, raise brows (surprise), then smile / talk
  const animate = (Hd, t, off) => { const p = Hd.parts, tt = t + off;
    const blink = Math.max(pulse(tt, .9, 1.05), pulse(tt, 2.7, 2.85), pulse(tt, 4.3, 4.45));
    if (p.eye) { p.eye.scale.y = 1 - .9 * blink; p.eye.position.y = p.eye.userData.c.y * .9 * blink; }
    const sur = pulse(tt, 1.4, 2.4, .18), frown = pulse(tt, 3.1, 3.9, .15);
    if (p.brow) { p.brow.position.y = .07 * sur - .035 * frown; p.brow.scale.x = 1 - .05 * frown; }
    const talk = pulse(tt, 3.0, 4.2, .1) * (.5 + .5 * Math.sin(tt * 22));
    if (p.mouth) { const c = p.mouth.userData.c; p.mouth.scale.set(1 + .18 * sur - .08 * frown, 1 + .9 * talk + .5 * sur, 1); p.mouth.position.set(-c.x * (.18 * sur), -c.y * (.9 * talk + .5 * sur) * .5, 0); }
    Hd.root.rotation.y = .18 * Math.sin(tt * 1.3); Hd.root.rotation.x = .06 * Math.sin(tt * 2.1 + 1) - .08 * sur; };
  return { camera: cam, sun: key, update: t => { animate(Hg, t, 0); animate(Hf, t, .45); return true; },
    post: { sun: key, volume: 0, focus: 3.4, aperture: .4, maxBlur: 1, bloom: .1, bloomRadius: .5, bloomThreshold: 2, bloomCap: 2, exposure: 1.15, contrast: 1.05, saturation: 1.05, black: .02, shadowTint: '#5a7894', highTint: '#ffe0b0', tintAmt: 0, pivot: .42 } };
}
