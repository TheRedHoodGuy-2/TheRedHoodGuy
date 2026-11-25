# Motion reference: davystep75 TikTok Roblox story (Xavier 2026-11-25: "very smooth, very consistent, very beautiful
# camera work... no still moment... either the camera or the character is doing the work")
File: Xavier's upload aa1b5117 (576x768, 30 fps, 163 s). Measured with tools/motionstudy.py (every frame, captions
cropped out: --crop .6) and compared with our Sunset Tag final.

| measure (144 px-wide analysis frame)      | reference | ours (Sunset Tag) |
|-------------------------------------------|-----------|-------------------|
| still frames (no camera AND no character) | 0.5 %     | 7.8 %             |
| longest still run                         | 6 frames (0.2 s) | 42 frames (1.4 s) |
| camera speed, median px/frame             | 1.85      | 0.74 (2.5x slower) |
| camera speed, p90                         | 7.0       | 5.1               |
| zoom rate, median %/s                     | ~21       | ~6                |
| handheld jitter (path minus 0.5 s average)| 1.6 px    | 0.6 px            |
| camera moving AND character moving        | 80 %      | 72 %              |
| shot length, median                       | 3.2 s     | 1.3 s             |

What it does (also from 1 fps + 6 fps contact sheets):
- The camera NEVER stops inside a shot: every shot is one continuous move (push in, pull out, slide sideways past
  foreground, slow arc) at a steady speed, with no ease-out to a halt. Moves stay smooth (low acceleration) but always
  carry a small handheld wobble on top, which is what makes it feel filmed by a person.
- Longer shots than Gneef (3.2 s median) but they never feel long, because the camera keeps travelling and the
  characters keep doing things (walking toward the lens while it pushes in, gesturing, turning, crowds shuffling).
- Foreground layers (table edge, pot, railing, people's shoulders) slide past to sell the move (parallax).
- One-word captions, yellow fill + dark outline, centre-lower: the same look we just adopted.

Rules for us (engine + RULES_CHECK):
1. Camera moves are constant-velocity through the shot (gentle start, NO ease-out to a stop); planShots default ease
   changed accordingly (engine/shots.js, 2026-11-25).
2. Handheld layer always on, ~2.5x our old drift, two octaves (slow sway + ~1 Hz wobble) (engine/camera.js 2026-11-25).
3. Speed: median camera motion ~1% of the frame width per frame at our scale; no shot under that unless the character
   is doing a big move.
4. Gate: tools/motionstudy.py on the 10 fps check pass: still frames < 2%, longest still run < 0.3 s.
