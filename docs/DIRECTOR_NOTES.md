# DIRECTOR NOTES: every mistake Xavier has flagged

Read before building anything. A new note goes in the same turn he gives it (date + one line).
The first block was carried over from explainer-kit REVIEW_NOTES.md (2026-10-23 to 2026-11-15), trimmed to what still
applies to storytime. Explainer-only rules (Brain HQ, "You see", the tickle recipe, "Why ..." titles) were left behind.

## Acting
- How would a real person do it? Standing up = lean, push off, rise, settle. Turning = a step-turn over a beat
  (.6 to .9 s) with moving feet. Never snap into a pose and hold it. Every action: pre-action, action, reaction, post-action.
- What does this person feel RIGHT NOW, given what just happened? Faces fit the context. No default reactions
  (both hands up + shocked face, jumping). Adults react like adults.
- Action then reaction, and it is SHOWN: reach, the hand stops on the handle, then pull, and the door follows the hand.
  Nothing opens, flies or falls by itself. Cause before effect.
- Each action gets enough screen time to read. If the voice is fast, simplify the staging.
- A speaking character moves his mouth. No fake lip sync when the line is not his.
- R6 has no elbows or knees: whole-arm actions pivot at the shoulder; forearm actions slide the block so the shoulder
  becomes the elbow. Seated: the top of the leg reads as the knee, or the hip region of the leg is the butt.
- Dynamic poses: never mirror the arms, commit the whole body (lean, tilt, hip shift), head goes with it, legs uneven.

## Contact + clipping (near zero from 2026-11-16)
- If something clips, ask WHY and fix the cause (prop facing the wrong way, set too cramped, chair not pushed back).
- Characters interact with surroundings like real life: the chair moves back before he stands. Give clearance from walls.
- When someone holds or uses a thing, the hand is ON it the whole time (straw at the lips for the whole sip).
- Props are sized for R6 bodies; hand props fill the hand block, never tiny. Props face the right way.

## Models + props
- 2026-11-16: the base male body must be EXACTLY the shape of the male model he supplied before (explainer-kit
  `6910cb06-roblox_r6_rigged`), but built by us so bevels, edges and texture are ours to control. Measured and matched:
  torso 2 x 2 x 1 studs, arms and legs 1 x 2 x 1, head radius .6, height 1.2, round .3 fillet, head centre at 4.5 studs.
  Check any change against it with the outline overlap test (99.7%+).
- 2026-11-16: no faces on anything until he gets to the faces item (`face: false`).
- Research the real object first, then model its real parts, right from every angle the camera sees. No primitive stand-ins.
- Gag items are fake-brand versions of real products, no real logos.
- Text on props never touches the edges.
- Xavier 2026-11-16: "The way you model props is ass. You just add rectangles and circles and spheres." Clothing and hair
  included: a hoodie is a modelled hoodie, pulled from a proper source or built properly.

## Camera
- Not too tight: leave room around the subject. Never only someone's back: show faces.
- Never fully still: held shots push, pull or drift slowly.
- Every cut has a point, and that point is the subject of the frame. One clear thing per shot.
- Scene changes must be readable. Hide anyone who is not part of the shot's point.

## Look
- Think what every surface IS, research its typical real look, then paint it. Clean and subtle, not gritty.
- No vignette, no bloom washing rooms out, no cloth folds, no impact freezes, no speckle noise.
- No empty horizon outside windows.

## Sound
- A sound plays on the frame the thing really happens. Real sound bank only, never synthesized. No music.

## Process
- 2026-11-16 (Xavier, angry, after an unattended run burned his credits): ONE checklist item at a time. Build a small piece,
  show it, he approves or corrects, only then the next piece. Never build ahead on unapproved work, never batch items,
  never run unattended unless he says so for that specific item. Say the rough cost before any long step.
- 2026-11-16: his verdict on the first drafts: the street set and its bushes are trash, hair clips into heads on the cast sheet.
  Drafts from that run are NOT approved and are not a base to build on until he signs each one off.
- Never send a preview he has to find mistakes in: every frame is checked first, and stills at hand-picked times
  are not enough because they miss what happens between them.
