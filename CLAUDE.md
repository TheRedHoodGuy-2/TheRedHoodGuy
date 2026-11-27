# TheRedHoodGuy studio: the rulebook (read ALL of it, every chat, before touching anything)

Channel: theredhoodguy. Roblox R6 storytime Shorts made end to end by Claude; Xavier is the director (Lagos time).
Built 2026-11-19 after two wasted runs where Claude "forgot" rules that already existed. Every rule below was paid
for with Xavier's credits. Forgetting one is the worst mistake possible here. If a rule and a shortcut disagree, the
rule wins. If two rules seem to disagree, ask. Old explainer pipeline: TheRedHoodGuy-2/explainer-kit (its HANDOFF items
are copied into `legacy/explainer-kit/`: reference only; our own engine and flow are what we use).

## 0. THE PRIME DIRECTIVE: nothing is built or sent without the RULES CHECK
1. Every video gets `topics/<name>/RULES_CHECK.md`, copied from `docs/RULES_CHECK_TEMPLATE.md` BEFORE the first line
   of scene code. Each box is ticked only with EVIDENCE (a file, a command output, a frame number you looked at).
2. Every location in the video gets its own pass through sections 6-10 below, written in that file.
3. A video is not sent until every box is ticked and every gate in section 11 printed PASS. "I'll check later" = no.
4. When Xavier gives a new note: it goes into `docs/DIRECTOR_NOTES.md` AND into this file / the template the same
   turn, so the next video cannot miss it.

## 1. Talking to Xavier
- Blunt, short, verdict first. No em dashes. Never a yes-man: if the answer is no, say no, why, and what to do.
- He pays per token and is near his weekly limit: no wasted renders, no re-reading what you already know, no
  experiments on his money. Say the rough cost before any long step.
- Never make him find a mistake Claude could have found. He has said "look at the frames yourself" more than ten times.

## 1b. COST, MODELS, TOKENS (Xavier 2026-11-26: "I don't want to make videos and spend my weekly tokens in one day")
Same-or-better results, fewer tokens. Every optimization below is allowed ONLY if the output is the same or better.
- MODEL CALL BEFORE EVERY TASK: before starting any task, say in one line which model he should set and why. Mid-task, the
  moment a stage fits another model better, STOP and tell him to switch. Default map:
  Opus = scripts, story / comment bait, posing + acting decisions, shot design, the final frame-check judgment, new systems.
  Sonnet = building from an approved plan, rendering, re-rendering after fixes, audio / captions / muxing, file and log work,
  pulling analytics, routine tool fixes. Haiku = trivial lookups / file moves only. Never assume; ask him to switch.
- NEW CHAT PER VIDEO (the old chat re-sends its whole history every message). Everything carries over through the repo:
  this file, docs/STUDIO_LOG.md (where we are), docs/DIRECTOR_NOTES.md, log/. Push the repo before he leaves a chat.
- RENDERS: one background job, no polling loops (no 10-min check-ins: each costs tokens). Wait for its completion
  notice; check once. Re-render only the frames a fix touches (frames are kept as JPGs).
- IMAGES are the most expensive thing to read. Automatic checks first (clipscan, dark / flash / frozen-frame detection,
  walk check, lookmeter); then LOOK only at what they flag + start / middle / end stills of each shot, at the smallest size
  that shows the problem. Full every-frame sheets only on the final pass, at 6x4 per sheet max, downscaled.
- No re-reading files already read in this chat; no dumping long tool output (pipe through head / grep); short replies.
- Batch: ask for all his notes in one message; fix them in one pass; one re-render.

## 2. Start of every chat (in this order)
000. NEW CHAT = NEW SESSION FILE: create `log/sessions/<YYYY-MM-DD>_<video-or-topic>.md` and log EVERY turn of this chat
    there (his message + your reply, verbatim) with tools/logturn.py, however long the chat gets (Xavier 2026-11-26).
