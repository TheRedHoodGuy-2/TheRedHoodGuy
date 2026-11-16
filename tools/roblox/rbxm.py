"""Minimal reader for Roblox binary model files (.rbxm / asset files from assetdelivery).
Returns instances: [{'id', 'class', 'parent', 'props': {...}}]. Only the property types we need are decoded;
others are skipped. Format notes: research/roblox_formats.md."""
import struct, re
import lz4.block, zstandard

def _u32(b, o): return struct.unpack_from('<I', b, o)[0]
def _i32(b, o): return struct.unpack_from('<i', b, o)[0]

def _interleaved_u32(b, o, n):
    out = []
    for i in range(n):
        out.append((b[o + i] << 24) | (b[o + n + i] << 16) | (b[o + 2 * n + i] << 8) | b[o + 3 * n + i])
    return out, o + 4 * n
def _zig(x): return (x >> 1) ^ -(x & 1)
def _ints(b, o, n):
    v, o = _interleaved_u32(b, o, n); return [_zig(x) for x in v], o
def _rfloat(x):
    u = (x >> 1) | ((x & 1) << 31); return struct.unpack('>f', struct.pack('>I', u))[0]
def _floats(b, o, n):
    v, o = _interleaved_u32(b, o, n); return [_rfloat(x) for x in v], o
def _refs(b, o, n):
    v, o = _ints(b, o, n); acc = 0; out = []
    for x in v: acc += x; out.append(acc)
    return out, o
def _str(b, o):
    n = _u32(b, o); return b[o + 4:o + 4 + n], o + 4 + n

_N = [(1, 0, 0), (0, 1, 0), (0, 0, 1), (-1, 0, 0), (0, -1, 0), (0, 0, -1)]
def _basic_rot(i):
    i -= 1; x = _N[i // 6]; y = _N[i % 6]
    z = (x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0])
    # rows of the matrix; columns are right(x), up(y), back(z)
    return [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]]

def parse_xml(data):
    import xml.etree.ElementTree as ET
    root = ET.fromstring(data); out = []; n = [0]
    def val(e):
        t = e.tag
        if t in ('string', 'ProtectedString'): return e.text or ''
        if t == 'Content': return ''.join(e.itertext()).strip()
        if t in ('float', 'double'): return float(e.text)
        if t in ('int', 'token', 'int64'): return int(e.text)
        if t == 'bool': return e.text == 'true'
        if t in ('Vector3', 'Color3'):
            return tuple(float(c.text) for c in e) if len(e) else e.text
        if t == 'Color3uint8':
            v = int(e.text); return ((v >> 16) & 255, (v >> 8) & 255, v & 255)
        if t == 'CoordinateFrame':
            d = {c.tag: float(c.text) for c in e}
            return {'pos': (d['X'], d['Y'], d['Z']), 'rot': [d['R00'], d['R01'], d['R02'], d['R10'], d['R11'], d['R12'], d['R20'], d['R21'], d['R22']]}
        return None
    def walk(item, parent):
        i = n[0]; n[0] += 1; props = {}
        pe = item.find('Properties')
        if pe is not None:
            for e in pe:
                v = val(e)
                if v is not None: props[e.get('name')] = v
        out.append({'id': i, 'class': item.get('class'), 'parent': parent, 'props': props})
        for c in item.findall('Item'): walk(c, i)
    for it in root.findall('Item'): walk(it, -1)
    return out

