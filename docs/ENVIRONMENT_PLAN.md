# ENVIRONMENT PLAN (draft 2026-11-18, for Xavier's sign-off)

## What Gneef's scenes actually are (from the 75 reference videos)
- Three kinds of place: (1) the town outside: suburb street, houses with porches, sidewalks, crosswalks, streetlights, pines,
  mountains far off, blue sky with clouds or a night sky; (2) rooms: bedroom, living room, kitchen, classroom, built as rooms on
  their own (we never see them inside the outside house); (3) one-off story places: toy factory, puppet stage, cloud world, space.
- The camera is close most of the time (faces, medium shots), backgrounds soft and out of focus; a set only needs to look good
  where the camera points.
- Mood is carried by light and colour: day = hard sun + blue sky; interior = warm lamp + cool window; night = blue / purple moon
  light + warm practical lights + glow; strong colour, never grey.
- Surfaces are textured everywhere: wood grain floors, brick, painted plaster, knit fabric on clothes, real grass, asphalt.

## Our scene system
1. ONE town map (exterior only): street, sidewalks, 8 to 12 house shells (outside only, porches, windows with fake interiors), park,
   school front, shop fronts, trees, mountains, sky. Built once, reused in every video.
2. A SET LIBRARY of rooms (cut-aways): each room is its own small set, built only as far as the camera sees (3 walls + floor +
   ceiling, a window showing a backdrop of our town). Bedroom, kitchen, living room, bathroom, classroom, hallway first.
3. STORY SETS built when a script needs one, then kept in the library.
4. Every set ships with: its light rigs (day / golden hour / night), named camera spots, and the floor height so characters land
   on it.

## Detail without killing render time
- Detail only where the camera is: grass = textured ground everywhere + real 3D grass clumps only near the camera
  (instanced, a few thousand, not a billion); trees = real models near, flat cut-out cards far; mountains and sky = backdrop.
- Heavy models get cut down in the cloud Blender (already done for trees) and textures kept to 1K to 2K.
- Light and shadow that never change (rooms, the town) get BAKED once in the cloud Blender at high quality and denoised, then
  stored as light maps. This is how we get soft realistic shading with no grainy ambient occlusion, and it costs nothing per frame.

## Materials, textures, colours
- One material library: every surface is a real PBR material (colour + roughness + normal map) from CC0 libraries
  (Poly Haven, ambientCG), never a flat colour.
- Colour rules: first what the thing really is (research the real-world look), then push saturation a little for the
  Gneef look; each scene gets a small palette (walls, floor, accents) that keeps the characters standing out from the set.
- Render look: filmic tone mapping, glow only on real light sources, depth of field on the subject, a colour grade per mood,
  no grain, no vignette.

## Order of work (one piece at a time, Xavier signs each)
1. Look study: our old videos against Gneef, side by side, to name exactly what made ours look flat.
2. Material library + colour rules (a sheet of swatches on spheres and walls).
3. Light rigs: day, golden hour, night, interior, tested on one simple room with our characters.
4. First room set (bedroom), fully dressed and lit, shown from 3 camera spots.
5. The town map, piece by piece (street, then houses, then trees and grass, then sky and backdrop).
6. More rooms, then props.
