# RULES CHECK: New Body ("In this town, say the same words at the same time, and you swap lives for 24 hours")

## Script (CLAUDE.md 4, FORMAT_BIBLE 8)
- [x] Approved by Xavier: 2026-11-28 01:27 ("the ending as a new version... fire away"); SHOTS.md v2 approved same message
- [x] Rule in line 1 (done 4.08 s, voice from 0.0 over the frame-0 POOF); gags shots 3-5 (7.8-15.6 s, 16-30%); "But I/my bestie" at 15.62 (31%); plant = Dana's watch line shown at 27.5 (54%: this script is a swap-trap build, Xavier approved the structure); crisis = the to-do list + Friday ask at 34.58 (68%) with the day clock (Thursday -> Friday)
- [x] 48.7 s < 95 s; ending SHOWN (rack focus to the crier, no closing narration line); every sentence one picture (see shot table)
- 7-year-old check per block: 0-4 POOF + two kids in each other's bodies (hook); 4-8 wake in the wrong bed (gag); 8-15 birthday/choir/twins gags (each a new picture); 15-27 Dana setup = new question "why never?"; 27-34 the watch gag (comic split, loud); 34-43 the trap (list, speaker-free: he just asks); 43-48.7 the payoff + crying loop. No block without a reason to stay.

## Voice + mouths (5)
- [x] Voice: topics/new_body/voice/take.mp3 48.66 s (Xavier's take, "for mommy" cut); words.json (166 words) + flap.json built in the previous chat
- [ ] lines.json: Dana 30.42-31.94 (her female voice), BOTH 39.12-40.28 (the trigger, both flap), his-body/Dana-inside 40.84-42.74, Dana's-body/him-inside 47.12-48.42. Narration = nobody flaps.
- [ ] Only the speaker's mouth moves; talk mouths match each line's emotion (Dana's "buddy" = deadpan, the "what did you do" = angry/scared)

## Per location

### Location 1: BUS interior (shots 1, 14-15 trigger echo in comic panels only)
- NEW BUILD: interior rows + windows; parked on a town street so every window sees houses/trees (no void)
- [ ] world through the windows checked in a still; mailman-on-skates cameo passes the window (lore)
- [ ] roomLook-style key through the windows, 3/4 front on the two kids; mood: bright morning, comic
- [ ] cast: swapA + swapB (bank pair), earbuds prop shared, hands ON the earbud wire
- [ ] facing + stills start/mid/end

### Location 2: BEDROOM + grandma (shot 2)
- House A 'his' bedroom (buildHouse A up floor) or town house interior; grandma from cast.json
- [ ] window sees the world; roomLook; mood: soft morning light, wrong-house dread
- [ ] grandma kiss = lean over the bed, hand on the duvet (no clipping, raycast seat), boy freeze = eyes wide, body stiff under the duvet
- [ ] stills

### Location 3: CLASS PARTY (shot 3)
- classroom set + cake prop + party hats; kids sing ONE AT A TIME (one mouth flaps at a time, others dead silent)
- [ ] crowd never frozen (eye darts, weight shifts); mood: awkward comedy, flat fluorescent + window sun
- [ ] stills

### Location 4: STAGE + choir (shot 4)
- NEW BUILD: auditorium stage (curtain, risers); choir = bank kids; principal (bank male, suit archetype)
- [ ] chain poof left->right timed to "found out during the anthem" syllables; last kid poofs INTO the principal; facepalm on "anthem"
- [ ] mood: dark hall, warm stage wash (motivated: stage lights ON because performance)
- [ ] stills

### Location 5: CLASSROOM twins (shot 5)
- classroom set; twins = same bank character twice (recoloured shirt only? NO: identical = the joke); teacher from cast.json
- [ ] twins swap mid-shot (two small poofs) while the teacher points; teacher drops marker, sits (chair moves back first)
- [ ] stills

### Location 6: SCHOOL HALLWAY + lockers (shots 6, 13)
- NEW BUILD: locker rows both sides, enclosed set (x 9000 zone like the store interior); windows at the end see the courtyard
- [ ] Dana at her locker: arms crossed, weight on one leg, proud; shot 13 the boy walks up (walkPlan + footLock)
- [ ] walk check PASS (paste)
- [ ] stills

### Location 7: CLASSROOM Dana silent (shot 7)
- classroom reuse; class shouting arms up (varied, never mirrored), Dana perfectly still, tape ON her mouth on the cut
- [ ] stills

### Location 8: DANA'S HOUSE (shot 8): kitchen dishes / quiet hall / pancakes
- House B kitchen + hallG; dad at the sink; pancake stack + syrup pour insert
- [ ] three hard cuts, push-ins; mood: warm, enviable calm
- [ ] stills

### Location 9: BOY'S ROOM desk (shot 12)
- House A 'his' room; desk + paper + marker; insert of the list (text clear of edges)
- [ ] Thursday night = practical desk lamp ON (motivated), room dim
- [ ] stills

### Location 10: COMIC SPLIT (shots 10, 14)
- NEW BUILD: 2-panel stage at x 9500: top/bottom boxes, halftone-dot backdrops, black centre bar; panels SLAM in; on shot 14 the bar CRACKS and the panels swap places with a POOF
- [ ] Dana top (her kitchen-ish backdrop), boy bottom; only the asker's mouth flaps in 10; both flap in 14
- [ ] stills

### Location 11: STREET mid-swap + POV + ending (shots 15-17, outside school/bus stop)
- town street by the school front; swirl poof mid-swap; POV from Dana's body (camera at her eye height, head bob, hands enter one at a time); pull-out to 3/4 on "new body"; rack-focus ending (focus talker -> crier over ~.6 s, 2 s silence)
- [ ] subscribe card in/tap/out json; no text on screen except the card
- [ ] stills

### All locations
- [ ] No thin far geometry; near >= .15, far <= 400; treeParts trees only; imported models inspected
- [ ] look.js SUNNY default (engine default), per-scene mood on top; faces never black, 3/4-front key
- [ ] Boy wears hoodie 91631221833009 red; cast.json people stay themselves

## Camera (9)
- [x] Shot list = SHOTS.md v2 (17 shots, approved). validate() run on the scene SH list (paste below when staged)
- [ ] Stills at start/mid/end of EVERY shot looked at
- [ ] Cuts vary move/size/speed every cut; constant motion; motionstudy gate on the check pass

## Gates (11)
- [ ] walk check (boy hallway walk, bus aisle if any)
- [ ] CLIPSCAN PASS (paste)
- [ ] lookmeter (paste)
- [ ] popcheck prints nothing
- [ ] POSE SHEET to Xavier BEFORE any render
- [ ] ONE lq review video (180x320, 6 fps) after stills all pass

## Script gates: approved by Xavier with the shots; comment bait already in the design (the ending debate: "would you do Dana like that?", the loophole "just never speak in sync", the exempt-character pedants: "the twins abuse it"). Sus layer: removed by direction (clean read only).
