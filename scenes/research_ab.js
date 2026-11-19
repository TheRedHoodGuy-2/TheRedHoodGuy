// BEFORE / AFTER the research (2026-11-19). One story beat: in class, Ava turns round to whisper something to Ethan;
// he can't believe it. opts.mode = 'before' (how I staged shots before the research) | 'after' (research applied).
// BEFORE: high wide camera over the class, subject in the middle, room lit evenly, stiff symmetric poses (the girl just
//   rotated on her chair, arms hanging, head straight), old neutral faces, default grade.
// AFTER (research/animation.md, cinematography.md, faces.md):
//   composition: over-the-shoulder (his shoulder = out-of-focus foreground plane), her eyes on the top third line, she
//     sits on the right third with look room toward him, the class and board as soft background layers
//   lens: long lens (~70 mm equivalent) from 3.5 m, shallow depth of field on her eyes
//   light: window light from behind her = rim that cuts her out of the background, a soft motivated key on her face
//     (bounce off the desks / ceiling panel), fill lowered for a 1:3 ratio; dark foreground, mid subject, bright back
//   posing: line of action leaning toward him, power centre at the head, asymmetric arms (one on the chair back, one
//     in the lap), legs uneven, head turned further than the body (eyes lead), his body leans in, one hand up
//   acting / faces: face kit v2: her smug whisper with eyes on him, his shock
//   grade: lift / gamma / gain (cool shadows, warm highlights, skin protected), gentle contrast, halation on the window,
//     mid-tone film grain, lens fringe at the edges; no vignette (Xavier's rule)
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { classroom, W, D } from '../engine/sets/classroom.js';
import { makeR6 } from '../engine/r6.js';
import { poseRig } from '../engine/rig.js';
import { CLASS } from './classroom.js';

