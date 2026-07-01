## Overview
Sandman is a once-a-day roguelike for anyone with a sleep-tracking wearable. Each morning, the sleep you just had becomes a hand-crafted dungeon floor. It replaces the shaming "73/100" sleep score with a game you either clear or die in — giving the number consequences instead of guilt.

## Problem
Sleep scores are a single passive number that makes you feel bad and grants zero agency. You can't *do* anything with a bad night, and a good night gets no reward beyond a green ring. There's no loop, no stakes, no reason to return.

## How it works
On wake, Sandman pulls last night's sleep architecture and seeds a short (3–5 min) turn-based crawl. The mapping is honest and legible: total sleep = floor size and starting energy; deep sleep = HP and armor; REM = spell slots and loot rarity; number of awakenings = enemy/trap count; HRV = crit chance. You get exactly one run per real night — the dungeon is fixed, so no save-scumming. A great night is a clearable, rewarding floor; a <5h night spawns "The Fog" (enemies you can't see until adjacent). Relics carried between mornings mean a good-sleep streak compounds into real power.

## Technical approach
Static web app (or menubar wrapper). Sleep data via the Garmin Connect MCP already on the homelab (`get_sleep_data`, `get_hrv_data`) — falls back to manual paste or Apple Health export. Dungeon gen and FOV via **rot.js**, rendered to canvas. A **mulberry32** PRNG is seeded from `hash(date + deepMin + remMin + awakeCount + hrv)`, guaranteeing one deterministic floor per night. Data model: nightly record `{date, durationMin, deepMin, remMin, lightMin, awakeCount, hrv}` → derived combat stats via a tuning table. Meta-progression (relics, high-score streak) in IndexedDB. The genuinely hard part is difficulty balance: mapping messy, sometimes-missing wearable data into floors that stay *fair-but-hard* on bad nights instead of unwinnable, and making the crawl fun as a game even if you strip the gimmick.

## v1 scope
- Single floor, 3 enemy types
- One stat mapping: duration→size, deep→HP, awakenings→enemy count
- Manual paste of last night's 4 numbers (no auto-sync)
- Deterministic seed; win/lose screen

## Out of scope
- Auto-sync from wearable
- Relic meta-tree, multiple floors, bosses
- Leaderboards / multiplayer

## Risks & unknowns
- Sleep-stage granularity varies wildly by device
- Balancing "hard because you slept badly" vs. "just unfair"
- Novelty fades unless the core crawl is fun on its own merits

## Done means
Paste last night's four numbers → a deterministic, playable single-floor dungeon renders and can be won or lost in under 5 minutes, and the same numbers always regenerate the identical floor.
