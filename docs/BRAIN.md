# BRAIN: the map of everything (read this every chat, then open ONLY the pack for the task)

Built 2026-11-27 (Xavier: "the efficient as fuck brain", "promise it won't make our results choppier").
Why: the old start-of-chat rule read ~600 KB (~150k tokens) before any work: all 8 log categories (375 KB),
every research file, every doc. Most of it had nothing to do with the task. Now: the same rules, read only
where they apply. Links are [[wikilinks]] so the repo opens as an Obsidian vault with a working graph.

## QUALITY GUARD (this is what keeps results from getting choppier; never skip it)
1. CLAUDE.md is ALWAYS read in full. Every hard rule lives there.
2. [[docs/DIRECTOR_NOTES|DIRECTOR_NOTES]] is ALWAYS read in full on any video chat (every mistake he flagged, ~10k tokens).
3. A task pack's files are read IN FULL, never skimmed. The task's log category is read in full (his own words).
4. Before any decision he may already have ruled on (a pose, a light, a sound, a title style, a script beat):
   `grep -i "<keyword>" log/categories/*.md docs/*.md research/*.md` first. Never guess, never "I think he said".
5. If a task touches two packs, read both. If unsure whether a file matters, OPEN IT. Reading one extra file
   costs less than one wasted render.
6. Mid-chat the task changes (script done, now building) -> open the new pack before the first line of the new work.

## ALWAYS (every chat, in this order)
- CLAUDE.md (auto-loaded), this file.
- [[docs/STUDIO_LOG|STUDIO_LOG]] section 0 "RIGHT NOW" only (the rest is history: grep it when needed).
- [[docs/OVERNIGHT_PLAN|OVERNIGHT_PLAN]]: only if it has unticked boxes (`grep -c "\[ \]" docs/OVERNIGHT_PLAN.md`).
- Tail (~150 lines) of the newest log/sessions/ file. Start the new session file (CLAUDE.md section 2, step 000).
- Video chats: [[docs/DIRECTOR_NOTES|DIRECTOR_NOTES]] in full, [[docs/DECISIONS|DECISIONS]], the topic's own folder (SCRIPT.md, RULES_CHECK.md).

## TASK PACKS (open the one the task needs)

