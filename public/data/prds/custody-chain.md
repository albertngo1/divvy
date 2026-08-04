## Overview
A local editor extension plus CLI that records the *origin class* of every line of code you write — typed, pasted, agent-authored, refactor-generated, or moved — and preserves that attribution across subsequent edits, commits, and rebases. For a single developer auditing their own codebase, and for on-call engineers who want to know at 3am whether the hunk that broke prod was ever read by a human.

## Problem
`git blame` answers "who" and "when" and has never answered "how." With agents writing large fractions of a diff, "authored by Albert" now covers three completely different epistemic states: code he reasoned through keystroke by keystroke, code he skimmed and pasted, and code an agent wrote that he approved in a 200ms glance. These have wildly different bug rates and wildly different debug value, and nothing in the toolchain distinguishes them. The result is an invisible surface of code inside your own repo that nobody, including you, has ever actually parsed.

## How it works
The extension observes document change events and classifies each insertion run:
- **typed** — small changes (≤4 chars) arriving with human inter-event gaps
- **pasted** — one change event of N chars whose hash matches a recent clipboard hash
- **agent** — a change applied via the extension/LSP workspace-edit path, tagged with the originating extension id
- **refactor** — produced by a registered code action (rename, organize imports, formatter)
- **moved** — matches text deleted elsewhere this session

Attribution lives in a rope-with-intervals over the buffer, so origin transfers correctly when lines shift. On commit, buffer ranges are mapped to final file offsets, then line numbers, and written as a run-length map into `git notes` under `refs/notes/custody` plus a fast local SQLite sidecar.

Two views ship: `custody blame <file>` (gutter-style annotated output), and a repo treemap of **unreviewed surface** — lines whose origin is pasted or agent AND which no human has edited since. A `custody retype <hunk>` mode makes you retype the riskiest hunk by hand, then flips its class, borrowing the cognitive-debt idea as an actual ritual.

## Technical approach
VS Code extension in TypeScript (`onDidChangeTextDocument`, `TextDocumentChangeReason`) plus a Rust CLI sharing a SQLite schema: `line_origin(repo, commit, path, line_start, line_end, class, confidence)`. Content-addressed line hashes let attribution survive reformatting and cherry-picks. The genuinely hard part is *propagation*: when a line is partially edited, custody must split and partially decay — modeled as intervals with a human-touch counter, using the same content-move detection strategy as `git blame -C` (hash shingling over 3-line windows to re-anchor after moves).

Privacy is a design constraint, not a feature: no keystroke content is stored, only cadence statistics and class; everything is local; notes are never pushed unless explicitly enabled.

## v1 scope
- VS Code only; three classes: typed / pasted / agent
- SQLite sidecar in `.git/`, no git notes yet
- `custody blame <file>` printing colorized origin per line
- Attribution survives commits and simple edits

## Out of scope
Neovim/JetBrains, git notes sync, team dashboards, CI gates, cross-author aggregation (deliberately — this becomes a surveillance tool the moment a manager can diff two people).

## Risks & unknowns
Agent tools apply edits through varied paths, so classification may need per-tool adapters; heavy formatters can nuke attribution for whole files; the treemap could produce guilt rather than action; the surveillance failure mode is one product decision away.

## Done means
On a test repo where you paste one function, type a second, and let an agent write a third, then make 3 commits of unrelated edits around them, `custody blame` labels all three correctly with ≥90% line accuracy, and `custody retype` flips a hunk's class after you retype it.
