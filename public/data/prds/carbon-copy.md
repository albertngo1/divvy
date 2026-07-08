## Overview
Carbon Copy is a cooperative drawing-convergence game for 3–6 people in a room with a shared TV/laptop (host) and everyone's phone as a private canvas. There is no talking. The room's job: independently draw the *same* freeform shape — with the catch that there is no correct answer, so the shape itself must be silently invented by the group.

## Problem
Most 'draw it' party games are about a known answer (a house, a cat) judged by a guesser. The itch here is purer: can a room converge on an *arbitrary* shared form using only a faint collective signal? It's Schelling-point coordination made tactile, and it only works if every hand draws at the same time.

## How it works
The host shows a neutral prompt ('draw one continuous squiggle') and a countdown. Each phone PRIVATELY shows a blank canvas; every player draws a single unbroken stroke, blind to everyone else. On submit, the server resamples each stroke to N points and normalizes translation and scale (NOT rotation — orientation must match too, which is where the comedy lives).

The host then reveals only ONE thing: a translucent 'ghost' — the point-wise *average* stroke of the whole room — pulsing over a room-convergence score (mean pairwise stroke distance → 0–100%). No individual drawings are ever shown. Each phone privately shows the player only their OWN last stroke faintly, as a starting tracing layer. Players redraw, nudging toward the emergent ghost. Over 3–4 blind rounds the average sharpens, everyone copies toward it, and the squiggles collapse into one agreed form — or split into two stubborn factions, which the diverging ghost reveals as a blur.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{roundId, phase, players[]}`, `Stroke{playerId, roundId, points:[{x,y}] resampled to 64}`. Phones capture pointer events, resample locally, send one array per round. Server normalizes (centroid-subtract, scale to unit RMS), computes the average stroke and pairwise distances, broadcasts `{ghost:[64 pts], score}` to the host only. Sync strategy is round-based, not continuous, so latency is a non-issue — the hard part is the *similarity metric feeling fair*: choosing point-alignment (fixed start point vs. best-rotation Procrustes), and whether to reward orientation. v1 fixes the stroke start as point 0 and does no rotation alignment, keeping it strict and funny.

## v1 scope
- 3 players, one prompt, exactly 3 blind rounds.
- Single continuous stroke only; no colors, no lift-pen.
- Host shows ghost + one score number; phones show private canvas + own faint prior stroke.
- Win screen: final overlaid ghost and peak convergence %.

## Out of scope
- Multi-stroke drawings, undo, palettes.
- Rotation-invariant matching, per-player 'you're the outlier' hints.
- Scoring leaderboards across rounds.

## Risks & unknowns
- Does an *arbitrary* shared shape actually emerge, or does the average just muddy into a blob? Needs playtest tuning of round count and normalization.
- Small phones make careful strokes hard — reticle size and canvas margins matter.
- The ghost could over-guide, killing tension; may need to show it only every other round.

## Done means
Three phones on a LAN each draw privately for three rounds; the host displays a live averaged ghost and a convergence score that provably rises when strokes agree, and the end screen reports peak %.
