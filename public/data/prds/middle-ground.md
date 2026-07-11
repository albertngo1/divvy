## Overview
Middle Ground is a silent word-convergence game for 3-5 players. Everyone starts from one shared seed word, but each phone is *secretly* pulled toward a different personal word — and the room must still meet on a single shared word, no talking allowed.

## Problem
Mind-meld word games ("everyone say the same word") start every player from the same prompt, so convergence is symmetric and often instant and boring. The interesting version gives each player a private, conflicting gravitational pull: convergence then demands *letting go* of your own bias to find the room's true center. That asymmetric pull is impossible to run on one shared phone.

## How it works
The host shows a single shared seed word ("SALT"). Each phone privately shows the seed PLUS a secret personal pull unique to you ("your pull: OCEAN"). Each tick, everyone privately types ONE word that connects to the seed and, they hope, matches the rest of the room. Words reveal simultaneously on the host. Any players who typed the identical (normalized) word "lock" into a cluster — the host draws them merged, and their private pulls are exposed and retired. Unlocked players see the revealed field and try again next tick. Win when the whole room is one cluster.

The catch: your secret pull nudges you toward words the others can't predict, so early ticks scatter. You have to read the revealed field and surrender your pull to converge.

Private (phone): the seed (shared) + YOUR secret pull + your current typed word (hidden until reveal). Shared (host): every revealed word each tick and the cluster graph — never anyone's un-revealed pull.

## Technical approach
Host + phone PWAs + authoritative WS server (Socket.IO over Tailscale Serve or PartyKit). Data model: `room {seed, tick, clusters:[[ids]]}`, `player {id, pull, submitted:string|null, locked:bool}`. Each tick is a barrier: collect one word per unlocked player, normalize (lowercase / stem / singularize / strip articles), group exact normalized matches into clusters, merge, broadcast the reveal. Real-time sync is trivial (turn-gated). The genuinely hard part is MATCHING: "ocean"/"oceans"/"the ocean" must count as one; too strict makes convergence impossible, too loose makes it trivial. A tuned normalizer plus an optional embedding-similarity threshold is the real work — as is authoring pulls that are close enough to bridge yet far enough to scatter.

## v1 scope
- 3 players
- One seed, one fixed set of 3 private pulls
- One-word ticks, exact normalized matching only
- Merge-into-clusters, win when all 3 match
- Cap at 5 ticks, then lose

## Out of scope
- Embedding / semantic fuzzy matching
- 4-5 players, multiple rounds, scoring
- Pull decks / difficulty tiers

## Risks & unknowns
- Exact matching may make 3-way convergence too hard within 5 ticks.
- Private pulls might read as noise rather than meaningful bias.
- Text-entry latency and typos.

## Done means
Three phones each show the shared seed and a distinct private pull; over synchronized ticks players submit hidden words that reveal together, matching words visibly cluster on the host, and the game declares a win the exact tick all three normalized words are identical — or a loss at tick 5.
