## Overview
Scrap Run is a decluttering-and-reselling game/app for people drowning in stuff. It transplants Lethal Company's core loop — a quota that ratchets up every cycle, meet it or the run ends — onto your own home: each week the "Company" issues a rising resale quota, and you photograph, list, and sell household items to clear it.

## Problem
Decluttering stalls because there's no urgency and no scoreboard. Resale apps optimize the *listing* but never the *habit* of continuously offloading. So people sit on clutter that has real market value and never build momentum.

## How it works
Start a "contract." The Company sets a weekly dollar quota — small at first, ratcheting each week just like Lethal Company's. You do "runs": walk the house, photograph items, log an estimated resale price to add them to your manifest (the "ship"). Actually selling an item — you mark it sold, real money changed hands — banks its value toward quota. Miss the quota by week's end and the run ends with a darkly comic "you've been let go" screen and final stats; hit it and the quota ratchets while your streak survives. "Monsters" are friction events: sentimental attachment (an item you keep re-listing but won't ship), lowball offers, and clutter creep (logging a new purchase adds negative pressure).

## Technical approach
Local-first PWA — React + IndexedDB, no account. Camera capture plus optional on-device classification (a small MobileNet via TensorFlow.js) suggests a category and a rough price band from a bundled comps table (median sold prices scraped once from eBay sold listings by category, shipped as static JSON). Data model: Contract → Weeks → Items (photo, category, est_value, status: manifest | sold | kept). The quota curve is a geometric ratchet with a difficulty knob; streak and run history live in local storage. Optional ntfy push for "quota due in 24h." The hard part is honest price estimation without live scraping — the bundled comps table plus a user-correction loop that learns a per-category multiplier.

## v1 scope
- Start a contract, set a starting quota
- Add items via photo + manual price, mark sold
- Weekly quota check with ratchet + win/lose screen
- Streak counter, fully local

## Out of scope
- Real marketplace integration / auto-listing
- Multiplayer crews, a shared ship
- Live price scraping

## Risks & unknowns
- Honesty problem: nothing enforces that "sold" means real money
- Price estimates may be laughably off per region
- Quota pressure could feel stressful instead of fun

## Done means
A user starts a contract, adds five photographed items, marks three sold to clear the week-1 quota, watches it ratchet for week 2, and holds a 2-week streak — all offline on their phone.
