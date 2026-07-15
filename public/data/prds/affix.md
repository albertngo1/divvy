## Overview
Affix turns your training log into a Last Epoch-style loot economy. Every completed activity drops an item with rolled 'affixes' pulled from the workout's real metrics; you hoard a stash, compare with friends, and chase legendary drops that only come from genuinely hard sessions. For lapsed athletes who bounce off dry stats dashboards but will absolutely grind for loot.

## Problem
ARPG players will do the same dungeon 400 times for a 0.1% better roll, yet the same people skip workouts because the reward (a line on a graph) is invisible. Garmin's own app is a spreadsheet. Steal the dopamine engine that already works and point it at real effort.

## How it works
After each activity, Affix generates one item. Item **base type** comes from sport (run=weapon, ride=armor, swim=amulet). **Item level** scales with duration/distance. **Affixes** map real metrics to ARPG stats: negative split → '+movement speed', high HR variance → '+crit chance', time in Zone 4/5 → '+fire damage', consistency streak → '+all resistances'. **Rarity** (white→magic→rare→legendary) is a weighted roll gated by effort percentile vs your own history, so a genuine PR is required for legendaries — you can't farm trash to cheese it. Items go to a grid stash; a weekly 'best-in-slot' loadout scores you against friends. No item does anything mechanical — the game *is* the roll and the comparison.

## Technical approach
Stack: a small Node/TypeScript service pulling from the Garmin Connect MCP already on the homelab (activities with HR series, pace splits, zones). Affix generation is a seeded PRNG keyed on the activity ID (so a workout always rolls the same item — no re-roll cheating). Data model: `Item {baseType, ilvl, affixes[], rarity, seed}`. Rarity roll: compute the session's effort score (TRIMP or Zone-weighted duration), find its percentile against a rolling 90-day window of the athlete's own sessions, map percentile→rarity weights. Frontend: a React stash grid with the familiar rarity color palette and hover tooltips. Hard part: affix mappings that feel *fair and legible* — a metric→stat table that rewards varied training instead of just 'go longer', without becoming a min-max treadmill that encourages overtraining.

## v1 scope
- Pull last 30 Garmin activities
- 3 base types, ~8 affixes, 4 rarity tiers
- Seeded per-activity roll, stash grid UI
- Personal-percentile rarity gate

## Out of scope
- Friend leaderboards / trading
- Crafting or re-rolling
- Non-Garmin data sources

## Risks & unknowns
- Could nudge unhealthy overtraining to chase legendaries — needs a rest-day 'buff' counterweight
- Affix balance is guesswork until playtested
- Novelty may fade without a social/comparison layer

## Done means
Syncing Albert's real Garmin history produces a deterministic stash where his hardest recent session visibly rolled the highest-rarity item, and re-running the sync never changes an already-generated item's stats.
