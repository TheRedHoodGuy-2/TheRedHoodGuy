# Animation + posing research (full pass, 2026-11-19). Builds on research/animation_r6.md.
Sources: Lasseter "Tricks to Animating Characters with a Computer" (SIGGRAPH 94); animatorisland.com "Perfect Posing"
series; Animation Mentor (posing critique: meaning, silhouette, line of action, contrapposto; Shawn Kelly on moving
holds); AnimSchool blog (moving holds: momentum, breathing, eye darts, head support; eye/blink timing; idle layers);
CG Channel animation tips (breathing early, eye-dart triangle when listening); clip-studio / posemy.art (line of action,
contrapposto, direction); Roblox devforum (Jespone's guide, easing-style feedback threads); UW CSE animation lecture
(anticipation -> action -> reaction; dialogue characters face 3/4 to camera).

## The core ideas, in our terms
1. **Every move comes from a thought** (Lasseter). Lead with the EYES, then the HEAD, then the BODY. Long lead for a big
   decision, short lead for a snap reaction. Only an outside force (a hit, a push) moves the body first.
2. **Timing = weight and emotion.** Heavy / big things take longer to start, stop and turn; light things snap.
   Happy = faster, sad / defeated = slower. Give each character their own speed for the same action.
3. **Spacing**: wide spacing = fast, tight spacing = slow; even spacing = dead. Ease in / out on almost everything.
   Snappy feel = keys close together on the move, long hold around the pose (Roblox's own "designing poses" doc).
4. **Anticipation -> action -> reaction** (our ACTION THEN REACTION rule). Bigger action = bigger anticipation.
   Don't dwell too long on any of the three. A forward move starts with a small move BACK.
5. **Overlap / follow-through**: never bring one action to a full stop before the next starts; parts arrive at staggered
   times (hips, then torso, then head and arms). Hair and accessories settle after the body.
6. **Arcs**: heads, hands and the hips travel on arcs, never straight lines; check the head's path frame by frame.
7. **Moving holds** (Lasseter: a held pose in 3D "dies"): keep something drifting in the direction of the LAST momentum,
   plus four layers: momentum drift, breathing (chest / shoulders), eye darts, head supporting the body's direction.
   Our actor motion v2 already drifts ~15% toward the next pose + breathing idle: keep it, add eye darts with faces.
8. **Eyes**: darts are 1-2 frames with no in-betweens (they lock on); blinks 3-10 frames; a listener's eyes move in a
   triangle (eye, eye, mouth of the speaker). Blink on head turns. No "zombie eyes" (fixed stare).
9. **Exaggeration matches the design**: caricatured designs take more; R6 is caricatured, so push poses further than
   a realistic rig would allow, but keep it believable.

## Posing (key poses must read as a STILL first)
- **Silhouette**: the pose must read as a solid black shape. Arms off the body (negative space), never in front of the
  torso when the camera sees the front. Test silhouettes before detailing.
- **Line of action**: one C or S curve through the spine that the whole body supports; push it further than feels
  natural; strongest at the moment of most energy. Don't force a pose onto a pre-drawn line (stiff).
- **Power centre**: the part that pulls the body (chest out = proud, head forward = curious, hips forward = lazy).
  If you can't see it in the still, it won't be in the motion.
- **Contrapposto / weight**: weight on one leg, hips tilt one way, shoulders the other. Held key poses keep the centre
  of gravity over the feet; BREAKDOWNS (in-betweens) should be off balance: that is where energy comes from.
- **Gravity per limb**, not only per body: tired arms hang heavy, a heavy character's limbs sag.
- **Twinning is the enemy**: never mirror both arms / legs (our DYNAMIC POSING rule 1). Asymmetry everywhere.
- **Personality changes the same action**: the nerd and the jock pick up a pencil differently. The emotion can set the
  line of action by itself when there is little physical action. Hidden feelings: true emotion in one part (hands,
  face), the pretended one in the rest.
- **Shift weight when the thought changes** (new line of dialogue = new weight shift).

## R6-specific (rigid limbs, no elbows / knees)
- The whole limb is the gesture: a raised arm swings from the shoulder, so read the ARM ANGLE as the elbow bend would be.
- Seated R6 numbers live in research/classroom.md (arms rest ON a desk only if its top is under the arm bottom).
- R6 arms pivot half an arm-width below the top: raised arms must slide out of the shoulder (STRETCHED ARMS rule).
- Moon Animator / Roblox animators lean on easing styles (cubic, back, elastic) because there are few joints: the
  curve does the work the missing elbows can't. Linear easing reads robotic (devforum feedback, repeatedly).

## What goes into docs/ANIMATION.md (the law, once Xavier signs it off)
1. Think-first checklist per beat: what does the character want, what do they feel, what is the thought that starts
   the move (eyes lead), what is the anticipation, the action, the reaction.
2. Every key pose passes: silhouette, line of action, power centre visible, weight over the feet (or deliberately off
   for a breakdown), no twinning, head with the body.
3. Every hold is a moving hold (drift + breath + eye darts + head support).
4. Eases: 'back' default, 'snap' only for impacts; no linear except mechanical things.
5. Overlap: hips -> torso -> head -> arms -> hair, 2-4 frames apart at 30 fps.
6. Clip check (tools/clipcheck.js style point-in-mesh test) on every seated / contact pose.
