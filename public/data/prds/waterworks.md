## Overview
Waterworks is a browser toy for choreographing a musical dancing-fountain show. You load a track, place nozzles, and keyframe jet heights, tilts, and lights to the beat — then a particle-simulated water show plays back in sync and exports as a shareable link. For anyone who's stood at a musical fountain thinking 'I could do better.'

## Problem
The arXiv 'Way of Water' work frames aquatic robotic art as a serious hardware-and-research pipeline — inaccessible to a curious person with a laptop. Meanwhile music visualizers are passive and reactive; a real fountain show is *composed*, beat by beat. There's no playful, no-hardware way to actually author one.

## How it works
Drop in an audio file; the app runs offline beat/onset detection and lays a waveform plus a beat grid on a timeline. You arrange jets on a stage (a row or arc of nozzles) and draw automation lanes — jet height, nozzle tilt, valve on/off, uplight color. Keyframes snap to beats, or you paint gestures ('wave from left,' 'bloom,' 'wall'). Press play and a GPU particle water show renders locked to the music. Export a JSON 'score' plus a link that replays deterministically.

## Technical approach
TypeScript + WebGL (regl) for GPU particle jets: each nozzle emits thousands of ballistic droplets with initial velocity from its height lane, gravity-integrated, fading on splashdown. Web Audio API's AnalyserNode plus an offline spectral-flux onset/tempo pass builds the beat grid. Automation lanes are keyframed and interpolated per frame; deterministic playback keys off (audio hash + score JSON) so shared links reproduce the same show. Lighting is additive blending with a bloom post-pass. The genuinely hard part is water that reads as crisp jets (not fog) while staying beat-locked at 60fps on a laptop GPU.

## v1 scope
- Single nozzle row of 8 jets
- Height + on/off + one color lane
- Drag-a-file local audio, beat-snap keyframes
- Play/pause, export score JSON + replay link

## Out of scope
- Real fountain hardware / DMX output
- 3D camera or multi-stage layouts
- Collaborative editing
- Hosted/licensed music

## Risks & unknowns
- Particle water looking cheap rather than liquid
- Beat detection drifting on ambient or rubato tracks
- Music licensing if hosted — keep v1 local-file only

## Done means
Drop in a 30-second track, place 8 jets, keyframe a beat-synced 'wave,' press play and watch water pulse on the beat, then copy a link that replays the identical show on another browser.
