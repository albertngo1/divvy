## Overview
Double Delta is a browser instrument for people who already own three step sequencers and are bored of all of them. Instead of "hole in tape = drum hit," sound is produced by *coincidence counting* — the actual method Colossus used to break Lorenz. Two looping bit-streams are XOR-differenced, their agreements are tallied over a sliding window, and a voice fires only when the tally crosses a threshold. You don't program a pattern; you program two patterns and listen to their correlation.

## Problem
Every generative sequencer is ultimately "trigger on true." Euclidean, probability, polymeter — all of them are direct readouts of a pattern you punched. The result is that generative music toys are legible in about ninety seconds and then dead. A trigger rule with a *statistic* in it produces rhythms nobody, including the author, can predict by reading the grid — but which are fully deterministic and repeat exactly.

## How it works
Twelve bit-rings, with the Lorenz SZ40's historical wheel lengths (χ: 41, 31, 29, 26, 23; ψ: 43, 47, 51, 53, 59; μ: 37, 61). You punch holes by clicking. Each ring advances one bit per clock tick. Pick any two rings as a *counter pair*. The engine computes each ring's delta (Δz_i = z_i XOR z_{i+1}), XORs the two deltas, and counts zeros over a window of W ticks. When the count exceeds the "set total" T, the counter fires its assigned voice; hysteresis (must drop below T−h to re-arm) keeps it from chattering. Up to four counters, four voices. Because the ring lengths are pairwise coprime, the whole machine repeats after lcm(lengths) ticks — 1271 for one pair, absurd for four — so it breathes for minutes without repeating.

## Technical approach
TypeScript + Web Audio. The counter engine runs inside a single AudioWorkletProcessor so triggers are sample-accurate; rings are `Uint8Array`s, delta and coincidence are computed with 32-bit word tricks (pack the window, XOR, `popcount` via SWAR) so a 64-tick window costs ~4 ops. Voices: three noise/click drums (biquad-shaped) plus a Karplus–Strong pluck, all in-worklet. UI is canvas: rings drawn as literal punched tape spirals, plus a live "counter scope" plotting the tally against T so you can *see* why a hit happened. State (wheel bits, W, T, voice map) serializes to a URL fragment. The genuinely hard part is musicality: raw coincidence counts are noisy and produce either silence or a machine gun, so the mapping from (W, T, hysteresis) to "feels like a groove" needs a good default curve and a T slider that is normalized to the pair's expected coincidence rate rather than raw counts.

## v1 scope
- Two rings only: lengths 41 and 31, click-to-punch
- One counter, one drum voice, W and T sliders
- Live scope showing tally vs. threshold
- Play/stop, tempo, URL-hash sharing

## Out of scope
- MIDI/Ableton Link, audio export, mobile layout
- Any actual cryptanalysis or Lorenz decryption
- Sample loading

## Risks & unknowns
The threshold band where output is neither silent nor constant may be uncomfortably narrow; mitigate by auto-calibrating T against a measured baseline. Also unknown whether listeners perceive statistical triggering as musical or merely random — the scope exists to make causality visible.

## Done means
Punching a single hole in the 31-ring audibly changes the groove, the pattern demonstrably repeats every 1271 ticks, and a shared URL reproduces the exact rhythm on another machine.
