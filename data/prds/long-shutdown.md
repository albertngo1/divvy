## Overview
Long Shutdown is a somber, systems-y reverse city-builder. You inherit a running mega-machine — a particle collider or a reactor like decommissioned Shoreham — and your job is to bring it to green-field (or safe stewardship) over years, without an incident. For people who love Cities: Skylines' interlocking systems but are quietly tired of games that only ever mean *more*.

## Problem
Every builder game rewards growth. Yet the hardest, most dignified act in real engineering is *stopping* something safely — CERN entering Long Shutdown 3, a reactor going cold. Nothing models the patience and danger of winding a giant system down. Deletion isn't a right-click; it's a sequence with consequences.

## How it works
The facility is a grid of subsystem tiles — cryogenics, coolant loops, magnets, activated components. Each must move through a real shutdown *sequence* (Operating → Cooldown → Drain → Dismantle → Clear) with prerequisites and timers. Radioactive tiles carry residual hazard with genuine half-lives — you cool it, drain it, then *wait* while it decays before it's safe to dismantle. Budget and public trust are resources; cutting corners rolls incidents. Time is compressed (a decade in ~30 minutes), and cordoning a hot tile to let it decay is a valid, sometimes optimal, play.

## Technical approach
Web canvas game (PixiJS) or Godot-web export. Each tile is a small state machine with prerequisite gates and timers. Hazard model uses exponential decay `A(t)=A0·e^(−λt)` with real isotope half-lives (Co-60 5.27y, Cs-137 30y) driving how long a tile stays "hot" and untouchable. Global scalars for budget and trust; an event system weights incidents by corner-cutting. Flavor and numbers grounded in public decommissioning timelines (IAEA, NRC Shoreham docs). The hard part is *pacing*: making waiting feel meaningful rather than idle-boring — so decay is rendered visibly, tiles cooling red→blue as their activity drops.

## v1 scope
- One facility, ~12 tiles, 3 hazard isotopes
- Budget resource + one incident type
- Win = every tile reaches Clear before bankruptcy

## Out of scope
- Multiple facilities, campaign, staff management, tech tree, narrative mode

## Risks & unknowns
The "waiting simulator" trap; balancing budget vs. time vs. safety; a somber tone may narrow appeal. Half-life gates could feel like arbitrary cooldowns if not surfaced well.

## Done means
I play a full session, correctly sequence at least one radioactive tile through cooldown→decay-wait→dismantle honoring its half-life gate, trigger and recover from one incident, and reach a clear win/lose screen.
