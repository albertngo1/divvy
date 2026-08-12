## Overview
A single-player management sim where you run the homepage of a streaming service for twelve quarters. Real catalog, real titles, real taste vectors — but you never see the truth. You see a KPI dashboard, and the dashboard is a lagging, biased instrument. For anyone who has ever argued about exploration budgets in a metrics review.

## Problem
Everyone knows recommenders eat their own catalog; nobody has ever *felt* the delay. Popularity bias is taught as a plot in a paper. The itch is a game where the collapse is invisible while it's happening and obvious once it's terminal — the actual experience of running a feedback loop you can only observe through its own output.

## How it works
Each quarter you allocate: shelf slots (how many rows, how long), an exploration budget ε, a diversity penalty λ, a cold-start boost pool you can spend on specific titles, and one "editorial override" per quarter that force-places anything you want. Then the sim runs 90 simulated days. Under the hood, a population of ~5,000 synthetic users with latent taste vectors consume from your shelves; consumption updates both their taste (drift toward what they were shown) and each title's popularity prior. Preferential attachment does the rest.

You get a dashboard: CTR, completion rate, sessions/user, subscriber count. What you do *not* get: catalog Gini, the number of titles with zero plays this quarter, or per-user taste variance — the true state. Those are only revealed on the run-end postmortem screen, drawn as a time series over your decisions, which is where the game actually lands.

The cruelty is timing. Catalog concentration rises immediately; churn responds ~2 quarters later, and by then the users whose tastes you flattened have nothing left to discover. Licensing costs are per-title-per-quarter, so a collapsed catalog *looks* profitable. Run ends when subscribers fall below the floor or you finish Q12; scoring is subscribers × catalog health, so grinding the hit machine can win the dashboard and lose the run.

## Technical approach
TypeScript + a canvas dashboard; the sim is pure functions so runs are deterministic from a seed (shareable seeds, daily-challenge mode). Catalog seeded from MovieLens 25M — real titles, real genre tags, and item embeddings from a 32-dim ALS factorization computed offline and shipped as a static binary blob. Users are sampled from the same latent space with a drift term: `u ← (1-α)u + α·mean(consumed items)`. Ranking is a scored blend of `dot(u,i) + β·log(popularity_i) - λ·redundancy(i, shelf)` with ε-greedy exploration. Dashboard metrics are the true metrics passed through an EMA with a two-quarter half-life plus sampling noise — the lag is a first-class simulated object, not a UI trick. The hard part is tuning so that the greedy strategy wins for four quarters and loses by ten: too fast and players learn instantly, too slow and it feels arbitrary. That's a parameter sweep against a scripted greedy bot.

## v1 scope
- 12 quarters, 3 sliders (ε, λ, slots), no editorial override
- 2,000 titles, 3,000 users, one dashboard screen + one postmortem screen
- Postmortem shows exactly two hidden curves: catalog Gini and zero-play titles
- Seed in the URL

## Out of scope
- Multiplayer, live-ops, real A/B test simulation, licensing negotiation minigame
- Any actual recommender library — the sim is ~200 lines of matrix math

## Risks & unknowns
May read as a lecture rather than a game; the postmortem has to be a gut punch, not a chart dump. Sliders-only interaction is thin — the editorial override probably has to arrive in v1.1 to give the player a story. MovieLens licensing permits research/non-commercial use; a commercial build needs an open catalog instead.

## Done means
A seeded run plays start to finish in under eight minutes, the scripted greedy bot reliably tops the dashboard at Q4 and busts by Q10, and five playtesters independently say some version of "the numbers were fine" before seeing the Gini curve.
