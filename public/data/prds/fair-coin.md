## Overview

Fair Coin is a 4–6 player living-room game whose only prize is an artifact: a printed chart of how the room actually feels about itself — who'd be called at 3am, who's secretly exhausted, who'd move away if they could — assembled from answers that are individually deniable by construction. It's for groups close enough to be curious and cautious at the same time: old friends, a team offsite, a family after the third drink.

## Problem

The interesting questions never get asked at parties, because answering is a confession. Truth-or-dare games solve this by making exposure the entertainment. Fair Coin does the opposite: it borrows Warner's randomized-response trick so that honesty costs nothing, and turns the resulting statistical cover into the thing you play with.

## How it works

Host screen shows the question, a countdown, a noise dial, and nothing else — never an individual answer, ever.

Each phone privately shows: the question, plus a coin the server flipped for **you alone**. Heads (p=0.75) → "Answer honestly." Tails → "You must answer YES" (or NO). Everyone taps YES/NO in the same window. The host aggregates and debiases: estimated true rate = (observed − (1−p)·forced rate)/p, drawn with an honest confidence band.

The twist is the ending. Every extra question narrows the posterior on each individual — the host shows a per-player **exposure bar** creeping up. After each question, every phone privately votes CONTINUE or STOP. **One** STOP ends the round, and the host never says whose. So the group is trading artifact richness against someone's cover, and the person most at risk can pull the cord without ever admitting they were the one who blinked. What prints is what you got before somebody got scared.

## Technical approach

PartyKit Durable Object (or Socket.IO over Tailscale Serve) as the sole authority. Model: `Room{code, phase, questionIdx, p}`, `Player{id, name, socket}`, `Flip{playerId, qIdx, branch, forcedValue}`, `Response{playerId, qIdx, reportedBit}`. Coins are generated server-side and pushed only down that player's socket — clients never see anyone else's branch. Debiasing and exposure posteriors are computed server-side; the host socket receives aggregates only.

The genuinely hard part is not throughput, it's **side channels**. A forced answer is fast; an honest one hesitates. So: the answer window opens simultaneously (server-timestamped), submissions are buffered and released only at window close, and the host reveals all-at-once with no per-player order. Same for STOP votes — buffered, released as a single bit.

## v1 scope

- 5 players, one room, no accounts, no reconnect
- 3 hardcoded questions, p=0.75, forced branch always YES
- Bar chart per question (not a relationship graph)
- Exposure bars as a crude posterior, one decimal
- Anonymous one-vote STOP
- "Save keepsake" → PNG with the noise parameter printed on it

## Out of scope

Custom questions, real differential-privacy accounting, per-person edges/graph layout, >6 players, multi-round, persistence.

## Risks & unknowns

At n=5 the noise swamps the signal — the chart may be honestly meaningless. Mitigation is framing: the printed band *is* the point, and p=0.75 keeps signal usable. Players may not trust the coin ("is the server lying?"). Questions must be spicy enough to need cover but not so spicy the room stops playing.

## Done means

Five phones, three questions. Each phone shows only its own coin. The host never renders an individual answer, and a log assertion proves no per-player bit crossed the host socket. Any single anonymous STOP ends the round mid-question, and a PNG downloads with debiased bars, confidence bands, and the date.
