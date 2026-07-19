## Overview
Kink is a fast, competitive party wordgame for 3-6 players: a shared host screen shows one deliberately bland sentence, and each phone privately performs a single-word swap to blow up the model's perplexity as much as possible while staying a real, plausible sentence. The scoring engine is a small in-browser LLM's surprise — specifically the *delta* it produces.

## Problem
Every perplexity game so far pulls toward blandness (minimize) or fills empty blanks with surprising words. None is about the DELTA — the single most destructive *legal* edit to an already-smooth line. That's a distinct, gleeful skill: finding the one word that reads fine to a human but makes the model recoil.

## How it works
The host TV shows one bland, low-perplexity sentence, e.g. `The tired man opened the front door and went inside.` Each phone shows the SAME sentence with tappable words; you secretly tap exactly ONE word and type a replacement real English word. Everyone does this simultaneously and blind. The host swaps each player's edit into a private copy, scores each with distilgpt2, and your score = perplexity(edited) − perplexity(original): the biggest jump wins. A light gate keeps it honest — each edited sentence gets a quick blind plausibility thumbs from the other phones (or a dictionary/grammar check), so pure garbage (`opened the front asdf`) is disqualified. The art is a genuine word that detonates. The TV then reveals every edited sentence ranked by spike with each landmine word highlighted, and phones privately guess who authored the single biggest spike for a bonus.

Private per phone: which word you targeted, your replacement, your plausibility votes, your author-guess. Shared: the base sentence and the ranked reveal. Simultaneous secret edits on one shared sentence can't be reproduced by a passed phone.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). distilgpt2 via transformers.js on the host runs N small forward passes (one per player variant). Data model: `Room{baseSentence, tokens[], phase}`, `Player{id, targetIndex, replacement, votes, guess}`. Sync: one fill barrier, then an optional plausibility/vote barrier. The hard part is the plausibility gate — a cheap grammar/frequency heuristic vs. a human vote — and blocking degenerate spikes (rare proper nouns, OOV tokens) so the win goes to craft, not to typing the weirdest string.

## v1 scope
- One hand-authored base sentence, 3-4 players, one edit each, one round
- Host-side distilgpt2 scoring, ranked reveal
- No persistent scoreboard

## Out of scope
- Multi-round play, part-of-speech enforcement, multi-word edits, mobile host

## Risks & unknowns
- Degenerate strategy: any rare word spikes perplexity → cap by word frequency / restrict to common lowercase dictionary words.
- Plausibility voting drags with few players — consider an automatic grammar gate for v1.
- Perplexity delta is noisy; keep the base sentence very smooth so real edits dominate.

## Done means
Three phones each secretly swap one word into the shared bland sentence; the host ranks all variants by perplexity jump, disqualifies non-words, and names the winner.
