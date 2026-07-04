## Overview

A prompt appears on every phone at once ("a color that isn't in a rainbow", "a word your mom would use", "a fruit no one's picked yet"). Everyone types one word simultaneously; nobody sees anyone else's answer until reveal. Score = size of the cluster your answer landed in. If 5 of 6 people typed "mauve" and you did too, you score 5. If you were the only "chartreuse", you score 1. Rewards thinking like the group, not thinking clever. Per-phone is essential: simultaneous private input, revealed together, is impossible on a shared screen.

## Problem

Trivia rewards being right; creativity games reward being unique. There's a fun middle: rewards being *predictable in a room-specific way*. It's Family Feud inverted — the answer isn't public, it's whatever this specific group of 6 friends converges on. Requires per-phone simultaneous private answers with a synchronized reveal — a genre defined by the architecture.

## How it works

Room code join, 3-8 players. Server posts a prompt to all phones simultaneously with a 15s timer. Everyone types one word. On timer expiry (or when all submitted), server clusters answers (exact match, case-insensitive, whitespace-trimmed; optional light normalization via stem match). Reveal screen shows each cluster with the players who landed in it. Score = cluster size for each player. Repeat 8 rounds. Highest total wins.

## Technical approach

PartyKit or Socket.IO. Room state = `{round, prompt, answers: {player_id: word}, cluster_view, scores}`. Answers hidden until reveal phase; server buffers all inputs then broadcasts the reveal payload atomically. Prompts drawn from a hand-authored library (~100 prompts, tagged by category). Clustering = normalize (lowercase + trim + optional Porter stemmer) → group identical strings. No LLM in v1 for clustering — exact-ish match keeps it deterministic and understandable to players.

## v1 scope

8 rounds per game, 3-6 players, 100 hand-authored prompts, one prompt per round (random from unseen pool). 15s per round for typing, 10s reveal. Score = cluster size, cumulative across rounds. No LLM clustering, no synonym merging beyond stem match, no custom prompts, no rounds-per-game customization.

## Out of scope

LLM-driven semantic clustering (e.g. "mauve" ≈ "purple"), custom prompt submission, per-category prompt selection, spectator mode, replays, teams mode, timed streak bonuses.

## Risks & unknowns

Clustering strictness is a knob: too strict ("Red" ≠ "red" ≠ "reds") frustrates; too loose ("red" ≈ "crimson") loses the "did I actually think what you thought" spark. Stem-match may be enough or may be too aggressive. Second risk: prompt quality — bland prompts converge to nothing interesting; too-clever prompts frustrate. 100-prompt library needs curation. Third: 6-player groups form thicker clusters than 3-player groups, so scoring may not compare well across group sizes — probably fine for a party game.

## Done means

4 friends play 8 rounds. At least one round has a 4-way tie on some hilarious answer. At least one round has everyone in a different cluster and someone laughs "we do not know each other at all".
