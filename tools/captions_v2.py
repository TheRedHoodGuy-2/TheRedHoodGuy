import os
# python3 tools/captions_v2.py <topic> [--counter counter.json] -> topics/<topic>/captions_v2.ass
# CAPTION STYLE v2 (Xavier 2026-11-27, from a friend's reference video): ONE word at a time, white, bold rounded sans
# (Poppins Bold), dark outline + soft shadow, small (not imposing), centred a little below mid-frame. Each word pops in
# (88% -> 100% in 70 ms) and holds until the next word (or .3 s after it is spoken). Lowercase as spoken, no punctuation.
# Optional overlay: a flat 2D COUNTER pill at the top (e.g. Jaden's bad-luck counter) from a json spec:
#   {"label": "JADEN'S BAD LUCK", "events": [t1, t2, ...], "windows": [[a, b], ...]}
# shown only inside the windows; every event bumps the number with a pop + gold flash.
import json, sys, re

topic = sys.argv[1]; args = sys.argv[2:]
T = f'topics/{topic}'; W = json.load(open(f'{T}/voice/words.json'))['words']
cnt = json.load(open(args[args.index('--counter') + 1])) if '--counter' in args else None
skip = json.load(open(args[args.index('--skip') + 1])) if '--skip' in args else []   # [[a, b], ...] no captions in these spans

LOOK = dict(font='Montserrat Black', size=140, y=1340, outline=8, shadow=4)   # Xavier 20:18: bigger, chunkier, lower third
def ts(t): t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f'{h}:{m:02d}:{s:05.2f}'
head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,{LOOK['font']},{LOOK['size']},&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,1,0,1,{LOOK['outline']},{LOOK['shadow']},5,0,0,0,1
Style: Pill,Poppins,40,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1
Style: CLabel,Poppins,54,&H00FFFFFF,&H00FFFFFF,&H00120E7A,&H00000000,-1,0,0,0,100,100,1,0,1,4,0,5,0,0,0,1
Style: CNum,Poppins,84,&H00120E7A,&H00120E7A,&H00FFFFFF,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1
Style: Plus,Poppins,92,&H001FD2FF,&H001FD2FF,&H00120E7A,&H00000000,-1,0,0,0,100,100,0,0,1,5,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
words = [(w.get('word') or w.get('w'), w.get('start', w.get('s')), w.get('end', w.get('e'))) for w in W]
for i, (w, s, e) in enumerate(words):
    txt = re.sub(r"[^\w'$:]", '', w).upper()
    if not txt or any(a <= s < b for a, b in skip): continue
    nxt = words[i + 1][1] if i + 1 < len(words) else e + .3
    end = min(nxt, e + .3) if nxt - e < .6 else e + .3
    ev.append(f"Dialogue: 2,{ts(s)},{ts(end)},Word,,0,0,0,,{{\\an5\\move(540,{LOOK['y'] + 34},540,{LOOK['y']},0,110)\\fscx45\\fscy45\\t(0,90,\\fscx126\\fscy126)\\t(90,160,\\fscx92\\fscy92)\\t(160,230,\\fscx100\\fscy100)}}{txt}")

def pill(x, y, w, h, r):   # rounded rectangle as an ASS drawing (\p1), top-left at (x, y)
    k = .55 * r
    return (f"m {x+r} {y} l {x+w-r} {y} b {x+w-r+k} {y} {x+w} {y+r-k} {x+w} {y+r} l {x+w} {y+h-r} b {x+w} {y+h-r+k} {x+w-r+k} {y+h} {x+w-r} {y+h} "
            f"l {x+r} {y+h} b {x+r-k} {y+h} {x} {y+h-r+k} {x} {y+h-r} l {x} {y+r} b {x} {y+r-k} {x+r-k} {y} {x+r} {y}")
