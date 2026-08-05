## Overview

Bid With Time is a 4-player one-lot auction game where the currency is your remaining time, spent live and secretly. It's for groups who find in-person auctions tedious — the chip counting, the "whose bid stands?", the hour-long Modern Art session — and want the bluff without the bookkeeping.

## Problem

Tabletop auctions are arithmetic in a party costume. Real money is public, so bidding is really a spreadsheet exercise; hidden money requires an honor system nobody enforces. Meanwhile the actual fun — the moment you realize you overpaid and can't take it back — is buried under change-making. Time is a currency that spends itself, cannot be miscounted, and physically *feels* expensive.

## How it works

Each player starts with a private 60-second bank. Three lots are auctioned in sequence (v1: three, they're fast). For each lot, all four phones show a HOLD button. While you hold, your bank drains in real time. Release, and you're out of that lot forever. Last player still holding wins the lot — but everyone who held pays the time they burned. It's an all-pay auction, which is the cruelest and funniest kind.

**Host TV shows publicly:** the lot (a scoring card worth 3–7 points), how many players are still holding ("3 HANDS DOWN"), and a coarse fuel gauge per player quantized to four buckets — PLENTY / SOME / LOW / FUMES. Never exact numbers.

**Each phone shows privately:** your exact remaining time to the tenth of a second, your drain rate, and a live "if you win this and nothing else, your final score" projection. The asymmetry is the game: you know you have 4.2 seconds and you're the only one who knows it. Everyone else sees FUMES and has to decide whether FUMES means 9 seconds or one.

At zero, your finger is force-released and the TV announces it dramatically. If two players hit zero in the same tick, the lot goes unsold.

## Technical approach

Socket.IO server over Tailscale Serve, or a PartyKit DO. State: `{lot, holders: Set<playerId>, banks: Record<playerId, ms>, tickSeq}`. Server owns the clock absolutely — phones send only `HOLD_START` / `HOLD_END` events with a client timestamp, and the server reconciles against its own receipt time, clamping any client-claimed offset to a 250ms window so a laggy phone can't claim free seconds.

The hard part is drain fairness under variable latency. Solution: the server ticks at 100ms, debits every holder, and broadcasts a bucketed public state at 200ms while unicasting each player their own exact balance in the same frame. Clients render their own balance by local interpolation from the last server frame, so the number feels smooth without ever being client-authoritative. A `touchcancel` on iOS (notification banner, call) must be treated as a release — pre-warn players, and hard-cap the room at one lot per 60s so a dropped phone loses at most one lot.

## v1 scope

- Exactly 4 players, 60-second banks, 3 lots
- Lots are point cards only, no art, no set bonuses
- Four-bucket public fuel gauge
- All-pay resolution, simultaneous-zero = unsold
- Final TV screen: points won + seconds burned per player

## Out of scope

Rebuying time, set collection, lot previews, more than 4 players, tie-breaks beyond unsold, rematch persistence.

## Risks & unknowns

Holding a button for 20 seconds may be physically boring rather than tense — the bucket transitions on the TV are what supply drama, and they may need sound. Touch reliability across iOS Safari lock/notification interrupts is the largest technical unknown. The all-pay rule might be so punishing that round 1 teaches everyone to never bid; three lots exist partly so players get a second chance to learn.

## Done means

Four phones hold and release through three lots with server-authoritative drain; a player who releases at 12.0s remaining is charged exactly the elapsed hold within ±150ms; the TV never displays an exact balance; and the final screen correctly names the winner of each lot including one unsold tie.
