## Overview
A daily hexagonal word puzzle, plus the constraint solver that generates it. On a hex board, every maximal line in all three axis directions must spell a dictionary word — a 19-cell order-3 hex packs 15 interlocking words. For crossword and word-square people who have run out of hard things.

## Problem
Word squares have been stuck at two axes since the Victorians. Hex grids add a third, which multiplies constraints per cell from 2 to 3 and makes the search genuinely nasty — which is exactly why nobody has shipped the puzzle. Nobody has published one because generating it is the whole project.

## How it works
You get a hex of order n with roughly 40% of cells pre-filled. Type letters; a line glows green when it spells a valid word and red when its remaining cells can no longer complete one, so you get gradient feedback instead of a binary right/wrong at the end. The pleasure is the three-way lock: setting a letter to fix a row breaks a diagonal you'd already solved. One puzzle a day, one order-2 warmup and one order-3 hard.

## How it works technically
Generator in Rust, board in TypeScript/SVG. Lexicon: ENABLE intersected with the top ~60k tokens by Google Books n-gram frequency, so solutions don't lean on obscure Scrabble filler. One DAWG per word length. Each cell's domain is a 26-bit mask; propagation is AC-3-style, where a line's allowed letters at position i come from intersecting DAWG traversals prefix-forward and suffix-backward. Cell ordering is most-constrained-first, so cells sitting at the intersection of three long lines get assigned early. Symmetry breaking over the hex dihedral group (12 elements) prevents the generator from emitting the same board rotated. Solutions are precomputed offline into a corpus; puzzles are then made by removing given cells one at a time while a uniqueness check — a bounded re-solve that stops at two solutions — still passes.

The hard part is feasibility. Order-3 requires lines of length 3,4,5,4,3 in each of three directions and may be vanishingly rare with a clean lexicon; the honest plan is to measure solution density at order-2 first and only promise order-3 if the corpus fills. Uniqueness checking is a second full search per removed cell, so puzzle-making costs far more than solving.

## v1 scope
- Order-2 only (7 cells, 9 words of length 2 and 3)
- Generator dumps solutions to JSON, run by hand
- Static SVG board, keyboard entry, live per-line validation
- One hardcoded puzzle, no dailies

## Out of scope
Streaks, timers, hints, accounts, sharing images, mobile app, order-4.

## Risks & unknowns
Solution scarcity at order-3. Two-letter words are ugly and may make order-2 feel cheap. It might turn out that three-way constraints make the puzzle feel arbitrary rather than clever — worth playtesting before building the daily pipeline.

## Done means
The generator emits at least 100 structurally distinct order-2 solutions from the 60k lexicon in under 60 seconds, and the web board validates all three axes live as you type.
