## Overview

A 4–6 player couch game for a group that already has something playing. Instead of betting *on* the show, you sell each other **insurance** against it. One phone names a peril; the other phones secretly quote a premium to cover it. The show becomes a claims event.

## Problem

Every "bet on the TV" party game makes everyone a bettor and the app the bookmaker. That's flat: all players face the same question with the same information and the app absorbs all risk. Nobody is ever *exposed to another human*. Insurance flips it — the interesting seat is the one holding the bag on a fear someone else invented.

## How it works

1. **Write the peril (private).** Host plays a 6-minute clip. Before it starts, each phone privately types one specific, observable thing they'd hate to see: "a dog is in danger", "someone covers a song I like", "Marcus says 'called it'". Room events count.
2. **Post anonymously (shared).** The TV lists all perils, numbered, text visible, **author hidden**.
3. **Underwrite (private, sealed, simultaneous).** 60-second timer. Every phone quotes a premium (0–50 chips) on every peril *except its own* — the server knows which is yours and grays it out. Quotes never leave the server.
4. **Bind (shared).** For each peril the **lowest** quote wins. The author is forced to buy at that price and pays it. The TV shows peril + winning premium + **underwriter's name**. The author stays anonymous.
5. **Watch.** When a peril occurs, its policyholder taps CLAIM. Playback pauses; the room votes YES/NO on the TV. On YES the underwriter pays a flat 100-chip face value to the (still anonymous) holder.
6. **The actual game.** You are pricing a *person*, not an event. Phrasing leaks authorship; authorship leaks intent. A peril someone wrote because they've seen this movie is worth far more than 4 chips.

Private per phone: your peril's authorship, your quotes, your bank. Shared on TV: peril list, winning premiums, underwriter names, claim votes, standings.

## Technical approach

Host browser tab + phone PWAs against one authoritative room (PartyKit / Cloudflare Durable Object; Socket.IO over Tailscale Serve works identically).

`Room{code, phase, clipId, players[], perils[], policies[], claims[]}`, `Peril{id, authorId, text}`, `Quote{perilId, playerId, amount}`, `Policy{perilId, underwriterId, premium}`. Quotes and `authorId` live server-side only.

Sync: phones send intents; the DO's single-threaded loop is the only writer; phase transitions run on **server** timers, never client ones. Each socket receives a *projection* of canonical state filtered for its own `playerId` — the client is never trusted to hide anything, so `authorId` and rival quotes are absent from the wire, not merely unrendered.

Hard part: that per-socket redaction fan-out plus sealed-bid simultaneity — accept quotes until the server timer fires, reveal only the minimum, break ties by a room seed, and let a refreshed phone resume its private state from a signed token in localStorage. Playback lives on the host tab; claim-pause broadcasts carry a monotonic `serverTime` so everyone freezes on the same frame.

## v1 scope

- 4 players, one hardcoded 6-minute clip
- Exactly one peril each, one quoting round
- Fixed 100-chip face value, no deductible
- Claim settled by majority tap on the TV
- Room code, no accounts, no persistence

## Out of scope

Multiple rounds; partial payouts and deductibles; reselling or reinsuring policies; streaming-service integration; automatic peril detection; app stores.

## Risks & unknowns

Ambiguous perils turn claim votes into arguments — that may be the fun or may be a fight. Timid underwriters could collapse premiums to zero; generic perils kill the adverse-selection joke (mitigate with three sharp examples on the TV). 60 seconds of typing is slow at party pace. Clip choice matters enormously.

## Done means

Four phones join by code; every peril receives a sealed quote from every non-author; exactly one policy binds per peril at the lowest premium; at least one claim is voted and settles chips correctly; the TV shows final standings. Verified in devtools: no client's WebSocket payload ever contains another player's quote or any peril's `authorId`.
