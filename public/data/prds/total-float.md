## Overview
A single-user planner that answers the opposite question from every other planner. Instead of "what should I do today," it computes **total float**: how many days each obligation can slip before it actually endangers its deadline. For people who carry twelve half-urgent things and feel uniformly guilty about all of them.

## Problem
Anxiety about obligations is mostly uncertainty about slack. A to-do list flattens a taxes deadline six weeks out and a permit renewal due Thursday into the same red row. Project managers solved this in 1959 with the critical path method — forward pass, backward pass, float per activity — and nobody ever pointed it at a person's own life. You cannot *safely* procrastinate without knowing how much room you have; so you either thrash or you avoid.

## How it works
1. You declare commitments: name, hard deadline, estimated effort hours, optional dependencies ("can't file until statements arrive").
2. You declare a capacity calendar: usable hours per weekday, holidays, travel blackouts.
3. Forward pass gives earliest start/finish; backward pass from each deadline gives latest start/finish; float = LS − ES.
4. Crucially, classic CPM float assumes infinite parallel capacity and badly overstates your slack. So the scheduler does a **resource-constrained ALAP pass** — list-scheduling tasks as late as possible against the hours calendar — and reports that as true float.
5. Duration estimates get a log-normal spread; 1,000 Monte Carlo runs yield P(miss) per task, so the output is "3.5 days float, 4% miss risk," not a binary.
6. The screen is a sorted float-bar chart: zero-float bars at top (today's actual floor, usually one or two things), everything else stamped **"safe to ignore for N more days."** A weekly report shows float burn-down — the resource you spend by doing nothing.

## Technical approach
TypeScript, single-file SQLite, local web UI. `ical.js` to import deadlines from an `.ics` export or CalDAV. Data model: `task(id, deadline, effort_h, p50/p90, status)`, `dep(pred, succ)`, `capacity(date, hours)`. Algorithms: topological sort → CPM forward/backward pass → backward list scheduling with a capacity ledger → Monte Carlo wrapper resampling durations and re-running the ALAP pass. The genuinely hard part is estimate calibration: log your p50/p90 guesses versus actuals and fit a personal inflation factor, so float stops being a lie you tell yourself.

## v1 scope
- A YAML file of ≤10 tasks, no dependencies, one flat hours-per-day number.
- Forward/backward pass only, printed as an ASCII float table in the terminal.
- One derived line: "start today: X. Everything else can wait."

## Out of scope
Multi-user, calendar write-back, notifications, mobile, any auto-scheduling of your day.

## Risks & unknowns
Garbage estimates poison everything. ALAP schedules are structurally fragile — zero buffer by construction — so a configurable safety margin is mandatory. And "you may ignore this" may be read as permission to fail rather than permission to relax.

## Done means
Given a fixture of 15 tasks with deadlines, dependencies and a 4h/day capacity calendar, the tool reproduces a hand-computed latest-start table exactly, flags precisely the two zero-float tasks, and prints a per-task P(miss) that shifts correctly when capacity is halved.
