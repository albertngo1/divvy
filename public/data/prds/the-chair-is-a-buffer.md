## Overview
A solo web app that treats your recurring household flows (laundry, dishes, meal prep, mail, returns) as a production line and runs real queueing analysis on them. It's for people who keep 'getting behind' on chores and assume they need more willpower, when the real problem is one step in the flow.

## Problem
Household work isn't hard. It's a set of multi-stage flows with handoffs, and the handoffs are where things pile up. The chair, the sink and the 'returns' corner are all inventory sitting between stations. Habit apps count streaks and miss the structure: they can't tell you that folding is your constraint, so running the washer more often just makes the chair taller.

## How it works
1. Pick a flow template (laundry: hamper → wash → dry → fold → put away), or build one from nodes.
2. During the day, tap a station's button on your phone when a batch enters and when it leaves. A batch is one load, one sink-full, one mail pile.
3. After about 10 days the app draws your flow as a factory graph. Each station shows its cycle time, utilization and wait time. Each edge shows its buffer, sized by average WIP: the chair holds 2.4 loads on average.
4. It names your constraint using theory-of-constraints logic (the highest-utilization station with the longest upstream queue) and runs what-if experiments: 'Fold right out of the dryer' (merges two stations), 'Laundry only Sunday' (batch size ×3), 'Smaller loads.' Each one is simulated against your own measured distributions.
5. Weekly report: throughput (loads fully put away), lead time (dirty → in the drawer), and Little's Law checked against your logs.

## Technical approach
- PWA built with SvelteKit; IndexedDB for event logs `{flow, station, batchId, event: in|out, ts}`; optional sync to a self-hosted SQLite.
- Batches are tracked FIFO per station, so cycle time and wait time come out of in/out pairs. Missing taps get imputed from the station's median, flagged in the UI.
- Stats: fit a lognormal per station for service time and model arrivals per flow as a non-homogeneous Poisson process by day of week.
- What-ifs run as a discrete-event simulation (a small heap-based scheduler in TS, 1,000 replicated weeks) that reports throughput and WIP percentiles.
- Rendering: d3-dag layered layout, with conveyor-belt animation where item density equals measured WIP.
- The hard part is logging friction. Mitigation: one big button per active batch, home-screen widgets, and treating 'in' at the next station as 'out' at the previous one so you only tap once per handoff.

## v1 scope
- Laundry flow only, with a fixed 5-station template
- Manual taps, plus an auto-chained handoff
- Graph with cycle time, WIP and constraint highlight
- Two canned what-ifs (merge fold into dry, change batch size)

## Out of scope (for now)
- Multi-person households and splitting who does what
- Smart-plug washer detection
- Custom flow builder

## Risks & unknowns
- Users stop logging after 4 days, so the data needs to be useful after 7.
- Real chores aren't FIFO (socks get pulled out of the clean pile), so WIP estimates are approximate.
- 'Your constraint is you hate folding' is true but awkward to be told.

## Done means
After 10 days of logged laundry, the app shows a 5-station graph with per-station median cycle times and average WIP per buffer. It names one constraint station. The simulated 'merge fold into dry' what-if predicts average chair WIP within ±30% of what you measure the following week after adopting it.
