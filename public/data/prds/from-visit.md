## Overview
A local, offline script that reads your browser's history SQLite file and redraws a day of browsing as what it actually was: a small forest of navigation trees, each rooted at something you typed or searched, branching through everything you clicked. For one person, on their own machine, with nothing uploaded.

## Problem
Browser history is presented as a flat reverse-chronological list, which destroys the only structure it has. You cannot see that a 40-minute rabbit hole was one search with 14 dead ends, or that you have searched the same thing five times this quarter because you never wrote the answer down. The structure is *already stored* — Chrome's `visits.from_visit` is a parent pointer to the visit you came from — and no tool draws it.

## How it works
1. Copy the History DB (Chrome holds a lock on the live one).
2. Build a forest: each visit is a node, `from_visit` is its parent; roots are `TYPED`, `AUTO_BOOKMARK`, or orphans.
3. Collapse redirect chains so trees aren't 40% `t.co` and ad-tech hops.
4. Render each tree as a tidy tree, small-multiples across the day. Terminal leaves (nothing followed) are marked — that leaf is usually the thing you were looking for.
5. Overlay "the shortcut": the direct root→terminal path, so you can see the 3 links that mattered out of 22.

## Technical approach
Python 3 + `sqlite3` + `networkx`, emitting one self-contained HTML with D3 (`d3.tree`).

Chrome schema: `visits(id, url, visit_time, from_visit, transition)` joined to `urls(id, url, title)`. Timestamps are microseconds since 1601-01-01 UTC (WebKit epoch) — off-by-369-years bugs are the classic here. `transition` is a bitfield: core type in the low byte (LINK=0, TYPED=1, AUTO_BOOKMARK=2, FORM_SUBMIT=7, RELOAD=8), qualifiers in the high bits (`CHAIN_START` 0x10000000, `CHAIN_END` 0x20000000, `CLIENT_REDIRECT` 0x40000000, `SERVER_REDIRECT` 0x80000000). Redirect collapse = contract any edge whose child carries a redirect qualifier and isn't `CHAIN_END`. Safari's `History.db` has the equivalent via `history_visits.redirect_source`.

The hard part is dwell time. Naive `next_visit_time - visit_time` is garbage under parallel tabs — you opened six tabs at once, so five look instant and one looks like 40 minutes. v1 refuses to guess: nodes are sized by subtree size, and dwell is shown only where a tree is provably serial (single chain, no sibling opened within 2s).

## v1 scope
- Chrome only, one day at a time, CLI flag `--date`
- Redirect collapse + tidy-tree render to one HTML file
- Roots labeled by search query when the root URL is a `?q=` search
- No aggregates, no dwell, no interactivity beyond hover titles

## Out of scope
- A browser extension or anything live
- Firefox/`moz_historyvisits` (has `from_visit` too, but later)
- Cross-device sync, cloud, sharing
- Any judgment about "productivity"

## Risks & unknowns
This file is among the most sensitive on the machine — output must be written to a gitignored path and the README must say so loudly. `from_visit` is 0 for restored sessions and for tabs opened from other apps, which fragments trees into orphan roots; if that's most of your browsing, the viz is thin. Chrome's default retention is 90 days.

## Done means
Run it on yesterday, get ≤15 trees, and be able to point at one and say "that's when I was fixing the printer" from the shape alone, without reading a single URL.
