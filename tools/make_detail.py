# python3 tools/make_detail.py  -> for every Poly Haven texture in assets/ph: detail.jpg = the diffuse turned grey and
# normalised (average 0.85), so a material can take OUR colour (colour x detail) and keep the real surface variation.
# Also makes two textures Poly Haven has no good match for: knit (bedding, sweaters) and paper wallpaper.
import os, glob, numpy as np
from PIL import Image, ImageDraw, ImageFilter
for d in glob.glob('assets/ph/*/'):
    src = os.path.join(d, 'diffuse.jpg')
    if not os.path.exists(src): continue
    a = np.asarray(Image.open(src).convert('L'), np.float32) / 255
    a = a / max(a.mean(), 1e-3) * .85; a = .85 + (a - .85) * 1.0
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(os.path.join(d, 'detail.jpg'), quality=92)
# knit: rows of V stitches (1024 px = 32 x 24 stitches), grey detail + matching normal map
os.makedirs('assets/gen/knit', exist_ok=True); N = 1024; cw, chh = 32, 42; h = np.zeros((N, N), np.float32)
yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
u = (xx % cw) / cw; v = (yy % chh) / chh
for side in (0, 1):   # two leaning loops per stitch
    cx = .25 + .5 * side; tilt = (1 if side == 0 else -1) * .55
    dx = (u - cx) - tilt * (v - .5); r = (dx / .2) ** 2 + ((v - .5) / .62) ** 2
    h = np.maximum(h, np.clip(1 - r, 0, 1) ** .6 * ((u >= .5) == bool(side)))
h = Image.fromarray((h * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)); hh = np.asarray(h, np.float32) / 255
Image.fromarray((np.clip(.62 + .38 * hh, 0, 1) * 255).astype(np.uint8)).save('assets/gen/knit/detail.jpg', quality=92)
gy, gx = np.gradient(hh * 6); n = np.dstack([-gx, -gy, np.ones_like(hh)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
Image.fromarray(((n * .5 + .5) * 255).astype(np.uint8)).save('assets/gen/knit/nor_gl.jpg', quality=92)
Image.fromarray(np.full((8, 8), 235, np.uint8)).save('assets/gen/knit/rough.jpg')
# wallpaper: soft vertical stripes (colour applied later as two tints: detail carries the stripe value), paper grain normal
os.makedirs('assets/gen/wallpaper_stripe', exist_ok=True); s = np.where((xx % 128) < 56, .78, .95).astype(np.float32)
s += np.random.default_rng(1).normal(0, .015, s.shape).astype(np.float32)
Image.fromarray((np.clip(s, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.8)).save('assets/gen/wallpaper_stripe/detail.jpg', quality=92)
g = np.random.default_rng(2).normal(0, 1, (N, N)).astype(np.float32); g = np.asarray(Image.fromarray(((g * 20 + 128).clip(0, 255)).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5)), np.float32) / 255
gy, gx = np.gradient(g * 3); n = np.dstack([-gx, -gy, np.ones_like(g)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
Image.fromarray(((n * .5 + .5) * 255).astype(np.uint8)).save('assets/gen/wallpaper_stripe/nor_gl.jpg', quality=92)
Image.fromarray(np.full((8, 8), 220, np.uint8)).save('assets/gen/wallpaper_stripe/rough.jpg')
print('done')
