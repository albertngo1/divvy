## Overview
Call Your Shot is a 4-player one-round game about predicting a language model's taste *and* your friends' nerve. Everyone privately writes one word to finish a shared sentence, and — on the same screen, before seeing anything — privately claims what rank their word will hold when a tiny in-browser LLM sorts all four by surprisal. Claim correctly and score. Claim the same rank as someone else and you both bust. It is a Keynesian beauty contest run over token probabilities.

## Problem
Perplexity games usually reduce to *be weird* or *be boring*, and whoever is most extreme wins. That is a one-note incentive. Call Your Shot makes the target relative and contested: the most surprising slot is worth the most, everyone wants it, and only one person can have it. Suddenly the interesting play is deliberately writing the *third*-weirdest word.

## How it works
1. Host screen shows one stem: *My grandmother kept a loaded ___ in the kitchen drawer.*
2. **Calibration probe (private, 20s):** each phone may type one throwaway word and see its surprisal in bits for that stem. One probe only, never shown to anyone else. This is your private data point — you now know something about the model nobody else does, and it is the only ground truth in the game.
3. **Commit (private, 30s):** on one screen each phone enters (a) its real word and (b) a rank claim: 1 (most surprising) through 4 (least). Both lock together. No one sees any other submission.
4. **Host reveals:** all four words appear, then the model's bit-cost for each, then the true ranking, then each player's claim.
5. **Scoring:** correct claim of rank 1 = 5 pts, rank 2 = 3, rank 3 = 3, rank 4 = 5 (the extremes are hardest to hold). Wrong claim = 0. **Any rank claimed by two or more players scores 0 for all of them, even if correct.**
6. Highest total wins; ties broken by whoever's word was closest to the model's own argmax.

## Technical approach
Host tab runs distilgpt2 through transformers.js and is the scoring authority. One forward pass over the stem produces the full next-token distribution; each submitted word is scored as the summed log-prob of its sub-tokens conditioned on the stem, length-normalized. Calibration probes reuse the same cached logits, so a probe is a free dictionary lookup — no extra inference, instant response, which is what makes a 20s private probe phase feel snappy.

State lives in a PartyKit Durable Object: `{stem, players: [{id, probeWord, probeBits, word, claim, locked}], phase}`. Probe results are sent only to the originating socket. Sync strategy: server-authoritative phase clock; commits are accepted until the timer expires, then the room hard-locks and the host requests scoring. Hard part is **anti-leak plus simultaneity** — the server must never broadcast partial commit contents, only a boolean locked-count, and it must reject any late edit after the first player's lock reaches the leader plus 500ms, or the last committer gains a real timing advantage.

## v1 scope
- 4 players exactly, one stem, one round
- One calibration probe per phone
- Word + rank claim on a single commit screen
- Reveal animation: words → bits → true ranking → claims → collisions

## Out of scope
- Multiple rounds, custom stems, phrases longer than one word, profanity filtering, spectator mode, running the model on phones.

## Risks & unknowns
- Rank 1 may be trivially winnable by typing gibberish; needs a dictionary check and possibly a bit-ceiling that voids nonsense.
- Collision-bust may make everyone flee to the middle ranks, deflating the round.
- With only 4 words the ranking can hinge on tokenizer artifacts more than semantics.

## Done means
Four phones commit blind within one 30s window, probes are visible to their owner and provably nowhere else, the reveal correctly identifies the true surprisal ranking and zeroes out every colliding claim, and the round completes end-to-end in under three minutes.