- First 2 seconds must move, with the hook on screen from frame 0.
- He should never have to say the same thing twice.

## Co-director rules (Xavier 2026-11-18, keep forever)
- Put director-level thought into every detail. Don't drop a rug and leave it: ask what a person / a director would ask
  (varnish the floor? real bevels on board edges or overkill? a woollier rug with fibres? rough wall? scratches on the table?).
  Not every surface needs a pattern; every surface needs thought.
- Colour by colour theory is Claude's job. Every frame: does anything clash, is it beautiful, what would make it better?
  Never match characters' clothes to the room; design room + light so any character reads well.
- Cinematography: add backlight / rim / soft fill / bounce when a character looks off, even if no visible source explains it,
  as long as nobody would ask where it came from. Every scene has a mood.
- Frames must never be flat or washed out (the old problem). Nothing childish, blocky or AI-looking.
- Pull complex models (Roblox Creator Store with the cookie, Poly Haven, Sketchfab if he gives a cookie), strip their textures,
  use our materials. Never model complex things from basic shapes.
- Hand-held props for R6: about as big as the square end of the hand block.
- 3D clothing issues to fix later: sleeves not lined up with the arm blocks (clipping), hem strip at the hip on raised arms.

## 2026-11-18 08:53 Lighting is per SCENE, never a named template
- Xavier: don't build "golden hour", "night" etc. as fixed presets. Each scene gets the light its story needs (bedtime
  story on an autumn evening = low warm sun; snowy winter night = deep navy, cool and chill but still popping, never
  desaturated). The test is: can Claude deliver what a given scene needs at that time.
- His analogy: vanilla Minecraft vs shaders vs texture pack vs animation pack. Our work now = the SHADER layer
  (volumetric light, bloom on real lights, DOF, grade), then textures, then animation.

## 2026-11-18 09:37 Don't polish final details early; modern style
- No final-detail work (dust, tiny tweaks) before we have a video. Xavier calls final details himself after watching
  a video. Build the big things first.
- Shader look v1 (bedtime still) approved: "very decent, I do really like it", window bloom good (could be a bit smaller).
  No need to build different lighting looks now; the concept is proven.
- Style: MODERN houses and modern interiors. Research what a real modern bedroom / house looks like, then pull or
  make models to match.
- Posing in the test still was basic on purpose; the old repo's posing lessons get applied in the animation step.

## 2026-11-18 09:47 Every light must make sense for the story
- The bedtime still had a bedside lamp on in daylight with nobody using it. Wrong: no practical light is on unless the
  scene calls for it (night, someone switched it on). Nobody reads by a lamp in daylight. Think what a real person
  in 2026 would have on.
- Speed budget is very tight: block anything that costs render time without clear payoff.

## 2026-11-18 09:52 Speed budget wording + camera ideas
- Correction: render time is ALLOWED to grow when a feature earns it; just keep minimizing it in mind. Don't block features.
- Camera (Xavier's ideas, binding):
  - Keep the viewer's eyes moving: something always moves (camera or people). Never a frozen camera.
  - Every shot has one clear focus: the viewer knows what to look at.
  - Buttery smooth camera: eased, gliding, clean, "feels like 120 fps". Shakes only as exaggeration on impacts.
  - No erratic jumps: the camera feels like it glides on one continuous path through the scene. Changing scene/place:
    the camera's framing and motion carry on and the WORLD changes under it, with a short fade/dissolve (not slow, not
    a hard cut).
  - The camera reacts to events (hit a table from a low "giant" angle -> small shake) so the viewer feels it.

## 2026-11-18 10:00 Frame rate, cuts, posing must be LEARNED not copied
- Smoothness comes from motion curves: use camera motion curves to the max. 30 fps if it is visibly smoother than 24.
- Combine Gneef's ~1.5 s snappy cuts + continuous gliding camera + short dissolves (~0.25 s) between places.
- Poses: when Xavier makes a pose, Claude must LEARN WHY (what changed vs Claude's version and what principle it
  shows) and apply the principle to new situations, never paste the same pose for the same emotion.
- Animation step = deep research first: 12 principles of animation, how animation works, Roblox animation, R6 posing.
  Then merge with explainer-kit lessons (locked motion style, dynamic posing, action arcs). Xavier will run that step
  at max effort.

