## Overview
A 4–6 player inference game for a TV plus phones. Wavelength, run backwards: instead of guessing where a hidden target sits on a known spectrum, you see everyone's answers and have to deduce the hidden *question* each of them was answering.

## Problem
Wavelength has one dial and one clue-giver, so five people sit and wait for one person to think. The interesting cognitive act — modeling how someone else measures the world — happens once per round, for one player. Everyone else is just arguing about a physical wheel. There's no version where all five people simultaneously produce data and all five simultaneously read it.

## How it works
Host screen (public): three concrete objects for the round — "a hot tub", "a laminating machine", "a golden retriever" — plus the full list of six axes in play: safe↔dangerous, cheap↔expensive, childish↔grown-up, quiet↔loud, common↔rare, calm↔stressful.

Each phone (private): exactly one of those axes, assigned secretly, and three sliders — one per object. You drag each object to where it sits on *your* axis. Nobody else's axis is on your screen. Everyone rates simultaneously; the host shows a "3 of 5 locked" counter and nothing else.

Reveal: the host draws six unlabeled horizontal bars, one per player, each with three colored dots (one color per object) — no names, no axis labels, shuffled. Now every phone shows a private matching form: drag each of the six axis labels onto a bar. You cannot pick your own bar (it's greyed out for you, which is itself a tell for nobody but you).

Scoring: +1 per axis you place correctly, +1 for every player who correctly identified *your* bar. So you want to be perceptive *and* legible — rating cagily to stay hidden costs you as much as it gains.

The argument is the game: "whoever put the retriever high on the same axis as the hot tub has to be reading danger, right?"

## Technical approach
Host tab + phone PWAs against a PartyKit Durable Object.

Data model: `Round { objects: [3], axisPool: [6], assignments: {playerId → axisId}, ratings: {playerId → [f32,f32,f32]}, guesses: {playerId → {barIndex → axisId}} }`. Bars are published as `[{barId, dots:[f32,f32,f32]}]` with `barId` a per-round shuffled opaque token, so bar order carries no info about join order or seating.

Sync strategy: ratings are write-only-to-server — the DO accepts slider values but broadcasts only an aggregate lock count until every player commits, then flips phase and broadcasts the shuffled bars. Guesses are similarly sealed until all are in. Two phase barriers, no partial leakage; a 90-second per-phase timer auto-commits stragglers at their current slider positions.

The genuinely hard part isn't sync (this is turn-based, not twitch) — it's **axis-set design**. If two axes correlate on the chosen objects ("dangerous" and "expensive" for a hot tub), the round is unsolvable and feels arbitrary. v1 hand-picks object triples that maximally decorrelate the six axes; long-term this wants a scored generator.

## v1 scope
- 4 players, one round, one hardcoded object triple + six hardcoded axes
- Three sliders, one lock button, one matching screen
- Reveal screen: bars, correct answers in green, a score line per player
- No accounts, no rematch, room code in the URL

## Out of scope
Multiple rounds, player-submitted objects, images instead of text, spectator mode, tiebreaks, mobile-host mode.

## Risks & unknowns
Correlated axes make rounds unwinnable — needs playtesting of the content, not the code. Three data points may be too few signal to deduce from; four objects may be the real number. Sliders on small phones are fiddly; may need snap-to-11-points.

## Done means
Four phones join, each privately receives a distinct axis, all four rate three objects, the host reveals four anonymized dot-bars, every player submits a matching, and the score screen shows both halves of scoring correctly — with at least one player having correctly deduced someone else's axis in a live playtest.
