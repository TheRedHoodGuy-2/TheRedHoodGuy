"""Turn Xavier's AI face sheets into face sprites the R6 head can wear.
python3 tools/facesprites.py [style ...]   (default: every folder in assets/faces/ai/)
In:  assets/faces/ai/<style>/{A,B,C,D}.png  (4x4 grids: A = faces 1-16, B = 17-32, C = 16 mouths, D = 16 eye / brow states)
Out: assets/faces/sprites/<style>/{A01..A16,B17..B32,C01..C16,D01..D16}.png  (512 RGBA, the same square as a Roblox face
     decal, so it maps onto the head exactly like a catalogue face) + meta.json (eye / mouth split line, per-sheet fixes).
Background is keyed out by colour distance (alpha + un-premultiplied colour, so soft blush survives), the cell number in
the top-left corner is masked, C and D are shifted / scaled per SHEET so their mouths / eyes land where sheet A put them."""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); AI = f'{ROOT}/assets/faces/ai'; OUT = f'{ROOT}/assets/faces/sprites'
S = 1024   # 2026-11-19 08:41: sprites are 1024 (keyed at the sheet's own resolution, then upscaled with clean colour + sharpened alpha)
def cells(path):
    a = np.array(Image.open(path).convert('RGB')).astype(np.float32); H, W = a.shape[:2]
    white = (a.min(-1) > 236)
    def bands(frac):   # separator lines = rows / cols that are almost all white
        idx = np.where(frac > .8)[0]; groups = []
        for i in idx:
            if groups and i - groups[-1][-1] <= 2: groups[-1].append(i)
            else: groups.append([i])
        return [(g[0], g[-1]) for g in groups]
    rb, cb = bands(white.mean(1)), bands(white.mean(0))
    def spans(b, n):
        cuts = [-1] + [int((x + y) / 2) for x, y in b if 0.1 * n < (x + y) / 2 < 0.9 * n] + [n]
        sp = [(cuts[i] + 1, cuts[i + 1]) for i in range(len(cuts) - 1) if cuts[i + 1] - cuts[i] > n * .12]
        if len(sp) != 4: sp = [(round(i * n / 4), round((i + 1) * n / 4)) for i in range(4)]
        return sp
    R, C = spans(rb, H), spans(cb, W); out = []
    for (y0, y1) in R:
        for (x0, x1) in C:
            pad = 11; out.append(a[y0 + pad:y1 - pad, x0 + pad:x1 - pad])
    return out
