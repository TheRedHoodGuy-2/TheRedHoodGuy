// node tools/timing.mjs '<spec json>'  -> per-stage ms of a scene (spec.time = frames to average)
import { openPage, load } from './lib/browser.mjs';
const spec = JSON.parse(process.argv[2]); spec.time = spec.time || 3;
const { browser, page } = await openPage({ width: spec.w || 540, height: spec.h || 960 });
const t = Date.now(); await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify(spec))}`);
console.log(JSON.stringify(await page.evaluate(() => ({ ...window.timing, pageLoad_ms: Math.round(window.tLoad) }))), 'wall', ((Date.now() - t) / 1000).toFixed(1) + 's');
await browser.close();
