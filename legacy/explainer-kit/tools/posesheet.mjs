// node tools/posesheet.mjs <topic> <out.png> ['&only=1,2&cols=3']   -> renders tools/posesheet.html (the POSE GATE sheet) to a png
import { openPage } from './lib/browser.mjs';
const [topic, out, qs = ''] = process.argv.slice(2);
const { browser, page } = await openPage({ width: 1800, height: 1500, dsf: 1 }); page.on('pageerror', e => console.log('ERR', e.message));
await page.goto(`http://local/tools/posesheet.html?topic=${topic}${qs}`); await page.waitForFunction(() => window.READY === true, null, { timeout: 240000 });
const box = await page.evaluate(() => { const c = document.querySelector('canvas'); return { x: 0, y: 0, width: c.clientWidth, height: c.clientHeight }; }); await page.screenshot({ path: out, clip: box, timeout: 240000 }); await browser.close(); console.log('wrote', out);
