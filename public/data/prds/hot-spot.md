## Overview

A silent, three-player cooperative search game. The TV shows a field of ~40 scattered dots. Each phone is a small movable window onto that *same* field, and nobody can see anyone else's window. The room wins when all three windows come to rest over the same single dot. For groups who want a 90-second, no-rules-explanation opener before the talky games.

## Problem

Convergence games almost always converge on a *word* — a category, a clue, a lie. Those collapse into vocabulary and shared references, and the same two people always win. There is no party game where the thing you're trying to match is a **place**, found by feel, with a feedback channel the players create by accident.

## How it works

1. Host TV shows the field: 40 dots at fixed positions, all dim gray. That's the entire shared screen.
2. Each phone shows a zoomed circular viewport containing maybe 8% of the field — your own dots, large, draggable. **Your phone never shows the whole field, never shows where you are in it, and never shows another player.**
3. As people drag, the server counts how many viewports contain each dot. The host — and only the host — renders that count: 1 = dim, 2 = amber glow, 3 = white bloom.
4. So the room's only language is heat on the TV. Amber somewhere means two people are already there. The deduction is the good part: if you slide off and the amber dies, you were one of the two — go back. If it survives, the other two are together and you are the odd one out — find them.
5. Win: one dot at count 3, held 2.5 continuous seconds. The TV blooms and freezes the field.

Private per phone: viewport position and its contents. Public on TV: coverage heat only, never a viewport outline. A single passed-around phone makes this game literally nothing.

## Technical approach

Host browser tab + phone PWAs + a PartyKit / Durable Object room over WebSocket.

- Data model: `Room { seed, dots: [{id, x, y}], players: { id, seat, cx, cy } }`, plus a server-owned `coverage: Uint8Array(40)`.
- Phones send `{cx, cy}` at 20 Hz, throttled, as 4-byte binary. Server recomputes coverage on each move and broadcasts the 40-byte array to the **host socket only**, at 15 Hz. Phone clients are never subscribed to that channel — enforced by per-socket projection, not by client-side hiding.
- Hard part: the control loop is finger → server → TV → eye → finger. Above roughly 200 ms of round-trip the search stops feeling steerable and becomes guessing. Also, dots on a viewport boundary strobe amber with jitter, so coverage transitions need ~150 ms hysteresis before they change color on screen.

## v1 scope

- Exactly 3 players, one field, one win.
- 40 static dots from a fixed seed. No drift.
- Drag-only viewport, fixed radius, no zoom.
- Three brightness states and a win bloom. No score, no timer, no rounds.
- Join by room code on a LAN.

## Out of scope

Drifting or spawning dots; 4+ players; asymmetric viewport sizes; multiple rounds or scoring; decoy heat; spectator view; audio.

## Risks & unknowns

- Tuning: too large a viewport and the room converges by accident in 10 seconds; too small and nobody ever sees amber. Radius needs playtest calibration against dot density.
- With 3 players, amber is ambiguous between three possible pairs — this is intended tension, but may read as noise instead of signal.
- Players will talk. Enforcement is social; the game must be fast enough that they don't want to.

## Done means

Three phones and a laptop on one LAN: all three drag independently, the TV shows amber at 2-cover and white at 2.5 s of 3-cover, and a win fires. Across 10 playtest attempts, ≥6 win inside 90 seconds with no talking. A WebSocket frame log confirms no phone socket ever received coverage data.
