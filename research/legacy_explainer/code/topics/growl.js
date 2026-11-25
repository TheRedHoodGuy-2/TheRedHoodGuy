// from explainer-kit topics/growl/topic.js (pose + acting parts only, 2026-11-25)
export const LOCAL_POSES = {
  sprint:      { armL: [.1, -.75, .6], armR: [-.1, -.75, -.5], head: [0, -.1, 0] },   // arms / legs / lean come from the run cycle (kit/actor.js)
  jumpDown:    { armL: [.6, .4, .5], armR: [-.55, .5, .4], legL: [.1, -.8, .5], legR: [-.05, -1, -.3], head: [0, .1, 0], root: { rx: .1, y: .05 } },
  clutch:      { legL: [.15, -.1, 1], legR: [-.12, .08, 1], armL: [-.55, -.6, .6], armR: [.35, -.75, .55], head: [.2, .04, .15], root: { y: -.22, x: .03, rx: .3, rz: .1 } },
  clutch2:     { legL: [.2, .05, 1], legR: [-.1, -.12, 1], armL: [-.6, -.5, .62], armR: [.45, -.7, .55], head: [-.25, .1, -.18], root: { y: -.25, rx: .42, rz: -.12 } },
  holdBreath:  { legL: [.1, -.08, 1], legR: [-.04, -.05, 1], armL: [.3, -.65, .7], armR: [-.25, -.6, .76], head: [0, -.12, .04], root: { y: -.2, rx: -.06, rz: .02 } },
  coughFist:   { ...SIT, armR: [.3, .62, .72], armL: [-.45, -.7, .55], head: [.1, .04, .05], root: { y: -.22, rx: .25, rz: .06 } },
  anticip:     { legL: [.12, -.08, 1], legR: [-.1, -.04, 1], armL: [-.55, -.6, .6], armR: [.35, -.75, .55], head: [.05, -.05, 0], root: { y: -.21, rx: .12, rz: .03 } },
  girlLeanAway:{ legL: [.1, -.05, 1], legR: [-.15, -.1, 1], armL: [.3, -.75, -.55], armR: [-.3, -.8, .5], head: [.7, .02, -.14], root: { y: -.22, x: -.12, rx: -.2, ry: .32, rz: -.3 } },
  girlGlance:  { ...SIT, armR: [-.05, -.5, .86], armL: [.28, -.66, .7], head: [.7, .2, -.05], root: { y: -.22, rx: .14, ry: .12 } },
  announce:    { armR: [-.4, .25, .88], armL: [.15, -.95, .2], legL: [.08, -1, .05], legR: [-.12, -1, -.08], head: [-.1, -.05, .06], root: { rz: .03, ry: .1 } },
  squeezeA:    { armL: [-.25, -.35, .9], armR: [.3, -.4, .87], legL: [.05, -1, .2], legR: [-.08, -1, -.25], head: [.1, -.05, .1], root: { rx: .3, rz: .05 } },
  squeezeB:    { armL: [-.45, -.5, .75], armR: [.4, -.55, .75], legL: [.1, -1, -.2], legR: [-.04, -1, .22], head: [-.15, 0, -.1], root: { rx: .38, rz: -.06 } },
  duck:        { armL: [.3, .75, .6], armR: [-.55, .35, .75], legL: [.15, -.6, .8], legR: [-.1, -.85, .45], head: [.3, .35, .1], root: { y: -.3, rx: .4 } },
  coverEars:   { armL: [.2, .9, .25], armR: [-.35, .8, .3], legL: [.2, -.9, .3], legR: [-.1, -1, -.15], head: [.15, .15, .2], root: { rx: .2, rz: .12, y: -.05 } },
  drumUp:      { armR: stretch([-.15, .85, -.45]), armL: [.85, .05, .35], legL: [.15, -1, .25], legR: [-.18, -1, -.3], head: [-.1, -.3, -.1], root: { rx: -.25, rz: -.12 } },
  drumHit:     { armR: [-.05, -.25, .97], armL: [.6, -.45, -.55], legL: [.2, -1, .35], legR: [-.15, -1, -.35], head: [.05, .3, .08], root: { rx: .35, rz: .08, y: -.05 } },
  slouchBack:  { armL: { r: [2.173, 1.042, -0.368] }, armR: { r: [2.339, -1.434, 0], o: [0, 0, -0.117] }, legL: { r: [-0.843, -0.272, -1.242], o: [0, 0.115, 0.246] }, legR: { r: [-0.825, 0.003, -0.087], o: [-0.03, 0.058, 0.268] }, root: { x: 0.097, y: -0.179, z: 0.195, rx: -0.406 } },   // Xavier's (tickle)
};
export const POSE_SHEET = [
  ['sprint', 'guy', 'sprint', 'determined', ''], ['jumpDown', 'guy', 'jumpDown', 'determined', ''],
  ['writeTest (shockOdd)', 'guy', 'writeTest', 'shockOdd', 'chair desk'], ['clutch (painBite)', 'guy', 'clutch', 'painBite', 'chair desk'],
  ['clutch2 (painBite)', 'guy', 'clutch2', 'painBite', 'chair desk'], ['holdBreath (puffR)', 'guy', 'holdBreath', 'puffR', 'chair desk'],
  ['coughFist', 'guy', 'coughFist', 'awkward', 'chair desk'], ['anticip', 'guy', 'anticip', 'nervous', 'chair desk'],
  ['girlGlance', 'girl', 'girlGlance', 'shocked', 'chair desk'], ['girlLeanAway', 'girl', 'girlLeanAway', 'shocked', 'chair'],
  ['teacher announce', 'npc', 'announce', 'neutral', ''],
  ['crew squeezeA', 'guy', 'squeezeA', 'determined', ''], ['crew squeezeB', 'guy', 'squeezeB', 'determined', ''], ['crew duck', 'guy', 'duck', 'scream', ''],
  ['crew coverEars', 'guy', 'coverEars', 'scream', ''], ['crew drumUp', 'guy', 'drumUp', 'determined', ''], ['crew drumHit', 'guy', 'drumHit', 'angry', ''],
];
  // ---------- the class turns round at the first growl, stares through his cough and growl 2, goes back to the test ----------
  // ---------- BRAIN HQ: little him tipped back bored, the STOMACH timer hits 2 hours, he slams CLEAN UP ----------
  // the mallet rides the drummer's right hand
  // ---------- camera ----------
    // 1 the door flies open, he bursts out, the camera whips with him toward the street
    // 6 silence: drone pull-back over the whole class as every head snaps up
    // 7 squeezing: pain face
    // 10 growl 2: wide two-shot, desk rattles, she leans away, the pencil rolls off
    // 11 "You see": push into his forehead, cut into Brain HQ
    // 15 echo like a drum: wind up... BOOM, then his shocked face and the girl staring in horror
  // weight (Ink Game study): dust where his feet hit the lawn, a camera shake on every impact