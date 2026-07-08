## Overview
Side Effect is a 3–4 player co-op voice-diagnosis game (Spaceteam / Devils & the Details lineage). Each player is simultaneously a malfunctioning machine *and* a technician whose controls are secretly wired into someone else's machine. The shared TV is the plant-wide alarm panel; each phone is one machine's private cockpit.

## Problem
Most voice co-op games couple cause and effect on the same screen: you see a problem and you see the fix. Real coordination breaks down when the person feeling the pain and the person holding the fix are different people who don't know they're connected. Side Effect makes *symptom* and *cause* live on different phones by design — the only wire between them is your voice.

## How it works
Each phone privately shows two panels. TOP = your SYMPTOMS: 2–3 live gauges drifting toward red ("PRESSURE climbing", "TEMP falling"). BOTTOM = your CONTROLS: 2–3 dials you can turn — but the server has secretly wired each of your dials to a *different* player's symptom, and you're never told which. So the room narrates: "My pressure is redlining — somebody stop pumping!" Someone tries a dial; if a distant gauge moves, you shout "keep going!" or "wrong way!" It's blind mutual debugging by voice. The shared TV shows only the anonymized plant health bar and which machines are alarming (as numbers, not who controls them), so it can't shortcut the detective work. Stabilize all gauges into the green band simultaneously and hold for 3 seconds to win before the plant health bar empties.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object). Data model: per player `{gauges[], dials[]}` plus a hidden `wiring[]` mapping each dial → (targetPlayer, targetGauge, sign, gain). Server ticks ~4Hz: applies dial deltas through the wiring, drifts gauges toward red, recomputes global health, broadcasts each phone ONLY its own gauges+dials and the TV its aggregate. Sync: dial changes are rate-limited client events; server is sole authority on gauge state to prevent divergence. The genuinely hard part is tuning drift-vs-correction rates so the puzzle is solvable by talking but not solvable by one person mashing dials — and shaping the wiring graph so every fix requires at least one verbal handoff (no self-loops, at least one cross-dependency cycle).

## v1 scope
- 3 players, one round
- 2 gauges + 2 dials per phone
- Fixed wiring graph, one difficulty
- Win = all 6 gauges green, held 3s
- Single plant-health timer

## Out of scope
- Speech recognition (voice is human-to-human)
- Randomized/rotating wiring mid-round
- Multiple rounds, scoring, cosmetics

## Risks & unknowns
- Solvability: a badly shaped wiring graph is either trivial or hopeless — needs a generator/validator ensuring a talk-required solution path exists.
- 4Hz tick may feel laggy or twitchy; drift/gain constants need heavy playtesting.
- Cognitive load of watching your own gauges *while* turning dials for others could overwhelm — may need to cap to 2 gauges.

## Done means
Three phones each show private symptoms + private dials wired to others; turning a dial visibly moves a *different* phone's gauge; the room verbally reconciles cause and effect and drives all gauges green for 3 seconds before the health bar empties — with the TV never revealing who controls what.
