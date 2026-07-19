## Overview
Mondegreen is a hotseat party wordgame built around a tiny on-device speech recognizer (Moonshine 'micro', ~500kb, running in the browser via WASM). It's for friends who love mishearings, homophones, and the specific comedy of a machine confidently transcribing nonsense.

## Problem
Speech-to-text is something we passively endure — dictation errors, bad captions. Nobody competes over it. Yet the *failure modes* of a small ASR model are hilarious and skill-expressible: you can learn to steer a weak recognizer. There's no game that turns 'making the transcriber mishear you on purpose' into a scored sport.

## How it works
Each round shows a target transcript, e.g. `RECOGNIZE SPEECH`. Players take turns recording a 2-4 second utterance. The on-device ASR transcribes it live. You score by how close the ASR output is to the target (1 − normalized Levenshtein distance). The catch: before recording you submit the *real* phrase you intend to say (`WRECK A NICE BEACH`), and it must share less than half its words with the target — say the target verbatim and you're disqualified. Points = closeness × divergence. The reveal screen plays each clip back next to what the machine heard and what the player claimed — that's the laugh payoff. Highest cumulative score over 8 rounds wins.

## Technical approach
Stack: static SPA (Vite + vanilla/Preact). ASR: Moonshine micro exported to ONNX, run with onnxruntime-web (WASM/SIMD), fed 16kHz mono audio captured via MediaRecorder + an AudioWorklet resampler. Scoring: normalized Levenshtein on uppercased, punctuation-stripped tokens for closeness; word-set Jaccard between the submitted phrase and target for the divergence gate/multiplier. Daily/target phrase bank is a static JSON of ~50 curated homophone-friendly sentences. Everything client-side, no server; state in memory. The genuinely hard part is audio normalization and making scoring feel *fair* despite mic/accent variance — solve via per-device calibration (record the target cleanly once, store the model's baseline transcription, score relative to that) and a short countdown + noise-gate to standardize input.

## v1 scope
- Single-device hotseat, 2-6 players entering names.
- One round type (Homophone Heist), 8 rounds.
- 50-phrase static bank, on-device ASR, playback reveal.
- Closeness + divergence scoring with the verbatim-DQ rule.

## Out of scope
- Online lobbies / netcode.
- Multiple languages or model sizes.
- Persistent accounts or global leaderboards.
- TTS or accessibility caption modes.

## Risks & unknowns
- ASR may be *too* noisy to feel skill-based — mitigate with calibration and generous scoring bands.
- Mic permission friction on mobile Safari.
- Loud rooms wreck input; needs a noise gate and retry-once affordance.
- Model may consistently favor certain accents, feeling unfair.

## Done means
Six people pass one phone around, each round transcribes locally in under 2s, verbatim attempts are rejected, the reveal plays audio beside machine-heard vs claimed text, and a winner is crowned — with zero network calls after initial load.
