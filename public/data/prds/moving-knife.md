## Overview

A 60-second fair-division game for 3–5 people in one room. The host screen shows a single horizontal strip of loot — a pizza, a garage-sale table, a dragon hoard — and a knife line sweeping left to right. Every phone privately holds a *different* valuation of that same strip. First player to tap CLAIM takes everything the knife has passed and drops out; the knife resets and keeps sweeping for whoever's left. For anyone who has ever tried to split a bill, a pizza, or an inheritance.

## Problem

Fair division at a table is excruciating: "I cut, you choose" doesn't scale past two, and the real protocols (Dubins–Spanier moving knife, Selfridge–Conway trimming) are famously tedious to run by hand — someone has to physically inch a knife while four people stare and lie. But the *reason* it's interesting is that everyone secretly wants different things, and a table can't hold secret preferences without paper and shame.

## How it works

Host screen (public): one strip of 24 loot icons, a sweeping knife line, a countdown, and each player's avatar with CLAIMED / STILL IN. When someone claims, the taken segment greys out and slides off; the knife restarts from the new left edge.

Phone (private): the *same* 24 icons, but tinted by your personal point values (dealt secretly — you love anchovies, you hate the lamp), a live "value swept so far" number, and one enormous CLAIM button. Your fair share is 100/n — claim before you've swept that and you're short; wait for the fat region ahead and someone else may take it out from under you.

After the last player is left with the remainder, the host reveals every heatmap at once and computes **envy**: for each pair, would A rather have B's slice? A room where nobody envies anyone gets a shared bonus and a big ENVY-FREE stamp. The reveal is the punchline — you finally see that the person who grabbed early was starving for the one thing you didn't want.

## Technical approach

Host tab + phone PWAs + one Cloudflare Durable Object per room (PartyKit). State: `{strip: Item[], values: Map<playerId, number[]>, knifePos, phase, claims: []}`. The knife is never streamed — it's a pure function of `(serverEpochStart, now)` at 2% of strip width per second, so host and phones render it locally from a synced clock (NTP-style offset from three ping round-trips at join). Claims are `{playerId, clientKnifePos, clientTs}`; the DO arbitrates by RTT-corrected timestamp, not arrival order, and rejects anything outside a ±150 ms tolerance window. The genuinely hard part is that this is a real-time race with money on it: at 2%/sec, 100 ms of latency is 0.2% of the strip, so correction has to be honest and visible — the host replays contested claims in slow motion so the room can see the photo finish.

## v1 scope

- 4 players, one strip, one round, ~90 seconds total
- One hand-authored loot set of 24 icons; valuations dealt from a fixed seed pack
- Knife sweeps at a constant rate, no rewind, no trimming phase
- Envy matrix + heatmap reveal on the host screen
- Room code join, no accounts, no persistence

## Out of scope

Multiple rounds, custom loot decks, Selfridge–Conway trimming, 2D cakes, spectators, any economy that persists between games.

## Risks & unknowns

Does a claim feel *earned* or arbitrary? If valuations are too uniform the first tap always wins; the value distribution needs sharp private peaks. Latency disputes could poison a room — the slow-mo replay is the mitigation. Also: is 4 players enough tension, or does it need 5?

## Done means

Four phones join, each sees a visibly different heatmap of the same strip, all four claims resolve with no double-claim and no disputed race, and the host prints a correct envy matrix — verified by hand against the dealt valuations.
