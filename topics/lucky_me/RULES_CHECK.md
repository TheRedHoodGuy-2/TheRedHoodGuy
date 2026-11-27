# RULES CHECK: Lucky Me

## Script (CLAUDE.md 4, FORMAT_BIBLE 8)
- [x] Approved by Xavier (date): 2026-11-27 00:59 (whole script + shot list, bolt ending kept)
- [x] Rule in line 1 (0.00-2.42s); "You see," at 2.96s (sentence 3); gags (lightning/jet) 5.02-12.3s (~10-25%); "But I" at 12.4s (25%); plant (Jaden always next to him) shown 14.6-18.3s; crisis (Mom, clock) 18.9-22.8s (~38-46%)
- [x] 49.19s voice (well under 95s); cliffhanger SHOWN (bolt hits car, cut on flash, line 38 has no dialogue); every line in SHOTS.md maps to one drawable picture; 7yo check: every 2-5s block has a gag/reveal/clock tick (see SHOTS.md table)

## Voice + mouths (5)
- [x] Take approved by Xavier already (49.19s dur, 160 words = ~195wpm effective incl. pauses, longest gap checked below); words.json present; flap.json/lines.json: TODO this step
- [ ] Only the speaker's mouth moves; talk row matches each line's emotion

## Per location (copy this block for each)
### Location: ____
- [ ] World full in every camera direction used (no void / empty ground); town around the street; windows see the world
- [ ] No thin far geometry (pickets / wires) in view; camera near >= .15, far <= 400
- [ ] Trees are treeParts game trees; every imported model inspected close up
- [ ] Surfaces real materials; practical lights only if the story turns them on
- [ ] look.js rig used (dayLook / roomLook) + follow(); sun gives a 3/4 front key on faces in the main directions
- [ ] Mood of this place / beat written: ____
- [ ] Cast from cast.json; boy wears hoodie 91631221833009 red, fits from 4 sides
- [ ] Every pose: thought + feeling written; anticipation / action / reaction; no mirrored arms; hands ON things
- [ ] Walkers use walkPlan + footLock; walk check PASS (paste)
- [ ] Facing of every actor checked in a still

## Camera (9)
- [ ] Shot list built with shots.js; validate() empty (paste)
- [ ] Every shot: stills at start / mid / end looked at: subject clear, face lit + visible, nothing blocking, no crowding
- [ ] Cuts ~1.5 s, first ~1.9 s, 7 cuts in first 10 s; moves + speeds vary every cut

## Gates (11)
- [ ] lookmeter PASS (paste numbers)
- [ ] clip check PASS on contact poses
- [ ] EVERY frame extracted + tiled + looked at; zoom crops of faces / hands / contacts; defects list: none left
- [ ] Final render 30 fps; title + description written

## Script pre-flight (Clap Cops took 6 versions; every fix below was a question Xavier had to ask. Run ALL before he sees v1)
- [ ] Premise from HIS lane: adult-world rule, a tabooish trigger, a kid narrator who causes the trouble (not a cute kid errand).
- [ ] Not his flow copied: our own structure (cold open from the climax, loop ending), his example is a seed only.
- [ ] Insinuate: the adult secret is planted (an object on screen) and paid off by one line; never named, shown or heard.
- [ ] Gags: 2-3 one-liners, ~1.5 s each, tension starts in the very next sentence.
- [ ] Want: the narrator wants ONE thing in the crisis and every action is an attempt at it that fails (ask "why does he do this?" for every beat).
- [ ] Rule holes: does the rule's own logic make any beat unnecessary or impossible (the ear van hears everything = why call?).
- [ ] Physical logic: who is where, which door, what is open, can this entrance happen after that action.
- [ ] Plant placed where it pays off (the pink car at OUR house, seen early), loop: last shot matches the cold open.
- [ ] Animatable: every beat checked against the engine; hard gestures get a pose plan (or a pose ask), new sets get BUILT, list every new model / cast member.
- [ ] 2-3 real-comment baits listed (loophole, exempt character, plant), not "what would you do".

## Script gate (Xavier 2026-11-25)
- [ ] Comment bait from real comments (loophole / exempt character / lookalike / pedant detail), not AI prompts
- [ ] Sus insinuated: one plant + one line, never named or shown; no kid characters in it
- [ ] Gags are one-liners; tension starts the very next sentence
- [ ] Every crisis action is an attempt at the narrator's one want
- [ ] Every beat animatable on R6 + our engine (no on-screen stair climbs, no big-furniture pushing, few contact chains; gestures posed, never called impossible; new sets built, not dodged); every new set / model / cast member listed
- [ ] Script read back for contradictions (two holders of "one" thing, a door that is already open, a plant in the wrong place)

