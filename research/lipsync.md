# Lip sync + facial animation (2026-11-19, Xavier: "proper lip sync, matching the audio down to the pronunciation")
Sources: Rhubarb Lip Sync docs (DanielSWolf; mouth shapes A-H, X; dialog file); Toon Boom Harmony lip-sync docs (same
A-G/X chart used by the industry); Pluralsight / Digital Tutors "Proven tips for believable lip sync"; highonfilms lip
sync techniques; AnimSchool blog (Scott McWhinnie: eye / brow / lip timing counted from The Incredibles 2); animation
apprentice blog; Dartmouth After Effects lip sync guide; arts.ac.uk lecture notes on blinks and eye darts; CG Channel
"10 subtle tricks"; forced-alignment comparison (Rousso et al. 2024: MFA vs WhisperX vs MMS).

## How the mouth gets its shapes (not by guessing)
- English has 40+ phonemes but only ~9 mouth looks (visemes). The industry chart: A = M B P (closed), B = most consonants
  (K S T D N) + EE, C = EH / AE, D = AA (wide open), E = AO / ER (rounded), F = UW / OW / W (pucker), G = F / V (teeth on
  lip), H = L (tongue up), X = silence. Our AI mouth sheet C has every one of these (+ smile / shout / gasp extras).
- **Rhubarb Lip Sync** (open source, used in Harmony / Blender / Moho pipelines) listens to the recording, recognises the
  phonemes and outputs timed mouth cues. Giving it the TRANSCRIPT (`-d`) makes it far more reliable (it then aligns
  known words instead of guessing them). Installed at /opt/rhubarb, wrapped by engine/lipsync.js.
- Forced aligners (Montreal Forced Aligner, WhisperX) give phoneme / word times too; MFA was the most accurate in a 2024
  comparison. Rhubarb already does recognition + mouth mapping in one step, so it is the tool; MFA is the fallback if a
  line ever comes out wrong.

## Rules (what separates real lip sync from "random mouth flapping")
1. **Lead the sound by ~1 frame** (1-2 frames at 24-30 fps): the eye reads the shape in time with the ear.
2. **Hold every shape at least 2 frames**; a 1-frame shape just flickers ("typewriter mouth").
3. **Always hit the closures**: M, B, P must visibly close for 2+ frames, even in fast speech.
4. **Don't animate every phoneme**: in fast speech blend / drop the tiny ones; the jaw follows stressed syllables.
5. **Return to rest** in pauses; silence shows the character's own mouth for the current expression.
6. **The face acts, the mouth talks**: keep the expression (eyes, brows) and swap only the mouth inside it.
7. **Check**: watch it muted (do the shapes read as speech?), then at half speed with sound (any drift?).

## Eyes and brows (keep the face alive)
- **Blinks are motivated**: on a new thought / line, a change of look direction, a head turn or a cut; otherwise every
  2-5 s. Timing: close fast (~2 frames), hold 1, open slower (2-3 frames). We use half-closed / closed frames from sheet D.
- **Eye darts** are 1-2 frames with no in-between (eyes lock on). A listener's eyes move in a triangle (eye, eye, mouth).
- **Brows** lead the expression change and move slower than the eyes; offset left / right brow; overshoot slightly.
- **Pupils / brows as separate layers** (tools/eyerig.py) give glances and brow acting without new drawings: done for
  style 05 (white eyes). All-dark chibi eyes (13, 16) use the sheet D glance frames instead.

## Built (2026-11-19)
- engine/lipsync.js: talkTrack (Rhubarb cues -> our mouths with lead, 2-frame minimum, closures protected),
  blinkTrack / blinkTimes (motivated blinks). scenes/lipsync_test.js + topics/lipsync_test (Rhubarb json + audio).

## 2026-11-19 09:21: Xavier: the phoneme lip sync looked "extremely bad". Why, and the fix
Diagnosis (from the frame-by-frame mouth strips): (1) the 16 sheet-C mouths are separate drawings of different sizes
and styles, so the mouth jumped between unrelated pictures ~8 times a second; (2) Rhubarb's most common shape (B, most
consonants) is a clenched-teeth rectangle in our sheets, so she looked like she was grimacing; (3) talking mouths
replaced the expression's own mouth; (4) Ava's face was turned too far to read.
Fix = ANIME FLAP ("kuchipaku"): anime uses about three mouth drawings (closed / half / open) instead of matching every
sound, and audiences accept it (ANN forum discussion of Japanese lip flaps; serifu explainer). Western dub tools and
PNGtuber / VTuber apps drive open / closed from the voice's loudness with a threshold (After Effects audio-to-keyframes
expressions, Wwise meter lip sync, veadotube issues: flicker between syllables and noise opening the mouth).
Our version (tools/flap.py): loudness in the 300-3000 Hz speech band per frame, normalised to the loudest syllable
within 0.5 s; > -6 dB open, > -16 dB half, below = closed (the dips BETWEEN syllables close it, so it flaps per syllable,
measured, not random); M B P closures from Rhubarb; 1-frame lead; 2-frame minimum; closed = the expression's own mouth,
so the face keeps its acting. Timing beats shape accuracy (highonfilms): shapes placed exactly on waveform peaks read late.
