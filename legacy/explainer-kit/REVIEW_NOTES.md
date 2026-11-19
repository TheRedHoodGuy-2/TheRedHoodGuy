# REVIEW NOTES: every problem Xavier has flagged in a review pass

Rule (Xavier 2026-11-12): "the problems I bring up should be noted so I don't have to see them over and over again."
Read this BEFORE building any topic and check every point in stills BEFORE sending a review. Every new note he gives in a
review gets added here the same turn (date + one line), and is committed + pushed with the fix.
Older binding rules also live in CLAUDE.md (LOOK + MATERIALS, DYNAMIC POSING, ACTION THEN REACTION, RAISED ARMS).

## POSING (R6)
- 2026-11-12 R6 has no elbows / knees. Arm from the SHOULDER when the whole arm acts (reach, arm up, grip the desk); slide
  the block down so the shoulder BECOMES THE ELBOW when the forearm acts (writing, clapping, scratching head, chin on hand,
  crossed arms). Use `kit/r6pose.js` `limbTo()` (reach mode vs forearm mode). Arms never clip deep into the torso.
- 2026-11-12 Raised hands: elbows placed like his modelled ref, never stiff arms pointed straight out / clipping into him.
- 2026-11-12 Writing = hands ON the paper on the desk top, pencil hand moving. Never hands beside the desk.
- 2026-11-12 SITTING (his technique): either the base of the torso is the butt and the top of the leg reads as the knee
  (legs near-vertical, slid forward ~.31 m: `o: [.03, .06, .31]`), or the legs go horizontal (rx -1.568) and the hip
  region of the leg is the butt (root y +.24). His two pose codes are in topics/hypnic/topic.js `seatLegs()`.
- 2026-11-12 No default reactions: no "both hands up + shocked face held", no jumping. A shock is springy for a beat, then
  the body moves on (looks around, scratches head, grips the desk). Every action = pre-action, action, reaction, post-action.
- 2026-11-12 Adults react like adults: the teacher DODGES the spill, then glares at the culprit. He does not jump.
- 2026-11-12 Look at EVERY pose yourself in the sheet before sending. Hands must be where the action is.

- 2026-11-14 HAND PROPS ARE BIG ENOUGH: "you like making them tiny". Size every hand prop to the R6 HAND (the whole
  hand block), not to real-world cm: a controller fills both hands, a watch face reads clearly on the wrist, a tally
  counter fills the palm. Check the size in a close still next to the hand before using it.
- 2026-11-14 PROPER MODELS, ALWAYS RESEARCHED: before modelling ANY prop, research how the real one looks (shape, parts,
  buttons, proportions), save it in research/, then model those parts. No primitive-box stand-ins ("bullshit").

- 2026-11-15 THE TEXTBOOK (brain freeze): "the book is wrong, just wrong, how is that a book, placed wrong, clips into itself".
  A prop must look like the real thing from EVERY angle the camera sees it: real proportions, parts that join (covers hinge at
  the spine, pages between the covers), nothing passing through itself, placed the way a person would really set it down.
- 2026-11-15 THE SLUSHIE ANIMATION "off so much": when a character drinks, the straw tip is AT his lips for the whole sip,
  the straw never passes through his face / eyes, and the cup is where his hands are. Check it frame by frame.
- 2026-11-15 Don't send the review video unchecked: extract ALL frames and go through every one (CLAUDE.md step 5a).

## FACES + NPCs
- 2026-11-12 NPC faces must sit like the mains' faces (same size / place, or literally the mains' face set):
  `castStudents(..., { mainFaces: true })`, faces at .8 scale. No faces that are huge, misplaced or "melting" off the head.
- 2026-11-12 Classmates = random students (kit/students.js), all in the school uniform. Only the red-hood guy and the girl
  wear their own clothes.

## PROPS + CONTACT (things interact like IRL)
- 2026-11-12 Props are sized for R6 bodies (desk / chair / stool scaled so knees and thighs never pass through them).
- 2026-11-12 When a character stands / slams / lunges, the chair or stool moves back first to make room. Bodies never clip
  through a desk, dashboard or console.
