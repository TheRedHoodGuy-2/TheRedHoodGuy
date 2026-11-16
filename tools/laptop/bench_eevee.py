# Laptop render benchmark (2026-11-16). Run by run_bench.bat with the installed Blender, headless.
# Builds a stand-in scene (one beveled R6-style character with subsurface skin + ~170 beveled set pieces, 3 lights),
# renders 3 Eevee frames at 1080x1920 and 1 Cycles frame at 540x960, and writes bench_result.txt + bench_*.png
# next to this file. Reads nothing else and changes nothing else on the machine.
import bpy, time, os, sys, random, platform
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = []
def log(*a):
    s = ' '.join(str(x) for x in a); print(s); OUT.append(s)
    open(os.path.join(HERE, 'bench_result.txt'), 'w').write('\n'.join(OUT) + '\n')
log('blender', bpy.app.version_string, '| os', platform.platform(), '| cpu threads', os.cpu_count())
bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
def mat(name, col, rough=.5, sss=0, bump=0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss; b.inputs['Subsurface Radius'].default_value = (1, .35, .2); b.inputs['Subsurface Scale'].default_value = .03
    if bump:
        n = nt.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = 400; n.inputs['Detail'].default_value = 4
        bp = nt.nodes.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = bump
        nt.links.new(n.outputs['Fac'], bp.inputs['Height']); nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m
def box(loc, size, m, bevel=.02):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc); o = bpy.context.object; o.scale = size; o.data.materials.append(m)
    bv = o.modifiers.new('bevel', 'BEVEL'); bv.width = bevel; bv.segments = 4
    for p in o.data.polygons: p.use_smooth = True
    return o
skin = mat('skin', (.86, .6, .42), .45, .35, .1); red = mat('red', (.7, .08, .06), .6, 0, .15); navy = mat('navy', (.08, .1, .25), .6, 0, .15)
U = .34  # R6 unit: 1.7 m tall
box((0, 0, 4.5 * U), (1.15 * U, 1.15 * U, U), skin, .09); box((0, 0, 3 * U), (2 * U, U, 2 * U), red)
for sx in (-1, 1):
    box((sx * 1.5 * U, 0, 3 * U), (U, U, 2 * U), red); box((sx * .5 * U, 0, U), (U, U, 2 * U), navy)
wood = mat('wood', (.55, .36, .2), .5, 0, .05); wall = mat('wall', (.85, .84, .78), .8, 0, .03); floor = mat('floor', (.6, .62, .6), .3); metal = mat('metal', (.5, .5, .52), .3)
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0)); bpy.context.object.data.materials.append(floor)
box((0, 6, 1.6), (12, .2, 3.2), wall, .01); box((-6, 0, 1.6), (.2, 12, 3.2), wall, .01); box((6, 0, 1.6), (.2, 12, 3.2), wall, .01)
random.seed(4)
for r in range(5):
    for c in range(6):
        x, y = -4 + c * 1.6, 1.2 + r * .9
        if abs(x) < .6 and y < 1.5: continue
        box((x, y, .72), (.7, .5, .04), wood); box((x, y + .45, .45), (.4, .4, .04), wood)
        for lx, ly in ((-.3, -.2), (.3, -.2), (-.3, .2), (.3, .2)): box((x + lx, y + ly, .36), (.03, .03, .7), metal, .005)
log('objects', len(S.objects))
def light(loc, energy, size, col):
    bpy.ops.object.light_add(type='AREA', location=loc); l = bpy.context.object; l.data.energy = energy; l.data.size = size; l.data.color = col
    import mathutils; l.rotation_euler = (mathutils.Vector((0, 0, 1)) - l.location).to_track_quat('-Z', 'Y').to_euler()
light((2.5, -3, 3), 900, 2, (1, .95, .88)); light((-3, 2, 2.5), 500, 1, (.75, .85, 1)); light((0, 3, 3), 400, 3, (1, 1, 1))
w = bpy.data.worlds.new('w'); S.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (.5, .65, .9, 1)
import mathutils
bpy.ops.object.camera_add(location=(1.2, -4.2, 1.5)); cam = bpy.context.object; cam.data.lens = 50
cam.rotation_euler = (mathutils.Vector((0, 0, 1.05)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.dof.use_dof = True; cam.data.dof.focus_distance = 4.4; cam.data.dof.aperture_fstop = 2.8; S.camera = cam
engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]; log('engines', engines)
def render(name, frames):
    for f in range(frames):
        S.frame_set(f + 1); cam.location.x += .05; S.render.filepath = os.path.join(HERE, f'{name}_{f}.png')
        t = time.time(); bpy.ops.render.render(write_still=True); log('RENDER_SECONDS', name, S.render.resolution_x, 'x', S.render.resolution_y, 'frame', f, round(time.time() - t, 1))
only = os.environ.get('BENCH_ONLY', '')
try:
    S.render.engine = [e for e in engines if 'EEVEE' in e][0]; S.render.resolution_x, S.render.resolution_y = 1080, 1920
    try: S.eevee.taa_render_samples = 16
    except Exception as e: log('eevee samples not set', e)
    if only != 'cycles':
        render('bench_eevee', 3)
        try:
            import gpu; log('gpu', gpu.platform.vendor_get(), '|', gpu.platform.renderer_get(), '|', gpu.platform.backend_type_get())
        except Exception as e: log('gpu info failed', e)
except Exception as e: log('EEVEE FAILED', repr(e))
try:
    if only != 'eevee':
        S.render.engine = 'CYCLES'; S.cycles.samples = 48; S.cycles.use_denoising = True; S.cycles.device = 'CPU'; S.render.resolution_x, S.render.resolution_y = 540, 960
        render('bench_cycles', 1)
except Exception as e: log('CYCLES FAILED', repr(e))
log('BENCH DONE')
