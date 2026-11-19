"""python3 tools/charbank.py [--sheets]  -> library/characters.json (+ docs/sheets/charbank_{m,f}_N.jpg)
THE CHARACTER BANK (Xavier 2026-11-18): 100 male + 100 female BACKGROUND characters, built once and reused across videos.
- Personality = look: every character has an archetype (jock, nerd, skater, goth, preppy, gamer, artsy, sporty, bookworm,
  country, popular, plus adults: dad, mom, teacher, office worker, coach, grandparent, nurse, chef, cop-off-duty...) and the
  clothes, hair and accessories are picked to READ as that person (the nerd wears glasses, the skater a beanie / shades).
- Skin: a range from fair to brown, the darkest about the bedtime-story skin (#a8714f) or a little darker. Random per seed.
- Clothing: normal, real-life items only (the usability triage), flat 2D templates mixed with 3D (R6) garments.
- Faces come later (faces phase), so the bank stores none yet.
Deterministic: same seed -> same bank. Items must be downloaded (assets/roblox/<id>/)."""
import json, os, random, re, sys, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); L = lambda f: json.load(open(f'{ROOT}/library/{f}'))
have = lambda i: os.path.exists(f'{ROOT}/assets/roblox/{i}/meta.json') or os.path.exists(f'{ROOT}/assets/roblox/{i}/texture.png') or os.path.exists(f'{ROOT}/assets/roblox/{i}/model.glb')
HAIR, ACC, CLO, TRI = L('hair.json'), L('accessories.json'), L('clothing.json'), L('triage_auto.json')
ODD = re.compile(r'anime|demon|horn|\bears?\b|bunny|fox|neon|rainbow|galaxy|robux|roblox|bacon|noob|sword|wing|halo|crown|glitch|kawaii|\bcat\b|devil|angel|alien|zombie|vampire|ninja|samurai|knight|armor|armour|costume|santa|elf|clown|pirate|wizard|witch|monster|skull|blood|slime|\btail\b|tentacle|spike|cyber|fire|flame|lava|ghost|hood\b.*glow|glow|sparkl|glitter|catgirl|egirl|e-girl|y2k.*chain|[0-9]{4} ?limited|ugc|meme|troll|giant|tiny|huge|valk|dominus|fedora|neko|jjk|hakari|baddie|grillz|vamp|kpop|idol|celebrit|mariah|tactical|spider|xmas|christmas|halloween|bloxy|hello kitty|sanrio|kuromi|cinnamoroll|melody|naruto|goku|gojo|pokemon|mario|sonic|vetements|everlast|envy|miss me|coquet|dollette|lolita|maid|bikini|swim|lingerie|corset|fur boot|boots? w|money|cash|gang|drip|thug|smoke|weed|beer|gun|knife|toy story|woody|skeleton|leatherface|llama|tattoo|iced out|rhinestone|evil|smiley|leg warmer|butterfly|pokemon|tadc|spudsy|doodle|star hoodi|% ?off|\$|❗|💫|😊|grunge.*chain|scene|cutecore|y2k|emo got|goth captain|captain hat|blossom|whacky|worried|dread.*cap|cap w|space b|baloon|nyc|attack on titan|eren|yeager|ichigo|bleach|nezuko|nezoko|kamado|demon slayer|asta|clover|naruto|one piece|luffy|hitman|mafia|kobe|bryant|boomer|bling|broken|strawberry|swaggy|george ezra|edgar|himekaji|mori\b|pajama|sleepy|straight jacket|chromeheart|chrome heart|popstar|2009|dentist|gambino|margiela|riding academy|cheap|cutout|frilly|one glove|tropical|japan|usa\b|biker|\bea7\b|🔥|indie|tape\b|reps\b|fishing|peruvian|gothic|^bucket$', re.I)
rnd = random.Random(19)
# WHITELIST: an item is used only if EVERY word of its name is a plain garment / colour / style word (no characters,
# brands, memes, emoji). Names are what the uploader typed, so this is the only reliable filter short of looking.
VOCAB = set("""a an and or with w of in on the to for by v1 v2 v3 1 2 3 1.0 2.0 3.0 r6 r15 classic plain basic simple solid casual
black white grey gray brown beige tan cream navy blue light dark red maroon burgundy green olive sage forest khaki yellow mustard
orange pink rose peach purple lilac lavender teal mint gold silver charcoal denim washed faded off ivory camel coffee chocolate
shirt tshirt t tee top polo hoodie hoody sweater sweatshirt jumper cardigan vest jacket coat blazer suit flannel plaid checked check
button up down collar collared oxford dress formal shirts tank cami blouse knit knitted cable crewneck crew neck turtleneck v long
short sleeve sleeves sleeveless striped stripe stripes zip zipper pullover bomber denim jean jeans pants pant trousers slacks
chinos chino khakis joggers jogger sweatpants sweats track tracksuit shorts cargo cargos skirt pleated pleat mini midi maxi
leggings overalls overall belt belted shoes sneakers boots socks loafers outfit fit set uniform school sport sports athletic
jersey varsity team gym basketball football soccer baseball tennis running baggy loose oversized wide leg straight slim skinny
fitted cropped crop high waisted ripped distressed vintage retro cozy comfy soft warm winter summer fall spring smart business
office work preppy cute aesthetic beanie cap baseball hat bucket beret headband headphones glasses sunglasses round square
frame frames reading nerd backpack bag purse tote skateboard chain necklace scrub scrubs nurse medical apron chef cowboy
lab boy girl boys girls mens womens men women male female hair""".split())
WORD = re.compile(r"[a-z0-9.']+")
def clean(n):
    if re.search(r'[^\x20-\x7e]', n): return False
    ws = WORD.findall(n.lower().replace('-', ' ').replace('/', ' ').replace('&', ' '))
    return bool(ws) and all(w.strip(".'") in VOCAB or w.isdigit() for w in ws)
