## Overview
Deadbeat is a live-coding drum machine that makes parallel-programming hazards *audible*. Each percussion voice runs on its own worker clock contending for a shared timing bus; instead of hiding race conditions, you dial them up until jitter and contention bloom into emergent polyrhythms. It's a music toy for people who liked 'The Zen of Parallel Programming' and Skred, and a sneaky way to feel concurrency in your ears.

## Problem
Concurrency is taught with dry diagrams; races and scheduling jitter are invisible until they bite. Meanwhile drum machines are rigidly quantized — perfectly locked, perfectly lifeless. Both problems share a fix: let nondeterminism be the point, and make it sensory.

## How it works
You write terse patterns in a tiny stack-based language (Forth-flavored, à la Cagire): `kick 4 beat`, `hat 3 :jitter 20`. Each line spawns a voice on its own AudioWorklet/worker with an independent clock. A global 'Contention' knob controls how hard voices fight over a shared scheduling bus (a SharedArrayBuffer): low = tight machine funk, high = drifting, phasing, evolving grooves born from genuine timing races. A live 'thread view' visualizes each voice's clock and the moments they collide, so you can *see* the race that just made the snare land late-and-lovely. Save a seed; the groove is reproducible enough to share, chaotic enough to surprise.

## Technical approach
Web Audio API for sound, AudioWorklet processors per voice for sample-accurate output, Web Workers as independent 'clocks' writing next-hit timestamps into a shared SharedArrayBuffer 'bus' via Atomics. Contention is modeled as bounded random delay + lock-acquire jitter on that bus. Tiny language parses to a token stream driving voice params. Visualization on canvas: per-voice timelines with collision markers. Hard part: exposing nondeterminism *musically* — enough jitter to be alive, bounded so it grooves instead of collapsing into noise; plus keeping audio glitch-free while deliberately fighting the scheduler.

## v1 scope
- 4 built-in drum samples, 4 simultaneous voices
- Mini language: voice name, subdivision, `:jitter` param
- One global Contention knob
- Thread-timeline canvas with collision flashes
- Shareable seed string

## Out of scope
- Custom sample upload, melodic voices, MIDI export, mobile, accounts

## Risks & unknowns
- Audio dropouts under real contention; may need bounded scheduling
- SharedArrayBuffer needs COOP/COEP headers — hosting friction
- 'Emergent groove' might just sound broken without careful tuning

## Done means
A user types a two-line pattern, drags Contention up, hears a stable groove morph into an evolving polyrhythm, watches the thread view flag the colliding beats, and shares a seed that reproduces it.
