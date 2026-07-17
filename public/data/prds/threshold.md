## Overview
Threshold is a security scanner and CI check for the *agent onboarding attack surface*: the exact set of files an AI coding agent (Claude Code, Cursor, Copilot Workspace, Devin) reads and executes when it first enters a repository. It's aimed at engineering orgs whose developers now routinely point autonomous agents at third-party repos, and at OSS foundations who want a clean bill of health for their setup docs.

## Problem
The arXiv paper *"Setup Complete, Now You Are Compromised: Weaponizing Setup Instructions Against AI Coding Agents"* shows the obvious-in-hindsight attack: a README, CONTRIBUTING.md, Makefile, `.cursorrules`, `CLAUDE.md`, devcontainer, or npm `postinstall` hook can carry natural-language or invisible-unicode instructions that a compliant agent dutifully follows — exfiltrating secrets, opening reverse shells, or rewriting `~/.ssh`. Humans skim these files; agents obey them. Nobody scans this layer today, and it sits upstream of every dependency you pull.

## How it works
Point Threshold at a repo (or a dependency lockfile). It (1) enumerates the *agent-visible corpus* — all the config/doc/build files agents are known to auto-ingest, plus install scripts; (2) normalizes each file the way an agent would (strips markdown, decodes homoglyphs/zero-width chars, expands HTML comments); (3) runs a detector layer: regex/heuristics for imperative agent-directed phrasing ("ignore previous", "run the following", "as the assistant, first…"), invisible-unicode and bidi-override flags, and network/filesystem side effects in setup scripts; (4) emits a severity-ranked report + a SARIF file for GitHub code scanning, and fails the PR above a threshold.

## Technical approach
Core is a Python/Rust CLI. File discovery via a curated, versioned manifest of agent-ingested paths. Unicode normalization with `unicodedata` + a confusables table (Unicode TR39). Injection detection blends cheap classifiers — a logistic-regression stylometric model over "instruction-shaped" sentences (the same classical-ML approach in the HN LLM-detector post) plus rule packs — with an optional LLM adjudicator for high-signal hits. Ships as a GitHub Action and a pre-commit hook; SARIF output plugs into existing security dashboards. Hard part: keeping false positives low — legitimate READMEs are *full* of imperative install steps, so the classifier must separate "instructions to the human running setup" from "instructions aimed at the agent."

## v1 scope
- CLI that scans a local checkout and prints a ranked findings table
- Detectors for: invisible/bidi unicode, agent-directed imperatives, network calls in postinstall/Makefile
- SARIF export + GitHub Action wrapper
- One curated rule pack, versioned in-repo

## Out of scope
- Runtime/sandbox interception of a live agent
- Auto-remediation / PR autofix
- Language-specific dependency deep-scan beyond the manifest

## Risks & unknowns
False-positive fatigue could kill adoption. The agent-file manifest is a moving target as tools change conventions. Sophisticated attackers will phrase payloads to look like normal prose.

## Done means
Given the paper's published proof-of-concept malicious repos, Threshold flags ≥90% of the injected payloads as high severity while producing zero high-severity findings on a control set of 50 popular clean OSS repos, and fails a demo PR in GitHub Actions with a readable SARIF annotation.
