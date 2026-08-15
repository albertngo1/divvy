## Overview
A CLI and small web report that audits a git repository's history for signs of fabrication: backdating, bulk rewriting, or manufacturing a multi-year project in an afternoon. Aimed at hiring managers screening portfolio repos, acquirers doing code diligence, grant and award committees, prior-art disputes, and maintainers vetting a suspiciously mature first-time contribution.

## Problem
Git timestamps are user-controlled strings. `GIT_AUTHOR_DATE` accepts anything; `filter-branch` rewrites everything. "I've been building this since 2019" is unverifiable by inspection, and the tools that could check it are scattered fragments of forensic folklore. Meanwhile the incentive to fake has never been higher: agent-generated codebases can be produced in hours, and a plausible-looking three-year history is the difference between a hobby project and a credible one. Nobody sells the check, and the evidence is cheap and public.

## How it works
The tool computes a battery of independent signals and reports each with its own confidence, plus a combined verdict of *lived* / *rewritten* / *manufactured*:
- **The sleep gap.** Bucket every author timestamp by local hour (using its own recorded UTC offset). Real solo histories show a 4–7 hour circadian hole. Uniform-across-24h, or a hole in the wrong place given the stated timezone, is the loudest single tell.
- **Second-hand precision.** Fabricated timestamps cluster on :00 seconds and round minutes far above chance; real commits are uniform mod 60.
- **Author vs committer skew.** A near-constant nonzero delta across thousands of commits is a rewrite fingerprint; genuine rebases produce a lumpy, clustered delta.
- **Timezone plausibility.** Offsets should move like a person: DST steps on the right dates, travel as contiguous runs, not per-commit randomness.
- **Anachronism scan** (the killer). Extract dependency names and versions from every historical manifest, plus distinctive API identifiers, and check them against real publication dates from the npm registry, PyPI JSON API, crates.io, and Maven Central. A 2019-dated commit importing a package first published in 2023 ends the argument.
- **Push-time corroboration.** Where a GitHub remote exists, compare against the Events API and the repo's `created_at`; commits predating repo creation are normal, but a *whole history* whose first push is one day old is not.

## Technical approach
Rust CLI on `gix` for fast full-history walks (100k commits in seconds), emitting JSON plus an HTML report with the hour-histogram, offset timeline, and an anachronism table. Anachronism checking: per-commit manifest diffs (package.json, requirements.txt, Cargo.toml, pom.xml, go.mod) collected across history, deduped into a set of `(package, version)` pairs mapped to commit dates, then a batched lookup against registry APIs with an on-disk sled cache keyed by `pkg@version` so a second run is offline. Scoring: each signal produces a likelihood ratio against a baseline distribution fitted from a reference corpus of ~500 known-genuine repos (long-lived, many contributors, no history rewrite); combine as a naive-Bayes log-odds and *show every term*, since a single opaque score would be both unfalsifiable and unfair to the accused. Hardest part is the false-positive problem: legitimate reasons for every signal exist — imported SVN/CVS history, squashed monorepo migrations, teams spanning timezones, `git filter-repo` for secret removal, bots committing at 3am. The tool must therefore detect *cohorts* (contributor identity, bot patterns, import boundaries) and evaluate signals per-cohort, and it must refuse to render a verdict when a history import boundary is detected without first partitioning around it.

## v1 scope
- Single-author repos only
- Three signals: hour histogram, seconds-precision test, author/committer skew
- npm and PyPI anachronism check
- One-page HTML report, no combined score — just the evidence

## Out of scope
- Signature/attestation verification (that's a different, solved problem)
- AI-authorship detection
- Any hosted service that ingests private repos
- Automated accusations or CI gating

## Risks & unknowns
The ethical hazard is real: this tool accuses people. Framing must be evidence-first, verdict-last, with every signal reversible by a plausible explanation shown alongside it. Registry publication dates can be revised or the package yanked, breaking the anachronism check. Vendored dependencies and lockfile-less repos leave the strongest signal blind.

## Done means
On a test set of 20 repos — 10 genuine, 10 built today and backdated with `filter-repo` at varying levels of care — the report's evidence lets a human reviewer sort them correctly with no false accusations against the genuine ten, and the anachronism scan alone catches every faked repo that used real dependencies.
