## Overview
A double-blind spatial-packing scramble for 1 Foreman + 3 dockworkers. The Foreman's phone is the cargo bay — the board. Every dockworker's phone hides one crate whose shape only they can see. Neither side has the whole picture, and a crane timer is falling.

## Problem
'One phone is the map' usually means the seer knows everything and the pieces know nothing. The fresh itch: split the information *both* ways. The board-holder sees where things must go but not what anyone is carrying; the pieces know exactly what they hold but have no idea what the hold looks like. The only bridge is frantic talk.

## How it works
A single 90-second round to stow all crates before the crane crushes whatever's still loose on the dock.

**Foreman phone (the board, PRIVATE):** a small grid cargo bay with a few pre-blocked cells (ballast) and empty slots of varying footprint. The Foreman sees the whole bay but sees crates only as anonymous 'incoming' tokens with no shape.

**Dockworker phones (PRIVATE, one each):** exactly one crate — a distinct polyomino shape with a size and a rotation dial. The worker can rotate and 'offer' their crate, but has zero view of the bay. They only know their own block.

**The loop:** workers describe their crate ('I'm an L, three long, one wide'); the Foreman eyeballs the bay and calls a target ('drop your L rotated once into the back-left corner'). The worker rotates to match and taps COMMIT with a chosen anchor cell the Foreman dictates. The host TV animates the crate thunking into the bay — legal placements lock green; overlaps or overhangs bounce back red and cost precious seconds. When every crate is legally stowed before the crane lands, you win; any crate still loose at zero gets crushed and the load is scrapped.

Load-bearing per-phone: each crate is a separate private shape held simultaneously, and the bay lives on exactly one screen. Pass a single phone around and the double-blind — the whole game — evaporates.

## Technical approach
Host tab + phone PWAs + authoritative WS server (Socket.IO over Tailscale Serve or PartyKit). Data model: `Bay{grid[][], blocked[]}` sent ONLY to the Foreman; `Crate{playerId, cells[], rotation, placed}` sent ONLY to its owner. A COMMIT sends `{playerId, anchorCell, rotation}` to the server, which validates footprint against the authoritative bay (in-bounds, no overlap, no clip into ballast), then broadcasts a placement event to the TV and a lock to the owner. Hard part isn't sync — it's authoritative, timer-driven placement validation with a countdown that keeps ticking through rejects, so a bad drop costs time rather than pausing the world; all geometry is resolved server-side to prevent client desync on rotation math.

## v1 scope
- 1 Foreman + 3 dockworkers, fixed roles
- One 5x5 bay, three hand-authored polyomino crates, one 90s round
- Four rotations, snap-to-cell placement, red-bounce on illegal

## Out of scope
- Weight/balance, stacking, multiple decks
- Competitive rival crews, scoring beyond win/lose
- Procedurally generated bays or crate sets

## Risks & unknowns
- Whether verbal shape-description is fun or maddening under time pressure
- Tuning bay tightness so it's solvable but not trivial
- Rotation-language confusion between Foreman and workers

## Done means
Four phones join; the Foreman sees a bay the workers can't and the workers each see a crate the Foreman can't; a dictated commit validates server-side and thunks into the TV grid; three legal placements before 90s shows a win, a leftover crate at zero shows a crushed-load loss.