## 2026-11-18 10:06 Self-check every frame + clothing fit + character bank
- BEFORE showing any frame or video: look at it and find what is wrong (camera, objects, characters, things on
  characters). Xavier saw clipping sleeves on most 3D clothing and didn't point it out; finding it was Claude's job.
- 3D clothing must FIT: the torso piece on the torso, sleeves exactly on the arm blocks, accessories seated. Any
  clipping or wrong look on the body is Claude's to fix.
- Character bank: 100 male + 100 female background characters. Skin on a scale from fair to a decent brown
  (darkest ~ the bedtime test skin or a bit darker), random per character. Good hair each, varied hair colours.
  Clothes from the triaged normal clothing (flat and 3D mixed), accessories with personality (glasses, headphones,
  bag) that fit and never clash; recolouring allowed but with proper real materials (real denim texture etc).
  Built only after clothing triage. Faces come later; mains are designed separately with Xavier.

## 2026-11-18 10:08 Personality = what the character looks like
- Personality is not a text line: think per character what that type actually carries and wears. Jock: sporty 3D
  outfit. Nerd: glasses, neat shirt, maybe a book bag. Cool kid: shades, skateboard, streetwear. Then dress them so
  the type reads at a glance.
- Faces / face animation / lip sync and scripts / niche / retention are moved to later (complicated, own sessions).

## 2026-11-18 10:20 Voice, SFX, checks, sync, NICHE
- Current voice tool (Kokoro) is bad. Study how Gneef's voice/words actually sound and pace (verify the 262 wpm).
  Xavier may pay for ElevenLabs or fish.audio for the "typical Roblox guy / Roblox girl" voices (undecided).
- SFX bank must be perfected in this repo (real sounds only).
- Captions: Xavier explains his style later.
- Hook/boredom checks happen in PLANNING (directing the script), not on the rendered video. Clipping check and
  every-frame check run on EVERY render, every time.
- Every GitHub push is mirrored to an organised folder on Xavier's laptop (flash-drive backup). Push only when the
  overnight work is done.
- Tools to have: the pose editor (port from explainer-kit, fix it up) and the Roblox pull tool (incl. models).
- NICHE: Reddit-style drama storytime (proven, pre-tested by upvotes) acted out by our Roblox cast (our edge vs
  gameplay-background channels), plus some Gneef-style "In this world..." high-concept stories with a crazy twist.
  Write originals/adaptations in our own voice, retention and animation; never read posts word for word.
- THE question for every script, every frame: "why is this person not scrolling away?" Frame 0, first 3-5 frames,
  first second and first line must answer it; then every few seconds there must still be a reason (a promise, a
  twist coming, something crazy happening or about to happen).
- Long form (3-10 min) version of every story later; shorts first.
- Research to do: Gneef top 20 most viral scripts broken down to the molecule (hook, retention beats, boredom
  checks, payoff); YouTube scripting, hooks, retention rates and strategies; the old explainer-kit chats on retention.

## 2026-11-18 16:59 Clothing review notes (later, not now)
- Look at EVERY garment Claude fitted one by one and judge whether it was done well (not just the automatic flags).
- The triage gallery mixed male and female items: keep them separated (male / female / both) so they can be told apart.

## 2026-11-18 17:24
- Xavier loves the materials / textures in the room kit test (laminate floor, plaster walls, walnut door): keep that look.
- Skin showing at the top of the arms on that flat sweater is probably the shirt's own style: not a bug to chase.

## 2026-11-18 17:38 Sets must be DESIGNED, not random assets
- The placement test mixed random store pieces (a brown cardboard-looking armchair next to a grey sofa): no design.
  "Modern house" means a designed home: find real modern house designs online and build sets that match them,
  every room one coherent design (palette, materials, furniture family).
- Build the full interiors of TWO different houses (houses don't all look the same):
  1. a guy's family house (parents' bedroom + his bedroom),
  2. a family house where a girl is the child (her room), so sets and colours are more diverse.
  Rooms: living room/parlour, kitchen, dining, toilet, shower/bathroom, storage, basement, attic, bedrooms, upstairs +
  downstairs (stairs, halls).
