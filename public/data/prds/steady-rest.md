## Overview

Steady Rest is a macOS menubar app that treats your existing mouse as a fine-motor instrument. It passively measures three well-established markers of fatigue and neuromotor state from cursor movements you were making anyway, and plots a personal steadiness curve across the day and across weeks. No wearable, no test to remember to take, no extra hardware.

For: people already tracking sleep and caffeine who want a signal from their *hands* rather than their heart.

## Problem

Quantified-self stacks are heavy on autonomic signals (HR, HRV, sleep stages) and almost empty on motor output — the thing you'd actually notice degrading. Fine-motor precision is measurably worse when tired, hungover, over-caffeinated, or cold, and it's the channel through which you experience being off. Meanwhile a gaming mouse reports position at 1000–8000 Hz and nobody looks at the residual.

## How it works

The app never sees what you click — only motion geometry.

1. **Segment.** Split the event stream into ballistic movements (a fast primary submovement toward a target) and pursuit/hold segments (slow, low-velocity travel).
2. **Tremor.** On pursuit segments longer than 400 ms, take the velocity series, detrend, and compute a Welch periodogram. Physiological tremor lives at 8–12 Hz; enhanced/fatigue tremor pushes power downward toward 4–7 Hz. Report band power ratio, not absolute — absolute depends on the mouse.
3. **Overshoot.** Decompose each ballistic movement into submovements by counting zero-crossings of acceleration after the primary. A steady hand lands in 1–2 submovements; a tired one adds corrective wiggles. Normalize against the movement's index of difficulty (Fitts) so "I moved further today" doesn't masquerade as decline.
4. **Dwell.** Median press-to-release time and double-click interval drift slowly with fatigue and are nearly free to collect.
5. Roll into an hourly score, join against Apple Health sleep and a one-tap caffeine/alcohol log, and show the scatter. The payoff view is honest and personal: *your* steadiness vs *your* sleep debt, with a fitted line and an explicit R².

## Technical approach

Swift menubar app. A `CGEventTap` on `.mouseMoved`/`.leftMouseDown`/`.leftMouseUp` on a dedicated run loop gives timestamped deltas at OS event rate; for true high-rate sampling, an optional `IOHIDManager` path reads raw HID reports at the device's polling rate. Ring buffer in memory, per-hour aggregates only to a local SQLite file — raw traces are discarded within 60 s and never leave the machine. Health data via HealthKit sleep samples. Signal processing with Accelerate/vDSP.

The genuinely hard part is confounder rejection. Cursor acceleration curves, mouse DPI, surface, and app context (a Figma drag is not a Slack click) all move these metrics more than fatigue does. Mitigation: metrics are computed *within* a `(device, DPI profile, frontmost-app-category)` stratum and only compared to that stratum's own baseline, and any hour with fewer than ~200 qualifying movements is dropped rather than reported. Trackpads are a different instrument entirely and are excluded from v1.

## v1 scope

- Menubar app, one mouse, one metric: submovement count normalized by index of difficulty
- Hourly aggregate stored to SQLite
- One chart: today's curve + a 14-day heat strip
- A manual "I feel wrecked / fine / sharp" one-tap tag for ground truth

## Out of scope

Tremor spectrum, HealthKit join, trackpad, Windows, any clinical framing or diagnosis language, cloud sync.

## Risks & unknowns

The effect may simply be buried under context noise at ordinary desk-work intensity — this is a real possibility and the two-week self-experiment is the test. Requires Accessibility permission for an event tap, which is a legitimately scary prompt. There is a hard ethical line at implying anything medical; the app must talk about *its own* baseline and nothing else.

## Done means

After 14 days of the author's data, the normalized submovement metric separates self-tagged "wrecked" hours from "sharp" hours with an AUC above 0.65 within a single device/app stratum — or the app honestly reports that it can't, and says so on the chart.
