## Overview
On Three is a 3-4 player cooperative lock-cracking sprint. The shared host screen is a vault door with a ring of dials and a countdown; each phone controls exactly one dial. The catch: your dial's correct value isn't printed on your phone — it's computed from a number that lives on someone else's phone, so the only way to set it is to talk. Then the whole room must release simultaneously.

## Problem
Most synchronized-action games ("everyone tap on 3") are pure reflex. On Three puts a private-information puzzle in front of the sync: you can't even know your target until the table broadcasts values, and you can't win until the broadcast, the mental math, and the timing all land together.

## How it works
**Private on each phone:** a SEED number (e.g. 7) shown only to you, a RULE referencing another color ("Set your dial to RED's seed minus 2"), and a draggable dial (0-9). You can see your own dial position but never anyone else's seed.

**Shared host screen:** the vault, four unlabeled dial gauges reflecting live positions, a mic-less "ALL HOLDING?" indicator, and a 3-2-1 launch marker.

**Flow:** Players shout their seeds ("RED is seven!") so everyone can compute their own target. You drag your dial to the computed value and press-and-hold LOCK. When all four are holding, the host screen starts a shared 3-2-1; on "go" everyone must RELEASE within a ~300ms window. If all dials are correct AND releases land in-window, the vault opens. Wrong value, or a release outside the window, resets the dials and burns a few seconds off the clock.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object). Data model: `player{seed, ruleTargetColor, ruleOp, dialValue, holding, releaseTs}`, `room{clockMs, canonicalTargets{}, phase}`. Sync: dial drags and LOCK/RELEASE send timestamped events; server holds the shared countdown and evaluates the release window against RTT-normalized client timestamps. **Genuinely hard part:** fair simultaneous-release detection across phones with different latency — server measures per-client RTT via ping, adjusts each `releaseTs` before checking the window, and owns the authoritative "go" instant so no phone's clock drift decides the outcome. Seeds/rules must form a solvable dependency graph with no cycles.

## v1 scope
- One vault, 4 dials, 3-4 players
- One seed + one single-operand rule per phone
- Shared 3-2-1 with ~300ms release window
- Reset-on-fail with a single 60s clock

## Out of scope
- Multi-step rules, chained dependencies, decoy seeds
- Multiple vaults / rounds / scoring
- Any audio verification of the shouted numbers

## Risks & unknowns
- 300ms window may be brutal over cellular; may need adaptive tolerance from measured jitter
- Rule graph generator must guarantee a unique, cycle-free solution
- Players might text seeds instead of speaking — keep seeds visible only briefly / on the vibrating phone to keep voice load-bearing

## Done means
Four phones each show a distinct seed + cross-reference rule; the room shouts seeds, each dial reaches its correct computed value, and a single synchronized release inside the window opens the vault — while any wrong value or off-beat release visibly resets the lock.
