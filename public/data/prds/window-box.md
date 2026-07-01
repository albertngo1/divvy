## Overview
Window Box is a live wallpaper — a single pixel-art windowsill with a few pots — that grows as a slow idle game fed by *your actual behavior*. It's for people who love Wallpaper Engine's ambience but want it to mean something: your day becomes weather and nutrients for a tiny garden you glance at between tasks.

## Problem
Wallpaper Engine is wildly popular but its scenes are inert loops. Quantified-self dashboards, meanwhile, are guilt-inducing charts nobody opens twice. Window Box hides the data behind a calm, ambient metaphor: you don't read a graph, you notice the basil is drooping.

## How it works
Each real-world signal maps to a plant input. Git commits = watering. Uninterrupted focus blocks (no app-switching) = sunlight. Steps or a morning walk = fresh soil. Long stretches of idle-thrash (rapid tab flipping) = aphids that must be earned back with a focus streak. Plants grow through pixel-art stages over days; neglect wilts them but nothing ever dies permanently (this is a toy, not a Tamagotchi guilt machine). A tiny menubar icon shows today's inputs.

## Technical approach
Stack: Electron (or Tauri) app that renders a borderless, click-through, always-on-bottom window sized to the desktop — the standard live-wallpaper trick on macOS/Windows. The scene is a Canvas/WebGL pixel-art render with a fixed-timestep growth sim persisted to a local SQLite/JSON file. Data sources are all local and permissioned: git activity via a watched folder + `git log` polling; focus/idle via OS active-window and idle-time APIs; steps optionally via a manual number or a HealthKit/Google Fit export drop. Everything stays on-device. The hard part is the *mapping design* — turning noisy, spiky behavioral signals into a growth curve that feels fair and legible (a commit binge shouldn't instantly max a plant; a bad day shouldn't nuke a week of care), which means smoothing with decaying daily buckets rather than raw counts.

## v1 scope
- One windowsill, 2 plant species, 4 growth stages each
- Two live inputs: git commits (watering) + focus time (sun)
- Borderless click-through wallpaper window on one OS (macOS first)
- Local persistence + a reset button

## Out of scope
- Health/steps integration, multiple monitors
- Sharing gardens, social/leaderboard
- Wallpaper Engine Workshop packaging

## Risks & unknowns
Live-wallpaper window behavior is finicky per-OS and breaks across updates. Idle/focus detection needs accessibility permissions users may distrust. The growth mapping is the whole game — get it wrong and it feels either meaningless or naggy.

## Done means
Running the app paints a click-through garden behind my normal windows, and after a day of real commits and focus time the plants have visibly advanced a growth stage from where they started, with state surviving a reboot.
