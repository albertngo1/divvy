## Overview

Column Inch is a small local web app for one person studying one hard thing (a certification, a language's grammar, ML fundamentals, a new codebase's invariants). It compiles your notes into a single printable page under a hard area budget, and that budget shrinks every week. Aimed at self-teachers who already know that *making* the cheat sheet is where the learning happens, and that the sheet itself is a byproduct.

## Problem

Spaced repetition tools grow monotonically — every card you add is permanent debt, and the deck becomes a chore you resent. But the cheat-sheet effect works the other way: value comes from the painful triage of deciding what earns space. Nobody has built a tool where the *constraint tightens* over time, and nobody closes the loop between "I removed this from my sheet" and "do I actually still know it."

## How it works

- You write entries in a flat markdown file: each `##` block is one entry (a formula, a rule, a gotcha, a command).
- The app compiles all entries to a single page in a fixed layout and reports **overflow** in square millimeters. If it overflows, you must cut.
- Every Monday, the usable page area shrinks 3%. You get an eviction session: the app proposes the N lowest-value entries by an estimated value/area ratio, you decide.
- **The recall gate.** Anything you evict enters a 3-week probation queue. At 3, 10, and 21 days it asks you to reproduce the evicted entry from memory (free recall, self-graded, plus a fuzzy-match hint). Pass all three and it is *retired* — permanently deleted, marked "learned." Fail any and it comes back onto the sheet, which means something else has to go.
- The header of every printed sheet shows: current area, weeks elapsed, entries retired, entries resurrected. That line is the actual progress metric.

## Technical approach

Typst as the layout engine — it compiles in tens of milliseconds, is scriptable, and `typst compile --format svg` plus its query API lets you measure real content extents rather than guessing. Page budget is enforced by shrinking a `#block(width:, height:)` container and detecting overflow. Backend: FastAPI + SQLite (`entries(id, md, area_mm2, added_at, state)`, `probation(entry_id, due_at, attempt, result)`). Frontend: plain HTMX, no build step.

Two interesting algorithmic bits. First, **area cost** must be measured per entry, not estimated — render each entry alone in a fixed-width column and record its height; that gives a real mm² cost. Second, **eviction ranking** is a knapsack: maximize retained value subject to area, where value = (self-rated importance) × (1 − estimated recall probability), with recall probability from a simple FSRS-style memory model over your probation history. The hard part is honesty: free recall is self-graded, so the gate is only as good as the user, and the tool must make lying feel like cheating at solitaire (it shows you the resurrection count, prominently).

## v1 scope

- One markdown file, one topic, one page
- Compile-and-report overflow; manual cut, no ranking suggestions
- Weekly shrink as a cron entry, hardcoded 3%
- Probation queue with a single check at 10 days
- "Print" = open the PDF

## Out of scope

Multiple topics, images/diagrams in entries, mobile, sharing, LLM-generated entries, importing from Anki.

## Risks & unknowns

The shrink rate is a guess — 3%/week means half the page is gone in 23 weeks, which may be brutal or trivial depending on the domain. Self-graded free recall is the weakest link. Some knowledge genuinely belongs on a permanent reference sheet and should never be evicted; needs a pin mechanism, and if too many things get pinned the whole mechanic collapses.

## Done means

After eight weeks of real use on one topic, the page area is measurably ~21% smaller, at least five entries have been retired through the recall gate, and the user still prints and uses the current sheet.
