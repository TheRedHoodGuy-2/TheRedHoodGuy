#!/usr/bin/env python3
"""Dissect a reference video, EVERY frame (docs/DISSECT_ANIMATION.md = --class anim, docs/DISSECT_STORYTIME.md = --class story).
python3 tools/dissect.py <video> [--class anim|story] [--name <slug>] [--cols 10 --rows 6] [--crop .8]
-> research/dissect/<name>/ : frames/NNNNN.jpg (every frame, source fps), sheets/NNN.jpg (every frame tiled in order,
numbered with frame + time, first frame of each shot outlined red, held / duplicate frames marked 'dup'), frames.csv (auto
columns + the empty human columns of the class), shots.csv, words.json (story; every word timed), summary.json.
Auto columns: cut, dup (same as previous = stepping / hold), camera motion (partial-affine fit of LK flow: tx ty px/frame at
144 px wide, zoom %/frame, roll deg), subj_motion (flow residual after the camera = characters), still, luma, sat."""
import sys, os, json, csv, subprocess, re, cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont

a = sys.argv[1:]; src = a[0]
opt = lambda k, d: a[a.index('--' + k) + 1] if '--' + k in a else d
cls = opt('class', 'story'); name = opt('name', re.sub(r'[^a-z0-9]+', '_', os.path.splitext(os.path.basename(src))[0].lower())[:40])
C, R = int(opt('cols', 10)), int(opt('rows', 6)); cy = float(opt('crop', 1.0))
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); out = os.path.join(root, 'research', 'dissect', name)
for d in ('frames', 'sheets'): os.makedirs(os.path.join(out, d), exist_ok=True)

cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS) or 30; W0 = int(cap.get(3)); H0 = int(cap.get(4))
rows, prev, prevFull, i = [], None, None, -1
while True:
    ok, fr = cap.read(); i += 1
    if not ok: break
    cv2.imwrite(os.path.join(out, 'frames', f'{i:05d}.jpg'), fr, [cv2.IMWRITE_JPEG_QUALITY, 88])
    h, w = fr.shape[:2]; frc = fr[:int(h * cy)]
    g = cv2.cvtColor(cv2.resize(frc, (144, round(144 * frc.shape[0] / w))), cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(cv2.resize(fr, (96, round(96 * h / w))), cv2.COLOR_BGR2HSV)
    r = dict(f=i, tc=round(i / fps, 3), cut=0, dup=0, cam_tx=0., cam_ty=0., cam_zoom=0., cam_roll=0., subj_motion=0., still=0,
             luma=round(float(hsv[..., 2].mean()) / 255, 3), sat=round(float(hsv[..., 1].mean()) / 255, 3), diff=0.)
    if prev is None: r['cut'] = 1
    else:
        diff = float(np.mean(cv2.absdiff(g, prev))); r['diff'] = round(diff, 3)
        h1 = cv2.calcHist([g], [0], None, [32], [0, 256]); h0 = cv2.calcHist([prev], [0], None, [32], [0, 256])
        r['cut'] = int(cv2.compareHist(h0 / h0.sum(), h1 / h1.sum(), cv2.HISTCMP_BHATTACHARYYA) > .3 or diff > 40)
        r['dup'] = int(float(np.mean(cv2.absdiff(fr, prevFull))) < 0.8)
        if not r['cut'] and not r['dup']:
            pts = cv2.goodFeaturesToTrack(prev, 200, .01, 4)
            if pts is not None and len(pts) >= 8:
                nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, pts, None, winSize=(15, 15), maxLevel=2)
                k = st.ravel() == 1; A, B = pts[k].reshape(-1, 2), nxt[k].reshape(-1, 2)
                if len(A) >= 8:
                    M, _ = cv2.estimateAffinePartial2D(A, B, method=cv2.RANSAC, ransacReprojThreshold=1.0)
                    if M is not None:
                        s = float(np.hypot(M[0, 0], M[1, 0]))
                        r.update(cam_tx=round(float(M[0, 2] + (s - 1) * 72), 3), cam_ty=round(float(M[1, 2]), 3), cam_zoom=round((s - 1) * 100, 3), cam_roll=round(float(np.degrees(np.arctan2(M[1, 0], M[0, 0]))), 3))
                        res = np.linalg.norm(B - (A @ M[:, :2].T + M[:, 2]), axis=1); r['subj_motion'] = round(float(np.percentile(res, 90)), 3)
        camv = np.hypot(r['cam_tx'], r['cam_ty']) + abs(r['cam_zoom']) * .72
        r['still'] = int(not r['cut'] and (r['dup'] or (camv < .08 and r['subj_motion'] < .35)))
    rows.append(r); prev = g; prevFull = fr
N = len(rows)

