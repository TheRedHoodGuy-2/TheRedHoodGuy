// LIP SYNC (2026-11-19, research/lipsync.md). Mouth shapes come from the AUDIO, phoneme by phoneme:
// Rhubarb Lip Sync (recognises the phonemes in the recording, helped by the transcript) gives timed mouth cues A-H / X
// (A = M B P closed, B = most consonants + EE, C = EH AE, D = AA wide, E = AO ER rounded, F = UW OW W pucker,
//  G = F V teeth on lip, H = L tongue up, X = silence). Then the animation rules every 2D studio uses:
//   1. LEAD: the mouth shape lands ~1 frame BEFORE the sound (the eye reads it in time with the ear).
//   2. HOLD: no shape shorter than 2 frames (no "typewriter" flicker); M B P closures always get their 2 frames.
//   3. REST: silence = the character's own closed mouth from their expression, not a talking shape.
// talkTrack(cues, { fps, lead, hold, offset }) -> t => viseme name (our 16-name set) or null (= silence / own mouth).
export const RHUBARB_TO_VIS = { A: 'MBP', B: 'etc', C: 'E', D: 'AI', E: 'O', F: 'UW', G: 'FV', H: 'L', X: null };
export function talkTrack(cues, { fps = 30, lead = 1, hold = 2, offset = 0 } = {}) {
  const f = 1 / fps, L = lead * f, H = hold * f;
  // 1) shift earlier, map to our names
  let c = cues.map(q => ({ s: q.start + offset - L, e: q.end + offset - L, v: RHUBARB_TO_VIS[q.value] ?? null, a: q.value }));
  // 2) merge cues that are too short: an M B P closure steals time from its neighbour, anything else joins the previous
  for (let pass = 0; pass < 3; pass++) {
    const out = [];
    for (const q of c) {
      const prev = out[out.length - 1];
      if (q.e - q.s >= H - 1e-6 || !prev) { out.push({ ...q }); continue; }
      if (q.a === 'A') { const need = H - (q.e - q.s); prev.e = Math.max(prev.s + f, prev.e - need); q.s = prev.e; out.push({ ...q }); }
      else prev.e = q.e;
    }
    c = out;
  }
  return t => { for (const q of c) if (t >= q.s && t < q.e) return q.v; return null; };
}
// BLINKS (research: blinks are motivated: on a new thought / line, on a head turn or cut, else every 2-5 s;
// close fast (2 frames), hold 1, open slower (2-3 frames)).  blinkTrack(times) -> t => 0 open | 1 half | 2 closed
export function blinkTrack(times, fps = 30) {
  const f = 1 / fps, seq = [[0, 1], [1, 2], [3, 2], [4, 1], [5, 1]];   // frame offset -> state
  return t => { for (const b of times) { const k = Math.floor((t - b) / f); if (k >= 0 && k < 6) return [1, 2, 2, 2, 1, 1][k]; } return 0; };
}
// a natural blink schedule: at each line start (thought change) + every 2.2-4.6 s (seeded), never inside an M B P closure
export function blinkTimes(dur, starts = [], seed = 1) {
  let s = seed, rnd = () => (s = (s * 16807) % 2147483647) / 2147483647, out = [...starts.map(x => x + .05)], t = .6 + rnd();
  while (t < dur) { if (!out.some(b => Math.abs(b - t) < 1.2)) out.push(t); t += 2.2 + rnd() * 2.4; }
  return out.sort((a, b) => a - b);
}
