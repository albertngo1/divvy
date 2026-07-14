## Overview
As-Built is a 3–5 player cooperative drawing game for a room full of people who all *think* they know a shared space (this apartment, the office kitchen, grandma's living room). The output is not a score — it's a single keepsake map that overlays how differently everyone remembers the same place.

## Problem
Everyone "knows" a familiar room, but nobody agrees where the couch actually is. There's a warm, funny itch in seeing collective memory laid on top of itself — the kind of thing you'd screenshot and put in the group chat. No existing party game captures *disagreement about a shared physical space* as an artifact.

## How it works
The host names one real place everyone present knows and starts a 90-second countdown. Each phone PRIVATELY shows a blank canvas with a fixed reference frame — a faint rectangle (the walls) and a single dot labeled "front door / you are here." From memory, each player finger-traces the floor plan and drops a handful of labeled landmark pins from a PRIVATE assigned list ("the couch," "the TV," "where the snacks were"). Nobody sees anyone else's canvas while drawing — that blindness and simultaneity is the whole point.

On submit, the host composites every trace at low opacity and scatters everyone's pins → a blurred "average room" where the couch exists in four contradictory places. It exports as a PNG: *"As-Built: [place], surveyed by N people who apparently don't live together."*

Each PHONE privately holds: its own canvas, its own landmark assignments, its own progress. The HOST screen shows only the timer, then the final overlay. There is no winner.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Cloudflare Durable Object per room, or Socket.IO over Tailscale Serve). Data model: `room{place, phase, players[]}`, and per player a final submission `{polylines: normalizedPoints[], pins: {label, x, y}[]}`. Sync strategy is deliberately cheap: no live stroke streaming — only the final normalized submission is sent, so bandwidth is trivial and there's no per-stroke race. The genuinely hard part is not realtime sync but coordinate normalization: phones differ in size and aspect ratio, so every canvas maps to a fixed 1000×1000 logical space (letterboxed) with the door-dot as a shared anchor, or the overlays won't align and the reveal turns to mush.

## v1 scope
- 3 players, one place, one round.
- 5 fixed landmark labels, distributed privately.
- Finger-draw polyline + pin drop; final-submit only.
- Host renders the overlaid composite and exports a PNG.

## Out of scope
- Live stroke streaming / watching others draw.
- Any scoring or "accuracy" metric.
- Multiple rounds, multiple places, native apps.

## Risks & unknowns
- Finger-drawing floor plans is fiddly — pins may carry more of the fun than the traces.
- If players don't know the place well, the overlay is noise; anchoring to the door and shared landmarks mitigates this.
- The composite could read as visual soup; opacity tuning and pin clustering are the key polish levers.

## Done means
Three phones draw the same room simultaneously and blind, the host composites all traces and pins into one overlaid map, and it exports as a shareable PNG keepsake.
