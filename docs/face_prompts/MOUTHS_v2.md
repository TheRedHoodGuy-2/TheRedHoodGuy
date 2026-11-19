# Mouths v2: talking mouths per emotion (2026-11-19, Xavier 09:52)

Why: the C sheet mouths are too big (number 5 looks massive), most of them are smiling, and each one is a different
drawing. The talking flap needs the SAME mouth opening wider, in the mood of the line. Ethan talked with smiling
mouths while his face was serious.

## How to use
Same chat routine as before. For each style, attach that style's reference PNG AND its A sheet (the 16 faces), paste
**Prompt E**, then send **Prompt F** in the same chat. Save the results as `<number>_E.png` and `<number>_F.png` and send
both. I put each row on the face as: closed = column 1, half open = column 2, open = column 3, wide = column 4.

## Prompt E (neutral, happy, sad, angry)
```
I'm attaching a Roblox-style face (reference) and its expression sheet. Make a TALKING-MOUTH SHEET for this exact face,
in exactly the same art style: same line thickness, same colours for the inside of the mouth, teeth and tongue.

SIZE AND PLACE (most important):
- The mouths are SMALL: about the same size as the closed mouth on the reference face. The widest mouth on the whole
  sheet (column 4) is at most 1/5 of the cell width; most mouths are 1/8 to 1/6 of the cell width.
- Every mouth sits at EXACTLY the same spot in its cell: centred left-to-right, at the same height as the mouth on the
  reference face. Nothing moves between cells except the mouth opening.

THE IDEA: each ROW is ONE mouth for ONE mood, opening wider from left to right, like a jaw dropping while talking.
Column 1 closed, column 2 slightly open, column 3 open, column 4 wide open (shouting this mood). The corners, width and
curve of the mouth stay the same mood in all four; only the opening grows. Not four different drawings.

ROWS (top to bottom):
1. NEUTRAL / serious: a straight, relaxed mouth line with no smile and no frown. When open: a plain small oval, corners level.
2. HAPPY: corners turned up in a gentle smile. When open: a smiling D-shaped mouth, top teeth showing.
3. SAD / worried: corners turned down. When open: an upside-down D shape, corners still down.
4. ANGRY / annoyed: a tight flat mouth pulled a bit wider. When open: teeth showing at the top AND bottom, a square-ish
   gritted shape, corners slightly down.

LAYOUT: one square image (2048 x 2048 if possible), a 4 x 4 grid of equal square cells with thin straight white lines
between them. Background of every cell: flat light grey #D9D9D9 (no shading, no gradient, no texture, no shadow). ONLY
the mouth: no eyes, brows, blush, nose, head outline or any other mark. A small black number (1-16) in the top-left
corner of each cell, far from the mouth. No other text. Crisp clean edges, no blur, no watermark.
```

## Prompt F (smug, scared, surprised, quiet)
```
Same face, same style, same SIZE AND PLACE rules, same layout and the same idea (each row is one mouth opening wider from
left to right: column 1 closed, 2 slightly open, 3 open, 4 wide open; small mouths, the same spot in every cell).

ROWS (top to bottom):
1. SMUG / cocky: a one-sided smirk, the right corner raised and the left corner level. When open: the smirk stays
   lopsided, only the raised side shows teeth.
2. SCARED / nervous: a wobbly wavy line. When open: a trembling open mouth with slightly wavy edges, teeth just
   showing, corners down.
3. SURPRISED / shocked: a small round closed mouth (a tiny dot or short line). When open: a round "o", growing to a
   tall open oval.
4. QUIET / whispering / tired: a small soft mouth. When open: only a slight, small opening (even column 4 is no bigger
   than the column 2 mouths of row 1).
```

## Male faces (26, 27, 28) and 05, 11, 13, 16
Use the same two prompts for every style. Do 05 and 16 first (the main boy and girl styles), so I can test them on the
lip sync clip before you spend effort on the rest.
