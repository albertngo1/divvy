## Overview
Downstream is a 3-5 player concurrent-room draft-and-read game. Everyone drafts simultaneously from private packs that rotate around the table; the twist is that reading the *signals* — what's being taken upstream — is the point, and your phone is a perfect private memory of everything you've seen. Host screen = the table and the flow; each phone = your hand plus your private pack.

## Problem
Snake/booster drafting (7 Wonders, Magic) is the most elegant tabletop engine there is, and the most fiddly to run in person: you can't all look at one pack, you must pass physical stacks in sync, and *nobody can remember what they passed*, which kills the deepest skill — reading signals. Simultaneous private packs plus perfect recall are things one shared phone physically cannot provide.

## How it works
Each player is dealt a private pack of ~9 cards, each card a colored icon (red/blue/green + a value). Every player is **secretly assigned one target color** to collect. All phones show their pack AT ONCE; you tap one card to keep it, and your pack instantly slides to your left neighbor while your neighbor's arrives. Repeat until packs empty.
The **phone privately** shows: your current pack, your growing hand, your secret target color, and — the elegance — a "seen" log: every card you've viewed and passed, with the ones that vanished before wheeling back to you flagged. That drought is a signal: if the blue cards keep disappearing upstream, someone left of you is hoarding blue. The **host screen** shows only anonymized flow — packs shrinking, a heartbeat of picks — never contents.
Scoring: your collected target color, PLUS a bonus for privately guessing which opponent shared or competed for your color. You can only guess right by reading the drought, which only your phone's memory makes possible.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{seats[], packs:[Card[]], hands:{}, targets:{}, seenLog:{}}`. Server owns pack rotation: on each pick it removes the card, appends to the picker's hand, and moves the pack object to the next seat, pushing the new pack ONLY to that seat's socket. Sync is turn-gated per pack, not real-time ticked, but the hard part is *pace fairness*: players draft at different speeds, so packs queue at slow seats. v1 uses a soft per-pick timer and lets packs stack in a seat's queue rather than forcing lockstep rounds.

## v1 scope
- 3 players, one pack of 9 cards each, one round.
- Three colors, one secret target each.
- Phone shows pack + hand + target + seen-log droughts.
- One end-of-draft guess for the bonus.

## Out of scope
- Multiple packs / real 3-round booster structure.
- Card abilities beyond color+value.
- Hate-draft scoring, combos, rarities.
- Spectators or rejoin.

## Risks & unknowns
- Can players actually read a drought from 9 cards, or is signal too faint at v1 size?
- Pace fairness: does a slow drafter jam the rotation and frustrate fast ones?
- The bonus guess may feel bolted-on if the set-collection already decides the winner.

## Done means
3 phones join, each drafts from a private rotating pack in real time, the seen-log correctly flags cards that didn't wheel back, and at the end each player's target-color set scores plus a signal-guess bonus — validated by one playtest where a player correctly names their color rival from the drought alone.
