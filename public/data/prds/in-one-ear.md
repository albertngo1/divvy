## Overview
In One Ear is a headphones-required party/solo game built on the cocktail-party effect. Two distinct spoken streams play simultaneously — one hard-panned left, one right — and you must attend to, and answer questions about, both. Directly sparked by the HN paper showing the brain can concurrently encode two speech streams; turns a neuroscience finding into a competitive sensory sport.

## Problem
Dichotic listening is a real, trainable skill (interpreters, air-traffic controllers) but there's no fun, shareable way to test or grow it. Existing 'brain training' apps are visual and dull. Nobody has made attention-splitting into a party game.

## How it works
Round structure: each ear gets its own narrator reading a short list (colors, names, numbers). A prompt appears: 'How many times did the LEFT voice say a fruit while the RIGHT voice counted past ten?' You score on both channels; ignoring one ear tanks you. Difficulty scales by narrowing the semantic distance between streams (both reading city names is brutal), speeding cadence, and adding 'switch!' cues that swap which ear you must prioritize mid-round. Party mode: pass one phone + splitter, or everyone joins on their own device and the host seeds the same audio. A retro skin nods to open-sourced AIM/Comic Chat — two chat 'buddies' talking over each other.

## Technical approach
Stack: plain web app, Web Audio API with two `AudioBufferSourceNode`s routed through `StereoPannerNode` at -1 and +1. Content is generated offline: word lists → TTS (Piper locally, or platform SpeechSynthesis) → per-ear tracks with controlled onset timing. Data model: a Round = {leftTrack, rightTrack, timing map of salient events, question templating over those events}. Key algorithm: an event scheduler that guarantees answerable overlap (target words in both channels within the same window) and a difficulty function tuning inter-stream semantic similarity + rate. Hard part: making questions provably answerable yet genuinely hard, and keeping L/R perfectly time-aligned across browsers.

## v1 scope
- Solo mode, 5 escalating rounds, headphone check gate
- Two TTS streams, hard-panned, event-timed
- Score per ear + combined, Wordle-style share card

## Out of scope
- Real-time multiplayer sync
- Voice-input answers (tap/type only in v1)
- Music/non-speech distractors

## Risks & unknowns
- Without headphones it's unplayable — need a hard gate and detection heuristic
- TTS voices too similar may be indistinguishable by pan alone; may need distinct voices per ear
- Accessibility: single-sided-deaf players excluded — offer a visual-analog fallback mode

## Done means
With headphones on, a player completes a round where both ears carried different lists, answers a two-channel question, and gets a per-ear accuracy score — and difficulty demonstrably rises as stream similarity increases.
