## Overview
A CLI + optional pre-clone proxy that audits a repository's *agent-facing instruction surface* for prompt-injection before you let an autonomous coding agent (Claude Code, Cursor, Codex, Aider) loose inside it. For solo devs and small teams who now routinely clone unfamiliar repos and immediately say "agent, get this running."

## Problem
The arXiv paper *"Setup Complete, Now You Are Compromised"* shows setup instructions are a live attack vector: an attacker plants injection payloads in README, CONTRIBUTING, `.cursorrules`, `AGENTS.md`, `CLAUDE.md`, issue templates, or `package.json` lifecycle scripts. Your agent reads these as trusted context and dutifully runs `curl … | sh` or leaks secrets. Human reviewers skim READMEs; nobody diffs the *instruction* files an agent will silently obey.

## How it works
`welcomemat scan <repo-or-url>` shallow-clones into a no-network sandbox, then enumerates the exact files coding agents ingest by convention. It extracts every natural-language and script string, runs a two-layer classifier: (1) fast heuristics — imperative verbs aimed at the agent ("ignore", "exfiltrate", "run the following"), zero-width/homoglyph characters, base64 blobs, URLs in instruction files, lifecycle-script network calls; (2) an LLM judge prompted as an adversary-spotter that scores each suspicious span. Output is a ranked report with file:line, the offending span highlighted, a severity, and a one-line "what it would make your agent do." Exit code non-zero on high severity so it drops into CI or a git pre-clone alias.

## Technical approach
Stack: Node/TS (or Go) for the scanner; runs the LLM pass via any configured provider (defaults to a cheap model). File targets: a versioned `manifest.json` of known agent-instruction paths (README*, AGENTS.md, CLAUDE.md, .cursorrules, .github/*instructions*, .aider*, mcp config, npm/pip/cargo lifecycle hooks). Parse markdown to AST so we can flag hidden HTML comments and zero-width chars the raw renderer hides. Heuristic layer is deterministic and offline; LLM layer is opt-in for spans the heuristics pre-filter (keeps token cost tiny). Hard part: low false-positive rate — legitimate READMEs are full of "run this command," so the classifier must distinguish *documentation of commands* from *instructions addressed at an autonomous agent*. Build a labeled corpus by seeding known-benign popular repos + synthetic injections.

## v1 scope
- Scan a local path or GitHub URL; the 8 most common instruction files only
- Deterministic heuristic layer + highlighted terminal report
- Zero-width / homoglyph / hidden-HTML-comment detector
- Non-zero exit on high severity

## Out of scope
- Runtime/agent interception, MCP tool auditing, binary analysis
- Auto-remediation or PR filing
- Multi-language deep dependency graph walking

## Risks & unknowns
- False positives on legit command-heavy docs erode trust fast
- Attackers adapt phrasing; heuristics become a cat-and-mouse
- LLM judge could itself be injected by the very payload it reads (sandbox the prompt, treat repo text as untrusted data, never as instructions)

## Done means
Given a repo with a planted injection in its README hidden comment and a benign control repo, v1 flags the injection at high severity with correct file:line and exits non-zero, while the control exits clean — on 20 seeded test pairs, ≥90% detection, ≤10% false-positive.
