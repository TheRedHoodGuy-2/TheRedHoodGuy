# Face sheets: AI prompt pack

## How to use

1. Pick one style from `refs/` (01 to 25). Each PNG is that Roblox face. Styles with more than one PNG side by side are the same style shown with different expressions.
2. Open Gemini (image generation) or ChatGPT (image), attach that ONE reference PNG, and paste **Prompt A** with the style's line from the list at the bottom filled in where it says `[STYLE]`.
3. In the same chat, send **Prompt B**, then **Prompt C**, then **Prompt D**. Staying in the same chat keeps the style consistent.
4. If a sheet comes back wrong (the grid breaks, the face moves, or the style drifts), say: "Redo it. Keep the exact same grid, face position, size and line style as the reference. Fix: [what's wrong]."
5. Save each sheet as `<number>_<A|B|C|D>.png` (for example `06_A.png`) and send me all four per style. I slice, clean, align and rig them.

Four sheets per style: A + B are 32 full expressions, C is 16 mouth shapes for lip sync, D is 16 eye / brow states for blinks and glances.

---

## Prompt A (full faces 1 to 16)

```
I'm attaching a reference image of a Roblox avatar face. Make an EXPRESSION SHEET for this exact face design, in the exact same art style.

Style of this face: [STYLE]

KEEP IDENTICAL IN EVERY CELL (this is the most important rule):
- The same character: same eye shape and construction, same iris and highlights, same lashes, same brow style, same mouth style, same blush, same line thickness, same colours.
- The same placement: eyes, brows and mouth sit at the SAME position and SIZE in every cell as on the reference face. Only the expression changes. The cells must be swappable like animation frames, with nothing jumping around.
- Exactly the same face width and eye spacing in every cell.

LAYOUT:
- One square image, as large as possible (2048 x 2048 if you can).
- A 4 x 4 grid of 16 equal square cells, separated by thin straight white lines.
- In each cell: ONLY the facial features (eyes, brows, mouth, blush, plus the extras listed below) drawn flat and front-on, as if the front of the head were a flat square.
- Background of every cell: solid flat light grey #D9D9D9, with no shading, no texture, no gradient, no vignette, no drop shadow.
- No head outline, no 3D head, no hair, no ears, no neck, no body, no clothes, no props, no scenery.
- Clean crisp edges, high resolution, no blur, no noise, no watermark, no signature.
- Put a small black number (1 to 16) in the top-left corner of each cell, far away from the face. No other text anywhere.

THE 16 EXPRESSIONS, in this order (left to right, top to bottom):
1. Neutral: exactly the reference face.
2. Happy: gentle closed-mouth smile, eyes slightly squinted, brows relaxed up.
3. Big laugh: wide open mouth (inside, teeth, tongue in this style), eyes squeezed shut as upward arcs.
4. Giggle: eyes closed as happy "^ ^" arcs, small open smile, a bit more blush.
5. Sad: inner brow ends raised, eyes looking down with drooping lids, small frown.
6. Crying: like Sad, plus tears streaming from both eyes and a wobbly open crying mouth.
7. Angry: brows pulled down hard toward the nose, narrowed eyes, clenched teeth showing.
8. Furious: even stronger than Angry, plus a red cartoon anger-vein mark on the forehead and a shouting open mouth.
9. Shocked: eyes wide open with tiny pupils, brows very high, tall open "O" mouth.
10. Scared: eyes wide, brows raised and pinched together, a wavy trembling open mouth, a sweat drop on the side of the forehead.
11. Nervous: awkward wobbly smile, a sweat drop, eyes glancing to the side.
12. Smug: half-lidded eyes looking to one side, one brow raised, a one-sided smirk.
13. Wink: one eye closed (a curved lash line), the other open, a cheeky smile.
14. Love: pink heart-shaped eyes, a big happy smile, extra blush.
15. Confused: one brow up and one brow down, eyes looking up to one side, a squiggly mouth.
16. Sleepy: eyes nearly closed (heavy lids), brows low and relaxed, a small flat or yawning mouth.
```

## Prompt B (full faces 17 to 32)

