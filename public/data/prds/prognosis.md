## Overview
Prognosis is a daily browser game that turns doomscrolling 'the-commons-is-dying' charts into a competitive forecasting sport. Each day presents one real time-series from the software ecosystem with its recent window masked; you draw the continuation and get scored against reality. For devs who share decline graphs in Slack and argue about where things are headed.

## Problem
We passively consume graphs of collapse — Stack Overflow question volume, a language's fading tag share, a project's dwindling commit cadence — as fatalistic content. There's no skill, stakes, or accountability. Forecasting is a real skill nobody gets to practice on data they actually care about, and 'I saw this coming' is never tested.

## How it works
One puzzle per day. You see an anonymized line chart — axes unlabeled, series name hidden — with the last ~20% of the timeline blanked. Drag on the canvas to draw your predicted continuation. Submit to lock it. The reveal animates the true line over yours, scores you on mean absolute error plus a trend-direction bonus (did you at least call the slope?), and *then* unmasks the identity with a one-line narration ('Stack Overflow questions/day, monthly, post-GPT'). A daily leaderboard ranks everyone on the same seed; a shareable card shows your drawn line vs reality.

## Technical approach
Stack: static SPA (Vite), canvas or SVG drag-to-draw, no login for v1 (leaderboard via a tiny serverless KV like Cloudflare Workers KV keyed by day). Data pipeline: a nightly build job pulls series from Stack Exchange Data Explorer (cached CSV queries for questions/answers/day by tag), GitHub REST/Archive for commit-cadence and tag-share series, and a curated set of hand-vetted 'decline/rise/flat' series so puzzles vary. It precomputes each day's puzzle JSON: normalized series, mask window, and the answer. Scoring: resample the drawn path to the true x-grid, compute normalized MAE, add a sign-agreement bonus over the masked window. The hard part is *curation and anonymization* — series must be interesting, cleanly sourced, and stripped of obvious tells so it's forecasting, not trivia recognition.

## v1 scope
- One puzzle/day from a precomputed static bank (~30 series to start).
- Drag-to-draw, lock, animated reveal + narration.
- MAE + direction scoring, local best-streak, shareable result card.

## Out of scope
- Accounts, friends, private leagues.
- Live/real-time data at request time (all precomputed nightly).
- Multi-series or multivariate puzzles.

## Risks & unknowns
- Regulars may recognize series from shape alone, collapsing skill into memory.
- Sourcing enough clean, license-safe series is ongoing content work.
- 'Draw the graph' is a familiar mechanic; the dev-decline identity must give it a distinct voice.

## Done means
Opening the site on two consecutive days yields two different real series, drawing and locking produces an MAE + direction score, the reveal correctly unmasks the source, and the same day's seed is identical across browsers.
