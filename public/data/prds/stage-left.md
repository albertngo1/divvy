## Overview
A hidden-role navigation game for 3–5 players plus a host screen. Everyone holds the 'same' little map on their phone and cooperatively guides a marker to a goal by calling out directions. Secretly, one player's map is left-right mirrored. Nobody's told their own status. Find the mirrored player — or realize the confused one is you.

## Problem
Most imposter games alter *content* (a swapped word, a changed fact). Stage Left alters *orientation* — a global transform, not a local edit. The delicious part is deniability: everyone genuinely fumbles left vs. right sometimes, so the mirrored player has natural cover, and honest players second-guess their own hands. It's a hidden role built entirely out of handedness confusion.

## How it works
The map is a deliberately symmetric-looking grid of colored landmarks (a red house, a well, a blue barn) with player-neutral geometry so a mirror isn't visually obvious. A marker sits somewhere; a goal tile is the target. One random player's phone renders the map flipped horizontally.

**Private (each phone):** your own oriented map, the marker, the goal, and a framing line: *"One map here is mirrored. It might be yours."* You also hold a single-use 'nudge' button that, on your turn, proposes moving the marker one tile up/down/left/right.

**Shared (host TV):** shows ONLY the marker's true position on the canonical (un-mirrored) map and whether it reached the goal. It never shows any player's private view. Directions are given aloud; nudges resolve on the TV in canonical space.

Flow: players take turns speaking one instruction referencing landmarks and directions ("go left of the well, toward the barn") then optionally spend their nudge. Color and landmark references stay consistent across all maps; only handedness (left/right, east/west) diverges for the mirrored player, so only *some* of their statements betray them. After ~6 turns the group votes on one phone each; reveal flips the impostor's map back to show the mirror.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `Room{code, phase, marker:{x,y}, goal:{x,y}, turn}`, `Player{id, mirrored:bool, nudgeUsed, vote}`. The map is one shared JSON grid; each phone renders it, applying `scaleX(-1)` iff `mirrored`. Sync: server owns marker position in canonical coordinates; a mirrored player's nudge is transformed (x → width-1-x on the horizontal axis) before applying, so their 'left' really does push the true marker right — that transform IS the tell. Not latency-hard; the subtle part is the coordinate bookkeeping so mirrored input maps correctly and reveal math is exact.

## v1 scope
- 3 players, one map, one goal, one round.
- Static symmetric map from a tiny handmade set.
- Spoken directions (no transcription); one nudge per player per turn.
- One accusation vote each, then mirror reveal.

## Out of scope
- Multiple maps, rotation/other transforms, difficulty tiers.
- Cross-round scoring, more than one mirrored player.
- Any automated speech handling.

## Risks & unknowns
- Map must be symmetric enough to hide the mirror yet have enough left/right landmarks to force tells.
- Honest players' genuine L/R confusion is the fun but could make the vote pure coin-flip with only 3 players.
- Vertical/color references leak no info by design — need enough horizontal decisions per round.

## Done means
Three phones load the same grid with exactly one rendered mirrored, players call directions and spend nudges that move a single canonical marker on the TV, everyone votes, and the reveal correctly flips the mirrored map to expose the impostor — with a mirrored nudge verifiably moving the true marker the opposite way.
