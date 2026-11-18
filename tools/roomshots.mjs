// node tools/roomshots.mjs <house> <floor> [outdir]  -> one still per room of that floor (out/rooms/<house>_<room>.jpg)
import { openPage, load } from './lib/browser.mjs';
import fs from 'fs';
const [house = 'A', floor = 'ground', dir = 'out/rooms'] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const { browser, page } = await openPage({ width: 960, height: 540 }); const t = Date.now();
await load(page, `roomshots.html?spec=${encodeURIComponent(JSON.stringify({ house, floor }))}`);
const { shots, report } = await page.evaluate(() => ({ shots: window.shots, report: window.report }));
for (const [id, d] of shots) fs.writeFileSync(`${dir}/${house}_${floor}_${id}.jpg`, Buffer.from(d.split(',')[1], 'base64'));
console.log(house, floor, shots.length, 'rooms', ((Date.now() - t) / 1000).toFixed(0) + 's', 'report:', JSON.stringify(report)); await browser.close();
