"""python3 tools/polyhaven.py <asset> [<asset> ...] [--res 1k|2k]
Downloads Poly Haven assets (CC0, no account needed) into kit/assets/ph/<asset>/.
  models   -> <asset>.gltf + .bin + textures (Normal GL)
  textures -> diff / nor_gl / rough (+ ao, disp if present) as jpg
  hdris    -> <asset>.hdr
Load in a topic with U.ph helpers in kit/assets.js."""
import json, os, sys, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
res = sys.argv[sys.argv.index('--res') + 1] if '--res' in sys.argv else '1k'
if res in args: args.remove(res)
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'trhg-studio'}), timeout=120).read()
for a in args:
    info = json.loads(get(f'https://api.polyhaven.com/info/{a}')); files = json.loads(get(f'https://api.polyhaven.com/files/{a}'))
    d = os.path.join(ROOT, 'assets', 'ph', a); os.makedirs(d, exist_ok=True)
    def save(url, rel):
        p = os.path.join(d, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
        if not os.path.exists(p): open(p, 'wb').write(get(url))
    kind = info['type']   # 0 hdri, 1 texture, 2 model
    if kind == 0:
        save(files['hdri'][res]['hdr']['url'], f'{a}.hdr')
    elif kind == 1:
        for m in ['Diffuse', 'nor_gl', 'Rough', 'AO', 'Displacement']:
            if m in files and res in files[m]:
                save(files[m][res]['jpg']['url'], f'{m.lower()}.jpg')
        for k in ['col_01', 'col_02', 'col_03', 'col_04']:   # colour variants (fabric patterns): col_01 doubles as diffuse.jpg
            if k in files and res in files[k]:
                save(files[k][res]['jpg']['url'], f'{k}.jpg')
                if k == 'col_01' and 'Diffuse' not in files: save(files[k][res]['jpg']['url'], 'diffuse.jpg')
    else:
        g = files['gltf'][res]['gltf']; save(g['url'], f'{a}.gltf')
        for rel, v in g.get('include', {}).items(): save(v['url'], rel)
        if 'Alpha' in files and res in files['Alpha']: save(files['Alpha'][res]['jpg']['url'], f'textures/{a}_alpha_{res}.jpg')   # gltf jpgs carry no alpha; foliage needs this cut-out map
    print(a, ['hdri', 'texture', 'model'][kind], res, '->', os.path.relpath(d, ROOT))
