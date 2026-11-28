// FACE SETS (2026-11-19). One vocabulary of 32 emotions + 16 mouth shapes (visemes) for every face family:
//   ai:<style>   Xavier's AI sheets (assets/faces/sprites/<style>: A01-B32 faces, C01-C16 mouths, D01-D16 eyes)
//   kit:<style>  the old repo's face kit (explainer-kit facekit.js, 12 drawing styles, ~80 expressions + talk mouths)
//   classicA / classicB   the Classic Roblox Facepack (bloccoPNG): separate eyes / mouths / brows, layered
//   static:<file>   one fixed catalogue face (CLASSIC_FACES zip): background extras only, never changes
// faceSpec(set, emotion, viseme?) -> the rig spec part ({ faceSprite } or { faceKit }); viseme null = the emotion's own mouth.
export const EMOTIONS = ['neutral', 'happy', 'laugh', 'giggle', 'sad', 'crying', 'angry', 'furious', 'shocked', 'scared', 'nervous', 'smug', 'wink', 'love', 'confused', 'sleepy',
  'surprised', 'terrified', 'disgusted', 'annoyed', 'suspicious', 'embarrassed', 'excited', 'proud', 'pout', 'evil', 'crazy', 'thinking', 'bored', 'dizzy', 'ko', 'determined'];
export const VISEMES = ['rest', 'MBP', 'AI', 'E', 'O', 'UW', 'FV', 'L', 'TH', 'etc', 'smile', 'talkSmile', 'talkFrown', 'shout', 'gasp', 'tongue'];
// AI sheet placement on the decal (k = size about the centre, dy = shift down, as a fraction of the decal)
export const AI_PLACE = { '05_intimidating': { k: .96, dy: -.06 }, '11_silly_derpy': { k: .9, dy: -.04 }, '13_sleepy_chibi_doll': { k: .86, dy: -.05 }, '16_shy_moe_smirk': { k: .86, dy: -.05 } };
const SPR = 'assets/faces/sprites', PK = 'assets/faces/packs';
const cell = e => { const i = Math.max(0, EMOTIONS.indexOf(e)); return i < 16 ? `A${String(i + 1).padStart(2, '0')}` : `B${String(i + 1).padStart(2, '0')}`; };
// old face kit: our emotion -> its expression, our viseme -> its talk mouth
const KIT_E = { giggle: 'grin', crying: 'crying', furious: 'furious', nervous: 'nervous', love: 'love', confused: 'confused', sleepy: 'sleepy', surprised: 'surprised',
  terrified: 'terrified', disgusted: 'disgusted', annoyed: 'annoyed', suspicious: 'sus', embarrassed: 'embarrassed', excited: 'excited', proud: 'triumph', pout: 'pouty',
  evil: 'evil', crazy: 'silly', thinking: 'thinking', bored: 'bored', dizzy: 'dizzy', ko: 'dead', determined: 'determined' };
const KIT_V = { MBP: 'vM', AI: 'vA', E: 'vE', O: 'vO', UW: 'vU', FV: 'vF', L: 'vL', TH: 'vL', etc: 'vE', talkSmile: 'vE', talkFrown: 'vA', shout: 'vA', gasp: 'vO', tongue: 'vL' };
// classic packs: layers by index in assets/faces/packs/classic/index.json order -> file ids
let CLS = null; export const setClassic = idx => { CLS = idx; }; export const loadClassic = async () => CLS || (CLS = await (await fetch(new URL(`${PK}/classic/index.json`, document.baseURI))).json());
const CA = { neutral: [0, 3], happy: [0, 19], laugh: [18, 10], giggle: [18, 14], sad: [0, 20], crying: [22, 20], angry: [6, 11], furious: [12, 11], shocked: [9, 11], scared: [9, 11], nervous: [0, 4],
  smug: [6, 4], wink: [21, 19], love: [18, 14], confused: [0, 23], sleepy: [7, 3], surprised: [9, 11], terrified: [9, 11], disgusted: [13, 5], annoyed: [15, 3], suspicious: [16, 3],
  embarrassed: [18, 1], excited: [2, 10], proud: [7, 19], pout: [0, 14], evil: [6, 1], crazy: [12, 10], thinking: [17, 4], bored: [6, 3], dizzy: [24, 11], ko: [24, 8], determined: [6, 3] };
