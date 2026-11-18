# OVERNIGHT PLAN (agreed with Xavier 2026-11-18 ~10:20 Lagos). Read this FIRST when resuming.

Rules for this run (from Xavier, all binding):
- Work through the items IN ORDER. Tick each box in this file the moment it is done, with the output path. Commit after
  every item (local). If the session is cut, the next run resumes at the first unticked box.
- Nothing taste-based is decided without Xavier: every item ends with a doc or sheet waiting for him.
- Before any picture is saved for him: look at it and find what is wrong (camera, objects, characters, things on
  characters, clipping). Fix it first. Clipping + every-frame checks run on every render.
- No early detail polishing (dust etc.). Modern style. Lights only when the story motivates them.
- Render time may grow when a feature earns it; always keep it as low as possible.
- Blunt, short, no em dashes in anything written for him.
- Roblox cookie stays at ~/.rbx_cookie, never in the repo, logs or memory.
- Push to GitHub ONLY at the end (item 8), then mirror to C:\Users\Luminmgmt\Documents\TheRedHoodGuy (access granted).

## 1. Gneef top 20 script breakdown  [x] DONE -> research/gneef_top20_scripts.md
- [ ] List Gneef's Shorts by views (yt-dlp via the laptop bridge: device_bash, cloud is bot-blocked). Pick the top 20.
- [ ] Download audio (+ video if needed) to C:\Users\Luminmgmt\Videos\gneef_top20\, stage to the cloud.
- [ ] Transcribe with word timestamps (tools/transcribe.py).
- [ ] Per video: title, views, length, full script, word count, real words per minute, the hook (frame 0, first 3-5
      frames, first second, first line), "why are they still watching" answer every 2-5 s, escalation steps, the twist,
      the ending / loop, the "In this world..." pattern, retention devices (promises, open loops, reveals), visual
      hook (what is on screen at frame 0), shot count / cut rate.
- [ ] Patterns across all 20: hook formulas, structure template, pacing, what the top 5 share that the rest don't.
- [ ] How his voice sounds (pitch, energy, pace, pauses) for the voice item.
- Output: research/gneef_top20_scripts.md (+ transcripts in research/gneef_top20/).

## 2. Scripting + retention research  [x] DONE -> research/scripting_retention.md (FORMAT_BIBLE update waits for Xavier's length decision)
- [ ] Hooks (first frame, first line), retention strategies, open loops, pattern interrupts, payoffs, loops for Shorts.
- [ ] Retention-rate benchmarks for Shorts and long form (3-10 min); what YouTube rewards (viewed vs swiped, APV).
- [ ] Reddit drama storytime format: why it holds people (AITA, betrayal, revenge, "was I wrong?"), how to adapt a
      proven story into 20-26 s without losing the hook/escalation/twist; comment-bait endings; recurring cast.
- [ ] Copyright/demonetisation: adapt in our own words, never read posts word for word.
- [ ] What we learned about retention in explainer-kit (its log/sessions, REVIEW_NOTES, STYLE.md, boredom.py, FRAME 0
      RULE: winners 68-70% stayed vs losers 43-48%).
- [ ] Draft "script checklist": the "why are they not scrolling away" check at frame 0, 1 s, then every 2-5 s.
- [ ] Long form note: how a short leads to its long-form version (curiosity, not a cliffhanger).
- Output: research/scripting_retention.md (cited) + draft docs/FORMAT_BIBLE.md update marked DRAFT.

## 3. Voice comparison  [ ]
- [ ] Gneef's voice profile (from item 1). Our Kokoro voice is bad (Xavier): show why.
- [ ] ElevenLabs and fish.audio: the "typical Roblox guy / Roblox girl" voices people use, cost per minute / plans,
      quality, API use, licence. Facts only; Xavier decides on paying.
- Output: research/voice_options.md.

## 4. Render speed  [ ]
- [ ] Per-frame timing of every stage on scenes/bedtime_story.js at 1080x1920 (scene draw, sun shadow, point-light
      shadow, volume, bloom, DOF, grade, SMAA), page load and probe separately.
- [ ] Static shadows/bounce computed once per shot (characters still get fresh shadows); camera moves stay correct.
- [ ] Practical lights: no cube shadows unless motivated; lamp OFF in daylight scenes.
- [ ] Preview-equals-final check (same look at 540 and 1080, automatic image comparison).
- [ ] Streamed, resumable frame renderer (page loads once, probe once per shot).
- [ ] Before/after still with times, identical look. Budget target ~10 s per final frame.
- Output: research/render_speed.md + tools.

## 5. The two tools  [ ]
- [ ] Pose editor: port from explainer-kit (pose_editor.html) to this repo's R6 (engine/r6.js), fix it up, publish as
      an artifact; pose code drops into a pose library file. Add the POSE LESSONS file (docs/POSE_LESSONS.md):
      every pose Xavier gives is diffed against Claude's with the principle written down.
- [ ] Roblox pull tool for MODELS: Creator Store search + by link (toolbox-service with the cookie), rbxm/rbxmx parse,
      MeshParts + Parts (+ unions where possible) -> glTF; auto: floor at y=0, front facing +z, R6 scale; strip textures,
      auto re-skin parts into wood / fabric / metal / glass / plastic with engine/materials.js; library file + sheet.
- Output: tools + one sample sheet of pulled modern furniture.

## 6. Clothing fit checker + sleeve snapping  [ ]
- [ ] Every 3D garment on both bodies in standing, arms-raised, sitting: measure body poking through and sleeve
      offset from the arm blocks; auto-fix (sleeve snapping to the arm blocks, push-out), flag what can't be fixed.
- [ ] Triage sheets: normal / in-between / odd (in-between + odd kept aside, never deleted), usability not print.
- Output: tools + sheets for Xavier's picks. (Character bank of 100 m + 100 f comes AFTER his triage picks.)

## 7. Scale sheet draft  [ ]
- [ ] Roblox and Gneef sizes (door, ceiling, seat, bed, table, counter, stairs, hand props ~ R6 hand block end)
      next to our R6; one sheet picture + table.
- Output: research/scale.md + docs/sheets/scale_v1.jpg (DRAFT for approval).

## 8. Wrap up  [ ]
- [ ] Update docs/STUDIO_LOG.md (what was done, where, what waits for Xavier), session log.
- [ ] git push (Xavier OK'd pushing at the end of this run). Tag explainer-kit v1-final only if he asked (he did earlier:
      check STUDIO_LOG before doing it).
- [ ] Mirror the repo to C:\Users\Luminmgmt\Documents\TheRedHoodGuy (tracked files, not assets/roblox).
- [ ] Morning message to Xavier: what is ready, links, what needs his decision. Short.

## Parked for later steps (do NOT start tonight)
Environment foundations 1-9 (STUDIO_LOG), camera foundations, animation research (Xavier runs it at max effort),
character bank, faces / lip sync, captions, SFX bank, scripts, long form.
