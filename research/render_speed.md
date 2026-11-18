# Render speed (2026-11-18), measured on scenes/bedtime_story.js at 1080x1920, cloud CPU (SwiftShader)

## Where the time goes (ms per final frame; measured by switching one thing off at a time)
| Stage | Cost | Notes |
|---|---|---|
| Whole frame, before fixes | ~11,500 | |
| PBR shading of the scene (2 M pixels) | ~2,500 | Lambert test frame drops to ~2,300 total: shading is the core cost (same lesson as explainer-kit) |
| Two area lights (sky fill + beauty fill) | ~1,200 | they look good; cheaper stand-ins possible if needed |
| Depth of field (old, full size) | ~2,500 | fixed: now gathered at half size and blended by blur amount |
| Light shafts | ~2,000 at 48 steps | now 32 steps, same look (jitter + blur hides it) |
| Lamp point light with all-direction shadow | ~2,300 | lamp is OFF unless the story needs it (Xavier's rule) |
| Shadow map redraws | ~500-1,100 | now redrawn only when something other than the camera moves |
| Physical vs standard materials (varnish, wool) | ~350 | kept |
| Bloom, grade, SMAA | ~1,000 together | |

## Now
- Video frame through the new streamed renderer: **about 9.6 s per final frame** (24 frames of a camera move in
  ~230 s, page loaded once). Target was ~10 s: met. A 25 s video at 24 fps is about 1 h 40 min; at 30 fps about 2 h.
- Look unchanged: before vs after with the same lights differ by under 1 level of 255 on average
  (docs/sheets/render_speed_before_after.jpg: before / after / after with the lamp off).

## Tools
- `tools/timing.mjs '<spec>'` per-frame timing of a shot.
- `tools/render.mjs '<spec>' out/<name> --fps 24 --dur 6` streamed, resumable: skips frames already on disk.
- `bash tools/lookcheck.sh '<spec>'` preview (540) vs final (1080): fails if the preview would lie (bedtime: PASS).
- Scenes export `update(t)` returning true only when something besides the camera moved (shadows redraw then).

## Further options (not applied: they change the look a little, Xavier decides)
- Draw the scene at 80% size and upscale: about 35-40% faster, slightly softer.
- Replace the two area lights with soft spot lights: about 1 s faster per frame.
