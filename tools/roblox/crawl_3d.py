import requests, json, time, os
S = requests.Session(); S.headers['User-Agent'] = 'Roblox/WinInet'
KEEP = {64: 'l_tshirt', 65: 'l_shirt', 66: 'l_pants', 67: 'l_jacket', 68: 'l_sweater', 69: 'l_shorts', 70: 'l_shoe_left', 71: 'l_shoe_right', 72: 'l_dress_skirt'}
seen = json.load(open('index.json')) if os.path.exists('index.json') else {}
def run(kw, pages):
    cur = None
    for p in range(pages):
        q = {'Keyword': kw, 'SortType': 1, 'IncludeNotForSale': 'true', 'Limit': 30}
        if cur: q['Cursor'] = cur
        for t in range(5):
            r = S.get('https://catalog.roblox.com/v1/search/items/details', params=q, timeout=40)
            if r.status_code == 429: time.sleep(10 + 10 * t); continue
            break
        if r.status_code != 200: print('HTTP', r.status_code, kw); return
        j = r.json(); new = 0
        for d in j.get('data', []):
            if d.get('itemType') == 'Asset' and d.get('assetType') in KEEP and str(d['id']) not in seen:
                seen[str(d['id'])] = dict(id=d['id'], name=d.get('name'), kind=KEEP[d['assetType']], creator=d.get('creatorName'), fav=d.get('favoriteCount'), kw=kw); new += 1
        cur = j.get('nextPageCursor'); time.sleep(1.2)
        if not cur: break
    print(kw, 'total', len(seen), flush=True); json.dump(seen, open('index.json', 'w'))
def run2(sub, kw, pages):
    cur = None
    for p in range(pages):
        q = {'Category': 3, 'Subcategory': sub, 'SortType': 1, 'IncludeNotForSale': 'true', 'Limit': 30}
        if kw: q['Keyword'] = kw
        if cur: q['Cursor'] = cur
        for t in range(5):
            r = S.get('https://catalog.roblox.com/v1/search/items/details', params=q, timeout=40)
            if r.status_code == 429: time.sleep(10 + 10 * t); continue
            break
        if r.status_code != 200: print('HTTP', r.status_code, sub, kw); break
        j = r.json()
        for d in j.get('data', []):
            if d.get('itemType') == 'Asset' and d.get('assetType') in KEEP and str(d['id']) not in seen:
                seen[str(d['id'])] = dict(id=d['id'], name=d.get('name'), kind=KEEP[d['assetType']], creator=d.get('creatorName'), fav=d.get('favoriteCount'), kw=f'{sub} {kw}')
        cur = j.get('nextPageCursor'); time.sleep(1.2)
        if not cur: break
    print(sub, kw, 'total', len(seen), flush=True); json.dump(seen, open('index.json', 'w'))
for sub in (58, 59, 60, 61, 62, 63, 65):
    for kw in ('', 'boy', 'girl', 'black', 'white', 'aesthetic', 'y2k', 'basic'): run2(sub, kw, 12)
for kw in ('sneakers', 'shoes', 'boots', 'heels', 'slides'): run(kw + ' 3d', 6); run(kw, 6)
print('TOTAL', len(seen))
