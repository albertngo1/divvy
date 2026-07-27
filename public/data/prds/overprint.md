## Overview

A 45-second simultaneous drawing game for 3–5 people in one room, with a TV and a phone each. Every player is one plate in a screenprint, laying ink onto the same sheet at the same time. Nobody takes turns. The canvas is the scarce resource, and overlapping ink destroys itself.

## Problem

Shared-canvas party games (Drawful, skribbl, Gartic) are polite and serial: one artist, everyone else watches. The canvas is infinite and free. Nobody has made *space on the paper* the thing you fight over, and nobody has made drawing feel like elbowing.

## How it works

One round, 45 seconds, all players drawing at once.

**Private, on each phone:** a blank white canvas showing *only your own strokes*; your prompt ("draw a whale"); an ink-length budget; and your private area quota — you must end the round owning at least 700 clean cells of the 4096-cell grid. You never see another player's ink on your own device.

**Public, on the TV:** the live composite, rendered in one flat black ink with zero attribution. You can see the sheet filling up, you can see it getting crowded, but you cannot tell which black marks are yours — and the longer you draw, the less sure you are.

Any grid cell touched by two different players becomes **mud**: permanently dead, subtracted from both, absorbing (nobody can ever reclaim it), and rendered on the TV as a spreading blot with a wet squelch. Reveal at the buzzer recolors the composite by owner, mud in black, and shows who hit quota.

## Technical approach

PartyKit Durable Object per room. Canvas state is a 64×64 grid, each cell `null | playerId | MUD`. Phones capture `pointermove`, downsample to ~20 Hz, and send normalized segments `{x0,y0,x1,y1}`. The server rasterizes with Bresenham plus a 1-cell brush; first writer owns a cell, a second *distinct* owner flips it to MUD forever.

That rule quietly kills the hard part of every collision game: because any second entrant produces mud regardless of order, concurrent entrants need no timestamp arbitration, so variable phone latency cannot change the outcome. The remaining hard part is *feel*: the phone must render your stroke instantly, but ownership is confirmed ~80 ms later. Solution — draw local strokes as hollow outline, fill solid on server confirm, and shudder them to mud on loss. Server broadcasts changed-cell deltas at 10 Hz to the host; each phone gets only its own echo plus its live clean-count.

## v1 scope

- Exactly 3 players, one round, 45 seconds
- 64×64 grid, 1-cell brush, no erase, no undo
- Flat 700-cell quota for everyone; 12 hardcoded prompts
- Host composite + mud blots + owner-colored reveal
- Room code, no accounts, no persistence

## Out of scope

Shape or AI judging of the drawing, multiple rounds, per-player ink colors, erasers, zoom/pan, spectators, 6+ players, replay export.

## Risks & unknowns

Grid resolution is the whole balance: too coarse and drawings are unreadable, too fine and nobody ever collides. Tablets get an unfair area advantage unless input is normalized to canvas aspect rather than device size. Players may abandon the prompt and scribble for raw area — the ink budget is the only brake and may not be enough. Mud could cascade so fast the round is decided in ten seconds.

## Done means

Three phones on one Wi-Fi, 45 seconds, the TV shows a single flat-black composite growing with audible mud blots, each phone shows only its own ink, the reveal attributes every cell correctly — and at least one playtest ends with a player missing quota purely because someone else reached the corner first.
