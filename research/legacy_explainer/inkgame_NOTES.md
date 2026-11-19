# INK GAME (GibsonTV, Roblox animation, 11:45) — look study, 2026-10-28

Xavier: "why is everything hella flat, just 3d shapes with paint ... everything has a purpose, everything has a look ...
not realistic yet not 2d". Watched every shot (360 cuts in 705 s, median shot 1.4 s; frames in the session scratchpad).
What makes it NOT flat, ranked by how much each one carries the look:

## 1. The lens (biggest single difference from us)
- Shallow depth of field in almost EVERY shot. Toy / macro photography: the subject is sharp, the foreground (a shoulder,
  a hat, a head) and the background melt into soft bokeh. Wide shots too (crowds go soft toward the back).
  Ours: everything pin sharp front to back = reads as a game screenshot / CG, not a film.
- Low camera heights (waist / knee / floor level looking up), wide-ish lens CLOSE to the subject, dutch tilts, over-the-
  shoulder with a blurred shoulder filling a third of the frame. Ours: long lens from far away, eye level.
- Motion blur on fast action (runs, hits, falls). Camera shake + hit-stop on impacts.

## 2. Light: motivated, contrasty, coloured, hazy
- Every space has a key light you can name (a fluorescent tube, a window, a lamp, the sun) and real falloff: bright pools,
  dark corners. Shadows are DARK and soft, not lifted grey. Rim light separates characters from the background.
- Each location has its own colour world: red locker room, teal dorm, sunny-blue Red Light field, warm gold VIP room,
  sickly green smoke in the van. Background pushed one way, skin stays warm.
- Atmosphere: haze / smoke / dust in the air (volumetric), light beams, bloom glow round bright lights and screens.
- Grade: filmic contrast, lifted-ish blacks only slightly, vignette, fine film grain, a touch of chromatic edge.
  Ours: evenly lit "game" look, almost no shadows, no haze, no grade = flat.

## 3. Materials: stylised but READ as the stuff they are
- Characters stay R6 blocks, but: cloth has sewn fold / wrinkle lines and soft bevelled edges (the tracksuits have crease
  lines and seams, the guard suits a ribbed weave), skin/plastic has a soft toy sheen (a specular highlight on the yellow
  heads and hands), hair is chunky sculpted plastic with highlights. Numbers / logos printed on.
- Sets: big flat-colour surfaces (lockers, teal walls, yellow floors) BUT broken up exactly where wear would happen:
  chipped paint on the edges and walk paths of the yellow floor, scuffs at the bottom of walls, stains under things,
  cracks in concrete, grime in corners, worn wood on benches. Clean in the middle, dirty at contact points = purpose.
- Roughness varies: glossy floors with reflections (locker room tiles, the black marble VIP floor), matte walls.
- Cheap where the camera isn't: far stuff is simple colour; detail sits only near the lens.

## 4. Environments are dressed with story
- Every room has props that say where we are: NOTICE sign + CCTV, wall clock, boxes on top of lockers, a rifle leaning,
  bunk beds with crumpled blankets, a megaphone on the wall, murals (clouds, flowers, trees) painted on the walls.
- Real skies with clouds, tree lines on the horizon; ground has tracks, footprints, sand ripples.

## 5. Background characters are PEOPLE
- Every extra is a unique avatar (hats, hair, accessories, faces), all moving (shifting weight, turning, talking).
  Crowds never stand still. Faces are mostly classic decals with a few custom ones.

## 6. Animation
- Weight: anticipation before every move, impacts squash, dust puffs on footfalls and falls, cloth/accessory follow-
  through, hit-stops (a 2-3 frame hold) on impacts, then a camera shake.
- Holds breathe; heads track things; eyes/faces swap often.

## What we can do in our pipeline (CPU render, SwiftShader) — cheapest first
1. Lens: depth of field post pass (focus on the camera key's look-at point or the main head), per-shot aperture. +
   camera grammar: lower, closer, wider, OTS with blurred foreground shoulders.
2. Grade pass: contrast curve, location colour tint, vignette, grain (seeded per frame), slight chromatic aberration.
   Bloom on emissive / bright lights.
3. Light: less flat fill (hemi / ambient down), stronger key with darker soft shadows, rim light, practicals that pool,
   light haze (fog + a few soft light-beam cards) per location.
4. Characters: cloth fold / seam normal maps on the hoodie + jeans (sewn crease lines), slight sheen on skin (roughness
   down, a clearcoat), soft edges where the rig allows.
5. Sets: wear decals at contact points (scuffed wall bottoms, floor stains, chipped paint on edges, desk graffiti/wear),
   roughness variation, story props (signs, CCTV, posters, bins with paper, bags on chairs).
6. Animation: dust puffs on footfalls / landings, hit-stops + camera shake on impacts, motion blur on fast moves.
