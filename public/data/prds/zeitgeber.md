## Overview
Zeitgeber is a desktop screensaver / ambient wallpaper clock whose face is not the standard evenly-spaced dial but one warped by your own circadian data. Named after the biology term for a time-cue. For anyone who wears a Garmin (or any sleep tracker) and likes a slow, personal desk artifact.

## Problem
Every clock treats 3am and 3pm as identical wedges of the same circle — but they aren't, to you. The alternate-clock-designs thread on HN reminded everyone that clock faces are a design choice we've stopped questioning. Meanwhile your wearable knows precisely when you're actually asleep, groggy, peak-alert, or crashing, and that data just rots in an app you never open. There's no calm, always-on artifact that reflects your real rhythm back at you.

## How it works
The dial starts as an ordinary 12-hour clock. Each morning it ingests last night's sleep window, body-battery curve, resting HR, and stress from Garmin. It re-warps the ring so hours you're reliably asleep contract into a thin dark arc, peak-alert hours dilate into a bright wide band, and the 'grog' shoulder around waking gets a smeared gradient. The current time is a single sweeping hand over this personal geometry. Over weeks the warp stabilizes into your baseline; over a year the dial slowly breathes as seasons shift your rhythm, and a New Year's export renders the 365 daily dials as a stacked bloom poster — your chronobiology as a mandala.

## Technical approach
Electron or a Swift screensaver bundle; nightly cron pulls from the existing Garmin Connect MCP (get_sleep_data, get_body_battery, get_rhr_day, get_stress_data). Data model: per-day array of 1440 minute-buckets each tagged with a state weight (asleep/grog/alert/wind-down). Warp function maps clock-minute → dial-angle via a monotonic cumulative-density curve over an 'attention mass' signal, so busy hours own more arc. Render with Canvas/SVG, easing today's warp toward the trailing-30-day mean so it drifts, never jumps. Year poster is a polar small-multiple. Hard part: a warp that's legible as a clock (you can still tell the time at a glance) while being visibly, personally distorted.

## v1 scope
- Pull one night's Garmin sleep + body battery
- Warp a static SVG dial from it
- Sweeping current-time hand
- Menubar toggle for normal vs warped

## Out of scope
- Year poster export
- Non-Garmin trackers
- Multi-timezone / travel handling

## Risks & unknowns
A warped clock you can't read fast is useless; Garmin data has gaps on nights you don't wear it; the effect may be too subtle to notice day to day.

## Done means
On a real Garmin night, the dial visibly contracts your sleep hours and dilates your peak-alert hours, the current-time hand tracks correctly, and a stranger can still read the approximate time within two seconds.
