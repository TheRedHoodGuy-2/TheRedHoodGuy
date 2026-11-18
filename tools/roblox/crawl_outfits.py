import requests, json, time, os
S = requests.Session(); S.headers['User-Agent'] = 'Roblox/WinInet'
KEEP = {2: 'tshirt', 11: 'shirt', 12: 'pants', 8: 'hat', 42: 'face', 43: 'neck', 44: 'shoulder', 45: 'front', 46: 'back', 47: 'waist'}
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
TOPS = ['shirt', 't-shirt', 'tank top', 'crop top', 'hoodie', 'sweater', 'jacket', 'cardigan', 'blouse', 'polo', 'flannel', 'jersey', 'varsity jacket', 'school uniform', 'suit', 'tuxedo', 'dress', 'overalls', 'puffer jacket', 'denim jacket', 'leather jacket', 'turtleneck', 'button up', 'vest', 'scrubs', 'police uniform', 'chef', 'pajamas', 'winter coat', 'trench coat', 'graphic tee', 'striped shirt', 'plain shirt']
BOTTOMS = ['pants', 'jeans', 'joggers', 'sweatpants', 'cargo pants', 'shorts', 'skirt', 'mini skirt', 'pleated skirt', 'leggings', 'trousers', 'khaki pants', 'ripped jeans', 'baggy jeans', 'flare jeans', 'sneakers', 'boots', 'shoes']
STYLE = ['boy outfit', 'girl outfit', 'aesthetic', 'y2k', 'preppy', 'emo', 'streetwear', 'casual', 'sporty', 'cute', 'grunge', 'vintage', 'cozy', 'formal', 'summer', 'winter']
ACC = ['cap', 'beanie', 'baseball cap', 'bucket hat', 'headphones', 'glasses', 'sunglasses', 'backpack', 'bag', 'purse', 'watch', 'bracelet', 'necklace', 'chain', 'scarf', 'earrings', 'tie', 'bow', 'headband', 'mask', 'belt', 'gloves', 'umbrella', 'crown', 'hat']
for kw in TOPS + BOTTOMS + STYLE + ACC: run(kw, 8)
print('TOTAL', len(seen))
