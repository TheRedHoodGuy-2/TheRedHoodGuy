# python3 tools/library_build.py  -> library/*.json (sorted, problem items rejected) + gallery specs in /tmp/lib_*.json
# Sources: crawl indexes in /home/claude/{hair,outfits,layered}/index.json, converted items in assets/roblox/<id>/,
# hair placement checks in /home/claude/hair/check.json (tools/haircheck.mjs).
import json, os, re, glob, collections
R = 'assets/roblox'
hair_idx = {x['id']: x for x in json.load(open('/home/claude/hair/index.json'))}
out_idx = {int(k): v for k, v in json.load(open('/home/claude/outfits/index.json')).items()}
lay_idx = {int(k): v for k, v in json.load(open('/home/claude/layered/index.json')).items()} if os.path.exists('/home/claude/layered/index.json') else {}
meta = lambda i: json.load(open(f'{R}/{i}/meta.json')) if os.path.exists(f'{R}/{i}/meta.json') else None
fav = lambda x: -(x.get('fav') or 0)
FEM = r"\b(girls?|princess|pony|ponytails?|pigtails?|buns?|braids?|braided|bob|ribbons?|bows?|space buns|lady|queen|cutie|pink|bangs|pretty|barbie|waves|wavy|curly|curls|long|kawaii|tails|dress|skirt|crop|croptop|bikini|corset|blouse|cami|baddie|ruffle|lace|hearts?|cheer|tutu|leggings|heels|purse|handbag|earrings?|tiara|skirts|girly|feminine|maid|bra)\b"
MAL = r"\b(boy|boys|man|men|guy|dude|bro|buzz|fade|crew|swept|slick|slicked|quiff|undercut|hero|beard|king|prince|faux hawk|mohawk|spiky|spikey|gentleman|business|tux|tuxedo|suit|mens|masculine|bad boy)\b"
def sex(name, long=False):
    n = name.lower(); f = bool(re.search(FEM, n)); m = bool(re.search(MAL, n))
    if m and not f: return 'male'
    if f and not m: return 'female'
    if f and m: return 'both'
    return None if not long else 'female'
lib = {}
# ---------- hair ----------
C = {r['id']: r for r in json.load(open('/home/claude/hair/check.json'))}
def hflag(r):
    if not r or 'box' not in r: return 'could not be measured'
    (x0, y0, z0), (x1, y1, z1) = r['box']
    if y1 < .5: return 'floats below the head'
    if y0 > .55: return 'floats above the head'
    if z0 > .1 or z1 < -.1 or x0 > .1 or x1 < -.1: return 'off to one side'
    if y1 < .76 and x1 - x0 < 1.32 and z1 - z0 < 1.32: return 'hidden inside the head'
    if max(x1 - x0, z1 - z0) > 4 or y1 > 3 or y0 < -4.5: return 'huge or stretched'
H = collections.defaultdict(list)
for i, x in sorted(hair_idx.items(), key=lambda kv: fav(kv[1])):
    m = meta(i)
    if not m: continue
    if not m.get('parts'): H['rejected'].append([i, x['name'], m.get('broken') or 'empty']); continue
    f = hflag(C.get(i))
    if f: H['rejected'].append([i, x['name'], f]); continue
    long = C[i]['box'][0][1] < -1.0; s = sex(x['name'], long) or 'male'
    if s == 'female' and not long and not re.search(r'bun|braid|pony|pigtail|bob|bow|ribbon|girl|princess', x['name'].lower()): s = 'both'
    H[s].append([i, x['name']])
lib['hair'] = H
# ---------- classic clothing (flat textures) ----------
CL = collections.defaultdict(list)
for i, x in sorted(out_idx.items(), key=lambda kv: fav(kv[1])):
    if x['kind'] not in ('shirt', 'pants', 'tshirt'): continue
    m = meta(i)
    if not m or not os.path.exists(f'{R}/{i}/texture.png'): continue
    CL[f"{x['kind']}_{sex(x['name']) or 'both'}"].append([i, x['name']])
