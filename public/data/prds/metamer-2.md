## Overview
Metamer is a 3–5 player hidden-role perception game. Everyone privately judges the *same* grid of color swatches on their own phone and the room must reach a unanimous verdict about it — but one phone's palette has been subtly corrupted, so its owner honestly sees a different answer. A metamer is a pair of colors that look identical under one light and diverge under another; that's the whole game. For friends who like Wavelength-style argue-about-perception energy but want a traitor buried inside it.

## Problem
Most social deduction hands the imposter a *secret they're keeping*. That makes lying an act of will, and skilled liars dominate. Metamer removes the will: the imposter isn't withholding anything, they're sincerely reporting a view that's been bent. The delicious part is that they often don't KNOW their view is the bent one — so paranoia is symmetric and the game stops rewarding pure poker face.

## How it works
The host TV shows only a prompt: **"Agree on the single WARMEST swatch."** Each phone PRIVATELY renders a 3×3 grid of swatches labeled A–I. Four phones render an identical grid; the fifth (server-chosen imposter) renders the same grid with two swatches' hues rotated ~25° — just enough to flip which reads as warmest (say F for most, C for the imposter).

Players discuss OUT LOUD by label — "F, obviously" / "no way, C is warmer" — and must lock a unanimous choice on their phones. When the split surfaces, suspicion starts, but crucially no one can see anyone else's screen, so you can't tell if you're the odd one out or the honest majority. After the group locks (or a 90s timer), every phone privately votes for the suspected imposter.

Three outcomes: **group wins** if they vote the imposter out; **imposter survives** if the plurality vote misses them; **imposter steals it** (bonus) if the group's unanimous swatch was actually their corrupted answer.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object over Tailscale Serve). Data model: `Round { seedSwatches: hex[9], imposterId, corruption: {index, deltaHue}[], locks: Map<playerId, label>, votes: Map }`. Server generates one canonical palette, derives the corrupted variant deterministically, and pushes each phone ONLY its own palette — the corrupted hexes never touch other clients. Sync is trivial (locks + votes are low-frequency); the genuinely hard part is **perceptual calibration across heterogeneous phone screens** — a real OLED-vs-LCD hue delta could swamp the designed 25° shift and randomly frame an innocent player. Mitigation: pick base colors in a mid-saturation band where devices agree best, and A/B the delta on real hardware before shipping.

## v1 scope
- Exactly 3 players, 1 round, 1 fixed prompt ("warmest").
- One hand-tuned palette + one hand-tuned corruption.
- Text discussion is verbal/in-room; app only handles locks + votes + reveal.
- Reveal screen shows both palettes side by side.

## Out of scope
- Multiple prompts, scoring across rounds, per-device color calibration, larger grids, more than one imposter.

## Risks & unknowns
- Screen variance (above) is the existential risk.
- Corruption might be too obvious (instant tell) or too subtle (nobody notices) — needs playtest tuning.
- Colorblind players are disadvantaged; needs a non-hue variant later.

## Done means
Three phones on three different handsets each show their assigned palette; the corrupted one visibly disagrees on "warmest"; the room can discuss, lock, vote, and the reveal correctly identifies whether the group caught the imposter — all without any phone ever seeing another's palette.