def key(cell):
    h, w = cell.shape[:2]
    # the AI background is not perfectly flat (soft shading toward the edges): fit a smooth quadratic background from
    # every pixel that looks like background, then key against that field instead of one colour
    yy, xx = np.mgrid[0:h, 0:w] / max(h, w); A = np.stack([np.ones_like(xx), xx, yy, xx * xx, yy * yy, xx * yy], -1).reshape(-1, 6)
    flat = cell.reshape(-1, 3); med = np.median(flat, 0); ok = (np.abs(flat - med).max(-1) < 14)
    for _ in range(2):
        coef = np.linalg.lstsq(A[ok], flat[ok], rcond=None)[0]; fit = A @ coef; ok = np.abs(flat - fit).max(-1) < 8
    bgf = (A @ coef).reshape(h, w, 3); bg = np.median(flat[ok], 0)
    d = np.abs(cell - bgf).max(-1); alpha = np.clip((d - 7) / 30, 0, 1)
    rgb = bgf + (cell - bgf) / np.maximum(alpha[..., None], 1e-3); rgb = np.clip(rgb, 0, 255)
    # EYE WHITES / TEETH (2026-11-19 08:04 rework): light regions that are THICK (a real white area, not a sliver
    # between lashes) are kept whole and opaque, gaps sealed so skin never shows through a white; thin light slivers are
    # dropped (they would read as white scratches on dark skin)
    lav = (cell[..., 2] - cell[..., 1] > 6) & (cell.mean(-1) > bgf.mean(-1) - 15) & (cell.max(-1) - cell.min(-1) < 60)   # lavender lid shade
    lightm = ((cell.mean(-1) > bgf.mean(-1) + 4) & (cell.min(-1) > bgf.min(-1) + 1)) | lav
    lab, n = ndimage.label(lightm); dtl = ndimage.distance_transform_edt(lightm); inkm = (alpha > .5) & (cell.mean(-1) < bgf.mean(-1) - 40)
    Wm = np.zeros_like(lightm)
    for i, sl in enumerate(ndimage.find_objects(lab)):
        if sl is None: continue
        y0, y1, x0, x1 = max(0, sl[0].start - 4), sl[0].stop + 4, max(0, sl[1].start - 4), sl[1].stop + 4
        comp = lab[y0:y1, x0:x1] == i + 1
        if dtl[y0:y1, x0:x1][comp].max() < 3.5: continue                    # a sliver
        ring = ndimage.binary_dilation(comp, iterations=3) & ~comp
        if inkm[y0:y1, x0:x1][ring].mean() < .08: continue                   # not bounded by ink: page shading, not an eye white
        notink = cell[y0:y1, x0:x1].mean(-1) > bgf[y0:y1, x0:x1].mean(-1) - 70
        grow = comp.copy()
        for _ in range(3): grow = ndimage.binary_dilation(grow) & notink   # close the small grey chips at its edge
        Wm[y0:y1, x0:x1] |= ndimage.binary_fill_holes(grow)
    Wm = ndimage.binary_fill_holes(ndimage.binary_closing(Wm, iterations=3)) & (Wm | (cell.mean(-1) > bgf.mean(-1) - 25) | lav)
    # thin grey line art (brows, lash hairs, outlines) is drawn as grey on a grey page: make it dark ink with a matching
    # opacity so it reads as a line on ANY skin
    lum = cell.mean(-1); sat = cell.max(-1) - cell.min(-1); dark = (lum < bgf.mean(-1) - 6) & (sat < 28)
    thin = dark & ~ndimage.binary_opening(dark, iterations=2)
    ia = np.clip((bgf.mean(-1) - lum) / (bgf.mean(-1) * .55), 0, 1); alpha[thin] = ia[thin]; rgb[thin] = 22
    alpha[lightm & ~Wm & (cell.max(-1) - cell.min(-1) < 22)] = 0                                       # light slivers / halos: gone
    alpha[Wm] = 1; rgb[Wm] = cell[Wm]                             # whites: whole and opaque
    solid = alpha > .5; hole = ndimage.binary_fill_holes(solid) & ~solid    # dark-enclosed holes (lid shading in an eye)
    lh, nh = ndimage.label(hole); dth = ndimage.distance_transform_edt(hole)
    if nh: hole &= np.isin(lh, np.where(ndimage.maximum(dth, lh, range(1, nh + 1)) >= 3.5)[0] + 1)
    alpha[hole] = 1; rgb[hole] = cell[hole]
    e = max(4, int(h * .03)); alpha[: int(h * .25), : int(w * .25)] = 0; alpha[:e] = 0; alpha[-e:] = 0; alpha[:, :e] = 0; alpha[:, -e:] = 0   # separator leftovers
    # DECONTAMINATE: every semi-transparent edge pixel takes the colour of the nearest solid pixel, so no light page /
    # halo colour survives at line edges (the faint white rims Xavier saw)
    solid = alpha > .9
    if solid.any():
        _, (iy, ix) = ndimage.distance_transform_edt(~solid, return_indices=True); rgb = np.where(solid[..., None], rgb, rgb[iy, ix])
    # UPSCALE crisp: colour with Lanczos, alpha bicubic then a steep curve (edges ~1-2 px wide at 1024, no blur)
    rgbI = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8), 'RGB').resize((S, S), Image.LANCZOS)
    aU = np.array(Image.fromarray((alpha * 255).astype(np.uint8), 'L').resize((S, S), Image.BICUBIC)).astype(float) / 255
    aU = np.clip((aU - .15) / .6, 0, 1); aU = aU * aU * (3 - 2 * aU)   # smoothstep(.15, .75): crisp edges, thin lines kept whole
    return Image.fromarray(np.dstack([np.array(rgbI), (aU * 255).astype(np.uint8)]), 'RGBA')
def bbox(img, rows=None):
    a = np.array(img)[..., 3] > 90
    if rows: a[:rows[0]] = False; a[rows[1]:] = False
    ys, xs = np.where(a)
    return None if len(xs) == 0 else (xs.min(), ys.min(), xs.max(), ys.max())
