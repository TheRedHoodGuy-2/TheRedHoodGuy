// HOUSE PLANS (v2, 2026-11-18): the single source of truth for both houses: the design boards (houseboard.html), the
// interiors (engine/sets/house.js) and the shells read this. Metres at studio scale (real x ~1.4). Plan space: x east,
// z south, origin at the house's north-west corner; the STREET is on the north side (z < 0), back yard south.
// v2 vs the first boards: footprint 16 x 11 m (a real 2,500 sq ft house at our scale), a corridor upstairs so every
// bedroom opens off it, stairs stacked floor to floor, the basement stair under the main stair.
// room: [id, name, x, z, w, d, type]   door: [a, b, at?, {open, w}]  (at = world x or z along the shared edge)
// window / outside door: [room, wall n|s|e|w, at (world), {type, w, h, sill}]
export const FLOOR_H = 4.38;   // floor to floor: ceiling 4.08 (12 studs) + .3 slab
const R = (id, name, x, z, w, d, type) => ({ id, name, x, z, w, d, type });
export const PLANS = {
  A: {
    title: "House A: warm modern (the guy's family)", style: 'warm',
    sub: 'Two storeys + finished basement + attic, 16 x 11 m + garage. White-oak floors, creamy walls, walnut and black accents, olive and terracotta soft goods, a dark-teal kitchen.',
    floors: {
      ground: { y: 0, rooms: [R('entry', 'Entry + stairs', 0, 0, 4.4, 6.4, 'entry'), R('living', 'Living room', 4.4, 0, 6.2, 6.4, 'living'), R('kitchen', 'Kitchen', 10.6, 0, 5.4, 5.6, 'kitchen'),
        R('dining', 'Dining', 10.6, 5.6, 5.4, 5.4, 'dining'), R('hallG', 'Back hall', 0, 6.4, 10.6, 1.4, 'hall'), R('toilet', 'Toilet', 0, 7.8, 2.6, 3.2, 'toilet'),
        R('laundry', 'Laundry', 2.6, 7.8, 3, 3.2, 'laundry'), R('study', 'Study', 5.6, 7.8, 5, 3.2, 'study'), R('garage', 'Garage', 16, 0, 7, 8, 'garage')],
        doors: [['entry', 'living', 3.2, { open: 1, w: 2.6 }], ['entry', 'hallG', 3.5, { open: 1, w: 1.4 }], ['living', 'kitchen', 2.8, { open: 1, w: 3.2 }], ['kitchen', 'dining', 13.3, { open: 1, w: 3.4 }],
          ['hallG', 'dining', 7.1, { open: 1, w: 1.2 }], ['hallG', 'toilet', 1.3], ['hallG', 'laundry', 4.1], ['hallG', 'study', 8.1], ['kitchen', 'garage', 4.4]],
        windows: [['entry', 'n', 3.5, { type: 'door' }], ['living', 'n', 5.4], ['living', 'n', 9.6], ['kitchen', 'n', 13.3], ['dining', 's', 13.3, { type: 'door', w: 2.4 }],
          ['dining', 'e', 9.5], ['toilet', 'w', 9.4, { w: 1.0, h: 1.2, sill: 1.9 }], ['laundry', 's', 4.1, { w: 1.2, h: 1.2, sill: 1.9 }], ['study', 's', 8.1], ['garage', 'n', 19.5, { type: 'garage' }], ['garage', 's', 19.5]] },
      up: { y: FLOOR_H, rooms: [R('hallU', 'Hall + stairs', 0, 0, 4.4, 6.4, 'hallUp'), R('linen', 'Linen + storage', 0, 6.4, 4.4, 4.6, 'linen'), R('corr', 'Corridor', 4.4, 4.6, 11.6, 1.6, 'corridor'),
        R('parents', "Parents' bedroom", 4.4, 0, 4.8, 4.6, 'parents'), R('ensuite', 'En-suite', 9.2, 0, 2.4, 4.6, 'ensuite'), R('his', 'His bedroom', 11.6, 0, 4.4, 4.6, 'teenBoy'),
        R('bath', 'Bathroom (shower)', 4.4, 6.2, 3, 4.8, 'bathroom'), R('guest', 'Guest room', 7.4, 6.2, 4.2, 4.8, 'guest'), R('office', 'Office', 11.6, 6.2, 4.4, 4.8, 'office')],
        doors: [['hallU', 'corr', 5.4, { open: 1, w: 1.4 }], ['hallU', 'linen', 3.5], ['corr', 'parents', 5.6], ['parents', 'ensuite', 3.4], ['corr', 'his', 12.6], ['corr', 'bath', 5.4], ['corr', 'guest', 8.6], ['corr', 'office', 12.6]],
        windows: [['parents', 'n', 6.8], ['his', 'n', 13.8], ['his', 'e', 2.3], ['ensuite', 'n', 10.4, { w: 1.2, h: 1.3, sill: 1.9 }], ['bath', 's', 5.9, { w: 1.4, h: 1.3, sill: 1.9 }], ['guest', 's', 9.5],
          ['office', 's', 13.8], ['office', 'e', 8.6], ['hallU', 'w', 3.2], ['hallU', 'n', 3.5]] },
      basement: { y: -FLOOR_H, rooms: [R('rec', 'Rec room', 0, 0, 10, 11, 'rec'), R('boiler', 'Storage + boiler', 10, 0, 6, 11, 'storage')],
        doors: [['rec', 'boiler', 8]], windows: [['rec', 'n', 5, { w: 1.6, h: .8, sill: 3.0 }], ['rec', 's', 6, { w: 1.6, h: .8, sill: 3.0 }], ['boiler', 'e', 5.5, { w: 1.6, h: .8, sill: 3.0 }]] },
      attic: { y: FLOOR_H * 2, rooms: [R('attic', 'Attic', 0, 0, 16, 11, 'attic')], doors: [], windows: [] },
    },
    stairs: { main: { x: .15, z: .6, w: 1.3, run: 5.0 }, cellar: { x: 1.5, z: .6, w: 1.2, run: 5.0 } },   // main climbs north (bottom step south); cellar beside it climbs south from the basement (top at the south end)
  },
  B: {
    title: 'House B: soft organic (the family where the daughter is the child)', style: 'soft',
    sub: 'Mirrored plan, no garage (driveway), unfinished basement. Pale-oak floors, sage-green kitchen with brass, clay and cream, terracotta bathroom tile.',
    floors: {
      ground: { y: 0, rooms: [R('kitchen', 'Kitchen + island', 0, 0, 5.6, 6.4, 'kitchen'), R('living', 'Living room', 5.6, 0, 6, 6.4, 'living'), R('entry', 'Entry + stairs', 11.6, 0, 4.4, 6.4, 'entry'),
        R('dining', 'Dining nook', 0, 6.4, 5.6, 4.6, 'dining'), R('hallG', 'Back hall', 5.6, 6.4, 10.4, 1.4, 'hall'), R('mud', 'Mudroom', 5.6, 7.8, 3.4, 3.2, 'mudroom'),
        R('den', 'Den / playroom', 9, 7.8, 4, 3.2, 'den'), R('toilet', 'Toilet', 13, 7.8, 3, 3.2, 'toilet')],
        doors: [['kitchen', 'living', 3.2, { open: 1, w: 3.4 }], ['living', 'entry', 3.2, { open: 1, w: 2.6 }], ['kitchen', 'dining', 2.8, { open: 1, w: 3.2 }], ['entry', 'hallG', 12.5, { open: 1, w: 1.4 }],
          ['hallG', 'dining', 7.1, { open: 1, w: 1.2 }], ['hallG', 'mud', 7.3], ['hallG', 'den', 11.0], ['hallG', 'toilet', 14.6]],
        windows: [['entry', 'n', 12.5, { type: 'door' }], ['living', 'n', 6.6], ['living', 'n', 10.6], ['kitchen', 'n', 2.8], ['kitchen', 'w', 3.2], ['dining', 's', 2.8], ['dining', 'w', 8.7],
          ['mud', 's', 7.3, { type: 'door' }], ['den', 's', 11.0], ['toilet', 'e', 9.4, { w: 1.0, h: 1.2, sill: 1.9 }]] },
      up: { y: FLOOR_H, rooms: [R('hallU', 'Hall + stairs', 11.6, 0, 4.4, 6.4, 'hallUp'), R('linen', 'Linen closet', 11.6, 6.4, 4.4, 4.6, 'linen'), R('corr', 'Corridor', 0, 4.8, 11.6, 1.5, 'corridor'),
        R('her', 'Her bedroom', 0, 0, 4.8, 4.8, 'teenGirl'), R('ensuite', 'En-suite', 4.8, 0, 2.4, 4.8, 'ensuite'), R('parents', "Parents' bedroom", 7.2, 0, 4.4, 4.8, 'parents'),
        R('bro', 'Little brother', 0, 6.3, 4.4, 4.7, 'kid'), R('bath', 'Bathroom (shower)', 4.4, 6.3, 3.4, 4.7, 'bathroom'), R('study', 'Study / guest', 7.8, 6.3, 3.8, 4.7, 'guest')],
        doors: [['hallU', 'corr', 5.55, { open: 1, w: 1.3 }], ['hallU', 'linen', 12.5], ['corr', 'her', 2.4], ['corr', 'parents', 10.6], ['parents', 'ensuite', 3.4], ['corr', 'bro', 2.2], ['corr', 'bath', 6.1], ['corr', 'study', 9.7]],
        windows: [['her', 'n', 2.4], ['her', 'w', 2.4], ['parents', 'n', 9.4], ['ensuite', 'n', 6.0, { w: 1.2, h: 1.3, sill: 1.9 }], ['bro', 's', 2.2], ['bro', 'w', 8.7], ['bath', 's', 6.1, { w: 1.4, h: 1.3, sill: 1.9 }],
          ['study', 's', 9.7], ['hallU', 'e', 3.2], ['hallU', 'n', 12.5]] },
      basement: { y: -FLOOR_H, rooms: [R('store', 'Unfinished storage', 0, 0, 12, 11, 'basementRaw'), R('furnace', 'Furnace + laundry', 12, 0, 4, 11, 'furnace')],
        doors: [['store', 'furnace', 8.5, { open: 1, w: 1.6 }]], windows: [['store', 'n', 4, { w: 1.6, h: .8, sill: 3.0 }], ['store', 's', 8, { w: 1.6, h: .8, sill: 3.0 }]] },
      attic: { y: FLOOR_H * 2, rooms: [R('attic', 'Attic', 0, 0, 16, 11, 'attic')], doors: [], windows: [] },
    },
    stairs: { main: { x: 14.55, z: .6, w: 1.3, run: 5.0 }, cellar: { x: 13.3, z: .6, w: 1.2, run: 5.0 } },
  },
};
