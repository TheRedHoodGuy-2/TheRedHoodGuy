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

## 2026-11-16 Renderer (OPEN until the laptop benchmark)
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
- Default until measured: Blender as the asset factory, Three.js as the camera.

## 2026-11-16 Reference videos
- From the cloud, YouTube lets Claude list a channel's Shorts with view counts, but blocks downloads (bot check).
  The video files are downloaded on the laptop and shared through a connected folder.
