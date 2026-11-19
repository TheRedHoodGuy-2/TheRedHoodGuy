"""python3 tools/eyerig2.py <style>  (v2, 2026-11-19 after Xavier 08:04: the pixel-cut layers looked jagged)
Rebuilds a style's eyes as CLEAN VECTOR layers measured from its neutral face (D01), drawn 4x supersampled:
  eyebase.png  smooth eye shape: white sclera + the style's lavender lid shade      irisclip.png  the same smooth shape (mask)
  iris.png     a full round pupil with its glint where the original pupil sat      eyelines.png  top lid stroke (style's
               thickness), thin lower lid, + the original wing / lash ink outside the eye
  brow_sl / brow_sr  the brows (original ink).  The pupil moves under the lid; nothing is cut out of the AI pixels."""
import sys, json
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage
st = sys.argv[1]; D = f'assets/faces/sprites/{st}'; SS = 4
src1024 = Image.open(f'{D}/D01.png'); im = np.array(src1024.resize((512, 512), Image.LANCZOS)).astype(float); A = im[..., 3] / 255; L = im[..., :3].mean(-1)
ink = (A > .5) & (L < 70); white = (A > .5) & (L > 170)
eye = ndimage.binary_fill_holes(ndimage.binary_closing(white | ink, iterations=3)) & (A > .3)
lab, n = ndimage.label(eye); sizes = ndimage.sum(eye, lab, range(1, n + 1)); order = np.argsort(sizes)[::-1] + 1
eyes, brows = [], np.zeros_like(eye)
for i in order[:4]:
    m = lab == i; (eyes if (white & m).sum() > 200 and len(eyes) < 2 else []).append(m)
E = np.zeros_like(eye); [E.__ior__(m) for m in eyes]
ey0 = np.where(E)[0].min(); B = (A > .2) & ~ndimage.binary_dilation(E, iterations=2); B[ey0 - 2:] = False
sclera = np.median(im[white & E][:, :3], 0); lav = (white & E) & (im[..., 2] - im[..., 1] > 8)
lavc = np.median(im[lav][:, :3], 0) if lav.sum() > 30 else sclera * .93
inkc = np.median(im[ink & E][:, :3], 0)
def smooth_contour(m, sig=3.0):
    c, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE); c = max(c, key=len)[:, 0, :].astype(float)
    k = int(sig * 3); w = np.exp(-np.arange(-k, k + 1) ** 2 / (2 * sig * sig)); w /= w.sum()
    pad = np.concatenate([c[-k:], c, c[:k]]); return np.stack([np.convolve(pad[:, j], w, 'valid') for j in (0, 1)], 1)
