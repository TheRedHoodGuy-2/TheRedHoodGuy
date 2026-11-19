# Handoff: what a new repo / new system should take from explainer-kit

Read each file before using it. Don't rebuild what already exists here.

## Rules / memory (read first)
- `CLAUDE.md`: every rule Xavier has set (workflow gates, look, posing, SFX, frame 0 rule)
- `REVIEW_NOTES.md`: every mistake he has flagged. Don't repeat any of them.
- `STYLE.md`: script format (TICKLE RECIPE, "He..." cold open, one "You see", punchline end)
- `research/`: everything already looked up. `channel_stats_2026-11-15.md` + `shorts_strategy_2026-11-15.md` = what works on the channel; also `animation_body_mechanics.md`, `motion_and_pacing.md`, `materials_real_world.md`, `look_inkgame.md`
- `POTENTIAL_VIDS.md`: video ideas list
- `log/`: every past chat about the channel (search it before asking "what did we decide")

## Characters
- `kit/roblox.js`: R6 rigs (male / female), skin, dress, face decal on the head
- `kit/cast.js`: `castMain('guy'|'girl')` = the two FINAL mains (never change their look), `castBlank` for NPC placeholders
- `kit/assets/avatar_tex/` (male.png, female.png), `kit/hair.js`, `kit/clothing.js`
- `kit/faces.js` (mains' faces), `kit/facekit.js` (NPC / side faces + talking mouths)
- `kit/students.js`: random uniformed classmates
- `npc_creator.html`: NPC Creator artifact page

## Animation
- `kit/actor.js`: the LOCKED motion style (moving holds, eased swings, anticipation / overshoot, staggered body parts, idle breathing, blinks, face pops, walk cycle, talk visemes, holdBlinks)
- `kit/filmA.js` + `film.html`: film engine (camera keys fly / cut / zoom, one-word captions, LOD culling, bake / keep)

## Posing
- `kit/poses.js`: approved pose library + `mirrorPose`, `stretch()`
- `kit/r6pose.js`: `limbTo` (reach from the shoulder vs forearm from the elbow)
- Raised-arm + dynamic-posing reference values: `CLAUDE.md` "Poses and motion"
- Xavier's reference poses: `topics/yawn/topic.js` (yawnStretch etc.), `topics/hypnic/topic.js`
- `pose_editor.html`: pose editor artifact page

## Sets + props
- `kit/sets/*`: classroom, brainroom (Brain HQ), stomachroom, livingroom, kitchen, bathroom, house, street, town, plane, surround (town + hills around any set)
- `kit/props/*`: school, gadgets (gamepad, slushie cup, textbook, watch, tally counter), home, snacks, breakfast, nature, halloween, sneaker, town
- `kit/ASSETS.md`: index of everything
- `kit/triplanar.js` (surface materials), `kit/look.js` (tone mapping / grade), `kit/fx.js` (dust, shake), `kit/foliage.js`

## Sound
- `kit/assets/sfx/` + its README: the real sound bank (never synthesize)
- `kit/assets/music/`: Fluffing a Duck, Monkeys Spinning Monkeys
- `tools/sfxmix.py`: mixes `topics/<name>/sfx.json`

## Pipeline tools
- `tools/render.mjs` (final + `--review`), `tools/stills.mjs`, `tools/qa.mjs` (spin check), `tools/posesheet.mjs`, `tools/boredom.py` (hook / pacing check), `tools/voice.py` (his recording + word timings), `tools/lib/browser.mjs`, `tools/setup.sh`, `tools/logpush.sh`

## Finished videos to copy from
- `topics/tickle` (reference format), `topics/hypnic`, `topics/timecrawl`, `topics/brainfreeze` (newest, most fixes)
- `topics/gum/script.json` (next video, script v1 not approved yet)

## Skip (legacy, old format)
`kit/engine.js`, `kit/hoodie.js`, `kit/character.js`, `kit/cinema.js`, `reference/hoodie/`, `tools/board.mjs`, `tools/character_check.mjs`, `tools/mix.sh`, `sfx.py`

## Secrets
`secrets/gemini_key`: copy only if the new repo is private too.
