## Overview
First Party is a mischievous idle/incremental game that plugs into your Pi-hole (or AdGuard Home) and turns your household's real blocked-tracker stream into game currency. You play the data broker monetizing yourself: every beacon your smart TV, phones, and LG monitor try to phone home with becomes a coin you spend building a satirical surveillance empire. The dark joke lands because the numbers are yours.

## Problem
We read stories like "LG monitors silently install software" and "landlords secretly using AI images" and feel a dull, abstract dread. Pi-hole's dashboard shows *N queries blocked today* as a dead statistic. The leakage is real and constant but never *visceral* — you never confront how much your own devices try to sell you out, minute by minute.

## How it works
The game reads your Pi-hole's blocked-query events. Each blocked tracker mints one "data point." You spend data points on upgrades from the actual adtech playbook: buy a DMP (2× per-beacon value), acquire a competitor (offline multiplier), "enrich with location," prestige by "exiting to private equity" for a permanent boost. Idle math accrues while you're away from your household's real overnight leakage. A live ticker shows the *actual* domains being blocked right now and a deliberately absurd dollar valuation. The point of the meta: your empire's wealth is a direct, honest readout of how much your home leaks.

## Technical approach
Backend: small Python/FastAPI service reading Pi-hole FTL's `pihole-FTL.db` SQLite (`query_storage` table, status codes 1/9/etc. = blocked) or the FTL API, tailing new rows since last cursor. It maps blocked domains to satirical "data products" via a bundled category list (EasyPrivacy-derived: analytics, ad, fingerprinting). Game state (coins, upgrades, prestige) in SQLite; economy is a standard idle curve (cost = base·growthⁿ). Frontend: a single-page canvas/HTML idle UI polling `/events`. Hard part: the real event stream is bursty and sleeps when the house sleeps, which breaks idle-game pacing — smooth it with a rolling "passive income" rate estimated from your trailing 24h beacon average, so nighttime still ticks.

## v1 scope
- Read Pi-hole blocked events since a cursor, mint coins
- 6 upgrades + one prestige on a working cost curve
- Live blocked-domain ticker with satirical valuations
- Persistent state across restarts

## Out of scope
- AdGuard/other backends (Pi-hole only at first)
- Multiplayer/leaderboards
- Any real network interception (we only read what Pi-hole already logs)

## Risks & unknowns
- Pi-hole FTL schema shifts between versions; prefer the API where stable
- Households with light traffic get a boring economy — tune coin value
- Satire must stay clearly satire, not "leak more!" advice

## Done means
Pointing it at a live Pi-hole, blocking a tracker on a real device (e.g. loading a page on your phone) visibly increments the coin counter within a poll cycle, and buying the first upgrade raises the per-beacon payout on the next blocked event.
