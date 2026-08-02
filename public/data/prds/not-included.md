## Overview

`notincluded` is a CLI that measures the **fidelity gap** between what a service actually holds about you and what its official "download your data" export ships. It emits a per-service report and feeds a public **Export Fidelity Index**. For people who take portability seriously — archivists, journalists, anyone leaving a platform — and for privacy researchers who want a citable number instead of a vibe.

## Problem

GDPR/CCPA export buttons are treated as a solved problem. They aren't. Exports routinely drop revision history, comment threads, shared-link ACLs, derived data (OCR text, transcripts, auto-tags), and degrade precise timestamps to dates. Nobody notices until they try to restore, and by then the account is closed. There is no tool that checks an export is *complete*, because completeness requires ground truth — and the only ground truth is the live account you're about to delete.

## How it works

1. `notincluded snapshot strava` — hits the live API and records ground truth **at export-request time** (not at download time; accounts drift over the 1–3 days a takeout job takes).
2. You request the official export through the normal UI and download the archive.
3. `notincluded audit strava --export ./export.zip` — parses the archive, aligns objects to the snapshot by stable id, and diffs field by field.
4. Output: a table of fields present in the API but absent/degraded in the export, with counts and one example id, plus a weighted fidelity score and a **silent-omission flag** for anything dropped that the export's own README doesn't disclose.

## Technical approach

Python + `httpx` + `pydantic`. Core model: `Record {service, type, id, source: 'api'|'export', fields: dict}`. Each type gets a declarative `FieldSpec` YAML: field name, weight, and a comparator — `exact`, `set`, `normalized_text`, `date_granularity` (flags a timestamp downgraded from second to day precision). Score = weighted recall over present fields, reported per type, never averaged into one vanity number.

v1 connector: **Strava**. Snapshot via `/api/v3/athlete/activities`, then per activity `/streams`, `/comments`, `/kudoers`, `/laps`, `/zones`, plus `private_note` and `gear_id`. Compare against the bulk-export zip (`activities.csv` + raw `.fit`/`.gpx`). Expected findings to verify, not assume: kudos and comments absent, segment efforts absent, private notes maybe present, streams only as whatever the original upload contained.

The genuinely hard part is **alignment and normalization**. Exports rename files, collide on title, and re-serialize content into another format (a Google Doc's JSON vs the `.docx` XML in Takeout). Naive diffing flags formatting as data loss. Fix: per-format extractors down to a normalized token stream, then token-level Levenshtein with a similarity floor — below the floor is loss, above is re-encoding. Storage is SQLite so a snapshot survives the multi-day wait.

## v1 scope

- One service: Strava, official API only.
- `snapshot` and `audit` subcommands, SQLite state.
- One hand-written `FieldSpec` YAML for activities.
- Plaintext table output; exit nonzero if fidelity < 0.9.

## Out of scope

- Google Takeout, Slack, Notion connectors (v2 — Takeout is the marquee target but the alignment cost is real).
- Any scraping. Official APIs and official exports only.
- Filing complaints or legal templates.

## Risks & unknowns

- Export contents vary by account age and plan tier; n=1 findings aren't an index. Need ≥5 contributed audits per service before publishing a score.
- API rate limits during snapshot of a large account.
- The public index must stay descriptive ("field X absent") rather than accusatory, or it becomes a legal headache.

## Done means

Running `notincluded snapshot strava`, requesting a real export, then `notincluded audit strava --export ./export.zip` prints a per-field table where at least one genuine omission is confirmed by hand against the archive, and re-running on an artificially complete archive scores 1.00.
