// node tools/_probe.mjs '<film spec>' '<js expression run in the page with __dbg>'
import { openPage, load } from './lib/browser.mjs';
const { browser, page } = await openPage({ width: 320, height: 240 });
await load(page, `${process.env.PAGE || "film.html"}?spec=${encodeURIComponent(process.argv[2])}`);
console.log(JSON.stringify(await page.evaluate(process.argv[3]), null, 0)); await browser.close();
