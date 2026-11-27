// node tools/popcheck.mjs <scene> <dur>: every frame at 30 fps, reports any visible actor that jumps > .9 m or appears /
// vanishes NOT on a shot cut (Xavier 2026-11-27: characters 'disappearing' for a frame before cuts). Must print nothing.
import { openPage, load } from './lib/browser.mjs';
const { browser, page } = await openPage({ width: 120, height: 200 });
await load(page, `film.html?spec=${encodeURIComponent(JSON.stringify({scene:process.argv[2]}))}`);
const r = await page.evaluate(async ([SCENE, DUR]) => { const S = window.__S, A = S.dbg.A; const M = await import('/scenes/' + SCENE + '.js'); const cuts = M.SHOTS.map(s => s.t);
  const out = []; let prev = {};
  for (let f = 0; f < DUR * 30; f++) { const t = f / 30; S.update(t);
    for (const [n, a] of Object.entries(A)) { const v = a.a.root.visible, p = a.a.root.position.clone(), q = prev[n];
      if (q && q.v && v && p.distanceTo(q.p) > .9) { const nearCut = cuts.some(c => c > t - 1 / 30 - .001 && c <= t + .001); if (!nearCut) out.push(`${n} jump ${q.p.distanceTo(p).toFixed(1)}m at ${t.toFixed(2)}`); }
      if (q && q.v !== v) { const nearCut = cuts.some(c => c > t - 1 / 30 - .001 && c <= t + .001); if (!nearCut) out.push(`${n} ${v ? 'appears' : 'vanishes'} at ${t.toFixed(2)}`); }
      prev[n] = { v, p }; } }
  return out; }, [process.argv[2], +process.argv[3]]);
console.log(r.join('\n')); await browser.close();
