## Overview
Doubles is a 3–4 player concurrent-room scavenger game where each phone is a private camera. Given one loose prompt ("something round," "something that plugs in"), players fan out and photograph a real object — but the goal is to be the ONLY one who picked that object. Match someone else and you both bust. For groups in a shared physical space who want their phones pointed at the world, not a keyboard.

## Problem
Scavenger/photo party games reward finding the obvious answer. That collapses fun because everyone shoots the same thing. The itch: invert it — obviousness is the trap. The lamp is round, but so is the clock and the mug and the coaster; the skill is silently betting on the *underused* interpretation while four people scan the same room.

## How it works
The host TV shows the prompt and a shared 30-second timer, nothing else during play. Privately, each phone shows: (1) a live viewfinder, (2) a SECRET modifier that narrows the player — e.g. "must be metal" or "must be smaller than your hand" — so the legal objects overlap between players and force reads, and (3) a single SUBMIT-photo capture (one shot, no retakes in v1).

When the timer ends, the server compares all submitted photos for visual similarity. The TV reveals thumbnails simultaneously. Any two photos judged to be the SAME object (high similarity) flash as a collision — both players score zero — while distinct objects that satisfy their private modifier score. Because no phone sees what anyone else is aiming at, and because the secret modifiers push different players toward the same tempting object, the whole game is guessing which round thing nobody else will grab.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server. Data model: `Room{prompt, phase, timer}`, `Player{id, modifier, photoBlob, embedding, verdict}`. Phones capture via `getUserMedia`, downscale to ~256px, upload the blob on submit. Server runs a lightweight image embedding (CLIP-style ONNX, or a perceptual/color+edge hash fallback) and computes pairwise cosine similarity; pairs above a tuned threshold = collision. Sync is simple (submit-then-reveal, no per-frame streaming). Hard part: similarity judgment robust to angle/lighting — two shots of the *same* clock must match while two *different* round things stay apart. Mitigate with a conservative threshold plus a host "override collision" tap for edge calls in v1, and by keeping the room small so the comparison grid is tiny.

## v1 scope
- One prompt, one 30-second round, 3–4 players.
- One capture per phone, no retake.
- One secret modifier per phone from a small deck.
- Pairwise similarity with a single tuned threshold; host manual override for ties.

## Out of scope
- Multi-round scoring, streaks, categories beyond one prompt.
- On-device inference; server does all comparison.
- Cheat prevention against re-shooting or shared screens.

## Risks & unknowns
- Embedding false-positives/negatives across lighting and angle — needs threshold tuning on real room photos.
- Camera permission friction on iOS PWAs.
- Does 30 seconds feel frantic-fun or stressful with only one shot? May need a 45s default.

## Done means
Four phones each capture one object photo privately; on reveal the TV shows all four thumbnails, two shots of the same physical object flash as a collision and score zero for both, four distinct valid objects each score, and the similarity call is correct on a hand-tested set of same-vs-different room pairs (with the host override covering the ambiguous ones).
