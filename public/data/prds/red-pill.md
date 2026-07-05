## Overview
Red Pill is a browser deduction game built on the real cat-and-mouse of VM/sandbox detection (inspired by the VMAware library). You play a piece of malware that must decide, each round, whether the environment it landed in is a genuine victim machine or a security researcher's analysis sandbox — using the same 'tells' real evasive malware checks. A second mode lets you play the analyst planting fakes.

## Problem
Sandbox-evasion is fascinating and genuinely educational, but it's buried in detection-library source and blog posts. There's no playful way to internalize *which* signals betray a VM and how defenders forge them. Existing security games skew toward SQL injection or phishing; the evasion mind-game is untapped.

## How it works
Each level deals you an 'environment' as a set of readable clues drawn from real VMAware-style signals: CPUID hypervisor bit, timing anomalies (RDTSC gaps), MAC OUI prefixes (VMware/VirtualBox ranges), registry/driver artifacts, too-few CPU cores, no mouse-movement entropy, uptime that skips sleep, screen resolution oddities. Some are real, some the analyst forged to bait you. You spend a limited 'probe budget' to inspect clues, weigh evidence, then choose DETONATE or LIE DORMANT. Detonate in a real machine = points; in a sandbox = you're burned. Dormant forever = you accomplish nothing. A daily seeded puzzle gives everyone the same board with a par 'probe cost', Wordle-style shareable result. Analyst mode inverts it: you spend budget forging convincing fake tells to trap the player-AI.

## Technical approach
Pure client-side: TypeScript + a small deterministic PRNG seeded by date for the daily. Data model: `Signal {id, category, realValue, cost, forgeable}`, `Environment {isSandbox, signals[], forgedSet}`, scoring by Bayesian-ish weighting where each signal has a real-world likelihood ratio (documented from VMAware detection categories) so 'correct play' is mathematically defined and explains itself post-round. UI: card grid, budget meter, evidence ledger. The hard part is authoring likelihood ratios that make deduction *fair but non-obvious* — enough conflicting evidence that naive single-clue play loses, tuned via a Monte-Carlo simulator that reports win-rate for random vs optimal strategies before shipping each level.

## v1 scope
- 10 hand-tuned levels + one date-seeded daily
- ~12 real signal types with in-game 'what this means' notes
- Detonate/Dormant decision + probe budget
- Shareable emoji result string

## Out of scope
- Analyst/forging mode (v2)
- Accounts, global leaderboard
- Real telemetry from the player's actual machine
- Multiplayer

## Risks & unknowns
Balancing so skill beats luck without being a spreadsheet. Making signals legible to non-security players via short explainers. Ensuring it reads as education, not a how-to-evade-EDR tutorial (frame around detection literacy).

## Done means
A player can load the daily puzzle, inspect three clues within budget, correctly infer sandbox-vs-real more often than random over 20 seeded runs, and share a spoiler-free result string that reproduces the same board for a friend.
