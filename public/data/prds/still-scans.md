## Overview

A browser puzzle game for people who like constraints with teeth. Each level hands you a QR code carrying a fixed payload and a ghosted target image. You paint the image into the code. The only currency you spend is the code's error-correction capacity — and at the end, a real decoder has to still read it through a simulated bad phone camera.

## Problem

QR art tools (halftone QR, qart) are one-shot generators: you press a button, a machine negotiates the tradeoff, you get a picture. The genuinely interesting tension — that every artistic pixel is *borrowed* from the code's resilience, and the loan comes due at scan time — is completely invisible. Nobody has made the error-correction budget a thing you can feel, spend, and blow.

## How it works

The board is a rendered QR code with a criticality heatmap: dark-locked modules (finder patterns, timing, alignment, format info) can't be touched; every other module is tinted by which Reed–Solomon block it belongs to and how much of that block's budget is already gone. You brush modules toward the target image. A rack of per-block gauges fills in real time: "block 3: 9 of 15 correctable symbols spent." Overspend one block and it goes red even if the code overall looks fine — the lesson being that RS budget is *per block*, not global, so damage must be spread.

Win condition is two-part: image similarity ≥ threshold AND the code decodes under that level's camera gauntlet. The gauntlet is the difficulty curve: level 1 is a clean render; level 8 is EC level L, a 20° perspective warp, gaussian blur, JPEG q40, and a specular glare blob eating one corner. Late levels also pre-damage the code (a torn corner) so you start in debt.

## Technical approach

TypeScript + canvas, no framework needed. Ship a hand-rolled QR encoder rather than a library, because the whole game depends on exposing the codeword→module mapping: ISO/IEC 18004 places interleaved data and EC codewords as a boustrophedon of 2-module-wide columns, skipping function patterns. From that mapping, module criticality = its block index plus that block's spent fraction of t = (n−k)/2 correctable symbols. Note a symbol is a byte = 8 modules, so a stroke that stays inside already-damaged symbols is free — a real strategy the UI should reward.

Mask pattern is the trap: masks 0–7 XOR the whole grid, and the encoder normally picks by penalty score, which would make the heatmap jump on every stroke. v1 locks the mask per level and displays it. Scoring: render the painted code through a WebGL degradation pass (perspective matrix, blur, quantization, glare sprite), then run zxing-wasm on N sampled variants; "survives k of N" is the score. Similarity via SSIM on 64×64 luminance. Hard parts: an honest, legible criticality UI, and tuning the gauntlet so it's demanding but not luck.

## v1 scope

- 8 hand-authored levels, one payload length, fixed mask, EC level M
- Single-color brush (black/white flip only), no undo stack beyond 20 steps
- 3-condition gauntlet: clean, blurred, 15° tilt
- Per-block budget rack + criticality heatmap toggle
- Export PNG of a passing code

## Out of scope

Custom payloads, color/photo QR, micro-QR, animated codes, level editor, sharing/leaderboards, real-camera testing.

## Risks & unknowns

Criticality may be too abstract to read as a game surface — mitigate by showing block boundaries as faint outlines. Decoder disagreement (zxing vs a real iPhone) could make wins feel fake; sample multiple decoders. Rolling a spec-correct encoder is a solid day of work by itself.

## Done means

A stranger finishes level 5 without instructions, points their actual phone at the exported PNG, and it scans.
