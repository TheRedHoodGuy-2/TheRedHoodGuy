"""python3 tools/town_build.py  -> assets/town/town.json
Turns the OpenStreetMap extract research/map/naperville_osm.json (downtown Naperville, Illinois: a real US suburb with a
main street, river walk, schools, churches, college and blocks of family houses; fetched 2026-11-18 through the laptop
because Overpass is blocked from the cloud) into our town map at studio scale (real metres x 1.4, see research/scale.md).
Map data (c) OpenStreetMap contributors, ODbL. Real names are NOT carried into the town (signs are generic).
Output: x east, z south (north = -z), metres. Roads, footways, building footprints with kind + height, open areas, the
civic roles (school, police, fire, hospital, library, town hall) and the two lots where House A and House B stand."""
import json, math, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = 1.4; FLOOR = 4.38
j = json.load(open(f'{ROOT}/research/map/naperville_osm.json'))
lat0, lon0 = 41.7745, -88.1525
def P(p): return [round((p['lon'] - lon0) * 111320 * math.cos(math.radians(lat0)) * S, 2), round(-(p['lat'] - lat0) * 110540 * S, 2)]
def area(pts): return abs(sum(pts[i][0] * pts[i - 1][1] - pts[i - 1][0] * pts[i][1] for i in range(len(pts)))) / 2
def cen(pts): return [sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)]
W = {'primary': 18, 'secondary': 16, 'tertiary': 14, 'residential': 12, 'unclassified': 11, 'service': 6, 'pedestrian': 6, 'living_street': 9}
roads, foot, blds, areas = [], [], [], []
for e in j['elements']:
    t, g = e.get('tags', {}), e.get('geometry')
    if not g: continue
    pts = [P(p) for p in g]
    hw = t.get('highway')
    if hw in W: roads.append({'w': W[hw], 'kind': hw, 'pts': pts}); continue
    if hw in ('footway', 'path', 'steps', 'cycleway'): foot.append(pts); continue
    if 'building' in t:
        b = t['building']; lv = t.get('building:levels')
        kind = 'house' if b in ('house', 'residential', 'detached', 'semidetached_house', 'terrace') else 'shed' if b in ('garage', 'garages', 'shed', 'roof', 'carport') else \
            'apt' if b in ('apartments', 'dormitory') else 'school' if b in ('school', 'college') else 'church' if b in ('church', 'bell_tower') else 'civic' if b in ('public', 'civic', 'government') else 'shop'
        if t.get('amenity') == 'place_of_worship': kind = 'church'
        levels = float(lv) if lv and lv.replace('.', '').isdigit() else {'house': 2, 'shed': 1, 'apt': 3, 'school': 2, 'church': 2, 'civic': 2, 'shop': 2}[kind]
        if pts[0] == pts[-1]: pts = pts[:-1]
        if len(pts) < 3 or area(pts) < 8: continue
        blds.append({'kind': kind, 'levels': levels, 'h': round(levels * FLOOR if kind != 'shed' else 3.6, 2), 'pts': pts, 'name': t.get('name', ''), 'amen': t.get('amenity', '')}); continue
    k = t.get('leisure') or t.get('amenity') or t.get('landuse')
    if k in ('park', 'pitch', 'playground', 'parking', 'swimming_pool', 'grass', 'garden', 'track', 'stadium'):
        if pts[0] == pts[-1]: pts = pts[:-1]
        if len(pts) >= 3: areas.append({'kind': k, 'pts': pts})
# civic roles: the real town hall, library and an elementary school stay what they are; police, fire and hospital go to
# fitting buildings close to the main streets (fictional: nothing here is labelled with a real name)
def find(name): return next((b for b in blds if b['name'] == name), None)
roles = {}
for role, name in [('townhall', 'Naperville Municipal Center'), ('library', 'Old Nichols Library')]:
    b = find(name)
    if b: b['role'] = role; roles[role] = cen(b['pts'])
