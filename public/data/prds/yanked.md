## Overview
Yanked is a self-hostable archive and search engine for software packages that were *removed* — yanked versions, deleted crates, unpublished npm modules, quarantined PyPI releases. It inverts a package registry: crates.io and friends exist to help you install what's live; Yanked exists to resurface what vanished and explain why.

## Problem
When a package is yanked or a malicious version is pulled, the tombstone is often all that's left — the actual code, the diff against the prior good version, and the timeline disappear or get hard to reach. Supply-chain researchers, incident responders, and the merely curious have no unified, browsable memory of these events. The F-Droid 'verification as control' fight and every left-pad/typosquat incident show provenance history *matters*, but it's scattered across advisories, gists, and archive.org guesswork.

## How it works
Yanked continuously watches registry event feeds and flags removals. For each removal it snapshots: last-available tarball (if a mirror/cache still has it), the diff from the prior published version, the maintainer/removal reason where public, linked advisories (GHSA/OSV), and download-count trajectory. You search by name, author, ecosystem, or 'show me all versions yanked within 24h of publish' (a malware tell). Each entry is a permalinked 'headstone' page with the story and the code.

## Technical approach
Stack: Rust ingestion workers + Postgres + a Meilisearch index, small SvelteKit frontend. Sources: crates.io's public change log + database dumps, npm's replication feed (`registry.npmjs.org/-/all` / changes stream) for `unpublish` events, PyPI's XML-RPC/JSON + the OSV and GHSA advisory databases for cross-linking. Yanked artifacts are stored content-addressed (sha256) in object storage — a natural fit for something like an S3-backed store. Diffs are computed by fetching the prior version from a mirror and running a tree diff. The genuinely hard part is *artifact recovery*: registries often purge the tarball on removal, so I race the changes feed to snapshot within the grace window, and fall back to public mirrors/CDN caches when I'm late. Legal/ethical care: never re-serve live malware executably — code is shown read-only, sandboxed, with a warning banner.

## v1 scope
- Ingest npm unpublish + crates.io yank events into Postgres
- Snapshot the tarball when still fetchable; store content-addressed
- Headstone page per removal: metadata, reason if known, prior-version diff
- Full-text search by name/author/ecosystem

## Out of scope
- PyPI + advisory cross-linking (v2)
- Executable sandboxing / dynamic analysis
- User accounts, alerts, API

## Risks & unknowns
- Missing the snapshot window means a tombstone with no body — recovery rate is the key metric.
- Re-hosting removed code has abuse/legal edges; must handle takedowns and never run untrusted code.
- Registry feed schemas change and rate-limit.

## Done means
Yanked detects a newly yanked crate and a newly unpublished npm package from live feeds, produces a headstone page with metadata and (when recoverable) the tarball + prior-version diff, and returns both via full-text search.
