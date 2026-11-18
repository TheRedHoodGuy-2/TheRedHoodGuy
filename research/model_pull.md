# Roblox model pull tool v1 (2026-11-18)

- Search: `python3 tools/roblox/models.py search "modern bed" 10` (Creator Store, uses the cookie in ~/.rbx_cookie).
- Pull: `python3 tools/roblox/models.py get <id or store link> ...` -> assets/rbxmodels/<id>/model.glb + meta.json,
  listed in library/models.json. Load in a scene with `loadRbx(id, { yaw })` from engine/rbxmodel.js.
- Reads: Parts (block, ball, cylinder), wedges, corner wedges, MeshParts, Parts with a SpecialMesh. Invisible parts
  skipped. Merged per material + colour (few draw calls). 1 stud = 0.34 m, the same as our R6, so sizes match.
- Re-skin: the builder's colours stay, the look becomes ours: Wood -> real wood (white "wood" -> painted), Fabric ->
  woven fabric with sheen, Metal -> metal, Glass -> glass, Plastic -> smooth plastic, Brick / stone -> our textures.
- Sample sheet: docs/sheets/models_v1.jpg (10 modern pieces next to our R6).

## 2026-11-18 17:20 update: UNIONS SOLVED
- Union meshes are read now: MeshData (or the PartOperationAsset its AssetId points to) is a 'CSGMDL' v4 file,
  XOR-obfuscated with a fixed 31-byte key, then vertices (stride 84) + int32 indices. The office chair, lamp,
  wardrobe and beds now come through complete (docs/sheets/models_v2.jpg).
- One pull tool for everything: `python3 tools/pull.py <any Roblox link or id>` routes catalog items (clothes, hair,
  accessories) and Creator Store models automatically, and renders a check picture to out/pull/<id>.png.

## Known limits (honest, before the update)
- UNIONS (CSG parts) cannot be read yet. Models built from unions lose those parts: in the sample the office chair
  (33 unions) and the lamp (6) come out broken. Models made of MeshParts (the sofa, the beds) come through well.
  Fix = a reader for Roblox's union mesh format; until then the tool flags `unions_skipped` and only clean models
  should be used.
- Facing: Roblox builders don't agree on which way is the front, so each model gets a `yaw` when it enters a set.
- Roblox builders oversize furniture (beds 3-4.5 m wide next to a 1.7 m R6). The scale sheet (item 7) decides how
  much to shrink each kind.
