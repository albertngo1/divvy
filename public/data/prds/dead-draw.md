## Overview

Three waves, 3–5 players, about eight minutes. The TV shows a signal nobody can read. Each phone is a private, partial instrument pointed at that signal, and between waves you spend earned scrap on **overlay cards** that change what your instrument shows you. For groups who like Spaceteam-style co-op yelling but want the thing they're building to be *perception* instead of power.

## Problem

Deckbuilders are solitaire in a group's clothing — four people play four private games and compare scores. Their best idea, the one nobody has stolen for parties, is **deck bloat**: an engine that gets worse as it gets bigger, until thinning becomes the skill. That idea only lands if the clutter is something you personally suffer. On a phone, clutter is literal — overlays stack until you can't read your own screen.

## How it works

A wave is a 25-cell grid of glyphs (shape × color × size). The **host screen** paints a version of it that repaints every 120ms with permuted cell positions — globally correct statistics, per-cell nonsense. It is a decoy on purpose; walking up and squinting gets you nothing. The TV also shows the wave question in plain text ("how many glyphs are round AND blue?"), the scrap count, and the market row.

**Each phone, privately:** the same grid rendered through *that phone's* overlay stack, stable and legible. Starting overlays differ — one player has COLUMN SCOPE (5 cells, full detail), another has COLOR ONLY (25 cells, shapes stripped), another has PAIRS (adjacency, no identity). No phone can answer alone. Players talk. Any player types an answer; a second player must confirm it on their own phone before it locks.

Correct answers pay scrap. The market offers four overlay cards, one copy each — phones buy privately and **collisions fail**, both buyers refunded minus one scrap. Overlays apply as a pipeline in purchase order, so SHAPE ONLY after COLOR ONLY leaves you staring at a blank grid. That's bloat.

From wave 3 a **cull** is mandatory: every phone deletes one overlay, and culled cards drop into a public junk pile that raises the TV's noise for everyone. Thinning has a cost.

## Technical approach

PartyKit Durable Object per room. The server generates each wave from a seed and broadcasts `{seed, tick, question, gridSpec}` — never the answer, never a per-phone render. Each phone computes its own view locally from seed + its own `overlayStack`, so bandwidth is a few hundred bytes per wave and there is no way to snoop another player's view off the wire.

Data model: `Wave {seed, question, noiseLevel}`, `Player {id, overlayStack: OverlayId[], scrap}`, `Overlay {id, label, transform}`, `Market {offers[3], claims}`. Answer locking is a two-phase commit through the server (propose → confirm by a different playerId).

The hard part is frame agreement: every phone must be rendering the same tick, or two players describing "the top-left one" are describing different grids. Phones drive `requestAnimationFrame` off a server-time offset measured by ping/pong and snap to the authoritative tick on drift >80ms.

## v1 scope

- Fixed 4 players, exactly 3 waves, one room code
- One question type: count glyphs matching two attributes
- 6 overlay types, market row of 3, one forced cull before wave 3
- No failure state — score only
- Static 25-cell grids, no animation beyond the noise repaint

## Out of scope

Multiple question types, solo mode, persistent meta-progression, overlay art, difficulty curves, more than 5 players.

## Risks & unknowns

The overlay pipeline may read as arbitrary rather than strategic — players need to *predict* that a purchase will blind them, which means the six starting overlays must be legible in one sentence each. Verbal coordination tends to collapse into one loud player doing all the reasoning; the two-player confirm is the only mitigation in v1 and may not be enough. Flashing noise raises photosensitivity concerns: cap repaint at 8Hz and ship a reduced-motion mode before any public test.

## Done means

Four phones and a host tab. A wave runs where no single phone holds enough information to answer, the room answers correctly inside 45 seconds by talking, and at least one player buys an overlay that makes their own view worse and announces it out loud.
