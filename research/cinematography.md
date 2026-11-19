# Film look research: composition, colour, grading, lighting, camera, "pseudo-photoreal" (2026-11-19)
Xavier's brief: understand how films and animations LOOK like films, so we never look like basic 3D objects dropped in
a scene. Not full photorealism: a believable, photographed feel on Roblox characters and sets.
Sources: tuts+ / nofilmschool / wolfcrow / fiveable / videomaker / freelancevideocollective (composition: thirds,
leading lines, headroom, lead room, frame in frame, depth layers); Neil Oseman "Depth Cues in Cinematography";
shutterangle "Creating Depth part 3"; RedShark "separation" + "layered lighting" (John Alton, Painting with Light);
Canon "six ways to give your filmmaking depth"; premiumbeat / videomaker / fiveable / wedio (key, fill, back, ratios,
high-key / low-key, practicals, motivated light, negative fill); wolfcrow / photoworkout / fstoppers / dailyphototips
(focal lengths, compression, distance distorts faces); filmsupply / storyblocks / fool.com / framecoach / morphic /
webiano (primary vs secondary grade, LUTs, teal-orange and why); Animation Mentor, TED (Danielle Feinberg), StudioBinder,
Wired "How Pixar uses hyper-colors" (colour scripts); Lasseter; shootfirst.art "what makes a shot cinematic";
School of Motion "mimic photographic effects"; Nukepedia "CG to Film"; creativebloq (lens realism, colour-correct renders);
Vox "How Spider-Verse forced animation to evolve", before&afters (Puss in Boots), RedShark (Arcane); tone mapping:
ArtStation deep dive, morphic, three.js forum (AgX), "Games look bad" (80.lv), Unreal "look" AgX vs ACES.

## 1. Composition (where things sit in the frame)
- Rule of thirds: eyes on the top third line, subject on an intersection, not dead centre (centre = authority or
  symmetry, used on purpose and rarely).
- Headroom (small: eyes on the upper third, never a gap above the head) and LEAD / LOOK ROOM (space on the side the
  character faces or moves toward). Tight framing + little room = trapped, anxious; lots of empty room = small, alone.
- Leading lines (desk rows, the board edge, a hallway, a road) point at the subject. Frame within a frame (doorway,
  window, over-the-shoulder).
- DEPTH LAYERS: foreground + midground + background in every shot. Over-the-shoulder gives a free foreground plane.
  Pull the subject away from the back wall and put props between them and it.
- Figure / ground: light subject on a dark background or dark on light. Never the same value as the background.
- Shot sizes carry emotion: wide = information / place, medium = conversation distance, close-up = emotion,
  extreme close-up = one detail matters. Vary shot sizes for rhythm.
- In dialogue characters face 3/4 to camera, not profile to each other.

## 2. Value and depth (what makes a frame read as 3D space)
- Alternate light and dark planes along the depth axis (dark foreground, subject at key, brighter background:
  John Alton). Five light / dark layers read deeper than one flat bright room.
- Aerial perspective: haze lightens and desaturates distance. Warm foreground, cooler background deepens space.
- Backlight / rim cuts the subject out of the background (the strongest "cinematic separation" tool).
- Show corners, side walls and the space outside the room in the frame: wall texture shows the perspective.
- Gneef / Roblox-storytime contrast: they light everything evenly from everywhere (research/look_study). That is
  exactly the "objects dropped in a scene" look; it is safe, but nothing feels lit.

## 3. Lighting
- Three-point: KEY (main light, makes the shadows, never right next to the camera or it goes flat), FILL (opposite
  side, softer; key:fill RATIO sets the mood: 1:2 bright and friendly, 1:8 dramatic), BACK / RIM (behind and above,
  separates subject from background). Most setups are variations of this.
- High-key (low ratio, few shadows) = comedy, sitcom, kids: our default for storytime. Low-key (dark, strong shadow,
  little fill) = tension, horror, night, secrets. Choose per scene from the story, not per habit.
- MOTIVATED light: every light has a believable source (window, lamp, screen, ceiling panel). PRACTICALS = lamps in
  frame that are switched on and actually light things. Hard light = sharp shadows (sun); soft = big sources
  (overcast window, bounce). Negative fill = take light away on one side to give shape.
- Light reveals texture when it rakes across a surface (side light), and kills it when frontal.
- Pixar: light the story moment, darken the rest so the eye goes where it should; harsh contrasty light when things go
  wrong, soft warm light when safe (Toy Story 4 lighting notes).

## 4. Camera and lens
- Focal length (full-frame equivalent): 24-35 mm wide = environment, depth, energy, distorts what is close;
  35-50 mm = "normal", like the eye; 85 mm = flattering close-ups, compression, soft background; 135 mm+ = flat,
  compressed, spied-on. Distortion comes from DISTANCE, not the lens: a wide lens forces you close.
  vertical 9:16 fov to mm: our fov 28-42 (vertical) ~ 33-50 mm equivalent on the short side; close-ups want ~60-85 mm.
