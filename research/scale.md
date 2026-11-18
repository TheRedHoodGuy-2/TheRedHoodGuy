# Scale standard v2 (2026-11-18) — MEASURED, for Xavier to approve

Xavier rejected the v1 draft because it was a guess. v2 comes from measuring real Roblox builds: 47 Creator Store
houses, rooms and furniture kits (tools/scale_measure.py, raw data research/scale_data.json). Every object whose name
says what it is (door, bed, chair, table...) was measured once (sub-parts like legs and knobs skipped). 1 stud = 0.34 m
(our R6 = 5 studs = 1.70 m). Picture: docs/sheets/scale_v2.jpg.

| Thing | n measured | Median (p25-p75) studs | Standard | Metres | v1 guess was |
|---|---|---|---|---|---|
| Wall / ceiling height | 108 walls | 12.0 (9.9-14.9) | 12 | 4.1 | 10 |
| Room door (tall ones) | 194 | 8.4 tall (8.2-9.2), 4.7 wide (4.0-) | 4.5 x 8.4 | 1.53 x 2.86 | 4.5 x 7.5 |
| Chair / sofa seat top | 12 | 2.0 (2.0-2.4) | 2.0 | 0.68 | 1.5 |
| Bed | 22 | 10 long x 5.6 wide, mattress top 2.4 (2.1-3.4) | 5.6 x 10, top 2.4 | 1.9 x 3.4, top 0.82 | 5 x 8, top 1.8 |
| Table top | 27 | 2.6 (2.2-3.7) | 2.6 | 0.88 | 2.95 |
| Desk top | 14 | 3.0-3.5 | 3.0 | 1.02 | - |
| Kitchen counter | 10 | 3.0 (p25) | 3.0 | 1.02 | 3.2 |
| Sofa | 17 | 8.5 wide x 3.3 deep | 8.5 x 3.3 | 2.9 x 1.1 | - |
| Fridge | 9 | 7.5 (7.3-8.9) | 7.5 | 2.55 | - |
| Window | 340 | 4.4 wide, 9.2 tall (floor-to-ceiling common) | 4.4 x 6-9 | 1.5 x 2-3 | 4.5 tall |
| TV | 19 | 11 wide x 6.3 tall (incl. stands) | | | |

Cross-check with Gneef: in his "1,000,000 Steps" front-door shot the kid is about 0.7 of the door's height while
standing in front of it (closer to the camera), so the real door/person ratio is at least 1.4: consistent with
8.4 / 5.1 = 1.65 from the builds.

What this means: Roblox rooms are big next to the body (doors 1.65x a person, ceilings 2.4x). That is what Roblox
viewers expect, and it gives the camera room in 9:16. Pulled furniture already comes in near these sizes, so it
mostly needs no rescaling.
