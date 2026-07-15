## Overview
One-Liner is a roguelike deckbuilder for terminal-dwellers. Your deck isn't fantasy spells — it's `grep`, `awk`, `jq`, `sort`, `cut`, `xargs`, drafted from the commands you actually use. Each 'enemy' is a data task over a sandboxed dataset, and you defeat it by chaining command-cards into a pipeline that *genuinely executes* and produces the right answer.

## Problem
Shell fluency is pattern memory — knowing `sort | uniq -c | sort -rn` is a reflex you either have or fumble. Practice is boring and abstract. And the long tail of your history is full of powerful commands you invoked once and forgot. There's no fun way to drill the muscle.

## How it works
Each card is a command with a rough input/output *type* (lines, json, columns, bytes) and a short effect blurb. A fight presents a task: 'Return the count of unique IPs that hit a 4xx in this log.' You lay down cards left-to-right forming `a | b | c`; the app runs it against the challenge's read-only dataset. Output matches expected → win, with a bonus for shortest pipeline. Type-compatible junctions grant 'combo' damage; mismatches cost. Between fights you draft new cards — including ones mined from your real history that you've never played, nudging you to learn them. Curses are gnarly datasets (CRLF line endings, embedded commas).

## Technical approach
Stack: Deno or Node front end; a hardened execution sandbox. Cards come from a curated catalog (~40 commands with declared type signatures) *intersected* with your parsed `~/.zsh_history` / `~/.bash_history` so your deck reflects you. Execution runs each pipeline inside a locked-down container (Docker with `--network none`, read-only dataset mount, tmpfs, CPU/time limits) — never on the host. Expected outputs are precomputed per challenge. The hard part is *safe arbitrary execution* plus honest type inference; v1 dodges the second by using the curated catalog's declared types rather than parsing arbitrary flags.

## v1 scope
- ~40 curated command cards with hand-written type sigs
- History parser that unlocks the subset you actually use
- 10 challenges with fixed datasets + expected outputs
- Docker sandbox runner, match-or-fail scoring

## Out of scope
- Arbitrary command support beyond the catalog
- Windows/PowerShell cards
- Online play or shared leaderboards

## Risks & unknowns
Sandbox escape is the whole ballgame — must be airtight. 'Fun' may hinge on whether solving real data tasks feels like a game or like homework; needs playtesting with escalating, satisfying combos.

## Done means
I import my history, draft a deck, and beat at least one challenge by building a pipeline that runs in the sandbox and matches the expected output, with a shorter-pipeline bonus shown.