- Depth of field: shallow (wide aperture, long lens, close focus) isolates the subject and hides clutter; deep focus
  keeps context (wide establishing shots). Rack focus moves attention between planes.
- Movement is a story choice: slow push-in = tension / realisation; pull-out = isolation or reveal; pan / tilt
  following action = motivated; handheld = urgency; locked off = stillness (we never fully lock: slow drift);
  crane / boom = grandeur; dolly zoom = "terrible recognition". Camera keeps drifting a few frames after a moving
  character stops (AnimSchool).
- Low angle = power, high angle = small / weak; tilting up exalts, down diminishes.

## 5. Colour theory and colour scripts
- Palettes: complementary (teal / orange, red / green: contrast, pop), analogous (neighbours: calm, unified), triadic
  (playful), monochrome + one accent (focus). Saturation and value carry mood as much as hue: bright + saturated =
  joy / youth, muted + dark = loss / fear (Up, Finding Nemo).
- COLOUR SCRIPT (Pixar since A Bug's Life): a strip of tiny frames, one palette per scene, planned against the story's
  emotional arc so key moments feel vibrant or somber. For a 25 s short: 3-5 colour beats (hook, build, twist, punch).
- Pixar "hyper-colour": colours pushed beyond reality but coherent; each film has its own gamut.

## 6. Colour grading (the finishing pass)
- Order: correction first (exposure, white balance, contrast so it looks neutral and natural), THEN the creative grade.
  A grade on a broken base just makes a stylised bad image.
- PRIMARY grade = whole image (lift / gamma / gain = shadows / mids / highlights wheels, contrast, saturation).
  SECONDARY = only one range or object (keep skin, push foliage, pull a red that shouts).
- Teal and orange works because skin is orange and its complement is teal: shadows and backgrounds go teal, skin and
  highlights warm, so the person pops by hue alone. Overused in blockbusters; use gently.
- LUT = a saved grade applied to the whole film for consistency; a starting point, never the whole job.
- Other looks: bleach bypass (desaturated, contrasty), warm golden hour, cold desaturated thriller, film-stock
  emulations (Moonlight used a different stock look per act).
- Skin is the anchor: protect it in every grade.

## 7. Why CG looks like CG, and the fixes ("pseudo-photoreal")
CG is too PERFECT: every edge razor sharp, nothing distorted, no lens, no grain, clipped highlights, flat even light,
clean surfaces, colours at 100%. Films are photographed through glass onto a sensor. Fixes, all subtle:
- Tone mapping with a real highlight shoulder (filmic / ACES / AgX / Khronos Neutral): bright things roll off instead
  of clipping to flat white. Pick it before lighting, light under it. (ACES shifts saturated brights, the "Unreal look";
  AgX handles saturated colour better but is greyer out of the box and needs a look; we use Khronos PBR Neutral.)
- Bloom / glow only on real bright sources (we cap it; a too-wide bloom washed rooms to white before).
- Depth of field on the focus point (we have it). Bokeh shape, out-of-focus simplification.
- Film grain, finer in highlights, never noise in bright areas only (we had grain in the old repo; not here yet).
- Chromatic aberration toward the frame edges and on high-contrast edges, tiny (old repo "colour fringe").
- Halation (red glow round hot highlights), veiling flare (lifted, tinted blacks), slight softness: no 1-px edges.
- Lens distortion: a touch of barrel on wide shots.
- Motion blur on fast moves (missing here: on the old list).
- Vignette: optical vignetting is real, but Xavier banned vignette: never.
- Light: motivated sources, bounce (GI / AO), contact shadows, wear at contact points, dust / haze in sunbeams.
- Materials: real surface response (roughness variation, clearcoat on varnish, sheen on cloth): we do this already.
- Stylised realism (Spider-Verse, Puss in Boots, Arcane, Mitchells): the big studios moved AWAY from the plain
  "Pixar polish" on purpose: painterly textures, simplified out-of-focus shapes, stepped timing (on twos), comp
  doing more of the look. The look is BUILT into textures + lighting + comp, not a filter on top. Real
  imperfection ("wear tells the brain it has been through something", Arcane) beats perfect lighting.

## 8. Our engine vs this list (gaps to close in the look phase)
HAVE: Khronos Neutral tone map, exposure, contrast, saturation, split tone (shadow / highlight tint), black point,
capped bloom, depth of field, volumetric sun fog, real materials, contact shadows, film-set walls, drift camera,
trauma shake, dissolves. MISSING: film grain, edge chromatic aberration, halation / veiling flare, lens distortion,
motion blur, lift-gamma-gain wheels + secondary (skin protect), per-scene LUTs, colour script per video, three-point
rigs per set (we light rooms, not characters: add a soft key + rim on the subject per shot), practical lamps with
visible bounce, haze in sunbeams by default, value-structure check (greyscale thumbnail of every key frame).
Proposed next: a `look` preset per scene type (storytime high-key, tension low-key, night, flashback) and a colour
script step in the FORMAT_BIBLE workflow (script -> colour beats -> grade).
