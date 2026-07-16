## Overview
Funny Pages turns a long, unreadable AI-agent transcript into a comic strip. Each turn becomes a panel: the agent as a recurring character, its tool calls as speech and action, and its emotional 'gesture' driven by what it actually did. It's for developers babysitting coding agents (Claude Code, etc.) who won't read 4,000 lines of JSONL but will happily skim eight panels.

## Problem
Agent transcripts are firehoses. The dangerous moment — a force-push, a mass delete, a curl-to-shell — is buried in identical-looking log lines. Reviewing a run is tedious enough that people skip it, which is exactly how agents cause quiet damage.

## How it works
Point it at a transcript file. It segments the run into narrative beats (user ask → agent plan → tool calls → result), assigns each a panel, and picks the agent's pose/expression from the *content*: routine reads get a neutral pose, edits get 'busy,' and flagged dangerous commands get an unmistakable 'villain scheming' pose with a red panel border. Speech bubbles summarize each step in one deadpan line (LLM-condensed). Output is a single scrollable HTML strip or PNG you can drop in a PR or retro.

## Technical approach
Node/TypeScript CLI. Microsoft Comic Chat was just open-sourced — reuse its gesture/emotion taxonomy and, if feasible, its rendering; otherwise a lightweight SVG panel compositor with a small sprite set. Parser normalizes Claude Code / OpenAI tool-call transcript formats into a common `Beat` model `{role, text, toolName, args, danger}`. A rule table classifies danger by tool + argument regex (`rm -rf`, `--force`, `DROP`, `curl | sh`, writes outside repo). An LLM (Haiku) compresses each beat to one bubble line and maps it to a Comic Chat gesture. Compositor lays out N panels with backgrounds cycling for readability. Hard part: robust beat-segmentation across transcript formats and a danger classifier with low false-negatives — a missed villain panel defeats the point.

## v1 scope
- Parse one transcript format (Claude Code JSONL)
- Beat segmentation + danger rule table
- Fixed 2-character cast, ~6 gestures, SVG panels
- Red-border villain panel for flagged commands
- Output single HTML strip

## Out of scope
- Live streaming as the agent runs
- Multi-format parsers
- Custom character art / uploads
- PDF export

## Risks & unknowns
Comic Chat's engine may be hard to embed (old Win32) — SVG fallback likely; danger regexes will miss obfuscated commands; LLM bubble summaries can misrepresent a step; novelty may wear off if it isn't genuinely faster to skim than the raw log.

## Done means
Running it on a real Claude Code transcript that contains a `git push --force` produces an ordered HTML strip whose panels follow the run, condense each step to one legible bubble, and render that force-push as a red-bordered villain panel that's obvious at a glance.
