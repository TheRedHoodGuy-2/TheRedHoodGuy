// node tools/fitcheck.mjs [ids...]   -> library/fitcheck.jsonl (one line per garment; resumable)
import { openPage, load } from './lib/browser.mjs';
import fs from 'fs';
const F = 'library/fitcheck.jsonl', done = new Set(fs.existsSync(F) ? fs.readFileSync(F, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l).id) : []);
const MAX = process.argv.includes('--max') ? +process.argv[process.argv.indexOf('--max') + 1] : 1e9;   // restart the browser every MAX items (it slows down as garments pile up)
let ids = process.argv.slice(2).filter(a => /^\d+$/.test(a) && !process.argv[process.argv.indexOf(a) - 1]?.startsWith('--')).map(Number);
const L = JSON.parse(fs.readFileSync('library/r6_3d.json')), bottoms = new Set(Object.entries(L).filter(([k]) => k.startsWith('bottom')).flatMap(([, v]) => v.map(([id]) => id)));
if (!ids.length) ids = Object.values(L).flatMap(v => v.map(([id]) => id));
ids = [...new Set(ids)].filter(i => !done.has(i)).slice(0, MAX);
const { browser, page } = await openPage({ width: 200, height: 200 }); await load(page, 'fitcheck.html');
if (!fs.existsSync('library/fitcheck_bare.json')) fs.writeFileSync('library/fitcheck_bare.json', JSON.stringify(await page.evaluate(() => window.BARE)));
let n = 0; for (const id of ids) {
  try { const r = await Promise.race([page.evaluate(([i, b]) => window.best(i, b), [id, bottoms.has(id)]), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 120000))]); fs.appendFileSync(F, JSON.stringify({ id, ...r }) + '\n'); }
  catch (e) { fs.appendFileSync(F, JSON.stringify({ id, error: String(e).slice(0, 120) }) + '\n'); }
  if (++n % 50 === 0) console.log(n, '/', ids.length);
}
await browser.close(); console.log('done', n);
// write the height fixes the engine reads
const fit = {}; for (const l of fs.readFileSync(F, 'utf8').trim().split('\n')) { const r = JSON.parse(l); if (r.dy) fit[r.id] = { dy: r.dy }; } fs.writeFileSync('library/fit.json', JSON.stringify(fit));
