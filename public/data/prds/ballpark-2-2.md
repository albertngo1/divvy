## Overview
A cooperative concurrent-room party game for 3+ players about *magnitude* consensus. Each player privately sets a value on a shared, labeled real-world scale in response to a fuzzy phrase, and the room wins when everyone's gut estimate clusters together. For groups who enjoy discovering that one friend thinks "a little bit" of hot sauce means half the bottle.

## Problem
Convergence games chase space, color, and timing — but rarely *magnitude*: the shared, wordless intuitions behind "a little," "warm," "reasonable," "soon." These fuzzy quantities are Schelling points sitting on a number line, and the gap between people's private interpretations is both invisible in normal life and hilarious once exposed.

## How it works
The host TV shows a fuzzy prompt bound to a labeled scale: e.g. "'a couple minutes' = how long?" on a 0–10 min bar; "'room temperature'" on a thermometer; "a 'reasonable' tip." Each phone shows a full-screen slider/dial with that same labeled scale — but with *no* indication of where anyone else sits. The player drags to their gut value and locks.

During play the host shows ONLY a "spread" gauge — an unsigned band representing max−min, tightening or loosening — plus a lock counter. It never shows any individual position, the average, or a direction.

On all-lock, the host drops all three markers onto the scale at once. Win if every value falls inside a tolerance band (e.g. within 8% of the scale).

**Private (phone):** your slider and *only your own* value. **Shared (host):** the spread gauge + lock count; individual values stay hidden until the simultaneous reveal. One phone passed around would let players see or anchor to each other's picks and take turns — the private, simultaneous commit is the whole game.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Objects / Socket.IO over Tailscale Serve). Model: `room {promptId, scaleMin, scaleMax, tolerance, players:{id, value, locked}}`. Sync is easy: phones send low-rate value updates; the server computes the spread and broadcasts *only that* aggregate, so the host physically cannot leak positions.

The hard part is not sync — it's content and feedback tuning. Prompts and tolerances must make convergence achievable but not trivial, and the spread gauge must guide players toward each other using magnitude only (unsigned), never revealing who is high or low. Getting that feedback to help without turning the game into a trivial binary-search is the core design problem.

## v1 scope
- 3 players, one prompt, one round
- Slider → lock → spread gauge → simultaneous reveal → win/lose
- Single hardcoded tolerance
- One deck of ~8 prompts

## Out of scope
- Multi-round / scoring / best-of-N
- 2D or categorical scales
- Per-player calibration, animated reveals, prompt authoring

## Risks & unknowns
- The spread gauge may leak too much — players could converge mechanically and feel like they cheated. Mitigations: coarse buckets, or freeze the gauge once someone locks.
- With no feedback at all it may feel purely random.
- Conceptually adjacent to numeric-dial games; the differentiator is the *semantic* scale and bidirectional one-shot estimate, not a mechanical crank. Must feel distinct in play.

## Done means
Three phones on the "a couple minutes" prompt: when all three lock within tolerance, the win screen shows three clustered markers; when they scatter, it loses. The host never displays any individual value before the reveal, and the spread gauge conveys magnitude of disagreement only — never direction.
