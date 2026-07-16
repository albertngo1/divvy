## Overview
Reversion is a darkly comic browser tycoon where you play the streaming/store executive maximizing revenue by exploiting the gap between 'buy' and 'license.' You silently pull titles from customers' owned libraries, watch churn and outrage rise, and try to time re-releases so people re-buy what they already paid for. Same satirical DNA as a billing-villain sim, aimed at anyone who's ever had a movie vanish from their account.

## Problem
The Sony 'we deleted movies you bought' story keeps repeating and everyone feels it but can't do anything. Reversion turns that helpless anger into a playable, legible system — you see exactly how the incentive math rewards revocation, which is a sharper critique than an angry thread.

## How it works
Each turn is a fiscal quarter. You hold a catalog of licensed titles, each with a license-cost timer, a 'owned by N customers' count, and a goodwill value. Actions: renew a license (costs money), let it lapse and revoke it from owners (saves cost, spikes outrage, may trigger a re-buy window later), issue a 'remastered' re-release, or quietly downgrade resolution. Meters: Revenue, Goodwill, Regulatory Heat, and Press. Push revocation too hard and a class-action / consumer-protection event fires and can end your run. Real delisting events surface as flavor cards ('a major studio just yanked 100 titles — copy them?').

## Technical approach
Stack: static front-end (Svelte or React) + a small state machine; no backend needed for v1. Data model: title records seeded from a curated JSON built from publicly reported delisting/revocation incidents (news coverage of Sony/PSN, Ultraviolet shutdown, Funimation, etc.) — real names, real years, as satire flavor and event triggers. Core loop: a per-quarter simulation where revoke actions adjust customer goodwill via a decay/backlash curve and probabilistically open re-purchase windows; a Regulatory Heat integrator crosses thresholds to spawn scripted crisis events. A reveal screen after each run compares your revoked-title count to the real documented incident it echoed. Hard part: tuning the economy so revocation is tempting but self-defeating enough to make the satirical point land.

## v1 scope
- ~30 seeded real-ish titles + 8 event cards
- 12-quarter run with 4 meters and 3 core actions (renew/revoke/re-release)
- One losing condition (class-action) and a post-run 'real incident' reveal
- Wordle-style shareable end card ('I revoked 214 owned copies')

## Out of scope
- Multiplayer / persistent economy
- Real platform data or account integration
- Art beyond simple card/meter UI

## Risks & unknowns
- Naming real companies as villains → keep it clearly satire, incidents cited
- Economy balancing to avoid a dominant strategy
- 'Playing the villain' fatigue — needs sharp writing to stay fun

## Done means
A full 12-quarter run is playable start to finish in a browser with no backend, at least one revocation-heavy strategy triggers the class-action ending, and the reveal screen correctly maps the run to a cited real delisting incident.