if cnt:
    # EYE-CATCHING COUNTER (Xavier 2026-11-27 20:10: "boring", wants an animated, eye-catching 2D UI): a chunky red game-UI
    # badge with a yellow rim and a dark drop shadow, a yellow coin-circle holding the number. It SLIDES DOWN in when the
    # character is on screen; every bad thing makes the whole badge WOBBLE + FLASH white, the new number DROPS in and
    # overshoots, and a yellow "+1" floats up off the side. Slides out when he leaves.
    W_, H_, CY = 640, 124, 250; CX = 540; X0, Y0 = CX - W_ // 2, CY - H_ // 2; NX = X0 + W_ - 78; R = 50
    ev_t = sorted(cnt['events'])
    def lay(a, b, text, style='Pill', layer=0, extra='', slide=False, out=False, wob=False):
        mv = '\\move(0,-260,0,0,0,260)' if slide else '\\pos(0,0)'
        fx = ('\\fad(0,180)' if out else '') + (f'\\org({CX},{CY})\\t(0,70,\\frz-8)\\t(70,170,\\frz6)\\t(170,300,\\frz0)' if wob else '')
        ev.append(f"Dialogue: {layer},{ts(a)},{ts(b)},{style},,0,0,0,,{{{mv}{fx}{extra}}}{text}")
    def txt(a, b, x, y, text, style, layer, extra='', slide=False, out=False, wob=False):
        mv = f'\\move({x},{y - 260},{x},{y},0,260)' if slide else f'\\pos({x},{y})'
        fx = ('\\fad(0,180)' if out else '') + (f'\\org({CX},{CY})\\t(0,70,\\frz-8)\\t(70,170,\\frz6)\\t(170,300,\\frz0)' if wob else '')
        ev.append(f"Dialogue: {layer},{ts(a)},{ts(b)},{style},,0,0,0,,{{\\an5{mv}{fx}{extra}}}{text}")
    circ = lambda cx, cy, r: f"m {cx} {cy-r} b {cx+.55*r} {cy-r} {cx+r} {cy-.55*r} {cx+r} {cy} b {cx+r} {cy+.55*r} {cx+.55*r} {cy+r} {cx} {cy+r} b {cx-.55*r} {cy+r} {cx-r} {cy+.55*r} {cx-r} {cy} b {cx-r} {cy-.55*r} {cx-.55*r} {cy-r} {cx} {cy-r}"
    for a, b in cnt['windows']:
        cuts = [a] + [t for t in ev_t if a < t < b] + [b]
        for c0, c1 in zip(cuts, cuts[1:]):
            first, last, hit = c0 == a, c1 == b, c0 in ev_t
            n = sum(1 for t in ev_t if t <= c0 + 1e-6)
            k = dict(slide=first, out=last, wob=hit)
            flash = '\\t(0,60,\\1c&HFFFFFF&)\\t(60,280,\\1c&H2C26E8&)' if hit else ''
            lay(c0, c1, '{\\p1}' + pill(X0 + 6, Y0 + 12, W_, H_, 40) + '{\\p0}', layer=0, extra='\\1c&H0A0518&\\1a&H40&\\bord0\\shad0', **k)          # drop shadow
            lay(c0, c1, '{\\p1}' + pill(X0 - 8, Y0 - 8, W_ + 16, H_ + 16, 48) + '{\\p0}', layer=1, extra='\\1c&H1FD2FF&\\bord0\\shad0', **k)      # yellow rim
            lay(c0, c1, '{\\p1}' + pill(X0, Y0, W_, H_, 40) + '{\\p0}', layer=2, extra='\\1c&H2C26E8&\\bord0\\shad0' + flash, **k)              # red body
            lay(c0, c1, '{\\p1}' + pill(X0 + 16, Y0 + 10, W_ - 160, 30, 15) + '{\\p0}', layer=3, extra='\\1c&HFFFFFF&\\1a&HC0&\\bord0\\shad0', **k)  # gloss
            lay(c0, c1, '{\\p1}' + circ(NX, CY, R + 8) + '{\\p0}', layer=3, extra='\\1c&H120E7A&\\bord0\\shad0', **k)                       # coin rim
            lay(c0, c1, '{\\p1}' + circ(NX, CY, R) + '{\\p0}', layer=4, extra='\\1c&H1FD2FF&\\bord0\\shad0', **k)                           # coin
            txt(c0, c1, X0 + 250, CY + 2, cnt['label'], 'CLabel', 5, **k)
            drop = f'\\move({NX},{CY - 70},{NX},{CY + 3},0,150)\\fscx175\\fscy175\\t(0,150,\\fscx90\\fscy90)\\t(150,260,\\fscx100\\fscy100)' if hit and not first else ''
            if drop: ev.append(f"Dialogue: 6,{ts(c0)},{ts(c1)},CNum,,0,0,0,,{{\\an5{drop}{'\\fad(0,180)' if last else ''}}}{n}")
            else: txt(c0, c1, NX, CY + 3, str(n), 'CNum', 6, **k)
            if hit: ev.append(f"Dialogue: 7,{ts(c0)},{ts(c0 + .85)},Plus,,0,0,0,,{{\\an5\\move({X0 + W_ + 50},{CY},{X0 + W_ + 60},{CY - 120},0,850)\\fscx60\\fscy60\\t(0,140,\\fscx120\\fscy120)\\t(140,260,\\fscx100\\fscy100)\\fad(0,380)}}+1")
