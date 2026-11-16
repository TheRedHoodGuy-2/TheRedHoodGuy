# python3 tools/hairsheet.py <out_prefix> [ids...]   -> labelled sheets of every converted catalog item worn on a head
import json, os, sys, subprocess, glob
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); out = sys.argv[1]
ids = sys.argv[2:] or sorted(os.path.basename(os.path.dirname(p)) for p in glob.glob(ROOT + '/assets/roblox/*/meta.json'))
items = []
for i in ids:
    m = json.load(open(f'{ROOT}/assets/roblox/{i}/meta.json'))
    if m.get('parts'): items.append((i, m.get('name') or ''))
cols, rows, cw, chh = 8, 4, 190, 190
for p in range(0, len(items), cols * rows):
    page = items[p:p + cols * rows]; yaw = 28
    spec = {'w': cols * cw, 'h': ((len(page) + cols - 1) // cols) * chh, 'cols': cols, 'grid': {'cw': 1.0, 'ch': 1.0, 'cy': 1.56, 'headOnly': True}, 'chars': [{'res': 64, 'skin': '#e6b48c', 'hair': [int(i)], 'yaw': yaw, 'face': 'neutral'} for i, _ in page]}
    png = f'{out}_{p // (cols * rows)}.png'
    subprocess.run(['node', 'tools/shot.mjs', 'sheet.html', json.dumps(spec), png], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)
    im = Image.open(png).convert('RGB'); d = ImageDraw.Draw(im)
    for n, (i, name) in enumerate(page):
        x = (n % cols) * cw; y = (n // cols) * chh; d.rectangle([x, y + chh - 26, x + cw, y + chh], fill='white'); d.text((x + 3, y + chh - 25), str(i), fill='black'); d.text((x + 3, y + chh - 13), name[:28], fill=(120, 0, 0))
    im.save(png.replace('.png', '.jpg'), quality=85); os.remove(png); print(png.replace('.png', '.jpg'))
