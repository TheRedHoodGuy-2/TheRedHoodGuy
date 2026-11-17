import requests, json, time, sys
S = requests.Session(); S.headers['User-Agent'] = 'Roblox/WinInet'
seen = {}
def run(params, pages):
    cur = None
    for p in range(pages):
        q = dict(params, Limit=30)
        if cur: q['Cursor'] = cur
        for t in range(4):
            r = S.get('https://catalog.roblox.com/v1/search/items/details', params=q, timeout=40)
            if r.status_code == 429: time.sleep(10 + 10 * t); continue
            break
        if r.status_code != 200: print('HTTP', r.status_code, r.text[:150]); return
        j = r.json(); new = 0
        for d in j.get('data', []):
            if d.get('itemType') == 'Asset' and d.get('assetType') == 41 and d['id'] not in seen:
                seen[d['id']] = dict(id=d['id'], name=d.get('name'), creator=d.get('creatorName'), price=d.get('price'), fav=d.get('favoriteCount')); new += 1
        print(params.get('SortType'), params.get('Keyword', ''), 'page', p, 'got', len(j.get('data', [])), 'new', new, 'total', len(seen), flush=True)
        cur = j.get('nextPageCursor'); time.sleep(1.2)
        if not cur: return
KW = ['hair', 'hairstyle', 'bangs', 'ponytail', 'curly hair', 'braids', 'afro', 'messy hair', 'fluffy hair', 'spiky hair', 'bun', 'dreads', 'locs', 'mullet', 'buzz cut', 'wavy hair', 'straight hair', 'pigtails', 'emo hair', 'bob hair', 'long hair', 'short hair', 'side part', 'twists', 'cornrows', 'parted hair', 'slicked back', 'messy bun', 'space buns', 'boy hair', 'girl hair', 'black hair', 'brown hair', 'blonde hair', 'ginger hair']
for kw in KW:
    run({'Keyword': kw, 'SortType': 1, 'IncludeNotForSale': 'true'}, 10)
    json.dump(list(seen.values()), open('index.json', 'w'))
print('TOTAL', len(seen))