## New models/props inventory (Lucky Me, inspected 2026-11-27)
PASS (pulled + inspected close up, out/pull/<id>.jpg):
- Private jet: 2424091690 (Dassault-shaped, clean geometry, no texture carried)
- Sports car: 8573316692 "Drift Car" (maroon coupe; NOTE: rear badge is raised mesh geometry, not a decal - stripping
  textures does not remove it; no shot holds tight on the badge, see SHOTS.md 35-37; flagged to Xavier)
- Slushie machine: 2037619935 (cabinet + lit panel + 2 drum nozzles, reads clearly)
- Corner store front: 104560670058776 "Stylized Mini-Market" (generic "MART" signage, not a real brand)
- Store shelf display: 93471449866653 (same creator/style as the mini-market)
- Pool floaty: 9851465121 (scaled .42x from native; native is multi-person raft size)
- Retail counter: 134989489039266 (per-mesh bbox dump checked 8/8 meshes - all in-proportion, nothing floating
  detached; an earlier "auto-hide floating sprites" filter was dead code that could never fire, since it computed
  its threshold from a bbox that already included what it was trying to filter - removed it rather than patch
  logic for a defect that doesn't exist)
- Vending machine: BUILT (engine/designs/streetprops.js vendingMachine()), not pulled - every pulled candidate failed
  (SnackVendingMachine 10904552162: 5-part empty glass box; Bloxy Cola 10289332763: dark unmarked box, no detail;
  Stylized Vending Kiosk 74634314507210: 38/50 parts were CSG unions the converter could not read, model exploded into
  disconnected scraps). Built to real proportions (.9 x 1.83 x .76 m): cabinet, glass front, visible product cans,
  header band (for our own taped sign), coin slot, buttons, drop tray. First build had coils poking through the
  cabinet sides (wrong rotation axis) - caught in the stills check, cut the coil rods, kept the cans, re-rendered clean.

REJECTED (inspected, failed):
- SnackVendingMachine 10904552162, Bloxy Cola 10289332763, Stylized Vending Kiosk 74634314507210 (see above)
- Slushie Machine 11299751051 (reads as a jukebox/speaker cabinet, not a slushie machine)
- Model 504039052 (flat black box, no detail)
- CornerStore 131299267832544 (221 parts but renders near-solid-black, materials too dark/undetailed for a store front)
- "Pool Floaty" 110914919 (wrong asset entirely: stacked spheres + a bead chain, not a floaty)
- 2021 Koenigsegg Jesko 6810376207, Chevrolet Corvette C8 15500402955, official "Sports Car" 6433323089 (cached
  from before this video, never actually visually verified) - all three have NaN/degenerate bounding boxes, broken geometry
- Stylized Display Rack 77725787315339 (unreadable floating bars, doesn't resolve into a shelf)
- Supermarket Shelf 136834561290893 (1 part, too simple to be usable)

Tool fix made while inspecting: modelsheet.html's shadow-camera frustum was hardcoded to +-6 m, so anything over ~12 m
rendered false-solid-black (killed the first CornerStore read). Fixed to size off the model's own bounding box.

## Built sets inventory (lucky_me_set.js, inspected with lmcheck.html + an R6 figure for scale)
- mansionFront(): PASS. Stucco facade, 4-column portico, balcony + balustrade, glass French doors, entry door,
  arched windows. Needed texReady() awaited before the check render or mat()'s async-loaded stucco/tiles textures
  show solid black (documented pitfall, STUDIO_LOG) - the first check render hit exactly this, fixed by awaiting it.
- mansionPool(): FAILED then FIXED. First build: coping and water were solid boxes covering the water's own
  footprint, not rings with a hole cut for it - the pool never rendered at any angle, water invisible under the
  coping regardless of y-offset. Rebuilt deck/coping/water as proper hole-cut rings (same technique as
  roomkit.js's door/window openings). Loungers also failed first pass (a tilted flat plank read as an
  invisible edge-on sliver) - rebuilt as a seat block + upright backrest. Re-rendered: pool (blue water, tan
  coping, tiled deck) and both loungers read correctly. PASS after the fix.
- cornerStoreFront(): PASS, unchanged from last session.
- cornerStoreInterior(): PASS. A thin vertical "pole" artifact seen in two check renders was traced with
  per-mesh bbox logging (incl. Lines/Sprites, not just Meshes) - nothing in the actual geometry is tall/thin
  enough to cause it, and disabling shadow mapping entirely made it vanish. Confirmed shadow-map precision
  artifact from the disposable check-harness's oversized shadow frustum (sized for the mansion, reused for a
  5x4.6 m room), not a defect in the model or scene; the real pipeline sizes its shadow camera per scene via
  look.js and won't reproduce it. No fix needed to the set itself; tightened the harness's own frustum anyway.

