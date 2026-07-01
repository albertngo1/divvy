## Overview
Volatile is a menu-bar/tray digital pet that lives exclusively in volatile memory (tmpfs / `/dev/shm`, never on disk). Its personality accrues with your machine's uptime, and it dies permanently on reboot. For tinkerers and homelabbers who leave machines running for weeks and treat uptime as a badge of honor.

## Problem
The HN front-page nag 'Have you restarted your computer this week?' frames rebooting as virtuous hygiene. Volatile inverts the moral: a reboot is a tiny funeral. It weaponizes the exact advice everyone gives you into stakes you can feel.

## How it works
When you hatch an egg, a daemon seeds a RAM-only PRNG and starts writing its entire state to memory. The pet ages every hour of uptime and reacts to real system events — a long uptime makes it wise; heavy CPU makes it anxious; opening lots of new apps makes it social. A small face in the menu bar shows mood. Because state lives only in RAM, a reboot wipes it irrecoverably. The trick that makes death legible: the pet continuously streams a growing *epitaph* (its life-story-so-far) to a persistent log. On next boot, if an epitaph exists but the live RAM state is gone, Volatile shows a tombstone screen narrating the pet's life, then offers a fresh egg.

## Technical approach
Rust or Go daemon. Live state in `/dev/shm` on Linux or a RAM-backed tmpfs mount / pure in-process memory on macOS, launched via a launch agent that never persists snapshots. Uptime read from `sysctl kern.boottime`; process/app spawns via lightweight `ps` polling (or eBPF on Linux). Menu bar via Tauri or SwiftBar. Personality = a small mood state machine + a Markov event generator seeded by the RAM-only seed, so identity is genuinely unrecoverable. Epitaph appended to `~/.volatile/epitaph.log`. The genuinely hard part: distinguishing graceful shutdown from crash from sleep (color the death accordingly) and guaranteeing the live identity leaves zero on-disk trace while the tombstone still renders.

## v1 scope
- One species, menu-bar face with 4 moods
- Uptime-driven aging + 3 event reactions (CPU, new-app, idle)
- Epitaph streamed to disk
- Tombstone screen on first launch after a detected reboot
- Hatch-a-new-egg flow

## Out of scope
- Cloud backup or cross-machine sync (would defeat the entire premise)
- Multiplayer / social features
- Fine-grained sleep/hibernate modeling

## Risks & unknowns
- Sleep vs reboot ambiguity could cause false deaths
- Guilt-trip mechanic may annoy rather than delight
- macOS sandbox limits on process observation

## Done means
Run it for a day and the pet visibly ages and logs life events; reboot the machine and the next launch shows a tombstone narrating that pet's life before offering a new egg; a filesystem scan during the pet's life confirms no live-state file exists on disk.
