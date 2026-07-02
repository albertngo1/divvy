## Overview
Deadlock is a tense single-player roguelike for developers and DBAs that reframes database incident response as an extraction shooter. Each run, you're paged into a procedurally-generated 'sick' production database. Somewhere a monster query is eating the server alive—a blocking chain, a missing index, a runaway cursor. You have a limited diagnostic budget and a ticking pager timer to find it, fix it, and extract. Inspired by sp_Blitz's health-check tooling crossed with Hunt: Showdown's extraction tension.

## Problem
Real SQL firefighting skills—reading wait stats, spotting blocking chains, choosing the right index—are learned only during actual outages, which are terrifying and rare. There's no safe, replayable arena to build that instinct. Deadlock makes the panic a game loop.

## How it works
A run spawns a schema, a workload, and one planted pathology. You spend a query budget ('flashlight batteries') running diagnostic tools: `sp_Blitz`-style health scan, live blocking-chain viewer, wait-stat sampler, index-usage report, an EXPLAIN plan reader. Each tool reveals partial info and costs budget + time. The pager timer counts down as server 'health' bleeds; guess wrong and you waste budget. When you've identified the culprit, you play your fix (kill session / add index / rewrite predicate) and try to extract. Success banks XP toward permanent perks (start with an extra tool, cheaper scans); death resets the run. Nightly seed = a shared daily incident with a leaderboard.

## Technical approach
Browser game on an in-browser SQL engine (sql.js / DuckDB-WASM) so pathologies are *real*, not faked—actual slow plans on actual data. A pathology generator plants known anti-patterns: non-SARGable predicates, missing covering indexes, implicit blocking via long transactions, parameter-sniffing. The 'diagnostic tools' are pre-written introspection queries whose output is styled as game UI (a blocking chain becomes a monster silhouette). Frontend React + Canvas for the incident-room aesthetic; state machine for run phases (page → investigate → fix → extract). The hard part is the pathology generator producing measurably-slow, uniquely-diagnosable problems whose 'correct' fix is verifiable by re-running the workload and checking runtime dropped below a threshold.

## v1 scope
- One engine (DuckDB-WASM), 3 pathology types (missing index, non-SARGable predicate, table scan)
- Two diagnostic tools + one fix action (add index)
- A single timer and win/lose state
- One fixed seed to start

## Out of scope
- Multiplayer / co-op on-call
- Perk meta-progression
- SQL-Server-specific wait-stat fidelity

## Risks & unknowns
- Balancing 'fun-tense' vs. 'actually just annoying'
- WASM engines don't reproduce real prod pathologies 1:1 (locking is limited)
- Skill gate: too nerdy for casual, too shallow for real DBAs—needs a difficulty ramp

## Done means
A player pages into a run, uses tools to correctly identify a planted slow query, applies a fix, and the re-run workload measurably drops below the pass threshold before the timer expires—win screen shown, XP banked.
