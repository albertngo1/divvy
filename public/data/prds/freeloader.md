## Overview
Freeloader is a small agent + crowd catalog that answers one question: 'When I plug in this monitor / mouse / camera, what does it silently install or phone home to?' It captures the before/after delta of installing a device's driver or vendor app and contributes an anonymized diff to a shared, searchable database. For privacy-minded users and people vetting hardware purchases.

## Problem
The LG-monitors-via-Windows-Update story and the TP-Link Kasa GPS leak show a pattern: consumer hardware quietly installs software and opens network chatter with zero consent, and there's no place to look it up. Reviews cover picture quality, never 'this driver also installs a telemetry service and beacons to an unauthenticated UDP endpoint.' That data is cheap to capture per-device but nonexistent as a corpus.

## How it works
You run Freeloader, hit 'snapshot', install the device/app, hit 'snapshot' again. It diffs: new/changed files in known install dirs, new services/scheduled tasks/registry Run keys (Windows) or launch agents (macOS), new drivers, and — during a capture window — outbound DNS/connection attempts. It shows you a plain-English report ('added service Foo, autostart, contacted telemetry.vendor.com:443'). One click anonymizes (strips your paths/hostnames/serials) and submits `{device_model, os, os_version, diff}` to the public catalog. Anyone can search by model before buying and see the aggregated 'here's what it drags in' profile.

## Technical approach
Agent: Go or Rust cross-platform CLI. File snapshot = walk a curated allowlist of install locations, hash entries. Autostart enumeration = registry Run/RunOnce + Services + Scheduled Tasks on Windows; LaunchAgents/Daemons + login items on macOS. Network capture = a short-lived listener using the OS resolver logs where possible, else a bundled DNS proxy the user opts into; connection attempts via `etw` (Windows) / `Endpoint Security` or `lsof` polling (macOS). Redaction pass strips usernames, SIDs, serials, drive letters via regex + a userpath map before upload. Catalog = static-site + a Postgres-backed API on a cheap box; submissions are moderated/deduped by `(model, os_major, diff_hash)`. Hard part: reliable, low-false-positive diffing across the OS's own background churn — you must baseline and subtract normal Windows Update / Spotlight noise so the device's footprint stands out.

## v1 scope
- Windows-only agent: file + autostart + services snapshot/diff
- Human-readable local report, no upload
- Manual JSON export of a redacted diff

## Out of scope
- Network/DNS capture (v2)
- macOS/Linux agents
- Public catalog + search UI + moderation

## Risks & unknowns
- OS background noise could swamp the real signal; baselining is fiddly.
- Redaction must be airtight or submissions leak PII — legal/ethical hazard.
- Vendors change installers often; catalog entries stale fast.

## Done means
On a clean Windows VM, installing a known-chatty driver and running snapshot/diff yields a report that correctly lists the new service and autostart entry it added, with the tester's own username and paths absent from the exportable JSON.
