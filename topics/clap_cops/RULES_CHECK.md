# RULES CHECK: Clap Cops ("Clapping Is Illegal, I Called The Cops 👏")  (copy to topics/<name>/RULES_CHECK.md BEFORE any scene code; tick only with evidence)

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

## Script gate (Xavier 2026-11-25)
- [ ] Comment bait from real comments (loophole / exempt character / lookalike / pedant detail), not AI prompts
- [ ] Sus insinuated: one plant + one line, never named or shown; no kid characters in it
- [ ] Gags are one-liners; tension starts the very next sentence
- [ ] Every crisis action is an attempt at the narrator's one want
- [ ] Every beat animatable on R6 + our engine (no on-screen stair climbs, no big-furniture pushing, few contact chains; gestures posed, never called impossible; new sets built, not dodged); every new set / model / cast member listed
- [ ] Script read back for contradictions (two holders of "one" thing, a door that is already open, a plant in the wrong place)

## Filled 2026-11-25 (evidence)
- Script approved: Xavier 11:55 v5 ("lms the new script now" -> v5 sent; 12:03 "alr apply EVERYTHING"). Ending changed by him 12:16 -> Mrs. Pam sneaking out (shown).
- Voice: his take (Roblox narrator, deadpan) tightened, v3 approved 12:29 (topics/clap_cops/voice/voice.wav 44.75 s, words.json, flap.json). Scene-turn pauses kept at .44 s per his note.
- Mouths: talk() spans only on the on-screen speaker (Dad 13.92 / 28.66 / 39.84, boy 23.64 / 27.04 / 35.08, Mom 42.96); narration = no mouth. Lady on the phone off screen.
- Locations: (1) suburb street day (gag), (2) House A dining day (birthday), (3) town pitch with painted football field + pulled bleachers 3365565933 + light towers 2392872297 (day, lights off), (4) House A street at night, (5) House A interior at night (living, entry + stairs, upstairs corridor, parents bedroom). World: suburb/town around every exterior; windows look onto the lit street.
- Imported models inspected in stills: van 6048783847 (black, CLAP POLICE livery, light bar), pink car = Camry 133877355439325 recoloured (+ headlights), Mom's car Civic 15233606123, suitcase 9392387817, cake 5002633399, bleachers, light towers. The pulled ear lost its body (unread unions) -> modelled ear (engine/sets/clapset.js makeEar).
- Cast added (library/cast.json): dad (m060, chosen by Claude while Xavier slept), dad_robe (Bath Robe 127302724868422), clapcop (Cop Uniform 1879540681 + Police Pants 4944607821), mrs_pam (f021).
- Light: dayLook per shot with a day / night table; night = moon key + practicals (living lamp, TV, entry, corridor, bedroom, porch) + red/blue siren wash from 31.5 s; subject key + rim follow every shot.
- Posing: his climb pose (POSE_LESSONS 11) drives the stair climb; his sit / kneel / fall / wave codes reused; shoulder-vs-elbow limbTo for clap, phone, stretch, hip, sneak.
- Camera: per-shot solver (subject-relative, raycast-checked both ways, room-bounded, faces only from the front half) + hand-placed cameras for the entry / stairs / bedroom / birthday; validate() run in build (see log); stills start/mid/end of every shot: rounds cc4 .. cc9 in /tmp (fix log in this file's history).
- PENDING before the review video: final stills pass clean, pose sheet to Xavier, then lq review render + every-frame check, lookmeter, motionstudy.
