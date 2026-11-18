# Town map source (2026-11-18)
- Real neighbourhood: downtown Naperville, Illinois (a classic US suburb: main street, river walk park, schools, churches,
  college, grid of family houses). Bbox 41.7700..41.7790 N, -88.1600..-88.1450 E.
- Data: OpenStreetMap via the Overpass API, fetched through Xavier's laptop (the cloud can't reach Overpass; the laptop
  can, first tries hit "at capacity", retry worked). Raw: research/map/naperville_osm.json (2.2 MB, 2,992 ways:
  974 buildings, 398 roads, 1,187 footways, parks, pitches, pools, parking). (c) OpenStreetMap contributors, ODbL:
  credit "Map data (c) OpenStreetMap contributors" if the map is ever shown as a map.
- Converted by tools/town_build.py -> assets/town/town.json at studio scale (x 1.4). Real names are dropped; civic roles
  (town hall, library, school, police, fire, hospital) get generic signs.
