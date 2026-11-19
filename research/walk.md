# Walk cycle research (2026-11-19) + how it maps to the R6 rig

## What the references agree on
- Four poses per step, Richard Williams' contact method: contact, down, passing, up; the second step is the mirror
  (UW CSE464 assignment; Pluralsight 12 steps; Sebastian Lague E05).
- Timing: ~12 frames per step at 24 fps (1 s per full cycle) is a natural walk; 8 reads brisk / urgent, 14-18 slower,
  28-40+ per cycle heavy (anim.works, cursa, spotlightfx).
- Down comes just after contact (the front leg takes the weight); passing = swing leg passes the straight planted leg;
  up = push off the planted toe, highest point before the next contact (Lague; anim.works).
- Hips travel forward exactly as far as the planted foot, or the feet slide. "No sliding feet" is the first grading
  rule in UW's walk assignment (cursa; UW CSE459).
- Arms swing opposite the legs and DRAG a few frames behind them (SIGGRAPH HyperGraph walking exercise; Roblox's own
  walk-cycle tutorial).
- Torso counter-turns: shoulders turn with the forward arm, hips with the forward leg; shoulders and hips tilt; weight
  shifts side to side over the planted foot (idearocket; Adobe; Pluralsight steps 7-8).
- Work from the hips out: hips, legs, spine, head, arms (caveacademy; Moon Animator guides).
- Roblox devforum on R6 walks: keep the legs fairly under the body (big leg swings read as crouching), alternate
  arms and legs, the head rises and falls with each step.

## Old repo (explainer-kit) walk + run, kept as reference (research/legacy_explainer/code/actor.js)
- walk: sinusoidal leg / arm swing (.62 rad), arms lag .06 of a cycle, bob, lean .06, hip twist, head counter. It never
  matched travel speed, so feet slid. Run: Xavier's R6 run-cycle tutorial (2026-10-28): 4 hand poses (contact, down,
  passing, up) + their mirror, cyclic Catmull-Rom, body leans forward, back foot already in the air at contact.

## R6 adaptation (engine/walk.js)
- R6 legs are rigid blocks with no knee, so the walk is a compass gait solved exactly from footprints:
  footprints are laid along the path; during each step one foot is PLANTED; the hip sits between the footprint
  midpoints; the planted leg's angle comes from where the hip is (asin(dx / L)); the hip height is whatever keeps the
  planted leg's lowest corner on the ground (heel at contact, toe at push-off). Feet cannot slide by construction.
- Swing leg clearance: a rigid leg would scrape the floor at passing, so the swing leg block slides UP into the hip
  (Xavier's slide trick, like the elbow / stretched-arm rule): it reads as a bent knee lifting the foot.
- Down: the planted leg slides up ~3 cm just after contact and the hip drops with it.
- First step and last step are half steps eased from / to rest (start from standing, feet together at the end).
- Arms: opposite leg, ~.85 of its angle, 2 frames late. Torso counter-twist, weight shift + tilt over the planted foot,
  slight forward lean, head steadies (counter-turns) so the eyes stay on the path.
- Gate: tools check the real mesh: planted foot drift (must be ~0) and swing foot height (never below the floor).
