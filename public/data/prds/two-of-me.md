## Overview
A weekly report plus menubar sparkline that measures your **serial fraction** — the share of your week that only you can do, in sequence — and derives the maximum speedup any amount of help could ever give you. For people who keep adding agents, contractors, or VAs and notice the week is not getting shorter.

## Problem
You bought parallelism. You have three agents and a part-time assistant, and the week still ends on Sunday night. Amdahl explains why: if 68% of your week is irreducibly serial, infinite help caps you at 1.47×. Nobody knows their own serial fraction, so everyone over-buys help and then blames their own discipline for the result. The fix isn't more workers; it's finding out which number you're actually fighting.

## How it works
Three inputs, two of which you already have:
1. **Task ledger** — Todoist/Things/GitHub issues/`git log`.
2. **Attention log** — ActivityWatch or macOS frontmost-app events, giving minutes-on-what.
3. **One tag per task**, ~10 seconds a week: `me-only`, `handoffable`, or `blocked-on-other`.

It builds a weekly DAG (explicit blockers plus inferred ordering), finds the critical path, and computes:
- serial fraction `f` = attention-minutes on `me-only` tasks lying on the critical path ÷ total attention minutes
- ceiling `S_max = 1/f`
- the marginal curve `S(n) = 1 / (f + (1-f)/n)`, rendered as "a second you: 1.31×. A fifth: 1.44×. Infinite: 1.47×. That's the wall."

The ambient artifact is a year-long sparkline of `f`. If you're genuinely learning to delegate it drifts down. Most people's drifts up, because every hour freed by help gets refilled with the serial part — which is the honest, uncomfortable version of Gustafson's rebuttal.

## Technical approach
Python + SQLite backend, Tauri or Swift tray. Sources: ActivityWatch local REST API (`GET /api/0/buckets/<id>/events`), `NSWorkspace` frontmost notifications as fallback, Google Calendar API (every meeting is serial by definition — you cannot attend two), GitHub REST issue open/close timestamps, `git log --author --date=iso`. Critical path via `networkx.dag_longest_path` weighted by wall-clock span.

The hard part is dependency inference. Naive temporal ordering over-connects — with enough tasks everything appears to follow everything. Fix: only draw an inferred edge when the ordering holds in ≥3 of the last 8 weeks for the same *project pair*, not the same task instance; everything else needs an explicit tag. Second hard part is interrupts: an interrupt you serviced on the spot is serial even when the underlying task is tagged handoffable, so attention events shorter than ~4 minutes get attributed to the interrupting context, not the task.

## v1 scope
- No DAG at all. Two buckets: me-only minutes vs handoffable minutes
- Tagging via a `#solo` string in calendar event titles plus a static app→bucket mapping
- One cron job Sunday night, prints `f` and `S(n)` for n = 2, 3, 5, ∞
- Output is a single line of text in a file

## Out of scope
Team mode, live tracking, writing back to your task manager, recommending *what* to delegate.

## Risks & unknowns
Tagging is the whole game and tagging always decays — if it exceeds 10 seconds a week the tool is dead. `f` is trivially gameable if you'd rather have a flattering number. And the metaphor has real limits: people aren't cores, handoff isn't free, and context-switch cost is nonlinear — so `S_max` is a strict upper bound and must be labeled as one, or it becomes a very confident lie.

## Done means
After four weeks of real data it emits an `f` with a noise band, and when you deliberately hand a real project to someone else, the following week's `f` moves in the predicted direction by more than that band.
