## Overview
Brownout is a personal-finance toy that skins recurring spending as a factory power grid à la Satisfactory. Income is generation capacity; every subscription, bill, and recurring charge is a machine consuming a fixed wattage each month. Buffers (savings) are batteries. When continuous draw exceeds supply, the grid browns out — a visceral, immediate signal that your fixed costs have outrun your income.

## Problem
Budgeting apps show subscriptions as a boring list of line items, so the *creeping* nature of recurring cost — the way five "small" $9 draws quietly eat your headroom — never *feels* dangerous until the card declines. People need to feel load, not read a spreadsheet.

## How it works
You import or enter recurring charges. Each becomes a machine on a canvas with a wattage = monthly cost, wired to a generator sized to your take-home income. A live power bar shows draw vs. capacity. Add a new streaming service and watch the margin shrink; the closer to 100% load, the more the grid flickers. Annual and irregular bills are "spike" loads that periodically kick on. **Batteries** (emergency fund) absorb spikes; drain them and a spike causes an actual brownout event (red screen, log entry). You can **overclock** — deliberately splurge — at a visible efficiency penalty. Goal: keep steady-state load comfortably under capacity with battery reserve for spikes.

## Technical approach
Local-first web app (React + a canvas/SVG grid). Data model: `machines[]` (label, watts=monthly cost, cadence, category), `generator` (income, cadence), `batteries` (balance, drain rate). A tick loop simulates a month in seconds, summing continuous draw and firing scheduled spike loads; brownout triggers when instantaneous draw > capacity + available battery. Import via CSV or optional Plaid/manual entry; recurring-charge detection is just grouping same-merchant same-amount monthly transactions. All state in localStorage/IndexedDB. The interesting bit is the load-scheduling sim: mapping mixed cadences (monthly, annual, quarterly) onto a shared timeline so spikes land realistically.

## v1 scope
- Manually add machines (name, monthly cost) + one generator (income)
- Live load bar: total draw vs capacity, color by headroom
- One battery buffer that absorbs a manual "spike" bill
- Brownout event when draw > capacity
- localStorage persistence

## Out of scope
- Bank sync / Plaid (manual entry v1)
- Investment growth, interest, debt amortization
- Multiplayer / shared household grids

## Risks & unknowns
- Metaphor may confuse as much as clarify for non-gamers
- Cadence-mixing sim can feel fiddly; needs sane defaults
- Without transaction import, entry friction may kill retention

## Done means
I add my income as a generator and six real subscriptions as machines, see the grid at ~70% load, add a seventh that pushes past capacity, and watch it brown out — then wire in a savings battery that absorbs an annual insurance spike without tripping.
