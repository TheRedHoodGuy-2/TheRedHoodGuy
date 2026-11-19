# Animation + posing rules from explainer-kit/CLAUDE.md (copied verbatim 2026-11-19)

- STUDENTS + CAMERA (Xavier 2026-11-12): classmates are RANDOM students from `kit/students.js` (`castStudents(CAST, n, { seed })`): all wear the same school uniform (white polo, navy pants), only the two mains wear their own clothes; skin / hair / face style vary per seed, faces drawn at .8 scale (full size read huge). Cameras: long lens from 3-5 m, high over the heads (y 2.4-2.8 in the classroom), fov 28-42, so bodies sit IN the frame; the camera is NEVER still (topic adds a slow push / pull to any static shot). Poses: build limbs with `kit/r6pose.js` (reach from the shoulder vs forearm-from-the-elbow), every action is an arc: pre-action, action, reaction, post-action; no default hands-up / jump reactions.

## THINK BEFORE EVERY DECISION (Xavier 2026-11-13, the most important rule in this file)
Before you key a pose, pick an expression, place a prop or a camera: STOP and think it through like a real person / a
real director. How does a person actually stand up, turn around, react to this? What do they FEEL at this exact moment?
Which way does this prop face? Can the viewer tell what is happening in this shot and which place we are in? Then CHECK
the frames yourself (`tools/stills.mjs`): any clipping, wrong-way prop, wrong emotion or unreadable beat is yours to find
and fix before Xavier sees it. Never animate straight away. Read REVIEW_NOTES.md every time: every note there was a
mistake he had to point out, and repeating one wastes his time and tokens.


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

