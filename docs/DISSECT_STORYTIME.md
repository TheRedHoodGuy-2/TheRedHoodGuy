# DISSECT: CLASS B, STORYTIME (our niche: "In this town / world..." Roblox narrated shorts)

Purpose (Xavier 2026-11-25): take a niche video apart so completely that we could REMAKE IT FRAME FOR FRAME, and know
WHY it holds people: script, hook, camera, cuts, acting, sound, text, look, ending / loop. Study for FORMULA only:
never republish their script, premise, names or shots (CLAUDE.md section 3).

HARD RULE: every frame is looked at, in order, from frame 1 to the last; every word of the voice is timed. The
per-frame log (B13) has a row for every frame with something written in it. Empty rows = not done.

Tool: `python3 tools/dissect.py <video> --class story` -> `research/dissect/<name>/`: `frames/`, `sheets/` (every frame
in order, numbered, cuts red), `words.json` (every word with start / end), `frames.csv` (auto columns + the word being
spoken on each frame; human columns empty), `shots.csv`, `summary.json`. Written dissection: `DISSECTION.md` in the
same folder, sections in this order. All the CLASS A shot / action / pose / face metrics (docs/DISSECT_ANIMATION.md
A1-A6) apply to the acting here too, at a lighter depth: A1 for every shot, A2 + A3 for every acted beat.

---------------------------------------------------------------------------------------------------------------------

## B0. Identity and performance
link, channel (subs), title, date, length, views, likes, comments, shares if shown, views per day since upload;
series / part number; is it a remake of a Reddit / known story (source if known).
Title: exact text, word count, structure (rule / question / statement / "POV"), emoji (which, where), hashtags, caps.
Description and tags: text, hashtag block (same every video?), links.
Frame 0 as the thumbnail: what it shows (research/gneef_metadata.md has the channel-level findings).

