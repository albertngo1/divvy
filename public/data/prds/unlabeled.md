## Overview
Unlabeled is a daily browser game for data nerds, journalists, and analysts. Each day it shows one real, published chart with its title, axis labels, legend, and annotations stripped away — leaving only the marks. Players study the shape and guess what it measures, then reveal and score. It turns the passive act of scrolling past infographics into a shared competitive ritual.

## Problem
We consume dozens of charts a day and barely read them critically. There's no fun, low-stakes way to practice (or show off) graphical literacy — reading trend, scale, distribution, and shape without being handed the answer. Meanwhile 'guess the X' daily games (Wordle-likes) are wildly sticky but none target data viz.

## How it works
1. One puzzle per UTC day, seed-shared globally.
2. Player sees a de-labeled chart plus 3 short structured prompts: 'What's on the X axis?', 'What's on the Y axis?', 'What's the story?' — answered by picking from a shuffled multiple-choice set (so it's auto-scorable) with an optional free-text guess for bragging rights.
3. Submit → reveal the original with source citation → score based on correctness and speed.
4. Wordle-style emoji share card + a global daily leaderboard and streak.

## Technical approach
- **Stack:** static site (Astro/SvelteKit) + a tiny serverless scoring endpoint; leaderboard in a single Postgres/Supabase table keyed by day + anon id.
- **Content pipeline:** the hard part is sourcing charts and de-labeling them cleanly. v1 curates from open datasets (Our World in Data, FRED, Census) and re-renders them ourselves in Plotly/Vega with labels programmatically removed — so we control the SVG and never scrape copyrighted images.
- **Scoring:** exact-match on the multiple-choice axis/story picks; speed bonus decays linearly over 60s.
- **Data model:** `puzzles(day, chart_spec_json, choices, answer)`, `scores(day, anon_id, correct, ms)`.
- **Anti-cheat:** puzzle answer withheld from the client until submit; choices delivered shuffled with server-side answer key.

## v1 scope
- 14 hand-built puzzles re-rendered from open data.
- Multiple-choice axis + story scoring.
- Share card + streak in localStorage.
- Single global leaderboard.

## Out of scope
- User-submitted charts.
- Scraping real-world published figures.
- Free-text NLP grading.

## Risks & unknowns
- Is de-labeling too hard (nobody guesses) or too easy (obvious shapes)? Needs difficulty tuning.
- Copyright if we ever move beyond self-rendered charts.
- Retention beyond the novelty week.

## Done means
A player can load today's puzzle, answer the three prompts, get a score and a shareable card, and appear on a leaderboard — with 14 playable puzzles queued and difficulty that isn't trivially guessable in playtests.
