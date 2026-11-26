# POSE LESSONS (the posing brain). Read before building ANY pose.

How this works (Xavier 2026-11-18): when Xavier makes or fixes a pose, put Claude's version and his side by side,
write down WHAT changed and the PRINCIPLE behind it (why a real person stands / sits / reaches that way, what the
character feels), with the before/after picture. New poses are built from these principles + the emotion of the
moment, never by pasting a stored pose. Before showing a pose, check it against every lesson here.

Tool: R6 Pose Editor (studio) https://claude.ai/artifact/Wodk7AKaH6PrU4eRtEMiWR (pose_editor.html, engine/rig.js,
library engine/poses.js). Pose code drops straight into engine/poses.js.

## Lessons carried from explainer-kit (Xavier's refs, still valid)
1. Never mirror the arms: one does the big action, the other something different (flung out, draped, resting).
2. Raised arms go back as well as up and slide out of the shoulder (o up .15-.3, out ~.16) so hands clear the head.
3. Commit the whole body: lean the torso, tilt it to one side, shift the hips.
4. The head goes with it: thrown back or down AND rolled / turned to a side, never dead straight.
5. Legs uneven: different angles and offsets, one kicked out.
6. Every action is an arc: pre-action, action, reaction, post-action. A hand arrives ON the thing before it moves.
7. Expressive = the whole body commits, not one arm.

8. R6 HAS NO ELBOWS / KNEES (Xavier 2026-11-12, the research that made the old posing good; engine/r6pose.js limbTo):
   - whole-arm actions pivot at the SHOULDER (reach, arm up, grip a desk, arms out for balance, wind-up): limbTo(part,
     root, handTarget) with no elbow; the hand LANDS on the target (block slides in / out of the socket up to .16 m).
   - FOREARM actions slide the block so the SHOULDER BECOMES THE ELBOW (writing, clapping, scratching the head, chin on
     hand, hand over mouth, arms crossed, fist pump): limbTo(part, root, handTarget, elbowPoint), elbow beside the ribs
     ~.3 m under the shoulder. Slight clipping into the torso is fine, a lot is not; > ~.25 m slide reads detached.
   - Build limbs from WHERE THE HAND / FOOT GOES, not from joint angles; pass the pose's root so a lean / turn still
     lands the hand on the target.
9. Sitting: legs near-vertical slid forward (leg top reads as the knee), or legs horizontal with the root up.

10. Xavier's sitting codes (hip as butt / hip side as butt) and the extremely relaxed couch pose: research/legacy_explainer/
    ANIMATION_COMPLETE.md section D. Jolt, flinch, adult reactions, clapping, writing: section B / C there.

## New lessons
(none yet: the first pose Xavier gives in the new studio goes here with its before/after)

11. CLIMBING STAIRS (Xavier 2026-11-25 13:30, his pose code + screenshot, Clap Cops "I ran upstairs"):
    { armL: { r: [0.399, 0.43, -0.039], o: [0.051, 0, 0] }, armR: { r: [-0.247, 0.414, 0.038], o: [0, 0, 0.037] },
      legL: { r: [-0.319, -0.347, -0.075], o: [-0.009, 0.361, 0.345] }, legR: { r: [0.14, -0.321, 0.064], o: [-0.028, -0.041, -0.191] },
      root: { x: -0.033, y: 0.302, z: 0.301, rx: 0.082, ry: -2.79, rz: 0.017 } }
    WHY it works: the leg on the higher step slides UP into the hip (o.y +.36) and FORWARD (o.z +.35) so its top reads as a
    bent knee planted on the step; the back leg stays straight and slides BACK (o.z -.19), pushing off the lower step; the
    root rises by the step (y +.3) and moves forward (z +.3); the torso tips slightly into the climb (rx +.08); arms swing
    opposite the legs (up-leg side arm back, other arm forward). Stair climbs CAN be shown on screen: alternate this pose
    and its mirror per stride, root height following the treads. (ry -2.79 is only his editor's view turn.)
