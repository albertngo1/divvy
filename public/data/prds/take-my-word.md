## Overview

A 4-player bluffing game for a TV plus phones, built on Cockroach Poker. One face-down card walks around the table. Each holder passes it on with a claim about what it is. In the tabletop original the claim is spoken aloud, so the whole table tracks it. Here the claim is **typed and delivered to exactly one phone** — and the moment the card resolves, the TV publishes the full chain of private claims against the truth.

## Problem

Cockroach Poker's bluffing is public, which means the table adjudicates collectively and the lie is a one-shot performance. Making the channel private turns each hop into a two-person transaction with an audience that can see the transaction happening but not its contents — and then makes every lie permanently, publicly auditable a minute later. That gap between "nobody can check me" and "everybody is about to" is the game.

## How it works

1. Server deals one card from a 5-creature deck (Rat, Fly, Toad, Bat, Spider). Passer P1 is chosen at random.
2. **P1's phone privately** shows the true card and a claim picker: "This is a ____." P1 picks a target player and a claim. The TV prompts P1: **"Say something out loud."** The room hears the performance; the room does not see the claim.
3. **TV shows:** an arrow P1 → P3, the card face-down, and the hop count. Never the claim, never the card.
4. **P3's phone privately** shows the claim text and two buttons: **CALL** (true / false) or **PEEK & PASS**.
5. PEEK & PASS reveals the true card to P3 alone, then gives P3 their own claim picker and a target — excluding anyone who has already held it. The TV's arrow grows into a visible chain; the room watches knowledge accumulate without learning any of it.
6. On CALL, the card flips. Wrong caller takes it; right caller gives it to the passer.
7. **The receipt.** The TV then plays back the entire chain — every private claim, side by side with the truth — so the room retroactively learns who lied, who relayed honestly, and whose out-loud performance did not match what they typed.

Per-phone privacy is load-bearing three ways at once: the card is known to a growing subset, each claim is a point-to-point message, and the receipt only lands because the room genuinely did not have that information a moment ago.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs as WebSocket clients.

State: `{ card, chain: [{from, to, claim, peeked}], holder, phase, seen: Set<playerId> }`.

Sync: the DO is the sole owner of `card` and `chain`. Phones receive a projected view — the current holder gets `{ claim, trueCard? }` where `trueCard` is included only after a PEEK action is accepted server-side; everyone else gets `{ from, to, hopCount }`. The host tab gets the topology only. `chain` is broadcast in full exactly once, on resolve.

Hard parts: (a) the claim payload must be addressed to a single connection, so a room-wide broadcast is never the transport for game content; (b) a strict state machine — only the current holder may act, and a stale phone re-sending a pass must be rejected by hop index, not by wall clock; (c) reconnect must restore "have I peeked?" correctly or the card leaks.

## v1 scope

- 4 players, exactly ONE card, ONE chain, one resolve
- No hands — the server deals the single card
- Claim picker is 5 fixed buttons, no free text
- Resolve on the first CALL; no 4-of-a-kind loss condition
- Receipt playback as a static list, no animation

## Out of scope

Full deck and hands, multi-round play, a persistent per-player trust ledger, pass-backs, timers, reconnection, spectator view.

## Risks & unknowns

Private claims may kill table talk — the whole charm of Cockroach Poker is eye contact. The forced "say something out loud" prompt is the mitigation and it is unproven. With one card and four players the chain may resolve in two hops, too fast to feel like anything; a minimum-hop rule may be needed. The receipt could feel punitive rather than funny.

## Done means

Four phones join. One card passes through at least two hops. At every moment, exactly one phone displays the claim text and only peekers' phones have ever displayed the true card — verified by reading each client's received frames. On CALL, the TV renders the full chain with each claim marked true or false, and the room can see who lied.
