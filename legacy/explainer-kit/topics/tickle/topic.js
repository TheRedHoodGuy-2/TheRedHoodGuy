// WHY YOU CAN'T TICKLE YOURSELF (Format A, classroom + Brain HQ). Xavier's script + his recorded voice (37.7 s).
// Beat 1 (0-5.5)   bored in a test, tries to tickle himself, nothing.
// Beat 2 (5.8-12.8) tries harder: armpit, ribs, feet. Still nothing.
// Beat 3 (13.4-28.6) "You see": fly into his head -> BRAIN HQ, where a little him runs the controls: the screen predicts
//                   his own hand, he pulls the TICKLE lever down, relaxes... then UNKNOWN FINGER, alarm, panic.
// Beat 4 (28.9-37.7) back in class: the girl pokes him mid-test, he screams, the whole class turns round.
// NPCs: 8 classmates (4 m, 4 f) + teacher, blank until Xavier's NPC Creator designs are pulled in (slots tickle_*).
import * as THREE from 'three';
import { mirrorPose } from '../../kit/poses.js';
export const FORMAT = 'A';
export const SET = 'classroom';

// poses new to this video (pose gate first, then they move into kit/poses.js)
const SIT = { legL: [.07, -.05, 1], legR: [-.06, -.05, 1] };
export const LOCAL_POSES = {
  writeTest:   { ...SIT, armR: [-.12, -.55, .83], armL: [.22, -.62, .76], head: [.08, .42, .05], root: { y: -.22, rx: .16, rz: .02 } },
  writeTest2:  { ...SIT, armR: [-.05, -.5, .86], armL: [.28, -.66, .7], head: [-.1, .38, -.06], root: { y: -.22, rx: .2, rz: -.03 } },
  whistleAway: { legL: [.1, -.08, 1], legR: [-.14, -.02, .99], armL: [.55, .75, -.38], armR: [-.12, -.62, .76], head: [-.55, -.22, -.12], root: { y: -.22, rx: -.1, ry: -.18, rz: .03 } },   // hands behind head, looking away, 'nothing to see here'
  tickleRibs2: { armL: { r: [-0.873, -0.061, -0.813], o: [0.015, -0.012, -0.01] }, armR: { r: [-1.152, 0.558, 0.791], o: [-0.082, -0.008, 0.026] }, legL: { r: [-0.934, -0.036, 0.134], o: [0, 0.005, 0.01] }, legR: { r: [-0.934, 0.036, -0.134], o: [0, 0.005, 0.01] }, head: { r: [0.607, 0.263, 0.091], o: [0, 0.065, 0] }, root: { y: -0.19, z: 0.258, rx: -0.411 } },   // Xavier's ribs, 2026-10-21
  lookHands:   { legL: [.08, -.05, 1], legR: [-.07, -.05, 1], armL: [-.12, .32, .94], armR: [.1, .38, .92], head: [.05, .22, .05], root: { y: -.22, rx: -.02 } },   // hands up in front of his face, studying them
  lookCam:     { legL: [.1, -.05, 1], legR: [-.07, -.05, 1], armL: [.3, -.2, .93], armR: [-.4, .5, .77], head: [.55, -.05, .1], root: { y: -.22, rx: -.05, ry: .35 } },
  guardLean:   { legL: [.12, -.1, 1], legR: [-.1, -.1, 1], armL: [.3, -.45, .85], armR: [-.3, -.45, .85], head: [.45, -.15, .05], root: { y: -.2, rx: .28, ry: .2 } },
  slouchBack:  { armL: { r: [2.173, 1.042, -0.368] }, armR: { r: [2.339, -1.434, 0], o: [0, 0, -0.117] }, legL: { r: [-0.843, -0.272, -1.242], o: [0, 0.115, 0.246] }, legR: { r: [-0.825, 0.003, -0.087], o: [-0.03, 0.058, 0.268] }, root: { x: 0.097, y: -0.179, z: 0.195, rx: -0.406 } },   // Xavier's: slouched back, hands behind head
  classTurn:   { armL: { r: [-0.776, -0.062, 0.154] }, armR: { r: [-1.236, -0.557, -0.245] }, legL: { r: [-1.18, 0.883, 0.532], o: [-0.052, 0.058, -0.113] }, legR: { r: [-1.07, 0.485, 0.877], o: [0.058, 0.066, 0.134] }, head: { r: [-0.124, -1.886, -0.051] }, root: { x: 0.014, y: -0.22, z: -0.023, rx: 0.027, ry: -0.834, rz: -0.008 } },   // Xavier's v2, from the pose editor (looks right round)
  tickleFeet:  { armL: { r: [-1.103, 0, -0.123], o: [0, 0, 0.246] }, armR: { r: [-0.931, 0.694, 0.358], o: [0, 0, 0.196] }, legL: { r: [-1.579, 0.223, -0.701], o: [0, 0.315, 0.14] }, legR: { r: [-1.006, 0.016, -0.068], o: [0, -0.065, 0.14] }, head: { r: [0.452, 0.087, 0.027] }, root: { x: 0.021, y: -0.195, z: 0.082, rx: -0.163, ry: 0.25 } },   // Xavier's, chair pushed back to reach his foot
  standGrade:  { armL: [.3, -.15, .95], armR: [-.28, -.1, .95], legL: [.06, -1, .02], legR: [-.1, -1, -.05], head: [.05, .32, .04], root: { rx: .06, rz: .02 } },
  standLook:   { armL: [.35, -.75, .55], armR: [-.3, -.55, .8], legL: [.12, -1, -.1], legR: [-.08, -1, .12], head: [-.12, -.12, .08], root: { rx: -.1, ry: -.15, rz: -.03 } },
  gradePaper:  { legL: [.1, -.05, 1], legR: [-.04, -.05, 1], armR: [-.2, -.25, .95], armL: [.2, -.25, .95], head: [.05, .3, .04], root: { y: -.22, rx: .08 } },
  teacherLook: { legL: [.1, -.05, 1], legR: [-.04, -.05, 1], armR: [-.15, -.6, .8], armL: [.25, -.7, .65], head: [-.25, -.1, .1], root: { y: -.22, rx: -.05, ry: -.2 } },
  leanBack:    { legL: [.25, .1, 1], legR: [-.05, -.2, 1], armR: [-.3, -.2, .75], armL: [.5, .45, -.3], head: [.1, -.2, .12], root: { y: -.22, rx: -.22, rz: .05 } },
  pullLever:   { ...SIT, armR: [-.25, -.3, .92], armL: [.15, -.85, .45], head: [-.25, .3, -.05], root: { y: -.22, rx: .18, ry: -.25 } },
  pressButtons:{ ...SIT, armR: [-.08, -.4, .9], armL: [.12, -.42, .9], head: [0, .32, 0], root: { y: -.22, rx: .14 } },
  panic:       { legL: [.3, -.4, .85], legR: [-.35, -.2, .9], armL: [.8, .55, .25], armR: [-.75, .6, .3], head: [.15, -.25, .15], root: { y: -.12, rx: -.18, rz: .08 } },
  smirkLean:   { ...SIT, armR: [-.1, -.6, .78], armL: [.35, -.55, .75], head: [-.55, .1, -.12], root: { y: -.22, rx: .1, ry: -.3, rz: -.04 } },
  laughHold:   { legL: [.15, -.05, 1], legR: [-.1, -.05, 1], armL: [-.5, -.45, .7], armR: [.5, -.45, .7], head: [-.3, -.25, .25], root: { y: -.22, rx: -.12, rz: .1 } },
  embarrassed: { ...SIT, armR: [-.25, .55, .8], armL: [.2, -.9, .3], head: [.2, .35, .15], root: { y: -.24, rx: .2, rz: .06 } },
};

