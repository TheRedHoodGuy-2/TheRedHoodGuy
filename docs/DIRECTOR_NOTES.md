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

## 2026-11-25 06:56 Do-Overs: no render-to-debug, pose sheet first
- "Why do you have to render a full video, then check it, then fix?" Check with STILLS while building; a video render is
  only the final review step, lowest quality + fastest (lq, 180x320, 6 fps).
- Before ANY render: show the pose library (every pose used, story order, labelled) so he can repose the bad ones.
- "This render looks so trash, so undercooked. The animation is ass." The video was sent with known broken shots.
- "new video" in a new chat must run THIS workflow (TheRedHoodGuy v2), not the explainer-kit v1 one.

## 2026-11-25 07:17 posing lessons (his pose codes, now in scenes/do_overs.js X.*)
- HIPS AS KNEES: on a bike the knees go up = leg blocks slid forward + up (o y ~.2-.3, z ~.3), alternating for pedalling.
- Sitting: legs near-vertical slid forward (o z ~.33, y ~.11), root barely drops. Kneeling: legs r.x ~1.6 (shin back on
  the floor) + root y -.37. Proposing: one leg kneeling, the other leg up front (o [-.1,.38,.39]).
- Falls are posed and animated DYNAMICALLY (his fall code: body rolled rz 1.26, limbs splayed, root shifted).
- Hug = both arms forward ~r.x -1.35..-1.55, or wrapped (+o forward .24-.28) when the other person is big.
- Mom strapping her watch: hands clipped. Check hand-to-hand contacts.
- Convention (tested): arm r.x negative = forward, armL r.z positive = out, head r.x positive = look down.

## 2026-11-25 07:52 Do-Overs review v2: hook, loop, checking
- First 2-5 s are golden: frame 0 must be something out of place / mid-action that makes the brain need the next second.
  A kid riding a bike is not a hook.
- Ending too long and silent: end brief, on something that just happens, so it loops into the start.
- Frame 0 had the biker riding the bike BACKWARD; the car drives THROUGH the boy; he clips into the bed. Check every frame
  for direction, collisions and clipping before sending.

## 2026-11-25 08:44 comments
- COMMENT BAIT (Xavier 2026-11-25 08:44, from Tag Swap's comments: "cheeky boy" because he laughed in the last frame
  while his bro became a girl; people debating "what if you were trans / a boy turning into a girl"): every script must
  give people something to TALK about: a debatable rule or a "what would YOU do" choice, a character moment viewers
  have an opinion on (cheeky, unfair, wholesome, sus), a last frame that invites a reaction, an open question in the
  ending. Before approval, list the 2-3 comments the script is designed to start.

## 2026-11-25 09:17 Reference batch + quality bar
- HQ channels (study world building, textures, small details like kids shaking legs while eating): SensBlox, GreenBroRants, Gneef. LQ but learn pacing/retention/actioning: PurpleHat (shrink video).
- Next videos: HIGH quality textures + realistic lighting; every visible flaw (face edges, white rims from removed bg) is fixed, frames scrutinised hard. Plan: Three.js test for review, then Blender on his PC for the final (7 h render OK if it means one video a day). Details to come.
- Anim dissection must also CLASSIFY what each character is doing every frame (running, eating, sitting...) and the pose-to-pose of it.
- Refs on laptop: Videos\redhood_refs\story (15), \anim (14); anim channels Hawks RBX, CodysTooBig.

## 2026-11-25 10:41-10:48 Comment bait + script errors
- Xavier: my comment-bait ("is a white lie worth it?") was "trash, what AI would say". Real comments = loopholes in the rule, an exempt character at the end, lookalikes, pedants (research/comments_real_2026-11-25.md). Design bait from those. Update CLAUDE.md section 4 COMMENT BAIT accordingly.
- Xavier: script logic was inconsistent (one golden spoon per family but Dad holds it AND Grandma holds it since 1987). Read the script back for contradictions before sending.
- Xavier asked for innuendo ("people have dirty minds") bait. Declined: cast are kids. Cheeky/mischief sus is fine.
- Xavier doesn't like the lie-shrink script; spoon script needs a fix (one town spoon).

