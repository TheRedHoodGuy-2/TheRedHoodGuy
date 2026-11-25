# python3 tools/captions.py <topic> [--title "TEXT"] [--burn]
# Captions as a separate, hot-swappable layer: words.json -> topics/<topic>/captions*.ass, then --burn re-encodes the
# finished render with it (no 3D re-render, ~2 min). Look (Xavier 2026-11-25): chunks of up to 3 words in white with a
# black outline; the SPOKEN word sits on a coloured box and bounces (grows, overshoots, settles). Every look setting is in
# LOOK below: edit, re-run, re-burn. Words are laid out with the real font metrics (PIL) so each word has its own event.
import json, sys, subprocess, re, os
from PIL import ImageFont
topic = sys.argv[1]; args = sys.argv[2:]
title = args[args.index('--title') + 1] if '--title' in args else None
T = f'topics/{topic}'; words = json.load(open(f'{T}/voice/words.json'))['words']

LOOK = dict(
    font='Poppins', font_file='/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf',
    size=210,                 # ASS font size (libass draws Poppins at ~.558 of this in px: 210 -> ~117 px em)
    y=1330,                   # caption centre line (px from top of 1920)
    max_w=940, max_words=3,   # chunking
    text='&H00FFFFFF', outline='&H00000000', bord=9, shad=4,
    box='&H002B26E3',         # highlight box colour (BGR): brand red  (yellow: &H0000D4FF)
    box_text='&H00FFFFFF', pad_x=22, pad_y=16, radius=18,
    bounce=((0, 90, 124), (90, 190, 112)),   # (from ms, to ms, scale %): grow, then settle
    title_size=250, title_y=330, title_box='&H002B26E3',
)
K = .558                      # libass px per ASS font-size unit, measured for Poppins (calibration 2026-11-25)
F = ImageFont.truetype(LOOK['font_file'], round(LOOK['size'] * K))
def wpx(s): b = F.getbbox(s); return b[2] - b[0]
CAP_H = F.getbbox('H')[3] - F.getbbox('H')[1]
SPACE = wpx('A A') - wpx('AA')

def ts(t):
    t = max(0, t); return f'{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}'
def rrect(w, h, r):   # rounded rectangle drawing (top-left origin; \an5 centres it on \pos)
    w, h = round(w), round(h)
    return (f'm {r} 0 l {w - r} 0 b {w} 0 {w} 0 {w} {r} l {w} {h - r} b {w} {h} {w} {h} {w - r} {h} '
            f'l {r} {h} b 0 {h} 0 {h} 0 {h - r} l 0 {r} b 0 0 0 0 {r} 0')
def bounce():
    return ''.join(f'\\t({a},{b},\\fscx{s}\\fscy{s})' for a, b, s in LOOK['bounce'])

# chunk: up to 3 words that fit the width, break after punctuation or a pause
GAP = SPACE + 2 * LOOK['pad_x'] + 22
chunks, cur = [], []
for i, w in enumerate(words):
    cur.append(w); nxt = words[i + 1] if i + 1 < len(words) else None
    width = sum(wpx(x['w'].upper()) for x in cur) + GAP * (len(cur) - 1)
    nxt_w = (width + GAP + wpx(nxt['w'].upper())) if nxt else 0
    if (len(cur) >= LOOK['max_words'] or nxt_w > LOOK['max_w'] or re.search(r'[.,!?…]$', w['w']) or (nxt and nxt['s'] - w['e'] > .35) or not nxt):
        chunks.append(cur); cur = []

ev = []
for ci, ch in enumerate(chunks):
    end_chunk = min(chunks[ci + 1][0]['s'] if ci + 1 < len(chunks) else ch[-1]['e'] + .4, ch[-1]['e'] + .6)
    ws = [wpx(x['w'].upper()) for x in ch]; total = sum(ws) + GAP * (len(ch) - 1); x0 = 540 - total / 2
    cx = []; x = x0
    for wv in ws: cx.append(x + wv / 2); x += wv + GAP
    for wi, w in enumerate(ch):
        a = w['s']; b = ch[wi + 1]['s'] if wi + 1 < len(ch) else end_chunk
        for k, x_ in enumerate(ch):
            word = x_['w'].upper()
            if k == wi:   # the spoken word: box + white text, both bouncing about the word centre
                bw, bh = ws[k] + 2 * LOOK['pad_x'], CAP_H + 2 * LOOK['pad_y']
                ev.append(f'Dialogue: 1,{ts(a)},{ts(b)},Cap,,0,0,0,,{{\\an5\\pos({cx[k]:.0f},{LOOK["y"]})\\bord0\\shad3\\1c{LOOK["box"]}\\p1{bounce()}}}{rrect(bw, bh, LOOK["radius"])}')
                ev.append(f'Dialogue: 2,{ts(a)},{ts(b)},Cap,,0,0,0,,{{\\an5\\pos({cx[k]:.0f},{LOOK["y"]})\\bord0\\shad0\\1c{LOOK["box_text"]}{bounce()}}}{word}')
            else:
                ev.append(f'Dialogue: 0,{ts(a)},{ts(b)},Cap,,0,0,0,,{{\\an5\\pos({cx[k]:.0f},{LOOK["y"]})}}{word}')
if title:
    TF = ImageFont.truetype(LOOK['font_file'], round(LOOK['title_size'] * K)); tb = TF.getbbox(title); tw = tb[2] - tb[0]; th = TF.getbbox('H')[3] - TF.getbbox('H')[1]
    pop = '\\fscx60\\fscy60\\t(0,120,\\fscx112\\fscy112)\\t(120,240,\\fscx100\\fscy100)\\fad(0,250)'
    ev.insert(0, f'Dialogue: 3,{ts(0)},{ts(2.2)},Title,,0,0,0,,{{\\an5\\pos(540,{LOOK["title_y"]})\\bord0\\shad4\\1c{LOOK["title_box"]}\\p1{pop}}}{rrect(tw + 60, th + 44, 24)}')
    ev.insert(1, f'Dialogue: 4,{ts(0)},{ts(2.2)},Title,,0,0,0,,{{\\an5\\pos(540,{LOOK["title_y"]})\\bord0\\shad0{pop}}}{title}')

STYLES = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{LOOK['font']},{LOOK['size']},{LOOK['text']},{LOOK['text']},{LOOK['outline']},&H78000000,-1,0,0,0,100,100,0,0,1,{LOOK['bord']},{LOOK['shad']},5,0,0,0,1
Style: Title,{LOOK['font']},{LOOK['title_size']},&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,-1,0,0,0,100,100,0,0,1,0,4,5,0,0,0,1
"""
out = f'{T}/captions{"_title" if title else ""}.ass'
open(out, 'w').write(STYLES + '\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n' + '\n'.join(ev) + '\n')
print('wrote', out, len(chunks), 'chunks', len(ev), 'events')
if '--burn' in args:
    src = f'out/{topic}_clean.mp4'; dst = f'out/{topic}{"_title" if title else ""}_captions.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f'ass={out}', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', dst + '.tmp.mp4'], check=True)
    os.replace(dst + '.tmp.mp4', dst); print('wrote', dst)
