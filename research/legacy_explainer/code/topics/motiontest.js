// Motion engine test reel: springy R6 poses, overlap, idle, face pops + blinks, flying camera. No voice.
export const FORMAT = 'A';
export const SET = 'classroom';
export async function setup({ CAST, world }) {
  const guy = await CAST.castMain('guy'), girl = await CAST.castMain('girl');
  const n1 = await CAST.castBlank('m', 1), n2 = await CAST.castBlank('f', 2), n3 = await CAST.castBlank('m', 3);
  const F = Math.PI, seat = (x, z) => [x, 0, z + .5];
  guy.keys = [
    { t: 0, pose: 'slumpSit', expr: 'bored', at: seat(-.9, 2.8), face: F },
    { t: 1.1, pose: 'tickleArmpit', expr: 'neutral', snap: 1.2 },
    { t: 2.0, pose: 'tickleRibs', expr: 'neutral' },
    { t: 2.8, pose: 'tickleNeck', expr: 'annoyed' },
    { t: 3.6, pose: 'tickleFoot', expr: 'annoyed', snap: .9 },
    { t: 4.6, pose: 'deadpan', expr: 'bored' },
    { t: 5.75, pose: 'jumpScream', expr: 'scream', style: 'snap', snap: 1.6, bounce: .35 },
    { t: 6.6, pose: 'sit', expr: 'shocked' },
  ];
  girl.keys = [
    { t: 0, pose: 'sit', expr: 'neutral', at: seat(.9, 2.8), face: F },
    { t: 4.9, pose: 'sit', expr: 'smirk' },
    { t: 5.3, pose: 'pokeSide', expr: 'smirk', snap: 1.3, at: [.55, 0, 3.3] },
    { t: 6.3, pose: 'sit', expr: 'laugh', at: [.9, 0, 3.3] },
  ];
  n1.keys = [{ t: 0, pose: 'sit', expr: 'neutral', at: seat(-.9, -.6), face: F }, { t: 6.0, pose: 'turnAround', expr: 'surprised', snap: 1.2 }];
  n2.keys = [{ t: 0, pose: 'sit', expr: 'neutral', at: seat(.9, -.6), face: F }, { t: 6.12, pose: 'turnAround', expr: 'shocked', snap: 1.1 }];
  n3.keys = [{ t: 0, pose: 'boredChin', expr: 'neutral', at: seat(-2.7, 1.1), face: F }, { t: 6.25, pose: 'turnAround', expr: 'surprised' }];
  const camera = [
    { t: 0, p: [-.9, 1.35, .75], l: [-.9, 1.05, 3.3], fov: 26 },
    { t: 1.6, p: [-2.1, 1.25, 1.05], l: [-.9, 1.0, 3.3], fov: 27 },
    { t: 3.2, p: [.45, 1.15, 1.0], l: [-.9, .75, 3.3], fov: 36 },
    { t: 4.6, p: [-.9, 1.32, .9], l: [-.9, 1.22, 3.3], fov: 17 },
    { t: 5.25, p: [2.3, 1.45, .9], l: [-.1, 1.0, 3.3], fov: 40, ease: 'out' },
    { t: 6.0, p: [2.25, 1.45, .95], l: [-.1, 1.0, 3.3], fov: 40 },
    { t: 6.05, p: [0, 1.95, -3.7], l: [0, .9, 1.6], fov: 48, cut: true },
    { t: 8, p: [0, 1.85, -3.3], l: [0, .9, 1.6], fov: 46 },
  ];
  return { cast: { guy, girl, n1, n2, n3 }, camera };
}
