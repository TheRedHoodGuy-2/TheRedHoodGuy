// node tools/shot.mjs <page.html> '<spec json>' <out.png>   -> one screenshot of a page that sets window.ready
import { openPage, load } from './lib/browser.mjs';
const [pageRel, specJson, out] = process.argv.slice(2), spec = JSON.parse(specJson || '{}');
const { browser, page } = await openPage({ width: spec.w || 1600, height: spec.h || 900 });
await load(page, `${pageRel}?spec=${encodeURIComponent(JSON.stringify(spec))}`);
await page.screenshot({ path: out, timeout: 240000 }); await browser.close(); console.log('wrote', out);
