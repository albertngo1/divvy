## Overview
Regift is a memory-and-bluff party game for 3-6, riffing on *That's Not a Hat*. Gifts circulate around the table; each is secret, held only in your memory, and you must convincingly re-gift it under a false name when you can't remember what you're actually holding.

## Problem
*That's Not a Hat* is a razor-sharp memory-bluff game, but it lives entirely on physically hiding face-down cards and honest peeking. Run it off one shared phone and you'd have to pass the device around to see your card — destroying the simultaneous, private secrecy the whole bluff depends on. It's a game that structurally CANNOT be one-phone.

## How it works
Each phone privately flashes one gift (icon + label, e.g. 🧦 SOCKS) for five seconds, then flips face-down on your own screen — you can't freely re-peek. The host TV shows a passing instruction: "Pass the SCARF → to your left." The player pointed to must slide their held gift to the named neighbor, their phone privately prompting "Send this as the SCARF?" — they commit blind, from memory. The receiver's phone buzzes; BEFORE it flips, they choose privately: tap REGIFT (accept it, and now they must remember it to pass it onward) or CALL IT — "that's not a scarf!" On a challenge, the server flips the true card onto the TV: if it wasn't the scarf, the sender takes a strike; if it genuinely was, the challenger takes the strike. First to two strikes is out.

Load-bearing privacy: your gift is memory-only and visible on YOUR phone alone; the bluff exists solely because others can't see your screen and you can't re-peek. A passed shared phone would expose every card and collapse the game instantly.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `Room { players:[{id, held:{cardId,gift}, strikes, peeksUsed}], pointer, pendingPass:{from,to,claim}, phase }`. Peek budget is enforced server-side: the card auto-hides after the timeout and a re-peek is either forbidden or costly, so the memory constraint is real. Sync strategy: pass and challenge resolution must be atomic — the server locks the pending pass so accept/challenge is a single authoritative transition, preventing two phones from double-acting. Hard part: enforcing no-peek memory fairly (screenshots aside) and resolving simultaneous receiver actions cleanly.

## v1 scope
- 3 players, one held gift each, ~5 gift types
- One five-second peek, then hidden
- One pass + one challenge resolution
- First strike ends the demo

## Out of scope
- Multiple held cards per player, full strike ladder
- Animations, larger gift decks, spectator view

## Risks & unknowns
- Memory load may frustrate more than delight
- Screenshot re-peeking (accepted for v1)
- Timing of simultaneous accept vs. challenge taps

## Done means
Three phones are each privately shown a gift that then hides, a player passes a card with a false claim, a receiver challenges, and the TV flips the true card and assigns the strike to the correct player.
