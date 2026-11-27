# STUDIO LOG: read this first, every chat, before doing anything

The single "where are we" file for the TheRedHoodGuy studio. Written so a fresh Claude (or one whose chat was compacted)
can pick up exactly where we left off. Update it at the end of every step. Newest status at the top of each section.

Last updated: 2026-11-18 ~09:00 Lagos.

---------------------------------------------------------------------------------------------------------------------------
## 0. RIGHT NOW

- Current phase: ENVIRONMENT (look of scenes). Step 2 (material library + colour rules) shown to Xavier on 2026-11-18:
  `out/materials_v1.jpg`, `out/palettes_v1.jpg`. His feedback: colour is Claude's job by colour theory (not "palettes he likes");
  frames still flat and washed out (same old problem); think harder about every detail (see section 2).
- NEXT STEP (waiting for his go): LIGHTING in the plain test bedroom with two dressed characters: day, golden hour (sun shafts
  through the window with floating dust that catches the light and shades inside the beam), night, lamp-light. Fix the washed
  look (tone mapping drains saturation: switch it), add cinematography lights (key / fill / rim / bounce, "invisible" extra
  lights that make a character look good without anyone asking where they come from). Also: knit and wallpaper patterns bigger
  and stronger, walls more bump, consider varnished floor boards with real bevelled board edges, woolly rug with fibres.
- Throwaway Roblox account cookie lives at `~/.rbx_cookie` (account TheRedHoodGuy_X). NEVER in the repo, logs or memory.
  Xavier's main Roblox password was pasted in chat once: told him to change it; never used, never stored.
- Nothing pushed to GitHub yet (repo TheRedHoodGuy-2/TheRedHoodGuy, all commits local). Push only when he says "push".

---------------------------------------------------------------------------------------------------------------------------
## 1. WHO / WHAT

- Xavier = director and owner. Claude = co-director, architect, animator, builder ("my streamlined peace of mind").
- Channel: YouTube @og.theredhoodguy (Roblox R6 animated Shorts). Old format: "why does my body do X" explainers, 1k to 18k
  views. New direction: storytime / premium story Shorts modelled on the reference channel Gneef (median 4.3M views).
  Xavier will explain the new niche, scripts and retention strategy LAST, after the studio is built.
- Goal: Xavier says "new video" -> Claude writes script -> he approves -> Claude does voice, build, every check, low-quality
  preview -> he approves -> final render -> post. 4 to 5 hours per video is fine if hands-off and the result is studio grade.
- Repos: `TheRedHoodGuy-2/TheRedHoodGuy` (NEW studio, /home/claude/theredhoodguy) and `TheRedHoodGuy-2/explainer-kit`
  (OLD pipeline, read-only reference, /home/claude/explainer-kit; its research on posing/animation lives there).
- Renderer: Three.js in the cloud (2 CPU cores, no GPU, SwiftShader). Blender (pip bpy) only for asset prep / baking.
  Blender finals wait until Xavier buys a laptop with a GPU. His laptop (ThinkPad T14s, Ryzen, integrated GPU, Windows,
  his only computer) is used only as a download pipe (YouTube blocks the cloud; the laptop bridge has a Linux VM with
  yt-dlp + node) via connected folder `C:\Users\Luminmgmt\Videos`.

---------------------------------------------------------------------------------------------------------------------------
## 2. HOW XAVIER WANTS CLAUDE TO WORK (binding, also in docs/DIRECTOR_NOTES.md)

- ONE ITEM AT A TIME. Build a small piece, show one picture, he approves or corrects, only then the next. Never batch, never
  run ahead on unapproved work, never run unattended unless he says so for that item. Say the rough time/cost before long steps.
  (He was furious on 2026-11-16 when a "go" burned his credits on drafts he never approved.)
