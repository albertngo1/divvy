## Overview

A 4–6 player deduction game where the hidden role is earned, not dealt. Every phone privately receives exactly one silent change to a shared plan during a 75-second study window. Catch yours and you're clean. Miss yours and you become the mole — and you are never told. For groups who like Werewolf but hate being handed a card that decides the night.

## Problem

In every one-different-view imposter game, the imposter knows something is off the moment they read their screen, and the innocents are certain they're clean. Both certainties kill the tension. Here nobody is certain of anything, including their own reliability, because the game never tells you whether your report was right.

## How it works

Host screen (public): THE PLAN — 8 numbered lines of a job ("4. Van waits on Cardero until 9:40"), shown for 15 seconds, then blanked to just the line numbers and a countdown. From then on the plan exists only on phones.

Phone (private): all 8 lines, always readable. At one random moment in the 75-second window, exactly one line on your phone changes value. No flash, no highlight, no toast. It just is different now. To catch it you must re-read — and re-reading costs you the time you'd spend memorizing everything else.

Any time, you may privately REPORT: pick the line you think changed. You get no feedback. Your phone marks that line UNTRUSTED for you — it does not restore the original. The host screen shows only a tally: "4 of 5 phones have reported an anomaly." So the table learns exactly one player is unaware, and every player has to wonder if it's them.

Accusation phase: the host asks three questions that force specific lines to be read aloud ("Whoever has the van time, say it"). Contradictions surface. 60-second discussion, then everyone votes. The mole survives the vote or, before it closes, wins by naming their own changed line.

## Technical approach

Socket.IO over Tailscale Serve, one authoritative room process. State: `{plan: Line[8], edits: {pid: {lineId, newValue, firedAt}}, reports: {pid: lineId}, phase}`. Edits are precomputed at round start with per-player fire times drawn from the window, then pushed as a targeted patch to one socket only — the host never receives them. Reports are stored server-side; only the aggregate count is broadcast.

Hard part: the edit must land invisibly. A phone that is backgrounded, scrolled, or mid-render can betray the change with a reflow or a scroll jump. The patch is applied to a fixed-height, non-animated DOM node; backgrounded clients get the patch deferred to the next visibility event so they can't infer timing from a reconnect.

## v1 scope

- One hand-written 8-line plan, one edit per player
- 5 players, one round, one vote
- Host: plan reveal, blank board, anomaly tally, vote result
- Phone: plan list, REPORT picker, untrusted marker
- Room code join, no reconnect, no scoring history

## Out of scope

Multiple rounds, generated plans, difficulty tiers, spectators, rejoin after disconnect.

## Risks & unknowns

If everyone reports correctly, there is no mole — needs a fallback (last reporter is designated). Re-reading may dominate and make the study phase joyless. Whether an invisible edit feels clever or feels like a bug is the core unknown.

## Done means

Five phones join; each receives one silent edit at a different second with no visible artifact; private reports change only the aggregate tally on the host screen; the round ends naming the un-reported player and diffing every phone's plan against the original.
