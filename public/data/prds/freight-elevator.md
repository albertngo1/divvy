## Overview

Freight Elevator is a solo scheduling tycoon set in the least glamorous chokepoint in commercial real estate: the one service elevator that every tenant, contractor, and vendor in a 30-story building must share. You play the building's freight coordinator. You don't drive the elevator — you sell access to it, and the game is entirely about who gets which two-hour window.

## Problem

The scheduling-puzzle genre is dominated by abstractions (Mini Metro, Factorio belts). Meanwhile there's a real, gloriously petty world where a single elevator's calendar is a monopoly asset: move-in fees, after-hours overtime charges, certificate-of-insurance requirements, the fact that a caterer with a 400-person event and a drywall crew physically cannot share the car. It's a genuine constrained-resource allocation problem with human friction attached, and no game has touched it.

## How it works

Each in-game week you get a stack of **requests**: tenant name, floor, duration needed, preferred window, flexibility, and what they'll pay. A law firm wants Saturday 9am for a partner's office reconfiguration and will pay overtime rates. A contractor needs six consecutive weekday mornings and will pay standard. A florist wants twenty minutes, tomorrow, and is a tenant you can't afford to annoy.

You drag requests onto a weekly calendar grid. The constraints bite immediately:

- **Padding** — protection installation (wall pads, floor masonite) takes 20 minutes on either side of any furniture move. Back-to-back furniture jobs share padding; a food-service job in between forces you to strip and re-hang it.
- **COI gate** — vendors without a current certificate of insurance on file can't be scheduled at all. Chasing one costs you a phone-call action, and the vendor may not deliver it in time.
- **Overtime** — after 6pm and weekends require a building engineer on-site at a cost you pay and a rate you charge. High margin, but engineers have a weekly hour cap and get grumpy.
- **Goodwill** — every tenant has a hidden satisfaction meter. Bumping a tenant twice puts their lease renewal at risk, which is where the real money lives.

At week's end: revenue in, engineer overtime out, goodwill settles, and next week's request stack is generated with pressure scaled to your building's occupancy. **Events** disrupt: an elevator inspection eats a full day, a jammed car takes the shaft offline for six hours mid-week and you must re-solve the board live, a tenant's move-out cascades into a move-in on the same floor.

Run goal: survive a twelve-week quarter, hit an NOI target, and lose zero anchor tenants. Failure is usually a goodwill death spiral, not bankruptcy.

## Technical approach

TypeScript + a canvas/DOM hybrid — the calendar grid is genuinely better as DOM (drag-and-drop, accessibility, text density) with a canvas layer for the animated car position. No engine needed; this is a spreadsheet with a heartbeat.

Data model: `Request {id, tenantId, kind: FURNITURE|FOOD|CONSTRUCTION|DELIVERY, durationMin, earliestStart, latestEnd, flexibility, rate, coiStatus}` and `Booking {requestId, startMin, endMin}` over a week of 7×(6am–10pm) minute-resolution slots. Validation is interval-overlap checking on a sorted interval list plus a rule engine for padding/COI/engineer-hours — every rule is a pure `(schedule, booking) => Violation[]` function, which makes the UI's live red-highlighting trivial and testable.

The interesting algorithmic piece is the **request generator**, which must produce weeks that are *tight but solvable*. Random generation yields either trivial or impossible boards. Approach: generate backwards — construct a valid full schedule first via greedy interval packing with the padding rules applied, then derive requests from it, then perturb (widen some windows, narrow others, add 15% more demand than fits). This guarantees a feasible core exists while forcing the player to drop or renegotiate the surplus. A CP-solver-lite (simple branch-and-bound over interval assignment) runs at generation time to verify a feasible solution exists and to compute a par score for the results screen.

The hard part is making a calendar feel *tense*. Static planning is dry; the tension has to come from mid-week disruption forcing live re-solves against commitments already made, and from goodwill making the optimal-revenue play the wrong play.

## v1 scope

- One elevator, one week, no campaign
- Four request kinds and the padding rule only
- Drag-to-schedule with live conflict highlighting
- End-of-week revenue score against a generated par
- Ten hand-written tenant names with flavor text

## Out of scope

- Multiple elevators or multiple buildings
- The twelve-week campaign and lease-renewal metagame
- Any 3D or animated elevator interior
- Negotiation dialogue with tenants
- Mobile layout

## Risks & unknowns

- This may simply not be fun — "drag rectangles onto a calendar" is one bad difficulty curve away from being homework. The disruption events are load-bearing and need to land in the first playable build, not v2.
- Generator tuning is the whole game; if boards are consistently 10% over-subscribed the game is samey, if variance is high it feels unfair.
- Theme is niche enough that it's either delightfully specific or alienating; leans on writing quality for the tenant flavor.

## Done means

A playable week where an over-subscribed request stack cannot be fully scheduled, the padding rule provably forces a choice between two profitable bookings, a mid-week shaft-closure event invalidates at least one existing booking and requires a re-solve, and the end screen reports the player's revenue against the generator's known-feasible par.
