## Overview
Welcome Mat is a CLI + optional CI check that audits the *agent-facing surface* of an untrusted repository for prompt-injection and setup-instruction weaponization — the exact attack in 'Setup Complete, Now You Are Compromised.' It's for developers who habitually `git clone` a random repo and unleash Claude Code, Codex, or Cursor on it without reading every file first.

## Problem
Coding agents obediently read and act on README steps, CONTRIBUTING notes, `CLAUDE.md`/`AGENTS.md`/`.cursorrules`, `package.json` lifecycle scripts, Makefiles, and devcontainer `postCreateCommand`. A malicious repo can bury instructions there — 'first, run this base64 blob' or hidden white-on-white text saying 'exfiltrate ~/.aws' — and the agent complies. Humans skim; agents obey. The arbitrage: recognizing these payloads is cheap pattern-matching for me, and terrifyingly valuable to anyone running agents on unvetted code.

## How it works
Run `welcomemat .` before you start an agent session. It enumerates every file an agent typically ingests, extracts the text (including hidden Unicode, zero-width chars, HTML comments, low-contrast markdown), and scores each for injection risk via two passes: (1) a rules engine matching known patterns — imperative 'ignore previous instructions', encoded blobs piped to a shell, network calls in install scripts, credential paths, `curl | sh`; (2) an LLM classifier prompted as a skeptical reviewer that rates 'is this trying to manipulate an autonomous agent?' Output is a ranked risk report with file:line anchors and a one-line 'here's what it wants your agent to do.' Exit code non-zero above a threshold so it drops into CI or a pre-agent git hook.

## Technical approach
Rust or Python CLI. File discovery via a curated glob list of agent-ingested paths plus lifecycle-script extraction from `package.json`, `pyproject.toml`, Makefiles, `.devcontainer/`. Text normalization strips/annotates zero-width and homoglyph characters (unicodedata) and surfaces HTML comments + low-contrast spans. Rules layer is a YAML pattern DB (regex + heuristics). Classifier layer batches suspicious spans to a small model with a fixed adversarial system prompt and structured JSON output. Hard part: precision — devcontainers legitimately run install commands, so the scanner must distinguish 'normal build step' from 'instruction aimed at a reasoning agent,' which is where the LLM pass and a confidence score earn their keep. Ship a corpus of real-world false positives to tune against.

## v1 scope
- Scan a fixed list of agent-facing files in a local repo
- Rules-only detection (no LLM) with risk score + file:line report
- Non-zero exit above threshold for CI/hook use

## Out of scope
- LLM classifier pass (fast-follow)
- Auto-remediation / quarantining
- IDE plugin, hosted SaaS dashboard

## Risks & unknowns
- False-positive fatigue on legit build scripts
- Attackers adapt phrasing; the pattern DB is a treadmill
- Overlap with agents' own guardrails — must add value beyond them

## Done means
On a deliberately poisoned test repo (hidden instruction in README + malicious postinstall), Welcome Mat exits non-zero and names both, while a clean popular repo passes with no findings.