## B1. Script (from words.json; the transcript written out in full in DISSECTION.md with timestamps per sentence)
| Metric | How |
|---|---|
| words, sentences, words per sentence (mean / max) | count |
| WPM overall + per 5 s window | words.json |
| pause map | every gap > 0.3 s: where, how long, why (beat, punchline, scene change) |
| reading level | Flesch-Kincaid grade; the "7-year-old check" per 5 s block (would they still watch? y / n + why) |
| narrator | who (age, gender), POV (1st / 3rd), tense, voice (TTS / human, which voice, pitch, energy) |
| named characters | count, names, who speaks (tagged lines: who, emotion, length) |
| STRUCTURE TIMESTAMPS (s and % of length) | the rule stated (done at), "You see" (at), life-with-the-rule gags (count + each time), "But I" turn (at), plant (what, at; paid off at), crisis (at), clock / countdown (what, first at, updates at), escalations (each at), climax (at), ending type: cliffhanger shown / cliffhanger said / twist / punchline / reveal / loop line |
| open loops | every question the script raises: opened at t, closed at t (or never). Count open at any moment |
| reason-to-stay timeline | every 2-5 s window: what keeps you (gag / question / reveal / countdown / escalation / emotion / meme beat); gaps > 5 s with nothing = flagged |
| one picture per sentence | does every sentence map to one shot / image? (list the sentences that don't) |
| swears, memes, catchphrases, callbacks | where, what |
| emotional curve | per 5 s: feeling the viewer should have (curious / laugh / tense / sad / shocked), intensity 1-5 |

## B2. HOOK: frames 0 to 3 s, every frame written up (30 fps = 90 frames)
| Metric | How |
|---|---|
| frame 0 | exactly what is on screen: who, doing what, mid-action y / n, camera moving y / n, text on screen, face visible, colour |
| first sound / first word | ms from start (voice from 0.0?), music from 0? SFX at 0? |
| what is OUT OF PLACE | the thing that makes the brain ask "what?" (impossible rule shown, danger, absurd image); at which frame it's readable |
| premise readable by | the frame where a new viewer understands the rule / situation |
| visual changes in 0-3 s | count cuts + big pose / camera changes; first cut at frame |
| title card | present? text, font, size (% width), position (y %), colour, in / out frames, animation |
| caption at 0 | style, words, timing |
| curiosity gap | the open question at 3 s, in one sentence |
| hook type | rule statement / in-media-res / shock image / question / countdown / cold open on climax / POV |

## B3. ENDING + LOOP: last 3 s, every frame written up
final line (words, time), final image, last cut (frame), is the cut mid-action?, silence at the end (s), music at the
end, does the LAST frame flow into the FIRST frame (image match, sentence match, sound match): loop score 0-3, what
makes a viewer rewatch (hidden detail, twist, unanswered question, fast payoff), end screen / text / "part 2".

## B4. Shot table (every shot; A1 fields plus)
| Extra field | How |
|---|---|
| narration covered | the exact words over this shot (from words.json) |
| image vs words | literal (shows exactly what is said) / reaction / insert (object) / ahead (shows before said) / behind / contradiction (gag) |
| shot function | establish / action / reaction / insert / reveal / POV / transition / gag payoff / countdown |
| world density | background life (people, cars, animals), set dressing, empty horizon y / n |
| extras | count, do they move, what they do |
| location change | new place y / n; how shown (establishing shot, cut, dissolve) |

## B5. Camera + edit numbers (tool + shot table)
cuts per 10 s (each window), first-shot length, shot length mean / median / min / max, longest shot (what beat),
move type share (push / pull / pan / tilt / orbit / handheld / static), push speeds %/s, % frames camera moving,
character moving, both, still; longest still run; handheld jitter; transitions used (cut / dissolve / whip / flash /
zoom punch) and where; speed ramps; shake on impacts (amplitude, frames).

## B6. Text and graphics
captions: font, weight, size (% width), position (y %), colours (text / outline / highlight), words per caption,
active-word effect (colour / scale / bounce), sync vs voice (lead / lag ms), line breaks; title card (B2); in-world text
(signs, phones, wrist numbers): size, readable on a phone y / n, how long on screen; emojis, stickers, arrows, circles,
zoom punches, freeze frames, colour drains, flashes: what, when, why.

## B7. Sound
voice: TTS / human, which voice, pace, energy, processing; music: track, genre, bpm, level under the voice (dB est.),
ducking, does it change at the turn / climax / end; SFX: every cue with time, what makes it (on screen y / n), meme
sounds (which, when, why it lands); silence moments (where, how long); loudness (LUFS); sound on cuts (whoosh, hit).

## B8. Characters and acting
cast (mains same across their videos? design: skin, hair, clothes), faces (style, expression count, changes per 10 s),
lip sync (who flaps, how), acting density (% of shots where someone is clearly acting vs standing), reaction shots
after reveals (y / n, frames after), pose reuse (same pose seen in their other videos?), physical comedy beats, how
emotion is shown (face only / body / both). A2 + A3 for every acted beat.

## B9. Look
per location: brightness, saturation, black, contrast, warmth (tools/lookmeter.py numbers), key light direction, time
of day, DOF, grade / filters, render quality (texture sharpness, resolution, bitrate), what looks "game" vs "film".

## B10. Pacing map
one line per second: second, words spoken, cuts, what happens, intensity 1-5, reason-to-stay type. Then: where the
intensity dips, and what they do right before a likely swipe point.

## B11. Retention link (OUR analytics: research/analytics/)
For our own videos: YouTube Studio "Stayed to watch %" (the first-seconds swipe test: our hook) and "Average
percentage viewed %" (over 100 = rewatching = loop working) per video, beside the B2 / B3 / B5 numbers of that video.
Build the table: hook features vs stayed-to-watch, ending / loop features vs average % viewed, length vs both.
Every new dissection of a reference video adds its B2 / B3 features to the same table so we can see which features
the winners share.

## B12. What we learn (written last)
1. Formula points with their timestamps (what they do at 0 s, 3 s, ~20 %, ~35 %, the turn, the end).
2. Rules for FORMAT_BIBLE / CLAUDE.md, each with proof (time / frame).
3. Our gaps: the same metrics for our latest video side by side (B2, B3, B5, B10 especially).
4. REMAKE SPEC (formula level, not their content): beat list with times, shot list with sizes / moves / lengths,
   caption + title spec, SFX cue list, music level. Test: rebuild their first 3 s structure with OUR story and compare
   frame by frame (hook timing, first cut, readable-by frame).

## B13. Per-frame log (EVERY frame; `frames.csv`, human columns)
| Column | Meaning |
|---|---|
| f, tc, shot, cut, dup, cam_*, subj_motion, still, luma, sat | tool |
| word | tool: the word being spoken on this frame (words.json) |
| caption | caption text on screen |
| on_screen_text | title / signs / numbers |
| event | what happens in this frame (or `same`) |
| acting | who is acting, phase letter (A0 A1 X B C O F S H) |
| face | expression changes |
| sfx | sound starting this frame |
| hook_or_loop | for frames 0-3 s and the last 3 s: why this frame matters |
| note | worth stealing |

## B14. Score (1-5, ours vs theirs)
hook (frame 0 + readable-by) / script density (reason-to-stay gaps) / clarity (one picture per sentence) / pacing (cuts,
WPM) / camera (always moving, purposeful) / acting (faces + bodies) / world (density) / text (captions, title) / sound /
look (crispness, light) / ending + loop / overall.