00. THE BRAIN (Xavier 2026-11-27): read `docs/BRAIN.md`, then ONLY what it lists under ALWAYS + the task pack(s) for
    this chat, in full, plus that pack's log category. Its QUALITY GUARD is binding: DIRECTOR_NOTES in full on every video
    chat, grep log/ + docs/ before any decision he may have ruled on, open any file you are unsure about, open the new
    pack when the task changes. (Replaces "read every log category + every research file", ~150k tokens a chat.)
    THE LOG (Xavier 2026-11-25: "compacting should not be the end of me"). END OF EVERY TURN, no exceptions: write his
    message + your full reply verbatim to two files and run
    `python3 tools/logturn.py log/sessions/<current>.md "<YYYY-MM-DD HH:MM>" x.txt reply.txt` (appends, files the
    message into categories, rebuilds the index, commits + pushes log/). The raw cloud transcript is not on disk, so
    this is the only record. If a compaction summary is all you have, backfill from the claude.ai chat history.
0. If `docs/OVERNIGHT_PLAN.md` has unticked boxes, resume there. Then `docs/STUDIO_LOG.md` section 0 (where we are).
1. Video chats: `docs/DIRECTOR_NOTES.md` in full, `docs/DECISIONS.md`, the topic folder, tail of the newest `log/sessions/`.
2. The task pack from docs/BRAIN.md (script / shots / world / characters / posing / voice / sound / render / dissect).
During a chat: new note -> DIRECTOR_NOTES (same turn); research -> `research/` + index + a line in docs/BRAIN.md; settled choice -> DECISIONS;
every message of his and every reply -> session log.

## 3. Hard rules (never broken)
- Never push to GitHub without his OK (an "overnight / push it" OK covers that run). Fetch / rebase before pushing.
- Secrets: Roblox cookie at ~/.rbx_cookie, Gemini key at /home/claude/explainer-kit/secrets/gemini_key, Fish key when
  sent: never printed, logged, committed or put in memory. Never use the main-account password he once pasted. Never share his email.
- His meme SFX pack + where each goes: library/sfx_xavier/README.md.
- SFX: real recordings only (library/sfx_catalog.json Mixkit, Freesound CC0), never synthesized, mixed by tools/sfxmix.py from topics/<t>/sfx/cues.json. ONLY sounds something on screen makes (steps, slaps, falls, skids, the swap poof); no gasps/voices nobody on screen makes, no record scratches / drones / stings stacked on the ending. Liked (2026-11-25 01:30): giggles from on-screen laughers, a few whooshes, ticking for a countdown, heartbeat for tension, swap sparkles in moderation, a meme 'bruh' on a deadpan joke. Moderate, never spammed.
- Music: library/music/regular_bg_temporex_numbers.mp3 (the regular track, never switch unless he says; Xavier 2026-11-27 21:00) or the track Xavier sends, ~10 dB under the voice with sidechain ducking; whole mix loudnorm -14 LUFS. Captions + title are a separate layer (tools/captions.py, burnt after render).
- No vignette, no cloth folds / crease maps, no impact freezes / hit-stops, no bloom wash, no speckle noise.
- Clipping: near zero. Mild clipping is not acceptable.
- Models are real: imported from a proper source (Roblox catalog / Creator Store, Poly Haven) or modelled after
  researching the real object. Never boxes + spheres passed off as a prop, garment, hair or tree.
- Reference channels (Gneef) are studied for FORMULA only. Never republish their scripts, premises, names or shots.
- Cast is fixed (library/cast.json): the same person plays the same role in every video.

## 4. Scripts (docs/FORMAT_BIBLE.md is law; checklist in section 8 of it)
- Niche: popular Reddit stories (Xavier finds them) remade into "In this world / town ..." impossible-rule stories;
  an original when none is found. Title = the rule in ~5 words + one emoji.