lib['clothing'] = CL
# ---------- accessories ----------
A = collections.defaultdict(list)
for i, x in sorted(out_idx.items(), key=lambda kv: fav(kv[1])):
    if x['kind'] in ('shirt', 'pants', 'tshirt'): continue
    m = meta(i)
    if not m or not m.get('parts'): continue
    A[x['kind']].append([i, x['name']])
lib['accessories'] = A
# ---------- 3D layered clothing ----------
L = collections.defaultdict(list)
for i, x in sorted(lay_idx.items(), key=lambda kv: fav(kv[1])):
    m = meta(i)
    if m and m.get('parts'): L[x['kind']].append([i, x['name']])
lib['layered'] = L
os.makedirs('library', exist_ok=True)
for k, v in lib.items(): json.dump(v, open(f'library/{k}.json', 'w'), indent=0)
print({k: {kk: len(vv) for kk, vv in v.items()} for k, v in lib.items()})
NICE = {'shirt': 'Shirts', 'pants': 'Pants', 'tshirt': 'T-shirts', 'hat': 'Hats and caps', 'face': 'Face (glasses, masks)', 'neck': 'Neck (scarves, chains)', 'shoulder': 'Shoulder', 'front': 'Front', 'back': 'Back (bags, wings)', 'waist': 'Waist',
        'l_tshirt': '3D T-shirts', 'l_shirt': '3D shirts', 'l_pants': '3D pants', 'l_jacket': '3D jackets and hoodies', 'l_sweater': '3D sweaters and hoodies', 'l_shorts': '3D shorts', 'l_dress_skirt': '3D dresses and skirts', 'l_shoe_left': '3D shoes (left)', 'l_shoe_right': '3D shoes (right)'}
specs = {
 'hair': {'title': 'Hair library', 'intro': 'Every hair pulled, worn on our base head, most favourited first, sorted by name and length. Rejected ones (floating, hidden, broken) are last. To move one, tell me the section and number.',
          'sections': [{'name': 'Male hair', 'mode': 'hair', 'items': H['male']}, {'name': 'Female hair', 'mode': 'hair', 'sex': 'f', 'items': H['female']}, {'name': 'Hair for both', 'mode': 'hair', 'items': H['both']}, {'name': 'Rejected hair', 'mode': 'hair', 'items': H['rejected']}]},
 'clothing': {'title': 'Clothing library (flat Roblox shirts and pants)', 'intro': 'Classic shirts, T-shirts and pants on our base bodies (shirts over plain grey pants, pants under a plain white shirt), most favourited first, sorted male / female / both by name.',
          'sections': [{'name': f"{NICE[k.split('_')[0]]}: {k.split('_')[1]}", 'mode': k.split('_')[0], 'sex': 'f' if k.endswith('female') else 'm', 'items': CL[k]} for k in sorted(CL, key=lambda k: (['shirt', 'tshirt', 'pants'].index(k.split('_')[0]), ['male', 'female', 'both'].index(k.split('_')[1])))]},
 'accessories': {'title': 'Accessories library', 'intro': 'Hats, glasses, masks, scarves, bags and more, worn on our base body, most favourited first. Back items are shown from behind.',
          'sections': [{'name': NICE[k], 'mode': 'acc_back' if k == 'back' else 'acc', 'items': A[k]} for k in ('hat', 'face', 'neck', 'shoulder', 'front', 'back', 'waist') if A.get(k)]},
 'layered': {'title': '3D clothing library (not fitted to R6 yet)', 'intro': 'Modelled 3D clothing, made for the newer slim Roblox body. Shown as-is on our blocky R6 body, so most do not fit yet: fitting them is a separate job.',
          'sections': [{'name': NICE[k], 'mode': 'acc', 'items': L[k]} for k in NICE if k.startswith('l_') and L.get(k)]},
}
for k, s in specs.items(): json.dump(s, open(f'/tmp/lib_{k}.json', 'w'))
