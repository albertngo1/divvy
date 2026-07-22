## Overview
A Wordle-shaped daily for readers. Each day you're shown one page (or a tight excerpt) from a book and a set of candidate sentences. Your job: pick the line that got the *most* reader highlights. Passive reading — the quiet, invisible act of underlining a line that hit you — becomes a competitive read of the collective mind.

## Problem
Reading is the most solitary hobby that isn't actually solitary: millions of people highlight the same lines, and that aggregate taste is real and interesting, but it's locked inside Kindle and never surfaced as anything you can play. FreeInk and the open-e-reader momentum say readers want their reading life to be theirs — and to be social — without a walled garden. There's no daily ritual that makes reading feel like a shared game the way NYT Games did for words.

## How it works
- One puzzle per day, date-seeded so everyone gets the same book and page.
- The page renders with ~4–6 candidate sentences subtly selectable.
- You get one guess. Score = how close your pick's true highlight-rank is to #1 (exact match = 100, then decaying).
- Reveal shows the real "popular highlights" heat overlay on the page, the % who chose each line, and a shareable spoiler-free emoji strip (📖🟩⬜⬜).
- Streaks, a global daily distribution, and a "genre affinity" stat that learns whether you read like a literary-fiction crowd or a self-help crowd.

## Technical approach
Stack: static-ish frontend (SvelteKit) + a small edge function for daily seed and score submission; Postgres for puzzles and aggregate stats. Ground truth = Kindle **popular highlights** ("1,204 highlighters"), which are publicly visible on many Amazon book pages and via reader exports; scraped into a `highlights(book_id, sentence, count, rank)` table. To stay clear of copyright, v1 favors public-domain classics (Gutenberg text) that *also* carry Kindle popular-highlight counts, so we can legally show full pages. Puzzle generation: pick a page containing the #1 highlighted line plus decoys chosen to be plausible (similar length, sentiment via a lightweight model) so it isn't trivially the longest/quotiest line. Hard part: sourcing enough highlight data with clean sentence alignment (fuzzy-matching Kindle's clipped highlight text back to exact source sentences).

## v1 scope
- 30 hand-built puzzles from public-domain books with known Kindle highlight data
- One guess, score, reveal heat overlay, emoji share
- Local streak (no accounts)

## Out of scope
- User accounts, in-copyright modern books, uploading your own highlights, social feeds.

## Risks & unknowns
- Kindle highlight data availability/ToS for scraping at scale.
- Is guessing the crowd fun, or just "pick the famous quote"? Decoy quality is everything.
- Cold-start content pipeline is manual.

## Done means
A stranger opens today's puzzle, taps a sentence on a Gutenberg page, and sees an honest heat map of which lines a real Kindle crowd actually underlined, with their rank score and a shareable strip.
