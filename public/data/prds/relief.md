## Overview
Relief is a cooperative print-making party toy for 3–5 people in a room, played on a shared host screen (the "press") plus each player's phone (a private carving surface). There is no score. The whole game exists to produce one artifact: a single relief print, pulled once at the end, that the group screenshots and keeps.

## Problem
Blind collaborative-drawing games (exquisite corpse, telephone-pictionary) get their charm from the reveal, but they're passed one phone at a time and mostly played for laughs, not for a thing you'd frame. The itch: a group art object that's genuinely surprising because everyone worked *simultaneously and blind*, and beautiful enough to be a keepsake, not a punchline.

## How it works
The host screen shows a blank rectangle divided into regions (one per player) and a shared theme word ("harbor", "insomnia"). Each **phone privately** shows ONLY that player's own region as a carving canvas: you drag to *remove* material (relief printing is subtractive — you carve away what stays white; what you leave prints in ink). You never see your neighbors' regions, only a 2px sliver of the shared seam so edges can be made to almost-meet. A 3-minute timer runs. When it ends, the host "inks and pulls" the block: all four private regions composite into one monochrome print with a paper-grain texture and slight registration wobble. The **shared screen** reveals the assembled image for the first time — to everyone at once, including the carvers. Because nobody could see the whole, the seams collide in surprising ways (a carved wave in one quadrant flows into someone's carved gull). A "Pull again" button re-inks in a different color for variants.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room {theme, regions[], timer}`; each `region {playerId, mask}` where `mask` is a run-length-encoded bitmap (e.g. 256×256 per quadrant). Phones send diffs of their own mask on a ~10Hz throttle; server owns canonical masks and rebroadcasts only the thin seam strip to adjacent players (not full regions — that preserves blindness AND cuts bandwidth). The genuinely hard part is the *pull*: compositing four masks into one crisp, deterministic print with consistent texture, ordering, and anti-aliasing so it looks intentional rather than like a merged doodle. Do the final render server-side (or on host) from canonical masks so every device sees an identical keepsake.

## v1 scope
- One room, one theme, exactly 4 fixed quadrants.
- 3-minute carve, one pull, one ink color.
- Carve = drag-to-erase only; no brushes, no undo.
- Keepsake = host-screen PNG the group screenshots.

## Out of scope
- Variable player counts / dynamic region layout.
- Multi-color layered prints, brush tools, replay of the carve.
- Saving a gallery, accounts, printing to real paper.

## Risks & unknowns
- Blind carving may produce mush, not beauty — mitigate with the seam sliver and a strong subtractive aesthetic that flatters roughness.
- Touch-carving precision on small phones.
- Bandwidth of mask diffs at 5 players.

## Done means
Four phones join a room, each carves a private quadrant blind for 3 minutes, the host pulls one composite print, and all five devices display the same keepsake image that at least one playtest group voluntarily screenshots.
