#!/usr/bin/env python3
"""Frame-to-frame motion study (2026-11-25): is anything ever still? who moves, camera or character? is the camera
smooth / handheld? python3 tools/motionstudy.py <video> [--from s] [--to s]
Per consecutive frame pair (all frames, 144 px wide): global camera motion = partial-affine fit of LK feature flow
(pan px/frame, zoom %/frame, roll), character motion = flow residual after removing the camera, plus the plain pixel
difference. Cuts are skipped. Prints the still-frame share, camera vs character share, camera speed / smoothness and
the handheld jitter (high-pass of the camera path)."""
import sys, json, cv2, numpy as np
p = sys.argv[1]; a = sys.argv[2:]
t0 = float(a[a.index('--from') + 1]) if '--from' in a else 0; cy = float(a[a.index('--crop') + 1]) if '--crop' in a else 1.0;   # keep the top cy of the frame (drop burnt captions)
t1 = float(a[a.index('--to') + 1]) if '--to' in a else 1e9
cap = cv2.VideoCapture(p); fps = cap.get(cv2.CAP_PROP_FPS) or 30
rows, prev, i = [], None, -1
while True:
    ok, fr = cap.read(); i += 1
    if not ok: break
    t = i / fps
    if t < t0: continue
    if t > t1: break
    h, w = fr.shape[:2]; fr = fr[:int(h * cy)]; h = fr.shape[0]; g = cv2.cvtColor(cv2.resize(fr, (144, round(144 * h / w))), cv2.COLOR_BGR2GRAY)
    if prev is not None:
        diff = float(np.mean(cv2.absdiff(g, prev)))
        h1 = cv2.calcHist([g], [0], None, [32], [0, 256]); h0 = cv2.calcHist([prev], [0], None, [32], [0, 256])
        cut = cv2.compareHist(h0 / h0.sum(), h1 / h1.sum(), cv2.HISTCMP_BHATTACHARYYA) > .3 or diff > 40
        r = dict(t=t, diff=diff, cut=bool(cut), tx=0., ty=0., zoom=0., rot=0., resid=0.)
        if not cut:
            pts = cv2.goodFeaturesToTrack(prev, 200, .01, 4)
            if pts is not None and len(pts) >= 8:
                nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, pts, None, winSize=(15, 15), maxLevel=2)
                ok_ = st.ravel() == 1; A, B = pts[ok_].reshape(-1, 2), nxt[ok_].reshape(-1, 2)
                if len(A) >= 8:
                    M, inl = cv2.estimateAffinePartial2D(A, B, method=cv2.RANSAC, ransacReprojThreshold=1.0)
                    if M is not None:
                        s = float(np.hypot(M[0, 0], M[1, 0])); r.update(tx=float(M[0, 2] + (s - 1) * 72), ty=float(M[1, 2]), zoom=(s - 1) * 100, rot=float(np.degrees(np.arctan2(M[1, 0], M[0, 0]))))
                        pred = A @ M[:, :2].T + M[:, 2]; res = np.linalg.norm(B - pred, axis=1)
                        r['resid'] = float(np.percentile(res, 90))   # the fastest-moving tenth of the points (characters)
        rows.append(r)
    prev = g
R = [r for r in rows if not r['cut']]
camv = np.array([np.hypot(r['tx'], r['ty']) + abs(r['zoom']) * .72 for r in R]); res = np.array([r['resid'] for r in R]); dif = np.array([r['diff'] for r in R])
CT, RT = .08, .35   # px / frame at 144 px wide: below = not visibly moving
still = (camv < CT) & (res < RT)
camOnly = (camv >= CT) & (res < RT); charOnly = (camv < CT) & (res >= RT); both = (camv >= CT) & (res >= RT)
# handheld: per shot, camera path (cumulative tx, ty) minus a 15-frame moving average
segs, cur = [], []
for r in rows:
    if r['cut']:
        if len(cur) > 20: segs.append(cur)
        cur = []
    else: cur.append(r)
if len(cur) > 20: segs.append(cur)
jit, acc = [], []
for s in segs:
    x = np.cumsum([r['tx'] for r in s]); y = np.cumsum([r['ty'] for r in s]); k = np.ones(15) / 15
    hx = x - np.convolve(x, k, 'same'); hy = y - np.convolve(y, k, 'same'); jit.append(float(np.std(np.hypot(hx, hy)[8:-8])) if len(s) > 30 else 0)
    v = np.hypot(np.diff(x), np.diff(y)); acc.append(float(np.mean(np.abs(np.diff(v)))) if len(v) > 2 else 0)
out = dict(video=p.split('/')[-1], frames=len(rows), cuts=sum(r['cut'] for r in rows), shotLenMedian=float(np.median([len(s) / fps for s in segs])) if segs else 0,
           stillPct=round(100 * still.mean(), 1), camOnlyPct=round(100 * camOnly.mean(), 1), charOnlyPct=round(100 * charOnly.mean(), 1), bothPct=round(100 * both.mean(), 1),
           camSpeedPxPerFrame_p50_p90=[round(float(np.percentile(camv, q)), 3) for q in (50, 90)], zoomPctPerS_p50=round(float(np.median(np.abs([r['zoom'] for r in R]))) * fps, 2),
           charMotion_p50_p90=[round(float(np.percentile(res, q)), 3) for q in (50, 90)], handheldJitterPx_p50=round(float(np.median(jit)), 3) if jit else 0,
           camAccel_p50=round(float(np.median(acc)), 4) if acc else 0, longestStillRunFrames=int(max((len(x) for x in ''.join('1' if s else '0' for s in still).split('0')), default=0)))
print(json.dumps(out))
