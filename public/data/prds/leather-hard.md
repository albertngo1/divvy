## Overview
Leather Hard is a 3-player cooperative throwing session. The host screen is a potter's wheel; the pot exists *only* there. Each phone is one irreducible axis of the tool — nobody can throw alone, and nobody can see the whole job. There is no score. Ninety seconds later the room owns one lopsided vase with three names stamped on the foot.

## Problem
Collaborative party art usually means "everyone draws a panel, we staple them together." That's a collage, not a collaboration — the seams are visible and nobody had to *coordinate*. We want an artifact where you genuinely cannot tell whose hand did what, because all three hands were on it at the same instant.

## How it works
Roles are dealt at start and fixed:
- **Wheel** — a vertical slider sets RPM (0–200). Private: a wobble meter that only they can see. Clay won't move below ~40 RPM; above ~150 with heavy pressure the wall thins and the pot begins to run out of true.
- **Height** — a vertical track sets where on the wall the tool touches (foot → rim). Private: a ruler with *their own* commission mark on it.
- **Pressure** — tilts the phone (`deviceorientation.beta`) to push outward or draw inward at whatever height Height is currently holding.

The wall radius at height h updates as `Δr = k · pressure · rpm · dt`. So the shape is a product of three people's continuous attention.

Privately, each phone also holds one **commission card**: "narrow neck," "wide foot," "as tall as you dare." They conflict. You never have to reveal yours, and there is no mechanism to prove it — the pot is the negotiation.

The host screen shows only the spinning lathe, a wobble ring, and a countdown. Phones show *no* pot — just their own control. Players must look up at the TV and shout: "UP a bit — no, less!"

If wobble stays red for 2s the pot flops. It still exports. Flops are funnier keepsakes.

## Technical approach
PartyKit Durable Object per room, authoritative at a 50ms fixed tick. State: `{profile: Float32Array(64), rpm, toolH, pressure, wobble, t}`. Phones send only their one float at ~20Hz (timestamped, last-write-wins per channel, 100ms jitter buffer); the server integrates and broadcasts a delta-compressed profile. Host renders with Three.js `LatheGeometry`; phones render a canvas control, no 3D.

Genuinely hard part: making the sim feel like clay under three different latencies. Tilt needs a complementary filter plus deadzone or the pot vibrates; the collapse predicate must be server-side and deterministic so the TV and the wobble meter never disagree; and the profile has to stay non-self-intersecting when Pressure pulls hard at a single height.

## v1 scope
- Exactly 3 players, fixed roles, one 90-second pot
- One clay color, no glaze, no undo, no restart flow
- Three hand-authored commission cards, revealed on the TV after the buzzer
- Export: PNG turntable frame + maker's mark (three names, date), QR to download

## Out of scope
- STL export, kiln/glaze phase, handles or spouts, more than 3 players, gallery of past pots, spectator mode

## Risks & unknowns
- Tilt-as-pressure may read as mushy; may need a two-finger drag fallback
- 90s could be too short to reach a shape anyone wants to keep
- iOS requires a tap-gated motion permission prompt — must be in the join flow

## Done means
Three phones join by QR, each drives a distinct axis, the TV pot visibly responds to all three within 150ms, a red-wobble flop ends the round deterministically, and the buzzer produces a downloadable stamped PNG that all three players can scan and save.
