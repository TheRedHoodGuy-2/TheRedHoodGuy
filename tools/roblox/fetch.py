"""Roblox catalog -> files Three.js can load.
  python3 fetch.py search "<keyword>" [assetTypeId|0] [limit] [creator]   list catalog items (41 = hair, 8 = hat, 11 shirt, 12 pants, 18 face ...)
  python3 fetch.py get <assetId> [<assetId> ...]               download + convert into assets/roblox/<id>/ (model.glb, meta.json, texture.png)
No login needed. Raw downloads are cached in ~/.cache/rbx."""
import os, sys, json, gzip, io, time, requests
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rbxm, rbxmesh
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'roblox'); CACHE = os.path.expanduser('~/.cache/rbx'); os.makedirs(CACHE, exist_ok=True)
S = requests.Session(); S.headers['User-Agent'] = 'Roblox/WinInet'

def raw(aid):
    p = os.path.join(CACHE, str(aid))
    if os.path.exists(p): return open(p, 'rb').read()
    for attempt in range(4):
        r = S.get('https://assetdelivery.roblox.com/v1/asset/', params={'id': aid}, timeout=40)
        if r.status_code == 200: break
        time.sleep(2 + attempt * 3)
    r.raise_for_status(); d = r.content
    if d[:2] == b'\x1f\x8b': d = gzip.decompress(d)
    open(p, 'wb').write(d); return d

def search(keyword, asset_type=None, limit=30, creator=None, free_only=False, pages=3):
    """Keyword search. asset_type filters locally (41 hair, 8 hat, 42 face acc, 43 neck, 44 shoulder, 45 front, 46 back, 47 waist)."""
    out = []; cursor = None
    for _ in range(pages):
        params = {'Keyword': keyword, 'Limit': 30, 'IncludeNotForSale': 'true'}
        if creator: params['CreatorName'] = creator
        if cursor: params['Cursor'] = cursor
        r = S.get('https://catalog.roblox.com/v1/search/items/details', params=params, timeout=40)
        if r.status_code == 429: time.sleep(8); continue
        r.raise_for_status(); j = r.json()
        for d in j.get('data', []):
            if asset_type and d.get('assetType') != asset_type: continue
            if free_only and d.get('price') not in (0, None): continue
            out.append(dict(id=d['id'], name=d.get('name'), type=d.get('assetType'), creator=d.get('creatorName'), price=d.get('price')))
        cursor = j.get('nextPageCursor')
        if not cursor or len(out) >= limit: break
    return out[:limit]

def mat3(rot): return np.array(rot, np.float64).reshape(3, 3) if rot else np.eye(3)

def convert(aid):
    import trimesh
    from PIL import Image
    inst = rbxm.parse(raw(aid)); by = {i['id']: i for i in inst}; kids = lambda p: [i for i in inst if i['parent'] == p['id']]
    top = [i for i in inst if i['parent'] == -1][0]; d = os.path.join(OUT, str(aid)); os.makedirs(d, exist_ok=True)
    meta = {'id': aid, 'class': top['class'], 'name': top['props'].get('Name'), 'parts': []}
    if top['class'] in ('Shirt', 'Pants', 'ShirtGraphic', 'Decal'):
        key = {'Shirt': 'ShirtTemplate', 'Pants': 'PantsTemplate', 'ShirtGraphic': 'Graphic', 'Decal': 'Texture'}[top['class']]
        tid = rbxm.asset_id(top['props'].get(key)); img = Image.open(io.BytesIO(raw(tid))).convert('RGBA'); img.save(os.path.join(d, 'texture.png'))
        meta['texture'] = 'texture.png'; meta['size'] = img.size
    else:
        handles = [i for i in inst if i['class'] in ('Part', 'MeshPart') and i['props'].get('Name') == 'Handle'] or [i for i in inst if i['class'] in ('Part', 'MeshPart')]
        for hi, h in enumerate(handles):
            pr = h['props']; sm = next((k for k in kids(h) if k['class'] == 'SpecialMesh'), None)
            if h['class'] == 'MeshPart':
                mid = rbxm.asset_id(pr.get('MeshId') or pr.get('MeshContent')); tid = rbxm.asset_id(pr.get('TextureID') or pr.get('TextureContent'))
                size = pr.get('size') or pr.get('Size'); init = pr.get('InitialSize'); scale = np.array(size) / np.array(init) if size and init else np.ones(3); off = np.zeros(3)
            elif sm:
                mid = rbxm.asset_id(sm['props'].get('MeshId')); tid = rbxm.asset_id(sm['props'].get('TextureId')); scale = np.array(sm['props'].get('Scale', (1, 1, 1))); off = np.array(sm['props'].get('Offset', (0, 0, 0)))
            else: continue
            if not mid: continue
            m = rbxmesh.parse(raw(mid)); v = m['v'].astype(np.float64) * scale + off
            name = 'model.glb' if hi == 0 else f'model{hi}.glb'; tex = None
            visual = None
            if tid:
                try:
                    img = Image.open(io.BytesIO(raw(tid))).convert('RGBA'); tex = 'texture.png' if hi == 0 else f'texture{hi}.png'; img.save(os.path.join(d, tex))
                    mat = trimesh.visual.material.PBRMaterial(baseColorTexture=img, metallicFactor=0.0, roughnessFactor=0.6)
                    visual = trimesh.visual.TextureVisuals(uv=np.column_stack([m['uv'][:, 0], 1.0 - m['uv'][:, 1]]), material=mat)
                except Exception as e: meta.setdefault('warnings', []).append(f'texture {tid}: {e}')
            tm = trimesh.Trimesh(vertices=v, faces=m['f'], vertex_normals=m['n'], visual=visual, process=False)
            tm.export(os.path.join(d, name))
            atts = [{'name': k['props'].get('Name'), 'pos': list(k['props']['CFrame']['pos']), 'rot': k['props']['CFrame']['rot']} for k in kids(h) if k['class'] == 'Attachment' and 'CFrame' in k['props']]
            col = pr.get('Color3uint8'); vc = sm['props'].get('VertexColor') if sm else None
            meta['parts'].append({'file': name, 'texture': tex, 'meshVersion': m['version'], 'verts': int(len(v)), 'tris': int(len(m['f'])), 'attachments': atts,
                                  'color': list(col) if col else None, 'vertexColor': list(vc) if vc else None, 'bounds': [v.min(0).round(3).tolist(), v.max(0).round(3).tolist()]})
        meta['accessoryType'] = top['props'].get('AccessoryType')
    json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'), indent=1); return meta

if __name__ == '__main__':
    if sys.argv[1] == 'search':
        for r in search(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 and sys.argv[3] != '0' else None, int(sys.argv[4]) if len(sys.argv) > 4 else 30, sys.argv[5] if len(sys.argv) > 5 else None): print(r['id'], '|', r['type'], '|', r['name'], '|', r['creator'], '|', r['price'])
    else:
        for a in sys.argv[2:]:
            try: m = convert(int(a)); print(a, m['class'], m['name'], [(p['meshVersion'], p['tris'], [x['name'] for x in p['attachments']]) for p in m.get('parts', [])] or m.get('size'))
            except Exception as e: print(a, 'FAILED', repr(e)[:200])
