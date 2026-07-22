## Overview
Second Author is a GitHub App (policy-bot's mischievous cousin) for engineering orgs drowning in AI-agent pull requests. It identifies which commits were actually written by a coding agent, attaches a signed provenance record, scores each PR's risk, and enforces policies specifically for agent-authored changes — because your junior AI contributor should not merge to prod on the same rules as a staff engineer.

## Problem
Agent frameworks (Hermes, Buzz, background coding agents) now open PRs at machine volume. Review queues can't tell human work from agent slop, provenance is muddy ('Co-Authored-By' is trivially spoofable), and blanket branch protection either blocks everything or nothing. Teams need policy that keys off *who really wrote this and how dangerous it is*.

## How it works
On every PR, Second Author classifies authorship (human / agent / mixed) from signals: commit trailers, committer identity patterns, timing bursts, diff-shape heuristics, and optional signed attestations agents emit. It computes a blast-radius score from touched paths (does it hit auth, migrations, CI config, payment code?), diff size, and test-coverage delta. A YAML policy then decides: agent PR touching a protected path → require 2 human approvals + green tests + a provenance attestation; low-risk agent doc change → auto-approve. Every decision writes an immutable audit trail and a signed 'this was an agent, gated under policy X' record to the PR.

## Technical approach
Stack: TypeScript, Probot/Octokit for the GitHub App, webhooks on pull_request + check_suite. Authorship classifier starts rules-based (trailers, identity allowlist of known bot accounts, commit cadence) with an optional gradient-boosted model on diff features. Provenance: agents can POST a signed in-toto/SLSA-style attestation to a Second Author endpoint keyed to the commit SHA; the app verifies signature and links it. Policy engine is a small YAML→decision evaluator (CODEOWNERS-adjacent). Storage: Postgres for audit log, per-repo config in-repo. Hard part: authorship classification accuracy — false 'human' labels let agent code slip the stricter gate, so the classifier must fail *closed* (unknown → treat as agent).

## v1 scope
- Detect agent vs human via commit trailers + bot-account allowlist
- Blast-radius score from path globs + diff size
- One YAML policy: gate agent PRs on protected paths
- Audit comment + status check on each PR

## Out of scope
- ML authorship model (rules only in v1)
- Non-GitHub forges
- Signed attestation verification (stub the endpoint)

## Risks & unknowns
- Authorship detection is spoofable; arms race with agents hiding as humans
- Orgs may resent friction on agent velocity — value prop must be audit/compliance
- Overlap with native GitHub rulesets could commoditize it

## Done means
On a test repo, an agent-authored PR touching `db/migrations/` is automatically flagged, scored high-risk, and blocked pending two human approvals, while an agent-authored README typo fix passes with an auto-approval — both with a visible audit trail on the PR.