- Then the outside: the house shells, the neighbourhood, the town. One town we always reuse, so it must be very well
  planned: a proper map with school, police station, fire station etc. Other buildings are OUTER SHELLS only until a
  story needs their inside. Ideally copy a real, good-looking neighbourhood (e.g. American) from a map.
- Same standard as Gneef's world: a proper actual set. Pulled models are fine as long as they fit the design.

## 2026-11-18 19:25 Inspect every imported model
- The store sofa had a throw blanket "dripping" over it and I sent it without noticing. EVERY pulled / imported model gets
  looked at close up before it is used: drips, throws, stray parts, holes, wrong scale, baked junk (blankets, logos, text).
  Remove what doesn't belong (split the mesh) or reject the model.
- "Build everything" (houses, shells, town) quickly so we can move to the next phase. Show him the result, don't stop per room.
- 2026-11-18 20:29 Trees: blob trees (noisy spheres, low-poly facets) REJECTED hard ("low poly pieces of shit"). Trees are
  built like game trees: real trunk + branches + hundreds of alpha leaf cards from a real leaf scan (engine/sets/town.js
  treeParts). Never ship faceted blobs for foliage.
- 2026-11-18 21:41 "Look at the frames yourself" (again, angry, he waited hours): I sent room sheets with a chair facing a
  blank doorway, pillows standing upright, a toilet in the middle of a bathroom (its invisible water block pushed it off
  the wall), clipping pieces. RULE: every set build runs the furnish self-check (clips / through walls / doorways / loose
  pieces auto-nudged) AND I look at every still before sending. Chairs face what they serve (table, desk, TV). Nothing
  goes out with a known clash.
- 2026-11-19 01:41 Character bank v1 (angry): m000 "jock" in overalls + mint hoodie, m002 hair through the cap, m006 3D
  sleeves swallowing the hands, m007 colour riot (plaid + purple), m008 reads as a woman, m009 / m011 broken sleeves,
  m010 in women's clothing. "LOOK AT EVERY SINGLE CHARACTER, BOTH MALE AND FEMALE." RULE: every generated character is
  looked at by me, one by one at full size, with a written pass / fail per id, BEFORE any sheet is sent. Generator rules:
  men get men's hair (short / medium, nothing past the jaw) and men's clothes (no crop, no bare belly, no blouses);
  outfits match the archetype; pants plain or denim, max one loud piece per outfit; no hat over hair that pokes through;
  no garment whose sleeves cover the hands or end in broken bands.
- 2026-11-19 01:49 "textures flipped upside down, pants way too high, all look very low quality": BOTH were my bugs.
  (a) female torso UVs were processed twice per vertex (gridRoundedBox) so every print on the girls' torso was upside
  down and zigzag-warped, which put pant waistbands at the chest; fixed + 16 columns on the pinched torso. (b) sheets
  drew clothing at res 256 (1/8). RULE: any new body / mesh gets the labelled test template (assets/_test_shirt.png,
  _test_pants.png: every face named, UP arrow) rendered from 4 sides before use; review sheets render at res 2048.
- 2026-11-19 02:10 "why repeat the exact texture when you can change the colour": a garment worn by more than one bank
  character gets a new colourway for every extra wearer (tools/recolor.py), prints kept, real cloth colours only.
- 2026-11-19 02:50 research scope added: film composition / staging, colour theory + colour GRADING (very important),
  lighting types, camera (lens types, FOV, depth of field), and "pseudo-photorealism": how films and animations look
  like films (not basic 3D objects dropped in a scene), applied to camera, characters, backgrounds, scenes. Goes with
  the animation, posing and Roblox-faces research.
- 2026-11-19 04:16 Faces (kit v2 drawn faces): he likes them but they're "weird". Eyes too far apart, too high (near the
  top of the head), too far from the mouth: eyes + mouth make "one massive triangle". WANT: eyes closer together, closer
  to the mouth, the whole face sitting lower on the head (near the base, not at it). The eye drawing style looks weird
  too: try other eye styles. He will send a cartoon reference screenshot. He HATES the 3D dynamic head (Man Face / Silly
  Fun): never use realistic 3D heads. He loved the research before/after ("exactly what I want"): keep researching
  where it helps.
