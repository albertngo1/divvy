## Overview
Restitution is a 1–4 player co-op stealth game that runs the PAYDAY heist fantasy backwards. Instead of casing a vault to *steal*, your crew infiltrates a gallery to *return* a stolen artifact to its rightful case — quietly, before opening, without anyone realizing a reverse-crime happened.

## Problem
Heist games are saturated (PAYDAY, and every Garry's Mod heist map). The verb 'take' is exhausted. The unexplored, mischievous inverse — the anxiety of putting something *back* exactly where it belongs while every system is designed to catch a taker — is a fresh loop with built-in narrative and comedy. Guards escalate as if robbed; you're the least-expected intruder.

## How it works
Each level is a museum with a target pedestal. You carry a fragile artifact (drop it and it shatters — mission fail) through patrol cones, pressure plates, and camera arcs. The twist mechanics: (1) the pedestal has a *precise* placement puzzle — orientation, plinth height, correct alcove — so you can't just toss it; (2) returning the piece re-arms its own alarm, so the final act is the tensest; (3) guards read your presence as a robbery-in-progress and lock down toward the *exits*, which you must now beat while empty-handed and innocent-looking. Co-op roles: carrier, lookout (marks cones), archivist (solves the placement puzzle).

## Technical approach
Stack: Godot 4 (GDScript), built for cheap networked co-op via Godot's high-level multiplayer + a lightweight authoritative host. AI: guards use a NavMesh + vision-cone perception (raycast to player, light-level modifier) feeding a small state machine (patrol → suspicious → search → lockdown), with a shared 'alert level' blackboard. Artifact carry is a physics-constrained rigid body with a fragility threshold on impulse. The placement puzzle is a transform-match check (position + rotation within epsilon, correct slot id). Hardest part is making 'putting it back' *tense rather than tedious*: tuning the re-arm timing, the fragility so drops feel fair, and lockdown pathing so the empty-handed escape is the climax, not an anticlimax.

## v1 scope
- One museum level, one artifact, one pedestal placement puzzle
- Solo + 2-player co-op (host-authoritative)
- Guard patrol, vision cones, three alert states, exit-lockdown on detection
- Fragility fail + placement-success win states

## Out of scope
- Progression/unlocks, cosmetics
- Loud/combat playstyle (no guns)
- Level editor, matchmaking (invite/host code only)

## Risks & unknowns
- 'Return' may feel like fetch-quest chores without strong pacing hooks — needs playtesting.
- Netcode desync on the carried physics object is a classic footgun.
- Reverse-alarm re-arm must be legible to players or it reads as unfair.

## Done means
Two players can join via host code, carry a fragile artifact past patrolling guards to the pedestal, complete the placement puzzle to win, fail on a drop, and trigger exit-lockdown when spotted — all in one shippable level.
