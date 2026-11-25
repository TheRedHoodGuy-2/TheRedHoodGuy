// from explainer-kit topics/spider/topic.js (pose + acting parts only, 2026-11-25)
export const LOCAL_POSES = {
  evilRub:    { armL: [-.55, -.05, .83], armR: [.55, -.1, .83], legL: [.15, -1, .08], legR: [-.12, -1, -.05], head: [.18, .25, .24], root: { y: -.03, rx: .32, rz: .07 } },
  evilRub2:   { armL: [-.5, .05, .86], armR: [.6, -.15, .78], legL: [.15, -1, .08], legR: [-.12, -1, -.05], head: [-.18, .22, -.22], root: { y: -.03, rx: .34, rz: -.06 } },
  craftLean:  { armL: [.12, -.5, .86], armR: [-.14, -.5, .86], legL: [.1, -1, -.1], legR: [-.12, -1, .08], head: [.05, .55, .1], root: { rx: .36, rz: .03 } },
  craftLean2: { armL: [.05, -.42, .9], armR: [-.22, -.6, .78], legL: [.1, -1, -.1], legR: [-.12, -1, .08], head: [.2, .5, -.08], root: { rx: .38, rz: -.03 } },
  eatCandy:   { armR: [.15, .5, .86], armL: [.2, -.8, .55], head: [-.05, -.18, .06], root: { rx: -.06, rz: .02 } },   // candy up to his mouth
  eatCandy2:  { armR: [.1, .25, .96], armL: [.25, -.75, .6], head: [.08, .05, -.05], root: { rx: .03, rz: -.02 } },   // chewing, hand drops a little
  lookAway:   { armR: [-.35, .95, .15], armL: [.12, -1, .05], legL: [.15, -1, .05], legR: [-.05, -1, -.08], head: [-.25, -.08, -.08], root: { rz: -.04 } },
  holdUp:     { armR: [-.15, .55, .82], armL: [.2, -.9, .2], head: [-.12, -.12, .06], root: { rx: -.05, rz: .03 } },
  sneak:      { armR: [-.25, .05, .97], armL: [.55, .2, .8], legL: [.1, -1, .2], legR: [-.1, -1, -.15], head: [.3, .05, .05], root: { y: -.06, rx: .28 } },
  dropIn:     { armR: [-.1, -.35, .93], armL: [.6, .1, .6], head: [.05, .4, 0], root: { rx: .22 } },
  reachIn:    { armR: [.45, -.6, .62], armL: [.15, -.9, .3], head: [0, .4, .02], root: { rx: .1 } },   // hand dips into the bucket in front of him
  lookHand:   { armR: [-.05, .3, .95], armL: [.2, -.9, .25], head: [.05, .08, 0], root: { rx: -.02 } },
  frozen:     { armR: [-.05, .38, .93], armL: [.55, -.7, .4], legL: [.15, -1, .05], legR: [-.12, -1, -.04], head: [0, .05, .12], root: { rx: -.12 } },
  fallBack:   { armL: [1, .25, -.1], armR: [-1, .1, .15], legL: [.25, -.95, .3], legR: [-.15, -1, .1], head: [.25, -.1, .2], root: { y: .2, rx: -1.5, rz: .05 } },
  ghostFloat: { armL: [.25, -.8, .5], armR: [-.2, -.75, .6], legL: [.05, -1, -.35], legR: [-.08, -1, -.2], head: [.15, -.05, .3], root: { rx: .08, rz: .06 } },
  ghostFloat2:{ armL: [.3, -.7, .55], armR: [-.3, -.8, .45], legL: [.08, -1, -.25], legR: [-.04, -1, -.3], head: [-.12, -.08, -.28], root: { rx: .05, rz: -.07 } },
  laughBent:  { armR: [-.3, .1, .95], armL: [-.45, -.55, .7], legL: [.22, -1, .08], legR: [-.18, -1, .12], head: [.18, -.45, .28], root: { y: -.04, rx: .55, rz: .08 } },
  laughBent2: { armR: [-.35, .2, .92], armL: [-.5, -.6, .62], legL: [.22, -1, .08], legR: [-.18, -1, .12], head: [-.2, -.38, -.26], root: { y: -.04, rx: .48, rz: -.09 } },
};
export const POSE_SHEET = [
  ['evilRub', 'guy', 'evilRub', 'smirk', ''], ['pointAt', 'guy', 'pointAt', 'smirk', ''], ['craftLean', 'guy', 'craftLean', 'neutral', ''],
  ['evilRub2', 'guy', 'evilRub2', 'smirk', ''], ['craftLean2', 'guy', 'craftLean2', 'neutral', ''], ['holdUp', 'guy', 'holdUp', 'smirk', ''], ['sneak', 'guy', 'sneak', 'smirk', ''], ['dropIn', 'guy', 'dropIn', 'smirk', ''], ['laughBent', 'guy', 'laughBent', 'laugh', ''], ['laughBent2', 'guy', 'laughBent2', 'laugh', ''],
  ['eatCandy', 'npc', 'eatCandy', 'happy', ''], ['eatCandy2', 'npc', 'eatCandy2', 'happy', ''], ['lookAway', 'npc', 'lookAway', 'happy', ''], ['reachIn', 'npc', 'reachIn', 'happy', ''],
  ['lookHand', 'npc', 'lookHand', 'neutral', ''], ['frozen', 'npc', 'frozen', 'shocked', ''], ['fallBack', 'npc', 'fallBack', 'dizzy', ''], ['ghostFloat', 'ghost', 'ghostFloat', 'dizzy', ''], ['ghostFloat2', 'ghost', 'ghostFloat2', 'dizzy', ''],
];
// Beat 1 (0-5.6)    the hook: he rubs his hands at the craft table, the friend munches candy, "here's what you do".
// Beat 2 (5.8-19.9) the build, macro on the cutting mat: 4 pipe cleaners drop, twist, bend into 8 legs, hot glue,
// Beat 3 (20.3-27)  he tiptoes over and drops it in the candy bucket while the friend's back is turned; the friend
//                   reaches in, pulls it out, freezes, falls flat; his ghost floats up out of the robot costume.
// pose gate sheet: [label, who, pose, expression, props]
// the pose sheet wears the real costumes: guy = cultist, npc = the friend as Helperbot, ghost = the friend's ghost
  // hand point on each rig (bottom of the right arm), in the arm bone's frame, so props can ride the hand
  // POV arm: during his POV the friend is hidden (the camera is his head) and this robot arm reaches in instead
  // a few spare pipe cleaners + a bead dish on the table (set dressing)
  // ---------- camera ----------
    // where the spider is: table -> his hand (sneak) -> bucket -> friend's hand -> flung to the floor
    // the friend's hand dips into the candy: a few candies jostle