const SIT = [
  { legL: [.08, 0, 1], legR: [-.1, 0, 1], armL: [.05, -.12, .99], armR: [-.12, -.1, .99], head: [0, -.06, 0] },
  { legL: [.15, 0, 1], legR: [-.04, 0, 1], armL: [.08, -.12, .99], armR: [-.1, .35, .94], head: [-.12, .08, -.2], root: { rz: -.05 } },
  { legL: [.04, 0, 1], legR: [-.14, 0, 1], armL: [.2, -.9, .1], armR: [-.05, -.12, .99], head: [.1, -.18, .04], root: { rz: .03 } },
  { legL: [.06, 0, 1], legR: [-.06, 0, 1], armL: [.1, -.12, .99], armR: [-.1, -.12, .99], head: [.2, .1, 0] },
];
export async function build({ scene, W: w, H: h, opts = {} }) {
  RectAreaLightUniformsLib.init();
  const after = opts.mode !== 'before', HER = 6, HIM = 11, EMPTY = new Set([4, 18, 22]);
  const C = await classroom(scene, { hide: after ? ['s', 'e'] : ['s'] });
  const bank = Object.fromEntries((await (await fetch(new URL('library/characters.json', document.baseURI))).json()).map(c => [c.id, c]));
  const spec = (c, face) => ({ res: 1024, skin: c.skin, sex: c.sex, hair: c.hair, accessories: c.accessories.filter(i => ![11884330, 4197739997, 301820310].includes(i)), ...(c.hairTint ? { hairTint: c.hairTint } : {}),
    shirt: c.shirtTex || `assets/roblox/${c.shirt}/texture.png`, pants: c.pantsTex || `assets/roblox/${c.pants}/texture.png`, ...face });
  const seatY = s => s.seatTop + .17 - .68 + .025, place = (a, s, ry = Math.PI, dz = -.02) => { const g = new THREE.Group(); g.add(a.root); g.position.set(s.x, 0, s.z + dz); g.rotation.y = ry; scene.add(g); return g; };
  // the class (everyone else), same in both versions; faces: old neutral before, kit v2 after (varied, alive)
  const others = CLASS.filter(id => id !== 'f002' && id !== 'm005'); let k = 0;
  const bgEmo = ['neutral', 'bored', 'neutral', 'happy', 'neutral', 'smug', 'bored'];
  for (const [i, s] of C.seats.entries()) {
    if (EMPTY.has(i) || i === HER || i === HIM || k >= others.length) continue; const c = bank[others[k++]];
    const a = await makeR6(spec(c, after ? { face2: bgEmo[(i * 3) % bgEmo.length] } : {})), p = SIT[(i * 7 + 3) % SIT.length];
    poseRig(a).pose({ ...p, root: { ...(p.root || {}), y: seatY(s) } }); place(a, s);
  }
  const t = bank.f010, ta = await makeR6(spec(t, after ? { face2: 'neutral' } : {})); poseRig(ta).pose({ armL: [.25, -.6, .75], armR: [-.1, -1, .05], head: [.1, -.04, .03] }); ta.root.position.copy(C.teacherSpot); ta.root.rotation.y = .25; scene.add(ta.root);
  // the two actors
  const sHer = C.seats[HER], sHim = C.seats[HIM];
  const her = await makeR6(spec(bank.f002, after ? { face2: { eyes: { open: .62, tilt: .25, gaze: opts.gz || [.5, -.05] }, brows: { h: .1 }, browL: { h: .55, arch: .5 }, mouth: 'smirk', blush: .1 } } : {}));
  const him = await makeR6(spec(bank.m005, after ? { face2: { eyes: { open: 1.12, iris: .6, gaze: [.15, -.1] }, brows: { h: 1.2, arch: .7 }, mouth: 'gasp' } } : {}));
  if (after) {
    // her: sideways on the chair, body turned toward him, head further (eyes lead), leaning in: one C curve
    poseRig(her).pose({ legL: [.28, -.04, 1], legR: [.02, -.16, 1], armR: [-.78, -.55, -.12], armL: [.22, -.92, .32], head: [-.62, .06, .14], root: { y: seatY(sHer), rx: .1, rz: -.14 } });
    place(her, sHer, 1.15, .04);
    // him: leaning in to hear, head forward and tilted, both forearms on the desk at different angles (a raised hand filled the frame as a sharp block)
    poseRig(him).pose({ legL: [.12, 0, 1], legR: [-.16, -.04, 1], armL: [.1, -.1, .99], armR: [-.22, -.12, .97], head: [.12, -.1, .1], root: { y: seatY(sHim), rx: .16, rz: .05 } });
    place(him, sHim);
  } else {   // before: the same beat, staged stiffly
    poseRig(her).pose({ legL: [.06, 0, 1], legR: [-.06, 0, 1], root: { y: seatY(sHer) } }); place(her, sHer, 1.15, .04);
    poseRig(him).pose({ legL: [.06, 0, 1], legR: [-.06, 0, 1], armL: [.06, -.12, .99], armR: [-.06, -.12, .99], root: { y: seatY(sHim) } }); place(him, sHim);
  }
  globalThis.AB = { her, him, C };
  let cam, post;
  if (after) {
    const CP = opts.cp || [-1.7, 1.98, 2.1], CL = opts.cl || [-2.0, 1.52, -.83]; cam = new THREE.PerspectiveCamera(opts.fov || 30, w / h, .05, 400); cam.position.set(...CP); cam.lookAt(...CL);
    // light design: lower the even ceiling light (fill), a soft key on her face, the window as her rim
    C.ceilingLights.forEach(l => l.intensity *= .55);
    const key = new THREE.RectAreaLight('#fff1e0', 9, .9, .9); key.position.set(-1.1, 2.3, .3); key.lookAt(-2.2, 1.7, -.75); scene.add(key);
    const rim = new THREE.SpotLight('#ffe9c8', 40, 9, .5, .6, 1.2); rim.position.set(-5.6, 3.1, -2.8); rim.target.position.set(-2.2, 1.7, -.75); scene.add(rim, rim.target);
    C.sun.intensity = 3.6;
    post = { sun: C.sun, volume: 0, focus: cam.position.distanceTo(new THREE.Vector3(-1.99, 1.72, -.83)), aperture: 2.4, maxBlur: 12 * w / 540, bloom: .32, bloomRadius: .6, bloomThreshold: 1.35, bloomCap: 2.4, bloomTint: '#ffb391',
      exposure: 1.18, contrast: 1.1, saturation: 1.04, black: .025, shadowTint: '#4d6f92', highTint: '#ffd9a8', tintAmt: .22, pivot: .42,
      lift: [.012, .018, .034], gamma: [1, 1, 1.01], gain: [1.03, 1, .965], grain: .03, ca: .006 };
  } else {
    cam = new THREE.PerspectiveCamera(44, w / h, .05, 400); cam = new THREE.PerspectiveCamera(38, w / h, .05, 400); cam.position.set(-1.0, 2.8, 3.7); cam.lookAt(-2.1, 1.3, .1);   // my old rule: high over the heads, subject dead centre
    post = { sun: C.sun, volume: 0, focus: 6, aperture: .8, maxBlur: 2 * w / 540, bloom: .2, bloomRadius: .5, bloomThreshold: 1.8, bloomCap: 2.5,
      exposure: 1.25, contrast: 1.06, saturation: 1.08, black: .02, shadowTint: '#5a7894', highTint: '#ffe0b0', tintAmt: .15, pivot: .42 };
  }
  return { camera: cam, sun: C.sun, post };
}
