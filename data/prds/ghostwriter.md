## Overview
Ghostwriter is a multiplayer party game where players guess which lines of a real code diff were written by a human versus an AI. One player (the 'coder') submits a mixed diff; the room votes hunk-by-hunk; the coder wins points for every hunk that fools the most people. It's for dev teams, meetups, and anyone amused by Godot banning AI contributions because 'you can't trust heavy AI users to understand their own code.'

## Problem
The industry just declared a line in the sand — human code vs AI code — as if the boundary were obvious. It isn't, and everyone secretly wonders whether they could tell. Code review is also relentlessly passive and solo; there's no shared, competitive way to sharpen the instinct for 'a human wrote this' vs 'this is a plausible hallucination.'

## How it works
A round: the coder picks a small function or bugfix, writes part themselves and generates part with an LLM (or edits an AI draft), then submits the combined diff with a per-hunk secret label. Players see the diff with hunks anonymized and vote HUMAN or AI on each, plus flag the one hunk they think 'hides a bug.' Scoring: voters earn points for correct guesses; the coder earns points inversely — the closer a hunk splits the room (max entropy at 50/50), the more it scores. A bonus 'gotcha' pot goes to anyone who correctly flags a hunk that actually contains a planted bug. Reveal animates the true labels. Turns rotate; the room learns each other's tells.

## Technical approach
Stack: Node + WebSocket (or a tiny Colyseus room) for lobby/voting, React front-end, `diff2html` for rendering, Shiki for syntax highlighting. Diffs parsed into hunks via `parse-diff`; each hunk carries a hidden `author: human|ai` tag. Optional assist: an Anthropic API call using claude-opus-4-8 as a baseline 'detector' the room competes against, and to auto-generate the AI hunks from a prompt (temperature varied per round for style diversity). Data model: Round{diffId, hunks[{id, author, hasBug}]}, Vote{playerId, hunkId, guess, flaggedBug}. Scoring uses vote entropy per hunk (Shannon) to reward convincing bluffs. Hard part: sourcing genuinely ambiguous hunks — trivial code is a coin flip, so the game needs prompts that push both human and AI toward the tricky middle, plus anti-metadata scrubbing (comment style, variable naming) so players judge substance not fingerprints.

## v1 scope
- Hot-seat local mode: one screen, one diff, players vote on paper or pass the laptop
- Paste a diff + mark each hunk's true author manually
- Reveal screen with per-hunk vote tally and entropy-based scores

## Out of scope
- Networked multiplayer rooms, accounts
- Auto-generating AI hunks via API, the LLM 'detector' opponent
- Bug-planting/flag mechanic

## Risks & unknowns
- Hunks may be too easy or too random to be fun
- Style metadata leaks the answer unless scrubbed
- Needs a steady supply of good diffs to stay fresh

## Done means
Load a real 4-hunk diff with hidden author labels, three people vote on each hunk, and the reveal screen shows correct/incorrect tallies plus a coder score that's highest for the hunk that split the room most evenly.
