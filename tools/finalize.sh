#!/bin/bash
# tools/finalize.sh <topic> <rendered.mp4> [mbps=10]  -> out/<topic>_FINAL.mp4
# burns topics/<t>/captions_v2.ass, overlays the channel avatar into the subscribe card (times from topics/<t>/subscribe_ui.json),
# muxes out/<t>_final_mix.wav, 10-12 Mbps + faststart (15 Mbps would not play on Xavier's laptop, 2026-11-27).
T=$1; V=$2; B=${3:-10}; cd "$(dirname "$0")/.."
read A0 A1 DUR <<< $(python3 -c "import json,subprocess;s=json.load(open('topics/$T/subscribe_ui.json'));d=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','$V']).decode().strip();print(s['in'],s['out'],d)")
[ -f topics/$T/avatar.png ] || python3 -c "
from PIL import Image, ImageDraw
im=Image.open('library/brand/channel_avatar.jpg').convert('RGBA');w,h=im.size;m=min(w,h);S=208
im=im.crop(((w-m)//2,(h-m)//2,(w+m)//2,(h+m)//2)).resize((S,S),Image.LANCZOS)
k=Image.new('L',(S*4,S*4),0);ImageDraw.Draw(k).ellipse((0,0,S*4-1,S*4-1),fill=255);im.putalpha(k.resize((S,S),Image.LANCZOS))
im.resize((104,104),Image.LANCZOS).save('topics/$T/avatar.png')"
FO=$(python3 -c "print($A1-.16)")
ffmpeg -v error -y -i $V -loop 1 -framerate 30 -t $DUR -i topics/$T/avatar.png -i out/${T}_final_mix.wav -filter_complex "[0:v]ass=topics/$T/captions_v2.ass[v];[1:v]format=rgba,fade=in:st=$A0:d=0.2:alpha=1,fade=out:st=$FO:d=0.16:alpha=1[a];[v][a]overlay=x=160:y='1286+40*max(0\,1-(t-$A0)/0.22)':enable='between(t,$A0,$A1)'[o]" -map "[o]" -map 2:a -c:v libx264 -preset slow -profile:v high -level 4.1 -b:v ${B}M -maxrate $((B+2))M -bufsize $((B*2))M -pix_fmt yuv420p -r 30 -c:a aac -b:a 256k -shortest -movflags +faststart out/${T}_FINAL.mp4 && echo "wrote out/${T}_FINAL.mp4"
