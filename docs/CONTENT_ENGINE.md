# CONTENT ENGINE (draft v1, 2026-11-19, for Xavier's sign-off)
How a premise becomes a finished Short with as little hand work as possible, and every retention rule enforced by a
gate instead of by memory. Built on docs/FORMAT_BIBLE.md (75 Gneef Shorts measured), research/scripting_retention.md,
research/cinematography.md, docs/ANIMATION.md, docs/FRAME_CHECK.md.

## The pipeline ("new video")
1. **Premise** -> 3 one-line pitches; Xavier picks one. Test: can a 10-year-old repeat the rule, and picture one funny
   and one scary consequence?
2. **Script** (FORMAT_BIBLE skeleton + checklist) -> Xavier approves.
3. **Voice** -> word timings (forced alignment) -> mouth flap per line (tools/flap.py) + blink plan.
4. **Shot planner** (the core of the engine): script + timings -> `shots.json`, one shot per sentence / clause:
   `{ t0, t1, line, place, who[], action, emotion per character, shot type, camera move, insert?, sfx? }`.
   Durations come from the voice, so cuts land on the words.
5. **Build**: each shot = a set (classroom, house, street ...) + bank characters + a pose / action from the library +
   faces (emotion -> face cell, talk mouth row of that emotion) + the camera grammar below.
6. **Gates** (automatic, before anything is shown): hook gate, pacing gate, frame check, clipping check, boredom score.
7. **Review video** (low quality) -> Xavier -> fixes -> **final** -> title + description.

## Retention rules the engine enforces (numbers from the Gneef study unless marked)
- **Frame 0**: something is already moving and the rule / conflict is visible; title text on screen ~2 s. Voice starts
  at 0.0 s, rule said by 3 s. (Our own stats: winners 68-70% stayed, losers 43-48%; the first frame was the difference.)
- **Cuts**: one sentence = one shot; median 1.5 s, first shot ~1.9 s, 7 cuts in the first 10 s; no shot over ~6 s except
  the emotional beat. Hard cuts inside a place; short dissolves only between places (camera decision 2026-11-19).
- **Camera never parks**: 72% slow push in (~7% bigger per second), 22% pull out, 5% drift; motion carries across cuts.
- **Shot types**: medium / medium-close on one subject (default); over-the-shoulder for dialogue (research before/after);
  insert for the rule's object (counter, sign, tag) and hands on things; wide only to show a place or crowd, then back in;
  low "giant" angle + small shake on impacts; reaction shot after every reveal.
- **Every 2-5 s a reason to stay**: each block of the shot list is tagged with its reason (new gag, open question,
  countdown, reveal coming). A block with no reason fails the pacing gate.
- **Open loops**: a question opened in the first 10 s, closed late; open the next before closing one.
- **Feeling turns** (scared -> relieved, mocked -> proud). **Plant** shown early, pays off the climax.
- **No outro**; last line lands ~0.3 s before the end; last shot matches the first so it loops.
- **Captions**: one word at a time, white heavy sans with black outline, ~72% down the frame.

## Acting rules per shot (from the research, checked in every frame)
Composition (subject on the thirds, look room, layers), lens (fov 25-40, DOF on the eyes), designed light (key + rim),
dynamic posing (line of action, no twinning, shoulder-vs-elbow limbs), the face shows the line's emotion and the talk
mouths use that emotion's row, listeners react (eye darts, small nods), background people never freeze.

## What gets built next (in order)
1. `tools/shotplan.py`: script + word timings -> shots.json (rule-based first pass: shot type and move by beat type,
   durations from the voice), plus the pacing / hook gates on the plan BEFORE anything renders.
2. An action library for the plan to call: walk, sit, stand up, turn to, point, talk (gestures on stressed words), react
   (shock, laugh, cry), pick up / hand over, run, fall. Each built once with anticipation -> action -> reaction.
3. `scenes/story.js`: one scene module that plays any shots.json on the sets we have.
4. The first test: a 20-30 s piece of a real script through the whole engine.

## Decision needed from Xavier
- The niche: Gneef-style "in this town everyone..." impossible-rule stories (the bible is built on them), Reddit-style
  drama acted by our cast, or both? The engine is the same; the script templates differ.
- Length for the first videos: 30-45 s (cheaper, fully watched) or 75-95 s (the bible's target)?
