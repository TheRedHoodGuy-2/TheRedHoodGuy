# PLAN: the rebuild checklist

Status key: TODO, DOING, WAITING (on Xavier), DONE (date). One item is signed off by Xavier before the next depends on it.

| No. | Item | Output | Status |
|---|---|---|---|
| 1 | Reference study | `docs/FORMAT_BIBLE.md`: script formula, hooks, pacing, camera, light, posing, from every winning Short of the reference channel | DRAFT DONE 2026-11-16: `docs/FORMAT_BIBLE.md` from all 75 (transcripts, cuts, camera on 31, 2 shot by shot). WAITING: Xavier's sign-off |
| 2 | New repo, fresh rules | this repo | DOING: skeleton written 2026-11-16, not pushed yet |
| 3 | Renderer decision | `docs/DECISIONS.md` | DONE 2026-11-16: Three.js in the cloud; Blender finals wait for a new laptop |
| 4 | Base male + female v2 | bevels, proportions, plastic grain (no glow), `docs/CHARACTER.md` | DRAFT DONE 2026-11-16: `engine/r6.js`, sheets in `docs/sheets/`. WAITING: sign-off |
| 5 | Hair + clothing library | Roblox catalog importer (official items only) | DRAFT DONE 2026-11-16: 98 hair / accessories, 9 shirts, 12 pants. Props and buildings are NOT reachable this way |
| 6 | Faces | face system rework | TODO |
| 7 | Look bible | material library, light rigs, set + prop standards, `docs/LOOK.md` | TODO |
| 8 | Animation v2 | pose / motion rework, automated clipping check, `docs/ANIMATION.md` | TODO |
| 9 | Voice + captions | voice bake-off (he picks one), caption style | DOING: 6 Kokoro takes at 262 wpm in `voice/bakeoff/` (2026-11-16). WAITING: Xavier picks. Captions not built |
| 10 | "new video" pipeline | one command, all gates, preview, final, post package, `docs/PIPELINE.md` | TODO |
| 11 | Calibration + first original | private remake of one reference Short (never posted), then the first original storytime video | TODO |

Measure: the first storytime videos are compared with the tickle benchmark (69.6% stayed) before more gets built on top.

Scripts waiting for approval (2026-11-16): `scripts/01_gravity_noon.md`, `02_cloud_over_your_head.md`, `03_tied_to_your_front_door.md` (about 400 words, 92 s each).

2026-11-17: base male SHAPE approved by Xavier (v2, matched to his supplied model). Bevel: C (.12 stud) picked by Xavier 2026-11-17, now the default. Grain: x2 (between B and C) picked 2026-11-17, now default. Next: shine (A matte / B current / C glossy).
