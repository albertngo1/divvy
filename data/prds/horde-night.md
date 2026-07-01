## Overview
Horde Night is a tiny macOS menubar survival game fed entirely by real system telemetry, aimed at homelab tinkerers and anyone whose uptime is a point of pride. It borrows 7 Days to Die's core loop — survive the days, brace for the horde — and maps it onto your computer's actual health. The joke and the hook: the game rewards you for *not* rebooting, in delicious tension with the "have you restarted your computer this week?" hygiene nag.

## Problem
System-health tools are dashboards nobody watches. Uptime is bragged about but never *played*. There's no ambient, emotionally engaging way to feel your machine slowly accreting cruft — and no fun reason to ever deliberately clear it. Horde Night makes memory leaks visceral.

## How it works
Each real uptime-day is a game day, shown in the menubar. Accumulating cruft — defunct/zombie processes, RSS growth of leaky apps, temp-file count, swap pressure — spawns "zombies." Your base HP is free RAM and disk headroom. Every 7th uptime-day is Horde Night: a one-screen siege whose intensity scales with how much cruft you've let build, attacking your base. Survive and your score/streak climbs. Reboot and you "die and respawn": the map resets, cruft clears, streak lost. Do you chase the high-uptime score, or reboot for hygiene and start over?

## Technical approach
Swift menubar app (LSUIElement). Poll `sysctl kern.boottime` for uptime, `vm_stat` for memory/swap, `ps` for defunct-process and per-process RSS deltas, `df` for disk headroom. Map metrics to game state: spawn rate = leaked MB/hour, horde intensity = f(uptime_days, cruft_index). A small state machine drives a Canvas/SpriteKit render of a base being swarmed. Persist {streak, best_uptime, scores[]} in a JSON/plist. Fire an ntfy push on Horde Night. The hard part is turning noisy, machine-specific OS metrics into a *fair, legible* difficulty curve — honest damage mapping, not RNG dressed up as telemetry — with per-machine baselining.

## v1 scope
- Menubar shows current uptime "day" and a cruft meter
- Horde Night every 7 uptime-days with a one-screen siege animation + score
- Streak that resets on reboot

## Out of scope
- Base-building, loot, upgrades
- Cross-machine leaderboards
- Windows/Linux ports

## Risks & unknowns
- Metric noise producing unfair difficulty spikes
- Sandbox/permission limits on `ps`/`vm_stat`
- People may just... reboot, ending runs fast

## Done means
The menubar shows my real uptime as a day counter and a live cruft meter; leaving the machine running raises spawn pressure; on the 7th day I get an ntfy alert and a siege screen scored by my accumulated cruft; rebooting visibly resets the run and clears my streak.
