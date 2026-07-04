# Autocomplete

## Overview
Party version of the surprisal-scored word game. A shared sentence prompt appears on every phone ("The quick brown fox..."); each player privately types a completion; the sentence is scored by a small in-browser LLM's *log-perplexity* on each completion — coherent-but-unpredictable wins. The LLM isn't decoration; it *is* the scoring engine, and it lives in the browser so the game runs zero-cost after page load. Related to the existing Divvy solo "Off Script" idea but reshaped for concurrent-room simultaneous play with LLM-scored ranking.

## Problem
Existing word-game party formats (Fibbage, Blank Slate, Just One) all use human judgment as scoring — audience laughs, group votes, matches count. Nobody has built a party game where an LLM's confidence itself is the win condition. This creates a genuinely new payoff: you're not trying to guess what your friends will write; you're trying to write something the LLM finds coherent but *didn't expect*. Per-phone is load-bearing because each player must privately submit before anyone reveals — knowing others' completions collapses the surprise floor.

## How it works
Room code join, 3-8 players. Round: a sentence stem appears ("Every Thanksgiving, my uncle insists on..."). All players type a completion privately (30s timer). On reveal, all completions display simultaneously; a small in-browser LLM (transformers.js Distilbert or GPT-2-small) computes log-perplexity for each completion given the stem. Ranking: lowest perplexity that's *above a "boring" floor* wins. If your completion was too predictable (below floor: "eat turkey"), scored 0. If it was too incoherent (way above ceiling: "ferrets"), scored 0. Sweet spot is "coherent but surprising" — the LLM's mid-range surprisal. 5 rounds, high total wins.

## Technical approach
PartyKit or homelab Socket.IO for room state. transformers.js loads a ~30MB LLM model (Distilbert-small or gpt2-tiny) into each phone's browser on join — this is the biggest load-time cost. Scoring runs client-side (each phone independently scores everyone's completions, so no server LLM cost). Room state = `{stem, completions: {player_id: text}, scores: {}, round}`. When each player submits their completion, it stays private until the reveal event. On reveal, all phones receive all completions and each computes perplexity locally; server takes the median of all clients' scores (guards against tampering). Sentence stems hand-authored (~50 for v1) or Haiku-generated on demand.

## v1 scope
3-5 rounds, 3-6 players, 30 hand-authored sentence stems, single fixed LLM model (transformers.js distilbert-base loaded once). Perplexity floor + ceiling fixed. Score = sum across rounds. No leaderboard, no adjustable difficulty, no theme selection. Loading screen while LLM downloads.

## Out of scope
Haiku-generated stems (use hand-authored), per-player difficulty modes, multiple LLM models to choose from, historical stats, LLM personality selection ("score like a poet" vs "score like an engineer"), tournament mode, spectator perplexity heatmap.

## Risks & unknowns
30MB LLM download on join is real friction for phones on cellular data — v1 must download only once and cache aggressively (Service Worker). Older Android phones may not have enough RAM/GPU to run transformers.js smoothly; fallback = server-side scoring via a Haiku call ($.001/round) if client-side fails. The perplexity floor/ceiling tuning is the whole game's fun — bad thresholds will make it feel arbitrary. Playtest question: do players actually enjoy trying to beat an LLM, or does it feel like homework? The unlock is when someone writes an obviously-clever completion and the LLM ranks it high — that "yes, the machine noticed" moment.

## Done means
4 friends open the room, LLM downloads and loads on each phone (< 20s on wifi), play 3 rounds with 5 stems each; at least one completion gets a shocked "OH THAT'S GOOD" reaction paired with a high LLM score. If someone tries to game the scoring by typing gibberish that happens to score well, v1 shipped.
