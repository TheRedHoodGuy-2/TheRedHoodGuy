"""Minimal Roblox binary model reader: lists instances with Name and Texture (decals / textures).
python3 tools/rbxm.py file.rbxm -> JSON [{class, name, texture}]"""
import struct, sys, json, lz4.block, zstandard
def chunks(b):
    assert b[:8] == b'<roblox!', b[:8]
    p = 32
    while p < len(b):
        name = b[p:p + 4]; clen, ulen = struct.unpack('<II', b[p + 4:p + 12]); p += 16
        raw = b[p:p + (clen or ulen)]; p += clen or ulen
        if clen:
            data = zstandard.ZstdDecompressor().decompress(raw, max_output_size=ulen) if raw[:4] == b'\x28\xb5\x2f\xfd' else lz4.block.decompress(raw, uncompressed_size=ulen)
        else: data = raw
        yield name, data
        if name == b'END\x00': break
def rstr(d, o): n = struct.unpack('<I', d[o:o + 4])[0]; return d[o + 4:o + 4 + n].decode('utf-8', 'replace'), o + 4 + n
def ints(d, o, n):   # interleaved, zigzag, delta-accumulated int32 referents
    raw = d[o:o + 4 * n]; v = []
    for i in range(n):
        x = (raw[i] << 24) | (raw[n + i] << 16) | (raw[2 * n + i] << 8) | raw[3 * n + i]; x = (x >> 1) ^ -(x & 1); v.append(x)
    acc = 0; out = []
    for x in v: acc += x; out.append(acc)
    return out, o + 4 * n
def read(path):
    b = open(path, 'rb').read(); classes = {}; props = {}; refs = {}; parent = {}
    for name, d in chunks(b):
        if name == b'INST':
            cid = struct.unpack('<I', d[:4])[0]; cname, o = rstr(d, 4); o += 1; n = struct.unpack('<I', d[o:o + 4])[0]; classes[cid] = (cname, n); refs[cid], _ = ints(d, o + 4, n)
        elif name == b'PROP':
            cid = struct.unpack('<I', d[:4])[0]; pname, o = rstr(d, 4); t = d[o]; o += 1
            if pname in ('Name', 'Texture', 'Image') and t == 1:
                vals = []
                for _ in range(classes[cid][1]): v, o = rstr(d, o); vals.append(v)
                props.setdefault(cid, {})[pname] = vals
        elif name == b'PRNT':
            n = struct.unpack('<I', d[1:5])[0]; ch, o = ints(d, 5, n); pa, o = ints(d, o, n); parent.update(zip(ch, pa))
    out = []; byref = {}
    for cid, (cname, n) in classes.items():
        P = props.get(cid, {})
        for i in range(n): it = {'class': cname, 'name': P.get('Name', [''] * n)[i], 'texture': (P.get('Texture') or P.get('Image') or [''] * n)[i], 'ref': refs[cid][i]}; out.append(it); byref[it['ref']] = it
    for it in out:
        path = []; r = parent.get(it['ref'], -1)
        while r in byref and len(path) < 12: path.append(byref[r]['name']); r = parent.get(r, -1)
        it['path'] = '/'.join(reversed(path))
    return out
if __name__ == '__main__': print(json.dumps(read(sys.argv[1]), indent=1))
