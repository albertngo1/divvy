## Overview
Lyrebird is an offline puzzle game for the curious-nerd crowd (birders, sound designers, ML-tinkerers). It inverts BirdNET-go: instead of *listening* to real wildlife and identifying it, you *manufacture* sound that the exact same open-source classifier will confidently mislabel as a target species.

## Problem
BirdNET-go is a beautiful serious tool — a 24/7 Pi that names the birds in your yard. But the interesting question nobody plays with is: how brittle is it? What does a classifier's ear actually key on? Most people never get a hands-on, playful intuition for adversarial ML, and 'so you want to learn X' curricula are dry. Lyrebird makes the model's blind spots a toy — while gently teaching that real lyrebirds are natural adversarial mimics.

## How it works
Each daily puzzle names a target species (e.g. 'Kirtland's Warbler') and gives you a small synthesis rack: oscillators, an FM operator, a formant filter, a chirp-sweep generator, and a granular re-sampler seeded with public xeno-canto snippets. You tweak knobs to sculpt a 3-second clip. Hit 'Submit' and the real BirdNET-Analyzer model scores your clip; your points = the model's confidence for the target minus its confidence for the true nearest match. A side 'spectrogram diff' shows what the model is latching onto. Wordle-style emoji share of your best confidence.

## Technical approach
Bundle BirdNET-Analyzer's TFLite model and run inference locally via tflite-runtime (or onnxruntime-web for a browser build via WASM). Audio synthesis in the browser with the Web Audio API / an OfflineAudioContext render to a Float32 buffer, resampled to 48kHz mono and fed to the model as the standard 3s mel-spectrogram input. Data model: puzzle = {targetLabel, allowedModules[], seedClips[], parScore}. The genuinely hard part is a good gradient-free search hint UX — you can't backprop through knobs in-browser cheaply, so provide a 'nudge' that finite-differences one parameter and shows which direction raises target confidence, giving hill-climbing feel without a full attack solver.

## v1 scope
- 5 hand-built puzzles, 3 synth modules, one bundled TFLite model
- Local inference + confidence score + spectrogram view
- Par score and emoji share string

## Out of scope
- Any upload of clips to real eBird/BirdNET networks (explicitly blocked — no poisoning)
- Multiplayer, accounts, mobile mic capture
- Training your own model

## Risks & unknowns
- Model license/redistribution terms for bundling (CC-BY-NC — fine for a non-commercial toy)
- WASM inference latency; may need a native Electron shell
- Ethical framing must be loud: sandboxed, never touches real datasets

## Done means
A player loads today's puzzle, adjusts at least two knobs, submits, and sees the real classifier report >0.5 confidence for the target species with a shareable score — all fully offline, no network calls.
