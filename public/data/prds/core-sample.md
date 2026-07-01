## Overview
Core Sample is a quiet macOS menubar app that builds a single generative artwork over a full year: one concentric ring per day, its color and texture derived from a short ambient audio sample. Think dendrochronology for your life's soundscape. For people who want an ambient, effortless record of a year that isn't a spreadsheet. Sparked by FFmpeg audio tooling + the 'artifact that generates itself over a year' brief.

## Problem
Our days blur together and quantified-self apps demand active logging. There's no *passive*, beautiful, single-image record of the texture of a year — and audio, unlike step counts, captures mood: laughter, silence, rain, arguments, music.

## How it works
Once a day at a randomized time, the app records ~60 seconds of ambient audio, extracts acoustic features, throws the raw audio away (privacy), and appends one ring to a growing radial image. Feature→visual mappings: loudness → ring thickness, spectral centroid (brightness) → hue, spectral flux/onset density (busyness) → texture/jitter, and a rough speech-vs-music-vs-quiet classifier → ring style. Day 1 is the innermost ring; day 365 the outer bark. You watch the disc thicken all year and can hover a ring to see date + descriptors (never audio). At year end you export a print-ready core.

## Technical approach
Stack: Swift menubar app using AVAudioEngine to capture, then FFmpeg/`vDSP` or the `librosa`-equivalent to compute RMS, spectral centroid, zero-crossing, and onset rate. NO audio is persisted — only a small JSON row per day (features + timestamp). Rendering: a Metal or Core Graphics radial renderer draws all rings from the JSON each launch, so the image is reproducible from tiny data. A lightweight on-device classifier (YAMNet via CoreML) tags quiet/speech/music. The genuinely hard part is a mic-usage/privacy model users trust (clear indicator, discard-immediately guarantee, local-only) and mapping features to visuals that stay legible across 365 rings without turning to mud.

## v1 scope
- Daily 60s capture at a random time
- Compute loudness + brightness only → ring thickness + hue
- Render radial PNG from JSON, refreshed on launch
- Discard audio immediately; store only feature JSON

## Out of scope
- Speech/music classification
- Hover tooltips / interactive core
- Print export pipeline
- iOS / cross-platform

## Risks & unknowns
- Mic-privacy trust is make-or-break; needs airtight UX + messaging
- macOS background mic access + scheduling reliability
- 365 rings may visually crowd — needs adaptive ring width

## Done means
Running for a week yields a 7-ring disc whose ring thickness and hue visibly track how loud/bright each day's sample was, with zero audio files on disk and a JSON that fully reconstructs the image.
