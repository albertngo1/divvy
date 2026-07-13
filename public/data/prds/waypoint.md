## Overview
Waypoint is a 3-6 player game where the room co-writes a single sentence by voting, turn by turn, among a tiny model's own next-word suggestions — while each player secretly tries to smuggle their assigned target word into the finished sentence and hide that they were steering. It's Contact-meets-autocomplete, with the model's live probability distribution as the board.

## Problem
Entropy games usually score finished text. Nobody has made the model's *autoregressive step* interactive — where the only legal moves are the model's own top candidates, so steering toward a rare target means fighting the model's low-entropy pull in front of everyone. That tension (nudge without being caught) is untapped.

## How it works
The host TV shows the sentence-so-far and, each turn, the model's top-5 next tokens as unlabeled-by-probability chips, plus an ~8-second timer. Each phone PRIVATELY shows the same five chips as tap buttons AND a secret TARGET WORD assigned only to that player (e.g. "anchor", "dog", "forever"). You privately tap one chip per turn; the server appends the plurality winner (ties broken by model rank) and advances. Over ~10 turns a sentence forms. Because you can only vote among the model's suggestions, forcing your word in means waiting for the model to float it — or building context so it becomes likely.

Scoring has two private layers. First, +points if your target word (or a clear inflection) appears. Second, a deduction phase: the host shows the finished sentence, and every phone PRIVATELY assigns each other player to a suspected target word chosen from the sentence's notable words. You earn for correctly fingering others AND for nobody fingering you — so the best play lands your word while looking like an innocent bystander. The sentence's total perplexity sets a shared bonus pot split among winners, rewarding a coherent result.

## Technical approach
Host tab runs transformers.js + distilgpt2, computing top-5 next tokens each turn (one forward pass, sub-second). Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{sentenceTokens[], phase, turnDeadline, candidates[5]}; Player{id, targetWord, currentVote, guesses{}}. Sync: server opens a turn, broadcasts candidates, collects one private vote per phone before deadline (late/no vote = abstain), commits the winner, requests next top-5 from host, loops. The hard part is fair simultaneity: votes must stay hidden until commit (no live tallies leaking who's steering), and the host inference + vote collection must interleave without stalling the 8-second cadence — so the server pre-requests the next candidate set speculatively.

## v1 scope
- One sentence, ~10 turns, 3-6 players
- Top-5 candidates per turn from distilgpt2
- One secret target word per player from a curated list
- Single blind deduction round + perplexity pot split

## Out of scope
- Multiple sentences / match play
- Adjustable model temperature or top-k size
- Chat, reactions, spectators

## Risks & unknowns
- Model's top-5 may be too bland to ever surface a target — needs a curated, model-reachable word list
- 8-second cadence with per-turn inference may feel slow or rushed; tune empirically
- Deduction may be trivial if targets are obvious; may need decoy words

## Done means
Five phones each hold a distinct secret target, cast hidden per-turn votes that build one visible sentence, and a reveal scores both smuggling and deduction — and because votes and targets are private and simultaneous, a single shared phone cannot play it, proving the per-phone architecture is load-bearing.
