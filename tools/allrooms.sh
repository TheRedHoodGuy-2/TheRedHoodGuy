#!/bin/bash
# shoot every room of both houses and tile one contact sheet per floor -> out/rooms/sheet_<house>_<floor>.jpg
cd "$(dirname "$0")/.."
for h in ${HOUSES:-A B}; do for f in ${FLOORS:-ground up basement attic}; do node tools/roomshots.mjs $h $f 2>&1 | grep -v "^\s*at "; done; done
python3 - <<'PY'
from PIL import Image, ImageDraw, ImageFont
import glob, os
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',22)
for h in 'AB':
  for fl in ['ground','up','basement','attic']:
    fs=sorted(glob.glob(f'out/rooms/{h}_{fl}_*.jpg'))
    if not fs: continue
    W,H=640,360; cols=3; sheet=Image.new('RGB',(W*cols,H*((len(fs)+cols-1)//cols)),'#111')
    for i,p in enumerate(fs):
      im=Image.open(p).resize((W,H)); d=ImageDraw.Draw(im); d.text((8,6),f'{h} {fl}: '+p.split('_',2)[2][:-4],fill='white',font=f,stroke_width=2,stroke_fill='black'); sheet.paste(im,((i%cols)*W,(i//cols)*H))
    sheet.save(f'out/rooms/sheet_{h}_{fl}.jpg',quality=85)
PY
