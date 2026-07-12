## Overview
Ostracon is a browser turn-based management sim set in Deir el-Medina, the New Kingdom village of the artisans who cut and painted the royal tombs. You are the scribe of the tomb, allocating state rations to the crew. It's a small, historically-grounded resource game for people who like Frostpunk-style pressure but hate combat — sparked directly by the HN 'Deir el-Medina Strikes' Wikipedia link.

## Problem
Most management sims invent fantasy economies. But there's a real, exquisitely documented one sitting in a Wikipedia article and a corpus of ostraca (inscribed pottery shards): ration ledgers, absence records, and the first labor strike in recorded history (year 29 of Ramesses III). It's begging to be a game and nobody's made the *tight, honest* version.

## How it works
1. Each turn is a workday (the Egyptian 10-day week has 8 work days). You draw rations from the state warehouse and distribute grain/fish/beer/vegetables to ~40 named workmen and their families.
2. Deliveries from the treasury arrive late and short — following the real historical shortfall pattern that triggered the strike.
3. Morale per worker tracks accumulated ration debt and grievances (illness, a scorpion sting, 'brewing beer for the festival' — real recorded absence excuses appear as flavor events).
4. When morale collapses across the crew, they down tools and stage a sit-in at the mortuary temple of Thutmose III — you must negotiate, borrow grain, or appeal up the chain, each with consequences.
5. Win condition: finish excavating and decorating the royal tomb before the pharaoh dies (a countdown you can't see precisely).

## Technical approach
- Pure client-side: TypeScript + a tiny state machine, no backend. Deterministic seeded RNG so runs are shareable/replayable.
- Data model: `Worker{name, family_size, morale, ration_debt, skills}`, `Warehouse{grain, fish, beer, veg}`, `Delivery{day, promised, actual}`. Delivery schedule seeded from digitized ostraca figures (hand-transcribed into a JSON table for v1).
- Core loop is a resource-allocation solver the *player* does by hand; the sim just applies morale deltas and checks the strike threshold.
- Rendering: HTML/CSS ledger aesthetic — it should look like a papyrus account sheet, columns of hieratic-styled tallies.
- Hard part: tuning the morale/strike model so the strike feels inevitable-yet-avoidable, and curating enough authentic ostraca events to feel researched rather than themed.

## v1 scope
- 30 turns, ~12 named workers, one ration type (grain) plus one luxury (beer).
- Hardcoded historical delivery-shortfall schedule.
- One strike event with 3 negotiation options.
- Papyrus-styled ledger UI; win/lose screen.

## Out of scope
- Full tomb-decoration minigame, multiple pharaohs, family trees.
- Multiplayer, save/cloud sync.
- Actual hieratic text rendering (styled Latin is fine for v1).

## Risks & unknowns
- Historical data is sparse and scholarly; transcribing believable ration figures takes real reading.
- 'Spreadsheet as game' can feel dry without strong writing on the event cards.
- Balancing the single strike so it's the climax, not a coin flip.

## Done means
A player can complete a 30-turn run, deliberately underpay the crew to trigger the strike, resolve it via a negotiation choice, and reach a win or loss screen — with at least 15 distinct authentic-flavored event cards drawn from the ostraca record.
