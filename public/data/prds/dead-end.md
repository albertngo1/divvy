## Overview
Dead End is a 3–5 player room game where a tiny in-browser language model is the referee in a two-sided fight. Half the round you are a trapper, writing a sentence opening; the other half you are an escaper, continuing an opening someone else wrote. It's for groups who like word games with a knife in them — Quiplash players who want the scoreboard to be a machine, not a popularity vote.

## Problem
Every perplexity party game so far is solitaire in a group costume: one shared prompt, N players minimizing the same number, and the winner is whoever is best at sounding like the internet. Nobody is doing anything *to* anyone. The prompt itself has never been the weapon. Dead End makes the context — the thing the model conditions on — the contested object.

## How it works
**Phase 1 — Bait (60s, simultaneous, private).** The host TV shows one concrete seed noun ("lighthouse"). Every phone privately types an 8–12 word fragment that stops mid-thought, no terminal punctuation. A private meter on each phone shows the fragment's *own* perplexity: it must sit under a fluency ceiling (≈120 ppl on distilgpt2) before the SUBMIT button unlocks. That single rule is the whole design — you cannot trap someone with gibberish; the trap has to read as effortless to the model and impossible for a human to escape cheaply. The host screen shows only "3 of 5 fragments legal." No text.

**Phase 2 — Escape (60s, simultaneous, private).** The server deals fragments in a derangement: every phone receives exactly one *other* player's fragment, anonymized, and privately writes a 5–8 word continuation. You do not know whose trap you're in, and nobody sees any other pair.

**Scoring.** Bits/token of the continuation *conditioned on the fragment*. The continuer earns points for low; the fragment's author earns points for high. Reveal goes pair by pair on the TV with the continuation rendered as per-token chips colored by surprisal — you watch the exact word where someone fell in the hole.

Per-phone is load-bearing: phase 2 hands every phone a different secret prompt at the same instant. Pass one phone around and you lose both simultaneity and the delicious ignorance of who trapped whom.

## Technical approach
Host tab = privileged client; it owns distilgpt2 via transformers.js in a Web Worker and is the only place inference happens. Phones are dumb views on a room URL. Fluency meters work by phones POSTing debounced drafts (400ms) over the WebSocket; the server relays to the host worker, which returns a single number to that one socket. One model, one tokenizer, no 80MB phone download.

Data model (PartyKit / Durable Object, server-authoritative): `Room { code, phase, seed, players[], fragments{pid → {text, ppl, legal}}, assignment{pid → authorPid}, continuations{pid → text}, results[] }`. Server owns the phase clock, the derangement, and the deadline; the host owns scores it publishes back.

Hard part: the host tab is renderer *and* inference server, scoring five live debounced streams while running a countdown. Fix with a worker queue that coalesces per-player — drop any stale request when a newer keystroke arrives. Second hard part: derangements for N=3 (only two valid permutations) and handling a player who submits nothing (auto-fill "and then", zero points).

## v1 scope
- 3–5 players, one round, one hardcoded seed word
- Host = one browser tab with a QR code; phones = plain web page, no install
- Fluency ceiling is a constant in a file, no tuning UI
- Continuation must contain ≥1 content word not present in the fragment (anti-"and then he said that")
- Scoring is bits/token only; two-column score, trapper vs escaper
- Reveal: one pair at a time, per-token color chips

## Out of scope
Multiple rounds, teams, model selection, on-phone inference, spectators, persistence, profanity handling beyond a blocklist, rematch flow.

## Risks & unknowns
- Degenerate escapes: bland function-word continuations may be near-optimal for everyone. The content-word rule is the guard; may need a minimum rare-word requirement.
- Ceiling calibration is guesswork until playtested — too tight and traps are toothless, too loose and word salad wins.
- distilgpt2 has weak long-range coherence; a clever human trap may not actually cost the model anything. Concrete-noun seeds and short fragments mitigate.

## Done means
Five phones join from a QR code, each writes a fragment behind a live private meter that blocks illegal submissions, the server deals a derangement with zero self-assignments, each phone receives exactly one fragment, and within 3 seconds of the phase-2 buzzer the host displays per-pair bits/token with per-token coloring and a trapper/escaper score split — with a network log confirming no phone ever received text it shouldn't have.
