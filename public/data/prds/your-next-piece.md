## Overview

Your Next Piece is a 3–5 player competitive stacker for a TV plus phones. It steals versus Tetris — specifically the garbage-sending layer, where clearing lines is how you attack — and replaces the abstract garbage with something socially legible: **you personally choose the shape that drops into the person on your left.** For groups who like a game with a visible villain, especially one who is sitting right there.

## Problem

Versus stackers are the best competitive puzzle format ever made and they are completely illegible to a room. "He sent four garbage" means nothing to a spectator. And a phone-based stacker on its own is just solitaire in a circle — the phone adds nothing that a shared screen wouldn't do better. The missing piece is malice with a name attached.

## How it works

Everyone plays a small 8-wide well simultaneously, top half of their phone. Bottom half of the phone is the **gift hand**: three face-down-to-everyone-else piece cards you can spend on your left-hand neighbour. When their current piece locks, whichever gift you tapped becomes their next piece; if you tapped nothing, they get a random one.

You are attacked by your *right* neighbour and you attack your *left* neighbour, so it's a directed ring — no dogpiling, and you can't retaliate against your attacker. You cannot see your own next piece. Ever. You find out what you've been handed when it appears at the top of your well.

Gifts are earned, not free: clear a line and you draw a new card — S-pieces, an L with the mercy stripped off, and one rare "solid brick" that fills a single column cell and cannot be cleared. So the better you play, the crueller you can be, which keeps the leader under pressure to also be a good neighbour.

Private on phone: your well, your gift hand, your victim's well in miniature. Public on TV: **all wells at full size, side by side, plus a fat animated arrow every time a gift is spent, labeled "DEV → PRIYA".** The room watches every crime in real time; the victim watches the arrow and the piece land at the same moment. Top out and you're eliminated; last well standing wins.

## Technical approach

Host tab + phone PWAs + authoritative server (PartyKit Durable Object; Socket.IO over Tailscale Serve for LAN).

Data model: `Player { id, name, board: Uint8Array(8×16), activePiece, queue, giftHand: [3], alive, targetId }`. The ring is a static `targetId` assignment made at start.

Sync: **boards are simulated on the phone** (gravity, rotation, lock delay) and the phone ships a compact board diff plus a lock event on every piece lock — roughly 3–5 events/second/player. The server is authoritative for the parts that matter socially: gift spends, line clears, gift-card draws, and elimination. Gift resolution is server-side and strictly ordered — a gift arriving after the victim's next piece already spawned queues to the piece after, never retroactively swaps.

The genuinely hard part is that the TV must show all wells at near-real-time or the arrow animation lands after the piece does and the causality reads backwards. Host subscribes to a 15Hz board-state broadcast (5 boards × 128 cells = trivial), and the gift arrow is deliberately delayed to land exactly on the victim's spawn tick — sync the *feeling*, not the packet.

## v1 scope

- 4 players, fixed ring, one match, no rematch flow.
- 8×16 well, 5 piece types, no hold, no hard drop, no rotation kicks.
- Gift hand of 3, one gift card drawn per line cleared, cap of 3 held.
- Elimination on top-out; last standing wins. No score.
- Host screen: four wells and the gift arrow. Nothing else.

## Out of scope

Combos, T-spins, hold queue, garbage lines (gifts replace them entirely), teams, handicapping, matchmaking, persistence, mobile landscape layout.

## Risks & unknowns

Biggest risk is skill gap: one person who has played a stacker before eliminates everyone in 40 seconds. Mitigations to test — slow, fixed gravity (no speed ramp in v1) and a well shallow enough that top-out takes deliberate neglect. Second risk is thumb real-estate: well plus gift hand on a 6-inch screen may leave both cramped; gift hand may need to collapse to a bar. Unknown whether players actually watch their victim's miniature well or just spam gifts blindly — if blind, the miniature can be cut.

## Done means

Four phones join and play one full match ending in a single survivor. Every gift spend renders an arrow on the TV that lands within 200ms of the gifted piece spawning in the victim's well, verified across 30 gifts. At least one match produces an unprompted out-loud accusation between two players about a specific piece.
