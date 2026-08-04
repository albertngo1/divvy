## Overview
A macOS menubar toy that quietly inventories every background thing running on your machine and ranks it by *years since anyone cared*. The menubar shows one number: how many processes are alive with no evidence any human or program has used them this year. Clicking opens the factory floor — a list of vats still fermenting, each with a one-line epitaph. For any developer whose laptop has accumulated eight years of `brew services`, abandoned side-project daemons, and Docker containers from a job they left.

## Problem
Machines accrete daemons the way an abandoned factory accretes full vats. You installed `postgres@14` for a project that shipped in 2023; it still binds 5432 every boot. A LaunchAgent from an uninstalled app retries forever and logs nothing. Activity Monitor shows *what is running* and never *what is pointless* — the two look identical, which is exactly why nobody ever cleans up. Existing cleaners are uninstallers keyed on apps, not on evidence of non-use.

## How it works
A 15-minute sampler builds evidence of use over time, then the UI ranks by decay. Inventory sources: `~/Library/LaunchAgents`, `/Library/Launch{Agents,Daemons}`, `launchctl list` (last exit status, PID), user crontabs, `brew services list`, `docker ps -a`, Login Items, and `lsof -iTCP -sTCP:LISTEN`.

The evidence signals per item, sampled and stored:
- CPU-time delta from `proc_pid_rusage` — a process whose consumed CPU time never advances is genuinely idle, not merely quiet
- established-connection count on its listening sockets
- bytes appended to its `StandardOutPath`/log file
- plist mtime, binary mtime, and whether the target binary still exists at all

Decay score combines days-since-any-signal with "is the owning app even installed." The panel renders each entry with an epitaph: *"postgres@14 — listening on 5432 since Jan 2024. Zero connections in 90 days. Log last written 611 days ago."* Actions: reveal the plist, `launchctl bootout`, or **quarantine** — move the plist into a dated attic folder with one-key undo. Nothing is ever auto-killed.

## Technical approach
SwiftUI menubar app (`MenuBarExtra`), no helper daemon needed for v1 — a `Timer` in the app plus a LaunchAgent for the sampler if the app isn't running. Storage: SQLite (`item`, `sample(item_id, ts, cpu_ns, conn_count, log_bytes)`), a few MB per year. `proc_pid_rusage` and `proc_listpids` are called via a thin C shim; `lsof` and `launchctl` are shelled out and parsed.

The genuinely hard part is proving a negative: a silent daemon and a busy one look the same from outside. Monotonic CPU-time deltas are the cheap, correct discriminator — they require no eBPF, no entitlement, and no content inspection. Second hard part is safety: quarantining the wrong LaunchDaemon can break login or networking, so a hardcoded allowlist of Apple-owned labels (`com.apple.*`, MDM, security agents) is never actionable.

## v1 scope
- launchd agents/daemons + `brew services` + listening ports only
- 15-minute sampler into SQLite; needs 7 days before it accuses anything
- Menubar count + sorted list with epitaphs
- Quarantine-with-undo; no kill, no uninstall
- Apple/system labels shown but permanently non-actionable

## Out of scope
Linux/systemd, Docker cleanup actions, cron rewriting, network-wide scanning of the homelab, scheduling or auto-remediation.

## Risks & unknowns
Some legitimate daemons are correctly dormant for months (backup agents, security tooling) and will be accused — hence quarantine, not delete; TCC prompts for reading some plists; `launchctl` output format shifts between macOS releases; and the toy could be a one-time cleanup rather than a daily-glance widget.

## Done means
After 7 days sampling on a used dev Mac, the panel lists at least 5 items that are genuinely dead (binary missing, or zero CPU advance and zero connections for the whole window), with at most 1 false positive on manual review, and quarantine-then-undo restores a LaunchAgent to working order across a reboot.
