# DECISIONS: what is settled, and why

## 2026-11-16 Repos
- `explainer-kit` stays as it is (old explainer pipeline, reference only). New work lives here, with its own rules file,
  so old habits do not load into new chats. Carried over: only what is written in this repo.

## 2026-11-16 Channel direction
- Switch from body / "why" explainers (1k to 3k views) to storytime, modelled on a reference AI-made storytime channel.
- Old stats to beat: tickle 69.6% stayed (18k views), hypnic 68.1% (8.6k); losers 43 to 48% stayed.
  Same models and lighting on both sides, so topic and the first second made that gap. Format is the lever, polish protects it.

## 2026-11-16 What Claude said no to
- Remaking a reference video shot for shot with our characters and posting it. Formula yes, clone no.
  One private calibration remake is fine and is never posted.
- Analysing every frame of every video. Instead: every shot and cut, 4 to 6 fps inside shots, full frame rate on fast
  action, word-timed transcript, audio. Same information for about a tenth of the usage.
- Promising views.

## 2026-11-16 Renderer: SETTLED, Three.js in the cloud
Measured in the cloud workspace (2 CPU cores, no GPU), Blender 5.3 via `pip install bpy`, R6 rig with bevels + subsurface skin:
| Renderer | Per frame at 1080x1920 | 600-frame video |
|---|---|---|
| Three.js (explainer-kit, SwiftShader) | about 7 s | about 70 min |
| Blender Eevee (software GL), bare character | 68 s | 11+ hours |
| Blender Cycles CPU | about 4 min (61 s at 540x960, 48 samples) | about 40 hours |
- Same script as the laptop benchmark (`tools/laptop/bench_eevee.py`: character + 190-object room, 3 lights) in the cloud:
  Eevee 58 to 66 s a frame at 1080x1920 on llvmpipe (software GL). That is the number the laptop has to beat.
- Blender in the cloud is fine for stills and asset work (import, bevel, subdivide, bake, export), not for finals.
- Blender finals only make sense on the laptop's Radeon chip. `tools/laptop/run_bench.bat` measures it.
- The laptop bridge shell is a Linux VM, not Windows: it cannot start the installed Blender. So laptop renders need a
  small render agent Xavier starts on Windows (a .bat that runs Blender on jobs dropped in a shared folder).
- Xavier 2026-11-16: the laptop is not good enough and he does not want the extra complication. Stay on Three.js in the
  cloud until he buys a laptop with a graphics card; revisit Blender finals then (`tools/laptop/` is kept for that day,
  the benchmark was never run).
- So: Three.js is the camera. The look (bevels, rough-plastic skin with fine texture, faked subsurface glow, baked light)
  is built inside Three.js. Blender is only used silently in the cloud for asset prep (import, bevel, subdivide, bake, export).

## 2026-11-16 Reference videos
- From the cloud, YouTube lets Claude list a channel's Shorts with view counts, but blocks downloads (bot check).
  The video files are downloaded on the laptop and shared through a connected folder.

## 2026-11-18 17:09 (Xavier)
- Video length: as long as the script needs, hard max 3:30.
- Voice: a "Roblox male" and a "Roblox girl" voice (the Roblox-style voices that go viral). Provider to set up.
- Scale draft NOT approved: Xavier can't tell if it is accurate -> Claude must verify it against real Roblox maps / Gneef
  frames (measured, not guessed) before asking again.
- 2026-11-18 17:18 Scale: v2 (measured from 47 real Roblox builds, research/scale.md) is the standard. Xavier left it
  to Claude ("up to you"); Claude chose the measured version.

## 2026-11-19 Camera system + frame rate
- Videos render at 30 fps (smoother camera glides; ~25% more render time than 24, worth it).
- engine/camera.js is the camera: shots of spline keys, ONE ease per shot ('glide': short ease in, steady cruise, short
  ease out, never a stop at a middle key), never-still drift, 0.25 s dissolves between shots (hard cuts inside a scene),
  trauma shakes on impacts (rotation only). Static shadows are not re-rendered when only the camera moves.
- SFX bank v1: 688 Mixkit sounds (commercial use, no attribution) in 39 categories, on the laptop at
  Documents\TheRedHoodGuy\sfx_bank (298 MB, not in git); catalog in library/sfx_catalog.json.

## 2026-11-19 04:16 Faces (Xavier)
- REJECTED: realistic 3D dynamic heads (Man Face / Silly Fun mesh with moving parts). Never use them.
- Faces are 2D-drawn faces on the R6 head that animate (blink, mouth, brows), redrawn with new proportions: eyes closer
  together, lower on the head, closer to the mouth. Eye style still open (he sends a reference).
- The research before/after look (OTS, long lens + DOF, designed key / rim, asymmetric posing, grade) is approved as the
  direction for every shot.

## 2026-11-19 04:45 Faces come from AI image sheets (Xavier)
- Code-drawn face kits (faces2 / faces3 / facestyles) are rejected as final art. Faces = AI-generated expression sheets
  per style (prompt pack: docs/face_prompts/), made by Xavier in Gemini / ChatGPT, rigged by Claude (slice, key, align
  to the decal layout, swap per emotion / viseme).

## 2026-11-19 07:17 Face families (Xavier)
- Every bank character has `faceSet` in library/characters.json (engine/faceset.js): ai:05 / ai:11 / ai:13 / ai:16 (his
  AI sheets, 32 emotions + 16 mouths + 16 eye states), kit:<style> (old repo face kit, 80 expressions), classicA /
  classicB (Classic Roblox Facepack, layered eyes / mouths / brows). One emotion + viseme vocabulary for all of them.
- The two mains keep their own faces (old repo kit/faces.js), not given to anyone else.
- CLASSIC_FACES zip (647 single faces) = background extras only (they cannot change expression).
- kit:scribble dropped (its grey cheeks read as bruises).

## 2026-11-19 10:01 Niche + script rules (Xavier)
- NICHE: popular Reddit stories (Xavier finds them) remade into the "In this world / town" impossible-rule format. When
  there is no good Reddit story, Claude writes an original one.
- LENGTH: whatever the script needs, never past the max (95 s, FORMAT_BIBLE). If a story would run long, cut it at a
  CLIFFHANGER. Most scripts BUILD TOWARD a cliffhanger that is never resolved (his example: the village eye that has not
  blinked in 3 days, ends mid-blink).
- THE 7-YEAR-OLD CHECK: at every block of a few seconds ask "would a 7-year-old still be watching?"; a block that fails
  is rewritten. Every research rule (retention, hook, composition, posing, faces, frame check) applies to every script
  and every frame. No skills needed: the rules live in the docs + CLAUDE.md.

## 2026-11-25 03:44 (Xavier)
- Script 07 "Do-Overs" approved (topics/do_overs/).
- FINALS: render at 1440x2560 and deliver at 1440x2560 (no downscale); encode at a high bitrate (~15 Mbps, x264 slow,
  -b:v 15M -maxrate 20M -bufsize 30M) so TikTok / YouTube start from the best file.
- TEXTURES: after he confirms the review video, every texture used in THAT video is upscaled hard (AI 4x, Real-ESRGAN)
  before the final render; Poly Haven pulled at 2K/4K; engine-drawn canvases regenerated at 2-4x.
