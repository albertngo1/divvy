## Overview

A silent cooperative joint-attention game for 3–6 people in one room. The TV runs a live scene — a park with a dozen animated creatures wandering, landing, hopping. Every player's phone is a private viewport: a magnified crop of that same scene that only they can pan. The room wins by having every phone's crop contain the *same* creature at the same moment, for a sustained beat. Nobody may speak, point, or gesture.

## Problem

Party games about agreement are almost always turn-based and verbal: write a clue, read a clue, vote. Real joint attention — the thing two birdwatchers do when one whispers "are you on it?" — is continuous, spatial, and wordless, and no party game models it. It's also the one form of convergence that's genuinely hard: the target is *moving*, so agreeing once isn't enough. You have to agree and then stay agreed.

## How it works

**Host screen (shared):** the full park, all creatures, no player cursors, no viewport boxes — nothing that reveals where anyone is looking. Its only feedback is emergent: a creature glows faintly brighter for each extra viewport currently containing it. Two players converged = a dim shimmer. Everyone converged = the creature blazes and a lock timer starts. A 90-second countdown bar sits at the bottom.

**Phone (private):** a ~15% crop of the scene, panned by dragging. No minimap, no coordinates, no glow — the shimmer is *only* on the TV, so you must keep glancing up and inferring. Crucially, each phone gets a private colour filter (one player sees the scene desaturated, one sees only high-contrast edges, one sees it normally), so the "obviously weird sprite" is not obviously weird to everybody. That's the bootstrapping problem the room has to solve without talking: you must pick a target that reads as salient through someone else's eyes.

Win condition: all N viewports contain the same creature for 2.0 continuous seconds. Then a shared 20-second breather, and one harder scene.

## Technical approach

Host tab + phone PWAs, authoritative server on PartyKit/Durable Objects.

- **Sim:** server runs the creature flock at 20Hz (simple boids + perch states), broadcasting `{tick, [id, x, y, state]}` deltas. Phones and host both interpolate to a common `serverTime`.
- **Clock sync:** NTP-style — each client pings 5×, keeps the min-RTT offset, re-syncs every 10s. Without this, one phone's crop is 200ms stale and the "same bird" check fires on a bird that already flew.
- **Data model:** `Room{code, phase, sceneSeed, players[{id, filter, viewport{x,y,w,h}}]}`. Phones send `viewport` at 10Hz, coalesced; the server computes containment per creature per tick and emits a single `overlapCounts` map to the host only.
- **Hard part:** containment must be judged on *server* positions, not each phone's interpolated ones, or lag decides the winner. Also glow must be smoothed (EMA over ~300ms) so a bird crossing a viewport edge doesn't strobe the TV.

## v1 scope

- One scene, one 90-second round, 3–4 players.
- 12 creatures, 3 sprite types, boids-lite motion.
- Two filters only: normal and desaturated.
- Win = all viewports on one creature for 2s. Lose = timer expires.
- Room code join, no accounts, no scoring history.

## Out of scope

Multiple rounds, difficulty curve, per-player scoring, spectators, moving-camera scenes, audio, phone-tilt panning, remote play.

## Risks & unknowns

- Players may cheat by pointing or leaning; needs a stated house rule, not enforcement.
- The glow may be too subtle to bootstrap from, or so strong it becomes a beacon that trivialises convergence — this single curve is the whole balance problem.
- 6 phones × 10Hz viewport updates is trivial bandwidth, but 6 phones rendering a 20Hz interpolated scene on old Androids may drop frames.

## Done means

Four phones join by room code; the TV shows one park; each phone pans an independent crop; when all four crops contain creature #7 for two seconds, the TV flashes a win and the server log confirms the lock was computed from server-side positions, with measured clock offsets under 30ms on all four devices.
