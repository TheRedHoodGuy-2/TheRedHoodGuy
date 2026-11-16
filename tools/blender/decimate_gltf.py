# python3 tools/blender/decimate_gltf.py <in.gltf> <out.glb> <target_tris> [texture_px]
# Asset factory step: bring a heavy model (Poly Haven trees are 100 MB+) down to a film-friendly size.
import bpy, sys, os
src, out, target = sys.argv[1], sys.argv[2], int(sys.argv[3]); px = int(sys.argv[4]) if len(sys.argv) > 4 else 1024
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']; tris = lambda: sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes)
t0 = tris(); ratio = min(1, target / max(t0, 1)); print('tris before', t0, 'ratio', round(ratio, 4))
for o in meshes:
    if ratio < 1:
        m = o.modifiers.new('d', 'DECIMATE'); m.ratio = ratio; bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier='d')
for im in bpy.data.images:
    if im.size[0] > px: im.scale(px, int(px * im.size[1] / im.size[0]))
print('tris after', tris(), 'objects', len(meshes), 'materials', [m.name for m in bpy.data.materials])
import mathutils
mn = [1e9] * 3; mx = [-1e9] * 3
for o in meshes:
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c)
        for k in range(3): mn[k] = min(mn[k], w[k]); mx[k] = max(mx[k], w[k])
print('bounds (blender z-up) min', [round(v, 2) for v in mn], 'max', [round(v, 2) for v in mx])
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=85, export_apply=True)
print('wrote', out, os.path.getsize(out) // 1024, 'KB')
