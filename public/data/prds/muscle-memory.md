## Overview
Muscle Memory is a terminal typing trainer that drills *your* real commands, not lorem-ipsum. It grafts the kana-dojo / Monkeytype loop (aesthetic, minimalist, WPM+accuracy) onto the corpus every developer already owns: their shell history. For anyone who keeps mistyping `git rebase -i` or `kubectl get pods -n`.

## Problem
You run the same 40 commands hundreds of times, and you *still* fumble the flags — backspacing through `--force-with-lease`, retyping a piped one-liner, pausing to recall the ffmpeg incantation. Generic typing trainers drill words you'll never type. The commands that actually cost you seconds daily are invisible and untrained.

## How it works
On first run it ingests your history, ranks commands by a 'pain score' = frequency × (typo rate + hesitation), and builds a personalized drill deck. A session is a Monkeytype-style TUI: your real commands stream in, you type them under a timer, live WPM/accuracy, red on error. Commands you flub resurface more often (spaced repetition). A weekly report shows your slowest tokens (`--`-flags, subcommands) and a 'personal best' per command. Nothing executes — it's pure typing practice over shell-shaped text.

## Technical approach
Stack: Rust + ratatui (or Go + bubbletea) for the TUI. Parse `~/.zsh_history` (extended format with timestamps) / `~/.bash_history` / atuin's SQLite DB if present. Pain score: frequency from counts; typo/hesitation proxied where possible — atuin records duration and exit code, so a command with high `command not found`/nonzero-exit neighbors or long inter-keystroke gaps ranks up; without atuin, fall back to frequency × length × flag-density. Drill selection is a Leitner/SM-2 spaced-repetition scheduler over command 'cards.' Redact secrets before display: regex-strip tokens after `--password`, env-var assignments, and anything matching high-entropy/base64 patterns. The genuinely hard part is deriving a meaningful hesitation signal from plain history files that lack timing.

## v1 scope
- Parse zsh history, rank top 30 by frequency×flag-density
- ratatui drill screen: prompt, live WPM, accuracy, error highlight
- Basic Leitner box: miss → resurfaces sooner
- Secret-redaction pass before anything renders

## Out of scope
- Actually running commands
- Cloud sync / leaderboards
- Non-shell corpora (SQL, vim)

## Risks & unknowns
- History alone lacks timing → 'hesitation' is guessed; atuin dependency for the good signal.
- Redaction must be airtight or it flashes secrets on screen.
- Novelty may wear off after a week (retention).

## Done means
Run it on a real zsh history; it shows a ranked deck led by my genuinely most-used flag-heavy commands, redacts a `--token=...` in one of them, and a drill session reports WPM and resurfaces the two commands I mistyped.
