# python3 tools/pull.py <roblox catalog link or id> [...]
# The "plugin": takes catalog links (https://www.roblox.com/catalog/<id>/...) or bare ids, pulls each item into
# assets/roblox/<id>/ (needs ~/.rbx_cookie for community items) and renders it on our male and female R6, front and back,
# into out/pull/<id>.jpg so it can be checked before it goes into the library.
import sys, re, os, json, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.makedirs(f'{ROOT}/out/pull', exist_ok=True)
ids = [int(m) for a in sys.argv[1:] for m in (re.findall(r'catalog/(\d+)', a) or re.findall(r'^\d+$', a))]
subprocess.run(['python3', 'tools/roblox/fetch.py', 'get', *map(str, ids)], cwd=ROOT)
for i in ids:
    m = f'{ROOT}/assets/roblox/{i}/meta.json'
    if not os.path.exists(m): print(i, 'NOT PULLED'); continue
    meta = json.load(open(m)); flat = 'texture' in meta and not meta.get('parts')
    def ch(sex, yaw):
        c = {'face': False, 'sex': sex, 'yaw': yaw}
        if flat: c[{'Shirt': 'shirt', 'Pants': 'pants', 'ShirtGraphic': 'tshirt'}.get(meta['class'], 'shirt')] = f'assets/roblox/{i}/texture.png'
        else: c['accessories'] = [i]
        return c
    spec = {'w': 1400, 'h': 640, 'cols': 4, 'gap': 1.75, 'fov': 24, 'floor': '#9aa5ad', 'cam': {'y': 1.0, 'ly': .9}, 'chars': [ch('m', 25), ch('m', 205), ch('f', 25), ch('f', 205)]}
    subprocess.run(['node', 'tools/shot.mjs', 'sheet.html', json.dumps(spec), f'out/pull/{i}.png'], cwd=ROOT, capture_output=True)
    print(i, meta.get('name') or meta.get('class'), '->', f'out/pull/{i}.png')
