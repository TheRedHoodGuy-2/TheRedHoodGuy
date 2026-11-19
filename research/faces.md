# Roblox faces research (for the faces phase), 2026-11-19
Sources: Roblox Creator Docs (head comparison table: classic decals vs dynamic equivalents; dynamic head
specifications; Animate heads; FACS poses), devforum (Face Recorder announcement 2022, Dynamic Heads beta), Exitlag
Roblox faces guide, face ID list pages; lip sync: Preston Blair mouth chart (frameo.ai summary), highonfilms lip sync
techniques, cg-wire, Lost Marble (Moho / Rhubarb auto lip sync), RMCAD dialogue animation.

## Two kinds of Roblox face
- **Classic faces** = flat decals on the head (Smile, Man Face, Woman Face, Chill, :], -_-, :-o, Winning Smile ...).
  They never move. This is the look of most Roblox story channels (Gneef: "simple Roblox-style decal faces").
- **Dynamic heads** = 3D heads with a FACS rig (FaceControls 0..1: EyesLookDown, LeftEyeClosed, JawDrop,
  LipCornerPuller, Pucker ...). Animated in the Animation Editor / Face Animation Editor sliders or recorded from a webcam
  (Face Recorder, 2022). Roblox converted many classic faces into dynamic versions (the docs keep a side-by-side table).
- For R6 storytime the classic decal look is the standard. Our mains already use a DECAL on the head's own triangles
  (kit/roblox.js in the old repo, engine/faces.js here): the right base.

## How to make decal faces act (our plan)
Keep the decal LOOK, animate it like 2D animation:
1. **Layered decal**: eyes, brows and mouth as separate layers on the face texture (not one baked image) so each can
   change on its own: blink (eyelid frames), eye direction (pupil offset), brow angle (emotion), mouth (viseme).
2. **Expression set** per character: neutral, happy, laugh, sad, angry, scared, shocked, smug, bored, confused,
   disgusted, crying (the classic catalogue covers these; e.g. :'(, :-o, -_-, Mildly Irritated, Concerned).
3. **Lip sync with a mouth chart** (Preston Blair 9: A/I, E, O, U, C/D/G/K, F/V, L/Th, M/B/P, rest). Rules: hold vowels,
   snap consonants, return to rest between phrases; don't key every phoneme (chattery "typewriter mouth"); softer,
   smaller shapes for whispers; acting leads the shot, the mouth follows. Auto first pass: Rhubarb Lip Sync (open
   source, outputs Preston Blair shapes from audio) or our words.json timings, then hand-fix.
4. **Eyes alive**: blinks every 2-6 s and on head turns, eye darts 1-2 frames, pupils toward who they look at.
5. **Face pops**: the expression changes on the thought (eyes lead), with a 1-2 frame squash on the change (actor
   motion v2 "faces pop" carried over).
## Decisions for Xavier (faces phase)
- Classic decal style (matches the genre) vs dynamic-head style (3D mouth, more work, less Roblox-storytime).
- Drawn by us (consistent set per character) vs real catalogue faces (recognisable, but static and inconsistent).
