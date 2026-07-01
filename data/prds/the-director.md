## Overview
The Director is a desktop game/overlay for chronic procrastinators. It steals Risk of Rain 2's signature mechanic — an invisible 'director' that spends an ever-growing time budget spawning tougher enemies — and points it at your real to-do list. The longer a task sits untouched, the harder its encounter becomes.

## Problem
Every productivity app treats time as neutral: a task at 2 days old looks identical to one at 20. But procrastination cost is exponential and *felt* through dread, not dates. Risk of Rain 2 makes escalating time terrifying and fun. Grafting that pressure curve onto real tasks makes 'this has been rotting for three weeks' visceral instead of a gray timestamp.

## How it works
Each task is an enemy whose HP and elite-modifiers scale with `age = now - createdAt` on the same accelerating curve RoR2 uses. You 'attack' a task by logging real progress (a checkbox, a pomodoro, a note); damage dealt = effort logged. Ignore a task and the director keeps spending its time budget, promoting it: a normal Chore becomes an Elite (blazing = overdue, malachite = blocks other tasks). Hit a deadline and the director triggers a Boss Wave — that task plus everything it blocks swarms at once. Clearing tasks drops 'items' (passive buffs: a streak multiplier, a shorter cooldown) that make the next run easier.

## Technical approach
Stack: Tauri (Rust shell) + a Svelte canvas front-end for the arena; local SQLite for tasks. Import from a plain markdown todo file or Todoist REST API. Core: a `Director` tick loop (every real minute = N game-seconds of budget) implementing RoR2's `creditsPerSecond` growth; a spawn table mapping `age`→enemy tier; combat resolves logged-effort events into damage. Data model: `Task { id, title, createdAt, dueAt, blocks[], hp, tier }`, `RunState { credits, items[], day }`. Key algorithm is faithfully porting the time-vs-difficulty curve so pressure feels fair, not punitive. Hard part: mapping fuzzy 'effort' onto damage numbers that feel earned without becoming a chore-to-log.

## v1 scope
- Import a markdown todo list
- Age→tier scaling with 3 tiers and 2 elite modifiers
- Log-effort-to-damage via a single 'I worked on this' button
- One boss wave triggered by any overdue task

## Out of scope
- Multiplayer / shared runs
- Fancy sprite art (use shapes + color)
- Calendar / email ingestion
- Item synergy trees beyond 3 buffs

## Risks & unknowns
- Turning nagging into a game could add guilt, not fun — needs a 'the director is generous today' relief valve
- Effort logging honesty (nothing verifies you actually worked)
- Balancing so real deadlines and game pressure align

## Done means
Import a todo file with tasks of varying ages; older tasks visibly render as tougher/elite enemies, pressing 'worked on it' reduces their HP, and letting a due date pass spawns a boss wave containing that task.
