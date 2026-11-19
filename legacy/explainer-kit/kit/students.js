// RANDOM STUDENTS (Xavier 2026-11-12): classmates are generated, not hand-designed. They all wear the SAME school uniform
// (only the two mains wear their own clothes); what varies is skin tone and hair style + colour. Faces are the mains'
// approved face set (Xavier 2026-11-12), so they sit right on the head.
// A US public / charter school uniform is typically a white or light-blue polo with navy or khaki bottoms.
// castStudents(CAST, n, { seed }) -> actors, alternating sexes unless `sexes` is given. Deterministic per seed.
import { stylesFor, naturalHair } from './hair.js';
export const UNIFORM = { shirt: { mode: 'build', color: '#f3f4f0', fabric: null, sleeves: 'short', neck: 'collar', cuffs: true }, pants: { mode: 'color', color: '#27324d', fabric: null } };
const SKIN = ['#f7d7bd', '#efc4a0', '#e0b088', '#cf9a70', '#b97f56', '#9c6542', '#7d4d31', '#5e3824', '#47291b'];
const FACES = ['classic', 'classic', 'tick', 'toon', 'bean', 'marker'];
const rng = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
export function studentSpec(seed = 1, sex = 'm') {
  const R = rng(seed * 7919 + 13); R(); R();
  const styles = stylesFor(sex), hair = styles[Math.floor(R() * styles.length)] || 'none';
  const hc = naturalHair(R, .03), hex = '#' + hc.toString(16).padStart(6, '0');
  return { name: `student_${seed}`, role: 'student', sex, skin: SKIN[Math.floor(R() * SKIN.length)], hair, hairColor: hex, face: FACES[Math.floor(R() * FACES.length)],
    expr: 'neutral', img: {}, key: { on: false }, shading: { mode: 'auto' }, shirt: { ...UNIFORM.shirt }, pants: { ...UNIFORM.pants } };
}
export async function castStudents(CAST, n, { seed = 1, sexes = null, faceScale = .8, mainFaces = true } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) { const sex = sexes ? sexes[i] : (i % 2 ? 'f' : 'm'); out.push(await CAST.castSpec(studentSpec(seed * 100 + i, sex), { seed: seed * 100 + i, faceScale, mainFaces })); }
  return out;
}
