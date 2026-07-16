## Overview
Bus Factor is a single-player management sim, for developers and OSS-curious players, about keeping an open-source project alive. You play the lead maintainer. The twist, lifted straight from the arXiv paper "When Bots Join the Team: Bot Adoption and the Institutional Fabric of Open-Source Software Projects": automation buys you throughput now and steals resilience later, and the bill comes due when you least expect it.

## Problem
Games about coding are either idle clickers or puzzle abstractions; none model the actual maintainer tragedy — that the things which make a project look healthy (fast merges, closed issues, green CI) can be the same things that drive away the humans who make it survivable. It's a rich, underused dramatic system.

## How it works
Each turn is a week. Issues and PRs arrive on a queue with hidden difficulty and "newcomer-friendliness." You spend limited maintainer energy triaging, reviewing, mentoring, or writing code. You can adopt bots — Dependabot, a CI gate, a greeter bot, an auto-closer for stale issues — each of which raises visible metrics (throughput, response time, star growth) but applies a hidden debuff to newcomer retention and "institutional fabric." Contributors have loyalty and knowledge stats; bus factor = how many you'd need to lose before critical knowledge vanishes. The auto-closer that clears your backlog also closes the first PR of the newbie who'd have become your co-maintainer. When bus factor hits 1 and that person burns out, cascading failures begin.

## Technical approach
Stack: TypeScript + a lightweight sim loop, rendered as a text-forward dashboard (React or terminal UI) so it reads like a real GitHub insights page. Core model: contributor agents with `{knowledge, loyalty, tenure}`, a work queue, and a hidden `fabric` scalar updated by weighted policy effects. Bots are policy cards with `visibleDelta` and `hiddenDelta` vectors. The interesting algorithm is the collapse cascade: a knowledge-weighted graph where losing a node redistributes its load onto neighbors whose loyalty then decays if overloaded — a simple contagion model tuned so the crash feels sudden but was foreshadowed. Optional flavor mode ingests a real repo's `git shortlog` to name your contributors after real ones.

## v1 scope
- 20-turn (week) run with lose/survive ending
- 4 bots, 4 maintainer actions, one hidden fabric meter
- 6 contributor agents with knowledge/loyalty and one collapse cascade
- End screen showing the "pretty metrics vs. real bus factor" divergence chart

## Out of scope
- Multiplayer / real GitHub write access
- Deep tech tree, funding/sponsorship economy
- Persistent campaign

## Risks & unknowns
- Balancing so bots are tempting but not obviously a trap
- Making hidden state feel fair (needs subtle tells, not pure gotcha)
- Text-heavy sim risks being dry without good event writing

## Done means
A 20-turn playthrough is completable in a browser, adopting every bot visibly maxes throughput while the end-screen chart shows bus factor collapsing to 1, and at least one "lost newcomer" event traces causally back to a bot the player adopted.