- When he lists a long roadmap he is NOT saying "do it all now": do the next item only.
- Think like a director about EVERY detail (2026-11-18): don't drop a rug and move on. Ask the questions a person / a director
  would: should the floor be varnished? should the board edges be real bevels or is that overkill? should the rug be woollier,
  with fibres? Is the wall rough like a real wall? Scratches on a table? These are things viewers don't consciously notice but
  that make it feel real. Not every wall needs a pattern; every surface needs THOUGHT.
- Colour is Claude's call by colour theory, not by asking Xavier to pick palettes he likes. Test every frame: does anything
  clash? does it look beautiful? if not, what fixes it (backlight, rim, soft fill, bounce, a practical lamp)? Characters' clothes
  are NOT matched to the room; the room and light are designed so any character reads well in it.
- Lighting may cheat: add invisible lights purely so a character looks good, as long as nobody would ask where they came from.
- Every frame must look cinematic, composed, never washed out, never flat, never "childish, blocky, AI-ish".
- Complex models: never stacks of boxes / spheres. Pull real models (Roblox Creator Store with the cookie, Poly Haven, Sketchfab
  if he provides a login cookie), strip their textures, apply our material library.
- Prop scale for R6: hand-held props are about the size of the hand block's square end (never tiny).
- Blunt, short, verdict-first replies. No em dashes. Never a yes-man.
- Keep this log current; add every new note of his to docs/DIRECTOR_NOTES.md the same turn.

---------------------------------------------------------------------------------------------------------------------------
## 3. ROADMAP (Xavier's order, 2026-11-18)

1. ENVIRONMENT look  <- WE ARE HERE
   a. Look study: DONE (research/look_study_2026-11-18.md, out/look_study.jpg). Ours: even fill light, milky blacks (0.04 vs 0.00),
      too bright (0.49 vs 0.31), pale (sat 0.38 vs 0.57), cold single hue, busy/noisy. Gneef: one light direction, deep shadows,
      warm vs cool, rich colour, soft darker background, pattern/texture on surfaces.
   b. Material library + colour rules: v1 SHOWN (engine/materials.js, 19 materials, `mat(name,{color,size})`, tint vs natural,
      true-to-size tiling, worldUV). Feedback pending/partial (see section 0).
   c. Lighting setups in the test bedroom with two dressed characters  <- NEXT
   d. Test bedroom fully dressed, 3 camera spots.
   e. Town map piece by piece (street, houses with VARIED believable colours, trees, grass, bench, sky/backdrop).
2. PROPS (real models, our materials, R6 scale).
3. LIGHTING / RENDER / COMPOSITING polish (no grainy AO: bake static light in cloud Blender; filmic tone map; glow on real
   lights only; DOF; per-mood grade; no grain, no vignette).
4. CAMERA movement and framing (Xavier has ideas).
5. ANIMATION + POSING refine (start from explainer-kit research + new research).
6. CLOTHING TRIAGE + CHARACTER BANK: rank every clothing item by USABILITY (casual real-life clothes; a 3D sweater with an ugly
   print stays because we can swap the print): most normal = used, mid / least normal = set aside (not deleted). Then ~200
   named characters, each with a personality and fixed outfit, kept in a character bank and reused; new ones added as needed.
   Also fix: 3D sleeves not lined up with arm blocks (clipping), the hem strip that sticks out when an arm is raised.
7. FACES, face animation, lip sync (later).
8. SCRIPTS / FORMAT / RETENTION (Xavier explains last).

---------------------------------------------------------------------------------------------------------------------------
## 4. WHAT EXISTS (assets, tools, pages)

Characters (docs/CHARACTER.md)
- engine/r6.js makeR6(spec): our own R6 body, exact shape of Xavier's old male/female models (outline match 99.7%+),
  bevel .12 stud, grain x2, shine 1.2 (all his picks). Female = hourglass torso measured from his old female model.
  face:false = bare head (faces are a later item). APPROVED: base male, base female.
