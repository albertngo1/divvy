## Overview
A one-shot command-line divination toy for developers: run `coldread` in a repo and it delivers a straight-faced psychic reading of your dependency graph's future — which package will break you, when the reckoning comes, what the cards advise. It's a joke wrapper around real, defensible risk signals. Inspired by the 'Madame Semver Will See You Now' essay, but built as an actual reading you can run, not an article.

## Problem
Dependency risk dashboards are real but joyless, so nobody looks at them. Meanwhile the genuinely predictive signals — a package that hasn't shipped in 3 years, a critical dep with a single maintainer, a library that breaks its API every minor version — are sitting right there in the metadata. Wrapping them in the theater of a cold reading is a Trojan horse: people will actually run the fortune, and the fortune happens to be true.

## How it works
`coldread` parses your lockfile, scores each dependency on a few risk axes, then narrates the top offenders as a three-card spread — Past (that abandoned transitive dep), Present (the one pinned suspiciously tight), Future (the breaking change coming for you). Output is styled tarot ASCII with a smug, vague-then-specific 'cold reading' voice ('I sense... a package whose last commit predates a pandemic...'). A `--honest` flag strips the mysticism and prints the same findings as a plain risk table, proving the fortune was real all along.

## Technical approach
Stack: a single Node/Bun (or Python) CLI, no server. Parse `package-lock.json` / `pnpm-lock.yaml` / `requirements.txt` for the resolved set. Enrich per-package from public registry metadata (npm registry JSON, PyPI JSON, `deps.dev` API): last-publish date, release cadence, maintainer count, deprecation flag, and **breaking-change frequency** inferred from how often the changelog/tag history jumps a major or breaks a minor (semver-cadence heuristic). Compute a weighted 'betrayal score' per dep; pick the highest as 'Future'. The reading is template-driven Mad-Libs seeded by the specific facts (name, age, maintainer count) so it's eerily specific, not generic. Hard part: producing *specific, true* prophecies without paid vulnerability feeds — lean on free registry + `deps.dev` signals and be honest about confidence.

## v1 scope
- npm lockfiles only
- Three-card spread from three fixed risk axes (staleness, single-maintainer, semver volatility)
- Offline-cached registry lookups with a live fallback
- `--honest` plain-table mode

## Out of scope
- CVE/vulnerability scanning (that's what real tools do)
- CI integration, PR comments, dashboards
- Python/Cargo/Go lockfiles
- Auto-fix or upgrade suggestions

## Risks & unknowns
- Registry rate limits on big graphs — need caching and maybe concurrency caps.
- The 'prophecy' must land as funny-but-accurate; too vague and it's a horoscope, too blunt and it loses the bit.
- Semver-volatility heuristic is noisy for packages with clean changelogs.

## Done means
Running `coldread` on a real npm project prints a themed three-card reading in which the 'Future' card names an actual dependency that `--honest` mode independently justifies as the highest-risk one, in under a few seconds.
