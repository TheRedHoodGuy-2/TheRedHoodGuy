#!/bin/bash
# bash tools/lookcheck.sh '<spec json without w/h>'  -> renders the shot at preview (540) and final (1080) size and
# compares them. FAILS if the preview would lie about the final look (brightness, colour or detail drift).
S="$1"; P=$(echo "$S" | sed 's/^{/{"w":540,"h":960,/'); F=$(echo "$S" | sed 's/^{/{"w":1080,"h":1920,/')
node tools/still.mjs "$P" /tmp/look_p.png >/dev/null && node tools/still.mjs "$F" /tmp/look_f.png >/dev/null && python3 - <<'PY'
from PIL import Image, ImageFilter; import numpy as np, sys
p = np.asarray(Image.open('/tmp/look_p.png').convert('RGB').filter(ImageFilter.GaussianBlur(2)), float)
f = np.asarray(Image.open('/tmp/look_f.png').convert('RGB').resize((540, 960), Image.LANCZOS).filter(ImageFilter.GaussianBlur(2)), float)
dm = np.abs(p.mean((0, 1)) - f.mean((0, 1))); px = np.abs(p - f).mean()
print('channel mean drift', dm.round(1), 'pixel diff %.1f' % px)
ok = dm.max() < 4 and px < 9
print('LOOKCHECK', 'PASS' if ok else 'FAIL: preview does not match the final'); sys.exit(0 if ok else 1)
PY
