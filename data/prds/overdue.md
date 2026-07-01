## Overview
Overdue turns your recurring bills into a round of *Dead by Daylight*. Fixed monthly charges are generators scattered on a map; your income is the survivor sprinting between them, repairing (funding) each before the Killer — the 1st of the month — sweeps in and hooks whatever isn't done. It reframes a dry recurring-charge list as a tense, winnable round, and the wince you feel at the red generator you forgot is the product.

## Problem
Budgeting apps are spreadsheets with anxiety bolted on. They report the truth without making you *feel* anything, so the forgotten $14 subscription and the looming card due-date never acquire any dread until they've already cost you a late fee. Nothing in the UI produces the specific emotion — "I am about to lose this" — that would make you act early.

## How it works
You provide recurring charges (CSV import or type five). Each becomes a generator on a top-down map: radius scales with dollar amount, glow color scales with due-date proximity (green → amber → red as the day nears). Your income is a pool you drag onto generators to "repair" them; a repaired generator locks green. A timer bar representing the month crosses the screen. When it reaches the 1st, any un-repaired generator is hooked — it flashes, screams, and posts the real consequence (late fee, overdraft estimate, auto-renew you meant to cancel).

## Technical approach — be specific and technical
Stack: plain TypeScript + Vite, rendering to a single `<canvas>` via a fixed-timestep game loop (`requestAnimationFrame` with an accumulator). No engine needed for v1; if it grows, PixiJS for sprite batching. State is a plain reducer store exposed through a `useSyncExternalStore`-style subscription — no backend, all client-side, `localStorage` for persistence.

Data model: `Generator { id, label, amountCents, dueDay (1–31), fundedCents, status: 'idle'|'repairing'|'done'|'hooked' }` and `Round { incomeCents, cursorDay, msPerDay }`. Import parses CSV with PapaParse; a heuristic classifies recurring vs one-off by matching amount+merchant across months. v1 stays offline/CSV to avoid OAuth; later, Plaid's `/transactions/sync` endpoint feeds real charges.

Key algorithms: urgency color is a lerp on `(dueDay - cursorDay)` clamped to [0, 14] mapped through an HSL gradient. Repair progress is `fundedCents/amountCents`. The Killer is the timer crossing each generator's `dueDay`; on cross, if `fundedCents < amountCents`, transition to `hooked` and compute a consequence via a small penalty table.

The genuinely hard part: emotional pacing. The dread has to build without a real AI enemy — tuning timer speed, glow ramp, and audio stings so the final seconds feel like a chase rather than a progress bar is the whole design challenge.

## v1 scope (humiliatingly small)
- Upload CSV or type five charges
- Each renders as a labeled circle on a blank canvas
- Drag an income token onto a circle to turn it green
- One timer bar crosses once
- Anything still red flashes and shows the fee

## Out of scope (for now)
- Pathfinding, sprites, or a real Killer AI
- Bank connections / Plaid
- Multiple months, accounts, or multiplayer
- Sound design beyond one sting

## Risks & unknowns
- Might feel gimmicky rather than tense — pacing is unproven
- CSV formats vary wildly across banks; recurring-detection is fuzzy
- Financial framing could read as flippant about real hardship

## Done means — concrete, testable
You paste in your real recurring bills, play one 60-second round, lose one generator to the deadline, wince at the red circle you forgot, and immediately want to cancel that subscription.
