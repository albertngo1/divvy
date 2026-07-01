## Overview
Uptime Familiar is a reverse-tamagotchi living in your Mac menubar. It feeds on system uptime: a fresh reboot spawns a tiny larva, and days of continuous uptime mutate it into a bloated, barnacled elder that whispers about the processes it has seen. Restarting the machine is euthanasia — the familiar dies, gets a headstone in a little graveyard log, and a new larva is born. The tension is built in: the OS wants you to reboot for updates; the familiar wants to live forever.

## Problem
That HN post asked "have you restarted your computer this week?" — nobody has, and nobody feels anything about it. Uptime is invisible dead data. What if neglecting your reboot was reframed as *caring* for a creature, turning a maintenance nag into whimsical attachment and mild guilt?

## How it works
A menubar app polls system uptime on a timer, maps the current uptime duration to one of several life stages, and renders the matching creature glyph plus a mood line. It detects reboots by watching for uptime resetting to near-zero (or boot-time changing); on detection it records the just-died familiar's max age to a persistent graveyard and starts a new one.

## Technical approach — specific & technical
Stack options, cheapest first: a SwiftBar/xbar plugin (a shell/Python script that prints menubar output on an interval), or `rumps` (Python menubar framework), or a small Swift `NSStatusItem` app for a polished build. Uptime source: `sysctl kern.boottime` (returns boot timestamp — most reliable) or parsing `uptime`; compute `uptime_seconds = now - boottime`. Life-stage mapping: a threshold table, e.g. `<1h larva 🥚, <1d hatchling, <3d juvenile, <7d adult, <14d elder, ≥30d eldritch 🐙`, each with an ASCII/emoji glyph and a flavor string; optionally sample `ps`/`top` to name a random long-running process for the "whispers." Reboot detection: persist last-seen `boottime` to `~/.uptime-familiar/state.json`; if the freshly read boottime differs (newer), the previous familiar died — append `{name, born, died, max_uptime}` to `graveyard.txt`/JSON and reset state. Names generated from a seeded word list at birth. The hard part is honestly small: reliable reboot detection across sleep/wake (sleep must NOT count as death — key off boottime, not uptime dips), tuning stage thresholds so growth feels rewarding, and keeping the poller lightweight (launch-at-login, negligible CPU).

## v1 scope (humiliatingly small) — bullets
- Menubar app (SwiftBar / rumps).
- Reads uptime via `sysctl kern.boottime`.
- Maps uptime to one of ~6 ASCII/emoji life stages.
- On reboot detection (boottime change), append a line to `graveyard.txt` with the dead familiar's max age.

## Out of scope (for now)
- Rich animation, sprites, sound, notifications.
- Process-whisper flavor text, named personalities, graveyard UI.
- Cross-platform, iCloud sync, sharing.

## Risks & unknowns
- Distinguishing sleep/wake from a true reboot cleanly.
- Threshold tuning so growth feels meaningful, not tedious.
- Launch-at-login and menubar refresh cadence without CPU drain.

## Done means — concrete, testable
I look at my menubar, see my familiar's current life stage, and after a forced reboot I feel a genuine flicker of guilt reading its tombstone in the graveyard log.
