# Gneef top 20: scripts broken down (2026-11-18)

Source: his 20 most viewed Shorts (17M to 36M views each). Transcripts with 5-second markers: `research/gneef_top20/<id>.txt`,
cut times (ffmpeg scene detection): `research/gneef_top20/<id>.cuts`. Word timings: `/home/claude/ref/tr/<id>.json`.

## The numbers
| Video | Views | Length | Words | WPM | Cut every |
|---|---|---|---|---|---|
| In This Town, You Get 1,000,000 Steps | 36M | 112 s | 492 | 263 | 2.2 s |
| Never Be Caught Awake At Night | 33M | 174 s | 707 | 244 | 2.6 s |
| Everyone Has A String On Their Back | 32M | 150 s | 651 | 262 | 2.0 s |
| The Knocker Copies Your Voice | 31M | 157 s | 672 | 258 | 1.5 s |
| Everyone Lives In One Tower | 28M | 142 s | 631 | 267 | 7.9 s |
| Everyone Lives Underwater | 24M | 157 s | 655 | 251 | 1.8 s |
| Everyone Has Their Own Planet | 24M | 154 s | 668 | 261 | 2.2 s |
| Every Kid Is Born On The Moon | 22M | 130 s | 576 | 266 | 1.9 s |
| You Get Your Powers When You Need It | 22M | 124 s | 532 | 257 | 1.3 s |
| Your Superpower Is Your Opposite | 21M | 138 s | 607 | 265 | 1.4 s |
| You Teleport Every Hour | 21M | 136 s | 560 | 247 | 1.6 s |
| We Glitched The System | 21M | 131 s | 571 | 262 | 1.5 s |
| Uh Oh | 20M | 150 s | 650 | 261 | 1.4 s |
| When You Get Angry, You Age 1 Year | 20M | 138 s | 559 | 243 | 2.2 s |
| Future Devil | 19M | 158 s | 705 | 269 | 1.9 s |
| Everyone Is A Magnet | 19M | 96 s | 414 | 260 | 2.6 s |
| You Have A Price | 19M | 77 s | 300 | 235 | 1.6 s |
| You Can See Through People's Eyes | 19M | 122 s | 548 | 270 | 1.8 s |
| The Line | 18M | 173 s | 747 | 259 | 1.4 s |
| Kids Are Giant Until 18 | 17M | 135 s | 598 | 267 | 1.9 s |

- Pace: 235 to 270 words a minute, median about 261. The 262 wpm figure is right.
- Length: 77 to 174 s, median about 138 s. **Not one of the top 20 is a 20-second short.** Our old 22-26 s rule does not
  match the format that wins here. Xavier must decide our length (see "Decisions for Xavier").
- Cuts: median about one every 1.9 s. But the 28M Tower video cuts only every 7.9 s, so the cut rate is not what carries
  these: the script is.
- Narration starts at 0.0 s in all 20. No intro, no silence, no title card time.

## The skeleton (all 20 follow it; times are for a ~135 s video)
1. **0 s, the world rule.** "In this world / In this town / In my world, ..." + one concrete, visual, slightly
   impossible rule. Often the rule carries a cost in the same breath: "one million steps in their entire life",
   "if you're awake when it passes, it takes you", "every time you get angry, you get one year older".
   - Why they don't scroll: instant curiosity ("wait, how would that work?") plus a threat.
2. **~3-5 s, "You see,"** the mechanism. How the rule works, plus the punishment: "when it hits zero, your legs turn to
   stone", "if your string ever gets cut, you drop like an empty coat". Stakes are set in the first 10 s.
3. **~8-25 s, the world montage.** 3 to 6 quick funny examples of how people live with the rule, one every 2 to 3 s,
   each a new picture: "Kids get pulled to school in wagons. Grandmas ride zip lines to the grocery store. The mailman
   delivers on a pogo stick because a bounce only counts as one." The last one often turns serious ("Running is for
   emergencies only").
   - Why they don't scroll: a new visual joke every 2-3 s. This is the "reason to stay" at the highest frequency.
4. **~20-30 s, the narrator.** First person kid: "My name is Max" / "But when I was little" / "I live on floor one".
   Usually low status or a flaw: Wheelbarrow Boy, the kid standing next to the hero, an NPC, the "ordinary" badge.
   - Why: empathy and an underdog to root for.
