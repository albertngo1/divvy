## Overview
A CLI + GitHub Action (with a browser guessing-game as the fun front door) that detects likely AI-authored code by reading the steganographic marks assistants embed, plus statistical tells. For maintainers — Godot being the topical example — who want a signal on AI contributions, and for players who enjoy guessing human-vs-AI.

## Problem
Two front-page items collide: Godot announced it won't accept AI-authored contributions but has no reliable way to detect them, while Claude Code is reported to steganographically mark requests with invisible characters. Bridge the two: if the watermark is really there, a maintainer should be able to read it.

## How it works
Two modes. (1) `zerowidth scan <diff>`: over added lines, flag zero-width unicode (U+200B/C/D, U+FEFF BOM, variation selectors), homoglyph substitutions, and suspicious trailing-whitespace codebooks; decode any embedded payload; emit a GitHub Actions annotation at the exact line/col. (2) Game: show a function, player bets human or AI, reveal highlights the hidden marks and shows the statistical score — so people *feel* how invisible the tell is.

## Technical approach
Core detector in TypeScript. Zero-width detection = codepoint regex + an entropy check (real code has ~0 invisible chars, so any cluster is loud). Homoglyph detection against the Unicode TR39 confusables table. Statistical tells: comment-to-code ratio, docstring-boilerplate n-grams, identifier verbosity, suspiciously perfect formatting — a small logistic-regression classifier trained on labeled human (pre-2022 commits) vs AI corpora. A thin GitHub Action wraps the CLI and posts inline annotations. Game UI: React + Monaco, rendering invisible chars as visible glyphs. The hard part is honesty: statistical detection is unreliable, so the deterministic watermark layer is the *only* confident signal and statistics must be surfaced as "suspicion, not proof."

## v1 scope
- Zero-width + BOM + variation-selector detection over a pasted snippet
- Decode simple embedded payloads
- Single-file CLI, JSON + human output

## Out of scope
- The logistic-regression classifier
- Full GitHub App / bot
- Homoglyph confusables table
- The guessing game (v2)

## Risks & unknowns
- False accusations do real harm — framing must stay heuristic
- Watermarks are trivially stripped, so *absence* proves nothing
- Vendors can change or drop their marking scheme anytime

## Done means
Paste a snippet containing zero-width characters and the tool lists each character, its codepoint, line/col, and any decoded payload; a clean snippet returns a clear "no marks found."