# shots
cuts = [r['f'] for r in rows if r['cut']] + [N]; shots = []
for s in range(len(cuts) - 1):
    seg = rows[cuts[s]:cuts[s + 1]]; mv = [r for r in seg if not r['cut'] and not r['dup']]
    tx = sum(r['cam_tx'] for r in mv); ty = sum(r['cam_ty'] for r in mv); zm = sum(r['cam_zoom'] for r in mv); rl = sum(r['cam_roll'] for r in mv)
    dur = len(seg) / fps; spd = (np.hypot(tx, ty) / 144 * 100 + abs(zm)) / max(dur, 1e-3)
    move = 'static/hold' if spd < 2 else max([('push' if zm > 0 else 'pull', abs(zm) * 1.4), ('pan/truck ' + ('L' if tx > 0 else 'R'), abs(tx) / 144 * 100), ('tilt/crane ' + ('U' if ty > 0 else 'D'), abs(ty) / 144 * 100), ('roll', abs(rl))], key=lambda x: x[1])[0]
    runs, cur = [], 1
    for r in seg[1:]:
        if r['dup']: cur += 1
        else: runs.append(cur); cur = 1
    runs.append(cur); step = float(np.median(runs)) if runs else 1
    for r in seg: r['shot'] = s + 1
    if len(seg) <= 3: move = 'transition (whip / flash / smear)'   # a fast whip splits into micro-shots: read them as one transition
    shots.append(dict(shot=s + 1, f_in=seg[0]['f'], f_out=seg[-1]['f'], frames=len(seg), seconds=round(dur, 3), cam_move_auto=move,
                      cam_speed_pct_s=round(float(spd), 1), zoom_total_pct=round(zm, 1), pan_total_px=round(tx, 1), tilt_total_px=round(ty, 1),
                      on_twos_median_run=step, still_pct=round(100 * np.mean([r['still'] for r in seg]), 1), subj_motion_p50=round(float(np.median([r['subj_motion'] for r in seg])), 3),
                      luma=round(float(np.mean([r['luma'] for r in seg])), 3), sat=round(float(np.mean([r['sat'] for r in seg])), 3)))

# words (story class: every word timed)
words = []
if cls == 'story':
    wav = os.path.join(out, 'audio.wav'); subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-ac', '1', '-ar', '16000', wav], check=False)
    if os.path.exists(wav):
        from faster_whisper import WhisperModel; import soundfile as sf
        au, sr = sf.read(wav, dtype='float32'); m = WhisperModel('small.en', device='cpu', compute_type='int8')
        segs, _ = m.transcribe(au, word_timestamps=True, condition_on_previous_text=False)
        for sg in segs:
            for wd in sg.words: words.append(dict(w=wd.word.strip(), s=round(wd.start, 3), e=round(wd.end, 3)))
        json.dump(words, open(os.path.join(out, 'words.json'), 'w'), indent=0)
    for r in rows:
        t = r['tc']; r['word'] = next((x['w'] for x in words if x['s'] <= t < x['e']), '')

# csv with the human columns of the class
HUMAN = {'anim': ['phase', 'face', 'event', 'defect', 'note'],
         'story': ['caption', 'on_screen_text', 'event', 'acting', 'face', 'sfx', 'hook_or_loop', 'note']}[cls]
auto = ['f', 'tc', 'shot', 'cut', 'dup', 'cam_tx', 'cam_ty', 'cam_zoom', 'cam_roll', 'subj_motion', 'still', 'luma', 'sat'] + (['word'] if cls == 'story' else [])
with open(os.path.join(out, 'frames.csv'), 'w', newline='') as fh:
    wr = csv.writer(fh); wr.writerow(auto + HUMAN)
    for r in rows: wr.writerow([r.get(k, '') for k in auto] + [''] * len(HUMAN))
with open(os.path.join(out, 'shots.csv'), 'w', newline='') as fh:
    wr = csv.DictWriter(fh, fieldnames=list(shots[0].keys()) + ['size', 'angle', 'lens', 'framing_in_out', 'layers', 'light', 'transition', 'purpose'] + (['narration', 'image_vs_words'] if cls == 'story' else []))
    wr.writeheader(); [wr.writerow(s) for s in shots]

# sheets: every frame in order
fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 11)
tw = 144 if H0 >= W0 else 192; th = round(tw * H0 / W0); per = C * R; nsheet = 0
for b in range(0, N, per):
    pg = Image.new('RGB', (C * tw, R * (th + 14)), '#111'); d = ImageDraw.Draw(pg)
    for k, r in enumerate(rows[b:b + per]):
        x, y = (k % C) * tw, (k // C) * (th + 14)
        pg.paste(Image.open(os.path.join(out, 'frames', f"{r['f']:05d}.jpg")).resize((tw, th)), (x, y))
        if r['cut']: d.rectangle([x, y, x + tw - 1, y + th - 1], outline='#ff2a2a', width=3)
        lab = f"{r['f']} {r['tc']:.2f}s s{r.get('shot', '')}" + (' dup' if r['dup'] else '') + (f" {r['word']}" if r.get('word') else '')
        d.text((x + 2, y + th), lab[:28], font=fnt, fill='#ffd84a' if not r['dup'] else '#8a8a8a')
    pg.save(os.path.join(out, 'sheets', f'{nsheet:03d}.jpg'), quality=85); nsheet += 1

summ = dict(video=src, name=name, cls=cls, fps=fps, frames=N, seconds=round(N / fps, 2), size=[W0, H0], shots=len(shots), sheets=nsheet,
            cuts_per_10s=round(10 * (len(shots) - 1) / max(N / fps, 1e-3), 2), shot_len_s=dict(mean=round(float(np.mean([s['seconds'] for s in shots])), 2), median=round(float(np.median([s['seconds'] for s in shots])), 2), min=min(s['seconds'] for s in shots), max=max(s['seconds'] for s in shots)),
            first_cut_frame=shots[1]['f_in'] if len(shots) > 1 else None, still_pct=round(100 * np.mean([r['still'] for r in rows]), 1), dup_pct=round(100 * np.mean([r['dup'] for r in rows]), 1),
            words=len(words), wpm=round(60 * len(words) / max(N / fps, 1e-3), 1) if words else None, first_word_s=words[0]['s'] if words else None)
json.dump(summ, open(os.path.join(out, 'summary.json'), 'w'), indent=1); print(json.dumps(summ))
