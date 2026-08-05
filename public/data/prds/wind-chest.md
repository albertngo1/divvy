## Overview
A single-player browser toy: build a pneumatic machine out of Hero-of-Alexandria parts — bellows, water-weighted reservoirs, siphons, valves, wind trunks, a tremulant, a rotating pinned barrel — and hear it, in real time, as an organ. Aimed at people who like generative music toys but are bored of grids and knobs. There is no note velocity and no mixer; expressiveness comes entirely from whether your plumbing can keep up.

## Problem
Every browser music toy models sound as an abstraction: a synth voice, a sample, an envelope. The physical instruments people actually love are loved for their failures — an organ's wind sags when you play a big chord, a pipe under-pressured goes breathy and flat, over-pressured it overblows to the twelfth. Simulate the *plumbing* instead of the tone, and those failures come for free, coupled, and controllable. Nobody has made the wind system itself the playable surface.

## How it works
Drag components onto a 2D canvas and connect them with pipes. Each chamber is a node with pressure and volume; each pipe is an edge with resistance and inertance — a lumped pneumatic network, structurally identical to an RLC circuit. The solver runs at 500 Hz and pushes per-pipe foot pressure into the audio graph. Each organ pipe is a digital waveguide with a jet-drive nonlinearity: foot pressure below the speaking threshold gives wind noise and no pitch, in range gives a stable tone whose pitch bends slightly with pressure, and well above gives an octave-and-a-fifth jump. Sequencing is a rotating barrel — drag pins onto a cylinder — turned by a water wheel fed from your reservoir. The reservoir drains. Your piece slows down and dies as the water runs out, and refilling it mid-performance is a gesture you make.

## Technical approach
TypeScript, no framework, canvas 2D for the machine, WebAudio for sound. Network solve: assemble the node-pressure system each tick and step with implicit Euler (the system is stiff — small volumes plus low resistance blow up under explicit integration), solving the sparse SPD system with conjugate gradient, ~30 nodes so it's microseconds. Audio lives in a single AudioWorklet running all pipes at 48 kHz: each is a Karplus-strong-style delay line with a fractional-delay allpass for tuning, a one-pole lowpass for radiation loss, and a McIntyre–Schumacher–Woodhouse-style pressure-dependent excitation; control-rate pressures arrive over a SharedArrayBuffer ring and are slew-limited to avoid zipper artifacts. Machine state serializes to a URL-safe compressed blob so a build is a link. Offline render to WAV via OfflineAudioContext. The genuinely hard part is coupling stability: the pipes draw air from chambers whose pressure the pipes themselves are changing, and a naive feedback loop either sings a DC oscillation or goes silent — the fix is treating each speaking pipe as a pressure-dependent flow resistor inside the network solve, not as a consumer bolted on afterward.

## v1 scope
- Four components: bellows (click to pump), reservoir, valve, pipe
- Eight pipes, fixed diatonic tuning, no barrel — click a pipe to open its valve
- Wind sag audible when you open four valves at once
- Nothing saves, nothing exports

## Out of scope
Reeds, tremulant, water wheel, multi-rank stops, MIDI in/out, mobile touch, sharing links.

## Risks & unknowns
The physical pipe model may sound like a bad flute rather than an organ, which kills the whole premise — prototype the waveguide standalone before writing a single line of network solver. Stiff-system blowups when a user connects a tiny chamber to a huge one. And it may end up more fiddly-engineering-puzzle than instrument, in which case lean into the puzzle.

## Done means
Playing a four-note chord on a marginally-sized bellows produces audible, unmistakable wind sag — the pitch drops and the tone goes breathy — and adding a second reservoir fixes it, with no parameter tuning between those two builds.
