## Overview
One Megahertz is a `.prg` you boot on a Commodore 64 (VICE, or real iron with an SD2IEC) that plays music forever, generated live by a ternary-weight neural network executing on the 6502 at 0.985 MHz. No sample data, no pattern tables, no PRNG-plus-scale hack — an actual next-token model over SID chip register writes, sampling one frame every 20 milliseconds. Also builds to WASM as a browser screensaver. For demosceners, chiptune people, and anyone who thinks "tiny model" should mean *tiny*.

## Problem
Generative music models are enormous and produce audio. Chiptune generators are tiny and produce Markov-chain mush that loops audibly in ninety seconds. Nobody has put the two in the same room under a hard cycle budget, and the budget is exactly what makes it interesting: 19,656 cycles per PAL frame is a brutal, honest constraint that forces every architectural decision.

## How it works
1. **Corpus.** Render the High Voltage SID Collection (~57k tunes) through libsidplayfp with a register-write hook, dumping a snapshot of the 25 SID registers once per 50Hz frame. ~1.5 billion frames.
2. **Vector-quantize the frame delta.** Encode each frame as the delta from the previous one, k-means to a 256-entry codebook. Music becomes a byte stream at 50 bytes/sec. This is the load-bearing trick: it turns a 25-register regression into an 8-bit next-token problem.
3. **Model.** Context of the last 8 tokens → 16-dim learned embeddings (a 256×16 int8 table = 4KB) → one ternary hidden layer of 48 → 256-way output logits. Trained in PyTorch with straight-through ternarization, then exported as 6502-friendly tables.
4. **On-chip inference.** Ternary weights mean no multiplies — just adds, subtracts, and skips, driven by a 2-bit-packed weight stream with an unrolled inner loop. Logits go through an 8-bit exp LUT; sampling uses a 24-bit LFSR plus a repetition-penalty byte table that decays each frame.
5. Emit the token's codebook delta straight into $D400–$D418. Repeat forever.

## Technical approach
Training: Python + PyTorch + libsidplayfp bindings. Export: a Python script that emits 6502 assembly (ca65) with the weight tables inlined and the hidden layer fully unrolled. Player is hand-written asm; build via cc65 + `exomizer` for the final crunch. A cycle-exact test harness runs the generated code under `py65` and asserts the per-frame cycle count.

The hard part is arithmetic, and the numbers are tight: 128 inputs × 48 hidden ternary ops at ~6 cycles each is ~37k cycles — nearly double the frame budget. Three honest mitigations, in order of preference: (a) amortize — predict a token every *second* frame and let the codebook entry cover a 2-frame delta, halving the rate to 25Hz; (b) shrink to context 4 × 8-dim embeddings and hidden 32; (c) exploit activation sparsity, skipping zero inputs, which the ternary scheme makes common. Expect to ship (a)+(c).

Second hard part: degenerate attractors. An 8-token context with greedy-ish sampling will find a 3-token loop and sit in it. Repetition penalty plus a slow temperature wander (a sine LUT over minutes) is the plan.

## v1 scope
- Train on one HVSC subfolder (~2,000 tunes), one composer's style
- 256-entry codebook, 25Hz token rate
- Runs in VICE; `.prg` under 32KB
- No UI at all — it boots and plays

## Out of scope
- NES/2A03, AY, or Game Boy backends; real-hardware testing beyond one SD2IEC run; user controls; MIDI export; a training GUI.

## Risks & unknowns
The model may be too small to learn anything above "plausible timbre soup with a pulse" — the fallback is that this is still a fun artifact, but it might not be *music*. VQ on frame deltas may destroy exactly the long-range structure that matters. Real-hardware SID variants (6581 vs 8580) will sound meaningfully different from the emulator the corpus was rendered with.

## Done means
`x64sc music.prg` produces 10 minutes of continuous audio with no exactly-repeating 8-second window, the binary is under 32KB, and the cycle-count assertion passes for every frame of a 30,000-frame run.
