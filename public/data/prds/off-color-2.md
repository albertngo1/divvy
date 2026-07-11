## Overview
A fast, wordless hidden-role game for 4-6 players. The TV shows a grid of colored tiles; the host names a color; everyone simultaneously and privately taps the tile they think matches — against a reference swatch only their own phone shows. One player's swatches are subtly miscalibrated, so they tap 'wrong' just often enough to be caught.

## Problem
Hidden-role games lean on talking, lying, and memory. The itch here is a purely PERCEPTUAL deception: the imposter isn't fooled by an argument, they're fooled by their own eyes. To them their taps are obviously correct; to the room they're the one person who keeps missing. It's the gaslight feeling of Off-Color made visceral and instant — no reading, no bluffing, just 'why does everyone think I'm colorblind?'

## How it works
The TV shows a shared 3x3 grid of distinct color tiles (labeled A-I, colors identical for all viewers). Each phone PRIVATELY shows the player's personal reference swatches: a small strip of named chips ('teal,' 'olive,' 'rust'...). The host TV announces one color name at a time — six prompts in quick succession. On each prompt, every player looks at their own swatch for that name, finds the matching TV tile, and taps its letter on their phone. All taps are simultaneous and private; the TV shows nothing until the sequence ends.

One phone (the imposter) has exactly ONE swatch hue-shifted toward a neighbor — their 'teal' is actually the group's green. So on the two prompts naming that color, they tap the adjacent tile; on the other four they match perfectly. After the sequence, the TV reveals an anonymized heatmap: for each prompt, how many players picked each tile, with outlier picks glowing. Players privately vote who the odd one out was; reveal.

The TV never shows any player's swatches or individual identity — only the aggregate heatmap.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room { grid: Color[9], prompts: string[], players: {id, swatches: Map<name,Color>, shiftedName?, taps: number[]} }`. Server picks a canonical name→color map, clones per phone, and on one phone nudges a single swatch by a fixed ΔE toward a grid neighbor. Sync is light: taps are one integer per prompt, buffered server-side and revealed only after the round to prevent copying. Genuinely hard part is perceptual calibration — the shift must be large enough that the imposter reliably mis-taps but small enough that they never notice their own swatch is off, AND robust across phone screens with wildly different color profiles (cheap fix: draw both swatches and tiles on-device so relative distances hold even if absolute color drifts).

## v1 scope
- 4 players, one round of six prompts.
- Fixed 9-tile grid, one hand-tuned shifted swatch on one phone.
- Simultaneous private taps → heatmap reveal → private vote.

## Out of scope
- Multiple rounds, difficulty scaling, scoring.
- Accessibility mode for actual colorblind players (needs separate design).
- Procedural palette generation.

## Risks & unknowns
- Screen color variance may create false outliers or mask the imposter.
- The shift may be too obvious (imposter notices) or too subtle (never mis-taps).
- Genuinely colorblind players break the premise.

## Done means
Four phones join, each sees private swatches, six prompts fire, the imposter's phone reliably produces mis-taps on its shifted color, the TV heatmap highlights outliers, and a private vote catches the imposter above chance across playtests.
