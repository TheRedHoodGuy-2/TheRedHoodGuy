# Asset library

Everything built for a video lives here and gets reused. Rule: anything we build is built **completely** (a whole room,
not the corner the camera sees) and registered in this file the same day.

**Look:** Roblox-game style. Textures only where they read (wood grain on tops, marble floors, cork, fabric), flat paint
everywhere else (frames, legs, walls, trims). Lighting is bright but designed: sky
fill (HDRI) + a sun that throws window patches + practical ceiling lights, contact shadows and AO strips at
every join, baked floor reflections (`refs.bake(renderer)`). Nothing goes dark, nothing looks flat.
Every window looks onto something real: build the map around the scene.

## Characters
| Name | File | Notes |
|---|---|---|
| Red-hoodie guy (channel face) | `kit/hoodie.js` | Locked look (`reference/hoodie/`). Poses: idle, sit, carry, think, recoil, point, proud, shrug, crouchPut, peer. `breathe()`, `walk()` |
| Burglar outfit | `kit/thief.js` | `dressThief(hero)`: beanie, eye mask, stripes, swag bag, `sneak` pose |
| Roblox R6 guy | `kit/roblox.js` `loadMale()` | Rig from `assets/roblox_src/6910cb06…` (CC-BY-SA, credit youK197_YT). Texture `assets/avatar_tex/male.png`, spiky black hair, hood, cuffs, sneakers |
| Roblox R6 girl | `kit/roblox.js` `loadFemale()` | Rig `df1cc521…` (source unknown, ask Xavier before posting), hair from `8e445034…` (CC-BY, credit Piethekiddev). Texture `assets/avatar_tex/female.png` |
| NPCs (endless) | `kit/npc.js` `npc({seed})` | Random sex, 9 skin tones, tops (tee, longtee, stripes, polo, hoodie, sweater, jacket, tank, crop), bottoms (jeans, chinos, shorts, skirt, sweatpants), sneakers / boots, hair (mesh styles from kit/hair.js, spiky, buzz, cap, beanie; natural colours), chest prints, expressions. Body texture painted at runtime on the same template; `randomLook(seed, sex)` gives the spec. Preview: `tools/npcview.html` |
| Hair meshes | `kit/hair.js` `putHair(A, style, colour)` | 16 Roblox hair styles from Xavier's packs (`roblox_src/3a73d212…`, `59a53f02…`, `2d327b30…`: source/licence unknown, ask Xavier before posting; bacon hair `3b18c93f…` CC-BY 4.0, credit Trina.McCoy). Male: messyShort, swept, layered, fluffy, roundFluffy, bacon. Female: longStraight, longStraight2, braidBand, lowPony, topKnot, halfUp, longBob, bunBraid, spaceBuns, longLocks. Textures greyed + tinted; `naturalHair(R)` = natural colours, ~4% dyed. Preview: `tools/hairview.html` |
| Face kit | `kit/facekit.js` `faceTex(expr, {style, sex})` | 12 styles (classic, tick, scribble, bigeye, toon, bean, anime, marker, sharp, pixel, neon, hose) x 83 expressions (incl. 7 talking mouth shapes talkA/E/O/U/M/F/L for lip sync) with stickers (blush, sweat, tears, veins, sparkles, gloom, zzz, steam, hearts, ?!). Works with `dress(A, {}, { getFace: (n, sex) => faceTex(n, { style, sex }) })`. Gallery: `face_kit.html` (published artifact), sheets: `tools/facekit.html`, on heads: `tools/faceheads.html` |
| Costumes | `kit/costume.js` `wearCostume(A, name, {drop})` | Unrigged R6 avatar models worn over our rigs (parts snapped to bones, body hidden). `cultist` (c00lkidd, CC-BY credit amogusstrikesback2; drop `Firebrand1` = knife), `helperbot` (licence unknown). Files in `kit/assets/costumes/`. Check: `tools/costumecheck.html` |
| NPCs from the Creator | `kit/cast.js` `castNpc(id)` | Builds a designed NPC from `kit/assets/npc_pack/<id>/spec.json` exactly as npc_creator.html does. `ghostify(actor)` = see-through glowing ghost, returns set(opacity). First: `spider_friend` |
| Faces (both R6) | `kit/faces.js` | 33 expressions, `face(name, 'm'/'f')`. Female mouth = black line + pink lips (Xavier's pick) |

R6 setup: `skin(A, png)` wraps a painted texture, `dress(A, {}, { getFace: face, face, sex, skipBody: true })` adds the face,
`details(A, [...])` adds hood / cuffs / hems / toe caps / hair. Repaint the outfits with `python3 tools/paint_avatar.py`
(layout: `assets/avatar_template/`). Preview: `tools/avatarcheck.html`.

## Sets (`export const SET = '<name>'`)
| Set | File | What's in it |
|---|---|---|
| kitchen | `kit/sets/kitchen.js` | Legacy kitchen |
| bathroom / bathroom_real | `kit/sets/bathroom*.js` | Toilet videos |
| workshop | `kit/sets/workshop.js` | Bench, tools |
| street | `kit/sets/street.js` | Our house front (real door, hallway), lawn, sidewalk, road, neighbours' houses |
| plane | `kit/sets/plane.js` | Economy cabin, 17 rows x 6 seats, windows, bins, warm ceiling lights |
| surround (filler) | `kit/sets/surround.js` | `surround(G, scene, {box, GY})` wraps ANY set: sidewalks, ring road with markings, lamps, parked cars, house rows facing the road, apartment blocks + park trees, hills with instanced forest, water tower, haze. Use it so no window or wide shot is ever empty |
| classroom | `kit/sets/classroom.js` | 9 x 10 m: textured pale-blue walls + dado, polished marble floor (reflections), tiled ceiling + lights, window wall, whiteboard (writable), live clock, teacher desk + office chair, 16 desks + chairs, door, noticeboard, bookshelves, lockers, AC, posters, plants, bin, backpacks. **Outside:** brick school (our wing 2 storeys, corridor, neighbours), path + bushes under the windows, courtyard with cross paths, 7 trees, benches, flower beds, lamp posts, flagpole (`refs.flag`), hedges, 3-storey far wing, railings, tree lines, HDRI sky. 3D viewer: `classroom_viewer.html` (courtyard spots too) |
| backdrop | `kit/sets/backdrop.js` | Endless light-blue studio cyclorama (floor melts into the sky colour), soft key + rim, craft table with cutting mat (`TABLE`), round stool (`STOOL`) |
| livingroom | `kit/sets/livingroom.js` | 6 x 7 m house living room, REAL materials: herringbone parquet (clearcoat, baked reflections), stucco walls from the `beige_wall_001` scan (teal accent TV wall), panelled semi-gloss wainscoting + chair rail + crown, velvet curtains, woven kilim rug with fringes (`gen/rug_kilim`, wool scan inside). Poly Haven models: `modern_wooden_cabinet` (TV console), `sofa_02` black tufted leather + `throw_pillows_01`, `mid_century_lounge_chair`, `coffee_table_round_01` (marble), `potted_plant_01/02/04`, `ceramic_vase_01/03`, `book_encyclopedia_set_01`, `fancy_picture_frame_01`, `modern_ceiling_lamp_01`. Ours: wall TV (`refs.tv.set(k)` / `on()` / `off()`), floor + table lamps (`refs.lamps[]`), oak shelves, side table, clock, 2 windows. Doorway (+x) into a hallway (runner, coat rack, front door `refs.frontDoor`). **Outside:** yard bushes + `surround()`. `refs.spots` {tvFront, sofaFront, standTV, filmer}. Built for the TV remote skit |

## Props
| Library | File | Items |
|---|---|---|
| School | `kit/props/school.js` | `desk`, `chair`, `teacherDesk`, `officeChair`, `whiteboard` (`.write(fn)`), `windowUnit`, `door` (`.open(a)`), `wallClock` (`.set(h,m,s)`), `ceilingLight`, `bookshelf`, `trashBin`, `plant`, `noticeBoard`, `poster`, `acUnit`, `lockers`, `backpack` |
| Nature + yard | `kit/props/nature.js` | `tree({type})` oak / maple / birch / poplar / pine / sapling (real branching, leaf-card canopies), `bush({kind})` round / flower / box, `hedge`, `flowerBed` (stone edging, daisies, round blooms, tulips), `bench`, `lampPost`, `railing` (cut-out panel), `flagpole` |
| Poly Haven models | `kit/phmodel.js` | `phModel(name, {s, tint, pick, floor})` loads `kit/assets/ph/<name>/<name>.gltf` at real size (engine waits for it). Fetch with `tools/polyhaven.py`, measure with `node tools/modeldims.mjs a,b`. `tools/neutral_tex.py <tex>` makes a greyscale `neutral.jpg` so `pbr(..., { map: 'neutral', tint })` gives true colours with the real grain |
| Gadgets | `kit/props/gadgets.js` | `gamepad` (DualSense-style two-tone controller, no logos, hand-sized; rides both hands via userData.gripL/R), `tallyCounter` (chrome hand tally, live 4-digit window, thumb button), `digitalWatch` (black resin sports watch, live LCD, strap sized to an R6 arm), `slushieCup` (fake SLURPZ cup, clear dome, heaped slush, spoon straw, ~.42 m), `textbook` (hardcover, `open` angle, fake title). Researched in research/props_timecrawl.md + props_brainfreeze.md |
| Home | `kit/props/home.js` | `rugKilim`, `runner`, `sofa`, `armchair`, `cushion`, `coffeeTable`, `sideTable`, `tvConsole`, `tv` (screen on/off), `remote` (`userData.tip` = IR end), `floorLamp` / `tableLamp` (return `{group, light}`), `rug` (patterned), `curtain`, `bookshelfHome`, `books`, `vase`, `coatRack`, `frame` + `artAbstract` / `artSunset` / `artLines`, `fabric(tint)` (fleece normal, flat colour), `wood()` |
| Foliage core | `kit/foliage.js` | painted leaf atlases (broad, maple, small, needle, box, blossom), `Cards` builder, `clumpCards`, `grassField` (instanced grass tufts in LOD chunks), flower heads. Plants are `THREE.LOD`: leaf cards only near the camera |
| Town | `kit/props/town.js` | `house({seed})` (siding or brick, gable roof, shutters, porch, chimney, garage, fenced yard, mailbox, bushes, tree), `apartment`, `car`, `picketFence`, road / sidewalk materials, `mergeStatic(group)` (one mesh per material) |
| Lock | `kit/models/lock.js` | door, knob, deadbolt, latch, chair, wooden bar, Egyptian peg lock, pin-tumbler cylinder, keys, flat stick, welcome mat |
| Halloween | `kit/props/halloween.js` | `spider({scale})` pipe-cleaner spider with `.set({lay, twist, bend, glue, pom, eyeL, eyeR, legT})` build stages, `pipeCleaner`, `glueGun` (`.trigger(k)`), `candyBucket` (jack-o-lantern full of wrapped sweets), `candy` |
| Headphones | `kit/models/anc.js` | cotton ball, ear cups, ANC headphones, cut-away cup, wave ribbons |

## Materials
`kit/pbr.js`: `pbr('ph/<name>' | 'gen/<name>', {rep, tint, noColor, normal, rough, metal, physical, clearcoat, envI})` loads colour +
normal + roughness maps; `contactShadow(w, d)` grounds props; `aoStrip(len, width)` darkens joins. `boxUV(geo, w, h, d)`
(classroom.js) gives boxes metre-scale UVs so brick/concrete never stretch.

## Textures
- `assets/ph/<name>/`: Poly Haven CC0 scans (`python3 tools/polyhaven.py <name>`). In use: oak_veneer_01, red_brick_03, clay_roof_tiles, pine_bark, forest_leaves_03, excavated_soil_wall, brushed_concrete, concrete_pavement_02, knitted_fleece, denim_fabric_03, cotton_jersey, leather_white, plus older set textures. Sky: kloofendal_48d_partly_cloudy_puresky (.hdr + `sky_ldr.jpg` for web viewers, which can't serve .hdr).
- Canvas-made at runtime: leaf atlases, grass blades, petals, birch bark, siding (+normal), facades, road markings, garage door, picket fence, hair strands / curls, NPC outfits.
- `assets/gen/`: generated, seamless (`python3 tools/gen_textures.py`): marble_white (+normal, rough), vinyl_light, ceiling_tile (+normal), cork (+normal), whiteboard, wallpaint_n, grass_green (+normal).
- `assets/fabric/`: Xavier's swatch photos (red knit, light + dark denim, peach jersey) and cropped tiles.
- Missing something? Ask Xavier for a Google Flow texture (flat, front-on, evenly lit, square).

## Look-dev tools
- `tools/setview.html?set=<name>&cam=px,py,pz,lx,ly,lz,fov`: still of any set
- `tools/plantview.html`: every tree species, bush, hedge, flower bed and grass on one lawn
- `tools/npcview.html?seeds=1,2,3&hairs=..&sexes=..`: NPC line-up
- `tools/avatarcheck.html`, `tools/facesheet.html`, `tools/modelview.html?m=<files>`

## Clothing (kit/clothing.js) and tools
- `dressTexture({ base, skin, shirt, pants, shading, key })` -> avatar texture for `RB.skin(A, tex)`. Shirt/pants accept Roblox classic templates (585x559) or our 2048 layout. `key: '#00ff00'` keys a flat colour out (for Flow images, which can't be transparent). Shading is MULTIPLIED (greyscale, white = none), `'auto'` = built-in folds.
- `buildShirt({ color, fabric, print, printKey, sleeves: long|short|none, neck: crew|v|hood|collar, cuffs, hem, back })` draws a garment from parts; Flow only has to make the print.
- Check sheet: `tools/clothtest.html` (labelled-template orientation test + builder samples).
- Pose editor: `pose_editor.html` (published artifact). Models ship base64-packed in `tools/pose_editor/assets_pack.js` because the artifact host won't serve gltf/bin/fbx/obj.
- NPC Creator: `npc_creator.html` (artifact, db collection `npcs` + uploaded assets). Hair check sheet: `tools/hairfit.html` (every style front/side/back). Hair fit per style (TUNE s/oy/oz in kit/hair.js) is solved by `tools/hairtune.html`: every scalp ray must hit hair, eye rays must stay clear. Re-run it when a hair model is added. No cover-up layers.
- `kit/packs.js` + `tools/pack/models_pack.js` (gzip model pack for artifact pages; `python3 tools/pack_models.py` rebuilds it).
- `kit/sets/brainroom.js` BRAIN HQ: cartoon control room inside a character's head (eye windows with a baked POV view, console, status screen states idle/predict/muted/unknown, TICKLE lever, FEELING gauge, nerve cables with pulses, alarm beacon + red light, stool, mug, sign). `buildBrainRoom(scene, { at })`, `set({...})`, `setView(tex)`, `spots`.
- `kit/props/school.js` + `testPaper({ seed, answered })`, `pencil()`.
- `tools/stills.mjs <topic> '[times]' <dir> [w h]`: many stills from one page load + sheet.jpg + occlusion check (who's blocking each head in frame).
- Brain HQ options (2026-10-22): `buildBrainRoom(scene, { at, leverLabel })`; `set({ screen })` also takes a function `(g, w, h, t)` to draw any custom screen (keep content in the middle ~300 px: screens are filmed straight-on in portrait). Faces: `yawn` (mains), `holdYawn` / `yawn` (face kit).

## Added for the growl video (2026-10-26)
- `kit/sets/stomachroom.js` micro world: empty stomach, gut tube (squeeze wave), FOOD crate (wood), cones, CREW AT WORK sign, STOMACH 0% FULL sign, giant drum (boom rings), gas bubble.
- `kit/props/breakfast.js` plate, omelette, bacon, toast, orange juice, fork, steam, breakfastPlate().
- `kit/faces.js` new faces: painBite, shockOdd (Xavier's sketches), puffL / puffR (holding breath).
- `kit/assets/props/r6bag/` Xavier's R6 backpack (bag.obj fits a 2x2x1-stud torso, straps over the shoulders; bag_sky.png = its fabric texture recoloured light sky blue). Growl hangs it from a shoulder pivot with run / jump / landing secondary motion.
- `kit/assets/faces/photo_smile.png` + `_n.png` photo face (colour-matched to the R6 skin, feathered, normal map for depth), made with `tools/photoface.py`; load with `loadPhotoFace()` (kit/faces.js), rendered lit.
- `kit/triplanar.js` surface(kind, colour): world-projected material detail (no UVs needed) for plaster / siding / painted wood / varnished wood / brick / roof tiles / concrete / asphalt / grass. Paint stays the colour, the texture adds what the stuff is. Town parts are classified by shape (slope, wall vs thin trim, ground) + colour.
- `kit/fx.js` dust(events): dust puffs for footfalls / landings. filmA: `T.shakes` [{t,amp,dur,freq}] camera shake.