## 2026-11-25 11:02-11:44 Clap Cops script notes
- 11:02 INSINUATE, DON'T STATE: never name, show or let us hear the affair (no Mrs. Pam voice, no "that was Mrs. Pam"). One plant (her pink car at our house) + one line at the end (Mom: "Why is Mrs. Pam's car outside?"). The viewer fills the gap.
- 11:05 NO DROP-OFF AFTER THE GAGS: gags are where people swipe. One-liners (~1.5 s, 2-3 max), tension starts in the very next sentence ("Friday night, Mom went to Aunt Linda's for the weekend, but Dad stayed home").
- 11:12 EVERY ACTION NEEDS A WANT: he could not tell why the kid ran to warn Dad or knocked a lamp over. The narrator wants one thing in the crisis (undo his call) and every action is an attempt at it. Read the script back asking "why does he do this?" for every line.
- 11:44 Xavier fears scripts we can't animate well. Before sending a script, check every beat against R6 + our engine: no fingers (no finger wiggles; snaps only wide, sold by the sound), no on-screen stair climbs (cut on action), max one new set, few contact actions (no couch pushing), every new model and cast member named up front.

## 2026-11-25 11:55 Jazz hands, build the sets, animatable scripts (supersedes "max one new set" from 11:44)
- "learn how to pose ffs and animate or ask for an example": never call an R6 gesture impossible. Pose it (jazz hands = arms up / out + shimmer; snap = forearm flick + real snap SFX) or ask Xavier for a pose example.
- "make sets we dont have then dont be a pussy": BUILD missing sets; never swap a location to dodge a build. (He allowed wedding -> birthday party this once.)
- "next time dont make scripts that would be hard to animate": the animatable check runs BEFORE he sees a script.
- Clap Cops v5: jazz hands at the birthday, chair under the knob, football stays and the stadium gets built.

## 2026-11-25 12:03-12:29 Clap Cops build
- 12:03 "apply EVERYTHING ... EXTREME scrutiny on EACH frame, not only the general frame but also the content": no clipping, no car driving backwards, no eyes looking the wrong way, every frame checked before the review video.
- 12:16 Ending idea: Mrs. Pam sneaking out / hiding (Claude chose: she tiptoes to her pink car and freezes in the siren light; never named on screen). He went to sleep: "surprise me". Pauses in his take too long: tighten.
- 12:25/12:27 Pauses at scene turns (snaps->Friday, cops->Clapping, robe->Officer) must stay longer than the rest (~0.44 s); never cut every pause to the same length.
- 2026-11-25 15:15: "stop rendering the full review video and check all the frames first". NEVER render a video to find
  mistakes: stills at start / mid / end of EVERY shot (tools/stills_at.mjs, one run at a time) until all pass, then the pose
  sheet, then ONE lq review video that goes straight to him. Two full renders were wasted breaking this on Clap Cops.
- 2026-11-25 13:30: his climb-stairs pose (POSE_LESSONS 11): stair climbs can be shown on screen with it.
- 2026-11-25 13:36: Dad can be in boxers if there's no robe (a robe was found: dad_robe).
- 2026-11-25 16:34: "NEVER let anything clip. We do not want clipping." Old repo fix (explainer-kit REVIEW_NOTES PROPS +
  CONTACT, qa.mjs) = check EVERY frame, not picked stills, and fix by STAGING: give bodies clearance, move furniture back,
  re-route walks, re-angle. Now automated: `node tools/clipscan.mjs <scene> 24` must print CLIPSCAN PASS before any video
  (WORLD = body in the set, CAST = people through each other, PROP = prop in the set, GRIP = held prop > 7 cm from the palm).
  R6 is 1.36 m wide with arms: doorways / landings / bedside strips narrower than that need the set moved or the arms tucked
  (rig space: armL sits at -x, armR at +x). engine/act.js floor clamp: no foot / knee ever goes below the floor.
