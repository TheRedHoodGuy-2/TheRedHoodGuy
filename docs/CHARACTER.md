# CHARACTER: how every character is built

Status: DRAFT 2026-11-16. Becomes law when Xavier signs off the sheets in `docs/sheets/`.

## Body
- `engine/r6.js` `makeR6(spec)`: six beveled blocks + a rounded head, exact Roblox R6 proportions, 1 stud = 0.34 m (1.7 m tall).
  Bevel 0.075 stud on every edge. Fine moulded-plastic grain on skin and clothes (a shared tiling normal map). No skin glow
  (dropped by Xavier 2026-11-16). The reference channel uses plain unbeveled R6, so this is already a step above it.
- Joints: `joints.root, neck, shoulderL/R, hipL/R` (Roblox space inside `rbx`; `root` is in metres, feet on y = 0, facing +Z).
- Faces: `api.setFace(name)` from `engine/faces.js` (about 60 expressions, drawn, curved onto the head). Faces rework is PLAN item 6.

## Clothing
- Classic Roblox 2D templates (585 x 559), the same system the reference uses: `spec.shirt`, `spec.pants` = template image.
- The two mains keep their own painted outfits: `assets/mains/guy.png` (red hoodie, jeans), `assets/mains/girl.png` (peach top, denim shorts).
- Modelled clothing (a 3D hood, a scarf, a backpack) = a catalog accessory worn with `api.wear(id)`. No hand-modelled garments.

## Hair, hats, accessories: the Roblox catalog importer
- `python3 tools/roblox/fetch.py search "<words>" <type> <limit> Roblox` then `... get <id> <id>` converts an item into
  `assets/roblox/<id>/` (model.glb + texture.png + meta.json). Types: 41 hair, 8 hat, 11 shirt, 12 pants, 42 to 47 other accessories.
- Works from the cloud with no login for avatar items. Community MODELS (props, buildings) need a login and are NOT reachable.
- RULE: only items whose creator is "Roblox" (official, free or near free). Community creators sell their clothing and hair;
  taking those files without buying them is not ours to do. `meta.json` records creator and price for every item.
- In the library on 2026-11-16: 98 official hair / accessories (sheets: `docs/sheets/hair_0..3.jpg`), 9 shirts, 12 pants.
- Known limits: 3 "layered" items made for the newer heads sit inside the classic head (11572095427, 11584287440,
  12795989885): do not use them. One item (16477615730) needs a login for its mesh.

## Sheets for sign-off
- `docs/sheets/mains_turn.jpg`: the two mains, front / three-quarter / side / back.
- `docs/sheets/cast.jpg`: mains + six extras built only from catalog hair and official clothing.
- `docs/sheets/hair_0..3.jpg`: every imported hair on a head, labelled with its catalog ID.
- Rebuild any sheet: `node tools/shot.mjs sheet.html '<spec json>' out.png` (see `tools/hairsheet.py` for an example).