5. **~25-45 s, the plant.** A small skill, object or fact that seems like colour: handstands, grandma's scissors locked
   in a sewing box, the recess game, the song dad hums, the music box grandpa explained. It pays off at the climax.
   Often a loophole is hidden in the rule itself: "counts every step your FEET take", "it never takes sleepwalkers",
   "going DOWN isn't against the rules".
6. **~40-55 s, the inciting event.** "Until one afternoon... / Then one night... / Then last Tuesday..." Someone the
   narrator loves is taken or in danger: baby sister, best friend, dad, grandma.
   - Why: a clear question with a deadline ("will he save her?").
7. **~55-100 s, escalation.** A ticking clock in numbers ("300, 250, 200", "11:50. 11:55. 11:59.", "our record is
   61 seconds") and a descent into the system's secret place (the toy factory, the stage in the clouds, floor zero).
8. **~70-110 s, the reveal.** The world's dark truth: the guards are the people who got caught, "Earth" is still the
   moon, the night train is collecting kids, the dancers are the taken children.
   - Why: a second, bigger question opens just as the first one peaks.
9. **~100-125 s, the climax.** The narrator wins with the PLANT plus the rule's loophole, never with a power from
   nowhere. Viewers feel clever because the answer was shown to them earlier.
10. **Last 10-15 s, payoff + button.** The whole world changes ("Now the whole town walks upside down"), the loved one
   is safe, then a final callback joke or twist: "Uh oh.", "Worth it.", "be nice to the hot dog guy", "honestly, it's
   kind of cute". Warm, never bleak.

## Sentence-level style
- Kid narrator, first person, past tense; simple words (about 5th-grade level); short sentences, many fragments.
- Concrete numbers everywhere (1,000,000 steps, 300 steps left, floor one, 61 seconds, 42 kids).
- Sound words that the edit can hit: "Tink, tink, tink", "Snip", "Ding", "Splash", "Crunch", "Knock. Knock. Knock."
- Dialogue lines in quotes, short, often a character's catchphrase or a rule said out loud.
- Running jokes set up and called back ("Biscuit is afraid of crabs", Theo staying up late).
- Titles: the rule restated in 3-7 words + one emoji ("Everyone Has A String On Their Back 🧶").

## "Why is this person still watching?" map (from the 36M video)
| Time | Answer on screen / in the line |
|---|---|
| 0-3 s | Impossible rule + what happens when you break it |
| 3-10 s | How it works: a glowing counter on your chest; legs to stone |
| 10-20 s | Gag every 2-3 s (wagons, zip lines, pogo stick) |
| 20-30 s | "But when I was little, nobody could stop me" (we know trouble is coming) |
| 25-35 s | 300 steps left, wheelbarrow boy (empathy) |
| 35-45 s | Handstands (looks like colour, it's the plant) |
| 45-60 s | Baby sister's stroller rolls toward the river (stakes) |
| 60-80 s | Countdown 300...0 (ticking clock) |
| 80-95 s | Legs turn to stone, "counts steps your FEET take" (the loophole) |
| 95-112 s | Saves her; the whole town now walks on its hands (payoff + world change) |
A new reason to stay arrives at least every 5-10 s; inside the montage, every 2-3 s.

## What the top 5 share that the rest don't
- The rule is a THREAT you can picture (stone legs, something that takes you, a string pulling you up, a voice copier),
  not only a fun quirk. Fear + wonder beats wonder alone.
- A loved one is taken, not just in danger, so there is a "where did they go?" mystery on top of the rescue.
- The climax is a logic trick the viewer could have solved (feet vs hands, sleepwalkers, the liar riddle).

## What this means for our niche (Reddit drama + "In this world")
- The skeleton maps onto drama stories: rule line -> conflict line ("My sister stole my wedding dress the night
  before"), "You see" -> the backstory in 2-3 lines, montage -> quick escalating examples of the person's behaviour,
  plant -> a detail that comes back, inciting -> the moment it goes too far, climax -> the clever comeback / revenge,
  button -> the twist + "Was I wrong?".
- Line 1 does the whole hook at 0.0 s. Frame 0 must already show the rule or the conflict happening.

## Decisions for Xavier
1. **Length.** His hits are 2-3 minutes (YouTube now allows Shorts up to 3 min). Our explainers were 22-26 s.
   Options: (a) 2-3 min like Gneef, (b) 45-60 s, (c) both: a ~60 s short and the full version as long form.
   Longer = much more animation per video and more render time.
2. **Voice.** His narration is a young-sounding, warm, energetic storyteller, about 260 wpm with almost no pauses
   (detail in research/voice_options.md).
