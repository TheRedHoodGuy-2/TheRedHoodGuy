# python3 tools/gallery.py <spec.json> <outdir>
# spec = { "title": str, "intro": str, "sections": [ { "name": str, "mode": "hair"|"shirt"|"pants"|"tshirt"|"acc", "items": [[id, name, note], ...] } ] }
# Renders every item on our base body, 48 per sheet (8 x 6), labels each cell with its number, catalog id and name,
# and writes index.html with all sections. Sheets that already exist are skipped (delete the folder to redo).
import json, os, sys, subprocess, html
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); spec = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 13); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
SKIN = '#e6b48c'; NEUTRAL_SHIRT = 'assets/clothing/plain_white_shirt.png'; NEUTRAL_PANTS = 'assets/clothing/plain_grey_pants.png'
def char(mode, i, sex):
    c = {'res': 256, 'skin': SKIN, 'face': False, 'yaw': 28, 'sex': sex}
    if mode == 'hair': c.update(hair=[i], res=64)
    elif mode == 'shirt': c.update(shirt=f'assets/roblox/{i}/texture.png', pants=NEUTRAL_PANTS)
    elif mode == 'pants': c.update(pants=f'assets/roblox/{i}/texture.png')   # no shirt: it would cover the pants' waistband and tops of dresses
    elif mode == 'tshirt': c.update(tshirt=f'assets/roblox/{i}/texture.png', shirt=NEUTRAL_SHIRT, pants=NEUTRAL_PANTS)
    else: c.update(accessories=[i], shirt=NEUTRAL_SHIRT, pants=NEUTRAL_PANTS, yaw=200 if mode == 'acc_back' else 28)
    return c
GRID = {'hair': {'cw': 1.0, 'ch': 1.35, 'cy': 1.38, 'headOnly': True}, 'acc': {'cw': 1.9, 'ch': 2.45, 'cy': .88}, 'acc_back': {'cw': 1.9, 'ch': 2.45, 'cy': .88}}
body = []; cols, cw, chh, per = 8, 200, 270, 48; n_all = 0
for sec in spec['sections']:
    mode = sec['mode']; items = sec['items']; tag = ''.join(ch for ch in sec['name'].lower() if ch.isalnum())
    g = dict(GRID.get(mode, {'cw': 1.9, 'ch': 2.45, 'cy': .88}), bg='#e4e9ef'); sheets = []
    for s in range(0, len(items), per):
        page = items[s:s + per]; name = f'{tag}_{s // per + 1:03d}.jpg'; sheets.append((name, s, len(page)))
        if os.path.exists(f'{out}/{name}'): continue
        sp = {'w': cols * cw, 'h': ((len(page) + cols - 1) // cols) * chh, 'cols': cols, 'grid': g, 'chars': [char(mode, it[0], sec.get('sex', 'm')) for it in page]}
        png = f'/tmp/gal_{tag}_{s}.png'
        r = subprocess.run(['node', 'tools/shot.mjs', 'sheet.html', json.dumps(sp), png], cwd=ROOT, capture_output=True, text=True)
        if not os.path.exists(png): print('FAIL', name, (r.stdout + r.stderr)[-300:], flush=True); continue
        im = Image.open(png).convert('RGB'); d = ImageDraw.Draw(im)
        for k, it in enumerate(page):
            x = (k % cols) * cw; y = (k // cols) * chh; d.rectangle([x, y + chh - 34, x + cw, y + chh], fill='white'); d.rectangle([x, y, x + cw - 1, y + chh - 1], outline='#c9d0d8')
            d.text((x + 5, y + chh - 32), f'{s + k + 1}  {it[0]}', fill='black', font=F); d.text((x + 5, y + chh - 16), (it[2] if len(it) > 2 and it[2] else it[1])[:30], fill=(110, 40, 40), font=f2)
        im.save(f'{out}/{name}', quality=82); os.remove(png); print(name, flush=True)
    n_all += len(items)
    body.append(f'<h2 id="{tag}">{html.escape(sec["name"])}: {len(items)}</h2>' + ''.join(f'<h3>{html.escape(sec["name"])} {s + 1} to {s + n}</h3><img src="{nm}" loading="lazy" alt="">' for nm, s, n in sheets))
nav = ' · '.join(f'<a href="#{"".join(ch for ch in s["name"].lower() if ch.isalnum())}">{html.escape(s["name"])} ({len(s["items"])})</a>' for s in spec['sections'])
open(f'{out}/index.html', 'w').write(f'''<!doctype html><meta charset="utf-8"><title>{html.escape(spec["title"])}</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{{font:15px system-ui,sans-serif;margin:0 auto;max-width:1640px;padding:16px;background:#f4f6f8;color:#1c2128}}img{{width:100%;height:auto;display:block;border:1px solid #d5dbe1;background:#fff}}h1{{margin:4px 0}}h2{{margin:36px 0 6px;font-size:22px}}h3{{font-size:14px;margin:18px 0 6px;color:#566}}a{{color:#0b5cad}}</style>
<h1>{html.escape(spec["title"])}: {n_all}</h1><p>{html.escape(spec.get("intro", ""))}</p><p>{nav}</p>{"".join(body)}''')
print('DONE', n_all)
