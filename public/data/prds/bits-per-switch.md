## Overview
A macOS menubar toy for people who want to *feel* the shape of their attention without a productivity score, a streak, or a nag. It watches which app has focus, builds a first-order Markov chain of transitions, and displays the chain's entropy rate in bits per switch. That's it. High bits = you're ranging. Low bits = you're in a groove, or a loop.

## Problem
Every attention tracker converts your day into a moral judgment: 62% productive, 3 hours wasted, here's a bar chart of shame. The interesting signal isn't category, it's *structure*. Ninety minutes cycling editor → terminal → editor and ninety minutes cycling Slack → email → Slack look identical to an entropy meter and completely different to a category tracker — but the entropy meter is the one that tells you something you didn't already know, which is that both are loops.

## How it works
The menubar shows a live number: `1.7 b`. Click it and a small panel opens with three things:

1. **The chain, drawn.** Apps as nodes sized by dwell time, transitions as edges weighted by probability. It's a portrait of your day that redraws every few minutes and is pleasant to look at, which is most of the point.
2. **The ghost.** Given your current app, the model's top-1 predicted next app renders as a 25%-opacity icon next to the number. Watching it be right is uncomfortable in a productive way. Watching it be wrong is the good part of the day.
3. **Loop detection.** When the entropy rate drops below a rolling threshold *and* the stationary distribution concentrates on a 2–3 node cycle, the menubar icon quietly changes shape — no notification, no modal, no copy telling you to focus. The whole design contract is that it never interrupts.

End of day it renders a single wallpaper-sized PNG of the chain and forgets the raw event log.

## Technical approach
Swift + AppKit, `NSStatusItem`, no Electron. Focus events come from `NSWorkspace.didActivateApplicationNotification` — bundle identifier and timestamp only. Never reads window titles, never reads document names, never touches Accessibility APIs; the permission dialog you don't have to show is a feature.

Model: a transition count matrix `C[i][j]` over bundle IDs, with exponential time decay (half-life ~2 hours) so the number tracks *today* rather than a career average. Laplace smoothing with α = 0.5 against the unseen-transition problem. Entropy rate is `H = Σᵢ πᵢ · H(P(·|i))` where π is the stationary distribution — computed by power iteration on the smoothed matrix, ~30 iterations, trivially cheap at this size (n < 40 apps).

Loop detection: find the strongly connected component containing the current state in the graph thresholded at p > 0.25; flag if |SCC| ≤ 3 and its combined stationary mass > 0.6.

Storage: a ring buffer of the last 24h of `(bundleID, timestamp)` in a local SQLite file, nothing else, never uploaded. Graph layout is a small force-directed sim in Core Graphics.

Hard part is the smoothing/decay tradeoff. Decay too fast and the number jitters into meaninglessness; too slow and it's a constant that tells you nothing. Likely needs an adaptive half-life tied to switch rate rather than wall-clock.

## v1 scope
- Menubar number, updating every 60s.
- Click-through panel with the chain drawing.
- Ghost preview of predicted next app.
- Launch at login. One preference: decay half-life.

## Out of scope
Windows/Linux, per-app categorization, any notion of "productive", notifications of any kind, cloud sync, historical trends beyond today, higher-order chains.

## Risks & unknowns
Entropy in bits may be too abstract to be felt — a normalized 0–100 "range" dial might communicate better, at the cost of the honesty that makes it interesting. First-order may be too weak: real attention has strong second-order structure (editor → docs → editor differs from terminal → docs → editor), but a second-order chain over 40 apps is badly undersampled in a single day. Also unclear whether the ghost preview is charming or unsettling on day three.

## Done means
Runs for a full 8-hour workday under 1% CPU and 30MB RAM, requires zero system permission prompts, and on a self-test the ghost preview's top-1 next-app prediction beats the "most frequent app overall" baseline by at least 15 percentage points of accuracy.
