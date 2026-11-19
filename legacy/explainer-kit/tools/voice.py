"""python3 tools/voice.py <topic>
Reads topics/<topic>/script.json and renders the narration, then writes
voice/voice.wav, voice/beats.json (beat start/end) and voice/words.json (caption timing).

Engines (script.json "engine"):
  gemini      DEFAULT. Google Gemini TTS, voice "Sadaltager" (chosen by Xavier). Whole script in ONE call for natural flow.
              Needs an API key: env GEMINI_API_KEY, ~/.gemini_key, or secrets/gemini_key in the repo (committed by Xavier's choice). Falls back to chatterbox if missing.
  chatterbox  Chatterbox cloning Adam (reference/voice/adam_ref.wav). Local, slow on CPU (8-10 min).
  kokoro      Kokoro am_adam. Local, fast. Drafts only.
Caption words come from the SCRIPT text, timed by Whisper, so names and numbers are never misheard."""
import json, sys, os, re, difflib, subprocess, tempfile, base64, urllib.request, numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
topic = sys.argv[1]; D = os.path.join(ROOT, 'topics', topic); os.makedirs(os.path.join(D, 'voice'), exist_ok=True)
S = json.load(open(os.path.join(D, 'script.json')))
ENGINE = S.get('engine', 'recording')   # default: Xavier's own recording (topics/<name>/voice/recording.mp3); 'chatterbox' = his clone
gap = S.get('gap', .12); lead = .25; tail = S.get('tail', .6)   # tail: silence after the last word (room for an ending gag)
target = S.get('target_max', 72.0)

def gemini_key():
    k = os.environ.get('GEMINI_API_KEY')
    if k: return k.strip()
    for p in (os.path.expanduser(S.get('gemini_key_file', '~/.gemini_key')), os.path.join(ROOT, 'secrets', 'gemini_key')):
        if os.path.exists(p): return open(p).read().strip()
    return None

def stretch(a, sr, tempo):
    with tempfile.TemporaryDirectory() as d:
        sf.write(f'{d}/i.wav', a, sr); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{d}/i.wav', '-filter:a', f'atempo={tempo:.4f}', f'{d}/o.wav'], check=True)
        return sf.read(f'{d}/o.wav', dtype='float32')[0]

def tighten(a, sr, maxp):
    """Shorten every silent stretch longer than maxp seconds down to maxp (punchy short-form pacing; script.json "max_pause")."""
    if not maxp: return a
    hop = int(.01 * sr); n = len(a) // hop
    rms = np.sqrt(np.mean(a[:n * hop].reshape(n, hop) ** 2, 1)); quiet = rms < np.max(rms) * 10 ** (-38 / 20)
    keep, i = [], 0
    while i < n:
        j = i
        while j < n and quiet[j] == quiet[i]: j += 1
        seg = a[i * hop:j * hop]
        if quiet[i] and (j - i) * hop > maxp * sr: h = int(maxp * sr / 2); seg = np.concatenate([seg[:h], seg[-h:]])
        keep.append(seg); i = j
    keep.append(a[n * hop:]); return np.concatenate(keep)

def fit_tempo(seconds):
    if not S.get('fit', True): return 1.0
    return min(max(1.0, seconds / target), S.get('max_tempo', 1.18))

if ENGINE == 'gemini' and not gemini_key():
    print('no Gemini key found (GEMINI_API_KEY or ~/.gemini_key): falling back to chatterbox', flush=True); ENGINE = 'chatterbox'

per_beat = None   # list of beat audio (chatterbox/kokoro) or None (gemini / recording: one take)
if ENGINE == 'recording':   # Xavier records the narration himself (default from 2026-10-21): just time it
    rec = os.path.join(D, S.get('recording', 'voice/recording.mp3'))
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', rec, '-ac', '1', '-ar', '24000', '-af', 'loudnorm=I=-16:TP=-1.5', '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    sr = 24000; take = np.frombuffer(raw, np.float32).copy()
    audio = np.concatenate([np.zeros(int(lead * sr), np.float32), take, np.zeros(int(tail * sr), np.float32)])
    print(f'recording {os.path.basename(rec)}: {len(take) / sr:.1f}s', flush=True)
