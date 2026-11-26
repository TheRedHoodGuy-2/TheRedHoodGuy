# python3 tools/ph_hires.py <texture list> [--res 2k]  -> assets_up4/assets/ph/... the same Poly Haven maps at 2K
# (DECISIONS 2026-11-25 03:44: finals pull Poly Haven at 2K/4K). Served instead of the 1K files when HITEX=1.
import json, os, sys, urllib.request, re
res = sys.argv[sys.argv.index('--res') + 1] if '--res' in sys.argv else '2k'
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'trhg-studio'}), timeout=120).read()
NAME = {'diffuse.jpg': ['Diffuse', 'col_01'], 'nor_gl.jpg': ['nor_gl'], 'rough.jpg': ['Rough'], 'ao.jpg': ['AO'], 'displacement.jpg': ['Displacement']}
cache = {}
for line in open(sys.argv[1]):
    f = line.strip(); m = re.match(r'assets/ph/([^/]+)/(.+)$', f)
    if not m: continue
    a, rel = m.groups(); dst = os.path.join('assets_up4', f)
    if os.path.exists(dst): continue
    files = cache.get(a) or json.loads(get(f'https://api.polyhaven.com/files/{a}')); cache[a] = files; url = None
    if rel in NAME:
        for k in NAME[rel]:
            if k in files and res in files[k]: url = files[k][res]['jpg']['url']; break
    elif re.match(r'col_0\d\.jpg', rel):
        k = rel[:-4]; url = files.get(k, {}).get(res, {}).get('jpg', {}).get('url')
    elif rel.startswith('textures/'):   # model textures: <a>_<map>_1k.jpg -> the same map at 2k
        inc = files.get('gltf', {}).get(res, {}).get('gltf', {}).get('include', {}); want = rel.replace('_1k', '_' + res)
        url = inc.get(want, {}).get('url')
        if not url and '_alpha_' in rel and 'Alpha' in files and res in files['Alpha']: url = files['Alpha'][res]['jpg']['url']
    if not url: print('skip', f); continue
    os.makedirs(os.path.dirname(dst), exist_ok=True); open(dst, 'wb').write(get(url)); print('2k', f)
