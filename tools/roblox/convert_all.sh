#!/bin/bash
# converts every hair in the crawl index (most favourited first), 20 per call, skipping ones already done
cd /home/claude/theredhoodguy
python3 -c "
import json,os
d=json.load(open('/home/claude/hair/index.json')); d.sort(key=lambda x:-(x['fav'] or 0))
print('\n'.join(str(x['id']) for x in d if not os.path.exists(f'assets/roblox/{x[\"id\"]}/meta.json')))" > /home/claude/hair/todo.txt
echo "todo $(wc -l < /home/claude/hair/todo.txt)" >> /home/claude/hair/convert.log
xargs -n 20 python3 tools/roblox/fetch.py get < /home/claude/hair/todo.txt >> /home/claude/hair/convert.log 2>&1
echo CONVERT_DONE >> /home/claude/hair/convert.log
