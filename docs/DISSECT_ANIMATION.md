# DISSECT: CLASS A, ANIMATION (hand-animated Roblox shorts by real animators)

Purpose (Xavier 2026-11-25): take a video apart so completely that we could REMAKE IT FRAME FOR FRAME, and learn from it
what our animation is missing. Not story-time, not AI: real animators. What we take is the CRAFT (posing, timing,
spacing, acting, camera), never their characters, story or shots for publishing.

HARD RULE: every frame is looked at, in order, from frame 1 to the last. No sampling, no "every 5th frame". The per-frame
log (A7) must have a row for every frame with something written in it. A dissection with an empty row is not done.

Tool: `python3 tools/dissect.py <video> --class anim` -> `research/dissect/<name>/`:
`frames/` (every frame), `sheets/` (every frame tiled in order, numbered, cuts marked red), `frames.csv` (auto columns
filled, human columns empty), `shots.csv`, `summary.json`. The human columns are what this document defines.
Then the written dissection goes in `research/dissect/<name>/DISSECTION.md` using the sections below, in this order.

Units: frames (f) at the SOURCE frame rate (the tool reports it; most are 30 or 60, animators often work at 24 and
the platform re-encodes). Times as f and s. Screen positions as % of frame width / height from top-left. Speeds as
% of frame per second. Rig values in OUR R6 terms (engine/poses.js `{ r, o }` + root x/y/z/rx/ry/rz, studs = .34 m).

---------------------------------------------------------------------------------------------------------------------

## A0. Identity and format (once per video)
| Field | How |
|---|---|
| Link, channel, title, date, length, views / likes / comments | page |
| Source fps, encoded fps, total frames, resolution, aspect | tool summary |
| Animation frame rate: on 1s / 2s / 3s / mixed | tool `stepping` per shot (run length of identical frames) + eye |
| Rig: R6 / R15 / custom; proportions changed? (big heads, long legs) | eye |
| Faces: decal / animated decal / 3D; how many expressions seen | eye |
| Render look: Roblox engine / Blender / Moon Animator; outlines; motion blur; DOF; grade | eye |
| Audio: music (name, bpm), SFX density, voice or none | ear |
| On-screen text / captions / title card | eye |
| Premise in one sentence; genre (action / comedy / horror / meme / dance) | watch |

## A1. Shot table (one row per shot; `shots.csv` gives frames in/out + auto camera numbers)
| Field | Values / how |
|---|---|
| shot, f_in, f_out, frames, seconds | tool |
| location / set; time of day | eye |
| who is in frame (count + names); who is the SUBJECT | eye |
| shot size | ECU (eyes) / CU (head) / MCU (chest up) / MS (waist up) / MLS (knees up) / FS (full body) / WS (body small, place reads) / EWS. Map to ours: xclose/close/medium/full/wide |
| subject size | subject height as % of frame height at f_in and f_out |
| angle | eye / low (camera below eyes, looking up, degrees est.) / high / top-down / worm / dutch (roll deg) |
| camera height | ground / knee / waist / chest / eye / above head / overhead |
| lens feel | wide (strong perspective, near objects huge) / normal / tele (flat, background big + blurred); est. vertical fov |
| camera move | static / push / pull / pan L-R / tilt U-D / truck / crane / orbit / handheld / whip / dolly-zoom / shake / zoom (lens) |
| move speed + easing | tool camSpeed %/s; eye: constant / ease-in / ease-out / ease-in-out / snap; does it ever stop? |
| framing in -> out | where the subject's eyes sit (x%, y%) at f_in and f_out; headroom; look room (space in front of the face) |
| layers | foreground object? (what, % of frame) / subject / background; parallax present? |
| focus / DOF | everything sharp / background blur / rack focus (frames) |
| light | key direction (clock face from camera), hard / soft, rim light y/n, contrast low / mid / high, colour of light |
| palette | 3-5 dominant colours (hex), saturation level |
| transition in / out | hard cut / cut on action / match cut / smash cut / whip / dissolve / fade / flash / zoom-through |
| cut motivation | action continues / look / sound hit / beat of music / reaction / reveal |
| screen direction | which way the subject faces / moves; 180-degree line kept or broken (deliberately?) |
| continuity | does the pose / motion at f_out match the next shot's f_in (cut on action)? frames overlapped or skipped |
| shot purpose | establish / action / reaction / insert / reveal / POV / transition / gag payoff |

## A2. Action breakdown (every action of every character in every shot)
An ACTION = one thing a body does with intent (stand up, punch, turn, sit, wave, fall, grab, flinch, laugh).
| Field | How |
|---|---|
| shot, character, action verb, WHY (want / feeling right now) | eye + context |
| phase frames | write the frame number of each that exists: `A0` anticipation start, `A1` anticipation extreme, `X` action start, `B` breakdown(s), `C` contact / impact / extreme, `O` overshoot peak, `F` follow-through end, `S` settle end, `H` hold start-end |
| phase lengths | frames per phase; ratio antic : action : settle (e.g. 6 : 3 : 8) |
| spacing | per phase: slow-in, slow-out, even, snap (big jump between two frames); draw it as the distance the hand / head / hips travel each frame (tool residual motion helps) |
| arcs | path of head, hands, hips: arc / straight / figure-8; does the path curve the way a real joint would |
| overlap / offset | which part moves first and by how many frames: e.g. hips f0, torso +2, head +3, arm +4, hair +6 |
| drag / follow-through | parts that trail and settle late (hair, hood, hands, accessories): frames late, overshoot amount |
| squash / stretch (R6 form) | arm sliding out of the shoulder (o), root drop / rise, body lean beyond rest, scale tricks; amount |
| weight | where the centre of mass is over the feet; weight shift before a step; landing compression frames |
| line of action | one curve through the body? C / S / straight; direction |
| silhouette | readable as a black shape? arms clear of the body? (yes / no + why) |
| asymmetry | twinning? (both arms / legs doing the same) yes / no |
| exaggeration | 1 (realistic) .. 5 (cartoon); compare to the real-life action |
| secondary action | what else the body does (head shake while walking, hand fidget) |
| stepping | on 1s / 2s / 3s during this action; smear frames / multiples / speed lines / motion blur used? |
| impact FX | camera shake (amplitude % of frame, frames, decay), flash, particles, dust, freeze (frames) |
| reaction | who reacts, how many frames after the cause, what the reaction is |

