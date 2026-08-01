## Overview
Swatch Book turns four camera rolls into one printable color poster without a single photo leaving a phone. Each player gets a *different* secret prompt, picks a photo that answers it, and the phone reduces that photo to five colors locally. The TV assembles the swatches into a shared artifact. The keepsake is the poster; the game is the tension between wanting credit and staying unreadable.

## Problem
End-of-year photo rituals require handing over your camera roll — which nobody actually wants to do, because the interesting photos are the private ones. "Show the group a picture" is a permission request disguised as a game. Meanwhile every group-memory app produces the same scrolling grid nobody prints.

## How it works
1. **Deal.** Each phone privately shows one prompt from a disjoint set — "the worst photo you took this year", "a photo with a stranger in it", "something you photographed and never showed anyone", "a photo from this month." No player sees any other prompt. The TV shows only "4 prompts dealt."
2. **Pick.** Phone opens the native picker. The image decodes to an offscreen canvas, downsamples to 32×32, and runs 5-means in OKLab. Before sending, the phone displays the literal outgoing payload — five hex values, five weights, one aspect ratio — with a byte counter. That trust affordance is the point.
3. **Compose.** The TV grows the poster tile by tile as each swatch lands: soft radial color fields, weights driving area, aspect driving tile shape.
4. **Read.** The TV reveals all four prompts, shuffled and unattributed, beside the finished poster. Each phone privately guesses which tile answers which prompt and submits. No score is shown — the host only announces how many of the four mappings the room collectively got right.
5. **Unmask (optional).** Each phone gets one UNMASK button. Pressing it puts your name on your tile and prompts you to tell the story aloud. Nobody has to press it. The poster downloads either way.

## Technical approach
Host tab + phone PWAs + one Durable Object per room. Model: `Room {phase, prompts[], tiles: {playerId, colors[5], weights[5], aspect}[], guesses{}, unmasked: Set}`. Payload per player is under 200 bytes, so sync is trivial broadcast-on-change with a monotonic version counter; the host is a pure render of DO state.

The hard part isn't sync — it's making five flat colors read as evocative rather than as mud. Naïve k-means in sRGB averages a sunset into brown. v1 clusters in OKLab, drops the two lowest-weight centroids if their ΔE is under threshold, and boosts chroma slightly on render. Second hard part: iOS Safari heap limits on decoding a 48MP HEIC in a PWA — decode via `createImageBitmap` with `resizeWidth: 64` so the full bitmap never materializes.

## v1 scope
- Exactly 4 players, one round, four hardcoded prompts.
- One photo each, five colors, one poster.
- One collective guess tally, one optional unmask per player.
- Poster exports as a 2000px PNG downloadable from the host tab.

## Out of scope
Multiple rounds, custom prompts, printing/shipping, per-player scoring, any server-side image handling, accounts, more than four tiles.

## Risks & unknowns
Five colors may not carry enough signal for the guess phase to be satisfying — it could feel arbitrary. Players may not believe the no-upload claim without seeing devtools. Poster aesthetics could land as generic gradient wallpaper.

## Done means
Four phones each submit a swatch; the browser network tab shows zero image bytes uploaded; the poster renders within 2s of the last submit; a phone can download the PNG; and the prompts appear on the finished artifact unattributed unless a player chose to unmask.
