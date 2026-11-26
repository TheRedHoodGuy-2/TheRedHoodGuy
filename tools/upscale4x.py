# python3 tools/upscale4x.py <list.txt> [--scale 4]   Real-ESRGAN x4plus (RRDBNet) on CPU, no basicsr needed.
# Writes assets_up4/<same path>.png (DECISIONS 2026-11-25 03:44: textures of an approved video are upscaled before the final;
# tools/lib/browser.mjs serves these copies when HITEX=1). Alpha is upscaled separately (bicubic) and kept.
import sys, os, torch, torch.nn as nn, torch.nn.functional as F, numpy as np
from PIL import Image
torch.set_num_threads(os.cpu_count() or 2)
class RDB(nn.Module):
    def __init__(s, nf=64, gc=32):
        super().__init__()
        s.conv1 = nn.Conv2d(nf, gc, 3, 1, 1); s.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1); s.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
        s.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1); s.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1); s.l = nn.LeakyReLU(.2, True)
    def forward(s, x):
        x1 = s.l(s.conv1(x)); x2 = s.l(s.conv2(torch.cat((x, x1), 1))); x3 = s.l(s.conv3(torch.cat((x, x1, x2), 1)))
        x4 = s.l(s.conv4(torch.cat((x, x1, x2, x3), 1))); return s.conv5(torch.cat((x, x1, x2, x3, x4), 1)) * .2 + x
class RRDB(nn.Module):
    def __init__(s, nf=64, gc=32): super().__init__(); s.rdb1 = RDB(nf, gc); s.rdb2 = RDB(nf, gc); s.rdb3 = RDB(nf, gc)
    def forward(s, x): return s.rdb3(s.rdb2(s.rdb1(x))) * .2 + x
class RRDBNet(nn.Module):
    def __init__(s, nf=64, nb=23, gc=32):
        super().__init__(); s.conv_first = nn.Conv2d(3, nf, 3, 1, 1); s.body = nn.Sequential(*[RRDB(nf, gc) for _ in range(nb)])
        s.conv_body = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1)
        s.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1); s.conv_last = nn.Conv2d(nf, 3, 3, 1, 1); s.l = nn.LeakyReLU(.2, True)
    def forward(s, x):
        f = s.conv_first(x); f = f + s.conv_body(s.body(f))
        f = s.l(s.conv_up1(F.interpolate(f, scale_factor=2, mode='nearest'))); f = s.l(s.conv_up2(F.interpolate(f, scale_factor=2, mode='nearest')))
        return s.conv_last(s.l(s.conv_hr(f)))
net = RRDBNet(); sd = torch.load('/home/claude/models/RealESRGAN_x4plus.pth', map_location='cpu'); net.load_state_dict(sd.get('params_ema', sd.get('params', sd))); net.eval()
def up(img, tile=192, pad=10):
    a = torch.from_numpy(np.asarray(img, np.float32) / 255).permute(2, 0, 1)[None]; _, _, H, W = a.shape; out = torch.zeros(1, 3, H * 4, W * 4)
    with torch.no_grad():
        for y in range(0, H, tile):
            for x in range(0, W, tile):
                y0, x0, y1, x1 = max(0, y - pad), max(0, x - pad), min(H, y + tile + pad), min(W, x + tile + pad)
                o = net(a[:, :, y0:y1, x0:x1]); ty, tx = (y - y0) * 4, (x - x0) * 4; hh, ww = (min(H, y + tile) - y) * 4, (min(W, x + tile) - x) * 4
                out[:, :, y * 4:y * 4 + hh, x * 4:x * 4 + ww] = o[:, :, ty:ty + hh, tx:tx + ww]
    return Image.fromarray((out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255 + .5).astype(np.uint8))
for line in open(sys.argv[1]):
    f = line.strip()
    if not f: continue
    dst = os.path.join('assets_up4', os.path.splitext(f)[0] + '.png')
    if os.path.exists(dst): continue
    im = Image.open(f); os.makedirs(os.path.dirname(dst), exist_ok=True)
    rgb = up(im.convert('RGB'))
    if im.mode in ('RGBA', 'LA', 'P') and 'A' in im.convert('RGBA').getbands():
        al = im.convert('RGBA').split()[3].resize(rgb.size, Image.BICUBIC); rgb = rgb.convert('RGBA'); rgb.putalpha(al)
    rgb.save(dst, optimize=False, compress_level=3); print('up', f, im.size, '->', rgb.size, flush=True)
