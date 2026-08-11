## Overview
A GitHub App that posts one sticky comment per pull request: a reading order. It classifies every changed file as generated, moved, reformatted, mechanically renamed, or behavior-changing, then orders the behavior-changing ones so definitions come before callers. Sold per-seat to engineering teams whose reviewers are drowning; free for public repos.

## Problem
The daily papercut is opening a PR and facing 40 files with no signal about where to start. Half of it is `pnpm-lock.yaml`, generated protobufs, and a Prettier sweep. Reviewers either skim everything shallowly or read the first three files carefully and rubber-stamp the rest. The existing answer is an LLM that writes a summary you don't trust and can't verify. This does the opposite: it makes no judgments about quality, only mechanical claims it can prove, and it earns trust by being boring and right.

## How it works
On PR open/sync, the app fetches the diff and buckets each file:
- **Generated** — matches `linguist-generated`, known lockfiles, `*.pb.go`, snapshots, minified bundles, vendored paths
- **Moved** — content hash unchanged, path changed
- **Reformatted** — the parse tree is identical after normalizing whitespace, quote style, and trailing commas
- **Renamed** — one identifier consistently substituted across the file, tree otherwise identical
- **Substantive** — everything else

It then topologically sorts the substantive files by import graph and posts: *"Read in this order: `auth/token.go` (18 lines), `auth/middleware.go` (23 lines). Skipped: 22 files, 1,703 lines — 1 lockfile, 4 generated, 17 format-only."* It also offers a one-click PR that adds `linguist-generated=true` to `.gitattributes` for the generated paths, which makes GitHub collapse them permanently for every future PR — a fix that outlives the tool.

## Technical approach
GitHub App (Probot or plain webhook handler) on Node, plus a Rust or Go worker for diffing. Tree-sitter grammars for the top eight languages; normalize by walking the CST and dropping trivia nodes, then compare structural hashes — the same insight `difftastic` uses, applied to classification rather than rendering. Unknown file types fall back to "substantive" — never claim mechanical without a parse. Import-graph extraction is per-language and shallow (imports only, no resolution of dynamic requires). Store per-repo config in a Postgres row; no source code persisted past the job, which is the thing enterprise buyers will ask about first.

The hard part is being *conservative*. A rename that is mechanical in 40 places and semantic in one is exactly how a bug ships behind a "nothing here" label. Mitigation: any file with a single unexplained node difference is promoted to substantive, and the comment says "mechanical," never "safe."

## v1 scope
- Generated + moved + reformatted classification only (skip renames)
- TypeScript, Go, Python
- One sticky comment, no settings UI
- Manual Stripe checkout, three design-partner repos

## Out of scope
- Any quality or correctness opinion
- GitLab, Bitbucket, self-hosted
- Blocking checks or required status

## Risks & unknowns
One wrong "skip" destroys trust permanently; GitHub's UI already collapses some of this; teams may not pay for something with no AI in it.

## Done means
On a real 40-file PR from a design partner, the comment's skip list is 100% correct by manual audit, and reviewers report reading the ordered files first.
