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
