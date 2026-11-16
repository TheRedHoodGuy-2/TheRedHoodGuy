import sys, json, os
from faster_whisper import WhisperModel
m = WhisperModel('small.en', device='cpu', compute_type='int8', cpu_threads=2)
for f in sys.argv[1:]:
    out = os.path.join('/home/claude/ref/tr', os.path.basename(f).replace('.mp4', '.json'))
    if os.path.exists(out): continue
    import subprocess, numpy as np
    raw = subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','s16le','-'],capture_output=True).stdout
    audio = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    segs, info = m.transcribe(audio, word_timestamps=True, vad_filter=False)
    words = [{'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2)} for s in segs for w in s.words]
    json.dump({'duration': info.duration, 'words': words}, open(out, 'w'))
    print(os.path.basename(f), round(info.duration, 1), len(words), 'words', flush=True)