- 2026-11-25 23:04-23:49 (Clap Cops final notes): door glazing bars baked into the FRAME mesh stayed put while the leaf
  opened (hingeDoor now splits bar triangles off the frame); every car drove backwards (check every vehicle's nose vs its
  travel direction in a still); the phone was buried in the fist (props must stick out past the hand block, sized to read);
  Mrs Pam floated 45 cm (side yard lower than the street datum: actors get their own raycast ground, never an extra-hook y
  offset); Pam's sneak = the ref walk youtube.com/shorts/1Ebe8EHIHE4 (big stride, hip twist, side tilt, bob, lean) with
  hands together at the chest, SCARED face (a sneaking adult caught is never smiling); she walks TOWARD the camera.
- Fixes re-render only the affected frames (frames are kept as JPGs; delete the touched ranges, render.mjs fills them).
- 2026-11-26 02:19 "notice all the iterations of the first script?": Clap Cops went v0 (kid errand, rejected) -> v1 kids/dads -> v2
  clapping -> v3 insinuate -> v4 no drop-off -> v5 want + animatable. Every revision was a check I could have run myself.
  Now a pre-flight list in docs/RULES_CHECK_TEMPLATE.md that every script passes BEFORE he sees it.
- 2026-11-26 03:32 Retention rewrite of Gender Swap rejected: "you're just shortening words". Retention is NOT fewer words.
  Keep "In this town", keep full clear sentences and cause -> effect (practiced FALLING is the plant that pays off), no
  telegraph fragments ("Me? Kayla. Three summers."). Fix leaks by making every line a picture that raises or answers a
  question, not by cutting the logic.
