"""python3 tools/facefit.py s1 s2 ...  : measure our 'own' face against the Roblox thumbnail, feature by feature.
Prints the screen-right eye box and the mouth box (ink only) for the reference and for ours, in tile pixels (300 = head
box x1.1), plus the correction in style units (1 tile px ~ 3.97 y-units, ~3.82 x-units near the centre)."""
import json, os, sys, subprocess
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import stylesheet as SS
ROOT = SS.ROOT
def boxes(tile, ink):
    lab, n = ndimage.label(ndimage.binary_closing(ink, iterations=2)); out = []
    for i, sl in enumerate(ndimage.find_objects(lab)):
        sz = (lab[sl] == i + 1).sum()
        if sz < 25: continue
        out.append(dict(x0=sl[1].start, x1=sl[1].stop, y0=sl[0].start, y1=sl[0].stop, sz=int(sz), cx=(sl[1].start + sl[1].stop) / 2, cy=(sl[0].start + sl[0].stop) / 2))
    return out
def feats(bx):
    R = [b for b in bx if b['cx'] > 160 and b['cy'] < 230]; R.sort(key=lambda b: -b['sz'])
    eye = R[0] if R else None
    M = [b for b in bx if abs(b['cx'] - 150) < 70 and eye and b['cy'] > eye['y1'] and b['y1'] < 278]; M.sort(key=lambda b: -b['sz'])
    return eye, (M[0] if M else None)
def ink_ref(t):
    a = np.array(t).astype(int); lum = a.mean(-1); return lum < 125
def ink_ours(t, blank):
    a = np.array(t).astype(int); b = np.array(blank).astype(int); return (np.abs(a - b).sum(-1) > 60) & (a.mean(-1) < 125)
def run(sids):
    cells = [{'res': 1024, 'skin': '#a3a3a3', 'sex': 'm', 'hair': [], 'accessories': [], 'shirt': 'assets/_test_shirt.png', 'pants': 'assets/_test_pants.png', 'yaw': 0, 'face': False}]
    for s in sids: cells.append({**cells[0], 'face': None, 'sex': 'f' if SS.META['s'][s]['sex'] == 'f' else 'm', 'face4': {'style': s, 'emo': 'own:0'}})
    C = 640; CH = round(C * 2 / .9); tiles = []
    for c0 in range(0, len(cells), 6):
        ch = cells[c0:c0 + 6]; sp = {'w': len(ch) * C, 'h': CH, 'cols': len(ch), 'grid': {'cw': .9, 'ch': 2.0, 'cy': 1.25, 'bg': '#d9d9d9'}, 'chars': ch}
        subprocess.run(['node', 'tools/shot.mjs', 'sheet.html', json.dumps(sp), '/tmp/ff.png'], capture_output=True, cwd=ROOT)
        full = Image.open('/tmp/ff.png'); tiles += [SS.crop_head(full.crop((k * C, 0, (k + 1) * C, CH)), bg=(217, 217, 217)) for k in range(len(ch))]
    blank = tiles[0]
    for s, t in zip(sids, tiles[1:]):
        r = SS.ref_tile(SS.META['s'][s]['ref'][0]); er, mr = feats(boxes(r, ink_ref(r))); eo, mo = feats(boxes(t, ink_ours(t, blank)))
        f = lambda b: 'none' if not b else f"x{b['x0']}-{b['x1']} y{b['y0']}-{b['y1']} (w{b['x1']-b['x0']} h{b['y1']-b['y0']})"
        print(f'{s}: EYE ref {f(er)} | ours {f(eo)}')
        if er and eo: print(f"     eye: dy {(er['cy']-eo['cy'])*3.97:+.0f}  dx {(er['cx']-eo['cx'])*3.82:+.0f}  h x{(er['y1']-er['y0'])/max(1,eo['y1']-eo['y0']):.2f}  w x{(er['x1']-er['x0'])/max(1,eo['x1']-eo['x0']):.2f}")
        print(f'     MOUTH ref {f(mr)} | ours {f(mo)}')
        if mr and mo: print(f"     mouth: dy {(mr['cy']-mo['cy'])*3.97:+.0f}  dx {(mr['cx']-mo['cx'])*3.82:+.0f}  w x{(mr['x1']-mr['x0'])/max(1,mo['x1']-mo['x0']):.2f}")
        Image.fromarray(np.hstack([np.array(r), np.array(t)])).save(f'/tmp/fit_{s}.png')
if __name__ == '__main__': run(sys.argv[1:])
