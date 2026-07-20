## Overview
Remote Hands is a 3–4 player cooperative panic-comedy set in a failing datacenter. Every player is simultaneously an on-call engineer who can SEE a system's target and a remote-hands tech whose fingers are on a DIFFERENT system's controls — but never the same one. It's for groups who loved Spaceteam's 'set the Zorf to 4' but want the reader and the actor to be two different, mutually blind people.

## Problem
Most Spaceteam-likes let one phone both see an instruction and act on a control elsewhere; the voice is a nice-to-have relay, not a hard requirement. The itch: build a game where NO single phone can ever close a loop alone, so speech is the only wire in the building.

## How it works
The shared host screen (TV) shows a rack of 3 systems, each with a single red/green status light, a global STABILITY bar, and a countdown. It shows **no numbers and no targets** — only pass/fail.

Each phone PRIVATELY shows exactly two things:
1. **A gauge you can read but not touch:** e.g. `COOLANT — reading 3, TARGET 7`. There is no coolant control on your screen.
2. **A control you can touch but not read:** e.g. an `AIRFLOW` dial (0–9) whose effect you cannot see — no airflow gauge exists on your phone.

The wiring is a derangement (no fixed points): your coolant target is satisfied only by whoever holds the coolant dial; your airflow dial satisfies whoever holds the airflow gauge. So the room erupts: "Coolant wants SEVEN — who's got coolant?" "Me, cranking to seven." "Green!" All three systems must read green **simultaneously and hold for 3 seconds** before the timer expires.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `systems[i] = { name, controlHolder, gaugeHolder, value, target }`. A control change from a phone posts `{system, value}`; the server updates `value`, recomputes `value===target` per system, pushes the boolean-only view to the TV and the numeric reading to only that system's `gaugeHolder`. No phone ever receives both the control and gauge for the same system — enforced server-side. The 'all green + hold 3s' is a server timer that resets the instant any system drops out of tolerance. Latency isn't the hard part here; the hard part is **generating non-degenerate wiring graphs**: a derangement over systems that's solvable but not a trivial ring, plus targets spaced so a lucky blind twist doesn't accidentally solve it.

## v1 scope
- 3 players, exactly 3 systems, one round, one 90-second timer.
- Discrete dials 0–9; targets are integers.
- One fixed derangement layout, hand-authored.
- Win/lose screen only.

## Out of scope
- More systems, escalating rounds, cascading failures.
- Analog/continuous controls, noise, drift over time.
- Reconnection mid-round, spectators, scoring/leaderboards.

## Risks & unknowns
- Might be too easy with 3 systems once players learn the pattern; may need a 4th blind system or moving targets.
- Players could just read their whole screen aloud verbatim — mitigate by making targets change once mid-round so a single readout goes stale.
- 'Who has X?' can stall if names collide; keep system names phonetically distinct.

## Done means
Three phones join, each shows one readable gauge and one blind control with no overlap; adjusting a control updates only the correct remote gauge and the TV's boolean light; when all three lights hold green for 3 seconds the TV declares STABILIZED, and letting any drop resets the hold timer.