elif ENGINE == 'gemini':
    text = ' '.join(S['beats'])
    body = {"model": S.get('gemini_model', 'gemini-3.8-flash-tts'), "input": [{"type": "user_input", "content": [{"type": "text", "text": text}]}],
            "response_format": {"type": "audio"}, "generation_config": {"speech_config": [{"voice": S.get('gemini_voice', 'Sadaltager')}]}}
    req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/interactions', data=json.dumps(body).encode(),
                                 headers={'Content-Type': 'application/json', 'x-goog-api-key': gemini_key()})
    with urllib.request.urlopen(req, timeout=600) as r: j = json.loads(r.read())
    wav = next(base64.b64decode(c['data']) for st in j.get('steps', []) for c in st.get('content', []) if c.get('type') == 'audio')
    with tempfile.NamedTemporaryFile(suffix='.wav') as f: f.write(wav); f.flush(); take, sr = sf.read(f.name, dtype='float32')
    if take.ndim > 1: take = take.mean(1)
    raw = len(take) / sr; take = tighten(take, sr, S.get('max_pause'))
    if S.get('max_pause'): print(f'pauses tightened: {raw:.1f}s -> {len(take) / sr:.1f}s')
    tempo = fit_tempo(lead + len(take) / sr + tail)
    if tempo > 1.001: take = stretch(take, sr, tempo); print(f'time-stretched x{tempo:.3f} to fit {target}s')
    audio = np.concatenate([np.zeros(int(lead * sr), np.float32), take.astype(np.float32), np.zeros(int(tail * sr), np.float32)])
    print(f'gemini {S.get("gemini_voice", "Sadaltager")}: {len(take) / sr:.1f}s', flush=True)
else:
    if ENGINE == 'chatterbox':
        import torch
        from chatterbox.tts import ChatterboxTTS
        m = ChatterboxTTS.from_pretrained(device='cpu'); sr = m.sr
        ref = os.path.join(ROOT, S.get('voice_ref', 'reference/voice/xavier_ref.wav'))
        def say(text):
            torch.manual_seed(S.get('seed', 3))
            return m.generate(text, audio_prompt_path=ref, exaggeration=S.get('exaggeration', .5), cfg_weight=S.get('cfg', .5)).squeeze(0).numpy().astype(np.float32)
    else:
        from kokoro_onnx import Kokoro
        MD = os.path.join(ROOT, 'tools', 'models'); k = Kokoro(os.path.join(MD, 'kokoro.onnx'), os.path.join(MD, 'voices.bin')); sr = 24000
        def say(text):
            a, _ = k.create(text, voice=S.get('voice', 'am_adam'), speed=S.get('kokoro_speed', 1.0), lang=S.get('lang', 'en-us')); return a.astype(np.float32)
    per_beat = []
    for i, b in enumerate(S['beats']):
        a = tighten(say(b), sr, S.get('max_pause')); per_beat.append(a); print(f'beat {i + 1}/{len(S["beats"])}: {len(a) / sr:.1f}s', flush=True)   # continuous telling: cap every pause
    if S.get('tempo'): per_beat = [stretch(a, sr, S['tempo']) for a in per_beat]; print(f"tempo x{S['tempo']}")   # <1 = slower (match a reference read)
    tempo = fit_tempo(lead + sum(len(a) / sr + gap for a in per_beat) + tail)
    if tempo > 1.001: per_beat = [stretch(a, sr, tempo) for a in per_beat]; print(f'time-stretched x{tempo:.3f} to fit {target}s')
    parts = [np.zeros(int(lead * sr), np.float32)]
    for a in per_beat: parts += [a, np.zeros(int(gap * sr), np.float32)]
    parts.append(np.zeros(int(tail * sr), np.float32)); audio = np.concatenate(parts)

