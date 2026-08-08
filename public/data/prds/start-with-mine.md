## Overview

A 4-player, one-round, four-minute party game for a TV and four phones, built on Skull & Roses. Everyone hides tokens in a private stack, bids on how many tokens they can flip without hitting a skull, and the winning bidder must flip their own stack first. The new part: hidden state stays *mutable* during the reveal, and sabotage is anonymous.

## Problem

Skull's tension lives in a face-down disc, but once the discs are down the outcome is fixed — the bid is just arithmetic over other people's tells. Nothing changes during the flip, which is the most dramatic part of the game. On a table you obviously cannot secretly reorder your own stack mid-reveal. Phones can, and that's the one thing cardboard structurally cannot do.

## How it works

Four players. Each holds three tokens: two ROSE, one SKULL.

**Phase 1 — placement (simultaneous, private).** Each player drags two of their three tokens into an ordered stack on their own phone. **TV shows:** stack heights only. **Phone shows:** your exact stack, in order.

**Phase 2 — bid (simultaneous, private).** Each phone types 0–8: how many tokens you claim you can flip. All bids reveal at once on the TV. Highest becomes the Flipper (ties broken by earliest submit).

**Phase 3 — the flip (live).** The Flipper taps through their *own* stack first, publicly, one token at a time on the TV. Then they pick an opponent and flip that opponent's top token.

The twist: the instant the Flipper's finger commits to any opponent stack, **every non-Flipper phone** vibrates and shows a 1.5-second countdown with a single SHUFFLE button. Tapping it reverses your own remaining stack. The TV shows only an anonymous tally — "2 SHUFFLES" — so shuffling when you weren't the target is pure disinformation aimed at the Flipper's nerve. Shufflers are named only at round resolution; that public reveal is the only cost, and the only brake.

Flip the bid number of roses → Flipper wins the round. Turn over a skull → Flipper loses immediately and the skull's owner wins.

## Technical approach

Cloudflare Durable Object per room. Model: `Stack{ownerId, tokens[], revealed[]}` with token identities held server-side and mirrored only to the owner's socket. Phases advance on DO alarms.

The 1.5s window is the whole engineering problem. The server broadcasts `WARN{serverDeadline}` as an absolute epoch timestamp; each client renders its countdown against a clock offset measured by five ping round-trips at join. Shuffles are accepted until `deadline + 150ms` grace, then the server resolves — applying any queued shuffle *before* the Flipper's already-queued flip. The Flipper's tap is never applied on receipt; it is held until the window elapses. Latency fairness is non-negotiable: a player on a slow phone must not silently lose their shuffle.

## v1 scope

- Exactly 4 players, exactly one round
- Two tokens placed per player from a 2-rose/1-skull supply
- One bid, one Flipper, one flip sequence
- One shuffle per player per round, anonymous until resolution
- TV: stack heights, bid reveal, flipped tokens, shuffle counter, final naming
- No reconnect, no multi-round elimination arc, no sound

## Out of scope

Skull's real multi-round token-loss arc; the escalating bid ladder; 5–6 players; animation; reconnection.

## Risks & unknowns

1.5s may be too tight on real hardware — playtest at 1.5s and 2.5s. Shuffling may be strictly dominant if it is free; the end-of-round naming is a weak brake and the fallback is a −1 score per shuffle. With only two tokens, "reverse" means "swap," which is exactly one meaningful decision — enough for v1, possibly thin.

## Done means

Four phones and a TV run a full round to a win with no host intervention; instrumented logs show a shuffle accepted at 1.4s and one rejected at 1.7s past WARN; and the round ends with at least one player who shuffled without being the target, confirmed in the reveal.
