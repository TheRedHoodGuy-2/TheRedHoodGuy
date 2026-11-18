"""Roblox Creator Store MODELS (furniture, props, buildings) -> one .glb our engine re-skins with our materials.
  python3 tools/roblox/models.py search "<keyword>" [limit]        Creator Store search (needs the cookie in ~/.rbx_cookie)
  python3 tools/roblox/models.py get <assetId|store link> [...]   download + convert into assets/rbxmodels/<id>/
What it does (2026-11-18):
- reads every visible part of the model: Part (block / ball / cylinder), WedgePart, CornerWedgePart, MeshPart, Parts with
  a SpecialMesh; skips invisible parts; Unions (CSG) cannot be read yet -> counted in meta as 'unions_skipped'.
- bakes all parts into world space, merged per (Roblox material, colour) so a model is a few draw calls, not hundreds.
- Roblox space -> ours: 1 stud = 0.34 m (the same as our R6, so Roblox furniture is the right size for our people
  automatically), rotated 180 deg about y (Roblox fronts face -Z, ours face +Z), sitting on y = 0, centred in x / z.
- each mesh is named 'mat~<RobloxMaterial>~<hex colour>' -> engine/rbxmodel.js gives it our library material.
Textures are NOT used (Xavier: strip their textures, use ours); mesh texture ids are kept in meta for later."""
import os, sys, json, re
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch, rbxm, rbxmesh
ROOT = fetch.ROOT; OUT = os.path.join(ROOT, 'assets', 'rbxmodels'); LIB = os.path.join(ROOT, 'library', 'models.json')
STUD = 0.34
MATERIALS = {256: 'Plastic', 272: 'SmoothPlastic', 288: 'Neon', 512: 'Wood', 528: 'WoodPlanks', 784: 'Marble', 788: 'Basalt', 800: 'Slate',
             804: 'CrackedLava', 816: 'Concrete', 820: 'Limestone', 832: 'Granite', 836: 'Pavement', 848: 'Brick', 864: 'Pebble', 880: 'Cobblestone',
             896: 'Rock', 912: 'Sandstone', 1040: 'CorrodedMetal', 1056: 'DiamondPlate', 1072: 'Foil', 1088: 'Metal', 1280: 'Grass', 1284: 'LeafyGrass',
             1296: 'Sand', 1312: 'Fabric', 1328: 'Snow', 1344: 'Mud', 1360: 'Ground', 1376: 'Asphalt', 1392: 'Salt', 1536: 'Ice', 1552: 'Glacier',
             1568: 'Glass', 1584: 'ForceField'}
PART_CLASSES = ('Part', 'MeshPart', 'WedgePart', 'CornerWedgePart', 'TrussPart', 'Seat', 'VehicleSeat', 'SpawnLocation')

def store_search(keyword, limit=30):
    r = fetch.S.get('https://apis.roblox.com/toolbox-service/v1/marketplace/10', params={'keyword': keyword, 'limit': min(limit, 100)}, timeout=40); r.raise_for_status()
    ids = [d['id'] for d in r.json().get('data', [])][:limit]
    if not ids: return []
    r2 = fetch.S.get('https://apis.roblox.com/toolbox-service/v1/items/details', params={'assetIds': ','.join(map(str, ids))}, timeout=40); r2.raise_for_status()
    return [dict(id=d['asset']['id'], name=d['asset'].get('name'), creator=d.get('creator', {}).get('name')) for d in r2.json().get('data', [])]

def box(sx, sy, sz):
    import trimesh; return trimesh.creation.box(extents=(sx, sy, sz))
def wedge(sx, sy, sz):   # Roblox wedge: full bottom, high edge at the back (+z), slope down to the front (-z)
    import trimesh; x, y, z = sx / 2, sy / 2, sz / 2
    v = np.array([[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z], [-x, y, z], [x, y, z]])
    f = np.array([[0, 2, 1], [0, 3, 2], [3, 4, 5], [3, 5, 2], [0, 1, 5], [0, 5, 4], [0, 4, 3], [1, 2, 5]])
    return trimesh.Trimesh(v, f, process=True)
def corner_wedge(sx, sy, sz):
    import trimesh; x, y, z = sx / 2, sy / 2, sz / 2
    v = np.array([[-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z], [x, y, -z]])
    return trimesh.Trimesh(v, np.array([[0, 2, 1], [0, 3, 2], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]]), process=True)
