"""python3 tools/eyerig.py <style> : split a style's neutral eyes (D01) into layers that can move on their own:
  eyebase.png (whites, lids, outlines, iris painted out), iris.png (the iris + pupil + glint), irisclip.png (where the
  iris may show: inside the eye, never over the lid / outline ink), brows.png (eyebrows), + rig.json (eye centres, brow
  boxes). Works for styles with white eyes and a dark iris (05). All-dark chibi eyes (13, 16) can't have a separate pupil."""
import sys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage
st = sys.argv[1]; D = f'assets/faces/sprites/{st}'
im = np.array(Image.open(f'{D}/D01.png')).astype(float); A = im[..., 3] / 255; L = im[..., :3].mean(-1)
ink = (A > .5) & (L < 70); white = (A > .5) & (L > 170)
eye = ndimage.binary_fill_holes(ndimage.binary_closing(white | ink, iterations=3)) & (A > .3)
lab, n = ndimage.label(eye); sizes = ndimage.sum(eye, lab, range(1, n + 1)); keep = [i + 1 for i in np.argsort(sizes)[::-1][:4]]
# the two eyes = the big blobs that contain white; brows = blobs above them with no white
eyes, brows = [], []
for i in keep:
    m = lab == i; ys, xs = np.where(m)
    (eyes if (white & m).sum() > 200 else brows).append(m)
eyes = eyes[:2]; E = np.zeros_like(eye); [E.__ior__(m) for m in eyes]
B = (A > .2) & ~ndimage.binary_dilation(E, iterations=2); ys, xs = np.where(E); B[ys.min():] = False   # brows: everything above the eyes
inner = ndimage.binary_erosion(E, iterations=5)
# the iris: dark pixels inside the eye that are not the lid band at the top of each eye
iris = np.zeros_like(E)
for m in eyes:
    ys, xs = np.where(m); x0, x1 = xs.min(), xs.max(); top = {x: np.where(m[:, x])[0].min() for x in range(x0, x1 + 1) if m[:, x].any()}
    runs = []
    for x in list(range(x0, x0 + (x1 - x0) // 6)) + list(range(x1 - (x1 - x0) // 6, x1 + 1)):   # eye ends: lid only, no iris
        if x not in top: continue
        r = 0
        while top[x] + r < 512 and ink[top[x] + r, x]: r += 1
        runs.append(r)
    T = int(np.median(runs)) + 2
    for y, x in zip(*np.where(ink & inner & m)):
        if y > top[x] + T: iris[y, x] = True
iris = ndimage.binary_opening(iris, iterations=2)
li, ni = ndimage.label(iris); keepI = np.zeros_like(iris)
for m in eyes:   # one iris per eye: the biggest dark blob inside it
    ids, cnt = np.unique(li[m & (li > 0)], return_counts=True)
    if len(ids): keepI |= li == ids[np.argmax(cnt)]
iris = ndimage.binary_dilation(keepI, iterations=2) & E
glint = (A > .5) & (L > 200) & ndimage.binary_dilation(iris, iterations=1) & ~ndimage.binary_erosion(white, iterations=3)
irisAll = ndimage.binary_fill_holes(iris | glint) & E
sclera = np.median(im[white & ~irisAll][:, :3], 0)
base = im.copy(); base[irisAll, :3] = sclera; base[irisAll, 3] = 255; base[B] = 0
clip = (E & ~(ink & ~irisAll)).astype(np.uint8) * 255
irisL = np.zeros_like(im); irisL[irisAll] = im[irisAll]
br = np.zeros_like(im); br[B] = im[B]
brl = br.copy(); brl[:, 256:] = 0; brr = br.copy(); brr[:, :256] = 0
# v2 (Xavier 08:04: the cut-out iris looked jagged): a CLEAN drawn pupil disc where the iris was, as a full circle that
# the lid hides (clip = the eye's inside, soft-edged), and the eye's lines drawn again on top so the lid covers the disc.
from PIL import ImageDraw, ImageFilter
SS = 4; disc = Image.new('RGBA', (512 * SS, 512 * SS)); dd = ImageDraw.Draw(disc)
col = tuple(int(v) for v in np.median(im[irisAll & ~glint][:, :3], 0)) if (irisAll & ~glint).any() else (12, 12, 12)
for m in eyes:
    ys, xs = np.where(irisAll & m)
    if not len(xs): continue
    r = (xs.max() - xs.min()) / 2 * 1.02; cx = (xs.max() + xs.min()) / 2; cy = ys.max() - r * .98
    dd.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=col + (255,))
    g = r * .2; gx, gy = cx + r * .38, cy - r * .1
    dd.ellipse([(gx - g) * SS, (gy - g) * SS, (gx + g) * SS, (gy + g) * SS], fill=(255, 255, 255, 255))
irisL = np.array(disc.resize((512, 512), Image.LANCZOS)).astype(float)
inner_soft = np.array(Image.fromarray((E * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(float)
clip = inner_soft.astype(np.uint8)
# eye LINES = the outline ring of each eye + its top lid band + everything outside the eyes (lashes, wing); never the
# inside, so no piece of the old iris survives and the lower lid line stays whole under where the pupil was
ring = E & ~ndimage.binary_erosion(E, iterations=4); band = np.zeros_like(E)
for m in eyes:
    ys, xs = np.where(m)
    for x in range(xs.min(), xs.max() + 1):
        col = np.where(m[:, x])[0]
        if len(col): band[col.min():col.min() + T + 3, x] = True
keepL = (ring | band | ~E) & ~B & (A > .05)
lines = np.zeros_like(im); lk = keepL & (L < 150) & ~(irisAll & ~ring & ~band); lines[lk] = im[lk]
inkc = np.median(im[ring & (L < 60) & ~irisAll][:, :3], 0)
fix = ring & ndimage.binary_dilation(irisAll, iterations=3); lines[fix, :3] = inkc; lines[fix, 3] = 255   # outline under the old iris: one even line
# base: the eye filled cleanly (original light pixels kept, everything darker becomes the sclera colour)
base[E & (L < 150), :3] = sclera; base[E, 3] = 255
Image.fromarray(lines.astype(np.uint8), 'RGBA').save(f'{D}/eyelines.png')
for name, arr in [('eyebase', base), ('iris', irisL), ('brows', br), ('brow_sl', brl), ('brow_sr', brr)]: Image.fromarray(arr.astype(np.uint8), 'RGBA').save(f'{D}/{name}.png')
Image.fromarray(np.dstack([np.full_like(clip, 255)] * 3 + [clip]), 'RGBA').save(f'{D}/irisclip.png')
cent = [[float(np.where(m)[1].mean()), float(np.where(m)[0].mean())] for m in eyes]
bys, bxs = np.where(B); json.dump({'eyes': cent, 'eyeW': [float(np.ptp(np.where(m)[1])) for m in eyes], 'browBox': [int(bxs.min()), int(bys.min()), int(bxs.max()), int(bys.max())] if len(bxs) else None}, open(f'{D}/rig.json', 'w'))
print(st, 'eyes', len(eyes), 'iris px', int(irisAll.sum()), 'brow px', int(B.sum()))
