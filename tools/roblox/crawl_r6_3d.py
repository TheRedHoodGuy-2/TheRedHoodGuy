import requests, json, time, os
S = requests.Session(); S.headers['User-Agent'] = 'Roblox/WinInet'
seen = json.load(open('index.json')) if os.path.exists('index.json') else {}
def run(sub, kw, pages=10):
    cur = None
    for p in range(pages):
        q = {'Category': 3, 'Subcategory': sub, 'Keyword': kw, 'SortType': 1, 'IncludeNotForSale': 'true', 'Limit': 30}
        if cur: q['Cursor'] = cur
        for t in range(5):
            try: r = S.get('https://catalog.roblox.com/v1/search/items/details', params=q, timeout=40)
            except Exception: time.sleep(15); continue
            if r.status_code == 429: time.sleep(10 + 10 * t); continue
            break
        if r.status_code != 200: break
        j = r.json()
        for d in j.get('data', []):
            if d.get('itemType') == 'Asset' and str(d['id']) not in seen: seen[str(d['id'])] = dict(id=d['id'], name=d.get('name'), type=d.get('assetType'), creator=d.get('creatorName'), fav=d.get('favoriteCount'), q=f'{sub} {kw}')
        cur = j.get('nextPageCursor'); time.sleep(1.2)
        if not cur: break
    print(sub, kw, len(seen), flush=True); json.dump(seen, open('index.json', 'w'))
for sub, kws in ((63, ('r6 pants', 'r6 jacket', 'classic r6', '3d r6 clothing', 'r6 outfit')), (65, None)):
    for kw in kws or ('r6', 'r6 3d', 'blocky', 'r6 hoodie', 'r6 shirt', 'r6 girl', 'r6 boy', 'r6 pants', 'r6 jacket', 'classic r6', '3d r6 clothing', 'r6 outfit'): run(sub, kw)
print('TOTAL', len(seen))
