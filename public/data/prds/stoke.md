## Overview
Stoke is a menubar survival-idle game that inverts the whole genre. Idle games reward you for walking away and let numbers grow while you do nothing. Stoke does the opposite: a tiny Don't-Starve-style campfire and settlement only advances while your real body is moving. Your step count is the only fuel. It's for desk-bound people (developers, writers) who want a movement nudge that feels like caretaking, not nagging.

## Problem
Standing-desk reminders and Apple's "time to stand" rings are trivially dismissed and emotionally inert. Idle/incremental games are compelling precisely because they run on autopilot — which is the wrong incentive for someone glued to a chair. Nobody has tied the dopamine of an idle number-goes-up loop to actually getting off your ass.

## How it works
A small pixel campfire sits in your menubar/desktop. The fire has a fuel gauge that decays continuously on an exponential half-life. The ONLY way to add fuel is real-world movement: every N steps (read live from HealthKit/Garmin) drops a log on the fire and mints "wood" currency. Spend wood to expand the camp — a tent, a drying rack, a second survivor — each of which unlocks a slower decay or a passive multiplier, but ONLY while the fire is lit. Let the fire go out (too many sedentary hours) and the camp "freezes over": buildings gray out, survivors leave, and you restart the fire from a single spark. A gentle roguelike wrinkle: each in-game day the camp faces a random hazard (cold snap, wolves) that costs extra fuel, so a long sit is genuinely dangerous.

## Technical approach
Swift/SwiftUI menubar app on macOS; HealthKit `HKStatisticsCollectionQuery` for live step deltas (or Garmin Connect via a local poll for non-Apple watches). State is a tiny SQLite/`UserDefaults` blob: `{fuel, lastTickTs, wood, buildings[]}`. Core loop is a 60s timer computing `fuel *= exp(-dt/halflife)` and crediting `floor(newSteps/stepsPerLog)` logs. Rendering is a hand-drawn 32x32 sprite sheet animated by fuel level (roaring → embers → dead). The genuinely hard part is honest anti-cheat and graceful gaps: HealthKit backfills steps in bursts, so naive polling either double-counts or reads zero — need a monotonic cumulative-count watermark and a "you were asleep, fire banked" grace window so overnight doesn't nuke a week of progress.

## v1 scope
- Menubar fire with fuel gauge + step→log crediting
- Exponential decay + "fire out" reset
- Wood currency + 3 buildings with decay/multiplier effects
- Local persistence, no account

## Out of scope
- Multiplayer / shared camps
- Windows/Linux
- Garmin path (Apple-only v1)
- Cloud sync

## Risks & unknowns
- HealthKit step latency may make the loop feel laggy; may need to blend in Core Motion pedometer for live feel.
- Punishing decay could feel like a chore rather than a game — tuning the half-life is everything.
- People walk away from computers legitimately (meetings) and shouldn't be punished — needs an away detection.

## Done means
Walking ~500 steps visibly adds logs and brightens the fire within a minute; sitting for 3 hours lets the fire visibly die and freezes the camp; relaunching restores exact state; a full sedentary workday reliably ends with a dark camp and a movement-day ends with an expanded one.
