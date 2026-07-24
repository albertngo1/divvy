## Overview
Left Behind is a SaaS/CLI that audits a git-forge migration for completeness. You point it at a source (GitHub/GitLab) and a destination (Codeberg/Forgejo/Gitea/self-hosted), and it produces a signed reconciliation report: every repo, issue, PR, comment, label, milestone, release asset, protected-branch rule, and webhook accounted for — or flagged as dropped, truncated, or mangled. For teams and OSS maintainers moving off GitHub for sovereignty/cost reasons who can't afford to discover a year later that half their issue history is gone.

## Problem
The "I regret migrating to Codeberg" HN thread is a genre now: people leave a forge and only *afterward* find that comment threads collapsed, issue numbers renumbered, PR review history evaporated, release binaries didn't come across, and CI secrets/webhooks quietly broke. Migration tools optimize for "it ran without error," not "everything actually arrived." There is no post-migration audit that tells you, with receipts, what you lost.

## How it works
You grant read tokens for both forges. Left Behind enumerates entities on both sides via their REST/GraphQL APIs, builds a canonical cross-forge schema, and matches records by content-fingerprint (not fragile IDs, which renumber). It reports: counts per entity type source-vs-dest, unmatched source records ("dropped"), field-level diffs on matched records ("body truncated," "author remapped to ghost user," "timestamps reset to import date"), and broken-link detection (issue cross-references, PR-to-commit links). Output is an HTML/PDF reconciliation report plus a machine-readable JSON manifest and a red/green summary. A `--remediate` mode emits a punch-list of exactly which entities to re-import.

## Technical approach
TypeScript/Node CLI + optional hosted web runner. Adapters per forge implementing a common `enumerate()/fetch()` interface over Octokit, GitLab API, and Forgejo/Gitea API. Canonical entity model in SQLite; matching via a content fingerprint (normalized title + body-shingle MinHash + author-handle + created-at bucket) with Hungarian-algorithm assignment to resolve ambiguous matches. Field diffs via structural JSON diff on the normalized records. The hard part is fuzzy identity resolution across forges that renumber IDs, remap authors to placeholder accounts, and rewrite markdown — MinHash over body shingles plus a confidence score, with a manual review queue for low-confidence pairs.

## v1 scope
- GitHub → Forgejo/Gitea adapters only
- Audit issues, PRs, comments, labels, releases + asset presence
- HTML report with counts, dropped list, truncation flags
- JSON manifest export

## Out of scope
- Doing the migration itself (audit only)
- Wiki/Projects/Discussions in v1
- Auto-remediation execution (list, don't fix)

## Risks & unknowns
- API rate limits on large orgs — need resumable enumeration
- Fingerprint false-matches on near-duplicate issues
- Author remapping semantics vary; ghost-user handling per forge

## Done means
Run against a real GitHub repo migrated to a Forgejo instance where I've deliberately dropped 3 issues, truncated one long comment, and skipped release binaries — the report flags exactly those 5 problems, zero false positives on the ~200 correctly-migrated entities, and the JSON manifest lists the 3 dropped issue fingerprints.
