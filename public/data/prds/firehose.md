## Overview
Firehose is a terminal roguelite that turns log triage into a bullet-heaven. Inspired by the 'reaction' daemon (scan program output for repeated patterns, act on them), it drops you into a screen where each incoming log line is an enemy drifting toward your cursor. Your weapons are regex rules that auto-fire every tick, deleting lines they match. Survive the flood; the leftover lines are the anomalies worth your attention.

## Problem
Reading logs is passive, numbing, and never rewarded. Meanwhile everyone *has* a firehose of noisy output they've stopped looking at. Gamify the exact skill that makes a good on-call engineer: recognizing the 90% of chatter that's safe to auto-suppress so the weird stuff stands out.

## How it works
Pipe any stream in: `journalctl -f | firehose` or replay a saved file. Each line spawns as a mob whose color/size encodes level (ERROR = big red, DEBUG = gnat). Between waves you draft weapons from a roguelike card offer: a regex you author, or a prebuilt ('kill all 2xx access lines', 'chain: match → count → nuke the top repeater'). Weapons auto-fire on cadence and level up (wider match, faster fire). A line that reaches you deals damage; ERROR lines that reach you deal a lot. You lose if health hits zero — meaning the noise buried a real signal. Score = lines survived + rare 'anomaly' lines you let through *on purpose* (mark them for bonus). Export your final loadout as an actual `reaction`/grep config.

## Technical approach
Stack: Rust + ratatui (or Go + bubbletea) for a real TUI at 30fps. Ingest is a line-buffered reader feeding a fixed-timestep ECS: entities = lines, systems = spawn, move, weapon-fire (compiled regex set via the `regex` crate's RegexSet for O(1)-ish multi-match), collision, damage. Difficulty scales to real throughput — a chatty stream literally spawns faster. The genuinely hard part is fairness with bursty input: decouple render tick from ingest with a bounded queue and a 'pressure' visual so a 10k-line burst is a boss wave, not a freeze. Loadout export walks each weapon → emits the equivalent config stanza.

## v1 scope
- Pipe stdin, spawn mobs, cursor movement
- Author-a-regex weapon + 5 prebuilt weapons, auto-fire
- Health, wave scaling to real line rate, game-over
- Export surviving-rules as a grep/reaction config

## Out of scope
- Multiplayer, GPU eye-candy, structured-log field parsing, persistence/meta-progression.

## Risks & unknowns
- Regex-authoring mid-fight may be too slow → offer a pause-to-edit 'forge'.
- Bursty streams overwhelming the renderer (bounded queue + pressure meter).
- Is it fun or just anxiety? Playtest the 'let anomalies through' bonus loop.

## Done means
`journalctl -f | firehose` renders live log lines as approaching enemies, an author-written regex weapon auto-kills matching lines, health drops when lines reach the cursor, and quitting prints the surviving rule set as a usable config.