# --- SUBSCRIBE card under Jaden's "subscribe for more" (Xavier 20:24): YouTube dark-mode card, the button gets tapped and flips to Subscribed.
SUB = json.load(open(f'{T}/subscribe_ui.json')) if os.path.exists(f'{T}/subscribe_ui.json') else None
if SUB:
    circ = lambda cx, cy, r: f"m {cx} {cy-r} b {cx+.55*r} {cy-r} {cx+r} {cy-.55*r} {cx+r} {cy} b {cx+r} {cy+.55*r} {cx+.55*r} {cy+r} {cx} {cy+r} b {cx-.55*r} {cy+r} {cx-r} {cy+.55*r} {cx-r} {cy} b {cx-r} {cy-.55*r} {cx-.55*r} {cy-r} {cx} {cy-r}"
    a0, tap, a1 = SUB['in'], SUB['tap'], SUB['out']
    X, Y, Wc, Hc = 120, 1250, 840, 176          # sits above the Shorts bottom UI (title / channel row starts ~y 1500)
    def card(t0, t1, body, layer, extra=''):
        ev.append(f"Dialogue: {layer},{ts(t0)},{ts(t1)},Pill,,0,0,0,,{{\\an7\\move(0,40,0,0,0,220)\\fad(200,160)\\bord0\\shad0{extra}\\p1}}{body}{{\\p0}}")
    def word(t0, t1, x, y, txt, size, col, layer, extra=''):
        ev.append(f"Dialogue: {layer},{ts(t0)},{ts(t1)},Pill,,0,0,0,,{{\\an4\\move({x},{y + 40},{x},{y},0,220)\\fad(200,160)\\fnPoppins\\b1\\fs{size}\\1c{col}\\bord0\\shad0{extra}}}{txt}")
    card(a0, a1, pill(X + 6, Y + 10, Wc, Hc, 44), 20, '\\1c&H000000&\\1a&HA0&\\blur6')                     # soft drop shadow
    card(a0, a1, pill(X, Y, Wc, Hc, 44), 21, '\\1c&H1A1A1A&\\1a&H10&')                                    # card
    cx, cy, r = X + 92, Y + Hc // 2, 56
    card(a0, a1, circ(cx, cy, r), 22, '\\1c&H2A1FD6&')                                                    # avatar: the red hoodie
    # avatar = Xavier's channel picture, overlaid by ffmpeg (topics/<t>/avatar.png) inside this red ring
    word(a0, a1, X + 170, cy - 22, 'TheRedHoodGuy', 50, '&HFFFFFF&', 23)
    word(a0, a1, X + 172, cy + 26, '@theredhoodguy', 34, '&HAAAAAA&', 23)
    bw, bh = 270, 96; bx, by = X + Wc - bw - 34, cy - bh // 2; bcx = bx + bw // 2
    press = '\\org(%d,%d)' % (bcx, cy)
    tp = int((tap - a0) * 1000)
    ev.append(f"Dialogue: 22,{ts(a0)},{ts(tap + .08)},Pill,,0,0,0,,{{\\an5\\move({bcx},{cy + 40},{bcx},{cy},0,220)\\fad(200,0)\\bord0\\shad0\\1c&H3300FF&\\t({tp},{tp + 80},\\fscx93\\fscy93)\\p1}}{pill(0, 0, bw, bh, 46)}{{\\p0}}")
    ev.append(f"Dialogue: 23,{ts(a0)},{ts(tap + .08)},Pill,,0,0,0,,{{\\an5\\move({bcx},{cy + 40},{bcx},{cy},0,220)\\fad(200,0)\\fnPoppins\\b1\\fs44\\1c&HFFFFFF&\\bord0\\shad0}}Subscribe")
    t2 = tap + .08; d = int((a1 - t2) * 1000)
    ev.append(f"Dialogue: 22,{ts(t2)},{ts(a1)},Pill,,0,0,0,,{{\\an5\\pos({bcx},{cy})\\fad(0,160)\\bord0\\shad0\\1c&H3A3A3A&\\fscx93\\fscy93\\t(0,140,\\fscx103\\fscy103)\\t(140,240,\\fscx100\\fscy100)\\p1}}{pill(0, 0, bw, bh, 46)}{{\\p0}}")
    ev.append(f"Dialogue: 23,{ts(t2)},{ts(a1)},Pill,,0,0,0,,{{\\an5\\pos({bcx},{cy})\\fad(0,160)\\fnPoppins\\b1\\fs40\\1c&HF1F1F1&\\bord0\\shad0}}Subscribed \u2713")
    # the tap: a finger-dot glides in from the lower right, lands on the button, ripple
    ev.append(f"Dialogue: 25,{ts(tap - .42)},{ts(tap + .22)},Pill,,0,0,0,,{{\\an7\\move(190,170,0,0,0,330)\\fad(120,160)\\bord3\\3c&H555555&\\shad0\\1c&HFFFFFF&\\1a&H30&\\p1}}{circ(bcx + 40, cy + 18, 30)}{{\\p0}}")
    ev.append(f"Dialogue: 24,{ts(tap)},{ts(tap + .45)},Pill,,0,0,0,,{{\\an7\\org({bcx + 40},{cy + 18})\\bord0\\shad0\\1c&HFFFFFF&\\1a&H60&\\fscx40\\fscy40\\t(0,450,\\fscx260\\fscy260\\1a&HFF&)\\p1}}{circ(bcx + 40, cy + 18, 40)}{{\\p0}}")
open(f'{T}/captions_v2.ass', 'w').write(head + '\n'.join(ev) + '\n'); print('wrote', f'{T}/captions_v2.ass', len(ev), 'events')
