#!/usr/bin/env python3
"""LOOK GATE (Xavier 2026-11-19): measure frames the way research/look_study_2026-11-18.md measured Gneef, and fail
anything far from his look.  python3 tools/lookmeter.py <frames dir | video> [step]
Gneef medians: brightness .31, saturation .57, darkest 3% .00, brightest 3% .76, warm (r-b) .04."""
import sys, glob, os, subprocess, tempfile
import numpy as np
from PIL import Image

GNEEF = dict(bright=.31, sat=.57, dark3=.00, high3=.76, warm=.04)
TOL = dict(bright=(.22, .42), sat=(.42, .75), dark3=(0, .05), high3=(.62, .92), warm=(.0, .12))

def stats(path):
    a = np.asarray(Image.open(path).convert('RGB').resize((180, 320)), dtype=np.float32) / 255
    mx, mn = a.max(2), a.min(2); lum = a @ np.array([.2126, .7152, .0722], np.float32)
    sat = np.where(mx > 1e-3, (mx - mn) / np.maximum(mx, 1e-3), 0)
    return dict(bright=float(np.median(lum)), sat=float(np.median(sat)), dark3=float(np.percentile(lum, 3)),
                high3=float(np.percentile(lum, 97)), warm=float(np.median(a[..., 0] - a[..., 2])))

def main():
    src, step = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 6
    if os.path.isfile(src):
        d = tempfile.mkdtemp(); subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'select=not(mod(n\\,{step}))', '-vsync', 'vfr', f'{d}/%05d.png'], check=True)
        fs = sorted(glob.glob(d + '/*.png'))
    else:
        fs = sorted(glob.glob(src + '/*.jpg') + glob.glob(src + '/*.png'))[::step]
    S = [stats(f) for f in fs]; med = {k: float(np.median([s[k] for s in S])) for k in GNEEF}
    ok = True
    for k, v in med.items():
        lo, hi = TOL[k]; good = lo <= v <= hi; ok &= good
        print(f"{k:7s} ours {v:.3f}  gneef {GNEEF[k]:.2f}  {'OK' if good else 'FAIL'}")
    print('LOOK', 'PASS' if ok else 'FAIL', f'({len(fs)} frames)')
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    main()
