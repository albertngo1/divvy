## Overview
A macOS menubar app that is a tiny, humorless mint. Every night at 3am it strikes yesterday as a banknote: denomination, portrait, guilloche, serial number, microtext. You don't interact with it. After a year you print the uncut sheet.

## Problem
Quantified-self dashboards get looked at twice. Year-in-review artifacts are generated in December by a service that owns your data and wants a share graphic. What's missing is an artifact that makes itself all year, is beautiful enough to print at 300dpi, and only becomes legible in aggregate — where a stranger can spot "the busy week" without a legend.

## How it works
The day's signals collapse to one scalar — a value-of-the-day — mapped onto a fixed denomination ladder (1/2/5/10/20/50/100) so the year has a *distribution* rather than a gradient, and a 100 note actually means something. Then every engraved element is data-bound:
- **Guilloche rosettes**: epitrochoid/hypotrochoid families whose R, r, d and phase come from the day's 24-slot activity vector.
- **Portrait**: the day's most-used app icon or a photo taken that day, rendered as variable-frequency wavy-line intaglio halftone.
- **Serial**: date + short hash of the day's raw signal blob (so it's verifiable, not decorative).
- **Microtext border**: the day's longest calendar title or most-typed phrase, repeated at 1.2pt.
- **Series style**: palette and frame geometry shift each quarter, so a year of notes reads as four issues.

The menubar shows today's note; clicking flips through the stack. At year end it composes a 7×52 uncut sheet PDF.

## Technical approach
Swift/SwiftUI menubar with a Core Graphics renderer (or a Node/Rust generator emitting SVG, rasterized at print DPI). The whole project lives or dies on the engraving, so that's where the work goes: guilloche as parametric curves x = (R−r)cos t + d·cos(((R−r)/r)·t), layered at slightly offset phases with proper registration; the intaglio portrait effect as a set of sine baselines whose amplitude and stroke width modulate against source luminance — that single technique is what separates "engraved banknote" from "clip-art dollar bill." Microtext rendered as real glyph outlines so it survives rasterization.

Data is all local: NSWorkspace frontmost-app sampler at 30s into SQLite, EventKit for calendar, later HealthKit/WeatherKit. Output is a PNG + PDF in `~/Pictures/Mint/`. Nothing leaves the machine.

Hard parts: the denomination mapping needs to feel earned rather than arbitrary; the halftone must stay legible at both menubar and print scale; layered guilloche with bad registration looks like moiré garbage.

## v1 scope
- Frontmost-app sampler + calendar only; no health, no weather
- One series design, one note size, fixed palette
- One PNG per day at 300dpi; menubar shows today only
- No poster composition, no history browser

## Out of scope
Sync across devices, iOS, sharing/social, anything spendable or blockchain-adjacent, a "most valuable day" leaderboard.

## Risks & unknowns
Aesthetic risk dominates — a mediocre render is worthless. Currency-resemblance hygiene: keep denominations, wordmarks, and portraits obviously fictional, never reproduce real note designs or the EURion constellation, don't mimic any circulating currency. Also: daily engagement will fade — the yearly sheet has to be the payoff, so the app must be genuinely zero-attention.

## Done means
30 consecutive days minted unattended, each visibly distinct at a glance; a printed 30-note sheet where the microtext resolves under a loupe, and someone who wasn't told anything picks out the busiest week correctly.
