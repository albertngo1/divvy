## Overview
A single-page science toy for the curious (students, teachers, generative-art tinkerers) that shows *why* sunflowers, pinecones, and roses land on Fibonacci parastichy numbers — not by hard-coding the golden angle, but by simulating the local mechanism that produces it, and sonifying each new bud.

## Problem
Every 'phyllotaxis' demo cheats: it places dot N at angle N × 137.5°. That draws a sunflower but explains nothing — the golden angle is baked in as a magic constant. The genuinely beautiful fact (that this angle *emerges* from primordia repelling their neighbors as the meristem grows) is invisible. There's no toy where you can break the rule and watch a different spiral fall out.

## How it works
A circular meristem grows outward. New primordia (buds) appear at the edge on a timer. Each new bud is placed where the inhibitor field from all existing buds is weakest — a simple 'farthest from the crowd' rule on a growing disc. Run it and the divergence angle *self-organizes* toward 137.5°; the parastichy count settles on 34/55/89. Sliders for growth rate, inhibitor decay radius, and bud cadence let you knock it into 3-, 4-, or 5-fold whorls or decussate leaves. Each new bud triggers a WebAudio pluck whose pitch maps to its divergence angle, so a well-tuned plant plays a slowly converging melody; a broken one stutters. Export the final head as an SVG keepsake with its emergent angle stamped on it.

## Technical approach
Vanilla JS + Canvas2D + WebAudio, no build step. Model: a Douady–Cou（Douady–Couder)-style inhibition field — each existing primordium contributes an exponentially-decaying repulsion; the next bud samples ~360 candidate edge positions and picks the minimum-inhibition slot. O(buds²) per placement is fine to ~1000 florets in real time; cap and cull far-field contributors for more. Track running divergence-angle histogram and detect parastichy count via FFT of the radial dot pattern (peaks give the spiral arm counts). Audio: a plucked-string Karplus-Strong voice, pitch = 220·2^(angle/360). Hard part: keeping the field stable so it *converges* rather than oscillates — tuning decay radius vs growth rate is the whole game, which is exactly what makes it educational.

## v1 scope
- One meristem, the inhibition placement rule, live spiral render
- Three sliders (growth, decay radius, cadence) + reset
- Live divergence-angle readout and detected parastichy pair
- Per-bud pluck; mute toggle
- SVG export

## Out of scope
- 3D, real botanical species presets, leaf/petal rendering
- Saving/sharing gallery, mobile gestures

## Risks & unknowns
- Field may not converge cleanly for all slider combos (clamp ranges)
- FFT parastichy detection is finicky at low floret counts
- Sonification could annoy more than delight — needs a good default voice

## Done means
Starting from empty, the sim reaches a measured divergence angle within ±1° of 137.5° and a detected 34/55 parastichy pair by ~300 florets, with no golden-angle constant anywhere in the placement code — verifiable by grepping the source.
