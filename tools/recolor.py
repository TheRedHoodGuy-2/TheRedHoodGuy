"""python3 tools/recolor.py   -> assets/variants/<id>_<colourway>.png + library/characters.json (shirtTex / pantsTex)
COLOURWAYS (Xavier 2026-11-19: "why doesn't the other one have a red one instead of a blue one"): when the bank gives the
same garment to more than one person, the first wearer keeps the original and every other wearer gets a new colourway
of it: the garment's own colour is moved to another real clothing colour while prints, logos, stitching and shading stay.
- coloured cloth (navy jersey, red hoodie): only pixels near the main hue are turned to the new hue, so the yellow 80
  on a navy jersey stays yellow on the red one.
- black / dark cloth: lifted into a dark colour (navy, forest, maroon, charcoal, brown); prints stay.
- white / light cloth: tinted to a light colour (sky, cream, sage, blush); prints stay.
- trousers: only patterned or coloured trousers are varied (black trousers on many people is just real life);
  jeans change wash (light / mid / dark).
Deterministic. Look at every variant before use (tools/recolor.py --sheet renders original vs variants)."""
import json, os, sys, colorsys, random, re
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
OUT = f'{ROOT}/assets/variants'; os.makedirs(OUT, exist_ok=True)
TORSO = (231, 74, 128, 128); LEGF = (217, 355, 64, 128)
# hue, max saturation, max brightness: real dyed cloth, never neon (a yellow jersey turned green came out highlighter green)
CHROMA = {'red': (2, .85, .82), 'maroon': (350, .7, .45), 'orange': (24, .8, .85), 'mustard': (44, .72, .78), 'olive': (75, .5, .5),
          'green': (140, .6, .5), 'teal': (178, .6, .6), 'sky': (205, .45, .85), 'royal': (222, .75, .72), 'navy': (228, .7, .38),
          'purple': (272, .5, .5), 'pink': (330, .42, .85)}
DARK = {'navy': (31, 42, 68), 'forest': (35, 61, 44), 'maroon': (78, 28, 36), 'charcoal': (58, 61, 66), 'brown': (66, 46, 34)}
LIGHT = {'sky': (198, 220, 238), 'cream': (240, 230, 208), 'sage': (205, 222, 200), 'blush': (242, 214, 214), 'lilac': (222, 212, 238)}
def hsv(a):   # a: (..., 3) floats 0-1
    r, g, b = a[..., 0], a[..., 1], a[..., 2]; mx = a.max(-1); mn = a.min(-1); d = mx - mn + 1e-9
    h = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
    return h, np.where(mx > 0, (mx - mn) / (mx + 1e-9), 0), mx
def rgb(h, s, v):
    c = v * s; x = c * (1 - abs((h / 60) % 2 - 1)); m = v - c; z = np.zeros_like(h); i = (h // 60).astype(int) % 6
    r = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [c, x, z, z, x, c]); g = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [x, c, c, x, z, z])
    b = np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [z, z, x, c, c, x]); return np.stack([r + m, g + m, b + m], -1)
