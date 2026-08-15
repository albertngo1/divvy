## Overview

*Second Sheet* is a browser instrument built on monodromy: the fact that following a loop in parameter space can return you to the same *set* of values with the identities swapped. Six oscillators are tuned to the six roots of a polynomial whose coefficients you steer by dragging a point on a 2D pad. Circle a branch point and the pitches return exactly — but voice 1 is now singing what voice 4 was singing. For generative-music people, patch-heads, and anyone who likes a toy with an actual theorem inside it.

## Problem

Generative music toys mostly randomize. Randomness is cheap and it sounds cheap: nothing accumulates, nothing resolves. What's missing is a source of *structured* non-repetition — variation that is fully deterministic, has real long-term memory, and eventually comes home. Braid monodromy is exactly that, and nobody has made it audible.

## How it works

- The pad is the complex plane. Your cursor is a parameter `t`; the patch defines `p(z, t)`, degree 6.
- The six roots become six voices: real part → pitch (mapped to a scale), imaginary part → filter cutoff and pan.
- **Voice identity is continuity, not sorting.** Each frame, roots are matched to voices by nearest-neighbor tracking, so a voice "is" whichever root it followed.
- Branch points — where two roots collide — are drawn as glowing pins. Loop around one and those two voices trade places permanently. Your envelopes, effect sends, and per-voice sequencer lanes stay pinned to the *voice*, so the same drag produces a different arrangement each pass.
- The HUD shows the accumulated permutation and the order of that permutation: "returns to origin in 6 loops." A record button captures a drag path and plays it back forever; because the permutation composes, a 4-bar path is really a 24-bar piece.

## Technical approach

Vanilla TS + Web Audio; DSP in an AudioWorklet, visuals in WebGL2. Root-finding via Aberth–Ehrlich (~15 iterations, warm-started from the previous frame's roots — critical, since warm-starting *is* the continuity that defines voice identity). Root-to-voice assignment by Hungarian matching on a 6×6 distance matrix, at 120 Hz on the control thread; audio params sent as k-rate ramps so a near-collision glides rather than clicks. Branch points found offline per patch by solving `Res(p, p') = 0` in `t` with a symbolic pass at build time.

The genuinely hard part is near-collision behavior: when two roots nearly touch, the matching is numerically ambiguous and voices can swap spuriously — which sounds like a glitch, not a theorem. Fix with hysteresis plus a symmetry check (when the pair separation drops below ε, freeze the assignment and resolve it by the sign of the exit angle).

## v1 scope

- One fixed degree-6 patch with three visible branch points
- Six sine+saw voices, one shared filter, no effects
- Drag-to-play, path record/loop, permutation HUD
- Static site, no save, no MIDI

## Out of scope

User-authored polynomials, MIDI out, mobile touch, VST/AU build, multi-patch morphing.

## Risks & unknowns

The deepest risk is that the permutation is *inaudible* — if all six voices have similar timbre, swapping them changes nothing. Mitigate by giving each voice a strongly distinct timbre and sequencer lane, so identity is obvious. Second risk: root-tracking jitter at 120 Hz may need the solver moved into WASM.

## Done means

Recording one closed loop around a single branch point and letting it repeat produces six audibly distinct passes, the seventh is bit-identical to the first, and the HUD predicted "order 6" before you heard it.
