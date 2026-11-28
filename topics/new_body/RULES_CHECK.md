# RULES CHECK: <video name>  (copy to topics/<name>/RULES_CHECK.md BEFORE any scene code; tick only with evidence)

## Script (CLAUDE.md 4, FORMAT_BIBLE 8)
- [ ] Approved by Xavier (date):
- [ ] Rule in line 1, done by 3 s; "You see," in 2-3; gags by 20%; "But I" by 30%; plant early; crisis + clock by 40%
- [ ] <= 95 s; cliffhanger SHOWN not said; every sentence one picture; 7-year-old check per block written down

## Voice + mouths (5)
- [ ] Voice pace ~260 wpm, preamble trimmed, gaps < .5 s; words.json; flap.json; lines.json
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
