## Overview
Ship Bet is a play-money prediction market where the contracts are *unreleased software features* discovered by dataminers. Every hidden flag, stubbed-out UI string, or datamined endpoint in apps like Discord, Instagram, or a game client becomes a market: "Will this ship to everyone by date X?" It's for the community of people who obsessively read datamining changelogs and argue about what's coming.

## Problem
Datamining feeds (Discord-Datamining, app teardown threads) generate constant speculation — "they're testing this, it'll launch next month" — but that speculation is unscored. Nobody tracks who's actually good at predicting shipments, and there's no crisp signal separating real upcoming features from abandoned experiments. Ship Bet turns idle forum guessing into a calibrated, ranked game.

## How it works
A scraper ingests datamining sources and surfaces candidate features. A curator (or the crowd, gated) promotes interesting ones into markets with a resolution question and deadline. Users spend play-money to buy YES/NO shares; prices move on an automated market maker. Resolution is semi-automated: a watcher checks whether the feature became publicly available (app store changelog, official blog, presence in the stable client) by the deadline, then settles. A leaderboard ranks forecasters by profit and Brier score.

## Technical approach
Next.js + Postgres. Market pricing via a logarithmic market scoring rule (LMSR) — standard, bounded-loss, and simple to implement as a few equations over share counts. Datamining ingestion: poll GitHub repos like Discord-Datamining via the API for new commits, plus RSS from teardown blogs; an LLM pre-classifies each diff into candidate "feature" objects (name, description, confidence it's user-facing). Resolution watcher: scheduled jobs that grep official changelogs/blog feeds and, for confidence, a lightweight check against the live client's public strings. Hard part is *automatic resolution* — deciding objectively when a feature has "shipped" is genuinely ambiguous, so v1 leans on human confirm-the-settle with machine suggestions.

## v1 scope
- Manual market creation from one datamining source (Discord-Datamining commits)
- LMSR YES/NO trading with play-money balances
- Human resolution with a machine-suggested outcome
- Forecaster leaderboard (profit + Brier)
- Public market pages with price history

## Out of scope
- Real-money betting
- Fully automatic resolution
- More than one datamining source
- On-chain / crypto anything

## Risks & unknowns
- Resolution ambiguity (staged rollouts, region gating) makes settling contentious
- Datamining sources are noisy; LLM classification will surface junk markets
- Real-money framing invites legal trouble — must stay play-money
- Thin liquidity on niche markets makes prices meaningless

## Done means
A user can open a market seeded from a real datamining commit, trade YES/NO against an LMSR that moves prices correctly, and see it settle to the right payout with leaderboard Brier scores updating after an admin confirms the machine-suggested resolution.
