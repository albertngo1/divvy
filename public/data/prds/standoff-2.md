## Overview
Standoff is a phone-native take on **Ca$h 'n Guns** for 3-6 players: a simultaneous Mexican-standoff of hidden aim and bluffed firepower. Host TV is the table; each phone is a private, silent trigger.

## Problem
In Ca$h 'n Guns the *pointing itself* is the game — but in person you can see exactly who's aiming at you before you react, which leaks the whole bluff. Phones let every player lock in aim, loaded status, and nerve **truly simultaneously and hidden**, so the reveal is a genuine, gasp-worthy surprise no physical version can match.

## How it works
A loot pot sits on the TV. Each player holds a private hand of **Bang / Click** cards (e.g. 2 Bang, 3 Click) shown only on their phone. One round, four synchronized beats:
1. **Aim** — every phone privately taps a target player. Hidden.
2. **Reveal** — the TV simultaneously draws the full arrow graph of who points at whom.
3. **Nerve** — anyone aimed at privately chooses **Fold** (duck out, forfeit their share, safe) or **Hold**.
4. **Fire** — every still-aiming shooter privately reveals the card they play; a **Bang** eliminates its target from this round's payout (and must be a real Bang spent from hand). Survivors still standing split the pot.

Private to each phone: your card hand, your chosen target, your fold/hold, your played card — all committed blind and revealed only on the synchronized phase flip. Shared on the TV: the arrow graph, folds, bangs, and final split.

## Technical approach
Authoritative WS server with a phase clock (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `player{ hand:[card], aim, folded, playedCard }`, `room{ phase, deadline, pot }`. Each phase runs a server countdown; clients submit their private choice; the server **buffers all submissions and reveals only on phase transition**, so nothing leaks early — not even via network timing, since reveals are batched. Non-submitters at the deadline are auto-resolved deterministically (auto-Click on Fire, auto-Hold on Nerve). Hard part: airtight simultaneity + fair, legible timeout handling.

## v1 scope
- 3 players, one loot pot, one round
- Fixed hands: 2 Bang / 3 Click
- Beats: Aim → Reveal → Nerve → Fire → Split
- No health, no multi-round

## Out of scope
- Multi-round matches, 3-hit elimination, character powers
- Reconnection, spectators, animated cutscenes

## Risks & unknowns
- A 3-player aim graph is thin — bluff space may only sing at 4-5; flag for playtest
- Timeout defaults must feel fair, not punishing
- Must prove no client can infer others' aim from packet timing (batch-reveal test)

## Done means
Three phones join; each privately aims and holds a hidden card; the TV reveals every arrow at once with nothing leaked beforehand; a played Bang correctly removes its target from the split; folds and timeouts resolve deterministically — verified by a wire check that aim/card submissions never reach other clients before the phase reveal.