def mouth_mask(img):   # the mouth = blobs in the lower middle of the face
    a = np.array(img)[..., 3] > 100; lab, n = ndimage.label(ndimage.binary_dilation(a, iterations=3)); m = np.zeros_like(a)
    for i, sl in enumerate(ndimage.find_objects(lab)):
        cy, cx = (sl[0].start + sl[0].stop) / 2, (sl[1].start + sl[1].stop) / 2
        if abs(cx - S / 2) < S * .2 and cy > S * .6: m |= lab == i + 1
    return ndimage.binary_dilation(m, iterations=4)
def mbox(m):
    ys, xs = np.where(m); return None if len(xs) == 0 else (xs.min(), ys.min(), xs.max(), ys.max())
def eyes_only(img):
    a = np.array(img); a[..., 3][mouth_mask(img)] = 0; return Image.fromarray(a, 'RGBA')
def split_line(img):   # the empty band between the eyes and the mouth on the neutral face
    a = np.array(img)[..., 3] > 60; occ = a.any(1); best = (0, None)
    y = int(S * .45)
    while y < int(S * .9):
        if not occ[y]:
            y0 = y
            while y < S and not occ[y]: y += 1
            if y - y0 > best[0]: best = (y - y0, (y0 + y) // 2)
        y += 1
    return best[1] or int(S * .68)
def shift(img, dx, dy, k=1.0):
    if abs(k - 1) > .01: w = round(S * k); img = img.resize((w, w), Image.LANCZOS); base = Image.new('RGBA', (S, S)); base.alpha_composite(img, (round((S - w) / 2), round((S - w) / 2))); img = base
    return img.transform((S, S), Image.AFFINE, (1, 0, -dx, 0, 1, -dy), resample=Image.BICUBIC)
def run(style):
    src = f'{AI}/{style}'; dst = f'{OUT}/{style}'; os.makedirs(dst, exist_ok=True); meta = {'style': style}
    sheets = {k: [key(c) for c in cells(f'{src}/{k}.png')] for k in 'ABCD' if os.path.exists(f'{src}/{k}.png')}
    A1 = sheets['A'][0]; mouth = mbox(mouth_mask(A1)); eyes = bbox(eyes_only(A1)); meta['split'] = int(mouth[1]) if mouth else S; meta['eyes'] = [int(v) for v in eyes]; meta['mouth'] = [int(v) for v in mouth] if mouth else None
    fix = {}
    def med(boxes):
        b = np.array([x for x in boxes if x is not None], float); return None if not len(b) else np.median(b, 0)
    if 'C' in sheets:   # mouth sheet vs the mouths of sheet A: median centre and width over all 16 cells
        ma = med([mbox(mouth_mask(i)) for i in sheets['A']]); mc = med([bbox(i) for i in sheets['C']])
        if ma is not None and mc is not None:
            k = float(np.clip((ma[2] - ma[0]) / max(1, mc[2] - mc[0]), .7, 1.4)); cx, cy = (mc[0] + mc[2]) / 2, (mc[1] + mc[3]) / 2; tx, ty = (ma[0] + ma[2]) / 2, (ma[1] + ma[3]) / 2
            fix['C'] = (tx - (S / 2 + (cx - S / 2) * k), ty - (S / 2 + (cy - S / 2) * k), k)
    if 'D' in sheets:
        ea = med([bbox(eyes_only(i)) for i in sheets['A']]); ed = med([bbox(i) for i in sheets['D']])
        k = float(np.clip((ea[2] - ea[0]) / max(1, ed[2] - ed[0]), .8, 1.25)); cx, cy = (ed[0] + ed[2]) / 2, (ed[1] + ed[3]) / 2; tx, ty = (ea[0] + ea[2]) / 2, (ea[1] + ea[3]) / 2
        fix['D'] = (tx - (S / 2 + (cx - S / 2) * k), ty - (S / 2 + (cy - S / 2) * k), k)
    meta['fix'] = {k: [round(float(v), 2) for v in f] for k, f in fix.items()}
    for k, imgs in sheets.items():
        for i, im in enumerate(imgs):
            if k in fix: im = shift(im, fix[k][0], fix[k][1], fix[k][2])
            n = i + 1 + (16 if k == 'B' else 0); im.save(f'{dst}/{k}{n:02d}.png')
            if k in 'AB': eyes_only(im).save(f'{dst}/{k}{n:02d}e.png')
    json.dump(meta, open(f'{dst}/meta.json', 'w'), indent=1); print(style, meta)
if __name__ == '__main__':
    for st in (sys.argv[1:] or sorted(os.listdir(AI))): run(st)
