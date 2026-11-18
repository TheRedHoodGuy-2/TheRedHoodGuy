# Flags hairs that sit wrong on the head, from the gallery sheets: compares each cell with a bare head.
import json, os, glob, numpy as np
from PIL import Image
from scipy import ndimage
bare = np.asarray(Image.open('/tmp/bare.png').convert('RGB')).astype(int)
bg = np.array([0xe4, 0xe9, 0xef]); head = np.abs(bare - bg).sum(2) > 30
crown = np.zeros_like(head); crown[64:80, 70:130] = True; crown &= head
ring = ndimage.binary_dilation(head, iterations=7) & ~ndimage.binary_erosion(head, iterations=3)
items = [l.split('</td><td>') for l in open('out/hairs/index.html').read().split('<tr><td>')[2:]]
ids = [int(r[1]) for r in items]; res = {}
for k, i in enumerate(ids):
    sheet, n = k // 48, k % 48; im = np.asarray(Image.open(f'out/hairs/hair_{sheet + 1:03d}.jpg').convert('RGB')).astype(int)
    x, y = (n % 8) * 200, (n // 8) * 270; c = im[y:y + 236, x:x + 200]; b = bare[:236]
    ch = np.abs(c - b).sum(2) > 60; ch[:2] = ch[:, :2] = ch[:, -2:] = False
    lab, nl = ndimage.label(ch); keep = np.zeros_like(ch); loose = 0
    for L in range(1, nl + 1):
        comp = lab == L
        if (comp & ring[:236]).any() or (comp & head[:236]).any(): keep |= comp
        else: loose = max(loose, int(comp.sum()))
    total, attached = int(ch.sum()), int(keep.sum()); crownc = float((ch & crown[:236]).sum() / max(1, crown[:236].sum()))
    bad = []
    if total < 500: bad.append('hidden')
    elif attached < .6 * total: bad.append('floating')
    elif crownc < .25 and attached < 2500: bad.append('crown bare')
    elif loose > 300: bad.append('piece floating')
    res[i] = dict(n=k + 1, total=total, attached=attached, crown=round(crownc, 2), bad=bad)
json.dump(res, open('assets/hair_qa.json', 'w'), indent=0)
from collections import Counter; print(len(res), Counter(b for r in res.values() for b in r['bad']), sum(1 for r in res.values() if r['bad']))
