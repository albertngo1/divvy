## Overview
A CLI plus local dashboard that measures the real feedback delays in your team's delivery loop from GitHub data, fits them into a system-dynamics model, and shows the *oscillation* those delays produce — then lets you drag a delay down and watch the ringing damp out.

## Problem
Everyone agrees a 25-minute CI is bad; nobody can say how bad in behavioral terms, so the argument for bigger runners is always vibes versus invoice. The systems-thinking answer is that delay in a feedback loop doesn't merely slow a system, it destabilizes it: people start new work while blocked, WIP overshoots, review queues pile up, and the team cycles between crunch and idle. That's a measurable, nameable phenomenon and no devtool names it.

## How it works
`stepresponse init` takes a GitHub token and backfills six months of PRs. For each PR it reconstructs stage lags from the timeline: push → first CI completion, CI green → first review, review → approve, approve → merge. It reconstructs the WIP trajectory (open-PR count over time) as the observed system response. Then it fits a small stock-and-flow model — stocks for awaiting-CI, awaiting-review, awaiting-merge; flows bounded by reviewer capacity; a delayed feedback where blocked authors open additional PRs — and simulates a step input (a week at 2× commit rate).

Output is a "step response card": overshoot %, settling time, damping ratio ζ, and one interactive slider. Set CI to 5 minutes; overshoot falls from 180% to 25%. That's the number you bring to the budget conversation.

## Technical approach
Python CLI, DuckDB store, GitHub GraphQL for PR `timelineItems` (ReadyForReview, ReviewRequested, PullRequestReview, MergedEvent) plus the Actions REST API for workflow-run durations. Model integrated in discrete time with explicit delay lines; parameter identification by least-squares fit of simulated queue length to the reconstructed WIP series, with ridge regularization because the system is under-determined. A second-order approximation is fit to the simulated step response so ζ and ωn are reportable. Viz via Observable Plot in a local page; PNG export.

The hard part is honesty. Parameter identification on a noisy 200-PR history can produce a confident-looking number that means nothing. That demands bootstrap uncertainty bands, holiday/vacation masking, and a hard refusal to run on repos with too little signal. The tool must be willing to say "your history can't identify this."

## v1 scope
- Single repo, GitHub only
- Three stages (CI, review, merge), one hardcoded loop topology
- Static PNG card + printed metrics; no interactive slider yet
- Refuses repos with <150 merged PRs

## Out of scope
Jira/Linear/GitLab, org-wide rollups, forecasting, and — explicitly, permanently — any per-developer metric. Aggregate only, by construction, no per-author breakdown in the data model at all.

## Risks & unknowns
The model may be a plausible-looking toy; it needs at least one honest validation against a repo that actually made CI faster mid-history. Goodhart risk if a manager repurposes it. Small or single-author repos have no identifiable dynamics. Reconstructed WIP from PR open/close is a proxy for real WIP and may be a bad one.

## Done means
On a repo with >200 merged PRs it emits a damping ratio and settling time with uncertainty bands, and in a held-out backtest — a repo where CI duration measurably dropped partway through the window — the model's predicted change in median WIP lands within 30% of what actually happened.
