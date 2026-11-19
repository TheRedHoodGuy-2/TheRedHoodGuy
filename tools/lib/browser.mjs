// Headless Chromium (software WebGL) serving the repo at http://local/
import { chromium } from 'playwright';
import fs from 'fs'; import path from 'path'; import url from 'url';
export const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '../..');
const CT = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.html': 'text/html', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg', '.hdr': 'application/octet-stream', '.exr': 'application/octet-stream', '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.mp3': 'audio/mpeg' };
function chromePath() { const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers'; try { const d = fs.readdirSync(base).filter(x => /^chromium-\d+$/.test(x)).sort().pop(); for (const s of ['chrome-linux/chrome', 'chrome-linux64/chrome']) { const p = path.join(base, d, s); if (fs.existsSync(p)) return p; } } catch (e) { } return undefined; }
export async function openPage({ width = 540, height = 960, dsf = 1 } = {}) {
  const browser = await chromium.launch({ executablePath: chromePath(), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dsf });
  page.on('pageerror', e => console.log('PAGEERR', e.message, (e.stack || '').split('\n').slice(1, 4).join(' | ')));
  page.on('console', m => { if (m.type() === 'error' && !m.text().includes('ERR_FAILED')) console.log('CONSOLE', m.text()); });
  await page.route('**/*', r => {
    const u = r.request().url();
    const m = u.match(/three@0\.170\.0\/(build|examples)\/(.*)$/); if (m) return r.fulfill({ path: path.join(ROOT, 'node_modules/three', m[1], m[2]), contentType: 'text/javascript' });
    if (u.startsWith('http://local/')) { const f = path.join(ROOT, decodeURIComponent(u.slice(13).split('?')[0])); if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: '' }); return r.fulfill({ path: f, contentType: CT[path.extname(f)] || 'application/octet-stream' }); }
    return r.abort();
  });
  return { browser, page };
}
export async function load(page, rel) { await page.goto('http://local/' + rel); await page.waitForFunction(() => window.ready === true, null, { timeout: 180000 }); }
