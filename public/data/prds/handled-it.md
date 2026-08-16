## Overview

A small self-hosted daemon that inventories **absorbed failures**: things that broke and were fixed automatically, without a human ever seeing them. It produces a ranked "supervision debt" ledger — where the automation is carrying the most weight, and therefore where you are the most helpless if it ever stops. For homelabbers, solo SREs, and small teams whose stack has quietly become load-bearing.

## Problem

Bainbridge's *Ironies of Automation* (1983): the more reliable the automation, the less practiced the operator, and the operator is exactly who gets called when the automation finally fails. Modern infra is full of silent absorption — systemd `Restart=always`, k8s CrashLoopBackOff that eventually settles, HTTP client retries, ZFS scrubs repairing bad blocks, UPS transfers, DNS failover, backup retries. None of it pages you. Your dashboards are green because something is grinding underneath. You have no idea what your machine has been doing for you all year, and no idea what you'd do by hand.

## How it works

1. **Collect.** Every 15 minutes it scrapes counters that only ever go up: `systemctl show -p NRestarts` per unit, k8s `containerStatuses[].restartCount`, `zpool status` repaired-bytes and checksum errors, `smartctl` reallocated sectors, restic/borg retry lines, nginx upstream retries (`upstream_addr` with multiple entries), NUT/apcupsd transfer events, and `journalctl` grep patterns you configure.
2. **Ledger.** Deltas become `absorption events`, bucketed into classes ("unit `jellyfin.service` restarted 41 times this quarter", "pool `tank` silently repaired 2.3 MB"). Each class gets a score: frequency × blast radius × how long you'd be manually holding it.
3. **Blind diagnosis.** The mischievous part: it replays a real past absorption to you as symptoms only — the log lines and metric shape from 30 minutes before the event, nothing else — and asks what you'd do. You type an answer, it grades against the ground truth it already recorded, and times you. No chaos injection, no production risk; the incident already happened.
4. **Year artifact.** One PNG regenerated nightly: 365 columns, one per day, colored by absorption class. Twelve months in, you have a wallpaper of everything your infra survived without telling you.

## Technical approach

Go single binary, SQLite for state (`events(ts, source, class, counter_name, delta, context_blob)`), collectors as small exec-and-parse plugins so adding one is 30 lines. Counter handling is the fiddly bit: these are monotonic-with-resets, so store last-seen value per key and treat a decrease as a reboot boundary rather than a negative delta. Prometheus is optional, not required — the point is to work on a Mac mini with no observability stack.

Blast-radius scoring uses a static dependency file the user writes once (`jellyfin depends-on tank, nginx`) plus systemd's own `After=`/`Requires=` graph parsed from `systemctl show`. Ranking is `log1p(count) × radius × days_since_you_last_touched_it_manually`, where "touched manually" comes from shell history matching the unit name — a rough but surprisingly good proxy.

Hard part: **distinguishing absorption from noise.** A service that restarts nightly by design is not absorbing anything; a service that restarts nightly because it leaks memory is. v1 punts with a per-unit "expected" flag, but the real version needs to cluster restart inter-arrival times — cron-shaped (tight, periodic) versus decay-shaped (bursty, correlated with load).

## v1 scope

- Three collectors only: systemd NRestarts, `zpool status`, and one configurable journalctl regex.
- SQLite + a single static HTML page listing absorption classes ranked by count.
- The nightly year-strip PNG.
- No blind-diagnosis mode; just the ledger.

## Out of scope

Active fault injection, remediation, alerting, multi-host aggregation, k8s, anything that writes to the systems it watches.

## Risks & unknowns

The ledger may be boring on a healthy box — the tool is most interesting on infra that's rotting, which is a hard first-run demo. Blind-diagnosis grading needs a fuzzy match against a free-text answer (an LLM judge is the obvious fit, and the obvious way to make it annoying). Counter resets on reboot could inflate or hide deltas if the reset detection is wrong.

## Done means

On a box with a deliberately crash-looping unit and a ZFS pool given a corrupted file, the tool's front page ranks both above every other class within 24 hours, and the year-strip PNG shows the two events as distinct colored bands on the correct days.
