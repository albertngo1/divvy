## Overview
Squint is a daily browser puzzle where you deliberately destroy an image. Given a photo and a target label ("tabby cat"), you tune JPEG quality, downscale, chroma-subsample, and quantization aggressiveness to produce the *smallest possible file* that a fixed vision model still classifies correctly above a confidence threshold. It's for the code-golf / demoscene / ML-curious crowd who love adversarial optimization and Wordle-style daily scoreboards.

## Problem
The "Regressive JPEGs" crowd loves squeezing images to absurd tininess, but there's no *game* around the tradeoff between compression and legibility — and no shared, judged target. Meanwhile everyone intuits that ML models 'see' differently than humans but rarely gets to feel the exact cliff where recognition collapses. Squint turns that cliff into a leaderboard.

## How it works
Each day everyone gets the same seed image + target class + judge model. You manipulate: JPEG quality (0-100), resolution scale, 4:2:0/4:4:4 chroma, and a custom quantization-table multiplier. Live preview shows the current file in bytes and the model's confidence bar. Your score = bytes (lower is better) as long as confidence ≥ threshold. Drop below and the run is invalid. A Wordle-style emoji share (🟩 bytes tier, 🔒 for 'still recognized') spreads it. A twist mode: *fool* the model into a wrong-but-specified label at minimum edit — adversarial-compression instead of preservation.

## Technical approach
Entirely client-side. Stack: vanilla TS + a `<canvas>` re-encode pipeline. Use `canvas.toBlob('image/jpeg', q)` for the quality knob; for real quantization-table control, ship a tiny WASM build of mozjpeg or a hand-rolled DCT+quant encoder so players can push custom Q-tables (the interesting depth). Judge = MobileNetV3 or a small CLIP zero-shot head via `onnxruntime-web` / TF.js, pinned to one version + fixed preprocessing so scores are deterministic across devices. Daily puzzle = date-seeded pick from a bundled 365-image set (ImageNet-classes, licensed). Leaderboard is a single Cloudflare Worker + KV storing `{seed, bytes, hash}`; verify by re-decoding the submitted blob server-side-free (recompute confidence in a headless check job). Hard part: making the judge bit-identical across browsers so a 4,102-byte win reproduces — pin ONNX opset, disable SIMD nondeterminism, fix resize kernel.

## v1 scope
- One image/day, one judge model, quality + scale + chroma sliders
- Live byte count + confidence bar + valid/invalid state
- Local best-score memory + emoji share string
- Static 30-image starter pool

## Out of scope
- Custom Q-table editor (v2 depth)
- Global leaderboard / anti-cheat verification
- Adversarial 'fool it' mode

## Risks & unknowns
- Cross-device model determinism is the whole ballgame; if confidence drifts 2%, scores don't reproduce.
- Image licensing for the daily pool.
- Skill ceiling might be shallow once players find the dominant knob.

## Done means
Two different browsers loading the same day's puzzle, applying the same settings, produce the same byte count and the same valid/invalid verdict, and the emoji share string round-trips.
