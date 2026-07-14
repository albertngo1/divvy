## Overview
Duck Curve is a self-hosted load-shifting orchestrator for households on solar-oversupply tariffs — starting with Australia's new "three free daytime hours" mandate but generalizing to any time-of-use plan. It's for the tinkerer with a Home Assistant box, an EV, or a home battery who knows they're leaving money on the table but can't be bothered to hand-schedule appliances around a window their retailer defines differently every quarter.

## Problem
The mandate sounds simple — free power midday — but each retailer implements it as a maze: different hours, different eligible circuits, different "free" definitions (import-only, capped kWh, excludes EV chargers). Nobody reads their plan closely enough to actually exploit it, so the free energy evaporates. Existing HA automations are brittle one-offs pinned to hardcoded times that break when the tariff changes.

## How it works
You paste your plan (or pick a retailer preset). Duck Curve normalizes it into a canonical schedule of priced windows: `{start, end, price_c_per_kwh, caps, eligible_loads}`. A planner watches your controllable loads (via Home Assistant entities) and their deferrable energy needs — "EV needs 20 kWh by 7am," "dishwasher: 1 run/day" — and packs them into the cheapest feasible windows using a greedy interval fill with a battery model layered on top (charge in free window, discharge at evening peak). A running ledger logs kWh shifted × the price delta versus a flat-rate counterfactual, so you see cumulative dollars captured. A menubar/dashboard card says, in plain English, "Run the washing machine now — free for 47 more minutes."

## Technical approach
Stack: Python service beside Home Assistant, talking to it over the WebSocket API for entity state + `call_service` to switch loads. Tariff normalization is the genuinely hard part — retailer plans are prose PDFs and inconsistent JSON from the AER's Energy Made Easy CDR feed; v1 ships hand-authored YAML presets for the ~6 biggest AU retailers plus a generic editor. Data model: `Plan → Windows[]`, `Load(deferrable_kwh, deadline, min_run_minutes, eligible)`, `Ledger(events)`. Planner: interval-packing with per-window kWh caps; battery is a simple SoC state machine. Pull actual consumption from a shelly/emporia CT clamp or the retailer's CDR usage endpoint for ledger truth.

## v1 scope
- YAML plan presets for a few retailers + manual editor
- Control exactly one load type (a switchable circuit) into the free window
- Plain-English "run it now" card in HA
- Dollars-captured ledger vs flat-rate baseline

## Out of scope
- Battery optimization (stub the model, don't ship it)
- Auto-scraping tariff PDFs
- Non-AU markets, export/feed-in optimization

## Risks & unknowns
- Retailer free-window terms may be too varied to normalize cleanly
- Users without controllable loads get only nudges, not automation
- CDR data access requires accreditation; may need manual usage import

## Done means
Given a configured retailer preset and one switchable HA entity, Duck Curve automatically energizes it inside the free window, skips it outside, and the ledger shows a nonzero, hand-verifiable dollar figure after one real day.
