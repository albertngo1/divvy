## Overview
A tiny macOS menubar tool for one person: you. It logs which app is frontmost, fits a semi-Markov model over your app-switching, and reports **mean first passage time** back to your work state. The headline number isn't "3h 12m in Slack" — it's "from Slack, expected 23 minutes until you're back in Zed."

## Problem
Every screen-time tool reports occupancy: totals and pie charts. Occupancy is the least interesting fact about attention, and it's the one you can already guess. The cost you can't guess is the *tail* — the app that seems cheap because you're only in it briefly, but that reliably launches a 40-minute chain through four other apps before you return to work. Blockers treat this as a willpower problem; it's a measurement problem.

## How it works
1. Log activation events. Each row: `(t, bundleID, title_hash)`. An idle detector inserts an `AWAY` state after 90s of no input.
2. You mark a target set (editor, terminal, IDE) once, at setup.
3. Nightly: estimate the transition matrix P from counts with Laplace smoothing, and per-state dwell distributions (lognormal fit — app dwells are heavy-tailed, an exponential fit lies).
4. Solve mean first passage time to the target set: over the non-target states, m = (I − Q)⁻¹ τ, where Q is P restricted to non-target states and τ is the mean dwell vector. That's a ~30×30 linear solve.
5. The menubar shows exactly one number: expected minutes-to-work from the app you're in *right now*. On switching to a new app, a 2-second HUD shows its price tag before you settle in.
6. Weekly: the stationary distribution, framed as "if today looped forever, you'd spend 31% of eternity in Slack," and the top 3 states ranked by MFPT × visit rate — total attention debt, not per-visit cost.

## Technical approach
Swift menubar app. `NSWorkspace.shared.notificationCenter` `didActivateApplicationNotification` for switches; `CGEventSourceSecondsSinceLastEventType` for idle. SQLite via GRDB. Optional Accessibility permission splits Safari/Chrome into per-domain states by hashing the window title against a domain list — titles are hashed, never stored raw. Math in Swift with Accelerate (`dgesv`), or a 60-line Python nightly job if you'd rather iterate fast.

The genuinely hard part is that MFPT is descriptive, not causal: 5pm Slack looks expensive because 5pm is when work ends. Mitigations: stratify by hour-of-day bucket and weekday, and compute a matched estimator comparing same-hour days where the app was vs. wasn't opened. Bootstrap over days gives confidence intervals; states with <20 visits are pooled into `OTHER` rather than reported.

## v1 scope
- Logger + SQLite, app-level only (no window titles).
- Manual target-set picker in preferences.
- Nightly compute; menubar shows one number for the current app.
- `firstpassage report` CLI printing the ranked table.

## Out of scope
Blocking, nudging, streaks, cloud sync, Windows/Linux, phone, browser extension, any UI beyond a number and a table.

## Risks & unknowns
The Markov assumption is wrong (your next app depends on the whole session, not just the current app) — semi-Markov dwells help, but second-order chains may be needed and will starve for data. MFPT is infinite if the target is unreachable in the sample; regularize with an absorbing end-of-day state. Privacy: this is a keylogger's cousin, so it must stay local and store no raw titles.

## Done means
After five weekdays of logging, it outputs per-app MFPT with bootstrap CIs, and — the real test — its top-3 most expensive apps differ from your written-down blind guess. If it only confirms what you knew, it failed.
