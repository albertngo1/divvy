## Overview
Static is a 4-player social-deduction party game where the shared TV shows one writing prompt and each player's phone is a private writing desk. A small in-browser language model scores every sentence by perplexity (how 'surprised' it is), and that ranked surprise meter becomes the entire evidence board. It's for groups who like Werewolf but are tired of pure vibes-based accusation — here the machine gives you a real, noisy signal to argue over.

## Problem
Hidden-role games run on gut feeling; there's rarely hard evidence, so loud players win. Static injects an objective-but-imperfect instrument — model perplexity — that everyone can see but no one fully trusts, giving accusations teeth without making them deterministic.

## How it works
The host screen shows a public stem, e.g. "Write one sentence about a disappointing vacation." Each phone PRIVATELY receives a role card. Three players are **Clear**: just write naturally. One player is **Static**: their phone secretly hands them a fluency-wrecking constraint ("never use the letter E," "you must include the word 'tungsten'," "write it as a question"). Static's goal is to obey the constraint yet keep their sentence's perplexity out of the extremes — to hide in the pack.

All four write simultaneously and submit. The host's model computes each sentence's perplexity and the TV reveals them as an anonymized, ranked signal→noise meter (highest perplexity = 'most static'). Then each phone PRIVATELY casts a vote for who was Static. Static scores if unguessed by the majority; each Clear scores if they fingered Static correctly.

Per-phone is load-bearing: private roles, private secret constraints, private simultaneous writing (no copying tells), and private blind votes are all essential — passing one phone around would leak the saboteur instantly.

## Technical approach
Host browser tab loads distilgpt2 via transformers.js (WebGPU/WASM). Authoritative WebSocket server (PartyKit Durable Object, or Socket.IO over Tailscale Serve) holds room state: `{players[], roles{playerId:'clear'|'static'}, constraint, prompt, submissions{playerId:text}, perplexities{}, votes{}}`. Flow: server deals roles/constraint on round start (only Static's phone receives the constraint payload); phones submit text over WS; host requests each submission, runs one forward pass, computes perplexity = exp(mean token NLL), pushes the ranked meter back. Genuinely hard part: perplexity is a weak, high-variance signal — a strong writer with an easy constraint can blend perfectly, so tuning the constraint pool so the signal is present-but-noisy is the real design work, not the sync.

## v1 scope
- Exactly 4 players, one round, one Static.
- Fixed prompt + a hand-tuned pool of ~8 constraints.
- One perplexity meter, one blind vote, one scoreboard reveal.
- Local network only.

## Out of scope
- Multiple rounds / rotating roles, more than one saboteur.
- Model choice, difficulty tuning UI, reconnection handling.
- Tie-break subtleties, spectators.

## Risks & unknowns
- Perplexity may be too noisy (no signal) or too clean (constraint obvious) — needs playtest tuning.
- distilgpt2 load time on phones' shared host; keep model on host only.
- Clever Static players could exploit model quirks.

## Done means
4 phones join, one is secretly Static, all submit, the TV shows a ranked perplexity meter, blind votes resolve, and the scoreboard correctly awards Static-vs-Clears based on the majority guess — all in one sub-3-minute round.
