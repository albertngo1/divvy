## Overview
Fallow is a gentle tending game grafted onto your real relationships. Each person you know is a houseplant in a glanceable greenhouse; neglect makes them droop, reaching out perks them back up. It's the inverse of a sales CRM (hat-tip to EspoCRM's data model, flipped from conversion to care) — for people who lose touch and are repelled by streak-shaming apps.

## Problem
Friendships decay silently and we only notice when it's awkwardly late. CRMs and 'keep in touch' apps feel transactional and guilt-driven — red badges, broken streaks, nagging notifications. Nobody wants to be scolded into friendship. The itch: an ambient, forgiving *state* you can glance at, not a taskmaster.

## How it works
You add people with a last-contacted date and a personal cadence. Crucially, every relationship has its *own* natural rhythm: some friends are cacti (monthly is plenty), some are ferns (weekly or they wilt). The greenhouse renders each person as a plant whose droop and colour reflect `days_since_contact` relative to *their* cadence — not a universal streak. Logging a reach-out 'waters' the plant and it perks up. No push nagging, no streaks to break; it's a picture of your social garden, glanceable in three seconds.

## Technical approach
Static app + localStorage. Import a CSV (name, last_contact, cadence) or add manually — deliberately no creepy inbox scraping in v1. Decay function per plant: `wilt = clamp(days_since / expected_cadence, 0, 1)`, driving an SVG plant morph (leaf droop angle + colour desaturation). 'Species' is chosen by cadence bucket for visual variety. Stretch: auto-learn each person's cadence as the median gap between historical contacts. The hard part is twofold: sourcing last-contacted data without being invasive (CSV/manual for now), and shaping a decay curve that *nudges without guilt-tripping* — it should celebrate watering, never punish wilting.

## v1 scope
- Manually add ~10 people
- Per-person cadence setting
- Daily wilt-state update
- 'Water' button resets one plant
- localStorage persistence

## Out of scope
- Auto-ingesting Messages/email logs
- Notifications of any kind
- Mobile app
- Sharing / social features

## Risks & unknowns
- Guilt-trip vibe is the core failure mode → design to celebrate, never scold
- Manual-entry friction may kill adoption
- Auto-learned cadence needs history most people can't easily export

## Done means
Add several people with different cadences, advance the clock, watch plants wilt at correctly different rates, 'water' one and see it recover, and confirm the whole greenhouse state survives a page reload.
