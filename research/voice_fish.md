# Voices: Fish Audio "Roblox guy / Roblox girl" (2026-11-19)
Decision already made (DECISIONS.md): our voices are a Roblox male and a Roblox girl. Fish Audio is the source to test.
- Fish Audio has community voice models literally made for this: e.g. "roblox voice" (male, young, conversational; its
  sample is a "roblox girl" line), "Roblox 2" (male, young, energetic, 20+ creators), "ROBLOX" (female, young, social
  media, 170 uses), "Average Roblox tanter voice" (female). Pages: fish.audio/m/a4d5e7a10c1645c98ed8d85a71ce87b6,
  fish.audio/m/10ad05575a3a4eee8dcdbbf3af39bb49, fish.audio/m/cfe0c39f8fb94eb38d7531f3f5706faf,
  fish.audio/m/1adf9a2bb8fb4db2971f6f2fb01ce670. Quality of community voices varies a lot (Fish's own blog says so).
- Rights: free accounts = personal use; commercial use (a monetised channel) needs a paid plan.
- API: pay as you go, no subscription needed for the API. s2-pro / S2.1 Pro list price $15 per million UTF-8 bytes
  (a 3:30 script is ~3,000 bytes = about $0.05). Drama-3 (directable, emotion tags) is $10 / M bytes until Nov 30 2026.
  Sources: docs.fish.audio/developer-platform/models-pricing/pricing-and-rate-limits, docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits
- Plan: (1) Xavier makes a Fish account + API key (I can't sign up for him); (2) I generate the same 3 lines from 6
  candidate voices (3 guy, 3 girl) and send one comparison clip; (3) he picks one of each; (4) I wire tools/voice.py to
  the API with word timings for lip sync and captions. Cost per video: cents.
