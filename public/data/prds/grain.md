## Overview
Grain is a 3-5 player craft-and-hide game. The group co-weaves a single decorative tapestry (the keepsake), while each player privately tries to stay unidentifiable inside it. There's no scoreboard — the tapestry is the shared artifact, and 'staying anonymous' is your personal win.

## Problem
Anonymity party games almost always reduce to 'find the liar.' Grain inverts it: anonymity is *aesthetic*. Your itch is to express a distinctive personal style AND to disappear inside a collective object — two goals that actively fight each other. That tension is the game, and it only exists when everyone contributes simultaneously and privately.

## How it works
The host TV shows a growing textile border of blank tile slots. Over the round each phone privately designs its tiles in a constrained motif editor: a small symmetric tile frame, a shared limited palette (seeded per room), and a handful of stroke/shape tools — deliberately narrow so tiles look related, yet wide enough for personal style to leak. Each player makes 2 tiles.

Goal 1 (shared): a cohesive, beautiful tapestry. Goal 2 (secret): stay anonymous. When all tiles are in, the server places them at randomized, de-identified positions. Then each phone gets a private attribution ballot: for every tile, guess who made it. You survive ('un-pinned') if fewer than half the other players correctly attribute your tiles. Distinctive tiles beautify the keepsake but expose you; bland tiles hide you but dull the artifact.

Private vs shared: phone = your tile editor + your secret ballot; TV = the anonymized assembled tapestry (never who owns what) until the final pinned/un-pinned reveal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: `room { tiles: [{id, ownerId, motif: strokeOps[], pos}], ballots: {voterId → {tileId → guessId}} }`. Server hides `ownerId` from all clients until reveal and broadcasts only rendered motif data. Tiles are compact stroke JSON rendered by one shared canvas routine so phone and host draw identically. Hard parts: (1) anonymity leaks via metadata — submission order and timing must NOT map to tile position, so the server fully randomizes placement and reveal order; (2) tuning the motif toolkit so tiles are individually simple yet collectively coherent (guaranteed baseline cohesion via shared palette + symmetric frame); (3) framing attribution as un-pinned/pinned, not a point tally. Keepsake: assembled canvas → PNG.

## v1 scope
- 3 players (ideally 4-5), 2 tiles each
- One shared palette + constrained motif editor
- Anonymized assembly + one private attribution ballot
- Tapestry PNG export + pinned/un-pinned reveal

## Out of scope
- Larger grids, animation, palette selection
- Multiple rounds, numeric scoring beyond pinned/un-pinned
- Style-obfuscation aids

## Risks & unknowns
- With only 3 players styles may be too recognizable — real tension may need 4-5.
- The beauty-vs-hiding tension could collapse into everyone going bland; toolkit constraint tuning is the whole game.
- Metadata leaks (timing) are subtle and must be scrubbed carefully.

## Done means
Three phones each design 2 private tiles; the host assembles an anonymized tapestry PNG everyone can save; each phone submits an attribution ballot; the reveal marks every player as pinned or un-pinned.
