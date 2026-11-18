"""Build the clothing triage gallery spec from library/triage_auto.json, ordered for Xavier's picks:
normal + fit ok first, then normal with a fit flag, in-between, odd last. Each cell's note = usability + fit verdict.
  python3 tools/triage_sheets.py > /tmp/triage_spec.json; python3 tools/gallery.py /tmp/triage_spec.json out/triage"""
import json
t = json.load(open('library/triage_auto.json')); secs = []
order = [('normal', ''), ('normal', 'opens when moving'), ('normal', 'body shows'), ('in_between', ''), ('in_between', 'opens when moving'), ('in_between', 'body shows'), ('odd', ''), ('odd', 'opens when moving'), ('odd', 'body shows')]
for part in ('top', 'bottom'):
    for u, issue in order:
        items = [[int(k), v['name'], (issue or 'fit ok')] for k, v in t.items() if v['cat'].startswith(part) and v['usability'] == u and v['fit_issue'] == issue]
        if items: secs.append({'name': f"{'Tops' if part == 'top' else 'Bottoms'} - {u.replace('_', ' ')} - {issue or 'fit ok'}", 'mode': 'acc', 'items': items})
print(json.dumps({'title': 'R6 3D clothing triage', 'intro': 'First pass sorted by usability (from the names) and by the automatic fit check (standing, arms up, sitting). Pick what to keep as normal; nothing is deleted.', 'sections': secs}))
