## Overview
A quick creative party game where the trophy is the model's *uncertainty*, not its comfort. Players race to write the most suspenseful sentence-stem — one that leaves distilgpt2 genuinely unable to predict the next word. For 3-6 players who like wordplay.

## Problem
Every perplexity party game so far rewards LOW surprise (smooth text) or a target band. Nobody has made the model's own confusion the prize. Suspense is literally uncertainty; measuring the entropy of the next-token *distribution* turns "write a good cliffhanger" into an objective sport with a fresh scored quantity.

## How it works
The host TV shows a shared opener fragment — e.g. "As she opened the door, she saw ___" — plus a 60s timer. Each phone PRIVATELY receives a *different* secret required word ("banana", "grandmother", "tax") it must weave into a stem that ends right before a blank. You want the model, at that final blank, to have NO idea what follows — high entropy over its next-token distribution = maximum suspense. The catch: your mundane secret word tends to collapse the model into certainty, so you must build a context that keeps the future wide open despite it.

Phones show PRIVATELY: your secret word, a text box, a live "suspense meter" (entropy computed locally as you type), submit button. Host shows: the shared opener, timer, and players' ready-lights — never anyone's text.

On timeout, the host scores each stem's next-token entropy authoritatively and reveals a ranked ladder — highest entropy = "biggest cliffhanger" wins. Then a 10s twist: each phone privately guesses which player topped the ladder (points for correct) before names attach to stems.

## Technical approach
Host browser + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: Room{opener, timerEnd, players[]}, Player{id, secretWord, stemText, entropy}. Phones compute a *provisional* entropy locally via transformers.js distilgpt2 for the live meter (feed stem, softmax the final-position logits, H = -Σ p·log p); the host recomputes authoritatively at reveal so no phone can spoof. Sync: phones stream only ready-state + final submission; text stays local until timeout. Hard part: entropy is over the full ~50k vocab at one position — cheap for the host (one forward pass per player) but the *live* per-keystroke meter must debounce (~300ms on pause) to stay smooth on mobile.

## v1 scope
- One round, 3-6 players, one fixed opener.
- 5 hardcoded secret words dealt round-robin.
- Host-side distilgpt2 scoring; single entropy number per stem.
- Ranked reveal + one guess-the-winner poll.

## Out of scope
- Multiple rounds / cumulative scoring.
- Grammar/plausibility validation.
- Per-token entropy visualization.

## Risks & unknowns
- Degenerate exploit: nonsense/rare tokens may inflate entropy — may need a light "6+ real words" gate.
- distilgpt2 entropy may not track human "suspense"; needs playtest calibration.
- Live phone meter perf on low-end devices.

## Done means
Four phones each get a distinct secret word, write blind under a timer, and the host renders a correct entropy-ranked ladder plus a winner-guess tally — reproducibly, with authoritative host scores matching a manual transformers.js check.
