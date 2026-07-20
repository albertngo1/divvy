## Overview
A phone-first web app for the volunteer secretary of a bowling league — the person who, every Tuesday night, hand-keys 40 bowlers' scores into a spreadsheet, computes handicaps, and prints standings. Pinfall replaces that with: photograph the lane's printed recap slip, confirm, done.

## Problem
Small entertainment venues (bowling alleys, the same world as the $1,600-ESP32 HN story) run 1980s scoring hardware that spits out a thermal-paper recap slip per lane. League handicap math (e.g. 90% of 220 minus scratch average) and cumulative standings are then re-entered by hand into Excel or literally paper. It's 45 minutes of error-prone data entry weekly, and disputes over miscalculated handicaps poison league nights.

## How it works
1. Secretary creates a league: teams, roster, handicap formula (basis score + percentage), points-per-game rules.
2. Each week they photograph the recap slips. OCR extracts bowler name + three game scores per lane.
3. Pinfall matches names to the roster (fuzzy), computes each bowler's updated book average, this week's handicap, handicap-adjusted scores, and awards team points.
4. It renders standings, high-game/high-series honor rolls, and a per-bowler average trend — shareable via a public read-only link the league can bookmark.

## Technical approach
Stack: SvelteKit + SQLite (Turso). OCR: the recap slips are fixed-layout monospace thermal print — a Tesseract pass with a per-alley layout template beats a general VLM and runs free; fall back to a cheap VLM (Claude Haiku) only on low-confidence cells, with a mandatory human-confirm grid before commit. Data model: `league`, `bowler`, `week`, `game(bowler_id, week_id, lane, score)`, derived `standing` views. Handicap/average logic is pure SQL over the `game` table so recomputes are trivial when a correction lands. The genuinely hard part is robust name-matching across weeks (nicknames, initials, OCR garble) — solved with a per-league alias table the secretary trains once.

## v1 scope
- One league, one handicap formula, manual layout template per alley.
- OCR-with-confirm-grid ingest of recap photos.
- Standings + per-bowler average page, public share link.

## Out of scope
- POS/payment, lane reservations, sanctioning-body (USBC) export formats.
- Multi-division playoff brackets.
- Live in-alley integration with scoring hardware.

## Risks & unknowns
- Recap-slip layouts vary by alley brand (Brunswick vs QubicaAMF) — templating burden.
- Handicap rules are surprisingly bespoke per league; need a flexible-but-simple formula editor.
- Thermal print fades; bad photos could tank OCR accuracy.

## Done means
A secretary photographs one night's worth of recap slips for a 30-bowler league, corrects at most two cells in the confirm grid, and the resulting standings + handicaps match their hand-computed spreadsheet exactly.
