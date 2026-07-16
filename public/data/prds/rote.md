## Overview
Rote is a desktop idle/factory game whose 'units' are real, recorded computer workflows. You record a boring repetitive task once — batch-renaming screenshots, filling a weekly form, tagging invoices — and it becomes a little worker on your factory floor. Watching them tick is the idle-game loop; the twist is that every tick performs actual work on your machine. For anyone whose job is death by a thousand tiny GUI chores.

## Problem
RPA (robotic process automation) tools are enterprise, ugly, and joyless; personal automation dies because nobody maintains fragile scripts. Meanwhile idle games are pure dopamine over *fake* numbers. Rote steals the idle-game reward schedule and points it at your real drudgery, so the thing that's satisfying to watch is also the thing that empties your chore queue.

## How it works
Hit Record, do a task by hand once. Rote captures the screen + input trace and compiles it into a deterministic, self-healing replay (element-matched, not coordinate-brittle). That replay appears as a factory 'worker' with stats: speed (runs/min), reliability (replay success rate), and a level that rises as it logs successful runs. You build a floor of workers, assign them to input 'hoppers' (a watched folder, an inbox, a queue), and let them run. Coins accrue per real task completed; you spend coins to unlock a scheduler, retries, or a 'foreman' that pauses a worker when the screen drifts too far from what it recorded. A daily 'shift report' shows real hours saved.

## Technical approach
Electron/Tauri shell + Python core. Recording and replay lean on the OpenAdapt approach: capture input events and screenshots, segment into steps, and replay by matching UI elements via accessibility tree (macOS AX API / Windows UIA) with screenshot-template fallback via OpenCV. Self-healing = at replay time, re-locate each target element by role+label+neighbor context; if confidence < threshold, halt and flag (the 'foreman'). Data model: Worker { steps[], successRate, runs, hopper }, Hopper { source, trigger }. The genuinely hard part is robust element re-localization across app updates and dynamic layouts — the difference between a toy and a footgun that clicks the wrong 'Delete'.

## v1 scope
- Record one workflow; replay it on demand with visible step highlighting
- One 'worker' card with runs counter and success rate
- Folder-watch trigger (new file → run)
- Confidence halt with a screenshot diff shown to the user
- Coin counter + a single deadpan shift report

## Out of scope
- Multi-app orchestration, branching logic, loops with conditionals
- Cloud sync, sharing workers, marketplace
- Full factory-building metagame beyond one floor

## Risks & unknowns
- Misfiring automation on destructive UI = real damage; needs a dry-run/confirm mode and an allowlist of safe apps for v1
- Accessibility-API coverage varies wildly by app
- 'Fun' and 'safe' pull in opposite directions — too much idle-away autonomy is dangerous

## Done means
I record renaming a folder of files by hand once, drop 10 new files in the watched folder, and Rote's worker processes all 10 correctly, increments its runs counter and coins, and halts + shows a diff when I deliberately change the app's window layout mid-run.
