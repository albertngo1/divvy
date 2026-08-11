## Overview

Short of E is a writing game played on a simulated California job case: a finite inventory of metal sorts, distributed by the real historical counts printers used. You compose text into a fixed-measure line, and the case depletes as you set. Run out of a letter and you must reword — or spend a turn *distributing* earlier text back into the case. For people who like constrained writing (Oulipo, lipograms, Wordle-adjacent daily games) and, secondarily, for working letterpress printers who currently figure out "do I have enough sorts for this broadside" by hand.

## Problem

Every constrained-writing game constrains *which letters you may use*. None constrain *how many you have left*, which is the constraint real compositors actually lived under — the one that put "out of sorts" into English. It produces a completely different kind of thinking: your sixth paragraph is shaped by the vowels your first paragraph is still holding hostage, and revision has a literal cost.

## How it works

You get a daily prompt and a case. Type into a composing stick with a fixed measure (say 24 ems). The case panel shows every sort's remaining count, reddening as it drains. Justification is not free: filling a short line consumes em-quads, en-quads, and 3-to-em spaces from a separate finite box, so a line you can *almost* fill may be unsettable. When you're stuck you can Distribute — select earlier text, and those sorts return to the case after a one-turn delay (historically, distribution was the apprentice's slow job). Score is total words successfully set before the case is unusable. A ligature bonus: `fi`, `fl`, `ffi` exist as single sorts and dodge the `f` shortage. Optional Cruel Mode uses an 18th-century case with no `j`, no `u`, and a long `s`.

## Technical approach

Static site, no backend for v1. Data model: `case = Map<sort, count>` seeded from published font schemes (the per-100-weight sort tables in ATF and Monotype specimen books; `e` runs roughly 12× `k`, `z` is nearly absent). Setting is a pure reducer over `(case, lines)` — typing decrements, backspace inside the current line refunds immediately, Distribute queues a refund. Line feasibility is a small constrained fill: given the measure minus set width (each sort has a real set-width in units of the em), can the remaining gap be tiled by the available quad and space denominations? That's a bounded coin-change over a handful of denominations, solved exactly with a DP under 200 states, and it's what makes "I can't set this line, and it's the *spaces* I'm out of" legible instead of mysterious. Daily seed = date hash choosing prompt plus case size, so everyone shares a case. Printer mode inverts the whole thing: paste text, get the sorts-needed table and the shortfall against a case inventory you enter once.

## v1 scope

- One case (a modern Roman scheme), one measure, one daily prompt
- Live sort counter with red-shift
- Distribute with a one-turn delay
- Shareable emoji-grid result: which five letters you exhausted

## Out of scope

Multiple typefaces and sizes, kerning/set-width perfection, physical imposition, printer inventory mode, accounts.

## Risks & unknowns

May be merely tedious rather than tense — the fun depends on the case being sized so you hit the wall around 120 words, which needs playtest tuning. Space-box exhaustion could be too opaque to be fair. The daily-game format is crowded.

## Done means

A player writes a paragraph, hits an `e` shortage, visibly rewrites a sentence to dodge it, and their shared result shows a different exhausted-letter set than a friend's from the same case.
