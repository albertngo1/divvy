## Overview
Fathom is a cooperative reconstruction game for 4–6 players. One player is the Cartographer whose phone slowly BECOMES the group's shared map; everyone else is a Surveyor holding a private fragment of the true terrain that they must describe aloud but never show. It's for friend groups who love blind-drawing chaos but want a real spatial payoff at the end.

## Problem
Guide-the-blind party games hand one omniscient player all the thinking while everyone else waits for orders and zones out. The itch: give EVERY phone genuinely private, non-redundant information so nobody can coast, and make merging it the entire game rather than a side effect.

## How it works
The server generates a true 4×4 terrain map (water / wall / path / goal tiles) and shows it to NO ONE in full. Each Surveyor's phone PRIVATELY displays one overlapping 2×2 slice of it plus their own coordinate. They describe their slice aloud ("top-left is water, and the tile right of it is a wall"). The Cartographer's phone is an editable 4×4 tile-painter — this is the board, assembled live. The host TV mirrors the Cartographer's current guess as a big grid so the whole room watches the reconstruction drift and self-correct. Surveyors never see the assembled map; the Cartographer never sees a true slice. After 3 minutes a pawn auto-pathfinds start→goal across the Cartographer's reconstruction; the team scores on how many true tiles matched and whether a valid path existed.

Private vs shared: each Surveyor phone = one secret terrain slice + own position. Cartographer phone = the editable master board. Host screen = the Cartographer's in-progress reconstruction + timer + final truth-vs-guess overlay.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `room{code,phase,timer}`, `trueMap[16]` (server-only until reveal), `slices[surveyorId]→{origin,tiles[4]}`, `draft[16]` owned by the Cartographer, `pawnPath`. Sync: the Cartographer's tile edits are the only high-frequency stream — throttle to ~10Hz and broadcast `draft` diffs to the host ONLY (Surveyors must never receive it). Reveal is a single server-computed scoring event. The genuinely hard part isn't throughput (state is tiny) — it's slice generation: overlaps must be solvable-but-ambiguous so the room actually has to talk, and "mostly right" scoring must feel fair.

## v1 scope
- 1 round, 4×4 map, exactly 4 Surveyors + 1 Cartographer.
- 4 tile types; fixed 3-minute timer.
- Auto-pathfind + match-percentage score; single win/lose screen.
- Room-code join, no accounts.

## Out of scope
- Multiple rounds, bigger maps, rotating roles.
- Surveyors moving or acting as pawns themselves.
- Any art beyond four colored tiles.

## Risks & unknowns
- Overlap tuning: too much and one person solves it, too little and it's pure guessing.
- A verbal-only channel with 6 talkers may collapse into noise — feature or bug?
- Score legibility: does "73% match" actually feel rewarding?

## Done means
Four phones each show a distinct private slice, one phone paints a board the others never see, and at timer-end the host displays truth-vs-guess with a score — playtested to a genuine "we were SO close" groan.
