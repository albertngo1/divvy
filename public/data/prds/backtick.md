## Overview
Backtick is a terminal roguelike deckbuilder where your play deck is generated from your own `~/.zsh_history`. Developers who live in the shell get a Slay-the-Spire-style run seeded entirely by what they actually typed — turning a week of grinding into a playable, slightly roasting artifact.

## Problem
Quantified-self tools for developers are dashboards: bar charts of commits, streaks, language pies. Nobody *plays* their own logs. Meanwhile deckbuilders are addictive precisely because the deck feels earned. Backtick fuses them: your competence (and your embarrassing 14-attempt `git push` loops) becomes mechanics, not a chart.

## How it works
Backtick parses your history file, buckets commands into card archetypes: `git`→attack cards, `rm`/`kill`→high-risk burst, `grep`/`find`→scry/draw, `docker`/`make`→summon minions, `sudo`→a costly power card. Frequency sets copies (ran `ls` 400 times? four cheap 1-cost "Look" cards). Enemies are drawn from failure signal: extractable exit codes, `command not found`, repeated retries of the same command become a "Flaky Test" boss with regenerating HP equal to your retry count. You climb a short map, fighting the week you had. A relic drops for your longest command; a curse card for that `rm -rf` near-miss.

## Technical approach
Stack: a single Rust or Go TUI binary using ratatui/bubbletea. Parse zsh extended-history lines (`: <epoch>:<dur>;<cmd>`) or bash history; tokenize the first word + notable flags. A deterministic seed = hash(history slice) so a given week always yields the same run (shareable seed). Card/enemy generation is a rules table mapping command families → card structs {cost, effect, rarity}. Combat is standard energy/block/HP deckbuilder math. The hard part is *fun balance from noisy input*: real histories are power-law skewed (90% `git`/`cd`/`ls`), so you need normalization + curation so decks aren't 40 identical `cd` cards — sample by family, cap copies, and surface the rare/interesting commands as legendaries.

## v1 scope
- Parse zsh history, map ~8 command families to cards
- One 3-node map, one boss built from your most-retried command
- Deterministic seed per history window
- Win/lose screen that names the command that saved or killed you

## Out of scope
- Multi-run meta-progression / persistent unlocks
- Multiplayer or leaderboards
- Non-shell data (git log, browser history)
- Pretty sprite art — ASCII/Unicode only

## Risks & unknowns
Histories are privacy-sensitive (tokens pasted into curl!) — must run fully local and never transmit. Balance from real data is the core risk: could feel like a slot machine of `cd`. Small histories yield thin decks; need a minimum-size fallback. Extracting real exit codes usually isn't in history — may approximate "failure" via immediate re-runs of the same command.

## Done means
Running `backtick` on a real developer's history produces a playable 3-fight run in under two seconds, the deck visibly reflects that person's tools (a Rust dev sees `cargo` cards, a k8s dev sees `kubectl`), and the boss is recognizably their most-retried command.
