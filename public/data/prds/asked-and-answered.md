## Overview

Asked and Answered is a 3-player inversion of twenty questions. There is one hidden subject. Each phone holds a *different* partial clue about it. Everyone gets to ask the oracle one yes/no question per window — but questions are drafted simultaneously and in secret, and any two that mean the same thing are both burned unanswered. For talky groups who like Wavelength-shaped argument more than trivia.

## Problem

Deduction games reward the group for converging. That makes the smart play boring: everyone thinks of the same next question, and someone just asks it. The itch is a deduction game where thinking like everyone else is actively punished — where the best question is the one nobody else would have written.

## How it works

The server picks a subject with a pre-written fact sheet. Each phone privately receives one clue, true but partial, and the clue set is deliberately tuned so the players' obvious next questions overlap ("it isn't alive" and "it fits in a shoebox" both push hard toward *is it electronic?*).

Three ask windows, 45 seconds each. Every phone types one yes/no question at the same time; nobody sees anyone else's draft. On close, a judge clusters the submissions by meaning:

- **Singleton** → answered publicly by the oracle (YES / NO / IRRELEVANT), logged on the TV for everyone's benefit, asker scores +1.
- **Cluster of 2+** → all members burned. Never answered. Displayed side by side on the TV with the judge's one-line reason, which the room will loudly dispute.

Between windows, players talk freely. Announcing your question is a defense (it warns rivals off) *and* an invitation to be griefed by someone who copies it — but griefing costs the griefer their own ask, so it's a real trade, not a free move.

Final beat: everyone types a guess simultaneously. Correct guessers **split** a fixed pot, so being alone in a right answer is worth 3×, and two people landing the same wrong answer both lose a point. Agreement is punished all the way to the end.

PHONE (private): your clue card, your draft question, your score, your final guess field. TV (public): answered-question log, burned graveyard with reasons, scores, subject silhouette.

## Technical approach

Socket.IO server over Tailscale Serve; a room object holds `{subject, factSheet, clues{playerId→clue}, window, submissions{}, log[], scores{}}`. Drafts are held client-side and only revealed to the server on window close, so nobody — including a compromised client — can peek mid-window.

The hard part is the judge. One batched Claude call per window at temperature 0 with forced JSON returns `{clusters:[[ids]], reasons:[]}`, then a second constrained call answers each surviving question **using only the fact sheet** — this is what prevents the oracle from inventing inconsistent facts across three windows. Latency (~3s) is hidden behind a deliberate "the court is considering" beat on the TV; a 6s timeout falls back to embedding cosine similarity at >0.86. Judge output is logged verbatim for postmortem tuning.

## v1 scope

- 3 players, one game, ~5 minutes
- 20 hand-written subjects with fact sheets and pre-tuned clue triples
- 3 ask windows + 1 simultaneous guess
- No accounts, no rematch, no reconnect

## Out of scope

Player-authored subjects, >4 players, voice input, appealing a judge ruling, multi-game scoring.

## Risks & unknowns

A false-positive clustering feels like robbery — the threshold must lean permissive and the reason must be legible. Typing on phones is slow; 45s may be tight. Players may discover that deliberately weird questions dodge collisions, which is correct play but yields low-information answers — the oracle answering IRRELEVANT is the balancing pressure, and it's unproven.

## Done means

Three phones play one full game end to end in which at least one window burns a duplicate pair displayed side by side with a reason the room finds fair-ish, the oracle's three answers stay mutually consistent with the fact sheet, and a final round with two correct guessers splits the pot evenly on the TV.
