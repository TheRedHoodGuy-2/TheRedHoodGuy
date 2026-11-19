#!/usr/bin/env python3
"""Split AltiWyre full-face decals into an EYES layer and a MOUTH layer (cut at the widest empty band between them).
python3 tools/altisplit.py <index json> <pack index> ...  -> assets/faces/packs/alti_split/<file>_e.png / _m.png"""
import sys, json, numpy as np
from PIL import Image
idx = json.load(open(sys.argv[1]))
for s in sys.argv[2:]:
    f = idx[int(s)]; im = Image.open('assets/faces/packs/alti/' + f).convert('RGBA'); a = np.asarray(im)
    rows = (a[..., 3] > 20).sum(1); H = len(rows); best, cut = 0, None; y = int(H * .38)
    while y < int(H * .8):
        if rows[y] == 0:
            y0 = y
            while y < H and rows[y] == 0: y += 1
            if y < H and rows[y:].sum() > 0 and y - y0 > best: best, cut = y - y0, (y0 + y) // 2
        y += 1
    if cut is None: print(s, f, 'no gap'); continue
    e = a.copy(); e[cut:, :, 3] = 0; m = a.copy(); m[:cut, :, 3] = 0
    b = f[:-4]; Image.fromarray(e).save(f'assets/faces/packs/alti_split/{b}_e.png'); Image.fromarray(m).save(f'assets/faces/packs/alti_split/{b}_m.png')
    print(s, f, 'cut', cut, 'gap', best)
