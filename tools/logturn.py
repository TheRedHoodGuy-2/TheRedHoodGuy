# python3 tools/logturn.py <session-log.md> <time "YYYY-MM-DD HH:MM"> <xavier.txt> <reply.txt>
# Appends one exchange VERBATIM to log/sessions/<file>, files Xavier's message into every matching log/categories/*.md,
# rebuilds log/INDEX.md, then commits + pushes log/ only. Run at the END OF EVERY TURN (CLAUDE.md section 2).
# Why by hand: this cloud session's raw transcript is not on disk, so nothing can scrape it automatically.
import sys, os, re, subprocess, glob, datetime
log, when, xf, rf = sys.argv[1:5]
X = open(xf).read().strip(); R = open(rf).read().strip()
os.makedirs('log/sessions', exist_ok=True); os.makedirs('log/categories', exist_ok=True)
with open(log, 'a') as f: f.write(f'\n---\n\n## {when} Xavier\n\n{X}\n\n## {when} Claude\n\n{R}\n')
CATS = {
 'posing_animation': r'pose|posing|anim|arm|hand|leg|sit|stand|walk|run|jump|flinch|jolt|clip|elbow|shoulder|reach|grab|action|reaction|smooth|motion|still frame|freeze|frozen',
 'camera': r'camera|cam |shot|zoom|pan|handheld|angle|close up|wide|cut|frame|lens|focus|pov',
 'sound_music': r'sfx|sound|audio|music|voice|laugh|whoosh|tick|heartbeat|bruh|loud|quiet|low|volume|fish',
 'captions_titles': r'caption|title|card|font|text|hashtag|description|tags|word',
 'script_story': r'script|story|reddit|cliffhanger|retention|hook|line|narrat|plot',
 'faces_characters_clothes': r'face|eye|mouth|hair|hoodie|sleeve|skin|character|model|cloth|shirt|cast|npc',
 'world_lighting': r'light|sun|sunset|dark|bright|tree|house|world|map|street|sky|shadow|grade|colou?r',
 'workflow_rules': r'workflow|render|review|low qual|fps|push|git|log|repo|limit|token|rule|claude\.md|remember|always|never|every time|forget',
}
low = X.lower()
for c, rx in CATS.items():
    if re.search(rx, low):
        with open(f'log/categories/{c}.md', 'a') as f: f.write(f'\n- **{when}** ({os.path.basename(log)}): {X}\n')
idx = ['# LOG INDEX (docs/BRAIN.md says which category to read for the task; grep the rest)', '',
       'Raw: every Xavier message and every Claude reply, verbatim, per session in log/sessions/.',
       'Categories: every Xavier message filed by topic (one message can sit in several).', '', '## Categories']
for p in sorted(glob.glob('log/categories/*.md')): idx.append(f'- {p} ({sum(1 for l in open(p) if l.startswith("- **"))} notes)')
idx += ['', '## Sessions'] + [f'- {p}' for p in sorted(glob.glob('log/sessions/*.md'))]
open('log/INDEX.md', 'w').write('\n'.join(idx) + '\n')
if os.environ.get('NOCOMMIT'): sys.exit(print('logged (no commit)', when))
subprocess.run(['git', 'add', 'log'], check=True)
subprocess.run(['git', 'commit', '-qm', f'log: {when}\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>'], check=False)
subprocess.run(['git', 'push', '-q'], check=False, capture_output=True)
print('logged', when)
