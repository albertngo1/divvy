## Overview
Single Crystal is a browser-based process-discovery tycoon for people who love optimization games and industrial history. You run a fledgling turbine-blade foundry trying to cast defect-free single-crystal superalloy blades — the same tacit-knowledge wall the HN piece says keeps jet engines out of most countries. The twist: the winning 'recipe' is never given to you. You infer it from yield data across dozens of expensive, ruined runs.

## Problem
Most crafting/factory games hand you a tech tree: unlock the blueprint, press build. That's fantasy. Real advanced manufacturing is gated by *tacit* knowledge — process windows discovered through failure, not documents. No game models that itch: the slow, costly, statistical hunt for a recipe that can't be copied.

## How it works
Each run you set ~6 continuous parameters (alloy composition sliders, mold withdrawal rate, thermal gradient, seed crystal angle, vacuum level, remelt count). You pay for the run, then a metallographic report comes back: grain count, misorientation angle, porosity, creep-life estimate — plus a pass/fail. You never see the underlying function. Over runs you build a mental (and in-game notebook) model of the process window. Money is tight; a failed batch of blades bankrupts you if you brute-force. Contracts demand rising creep-life specs, pushing you deeper into a narrow multi-dimensional sweet spot. Rival foundries and 'poached engineer' events give partial hints.

## Technical approach
Pure client-side: TypeScript + a small canvas/DOM UI, no backend. The hidden yield model is a fixed multivariate function — a smooth ridge in 6D built from summed Gaussians plus a couple of hard cliffs (single defect classes) and mild per-run noise (date-seeded PRNG so a daily challenge shares one landscape). The 'metallography report' is deterministic sampling of that function with partial-observability: each measured metric reveals one projection, so the player triangulates. Data model: Run { params, seed, metrics, cost, verdict }; Save { cash, runs[], contracts[], notebook }. Hard part is *tuning the landscape* so it's learnable but never trivially gradient-descendable — needs deceptive local optima and coupled parameters so lazy hill-climbing stalls.

## v1 scope
- 3 tunable parameters, 2 report metrics, one hidden ridge
- One escalating contract chain (creep-life 500h → 900h)
- Cash economy, run cost, game-over on bankruptcy
- Notebook = a scatter of past runs colored by verdict

## Out of scope
- Multiplayer / rival AI foundries
- 3D casting visualization
- Real alloy data or physical accuracy

## Risks & unknowns
- Balance: too smooth = boring gradient walk; too noisy = feels random and unfair
- Communicating partial observability without a tutorial wall
- Fun of 'reading scatter plots' may be niche

## Done means
A fresh player, given no recipe, reaches the 900h contract within ~25 runs by reasoning from reports (not save-scumming), and a playtester can articulate *why* a param matters — proving the tacit model was actually learned.
