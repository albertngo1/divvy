## Overview
A local-only macOS menubar app for people who type all day and want a biomarker out of it. It records keystroke *timing* — how long a key is held, the gap between keys, the rhythm of alternating hands — and never the keys themselves. From that it computes a daily motor-steadiness score against your own personal baseline, and accretes a multi-year ribbon of how your fine motor control has moved.

## Problem
Quantified-self tooling measures your heart, your sleep, and your steps, and then measures your keyboard only as a productivity counter — words per minute, hours in an editor. But typing timing is a dense, high-frequency motor task, and the clinical literature (the neuroQWERTY work on keystroke dynamics and early Parkinson's, plus fatigue and alcohol studies) shows the *variability* of that timing carries real signal. You generate 40,000 samples a day of the highest-resolution motor data you'll ever produce, and it all evaporates.

## How it works
- A background tap logs, per keypress: monotonic timestamp, hold duration, a coarse key class (left hand / right hand / space / backspace / modifier), the frontmost app's bundle ID, and the active keyboard layout. No character, no word, no content. Ever.
- Nightly rollup computes features: mean and σ of hold time; the flight-time distribution's log-normal fit; the alternating-finger tapping index (variance of the interval between successive left↔right hand transitions, the closest keyboard analogue to a clinical tapping test); backspace rate; and pause-length tail behavior.
- Baseline: a rolling 28-day model *stratified by hour-of-day and app class*, because your 9am email typing and your 11pm code typing are different motor tasks and circadian rhythm alone moves these numbers.
- Daily score is the Mahalanobis distance of today's feature vector from its hour-matched baseline, signed by whether variability rose or fell. The popover shows today, a 90-day sparkline, and the year ribbon.
- Optional: pull sleep hours from HealthKit to annotate the ribbon, so you can see the hangovers and the red-eye flights without having logged them.

## Technical approach
- Swift menubar app, `CGEventTap` on `keyDown`/`keyUp` at the session level (requires Input Monitoring + Accessibility TCC grants). Event handling must be a few microseconds — push to a lock-free ring buffer, drain on a background queue.
- Storage: local SQLite in WAL mode, one row per keypress in a raw table (~40k rows/day, trivially fine), rolled into a `daily_feature` table and then the raw table trimmed at 60 days.
- Stats in Swift with Accelerate, or a small embedded Python for the log-normal fit if that's faster to write.
- The genuinely hard part is confound control, not the math: a different keyboard, a different app, a Zoom call in the background, or a heavy build eating CPU all move these features more than a bad night's sleep does. You need per-keyboard-hardware and per-app-class stratification, minimum-sample gates (skip days under ~3,000 keystrokes), and a visible "low confidence" state, or the score is astrology.
- Also non-negotiable: open source, no network entitlement at all, and an obvious "here is the entire schema, there is no text column" page. This is a keylogger's cousin and must be structurally, not just verbally, incapable of being one.

## v1 scope
- Capture hold time + flight time only. No key classes, no app tracking.
- One number in the menubar: today's σ of hold time vs. your 14-day median.
- A single SQLite file, a `--dump-csv` flag, no ribbon yet.

## Out of scope
Any health claim or diagnosis. Windows/Linux. Cloud sync. Comparison to other users. Mouse or trackpad dynamics.

## Risks & unknowns
The signal may be swamped by content confounds (typing prose vs. typing shell commands) badly enough that stratification can't rescue it. TCC permission friction will kill install rates. Users may reasonably refuse to run anything that touches key events regardless of design.

## Done means
Thirty days of continuous capture, and the score visibly and reproducibly degrades on two independently known bad-sleep days without you having told it about them.
