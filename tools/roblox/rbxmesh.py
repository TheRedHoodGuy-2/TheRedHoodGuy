"""Roblox FileMesh reader (versions 1.00 to 7.00). Spec: devforum.roblox.com/t/roblox-filemesh-format-specification/326114
Returns dict(v=Nx3 float32, n=Nx3, uv=Nx2 (v down, glTF style), f=Mx3 uint32) with only the top LOD's faces."""
import struct, re
import numpy as np

def _verts(b, o, n, size):
    a = np.frombuffer(b, dtype=np.uint8, count=n * size, offset=o).reshape(n, size)
    fl = a[:, :32].copy().view('<f4').reshape(n, 8)
    return fl[:, 0:3].copy(), fl[:, 3:6].copy(), fl[:, 6:8].copy(), o + n * size

def parse(data):
    head = data[:12].decode('latin1'); ver = head.split()[1]; body = data[13:] if data[12:13] == b'\n' else data[data.index(b'\n') + 1:]
    if ver.startswith('1.'):
        lines = data.decode('latin1').split('\n'); nf = int(lines[1].strip())
        nums = np.array(re.findall(r'-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?', ' '.join(lines[2:])), dtype=np.float32)[:nf * 27].reshape(nf * 3, 9)
        v = nums[:, 0:3] * (0.5 if ver == '1.00' else 1.0); uv = nums[:, 6:8].copy(); uv[:, 1] = 1.0 - uv[:, 1]
        return dict(v=v, n=nums[:, 3:6], uv=uv, f=np.arange(nf * 3, dtype=np.uint32).reshape(nf, 3), version=ver)
    b = body; o = 0
    if ver.startswith('2.') or ver.startswith('3.'):
        hs, vs, fs = struct.unpack_from('<HBB', b, 0)
        if ver.startswith('2.'): nv, nf = struct.unpack_from('<II', b, 4); nl = 0
        else: _, nl, nv, nf = struct.unpack_from('<HHII', b, 4)
        o = hs; v, n, uv, o = _verts(b, o, nv, vs); f = np.frombuffer(b, '<u4', nf * 3, o).reshape(nf, 3); o += nf * 12
        lods = np.frombuffer(b, '<u4', nl, o) if nl else []
    elif ver.startswith('4.') or ver.startswith('5.'):
        hs, lodtype, nv, nf, nl, nb, sbn, nsub, nhq, _ = struct.unpack_from('<HHIIHHIHBB', b, 0)
        o = hs; v, n, uv, o = _verts(b, o, nv, 40)
        if nb > 0: o += nv * 8
        f = np.frombuffer(b, '<u4', nf * 3, o).reshape(nf, 3); o += nf * 12
        lods = np.frombuffer(b, '<u4', nl, o) if nl else []
    else:  # 6.00 / 7.00 chunked
        v = n = uv = f = None; lods = []
        while o + 16 <= len(b):
            ctype = b[o:o + 8].rstrip(b'\0 ').decode('latin1'); cver, size = struct.unpack_from('<II', b, o + 8); o += 16; c = b[o:o + size]; o += size
            if ctype == 'COREMESH':
                if cver == 1:
                    nv = struct.unpack_from('<I', c, 0)[0]; v, n, uv, p = _verts(c, 4, nv, 40)
                    nf = struct.unpack_from('<I', c, p)[0]; f = np.frombuffer(c, '<u4', nf * 3, p + 4).reshape(nf, 3)
                else:
                    import DracoPy
                    sz = struct.unpack_from('<I', c, 0)[0]; m = DracoPy.decode(bytes(c[4:4 + sz]))
                    v = np.array(m.points, np.float32).reshape(-1, 3); f = np.array(m.faces, np.uint32).reshape(-1, 3)
                    n = np.array(m.normals, np.float32).reshape(-1, 3) if getattr(m, 'normals', None) is not None and len(m.normals) else np.zeros_like(v)
                    uv = np.array(m.tex_coord, np.float32).reshape(-1, 2) if getattr(m, 'tex_coord', None) is not None and len(m.tex_coord) else np.zeros((len(v), 2), np.float32)
            elif ctype == 'LODS':
                lt, nhq, nl = struct.unpack_from('<HBI', c, 0); lods = np.frombuffer(c, '<u4', nl, 7)
    f = np.array(f)
    if len(lods) >= 2 and lods[1] > lods[0]: f = f[lods[0]:lods[1]]
    return dict(v=np.array(v), n=np.array(n), uv=np.array(uv), f=f, version=ver)
