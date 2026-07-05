## Overview
Encounter Table is a single-player roguelike *planner* you play the night before. It ingests tomorrow's calendar and renders your day as a linear dungeon: each meeting is a room with a monster whose difficulty scales with length and attendee count. Your hit points for the run are your current Garmin body-battery. You pre-plan a route — which encounters to fully engage, which to skip, where to rest — so you reach the boss (end of day) without hitting zero. For knowledge workers who feel their calendar is a survival game and want to *feel* that before it happens.

## Problem
Calendar apps show you a wall of blocks with no sense of cost. You can't feel that back-to-back 8-person meetings on four hours of sleep is a death march until you're mid-death-march. The push: steal a game genre (roguelike) and graft it onto real personal data (calendar + biometrics) so tomorrow's load becomes something you can strategize against.

## How it works
Each evening a run is generated. Encounters are cards along a path: `damage = base(meeting_minutes) × attendee_multiplier × context_penalty`, where recurring 1:1s are weak mobs and the surprise 10-person "quick sync" is a mini-boss. You have a small hand of abilities seeded by your Garmin readiness/sleep: *Focus* (full-clear an encounter for full XP), *Skim* (half damage, half reward), *Flee* (skip — but unresolved encounters can 'ambush' you next run as debt). You spend HP (body-battery) routing through; the game shows whether your plan survives to the boss or flatlines at 3pm, nudging you to actually decline something. Morning after, it reconciles: did you follow the route?

## Technical approach
Local Node/TypeScript app (Albert's homelab). Data: Google Calendar API `events.list` for tomorrow's window; Garmin Connect MCP for `get_body_battery`, `get_training_readiness`, and `get_sleep_summary`. Deterministic run generation is seeded by the date so replays match. The dungeon layout is a simple DAG of encounter nodes; damage/reward is a tuned scalar model, no ML needed. Rendering is a terminal TUI (Ink) or a small SvelteKit page. The genuinely hard part is calibrating the damage curve so the game's verdict *matches lived reality* — needs a feedback loop comparing predicted end-of-day HP to next-morning actual body-battery and auto-adjusting the multipliers.

## v1 scope
- Read tomorrow's calendar + current body-battery
- Generate a linear encounter list with computed damage
- One ability (Skip) and a pass/fail 'do you survive to EOD' verdict
- Print it as a TUI the night before

## Out of scope
- Writing back to the calendar / auto-declining
- Multiplayer or shared party runs
- XP/leveling meta-progression across days

## Risks & unknowns
- Damage model may feel arbitrary until calibrated over ~2 weeks
- Body-battery is a coarse proxy for meeting cost
- Could feel like a gimmick if it doesn't change a single decision

## Done means
The night before a real workday, running one command prints tomorrow's meetings as encounters with damage, shows my body-battery HP draining across them, and flags at least one meeting whose removal flips the run from 'flatline' to 'survive'.
