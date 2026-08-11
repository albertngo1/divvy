## Overview

A browser puzzle game about the last 2% of a disease-elimination campaign. Every epidemic game so far is about the exponential opening — flattening a curve, racing R0. This one starts at 40 known cases in a region of 900,000 people and asks the actual hard question public-health programs face: how do you know when you're done? For anyone who enjoys hidden-information optimization (Papers Please meets a Bayesian survey design problem).

## Problem

Elimination endgames are dominated by populations you can't easily reach — people in prisons, cross-border seasonal workers, unhoused people, those who've been treated once and reinfected — and by the fact that prevalence is never observed, only sampled. The genuinely painful tradeoff is that money spent on treatment makes you closer to zero, while money spent on surveillance makes you *able to prove* zero, and you cannot buy both. No game has ever modeled that.

## How it works

The region is a graph of 12–20 subpopulations with sizes, mixing weights, an access cost, and a refusal rate. Hidden state: infection counts per node, advanced quarterly by a stochastic SIS-with-reinfection step. You never see it.

Each quarter you allocate a fixed budget across: **test** (buy sampling in a node — you get a positive count drawn from a hypergeometric over its hidden prevalence, with node-specific sensitivity), **treat** (cure a share of *detected* cases, plus a smaller share of undetected ones via outreach), **access** (permanently lower a node's cost/refusal — expensive, slow), and **trace** (reveal one mixing edge).

At any point you may **Declare Elimination**. The declaration is scored the way WHO certification works: three consecutive years of zero detected cases *and* a documented surveillance sensitivity above threshold. Declaring with weak surveillance is the trap — the game then simulates 5 post-declaration years, and a resurgence costs you far more than the years of testing you skipped. Declaring late burns budget and score.

The delicious part: after the run, the game shows the hidden truth as a replay — where the reservoir actually sat, which quarter you were genuinely at zero, and how many quarters you spent proving something already true.

## Technical approach

TypeScript + Vite, canvas or SVG for the node map, no backend. Sim is ~200 lines: per-node `S/I` counts, force of infection `lambda_i = beta * sum_j w_ij * I_j / N_j`, seeded PRNG (`sfc32`) so runs are shareable by seed string. Detection draws from a hypergeometric; surveillance sensitivity is computed as `1 - prod_i (1 - coverage_i * sens_i * mixing_share_i)` — this scalar is the number the certification rule reads, and it's the whole game's tension in one line. Scenario generator makes plausible topologies (one hub, 2–3 hard-to-reach leaves, one cross-border importer node that keeps seeding). A ghost "expert AI" plays the same seed for a comparison line on the results screen.

The hard part is tuning so that both failure modes — declaring too early and grinding forever — are live at once.

## v1 scope

- One hand-authored 12-node scenario, one difficulty
- Four actions, quarterly turns, 15-year cap
- Certification rule + post-declaration resurgence sim
- Truth-reveal replay screen and a shareable seed

## Out of scope

Multiple diseases, vaccination, a campaign/story mode, real country data, leaderboards.

## Risks & unknowns

Hidden-state games can feel arbitrary rather than deductive — the truth-reveal screen must make every loss legible. Balance risk: if testing is too cheap, the tradeoff evaporates.

## Done means

A playtester can finish a run in under 12 minutes, correctly explain after the reveal why their declaration failed or held, and two players on the same seed reach measurably different outcomes.
