## Overview
Daemon Farm is a cozy tending sim painted directly over the live process table of a real machine. Every daemon, container, and stray script becomes a living thing on an isometric plot; caring for your farm *is* caring for your box. For homelabbers and devs who saw "Have you restarted your computer this week?" and felt personally attacked.

## Problem
Uptime rot is invisible. Zombie and defunct processes pile up, forgotten containers leak memory, a runaway script has been pinning a core since Tuesday — and none of it shows up until something falls over. `htop` tells the truth but inspires no one to act. There's no *feeling* attached to neglect, so nothing gets tended.

## How it works
A tiny local agent reads your process and container state; the browser renders it as a farm. A healthy long-lived process is a crop that visibly grows with age and steady CPU. A memory hog becomes an overgrown, weed-choked plant. Zombie/defunct processes sprout as literal weeds. Docker containers are livestock (a happy container grazes; an unhealthy one is sick). Daily "weather" is driven by load average — storms when the box is thrashing. You act by *reaping*: kill or restart a process to "harvest" it, clearing weeds and earning coins. The nag is gentle, not a red dashboard: your farm just looks better after you tend it.

## Technical approach
Local daemon in Go or Node exposing `/api/state` on localhost. Sources: `ps -eo pid,ppid,etime,rss,pcpu,stat,comm`, `/proc` on Linux, `docker ps --format json` + `docker stats --no-stream`, optional `systemctl list-units`. Front-end is canvas/PixiJS, isometric tiles. Data model: one entity per pid/container `{id, name, ageSec, rssMB, cpuPct, state, kind}` mapped through a heuristic (name/regex → crop vs. livestock vs. weed) into a sprite state machine (seedling→mature→overgrown, or healthy→sick). The genuinely hard part is making "harvest" safe: never offer to reap PID 1, kernel threads, or a protect-list; require a confirm with the real command shown; support dry-run. Secondary hard part is cross-platform `ps`/etime parsing.

## v1 scope
- Read-only farm rendering of current processes + docker containers.
- Zombie/defunct processes clearly rendered as weeds.
- Manual "reap" on exactly one selected process, behind a confirm dialog showing the exact `kill`/`docker restart` command.

## Out of scope
- Multi-host fleets, remote SSH targets, historical time-series.
- Save games, economy balancing, achievements.
- Auto-remediation or scheduled reaping (too dangerous for v1).

## Risks & unknowns
One mis-mapped "weed" that's actually load-bearing and a careless reap takes down a service — the protect-list and confirm are the whole safety story. Process→sprite heuristics will be noisy. Docker socket permissions vary. Charm could wear off once the novelty fades.

## Done means
Running the agent on the mac-mini and opening the page shows the actual running Docker containers as livestock and a deliberately-spawned `sleep`+defunct process rendered as a weed; clicking the weed, confirming the shown command, removes both the process and the weed from the farm.
