// node tools/stills_at.mjs '<spec json>' out.jpg t1 t2 ...  -> one contact sheet of stills at those times (one page load)
import { openPage, load } from './lib/browser.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const spec = JSON.parse(process.argv[2]), out = process.argv[3], ts = process.argv.slice(4).map(Number);
const { browser, page } = await openPage({ width: spec.w || 270, height: spec.h || 480 });
await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify(spec))}`);
const dir = '/tmp/stills_at'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
for (const [i, t] of ts.entries()) { const d = await page.evaluate(t => window.renderFrame(t), t); fs.writeFileSync(`${dir}/${String(i).padStart(3, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
await browser.close();
const cols = Math.min(ts.length, 8);
execSync(`python3 -c "
from PIL import Image, ImageDraw; import os
fs=sorted(os.listdir('${dir}')); ts=${JSON.stringify(ts)}; im0=Image.open('${dir}/'+fs[0]); w,h=im0.size; C=${cols}; R=(len(fs)+C-1)//C
s=Image.new('RGB',(C*w,R*h)); d=ImageDraw.Draw(s)
for k,f in enumerate(fs): s.paste(Image.open('${dir}/'+f),((k%C)*w,(k//C)*h)); d.text(((k%C)*w+3,(k//C)*h+3),str(ts[k]),fill='yellow')
s.save('${out}',quality=85)"`);
console.log('wrote', out);
