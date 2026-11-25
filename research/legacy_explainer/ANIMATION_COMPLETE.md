# Everything animation / posing / camera from explainer-kit that our docs did not have yet (sweep 2026-11-25)
Sources read: all 4 chat logs (every Xavier message, full text: xavier_messages_old_chats.md), all 418 commits, STYLE.md,
REVIEW_NOTES.md, research/, kit/actor.js + poses.js + r6pose.js, every topic's LOCAL_POSES / POSE_SHEET (code/topics/).
Items already in CLAUDE.md / docs/ANIMATION.md / docs/POSE_LESSONS.md are not repeated here.

## A. Constant motion (he asked for this TWICE: 2026-10-23 and 2026-11-25)
- 2026-10-23, first reference video: "watch how there's literally never a still moment, characters or camera ALWAYS
  moving; we lowkey want this but toned down 10%". 2026-11-25 (davystep75 TikTok ref, measured in
  research/motion_reference_2026-11-25.md): 0.5% still frames, longest still run 0.2 s.
- STYLE.md measurement of 16 reference shorts: hard cuts only every ~1.9 s, yet 88% of shots MOVE and only 10% of frames
  are still. The picture changes by TRAVELLING (push, pull, orbit, crane, fly from person to object), not by cutting.
- Every hold still has motion: slow push or drift + the character never frozen. Handheld drift on by default; steam,
  dust, flies, clouds, crowds keep moving.
- Treat every short as a comedy movie, "a whole movie with no time decay, no boring scenes".

## B. Acting (what real people do)
- JOLT / SHOCK is not "hands up + shocked face held". Real: jolt, then look around, scratch the head, be confused: one
  action moves between shoulder-pivot (the jolt) and shoulder-as-elbow (the scratch). Pre-action, action, reaction,
  post-action; nothing springs into a pose and stays there.
- FLINCH (Xavier's own description): the torso turns away toward one side, the shoulder on the other side rises, that arm
  crosses toward the same side, the near hand reaches out a little as if dodging. Never both hands up.
- ADULTS: a teacher does not jump when coffee spills. He dodges the spill and looks at whoever did it. Pick the
  reaction a real person of that age and role would have; never the default jump.
- STANDING UP: never "snap to a different pose and bounce". Lean, push off, rise, settle (and the chair moves).
- Emotion must fit the context: nobody smiles while faking a cough in a silent test. Ask "what is this person feeling
  right now?" before every face.
- Anticipation before a punchline: he senses it coming (eyes snap open, freeze, then it hits).
- Looks: look at the hands, THEN at the camera (tickle fix). POV shots: look at both hands, left then right, as the room
  goes dark; a POV is animated like a head (sway, look around), research real POV footage.
- Turns take the SHORT way round (never a 360 spin); qa spin check in the old kit.

## C. Interacting with the world (the clipping cure)
- Move the world like a real person would instead of clipping: pull the chair back before sitting at a desk, legs push
  the chair / stool back when he stands to slam a button, chairs rock back on lean-back yawns, a chair gets shoved and
  tipped when someone kicks out.
- Offer the camera a better angle instead of a clipping one (button slam: button POV, hand POV, his POV, or the same
  shot after he pushes the chair back).
- Real put-down: walk, crouch, lower, release, and he leaves when done.
- Physical comedy follows physics: a mug wobbles on the table edge, THEN falls.
- Writing a test = hands ON the desk, pencil on the paper; a pose is checked against the sentence it illustrates.
- Clapping: the shoulder drops toward where the elbow would be and the hands meet in front of the body, never arms
  stretched straight out, never clipping into the torso.
- Props are sized to the R6 hand (the phone was "WAY too small" twice) and held in the hand the story says.
- A character who leaves the frame WALKS back in (remote skit), continuity between shots.

## D. Xavier's reference pose codes not yet in POSE_LESSONS (avatar frame, {r, o} parts)
- Extremely relaxed doom-scrolling on a couch:
  { armL: { r: [-1.103, -0.115, -0.885], o: [0.002, -0.01, 0.24] }, armR: { r: [-1.514, -1.414, 0.913], o: [-0.121, 0.289, 0.112] },
    legL: { r: [-0.021, 0.567, 0.178], o: [0.057, 0.009, 0.199] }, legR: { r: [-0.185, -0.329, -0.201], o: [-0.263, 0.507, 0.337] },
    head: { r: [0.387, 0.09, -0.003], o: [0.018, -0.004, 0.004] }, root: { x: 0.256, y: -0.018, z: 0.13, rx: -0.393, ry: -0.496, rz: -0.043 } }
  (why it works: the root sinks and rolls back + turns, one leg slides far forward / up, arms at different heights.)
- Sitting, "hip as butt" (legs near-vertical, slid forward; leg top reads as the knee):
  { armL: { r: [-0.783, 0, 0.112] }, armR: { r: [-0.783, 0, -0.112] }, legL: { r: [-0.093, 0.057, 0.063], o: [0.028, 0.061, 0.309] },
    legR: { r: [-0.023, 0.092, -0.169], o: [-0.056, 0.044, 0.336] }, root: { x: 0.017, y: -0.06, z: -0.033 } }
- Sitting, "hip side as butt" (legs horizontal, root lifted):
  { armL: { r: [-0.783, 0, 0.112] }, armR: { r: [-0.783, 0, -0.112] }, legL: { r: [-1.568, 0, 0.094], o: [-0.022, -0.02, 0.044] },
    legR: { r: [-1.568, 0, -0.094], o: [-0.022, 0.018, 0.044] }, root: { x: 0.022, y: 0.237, z: -0.044 } }
- Simple hi / exaggerated hi / hands up: in research/legacy_explainer/CLAUDE_animation_rules.md (RAISED ARMS).
- Per-topic acting poses (yawnStretch, yawnLean, classTurn, tickleFeet, ribs, cultists, growl clutch, timecrawl...):
  research/legacy_explainer/code/topics/*.js.

## E. Camera notes from the old reviews
- "Not enough camera room": the camera was too close / everything too big in frame; frame from further back on a long lens.
- Each cut has ONE point (the muscles draining, the button slam); that point is the main focus of the camera, never
  the clipping on the side of the frame.
- Comedy cameras: drone pull-back on a sudden loud moment, POV of the class turning to stare, aerial exterior on the
  punchline, cut-away reaction faces constantly.
- Enter / exit special scenes by diving into the real object and pulling back out, never a hard cut to a blue void.

## F. Old-kit engine features we have not ported (decide per need)
- Run cycle from Xavier's R6 run tutorial: contact / down / pass / up keys + X-flip, cyclic (kit/actor.js `walk:true`).
- Leg IK ported from Xavier's R6IK Blender rig: planted feet, thigh + shin solve, knee forward (kit/actor.js).
- reachOut(): arms up + out with the inner sides facing out (wide-V stretch); stretch(dir, k) helper (kit/poses.js).
- `steps: 2|3` on-twos choppy action, bezier F-curve eases, face pops, actor.talk visemes (kit/actor.js).
- Turn the short way + qa spin check (tools/qa.mjs).
All of that code is in research/legacy_explainer/code/.

## G. Animations he called bad, so never reuse those versions
Jump, lever pull, squeeze worker, bouncy gas (2026-10-28: all "ASS"); the springy jolt-and-hold; both-hands-up flinch;
teacher jump; snap-and-bounce stand-up.
