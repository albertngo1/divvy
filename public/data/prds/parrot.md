## Overview
Parrot is a 3–6 player concurrent-room party game where the scoring engine is a small in-browser LLM's *own generation*. Instead of asking you to steer perplexity, it asks you to predict the model's mouth: what will distilgpt2 actually blurt out next? It's for people who've watched autocomplete hallucinate and thought "I could out-weird that thing."

## Problem
Every perplexity party game so far scores *your* text against the model. That gets samey. The untapped itch is the inverse: a tiny model is a predictable-yet-alien creature, and guessing its next words is a distinct, funny skill — you must think dumber and stranger than a human, not smarter.

## How it works
The host TV shows a shared stem, e.g. "The scientist opened the jar and immediately". PRIVATELY, each phone shows a text box: type the exact 3 tokens you think the model will generate next (greedy or low-temp sampled). All phones submit blind and simultaneously — nobody sees another's guess. When the timer ends, the host runs the model once and reveals its actual continuation token-by-token on the TV ("...regretted every decision").

Scoring, shown only after reveal: you earn 1 point per token that appears anywhere in the model's continuation. The twist that makes it sing — a matched token scores DOUBLE if no other player guessed that token, and ZERO extra if everyone piled onto the obvious word. So racing to the safe common guess ("the", "it") is worthless; the win is reading the model's genuinely surprising low-probability picks that other humans won't dare.

PRIVATE per phone: your typed guess, your live score. SHARED on host: the stem, a countdown, the big reveal, and the final leaderboard with each token color-coded by who uniquely nailed it.

## Technical approach
Host browser tab loads transformers.js + distilgpt2 (the sole authority — clients never run the model, guaranteeing one canonical generation). Phone PWAs are thin controllers. Authoritative WebSocket server (PartyKit Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{stem, phase, players:{id,name,guessTokens[],score}}`. Sync: phones POST guesses; server locks on timer; host requests generation, tokenizes each guess with the same GPT-2 BPE tokenizer, does set-membership + uniqueness tallying, broadcasts results. Hard part: tokenization parity — a player types "regretted" but BPE may split it; normalize by tokenizing guesses through the model's tokenizer server-side so comparison is token-for-token, not string-for-string.

## v1 scope
- One stem, one round, 3–6 players.
- Greedy decode, fixed 3-token continuation.
- Exact-token match + uniqueness bonus only.
- One host screen, phone text-box controllers, one leaderboard.

## Out of scope
- Multiple rounds / cumulative games.
- Sampling temperature dials, fuzzy/semantic matching.
- Custom stems from players.

## Risks & unknowns
- distilgpt2's greedy output may be boringly repetitive ("the the") — needs stem curation or a light repetition penalty.
- Uniqueness bonus could feel random if the model's continuation is very short; tune continuation length.
- Tokenizer edge cases (whitespace, casing) confusing scores.

## Done means
5 phones join via QR, all privately submit a 3-token guess to one shared stem, the host generates once, and the TV reveals the continuation and a leaderboard where a player who alone predicted a rare correct token visibly outscores three players who all guessed the same obvious word.
