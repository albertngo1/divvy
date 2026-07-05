## Overview
One Job is a daily browser puzzle for UI nerds and casual troublemakers. Every level is a single, beautifully rendered button that claims — via label, icon, and tooltip — to do one honest thing, but actually does something else. Your job: deduce the button's real behavior before you press "Submit" (which, naturally, may also lie).

## Problem
The HN essay "If you're a button, you have one job" celebrates honest affordances. The mischief: most real software buttons quietly betray their labels. There's no playful space to build intuition about deceptive interfaces — the exact skill that stops you clicking the fake "Download" on a sketchy site. Puzzle games almost never target UI literacy, and reading about good buttons is far less sticky than being fooled by bad ones.

## How it works
Each daily run is 5 buttons of rising deviousness. You may poke, hover, right-click, drag, double-click, or inspect — every interaction emits an observable side effect (a counter ticks, the page tilts, a hidden log line appears) but never states the rule directly. From what you observe you write a one-line guess of the button's true job; the game scores it and moves on. Fewer interactions before a correct guess = higher score. You get a Wordle-style shareable emoji grid (🔘🟥🟩) showing how many pokes each button took.

## Technical approach
Pure client-side static site — Vite + TypeScript, no backend. Each puzzle is a JSON spec: `{label, lie, trueBehavior, observables[], scoringKeywords[]}`. A deterministic date-seeded PRNG (mulberry32 over YYYYMMDD) picks the day's 5 from an authored bank. Behaviors are tiny pure reducers over an event stream so they're replayable and unit-testable. Guess scoring normalizes text and runs token-set-ratio against `scoringKeywords` with a small synonym map. Streak and results persist in localStorage; the share string is generated client-side. The genuinely hard part is authoring buttons that are fair — surprising yet deducible from ≤5 interactions — so I'll build a playtest harness that logs how many pokes real solvers needed and flags unfair levels.

## v1 scope
- 20 authored deceptive buttons, 5 per day for 4 days
- Interaction logging + visible observable side effects
- One-line guess box with keyword scoring
- Shareable emoji result + localStorage streak

## Out of scope
- Accounts, global leaderboard, level editor / UGC
- Mobile gestures beyond tap and long-press
- Anti-cheat on the shared grid

## Risks & unknowns
- Fairness: too obscure frustrates, too obvious bores — needs playtesting.
- Free-text scoring is fuzzy; may need a multiple-choice fallback.
- Novelty could wear thin past ~30 authored buttons.

## Done means
A stranger loads the URL, plays today's 5 buttons with zero instructions, correctly deduces at least 3 true behaviors, and pastes their emoji grid into a chat — all with no server calls.
