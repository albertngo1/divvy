## Overview

A single-page browser game about model quantization. You're handed a real trained network and a memory budget that shrinks every level. Your only move is assigning a bit width (1–8) to each layer. Your score is the model's measured accuracy at or under budget. It is simultaneously a genuinely fun knapsack puzzle and the fastest way anyone has ever learned which layers of a net you're allowed to break. For engineers who've heard "just quantize it to int4" and have no intuition for what that costs.

## Problem

Quantization is taught as a table of numbers in a paper. Nobody develops a feel for it: that the first conv and the final classifier are glass, that depthwise layers hate per-tensor scales, that one outlier channel can eat four bits of everyone else's budget. The feedback loop in real life is an overnight job. Here it's 200ms.

## How it works

A vertical stack of layer cards, each with a bit-width dial and a bar showing its share of the budget. Drag a dial, and a live accuracy readout re-measures on a fixed holdout set. Under budget = level clears; over budget = the level won't submit.

The game resource is **probes**. You get 3 per level. Spending one on a layer reveals its full sensitivity curve (accuracy vs bits for that layer alone). With 12 layers and 3 probes you cannot measure everything — you must guess where the glass is, which is exactly the skill. Later levels unlock equipment: per-channel scales (costs budget for the extra scale factors), percentile clipping calibration, stochastic rounding, and the title item, round-to-nearest-even. The boss level swaps the classifier for a tiny character-level LM: no accuracy number, just a text box whose generations degrade from prose to word salad to `eeeeeee` as you squeeze.

## Technical approach

Svelte + ONNX Runtime Web (WebGPU backend, wasm fallback). The load-bearing trick is **fake quantization**: never emit int kernels. For each weight tensor compute scale `s = max(|W|)/(2^(b-1)-1)`, then replace `W` with `round(W/s)*s` and run the network in float32 as normal. Numerically identical to symmetric int inference, zero custom ops, works today in ORT Web. Budget accounting is pure arithmetic: `sum(numel * bits)/8 + scale_overhead`.

Level 1–8 models are small CIFAR-10 CNNs and a MobileNetV2 slice, exported to ONNX with `torch.onnx.export`, holdout of 512 preprocessed images shipped as a single fp16 tensor blob (~1.5MB). Eval is one batched forward pass — ~40–80ms on WebGPU, which is what makes dial-dragging feel live. Weights are re-quantized from a pristine float32 copy held in a `Float32Array` per tensor, so repeated edits don't compound rounding error (a bug that would silently make the game lie).

Sensitivity curves for probes are precomputed offline (12 layers × 8 bit widths = 96 evals per model) and shipped as JSON, so a probe is instant and free.

The hard part is the boss LM: text quality has no scalar, so scoring uses perplexity on a held-out passage while the *player* sees only the generated text. Making perplexity thresholds line up with when text "feels" broken takes real tuning.

## v1 scope

- One model (CIFAR CNN, 9 layers), five budget levels
- Per-tensor symmetric fake quant, weights only, bits 2–8
- Live accuracy on 512 images, probes with precomputed curves
- Daily seed: same model, one rotating budget, shareable emoji score row

## Out of scope

Activation quantization, QAT, real int8 kernels, mixed hardware cost models, user-uploaded models, accounts.

## Risks & unknowns

WebGPU availability and first-load model download; wasm fallback may be too slow to feel live. Fake quant with per-tensor scales may make 2-bit so catastrophic that low-bit levels are unplayably flat. Fun is unproven — it may just be a slider toy.

## Done means

A player with no ML background clears five levels in under ten minutes, and afterward can correctly name which two layers in an unseen net to protect first — verified by having them beat a naive uniform-bit baseline by ≥3% accuracy at the same budget.
