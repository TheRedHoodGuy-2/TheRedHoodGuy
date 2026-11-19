# Animation research, first pass (2026-11-19). The full max-effort pass is the animation phase.
- Roblox animators work from Disney's 12 principles: squash & stretch, anticipation, staging, straight-ahead vs pose to
  pose, follow-through / overlap, slow in / out, arcs, secondary action, timing, exaggeration, solid drawing, appeal.
  (devforum "Jespone's guide to animations"; devforum animation-feedback threads point to anticipation + overshoot)
- R6 is fine for good animation: devforum advice is to stay R6 and apply the principles rather than switch to R15.
- Snappy feel = TIMING: moving keyframes closer together makes a move snappy (Roblox's own "designing poses" doc).
- Tools people use: Moon Animator 2 (easing styles per key, graph editor). Our engine already has eased keys, overshoot,
  staggered body parts and holds that drift (actor motion v2 from explainer-kit; to port).
- What our engine needs (animation phase): pose-to-pose keys with per-key ease + overshoot, arcs on hands/head,
  overlap (head and arms trail the torso by 2-4 frames), anticipation before every big move, held poses that breathe,
  walk cycle with contact/down/pass/up, lip sync from word timings, reaction rules (action -> reaction).
