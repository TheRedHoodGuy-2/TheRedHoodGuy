# RULES CHECK: 05 Sunset Tag ("In This Town, Tag Swaps You 🌅")

## Script
- [x] Approved by Xavier 2026-11-19 16:04 (he recorded it in Fish Audio: voice/take_fish.mp3, 59.1 s)
- [x] Rule line 1 (0-2.9 s); "You see," at 3.4 s; gags 8-19 s (sprint, mailman, Aunt Linda); "But I" 19.6 s (33%);
      plant (falling) 31-35 s; crisis + countdown 38-49 s; cliffhanger SHOWN (sinister smile, cut mid-laugh) 58.7-61.7 s
- [x] 7-year-old check: 0-3 rule + a kid swapped on screen | 3-8 swap both ways | 8-19 three gags + throat-slash |
      19-30 Jayden + "Kayla" swap gag | 30-35 the boy face-planting | 35-52 countdown chase + fake fall + "Tag" |
      52-58 Jayden swaps, panics | 58-62 the smile. No block without a picture change or a joke.

## Director notes for this video (Xavier 16:05)
- "Tag": the boy is SMUG (he won). "We never talk about Aunt Linda": looks into the lens + flat-hand throat-slash
  "cut it" gesture (research/gestures.md). "What did you DO?" is the swapped Jayden (girl voice).
- SFX: Xavier adds them himself in CapCut this time -> deliver an SFX cue sheet with times.

## Voice + mouths
- [x] words.json (whisper small.en), flap.json (open .29 / half .19 / closed .52); "Falling" 33.37, "Tag" 50.60 from the flap
- [x] Speakers: Jayden "Bro, you good?" 45.56-46.4; boy "Tag" 50.6-50.85; Jayden-girl "Bro!" 56.06-56.5, "What did you DO?" 57.02-58.6.
      Narration is voice-over: the narrator's mouth does NOT move on narration.

## Location: the suburb street + park (one set, four times of day)
- Mood: 0-19 s sunset glow (warm, low sun on the park hills = "the rule lives at sunset"); 19-35 s summer day (clean,
  bright, friendly: backstory); 35-52 s golden sunset, harsher contrast as the clock runs (tension); 52-62 s dusk blue
  hour, the sun gone, cool and sinister (the twist).
- [ ] World full in every direction (second rows, end row at -x, hills ring, game trees) -> stills
- [ ] No thin far geometry (fence = cut-out panel), camera near .2 / far 380
- [ ] look.js dayLook + setSun per time + follow(); faces lit
- [ ] Cast from cast.json (boy hoodie 91631221833009 red + hood; jayden m016; jayden_girl; uncle m034; aunt_linda;
      kayla; swapA/swapA_f; swapB/swapB_m; mailman_skates + skates 134464612161783 split per leg; commuters m048 m061 m087; kids m026 m002 f027 f053)
      fit checked: /tmp/ssq c_*.png + sk.png (skates scaled to the R6 foot)
- [ ] Walkers / runners: walkPlan + footLock, walk check per runner
- [ ] Facing of every actor checked in stills

## Camera
- [ ] shots.js list, validate() empty
- [ ] stills start / mid / end of every shot

## Gates
- [ ] lookmeter
- [ ] every frame tiled + looked at
- [ ] final 1080x1920 30 fps + voice; title + description + SFX cue sheet
