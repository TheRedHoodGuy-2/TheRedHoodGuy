#!/bin/bash
# Chat log sync (Xavier 2026-10-24): rebuild log/ from the session transcripts and push it. Run at the end of every turn.
# Pushes ONLY log/ (2026-10-28 fix: it used to `git push` the whole branch, which also pushed unapproved work). The log
# commit is made in a scratch worktree on top of origin/main, so local commits Xavier hasn't approved never leave.
cd "$(dirname "$0")/.." || exit 0
python3 tools/chatlog.py >/dev/null 2>&1 || exit 0
B=$(git branch --show-current); [ -z "$B" ] && exit 0
git fetch -q origin "$B" >/dev/null 2>&1 || exit 0
W=$(mktemp -d); git worktree add -q --detach "$W" "origin/$B" >/dev/null 2>&1 || { rm -rf "$W"; exit 0; }
rm -rf "$W/log"; cp -a log "$W/log"
( cd "$W" && git add log && ! git diff --cached --quiet -- log && git commit -q -m "log: chat sync $(date -u +%Y-%m-%dT%H:%MZ)" -- log && git push -q origin "HEAD:$B" ) >/dev/null 2>&1
git worktree remove --force "$W" >/dev/null 2>&1; rm -rf "$W"
# nothing of ours waiting for approval? then just fast-forward to the remote (picks up the log commit)
if [ -z "$(git log --oneline "origin/$B..HEAD" 2>/dev/null)" ]; then git fetch -q origin "$B" >/dev/null 2>&1; git checkout -q -- log 2>/dev/null; git merge -q --ff-only "origin/$B" >/dev/null 2>&1; fi
exit 0
