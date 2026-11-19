# SFX bank

Real recorded sound effects supplied by Xavier, one file per sound, reused across every video.
`tools/sfxmix.py <topic>` mixes them onto the narration from `topics/<topic>/sfx.json`.

Rules (Xavier, 2026-11-10)
- Only sounds from this folder go into renders. NEVER synthesize a sound (no sine pings, no code-made beeps).
- A video needs a sound that isn't here: ask Xavier for it by its exact file name, he fetches and renames it, it goes in here for good.
- Names: lowercase, underscores, no numbers unless it's a variant (`pop`, `pop_2`). Any format: wav, mp3, ogg, m4a.
- Keep each file trimmed to the sound itself (no long silence before it).
- Before a new file goes in: LISTEN to it (transcribe it with faster-whisper and check its length). A 23 s "drawer_short" from 2026-11-10 was really the voice take, and it put a second "why did he come in here" into the mix.

## Catalog
Add a line when a file lands: `name` what it is (source).

All trimmed (silence cut front and back) on 2026-11-10, from Xavier.
- `ding` bell hit, 1.2s: "new room" bell, any reveal
- `level_up` bright rising chime, 1.4s: idea / remembering / success
- `woosh_one` tiny quick swipe, 0.2s: fast cuts
- `woosh_two` short whoosh, 0.4s: cuts, small moves
- `woosh_three` short whoosh, 0.2s: cuts
- `long_woosh` whoosh, 0.7s: camera fly-ins (into Brain HQ)
- `swish_woosh` soft swish, 0.9s: transitions
- `footsteps` hard-floor steps, ~0.6s apart, 5.2s: use `trim` (1.2 = 2 steps)
- `fridge_open` fridge door open, 0.8s
- `drawer_open` drawer slide open, 0.5s
- `drawer_close` drawer shut, 0.9s: slams too
- `paper_crumple` paper crumple, 3.6s: use `trim`
- `iphone_low_battery` iPhone low battery chime, 0.6s

## Starter list (asked for 2026-11-10)
Transitions: `whoosh`, `whoosh_fast`, `swoosh_in`, `pop`, `zoom_in`
UI / Brain HQ: `button_click`, `lever_pull`, `ding`, `alarm`, `paper_stamp`, `paper_shred`, `drawer_slam`, `drawer_open`, `computer_beep`
Body / people: `footsteps`, `gasp`, `scream`, `yawn`, `laugh_crowd`, `crowd_murmur`, `body_thud`
House: `door_open`, `fridge_open`, `cabinet_open`
Comedy: `record_scratch`, `boing`, `cartoon_slip`, `crickets`

Added 2026-11-12 (hypnic), from Xavier, trimmed + transcribe-checked (no speech):
- `alarm` danger siren loop, 5.8s: Brain HQ panic, use `trim`
- `power_down` power-down whir, 1.3s: things relaxing / shutting off
- `chair_scrape` chair legs skidding on a hard floor, 1.4s
- `body_thud` short dull thump, 0.3s: body jolts, bumps
- `snore` snoring loop ("mimimi" cartoon snore), 4.8s: use `trim`
- `coffee_splash` glass/mug spill + splash, 3 takes in 7.3s: use `trim` 2.6 for one
- `desk_bang` desk banging, 4 hits in 4s: use `trim` 0.9 for one hit
- `button_slam` vine boom, 1.1s: big button slams, dramatic hits
- `coffee_splash_hit` = `coffee_splash` cut to start on the floor impact (0.28 s in), 2.3s: cue it at the exact frame the mug touches down

Added 2026-11-12 (comeback), from Xavier, trimmed + transcribe-checked:
- `bruh` "bruh", 0.5s: deadpan fail beats
- `who_invited_this_kid` "Oh my god bro, hell no man..." 9.8s, swears after 3.1s: use `trim` 3.1 (clean part)
- `crowd_ooh` crowd "oooahhh" at a burn, 5.5s: use `trim` ~2.6
- `vine_boom` vine boom, 1.1s (second take next to `button_slam`)
- `camera_shutter` iPhone camera shutter click, 0.3s: someone snapping a photo
- `laugh_crowd` crowd laughing, 4.5s: use `trim` ~3
- `door_bang` fist banging on a door, 4.0s: use `trim` ~1.4
- `shower_running` shower water, 31.4s loop bed
(`tools/sfxmix.py`: cues with `"duck": true` dip to the script.json `"sfx_duck"` level under the voice; only crowd / voice-like sounds get it, the rest stay normal. 2026-11-12)
- `buffering` loading / lost-connection jingle, 2.6s: use `trim` ~.7 for a lag beat
- `windows_error` Windows XP critical error, 0.8s
- `clock_tick.wav` (Xavier 2026-11-14) wall clock ticking, one tick per second, first tick at 0.0
- `tally_click.wav` (Xavier 2026-11-14) one hand tally counter click (cut from his rapid-click clip)
- `yawn.wav` (Xavier 2026-11-14) one big yawn, 3.1 s
- `controller_mashing.wav` (Xavier 2026-11-14) game controller buttons mashed, 10.6 s
- `fps_gunfire.wav` (Xavier 2026-11-14) FPS game gunfire, 8 s (from his 130 s game_shooter clip, 1-9 s)
- `crickets.wav` (Xavier 2026-11-15) crickets chirping, 5 s (awkward silence)
- `scream.wav` (Xavier 2026-11-15) "nuagghhhh" scream, 3.5 s
- `slushie_slurp.wav` (Xavier 2026-11-15) straw slurping noises, 6.9 s
- `shiver.wav` (Xavier 2026-11-15) shivering dog meme "brrr", 4.9 s
- `gulp.wav` (Xavier 2026-11-15) gulp gulp drinking, 3.5 s
- `snow_wind.wav` (Xavier 2026-11-15) cold snowy wind ambience, 9.8 s
