## Overview
Ride Along is a devtool for engineers who now ship a lot of AI-authored code and quietly realize they couldn't explain half of it. It observes diffs produced during agent-assisted sessions and generates spaced-repetition quiz cards about them — small, targeted 'do you actually get this?' checks — so incidental learning gets designed back into a workflow that otherwise erodes it. Directly inspired by the arXiv 'Agents That Teach: incidental learning back into AI-assisted software development' line of work.

## Problem
When an agent writes the function, you review it for 8 seconds, approve, and move on. The tacit knowledge — why this data structure, what this regex guards against, which edge case that early-return handles — never lands. Six weeks later it's your codebase and you're archaeology-ing your own repo. There's no lightweight loop that converts 'code I accepted' into 'code I understand.'

## How it works
Ride Along tags commits/hunks that were agent-authored (via a commit trailer your agent already writes, or a wrapping session recorder). Periodically it selects interesting hunks — nontrivial logic, a non-obvious API, a subtle conditional — and asks a model to generate 1–3 cards per hunk: cloze deletions ('this line exists to ___'), 'what breaks if you remove this?', 'why a map not a list here?'. Cards enter an SM-2 spaced-repetition schedule. Each morning you get a 3-minute review (CLI or a tiny web page): it shows the hunk, hides the answer, you self-grade. Cards you keep flubbing surface a 'weak spots' report — the parts of your own codebase you're flying blind on.

## Technical approach
A local daemon + CLI (Go or Python). Ingest: `git log` filtered to hunks whose commit carries an agent trailer (e.g. `Co-Authored-By: Claude`), or a shell wrapper that records agent sessions. Card generation: send the hunk + surrounding context to the Anthropic API (claude-haiku-4-5 for cost) with a structured tool-call schema returning `{question, answer, type, difficulty}`; dedupe near-identical cards by embedding cosine similarity. Storage: SQLite with an SM-2 table (ease factor, interval, due date) keyed to a stable hunk hash so cards survive later edits. Review UI: `ride review` TUI or a localhost page. Hard part: *card quality selection* — most hunks are boring; the win is a good 'is this worth a card?' filter (heuristics on cyclomatic complexity, novelty of imported symbols, presence of edge-case branches) so reviews feel worth 3 minutes, not busywork.

## v1 scope
- Ingest agent-trailered hunks from one repo's `git log`
- Generate cloze cards via one Anthropic API call per selected hunk
- SQLite SM-2 scheduler
- `ride review` CLI: show hunk, reveal answer, grade 1–4

## Out of scope
- Live in-editor prompting mid-session
- Multi-repo aggregation, team leaderboards
- Non-git sources (Slack threads, PR comments)

## Risks & unknowns
- Card quality is everything; low-signal cards kill the habit fast. Ship a tunable selection threshold.
- Privacy: code goes to an API — needs a local-model fallback and a per-repo opt-in.
- Does anyone review daily? Retention is the real unknown; keep sessions ≤3 min.

## Done means
Pointing `ride ingest` at a repo with agent-authored commits produces a deck of ≥5 non-duplicate cards, and `ride review` schedules a flubbed card sooner and a nailed card later per SM-2, persisted across restarts.
