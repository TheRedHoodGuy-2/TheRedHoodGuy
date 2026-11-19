# ANIMATION STANDARD (draft for Xavier's sign-off, 2026-11-19). From research/animation.md, research/lipsync.md,
# docs/POSE_LESSONS.md. Proof: docs/sheets/pose_proof.jpg (posing), out/lipsync_test.mp4 (lip sync + blinks),
# docs/sheets/faces/eye_rig_05.jpg (pupils and brows as layers).

## 1. Think before every beat
What does the character want, what do they feel, what thought starts the move. The EYES lead, then the head, then the
body (only an outside force moves the body first). Every action = anticipation -> action -> reaction.

## 2. Every key pose must pass (check the still AND its silhouette)
- Silhouette reads as a black shape: limbs off the body, never a blob. Don't point a limb straight at the camera.
- One line of action (C or S) through the whole body, pushed further than feels natural.
- A visible power centre (chest = proud, head = curious / angry lunge, hips = lazy).
- Weight on one leg, hips and shoulders tilted opposite ways (contrapposto); breakdowns may be off balance.
- No twinning: arms and legs never mirror each other. The head turns / tilts with the body, never dead straight.
- Raised arms slide out of the shoulder (o up .15-.3) so they read stretched, never floating detached.
- R6 has no elbows / knees: the whole-limb angle IS the gesture.

## 3. Motion
- Eases on everything ('back' default, 'snap' only for impacts, linear only for machines). Staggered overlap:
  hips -> torso -> head -> arms -> hair, 2-4 frames apart at 30 fps. Heads and hands travel on arcs.
- Timing carries weight and mood: heavy / sad = slower, light / happy = snappier.
- Every hold is a moving hold: drift toward the next pose + breathing + eye darts + the head supporting the body.

## 4. Faces
- Each character keeps their face family (library/characters.json faceSet); the expression changes on the THOUGHT,
  brows first, eyes with them, mouth last.
- Lip sync = from the audio only (Rhubarb + transcript): 1-frame lead, 2-frame minimum, M B P always closed 2+ frames,
  rest mouth in pauses, expression kept while talking. Never a random talk cycle.
- Blinks on each new line / look / cut + every 2-5 s (close 2f, hold 1f, open 2-3f). Listeners dart their eyes.
- Pupils / brows move as layers where the face allows it (05); otherwise use the sheet's glance frames.

## 5. Contact + clipping
Hands arrive ON a thing before it moves. Seated / contact poses pass the point-in-mesh clip test (tools/clipcheck.js).

## WALK (2026-11-19, engine/walk.js, research/walk.md)
- Footprint-solved compass gait: one foot planted per step, hip between footprint midpoints, planted leg angle from the
  hip, hip height keeps the planted corner on the floor (heel strike, toe off). Swing leg slides up into the hip for
  clearance (reads as a knee lift). Down = planted leg gives ~3 cm after contact. Start and stop are eased half steps.
- Arms opposite the legs, 2 frames late, back swing a touch bigger. Small torso twist, weight shift + tilt over the
  planted foot, forward lean (legs counter it so they stay true), head steadies.
- footLock(): after posing, the real planted leg mesh is measured and the root nudged so the foot never drifts or
  sinks. Gate (scenes/walk_test.js opts.check): planted drift 0 mm, planted off floor 0 mm, swing clearance > 0.
- Default 12 frames a step at 24 fps (T .5 s), step .6 m = 1.2 m/s.
- Old explainer-kit animation + posing rules, research and code: research/legacy_explainer/ (all of it, verbatim).
