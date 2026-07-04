## Overview
A ranking party game where the group tries to guess an objective ranking they can't see. Ten items in a category — movies, foods, US cities — appear on every phone. Each player privately ranks them 1–10 by their guess of the "real" order (IMDB rating, Google Trends volume, population). Reveal the true order, score by proximity. Closest guess wins.

## Problem
Ranking games (Superfight, Wits & Wagers) usually pit opinion against opinion, which devolves into shouting. Anchoring the ranking to an *external* objective truth — IMDB scores, Google Trends, calorie counts — gives the group something to argue toward instead of past each other. And no existing browser party game leans on the "there's a real answer, we just don't know it" hook.

## How it works
4–8 players. Round starts with a category ("Highest-grossing 2010s films") and 10 items on every phone. Each player privately drags the 10 items into their ranking, top to bottom. 90-second timer. Once all submitted, the true ranking is revealed with the source cited ("IMDB user rating, pulled 2026-07-04"). Each player's score is the sum of absolute rank distances (lower = better). Closest to zero wins the round. 3 rounds per game across different categories.

## Technical approach
Socket.IO on the homelab. Server holds a static JSON of ~30 pre-scraped category packs — each pack is 10 items with their true ranked values from a cited source (IMDB, Google Trends, Wikipedia). No live API calls in v1; scraping happens offline into the pack file. Client is a mobile drag-and-drop list (react-dnd or a lightweight touch-drag lib). Per-phone architecture is load-bearing: if the ranking were done on a shared screen, one loud person would push their opinion and everyone would nod. Private ranking on each phone forces real independent guesses, which is where the "wait you thought THAT was #1?" reveal-phase joy comes from.

## v1 scope
- 4–8 players (variable)
- 3 rounds per game, each 90s ranking + 30s reveal
- 3 category packs at launch (films, foods, US cities)
- Drag-to-rank 10 items on mobile
- Cumulative score across rounds; single winner declared

## Out of scope
- Live scraping / real-time data (Google Trends, current stock prices)
- Player-submitted categories
- Difficulty tiers
- Handicap for domain experts
- Persistent leaderboards

## Risks & unknowns
- Drag-to-rank on mobile is fiddly; may need up/down arrows as fallback
- Category data goes stale (IMDB ratings drift); packs need refresh cadence
- Some categories may have obvious #1 that trivializes the round
- "Objective ranking" for foods (deliciousness?) is subjective; must be genuinely measurable (calories, restaurant count, whatever)

## Done means
Five friends play a full 3-round game, at least once someone wins the round with a ranking that everyone else laughed at during the reveal, and the group asks for a new category pack.
