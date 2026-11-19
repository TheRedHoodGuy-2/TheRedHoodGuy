# Roblox dynamic faces (2026-11-19, for Xavier's 04:16 face notes)

## What "dynamic faces" are now
- Dynamic Heads = heads with a FACS face rig (blink, smile, brows), launched 2022. In Jan-Mar 2026 Roblox converted ALL
  classic heads + faces into Dynamic Head equivalents "matching the original aesthetic" and removed the classic
  categories; non-compliant heads off-sale 3 Mar 2026, removed from inventories 15 Jun 2026 (devforum "Completing the
  Dynamic Head Migration"; pcgamesn; pcgamer). Big player backlash (petitions, devforum replies) against the 3D look.
- So the TikTok "dynamic faces" are mostly **2D-drawn cartoon faces printed on a dynamic head that blinks and moves**, not
  realistic 3D faces. The realistic 2022 launch heads (Man Face, Woman Face, the ones I showed in face3d.mp4) are the
  family Xavier hates. Do not use them.

## What is popular (catalogue, sorted by favourites, 191 dynamic-head bundles found, top 48 pulled)
Sheet: docs/sheets/dynamic_heads_top48.jpg, data: research/dynfaces/top.json, measure.json.
Apart from the Roblox defaults, the top list is cute / chibi 2D faces: Animated Cute Blush Face, Chocolate Yum Girl,
Yum Cute Angel, Super Super Happy, kawaii / chibi / moe faces, plus "sleek" half-lidded girls and the Intimidating Face.

## Measured layout (fraction of the head front; 0 = top, 1 = bottom; sep = eye centre distance / head width)
| | eye height | eye sep | eye to mouth |
|---|---|---|---|
| top 48 median | .53 (chibi cluster .60-.67) | .50 | .33 (chibi .23-.28) |
| our kit v2 | .36 | .44 | .47 |
Eyes in the popular faces are BIG (.2-.25 of the head width), so the gap between them is ~1 eye width even at .5 sep.
Ours were small and high, with a tiny mouth far below: Xavier's "massive triangle" is exactly this.

## Rules (face kit v3, engine/faces3.js)
- Eyes just below the middle of the head (~.56), mouth close under them (~.80), brows close above the eyes.
- Gap between the eyes about one eye width. Eyes big enough to read on a phone in a medium shot.
- Three eye styles on the same emotion parameters: classic (Roblox bean), chibi (all-iris, two highlights), toon (white
  eye + big iris). Xavier picks; he is also sending a cartoon reference.
- Never realistic 3D face meshes.