def cylinder(sx, sy, sz):   # Roblox cylinders run along X
    import trimesh; m = trimesh.creation.cylinder(radius=.5, height=1, sections=32)
    m.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, [0, 1, 0])); m.apply_scale((sx, min(sy, sz), min(sy, sz))); return m
def ball(sx, sy, sz):
    import trimesh; m = trimesh.creation.icosphere(subdivisions=3, radius=.5); m.apply_scale((sx, sy, sz)); return m

# UNIONS (CSG): the union's mesh is stored in its MeshData (or the asset its AssetId points to) as a 'CSGMDL' file,
# XOR-obfuscated with a fixed 31-byte key (found 2026-11-18 by byte-frequency analysis: the decoded header reads CSGMDL).
# v4 layout: 'CSGMDL', int version, 16-char hash, 16 unknown bytes, int vertex count, int stride (84), vertices
# (pos 3f, normal 3f, packed colour, pad, uv 2f, tangent...), int index count, int32 indices.
CSG_KEY = b'V.nX1 0\x044i\x0cw\x0c\x01^\x00\x1a`7i\x1dR+\x07O$YeS\x04z'
def csg_mesh(data):
    import struct
    if data[:6] != b'CSGMDL': data = bytes(b ^ CSG_KEY[i % 31] for i, b in enumerate(data))
    if data[:6] != b'CSGMDL': raise ValueError('not a CSG mesh')
    ver = struct.unpack_from('<i', data, 6)[0]; o = 6 + 4 + 16 + 16
    nv, st = struct.unpack_from('<ii', data, o); o += 8
    if st < 32 or nv <= 0 or o + nv * st > len(data): raise ValueError(f'CSG v{ver}: unexpected layout nv={nv} stride={st}')
    V = np.frombuffer(data, dtype=np.float32, count=nv * st // 4, offset=o).reshape(nv, st // 4); o += nv * st
    ni = struct.unpack_from('<i', data, o)[0]; o += 4
    I = np.frombuffer(data, dtype=np.int32, count=ni, offset=o).reshape(-1, 3)
    return V[:, :3].astype(float), I
def union_mesh(p, warn):
    import trimesh
    pr = p['props']; data = pr.get('MeshData')
    if not isinstance(data, (bytes, bytearray)) or len(data) < 64:
        aid = rbxm.asset_id(pr.get('AssetId'))
        if not aid: return None
        try: data = fetch.raw(aid)
        except Exception as e: warn.append(f'union asset {aid}: {e}'); return None
        if data[:7] == b'<roblox':   # newer unions: the asset is a small model file (PartOperationAsset) holding the MeshData
            md = [i['props'].get('MeshData') for i in rbxm.parse(data)]; md = [m for m in md if isinstance(m, (bytes, bytearray)) and len(m) > 64]
            if not md: warn.append(f'union asset {aid}: no MeshData inside'); return None
            data = md[0]
    try: v, f = csg_mesh(bytes(data))
    except Exception as e: warn.append(f'union: {e}'); return None
    size = np.array(pr.get('size') or pr.get('Size') or (1, 1, 1), float); init = np.array(pr.get('InitialSize') or (v.max(0) - v.min(0)), float)
    return trimesh.Trimesh(v * size / np.where(init == 0, 1, init), f, process=False)

def part_mesh(p, kids, warn):
    import trimesh
    pr = p['props']; size = np.array(pr.get('size') or pr.get('Size') or (1, 1, 1), float); cls = p['class']
    sm = next((k for k in kids if k['class'] == 'SpecialMesh'), None)
    if cls == 'MeshPart':
        mid = rbxm.asset_id(pr.get('MeshId') or pr.get('MeshContent'))
        if not mid: return None
        try: m = rbxmesh.parse(fetch.raw(mid))
        except Exception as e: warn.append(f'mesh {mid}: {e}'); return None
        v = m['v'].astype(float); init = np.array(pr.get('InitialSize') or (v.max(0) - v.min(0)), float); v *= size / np.where(init == 0, 1, init)
        return trimesh.Trimesh(v, m['f'], process=False)
    if sm is not None:
        mt = sm['props'].get('MeshType', 5); sc = np.array(sm['props'].get('Scale', (1, 1, 1)), float); off = np.array(sm['props'].get('Offset', (0, 0, 0)), float)
        if mt == 5:   # FileMesh
            mid = rbxm.asset_id(sm['props'].get('MeshId'))
            if not mid: return None
            try: m = rbxmesh.parse(fetch.raw(mid))
            except Exception as e: warn.append(f'mesh {mid}: {e}'); return None
            return trimesh.Trimesh(m['v'].astype(float) * sc + off, m['f'], process=False)
        prim = {0: ball, 1: box, 2: cylinder, 3: ball, 6: box}.get(mt, box)   # Head / Torso / Brick / Cylinder / Sphere / Wedge-ish
        g = prim(*(size * sc)); g.apply_translation(off); return g
    if cls == 'WedgePart': return wedge(*size)
    if cls == 'CornerWedgePart': return corner_wedge(*size)
    shape = pr.get('shape', pr.get('Shape', 1))
    return {0: ball, 1: box, 2: cylinder, 3: wedge, 4: corner_wedge}.get(shape, box)(*size)

def convert(aid):
    import trimesh
    inst = rbxm.parse(fetch.raw(aid)); kids = {}
    for i in inst: kids.setdefault(i['parent'], []).append(i)
    warn, groups, stats = [], {}, {'parts': 0, 'skipped_invisible': 0, 'unions_skipped': 0, 'decals': 0}
    top = next((i for i in inst if i['parent'] == -1), None)
    for p in inst:
        if p['class'] == 'NegateOperation': continue
        if p['class'] in ('UnionOperation', 'PartOperation'):
            if (p['props'].get('Transparency') or 0) >= .95: stats['skipped_invisible'] += 1; continue
            g = union_mesh(p, warn)
            if g is None: stats['unions_skipped'] += 1; continue
            stats['unions'] = stats.get('unions', 0) + 1
        elif p['class'] in ('Decal', 'Texture'): stats['decals'] += 1; continue
        elif p['class'] not in PART_CLASSES: continue
        else: g = None
        pr = p['props']
        if g is None:
            if (pr.get('Transparency') or 0) >= .95: stats['skipped_invisible'] += 1; continue
            g = part_mesh(p, kids.get(p['id'], []), warn)
        if g is None or not len(g.faces): continue
        cf = pr.get('CFrame') or {'pos': (0, 0, 0), 'rot': None}; R = np.array(cf['rot'] or np.eye(3).ravel(), float).reshape(3, 3)
        M = np.eye(4); M[:3, :3] = R; M[:3, 3] = cf['pos']; g.apply_transform(M)
        mat = MATERIALS.get(pr.get('Material'), 'Plastic'); col = pr.get('Color3uint8') or (163, 162, 165)
        key = f'mat~{mat}~{"%02x%02x%02x" % tuple(col)}'; groups.setdefault(key, []).append(g); stats['parts'] += 1   # '~': three.js strips ':' from node names
    if not groups: raise RuntimeError(f'no readable parts ({stats})')
    meshes = {k: trimesh.util.concatenate(v) for k, v in groups.items()}
    allv = np.vstack([m.vertices for m in meshes.values()]); lo, hi = allv.min(0), allv.max(0); c = (lo + hi) / 2
    T = np.diag([-STUD, STUD, -STUD, 1.0]); T[:3, 3] = [c[0] * STUD, -lo[1] * STUD, c[2] * STUD]   # to metres, turn 180 deg, floor at 0, centred
    sc = trimesh.Scene()
    for k, m in meshes.items(): m.apply_transform(T); m.fix_normals(); sc.add_geometry(m, node_name=k, geom_name=k)
    d = os.path.join(OUT, str(aid)); os.makedirs(d, exist_ok=True); sc.export(os.path.join(d, 'model.glb'))
    size = ((hi - lo) * STUD).round(3).tolist()
    meta = {'id': aid, 'name': (top or {}).get('props', {}).get('Name'), 'size_m': size, 'materials': sorted(meshes), **stats, 'warnings': warn[:20]}
    json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'), indent=1)
    lib = json.load(open(LIB)) if os.path.exists(LIB) else {}; lib[str(aid)] = {k: meta[k] for k in ('name', 'size_m', 'parts', 'unions_skipped')}; json.dump(lib, open(LIB, 'w'), indent=1)
    return meta

def ids_of(args): return [int(m) for a in args for m in re.findall(r'(\d{5,})', a)[:1]]
if __name__ == '__main__':
    if sys.argv[1] == 'search':
        for r in store_search(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 30): print(r['id'], '|', r['name'], '|', r['creator'])
    else:
        for a in ids_of(sys.argv[2:]):
            try: m = convert(a); print(a, m['name'], m['size_m'], 'parts', m['parts'], 'unions skipped', m['unions_skipped'], len(m['warnings']), 'warnings')
            except Exception as e: print(a, 'FAILED', repr(e)[:200])
