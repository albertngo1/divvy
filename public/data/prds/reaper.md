## Overview
Reaper is a small daemon + CLI that autopsies OOM-killer events on a self-hosted Linux box and explains them in plain language, with a specific fix. Named after the kernel's own `oom_reaper` thread. For homelabbers who see a service vanish and have no idea the kernel shot it.

## Problem
The HN pairing of 'PostgreSQL and the OOM killer' and 'FreeBSD ate my RAM' is the whole itch: memory pressure kills processes silently, and the evidence — a wall of `dmesg` with per-task `rss`, `oom_score_adj`, cgroup limits, and `vm.overcommit` settings — is legible only to people who already understand it. Everyone else just restarts the container and prays. This is cheap capability for a developer (parse the log, know the semantics) that's genuinely valuable to the self-hosting niche who can't read it.

## How it works
Reaper tails the kernel log (journald/`kmsg`). On an 'Out of memory: Killed process' event it captures the surrounding block, parses the task table the kernel dumps, and reconstructs the scene: total RAM + swap, who was the biggest consumer, why *this* victim won (highest `oom_score`, adjusted by `oom_score_adj`), whether a cgroup/container memory limit was the trigger vs. global pressure, and the current `overcommit_memory`/`swappiness` settings. It emits a one-screen 'death certificate' and a ranked fix list ('raise this container's limit', 'add swap', 'set overcommit to 2', 'this service leaks — restart on schedule'), plus an ntfy push.

## Technical approach
Go single binary. Reads `/dev/kmsg` and journald via sd-journal; regex/state-machine parser for the OOM block format (stable-ish across kernels but versioned parsers needed). Enriches with `/proc/meminfo`, `/sys/fs/cgroup/*/memory.*`, and sysctl reads at event time. Data model: an Event { victim, invoker, cgroup, mem_snapshot, contributors[], verdict, fixes[] }. Verdict logic is a rules engine over those fields. Hard part is robust parsing across kernel versions and correctly distinguishing cgroup-local OOM from global OOM — the fix differs completely.

## v1 scope
- Parse a captured OOM dmesg block into a death certificate
- Global-vs-cgroup verdict + top-3 fixes
- ntfy alert on new event
- `reaper last` CLI to reprint the most recent autopsy

## Out of scope
- Historical dashboard / web UI
- Prometheus metrics export
- Non-Linux (the FreeBSD case is inspiration only)

## Risks & unknowns
- Kernel-version parser drift
- cgroup v1 vs v2 layout differences
- Fix advice being confidently wrong for edge cases

## Done means
Deliberately OOM a memory-limited container; Reaper detects it within seconds, correctly names the victim and the cgroup limit as the cause, recommends raising the limit or adding swap, and pushes an ntfy alert.
