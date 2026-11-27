#!/bin/bash
# tools/render_chunks.sh <topic> <dur> [outdir]  -- final 1080x1920 30 fps render in ~10-min resumable pieces
# (render.mjs skips frames already on disk, so each piece continues the last; a foreground call can run ~10 min max).
T=$1; D=$2; O=${3:-/tmp/${T}_final}; mkdir -p $O; cd "$(dirname "$0")/.."
N=$(python3 -c "print(round(30*$D))")
while [ "$(ls $O | wc -l)" -lt "$N" ]; do HITEX=1 timeout 575 node tools/render.mjs "{\"scene\":\"$T\",\"w\":1080,\"h\":1920}" $O --fps 30 --dur $D > /tmp/${T}_final.log 2>&1; echo "$(ls $O | wc -l)/$N frames"; [ -n "$ONCE" ] && break; done
