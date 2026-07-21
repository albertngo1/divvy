## Overview
A once-a-day browser puzzle that gamifies the exact skill AlphaOracle automates: reading oracle-bone script (甲骨文). Each day you get one ancient glyph and reconstruct its evolutionary chain to identify the modern character. For language nerds, Chinese learners, and anyone who liked the etymology rabbit holes of Wordle-adjacent daily games.

## Problem
Chinese character etymology is gorgeous and almost never made playable — it lives in dense reference works and academic corpora that a casual person can't touch. Meanwhile the raw material (glyph-evolution datasets, oracle-bone image sets) is cheap and open. That's an arbitrage: turn a scholarly dataset into a two-minute daily delight, and quietly teach real paleography as a side effect.

## How it works
1. You're shown the oracle-bone form of a character (e.g. the pictograph of a person, sun, or horse).
2. A horizontal "evolution track" has empty slots for later script stages (bronze/金文 → seal/篆书 → clerical/隶书 → modern).
3. Each guess, you pick the correct next-stage glyph from a small candidate set (distractors are visually plausible neighbors). Correct picks reveal the stage and nudge you toward the answer.
4. Final step: type or select the modern character + its meaning. Score = fewer wrong picks. Wordle-style spoiler-free emoji share (🦴 for the bone, ✅/❌ per stage) and a global daily leaderboard.

## Technical approach
Static frontend (Svelte/vanilla), no backend needed for core play — the day's puzzle is a signed JSON blob served from a CDN, seeded by date so everyone gets the same glyph. Data: assemble from open oracle-bone / glyph-evolution datasets (e.g. HWOBC-style oracle image sets on GitHub, Wikimedia's ancient-script SVGs, and the CHISE / 漢字データベース character-component data) into a puzzle table: `char → {oracle_img, bronze_img, seal_img, clerical_img, modern, gloss, distractor_ids}`. Glyph images stored as SVG where available, PNG otherwise. Distractor selection: pick same-radical or visually similar glyphs via a precomputed component-overlap score so wrong answers are tempting, not random. Leaderboard is a tiny serverless KV (Cloudflare Workers + KV) storing `date → sorted scores`. The genuinely hard part is *curation quality*: verifying each evolution chain is scholarly-correct (not folk etymology) and licensing the glyph imagery cleanly — get this wrong and you're teaching people false history.

## v1 scope
- 30 hand-verified characters (one month of daily puzzles).
- Single evolution stage to guess (oracle → modern), no full track.
- Multiple-choice guessing, 4 candidates.
- Emoji share string; no leaderboard yet.

## Out of scope
- User accounts / streak tracking.
- Full four-stage evolution track (v2).
- Any AI decipherment of *undeciphered* glyphs (that's the research paper's job, not the game's).
- Non-Chinese scripts.

## Risks & unknowns
- Glyph-image licensing is a minefield; may need to redraw SVGs.
- Etymology disputes — some evolution chains are contested; need a scholarly source of truth.
- Difficulty tuning: without hints it may be impossibly hard for non-readers.

## Done means
A player can load the site, get today's oracle-bone glyph, make four multiple-choice guesses to identify the modern character with its meaning, and copy a spoiler-free emoji result — and every character shown links to a citation for its evolution chain.
