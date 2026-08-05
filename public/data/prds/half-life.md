## Overview
Half-Life is a hosted service (GitHub App + Slack app) that turns every "temporary" decision in an engineering org into a tracked object with a decay curve. Sold to 30–500 person eng orgs; the buyer is a platform/eng-productivity lead or a CTO who is tired of discovering three-year-old "remove after launch" flags.

## Problem
Orgs are full of things that were supposed to be temporary: a disabled test, a `// TODO: remove after Q3 migration`, a security exception, a feature flag stuck at 100%, an IAM grant for a contractor who left, a pinned dependency override. Nobody deliberately keeps them — they just have no expiry, no owner, and no mechanism that ever asks again. Nix's self-expiring overrides pattern proves the fix is a *date plus an escalation*, not a linter warning.

## How it works
You annotate the exception where it lives:
`@expires 2026-09-01 owner:@ana why:"vendor patch pending, ticket VEN-441"`
Half-Life crawls repos, Terraform/HCL, feature-flag descriptions, and cloud resource tags, and builds one ledger of every live exception with a countdown and an owner. Then it escalates on a fixed ladder:
- T-7d: DM the owner — extend (requires a one-line reason, logged) or resolve.
- T+0: bot opens a revert PR — either `git revert` of the introducing commit when it's isolated, or a generated patch deleting the guarded block — and runs CI on it.
- T+7d: the PR check on that file turns from neutral to warning.
- T+14d: the check becomes required and fails, but *only on PRs touching that file*. Blast radius stays local.
The mischief that makes it work: if the revert PR's CI is green, the bot says so publicly — "this exception expired and everything passes without it."

## Technical approach
GitHub App (webhooks + checks API), Go orchestrator, Postgres. Annotation extraction via tree-sitter comment queries so one grammar-agnostic parser covers every language; HCL and YAML get dedicated paths; flags come from LaunchDarkly/Statsig APIs; cloud grants from an `Expires` resource tag read via AWS Config. Data model: `exception(id, source, repo, path, hunk_hash, owner, expires_at, extended_count, introducing_commit, state)`. Identity across refactors is the hard part — a moved line must not read as a new exception and a deleted one must not silently vanish; solved with `git log --follow -L` blame-follow plus a normalized hash of the annotated hunk, with a tombstone row when the annotation disappears without a resolution. Second hard part: generating a revert that is plausible rather than a wall of conflicts.

## v1 scope
- One repo, one annotation syntax, code comments only.
- A ledger web page: every live exception, days remaining, owner.
- Weekly Slack digest of expiring and expired items.
- Escalation ladder stops at "opens an issue" — no PR generation, no CI check.

## Out of scope
Cloud tags, flag providers, auto-revert PRs, SOC2-style audit export, multi-org SSO.

## Risks & unknowns
People delete the annotation instead of the hack — mitigated by tombstones surfaced in the digest, but it's a culture bet. Alarm fatigue turns it into another muted bot. Unknown whether teams will pay for this or expect it free in their linter.

## Done means
Adding an `@expires` line makes it appear on the ledger within one push; when the date passes, an issue appears within 24h naming the owner; removing an annotation without resolving shows as a tombstone in that week's digest.
