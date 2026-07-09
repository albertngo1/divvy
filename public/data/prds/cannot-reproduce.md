## Overview
A client-side daily logic puzzle for engineers who love a good "works on my machine" mystery. Each day hands you a bug report and a roster of hypothetical users, each carrying hidden attributes (handedness, locale, timezone/DST, character set, signedness of an input, screen DPI, feature flag). Your job: choose the smallest, cheapest set of users to "deploy to" that guarantees you isolate which single attribute triggers the crash.

## Problem
The famous bugs — the one that only hit left-handed users, MechCommander's left-arm bug, the classic unsigned-overflow footgun — feel like folklore. There's no fun sandbox that teaches the actual skill underneath: designing a discriminating experiment when the failing variable is invisible. Debugging deduction is a real muscle nobody trains deliberately.

## How it works
The hidden world has N boolean/categorical attributes and one secret "trigger rule" (e.g., `handedness==left && locale.startsWith('tr')`). You're shown a symptom and a marketplace of candidate testers, each with a visible price and hidden attribute vector. You buy testers; the oracle tells you pass/fail. Par = minimum spend to guarantee the rule is uniquely identified among all consistent hypotheses. Wordle-style shareable grid of your probe sequence, plus a global "under par" percentage.

## Technical approach
Pure static site (Vite + TypeScript, no backend). Daily puzzle is date-seeded (mulberry32 on `YYYYMMDD`) so everyone gets the same board deterministically. Hypothesis space is enumerated as conjunctions/disjunctions over a small attribute grammar; after each observation, filter the consistent-hypothesis set. Par is precomputed by a branch-and-bound information-gain search (pick the tester maximizing worst-case hypothesis elimination) — the genuinely hard part is proving the *minimum* guaranteed-identifying spend, which is a set-cover-flavored optimization; cap attribute count (~6) so exhaustive solve stays sub-second. Share string encodes probe count + spend only, never the answer.

## v1 scope
- 6 attributes, conjunction-only trigger rules
- One puzzle/day, date-seeded, no accounts
- Buy-a-tester loop with running spend + consistent-hypothesis counter
- Win screen with par comparison and copyable share grid
- 20 hand-tuned flavor templates (locale, DST, overflow, RTL, DPI)

## Out of scope
- Multi-attribute disjunctions / interaction bugs (v2)
- Leaderboards, streaks, auth
- User-authored puzzles

## Risks & unknowns
- Par computation may feel arbitrary if players find equally-good but different probe orders — need to show "a" optimal, not "the" optimal.
- Flavor text must stay real-feeling without being gettable by genre-savvy players memorizing tropes.

## Done means
Opening the site on two devices on the same date yields the identical board; buying testers narrows a visible hypothesis count to 1; the win screen reports your spend vs. precomputed par and produces a share string that reproduces your probe count for a friend.
