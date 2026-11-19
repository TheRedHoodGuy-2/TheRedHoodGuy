// node tools/render.mjs <topic> [--draft | --review] [--to seconds]   --review: 10 fps, 270x480, low graphics (lq=1) -> out/<topic>_review.mp4, for Xavier's REVIEW GATE   -> out/<topic>.mp4  (resumable: existing frames are skipped)
import fs from 'fs'; import { execFileSync } from 'child_process'; import { openPage, load, ROOT } from './lib/browser.mjs';
const topic = process.argv[2], review = process.argv.includes('--review'), draft = review || process.argv.includes('--draft'), tag = review ? '_review' : '_draft', arg = k => { const i = process.argv.indexOf(k); return i > 0 ? parseFloat(process.argv[i + 1]) : null; };
const TO = arg('--to');   // render only the first N seconds (tests)
const dir = `${ROOT}/topics/${topic}`, frames = `${dir}/frames${draft ? tag : ''}`; fs.mkdirSync(frames, { recursive: true }); fs.mkdirSync(`${ROOT}/out`, { recursive: true });
const fps = arg('--fps') ?? (draft ? 10 : 24);   // draft: 10 fps at 360x640 (fast preview); final 24 fps 1080x1920   // 24 fps: the animation standard (60 reads CG-smooth), and 20% fewer frames than 30
// FINAL = high quality (Xavier 2026-10-22: 'the prev vids looked low qual'): 540x960 page at dsf 3 = 1620x2880 PNG frames
// (MSAA x4 in the AO composer), downscaled with lanczos to 1440x2560 (supersampled), crf 16. ~2.3x the old 1080p time.
const { browser, page } = await openPage(review ? { width: 270, height: 480, dsf: 1 } : draft ? { width: 360, height: 640, dsf: 1 } : { dsf: 3 });
await load(page, `film.html?render=1&topic=${topic}${review ? '&lq=1' : ''}`);
const DUR = Math.min(await page.evaluate(() => window.film.DUR), TO ?? 1e9), N = Math.floor(DUR * fps), t0 = Date.now();
const PART = (process.env.PART || '0/1').split('/').map(Number);   // PART=k/n: this process renders only frames i % n == k (run n of them side by side)
for (let i = 0; i <= N; i++) { if (i % PART[1] !== PART[0]) continue; const f = `${frames}/f_${String(i).padStart(5, '0')}.${draft ? 'jpg' : 'png'}`; if (fs.existsSync(f)) continue; await page.evaluate(t => window.renderAt(t), i / fps); await page.screenshot(draft ? { path: f, type: 'jpeg', quality: review ? 80 : 95, timeout: 240000 } : { path: f, type: 'png', timeout: 240000 }); if (i % 100 === 0) console.log(`${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`); }
await browser.close();
const mix = fs.existsSync(`${dir}/voice/mix.wav`) ? `${dir}/voice/mix.wav` : `${dir}/voice/voice.wav`;
const outF = `${ROOT}/out/${topic}${draft ? tag : ''}.mp4`;
if (PART[1] > 1) { console.log('part done'); process.exit(0); }
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(fps), '-i', `${frames}/f_%05d.${draft ? 'jpg' : 'png'}`, '-i', mix, ...(draft ? [] : ['-vf', 'scale=1440:2560:flags=lanczos']), '-c:v', 'libx264', '-preset', draft ? 'veryfast' : 'slow', '-crf', draft ? '18' : '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', ...(TO ? ['-t', String(DUR)] : []), '-movflags', '+faststart', outF]);
console.log('done ->', outF, ((Date.now() - t0) / 1000).toFixed(0) + 's');
