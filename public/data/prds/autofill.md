## Overview
Autofill is a 3–6 player concurrent-room game where the shared host TV shows an unfinished sentence and every phone secretly races to type the single word a tiny language model would predict next. It's for groups who enjoy the specific pleasure of thinking like a machine — and the panic of realizing everyone else is thinking the same obvious thought.

## Problem
Most "guess the answer" party games converge on one crowd-pleasing response and reward the obvious. Autofill weaponizes that: the model IS the oracle, so being right is easy — being right and *alone* is the whole game. The itch it scratches is the tension between the safe, high-probability guess and the risky, still-plausible outlier.

## How it works
The host shows a shared stem with a blank: "After the long flight, all I wanted was a hot ___." Each phone privately, simultaneously types ONE word. Phones show only your own stem, your text field, and a countdown — never anyone else's guess. On submit, the host runs distilgpt2 (transformers.js) once, gets the full next-token probability distribution, and looks up each submitted word's probability.

The twist: **collisions cancel.** If two or more phones submitted the same word (case/space-normalized), all colliding players score 0 for it. Unique guesses score points proportional to the model's probability mass on that word (e.g. `round(1000 * p)`). So the argmax word ("shower," "meal") is a trap — likely everyone piles on it and nobody scores. The savvy play is the model's #2/#3/#4 word: still high-probability, but a word you're betting no one else will risk. The host TV reveals the model's top-10 ranked list, everyone's word slotted onto it, collisions struck through in red, and points awarded — an instant, legible "oh NO we both said shower" payoff.

## Technical approach
Host browser tab loads distilgpt2 via transformers.js and holds authoritative state in a PartyKit / Cloudflare Durable Object room (or Socket.IO over Tailscale Serve). Data model: `{ roomCode, stem, phase, players: { id, name, word, submittedAt, score } }`. Phones are PWA clients that only ever send `{type:'submit', word}` and render local UI. Sync is trivial — the hard real-time part is the reveal: the host computes the full softmax over ~50k vocab tokens once, resolves each free-typed word to its token id(s) (multi-token words scored by product of conditional probs, or rejected if not a clean single BPE token — surfaced to the player as "try a simpler word"), detects collisions, and broadcasts one authoritative results payload. Per-phone privacy is enforced server-side: no phone receives another's `word` until the reveal frame.

## v1 scope
- One stem, one round, 3–6 players.
- distilgpt2, greedy single-token scoring only.
- Collision = exact normalized string match.
- Host TV shows top-10 list + everyone's slotted word at reveal.

## Out of scope
- Multiple rounds / running totals.
- Multi-token phrase scoring.
- Synonym-aware collision detection.
- Any model larger than distilgpt2.

## Risks & unknowns
- Free-typed words that aren't a single clean BPE token need graceful handling (reject-and-retry vs. product-of-tokens).
- With few players, collisions may be rare, dulling tension — may need to nudge stems toward strong argmax pull.
- distilgpt2's "obvious" word may feel arbitrary to humans; a calibration example stem before the real round helps.

## Done means
Three phones on one Wi-Fi submit words to a shared stem; the host reveals distilgpt2's top-10, correctly strikes any two identical submissions to 0, awards the highest score to a unique high-probability guess, and the room audibly reacts to at least one collision — all within ~2 seconds of the last submit.
