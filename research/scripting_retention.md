# Scripting + retention research (2026-11-18)

Companion to `research/gneef_top20_scripts.md` (what the format that wins actually does). This file: what the platform
measures, what the published benchmarks say, how Reddit drama stories hold people, and our own data from explainer-kit.

## 1. What YouTube measures on a Short
- Two numbers decide reach: **viewed vs swiped away** (did the first frame + first line stop the scroll) and
  **average view duration / average percentage viewed** (did the pacing hold). Source: vidIQ, "How to Get More Views
  on YouTube Shorts in 2026" (https://vidiq.com/blog/post/get-more-views-youtube-shorts/).
- The algorithm tests every Short on a small seed audience first; low retention or a high swipe-away rate stops the
  push. Source: vidIQ, "How Does the YouTube Shorts Algorithm Work in 2026?" (https://vidiq.com/blog/post/youtube-shorts-algorithm/).
- Replays count, so a Short can pass 100% average view duration. Loops matter. Source: fluxnote, faceless Shorts
  retention tips 2026 (https://fluxnote.io/guides/faceless-shorts-retention-tips-2026).

## 2. Benchmarks (published, treat as rough, not law)
- First 3 s: strong hooks keep about 80-90%; losing more than half in the first 3 s usually kills the first test.
  Sources: shortsfast (https://shortsfast.com/blog/faceless-shorts-hooks-retention-2026/), gofaceless
  (https://www.gofaceless.ai/en/blog/high-retention-youtube-shorts-attributes).
- "Viewed" above 70% is a strong hook; under 50% is failing. Source: fluxnote
  (https://fluxnote.io/guides/increase-audience-retention-youtube-shorts).
- A shorter video watched almost fully beats a longer one half watched (30 s at ~85% beats 60 s at ~50%). Source:
  miraflow (https://miraflow.ai/blog/youtube-shorts-best-practices-2026-complete-guide).
- Long form: all-YouTube average retention is about 24%; 40-60% is good; under 5 minutes aim for about 70%.
  Sources: pixflow (https://pixflow.net/blog/?p=93140), mysocial (https://mysocial.io/blog/make-youtube-script/),
  yt-seo-architect (https://yt-seo-architect.vercel.app/blog/how-to-increase-youtube-retention-2026).
- There is no official threshold: compare against our own Shorts of similar length. Source: bytecap
  (https://www.bytecap.io/research/youtube-shorts-retention-benchmarks).
- Gneef reality check: his top 20 are 77-174 s long and still get 17-36M views. Length is fine IF every few seconds
  gives a reason to stay. (Our measurement, research/gneef_top20_scripts.md.)

## 3. Our own data (explainer-kit, from Xavier's YouTube stats)
- Winners (tickle 18K, hypnic 8.6K): 68-70% stayed to watch and about 100%+ APV. Losers: 43-48% stayed.
  The difference was the first frame: winners opened mid-action with the topic as on-screen text from frame 0 and the
  camera already moving. (explainer-kit REVIEW_NOTES.md, 2026-11-15.)
- Viewers left the moment a video turned into a "science show" diagram look: keep characters acting, always.
  (explainer-kit STYLE.md, tickle recipe.)
- A cut or camera move about every 2 s; no dead second; last shot matches the first so it loops.

## 4. Hooks: what works in the first frame and first line
- Frame 0 is the thumbnail inside the feed: something must be visibly happening and readable in under 0.5 s.
  Source: shortimize (https://www.shortimize.com/blog/youtube-shorts-retention-rate).
- The hook is "cognitive incompletion": the viewer's brain gets a question it can't resolve in 3 s.
  Source: aibrify (https://aibrify.com/blog/youtube-shorts-retention-curve-playbook).
- Gneef's version: line 1 = impossible rule + its cost ("...one million steps in their entire life"), spoken at 0.0 s,
  the picture shows the rule (a counter on a chest) at the same moment.
- Reddit version: line 1 = the conflict at its sharpest ("My sister wore my wedding dress to my wedding."). The story
  lives or dies in its first line. Source: kineclip (https://kineclip.com/blog/how-to-make-reddit-story-videos-2026/).
- Never: "hey guys", an intro, a slow establishing shot, a question we don't answer, a promise the opening doesn't pay.

## 5. Holding them: the "why are they still here" engine
- Open loops (the Zeigarnik effect): open a question early, close it later; before one closes, open the next.
  Source: tubemilestone (https://tubemilestone.com/blog/longer-youtube-videos-retention), searchengineland
  (https://searchengineland.com/guide/audience-retention).
- Pattern interrupts: a new picture, place, angle, sound or emotional turn. Short form needs a new visual every
  2-5 s. Sources: fliki (https://fliki.ai/blog/how-to-write-engaging-youtube-video-scripts-with-ai), fluxnote
  (scene change every 2-3 s correlated with about 82% retention).
- Emotional turn: start with one feeling, end with the opposite (scared to relieved, angry to grateful).
  Source: ghostshorts (https://ghostshorts.com/blog/how-to-make-storytelling-videos-that-keep-viewers-hooked-2026).
- Story videos complete best because people need the ending. Source: fluxnote
  (https://fluxnote.io/guides/how-to-create-ai-story-videos).
- No outro: retention drops the moment the creator starts wrapping up. End on the button line. Source: tubemilestone.

## 6. Reddit drama stories: why they hold people, how to adapt them
- Pre-tested: pick posts thousands already reacted to (a common floor is 300+ upvotes and a clear arc). Source:
  fluxnote (https://fluxnote.io/guides/reddit-story-videos-guide).
- Best subreddits by job: r/AITA (moral conflict, drives comments), r/ProRevenge (payoff), r/tifu (funny),
  r/relationship_advice, r/MaliciousCompliance. Source: ghostshorts (https://ghostshorts.com/guides/reddit-story).
- Unresolved judgment ending ("Was I wrong?") pulls people into the comments to argue. Source: kineclip.
- Cut asides and long intros; split long posts into a series. Source: crayo (https://crayo.ai/blog/how-to-make-tiktok-reddit-story-videos).
- Update videos (OP's follow-up) outperform the original. Source: fluxnote AITA guide
  (https://fluxnote.io/guides/reddit-aita-youtube-channel-guide).
- Crowded lane: our edge is the cast ACTING the story (most channels put gameplay under the narration).
- Rights: never read a post word for word. Adapt: new names, our own sentences, our structure. Copied posts are how
  these channels get demonetised.

## 7. Adapting a Reddit story to the Gneef skeleton
| Gneef beat | Reddit drama version |
|---|---|
| World rule at 0 s | The conflict at its peak, line 1 ("My mom sold my car to pay for my brother's wedding.") |
| "You see," mechanism | 2-3 lines of the who/why |
| World montage gags | Quick escalating examples of the person's behaviour (each one a new picture) |
| Narrator's flaw | Why the narrator put up with it |
| The plant | A detail that comes back (the spare key, the group chat, grandma's will) |
| Inciting event | The moment it goes too far |
| Ticking clock / reveal | The plan, the discovery, the twist about the other person |
| Climax by the plant | The clever comeback or revenge using the planted detail |
| Button | Twist + the judgment question ("So... was I wrong?") |

## 8. Short to long form (later)
- The short is a complete story; the long form is the same story with the full world, more montage, more escalation,
  and the update. The short makes people curious about the world, not cut off mid-story (Xavier: no cliffhanger trick).
- Long form keeps the loop engine: open a loop in the first 10 s and close loops one after another; pattern interrupts
  every few seconds in the edit; no outro.

## 9. Draft script checklist (for FORMAT_BIBLE, needs Xavier's sign-off)
For every script, before voice:
1. Frame 0: what is on screen, and does it already show the rule / conflict happening?
2. Line 1 at 0.0 s: does it state the rule or conflict with its cost, in under ~3 s?
3. 0-10 s: is there a question the viewer can't answer yet?
4. Then for every 2-5 s block, write the answer to "why are they still watching right now?" (new gag, new question,
   a promise, a countdown, a reveal coming). Any block without an answer gets rewritten or cut.
5. Is there a plant shown early that pays off at the climax?
6. Does the climax use the plant (earned), not luck?
7. Does the feeling turn (scared to relieved, angry to satisfied)?
8. Last line: a button / twist / judgment question; no outro; does the last shot loop into the first?
9. Title: the rule or conflict in 3-7 words + one emoji.