def canvas(): return Image.new('RGBA', (512 * SS, 512 * SS)), None
def down(img): return img.resize((1024, 1024), Image.LANCZOS)
base = Image.new('RGBA', (512 * SS, 512 * SS)); clip = Image.new('L', (512 * SS, 512 * SS)); lines = Image.new('RGBA', (512 * SS, 512 * SS)); iris = Image.new('RGBA', (512 * SS, 512 * SS))
db, dc, dl, di = ImageDraw.Draw(base), ImageDraw.Draw(clip), ImageDraw.Draw(lines), ImageDraw.Draw(iris)
rig = {'eyes': []}
for m in eyes:
    c = smooth_contour(m); P = [tuple(p * SS) for p in c]
    i0, i1 = int(np.argmin(c[:, 0])), int(np.argmax(c[:, 0]))
    seg = lambda a, b: np.concatenate([c[a:], c[:b + 1]]) if a > b else c[a:b + 1]
    s1, s2 = seg(i0, i1), seg(i1, i0); upper, lower = (s1, s2) if s1[:, 1].mean() < s2[:, 1].mean() else (s2, s1)
    if upper[0, 0] > upper[-1, 0]: upper = upper[::-1]
    if lower[0, 0] > lower[-1, 0]: lower = lower[::-1]
    # smooth curves (a quartic per lid) so lash bumps and the notch where the old pupil met the outline disappear
    x0, x1 = c[:, 0].min() + .5, c[:, 0].max() - .5; X = np.linspace(x0, x1, 160)
    pu = np.polyfit(upper[:, 0], upper[:, 1], 4); pl = np.polyfit(lower[:, 0], lower[:, 1], 4)
    yu, yl = np.polyval(pu, X), np.polyval(pl, X); yl = np.maximum(yl, yu + .5)
    upper = np.stack([X, yu], 1); lower = np.stack([X, yl], 1); c = np.concatenate([upper, lower[::-1]]); P = [tuple(p * SS) for p in c]
    # lid band thickness: dark run from the top edge, measured over the middle of the eye
    xs = np.arange(int(upper[:, 0].min()) + 8, int(upper[:, 0].max()) - 8); runs = []
    for x in xs[::3]:
        col = np.where(m[:, x])[0]
        if not len(col): continue
        y = col[0]
        while y < col[0] + 4 and not ink[y, x]: y += 1
        r = 0
        while y + r < 512 and ink[y + r, x]: r += 1
        if r: runs.append(r + (y - col[0]))
    T = float(np.percentile(runs, 25)) if runs else 6.
    db.polygon(P, fill=tuple(int(v) for v in sclera) + (255,)); dc.polygon(P, fill=255)
    h = c[:, 1].max() - c[:, 1].min()
    bandP = [((x) * SS, (y + T * .45) * SS) for x, y in upper] + [((x) * SS, (y + T * .45 + h * .3) * SS) for x, y in upper[::-1]]
    db.polygon(bandP, fill=tuple(int(v) for v in lavc) + (255,))
    # pupil: where the original dark disc sat (the dark area inside the eye below the lid band)
    Dk = ndimage.binary_erosion(m, iterations=5) & (L < 90); ys, xs2 = np.where(Dk); ymid = (c[:, 1].min() + c[:, 1].max()) / 2
    low = ys > ymid; widths = [Dk[y].sum() for y in range(int(ymid), int(c[:, 1].max()))]
    r = max(widths) / 2 * 1.02; cx = xs2[low].mean(); cy = ys.max() + 5 - r
    di.ellipse([(cx - r) * SS, (cy - r) * SS, (cx + r) * SS, (cy + r) * SS], fill=tuple(int(v) for v in inkc) + (255,))
    g = r * .2; gx, gy = cx + r * .36, cy - r * .12; di.ellipse([(gx - g) * SS, (gy - g) * SS, (gx + g) * SS, (gy + g) * SS], fill=(255, 255, 255, 255))
    # lines: tapered top lid stroke, thin lower lid (points resampled by arc length so steep ends stay continuous)
    def dense(a, step=.25):
        d = np.r_[0, np.cumsum(np.hypot(*np.diff(a, axis=0).T))]; t = np.arange(0, d[-1], step); return np.stack([np.interp(t, d, a[:, 0]), np.interp(t, d, a[:, 1])], 1)
    upper, lower = dense(upper), dense(lower)
    nU = len(upper)
    for k in range(nU):
        t = k / (nU - 1); wdt = T * (.55 + .45 * np.sin(np.pi * min(1, t * 1.15)) ** .5); x, y = upper[k]; y += wdt / 2 - .5
        dl.ellipse([(x - wdt / 2) * SS, (y - wdt / 2) * SS, (x + wdt / 2) * SS, (y + wdt / 2) * SS], fill=tuple(int(v) for v in inkc) + (255,))
    lw = max(2.2, T * .3)
    for k in range(len(lower)):
        t = k / (len(lower) - 1); wdt = lw * (.75 + .25 * np.sin(np.pi * t)); x, y = lower[k]; y -= wdt / 2 - .3
        dl.ellipse([(x - wdt / 2) * SS, (y - wdt / 2) * SS, (x + wdt / 2) * SS, (y + wdt / 2) * SS], fill=tuple(int(v) for v in inkc) + (255,))
    rig['eyes'].append({'c': [float(cx), float(cy)], 'r': float(r), 'T': T})
# original ink OUTSIDE the eyes (wing tips, lash ticks), cleaned: only solid dark ink, no light specks
outside = (A > .35) & (L < 90) & ~ndimage.binary_dilation(E, iterations=1) & ~B
outside = ndimage.binary_opening(outside, iterations=1)
lab2, n2 = ndimage.label(outside); sz = ndimage.sum(outside, lab2, range(1, n2 + 1)); outside &= np.isin(lab2, np.where(sz >= 12)[0] + 1)
oimg = np.zeros((512, 512, 4)); oimg[outside, :3] = inkc; oimg[..., 3] = np.where(outside, A * 255, 0)
oimg = Image.fromarray(oimg.astype(np.uint8), 'RGBA').resize((1024, 1024), Image.LANCZOS)
L2 = down(lines); L2.alpha_composite(oimg)
brs = np.zeros_like(im); brs[B] = im[B]; brl = brs.copy(); brl[:, 256:] = 0; brr = brs.copy(); brr[:, :256] = 0
bb = np.array(down(base)); bb[..., 3] = (bb[..., 3].astype(float) * np.array(clip.resize((1024, 1024), Image.LANCZOS)) / 255).astype(np.uint8); Image.fromarray(bb, 'RGBA').save(f'{D}/eyebase.png'); L2.save(f'{D}/eyelines.png'); down(iris).save(f'{D}/iris.png')
a = np.array(clip.resize((1024, 1024), Image.LANCZOS)); Image.fromarray(np.dstack([np.full_like(a, 255)] * 3 + [a]), 'RGBA').save(f'{D}/irisclip.png')
S1 = np.array(src1024).astype(float); Bm = np.array(Image.fromarray((B * 255).astype(np.uint8)).resize((1024, 1024), Image.NEAREST)) > 127
for nme, side in [('brows', None), ('brow_sl', 'l'), ('brow_sr', 'r')]:
    m = Bm.copy()
    if side == 'l': m[:, 512:] = False
    if side == 'r': m[:, :512] = False
    arr = np.zeros_like(S1); arr[m] = S1[m]; Image.fromarray(arr.astype(np.uint8), 'RGBA').save(f'{D}/{nme}.png')
json.dump(rig, open(f'{D}/rig.json', 'w')); print(st, rig)
