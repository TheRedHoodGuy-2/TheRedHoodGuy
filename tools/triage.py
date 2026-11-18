"""Pre-sort the R6 3D clothing by USABILITY for Xavier's triage (2026-11-18): normal / in-between / odd, from the item
names, plus the fit-check result. It is a first pass only; Xavier's picks are final. Nothing is deleted."""
import json, re, os
L = json.load(open('library/r6_3d.json')); FC = {}
if os.path.exists('library/fitcheck.jsonl'):
    for l in open('library/fitcheck.jsonl'):
        r = json.loads(l); FC[r['id']] = r
BARE = json.load(open('library/fitcheck_bare.json'))
ODD = r"costume|anime|spongebob|krabs|gojo|miku|stitch|kitty|batman|spider|devil|skeleton|halloween|christmas|santa|armor|armour|spike|maid|fumo|hachiware|mlbb|naruto|demon|vampire|zombie|clown|pirate|ninja|samurai|knight|robot|alien|monster|fire|flame|galaxy|rainbow|neon|glow|candy|sundae|churro|mermaid|bunny|bear|cat |kawaii|cosplay|hakama|cyber|tactical|military|camo|egyptian|baroque|gothic|goth|emo|reaver|hellstar|leopard|pastel|frilled|y3k|pbr|leg armor|springlock|toon|dinosaur|onesie|pajama|pj|sleep|jinu|xavier|katsuragi|patchouli|ram's|holy|nimi|gawdly|thief|stalker|investigator|violence"
NORMAL = r"plain|basic|classic|jeans|denim|hoodie|sweater|sweatpants|sweat pants|joggers|cargo|shorts|button up|button-up|flannel|polo|t-shirt|tee|jacket|cardigan|slack|khaki|chino|pants|shirt|quarter zip|crewneck|jorts|skirt|dress|uniform|tracksuit"
def grade(name):
    n = name.lower()
    if re.search(ODD, n): return 'odd'
    if re.search(r"y2k|grunge|graphic|print|patch|chain|ripped|distressed|baggy|oversized|off shoulder|crop", n): return 'in_between'
    if re.search(NORMAL, n): return 'normal'
    return 'in_between'
def fit(id, bottom):
    r = FC.get(id)
    if not r or 'error' in r: return None, 'not checked' if not r else 'failed to load'
    if bottom: cover = 1 - r['stand']['legs'] / BARE['stand']['legs']; tear = (r['sit']['legs'] / max(1, BARE['sit']['legs'])) - (1 - cover)
    else: cover = 1 - r['stand']['torso'] / BARE['stand']['torso']; tear = r['up']['torso'] / max(1, BARE['up']['torso']) - (1 - cover)
    issue = 'body shows' if cover < .8 else 'opens when moving' if tear > .15 else ''
    return round(cover, 2), issue
out = {}
for cat, items in L.items():
    for id, name in items:
        g = grade(name); c, issue = fit(id, cat.startswith('bottom'))
        out[id] = {'name': name, 'cat': cat, 'usability': g, 'cover': c, 'fit_issue': issue}
json.dump(out, open('library/triage_auto.json', 'w'), indent=0)
from collections import Counter
print(Counter(v['usability'] for v in out.values()), Counter(v['fit_issue'] for v in out.values()))
