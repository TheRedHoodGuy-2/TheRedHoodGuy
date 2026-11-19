# Gneef camera moves, measured (2026-11-19, tools/cammotion.py, optical flow on 11 top videos, ~700 shots)
- Move mix: push-in ~41-50%, hold / drift (character does the moving) ~37-44%, pull-out ~5%, pan / truck ~5%, tilt / crane ~3%.
- SPEED VARIES WILDLY shot to shot: push-ins run 3%/s to 19%/s (median 7%/s); pull-outs are often FAST (6-10x the
  threshold); pans move 0.13-0.21 frame widths per second (fast). Sequence sample: push 8.2, push 2.0, tilt 1.0,
  push 2.7, hold, hold, push 2.9, pull 6.6, pull 2.6, pan 6.7 ... (speed in multiples of a slow move).
- Shot lengths p10 / p50 / p90: 0.8 / 2.25 / 5.8 s (cut detector misses some cuts; manual count earlier 1.6-1.9 s).
- What our Shadow Steps test did instead: every shot a 7%-of-distance push over the whole shot (~3%/s), all the same,
  characters barely moving = a slideshow. Rule now: speed and move differ every shot; fast pushes / pulls and quick pans
  are normal; holds only when the character is doing something big.
