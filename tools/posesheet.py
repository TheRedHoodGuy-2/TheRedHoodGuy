"""python3 tools/posesheet.py <topic> [out.jpg] -> renders every pose in scenes/<topic>.js POSE_SHEET (scenes/pose_sheet.js),
tiles them in story order with labels. Sent to Xavier BEFORE any video render so he can repose the bad ones."""
import sys, os, json, subprocess, re, concurrent.futures as cf
from PIL import Image, ImageDraw, ImageFont
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
topic = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else f'out/{topic}_poses.jpg'
src = open(f'scenes/{topic}.js').read()
labels = re.findall(r"\['(\d\d [^']*)', '([^']*)', '([^']*)'", src[src.index('POSE_SHEET'):])
cw, ch = 300, 420
def one(k):
    o = f'/tmp/ps_{topic}_{k}.png'
    subprocess.run(['node', 'tools/still.mjs', json.dumps({'scene': 'pose_sheet', 'w': cw, 'h': ch, 'probe': False, 'wait': 600, 'opts': {'topic': topic, 'k': k}}), o], capture_output=True, timeout=300)
    return o
with cf.ThreadPoolExecutor(3) as ex: files = list(ex.map(one, range(len(labels))))
C = 7; R = (len(files) + C - 1) // C; B = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 15)
pg = Image.new('RGB', (C * cw, R * (ch + 40)), '#17171a'); d = ImageDraw.Draw(pg)
for i, f in enumerate(files):
    x, y = (i % C) * cw, (i // C) * (ch + 40)
    if os.path.exists(f): pg.paste(Image.open(f).convert('RGB'), (x, y))
    lab, who, pose = labels[i]; d.text((x + 6, y + ch + 3), lab, font=B, fill='#fff'); d.text((x + 6, y + ch + 21), f'{who} / {pose}', font=B, fill='#9aa0aa')
pg.save(out, quality=88); print(out, len(files))