- 2026-11-12 No hands on an object unless the story puts them there (a hand hovering on the mug read as "why are there
  hands on it").
- 2026-11-12 Cause then effect: the mug falls only AFTER he hits the table: hop, land near the edge, wobble on the rim,
  tip, fall, hit the floor, roll, puddle. Props that look cheap (the first mug) get remodelled properly.

## CAMERA
- 2026-11-12 Not too zoomed: leave room around the subject (long lens from 3-5 m, fov 28-42). "Whatever is in the camera
  is BIG" = too tight.
- 2026-11-12 The camera is NEVER still: any static shot slowly pushes in / pulls out / drifts.
- 2026-11-12 Every cut has a POINT (muscles draining, the button slam, the foot under the desk); that point is the main
  subject of the frame, not someone clipping in at the side.
- 2026-11-12 Inserts on screens / panels: the WHOLE screen in frame, straight on. Hide any character who isn't in the
  shot's point (his hair was clipping in front of the lens): hidden, not just out of focus.
- 2026-11-12 Impacts (button slam) can use another angle instead of one that clips: button POV, hand POV, his POV, or the
  original angle with the chair pushed back.
- 2026-11-12 Watch the opening: the first 2 s must move (boredom hook). No stray head in a corner of a wide.

## SOUND
- 2026-11-12 A sound plays on the frame the thing really happens: the splash when the mug TOUCHES THE FLOOR (trimmed
  `coffee_splash_hit` so the sound starts on the impact), the thud on the jolt, the slam on the button contact.

## OLDER NOTES (from the 2026-10-23 .. 11-11 sessions, still binding; the big rules also sit in CLAUDE.md / STYLE.md)
- 2026-10-23 Camera "toooo close to him": frame wider. Never only his back: show faces.
- 2026-10-23 Props at real size in the right hand (the phone was WAY too small, in the wrong hand). Screens readable.
- 2026-10-23 Standing up is a move, not a snap: lean, push off, rise, settle. No snapping to a pose and bouncing.
- 2026-10-23 POV = the camera rides his head, looks at his own hands (left, then right), slow eased looks, not rushed.
- 2026-10-23 A little AO is fine, never speckle noise; finals have clean edges, no blur, no noise.
- 2026-10-24 No science-show explainers (blue glow / x-ray): someone ACTS inside the brain (see STYLE.md TICKLE RECIPE).
- 2026-11-14 The "You see" line stays FUNNY + LIGHT, never nerdy: no blood vessels / nerves / jargon ("too scientific = people drop",
  like the x-ray video that died). One simple, kind-of-true idea a kid would say ("your brain panics and sets off every alarm"),
  acted out as a gag in Brain HQ. Story shape: setup + the thing happens, cut to the You-see gag, cut back for the funny payoff.
- 2026-10-24 Treat it as a comedy movie: cut to reaction faces (pain, shock, the girl staring), camera changes every 1-2 s,
  let the joke land in a silent pause.
- 2026-10-28 Props built for R6 and attached properly (the backpack floated off his back). They interact like IRL.
- 2026-10-28 No empty horizon: build the town around the set (surround()).
- 2026-10-28 Materials: think what the surface IS, research the typical look first (CLAUDE.md LOOK + MATERIALS).
- 2026-10-28 No vignette. No cloth folds. No impact freezes.
- 2026-10-28 Jump / lever pull / squeeze animations read weak: full anticipation, push, airtime, landing that sinks.
- 2026-10-29 Faces fit the CONTEXT: nobody smiles at a kid growling in a silent test. Ask yourself what each person feels.
- 2026-11-10 Drawers / fridges: REACH, hand stops on the handle, THEN pull. Nothing flies out by itself.
- 2026-11-10 Text on paper / signs never touches the edges (measureText).
- 2026-11-10 Never synthesize sounds; real bank only. Keep his natural voice pauses, only shorten the ones he names.

## POSTING (title + hashtags)
- 2026-11-12 Title: short, simple, a "Why ..." question straight to the point. His top videos: "Why can't you tickle
  yourself?", "Why your yawns are contagious", "Why you forget why you walked into a room".
- Hashtags, always this set: #shorts #roblox #animation #didyouknow #funfacts

## HOOK + SCRIPT VOICE (2026-11-14, replaces the 2026-11-12 question-hook and second-person rules)
- His two viral videos both opened with HIM, IN CLASS, ON HIS CHAIR, already doing something, and the narration starting
  "He ..." mid-action: tickle ("He got bored in class, so he tried to tickle himself...", 18K) and hypnic ("He was just
  dozing off in class when his whole body jolted...", 8.6K). People stay to find out what happened to him.
- So EVERY video: frame 1 = the main guy at his desk in class, mid-action; line 1 = "He ..." in THIRD PERSON, past tense,
  already happening. No spoken title question at the start (the "Why ..." question lives in the post title).
- The "You see," explanation line may still talk to the viewer ("when you're bored, your brain..."); the story is "he".
- Frame 1 still = close, mid-action, something moving, never a still or empty shot.

## STAGING + PROPS (comeback plan review)
- 2026-11-12 One clear thing per shot. Don't pile side gags (kid holding his head, phone pic flash, crumb falling out)
  on top of the main action: the viewer can't track them and they don't make sense. Every gag must make sense.
- 2026-11-12 Look at the frames: if a frame doesn't make sense, don't use it, change it. Xavier won't point it out.
- 2026-11-12 Crowd reaction SFX follow the story: the "OOOH" is the reaction to the roast line, not to people leaning in.
- 2026-11-12 Props/models must look like the REAL thing (research how it looks first), not basic shapes. Gag items = a
  fake-brand version of a real product ("Jadans" sneakers), modelled like the real product, no real logos.

## comeback review 1 (2026-11-13): Xavier was furious. EVERY one of these was visible in the frames and I missed it.
- LOOK AT THE SCREENS. Every still, every frame: is anything clipping? If something clips, ask WHY (here: the bench was
  rotated 180 deg, so he sat facing the backrest). Never send a review with a clip you didn't explain and fix.
- Props face the right way: a bench / chair backrest is BEHIND the sitter. Check orientation of every prop in stills.
- EMOTIONS must fit the moment. For every key ask: what does this person feel RIGHT NOW, given what just happened?
  "nothing came out" = embarrassed, not surprised. Buffering = blank / frozen, NEVER smiling. Being roasted = embarrassed.
- HOW WOULD A REAL PERSON DO IT. Standing up: lean forward, push off, rise, step. Turning around: step-turn over a beat,
  feet moving, never an instant 180. Each action gets enough screen time to READ (point / buffer / walk crammed into ~2 s
  was unreadable): if the voice is fast, simplify the staging (move the other character so no turn is needed).
- ACTION -> REACTION chains must be SHOWN: alarm goes off -> the sleeping WORDS worker wakes up -> looks at the alarm ->
  reaches up to the shutter handle -> pulls it down (the shutter follows his hand). Nothing happens "by itself".
- Scene changes must be readable: going into the head = camera dives into his head; coming out = back to him. A Brain HQ
  beat that just "appears" mid-shower is confusing.
- Shower = shirtless and trouserless (bare torso, shorts / boxers), never the hoodie + jeans. No body clipping through the
  curtain.
- No fake lip sync / face glitching. If a line isn't his dialogue on screen, hold a clear expression (open scream mouth).
- His shower direction (use it): in the shower thinking, one hand on the wall, looking down, shaking his head in
  disappointment, then hand on his face. Dive in: WORDS dept wakes up, shutter goes up, the comeback is handed over. Back
  out: PRE hand comes off his face (he just thought of it), ACTION screams at the wall, REACTION both hands over his mouth.

## comeback review 2 (2026-11-13)
- "Everyone does 360s": kit/actor.js lerped facing angles raw (pi -> -2.8 spun ~330 deg). FIXED in the actor (short way
  round). Also: real turns take a beat (.6-.9 s) with stepping feet; never snap a body round. `node tools/qa.mjs <topic>`
  flags every SPIN frame by frame: run it before every review, zero spins allowed.
- Stills at hand-picked times miss what happens BETWEEN them. Before every review: 4 fps contact sheets of the WHOLE
  review video, every frame looked at (clipping, spins, wrong-way props, unreadable cuts).
- Shoes in grass: clear grass blades where feet stand in close-ups (topic mows the lawn round the action).
- "Opened your mouth" means the MOUTH OPENS (confident), then nothing -> bruh -> confidence drains to embarrassed.
- Stand-up must read: lean over the knees, hips lift while the legs swing under, then straighten. No pop.
- Brain workers are ALL HIM (same face + hair), each in a different outfit for his job (operator: navy ME polo; WORDS
  clerk: cardigan, shirt + tie). Never a random classmate inside his brain.
- Small cramped sets = clipping. Build a CUSTOM set with real room (the WORDS DEPARTMENT office + corridor, the walk-in
  shower) instead of squeezing action into a tiny booth / tub. Give characters clearance from walls, counters, shutters.
- Dives into the head go in through the FACE / visible head, never the back of the head out of nowhere.

## 2026-11-15 YouTube stats (Studio tips)
- Winners (tickle, hypnic) = 68-70% stayed + ~100%+ APV; losers 43-48% stayed. Frame 0 must MOVE (no dead first second: boredom.py HOOK must pass) and show the topic as on-screen text. Keep 22-26 s. Last shot must match the first so it loops.
- Xavier 2026-11-15: from the NEXT video on, a solid title on frame 0 + action from frame 0 (not applied to brain freeze).
