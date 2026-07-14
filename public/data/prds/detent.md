## Overview
A 3-5 player cooperative toy where the room co-drives a single evolving generative pattern on the host TV, but each player secretly controls exactly ONE hidden parameter of it. The win condition isn't points — it's collectively discovering your knobs, steering to a pattern everyone loves, and freezing it into a keepsake print.

## Problem
Collaborative-art games either give everyone the same brush (chaos) or a private tile (isolation). Nobody has done the delightful confusion of "wait, is that ME doing that?" — controlling one dimension of a shared system without being told which, so the group has to talk, experiment, and converge by feel.

## How it works
The host TV renders one live kaleidoscopic/symmetry pattern built from N layered parameters: hue rotation, radial symmetry count, spin speed, line density, warp amount, etc. Each connected phone is silently assigned ONE parameter.

PRIVATELY, each phone shows only a single unlabeled control — a big draggable dial/slider and a "feel" readout (how much you've moved) — with NO name for what it does. You wiggle and watch the TV to deduce your knob ("the colors shift when I drag!"). The shared TV is the ONLY place the composite pattern appears; no phone shows the whole thing.

The loop: everyone experiments, narrates discoveries aloud, then cooperates to sculpt a pattern the room likes. Any phone can raise a "FREEZE?" flag; when all phones tap-confirm, the current frame locks. The host exports a high-res print (PNG/GIF) — the keepsake — annotated with each player's "signature knob" as a tiny credit. No score, no timer pressure beyond a soft 4-minute cap.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Room{params[{id, ownerId, value}], freezeFlags{}, phase}. Phones send continuous {paramId, value} deltas at ~20Hz; server clamps, holds authoritative param state, and broadcasts the full vector to the HOST only (phones get just their own value back, keeping the mapping hidden). Host runs the WebGL/Canvas shader deterministically from the param vector so the render matches the frozen values exactly. Hard part: smooth real-time sync of several continuous controllers at interactive latency without jitter (interpolate on the host, rate-limit inbound), and a freeze that captures a consistent frame across all params atomically.

## v1 scope
- 3 players, 3 parameters (hue, symmetry count, spin), one session
- Canvas 2D kaleidoscope, no fancy shaders
- Hidden assignment, wiggle-to-discover, unanimous freeze, PNG export
- Signature-knob credits on the exported image

## Out of scope
- >5 params, audio-reactive layers, multiple canvases
- Rounds/scoring, saving a gallery, animated GIF export
- Reassigning or swapping knobs mid-session

## Risks & unknowns
- Blind-mapping may frustrate more than delight if a knob's effect is too subtle — parameters must be visually distinct.
- Continuous-control jitter over flaky wifi.
- "Agree to freeze" could stall; may need a soft nudge.

## Done means
Three phones each drag one unlabeled dial, the TV kaleidoscope responds live to all three, players verbally figure out their knobs, all tap FREEZE, and a keepsake PNG with per-player knob credits downloads.
