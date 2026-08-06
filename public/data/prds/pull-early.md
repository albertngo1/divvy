## Overview
A one-page web tool for anyone cooking a large piece of meat. You enter thickness and shape, then type in the probe temperature every minute (or connect a BLE probe later). It continuously solves the inverse heat-conduction problem for *your specific* roast in *your specific* oven, then forward-simulates the rest period and tells you: pull at 118°F, peak will be 130°F in 14 minutes. It also integrates pathogen lethality, so it can tell you your chicken is already safer at 150°F held than at 165°F instantaneous.

## Problem
Every cooking thermometer alarms at a setpoint. But meat keeps cooking after it leaves the oven — carryover ranges from ~2°F on a steak to ~15°F on a prime rib, and it depends on thickness, oven temperature, and how steep the internal gradient is at pull time. Recipes handle this with a folk constant ("pull 10 degrees early"), which is wrong at both ends. Nobody ships the actual physics, even though the probe is already streaming exactly the data needed to identify the model.

## How it works
1. Enter geometry: shape (slab / cylinder / sphere) and thickness in mm. Enter oven set temperature.
2. Log probe readings as the cook proceeds. After ~15 minutes of data, the fit stabilizes.
3. The app fits thermal diffusivity α and surface heat-transfer coefficient h to your observed center-temperature curve.
4. It then forward-runs the model with the oven boundary condition swapped for still room air, sweeps candidate pull temperatures, and reports the one whose predicted peak equals your target. A live countdown replaces the useless setpoint alarm.
5. A second readout: cumulative log₁₀ reduction of *Salmonella* at the center node.

## Technical approach
Pure client-side TypeScript, no backend, state in localStorage.
- **Forward model:** 1-D transient conduction on a 60-node radial or slab grid, Crank–Nicolson (unconditionally stable, so 1 s steps are fine), Robin boundary `-k ∂T/∂x = h(T_s − T_∞)`, symmetry at center.
- **Inverse fit:** Levenberg–Marquardt (`ml-levenberg-marquardt`, ~10 kB) over parameters (α, h), minimizing squared residual against all logged readings. Seed α = 1.4e-7 m²/s (beef), h = 15 W/m²K (natural convection oven). Refit on every new reading; show a confidence band from the covariance.
- **Lethality:** integrate `F = ∫ 10^((T(t) − T_ref)/z) dt` at the coldest node with USDA Appendix A values (z = 7.5°F for poultry), convert to log reduction against the published D-value at T_ref. Display as "7.2-log kill achieved at 14:32."
- **Data model:** `{cookId, shape, thickness_mm, T_oven, readings: [{t, T}], fit: {alpha, h, rmse}}`.

Genuinely hard part: **identifiability**. From a single center-point curve, α and h trade off against each other — a thin low-conductivity roast and a thick high-convection one produce nearly the same curve. Mitigations: require the thickness input (removes one degree of freedom), fit on the early steep transient where h dominates and the late flat region where α dominates separately, and refuse to give a countdown until RMSE < 1°F.

## v1 scope
- Manual temperature entry, one active cook, one shape (slab)
- Beef/pork only, fixed target 130°F, no lethality tab
- Pull-time countdown + predicted peak, nothing else
- Fit runs in the main thread (60 nodes × 3600 steps is milliseconds)

## Out of scope
Bluetooth probes (Combustion Inc. advertises 8 temps in a documented BLE payload — that's v2). Sous-vide. Multi-probe. Recipes. Accounts. Mobile app.

## Risks & unknowns
Evaporative cooling at the surface is not in the model and is real (a dry-brined roast behaves differently). Phase change from fat rendering and collagen denaturation adds latent-heat terms the pure conduction model ignores, likely biasing α upward. Whether a home cook will type numbers every minute — if not, the tool is dead until BLE lands.

## Done means
Across five real cooks of different thicknesses, the predicted peak center temperature is within ±2°F of the measured peak, and in every case the predicted pull temperature differs from the naive "target minus 10" rule by more than 3°F in at least two of them.