- 2026-11-19 04:29 Face STYLE PACKS: for each chosen dynamic head (1,2,3,4(=18,22),5,6,7,8,16,17,19,20(=34),21,23,24,
  26,28,30,31,33,39,42,44,47,48) draw that face in its style, then a full set of expressions in the SAME style (like
  1 vs 29: same style, different expression). If the catalogue already has the style in other expressions, show them.
  "Put a lot of effort into this, artistry." RULE (again): never show anything without inspecting every detail first.
- 2026-11-19 04:45 My hand-coded face style packs: "terrible, horrendous". STOP drawing faces in code. New pipeline: I
  split each chosen dynamic head into its own reference PNG + write a detailed AI image prompt (expression sheets, mouth
  shapes for lip sync, eye / brow parts, exact layout and presentation); Xavier generates the sheets in Gemini / ChatGPT
  and sends them back; I slice, key and rig them onto the head.
- 2026-11-19 07:17 Sent AI sheets for styles 05 (male), 11 (neutral), 13 + 16 (female); a CLASSIC_FACES zip (647 faces);
  asked me to pull the Classic Roblox Facepack + AltiWyre's Face Pack, and to bring back the old repo's faces. RULE:
  randomise faces across the bank: females get the female styles (13, 16), some the neutral 11, some old-repo faces;
  males get 05 / 11 / old-repo faces; "the most diverse face ever". Asked: what comes after faces.
- 2026-11-19 07:44 Faces need a PROBABILITY MODEL: faces not custom-made for girls (11 neutral, big-eye, kit, classic)
  count as "ugly on girls": low (not zero) chance on girls; a bit higher on guys. A girl with a pretty personality must
  never get an ugly face (f020 big-eye -> prettier, e.g. sleepy chibi). Wants 2-3 more male dynamic heads to make AI
  sheets. LIP SYNC must match the audio phoneme by phoneme, never random flapping: research it properly (not only
  Roblox). Separate eyes / pupils / brows if feasible. Wants PROOF (visual) for every research area, incl. animation
  + posing (dynamic poses). Thinks camera was finished: check the logs.

## PRIORITY RULE (Xavier 2026-11-19 08:04, repeated many times): INSPECT EVERY PRODUCT IN DETAIL BEFORE SENDING
Before anything goes to Xavier: open it at FULL size, zoom into every face / edge / contact, dissect it (jagged edges,
see-through parts, skin bleeding into eyes, clipping, wrong shapes). A thumbnail look is not a check. If I would not
defend every pixel of it, it does not get sent.
- 08:04 the layer-split eyes looked chopped / jagged; the girls' eyes look like the skin bleeds into them. Idea from
  Xavier: keep the eye base shape as the mask and put a clean full circle pupil where the pupil was, hidden by the lid.
- 2026-11-19 08:41 Faces: remove the faint white edges around face lines; upscale the sprites so edges are crisp and sharp.
  ("I like the progress. Keep it up.")
- 2026-11-19 09:21 RESEARCH IN EVERY FRAME (priority rule): composition, lens + depth, lighting, posing, face acting and
  grade from the research must hold in EVERY scene and EVERY frame of every animation. It is part of the frame check I
  do before Xavier sees anything (docs/FRAME_CHECK.md). Lip sync test was "extremely bad": needs extensive research and
  a different approach (Xavier suggests anime-style open / close flap). Budget: 80% of his weekly limit used, resets
  Tuesday: everything must be done by then. Next phase after fixes: CONTENT ENGINE (retention, hooks, cuts, camera,
  actions), then a strict CLAUDE.md of rules, then the first video. Steal what worked from the old repo (the
  shoulder-vs-elbow posing research).
- 2026-11-19 09:52 Mouths: sheet C mouths too big (5 = massive) and mostly smiling; Ethan talked with smiling mouths on a
  serious face. Mouths must MATCH THE EMOTION (happy line = smiling talk, serious / neutral = neutral talk). New prompt:
  docs/face_prompts/MOUTHS_v2.md (rows per mood, one mouth opening wider, small). Then: content engine -> CLAUDE.md
  rulebook -> first video, all before Tuesday.
