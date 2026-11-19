# explainer-kit: instructions for Claude

This repo makes the channel's 3D "build it from scratch" explainer shorts entirely in code (Three.js, rendered headless).
Read STYLE.md before writing any script and REVIEW_NOTES.md (every problem Xavier flagged in past reviews: check them all in stills before every review; add each new note the same turn) before building any topic, and follow its TICKLE RECIPE (the tickle video's structure is the channel's proven format). The owner is Xavier; he wants blunt, short updates and approves every gate.

NEW VIDEO IDEAS: whenever Xavier asks for video ideas or a new video, read `POTENTIAL_VIDS.md` FIRST and pitch from its Ideas list before inventing new ones. Keep it current: move a topic to In Progress when work starts, to Done (with the date) when it's posted, and add every idea he approves.

## Layout (current pipeline = FORMAT A story shorts with the R6 Roblox cast; reference topic: `topics/tickle/`)
- `kit/filmA.js`      Format A engine: camera keys (fly / cut / zoom), one-word captions, far + shading LOD culling, `bake`/`keep` hooks. Topics opt in with `export const FORMAT = 'A'`.
- `kit/roblox.js`     the R6 rigs (male / female), skin(), dress(), details(), `part()` free transforms, face DECAL on the head.
- `kit/cast.js`       `castMain('guy'|'girl')` (the two FINAL mains), `castBlank(sex, seed)` (blank NPCs), blinks.
- `kit/actor.js`      the LOCKED animation style (moving holds, eased swings, overlap, idle, face pops, steps, walk).
- `kit/poses.js`      the approved pose library (+ `mirrorPose`, `partChannels`). `kit/faces.js` mains' faces, `kit/facekit.js` NPC / side faces.
- `kit/hair.js` hair styles + solved fits, `kit/clothing.js` shirts / pants / Roblox templates, `kit/packs.js` model pack for artifact pages.
- `kit/sets/*.js`     reusable sets (classroom, brainroom, kitchen, street, plane...). `kit/props/*.js` prop libraries. `kit/ASSETS.md` lists everything.
- `kit/look.js`       channel-wide look (tone mapping, exposure, colours, caption font).
- `topics/<name>/`    one folder per video: `script.json`, `topic.js` (FORMAT, SET, LOCAL_POSES, POSE_SHEET, setup()), `voice/` (his recording + words.json).
- `out/`              renders (git-ignored). Deliver files from here.
- LEGACY (Format B, old topics only, do not use for new videos): `kit/engine.js`, `kit/hoodie.js`, `kit/character.js`, `kit/cinema.js`, `reference/hoodie/`, `tools/board.mjs`, `tools/character_check.mjs`, `tools/mix.sh`/`sfx.py`.

