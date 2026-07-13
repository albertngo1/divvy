## Overview
Rations is a 3–6 player party game about silent shared priorities. The TV shows a topic and an empty pie; each phone is a private budget of points to split across labeled slices. With no talking, the room tries to divide the pot the *same* way — proving you value things alike.

## Problem
"Did we all weigh this the same?" is social gold, but the moment someone says a number out loud, everyone anchors to it and the honest read collapses. You need simultaneous, private allocation — impossible to fake, impossible to copy — which is exactly what per-phone controllers give you.

## How it works
The host shows a topic: *"Split 12 points across: Sleep · Money · Friends · Fame."* Each phone privately shows steppers/dividers to allocate exactly 12 points over the 4 slices, with a live running total that must equal 12 to arm the lock, plus a 30-second timer. You see only your own split — never another player's, never even a hint.

On lock, the server computes each slice's dispersion across the room. The host shows only a row of **cohesion meters** — one bar per slice, green when the room clustered on that slice, red when it scattered — but never the actual numbers or who chose what. The room wins if *every* slice's dispersion is under threshold (true consensus). Then the reveal drops: the averaged pie plus each player's overlay, for the inevitable laugh at whoever dumped everything into Fame.

**Private (phone):** your sliders + running total. **Shared (host):** anonymized cohesion bars during scoring, then the overlay reveal.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Objects or Socket.IO over Tailscale Serve). Model: `Room{topic, slices[], target:12, phase}`, `Player{id, alloc:int[nSlices], locked}`. A single commit per round — the server validates `sum(alloc)==target`, then computes per-slice standard deviation. No real-time streaming, so latency isn't the hard part. The hard part is a cohesion metric that *feels fair*: normalize each slice's stddev by the maximum possible given the target and slice count, then map to color; and topic/constraint design that prevents the degenerate "everyone dumps all 12 into one slice" trivial win (e.g., cap per-slice max, or curate topics that naturally spread opinion).

## v1 scope
- 3 players, one topic, 4 slices, 12 points
- Single round: private allocate → lock → 4 cohesion bars → reveal overlays
- One win/lose threshold
- Join by code; no accounts, no persistence

## Out of scope
- Multiple rounds or cross-round scoring
- Custom/user-authored topics, weighted or fractional points
- Fancy animation beyond a basic reveal

## Risks & unknowns
Degenerate all-in-one-slice strategies could trivialize wins; topic design is load-bearing and hard. Unclear whether blind splitting is delightful or frustrating without any feedback until lock. Threshold tuning across player counts is untested.

## Done means
Three phones each privately allocate 12 points across 4 slices and lock, the host displays four cohesion bars without ever revealing a number or an author, a win/lose fires on the dispersion threshold, and the reveal overlays all three pies — with no allocation visible to anyone before lock.
