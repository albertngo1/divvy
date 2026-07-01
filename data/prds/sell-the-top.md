## Overview
Sell The Top is a once-a-day, Wordle-style browser game. You watch an unlabeled price line for a real historical mania — Dutch tulips, the South Sea Bubble, dotcom — tick forward day by day, and you hit SELL exactly once. Your score isn't just profit captured; it's your rank *against how the actual crowd behaved*: "You sold 3 days past the tulip peak — along with 94% of Haarlem." After you play, the bubble's identity is revealed alongside a Mackay quote, and you copy a spoiler-free result grid to share.

## Problem
Mackay's *Memoirs of Extraordinary Popular Delusions* (1852) catalogs bubbles humans never learn from. Every "guess the peak" game pits you against a chart. None pit you against the *crowd* — which is the entire point of the book. The emotional payload is social: not "were you optimal" but "did you break from the herd."

## How it works
Each day serves one deterministic puzzle (seeded by date). The price series animates forward; you can SELL at any tick. On sell, the game computes profit vs. theoretical max and, crucially, where your exit sits in a modeled distribution of when the historical crowd sold. It then reveals the bubble and a curated quote, and generates a shareable emoji grid encoding your timing without spoiling the answer.

## Technical approach — specific & technical
Stack: static site — Svelte or vanilla TS + Vite, deployed to GitHub Pages/Cloudflare Pages, zero backend. Chart via lightweight canvas or `uPlot` (fast, tiny) rather than a heavy charting lib. Data model: each puzzle is a JSON blob `{id, series:[{day, price}], peakIndex, crowdSellCurve:[cumulative % sold by day], reveal:{name, year, quote, source}}`. Series sourced from digitized historical indices (e.g. Thompson's 1637 tulip price index; South Sea from Frehen/Goetzmann/Rouwenhorst data; NASDAQ dotcom from public daily closes). The "crowd" curve is a modeled cumulative-sell distribution — a logistic/lognormal fitted so the median exit lands slightly *after* the peak (herds sell late), stored per puzzle. Scoring: `capture = (sellPrice - buyPrice) / (peakPrice - buyPrice)`, plus percentile from `crowdSellCurve[sellDay]`. Daily rotation: `puzzleIndex = daysSinceEpoch % puzzleCount`, fully client-side and deterministic. Share grid: map sell timing to colored squares (early=green, at-peak=gold, late=red) like Wordle. The hard part: sourcing clean daily historical series and constructing a *defensible, sourced* crowd-behavior curve — the whole hook rests on that number feeling real, not invented.

## v1 scope (humiliatingly small) — bullets
- One hardcoded dataset: Dutch tulip index, ~40 daily points.
- Static page animates the line; one SELL button.
- Compute % of theoretical max captured.
- Show a canned "the crowd behaved like this" line and the reveal.
- Copy a shareable spoiler-free result to clipboard.

## Out of scope (for now)
- Real daily rotation across multiple bubbles (v1 fakes "daily").
- Accounts, streaks, leaderboards, statistics history.
- Buy-timing, shorting, multi-round play.

## Risks & unknowns
- Digitized historical daily prices are sparse/contested for early bubbles.
- The crowd-sell curve must be sourced or clearly modeled to stay honest.
- Balancing "fun" vs. historical fidelity.

## Done means — concrete, testable
I play one bubble start-to-finish, get a score framed as "you vs. the crowd," see the Mackay reveal, and copy a shareable spoiler-free grid to clipboard.
