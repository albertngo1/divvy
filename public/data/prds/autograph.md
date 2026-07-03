## Overview
Autograph scans a project's dependency tree and scores each package by how likely its code was LLM-generated, surfacing the 'tells' as an auditable report. It's for maintainers and security-minded teams who — post the 'No LLM code in dependencies' argument and the Alibaba/Claude-Code-backdoor scare — want a repeatable signal about the human provenance of code they're about to trust. It inverts the current tide of AI *authoring* tools by hunting their residue instead.

## Problem
Dependency trust today keys on licenses, CVEs, and download counts — none of which say anything about *who or what wrote the code*. A growing share of packages is partly or wholly machine-written, sometimes hastily, sometimes with hallucinated APIs or leftover prompt artifacts. There's no cheap way to ask 'how much of this transitive graph looks generated?' and gate on the answer.

## How it works
Run `autograph audit` in a repo. It resolves the dependency graph, pulls source for each package, and computes a per-package 'authorship suspicion' score from a bundle of heuristics: literal AI tells (leftover `As an AI language model`, `# TODO: implement`, placeholder emails, uniform docstring boilerplate), stylometric flatness (low variance in identifier style, comment cadence, function length), git-history signals where available (sudden mass commits, single-commit large files, timestamp bursts), and hallucination smells (imports of nonexistent siblings). Output is a ranked table + JSON, with each score linked to the exact evidence lines. A `--policy` flag fails CI when any direct dep exceeds a threshold. Crucially it's framed as an *audit surface for humans*, not a verdict machine.

## Technical approach
Rust or TypeScript CLI. Ecosystem adapters for npm (`package-lock.json`) and PyPI first; fetch source tarballs from the registry, unpack to a temp dir. Heuristic engine: a regex/AST pass (tree-sitter for JS/Python) for tells and stylometric features, plus optional git log mining if a repo URL resolves. Features feed a transparent weighted score (no black-box model in v1) so every point is explainable. Store results in a local SQLite cache keyed by package@version for fast re-runs. The genuinely hard part is false positives: hand-written boilerplate and generated-but-legit code (protobufs, ORMs) look 'flat' too — so v1 ships an allowlist for known-generated patterns and reports *confidence bands*, never a binary 'AI-written' claim.

## v1 scope
- npm + PyPI graph resolution and source fetch
- ~8 explainable heuristics with evidence links
- Ranked table + JSON output
- `--policy` threshold that exits non-zero for CI

## Out of scope
- Definitive 'this was written by GPT' claims
- Runtime/behavioral analysis or sandboxing
- Other ecosystems (cargo, go, maven)
- An ML classifier

## Risks & unknowns
- Detecting AI code is fundamentally fuzzy; over-claiming would be harmful and is the central risk
- Adversaries can trivially strip obvious tells
- Generated-but-legitimate code (codegen, vendored libs) inflates scores; needs a good allowlist

## Done means
Running `autograph audit` on a repo produces a ranked, evidence-linked report where a package with obvious tells (leftover 'As an AI' comment, boilerplate flatness) scores clearly higher than a hand-written one, and `--policy` fails CI on a deliberately-planted generated dependency while passing a clean tree.
