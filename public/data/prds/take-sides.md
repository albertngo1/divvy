## Overview
Take Sides is a concurrent-room coordination game for 4–6 players. A shared host screen (TV/laptop) hosts the lobby; every player's phone is a private controller. The goal: the whole room silently partitions itself into two equal crews, converging on one agreed split with zero talking.

## Problem
Most 'form teams' moments in party games are loud and instant — someone shouts the split. The itch here is the *silent* negotiation: can a room agree on a clean two-way division using only private, simultaneous, revisable intentions? It's a Schelling-point problem where the answer emerges rather than being announced.

## How it works
Each phone PRIVATELY shows the full roster as tappable name-chips and a single toggle: for every OTHER player, you place them either **With Me** or **Against Me**. You are always implicitly on your own side. You can re-bucket anyone, anytime, freely — it's a live continuous state, not a submit.

The server continuously checks for global consistency: does there exist a single 2-coloring of the room such that every player's 'With Me' set equals their own color-group (minus themselves) and the two groups are equal size? When yes, it locks and celebrates.

The shared HOST screen shows ONLY: a live 'CONSENSUS: 62%' meter (fraction of ordered pairs where both players agree they're same/different side) and, crucially, the single most-contested player — the one whose bucketing others disagree about most — pulsing red. No one's actual buckets are ever shown. Players read the pulse, silently guess who to move, and re-negotiate. The private, simultaneous, editable per-phone partition is the whole game — a single passed phone collapses it to one person deciding.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `players[]`; per-player `buckets: {targetId: 'with'|'against'}`. On every edit, the DO recomputes: build an agreement graph, attempt equal-size 2-coloring consistent with all 'with'/'against' edges (for ≤6 players, brute-force all 2^n balanced partitions, ~15 candidates — trivial). Emit `consensusPct` + `hottestPlayerId` to host, `locked=true` on success. The genuinely hard part is the *feedback design*, not sync: revealing enough (one contested player) to make progress without revealing buckets and killing the silent-negotiation tension. Sync itself is <10 tiny messages/sec.

## v1 scope (humiliatingly small)
- Exactly 4 players, split into 2v2.
- One round, no timer.
- Host shows consensus meter + one pulsing contested name.
- Win = one consistent balanced split held for 2 seconds.

## Out of scope
- 3+ way splits, uneven teams, multiple rounds/scoring.
- Any chat, emoji, or per-player reveal.
- Reconnect/late-join handling.

## Risks & unknowns
- 2v2 may resolve too fast to feel like negotiation; 6-player 3v3 might be the real sweet spot — needs playtest.
- 'Hottest player' hint could feel arbitrary or oscillate; may need smoothing/hysteresis.
- Risk it degenerates into a stalemate loop with no words to break ties (that might also be the fun).

## Done means
4 phones join, each privately buckets the other 3, and the moment all four buckets describe the same 2v2 split the host screen locks and shows the two crews — with no bucket ever having been displayed mid-game.