## A3. Key poses (the remake data)
For EVERY key and extreme (every A1, C, O, S and every hold) one entry:
| Field | How |
|---|---|
| frame, character, phase letter | from A2 |
| facing | body yaw relative to camera (0 = facing camera, 90 = profile showing its left side, 180 = back) |
| root | lean fwd/back (rx deg), tilt (rz), turn (ry), drop / rise (y in studs), shift (x, z) |
| each limb armL armR legL legR | direction it points (fwd / back / up / down / out / in + degrees), slid out of the joint? (o), hips used as knees? (legs shifted up / forward) |
| head | down / up / turn / tilt degrees; leading or following the body |
| hands | what they touch / hold; contact point on the prop |
| feet | planted / lifted / sliding; which foot carries the weight |
| props | state and position |
| pose code | our `{ r, o }` pose written out (estimate), tested on `tools/posesheet.py` against the frame side by side |
| what makes it work | one line (e.g. "head drops 2 frames before the shoulders: reads as giving up") |

## A4. Face track
| Field | How |
|---|---|
| expression spans | frame ranges with our emotion names (engine/faceset.js EMOTIONS) |
| change timing | frames between the THOUGHT (the cause) and the face change; brows -> eyes -> mouth order and frame gaps |
| blinks | frames of each blink, length in frames, why (new thought / cut / look) |
| eye direction | where the eyes look per span; eye darts (count, frames) |
| mouth / lip sync | flap / visemes / none; shapes per second; which character talks |
| face vs body sync | does the face lead or lag the body (frames) |

## A5. Locomotion (any walk / run / jump / climb)
frames per step, stride (studs), bounce (studs), arm swing (deg), lean (deg), foot lock (feet planted or sliding),
contact / down / passing / up frames, how turns are done (step-turn frames, pivot foot), start and stop of the cycle
(anticipation step, stopping step), speed changes.

## A6. Physics, props, FX
object paths (arc, gravity feel: frames to fall a body height), bounces (count, height decay), hair / cloth secondary
motion, particles (type, count, life frames), screen shake (amplitude, frequency, decay frames), slow motion (speed %),
time remaps, impact frames (white / black frames, count).

## A7. Per-frame log (EVERY frame; `frames.csv`, human columns)
| Column | Meaning |
|---|---|
| f, tc, shot, cut | tool |
| dup | tool: identical to previous frame (stepping / hold) |
| cam_tx cam_ty cam_zoom cam_roll | tool: camera motion this frame (px at 144 wide, % zoom, deg) |
| subj_motion, still | tool: character motion (flow residual) and still flag |
| luma, sat | tool |
| phase | per visible character: `name:LETTER` from A2 (A0 A1 X B C O F S H), `-` if not acting |
| face | expression of each visible character if it changed this frame |
| event | what happens in this frame in plain words (or `same`) |
| defect | clipping / pop / glitch / sliding foot / off-model, if any |
| note | anything worth stealing |

## A8. Numbers summary (tool + A2 totals)
cuts per 10 s; shot length mean / median / min / max; % frames camera moving, character moving, both, still; longest
still run (frames); camera speed p50 / p90; handheld jitter; stepping share (1s / 2s / 3s); actions per 10 s; mean
antic / action / settle frames and their ratio; hold lengths (mean, max) and whether holds are moving holds; overlap
offsets (mean frames between hips and head, head and arms); arcs share; exaggeration mean; blinks per 10 s; expression
changes per 10 s.

## A9. What we learn (written last)
1. Techniques to steal: each with the frame numbers that show it and how we do it in our engine (actor.js keys,
   poses.js `{ r, o }`, camera.js / shots.js).
2. Rules for docs/ANIMATION.md / POSE_LESSONS.md (new or changed), each with its frame proof.
3. Our gaps: side by side with our latest video, the same metric for both (A8 numbers + A10 scores).
4. REMAKE SPEC: shot list (A1) + key poses as pose code (A3) + timing chart per action (A2 frames) + face track (A4).
   Test: rebuild the first 3 s from the spec and compare frame by frame with the original; anything that doesn't match
   means a metric was missed; add it here.

## A10. Score (1-5, ours vs theirs, per dimension)
posing (silhouette, line of action, asymmetry) / timing (antic + follow-through present, holds alive) / spacing
(ease, snap where needed) / overlap / weight / arcs / acting (face + body tell one thought) / camera (purposeful, always
moving) / cutting (on action, rhythm) / staging (one subject, readable) / FX + physics / overall appeal.