def parse(data):
    if data[:8] != b'<roblox!' and data.lstrip()[:7] == b'<roblox': return parse_xml(data)
    assert data[:8] == b'<roblox!', 'not a roblox model file: %r' % data[:16]
    o = 16; ncls = _i32(data, o); ninst = _i32(data, o + 4); o += 16
    classes = {}; inst = {}; shared = []
    while o < len(data):
        name = data[o:o + 4]; clen = _u32(data, o + 4); ulen = _u32(data, o + 8); o += 16
        if clen == 0: chunk = data[o:o + ulen]; o += ulen
        else:
            raw = data[o:o + clen]; o += clen
            chunk = zstandard.ZstdDecompressor().decompress(raw, max_output_size=ulen) if raw[:4] == b'\x28\xb5\x2f\xfd' else lz4.block.decompress(raw, uncompressed_size=ulen)
        if name == b'END\0': break
        if name == b'SSTR':
            p = 4; n = _u32(chunk, p); p += 4
            for _ in range(n):
                p += 16; s, p = _str(chunk, p); shared.append(s)
        elif name == b'INST':
            p = 0; cid = _i32(chunk, p); p += 4; cname, p = _str(chunk, p); fmt = chunk[p]; p += 1; n = _i32(chunk, p); p += 4
            ids, p = _refs(chunk, p, n); classes[cid] = (cname.decode(), ids)
            for i in ids: inst[i] = {'id': i, 'class': cname.decode(), 'parent': -1, 'props': {}}
        elif name == b'PROP':
            p = 0; cid = _i32(chunk, p); p += 4; pname, p = _str(chunk, p); pname = pname.decode('latin1')
            if p >= len(chunk): continue
            t = chunk[p]; p += 1; cname, ids = classes[cid]; n = len(ids); vals = None
            try:
                if t == 0x01:
                    vals = []
                    for _ in range(n):
                        s, p = _str(chunk, p); vals.append(s.decode('utf8', 'replace') if len(s) < 4096 else s)
                elif t == 0x02: vals = [bool(x) for x in chunk[p:p + n]]
                elif t == 0x03: vals, p = _ints(chunk, p, n)
                elif t == 0x04: vals, p = _floats(chunk, p, n)
                elif t == 0x05: vals = list(struct.unpack_from('<%dd' % n, chunk, p))
                elif t in (0x0B, 0x12): vals, p = _interleaved_u32(chunk, p, n)
                elif t == 0x0C or t == 0x0E:
                    a, p = _floats(chunk, p, n); b_, p = _floats(chunk, p, n); c, p = _floats(chunk, p, n); vals = list(zip(a, b_, c))
                elif t == 0x0D:
                    a, p = _floats(chunk, p, n); b_, p = _floats(chunk, p, n); vals = list(zip(a, b_))
                elif t in (0x10, 0x11):
                    rots = []
                    for _ in range(n):
                        rid = chunk[p]; p += 1
                        if rid == 0:
                            if t == 0x10: rots.append(list(struct.unpack_from('<9f', chunk, p))); p += 36
                            else: rots.append(None); p += 6
                        else: rots.append(_basic_rot(rid))
                    a, p = _floats(chunk, p, n); b_, p = _floats(chunk, p, n); c, p = _floats(chunk, p, n)
                    vals = [{'pos': (a[i], b_[i], c[i]), 'rot': rots[i]} for i in range(n)]
                elif t == 0x13: vals, p = _refs(chunk, p, n)
                elif t == 0x1A: vals = [(chunk[p + i], chunk[p + n + i], chunk[p + 2 * n + i]) for i in range(n)]
                elif t == 0x1C:
                    idx, p = _interleaved_u32(chunk, p, n); vals = [shared[i] if i < len(shared) else b'' for i in idx]
                elif t == 0x22:
                    # Content: source types, then uri strings (count-prefixed). Fall back to regex per value.
                    st, p = _ints(chunk, p, n); cnt = _u32(chunk, p); p += 4; uris = []
                    for _ in range(cnt):
                        s, p = _str(chunk, p); uris.append(s.decode('utf8', 'replace'))
                    it = iter(uris); vals = [next(it, '') if s == 1 else '' for s in st]
            except Exception as e:
                vals = None
            if vals is None:
                # unknown type: keep any asset urls found so nothing useful is lost
                found = re.findall(rb'(?:rbxassetid://|https?://www\.roblox\.com/asset/?\?id=)(\d+)', chunk[p:])
                if found and len(found) == n: vals = ['rbxassetid://' + f.decode() for f in found]
            if vals is not None:
                for i, v in zip(ids, vals): inst[i]['props'][pname] = v
        elif name == b'PRNT':
            p = 1; n = _i32(chunk, p); p += 4; ch, p = _refs(chunk, p, n); pa, p = _refs(chunk, p, n)
            for c, par in zip(ch, pa):
                if c in inst: inst[c]['parent'] = par
    return list(inst.values())

def asset_id(s):
    if not s: return None
    if isinstance(s, bytes): s = s.decode('latin1')
    m = re.search(r'(\d{4,})', s); return int(m.group(1)) if m else None

if __name__ == '__main__':
    import sys, json
    for i in parse(open(sys.argv[1], 'rb').read()):
        pr = {k: (v if not isinstance(v, bytes) else '<%d bytes>' % len(v)) for k, v in i['props'].items()}
        print(i['id'], i['class'], 'parent', i['parent'], json.dumps(pr, default=str)[:600])
