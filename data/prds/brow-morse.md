## Overview
Brow Morse is a browser game where you type using nothing but your face. Your webcam tracks your eyebrows; a quick raise is a dot, a held raise is a dash, a neutral pause ends the letter. You race the clock to transcribe words. Underneath the silly costume it's a working, calibration-free, hands-free text-entry prototype — a toy that's quietly dangerously useful for anyone who can't use a keyboard.

## Problem
Meta's Brain2Qwerty (on the HN front page) chases hands-free typing with an EEG cap. That's incredible and inaccessible — you can't buy one. Meanwhile every laptop already has a camera and every face already has eyebrows. Existing facial-switch access tools are clinical, joyless, and hard to try. Nobody practices an alternative input method for fun, so nobody's fluent when they suddenly need one. The itch: make hands-free typing a leaderboard sport so the muscle memory builds *before* you need it.

## How it works
A 20-second calibration watches your neutral face and a few deliberate brow-raises to set a threshold. Then the game shows a word; you blink it out in Morse with your eyebrows. On-screen a live "signal tape" shows the dots and dashes accumulating, with a decode preview. Finish the word to score; WPM and accuracy tick up. Modes: Practice (letter chart visible), Race (against a ghost of your best run), and Daily Word (everyone gets the same phrase, global speed leaderboard). Mischief: a "Meeting Mode" that lets you actually type a real sentence into any text field, hands-free, on a dare.

## Technical approach
Stack: vanilla TS + **MediaPipe FaceLandmarker** (WASM) running fully in-browser, no data leaves the device. Core signal: track vertical distance between eyebrow landmarks and the eye/nose bridge, normalized by face scale (so leaning in doesn't false-trigger). A small state machine debounces the raise signal into timed pulses: pulse < 250ms = dot, ≥ 250ms = dash, gap > 700ms = letter boundary, gap > 1.5s = word. Feed pulses into a standard Morse decode trie. The genuinely hard part is robust, lighting- and face-invariant thresholding without per-user ML training — solved with an adaptive baseline (rolling median of neutral position) plus hysteresis to avoid flicker. Daily leaderboard via a tiny serverless KV (Cloudflare Workers + KV); everything else is client-side.

## v1 scope
- FaceLandmarker eyebrow tracking + adaptive threshold calibration
- Morse state machine (dot/dash/letter/word) with live signal tape
- Practice mode with visible Morse chart
- WPM + accuracy scoring and a personal-best ghost race
- Runs 100% in-browser, no upload

## Out of scope
- Global accounts / leaderboard (stub the daily KV, ship single-player first)
- Other gestures (blink, head tilt) as inputs
- Mobile front-camera support
- Real text-field injection "Meeting Mode" (fun v2)

## Risks & unknowns
- Brow tracking may be unreliable for users with glasses, heavy fringe, or dark rooms — needs graceful calibration feedback.
- Morse has a learning wall; onboarding must teach E, T, A first, not dump the full chart.
- Sustained brow-raising is tiring — session length and difficulty need tuning.

## Done means
A first-time visitor calibrates in under 30 seconds, sees their eyebrow move a live signal tape, and successfully types the word "HELLO" in Morse with their face — with the whole pipeline running locally and no network calls for tracking.
