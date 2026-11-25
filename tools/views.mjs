// node tools/views.mjs <scene> <out.jpg> '<json list of views {camP, camL, fov, look, t}>' [w h]
// One page load, one still per view (the scene reads globalThis.VIEW in update), tiled into one sheet.
import { openPage, load } from './lib/browser.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const [scene, out, js, W = 270, Hh = 480] = process.argv.slice(2), V = JSON.parse(js);
const { browser, page } = await openPage({ width: +W, height: +Hh });
await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify({ scene, w: +W, h: +Hh, opts: V[0] }))}`);
const dir = '/tmp/views'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
for (const [i, v] of V.entries()) { const d = await page.evaluate(v => { globalThis.VIEW = v; return window.renderFrame(v.t ?? 0); }, v); fs.writeFileSync(`${dir}/${String(i).padStart(2, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
await browser.close();
execSync(`python3 -c "
from PIL import Image; import os
fs=sorted(os.listdir('${dir}')); ims=[Image.open('${dir}/'+f) for f in fs]; w,h=ims[0].size; C=min(len(ims),6); R=(len(ims)+C-1)//C
s=Image.new('RGB',(C*w,R*h))
for k,i in enumerate(ims): s.paste(i,((k%C)*w,(k//C)*h))
s.save('${out}',quality=88)"`);
console.log('wrote', out);
