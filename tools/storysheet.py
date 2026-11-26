#!/usr/bin/env python3
"""Cheap storytime dissection: python3 tools/storysheet.py <video> <name>
research/dissect/<name>/ : sheets/NNN.jpg (first 6 s at 10 fps = every 6th source frame, rest at 3 fps, 10x6 tiles with time labels),
cuts.txt (ffmpeg scene cuts with times), words.json (faster-whisper small.en word timings), summary.json."""
import sys, os, subprocess, json, glob, shutil
from PIL import Image, ImageDraw, ImageFont
src, name = sys.argv[1], sys.argv[2]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); out = os.path.join(root, 'research', 'dissect', name)
tmp = '/tmp/ss_' + name; shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp); os.makedirs(out + '/sheets', exist_ok=True)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]).decode())
# frames: 0-6 s at 10 fps, then 3 fps
subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-t', '6', '-i', src, '-vf', 'fps=10,scale=144:256', tmp + '/a%05d.jpg'])
subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-ss', '6', '-i', src, '-vf', 'fps=3,scale=144:256', tmp + '/b%05d.jpg'])
fr = [(i / 10, f) for i, f in enumerate(sorted(glob.glob(tmp + '/a*.jpg')))] + [(6 + i / 3, f) for i, f in enumerate(sorted(glob.glob(tmp + '/b*.jpg')))]
font = ImageFont.load_default()
for s in range(0, len(fr), 60):
    sh = Image.new('RGB', (1440, 6 * 276), (16, 16, 16)); d = ImageDraw.Draw(sh)
    for k, (t, f) in enumerate(fr[s:s + 60]):
        x, y = (k % 10) * 144, (k // 10) * 276; sh.paste(Image.open(f), (x, y)); d.text((x + 2, y + 259), f'{t:.1f}s', fill=(255, 220, 80), font=font)
    sh.save(f'{out}/sheets/{s // 60:03d}.jpg', quality=82)
sc = subprocess.run(['ffmpeg', '-nostdin', '-i', src, '-vf', "select='gt(scene,0.25)',showinfo", '-an', '-f', 'null', '-'], capture_output=True, text=True).stderr
cuts = [float(l.split('pts_time:')[1].split()[0]) for l in sc.splitlines() if 'pts_time:' in l]
open(out + '/cuts.txt', 'w').write('\n'.join(f'{c:.2f}' for c in cuts))
try:
    import numpy as np
    from faster_whisper import WhisperModel
    wav = tmp + '/a.wav'; subprocess.run(['ffmpeg', '-nostdin', '-loglevel', 'error', '-i', src, '-ar', '16000', '-ac', '1', '-f', 'f32le', wav])
    au = np.fromfile(wav, dtype=np.float32); segs, _ = WhisperModel('small.en', compute_type='int8').transcribe(au, word_timestamps=True)
    words = [dict(w=w.word.strip(), s=round(w.start, 2), e=round(w.end, 2)) for sg in segs for w in sg.words]
    json.dump(words, open(out + '/words.json', 'w'))
except Exception as e: words = []; print('whisper fail', e)
json.dump(dict(name=name, seconds=round(dur, 1), sheets=len(glob.glob(out + '/sheets/*.jpg')), cuts=len(cuts), cuts_per_10s=round(len(cuts) / dur * 10, 1), words=len(words), wpm=round(len(words) / dur * 60) if words else None, first_word=words[0]['s'] if words else None), open(out + '/summary.json', 'w'))
print(open(out + '/summary.json').read()); shutil.rmtree(tmp, ignore_errors=True)
