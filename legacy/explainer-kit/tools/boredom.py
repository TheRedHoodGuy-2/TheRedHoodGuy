"""python3 tools/boredom.py <video.mp4> [--start 0 --end 10]
The boredom check: how much the picture changes, second by second. Flags any stretch over 2 s where too little happens.
Change = mean absolute difference between frames (small greyscale), summed per second, plus a count of hard cuts.
Prints a per-second bar chart and a verdict; writes <video>_boredom.png next to the video."""
import sys, subprocess, numpy as np
from PIL import Image, ImageDraw
v = sys.argv[1]; a = sys.argv
start = float(a[a.index('--start') + 1]) if '--start' in a else 0; end = float(a[a.index('--end') + 1]) if '--end' in a else None
W, H, FPS = 72, 128, 15
cmd = ['ffmpeg', '-v', 'error', '-ss', str(start)] + (['-to', str(end)] if end else []) + ['-i', v, '-vf', f'fps={FPS},scale={W}:{H},format=gray', '-f', 'rawvideo', '-']
raw = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.abs(np.diff(raw, axis=0)).mean(axis=(1, 2))                       # per-frame change (0..255)
cuts = (d > 28).astype(int)
secs = int(np.ceil(len(d) / FPS)); per = [d[i * FPS:(i + 1) * FPS].sum() / 10 for i in range(secs)]; cps = [int(cuts[i * FPS:(i + 1) * FPS].sum()) for i in range(secs)]
LOW = 4.0                                                                  # below this a second reads as "nothing is happening"
dead, run, worst = [], 0, 0
for i, x in enumerate(per):
    run = run + 1 if x < LOW else 0; worst = max(worst, run)
    if run == 3: dead.append(i - 2)
print(f'{v}  ({start:.0f}s to {start + secs:.0f}s)\n')
for i, (x, c) in enumerate(zip(per, cps)):
    print(f'{start + i:5.0f}s  {"#" * min(60, int(x * 2)):<60} {x:6.1f}' + (f'  cut x{c}' if c else '') + ('   <-- dead' if x < LOW else ''))
hook = per[:5]
print(f'\nfirst 5 s: average change {np.mean(hook):.1f}, cuts {sum(cps[:5])}')
hookFail = start == 0 and (per[0] < LOW or per[1] < LOW or sum(cps[:5]) < 2)
print('HOOK:', 'FAIL (first 2 s must move and the first 5 s need 2+ cuts)' if hookFail else 'OK')
print('VERDICT:', 'BORING STRETCH at ' + ', '.join(f'{start + s:.0f}s' for s in dead) if dead else 'OK, nothing still for more than 2 s')
img = Image.new('RGB', (40 + 24 * secs, 200), (250, 250, 250)); g = ImageDraw.Draw(img)
for i, x in enumerate(per): h = min(170, x * 6); g.rectangle([30 + i * 24, 180 - h, 48 + i * 24, 180], fill=(220, 60, 50) if x < LOW else (60, 120, 220))
g.line([28, 180 - LOW * 6, 40 + 24 * secs, 180 - LOW * 6], fill=(220, 60, 50)); img.save(v.rsplit('.', 1)[0] + '_boredom.png')
