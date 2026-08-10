## Overview

A 4–6 player hidden-role game for a TV plus phones. Everyone holds what looks like the same case file. One player's copy has three facts altered. Nobody is told their role — including the player who is wrong. Claims only score when a second player corroborates them, and a bad corroboration burns the corroborator too. The deduction is not "who is lying" but "whose word am I willing to put my own score behind."

## Problem

Swapped-detail imposter games usually collapse into one weird person contradicting four confident ones, who then out-vote them instantly. Nothing is at stake in agreeing. Here agreement is the risky act, so the whole table has to reason about its own reliability, not just point at someone.

## How it works

Host screen (public): a case title, 9 numbered slots labelled only by category (WITNESS 3, VEHICLE 2, TIME 5) with values hidden. Below, a live CONFIRMED ledger and a growing CONTRADICTION graph — nodes are players, edges are disagreements, drawn as the round runs.

Phone (private): all 9 slots with full values. Four phones hold the canonical file; one phone has 3 of 9 values altered plausibly ("navy sedan" → "black sedan"). No phone is marked.

90-second round. Any player taps a slot and PUBLISHES — the host screen shows "Priya publishes WITNESS 3" but not the value; Priya reads it aloud. Any other player then taps BACK IT or PASS. The server compares the backer's private value to the publisher's. Match: both +2, slot locks CONFIRMED. Mismatch: both −3, host draws a contradiction edge and reveals only that the two copies differ, never which is right. Target is 5 confirmed slots; the table falls short if it goes silent.

Then a 30-second vote: everyone names the doctored player. Innocents score for a correct majority. The doctored player wins outright by surviving, or by conceding early and correctly naming all three altered slots.

## Technical approach

PartyKit Durable Object per room. State: `{players, file: Slot[9], perPlayerOverrides: {pid: {slotId: value}}, publishes[], backings[], edges[]}`. The canonical file plus a per-player override map is the entire asymmetry — phones fetch a projected view and never see anyone else's. Host and phones subscribe to one room socket; the server is authoritative for every comparison so a tampered client learns nothing.

Hard part: the publish→back handshake under contention. Two players tapping BACK IT within 200ms must resolve to one backer, deterministically, with the loser seeing an instant "taken" state rather than a rollback. Server assigns monotonic sequence numbers, first write wins, phones show optimistic pending state for ≤300ms.

## v1 scope

- One hand-written case file, 9 slots, one alteration set
- 5 players, one 90-second round, one vote
- Host screen: ledger + contradiction edges only
- Phones: slot list, PUBLISH, BACK IT / PASS, score
- Room code join, no accounts, no reconnect

## Out of scope

Multiple rounds, generated cases, audio, spectators, mobile-Safari backgrounding recovery, animation polish.

## Risks & unknowns

The doctored player may hit zero altered slots by luck and never be findable — may need to force one publish per player. −3 might make everyone pass and stall the round; tune. Reading values aloud is trust-based and unenforceable.

## Done means

Five phones join by code; each renders its own slot values; a publish/back pair resolves in under 300ms with correct score deltas and a drawn edge; a completed round names the doctored player and reveals all three alterations on the host screen.
