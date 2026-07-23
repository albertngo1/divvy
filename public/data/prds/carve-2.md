## Overview
Carve reskins the Monster Hunter: World gameplay loop onto your own recurring expenses. Every subscription and recurring charge is a monster with a species, a size, and tracks you must read before you can hunt it. For anyone bleeding money on forgotten subscriptions who finds normal 'here's a list' trackers too boring to act on.

## Problem
Subscription creep is real and subscription trackers are inert — they show a list, you feel vaguely bad, you close the tab, nothing gets cancelled. There's no *motivation loop*. MHW's genius is that tracking, learning tells, and the satisfying kill make grinding compulsive. Point that at the thing people actually should grind: killing recurring charges.

## How it works
Import transactions; the engine clusters recurring charges into monsters, each with a species (streaming / SaaS / gym / insurance), a size (monthly $), and 'tracks' (its recurrence dates). To *track* a monster you confirm three sightings; its 'tell' is the predicted next charge date. Then you hunt: **capture** (downgrade a tier) or **slay** (cancel outright). Bigger, annual-renewal monsters drop more loot. A bestiary logs everything you've slain and a running 'damage dealt' = $/yr saved.

## Technical approach
CSV import first (Plaid as a later upgrade). Core is recurrence detection: normalize merchant strings, group by merchant+amount with a ~monthly/annual cadence tolerance window, and score confidence. Local SQLite ledger. The MHW loop is a thin state machine over that: tracks = detected occurrences, tell = predicted next date, slay/capture = ledger events. Optional real-world action via a curated map of known cancel-flow deep links — it never auto-cancels, just walks you to the door. Hard part: robust recurrence detection with variable amounts/dates and messy merchant normalization (the same Netflix charge shows up three different ways).

## v1 scope
- CSV import from one bank
- Detect recurring charges, render them as a bestiary
- Mark 'slain,' track running $/yr saved
- Predicted next-charge 'tell' per monster

## Out of scope
- Auto-cancellation
- Live Plaid sync
- Bill negotiation / retention offers

## Risks & unknowns
Recurrence false positives (one-off purchases mislabeled as monsters); the game framing may wear thin after the first satisfying purge; Plaid cost if it graduates past CSV.

## Done means
Import a real bank CSV, see ≥5 correctly-identified recurring charges rendered as monsters with next-charge tells, mark two as slain, and watch the running '$/yr saved' total update.
