## Overview
A self-hostable browser tower-defense that reskins the live kernel-security advisory stream as a monster invasion, for homelabbers and maintainers who watch "432 CVEs in 24h" scroll by and feel nothing but dread. The mischief: it's a toy that quietly becomes a genuinely useful triage dashboard.

## Problem
The linux-cve-announce firehose is unreadable — hundreds of advisories a day, no sense of which matter to *your* machine. Real triage is tedious; the tools are grim. Nobody enjoys it, so it doesn't get done. Meanwhile tower-defense is the most legible "prioritize incoming threats" UI ever invented.

## How it works
Advisories flow in as monsters walking lanes toward your "production kernel" core. Monster HP = CVSS base score; movement speed = exploit-maturity; a visible tag shows the affected subsystem (net, mm, fs, drivers). You spend regenerating **maintainer-hours** to place towers: *Backport* (slow single-target patch), *Mitigation* (cheap AoE slow), *Embargo* (freezes a monster for review). Let a monster reach the core and it "lands" — logged as an unpatched CVE with its ID. **Dangerously-useful mode:** paste your `uname -r` and a `zcat /proc/config.gz`; the game filters the stream to advisories touching *your* configured subsystems and versions, so the monsters that reach your core are literally your open exposure, exportable as a checklist.

## Technical approach
Stack: a small Python/FastAPI backend polling the public CVE feeds — `git.kernel.org` linux-cve-announce mailboxes / the kernel.org CVE JSON, enriched with NVD CVSS via the NVD 2.0 API. A normalizer maps each CVE to {id, cvss, subsystem, introduced/fixed kernel version} using the structured `cve_id`/`kernel_version` fields the kernel CNA now publishes. Frontend: a Canvas/PixiJS lane defense, state in a tiny event log (JSONL). The config-matching uses the fixed-version ranges vs. your running version. The genuinely hard part is honest subsystem/version matching — the feed's affected-range data is noisy, so v1 is deliberately conservative (a landed monster means "probably relevant, go check," not a false all-clear).

## v1 scope
- Poll one feed, last 48h of CVEs, three lanes bucketed by subsystem.
- Two towers (Backport, Mitigation), CVSS-as-HP, maintainer-hour economy.
- Landed-CVE log with clickable advisory links.

## Out of scope
- Per-machine config matching (that's v2's headline).
- Multiplayer / leaderboards.
- Distros beyond mainline Linux.

## Risks & unknowns
- Feed shape/rate changes; wrap the parser and cache aggressively.
- Gamifying security could trivialize it — keep the exported checklist plain and accurate.
- NVD rate limits; batch and cache CVSS lookups.

## Done means
With the daemon running, a real CVE published in the last 48h appears as a monster whose HP equals its actual CVSS, I can shoot it down with a Backport tower, and any that reach the core show up in an exportable log with correct CVE IDs and working advisory links.
