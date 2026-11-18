# pulls every 3D clothing item from the R6 search (most favourited first), keeps the ones shaped for R6, deletes the rest
import json, os, subprocess, shutil, sys
R = '/home/claude/theredhoodguy/assets/roblox'; os.chdir('/home/claude/theredhoodguy')
idx = json.load(open('/home/claude/r6/index.json')); res0 = json.load(open('/home/claude/r6/r6.json')) if os.path.exists('/home/claude/r6/r6.json') else {}
res = dict(res0)
def fit(m):
    p = (m.get('parts') or [None])[0]
    if not p or not p.get('bounds'): return None
    (x0, y0, z0), (x1, y1, z1) = p['bounds']; hw, hh, hd = (x1 - x0) / 2, (y1 - y0) / 2, (z1 - z0) / 2; att = (p.get('attachments') or [{'name': ''}])[0]['name']
    if att.startswith('BodyFront') or att.startswith('Neck') or att.startswith('BodyBack'):
        return 'top' if 1.95 <= hw <= 2.8 and .95 <= hh <= 1.6 and hd <= 1.3 else None
    if att.startswith('Waist'):
        return 'bottom' if .95 <= hw <= 1.6 and .8 <= hh <= 1.6 and hd <= 1.2 else None
    return None
W, N = int(sys.argv[1]), int(sys.argv[2])
todo = [v for v in sorted(idx.values(), key=lambda x: -(x.get('fav') or 0)) if str(v['id']) not in res][W::N]
for k in range(0, len(todo), 20):
    batch = todo[k:k + 20]; new = [str(v['id']) for v in batch if not os.path.exists(f"{R}/{v['id']}/meta.json")]
    if new: subprocess.run(['python3', 'tools/roblox/fetch.py', 'get', *new], capture_output=True)
    for v in batch:
        i = str(v['id']); mp = f'{R}/{i}/meta.json'
        if not os.path.exists(mp): res[i] = 'failed'; continue
        f = fit(json.load(open(mp))); res[i] = f or 'not r6'
        if not f and i in new: shutil.rmtree(f'{R}/{i}', ignore_errors=True)
    json.dump(res, open(f'/home/claude/r6/r6_{W}.json', 'w'))
    print(k + len(batch), 'of', len(todo), 'kept', sum(1 for x in res.values() if x in ('top', 'bottom')), flush=True)
