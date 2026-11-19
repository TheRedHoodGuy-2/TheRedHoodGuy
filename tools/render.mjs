// node tools/render.mjs '<spec json>' <outdir> [--fps 24] [--dur 6]
// Streamed, resumable video render: the page loads ONCE, the probe is made once per shot, each frame is saved as a JPEG
// as soon as it is drawn (frames already on disk are skipped), then ffmpeg encodes <outdir>.mp4.
import { openPage, load } from './lib/browser.mjs';
import fs from 'fs'; import { execSync } from 'child_process';
const a = process.argv.slice(2), spec = JSON.parse(a[0]), out = a[1], opt = k => { const i = a.indexOf('--' + k); return i > 0 ? +a[i + 1] : null; };
const fps = opt('fps') || 24, dur = opt('dur') || 6, T0 = opt("t0") || 0, N = Math.round(fps * dur); fs.mkdirSync(out, { recursive: true });
const todo = [...Array(N).keys()].filter(i => !fs.existsSync(`${out}/${String(i).padStart(5, '0')}.jpg`));
if (todo.length) {
  const { browser, page } = await openPage({ width: spec.w || 540, height: spec.h || 960 }); const t0 = Date.now();
  await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify(spec))}`); console.log('page ready', ((Date.now() - t0) / 1000).toFixed(1) + 's');
  for (const i of todo) { const t1 = Date.now(); const d = await page.evaluate(t => window.renderFrame(t), T0 + i / fps);
    fs.writeFileSync(`${out}/${String(i).padStart(5, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')); if (i % 12 === 0) console.log('frame', i, '/', N, ((Date.now() - t1) / 1000).toFixed(1) + 's'); }
  await browser.close();
}
execSync(`ffmpeg -v error -y -framerate ${fps} -i ${out}/%05d.jpg -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p ${out}.tmp.mp4 && mv ${out}.tmp.mp4 ${out}.mp4`);
console.log('wrote', out + '.mp4');