def main_colour(A, box):
    H, W = A.shape[:2]; x, y, w, h = box; q = A[y * H // 559:(y + h) * H // 559, x * W // 585:(x + w) * W // 585].reshape(-1, 4)
    q = q[q[:, 3] > 160][:, :3] / 255
    if not len(q): return None
    hh, ss, vv = hsv(q); col = ss > .22
    if col.mean() > .35: return ('chroma', float(np.median(hh[col])), float(np.median(vv)))   # coloured cloth: hue of the coloured pixels
    v = float(np.median(vv)); return ('dark' if v < .32 else 'light' if v > .7 else 'mid', None, v)
def variant(path, k, part='shirt', seed=0, denim=False):
    """k-th colourway of a template (k >= 1). Returns (png path, colourway name) or (None, None) if it should not vary"""
    im = Image.open(path).convert('RGBA'); A = np.asarray(im).astype(np.float32); rgbf = A[..., :3] / 255; al = A[..., 3]
    mc = main_colour(A, TORSO if part == 'shirt' else LEGF)
    if mc is None: return None, None
    kind, hue, v = mc; h, s, vv = hsv(rgbf); r = random.Random(f'{path}{seed}'); op = al > 10   # one order per garment: k-th wearer = k-th colour, never the same twice
    if kind == 'chroma':
        allowed = CHROMA if part == 'shirt' else {n: CHROMA[n] for n in (('sky', 'royal', 'navy') if denim else ('navy', 'olive', 'maroon', 'green', 'sky'))}   # trousers come in trouser colours; jeans only change wash
        names = [n for n, t in allowed.items() if min(abs(t[0] - hue), 360 - abs(t[0] - hue)) > (25 if denim else 55)] or list(allowed); r.shuffle(names); name = names[(k - 1) % len(names)]
        dh = ((h - hue + 180) % 360) - 180; m = op & (np.abs(dh) < 28) & (s > .15)          # only the garment's own hue
        th, smax, vmax = CHROMA[name]; vtop = max(float(np.percentile(vv[m], 90)), .05) if m.any() else 1
        nh = (th + dh) % 360; out = rgbf.copy(); out[m] = rgb(nh[m], np.minimum(s[m], smax), np.minimum(vv[m] * min(1, vmax / vtop), 1))
    else:
        pal = DARK if kind == 'dark' else LIGHT if kind == 'light' else {**{n: c for n, c in DARK.items() if n != 'charcoal'}, 'sky': (150, 175, 200)}
        names = list(pal); r.shuffle(names); name = names[(k - 1) % len(names)]
        if part == 'pants' and kind != 'chroma': return None, None                     # plain trousers stay as they are
        tc = np.array(pal[name], np.float32) / 255; th, ts, tv = hsv(tc[None])[0][0], hsv(tc[None])[1][0], hsv(tc[None])[2][0]
        # the cloth = low-saturation pixels close to the garment's brightness; prints (far brighter / darker or coloured) stay
        m = op & (s < .25) & (np.abs(vv - v) < .28)
        nv = np.clip(tv + (vv - v) * (.8 if kind == 'dark' else 1), 0, 1) if kind == 'dark' else np.clip(vv * (tv / max(v, .05)), 0, 1)   # black cloth: shift up by the colour (a ratio blew the fabric noise into glitter)
        out = rgbf.copy(); out[m] = rgb(np.full(m.sum(), th), np.full(m.sum(), ts), nv[m])
    o = np.dstack([np.clip(out, 0, 1) * 255, al]).astype(np.uint8)
    iid = os.path.basename(os.path.dirname(path)); f = f'{OUT}/{iid}_{name}.png'; Image.fromarray(o).save(f); return f, name
def jeans(path):
    return 'jean' in path.lower() or 'denim' in path.lower()
if __name__ == '__main__':
    B = json.load(open(f'{ROOT}/library/characters.json')); seen = {}; made = []
    names = {str(x[0]): x[2] for k in ('pants_m', 'pants_f') for x in json.load(open(f'{ROOT}/library/bank_ok.json'))[k]}
    for c in B:
        c.pop('shirtTex', None); c.pop('pantsTex', None); c.pop('colourway', None)
        for part in ('shirt', 'pants'):
            i = c[part]; n = seen.get((part, i), 0); seen[(part, i)] = n + 1
            if n == 0 or c['archetype'] == 'nurse': continue   # scrubs stay a matching set
            src = f'{ROOT}/assets/roblox/{i}/texture.png'; f, name = variant(src, n, part, denim=bool(re.search(r'jean|denim', names.get(str(i), ''), re.I)))
            if f: c[part + 'Tex'] = os.path.relpath(f, ROOT); c.setdefault('colourway', {})[part] = name; made.append((c['id'], part, i, name))
    json.dump(B, open(f'{ROOT}/library/characters.json', 'w'), indent=1)
    print(len(made), 'variants', sum(1 for m in made if m[1] == 'shirt'), 'tops', sum(1 for m in made if m[1] == 'pants'), 'bottoms')
