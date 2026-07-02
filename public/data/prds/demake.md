## Overview
A daily competitive pixel-art puzzle. Each day everyone gets the same prompt: a screenshot from a modern game (Cyberpunk, Valheim, Rocket League) that you must 'demake' into an 8×8 or 16×16 **1-bit** Game Boy tile grid. Your art is scored automatically against the source, and you're ranked on a global daily leaderboard. For pixel-art dabblers and people who like Wordle-shaped competition.

## Problem
People passively *consume* thousands of game screenshots and gorgeous concept art but never make anything. Drawing games (skribbl.io) are social and subjective; there's no crisp, single-player, skill-expressing daily where you can objectively beat a friend. And 1-bit constraint art is having a moment (see 1-bit emojis, gbdk-2020) but there's no arena for it.

## How it works
1. A date-seeded prompt shows the source image, downscaled and blurred to a hint thumbnail.
2. You paint on a tiny 1-bit grid with only black/white/toggle and a symmetry helper.
3. Submit → the app computes a similarity score between your grid (upscaled) and the source (downscaled to the same resolution, luminance-thresholded).
4. You see your score, percentile, and a side-by-side reveal; the leaderboard sorts the day's entries.
5. A gallery lets you browse and upvote the day's cleverest demakes.

## Technical approach
Pure client-side: Vanilla TS + Canvas, no backend needed for scoring. Scoring = MS-SSIM between your thresholded bitmap and the source luminance map at matched resolution, blended with an edge/gradient term (Sobel) so silhouette and composition matter more than exact pixels — otherwise everyone converges to 'fill 50% black.' Daily prompt = deterministic index into a curated image manifest keyed by date, so no server randomness. Leaderboards via a thin serverless function (Cloudflare Workers + KV) storing `{day, handle, score, gridRLE}`; grids are tiny (run-length-encoded 1-bit) so cheating is limited by re-scoring server-side. Hard part: designing the scoring blend so it feels *fair and gameable-in-a-good-way* — rewarding clever abstraction, not brute pixel-matching.

## v1 scope
- One fixed 16×16 1-bit grid
- ~30 pre-curated source images, one per day
- Local score + shareable emoji-grid result (Wordle-style)
- No accounts; leaderboard by nickname

## Out of scope
- Color palettes, larger canvases, custom prompts
- Anti-cheat beyond server re-scoring
- Head-to-head live matches

## Risks & unknowns
- Image copyright for source screenshots — may need CC/own-art prompts
- Whether SSIM correlates with what humans call a 'good demake'
- Retention past the novelty week

## Done means
A stranger can open the day's puzzle, paint a 16×16 grid, get a deterministic similarity score matching everyone else's for the same submission, and see themselves ranked on a shared daily leaderboard — start to share-card in under two minutes.
