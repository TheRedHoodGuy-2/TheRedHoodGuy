# Research index (read before looking anything up again)
- animation.md: animation principles, posing (silhouette, line of action, power centre, weight), moving holds, eye timing, R6 notes (2026-11-19)
- animation_r6.md: first pass on Roblox R6 animation (devforum, Moon Animator)
- cinematography.md: composition, depth/value, lighting, lens/FOV/DOF, camera moves, colour scripts, grading, why CG looks CG + our gaps (2026-11-19)
- faces.md: Roblox classic vs dynamic faces, decal face animation plan, lip sync mouth chart (2026-11-19)
- classroom.md: US high-school classroom + seated R6 measurements (2026-11-19)
- house_design.md, map.md, scale.md (+ scale_data.json): houses, the Naperville town map, studio scale
- look_study_2026-11-18.md, gneef_first_look.md, gneef_top20*: reference-channel look and formula studies
- scripting_retention.md: hooks, pacing, retention
- model_pull.md, render_speed.md: model sources and render cost
- sfx_sources.md, voice_fish.md, voice_options.md: sound effects and voice
- dynfaces.md: Roblox dynamic faces 2026 (migration, what's popular, measured face layout of the top 48), basis of face kit v3
- facepacks.md: the three face packs pulled 2026-11-19 (classic, AltiWyre, CLASSIC_FACES zip), what they are, how they're used
- lipsync.md: lip sync + facial animation (mouth chart, Rhubarb, forced alignment, timing rules, blinks, darts, brows) (2026-11-19)
- gneef_camera.md: Gneef's measured camera moves (push / hold / pull / pan mix, speeds, shot lengths)
- gneef_metadata.md: Gneef titles (3 eras + views), description (hashtags only), the reused 54-tag block

## 2026-11-25 dissection system + analytics
- `docs/DISSECT_ANIMATION.md` (class A: real animators' Roblox videos) and `docs/DISSECT_STORYTIME.md` (class B: our niche):
  the metrics, every frame, remake-level. Tool: `python3 tools/dissect.py <video> --class anim|story` -> `research/dissect/<name>/`.
- `research/analytics/`: YouTube Studio exports (content, traffic, audience), 2026-10-27 to 11-24; feeds DISSECT_STORYTIME B11.
- 2026-11-25 anim dissections (metrics only, 14 videos): research/dissect/anim_*/ (shots.csv, frames.csv, sheets). Refs on laptop Videos\redhood_refs\{story,anim}. Cheater has NOTES.md (partial viewed).
- Full dissections written: research/dissect/hawks_won_and_lost_P6/NOTES.md (96M), research/dissect/hawks_parents_see_Aps/NOTES.md (79M).
- 2026-11-25 more full dissections: cody_previous_legends (full), cody_emperor (8/13 sheets), cody_sheriff_mm2 (8/11 sheets): research/dissect/*/NOTES.md. Anim cross-video summary: research/dissect/ANIM_SUMMARY.md.
- 2026-11-25 story dissection (9 videos): research/dissect/STORY_SUMMARY.md + gneef_million_steps/NOTES.md. Tool: tools/storysheet.py. Only Gneef Million Steps ~80% frame-viewed; others opening sheet or transcript+cuts only.
- 2026-11-25 real comment study: research/comments_real_2026-11-25.md
- retention_composing_2026-11-26.md: hook/payoff promise, tension, pacing, music per section, comment leverage (Xavier's tutorial)