const CB = { neutral: [34, 33], happy: [34, 29], laugh: [41, 26], giggle: [27, 36], sad: [31, 37, 57], crying: [31, 46, 57], angry: [34, 46, 54], furious: [53, 46, 54], shocked: [25, 38, 55],
  scared: [25, 32, 57], nervous: [34, 32, 57], smug: [52, 30, 61], wink: [42, 29], love: [27, 47], confused: [34, 32, 65], sleepy: [31, 28], surprised: [34, 40, 55], terrified: [25, 38, 57],
  disgusted: [48, 46, 54], annoyed: [49, 28], suspicious: [52, 28, 65], embarrassed: [27, 32], excited: [34, 26, 63], proud: [41, 30], pout: [34, 40], evil: [53, 35, 54], crazy: [25, 26],
  thinking: [50, 28], bored: [31, 33], dizzy: [25, 32], ko: [41, 40], determined: [34, 28, 54] };
const CV = { A: { rest: null, MBP: 3, AI: 10, E: 10, O: 11, UW: 11, FV: 3, L: 10, TH: 8, etc: 4, smile: 19, talkSmile: 10, talkFrown: 11, shout: 11, gasp: 11, tongue: 8 },
             B: { rest: null, MBP: 33, AI: 38, E: 26, O: 38, UW: 40, FV: 28, L: 26, TH: 28, etc: 28, smile: 29, talkSmile: 26, talkFrown: 37, shout: 38, gasp: 38, tongue: 40 } };
const MOUTHS_A = new Set([1, 3, 4, 5, 8, 10, 11, 14, 19, 20, 23]), MOUTHS_B = new Set([26, 28, 29, 30, 32, 33, 35, 36, 37, 38, 40, 46, 47]);
export function faceSpec(set, emo = 'neutral', vis = null, sex = 'm') {
  const [fam, st] = set.split(':');
  if (fam === 'ai') {
    const c = cell(emo), layers = vis && vis !== 'rest' ? [`${SPR}/${st}/${c}e.png`, `${SPR}/${st}/C${String(VISEMES.indexOf(vis) + 1).padStart(2, '0')}.png`] : [`${SPR}/${st}/${c}.png`];
    return { faceSprite: { layers, place: AI_PLACE[st] || {} } };
  }
  if (fam === 'kit') { const e = KIT_E[emo] || emo, v = vis && vis !== 'rest' ? KIT_V[vis] : null; return { faceKit: { style: st, expr: v ? `${e}+${v}` : e, sex } }; }
  if (fam === 'classicA' || fam === 'classicB') {
    const A = fam === 'classicA', L = (A ? CA : CB)[emo] || (A ? CA : CB).neutral, mouthSet = A ? MOUTHS_A : MOUTHS_B;
    let parts = L.slice(); if (vis && vis !== 'rest') { const m = CV[A ? 'A' : 'B'][vis]; parts = parts.filter(p => !mouthSet.has(p)); if (m != null) parts.push(m); }
    return { faceSprite: { layers: parts.map(i => `${PK}/classic/${CLS ? CLS[i].id : i}.png`), place: {} }, _classicIdx: parts };
  }
  if (fam === 'img') return { faceSprite: { layers: [`assets/faces/${st}`], place: { k: .96, dy: -.06 } } };   // one custom face for every emotion (cameos, e.g. 'img:custom/bacon_cold_stare.png')
  if (fam === 'static') return { faceImg: `assets/faces/classic_full/${st}` };
  return {};
}
