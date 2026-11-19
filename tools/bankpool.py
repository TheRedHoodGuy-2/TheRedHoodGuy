"""python3 tools/bankpool.py <kind> [n]   kind = hair_m hair_f shirt_m shirt_f pants_m pants_f
CURATION STEP of the character bank (Xavier 2026-11-19: "LOOK AT EVERY SINGLE CHARACTER"). Names typed by uploaders lie,
so no item reaches the bank until I have LOOKED at it: this renders numbered candidate sheets (8 x 4 cells, big enough to
judge sleeves, hands, clipping, gender read) to docs/sheets/pool_<kind>_N.jpg. I write the verdicts (keep + style tag)
into library/bank_ok.json by hand after looking; charbank.py only draws from that file."""
import json, os, re, sys, subprocess, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import charbank as C
ROOT = C.ROOT
FEM = r'crop|blouse|girl|women|womens|cami|skirt|\bdress\b(?! shirt)|cute|bow|ruffle|lace|pink|lavender|lilac|peach'
def sleeve_ok(im):
    """arm front rows top to bottom: a sleeve is either long (opaque to the end) or clearly short (skin from some row
    down); a thin skin band at the wrist or a skin band between two cloth bands reads broken"""
    if im is None: return False
    W, H = im.size; a = im.crop((217 * W // 585, 355 * H // 559, 281 * W // 585, 483 * H // 559)).resize((8, 32)).getchannel('A')
    rows = [sum(a.getpixel((x, y)) > 160 for x in range(8)) >= 6 for y in range(32)]
    flips = sum(rows[i] != rows[i + 1] for i in range(31))
    if flips == 0: return True
    if flips == 1 and rows[0]: return rows.index(False) <= 26   # short sleeve: skin must start well above the wrist
    return False
def cands(kind, n, colour=False):
    sex = kind[-1]; seen0 = set()
    for f in os.listdir('/tmp'):
        if f.startswith(f'pool_{kind}') and f.endswith('.json'): seen0 |= {str(x[0]) for x in json.load(open('/tmp/' + f))}
    S = 'male' if sex == 'm' else 'female'; out = []
    if kind.startswith('hair'):
        L = C.HAIR[S] + C.HAIR['both']
        bad = r'long|girl|bun|pony|pigtail|braid|bang|bob|pixie|wolf|mullet|hime|wavy|curtain|cute|anime|y2k|emo|ombre|two.tone|space' if sex == 'm' else r'anime|y2k|ombre|two.tone|space|toxic|messy messy'
        for i, nm in L:
            if C.ODD.search(nm) or re.search(bad, nm, re.I) or re.search(r'[^\x20-\x7e]', nm) or not os.path.exists(f'{ROOT}/assets/roblox/{i}/model.glb'): continue
            if str(i) in seen0: continue
            if C.hairKind(i) not in ('black', 'brown', 'blonde', 'ginger', 'grey'): continue
            out.append((i, nm))
    else:
        part = 'shirt' if kind.startswith('shirt') else 'pants'
        L = C.CLO[f'{part}_{S}'] + C.CLO[f'{part}_both']
        for i, nm in L:
            if str(i) in seen0: continue
            if (not C.clean(nm) and not LOOSE) or C.ODD.search(nm) or re.search(r'[^\x20-\x7e]', nm) or not os.path.exists(f'{ROOT}/assets/roblox/{i}/texture.png'): continue
            if sex == 'm' and re.search(FEM, nm, re.I): continue
            im = C.img(i)
            if part == 'shirt':
                if not re.search(C_TOP, nm, re.I) or re.search(r'\b(?:pants|jeans|trousers|shorts|skirt|leggings)\b', nm, re.I): continue
                if C.stats(im, C.TORSO)[1] > (.02 if sex == 'm' else .15) or not sleeve_ok(im): continue
                if colour and C.lum(C.stats(im, C.TORSO)[0]) < 70: continue
            else:
                if not re.search(C_BOT, nm, re.I) or re.search(r'\b(?:hoodie|jacket|sweater|vest|blazer|coat)\b', nm, re.I): continue
            out.append((i, nm))
    seen = set(); out = [x for x in out if not (x[1].lower() in seen or seen.add(x[1].lower()))]   # one of each name
    random.Random(kind).shuffle(out); return out[:n]
C_TOP = r'\b(?:shirt|tshirt|tee|t-shirt|top|polo|hoodie|sweater|sweatshirt|jumper|cardigan|vest|jacket|coat|blazer|suit|flannel|tank|blouse|jersey|scrubs?)\b'
C_BOT = r'\b(?:pants|jeans|trousers|slacks|chinos?|joggers?|sweatpants|sweats|shorts|skirt|leggings|cargos?)\b'
TAG = ''; LOOSE = '--loose' in sys.argv
TEE = {'m': 'assets/roblox/{}/texture.png', 'f': 'assets/roblox/{}/texture.png'}
def sheet(kind, items):
    from PIL import Image, ImageDraw, ImageFont
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 11)
    sex = kind[-1]; cols, cw, chh, per = 8, 225, 340, 32; files = []
    for s in range(0, len(items), per):
        page = items[s:s + per]; chars = []
        for i, nm in page:
            c = {'res': 2048, 'skin': '#cf9668', 'face': False, 'yaw': 25, 'sex': sex}
            if kind.startswith('hair'): c['hair'] = [int(i)]
            elif kind.startswith('shirt'): c['shirt'] = f'assets/roblox/{i}/texture.png'
            else: c['pants'] = f'assets/roblox/{i}/texture.png'
            chars.append(c)
        sp = {'w': cols * cw, 'h': ((len(page) + cols - 1) // cols) * chh, 'cols': cols, 'grid': {'cw': 1.7, 'ch': 2.55, 'cy': .92, 'bg': '#e4e9ef'}, 'chars': chars}
        png = f'/tmp/pool_{kind}_{s}.png'; subprocess.run(['node', 'tools/shot.mjs', 'sheet.html', json.dumps(sp), png], cwd=ROOT, capture_output=True, text=True)
        im = Image.open(png).convert('RGB'); d = ImageDraw.Draw(im)
        for k, (i, nm) in enumerate(page):
            x = (k % cols) * cw; y = (k // cols) * chh; d.rectangle([x, y + chh - 36, x + cw, y + chh], fill='white'); d.rectangle([x, y, x + cw - 1, y + chh - 1], outline='#c9d0d8')
            d.text((x + 5, y + chh - 34), f'{s + k:02d}  {i}', fill='black', font=F); d.text((x + 5, y + chh - 16), nm[:32], fill=(90, 90, 90), font=f2)
        out = f'{ROOT}/docs/sheets/pool_{kind}{TAG}_{s // per + 1}.jpg'; im.save(out, quality=85); os.remove(png); files.append(out); print(out, flush=True)
    json.dump([[i, nm] for i, nm in items], open(f'/tmp/pool_{kind}{TAG}.json', 'w'))
    return files
if __name__ == '__main__':
    kind = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 64; TAG = sys.argv[3] if len(sys.argv) > 3 and not sys.argv[3].startswith('--') else ''
    it = cands(kind, n, colour='--colour' in sys.argv); print(kind, len(it)); sheet(kind, it)
