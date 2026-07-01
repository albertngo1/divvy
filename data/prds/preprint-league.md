## Overview
Preprint League transplants the NBA 2K20 draft-and-season loop onto arXiv. Small groups of researchers, grad students, or science nerds draft freshly-posted preprints and compete over a fixed 'season' to see whose picks accrue the most real-world impact. It's fantasy football for people whose water-cooler talk is transformers and topology.

## Problem
Keeping up with arXiv is a firehose and reading it is a solitary, joyless scroll. Meanwhile everyone secretly bets on which preprints will 'blow up.' The itch: make paper-watching social and competitive, and reward the intuition of spotting a sleeper hit before it hits the front page.

## How it works
A league is created around a category (e.g. cs.LG or hep-th) with a draft window (say, papers posted in a given week). Players take turns snake-drafting preprints onto a roster of N. Over the following weeks the app scores each rostered paper on a weighted formula: citations gained, HN/Reddit appearances, Altmetric attention score, and version bumps (a sign of active work). There's a waiver wire for undrafted papers and a trade window. A weekly standings email declares the current champion and the 'bust of the week.'

## Technical approach
Stack: Next.js + a Postgres database + a nightly cron worker. Data sources: the arXiv API (`http://export.arxiv.org/api/query`) for the draft pool and metadata; Semantic Scholar Graph API (`/graph/v1/paper/arXiv:{id}`) for citation counts; the Altmetric API and the Algolia HN Search API (`hn.algolia.com/api/v1/search?query={arxiv_id}`) for buzz. Data model: `League`, `Team`, `RosterSlot {paper_id}`, and a `PaperStat {paper_id, date, citations, hn_points, altmetric}` time-series table. Scoring is a nightly job that diffs each stat vs the prior snapshot and applies league-configured weights, so points reflect *gains during the season*, not pre-draft fame. The genuinely hard part is de-duping paper identity across preprint versions and eventual journal DOIs, and normalizing wildly different citation velocities across fields so hep-th and cs.LG leagues are both playable.

## v1 scope
- Create a league seeded from one arXiv category + date range
- Manual snake draft among 2–4 players in one browser session
- Nightly cron pulling citation + HN-mention deltas for rostered papers
- A standings page with per-paper point breakdown

## Out of scope
- Auth/accounts beyond a shareable league link
- Waiver wire and trades
- Altmetric (paid) — start with free citation + HN signals
- Email digests

## Risks & unknowns
- Citation counts move slowly; a multi-week season may feel sluggish, so HN/Altmetric spikes must carry early excitement.
- API rate limits (Semantic Scholar) at scale.
- Impact metrics are gameable and biased toward hype over quality — arguably the fun *and* the flaw.

## Done means
Four people can open a shared link, snake-draft ten cs.LG preprints from last week, and after a couple of nightly cron runs see a live standings table where a paper that just hit HN's front page visibly jumps its owner ahead.
