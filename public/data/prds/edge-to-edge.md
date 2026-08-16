## Overview
A 4-player, 8-minute cooperative party game where the phones stop being controllers and become the board. Everyone draws into a slice of one hidden canvas, the slices are shuffled between devices, and the room physically arranges the phones face-up on a table until the picture is continuous. The prize is not points — it's a poster of whatever the room assembled.

## Problem
Party games treat the phone as a dumb keypad; the six glowing rectangles on the table are the most interesting objects in the room and nobody uses them. Meanwhile "collaborative drawing" games always end in a gallery nobody keeps, because the artifact was never something the room had to physically build.

## How it works
**Draw (60s).** Each phone privately shows a blank vertical slice of one wide canvas, plus a ghosted 12% strip bleeding in from the slice to its left and right — sampled live from two *secretly assigned* neighbors. You draw to continue lines you can see arriving, not knowing whose they are. The TV shows only a timer and four anonymous ink-volume bars.

**Shuffle.** The server reassigns slices across devices and rotates a random subset 180°. Every phone now shows a static tile of someone else's work; nobody knows their own index. The TV shows a heavily blurred 32×8 thumbnail of the whole canvas — enough to argue about composition, useless for detail.

**Assemble (5 min).** Phones go face-up on the table. To assert "these two are neighbors," two players simultaneously touch the facing edges — one finger on each screen, across the seam. Both devices emit an edge-touch event; the server pairs complementary edges within a 250ms window and adds a directed link to the layout graph. The TV shows the graph as an abstract wiring diagram — link count, orphans, cycles — never the picture.

**Print.** When the graph is a single connected chain, the room hits DONE. The server composites the poster **in the order the room asserted**, then deletes the true ordering. The assembly you agreed on is canonical; there is no correct answer to be disappointed by. PDF downloads to every phone.

## Technical approach
Host tab + phone PWAs on one PartyKit Durable Object. Model: `Room{phase, canvasW}`, `Tile{id, ownerDeviceId, displayDeviceId, rot, strokes[]}`, `SeamEvent{deviceId, edge, tServer}`, `LayoutGraph{links[]}`.

Strokes are sent as pointer deltas at 20Hz; neighbor ghosts are just the last 12% of a peer's stroke buffer, forwarded by the DO — no shared canvas state, so no OT/CRDT needed.

The hard part is the seam handshake. Device clocks are useless, so pair on **server arrival time** with a per-device RTT offset estimated from a 10-ping handshake at join; require complementary edges (right-of-A ↔ left-of-B), unpaired devices, and Δt < 250ms. Two seams touched at once in a loud room will collide — the DO resolves by nearest Δt and rejects ambiguous pairs with a red flash on both phones.

## v1 scope
- Exactly 4 players, 1 round, one 4-slice canvas
- Black ink only, one brush width
- Ghost bleed from left/right neighbors only (fixed ring, secret assignment)
- Seam handshake + connected-chain check
- Composite poster → PDF download, true order discarded

## Out of scope
- 2D grids (rows *and* columns), color, undo
- Physical-size calibration across device DPIs
- Rejoin after refresh, spectators, saved galleries

## Risks & unknowns
- Seam handshakes may be too finicky under 250ms; fallback is a hold-both-for-1s gesture
- Mixed screen sizes make the composite look janky (may be a feature)
- Four people reaching over one table is either the whole joy or a mess

## Done means
Four phones on a table, four strangers draw for 60 seconds, assemble by touching seams, and a single PDF lands on all four phones showing one continuous drawing in the order they asserted — with no player having seen more than their own tile at any point.