```
Same face, same art style, same rules and same layout as the last sheet (4 x 4 grid, flat #D9D9D9 background, features at the SAME position and size as the reference, numbers in the top-left corners, no other text).

THE 16 EXPRESSIONS, in this order:
17. Surprised: eyes open a bit wider, brows up, a small round "o" mouth.
18. Terrified: screaming mouth wide open, eyes huge with tiny pupils, brows high and pinched, cartoon fear lines on the forehead.
19. Disgusted: nose and eyes scrunched, one side of the upper lip raised, mouth pulled to one side.
20. Annoyed: flat unimpressed half-lidded eyes, flat brows, a flat straight mouth.
21. Suspicious: side-eye (both pupils to one side, lids lowered), one brow lowered, a tight pressed mouth.
22. Embarrassed: heavy blush over both cheeks, eyes looking away and down, a small wobbly smile.
23. Excited: sparkling eyes (star or shine highlights), brows up, a big open grin.
24. Proud: eyes closed contentedly, a confident closed smile, brows relaxed and slightly raised.
25. Pouting: puffed-out pout (small pushed-forward mouth), brows slightly down, eyes looking to the side.
26. Evil grin: lids lowered, brows angled down, a wide toothy grin.
27. Crazy: one eye wide and one eye narrow, a huge unhinged toothy grin.
28. Thinking: eyes looking up to one side, one brow raised, mouth pushed to one side.
29. Bored: lids half closed, eyes looking straight ahead, a flat mouth slightly to one side.
30. Dizzy: spiral eyes, a wobbly open mouth.
31. Knocked out: "X" shaped eyes, a small open mouth with the tongue slightly out.
32. Determined: brows down and firm, eyes focused straight ahead, a firm closed mouth.
```

## Prompt C (mouth shapes for lip sync)

```
Same face, same art style, same layout (4 x 4 grid, flat #D9D9D9 background, numbers in the top-left corners).

This sheet is for LIP SYNC: draw ONLY THE MOUTH in each cell. No eyes, no brows, no blush. The mouth must sit at EXACTLY the same position and size as the mouth on the reference face, so it can be laid over the full faces. Keep the same mouth style, line thickness and colours (inside of the mouth, teeth, tongue) as this face.

THE 16 MOUTHS, in this order:
1. Rest: closed, neutral (as on the reference).
2. M / B / P: lips pressed firmly together.
3. A / I: wide open, jaw dropped, tongue visible low.
4. E: open wide sideways, top teeth showing.
5. O: rounded open "o".
6. U / W: small tight rounded pucker.
7. F / V: top teeth resting on the lower lip.
8. L: open, tongue tip touching the top teeth.
9. TH: tongue tip between the teeth.
10. C D G K N S T X Y Z: slightly open, teeth close together.
11. Closed smile.
12. Open talking smile.
13. Talking frown (open, corners down).
14. Shout (very wide open, square-ish).
15. Gasp (tall open oval).
16. Tongue out.
```

## Prompt D (eyes and brows for blinks and glances)

```
Same face, same art style, same layout (4 x 4 grid, flat #D9D9D9 background, numbers in the top-left corners).

This sheet is for EYE ANIMATION: draw ONLY THE EYES AND BROWS in each cell. No mouth, no blush. They must sit at EXACTLY the same position and size as on the reference face, so they can be laid over the full faces.

THE 16 EYE STATES, in this order:
1. Open, neutral (as on the reference).
2. Half closed.
3. Fully closed (blink frame).
4. Looking left (both pupils to the viewer's left).
5. Looking right.
6. Looking up.
7. Looking down.
8. Wide open, small pupils.
9. Squinting.
10. Happy closed arcs "^ ^".
11. Wink: the viewer's left eye closed.
12. Wink: the viewer's right eye closed.
13. Neutral eyes, both brows raised high.
14. Neutral eyes, angry brows (pulled down toward the nose).
15. Neutral eyes, sad brows (inner ends raised).
16. Neutral eyes, one brow raised (the viewer's left).
```

---

## [STYLE] lines (paste the one that matches the reference)

01 woman_face (female). Almond eyes with a white sclera, a big grey iris with a black pupil and a white highlight, a thick black upper lash line with a small outer flick, a thin crease line above each eye, thin arched brows, soft pink lips with a thin dark line through them that curls up at the corners, no blush. The second reference is the same style glancing sideways.

02 man_face (male). Narrow eyes with a heavy, almost straight upper lid, a large black iris, small curved tick lines at the eye corners, a thin crease line above, very thick bushy arched brows with a hooked outer tail, a long thin smirk line rising to one side, plus a curved cheek line on the right.

03 dylan_default (gender neutral). Ultra-minimal classic Roblox: two solid black tall oval eyes, no highlights, no brows (add simple short black dash brows only when an expression needs them), a short thick black mouth line with a slight curve.

04 silly_ink (gender neutral). Thick black brush-ink strokes with slightly rough edges. The references show squeezed ">  <" eyes, "^ ^" arc eyes, a "ω" cat mouth, and a laughing open mouth with a thick black outline, dark red inside, a pink tongue and one small white fang; small slanted dash brows; a pinkish blush smear across the nose.

05 intimidating (gender neutral, cool and serious). Heavy, thick, flat upper lids over half-lidded eyes, big solid black irises, soft lavender shading under the lid on the white of the eye, thick straight brows close above the eyes, a tiny small frown mouth.

