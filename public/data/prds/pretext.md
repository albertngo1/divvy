## Overview
Pretext is a 3–6 player concurrent-room party game where the lever is *conditioning*, not composition. The whole room is handed one fixed, ridiculous target sentence. Privately, each player writes a short preamble that gets silently prepended to it, and a small in-browser language model scores how *unsurprised* it is by the target given your setup. You never edit the target — you edit the world it lives in.

## Problem
Every perplexity party game so far asks players to write the scored text. That's one trick. The itch here: could you make "The penguin filed his taxes in the microwave" feel *ordinary* to a model? The joy is inventing the just-so backstory that flattens absurdity — a completely different creative muscle, and one that's funny to reveal.

## How it works
1. Host TV shows the shared target sentence (drawn from a deck of deliberately weird ones) and a countdown.
2. Each phone PRIVATELY shows the target plus a text box: "Write 1–2 sentences of setup so this feels inevitable." Nobody sees anyone else's preamble.
3. On timer end, the host concatenates each player's preamble + the identical target and runs the target's tokens through distilgpt2 (transformers.js), computing mean surprisal of ONLY the target tokens, conditioned on the preamble.
4. Host reveals a leaderboard low→high conditional perplexity, reading each winning preamble aloud for laughs. Lowest wins the round.

Private-per-phone is load-bearing: everyone writes simultaneously and blind, so the comedy is the *independent* reveal of six wildly different justifications for the same sentence. A single passed phone kills both the simultaneity and the blind reveal.

## Technical approach
Host browser tab = display + authoritative model runner. Phones = PWA text clients. Server = PartyKit / Durable Object (or Socket.IO over Tailscale Serve) holding room state: `{roomId, target, phase, players:{id,name,preamble,submitted}}`. Sync is trivial (submit-once, no per-keystroke), so the model runs only on the host at scoring time — no per-phone inference. The genuinely hard part is scoring fairness: conditional surprisal must be computed over exactly the target tokens with the preamble in the KV context, and length/tokenization of the target held constant so preambles compete purely on how well they set up the *same* tokens. Cache the target's token ids once; loop preambles through with a warm model.

## v1 scope
- One hardcoded target sentence, one round.
- 3–6 players, name + one text box.
- distilgpt2 in-browser on host; conditional mean surprisal of target tokens.
- Leaderboard + read-aloud reveal. No accounts.

## Out of scope
- Multi-round matches, scoring history, target deck curation UI.
- Anti-cheat on preamble length (soft char cap only).
- Mobile model inference.

## Risks & unknowns
- distilgpt2 may reward keyword-stuffing the target's nouns rather than genuine setup — needs a char cap and playtest tuning.
- Conditional perplexity swings could be tiny across clever preambles; may need a spicier/absurder target deck.
- Reveal pacing: reading 6 preambles must stay snappy.

## Done means
Six phones join a room, each submits a private preamble to one shared target, the host produces a correct low→high conditional-perplexity leaderboard within ~3s of the timer, and the winning preamble reads aloud — all on one LAN, no reload.
