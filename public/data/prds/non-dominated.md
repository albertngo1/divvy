## Overview
An ambient generative piece: a live multi-objective evolutionary run rendered as a parade. Twenty 2D creatures walk left to right across your idle screen, each occupying a different point on the speed-versus-energy Pareto front — the frantic sprinter, the miserly shuffler, and everything between. Every foot contact fires a percussion voice, so the front is audible as a shifting polyrhythm. For anyone who wants a desktop toy that is doing real computation instead of looping an mp4.

## Problem
Evolved-walker demos are a genre and they're all the same: one objective, one winner, a fitness graph. But the interesting object in optimization isn't the winner — it's the *front*, the set of solutions where you can't improve one thing without ruining another. Nobody has made that beautiful, and nobody has made it ambient. Meanwhile screensavers are dead: they either loop a video or show the weather.

## How it works
On wake, the run seeds from a fresh RNG seed and starts from scratch. NSGA-II maintains a population of 60 genomes; the non-dominated front (max 20) is what you actually see, sorted left-to-right by the tradeoff axis. Dominated individuals fade out and drift backward as pale tombstones. When a new solution enters the front, it walks on from stage right and the one it displaced dissolves.

Audio: every foot-ground contact triggers a short sample. Voice choice maps to the creature's slot on the front (low toms for the plodders, hats and rimshots for the sprinters), so a diverse front is a busy groove and a collapsed one is a dull metronome — the sound tells you how the optimization is going before you look.

Come back from lunch and there's a gallery: the archive persisted, seeded, replayable, shareable as a seed string.

## Technical approach
TypeScript + Rapier2D (Rust/wasm) for deterministic fixed-timestep physics, canvas2D rendering, WebAudio for the percussion. Packaged for macOS as a `ScreenSaverView` hosting a `WKWebView`; also runs as a plain full-screen browser tab on other platforms.

Genome: 14 floats parameterizing a central pattern generator — four coupled Kuramoto oscillators driving six joint motor targets on a four-limb body, plus phase offsets and amplitude. Objectives: distance per simulated second, and integral of |torque·ω| (energy). Optional third: head-bob variance, which is really "elegance".

Hard parts, both real: (1) throughput — you need thousands of 8-second rollouts, so evaluation runs headless in a pool of Web Workers with the physics stepped as fast as it goes, decoupled from the 60fps display loop that only renders the current front. (2) Crowding distance keeps solutions spread in *objective* space, which does not mean they look different — two visually identical gaits can sit at different speeds. Fix: a MAP-Elites-style behavioral grid over duty cycle and mean body height layered on top of NSGA-II selection, which as a bonus is exactly what makes the drum pattern varied.

## v1 scope
- Browser tab only, no screensaver packaging
- Four joints, two objectives, front capped at 8
- One drum kit, one sample per creature
- Spacebar reseeds; seed shown in the corner

## Out of scope
- 3D, terrain, obstacles, user-editable objectives, sharing/leaderboards

## Risks & unknowns
- Evolution may converge to a boring front in 30 seconds and then sit there; needs novelty pressure or periodic catastrophes
- Screensaver-hosted WKWebView throttles timers on some macOS versions
- Percussion could get annoying fast — needs a density ceiling and a silent default

## Done means
Open the tab, walk away for ten minutes, come back to a visibly and audibly varied front of at least six distinct gaits; typing the printed seed into a fresh tab reproduces the same run frame-for-frame.
