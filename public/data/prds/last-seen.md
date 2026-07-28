## Overview

A 3-player, 60-second silent consensus game for a living room: host TV plus three phones. Everyone is trying to land on the same colored swatch. Nobody may speak. The only information any player gets is a single stale glimpse of one neighbor — and the ring topology guarantees that the obvious strategy provably fails.

## Problem

Matching games usually give everyone the same feed, so "converge" degenerates into "pick the obvious thing." The interesting version of agreement is the one distributed systems actually have: partial, delayed, asymmetric views, where the hard part isn't guessing the answer — it's deciding who moves and who holds still, with no channel to negotiate it.

## How it works

The server wires the three players into a directed ring: A watches B, B watches C, C watches A. **The ring is shown publicly on the TV** — everyone knows the shape; nobody can see around it.

A tick fires every 5 seconds. Each phone privately shows: a palette of 8 swatches (order scrambled per phone, so "the second one" is not a shared reference), your current pick highlighted, and a single card reading *"Last seen: [swatch]"* — the value your watched neighbor held on the **previous** tick. That's it. You never see the third player, and you never see anything current.

The TV shows the ring diagram, the tick clock, and a churn trace — a scrolling waveform of how many players changed pick each tick. It never shows a swatch or a name until the round ends.

The trap is the whole game: if all three simply copy what they saw, the multiset of picks rotates around the ring every tick and *never* converges. Someone has to freeze and become the anchor — and there is no way to volunteer. The room feels this happen: the churn trace stays pinned at 3, ticking, until somebody guesses that it should be them. Overcorrection (two people freezing on different swatches) rings just as badly.

Win: one server snapshot in which all three picks are identical. The TV floods with that color and replays the full three-track history so everyone can see exactly when the anchor appeared.

## Technical approach

Host browser tab + phone PWAs + one authoritative WebSocket room (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).

Data model: `Room { code, tick, phase, ring: [A→B→C→A], history: Tick[] }`; `Tick { n, picks: {playerId: swatchId} }`; `Player { id, seatIndex, paletteOrder, currentPick }`.

Sync: the server owns the tick clock absolutely. Phones send `setPick` freely; the server records last-write-before-boundary. On each boundary the server snapshots all picks, appends to history, checks equality, then fans out to each phone **only** `history[n-1].picks[watchedPeer]`. Phones never receive the full snapshot — the redaction lives server-side so a devtools-open player learns nothing.

The genuinely hard part: strict staleness fairness. Every phone's "last seen" card must land within the same few hundred ms, or an early-informed player gets an extra beat of thinking time. Ticks carry a server-stamped deadline; phones render off a locally estimated offset (a couple of round-trip pings at join) and animate the reveal to a common wall-clock instant rather than on packet arrival.

## v1 scope

- Exactly 3 players, one round, 12 ticks (60s)
- 8 fixed swatches, per-phone scrambled order
- Fixed ring, drawn on the TV
- Phone UI: palette + "Last seen" card. Nothing else
- TV: ring, tick clock, churn trace, win flood + history replay

## Out of scope

- 4+ players, alternate topologies, hidden ring
- Scoring, streaks, multiple rounds, accounts
- Reconnect grace, spectators, sound design

## Risks & unknowns

- Rotation deadlock may frustrate instead of delight if no one intuits the anchor role — the churn trace is the only nudge, and it may be too subtle
- 5s ticks may be too slow (boredom) or too fast (no reasoning); needs a live tuning pass
- Determined players could just talk; the game leans entirely on the room honoring silence

## Done means

Three phones join a code, the ring renders on the TV, ticks fire on a shared clock, and each phone provably sees only its neighbor's prior-tick swatch (verified by inspecting socket frames). A room reaches an all-identical snapshot, the TV floods and replays three tracks, and a deliberate all-copy run demonstrably fails to converge for the full 12 ticks.
