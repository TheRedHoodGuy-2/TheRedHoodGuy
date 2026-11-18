import { openPage, load } from './lib/browser.mjs';
const { browser, page } = await openPage({ width: 540, height: 960 });
await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify({ scene: 'place_test', post: JSON.parse(process.argv[2] || '{}'), opts: JSON.parse(process.argv[3] || '{}') }))}`);
console.log(JSON.stringify(await page.evaluate(() => window.placeReport))); await page.screenshot({ path: '/tmp/pt1.png' }); await browser.close();
