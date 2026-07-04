## Overview
A local web app that reframes your recurring bills (AWS + SaaS + subscriptions) as a Monster Hunter quest. For indie hackers and devs watching cloud and subscription spend creep upward with no satisfying way to fight back. Directly lifts the MH combat loop (Monster Hunter: World is on the Steam list) into personal finance.

## Problem
Recurring charges are a diffuse, faceless blob you never actually confront — you glance at the total, wince, and move on. Monster Hunter's genius is turning a terrifying blob into a *legible creature*: it has parts, telegraphed attacks, and weaknesses you learn over repeated hunts. That exact loop is what a bill audit lacks.

## How it works
Import your charges. Total monthly spend becomes a monster with a health bar. Each recurring line item is a body part with its own HP (= its cost). The monster has "telegraphed attacks" — upcoming annual renewals and this-month anomaly spikes flash a warning. You *hunt*: break a part (cancel or downsize) to carve materials (savings), logged as cumulative loot. Repeated hunts in a category unlock "knowledge" — a note about a cheaper alternative (the monster's weakness).

## Technical approach
React + SQLite (sql.js in-browser) with CSV import; optional AWS Cost Explorer `GetCostAndUsage` (grouped by SERVICE) and Plaid recurring-transactions later. Recurrence detection clusters transactions by amount + cadence (monthly ≈ 28–31d, annual ≈ 365d) with fuzzy amount matching. Anomaly = current charge vs trailing median > k·MAD. Data model: `Charge`, `Part{category, hp, cadence, next_date}`, `Hunt{part, action, savings, ts}`. The hard part is robust recurring-charge detection from messy statement text (merchant-name drift, variable amounts) and honestly normalizing annual vs monthly onto one health bar.

## v1 scope
- CSV import of a card/bank statement
- Cluster into recurring "parts" with monthly-normalized HP
- Render the monster with per-part HP bars
- Mark a part "slain" → log savings, update running carved-total

## Out of scope
- Live bank sync, real AWS API, mobile
- Actually cancelling anything for you
- Multi-currency, shared/household accounts

## Risks & unknowns
- Gamification-gimmick fatigue after the novelty wears off.
- Recurrence false positives (a twice-bought coincidence flagged as a subscription).
- Annual-vs-monthly normalization can mislead if done naively.

## Done means
Import a 12-month CSV, see recurring subscriptions rendered as parts with correct monthly-normalized HP, "slay" three of them, and the carved-savings total exactly equals the summed monthly cost of those three.
