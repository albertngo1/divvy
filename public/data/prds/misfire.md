## Overview
Misfire is a daily audio puzzle game where you diagnose an ailing engine by ear. You hear a synthesized engine idling with a fault and must pinpoint what's wrong — which cylinder is dead, whether it's a misfire, knock, or lean run. For gearheads, audio-training enthusiasts, and anyone who loved the Ciechanowski internal-combustion-engine explainer and wondered if they could actually *hear* a firing-order problem.

## Problem
Mechanics diagnose by ear; almost nobody else can. Engine sound is a rich, learnable signal with zero fun, low-stakes way to train on it. And procedural engine audio (vs. sampled) is rarely used as a puzzle substrate.

## How it works
Each day serves one procedurally-synthesized engine at idle. A healthy 4/6/8-cylinder engine has an even firing rhythm; the day's engine has an injected fault: a dead cylinder (skipped combustion pulse), knock (early detonation ping), or a lean/rich stumble (irregular pulse amplitude). You listen (loop it, slow it down), then answer via a little engine diagram: click the faulty cylinder and pick the fault type. Score on correctness + attempts; share a spoiler-free emoji result. A 'garage' mode lets you A/B a healthy engine to train your ear.

## Technical approach
The core is a procedural engine-sound synth in the Web Audio API: model each cylinder's combustion as a periodic impulse train at RPM × cylinders/2, shaped by an exhaust resonance (a few tuned bandpass filters) and intake/mechanical noise. Firing order spaces the pulses; a 'dead cylinder' zeroes one pulse per cycle (the characteristic loping idle); 'knock' adds an early high-freq transient; lean/rich modulates pulse amplitude/jitter. This physically-motivated synthesis (not samples) is what makes faults sound *authentic* — and is the genuinely hard part: tuning the model so a dead cylinder is audibly distinct yet fair. Seeded daily by date. Frontend: vanilla TS + Canvas engine diagram; Cloudflare Workers KV for the daily leaderboard.

## v1 scope
- 4-cylinder engine synth at idle
- One fault type: dead cylinder (pick which one)
- Daily seed, 3 guesses, share grid
- Loop + half-speed playback

## Out of scope
- 6/8-cyl, knock, lean/rich faults
- Garage A/B training mode
- Accounts / global leaderboard
- RPM sweep / rev interactions

## Risks & unknowns
- Making synthesized engines sound convincing enough is genuinely tricky audio DSP
- 'Which cylinder' may be too hard by ear alone — may need to soften to 'is it misfiring y/n' for v1
- Accessibility: purely audio puzzles exclude some players (offer a spectrogram view)

## Done means
On a given day, a 4-cylinder idle with one dead cylinder plays in the browser, an experienced listener can reliably distinguish it from a healthy idle, and selecting the correct cylinder scores a win with a shareable result.
