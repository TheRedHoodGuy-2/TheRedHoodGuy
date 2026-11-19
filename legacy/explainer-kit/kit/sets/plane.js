// Plane cabin set (reusable): an economy cabin seen from inside. Cabin axis runs along z (the nose is at -z).
// Floor at y = 0. Rows every 0.82 m; the hero's row is at z = 0. Seats: 3 left (x < 0), aisle, 3 right (x > 0).
// Windows on both walls look out onto a bright sky; the sun pours in from the right-hand windows.
import * as THREE from 'three';
import { M, rb, add, grp, canvasTex, rng } from '../util.js';

export const ROW = .82, SEAT_X = [-1.42, -.94, -.46, .46, .94, 1.42], CABIN_R = 2.05, CABIN_CY = 1.05;

// one economy seat facing -z: cushion, back, headrest cover, armrests, tray table on the back
export function createSeat({ fabric, trim } = {}) {
  const g = new THREE.Group();
  rb(.46, .12, .46, fabric, 0, .44, 0, g, .05);                                  // cushion
  rb(.46, .72, .12, fabric, 0, .86, .23, g, .05).rotation.x = -.12;              // back (leans back a little)
  rb(.36, .16, .06, M(0xe8ecef, { roughness: .9 }), 0, 1.12, .2, g, .03).rotation.x = -.12;   // headrest cover
  rb(.4, .3, .02, trim, 0, .9, .3, g, .01).rotation.x = -.12;                    // tray table (on the back, facing the row behind)
  rb(.42, .38, .4, trim, 0, .19, .02, g, .03);                                   // base / under-seat box
  return g;
}

export function buildWorld(scene) {
  const R = rng(7), W = grp(0, 0, 0, scene), refs = {};
  scene.background = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6fa6dc'); gr.addColorStop(1, '#d8e9f7'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0xdfe8f0, 12, 40);
  const L = 16, z0 = -8;   // cabin length, front end
  // shell: an inside-facing tube (upper part), flat floor, carpet
  const wall = M(0xf6f1e8, { roughness: .8, side: THREE.BackSide });
  const shell = add(new THREE.CylinderGeometry(CABIN_R, CABIN_R, L, 48, 1, true, Math.PI * .28, Math.PI * 1.44), wall, 0, CABIN_CY, z0 + L / 2, W);
  shell.rotation.x = Math.PI / 2;   // the open sector faces down (the floor)
  const carpetTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#3d4a63'; g.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 5000; i++) { g.fillStyle = r() < .5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.12)'; g.fillRect(r() * w, r() * h, 2, 2); } }, [4, 16]);
  const floor = add(new THREE.PlaneGeometry(3.6, L), new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 1 }), 0, 0, z0 + L / 2, W); floor.rotation.x = -Math.PI / 2;
  rb(.7, .01, L, M(0x2f3a52, { roughness: 1 }), 0, .006, z0 + L / 2, W, .003, { shadow: false });   // aisle runner
  // windows: rounded frames on both walls between rows, glowing sky panes
  const pane = new THREE.MeshBasicMaterial({ color: 0xcfe6ff });
  const frameM = M(0xdfe2e3, { roughness: .6 });
  for (let k = -9; k <= 9; k++) for (const s of [-1, 1]) {
    const z = k * ROW + .1, x = s * (CABIN_R - .06), y = 1.2;
    const fr = rb(.06, .42, .3, frameM, x, y, z, W, .1); fr.rotation.z = s * .18;
    const p = add(new THREE.PlaneGeometry(.22, .34), pane, x - s * .035, y, z, W, { shadow: false }); p.rotation.y = -s * Math.PI / 2;
  }
  // overhead bins + ceiling light strips
  const binM = M(0xf4f5f4, { roughness: .5 });
  for (const s of [-1, 1]) { const b = rb(.62, .42, L, binM, s * 1.12, 2.15, z0 + L / 2, W, .08); b.rotation.z = s * .12; }
  const strip = new THREE.MeshStandardMaterial({ color: 0xfff6e6, emissive: 0xfff1d8, emissiveIntensity: 1.2 });
  rb(.5, .02, L, strip, 0, 2.62, z0 + L / 2, W, .01, { shadow: false });
  // seats: rows from front to back, our row is k = 0
  const fabrics = [M(0x2b5c9a, { roughness: .95 }), M(0x264f86, { roughness: .95 })], trim = M(0x6f7780, { roughness: .6 });
  refs.seats = {};
  for (let k = -8; k <= 8; k++) for (const x of SEAT_X) {
    const s = createSeat({ fabric: fabrics[(k + 20) % 2], trim }); s.position.set(x, 0, k * ROW); W.add(s); refs.seats[`${k},${x}`] = s;
  }
  for (let k = -8; k <= 8; k++) for (const x of [-1.66, -.7, -.22, .22, .7, 1.66]) rb(.05, .08, .42, trim, x, .66, k * ROW + .02, W, .02);   // armrests
  // lights: soft cabin fill + sun through the right-hand windows
  const hemi = new THREE.HemisphereLight(0xf2f6ff, 0x50586a, 1.0); scene.add(hemi); refs.hemi = hemi;
  const sun = new THREE.DirectionalLight(0xfff0d8, 2.4); sun.position.set(9, 6, 2); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -3, near: 1, far: 30 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 4;
  scene.add(sun); refs.sun = sun; refs.W = W;
  // warm cabin lighting along the ceiling (always on; the cabin is lit like a real one at cruise)
  for (const z of [-2.4, 0, 2.4]) { const l = new THREE.PointLight(0xffe2bd, 4, 5, 1.6); l.position.set(0, 2.45, z); scene.add(l); }
  return refs;
}