// pose gate sheet (tools/posesheet.html?topic=tickle): [label, who, pose, expression, props]
export const POSE_SHEET = [
  ['boredChin', 'guy', 'boredChin', 'bored', 'chair desk'], ['slumpSit', 'guy', 'slumpSit', 'bored', 'chair desk'],
  ['tickleArmpit', 'guy', 'tickleArmpit', 'neutral', 'chair'], ['tickleRibs2', 'guy', 'tickleRibs2', 'annoyed', 'chair desk'],
  ['tickleFeet', 'guy', 'tickleFeet', 'annoyed', 'chair desk'], ['deadpan', 'guy', 'deadpan', 'bored', 'chair desk'],
  ['writeTest (shocked)', 'guy', 'writeTest', 'shocked', 'chair desk'], ['jumpScream', 'guy', 'jumpScream', 'scream', 'chair'],
  ['embarrassed', 'guy', 'embarrassed', 'awkward', 'chair desk'],
  ['writeTest2', 'girl', 'writeTest2', 'neutral', 'chair desk'], ['smirkLean', 'girl', 'smirkLean', 'smirk', 'chair desk'],
  ['pokeSide', 'girl', 'pokeSide', 'smirk', 'chair'], ['laughHold', 'girl', 'laughHold', 'laugh', 'chair'], ['whistleAway', 'girl', 'whistleAway', 'whistle', 'chair desk'],
  ['leanBack (Brain HQ)', 'guy', 'leanBack', 'happy', 'stool'], ['pressButtons', 'guy', 'pressButtons', 'neutral', 'stool'],
  ['pullLever', 'guy', 'pullLever', 'smirk', 'stool'], ['shocked', 'guy', 'shocked', 'shocked', 'stool'], ['panic', 'guy', 'panic', 'scream', 'stool'],
  ['classmate writeTest', 'npc', 'writeTest', 'neutral', 'chair desk'], ['classmate classTurn', 'npc', 'classTurn', 'shocked', 'chair'],
  ['teacher standGrade', 'npc', 'standGrade', 'neutral', ''], ['teacher standLook', 'npc', 'standLook', 'shocked', ''],
];
// a variation of a pose: rotations scaled by k (less / more twist), plus an extra head turn / tilt
function vary(p, k, head = 0) {
  const o = JSON.parse(JSON.stringify(p));
  for (const part of ['armL', 'armR', 'legL', 'legR', 'head']) if (o[part] && o[part].r) o[part].r = o[part].r.map(v => v * (part.startsWith('leg') ? 1 : k));
  if (o.head && o.head.r) { o.head.r[1] += head * Math.sign(o.root?.ry || 1); o.head.r[2] += head * .5; }
  if (o.root) { o.root.ry *= k; }
  return o;
}
export async function setup({ CAST, world, scene }) {
  const P = await import(new URL('kit/props/school.js', document.baseURI).href), { buildBrainRoom } = await import(new URL('kit/sets/brainroom.js', document.baseURI).href);
  const F = Math.PI, seat = (x, z) => [x, 0, z + .5], L = LOCAL_POSES;
  // ---------- dress the room for a test ----------
  world.board.write((x, w, h) => { x.fillStyle = '#c62828'; x.font = `800 ${h * .16}px Fredoka, Comic Sans MS, sans-serif`; x.fillText('SCIENCE TEST', w * .05, h * .22); x.fillStyle = '#333'; x.font = `600 ${h * .085}px Comic Sans MS, sans-serif`; x.fillText('No talking.  Eyes on your own paper.', w * .06, h * .42); x.fillText('Time left: 20 min', w * .06, h * .58); });
  const used = new Set(['-0.9,2.8', '0.9,2.8', '-2.7,-2.3', '0.9,-2.3', '-0.9,-0.6', '0.9,-0.6', '2.7,-0.6', '-2.7,1.1', '-0.9,1.1', '2.7,1.1']);
  for (const d of world.desks) { const k = `${d.desk.position.x},${d.desk.position.z}`; if (!used.has(k)) continue; const p = P.testPaper({ seed: d.row * 7 + d.col, answered: k === '-0.9,2.8' ? .15 : .3 + ((d.row + d.col) % 3) * .2 }); p.position.set(.02, .742, .02); p.rotation.y = (d.col - 1.5) * .05; d.desk.add(p);
    const pc = P.pencil(); pc.position.set(.17, .748, .06); pc.rotation.y = .6; d.desk.add(pc); }
  { const td = world.teacher.desk; for (let i = 0; i < 4; i++) { const p = P.testPaper({ seed: 90 + i, answered: 1 }); p.position.set(-.3 + i * .004, .762 + i * .002, .05); p.rotation.y = .1 * i; td.add(p); } }
  // ---------- cast ----------
  const guy = await CAST.castMain('guy'), girl = await CAST.castMain('girl'), op = await CAST.castMain('guy', { seed: 11 });
  const npc = []; for (const [sex, i] of [['m', 1], ['f', 2], ['m', 3], ['f', 4], ['m', 5], ['f', 6], ['m', 7], ['f', 8]]) npc.push(await CAST.castBlank(sex, i));
  const teacher = await CAST.castBlank('m', 9);
  const SEATS = [[-2.7, -2.3], [.9, -2.3], [-.9, -.6], [.9, -.6], [2.7, -.6], [-2.7, 1.1], [-.9, 1.1], [2.7, 1.1]];
  // ---------- the class turns round: every classmate reacts their own way, and the furniture moves like it would ----------
  // Behaviours: 'chair' swings the chair round toward him (chair turns, body rides it, head finishes the look),
  // 'twist' stays in the chair and twists the torso, 'stand' jumps up and the chair skids back, 'lean' twists and leans
  // out into the aisle. The head always looks AT him (computed), so nobody stares at a wall. Xavier's classTurn pose is
  // only the reference for arms / legs.
  const GUY_HEAD = new THREE.Vector3(-.9, 1.35, 3.4), wrap = a => Math.atan2(Math.sin(a), Math.cos(a)), clamp = (v, a) => Math.max(-a, Math.min(a, v));
  const BEHAVE = ['stand', 'chair', 'twist', 'chair', 'lean', 'twist', 'chair', 'twist'], chairFx = [];
  const chairOf = (x, z) => world.desks.find(d => d.desk.position.x === x && d.desk.position.z === z);
  npc.forEach((n, i) => {
    const [x, z] = SEATS[i], d = 34.4 + [3, 6, 1, 2, 5, 0, .5, 4][i] * .14, sx = x, sz = z + .5, b = BEHAVE[i];
    let need = wrap(Math.atan2(GUY_HEAD.x - sx, GUY_HEAD.z - sz) - F); if (Math.abs(Math.abs(need) - Math.PI) < .15) need = (i % 2 ? 1 : -1) * 2.9;   // right behind: pick a side
    const s = Math.sign(need) || 1, base = vary(s < 0 ? L.classTurn : mirrorPose(L.classTurn), .85 + ((i * 5) % 7) * .05, 0);
    const look = (bodyYaw, extra = {}) => { const p = JSON.parse(JSON.stringify(base)); p.root = { ...(p.root || {}), ry: bodyYaw, ...extra.root };
      p.head = { r: [-.08 + (i % 3) * .05, clamp(need - bodyYaw - (extra.chair || 0), 1.7), (i % 2 ? .1 : -.08)] }; return p; };
    const sit = seat(x, z), keys = [{ t: 0, pose: i % 2 ? L.writeTest2 : L.writeTest, expr: 'neutral', at: sit, face: F },
      { t: 10 + i * .7, pose: i % 2 ? L.writeTest : L.writeTest2 }, { t: 20 + i * .5, pose: i % 2 ? L.writeTest2 : L.writeTest }];
    const ch = chairOf(x, z).chair, c0 = ch.position.clone(), r0 = ch.rotation.y;
    if (b === 'chair') {          // swing the chair ~70% of the way round, slide it back a touch, body rides it
      const a = clamp(need * .7, 1.9), tw = clamp(need * .12, .3);
      keys.push({ t: d, pose: look(tw, { chair: a }), expr: 'surprised', at: [sx, 0, sz + .12], face: F + a, dur: .55, ease: 'out' },
        { t: d + 1.2, pose: look(tw * 1.2, { chair: a }), expr: i % 2 ? 'laugh' : 'shocked' });
      chairFx.push(t => { const k = THREE.MathUtils.smoothstep(t, d - .02, d + .5); ch.rotation.y = r0 + a * k; ch.position.set(c0.x, c0.y, c0.z + .12 * k); });
    } else if (b === 'stand') {   // shoots up out of the chair; the chair skids back and rocks
      const yaw = clamp(need * .8, 2.6);
      keys.push({ t: d, pose: look(0, { chair: yaw }), expr: 'shocked', at: [sx + .5, 0, sz + .35], face: F + yaw, style: 'snap', snap: 1.1 },
        { t: d + 1.2, pose: look(0, { chair: yaw }), expr: 'surprised' });
      // standing: drop the seated legs and sit offset from the reference
      for (const k of keys.slice(-2)) { k.pose.legL = [.08, -1, .05]; k.pose.legR = [-.1, -1, -.06]; k.pose.armL = [.5, .2, .84]; k.pose.armR = [-.45, .28, .85]; k.pose.root = { y: 0, rx: -.08, ry: 0 }; }
      chairFx.push(t => { const u = Math.max(0, t - d), slide = .28 * (1 - Math.exp(-u * 7)) * (t > d ? 1 : 0), rock = u > 0 ? .22 * Math.exp(-u * 5) * Math.sin(u * 16) : 0;
        ch.position.set(c0.x, c0.y + Math.max(0, rock) * .1, c0.z + slide); ch.rotation.set(-Math.max(0, rock), r0 + (u > 0 ? .25 * (1 - Math.exp(-u * 6)) : 0), 0); });
    } else if (b === 'lean') {    // stays seated, twists hard and leans out into the aisle to see past the others
      const tw = clamp(need * .45, .85);
      keys.push({ t: d, pose: look(tw, { root: { rz: s * -.28, rx: -.06 } }), expr: 'surprised', snap: 1.2 },
        { t: d + 1.2, pose: look(tw * 1.1, { root: { rz: s * -.34, rx: -.08 } }), expr: 'laugh' });
    } else {                      // twist in the chair; the chair shifts a little as the weight moves
      const tw = clamp(need * .42, .8);
      keys.push({ t: d, pose: look(tw), expr: i % 3 ? 'shocked' : 'surprised', snap: 1.2 }, { t: d + 1.2, pose: look(tw * 1.12), expr: i % 2 ? 'laugh' : 'shocked' });
      chairFx.push(t => { const k = THREE.MathUtils.smoothstep(t, d, d + .35); ch.rotation.y = r0 + tw * .18 * k; ch.position.set(c0.x, c0.y, c0.z + .04 * k); });
    }
    n.keys = keys;
  });
  teacher.keys = [{ t: 0, pose: L.standGrade, expr: 'neutral', at: [1.05, 0, -3.25], face: -.25 }, { t: 33.0, pose: L.standLook, expr: 'shocked', style: 'snap', snap: 1.2 }];   // standing at the front, marking papers
  guy.keys = [
    { t: 0, pose: 'boredChin', expr: 'bored', at: seat(-.9, 2.8), face: F },
    { t: 1.6, pose: 'slumpSit', expr: 'bored' },
    { t: 2.6, pose: 'tickleArmpit', expr: 'neutral' },
    { t: 3.3, pose: L.tickleRibs2, expr: 'neutral' },
    { t: 4.3, pose: 'deadpan', expr: 'frustrated' },
    { t: 5.9, pose: L.tickleRibs2, expr: 'annoyed', steps: 2 },
    { t: 7.5, pose: 'tickleArmpit', expr: 'annoyed' },
    { t: 9.1, pose: L.tickleRibs2, expr: 'annoyed' },
    { t: 10.1, pose: L.tickleFeet, expr: 'annoyed', at: [-.9, .03, 3.6] },              // shoves the chair back, tips it, grabs his foot
    { t: 11.1, pose: 'deadpan', expr: 'annoyed', steps: 0, at: [-.9, 0, 3.3] },
    { t: 15.0, pose: L.tickleRibs2, expr: 'neutral' },
    { t: 23.0, pose: L.writeTest, expr: 'bored' },
    { t: 29.0, pose: L.writeTest, expr: 'neutral' },
    { t: 30.7, pose: L.writeTest, expr: 'confused', style: 'snap', snap: 1.4 },          // the poke lands: he freezes, confused
    { t: 32.8, pose: 'jumpScream', expr: 'scream', style: 'snap', snap: 1.6, bounce: .35 },
    { t: 33.9, pose: 'jumpScream', expr: 'scream' },
    { t: 35.2, pose: L.embarrassed, expr: 'awkward', at: [-.9, 0, 3.62] },   // sits back down where the chair skidded to
  ];
  girl.keys = [
    { t: 0, pose: L.writeTest2, expr: 'neutral', at: seat(.9, 2.8), face: F },
    { t: 4.3, pose: L.writeTest2, expr: 'neutral' },
    { t: 29.2, pose: L.smirkLean, expr: 'smirk' },
    { t: 30.4, pose: 'pokeSide', expr: 'smirk', at: [.55, 0, 3.3], snap: 1.3 },
    { t: 31.3, pose: L.smirkLean, expr: 'smirk', at: [.9, 0, 3.3] },
    { t: 33.0, pose: L.laughHold, expr: 'laugh' },
    { t: 34.3, pose: L.whistleAway, expr: 'whistle', dur: .5 },                     // the class turns round: she whistles, looking away, did nothing
  ];
  // ---------- Brain HQ (inside his head) ----------
  const B = buildBrainRoom(scene, { at: [300, 0, 0] }), O = [300, 0, 0], zF = -3.6 * .62 + .12;
  // his right hand rides the TICKLE lever knob: he scoots over, grabs it up, drags it down (knob positions from the set)
  const LEV_F = F - .45, LEV_AT = [300 + .5, .03, zF + 1.42];
  const handOn = l => { const k = B.knobAt(l), c = Math.cos(LEV_F), sn = Math.sin(LEV_F), sh = [LEV_AT[0] + -.38 * c, LEV_AT[1] + .97, LEV_AT[2] - -.38 * sn];
    const wx = k.x - sh[0], wy = k.y - sh[1], wz = k.z - sh[2], lx = wx * c - wz * sn, lz = wx * sn + wz * c;
    return { legL: [.1, -.08, 1], legR: [-.08, -.08, 1], armL: [.15, -.8, .5], armR: [lx, wy, lz], head: [-.35, .35, -.05], root: { y: -.22, rx: .06 } }; };
  B.handReach = l => { const k = B.knobAt(l), c = Math.cos(LEV_F), sn = Math.sin(LEV_F); return Math.hypot(k.x - (LEV_AT[0] - .38 * c), k.y - (LEV_AT[1] + .97), k.z - (LEV_AT[2] + .38 * sn)); };
  op.keys = [
    { t: 0, pose: L.slouchBack, expr: 'cool', at: [300, .03, zF + 1.75], face: F },              // chilling, slouched back, shades on
    { t: 15.6, pose: L.pressButtons, expr: 'neutral' },
    { t: 17.0, pose: L.pressButtons, expr: 'happy' },
    { t: 18.3, pose: 'cheer', expr: 'happy', style: 'snap', snap: 1.2 },
    { t: 19.3, pose: L.pressButtons, expr: 'smirk' },
    { t: 20.15, pose: handOn(1), expr: 'smirk', at: LEV_AT, face: LEV_F, dur: .35 },                // grabs the lever knob
    { t: 20.6, pose: handOn(.5), expr: 'smirk', dur: .5, ease: 'io', hold: 0 },
    { t: 21.1, pose: handOn(0), expr: 'happy', dur: .5, ease: 'io', hold: 0 },                    // drags it all the way down
    { t: 22.5, pose: L.lookHands, expr: 'thinking', at: [300, .03, zF + 1.75], face: F },          // "your own hands": looks at his hands
    { t: 23.9, pose: L.lookCam, expr: 'happy' },                                                  // "never startle you": looks at us
    { t: 25.9, pose: L.guardLean, expr: 'squint' },                                               // security guard squinting at the feed
    { t: 28.1, pose: L.panic, expr: 'scream', style: 'snap', steps: 2 },
  ];
  // ---------- camera ----------
  const R = (x, y, z) => [O[0] + x, O[1] + y, O[2] + z];
  // FRAMING (R6 bodies are bulky: shoot long-lens from 3-4 m, over the classmates' heads, never from 1 m)
  // shot(target head, yaw deg from his front (+ = toward the windows, -x), distance, camera height, frame height in m)
  const D2R = Math.PI / 180, GH = [-.9, 1.2, 3.2], HH = [.9, 1.2, 3.2], MID = [0, 1.15, 3.2];
  const shot = (tg, yaw, dist, y, frameH, o = {}) => { const a = yaw * D2R, p = [tg[0] - Math.sin(a) * dist, y, tg[2] - Math.cos(a) * dist], d = Math.hypot(p[0] - tg[0], p[1] - tg[1], p[2] - tg[2]);
    return { p, l: [tg[0], tg[1] + (o.ly ?? 0), tg[2]], fov: 2 * Math.atan(frameH / 2 / d) / D2R, ...o }; };
  const camera = [
    // B1: bored mid-test, cold open on him (front-left, high over the classmates)
    { t: 0, ...shot(GH, 32, 3.2, 1.85, 1.05) },
    { t: 1.45, ...shot(GH, 28, 3.1, 1.82, .9) },
    { t: 1.5, p: [-.6, 3.0, -4.6], l: [-.5, .7, 2.6], fov: 42, cut: true },               // "in class": high wide, everyone writing
    { t: 2.3, p: [-.6, 2.95, -4.3], l: [-.7, .8, 2.9], fov: 36 },
    { t: 2.35, ...shot(GH, -30, 3.2, 1.8, 1.3, { ly: -.2, cut: true }) },              // tries to tickle
    { t: 4.1, ...shot(GH, -26, 3.1, 1.75, 1.15, { ly: -.15 }) },
    { t: 4.15, ...shot(GH, 25, 3.6, 1.75, .8, { ly: .05, cut: true }) },              // nothing happened: tight deadpan
    { t: 5.7, ...shot(GH, 23, 3.6, 1.72, .68, { ly: .05 }) },
    // B2: harder
    { t: 5.75, ...shot(GH, 40, 3.2, 1.7, 1.4, { ly: -.25, cut: true }) },
    { t: 7.3, ...shot(GH, 30, 3.1, 1.75, 1.15, { ly: -.15 }) },
    { t: 9.0, ...shot(GH, -32, 3.2, 1.7, 1.3, { ly: -.25 }) },
    { t: 10.0, ...shot([-.9, .95, 3.1], 38, 3.3, 1.75, 1.6, { ease: 'out' }) },          // the feet: foot up on the desk          // the feet
    { t: 11.0, ...shot(GH, 25, 3.6, 1.75, .85, { ly: .05, cut: true }) },
    { t: 13.3, ...shot(GH, 23, 3.7, 1.72, .6, { ly: .05 }) },
    // B3: "You see" -> push into his forehead, cut into Brain HQ
    { t: 13.35, ...shot(GH, 0, 1.2, 1.45, .7, { ly: .1, cut: true }) },
    { t: 13.95, p: [-.9, 1.35, 2.98], l: [-.9, 1.33, 3.3], fov: 32, ease: 'in' },
    { t: 14.0, p: R(1.3, 1.75, -1.6), l: R(0, .95, -.4), fov: 54, cut: true },         // Brain HQ wide: little him, relaxed
    { t: 15.8, p: R(1.2, 1.6, -1.45), l: R(0, .95, -.5), fov: 48 },
    { t: 16.3, p: R(-.95, 1.6, -.55), l: R(0, 1.36, -1.36), fov: 40, cut: true },        // over his shoulder: the screen predicts
    { t: 18.25, p: R(-.75, 1.55, -.75), l: R(0, 1.36, -1.36), fov: 36 },
    { t: 18.3, p: R(1.3, 1.65, -1.6), l: R(0, .95, -.45), fov: 48, cut: true },        // him: thumbs-up, happy, pressing buttons
    { t: 20.15, p: R(1.15, 1.55, -1.4), l: R(0, .95, -.45), fov: 44 },
    { t: 20.2, p: R(1.95, 1.62, -.5), l: R(.35, 1.2, -1.3), fov: 42, cut: true },     // pulls the TICKLE lever down
    { t: 22.3, p: R(1.85, 1.6, -.55), l: R(.3, 1.2, -1.3), fov: 38 },
    { t: 22.4, p: R(-1.15, 1.45, -1.75), l: R(0, .95, -.45), fov: 46, cut: true },         // never startle you: leans back
    { t: 25.2, p: R(-1.05, 1.42, -1.65), l: R(0, .98, -.4), fov: 42 },
    { t: 25.9, p: R(-1.0, 1.4, -1.7), l: R(0, 1.0, -.45), fov: 44, cut: true },   // front-side: his squint + the red screen edge        // UNKNOWN FINGER: leans in, squinting at the feed
    { t: 28.05, p: R(-.9, 1.38, -1.62), l: R(0, 1.0, -.45), fov: 40 },
    { t: 28.1, p: R(-.8, 1.4, -1.6), l: R(0, 1.27, -.4), fov: 40, cut: true, roll: .05, zoom: true },   // SCARED: punch in on his face
    { t: 28.75, p: R(-.7, 1.38, -1.45), l: R(0, 1.29, -.4), fov: 34, roll: .08, ease: 'out', zoom: true },
    // B4: the poke (two-shot from the right, girl in front)
    { t: 28.85, ...shot(MID, -72, 3.8, 2.15, 1.7, { ly: -.15, cut: true }) },
    { t: 30.2, ...shot(MID, -70, 3.6, 2.1, 1.5, { ly: -.15 }) },
    { t: 30.25, p: [1.9, 2.25, 4.4], l: [-.5, .95, 3.2], fov: 38, cut: true },          // poke, over her shoulder        // poke
    { t: 30.95, p: [1.85, 2.2, 4.35], l: [-.55, .95, 3.2], fov: 35 },
    { t: 31.0, p: [0, 3.0, -4.6], l: [0, .7, 2.4], fov: 44, cut: true },               // middle of the test: silence
    { t: 32.7, p: [0, 2.95, -4.4], l: [0, .75, 2.6], fov: 40 },
    { t: 32.75, ...shot(GH, 28, 3.3, 1.75, 1.5, { ly: .2, cut: true, roll: -.05 }) },   // SCREAM
    { t: 33.5, ...shot([-.82, 1.2, 3.35], 28, 3.3, 1.75, 1.3, { ly: .38, zoom: true, ease: 'out', roll: -.04 }) },   // zoom in on the scream
    { t: 34.3, ...shot([-.82, 1.2, 3.35], 28, 3.3, 1.75, 1.2, { ly: .38, zoom: true }) },
    { t: 34.35, p: [3.0, 2.15, 4.55], l: [-.3, 1.0, .4], fov: 46, cut: true },            // the whole class turns around
    { t: 36.0, p: [2.9, 2.1, 4.45], l: [-.3, 1.0, .5], fov: 42 },
    { t: 36.05, p: [2.7, 1.85, 1.55], l: [.25, 1.1, 3.4], fov: 50, cut: true },           // end: him awkward, her laughing
    { t: 37.8, p: [2.6, 1.82, 1.7], l: [.2, 1.1, 3.4], fov: 47 },
  ];
  // Xavier 2026-10-22: "the camera is kinda too close": every non-wide shot opens up ~25%
  for (const k of camera) if (k.fov < 44 && !k.zoom) k.fov = Math.min(44, k.fov * 1.25);
  // eye windows: bake his POV of the classroom once (desk, test paper, the class ahead)
  async function bake(renderer) {
    for (const a of [guy, girl, teacher, ...npc]) a.update(22.5);
    guy.A.root.visible = false; guy.A.root.updateMatrixWorld(true);
    const cam = new THREE.PerspectiveCamera(78, 2, .05, 200); cam.position.set(-.9, 1.32, 3.18); cam.lookAt(-.9, .95, 1.4);
    const rt = new THREE.WebGLRenderTarget(1024, 512, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
    renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); guy.A.root.visible = true;
    B.setView(rt.texture);
  }
  // per-frame state of Brain HQ
  // his chair: shoved back 0.3 m and tipped onto its back legs while he goes for his foot (9.95-11.45 s)
  const myChair = world.desks.find(d => d.desk.position.x === -.9 && d.desk.position.z === 2.8).chair, chairBase = myChair.position.clone();
  function chairAt(t) {
    const k = THREE.MathUtils.smoothstep(t, 9.95, 10.35) * (1 - THREE.MathUtils.smoothstep(t, 11.05, 11.45)), th = .18 * k, R = .17;   // pivot: back legs, 0.17 m behind the seat centre
    myChair.rotation.x = th; myChair.position.set(chairBase.x, chairBase.y + R * Math.sin(th), chairBase.z + .3 * k + R - R * Math.cos(th));
  }
  // the scream: he launches up, his chair skids back 0.32 m (tips back, slams down, rocks), his desk jolts forward
  const myDesk = world.desks.find(d => d.desk.position.x === -.9 && d.desk.position.z === 2.8).desk, deskBase = myDesk.position.clone();
  function screamFx(t) {
    const u = t - 32.8; if (u < 0) return false;
    const slide = .32 * (1 - Math.exp(-u * 6)), tip = .35 * Math.exp(-u * 4.5) * Math.max(0, Math.sin(u * 9)), R = .17;
    myChair.rotation.set(tip, 0, .04 * Math.exp(-u * 3) * Math.sin(u * 13)); myChair.position.set(chairBase.x, chairBase.y + R * Math.sin(tip), chairBase.z + slide + R - R * Math.cos(tip));
    const j = Math.exp(-u * 7); myDesk.position.set(deskBase.x, deskBase.y, deskBase.z - .06 * (1 - j)); myDesk.rotation.set(0, .05 * j * Math.sin(u * 20), .02 * j * Math.sin(u * 25));
    return true;
  }
  // her chair swivels toward him as she leans in for the poke
  const herChair = world.desks.find(d => d.desk.position.x === .9 && d.desk.position.z === 2.8).chair, herR0 = herChair.rotation.y;
  // little music notes rising from her while she 'whistles'
  const { textSprite } = await import(new URL('kit/util.js', document.baseURI).href);
  const notes = ['♪', '♫', '♪'].map((ch, i) => { const sp = textSprite(ch, { size: 120, color: '#2a2a2a', scale: .24 }); sp.material.depthTest = true; sp.visible = false; scene.add(sp); return sp; });
  B.predictT = 16.3;
  function update(t) {
    if (!screamFx(t)) chairAt(t);
    for (const f of chairFx) f(t);
    herChair.rotation.y = herR0 - .3 * THREE.MathUtils.smoothstep(t, 29.1, 29.7);
    notes.forEach((n, i) => { const u = t - 34.6 - i * .55; n.visible = u > 0; if (u > 0) { const c = (u % 1.65) / 1.65; n.position.set(.75 + Math.sin(c * 5 + i) * .07, 1.42 + c * .55, 3.1 - c * .1); n.material.opacity = Math.min(1, c * 5) * (1 - c); } });
    const st = t < 16.3 ? 'idle' : t < 20.2 ? 'predict' : t < 25.9 ? 'muted' : 'unknown';
    const lever = t < 20.55 ? 1 : t < 21.65 ? 1 - THREE.MathUtils.smoothstep(t, 20.55, 21.65) : t < 26 ? 0 : Math.min(1, (t - 26) * 3);
    B.set({ screen: st, lever, gauge: t < 26 ? (t < 20.6 ? .45 : .45 - .35 * Math.min(1, (t - 20.6) / .9)) : .98, alarm: t > 26 ? 1 : 0, pulse: t > 14 && t < 28.7 ? (t * .9) % 1 : -1, t, hideCables: t >= 20.2 && t < 28.85 ? [0, 1, 2, 3] : [] });
  }
  return { cast: { guy, girl, op, teacher, ...Object.fromEntries(npc.map((n, i) => ['n' + i, n])) }, camera, update, bake, keep: [B.group] };
}
