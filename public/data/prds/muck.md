## Overview
Muck is a silent cooperative elimination game for 3-5 players. Every player holds a *private* hand of symbols and, over a handful of no-talking ticks, must whittle down to hold the SAME final symbol as everyone else — inferring the room's shared attractor rather than reading it off a board.

## Problem
Most convergence games hand everyone the identical view, so the Schelling-point tension is dull: you can just look at the same board the others see and guess. Muck hides each player's hand, so the shared survivor must be *deduced from divergent starting positions*, not observed.

## How it works
The host TV shows a shared legend of 8 icons (apple, key, moon, anchor…). On join, each phone is privately dealt 6 of those 8 — a different subset per player; the server guarantees the players' hands share at least one common icon. Your phone shows ONLY your six live icons.

Each tick (10s), every phone secretly taps one of its own live icons to KILL it — permanent, no undo. When the tick resolves, the host reveals nothing about who killed what; it shows only an anonymized running tally of how many icons remain in play across the whole room ("14 alive… 11… 9"). Players keep culling toward what they believe is the shared survivor. After 5 ticks every phone is down to one icon, and the host flips all phones face-up simultaneously. Win only if all phones hold the identical icon.

Private (phone): your secret 6-icon hand and your kills. Shared (host): the 8-icon legend + the anonymized alive-count sparkline — never any player's hand.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Cloudflare Durable Object). Data model: `room {pool:[8], phase, tick}`, `player {id, hand:Set, alive:Set}`. On join the server deals subsets ensuring the three-way intersection ≥ 1 (with 6-of-8 hands, ∩ ≥ 2 is guaranteed). Each tick is a barrier: collect one kill per player, validate it's in that player's `alive` set, apply, broadcast only the aggregate alive histogram. Sync is turn-gated so real-time is trivial. The genuinely hard part is DEALING: subsets must guarantee a reachable common survivor while still feeling divergent, and the anonymized feedback must leak enough to enable convergence without identifying players — tuning icon count, hand size, and feedback granularity is the real design work.

## v1 scope
- 3 players, fixed
- 8-icon pool, deal 6 each, intersection guaranteed ≥ 2
- 5 silent kill-ticks down to one survivor
- Host shows legend + alive-count number only
- Binary win/lose reveal, no scoring, no rounds

## Out of scope
- 4-5 players / variable hand sizes
- Multiple rounds, scoring
- Per-icon "heat" feedback
- Custom icon packs

## Risks & unknowns
- With zero attribution, may be too random — might need a faint per-icon "still popular" hint.
- Guaranteeing a winnable deal without telegraphing the answer.
- Could feel arbitrary rather than deductive.

## Done means
Three phones each hold a distinct 6-of-8 hand, five synchronized silent kill-ticks resolve, the host shows a live alive-count, and at the end all three phones flip up simultaneously with a correct win/lose verdict that is true iff all three hold the same icon.
