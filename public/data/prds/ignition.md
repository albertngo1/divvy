## Overview
Ignition is a 3–8 player couch/remote party game built on Anthropic's 'global workspace in language models' idea: a limited shared broadcast channel that specialist modules compete to get onto. Here the modules are your friends, the workspace is a shared screen, and the bottleneck is the whole game.

## Problem
Most party games are either trivia or social deduction. The global-workspace research paper on HN describes something more interesting as a *mechanic*: many parallel holders of information, a tiny channel, and 'ignition' — the moment one piece wins the broadcast and becomes globally available. That's an unused cooperative-tension mechanic. Nobody's turned a consciousness theory into a Jackbox game.

## How it works
Each round the group must solve one puzzle (assemble a phrase, order events, deduce a target). The catch: the solution needs clues that are split across players' phones, and the shared screen — the workspace — holds only K=3 broadcast slots. On your turn you can broadcast one of your private clues into the workspace, but if it's full you must evict an existing one, which is then *gone for the round*. Players can't show phones or free-talk; they coordinate only through what's on the shared workspace and a limited emoji back-channel. Solve before the slot-swaps run out to score. It rewards deciding whose fragment actually deserves the scarce channel — real 'ignition' pressure.

## Technical approach
Node + socket.io, room codes, one shared-display client (TV/laptop) and phone controllers as web clients — no installs, like Jackbox. Server holds authoritative game state: per-player clue decks, the K-slot workspace, eviction log, and a puzzle validator. Puzzles are authored as JSON: a target, a set of atomic clues distributed across players, and a solve-check function (set membership / ordering / string match). The hard part is puzzle design — clues must be individually insufficient, jointly sufficient, and create genuine agony about which to evict; too easy and the bottleneck is irrelevant, too hard and it's noise. Ship a small hand-authored puzzle pack and a difficulty knob (K slots, back-channel richness).

## v1 scope
- Room join via code, shared screen + phone controllers
- One puzzle type (assemble a 4-word phrase from 8 split clues)
- K=3 workspace with evict-to-broadcast + eviction is permanent
- 10 hand-authored puzzles, cooperative score + timer

## Out of scope
- Matchmaking, accounts, persistence
- Competitive/traitor variants
- Procedural puzzle generation

## Risks & unknowns
- Might be more clever than fun; the bottleneck could just frustrate
- Balancing the emoji back-channel so it's coordination, not a loophole
- Puzzle authoring is the real cost and doesn't scale for free

## Done means
Four people on four phones plus a shared screen finish a full round: clues split, at least one forced eviction happens, and they either solve the phrase before slot-swaps run out or fail — with the workspace state consistent across all clients.
