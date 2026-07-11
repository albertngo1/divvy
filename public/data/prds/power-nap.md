## Overview
Power Nap is a menubar/idle game wired to your actual self-hosted stack. It inverts the Cookie Clicker loop: instead of ramping production ever upward, you profit from *inactivity*. Each Docker container is a little sleeping creature, and idle time (measured by real scale-to-zero telemetry) mints your currency. For homelabbers who feel guilty about 20 always-on services.

## Problem
Idle games train you to want numbers going up forever; homelabs quietly burn power doing nothing. Power Nap flips both—it makes over-provisioning visible and turns 'my services are asleep' into a score you optimize, gamifying the genuinely-good behavior of scaling to zero.

## How it works
Every container is a critter on a shelf with a sleep meter. When a service goes idle and scales to zero (via **sablier**, the trending on-demand-container repo), its critter dozes off and starts minting 'Zzz' currency proportional to real idle seconds × its measured wattage. When traffic wakes a container, the critter groggily gets up and earning stops—with a little grumpy animation. You spend Zzz on upgrades that are actually real config nudges surfaced as toys: 'deeper sleep' (shorter sablier idle timeout), 'soundproofing' (dashboard mutes noisy health-check wakes), 'bunk beds' (group two rarely-used services). A prestige 'Lights Out' resets nightly and rewards your total overnight idle ratio.

## Technical approach
Small daemon in Go or Node reading the Docker API (`/containers/json`, stats stream) plus sablier's session state to know which services are parked at zero replicas. Estimate per-container wattage from CPU/GPU share of a user-supplied host TDP baseline (no real power meter needed for v1). State in SQLite; a menubar app (Tauri) or a tiny web dashboard renders the critter shelf with CSS/Canvas animations driven by live idle timers. The interesting bit is honest idle accounting: debounce flapping (health checks that wake a container for 2s shouldn't reset the whole nap) and attribute idle time correctly across sablier's on-demand start/stop transitions.

## v1 scope
- Poll Docker + sablier, detect scaled-to-zero services
- Critter shelf where sleeping containers mint Zzz per idle-second × est. wattage
- 3 upgrades that map to real sablier/timeout tweaks
- Nightly 'Lights Out' prestige showing overnight idle ratio

## Out of scope
- Real hardware power metering (Kill-A-Watt/PDU integration)
- Non-Docker backends (k8s, Proxmox) beyond what sablier already covers
- Actually writing config changes (upgrades are suggestions in v1)

## Risks & unknowns
- Wattage estimate from CPU share is crude; may mislead
- Health-check flapping makes idle accounting noisy
- Requires already running sablier—narrow audience

## Done means
With sablier scaling a test service to zero, its critter visibly falls asleep, the Zzz counter ticks up in proportion to real idle seconds, and generating traffic wakes the critter and pauses earning.
