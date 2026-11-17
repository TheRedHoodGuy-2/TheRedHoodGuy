// node tools/haircheck.mjs ids.txt out.json  -> head-space bounds of every hair, 50 per page load
import { openPage, load } from './lib/browser.mjs'; import fs from 'fs';
const ids = fs.readFileSync(process.argv[2], 'utf8').split(/\s+/).filter(Boolean).map(Number), out = [];
for (let i = 0; i < ids.length; i += 50) {
  const { browser, page } = await openPage({ width: 64, height: 64 }); await load(page, 'haircheck.html');
  out.push(...await page.evaluate(x => window.check(x), ids.slice(i, i + 50))); await browser.close();
  fs.writeFileSync(process.argv[3], JSON.stringify(out)); console.log(out.length, 'of', ids.length);
}
