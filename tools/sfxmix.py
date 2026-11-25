# python3 tools/sfxmix.py <topic>  -> topics/<topic>/sfx/pack/<time>_<name>.wav (one file per cue, for CapCut) and
# out/<topic>_mix.wav (voice + every cue at its time). Cues: topics/<topic>/sfx/cues.json [t, file, vol, length, name];
# sources in topics/<topic>/sfx/src (real recordings only: Mixkit free licence, Freesound CC0, our bank; never synthesized).
import json, sys, subprocess, os, re
topic = sys.argv[1]; T = f'topics/{topic}'; cues = json.load(open(f'{T}/sfx/cues.json'))
os.makedirs(f'{T}/sfx/pack', exist_ok=True)
pre = 'silenceremove=start_periods=1:start_threshold=-45dB'
for t, f, v, L, name in cues:   # the CapCut pack: trimmed, levelled, short fade-out
    out = f'{T}/sfx/pack/{t:05.2f}_{re.sub(r"[^a-z0-9]+", "_", name.lower())}.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{T}/sfx/src/{f}', '-af', f'{pre},atrim=0:{L},volume={v},afade=t=out:st={max(0, L - .15)}:d=0.15', '-ar', '48000', '-ac', '2', out], check=True)
ins = ['-i', f'{T}/voice/voice.wav']; fl = []
for i, (t, f, v, L, name) in enumerate(cues, 1):
    ins += ['-i', f'{T}/sfx/src/{f}']; ms = int(t * 1000)
    fl.append(f'[{i}:a]{pre},atrim=0:{L},volume={v},afade=t=out:st={max(0, L - .15)}:d=0.15,aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}|{ms}[s{i}]')
fl.append(f'[0:a]volume={0 if "--sfxonly" in sys.argv else 1},aformat=sample_rates=48000:channel_layouts=stereo[v]')
fl.append('[v]' + ''.join(f'[s{i}]' for i in range(1, len(cues) + 1)) + f'amix=inputs={len(cues) + 1}:normalize=0:duration=longest,alimiter=limit=0.95[m]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '[m]', '-t', '61.7', f'out/{topic}_' + ('sfxonly' if '--sfxonly' in sys.argv else 'mix') + '.wav'], check=True)
print('wrote', f'out/{topic}_mix.wav', len(cues), 'cues')
