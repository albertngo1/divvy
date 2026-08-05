## Overview

Major Order is a single-user wall dashboard that models household and personal upkeep as a persistent campaign map. Each area of life is a planet with a liberation percentage. Percentages fall continuously whether or not you're looking. Logging an operation pushes one back up. Once a week the system issues a single Major Order with a deadline, and if you miss it, a planet is lost — visibly, permanently in the campaign log.

For one person with a tablet on the fridge, not a family app and not a team tool.

## Problem

Every habit tracker treats tasks as binary and equal: check the box, get the streak. Real upkeep isn't binary — it's decay. The fridge is 70% clean; the taxes are 100% done until the day they aren't; the car's oil is a slow burn. Checklists also produce a flat, undifferentiated wall of items, so the thing that actually matters this week has the same visual weight as replacing a lightbulb. And streak-based apps punish you into deleting them. Nothing in the genre models *pressure that exists independent of you*.

## How it works

- Define planets: `Kitchen`, `Inbox`, `Car`, `Finances`, `Plants`, each with a half-life in days.
- Liberation is computed, never stored as a static number: `pct = 100 * 0.5^((now - last_op) / half_life)`, clamped.
- Logging an operation is one tap: it sets `last_op = now` for that planet, optionally at partial strength (a 60% op only restores to 60).
- Below 40% a planet turns amber; below 15% it's marked *occupied* and stops decaying (it can't get worse, it's just lost).
- Every Monday a scheduled job picks the lowest-liberation non-occupied planet and issues a **Major Order**: one specific objective, a 7-day deadline, and a stated consequence. Complete it and the planet gets a full liberation plus a campaign-log entry. Miss it and it goes occupied, with the failure recorded.
- The map is the whole UI: planets as circles sized by half-life, filled by liberation, connected in a lane. One banner for the active Major Order. No lists.

## Technical approach

SvelteKit + SQLite (better-sqlite3), served on the homelab, opened full-screen on a cheap wall tablet. Schema is small: `planets(id, name, half_life_days, weight)`, `operations(id, planet_id, ts, strength)`, `orders(id, planet_id, objective, issued_ts, due_ts, status)`. Liberation is a pure function of `(now, last_op, half_life)` computed at render — no cron needed to "tick," which removes an entire class of drift bugs.

One cron job (node-cron, Monday 06:00) issues orders. Objective text comes from a per-planet list of concrete operations the user wrote once, picked round-robin so it never says "clean the kitchen" three weeks running.

The hard part is **half-life calibration**. Guessed values make the map either permanently red (demoralizing, gets abandoned in week two) or permanently green (useless). Mitigation: after 8 weeks, fit each planet's half-life from observed inter-operation intervals — set it so the median real gap lands at ~55% liberation, which keeps the map mostly amber and legible.

Rendering: plain SVG, no chart library. Server-Sent Events to refresh the wall tablet when a phone logs an op.

## v1 scope

- Five hardcoded planets defined in a JSON config file
- Decay formula + SVG map, single page
- Tap a planet to log a full-strength op
- Major Order issued by cron, completed by tapping the banner
- Campaign log as a plain reverse-chronological list at the bottom

## Out of scope

Multi-user, phone notifications, recurring-schedule import from calendar, any "suggested by AI" objectives, sharing.

## Risks & unknowns

The occupied-planet mechanic may read as punishing rather than clarifying — needs a liberation campaign to win a planet back, or people will just delete the row. Half-life fitting needs ~8 weeks of data before it's worth anything, so early experience rides entirely on guessed values. Genuine risk this becomes a chore about chores.

## Done means

Running untouched for 30 days on the wall tablet, having issued four Major Orders, with at least one planet lost and one retaken — and the map readable, correctly, from across the room.
