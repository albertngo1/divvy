## Overview
A darkly funny roguelike where you play the daemon-god of a single server that must stay online — but the longer your uptime, the worse the monsters. For programmers and roguelike fans who've dismissed the "restart your computer this week?" nag for 40 days straight.

## Problem
We treat uptime as pure virtue and reboots as failure, but real machines rot: memory leaks, zombie processes, thermal creep. No game turns the sysadmin's actual dilemma — push uptime for glory vs. reboot to clear the rot — into play. Sparked by the HN "have you restarted your computer" thread crossed with Risk of Rain 2's escalating-difficulty loop.

## How it works
Top-down dungeon = your machine's memory. Each in-game "day" of uptime, resources (RAM, CPU, heat) tick and cruft spawns: memory-leak slimes that grow into adjacent free cells every turn, zombie-process wraiths, thermal-throttle fire. You fight with a small deck of command-cards (`kill`, `nice`, `flush cache`). Score = uptime days survived. The twist: **reboot is a real action** that instantly clears all cruft and heals you — but wipes your run's loot and resets uptime to zero. So every night is a bluff against yourself: one more day for the high score, or bank safety. Deeper uptime unlocks elites, with a kernel-panic boss around day 30.

## Technical approach
TypeScript + rot.js for FOV and dungeon gen (or Godot if going juicier). Data model: `Machine {ram, cpu, heat, uptimeDay, entities[]}`. Cruft grows cellular-automata style — leaks spread to adjacent free cells each tick, so the memory map literally fills up. ~15 command-cards with cooldowns. Core systems: a turn scheduler plus spawn tables keyed to `uptimeDay` (monotonic difficulty) and a leak-growth sim tuned to stay solvable-but-scary. The hard part is tuning the reboot temptation so *both* choices feel costly every single night, and making system administration read as visceral combat.

## v1 scope
- One 20×20 machine map
- 3 cruft types, 6 command-cards
- Uptime score + reboot button that clears and resets
- A day-15 mini-boss

## Out of scope
- Multiple machines / networked bases
- Reading your real pmset log (that's an ambient-viz lane, not this)
- Meta-progression, mobile

## Risks & unknowns
"Abstract concept as dungeon" flops if the combat isn't fun on its own merits. Balancing the reboot inflection point *is* the whole game and is easy to get wrong — mitigate by playtesting the push-vs-reboot moment relentlessly.

## Done means
A run is playable from boot to reboot/death, cruft visibly fills the memory map turn by turn, and playtesters hit at least one genuinely agonizing "do I reboot now?" decision per run.
