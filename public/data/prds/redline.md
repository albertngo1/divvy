## Overview
Redline is a macOS menubar toy that reimagines your machine as an internal combustion engine. CPU load spins a tiny animated tachometer needle; disk and network I/O become fuel and airflow. It's for people who leave a computer running all day and want an ambient, characterful gauge instead of a sterile percentage — plus a self-writing logbook that accrues over a year.

## Problem
System monitors are joyless numbers. Your machine's life — the all-nighters, the idle Sundays, the thermal beatings — leaves no story. There's no odometer for the thing you use more than your car.

## How it works
The menubar shows a live needle; click for a dashboard styled like a dash cluster — RPM (CPU), temp (thermals), boost (I/O), and a persistent odometer. "Miles" accrue from cumulative work done (CPU-seconds × a fudge factor), so a busy compile literally puts miles on the clock. Playful, deterministic "service intervals" trigger notifications: "Oil change due — 500 uptime-hours since last reboot," or a year-end "Annual Service Report" summarizing your machine's mileage, redline count, and hottest day.

## Technical approach
Stack: Swift + SwiftUI, `NSStatusItem` for the menubar, Timers polling `host_statistics64` / IOKit for CPU, `SMCKit` for thermals, and `getifaddrs` deltas for network. State persists to a small SQLite file — a `samples` table (rolled up hourly to keep it tiny) plus `milestones`. The genuinely fiddly part is a smooth, cheap needle animation that never itself becomes a CPU hog, and mapping noisy sensor data to gauge motion that feels mechanical (damped spring, not linear). The year-long logbook is just an append-only rollup; the charm is in the framing, not the algorithm.

## v1 scope
- Menubar needle driven by CPU load
- Click-out dashboard with odometer + temp
- SQLite hourly rollup
- One service-interval notification (uptime-based)

## Out of scope
- Windows/Linux ports
- GPU/per-core telemetry
- iCloud sync
- Configurable engine 'models'

## Risks & unknowns
Charm may wear off fast — the year-long payoff is the retention bet, unproven. SMC/thermal access varies across Apple Silicon revisions. Must stay near-zero overhead or it's self-defeating.

## Done means
Installed, the menubar needle responds visibly to a `yes > /dev/null` load spike within a second, the odometer increments across a reboot (persisted), and a synthetic clock advance fires the 'service due' notification.
