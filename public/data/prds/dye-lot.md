## Overview
Dye Lot is a 3-player cooperative convergence game for a room with one TV/laptop host and everyone on their phone. A single prompt word appears; each player secretly mixes a color to match what they think everyone *else* will mix. The room wins when all three colors land in the same 'dye lot' — close enough that a fabric mill would call them one batch.

## Problem
Color is the ur-Schelling space: 'MIDNIGHT' or 'JEALOUSY' or 'RUST' each has an obvious hue almost everyone reaches for — but the moment you can see a neighbor's swatch, it's a copy, not a convergence. The itch is testing whether your gut color and your friends' guts are the same gut, blind.

## How it works
The host TV shows the prompt word (e.g. **PANIC**) big, plus a single 'Spread' gauge — a strap that tightens as the batch converges — and a live count of how many of the three have locked. It shows NO actual colors during play. Each phone PRIVATELY shows a hue ring + saturation/lightness pad and a large live preview swatch filling the screen; the player drags to mix, then hits LOCK. Crucially each phone shows only its own swatch — you can never see anyone else's, so the only path to victory is genuinely converging in your head. When all three lock, the server computes max pairwise perceptual distance (CIELAB ΔE). Under the threshold → win: the TV reveals all three swatches side by side dissolving into the averaged consensus color, auto-named ('Bruised Plum'). Over → the strap stays slack, one 30s re-mix round, then reveal-and-laugh.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { prompt, phase, threshold }`, `Player { id, labColor|null, locked }`. Phones stream throttled `{L,a,b}` on drag (10Hz); server converts to CIELAB, computes max pairwise ΔE, and broadcasts ONLY the scalar spread + lock count to the host — never per-player colors until the win/reveal event. The genuinely hard part is perceptual honesty across hardware: phone screens differ wildly in gamut and brightness, so 'the same color' visually may differ numerically. v1 sidesteps this by comparing the players' *chosen HSL coordinates* (device-independent input space), not rendered pixels — everyone mixes in the same abstract color model.

## v1 scope
- 3 players, exactly one prompt word, one round (+ one re-mix)
- HSL ring/pad input, single LOCK, ΔE threshold ~15
- Host shows only spread strap + lock count; reveal on win

## Out of scope
- Screen calibration / true cross-device color accuracy
- Scoring, streaks, multiple rounds, >3 players
- Named-palette dictionary beyond a tiny built-in list

## Risks & unknowns
- Is HSL-coordinate distance a good proxy for 'looks the same'? Needs playtest tuning of threshold.
- Some prompts have two equally-obvious hues (near-ties frustrate); curate the v1 word.
- Colorblind players — need a fallback naming reveal.

## Done means
Three phones join, one word shows, each privately mixes and locks unseen, the host reveals three swatches and one consensus color, and a genuinely-converged batch trips the win state while a scattered batch does not.