- Line 1 = the rule, voice from 0.0 s, done by 3 s. "You see," in sentence 2-3. 3-5 life-with-the-rule gags by ~20%.
  "But I ..." by ~30%. Plant shown early. Crisis by ~35-40% with a clock. Narrator is the red-hoodie boy, first person,
  past tense, a kid's plain words, sentences ~6 words, none over 20, 2 named characters, 3-4 tagged spoken lines.
- Length: never past 95 s. Most scripts BUILD to a cliffhanger that is never resolved, and the cliffhanger is SHOWN,
  NOT SAID (cut the last line; we watch it happen; cut mid-action).
- Every sentence must be ONE drawable picture. The 7-YEAR-OLD CHECK on every few-second block: would a 7-year-old
  still be watching? If not, rewrite that block. Every 2-5 s a reason to stay (gag, open question, countdown, reveal).
- COMMENT BAIT (Xavier 2026-11-25 08:44, from Tag Swap's comments: "cheeky boy" because he laughed in the last frame
  while his bro became a girl; people debating "what if you were trans / a boy turning into a girl"): every script must
  give people something to TALK about: a debatable rule or a "what would YOU do" choice, a character moment viewers
  have an opinion on (cheeky, unfair, wholesome, sus), a last frame that invites a reaction, an open question in the
  ending. Before approval, list the 2-3 comments the script is designed to start.
- REAL COMMENTS (Xavier 2026-11-25 10:41, research/comments_real_2026-11-25.md): bait = what real viewers comment on: an
  unaddressed loophole in the rule, one exempt character, a lookalike, a pedant detail. Never AI-style "what would YOU do" prompts.
- INSINUATE, NEVER STATE (11:02): adult sus = one plant + one line at the end; never named, shown or heard. Never with kid characters.
- NO DROP-OFF AFTER THE GAGS (11:05): one-liner gags (~1.5 s each, 2-3), tension starts in the very next sentence.
- EVERY ACTION HAS A WANT (11:12): in the crisis the narrator wants one thing and every action is an attempt at it.
- ANIMATABLE (11:44 + 11:55): run this check BEFORE Xavier sees a script; never send beats our engine does badly
  (on-screen stair climbs, pushing big furniture, long contact chains). Never call a gesture impossible on R6: pose it
  (jazz hands = arms up / out + shimmer; snap = forearm flick + real snap SFX) or ask him for a pose example. New sets
  are fine: BUILD them, never swap a location to dodge a build. List every new set / model / cast member.
