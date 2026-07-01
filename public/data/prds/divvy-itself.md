# Divvy

## Problem
Good ideas evaporate. They live in a notes app, a group chat, or a `weekend-project-ideas.md`
nobody reopens. There's no *place* that makes an idea feel alive — and no force that keeps
new ones arriving.

## What it is
A bubble cloud where each bubble is an idea. Click one and you get a real PRD, not a one-liner.
An autonomous agent scans the world on a timer, riffs new ideas, and adds new bubbles — so the
cloud grows on its own between visits.

## v1 (humiliatingly small)
- Static site on GitHub Pages. No backend, no accounts.
- `data/ideas.json` drives the cloud; `data/prds/<slug>.md` is the PRD per bubble.
- A local scanner (LaunchAgent) generates ideas + PRDs, commits, pushes. Pages redeploys.

## Explicitly NOT in v1
- Voting, friends, per-person work assignment, progress bars. (That's "Social Divvy" — later.)

## Done means
The cloud renders from real generated data, and clicking any bubble shows its PRD.
