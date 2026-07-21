## Overview
Planchette is a 3-6 player concurrent-room party game where every phone is secretly assigned a weird target word, and you race to write the sentence-stem that makes a small in-browser LLM *expect* that word. It's a séance in reverse: instead of asking the model to speak, you bend the model's expectations until your planted word feels inevitable. For friends who like clever wordplay and reverse-engineering machine minds.

## Problem
Most perplexity games score the whole sentence you wrote. That rewards fluent, boring prose. Planchette flips the lever: the scored token is *fixed and hidden*, and the thing you control is the *context* leading up to it. The itch is 'how do I make a walrus the obvious next word?' — pure setup craftsmanship, and it only works if nobody knows your target.

## How it works
Each phone PRIVATELY receives one secret target word from a curated list of medium-rarity single-BPE-token nouns (walrus, ledger, monsoon, gasket...). Under a 90-second timer, each phone privately writes a short lead-in stem (max ~12 words) that will be immediately followed — invisibly — by their target. A phone-local transformers.js model shows a live surprisal meter for your own target as you type, so you can tune. Nobody sees anyone else's target or stem.

At reveal, the host authoritatively computes surprisal = -log2 P(target | stem) under distilgpt2 for every player. Lowest surprisal wins: you convinced the model your strange word was destined. The SHARED host screen shows, ranked, each stem with its now-revealed hidden target and score — the joy is watching '...the zoo's newest arrival, a bristly tusked' → walrus (0.9 bits) beat a clumsy setup.

Phone shows PRIVATELY: your secret target, your stem editor, your local surprisal meter. Host shows PUBLICLY: timer, then the full ranked reveal. Different secret targets per phone mean a single passed-around phone would leak everyone's word — the private assignment is load-bearing.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, phase, players[]}; Player{id, name, targetWord, stem, submitted}. Targets are dealt server-side from a shuffled pool so no two clash and each is verified single-token. Phones run distilgpt2 via transformers.js purely for the advisory local meter; the host recomputes all scores authoritatively at reveal so a tampered phone can't cheat. Sync is simple: submit-and-lock per phone, barrier until all in or timer expires, then host scores sequentially (6 forward passes of a ~12-token context — sub-second). The genuinely hard part is tokenization parity: the local meter and host scorer must agree on where the target token boundary sits, so targets are pre-validated single tokens and the stem is joined with an explicit leading space.

## v1 scope
- 3-6 players, ONE round, one secret word each
- Curated ~40-word single-token target pool
- 90s timer, local advisory meter, host-authoritative scoring
- Ranked reveal screen

## Out of scope
- Multi-round scoring / persistent leaderboard
- Post-reveal 'guess their target from the stem' bonus
- Multi-token targets, model choice, difficulty tiers

## Risks & unknowns
- distilgpt2 may make some targets trivially easy (common bigrams) — needs pool tuning
- Local vs host meter drift could feel unfair; mitigated by authoritative recompute
- Players might write nonsense that happens to score well; a soft grammar/length floor may be needed

## Done means
Four phones each get a distinct hidden word, each writes a blind stem, and the host displays a correct surprisal ranking with the hidden targets revealed — and the local meter's final number matches the host's within tokenization tolerance.
