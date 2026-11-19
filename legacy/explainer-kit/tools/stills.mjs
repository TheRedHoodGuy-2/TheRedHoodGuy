// node tools/stills.mjs <topic> '<json array of times>' <outDir> [w h]   -> many stills from ONE page load (fast look-dev)
// Also writes <outDir>/sheet.jpg (all stills, labelled) and prints, per still, any mesh blocking the line from the camera
// to each cast member's head that should be in frame (occlusion check).
import fs from 'fs'; import { execFileSync } from 'child_process'; import { openPage, load } from './lib/browser.mjs';
const [topic, list, out, w = '360', h = '640'] = process.argv.slice(2), ts = JSON.parse(list);
fs.mkdirSync(out, { recursive: true });
const { browser, page } = await openPage({ width: +w, height: +h, dsf: 1 }); page.on('pageerror', e => console.log('ERR', e.message));
await load(page, `film.html?render=1&topic=${topic}${process.env.QS || ''}`);
for (const [i, t] of ts.entries()) {
  await page.evaluate(t => window.renderAt(t), t);
  const occ = await page.evaluate(() => {
    const { scene, camera, THREE, T } = window.__dbg, ray = new THREE.Raycaster(), res = []; ray.camera = camera, fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    for (const [name, a] of Object.entries(T.cast)) {
      if (!a.A.root.visible) continue; const hb = a.A.bones.head; if (!hb) continue; const hp = hb.getWorldPosition(new THREE.Vector3()); if (!fr.containsPoint(hp)) continue;
      const d = hp.distanceTo(camera.position); ray.set(camera.position, hp.clone().sub(camera.position).normalize()); ray.far = d - .15;
      const mine = o => { for (let q = o; q; q = q.parent) if (q === a.A.root) return true; return false; };
      const hit = ray.intersectObjects(scene.children, true).find(x => x.object.visible && !x.object.isSprite && !x.object.isLine && (x.object.material && !x.object.material.transparent) && !mine(x.object));
      if (hit) { let o = hit.object, own = null; for (let q = o; q; q = q.parent) for (const [n2, b] of Object.entries(T.cast)) if (b.A.root === q) own = n2; res.push(`${name} head blocked by ${own ? 'cast:' + own : (o.name || o.geometry.type)} at ${hit.distance.toFixed(2)}m (head ${d.toFixed(2)}m)`); }
    }
    return res;
  });
  await page.screenshot({ path: `${out}/t_${String(i).padStart(2, '0')}.png`, timeout: 240000 });
  console.log(`${t}s` + (occ.length ? '  ' + occ.join('; ') : '  clear'));
}
await browser.close();
execFileSync('python3', ['-c', `
from PIL import Image, ImageDraw
import json,sys
ts=json.loads(sys.argv[1]); o=sys.argv[2]; n=len(ts); cols=min(9,n); W,H=216,384
c=Image.new('RGB',(W*cols,(H+20)*((n+cols-1)//cols)),'white'); d=ImageDraw.Draw(c)
for i,t in enumerate(ts):
  im=Image.open(f'{o}/t_{i:02d}.png').convert('RGB').resize((W,H)); x=(i%cols)*W; y=(i//cols)*(H+20); c.paste(im,(x,y+20)); d.text((x+4,y+4),f'{t}s',fill='black')
c.save(f'{o}/sheet.jpg',quality=88)`, JSON.stringify(ts), out]);
