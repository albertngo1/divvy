## Overview
Blocked turns your real work week into a Slay-the-Spire-style run. It ingests your calendar (.ics) and procedurally builds a five-day map where meetings become enemies scaled by length and attendee count, and open time becomes rest sites. You draft a deck of "focus," "decline," and "caffeine" cards to survive to Friday. For anyone whose calendar is a horror game already.

## Problem
Your week *feels* like combat but reads as a boring grid. Reframing it as a run makes the shape of an overloaded week viscerally legible — and quietly nudges you to notice the 6-attendee 90-minute recurring boss you could kill.

## How it works
Import an .ics (Google/Outlook export or CalDAV). Each event becomes a node: HP = duration in minutes, attack = attendee count, type flavored by title keywords ("standup" = swarm, "review" = tank, "1:1" = elite). Free gaps become campfires (heal/upgrade). You start with a small deck; clearing nodes drops cards. Energy is finite per day, so back-to-back meetings force hard sequencing. Reaching Friday with HP left = win; the longest/most-attended meeting of the week is the boss. A run is one week; next week regenerates from fresh calendar data.

## Technical approach
Stack: browser game, TypeScript + a lightweight ECS, PixiJS for the board. Parse .ics with `ical.js`. Deterministic generation: seed the PRNG from the ISO week number so the same week is always the same run (fair replays, no save-scumming). Data model: `Run(weekSeed) -> Day[] -> Node[]`, cards as pure `(state, target) -> state` functions for clean combat resolution. Node stats derived by a scoring function over `{durationMin, attendees, titleTokens}`. The hard part is the difficulty curve: mapping arbitrary real calendars (a 2-meeting week vs a 25-meeting week) onto a run that's neither trivial nor unwinnable — needs normalization against the week's own total load, not absolute thresholds.

## v1 scope
- .ics file upload (no live sync)
- ~12 cards, 4 enemy archetypes, one boss rule
- Week-seeded deterministic map
- Local-only, no accounts

## Out of scope
- Live CalDAV/Google sync
- Meta-progression across weeks
- Multiplayer / office leaderboards

## Risks & unknowns
- Privacy optics: meeting titles are sensitive — must stay 100% client-side
- Sparse calendars produce dull runs; dense ones produce unfair ones
- Card balance is bottomless; must ship a fun-enough minimum

## Done means
I upload last week's .ics, get a five-day map where my recurring all-hands is clearly the boss, can win or lose based on card play, and reloading regenerates the identical run from the week seed.
