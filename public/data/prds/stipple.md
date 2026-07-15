## Overview
Stipple is a daily browser puzzle for the kind of person who read the 'how my images are dithered' post and immediately wanted to try. Everyone gets the same target image and must reproduce it using a constrained palette plus a dithering algorithm of their choice. Score is perceptual similarity vs. palette size — a golf game where restraint beats brute force.

## Problem
Dithering is a beloved craft technique people passively admire in blog posts and pixel art, then never touch. It's tactile and skill-based but has no competitive on-ramp. Meanwhile daily-puzzle formats (Wordle-style) are proven engines for a niche mechanic — but nobody has made one where the skill is *visual compression taste*.

## How it works
Each day a target photo drops. You pick a palette (choose N colors from a picker, or auto-extract via median-cut and tweak), select a dithering algorithm (Floyd–Steinberg, Atkinson, ordered/Bayer, blue-noise), and tune a couple knobs (serpentine, error strength). The canvas updates live. You submit your best. Score = perceptual similarity (higher is better) with a penalty per palette color, so a stunning 4-color render can beat a lazy 32-color one. A daily leaderboard ranks submissions; a Wordle-style emoji share encodes your palette size and score band.

## Technical approach
Stack: static site + Web Worker doing the dithering in a `<canvas>`; heavy pixel loops compiled to WASM (Rust/AssemblyScript) for real-time feedback. Similarity scored with DSSIM (structural dissimilarity) computed in-worker. **Anti-cheat is the crux:** you can't just upload the target. Submissions carry only the *recipe* — palette (hex list) + algorithm id + knob params — and the server deterministically re-renders and re-scores from the original image, so the leaderboard is reproducible and un-fakeable. Targets are public-domain/Unsplash photos pre-processed to a fixed resolution. Daily seed rotates a curated queue. Backend: a tiny Go/SQLite service storing recipes + scores; rendering/scoring runs server-side in the same WASM module for parity with the client preview.

## v1 scope
- One target image, not yet daily-rotating
- Two algorithms (Floyd–Steinberg, Bayer) + manual palette picker
- Live canvas preview with DSSIM readout
- Local leaderboard from recipe re-scoring, emoji share string

## Out of scope
- Accounts/auth (anon device id)
- User-uploaded target images
- Animated/GIF dithering

## Risks & unknowns
- DSSIM scoring may not match human 'this looks better' judgments
- Client/server render parity bugs → disputed scores
- Palette-size penalty weighting needs tuning to stay fun, not punishing

## Done means
On one shared target, two players submitting different palette+algorithm recipes get deterministic, reproducible scores from server-side re-rendering, the lower-color better-matching render ranks higher, and each gets a shareable emoji result string.
