## Overview
Misuse is a local, one-phone party game built on the classic Alternate Uses Test and the "creativity from friction" idea: name unusual uses for an everyday object and score by out-thinking a small on-device language model. For 3-6 players who are bored of charades and want the AI to be an opponent, not a judge.

## Problem
AI-scored creativity games are almost always "rate my originality 1-10," which is dull and gameable — the model just rewards its own priors. Party word games, meanwhile, have gone stale. The fresh move is to make the model's *predictability* the thing you fight against: you win by being creative in the specific ways the machine failed to anticipate.

## How it works
Each round shows an everyday object ("a brick," "a paperclip"). Before anyone answers, a small LLM secretly pre-generates its top-K "obvious unusual uses." Players then secretly type one unusual use. Scoring rewards answers that are (a) semantically *distant* from the AI's predicted set, (b) distant from other players' answers, yet (c) still judged plausible/coherent. So gibberish loses, obvious cleverness loses, and the sweet spot is the genuinely surprising-but-sensible answer. Pass the phone, reveal all answers ranked, laugh, next round.

## Technical approach
Browser app, fully offline after load. A small instruct model via transformers.js / WebGPU generates the prediction set and (v2) the plausibility gate. Answers and predictions are embedded with a MiniLM sentence-transformer; scoring is a weighted combination of cosine distance from the AI set and from peers, gated by a coherence check. Hard part: calibrating "surprising yet coherent" so the score rewards wit rather than randomness, cheaply enough to run on a phone in a few seconds per round.

## v1 scope
- One-phone hotseat, 3 rounds
- 20 bundled objects
- Embedding-distance scoring only (skip the LLM plausibility gate)
- Simple ranked reveal screen

## Out of scope
- Online multiplayer / rooms
- The LLM coherence gate (v2)
- Custom / user-supplied objects
- Persistent accounts or leaderboards

## Risks & unknowns
- On-device model + embedding latency between rounds
- Without the coherence gate, scoring may reward nonsense that's merely distant
- Fun hinges entirely on scoring calibration feeling "right"

## Done means
Three players on one phone play a full round on a bundled object and receive differentiated scores that visibly reward odd-but-sensible answers over both obvious and nonsensical ones.
