// from explainer-kit topics/timecrawl/topic.js (pose + acting parts only, 2026-11-25)
export const LOCAL_POSES = {
  // ---------------- the guy, at his desk (sheet frame: chair at 0, desk at z .5) ----------------
  // bored: head propped on his right fist (forearm up from the elbow on the desk), eyes up at the clock; left hand flat on
  // the desk, drumming (B lifts the hand)
  bored: { ...pose(rootOf({ rx: .1, rz: -.1, x: -.03 }), { armR: [[-.36, 1.26, .04], [-.36, .86, .3], { local: true }], armL: [[.14, DESK_Y, .56], null] }, [-.05, -.14, -.3]), ...seatLegs(.1, -.04, -.1), props: CHAIR_BACK },
  boredB: { ...pose(rootOf({ rx: .1, rz: -.1, x: -.03 }), { armR: [[-.36, 1.26, .04], [-.36, .86, .3], { local: true }], armL: [[.14, DESK_Y + .07, .56], null, { lift: .02 }] }, [-.07, -.16, -.32]), ...seatLegs(.1, -.04, -.1), props: CHAIR_BACK },
  // STARE IT DOWN: leans right in over the desk, both forearms flat on it, chin forward, glaring up (squint)
  stare: { ...pose(rootOf({ rx: .3, y: -.03 }), { armL: [[-.1, DESK_Y + .17, .5], [.4, DESK_Y + .17, .3]], armR: [[.1, DESK_Y + .17, .46], [-.4, DESK_Y + .17, .28]] }, [.02, -.42, 0]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  stareB: { ...pose(rootOf({ rx: .36, y: -.04 }), { armL: [[-.1, DESK_Y + .17, .52], [.4, DESK_Y + .17, .32]], armR: [[.1, DESK_Y + .17, .48], [-.4, DESK_Y + .17, .3]] }, [-.02, -.5, .04]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  // LOOK AWAY: turns to the window (his left), right forearm across the desk, left hand drumming, whistling
  away: { ...pose(rootOf({ rx: .02, ry: .28, rz: .04 }), { armR: [[.05, DESK_Y + .17, .45], [-.36, DESK_Y + .17, .3]], armL: [[.24, DESK_Y, .5], null] }, [.85, .02, .08]), ...seatLegs(.14, -.08, -.04), props: CHAIR_BACK },
  awayB: { ...pose(rootOf({ rx: .02, ry: .3, rz: .05 }), { armR: [[.05, DESK_Y + .17, .45], [-.36, DESK_Y + .17, .3]], armL: [[.24, DESK_Y + .07, .5], null, { lift: .02 }] }, [.9, -.02, .1]), ...seatLegs(.14, -.08, -.04), props: CHAIR_BACK },
  // ...and WHIPS back to the clock (sneaky check): body still half turned, head snapped to the front
  whip: { ...pose(rootOf({ rx: .08, ry: .16 }), { armR: [[.05, DESK_Y + .17, .45], [-.36, DESK_Y + .17, .3]], armL: [[.22, DESK_Y, .5], null] }, [-.12, -.2, 0]), ...seatLegs(.14, -.08, -.04), props: CHAIR_BACK },
  // SHAKES HIS WATCH next to his ear (left forearm up from the elbow, A/B = the shake), head tilted into it, right hand on the desk
  shakeA: { ...pose(rootOf({ rx: .02, rz: .1 }), { armL: [[.3, 1.6, .12], [.46, 1.12, .12], { local: true }], armR: [[-.22, DESK_Y, .44], null] }, [.18, .02, .28]), ...seatLegs(.12, -.06, -.08), props: CHAIR_BACK },
  shakeB: { ...pose(rootOf({ rx: .02, rz: .1 }), { armL: [[.36, 1.66, .2], [.46, 1.12, .12], { local: true }], armR: [[-.22, DESK_Y, .44], null] }, [.18, .02, .3]), ...seatLegs(.12, -.06, -.08), props: CHAIR_BACK },
  // checks it: wrist brought across in front of his face (forearm level), head down at it
  checkW: { ...pose(rootOf({ rx: .12 }), { armL: [[-.02, 1.28, .44], [.4, 1.1, .2], { local: true }], armR: [[-.22, DESK_Y, .44], null] }, [-.05, .32, 0]), ...seatLegs(.12, -.06, -.08), props: CHAIR_BACK },
  // 1:04: forehead goes down (PRE: sinks forward), then lies cheek down on his forearms, face turned to his right, dead eyes
  sinkFwd: { ...pose(rootOf({ rx: .3, y: -.03 }), { armL: [[-.14, DESK_Y + .17, .5], [.4, DESK_Y + .17, .34]], armR: [[.14, DESK_Y + .17, .46], [-.4, DESK_Y + .17, .32]] }, [0, .35, 0]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  cheekDown: { ...pose(rootOf({ rx: .3, y: -.02, rz: -.04 }), { armL: [[-.14, DESK_Y + .17, .5], [.4, DESK_Y + .17, .34]], armR: [[.14, DESK_Y + .17, .46], [-.4, DESK_Y + .17, .32]] }, [-.95, -.05, -.75]), ...seatLegs(.1, -.06, -.1), props: CHAIR_BACK },
  // ---------------- the girl: taking notes ----------------
  noteA: { ...pose({ y: -.02, rx: .14, rz: -.03 }, { armR: [[-.08, DESK_Y, .5], null], armL: [[.18, DESK_Y, .54], null] }, [-.08, .45, -.08]), ...seatLegs(.08, -.07, -.04) },
  noteB: { ...pose({ y: -.02, rx: .16, rz: .02 }, { armR: [[-.04, DESK_Y, .47], null], armL: [[.22, DESK_Y, .56], null] }, [.06, .5, .05]), ...seatLegs(.1, -.05, -.04) },
  noteLook: { ...pose({ y: -.02, rx: .08, ry: .1 }, { armR: [[-.04, DESK_Y, .47], null], armL: [[.22, DESK_Y, .56], null] }, [.7, .1, .05]), ...seatLegs(.1, -.05, -.04) },   // glances at him (her left)
  // classmates: chin on hand / listening, arms folded on the desk
  chin: { ...pose({ y: -.02, rx: .1, rz: .08 }, { armL: [[.3, 1.28, .06], [.34, .86, .32], { local: true }], armR: [[-.16, DESK_Y, .55], null] }, [.08, .05, .2]), ...seatLegs(.08, -.06, -.06) },
  folded: { ...pose({ y: -.02, rx: .2 }, { armL: [[-.14, DESK_Y + .17, .5], [.4, DESK_Y + .17, .34]], armR: [[.14, DESK_Y + .17, .46], [-.4, DESK_Y + .17, .32]] }, [0, .05, 0]), ...seatLegs(.1, -.06, -.06) },
  // ---------------- the teacher at the board: points at it (reach), the other forearm holds the marker up, lecturing ----------------
  tPoint: { ...pose({ ry: -.45, rz: .02 }, { armR: [[-.8, 1.55, -.2], null, { lift: .03 }], armL: [[.18, 1.12, .32], [.4, .95, .1], { local: true }] }, [.55, .02, .04]), ...standLegs(.04, .06) },
  tTalk: { ...pose({ rx: -.02, rz: -.03 }, { armR: [[-.5, .9, .4], null], armL: [[.3, 1.2, .38], [.4, .85, .1], { local: true }] }, [-.05, .05, -.04]), ...standLegs(.06, .02) },
  // ---------------- little him in Brain HQ (stool, console .45 m in front, panel top ~.88) ----------------
  // clicking the counter in his right hand at his chest (forearm up from the elbow), left elbow on the console, cheek on fist
  hqClick: { ...pose({ y: -.05, rx: .2, rz: .06 }, { armR: [[-.2, 1.22, .45], [-.38, .76, .1], { local: true }], armL: [[.32, .9, .5], null] }, [.12, .1, .22]), ...seatLegs(.2, -.1, .1) },
  hqPress: { ...pose({ y: -.06, rx: .22, rz: .06 }, { armR: [[-.2, 1.17, .47], [-.38, .74, .1], { local: true }], armL: [[.32, .9, .5], null] }, [.12, .12, .23]), ...seatLegs(.2, -.1, .1) },
  // the YAWN: free arm flung up and back (from the shoulder, slid up + out so it reads stretched), head thrown back,
  // torso arched back, still holding the counter
  hqYawn: { ...pose({ y: -.03, rx: -.22, rz: -.12 }, { armL: [[.62, 1.92, -.3], null, { lift: .16 }], armR: [[-.2, 1.24, .42], [-.38, .78, .1], { local: true }] }, [-.15, -.42, -.12]), ...seatLegs(.26, -.16, .14) },
  // night: up off the stool, leaning over the console toward the eye windows, both hands on the edge, nose to the glass
  hqGlued: { ...pose({ rx: .32, rz: .03 }, { armL: [[.3, .9, .52], null], armR: [[-.3, .9, .5], null] }, [-.04, -.42, 0]), legL: [.1, -.97, .2], legR: [-.12, -.97, -.12] },
  hqGluedB: { ...pose({ rx: .36, rz: -.04, x: -.03 }, { armL: [[.3, .9, .55], null], armR: [[-.3, .9, .52], null] }, [.1, -.45, -.05]), legL: [.1, -.97, .2], legR: [-.12, -.97, -.12] },
  // ---------------- the guy on the sofa at night ----------------
  gameA: { root: { y: .02, rx: .3, rz: .06 }, ...padArms(1.1, .5, -.02), head: [.06, -.1, .1], ...seatLegs(.24, -.1, .06) },
  gameB: { root: { y: .02, rx: .34, rz: -.07 }, ...padArms(1.1, .52, .02), head: [-.08, -.12, -.1], ...seatLegs(.18, -.04, .16) },
  // 3am: sits back, the controller sinks to his lap, head pushed forward (staring at the clock, his right)
  horror: { root: { y: .02, rx: -.08 }, ...padArms(.92, .46), head: [-.55, -.08, 0], ...seatLegs(.12, -.06, .04) },
};
export const POSE_SHEET = [
  ['bored (head on fist, eyes on clock)', 'guy', 'bored', 'bored', 'chair desk'], ['bored B (drum)', 'guy', 'boredB', 'bored', 'chair desk'],
  ['STARE IT DOWN', 'guy', 'stare', 'annoyed', 'chair desk'], ['stare B', 'guy', 'stareB', 'annoyed', 'chair desk'],
  ['looks away (whistle)', 'guy', 'away', 'whistle', 'chair desk'], ['looks away B', 'guy', 'awayB', 'whistle', 'chair desk'], ['WHIPS back', 'guy', 'whip', 'squint', 'chair desk'],
  ['shakes watch A', 'guy', 'shakeA', 'skeptical', 'chair desk'], ['shakes watch B', 'guy', 'shakeB', 'skeptical', 'chair desk'], ['checks watch', 'guy', 'checkW', 'squint', 'chair desk'],
  ['1:04 sinks', 'guy', 'sinkFwd', 'blank', 'chair desk'], ['cheek on desk', 'guy', 'cheekDown', 'blank', 'chair desk'],
  ['girl notes A', 'girl', 'noteA', 'neutral', 'chair desk'], ['girl notes B', 'girl', 'noteB', 'neutral', 'chair desk'], ['girl glances', 'girl', 'noteLook', 'skeptical', 'chair desk'],
  ['classmate chin', 'n0', 'chin', 'bored', 'chair desk'], ['classmate folded', 'n0', 'folded', 'neutral', 'chair desk'],
  ['teacher points', 'teacher', 'tPoint', 'neutral', ''], ['teacher talks', 'teacher', 'tTalk', 'neutral', ''],
  ['HQ click', 'guy', 'hqClick', 'bored', 'stool'], ['HQ press', 'guy', 'hqPress', 'bored', 'stool'], ['HQ YAWN', 'guy', 'hqYawn', 'yawn', 'stool'],
  ['HQ glued to the eyes', 'guy', 'hqGlued', 'starstruck', ''], ['HQ glued B', 'guy', 'hqGluedB', 'starstruck', ''],
  ['sofa gaming A', 'guy', 'gameA', 'grin', ''], ['sofa gaming B', 'guy', 'gameB', 'determined', ''], ['3AM horror', 'guy', 'horror', 'shocked', ''],
];
//           clock: 1:03, the second hand crawling.
// 5.1-11.5  he stares it down (leans in, squints), looks away out of the window for ages (drumming), whips back; shakes
//           his watch at his ear, checks it (1:03); the clock: the minute hand clicks to 1:04. Forehead to the desk, cheek
// 11.5-18.7 dive into his face. Brain HQ: little him (navy ME polo) on the stool, clicking a hand tally counter on EVERY
//           blinks... the wall clock whizzes round to 3:00, his face drops, the controller sinks... then he looks back at
// SITTING (Xavier's technique): torso base = butt on the seat, legs near vertical slid forward ~.31 (top of leg = knee)
// the controller grip: both forearms up from the elbows at the ribs, hands in front of the belly ~.38 apart
  // ---------------- the guy, at his desk (sheet frame: chair at 0, desk at z .5) ----------------
  // bored: head propped on his right fist (forearm up from the elbow on the desk), eyes up at the clock; left hand flat on
  // the desk, drumming (B lifts the hand)
  // STARE IT DOWN: leans right in over the desk, both forearms flat on it, chin forward, glaring up (squint)
  // LOOK AWAY: turns to the window (his left), right forearm across the desk, left hand drumming, whistling
  // ...and WHIPS back to the clock (sneaky check): body still half turned, head snapped to the front
  // SHAKES HIS WATCH next to his ear (left forearm up from the elbow, A/B = the shake), head tilted into it, right hand on the desk
  // checks it: wrist brought across in front of his face (forearm level), head down at it
  // 1:04: forehead goes down (PRE: sinks forward), then lies cheek down on his forearms, face turned to his right, dead eyes
  // classmates: chin on hand / listening, arms folded on the desk
  // ---------------- the teacher at the board: points at it (reach), the other forearm holds the marker up, lecturing ----------------
  // clicking the counter in his right hand at his chest (forearm up from the elbow), left elbow on the console, cheek on fist
  // the YAWN: free arm flung up and back (from the shoulder, slid up + out so it reads stretched), head thrown back,
  // night: up off the stool, leaning over the console toward the eye windows, both hands on the edge, nose to the glass
  // 3am: sits back, the controller sinks to his lap, head pushed forward (staring at the clock, his right)
// expand the shorthand padArms / [yaw, pitch, roll] heads of the sofa poses into solved limbs
  // the wall clock: 1:03 and crawling. Each second the second hand TICKS (a quick step with a tiny bounce), the minute
  // hand clicks over to 1:04 at T_MIN
  // his wristwatch: on the left wrist, the face on the outside of the arm (shows 1:03 + seconds)
  // his controller (rides both hands every frame, see padAt)
  // classmates: half take notes, half listen chin-on-hand / arms folded; small drifts so nobody is frozen
  // the tally counter: in his right hand, face out (toward the lens in front of him), thumb button up when the forearm
    // the gun (bottom right): rifle body, mag, sight, gloved hands; recoil + muzzle flash while firing
    // HUD: minimap, health + armour, ammo, kill feed, match bar
  // night light: TV glow on him (cool, flickering with the muzzle flashes), a dim warm lamp, moonlight through the windows
  // ---------- camera ----------
    // point: THE CLOCK, whole face straight on: 1:03, the second hand crawling
    // point: looks away for ages (from the window side: his face turned to us, drumming), then whips back
    // point: the watch face, close: 1:03
    // point: THE CLOCK: the minute hand clicks to 1:04
    // point: face down on the desk, dead eyes (from his right, low over the desk; the girl is behind the lens)
    // ...dive into his face
    // point: the huge yawn, still clicking (from over the console, his face + the counter)
    // back to clicking, slumped: wide from the front-left (his face, the counter, the console)
    // point: his face lit by the TV, thumbs going (from beside the TV)
    // back out - point: his face, the BLINK
    // point: THE WALL CLOCK whizzes round to 3:00 (whole face straight on)
    // point: his face drops, the controller sinks... then back to the game (front, slow push)
  // resolve the shots that follow a moving part (the watch on his wrist, the dive into his face) from the poses themselves
  // the camera is never still: any shot whose keys barely move gets a slow push in
  // the controller rides his hands: midpoint of the two hand ends, across = left hand -> right hand, front edge away from
  // him, tilted so the face looks up at him
    // ---- the classroom clock: 1:03 crawling, the minute hand clicks to 1:04 ----