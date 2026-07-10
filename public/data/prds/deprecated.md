## Overview
Deprecated is a local-first roguelike/tower-defense that turns the tedious chore of dependency and patch management into a game played over your *actual* machine. Your installed packages are the units on the board; their real end-of-life and CVE status drives the difficulty. For homelabbers, self-hosters, and devs who know they're running something ancient but can't be bothered to look.

## Problem
Patch and EoL hygiene is invisible until it bites. `endoflife.date` and the CVE feed exist, but nobody reads them proactively — there's no felt urgency, no reward loop. The information is public and cheap; the motivation is the missing ingredient.

## How it works
On launch it scans your environment and lays each package out as a defensive unit on a lane leading to your "prod" core. A package nearing its EoL date visibly decays (cracks, dims). When a real CVE affecting one of your versions is published, it spawns an enemy wave marching down that package's lane. Your only defensive action is to *upgrade/patch* — spending limited "maintenance points" to bump a unit to a supported version, which repairs the lane. A breach reaching prod ends the run. Each real calendar day is a fresh seed derived from that day's actual CVE drops, so the game is different because your risk is different.

## Technical approach
Tauri (Rust + web UI) for the shell and native scan. Data: `brew list --versions`, `docker images`, `package.json`; matched against the free `endoflife.date` JSON API (`/api/<product>.json`) for support windows and against `CVEProject/cvelistV5` (or NVD) for advisories. A curated alias table maps local package names → endoflife product ids and CPE strings. The genuinely hard part is reliable identity resolution: mapping messy local version strings to canonical product/CPE identifiers without drowning in false positives.

## v1 scope
- `brew list` only
- 10 hand-mapped products with real EoL windows
- Static bundled CVE snapshot (no live fetch)
- One lane, one core, 3-minute run
- Wordle-style share string of your run

## Out of scope
- Docker/npm/pip scanning
- Live CVE polling
- Multiplayer or leaderboards
- Auto-applying upgrades for you

## Risks & unknowns
- CPE/version matching is noisy — false CVE hits would erode trust
- Might feel like a chore reskinned, not a game; the tower loop must actually be fun
- endoflife.date coverage is uneven across ecosystems

## Done means
Run the scan on a real Mac and see your 10 brew packages rendered as decaying towers labeled with their true EoL dates, then play a 3-minute run where a bundled CVE triggers a wave you either patch away or lose to.
