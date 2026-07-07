## Overview
Severance is a phone app that turns decluttering-and-reselling into a Lethal Company-style shift game. You work for The Company, which sets an escalating weekly quota (in dollars of stuff sold or donated). Your home is the scavenging site; clutter is scrap; missing quota threatens your employment. For pack-rats who want to sell/purge their backlog but never do.

## Problem
Everyone has $2k of resellable stuff rotting in closets, but the actual work — pricing it, deciding keep/sell/toss, listing it — is boring and unrewarding, so it never happens. Marie Kondo asks a feeling; Lethal Company asks a *number that goes up*, and that's weirdly more motivating.

## How it works
Each Monday the Company issues a quota (e.g. $80, then $120, then $175...). You go on 'shifts': walk a room, snap a photo of an item, the app appraises it against real sold-comps and logs its value toward quota. Marking it Sold/Donated/Trashed banks the value. A day-of-week timer and a rising quota curve create pressure; overshooting banks a small buffer. Miss quota and you get a darkly funny 'termination review'; a run resets but your all-time purge total persists. Weekly recap shows lbs decluttered and $ recovered.

## Technical approach
Stack: React Native (Expo) + SQLite (WatermelonDB). Appraisal: on-device image classify to a category (MobileNet/CoreML) narrows a text field, then query eBay Browse API `sold/completed` comps (or Terapeak) for a median price; barcode scan path uses UPC lookup for books/media (ISBN → BookScouter/eBay). Data model: `Item(photo, category, est_value, state, shift_id)`, `Quota(week, target, banked)`. Quota curve mirrors Lethal Company's superlinear ramp: `target = base * 1.4^week`. Hard part: appraisal accuracy on messy real-world objects — mitigated by showing a low/median/high range and letting the user tap the comp that matches, which also trains category priors.

## v1 scope
- Manual item entry with photo + category dropdown
- eBay sold-comps median as est value (single API)
- Weekly quota with superlinear ramp + banked total
- One 'you're terminated / you survived' end-of-week screen

## Out of scope
- Actually listing items for sale (just track intent)
- On-device image classification (type it in v1)
- Multiplayer/leaderboards
- Donation-value tax receipts

## Risks & unknowns
- eBay API rate limits / auth complexity for a hobby app
- Comps for niche items are thin → wild valuations
- Theme could feel bleak rather than fun (tune the writing)
- People may game quota by logging without actually purging

## Done means
I can complete one week: log 5 real items, each gets a plausible $ estimate from live eBay comps, the app sums them against a quota, and rolls to next week with a higher target and a persisted lifetime purge total — all without leaving the app.
