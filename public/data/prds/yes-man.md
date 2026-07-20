## Overview
Yes-Man is a single-player (and pass-the-phone party) browser game that weaponizes the finding that AI advice makes people 3x less accurate but 2x more confident. You answer hard estimation/trivia questions while a relentlessly self-assured AI copilot whispers an answer with a bogus confidence bar. You score by being right — and by knowing when to override the machine. It's a critical-thinking trainer cosplaying as a game show.

## Problem
People are outsourcing judgment to confident LLMs and getting worse while feeling better. There's no fun way to practice the one skill that matters: calibrated distrust. Reading think-pieces about AI overconfidence changes nobody's behavior; losing points to a smug bot might.

## How it works
Each round shows a genuinely hard question — a Fermi estimate ('how many piano tuners in Chicago'), a calibration true/false, a which-is-bigger. The AdvisorⓇ pops in with an answer, a swagger-filled one-liner ('Trust me, it's clearly ~430'), and a fat confidence bar. You can Accept, Override with your own answer, or Split the difference. Scoring uses a Brier-style calibration metric: correct answers earn points, but *overriding a confident-and-wrong advisor* earns a bonus, and *deferring to a confident-and-wrong advisor* is punished hardest. A running dashboard shows your Deference Rate and the advisor's true accuracy, which you can only estimate as you play. Daily seed + emoji share ('🤖❌ I fired the bot 4/6 times').

## Technical approach
Static front-end (Vite + TypeScript). Question bank seeded offline from public calibration/estimation sets (Fermi problem lists, Metaculus-style resolved binaries, real almanac facts) with ground-truth answers baked into JSON. The advisor's answers come from a small real model (via a cheap API or local endpoint) so its confident wrongness is *authentic*, not scripted — we log its per-question hit rate offline to tune difficulty. Scoring: proper scoring rules (Brier for binaries, log-ratio band for estimates). Data model: `{question, truth, advisorAnswer, advisorConfidence, tolerance}`. Hard part: designing the reward so that blanket-ignoring the AI doesn't dominate — the advisor must be right often enough that reflexive distrust also loses, forcing genuine calibration.

## v1 scope
- 30 pre-baked questions with truth + tolerance
- One advisor personality, pre-generated answers/confidence stored in JSON (no live API in v1)
- Accept / Override interaction and Brier scoring
- End screen: your accuracy vs. advisor accuracy vs. deference rate

## Out of scope
- Live model calls, multiplayer netcode, accounts, difficulty ladders

## Risks & unknowns
- Balancing advisor accuracy so both over- and under-trust lose
- Estimation questions need forgiving tolerances or they feel unfair
- Could feel like a quiz, not a game — the swagger/UX carries it

## Done means
A player finishes a 6-question daily run and sees a scorecard that provably rewarded overriding wrong-but-confident advice and penalized blind deference, with a shareable emoji summary.
