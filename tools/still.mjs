// node tools/still.mjs '<spec json>' out.png   -> one graded still from film.html
import { openPage, load } from './lib/browser.mjs';
const spec = JSON.parse(process.argv[2]), out = process.argv[3];
const { browser, page } = await openPage({ width: spec.w || 540, height: spec.h || 960 });
const t = Date.now(); await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify(spec))}`);
await page.screenshot({ path: out, timeout: 240000 }); await browser.close(); console.log('wrote', out, ((Date.now() - t) / 1000).toFixed(1) + 's');
