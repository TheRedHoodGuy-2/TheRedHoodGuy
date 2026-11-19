# Animation and body mechanics

## First-person POV (2026-10-23)
- The camera rides the head, so sway, stagger and falls come from the body; soft camera moves, eased looks (each look held
  long enough to read), hands uneven and in shot (look at the left hand, then the right). No fake-FPS camera shake.
- Sources: [Animation Mentor: first-person POV shots](https://www.animationmentor.com/blog/tutorial-animate-first-person-pov-shots/),
  [Camera shake is not realistic in FPS](https://w-shadow.com/blog/2008/08/17/camera-shake-is-not-realistic-in-fps/)

## Jump and land (2026-10-28)
- Plant and crouch, push off with the arms driving up, lead leg first and the back leg catches up at the top (hang a
  beat), legs reach for the ground, lead foot lands first and the body sinks low, then springs on. Legs never move the same.
- Sources: [Animation Mentor: jump and land](https://www.animationmentor.com/blog/tutorial-animate-a-jump-and-land/),
  [Body mechanics blocking: standing long jump](https://25013834.myblog.arts.ac.uk/?p=33),
  [AnimSchool blog](https://blog.animschool.edu/?p=1110)

## R6 posing (Xavier's teaching, 2026-11-10 / 11-12; implemented in kit/r6pose.js)
- One cuboid per limb, no joints. Whole-arm actions pivot at the shoulder (reach, arm up). Forearm actions slide the
  block so the shoulder becomes the elbow (clap, write, scratch head, chin on hand). No deep clipping into the torso.
- Raised arms: ~pi rotation plus an up / out slide (his "hi" and "hands up" pose codes in CLAUDE.md RAISED ARMS).
- Sitting: torso base = butt with legs near-vertical slid forward ~.31 (leg top reads as the knee), or legs horizontal
  (rx -1.568) with root up .24 (the leg's hip region is the butt). His pose codes: topics/hypnic/topic.js seatLegs().
- Acting arc for every action: pre-action, action, reaction, post-action. A jolt is springy, then the body moves on.
- Dynamic posing five points (asymmetric arms, raised arms back + out, whole body commits, head goes with it, uneven
  legs): CLAUDE.md DYNAMIC POSING.
