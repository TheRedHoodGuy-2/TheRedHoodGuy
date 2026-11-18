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

2026-11-17: base male SHAPE approved by Xavier (v2, matched to his supplied model). Bevel: C (.12 stud) picked by Xavier 2026-11-17, now the default. Grain: x2 (between B and C) picked 2026-11-17, now default. Shine: 1.2 (between B and C, nearer B) picked 2026-11-17. BASE MALE: all settings picked, final sheet docs/sheets/base_male_final.jpg, APPROVED 2026-11-17.
2026-11-17: base female v1 built to his supplied female model (explainer-kit df1cc521: same as male + hourglass torso), same bevel / grain / shine. Overlap 99.8% front and side. Waiting for his OK.

2026-11-17: HAIR SOURCING. Xavier: pull every hair, rights are between him and his lawyer. Crawled 3,791 hairs from the Roblox catalog (35 style keywords), converted 1,549 (about 2,200 newer community items need a Roblox login to download; 12 were empty). Gallery: https://claude.ai/artifact/NQcdHob7Tkopb36erUx1AS (33 sheets, most favourited first). Not fitted yet: some sit inside or float off the head.

2026-11-18: LIBRARY PULL (Xavier asked for every hair, outfit and accessory; login cookie of a throwaway account kept in ~/.rbx_cookie, never in the repo)
- Hair: 3,769 converted, 3,729 good (male 1,153, female 2,342, both 234), 62 rejected. https://claude.ai/artifact/NQcdHob7Tkopb36erUx1AS
- Flat clothing: 6,723 (shirts 4,056, pants 2,639, T-shirts 28), sorted male / female / both by name. https://claude.ai/artifact/R4Nmqi7e3FNbtSeoeAPwKP
- Accessories: 4,507 (hats 1,856, face 652, front 606, back 527, neck 490, shoulder 215, waist 161). https://claude.ai/artifact/WYFcg6U5fNY7Dve7L9eCGi
- 3D layered clothing: 2,499 of 12,958 found (top by favourites; disk limit). Made for the slim R15 body, NOT fitted to R6 yet. https://claude.ai/artifact/P955JRMdynQ5jaSdZ2NN7k
- Sorting is by name keywords + hair length: rough, Xavier corrects by number.

2026-11-18: 3D CLOTHING REDONE. Xavier: the slim-body 3D library was "pure shit"; he wants only 3D clothing made for R6.
- Searched the catalog's 3D clothing types with R6 keywords (13,067 found), pulled each and kept only pieces whose shape matches
  the R6 body (tops: arms out to about 2 studs each side; bottoms: two legs, about 2 studs tall): 1,444 kept, the rest deleted.
- Engine: 3D clothing is centred by body (tops on the torso, bottoms on the legs), pushed out of the body so nothing pokes
  through, the body under it painted the garment's colour, and split onto the arms and legs so it follows poses.
- `python3 tools/pull.py <catalog link or id> ...` = the "plugin": pull any catalog item by link and render it on our R6 bodies.
- Xavier wants the flat clothing and accessory libraries trimmed later (no rainbow junk); not done yet.
