# python3 tools/pull.py <any Roblox link or id> [...]
# ONE pull tool for everything (2026-11-18): catalog links (clothing, hair, accessories) AND Creator Store links
# (https://create.roblox.com/store/asset/<id>/..., roblox.com/library/<id>/...: furniture, props, buildings).
# The asset type is looked up, then it goes to the right converter: catalog items -> fetch.py + a check render on our
# R6 bodies; models -> roblox/models.py (unions included) + a check render next to our R6, out/pull/<id>.png.
# The "plugin": takes catalog links (https://www.roblox.com/catalog/<id>/...) or bare ids, pulls each item into
# assets/roblox/<id>/ (needs ~/.rbx_cookie for community items) and renders it on our male and female R6, front and back,
# into out/pull/<id>.jpg so it can be checked before it goes into the library.
import sys, re, os, json, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.makedirs(f'{ROOT}/out/pull', exist_ok=True)
ids = [int(m) for a in sys.argv[1:] for m in (re.findall(r'(?:catalog|asset|library|bundles)/(\d+)', a) or re.findall(r'^\d+$', a))]
sys.path.insert(0, f'{ROOT}/tools/roblox'); import fetch
def atype(i):
    try: return fetch.S.get(f'https://economy.roblox.com/v2/assets/{i}/details', timeout=30).json().get('AssetTypeId')
    except Exception: return None
models = [i for i in ids if atype(i) == 10]; ids = [i for i in ids if i not in models]
if models:
    subprocess.run(['python3', 'tools/roblox/models.py', 'get', *map(str, models)], cwd=ROOT)
    for i in models:
        if os.path.exists(f'{ROOT}/assets/rbxmodels/{i}/model.glb'):
            subprocess.run(['node', 'tools/shot.mjs', 'modelsheet.html', json.dumps({'w': 900, 'h': 600, 'cols': 1, 'ids': [i]}), f'out/pull/{i}.png'], cwd=ROOT, capture_output=True)
            print(i, 'model ->', f'out/pull/{i}.png')
        else: print(i, 'MODEL NOT PULLED')
if ids: subprocess.run(['python3', 'tools/roblox/fetch.py', 'get', *map(str, ids)], cwd=ROOT)
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
