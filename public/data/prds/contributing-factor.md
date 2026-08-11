## Overview

A personal incident-investigation tool. When something small goes wrong — missed the train, forgot the meds, snapped at your partner, burned dinner, sent the email to the wrong thread — you spend 90 seconds filing a structured report. Over months it doesn't just show you a list of screwups; it runs an actual case-crossover analysis and tells you which conditions were genuinely elevated before incidents versus how often those same conditions are present on ordinary days. Solo, local-first, for people who suspect their failures have a pattern but can't see it.

## Problem

Self-reflection has no control group. You remember the three times you skipped breakfast and then had a terrible afternoon; you don't remember the forty times you skipped breakfast and the afternoon was fine. Every journaling app makes this worse by only ever recording the bad days — the denominator is structurally missing, so any pattern you "notice" is guaranteed to be confirmation bias with a nice font.

## How it works

1. **File a report.** One hotkey. Freeform "what happened" line, then a 12-item yes/no exposure checklist covering the preceding few hours: slept short, ate nothing, back-to-back calls, was rushing, phone in hand, someone else waiting on me, unfamiliar place, alcohol yesterday, etc. Checklist is yours to edit.
2. **The control-day ambush.** This is the whole point. For each incident, the tool schedules 3 matched control prompts — same weekday, same time of day, drawn from the prior 6 weeks — and pings you to answer the *identical* checklist about that window. You get the prompt without seeing whether it's a case or a control.
3. **The board.** Once an exposure has ≥8 incident-days behind it, it graduates from the "not enough data" shelf onto a Swiss-cheese view: each exposure a slice, hole size proportional to its matched odds ratio, and the deck sorted so the slice that lines up behind the most incidents floats to the top.
4. **The read.** `"Rushing": present before 11 of 14 incidents, present on 9 of 42 control windows. OR 5.4 (95% CI 1.6-18). n is small; treat as a hypothesis.`

## Technical approach

Tauri + SQLite, entirely local, no account. Schema: `incidents(id, ts, description, severity 1-3)`, `windows(id, incident_id nullable, ts_start, ts_end, kind: case|control, matched_to)`, `exposures(window_id, factor_id, value)`, `factors(id, label, active)`. Control-window sampling is stratified: same ISO weekday, same 3-hour bucket, uniform over the trailing 42 days, excluding any day that already contains an incident of the same category (contaminated control) — that exclusion is the fiddly bit and where naive implementations quietly bias everything.

Statistics are Mantel-Haenszel odds ratios over matched strata (one stratum per incident and its controls), with Miettinen test-based confidence intervals; conditional logistic regression via a small Newton-Raphson fit for the multi-factor view once n is large enough. Everything under n=8 renders as a grey "insufficient" chip rather than a number, because a two-incident odds ratio is worse than no answer. Calendar (CalDAV/ICS read) can auto-fill three of the checklist items — meeting density, travel, back-to-back — so the manual burden shrinks over time.

## v1 scope

- Global hotkey → incident form, fixed 12-factor checklist
- Control-day scheduler with local notifications, 3 controls per incident
- One results screen: factor list sorted by OR, greyed until n≥8
- CSV export
- macOS only

## Out of scope

Wearables and sleep-tracker integration (that corner is crowded); mood tracking; causal DAGs; sharing; any advice or coaching text.

## Risks & unknowns

Adherence is the whole ballgame — if you stop answering control prompts, the tool degrades into an ordinary sad journal. Recall bias runs the wrong way (you scrutinize the bad window harder than the boring one), which inflates every OR; blinding the prompt helps but doesn't fix it. And the honest failure mode is that most people never log 8 of anything.

## Done means

After 60 days of real use with ≥10 filed incidents and ≥70% control-prompt response rate, the board surfaces at least one factor with a confidence interval excluding 1.0, and the underlying 2×2 table can be hand-checked against the CSV export.
