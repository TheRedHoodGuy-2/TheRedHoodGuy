#!/bin/bash
# tools/musicmix.sh <topic> <dur> [music.mp3]  -> out/<topic>_final_mix.wav
# voice+SFX mix (out/<topic>_mix.wav from sfxmix.py) + music -17 dB, sidechain-ducked by the voice, 1 s fade out, loudnorm -14 LUFS.
T=$1; D=$2; M=${3:-library/music/regular_bg_temporex_numbers.mp3}; cd "$(dirname "$0")/.."; F=$(python3 -c "print($D-1)")
ffmpeg -v error -y -stream_loop -1 -i $M -i topics/$T/voice/voice.wav -i out/${T}_mix.wav -filter_complex "[0:a]atrim=0:$D,asetpts=N/SR/TB,aresample=48000,aformat=channel_layouts=stereo,volume=-17dB,afade=t=out:st=$F:d=1[m];[1:a]aresample=48000,aformat=channel_layouts=stereo[k];[m][k]sidechaincompress=threshold=0.03:ratio=4:attack=20:release=300[md];[2:a]aresample=48000,aformat=channel_layouts=stereo[x];[x][md]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[o]" -map "[o]" -ar 48000 out/${T}_final_mix.wav && echo "wrote out/${T}_final_mix.wav"
