## Overview
Earwitness is a browser party game that weaponizes the neuroscience finding that the brain can partially encode two simultaneous speech streams (PLOS Biology EEG study). Everyone in the room puts in earbuds, hits ready, and hears two different short narrations — one hard-panned left, one hard-panned right — playing at the same time. Then it quizzes both. It's a dichotic-listening lab test reskinned as a competitive drinking-adjacent party game, and as a side effect it's a genuinely good divided-attention trainer.

## Problem
Most party games test one channel: trivia, drawing, word association. Nothing makes the *split-attention* struggle itself the fun. Meanwhile the actual clinical tool for this (dichotic listening) is locked in psych labs with beige UIs. There's an obvious toy hiding in a serious instrument.

## How it works
A host device runs the room over a short code. Each round: a 15–25s pair of clips plays, panned L/R. Clips are matched-length micro-stories with plantable facts ("the courier wore a *green* coat", "the price was *$40*"). After playback, players answer 4 questions on their phones — 2 from each ear. Scoring rewards *balance*: getting both ears' questions right is worth far more than acing one and bombing the other, so pure one-ear focus loses. Modifiers escalate: "Switch" rounds swap which ear matters mid-clip; "Blur" rounds add café babble; "Echo" rounds make the two voices the same speaker. A running leaderboard tracks a per-player "balance index."

## Technical approach
Pure client web: React + Web Audio API. Two `AudioBufferSourceNode`s each through a `StereoPannerNode` (pan −1 / +1), started on the same `audioContext.currentTime + lookahead` so both ears begin sample-aligned. Clips are pre-generated TTS (any decent multi-voice engine) with a JSON manifest of transcript + question bank + answer keys, so no runtime model needed. Room sync is a tiny WebSocket relay (or WebRTC datachannel) broadcasting round state; phones are dumb answer pads. The genuinely hard part is *fairness*: matched difficulty and prosody across the two streams (equal word rate, equal fact salience) so neither ear is inherently easier — this needs a calibration pass measuring per-clip recall on testers and normalizing. Second hard part: enforcing true stereo separation despite cheap earbuds and Bluetooth mono-downmix — detect via a startup L/R identification check.

## v1 scope
- 20 pre-baked clip pairs, 3 modifiers (plain, Switch, Blur)
- Host screen + phone answer pads over one WebSocket relay
- Balance-weighted scoring + end-of-game leaderboard
- L/R earbud check before play

## Out of scope
- Runtime TTS / user-supplied text
- More than ~8 players
- Real EEG anything

## Risks & unknowns
- Bluetooth mono-downmix silently kills the whole premise on some phones
- Difficulty balancing between ears is finicky; may need lots of playtesting
- Some people find dichotic overlap genuinely stressful, not fun — needs an easy mode

## Done means
Four people in a room, each with wired-or-verified-stereo earbuds, play a full 8-round game where two panned streams play sample-aligned, both-ear answers score double, and the final balance-index leaderboard renders — with zero desync across phones.