06 kawaii_star_eyes (female). Big round anime eyes, a dark grey gradient iris with a dark star-shaped pupil and white highlights, very thick spiky black upper lashes, small lower lashes, tiny thin brows set high, soft round pink blush under the eyes, a tiny cat-like mouth.

07 chocolate_yum_girl (female). Big glossy black eyes with a large white crescent reflection, three small lashes at the top outer corner, hatched pink blush lines on the cheeks over soft blush, a small pink tongue-lick mouth.

08 cute_blush_closed (female). Eyes closed in happy upward arcs drawn with a thick lash line and a small wing flick, very soft wide pink blush, an almost invisible tiny mouth. When eyes must open, draw them as dark anime eyes whose top lash line matches these arcs.

09 chibi_vampire (female). Bold black anime eyes with sharp wing tips and white cut-out highlights, grey-white sclera wedges, thin straight brows, pink blush under the eyes, a tiny wavy pink mouth.

10 y2k_moe_anime (female). Very tall, large black anime eyes with thin outlines and pale grey reflection arcs, long thin arched brows set high, a tiny dot mouth.

11 silly_derpy (gender neutral). Two tiny square black dot eyes set far apart, a big flat pill-shaped mouth with a thick black outline and pink inside.

12 dazed_spiral (gender neutral). Hand-drawn black spiral eyes, dark grey shading under the eyes, vertical hatch lines across the nose, thin worried brows, a small open mouth showing teeth with a thick outline. The second reference is the same style, rounder and softer, with a pink square tongue mouth. When eyes must be normal, draw round hand-drawn eyes in the same marker line.

13 sleepy_chibi_doll (female). Big black doll eyes, droopy and half closed, spiky lashes top and bottom, white highlight shapes at the bottom of the eye, thin grey brows, strong soft pink blush, a tiny mouth.

14 puppy_eyes_doll (female). Big glossy black eyes fading lighter toward the bottom, white sclera wedges at the inner corners, spiky lashes, worried thin brows, a tiny pink open "o" mouth.

15 smug_heart_chibi (female). Wide eyes under a very thick, flat upper lash band, a white sclera, a black iris with a pink heart-shaped pupil, double thin worried brows, big soft blush, a tiny ":3" mouth.

16 shy_moe_smirk (female). Half-lidded dark navy eyes with lashes and a small highlight, thin brows, soft blush, a tiny cat smirk mouth.

17 tired_chibi (gender neutral). Big black eye shapes with spiky lashes top and bottom, a small lilac highlight in the corner, long thin arched brows, a tiny "^" mouth.

18 simple_stare (female). Big black eyes with a white crescent at the bottom, short lashes around the top, hatched pink blush, a tiny dot mouth.

19 hum_face (gender neutral). Two flat black horizontal pill-shaped eyes with two tiny lash hairs on top, no mouth on the neutral face (draw a small simple black line mouth when an expression needs one).

20 confused_tired (gender neutral). Blocky eyes made of thick black bars above and below a small white rectangle, uneven brows (one raised, one flat), grey hatch blush across the nose, a thick small frown mouth.

21 crying_chibi (gender neutral). Huge outlined, empty white circle eyes with teardrop blobs at the outer bottom, a tiny wavy mouth. When not crying, keep the outlined circle eyes and add small black pupils.

22 annoyed_face (gender neutral). Solid black block eyes with a flat top lid line that sticks out to the side, small dash brows, a pink blush band across the nose, a small off-centre dash mouth plus a little "v" mark.

23 relaxed_tongue (gender neutral). Closed eyes drawn as thick flat dashes, long thin raised brows, an open smile with an outlined pink tongue sticking out. When eyes must open, draw simple black eyes that keep the same thick flat top line.

24 star_yum_chibi (female). Big grey gradient anime eyes with a white star highlight, spiky lashes, thin brows, big soft blush, a tiny tongue-out lick mouth.

25 calm_chibi (gender neutral). Big solid black eyes with a flat thick lid line on top and a rounded bottom, a small white square highlight, strong soft blush, a tiny pink triangle mouth.

## Male styles (added 2026-11-19 07:44)

26 bored_dude (male, chill). Two thick black half-lidded eyes (a heavy flat black lid shape over a black lower half), small raised "^" brows high above them, a small sideways smirk line off to one side, a faint pink smear across the nose.

27 toon_chillaxed (male, goofy-confident). Thick black rectangular bar brows set low and straight, no visible eyes in the neutral face (the bars ARE the eyes / brows), a huge white toothy grin with a thick black outline and straight vertical tooth lines. When eyes are needed, draw small black dot eyes just under the bars.

28 toon_spiky_chillax (male, mischievous). Same family as 27: thick black bar brows, and a wide grin of sharp zig-zag white teeth with a thick black outline. When eyes are needed, small black dot eyes under the bars.

02 man_face is also male (see above) if you want a fourth.
