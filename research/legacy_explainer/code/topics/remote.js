// from explainer-kit topics/remote/topic.js (pose + acting parts only, 2026-11-25)
export const LOCAL_POSES = {
  smackUp:   { armR: [-.1, .3, .95], armL: [.12, -.42, .9], legL: [.08, -1, .04], legR: [-.1, -1, -.03], head: [.05, .35, .03], root: { rx: .08, rz: .02 } },   // remote raised, left palm waiting
  smackDown: { armR: [.02, -.5, .87], armL: [.12, -.4, .91], legL: [.08, -1, .04], legR: [-.1, -1, -.03], head: [.04, .4, -.02], root: { rx: .1, rz: -.01 } },    // slaps it into the palm
  aimTV:     { armR: [-.05, .12, 1], armL: [.12, -1, .1], legL: [.1, -1, .06], legR: [-.12, -1, -.06], head: [.02, -.02, .04], root: { rx: -.03, rz: .03 } },     // arm locked out at the TV
  leanInL:   { armR: [-.25, .55, .8], armL: [.1, -1, .05], legL: [.15, -1, .05], legR: [-.05, -1, -.02], head: [-.45, -.04, -.18], root: { rx: .05, rz: -.22 } },   // leans in from frame left, remote up by his face, head round to the lens
  leanInR:   { armR: [-.25, .55, .8], armL: [.1, -1, .05], legL: [.05, -1, -.02], legR: [-.15, -1, .05], head: [.45, -.04, .18], root: { rx: .05, rz: .22 } },
  stareIn:   { armR: [-.3, .5, .8], armL: [.1, -1, .05], legL: [.1, -1, .04], legR: [-.1, -1, -.04], head: [-.2, -.06, -.12], root: { rx: .1, rz: -.06 } },   // final: bent right into the lens
};
export const POSE_SHEET = [
  ['smackUp', 'guy', 'smackUp', 'annoyed', ''], ['smackDown', 'guy', 'smackDown', 'frustrated', ''], ['aimTV', 'guy', 'aimTV', 'frustrated', ''],
  ['leanInL', 'guy', 'leanInL', 'sideeyeR', ''], ['leanInR', 'guy', 'leanInR', 'sideeyeL', ''], ['stareIn', 'guy', 'stareIn', 'sideeyeR', ''],
];
// (off screen, her line only), handheld the whole time. No captions in the render (Xavier adds the POV text in his edit).
// 6.5-13.8 she lazily drifts the camera away (shelves, clock, doorway, hallway) refusing to give him the moment; he keeps
//          leaning back into the edge of frame with the side-eye, remote held up, until he is right in the lens. Cut.
// poses new to this video (pose gate, then into kit/poses.js). Avatar frame: +x its left, +z forward.
  // ---------- the remote, in his right hand (rides the arm bone) ----------
  // camera: her phone at eye height. Holds on him, swings to the TV and back, then wanders off to the right while she
  // where the camera is at time t (same spline as the engine is close enough for staging: linear between keys)
  // a spot for him at the frame edge: x = screen position (-1 left .. 1 right), d = distance from the lens; body turned
  // away by `turn`, so only the head comes round to the lens
  // walk from wherever he was into a frame-edge spot (arrives at ta), then lean in with the side-eye
    // the chase: she pans away to the left, so he falls off the RIGHT edge; each time he WALKS back into the right edge