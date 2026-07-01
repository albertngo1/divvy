## Overview
Cold Spot is a macOS menu-bar game that reframes system diagnostics as a Phasmophobia investigation. Your machine is 'haunted' — battery's dying, fans are spinning, network's chattering — and you must collect evidence, match it against a bestiary of culprits, and correctly name the process doing the haunting.

## Problem
When a laptop is inexplicably hot, loud, or draining, Activity Monitor dumps a wall of numbers with no narrative. Phasmophobia nails the exact loop that's missing: gather 3 pieces of evidence, cross-reference a journal, commit to an identification. That structure turns 'why is my fan screaming' from anxious guesswork into a satisfying deduction.

## How it works
Each 'contract' is a current anomaly (battery drain, thermal spike, network chatter). You deploy evidence tools — the 'EMF reader' samples per-process CPU, the 'thermometer' reads package temp, the 'spirit box' taps network connections, the 'UV light' checks disk I/O and wakeups. Each tool marks which evidence a suspect exhibits. A bestiary lists culprit archetypes ('Runaway Indexer', 'Zombie Helper', 'Chatty Sync Daemon', 'Cursed Browser Tab'), each defined by a fixed combination of evidence markers — just like a ghost's three-evidence signature. You cross off suspects until one matches, then 'exorcise' (kill/quit) it and see if the anomaly clears, scoring your accuracy.

## Technical approach
Stack: Swift menu-bar app (or Tauri + a small helper). Data sources: `top`/`powermetrics` (needs sudo, gate behind a one-time helper), `nettop`/`lsof` for connections, `pmset -g batt`, IOKit SMC for temps, `ps` for wakeups. Data model: `Suspect { pid, name, evidence: Set<Marker> }`, `Culprit { name, requiredMarkers, remedy }`; deduction = filter culprits whose `requiredMarkers ⊆ observedMarkers`. Sampling runs on a timer, diffing snapshots to attribute the anomaly. Hard part: attributing a *system-level* symptom (battery drain) to a *specific process* is genuinely fuzzy — lean on correlation over time (which suspect's activity tracks the symptom curve) and present confidence, not certainty.

## v1 scope
- One contract type: battery drain
- Two evidence tools (CPU EMF, wakeups UV)
- 4-entry bestiary with fixed evidence signatures
- Manual 'exorcise' = send quit, then re-measure

## Out of scope
- Windows/Linux
- Auto-killing anything without confirmation
- Historical haunting logs / trends
- Multiplayer

## Risks & unknowns
- Symptom→process attribution is inherently uncertain; overclaiming would erode trust
- `powermetrics` privilege prompts hurt onboarding
- Killing a system process could destabilize the Mac — whitelist safe-to-quit only

## Done means
While a runaway process drains battery, Cold Spot samples evidence, narrows the bestiary to the correct culprit archetype, names the offending PID, and confirms the drain eases after you quit it.
