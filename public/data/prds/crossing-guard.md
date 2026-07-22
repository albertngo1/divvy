## Overview
A taut silent co-op for 3–5. One player is the **Guard**, the only one who sees a minefield. The rest are **Walkers**, blindly stepping across it toward the far side. The Guard cannot talk — they communicate solely through a hard-rationed budget of in-app signals, so the game becomes an attention-economy puzzle: which of several parallel blind walkers do you spend your dwindling pings on?

## Problem
Seer-directs-blind games collapse when the seer narrates freely — it's just a monologue. Strip away voice *and* cap the seer's bandwidth and the same premise turns into a knife-edge triage problem across multiple simultaneous actors.

## How it works
**Guard phone (private):** the full grid with all mines visible, every Walker's live position and target exit, and a signal-budget meter (e.g. 12 pings).
**Each Walker phone (private):** just a 4-way D-pad and a step animation — no grid, no mines. Choosing a direction and stepping onto a mine → BOOM, that Walker is frozen. Each Walker also receives the Guard's pings: a single directional arrow flashed for 0.5s, or a red STOP pulse.
**Host TV (shared):** the drama, not the map — anonymized crossing-progress bars, pings-remaining, and a big BOOM flash when someone detonates. Never the mine layout.
No talking (house rule). Walkers move on their own clocks, so the Guard watches parallel threads and spends scarce pings only on the walker about to die, trusting the safe ones to keep going. Win = all Walkers reach the far edge within the budget/time.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object). Data model: `mines[][]`, `walkers{id,pos,exit,alive}`, `guard{pingsLeft}`. Walker sends `stepIntent`; server resolves mine/safe and broadcasts BOOM or new pos — the Walker view stays blind (own position-relative feedback + inbound pings only). Guard sends `{targetWalker, arrowDir|STOP}`; server decrements the budget and forwards a transient signal to that one Walker. Data is tiny, but pings must feel instant (<150ms) to beat the next step, so ping messages get priority. The hard part is reconciling simultaneous `stepIntent`s with in-flight pings: a Walker may step *before* the Guard's warning lands — that lag is the drama, but it must resolve fairly and identically for everyone, so the server arbitrates by timestamp.

## v1 scope
- 3 players: 1 Guard + 2 Walkers
- One 6×8 field, ~8 mines, 10-ping budget
- Arrows + STOP only, one round

## Out of scope
- Voice, scoring/leaderboards, mine-type variety
- More walkers, reconnection handling

## Risks & unknowns
- Ping-arrives-after-step could feel unfair; needs tuning
- Is enforced silence actually respected at a party?
- Difficulty: too few pings = unwinnable; a BOOM sidelining a player feels bad (maybe just reset that Walker)

## Done means
On 3 phones + a TV, two Walkers cross a 6×8 field blind; the Guard uses ≤10 arrow/STOP pings with zero words spoken; the round is winnable, a mistimed step produces a BOOM on the TV, and payload inspection confirms Walker phones never receive mine positions.