### SCRIPT (new script, rewrite, script engine, ideas, titles)
- [[docs/FORMAT_BIBLE|FORMAT_BIBLE]]: law for how a video is written, cut and shot (checklist in section 8).
- [[docs/CONTENT_ENGINE|CONTENT_ENGINE]]: how ideas are found and turned into scripts.
- [[research/scripting_retention|scripting_retention]]: hook, pacing, retention research.
- [[research/gneef_top20_scripts|gneef_top20_scripts]]: the reference channel's top scripts broken down (formula only).
- [[research/retention_composing_2026-11-26|retention_composing]]: his retention tutorial: composing, leverage.
- [[research/comments_real_2026-11-25|comments_real]]: what real viewers comment on (comment bait source).
- [[research/gneef_metadata|gneef_metadata]]: titles / descriptions / tags.
- research/analytics/README.md + the newest research/analytics/<date>/ (RETENTION_DROPS.md, POST_TIMES.md): where OUR videos lost people.
- Every topics/*/SCRIPT.md that was approved or rejected (the iterations are the lesson).
- Log: log/categories/script_story.md, captions_titles.md.

### SHOT LIST / CAMERA (scene list, shot design, cuts)
- [[docs/FORMAT_BIBLE|FORMAT_BIBLE]] (cut rules), [[research/cinematography|cinematography]], [[research/gneef_camera|gneef_camera]],
  [[research/gneef_first_look|gneef_first_look]], [[research/motion_reference_2026-11-25|motion_reference]], engine/shots.js + engine/camera.js headers.
- Log: log/categories/camera.md.

### WORLD / SETS / LIGHT (new set, location, props, lighting, grade)
- [[docs/WORLD_PLAN|WORLD_PLAN]], [[docs/ENVIRONMENT_PLAN|ENVIRONMENT_PLAN]], [[research/house_design|house_design]], [[research/classroom|classroom]],
  [[research/map|map]], [[research/model_pull|model_pull]], [[research/look_study_2026-11-18|look_study]], [[research/look_quality_gap_2026-11-25|look_quality_gap]],
  [[research/cinematography|cinematography]] (light + grade), engine/look.js header.
- Log: log/categories/world_lighting.md.

### CHARACTERS / FACES / CLOTHES
- [[docs/CHARACTER|CHARACTER]], [[research/faces|faces]], [[research/dynfaces|dynfaces]], [[research/facepacks|facepacks]], [[research/scale|scale]] (not scale_data.json),
  library/cast.json, library/characters.json.
- Log: log/categories/faces_characters_clothes.md.

### POSING / ANIMATION / WALKS
- [[docs/ANIMATION|ANIMATION]], [[docs/POSE_LESSONS|POSE_LESSONS]], [[research/animation|animation]], [[research/animation_r6|animation_r6]], [[research/walk|walk]], [[research/gestures|gestures]],
  [[research/legacy_explainer/ANIMATION_COMPLETE|ANIMATION_COMPLETE]], [[research/legacy_explainer/CLAUDE_animation_rules|CLAUDE_animation_rules]],
  [[research/legacy_explainer/animation_body_mechanics|body_mechanics]], [[research/legacy_explainer/motion_and_pacing|motion_and_pacing]],
  [[research/legacy_explainer/REVIEW_NOTES|old REVIEW_NOTES]].
- Log: log/categories/posing_animation.md.

### VOICE / LIP SYNC
- [[research/lipsync|lipsync]], [[research/voice_options|voice_options]], [[research/voice_fish|voice_fish]].
- Log: grep log/categories/sound_music.md for voice / mouth / lip.

### SOUND / MUSIC / MIX
- [[research/sfx_sources|sfx_sources]], library/sfx_catalog.json, topics/<t>/sfx/cues.json.
- Log: log/categories/sound_music.md.

### RENDER / FRAME CHECK / DELIVERY
- [[docs/FRAME_CHECK|FRAME_CHECK]], [[docs/RULES_CHECK_TEMPLATE|RULES_CHECK_TEMPLATE]], [[research/render_speed|render_speed]], CLAUDE.md section 11.
- Log: grep log/categories/workflow_rules.md for render / frame / check.

### DISSECTING A REFERENCE VIDEO
- [[docs/DISSECT_STORYTIME|DISSECT_STORYTIME]] or [[docs/DISSECT_ANIMATION|DISSECT_ANIMATION]], plus the SCRIPT or POSING pack it feeds.

### PROCESS / RULES QUESTIONS ("what did we decide", "how do I want you to work")
- log/categories/workflow_rules.md, [[docs/DECISIONS|DECISIONS]], [[docs/STUDIO_LOG|STUDIO_LOG]] (grep), [[research/README|research index]].

## REFERENCE ONLY (never read by default; grep when a question points here)
- research/scale_data.json (110 KB raw numbers), [[research/legacy_explainer/xavier_messages_old_chats|old chat messages]] (49 KB),
  legacy/explainer-kit/* (old repo rules: our own engine wins), [[docs/RESEARCH_PROOFS|RESEARCH_PROOFS]], STUDIO_LOG sections 1-6.
- log/sessions/* older than the newest: full verbatim history, grep only.

## KEEPING THE BRAIN ALIVE
- New doc or research file -> add one line to the right pack here, same turn (and research/README.md).
- New Xavier note -> DIRECTOR_NOTES + CLAUDE.md / template (unchanged rule). logturn.py still files every message.
- A file grows past ~40 KB -> split it by topic, keep the pack lines pointing at the parts.
