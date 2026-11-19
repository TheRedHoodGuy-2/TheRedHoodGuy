"""python3 tools/sfxmix.py <topic> [--check]
Mixes real sound effects from the bank (kit/assets/sfx/) onto the narration and writes
topics/<topic>/voice/mix.wav, which render.mjs picks up automatically.

Cues live in topics/<topic>/sfx.json:
  [ { "t": 3.2, "sound": "door_open", "vol": 0.8, "trim": 1.5 }, ... ]
  t     = start time in seconds (same clock as the video)
  sound = bank file name without extension (kit/assets/sfx/<sound>.wav|mp3|ogg|m4a)
  vol   = 0..1 (default 0.7), trim = cut the sound after N seconds (optional, 60 ms fade out)

RULE (Xavier 2026-11-10): only real recorded sounds from the bank. Never synthesize a sound.
If any cue's sound is missing, nothing is mixed: the script lists the missing names so Xavier
can fetch them, rename them to those names and send them. --check only lists what's missing."""
import json, os, sys, glob, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANK = os.path.join(ROOT, 'kit', 'assets', 'sfx')
topic = sys.argv[1]; D = os.path.join(ROOT, 'topics', topic)
cues = json.load(open(os.path.join(D, 'sfx.json')))
SR = 48000

def find(name):
    hits = [p for p in glob.glob(os.path.join(BANK, name + '.*')) if not p.endswith('.md')]
    return hits[0] if hits else None

missing = sorted({c['sound'] for c in cues if not find(c['sound'])})
if missing:
    print('MISSING from the bank (ask Xavier for these, named exactly):'); [print('  ' + m) for m in missing]
    sys.exit(1)
if '--check' in sys.argv: print('all sounds in the bank'); sys.exit(0)

import numpy as np, soundfile as sf
def load(p):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

voice = load(os.path.join(D, 'voice', 'voice.wav'))
end = len(voice)   # the track ends with the narration (clean loop); sounds running past it are cut with a short fade
fx = np.zeros(end, np.float32); fxd = np.zeros(end, np.float32)
# DUCKING (Xavier 2026-11-12: "extra sounds must not interfere with the main voice"): opt-in per topic with
# script.json "sfx_duck": 0..1 = level while he is talking (e.g. .35), applied ONLY to cues marked "duck": true
# (crowd / voice-like sounds: oohs, laughs, talking clips). Every other SFX stays at its normal level (Xavier 2026-11-12).
S = json.load(open(os.path.join(D, 'script.json'))) if os.path.exists(os.path.join(D, 'script.json')) else {}
DUCK = S.get('sfx_duck')
for c in cues:
    a = load(find(c['sound']))
    if c.get('trim'):
        a = a[:int(c['trim'] * SR)]; f = min(len(a), int(.06 * SR)); a[-f:] *= np.linspace(1, 0, f)
    a = a / (np.max(np.abs(a)) + 1e-9) * c.get('vol', .7) * 0.5   # sounds sit under the voice
    s = int(c['t'] * SR); a = a[:max(0, end - s)]
    if len(a) and s + len(a) == end: f = min(len(a), int(.05 * SR)); a[-f:] *= np.linspace(1, 0, f)
    (fxd if c.get('duck') else fx)[s:s + len(a)] += a
if DUCK is not None:
    w = int(.03 * SR); env = np.sqrt(np.convolve(voice ** 2, np.ones(w) / w, 'same'))
    talk = (env > 10 ** (-38 / 20) * max(1e-6, np.max(np.abs(voice)))).astype(np.float32)
    g = np.empty_like(talk); up = 1 - np.exp(-1 / (.02 * SR)); down = 1 - np.exp(-1 / (.25 * SR)); v = 0.0
    for i in range(0, end, 64):   # smooth 0/1 talk mask: fast duck, slow release
        tgt = talk[i]; k = up if tgt > v else down; v += (tgt - v) * (1 - (1 - k) ** 64); g[i:i + 64] = v
    fxd *= 1 - (1 - DUCK) * g
    print(f'ducking SFX to {DUCK:.0%} under the voice')
out = voice + fx + fxd
out /= max(1.0, np.max(np.abs(out)) / 0.95)
sf.write(os.path.join(D, 'voice', 'mix.wav'), out, SR)
print(f'mixed {len(cues)} cues -> topics/{topic}/voice/mix.wav')
