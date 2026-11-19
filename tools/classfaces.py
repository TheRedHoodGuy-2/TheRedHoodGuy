"""python3 tools/classfaces.py -> docs/sheets/faces/class_faces.jpg : the classroom cast wearing their assigned face families."""
import sys, os, json, subprocess, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from facesheet import body, render
src = open('scenes/classroom.js').read(); ids = re.findall(r"'([mf][0-9]{3})'", src[src.index('export const CLASS'):src.index('export const CLASS') + 400])
ids = list(dict.fromkeys(ids)); chars = {c['id']: c for c in json.load(open('library/characters.json'))}
EM = ['happy', 'laugh', 'shocked', 'angry', 'smug', 'sad', 'scared', 'love']
req = []
for i, cid in enumerate(ids):
    c = chars[cid]; req += [[c['faceSet'], 'neutral', None, c['sex']], [c['faceSet'], EM[i % len(EM)], None, c['sex']]]
specs = json.loads(subprocess.run(['node', 'tools/facespec.mjs', json.dumps(req)], capture_output=True, text=True).stdout)
cells = [(f"{ids[k // 2]} {chars[ids[k // 2]]['faceSet'].split(':')[-1][:14]} {r[1]}", body(ids[k // 2], **sp)) for k, (r, sp) in enumerate(zip(req, specs))]
render(cells, 'docs/sheets/faces/class_faces.jpg', cols=8, cw=230, chh=255, title='Classroom cast with their face families (neutral + one emotion each)')
