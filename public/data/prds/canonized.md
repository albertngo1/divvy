## Overview
A short solo browser game about bureaucratic permanence. You transcribe degraded handwritten Japanese place-name cards into a national character set under a clock and a daily quota. When a card shows something not in the set, you may propose a new character — and the proposal is always accepted. Your inventions then propagate through the game's world for the next twenty simulated years. For people who liked the ghost-character story and want to feel personally responsible for one.

## Problem
Standards absorb mistakes and then defend them. That is a wonderful, deeply funny idea and it is only ever told as an anecdote. Nobody has made the reader *cause* it. Games about transcription exist (Papers, Please's descendants) but they punish errors immediately; the actual horror of standards work is that nothing punishes you and the error survives you.

## How it works
1. A shift is a stack of ~15 cards. Each card renders a real kanji, degraded: ink bleed, fax scanlines, a torn corner, a coffee ring.
2. For each card, either match it to a code point from the on-screen registry (searchable by radical, like a real 1978 clerk's index) or press PROPOSE.
3. Proposing opens a composer: choose radicals and a layout (left-right, top-bottom, enclosure) and the glyph is drawn from real stroke data. It gets a code point. It is now permanent.
4. Quota pressure is the whole design. Matching a smudged character correctly is slow; proposing is fast and always "succeeds."
5. Later shifts sample from a document pool that now includes your ghosts — on ID cards, land transfers, a 1990 hospital form. You must handle them, and you cannot un-invent them.
6. Endgame: a 2010 "roundtrip" shift where a foreign standards body asks you to justify each character you created. The score screen is a spectre report — every ghost, its usage count, and the one real character it was almost certainly a misreading of.

## Technical approach
Vanilla TypeScript + canvas, no engine. Character corpus from KANJIDIC2 (frequency, radicals, readings) with stroke geometry from KanjiVG SVG paths, which is also what makes the composer possible — ghosts are drawn from real component paths, so an invented glyph looks plausibly like a character rather than a font fallback box. Degradation pipeline: render strokes to an offscreen canvas, then apply seeded noise (morphological dilate for ink bleed, a 1-bit dither pass for fax, per-row jitter for scanlines). The confusion set for each card — the wrong candidates the registry search surfaces — is precomputed offline by radical-set Jaccard similarity combined with rendered-bitmap IoU, so the near-misses are genuinely near. Propagation model: each accepted ghost is seeded into a document generator with a growth curve, so a ghost created in shift 2 shows up in far more later documents than one created in shift 6. Whole run is deterministic from a seed, which makes a shareable end-card possible.

## v1 scope
- Three shifts, 15 cards each, one degradation style
- Registry search by radical only
- Propose = pick two radicals + one layout
- One later shift that re-shows your ghosts
- Text-only spectre report

## Out of scope
- Handwriting recognition or drawing your own strokes
- Story branches, characters, dialogue trees
- Any non-Japanese script

## Risks & unknowns
Transcription is inherently tedious; the quota timer has to make it tense rather than annoying. Players unfamiliar with kanji may find radical search opaque — needs a strong first-shift tutorial or a romaji-hint crutch. KanjiVG is CC-BY-SA, so attribution and license compatibility need checking before shipping.

## Done means
A playtester with no Japanese knowledge finishes a run in under twelve minutes, creates at least one ghost character without being told to, and at the spectre report can name the real character their ghost was a misreading of.
