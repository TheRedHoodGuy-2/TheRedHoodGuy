// Global look settings for the whole channel. Change here, every topic follows.
export const LOOK = {
  toneMapping: 'ACESFilmicToneMapping',   // 'NeutralToneMapping' or 'AgXToneMapping' for punchier colour
  exposure: .88,
  envIntensity: .3,
  microInner: '#1d4a7a',
  microOuter: '#081426',
  captionFont: 'Montserrat ExtraBold',     // kit/fonts/caption.woff2 (swap the file to change font)
  captionCase: 'lower',                    // 'lower' (channel style) or 'asis'
  captionExtrude: 8, captionY: '74%',   // caption height (lower third); a shot can override with cap: 'top' | 'mid' | 'low'. Extrude = depth of the down-right 3D extrusion, in steps
  calloutColor: '#ffd34d',
  cine: { vignette: 0 },   // Xavier 2026-10-28 'i like b' (depth of field, grade, grain, less flat fill) but NO vignette; &cine=0 turns it off
  ao: { radius: .16, thickness: .12, intensity: 1.4, scale: 1.3 },   // ambient occlusion (filmA GTAO pass); intensity 0 = off
};
