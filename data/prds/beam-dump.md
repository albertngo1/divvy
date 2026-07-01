## Overview
Beam Dump is a tiny CLI + web logbook that turns "restarting your computer / homelab" from a panicked `sudo reboot` into a calm, ordered ceremony — modeled on how CERN executes a Long Shutdown: nothing gets yanked, everything gets logged, and the machine comes back cold and clean. For homelabbers, self-hosters, and anyone with a machine that has 40 days of uptime and mystery memory bloat.

## Problem
The HN thread "Have you restarted your computer this week?" hits a nerve: we treat reboots as either trivial or terrifying. On a homelab running a dozen services (Jellyfin, *arr stack, MCP servers), a blind reboot risks corrupt DBs, half-written torrents, and a 20-minute scavenger hunt for what didn't come back. There's no *ceremony* — no ordered spin-down, no snapshot, no record of what state you left things in.

## How it works
You declare a `beamdump.toml` listing services in dependency order with pre/post hooks. Running `beamdump shutdown` executes a countdown sequence: quiesce (tell services to finish in-flight work), snapshot (btrfs/ZFS snap or `docker commit`), stop in reverse-dependency order, then power action. Each step is timestamped into a run report — an "experiment logbook" entry with uptime achieved, RAM reclaimed, and any service that refused to die. `beamdump status` shows time-since-last-dump and nags gently past a threshold. Boot-side, `beamdump recover` replays expected state and diffs against reality.

## Technical approach
Stack: a single Rust or Go binary (static, no runtime), config in TOML, logbook as append-only JSONL rendered by a static HTML viewer (d3 timeline). Service control via a pluggable driver layer: `systemctl`, `docker`/`compose`, `launchctl` (macOS), or arbitrary shell. Snapshots shell out to `btrfs subvolume snapshot` / `zfs snapshot` / `docker commit`. Dependency ordering is a topological sort over the declared `after=` edges. The genuinely hard part is *quiescence detection* — knowing a service is truly idle (no open write FDs via `lsof`, no active HTTP connections via a healthcheck, torrent client reporting no active writes) before snapshotting, so you don't freeze a half-flushed SQLite WAL.

## v1 scope
- TOML config, topological ordering, systemd + docker drivers only
- Ordered stop + `sudo reboot`/`poweroff`
- JSONL logbook with uptime + duration per step
- `status` command with a since-last-dump nag

## Out of scope
- Snapshots (v2), boot-side recovery diff, multi-host coordination, web UI beyond a static log viewer, Windows.

## Risks & unknowns
- Quiescence is per-service and fiddly; may need per-app plugins.
- Snapshot rollback semantics differ wildly across btrfs/ZFS/docker.
- Risk of becoming "a fancy shell script" — the ceremony/logbook framing is the differentiator, not the plumbing.

## Done means
On a real 3-service docker host, `beamdump shutdown` stops services in correct reverse order, writes a logbook entry showing uptime and per-step timing, and reboots cleanly; the static viewer renders the timeline; and a deliberately-hung service is reported (not silently killed) in the run report.
