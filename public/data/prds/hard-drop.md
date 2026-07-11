## Overview
A co-op falling-block puzzle (a stolen Tetris) for 3-4 players. One shared well lives on the host TV; each player's phone is a private cockpit steering a single active piece into their assigned vertical band of that well. Clearing a line needs the full width, so the seams between bands are where cooperation is forced. For groups who love Tetris flow but hate passing one phone around.

## Problem
Tetris is a solitary trance — great alone, dead as a party game. "Co-op Tetris" usually just clones the same board to everyone and collapses into people shouting over one cursor. The itch: a genuinely shared board where each player has private, simultaneous agency, and the fun is negotiating the seam between your stack and your neighbor's without being able to see their next piece.

## How it works
The well is 12 columns wide, split into bands (4 columns each for 3 players). Pieces spawn continuously; your active piece falls mostly within your band but can slide one column across the seam. Your phone PRIVATELY shows: your active piece, your next-piece queue, tap controls (left / right / rotate / soft-drop / hard-drop), and a zoomed slice of just your band plus one overflow column into the neighbor. The host TV shows the FULL well — every active piece, the whole stack, and the score. A row clears only when all 12 cells across every band fill the same line, so players must verbally coordinate heights at the seams. The private next-piece is the crux: you know a flat I-piece is coming to plug your neighbor's gap and they don't, so you talk. Topping out ends the round.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object). Server owns the single truth: `well: cell[12][20]`, `activePieces:{playerId,shape,rot,x,y}[]`, `queues:{playerId:shape[]}`, a fixed gravity tick (~500ms). It applies player inputs between ticks with collision against the shared well AND other players' active pieces, resolves locks and line clears authoritatively, and broadcasts deltas. Phones render only their filtered band slice; the host renders the whole well. Hard part: real-time collision of multiple simultaneously-falling pieces on ONE grid, plus input feel — your rotate must be instant locally but reconcile to server truth. Use client-side prediction of your own piece + server reconciliation (snap on conflict); keep the tick authoritative so two pieces never claim one cell.

## v1 scope
- 3 players, one shared well, one round to top-out.
- Only 4 shapes (O, I, L, S) to bound the collision cases.
- Tap buttons only, private next-1 preview.
- Score = lines cleared; no garbage.

## Out of scope
- Tilt controls, 4th player, garbage/attacks, T-spins, hold slot, music.

## Risks & unknowns
- Two pieces racing for the same seam cell need deterministic tick ordering.
- Input lag could make cross-seam plugs feel unfair.
- Whether verbal coordination reads as fun teamwork or frustrating chaos.

## Done means
Three phones each steer an independent piece into one TV well in real time, a full-width line spanning all three bands clears, and no two pieces ever occupy the same cell across 20 minutes of play.
