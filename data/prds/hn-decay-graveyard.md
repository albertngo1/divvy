# Show HN Graveyard

## Problem
Every day dozens of "Show HN" projects launch with hope. Most are dead within a year — domain
lapsed, repo archived, last commit forever ago. Nobody tracks the attrition, and the survivors
are more interesting *because* of the graveyard around them.

## What it is
A crawler that captures every Show HN post, then periodically re-checks each one: does the domain
resolve? Is the repo archived? When was the last commit? A visual timeline shows the cohort
decaying — and lets you filter to "still alive."

## Data sources
- HN Algolia API (`https://hn.algolia.com/api/v1/search_by_date?tags=show_hn`)
- HTTP HEAD on the linked domain
- GitHub API for repo `archived` + `pushed_at`

## v1
- Pull last 90 days of Show HN.
- Weekly liveness re-check, store results as JSON.
- Single page: dots colored alive/dying/dead, sized by HN points.

## Done means
You can see a cohort of launches and how many survived to today.
