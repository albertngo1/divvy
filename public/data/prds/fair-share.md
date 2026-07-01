## Overview
Fair Share is a chore scheduler that borrows Slurm's actual scheduling model — fair-share, priority, backfill — and applies it to a household. You submit chores as jobs; the scheduler assigns them across people so that everyone's cumulative "chore-seconds" trend toward equal over time. For nerdy households (or roommates) who'd rather argue with an algorithm than each other.

## Problem
Chore assignment is either a rigid rota (breaks the moment someone's away) or vibes (breeds resentment). HPC schedulers solved exactly this problem for compute: allocate scarce capacity fairly across users with different histories and priorities. Steal it wholesale.

## How it works
Chores are jobs with an estimated duration and optional priority/deadline (`sbatch --job='clean bathroom' --time=25m --prio=high`). Each person is a "user" with a fair-share score based on recently completed chore-time (decayed over a window, like Slurm's usage half-life). The scheduler assigns pending jobs to whoever currently has the lowest effective priority (most "owed" work), respecting availability windows and deadlines via backfill. `squeue` shows the pending queue; `sinfo` shows each person's balance. Completing a job (`scompleted 42`) logs actual time and updates fair-share.

## Technical approach
Stack: a Python CLI + tiny FastAPI service on the homelab, SQLite store. Core tables: `users(id, availability)`, `jobs(id, desc, est_min, prio, deadline, state, assignee)`, `usage(user, minutes, ts)`. Fair-share score = decayed sum of usage over a half-life window; effective priority = `age_factor + prio - fairshare_penalty`, mirroring Slurm's multifactor plugin. The scheduler is a periodic loop: sort pending jobs by priority, assign each to the eligible least-loaded user, backfill short jobs into gaps. Optional ntfy push (already in the homelab) when a job lands on you. The hard part is honest estimates: like real HPC, garbage `--time` estimates wreck fairness — needs a feedback loop that learns per-person actuals per chore type.

## v1 scope
- CLI: `sbatch`, `squeue`, `sinfo`, `scompleted`
- Fair-share with decay + basic priority
- 2–4 users, SQLite
- ntfy notification on assignment

## Out of scope
- Web UI, mobile app
- Recurring-chore templates (add later)
- Calendar integration

## Risks & unknowns
- Estimate honesty — the whole fairness model leans on it
- Social friction if the algorithm feels unfair (needs a legible `why` command)
- Over-engineering a problem a whiteboard solves

## Done means
Over a simulated month of submitted chores, `sinfo` shows cumulative chore-minutes converging across users to within ~10%, deadlined jobs never miss, and `why 42` explains in one line why a job was assigned to a given person.
