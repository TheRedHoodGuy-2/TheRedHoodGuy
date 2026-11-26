"""python3 tools/tts_gemini.py <text file> <out wav> [voice] : one Gemini TTS take of the whole script (natural flow).
Key: env GEMINI_API_KEY, ~/.gemini_key, or ../explainer-kit/secrets/gemini_key. Never printed."""
import sys, os, json, base64, urllib.request
txt, out = sys.argv[1], sys.argv[2]; voice = sys.argv[3] if len(sys.argv) > 3 else 'Puck'
key = os.environ.get('GEMINI_API_KEY') or next((open(p).read().strip() for p in [os.path.expanduser('~/.gemini_key'), '/home/claude/explainer-kit/secrets/gemini_key'] if os.path.exists(p)), None)
style = ("Read this as a Roblox storytime narrator: a young, energetic boy telling his own story to friends, fast "
         "(about 260 words a minute), almost no pauses between sentences, clear and punchy, big emphasis on numbers and "
         "sound words, quoted lines acted in character (the sister sweet and fake, the narrator panicked). Read exactly:\n\n")
body = {"model": "gemini-3.8-flash-tts", "input": [{"type": "user_input", "content": [{"type": "text", "text": style + open(txt).read()}]}],
        "response_format": {"type": "audio"}, "generation_config": {"speech_config": [{"voice": voice}]}}
req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/interactions', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json', 'x-goog-api-key': key})
with urllib.request.urlopen(req, timeout=600) as r: j = json.loads(r.read())
wav = next(base64.b64decode(c['data']) for st in j.get('steps', []) for c in st.get('content', []) if c.get('type') == 'audio')
open(out, 'wb').write(wav); print('wrote', out, len(wav))
