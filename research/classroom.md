# US high-school classroom (research for the classroom set, 2026-11-19)
Sources: dimensions.com classroom layouts; seatingchartmaker.app (average US classroom ~900 sq ft, range 700-1,100);
CPS grades 9-12 classroom guidelines (clock and display centred above the marker board, teacher station desk + file
pedestal + lectern, primary + secondary teaching walls, bookcases); coohom school layout standards (HS 750-900 sq ft,
ceilings 9-12 ft); dimensions.com clearances (30-36 in between desks); classroom layout write-ups (teacher desk in the
front corner by the door, flag in a front corner, bulletin boards, pull-down screen over the boards, projector).
## What we built (engine/sets/classroom.js)
- Room 13.6 x 14.0 m studio (= ~9.7 x 10 m real, ~1,050 sq ft), ceiling 10 ft. Sized up from a 30 x 30 ft room because R6
  bodies are 4 studs (1.36 m) wide: real-width desks and aisles cannot hold them.
- Walls painted CMU block, floor waxed VCT 12 in tile, 2x2 acoustic ceiling, 2x4 LED troffers, chair rail.
- Front wall: 12 ft whiteboard (aluminium frame, marker tray, markers, eraser), clock centred above, pull-down screen case
  under the ceiling, ceiling projector, rules + motivational posters. Teacher steel desk in the front corner by the door,
  drawers on the teacher's side, monitor toward the chair; 3x5 flag on a wall bracket in that corner.
- 5 x 5 student desks in rows facing the board. Desk MODELLED for R6 (laminate top 1.45 x .78 at 1.08 m, steel tube
  frame, no book box) because the scanned Poly Haven desk's book box sits where seated R6 thighs go and its top sat
  above the R6 shoulder pivot (arms would clip). Chair = Poly Haven SchoolChair_01, widened 1.3 x, seat lowered to .65.
- Window bank on the left wall (as you face the board), corkboards, bookcases, plant, bins; outside: lawn, path,
  leaf-card trees, the far wing across the courtyard.
## Seated R6 numbers (measured with tools/_probe.mjs)
seat .65 -> hips .87, thigh top .99 (desk underside must be above it), shoulder pivot 1.33 (arm bottom 1.16 when level:
desk top must be at or under it). Point-in-mesh clip check (tools/clipcheck.js): 0 clips for all 22 seated students.
## Known gaps
door is the house door model (school doors have a narrow vision panel); no backpacks / textbooks on desks yet.