- Clothing on the body: classic 2D shirt/pants/T-shirt templates; accessories by catalog id (api.wear); 3D R6 clothing is
  centred by cage (tops on torso, bottoms on legs), pushed out of the body, body painted the garment colour underneath, split
  onto arms/legs so it follows poses (rigToLimbs).

Libraries (artifact pages, all private to Xavier)
- Hair 3,729 good (male 1,153 / female 2,342 / both 234; 62 rejected): https://claude.ai/artifact/NQcdHob7Tkopb36erUx1AS
- Flat clothing 6,723: https://claude.ai/artifact/R4Nmqi7e3FNbtSeoeAPwKP
- Accessories 4,507: https://claude.ai/artifact/WYFcg6U5fNY7Dve7L9eCGi
- R6 3D clothing 1,444 (tops 352, bottoms 1,092): https://claude.ai/artifact/P955JRMdynQ5jaSdZ2NN7k
  (Xavier: hair "amazing"; flat clothing + accessories need trimming later; the first 3D library (slim-body clothing) was
  "pure shit" and was replaced by R6-only.)
- Data: library/*.json; models in assets/roblox/<id>/ (git-ignored, ~5 GB, rebuildable); crawl indexes in assets/*_index.json.

Tools
- tools/roblox/fetch.py get <ids> (convert any catalog item; uses ~/.rbx_cookie), tools/pull.py <catalog links> (Xavier's
  "plugin": paste a link, get it on our male+female), tools/gallery.py (library pages), tools/haircheck.mjs (hair placement),
  tools/shot.mjs + sheet.html / scene.html / matsheet.html (stills), tools/blender/decimate_gltf.py (cut heavy models down),
  tools/voice.py (Kokoro TTS at 262 wpm; voice bake-off in voice/bakeoff/ never reviewed), tools/transcribe.py.
- Roblox Creator Store (free models: furniture, houses, props at Roblox scale) is searchable + downloadable with the cookie
  (apis.roblox.com/toolbox-service). Multi-part model converter NOT built yet (needed for props/sets).

Reference
- Gneef: 75 Shorts (63 at 10M+ and 12 newest) on the laptop Videos\gneef_ref and staged in the cloud; transcripts, cut timing,
  camera motion in /home/claude/ref and reference/gneef/. docs/FORMAT_BIBLE.md (draft, from Gneef; the format may change when
  Xavier explains the new niche). Our old videos: Videos\ours_ref (10).
- Scripts drafted on 2026-11-16 (scripts/01..03, unapproved, may be dropped with the new niche).

---------------------------------------------------------------------------------------------------------------------------
## 5. DECISIONS LOG (short; details in docs/DECISIONS.md)

- 2026-11-16 New repo, fresh rules. Three.js in the cloud. No Blender on the laptop. No reposting Gneef shot-for-shot.
- 2026-11-16 Subsurface skin glow dropped (Xavier).
- 2026-11-17 Base body: his old model's exact shape; bevel C, grain between B and C, shine between B and C nearer B.
- 2026-11-17 Pull ALL catalog hair incl. community items; rights are Xavier's call ("between me and my lawyer").
- 2026-11-18 3D clothing: R6-made only. Clothing / accessory triage later (usability ranking, not texture).
- 2026-11-18 Colour = Claude by colour theory; every detail gets director-level thought; lighting can cheat for beauty.

---------------------------------------------------------------------------------------------------------------------------
## 6. SESSION HISTORY (one line per step)

- 11-16 Brief: rebuild everything, storytime, Gneef reference. Scrutiny run. New repo. Renderer tests. Gneef study (75 videos).
- 11-16 Overnight run batched everything -> Xavier angry -> rule: one item at a time.
- 11-17 Base male (shape, bevel, grain, shine) approved; base female built.
- 11-17/18 Hair, flat clothing, accessories pulled (cookie). 3D clothing redone as R6-only. Pull-by-link tool.
- 11-18 Roadmap set. Environment plan. Look study. Material library v1 + palettes v1 shown.
- 11-18 This log created (Xavier: "save everything so you don't forget after compaction").


## 2026-11-18 lighting step, scene 1 (bedtime story, autumn evening)
- Built the "shader pack": engine/post.js (real volumetric shafts ray-marched through the sun shadow map, capped
  3-level bloom so only real light sources glow, DOF from real depth, Khronos Neutral tone map + grade with split tone),
  engine/build.js (bevelled boxes, cushions/pillows, draped blanket, pleated curtains, open book, lathe table lamp,
  Poly Haven model loader), film.html + tools/still.mjs (one graded still of a scene file), scenes/bedtime_story.js.
- Lighting is designed per scene (Xavier rule): sun through the window behind dad, lamp as the kid's practical,
  warm room bounce, cool sky fill from the window, a hidden beauty key on the kid. Teal walls vs gold light.
- Bug found and fixed: dust particles were baked into the room reflection probe and washed the whole frame.
- Shown: docs/sheets/light_bedtime_v1.jpg. Next: his verdict, then the snowy winter night scene in the same room.
- 09:37 Xavier: shader look approved. Lighting step DONE. Next: modern interior research + modern props/models
  (environment step 1 continued + props step 2), then the town map with modern houses.

## 2026-11-18 09:44 FOUNDATION PASS (Xavier: fix foundations before building anything)
We go phase by phase listing foundation problems, agree them, then Claude works through the agreed list while he sleeps.
Environment foundations (agreed, parked until the full list is done):
1 scale sheet vs R6; 2 model pull tool + library sheet (Roblox Creator Store converter); 3 auto re-skin of imported
models with our materials; 4 room/house kit with real doors/windows and removable film-set walls; 5 placement helpers +
seat/lie/hold points + furniture clipping check; 6 9:16 framing standard for rooms; 7 light rig standard + preview must
match final; 8 render speed budget; 9 outdoor backdrop for every window. Style = modern.
Props: covered by env 2, 3, 5 (plus hand-prop size rule).
Next phase being discussed: render pipeline + speed.
Render foundations (agreed 09:47): measure cost per stage; compute static shadows/bounce once per shot (camera moves are
fine, they don't change it); cheap or no practical-light shadows, and practicals only when motivated; preview = final
check; resumable streamed frame renderer; tight speed budget (~10 s/final frame target); before/after proof for every
speed fix. Next phase: camera (Xavier has ideas).
Camera foundations (agreed list, to build later): move library with smooth easing (no velocity pops, no jitter);
continuous-path camera within a scene; scene changes = camera motion carries over + short dissolve (~0.25-0.35 s);
event-reactive camera (impact shake, reveal push); one-focus rule per shot + R6 9:16 framing/headroom rules;
frame-rate test 24 vs 30 vs 60 fps on one shot for Xavier to pick (60 = double render time).
Next phase: 5 animation + posing.
Camera decided (10:00): 30 fps if visibly smoother than 24 (test one shot); Gneef-pace cuts with motion-matched shots
(camera keeps its direction of travel across the cut) + 0.25 s dissolves between places; motion curves maxed.
Animation/posing foundations (agreed, build later at max effort): research (12 principles, Roblox animation, R6 posing)
+ explainer-kit lessons; POSE LESSONS system: every pose Xavier gives is diffed against Claude's, the principle is
written down with before/after images, new poses are built from principles + the emotion and checked against them.
Next phase: 6 clothing triage + character bank + 3D clothing fixes.
Clothing + bank foundations (agreed): automatic fit checker (each garment on both bodies in rest + raised-arm + sitting
poses, measures body poking through and sleeve offset from the arm blocks, flags or auto-fixes), sleeve snapping to arm
blocks, triage by usability (normal / mid / odd; mid and odd kept aside), recolour system with real fabric materials,
colour-harmony check per outfit, skin-tone scale, hair colour set, bank file (name, sex, skin, hair, outfit, accessories,
personality line) + one sheet of all 200. Faces added to the bank in the faces step.
Next phase: 7 faces / face animation / lip sync.


## 2026-11-18 overnight run (docs/OVERNIGHT_PLAN.md) — results waiting for Xavier
- research/gneef_top20_scripts.md: Gneef top 20 broken down. KEY: his hits are 77-174 s (median 138 s), not 20 s; every
  one opens at 0.0 s with "In this world/town..." + the rule and its cost. Length decision needed.
- research/scripting_retention.md: hooks, retention engine, Reddit drama adaptation table, draft script checklist.
- research/voice_options.md: Fish Audio (cheapest, has "Roblox" voices, API) vs ElevenLabs Creator $22. He decides.
- research/render_speed.md: 11.5 -> ~9.6 s per final frame, look unchanged; tools/render.mjs (streamed, resumable),
  tools/timing.mjs, tools/lookcheck.sh (preview = final: PASS).
- Pose editor on the studio R6: https://claude.ai/artifact/Wodk7AKaH6PrU4eRtEMiWR ; docs/POSE_LESSONS.md.
- Model pull: tools/roblox/models.py (Creator Store search + pull + re-skin), engine/rbxmodel.js, sheet
  docs/sheets/models_v1.jpg. Unions not readable yet (models built from unions come out broken).
- Clothing: sleeve snapping + automatic height fit (library/fit.json) + fit checker (tools/fitcheck.mjs,
  library/fitcheck.jsonl) + usability pre-sort (tools/triage.py -> library/triage_auto.json) + visual check page
  wearcheck.html. Still open: the armpit/hem tear when arms go up (needs real skin weights on garments).
- research/scale.md + docs/sheets/scale_v1.jpg: scale standard DRAFT (1 stud = 0.34 m, door 4.5 x 7.5 st, etc).
- Clothing triage gallery: https://claude.ai/artifact/FHSHzJXQyYnqqWgemK5i5G (1,444 R6 3D garments, sorted normal /
  in-between / odd and fit ok / body shows / opens when moving). Sleeve cuffs now go with the arms (no more floating
  slabs when arms go up); 946 garments got an automatic height fix (library/fit.json). The fit flags are a first pass:
  some tight "1.0" items are flagged wrongly, his eye decides.
- Waiting on Xavier: length decision (Gneef hits are 2-3 min), voice provider, scale draft, triage picks, union reader
  priority for Creator Store models.
- Laptop mirror: C:\Users\Luminmgmt\Documents\TheRedHoodGuy\files (working copy) + TheRedHoodGuy.bundle (full git
  history; `git clone TheRedHoodGuy.bundle` restores it). A half-made `repo` folder there could not be deleted (no
  delete permission while he slept): safe to delete. Future mirrors: overwrite files\ and the bundle after each push.
- Review page (all overnight results + decision boxes): https://claude.ai/artifact/E6kz1NPD3bmkh98SchE72U

## 2026-11-18 17:09-17:25
- Decisions: length = as long as the script needs, max 3:30; voices = Roblox male + Roblox girl; scale draft NOT
  approved (Claude must verify it by measurement first).
- Union reader done (tools/roblox/models.py); tools/pull.py now pulls ANY Roblox link (catalog or Creator Store).
- Room kit v1: engine/sets/roomkit.js (scale v2 sizes, real door + window models from the Creator Store, skirting, switch, sockets, film-set walls that still cast shadows); test scenes/room_test.js, docs/sheets/roomkit_v1.jpg. Also: builders' part transparency now kept; glass never blocks the sun.
- Placement helpers: engine/place.js (onFloor, againstWall, onTop, anchors seat/lie/top found from the shape, faceTo, sitOn, autoSit, clipCheck, unclip); test scenes/place_test.js + tools/placetest.mjs, docs/sheets/place_v1.jpg (clip 0). Post pipeline now guards against bad pixels (one NaN pixel had been blurred into a black block).

## 2026-11-18 17:55 World step 1: house design boards (awaiting Xavier)
- research/house_design.md: real US plans (room sizes, bedrooms upstairs, 9 ft ceilings) + 2026 interior trends, cited.
- houseboard.html -> docs/sheets/house_A_board.jpg (warm modern, guy's family), house_B_board.jpg (soft organic, daughter's family).
- Self-check fixes before sending: stairs now stack floor to floor, no empty upstairs corners, House A garage made car-sized (was 3 x 2.5 m).

## 2026-11-18 18:50 World step 2 started: House A living room furniture (awaiting Xavier)
- engine/designs/houseA.js PIECES (one builder per piece, re-coloured to the board palette); furnboard.html renders them next to R6.
- Sheet: docs/sheets/houseA_living_furniture_v1.jpg. Sources: store sofa 11652583496 (repainted), Poly Haven armchair / console / plant / pillows, modelled table, rug, arc lamp, TV, art.
- New: materials boucle (curly_teddy_natural; wool_boucle is actually PLAID, not used), linen, jute, velvet; loadRbx paint option; ph swap option; texReady() (unloaded maps rendered black in stills).
- Poly Haven sofas are all Victorian / classic: unusable for modern houses. Store sofas mostly blocky; 11652583496 is the only good modern one found.

## 2026-11-18 21:00 WORLD BUILT v1 (Xavier: "build everything")
- Plans v2 (engine/designs/plans.js, one source for boards + interiors + shells): 16 x 11 m houses, corridor upstairs,
  main stair + cellar stair side by side, every door / window placed once.
- Interiors: engine/sets/house.js (multi-room floors, shared partitions, stairs + stairwell holes + railings, attic roof),
  engine/designs/styles.js (per-room surfaces), furniture.js (library), furnish.js (layouts by room type, slot-based so
  doors stay clear). 38 rooms furnished. Stills: tools/allrooms.sh -> out/rooms/, sheets docs/sheets/house_{A,B}_built_v1.jpg.
- Shells: engine/sets/shell.js (siding / stucco, trims, roofs, garage, porch, path, driveway) from the same plan.
- Town: engine/sets/town.js from real OSM data (research/map.md): roads, sidewalks, 972 building shells, parks, civic
  signs, leaf-card street trees, House A + B on two real lots. Sheet docs/sheets/town_v1.jpg.
- Known gaps (v1): his-bedroom desk corner cluttered; attic dust sheets read as blocks; shower glass hard to see;
  hallway still cameras face walls; town buildings are shells with painted windows (by design until a story needs one).

## 2026-11-18 22:40 World v2: self-checked rooms
- Root causes fixed: placement boxes ignored see-through parts (toilet water block), model yaw was undone by placement
  (sofas were sideways), desk items placed in world axes (monitors faced the wall), pillows stood upright.
- furnish.js now self-checks every room: pieces clipping each other, through walls, in doorways; loose pieces (chairs,
  plants, lamps, boxes) auto-nudge to a clear spot; chairs face their table / desk; walls track what already stands on
  them. Final report: zero problems (only the optional dining console is skipped where no wall is free).
- Sheets: docs/sheets/house_{A,B}_built_v2.jpg.

## 2026-11-19 01:00 Bulk batch 1: camera system, SFX bank, voice + animation research
- Camera: engine/camera.js + film.html dissolves; demo scenes/camera_demo.js -> out/camera_demo.mp4 (8 s, 30 fps, review quality). Every frame checked.
- SFX: 688 sounds downloaded through the laptop (tools on the laptop: ~/sfx_dl.py), catalog library/sfx_catalog.json.
- Research: research/voice_fish.md (needs Xavier's Fish Audio key), research/sfx_sources.md, research/animation_r6.md.

## 2026-11-19 Character bank v2
- Fixed two render bugs Xavier spotted: female torso prints were upside down + warped (UVs processed twice), and sheets
  drew clothes at 1/8 res. Labelled test template (assets/_test_shirt.png / _test_pants.png) is now the check for any body.
- Bank = library/characters.json (100 m + 100 f, 26 archetypes), built ONLY from items I passed by eye (library/bank_ok.json,
  tools/bankpool.py). tools/charbank.py --redo <ids> regenerates single characters. Review log: docs/sheets/charbank_review.md.
- Grey hair for grandparents = real desaturating tint in r6.js wear(). 3D clothing left out of the bank until its fit is fixed.

## 2026-11-19 Colourways, classroom v1, research batch
- Repeated bank garments get their own colourways (tools/recolor.py, assets/variants/).
- Classroom set v1 (engine/sets/classroom.js, scenes/classroom.js): research/classroom.md. 22 bank students + teacher, 0 clips.
- Research: research/animation.md, faces.md, cinematography.md (+ research/README.md index). Next: distil into
  docs/ANIMATION.md + a docs/LOOK.md draft, close the look gaps (grain, CA, halation, motion blur, lift/gamma/gain,
  per-shot key + rim, colour script step), then faces.

- 2026-11-19 04:xx: research before/after sent (docs/sheets/research_before_after.jpg, scenes/research_ab.js, opts.mode before|after). Same whisper beat; after = OTS, 30 deg lens + DOF on her eyes, fill cut + key + window rim, asymmetric posing, kit v2 face, lift/gamma/gain grade. Known weak: his foreground head is a black slab, her near arm a plain block. Next: docs/ANIMATION.md + docs/LOOK.md drafts from research/.
- 2026-11-19 07:xx FACES: AI sheets 05/11/13/16 sliced + keyed (tools/facesprites.py -> assets/faces/sprites), old repo face kit ported (engine/legacy), classic pack + AltiWyre pulled (tools/rbxm.py), engine/faceset.js = 32 emotions + 16 visemes for every family, faceSet on all 200 bank characters, classroom scene wears them. Sheets: docs/sheets/faces/.
- 2026-11-19 08:xx Face probability model (library/face_model.json, tools/faceassign.py: girls 16% non-girl faces, guys 29%);
  male refs 26-28 for AI sheets; lip sync (research/lipsync.md, Rhubarb at /opt/rhubarb, engine/lipsync.js,
  scenes/lipsync_test.js); docs/ANIMATION.md draft + docs/sheets/pose_proof.jpg; docs/RESEARCH_PROOFS.md.
  08:04 Xavier: split eyes jagged, girls' eyes "bleeding": sprites re-keyed (thick whites bounded by ink kept whole,
  slivers dropped), 05 eyes rebuilt as clean vector layers (tools/eyerig2.py). PRIORITY RULE logged in DIRECTOR_NOTES.
- 2026-11-19 09:15 Sprites now 1024, edge colour decontaminated (no light rims), crisp alpha; 05 eye layers rebuilt at 1024; lip sync clip re-rendered and checked frame by frame (mouth vs Rhubarb cue every frame): out/lipsync_test_audio.mp4.
- 2026-11-19 09:50 Lip sync v2 = anime flap from the audio (tools/flap.py, engine/lipsync.js flapTrack): out/lipsync_flap.mp4, checked frame by frame. docs/FRAME_CHECK.md (research in every frame) is law. engine/r6pose.js ported (shoulder-vs-elbow). NEXT: content engine.
- 2026-11-19 10:30+ FIRST TEST VIDEO (04 Shadow Steps, low quality 360x640 15 fps): voice = Gemini Puck at Gneef pace
  (topics/shadow_steps/voice), fixed cast (library/cast.json, engine/cast.js makeActor / shadowOf), scenes/shadow_steps.js
  (opts.loc street | class | room, rendered per location with render.mjs --t0, cut together on the voice).
  Shadows = the real posed R6 flattened, opaque ink (overlaps never stack). Boy's shadow = Mia's body, Mia's = his.
  Cliffhanger shown, not said: his shadow lifts its foot at the door, cut mid-step.
  5_E / 5_F talking-mouth sheets in the bank (assets/faces/ai/05_intimidating/E.png F.png -> sprites E01-16 F01-16),
  used by every custom face's talk flap, picked by emotion row. Fixed: suburb door matrix bug, face cache key.
- 2026-11-26 HANDOFF (end of the Clap Cops chat; next chat starts a new video):
  DONE: Clap Cops final (out/ is not in git): 1080x1920 30 fps, music + no-music versions, thumbnail (pink foil packet, Dad
  side-eye, scenes/clap_cops.js opts.thumb). Xavier deleted the uploads to fix the voice level in CapCut (main video 0 dB,
  music -15/-18 dB, his SFX -6..-10 dB); he will send the export to check, then post: TikTok ~7:30 PM Lagos, YouTube ~2 AM
  Lagos (research/analytics/2026-11-26/POST_TIMES.md).
  NEW TOOLS: tools/clipscan.mjs (every-frame clip gate), tools/upscale4x.py (Real-ESRGAN CPU; textures served via HITEX=1,
  2K Poly Haven maps break the renderer: keep 1K), engine/act.js floor clamp + per-actor A.ground, walk style.tilt / down /
  lift, hingeDoor splits door bars from frame meshes.
  RESEARCH: research/retention_composing_2026-11-26.md, research/analytics/2026-11-26/RETENTION_DROPS.md (exposition +
  vague lines leak, on-screen clocks hold, cut on the payoff), POST_TIMES.md. Script pre-flight in RULES_CHECK_TEMPLATE.
  SCRIPTS ON THE SHELF (none approved): topics/match_day (v3 sus), topics/search_history (v2 sus), topics/do_overs_67 (v2 sus),
  topics/midnight_power (v1, the last pitch: superpower = what you're doing at midnight, blink-teleport twist). Xavier
  dropped the sus angle at 03:44 for "one exciting weird rule + twist that people want to stay for". Lesson: retention is not
  fewer words (DIRECTOR_NOTES 03:32).
  PENDING: he sends a finger-snap SFX; mailman restyle needs his OK if Match Day is ever made.
- 2026-11-27 Asset audit: all code, scenes, docs, research, analytics, scripts, logs and mp3 SFX were already in git. Added the gitignored irreplaceable audio (every voice.wav, the .wav SFX sources) + topics/clap_cops/thumb.jpg. Not in git by design: assets/roblox/ (11 GB catalog cache, re-fetch with tools/roblox/fetch.py + models.py by the ids in library/cast.json and the scene files), out/ (renders; finals delivered to Xavier).
- 2026-11-27 HANDOFF (end of the Lucky Me chat; next chat starts a new video):
  DONE: Lucky Me final out/lucky_me_FINAL_10M.mp4 / _12M.mp4 (out/ not in git). Title "Luck Moves to Your Neighbour 🍀".
  NEW: captions v2 (bouncy one-word, Montserrat Black 140) + animated bad-luck counter (topics/lucky_me/jaden_counter.json),
  subscribe prompt (library/subscribe_prompts.json pose+camera library; card + avatar), engine/luckfx.js (poof, cashRain,
  shatter, bolt, fire, smoke, spray), engine/props/skates.js (mailman), engine/designs/luckprops.js, tools/popcheck.mjs,
  tools/render_chunks.sh, tools/musicmix.sh, tools/finalize.sh, library/sfx_xavier/ (his meme SFX + README of where each
  goes), library/music/ (regular track), library/brand/channel_avatar.jpg, research/caption_reference_2026-11-27.mp4.
  OPEN: vine boom SFX never received (ask for it). Subscribe character changes per video; pose stays selfie_wave_v1 until
  he sends a new pose + screenshot.
