## Overview
Uplink is a cooperative anti-collision transmission game for 3-5 players. Every player is dealt a secret short word they must broadcast to the host over a narrow, shared radio spectrum. When two players transmit on the same channel in the same slot, both letters corrupt. Coordination — piling onto the same channel — is literally the failure mode; the group wins only by silently fanning out across the band. For friends who like tense, wordless cooperation.

## Problem
Anti-coordination party games almost always reduce to abstract number-picking ("secretly choose 1-5, matches lose"). Uplink dresses up the real ALOHA / Ethernet-collision problem — the exact reason your wifi backs off and retries — as a nervy cooperative broadcast, with a spectrum-waterfall that leaks *just* enough (which channels collided) to renegotiate without a word.

## How it works
The host TV shows a **spectrum waterfall**: K vertical channel columns (K = player count) scrolling down, one row per tick. Each phone PRIVATELY shows your secret 4-letter callsign (dealt uniquely) and, each tick, a row of K channel buttons. Every ~3s all players simultaneously pick one channel to transmit their current letter. Server resolves the barrier: a channel used by exactly one player lands cleanly (green cell); a channel used by two-plus garbles — red static burst — and every colliding player fails to advance and must retransmit that letter next tick. The host waterfall publicly shows, per tick, which channels were clean vs collided, but never *who* transmitted or *which* letter. Your phone privately tracks your own confirmed-vs-pending letters. Win: all players complete their full word within the tick budget (word length + slack).

Private per phone: your word, your progress, your per-tick channel choice. Shared: the anonymized clean/collided waterfall. Load-bearing because simultaneous secret choices with no view of others cannot survive a single passed-around phone.

## Technical approach
PartyKit / Durable Object room. Model: `room {K, tickBudget, tick}`, `player {id, word, cursor, channelChoice}`. Each tick opens a ~3s collection window; phones POST `channelChoice`; at close the server barrier groups by channel — singletons advance `cursor`, collisions hold. It broadcasts a per-channel `{clean|collided}` vector to the host (never identity/letter) and a private `{advanced?}` to each phone. Server-authoritative fixed-tick sync; no submission = idle (no collision, no progress). Hard part: barrier timing and making the waterfall legible enough that players infer contention pressure without any identity leak, plus tuning K (K = players guarantees a perfect permutation exists).

## v1 scope
- 3 players, K=3 channels, 4-letter words, one game.
- 3s ticks, budget = 7 ticks.
- Host waterfall (clean/collided columns) + win/lose banner.
- Phones: secret word, channel buttons, own progress.

## Out of scope
- Competitive/jammer roles, scoring ladder, variable K, reconnection, animation polish beyond green cell / red static.

## Risks & unknowns
- Trivially solvable if players verbally pre-assign channels — enforce a no-talking rule socially; no persistent player numbering to lean on.
- Waterfall legibility under a 3s clock.
- Whether one or two ticks of collision memory is enough signal to converge.

## Done means
3 phones + host on a LAN; three secret words dealt; over ticks, same-channel picks show red static and stall while singletons go green; completing all three words triggers a host win; a deliberate double-pick visibly collides.
