## Overview
Splice is a 4–6 player Exquisite-Corpse-meets-perplexity party game. Each phone privately writes one HALF of a sentence — a head or a tail — and the server randomly grafts your head onto someone else's tail. A small in-browser LLM scores the perplexity spike at the *junction*. It's for people who liked surrealist writing games but want the machine to referee the seam.

## Problem
Exquisite Corpse is delightful but has no scoring — it's pure vibes. The itch: give the joint an objective grade. And unlike whole-sentence perplexity games, here you're optimizing for *graftability* to an unknown partner — you must write a half that welcomes ANY continuation, which is a genuinely different skill.

## How it works
The host screen shows a shared topic (e.g. "the last day of summer") and assigns each phone a role: HEAD or TAIL (roughly half each). PRIVATELY, each phone sees only its role and a text box. Heads write an opening clause of 4–7 words that ends mid-thought; Tails write a closing clause of 4–7 words that begins mid-thought. Nobody sees anyone else's text. On submit, the server randomly pairs each head with a tail (derangement so no self-pairing where possible), concatenates them, and distilgpt2 measures the per-token surprisal specifically at the *boundary token* — the first tail word conditioned on the head. Your seam score = that boundary surprisal (lower = smoother graft). BOTH players in a pairing share the seam's fate, so the reveal is a comedy of blame: the host TV shows each spliced Frankensentence, a red spike marker at the seam, and both authors' names. Lowest average seam surprisal across your pairings wins. A head that ends on "...and then the" grafts to anything; one that ends on "...gorgonzola" is a landmine for whoever gets your tail.

## Technical approach
Host tab runs transformers.js + distilgpt2. Phones are PWA WebSocket clients (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `{roomId, topic, players:[{id, name, role, half, submitted}], pairings:[{headId, tailId, splicedText, seamSurprisal}], phase}`. Server authoritatively assigns roles, runs the random derangement pairing, and drives scoring host-side: for each spliced string, one distilgpt2 forward pass, then read the log-prob of the first tail token given the full head context (that's the seam surprisal). The hard part is real-time-ish scoring of N pairings and the pairing algorithm — a clean derangement when heads≠tails counts requires letting some halves be reused; v1 just pads by reusing a random half and flags it.

## v1 scope
- 4–6 players, ONE round, one topic
- Fixed HEAD/TAIL split, 60s to write your half
- Random pairing, host-side seam-surprisal scoring
- Reveal screen with spliced sentences + seam spike markers

## Out of scope
- Multiple rounds, choosing your own role, re-splicing
- Whole-sentence coherence scoring (only the seam matters)
- Balanced pairing when head/tail counts are lopsided

## Risks & unknowns
- distilgpt2 boundary surprisal may be noisy on very short halves
- Players might game it by writing bland ends (mitigate: reward semantic surprise elsewhere? out of scope v1)
- Uneven head/tail counts need graceful padding

## Done means
Six phones submit halves, the server produces spliced pairings, and the host renders each Frankensentence with a seam-surprisal score computed by distilgpt2 at the exact boundary token, ranking authors by average seam smoothness.
