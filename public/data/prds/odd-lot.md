## Overview
Odd Lot is a 3-4 player division game for a TV plus phones. It rebuilds "I cut, you choose" — the fairest mechanic in tabletop games and the slowest — as something everyone does simultaneously and privately. Instead of one designated cutter arranging piles while three people watch, every player authors a complete secret partition at the same time, and the table competes for the right to have their carve be the real one.

## Problem
Lot-making games (New York Slice, Modern Art's dealer's-choice, any "divide this into piles" phase) stall hard. One person arranges cardboard for ninety seconds; everyone else checks their phone. The information that would make it tense — how much each pile is worth *to you specifically* — is either public (so the puzzle is trivial) or requires hidden hands nobody wants to manage. Both failure modes come from the table being a single shared surface.

## How it works
One round.

**1. Deal.** The TV shows 6 goods. Each good has a public **bulk** number (1-4) printed on the TV. Each phone privately receives its own **value table**: what those same 6 goods are worth *to that player* (1-5 each, different per player, never shown to anyone else).

**2. Carve (60s, simultaneous, private).** Every phone drags all 6 goods into exactly 3 non-empty lots and secretly tags one lot as their intended **claim**. The TV shows only "3 of 4 carved" — never a preview.

**3. Enact.** The server picks the proposal with the smallest spread in total *bulk* across its three lots — the division that looks most evenly balanced to a stranger. Ties broken by earliest submission. That author becomes the **Cutter**, and takes the classic penalty: in a collision, the Cutter always loses.

So you are trying to author a carve that reads as fair by public bulk while quietly packing the goods you privately value into one lot — and then hoping nobody else wants that lot.

**4. Claim (15s, blind, simultaneous).** The enacted three lots appear on the TV. Every phone taps one. Reveal: any lot claimed by 2+ players is spoiled and everyone who reached for it gets nothing. Uncontested claimers score their private values. Cutter loses every tie.

**Phone (private):** your value table, your carve canvas, your claim tap.
**TV (public):** the 6 goods with bulk numbers, submission counters, the enacted division, the reveal.

## Technical approach
Authoritative WS server (PartyKit / Socket.IO over Tailscale Serve). Model: `Round{goods[{id,bulk}], valueTables{playerId:{goodId:value}}, proposals{playerId:{lots:[[goodId]], claimLotIndex}}, enactedProposal, claims{playerId:lotIndex}}`. Value tables are pushed only down each player's own socket — never broadcast, and the TV connection is a distinct role that never receives them.

Sync is phase-gated rather than continuous: a server-held phase timer, a commit barrier per phase, and a hard lock on claims so late taps are rejected rather than tie-broken by network luck. The genuinely hard part is UI honesty — a 6-into-3 drag partition that is legible on a 390px screen, plus an enactment rule the losing three players accept as non-arbitrary. Expect to iterate the tiebreak more than the netcode.

## v1 scope
- 3 players, 6 goods, 3 lots, exactly one round
- Fixed 60s carve / 15s claim, no configurability
- Bulk-spread enactment rule, earliest-submission tiebreak
- One score screen showing everyone's private value table revealed at the end

## Out of scope
- Multiple rounds, currency, negotiation, carry-over inventory
- Reconnect, more than 4 players, animation polish

## Risks & unknowns
- The enactment rule may feel like a lottery rather than a skill; a "most even" rule may collapse to everyone submitting near-identical carves
- Blind claim collisions could punish the whole table into nobody scoring — may need a fallback where a spoiled lot goes to the Cutter's opponent
- Drag-partition on a phone is the real UX risk

## Done means
Three phones and a TV complete a round end-to-end; value tables never appear in the TV's socket traffic (verified in a log); a contested lot correctly spoils for both claimers; and post-reveal at least one player says they deliberately made a lot look boring.
