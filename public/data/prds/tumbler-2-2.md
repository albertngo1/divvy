## Overview
A cooperative real-time coordination game for 3–5 people around a TV. It inverts Keep Talking and Nobody Explodes: instead of one bomb-holder and many manual-readers, **one player holds the whole mechanism** (the board) and each other player holds exactly **one coupled component** they can barely see. The hook is mechanical *coupling* — fixing your own dial breaks your neighbor's — so the lock can only be cracked by simultaneous, coordinated nudges, never a sequential checklist.

## Problem
Most "one person has the diagram" co-ops reduce to the diagram-holder dictating steps one at a time. That's a queue, not a room full of people acting together. The itch: force genuinely *simultaneous* action where independent optimization actively fails, so the fun is the whole room converging in real time.

## How it works
The host TV shows drama only: a sealed vault door, a rising "tension" bar, and a countdown — never the targets. The **Locksmith's** phone shows the mechanism privately: N tumblers as gauges, each with a live angle and a green **target band**, plus linkage arrows showing which dials are coupled.

Each other player is a **Tumbler**: their phone is one big draggable dial showing ONLY their own current angle as a number — no target, no neighbors, no board. The catch: dials are mechanically linked. When Tumbler #2 rotates by Δ, the *effective* positions of #1 and #3 shift by Δ/2 on the Locksmith's board. So the Locksmith watches everyone's true position drift as people help. Pure sequential guidance oscillates forever; the Locksmith must talk the group into small, simultaneous, offsetting adjustments until **every** tumbler sits in its band at the same instant for 2 continuous seconds — then the vault opens.

The Locksmith can speak freely but cannot touch dials; Tumblers can act freely but are blind to the goal and to each other. All the tension lives in that gap.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). State: `dials[{id, raw, effective, targetLo, targetHi}]`, `couplingMatrix`, `holdTimer`. Tumblers stream `raw` angle at ~20 Hz; server recomputes `effective` via the coupling matrix, checks the all-in-band predicate, and pushes each Tumbler ONLY their own `raw`, pushes the Locksmith all effectives + bands, pushes the host the tension bar. Genuinely hard part: real-time propagation of coupling so every client's view stays consistent under jitter, plus a stable all-in-band hold detector that doesn't false-trigger on a transient crossing. Server owns the coupling math; clients render optimistically.

## v1 scope
- 1 Locksmith + 2 Tumblers (3 dials, one held by the server as fixed reference).
- One fixed coupling matrix, one target set, 90s timer.
- Dial = drag gauge; win = 2s simultaneous in-band hold.
- Vault-open animation, retry button.

## Out of scope
- More tumblers, randomized couplings, difficulty tiers.
- Multiple lock "modules," scoring, leaderboards.
- Any non-dial component types.

## Risks & unknowns
- Coupling strength is the whole difficulty knob; too high = unwinnable, too low = trivial. Needs tuning.
- 20 Hz angle streams from several phones may need throttling/interpolation.
- Verifying the group *feels* the coupling rather than blaming lag.

## Done means
Three phones + a TV: each Tumbler's phone shows only its own angle, the Locksmith's phone shows all three vs their bands, dragging one dial visibly moves its neighbors on the Locksmith's screen, and holding all three in-band for 2 seconds opens the vault.
