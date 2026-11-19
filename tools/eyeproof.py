"""python3 tools/eyeproof.py -> docs/sheets/faces/eye_rig_05.jpg: the 05 face with eyes, pupils and brows as separate layers."""
import sys, os, json, numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from facesheet import body, render
D = 'assets/faces/sprites/05_intimidating'
def cen(f):
    a = np.array(Image.open(f'{D}/{f}.png'))[..., 3]; ys, xs = np.where(a > 100); return float(xs.mean()), float(ys.mean())
cl, cr = cen('brow_sl'), cen('brow_sr')
def face(ix=0, iy=0, bl=(0, 0), br=(0, 0), mouth='C02'):
    # bl / br = (raise px, tilt rad) for the brow on canvas-left / canvas-right
    return {'faceSprite': {'layers': [f'{D}/eyebase.png', {'u': f'{D}/iris.png', 'dx': ix, 'dy': iy, 'clip': f'{D}/irisclip.png'},
        f'{D}/eyelines.png', {'u': f'{D}/brow_sl.png', 'dy': -bl[0], 'rot': bl[1], 'cx': cl[0], 'cy': cl[1]}, {'u': f'{D}/brow_sr.png', 'dy': -br[0], 'rot': br[1], 'cx': cr[0], 'cy': cr[1]}, f'{D}/{mouth}.png'],
        'place': {'k': .96, 'dy': -.06}}}
cells = [('look ahead', face()), ('look left', face(ix=22)), ('look right', face(ix=-22)), ('look up', face(iy=-7)), ('look down', face(iy=9)),
         ('brows up', face(bl=(26, 0), br=(26, 0))), ('angry brows', face(bl=(-6, .22), br=(-6, -.22))), ('sad brows', face(bl=(12, -.24), br=(12, .24))),
         ('one brow up', face(bl=(28, -.08), br=(0, 0))), ('suspicious', face(ix=18, bl=(-5, .12), br=(4, 0))), ('worried glance', face(ix=-16, iy=4, bl=(9, -.18), br=(9, .18))), ('surprised', face(iy=-3, bl=(30, 0), br=(30, 0), mouth='C15'))]
render([(n, body('m005', yaw=0, **f)) for n, f in cells], 'docs/sheets/faces/eye_rig_05.jpg', cols=4, cw=420, chh=460, title='Face 05 split into layers: pupils and brows move on their own (no new drawings needed)')
