## Overview
Zigzag is a daily browser puzzle: identify a hidden image that starts as coarse 8x8 JPEG blocks, using a scarce budget of DCT coefficients you allocate yourself. Fewer coefficients used = higher score. Riffs on the 'Regressive JPEGs' post by turning the guts of JPEG compression into the game mechanic.

## Problem
Reveal-the-image guessing games (blur-in, pixel-unzoom) are stale and passive—you just wait for quality to ramp. There's a more interesting game hiding in *how* JPEG actually reconstructs an image: coefficient by coefficient, in zigzag order, block by block. Making the player spend and place those coefficients turns a passive reveal into an active resource-allocation puzzle.

## How it works
- The target image is shown as its DC-only reconstruction: flat 8x8 color blocks.
- You have a daily budget of N AC coefficients. Each block reveals detail as it receives more coefficients, always in JPEG zigzag order (low → high frequency).
- You click a block (or drag a region) to spend one coefficient there; the block visibly sharpens.
- The strategy: spend on the informative regions (a face, a logo) rather than smearing the budget flat.
- Submit a guess anytime. Score = correct guess, weighted by coefficients unspent + speed. One puzzle a day, Wordle-style shareable emoji grid of where you spent.

## Technical approach
Stack: static site, vanilla TS + Canvas/WebGL—no backend needed for play. Precompute offline: run each daily image through a real JPEG forward DCT (per 8x8 block, quantized) and store the quantized coefficient array. Client reconstructs on the fly: maintain a per-block coefficient-count map; on spend, add the next zigzag coefficient, run inverse DCT for that block, blit to canvas. Data model: `{blocks: Int16Array[64] per block, revealed: Uint8 count per block, budget}`. Daily puzzle = a small JSON of quantized coefficients + accepted-answer strings, served statically; seed by date. Answer matching: normalized string + synonym list. Hard part: tuning budget and quantization so puzzles are winnable but not trivial, and picking images whose subject becomes recognizable from a *few* well-placed blocks.

## v1 scope
- One daily puzzle, fixed budget, click-to-spend on blocks.
- Real per-block inverse-DCT reveal in zigzag order.
- Text-guess box + shareable result grid.
- ~30 hand-picked seed images.

## Out of scope
- Accounts, global leaderboard backend (use localStorage + share).
- Chroma subsampling realism, color-space nuance.
- Multiplayer/live races.

## Risks & unknowns
- Difficulty tuning is fiddly—coefficient budget vs image legibility.
- Copyright of daily images; need public-domain/CC source (Wikimedia).
- Might feel too niche/technical for casual players.

## Done means
A player loads the day's puzzle, sees DC-only blocks, spends coefficients on the region they think matters, correctly names the subject, and gets a shareable grid showing coefficients used—with a fresh puzzle appearing at local midnight.