- LORE CAMEOS (Xavier 2026-11-27 00:59, loved the mailman on skates): every video gets at least one recurring-cast
  callback (mailman on skates, Mrs. Pam's pink car) as a gag or background detail, never explained.
- The script goes to Xavier as a beat list; nothing is built until he approves it.

## 5. Voice, lip sync, faces
- Voice: Gneef-matched narrator pace (~260 wpm, no gaps over ~0.5 s). Gemini TTS (tools/tts_gemini.py, voice Puck)
  until he sets up Fish Audio. The style preamble gets read aloud: trim it. Word timings: faster-whisper small.en, no
  initial_prompt, numpy audio in. Tighten pauses (silenceremove 0.14 s), loudnorm.
- Lip sync = anime flap from the audio (tools/flap.py -> flap.json, engine/lipsync.js flapTrack): open / half / closed
  from speech-band loudness, M B P closures, 1-frame lead, 2-frame minimum hold. ONLY the character saying the line
  moves its mouth; everyone else's mouth is their expression's own mouth.
- Talk mouths match the EMOTION: the 05 sheets E / F rows (E: neutral 1-4, happy 5-8, sad 9-12, angry 13-16;
  F: smug, scared, surprised, quiet). Usable on every custom face. Never smiling mouths on a serious line.
- Faces: every character has a faceSet (library/characters.json, engine/faceset.js): ai:05 / 11 / 13 / 16 sprite
  sheets (A/B 32 emotions + `e` eyes-only cells, C mouths, D eye states), kit:<style>, classicA/B. The mains keep their
  own faces (old repo kit/faces.js, to be merged into our face set; nothing else from the old repo replaces ours).
  Expression changes on the THOUGHT: brows first, then eyes, then mouth. Blinks on new lines / looks / cuts + every 2-5 s.
  Never realistic 3D heads. Faces checked at full size: no white rims, no skin bleeding into eyes.

## 6. Characters, clothing, scale
- Bodies: engine/r6.js (1 stud = .34 m). Our R6 with hood up is ~1.92 m tall: size shots for THAT (engine/shots.js).
- library/cast.json + engine/cast.js makeActor(key) / shadowOf(key). Mains: the BOY (narrator, red hoodie up, jeans,
  faceSet ai:05_intimidating, skin #9a6444) and a main GIRL with her own family (not chosen yet; Mia is NOT her).
  Boy's family: Mia (sister, f005), mom (f034), grandma (f051); also teacher (f010), mailman (m009).
- THE BOY'S HOODIE = catalog 91631221833009 "Black Hoodie", tinted RED (Xavier 2026-11-19 15:43), with its own
  sleeves. Not 11419556095. Mains wear 3D clothing that FITS: torso piece on the torso, sleeves exactly on the arm
  blocks, nothing swallowing the hands, no hem strip on raised arms. Check from 4 sides before use.
- Child (~10 y) and mid versions of the male / female bases are still to build (shorter legs + torso, textures fit).
- Bank characters: men get men's hair and clothes; outfits match the archetype; max one loud piece; recolour repeated
  garments; look at every character one by one at full size before any sheet.

## 7. World and sets
- Gneef's edge is the WORLD: a full, believable neighbourhood. NEVER an empty horizon or vast empty ground behind a
  character. Exteriors use the suburb (engine/sets/suburb.js) INSIDE the town (engine/sets/town.js) so every
  direction has houses, trees, streets; pick camera directions that see the town, not the void. Windows see the world.
- Trees = game trees (town.js treeParts: trunk, branches, hundreds of leaf cards). Never faceted blobs, never the
  sparse Poly Haven tree_small_02 glb (renders as grey twigs and dots at our res; Xavier 2026-11-19).
- Never sub-pixel-thin geometry seen from afar (fence pickets, rails, wires, cables): SwiftShader gives slivers
  garbage depth and they bleed through bodies and walls as dotted lines (the line across the boy, 2026-11-19). Use a
  cut-out texture panel or thicker real boards. Camera near plane >= 0.15, far <= 400 (depth precision).
- Sets are DESIGNED: modern houses, one coherent design per room (palette, materials, furniture family), real modern
  references. Chairs face what they serve. Furnish self-check (clips, through walls, doorways, loose pieces).
- Every imported model inspected close up before use (drips, throws, stray parts, holes, scale, baked junk).
- Every surface: what is it really, what does it really look like (research), real material (laminate, plaster,
  walnut, siding...). Wear only at contact points. Not childish, not blocky, not AI-looking.
- Practical lights only on when the story says so (no lamp on in daylight).

## 8. Lighting (engine/look.js is MANDATORY for every scene; the approved research before/after is the standard)
- dayLook(scene, o) for exteriors, roomLook(scene, o) for interiors; call `look.follow(cam, subject)` every frame.
- One motivated HARD key (sun / window / lamp) with real shadows; a soft key on the subject's face from the key side;
  a rim from behind that cuts them out; low fill so faces have a shadow side; background darker + softer than the subject.
- Per-scene mood (not presets): each scene gets the light its story moment needs (Pixar: harsh / contrasty when things
  go wrong, soft warm when safe). Indoors warm, outdoors cool sky + warm sun; every place its own colour.
- Sun placement: choose it so the main camera directions see the LIT side of faces (3/4 front key), never a whole
  video of backlit dark faces. Faces never black, never flat.
- CHANNEL LOOK = SUNNY in engine/look.js (Lucky Me grade: saturation 1.34, contrast 1.1, warm gain, bright blue sky, sun 4.0
  el 52, exterior exposure 1.36; Xavier 2026-11-27 'this video looks a lot nice'). Default for every new video unless he says.
- Grade (GRADE in look.js): darker than our old videos, true blacks, richer warm colour, highlights rolled off white.
- Gate: `python3 tools/lookmeter.py <frames|video>` vs Gneef (brightness .31, sat .57, black .00, top .76, warm .04).
  Read the numbers with judgement (a red hoodie filling a close-up pushes warm / sat), but bright / black / top must pass.

## 9. Camera (engine/camera.js cameraRig + engine/shots.js grammar; research/gneef_camera.md)
- Gneef measured: ~45% push-ins at speeds from 3 to 19 %/s, ~40% holds where the CHARACTER does the moving, fast
  pull-outs, quick pans (0.13-0.2 frame widths / s), tilts / cranes. Cuts every ~1.5 s (first shot ~1.9 s, 7 cuts in
  the first 10 s, longest ~6 s for the big beat). Hard cuts inside a place; 0.25 s dissolve between places.
- CONSTANT MOTION (Xavier 2026-10-23 + 2026-11-25, research/motion_reference_2026-11-25.md): consecutive frames are never
  the same. Inside a shot the camera never stops: constant-speed travel (gentle start, no ease-out to a halt; shots.js
  default) + an always-on handheld layer (camera.js) + the character doing the work most of the time. The ref: 0.5%
  still frames, camera ~2.5x our speed, foreground sliding past for parallax. Gate: `python3 tools/motionstudy.py
  <check video> --crop .6` -> still frames < 2%, longest still run < 0.3 s; slow shots (speed < 1) need the character moving.
- EVERY cut changes move, size AND speed (shots.js validate() must return nothing). Never the slow-push slideshow
  (Shadow Steps, 2026-11-19). Motion carries across cuts. Camera never parks; drift on holds.
- One clear subject per shot; faces visible (never only a back); look room toward who they face; foreground /
  subject / background layers; the speaker's face reads. Long lens (fov 25-45 vertical), DOF focus on the eyes.
- Portrait 9:16 is NARROW: horizontal fov ~ 0.56 x vertical. Two people side by side need distance or a line-up
  along the lens axis (camera on the line between them). Check every two-shot for crowding.
- Nothing between camera and subject unless it is a deliberate foreground (OTS shoulder): check with stills at the
  start, middle and end of every shot. Camera never inside or brushing a person / prop.
- Shot sizes for our 1.92 m R6: full 2.9 m frame, medium 1.7, close 1.15 (chest up), feet 1.35 (shots.js SIZE).
- Low "giant" angle + small shake on impacts; reaction shot after every reveal; inserts carry the rule's object.

## 10. Animation and posing (docs/ANIMATION.md, docs/POSE_LESSONS.md, research/legacy_explainer/)
- FULL old-kit sweep (2026-11-25): research/legacy_explainer/ANIMATION_COMPLETE.md (jolt / flinch / adult reactions, world
  interaction instead of clipping, Xavier's sit + couch pose codes, POV, old camera notes). Read it with this section.
- THINK before every pose, face, prop, camera: what does this person want and feel RIGHT NOW, how would a real
  person do it, can the viewer read it. Eyes lead, then head, then body.
- Every action: anticipation -> action -> reaction -> settle. Nothing moves by itself: the hand arrives ON the handle,
  THEN the door follows it. Slams get a wind-up. Standing up: lean, push off, rise, settle. Turns: a .6-.9 s step-turn
  with moving feet, never a snap. Each action gets enough screen time to read.
- WALKING = engine/walk.js walkPlan + footLock (planted feet, never sliding, never gliding a pose across the floor).
  Gate: walk check prints drift 0 mm / off floor 0 mm / swing clearance > 0. Turning paths: step-turns.
- Dynamic posing (his refs): never mirror the arms; raised arms go back + up and slide out of the shoulder
  ({ r, o }: ~pi rotation + o up .15-.3 / out ~.16); commit the whole body (lean, tilt, hip shift); head thrown /
  rolled with it; legs uneven. Silhouette reads, one line of action, power centre, contrapposto.
- R6 has no elbows / knees: whole-arm actions pivot at the SHOULDER (limbTo reach); forearm actions slide the block so
  the shoulder becomes the elbow (limbTo with elbow point ~.3 m under the shoulder). Build limbs from where the HAND goes.
- Sitting: legs near-vertical slid forward (leg top = knee) or legs horizontal with the root up; hips ~.1 above the
  real seat (raycast the chair). The chair moves back before someone stands.
- No default reactions (both hands up + shocked face, jumping, T-pose recoil). Adults react like adults. A shock is
  springy for a beat, then the body moves on.
- EMOTIONS MATCH THE MOMENT (Xavier 2026-11-27 19:30): before every face key ask what the character feels about what is
  happening RIGHT NOW. Worried about overdue rent = nervous / sad, never a smile. A smile / smug only when the story gives
  them a reason to be pleased. Audit every face key against its line before any review render.
- NO STILL FRAMES (Xavier 2026-11-25): a shot is never 'camera arrives, person does one thing, then freezes while the camera pushes'. Every shot has continuous action start to end; cut ON action and let the next shot continue the motion; give people secondary actions / reactions so the story flows between shots instead of a string of frozen vignettes. Check: in every shot, something besides the camera moves in the last half.
- Holds are never frozen: drift toward the next pose + breathing / sway idle. Eased moves ('back' default, 'snap' only
  for impacts). Overlap: hips, torso, head, arms 2-4 frames apart.
- Hands ON what they hold the whole time; hand props sized to the R6 hand block (never tiny); props face the right way.
- Crowds and listeners never freeze (eye darts, nods, small weight shifts). Hide anyone not part of the shot's point.
- Engine traps: rig.pose() RESETS the actor's outer group, so set stage position / facing AFTER posing. Facing: ry 0
  = +z; check every facing in a still before rendering. Flat shadows (shadowOf) use OPAQUE ink.

## 11. Pipeline + gates (all must PASS before anything is sent)
ORDER (Xavier 2026-11-25 06:56, after Do-Overs wasted an hour on full check renders): NEVER use a video render to find
mistakes. Build shot by shot and check with single stills (tools/stills_at.mjs, ~5 s a still: start / middle / end of
every shot) until the whole video holds up in stills. Then the POSE SHEET (python3 tools/posesheet.py <topic>, every acted
pose in story order from POSE_SHEET in the scene file, ~1 min) goes to Xavier BEFORE any video render; he reposes the bad
ones. Only then ONE review video at the lowest quality and fastest speed (lq:1, 180x320, 6 fps), sent as soon as it exists.
Re-renders after notes touch only the changed shots.
1. Script approved -> voice (tools/tts_gemini.py) -> words.json -> flap.json -> lines.json.
2. RULES_CHECK.md filled for every location (sections 6-10) BEFORE scene code.
3. Shot list written with engine/shots.js; `validate()` empty; stills at start / middle / end of EVERY shot looked at
   (subject readable, nothing blocking, face lit, no void behind).
4. Gates: walk check (if anyone walks), CLIPSCAN (`node tools/clipscan.mjs <scene> 24`: every frame, bodies / props / grips,
   must print CLIPSCAN PASS; Xavier 2026-11-25 "never let anything clip"), lookmeter, shot validate.
5. REVIEW GATE (Xavier 2026-11-25): after the frame-checked 10 fps check pass, SEND him that cheap low-res, low-fps review video
   (with voice) to rate, and wait for his OK. Only then the final. A 'final straight' request is a one-off, not the default.
6. Render (tools/render.mjs, --t0 for per-location segments; 30 fps finals; segments concatenated with -c copy, voice
   muxed with -c:v copy). render.mjs SKIPS existing frames: delete the affected frames after any change.
7. FRAME CHECK (docs/FRAME_CHECK.md): extract EVERY frame, tile them all (nothing skipped), zoom crops of faces /
   hands / contacts, check against the research (composition, lens, light, posing, faces, mouths, grade) and the
   defects list (clipping, floating limbs, flicker, pops, blocked shots, lines bleeding through, empty horizon).
   Fix -> re-render -> re-check until a full pass finds nothing.
8. Final: title (rule + emoji) + description. Commit topic (not frames / wav). Push per section 3.

## 11b. Studying reference videos (Xavier 2026-11-25)
Every reference video is dissected with `tools/dissect.py` + the matching spec: `docs/DISSECT_ANIMATION.md` (real
animators: posing, timing, spacing, acting, camera) or `docs/DISSECT_STORYTIME.md` (our niche: script, hook, camera, text,
sound, ending / loop). EVERY frame is looked at in order; the per-frame log has no empty rows. Our own retention numbers
live in `research/analytics/` and are read beside every dissection (hook = stayed-to-watch, loop = average % viewed).

## 12. Where things are
engine/: r6.js (bodies), rig.js (poseRig), poses.js, r6pose.js, cast.js, faceset.js, lipsync.js, walk.js, look.js,
shots.js, camera.js, sets/ (suburb, town, classroom, house, roomkit), build.js (ph() Poly Haven props).
tools/: render.mjs, still.mjs, shot.mjs, flap.py, tts_gemini.py, lookmeter.py, cammotion.py, clipcheck.js, rbxm.py,
roblox/fetch.py (catalog items), facesprites.py, eyerig2.py. library/: cast.json, characters.json, sfx_catalog.json.
Everything renders in the cloud workspace (Three.js, SwiftShader, 2 cores). Nothing runs on Xavier's laptop.

## 13. Readability (Xavier 2026-11-27 Lucky Me notes)
- First 2 s = a MID-ACTION hit with its real SFX (the Police video's door kick is the model). First 5 s: action into action.
- Every claim the narrator makes is SHOWN at once (richer -> cash poof + SFX; rich man -> gold, money). Every action reads; cause before effect; never cut before a strike / fall lands. SFX on every action.

## 14. Every video ends with the SUBSCRIBE PROMPT (Xavier 2026-11-27)
- POSE + CAMERA LIBRARY: library/subscribe_prompts.json (each pose has its own camera). Use its 'current' entry until Xavier sends a
  new pose (pose-editor code + a screenshot of the framing): add it as a new entry, solve the camera to match the screenshot.
  The CHARACTER changes per video (that video's lore character + a backdrop from that video); Jaden was only Lucky Me.
- ~2.3 s selfie POV: that video's lore character (Lucky Me: Jaden) in Xavier's selfie pose (scenes/lucky_me.js P.selfie +
  P.selfieWave: phone arm up at the lens, free hand doing a loose yo/sup wave), camera just past the raised hand looking
  down at him, a backdrop from that video (Lucky Me: his burning car), saying the recorded "subscribe for more" line with
  lip sync. No text on screen. Nothing in his free hand.
- Subscribe card (Xavier 20:24): YouTube dark card at y ~1250-1430 (above Shorts UI, under nothing), button tapped -> Subscribed (topics/<t>/subscribe_ui.json in/tap/out).
- Captions = style v2 (tools/captions_v2.py <topic> --counter topics/<t>/<counter>.json): one word at a time, Montserrat Black 140,
  uppercase, white, outline 8, bouncy pop (45->126->92->100% + rise), y 1340. Optional top counter (label + events + windows json).
- FINAL STEPS: tools/render_chunks.sh (resumable 1080x1920 30 fps, ~3.9 s/frame) -> tools/musicmix.sh (regular track -17 dB,
  ducked, loudnorm -14) -> tools/finalize.sh (burn captions + avatar, 10-12 Mbps, +faststart; 15 Mbps would not play on his laptop).
- Pop gate: node tools/popcheck.mjs <scene> <dur> must print nothing (no actor vanishing / jumping off a cut).
- Final renders only after Xavier OKs the review video. Never speculative.
