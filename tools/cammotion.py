#!/usr/bin/env python3
"""Camera-move study (2026-11-19): cut detection + per-shot global motion (pan x/y, zoom) from optical flow.
python3 tools/cammotion.py <video> [more videos...]  -> per-shot table + move-type stats (JSON on the last line)."""
import sys, json, cv2, numpy as np

def analyse(path, fps_s=12):
    cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS) or 30; step = max(1, round(fps / fps_s))
    prev, i, shots, cur, hist0 = None, 0, [], None, None
    while True:
        ok, fr = cap.read()
        if not ok: break
        if i % step: i += 1; continue
        g = cv2.cvtColor(cv2.resize(fr, (180, 320)), cv2.COLOR_BGR2GRAY); t = i / fps
        h = cv2.calcHist([g], [0], None, [32], [0, 256]); h = h / h.sum()
        cut = prev is None or cv2.compareHist(hist0, h, cv2.HISTCMP_BHATTACHARYYA) > .32
        if not cut:
            fl = cv2.calcOpticalFlowFarneback(prev, g, None, .5, 3, 15, 3, 5, 1.2, 0)
            dx, dy = float(np.median(fl[..., 0])), float(np.median(fl[..., 1]))
            ys, xs = np.mgrid[0:320, 0:180]; rx, ry = xs - 90, ys - 160; r2 = rx * rx + ry * ry + 1
            zoom = float(np.median((fl[..., 0] * rx + fl[..., 1] * ry) / r2)) * 100
            if np.median(np.abs(fl)) > 9: cut = True   # flow blew up: a cut the histogram missed
        if cut:
            if cur and cur['n']: shots.append(cur)
            cur = dict(t0=round(t, 2), n=0, dx=0., dy=0., z=0.)
        else:
            cur['n'] += 1; cur['dx'] += dx; cur['dy'] += dy; cur['z'] += zoom
        prev, hist0 = g, h; i += 1
    if cur and cur['n']: shots.append(cur)
    out = []
    for s in shots:
        d = s['n'] / fps_s; vx, vy, vz = s['dx'] / d / 180, s['dy'] / d / 320, s['z'] / d   # frame widths per s, zoom %/s
        mv = 'push' if vz > 2.5 else 'pull' if vz < -2.5 else 'pan/truck R' if vx < -.06 else 'pan/truck L' if vx > .06 else 'tilt/crane' if abs(vy) > .05 else 'hold/drift'
        speed = max(abs(vx) / .06, abs(vz) / 2.5, abs(vy) / .05)
        out.append(dict(t0=s['t0'], dur=round(d, 2), move=mv, speed=round(speed, 2), vx=round(vx, 3), vy=round(vy, 3), zoom=round(vz, 2)))
    return out

if __name__ == '__main__':
    allshots = []
    for p in [a for a in sys.argv[1:] if not a.startswith('--')]:
        S = analyse(p); allshots += S
        print(p.split('/')[-1], len(S), 'shots, median', round(float(np.median([s['dur'] for s in S])), 2), 's')
    from collections import Counter
    c = Counter(s['move'] for s in allshots); n = len(allshots)
    rep = dict(shots=n, moves={k: round(v / n, 3) for k, v in c.most_common()},
               medianDur=round(float(np.median([s['dur'] for s in allshots])), 2),
               speed_p25_p50_p90=[round(float(np.percentile([s['speed'] for s in allshots], q)), 2) for q in (25, 50, 90)],
               sameMoveTwiceInARow=round(sum(allshots[i]['move'] == allshots[i - 1]['move'] for i in range(1, n)) / max(1, n - 1), 3))
    pz = [s['zoom'] for s in allshots if s['move'] == 'push']; pv = [abs(s['vx']) for s in allshots if 'pan' in s['move']]
    rep['pushZoomPctPerS_p10_p50_p90'] = [round(float(np.percentile(pz, q)), 1) for q in (10, 50, 90)] if pz else []
    rep['panFrameWidthsPerS_p50_p90'] = [round(float(np.percentile(pv, q)), 2) for q in (50, 90)] if pv else []
    rep['durs_p10_p50_p90'] = [round(float(np.percentile([s['dur'] for s in allshots], q)), 2) for q in (10, 50, 90)]
    print(json.dumps(rep))
    if '--seq' in sys.argv[0:1] or True: print('SEQ', ' '.join(f"{s['move'][:4]}{s['speed']:.1f}/{s['dur']}" for s in allshots[:40]))
