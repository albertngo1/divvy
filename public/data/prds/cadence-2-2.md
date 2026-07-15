## Overview
Cadence is a real-time concurrent-room word game (host TV + phone PWAs) where every player is dealt the *identical* set of shuffled word-tiles and races, on their own private board, to arrange them into the lowest-perplexity grammatical sentence a tiny in-browser model (distilgpt2) will accept. The catch: the globally optimal ordering is a trap everyone finds, and duplicate arrangements only pay the first submitter. For 3–6 players who like anagrams and Boggle-style pressure.

## Problem
Existing perplexity games either deal players *different* private hands (so you can't compare skill head-to-head) or are cooperative. Nobody has a head-to-head where the material is identical and the challenge is pure *insight under time pressure* — plus the delicious anti-collision twist that punishes the obvious answer.

## How it works
1. **The bag (shared).** Host TV reveals the same 7 content word-tiles (e.g. `river / quietly / the / froze / over / winter / by`) plus a rule: you may reorder freely and add only listed free function words (a, the, of, and…). A 60-second timer starts.
2. **Private boards (per phone).** Each phone shows a draggable rack of the tiles. You privately arrange them into a sentence; a live private perplexity meter (distilgpt2 running on the *host*, streamed back per keystroke-settle) shows your current score. Nobody sees anyone else's board or meter.
3. **Submit & lock.** You lock in one arrangement before the timer ends. The host records exact word-order string + perplexity + submit timestamp.
4. **Reveal (shared).** Host sorts submissions by perplexity (lowest wins). **Anti-collision rule:** if two players submitted the *identical* ordering, only the earliest timestamp scores; later duplicates get 0. So the model's single favorite arrangement is a landmine — everyone converges on it, and all but the fastest bust. The winning play is often the *second*-best order that's uniquely yours.

Per-phone architecture is load-bearing: five simultaneous private boards, each with its own live meter and lock timing, and a first-come collision rule that only makes sense with concurrent independent play. A single passed phone destroys the race entirely.

## Technical approach
Host tab runs distilgpt2 via transformers.js as authoritative scorer. Phone PWAs connect over WebSocket (PartyKit / Durable Object, or Socket.IO behind Tailscale Serve). Data model: `Round { tiles[], freeWords[], deadline, submissions: {playerId, orderingStr, perplexity, ts}[] }`. Sync: each phone debounces its arrangement and sends the token string; host scores and returns perplexity to *that phone only* (private meter). The genuinely hard part is **real-time scoring throughput** — up to 6 phones each requesting a fresh forward pass every ~400ms means the host must queue/coalesce inference so the single-threaded transformers.js instance doesn't fall seconds behind the meters. Batching sequences and rate-limiting per-phone requests is the core engineering.

## v1 scope
- 3–6 players, ONE bag, one 60s round.
- Fixed tile set from a curated pool of ~8 bags.
- Live private meter is 'best-effort' (may lag ~1s); final lock is authoritative.
- Exact-string collision only (no fuzzy near-dup detection).

## Out of scope
- Multiple rounds, scoring across rounds, wildcard tiles.
- Grammar validation beyond what perplexity implicitly rewards.
- Near-duplicate/synonym collision detection.

## Risks & unknowns
- Inference throughput under 6 concurrent meters is the make-or-break; may need to drop live meters to on-demand 'Check' taps.
- If the best ordering is *too* obvious the collision twist dominates and the game feels like a reflex race — bag curation matters.
- Function-word abuse could let players game perplexity trivially; may need to cap additions.

## Done means
Five phones join via QR, all see the same tiles, each privately arranges and locks a sentence within 60s, and the host produces a correct leaderboard by perplexity with the collision rule zeroing later duplicate orderings — demonstrably in one round.
