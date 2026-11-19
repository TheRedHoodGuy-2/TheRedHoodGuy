"""python3 tools/facesheet.py <kind> [out.jpg]   kind = classic | drawn | drawn_big
Head-and-shoulders sheets of faces on our R6 (sheet.html grid mode), labelled.
  classic   : real Roblox classic face decals (assets/faces/classic, downloaded from Roblox) on a guy and a girl from the bank
  drawn     : face kit v2 (engine/faces2.js), every emotion, male row + female row"""
import json, os, sys, subprocess
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = {c['id']: c for c in json.load(open(f'{ROOT}/library/characters.json'))}
def body(cid, **kw):
    c = B[cid]; s = {'res': 1024, 'skin': c['skin'], 'sex': c['sex'], 'hair': c['hair'], 'accessories': [a for a in c['accessories'] if a not in (11884330, 4197739997, 301820310)],
         'shirt': c.get('shirtTex') or f'assets/roblox/{c["shirt"]}/texture.png', 'pants': c.get('pantsTex') or f'assets/roblox/{c["pants"]}/texture.png', 'yaw': 14}
    if c.get('hairTint'): s['hairTint'] = c['hairTint']
    s.update(kw); return s
def render(cells, out, cols=6, cw=300, chh=330, title=''):
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17); T = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
    rows = (len(cells) + cols - 1) // cols
    # render tall cells (a whole body each, so nothing spills into the row below), then crop the head and shoulders
    CH = 2.0; rh = round(cw * CH / .8)
    sp = {'w': cols * cw, 'h': rows * rh, 'cols': cols, 'grid': {'cw': .8, 'ch': CH, 'cy': 1.25, 'bg': '#e6ebf0'}, 'chars': [c for _, c in cells]}
    png = '/tmp/facesheet.png'; r = subprocess.run(['node', 'tools/shot.mjs', 'sheet.html', json.dumps(sp), png], cwd=ROOT, capture_output=True, text=True)
    if not os.path.exists(png): print(r.stdout[-500:], r.stderr[-500:]); return
    full = Image.open(png).convert('RGB'); y0 = round((CH / 2 - (1.98 - 1.25)) / CH * rh); im = Image.new('RGB', (full.width, rows * chh), '#e6ebf0')
    for r in range(rows): im.paste(full.crop((0, r * rh + y0, full.width, r * rh + y0 + chh - 30)), (0, r * chh))
    top = 50 if title else 0; pg = Image.new('RGB', (im.width, im.height + top), 'white'); pg.paste(im, (0, top)); d = ImageDraw.Draw(pg)
    if title: d.text((14, 10), title, fill='black', font=T)
    for k, (lab, _) in enumerate(cells):
        x = (k % cols) * cw; y = top + (k // cols) * chh; d.rectangle([x, y + chh - 30, x + cw, y + chh], fill='white'); d.rectangle([x, y, x + cw - 1, y + chh - 1], outline='#c9d0d8'); d.text((x + 8, y + chh - 26), lab, fill='black', font=F)
    pg.save(out, quality=90); os.remove(png); print(out)
if __name__ == '__main__':
    kind = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else f'{ROOT}/docs/sheets/faces_{kind}.jpg'
    if kind == 'classic':
        idx = json.load(open(f'{ROOT}/assets/faces/classic/index.json')); names = list(idx)
        cells = [(n, body('m005' if i % 2 == 0 else 'f002', faceImg=idx[n]['file'])) for i, n in enumerate(names)]
        render(cells, out, cols=6, title='1. FLAT DECAL FACES: real Roblox classic faces (downloaded from Roblox), on our R6')
    elif kind == 'drawn':
        emos = ['neutral', 'happy', 'laugh', 'sad', 'angry', 'scared', 'shocked', 'smug', 'bored', 'confused', 'disgusted', 'crying']
        cells = [(f'{e}', body('m005', face2=e)) for e in emos] + [(f'{e}', body('f002', face2=e)) for e in emos]
        render(cells, out, cols=6, title='3. OUR DRAWN FACE KIT v2: one male + one female design, 12 emotions each (same face, only parts change)')
