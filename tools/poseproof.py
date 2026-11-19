"""python3 tools/poseproof.py [k ...] -> renders pose_proof cells (stiff / dynamic pairs + silhouettes), tiles docs/sheets/pose_proof.jpg"""
import sys, os, json, subprocess, concurrent.futures as cf
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
N = 16; ks = [int(x) for x in sys.argv[1:]] or list(range(N))
def one(job):
    k, sil = job; out = f'/tmp/pp_{k}_{int(sil)}.png'
    subprocess.run(['node', 'tools/still.mjs', json.dumps({'scene': 'pose_proof', 'w': 360, 'h': 480, 'opts': {'k': k, 'sil': sil}, 'probeAt': [0, 1.4, 2]}), out], capture_output=True)
    return out
with cf.ThreadPoolExecutor(3) as ex: list(ex.map(one, [(k, s) for k in ks for s in (False, True)]))
names = ['Waving hi', 'Shocked', 'Laughing', 'Angry pointing', 'Sad', 'Scared', 'Cheering', 'Thinking (scratch)']
B = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18); T = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
cw, ch, sw = 360, 480, 120; W = 4 * (cw + sw) + 50; H = 60 + 4 * (ch + 34)
pg = Image.new('RGB', (W, H), '#17171a'); d = ImageDraw.Draw(pg); d.text((14, 14), 'Posing research, proof: same action, BEFORE (stiff) vs AFTER (dynamic) + silhouette test', font=T, fill='#fff')
for i, nm in enumerate(names):
    for j, kind in enumerate(('stiff', 'dyn')):
        k = i * 2 + j; col = (i % 2) * 2 + j; row = i // 2; x = 10 + col * (cw + sw + 10); y = 60 + row * (ch + 34)
        if not os.path.exists(f'/tmp/pp_{k}_0.png'): continue
        pg.paste(Image.open(f'/tmp/pp_{k}_0.png'), (x, y)); s = Image.open(f'/tmp/pp_{k}_1.png').resize((sw, int(sw * ch / cw))); pg.paste(s, (x + cw, y + ch - s.height))
        d.text((x + 4, y + ch + 6), f"{nm}: {'BEFORE' if kind == 'stiff' else 'AFTER'}", font=B, fill='#ff6b5e' if kind == 'stiff' else '#6fe08a')
pg.save('docs/sheets/pose_proof.jpg', quality=90); print('docs/sheets/pose_proof.jpg')
