## Overview
Gridlock renders your calendar as a Cities: Skylines–style road network and runs an agent-based traffic simulation over it. For chronic over-schedulers who want to *see* why their day falls apart, not just read a packed grid. Each commitment is a vehicle that has to get through; the layout of your day is the road plan.

## Problem
A calendar shows you *what* is booked but hides the second-order cost: no buffer, transition overhead, context-switching, and cascading lateness. Everything looks fine as tidy rectangles until 2pm collapses the whole afternoon. You feel the gridlock but can't visualize the mechanism.

## How it works
Each event becomes a vehicle spawned onto a timeline "road." Buffer between events = road capacity; meeting length = vehicle size; back-to-backs merge lanes; a meeting that runs long is a stalled car that backs up traffic behind it. Prep/travel/recovery time are on-ramps and off-ramps. The sim plays your day forward at 60× speed and shows congestion heat: green free-flow, red jams. You can drag events to "re-zone" and instantly re-simulate — widening a gap clears a jam visibly. A daily "congestion score" summarizes how close your schedule ran to gridlock.

## Technical approach
Static web app. Calendar via Google Calendar API (read-only `events.list`) or an `.ics` import. Model each event as an agent with `{start, durationMin, bufferBefore, elasticity}`. Simulation is a simple discrete-event / cellular queue: time advances in 5-min ticks; an over-running meeting (elasticity drawn from a per-category distribution) consumes capacity from the next slot, propagating delay downstream — the exact mechanic behind real traffic shockwaves. Render with canvas or SVG; d3 for the heat scale and drag-to-rezone. Data model: day = ordered list of event-agents + a capacity function over time. The hard part is a delay-propagation model that feels *true* (small buffers → nonlinear blowups) without needing per-user calibration to be believable.

## v1 scope
- Import one day's `.ics`
- Fixed elasticity per event (no categories)
- Timeline road + red/green congestion heat
- Single "congestion score" number

## Out of scope
- Live Google/Outlook sync
- Multi-day / weekly city view
- Auto-suggesting fixes

## Risks & unknowns
- The traffic metaphor may over-dramatize a normal busy day
- Elasticity is guessed, not measured — risks feeling arbitrary
- Whether "watch your day jam" is actually actionable or just anxiety theater

## Done means
Drop in a real `.ics` day, hit play, and a back-to-back-heavy afternoon visibly turns red and jams while a well-buffered day flows green — and dragging one event to add a gap measurably lowers the congestion score.
