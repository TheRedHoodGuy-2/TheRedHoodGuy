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
