## Overview
Switchback is a 3-6 player real-time party game where each phone independently steers a small language model, one word at a time, racing to reach a shared destination word first. It's a word-ladder climbed through an LLM's probability tree.

## Problem
Every prior entry in this theme is a text box: write, submit, get scored. None make the model's probability landscape a PLACE you move through. Switchback makes generation interactive — you feel the model resist and then relent as you climb the context toward an absurd target it would never volunteer on its own.

## How it works
Host shows a shared stem ("The night the power went out, ...") and a shared TARGET word ("penguins"). Go. Each phone PRIVATELY sees the model's top-6 next tokens for ITS OWN current path, rendered as tappable chips with probability bars. Tap one -> it appends to your private sentence and the model recomputes your next top-6. You are navigating your own branch of the tree. You win the leg when the TARGET appears among your top-6 and you tap it — you've bent the context until the absurd word became reachable. Budget: 10 taps. The host screen shows only a per-player "distance to summit" meter (the best/lowest surprisal the target word has reached on your path so far), NOT your words. Ranking: reached target (yes/no) -> fewest steps -> lowest surprisal at placement.

What's private vs shared: each phone owns its live top-6 menu and growing sentence, secret until reveal; the host shows the stem, target, and everyone's climbing meters. Five people simultaneously exploring five divergent real-time paths through the same tree IS the race — pass one phone around and it degrades to a turn-based single path.

## Technical approach
distilgpt2 via transformers.js. Cleanest split: run the model ON each phone so per-tap top-6 is low-latency (one forward pass per tap is fine on modern phones), and let the host re-verify final paths authoritatively. Server state: {roomId, stem, target, phase, players:{id:{path:[tokens], steps, bestTargetSurprisal, done}}}. Phones send lightweight progress pings (steps, bestTargetSurprisal) per tap to drive the host meters; the full path is sent on finish for authoritative re-scoring. Sync strategy: paths are per-phone local — only scalar meters aggregate on the host, which sidesteps the usual cross-phone real-time-state nightmare. The genuinely hard part is determinism: on-device first-token load lag, and keeping top-6 identical between phone and host re-verify — pin the same distilgpt2 build, greedy top-K, temperature 0, and one fixed tokenizer.

## v1 scope
- 3-6 players, ONE stem + ONE target, one leg.
- On-device top-6 navigation, 10-tap budget.
- Host distance meters + one named winner.

## Out of scope
- Multiple targets/rounds, score history.
- Semantic proximity scoring (v1: exact top-K appearance only).
- Undo/backtrack (v1 is forward-only, which adds tension).

## Risks & unknowns
- On-device distilgpt2 load/latency on older phones — preload during the lobby.
- Some targets are unreachable in 10 steps from a given stem — hand-pick a reachable stem/target pair.
- Phone vs host top-K divergence — pin build and decode params.

## Done means
Five players each independently tap through top-6 menus on their own phone; the first to surface and select "penguins" within 10 steps is named winner, with host meters updating live within ~500ms of each tap.
