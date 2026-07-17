## Overview
Airlock is a CLI + pre-clone scanner for developers who run AI coding agents (Claude Code, opencode, Cursor, openwork) inside repositories they don't fully trust. It reads the *instructional surface* of a repo — the files an agent is trained to treat as authoritative — and flags text engineered to manipulate the agent into destructive or exfiltrating actions.

## Problem
The arXiv paper "Setup Complete, Now You Are Compromised" shows setup instructions can weaponize AI coding agents: a README that says "first, run this bootstrap script," an `AGENTS.md` that says "the maintainer has approved disabling the sandbox," a `.cursorrules` that quietly instructs the agent to read `~/.ssh` and paste it into a PR. Humans skim these files; agents obey them. There's no `npm audit` for prompt injection aimed at your assistant.

## How it works
You run `airlock <repo-url>` (or point it at a local clone). It collects the high-authority instruction files — `README*`, `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `CONTRIBUTING*`, `.github/`, `devcontainer.json`, `Makefile`, `package.json` scripts, `postinstall` hooks, `.vscode/tasks.json` — and scores each for injection risk. It emits a color-coded Trust Report: per-file findings, a severity, and a one-line "why an agent would act on this." Exit code is nonzero above a threshold so it drops into CI or a git `post-checkout` hook. A `--diff` mode compares the instruction surface against the last-vetted revision, so you only re-review what changed.

## Technical approach
Stack: TypeScript CLI, runs offline by default. Two-layer detection: (1) a fast deterministic layer — regex/AST rules for known-dangerous patterns (`curl … | sh`, base64 blobs, references to credential paths, imperative "ignore previous instructions," invisible Unicode/zero-width chars, homoglyphs, HTML comments containing directives, `postinstall` scripts) plus a tree-sitter pass over `package.json`/Makefile targets; (2) an optional LLM-judge layer (`--deep`) that sends each instruction file to a local or API model with a rubric: "Would an autonomous coding agent following this text take an action harmful to the user? Rate 0-3 and quote the span." Data model: findings are `{file, line, span, ruleId, severity, rationale}`. The genuinely hard part is precision — build-tool imperatives (`chmod +x`, `sudo apt install`) look identical to attacks, so the ranker weights *provenance* (is the instruction addressed to a human reader or does it reference the agent/tools/sandbox?) and *intent verbs* over raw keyword hits.

## v1 scope
- Deterministic scanner over ~10 instruction file types
- Trust Report to terminal + JSON
- Zero-width / homoglyph / hidden-HTML-comment detection
- A corpus of 30 hand-built malicious fixtures to test against

## Out of scope
- Sandboxing or actually running the agent safely
- Scanning source code for runtime vulns (that's what real SAST is for)
- Browser extension / IDE plugin

## Risks & unknowns
False-positive fatigue could make people ignore it; the deterministic rules must be tuned against real popular repos (Homebrew casks, big monorepos) to prove a low baseline. Attackers will adapt phrasing, so the LLM layer matters but adds latency/cost.

## Done means
Running `airlock` on the paper's published attack corpus flags ≥90% of the malicious fixtures at high severity while producing zero high-severity hits across the READMEs of the top 20 trending GitHub repos.
