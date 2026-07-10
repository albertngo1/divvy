## Overview
A riff on **Herd Mentality** with a hidden-role bite, for 4-6 players. Everyone answers the same everyday question wanting to *match the crowd* — but one secret Black Sheep must be the only person with their answer, and slip the suspicion vote afterward.

## Problem
Herd Mentality's tension is 'think like everyone else,' but on paper everyone shouts and coordinates, and there's no traitor to keep you honest. The itch: enforce private, simultaneous answers so no one can copy, then add a saboteur so every weird answer carries a charge — *was that the sheep, or just a genuine weirdo?*

## How it works
The server secretly assigns one Black Sheep; their phone privately shows '🐑 You're the Black Sheep — be the ONLY one with your answer.' Everyone else's phone privately shows 'Match the herd.' The host TV shows a prompt ('Name a pizza topping'). Every phone privately and simultaneously types a short answer against a timer. The server groups answers and the TV reveals the clusters. Herd players in the largest cluster score +1. The Black Sheep scores +3 **only if they are in a cluster of exactly one**. Then a suspicion phase: every phone privately taps who they think the sheep was; if a majority fingers the sheep, the +3 is voided and correct accusers each score +1.

PRIVATE per phone: your role, your typed answer, your suspicion vote. SHARED: prompt, grouped clusters, scores, accusation result.

## Technical approach
Host tab + phone PWA + authoritative WS (PartyKit/Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{code,phase,prompt,sheepId,answers:{pid:text},clusters,votes}`, `Player{id,role}`. Phases LOBBY→ROLE→ANSWER→CLUSTER→SUSPECT→SCORE. Answers are held server-side until all submitted or the timer fires, then clustered: lowercase/trim, then exact-normalized grouping in v1 (embedding cosine or synonym-grouping is a later upgrade). `sheepId` and all answer text are withheld from clients until reveal; private payloads are targeted per socket. The genuinely hard part: (1) **fair, explainable clustering** of free text so 'pepperoni' vs 'peperoni' group sanely without frustrating players — v1 leans on strict normalization plus a host manual-merge fallback; (2) **strict simultaneity** — lock answers, no peeking, and reconnection preserves a submitted answer.

## v1 scope
- 4 players, one prompt, one round
- Exact-normalized clustering only (no embeddings)
- One Black Sheep, one suspicion vote, scores on TV

## Out of scope
- Semantic/embedding clustering, multiple rounds, score-to-win
- Large prompt packs, host merge UI, reconnection polish, >6 players

## Risks & unknowns
- Clustering fairness *is* the game's fairness; exact-match may split legit matches (pepperoni/pepperonis) and annoy
- With 4 players 'cluster of exactly one' may be too easy for the sheep — needs scoring tuning
- Is one-round deduction satisfying or too thin?
- Typing-speed differences under the timer

## Done means
Four phones get roles (one sheep, privately); all four type an answer to one TV prompt with no phone seeing another's answer before lock; the TV shows grouped clusters; the herd majority scores and the lone sheep scores only if truly alone; each phone casts a private suspicion vote and the TV shows whether the sheep was caught; and no client received `sheepId` or any answer text before the reveal phase (verifiable in logs).
