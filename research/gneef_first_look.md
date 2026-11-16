# Gneef (reference channel): first look, 2026-11-16

Source: youtube.com/@Gneef/shorts. Full list with views in `reference/gneef/shorts_views.txt` (views|id|-|title).

## Numbers
- 275 Shorts. Median 4.3M views, mean 6.4M. 63 at 10M+, 14 at 20M+, 256 at 1M+. Top: 36M.
- Downloaded for study: the 63 at 10M+ plus the 12 newest (75 files, 480x854, ids in `reference/gneef/downloaded_ids.txt`).
  Files are on Xavier's laptop in `Videos\gneef_ref` and staged in the cloud at `/mnt/user-data/uploads/Videos/gneef_ref`.
  YouTube blocks downloads from the cloud (bot check); they were fetched through the laptop's connection with yt-dlp.
- Length of those 75: median 135 s, range 35 to 178 s. 56 of 75 are 2 minutes or longer. Not 20-second shorts.
- Cuts: about one every 1.6 to 1.9 s (57 cuts in 112 s; 48 cuts in 77 s). Narration about 260 words a minute.

## What the videos are
- High-concept premise stories. Title = the world rule ("In This Town, You Get 1,000,000 Steps", "Everyone Has A String
  On Their Back", "Never Be Caught Awake At Night") + one emoji.
- Top video script shape (492 words, 112 s): the rule in line 1 -> "You see," how it works -> quick montage of how
  people live with it (3 to 4 funny examples) -> "But when I was little..." the narrator's own problem -> a small skill
  planted early (handstands) -> crisis -> countdown -> the planted skill beats the rule through a loophole -> emotional
  payoff -> the whole world changes. First person, past tense, a kid narrator.
- One-word captions, white with black outline, lower middle.

## What they look like (this matters for our rebuild)
- Plain Roblox R6 bodies. Flat skin colours (even classic yellow), classic 2D shirt / pants templates, catalog hair,
  simple Roblox-style decal faces. No bevel work, no skin texture, no modelled clothing.
- The polish is in the WORLD and the LIGHT: a realistic suburb (houses, porches, trees, park, school, library),
  blue sky, hard sunlight with clean shadows, many dressed extras, number / price tag overlays stuck to characters.
- The same town and a recurring red-haired kid show up across videos: heavy asset reuse.
- Conclusion: their edge is premise + story + pacing + a good reusable world. Not character rendering.

## Roblox assets from the cloud (tested 2026-11-16)
- `catalog.roblox.com/v1/search/items/details` works without login (search hair, accessories, clothing).
- `assetdelivery.roblox.com/v1/asset/?id=<id>` returns the asset file (Roblox binary model) without login.
- `thumbnails.roblox.com` 3D endpoints need login (403). Not usable.
- Still to prove: parsing the binary model + Roblox mesh format into something Three.js loads.