- 2026-11-26 03:40 "none of them are sus enough to incite drama and imagination and let the comments insinuate". What made
  Clap Cops work: the RULE ITSELF is a double meaning (clapping), the kid narrator takes it literally, adults decode it.
  Sus scripts need: (1) a double-meaning engine in the rule, (2) 3+ pausable clues viewers assemble themselves, (3) the
  secret never shown in full (cut off, blurred, interrupted), (4) a last frame that opens a NEW question, (5) running lore
  (Mrs. Pam's pink car, the mailman) so comments connect videos. Sus stays between adults; kids only narrate innocently.

## 2026-11-27 21:45 Brain, not Obsidian
- Token savings come from STRUCTURE (index + task packs), not from the app. GitHub stays; Obsidian = viewer only.
- "Promise it won't make results choppier": the QUALITY GUARD in docs/BRAIN.md is binding. Never skip a pack file to save tokens.
## 2026-11-27 00:59 Lucky Me shot list approved whole
- All 38 shots approved, including the Jaden clue design and the bolt-hits-the-car ending. The mailman-on-skates cameo got
  "I love you": LORE CAMEOS land. Every video gets at least one recurring-cast callback (mailman on skates, Mrs. Pam's pink
  car, ...) as a gag or a background detail, never explained.

## 2026-11-27 02:46 Lucky Me pose sheet approved
- All 37 poses approved ("very decent"). Go ahead: fix every open item (Jaden's escalating outfit clues, charred neighbor,
  landlord knock shot, slip framing, full-quality light checks), then the lq review video.

## 2026-11-27 17:28 Lucky Me rev2 notes (Xavier) -- NOT yet fixed, budget out; do these first next chat
- HOOK = MID-ACTION in the first 2 s (Police video held people because the cop kicked the door open at frame 1). Vase must hit his head AND SHATTER, with a real glass-break SFX. First 5 s = action leading into action.
- "The richer you get": SHOW richer at once: cash poof + money SFX, obvious.
- Mailman: reads as frozen -> frozen -> in a bush. Skates NOT visible on his feet. Must be obvious he was skating and crashed into the hedge (visible skating, visible fall).
- SFX are NOT optional on this video: every action gets its real sound.
- "Richest man in town": must SELL rich (gold, gold car, money), not just a pool. "50 million" = money poof (he likes the money FX) + SFX.
- Banana peel: hidden in/near the house, not readable. Camera must clearly catch Jaden slipping on it. The shot after it makes no sense to him.
- "He's always right next to me": the object hitting his head + money must be clear what and why.
- Vending machine: 4 sodas fall out, machine shakes, the 5th SHOOTS out and hits Jaden's head (cause before effect).
- Lottery ticket looks bad (blue/brown): get a high-grade, colourful ticket design.
- "Friday 4:59": unexplained grey circle on a brown thing (the clock prop). Flagged twice. Claude wrongly blamed the lotto roll; it is THIS shot.
- Lightning ("need some money, bro"): he likes the beat, but the cut comes before the strike lands. Must be obvious what got struck (car burns/explodes or Jaden hit), THEN cut.
- RULE (general): every action must read on screen; a cause is shown before its effect.

## 2026-11-27 18:19 Lucky Me rev3 notes (Xavier)
- Mailman skates looked wrong/unnatural: use the skates exactly as in the previous video (they were good). LOOK at the frame before sending.
- Rainbow beat: Jaden's bad luck must be SHOWN: as the rainbow comes out, lightning strikes JADEN (in frame). Birds chirp when the rain stops / rainbow.
- Friday 4:59 clock: works, but should look better.
- Banana walk: peel, Jaden, the boy all look like they FLOAT above the ground; the mailman skating also floats. Contacts must read (shadows, feet on ground).
- Mansion balcony: nobody can tell who that is. Make it obvious (same charred neighbour, now rich).
- Sprinkler: water reads as "circles". Make real-looking water; Jaden visibly WET. Beat: he falls, water pours on him, camera on his face as he puts a hand over his face ("bro"), he stands, THEN the money. Intentional.
- Final notice letter should look realistic/better.
- "I needed one bad thing": pan across his back is good; the front shot had a rectangle covering half the screen. Do: pan across his back, cut to a sharp pan across his FRONT, him seated in a thinking pose (back arched, elbows down, hands together, chin on hands).
- Vending: Jaden disappears for a frame when the can hits.
- Lottery ticket store shot: camera clips into the wall on the right, then something cuts in from the left: glitchy.
- SFX: DON'T overdo it. Too many pops/boings ("poke poke poke"). Only the basic real ones; tell Xavier where to add more and he'll find them. He liked the "bruh".
- NEW: SUBSCRIBE PROMPT at the end of every video: the video's lore character (here Jaden) in a SELFIE POV (camera = his phone, arm up toward the lens, phone not seen), short text "Subscribe for more".

## 2026-11-27 19:02 Lucky Me rev4 notes (Xavier)
- HATES the payout "drum hit" sound (Casino jackpot alarm, mk_1991): removed. Wants a "ka-ching"/catching sound instead (he can add it). Each lightning hit on the neighbour = boom + ka-ching.
- Mailman STILL floats above the road; banana-walk Jaden + boy still float. (Checked: the road / path surfaces are not at y=0. Ground every actor on the real surface under them, by raycast.)
- The thinker pose was terrible (hand behind his back) and the lighting looked bad. Use his pose code ("sit") as given. ALWAYS check a pose from the shot's camera before sending.
- Thunder on Jaden at the rainbow: keep, but remove its sound (he adds it).
- "SUBSCRIBE FOR MORE" was cut off at the sides: CHECK TEXT FRAMES BEFORE RENDERING. Fit inside the safe area.
- Subscribe selfie: use his "sub" pose + his camera angle (high, front, slightly to Jaden's right, close). Use ANGLES: a pose that looks wrong from the front can look right from the shot's angle.

## 2026-11-27 19:16 (Xavier, angry, rightly)
- NEVER start the final render before he has OK'd the review video. No speculative finals. (Rule already existed; broken twice today.)
- The pool vanished under grass after the town lift: every global change gets a full stills sweep of EVERY location before sending.
- Word captions: he hates them. No burnt word captions on this video. Keep only the subscribe text.
- Subscribe shot must match HIS screenshot (camera high, in front, off his right shoulder; both hands visible), Jaden NOT clipping into the car, fire must look like real flames (not glowing balls).

## 2026-11-27 19:30 Lucky Me rev6 notes (Xavier): "now it looks okay"
- Remove the "SUBSCRIBE FOR MORE" caption; our caption style is bad; he'll send a friend's reference for a NEW caption style.
- EMOTIONS: always the right emotion for the moment (the boy smiled while worrying about overdue rent). Rule added to CLAUDE.md sec 10.
- Selfie: the object in Jaden's free hand (his Friday arm cast) read as a mystery thing: removed for the selfie; free hand does a loose yo/sup wave.
- He recorded Jaden's line "subscribe for more you guys" (topics/lucky_me/voice/jaden_subscribe.mp3): Jaden says it on the outro, lip-synced.

## 2026-11-27 19:56 Lucky Me rev7 notes (Xavier): "I like everything"
- Jaden + boy vanished at the end of the rain scene: keys that move an actor to the next location fired a few hundredths
  BEFORE the cut. Fixed all 5; new gate tools/popcheck.mjs <scene> <dur> (every frame, must print nothing).
- He wants the FULL finished video (no CapCut): his SFX (kaching for riches, small ching per Jaden counter tick, man scream
  for the mailman, Indian scream restarting on each neighbour bolt, mario coin on every bolt, the Sunset Tag heh-heh laugh on
  "owns a mansion", bruh on the jet crash, oof when Jaden falls / ball / soda, Roblox hmm while thinking, huh when the rain
  stops, kaching on "money"), VINE BOOM on Jaden's first 3 bad things (file not on disk: asked him to resend), and two
  background tracks (one switching to another mid-video: he will send them).
- CAPTION STYLE v2 (friend's reference): one word at a time, white bold, dark outline, small, centred a bit below mid.
  tools/captions_v2.py. Optional 2D counter pill at the top (Jaden's bad-luck counter: shows only while he's on screen,
  pops + small ching on every bad thing).
- LOOK: wants a bright SUNNY day, energetic colour, not grey/depressing. Lucky Me grade: exposure 1.36, saturation 1.34,
  low shadow tint, sun 4.0, fill 1.25. (post.js now reads every grade value live.)
- THE SUBSCRIBE PROMPT IS NOW THE DEFAULT: the selfie pose (P.selfie / selfieWave, his pose code) + the camera just past
  the raised phone hand, looking down; the video's lore character does it in front of a backdrop from that video, saying
  his recorded line. Reuse every video.

## 2026-11-27 20:10 rev8 notes (Xavier)
- Removed the AC-smash sounds under "never been unlucky". Small ching was being cut off (now plays its full length).
- Counter was BORING: rebuilt as an eye-catching game-UI badge (red pill, yellow rim, drop shadow, gold coin number):
  slides in, wobbles + flashes on every hit, number drops in with overshoot, "+1" floats off. Shows ONLY while Jaden is the
  point of the shot (removed from the jackpot, which is the boy's moment; counter now 6 ticks).
- Neighbour scream: once, on the first bolt only, quieter. Hmm only when we see his face (24.86).
- Rainbow: thunder sound back on the bolt hitting Jaden; dark smoke plumes off him (big enough to read in the wide).

## 2026-11-27 20:24 (Lucky Me rev10 notes)
- Friday beat: "Friday" = landlord marching to the door, "4:59" = clock zoom, "the landlord" = mom + son shocked, then the knock. Every word of a time / place line gets its own matching picture.
- Brightness okay now; final render gets our full realistic lighting + cinematic look.
- Captions still too small: bigger (140) and bouncier pop (45% -> 126% -> 92% -> 100% + rise).
- Subscribe outro: clean YouTube-style card at the bottom (above the Shorts UI zone, never behind captions), Subscribe button gets tapped and flips to Subscribed. Default for every video.

- 2026-11-27 22:38: final would not play (15 Mbps, no faststart). Finals ship at 8-10 Mbps, -movflags +faststart, level 4.1.
- 2026-11-28 02:14: assets/roblox (incl. the boy's hoodie) was gitignored, so Fable needed the cookie again. GitHub = full backup; commit every asset the same turn.
- 2026-11-28 02:39 (New Body): comic split = two SEPARATE camera shots stacked vertically, slanted gutter (his sketch: low-left to high-right), her top-right looking left, him bottom-left looking right, masked (never in each other's frame), JJK-style energy (colour wash + streaks on the empty side). Effects slightly REALISTIC (real smoke, not sprite balls / tiny particle dots).
- 2026-11-28 04:44: comic split ONCE only (the special trigger moment); the everyday 'ask Dana the time' is a regular shot. Ending: his selfie pose -> air kiss -> his myPose (phone swing reveals the crier).
- 2026-11-28 05:12: prints / logos on clothes = painted INTO the shirt texture (front face via UVs), never a floating plane. Check it standing, front + 3/4, isolated (opts.only), before showing him.

## 2026-11-28 06:24 (New Body rev1: full shot replan, Fable pass)
- THE MUTE TEST: every shot must tell the story and stay engaging with the audio OFF. Replan any shot that fails it.
- Shots were "ass": hard to follow, similar faces, camera not focused on the subject. Camera must be ON the subject; distinct characters per scene.
- BANNED: the huge wide-open oval mouth on the boy (the 'shocked/scared' A-cell). He hates it. Yelling = angry/furious gritted cells.
- SWAPS MUST BE VISIBLE: when two people swap, SHOW the trade (the two appearances trade places in the poof, like red shirt <-> blue shirt). Every swap beat: bus pair, birthday pair, choir chain, background pairs.
- Bedroom: audience must SEE the kiss (profile, contact, animated lean), not "grandma kissing the bed".
- Birthday: the CAKE must be visible; show the swap happen.
- Twins: teacher yells at twin A (focus), poof on the twins, the OTHER one laughs soft-focus, teacher facepalm/slump.
- 2D ELEMENTS ARE WELCOME: thought bubble with a slot-machine word roulette + "?", bouncing red X stamps with the scene freezing + draining to grayscale behind them, "TIME?" speech bubbles, music notes. Keep them lively.
- Models: compare EVERY modeled prop to a real reference photo before use. The pancake stack looked like jelly: pancakes = proper 3D circles, layered, top one half-off / drooping, syrup + butter.
- Mr. Bacon: give him business even without a voice line (walk up, point at bare wrist, head tilt + "TIME?" bubble).
- POV: research-based recipe in research/pov_shots.md (orient first, eye level, tilt down own body, LARGE hands near a wide lens, breath bob).
- Ending: her pose = his myPose for the subscribe line; the crier VISIBLE in the background spot he marked (screen right), cycling kneeling-cry (hands to face) -> lying toddler-tantrum flail (his two pose codes).
- His shot ideas = inspiration for engagement level, not a literal checklist; do not stretch past the audio.

## 2026-11-28 08:26 + 08:37 (New Body, the swap definition)
- THE SWAP VISUAL (global): boy A keeps his fit and position; his hair/face/body become girl B's, and vice versa. Same for same-gender pairs. People must clearly SEE a swap happened.
- MAINS TWIST (New Body): at the WTF swap Trig and Dana trade hair + body but KEEP their own faces (stronger tell). The faces swap later, at/after the subscribe part, completing the transformation.
- The 3D hoodie has no female form: post-swap Trig's position wears a 2D red hoodie (classic shirt 10540221408). Ditch the 3D hoodie after the main swap.
- The narrator's name is Trig.

## 2026-11-28 10:31 / 10:47 / 10:50 (New Body rev2 notes)
- Bus: camera must SEE the kids and the swap, never the gap between them; pull the camera back as far as needed (no clipping). A bus has more than two people: fill it.
- Choir: 2D swap counter 1 -> 12 popping with each swap (booms rising in tone: SFX pass after the full render).
- "No chores" showed a blank screen (camera outside the kitchen wall): never.
- HATED: the boy's box/screaming mouth (alti 103371234480503). Angry = clenched-teeth bar now.
- Hair colour stays with the person: the new girl (his spot) has HIS black, the new boy (her spot) has HER brown.
- Subscribe ending: follow his myPose + screenshot EXACTLY: she is HOLDING the phone (arm runs down screen-left), never a hand in front of the lens. Use Dana's complete original model for the selfie and Trig's complete original model as the crier, out in the corridor (not pressed into lockers), animated sobbing.
- 2D animations can carry a video; camera work is what people see. Bus stills get approved before the full render; SFX after the full render.
- 10:47: the world (OSM town, furnished houses, classroom v1) still exists; the school sets for New Body sat OUTSIDE the town so windows showed bare lawn. Rule: school sets go inside the town so every window sees it.
