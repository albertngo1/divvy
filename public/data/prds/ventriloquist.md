## Overview
Ventriloquist is a hidden-agenda party game for 3–6 players built entirely around a tiny in-browser LLM's next-token confidence. The shared host screen displays one growing sentence the whole room co-writes, one word at a time. But each player's phone privately holds a different SECRET WORD, and your goal is to bend the collective sentence so that, by the end, the model would happily predict your secret word next — i.e. make the machine a ventriloquist's dummy for your word.

## Problem
Collaborative word games are either purely cooperative (bland) or descend into chaos. Ventriloquist injects hidden, conflicting agendas with an objective, non-human referee: the model's perplexity. It's social deduction where the 'tell' is the sentence itself, and the scorekeeper can't be argued with.

## How it works
At start, the server deals each phone a distinct secret word (from a small curated list) shown ONLY on that phone. Host screen shows the empty/seed sentence. On your turn, your phone privately prompts 'add one word' — you type it, it appears publicly on the host. Play goes round-robin for a fixed number of words. You want to nudge context toward your secret word WITHOUT being obvious, because if opponents infer your target they'll steer entropy away from it on their turns. PRIVATE per phone: your secret word, your turn input, and a live 'warmth' gauge showing the model's current probability for your word given the sentence so far. PUBLIC on host: only the shared sentence and whose turn it is. At the end, the host model scores each secret word's perplexity given the final sentence; lowest (most predictable) wins.

## Technical approach
Host browser runs transformers.js (quantized distilgpt2) and is the authority for all model math. Phones are PWAs sending `{playerId, word}` over WebSocket (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { sentence: [], turnOrder, currentIdx, players: [{id, secretWord}] }`. Sync: server enforces turn order, appends the word, then asks the host to recompute each player's `P(secretWord | sentence)` and pushes each value back to only that owning phone as their private warmth gauge. The hard part is the per-turn fan-out of private, per-player scores derived from one central model, kept in lockstep so warmth gauges never leak another player's word — and doing N forward passes per turn fast enough to feel live.

## v1 scope
- One game, fixed 8-word sentence, 3–4 players.
- Hardcoded secret-word pool, random distinct deal.
- Live private warmth gauge + final perplexity ranking on host.

## Out of scope
- Multiple rounds, sabotage voting, reconnection, scoreboards across games.
- Anti-obviousness penalties or word-repeat rules beyond basic validation.

## Risks & unknowns
- Warmth gauge recompute cost each turn on a modest host.
- Players may collide on trivially easy words; pool needs tuning.
- Leakage risk: a bug that broadcasts a warmth value to the wrong phone breaks the whole game.

## Done means
Four phones each receive a different hidden word, players alternate appending words to one host sentence, each phone shows only its own updating warmth gauge, and at the end the host ranks all four secret words by perplexity and declares a winner — with no secret word ever visible on the host or another phone.
