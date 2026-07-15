## Overview
Bad Seed is a pre-ship safety linter for procedural generation. Point it at your generator and a seed range; it renders across the seed space and flags seeds whose output produces an accidental hate symbol, a slur, or an obscene shape. For indie devs shipping procgen games, generative-art tools, and QR/dither pipelines.

## Problem
Procgen is a landmine. A fantasy name generator emits a real slur. Dungeon tiles align into a hooked cross. A dithered sprite reads as genitalia. A random banner looks like a hate flag. You find out from a furious screenshot on launch day. The `qr-swastika-avoider` crate solved this for exactly one output type — nobody sweeps the general case.

## How it works
You supply an adapter: `render(seed) -> PNG` and optional `text(seed) -> string[]`. Bad Seed batch-runs N seeds and: (a) template-matches rendered bitmaps against a curated symbol database at multiple rotations/mirrors/scales; (b) runs generated strings through a multilingual slur/profanity check with homoglyph and leetspeak normalization; (c) applies a heuristic 4-fold-rotational-symmetry + hooked-arm test for swastika-like grid alignments. Output is a ranked report: `seed 41923 -> likely swastika (0.82)`, `seed 5567 -> slur in name`. You blocklist or fix those seeds.

## Technical approach
CLI in Node (`sharp`) or Python (`Pillow`/`OpenCV`). Symbol bank from the ADL Hate Symbols database + Unicode confusables; multi-rotation/scale template match plus a tiny CNN trained to score 4-fold hooked symmetry on binarized images. Text: Aho-Corasick over merged multilingual slur lists with homoglyph folding. For large seed spaces, Sobol quasi-random sampling with a reported coverage %. The genuinely hard part is false positives — any plus sign is not a swastika — so it needs the symmetry+arm-angle test and honestly calibrated confidence, plus care around the symbol DB's licensing.

## v1 scope
- JS render adapter only
- Swastika + SS-rune visual detectors
- English + top-5-language slur wordlist
- Batch up to 10k seeds to PNG
- Markdown report with flagged-seed thumbnails

## Out of scope
- Audio, 3D meshes, animated output
- In-engine real-time hooks
- Auto-fixing / seed rewriting

## Risks & unknowns
False-positive fatigue kills adoption. Maintaining and licensing the symbol database. Dual-use: the same tool lets a bad actor *hunt* for offensive seeds — ship with a stated warning. Visual detection of subtle/partial symbols is genuinely hard.

## Done means
Run it over a tile-map generator known to emit a swastika at a specific seed; Bad Seed surfaces that seed in its top results while falsely flagging fewer than 5% of clean seeds on a 1,000-seed sample.
