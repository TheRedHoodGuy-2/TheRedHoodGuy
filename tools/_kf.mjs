import { openPage, load } from './lib/browser.mjs';
import fs from 'fs';
const { browser, page } = await openPage({ width: 270, height: 480 });
await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify({ scene: 'camera_demo', w: 270, h: 480, probeAt: [7.5, 1.5, 3.5], wait: 4000 }))}`);
console.log(JSON.stringify(await page.evaluate(() => window.demoInfo)));
for (const t of [0, 1.8, 3.4, 3.6, 4.8, 6.0, 6.95, 7.9]) { const d = await page.evaluate(t => window.renderFrame(t), t); fs.writeFileSync(`/tmp/kf_${t}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
await browser.close();
