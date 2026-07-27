## Overview
Grid North is a 4-player cooperative maze puzzle for a couch and four phones. One player is the **Surveyor**, whose phone is the entire board. The other three are **Pieces**, whose phones show four arrows and nothing else. The catch: each Piece's arrows are secretly rotated, and the Surveyor sees the dots but not the names attached to them.

## Problem
Every blind-maze party game collapses into one loud person reading coordinates aloud while everyone else acts as a remote-control car. The guided players aren't playing; they're taking dictation. Grid North fixes this by making the map-holder's information *incomplete in a way only the pieces can repair* — she knows where the dots are, she just doesn't know whose they are.

## How it works
One hand-authored 6×6 maze with walls and a single exit tile. Three Pieces start on random cells.

**Piece phone (private):** a four-arrow D-pad, a turn counter, and a bump light. Each Piece is assigned a secret rotation r ∈ {0°, 90°, 180°, 270°}, fixed for the round. Pressing UP moves your dot r-rotated on the true map. If you move into a wall you don't move, and only *your* phone buzzes and flashes BUMP. You never see the maze, your position, or anyone else's press before you commit.

**Surveyor phone (private):** the full maze — walls, exit — and three persistent but *unlabeled* dots (a circle, a square, a triangle). She watches them move. She has no idea which shape is Bea.

**Host TV (public):** the press ledger. A growing table: turn number × player name × the arrow they pressed *in their own private frame*, plus bump marks. Everyone can see Bea pressed UP on turn 2 and bumped. Only the Surveyor knows that UP carried something west.

**Turn loop:** a 10-second window; all three Pieces lock an arrow simultaneously and privately; the server resolves all three at once; TV appends the row; Surveyor narrates freely ("the triangle just slid two west and stopped dead"). Talking is unlimited — it *has* to be, because the round is a joint inference problem over three unknown rotations and one unknown identity assignment. Win: all three dots on the exit within 12 turns.

## Technical approach
PartyKit / Cloudflare Durable Object, one object per room, Socket.IO fallback over Tailscale Serve. Server-only state: `maze` (wall bitmask), `exit`, `rotations[playerId]`, `positions[playerId]`, `shapeAssignment` (shape → playerId, never sent to anyone). Three projections rendered from that single state: Surveyor gets `{maze, shapes:[{shape,cell}]}`; each Piece gets `{turn, bumped:boolean}`; the TV gets `{ledger:[{name, arrowPressed, bumped}]}`.

The hard part is not latency — the turn lock makes jitter irrelevant. It's **leak discipline and reconnection**. Piece clients must never receive maze bytes, rotations, or positions; one guest with devtools open would end the game. That means no client-side filtering anywhere, and a per-role serializer with a test asserting the Piece payload's key set. Reconnect: a Piece refreshing mid-round must resume with the same rotation, so a session token lives in localStorage and rebinds to the seat. Missing presses at window close auto-pass with a ledger mark.

## v1 scope
- Exactly 4 players: 1 Surveyor, 3 Pieces. No lobby beyond a 4-letter room code.
- One hand-drawn 6×6 maze, one exit, one round, 12 turns.
- Rotations drawn uniformly at random per Piece (0° allowed — the unrotated player is a great red herring).
- Win/lose screen. Rematch = refresh.

## Out of scope
Multiple mazes, procedural generation, hazards, more than 3 Pieces, scoring or leaderboards, Surveyor annotation tools, spectators, sound, i18n.

## Risks & unknowns
The Surveyor seat may hog the fun — mitigated by the public ledger, which turns rotation-solving into a group sport the Pieces lead. A lucky group may solve all three rotations by turn 3 and then the endgame is just walking; the maze must be tuned so the final approach is a corridor where a wrong press costs two turns. Simultaneous locking may feel dead if one player is slow. Unknown whether 12 turns is generous or brutal.

## Done means
Four phones and a laptop on the TV; one honest round played end to end; the group wins or busts on turn 12; a Piece client's WebSocket frames contain no maze, position, or rotation data (verified in devtools); a Piece can refresh mid-round and keep their rotation and seat.
