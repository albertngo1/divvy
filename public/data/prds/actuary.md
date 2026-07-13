## Overview
Actuary is a macOS menubar app (with an optional shared web leaderboard) that turns the diffuse, abstract idea of 'health risk' into a single running balance you can watch tick up and down all day. It's for the quantified-self crowd who already wear a watch but feel nothing looking at another line chart. The unit is the **microlife** (30 minutes of life expectancy) and the **micromort** (a 1-in-a-million chance of sudden death), popularized by David Spiegelhalter — the same framing behind the HN 'a full-body MRI earns you a year of smoking' post.

## Problem
Health data is passively consumed and instantly forgotten. A 6,000-step day, three beers, and a 90-minute highway drive each carry a real, quantifiable expected-mortality effect, but no app puts them on the same ledger in the same unit. Without a shared currency you can't feel the trade — 'was that cigarette worth the run?' has a literal answer nobody surfaces.

## How it works
A menubar coin shows today's net balance (e.g. `+2.3 microlives`). Passive credits/debits stream from Garmin (steps, VO2max band, sleep, resting HR). Active events are one-tap chips: drink, cigarette, 100 km driven, flight segment, sunburn, portion of processed meat. Each maps through a published risk table to microlives/micromorts. End of day you get a one-line verdict ('You spent 40 minutes of life and bought back 3 hours'). Optional friend league ranks weekly net balance — the mischievous 'compete over what you passively consume' twist.

## Technical approach
Swift menubar app; local SQLite ledger. Garmin data via the existing Garmin Connect MCP/garminconnect endpoints (steps, vo2max_trend, sleep, rhr). The core is a versioned `risk_factors.json` — a curated table of effect sizes drawn from Spiegelhalter's microlife tables, GBD relative risks, and transport micromort figures — each entry `{event, unit, microlives|micromorts, source_url, ci}`. A small engine converts continuous Garmin metrics into daily microlife deltas via dose-response curves (e.g. step count → all-cause mortality HR). The genuinely hard part is honesty: presenting population-average effect sizes without implying personal precision, and handling double-counting (a run already reflected in steps and in a manual 'exercise' tap).

## v1 scope
- Menubar balance + today's itemized ledger
- ~15 hardcoded event chips with cited effect sizes
- Garmin steps + sleep + VO2max auto-credits
- Local history sparkline of daily net balance

## Out of scope
- Friend leaderboard / accounts
- Genetics, bloodwork, or any personalized model
- Android/iOS, Apple Health import

## Risks & unknowns
- Ethical/psychological: could feed health anxiety; needs a clear 'population averages, not you' disclaimer.
- Effect sizes are contested and confounded; combining them additively is a simplification to flag, not hide.
- Garmin auth fragility.

## Done means
On a normal day, logging 2 beers + a 30 km drive plus pulling real Garmin steps/sleep produces a signed microlife balance in the menubar within 2 seconds of the last tap, every debit/credit traces to a cited source on hover, and the daily total persists across restarts.
