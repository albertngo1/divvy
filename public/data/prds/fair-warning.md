## Overview
Fair Warning is a GitHub App for library and SDK maintainers that computes the *real* semver level of a release by diffing the public API surface between two refs — then warns or blocks when the version tag lies. It's the fortune-teller from 'Madame Semver' with a spine: it doesn't guess your fate, it audits your changelog.

## Problem
Semver is a promise made by humans who eyeball their own diffs, so it's routinely broken: a 'patch' that removes a public function, a 'minor' that changes a return type. Downstream consumers pin `^1.2.0` trusting that promise and get paged when it breaks. Per-language tools exist (cargo-semver-checks, api-extractor, griffe, go apidiff) but they're scattered, locally run, and easy to skip. There's no hosted gate that makes the check unavoidable and multi-language.

## How it works
On every release PR (or tag), Fair Warning checks out the base and head, extracts each side's public API surface, and diffs them into a classification: `breaking | additive | internal`. It maps that to the minimum honest semver bump, compares against the version you actually chose, and posts a PR comment: '❌ You tagged v2.3.1 (patch) but removed public symbol `parseConfig` — this requires a MAJOR bump.' Maintainers can gate merges on it or treat it as advisory. A weekly badge shows your 'semver honesty' streak.

## Technical approach
Stack: a GitHub App (Probot/Node) orchestrating per-language extractor containers. Rust → cargo-semver-checks; TypeScript → @microsoft/api-extractor rollups; Python → griffe API dumps; Go → `gorelease`/apidiff. Each extractor emits a normalized API-surface JSON (symbols, signatures, visibility, type shape); a language-agnostic differ classifies changes against a shared ruleset. Results cached by (repo, base_sha, head_sha). The genuinely hard part is normalizing 'breaking' across languages — Rust's trait coherence, TS structural typing, Python's duck-typed 'public' (leading-underscore convention vs `__all__`) — and handling type-level breaks (a widened parameter is additive, a narrowed one is breaking).

## v1 scope
- One language end to end (TypeScript via api-extractor)
- PR comment with breaking/additive classification and the honest minimum bump
- Compare-to-tagged-version check with pass/fail status

## Out of scope
- Auto-fixing the version or generating changelogs
- Runtime/behavioral breaking changes (signature-only in v1)
- Private/monorepo-internal package graphs

## Risks & unknowns
False positives destroy trust instantly — a bot that cries 'breaking' on a non-break gets muted. Structural-typing edge cases in TS are a minefield. Extractor tooling quality varies sharply by language, so multi-language may lag.

## Done means
On a test TS repo, deleting an exported function in a PR tagged as a patch produces a failing check and a comment naming the removed symbol and demanding a major bump; a purely additive PR passes.
