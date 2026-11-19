// node tools/facespec.mjs '<json [[set, emotion, viseme|null, sex], ...]>' -> JSON list of rig spec parts
import { faceSpec, setClassic } from '../engine/faceset.js';
import fs from 'fs';
setClassic(JSON.parse(fs.readFileSync(new URL('../assets/faces/packs/classic/index.json', import.meta.url))));
console.log(JSON.stringify(JSON.parse(process.argv[2]).map(([s, e, v, x]) => { const r = faceSpec(s, e, v, x); delete r._classicIdx; return r; })));
