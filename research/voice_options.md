# Voice options (2026-11-18) — facts for Xavier's decision

## What Gneef's narration is (measured on his top 5)
- About 260 words a minute, steady from second 0 to the end (235-270 across the top 20).
- Almost no pauses: the median gap between words is 0.0 s; about 11 gaps per minute are over 0.3 s; none over 0.6 s.
  The music bed runs under it the whole time.
- Young-sounding, warm, energetic storyteller (a kid narrator voice in first person), clear diction, plenty of
  emphasis on numbers and sound words ("Tink, tink, tink"), character lines acted in a slightly different voice.

## Why our current voice (Kokoro, tools/voice.py) is not good enough
- Kokoro is a small free model: flat delivery, the same intonation on every sentence, weak emphasis, no acting of
  character lines. Xavier: "weird, it's bad." Agreed. Pushed to 262 wpm it sounds rushed, not energetic.

## The two paid options (prices as published, check the live page before paying)
| | ElevenLabs | Fish Audio |
|---|---|---|
| Cheapest plan with commercial use | Starter $5-6/month, about 30,000 characters | Plus $15/month ($11/month yearly), about 200 minutes |
| Next plan | Creator $22/month, about 100-121k characters | Pro $100/month ($75 yearly) |
| API | Included in plans (credit-based) | Pay as you go, $15 per million characters (about 12 hours of speech), separate from plans |
| Free tier | 10,000 credits, NO commercial use | 8,000 credits, about 7 minutes |
| "Roblox" voices | Voice library + instant clone | Community voices literally named "Roblox", "Roblox 2" (male, young, energetic), "Roblox Storyteller" |
Sources: ElevenLabs pricing summaries (https://www.nocode.mba/articles/elevenlabs-pricing,
https://www.casrai.org/guides/elevenlabs-pricing); Fish Audio docs (https://docs.fish.audio/developer-platform/models-pricing/pricing-and-rate-limits),
plan summary (https://www.usecarly.com/blog/fish-audio/); Fish community voices e.g. https://fish.audio/m/10ad05575a3a4eee8dcdbbf3af39bb49
("Roblox 2", male young energetic), https://fish.audio/m/2ee79a73f9f04dda8088ee56a7457fab ("Roblox Storyteller").

## What a month would cost us
- A 60 s short at 260 wpm is about 260 words, about 1,500 characters. A Gneef-length 135 s story is about 3,300.
- 30 stories a month at Gneef length is about 100,000 characters:
  - ElevenLabs: Creator $22/month covers it.
  - Fish Audio: the API would be about $1.50/month for that text; Plus $15/month also covers it in minutes.
- Fish Audio is far cheaper for our volume; ElevenLabs is the safer known quality.

## Things to know before choosing
- Community "Roblox" voices on Fish are uploaded clones of someone's voice. Commercial rights for a clone of a real
  person are murky; safest is a voice from the provider's own library, or a clone of Xavier's own voice (he already
  recorded his own takes for the explainers), or a designed voice.
- Both have APIs, so Claude can generate the voice inside the pipeline (no copy-paste), as the target workflow needs.
- Quality has to be judged by ear: Xavier should listen to 3 candidates on the free tiers with the same 3 lines of a
  real script before paying (Claude prepares the lines and a comparison page).

## Recommendation (Claude's view, Xavier decides)
Try Fish Audio first: it has exactly the "Roblox guy / Roblox girl" energy as ready voices, it is the cheapest by far,
and its API fits the automatic pipeline. If its best voice still sounds AI-ish next to Gneef, ElevenLabs Creator ($22).