SKIN = ['#f6dcc8', '#f1cfb5', '#ecc3a3', '#e6b48c', '#dca67c', '#cf9668', '#c3875c', '#b67a53', '#a8714f', '#9a6444']
BADF = f'{ROOT}/library/bad_items.json'; BAD = set(json.load(open(BADF))) if os.path.exists(BADF) else set()
from functools import lru_cache
import colorsys, io
@lru_cache(None)
def img(i):
    """the item's texture (texture.png, or the first image inside model.glb), as an RGBA PIL image, or None"""
    from PIL import Image
    d = f'{ROOT}/assets/roblox/{i}'
    try:
        if os.path.exists(f'{d}/texture.png'): return Image.open(f'{d}/texture.png').convert('RGBA')
        b = open(f'{d}/model.glb', 'rb').read(); k = b.find(b'\x89PNG'); k = k if k >= 0 else b.find(b'\xff\xd8\xff')
        return Image.open(io.BytesIO(b[k:])).convert('RGBA') if k >= 0 else None
    except Exception: return None
def stats(im, box=None):
    """median colour of the opaque pixels and the transparent share, of the whole image or a box (template px)"""
    if im is None: return None, 0
    if box: W, H = im.size; x, y, w, h = box; im = im.crop((x * W // 585, y * H // 559, (x + w) * W // 585, (y + h) * H // 559))
    px = list(im.resize((24, 24)).getdata()); op = [q[:3] for q in px if q[3] > 160]
    if not op: return None, 1
    op.sort(key=sum); return op[len(op) // 2], 1 - len(op) / len(px)
def hairKind(i):
    c, _ = stats(img(i))
    if c is None: return 'unknown'
    h, l, sa = colorsys.rgb_to_hls(*[v / 255 for v in c]); h *= 360
    if l < .16: return 'black'
    if sa < .22: return 'grey' if l > .45 else 'black' if l < .3 else 'brown'
    if 8 <= h <= 52: return 'blonde' if l > .55 else 'ginger' if sa > .55 and h < 28 else 'brown'
    return 'wild'
TORSO = (231, 74, 128, 128); LEGF = (217, 355, 64, 128)
def lum(c): return 0 if c is None else .3 * c[0] + .59 * c[1] + .11 * c[2]
def pool(lst, inc=None, exc=None, hair=False):
    out = []
    for i, n in lst:
        if i in BAD or str(i) in BAD or ODD.search(n) or (not hair and not clean(n)) or not have(i): continue
        if inc and not re.search(rf'\b(?:{inc})', n, re.I): continue
        if exc and re.search(exc, n, re.I): continue
        out.append((i, n))
    return out
# Bank v2 (Xavier 2026-11-19): items come ONLY from library/bank_ok.json, which holds the items I looked at one by one
# (tools/bankpool.py sheets) with style tags. Archetype = which tags it wears. 2D clothing only until the 3D fit is fixed.
OK = json.load(open(f'{ROOT}/library/bank_ok.json'))
GLASSES = [11884330, 4197739997, 301820310]; GLASSES_OLD = [4143016822, 4753645975, 4197739997]
PHONES = [16266640100, 130568043270999, 124442197389942, 7856863608, 10943571579]
GREY = '#c9c9c7'
# (name, age, line, shirt tags, pants tags, hair tags, extras)  extras: glasses / phones / old
ARCH = {
 'm': [
  ('jock', 'teen', 'Captain of the team, loud, always hungry.', 'athletic', 'athletic denim casual', 'fade short neat messy', ''),
  ('nerd', 'teen', 'Knows the answer before the question ends.', 'smart', 'smart formal casual', 'neat short', 'glasses'),
  ('skater', 'teen', 'Never without the board, says "dude" a lot.', 'skater', 'denim casual grunge', 'messy locs twists', ''),
  ('gamer', 'teen', 'Up till 3 a.m., talks in game terms.', 'gamer casual', 'athletic casual', 'messy short twists', 'phones'),
  ('goth', 'teen', 'Quiet, black everything, secretly funny.', 'grunge', 'grunge casual', 'messy locs', ''),
  ('preppy', 'teen', 'Polo tucked in, wants to be class president.', 'preppy smart', 'smart formal', 'neat', ''),
  ('artsy', 'teen', 'Paint on his hands, sketchbook in his bag.', 'artsy', 'denim casual artsy', 'messy twists locs', ''),
  ('country', 'teen', 'From the farm, polite, strong.', 'country', 'denim', 'short neat messy', ''),
  ('dad', 'adult', 'Tells dad jokes, grills every weekend.', 'casual country smart', 'denim smart casual', 'neat short fade', ''),
  ('office', 'adult', 'Coffee in hand, always on a call.', 'formal', 'formal', 'neat fade', ''),
  ('teacher', 'adult', 'Strict but fair, hates phones in class.', 'smart formal', 'smart formal', 'neat short', 'glasses'),
  ('coach', 'adult', 'Whistle, joggers, never sits down.', 'athletic', 'athletic', 'fade short neat', ''),
  ('grandpa', 'adult', 'Slow walker, sharp mind, wild stories.', 'smart country', 'smart formal', 'grey', 'old'),
 ],
 'f': [
  ('popular', 'teen', 'Knows everyone, runs the group chat.', 'cute casual', 'denim skirt casual shorts', 'long pony bun', ''),
  ('sporty', 'teen', 'Track star, always in a ponytail.', 'athletic', 'athletic', 'sporty pony braid', ''),
  ('bookworm', 'teen', 'Reads at lunch, notices everything.', 'smart casual', 'skirt smart casual', 'bob braid bun', 'glasses'),
  ('artsy', 'teen', 'Thrifted clothes, paints murals.', 'artsy', 'denim casual artsy', 'artsy curly locs bun', ''),
  ('goth', 'teen', 'Black lipstick energy, loyal friend.', 'grunge', 'grunge', 'goth long', ''),
  ('gamer', 'teen', 'Beats the boys at every game.', 'gamer casual', 'athletic casual', 'bun pony', 'phones'),
  ('preppy', 'teen', 'Tennis on Saturdays, perfect grades.', 'preppy smart', 'preppy smart', 'neat pony long', ''),
  ('cute', 'teen', 'Sweet, giggly, loves pastel.', 'cute', 'cute skirt shorts denim', 'pigtails cute afro bun', ''),
  ('mom', 'adult', 'Calls twice, worries always, best cook.', 'casual smart country', 'denim casual smart', 'long bun neat bob', ''),
  ('office', 'adult', 'Power suit, color-coded calendar.', 'formal smart', 'formal smart', 'neat bob bun', ''),
  ('teacher', 'adult', 'Kind voice, red pen of doom.', 'smart', 'smart formal', 'neat bun bob', 'glasses'),
  ('nurse', 'adult', 'Night shifts, calm in any crisis.', 'scrubs', 'scrubs', 'bun pony neat', ''),
  ('grandma', 'adult', 'Hugs, cookies, terrifying when mad.', 'smart', 'smart formal', 'grey', 'old'),
 ]}
import colorsys as _cs
def look(i, box):
    """(saturation, busyness) of a template region: loud = saturated colour, busy = strong pattern"""
    im = img(i)
    if im is None: return 0, 0
    W, H = im.size; x, y, w, h = box; q = im.crop((x * W // 585, y * H // 559, (x + w) * W // 585, (y + h) * H // 559)).convert('RGB').resize((16, 16))
    px = list(q.getdata()); L = [.3 * a + .59 * b + .11 * c for a, b, c in px]; m = sum(L) / len(L)
    sat = sorted(_cs.rgb_to_hls(*[v / 255 for v in c])[2] * (1 if 25 < .3 * c[0] + .59 * c[1] + .11 * c[2] < 235 else 0) for c in px)[len(px) // 2]
    return sat, (sum((v - m) ** 2 for v in L) / len(L)) ** .5
def bank(seeds={}, only=None, prev=None):
    out = []; usedS = {}; usedH = {}
    for c in (prev or {}).values():   # a redo counts what the kept characters already wear, so it does not repeat them
        if only is not None and c['id'] not in only: usedS[c['shirt']] = usedS.get(c['shirt'], 0) + 1; usedH[c['hair'][0]] = usedH.get(c['hair'][0], 0) + 1
    for sex in 'mf':
        arch = ARCH[sex]; S = OK[f'shirt_{sex}']; Pn = OK[f'pants_{sex}']; Hr = OK[f'hair_{sex}']
        for k in range(100):
            cid = f'{sex}{k:03d}'
            if only is not None and cid not in only: out.append(prev[cid]); continue
            name, who, line, sw, pw, hw, ex = arch[k % len(arch)]; seed = seeds.get(cid, 0); r = random.Random(f'{sex}{k}:{seed}')
            tagged = lambda L, tags: [x for x in L if set(x[1].split()) & set(tags.split())]
            if hw == 'grey':   # grandparents: a tidy style (short / slicked for him, a bun for her) turned grey by the tint
                hl = [x for x in Hr if set(x[1].split()) & ({'neat'} if sex == 'm' else {'bun', 'neat'}) and 'bangs' not in x[1] and 'cute' not in x[1]]
            else: hl = [x for x in tagged(Hr, hw) if 'grey' not in x[1]]
            if 'glasses' in ex or ex == 'old': hl = [x for x in hl if 'bangs' not in x[1]] or hl   # bangs hide glasses
            low = min(usedH.get(x[0], 0) for x in hl); h = r.choice([x for x in hl if usedH.get(x[0], 0) == low]); usedH[h[0]] = usedH.get(h[0], 0) + 1
            PLAID = re.compile(r'plaid|flannel|check|tartan', re.I)
            sl = tagged(S, sw)
            if name in ('preppy', 'popular', 'cute'): sl = [x for x in sl if lum(stats(img(x[0]), TORSO)[0]) > 60] or sl   # these never dress all black
            if name in ('grandma', 'grandpa'): sl = [x for x in sl if not re.search(r'tie|stripe', x[2], re.I)] or sl   # grandparents: sweaters, cardigans, polos, jackets
            if name == 'nurse':   # only tops that have trousers of their own colour in the pool
                col = lambda i, b: stats(img(i), b)[0] or (0, 0, 0)
                dist = lambda a, b: sum((x - y) ** 2 for x, y in zip(a, b)) ** .5
                sl = [x for x in sl if min(dist(col(x[0], TORSO), col(q[0], LEGF)) for q in tagged(Pn, pw)) < 55] or sl
            if name == 'country': sl = [x for x in sl if lum(stats(img(x[0]), TORSO)[0]) > 45] or sl                      # warm flannel, not black
            low = min(usedS.get(x[0], 0) for x in sl); sl = [x for x in sl if usedS.get(x[0], 0) <= low]   # least worn first: no repeats until the pool runs out
            for _ in range(80):   # outfit: never two loud pieces, never pattern on pattern
                sh = r.choice(sl); pl = tagged(Pn, pw)
                if name == 'nurse':   # scrubs come as a set: the trousers are the colour of the top
                    col = lambda i, b: stats(img(i), b)[0] or (0, 0, 0)
                    t = col(sh[0], TORSO); pa = min(pl, key=lambda x: sum((a - b) ** 2 for a, b in zip(t, col(x[0], LEGF))))
                else: pa = r.choice(pl)
                if PLAID.search(pa[2]) and (re.search(r'plaid|flannel|check|stripe|tie|overall', sh[2], re.I) or look(sh[0], TORSO)[0] > .3 or look(sh[0], TORSO)[1] > 30): continue   # plaid trousers only under a plain, quiet top
                if who == 'adult' and re.search(r'short', pa[1] + ' ' + pa[2], re.I): continue
                if PLAID.search(sh[2]) and PLAID.search(pa[2]): continue
                (ss, sb), (ps, pb) = look(sh[0], TORSO), look(pa[0], LEGF)
                if ss > .35 and ps > .35: continue        # two strong colours
                if sb > 38 and pb > 30: continue          # busy on busy
                break
            usedS[sh[0]] = usedS.get(sh[0], 0) + 1
            c = {'id': cid, 'sex': sex, 'archetype': name, 'age': who, 'personality': line, 'skin': SKIN[r.randrange(len(SKIN))],
                 'name': f'{NAMES[sex][k % len(NAMES[sex])]} {SUR[(k * 7 + (sex == "f") * 3 + seed) % len(SUR)]}',
                 'hair': [h[0]], 'hairName': h[2], 'shirt': sh[0], 'pants': pa[0], 'outfit': [sh[2], pa[2]], 'accessories': []}
            if hw == 'grey' and 'grey' not in h[1]: c['hairTint'] = GREY
            if ex == 'glasses' or (ex == 'old' and r.random() < .7): c['accessories'].append(r.choice(GLASSES if ex == 'glasses' else GLASSES_OLD))
            if ex == 'phones' and not re.search(r'headphone', sh[2], re.I): c['accessories'].append(r.choice(PHONES))   # never two pairs
            out.append(c)
    return out
NAMES = {'m': 'Liam Noah Oliver Elijah James Ethan Lucas Mason Logan Jacob Jackson Aiden Carter Owen Wyatt Caleb Isaac Ryan Nathan Dylan Tyler Jordan Marcus Andre Jamal Kevin Brandon Austin Cole Chase Evan Jason Derek Trevor Miles Malik Darius Diego Mateo Leo Max Zach Blake Kyle Sean Connor Gavin Hunter Ian Jace Kai Luis Nico Omar Reggie Seth Theo Victor Wes Xavier Zion'.split(),
         'f': 'Olivia Emma Ava Sophia Isabella Mia Amelia Harper Evelyn Abigail Emily Ella Chloe Grace Lily Zoe Riley Nora Hannah Layla Aria Maya Jasmine Kayla Brianna Destiny Imani Aaliyah Nia Sienna Paige Megan Tessa Ruby Jade Skye Ivy Luna Hazel Willow Brooke Taylor Morgan Bailey Carmen Elena Sofia Valeria Gabby Rosa Tia Keisha Nadia Priya Maddie Lexi Becca Gwen'.split()}
SUR = 'Smith Johnson Brown Davis Miller Wilson Moore Taylor Anderson Thomas Jackson White Harris Martin Thompson Garcia Martinez Robinson Clark Lewis Lee Walker Hall Allen Young King Wright Scott Green Baker Adams Nelson Hill Campbell Mitchell Carter Roberts Turner Phillips Parker Evans Edwards Collins Stewart Morris Rogers Reed Cook Bell Murphy Bailey Cooper Howard Ward Cox Brooks Gray James Bennett Wood Barnes Ross Price'.split()
def sheets(B, ids=None, tag=''):
    """review sheets: 8 x 4 big cells (sleeves, hands, clipping must be readable), every character, no skipping"""
    from PIL import Image, ImageDraw, ImageFont
    F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14); f2 = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
    cols, cw, chh, per = 8, 225, 340, 32; files = []
    for sex in 'mf':
        L2 = [c for c in B if c['sex'] == sex and (ids is None or c['id'] in ids)]
        for s0 in range(0, len(L2), per):
            page = L2[s0:s0 + per]
            chars = [{'res': 2048, 'skin': c['skin'], 'face': False, 'yaw': 25, 'sex': sex, 'hair': c['hair'], 'accessories': c['accessories'], **({'hairTint': c['hairTint']} if c.get('hairTint') else {}),
                      'shirt': c.get('shirtTex') or f'assets/roblox/{c["shirt"]}/texture.png', 'pants': c.get('pantsTex') or f'assets/roblox/{c["pants"]}/texture.png'} for c in page]
            sp = {'w': cols * cw, 'h': ((len(page) + cols - 1) // cols) * chh, 'cols': cols, 'grid': {'cw': 1.7, 'ch': 2.55, 'cy': .92, 'bg': '#e4e9ef'}, 'chars': chars}
            png = f'/tmp/cb_{sex}_{s0}.png'; r = subprocess.run(['node', 'tools/shot.mjs', 'sheet.html', json.dumps(sp), png], cwd=ROOT, capture_output=True, text=True)
            bad = re.findall(r'BADITEM (\d+)', r.stdout + r.stderr)
            if bad: print('BADITEM', bad)
            im = Image.open(png).convert('RGB'); d = ImageDraw.Draw(im)
            for k, c in enumerate(page):
                x = (k % cols) * cw; y = (k // cols) * chh; d.rectangle([x, y + chh - 36, x + cw, y + chh], fill='white'); d.rectangle([x, y, x + cw - 1, y + chh - 1], outline='#c9d0d8')
                d.text((x + 5, y + chh - 34), f'{c["id"]}  {c["name"]}'[:26], fill='black', font=F); d.text((x + 5, y + chh - 17), f'{c["archetype"]} ({c["age"]})', fill=(120, 40, 40), font=f2)
            out = f'{ROOT}/docs/sheets/charbank{tag}_{sex}_{s0 // per + 1}.jpg'; im.save(out, quality=85); os.remove(png); files.append(out); print(out, flush=True)
    return files
SEEDS = f'{ROOT}/library/charbank_seeds.json'
if __name__ == '__main__':
    """python3 tools/charbank.py            -> whole bank + review sheets
       python3 tools/charbank.py --redo m003,f017   -> new seed for those ids only, re-render only them (charbank_redo_*)"""
    seeds = json.load(open(SEEDS)) if os.path.exists(SEEDS) else {}
    prev = {c['id']: c for c in json.load(open(f'{ROOT}/library/characters.json'))} if os.path.exists(f'{ROOT}/library/characters.json') else {}
    redo = sys.argv[sys.argv.index('--redo') + 1].split(',') if '--redo' in sys.argv else None
    if redo:
        for i in redo: seeds[i] = seeds.get(i, 0) + 1
    B = bank(seeds, set(redo) if redo else None, prev if redo else None)
    json.dump(B, open(f'{ROOT}/library/characters.json', 'w'), indent=1); json.dump(seeds, open(SEEDS, 'w'))
    subprocess.run([sys.executable, f'{ROOT}/tools/recolor.py'], check=True)   # colourways for repeated garments
    B = json.load(open(f'{ROOT}/library/characters.json'))
    if '--nosheets' not in sys.argv: sheets(B, set(redo) if redo else None, '_redo' if redo else '')
