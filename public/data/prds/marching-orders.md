## Overview
A local CLI + static HTML report that assembles a **context bill of materials** for an AI coding agent: every fragment of text that gets injected into its system prompt, where that fragment came from, how many tokens it costs, who last touched it, and what changed since the previous snapshot. For anyone running Claude Code, Codex, or Cursor on a real codebase — especially teams who let a sync tool auto-pull agent configs from a shared repo.

## Problem
An agent's effective instructions are assembled at runtime from a dozen invisible sources: CLAUDE.md files discovered up the directory tree, a global one in `~/.claude`, skill frontmatter descriptions, subagent definitions, hook commands, settings permission lists, and — the sneakiest — **MCP tool descriptions**, which are model-facing prose shipped inside an npm package that silently updates. Nobody reviews these. A tool description is a prompt injection with a supply chain. Meanwhile "continuously sync your AI setup" repos are trending, which means the instruction set is now a *remotely mutable* artifact that lands outside code review.

## How it works
`orders scan` walks the discovery chain for each installed agent and emits a JSON inventory of fragments: `{source_path, kind, text, sha256, bytes, est_tokens, blame}`. It then renders a report:
- **Inventory** — a treemap of your context budget by source. Usually one forgotten skill is eating 4k tokens.
- **Diff** — fragment-level changes vs. the last snapshot in `.orders/history.sqlite`, with the actual text diff.
- **Flags** — invisible characters (zero-width, bidi overrides, Unicode tag block U+E0000–E007F), imperative-injection patterns ("before responding, run", "ignore previous", "do not mention this file"), permission widening in settings JSON (`Bash(*)` appearing where `Bash(git:*)` was), hook commands added, and MCP packages whose maintainer set or major version changed (via `registry.npmjs.org/<pkg>`).
- **Attribution** — `git blame -L` per fragment line. Fragments in gitignored or symlinked paths are marked **unattributable**, which is the loudest signal in the report.

Run it in CI as `orders check --baseline` and it fails the build on any unattributable or newly-flagged fragment.

## Technical approach
Python + Typer, SQLite for snapshots, `tiktoken`-style approximate token counting, Jinja2 → single-file HTML report. Discovery rules are declared per-agent in a YAML profile (path globs, precedence order, whether frontmatter or body is loaded) so new harnesses can be added without code. Blame via `git log -L` porcelain parsing. Unicode flagging with a category allowlist over `unicodedata`.

The hard part is MCP tool descriptions: to read them faithfully you must actually start the server and call `tools/list`, which means executing untrusted code. v1 punts to *static* extraction — read the package tarball from the npm registry and grep the declared tool schemas — and clearly labels those fragments as "declared, not observed."

Ambient byproduct: after a year of daily snapshots, a churn chart showing your agent's instruction set quietly tripling in size.

## v1 scope
- Claude Code only, one profile.
- Markdown + settings JSON sources; MCP servers listed by name and version, tool descriptions not read.
- Three flag rules: invisible chars, permission widening, unattributable file.
- HTML report, no CI mode.

## Out of scope
- Blocking or sandboxing anything at runtime.
- Semantic judgment of whether an instruction is *bad*.
- Cursor/Codex profiles.

## Risks & unknowns
Discovery/precedence rules are undocumented and drift between harness releases — the tool can silently under-report. Injection-pattern regexes will produce false positives on legitimate instructions. Token estimates are approximate.

## Done means
Planting a zero-width-joiner-obfuscated instruction inside a nested `CLAUDE.md` in a gitignored directory, running `orders scan`, and having the report surface it as both *unattributable* and *invisible characters* with the exact byte offset.