- 2026-11-19 10:24 CAST IS CONSISTENT: once a character plays someone (the hoodie boy's mom, sister Mia, grandma, dad),
  they stay that person in every video. Two MAINS: the boy in the red hoodie (narrator) and a main girl with her OWN
  family (Mia is NOT the main girl). Mains wear 3D clothing: the boy = a proper full red 3D hoodie (no zipper) + jeans.
  Make CHILD (~10 y) and MID (between child and adult) versions of the male and female bases (shorter legs / torso),
  textures must still fit. Voice: match Gneef's narrator exactly (pace, sound); the "Roblox guy" voice; later a girl.
  CLIFFHANGERS ARE SHOWN, NOT SAID: cut the last line, let them watch it happen. No clipping: fix clips with more
  dynamic poses. Wants the research applied automatically while making a video. Mouth sheets 5_E / 5_F: add to the bank
  for every custom face (male + female). Test the script as a LOW quality video while he sleeps.

## 2026-11-19 15:01 Shadow Steps test: "terrible", lighting + camera (Xavier, angry, ~90% of weekly limit)
- LIGHTING was absurd: none of the look study (research/look_study_2026-11-18.md) or the approved research before/after
  (scenes/research_ab.js) was applied. Every scene must use the look rig (engine/look.js): one motivated hard key
  (sun / window / lamp), real shadows, a soft key on the subject's face + a rim that cuts them out, darker overall with
  true blacks, richer warm colour, background darker and softer than the subject. Gate it with tools/lookmeter.py
  against Gneef's measured numbers before anything is sent.
- CAMERA was a PowerPoint slideshow: every shot the same slow push and the character barely moving. Gneef's camera is
  fast AND slow, left AND right, cutting: vary the move every shot (fast push, whip, truck left / right, orbit, track,
  crane, pull-out, punch-in), vary size and angle every cut, ~1.5 s shots, motion carries across cuts. Never the same
  move or size twice in a row. (Supersedes "72% slow push" in CONTENT_ENGINE.md.)
- Before sending ANY video: check it against the research docs, not only for clipping.
- Things already built and approved stay as they are (our engine, faces, flow). From explainer-kit only the old faces
  (kit/faces.js, kit/facekit.js) get merged into our faces; the rest of the old repo (posing, animation lessons) is
  carried over as the rules it taught. HANDOFF.md items are all pulled into legacy/explainer-kit/.
## 2026-11-19 15:43 Walk test v2 + "you followed nothing" (Xavier, 92% of weekly limit)
- Saying "I didn't check the docs" is not acceptable: EVERY rule we built must be applied every video, nothing skipped.
  -> CLAUDE.md rewritten as the full rulebook + docs/RULES_CHECK_TEMPLATE.md (every video ticks every rule with evidence).
- A dotted LINE cut across the boy's body: far fence pickets (.07 m) bleeding through (thin-geometry rule) + camera
  near .05 / far 800. Fix: no thin far geometry, near >= .15, far <= 400.
- The "trees" behind the houses were grey twigs + dots (tree_small_02 glb leaves not reading). Use treeParts game trees.
- Empty space behind him: "I thought we had a city / a full neighbourhood". No void in any camera direction.
- Wrong hoodie: the boy's hoodie is catalog 91631221833009 (Black Hoodie) with its sleeves, tinted RED.
- Next: script about gender swapping with his homeboy (homeboy becomes a girl, the boy's sinister "finally" look),
  approve, then the FINAL video straight away (no low-quality preview), unattended, following every rule. Push OK.
## 2026-11-19 16:19-16:24 Boy look + faces + light (Xavier, very angry)
- The boy is LIGHT-skinned like the old main (#f0c09e). Never change a main's skin. He needs HAIR (black, good-looking,
  chosen: 11442395338 "Short Black Spiky Anime Hair"); no extra hood item on top of the hoodie he chose.
- Sleeves must not run into the hands: a strip of skin shows at the base of the hand (the hoodie is built that way).
- Catalog roller skates were garbage: research real inline skates and MODEL them properly.
- Faces: NOT our AI faces and NOT "cool" eyes. The goofy round-eye AltiWyre faces (pack #36, #11, #12, #152, sometimes
  #512) with expressions (library/alti_face.json, eyes / mouths split by tools/altisplit.py).
- Light: stop making everything warm / golden. Default = bright, clear, sunny day (crisp white sun, blue sky, like a
  beach day). Warm sunset only where the story needs it, and even then not orange soup.

## 2026-11-24 / 25 (Sunset Tag final)
- Frame 0 must be mid-action and the retention formula applied every video (rule by 3 s, "You see", gags by 20%, "But I" by ~30%, clock, cuts ~1.5 s, shown cliffhanger).
- Captions are a SEPARATE layer, never baked into the 3D render: `python3 tools/captions.py <topic> [--title "..."] --burn` (styles at the top of the .ass; restyle + re-burn in ~2 min). Always deliver clean + captioned.
- Title card on frame 0 is optional (Xavier reconsidering): it is its own style/event, so a version with and without is one command.
- Motion blur is possible in three.js (sub-frame accumulation); Blender only if he gets an NVIDIA GPU machine.

## 2026-11-25 01:22 (Sunset Tag SFX + flow)
- SFX = ONLY sounds that something ON SCREEN makes (footsteps, slaps/taps, falls, skates, skids, a hand clasp, the swap poof the story needs). No gasps / laughs / voices unless a character on screen does it; no musical stings, whooshes, power-ups, record scratches, heartbeats, drones unless the video truly needs one. Never spam them at the end. Less is more.
- Background music must be clearly audible: ~10 dB under the voice, ducked while speaking; whole mix loudness-normalised to -14 LUFS (Shorts).
- FLOW (big one): no still frames. Shots must not be "camera goes to person, they do one thing, then they freeze while the camera pushes in". Action keeps going through every shot and across cuts (cut ON action, the next shot continues the motion), people keep doing things (secondary actions, reactions, walking on, looking around), the story flows from one shot to the next instead of each shot being its own frozen vignette.
- 01:30 refinement of the SFX rule: giggles (from on-screen laughers), a few whooshes, ticking clocks, heartbeats and swap sparkles in moderation are GOOD; a meme sound ("bruh") is welcome when it lands a deadpan joke. Still out: gasps nobody makes, record scratches, drones/stings stacked on the ending.
- 01:37: the Freesound 'heheheh' chuckle was wrong for the ending; use the evil cat laugh he sent (topics/sunset_tag/sfx/src/evil_cat_laugh.mp3, first laugh). REVIEW GATE IS BACK: always send a cheap low-res, low-fps review video for him to rate BEFORE the expensive final render (his 15:43 'final straight' was a one-off).

## 2026-11-25 02:29 (motion reference + full old-repo sweep)
- Ref video (davystep75 TikTok): "very smooth, very consistent camera, sometimes it seems handheld; no still moment; either
  the camera or the character is doing the work, mostly the character". Measured: research/motion_reference_2026-11-25.md.
  Engine: constant-speed camera moves + handheld layer (shots.js, camera.js). Gate: tools/motionstudy.py.
- He first asked for "never a still moment" on 2026-10-23 (explainer-kit). It was lost; now in CLAUDE.md section 9.
- Every animation / pose note from the old repo is in research/legacy_explainer/ANIMATION_COMPLETE.md (+ his full old
  messages in xavier_messages_old_chats.md).

## 2026-11-25 03:25 (texture quality)
- NOT about turning off bloom / realism. Videos must be 1080p, and EVERY texture (faces, clothing, sets, props) upgraded to
  2K-4K so frames look crisp and sharp like Gneef's / the refs. Audit 2026-11-25: 237 textures in Sunset Tag, none above
  1024 px; 56 at 256 px (body normal maps, hair maps); Poly Haven loaded at 1K and shrunk to 512; anisotropy 1-8.
- Scripts: every number must stay consistent with the rule (no 4,000 tries when the max is 100).
- 03:44: finals at 1440x2560 not downscaled, ~15 Mbps; upscale every texture of a video after the review OK. "Do not forget all our tips."
