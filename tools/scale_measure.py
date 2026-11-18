"""Measure real Roblox builds (Creator Store houses, rooms, furniture kits) to set our scale standard from data, not
guesses (Xavier 2026-11-18). For every named sub-model or part whose name says what it is (door, bed, chair/seat,
table, desk, counter, sofa, wall, window, stairs...), take its world bounding box in studs; for chairs and sofas also
the top of the Seat part above the model's bottom (= seat height); for beds the top of the mattress.
  python3 tools/scale_measure.py <assetId> [...]  -> research/scale_data.json + a median table on stdout"""
import sys, os, json, re
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'roblox')); import fetch, rbxm
KINDS = {'door': r'\bdoors?\b|doorframe|door_', 'bed': r'\bbed\b|bed\d|_bed|bed_', 'chair': r'chair|stool', 'sofa': r'sofa|couch',
         'table': r'\btable\b|table\d|coffee', 'desk': r'\bdesk', 'counter': r'counter|kitchen ?top|worktop', 'window': r'window',
         'wall': r'^wall|wall\d|walls?$', 'stairs': r'stair|step', 'fridge': r'fridge|refrigerator', 'toilet': r'toilet', 'tv': r'\btv\b|television'}
PARTS = ('Part', 'MeshPart', 'WedgePart', 'CornerWedgePart', 'UnionOperation', 'Seat', 'VehicleSeat', 'TrussPart')
def box(p):
    pr = p['props']; s = np.array(pr.get('size') or pr.get('Size') or (1, 1, 1), float) / 2; cf = pr.get('CFrame')
    if not cf: return None
    R = np.array(cf['rot'] or np.eye(3).ravel(), float).reshape(3, 3); c = np.array(cf['pos'])
    corners = np.array([[x, y, z] for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]) * s
    w = corners @ R.T + c; return w.min(0), w.max(0)
def measure(aid):
    inst = rbxm.parse(fetch.raw(aid)); by = {i['id']: i for i in inst}; kids = {}
    for i in inst: kids.setdefault(i['parent'], []).append(i)
    def leaves(n): out = []; st = [n]
    while False: pass
    def parts_under(n):
        out, st = [], [n]
        while st:
            x = st.pop()
            if x['class'] in PARTS and (x['props'].get('Transparency') or 0) < .95: out.append(x)
            st += kids.get(x['id'], [])
        return out
    found = []
    for i in inst:
        name = (i['props'].get('Name') or '').lower()
        kind = next((k for k, r in KINDS.items() if re.search(r, name)), None)
        if not kind or i['class'] not in ('Model', 'Folder', *PARTS): continue
        # skip a node whose parent already matched the same kind (count each object once)
        a, dup = by.get(i['parent']), False   # count each object once: skip it if ANY ancestor is already the same kind
        while a:
            if re.search(KINDS[kind], (a['props'].get('Name') or '').lower()): dup = True; break
            a = by.get(a['parent'])
        if dup: continue
        ps = parts_under(i) if i['class'] in ('Model', 'Folder') else [i]
        bs = [b for b in map(box, ps) if b]
        if not bs: continue
        lo = np.min([b[0] for b in bs], 0); hi = np.max([b[1] for b in bs], 0); sz = hi - lo
        if max(sz) < 1.2 or (kind not in ('wall', 'window', 'door') and i['class'] not in ('Model', 'Folder') and kind != 'counter'): continue   # a leg or a knob, not the thing
        rec = {'asset': aid, 'kind': kind, 'name': name, 'w': round(float(max(sz[0], sz[2])), 2), 'd': round(float(min(sz[0], sz[2])), 2), 'h': round(float(sz[1]), 2)}
        if kind == 'bed':   # mattress top: the highest big flat part below the headboard height
            tops = sorted(b[1][1] - lo[1] for b in bs if (b[1][0] - b[0][0]) * (b[1][2] - b[0][2]) > .3 * sz[0] * sz[2]); rec['mattress_top'] = round(float(tops[-1]), 2) if tops else None
        seats = [p for p in ps if p['class'] in ('Seat', 'VehicleSeat')]
        if seats: sb = box(seats[0]); rec['seat_top'] = round(float(sb[1][1] - lo[1]), 2)
        found.append(rec)
    return found
if __name__ == '__main__':
    allr = []
    for a in map(int, sys.argv[1:]):
        try: r = measure(a); allr += r; print(a, len(r), 'objects', flush=True)
        except Exception as e: print(a, 'FAILED', repr(e)[:120])
    json.dump(allr, open('research/scale_data.json', 'w'), indent=0)
    print('\nkind      n   median w x d x h (studs)      seat / mattress top')
    for k in KINDS:
        rs = [r for r in allr if r['kind'] == k]
        if not rs: continue
        med = lambda f: round(float(np.median([r[f] for r in rs])), 1)
        st = [r['seat_top'] for r in rs if 'seat_top' in r] or [r['mattress_top'] for r in rs if r.get('mattress_top')]
        print(f"{k:9s} {len(rs):3d}   {med('w')} x {med('d')} x {med('h')}        {round(float(np.median(st)),2) if st else '-'}")