def cut_gaps(a, sr, maxg):
    """Breaths and word tails aren't silence, so the level-based trimmer misses them. Use Whisper's word times: any gap
    between words longer than maxg is shortened to maxg (middle removed, 15 ms crossfade). script.json "max_gap"."""
    from faster_whisper import WhisperModel
    import scipy.signal as ss0
    a16 = ss0.resample_poly(a, 16000, sr).astype(np.float32)
    segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(a16, word_timestamps=True, language="en")
    ws = [x for sg in segs for x in sg.words]; cuts = []
    for i in range(len(ws) - 1):
        g0, g1 = ws[i].end + .04, ws[i + 1].start - .03
        if g1 - g0 > maxg: m = (g0 + g1) / 2; cuts.append((m - (g1 - g0 - maxg) / 2, m + (g1 - g0 - maxg) / 2))
    if not cuts: return a
    out, pos, xf = [], 0, int(.015 * sr)
    for c0, c1 in cuts:
        i0, i1 = int(c0 * sr), int(c1 * sr); out.append(a[pos:i0]); pos = i1
    out.append(a[pos:]); res = out[0]
    for seg in out[1:]:
        if len(res) > xf and len(seg) > xf: f = np.linspace(0, 1, xf, dtype=np.float32); res = np.concatenate([res[:-xf], res[-xf:] * (1 - f) + seg[:xf] * f, seg[xf:]])
        else: res = np.concatenate([res, seg])
    print(f"breath gaps cut: {len(cuts)} ({sum(c1 - c0 for c0, c1 in cuts):.2f}s removed)", flush=True); return res
if S.get('max_gap'): audio = cut_gaps(audio, sr, S['max_gap'])
DUR = len(audio) / sr
sf.write(os.path.join(D, 'voice', 'voice.wav'), audio, sr)

# ---- word timing: Whisper heard-words aligned onto the script's own words ----
import scipy.signal as ss
from math import gcd
from faster_whisper import WhisperModel
g_ = gcd(16000, sr); a16 = ss.resample_poly(audio, 16000 // g_, sr // g_).astype(np.float32)
segs, _ = WhisperModel("small", device="cpu", compute_type="int8").transcribe(a16, word_timestamps=True)
heard = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
norm = lambda x: re.sub(r"[^a-z0-9']", '', x.lower())
beat_words = [b.split() for b in S['beats']]
script_words = [w for bw in beat_words for w in bw]
sm = difflib.SequenceMatcher(a=[norm(w) for w in script_words], b=[norm(h[0]) for h in heard], autojunk=False)
times = [None] * len(script_words)
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == 'equal' or (i2 - i1 == j2 - j1):
        for d in range(i2 - i1): times[i1 + d] = heard[j1 + d][1:]
    elif j2 > j1 and i2 > i1:   # unequal span: spread its time across the script words
        s0, e0 = heard[j1][1], heard[j2 - 1][2]
        for d in range(i2 - i1): times[i1 + d] = (s0 + (e0 - s0) * d / (i2 - i1), s0 + (e0 - s0) * (d + 1) / (i2 - i1))
for i in range(len(times)):
    if times[i] is None: p = times[i - 1] if i else (lead, lead + .2); times[i] = (p[1], p[1] + .2)
words = [{"w": re.sub(r'^[^\w°≈+=]+|[^\w°%]+$', '', w), "s": round(s, 3), "e": round(e, 3)} for w, (s, e) in zip(script_words, times)]
json.dump(words, open(os.path.join(D, 'voice', 'words.json'), 'w'))

# ---- beat timing ----
beats = []
if per_beat is not None:   # exact, from the concatenation
    t = lead
    for i, (b, a) in enumerate(zip(S['beats'], per_beat)):
        beats.append({"i": i + 1, "text": b, "start": round(t, 3), "end": round(t + len(a) / sr, 3)}); t += len(a) / sr + gap
else:                      # one take: beat = its first word's start to its last word's end
    k = 0
    for i, (b, bw) in enumerate(zip(S['beats'], beat_words)):
        s0, e0 = times[k][0], times[k + len(bw) - 1][1]; k += len(bw)
        beats.append({"i": i + 1, "text": b, "start": round(max(0, s0 - .05), 3), "end": round(e0, 3)})
json.dump({"duration": round(DUR, 3), "beats": beats}, open(os.path.join(D, 'voice', 'beats.json'), 'w'), indent=1)
print(f"voice ({ENGINE}): {DUR:.2f}s, {len(beats)} beats, {len(words)} words  (target 61-75s)")
