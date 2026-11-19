"""python3 tools/stylesheet.py s1 [s2 ...]  -> docs/sheets/facestyles/<id>.jpg
One sheet per face style (engine/facestyles.js): the catalogue face(s) next to our drawing of it, then every expression
in the same style. Heads are the plain grey R6 head, front-on, so they compare 1:1 with the Roblox thumbnails."""
import json, os, sys, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
DF = 'research/dynfaces'; IDS = json.load(open(f'{DF}/ids.json'))
META = json.loads(subprocess.run(['node', '-e', "import('./engine/facestyles.js').then(m=>console.log(JSON.stringify({s:Object.fromEntries(Object.entries(m.STYLES).map(([k,v])=>[k,{name:v.name,sex:v.sex,ref:v.ref,own:v.own.length}])),e:m.EMO_ORDER})))"], capture_output=True, text=True).stdout)
B = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 19); T = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 28)
TILE = 300
def crop_head(im, bg=None):
    a = np.array(im.convert('RGBA')).astype(int)
    if bg is None: m = a[..., 3] > 40
    else: m = np.abs(a[..., :3] - np.array(bg)).sum(-1) > 24
    rows = np.where(m.any(1))[0]; top = rows.min(); w = m.sum(1)
    hw = int(np.median(w[top + 20:top + 60])) if bg is not None else w.max(); bot = top
    for y in range(top, im.height):
        if y > top + 30 and (w[y] > hw * 1.15 or w[y] < hw * .55): break
        bot = y
    cols = np.where(m[top:bot + 1].any(0))[0]; L, R = cols.min(), cols.max(); cx, cy = (L + R) / 2, (top + bot) / 2; s = max(R - L, bot - top) * 1.1 / 2
    return im.convert('RGB').crop((int(cx - s), int(cy - s), int(cx + s), int(cy + s))).resize((TILE, TILE), Image.LANCZOS)
def ref_tile(n):
    im = Image.open(f'{DF}/img/{IDS[n - 1]}.png').convert('RGBA'); bg = Image.new('RGBA', im.size, '#d9d9d9'); bg.alpha_composite(im)
    a = np.array(im)[..., 3] > 40; w = a.sum(1); rows = np.where(a.any(1))[0]; top = rows.min(); keep = np.where(w > .85 * w.max())[0]; bot = keep.max() + int((keep.max() - top) * .04)
    cols = np.where(a[top:bot].any(0))[0]; L, R = cols.min(), cols.max(); cx, cy = (L + R) / 2, (top + bot) / 2; s = max(R - L, bot - top) * 1.1 / 2
    return bg.convert('RGB').crop((int(cx - s), int(cy - s), int(cx + s), int(cy + s))).resize((TILE, TILE), Image.LANCZOS)
def render(sid):
    st = META['s'][sid]; sex = 'f' if st['sex'] == 'f' else 'm'
    emos = [f'own:{i}' for i in range(st['own'])] + META['e']
    cells = [{'res': 1024, 'skin': '#a3a3a3', 'sex': sex, 'hair': [], 'accessories': [], 'shirt': 'assets/_test_shirt.png', 'pants': 'assets/_test_pants.png', 'yaw': 0, 'face4': {'style': sid, 'emo': e}} for e in emos]
    C = 640; CH = round(C * 2 / .9); cols = 6; tiles = []
    for c0 in range(0, len(cells), cols):
        chunk = cells[c0:c0 + cols]
        sp = {'w': len(chunk) * C, 'h': CH, 'cols': len(chunk), 'grid': {'cw': .9, 'ch': 2.0, 'cy': 1.25, 'bg': '#d9d9d9'}, 'chars': chunk}
        png = f'/tmp/ss_{sid}_{c0}.png'; r = subprocess.run(['node', 'tools/shot.mjs', 'sheet.html', json.dumps(sp), png], capture_output=True, text=True)
        if not os.path.exists(png): print(r.stdout[-400:], r.stderr[-400:]); return
        full = Image.open(png); tiles += [crop_head(full.crop((k * C, 0, (k + 1) * C, CH)), bg=(217, 217, 217)) for k in range(len(chunk))]; os.remove(png)
    own_n = st['own']; W = 5 * TILE + 6 * 10; top_rows = (own_n * 2 + 4) // 5; exp_rows = (len(META['e']) + 4) // 5; H = 60 + (top_rows + exp_rows) * (TILE + 40) + 40
    pg = Image.new('RGB', (W, H), '#17171a'); d = ImageDraw.Draw(pg); d.text((14, 14), f'{sid}: {st["name"]}  ({ {"f": "female", "m": "male", "n": "neutral"}[st["sex"]] })', font=T, fill='#fff')
    items = []
    for i in range(own_n): items += [(ref_tile(st['ref'][i]), f'ROBLOX #{st["ref"][i]}', '#9aa4ff'), (tiles[i], 'OURS (same face)', '#6fe08a')]
    y0 = 60
    def place(lst, y):
        for k, (im, lab, col) in enumerate(lst):
            x = 10 + (k % 5) * (TILE + 10); yy = y + (k // 5) * (TILE + 40); pg.paste(im, (x, yy)); d.text((x + 4, yy + TILE + 6), lab, font=B, fill=col)
        return y + ((len(lst) + 4) // 5) * (TILE + 40)
    y = place(items, y0); d.line((10, y + 4, W - 10, y + 4), fill='#444', width=2); y = place([(tiles[own_n + i], e, '#ffffff') for i, e in enumerate(META['e'])], y + 16)
    os.makedirs('docs/sheets/facestyles', exist_ok=True); out = f'docs/sheets/facestyles/{sid}.jpg'; pg.crop((0, 0, W, y + 10)).save(out, quality=90); print(out)
if __name__ == '__main__':
    for sid in sys.argv[1:]: render(sid)
