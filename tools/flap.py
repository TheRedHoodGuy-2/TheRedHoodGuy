"""python3 tools/flap.py <wav> <rhubarb json> <out json> [fps]
ANIME-STYLE MOUTH FLAP from the audio itself (research/lipsync.md, 2026-11-19 09:21): per frame, the loudness of the
voice (RMS over one frame, normalised to the line's own loud parts) picks one of three mouths: 0 closed, 1 half, 2 open.
Rules: open on loud syllables, half on quieter ones, closed in silence and on M B P (from Rhubarb A cues); the mouth
leads the sound by 1 frame; every state holds at least 2 frames (no flicker)."""
import sys, json, wave, numpy as np
wav, cues, out = sys.argv[1:4]; fps = int(sys.argv[4]) if len(sys.argv) > 4 else 30
w = wave.open(wav); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float)
if w.getnchannels() > 1: x = x.reshape(-1, w.getnchannels()).mean(1)
n = int(len(x) / sr * fps) + 1; hop = sr / fps
def band(seg):   # loudness in the speech band (300-3000 Hz): syllable nuclei are loud there, the gaps between them dip
    if len(seg) < 8: return 1e-9
    f = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))); fr = np.fft.rfftfreq(len(seg), 1 / sr); return np.sqrt((f[(fr > 300) & (fr < 3000)] ** 2).sum() + 1e-9)
rms = np.array([band(x[int(i * hop):int((i + 1) * hop)]) for i in range(n)])
db = 20 * np.log10(rms / (np.percentile(rms, 95) + 1e-9))          # 0 dB = the line's loud syllables
from scipy.ndimage import maximum_filter1d
db = db - np.minimum(0, maximum_filter1d(db, 31))   # relative to the loudest syllable within +-0.5 s (quiet phrases still flap)
st = np.where(db > -6, 2, np.where(db > -16, 1, 0))   # loud nucleus = open, shoulder = half, dip / silence = closed
for c in json.load(open(cues))['mouthCues']:                # lips together on M B P (Rhubarb A), whatever the loudness
    if c['value'] == 'A': a0 = int(round(c['start'] * fps)); st[a0:a0 + 2] = 0   # a lip closure is short: 2 frames
st = np.r_[st[1:], 0]                                                 # lead the sound by one frame
out_st = np.zeros(n, int); cur, held = 0, 99                   # every state holds 2+ frames: a change waits until the
for f in range(n):                                                # current mouth has been on screen 2 frames
    if st[f] != cur and held >= 2: cur, held = st[f], 0
    out_st[f] = cur; held += 1
json.dump({'fps': fps, 'states': out_st.tolist()}, open(out, 'w')); print(out, 'open', (out_st == 2).mean().round(2), 'half', (out_st == 1).mean().round(2), 'closed', (out_st == 0).mean().round(2))
