## Overview
A macOS auditing tool (CLI first, tiny menubar summary second) for anyone with a five-year-old Mac and a long tail of permission grants. It answers a question System Settings cannot: *is the app holding this permission still the same app I gave it to?*

## Problem
TCC grants are forever and invisible. Accessibility and Input Monitoring together are a keylogger; Screen Recording is a continuous exfiltration channel. macOS records who you granted, but the Settings pane shows only a toggle and a name — no grant date, no signing identity, no history. Meanwhile the browser-extension world has taught everyone that the dangerous moment isn't installation, it's *acquisition*: a useful tool with 200k installs gets sold, and the permission carries over silently. Native apps have the same problem with none of the scrutiny.

## How it works
Run `grandfathered scan` (needs Full Disk Access — fitting). It reads the TCC databases, decodes each grant's stored code requirement, resolves the client to a binary on disk, reads that binary's *current* designated requirement, and diffs them. Output is a ranked report:

- **Ownership drift** — stored csreq names Team ID `ABC123`, the binary on disk is signed by `XYZ789`. Highest severity.
- **Orphan grants** — client bundle ID no longer resolves to anything installed; the grant is a landmine waiting for a squatter with the same bundle ID.
- **Silent inheritance** — grants held by helper/XPC binaries inside a bundle rather than the app you thought you authorized.
- **Not-you grants** — `auth_reason` indicating MDM/profile-installed rather than user-set.
- **Cold grants** — permission you approved N years ago for an app you haven't launched in M months.

Each row shows the grant's `last_modified` on a timeline, so you can see the week you installed something sketchy.

## Technical approach
Swift or Python 3 (system interpreter) over SQLite. Sources: `/Library/Application Support/com.apple.TCC/TCC.db` (system) and `~/Library/Application Support/com.apple.TCC/TCC.db` (user). The `access` table gives `service, client, client_type, auth_value, auth_reason, last_modified, csreq`. `csreq` is a binary-serialized `SecRequirement`; decode with `SecRequirementCreateWithData` + `SecRequirementCopyString` (or shell out to `csreq -r- -t` for a prototype). Current binary requirement comes from `codesign -d -r- --deep-verify` or `SecStaticCodeCreateWithPath` + `SecCodeCopyDesignatedRequirement`. Bundle ID → path resolution via `NSWorkspace.urlForApplication(withBundleIdentifier:)` plus a scan of `/Applications` and `~/Applications`. Team ID / authority extracted from the requirement string and from `SecCodeCopySigningInformation`. Findings are structured JSON so a menubar app or a nightly `launchd` job can diff scan-over-scan and notify on *new* drift.

The genuinely hard part is false positives: legitimate resignings happen (developer joins an org, certificate rotates, Apple re-signs a Mac App Store build). Distinguishing "same vendor, new cert" from "sold to a new owner" needs a heuristic ladder — Team ID identity, then authority chain shape, then bundle-ID prefix continuity, then a small curated allowlist of known-good ownership transfers — and honest UNKNOWN when it can't tell.

## v1 scope
- Read-only scan of both TCC.db files
- Four services: Accessibility, ScreenCapture, ListenEvent, SystemPolicyAllFiles
- csreq decode + Team ID diff only
- Markdown report to stdout, JSON with `--json`
- No revocation, no GUI

## Out of scope
- Revoking grants (`tccutil` is blunt and lossy; link to Settings instead)
- iOS, Catalyst sandboxed containers
- Kernel extension / DriverKit inventory

## Risks & unknowns
TCC schema is private and has changed across releases (column set differs between Ventura/Sonoma/Sequoia) — needs version-guarded queries and graceful degradation. csreq blob format is undocumented; the `SecRequirement` API path may reject some historical blobs. The tool itself requires FDA, which is precisely the permission class it audits; that irony must be documented, not hidden.

## Done means
On my own Mac, the scan completes in under 5 seconds, correctly reports at least one orphaned grant I can independently confirm (app deleted, grant present), and when I re-sign a test app bundle with a different self-signed identity, that app is flagged as ownership drift on the next scan and not before.
