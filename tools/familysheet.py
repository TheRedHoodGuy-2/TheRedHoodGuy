"""python3 tools/familysheet.py <set> <char id> [out]  -> one face family on one bank character: all 32 emotions + talking."""
import sys, os, json, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from facesheet import body, render
EMO = ['neutral','happy','laugh','giggle','sad','crying','angry','furious','shocked','scared','nervous','smug','wink','love','confused','sleepy','surprised','terrified','disgusted','annoyed','suspicious','embarrassed','excited','proud','pout','evil','crazy','thinking','bored','dizzy','ko','determined']
TALK = [('neutral', v) for v in ['MBP','AI','E','O','UW','FV','L','talkSmile']]
def run(st, cid, out=None):
    chars = {c['id']: c for c in json.load(open('library/characters.json'))}; sex = chars[cid]['sex']
    req = [[st, e, None, sex] for e in EMO] + [[st, e, v, sex] for e, v in TALK]
    specs = json.loads(subprocess.run(['node', 'tools/facespec.mjs', json.dumps(req)], capture_output=True, text=True).stdout)
    cells = [((r[1] if not r[2] else 'talk ' + r[2]), body(cid, **sp)) for r, sp in zip(req, specs)]
    out = out or f"docs/sheets/faces/{st.replace(':', '_')}_{cid}.jpg"; os.makedirs(os.path.dirname(out), exist_ok=True)
    render(cells, out, cols=8, cw=230, chh=255, title=f'{st} on {cid} ({chars[cid]["name"]}): 32 emotions + talking mouths'); return out
if __name__ == '__main__': print(run(*sys.argv[1:]))
