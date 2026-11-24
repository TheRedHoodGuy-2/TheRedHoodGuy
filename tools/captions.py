# python3 tools/captions.py <topic> [--title "TEXT"] [--burn]
# Captions as a separate, hot-swappable layer: words.json -> topics/<topic>/captions.ass (styles at the top: edit one line
# to restyle), then --burn re-encodes the finished render with it (no 3D re-render). Chunks of 1-3 words, the spoken word
# highlighted. The title card is its own style + event: drop --title for a version without it.
import json, sys, subprocess, re, os
topic = sys.argv[1]; args = sys.argv[2:]
title = args[args.index('--title') + 1] if '--title' in args else None
T = f'topics/{topic}'; words = json.load(open(f'{T}/voice/words.json'))['words']

STYLES = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Poppins,132,&H00FFFFFF,&H0000E5FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,9,4,2,50,50,560,1
Style: Title,Poppins,112,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,9,4,8,60,60,230,1
"""
HL = r'{\c&H0000E5FF&}'   # highlight colour of the spoken word (BGR: yellow)

def ts(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f'{h}:{m:02d}:{s:05.2f}'

# chunk: up to 3 words / 16 chars, break after punctuation or a pause
chunks, cur = [], []
for i, w in enumerate(words):
    cur.append(w); txt = ' '.join(x['w'] for x in cur); nxt = words[i + 1] if i + 1 < len(words) else None
    if (len(cur) >= 3 or len(txt) >= 14 or re.search(r'[.,!?…]$', w['w']) or (nxt and nxt['s'] - w['e'] > .35) or not nxt):
        chunks.append(cur); cur = []
ev = []
for ci, ch in enumerate(chunks):
    end_chunk = chunks[ci + 1][0]['s'] if ci + 1 < len(chunks) else ch[-1]['e'] + .4
    end_chunk = min(end_chunk, ch[-1]['e'] + .6)
    for wi, w in enumerate(ch):
        a = w['s']; b = ch[wi + 1]['s'] if wi + 1 < len(ch) else end_chunk
        parts = [(HL + x['w'].upper() + r'{\r}') if k == wi else x['w'].upper() for k, x in enumerate(ch)]
        ev.append(f'Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,' + ' '.join(parts))
if title: ev.insert(0, f'Dialogue: 1,{ts(0)},{ts(2.2)},Title,,0,0,0,,{{\\fad(0,250)}}{title}')
out = f'{T}/captions{"_title" if title else ""}.ass'
open(out, 'w').write(STYLES + '\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n' + '\n'.join(ev) + '\n')
print('wrote', out, len(ev), 'events')
if '--burn' in args:
    src = f'out/{topic}_clean.mp4'; dst = f'out/{topic}{"_title" if title else ""}_captions.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f'ass={out}', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', dst + '.tmp.mp4'], check=True)
    os.replace(dst + '.tmp.mp4', dst); print('wrote', dst)