## Building assets (Xavier's rule)
- Nothing half-built: a set is the whole room, a prop is the whole object. Register every new character, set, prop and texture in `kit/ASSETS.md`.
- Look = Roblox game, not flat: every surface gets the material it really is (see LOOK + MATERIALS below), shapes modelled properly (a bush is leafy clumps, not a sphere).
- Lighting = bright but designed: HDRI sky fill, sun through windows, practical lights, contact shadows, reflections. Nothing dark, nothing flat (see `kit/sets/classroom.js`).
- No empty windows: build the map around the scene. `surround()` (kit/sets/surround.js) wraps any set in a town + hills.
- Detail only where the camera is: plants use THREE.LOD (leaf cards near, cores far), grass tufts are LOD chunks.
- NPCs (Xavier's rule): when a video needs background people, tell Xavier how many male and how many female, and add one slot per NPC to the NPC Creator (artifact https://claude.ai/artifact/Qpkumpu5u48QTsseTpzQoZ, `npc_creator.html`; ArtifactData `batch` set into collection `npcs`, fields name/role/sex/skin/hair/order). He designs each there (skin, face style, hair, shirt/pants built or uploaded as Roblox templates, shading, own images, notes) and marks it done. Pull with ArtifactData `list` on `npcs`; fetch uploaded images with Artifact `read` + `path: <asset id>`; save each as `kit/assets/npc_pack/<name>/` (spec.json + images) and reuse them. Build the look with `kit/clothing.js` exactly as the page does. Until he does, NPCs render BLANK (plain neutral grey body, simple face, no hair) so they read as placeholders waiting for his picks; `kit/npc.js` random looks are not used in videos.
- STUDENTS + CAMERA (Xavier 2026-11-12): classmates are RANDOM students from `kit/students.js` (`castStudents(CAST, n, { seed })`): all wear the same school uniform (white polo, navy pants), only the two mains wear their own clothes; skin / hair / face style vary per seed, faces drawn at .8 scale (full size read huge). Cameras: long lens from 3-5 m, high over the heads (y 2.4-2.8 in the classroom), fov 28-42, so bodies sit IN the frame; the camera is NEVER still (topic adds a slow push / pull to any static shot). Poses: build limbs with `kit/r6pose.js` (reach from the shoulder vs forearm-from-the-elbow), every action is an arc: pre-action, action, reaction, post-action; no default hands-up / jump reactions.
- The two main characters (R6 guy in the red hoodie, girl in the peach top) are FINAL as built (`assets/avatar_tex/male.png`, `female.png`, spiky hair, rig hair). Never change their look.
- SFX (Xavier's rule, 2026-11-10, replaces the 2026-10-21 no-SFX rule): renders carry sound effects ONLY from the real bank `kit/assets/sfx/` (see its README), mixed by `python3 tools/sfxmix.py <name>` from `topics/<name>/sfx.json`. NEVER synthesize a sound (no sine pings, beeps or code-made noise: Xavier hates them). After voice approval, run `tools/sfxmix.py <name> --check` and ask Xavier in ONE message for every missing sound by exact file name; he fetches, renames and sends them; add each to the bank catalog. No music, ever.
- Missing texture: try Poly Haven (`tools/polyhaven.py`) or generate one (`tools/gen_textures.py`); otherwise ask Xavier for one from Google Flow.

## LOOK + MATERIALS (Xavier 2026-10-28: "remember to apply these ALL the time, in ALL models you'll use")
Reference: `reference/inkgame/NOTES.md` (study of the Ink Game Roblox film: lens, light, materials, sets, extras, animation).
1. **Think what every surface IS before painting it**, then research the TYPICAL real look (web search, cite it): a house
   wall in a US suburb is painted clapboard siding in white / cream / butter / beige / blue-grey / light blue (never strong
   green); trims, doors, ceilings are white painted wood; decks / steps / furniture are varnished wood (walnut / honey
   oak, never orange); plates are white ceramic; classroom walls are painted concrete block, floors waxed VCT tile;
   kitchens: white or wood cabinets, white quartz counters, wood floors, warm-white walls. If a map already has sane
   colours (the suburban map does), KEEP them; don't "brighten" into saturated nonsense.
2. **Material = the paint colour + what the stuff looks like up close**, subtle (YT-shorts clean, not gritty): use
   `kit/triplanar.js` `surface(kind, colour)` (lapSiding, shingles, plaster, paintedWood, wood, brick, roofTiles,
   concrete, asphalt, grass, fabric, ...). World-projected, no UVs needed. Maps made of anonymous Roblox parts: classify
   each part by shape (slope = roof, big vertical faces = wall, thin faces = trim / post / rail, flat at ground = paving)
   + colour, and use raycast probes to find which material a door / ceiling / table really is (see town.js, house.js).
3. **Lens + grade = look B** (filmA `cine`, on by default in `kit/look.js`): depth of field on the shot's look-at point,
   contrast, grain, slight colour fringe, less flat fill. NO vignette, NO bloom (it washed rooms to white).
4. Still to roll out on every video (from the notes): designed light per location (key + rim + practicals + haze),
   wear only at contact points, story props, crowds that never stand still, dust on footfalls (`kit/fx.js`), camera
   shake on impacts (`T.shakes`), motion blur on fast moves.
5. NEVER (Xavier 2026-10-28): cloth folds / crease maps on clothes, impact freezes / hit-stops.

## THINK BEFORE EVERY DECISION (Xavier 2026-11-13, the most important rule in this file)
Before you key a pose, pick an expression, place a prop or a camera: STOP and think it through like a real person / a
real director. How does a person actually stand up, turn around, react to this? What do they FEEL at this exact moment?
Which way does this prop face? Can the viewer tell what is happening in this shot and which place we are in? Then CHECK
the frames yourself (`tools/stills.mjs`): any clipping, wrong-way prop, wrong emotion or unreadable beat is yours to find
and fix before Xavier sees it. Never animate straight away. Read REVIEW_NOTES.md every time: every note there was a
mistake he had to point out, and repeating one wastes his time and tokens.

## START OF EVERY NEW CHAT (Xavier 2026-11-12: "I shouldn't have to point things out again in a new chat")
1. `bash tools/setup.sh`
2. Read `REVIEW_NOTES.md` (every problem he flagged in past reviews) and `research/README.md` (everything already looked up).
3. Read the end of the newest `log/sessions/*.md` (the last video's chat) so you know where we left off.
DURING the chat: a new review note goes into REVIEW_NOTES.md the same turn; any research (web search, video study,
measurement) goes into `research/<subject>.md` + the index the same turn. Commit and push both with the work.

## CHAT LOG (Xavier 2026-10-24: "EVERY conversation about this animation stuff, my chat, your reply, EVERY SINGLE ONE, organised, constantly pushed")
- `log/sessions/<date>_<session>.md` = every message Xavier sent and every reply he saw, in order, timestamped (Lagos). `log/store/*.jsonl` is the append-only store behind it (compaction rewrites the transcript; the store never loses a message). `log/chats/` = older claude.ai chats backfilled.
- At the END OF EVERY TURN run `bash tools/logpush.sh` (rebuilds log/ from ~/.claude/projects/*/*.jsonl, commits and pushes only log/). A Stop hook in `.claude/settings.json` does it too; do not rely on the hook alone. If a session starts in a fresh container, copy `.claude/settings.json` to `~/.claude/settings.json`.
- Before answering "what did we do / decide about X", search log/ first (grep), never guess and never say there is no record without checking it.

Gemini voice key: committed at `secrets/gemini_key` (Xavier's decision, private repo; he knows it lives in git history). voice.py reads env GEMINI_API_KEY, then ~/.gemini_key, then that file, so no setup is needed. Never print the key in chat or logs. If the repo is ever made public, revoke the key first.

## The workflow: VIDEO PUMP (Xavier 2026-11-10: "a video pumping machine", he should not sit for hours per video)
THREE approvals: script, voice, and the REVIEW GATE (pose sheet + cheap review video) before the expensive final render (Xavier 2026-11-11: a 70-minute final render must never be where mistakes get found).
1. **Script gate.** Write `topics/<name>/script.json` following STYLE.md (TICKLE RECIPE, under 500 characters, one "you see", punchline end). Present it as a beat list. Iterate until approved. If Xavier gives storyboard / staging ideas while refining the script, they are binding; if he gives none, stage it yourself.
2. **Voice gate.** Xavier sends the take (his Zack-D voice, files named "Zack-D-Films-..."): save it in `topics/<name>/voice/`, set `"engine": "recording"`, `"recording": "<file>"`, run `python3 tools/voice.py <name>`. Keep his natural pauses; never chop breaths.
3. **SFX ask.** Write `topics/<name>/sfx.json`, run `python3 tools/sfxmix.py <name> --check`, and ask for every missing sound in ONE message by exact file name. Build the scene while he fetches them.
4. **Build + self-check.** Build `topic.js` from existing sets / poses / props first (reuse beats new work). Check your own work with `tools/stills.mjs` and the five DYNAMIC POSING points; fix problems yourself. Then `node tools/qa.mjs <name>` (frame-by-frame SPIN check, must be clean) and look at 4 fps contact sheets of the WHOLE review video before sending: stills at chosen times miss what happens between them. Background people: render them BLANK unless he designed them in the NPC Creator.
4b. **FRAME 0 RULE (Xavier 2026-11-15, from his YouTube stats: winners 68-70% stayed, losers 43-48%).** Every video, from
   the next one on: a solid on-screen TITLE (the topic as a short hook, e.g. "Why brain freeze HURTS 🥶") is on screen from
   frame 0 for ~2 s, and the action is already moving at frame 0 (him mid-action, camera pushing, no dead first second).
   `tools/boredom.py` HOOK must PASS on the review video before the final. Keep videos 22-26 s and make the last shot match
   the first so it loops.
5a. **FRAME-BY-FRAME GATE (Xavier 2026-11-15, NON-NEGOTIABLE: "AFTER RENDERING THE TEST VIDEO DON'T GIVE IT TO ME").** After
   rendering the review video, DO NOT send it. Extract EVERY frame (`ffmpeg -i out/<name>_review.mp4 frames/%04d.png`), tile them
   in order (6x4 per sheet at 270x480, every single frame, no skipping) and go through every sheet. Flag ANY frame with clipping,
   a bad / off animation (hand not on the thing it moves, prop not where the body is, head not at the straw...), a horrible or
   wrong model (a book that doesn't look like a book), a bad placement, a blocked or unreadable shot. Fix all of it, re-render,
   extract ALL frames again, go through them all again. Repeat until a full pass flags NOTHING. Only then render the final
   and give Xavier the final video. Never send a video he has to find mistakes in.
5. **REVIEW GATE (Xavier 2026-11-11; now runs AFTER 5a).** Send BOTH in one message, then wait:
   - Pose sheet: `export const POSE_SHEET = [[label, who, pose, expr, props], ...]` listing EVERY acted pose in story order (props '' = standing), rendered with `node tools/posesheet.mjs <name> <png>` (~5 s).
   - Review video: `python3 tools/sfxmix.py <name>`, then `node tools/render.mjs <name> --review` -> `out/<name>_review.mp4` (10 fps, 270x480, lq=1: no AA / shadows / AO / grade, all Lambert; ~0.6 s a frame, ~3 min a video). It is for staging, timing and acting only; colours and light are not final.
   Xavier picks what to change; fix it, re-send only what changed, and repeat until he OKs. Self-check with stills BEFORE sending, as always.
6. **Final.** Only after the review OK: `node tools/render.mjs <name>` (1080x1920, 24 fps, background, resumable), `python3 tools/boredom.py` on it, check a 1 fps contact sheet, then send `out/<name>.mp4` + a title + a description. Skip the draft unless the video needs a brand-new set or character.
7. **Fix on request.** After the final, Xavier may still point at a pose or shot: fix it, delete only the affected frames, re-render.
8. **Save.** Commit topic folder (not frames / wav). Push only with Xavier's OK. Fetch first: other sessions push to the same repo.

## Poses and motion
- Pose editor (artifact https://claude.ai/artifact/69ydXk66jSoRR3qWFnG9Bq, `pose_editor.html`): Xavier poses the mains with gizmos, custom pivots, parts detached from their joint; he sends a screenshot or pose code. Pose code drops straight into `kit/poses.js` (part = `{ r, p, o }`: rotation vector about the pivot, pivot shift, offset; old direction arrays still work).
- Pose code may carry `props: { chair: { p, r }, desk: { p, r } }` (Euler XYZ). The editor faces the character toward +z (chair at the origin, desk 0.5 m in front at +z); in a classroom the student faces -z, so turn prop offsets by 180° about y before using them (x, z, rx, rz flip sign).
- Pages published as artifacts load models through `kit/packs.js` (`tools/pack/models_pack.js`, rebuild with `python3 tools/pack_models.py` when a model is added).
- LOCKED ANIMATION STYLE (Xavier, 2026-10-21: "our permanent constant animation"): kit/actor.js motion v2 is the default for every video. Holds are never frozen (the body keeps drifting ~15% toward the next pose plus a layered breathing/sway idle), moves are eased swings with a small anticipation dip and a soft overshoot, body parts start at staggered times (hips, then legs, head, arms), springy `style:'snap'` only for impacts / jumps / scares, faces pop and blink. Don't change these defaults; new options are added on top.
- STRETCHED ARMS (Xavier, 2026-10-22): an arm raised up (yawns, cheers, big reaches) slides OUT of the shoulder along its direction (~0.16-0.2 m when straight up) so it reads stretched, never crumpled into the shoulder / elbow. Use `stretch(dir, k)` from kit/poses.js; his yawn reference is `yawnStretch` in topics/yawn/topic.js. Not for hands near the face.
- DYNAMIC POSING, learned from Xavier's refs (yawnStretch, yawnLean, yawnStretchB/W in topics/yawn, classTurn/tickleFeet in kit/poses.js). My poses were stiff because they were symmetric and small; his are not:
  1. Never mirror the arms: one arm does the big action (straight up), the other something different (flung out 50-60° to the side, or draped down).
  2. Raised arms go BACK as well as up (z -0.2..-0.35) and slide up AND out (o up 0.15-0.3, out ~0.16) so the hands clear the head; hands never frame the face.
  3. Commit the whole body: lean the torso hard (rx -0.25..-0.46 seated), tilt it to one side (rz 0.1-0.3), shift the hips (root x).
  4. Head goes with it: thrown back (-0.25..-0.45) AND rolled / turned toward a side, never straight.
  5. Legs uneven: different angles and offsets, one kicked out.
  Before sending any pose of my own, compare it with his refs side by side on these five points.
- ACTION THEN REACTION (Xavier 2026-11-10, said many times): everything happens the way it would IRL. A fridge: walk up, REACH the handle (hand arrives and stops on it), THEN PULL (the door follows the hand, the body leans back), then it swings on. A drawer: bend, REACH the pull, THEN PULL it out in sync with the hand. Slams get a wind-up first. Nothing opens, snaps or flies by itself: a paper "popping out" of a drawer springs up out of the stack and stays there, it doesn't fly across the room. Check every action in stills: is a hand ON the thing when it moves?
- RAISED ARMS, from his pose code (2026-11-10). His poses are for STUDY, not to paste: learn why they work, then build the pose the moment needs (a wave is not a "remembered it!" pose). Reference values:
  - simple hi: `armR: { r: [3.053, 0.421, 0.002] }` (rotate ~pi about x = up through the front, small twist).
  - exaggerated hi: same arm + `o: [-0.057, 0.252, -0.013]` (slides UP .25 out of the shoulder), other arm `r: [.01, 0, .576], o: [.046, -.054, 0]` (flung out ~33 deg), legs splayed `rz ±.35` with `o` out .07 / down .06, `root: { x: .144, y: .181, rz: .3 }` (hips shifted, whole body tilted toward the raised arm, a hop). Expressive = the WHOLE body commits, not just the arm.
  - hands up: `armL: { r: [0, .024, 3.032], o: [.354, .239, .016] }`, `armR: { r: [0, -.031, -3.082], o: [-.353, .247, .003] }` (up through the SIDE about z, and slid far OUT .35 + up .24 so the arms clear the head and read stretched).
  - So: every arm above the shoulder gets the ~pi rotation AND the up/out offset. Write raised arms in `{ r, o }` form, never as a bare direction array. root y lifts (hops) are a moment: key the jump, then land (root y 0) .2-.3 s later.
- Text on props (notes, signs): fit it with measureText so it never touches the edges.
- TALKING (Xavier 2026-10-22: a character who is speaking must MOVE HIS MOUTH, never hold a smirk): set `actor.talk = [{ s, e, w }]` word spans (real words from voice/words.json when he says the line on screen, or filler lecture words for background chatter). The mouth steps through visemes from the letters; eyes / brows keep the current expression (`getFace('stern+vA')`). Works for facekit faces (NPCs, side characters).
- Motion (kit/actor.js): keys may set `ease` ('back' default, 'io', 'out', 'in', 'linear', or a [x1,y1,x2,y2] bezier = graph-editor handles), `style:'snap'` for impacts only, `steps: 2|3` for choppy on-twos action (Spider-Verse feel), `walk: true` (contact/down/pass/up cycle). Films render at 24 fps.

## Writing topic.js (Format A; copy `topics/tickle/topic.js`)
`export const FORMAT = 'A'`, `export const SET = 'classroom'`, optional `LOCAL_POSES`, `POSE_SHEET`, and `export async function setup(ctx)` returning `{ cast, camera, update?, bake?, keep? }`.
- `ctx`: THREE, scene, world (set refs), camera, renderer, U, V, DUR, words, CAST.
- `cast`: `{ name: actor }` with `actor.keys = [{ t, pose, expr, at, face, dur, ease, style, steps, ... }]` (see kit/actor.js).
- `camera`: keys `{ t, p, l, fov, cut?, ease?, roll?, zoom?, far? }`; long lens for R6 bodies (frame from 3-4 m, fov 20-45). Mark punch-ins `zoom: true`.
- `update(t)` must be a pure function of t: set every prop / furniture state from scratch each frame.
- Micro worlds (e.g. `buildBrainRoom`) live far away (x = 300+) and go in `keep` so far-culling leaves them alone.
- Run `node --check topics/<name>/topic.js` after every edit: a `//` comment pasted mid-line has broken the page several times.

## Hard-won lessons
- LEGACY lessons below about eyelids, the lathe head and the hair cap apply to the old hoodie character (Format B), not the R6 cast.
- Never add lights inside a topic without zeroing them when unused (a stray point light washed out a whole render once).
- Use `new URL(..., document.baseURI)` for dynamic imports; module-relative paths break.
- Eyelids must be deeper than pupils + glint or eyes clip through when half-closed, but no wider/taller than the eye white or the open lid shows as a halo. Upper lid open angle must stay within -1.57 (beyond that it wraps round to the front).
- The face is the v1 look Xavier approved: full jaw, eyes facing straight ahead (no outward turn), tiny pupil convergence. The head is ONE lathe (skull + jaw blended) so there is no seam line; lathe points must run bottom-to-top or it renders inside-out.
- Hair is a double-sided cap inside a group scaled like the upper skull; never place hair as a free sphere or its edges poke out.
- render.mjs is resumable: it SKIPS frames that already exist. After any change to topic.js, delete `topics/<name>/frames_draft/` (or `frames/`) before re-rendering, or the boredom check just re-tests the old cut.
- Render is CPU-only (SwiftShader). Measured 2026-10-21 on the classroom: ~80% of a frame is PBR pixel shading, not geometry (hiding off-screen / occluded meshes saved 2%; shadows and point lights ~nothing). filmA's SHADING LOD swaps meshes farther than 6 m to Lambert twins (same look, 2.1x faster). To speed things up, cut shaded pixels, not triangles. Keep geometry modest anyway.
- Faces (Xavier 2026-10-21, final word): the mains use the FIRST face variants (kit/faces.js as in the sitting pose test, commit 106becd: drawn 1:1, eyes at EX [186, 326]). Do not rescale, move or enlarge them again. The face is a DECAL on the head's own front triangles (kit/roblox.js dress), pushed 2.5 mm out along smoothed normals, so it lies on the curved face and never floats. NPC faces: `NPC_FACE` in kit/facekit.js (from his sketch). Check with `tools/facecheck.html`.
- The head bone of the R6 rigs is scaled 1/3, so anything attached to it (face decal, hair) carries a compensating local scale. NEVER set `.scale` on those to absolute values; multiply their own starting scale (actor face pop shrank every face to 1/3 in renders until 2026-10-21, while the editors looked fine). Check faces in REAL film frames (`tools/stills.mjs`), not only in the editors.
- Female mouths (face kit, NPCs, side characters): plain black like the guys, no lips (Xavier, 2026-10-21). The lip variant stays available as `lips: 'lip'`. The main girl keeps her approved face (kit/faces.js) unless Xavier says otherwise.
- Canvas painting with THREE.Color: `.r/.g/.b` are LINEAR. Convert hex numbers to css directly (see npc.js `hex`) or everything paints too dark.
- Never model sub-pixel-thin geometry that is seen from far away (railing pickets, wires): SwiftShader gives slivers garbage depth and they bleed through walls as dotted lines. Use a cut-out texture panel instead.
- Code-made textures look stylised; for realism use Poly Haven files (Normal **GL**, 1K/2K) placed in `kit/assets/`.
