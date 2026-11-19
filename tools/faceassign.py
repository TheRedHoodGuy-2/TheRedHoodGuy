"""python3 tools/faceassign.py  -> sets faceSet on every bank character from library/face_model.json (stable per id).
Two seeded rolls per character: 'made or other?' (p_other by archetype), then a weighted pick inside that pool.
A character with "faceLock" keeps the face set by hand."""
import json, hashlib, collections, os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
M = json.load(open('library/face_model.json')); C = json.load(open('library/characters.json'))
roll = lambda key: int(hashlib.md5(key.encode()).hexdigest(), 16) % 10000 / 10000
def pick(pool, r):
    tot = sum(pool.values()); acc = 0
    for k, w in pool.items():
        acc += w / tot
        if r < acc: return k
    return k
for c in C:
    if c.get('faceLock'): continue
    S = M[c['sex']]; p = S['p_other'].get(c['archetype'], S['p_other']['_default'])
    other = roll('pool' + c['id']) < p; c['faceSet'] = pick(S['other' if other else 'made'], roll('pick' + c['id'])); c['faceKind'] = 'other' if other else 'made'
json.dump(C, open('library/characters.json', 'w'), indent=1)
for s in 'fm':
    n = [c for c in C if c['sex'] == s]; print(s, 'other share', round(sum(c['faceKind'] == 'other' for c in n) / len(n), 2), collections.Counter(c['faceSet'] for c in n).most_common())
