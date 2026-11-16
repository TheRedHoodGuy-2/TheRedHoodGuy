"""Narration. python3 tools/voice.py <script.md|text file> <out.wav> [voice=am_puck] [wpm=262]
Kokoro (local, CPU) speaks the script, then the take is time-stretched (pitch kept) to the channel pace.
The format bible's pace is 262 words a minute with no gaps, so silences longer than 0.30 s are trimmed to 0.18 s first."""
import sys, os, re, subprocess, numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def script_text(path):
    t = open(path).read()
    if '## Script' in t: t = t.split('## Script')[1]
    return re.sub(r'\s+', ' ', t).strip()
def tighten(a, sr, max_gap=.30, keep=.18, thr=.012):
    win = int(sr * .01); env = np.array([np.abs(a[i:i + win]).max() for i in range(0, len(a), win)]); quiet = env < thr; out = []; i = 0
    while i < len(quiet):
        j = i
        while j < len(quiet) and quiet[j] == quiet[i]: j += 1
        seg = a[i * win:j * win]
        if quiet[i] and (j - i) * .01 > max_gap: seg = seg[:int(sr * keep)]
        out.append(seg); i = j
    return np.concatenate(out)
def synth(text, out, voice='am_puck', wpm=262, speed=1.15):
    from kokoro_onnx import Kokoro
    k = Kokoro(f'{ROOT}/tools/models/kokoro.onnx', f'{ROOT}/tools/models/voices.bin')
    parts = []; sr = 24000
    for para in re.split(r'(?<=[.!?])\s+(?=[A-Z])', text):          # sentence by sentence keeps the delivery even
        a, sr = k.create(para, voice=voice, speed=speed, lang='en-us'); parts.append(a)
    a = tighten(np.concatenate(parts), sr); tmp = out + '.tmp.wav'; sf.write(tmp, a, sr)
    words = len(text.split()); now = words / (len(a) / sr) * 60; tempo = max(.8, min(1.6, wpm / now))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'atempo={tempo:.4f},loudnorm=I=-15:TP=-1.5:LRA=7', '-ar', '48000', out], check=True); os.remove(tmp)
    d = sf.info(out).duration; print(f'{out}: {voice} {words} words, {d:.1f} s, {words / d * 60:.0f} wpm (raw {now:.0f}, tempo x{tempo:.2f})'); return d
if __name__ == '__main__':
    kw = dict(a.split('=') for a in sys.argv[3:]); synth(script_text(sys.argv[1]), sys.argv[2], kw.get('voice', 'am_puck'), float(kw.get('wpm', 262)))