th = roles.get('townhall', [0, 0])
sch = sorted([b for b in blds if b['kind'] == 'school' and 'role' not in b], key=lambda b: -area(b['pts']))
if sch: sch[0]['role'] = 'school'; roles['school'] = cen(sch[0]['pts'])
cands = sorted([b for b in blds if b['kind'] in ('shop', 'civic') and 'role' not in b and 500 < area(b['pts']) < 3000], key=lambda b: math.dist(cen(b['pts']), th))
for role, b in zip(['police', 'fire'], cands[:2]): b['role'] = role; roles[role] = cen(b['pts'])
big = sorted([b for b in blds if b['kind'] in ('school', 'apt', 'shop') and 'role' not in b], key=lambda b: -area(b['pts']))
if big: big[0]['role'] = 'hospital'; roles['hospital'] = cen(big[0]['pts'])
for b in blds: b.pop('name'); b.pop('amen')
# hero lots: two neighbouring houses on one residential street, replaced by House A and House B (fronts to the street)
res = [r for r in roads if r['kind'] == 'residential']
def nearest_road(c):
    best = None
    for r in res:
        for a, b in zip(r['pts'], r['pts'][1:]):
            ax, az, bx, bz = *a, *b; dx, dz = bx - ax, bz - az; L2 = dx * dx + dz * dz or 1; u = max(0, min(1, ((c[0] - ax) * dx + (c[1] - az) * dz) / L2)); px, pz = ax + u * dx, az + u * dz; d = math.dist(c, (px, pz))
            if not best or d < best[0]: best = (d, (px, pz), (dx, dz))
    return best
houses = [b for b in blds if b['kind'] == 'house']
pick = None
for h in sorted(houses, key=lambda b: math.dist(cen(b['pts']), th)):
    c = cen(h['pts']); nr = nearest_road(c)
    if not nr or nr[0] > 30 or math.dist(c, th) < 250: continue
    nb = [o for o in houses if o is not h and 30 < math.dist(cen(o['pts']), c) < 50 and nearest_road(cen(o['pts']))[0] < 30 and abs(nearest_road(cen(o['pts']))[1][0] - nr[1][0]) + abs(nearest_road(cen(o['pts']))[1][1] - nr[1][1]) < 60]
    if nb: pick = (h, nb[0]); break
lots = []
for key, h in zip(['A', 'B'], pick):
    c = cen(h['pts']); d, (px, pz), (dx, dz) = nearest_road(c)
    ux, uz = (c[0] - px) / (d or 1), (c[1] - pz) / (d or 1)          # from the road toward the lot
    hw, hd = (23 if key == 'A' else 16) / 2, 11 / 2                  # plan footprint (A has the garage)
    cx, cz = px + ux * (16 + hd), pz + uz * (16 + hd)                 # front wall 16 m from the road's centre line (real setback x 1.4)
    yaw = math.atan2(-(px - cx), -(pz - cz))                         # the plan front (-z) turned toward the street
    # clear every OSM footprint that touches the house + a 3 m margin
    def inside(q):
        x, z = q[0] - cx, q[1] - cz; lx = x * math.cos(yaw) - z * math.sin(yaw); lz = x * math.sin(yaw) + z * math.cos(yaw)
        return abs(lx) < hw + 3 and abs(lz) < hd + 3
    blds = [b for b in blds if not any(inside(q) for q in b['pts'] + [cen(b['pts'])])]
    lots.append({'house': key, 'c': [round(cx, 2), round(cz, 2)], 'yaw': round(yaw, 4), 'road': [round(px, 2), round(pz, 2)], 'planCentre': [hw, hd]})
os.makedirs(f'{ROOT}/assets/town', exist_ok=True)
out = {'source': 'OpenStreetMap, downtown Naperville IL, (c) OpenStreetMap contributors (ODbL)', 'scale': S, 'roads': roads, 'foot': foot, 'buildings': blds, 'areas': areas, 'roles': roles, 'lots': lots,
       'bounds': [min(p[0] for b in blds for p in b['pts']), min(p[1] for b in blds for p in b['pts']), max(p[0] for b in blds for p in b['pts']), max(p[1] for b in blds for p in b['pts'])]}
json.dump(out, open(f'{ROOT}/assets/town/town.json', 'w'))
print(len(roads), 'roads', len(foot), 'footways', len(blds), 'buildings', len(areas), 'areas'); print('roles', {k: [round(v[0]), round(v[1])] for k, v in roles.items()}); print('lots', lots); print('bounds', out['bounds'])
