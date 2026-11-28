// node tools/probe.mjs '<spec json>' '<js expression using S (the scene build result), THREE, t>' t1 t2 ...  -> prints the value at each t
// (one page load; S.update(t) first). For numbers/positions without reading images.
import { openPage, load } from './lib/browser.mjs';
const spec = JSON.parse(process.argv[2]), expr = process.argv[3], ts = process.argv.slice(4).map(Number);
const { browser, page } = await openPage({ width: 90, height: 160 });
await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify(spec))}`);
for (const t of ts) console.log(t, await page.evaluate(([t, e]) => { const S = window.__S, THREE = window.__THREE; S.update(t); return JSON.stringify(eval(e)); }, [t, expr]));
await browser.close();
