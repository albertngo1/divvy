## Overview
Overclaim is a CLI + hosted dashboard that audits OIDC 'Trusted Publishing' trust policies across an org's registries (PyPI, npm, crates.io, GitHub Container Registry) and the GitHub Actions workflows that mint those tokens. It flags over-broad `sub`/claim bindings that would let an attacker publish under your name — the exact class of foot-gun the 'You shouldn't trust Trusted Publishing' post and the GitLost AI-agent leak both point at. For OSS orgs and platform security teams.

## Problem
Trusted Publishing replaced long-lived API tokens with OIDC — good — but the trust policy is where the risk moved. A binding scoped to a repo without pinning `environment`, `ref`, or workflow filename means any `pull_request` run, any fork's workflow (in some configs), or a compromised unrelated workflow in the same repo can request a valid publish token. Nobody reviews these bindings; they're set once and forgotten. There's no linter for 'this trust policy is too loose.'

## How it works
Point Overclaim at an org. It (1) pulls each package's configured Trusted Publisher bindings via registry APIs, (2) enumerates the referenced repos' workflows via the GitHub API, and (3) cross-checks: is the binding pinned to a specific `environment`? Does a deployment environment gate exist with required reviewers? Can a `pull_request`-triggered or fork workflow reach the publish job? Does any workflow in that repo run untrusted input (issue titles, PR bodies) before the publish step? Output is a ranked findings list with a concrete exploit narrative per finding ('PR #—'s workflow can mint a PyPI token for package X because binding lacks environment pinning') and a suggested tightened policy.

## Technical approach
Stack: Go CLI + Postgres + a small Next.js dashboard. Data sources: PyPI/npm/crates Trusted Publishing config endpoints, GitHub REST/GraphQL for workflows + environment protection rules, and OIDC claim schemas per provider. Data model: `binding`, `workflow`, `trigger`, `finding` with a rules engine (CEL-style predicates) over the joined graph. Hard part: accurately modeling *reachability* — proving a given trigger can actually reach the publish job (needs-graph + `if:` conditions + environment gates), not just that a loose binding exists, to keep false positives low.

## v1 scope
- PyPI + GitHub Actions only
- 6 core rules (no env pin, fork-reachable publish, untrusted-input-before-publish, missing required reviewers, wildcard ref, shared-repo blast radius)
- CLI that outputs JSON + a markdown report
- Per-finding exploit narrative + fix snippet

## Out of scope
- Auto-remediation / PR-opening
- npm/crates/GHCR (v2)
- Non-GitHub CI (GitLab, Buildkite)
- Runtime SBOM / dependency scanning

## Risks & unknowns
- Registry Trusted-Publishing APIs may not expose full binding detail without auth as owner
- Reachability analysis is genuinely hard; over-flagging kills trust
- Market may expect this bundled into existing supply-chain scanners (differentiation = the reachability proof)

## Done means
Run against a test org with one deliberately loose PyPI binding and one tight one; Overclaim flags the loose one with a correct exploit path and stays silent on the tight one, and the suggested fixed policy actually blocks the path when applied.
