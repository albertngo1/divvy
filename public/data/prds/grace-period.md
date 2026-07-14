## Overview
Grace Period is a desktop deduction game that turns GitHub's new Dependabot *version-update cooldown* into a security minigame. During the mandated waiting period before you adopt a new package version, you play a quarantine officer: real pending updates from your own repos file past your desk, and you must stamp each APPROVE or HOLD before the shift ends. For devs who rubber-stamp dependency bumps and for security-curious tinkerers.

## Problem
The Cursor 0day and every npm supply-chain incident share a cause: nobody actually reads the diff of a dependency bump. GitHub's answer — a default cooldown so freshly-published versions age before adoption — creates a window of attention that goes unused. The itch: make that window a *game* so the diff actually gets looked at.

## How it works
Each 'shift' loads your repos' open Dependabot PRs still inside cooldown. For each, the officer sees a redacted dossier: package name, semver jump, changelog, maintainer-change flags, install-script presence, and a compact diff of the published tarball vs. the prior version. You cross-reference against 'directives' (the day's threat memos: 'HOLD any patch bump that adds a postinstall script', 'the maintainer of X was compromised'). Stamp correctly and your streak/rep rises; approve a planted malicious update and your 'blast radius' meter detonates. Real PRs are scored on whether you matched the eventual real-world outcome (later yanked / CVE'd = should've held); synthetic malicious cards are seeded for teaching.

## Technical approach
Electron or a local web app + a thin Go backend. Data: GitHub REST/GraphQL for Dependabot PRs (`pulls` labeled `dependencies`), npm/PyPI registry APIs for publish timestamps, maintainer history, and `hasInstallScript`. Diffs come from fetching both version tarballs and diffing `package.json`, lockfile, and any `.js` with `child_process`/network calls flagged by a small AST scan (acorn/`@babel/parser`). A rules DSL (YAML) encodes directives; a seeded RNG injects synthetic-malicious cards using real-world attack patterns (typosquat, dependency confusion, obfuscated postinstall). Hard part: generating *plausible* synthetic malicious diffs that don't read as obviously fake, and grading real cards fairly when ground truth is unknown at play time (resolve retroactively via OSV/advisory feeds).

## v1 scope
- Single repo, GitHub token, read-only
- Pull real open dependency PRs; render dossier + diff card
- 8-card shift, APPROVE/HOLD stamps, one directive per shift
- Synthetic malicious cards from 3 attack templates
- End-of-shift score: caught / missed / false-holds

## Out of scope
- Auto-merging or auto-closing real PRs (read-only always)
- Non-GitHub forges, private registries
- Multiplayer / leaderboards

## Risks & unknowns
- Grading real cards needs a retroactive oracle (OSV) — soft signal only
- Tarball diffing per card may be slow; cache aggressively
- Fun-vs-preachy balance; must not feel like a linter with a hat

## Done means
Pointed at a real repo with ≥5 open dependency PRs, it renders playable dossier cards, lets you stamp a full shift, plants at least one detectable synthetic-malicious card, and reports a score that correctly flags the plant.
