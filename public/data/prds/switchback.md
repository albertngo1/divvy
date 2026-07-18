## Overview
A real-time cooperative panic game for 3-4 players. One player is the **Guide**, whose phone is the map: a scrolling mountain switchback trail with real-time rockfalls. The other 2-3 players are **Climbers** — dots ascending a blank dark slope on the host TV, unable to see the trail or the hazards. The Guide has one pair of hands and three lives to shepherd.

## Problem
'One player sees the map' games usually give the map-holder infinite bandwidth (they just talk). The itch here is a map-holder whose attention is physically rationed — you can see everyone about to die and can only touch one of them.

## How it works
- **Guide's phone (PRIVATE):** the full trail scrolling downward — a winding safe path plus rocks and gaps that appear live. The Guide taps a Climber to *select* it, then swipes to set that Climber's heading. Only ONE Climber is selected at a time; deselected Climbers keep walking their last heading forever.
- **Climber's phone (PRIVATE):** a big status face showing only their current heading arrow and one word from the Guide's last nudge (LEFT / RIGHT / **BRACE**), plus a haptic buzz. One button: **Brace** — stops the Climber and shields them from the next rockfall, but costs precious time.
- **Host TV (SHARED):** the dots climbing a featureless slope, a 75-second timer, and a summit line. No trail, no hazards, ever.
- Climbers auto-walk in their heading. Rockfalls sweep across; an un-braced Climber hit is knocked out. The Guide must constantly re-task — steer one back onto the path while yelling 'THREE, BRACE!' and hoping Climber three trusts the buzz.
- **Win:** get at least 2 of 3 Climbers to the summit before time runs out.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object) over Tailscale Serve. Data model: `room{trail_seed, tick}`, `climber{id, x, y, heading, braced, alive}`, `guide{selected_id}`. Server runs the 20Hz physics tick (climber advance, rockfall collision) as source of truth; Guide's phone renders the trail from `trail_seed`+`tick` deterministically so only it sees hazards. Guide inputs are heading-set events; Climber inputs are brace toggles. TV subscribes to positions only. Hard part: sub-150ms responsiveness so a BRACE warning arrives before the rock — nudges are pushed as top-priority messages, and the sim is server-authoritative to keep the map honest.

## v1 scope
- Exactly 1 Guide + 2 Climbers (3 players).
- One 75s trail, one rockfall pattern.
- Three nudges only: left, right, brace.
- Win/lose card, no scoring depth.

## Out of scope
- More than 3 climbers, multiple rounds, difficulty tiers.
- Guide voice channel beyond the room's own voices.
- Persistent stats.

## Risks & unknowns
- Guide bandwidth may feel unfair with 3 climbers — tune walk speed / rockfall density.
- Trusting a one-word BRACE buzz is the whole tension; if Climbers ignore it, it collapses. Needs a punishing first rockfall to teach trust.

## Done means
3 phones join, the Guide sees a trail neither the TV nor the Climbers can, steering one Climber at a time; a Climber who braces on cue survives a rockfall that kills an un-braced one; reaching the summit line with 2 of 3 shows a win screen.
