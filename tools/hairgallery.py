# python3 tools/hairgallery.py <outdir>  -> every converted hair worn on the base head, 48 per sheet (8 x 6), each cell
# labelled with its catalog id and name, plus index.html showing all sheets in order (most favourited first).
import json, os, sys, subprocess, glob, html
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); out = sys.argv[1]; os.makedirs(out, exist_ok=True)
idx = {x['id']: x for x in json.load(open('/home/claude/hair/index.json'))}
items = []
for p in glob.glob(ROOT + '/assets/roblox/*/meta.json'):
    m = json.load(open(p)); i = int(m['id'])
    if m.get('parts') and (i in idx or m.get('assetTypeId') == 41): items.append((i, (idx.get(i) or {}).get('name') or m.get('name') or '', (idx.get(i) or {}).get('fav') or 0))
items.sort(key=lambda x: -x[2])
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
cols, rows, cw, chh, per = 8, 6, 200, 270, 48; sheets = []
for s in range(0, len(items), per):
    page = items[s:s + per]; name = f'hair_{s // per + 1:03d}.jpg'; sheets.append((name, page))
    if os.path.exists(f'{out}/{name}'): continue
    spec = {'w': cols * cw, 'h': ((len(page) + cols - 1) // cols) * chh, 'cols': cols, 'grid': {'cw': 1.0, 'ch': 1.35, 'cy': 1.38, 'headOnly': True, 'bg': '#e4e9ef'},
            'chars': [{'res': 64, 'skin': '#e6b48c', 'hair': [i], 'yaw': 28, 'face': False} for i, _, _ in page]}
    png = f'/tmp/hg_{s}.png'
    r = subprocess.run(['node', 'tools/shot.mjs', 'sheet.html', json.dumps(spec), png], cwd=ROOT, capture_output=True, text=True)
    if not os.path.exists(png): print('FAIL sheet', name, r.stdout[-300:], r.stderr[-300:]); continue
    im = Image.open(png).convert('RGB'); d = ImageDraw.Draw(im)
    for n, (i, nm, fav) in enumerate(page):
        x = (n % cols) * cw; y = (n // cols) * chh; d.rectangle([x, y + chh - 34, x + cw, y + chh], fill='white'); d.rectangle([x, y, x + cw - 1, y + chh - 1], outline='#c9d0d8')
        d.text((x + 5, y + chh - 32), f'{s + n + 1}  {i}', fill='black', font=F); d.text((x + 5, y + chh - 16), nm[:30], fill=(110, 40, 40), font=f2)
    im.save(f'{out}/{name}', quality=82); os.remove(png); print(name, flush=True)
rows_html = '\n'.join(f'<h2>Sheet {k + 1}: hairs {k * per + 1} to {k * per + len(pg)}</h2><img src="{n}" loading="lazy" alt="hair sheet {k + 1}">' for k, (n, pg) in enumerate(sheets))
listing = '\n'.join(f'<tr><td>{k + 1}</td><td>{i}</td><td>{html.escape(nm)}</td><td>{fav}</td></tr>' for k, (i, nm, fav) in enumerate(items))
open(f'{out}/index.html', 'w').write(f'''<!doctype html><meta charset="utf-8"><title>Hair library</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{{font:15px system-ui,sans-serif;margin:0 auto;max-width:1640px;padding:16px;background:#f4f6f8;color:#1c2128}}img{{width:100%;height:auto;display:block;border:1px solid #d5dbe1;background:#fff}}h1{{margin:4px 0}}h2{{font-size:16px;margin:28px 0 8px}}
table{{border-collapse:collapse;font-size:13px}}td{{padding:2px 10px;border-bottom:1px solid #e3e7eb}}details{{margin:12px 0}}</style>
<h1>Hair library: {len(items)} hairs</h1><p>Every hair pulled from the Roblox catalog, worn on our base head, most favourited first. Each cell: number, catalog id, name.
To pick one, send its number or id.</p><details><summary>Full list as text ({len(items)} rows)</summary><table><tr><td>No.</td><td>Id</td><td>Name</td><td>Favourites</td></tr>{listing}</table></details>
{rows_html}''')
print('SHEETS', len(sheets), 'ITEMS', len(items))
