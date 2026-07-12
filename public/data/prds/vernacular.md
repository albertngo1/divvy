## Overview
Vernacular is a 3–8 player pass-and-draw party game, playable on phones in one room. It inverts Pictionary: you don't win by drawing the *clearest* fork or house — you win by drawing the most *divergent* one that a sketch classifier still recognizes. It's built to surface the hidden personal and cultural dialects in how people draw everyday concepts (sparked by the "billions of sketches reveal hidden cultural variation" finding).

## Problem
Everyone assumes there's one obvious way to draw a light switch, a coffee, a fish — until you see how differently a 60-year-old and a teenager, or someone raised in Osaka vs Ohio, draw the same word. That variation is normally invisible and passively noted. There's no game that makes it the *scoring axis* and pits people's drawing instincts against each other.

## How it works
Everyone gets the same prompt ("toothbrush") and 30 seconds to draw on their phone. Each sketch is scored two ways by an on-device model: **recognizability** (classifier confidence the drawing is a toothbrush) and **divergence** (how far its stroke/shape signature sits from the *group's* mean for this round). Score = recognizability × divergence, so both a scribble (unrecognizable) and the median obvious drawing (not divergent) lose; the sweet spot is unmistakably-a-toothbrush-but-nobody-else-drew-it-that-way. A reveal screen fans out all drawings sorted by divergence, and the round winner explains their logic — which is where the laughs and "wait, THAT's how you draw it?" happen.

## Technical approach
Stack: a static web app (React + WebGL) hosting a tiny local host that serves the room over LAN, or plain WebRTC for peer sync; no server needed. Recognizability uses a pre-trained QuickDraw-style CNN (the Google Quick, Draw! dataset, ~345 classes) exported to TensorFlow.js / ONNX Runtime Web, run on-device. Divergence: each sketch reduced to a fixed feature vector (stroke count, stroke-direction histogram, ink-density grid, bounding-box aspect, a small learned embedding from the CNN's penultimate layer); the round mean is computed across players and divergence = cosine/Euclidean distance to it, normalized. The hard part is making divergence *feel fair* — punishing lazy scribbles without punishing genuinely creative-but-clean drawings — which is pure weight-tuning of the confidence gate. Prompts drawn from the QuickDraw class list so the classifier always has ground truth.

## v1 scope
- Local-room multiplayer, one shared prompt per round, 30s timer
- On-device recognizability from a QuickDraw model
- Divergence from group mean over a handful of cheap features
- Reveal + rank screen, 5-round match, running score

## Out of scope
- Online matchmaking, accounts, persistence
- Cross-culture analytics dashboards or research export
- Custom/user-supplied prompts outside the classifier's classes

## Risks & unknowns
- Divergence scoring may reward degenerate strategies (draw upside-down); needs the confidence gate to bite
- QuickDraw classifier is culturally biased itself (mostly Western data), which is on-theme but skews scores
- 30s + small-model inference on low-end phones may lag

## Done means
Four people in a room draw the same prompt, each sees a recognizability and divergence score, the most-divergent-yet-recognized drawing wins the round, and the reveal screen ranks all four by how unusual they were.
