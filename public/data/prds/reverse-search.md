## Overview
Reverse Search is a terminal roguelite deckbuilder for developers and terminal power-users. It ingests your real shell history and turns it into a personalized card game: the commands you lean on are your strongest cards, and the way you actually chain them with pipes is your synergy engine.

## Problem
Deckbuilders are fun but generic — the cards mean nothing to you. Meanwhile your shell history is a rich, deeply personal artifact that just scrolls past in Ctrl-R obscurity. Nobody has made the thing you type all day *feel* like a hard-won deck. The itch: I want a game that rewards how *I* actually work, and quietly shows me my own habits.

## How it works
On first run it parses `~/.zsh_history` / `~/.bash_history` / fish history. Each distinct command (`grep`, `jq`, `ffmpeg`, `rg`, `awk`) becomes a card. Frequency sets rarity (your top 5 commands are Legendary). Real pipe *bigrams* — pairs you actually chained, e.g. `find | xargs`, `curl | jq` — become printed synergy links: playing the second card after the first triggers a bonus. Each run you draft a small deck, then face 'the machine': a ladder of stated goals ('emit exactly 100 lines', 'shrink this 4GB dir to under 1GB', 'find the 3 largest files'). You resolve goals by laying down a plausible pipeline; cards have simple simulated verbs (filter/transform/reduce/spawn) that must satisfy the goal's target values. Boss floors are gnarly real one-liners you have to reconstruct. Win the run, unlock 'aliases' (deck slots) and 'dotfile relics' (passive buffs).

## Technical approach
Single Go or Rust TUI binary (Bubble Tea / ratatui). History parser normalizes timestamps and tokenizes on the leading executable + top-level pipes; bigram counts feed a synergy graph (adjacency map). No real command execution — cards carry a small declarative effect model (verb, magnitude, resource cost) so 'battles' are pure arithmetic against goal target vectors, keeping it safe and offline. Content: ~120 hand-authored effect templates keyed by common executables, with a fallback generic card for unknown commands. Daily seed = hash(date) for a shared ladder. The genuinely hard part is fair balance across wildly different histories (a Rust dev vs a data scientist have disjoint decks) — solved by normalizing card power to per-user frequency percentiles rather than absolute counts.

## v1 scope
- Parse zsh history only
- ~40 mapped executables + generic fallback
- 5-floor ladder, 3 goal types, one boss
- Deck of 8, no relics
- Emoji share line of your final pipeline

## Out of scope
- Actually running any command
- Multiplayer / leaderboard
- fish/bash parsers, PowerShell
- Cloud sync

## Risks & unknowns
Privacy (history contains secrets) — must run fully local and redact tokens that look like keys before display. Sparse histories make dull decks; need a graceful bootstrap. Balancing across users is the open question.

## Done means
Pointed at a real `~/.zsh_history`, it produces a playable deck, lets you clear a 5-floor run using pipelines built from your own commands, and prints a shareable summary — with zero commands executed.
