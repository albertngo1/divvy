## Overview

A single-player puzzle game about side channels. Each level hands you a sealed function and a query budget. You do not get its source, its output, or an error message that means anything. You get one scalar per query — milliseconds, or compressed bytes, or evicted/not-evicted — and a secret to recover. For people who found Obra Dinn's deduction loop satisfying and who half-understand what a timing attack is.

## Problem

Side-channel attacks are taught as trivia ("CRIME, BEAST, Spectre") and never as an *experience*, so the intuition never lands: that a leak is a real, workable signal you grind against, not a magic trick. Existing hacking games (Hacknet, Grey Hack) simulate hacking with scripted fiction. Nothing makes you actually do the statistics.

## How it works

Each level is a screen split three ways: a query composer, a live readout strip, and your deduction pad.

1. **Composer** — type or assemble the probe (a candidate password, an injected string, a memory index).
2. **Readout** — a scrolling scatter of every measurement you have taken, x = probe, y = the scalar. Noise is real; medians of repeated probes are how you win.
3. **Pad** — commit a guess. Wrong commits cost budget.

Budget is the whole game economy: 3,000 queries for the tutorial, 400 for the last level. Repeating a noisy probe five times to beat the jitter is a genuine tradeoff against exploring a new one.

Levels, escalating: (1) early-return `strcmp` on a password — wrong-at-char-1 returns faster; (2) a padding oracle that says only *valid* or *invalid*; (3) a compression oracle — your injected text is concatenated with the secret and DEFLATE'd, and a byte shorter means you guessed a prefix right; (4) cache-line eviction, where you probe a 64-entry array and read the secret index out of the latency histogram.

## Technical approach

TypeScript + Canvas, no backend. Crucially the oracles are **not scripted** — they are real implementations, so the leak is genuine and any strategy the player invents works. Level 3 runs `pako.deflateRaw` on `attacker_prefix + secret` and returns `bytes.length`; the leak falls out of LZ77 window matching for free. Level 1 runs a real character-by-character compare and returns a simulated timing: `base + chars_matched * per_char + gaussian(σ)`, with σ tuned per level so the required repetition count is a designed difficulty knob. Level 4 simulates a direct-mapped cache as a JS array of tags with a hit/miss cost model. Rendering: an incremental scatter with per-x median bars drawn as the player accumulates samples, plus a "confidence" shading that is just a standard error of the mean — teaching the statistic by drawing it. Data model: `Level { oracle(probe): number, budget, secretSpace, winCheck }`, and a replay log of every query so a solved level can be played back as a 10-second animation of the secret emerging. Hard part: tuning σ and budget so that a naive player fails, a player who thinks to average succeeds, and nobody can brute force.

## v1 scope

- Two levels: `strcmp` timing, compression oracle
- 8-character secrets from a 26-letter alphabet
- Scatter plot with median bars; budget counter; one commit button
- No accounts, no saves

## Out of scope

Spectre/branch-predictor levels, real WASM timing, multiplayer leaderboards, story.

## Risks & unknowns

The fun may live entirely in the *first* insight per level, making replay flat — mitigate by randomizing secrets and noise seeds. Level 4 risks needing knowledge the game hasn't taught; may need a diagram interstitial.

## Done means

A playtester who has never heard of CRIME recovers an 8-character secret in level 2 inside 400 queries, and can explain afterward, unprompted, why a shorter output meant they were right.
