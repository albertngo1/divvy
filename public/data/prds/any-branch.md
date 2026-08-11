## Overview
A CLI that turns GitHub Actions OIDC trust policies into a concrete *reachability report*: for every cloud role federated to `token.actions.githubusercontent.com`, it enumerates the real-world principal set that can cause an accepted token to be minted, ranks roles by blast radius, and emits the exact attacker workflow. For anyone who wrote `repo:myorg/myrepo:*` two years ago and has never re-read it.

## Problem
OIDC federation replaced long-lived keys, which is good, and then everyone copy-pasted a trust policy from a blog post, which is bad. The failure modes are invisible in every console: a `sub` wildcard that silently includes every branch any contractor can push; a `repo:myorg/*` that covers the archived repo with 40 outside collaborators; an `aud` claim left unconstrained, so a token minted for a completely different audience still validates; and — the worst one — a condition block that omits `sub` entirely, meaning *any repository on GitHub* can assume the role. Existing scanners flag the string pattern. Nobody tells you who that actually is, or what they'd get.

## How it works
1. Enumerate roles: `iam:ListRoles` → `AssumeRolePolicyDocument`, keep any with the GitHub OIDC provider ARN (same pass for GCP Workload Identity Federation pools and Azure federated credentials).
2. Parse each condition into a claim constraint set: `sub` pattern, `aud`, plus any `repository_owner_id` / `job_workflow_ref` guards.
3. Expand the pattern against reality using the GitHub API: org repo list, per-repo collaborator + permission level, branch protection and ruleset coverage, tag protection, environment protection rules, whether Actions runs on forks, whether the org allows outside collaborators to push.
4. Emit a principal set per role — "37 users can push a branch matching this", "any of 12 org members can create a tag", "unconstrained: any GitHub repo on Earth" — crossed with what the role can *do*, summarized from its attached policies (wildcard actions, S3/KMS/Secrets resources).
5. `--poc` writes the minimal workflow file (`permissions: id-token: write` + `aws-actions/configure-aws-credentials` + one `sts get-caller-identity`) that would prove it, on a branch name that satisfies the pattern. `--fix` prints the tightened condition, pinning `sub` to `repo:org/repo:ref:refs/heads/main` or `:environment:prod` and adding the missing `aud`.

## Technical approach
Go, single binary. AWS SDK v2 with read-only creds; GitHub via GraphQL for repo/collaborator/protection data in few round trips (org with 300 repos should be < 20 calls). Model: `Role → []Condition → ClaimPattern → []ReachablePrincipal{who, howObtained, difficulty}`. Pattern matching is IAM `StringLike` semantics (`*`/`?`, case sensitivity per operator) — implement it exactly, including `ForAllValues` vs `ForAnyValue` on multi-valued conditions, because that's where the real bugs hide. Output: terminal table, JSON, and SARIF for CI.

Hard part: modeling which `sub` claims an actor can actually *force*. A fork PR can't get `id-token: write` on `pull_request`, but `pull_request_target` and `workflow_run` change that; a protected branch may still be pushable by admins; `environment:` subs depend on required-reviewer config. Getting this right — not just wildcard-shaped alarms — is the whole product.

## v1 scope
- AWS only, GitHub only
- Detect: missing `aud`, missing `sub`, `sub` containing `*` or `?`, `repo:org/*`
- Expand branch/tag/environment reachability using branch protection + collaborator lists
- Text + JSON output, `--poc` workflow generator

## Out of scope
- GCP/Azure, GitLab/Buildkite OIDC, actually assuming the role, remediation via API writes, org-wide continuous monitoring, a web UI

## Risks & unknowns
- GitHub's fork/`id-token` semantics have edge cases that change; the reachability model needs a test matrix against a live throwaway org
- Read-only IAM enumeration needs broad-ish permissions, which some orgs won't grant a random binary
- `--poc` is dual-use; gate it behind a flag that requires you to name the repo you own

## Done means
Run against a test org with three deliberately broken trust policies and one correct one: it reports exactly 3 findings ranked by principal-set size, names the specific users who could push a matching branch, generates a workflow that when committed to that repo really does return `sts get-caller-identity`, and reports zero findings on the correct policy.
