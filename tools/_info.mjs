import { openPage, load } from '/home/claude/theredhoodguy/tools/lib/browser.mjs';
const { browser, page } = await openPage({ width: 400, height: 300 });
for (const p of process.argv.slice(2)) { await load(page, `inspect.html?spec=${encodeURIComponent(JSON.stringify({ piece: 'school.' + p }))}`); console.log(p, JSON.stringify(await page.evaluate(() => window.info))); }
await browser.close();
